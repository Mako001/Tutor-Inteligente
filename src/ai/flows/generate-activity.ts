// src/ai/flows/generate-activity.ts
'use server';
/**
 * @fileOverview Generates a modular learning activity using AI.
 *
 * - generateActivity - A function that handles the activity generation process.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
import {
  GenerateSingleActivityInputSchema,
  type GenerateSingleActivityInput,
} from './schemas';

// The main function exported to be used by the frontend.
export async function generateActivity(
  input: GenerateSingleActivityInput
): Promise<string> {
  // We call the Genkit flow and return its string output.
  const result = await generateActivityFlow(input);
  return result;
}

// Define the prompt for Genkit.
const activityPrompt = ai.definePrompt({
  name: 'generateActivityPrompt',
  input: {schema: GenerateSingleActivityInputSchema},
  prompt: `
      Eres un diseñador de actividades pedagógicas experto en el sistema educativo colombiano.
      Genera una actividad de tipo "{{activityType}}" para una clase de "{{subject}}" de grado "{{grade}}".
      {{#if topic}}
      Esta actividad forma parte de un tema más amplio: "{{topic}}".
      {{/if}}
      La actividad debe durar aproximadamente "{{duration}}" y cumplir con el siguiente objetivo de aprendizaje específico: "{{learningObjective}}".
      {{#if availableResources}}
      Considera los siguientes recursos disponibles: "{{availableResources}}".
      {{/if}}

      La actividad generada debe incluir claramente las siguientes secciones:
      - Nombre de la Actividad: Un título claro y atractivo.
      - Instrucciones para el Docente: Pasos claros y concisos para guiar la actividad.
      - Instrucciones para el Estudiante: Qué deben hacer los alumnos, formulado de manera que se pueda compartir directamente con ellos.
      - Recursos Necesarios: Una lista de materiales o herramientas específicas para esta actividad.

      Formatea toda tu respuesta en Markdown para una fácil lectura y presentación. No incluyas nada más que el contenido de la actividad.
    `,
});

// Define the Genkit flow.
const generateActivityFlow = ai.defineFlow(
  {
    name: 'generateActivityFlow',
    inputSchema: GenerateSingleActivityInputSchema,
    outputSchema: z.string(), // The output is a string of Markdown
  },
  async (input) => {
    const response = await activityPrompt(input);
    return response.text;
  }
);
