// src/ai/flows/schemas.ts
// This file does NOT have 'use server' and can be safely imported by clients and servers.
import {z} from 'zod';

// Schema for generating a single, modular activity
export const GenerateSingleActivityInputSchema = z.object({
  activityDepth: z.string().describe('The desired level of detail: "Lluvia de Ideas", "Actividad Detallada", "Mini-Secuencia".'),
  subject: z.string().describe('The subject or area of knowledge for the activity.'),
  grade: z.string().describe('The specific grade(s) for the activity.'),
  topic: z.string().optional().describe('The broader lesson topic this activity belongs to (optional).'),
  activityType: z.string().describe('The type of activity (e.g., Introduction, Practice, Evaluation, Icebreaker).'),
  duration: z.string().describe('The estimated duration of the activity (e.g., 15 minutes, 1 class period).'),
  learningObjective: z.string().describe('The specific learning objective for this single activity.'),
  availableResources: z.string().optional().describe('Specific resources available for this activity.'),
});
export type GenerateSingleActivityInput = z.infer<typeof GenerateSingleActivityInputSchema>;

// Schemas for FindResources
export const FindResourcesInputSchema = z.object({
  topic: z.string().describe('The central topic to search resources for (e.g., "Python loops", "Photosynthesis").'),
  resourceType: z.string().describe('The type of resource to find (e.g., "Video de YouTube", "Artículo académico", "Simulación interactiva").'),
  subject: z.string().describe('The subject area for context (e.g., "Tecnología e Informática", "Ciencias Naturales").'),
  grade: z.string().describe('The grade level the resources should be appropriate for.'),
});
export type FindResourcesInput = z.infer<typeof FindResourcesInputSchema>;

export const FoundResourceSchema = z.object({
    title: z.string().describe("The title of the resource."),
    url: z.string().url({ message: "La URL proporcionada no es válida." }).describe("The direct URL to access the resource."),
    description: z.string().describe("A brief description of why this resource is useful for a teacher."),
});
export type FoundResource = z.infer<typeof FoundResourceSchema>;


export const FindResourcesOutputSchema = z.object({
    resources: z.array(FoundResourceSchema).describe("A list of up to 3 high-quality resources found."),
});
export type FindResourcesOutput = z.infer<typeof FindResourcesOutputSchema>;


// Schema for saving a resource to Firestore
export const SaveResourceInputSchema = FoundResourceSchema.extend({
    topic: z.string(),
    resourceType: z.string(),
    subject: z.string(),
    grade: z.string(),
});
export type SaveResourceInput = z.infer<typeof SaveResourceInputSchema>;

// Schema for generating a full class plan
export const GenerateClassPlanInputSchema = z.object({
  planDepth: z.string().describe('The desired level of detail for the plan: "Esquema Rápido", "Plan Detallado", "Proyecto Completo".'),
  planTitle: z.string().describe('The title of the class plan.'),
  subject: z.string().describe('The subject or area of knowledge.'),
  grade: z.string().describe('The specific grade(s) for the plan.'),
  totalDuration: z.string().describe('The total estimated duration of the plan (e.g., 2 weeks, 1 month).'),
  bigIdea: z.string().describe('The central concept or big idea students should understand.'),
  competencies: z.string().describe('A string listing the key competencies to be developed.'),
  specificObjectives: z.string().describe('A list of specific, measurable learning objectives.'),
  sessionSequence: z.string().describe('A description of the sequence of sessions or activities.'),
  summativeAssessment: z.string().describe('The method for summative assessment at the end of the plan.'),
  formativeAssessment: z.string().describe('Methods for formative assessment throughout the plan.'),
  generalResources: z.string().describe('A list of general resources needed for the entire plan.'),
  differentiation: z.string().describe('Strategies for adapting the plan for diverse learners.'),
  interdisciplinarity: z.string().describe('How the plan connects with other subject areas.'),
});
export type GenerateClassPlanInput = z.infer<typeof GenerateClassPlanInputSchema>;
