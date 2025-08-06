'use client'; // Necesario para usar el hook useRouter

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComercioVerdeConId } from '@/models/comercio_verde_model';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Importar useRouter

interface ComercioCardProps {
  comercio: ComercioVerdeConId;
}

export function ComercioCard({ comercio }: ComercioCardProps) {
  const router = useRouter(); // Obtener la instancia del router

  const handleVerMasClick = () => {
    const url = `/comercios-verdes/${comercio.id}`;
    console.log('Redirigiendo a:', url);
    router.push(`/comercios-verdes/${comercio.id}`);
  }
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={comercio.imageUrl || '/placeholder.svg'}
            alt={`Imagen de ${comercio.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{comercio.category}</Badge>
        <CardTitle className="text-xl font-bold">{comercio.name}</CardTitle>
        <CardDescription className="mt-2 text-sm">{comercio.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{comercio.address}</span>
        </div>
        {/* CORRECCIÓN: Usar un manejador de clic con router.push */}
        <Button variant="outline" size="sm" onClick={handleVerMasClick}>
          Ver Más
        </Button>
      </CardFooter>
    </Card>
  );
}