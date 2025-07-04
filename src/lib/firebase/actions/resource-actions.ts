// src/lib/firebase/actions/resource-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { type SaveResourceInput, SaveResourceInputSchema } from '@/ai/flows/schemas';

/**
 * Saves a resource to the 'resources' collection in Firestore.
 * Note: In a real app, you'd associate these with a userId.
 */
export async function saveResource(resourceData: SaveResourceInput): Promise<{ success: boolean, id?: string, error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar el recurso.";
    console.error(message);
    return { success: false, error: message };
  }

  try {
    const validatedData = SaveResourceInputSchema.parse(resourceData);
    
    const docRef = await addDoc(collection(firestore, 'resources'), {
      ...validatedData,
      createdAt: serverTimestamp(),
    });

    console.log("Recurso guardado en Firebase con ID: ", docRef.id);
    return { success: true, id: docRef.id };

  } catch (e: any) {
    console.error("Error al guardar el recurso en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al guardar.' };
  }
}

/**
 * Fetches all saved resources from the 'resources' collection in Firestore, ordered by creation date.
 */
export async function getSavedResources(): Promise<{ success: boolean, data?: (SaveResourceInput & { id: string })[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener los recursos.";
    console.error(message);
    return { success: false, error: message };
  }

  try {
    const resourcesCollection = collection(firestore, 'resources');
    const resourcesQuery = query(resourcesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(resourcesQuery);
    
    const resources = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (SaveResourceInput & { id: string; createdAt: any })[];

    return { success: true, data: resources };

  } catch (e: any) {
    console.error("Error al obtener los recursos de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener los recursos.' };
  }
}
