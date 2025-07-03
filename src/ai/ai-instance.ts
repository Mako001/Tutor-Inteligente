// src/ai/ai-instance.ts
import {genkit} from 'genkit';
import {firebase} from '@genkit-ai/firebase';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    firebase, // El plugin clave para el entorno de Firebase
    googleAI({
      location: 'us-central1',
    }),
  ],
});
