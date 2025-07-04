// src/ai/flows/generate-activity.ts
'use server';
/**
 * @fileOverview Generates a modular learning activity using AI with varying levels of detail.
 *
 * - generateActivity - A function that handles the activity generation process.
 */
import { model } from '@/ai/ai-instance';
import { type GenerateSingleActivityInput } from './schemas';

// The main function, now using @google/generative-ai and supporting different depths
export async function generateActivity(
  input: GenerateSingleActivityInput
): Promise<string> {
  const { 
    activityDepth,
    activityType, 
    subject, 
    grade, 
    topic, 
    duration, 
    learningObjective,
    availableResources
  } = input;

  const prompt = `
      Eres un diseñador pedagógico experto en el sistema educativo colombiano.
      Tu tarea es generar una propuesta de actividad basada en la siguiente información y el nivel de profundidad solicitado.

      **Nivel de Profundidad Solicitado: ${activityDepth}**

      ---
      **Información Base:**
      - Materia: ${subject}
      - Grado: ${grade}
      - Tema General (si aplica): ${topic}
      - Tipo de Actividad (contexto): ${activityType}
      - Duración Estimada: ${duration}
      - Objetivo de Aprendizaje: ${learningObjective}
      - Recursos Disponibles: ${availableResources || 'No especificados'}
      ---

      **INSTRUCCIONES DE GENERACIÓN**

      Ahora, genera la propuesta siguiendo ESTRICTAMENTE las directrices para el nivel de profundidad solicitado:

      **1. Si el nivel es "Lluvia de Ideas":**
      Genera una lista de 3 a 5 ideas de actividades concisas y creativas. Para cada idea, proporciona solo:
      - **Un Título Atractivo:**
      - **Un Concepto Breve:** (1-2 frases explicando la idea).
      **NO** desarrolles las actividades. Solo presenta la lista de ideas en formato Markdown.

      **2. Si el nivel es "Actividad Detallada":**
      Genera una única actividad bien estructurada. El resultado debe ser un documento en formato Markdown que contenga las siguientes secciones claramente definidas:
      - **Nombre de la Actividad:** Un título claro y atractivo.
      - **Instrucciones para el Docente:** Pasos claros y concisos para guiar la actividad.
      - **Instrucciones para el Estudiante:** Qué deben hacer los alumnos, formulado de manera que se pueda compartir directamente con ellos.
      - **Recursos Necesarios:** Una lista de materiales o herramientas específicas.
      Asegúrate de que el lenguaje sea claro y práctico.

      **3. Si el nivel es "Mini-Secuencia":**
      Diseña una secuencia didáctica corta para una sesión de clase, dividida en tres momentos clave. El resultado debe ser un documento en formato Markdown con las siguientes secciones:
      - **Título de la Sesión:** Un título general para la clase.
      - **Momento 1: Inicio (Warm-up / Engagement):** Describe una actividad corta para activar conocimientos previos o enganchar a los estudiantes.
      - **Momento 2: Desarrollo (Actividad Principal):** Describe la actividad central donde se trabaja el objetivo de aprendizaje.
      - **Momento 3: Cierre (Wrap-up / Síntesis):** Describe una actividad corta para consolidar el aprendizaje y verificar la comprensión.
      Para cada momento, explica brevemente la actividad y su propósito.

      Procede a generar la propuesta según las instrucciones para el nivel de profundidad: **"${activityDepth}"**. Formatea toda tu respuesta en Markdown para una fácil lectura.
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
