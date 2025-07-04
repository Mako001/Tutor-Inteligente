// src/ai/flows/generate-activity.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type GenerateSingleActivityInput } from './schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function generateActivity(input: GenerateSingleActivityInput): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
      Eres un diseñador de actividades pedagógicas experto en el sistema educativo colombiano.
      Genera una actividad de tipo "${input.activityType}" para una clase de "${input.subject}" de grado "${input.grade}".
      ${input.topic ? `Esta actividad forma parte de un tema más amplio: "${input.topic}".` : ''}
      La actividad debe durar aproximadamente "${input.duration}" y cumplir con el siguiente objetivo de aprendizaje específico: "${input.learningObjective}".
      ${input.availableResources ? `Considera los siguientes recursos disponibles: "${input.availableResources}".` : ''}

      La actividad generada debe incluir claramente las siguientes secciones:
      - Nombre de la Actividad: Un título claro y atractivo.
      - Instrucciones para el Docente: Pasos claros y concisos para guiar la actividad.
      - Instrucciones para el Estudiante: Qué deben hacer los alumnos, formulado de manera que se pueda compartir directamente con ellos.
      - Recursos Necesarios: Una lista de materiales o herramientas específicas para esta actividad.

      Formatea toda tu respuesta en Markdown para una fácil lectura y presentación. No incluyas nada más que el contenido de la actividad.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error("ERROR EN GENERATE ACTIVITY:", error);
    throw new Error("La llamada a la API de Gemini para generar la actividad falló. Revisa la consola del servidor.");
  }
}
