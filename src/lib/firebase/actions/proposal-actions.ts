// src/lib/firebase/actions/proposal-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

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
