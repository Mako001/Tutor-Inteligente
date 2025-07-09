// src/ai/ai-instance.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GEMINI_MODEL_NAME } from '@/config/ai-constants';

// --- Validación de la API Key del Servidor ---
// Obtenemos la API key. Si no está presente, las llamadas a la API fallarán.
// Este error es capturado en los 'flows' de IA (Server Actions), 
// lo que evita que la aplicación se bloquee al iniciar y muestra un error controlado al usuario.
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn(
    'ADVERTENCIA: La variable de entorno GOOGLE_GEMINI_API_KEY no está definida. Las llamadas a la IA fallarán, pero la aplicación no se bloqueará.'
  );
}
// --- Fin de la Validación ---

const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export const model = genAI.getGenerativeModel({ 
  model: GEMINI_MODEL_NAME,
  safetySettings,
});

export const jsonModel = genAI.getGenerativeModel({
  model: GEMINI_MODEL_NAME,
  safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
  },
});
