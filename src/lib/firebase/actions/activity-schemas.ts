// src/lib/firebase/actions/activity-schemas.ts
// This file does NOT have 'use server' and can be safely imported by clients and servers.

// Based on the FormData from /activities/create/page.tsx and the data stored in Firestore
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
