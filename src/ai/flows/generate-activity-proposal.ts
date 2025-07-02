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

export const GenerateActivityProposalInputSchema = z.object({
  subject: z.string().describe('The subject or area of knowledge for the activity (e.g., "Tecnología e Informática", "Matemáticas", "Ciencias Naturales").'),
  grade: z.string().describe('The specific grade(s) for the activity (e.g., 6th, 7th, or both).'),
  timeAvailable: z.string().describe('The time available for the activity (e.g., one class, two classes, a week).'),
  centralTheme: z.string().describe('The central theme or specific problem to be addressed in the activity.'),
  methodologyPreference: z
    .string()
    .describe('The preferred methodology or pedagogical approach for the activity (or "Abierto a sugerencias").'),
  competenciesToDevelop: z
    .string()
    .describe(
      'The specific competencies that the activity will develop. Be as specific as possible and cite them if possible.'
    ),
  learningEvidences: z
    .string()
    .describe(
      'The specific learning evidences (actions, products, performances) that will verify the development of competencies. Be as specific as possible.'
    ),
  curricularComponents: z
    .string()
    .describe(
      'The curricular components to be addressed in the activity, with justification.'
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

export const GenerateActivityProposalOutputSchema = z.object({
  activityProposal: z.string().describe('A detailed proposal for a learning activity.'),
});

export type GenerateActivityProposalOutput = z.infer<typeof GenerateActivityProposalOutputSchema>;

export async function generateActivityProposal(input: GenerateActivityProposalInput): Promise<GenerateActivityProposalOutput> {
  return generateActivityProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityProposalPrompt',
  input: {
    schema: GenerateActivityProposalInputSchema,
  },
  output: {
    schema: GenerateActivityProposalOutputSchema,
  },
  prompt: `You are an expert in designing learning activities for the subject of {{{subject}}} in the Colombian education system.
  You are familiar with the general curriculum guidelines from the Ministerio de Educación Nacional de Colombia (MEN). For the subject of {{{subject}}}, you will apply the relevant standards and competencies.

  Based on the following information provided by the teacher, generate a detailed and contextualized learning activity proposal:

  Subject: {{{subject}}}
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
  The proposal must adhere to Colombian educational standards and curriculum guidelines for the specified subject.
  The proposal must be highly specific, detailed, and practical, suitable for immediate implementation in a classroom setting.
`,
});

const generateActivityProposalFlow = ai.defineFlow(
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
