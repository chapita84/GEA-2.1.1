'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client'; // Usamos la instancia compartida
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      console.log("Inspeccionando config en auth:", auth.app.options); 
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      
      console.log("LOGIN EXITOSO:", userCredential.user);
      setError(''); // Limpiar errores previos
      alert('¡Inicio de sesión exitoso! Redirigiendo al dashboard.');
      router.push('/dashboard'); // Redirección manual al éxito

    } catch (err: any) {
      console.error("Error de Firebase Auth:", err);
      // Mostrar el error completo en la UI para máxima información
      setError(`Error: ${err.message} (${err.code})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se han eliminado: useAuth, useEffects, y el renderizado condicional.
  // Esta es una página de formulario simple.

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 flex-col gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logoBig.png" 
                alt="GEA BBVA Logo" 
                width={50} 
                height={50}
                className="mr-2"
              />
              <span className="text-2xl font-bold tracking-tighter font-headline">
                <span className="text-primary">GEA</span> <span className="text-secondary">BBVA</span>
              </span>
            </Link>
          </div>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && <div className="text-red-500 text-sm" style={{ whiteSpace: 'pre-wrap' }}>{error}</div>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Iniciar Sesión con Google
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Iniciar Sesión con Apple
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline text-primary">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}