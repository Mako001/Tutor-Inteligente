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

      Tu tarea es generar una planificación educativa basada en la siguiente información proporcionada por un docente. La estructura y profundidad de tu respuesta debe corresponder al **"Nivel de Detalle Solicitado"**.

      **Nivel de Detalle Solicitado: ${input.planDepth}**

      ---

      **Información Base Proporcionada por el Docente:**
      - Título del Plan: ${input.planTitle}
      - Materia: ${input.subject}
      - Grado(s): ${input.grade}
      - Duración Total Estimada: ${input.totalDuration}
      - Gran Objetivo de Aprendizaje (Big Idea): ${input.bigIdea}
      ${input.competencies ? `- Competencias a Desarrollar (basadas en MEN): ${input.competencies}` : ''}
      ${input.specificObjectives ? `- Objetivos de Aprendizaje Específicos: ${input.specificObjectives}` : ''}
      ${input.sessionSequence ? `- Secuencia de Sesiones Propuesta: ${input.sessionSequence}` : ''}
      ${input.summativeAssessment ? `- Evaluación Sumativa: ${input.summativeAssessment}` : ''}
      ${input.formativeAssessment ? `- Evaluación Formativa (seguimiento): ${input.formativeAssessment}` : ''}
      ${input.generalResources ? `- Recursos Generales: ${input.generalResources}` : ''}
      ${input.differentiation ? `- Estrategias de Diferenciación: ${input.differentiation}` : ''}
      ${input.interdisciplinarity ? `- Conexiones Interdisciplinares: ${input.interdisciplinarity}` : ''}

      ---

      **INSTRUCCIONES DE GENERACIÓN**

      Ahora, genera el plan siguiendo ESTRICTAMENTE las directrices para el nivel de detalle solicitado:

      **1. Si el nivel es "Esquema Rápido":**
      Genera un resumen conciso y de alto nivel. El resultado debe ser un único bloque de texto en Markdown que incluya:
      - Un **Título** claro.
      - El **Gran Objetivo de Aprendizaje** reformulado.
      - Una **propuesta de 2 a 3 actividades principales** que se podrían realizar para alcanzar el objetivo.
      - Una **idea para la evaluación final**.
      Sé breve, directo y práctico. Ideal para una lluvia de ideas inicial. **NO uses las secciones detalladas del "Plan Detallado"**.

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

      Procede a generar el plan según las instrucciones correspondientes al nivel de detalle: **"${input.planDepth}"**.
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
