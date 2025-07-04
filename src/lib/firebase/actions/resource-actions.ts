// src/lib/firebase/actions/resource-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

// Define la estructura de un recurso para claridad
export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: Timestamp;
}

/**
 * Guarda un nuevo recurso en la biblioteca de un usuario específico.
 */
export async function saveResourceToLibrary(
  userId: string,
  resourceData: { title: string; url: string; description: string; tags: string[] }
) {
  if (!firestore) {
    throw new Error("Firestore no está inicializado.");
  }
  if (!userId) {
    throw new Error('Se requiere un ID de usuario para guardar el recurso.');
  }

  try {
    const resourceToSave = {
      ...resourceData,
      userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, 'resources'), resourceToSave);
    console.log('Recurso guardado con ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (e: any) {
    console.error('Error al guardar el recurso en Firestore:', e);
    throw new Error(`Error al guardar: ${e.message}`);
  }
}

/**
 * Obtiene todos los recursos de la biblioteca para un usuario específico.
 */
export async function getUserLibrary(userId: string): Promise<Resource[]> {
  if (!firestore) {
    throw new Error("Firestore no está inicializado.");
  }
  if (!userId) {
    console.log('No se proporcionó ID de usuario, devolviendo biblioteca vacía.');
    return [];
  }

  try {
    const resourcesCol = collection(firestore, 'resources');
    const q = query(resourcesCol, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const library: Resource[] = [];
    querySnapshot.forEach(doc => {
      library.push({ id: doc.id, ...doc.data() } as Resource);
    });

    console.log(`Se encontraron ${library.length} recursos para el usuario ${userId}`);
    return library;
  } catch (e: any) {
    console.error('Error al obtener la biblioteca del usuario:', e);
    throw new Error(`Error al leer la biblioteca: ${e.message}`);
  }
}
