# AprendeTech Colombia - Tutor Inteligente

![AprendeTech Colombia UI](https://placehold.co/800x450.png)
*Caption: Interfaz principal del formulario de AprendeTech Colombia.*

## Descripción Detallada

**AprendeTech Colombia** es un asistente inteligente diseñado para revolucionar la forma en que los docentes de Tecnología e Informática en Colombia planifican sus clases. Esta herramienta web resuelve un problema común: la dificultad de crear actividades de aprendizaje que no solo sean innovadoras y atractivas para los estudiantes, sino que también estén rigurosamente alineadas con los estándares y directrices curriculares del Ministerio de Educación Nacional de Colombia (MEN), como la Guía 30.

Este proyecto está dirigido a **docentes de educación básica y media** que buscan:
- **Ahorrar tiempo:** Automatizando la creación de la estructura base de una planeación de clase.
- **Asegurar la pertinencia curricular:** Integrando un asistente de IA (Google Gemini) que conoce los lineamientos del MEN.
- **Fomentar la creatividad:** Generando ideas y estructuras de actividades que pueden ser adaptadas y personalizadas.
- **Facilitar el trabajo:** Proporcionando una interfaz intuitiva para capturar todos los detalles necesarios para una planificación de alta calidad, desde competencias y evidencias hasta recursos y adaptaciones contextuales.

## Características Principales

*   **Generación de Propuestas con IA:** Utiliza un formulario detallado para capturar los requerimientos del docente y envía esta información a Google Gemini para generar una propuesta de actividad completa.
*   **Contextualización Colombiana:** El asistente de IA está específicamente instruido para basar sus respuestas en las Orientaciones Curriculares del MEN y la Guía 30.
*   **Interfaz Moderna e Intuitiva:** Construida con Next.js, React, y componentes de ShadCN/ui para una experiencia de usuario fluida.
*   **Persistencia de Datos:** Guarda las propuestas generadas en Firebase Firestore para consulta y referencia futura.
*   **Exportación y Edición:** Permite a los usuarios descargar y refinar las propuestas generadas.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/models/gemini) a través de API Routes de Next.js.
*   **Base de Datos:** [Firebase Firestore](https://firebase.google.com/docs/firestore) para almacenar las propuestas.

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
Asegúrate de que este comando se complete sin errores `ERESOLVE`. Si encuentras alguno, revisa las versiones de los paquetes en `package.json` para resolver conflictos de dependencias.

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
# Esta variable es usada por las API Routes en el backend de Next.js
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
Firebase se encargará de construir tu aplicación Next.js, desplegar los archivos estáticos y configurar una Cloud Function para el renderizado del lado del servidor si es necesario.

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
