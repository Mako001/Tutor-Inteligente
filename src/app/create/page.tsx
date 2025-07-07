'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { type ProposalFormData } from '@/lib/types';
import { GenerateProposalInputSchema } from '@/ai/flows/schemas';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { saveAs } from 'file-saver';
import { Packer, Document, Paragraph, TextRun } from 'docx';

const formFields = [
  { name: 'grado', label: '1. Grado(s) Específico(s)', placeholder: 'Ej: 10º, 11º, o ambos', component: 'input' },
  { name: 'tiempo', label: '2. Tiempo Disponible', placeholder: 'Ej: Una clase, dos semanas, un proyecto de periodo', component: 'input' },
  { name: 'tema', label: '3. Tema Central', placeholder: 'Describe el tema o problema a abordar', component: 'textarea' },
  { name: 'metodologia', label: '4. Metodología Preferida', placeholder: 'Ej: Aprendizaje Basado en Proyectos, Abierto a sugerencias', component: 'input' },
  { name: 'competencias', label: '5. Competencias a Desarrollar (MEN)', placeholder: 'Cita textualmente las competencias de las Orientaciones Curriculares', component: 'textarea' },
  { name: 'evidencias', label: '6. Evidencias de Aprendizaje', placeholder: 'Describe las acciones, productos o desempeños esperados', component: 'textarea' },
  { name: 'componentes', label: '7. Componentes Curriculares', placeholder: 'Ej: Naturaleza y Evolución de la Tecnología, Solución de Problemas...', component: 'textarea' },
  { name: 'recursos', label: '8. Recursos Disponibles', placeholder: 'Ej: Computadores, acceso a internet, software específico, kits de robótica', component: 'textarea' },
  { name: 'contexto', label: '9. Contexto y Necesidades Particulares', placeholder: 'Describe alguna particularidad de tu contexto escolar o estudiantes', component: 'textarea' },
  { name: 'interdisciplinariedad', label: '10. Interdisciplinariedad (Opcional)', placeholder: '¿Te gustaría integrar esta actividad con otras áreas del conocimiento?', component: 'input' },
];

export default function CreateProposalPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProposalFormData>({
    grado: '',
    tiempo: '',
    tema: '',
    metodologia: '',
    competencias: '',
    evidencias: '',
    componentes: '',
    recursos: '',
    contexto: '',
    interdisciplinariedad: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState('');

  // Load data from cookies on component mount
  useEffect(() => {
    const savedData = Cookies.get('proposalFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (e) {
        console.error("Failed to parse cookie data", e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    // Save to cookies on every change
    Cookies.set('proposalFormData', JSON.stringify(newFormData), { expires: 7 });
  };
  
  const handleDownload = () => {
    const doc = new Document({
        sections: [{
            children: resultado.split('\n\n').map(p => new Paragraph({
              children: [new TextRun(p)]
            })),
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "propuesta-de-actividad.docx");
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResultado('');
    
    // Zod validation on the client
    const validation = GenerateProposalInputSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: `El campo '${firstError.path[0]}' es obligatorio.`,
      });
      return;
    }

    setIsLoading(true);

    try {
      const responseText = await generateProposal(formData);
      setResultado(responseText);
    } catch (apiError: any) {
      setError(apiError.message || "Ocurrió un error desconocido al generar la propuesta.");
       toast({
        variant: "destructive",
        title: "Error de la IA",
        description: apiError.message || "Ocurrió un error desconocido.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
       <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <h1 className="text-4xl font-bold text-primary">Tutor Inteligente AprendeTech</h1>
            <CardDescription className="text-lg text-foreground/80 mt-2 px-6">
              ¡Hola, colega docente! Estoy aquí para ayudarte a diseñar actividades de aprendizaje significativas y contextualizadas. Responde a las siguientes preguntas para generar una propuesta ajustada a tus necesidades y a los lineamientos del MEN.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formFields.map((field) => (
                        <div key={field.name} className={field.component === 'textarea' ? 'md:col-span-2' : ''}>
                            <Label htmlFor={field.name} className="font-semibold">{field.label}</Label>
                            {field.component === 'input' ? (
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={formData[field.name as keyof ProposalFormData]}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={['grado', 'tiempo', 'tema', 'competencias', 'evidencias', 'componentes', 'recursos'].includes(field.name)}
                                />
                            ) : (
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    value={formData[field.name as keyof ProposalFormData]}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    rows={4}
                                    required={['grado', 'tiempo', 'tema', 'competencias', 'evidencias', 'componentes', 'recursos'].includes(field.name)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-4">
                 <Button type="submit" className="w-full md:w-1/2" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar Propuesta con IA
                        </>
                    )}
                </Button>
            </CardFooter>
        </form>
       </Card>

        {(resultado || isLoading || error) && (
            <Card className="w-full max-w-4xl mx-auto mt-8 shadow-lg">
                <CardHeader>
                    <CardTitle>Propuesta de Actividad Generada</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p>Creando una propuesta increíble...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="h-full flex items-center justify-center p-4 bg-destructive/10 rounded-md">
                            <p className="text-destructive text-center">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && resultado && (
                        <div className="markdown-content-in-card">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {resultado}
                        </ReactMarkdown>
                        </div>
                    )}
                </CardContent>
                {resultado && !isLoading && (
                    <CardFooter className="flex justify-end gap-2">
                         <Button variant="secondary" onClick={() => navigator.clipboard.writeText(resultado)}>
                            Copiar Texto
                        </Button>
                        <Button onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar .docx
                        </Button>
                    </CardFooter>
                )}
            </Card>
        )}
    </div>
  );
}
