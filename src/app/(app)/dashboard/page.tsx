'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Award,
  Leaf,
  Recycle,
  Target,
  TreePine,
  Zap,
  Map,
  PlusSquare,
  ShoppingBag,
  MessageCircle,
  User,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ✅ Se importan los hooks y la lógica necesaria
import { useAuth } from '@/context/AuthContext';
import { gamificationLevels } from '@/lib/gamification';
import { ElementType } from 'react';

const dashboardLinks = [
  {
    title: 'Mapa Sostenible',
    description: 'Descubre vendedores ecológicos.',
    href: '/map',
    icon: Map,
  },
  {
    title: 'Consultar Transacciones',
    description: 'Gana Monedas Verdes por tus acciones.',
    href: '/record/consulta',
    icon: PlusSquare,
  },
  {
    title: 'Catálogo de Recompensas',
    description: 'Canjea tus monedas por premios.',
    href: '/catalog',
    icon: ShoppingBag,
  },
  {
    title: 'Chat Verde',
    description: 'Habla con nuestro asistente de IA.',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    title: 'Mi Perfil',
    description: 'Gestiona tu cuenta y progreso.',
    href: '/profile',
    icon: User,
  },
];

const challenges = [
  {
    title: 'Maestro del Reciclaje',
    description: 'Registra 10 actividades de reciclaje este mes.',
    progress: 70,
    icon: Recycle,
  },
  {
    title: 'Ahorrador de Energía',
    description: 'Reduce el consumo de energía de tu hogar en un 5%.',
    progress: 40,
    icon: Zap,
  },
];

const recentActivities = [
  {
    action: 'Fui en bici al trabajo',
    points: '+15 MV',
    time: 'hace 2 horas',
    icon: <Leaf className="h-5 w-5 text-primary" />,
  },
  {
    action: 'Canjeé Cupón',
    points: '-100 MV',
    time: 'hace 1 día',
    icon: <Award className="h-5 w-5 text-accent" />,
  },
  {
    action: 'Planté un árbol',
    points: '+50 MV',
    time: 'hace 3 días',
    icon: <TreePine className="h-5 w-5 text-primary" />,
  },
];

export default function DashboardPage() {
  // ✅ Se obtienen los datos del usuario y el estado de carga del contexto
  const { user, isLoading } = useAuth();

  // ✅ Se obtiene el ícono del nivel actual del usuario
  const userLevel = user?.gamification?.level || 1;
  const LevelIcon: ElementType = 
    gamificationLevels.find(l => l.level === userLevel)?.icon || Award;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo de Monedas Verdes
            </CardTitle>
            <Leaf className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {/* ✅ Se muestran las monedas verdes reales del usuario */}
            <div className="text-4xl font-bold text-primary">{user?.greenCoins || 0} MV</div>
            <p className="text-xs text-muted-foreground">+0 MV desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mi Impacto</CardTitle>
            <Recycle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120 kg</div>
            <p className="text-xs text-muted-foreground">
              CO2 ahorrado este mes
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mi Nivel</CardTitle>
            {/* ✅ Se muestra el ícono del nivel del usuario */}
            <LevelIcon className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            {/* ✅ Se muestran el título y el nivel reales del usuario */}
            <div className="text-2xl font-bold">{user?.gamification?.title || 'Principiante'}</div>
            <p className="text-xs text-muted-foreground">Nivel {user?.gamification?.level || 1}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navegación Rápida</CardTitle>
          <CardDescription>
            Accede a las principales secciones de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-2 rounded-lg border p-4 text-left transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-6 w-6 text-primary" />
                <h3 className="text-base font-semibold">{link.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <CardTitle>Desafíos Activos</CardTitle>
            </div>
            <CardDescription>
              Completa desafíos para ganar Monedas Verdes extra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <challenge.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{challenge.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-primary font-bold">
                  {challenge.progress}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle>Actividad Reciente</CardTitle>
            </div>
            <CardDescription>
              Un registro de tus últimas acciones sostenibles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acción</TableHead>
                  <TableHead className="text-right">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {activity.icon}
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        activity.points.startsWith('+')
                          ? 'text-primary'
                          : 'text-destructive'
                      }`}
                    >
                      {activity.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
