from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EGO AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
A4F_API_KEY = os.getenv("A4F_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# API URLs
OPENROUTER_URL = "https://openrouter.ai/api/v1"
A4F_URL = "https://api.a4f.dev/v1"
GROQ_URL = "https://api.groq.com/openai/v1"
TAVILY_URL = "https://api.tavily.com"

# Models configuration
AI_MODELS = {
    # Free Models (OpenRouter)
    "deepseek-r1-free": {
        "name": "DeepSeek R1",
        "provider": "openrouter",
        "model_id": "deepseek/deepseek-r1-0528:free",
        "type": "thinking",
        "category": "free"
    },
    "qwen-3-235b-free": {
        "name": "Qwen 3 235B",
        "provider": "openrouter",
        "model_id": "qwen/qwen3-235b-a22b:free",
        "type": "chat",
        "category": "free"
    },
    "llama-4-scout-free": {
        "name": "Llama 4 Scout",
        "provider": "openrouter",
        "model_id": "meta-llama/llama-4-scout:free",
        "type": "chat",
        "category": "free"
    },
    "gemini-2-5-pro-free": {
        "name": "Gemini 2.5 Pro",
        "provider": "openrouter",
        "model_id": "google/gemini-2.5-pro-exp-03-25",
        "type": "chat",
        "category": "free"
    },
    "llama-3-1-405b-free": {
        "name": "Llama 3.1 405B",
        "provider": "openrouter",
        "model_id": "meta-llama/llama-3.1-405b-instruct:free",
        "type": "chat",
        "category": "free"
    },
    "gemma-3-27b-free": {
        "name": "Gemma 3 27B",
        "provider": "openrouter",
        "model_id": "google/gemma-3-27b-it:free",
        "type": "chat",
        "category": "free"
    },
    
    # Premium Models (A4F)
    "imagen-4-premium": {
        "name": "Imagen 4",
        "provider": "a4f",
        "model_id": "provider-4/imagen-4",
        "type": "image",
        "category": "premium"
    },
    "grok-4-premium": {
        "name": "Grok 4",
        "provider": "a4f",
        "model_id": "provider-3/grok-4-0709",
        "type": "chat",
        "category": "premium"
    },
    "gpt-4-1-premium": {
        "name": "GPT-4.1",
        "provider": "a4f",
        "model_id": "provider-6/gpt-4.1",
        "type": "chat",
        "category": "premium"
    },
    "o3-pro-premium": {
        "name": "O3 Pro",
        "provider": "a4f",
        "model_id": "provider-6/o3-pro",
        "type": "chat",
        "category": "premium"
    },
    "qwen-3-235b-premium": {
        "name": "Qwen 3 235B Pro",
        "provider": "a4f",
        "model_id": "provider-2/qwen-3-235b",
        "type": "chat",
        "category": "premium"
    },
    "deepseek-r1-premium": {
        "name": "DeepSeek R1 Pro",
        "provider": "a4f",
        "model_id": "provider-1/deepseek-r1-0528",
        "type": "thinking",
        "category": "premium"
    },
    
    # Specialized Models
    "whisper-transcription": {
        "name": "Whisper Large V3",
        "provider": "groq",
        "model_id": "distil-whisper-large-v3-en",
        "type": "transcription",
        "category": "free"
    },
    "tavily-search": {
        "name": "Tavily Search",
        "provider": "tavily",
        "model_id": "tavily-search-v1",
        "type": "search",
        "category": "free"
    }
}

# Request models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str
    temperature: Optional[float] = 0.7
    behavior: Optional[str] = ""
    mode: Optional[str] = "normal"

class ImageRequest(BaseModel):
    prompt: str
    size: Optional[str] = "1024x1024"
    quality: Optional[str] = "standard"
    style: Optional[str] = "natural"

class SearchRequest(BaseModel):
    query: str
    maxResults: Optional[int] = 10
    includeDomains: Optional[List[str]] = None
    excludeDomains: Optional[List[str]] = None

# Helper functions
async def call_openrouter(model_id: str, messages: List[Dict], temperature: float):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ego-ai.com",
        "X-Title": "EGO AI Assistant"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": msg["role"], "content": msg["content"]} for msg in messages],
        "temperature": temperature,
        "max_tokens": 4000
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{OPENROUTER_URL}/chat/completions", 
                                   headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_a4f(model_id: str, messages: List[Dict], temperature: float):
    headers = {
        "Authorization": f"Bearer {A4F_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": msg["role"], "content": msg["content"]} for msg in messages],
        "temperature": temperature,
        "max_tokens": 4000
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{A4F_URL}/chat/completions", 
                                   headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_groq(model_id: str, messages: List[Dict], temperature: float):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": msg["role"], "content": msg["content"]} for msg in messages],
        "temperature": temperature,
        "max_tokens": 4000
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{GROQ_URL}/chat/completions", 
                                   headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

def get_auto_selected_model(query: str, mode: str) -> str:
    """Auto-select the best model based on query content and mode"""
    query_lower = query.lower()
    
    if mode == "search":
        return "tavily-search"
    
    if mode == "think":
        if any(word in query_lower for word in ["analyze", "reason", "solve", "explain", "complex"]):
            return "deepseek-r1-free"
    
    if any(word in query_lower for word in ["image", "picture", "draw", "generate", "create visual"]):
        return "imagen-4-premium"
    
    if any(word in query_lower for word in ["code", "program", "function", "debug", "programming"]):
        return "llama-3-1-405b-free"
    
    if any(word in query_lower for word in ["creative", "story", "poem", "write", "creative writing"]):
        return "qwen-3-235b-free"
    
    return "gemini-2-5-pro-free"

# API Routes
@app.post("/chat")
async def chat_completion(request: ChatRequest):
    try:
        model_key = request.model
        if model_key == "auto":
            model_key = get_auto_selected_model(request.messages[-1].content, request.mode)
        
        if model_key not in AI_MODELS:
            raise HTTPException(status_code=400, detail="Invalid model")
        
        model_config = AI_MODELS[model_key]
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Add system prompt if behavior is specified
        if request.behavior:
            messages.insert(0, {"role": "system", "content": request.behavior})
        
        # Call appropriate API based on provider
        if model_config["provider"] == "openrouter":
            content = await call_openrouter(model_config["model_id"], messages, request.temperature)
        elif model_config["provider"] == "a4f":
            content = await call_a4f(model_config["model_id"], messages, request.temperature)
        elif model_config["provider"] == "groq":
            content = await call_groq(model_config["model_id"], messages, request.temperature)
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
        
        return {
            "content": content,
            "model": model_config["name"],
            "provider": model_config["provider"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image")
async def generate_image(request: ImageRequest):
    try:
        headers = {
            "Authorization": f"Bearer {A4F_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "provider-4/imagen-4",
            "prompt": request.prompt,
            "size": request.size,
            "quality": request.quality,
            "style": request.style,
            "n": 1
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{A4F_URL}/images/generations", 
                                       headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
        return {
            "url": data["data"][0]["url"],
            "model": "Imagen 4"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        
        files = {
            "file": (file.filename, await file.read(), file.content_type),
            "model": (None, "distil-whisper-large-v3-en"),
            "language": (None, "en")
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{GROQ_URL}/audio/transcriptions", 
                                       headers=headers, files=files)
            response.raise_for_status()
            data = response.json()
            
        return {
            "text": data["text"],
            "model": "Whisper Large V3"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_web(request: SearchRequest):
    try:
        headers = {
            "Authorization": f"Bearer {TAVILY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "query": request.query,
            "max_results": request.maxResults,
            "include_domains": request.includeDomains,
            "exclude_domains": request.excludeDomains,
            "include_answer": True,
            "include_raw_content": False
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{TAVILY_URL}/search", 
                                       headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
        return {
            "results": data["results"],
            "model": "Tavily Search"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def get_models():
    return {"models": AI_MODELS}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "EGO AI Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)