import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY, // Using the key from your README
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest', // Using a standard and available model
});
