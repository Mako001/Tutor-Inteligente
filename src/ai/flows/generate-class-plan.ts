// src/ai/flows/generate-class-plan.ts
'use server';
/**
 * @fileOverview Generates an educational plan with varying levels of detail.
 * - generateClassPlan - A function that handles the class plan generation process.
 * - refineClassPlan - A function that refines an existing class plan based on user feedback.
 */
import { model } from '@/ai/ai-instance';
import { GenerateClassPlanInputSchema, RefineProposalInputSchema } from './schemas';
import { z } from 'zod';

export async function generateClassPlan(
  input: z.infer<typeof GenerateClassPlanInputSchema>
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const { 
    planDepth, 
    planTitle,
    subject,
    grade,
    totalDuration,
    bigIdea,
    competencies,
    specificObjectives,
    sessionSequence,
    summativeAssessment,
    formativeAssessment,
    generalResources,
    differentiation,
    interdisciplinarity
  } = input;

  const prompt = `
      Actúa como un pedagogo experto y diseñador curricular para el sistema educativo de Colombia, con pleno conocimiento de los lineamientos del Ministerio de Educación Nacional (MEN).

      Tu tarea es generar una planificación educativa basada en la siguiente información proporcionada por un docente. La estructura y profundidad de tu respuesta debe corresponder al **"Nivel de Detalle Solicitado"**.

      **Nivel de Detalle Solicitado: ${planDepth}**

      ---

      **Información Base Proporcionada por el Docente:**
      - Título del Plan: ${planTitle}
      - Materia: ${subject}
      - Grado(s): ${grade}
      - Duración Total Estimada: ${totalDuration}
      - Gran Objetivo de Aprendizaje (Big Idea): ${bigIdea}
      ${competencies ? `- Competencias a Desarrollar (basadas en MEN): ${competencies}` : ''}
      ${specificObjectives ? `- Objetivos de Aprendizaje Específicos: ${specificObjectives}` : ''}
      ${sessionSequence ? `- Secuencia de Sesiones Propuesta: ${sessionSequence}` : ''}
      ${summativeAssessment ? `- Evaluación Sumativa: ${summativeAssessment}` : ''}
      ${formativeAssessment ? `- Evaluación Formativa (seguimiento): ${formativeAssessment}` : ''}
      ${generalResources ? `- Recursos Generales: ${generalResources}` : ''}
      ${differentiation ? `- Estrategias de Diferenciación: ${differentiation}` : ''}
      ${interdisciplinarity ? `- Conexiones Interdisciplinares: ${interdisciplinarity}` : ''}

      ---

      **INSTRUCCIONES DE GENERACIÓN**

      Ahora, genera el plan siguiendo ESTRICTAMENTE las directrices para el nivel de detalle solicitado:

      **1. Si el nivel es "Esquema Rápido":**
      Genera un resumen conciso y de alto nivel. El resultado debe ser un único bloque de texto en Markdown que incluya:
      - Un **Título** claro.
      - El **Gran Objetivo de Aprendizaje** reformulado.
      - Una **propuesta de 2 a 3 actividades principales** que se podrían realizar para alcanzar el objetivo.
      - Una **idea para la evaluación final**.
      Sé breve, directo y práctico. **NO uses las secciones detalladas del "Plan Detallado"**.

      **2. Si el nivel es "Plan Detallado":**
      Genera un "Plan de Clase" o "Secuencia Didáctica" bien estructurada. El resultado debe ser un documento en formato Markdown que contenga las siguientes secciones claramente definidas:
      - **Información General:** Resumen con título, materia, grado, duración, etc.
      - **Marco Curricular:** Detalla el Gran Objetivo, competencias y objetivos específicos.
      - **Secuencia Didáctica Detallada:** Expande la secuencia de sesiones. Para cada sesión/semana, describe actividades (inicio, desarrollo, cierre), recursos y tareas.
      - **Estrategia de Evaluación:** Explica la evaluación formativa (con ejemplos de instrumentos) y la sumativa.
      - **Recursos y Materiales:** Lista consolidada de recursos.
      - **Adaptaciones y Diferenciación:** Sugerencias concretas.
      - **Conexiones Interdisciplinares:** Puntos de conexión con otras materias.
      Asegúrate de que el lenguaje sea claro, profesional y orientado a la práctica docente en Colombia.

      **3. Si el nivel es "Proyecto Completo":**
      Genera una guía completa para un proyecto de aprendizaje (ABP). El resultado debe ser un documento Markdown enfocado en la metodología ABP, conteniendo:
      - **Visión General del Proyecto:** Título, materia, grado, duración y "Gran Objetivo".
      - **Pregunta Esencial:** Formula una pregunta guía abierta y retadora.
      - **Producto Final Desafiante:** Describe el producto tangible que los estudiantes crearán.
      - **Hitos Clave del Proyecto:** Desglosa el proyecto en fases (Investigación, Diseño, Desarrollo, Revisión, Presentación).
      - **Actividades de Andamiaje:** Para cada hito, sugiere actividades, talleres y recursos.
      - **Evaluación Continua y Final:** Describe la evaluación formativa y sugiere una rúbrica detallada para el producto final.
      - **Voz y Elección del Estudiante:** Sugiere momentos de toma de decisiones para los estudiantes.
      - **Presentación Pública:** Propón una idea para presentar el proyecto a una audiencia real.
      Utiliza toda la información proporcionada por el docente para contextualizar el proyecto.

      Procede a generar el plan según las instrucciones correspondientes al nivel de detalle: **"${planDepth}"**.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, data: text };
  } catch (error) {
    console.error("Error generating class plan with Gemini:", error);
    return { success: false, error: "La IA no pudo generar el plan de clase. Por favor, revisa tu conexión o inténtalo de nuevo." };
  }
}

export async function refineClassPlan(
  input: z.infer<typeof RefineProposalInputSchema>
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const { originalProposal, refinementInstruction } = input;

  const prompt = `
      Eres un asistente pedagógico experto. Tu tarea es tomar un plan de clase existente y refinarlo basándote en una instrucción específica.

      **Plan de Clase Original (en Markdown):**
      ---
      ${originalProposal}
      ---

      **Instrucción de Refinamiento:**
      ---
      ${refinementInstruction}
      ---

      **Tarea:**
      Revisa el plan de clase original y aplica los cambios solicitados en la instrucción. Devuelve **únicamente** la versión nueva y completa del plan de clase en formato Markdown. No añadas comentarios introductorios como "Claro, aquí está el plan refinado". Simplemente entrega el plan modificado.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, data: text };
  } catch (error) {
    console.error("Error refining class plan with Gemini:", error);
    return { success: false, error: "La IA no pudo refinar el plan de clase. Por favor, inténtalo de nuevo." };
  }
}
