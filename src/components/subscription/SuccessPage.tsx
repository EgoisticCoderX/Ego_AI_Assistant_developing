import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="mb-8 animate-scaleIn">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-6 h-6 text-purple-600 animate-float" />
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Premium!</h1>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50 animate-fadeInUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎉 Subscription Activated Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your premium subscription has been activated. You now have access to all premium AI models and unlimited requests.
          </p>

          {/* Premium Features */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-purple-700 mb-2">What's included:</h3>
            <ul className="text-sm text-purple-600 space-y-1 text-left">
              <li>✨ Access to GPT-4, Claude 3 Opus, and other premium models</li>
              <li>🚀 Unlimited premium queries</li>
              <li>⚡ Priority support and faster responses</li>
              <li>🎨 Advanced image generation capabilities</li>
              <li>🔔 Early access to new features</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium flex items-center justify-center space-x-2"
            >
              <span>Start Using Premium Features</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/subscription')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
            >
              View Subscription Details
            </button>
          </div>

          {/* Auto-redirect Notice */}
          <p className="text-xs text-gray-500 mt-4">
            You'll be automatically redirected to the main app in 10 seconds
          </p>
        </div>

        {/* Confetti Effect */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;