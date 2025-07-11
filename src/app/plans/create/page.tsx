'use client';

import { useState, FormEvent, useEffect, useContext, useRef } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { generateClassPlan, refineClassPlan } from '@/ai/flows/generate-class-plan';
import { type PlanFormData, type GenerateClassPlanInput } from '@/lib/types';
import { savePlan } from '@/lib/firebase/actions/plan-actions';
import { AuthContext } from '@/lib/firebase/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, BookCopy, FileText, Bot, Save, Sparkles } from 'lucide-react';
import { curriculumData, CurriculumData } from '@/lib/data/curriculum';
import { ExportButtons } from '@/components/export-buttons';

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

const planDepthOptions = [
    { value: "Esquema Rápido", label: "Esquema Rápido", description: "Crea un borrador inicial con el objetivo principal y las actividades clave.", icon: Bot },
    { value: "Plan Detallado", label: "Plan Detallado", description: "Desarrolla una secuencia didáctica completa con secciones curriculares detalladas.", icon: FileText },
    { value: "Proyecto Completo", label: "Proyecto Completo", description: "Elabora un plan de Aprendizaje Basado en Proyectos (ABP) de principio a fin.", icon: BookCopy },
];

export default function CreatePlanPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [formData, setFormData] = useState<PlanFormData>({
    planDepth: 'Plan Detallado',
    planTitle: '',
    subject: 'Tecnología e Informática',
    grade: '9º',
    totalDuration: '1 Semana (3-5 horas)',
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
  
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);


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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Omit<PlanFormData, 'competencies' | 'planDepth' | 'planTitle' | 'bigIdea' | 'specificObjectives' | 'sessionSequence' | 'summativeAssessment' | 'formativeAssessment' | 'generalResources' | 'differentiation' | 'interdisciplinarity' >, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
      setFormData(prev => ({...prev, planDepth: value}));
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

  const handleSavePlan = async () => {
    if (!user || !resultadoTexto) {
        toast({ variant: "destructive", title: "Error", description: "No hay plan para guardar o no estás autenticado." });
        return;
    };
    setIsSaving(true);
    const result = await savePlan({
        userId: user.uid,
        planTitle: formData.planTitle,
        subject: formData.subject,
        grade: formData.grade,
        textoGenerado: resultadoTexto,
    });
    if (result.success) {
        toast({ title: "¡Plan Guardado!", description: "Tu plan de clase se ha guardado en tu biblioteca." });
    } else {
        toast({ variant: "destructive", title: "Error al guardar", description: result.error || 'Ocurrió un error desconocido' });
    }
    setIsSaving(false);
  };

  const handleGenerarPlan = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setResultadoTexto('');
    setError('');

    if (!formData.planTitle || !formData.bigIdea) {
      const errorMessage = "Por favor, completa al menos el Título y el Gran Objetivo de Aprendizaje.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Campos incompletos", description: errorMessage });
      setCargando(false);
      return;
    }
    
    const flowInput: GenerateClassPlanInput = {
      ...formData,
      competencies: formData.competencies.join(', '), // Convert array to string for the flow
    };

    try {
      const response = await generateClassPlan(flowInput);
      if (response.success) {
        setResultadoTexto(response.data);
      } else {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error al generar el plan",
          description: response.error,
        });
      }
    } catch (apiError: any) {
      const message = `Hubo un error al generar el plan: ${apiError.message}`;
      setError(message);
      toast({ variant: "destructive", title: "Error inesperado", description: message });
    } finally {
      setCargando(false);
    }
  };

  const handleRefinePlan = async () => {
    if (!refinementInstruction.trim() || !resultadoTexto) return;

    setIsRefining(true);
    setError('');
    const originalPlan = resultadoTexto;

    try {
        const response = await refineClassPlan({
            originalProposal: originalPlan,
            refinementInstruction,
        });

        if (response.success) {
            setResultadoTexto(response.data);
            setRefinementInstruction('');
        } else {
            setError(response.error);
            setResultadoTexto(originalPlan); // Restore original text on failure
            toast({ variant: "destructive", title: "Error al Refinar", description: response.error });
        }
    } catch (apiError: any) {
        setError(apiError.message || 'Error inesperado.');
        setResultadoTexto(originalPlan);
        toast({ variant: "destructive", title: "Error al Refinar", description: apiError.message });
    } finally {
        setIsRefining(false);
    }
  };


  const renderFormContent = () => (
    <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg bg-card">
            <AccordionTrigger className="p-4 font-semibold text-lg">Información General</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div>
                  <Label htmlFor="planTitle">Título del Plan *</Label>
                  <Input id="planTitle" name="planTitle" value={formData.planTitle} onChange={handleInputChange} required placeholder="Ej: Fundamentos de la Ciudadanía Digital" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject">Materia *</Label>
                    <Select name="subject" value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                      <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                      <SelectContent>{subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade">Grado(s) *</Label>
                    <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                      <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                      <SelectContent>{gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                    <Label htmlFor="totalDuration">Duración Total *</Label>
                    <Select name="totalDuration" value={formData.totalDuration} onValueChange={(value) => handleSelectChange('totalDuration', value)}>
                      <SelectTrigger id="totalDuration"><SelectValue placeholder="Selecciona la duración estimada"/></SelectTrigger>
                      <SelectContent>{durationOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                  <Label htmlFor="bigIdea">Objetivo General o 'Gran Idea' *</Label>
                  <Textarea id="bigIdea" name="bigIdea" value={formData.bigIdea} onChange={handleInputChange} required placeholder="Describe el concepto central que los estudiantes deben comprender al finalizar el plan." rows={3}/>
                </div>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border rounded-lg bg-card">
            <AccordionTrigger className="p-4 font-semibold text-lg">Marco Curricular</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label>Estándares y Competencias (MEN)</Label>
                  <CardDescription>Selecciona las competencias clave que abordará tu plan.</CardDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md bg-secondary/30">
                    {dynamicOptions?.competencias.map((comp, index) => (
                      <div key={`comp-${index}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted">
                        <Checkbox id={`comp-${index}`} checked={formData.competencies.includes(comp)} onCheckedChange={() => handleCheckboxChange(comp)} />
                        <Label htmlFor={`comp-${index}`} className="text-sm cursor-pointer font-normal">{comp}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="specificObjectives">Objetivos Específicos (Opcional)</Label>
                  <Textarea id="specificObjectives" name="specificObjectives" value={formData.specificObjectives} onChange={handleInputChange} placeholder="Enumera lo que los estudiantes serán capaces de hacer al finalizar la unidad." rows={4}/>
                </div>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-lg bg-card">
            <AccordionTrigger className="p-4 font-semibold text-lg">Secuencia y Evaluación</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div>
                  <Label htmlFor="sessionSequence">Secuencia de Sesiones (Opcional)</Label>
                  <Textarea id="sessionSequence" name="sessionSequence" value={formData.sessionSequence} onChange={handleInputChange} placeholder="Esboza una posible secuencia de clases o fases del proyecto." rows={6}/>
                </div>
                <div>
                  <Label htmlFor="summativeAssessment">Evaluación Sumativa (Opcional)</Label>
                  <Textarea name="summativeAssessment" id="summativeAssessment" rows={3} value={formData.summativeAssessment} onChange={handleInputChange} placeholder="¿Cómo medirás el aprendizaje al final de la unidad?" />
                </div>
                <div>
                  <Label htmlFor="formativeAssessment">Evaluación Formativa (Opcional)</Label>
                  <Textarea name="formativeAssessment" id="formativeAssessment" rows={3} value={formData.formativeAssessment} onChange={handleInputChange} placeholder="¿Cómo monitorearás el progreso durante la unidad?" />
                </div>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border rounded-lg bg-card">
            <AccordionTrigger className="p-4 font-semibold text-lg">Recursos y Detalles Finales</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div>
                  <Label htmlFor="generalResources">Recursos y Materiales (Opcional)</Label>
                  <Textarea name="generalResources" id="generalResources" rows={3} value={formData.generalResources} onChange={handleInputChange} placeholder="Enumera los recursos necesarios para implementar el plan." />
                </div>
                <div>
                  <Label htmlFor="differentiation">Estrategias de Diferenciación (Opcional)</Label>
                  <Textarea name="differentiation" id="differentiation" rows={3} value={formData.differentiation} onChange={handleInputChange} placeholder="¿Cómo adaptarás el plan para atender a la diversidad de estudiantes?" />
                </div>
                <div>
                  <Label htmlFor="interdisciplinarity">Conexiones Interdisciplinares (Opcional)</Label>
                  <Textarea name="interdisciplinarity" id="interdisciplinarity" value={formData.interdisciplinarity} onChange={handleInputChange} placeholder="¿Cómo se puede conectar este plan con otras áreas del saber?" rows={3}/>
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <header className="text-center mb-10 py-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-primary">Generador de Planes de Clase</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Define la estructura y los detalles de tu plan. La IA utilizará esta información para generar una propuesta curricular a tu medida.
        </p>
      </header>
      
      <main className="w-full max-w-4xl">
        <form onSubmit={handleGenerarPlan} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Paso 1: Elige la Profundidad del Plan</CardTitle>
                    <CardDescription>Selecciona el nivel de detalle que deseas para tu plan de clase.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={formData.planDepth}
                        onValueChange={handleRadioChange}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {planDepthOptions.map(option => (
                           <Label key={option.value} htmlFor={option.value} className={cn(
                               "flex flex-col items-start p-4 rounded-lg border-2 cursor-pointer transition-colors",
                               formData.planDepth === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                           )}>
                                <RadioGroupItem value={option.value} id={option.value} className="sr-only"/>
                                <div className="flex items-center gap-3 mb-2">
                                    <option.icon className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-lg">{option.label}</span>
                                </div>
                                <span className="text-sm font-normal text-muted-foreground">{option.description}</span>
                           </Label>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Paso 2: Proporciona los Detalles del Plan</CardTitle>
                    <CardDescription>
                       Completa la información base. Los campos con * son obligatorios. Los demás son opcionales, pero mejoran la calidad de la propuesta de la IA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
            
            <div className="flex justify-end sticky bottom-4 z-10">
                <Button type="submit" size="lg" className="shadow-lg" disabled={cargando || !user}>
                    {cargando ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bot className="mr-2 h-5 w-5"/>}
                    {cargando ? 'Generando...' : 'Generar Plan'}
                </Button>
            </div>
        </form>

        <section id="resultadoIA" aria-live="polite" className="mt-10">
          {cargando && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-lg bg-card shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">La IA está generando tu plan de clase. Por favor, espera un momento...</p>
              <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos.</p>
            </div>
          )}
          {error && !cargando && (
            <div className="propuesta-generada-estilizada-error p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
              <h2 className="text-xl font-semibold text-destructive mb-3">Error al Generar Plan</h2>
              <p>{error}</p>
            </div>
          )}
          {resultadoTexto && !cargando && !error && (
            <>
                <Card className="shadow-lg mt-10">
                    <CardHeader>
                        <CardTitle>Resultado: Plan de Clase Generado</CardTitle>
                        <CardDescription>Revisa la propuesta de la IA. Puedes refinarla, guardarla o exportarla.</CardDescription>
                    </CardHeader>
                    <CardContent className="markdown-content-in-card bg-secondary/20 p-4 rounded-lg">
                        <div ref={contentRef}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {resultadoTexto}
                          </ReactMarkdown>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-end gap-2">
                        <Button onClick={handleSavePlan} disabled={isSaving || !user}>
                           {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                           {isSaving ? 'Guardando...' : 'Guardar en mi Biblioteca'}
                        </Button>
                        <ExportButtons contentRef={contentRef} fileName={formData.planTitle || 'plan-de-clase'} />
                    </CardFooter>
                </Card>

                <Card className="w-full max-w-4xl mt-4 shadow-lg">
                    <CardHeader>
                        <CardTitle>Refinar Propuesta</CardTitle>
                        <CardDescription>
                            Escribe una instrucción para que la IA modifique o mejore esta propuesta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={refinementInstruction}
                            onChange={(e) => setRefinementInstruction(e.target.value)}
                            placeholder="Ej: Añade una rúbrica de evaluación, enfócalo en trabajo colaborativo, adáptalo para estudiantes más jóvenes."
                            rows={3}
                            disabled={isRefining}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleRefinePlan} disabled={isRefining || !refinementInstruction.trim()}>
                            {isRefining ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refinando...</>
                            ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Refinar</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
