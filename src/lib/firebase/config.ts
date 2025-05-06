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
 * Throws an error if any required variable is missing. Warns if the placeholder Project ID is used.
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
        const errorMsg = `Missing Firebase configuration variables in environment: ${missingKeys.join(', ')}. Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env.local file.`;
        console.error(errorMsg);
        // Throw an error to prevent the application from proceeding with incomplete config
        throw new Error(errorMsg); // Keep throwing for missing keys
    }

    // Check if Project ID is still the placeholder value and warn, but don't throw
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID") {
        const warningMsg = 'Firebase Project ID is set to the placeholder "YOUR_PROJECT_ID". Please update it in your .env.local file with your actual Firebase project ID for Firebase services to function correctly.';
        console.warn(warningMsg); // Changed from error and throw to warn
    }

    // Basic validation for projectId format (optional but helpful)
    // Also check it's not the placeholder before validating format
    if (firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID" && !/^[a-z0-9-]+$/.test(firebaseConfig.projectId)) {
        console.warn(`Firebase projectId "${firebaseConfig.projectId}" might be invalid. It should typically contain only lowercase letters, numbers, and hyphens.`);
    }
}
