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
if (typeof window !== 'undefined') { // Ensure this runs only on the client
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
} else {
  // Handle server-side case if necessary, though Firebase client SDK is client-side
  console.warn('Firebase initialization attempted on server-side. Firestore and Auth might not work here.');
  // Initialize a placeholder or throw an error if server-side access is critical and unexpected
}


// Export Firebase services - Ensure firebaseApp is initialized before calling these
// Using a function to get services ensures firebaseApp is ready
const getFirebaseAuth = () => getAuth(firebaseApp);
const getFirebaseFirestore = () => getFirestore(firebaseApp);
const getFirebaseStorage = () => getStorage(firebaseApp);
// const getFirebaseAnalytics = async () => isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null); // Optional

// Re-exporting initialized services for direct use where appropriate
// Check if firebaseApp exists before initializing to prevent errors during SSR or initial load
const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
const firestore = typeof window !== 'undefined' ? getFirebaseFirestore() : null;
const storage = typeof window !== 'undefined' ? getFirebaseStorage() : null;
// let analytics = null; // Initialize analytics carefully
// if (typeof window !== 'undefined') {
//   isSupported().then(yes => { if(yes) analytics = getAnalytics(firebaseApp) });
// }


export { firebaseApp, auth, firestore, storage /*, analytics*/ }; // Export potentially null services

// Example of how to use in a component:
// import { auth } from '@/lib/firebase/client';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Example hook
//
// function MyComponent() {
//   const [user, loading, error] = useAuthState(auth); // auth might be null initially
//   useEffect(() => {
//      // check if auth is initialized before using it
//      if(auth) {
//         // proceed with auth operations
//      }
//   }, [auth])
//   // ... use user, loading, error ...
// }
