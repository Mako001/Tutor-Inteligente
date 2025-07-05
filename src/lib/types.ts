// src/lib/types.ts
// Este archivo es neutral, no tiene 'use server', puede ser importado por cualquiera.

// Para el formulario de CREAR ACTIVIDAD
export interface GenerateSingleActivityInput {
  activityDepth: string;
  subject: string;
  grade: string;
  topic?: string;
  activityType: string;
  duration: string;
  learningObjective: string;
  availableResources?: string;
}

// Para el formulario de CREAR PLAN
export interface PlanFormData {
    planDepth: string;
    planTitle: string;
    subject: string;
    grade: string;
    totalDuration: string;
    bigIdea: string;
    competencies: string[]; // El formulario usa un array
    specificObjectives: string;
    sessionSequence: string;
    summativeAssessment: string;
    formativeAssessment: string;
    generalResources: string;
    differentiation: string;
    interdisciplinarity: string;
}

// Para la ACCIÓN DE IA de CREAR PLAN
export interface GenerateClassPlanInput {
    planDepth: string;
    planTitle: string;
    subject: string;
    grade: string;
    totalDuration: string;
    bigIdea: string;
    competencies: string; // La acción espera un string
    specificObjectives: string;
    sessionSequence: string;
    summativeAssessment: string;
    formativeAssessment: string;
    generalResources: string;
    differentiation: string;
    interdisciplinarity: string;
}

// Para la búsqueda de recursos en la biblioteca
export interface FindResourcesInput {
  topic: string;
  resourceType: string;
  subject: string;
  grade: string;
}

// Para un recurso encontrado por la IA
export interface FoundResource {
    title: string;
    url: string;
    description: string;
}

// Para la salida de la acción de buscar recursos
export interface FindResourcesOutput {
    resources: FoundResource[];
}
