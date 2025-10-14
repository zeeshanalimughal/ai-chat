'use client';

import { Chat } from '@/lib/types';
import { formatTimestamp, truncateText } from '@/lib/utils';
import { MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function ChatItem({ chat, isActive, onSelect, onDelete }: ChatItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all',
        isActive
          ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20'
          : 'hover:bg-accent/50 border border-transparent'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isActive 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          : 'bg-muted text-muted-foreground'
      )}>
        <MessageSquare className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {truncateText(chat.title, 25)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTimestamp(chat.updatedAt)}
        </p>
      </div>

      {isHovered && (
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
