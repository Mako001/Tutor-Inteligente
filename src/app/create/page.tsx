// src/app/create/page.tsx
'use client';

import { useState, FormEvent, useEffect, Fragment, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { generateActivityProposal } from '@/ai/flows/generate-activity-proposal';
import { type GenerateActivityProposalInput } from '@/ai/flows/schemas';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { curriculumData, CurriculumData } from '@/lib/data/curriculum';
import { AuthContext } from '@/lib/firebase/auth-provider';
import { saveProposal } from '@/lib/firebase/actions/proposal-actions';
import { useToast } from '@/hooks/use-toast';

// Interfaz para los datos del formulario
interface FormData {
  subject: string;
  grade: string;
  timeAvailable: string;
  centralTheme: string;
  methodologyPreference: string;
  competenciesToDevelop: string[];
  learningEvidences: string[];
  curricularComponents: string[];
  availableResourcesCheckboxes: string[];
  recursos: string;
  contextAndNeeds: string[];
  actividad: string;
  evaluacion: string;
  interdisciplinarity?: string;
  detallesAdicionales: string;
}

type Complexity = 'Básico' | 'Intermedio' | 'Avanzado';

const subjectOptions = Object.keys(curriculumData);
const gradeOptions = [ "6º", "7º", "8º", "9º", "10º", "11º", /* ... */ ];
const tiempoOptions = [ /* ... */ ];
const methodologyOptions = [ /* ... */ ];
const resourcesOptions = [ /* ... */ ];
const contextNeedsOptions = [ /* ... */ ];
const wizardSteps = [
    { id: 1, name: 'Información Esencial' },
    { id: 2, name: 'Marco Pedagógico' },
    { id: 3, name: 'Recursos y Contexto' },
    { id: 4, name: 'Detalles Finales' },
];

export default function CreatePage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [complexity, setComplexity] = useState<Complexity | null>('Avanzado');
  const [formData, setFormData] = useState<FormData>({
    subject: 'Tecnología e Informática',
    grade: '6º',
    timeAvailable: '',
    centralTheme: '',
    methodologyPreference: 'Abierto a sugerencias de la IA',
    competenciesToDevelop: [],
    learningEvidences: [],
    curricularComponents: [],
    availableResourcesCheckboxes: [],
    recursos: '',
    contextAndNeeds: [],
    actividad: '',
    evaluacion: '',
    interdisciplinarity: '',
    detallesAdicionales: '',
  });

  const [dynamicOptions, setDynamicOptions] = useState<CurriculumData>(curriculumData[formData.subject]);
  const [resultadoTexto, setResultadoTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    const data = curriculumData[formData.subject];
    if (data) {
      setDynamicOptions(data);
      setFormData(prev => ({
        ...prev,
        competenciesToDevelop: [],
        learningEvidences: [],
        curricularComponents: [],
      }));
    }
  }, [formData.subject]);

  const totalSteps =
    complexity === 'Básico' ? 1
  : complexity === 'Intermedio' ? 2
  : complexity === 'Avanzado' ? 4
  : 1;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(step => step + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof Pick<FormData, 'competenciesToDevelop' | 'learningEvidences' | 'curricularComponents' | 'availableResourcesCheckboxes' | 'contextAndNeeds'>, value: string) => {
    setFormData(prev => {
      const list = (prev[category] as string[]) || [];
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...list, value] };
      }
    });
  };

  const guardarPropuestaEnFirebase = async (propuesta: string, datos: FormData) => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado para guardar." });
        return;
    }
    const dataToSave = {
        userId: user.uid,
        ...datos,
        competenciesToDevelop: datos.competenciesToDevelop.join(', '),
        learningEvidences: datos.learningEvidences.join(', '),
        curricularComponents: datos.curricularComponents.join(', '),
        availableResourcesCheckboxes: datos.availableResourcesCheckboxes.join(', '),
        contextAndNeeds: datos.contextAndNeeds.join(', '),
        textoGenerado: propuesta,
        complexity,
    };
    const result = await saveProposal(dataToSave as any); // Cast needed due to schema mismatch
    if (result.success) {
        toast({ title: "¡Propuesta Guardada!", description: "Tu propuesta se ha guardado en la biblioteca." });
    } else {
        setError(`Error al guardar la propuesta: ${result.error}`);
    }
  };
  
  const handleGenerarPropuesta = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setResultadoTexto('');
    setError('');

    if (!formData.centralTheme) {
      setError("Por favor, completa al menos el Tema Central.");
      setCargando(false);
      return;
    }
    
    const competenciesString = formData.competenciesToDevelop.join('\n- ');
    const evidencesString = formData.learningEvidences.join('\n- ');
    const componentsString = formData.curricularComponents.join('\n- ');
    const resourcesString = [
        ...formData.availableResourcesCheckboxes,
        formData.recursos
    ].filter(Boolean).join('\n- ');
    const contextString = formData.contextAndNeeds.join('\n- ');
    const themeWithDetails = [
      `Tema central: ${formData.centralTheme}`,
      formData.actividad ? `\n\nIdeas iniciales sobre la actividad: ${formData.actividad}` : '',
      formData.evaluacion ? `\n\nIdeas iniciales sobre la evaluación: ${formData.evaluacion}` : '',
      formData.detallesAdicionales ? `\n\nDetalles adicionales o tono deseado: ${formData.detallesAdicionales}` : '',
    ].join('');


    const flowInput: GenerateActivityProposalInput = {
      subject: formData.subject,
      grade: formData.grade,
      timeAvailable: formData.timeAvailable || "Flexible / A definir según avance",
      centralTheme: themeWithDetails,
      methodologyPreference: formData.methodologyPreference,
      competenciesToDevelop: competenciesString,
      learningEvidences: evidencesString,
      curricularComponents: componentsString,
      availableResources: resourcesString,
      contextAndNeeds: contextString,
      interdisciplinarity: formData.interdisciplinarity || 'No se especificó integración.',
    };

    try {
      const responseText = await generateActivityProposal(flowInput);
      setResultadoTexto(responseText);
      await guardarPropuestaEnFirebase(responseText, formData);

    } catch (apiErrorOrFetchError) {
      if (apiErrorOrFetchError instanceof Error) {
        setError(`Hubo un error al generar la propuesta con el asistente de IA: ${apiErrorOrFetchError.message}`);
      } else {
        setError("Hubo un error desconocido al generar la propuesta.");
      }
    } finally {
      setCargando(false);
    }
  };

  const Stepper = () => (
    <div className="flex justify-center items-center gap-2 md:gap-4 mb-8 flex-wrap">
      {wizardSteps.slice(0, complexity ? totalSteps : undefined).map((step, index) => (
        <Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors",
              currentStep > index + 1 ? "bg-green-500 text-white" :
              currentStep === index + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {currentStep > index + 1 ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span className={cn(
              "font-medium hidden md:inline transition-colors",
              currentStep === index + 1 ? "text-primary" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
          </div>
          {index < (complexity ? totalSteps : wizardSteps.length) - 1 && <div className="flex-1 h-px bg-border max-w-16" />}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-secondary" suppressHydrationWarning={true}>
      <header className="text-center mb-10 py-6">
        <h1 className="text-5xl font-bold text-primary">AprendeTech Colombia</h1>
        <p className="text-xl text-foreground/80 mt-2">Asistente IA para el Diseño de Actividades Educativas</p>
      </header>
      <main className="w-full max-w-4xl" suppressHydrationWarning={true}>
        <Card className="shadow-2xl">
          <CardHeader>
            <Stepper />
            <CardTitle className="text-center text-2xl">
              {wizardSteps.find(s => s.id === currentStep)?.name || "Crear Plan de Actividad"}
            </CardTitle>
             <CardDescription className="text-center">
              Paso {currentStep} de {totalSteps}. Sigue los pasos para generar tu propuesta.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleGenerarPropuesta}>
            <CardContent className="space-y-8">
              {!complexity && currentStep === 1 && (
                 <div className="text-center space-y-4 py-8">
                    <Label className="text-lg font-semibold text-foreground mb-4 block">Selecciona un nivel de complejidad para la planificación</Label>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => setComplexity('Básico')} variant="outline" size="lg">Básico</Button>
                        <Button onClick={() => setComplexity('Intermedio')} variant="outline" size="lg">Intermedio</Button>
                        <Button onClick={() => setComplexity('Avanzado')} size="lg">Avanzado</Button>
                    </div>
                    <p className="text-sm text-muted-foreground pt-4">
                        <b>Básico:</b> Solo información esencial. <br/>
                        <b>Intermedio:</b> Información esencial y marco pedagógico. <br/>
                        <b>Avanzado:</b> Todos los detalles para una planificación completa.
                    </p>
                 </div>
              )}
              {complexity && currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50">
                   {/* Fields for step 1 */}
                </div>
              )}
              {complexity && currentStep === 2 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    {/* Fields for step 2 */}
                 </div>
              )}
              {complexity && currentStep === 3 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    {/* Fields for step 3 */}
                 </div>
              )}
              {complexity && currentStep === 4 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    {/* Fields for step 4 */}
                 </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrev}>Anterior</Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                 {complexity && (
                  <Button type="button" variant="ghost" onClick={() => { setComplexity(null); setCurrentStep(1); }}>
                    Cambiar Nivel
                  </Button>
                 )}
                 {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} disabled={!complexity}>Siguiente</Button>
                 ) : (
                  <Button type="submit" disabled={cargando || !complexity || !user}>
                    {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generar y Guardar Propuesta
                  </Button>
                 )}
              </div>
            </CardFooter>
          </form>
        </Card>
        <section id="resultadoIA" aria-live="polite" className="mt-10">
          {cargando && (
            <div className="flex justify-center items-center p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <p className="text-muted-foreground">Generando propuesta...</p>
            </div>
          )}
          {error && !cargando && (
            <div className="propuesta-generada-estilizada-error p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
              <h2 className="text-xl font-semibold text-destructive mb-3">Error al Generar Propuesta</h2>
              <p>{error}</p>
            </div>
          )}
          {resultadoTexto && !cargando && !error && (
            <div className="propuesta-generada-estilizada">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {resultadoTexto}
              </ReactMarkdown>
            </div>
          )}
          {!resultadoTexto && !cargando && !error && (
            <div className="text-center text-muted-foreground py-10">
              <p>La propuesta generada aparecerá aquí después de completar el formulario.</p>
            </div>
          )}
        </section>
      </main>
      <footer className="text-center mt-16 py-6 text-sm text-muted-foreground" suppressHydrationWarning={true}>
        <p>© {currentYear || new Date().getFullYear()} AprendeTech Colombia. Todos los derechos reservados.</p>
        <p>Una herramienta para potenciar la educación en todas las áreas.</p>
      </footer>
    </div>
  );
}
