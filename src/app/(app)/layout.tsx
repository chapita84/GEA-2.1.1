'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import { MainNav } from '@/components/gea/main-nav';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, User, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { LoadScript, useLoadScript } from '@react-google-maps/api';

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

const libraries: ("places" | "geocoding" | "maps")[] = ['places', 'geocoding', 'maps'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Usar el contexto como única fuente de verdad
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script globally
  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
  });

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
    <div className="flex h-screen w-full overflow-hidden">
      <MainNav />
      <div className="flex-1 flex flex-col h-full">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm flex-shrink-0">
          <div className="flex-1">
            {/* Can be used for search or breadcrumbs later */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {user?.photoUrl && (
                    <AvatarImage
                      src={user.photoUrl}
                      alt={user.displayName || 'Avatar'}
                    />
                  )}
                  <AvatarFallback>
                    {user ? getInitials(user.displayName || null) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Cuenta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/about" className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  <span>Sobre GEA</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );

  if (!googleMapsApiKey) {
    console.error("La clave de API de Google Maps no está configurada.");
    return layoutContent;
  }

  if (!mapsLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Cargando Google Maps...</span>
      </div>
    );
  }

  return layoutContent;
}
