'use client'; // Firebase SDK is primarily client-side

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics'; // Optional: Add if you need Analytics

import { firebaseConfig, validateFirebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// Validate the config during initialization
validateFirebaseConfig();

// Initialize Firebase only if it hasn't been initialized yet
if (!getApps().length) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Handle initialization error appropriately
    // Maybe disable Firebase features or show an error message
  }
} else {
  firebaseApp = getApp();
  console.log('Firebase app already initialized.');
}

// Export Firebase services
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
// const analytics = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null); // Optional: Conditionally initialize Analytics

export { firebaseApp, auth, firestore, storage /*, analytics*/ };

// Example of how to use in a component:
// import { auth } from '@/lib/firebase/client';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Example hook
//
// function MyComponent() {
//   const [user, loading, error] = useAuthState(auth);
//   // ... use user, loading, error ...
// }
