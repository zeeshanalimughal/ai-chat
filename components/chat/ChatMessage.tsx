'use client';

import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sparkles, User, Loader2 } from 'lucide-react';
import MessageContent from './MessageContent';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="w-full py-2 px-4 animate-slide-in">
      <div className={cn(
        'flex gap-3 max-w-5xl mx-auto',
        isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
      )}>
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className={cn(
          'flex flex-col gap-1 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}>
          {/* Loading Indicator - only show for assistant */}
          {!isUser && isStreaming && !message.content && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl',
              'bg-muted/50 border border-border'
            )}>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          )}
          
          {/* Message Bubble */}
          {message.content && (
            <div className={cn(
              'rounded-2xl px-3.5 py-2.5 break-words w-fit',
              isUser 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-muted/50 border border-border text-foreground'
            )}>
              {/* Generating indicator - only show for assistant */}
              {!isUser && isStreaming && (
                <div className="flex items-center gap-2 mb-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  <span className="text-xs text-muted-foreground">Generating...</span>
                </div>
              )}
              <MessageContent
                content={message.content}
                images={message.images}
                files={message.files}
                isUser={isUser}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
