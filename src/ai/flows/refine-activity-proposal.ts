'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  RefineActivityProposalInputSchema,
  RefineActivityProposalOutputSchema,
  type RefineActivityProposalInput,
  type RefineActivityProposalOutput,
} from './schemas';

// 1. Initialize the client of the API with the key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// 2. Define the function that will be called from the frontend.
export async function refineActivityProposal(
  input: RefineActivityProposalInput
): Promise<RefineActivityProposalOutput> {
  // Validate the input (good practice)
  const validatedInput = RefineActivityProposalInputSchema.parse(input);

  try {
    // 3. Select the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // 4. Build the prompt
    const prompt = `You are an expert in refining activity proposals for teachers.

Based on the initial activity proposal and the teacher's feedback, refine the proposal to better meet the teacher's needs.
The proposal must be contextualized to Colombia.
Do not deviate from the guidelines of the Ministry of Education of Colombia.

Initial Activity Proposal:
${validatedInput.initialProposal}

TeacherFeedback:
${validatedInput.teacherFeedback}

Refined Activity Proposal:

IMPORTANT: Format your entire response as a single, valid JSON object that adheres to the output schema: { "refinedProposal": "string" }. Do not include any markdown formatting like \`\`\`json or any other text outside of the JSON object.`;

    // 5. Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. Parse the JSON response
    const parsedOutput = JSON.parse(text);

    // 7. Validate the output with Zod
    return RefineActivityProposalOutputSchema.parse(parsedOutput);

  } catch (error) {
    console.error("Error al llamar a la API de Gemini para refinar:", error);
    if (error instanceof SyntaxError) {
      console.error("The model did not return valid JSON for refinement. Raw text:", error);
    }
    // Lanza un error para que el frontend pueda manejarlo
    throw new Error("No se pudo refinar la propuesta. Revisa la consola para más detalles.");
  }
}
