// src/app/page.tsx
'use client'; // Esta página necesita ser un Client Component por los hooks y el manejo de eventos

import { useState, FormEvent, useEffect } from 'react';
import { firestore } from '@/lib/firebase/client'; // Asegúrate que la ruta sea correcta
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Interfaz para los datos del formulario (opcional pero buena práctica)
interface FormData {
  tema: string;
  nivel: string;
  objetivo: string;
  tiempo: string;
  recursos: string;
  actividad: string;
  evaluacion: string;
  detallesAdicionales: string;
  methodologyPreference: string;
  competenciesToDevelop: string[];
  learningEvidences: string[];
  curricularComponents: string[];
  availableResourcesCheckboxes: string[];
  contextAndNeeds: string[];
  interdisciplinarity?: string;
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    tema: '',
    nivel: '6º', // Valor inicial
    objetivo: '',
    tiempo: '',
    recursos: '',
    actividad: '',
    evaluacion: '',
    detallesAdicionales: '',
    methodologyPreference: 'Abierto a sugerencias',
    competenciesToDevelop: [],
    learningEvidences: [],
    curricularComponents: [],
    availableResourcesCheckboxes: [],
    contextAndNeeds: [],
    interdisciplinarity: '',
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

  const handleCheckboxChange = (category: keyof FormData, value: string) => {
    setFormData(prev => {
      const list = (prev[category] as string[]) || [];
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...list, value] };
      }
    });
  };

  // --- SIMULACIÓN DE LA API DE GEMINI ---
  const llamarGeminiAPI = async (prompt: string): Promise<string> => {
    console.log("Enviando a Gemini (simulado):", prompt);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
    
    const simulatedResponse = `--- Respuesta Simulada de Gemini ---
    **Actividad Didáctica Generada**

    **Tema:** ${formData.tema}
    **Nivel:** ${formData.nivel}
    **Objetivo:** Que los estudiantes ${formData.objetivo.toLowerCase()}.
    **Metodología Preferida:** ${formData.methodologyPreference}
    **Competencias a Desarrollar:** ${formData.competenciesToDevelop.join(', ')}
    **Evidencias de Aprendizaje:** ${formData.learningEvidences.join(', ')}
    **Componentes Curriculares:** ${formData.curricularComponents.join(', ')}
    **Recursos Adicionales (checkboxes):** ${formData.availableResourcesCheckboxes.join(', ')}
    **Recursos (texto):** ${formData.recursos}
    **Contexto y Necesidades:** ${formData.contextAndNeeds.join(', ')}
    **Interdisciplinariedad:** ${formData.interdisciplinarity || 'No aplica'}


    **Instrucciones:**
    1. Presentación del tema (${formData.tiempo} minutos).
    2. Actividad principal: [Detalle de la actividad basada en la descripción: ${formData.actividad}].
    3. Cierre y evaluación: [Detalles de la evaluación: ${formData.evaluacion}].
    --- Fin Respuesta Simulada ---`;
    return simulatedResponse;
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
        // Convert array fields to string for Firestore if needed, or store as arrays
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
    } catch (e) {
      console.error("Error al guardar en Firebase: ", e);
      setError("Error al guardar la propuesta en la base de datos.");
    }
  };

  // --- MANEJADOR DEL ENVÍO DEL FORMULARIO ---
  const handleGenerarPropuesta = async (e: FormEvent) => {
    e.preventDefault(); 
    setCargando(true);
    setResultadoTexto('');
    setError('');

    if (!formData.tema || !formData.objetivo) {
      setError("Por favor, completa los campos de tema y objetivo.");
      setCargando(false);
      return;
    }

    const promptCompleto = `Genera una propuesta de actividad didáctica detallada para docentes de Tecnología e Informática en bachillerato, siguiendo los lineamientos del MEN Colombia y la Guía 30.
        Grado(s): ${formData.nivel}
        Tiempo Disponible: ${formData.tiempo}
        Tema Central o Problema: ${formData.tema}
        Metodología Preferida: ${formData.methodologyPreference}
        Competencias a Desarrollar (citar textualmente o adaptar de Orientaciones MEN): ${formData.competenciesToDevelop.join(', ')}
        Evidencias de Aprendizaje (citar textualmente o adaptar de Orientaciones MEN): ${formData.learningEvidences.join(', ')}
        Componentes Curriculares a abordar (justificar brevemente): ${formData.curricularComponents.join(', ')}
        Recursos Disponibles (checkboxes): ${formData.availableResourcesCheckboxes.join(', ')}
        Recursos Disponibles (texto libre): ${formData.recursos}
        Contexto y Necesidades Particulares: ${formData.contextAndNeeds.join(', ')}
        Interdisciplinariedad (si aplica): ${formData.interdisciplinarity || 'ninguno'}
        Descripción detallada de la actividad (cómo te la imaginas): ${formData.actividad}
        Método de Evaluación: ${formData.evaluacion}
        Detalles Adicionales o Tono deseado para la IA: ${formData.detallesAdicionales}

        Estructura la respuesta de forma clara y organizada incluyendo:
        *   Título de la Actividad
        *   Objetivo(s) de Aprendizaje (alineados con las competencias)
        *   Descripción Completa (pasos detallados, fases, roles de estudiantes y docente)
        *   Preguntas Orientadoras para los estudiantes
        *   Recursos Necesarios (detallados)
        *   Producto(s) Esperado(s) (tangibles o intangibles)
        *   Criterios e Instrumentos de Evaluación (rúbricas, listas de chequeo, etc., alineados con competencias y evidencias)
        *   Posibles Adaptaciones (para diferentes ritmos, necesidades, o recursos limitados)
        *   Justificación de los Componentes Curriculares seleccionados.

        Asegúrate de que la propuesta NO sea genérica, esté contextualizada a Colombia y sea práctica para implementación en aula.`;

    try {
      const respuesta = await llamarGeminiAPI(promptCompleto);
      setResultadoTexto(respuesta);
      await guardarPropuestaEnFirebase(respuesta, formData);

    } catch (apiError: any) {
      console.error("Error llamando a la API de Gemini o Genkit flow:", apiError);
      setError(`Hubo un error al generar la propuesta con la IA: ${apiError.message || 'Error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };
  
  const competenciesOptions = [
    { id: "comp1", label: "Comprensión de conceptos tecnológicos básicos y su aplicación en diversos contextos (hardware, software, redes, sistemas de información)." },
    { id: "comp2", label: "Uso ético, seguro, legal y responsable de las TIC, promoviendo la ciudadanía digital y la protección de datos." },
    { id: "comp3", label: "Desarrollo del pensamiento computacional (abstracción, algoritmos, descomposición, patrones) para la resolución de problemas y la creación de soluciones innovadoras." },
    { id: "comp4", label: "Habilidades de comunicación efectiva, colaboración y trabajo en equipo en entornos digitales y presenciales, utilizando herramientas TIC." },
    { id: "comp5", label: "Fomento de la creatividad, la innovación y el emprendimiento mediante el diseño y desarrollo de proyectos tecnológicos." },
    { id: "comp6", label: "Análisis crítico de la información digital, evaluando su veracidad, relevancia, pertinencia y sesgos." },
    { id: "comp7", label: "Adaptabilidad y aprendizaje continuo frente a la rápida evolución de las tecnologías y sus implicaciones sociales." },
    { id: "comp8", label: "Gestión de proyectos tecnológicos (planificación, diseño, desarrollo, implementación, prueba y evaluación) utilizando metodologías adecuadas." },
    { id: "comp9", label: "Aplicación de principios de diseño centrado en el usuario (DCU) para crear soluciones tecnológicas accesibles y usables." },
    { id: "comp10", label: "Comprensión del impacto de la tecnología en la sociedad, la economía, la cultura y el medio ambiente, y sus dilemas éticos." },
    { id: "comp11", label: "Manejo de herramientas de productividad y software específico del área (ofimática, diseño gráfico, edición de video, programación, bases de datos)." },
    { id: "comp12", label: "Desarrollo de habilidades para la representación y visualización de datos e información." }
  ];

  const evidencesOptions = [
    { id: "ev1", label: "Diseño y creación de artefactos digitales funcionales y originales (aplicaciones, simulaciones, sitios web, videojuegos, modelos 3D)." },
    { id: "ev2", label: "Participación activa, argumentada y respetuosa en debates sobre dilemas éticos, sociales y legales relacionados con la tecnología." },
    { id: "ev3", label: "Modelado y resolución de problemas complejos utilizando algoritmos, diagramas de flujo, pseudocódigo y/o lenguajes de programación." },
    { id: "ev4", label: "Elaboración colaborativa de proyectos tecnológicos documentados, utilizando herramientas en línea, control de versiones y metodologías ágiles." },
    { id: "ev5", label: "Presentación y defensa de propuestas innovadoras que integren soluciones tecnológicas a necesidades del entorno escolar o comunitario." },
    { id: "ev6", label: "Análisis comparativo y crítico de diversas fuentes de información digital, identificando sesgos, validando datos y citando fuentes correctamente." },
    { id: "ev7", label: "Creación de un portafolio digital que evidencie el progreso individual, la aplicación de nuevas habilidades tecnológicas y la reflexión sobre el aprendizaje." },
    { id: "ev8", label: "Documentación técnica de un proyecto tecnológico, incluyendo diseño, desarrollo, pruebas, manual de usuario y lecciones aprendidas." },
    { id: "ev9", label: "Identificación y aplicación de medidas de seguridad informática para proteger dispositivos, información personal y navegar de forma segura." },
    { id: "ev10", label: "Creación de contenido digital accesible, considerando diferentes necesidades de los usuarios (ej. subtítulos, texto alternativo)." },
    { id: "ev11", label: "Análisis de casos sobre el impacto de la inteligencia artificial, el big data o el internet de las cosas en la vida cotidiana." },
    { id: "ev12", label: "Desarrollo de una campaña de sensibilización sobre un tema tecnológico relevante (ej. ciberacoso, huella digital, sostenibilidad tecnológica)." }
  ];

  const curricularComponentsOptions = [
    { id: "cc1", label: "Naturaleza y Evolución de la Tecnología: Comprendiendo el desarrollo histórico, los conceptos fundamentales y las tendencias futuras de la tecnología." },
    { id: "cc2", label: "Apropiación y Uso de la Tecnología: Desarrollando habilidades prácticas, críticas y creativas con diversas herramientas y sistemas tecnológicos." },
    { id: "cc3", label: "Solución de Problemas con Tecnología: Aplicando el pensamiento de diseño, el pensamiento computacional y metodologías de proyectos para crear soluciones innovadoras." },
    { id: "cc4", label: "Tecnología y Sociedad: Analizando las implicaciones éticas, sociales, culturales, económicas, políticas y ambientales de la tecnología y promoviendo un uso responsable." },
    { id: "cc5", label: "Alfabetización Informacional y Digital: Desarrollando competencias para buscar, seleccionar, evaluar, organizar, crear y comunicar información de manera efectiva y ética en entornos digitales." },
    { id: "cc6", label: "Comunicación y Colaboración Digital: Utilizando herramientas y plataformas digitales para interactuar, comunicarse, colaborar y construir conocimiento de forma individual y colectiva." },
    { id: "cc7", label: "Pensamiento Computacional y Programación: Desarrollando habilidades lógicas, algorítmicas y de programación para comprender cómo funcionan los sistemas digitales y crear soluciones de software." },
    { id: "cc8", label: "Diseño y Producción Tecnológica: Aplicando procesos de diseño y utilizando herramientas para la creación de artefactos, productos o servicios tecnológicos." }
  ];

  const resourcesOptions = [
    { id: "res1", label: "Computadores (PC o portátiles) con acceso a internet y software básico (navegador, ofimática)." },
    { id: "res2", label: "Software especializado (IDE para programación, diseño gráfico, edición de video, CAD, modelado 3D, simulación, etc.)." },
    { id: "res3", label: "Kits de robótica y/o electrónica (Arduino, Raspberry Pi, micro:bit, Lego Mindstorms, sensores, actuadores) e impresoras 3D." },
    { id: "res4", label: "Dispositivos móviles (tablets, smartphones) con aplicaciones educativas relevantes y acceso a internet." },
    { id: "res5", label: "Proyector multimedia, pantalla interactiva o tablero digital." },
    { id: "res6", label: "Plataformas educativas en línea (LMS como Moodle, Google Classroom, Edmodo) y herramientas colaborativas (Google Workspace, Microsoft Teams, Miro, Padlet)." },
    { id: "res7", label: "Materiales reciclables, herramientas básicas de taller (para prototipado físico) y/o kits de construcción." },
    { id: "res8", label: "Acceso a laboratorios especializados (física, química, biología) si la actividad es interdisciplinar." },
    { id: "res9", label: "Cámaras de video, micrófonos y software de edición para producción audiovisual." },
    { id: "res10", label: "Recursos bibliográficos y digitales (bases de datos, artículos, tutoriales, documentación técnica)." }
  ];

  const contextNeedsOptions = [
    { id: "need1", label: "Aula con recursos tecnológicos limitados (pocos computadores por estudiante, sin internet estable o de baja velocidad)." },
    { id: "need2", label: "Estudiantes con diversos niveles de alfabetización y competencia digital (desde básico hasta avanzado)." },
    { id: "need3", label: "Necesidad de integrar la cultura local, regional, problemáticas comunitarias o saberes ancestrales." },
    { id: "need4", label: "Enfoque en desarrollo sostenible, Objetivos de Desarrollo Sostenible (ODS) y conciencia ambiental y social." },
    { id: "need5", label: "Promoción de la equidad de género y la inclusión de minorías y grupos subrepresentados en áreas STEM y tecnología." },
    { id: "need6", label: "Conectividad a internet limitada, intermitente o nula en los hogares de los estudiantes (considerar actividades offline o asincrónicas)." },
    { id: "need7", label: "Estudiantes con necesidades educativas especiales (NEE) que requieran adaptaciones específicas en materiales, tiempos o evaluación." },
    { id: "need8", label: "Fomentar el trabajo colaborativo, la comunicación asertiva y habilidades socioemocionales en un contexto de pospandemia o diversidad." },
    { id: "need9", label: "Grupos numerosos de estudiantes que dificulten la atención personalizada o el uso de ciertos recursos." },
    { id: "need10", label: "Poco tiempo disponible para el desarrollo de proyectos extensos, necesidad de actividades concisas y de alto impacto." }
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
          {/* Campo Tema */}
          <div>
            <label htmlFor="tema" className="block text-lg font-semibold text-foreground mb-1">
              1. Tema Central o Problema:
            </label>
            <input
              type="text"
              name="tema"
              id="tema"
              value={formData.tema}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Introducción a la Programación con Python, Diseño de un Prototipo Robótico"
            />
          </div>

          {/* Campo Nivel (Select) */}
          <div>
            <label htmlFor="nivel" className="block text-lg font-semibold text-foreground mb-1">
              2. Grado(s) Específico(s):
            </label>
            <select
              name="nivel"
              id="nivel"
              value={formData.nivel}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              {["6º", "7º", "8º", "9º", "10º", "11º", "Media Técnica (10º-11º)", "Todos los grados (6º-11º)"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Campo Objetivo */}
          <div>
            <label htmlFor="objetivo" className="block text-lg font-semibold text-foreground mb-1">
              3. Objetivo Principal de la Actividad:
            </label>
            <textarea
              name="objetivo"
              id="objetivo"
              rows={3}
              value={formData.objetivo}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Que los estudiantes desarrollen pensamiento lógico a través de la creación de algoritmos."
            />
          </div>
          
           {/* Campo Tiempo */}
           <div className="space-y-3">
            <label htmlFor="tiempo" className="block text-lg font-semibold text-foreground mb-1">
              4. Tiempo Disponible:
            </label>
            <select
              name="tiempo"
              id="tiempo"
              value={formData.tiempo}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Selecciona el tiempo disponible</option>
              {tiempoOptions.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
            <input
              type="text"
              name="tiempo_otro"
              id="tiempo_otro"
              value={formData.tiempo.startsWith("Flexible") || tiempoOptions.find(opt => opt.label === formData.tiempo) ? "" : formData.tiempo}
              onChange={(e) => setFormData(prev => ({...prev, tiempo: e.target.value}))}
              className="mt-2 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Otro (especificar, ej: 1 trimestre)"
            />
          </div>


          {/* Campo Metodología */}
          <div className="space-y-3">
            <label htmlFor="methodologyPreference" className="block text-lg font-semibold text-foreground mb-1">
              5. Metodología Preferida:
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
            <label className="block text-lg font-semibold text-foreground">6. Competencias a Desarrollar:</label>
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
             <p className="text-xs text-muted-foreground mt-1">Selecciona las competencias del área de Tecnología e Informática (Orientaciones MEN, Guía 30).</p>
          </div>

          {/* Evidencias de Aprendizaje */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">7. Evidencias de Aprendizaje:</label>
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
            <p className="text-xs text-muted-foreground mt-1">¿Qué acciones o productos permitirán verificar el desarrollo de competencias?</p>
          </div>

           {/* Componentes Curriculares */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">8. Componentes Curriculares:</label>
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

          {/* Campo Recursos */}
          <div>
            <label htmlFor="recursos" className="block text-lg font-semibold text-foreground mb-1">
               9. Recursos Disponibles (adicionales a los seleccionados):
            </label>
            <textarea
              name="recursos"
              id="recursos"
              rows={2}
              value={formData.recursos}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Plataforma LMS específica, software de simulación X, acceso a taller de electrónica. Describe otros recursos importantes."
            />
          </div>
           {/* Recursos Disponibles (Checkboxes) */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">Recursos Disponibles (selección principal):</label>
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
             <p className="text-xs text-muted-foreground mt-1">Selecciona los recursos con los que cuentas. Puedes añadir más detalles en el campo de texto arriba.</p>
          </div>


          {/* Contexto y Necesidades */}
           <div className="space-y-3">
            <label className="block text-lg font-semibold text-foreground">10. Contexto y Necesidades Particulares:</label>
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
              11. Descripción Detallada de la Actividad (cómo te la imaginas):
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
              12. Método de Evaluación:
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
              13. Interdisciplinariedad (Opcional):
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
              14. Detalles Adicionales o Tono Deseado para la IA:
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