// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth'; // Import getAuth and Auth

import { getFirebaseConfig } from './config';

let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined; // Define auth

const config = getFirebaseConfig();

if (config.projectId && config.projectId !== 'YOUR_PROJECT_ID_HERE' && config.apiKey) {
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(config as any);
      console.log('Firebase App initialized successfully on the client/server.');
    } catch (error) {
      console.error('Error initializing Firebase app:', error);
    }
  } else {
    firebaseApp = getApp();
    console.log('Firebase App already initialized.');
  }

  if (firebaseApp) {
    try {
      firestore = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp); // Initialize auth
      console.log('Firestore and Auth services initialized.');
    } catch (error) {
      console.error('Error initializing Firebase services (Firestore, Auth, etc.):', error);
    }
  }
} else {
  console.error("CLIENT_SIDE_ERROR: Firebase config not valid, projectId is a placeholder, or apiKey is missing. Firebase services won't be initialized.");
}

export { firebaseApp, firestore, auth }; // Export auth
