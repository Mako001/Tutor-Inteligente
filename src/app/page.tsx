// src/app/page.tsx
'use client'; // Esta página necesita ser un Client Component por los hooks y el manejo de eventos

import { useState, FormEvent, useEffect } from 'react';
import { firestore } from '@/lib/firebase/client'; // Asegúrate que la ruta sea correcta
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Comentado para aislar problemas

// Componentes de UI (asumimos que existen en @/components/ui/)
// Necesitarás crearlos o asegurarte de que están ahí.
// Por simplicidad, usaré elementos HTML básicos aquí, puedes reemplazarlos.

// Interfaz para los datos del formulario (opcional pero buena práctica)
interface FormData {
  grade: string;
  timeAvailable: string;
  centralTheme: string;
  methodologyPreference: string;
  competenciesToDevelop: string[];
  learningEvidences: string[];
  curricularComponents: string[];
  availableResourcesCheckboxes: string[];
  recursos: string; // texto libre para recursos adicionales
  contextAndNeeds: string[];
  actividad: string; // descripción de la actividad
  evaluacion: string; // método de evaluación
  interdisciplinarity?: string;
  detallesAdicionales: string; // Detalles adicionales para la IA
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    grade: '6º',
    timeAvailable: '',
    centralTheme: '',
    methodologyPreference: 'Abierto a sugerencias',
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
  const [resultadoTexto, setResultadoTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof Omit<FormData, 'interdisciplinarity' | 'recursos' | 'actividad' | 'evaluacion' | 'detallesAdicionales' | 'grade' | 'timeAvailable' | 'centralTheme' | 'methodologyPreference'>, value: string) => {
    setFormData(prev => {
      const list = (prev[category] as string[]) || [];
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...list, value] };
      }
    });
  };

  // --- LLAMADA A LA API ROUTE DE GEMINI ---
  const llamarGeminiAPI = async (prompt: string): Promise<string> => {
    console.log("Enviando a API Route (/api/gemini):", prompt);
    setCargando(true);
    setError('');
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data.generatedText;
    } catch (apiError: any) {
      console.error("Error llamando a la API Route de Gemini:", apiError);
      setError(apiError.message || "Error al comunicar con la IA.");
      throw apiError; // Re-lanzar para que handleGenerarPropuesta lo maneje
    } finally {
      setCargando(false);
    }
  };


  // --- GUARDAR EN FIREBASE ---
  const guardarPropuestaEnFirebase = async (propuesta: string, datos: FormData) => {
    if (!firestore) {
      console.error("Firestore no está disponible. No se puede guardar.");
      setError("Error: No se pudo conectar a la base de datos para guardar.");
      return;
    }
    try {
      const dataToSave = {
        ...datos,
        // Convertir arrays a strings si es necesario para Firestore, o guardarlos como arrays
        competenciesToDevelop: datos.competenciesToDevelop.join(', '),
        learningEvidences: datos.learningEvidences.join(', '),
        curricularComponents: datos.curricularComponents.join(', '),
        availableResourcesCheckboxes: datos.availableResourcesCheckboxes.join(', '),
        contextAndNeeds: datos.contextAndNeeds.join(', '),
        textoGenerado: propuesta,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(firestore, "propuestas"), dataToSave);
      console.log("Propuesta guardada en Firebase");
    } catch (e: any) {
      console.error("Error al guardar en Firebase: ", e);
      setError(`Error al guardar la propuesta en la base de datos: ${e.message}`);
    }
  };

  // --- MANEJADOR DEL ENVÍO DEL FORMULARIO ---
  const handleGenerarPropuesta = async (e: FormEvent) => {
    e.preventDefault(); 
    setCargando(true);
    setResultadoTexto('');
    setError('');

    if (!formData.centralTheme || !formData.competenciesToDevelop.length) {
      setError("Por favor, completa al menos el Tema Central y selecciona Competencias a Desarrollar.");
      setCargando(false);
      return;
    }

    const promptCompleto = `Rol: Asistente experto en diseño de actividades de aprendizaje en Tecnología e Informática, con amplio conocimiento de las Orientaciones Curriculares para el Área de Tecnología e Informática en la Educación Básica y Media del Ministerio de Educación Nacional de Colombia (MEN) y la Guía 30.

    Saludo Inicial (para contextualizarte, no para incluirlo directamente en la propuesta final si no se pide explícitamente):
    "¡Hola, colega docente de Informática de bachillerato! Estoy aquí para ayudarte a diseñar actividades de aprendizaje significativas y contextualizadas para tus estudiantes. Para comenzar, necesito que reflexionemos juntos sobre algunos aspectos clave. Responder a las siguientes preguntas me permitirá generar una propuesta de actividad ajustada a tus necesidades y a los lineamientos del MEN."
    
    Información proporcionada por el docente para la actividad:
    1.  Grado(s) Específico(s): ${formData.grade}
    2.  Tiempo Disponible: ${formData.timeAvailable}
    3.  Tema Central: ${formData.centralTheme}
    4.  Metodología Preferida: ${formData.methodologyPreference}
    5.  Competencias a Desarrollar (Citar textualmente de las Orientaciones Curriculares y la Guía 30): ${formData.competenciesToDevelop.join('; ')}. Es muy importante que sea lo más específico posible en las competencias a desarrollar.
    6.  Evidencias de Aprendizaje (Citar textualmente o adaptar de las Orientaciones Curriculares): ${formData.learningEvidences.join('; ')}. Ser lo más específico posible.
    7.  Componentes Curriculares (Justificar la selección): ${formData.curricularComponents.join('; ')}
    8.  Recursos Disponibles (Seleccionados): ${formData.availableResourcesCheckboxes.join('; ')}. Recursos Adicionales (Texto): ${formData.recursos}. Ser muy específico.
    9.  Contexto y Necesidades: ${formData.contextAndNeeds.join('; ')}
    10. Interdisciplinariedad (Opcional): ${formData.interdisciplinarity || 'No aplica'}
    11. Descripción detallada de la actividad (cómo se la imagina el docente): ${formData.actividad}
    12. Método de Evaluación: ${formData.evaluacion}
    13. Detalles Adicionales o Tono deseado para la IA: ${formData.detallesAdicionales}

    Tarea:
    "Una vez que hayas procesado esta información, utiliza tu conocimiento de las Orientaciones Curriculares y la Guía 30 del MEN, para generar una propuesta DETALLADA de actividad de aprendizaje. Esta propuesta incluirá:
    *   Una descripción completa de la actividad (pasos, fases, roles).
    *   Preguntas orientadoras para los estudiantes.
    *   Recursos necesarios (detallados y específicos).
    *   Producto(s) esperado(s).
    *   Criterios e instrumentos de evaluación (alineados con las competencias y evidencias, por ejemplo, una rúbrica básica si es pertinente).
    *   Adaptaciones (en caso de que sea necesario, considerando el contexto y recursos).
    *   Justificación breve de cómo la actividad aborda los componentes curriculares seleccionados."

    Formato de Salida:
    La propuesta de actividad debe presentarse en un formato claro, organizado y fácil de seguir, con secciones separadas para cada uno de los elementos mencionados.

    Restricciones:
    *   La propuesta NO debe ser genérica.
    *   Debe estar contextualizada a Colombia.
    *   NO puede salirse de los lineamientos del Ministerio de Educación de Colombia (MEN) y la Guía 30.
    *   Ser extremadamente específica y práctica para implementación en aula.
    `;

    try {
      const respuesta = await llamarGeminiAPI(promptCompleto);
      setResultadoTexto(respuesta);
      await guardarPropuestaEnFirebase(respuesta, formData);

    } catch (apiError: any) {
      // El error ya se maneja en llamarGeminiAPI y se establece en el estado 'error'
      // Aquí podrías añadir lógica adicional si es necesario, pero llamarGeminiAPI ya actualiza el estado de error.
      console.error("Error en handleGenerarPropuesta después de llamar a la API:", apiError);
    } finally {
      setCargando(false);
    }
  };
  
  const competenciesOptions = [
    { id: "comp1", label: "Comprensión de conceptos tecnológicos básicos y su aplicación en diversos contextos (hardware, software, redes, sistemas de información)." },
    { id: "comp2", label: "Uso ético, seguro, legal y responsable de las TIC, promoviendo la ciudadanía digital y la protección de datos." },
    // ... (mantener las opciones existentes y añadir nuevas si es necesario)
    { id: "comp_orient_p56_1", label: "Analizo y explico la influencia de las tecnologías de la información y la comunicación en los cambios culturales, individuales y sociales." },
    { id: "comp_orient_p56_2", label: "Evalúo las implicaciones éticas, sociales y ambientales de las innovaciones tecnológicas." },
    { id: "comp_orient_p57_1", label: "Utilizo responsable y autónomamente las Tecnologías de la Información y la Comunicación (TIC) para aprender, investigar y comunicarme con otros en el mundo." },
    { id: "comp_orient_p57_2", label: "Identifico, formulo y resuelvo problemas susceptibles de ser automatizados mediante el uso de herramientas informáticas." },
     { id: "comp_guia30_tecysoc", label: "Relaciono el desarrollo tecnológico con los avances en la ciencia, la técnica, y las matemáticas y con los cambios culturales y sociales." },
    { id: "comp_guia30_aprop", label: "Utilizo herramientas y equipos seguros para construir modelos, artefactos y sistemas tecnológicos." },
    { id: "comp_guia30_solprob", label: "Propongo soluciones tecnológicas en condiciones de incertidumbre, cuando persisten las restricciones o no hay información suficiente." },
  ];

  const evidencesOptions = [
    { id: "ev1", label: "Diseño y creación de artefactos digitales funcionales y originales (aplicaciones, simulaciones, sitios web, videojuegos, modelos 3D)." },
    { id: "ev2", label: "Participación activa, argumentada y respetuosa en debates sobre dilemas éticos, sociales y legales relacionados con la tecnología." },
    // ... (mantener las opciones existentes y añadir nuevas si es necesario)
    { id: "ev_orient_p56_1_a", label: "Presenta ejemplos de artefactos y sistemas tecnológicos que han transformado las prácticas sociales y culturales (ej. la imprenta, el internet, las redes sociales)." },
    { id: "ev_orient_p56_2_a", label: "Analiza críticamente los efectos de una tecnología específica (ej. inteligencia artificial, biotecnología) en diferentes grupos sociales o en el ambiente." },
    { id: "ev_orient_p57_1_a", label: "Usa selectiva y críticamente la información obtenida a través de las TIC para el desarrollo de un proyecto o investigación escolar." },
    { id: "ev_orient_p57_2_a", label: "Desarrolla un algoritmo o programa sencillo para solucionar un problema cotidiano o escolar." },
    { id: "ev_guia30_tecysoc_a", label: "Describe cómo la evolución de un artefacto o proceso tecnológico ha impactado la vida de las personas." },
    { id: "ev_guia30_aprop_a", label: "Construye un prototipo funcional siguiendo un plan de diseño y normas de seguridad." },
    { id: "ev_guia30_solprob_a", label: "Identifica y describe diferentes alternativas de solución a un mismo problema tecnológico, evaluando sus ventajas y desventajas." },
  ];

  const curricularComponentsOptions = [
    { id: "cc1", label: "Naturaleza y Evolución de la Tecnología" },
    { id: "cc2", label: "Apropiación y Uso de la Tecnología" },
    { id: "cc3", label: "Solución de Problemas con Tecnología" },
    { id: "cc4", label: "Tecnología y Sociedad" },
    // ... (mantener las opciones existentes y añadir nuevas si es necesario)
    { id: "cc_guia30_relctm", label: "Relaciones entre la Tecnología y otras disciplinas (Ciencia, Técnica, Matemáticas)" },
    { id: "cc_guia30_invinn", label: "Investigación, Innovación y Desarrollo Tecnológico" },
  ];

  const resourcesOptions = [
    { id: "res1", label: "Computadores (PC o portátiles) con acceso a internet y software básico (navegador, ofimática)." },
    { id: "res2", label: "Software especializado (IDE para programación, diseño gráfico, edición de video, CAD, modelado 3D, simulación, etc.)." },
    // ... (mantener las opciones existentes y añadir nuevas si es necesario)
    { id: "res_lab", label: "Laboratorio de tecnología/informática equipado." },
    { id: "res_mat_reciclable", label: "Materiales reciclables o de bajo costo para prototipado." },
  ];

  const contextNeedsOptions = [
    { id: "need1", label: "Aula con recursos tecnológicos limitados (pocos computadores por estudiante, sin internet estable o de baja velocidad)." },
    { id: "need2", label: "Estudiantes con diversos niveles de alfabetización y competencia digital (desde básico hasta avanzado)." },
    // ... (mantener las opciones existentes y añadir nuevas si es necesario)
    { id: "need_colab", label: "Necesidad de fomentar el trabajo colaborativo y habilidades del siglo XXI." },
    { id: "need_eval_formativa", label: "Énfasis en evaluación formativa y retroalimentación constante." },
  ];

  const tiempoOptions = [
    { id: "t1", label: "1-2 horas clase (Sesión única o doble)"},
    { id: "t2", label: "3-4 horas clase (Varias sesiones, ej. 1 semana)"},
    { id: "t3", label: "Proyecto corto (5-8 horas clase, ej. 2 semanas)"},
    { id: "t4", label: "Proyecto mediano (9-15 horas clase, ej. 3-4 semanas)"},
    { id: "t5", label: "Proyecto largo o trimestral (+16 horas clase)"},
    { id: "t6", label: "Flexible / A definir según avance"},
  ];

  const methodologyOptions = [
    { id: "meth1", label: "Aprendizaje Basado en Proyectos (ABP)" },
    { id: "meth2", label: "Aprendizaje Basado en Problemas (ABPr)" },
    { id: "meth3", label: "Gamificación / Aprendizaje Basado en Juegos" },
    { id: "meth4", label: "Aula Invertida (Flipped Classroom)" },
    { id: "meth5", label: "Pensamiento de Diseño (Design Thinking)" },
    { id: "meth6", label: "Aprendizaje Colaborativo / Cooperativo" },
    { id: "meth7", label: "Instrucción Directa con Práctica Guiada e Independiente" },
    { id: "meth8", label: "Aprendizaje por Descubrimiento / Indagación" },
    { id: "meth9", label: "Estudio de Casos" },
    { id: "meth10", label: "Aprendizaje STEAM (Ciencia, Tecnología, Ingeniería, Artes y Matemáticas)" },
    { id: "meth11", label: "Abierto a sugerencias de la IA" },
  ];

  const gradeOptions = [
    "6º", "7º", "8º", "9º", "10º", "11º", 
    "Básica Secundaria (6º-9º)", 
    "Media Académica (10º-11º)", 
    "Media Técnica (10º-11º)", 
    "Todos los grados de bachillerato (6º-11º)",
    "Otro (especificar en tema o detalles)"
  ];


  // --- RENDERIZADO (JSX) ---
  // Usa clases de Tailwind CSS para estilizar
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-secondary" suppressHydrationWarning={true}>
      <header className="text-center mb-10 py-6">
        <h1 className="text-5xl font-bold text-primary">AprendeTech Colombia</h1>
        <p className="text-xl text-foreground/80 mt-2">Asistente IA para el Diseño de Actividades Educativas en Tecnología e Informática</p>
      </header>

      <main className="w-full max-w-4xl bg-card p-8 rounded-xl shadow-2xl">
      <p className="text-muted-foreground mb-6 text-center">
          ¡Hola, colega docente de Informática de bachillerato! Estoy aquí para ayudarte a diseñar actividades de aprendizaje significativas y contextualizadas para tus estudiantes.
          Para comenzar, necesito que reflexionemos juntos sobre algunos aspectos clave. Responder a las siguientes preguntas me permitirá generar una propuesta de actividad ajustada a tus necesidades y a los lineamientos del MEN.
        </p>
        <form onSubmit={handleGenerarPropuesta} className="space-y-8">
          {/* Campo Grado(s) */}
          <div>
            <label htmlFor="grade" className="block text-lg font-semibold text-foreground mb-1">
              1. Grado(s) Específico(s):
            </label>
            <select
              name="grade"
              id="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          {/* Campo Tiempo Disponible */}
           <div className="space-y-3">
            <label htmlFor="timeAvailable" className="block text-lg font-semibold text-foreground mb-1">
              2. Tiempo Disponible:
            </label>
            <select
              name="timeAvailable"
              id="timeAvailable"
              value={formData.timeAvailable}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Selecciona el tiempo disponible</option>
              {tiempoOptions.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
            <input
              type="text"
              name="timeAvailable_otro"
              value={formData.timeAvailable.startsWith("Flexible") || tiempoOptions.find(opt => opt.label === formData.timeAvailable) ? "" : formData.timeAvailable}
              onChange={(e) => setFormData(prev => ({...prev, timeAvailable: e.target.value}))}
              className="mt-2 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Si seleccionaste 'Flexible' o necesitas detallar, especifica aquí (ej: 1 trimestre, 2 horas semanales)"
            />
          </div>

          {/* Campo Tema Central */}
          <div>
            <label htmlFor="centralTheme" className="block text-lg font-semibold text-foreground mb-1">
              3. Tema Central o Problema:
            </label>
            <input
              type="text"
              name="centralTheme"
              id="centralTheme"
              value={formData.centralTheme}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Introducción a la Programación con Python, Diseño de un Prototipo Robótico"
            />
          </div>

          {/* Campo Metodología Preferida */}
          <div className="space-y-3">
            <label htmlFor="methodologyPreference" className="block text-lg font-semibold text-foreground mb-1">
              4. Metodología Preferida:
            </label>
             <select
              name="methodologyPreference"
              id="methodologyPreference"
              value={formData.methodologyPreference}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              {methodologyOptions.map(m => <option key={m.id} value={m.label}>{m.label}</option>)}
            </select>
          </div>

          {/* Competencias a Desarrollar */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">5. Competencias a Desarrollar (Orientaciones MEN / Guía 30):</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {competenciesOptions.map(comp => (
                <label key={comp.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="competenciesToDevelop"
                    value={comp.label} 
                    checked={(formData.competenciesToDevelop || []).includes(comp.label)}
                    onChange={() => handleCheckboxChange('competenciesToDevelop', comp.label)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-input focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">{comp.label}</span>
                </label>
              ))}
            </div>
             <p className="text-xs text-muted-foreground mt-1">Selecciona las competencias. Cita textualmente o adapta de las Orientaciones MEN y Guía 30.</p>
          </div>

          {/* Evidencias de Aprendizaje */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">6. Evidencias de Aprendizaje (Orientaciones MEN / Guía 30):</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {evidencesOptions.map(ev => (
                <label key={ev.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="learningEvidences"
                    value={ev.label}
                    checked={(formData.learningEvidences || []).includes(ev.label)}
                    onChange={() => handleCheckboxChange('learningEvidences', ev.label)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-input focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">{ev.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">¿Qué acciones, productos o desempeños permitirán verificar el desarrollo de competencias?</p>
          </div>

           {/* Componentes Curriculares */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">7. Componentes Curriculares (MEN / Guía 30):</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {curricularComponentsOptions.map(item => (
                <label key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="curricularComponents"
                    value={item.label}
                    checked={(formData.curricularComponents || []).includes(item.label)}
                    onChange={() => handleCheckboxChange('curricularComponents', item.label)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-input focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">{item.label}</span>
                </label>
              ))}
            </div>
             <p className="text-xs text-muted-foreground mt-1">¿Cuáles componentes del área se abordarán? Justifica brevemente en la descripción de la actividad si es necesario.</p>
          </div>
          
          {/* Recursos Disponibles (Checkboxes) */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">8. Recursos Disponibles (selección principal):</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {resourcesOptions.map(item => (
                <label key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="availableResourcesCheckboxes" 
                    value={item.label}
                    checked={(formData.availableResourcesCheckboxes || []).includes(item.label)}
                    onChange={() => handleCheckboxChange('availableResourcesCheckboxes', item.label)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-input focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Campo Recursos Adicionales (texto) */}
          <div>
            <label htmlFor="recursos" className="block text-sm font-medium text-gray-700 mb-1">
               Recursos Adicionales (texto libre):
            </label>
            <textarea
              name="recursos"
              id="recursos"
              rows={2}
              value={formData.recursos}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Plataforma LMS específica, software de simulación X, acceso a taller de electrónica. Describe otros recursos importantes."
            />
          </div>


          {/* Contexto y Necesidades */}
           <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">9. Contexto y Necesidades Particulares:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {contextNeedsOptions.map(item => (
                <label key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="contextAndNeeds"
                    value={item.label}
                    checked={(formData.contextAndNeeds || []).includes(item.label)}
                    onChange={() => handleCheckboxChange('contextAndNeeds', item.label)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-input focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-foreground/90">{item.label}</span>
                </label>
              ))}
            </div>
             <p className="text-xs text-muted-foreground mt-1">¿Alguna particularidad de tu contexto escolar o estudiantes a considerar?</p>
          </div>
          
          {/* Campo Descripción Actividad */}
          <div>
            <label htmlFor="actividad" className="block text-lg font-semibold text-foreground mb-1">
              10. Descripción Detallada de la Actividad (cómo te la imaginas):
            </label>
            <textarea
              name="actividad"
              id="actividad"
              rows={4}
              value={formData.actividad}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Describe los pasos, fases, roles del estudiante y docente, etc. Sé lo más específico posible."
            />
          </div>


           {/* Campo Evaluación */}
          <div>
            <label htmlFor="evaluacion" className="block text-lg font-semibold text-foreground mb-1">
              11. Método de Evaluación:
            </label>
            <textarea
              name="evaluacion"
              id="evaluacion"
              rows={3}
              value={formData.evaluacion}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="¿Cómo planeas evaluar el aprendizaje? Ej: Rúbrica para el proyecto, quiz, observación directa, portafolio, coevaluación."
            />
          </div>

          {/* Campo Interdisciplinariedad */}
           <div>
            <label htmlFor="interdisciplinarity" className="block text-lg font-semibold text-foreground mb-1">
              12. Interdisciplinariedad (Opcional):
            </label>
            <input
              type="text"
              name="interdisciplinarity"
              id="interdisciplinarity"
              value={formData.interdisciplinarity}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Matemáticas (cálculo de costos), Artes (diseño visual de la app), Ciencias Sociales (impacto social)."
            />
          </div>


          {/* Campo Detalles Adicionales */}
          <div>
            <label htmlFor="detallesAdicionales" className="block text-lg font-semibold text-foreground mb-1">
              13. Detalles Adicionales o Tono Deseado para la IA:
            </label>
            <textarea
              name="detallesAdicionales"
              id="detallesAdicionales"
              rows={2}
              value={formData.detallesAdicionales}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Tono formal y académico, creativo y lúdico, enfocado en la colaboración, incluir ejemplos específicos para grado X."
            />
          </div>


          {/* Botón de Envío */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {cargando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent-foreground"></div>
              ) : (
                'Generar Propuesta de Actividad con IA'
              )}
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
        </form>

        {/* Sección de Resultado */}
        {resultadoTexto && !cargando && (
          <section className="mt-10 p-6 border border-input rounded-lg bg-muted/20">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Propuesta Generada:</h2>
            <pre className="whitespace-pre-wrap text-sm text-foreground/90 p-4 bg-background border border-input rounded-md overflow-x-auto">
              {resultadoTexto}
            </pre>
          </section>
        )}
      </main>

      <footer className="text-center mt-16 py-6 text-sm text-muted-foreground" suppressHydrationWarning={true}>
        <p>© {currentYear || new Date().getFullYear()} AprendeTech Colombia. Todos los derechos reservados.</p>
        <p>Una herramienta para potenciar la educación en Tecnología e Informática.</p>
      </footer>
    </div>
  );
}
