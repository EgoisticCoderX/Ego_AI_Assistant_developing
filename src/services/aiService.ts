import { getModelById } from '../utils/aiModels';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to AI service. Please check if the backend is running on port 3001.');
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
    } = {}
  ): Promise<ChatResponse> {
    const { temperature = 0.7, maxTokens = 4000, systemPrompt, mode = 'normal' } = options;

    try {
      const data = await this.makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          model: modelId,
          temperature,
          behavior: systemPrompt,
          mode
        }),
      });

      return {
        content: data.content,
        model: data.model || modelId,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async generateImage(prompt: string, options: {
    size?: string;
    quality?: string;
    style?: string;
  } = {}): Promise<{ url: string; model: string }> {
    const { size = '1024x1024', quality = 'standard', style = 'natural' } = options;

    try {
      const data = await this.makeRequest('/api/image', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          size,
          quality,
          style,
        }),
      });

      return {
        url: data.url,
        model: data.model,
      };
    } catch (error) {
      console.error('Image Generation Error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; model: string }> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await fetch(`${this.baseUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        model: data.model,
      };
    } catch (error) {
      console.error('Transcription Error:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }

  async searchWeb(query: string, options: {
    maxResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {}): Promise<{
    results: Array<{
      title: string;
      url: string;
      content: string;
      score: number;
    }>;
    model: string;
  }> {
    const { maxResults = 10, includeDomains, excludeDomains } = options;

    try {
      const data = await this.makeRequest('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          maxResults,
          includeDomains,
          excludeDomains,
        }),
      });

      return {
        results: data.results,
        model: data.model,
      };
    } catch (error) {
      console.error('Web Search Error:', error);
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
    
    if (queryLower.includes('image') || queryLower.includes('picture') || queryLower.includes('draw')) {
      return 'imagen-4-premium';
    }
    
    if (queryLower.includes('code') || queryLower.includes('program') || queryLower.includes('function')) {
      return 'llama-3-1-405b-free';
    }
    
    return 'gemini-2-5-pro-free';
  }
}

export const aiService = new AIService();