// src/ai/flows/generate-activity.ts
'use server';
/**
 * @fileOverview Generates a modular learning activity using AI.
 *
 * - generateActivity - A function that handles the activity generation process.
 */
import { model } from '@/ai/ai-instance';
import { type GenerateSingleActivityInput } from './schemas';

// The main function, now using @google/generative-ai
export async function generateActivity(
  input: GenerateSingleActivityInput
): Promise<string> {
  const { 
    activityType, 
    subject, 
    grade, 
    topic, 
    duration, 
    learningObjective,
    availableResources
  } = input;

  const prompt = `
      Eres un diseñador de actividades pedagógicas experto en el sistema educativo colombiano.
      Genera una actividad de tipo "${activityType}" para una clase de "${subject}" de grado "${grade}".
      ${topic ? `Esta actividad forma parte de un tema más amplio: "${topic}".` : ''}
      La actividad debe durar aproximadamente "${duration}" y cumplir con el siguiente objetivo de aprendizaje específico: "${learningObjective}".
      ${availableResources ? `Considera los siguientes recursos disponibles: "${availableResources}".` : ''}

      La actividad generada debe incluir claramente las siguientes secciones:
      - Nombre de la Actividad: Un título claro y atractivo.
      - Instrucciones para el Docente: Pasos claros y concisos para guiar la actividad.
      - Instrucciones para el Estudiante: Qué deben hacer los alumnos, formulado de manera que se pueda compartir directamente con ellos.
      - Recursos Necesarios: Una lista de materiales o herramientas específicas para esta actividad.

      Formatea toda tu respuesta en Markdown para una fácil lectura y presentación. No incluyas nada más que el contenido de la actividad.
    `;
    
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating activity with Gemini:", error);
    throw new Error("La IA no pudo generar la actividad.");
  }
}
