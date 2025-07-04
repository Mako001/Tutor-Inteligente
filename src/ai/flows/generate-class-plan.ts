// src/ai/flows/generate-class-plan.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type GenerateClassPlanInput } from './schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function generateClassPlan(input: GenerateClassPlanInput): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
      Actúa como un pedagogo experto y diseñador curricular para el sistema educativo de Colombia, con pleno conocimiento de los lineamientos del Ministerio de Educación Nacional (MEN).

      Tu tarea es generar un "Plan de Clase" o "Secuencia Didáctica" detallada y bien estructurada, basada en la información proporcionada por un docente. El plan debe ser práctico, coherente y fácil de seguir.

      Utiliza la siguiente información para construir el plan:
      - Título del Plan: ${input.planTitle}
      - Materia: ${input.subject}
      - Grado(s): ${input.grade}
      - Duración Total Estimada: ${input.totalDuration}
      - Gran Objetivo de Aprendizaje (Big Idea): ${input.bigIdea}
      - Competencias a Desarrollar (basadas en MEN): ${input.competencies}
      - Objetivos de Aprendizaje Específicos: ${input.specificObjectives}
      - Secuencia de Sesiones o Actividades Propuesta: ${input.sessionSequence}
      - Evaluación Sumativa: ${input.summativeAssessment}
      - Evaluación Formativa (seguimiento): ${input.formativeAssessment}
      - Recursos Generales: ${input.generalResources}
      - Estrategias de Diferenciación: ${input.differentiation}
      - Conexiones Interdisciplinares: ${input.interdisciplinarity}

      El resultado debe ser un documento en formato Markdown que contenga las siguientes secciones claramente definidas:
      1.  **Información General:** Un resumen con el título, materia, grado, duración, etc.
      2.  **Marco Curricular:** Detalla el Gran Objetivo de Aprendizaje, las competencias seleccionadas y los objetivos específicos.
      3.  **Secuencia Didáctica Detallada:** Expande la secuencia de sesiones. Para cada sesión o semana, describe las actividades (inicio, desarrollo, cierre), los recursos específicos y las tareas.
      4.  **Estrategia de Evaluación:** Explica cómo se implementarán tanto la evaluación formativa (con ejemplos de instrumentos como rúbricas, tickets de salida, etc.) como la sumativa.
      5.  **Recursos y Materiales:** Lista consolidada de todos los recursos necesarios.
      6.  **Adaptaciones y Diferenciación:** Ofrece sugerencias concretas basadas en la información proporcionada.
      7.  **Conexiones Interdisciplinares:** Sugiere actividades o puntos de conexión con otras materias.

      Asegúrate de que el lenguaje sea claro, profesional y orientado a la práctica docente en Colombia.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error("ERROR en generateClassPlan:", error);
    throw new Error("La llamada a la API de Gemini para generar el plan de clase falló.");
  }
}
