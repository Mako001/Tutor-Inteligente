// src/ai/flows/find-resources.ts
'use server';
/**
 * @fileOverview Finds educational resources using AI.
 * - findResources - Finds resources based on input.
 * - FindResourcesInput - Input schema for finding resources.
 * - FindResourcesOutput - Output schema for found resources.
 */
import { jsonModel } from '@/ai/ai-instance';
import {
  type FindResourcesInput,
  type FindResourcesOutput,
} from './schemas';

// This function now uses the @google/generative-ai SDK directly
export async function findResources(
  input: FindResourcesInput
): Promise<FindResourcesOutput> {
  const { subject, resourceType, topic, grade } = input;
  
  const prompt = `
      Actúa como un bibliotecario experto en recursos educativos para la materia de "${subject}".
      Busca en internet y recomienda hasta 3 recursos de alta calidad del tipo "${resourceType}" sobre el tema "${topic}", que sean apropiados para estudiantes de grado "${grade}".

      Para cada recurso, proporciona:
      - title: El título del recurso.
      - url: La URL directa al recurso.
      - description: Una breve explicación en 2-3 frases de por qué es útil para un docente.

      IMPORTANTE: Formatea toda tu respuesta como un único objeto JSON válido que se adhiera al siguiente esquema de salida. No incluyas ningún formato de markdown como \`\`\`json.
      El esquema es: { "resources": [{ "title": "string", "url": "string", "description": "string" }] }
    `;

  try {
    const result = await jsonModel.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as FindResourcesOutput;
  } catch (error) {
    console.error("Error finding resources with Gemini:", error);
    throw new Error('La IA no generó una salida JSON válida.');
  }
}
