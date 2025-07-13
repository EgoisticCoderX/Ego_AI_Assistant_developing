import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Code, Search, Brain } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSession, addMessage, createSession } = useChat();
  const { mode, setMode, selectedModel, temperature, behavior } = useSettings();
  const { user, subscription } = useAuth();

  const isActiveSubscription = subscription && 
    ['active', 'trialing'].includes(subscription.subscription_status);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Create session if none exists
    if (!currentSession) {
      createSession();
    }

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      mode
    });

    setIsLoading(true);

    try {
      let actualModel = selectedModel;
      
      // Auto-select model if needed
      if (selectedModel === 'auto') {
        actualModel = await aiService.getAutoSelectedModel(userMessage, mode);
      }

      // Check if user can use premium models
      const modelConfig = await import('../utils/aiModels').then(m => m.getModelById(actualModel));
      if (modelConfig?.category === 'premium' && !isActiveSubscription) {
        throw new Error('Premium subscription required for this model. Please upgrade to continue.');
      }

      let response: string;
      let modelUsed: string;

      if (mode === 'search') {
        const searchResult = await aiService.searchWeb(userMessage);
        response = `🔍 **Web Search Results**\n\n${searchResult.results.map(r => 
          `**${r.title}**\n${r.content}\n[${r.url}](${r.url})\n`
        ).join('\n')}\n\n**Summary**: Based on the search results above, here's what I found relevant to your query.`;
        modelUsed = searchResult.model;
      } else if (actualModel === 'imagen-4-premium') {
        const imageResult = await aiService.generateImage(userMessage);
        response = `🎨 **Image Generated**\n\n![Generated Image](${imageResult.url})\n\nI've created an image based on your description: "${userMessage}"`;
        modelUsed = imageResult.model;
      } else {
        // Regular chat completion
        const messages = currentSession?.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })) || [];
        
        messages.push({ role: 'user', content: userMessage });

        const chatResult = await aiService.chatCompletion(actualModel, messages, {
          temperature,
          systemPrompt: behavior,
          mode
        });
        
        response = chatResult.content;
        modelUsed = chatResult.model;
      }

      addMessage({
        role: 'assistant',
        content: response,
        model: modelUsed,
        mode
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}`,
        model: 'Error',
        mode
      });
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    { id: 'normal', name: 'Normal', icon: Brain, description: 'Standard conversation' },
    { id: 'think', name: 'Think', icon: Brain, description: 'Deep analysis and reasoning' },
    { id: 'search', name: 'Search', icon: Search, description: 'Web search integration' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {!currentSession || currentSession.messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-4xl mx-auto p-4">
            <div className="space-y-4">
              {currentSession.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 animate-fadeInUp">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>EGO is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Mode Selector */}
          <div className="flex items-center justify-center space-x-1 mb-4 animate-fadeInUp">
            <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-600/30 rounded-xl p-1 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1">
                {modes.map((modeOption, index) => {
                  const Icon = modeOption.icon;
                  return (
                    <button
                      key={modeOption.id}
                      onClick={() => setMode(modeOption.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 animate-scaleIn ${
                        mode === modeOption.id
                          ? 'bg-white/90 dark:bg-gray-700/90 text-blue-600 dark:text-blue-400 shadow-md backdrop-blur-sm animate-glow'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-gray-800 dark:hover:text-gray-100'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{modeOption.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-end space-x-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex-1 relative">
              <div className="flex items-center space-x-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-300 hover:shadow-md focus-within:shadow-lg">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask EGO anything... (${mode} mode)`}
                  className="flex-1 bg-transparent resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '20px', maxHeight: '120px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                    title="Generate Image"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/50"
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/50"
                    title="Code Mode"
                  >
                    <Code className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Usage Warning */}
          {isActiveSubscription && (
            <div className="mt-2 text-center text-sm text-green-600 dark:text-green-400 animate-fadeInUp">
              ✨ Premium subscription active - unlimited access to all models
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;