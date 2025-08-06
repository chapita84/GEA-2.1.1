import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { app } from './firebase-client';
import { User } from '@/models/user_model';

const db = getFirestore(app);
const usersCollection = collection(db, 'users');

// ... (tus funciones getAllUsers, getUserByEmail, createUser, etc. se mantienen igual) ...

export async function getAllUsers(): Promise<User[]> {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as User));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Error al obtener el usuario por email: ", error);
    return null;
  }
}

export async function createUser(user: User) {
  const userRef = doc(usersCollection, user.uid);
  const { uid, ...userData } = user;
  await setDoc(userRef, userData);
}

export async function updateUser(uid: string, data: Partial<User>) {
  const userRef = doc(usersCollection, uid);
  await updateDoc(userRef, data);
}

// ✅ NUEVA FUNCIÓN: Actualiza únicamente la contraseña de un usuario.
export async function updateUserPassword(uid: string, newPassword: string): Promise<void> {
  try {
    const userRef = doc(usersCollection, uid);
    await updateDoc(userRef, { password: newPassword });
  } catch (error) {
    console.error("Error al actualizar la contraseña: ", error);
    throw error;
  }
}

export async function deleteUser(uid: string) {
  const userRef = doc(usersCollection, uid);
  await deleteDoc(userRef);
}

export const uploadProfileImage = async ({ userId, file }: { userId: string; file: File }): Promise<string> => {
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
      const maxWidth = 200;
      const maxHeight = 200;
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
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error("Error al cargar la imagen para procesarla."));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
