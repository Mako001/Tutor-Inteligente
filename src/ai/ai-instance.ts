// src/ai/ai-instance.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GEMINI_MODEL_NAME } from '@/config/ai-constants';

// --- Validación de la API Key del Servidor ---
// Validamos la variable de entorno de Gemini aquí mismo, ya que este módulo
// solo se usa en el lado del servidor (a través de Server Actions).
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'ERROR: La variable de entorno GOOGLE_GEMINI_API_KEY no está definida. Asegúrate de que tu archivo .env.local la incluya.'
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
