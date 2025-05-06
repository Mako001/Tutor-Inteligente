// src/app/page.tsx
'use client'; // Esta página necesita ser un Client Component por los hooks y el manejo de eventos

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateActivityProposal, GenerateActivityProposalInput } from '@/ai/flows/generate-activity-proposal';
import { saveAs } from 'file-saver';
// Dynamically import docx and pdfmake related libraries only on client side
// import { Document, Packer, Paragraph, TextRun } from 'docx';
// import htmlToPdfmake from 'html-to-pdfmake';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;


const formSchema = z.object({
  grade: z.string().min(1, { message: "Debes seleccionar al menos un grado." }),
  timeAvailable: z.string().min(1, { message: "El tiempo disponible es requerido." }),
  centralTheme: z.string().min(3, { message: "El tema central debe tener al menos 3 caracteres." }),
  methodologyPreference: z.string().min(1, { message: "Debes seleccionar una metodología." }),
  competenciesToDevelop: z.array(z.string()).min(1, { message: "Debes seleccionar al menos una competencia." }),
  learningEvidences: z.array(z.string()).min(1, { message: "Debes seleccionar al menos una evidencia." }),
  curricularComponents: z.array(z.string()).min(1, { message: "Debes seleccionar al menos un componente curricular." }),
  availableResources: z.array(z.string()).min(1, { message: "Debes seleccionar al menos un recurso." }),
  contextAndNeeds: z.array(z.string()).min(1, { message: "Debes seleccionar al menos una necesidad." }),
  interdisciplinarity: z.string().optional(),
  activityDescription: z.string().min(10, { message: "La descripción de la actividad debe tener al menos 10 caracteres." }),
  evaluationMethod: z.string().min(3, { message: "El método de evaluación es requerido." }),
  additionalDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const initialFormValues: FormValues = {
  grade: "",
  timeAvailable: "",
  centralTheme: "",
  methodologyPreference: "",
  competenciesToDevelop: [],
  learningEvidences: [],
  curricularComponents: [],
  availableResources: [],
  contextAndNeeds: [],
  interdisciplinarity: "",
  activityDescription: "",
  evaluationMethod: "",
  additionalDetails: "",
};


export default function HomePage() {
  const [formInputData, setFormInputData] = useState<GenerateActivityProposalInput | null>(null);
  const [generatedProposalHtml, setGeneratedProposalHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [fileType, setFileType] = useState<'html' | 'pdf' | 'docx'>('html');


  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const handleGenerateProposal = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedProposalHtml('');
    setError('');
    setFormInputData(null);

    const mappedValues: GenerateActivityProposalInput = {
      grade: values.grade,
      timeAvailable: values.timeAvailable,
      centralTheme: values.centralTheme,
      methodologyPreference: values.methodologyPreference,
      competenciesToDevelop: values.competenciesToDevelop.join(', '),
      learningEvidences: values.learningEvidences.join(', '),
      curricularComponents: values.curricularComponents.join(', '),
      availableResources: values.availableResources.join(', '),
      contextAndNeeds: values.contextAndNeeds.join(', '),
      interdisciplinarity: values.interdisciplinarity || 'No aplica',
    };
    setFormInputData(mappedValues);


    try {
      // Llamada a la IA de Gemini
      const { activityProposal } = await generateActivityProposal(mappedValues);
      setGeneratedProposalHtml(activityProposal);

      // Guardar en Firebase
      if (firestore) {
        await addDoc(collection(firestore, "propuestas"), {
          ...mappedValues,
          activityProposal: activityProposal, // Guardar el texto plano o HTML generado
          timestamp: serverTimestamp(),
        });
        console.log("Propuesta guardada en Firebase");
      } else {
        console.warn("Firestore no está disponible. No se guardará la propuesta.");
      }

    } catch (apiError: any) {
      console.error("Error generando propuesta con IA:", apiError);
      setError(`Error al generar la propuesta con la IA: ${apiError.message || 'Error desconocido'}`);
      setGeneratedProposalHtml(`<p class="text-destructive">Error al generar la propuesta: ${apiError.message || 'Error desconocido'}</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedProposalHtml) {
      alert("Primero genera una propuesta.");
      return;
    }

    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    const htmlToPdfmake = (await import('html-to-pdfmake')).default;
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    pdfMake.vfs = pdfFonts.pdfMake.vfs;


    const fileName = "propuesta_actividad";

    if (fileType === 'docx') {
      const doc = new Document({
        sections: [{
          children: generatedProposalHtml.split('\n\n').map(paragraphText =>
            new Paragraph({
              children: paragraphText.split('\n').map(lineText => new TextRun(lineText))
            })
          ),
        }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
    } else if (fileType === 'pdf') {
      const pdfContent = htmlToPdfmake(generatedProposalHtml);
      const docDefinition = {
        content: pdfContent,
        defaultStyle: { font: 'Roboto' } // Asegúrate que Roboto esté en vfs_fonts o usa una fuente estándar
      };
      pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
    } else { // HTML
        const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${fileName}</title></head><body>${generatedProposalHtml}</body></html>`], { type: "text/html;charset=utf-8" });
        saveAs(blob, `${fileName}.html`);
    }
  };


  const competenciesOptions = [
    { id: "comp1", label: "Comprensión de conceptos tecnológicos básicos" },
    { id: "comp2", label: "Uso ético y responsable de la tecnología" },
    { id: "comp3", label: "Pensamiento computacional y resolución de problemas" },
    { id: "comp4", label: "Comunicación y colaboración en entornos digitales" },
    { id: "comp5", label: "Creatividad e innovación con herramientas tecnológicas" },
    { id: "comp6", label: "Análisis crítico de la información digital" },
  ];

  const evidencesOptions = [
    { id: "ev1", label: "Diseño y creación de un artefacto digital (presentación, video, sitio web simple)" },
    { id: "ev2", label: "Participación activa en debates sobre implicaciones éticas de la tecnología" },
    { id: "ev3", label: "Resolución de un problema utilizando un algoritmo o diagrama de flujo" },
    { id: "ev4", label: "Elaboración colaborativa de un documento o proyecto en línea" },
    { id: "ev5", label: "Presentación de una propuesta innovadora que use tecnología" },
    { id: "ev6", label: "Análisis de la veracidad de fuentes de información en línea" },
  ];

  const curricularComponentsOptions = [
    { id: "cc1", label: "Naturaleza y Evolución de la Tecnología" },
    { id: "cc2", label: "Apropiación y Uso de la Tecnología" },
    { id: "cc3", label: "Solución de Problemas con Tecnología" },
    { id: "cc4", label: "Tecnología y Sociedad" },
  ];

  const resourcesOptions = [
    { id: "res1", label: "Computadores con acceso a internet" },
    { id: "res2", label: "Software específico (editores de código, suites ofimáticas, etc.)" },
    { id: "res3", label: "Materiales de laboratorio o kits de robótica/electrónica" },
    { id: "res4", label: "Dispositivos móviles (tablets, smartphones)" },
    { id: "res5", label: "Proyector o pantalla interactiva" },
    { id: "res6", label: "Plataformas educativas en línea" },
  ];

  const contextNeedsOptions = [
    { id: "need1", label: "Aula con pocos recursos tecnológicos" },
    { id: "need2", label: "Estudiantes con diversos niveles de habilidad digital" },
    { id: "need3", label: "Necesidad de integrar la cultura local o regional" },
    { id: "need4", label: "Enfoque en desarrollo sostenible y medio ambiente" },
    { id: "need5", label: "Promoción de la equidad de género en tecnología" },
    { id: "need6", label: "Conectividad a internet limitada o intermitente" },
  ];


  return (
    <div 
      className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-secondary"
      suppressHydrationWarning={true}
    >
      <header className="text-center mb-10 py-6">
        <h1 className="text-5xl font-bold text-primary">AprendeTech Colombia</h1>
        <p className="text-xl text-foreground/80 mt-2">Asistente IA para el Diseño de Actividades Educativas en Tecnología e Informática</p>
      </header>

      <main className="w-full max-w-4xl bg-card p-8 rounded-xl shadow-2xl">
        <p className="text-muted-foreground mb-6 text-center">
          ¡Hola, colega docente de Informática de bachillerato! Estoy aquí para ayudarte a diseñar actividades de aprendizaje significativas y contextualizadas para tus estudiantes.
          Para comenzar, necesito que reflexionemos juntos sobre algunos aspectos clave. Responder a las siguientes preguntas me permitirá generar una propuesta de actividad ajustada a tus necesidades y a los lineamientos del MEN.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateProposal)} className="space-y-8" suppressHydrationWarning={true}>
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">1. Grado(s) Específico(s)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona el grado" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["6º", "7º", "8º", "9º", "10º", "11º", "Otro (especificar en tema)"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormDescription>¿Para qué grado(s) de bachillerato estás diseñando esta actividad?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">2. Tiempo Disponible</FormLabel>
                  <FormControl><Input placeholder="Ej: Una clase de 90 min, un proyecto de 4 semanas (1 clase/sem)" {...field} /></FormControl>
                  <FormDescription>Sé muy específico con la duración total y la distribución del tiempo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="centralTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">3. Tema Central o Problema</FormLabel>
                  <FormControl><Textarea placeholder="Describe el tema central o el problema específico detalladamente. Si no, indica un área temática general." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="methodologyPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">4. Metodología Preferida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona una metodología" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aprendizaje Basado en Proyectos (ABP)">Aprendizaje Basado en Proyectos (ABP)</SelectItem>
                      <SelectItem value="Aprendizaje Basado en Problemas (ABPr)">Aprendizaje Basado en Problemas (ABPr)</SelectItem>
                      <SelectItem value="Gamificación">Gamificación</SelectItem>
                      <SelectItem value="Aula Invertida">Aula Invertida</SelectItem>
                      <SelectItem value="Pensamiento de Diseño (Design Thinking)">Pensamiento de Diseño (Design Thinking)</SelectItem>
                      <SelectItem value="Abierto a sugerencias">Abierto a sugerencias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>¿Tienes alguna preferencia metodológica o enfoque pedagógico?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competenciesToDevelop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">5. Competencias a Desarrollar</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competenciesOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="competenciesToDevelop"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription>Selecciona las competencias del área de Tecnología e Informática (Orientaciones MEN, Guía 30).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="learningEvidences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">6. Evidencias de Aprendizaje</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evidencesOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="learningEvidences"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription>¿Qué acciones o productos permitirán verificar el desarrollo de competencias?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="curricularComponents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">7. Componentes Curriculares</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curricularComponentsOptions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="curricularComponents"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormDescription>¿Cuáles componentes del área se abordarán? Justifica brevemente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="availableResources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">8. Recursos Disponibles</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resourcesOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="availableResources"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription>Selecciona los recursos con los que cuentas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contextAndNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">9. Contexto y Necesidades Particulares</FormLabel>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contextNeedsOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="contextAndNeeds"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription>¿Alguna particularidad de tu contexto escolar o estudiantes a considerar?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="interdisciplinarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">10. Interdisciplinariedad (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: Matemáticas, Ciencias Sociales, Artes" {...field} /></FormControl>
                  <FormDescription>¿Te gustaría integrar esta actividad con otras áreas del conocimiento? Si es así, ¿con cuáles?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button type="submit" className="w-full text-lg py-3 bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
                ) : (
                  'Generar Propuesta de Actividad'
                )}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
          </form>
        </Form>

        {/* Sección de Resultado de la IA y Descarga */}
        {generatedProposalHtml && !isLoading && (
          <section className="mt-12 p-6 border border-border rounded-lg bg-background/50 shadow-lg">
            <h2 className="text-3xl font-semibold text-primary mb-6 text-center">Propuesta de Actividad Generada</h2>
            <div
              className="prose prose-lg max-w-none bg-white p-6 rounded-md shadow overflow-x-auto min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: generatedProposalHtml }}
            />

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <RadioGroup 
                  defaultValue="html" 
                  onValueChange={(value: 'html' | 'pdf' | 'docx') => setFileType(value)}
                  className="flex items-center gap-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="html" id="html-download"/>
                    <Label htmlFor="html-download">HTML</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf-download" />
                    <Label htmlFor="pdf-download">PDF</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="docx" id="docx-download" />
                    <Label htmlFor="docx-download">DOCX</Label>
                  </FormItem>
                </RadioGroup>
                <Button onClick={handleDownload} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Descargar Propuesta ({fileType.toUpperCase()})
                </Button>
            </div>
          </section>
        )}

      </main>

      <footer className="text-center mt-16 py-6 text-sm text-muted-foreground">
        <p>© {currentYear || new Date().getFullYear()} AprendeTech Colombia. Todos los derechos reservados.</p>
        <p>Una herramienta para potenciar la educación en Tecnología e Informática.</p>
      </footer>
    </div>
  );
}
