'use client';

import { useState, useRef, useEffect, createElement } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Leaf, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { firebaseConfig } from '@/lib/firebase-client';
import { useAuth } from '@/context/AuthContext';
import { getChatHistory, saveChatHistory } from '@/lib/chat-crud';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as LucideIcons from 'lucide-react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const initialMessages: Message[] = [
    {
        id: '1',
        text: "¡Hola! Soy Eco-Guía. Pregúntame por tus transacciones y te las mostraré en una tabla.",
        sender: 'ai',
    }
]

const iconMap: { [key: string]: any } = LucideIcons;

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && user) {
      getChatHistory(user.uid).then(history => {
        if (history.length > 0) setMessages(history);
      });
    }
  }, [user, isAuthLoading]);

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !user) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsSending(true);
    
    try {
      const functions = firebase.app().functions("southamerica-west1");
      const askGeminiAboutMyData = functions.httpsCallable('askGeminiAboutMyData');
      
      const result = await askGeminiAboutMyData({ 
        history: newMessages.slice(0, -1).map(m => ({ text: m.text, sender: m.sender })),
        query: currentInput,
        userName: user?.displayName,
        userId: user?.uid,
      });

      // ✅ CORRECCIÓN: Se añade una comprobación para evitar el error 'reading data'
      if (result && result.data) {
        const data = result.data as { response: string };
        const aiMessage: Message = { id: Date.now().toString(), text: data.response, sender: 'ai' };
        
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        await saveChatHistory(user.uid, finalMessages);
      } else {
        throw new Error("La respuesta de la Cloud Function no es válida.");
      }

    } catch (error) {
      console.error("Error al llamar a la Cloud Function:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Lo siento, estoy teniendo un pequeño problema en este momento. Por favor, inténtalo de nuevo más tarde.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <style>{`
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1em;
          margin-bottom: 1em;
          background-color: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          overflow: hidden;
        }
        .prose th, .prose td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
          text-align: left;
          vertical-align: top;
        }
        .prose th {
          background-color: hsl(var(--muted));
          font-weight: 600;
          color: hsl(var(--foreground));
          border-bottom: 2px solid hsl(var(--border));
        }
        .prose td {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .prose tr:nth-child(even) td {
          background-color: hsl(var(--muted) / 0.3);
        }
        .prose tr:hover td {
          background-color: hsl(var(--muted) / 0.5);
        }
        /* Estilos específicos para tablas en mensajes de AI */
        .ai-message .prose table {
          border: 1px solid hsl(var(--border));
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }
        .ai-message .prose th {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          font-weight: 600;
        }
        .ai-message .prose td {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .ai-message .prose tr:nth-child(even) td {
          background-color: hsl(var(--muted) / 0.2);
        }
      `}</style>
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
                <div key={message.id} className={cn('flex items-start gap-3', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.sender === 'ai' && (
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <div className='flex h-full w-full items-center justify-center bg-primary'>
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </Avatar>
                  )}
                  <div className={cn(
                    'max-w-md md:max-w-lg lg:max-w-2xl rounded-lg px-4 py-3 text-sm prose prose-sm prose-slate dark:prose-invert', 
                    message.sender === 'user' ? 'bg-primary text-primary-foreground prose-invert max-w-xs md:max-w-md lg:max-w-lg' : 'bg-muted ai-message'
                  )}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => {
                          const text = props.children?.toString() || '';
                          const iconMatch = text.match(/::icon\[(\w+)]::/);
                          if (iconMatch) {
                            const iconName = iconMatch[1];
                            const Icon = iconMap[iconName];
                            return Icon ? <Icon className="inline-block h-5 w-5 text-primary" /> : <>{text}</>;
                          }
                          return <p {...props} />;
                        },
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoUrl || undefined} />
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
    </>
  );
}
