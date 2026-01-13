import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, Loader2, Zap, HelpCircle, CreditCard, Share, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  { icon: HelpCircle, text: "How do I upload files?", color: "text-blue-500" },
  { icon: Zap, text: "What are the file size limits?", color: "text-amber-500" },
  { icon: Share, text: "How to share files securely?", color: "text-emerald-500" },
  { icon: CreditCard, text: "Pricing information", color: "text-purple-500" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! 👋 I'm FileShare AI assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const streamChat = useCallback(async (userMessages: Message[]) => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent rounded-full blur-xl opacity-40 animate-pulse" />
              
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all duration-300 border border-white/20"
              >
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                <span className="sr-only">Open chat</span>
              </Button>
              
              {/* Online indicator */}
              <motion.span 
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border-2 border-background"></span>
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed z-50 flex flex-col",
              "bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-xl",
              "border border-border/50 shadow-2xl overflow-hidden",
              isFullscreen 
                ? "inset-2 sm:inset-4 rounded-2xl sm:rounded-3xl" 
                : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] rounded-2xl sm:rounded-3xl"
            )}
            style={{ 
              maxHeight: isFullscreen 
                ? 'calc(100vh - 2rem)' 
                : isMinimized 
                  ? 'auto' 
                  : 'min(650px, calc(100vh - 6rem))' 
            }}
          >
            {/* Premium Header */}
            <div className="relative overflow-hidden flex-shrink-0">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent opacity-95" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              
              <div className="relative p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar with glow */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-lg" />
                    <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                      <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <motion.div 
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-white/50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2 text-base sm:text-lg">
                      FileShare AI
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Sparkles className="h-4 w-4 text-amber-300" />
                      </motion.div>
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-xs text-white/80 font-medium">Online • Powered by Gemini</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl hidden sm:flex"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsOpen(false);
                      setIsFullscreen(false);
                    }}
                    className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <X className="h-4 w-4" />
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
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <ScrollArea 
                    ref={scrollRef} 
                    className={cn(
                      "flex-1 px-4 py-4",
                      isFullscreen ? "h-[calc(100vh-280px)]" : "h-[320px] sm:h-[380px]"
                    )}
                  >
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "flex gap-2 sm:gap-3",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {message.role === 'assistant' && (
                            <motion.div 
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </motion.div>
                          )}
                          
                          <div className="flex flex-col gap-1 max-w-[80%]">
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                "rounded-2xl px-4 py-3 text-sm shadow-sm",
                                message.role === 'user'
                                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                                  : 'bg-muted/80 text-foreground rounded-bl-md border border-border/50'
                              )}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content || '...'}</p>
                            </motion.div>
                            <span className={cn(
                              "text-[10px] text-muted-foreground/60 px-2",
                              message.role === 'user' ? 'text-right' : 'text-left'
                            )}>
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          
                          {message.role === 'user' && (
                            <motion.div 
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shrink-0 border border-border/50 shadow-sm"
                              whileHover={{ scale: 1.1 }}
                            >
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
                            <div className="flex gap-1.5">
                              <motion.span 
                                className="h-2 w-2 bg-primary/60 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              />
                              <motion.span 
                                className="h-2 w-2 bg-primary/60 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                              />
                              <motion.span 
                                className="h-2 w-2 bg-primary/60 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Replies */}
                  <div className="px-4 py-3 border-t border-border/30 bg-muted/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <motion.button
                          key={reply.text}
                          onClick={() => handleSend(reply.text)}
                          disabled={isLoading}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-background hover:bg-primary/5 text-foreground border border-border/60 hover:border-primary/40 transition-all disabled:opacity-50 shadow-sm"
                        >
                          <reply.icon className={cn("h-3.5 w-3.5", reply.color)} />
                          <span className="hidden sm:inline">{reply.text}</span>
                          <span className="sm:hidden">{reply.text.split(' ').slice(0, 3).join(' ')}...</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border/30 bg-gradient-to-t from-muted/30 to-transparent">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything..."
                          disabled={isLoading}
                          className="w-full h-11 sm:h-12 pl-4 pr-4 bg-background/80 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 text-sm transition-all"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleSend()}
                          disabled={!input.trim() || isLoading}
                          size="icon"
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] text-muted-foreground/60 font-medium">
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