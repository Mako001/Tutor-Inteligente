// src/lib/firebase/actions/proposal-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';

// Based on the FormData from /create/page.tsx
export interface SavedProposal {
  id: string;
  userId: string; // Add userId
  subject: string;
  grade: string;
  centralTheme: string;
  textoGenerado: string;
  timestamp: string | null;
  [key: string]: any;
}

export async function saveProposal(proposalData: Omit<SavedProposal, 'id' | 'timestamp'>): Promise<{ success: boolean, id?: string, error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar la propuesta.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!proposalData.userId) {
    return { success: false, error: "Se requiere un ID de usuario para guardar la propuesta." };
  }
  try {
    const dataToSave = {
      ...proposalData,
      timestamp: serverTimestamp(),
    };
    const docRef = await addDoc(collection(firestore, 'propuestas'), dataToSave);
    console.log("Propuesta guardada en Firebase con ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e: any) {
    console.error("Error al guardar la propuesta en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al guardar.' };
  }
}

export async function getSavedProposals(userId: string): Promise<{ success: boolean, data?: SavedProposal[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener las propuestas.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!userId) {
    return { success: false, error: "Se requiere un ID de usuario para obtener las propuestas." };
  }

  try {
    const proposalsCollection = collection(firestore, 'propuestas');
    const proposalsQuery = query(
      proposalsCollection,
      where('userId', '==', userId), // Filter by userId
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(proposalsQuery);
    
    const proposals = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        ...data,
        timestamp: timestamp ? timestamp.toDate().toISOString() : null,
      }
    }) as SavedProposal[];

    return { success: true, data: proposals };

  } catch (e: any) {
    console.error("Error al obtener las propuestas de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener las propuestas.' };
  }
}

export async function deleteProposal(id: string): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede eliminar la propuesta.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de propuesta no proporcionado.' };
  }
  try {
    const proposalDocRef = doc(firestore, 'propuestas', id);
    await deleteDoc(proposalDocRef);
    return { success: true };
  } catch (e: any) {
    console.error("Error al eliminar la propuesta de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al eliminar la propuesta.' };
  }
}

export async function updateProposal(id: string, data: { textoGenerado: string }): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede actualizar la propuesta.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de propuesta no proporcionado.' };
  }
  try {
    const proposalDocRef = doc(firestore, 'propuestas', id);
    await updateDoc(proposalDocRef, data);
    return { success: true };
  } catch (e: any) {
    console.error("Error al actualizar la propuesta en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al actualizar la propuesta.' };
  }
}
