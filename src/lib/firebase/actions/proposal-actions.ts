// src/lib/firebase/actions/proposal-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// Based on the FormData from /create/page.tsx
export interface SavedProposal {
  id: string;
  subject: string;
  grade: string;
  centralTheme: string;
  textoGenerado: string;
  timestamp: any; // Firestore timestamp object
  [key: string]: any; // Allow other properties
}

export async function getSavedProposals(): Promise<{ success: boolean, data?: SavedProposal[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener las propuestas.";
    console.error(message);
    return { success: false, error: message };
  }

  try {
    const proposalsCollection = collection(firestore, 'propuestas');
    const proposalsQuery = query(proposalsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(proposalsQuery);
    
    const proposals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SavedProposal[];

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
