'use client';

import { useState, FormEvent, useContext, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Sparkles, Lightbulb, FileText, Workflow, ArrowLeft, Save } from 'lucide-react';
import { generateActivity, refineActivity } from '@/ai/flows/generate-activity';
import { type GenerateSingleActivityInput } from '@/lib/types';
import { saveActivity } from '@/lib/firebase/actions/activity-actions';
import { AuthContext } from '@/lib/firebase/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { curriculumData } from '@/lib/data/curriculum';
import { cn } from '@/lib/utils';
import { ExportButtons } from '@/components/export-buttons';

const subjectOptions = Object.keys(curriculumData);
const gradeOptions = [
  "6º", "7º", "8º", "9º", "10º", "11º", "Otro"
];
const activityTypeOptions = [
    "Introducción / Rompehielos",
    "Explicación de Concepto",
    "Práctica Guiada",
    "Práctica Independiente / Taller",
    "Actividad Colaborativa / en Grupo",
    "Debate o Discusión",
    "Evaluación Formativa / Mini-Quiz",
    "Actividad de Cierre / Síntesis",
    "Presentación de Proyecto",
];
const durationOptions = [
    "5-10 minutos",
    "15-20 minutos",
    "25-30 minutos",
    "35-45 minutos",
    "1 hora clase completa",
    "Flexible",
];

const activityDepthOptions = [
    { value: "Lluvia de Ideas", label: "Lluvia de Ideas", description: "Genera una lista de 3 a 5 ideas concisas para actividades.", icon: Lightbulb },
    { value: "Actividad Detallada", label: "Actividad Detallada", description: "Desarrolla una única actividad con instrucciones para el docente y el estudiante.", icon: FileText },
    { value: "Mini-Secuencia", label: "Mini-Secuencia", description: "Diseña una secuencia corta para una sesión de clase (inicio, desarrollo y cierre).", icon: Workflow },
];

export default function CreateActivityPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<GenerateSingleActivityInput>({
    activityDepth: 'Actividad Detallada',
    subject: 'Tecnología e Informática',
    grade: '9º',
    activityType: 'Práctica Guiada',
    duration: '25-30 minutos',
    topic: '',
    learningObjective: '',
    availableResources: '',
  });
  
  const [resultado, setResultado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  
  const [isRefining, setIsRefining] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof GenerateSingleActivityInput, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (value: string) => {
      setFormData(prev => ({...prev, activityDepth: value}));
  };
  
  const handleSaveActivity = async () => {
    if (!user || !resultado) {
        toast({ variant: "destructive", title: "Error", description: "No hay ninguna actividad que guardar o no estás autenticado." });
        return;
    }
    setIsSaving(true);
    const dataToSave = {
        userId: user.uid,
        learningObjective: formData.learningObjective || "Actividad sin título",
        subject: formData.subject,
        grade: formData.grade,
        textoGenerado: resultado,
    };
    const result = await saveActivity(dataToSave as any);
    if (result.success) {
        toast({ title: "¡Actividad Guardada!", description: "Tu actividad se ha guardado en la biblioteca." });
    } else {
        toast({ variant: "destructive", title: "Error al guardar", description: result.error });
    }
    setIsSaving(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setResultado('');

    if (!formData.learningObjective) {
        setError("El objetivo de aprendizaje es obligatorio para generar una actividad con propósito.");
        setCargando(false);
        return;
    }

    try {
      const response = await generateActivity(formData);
      
      if (response.success) {
        setResultado(response.data);
      } else {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error al generar la actividad",
          description: response.error,
        });
      }
    } catch (apiError: any) {
      setError(apiError.message || "Ocurrió un error desconocido al generar la actividad.");
    } finally {
      setCargando(false);
    }
  };

  const handleRefineActivity = async () => {
    if (!refinementInstruction.trim() || !resultado) return;

    setIsRefining(true);
    setError('');
    const originalActivity = resultado;

    try {
        const response = await refineActivity({
            originalProposal: originalActivity,
            refinementInstruction,
        });

        if (response.success) {
            setResultado(response.data);
            setRefinementInstruction('');
        } else {
            setError(response.error);
            setResultado(originalActivity); // Restore original
            toast({ variant: "destructive", title: "Error al Refinar", description: response.error });
        }
    } catch (apiError: any) {
        setError(apiError.message || 'Error inesperado.');
        setResultado(originalActivity);
        toast({ variant: "destructive", title: "Error al Refinar", description: apiError.message });
    } finally {
        setIsRefining(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const progressValue = (step / 3) * 100;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Generador de Actividades de Aprendizaje</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Diseña actividades específicas para tus clases de forma rápida y guiada.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card className="w-full shadow-lg">
              <CardHeader>
                  <CardTitle>Paso {step} de 3</CardTitle>
                  <Progress value={progressValue} className="w-full mt-2" />
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 min-h-[400px]">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in">
                        <h2 className="text-xl font-semibold">Paso 1: Contexto Curricular</h2>
                        <div>
                          <Label htmlFor="subject">Materia</Label>
                          <Select name="subject" value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                            <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                            <SelectContent>{subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="grade">Grado</Label>
                          <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                            <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                            <SelectContent>{gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="topic">Tema de la Unidad o Clase (Opcional)</Label>
                          <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleInputChange} placeholder="Ej: La Revolución Industrial" />
                        </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in">
                        <h2 className="text-xl font-semibold">Paso 2: Define la Actividad</h2>
                        <div>
                            <Label>Nivel de Detalle</Label>
                            <RadioGroup value={formData.activityDepth} onValueChange={handleRadioChange} className="grid grid-cols-1 gap-4 mt-2">
                                {activityDepthOptions.map(option => (
                                   <Label key={option.value} htmlFor={option.value} className={cn(
                                       "flex flex-col items-start p-4 rounded-lg border-2 cursor-pointer transition-colors",
                                       formData.activityDepth === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                        </div>
                         <div>
                          <Label htmlFor="learningObjective">Objetivo de Aprendizaje *</Label>
                          <Textarea id="learningObjective" name="learningObjective" value={formData.learningObjective} onChange={handleInputChange} required placeholder="Ej: Identificar las partes de una célula, aplicar la fórmula del área, etc." rows={3}/>
                        </div>
                    </div>
                  )}
                   {step === 3 && (
                    <div className="space-y-6 animate-in fade-in">
                        <h2 className="text-xl font-semibold">Paso 3: Detalles Operativos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                            <Label htmlFor="duration">Duración Estimada</Label>
                            <Select name="duration" value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                                <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                                <SelectContent>{durationOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                            </div>
                             <div>
                            <Label htmlFor="activityType">Tipo de Actividad</Label>
                            <Select name="activityType" value={formData.activityType} onValueChange={(value) => handleSelectChange('activityType', value)}>
                                <SelectTrigger id="activityType"><SelectValue /></SelectTrigger>
                                <SelectContent>{activityTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="availableResources">Recursos Disponibles (Opcional)</Label>
                            <Input id="availableResources" name="availableResources" value={formData.availableResources || ''} onChange={handleInputChange} placeholder="Ej: Proyector, acceso a internet, cartulinas" />
                        </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {step > 1 ? (
                     <Button type="button" variant="ghost" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                    </Button>
                  ) : <div />}

                  {step < 3 ? (
                    <Button type="button" onClick={nextStep}>Siguiente</Button>
                  ) : (
                    <Button type="submit" className="w-1/2" disabled={cargando || !user}>
                        {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {cargando ? 'Generando...' : 'Generar Actividad'}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>

            {resultado && !cargando && (
              <Card className="w-full shadow-lg animate-in fade-in">
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
                          placeholder="Ej: Conviértela en una actividad grupal, añade criterios de evaluación, hazla más corta."
                          rows={3}
                          disabled={isRefining}
                      />
                  </CardContent>
                  <CardFooter>
                      <Button onClick={handleRefineActivity} disabled={isRefining || !refinementInstruction.trim()}>
                          {isRefining ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refinando...</>
                          ) : (
                          <><Sparkles className="mr-2 h-4 w-4" /> Refinar</>
                          )}
                      </Button>
                  </CardFooter>
              </Card>
            )}
        </div>

        <Card className="w-full shadow-lg sticky top-8">
            <CardHeader>
                <CardTitle>Resultado: Actividad Generada</CardTitle>
                <CardDescription>Aquí aparecerá la propuesta de la IA. Puedes refinarla, guardarla en tu biblioteca o exportarla.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] max-h-[60vh] overflow-y-auto">
                {cargando && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p>La IA está generando tu actividad. Por favor, espera...</p>
                    </div>
                )}
                {error && !cargando && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-destructive text-center">{error}</p>
                    </div>
                )}
                {!cargando && !error && resultado && (
                    <div ref={contentRef} className="markdown-content-in-card">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {resultado}
                      </ReactMarkdown>
                    </div>
                )}
                 {!cargando && !error && !resultado && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">La actividad generada aparecerá aquí.</p>
                    </div>
                )}
            </CardContent>
            {resultado && !cargando && (
                <CardFooter className="flex flex-wrap justify-end gap-2">
                    <Button onClick={handleSaveActivity} disabled={isSaving || !user}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <ExportButtons contentRef={contentRef} fileName={formData.learningObjective || 'actividad'} />
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
