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
import { GamificationLevel } from '@/models/gamification_model';

const db = getFirestore(app);
const gamificationCollection = collection(db, 'gamification_levels');

/**
 * Obtiene todos los niveles de gamificación de la base de datos, ordenados por nivel.
 * @returns Un array con todos los niveles.
 */
export async function getAllLevels(): Promise<GamificationLevel[]> {
  const q = query(gamificationCollection, orderBy('level'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GamificationLevel));
}

/**
 * Crea un nuevo nivel de gamificación.
 * @param {Omit<GamificationLevel, 'id'>} levelData - Los datos del nivel a crear.
 */
export async function createLevel(levelData: Omit<GamificationLevel, 'id'>) {
  await addDoc(gamificationCollection, levelData);
}

/**
 * Actualiza los datos de un nivel de gamificación.
 * @param {string} id - El ID del documento del nivel.
 * @param {Partial<GamificationLevel>} data - Un objeto con los campos a actualizar.
 */
export async function updateLevel(id: string, data: Partial<GamificationLevel>) {
  const levelRef = doc(gamificationCollection, id);
  await updateDoc(levelRef, data);
}

/**
 * Elimina un nivel de gamificación.
 * @param {string} id - El ID del documento del nivel a eliminar.
 */
export async function deleteLevel(id: string) {
  const levelRef = doc(gamificationCollection, id);
  await deleteDoc(levelRef);
}
