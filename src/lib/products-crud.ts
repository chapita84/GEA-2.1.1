import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { app } from './firebase-client';
import { Product } from '@/models/product_model';

const db = getFirestore(app);
const productsCollection = collection(db, 'products');

export async function getAllProducts(): Promise<Product[]> {
  const q = query(productsCollection, orderBy('coinsRequired'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function createProduct(data: Omit<Product, 'id'>) {
  await addDoc(productsCollection, data);
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const productRef = doc(productsCollection, id);
  await updateDoc(productRef, data);
}

export async function deleteProduct(id: string) {
  const productRef = doc(productsCollection, id);
  await deleteDoc(productRef);
}

/**
 * Sube y procesa una imagen para un producto, comprimiéndola y convirtiéndola a Base64
 * @param file - El archivo de imagen a procesar
 * @returns Promise<string> - La imagen procesada como Data URL (Base64)
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo para subir.");
  }
  if (!file.type.startsWith('image/')) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error("No se pudo crear el contexto del canvas para procesar la imagen."));
      return;
    }

    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 300;
      let { width, height } = img;
      
      // Mantener proporción de aspecto
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
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error("Error al cargar la imagen para procesarla."));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
