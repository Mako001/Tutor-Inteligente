'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type RefineActivityProposalInput } from './schemas';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function refineActivityProposal(input: RefineActivityProposalInput): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `You are an expert in refining activity proposals for teachers.
The proposal must be contextualized to Colombia.
Do not deviate from the guidelines of the Ministry of Education of Colombia.

Based on the initial activity proposal and the teacher's feedback, refine the proposal to better meet the teacher's needs.

Initial Activity Proposal:
${input.initialProposal}

TeacherFeedback:
${input.teacherFeedback}

Present the refined proposal in a clear, organized, and easy-to-follow format using Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error("Error al llamar a la API de Gemini para refinar:", error);
    throw new Error("No se pudo refinar la propuesta. Revisa la consola del servidor para más detalles.");
  }
}
