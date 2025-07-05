// src/app/library/page.tsx
'use client';

import { useState, useEffect, FormEvent, useContext } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Loader2, Search, Save, BookOpen, AlertTriangle, FileText, Link as LinkIcon, Pencil, Trash2, User, ClipboardList } from 'lucide-react';
import { type FindResourcesInput, type FoundResource } from '@/ai/flows/schemas';
import { findResources } from '@/ai/flows/find-resources';
import { getUserLibrary, saveResourceToLibrary } from '@/lib/firebase/actions/resource-actions';
import { getSavedActivities, deleteActivity, updateActivity } from '@/lib/firebase/actions/activity-actions';
import { getSavedPlans, deletePlan, updatePlan } from '@/lib/firebase/actions/plan-actions';
import type { SavedActivity } from '@/lib/firebase/actions/activity-schemas';
import type { SavedPlan } from '@/lib/firebase/actions/plan-schemas';
import type { Resource } from '@/lib/firebase/actions/resource-schemas';

import { curriculumData } from '@/lib/data/curriculum';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/lib/firebase/auth-provider';
import { Badge } from '@/components/ui/badge';


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

export default function LibraryPage() {
  const { user } = useContext(AuthContext);
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
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [libraryError, setLibraryError] = useState('');

  // State for saved activities
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');
  const [activityToDelete, setActivityToDelete] = useState<SavedActivity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<SavedActivity | null>(null);
  const [editedActivityText, setEditedActivityText] = useState('');
  const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

  // State for saved plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [planToDelete, setPlanToDelete] = useState<SavedPlan | null>(null);
  const [planToEdit, setPlanToEdit] = useState<SavedPlan | null>(null);
  const [editedPlanText, setEditedPlanText] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  useEffect(() => {
    const fetchSavedContent = async () => {
      if (!user) {
        setIsLoadingLibrary(false);
        setIsLoadingActivities(false);
        setIsLoadingPlans(false);
        return;
      };

      // Fetch Saved Resources
      setIsLoadingLibrary(true);
      setLibraryError('');
      try {
        const resources = await getUserLibrary(user.uid);
        setSavedResources(resources);
      } catch (e: any) {
        setLibraryError(e.message || 'No se pudieron cargar los recursos.');
      } finally {
        setIsLoadingLibrary(false);
      }
      
      // Fetch Saved Activities
      setIsLoadingActivities(true);
      setActivitiesError('');
      const actResult = await getSavedActivities(user.uid);
      if (actResult.success && actResult.data) {
        setSavedActivities(actResult.data);
      } else {
        setActivitiesError(actResult.error || 'No se pudieron cargar las actividades.');
      }
      setIsLoadingActivities(false);

      // Fetch Saved Plans
      setIsLoadingPlans(true);
      setPlansError('');
      const planResult = await getSavedPlans(user.uid);
      if (planResult.success && planResult.data) {
        setSavedPlans(planResult.data);
      } else {
        setPlansError(planResult.error || 'No se pudieron cargar los planes de clase.');
      }
      setIsLoadingPlans(false);
    };

    fetchSavedContent();
  }, [user]);

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
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado para guardar recursos." });
        return;
    }

    const resourceData = {
        title: resource.title,
        url: resource.url,
        description: resource.description,
        tags: [searchQuery.resourceType, searchQuery.subject, searchQuery.grade].filter(Boolean)
    };

    try {
      await saveResourceToLibrary(user.uid, resourceData);
      toast({
        title: "¡Recurso Guardado!",
        description: `"${resource.title}" se ha añadido a tu biblioteca.`,
      });
      // Refetch resources
      const resources = await getUserLibrary(user.uid);
      setSavedResources(resources);
    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: e.message || 'No se pudo guardar el recurso.',
      });
    }
  };

  // --- Activity Actions ---
  const confirmDeleteActivity = async () => {
    if (!activityToDelete || !user) return;
    const result = await deleteActivity(activityToDelete.id);
    if (result.success) {
      toast({ title: "¡Actividad eliminada!", description: "La actividad ha sido eliminada de tu biblioteca." });
      const actResult = await getSavedActivities(user.uid);
      if (actResult.success && actResult.data) setSavedActivities(actResult.data);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setActivityToDelete(null);
  };
  
  const handleDeleteActivityClick = (activity: SavedActivity) => {
    setActivityToDelete(activity);
  };

  const handleEditActivityClick = (activity: SavedActivity) => {
    setActivityToEdit(activity);
    setEditedActivityText(activity.textoGenerado);
  };

  const confirmUpdateActivity = async () => {
    if (!activityToEdit || !user) return;
    setIsUpdatingActivity(true);
    const result = await updateActivity(activityToEdit.id, { textoGenerado: editedActivityText });

    if (result.success) {
      toast({ title: "¡Actividad actualizada!", description: "Los cambios han sido guardados." });
      const actResult = await getSavedActivities(user.uid);
      if (actResult.success && actResult.data) setSavedActivities(actResult.data);
      setActivityToEdit(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsUpdatingActivity(false);
  };

  // --- Plan Actions ---
  const confirmDeletePlan = async () => {
    if (!planToDelete || !user) return;
    const result = await deletePlan(planToDelete.id);
    if (result.success) {
      toast({ title: "¡Plan eliminado!", description: "El plan ha sido eliminado de tu biblioteca." });
      const planResult = await getSavedPlans(user.uid);
      if (planResult.success && planResult.data) setSavedPlans(planResult.data);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setPlanToDelete(null);
  };

  const handleDeletePlanClick = (plan: SavedPlan) => {
    setPlanToDelete(plan);
  };

  const handleEditPlanClick = (plan: SavedPlan) => {
    setPlanToEdit(plan);
    setEditedPlanText(plan.textoGenerado);
  };

  const confirmUpdatePlan = async () => {
    if (!planToEdit || !user) return;
    setIsUpdatingPlan(true);
    const result = await updatePlan(planToEdit.id, { textoGenerado: editedPlanText });

    if (result.success) {
      toast({ title: "¡Plan actualizado!", description: "Los cambios han sido guardados." });
      const planResult = await getSavedPlans(user.uid);
      if (planResult.success && planResult.data) setSavedPlans(planResult.data);
      setPlanToEdit(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsUpdatingPlan(false);
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
                                <Button onClick={() => handleSaveResource(res)} size="sm" disabled={!user}>
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
        <p className="text-lg text-foreground/80 mt-2 flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            {user ? `Sesión de Usuario: ${user.uid.substring(0, 12)}...` : 'Iniciando sesión anónima...'}
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
                <CardDescription>Aquí están los recursos, actividades y planes de clase que has guardado.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="plans" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="plans"><ClipboardList className="mr-2"/> Planes de Clase</TabsTrigger>
                        <TabsTrigger value="activities"><FileText className="mr-2"/> Actividades</TabsTrigger>
                        <TabsTrigger value="resources"><LinkIcon className="mr-2"/> Recursos (Enlaces)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="plans" className="pt-4">
                        {(!user || isLoadingPlans) && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p>Cargando tus planes de clase...</p>
                            </div>
                        )}
                        {user && !isLoadingPlans && plansError && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                                <p className="text-destructive">{plansError}</p>
                            </div>
                        )}
                        {user && !isLoadingPlans && !plansError && savedPlans.length > 0 && (
                             <div className="space-y-3">
                                {savedPlans.map((plan) => (
                                    <Card key={plan.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary gap-4">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate" title={plan.planTitle}>
                                            {plan.planTitle || 'Plan sin título'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                            {plan.subject} &bull; Grado {plan.grade} &bull; Creado: {plan.timestamp ? format(new Date(plan.timestamp), 'd MMM yyyy', { locale: es }) : 'Fecha desconocida'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditPlanClick(plan)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Modificar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePlanClick(plan)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Borrar</span>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                             </div>
                        )}
                         {user && !isLoadingPlans && !plansError && savedPlans.length === 0 && (
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-muted-foreground text-center">No has guardado ningún plan de clase todavía.<br/>¡Crea uno y aparecerá aquí!</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activities" className="pt-4">
                        {(!user || isLoadingActivities) && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p>Cargando tus actividades...</p>
                            </div>
                        )}
                        {user && !isLoadingActivities && activitiesError && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                                <p className="text-destructive">{activitiesError}</p>
                            </div>
                        )}
                        {user && !isLoadingActivities && !activitiesError && savedActivities.length > 0 && (
                             <div className="space-y-3">
                                {savedActivities.map((act) => (
                                    <Card key={act.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary gap-4">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate" title={act.learningObjective}>
                                            {act.learningObjective || 'Actividad sin título'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                            {act.subject} &bull; Grado {act.grade} &bull; Creado: {act.timestamp ? format(new Date(act.timestamp), 'd MMM yyyy', { locale: es }) : 'Fecha desconocida'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditActivityClick(act)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Modificar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteActivityClick(act)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Borrar</span>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                             </div>
                        )}
                         {user && !isLoadingActivities && !activitiesError && savedActivities.length === 0 && (
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-muted-foreground text-center">No has guardado ninguna actividad todavía.<br/>¡Crea una y aparecerá aquí!</p>
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="resources" className="pt-4">
                         {(!user || isLoadingLibrary) && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p>Cargando tus recursos...</p>
                            </div>
                        )}
                        {user && !isLoadingLibrary && libraryError && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                                <p className="text-destructive">{libraryError}</p>
                            </div>
                        )}
                        {user && !isLoadingLibrary && !libraryError && savedResources.length > 0 && (
                            <div className="space-y-4">
                                {savedResources.map((res) => (
                                    <div key={res.id} className="border p-4 rounded-lg bg-secondary">
                                    <h4 className="font-semibold">{res.title}</h4>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                                            {res.url}
                                    </a>
                                    <p className="text-sm text-muted-foreground mt-2">{res.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                                        {res.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                    </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {user && !isLoadingLibrary && !libraryError && savedResources.length === 0 && (
                            <div className="h-40 flex items-center justify-center">
                                <p className="text-muted-foreground text-center">Tu biblioteca de recursos está vacía.<br/>¡Usa el buscador para encontrar y guardar nuevos recursos!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </main>

      {/* Dialogs for Activities */}
      {!!activityToDelete && (
        <AlertDialog open onOpenChange={(isOpen) => !isOpen && setActivityToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la actividad
                <strong className="mx-1">"{activityToDelete.learningObjective}"</strong>
                de la base de datos.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setActivityToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteActivity} className={cn(buttonVariants({ variant: "destructive" }))}>Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {!!activityToEdit && (
        <Dialog open onOpenChange={(isOpen) => !isOpen && setActivityToEdit(null)}>
            <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Modificar Actividad: {activityToEdit.learningObjective}</DialogTitle>
                <DialogDescription>
                Realiza los cambios necesarios en el texto generado por la IA.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                value={editedActivityText}
                onChange={(e) => setEditedActivityText(e.target.value)}
                rows={18}
                className="w-full"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setActivityToEdit(null)}>Cancelar</Button>
                <Button onClick={confirmUpdateActivity} disabled={isUpdatingActivity}>
                    {isUpdatingActivity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* Dialogs for Plans */}
      {!!planToDelete && (
        <AlertDialog open onOpenChange={(isOpen) => !isOpen && setPlanToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el plan
                <strong className="mx-1">"{planToDelete.planTitle}"</strong>
                de la base de datos.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeletePlan} className={cn(buttonVariants({ variant: "destructive" }))}>Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {!!planToEdit && (
        <Dialog open onOpenChange={(isOpen) => !isOpen && setPlanToEdit(null)}>
            <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Modificar Plan: {planToEdit.planTitle}</DialogTitle>
                <DialogDescription>
                Realiza los cambios necesarios en el texto generado por la IA.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                value={editedPlanText}
                onChange={(e) => setEditedPlanText(e.target.value)}
                rows={18}
                className="w-full"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setPlanToEdit(null)}>Cancelar</Button>
                <Button onClick={confirmUpdatePlan} disabled={isUpdatingPlan}>
                    {isUpdatingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
