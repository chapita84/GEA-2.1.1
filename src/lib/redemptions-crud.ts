import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { app } from './firebase-client';
import { Redemption } from '@/models/redemption_model';

const db = getFirestore(app);
const redemptionsCollection = collection(db, 'redemptions');

/**
 * Obtiene el historial de canjes de un usuario específico.
 * @param {string} userId - El UID del usuario.
 * @returns Un array con el historial de canjes.
 */
export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  const q = query(
    redemptionsCollection,
    where('userId', '==', userId),
    orderBy('redeemedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redemption));
}
