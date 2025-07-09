// src/lib/firebase/config.ts

// 1. Define la estructura esperada de la configuración de Firebase
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string; // Opcional
}

// 2. Construye el objeto de configuración directamente desde las variables de entorno.
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 3. Exporta una función que devuelve la configuración.
// Esta función ahora solo devuelve el objeto. El manejo de errores de configuración
// se realiza en el AuthProvider, que proporciona una mejor experiencia de usuario.
export const getFirebaseConfig = (): FirebaseConfig => {
  return firebaseConfig;
};
