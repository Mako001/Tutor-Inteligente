// src/lib/firebase/actions/plan-actions.ts
'use server';

import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, where, addDoc, serverTimestamp } from 'firebase/firestore';

// Based on PlanFormData from plans/create/page.tsx
export interface SavedPlan {
  id: string;
  userId: string;
  planTitle: string;
  subject: string;
  grade: string;
  textoGenerado: string;
  timestamp: string | null;
  [key: string]: any;
}

export async function savePlan(planData: Omit<SavedPlan, 'id' | 'timestamp'>): Promise<{ success: boolean, id?: string, error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede guardar el plan.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!planData.userId) {
    return { success: false, error: "Se requiere un ID de usuario para guardar el plan." };
  }
  try {
    const dataToSave = {
      ...planData,
      timestamp: serverTimestamp(),
    };
    const docRef = await addDoc(collection(firestore, 'plans'), dataToSave);
    console.log("Plan guardado en Firebase con ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e: any) {
    console.error("Error al guardar el plan en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al guardar.' };
  }
}

export async function getSavedPlans(userId: string): Promise<{ success: boolean, data?: SavedPlan[], error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se pueden obtener los planes.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!userId) {
    return { success: false, error: "Se requiere un ID de usuario para obtener los planes." };
  }

  try {
    const plansCollection = collection(firestore, 'plans');
    const plansQuery = query(
      plansCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(plansQuery);
    
    const plans = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        ...data,
        timestamp: timestamp ? timestamp.toDate().toISOString() : null,
      }
    }) as SavedPlan[];

    return { success: true, data: plans };

  } catch (e: any) {
    console.error("Error al obtener los planes de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al obtener los planes.' };
  }
}

export async function deletePlan(id: string): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede eliminar el plan.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de plan no proporcionado.' };
  }
  try {
    const planDocRef = doc(firestore, 'plans', id);
    await deleteDoc(planDocRef);
    return { success: true };
  } catch (e: any) {
    console.error("Error al eliminar el plan de Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al eliminar el plan.' };
  }
}

export async function updatePlan(id: string, data: { textoGenerado: string }): Promise<{ success: boolean; error?: string }> {
  if (!firestore) {
    const message = "Firestore no está inicializado. No se puede actualizar el plan.";
    console.error(message);
    return { success: false, error: message };
  }
  if (!id) {
    return { success: false, error: 'ID de plan no proporcionado.' };
  }
  try {
    const planDocRef = doc(firestore, 'plans', id);
    await updateDoc(planDocRef, data);
    return { success: true };
  } catch (e: any) {
    console.error("Error al actualizar el plan en Firebase: ", e);
    return { success: false, error: e.message || 'Error desconocido al actualizar el plan.' };
  }
}
