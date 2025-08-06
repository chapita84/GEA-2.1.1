'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Leaf, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase-client';
import { useAuth } from '@/context/AuthContext';
import { getChatHistory, saveChatHistory } from '@/lib/chat-crud';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const initialMessages: Message[] = [
    {
        id: '1',
        text: "¡Hola! Soy Eco-Guía, tu asistente de IA sobre sostenibilidad. ¿Cómo puedo ayudarte a ser más ecológico hoy?",
        sender: 'ai',
    }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
      const loadHistory = async () => {
        if (user) {
          const history = await getChatHistory(user.uid);
          if (history.length > 0) {
            setMessages(history);
          } else {
            setMessages(initialMessages);
          }
        } else {
          setMessages(initialMessages);
        }
      };
      loadHistory();
    }
  }, [user, isAuthLoading]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || isAuthLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsSending(true);
    
    try {
      const askGeminiAboutMyData = httpsCallable(functions, 'askGeminiAboutMyData');
      
      const result = await askGeminiAboutMyData({ 
        history: newMessages.slice(0, -1),
        query: currentInput,
        userName: user?.displayName || null,
        userId: user?.uid || null,
      });

      const data = result.data as { response: string };
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
      };
      
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      await saveChatHistory(user.uid, finalMessages);

    } catch (error) {
      console.error("Error al llamar a la Cloud Function:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, estoy teniendo un pequeño problema en este momento. Por favor, inténtalo de nuevo más tarde.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-120px)]">
      <CardHeader className="flex flex-row items-center gap-3 border-b">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
        <div>
            <h2 className="text-xl font-bold tracking-tight font-headline">Chat Verde</h2>
            <p className="text-sm text-muted-foreground">Tu Asistente de IA de Sostenibilidad</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
         <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-9 w-9 border-2 border-primary">
                    <div className='flex h-full w-full items-center justify-center bg-primary'>
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-3 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
                  {message.sender === 'user' && (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoUrl || "https://placehold.co/40x40.png"} />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isSending && (
                <div className='flex items-start gap-3 justify-start'>
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <div className='flex h-full w-full items-center justify-center bg-primary'>
                          <Leaf className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </Avatar>
                  <div className='max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-3 text-sm bg-muted'>
                      <div className="flex items-center gap-2">
                          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
                      </div>
                  </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre cómo reducir tu huella de carbono..."
            disabled={isAuthLoading || isSending || !user}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isAuthLoading || isSending || !input.trim() || !user}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
