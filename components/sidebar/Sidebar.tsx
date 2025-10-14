'use client';

import { Chat, AIModel, AI_MODELS } from '@/lib/types';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import ChatItem from './ChatItem';

interface SidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (id: string) => void;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export default function Sidebar({
  chats,
  currentChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  selectedModel,
  onModelChange,
}: SidebarProps) {
  // Group models by provider for dropdown
  const modelOptions = AI_MODELS.map(model => ({
    value: model.id,
    label: model.name,
    group: model.provider === 'openai' ? 'OpenAI' : 'Google Gemini',
  }));

  const handleModelChange = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model) {
      onModelChange(model);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-b from-card to-muted/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            AI Chat
          </h1>
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all"
          size="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Model Selector */}
      <div className="p-4 border-b border-border">
        <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">
          AI Model
        </label>
        <Dropdown
          options={modelOptions}
          value={selectedModel.id}
          onChange={handleModelChange}
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
        {chats.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8 px-2">
            No chats yet. Start a conversation!
          </div>
        ) : (
          chats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={currentChat?.id === chat.id}
              onSelect={() => onSelectChat(chat)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
