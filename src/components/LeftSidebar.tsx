import React from 'react';
import { X, Plus, MessageSquare, Trash2, Crown, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { AI_MODELS, getModelsByCategory } from '../utils/aiModels';

interface LeftSidebarProps {
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onClose, collapsed, onToggleCollapse }) => {
  const { sessions, currentSession, createSession, selectSession, deleteSession, clearHistory } = useChat();
  const { user } = useAuth();

  const premiumModels = getModelsByCategory('premium');
  const freeModels = getModelsByCategory('free');

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 animate-fadeInDown">
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white animate-slideInLeft">Chat History</h2>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 animate-slideInRight"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          <button
            onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 animate-slideInRight"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>
        {!collapsed && (
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium animate-scaleIn"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        )}
        {collapsed && (
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-scaleIn"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-4 animate-fadeInUp">
        {collapsed ? (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, index) => (
              <div
                key={session.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover-lift ${
                  currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-2 border-blue-200 dark:border-blue-700 shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                }`}
                onClick={() => selectSession(session.id)}
                title={session.title}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto transition-colors duration-200 group-hover:text-blue-600" />
              </div>
            ))}
          </div>
        ) : (
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover-lift ${
                currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-2 border-blue-200 dark:border-blue-700 shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
              }`}
              onClick={() => selectSession(session.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
                <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-colors duration-200 group-hover:text-blue-600" />
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">
                  {session.title}
                </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  {session.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-fadeInUp">
            {!collapsed && (
              <>
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-float" />
            <p>No chat history yet</p>
            <p className="text-sm">Start a conversation to begin</p>
              </>
            )}
            {collapsed && <MessageSquare className="w-6 h-6 mx-auto text-gray-300 animate-float" />}
          </div>
        )}
      </div>

      {/* Models Section */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-gradient-to-t from-gray-50/50 dark:from-gray-900/50 to-transparent animate-fadeInUp">
        {!collapsed && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 animate-slideInLeft">Available Models</h3>
        
        {/* Premium Models */}
        {user?.isPremium && (
          <div className="mb-4 animate-scaleIn">
            <div className="flex items-center space-x-2 mb-2 animate-slideInLeft">
              <Crown className="w-4 h-4 text-yellow-500 animate-float" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium Models</span>
            </div>
            <div className="space-y-1">
                {premiumModels.slice(0, 3).map((model, index) => (
                  <div 
                    key={model.id} 
                    className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pl-6 transition-colors duration-200 hover:text-gray-800 dark:hover:text-gray-200 animate-slideInLeft group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <span>{model.name} <span className="text-gray-400 dark:text-gray-500">({model.provider})</span></span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      title={`Best for: ${model.bestFor.join(', ')}`}
                    >
                      <Info className="w-3 h-3" />
                    </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Models */}
        <div className="animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block animate-slideInLeft">Free Models</span>
          <div className="space-y-1">
              {freeModels.slice(0, 4).map((model, index) => (
                <div 
                  key={model.id} 
                  className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-800 dark:hover:text-gray-200 animate-slideInLeft group"
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                  <span>{model.name} <span className="text-gray-400 dark:text-gray-500">({model.provider})</span></span>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    title={`Best for: ${model.bestFor.join(', ')}`}
                  >
                    <Info className="w-3 h-3" />
                  </button>
              </div>
            ))}
          </div>
        </div>

        {/* Clear History */}
        <button
          onClick={clearHistory}
            className="mt-4 w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 active:scale-95 animate-fadeInUp"
          style={{ animationDelay: '0.5s' }}
        >
          Clear All History
        </button>
          </>
        )}
        {collapsed && (
          <div className="flex flex-col items-center space-y-3">
            <Crown className="w-5 h-5 text-yellow-500 animate-float" title="Premium Models Available" />
            <MessageSquare className="w-5 h-5 text-blue-500 animate-float" title="Free Models Available" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;