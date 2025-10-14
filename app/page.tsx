'use client';

import { useState, useEffect } from 'react';
import { Chat } from '@/lib/types';
import { getChats, saveChat, deleteChat, getSettings, saveSettings } from '@/lib/storage';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { Menu } from 'lucide-react';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start hidden on mobile
  const [mounted, setMounted] = useState(false);

  // Load chats on mount
  useEffect(() => {
    setMounted(true);
    const loadedChats = getChats();
    setChats(loadedChats);

    const settings = getSettings();
    
    // Load current chat
    if (settings.currentChatId) {
      const chat = loadedChats.find(c => c.id === settings.currentChatId);
      if (chat) {
        setCurrentChat(chat);
      }
    }
  }, []);

  // Save current chat ID when it changes
  useEffect(() => {
    if (mounted && currentChat) {
      const settings = getSettings();
      saveSettings({ ...settings, currentChatId: currentChat.id });
    }
  }, [currentChat, mounted]);

  const handleNewChat = () => {
    // Don't create empty chats - just clear current chat to show welcome screen
    setCurrentChat(null);
    // Close sidebar on mobile
    setSidebarOpen(false);
  };

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat);
    // Close sidebar on mobile when chat is selected
    setSidebarOpen(false);
    // Don't change the selected model - keep the user's current selection
    // The chat will use the currently selected model for new messages
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    
    if (currentChat?.id === id) {
      setCurrentChat(updatedChats[0] || null);
    }
  };

  const handleUpdateChat = (updatedChat: Chat) => {
    saveChat(updatedChat);
    
    // Check if chat exists in the list
    const chatExists = chats.some(c => c.id === updatedChat.id);
    
    if (chatExists) {
      // Update existing chat
      setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
    } else {
      // Add new chat to the beginning of the list
      setChats([updatedChat, ...chats]);
    }
    
    setCurrentChat(updatedChat);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-all hover:shadow-xl"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 sm:w-80 lg:w-64 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface
          chat={currentChat}
          onUpdateChat={handleUpdateChat}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
}
