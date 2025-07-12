import React from 'react';
import { X, Thermometer, Brain, Zap, ChevronLeft, ChevronRight, Info, MessageSquare, Search, Image, Mic, Crown } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { AI_MODELS, getModelsByCategory } from '../utils/aiModels';

interface RightSidebarProps {
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onClose, collapsed, onToggleCollapse }) => {
  const { temperature, setTemperature, behavior, setBehavior, selectedModel, setSelectedModel } = useSettings();
  const { user, subscription } = useAuth();

  const isActiveSubscription = subscription && 
    ['active', 'trialing'].includes(subscription.subscription_status);

  // Function to get icon based on model type
  const getModelIcon = (type: string) => {
    switch (type) {
      case 'thinking':
        return Brain;
      case 'search':
        return Search;
      case 'image':
        return Image;
      case 'transcription':
        return Mic;
      default:
        return MessageSquare;
    }
  };

  const allModels = [
    { id: 'auto', name: 'Auto Select', description: 'Automatically choose the best model', category: 'free', bestFor: ['Optimal performance', 'Smart selection'], icon: Zap },
    ...AI_MODELS.filter(model => model.type === 'chat' || model.type === 'thinking').map(model => ({
      ...model,
      icon: getModelIcon(model.type)
    }))
  ];

  const behaviorPresets = [
    { name: 'Professional', value: 'You are a professional assistant. Provide formal, well-structured responses.' },
    { name: 'Creative', value: 'You are a creative assistant. Be imaginative and think outside the box.' },
    { name: 'Analytical', value: 'You are an analytical assistant. Provide detailed, logical explanations.' },
    { name: 'Casual', value: 'You are a casual, friendly assistant. Keep responses conversational and approachable.' },
    { name: 'Technical', value: 'You are a technical expert. Provide precise, detailed technical information.' }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 animate-fadeInDown">
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white animate-slideInRight">Settings</h2>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 animate-slideInLeft"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          <button
            onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 animate-slideInLeft"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-fadeInUp">
        {collapsed ? (
          <div className="flex flex-col items-center space-y-4">
            <Thermometer className="w-6 h-6 text-blue-500 animate-float" title="Temperature Control" />
            <Brain className="w-6 h-6 text-purple-500 animate-float" title="AI Behavior" />
            <Zap className="w-6 h-6 text-green-500 animate-float" title="Model Selection" />
          </div>
        ) : (
          <>
        {/* Model Selection */}
        <div className="animate-scaleIn">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 animate-slideInRight">Model Selection</h3>
          <div className="space-y-2">
              {allModels.map((model, index) => {
              const Icon = model.icon;
                const isDisabled = model.category === 'premium' && !isActiveSubscription;
              
              return (
                <div
                  key={model.id}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift animate-slideInRight ${
                    selectedModel === model.id
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-md animate-glow'
                      : isDisabled
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                  }`}
                  onClick={() => !isDisabled && setSelectedModel(model.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-colors duration-200 group-hover:text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{model.name}</span>
                          {model.category === 'premium' && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-glow hover:scale-105 transition-transform duration-200">
                            Premium
                          </span>
                        )}
                        <button
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          title={`Best for: ${model.bestFor?.join(', ') || 'General use'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{model.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Temperature Control */}
        <div className="animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2 animate-slideInRight">
            <Thermometer className="w-4 h-4" />
            <span>Temperature: {temperature}</span>
          </h3>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider transition-all duration-200 hover:scale-105"
            />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        {/* Behavior Customization */}
        <div className="animate-scaleIn" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 animate-slideInRight">AI Behavior</h3>
          
          {/* Behavior Presets */}
          <div className="mb-3">
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block animate-slideInRight">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {behaviorPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => setBehavior(preset.value)}
                    className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-scaleIn"
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Behavior */}
          <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block animate-slideInRight">Custom Instructions</label>
            <textarea
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              placeholder="Describe how you want EGO to behave and respond..."
                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 animate-scaleIn"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
        </div>

        {/* Subscription Status */}
        {user && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50 p-4 rounded-xl shadow-sm animate-scaleIn" style={{ animationDelay: '0.7s' }}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 animate-slideInRight">Subscription Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm animate-slideInRight" style={{ animationDelay: '0.8s' }}>
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className={`font-medium flex items-center space-x-1 ${isActiveSubscription ? 'text-purple-600' : 'text-green-600'}`}>
                    {isActiveSubscription && <Crown className="w-4 h-4" />}
                    <span>{isActiveSubscription ? 'Premium' : 'Free'}</span>
                </span>
              </div>
                {isActiveSubscription && subscription && (
                  <>
                    <div className="flex justify-between text-sm animate-slideInRight" style={{ animationDelay: '0.9s' }}>
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-medium text-green-600 capitalize">
                        {subscription.subscription_status.replace('_', ' ')}
                      </span>
                    </div>
                    {subscription.current_period_end && (
                      <div className="flex justify-between text-sm animate-slideInRight" style={{ animationDelay: '1s' }}>
                        <span className="text-gray-600 dark:text-gray-400">Renews:</span>
                        <span className="font-medium">
                          {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              <div className="flex justify-between text-sm animate-slideInRight" style={{ animationDelay: '1.1s' }}>
                  <span className="text-gray-600 dark:text-gray-400">Free Models:</span>
                <span className="font-medium text-green-600">Unlimited</span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;