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
    <div className="py-4 px-4">
      {/* Attachments Preview */}
      {(images.length > 0 || files.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {/* Image Previews */}
          {images.map((image, index) => (
            <div key={`image-${index}`} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-xl border-2 border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* File Previews */}
          {files.map((file, index) => (
            <div
              key={`file-${index}`}
              className="relative group flex items-center gap-2 px-3 py-2 bg-muted rounded-xl border border-border"
            >
              <ImageIcon className="w-4 h-4" />
              <div className="text-xs">
                <p className="font-medium truncate max-w-[100px]">{file.name}</p>
                <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
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
          className="shrink-0 h-11 w-11 rounded-xl hover:bg-muted transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text Input with Integrated Send Button */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-muted/50 hover:bg-muted/70 rounded-2xl pl-4 pr-14 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-muted disabled:opacity-50 scrollbar-thin transition-all placeholder:text-muted-foreground/60"
            style={{ maxHeight: '200px', minHeight: '44px' }}
          />
          {/* Send/Stop Button - Inside Input */}
          {isStreaming ? (
            <Button
              onClick={onStopGeneration}
              size="icon"
              title="Stop generating"
              className="absolute right-2 bottom-3 h-9 w-9 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={disabled || (!input.trim() && images.length === 0 && files.length === 0)}
              size="icon"
              title="Send message"
              className="absolute right-2 bottom-3 h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hint Text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          {supportsVision ? (
            <>
              <span className="text-blue-500">✨</span>
              <span>This model supports text, images, and files</span>
            </>
          ) : (
            <>
              <span className="text-blue-500">📝</span>
              <span>This model supports text and file inputs</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
