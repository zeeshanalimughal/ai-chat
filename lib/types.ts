export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  images?: string[];
  files?: FileAttachment[];
  timestamp: number;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
  extractedText?: string; // For PDFs and other documents
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: AIProvider;
  createdAt: number;
  updatedAt: number;
}

export type AIProvider = 'openai' | 'google';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  supportsVision: boolean;
  supportsStreaming: boolean;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models (Free Tier via API with credits)
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
    provider: 'openai',
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo (OpenAI)',
    provider: 'openai',
    supportsVision: false,
    supportsStreaming: true,
  },
  // Google Gemini Models (Generous Free Tier)
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    provider: 'google',
    supportsVision: true,
    supportsStreaming: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    supportsVision: true,
    supportsStreaming: true,
  },
];
