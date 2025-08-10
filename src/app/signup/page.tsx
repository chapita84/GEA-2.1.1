'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase-client';
import { createUser } from '@/lib/users-crud-complete';
import { createClient } from '@/lib/client-crud';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/models/user_model';
import { Client } from '@/models/client_model';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth(app);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const firebaseUser = userCredential.user;

      // 2. Preparar los datos para Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: form.displayName,
        createdAt: new Date().toISOString(),
        isAdmin: false, // Por defecto, los nuevos usuarios no son administradores
        greenCoins: 0,
        gamification: { level: 1, points: 0, title: 'Explorador Ecológico' }
      };

      const clientData: Client = {
        id: firebaseUser.uid,
        usuarioUid: firebaseUser.uid,
        nombre: form.displayName,
        apellido: '', // El usuario podrá completar esto en su perfil
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        documento: '',
      };

      // 3. Crear los documentos en las colecciones 'users' y 'clients'
      await createUser(firebaseUser, { displayName: form.displayName });
      await createClient(clientData);

      toast({
        title: "¡Cuenta Creada!",
        description: "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.",
      });

      router.push('/login');

    } catch (err: any) {
      console.error("Error de registro:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Este correo electrónico ya está en uso.");
      } else {
        setError("Ocurrió un error al crear la cuenta. Por favor, intente de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
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
          <CardTitle>Crear una Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte en GEA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre a Mostrar</Label>
              <Input id="displayName" required value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}/>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarse
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-muted-foreground w-full">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline text-primary">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
