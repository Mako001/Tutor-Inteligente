# AprendeTech Colombia - Tu Asistente Pedagógico Inteligente

![AprendeTech Colombia UI](https://placehold.co/800x450.png)
*Caption: Interfaz principal de AprendeTech Colombia, tu centro de mando para la planificación educativa.*

## Descripción Detallada

**AprendeTech Colombia** es una plataforma web inteligente diseñada para revolucionar la forma en que los docentes de Colombia planifican sus clases y crean material educativo. Esta herramienta resuelve un problema común: la dificultad de diseñar actividades de aprendizaje que no solo sean innovadoras y atractivas para los estudiantes, sino que también estén rigurosamente alineadas con los estándares curriculares del Ministerio de Educación Nacional de Colombia (MEN).

Con AprendeTech, los docentes pueden generar planes de clase y actividades detalladas en minutos, **refinarlos interactivamente con la IA** hasta que sean perfectos, y **exportarlos a formatos PDF y DOCX** listos para usar.

La aplicación se centra en tres módulos principales:
1.  **Creador de Planes de Clase:** Un asistente guiado para generar secuencias didácticas completas y estructuradas para un período académico.
2.  **Creador de Actividades:** Una herramienta ágil para diseñar actividades de aprendizaje específicas para una sesión de clase, con diferentes niveles de profundidad.
3.  **Biblioteca Personal:** Un espacio centralizado donde se guarda todo el contenido generado (planes y actividades), se pueden editar, buscar recursos externos con IA y gestionar todo el material de forma organizada.

Este proyecto está dirigido a **docentes de educación básica y media** que buscan:
- **Ahorrar tiempo:** Automatizando la creación de la estructura base para planes y actividades.
- **Asegurar la pertinencia curricular:** Integrando un asistente de IA (Google Gemini) instruido en los lineamientos del MEN.
- **Fomentar la creatividad y la iteración:** Generando ideas y refinándolas con instrucciones en lenguaje natural.
- **Centralizar y exportar el trabajo:** Ofreciendo una biblioteca personal para guardar, revisar, editar y descargar todo el material pedagógico.

## Características Principales

*   **Generador de Planes de Clase y Actividades:** Utiliza formularios guiados para capturar los requerimientos del docente y genera contenido con diferentes niveles de detalle: desde un "Esquema Rápido" hasta un "Proyecto Completo (ABP)".
*   **Refinamiento Interactivo con IA:** ¿No te convence la primera versión? Dale instrucciones adicionales a la IA para que ajuste, acorte, expanda o modifique cualquier plan o actividad generada. ¡El control es tuyo!
*   **Exportación Versátil:** Descarga cualquier plan o actividad generada como un archivo **PDF** profesional listo para imprimir o como un documento de **Word (.docx)** para una edición posterior fuera de línea.
*   **Biblioteca Personal Unificada y Organizada:**
    *   **Almacenamiento Manual:** Guarda tus planes y actividades favoritas con un solo clic.
    *   **Gestión de Contenido:** Revisa, edita el texto y elimina el contenido guardado directamente desde la biblioteca a través de una interfaz de pestañas clara (Planes, Actividades, Recursos).
    *   **Buscador de Recursos con IA:** ¿Necesitas un video o una simulación sobre un tema? Describe lo que buscas y la IA rastreará la web para sugerirte hasta 3 recursos de alta calidad, listos para guardar en tu biblioteca.
*   **Contextualización Colombiana:** El asistente de IA está específicamente instruido para basar sus respuestas en las Orientaciones Curriculares del MEN (Guía 30, Estándares Básicos de Competencias, etc.).
*   **Interfaz Moderna e Intuitiva:** Construida con Next.js y ShadCN/ui para una experiencia de usuario fluida.
*   **Persistencia y Autenticación Anónima:** Utiliza Firebase Firestore para la base de datos y Firebase Authentication para crear sesiones de usuario anónimas y seguras, garantizando que tu contenido esté siempre disponible.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/models/gemini) a través de **Server Actions de Next.js** y el SDK `@google/generative-ai`.
*   **Base de Datos y Autenticación:** [Firebase](https://firebase.google.com/) (Firestore para la base de datos, Authentication para sesiones de usuario anónimas).
*   **Exportación de Documentos:** `html2pdf.js` para PDF y `html-to-docx` para Word.

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión 18.x o superior)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
*   Una cuenta de [Google Cloud / Firebase](https://firebase.google.com/) con un proyecto creado.
*   Una API Key de [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey).

## Instrucciones de Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto localmente en un entorno como Project IDX.

### 1. Clonar el Repositorio

Si aún no lo has hecho, clona el repositorio en tu máquina local o espacio de trabajo.
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

### 2. Instalar Dependencias

Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar todos los paquetes necesarios.
```bash
npm install
```

### 3. Configuración de Variables de Entorno (¡Paso Crucial!)

Para que la aplicación funcione, necesita conectarse a los servicios de Firebase y Gemini. Esto se hace a través de variables de entorno.

*   Crea un archivo llamado `.env.local` en la raíz de tu proyecto. **Este archivo es ignorado por Git y nunca debe ser subido a un repositorio público.**
*   Copia y pega el siguiente contenido en el archivo `.env.local` y reemplaza los valores `TU_...` con tus credenciales reales.

```env
# .env.local

# --- Configuración de Firebase ---
# Obtén estas credenciales desde la configuración de tu proyecto en la Consola de Firebase.
# Ve a Project Settings > General > Your apps > Web app > SDK setup and configuration > Config
NEXT_PUBLIC_FIREBASE_API_KEY="TU_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="TU_PROYECTO_ID.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="TU_PROYECTO_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="TU_PROYECTO_ID.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="TU_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="TU_FIREBASE_APP_ID"
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="TU_FIREBASE_MEASUREMENT_ID" # Opcional

# --- Configuración de la API Key de Google Gemini ---
# Obtén tu API Key desde Google AI Studio: https://aistudio.google.com/app/apikey
# Esta variable es usada por las Server Actions en el backend de Next.js
GOOGLE_GEMINI_API_KEY="TU_API_KEY_DE_GEMINI"

```

### 4. Configurar Base de Datos Firestore

*   En tu proyecto dentro de la [Consola de Firebase](https://console.firebase.google.com/), ve a la sección **Firestore Database**.
*   Crea una base de datos. Para empezar, puedes iniciar en **modo de prueba**, lo que permite leer y escribir sin autenticación.
    **Advertencia:** ¡No uses el modo de prueba en producción! Deberás configurar reglas de seguridad adecuadas para proteger tus datos.

### 5. Ejecutar el Servidor de Desarrollo

Una vez que las dependencias estén instaladas y las variables de entorno configuradas, puedes iniciar la aplicación.
```bash
npm run dev
```
La aplicación debería estar disponible en `http://localhost:9003` (o el puerto configurado en `package.json`).

## Despliegue

Este proyecto está configurado para un despliegue sencillo en **Firebase Hosting**.

1.  **Instala Firebase CLI:** `npm install -g firebase-tools`
2.  **Inicia sesión:** `firebase login`
3.  **Inicializa Firebase en el proyecto:** `firebase init`
    *   Selecciona `Hosting: Configure files...`
    *   Elige `Use an existing project` y selecciona tu proyecto de Firebase.
    *   Cuando pregunte si quieres usar un web framework, responde `Yes` y elige `Next.js`.
    *   Sigue las indicaciones restantes. Esto creará los archivos `firebase.json` y `.firebaserc`.
4.  **Despliega:**
    ```bash
    firebase deploy --only hosting
    ```
Firebase se encargará de construir tu aplicación Next.js, desplegar los archivos estáticos y configurar una Cloud Function para el renderizado del lado del servidor.

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
