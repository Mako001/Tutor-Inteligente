// src/ai/flows/generate-proposal.ts
'use server';

import { model } from '@/ai/ai-instance';
import { GenerateProposalInputSchema } from './schemas';
import { z } from 'zod';
import { createStreamableValue } from 'ai/rsc';

export async function generateProposal(
  input: z.infer<typeof GenerateProposalInputSchema>
) {
  const stream = createStreamableValue('');
  
  // The input is already validated by Zod on the client-side before calling,
  // but we can parse here for type safety within the function.
  const validatedInput = GenerateProposalInputSchema.parse(input);

  const prompt = `
    Rol: Asistente experto en diseño de actividades de aprendizaje en Tecnología e Informática, con amplio conocimiento de las Orientaciones Curriculares para el Área de Tecnología e Informática en la Educación Básica y Media del Ministerio de Educación Nacional de Colombia (MEN) y la Guía 30.

    Información proporcionada por el docente:
    1. Grado(s) Específico(s): ${validatedInput.grado}
    2. Tiempo Disponible: ${validatedInput.tiempo}
    3. Tema Central: ${validatedInput.tema}
    4. Metodología Preferida: ${validatedInput.metodologia || 'Abierto a sugerencias'}
    5. Competencias a Desarrollar: ${validatedInput.competencias}
    6. Evidencias de Aprendizaje: ${validatedInput.evidencias}
    7. Componentes Curriculares: ${validatedInput.componentes}
    8. Recursos Disponibles: ${validatedInput.recursos}
    9. Contexto y Necesidades: ${validatedInput.contexto || 'No especificado'}
    10. Interdisciplinariedad: ${validatedInput.interdisciplinariedad || 'No aplica'}

    Tarea:
    Utiliza la información anterior, junto con tu conocimiento de las Orientaciones Curriculares y la Guía 30 del MEN, para generar una propuesta detallada de actividad de aprendizaje. Esta propuesta debe incluir:
    - Una descripción completa de la actividad (pasos, fases, roles).
    - Preguntas orientadoras para los estudiantes.
    - Recursos necesarios.
    - Producto(s) esperado(s).
    - Criterios e instrumentos de evaluación (alineados con las competencias y evidencias).
    - Adaptaciones (en caso de que sea necesario).

    Formato de Salida:
    La propuesta de actividad debe presentarse en un formato claro, organizado y fácil de seguir, con secciones separadas para cada uno de los elementos mencionados. Utiliza formato Markdown para una buena legibilidad.

    Restricciones:
    - La propuesta no debe ser genérica.
    - Debe estar contextualizada a Colombia.
    - No puede salirse de los lineamientos del ministerio de educacion de Colombia.
  `;
  
  (async () => {
    try {
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        stream.update(chunk.text());
      }
    } catch (error) {
      console.error("Error generating proposal with Gemini:", error);
      stream.update("Error al generar la propuesta. Por favor, inténtelo de nuevo.");
    } finally {
      stream.done();
    }
  })();

  return {
    output: stream.value
  };
}