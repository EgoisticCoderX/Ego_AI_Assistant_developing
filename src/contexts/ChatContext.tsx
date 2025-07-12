import React, { createContext, useContext, useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  mode?: 'normal' | 'think' | 'search';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createSession: () => void;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const createSession = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const selectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    if (!currentSession) {
      createSession();
    }

    setSessions(prev => prev.map(session => {
      if (session.id === currentSession?.id) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, newMessage],
          updatedAt: new Date(),
          title: session.messages.length === 0 ? 
            messageData.content.slice(0, 50) + '...' : 
            session.title
        };
        setCurrentSession(updatedSession);
        return updatedSession;
      }
      return session;
    }));
  };

  const clearHistory = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSession,
      createSession,
      selectSession,
      deleteSession,
      addMessage,
      clearHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};