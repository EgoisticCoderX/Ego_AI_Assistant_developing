import React, { useState } from 'react';
import { X, Mail, Lock, User, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isLogin && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slideInDown">
          <h2 className="text-2xl font-bold gradient-text">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Premium Benefits */}
        {!isLogin && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200/50 animate-slideInLeft">
            <div className="flex items-center space-x-2 mb-2 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
              <Crown className="w-5 h-5 text-purple-600 animate-float" />
              <span className="font-semibold text-purple-700">Premium Benefits</span>
            </div>
            <ul className="text-sm text-purple-600 space-y-1 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <li className="animate-slideInLeft" style={{ animationDelay: '0.3s' }}>• Access to GPT-4, Claude 3 Opus, and other premium models</li>
              <li className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>• 7 premium queries per week</li>
              <li className="animate-slideInLeft" style={{ animationDelay: '0.5s' }}>• Priority support and faster responses</li>
              <li className="animate-slideInLeft" style={{ animationDelay: '0.6s' }}>• Advanced image generation capabilities</li>
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="animate-slideInLeft" style={{ animationDelay: '0.5s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="animate-slideInLeft" style={{ animationDelay: '0.6s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium animate-scaleIn disabled:hover:scale-100"
            style={{ animationDelay: '0.7s' }}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl animate-slideInUp" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 animate-slideInLeft" style={{ animationDelay: '0.9s' }}>Demo Accounts</h3>
          <div className="space-y-2 text-sm animate-fadeInUp" style={{ animationDelay: '1s' }}>
            <div className="flex justify-between animate-slideInLeft" style={{ animationDelay: '1.1s' }}>
              <span>Free Account:</span>
              <code className="bg-white px-2 py-1 rounded-lg text-xs shadow-sm">demo@free.com</code>
            </div>
            <div className="flex justify-between animate-slideInLeft" style={{ animationDelay: '1.2s' }}>
              <span>Premium Account:</span>
              <code className="bg-white px-2 py-1 rounded-lg text-xs shadow-sm">demo@premium.com</code>
            </div>
            <p className="text-xs text-gray-500 animate-fadeInUp" style={{ animationDelay: '1.3s' }}>Use any password</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="mt-6 text-center animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;