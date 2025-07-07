// src/ai/flows/schemas.ts
// NO debe tener 'use server'. Es para validación del lado del servidor.
import { z } from 'zod';

// Schema para la ACCIÓN DE IA de CREAR ACTIVIDAD
export const GenerateSingleActivityInputSchema = z.object({
  activityDepth: z.string(),
  subject: z.string(),
  grade: z.string(),
  topic: z.string().optional(),
  activityType: z.string(),
  duration: z.string(),
  learningObjective: z.string().min(1, "El objetivo de aprendizaje es obligatorio."),
  availableResources: z.string().optional(),
});

// Schema para la ACCIÓN DE IA de CREAR PLAN
export const GenerateClassPlanInputSchema = z.object({
  planDepth: z.string(),
  planTitle: z.string(),
  subject: z.string(),
  grade: z.string(),
  totalDuration: z.string(),
  bigIdea: z.string(),
  competencies: z.string(), // La acción recibe un string
  specificObjectives: z.string(),
  sessionSequence: z.string(),
  summativeAssessment: z.string(),
  formativeAssessment: z.string(),
  generalResources: z.string(),
  differentiation: z.string(),
  interdisciplinarity: z.string(),
});

// Schema para el generador de propuestas del cuestionario original
export const GenerateProposalInputSchema = z.object({
  grado: z.string().min(1, 'El grado es obligatorio.'),
  tiempo: z.string().min(1, 'El tiempo disponible es obligatorio.'),
  tema: z.string().min(1, 'El tema central es obligatorio.'),
  metodologia: z.string(),
  competencias: z.string().min(1, 'Las competencias son obligatorias.'),
  evidencias: z.string().min(1, 'Las evidencias de aprendizaje son obligatorias.'),
  componentes: z.string().min(1, 'Los componentes curriculares son obligatorios.'),
  recursos: z.string().min(1, 'Los recursos disponibles son obligatorios.'),
  contexto: z.string(),
  interdisciplinariedad: z.string(),
});

// Schema para refinar una propuesta existente
export const RefineProposalInputSchema = z.object({
  originalProposal: z.string().min(1, 'La propuesta original no puede estar vacía.'),
  refinementInstruction: z.string().min(1, 'La instrucción de refinamiento no puede estar vacía.'),
});

// Schemas para FindResources
export const FindResourcesInputSchema = z.object({
  topic: z.string().describe('The central topic to search resources for (e.g., "Python loops", "Photosynthesis").'),
  resourceType: z.string().describe('The type of resource to find (e.g., "Video de YouTube", "Artículo académico", "Simulación interactiva").'),
  subject: z.string().describe('The subject area for context (e.g., "Tecnología e Informática", "Ciencias Naturales").'),
  grade: z.string().describe('The grade level the resources should be appropriate for.'),
});

export const FoundResourceSchema = z.object({
    title: z.string().describe("The title of the resource."),
    url: z.string().url({ message: "La URL proporcionada no es válida." }).describe("The direct URL to access the resource."),
    description: z.string().describe("A brief description of why this resource is useful for a teacher."),
});

export const FindResourcesOutputSchema = z.object({
    resources: z.array(FoundResourceSchema).describe("A list of up to 3 high-quality resources found."),
});

// Schema for saving a resource to Firestore
export const SaveResourceInputSchema = FoundResourceSchema.extend({
    topic: z.string(),
    resourceType: z.string(),
    subject: z.string(),
    grade: z.string(),
});
