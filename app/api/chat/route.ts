import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

// Remove edge runtime to use Node.js runtime
// export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

interface ChatRequest {
  messages: Message[];
  model: string;
  provider: 'openai' | 'google';
  files?: any[];
}

// Helper function to convert base64 to format needed by APIs
function extractBase64Data(base64String: string): string {
  if (base64String.startsWith('data:')) {
    return base64String.split(',')[1];
  }
  return base64String;
}

// Helper function to detect mime type from base64 string
function getMimeType(base64String: string): string {
  if (base64String.includes('image/png')) return 'image/png';
  if (base64String.includes('image/gif')) return 'image/gif';
  if (base64String.includes('image/webp')) return 'image/webp';
  return 'image/jpeg';
}

// Helper function to extract text from text files
function extractTextFromFile(base64Data: string, mimeType: string): string {
  try {
    const base64Content = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    const buffer = Buffer.from(base64Content, 'base64');
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '[Error: Could not extract text from file]';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    
    // Handle both formats: direct messages or AI SDK format
    let messages = body.messages;
    let model = body.model;
    let provider = body.provider;
    let files = body.files || [];

    console.log('Chat request:', { 
      model, 
      provider, 
      messageCount: messages?.length, 
      filesCount: files.length,
      fileDetails: files.map((f: any) => ({ name: f.name, type: f.type, hasData: !!f.data }))
    });

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    if (!model || !provider) {
      return Response.json(
        { error: 'Model and provider are required' },
        { status: 400 }
      );
    }

    // Select the appropriate model
    let selectedModel;
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return Response.json(
          { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.' },
          { status: 500 }
        );
      }
      selectedModel = openai(model);
    } else if (provider === 'google') {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return Response.json(
          { error: 'Google API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.' },
          { status: 500 }
        );
      }
      selectedModel = google(model);
    } else {
      return Response.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Convert messages to AI SDK format with support for images and files
    const formattedMessages = messages.map((msg: any, index: number) => {
      const isLastUserMessage = index === messages.length - 1 && msg.role === 'user';
      
      // For the last user message, add files as multimodal content
      if (isLastUserMessage && files && files.length > 0 && msg.role === 'user') {
        const content: any[] = [
          { type: 'text', text: msg.content }
        ];
        
        // Add images if present
        if (msg.images && msg.images.length > 0) {
          content.push(...msg.images.map((imageUrl: string) => ({
            type: 'image',
            image: imageUrl,
          })));
        }
        
        // Add PDF files using the 'file' type (supported by OpenAI and Google)
        files.forEach((file: any) => {
          if (file.type === 'application/pdf') {
            console.log(`Adding PDF to message: ${file.name}`);
            content.push({
              type: 'file',
              data: file.data, // Base64 data URL
              mediaType: 'application/pdf',
            });
          } else if (file.type.startsWith('text/') || file.type === 'application/json') {
            // For text files, extract and add as text
            const textContent = extractTextFromFile(file.data, file.type);
            content[0].text += `\n\n--- File: ${file.name} ---\n${textContent}\n---\n`;
          }
        });
        
        return {
          role: msg.role,
          content,
        };
      }
      
      // If message has images but no files, create multimodal content
      if (msg.images && msg.images.length > 0 && msg.role === 'user') {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images.map((imageUrl: string) => ({
              type: 'image',
              image: imageUrl,
            }))
          ],
        };
      }
      
      // Text-only message
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    console.log('Streaming with model:', model, 'Messages with images:', messages.some((m: any) => m.images), 'Files:', files.length);
    console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));

    // Use streamText - simple approach from docs
    const result = streamText({
      model: selectedModel,
      messages: formattedMessages,
      onChunk: ({ chunk }) => {
        console.log('Chunk received:', chunk);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    return Response.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
