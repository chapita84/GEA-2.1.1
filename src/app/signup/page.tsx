'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createUser, getUserByEmail } from '@/lib/users-crud-complete';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    photoUrl: '',
    interests: '',
    onboardingCompleted: false,
    greenCoins: 0,
    isAdmin: false,
    gamification: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      // Validar si el usuario ya existe en Firestore
      const existingUser = await getUserByEmail(form.email);
      if (existingUser) {
        setError('El usuario ya existe con ese email.');
        setLoading(false);
        return;
      }

      // Genera un UID simple (puedes usar email como ID o una función hash)
      const uid = form.email.replace(/[^a-zA-Z0-9]/g, '');

      // Persiste el usuario en Firestore
      await createUser({
        uid,
        email: form.email,
        password: form.password, // Guardar contraseñas en texto plano NO es seguro, solo para pruebas
        displayName: form.displayName,
        photoUrl: form.photoUrl || 'https://via.placeholder.com/150',
        createdAt: new Date().toISOString(),
        interests: form.interests ? form.interests.split(',').map(i => i.trim()) : [],
        onboardingCompleted: form.onboardingCompleted,
        greenCoins: Number(form.greenCoins) || 0,
        isAdmin: form.isAdmin,
        gamification: form.gamification ? JSON.parse(form.gamification) : { level: 1, points: 0 }
      });

      router.push('/login?success=1');
    } catch (error: any) {
      setError('Error al crear el usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 flex-col gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte en GEA BBVA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSignup(); }}>
            <div className="space-y-2">
              <Input
                placeholder="Nombre"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Contraseña"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="URL de Foto (opcional)"
                value={form.photoUrl}
                onChange={e => setForm({ ...form, photoUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Intereses (separados por coma)"
                value={form.interests}
                onChange={e => setForm({ ...form, interests: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.onboardingCompleted}
                  onChange={e => setForm({ ...form, onboardingCompleted: e.target.checked })}
                />
                Onboarding Completado
              </label>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="GreenCoins"
                type="number"
                value={form.greenCoins}
                onChange={e => setForm({ ...form, greenCoins: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={e => setForm({ ...form, isAdmin: e.target.checked })}
                />
                Es Administrador
              </label>
            </div>
            <div className="space-y-2">
              <Input
                placeholder='Gamificación (ej: {"level":1,"points":0})'
                value={form.gamification}
                onChange={e => setForm({ ...form, gamification: e.target.value })}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline text-primary">
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}