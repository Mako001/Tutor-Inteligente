// src/ai/flows/generate-activity-proposal.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GenerateActivityProposalInputSchema,
  GenerateActivityProposalOutputSchema,
  type GenerateActivityProposalInput,
  type GenerateActivityProposalOutput,
} from './schemas';

// 1. Initialize the client of the API with the key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// 2. Define the function that will be called from the frontend.
export async function generateActivityProposal(
  input: GenerateActivityProposalInput
): Promise<GenerateActivityProposalOutput> {
  // Validate the input (good practice)
  const validatedInput = GenerateActivityProposalInputSchema.parse(input);

  try {
    // 3. Select the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // 4. Build the prompt
    const prompt = `You are an expert in designing learning activities for the subject of ${validatedInput.subject} in the Colombian education system.
You are familiar with the general curriculum guidelines from the Ministerio de Educación Nacional de Colombia (MEN). For the subject of ${validatedInput.subject}, you will apply the relevant standards and competencies.

Based on the following information provided by the teacher, generate a detailed and contextualized learning activity proposal:

Subject: ${validatedInput.subject}
Grade(s): ${validatedInput.grade}
Time Available: ${validatedInput.timeAvailable}
Central Theme: ${validatedInput.centralTheme}
Methodology Preference: ${validatedInput.methodologyPreference}
Competencies to Develop: ${validatedInput.competenciesToDevelop}
Learning Evidences: ${validatedInput.learningEvidences}
Curricular Components: ${validatedInput.curricularComponents}
Available Resources: ${validatedInput.availableResources}
Context and Needs: ${validatedInput.contextAndNeeds}
Interdisciplinarity: ${validatedInput.interdisciplinarity}

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

IMPORTANT: Format your entire response as a single, valid JSON object that adheres to the output schema: { "activityProposal": "string" }. Do not include any markdown formatting like \`\`\`json or any other text outside of the JSON object.`;

    // 5. Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. Parse the JSON response
    const parsedOutput = JSON.parse(text);

    // 7. Validate the output with Zod
    return GenerateActivityProposalOutputSchema.parse(parsedOutput);

  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    if (error instanceof SyntaxError) {
      console.error("The model did not return valid JSON. Raw text:", error);
    }
    // Lanza un error para que el frontend pueda manejarlo
    throw new Error("No se pudo generar la propuesta. Revisa la consola para más detalles.");
  }
}
