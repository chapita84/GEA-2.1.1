import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'; // ✅ Se añade getDocs a la importación
import { app } from './firebase-client';
import { Client } from '@/models/client_model';

const db = getFirestore(app);
const clientsCollection = collection(db, 'clients');

export async function createClient(client: Client) {
  const clientRef = doc(clientsCollection, client.usuarioUid); // usa el uid del usuario
  await setDoc(clientRef, client);
}

export async function getClientByUserUid(uid: string) {
  const clientRef = doc(clientsCollection, uid);
  const snapshot = await getDoc(clientRef);
  return snapshot.exists() ? snapshot.data() as Client : null;
}

// ✅ Función corregida que faltaba
export async function getAllClients(): Promise<Client[]> {
  const snapshot = await getDocs(clientsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
}

export async function updateClient(uid: string, data: Partial<Client>) {
  const clientRef = doc(clientsCollection, uid);
  await updateDoc(clientRef, data);
}

export async function deleteClient(uid: string) {
  const clientRef = doc(clientsCollection, uid);
  await deleteDoc(clientRef);
}
