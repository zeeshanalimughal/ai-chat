# ArcChat

A modern, full-featured AI chat application built with Next.js 15, supporting multiple AI models (OpenAI, Google Gemini), streaming responses, image generation, and file attachments.

## Features

- 🤖 **Multiple AI Models**: Switch between GPT-4o, Gemini, and more
- 💬 **Streaming Responses**: Real-time text streaming for a natural chat experience
- 🖼️ **Image Support**: Generate and display images
- 📎 **File Attachments**: Upload and process various file types
- 💾 **Local Storage**: Persistent chat history stored locally
- 🎨 **Modern UI/UX**: Beautiful, responsive interface with smooth animations
- 🌓 **Dark/Light Theme**: Automatic theme switching with manual override
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Performance**: Optimized with Next.js 15 and React 18

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API keys for the AI services you want to use:
  - OpenAI API key (for GPT models)
  - Google AI API key (for Gemini models)

### Installation

1. Clone the repository or extract the files

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Model**: Use the dropdown in the top left to choose your AI model
2. **Start Chatting**: Type your message in the input box at the bottom
3. **Upload Files**: Click the attachment icon to upload images or documents
4. **Create New Chat**: Click the "+ New Chat" button in the sidebar
5. **Delete Chat**: Hover over a chat in the sidebar and click the delete icon
6. **Toggle Theme**: Click the sun/moon icon in the top right

## Project Structure

```
ai-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route for AI chat
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat page
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx     # Main chat component
│   │   ├── ChatMessage.tsx       # Individual message component
│   │   ├── ChatInput.tsx         # Message input component
│   │   └── MessageContent.tsx    # Markdown renderer
│   ├── sidebar/
│   │   ├── Sidebar.tsx           # Chat history sidebar
│   │   └── ChatItem.tsx          # Chat list item
│   ├── ui/
│   │   ├── Button.tsx            # Reusable button component
│   │   ├── Dropdown.tsx          # Model selector dropdown
│   │   └── ThemeToggle.tsx       # Theme switcher
│   └── providers/
│       └── ThemeProvider.tsx     # Theme context provider
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── storage.ts                # Local storage helpers
│   └── types.ts                  # TypeScript type definitions
└── public/                       # Static assets
```

## Technologies Used

- **Next.js 15**: React framework with app router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Vercel AI SDK**: AI integration and streaming
- **OpenAI SDK**: GPT models
- **Google Generative AI**: Gemini models
- **Lucide React**: Icons
- **React Markdown**: Markdown rendering

## API Routes

### POST /api/chat

Sends a message to the selected AI model and streams the response.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": "string",
      "images": ["base64_string"] // optional
    }
  ],
  "model": "string",
  "provider": "openai" | "google"
}
```

**Response:** 
Streaming text response in Server-Sent Events (SSE) format.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.
