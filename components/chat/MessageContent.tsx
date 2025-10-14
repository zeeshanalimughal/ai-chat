'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { FileAttachment } from '@/lib/types';
import { File, FileText, FileImage, Download } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
  images?: string[];
  files?: FileAttachment[];
  isUser?: boolean;
}

export default function MessageContent({ content, images, files, isUser = false }: MessageContentProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('text/')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      {/* Images */}
      {images && images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden border border-border max-w-sm">
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="max-w-full max-h-64 object-contain bg-background"
              />
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {files && files.length > 0 && (
        <div className="space-y-2.5 mb-3">
          {files.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-xl border transition-all min-w-[280px] max-w-[400px]",
                isUser 
                  ? "bg-white/10 border-white/20" 
                  : "bg-card border-border"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-lg flex-shrink-0",
                isUser ? "bg-white/20" : "bg-primary/10"
              )}>
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold truncate mb-0.5",
                  isUser ? "text-white" : "text-foreground"
                )}>
                  {file.name}
                </p>
                <div className={cn(
                  "flex items-center gap-2 text-xs",
                  isUser ? "text-white/80" : "text-muted-foreground"
                )}>
                  <span className="font-medium">{formatFileSize(file.size)}</span>
                  <span className="opacity-50">•</span>
                  <span className="truncate">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                </div>
              </div>
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                isUser ? "bg-white/10" : "bg-primary/5"
              )}>
                <Download className={cn(
                  "w-3.5 h-3.5",
                  isUser ? "text-white/80" : "text-muted-foreground"
                )} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Text Content */}
      <div className={cn(
        "markdown prose prose-sm max-w-none break-words",
        "prose-p:my-3 prose-p:leading-7",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4",
        "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3",
        "prose-ul:my-4 prose-ul:space-y-2",
        "prose-ol:my-4 prose-ol:space-y-2",
        "prose-li:my-1 prose-li:leading-7",
        "prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-img:my-4 prose-img:rounded-lg",
        "prose-hr:my-8",
        "prose-table:my-4",
        "prose-strong:font-semibold",
        isUser 
          ? "prose-invert prose-a:text-white prose-a:underline"
          : "dark:prose-invert prose-a:text-blue-600 dark:prose-a:text-blue-400"
      )}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              
              return !inline && match ? (
                <CodeBlock 
                  code={codeString}
                  language={match[1]}
                  inline={false}
                />
              ) : (
                <code 
                  className={cn(
                    "px-1.5 py-0.5 rounded text-sm font-mono",
                    isUser ? "bg-white/20" : "bg-muted"
                  )} 
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
