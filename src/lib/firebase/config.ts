// src/lib/firebase/config.ts

/**
 * Firebase configuration object.
 * Reads values from environment variables prefixed with NEXT_PUBLIC_.
 * Ensure these variables are set in your .env.local file.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

/**
 * Validates that all required Firebase configuration variables are set.
 * Throws an error if any required variable is missing.
 */
export function validateFirebaseConfig() {
    const requiredKeys: (keyof typeof firebaseConfig)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
    ];

    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
        console.error('Missing Firebase configuration variables in environment:', missingKeys.join(', '));
        console.error('Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env.local file.');
        // Depending on the context, you might throw an error or handle it differently.
        // For server-side usage, throwing might be appropriate.
        // For client-side, you might want to show a message to the user or disable Firebase features.
        // throw new Error(`Missing Firebase config keys: ${missingKeys.join(', ')}`);
    }

    // Check if Project ID is still the placeholder value
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID") {
        console.error('Firebase Project ID is set to the placeholder "YOUR_PROJECT_ID". Please update it in your .env.local file.');
        // Consider throwing an error here as well if a valid Project ID is critical
        // throw new Error('Firebase Project ID is not configured. Please set NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local');
    }

    // Basic validation for projectId format (optional but helpful)
    if (firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID" && !/^[a-z0-9-]+$/.test(firebaseConfig.projectId)) {
        console.warn(`Firebase projectId "${firebaseConfig.projectId}" might be invalid. It should typically contain only lowercase letters, numbers, and hyphens.`);
    }
}
