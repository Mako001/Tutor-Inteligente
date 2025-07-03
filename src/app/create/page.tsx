// src/app/create/page.tsx
'use client';

import { useState, FormEvent, useEffect, Fragment } from 'react';
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

// Opciones para los campos de selección múltiple y selectores
const subjectOptions = Object.keys(curriculumData);

const gradeOptions = [
  "6º", "7º", "8º", "9º", "10º", "11º",
  "Básica Primaria (1º-5º)",
  "Básica Secundaria (6º-9º)",
  "Media Académica (10º-11º)",
  "Media Técnica (10º-11º)",
  "Ciclos Lectivos Especiales Integrados (CLEI)",
  "Educación para Adultos",
  "Todos los grados de bachillerato (6º-11º)",
  "Otro (especificar en tema o detalles)"
];

const tiempoOptions = [
  { id: "t1", label: "1-2 horas clase (Sesión única o doble)" },
  { id: "t2", label: "3-4 horas clase (Varias sesiones, ej. 1 semana)" },
  { id: "t3", label: "Proyecto corto (5-8 horas clase, ej. 2 semanas)" },
  { id: "t4", label: "Proyecto mediano (9-15 horas clase, ej. 3-4 semanas)" },
  { id: "t5", label: "Proyecto largo o trimestral (+16 horas clase)" },
  { id: "t6", label: "Flexible / A definir según avance" },
  { id: "t7", label: "Micro-aprendizaje (menos de 1 hora)" },
];

const methodologyOptions = [
  { id: "meth_abp", label: "Aprendizaje Basado en Proyectos (ABP)" },
  { id: "meth_abpr", label: "Aprendizaje Basado en Problemas (ABPr)" },
  { id: "meth_gam", label: "Gamificación / Aprendizaje Basado en Juegos" },
  { id: "meth_inv", label: "Aula Invertida (Flipped Classroom)" },
  { id: "meth_design", label: "Pensamiento de Diseño (Design Thinking)" },
  { id: "meth_colab", label: "Aprendizaje Colaborativo / Cooperativo" },
  { id: "meth_steam", label: "Aprendizaje STEAM (Ciencia, Tecnología, Ingeniería, Artes y Matemáticas)" },
  { id: "meth_indag", label: "Aprendizaje por Indagación" },
  { id: "meth_exp", label: "Aprendizaje Experiencial" },
  { id: "meth_estcas", label: "Estudio de Casos" },
  { id: "meth_sim", label: "Simulaciones y Modelado" },
  { id: "meth_sugg", label: "Abierto a sugerencias de la IA" },
  { id: "meth_other", label: "Otro (especificar en detalles)" },
];

const resourcesOptions = [
  { id: "res_comp_int", label: "Computadores con acceso a internet." },
  { id: "res_software_basico", label: "Software básico (navegador, ofimática)." },
  { id: "res_software_esp", label: "Software especializado (IDE, diseño, etc.)." },
  { id: "res_dispmov", label: "Dispositivos móviles de los estudiantes." },
  { id: "res_proyector", label: "Proyector o pantalla." },
  { id: "res_plataf_colab", label: "Plataformas colaborativas en línea." },
  { id: "res_mat_prototipado", label: "Materiales para prototipado (cartón, reciclable)." },
  { id: "res_biblio_web", label: "Acceso a bibliotecas y recursos web." },
];

const contextNeedsOptions = [
  { id: "need_conect_limit", label: "Conectividad a internet limitada o intermitente." },
  { id: "need_pocos_equipos", label: "Número limitado de equipos (trabajo en equipo)." },
  { id: "need_diversidad_habil", label: "Diversos niveles de competencia digital." },
  { id: "need_inclusion", label: "Necesidad de adaptaciones para estudiantes con NEE." },
  { id: "need_foco_colab", label: "Énfasis en trabajo colaborativo." },
  { id: "need_motiv", label: "Contexto con baja motivación estudiantil." },
  { id: "need_context_rural", label: "Contexto rural con desafíos de acceso." },
  { id: "need_interes_local", label: "Intereses o problemáticas locales para abordar." },
];

const wizardSteps = [
    { id: 1, name: 'Información Esencial' },
    { id: 2, name: 'Marco Pedagógico' },
    { id: 3, name: 'Recursos y Contexto' },
    { id: 4, name: 'Detalles Finales' },
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
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
      // Reset selections when subject changes to avoid keeping irrelevant options
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
      setCurrentStep(step => step - 1);
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
    if (!firestore) {
      console.error("Firestore no está disponible. No se puede guardar.");
      setError("Error: No se pudo conectar a la base de datos para guardar.");
      return;
    }
    try {
      const dataToSave = {
        ...datos,
        competenciesToDevelop: datos.competenciesToDevelop.join(', '),
        learningEvidences: datos.learningEvidences.join(', '),
        curricularComponents: datos.curricularComponents.join(', '),
        availableResourcesCheckboxes: datos.availableResourcesCheckboxes.join(', '),
        contextAndNeeds: datos.contextAndNeeds.join(', '),
        textoGenerado: propuesta,
        timestamp: serverTimestamp(),
        complexity,
      };
      await addDoc(collection(firestore, "propuestas"), dataToSave);
      console.log("Propuesta guardada en Firebase");
    } catch (e: any) {
      console.error("Error al guardar en Firebase: ", e);
      setError(`Error al guardar la propuesta en la base de datos: ${e.message}`);
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
      console.error("Error en el flujo de generación:", apiErrorOrFetchError);
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
                   <div>
                      <Label htmlFor="subject" className="block text-lg font-semibold text-foreground mb-2">1. Materia o Área de Conocimiento:</Label>
                      <Select name="subject" value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                        <SelectTrigger id="subject"><SelectValue placeholder="Selecciona la materia" /></SelectTrigger>
                        <SelectContent>{subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade" className="block text-lg font-semibold text-foreground mb-2">2. Grado(s) Específico(s):</Label>
                      <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                        <SelectTrigger id="grade"><SelectValue placeholder="Selecciona el grado" /></SelectTrigger>
                        <SelectContent>{gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeAvailable" className="block text-lg font-semibold text-foreground mb-2">3. Tiempo Disponible:</Label>
                      <Select name="timeAvailable" value={formData.timeAvailable} onValueChange={(value) => handleSelectChange('timeAvailable', value)}>
                        <SelectTrigger id="timeAvailable"><SelectValue placeholder="Selecciona el tiempo" /></SelectTrigger>
                        <SelectContent>{tiempoOptions.map(t => <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="centralTheme" className="block text-lg font-semibold text-foreground mb-2">4. Tema Central o Problema:</Label>
                      <Input id="centralTheme" name="centralTheme" value={formData.centralTheme} onChange={handleInputChange} required placeholder="Ej: Introducción a la Programación con Python" />
                    </div>
                </div>
              )}
              
              {complexity && currentStep === 2 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div>
                      <Label htmlFor="methodologyPreference" className="block text-lg font-semibold text-foreground mb-2">5. Metodología Preferida:</Label>
                      <Select name="methodologyPreference" value={formData.methodologyPreference} onValueChange={(value) => handleSelectChange('methodologyPreference', value)}>
                        <SelectTrigger id="methodologyPreference"><SelectValue placeholder="Selecciona la metodología" /></SelectTrigger>
                        <SelectContent>{methodologyOptions.map(m => <SelectItem key={m.id} value={m.label}>{m.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">6. Competencias a Desarrollar:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">{dynamicOptions?.competencias.map((comp, index) => (<div key={`comp-${index}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"><Checkbox id={`comp-${index}`} checked={(formData.competenciesToDevelop || []).includes(comp)} onCheckedChange={() => handleCheckboxChange('competenciesToDevelop', comp)} /><Label htmlFor={`comp-${index}`} className="text-sm cursor-pointer">{comp}</Label></div>))}</div>
                    </div>
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">7. Evidencias de Aprendizaje:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">{dynamicOptions?.evidenciasAprendizaje.map((ev, index) => (<div key={`ev-${index}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"><Checkbox id={`ev-${index}`} checked={(formData.learningEvidences || []).includes(ev)} onCheckedChange={() => handleCheckboxChange('learningEvidences', ev)} /><Label htmlFor={`ev-${index}`} className="text-sm cursor-pointer">{ev}</Label></div>))}</div>
                    </div>
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">8. Componentes Curriculares:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">{dynamicOptions?.componentesCurriculares.map((item, index) => (<div key={`cc-${index}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"><Checkbox id={`cc-${index}`} checked={(formData.curricularComponents || []).includes(item)} onCheckedChange={() => handleCheckboxChange('curricularComponents', item)} /><Label htmlFor={`cc-${index}`} className="text-sm cursor-pointer">{item}</Label></div>))}</div>
                    </div>
                 </div>
              )}

              {complexity && currentStep === 3 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">9. Recursos Disponibles:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">{resourcesOptions.map(item => (<div key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"><Checkbox id={`res-${item.id}`} checked={(formData.availableResourcesCheckboxes || []).includes(item.label)} onCheckedChange={() => handleCheckboxChange('availableResourcesCheckboxes', item.label)} /><Label htmlFor={`res-${item.id}`} className="text-sm cursor-pointer">{item.label}</Label></div>))}</div>
                    </div>
                    <div>
                      <Label htmlFor="recursos" className="block text-sm font-medium text-foreground mb-1">Recursos Adicionales (texto libre):</Label>
                      <Textarea name="recursos" id="recursos" rows={2} value={formData.recursos} onChange={handleInputChange} placeholder="Ej: Plataforma LMS específica, software X." />
                    </div>
                    <div className="space-y-3">
                      <Label className="block text-lg font-semibold text-foreground">10. Contexto y Necesidades Particulares:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">{contextNeedsOptions.map(item => (<div key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted"><Checkbox id={`need-${item.id}`} checked={(formData.contextAndNeeds || []).includes(item.label)} onCheckedChange={() => handleCheckboxChange('contextAndNeeds', item.label)} /><Label htmlFor={`need-${item.id}`} className="text-sm cursor-pointer">{item.label}</Label></div>))}</div>
                    </div>
                 </div>
              )}

              {complexity && currentStep === 4 && (
                 <div className="space-y-6 animate-in fade-in-50">
                    <div>
                      <Label htmlFor="actividad" className="block text-lg font-semibold text-foreground mb-1">11. Ideas Iniciales sobre la Actividad (opcional):</Label>
                      <Textarea name="actividad" id="actividad" rows={4} value={formData.actividad} onChange={handleInputChange} placeholder="Describe los pasos, fases, roles que te imaginas, etc." />
                    </div>
                    <div>
                      <Label htmlFor="evaluacion" className="block text-lg font-semibold text-foreground mb-1">12. Ideas Iniciales sobre la Evaluación (opcional):</Label>
                      <Textarea name="evaluacion" id="evaluacion" rows={3} value={formData.evaluacion} onChange={handleInputChange} placeholder="¿Cómo planeas evaluar? Ej: Rúbrica, quiz, observación." />
                    </div>
                    <div>
                      <Label htmlFor="interdisciplinarity" className="block text-lg font-semibold text-foreground mb-1">13. Interdisciplinariedad (Opcional):</Label>
                      <Input name="interdisciplinarity" id="interdisciplinarity" value={formData.interdisciplinarity || ""} onChange={handleInputChange} placeholder="Ej: Matemáticas (cálculo de costos), Artes (diseño)." />
                    </div>
                    <div>
                      <Label htmlFor="detallesAdicionales" className="block text-lg font-semibold text-foreground mb-1">14. Detalles Adicionales o Tono Deseado (opcional):</Label>
                      <Textarea name="detallesAdicionales" id="detallesAdicionales" rows={2} value={formData.detallesAdicionales} onChange={handleInputChange} placeholder="Ej: Tono formal, creativo, incluir ejemplos para grado X." />
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
                 {complexity && (
                  <Button type="button" variant="ghost" onClick={() => { setComplexity(null); setCurrentStep(1); }}>
                    Cambiar Nivel
                  </Button>
                 )}
                 {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} disabled={!complexity}>Siguiente</Button>
                 ) : (
                  <Button type="submit" disabled={cargando || !complexity}>
                    {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generar Propuesta
                  </Button>
                 )}
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Sección de Resultado */}
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
