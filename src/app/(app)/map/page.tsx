'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Marker, useJsApiLoader } from '@react-google-maps/api';
import {
  GoogleMap,
  MarkerF,
  InfoWindowF, // 👈 1. Importa el componente InfoWindowF
  useLoadScript,
} from "@react-google-maps/api";
import { getAllComerciosMap } from '@/lib/comercios-verdes-crud';

type ComercioVerde = {
  id: string;
  nombre: string;
  ubicacion?: {
    lat: number;
    lng: number;
  };
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: -34.6037,
  lng: -58.3816,
};

export default function MapPage() {
  const [comercios, setComercios] = useState<ComercioVerde[]>([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  const [selectedComercio, setSelectedComercio] = useState<ComercioVerde | null>(null);

  useEffect(() => {
    const fetchComercios = async () => {
      try {
        const data = await getAllComerciosMap();
        console.log('Comercios recibidos:', data);
        setComercios(
          data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre ?? '',
            ubicacion: item.ubicacion

          }))
        );
      } catch (err) {
        console.error('Error al obtener comercios:', err);
        setComercios([]);
      }
    };
    fetchComercios();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Mapa Sostenible
        </h1>
        <p className="text-muted-foreground">
          Descubre y apoya a vendedores ecológicos cerca de ti.
        </p>
      </header>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
            >
              {comercios.length === 0 && (
                <Marker
                  position={center}
                  icon={{
                    url: '/logoBig.png',
                    scaledSize: new window.google.maps.Size(45, 45),
                  }}
                  title="Ejemplo GEA"
                />
              )}
              {comercios.map((comercio) =>
                comercio.ubicacion &&
                typeof comercio.ubicacion.lat === 'number' &&
                typeof comercio.ubicacion.lng === 'number' ? (
                  <Marker
                    key={comercio.id}
                    position={{
                      lat: comercio.ubicacion.lat,
                      lng: comercio.ubicacion.lng,
                    }}
                    icon={{
                      url: '/logoBig.png',
                      scaledSize: new window.google.maps.Size(45, 45),
                    }}
                    title={comercio.nombre}
                  />
                ) : (
                  (() => {
                    console.warn('Comercio sin ubicación válida:', comercio);
                    return null;
                  })()
                )
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full">
              Cargando mapa...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}