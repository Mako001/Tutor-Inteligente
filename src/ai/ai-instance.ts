// src/ai/ai-instance.ts

// This file does NOT have 'use server'. It is a configuration file.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The model will be specified in each prompt definition.
export const ai = genkit({
  plugins: [
    // Configure the Google AI plugin.
    // We do NOT need an apiKey when running in a Google Cloud environment (like Firebase).
    // The environment authenticates automatically.
    // We DO need to specify the location to ensure model availability.
    googleAI({
      location: 'us-central1',
    }),
  ],
  // We're removing the default model and promptDir from here to be more explicit in our prompts.
});
