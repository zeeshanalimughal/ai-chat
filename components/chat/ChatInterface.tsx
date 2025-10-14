"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Chat, Message, FileAttachment } from "@/lib/types";
import { generateId, generateChatTitle } from "@/lib/utils";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useModel } from "@/contexts/ModelContext";

interface ChatInterfaceProps {
  chat: Chat | null;
  onUpdateChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export default function ChatInterface({
  chat,
  onUpdateChat,
  onNewChat,
}: ChatInterfaceProps) {
  const { selectedModel } = useModel();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const pendingFilesRef = useRef<FileAttachment[]>([]);
  const pendingImagesRef = useRef<string[]>([]);

  // Create transport that reads model dynamically
  const transport = useMemo(() => {
    console.log('Creating transport with model:', selectedModel.id, selectedModel.provider);
    
    return new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => {
        // Read current values at call time
        const currentFiles = pendingFilesRef.current;
        const currentImages = pendingImagesRef.current;
        
        console.log('=== PREPARE SEND REQUEST ===');
        console.log('Model being sent:', selectedModel.id);
        console.log('Provider being sent:', selectedModel.provider);
        console.log('currentFiles:', currentFiles);
        console.log('currentFiles length:', currentFiles.length);
        console.log('currentImages:', currentImages);
        console.log('============================');
        
        // Convert UIMessages to the format our API expects
        const formattedMessages = messages.map((msg) => {
          const textParts = msg.parts.filter((p: any) => p.type === "text");
          const content = textParts.map((p: any) => p.text).join("");
          
          // Extract images from message if available
          const imageParts = msg.parts.filter((p: any) => p.type === "image");
          const images = imageParts.length > 0 
            ? imageParts.map((p: any) => p.image) 
            : (msg.role === "user" ? currentImages : undefined);
          
          return {
            role: msg.role,
            content,
            images: images && images.length > 0 ? images : undefined,
          };
        });

        return {
          body: {
            messages: formattedMessages,
            model: selectedModel.id,
            provider: selectedModel.provider,
            files: currentFiles,
          },
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    });
  }, [selectedModel.id, selectedModel.provider]);

  // Use the useChat hook from AI SDK
  const {
    messages: chatMessages,
    sendMessage,
    status,
    error: chatError,
    setMessages,
    stop,
  } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (chatError) {
      setError(chatError.message || "Failed to send message");
    }
  }, [chatError]);

  // Load messages when chat changes
  useEffect(() => {
    if (chat && chat.messages.length > 0) {
      const formattedMessages = chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: [{ type: "text" as const, text: msg.content }],
      }));
      setMessages(formattedMessages);
    } else if (!chat) {
      setMessages([]);
    }
  }, [chat?.id]);

  // Save messages
  useEffect(() => {
    if (chatMessages.length > 0 && !isLoading) {
      const convertedMessages: Message[] = chatMessages.map((msg) => {
        const textParts = msg.parts.filter((p: any) => p.type === "text");
        const content = textParts.map((p: any) => p.text).join("");
        return {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content,
          timestamp: Date.now(),
        };
      });

      const chatId = chat?.id || generateId();
      const updatedChat: Chat = {
        id: chatId,
        title: chat?.title || generateChatTitle(convertedMessages[0]?.content || "New Chat"),
        messages: convertedMessages,
        model: selectedModel.id,
        provider: selectedModel.provider,
        createdAt: chat?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      onUpdateChat(updatedChat);
    }
  }, [chatMessages, isLoading]);

  // Detect if user is near bottom of scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsUserScrolling(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isUserScrolling]);

  const handleSendMessage = async (content: string, images?: string[], files?: FileAttachment[]) => {
    setError(null);
    
    // Reset scroll state when sending a new message
    setIsUserScrolling(false);
    
    // Store images and files in both state and ref
    const imagesToSend = images || [];
    const filesToSend = files || [];
    
    setPendingImages(imagesToSend);
    setPendingFiles(filesToSend);
    pendingImagesRef.current = imagesToSend;
    pendingFilesRef.current = filesToSend;
    
    console.log('handleSendMessage - files:', filesToSend);
    
    // Build message content with file information
    let messageText = content;
    
    if (filesToSend.length > 0) {
      messageText += '\n\n[Attached files:]\n';
      filesToSend.forEach(file => {
        messageText += `- ${file.name} (${file.type})\n`;
      });
    }
    
    await sendMessage({ text: messageText });
    
    // Clear pending data after sending
    setTimeout(() => {
      setPendingImages([]);
      setPendingFiles([]);
      pendingImagesRef.current = [];
      pendingFilesRef.current = [];
    }, 100);
  };

  const examplePrompts = [
    {
      title: "Creative Writing",
      prompt: "Write a short story about a time traveler",
      icon: "✍️",
    },
    {
      title: "Code Helper",
      prompt: "Explain how async/await works in JavaScript",
      icon: "💻",
    },
    {
      title: "Learning",
      prompt: "Teach me about quantum computing in simple terms",
      icon: "🎓",
    },
    {
      title: "Ideas",
      prompt: "Give me 5 creative app ideas for productivity",
      icon: "💡",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20 relative">
      {/* Mobile header with menu button space */}
      <div className="lg:hidden h-16 flex-shrink-0" />
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-thin px-2 sm:px-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="text-center max-w-3xl mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-3">Welcome to ArcChat</h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                Start a conversation with powerful AI models
              </p>
            </div>
            
            {/* Example Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl w-full px-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(example.prompt)}
                  className="group p-3 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-blue-500/50 transition-all duration-200 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl sm:text-2xl">{example.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                        {example.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {example.prompt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto w-full pt-4 sm:pt-10 pb-4">
            {chatMessages.map((message) => {
              const textParts = message.parts.filter((p: any) => p.type === "text");
              const content = textParts.map((p: any) => p.text).join("");
              return (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    role: message.role as "user" | "assistant",
                    content,
                    timestamp: Date.now(),
                  }}
                  isStreaming={isLoading && message.id === chatMessages[chatMessages.length - 1]?.id}
                />
              );
            })}
            
            {/* Show thinking indicator when submitted but no AI response yet */}
            {(status === "submitted" || status === "streaming") && 
             chatMessages[chatMessages.length - 1]?.role === "user" && (
              <ChatMessage
                message={{
                  id: "temp-thinking",
                  role: "assistant",
                  content: "",
                  timestamp: Date.now(),
                }}
                isStreaming={true}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 py-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <div className="border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto w-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            supportsVision={selectedModel.supportsVision}
            isStreaming={isLoading}
            onStopGeneration={stop}
          />
        </div>
      </div>
    </div>
  );
}
