// src/lib/types.ts
// This file is neutral, no 'use server', can be imported by anyone.

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

export interface PlanFormData {
    planDepth: string;
    planTitle: string;
    subject: string;
    grade: string;
    totalDuration: string;
    bigIdea: string;
    competencies: string[]; // Form uses array
    specificObjectives: string;
    sessionSequence: string;
    summativeAssessment: string;
    formativeAssessment: string;
    generalResources: string;
    differentiation: string;
    interdisciplinarity: string;
}

export interface GenerateClassPlanInput {
    planDepth: string;
    planTitle: string;
    subject: string;
    grade: string;
    totalDuration: string;
    bigIdea: string;
    competencies: string; // Flow expects string
    specificObjectives: string;
    sessionSequence: string;
    summativeAssessment: string;
    formativeAssessment: string;
    generalResources: string;
    differentiation: string;
    interdisciplinarity: string;
}

export interface FindResourcesInput {
  topic: string;
  resourceType: string;
  subject: string;
  grade: string;
}

export interface FoundResource {
    title: string;
    url: string;
    description: string;
}

export interface FindResourcesOutput {
    resources: FoundResource[];
}
