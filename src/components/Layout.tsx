import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Settings, User, MessageSquare, Moon, Sun, ChevronLeft, ChevronRight, Crown, LogOut } from 'lucide-react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ChatInterface from './ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, subscription, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isActiveSubscription = subscription && 
    ['active', 'trialing'].includes(subscription.subscription_status);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-all duration-500">
      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out border-r border-gray-200/50 dark:border-gray-700/50 ${
        leftSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      } lg:translate-x-0 lg:opacity-100 lg:static lg:inset-0 ${
        leftSidebarCollapsed ? 'lg:w-16' : 'lg:w-80'
      } w-80`}>
        <LeftSidebar 
          onClose={() => setLeftSidebarOpen(false)} 
          collapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center justify-between transition-all duration-300 animate-fadeInDown">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 animate-slideInLeft">
              <div className="relative">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-float" />
                <div className="absolute inset-0 w-6 h-6 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
              </div>
              <h1 className="text-xl font-bold gradient-text">EGO</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 animate-slideInRight">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            
            <button
              onClick={() => setRightSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{user.email}</span>
                  {isActiveSubscription && (
                    <Crown className="w-4 h-4 text-purple-600 animate-float" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scaleIn">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isActiveSubscription ? 'Premium Member' : 'Free Plan'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/subscription');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Subscription</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Chat Interface */}
        <ChatInterface />
      </div>

      {/* Right Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out border-l border-gray-200/50 dark:border-gray-700/50 ${
        rightSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } lg:translate-x-0 lg:opacity-100 lg:static lg:inset-0 ${
        rightSidebarCollapsed ? 'lg:w-16' : 'lg:w-80'
      } w-80`}>
        <RightSidebar 
          onClose={() => setRightSidebarOpen(false)}
          collapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />
      </div>

      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-fadeInUp"
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Layout;