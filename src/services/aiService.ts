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

  async chatCompletion(
    modelId: string,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<ChatResponse> {
    const { temperature = 0.7, maxTokens = 4000, systemPrompt } = options;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: modelId,
        temperature,
        behavior: systemPrompt,
        mode: 'normal'
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content,
      model: data.model,
    };
  }

  async generateImage(prompt: string, options: {
    size?: string;
    quality?: string;
    style?: string;
  } = {}): Promise<{ url: string; model: string }> {
    const { size = '1024x1024', quality = 'standard', style = 'natural' } = options;

    const response = await fetch(`${this.baseUrl}/api/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size,
        quality,
        style,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      url: data.url,
      model: data.model,
    };
  }

  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; model: string }> {
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

    const response = await fetch(`${this.baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        maxResults,
        includeDomains,
        excludeDomains,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results,
      model: data.model,
    };
  }

  async getAutoSelectedModel(
    query: string,
    mode: 'normal' | 'think' | 'search'
  ): Promise<string> {
    // Auto selection is handled by the backend
    return 'auto';
  }
}

export const aiService = new AIService();