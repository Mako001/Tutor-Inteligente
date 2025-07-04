// src/ai/flows/find-resources.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type FindResourcesInput, type FindResourcesOutput, FindResourcesOutputSchema } from './schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function findResources(input: FindResourcesInput): Promise<FindResourcesOutput> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
      Actúa como un bibliotecario experto en recursos educativos para la materia de "${input.subject}".
      Busca en internet y recomienda hasta 3 recursos de alta calidad del tipo "${input.resourceType}" sobre el tema "${input.topic}", que sean apropiados para estudiantes de grado "${input.grade}".

      Para cada recurso, proporciona:
      - title: El título del recurso.
      - url: La URL directa al recurso.
      - description: Una breve explicación en 2-3 frases de por qué es útil para un docente.

      IMPORTANT: Format your entire response as a single, valid JSON object that adheres to the following schema: { "resources": [{ "title": "string", "url": "string", "description": "string" }] }. Do not include any markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedOutput = JSON.parse(text);
    return FindResourcesOutputSchema.parse(parsedOutput);

  } catch (error) {
    console.error("ERROR en findResources:", error);
    throw new Error("La búsqueda de recursos con la IA falló. Revisa la consola del servidor para más detalles.");
  }
}
