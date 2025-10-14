'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIModel, AI_MODELS } from '@/lib/types';

interface ModelContextType {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<AIModel>(AI_MODELS[2]); // Default to Gemini 2.0 Flash

  // Load model from localStorage on mount
  useEffect(() => {
    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
      const model = AI_MODELS.find(m => m.id === savedModelId);
      if (model) {
        setSelectedModelState(model);
      }
    }
  }, []);

  // Save model to localStorage when it changes
  const setSelectedModel = (model: AIModel) => {
    setSelectedModelState(model);
    localStorage.setItem('selectedModelId', model.id);
    console.log('Model changed to:', model.name, model.id);
  };

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
