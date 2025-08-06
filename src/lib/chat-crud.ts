import { doc, getDoc, setDoc } from 'firebase/firestore';
// Asegúrate de que esta ruta a tu configuración de cliente de Firebase sea correcta
import { db } from './firebase-client'; 

// Este tipo debe ser idéntico al que usas en tu ChatInterface
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

/**
 * Obtiene la referencia a un único documento que contendrá todo el historial
 * de chat de un usuario. La ruta será: users/{userId}/chatHistory/conversation
 * @param {string} userId - El ID del usuario.
 * @returns La referencia al documento de Firestore.
 */
const getChatHistoryRef = (userId: string) => 
  doc(db, 'users', userId, 'chatHistory', 'conversation');

/**
 * Recupera el historial de mensajes para un usuario específico desde Firestore.
 * @param {string} userId - El ID del usuario.
 * @returns Una promesa que se resuelve con el array de mensajes.
 */
export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) return []; // No hacer nada si no hay usuario
  try {
    const docRef = getChatHistoryRef(userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Los mensajes se guardan en un campo llamado 'messages' dentro del documento
      return docSnap.data().messages || [];
    }
    return []; // Devuelve un array vacío si no hay historial previo
  } catch (error) {
    console.error("Error al obtener el historial del chat:", error);
    return [];
  }
}

/**
 * Guarda el historial de mensajes completo para un usuario específico en Firestore.
 * @param {string} userId - El ID del usuario.
 * @param {Message[]} messages - El array completo de mensajes a guardar.
 */
export async function saveChatHistory(userId: string, messages: Message[]): Promise<void> {
  if (!userId) return; // No hacer nada si no hay usuario
  try {
    const docRef = getChatHistoryRef(userId);
    // Guardamos (o sobrescribimos) el documento con el historial actualizado.
    await setDoc(docRef, { messages });
  } catch (error) {
    console.error("Error al guardar el historial del chat:", error);
  }
}
