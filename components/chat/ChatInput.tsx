'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fileToBase64, formatFileSize } from '@/lib/utils';
import { FileAttachment } from '@/lib/types';

interface ChatInputProps {
  onSendMessage: (content: string, images: string[], files: FileAttachment[]) => void;
  disabled?: boolean;
  supportsVision?: boolean;
  onStopGeneration?: () => void;
  isStreaming?: boolean;
}

export default function ChatInput({ onSendMessage, disabled, supportsVision, onStopGeneration, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!input.trim() && images.length === 0 && files.length === 0) return;
    if (disabled) return;

    onSendMessage(input, images, files);
    setInput('');
    setImages([]);
    setFiles([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    for (const file of selectedFiles) {
      try {
        const base64 = await fileToBase64(file);
        
        if (file.type.startsWith('image/')) {
          if (supportsVision) {
            setImages(prev => [...prev, base64]);
          } else {
            alert('The selected model does not support image inputs. Please choose a vision-capable model.');
          }
        } else {
          // Store file attachment (PDFs will be handled directly by the AI model)
          setFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
          }]);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Failed to process file. Please try again.');
      }
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="py-3 px-3 sm:py-4 sm:px-4">
      {/* Attachments Preview */}
      {(images.length > 0 || files.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {/* Image Previews */}
          {images.map((image, index) => (
            <div key={`image-${index}`} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border-2 border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* File Previews */}
          {files.map((file, index) => (
            <div
              key={`file-${index}`}
              className="relative group flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-muted rounded-lg sm:rounded-xl border border-border max-w-full"
            >
              <ImageIcon className="w-4 h-4 flex-shrink-0" />
              <div className="text-xs flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="flex-shrink-0 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area - Professional Layout */}
      <div className="flex items-center gap-2">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach files or images"
          className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl hover:bg-muted transition-colors"
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        {/* Text Input with Integrated Send Button */}
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-muted/50 hover:bg-muted/70 rounded-2xl pl-3 pr-12 sm:pl-4 sm:pr-14 py-2.5 sm:py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-muted disabled:opacity-50 scrollbar-thin transition-all placeholder:text-muted-foreground/60"
            style={{ maxHeight: '200px', minHeight: '44px' }}
          />
          {/* Send/Stop Button - Inside Input */}
          {isStreaming ? (
            <Button
              onClick={onStopGeneration}
              size="icon"
              title="Stop generating"
              className="absolute right-1.5 bottom-2.5 sm:right-2 sm:bottom-3 h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all"
            >
              <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={disabled || (!input.trim() && images.length === 0 && files.length === 0)}
              size="icon"
              title="Send message"
              className="absolute right-1.5 bottom-2.5 sm:right-2 sm:bottom-3 h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Credit */}
      <div className="mt-2 sm:mt-3 text-center">
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span>Built with ❤️ by</span>
          <a
            href="https://github.com/zeeshanalimughal"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors inline-flex items-center gap-1"
          >
            Zeeshan Ali
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </p>
      </div>
    </div>
  );
}
