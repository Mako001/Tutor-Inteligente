// src/ai/ai-instance.ts

// This file does NOT have 'use server'. It is a configuration file.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The model will be specified in each prompt definition.
export const ai = genkit({
  plugins: [
    // Configure the Google AI plugin.
    // When running in a Google Cloud environment (like Firebase),
    // Genkit can automatically use the environment's service account for authentication.
    googleAI({
      location: 'us-central1', // Specifying location is crucial for model availability.
    }),
  ],
  // We're removing the default model and promptDir from here to be more explicit in our prompts.
});
