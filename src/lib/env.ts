import { z } from 'zod';

/**
 * Define el esquema para las variables de entorno PÚBLICAS (del lado del cliente).
 * Esto asegura que todas las variables requeridas estén presentes y no estén vacías
 * al iniciar la aplicación.
 */
const envSchema = z.object({
  // Variables de Firebase (públicas, accesibles desde el cliente)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),

  // Opcional
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  /**
   * Intenta analizar y validar `process.env`.
   * Si la validación falla, Zod lanzará un error que será capturado.
   */
  env = envSchema.parse(process.env);
} catch (error) {
  // Lanza un error más claro y amigable si la validación falla.
  throw new Error(
    'ERROR: Faltan variables de entorno públicas (NEXT_PUBLIC_). Asegúrate de que tu archivo .env.local esté completo y correcto.'
  );
}

export { env };
