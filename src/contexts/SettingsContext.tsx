import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  temperature: number;
  setTemperature: (temp: number) => void;
  behavior: string;
  setBehavior: (behavior: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  mode: 'normal' | 'think' | 'search';
  setMode: (mode: 'normal' | 'think' | 'search') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [temperature, setTemperature] = useState(0.7);
  const [behavior, setBehavior] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [mode, setMode] = useState<'normal' | 'think' | 'search'>('normal');

  return (
    <SettingsContext.Provider value={{
      temperature,
      setTemperature,
      behavior,
      setBehavior,
      selectedModel,
      setSelectedModel,
      mode,
      setMode
    }}>
      {children}
    </SettingsContext.Provider>
  );
};