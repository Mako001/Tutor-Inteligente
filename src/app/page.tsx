// src/app/page.tsx
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';


// Interfaz para los datos del formulario
interface FormData {
  grade: string;
  timeAvailable: string;
  centralTheme: string;
  methodologyPreference: string;
  competenciesToDevelop: string[];
  learningEvidences: string[];
  curricularComponents: string[];
  availableResourcesCheckboxes: string[];
  recursos: string;
  contextAndNeeds: string[];
  actividad: string;
  evaluacion: string;
  interdisciplinarity?: string;
  detallesAdicionales: string;
}

// Opciones para los campos de selección múltiple y selectores
const gradeOptions = [
  "6º", "7º", "8º", "9º", "10º", "11º",
  "Básica Primaria (1º-5º)",
  "Básica Secundaria (6º-9º)",
  "Media Académica (10º-11º)",
  "Media Técnica (10º-11º)",
  "Ciclos Lectivos Especiales Integrados (CLEI)",
  "Educación para Adultos",
  "Todos los grados de bachillerato (6º-11º)",
  "Otro (especificar en tema o detalles)"
];

const tiempoOptions = [
  { id: "t1", label: "1-2 horas clase (Sesión única o doble)" },
  { id: "t2", label: "3-4 horas clase (Varias sesiones, ej. 1 semana)" },
  { id: "t3", label: "Proyecto corto (5-8 horas clase, ej. 2 semanas)" },
  { id: "t4", label: "Proyecto mediano (9-15 horas clase, ej. 3-4 semanas)" },
  { id: "t5", label: "Proyecto largo o trimestral (+16 horas clase)" },
  { id: "t6", label: "Flexible / A definir según avance" },
  { id: "t7", label: "Micro-aprendizaje (menos de 1 hora)" },
];

const methodologyOptions = [
  { id: "meth_abp", label: "Aprendizaje Basado en Proyectos (ABP)" },
  { id: "meth_abpr", label: "Aprendizaje Basado en Problemas (ABPr)" },
  { id: "meth_gam", label: "Gamificación / Aprendizaje Basado en Juegos" },
  { id: "meth_inv", label: "Aula Invertida (Flipped Classroom)" },
  { id: "meth_design", label: "Pensamiento de Diseño (Design Thinking)" },
  { id: "meth_colab", label: "Aprendizaje Colaborativo / Cooperativo" },
  { id: "meth_steam", label: "Aprendizaje STEAM (Ciencia, Tecnología, Ingeniería, Artes y Matemáticas)" },
  { id: "meth_indag", label: "Aprendizaje por Indagación" },
  { id: "meth_exp", label: "Aprendizaje Experiencial" },
  { id: "meth_estcas", label: "Estudio de Casos" },
  { id: "meth_sim", label: "Simulaciones y Modelado" },
  { id: "meth_sugg", label: "Abierto a sugerencias de la IA" },
  { id: "meth_other", label: "Otro (especificar en detalles)" },
];

const competenciesToDevelopOptions = [
  { id: "comp_pens_crit", label: "Desarrollo del pensamiento crítico y reflexivo frente a la tecnología y sus implicaciones." },
  { id: "comp_sol_prob", label: "Capacidad para identificar, formular y resolver problemas utilizando tecnología de manera creativa e innovadora." },
  { id: "comp_uso_tic", label: "Uso ético, seguro, legal y responsable de las Tecnologías de la Información y la Comunicación (TIC)." },
  { id: "comp_com_dig", label: "Habilidades para la comunicación y colaboración en entornos digitales." },
  { id: "comp_info_data", label: "Alfabetización informacional y manejo de datos (búsqueda, evaluación, organización y presentación de información)." },
  { id: "comp_ciudad_dig", label: "Ejercicio de la ciudadanía digital de forma activa y participativa." },
  { id: "comp_tec_soc", label: "Comprensión de las relaciones entre tecnología, ciencia, sociedad y ambiente." },
  { id: "comp_innov", label: "Fomento de la creatividad, la innovación y el emprendimiento con base tecnológica." },
  { id: "comp_modelado", label: "Capacidad para modelar y simular fenómenos o sistemas utilizando herramientas tecnológicas." },
  { id: "comp_prog_basic", label: "Introducción al pensamiento computacional y principios básicos de programación/codificación." },
  { id: "comp_seg_dig", label: "Conocimiento y aplicación de medidas de seguridad digital y protección de la privacidad." },
  { id: "comp_tec_espec", label: "Manejo técnico de herramientas y software específico del área." },
  { id: "comp_gestion_proy", label: "Habilidades para la gestión de proyectos tecnológicos básicos." },
  { id: "comp_adapt", label: "Adaptabilidad y aprendizaje continuo en entornos tecnológicos cambiantes." },
  { id: "comp_interdisc", label: "Capacidad para integrar conocimientos de tecnología con otras áreas del saber." },
];

const learningEvidencesOptions = [
  { id: "ev_proy_dig", label: "Creación de un proyecto digital (presentación, video, podcast, blog, sitio web básico) que demuestre comprensión del tema." },
  { id: "ev_sol_tec", label: "Diseño y/o prototipado de una solución tecnológica a un problema planteado." },
  { id: "ev_analisis_crit", label: "Análisis crítico y debate argumentado sobre el impacto de una tecnología específica." },
  { id: "ev_colab_linea", label: "Participación activa y constructiva en actividades colaborativas en línea utilizando herramientas digitales." },
  { id: "ev_pres_info", label: "Presentación oral o escrita de información investigada, utilizando herramientas TIC y citando fuentes." },
  { id: "ev_prog_simple", label: "Desarrollo de un algoritmo o programa sencillo para resolver una tarea específica, documentando el proceso." },
  { id: "ev_diag_tec", label: "Diagnóstico de problemas en artefactos o sistemas tecnológicos simples y propuesta de soluciones viables." },
  { id: "ev_uso_herram", label: "Uso efectivo de herramientas de software específicas para la creación de contenido o análisis de datos, demostrando fluidez." },
  { id: "ev_portafolio", label: "Construcción de un portafolio digital con los trabajos y reflexiones del periodo, evidenciando progreso." },
  { id: "ev_autoeval", label: "Autoevaluación y coevaluación del proceso de aprendizaje y los productos generados, usando criterios definidos." },
  { id: "ev_map_concept", label: "Elaboración de mapas conceptuales o diagramas de flujo para representar procesos o sistemas tecnológicos." },
  { id: "ev_informe_tec", label: "Redacción de un informe técnico o manual de usuario para un artefacto o proceso." },
  { id: "ev_diseno_interfaz", label: "Diseño de interfaces de usuario (mockups, wireframes) para una aplicación o sitio web." },
  { id: "ev_defensa_proy", label: "Defensa oral de un proyecto tecnológico, argumentando decisiones de diseño y funcionalidad." },
  { id: "ev_resol_retos", label: "Resolución de retos de programación o lógica computacional en plataformas interactivas." },
];

const curricularComponentsOptions = [
  { id: "cc_nat_tec", label: "Naturaleza y Evolución de la Tecnología" },
  { id: "cc_aprop_uso", label: "Apropiación y Uso de la Tecnología" },
  { id: "cc_sol_prob_tec", label: "Solución de Problemas con Tecnología" },
  { id: "cc_tec_soc", label: "Tecnología y Sociedad" },
  { id: "cc_pens_comp", label: "Pensamiento Computacional (transversal)" },
  { id: "cc_info_com", label: "Información y Comunicación (Manejo de datos, medios digitales)" },
  { id: "cc_etica_leg", label: "Aspectos Éticos y Legales de la Tecnología (Propiedad intelectual, privacidad)" },
  { id: "cc_dis_creac", label: "Diseño y Creación Tecnológica (Prototipado, innovación)" },
];

const resourcesOptions = [
  { id: "res_comp_int", label: "Computadores (PC o portátiles) con acceso a internet." },
  { id: "res_software_basico", label: "Software básico (navegador, ofimática, editor de texto plano)." },
  { id: "res_software_esp", label: "Software especializado (IDE, diseño gráfico, modelado 3D, etc., según actividad)." },
  { id: "res_dispmov", label: "Dispositivos móviles (tablets, smartphones) de los estudiantes (si se permite y es pertinente)." },
  { id: "res_proyector", label: "Proyector o pantalla para visualización en clase." },
  { id: "res_plataf_colab", label: "Plataformas colaborativas en línea (Google Workspace, Microsoft Teams, Moodle, etc.)." },
  { id: "res_mat_prototipado", label: "Materiales para prototipado (cartón, material reciclable, kits básicos de electrónica/robótica si aplica)." },
  { id: "res_biblio_web", label: "Acceso a bibliotecas digitales y recursos web confiables." },
  { id: "res_sensores_act", label: "Kits de sensores y actuadores (Arduino, Micro:bit, etc.)." },
  { id: "res_impresora3d", label: "Impresora 3D y filamento." },
  { id: "res_herram_man", label: "Herramientas manuales básicas (para desensamble o construcción)." },
  { id: "res_lab_fis", label: "Laboratorio de física o electrónica (si se requiere)." },
];

const contextNeedsOptions = [
  { id: "need_conect_limit", label: "Conectividad a internet limitada o intermitente en el aula/institución." },
  { id: "need_pocos_equipos", label: "Número limitado de computadores o dispositivos por estudiante (requiere trabajo en equipo)." },
  { id: "need_diversidad_habil", label: "Estudiantes con diversos niveles de alfabetización y competencia digital previa." },
  { id: "need_inclusion", label: "Necesidad de adaptaciones específicas para estudiantes con necesidades educativas especiales (NEE)." },
  { id: "need_foco_colab", label: "Énfasis en el desarrollo de habilidades de trabajo colaborativo y comunicación." },
  { id: "need_motiv", label: "Contexto con baja motivación estudiantil hacia el área de tecnología o temas específicos." },
  { id: "need_recursos_especificos", label: "Disponibilidad (o falta crítica) de software, hardware o plataformas específicas." },
  { id: "need_seguridad", label: "Necesidad de reforzar prácticas de seguridad digital, privacidad y ciudadanía digital." },
  { id: "need_context_rural", label: "Contexto rural con desafíos de acceso a tecnología o recursos." },
  { id: "need_interes_local", label: "Intereses o problemáticas locales que se pueden abordar con tecnología." },
  { id: "need_multigrado", label: "Aula multigrado o con estudiantes de diferentes edades/niveles de desarrollo." },
  { id: "need_foco_practico", label: "Preferencia por actividades muy prácticas y aplicadas (menos teóricas)." },
];

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    grade: '6º',
    timeAvailable: '',
    centralTheme: '',
    methodologyPreference: 'Abierto a sugerencias de la IA',
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

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof Pick<FormData, 'competenciesToDevelop' | 'learningEvidences' | 'curricularComponents' | 'availableResourcesCheckboxes' | 'contextAndNeeds'>, value: string) => {
    setFormData(prev => {
      const list = (prev[category] as string[]) || [];
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...list, value] };
      }
    });
  };

  const llamarGeminiAPI = async (prompt: string): Promise<string> => {
    console.log("Frontend: Enviando prompt al backend (/api/gemini):", prompt.substring(0,100) + "...");
    setError(''); // Limpiar errores anteriores
  
    try {
      const response = await fetch('/api/gemini', { // Llama a tu API Route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }), // Envía el prompt en el cuerpo
      });
  
      const data = await response.json(); // Intenta parsear JSON siempre
  
      if (!response.ok) {
        const errorMessage = data?.error || `Error del servidor: ${response.status} ${response.statusText}`;
        console.error("Frontend: Error desde la API Route de Gemini:", errorMessage);
        throw new Error(errorMessage);
      }
      
      // Si llegamos aquí y response.ok es true, data debería tener generatedText
      if (data.error) { // Por si la API devuelve 200 OK pero con un error en el cuerpo
          console.error("Frontend: Error en el cuerpo de la respuesta de la API de Gemini (via backend):", data.error);
          throw new Error(data.error);
      }
      
      console.log("Frontend: Respuesta del backend (Gemini):", data.generatedText ? data.generatedText.substring(0,100) + "..." : "Sin texto generado");
      return data.generatedText || ""; // Devuelve el texto generado o un string vacío si no existe
  
    } catch (fetchError) {
      console.error("Frontend: Error al hacer fetch a /api/gemini:", fetchError);
      // Asegúrate de que el error se propague para que el bloque catch en handleGenerarPropuesta lo maneje
      if (fetchError instanceof Error) {
          throw new Error(`No se pudo conectar con el asistente de IA: ${fetchError.message}`);
      }
      throw new Error("No se pudo conectar con el asistente de IA: error desconocido.");
    }
  };

  const guardarPropuestaEnFirebase = async (propuesta: string, datos: FormData) => {
    if (!firestore) {
      console.error("Firestore no está disponible. No se puede guardar.");
      setError("Error: No se pudo conectar a la base de datos para guardar.");
      return;
    }
    try {
      const dataToSave = {
        ...datos,
        // Convert arrays to comma-separated strings for Firebase, if desired
        // Or store them as arrays directly if your Firestore setup handles it well
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

    const promptCompleto = `Rol: Eres un Asistente experto en diseño de actividades de aprendizaje en Tecnología e Informática para bachillerato en Colombia, con profundo conocimiento de las Orientaciones Curriculares del MEN y la Guía 30.

    Tarea: Genera una propuesta de actividad de aprendizaje DETALLADA, PRÁCTICA y ALTAMENTE CONTEXTUALIZADA a Colombia. La propuesta debe ser fácil de seguir, con secciones claras y listas para ser implementada en un aula. Asegúrate de que la respuesta NO sea genérica y se adhiera estrictamente a los lineamientos del MEN. Formatea la respuesta usando Markdown ligero (negritas, listas).

    Información Proporcionada por el Docente:
    1.  **Grado(s) Específico(s):** ${formData.grade}
    2.  **Tiempo Disponible:** ${formData.timeAvailable} (Detalla la distribución si es relevante)
    3.  **Tema Central / Problema a Resolver:** ${formData.centralTheme}
    4.  **Metodología Preferida:** ${formData.methodologyPreference} (Si es "Abierto a sugerencias", propón la más adecuada justificando brevemente)
    5.  **Competencias a Desarrollar (MEN - TI):** (Citar textualmente o adaptar fielmente de las Orientaciones Curriculares, páginas 56-57 para 10º-11º, o equivalentes)
        ${formData.competenciesToDevelop.map(c => `- ${c}`).join('\n        ')}
    6.  **Evidencias de Aprendizaje (MEN - TI):** (Citar textualmente o adaptar fielmente de las Orientaciones, alineadas a las competencias)
        ${formData.learningEvidences.map(e => `- ${e}`).join('\n        ')}
    7.  **Componentes Curriculares (Justificar selección):**
        ${formData.curricularComponents.map(c => `- ${c}`).join('\n        ')}
        (Justificación breve de por qué estos componentes son los principales)
    8.  **Recursos Disponibles:**
        Seleccionados: ${formData.availableResourcesCheckboxes.map(r => `- ${r}`).join('\n        ')}
        Adicionales (texto): ${formData.recursos || 'Ninguno especificado'}
    9.  **Contexto y Necesidades Particulares:**
        ${formData.contextAndNeeds.map(n => `- ${n}`).join('\n        ')}
        ${formData.detallesAdicionales.includes("contexto") ? `Detalles adicionales sobre el contexto: ${formData.detallesAdicionales}` : ''}
    10. **Interdisciplinariedad (Opcional):** ${formData.interdisciplinarity || 'No se especificó integración.'}
    11. **Ideas Iniciales del Docente sobre la Actividad:** ${formData.actividad || 'El docente no proveyó una descripción inicial detallada.'}
    12. **Ideas Iniciales del Docente sobre la Evaluación:** ${formData.evaluacion || 'El docente no proveyó un método de evaluación inicial detallado.'}
    13. **Detalles Adicionales o Tono Deseado para la IA:** ${formData.detallesAdicionales || 'Tono profesional, claro y práctico.'}

    Formato de Salida Obligatorio (Secciones Claras con Markdown):
    ## Propuesta de Actividad de Aprendizaje: "[Título Creativo y Descriptivo de la Actividad]"

    **Grado(s):** [Grado(s) especificado(s)]
    **Tiempo Disponible Estimado:** [Tiempo total y distribución si aplica]
    **Tema Central:** [Tema central]
    **Metodología Propuesta:** [Metodología, con breve justificación si fue sugerida por la IA]

    **1. Descripción Completa de la Actividad:**
    (Presentación general de la actividad, su propósito y flujo principal. Usar párrafos.)

    **2. Objetivos de Aprendizaje:**
    (Alineados con las competencias seleccionadas. Claros y medibles. Usar lista de viñetas)
    *   Objetivo 1...
    *   Objetivo 2...

    **3. Competencias a Desarrollar (MEN - TI):**
    (Listar las competencias citadas por el docente. Usar lista de viñetas)
    *   [Competencia 1]
    *   [Competencia 2]

    **4. Fases de la Actividad:**

    **Fase 1: [Nombre de la Fase 1] ([Duración Estimada si aplica])**
    *   **Actividad:** [Descripción detallada de las acciones de los estudiantes y el docente. Usar párrafos y/o listas.]
    *   **Roles:** (Si aplica, roles específicos del docente y estudiantes. Usar párrafos y/o listas.)
    *   **Preguntas Orientadoras:**
        *   [Pregunta 1 para guiar la reflexión/trabajo]
        *   [Pregunta 2...]
    *   **Recursos Específicos para esta Fase:** [Listado con viñetas]

    **Fase 2: [Nombre de la Fase 2] ([Duración Estimada si aplica])**
    *   **Actividad:** ...
    *   **Roles:** ...
    *   **Preguntas Orientadoras:** ...
    *   **Recursos Específicos para esta Fase:** ...

    (Continuar con más fases según sea necesario)

    **5. Producto(s) Esperado(s):**
    (Qué deben entregar o demostrar los estudiantes. Usar lista de viñetas)
    *   [Producto 1]
    *   [Producto 2]

    **6. Evaluación:**
    *   **Evidencias de Aprendizaje (MEN - TI):**
        (Listar las evidencias citadas. Usar lista de viñetas)
        *   [Evidencia 1] relacionada con [Producto X]
    *   **Criterios de Evaluación:** (Para cada producto/evidencia. Usar lista de viñetas o tabla simple)
        *   Criterio A: ...
    *   **Instrumentos de Evaluación Sugeridos:**
        *   [Ej: Rúbrica para proyecto (describir brevemente o indicar que se adjuntaría)]
        *   [Ej: Lista de chequeo para participación]

    **7. Recursos Necesarios (Generales):**
    (Consolidado de recursos. Usar lista de viñetas)
    *   [Recurso 1]

    **8. Posibles Adaptaciones:**
    (Considerando contexto y necesidades. Usar lista de viñetas)
    *   Para estudiantes con menor competencia digital: ...

    **9. Justificación de los Componentes Curriculares:**
    (Explicación breve de cómo se abordan los componentes. Usar lista de viñetas)
    *   **[Componente 1]:** Se aborda a través de...

    **10. Integración Interdisciplinar (Si aplica):**
    *   **[Área del conocimiento]:** Se integra mediante [actividad/tema específico].
    `;

    try {
      const respuesta = await llamarGeminiAPI(promptCompleto);
      setResultadoTexto(respuesta);
      await guardarPropuestaEnFirebase(respuesta, formData);

    } catch (apiErrorOrFetchError) {
      console.error("Error en el flujo de generación:", apiErrorOrFetchError);
      if (apiErrorOrFetchError instanceof Error) {
        setError(`Hubo un error: ${apiErrorOrFetchError.message}`);
      } else {
        setError("Hubo un error desconocido al generar la propuesta.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-secondary" suppressHydrationWarning={true}>
      <header className="text-center mb-10 py-6">
        <h1 className="text-5xl font-bold text-primary">AprendeTech Colombia</h1>
        <p className="text-xl text-foreground/80 mt-2">Asistente IA para el Diseño de Actividades Educativas en Tecnología e Informática</p>
      </header>

      <main className="w-full max-w-4xl bg-card p-8 rounded-xl shadow-2xl" suppressHydrationWarning={true}>
        <p className="text-muted-foreground mb-6 text-center">
          ¡Hola, colega docente de Informática! Completa la siguiente información para generar una propuesta de actividad ajustada a tus necesidades y a los lineamientos del MEN.
        </p>
        <form onSubmit={handleGenerarPropuesta} className="space-y-8">
          <div>
            <Label htmlFor="grade" className="block text-lg font-semibold text-foreground mb-1">
              1. Grado(s) Específico(s):
            </Label>
            <Select name="grade" value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
              <SelectTrigger id="grade" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona el grado" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="timeAvailable" className="block text-lg font-semibold text-foreground mb-1">
              2. Tiempo Disponible:
            </Label>
            <Select name="timeAvailable" value={formData.timeAvailable} onValueChange={(value) => handleSelectChange('timeAvailable', value)}>
              <SelectTrigger id="timeAvailable" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona el tiempo" />
              </SelectTrigger>
              <SelectContent>
                {tiempoOptions.map(t => <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="text"
              name="timeAvailable_otro"
              value={formData.timeAvailable.startsWith("Flexible") || tiempoOptions.find(opt => opt.label === formData.timeAvailable) ? "" : formData.timeAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, timeAvailable: e.target.value }))}
              className="mt-2"
              placeholder="Si es flexible o necesitas detallar, especifica aquí"
            />
          </div>

          <div>
            <Label htmlFor="centralTheme" className="block text-lg font-semibold text-foreground mb-1">
              3. Tema Central o Problema:
            </Label>
            <Input
              type="text"
              name="centralTheme"
              id="centralTheme"
              value={formData.centralTheme}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Introducción a la Programación con Python"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="methodologyPreference" className="block text-lg font-semibold text-foreground mb-1">
              4. Metodología Preferida:
            </Label>
            <Select name="methodologyPreference" value={formData.methodologyPreference} onValueChange={(value) => handleSelectChange('methodologyPreference', value)}>
              <SelectTrigger id="methodologyPreference" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona la metodología" />
              </SelectTrigger>
              <SelectContent>
                {methodologyOptions.map(m => <SelectItem key={m.id} value={m.label}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-semibold text-foreground">5. Competencias a Desarrollar:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {competenciesToDevelopOptions.map(comp => (
                <div key={comp.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Checkbox
                    id={`comp-${comp.id}`}
                    checked={(formData.competenciesToDevelop || []).includes(comp.label)}
                    onCheckedChange={() => handleCheckboxChange('competenciesToDevelop', comp.label)}
                  />
                  <Label htmlFor={`comp-${comp.id}`} className="text-sm text-foreground/90 cursor-pointer">{comp.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Selecciona las competencias clave (MEN / Guía 30).</p>
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-semibold text-foreground">6. Evidencias de Aprendizaje:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {learningEvidencesOptions.map(ev => (
                <div key={ev.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Checkbox
                    id={`ev-${ev.id}`}
                    checked={(formData.learningEvidences || []).includes(ev.label)}
                    onCheckedChange={() => handleCheckboxChange('learningEvidences', ev.label)}
                  />
                  <Label htmlFor={`ev-${ev.id}`} className="text-sm text-foreground/90 cursor-pointer">{ev.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">¿Qué acciones o productos permitirán verificar el aprendizaje?</p>
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-semibold text-foreground">7. Componentes Curriculares:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {curricularComponentsOptions.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Checkbox
                    id={`cc-${item.id}`}
                    checked={(formData.curricularComponents || []).includes(item.label)}
                    onCheckedChange={() => handleCheckboxChange('curricularComponents', item.label)}
                  />
                  <Label htmlFor={`cc-${item.id}`} className="text-sm text-foreground/90 cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">¿Cuáles componentes del área se abordarán?</p>
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-semibold text-foreground">8. Recursos Disponibles (selección principal):</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {resourcesOptions.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Checkbox
                    id={`res-${item.id}`}
                    checked={(formData.availableResourcesCheckboxes || []).includes(item.label)}
                    onCheckedChange={() => handleCheckboxChange('availableResourcesCheckboxes', item.label)}
                  />
                  <Label htmlFor={`res-${item.id}`} className="text-sm text-foreground/90 cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="recursos" className="block text-sm font-medium text-foreground mb-1">
              Recursos Adicionales (texto libre):
            </Label>
            <Textarea
              name="recursos"
              id="recursos"
              rows={2}
              value={formData.recursos}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Plataforma LMS específica, software X. Describe otros recursos."
            />
          </div>

          <div className="space-y-3">
            <Label className="block text-lg font-semibold text-foreground">9. Contexto y Necesidades Particulares:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-60 overflow-y-auto p-2 border border-input rounded-md">
              {contextNeedsOptions.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Checkbox
                    id={`need-${item.id}`}
                    checked={(formData.contextAndNeeds || []).includes(item.label)}
                    onCheckedChange={() => handleCheckboxChange('contextAndNeeds', item.label)}
                  />
                  <Label htmlFor={`need-${item.id}`} className="text-sm text-foreground/90 cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">¿Alguna particularidad de tu contexto escolar o estudiantes?</p>
          </div>

          <div>
            <Label htmlFor="actividad" className="block text-lg font-semibold text-foreground mb-1">
              10. Ideas Iniciales sobre la Actividad (opcional):
            </Label>
            <Textarea
              name="actividad"
              id="actividad"
              rows={4}
              value={formData.actividad}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Describe los pasos, fases, roles que te imaginas, etc. (Opcional)"
            />
          </div>

          <div>
            <Label htmlFor="evaluacion" className="block text-lg font-semibold text-foreground mb-1">
              11. Ideas Iniciales sobre la Evaluación (opcional):
            </Label>
            <Textarea
              name="evaluacion"
              id="evaluacion"
              rows={3}
              value={formData.evaluacion}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="¿Cómo planeas evaluar? Ej: Rúbrica, quiz, observación. (Opcional)"
            />
          </div>

          <div>
            <Label htmlFor="interdisciplinarity" className="block text-lg font-semibold text-foreground mb-1">
              12. Interdisciplinariedad (Opcional):
            </Label>
            <Input
              type="text"
              name="interdisciplinarity"
              id="interdisciplinarity"
              value={formData.interdisciplinarity || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Matemáticas (cálculo de costos), Artes (diseño)."
            />
          </div>

          <div>
            <Label htmlFor="detallesAdicionales" className="block text-lg font-semibold text-foreground mb-1">
              13. Detalles Adicionales o Tono Deseado para la IA (opcional):
            </Label>
            <Textarea
              name="detallesAdicionales"
              id="detallesAdicionales"
              rows={2}
              value={formData.detallesAdicionales}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Tono formal, creativo, incluir ejemplos para grado X."
            />
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={cargando}
              className="w-full text-lg py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground transition-colors duration-300 ease-in-out transform active:scale-95"
            >
              {cargando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent-foreground"></div>
              ) : (
                'Generar Propuesta de Actividad con IA'
              )}
            </Button>
          </div>

          {/* Form-level error display, distinct from result section error */}
          {error && !cargando && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
        </form>

        {/* Sección de Resultado */}
        <section id="resultadoIA" aria-live="polite" className="mt-10">
          {cargando && (
            <div className="flex justify-center items-center p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
              <p className="text-muted-foreground">Generando propuesta...</p>
            </div>
          )}
          {error && !cargando && (
            <div className="propuesta-generada-estilizada-error p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
              <h2 className="text-xl font-semibold text-destructive mb-3">Error al Generar Propuesta</h2>
              <p>{error}</p>
            </div>
          )}
          {resultadoTexto && !cargando && !error && (
            <div className="propuesta-generada-estilizada">
              {/* <h2 className="text-3xl font-semibold text-primary mb-6 pb-2 border-b border-border">Propuesta Generada:</h2> */}
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {resultadoTexto}
              </ReactMarkdown>
            </div>
          )}
          {!resultadoTexto && !cargando && !error && (
            <div className="text-center text-muted-foreground py-10">
              <p>La propuesta generada aparecerá aquí después de completar el formulario.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center mt-16 py-6 text-sm text-muted-foreground" suppressHydrationWarning={true}>
        <p>© {currentYear || new Date().getFullYear()} AprendeTech Colombia. Todos los derechos reservados.</p>
        <p>Una herramienta para potenciar la educación en Tecnología e Informática.</p>
      </footer>
    </div>
  );
}
