import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ModelProvider } from "@/contexts/ModelContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chat - ChatGPT Clone",
  description: "A modern AI chat application supporting multiple models including GPT-4o and Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ModelProvider>
            {children}
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
