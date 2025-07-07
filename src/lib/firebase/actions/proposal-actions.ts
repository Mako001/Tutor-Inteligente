// src/lib/firebase/actions/proposal-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ProposalData {
  title: string;
  content: string; // Markdown content
}

export async function saveProposalToLibrary(
  userId: string,
  proposalData: ProposalData
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar la propuesta.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!userId) {
    return { success: false, error: "Se requiere un ID de usuario para guardar la propuesta." };
  }
  if (!proposalData || !proposalData.title || !proposalData.content) {
    return { success: false, error: "Faltan datos de la propuesta (título o contenido)." };
  }

  try {
    const dataToSave = {
      userId,
      title: proposalData.title,
      content: proposalData.content,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, 'proposals'), dataToSave);
    console.log("Propuesta guardada en Firebase con ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e: any) {
    console.error("Error al guardar la propuesta en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al guardar.' };
  }
}
