import os
import time
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import redis
import json
from functools import wraps
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)

# Cache setup (using Redis if available, otherwise in-memory)
try:
    cache = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    cache.ping()
    CACHE_AVAILABLE = True
    logger.info("Redis cache connected successfully")
except:
    CACHE_AVAILABLE = False
    cache = {}
    logger.warning("Redis not available, using in-memory cache")

# AI Model Configuration
AI_MODELS = {
    # Free Models (OpenRouter)
    "deepseek-r1-free": {
        "name": "DeepSeek R1",
        "provider": "openrouter",
        "model_id": "deepseek/deepseek-r1",
        "type": "thinking",
        "category": "free",
        "max_tokens": 4000,
        "timeout": 30
    },
    "qwen-3-235b-free": {
        "name": "Qwen 3 235B",
        "provider": "openrouter", 
        "model_id": "qwen/qwen-2.5-72b-instruct",
        "type": "chat",
        "category": "free",
        "max_tokens": 4000,
        "timeout": 30
    },
    "llama-4-scout-free": {
        "name": "Llama 3.1 405B",
        "provider": "openrouter",
        "model_id": "meta-llama/llama-3.1-405b-instruct",
        "type": "chat", 
        "category": "free",
        "max_tokens": 4000,
        "timeout": 30
    },
    "gemini-2-5-pro-free": {
        "name": "Gemini Pro",
        "provider": "openrouter",
        "model_id": "google/gemini-pro",
        "type": "chat",
        "category": "free",
        "max_tokens": 4000,
        "timeout": 30
    },
    
    # Premium Models (A4F)
    "gpt-4-1-premium": {
        "name": "GPT-4 Turbo",
        "provider": "a4f",
        "model_id": "gpt-4-turbo-preview",
        "type": "chat",
        "category": "premium",
        "max_tokens": 4000,
        "timeout": 45
    },
    "claude-3-opus-premium": {
        "name": "Claude 3 Opus",
        "provider": "a4f", 
        "model_id": "claude-3-opus-20240229",
        "type": "chat",
        "category": "premium",
        "max_tokens": 4000,
        "timeout": 45
    },
    
    # Specialized Models
    "whisper-transcription": {
        "name": "Whisper Large V3",
        "provider": "groq",
        "model_id": "whisper-large-v3",
        "type": "transcription",
        "category": "free",
        "timeout": 30
    },
    "tavily-search": {
        "name": "Tavily Search",
        "provider": "tavily",
        "model_id": "tavily-search-v1",
        "type": "search",
        "category": "free",
        "timeout": 20
    }
}

# API Configuration
API_CONFIGS = {
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "api_key": os.getenv("OPENROUTER_API_KEY"),
        "headers": {
            "HTTP-Referer": "https://ego-ai.com",
            "X-Title": "EGO AI Assistant"
        }
    },
    "a4f": {
        "base_url": "https://api.a4f.dev/v1", 
        "api_key": os.getenv("A4F_API_KEY"),
        "headers": {}
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key": os.getenv("GROQ_API_KEY"),
        "headers": {}
    },
    "tavily": {
        "base_url": "https://api.tavily.com",
        "api_key": os.getenv("TAVILY_API_KEY"),
        "headers": {}
    }
}

# Request/Response Models
class ChatMessage(BaseModel):
    role: str = Field(..., regex="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1, max_items=50)
    model: str = Field(..., min_length=1)
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(4000, ge=1, le=8000)
    behavior: Optional[str] = Field("", max_length=1000)
    mode: Optional[str] = Field("normal", regex="^(normal|think|search)$")
    user_id: Optional[str] = Field(None)
    
    @validator('model')
    def validate_model(cls, v):
        if v not in AI_MODELS and v != "auto":
            raise ValueError(f"Invalid model: {v}")
        return v

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    max_results: Optional[int] = Field(10, ge=1, le=20)
    include_domains: Optional[List[str]] = Field(None)
    exclude_domains: Optional[List[str]] = Field(None)

class APIResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    request_id: str
    timestamp: str
    processing_time: float
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None

# Cache utilities
def get_cache_key(prefix: str, **kwargs) -> str:
    """Generate cache key from parameters"""
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (list, dict)):
            v = json.dumps(v, sort_keys=True)
        key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)

def cache_get(key: str) -> Optional[Dict]:
    """Get value from cache"""
    try:
        if CACHE_AVAILABLE:
            value = cache.get(key)
            return json.loads(value) if value else None
        else:
            return cache.get(key)
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None

def cache_set(key: str, value: Dict, ttl: int = 3600):
    """Set value in cache with TTL"""
    try:
        if CACHE_AVAILABLE:
            cache.setex(key, ttl, json.dumps(value))
        else:
            cache[key] = value
    except Exception as e:
        logger.error(f"Cache set error: {e}")

# API Client utilities
async def make_api_request(
    provider: str,
    endpoint: str,
    payload: Dict,
    timeout: int = 30
) -> Dict:
    """Make API request to AI provider"""
    config = API_CONFIGS.get(provider)
    if not config or not config["api_key"]:
        raise HTTPException(
            status_code=500,
            detail=f"Provider {provider} not configured or missing API key"
        )
    
    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "Content-Type": "application/json",
        **config["headers"]
    }
    
    url = f"{config['base_url']}/{endpoint.lstrip('/')}"
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="Request timeout")
        except httpx.HTTPStatusError as e:
            error_detail = f"API error: {e.response.status_code}"
            try:
                error_data = e.response.json()
                error_detail += f" - {error_data.get('error', {}).get('message', 'Unknown error')}"
            except:
                pass
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

# AI Service functions
async def call_openrouter(model_id: str, messages: List[Dict], **kwargs) -> Dict:
    """Call OpenRouter API"""
    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": kwargs.get("temperature", 0.7),
        "max_tokens": kwargs.get("max_tokens", 4000)
    }
    
    response = await make_api_request(
        "openrouter", 
        "chat/completions", 
        payload,
        timeout=kwargs.get("timeout", 30)
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "tokens": response.get("usage", {}).get("total_tokens", 0)
    }

async def call_a4f(model_id: str, messages: List[Dict], **kwargs) -> Dict:
    """Call A4F API"""
    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": kwargs.get("temperature", 0.7),
        "max_tokens": kwargs.get("max_tokens", 4000)
    }
    
    response = await make_api_request(
        "a4f",
        "chat/completions",
        payload, 
        timeout=kwargs.get("timeout", 45)
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "tokens": response.get("usage", {}).get("total_tokens", 0)
    }

async def call_groq(model_id: str, messages: List[Dict], **kwargs) -> Dict:
    """Call Groq API"""
    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": kwargs.get("temperature", 0.7),
        "max_tokens": kwargs.get("max_tokens", 4000)
    }
    
    response = await make_api_request(
        "groq",
        "chat/completions", 
        payload,
        timeout=kwargs.get("timeout", 30)
    )
    
    return {
        "content": response["choices"][0]["message"]["content"],
        "tokens": response.get("usage", {}).get("total_tokens", 0)
    }

async def call_tavily_search(query: str, **kwargs) -> Dict:
    """Call Tavily Search API"""
    payload = {
        "query": query,
        "max_results": kwargs.get("max_results", 10),
        "include_answer": True,
        "include_raw_content": False
    }
    
    if kwargs.get("include_domains"):
        payload["include_domains"] = kwargs["include_domains"]
    if kwargs.get("exclude_domains"):
        payload["exclude_domains"] = kwargs["exclude_domains"]
    
    response = await make_api_request(
        "tavily",
        "search",
        payload,
        timeout=kwargs.get("timeout", 20)
    )
    
    return {
        "results": response.get("results", []),
        "answer": response.get("answer", "")
    }

def auto_select_model(query: str, mode: str) -> str:
    """Auto-select the best model based on query and mode"""
    query_lower = query.lower()
    
    if mode == "search":
        return "tavily-search"
    
    if mode == "think":
        return "deepseek-r1-free"
    
    # Keyword-based selection
    if any(word in query_lower for word in ["code", "program", "function", "debug"]):
        return "llama-4-scout-free"
    
    if any(word in query_lower for word in ["creative", "story", "poem", "write"]):
        return "qwen-3-235b-free"
    
    return "gemini-2-5-pro-free"

# FastAPI app setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting EGO AI Service...")
    
    # Validate API keys
    missing_keys = []
    for provider, config in API_CONFIGS.items():
        if not config["api_key"]:
            missing_keys.append(provider.upper())
    
    if missing_keys:
        logger.warning(f"Missing API keys for: {', '.join(missing_keys)}")
    else:
        logger.info("All API keys configured")
    
    yield
    
    logger.info("Shutting down EGO AI Service...")

app = FastAPI(
    title="EGO AI Service",
    description="Advanced AI Assistant Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request tracking
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    request.state.start_time = time.time()
    
    response = await call_next(request)
    
    processing_time = time.time() - request.state.start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Processing-Time"] = str(processing_time)
    
    return response

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EGO AI Service",
        "timestamp": datetime.utcnow().isoformat(),
        "models_available": len(AI_MODELS),
        "cache_available": CACHE_AVAILABLE
    }

@app.get("/models")
async def get_models():
    """Get available AI models"""
    return {
        "models": AI_MODELS,
        "providers": list(API_CONFIGS.keys())
    }

@app.post("/chat", response_model=APIResponse)
@limiter.limit("30/minute")
async def chat_completion(
    request: Request,
    chat_request: ChatRequest,
    background_tasks: BackgroundTasks
):
    """Generate AI chat completion"""
    start_time = time.time()
    request_id = request.state.request_id
    
    try:
        # Auto-select model if needed
        model_key = chat_request.model
        if model_key == "auto":
            model_key = auto_select_model(
                chat_request.messages[-1].content,
                chat_request.mode
            )
        
        if model_key not in AI_MODELS:
            raise HTTPException(status_code=400, detail=f"Invalid model: {model_key}")
        
        model_config = AI_MODELS[model_key]
        
        # Check cache
        cache_key = get_cache_key(
            "chat",
            model=model_key,
            messages=[msg.dict() for msg in chat_request.messages],
            temperature=chat_request.temperature,
            behavior=chat_request.behavior
        )
        
        cached_response = cache_get(cache_key)
        if cached_response:
            logger.info(f"Cache hit for request {request_id}")
            return APIResponse(
                success=True,
                data=cached_response,
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat(),
                processing_time=time.time() - start_time,
                model_used=model_config["name"]
            )
        
        # Prepare messages
        messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
        
        # Add system prompt if behavior is specified
        if chat_request.behavior:
            messages.insert(0, {"role": "system", "content": chat_request.behavior})
        
        # Call appropriate provider
        provider = model_config["provider"]
        model_id = model_config["model_id"]
        
        kwargs = {
            "temperature": chat_request.temperature,
            "max_tokens": min(chat_request.max_tokens, model_config["max_tokens"]),
            "timeout": model_config["timeout"]
        }
        
        if provider == "openrouter":
            result = await call_openrouter(model_id, messages, **kwargs)
        elif provider == "a4f":
            result = await call_a4f(model_id, messages, **kwargs)
        elif provider == "groq":
            result = await call_groq(model_id, messages, **kwargs)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        response_data = {
            "content": result["content"],
            "model": model_config["name"],
            "provider": provider,
            "category": model_config["category"]
        }
        
        # Cache the response
        background_tasks.add_task(cache_set, cache_key, response_data, 3600)
        
        processing_time = time.time() - start_time
        
        return APIResponse(
            success=True,
            data=response_data,
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat(),
            processing_time=processing_time,
            model_used=model_config["name"],
            tokens_used=result.get("tokens", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        return APIResponse(
            success=False,
            error=str(e),
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat(),
            processing_time=time.time() - start_time
        )

@app.post("/search", response_model=APIResponse)
@limiter.limit("20/minute")
async def web_search(
    request: Request,
    search_request: SearchRequest,
    background_tasks: BackgroundTasks
):
    """Perform web search using Tavily"""
    start_time = time.time()
    request_id = request.state.request_id
    
    try:
        # Check cache
        cache_key = get_cache_key(
            "search",
            query=search_request.query,
            max_results=search_request.max_results,
            include_domains=search_request.include_domains,
            exclude_domains=search_request.exclude_domains
        )
        
        cached_response = cache_get(cache_key)
        if cached_response:
            logger.info(f"Search cache hit for request {request_id}")
            return APIResponse(
                success=True,
                data=cached_response,
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat(),
                processing_time=time.time() - start_time,
                model_used="Tavily Search"
            )
        
        # Perform search
        result = await call_tavily_search(
            search_request.query,
            max_results=search_request.max_results,
            include_domains=search_request.include_domains,
            exclude_domains=search_request.exclude_domains,
            timeout=20
        )
        
        response_data = {
            "results": result["results"],
            "answer": result.get("answer", ""),
            "query": search_request.query,
            "model": "Tavily Search"
        }
        
        # Cache the response
        background_tasks.add_task(cache_set, cache_key, response_data, 1800)  # 30 min cache
        
        processing_time = time.time() - start_time
        
        return APIResponse(
            success=True,
            data=response_data,
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat(),
            processing_time=processing_time,
            model_used="Tavily Search"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}")
        return APIResponse(
            success=False,
            error=str(e),
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat(),
            processing_time=time.time() - start_time
        )

@app.get("/stats")
@limiter.limit("10/minute")
async def get_stats(request: Request):
    """Get API usage statistics"""
    try:
        stats = {
            "total_models": len(AI_MODELS),
            "free_models": len([m for m in AI_MODELS.values() if m["category"] == "free"]),
            "premium_models": len([m for m in AI_MODELS.values() if m["category"] == "premium"]),
            "providers": list(API_CONFIGS.keys()),
            "cache_enabled": CACHE_AVAILABLE,
            "uptime": "Service running",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return {"success": True, "data": stats}
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "request_id": getattr(request.state, "request_id", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "request_id": getattr(request.state, "request_id", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )