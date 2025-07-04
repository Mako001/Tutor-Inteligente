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
import { Loader2, Search, Save, BookOpen, AlertTriangle } from 'lucide-react';
import { type FindResourcesInput, type FoundResource, type SaveResourceInput } from '@/ai/flows/schemas';
import { findResources } from '@/ai/flows/find-resources';
import { getSavedResources, saveResource } from '@/lib/firebase/actions/resource-actions';
import { curriculumData } from '@/lib/data/curriculum';
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState<FindResourcesInput>({
    topic: '',
    resourceType: 'Video de YouTube',
    subject: 'Tecnología e Informática',
    grade: '9º',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundResources, setFoundResources] = useState<FoundResource[]>([]);

  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [libraryError, setLibraryError] = useState('');

  const fetchSavedResources = async () => {
    setIsLoadingLibrary(true);
    setLibraryError('');
    const result = await getSavedResources();
    if (result.success && result.data) {
      setSavedResources(result.data);
    } else {
      setLibraryError(result.error || 'No se pudieron cargar los recursos guardados.');
    }
    setIsLoadingLibrary(false);
  };

  useEffect(() => {
    fetchSavedResources();
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
      await fetchSavedResources();
    } else {
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: result.error || 'No se pudo guardar el recurso.',
      });
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Mi Biblioteca de Recursos</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Encuentra, guarda y gestiona recursos educativos de alta calidad con la ayuda de la IA.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card className="w-full shadow-lg">
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

        <Card className="w-full shadow-lg sticky top-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen/> Mi Biblioteca Guardada</CardTitle>
                <CardDescription>Aquí están los recursos que has guardado para uso futuro.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] max-h-[70vh] overflow-y-auto space-y-4">
                {isLoadingLibrary && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p>Cargando tu biblioteca...</p>
                    </div>
                )}
                {libraryError && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-4"/>
                        <p className="text-destructive">{libraryError}</p>
                    </div>
                )}
                {!isLoadingLibrary && !libraryError && savedResources.length > 0 && (
                     savedResources.map((res) => (
                        <div key={res.id} className="border p-4 rounded-lg bg-card">
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
                    ))
                )}
                 {!isLoadingLibrary && !libraryError && savedResources.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">Tu biblioteca está vacía. ¡Usa el buscador para encontrar y guardar recursos!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
