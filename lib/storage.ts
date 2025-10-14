import { Chat } from './types';

const STORAGE_KEY = 'ai-chat-history';
const THEME_KEY = 'ai-chat-theme';
const SETTINGS_KEY = 'ai-chat-settings';

export interface AppSettings {
  currentChatId: string | null;
  currentModel: string;
  currentProvider: string;
}

// Chat Storage
export function getChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading chats from storage:', error);
    return [];
  }
}

export function saveChats(chats: Chat[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats to storage:', error);
  }
}

export function getChat(id: string): Chat | null {
  const chats = getChats();
  return chats.find(chat => chat.id === id) || null;
}

export function saveChat(chat: Chat): void {
  const chats = getChats();
  const index = chats.findIndex(c => c.id === chat.id);
  
  if (index >= 0) {
    chats[index] = chat;
  } else {
    chats.unshift(chat);
  }
  
  saveChats(chats);
}

export function deleteChat(id: string): void {
  const chats = getChats();
  const filtered = chats.filter(chat => chat.id !== id);
  saveChats(filtered);
}

export function clearAllChats(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Theme Storage
export function getTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return (theme as 'light' | 'dark' | 'system') || 'system';
  } catch (error) {
    return 'system';
  }
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

// Settings Storage
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return {
      currentChatId: null,
      currentModel: 'gpt-4o-mini',
      currentProvider: 'openai',
    };
  }
  
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        currentChatId: null,
        currentModel: 'gpt-4o-mini',
        currentProvider: 'openai',
      };
    }
    return JSON.parse(data);
  } catch (error) {
    return {
      currentChatId: null,
      currentModel: 'gpt-4o-mini',
      currentProvider: 'openai',
    };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}
