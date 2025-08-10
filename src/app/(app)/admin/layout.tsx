'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const adminNavItems = [
  { name: 'Admin Gral', href: '/admin' },
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Usuarios', href: '/admin/users' },
  { name: 'Comercios Verdes', href: '/admin/comercios-verdes' },
  { name: 'Transacciones', href: '/admin/record1' },
  { name: 'Beneficios', href: '/admin/products' },
  { name: 'Clientes', href: '/admin/clients' },
  { name: 'Gamificación', href: '/admin/gamification' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Gestiona el contenido y los usuarios de la aplicación GEA.
        </p>
      </div>

      <Tabs value={pathname} className="w-full">
        <TabsList>
          {adminNavItems.map((item) => (
            <TabsTrigger key={item.name} value={item.href} asChild>
              <Link href={item.href}>{item.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <main>{children}</main>
    </div>
  );
}
