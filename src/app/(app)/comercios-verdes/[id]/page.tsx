'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getComercioById } from '@/lib/comercios-verdes-crud';
import { ComercioVerdeConId } from '@/models/comercio_verde_model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { GoogleMap, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  height: '315px',
  width: '70%',
  borderRadius: '0.5rem',
};

export default function ComercioDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [comercio, setComercio] = useState<ComercioVerdeConId | null>(null);

  // Removed useJsApiLoader since LoadScript is handled in layout.tsx

  useEffect(() => {
    if (typeof id === 'string') {
      getComercioById(id).then(setComercio);
    }
  }, [id]);

  if (!comercio) return <div>Cargando...</div>;

  // Obtener coordenadas si existen
  let center = null;
  if (
    comercio.location &&
    typeof comercio.location.latitude === 'number' &&
    typeof comercio.location.longitude === 'number'
  ) {
    center = {
      lat: comercio.location.latitude,
      lng: comercio.location.longitude,
    };
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a la lista
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>{comercio.name}</CardTitle>
            <Badge variant="secondary">{comercio.rubro}</Badge> {/* Cambiado de category a rubro */}
            <div className="flex flex-wrap gap-2 mt-2">
              {comercio.tags && comercio.tags.map((tag, i) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Image
            src={comercio.imageUrl || '/placeholder.svg'}
            alt={`Imagen de ${comercio.name}`}
            width={200}
            height={100}
            className="rounded-lg mb-4"
          />
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-5 w-5" />
            <span>{comercio.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Phone className="h-5 w-5" />
            <span>{comercio.phone}</span>
          </div>
          <p className="mb-4">{comercio.description}</p>
          {center ? (
            <div className="mt-4">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
              >
                <Marker position={center} />
              </GoogleMap>
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              Ubicación no disponible.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}