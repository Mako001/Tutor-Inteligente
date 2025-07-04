// src/app/plans/create/page.tsx
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
import { generateClassPlan } from '@/ai/flows/generate-class-plan';
import { type GenerateClassPlanInput } from '@/ai/flows/schemas';
import { savePlan } from '@/lib/firebase/actions/plan-actions';
import { AuthContext } from '@/lib/firebase/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { curriculumData, CurriculumData } from '@/lib/data/curriculum';

// Interfaz para los datos del formulario del Plan de Clase
interface PlanFormData {
  planTitle: string;
  subject: string;
  grade: string;
  totalDuration: string;
  bigIdea: string;
  competencies: string[];
  specificObjectives: string;
  sessionSequence: string;
  summativeAssessment: string;
  formativeAssessment: string;
  generalResources: string;
  differentiation: string;
  interdisciplinarity: string;
}

// Opciones
const subjectOptions = Object.keys(curriculumData);
const gradeOptions = [
  "6º", "7º", "8º", "9º", "10º", "11º",
  "Básica Primaria (1º-5º)",
  "Básica Secundaria (6º-9º)",
  "Media Académica (10º-11º)",
  "Otro"
];
const durationOptions = [
    "1 Semana (3-5 horas)",
    "2 Semanas (6-10 horas)",
    "3 Semanas (11-15 horas)",
    "1 Mes (16-20 horas)",
    "Proyecto de Periodo (20+ horas)",
];

const wizardSteps = [
    { id: 1, name: 'Visión General' },
    { id: 2, name: 'Estándares y Competencias' },
    { id: 3, name: 'Secuencia de Sesiones' },
    { id: 4, name: 'Evaluación y Recursos' },
    { id: 5, name: 'Detalles Finales' },
];

export default function CreatePlanPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({
    planTitle: '',
    subject: 'Tecnología e Informática',
    grade: '6º',
    totalDuration: '',
    bigIdea: '',
    competencies: [],
    specificObjectives: '',
    sessionSequence: '',
    summativeAssessment: '',
    formativeAssessment: '',
    generalResources: '',
    differentiation: '',
    interdisciplinarity: '',
  });

  const [dynamicOptions, setDynamicOptions] = useState<CurriculumData>(curriculumData[formData.subject]);
  const [resultadoTexto, setResultadoTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const data = curriculumData[formData.subject];
    if (data) {
      setDynamicOptions(data);
      setFormData(prev => ({
        ...prev,
        competencies: [],
      }));
    }
  }, [formData.subject]);

  const totalSteps = wizardSteps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(step => step - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof PlanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const list = prev.competencies;
      if (list.includes(value)) {
        return { ...prev, competencies: list.filter(item => item !== value) };
      } else {
        return { ...prev, competencies: [...list, value] };
      }
    });
  };

  const guardarPlanEnFirebase = async (planGenerado: string, datos: PlanFormData) => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado para guardar." });
        return;
    }
    // Create a slim version of the data for saving
    const dataToSave = {
        userId: user.uid,
        planTitle: datos.planTitle,
        subject: datos.subject,
        grade: datos.grade,
        textoGenerado: planGenerado,
        // include any other fields you want to save for filtering/display
    };
    const result = await savePlan(dataToSave as any); // Cast needed due to schema mismatch
    if (result.success) {
        toast({ title: "¡Plan Guardado!", description: "Tu plan de clase se ha guardado en la biblioteca." });
    } else {
        setError(`Error al guardar el plan: ${result.error}`);
    }
  };

  const handleGenerarPlan = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setResultadoTexto('');
    setError('');

    if (!formData.planTitle || !formData.bigIdea) {
      setError("Por favor, completa al menos el Título y el Gran Objetivo de Aprendizaje.");
      setCargando(false);
      return;
    }
    
    const flowInput: GenerateClassPlanInput = {
      ...formData,
      competencies: formData.competencies.join(', '), // Convert array to string for the flow
    };

    try {
      const responseText = await generateClassPlan(flowInput);
      setResultadoTexto(responseText);
      await guardarPlanEnFirebase(responseText, formData);
    } catch (apiError: any) {
      setError(`Hubo un error al generar el plan: ${apiError.message}`);
    } finally {
      setCargando(false);
    }
  };
  
  const Stepper = () => (
    <div className="flex justify-center items-center gap-2 md:gap-4 mb-8 flex-wrap">
      {wizardSteps.map((step, index) => (
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
          {index < totalSteps - 1 && <div className="flex-1 h-px bg-border max-w-16" />}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-secondary">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Asistente de Plan de Clase Completo</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Diseña una secuencia didáctica completa para un periodo académico.
        </p>
      </header>
      
      <main className="w-full max-w-4xl">
        <Card className="shadow-2xl">
          <CardHeader>
            <Stepper />
            <CardTitle className="text-center text-2xl">
              {wizardSteps.find(s => s.id === currentStep)?.name}
            </CardTitle>
             <CardDescription className="text-center">
              Paso {currentStep} de {totalSteps}. Sigue los pasos para generar tu plan de clase.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleGenerarPlan}>
            <CardContent className="space-y-8 min-h-[300px]">
              
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50">
                   <div>
                      <Label htmlFor="planTitle" className="block text-lg font-semibold text-foreground mb-2">Título del Plan de Clase</Label>
                      <Input id="planTitle" name="planTitle" value={formData.planTitle} onChange={handleInputChange} required placeholder="Ej: Fundamentos de la Ciudadanía Digital" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="subject" className="block text-lg font-semibold text-foreground mb-2">Materia</Label>
                        <Select name="subject" value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                          <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                          <SelectContent>{subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="grade" className="block text-lg font-semibold text-foreground mb-2">Grado(s)</Label>
                        <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                          <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                          <SelectContent>{gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                   </div>
                   <div>
                        <Label htmlFor="totalDuration" className="block text-lg font-semibold text-foreground mb-2">Duración Total</Label>
                        <Select name="totalDuration" value={formData.totalDuration} onValueChange={(value) => handleSelectChange('totalDuration', value)}>
                          <SelectTrigger id="totalDuration"><SelectValue placeholder="Selecciona la duración estimada"/></SelectTrigger>
                          <SelectContent>{durationOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                   </div>
                   <div>
                      <Label htmlFor="bigIdea" className="block text-lg font-semibold text-foreground mb-2">Gran Objetivo de Aprendizaje (Big Idea)</Label>
                      <Textarea id="bigIdea" name="bigIdea" value={formData.bigIdea} onChange={handleInputChange} required placeholder="Describe el concepto central que los estudiantes deben comprender al finalizar el plan. Ej: La tecnología es una herramienta poderosa que debe usarse de forma ética y responsable para resolver problemas reales." rows={4}/>
                   </div>
                </div>
              )}
              
              {currentStep === 2 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">Estándares y Competencias (MEN)</Label>
                      <CardDescription>Selecciona las competencias clave del Ministerio de Educación que abordará este plan.</CardDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                        {dynamicOptions?.competencias.map((comp, index) => (
                          <div key={`comp-${index}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted">
                            <Checkbox id={`comp-${index}`} checked={formData.competencies.includes(comp)} onCheckedChange={() => handleCheckboxChange(comp)} />
                            <Label htmlFor={`comp-${index}`} className="text-sm cursor-pointer">{comp}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="specificObjectives" className="block text-lg font-semibold text-foreground mb-2">Objetivos de Aprendizaje Específicos</Label>
                      <Textarea id="specificObjectives" name="specificObjectives" value={formData.specificObjectives} onChange={handleInputChange} placeholder="Lista lo que los estudiantes serán capaces de hacer al finalizar. Ej: - Identificar riesgos en línea. - Crear una contraseña segura. - Explicar el concepto de huella digital." rows={5}/>
                   </div>
                 </div>
              )}

              {currentStep === 3 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div>
                      <Label htmlFor="sessionSequence" className="block text-lg font-semibold text-foreground mb-2">Secuencia de Sesiones / Actividades</Label>
                      <Textarea id="sessionSequence" name="sessionSequence" value={formData.sessionSequence} onChange={handleInputChange} placeholder="Describe la secuencia de clases o actividades. Puedes usar un formato como:&#10;Semana 1: Introducción a la Ciudadanía Digital. Actividad: Lluvia de ideas sobre 'ser un buen ciudadano en internet'.&#10;Semana 2: Huella Digital y Privacidad. Actividad: Analizar su propia huella digital y configurar ajustes de privacidad." rows={10}/>
                    </div>
                 </div>
              )}

              {currentStep === 4 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div>
                      <Label htmlFor="summativeAssessment" className="block text-lg font-semibold text-foreground mb-1">Evaluación Sumativa</Label>
                      <Textarea name="summativeAssessment" id="summativeAssessment" rows={4} value={formData.summativeAssessment} onChange={handleInputChange} placeholder="¿Cómo medirás el aprendizaje al final del plan? Ej: Creación de una campaña de concienciación sobre seguridad en línea (video, póster, presentación)." />
                    </div>
                    <div>
                      <Label htmlFor="formativeAssessment" className="block text-lg font-semibold text-foreground mb-1">Evaluación Formativa</Label>
                      <Textarea name="formativeAssessment" id="formativeAssessment" rows={4} value={formData.formativeAssessment} onChange={handleInputChange} placeholder="¿Cómo monitorearás el progreso durante el plan? Ej: Discusiones en clase, tickets de salida, quizzes cortos en Kahoot sobre conceptos clave." />
                    </div>
                    <div>
                      <Label htmlFor="generalResources" className="block text-lg font-semibold text-foreground mb-1">Recursos Generales</Label>
                      <Textarea name="generalResources" id="generalResources" rows={4} value={formData.generalResources} onChange={handleInputChange} placeholder="Lista los recursos necesarios para todo el plan. Ej: Acceso a computadores, proyector, videos de Common Sense Education, artículos de PantallasAmigas." />
                    </div>
                 </div>
              )}
              
              {currentStep === 5 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div>
                      <Label htmlFor="differentiation" className="block text-lg font-semibold text-foreground mb-1">Diferenciación</Label>
                      <Textarea name="differentiation" id="differentiation" rows={4} value={formData.differentiation} onChange={handleInputChange} placeholder="¿Cómo adaptarás el plan para estudiantes con diferentes necesidades y niveles de habilidad? Ej: Grupos flexibles, recursos de apoyo adicionales, proyectos con diferentes niveles de complejidad." />
                    </div>
                    <div>
                      <Label htmlFor="interdisciplinarity" className="block text-lg font-semibold text-foreground mb-1">Interdisciplinariedad</Label>
                      <Textarea name="interdisciplinarity" id="interdisciplinarity" value={formData.interdisciplinarity} onChange={handleInputChange} placeholder="¿Cómo se puede conectar este plan con otras materias? Ej: Ética (dilemas morales en línea), Español (escritura de guiones para la campaña), Artes (diseño de pósters)." rows={4}/>
                    </div>
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
                 {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext}>Siguiente</Button>
                 ) : (
                  <Button type="submit" disabled={cargando || !user}>
                    {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generar y Guardar Plan
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
              <p className="text-muted-foreground">La IA está diseñando tu plan de clase, por favor espera...</p>
            </div>
          )}
          {error && !cargando && (
            <div className="propuesta-generada-estilizada-error p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
              <h2 className="text-xl font-semibold text-destructive mb-3">Error al Generar Plan</h2>
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
        </section>
      </main>
    </div>
  );
}
