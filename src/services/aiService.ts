interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
    provider: string;
    category: string;
  };
  error?: string;
  request_id: string;
  timestamp: string;
  processing_time: number;
  model_used?: string;
  tokens_used?: number;
}

interface SearchResponse {
  success: boolean;
  data?: {
    results: Array<{
      title: string;
      url: string;
      content: string;
      score?: number;
    }>;
    answer: string;
    query: string;
    model: string;
  };
  error?: string;
  request_id: string;
  timestamp: string;
  processing_time: number;
}

class AIService {
  private baseUrl = 'http://localhost:8000';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to AI service. Please ensure the Python backend is running on port 8000.');
      }
      throw error;
    }
  }

  async chatCompletion(
    modelId: string,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      mode?: string;
      userId?: string;
    } = {}
  ): Promise<ChatResponse> {
    const { temperature = 0.7, maxTokens = 4000, systemPrompt, mode = 'normal', userId } = options;

    try {
      const response = await this.makeRequest<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          model: modelId,
          temperature,
          max_tokens: maxTokens,
          behavior: systemPrompt || '',
          mode,
          user_id: userId,
        }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Chat completion failed');
      }

      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async searchWeb(
    query: string,
    options: {
      maxResults?: number;
      includeDomains?: string[];
      excludeDomains?: string[];
    } = {}
  ): Promise<SearchResponse> {
    const { maxResults = 10, includeDomains, excludeDomains } = options;

    try {
      const response = await this.makeRequest<SearchResponse>('/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          max_results: maxResults,
          include_domains: includeDomains,
          exclude_domains: excludeDomains,
        }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Web search failed');
      }

      return response;
    } catch (error) {
      console.error('Search Error:', error);
      throw error;
    }
  }

  async getAutoSelectedModel(
    query: string,
    mode: 'normal' | 'think' | 'search'
  ): Promise<string> {
    // Auto selection logic
    const queryLower = query.toLowerCase();
    
    if (mode === 'search') {
      return 'tavily-search';
    }
    
    if (mode === 'think') {
      return 'deepseek-r1-free';
    }
    
    if (queryLower.includes('code') || queryLower.includes('program') || queryLower.includes('function')) {
      return 'llama-4-scout-free';
    }
    
    if (queryLower.includes('creative') || queryLower.includes('story') || queryLower.includes('poem')) {
      return 'qwen-3-235b-free';
    }
    
    return 'gemini-2-5-pro-free';
  }

  async getModels(): Promise<any> {
    try {
      return await this.makeRequest('/models');
    } catch (error) {
      console.error('Get Models Error:', error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
    try {
      return await this.makeRequest('/stats');
    } catch (error) {
      console.error('Get Stats Error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<any> {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();