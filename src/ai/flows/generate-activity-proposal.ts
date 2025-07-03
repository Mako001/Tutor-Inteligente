// src/ai/flows/generate-activity-proposal.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type GenerateActivityProposalInput } from './schemas';

// Inicializamos el cliente de la API con la clave que está en .env.local
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Esta es nuestra única función. Simple y directa.
export async function generateActivityProposal(input: GenerateActivityProposalInput): Promise<string> {
  try {
    // Seleccionamos el modelo. La API de Generative Language SÍ usa "-latest".
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Construimos el prompt con los datos del formulario
    const prompt = `
      You are an expert in designing learning activities for the subject of ${input.subject} in the Colombian education system.
      You are familiar with the general curriculum guidelines from the Ministerio de Educación Nacional de Colombia (MEN).

      Based on the following information provided by the teacher, generate a detailed and contextualized learning activity proposal:

      - Subject: ${input.subject}
      - Grade(s): ${input.grade}
      - Time Available: ${input.timeAvailable}
      - Central Theme: ${input.centralTheme}
      - Methodology Preference: ${input.methodologyPreference}
      - Competencies to Develop: ${input.competenciesToDevelop}
      - Learning Evidences: ${input.learningEvidences}
      - Curricular Components: ${input.curricularComponents}
      - Available Resources: ${input.availableResources}
      - Context and Needs: ${input.contextAndNeeds}
      - Interdisciplinarity: ${input.interdisciplinarity}

      The activity proposal should include:
      * A complete description of the activity (steps, phases, roles).
      * Guiding questions for the students.
      * Necessary resources.
      * Expected product(s).
      * Evaluation criteria and instruments.
      * Adaptations (if necessary).

      Present the proposal in a clear, organized, and easy-to-follow format using Markdown.
    `;

    // Hacemos la llamada a la API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Devolvemos el texto plano directamente
    return text;

  } catch (error) {
    // Si algo falla, lo registramos en la consola del servidor para poder verlo
    console.error("ERROR DIRECTO DE LA API DE GEMINI:", error);
    // Y le devolvemos un mensaje de error al frontend
    throw new Error("La llamada a la API de Gemini falló. Revisa la consola del servidor para más detalles.");
  }
}
