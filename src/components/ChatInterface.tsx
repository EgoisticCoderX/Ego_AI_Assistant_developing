import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Code, Search, Brain } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSession, addMessage, createSession } = useChat();
  const { mode, setMode, selectedModel, temperature, behavior } = useSettings();
  const { user, canUsePremium, incrementUsage } = useAuth();

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if using premium model
      const isPremiumModel = selectedModel !== 'auto' && ['gpt-4', 'claude-3-opus', 'gemini-pro'].includes(selectedModel);
      
      if (isPremiumModel && user?.isPremium) {
        incrementUsage();
      }

      // Generate response based on mode
      let response = '';
      switch (mode) {
        case 'think':
          response = `🤔 **Thinking Mode Active**\n\nLet me analyze this step by step:\n\n1. **Understanding the question**: ${userMessage}\n2. **Considering multiple perspectives**\n3. **Analyzing potential solutions**\n\nBased on my analysis, here's my thoughtful response: This is a simulated response that would normally come from the AI model. The actual implementation would integrate with Groq, OpenRouter, A4F, and other APIs you specified.`;
          break;
        case 'search':
          response = `🔍 **Web Search Mode Active**\n\nSearching the web for: "${userMessage}"\n\n**Found relevant information:**\n- This is a simulated search response\n- Would normally integrate with Tavily API\n- Real-time web information would be displayed here\n\n**Summary**: Based on current web search results, here's what I found... (This would be the actual Tavily API response)`;
          break;
        default:
          response = `This is a simulated response from EGO. In the actual implementation, this would be the response from your selected AI model (${selectedModel}) via the appropriate API (Groq, OpenRouter, A4F, etc.).\n\nSettings applied:\n- Temperature: ${temperature}\n- Model: ${selectedModel}\n- Behavior: ${behavior || 'Default'}\n- Mode: ${mode}`;
      }

      addMessage({
        role: 'assistant',
        content: response,
        model: selectedModel,
        mode
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        model: selectedModel,
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
    <div className="flex flex-col h-full">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
              <WelcomeScreen />
            </div>
          </div>
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
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 p-4 transition-colors duration-300">
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
          {user?.isPremium && user.weeklyUsage >= 6 && (
            <div className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400 animate-pulse animate-fadeInUp">
              ⚠️ You have {7 - user.weeklyUsage} premium queries remaining this week
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;