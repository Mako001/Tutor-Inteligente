// src/app/library/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, Save, BookOpen, AlertTriangle, FileText, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
import { type FindResourcesInput, type FoundResource, type SaveResourceInput } from '@/ai/flows/schemas';
import { findResources } from '@/ai/flows/find-resources';
import { getSavedResources, saveResource } from '@/lib/firebase/actions/resource-actions';
import { getSavedProposals, deleteProposal, updateProposal, type SavedProposal } from '@/lib/firebase/actions/proposal-actions';
import { curriculumData } from '@/lib/data/curriculum';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


const subjectOptions = Object.keys(curriculumData);
const gradeOptions = [ "6º", "7º", "8º", "9º", "10º", "11º", "Otro" ];
const resourceTypeOptions = [
    "Video de YouTube",
    "Simulación Interactiva",
    "Artículo o Blog Post",
    "Herramienta Online Gratuita",
    "Documento PDF / Guía",
    "Podcast Educativo",
];

type SavedResource = SaveResourceInput & { id: string };

export default function LibraryPage() {
  const { toast } = useToast();
  // State for search
  const [searchQuery, setSearchQuery] = useState<FindResourcesInput>({
    topic: '',
    resourceType: 'Video de YouTube',
    subject: 'Tecnología e Informática',
    grade: '9º',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundResources, setFoundResources] = useState<FoundResource[]>([]);

  // State for saved resources
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [libraryError, setLibraryError] = useState('');

  // State for saved proposals
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [proposalsError, setProposalsError] = useState('');

  // State for actions
  const [proposalToDelete, setProposalToDelete] = useState<SavedProposal | null>(null);
  const [proposalToEdit, setProposalToEdit] = useState<SavedProposal | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);


  const fetchSavedContent = async () => {
    setIsLoadingLibrary(true);
    setLibraryError('');
    const resResult = await getSavedResources();
    if (resResult.success && resResult.data) {
      setSavedResources(resResult.data);
    } else {
      setLibraryError(resResult.error || 'No se pudieron cargar los recursos.');
    }
    setIsLoadingLibrary(false);

    setIsLoadingProposals(true);
    setProposalsError('');
    const propResult = await getSavedProposals();
    if (propResult.success && propResult.data) {
      setSavedProposals(propResult.data);
    } else {
      setProposalsError(propResult.error || 'No se pudieron cargar las propuestas.');
    }
    setIsLoadingProposals(false);
  };

  useEffect(() => {
    fetchSavedContent();
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSelectChange = (name: keyof FindResourcesInput, value: string) => {
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setFoundResources([]);

    if (!searchQuery.topic) {
      setSearchError('Por favor, introduce un tema para buscar.');
      setIsSearching(false);
      return;
    }

    try {
      const result = await findResources(searchQuery);
      setFoundResources(result.resources);
    } catch (apiError: any) {
      setSearchError(apiError.message || 'Ocurrió un error desconocido al buscar recursos.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveResource = async (resource: FoundResource) => {
    const resourceToSave: SaveResourceInput = { ...resource, ...searchQuery };
    const result = await saveResource(resourceToSave);

    if (result.success) {
      toast({
        title: "¡Recurso Guardado!",
        description: `"${resource.title}" se ha añadido a tu biblioteca.`,
      });
      // Refetch resources
      const resResult = await getSavedResources();
      if (resResult.success && resResult.data) setSavedResources(resResult.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: result.error || 'No se pudo guardar el recurso.',
      });
    }
  };

  // Handlers for proposal actions
  const handleDeleteClick = (proposal: SavedProposal) => {
    setProposalToDelete(proposal);
  };

  const confirmDelete = async () => {
    if (!proposalToDelete) return;
    const result = await deleteProposal(proposalToDelete.id);
    if (result.success) {
      toast({ title: "¡Propuesta eliminada!", description: "La propuesta ha sido eliminada de tu biblioteca." });
      await fetchSavedContent();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setProposalToDelete(null);
  };

  const handleEditClick = (proposal: SavedProposal) => {
    setProposalToEdit(proposal);
    setEditedText(proposal.textoGenerado);
  };

  const confirmUpdate = async () => {
    if (!proposalToEdit) return;
    setIsUpdating(true);
    const result = await updateProposal(proposalToEdit.id, { textoGenerado: editedText });

    if (result.success) {
      toast({ title: "¡Propuesta actualizada!", description: "Los cambios han sido guardados." });
      await fetchSavedContent();
      setProposalToEdit(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsUpdating(false);
  };

  const SearchAndResults = () => (
    <div className="space-y-8">
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Buscador Inteligente de Recursos</CardTitle>
                <CardDescription>Describe lo que necesitas y la IA buscará en la web por ti.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSearch}>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="topic">Tema a Buscar</Label>
                        <Input id="topic" name="topic" value={searchQuery.topic} onChange={handleSearchInputChange} placeholder="Ej: Algoritmos de ordenamiento, La célula eucariota" required/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="resourceType">Tipo de Recurso</Label>
                            <Select name="resourceType" value={searchQuery.resourceType} onValueChange={(value) => handleSearchSelectChange('resourceType', value)}>
                                <SelectTrigger id="resourceType"><SelectValue /></SelectTrigger>
                                <SelectContent>{resourceTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="grade">Grado</Label>
                            <Select name="grade" value={searchQuery.grade} onValueChange={(value) => handleSearchSelectChange('grade', value)}>
                                <SelectTrigger id="grade"><SelectValue /></SelectTrigger>
                                <SelectContent>{gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="subject">Materia (para contexto)</Label>
                        <Select name="subject" value={searchQuery.subject} onValueChange={(value) => handleSearchSelectChange('subject', value)}>
                            <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                            <SelectContent>{subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSearching}>
                        {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Buscar Recursos
                    </Button>
                </CardFooter>
            </form>
        </Card>

        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Resultados de la Búsqueda</h2>
            {isSearching && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p>La IA está buscando los mejores recursos...</p>
                </div>
            )}
            {searchError && (
                <Card className="bg-destructive/10 border-destructive/50">
                    <CardHeader className="flex-row items-center gap-4">
                        <AlertTriangle className="h-6 w-6 text-destructive"/>
                        <CardTitle className="text-destructive">Error en la Búsqueda</CardTitle>
                    </CardHeader>
                    <CardContent><p>{searchError}</p></CardContent>
                </Card>
            )}
            {!isSearching && !searchError && foundResources.length > 0 && (
                <div className="space-y-4">
                    {foundResources.map((res, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg">{res.title}</CardTitle>
                                <CardDescription>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                        {res.url}
                                    </a>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{res.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handleSaveResource(res)} size="sm">
                                    <Save className="mr-2 h-4 w-4"/>
                                    Guardar en mi Biblioteca
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            {!isSearching && !searchError && foundResources.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Los resultados de la búsqueda aparecerán aquí.</p>
            )}
        </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Mi Biblioteca</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Encuentra, guarda y gestiona todo tu contenido educativo.
        </p>
      </header>

      <main className="space-y-8">
        <Accordion type="single" collapsible className="w-full shadow-lg rounded-xl border bg-card">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Search />
                        <span>Buscador Inteligente de Recursos</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <SearchAndResults />
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen/> Contenido Guardado</CardTitle>
                <CardDescription>Aquí están los recursos y propuestas que has guardado.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="proposals" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="proposals"><FileText className="mr-2"/> Propuestas de Actividad</TabsTrigger>
                        <TabsTrigger value="resources"><LinkIcon className="mr-2"/> Recursos (Enlaces)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="proposals" className="pt-4">
                        {isLoadingProposals && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p>Cargando tus propuestas...</p>
                            </div>
                        )}
                        {proposalsError && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                                <p className="text-destructive">{proposalsError}</p>
                            </div>
                        )}
                        {!isLoadingProposals && !proposalsError && savedProposals.length > 0 && (
                             <div className="space-y-3">
                                {savedProposals.map((prop) => (
                                    <Card key={prop.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary gap-4">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate" title={prop.centralTheme}>
                                            {prop.centralTheme || 'Propuesta sin título'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                            {prop.subject} &bull; Grado {prop.grade} &bull; Creado: {prop.timestamp?.toDate ? format(prop.timestamp.toDate(), 'd MMM yyyy', { locale: es }) : 'Fecha desconocida'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(prop)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Modificar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(prop)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Borrar</span>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                             </div>
                        )}
                         {!isLoadingProposals && !proposalsError && savedProposals.length === 0 && (
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-muted-foreground text-center">No has guardado ninguna propuesta todavía.<br/>¡Crea una desde la página de "Crear Plan de Clase"!</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="resources" className="pt-4">
                         {isLoadingLibrary && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p>Cargando tus recursos...</p>
                            </div>
                        )}
                        {libraryError && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                                <p className="text-destructive">{libraryError}</p>
                            </div>
                        )}
                        {!isLoadingLibrary && !libraryError && savedResources.length > 0 && (
                            <div className="space-y-4">
                                {savedResources.map((res) => (
                                    <div key={res.id} className="border p-4 rounded-lg bg-secondary">
                                    <h4 className="font-semibold">{res.title}</h4>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                                            {res.url}
                                    </a>
                                    <p className="text-sm text-muted-foreground mt-2">{res.description}</p>
                                    <div className="text-xs text-muted-foreground mt-2 space-x-2">
                                        <span>{res.subject}</span>
                                        <span>&bull;</span>
                                        <span>{res.grade}</span>
                                        <span>&bull;</span>
                                        <span>{res.resourceType}</span>
                                    </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isLoadingLibrary && !libraryError && savedResources.length === 0 && (
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-muted-foreground text-center">Tu biblioteca de recursos está vacía.<br/>¡Usa el buscador para encontrar y guardar nuevos recursos!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </main>

      {/* Dialog for Deleting */}
      {!!proposalToDelete && (
        <AlertDialog open onOpenChange={(isOpen) => !isOpen && setProposalToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la propuesta
                <strong className="mx-1">"{proposalToDelete.centralTheme}"</strong>
                de la base de datos.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProposalToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog for Editing */}
      {!!proposalToEdit && (
        <Dialog open onOpenChange={(isOpen) => !isOpen && setProposalToEdit(null)}>
            <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Modificar Propuesta: {proposalToEdit.centralTheme}</DialogTitle>
                <DialogDescription>
                Realiza los cambios necesarios en el texto generado por la IA.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={18}
                className="w-full"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setProposalToEdit(null)}>Cancelar</Button>
                <Button onClick={confirmUpdate} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
