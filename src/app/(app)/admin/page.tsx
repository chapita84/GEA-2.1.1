'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckSquare, ShoppingBag, Store, Users, Loader2, Award } from 'lucide-react'; // ✅ Se importa el ícono Award
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ✅ PASO 1: Importar el hook de autenticación
import { useAuth } from '@/context/AuthContext';

interface AdminSection {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const adminSections: AdminSection[] = [
  {
    title: "Gestionar Usuarios",
    description: "Administra los usuarios de la plataforma, crea, edita y elimina cuentas.",
    href: "/admin/users",
    icon: <Users className="h-8 w-8 text-primary" />
  },
  {
    title: "Gestionar Comercios Verdes",
    description: "Añade, edita o elimina negocios sostenibles del mapa.",
    href: "/admin/comercios-verdes",
    icon: <Store className="h-8 w-8 text-primary" />
  },
  {
    title: "Gestionar Productos",
    description: "Actualiza el catálogo de recompensas con nuevos productos y beneficios.",
    href: "/admin/products",
    icon: <ShoppingBag className="h-8 w-8 text-primary" />
  },
  {
    title: "Gestionar Transacciones",
    description: "Aprueba o rechaza las acciones sostenibles enviadas por los usuarios.",
    href: "/admin/record1",
    icon: <CheckSquare className="h-8 w-8 text-primary" />
  },
  {
    title: "Gestionar Clientes",
    description: "Gestiona los datos de los clientes asociados a los usuarios.",
    href: "/admin/clients",
    icon: <Users className="h-8 w-8 text-primary" />
  },
  // ✅ Se añade la nueva sección de Gamificación
  {
    title: "Gestionar Gamificación",
    description: "Define los niveles y recompensas del sistema de gamificación.",
    href: "/admin/gamification",
    icon: <Award className="h-8 w-8 text-primary" />
  }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  // ✅ PASO 2: Usar el contexto como única fuente de verdad
  const { user, isLoading, logout } = useAuth();

  // ✅ PASO 3: Lógica de protección de ruta robusta
  useEffect(() => {
    // Solo se ejecuta cuando la carga de autenticación ha terminado
    if (!isLoading) {
      if (!user) {
        // Si no hay usuario, redirige al login
        router.replace('/login');
      } else if (!user.isAdmin) {
        // Si el usuario no es admin, redirige al dashboard principal
        console.warn("Acceso denegado: El usuario no es administrador.");
        router.replace('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // ✅ PASO 4: Mostrar un estado de carga mientras se verifica la autenticación
  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" onClick={handleLogout} className="mb-6">
        Cerrar Sesión
      </Button>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {adminSections.map((section) => (
          <Card key={section.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription className="mt-2">{section.description}</CardDescription>
                </div>
                {section.icon}
              </div>
            </CardHeader>
            <CardContent className="flex-1" />
            <div className="p-6 pt-0">
              <Button asChild>
                <Link href={section.href}>
                  Ir a la Sección <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
