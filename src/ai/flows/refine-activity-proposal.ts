'use server';
/**
 * @fileOverview This file defines a Genkit flow for refining an activity proposal based on teacher feedback.
 *
 * - refineActivityProposal - The single exported function that refines the activity proposal.
 */

import {ai} from '@/ai/ai-instance';
import {
  RefineActivityProposalInputSchema,
  RefineActivityProposalOutputSchema,
  type RefineActivityProposalInput,
  type RefineActivityProposalOutput,
} from './schemas';

export async function refineActivityProposal(
  input: RefineActivityProposalInput
): Promise<RefineActivityProposalOutput> {
  return refineActivityProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineActivityProposalPrompt',
  model: 'gemini-1.5-flash-latest',
  input: {
    schema: RefineActivityProposalInputSchema,
  },
  output: {
    schema: RefineActivityProposalOutputSchema,
  },
  prompt: `You are an expert in refining activity proposals for teachers.

  Based on the initial activity proposal and the teacher's feedback, refine the proposal to better meet the teacher's needs.
  The proposal must be contextualized to Colombia.
  Do not deviate from the guidelines of the Ministry of Education of Colombia.

  Initial Activity Proposal:
  {{{initialProposal}}}

  Teacher Feedback:
  {{{teacherFeedback}}}

  Refined Activity Proposal:`,
});

const refineActivityProposalFlow = ai.defineFlow(
  {
    name: 'refineActivityProposalFlow',
    inputSchema: RefineActivityProposalInputSchema,
    outputSchema: RefineActivityProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
