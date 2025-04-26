'use server';
/**
 * @fileOverview Generates a detailed learning activity proposal tailored to the Colombian educational context based on teacher input.
 *
 * - generateActivityProposal - A function that generates the activity proposal.
 * - GenerateActivityProposalInput - The input type for the generateActivityProposal function.
 * - GenerateActivityProposalOutput - The return type for the generateActivityProposal function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateActivityProposalInputSchema = z.object({
  grade: z.string().describe('The specific grade(s) for the activity (e.g., 6th, 7th, or both).'),
  timeAvailable: z.string().describe('The time available for the activity (e.g., one class, two classes, a week).'),
  centralTheme: z.string().describe('The central theme or specific problem to be addressed in the activity.'),
  methodologyPreference: z
    .string()
    .describe('The preferred methodology or pedagogical approach for the activity (or "Abierto a sugerencias").'),
  competenciesToDevelop: z
    .string()
    .describe(
      'The specific competencies from the Orientaciones Curriculares that the activity will develop. Be as specific as possible and cite them.'
    ),
  learningEvidences: z
    .string()
    .describe(
      'The specific learning evidences (actions, products, performances) that will verify the development of competencies. Be as specific as possible and cite or adapt them from the Orientaciones.'
    ),
  curricularComponents: z
    .string()
    .describe(
      'The curricular components (Naturaleza y Evolución de la Tecnología, Apropiación y Uso de la Tecnología, Solución de Problemas con Tecnología, Tecnología y Sociedad) to be addressed in the activity, with justification.'
    ),
  availableResources: z.string().describe('The available resources for the activity (e.g., computers, internet, software).'),
  contextAndNeeds: z
    .string()
    .describe('Any specific needs or particularities of the school context or students that should be considered.'),
  interdisciplinarity: z
    .string()
    .describe('Whether the activity should be integrated with other areas of knowledge, and if so, which ones.'),
});

export type GenerateActivityProposalInput = z.infer<typeof GenerateActivityProposalInputSchema>;

const GenerateActivityProposalOutputSchema = z.object({
  activityProposal: z.string().describe('A detailed proposal for a learning activity.'),
});

export type GenerateActivityProposalOutput = z.infer<typeof GenerateActivityProposalOutputSchema>;

export async function generateActivityProposal(input: GenerateActivityProposalInput): Promise<GenerateActivityProposalOutput> {
  return generateActivityProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityProposalPrompt',
  input: {
    schema: z.object({
      grade: z.string().describe('The specific grade(s) for the activity (e.g., 6th, 7th, or both).'),
      timeAvailable: z.string().describe('The time available for the activity (e.g., one class, two classes, a week).'),
      centralTheme: z.string().describe('The central theme or specific problem to be addressed in the activity.'),
      methodologyPreference: z
        .string()
        .describe('The preferred methodology or pedagogical approach for the activity (or "Abierto a sugerencias").'),
      competenciesToDevelop: z
        .string()
        .describe(
          'The specific competencies from the Orientaciones Curriculares that the activity will develop. Be as specific as possible and cite them.'
        ),
      learningEvidences: z
        .string()
        .describe(
          'The specific learning evidences (actions, products, performances) that will verify the development of competencies. Be as specific as possible and cite or adapt them from the Orientaciones.'
        ),
      curricularComponents: z
        .string()
        .describe(
          'The curricular components (Naturaleza y Evolución de la Tecnología, Apropiación y Uso de la Tecnología, Solución de Problemas con Tecnología, Tecnología y Sociedad) to be addressed in the activity, with justification.'
        ),
      availableResources: z.string().describe('The available resources for the activity (e.g., computers, internet, software).'),
      contextAndNeeds: z
        .string()
        .describe('Any specific needs or particularities of the school context or students that should be considered.'),
      interdisciplinarity: z
        .string()
        .describe('Whether the activity should be integrated with other areas of knowledge, and if so, which ones.'),
    }),
  },
  output: {
    schema: z.object({
      activityProposal: z.string().describe('A detailed proposal for a learning activity.'),
    }),
  },
  prompt: `You are an expert in designing learning activities for technology and informatics in the Colombian education system.
  You are familiar with the Orientaciones Curriculares para el Área de Tecnología e Informática en la Educación Básica y Media del Ministerio de Educación Nacional de Colombia (MEN) and Guía 30.

  Based on the following information provided by the teacher, generate a detailed and contextualized learning activity proposal:

  Grade(s): {{{grade}}}
  Time Available: {{{timeAvailable}}}
  Central Theme: {{{centralTheme}}}
  Methodology Preference: {{{methodologyPreference}}}
  Competencies to Develop: {{{competenciesToDevelop}}}
  Learning Evidences: {{{learningEvidences}}}
  Curricular Components: {{{curricularComponents}}}
  Available Resources: {{{availableResources}}}
  Context and Needs: {{{contextAndNeeds}}}
  Interdisciplinarity: {{{interdisciplinarity}}}

  The activity proposal should include:
  * A complete description of the activity (steps, phases, roles).
  * Guiding questions for the students.
  * Necessary resources.
  * Expected product(s).
  * Evaluation criteria and instruments (aligned with the competencies and evidences).
  * Adaptations (if necessary).

  The proposal should be presented in a clear, organized, and easy-to-follow format, with separate sections for each element.
  The proposal must adhere to Colombian educational standards and curriculum guidelines.
  The proposal must be highly specific, detailed, and practical, suitable for immediate implementation in a classroom setting.
`,
});

const generateActivityProposalFlow = ai.defineFlow<
  typeof GenerateActivityProposalInputSchema,
  typeof GenerateActivityProposalOutputSchema
>(
  {
    name: 'generateActivityProposalFlow',
    inputSchema: GenerateActivityProposalInputSchema,
    outputSchema: GenerateActivityProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
