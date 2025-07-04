// src/app/activities/create/page.tsx
'use client';

import { useState, FormEvent } from 'react';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Sparkles } from 'lucide-react';
import { generateActivity } from '@/ai/flows/generate-activity';
import { type GenerateSingleActivityInput } from '@/ai/flows/schemas';
import { curriculumData } from '@/lib/data/curriculum';

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

export default function CreateActivityPage() {
  const [formData, setFormData] = useState<GenerateSingleActivityInput>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof GenerateSingleActivityInput, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const responseText = await generateActivity(formData);
      setResultado(responseText);
    } catch (apiError: any) {
      setError(apiError.message || "Ocurrió un error desconocido al generar la actividad.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Generador de Actividades Modulares</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Diseña un bloque de construcción para tus planes de clase.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="w-full shadow-lg">
          <CardHeader>
              <CardTitle>Diseña tu Actividad</CardTitle>
              <CardDescription>Completa los campos para que la IA cree una actividad a tu medida.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityType">Tipo de Actividad</Label>
                  <Select name="activityType" value={formData.activityType} onValueChange={(value) => handleSelectChange('activityType', value)}>
                    <SelectTrigger id="activityType"><SelectValue /></SelectTrigger>
                    <SelectContent>{activityTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duración Estimada</Label>
                   <Select name="duration" value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                    <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                    <SelectContent>{durationOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="topic">Tema General del Plan (Opcional)</Label>
                <Input id="topic" name="topic" value={formData.topic || ''} onChange={handleInputChange} placeholder="Ej: La Revolución Industrial" />
              </div>
              <div>
                <Label htmlFor="learningObjective">Objetivo de Aprendizaje de la Actividad</Label>
                <Textarea id="learningObjective" name="learningObjective" value={formData.learningObjective} onChange={handleInputChange} required placeholder="Ej: Que los estudiantes puedan nombrar tres inventos clave de la época y su impacto." rows={3}/>
              </div>
               <div>
                <Label htmlFor="availableResources">Recursos Disponibles (Opcional)</Label>
                <Input id="availableResources" name="availableResources" value={formData.availableResources || ''} onChange={handleInputChange} placeholder="Ej: Proyector, acceso a internet, cartulinas" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar Actividad
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full shadow-lg sticky top-8">
            <CardHeader>
                <CardTitle>Actividad Generada</CardTitle>
                <CardDescription>Aquí aparecerá la propuesta de la IA. Puedes copiarla o guardarla.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] max-h-[60vh] overflow-y-auto">
                {cargando && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p>Creando una actividad increíble...</p>
                    </div>
                )}
                {error && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-destructive text-center">{error}</p>
                    </div>
                )}
                {!cargando && !error && resultado && (
                    <div className="markdown-content-in-card">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {resultado}
                      </ReactMarkdown>
                    </div>
                )}
                 {!cargando && !error && !resultado && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">La actividad aparecerá aquí.</p>
                    </div>
                )}
            </CardContent>
            {resultado && !cargando && (
                <CardFooter className="justify-end">
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resultado)}>
                        Copiar al Portapapeles
                    </Button>
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
