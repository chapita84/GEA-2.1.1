'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/gea/main-nav';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { LoadScript } from '@react-google-maps/api';

// Importar el hook de autenticación
import { useAuth } from '@/context/AuthContext';

const getInitials = (name: string | null): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Usar el contexto como única fuente de verdad
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // ✅ CAMBIO CLAVE: useEffect para manejar la redirección de forma segura
  useEffect(() => {
    // Si la carga ha terminado y no hay usuario, redirigir al login.
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Mientras el AuthContext está verificando el usuario, mostramos un loader.
  // Esto previene que se renderice nada más hasta que sepamos el estado de auth.
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si llegamos aquí, isLoading es false y el usuario existe.
  const layoutContent = (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <div className="min-h-screen w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm peer-data-[state=expanded]:md:pl-[--sidebar-width] peer-data-[state=collapsed]:md:pl-[--sidebar-width-icon]">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            {/* Can be used for search or breadcrumbs later */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          
          <Link href="/profile">
            <Avatar className="h-9 w-9">
              {user?.photoUrl && (
                <AvatarImage
                  src={user.photoUrl}
                  alt={user.displayName || 'Avatar'}
                />
              )}
              <AvatarFallback>
                {user ? getInitials(user.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>
        <SidebarInset>
          <div className="p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );

  if (!googleMapsApiKey) {
    console.error("La clave de API de Google Maps no está configurada.");
    return layoutContent; // Ya no se envuelve en ProtectedLayout
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={['places', 'geocoding', 'maps']}
    >
      {layoutContent}
    </LoadScript>
  );
}
