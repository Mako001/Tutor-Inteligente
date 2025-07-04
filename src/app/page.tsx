import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Library, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-secondary">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary">Bienvenido a AprendeTech</h1>
        <p className="text-xl text-foreground/80 mt-2">Tu centro de mando para la planificación educativa inteligente.</p>
      </header>
      
      <main className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Crear Plan de Clase */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FilePlus2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Crear Plan de Clase</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center">
                Genera una secuencia didáctica completa. Define objetivos, competencias, fases y evaluación para un periodo académico.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {/* Nota: Se usa /create que ya existe y corresponde a la funcionalidad */}
                <Link href="/create">Empezar Plan</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Crear Actividad */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
               <div className="p-4 bg-accent/10 rounded-full mb-4">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <CardTitle>Crear Actividad</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center">
                ¿Necesitas una idea rápida? Diseña una actividad de aprendizaje específica para una sola clase, con un objetivo claro y conciso.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/activities/create">Diseñar Actividad</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card 3: Mi Biblioteca */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-secondary-foreground/10 rounded-full mb-4">
                 <Library className="h-10 w-10 text-secondary-foreground" />
              </div>
              <CardTitle>Mi Biblioteca</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center">
                Accede a todos tus planes y actividades guardados. Revisa, edita y reutiliza tus mejores creaciones pedagógicas.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                 {/* Nota: Se usa /plans que ya existe y corresponde a "Mis Planes" (Biblioteca) */}
                <Link href="/plans">Ir a Biblioteca</Link>
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  );
}
