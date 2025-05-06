// src/lib/firebase/config.ts

// 1. Define la estructura esperada de la configuración
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId?: string | undefined; // Opcional
}

// 2. Carga las variables de entorno
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 3. Validación (Esencial)
const validateFirebaseConfig = (config: FirebaseConfig): boolean => {
  console.log("DEBUG: Leyendo NEXT_PUBLIC_FIREBASE_PROJECT_ID en config.ts:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const requiredKeys: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(key => !config[key]);

  if (missingKeys.length > 0) {
    console.error(
      `ERROR: Faltan las siguientes variables de configuración de Firebase en el entorno: ${missingKeys.join(', ')}. ` +
      `Asegúrate de que estén definidas en tu archivo .env.local y que el servidor de desarrollo se haya reiniciado.`
    );
    return false;
  }

  if (config.projectId === 'YOUR_PROJECT_ID_HERE' || !config.projectId) { // Asegúrate que este placeholder coincida con el que pudieras tener
    console.error(
      'ERROR: El Firebase Project ID es un placeholder o no está definido. ' +
      'Por favor, actualízalo en tu archivo .env.local con tu Project ID real y reinicia el servidor de desarrollo.'
    );
    // For local development, we might throw to make it obvious,
    // but for production, console.error and returning false might be preferred
    // to allow the app to load and show a degraded experience or specific error message.
    // throw new Error('Firebase Project ID is not configured correctly.'); // Option to make it a hard stop
    return false;
  }
  // Puedes añadir más validaciones si es necesario (ej. formato)
  return true;
};

// 4. Exporta la configuración validada (o un objeto que indique un error)
export const getFirebaseConfig = () => {
  if (validateFirebaseConfig(firebaseConfig)) {
    console.log("SERVER_SIDE_CONFIG: Firebase config loaded with projectId:", firebaseConfig.projectId); // Log para el servidor
    return firebaseConfig as Required<Omit<FirebaseConfig, 'measurementId'>> & { measurementId?: string };
  }
  // En un escenario real, podrías querer que la app no inicie o muestre un error claro.
  // Devolver null o un objeto con error puede ser una forma de manejarlo.
  // Por ahora, si la validación falla, la app intentará inicializarse con undefined, lo que fallará.
  console.error("SERVER_SIDE_CONFIG_ERROR: Firebase config validation failed. Returning potentially incomplete config.");
  return firebaseConfig; // Devuelve la config como está si falla la validación, los errores ya se loguearon.
};
