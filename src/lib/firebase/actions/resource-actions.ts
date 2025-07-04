// src/lib/firebase/actions/resource-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { type SaveResourceInput, SaveResourceInputSchema } from '@/ai/flows/schemas';

type SaveResourceWithUser = SaveResourceInput & { userId: string };

type SavedResourceSerializable = SaveResourceInput & { id: string; userId: string; createdAt: string | null };

/**
 * Saves a resource to the 'resources' collection in Firestore.
 */
export async function saveResource(resourceData: SaveResourceWithUser): Promise<{ success: boolean, id?: string, error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar el recurso.";
    console.error(message);
    return { success: false, error: message };
  }
   if (!resourceData.userId) {
    return { success: false, error: "Se requiere un ID de usuario para guardar el recurso." };
  }

  try {
    // We can't validate userId with the existing schema, so we separate it.
    const { userId, ...restOfData } = resourceData;
    const validatedData = SaveResourceInputSchema.parse(restOfData);
    
    const docRef = await addDoc(collection(firestore, 'resources'), {
      ...validatedData,
      userId,
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
 * Fetches saved resources for a specific user.
 */
export async function getSavedResources(userId: string): Promise<{ success: boolean, data?: SavedResourceSerializable[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener los recursos.";
    console.error(message);
    return { success: false, error: message };
  }
   if (!userId) {
    return { success: false, error: "Se requiere un ID de usuario para obtener los recursos." };
  }

  try {
    const resourcesCollection = collection(firestore, 'resources');
    const resourcesQuery = query(
        resourcesCollection,
        where('userId', '==', userId), // Filter by userId
        orderBy('createdAt', 'desc')
    );
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

  } catch (e: any) e) {
    console.error("Error al obtener los recursos de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener los recursos.' };
  }
}
