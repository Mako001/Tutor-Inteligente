// src/lib/firebase/actions/resource-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { type SaveResourceInput, SaveResourceInputSchema } from '@/ai/flows/schemas';

type SavedResourceWithTimestamp = SaveResourceInput & { id: string; createdAt: any };
type SavedResourceSerializable = SaveResourceInput & { id: string; createdAt: string | null };

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
export async function getSavedResources(): Promise<{ success: boolean, data?: SavedResourceSerializable[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener los recursos.";
    console.error(message);
    return { success: false, error: message };
  }

  try {
    const resourcesCollection = collection(firestore, 'resources');
    const resourcesQuery = query(resourcesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(resourcesQuery);
    
    const resources = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp | undefined;
      return {
        id: doc.id,
        ...data,
        createdAt: createdAt ? createdAt.toDate().toISOString() : null,
      }
    }) as SavedResourceSerializable[];

    return { success: true, data: resources };

  } catch (e: any) {
    console.error("Error al obtener los recursos de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener los recursos.' };
  }
}
