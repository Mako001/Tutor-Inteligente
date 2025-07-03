// src/lib/data/curriculum.ts

/**
 * Interfaz que define la estructura de los datos curriculares para cada materia.
 */
export interface CurriculumData {
  materia: string;
  fuentePrincipal: string;
  competencias: string[];
  componentesCurriculares: string[];
  evidenciasAprendizaje: string[];
}

/**
 * Almacena los datos curriculares para diversas materias del sistema educativo colombiano,
 * basados en los lineamientos y estándares del Ministerio de Educación Nacional (MEN).
 * Este objeto actúa como una base de datos central para alimentar dinámicamente el formulario.
 */
export const curriculumData: Record<string, CurriculumData> = {
  "Tecnología e Informática": {
    materia: "Tecnología e Informática",
    fuentePrincipal: "Orientaciones Generales para la Educación en Tecnología (Guía 30)",
    competencias: [
      "Desarrollo del pensamiento crítico y reflexivo frente a la tecnología.",
      "Capacidad para identificar, formular y resolver problemas con tecnología.",
      "Uso ético, seguro y responsable de las TIC.",
      "Habilidades para la comunicación y colaboración en entornos digitales.",
      "Alfabetización informacional y manejo de datos.",
      "Ejercicio de la ciudadanía digital activa y participativa.",
      "Fomento de la creatividad, la innovación y el emprendimiento.",
    ],
    componentesCurriculares: [
      "Naturaleza y Evolución de la Tecnología",
      "Apropiación y Uso de la Tecnología",
      "Solución de Problemas con Tecnología",
      "Tecnología y Sociedad",
      "Pensamiento Computacional (transversal)",
      "Diseño y Creación Tecnológica (Prototipado)",
    ],
    evidenciasAprendizaje: [
      "Creación de un proyecto digital (video, podcast, blog, web).",
      "Diseño y/o prototipado de una solución a un problema.",
      "Análisis crítico y debate argumentado sobre un tema tecnológico.",
      "Desarrollo de un algoritmo o programa sencillo.",
      "Participación activa en actividades colaborativas en línea.",
      "Presentación de información investigada usando herramientas TIC.",
      "Diseño de interfaces de usuario (mockups, wireframes).",
    ],
  },
  "Matemáticas": {
    materia: "Matemáticas",
    fuentePrincipal: "Estándares Básicos de Competencias en Matemáticas",
    competencias: [
      "Formular y resolver problemas.",
      "Modelar procesos y fenómenos de la realidad.",
      "Comunicar ideas matemáticas.",
      "Razonar lógicamente.",
      "Formular, comparar y ejercitar procedimientos y algoritmos.",
    ],
    componentesCurriculares: [
      "Pensamiento Numérico y Sistemas Numéricos",
      "Pensamiento Espacial y Sistemas Geométricos",
      "Pensamiento Métrico y Sistemas de Medidas",
      "Pensamiento Aleatorio y Sistemas de Datos",
      "Pensamiento Variacional y Sistemas Algebraicos y Analíticos",
    ],
    evidenciasAprendizaje: [
      "Resolver problemas que involucren información cuantitativa.",
      "Usar modelos (diagramas, gráficos, expresiones) para representar situaciones.",
      "Justificar procedimientos y resultados matemáticos.",
      "Interpretar y analizar datos estadísticos.",
      "Crear y argumentar conjeturas sobre propiedades geométricas.",
    ],
  },
  "Ciencias Naturales (Biología, Química, Física)": {
    materia: "Ciencias Naturales",
    fuentePrincipal: "Estándares Básicos de Competencias en Ciencias Naturales y Ciencias Sociales",
    competencias: [
      "Uso comprensivo del conocimiento científico.",
      "Explicación de fenómenos.",
      "Indagación científica.",
      "Comunicación de ideas científicas.",
      "Trabajo en equipo y disposición para aceptar la naturaleza abierta del conocimiento.",
    ],
    componentesCurriculares: [
      "Entorno Vivo (Biología)",
      "Entorno Físico (Física)",
      "Ciencia, Tecnología y Sociedad (CTS)",
      "Procesos Químicos (Química)",
      "Desarrollo de compromisos personales y sociales",
    ],
    evidenciasAprendizaje: [
      "Diseñar y realizar un experimento para responder una pregunta.",
      "Construir explicaciones y modelos para fenómenos naturales.",
      "Analizar información de fuentes científicas y comunicarla.",
      "Debatir sobre las implicaciones sociales de un avance tecnológico/científico.",
      "Elaborar un informe de laboratorio.",
    ],
  },
  "Ciencias Sociales (Historia, Geografía, Cívica)": {
    materia: "Ciencias Sociales",
    fuentePrincipal: "Estándares Básicos de Competencias en Ciencias Naturales y Ciencias Sociales",
    competencias: [
      "Pensamiento social: análisis crítico de la realidad social.",
      "Interpretación y análisis de perspectivas.",
      "Pensamiento reflexivo y sistémico.",
      "Comprensión del tiempo y el espacio histórico.",
      "Desarrollo de la identidad y el compromiso ciudadano.",
    ],
    componentesCurriculares: [
      "Relaciones con la Historia y las Culturas",
      "Relaciones Espaciales y Ambientales (Geografía)",
      "Relaciones Ético-Políticas (Constitución y Democracia)",
      "Desarrollo de compromisos personales y sociales",
    ],
    evidenciasAprendizaje: [
      "Elaborar una línea de tiempo y analizar cambios y continuidades.",
      "Analizar un conflicto social desde diferentes perspectivas.",
      "Interpretar mapas y fuentes históricas.",
      "Formular un proyecto para resolver una necesidad de la comunidad.",
      "Escribir un ensayo comparando dos periodos históricos.",
    ],
  },
  "Lenguaje y Comunicación (Español, Literatura)": {
    materia: "Lenguaje y Comunicación",
    fuentePrincipal: "Estándares Básicos de Competencias del Lenguaje",
    competencias: [
      "Producción textual (oral y escrita).",
      "Comprensión e interpretación textual.",
      "Literatura (análisis e interpretación de obras).",
      "Medios de comunicación y otros sistemas simbólicos.",
      "Ética de la comunicación.",
    ],
    componentesCurriculares: [
      "Producción Textual",
      "Comprensión e Interpretación Textual",
      "Literatura",
      "Medios de Comunicación y Otros Sistemas Simbólicos",
      "Pragmática y Semántica",
    ],
    evidenciasAprendizaje: [
      "Escribir un ensayo, cuento o artículo de opinión.",
      "Realizar un análisis literario de una obra.",
      "Producir un podcast, video o guion.",
      "Participar en un debate con argumentos sólidos.",
      "Crear un texto publicitario o una campaña mediática.",
    ],
  },
  "Inglés (Lengua Extranjera)": {
    materia: "Inglés (Lengua Extranjera)",
    fuentePrincipal: "Estándares Básicos de Competencias en Lenguas Extranjeras: Inglés (Guía 22)",
    competencias: [
      "Competencia Lingüística (gramatical y léxica).",
      "Competencia Pragmática (funcional y discursiva).",
      "Competencia Sociolingüística.",
      "Comprensión oral (Listening).",
      "Comprensión de lectura (Reading).",
      "Expresión oral (Speaking - Monólogos y Conversación).",
      "Expresión escrita (Writing).",
    ],
    componentesCurriculares: [
      "Comunicación Oral (Listening & Speaking)",
      "Comunicación Escrita (Reading & Writing)",
      "Conciencia Intercultural",
      "Uso de la gramática y el vocabulario en contexto",
    ],
    evidenciasAprendizaje: [
      "Participar en una conversación o role-play.",
      "Escribir un correo electrónico, un post para un blog o un ensayo corto.",
      "Comprender la idea principal de un audio o video.",
      "Realizar una presentación oral sobre un tema.",
      "Leer un texto y responder preguntas de comprensión.",
    ],
  },
  "Artes (Música, Plásticas)": {
    materia: "Educación Artística",
    fuentePrincipal: "Lineamientos Curriculares de Educación Artística",
    competencias: [
      "Sensibilidad estética.",
      "Apreciación estética (análisis e interpretación).",
      "Comunicación artística (expresión y producción).",
      "Relacionar el arte con la cultura y la sociedad.",
    ],
    componentesCurriculares: [
      "Producción y Creación Artística",
      "Apreciación y Contextualización Cultural",
      "Artes Visuales (Dibujo, Pintura, Escultura)",
      "Artes Escénicas (Teatro, Danza)",
      "Artes Musicales",
      "Artes Audiovisuales",
    ],
    evidenciasAprendizaje: [
      "Crear una obra plástica (dibujo, pintura, escultura).",
      "Interpretar una pieza musical o escénica.",
      "Escribir una crítica de una obra de arte.",
      "Realizar una instalación artística o performance.",
      "Producir un cortometraje o una animación.",
    ],
  },
  "Educación Física": {
    materia: "Educación Física, Recreación y Deportes",
    fuentePrincipal: "Orientaciones Pedagógicas para la Educación Física, Recreación y Deporte",
    competencias: [
      "Competencia motriz (desarrollo de habilidades y destrezas).",
      "Competencia expresivo-corporal (comunicación a través del cuerpo).",
      "Competencia axiológica corporal (valores y actitudes).",
      "Promoción de la salud y el cuidado corporal.",
    ],
    componentesCurriculares: [
      "Desarrollo motor y habilidades motrices",
      "Expresión corporal y comunicación no verbal",
      "Juego y Deporte (individual y colectivo)",
      "Actividad física para la salud",
      "Ocio, tiempo libre y recreación",
    ],
    evidenciasAprendizaje: [
      "Ejecutar fundamentos técnicos de un deporte.",
      "Crear y presentar una secuencia coreográfica o de gimnasia.",
      "Diseñar y dirigir una sesión de calentamiento.",
      "Participar en un torneo deportivo aplicando reglas y juego limpio.",
      "Elaborar un plan personal de actividad física.",
    ],
  },
};
