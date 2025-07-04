// src/lib/firebase/actions/activity-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';

// Based on the FormData from /activities/create/page.tsx
export interface SavedActivity {
  id: string;
  userId: string;
  subject: string;
  grade: string;
  learningObjective: string; // Used as the primary identifier/title
  textoGenerado: string;
  timestamp: string | null;
  [key: string]: any;
}

export async function saveActivity(activityData: Omit<SavedActivity, 'id' | 'timestamp'>): Promise<{ success: boolean, id?: string, error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar la actividad.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!activityData.userId) {
    return { success: false, error: "Se requiere un ID de usuario para guardar la actividad." };
  }
  try {
    const dataToSave = {
      ...activityData,
      timestamp: serverTimestamp(),
    };
    const docRef = await addDoc(collection(firestore, 'activities'), dataToSave);
    console.log("Actividad guardada en Firebase con ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e: any) {
    console.error("Error al guardar la actividad en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al guardar.' };
  }
}

export async function getSavedActivities(userId: string): Promise<{ success: boolean, data?: SavedActivity[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener las actividades.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!userId) {
    return { success: false, error: "Se requiere un ID de usuario para obtener las actividades." };
  }

  try {
    const activitiesCollection = collection(firestore, 'activities');
    const activitiesQuery = query(
      activitiesCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(activitiesQuery);
    
    const activities = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        ...data,
        timestamp: timestamp ? timestamp.toDate().toISOString() : null,
      }
    }) as SavedActivity[];

    return { success: true, data: activities };

  } catch (e: any) {
    console.error("Error al obtener las actividades de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener las actividades.' };
  }
}

export async function deleteActivity(id: string): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede eliminar la actividad.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de actividad no proporcionado.' };
  }
  try {
    const activityDocRef = doc(firestore, 'activities', id);
    await deleteDoc(activityDocRef);
    return { success: true };
  } catch (e: any) {
    console.error("Error al eliminar la actividad de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al eliminar la actividad.' };
  }
}

export async function updateActivity(id: string, data: { textoGenerado: string }): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede actualizar la actividad.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de actividad no proporcionado.' };
  }
  try {
    const activityDocRef = doc(firestore, 'activities', id);
    await updateDoc(activityDocRef, data);
    return { success: true };
  } catch (e: any) {
    console.error("Error al actualizar la actividad en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al actualizar la actividad.' };
  }
}
