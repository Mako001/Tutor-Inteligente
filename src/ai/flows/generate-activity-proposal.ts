'use server';
/**
 * @fileOverview Generates a detailed learning activity proposal tailored to the Colombian educational context based on teacher input.
 *
 * - generateActivityProposal - The single exported function that generates the activity proposal.
 */

import {ai} from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import {
  GenerateActivityProposalInputSchema,
  GenerateActivityProposalOutputSchema,
  type GenerateActivityProposalInput,
  type GenerateActivityProposalOutput,
} from './schemas';

export async function generateActivityProposal(input: GenerateActivityProposalInput): Promise<GenerateActivityProposalOutput> {
  return generateActivityProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityProposalPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
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
