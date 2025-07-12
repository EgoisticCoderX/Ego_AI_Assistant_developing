import React from 'react';
import { MessageSquare, Brain, Search, Zap, Star, Sparkles } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const quotes = [
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker"
    },
    {
      text: "Intelligence is the ability to adapt to change.",
      author: "Stephen Hawking"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Think Mode",
      description: "Deep analysis and step-by-step reasoning for complex problems",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Search,
      title: "Web Search",
      description: "Real-time information from the web with Tavily integration",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Zap,
      title: "Auto Selection",
      description: "Automatically chooses the best model for your specific query",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Sparkles,
      title: "Image Generation",
      description: "Create stunning images from text descriptions",
      color: "bg-pink-100 text-pink-600"
    }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-fadeInUp">
      <div className="text-center max-w-3xl mx-auto">
        {/* Logo and Title */}
        <div className="mb-6 animate-scaleIn">
          <div className="flex items-center justify-center space-x-3 mb-4 animate-slideInDown">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text animate-slideInDown" style={{ animationDelay: '0.2s' }}>EGO</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>Your Advanced AI Assistant</p>
          <p className="text-gray-500 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>Powered by multiple AI models for the best possible responses</p>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg border border-gray-200/50 hover-lift animate-scaleIn" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-center mb-4 animate-scaleIn" style={{ animationDelay: '0.6s' }}>
            <Star className="w-5 h-5 text-yellow-500 animate-float" />
          </div>
          <blockquote className="text-base text-gray-700 italic mb-3 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
            "{randomQuote.text}"
          </blockquote>
          <cite className="text-gray-500 font-medium animate-fadeInUp" style={{ animationDelay: '0.8s' }}>— {randomQuote.author}</cite>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title} 
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover-lift animate-scaleIn"
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <div className={`w-8 h-8 ${feature.color} rounded-lg flex items-center justify-center mb-3 animate-float`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 transition-colors duration-200">{feature.title}</h3>
                <p className="text-gray-600 text-sm transition-colors duration-200">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover-lift animate-scaleIn" style={{ animationDelay: '1.5s' }}>
          <h2 className="text-xl font-bold mb-3 animate-fadeInUp" style={{ animationDelay: '1.6s' }}>Ready to get started?</h2>
          <p className="text-blue-100 mb-4 animate-fadeInUp" style={{ animationDelay: '1.7s' }}>
            Ask me anything! I can help with analysis, research, creative writing, coding, and much more.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm animate-fadeInUp" style={{ animationDelay: '1.8s' }}>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all duration-200 hover:scale-105 animate-scaleIn" style={{ animationDelay: '1.9s' }}>
              💡 Generate ideas
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all duration-200 hover:scale-105 animate-scaleIn" style={{ animationDelay: '2s' }}>
              🔍 Research topics
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all duration-200 hover:scale-105 animate-scaleIn" style={{ animationDelay: '2.1s' }}>
              ✍️ Write content
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all duration-200 hover:scale-105 animate-scaleIn" style={{ animationDelay: '2.2s' }}>
              🎨 Create images
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;