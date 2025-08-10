'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase-client';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth(app);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Error de autenticación:", err);
      setError("Credenciales inválidas. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-[-10]">
        <Image
          src="/login-background.jpg"
          alt="Fondo futurista con edificios ecológicos y paneles solares"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter font-headline">
              <Link href="/" className="flex items-center">
              {/*<span className="text-emerald-400">GEA</span> <span className="text-blue-400">BBVA</span>*/}
              </Link>              
            </h1>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10 bg-white/10 text-white border-white/20 focus:ring-emerald-400 placeholder:text-gray-400"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Contraseña"
                    required 
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-10 bg-white/10 text-white border-white/20 focus:ring-emerald-400 placeholder:text-gray-400"
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-emerald-500/50" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
              <div className="text-center text-sm text-gray-300">
                <Link
                  href="/forgot-password"
                  className="underline hover:text-emerald-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                <span className="mx-2">|</span>
                <Link href="/signup" className="underline hover:text-emerald-400">
                  Regístrate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
