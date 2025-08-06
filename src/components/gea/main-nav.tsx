'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Map,
  PlusSquare,
  ShoppingBag,
  MessageCircle,
  LogOut,
  Store,
  Users,
  Loader2,
  Award, // ✅ Se importa el ícono Award

} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // ✅ Se usa el contexto como única fuente de verdad
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Menú base para todos los usuarios
  const baseMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/map', label: 'Mapa', icon: Map },
    { href: '/record/consulta', label: 'Consulta Transacciones', icon: PlusSquare },
    { href: '/catalog', label: 'Catálogo de Beneficios', icon: ShoppingBag },
    { href: '/comercios-verdes', label: 'Comercios Verdes', icon: Store },
    { href: '/chat', label: 'Chat Verde', icon: MessageCircle },
    { href: '/gamification', label: 'Gamificación', icon: Award }, // ✅ Se añade el nuevo enlace

  ];

  // Menú exclusivo para administradores
  const adminOnlyMenuItems = [
    { href: '/admin/users', label: 'Gestión de Usuarios', icon: Users },
    { href: '/admin/comercios-verdes', label: 'Gestión de Comercios', icon: Store },
    { href: '/admin/record1', label: 'Gestión de Transacciones', icon: PlusSquare },
    { href: '/admin/clients', label: 'Gestión de Clientes', icon: PlusSquare },
    { href: '/admin/gamification', label: 'Gestión de Gamificación', icon: PlusSquare },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image 
            src="/logoBig.png" 
            alt="GEA BBVA Logo" 
            width={50} 
            height={50}
            className="mr-2"
          />
          <span className="text-lg font-semibold font-headline">
            <span className="text-primary">GEA</span> <span className="text-secondary">BBVA</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <SidebarMenu>
              {baseMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{
                      children: item.label,
                      className:
                        'bg-sidebar-background text-sidebar-foreground border-sidebar-border',
                    }}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
            {user?.isAdmin && (
              <>
                <SidebarSeparator className="my-2" />
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider">
                  PANEL ADMIN
                </p>
                <SidebarMenu>
                  {adminOnlyMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{
                          children: item.label,
                          className:
                            'bg-sidebar-background text-sidebar-foreground border-sidebar-border',
                        }}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span className="hidden md:inline">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/profile'}
              tooltip={{
                children: 'Perfil',
                className:
                  'bg-sidebar-background text-sidebar-foreground border-sidebar-border',
              }}
            >
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoUrl || undefined} />
                  <AvatarFallback>
                    {getInitials(user?.displayName || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-semibold">{user?.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    Ver Perfil
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={{
                children: 'Cerrar Sesión',
                className:
                  'bg-sidebar-background text-sidebar-foreground border-sidebar-border',
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
