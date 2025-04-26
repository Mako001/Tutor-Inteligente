"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  methodologyPreference: z.string().min(1, {
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
  availableResources: z.string().min(1, {
    message: "Por favor, especifica los recursos disponibles.",
  }),
  contextAndNeeds: z.string().min(1, {
    message: "Por favor, especifica el contexto y las necesidades.",
  }),
  interdisciplinarity: z.string().optional(),
});

const gradeOptions = [
  { label: "10º", value: "10º" },
  { label: "11º", value: "11º" },
  { label: "Otro", value: "otro" },
];

const competenciesOptions = [
  { label: "Pensamiento algorítmico", value: "Pensamiento algorítmico" },
  { label: "Resolución de problemas", value: "Resolución de problemas" },
  { label: "Creatividad e innovación", value: "Creatividad e innovación" },
  { label: "Comunicación y colaboración", value: "Comunicación y colaboración" },
];

const learningEvidencesOptions = [
  { label: "Diseño de un programa", value: "Diseño de un programa" },
  { label: "Presentación de un proyecto", value: "Presentación de un proyecto" },
  { label: "Elaboración de un informe", value: "Elaboración de un informe" },
  { label: "Desarrollo de un prototipo", value: "Desarrollo de un prototipo" },
];

const curricularComponentsOptions = [
  { label: "Naturaleza y Evolución de la Tecnología", value: "Naturaleza y Evolución de la Tecnología" },
  { label: "Apropiación y Uso de la Tecnología", value: "Apropiación y Uso de la Tecnología" },
  { label: "Solución de Problemas con Tecnología", value: "Solución de Problemas con Tecnología" },
  { label: "Tecnología y Sociedad", value: "Tecnología y Sociedad" },
];

export default function Home() {
  const [proposal, setProposal] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: [],
      timeAvailable: "",
      centralTheme: "",
      methodologyPreference: "",
      competenciesToDevelop: [],
      learningEvidences: [],
      curricularComponents: [],
      availableResources: "",
      contextAndNeeds: "",
      interdisciplinarity: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const aiResponse = await generateActivityProposal({
        ...values,
        grade: values.grade.join(", "),
        competenciesToDevelop: values.competenciesToDevelop.join(", "),
        learningEvidences: values.learningEvidences.join(", "),
        curricularComponents: values.curricularComponents.join(", "),
      });
      setProposal(aiResponse?.activityProposal ?? "No se pudo generar la propuesta.");
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
    } finally {
      setIsLoading(false);
    }
  }

  const downloadProposal = () => {
    if (!proposal) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay propuesta para descargar.",
      });
      return;
    }

    const blob = new Blob([proposal], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "propuesta_actividad.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                    <div className="grid grid-cols-2 gap-2">
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
                    <FormControl>
                      <Input
                        placeholder='Ej: Aprendizaje Basado en Proyectos, "Abierto a sugerencias"'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Tienes alguna preferencia metodológica o enfoque pedagógico para esta
                      actividad?
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
                      ¿Cuáles son las competencias específicas del área de Tecnología e
                      Informática que deseas que tus estudiantes desarrollen con esta
                      actividad?
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
                      ¿Qué evidencias de aprendizaje te permitirán verificar que tus
                      estudiantes están desarrollando las competencias seleccionadas?
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
                      ¿Cuáles componentes del área se abordarán principalmente en esta
                      actividad?
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
                    <FormControl>
                      <Input
                        placeholder="Ej: Computadores, acceso a internet, software"
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Estudiantes con dificultades en programación"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Hay alguna necesidad o particularidad de tu contexto escolar o de tus
                      estudiantes que deba considerar al diseñar la actividad?
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

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generando propuesta..." : "Generar Propuesta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        {proposal && (
          <CardFooter className="flex justify-between items-center p-6">
            <div className="text-sm text-muted-foreground">
              ¡Propuesta lista para ser implementada!
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Descargar Propuesta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Descargar propuesta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres descargar la propuesta de actividad?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={downloadProposal}>
                    Descargar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
