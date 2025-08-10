'use client';

import { useState } from 'react';
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
  Award,
  Gift,
  ChevronsLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false); // ✅ Nuevo estado

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

  const baseMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/map', label: 'Mapa', icon: Map },
    { href: '/record/consulta', label: 'Transacciones', icon: PlusSquare },
    { href: '/catalog', label: 'Beneficios', icon: ShoppingBag },
    { href: '/comercios-verdes', label: 'Comercios', icon: Store },
    { href: '/chat', label: 'Chat Verde', icon: MessageCircle },
    { href: '/gamification', label: 'Recompensas', icon: Award },
  ];

  const adminOnlyMenuItems = [
    { href: '/admin/users', label: 'Usuarios', icon: Users },
    { href: '/admin/clients', label: 'Clientes', icon: Users },
    { href: '/admin/comercios-verdes', label: 'Comercios', icon: Store },
    { href: '/admin/record1', label: 'Transacciones', icon: PlusSquare },
    { href: '/admin/products', label: 'Productos', icon: ShoppingBag },
    { href: '/admin/gamification', label: 'Recompensas', icon: Award },
    { href: '/admin/redemptions', label: 'Canjes', icon: Gift },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image 
            src="/logoBig.png" 
            alt="GEA BBVA Logo" 
            width={32} 
            height={32}
            className="flex-shrink-0"
          />
          {!isCollapsed && (
            <span className="text-lg font-semibold font-headline">
              <span className="text-primary">GEA</span> <span className="text-secondary">BBVA</span>
            </span>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-foreground/60" />
          </div>
        ) : (
          <>
            {/* Menu Principal */}
            <nav className="space-y-1">
              {baseMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-border hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
            
            {/* Panel Admin */}
            {user?.isAdmin && (
              <>
                <div className="mt-6 mb-2">
                  <div className={cn(
                    "px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 tracking-wider",
                    isCollapsed ? "text-center" : "border-t border-sidebar-border pt-4"
                  )}>
                    {isCollapsed ? 'A' : 'PANEL ADMIN'}
                  </div>
                </div>
                <nav className="space-y-1">
                  {adminOnlyMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "text-sidebar-foreground/80 hover:bg-sidebar-border hover:text-sidebar-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        {/* Perfil */}
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-border hover:text-sidebar-foreground mb-1",
            pathname === '/profile' && "bg-sidebar-accent text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? 'Perfil' : undefined}
        >
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={user?.photoUrl || undefined} />
            <AvatarFallback className="text-xs bg-sidebar text-sidebar-foreground">
              {getInitials(user?.displayName || null)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium truncate">{user?.displayName || 'Usuario'}</span>
              <span className="text-xs text-sidebar-foreground/60">Ver Perfil</span>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-red-700 hover:text-white mb-1",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/80 hover:bg-sidebar-border hover:text-sidebar-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? 'Expandir' : 'Contraer'}
        >
          <ChevronsLeft className={cn(
            "flex-shrink-0 transition-transform", 
            isCollapsed ? "h-5 w-5 rotate-180" : "h-4 w-4"
          )} />
          {!isCollapsed && <span>Contraer</span>}
        </button>
      </div>
    </div>
  );
}
