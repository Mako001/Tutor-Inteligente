"use client";

import { useState, useRef } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAs } from 'file-saver';
//import htmlToPdfmake from 'html-to-pdfmake';
//import pdfMake from 'pdfmake/build/pdfmake';
//import pdfFonts from 'pdfmake/build/vfs_fonts';

//pdfMake.vfs = pdfFonts.pdfMake.vfs;


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
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState<string | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
    const [fileType, setFileType] = useState<'html' | 'pdf'>('html');

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const aiResponse = await generateActivityProposal({
        ...values,
        grade: values.grade.join(", "),
        methodologyPreference: values.methodologyPreference.join(", "),
        competenciesToDevelop: values.competenciesToDevelop.join(", "),
        learningEvidences: values.learningEvidences.join(", "),
        curricularComponents: values.curricularComponents.join(", "),
        availableResources: values.availableResources.join(", "),
        contextAndNeeds: values.contextAndNeeds.join(", "),
      });
      setProposal(aiResponse?.activityProposal ?? "No se pudo generar la propuesta.");
      setEditedProposal(aiResponse?.activityProposal ?? "No se pudo generar la propuesta.");
      toast({
        title: "Propuesta generada!",
        description: "La propuesta de actividad ha sido generada exitosamente.",
      });
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message ||
          "Hubo un error al generar la propuesta. Por favor, intenta de nuevo.",
      });
      setProposal(null);
      setEditedProposal(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

    const downloadProposal = async () => {
        if (!proposal) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No hay propuesta para descargar.",
            });
            return;
        }

        if (fileType === 'html') {
            const blob = new Blob([proposal], { type: "text/html;charset=utf-8" });
            saveAs(blob, `propuesta_actividad.html`);
        } else if (fileType === 'pdf') {
            try {
                // Dynamically import the required modules
                const htmlToPdfmake = (await import('html-to-pdfmake' /* webpackChunkName: "htmlToPdfmake" */)).default;
                const pdfMake = (await import('pdfmake/build/pdfmake' /* webpackChunkName: "pdfMake" */)).default;
                const pdfFonts = (await import('pdfmake/build/vfs_fonts' /* webpackChunkName: "pdfFonts" */)).default;

                //pdfMake.vfs = pdfFonts.pdfMake.vfs;

                const doc = htmlToPdfmake(proposal);
                const docDefinition = {
                    content: doc,
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            marginBottom: 20
                        },
                        body: {
                            fontSize: 12
                        }
                    }
                };
               // pdfMake.createPdf(docDefinition).download("propuesta_actividad.pdf");
            } catch (error) {
                console.error("Error al generar el PDF:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo generar el PDF. Asegúrate de que todas las dependencias estén correctamente instaladas.",
                });
            }
        }
    };

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
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Grado(s) Específico(s):</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
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
              <FormField
                control={form.control}
                name="timeAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Tiempo Disponible:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Una clase, dos clases, una semana"
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
              <FormField
                control={form.control}
                name="centralTheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. Tema Central:</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Programación en Python, Robótica Educativa"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Cuál es el tema central que deseas abordar en esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="methodologyPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Metodología Preferida:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Tienes alguna preferencia metodológica o enfoque pedagógico para esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competenciesToDevelop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>5. Competencias a Desarrollar:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Cuáles son las competencias específicas del área de Tecnología e Informática que deseas que tus estudiantes desarrollen con esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="learningEvidences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6. Evidencias de Aprendizaje:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Qué evidencias de aprendizaje te permitirán verificar que tus estudiantes están desarrollando las competencias seleccionadas?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="curricularComponents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>7. Componentes Curriculares:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Cuáles componentes del área se abordarán principalmente en esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availableResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>8. Recursos Disponibles:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Qué recursos tienes disponibles para esta actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contextAndNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>9. Contexto y Necesidades:</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormDescription>
                      ¿Hay alguna necesidad o particularidad de tu contexto escolar o de tus estudiantes que deba considerar al diseñar la actividad?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interdisciplinarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>10. Interdisciplinariedad (Opcional):</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Integración con Matemáticas, Ciencias"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Te gustaría integrar esta actividad con otras áreas del conocimiento?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading || isEditing}>
                {isLoading ? "Generando propuesta..." : "Generar Propuesta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        {proposal && (
          <CardFooter className="flex flex-col items-center p-6">
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">Vista Preliminar de la Propuesta</h2>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4 mb-4">
                <div ref={proposalRef} dangerouslySetInnerHTML={{ __html: editedProposal || proposal }} />
              </ScrollArea>
            </div>
            <div className="flex justify-between items-center w-full">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button variant="ghost" onClick={handleCancelClick}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Editar Formulario
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                                    <Button>Descargar Propuesta</Button>
                                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Descargar propuesta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Selecciona el formato para descargar la propuesta de
                      actividad.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={downloadProposal}>
                                            <select
                                                value={fileType}
                                                onChange={(e) => setFileType(e.target.value as 'html' | 'pdf')}
                                                className="rounded-md border-input text-sm"
                                            >
                                                <option value="html">HTML</option>
                                                <option value="pdf">PDF</option>
                                            </select>
                                            Descargar
                                        </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

