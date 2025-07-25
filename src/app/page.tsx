import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Library, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-secondary">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary">Bienvenido a AprendeTech</h1>
        <p className="text-xl text-foreground/80 mt-2">Tu asistente de IA para la planificación educativa.</p>
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
                Diseña secuencias didácticas completas. Define objetivos, competencias y estrategias de evaluación para tus unidades académicas.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                {/* Updated link to point to the new plan creator */}
                <Link href="/plans/create">Empezar Plan</Link>
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
                Crea actividades de aprendizaje específicas para una sesión de clase. Ideal para generar ideas, ejercicios prácticos o evaluaciones formativas.
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
                Centraliza tus recursos. Accede, edita y reutiliza tus planes de clase, actividades y recursos educativos guardados.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                 {/* Updated link to point to /library */}
                <Link href="/library">Ir a Biblioteca</Link>
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  );
}
