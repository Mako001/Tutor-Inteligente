// src/lib/firebase/actions/plan-schemas.ts
// This file does NOT have 'use server' and can be safely imported by clients and servers.

// Based on PlanFormData from plans/create/page.tsx and the data stored in Firestore
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
