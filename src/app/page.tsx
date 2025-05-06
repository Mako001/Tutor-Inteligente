"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateActivityProposal } from "@/ai/flows/generate-activity-proposal";
import { useToast } from "@/hooks/use-toast";
// Remove unused imports for download functionality
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { saveAs } from 'file-saver';
// import * as docx from 'docx'; // Removed - DOCX generation logic deleted

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Firebase Firestore imports - Assuming you might use them later
import { firestore } from '@/lib/firebase/client'; // Correct import path
import { collection, addDoc, getDocs } from 'firebase/firestore';


const initialGreeting =
  "¡Hola, colega docente de Informática de bachillerato! Estoy aquí para ayudarte a diseñar actividades de aprendizaje significativas y contextualizadas para tus estudiantes. Para comenzar, necesito que reflexionemos juntos sobre algunos aspectos clave. Responder a las siguientes preguntas me permitirá generar una propuesta de actividad ajustada a tus necesidades y a los lineamientos del MEN.";

const formSchema = z.object({
  grade: z.array(z.string()).min(1, {
    message: "Por favor, especifica el grado.",
  }),
  timeAvailable: z.string().min(1, {
    message: "Por favor, especifica el tiempo disponible.",
  }),
  centralTheme: z.string().min(1, {
    message: "Por favor, especifica el tema central.",
  }),
  methodologyPreference: z.array(z.string()).min(1, {
    message: "Por favor, especifica la metodología preferida.",
  }),
  competenciesToDevelop: z.array(z.string()).min(1, {
    message: "Por favor, especifica las competencias a desarrollar.",
  }),
  learningEvidences: z.array(z.string()).min(1, {
    message: "Por favor, especifica las evidencias de aprendizaje.",
  }),
  curricularComponents: z.array(z.string()).min(1, {
    message: "Por favor, especifica los componentes curriculares.",
  }),
  availableResources: z.array(z.string()).min(1, {
    message: "Por favor, especifica los recursos disponibles.",
  }),
  contextAndNeeds: z.array(z.string()).min(1, {
    message: "Por favor, especifica el contexto y las necesidades.",
  }),
  interdisciplinarity: z.string().optional(),
});

const gradeOptions = [
  { label: "6º", value: "6º" },
  { label: "7º", value: "7º" },
  { label: "8º", value: "8º" },
  { label: "9º", value: "9º" },
  { label: "10º", value: "10º" },
  { label: "11º", value: "11º" },
];

const methodologyOptions = [
  { label: "Aprendizaje Basado en Proyectos (ABP)", value: "Aprendizaje Basado en Proyectos (ABP)" },
  { label: "Aprendizaje Basado en Problemas (ABPr)", value: "Aprendizaje Basado en Problemas (ABPr)" },
  { label: "Aula Invertida (Flipped Classroom)", value: "Aula Invertida (Flipped Classroom)" },
  { label: "Aprendizaje Cooperativo", value: "Aprendizaje Cooperativo" },
  { label: "Gamificación", value: "Gamificación" },
  { label: "Enseñanza Explícita", value: "Enseñanza Explícita" },
  { label: "Aprendizaje por Indagación", value: "Aprendizaje por Indagación" },
  { label: "Otra", value: "Otra" },
  { label: "Abierto a sugerencias", value: "Abierto a sugerencias" },
];

const competenciesOptions = [
    { label: "Pensamiento algorítmico", value: "Pensamiento algorítmico" },
    { label: "Resolución de problemas", value: "Resolución de problemas" },
    { label: "Creatividad e innovación", value: "Creatividad e innovación" },
    { label: "Comunicación y colaboración", value: "Comunicación y colaboración" },
    { label: "Pensamiento crítico", value: "Pensamiento crítico" },
    { label: "Aprender a aprender", value: "Aprender a aprender" },
    { label: "Ciudadanía digital", value: "Ciudadanía digital" },
    { label: "Ética y responsabilidad", value: "Ética y responsabilidad" },
    { label: "Modelado y simulación", value: "Modelado y simulación" },
    { label: "Análisis de datos", value: "Análisis de datos" },
    { label: "Diseño de interfaces", value: "Diseño de interfaces" },
    { label: "Desarrollo de videojuegos", value: "Desarrollo de videojuegos" },
    { label: "Diseño de aplicaciones móviles", value: "Diseño de aplicaciones móviles" },
    { label: "Robótica", value: "Robótica" },
    { label: "Inteligencia Artificial", value: "Inteligencia Artificial" },
    { label: "Pensamiento computacional", value: "Pensamiento computacional" },
    { label: "Ciberseguridad", value: "Ciberseguridad" },
    { label: "Realidad Virtual y Aumentada", value: "Realidad Virtual y Aumentada" },
    { label: "Internet de las Cosas (IoT)", value: "Internet de las Cosas (IoT)" },
    { label: "Analítica de datos", value: "Analítica de datos" },
    { label: "Desarrollo de software", value: "Desarrollo de software" },
];

const learningEvidencesOptions = [
    { label: "Diseño de un programa", value: "Diseño de un programa" },
    { label: "Presentación de un proyecto", value: "Presentación de un proyecto" },
    { label: "Elaboración de un informe", value: "Elaboración de un informe" },
    { label: "Desarrollo de un prototipo", value: "Desarrollo de un prototipo" },
    { label: "Creación de un video tutorial", value: "Creación de un video tutorial" },
    { label: "Participación en un debate", value: "Participación en un debate" },
    { label: "Realización de una investigación", value: "Realización de una investigación" },
    { label: "Simulación de un proceso", value: "Simulación de un proceso" },
    { label: "Construcción de un modelo", value: "Construcción de un modelo" },
    { label: "Desarrollo de una aplicación móvil", value: "Desarrollo de una aplicación móvil" },
    { label: "Creación de un portafolio digital", value: "Creación de un portafolio digital" },
    { label: "Diseño de una página web", value: "Diseño de una página web" },
    { label: "Elaboración de un mapa conceptual", value: "Elaboración de un mapa conceptual" },
    { label: "Desarrollo de un videojuego", value: "Desarrollo de un videojuego" },
    { label: "Diseño de una base de datos", value: "Diseño de una base de datos" },
    { label: "Creación de una presentación multimedia", value: "Creación de una presentación multimedia" },
    { label: "Desarrollo de un sistema de información", value: "Desarrollo de un sistema de información" },
    { label: "Elaboración de un blog", value: "Elaboración de un blog" },
    { label: "Creación de un podcast", value: "Creación de un podcast" },
    { label: "Diseño de una infografía", value: "Diseño de una infografía" },
    { label: "Desarrollo de un proyecto de robótica", value: "Desarrollo de un proyecto de robótica" },
    { label: "Creación de una simulación interactiva", value: "Creación de una simulación interactiva" },
    { label: "Diseño de una animación digital", value: "Diseño de una animación digital" },
    { label: "Desarrollo de una solución de ciberseguridad", value: "Desarrollo de una solución de ciberseguridad" },
    { label: "Diseño de un plan de marketing digital", value: "Diseño de un plan de marketing digital" },
    { label: "Implementación de una estrategia de e-commerce", value: "Implementación de una estrategia de e-commerce" },
    { label: "Creación de un gemelo digital", value: "Creación de un gemelo digital" },
];

const curricularComponentsOptions = [
    { label: "Naturaleza y Evolución de la Tecnología", value: "Naturaleza y Evolución de la Tecnología" },
    { label: "Apropiación y Uso de la Tecnología", value: "Apropiación y Uso de la Tecnología" },
    { label: "Solución de Problemas con Tecnología", value: "Solución de Problemas con Tecnología" },
    { label: "Tecnología y Sociedad", value: "Tecnología y Sociedad" },
    { label: "Diseño y construcción", value: "Diseño y construcción" },
    { label: "Materiales", value: "Materiales" },
    { label: "Representación y expresión técnica", value: "Representación y expresión técnica" },
    { label: "Ciencia, tecnología y sociedad", value: "Ciencia, tecnología y sociedad" },
    { label: "Sistemas tecnológicos", value: "Sistemas tecnológicos" },
    { label: "Información y comunicación", value: "Información y comunicación" },
    { label: "Pensamiento algorítmico", value: "Pensamiento algorítmico" },
    { label: "Programación", value: "Programación" },
    { label: "Robótica", value: "Robótica" },
    { label: "Inteligencia artificial", value: "Inteligencia artificial" },
    { label: "Componentes de diseño", value: "Componentes de diseño" },
    { label: "Sistemas operativos", value: "Sistemas operativos" },
    { label: "Bases de datos", value: "Bases de datos" },
    { label: "Redes de computadoras", value: "Redes de computadoras" },
    { label: "Ingeniería del software", value: "Ingeniería del software" },
    { label: "Modelación de sistemas", value: "Modelación de sistemas" },
];

const availableResourcesOptions = [
    { label: "Computadores", value: "Computadores" },
    { label: "Acceso a internet", value: "Acceso a internet" },
    { label: "Software específico", value: "Software específico" },
    { label: "Laboratorio de informática", value: "Laboratorio de informática" },
    { label: "Robots educativos", value: "Robots educativos" },
    { label: "Tabletas", value: "Tabletas" },
    { label: "Impresora 3D", value: "Impresora 3D" },
    { label: "Otros materiales", value: "Otros materiales" },
    { label: "Plataformas de aprendizaje en línea", value: "Plataformas de aprendizaje en línea" },
    { label: "Herramientas de diseño gráfico", value: "Herramientas de diseño gráfico" },
    { label: "Simuladores", value: "Simuladores" },
    { label: "Dispositivos móviles", value: "Dispositivos móviles" },
    { label: "Realidad virtual/aumentada", value: "Realidad virtual/aumentada" },
    { label: "Pizarras digitales interactivas", value: "Pizarras digitales interactivas" },
    { label: "Kits de electrónica", value: "Kits de electrónica" },
    { label: "Drones", value: "Drones" },
];

const contextAndNeedsOptions = [
    { label: "Estudiantes con dificultades en programación", value: "Estudiantes con dificultades en programación" },
    { label: "Estudiantes con alta motivación por la tecnología", value: "Estudiantes con alta motivación por la tecnología" },
    { label: "Aula con pocos recursos tecnológicos", value: "Aula con pocos recursos tecnológicos" },
    { label: "Necesidad de integrar la tecnología con otras áreas", value: "Necesidad de integrar la tecnología con otras áreas" },
    { label: "Promover el aprendizaje autónomo", value: "Promover el aprendizaje autónomo" },
    { label: "Fomentar la creatividad", value: "Fomentar la creatividad" },
    { label: "Adaptar la enseñanza a diferentes ritmos de aprendizaje", value: "Adaptar la enseñanza a diferentes ritmos de aprendizaje" },
    { label: "Estudiantes con necesidades educativas especiales", value: "Estudiantes con necesidades educativas especiales" },
    { label: "Promover la inclusión digital", value: "Promover la inclusión digital" },
    { label: "Abordar la brecha digital", value: "Abordar la brecha digital" },
    { label: "Fomentar el pensamiento crítico", value: "Fomentar el pensamiento crítico" },
    { label: "Promover el aprendizaje colaborativo", value: "Promover el aprendizaje colaborativo" },
    { label: "Fomentar la resolución de problemas", value: "Fomentar la resolución de problemas" },
    { label: "Desarrollar habilidades de comunicación", value: "Desarrollar habilidades de comunicación" },
];


export default function Home() {
  const [proposal, setProposal] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const resultadoRef = useRef<HTMLDivElement>(null); // Renamed from proposalRef
  // const [fileType, setFileType] = useState<'html' | 'pdf' | 'docx'>('html'); // Removed fileType state
  // const [isEditing, setIsEditing] = useState(false); // Removed isEditing state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: [],
      timeAvailable: "",
      centralTheme: "",
      methodologyPreference: [],
      competenciesToDevelop: [],
      learningEvidences: [],
      curricularComponents: [],
      availableResources: [],
      contextAndNeeds: [],
      interdisciplinarity: "",
    },
  });

  // --- Simulación de llamada a Gemini (Puedes reemplazar con tu lógica real) ---
  async function llamarGeminiAPI(promptCompleto: string): Promise<string> {
    console.log("Enviando a Gemini (simulado):", promptCompleto);
    // Aquí iría tu fetch real a la API de Gemini
    // Ejemplo: const response = await fetch('/api/gemini', { method: 'POST', body: JSON.stringify({ prompt: promptCompleto }) });
    // const data = await response.json();
    // return data.text; // O como sea que Gemini te devuelva el texto

    // Simulación con demora:
    return new Promise(resolve => {
        setTimeout(() => {
            // Accede a los valores del formulario usando form.getValues() dentro de la simulación si es necesario
            const formValues = form.getValues();
            resolve(`--- Respuesta Simulada de Gemini ---
            **Actividad Didáctica Generada**

            **Tema:** ${formValues.centralTheme}
            **Nivel:** ${formValues.grade.join(', ')}
            **Objetivo:** Que los estudiantes desarrollen competencias en ${formValues.competenciesToDevelop.join(', ')}.

            **Instrucciones:**
            1. Presentación del tema (${formValues.timeAvailable}).
            2. Actividad principal: [Detalle de la actividad basada en la descripción, usando los recursos: ${formValues.availableResources.join(', ')} y considerando ${formValues.contextAndNeeds.join(', ')}].
            3. Cierre y evaluación con base en ${formValues.learningEvidences.join(', ')}.

            **Recursos:** ${formValues.availableResources.join(', ')}
            **Evaluación:** Evidencias: ${formValues.learningEvidences.join(', ')}
            --- Fin Respuesta Simulada ---`);
        }, 1500); // Simula 1.5 segundos de espera
    });
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setProposal(null); // Clear previous proposal
    if (resultadoRef.current) {
      resultadoRef.current.innerHTML = '<p>Generando propuesta con IA...</p><div class="spinner"></div>'; // Show loading in the result div
    }

    try {
      const promptCompleto = `Genera una propuesta de actividad didáctica detallada para docentes.
        Tema: ${values.centralTheme}
        Grado(s): ${values.grade.join(", ")}
        Tiempo Disponible: ${values.timeAvailable}
        Metodología Preferida: ${values.methodologyPreference.join(", ")}
        Competencias a Desarrollar: ${values.competenciesToDevelop.join(", ")}
        Evidencias de Aprendizaje: ${values.learningEvidences.join(", ")}
        Componentes Curriculares: ${values.curricularComponents.join(", ")}
        Recursos Disponibles: ${values.availableResources.join(", ")}
        Contexto y Necesidades: ${values.contextAndNeeds.join(", ")}
        Interdisciplinariedad: ${values.interdisciplinarity || 'No especificada'}

        Estructura la respuesta claramente con secciones como Título, Objetivo, Descripción paso a paso, Materiales, Tiempo por sección, Evaluación.`;

      // Replace this with your actual AI call if needed, or use the simulated one
      // const aiResponse = await generateActivityProposal({ ... }); // Using the imported Genkit flow
      const respuestaGemini = await llamarGeminiAPI(promptCompleto); // Using the simulated function for now

      setProposal(respuestaGemini); // Store the AI response
      if (resultadoRef.current) {
         resultadoRef.current.innerText = respuestaGemini; // Display the response in the result div
         // Or use innerHTML if you trust the source and it contains HTML/Markdown:
         // resultadoRef.current.innerHTML = marked.parse(respuestaGemini); // Requires 'marked' library
      }

      toast({
        title: "Propuesta generada!",
        description: "La propuesta de actividad ha sido generada exitosamente.",
      });

    } catch (error: any) {
      console.error("Error generating proposal:", error);
      if (resultadoRef.current) {
         resultadoRef.current.innerHTML = '<p style="color: red;">Error al generar la propuesta. Revisa la consola para más detalles.</p>';
      }
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message ||
          "Hubo un error al generar la propuesta. Por favor, intenta de nuevo.",
      });
      setProposal(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Removed downloadProposal function as download functionality is removed

  return (
    <div className="flex justify-center items-start min-h-screen py-12 bg-secondary">
      <Card className="w-full max-w-3xl shadow-md rounded-lg overflow-hidden">
        <CardHeader className="py-4 px-6 bg-accent text-foreground">
          <CardTitle className="text-lg font-semibold">
            AprendeTech Colombia - Asistente para el Diseño de Actividades
          </CardTitle>
          <CardDescription className="text-sm">{initialGreeting}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Grade */}
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Grado(s) Específico(s):</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {gradeOptions.map((option) => (
                        <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), option.value])
                                  : field.onChange(field.value?.filter((value) => value !== option.value));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormDescription>
                      ¿Para qué grado(s) de bachillerato estás diseñando esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Time Available */}
              <FormField
                control={form.control}
                name="timeAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Tiempo Disponible:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 90 minutos, 2 bloques de 45 min, 1 semana"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿De cuánto tiempo dispones para implementar esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Central Theme */}
              <FormField
                control={form.control}
                name="centralTheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. Tema Central o Problema:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Introducción a HTML y CSS, Creación de un blog sencillo, Análisis de datos de redes sociales, Diseño de un prototipo para resolver X problema local"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Cuál es el tema central, habilidad específica o problema a resolver que deseas abordar?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Methodology */}
               <FormField
                control={form.control}
                name="methodologyPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Metodología Preferida:</FormLabel>
                     <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {methodologyOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      Selecciona las metodologías o enfoques pedagógicos que prefieres (o elige "Abierto a sugerencias").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Competencies */}
               <FormField
                control={form.control}
                name="competenciesToDevelop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5. Competencias a Desarrollar (MEN - Guía 30):</FormLabel>
                     <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {competenciesOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      Elige las competencias clave del área de Tecnología e Informática (y S.XXI) que la actividad buscará fortalecer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Learning Evidences */}
               <FormField
                control={form.control}
                name="learningEvidences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6. Evidencias de Aprendizaje:</FormLabel>
                     <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {learningEvidencesOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      ¿Qué productos, desempeños o acciones concretas te permitirán verificar el desarrollo de las competencias seleccionadas?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Curricular Components */}
               <FormField
                control={form.control}
                name="curricularComponents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>7. Componentes Curriculares (Orientaciones MEN):</FormLabel>
                    <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {curricularComponentsOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      Selecciona los componentes del área que se abordarán principalmente. Justifica brevemente si es necesario.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Available Resources */}
              <FormField
                control={form.control}
                name="availableResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>8. Recursos Disponibles:</FormLabel>
                    <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {availableResourcesOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      Marca los recursos tecnológicos y materiales con los que cuentas para esta actividad.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Context and Needs */}
              <FormField
                control={form.control}
                name="contextAndNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>9. Contexto y Necesidades Particulares:</FormLabel>
                    <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="grid grid-cols-1 gap-2">
                        {contextAndNeedsOptions.map((option) => (
                          <FormItem key={option.value} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(field.value?.filter((value) => value !== option.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormDescription>
                      ¿Hay alguna característica específica de tu grupo, institución o entorno que sea relevante considerar?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Interdisciplinarity */}
              <FormField
                control={form.control}
                name="interdisciplinarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>10. Interdisciplinariedad (Opcional):</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Integración con Matemáticas (estadística), Artes (diseño visual), Ciencias Sociales (impacto tecnológico)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Deseas que la actividad se conecte explícitamente con otra área del conocimiento? Si es así, indica cuál(es).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generando propuesta..." : "Generar Propuesta"}
              </Button>
            </form>
          </Form>
        </CardContent>
          {/* Footer removed as download/edit functionality is gone */}
          {/* {proposal && ( ... CardFooter removed ... )} */}
          {/* NUEVO: Contenedor para mostrar el resultado de la IA */}
          <CardFooter className="p-6 pt-0">
              <div id="resultadoIA" ref={resultadoRef} className="resultado-container w-full" aria-live="polite">
                  {/* Initial message or loading state can be handled here if needed, currently handled in onSubmit */}
                  {!isLoading && !proposal && <p className="text-muted-foreground">La propuesta generada aparecerá aquí.</p>}
              </div>
          </CardFooter>

      </Card>
      <Toaster /> {/* Add Toaster component here */}
    </div>
  );
}
