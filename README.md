
# AprendeTech Colombia - Tu Asistente Pedagógico Inteligente

![AprendeTech Colombia UI](https://placehold.co/800x450.png)
*Caption: Interfaz principal de AprendeTech Colombia, tu centro de mando para la planificación educativa.*

## Reporte Final del Proyecto

Este documento sirve como un informe completo del estado actual del proyecto, sus funcionalidades, su estructura interna y la evolución de su desarrollo.

### 1. Evolución del Desarrollo

El proyecto se desarrolló a través de varias fases iterativas, enfocadas en construir, refinar y optimizar la herramienta:

*   **Fase 1: Creación del Núcleo y Flujos de IA:** Se establecieron las bases de la aplicación con Next.js, Firebase y ShadCN/ui. Se crearon los flujos de IA iniciales para generar planes de clase y actividades, conectando la interfaz con el backend de Google Gemini.
*   **Fase 2: Implementación de Refinamiento y Exportación:** Se introdujo la capacidad de "refinar" el contenido generado por la IA, permitiendo a los docentes iterar sobre las propuestas. Se añadió la funcionalidad de exportación a formatos de documento como DOCX y se exploró la exportación a PDF.
*   **Fase 3: Unificación y Experiencia de Usuario:** Se consolidó la experiencia de usuario creando una "Biblioteca Personal". Esto centralizó todo el contenido guardado (planes, actividades y recursos externos) en una interfaz de pestañas, con capacidades de edición y eliminación. Se estandarizó la interfaz en todas las páginas de creación.
*   **Fase 4: Depuración y Optimización:** Se abordaron y solucionaron errores de compilación de Next.js relacionados con la configuración y los módulos del servidor. Se realizó una depuración exhaustiva de la funcionalidad de exportación y, para simplificar y garantizar la estabilidad, se decidió enfocar la exportación únicamente en DOCX. Finalmente, se limpió el código fuente, eliminando archivos y dependencias innecesarias para dejar una base de código más mantenible y optimizada.

### 2. Funcionalidades Actuales

AprendeTech Colombia es una plataforma web inteligente diseñada para revolucionar la forma en que los docentes de Colombia planifican sus clases. Sus funcionalidades clave son:

*   **Generador de Planes de Clase:** Un asistente guiado para generar secuencias didácticas completas y estructuradas. El docente puede elegir entre diferentes niveles de profundidad: "Esquema Rápido", "Plan Detallado" o "Proyecto Completo (ABP)".
*   **Generador de Actividades:** Una herramienta ágil para diseñar actividades de aprendizaje específicas para una sesión. También permite elegir la profundidad: "Lluvia de Ideas", "Actividad Detallada" o una "Mini-Secuencia" de clase.
*   **Refinamiento Interactivo con IA:** Después de generar cualquier plan o actividad, el docente puede darle instrucciones adicionales en lenguaje natural a la IA para que ajuste, acorte, expanda o modifique el contenido hasta que sea perfecto.
*   **Biblioteca Personal Unificada:**
    *   **Almacenamiento Centralizado:** Guarda planes, actividades y recursos externos en un solo lugar.
    *   **Gestión de Contenido:** Revisa, edita y elimina el contenido guardado directamente desde una interfaz de pestañas clara y organizada.
    *   **Persistencia por Usuario:** La biblioteca está vinculada a una sesión de usuario anónima, por lo que el contenido permanece guardado entre visitas.
*   **Buscador Inteligente de Recursos:** Una herramienta de IA que busca en la web recursos educativos (videos, simulaciones, artículos) sobre un tema específico y los presenta listos para guardar en la biblioteca.
*   **Exportación a Word (.docx):** Cualquier plan o actividad generada se puede descargar como un documento de Word para su fácil edición, impresión o uso sin conexión.
*   **Contextualización Curricular Colombiana:** El asistente de IA está instruido para basar sus sugerencias en los lineamientos del Ministerio de Educación Nacional de Colombia (MEN).
*   **Autenticación Anónima y Persistente:** Utiliza Firebase Authentication para crear sesiones de usuario anónimas y seguras, garantizando que el contenido de cada docente esté protegido y siempre disponible en su navegador.

### 3. Estructura Interna y Arquitectura

La aplicación está construida con un stack tecnológico moderno y una estructura de archivos bien definida.

#### Stack Tecnológico

*   **Framework:** [Next.js](https://nextjs.org/) (usando el App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/models/gemini) a través de Server Actions de Next.js y el SDK `@google/generative-ai`.
*   **Base de Datos y Autenticación:** [Firebase](https://firebase.google.com/) (Firestore para la base de datos, Authentication para sesiones anónimas).
*   **Exportación de Documentos:** `html-to-docx` para la conversión de HTML a Word.

#### Organización de Directorios

*   `src/app/`: Contiene la estructura de rutas de la aplicación. Cada carpeta corresponde a una ruta (ej: `/plans/create`, `/library`). El archivo `page.tsx` dentro de cada carpeta es el componente principal de esa ruta.
*   `src/components/`: Almacena todos los componentes de React reutilizables.
    *   `ui/`: Contiene los componentes base de la librería ShadCN (Button, Card, Input, etc.).
    *   `export-buttons.tsx`: Componente personalizado que encapsula la lógica de exportación.
    *   `hub.tsx`: La barra de navegación principal.
*   `src/ai/`: Centraliza toda la lógica relacionada con la Inteligencia Artificial.
    *   `flows/`: Contiene las Server Actions que se comunican con la API de Gemini para generar y refinar contenido.
    *   `ai-instance.ts`: Configura y exporta la instancia del modelo de Gemini.
*   `src/lib/`: Es el directorio para código de soporte, configuración y utilidades.
    *   `firebase/`: Contiene toda la configuración de Firebase y las **acciones de servidor** para interactuar con la base de datos Firestore (crear, leer, actualizar, borrar documentos).
    *   `data/`: Almacena datos estáticos, como la información curricular de las materias.
    *   `types.ts`: Define las interfaces de TypeScript usadas en todo el proyecto.

## Instrucciones de Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto localmente.

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno (¡Paso Crucial!)
Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Firebase y Google Gemini.

```env
# .env.local

# --- Configuración de Firebase ---
# Obtén estas credenciales desde la configuración de tu proyecto en la Consola de Firebase.
NEXT_PUBLIC_FIREBASE_API_KEY="TU_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="TU_PROYECTO_ID.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="TU_PROYECTO_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="TU_PROYECTO_ID.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="TU_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="TU_FIREBASE_APP_ID"

# --- Configuración de la API Key de Google Gemini ---
# Obtén tu API Key desde Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY="TU_API_KEY_DE_GEMINI"
```
**Importante:** Después de crear o modificar este archivo, debes reiniciar el servidor de desarrollo (`npm run dev`) para que los cambios surtan efecto.

### 4. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación debería estar disponible en `http://localhost:9003` (o el puerto configurado).

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.
