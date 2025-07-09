// src/ai/ai-instance.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GEMINI_MODEL_NAME } from '@/config/ai-constants';
import { env } from '@/lib/env';

const apiKey = env.GOOGLE_GEMINI_API_KEY;

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
