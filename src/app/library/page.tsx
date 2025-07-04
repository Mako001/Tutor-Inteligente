import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LibraryPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10 py-6">
        <h1 className="text-4xl font-bold text-primary">Mi Biblioteca</h1>
        <p className="text-lg text-foreground/80 mt-2">
          Aquí podrás ver todos los planes y actividades que has guardado.
        </p>
      </header>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle>Planes y Actividades Guardados</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-10">
              (Funcionalidad en construcción)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
