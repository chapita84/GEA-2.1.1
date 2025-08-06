'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Leaf, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
// CORRECCIÓN: Se importa la acción del servidor, no el flujo.
import { invokeChatVerdeAssistant } from '@/ai/actions';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const initialMessages: Message[] = [
    {
        id: '1',
        text: "¡Hola! Soy Chat Verde, tu asistente de IA sobre sostenibilidad. ¿Cómo puedo ayudarte a ser más ecológico hoy?",
        sender: 'ai',
    }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // CORRECCIÓN: Se llama a la nueva función 'invokeChatVerdeAssistant'.
      const { response } = await invokeChatVerdeAssistant({ query: input });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, estoy teniendo un pequeño problema en este momento. Por favor, inténtalo de nuevo más tarde.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person avatar" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
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
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}