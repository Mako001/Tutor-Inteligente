// src/lib/firebase/config.ts
import { env } from '@/lib/env'; // Importar el entorno validado

// 1. Define la estructura esperada de la configuración de Firebase
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Opcional
}

// 2. Construye el objeto de configuración directamente desde las variables validadas.
// La validación ya ocurrió en `env.ts`, por lo que podemos usar las variables de forma segura.
const firebaseConfig: FirebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 3. Exporta una función que devuelve la configuración.
// Esto mantiene la interfaz consistente con el código existente que llama a `getFirebaseConfig()`.
export const getFirebaseConfig = () => {
  return firebaseConfig;
};
