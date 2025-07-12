import React from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Message } from '../contexts/ChatContext';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-3xl ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-xl px-4 py-3 transition-all duration-300 hover:shadow-md ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
            : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 shadow-sm'
        }`}>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          
          {message.mode && message.mode !== 'normal' && (
            <div className="mt-2 flex items-center space-x-2 animate-slideInLeft">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isUser ? 'bg-blue-500/50' : 'bg-gray-100'
              }`}>
                {message.mode} mode
              </span>
              {message.model && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isUser ? 'bg-blue-500/50' : 'bg-gray-100'
                }`}>
                  {message.model}
                </span>
              )}
            </div>
          )}
        </div>
        
        {!isUser && (
          <div className="flex items-center space-x-2 mt-2 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={copyToClipboard}
              className="p-1 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-blue-50"
              title="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-green-600 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-green-50"
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-red-50"
              title="Bad response"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-purple-600 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg hover:bg-purple-50"
              title="Regenerate response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;