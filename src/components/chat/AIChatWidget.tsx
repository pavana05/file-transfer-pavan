import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, Loader2, Zap, CreditCard, Maximize2, ChevronDown, FileUp, Lock, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  { icon: FileUp, text: "How do I upload files?", color: "text-blue-500" },
  { icon: Zap, text: "What are the file size limits?", color: "text-amber-500" },
  { icon: Lock, text: "How to share files securely?", color: "text-emerald-500" },
  { icon: CreditCard, text: "Tell me about pricing plans", color: "text-purple-500" },
  { icon: Clock, text: "How long do files stay available?", color: "text-cyan-500" },
  { icon: Settings, text: "How to use PIN access?", color: "text-rose-500" },
];

const CHAT_URL = 'https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/ai-chat';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA';

export const AIChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! 👋 I'm your FileShare AI assistant. I can help you with:\n\n• **File uploads & sharing**\n• **Pricing & plans**\n• **Security features**\n• **Troubleshooting**\n\nHow can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  const isAdminPage = location.pathname === '/admin';

  const streamChat = useCallback(async (userMessages: Message[]) => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      const assistantId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
      throw error;
    }
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch {
      // Error handled in streamChat
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
          >
            <motion.div 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.92 }} 
              className="relative"
            >
              {/* Subtle pulse ring */}
              <motion.div 
                className="absolute -inset-1.5 bg-primary/20 rounded-full"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="relative h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all duration-200 border border-primary-foreground/10"
              >
                <MessageCircle className="h-6 w-6 text-primary-foreground" />
                <span className="sr-only">Open chat</span>
              </Button>
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "fixed z-50 flex flex-col bg-card backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden",
              isFullscreen 
                ? "inset-2 sm:inset-4 rounded-2xl" 
                : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[400px] rounded-2xl"
            )}
            style={{ 
              maxHeight: isFullscreen ? 'calc(100vh - 2rem)' : isMinimized ? 'auto' : 'min(560px, calc(100vh - 6rem))',
              height: isFullscreen ? 'calc(100vh - 2rem)' : isMinimized ? 'auto' : 'min(560px, calc(100vh - 6rem))'
            }}
          >
            {/* Header */}
            <div className="relative flex-shrink-0 bg-primary">
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-[1.5px] border-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground text-sm flex items-center gap-1.5">
                      FileShare AI
                      <Sparkles className="h-3 w-3 text-amber-300" />
                    </h3>
                    <p className="text-[10px] text-primary-foreground/70">Online • Powered by Gemini</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg hidden sm:flex"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setIsOpen(false); setIsFullscreen(false); }}
                    className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col flex-1 overflow-hidden min-h-0"
                >
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto overscroll-contain px-3 py-3"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          className={cn(
                            "flex gap-2",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {message.role === 'assistant' && (
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-0.5 max-w-[82%]">
                            <div
                              className={cn(
                                "rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-muted/60 text-foreground rounded-bl-sm border border-border/40'
                              )}
                            >
                              {message.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-0.5 [&>ul]:my-0.5 [&>ol]:my-0.5 [&>p:last-child]:mb-0 [&>p:first-child]:mt-0">
                                  <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                            <span className={cn(
                              "text-[9px] text-muted-foreground/50 px-1",
                              message.role === 'user' ? 'text-right' : 'text-left'
                            )}>
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          
                          {message.role === 'user' && (
                            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2"
                        >
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-2.5 border border-border/40">
                            <div className="flex gap-1">
                              <motion.span className="h-1.5 w-1.5 bg-primary/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                              <motion.span className="h-1.5 w-1.5 bg-primary/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} />
                              <motion.span className="h-1.5 w-1.5 bg-primary/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Scroll to bottom */}
                  <AnimatePresence>
                    {showScrollButton && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-primary/90 shadow-md flex items-center justify-center hover:bg-primary transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-primary-foreground" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Quick Replies */}
                  <div className="flex-shrink-0 px-3 py-2 border-t border-border/30">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1.5">Quick Actions</p>
                    <div className="flex flex-wrap gap-1">
                      {quickReplies.slice(0, isFullscreen ? 6 : 4).map((reply) => (
                        <button
                          key={reply.text}
                          onClick={() => handleSend(reply.text)}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-md bg-muted/40 hover:bg-muted/70 text-foreground border border-border/40 hover:border-primary/30 transition-all disabled:opacity-50"
                        >
                          <reply.icon className={cn("h-2.5 w-2.5", reply.color)} />
                          <span className="truncate max-w-[100px]">{reply.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="flex-shrink-0 p-3 border-t border-border/30 bg-muted/10">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="flex-1 h-10 text-sm bg-background border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-sm transition-all"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-muted-foreground/50">
                        Secured & Encrypted • Powered by FileShare AI
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
