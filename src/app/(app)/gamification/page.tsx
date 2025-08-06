'use client';

import { useAuth } from '@/context/AuthContext';
import { gamificationLevels } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ElementType } from 'react';

export default function GamificationPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userLevel = user?.gamification?.level || 1;

  const renderIcon = (iconName: string, color: string, isCurrent: boolean) => {
    const IconComponent = (LucideIcons as any)[iconName] as ElementType;
    if (!IconComponent) return null;
    
    const colorClass = isCurrent ? 'text-primary-foreground' : color;
    return <IconComponent className={cn("h-5 w-5", colorClass)} />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Niveles de Gamificación de GEA
          </CardTitle>
          <CardDescription>
            Acumula Monedas Verdes con tus acciones sostenibles para subir de nivel y desbloquear nuevos títulos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            {/* Línea de tiempo vertical */}
            <div className="absolute left-[35px] top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>

            <div className="space-y-8">
              {gamificationLevels.map((level) => {
                const isCompleted = userLevel > level.level;
                const isCurrent = userLevel === level.level;

                return (
                  <div key={level.level} className="relative flex items-start gap-6">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full z-10",
                      isCompleted ? "bg-green-500" :
                      isCurrent ? "bg-primary animate-pulse" :
                      "bg-muted border-2 border-dashed"
                    )}>
                      {renderIcon(level.icon, level.color, isCurrent)}
                    </div>
                    <div className={cn(
                      "flex-1 pt-1.5 transition-opacity",
                      !isCompleted && !isCurrent && "opacity-50"
                    )}>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Nivel {level.level}
                      </p>
                      <h3 className="text-lg font-bold font-headline">
                        {level.title}
                      </h3>
                      <p className={cn("text-sm font-semibold", level.color)}>
                        {level.minPoints} Monedas Verdes
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
