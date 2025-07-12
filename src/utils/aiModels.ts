export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: 'free' | 'premium';
  description: string;
  bestFor: string[];
  apiEndpoint: string;
  modelId: string;
  type: 'chat' | 'thinking' | 'image' | 'transcription' | 'search';
}

export const AI_MODELS: AIModel[] = [
  // Free Models (OpenRouter)
  {
    id: 'deepseek-r1-free',
    name: 'DeepSeek R1',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Advanced reasoning model with step-by-step thinking',
    bestFor: ['Complex reasoning', 'Mathematical problems', 'Logical analysis', 'Code debugging'],
    apiEndpoint: 'openrouter',
    modelId: 'deepseek/deepseek-r1-0528:free',
    type: 'thinking'
  },
  {
    id: 'qwen-3-235b-free',
    name: 'Qwen 3 235B',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Large multilingual model with excellent performance',
    bestFor: ['General conversation', 'Multilingual tasks', 'Creative writing', 'Code generation'],
    apiEndpoint: 'openrouter',
    modelId: 'qwen/qwen3-235b-a22b:free',
    type: 'chat'
  },
  {
    id: 'llama-4-scout-free',
    name: 'Llama 4 Scout',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Latest Llama model with enhanced capabilities',
    bestFor: ['General tasks', 'Code assistance', 'Research', 'Content creation'],
    apiEndpoint: 'openrouter',
    modelId: 'meta-llama/llama-4-scout:free',
    type: 'chat'
  },
  {
    id: 'gemini-2-5-pro-free',
    name: 'Gemini 2.5 Pro',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Google\'s advanced multimodal AI model',
    bestFor: ['Multimodal tasks', 'Analysis', 'Creative projects', 'Technical writing'],
    apiEndpoint: 'openrouter',
    modelId: 'google/gemini-2.5-pro-exp-03-25',
    type: 'chat'
  },
  {
    id: 'llama-3-1-405b-free',
    name: 'Llama 3.1 405B',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Massive parameter model with exceptional performance',
    bestFor: ['Complex tasks', 'Research', 'Advanced reasoning', 'Professional writing'],
    apiEndpoint: 'openrouter',
    modelId: 'meta-llama/llama-3.1-405b-instruct:free',
    type: 'chat'
  },
  {
    id: 'gemma-3-27b-free',
    name: 'Gemma 3 27B',
    provider: 'OpenRouter',
    category: 'free',
    description: 'Efficient model optimized for instruction following',
    bestFor: ['Quick responses', 'Simple tasks', 'Educational content', 'Casual conversation'],
    apiEndpoint: 'openrouter',
    modelId: 'google/gemma-3-27b-it:free',
    type: 'chat'
  },

  // Premium Models (A4F)
  {
    id: 'imagen-4-premium',
    name: 'Imagen 4',
    provider: 'A4F',
    category: 'premium',
    description: 'State-of-the-art image generation model',
    bestFor: ['Image creation', 'Art generation', 'Visual content', 'Design concepts'],
    apiEndpoint: 'a4f',
    modelId: 'provider-4/imagen-4',
    type: 'image'
  },
  {
    id: 'grok-4-premium',
    name: 'Grok 4',
    provider: 'A4F',
    category: 'premium',
    description: 'Advanced conversational AI with real-time knowledge',
    bestFor: ['Current events', 'Witty responses', 'Social media content', 'Trending topics'],
    apiEndpoint: 'a4f',
    modelId: 'provider-3/grok-4-0709',
    type: 'chat'
  },
  {
    id: 'gpt-4-1-premium',
    name: 'GPT-4.1',
    provider: 'A4F',
    category: 'premium',
    description: 'Enhanced version of GPT-4 with improved capabilities',
    bestFor: ['Professional writing', 'Complex analysis', 'Code review', 'Strategic planning'],
    apiEndpoint: 'a4f',
    modelId: 'provider-6/gpt-4.1',
    type: 'chat'
  },
  {
    id: 'o3-pro-premium',
    name: 'O3 Pro',
    provider: 'A4F',
    category: 'premium',
    description: 'Advanced reasoning model with superior problem-solving',
    bestFor: ['Scientific research', 'Mathematical proofs', 'Complex reasoning', 'Academic writing'],
    apiEndpoint: 'a4f',
    modelId: 'provider-6/o3-pro',
    type: 'chat'
  },
  {
    id: 'qwen-3-235b-premium',
    name: 'Qwen 3 235B Pro',
    provider: 'A4F',
    category: 'premium',
    description: 'Premium version with enhanced performance and speed',
    bestFor: ['Enterprise tasks', 'Large-scale analysis', 'Professional content', 'Technical documentation'],
    apiEndpoint: 'a4f',
    modelId: 'provider-2/qwen-3-235b',
    type: 'chat'
  },
  {
    id: 'deepseek-r1-premium',
    name: 'DeepSeek R1 Pro',
    provider: 'A4F',
    category: 'premium',
    description: 'Premium thinking model with advanced reasoning capabilities',
    bestFor: ['Complex problem solving', 'Research analysis', 'Strategic thinking', 'Academic research'],
    apiEndpoint: 'a4f',
    modelId: 'provider-1/deepseek-r1-0528',
    type: 'thinking'
  },

  // Specialized Models
  {
    id: 'whisper-transcription',
    name: 'Whisper Large V3',
    provider: 'Groq',
    category: 'free',
    description: 'High-quality speech-to-text transcription',
    bestFor: ['Audio transcription', 'Voice notes', 'Meeting recordings', 'Podcast transcripts'],
    apiEndpoint: 'groq',
    modelId: 'distil-whisper-large-v3-en',
    type: 'transcription'
  },
  {
    id: 'tavily-search',
    name: 'Tavily Search',
    provider: 'Tavily',
    category: 'free',
    description: 'Real-time web search and information retrieval',
    bestFor: ['Current information', 'Research', 'Fact checking', 'News updates'],
    apiEndpoint: 'tavily',
    modelId: 'tavily-search-v1',
    type: 'search'
  }
];

export const getModelsByCategory = (category: 'free' | 'premium') => {
  return AI_MODELS.filter(model => model.category === category);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByType = (type: string) => {
  return AI_MODELS.filter(model => model.type === type);
};