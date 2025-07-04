// src/ai/flows/find-resources.ts
'use server';
/**
 * @fileOverview Finds educational resources using AI.
 * - findResources - Finds resources based on input.
 * - FindResourcesInput - Input schema for finding resources.
 * - FindResourcesOutput - Output schema for found resources.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
import {
  FindResourcesInputSchema,
  FindResourcesOutputSchema,
  type FindResourcesInput,
  type FindResourcesOutput,
} from './schemas';

export async function findResources(
  input: FindResourcesInput
): Promise<FindResourcesOutput> {
  const result = await findResourcesFlow(input);
  return result;
}

const findResourcesPrompt = ai.definePrompt({
  name: 'findResourcesPrompt',
  input: {schema: FindResourcesInputSchema},
  output: {schema: FindResourcesOutputSchema},
  prompt: `
      Actúa como un bibliotecario experto en recursos educativos para la materia de "{{subject}}".
      Busca en internet y recomienda hasta 3 recursos de alta calidad del tipo "{{resourceType}}" sobre el tema "{{topic}}", que sean apropiados para estudiantes de grado "{{grade}}".

      Para cada recurso, proporciona:
      - title: El título del recurso.
      - url: La URL directa al recurso.
      - description: Una breve explicación en 2-3 frases de por qué es útil para un docente.

      IMPORTANTE: Formatea toda tu respuesta como un único objeto JSON válido que se adhiera al esquema de salida. No incluyas ningún formato de markdown como \`\`\`json.
    `,
});

const findResourcesFlow = ai.defineFlow(
  {
    name: 'findResourcesFlow',
    inputSchema: FindResourcesInputSchema,
    outputSchema: FindResourcesOutputSchema,
  },
  async (input) => {
    const response = await findResourcesPrompt(input);
    // When using an output schema, the result is in `response.output`.
    // It's already parsed as JSON.
    const output = response.output;
    if (!output) {
      throw new Error('La IA no generó una salida válida.');
    }
    return output;
  }
);
