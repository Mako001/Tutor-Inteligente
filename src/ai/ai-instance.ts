// This file does NOT have 'use server'. It is a configuration file.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The model will be specified in each prompt definition.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY, // Using the key from your README
    }),
  ],
  // We're removing the default model and promptDir from here to be more explicit in our prompts.
});
