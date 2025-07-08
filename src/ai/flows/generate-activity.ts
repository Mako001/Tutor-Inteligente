// src/ai/flows/generate-activity.ts
'use server';
/**
 * @fileOverview Generates a modular learning activity using AI with varying levels of detail.
 *
 * - generateActivity - A function that handles the activity generation process.
 * - refineActivity - A function that refines an existing activity based on user feedback.
 */
import { model } from '@/ai/ai-instance';
import { GenerateSingleActivityInputSchema, RefineProposalInputSchema } from './schemas';
import { z } from 'zod';

// The main function, now using @google/generative-ai and supporting different depths
export async function generateActivity(
  input: z.infer<typeof GenerateSingleActivityInputSchema>
): Promise<{ success: true; data: string } | { success: false; error: string }> {
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
      Para cada momento, explica la actividad y su propósito.

      Procede a generar la propuesta según las instrucciones para el nivel de profundidad: **"${activityDepth}"**. Formatea toda tu respuesta en Markdown para una fácil lectura.
    `;
    
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, data: text };
  } catch (error) {
    console.error("Error generating activity with Gemini:", error);
    return { success: false, error: "La llamada a la API de Gemini falló. Por favor, inténtalo de nuevo." };
  }
}

export async function refineActivity(
  input: z.infer<typeof RefineProposalInputSchema>
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const { originalProposal, refinementInstruction } = input;

  const prompt = `
      Eres un asistente pedagógico experto. Tu tarea es tomar una actividad de aprendizaje existente y refinarla basándote en una instrucción específica.

      **Actividad Original (en Markdown):**
      ---
      ${originalProposal}
      ---

      **Instrucción de Refinamiento:**
      ---
      ${refinementInstruction}
      ---

      **Tarea:**
      Revisa la actividad original y aplica los cambios solicitados en la instrucción. Devuelve **únicamente** la versión nueva y completa de la actividad en formato Markdown. No añadas comentarios introductorios como "Claro, aquí está la actividad refinada". Simplemente entrega la actividad modificada.
    `;
    
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, data: text };
  } catch (error) {
    console.error("Error refining activity with Gemini:", error);
    return { success: false, error: "La IA no pudo refinar la actividad. Por favor, inténtalo de nuevo." };
  }
}
