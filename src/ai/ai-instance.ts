'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Use the model helper for a more robust reference
const geminiFlash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY, // Using the key from your README
    }),
  ],
  model: geminiFlash, // Using a standard and available model reference
});
