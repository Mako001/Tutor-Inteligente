// src/app/page.tsx
'use client'; // Esta página necesita ser un Client Component por los hooks y el manejo de eventos

import { useState, FormEvent, ChangeEvent } from 'react';
import { firestore } from '@/lib/firebase/client'; // Asegúrate que la ruta sea correcta
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Componentes de UI (asumimos que existen en @/components/ui/)
// Necesitarás crearlos o asegurarte de que están ahí.
// Por simplicidad, usaré elementos HTML básicos aquí, puedes reemplazarlos.

// Interfaz para los datos del formulario (opcional pero buena práctica)
interface FormData {
  tema: string;
  nivel: string;
  objetivo: string;
  tiempo: string;
  recursos: string;
  // Añade otros campos según tu formulario original
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    tema: '',
    nivel: '6', // Valor inicial
    objetivo: '',
    tiempo: '',
    recursos: '',
  });
  const [resultadoTexto, setResultadoTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- SIMULACIÓN DE LA API DE GEMINI ---
  const llamarGeminiAPI = async (prompt: string): Promise<string> => {
    console.log("Enviando a Gemini (simulado):", prompt);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
    // En una implementación real, aquí harías fetch a tu API de Gemini
    return `Respuesta simulada para el prompt sobre "${formData.tema}".\nDetalles:\n- Nivel: ${formData.nivel}\n- Objetivo: ${formData.objetivo}`;
  };

  // --- GUARDAR EN FIREBASE ---
  const guardarPropuestaEnFirebase = async (propuesta: string, datos: FormData) => {
    if (!firestore) {
      console.error("Firestore no está disponible. No se puede guardar.");
      setError("Error: No se pudo conectar a la base de datos para guardar.");
      return;
    }
    try {
      await addDoc(collection(firestore, "propuestas"), {
        ...datos,
        textoGenerado: propuesta,
        timestamp: serverTimestamp(),
      });
      console.log("Propuesta guardada en Firebase");
    } catch (e) {
      console.error("Error al guardar en Firebase: ", e);
      setError("Error al guardar la propuesta en la base de datos.");
    }
  };

  // --- MANEJADOR DEL ENVÍO DEL FORMULARIO ---
  const handleGenerarPropuesta = async (e: FormEvent) => {
    e.preventDefault(); // Prevenir recarga de página si es un form real
    setCargando(true);
    setResultadoTexto('');
    setError('');

    // Validaciones básicas (puedes expandir)
    if (!formData.tema || !formData.objetivo) {
      setError("Por favor, completa los campos de tema y objetivo.");
      setCargando(false);
      return;
    }

    // Construye el prompt
    const promptCompleto = `Genera una actividad educativa:
    Tema: ${formData.tema}
    Nivel: ${formData.nivel}
    Objetivo: ${formData.objetivo}
    Tiempo disponible: ${formData.tiempo}
    Recursos: ${formData.recursos}
    ---`; // Adapta tu prompt

    try {
      const respuesta = await llamarGeminiAPI(promptCompleto);
      setResultadoTexto(respuesta);
      await guardarPropuestaEnFirebase(respuesta, formData);
    } catch (apiError) {
      console.error("Error llamando a la API de Gemini:", apiError);
      setError("Hubo un error al generar la propuesta con la IA.");
    } finally {
      setCargando(false);
    }
  };

  // --- RENDERIZADO (JSX) ---
  // Usa clases de Tailwind CSS para estilizar
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600">AprendeTech Colombia</h1>
        <p className="text-xl text-gray-700 mt-2">Asistente para el Diseño de Actividades Educativas</p>
      </header>

      <main className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-xl">
        <form onSubmit={handleGenerarPropuesta} className="space-y-6">
          {/* Campo Tema */}
          <div>
            <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-1">
              1. Tema Central o Problema:
            </label>
            <input
              type="text"
              name="tema"
              id="tema"
              value={formData.tema}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Introducción a HTML y CSS"
            />
          </div>

          {/* Campo Nivel (Select) */}
          <div>
            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
              2. Grado(s) Específico(s):
            </label>
            <select
              name="nivel"
              id="nivel"
              value={formData.nivel}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="6">6°</option>
              <option value="7">7°</option>
              <option value="8">8°</option>
              <option value="9">9°</option>
              <option value="10">10°</option>
              <option value="11">11°</option>
            </select>
          </div>

          {/* Campo Objetivo */}
          <div>
            <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
              3. Objetivo Principal de la Actividad:
            </label>
            <textarea
              name="objetivo"
              id="objetivo"
              rows={3}
              value={formData.objetivo}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Que los estudiantes comprendan la estructura básica de una página web."
            />
          </div>
          
          {/* Campo Tiempo */}
           <div>
            <label htmlFor="tiempo" className="block text-sm font-medium text-gray-700 mb-1">
              4. Tiempo Disponible:
            </label>
            <input
              type="text"
              name="tiempo"
              id="tiempo"
              value={formData.tiempo}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: 90 minutos, 2 bloques de 45 min"
            />
          </div>

          {/* Campo Recursos */}
          <div>
            <label htmlFor="recursos" className="block text-sm font-medium text-gray-700 mb-1">
              5. Recursos Necesarios:
            </label>
            <textarea
              name="recursos"
              id="recursos"
              rows={2}
              value={formData.recursos}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Computadoras con acceso a internet, editor de código (VS Code, Sublime Text), proyector."
            />
          </div>


          {/* Botón de Envío */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {cargando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Generar Propuesta de Actividad'
              )}
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
        </form>

        {/* Sección de Resultado */}
        {(resultadoTexto && !cargando) && (
          <section className="mt-10 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Propuesta Generada:</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 p-4 bg-white border rounded-md overflow-x-auto">
              {resultadoTexto}
            </pre>
          </section>
        )}
      </main>

      <footer className="text-center mt-12 py-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} AprendeTech Colombia. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
