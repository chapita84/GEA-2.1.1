import { GeoPoint } from 'firebase/firestore';

export interface ComercioVerde {
  id?: string; // ✅ ASEGÚRATE DE QUE ESTA LÍNEA EXISTA
  name: string;
  address: string;
  phone: string;
  description: string;
  imageUrl: string;
  tags: string[];
  rubro: string; // Cambiado de category a rubro
  location: GeoPoint;
  isSustainable?: boolean;
  cuit?: string; // ✅ Se añade el campo CUIT (opcional)
}

export interface ComercioVerdeMap {
  id?: string; // ✅ ASEGÚRATE DE QUE ESTA LÍNEA EXISTA
  name: string;
  address: string;
  phone: string;
  description: string;
  imageUrl: string;
  tags: string[];
  rubro: string; // Cambiado de category a rubro
    ubicacion: { // Lo transformamos a un objeto {lat, lng}
    lat: number;
    lng: number;
  };
  isSustainable?: boolean;
  cuit?: string; // ✅ Se añade el campo CUIT (opcional)
}

export interface ComercioVerdeConId extends ComercioVerde {
  id: string;
}

export interface ComercioVerdeConIdMap extends ComercioVerdeMap {
  id: string;
}