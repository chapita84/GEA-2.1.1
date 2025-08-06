import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase-client';
import { Record } from '@/models/record_model';

const RECORDS_COLLECTION = 'records';
const recordsCollection = collection(db, RECORDS_COLLECTION);

export async function getAllRecords(): Promise<Record[]> {
  const snapshot = await getDocs(recordsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record));
}

export async function getRecordById(id: string): Promise<Record | null> {
  const docRef = doc(db, RECORDS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Record : null;
}

export async function createRecord(data: Omit<Record, 'id'>): Promise<string> {
  const docRef = await addDoc(recordsCollection, data);
  return docRef.id;
}

export async function updateRecord(id: string, data: Partial<Omit<Record, 'id'>>): Promise<void> {
  const recordRef = doc(db, RECORDS_COLLECTION, id);
  await updateDoc(recordRef, data);
}

export async function deleteRecord(id: string): Promise<void> {
  const recordRef = doc(db, RECORDS_COLLECTION, id);
  await deleteDoc(recordRef);
}