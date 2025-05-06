// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
// Importa otros servicios de Firebase si los necesitas (Auth, Storage, etc.)
// import { getAuth, Auth } from 'firebase/auth';

import { getFirebaseConfig } from './config';

let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
// let auth: Auth | undefined;

const config = getFirebaseConfig();

// Solo inicializa si la configuración es válida (projectId está presente y no es el placeholder)
// La validación más robusta ya ocurrió en getFirebaseConfig()
if (config.projectId && config.projectId !== 'YOUR_PROJECT_ID_HERE' && config.apiKey) { // Added apiKey check as it's crucial
  if (!getApps().length) {
    try {
      // Type assertion for config, assuming measurementId is optional
      firebaseApp = initializeApp(config as any);
      console.log('Firebase App initialized successfully on the client/server.');
    } catch (error) {
      console.error('Error initializing Firebase app:', error);
      // Considera cómo manejar este error en la UI si la app no puede funcionar sin Firebase
    }
  } else {
    firebaseApp = getApp(); // Use getApp() instead of getApps()[0]
    console.log('Firebase App already initialized.');
  }

  if (firebaseApp) {
    try {
      firestore = getFirestore(firebaseApp);
      // auth = getAuth(firebaseApp); // Uncomment if you need auth
      console.log('Firestore (and other services) initialized.');
    } catch (error) {
      console.error('Error initializing Firebase services (Firestore, Auth, etc.):', error);
    }
  }
} else {
  console.error("CLIENT_SIDE_ERROR: Firebase config not valid, projectId is a placeholder, or apiKey is missing. Firebase services won't be initialized.");
}

export { firebaseApp, firestore /*, auth */ };
