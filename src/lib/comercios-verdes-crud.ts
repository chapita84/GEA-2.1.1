import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  GeoPoint,
} from 'firebase/firestore';
import { db } from './firebase-client';
import { ComercioVerde, ComercioVerdeConId, ComercioVerdeMap, ComercioVerdeConIdMap } from '@/models/comercio_verde_model';

const COMERCIOS_COLLECTION = 'comercios_verdes';
const comerciosCollection = collection(db, COMERCIOS_COLLECTION);

/**
 * Convierte una imagen a Base64 comprimida.
 * (Esta es tu función existente, sin cambios)
 */
export const uploadCommerceImage = async (file: File, commerceId: string): Promise<string> => {
  if (!file) throw new Error("No se proporcionó ningún archivo para subir.");
  if (!commerceId) throw new Error("Se requiere un ID de comercio para subir la imagen.");
  if (!file.type.startsWith('image/')) throw new Error("El archivo seleccionado no es una imagen válida.");

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return reject(new Error("No se pudo crear el contexto del canvas."));

    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 400;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      const maxFirestoreSize = 800 * 1024;
      if (compressedDataUrl.length > maxFirestoreSize) {
        const smallerDataUrl = canvas.toDataURL('image/jpeg', 0.4);
        if (smallerDataUrl.length > maxFirestoreSize) {
          return reject(new Error("La imagen es demasiado grande incluso después de la compresión."));
        }
        resolve(smallerDataUrl);
      } else {
        resolve(compressedDataUrl);
      }
    };
    
    img.onerror = () => reject(new Error("Error al cargar la imagen para procesarla."));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Obtiene todos los comercios de la colección, incluyendo su ID.
 * CORREGIDO: Devuelve el tipo ComercioVerdeConId.
 */
export async function getAllComercios(): Promise<ComercioVerdeConId[]> {
  const snapshot = await getDocs(comerciosCollection);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as ComercioVerdeConId)
  );
}

/**
 * Obtiene un único comercio por su ID.
 * CORREGIDO: Devuelve el tipo ComercioVerdeConId.
 */
export async function getComercioById(id: string): Promise<ComercioVerdeConId | null> {
  const docRef = doc(db, COMERCIOS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ComercioVerdeConId;
  } else {
    console.log("No se encontró el documento del comercio.");
    return null;
  }
}


export async function getAllComerciosMap(): Promise<ComercioVerdeConIdMap[]> {
//const snapshot = await getDocs(collection(db, "comercio-verde"));
  const snapshot = await getDocs(comerciosCollection);
  const comercios = snapshot.docs.map(doc => {
    const data = doc.data();
    // Hacemos la transformación aquí
    const ubicacion = data.location instanceof GeoPoint
      ? { lat: data.location.latitude, lng: data.location.longitude }
      : null;

    // Asegúrate de mapear todos los campos requeridos por ComercioVerdeConIdMap
    return {
      id: doc.id,
      name: data.nombre, // Ajusta si el modelo espera 'name' en vez de 'nombre'
      address: data.address || '',
      phone: data.phone || '',
      description: data.description || '',
      rubro: data.rubro || data.category || '', // Cambiado de category a rubro, con fallback para compatibilidad
      image: data.image || '',
      ubicacion, // puede ser null si no hay location
      imageUrl: data.imageUrl || data.image || '', // Ajusta según tu modelo
      tags: data.tags || [],
    };
  }).filter(comercio => comercio.ubicacion !== null); // Filtramos de inmediato los que no tienen ubicación

  return comercios as ComercioVerdeConIdMap[];
}


/**
 * Crea un nuevo comercio, convirtiendo lat/lng a un GeoPoint.
 */
export const createComercioVerde = async (
  data: Omit<ComercioVerde, 'id' | 'location'> & { latitude: number; longitude: number }
): Promise<string> => {
  const { latitude, longitude, ...restOfData } = data;
  const location = new GeoPoint(latitude, longitude);
  
  const docRef = await addDoc(comerciosCollection, {
    ...restOfData,
    location,
  });
  return docRef.id;
};

/**
 * Actualiza un comercio, convirtiendo lat/lng a un GeoPoint si se proporcionan.
 */
export const updateComercioVerde = async (
  id: string,
  data: Partial<Omit<ComercioVerde, 'id' | 'location'>> & { latitude?: number; longitude?: number }
): Promise<void> => {
  const comercioRef = doc(db, COMERCIOS_COLLECTION, id);
  const { latitude, longitude, ...restOfData } = data;
  
  const dataToUpdate: { [key: string]: any } = { ...restOfData };

  if (latitude !== undefined && longitude !== undefined) {
      dataToUpdate.location = new GeoPoint(latitude, longitude);
  }

  await updateDoc(comercioRef, dataToUpdate);
};

/**
 * Elimina un comercio.
 * (Sin cambios)
 */
export const deleteComercioVerde = async (id: string): Promise<void> => {
  const comercioRef = doc(db, COMERCIOS_COLLECTION, id);
  await deleteDoc(comercioRef);
};