# AprendeTech Colombia - Tutor Inteligente

Este es un proyecto Next.js diseñado para ayudar a docentes de Tecnología e Informática en Colombia a generar propuestas de actividades de aprendizaje innovadoras y contextualizadas, utilizando un asistente de Inteligencia Artificial (IA).

## Características Principales

*   **Generación de Propuestas de Actividades:** Ingresa los parámetros clave de tu clase (grado, tema, tiempo, competencias, etc.) y la IA te ayudará a estructurar una propuesta de actividad.
*   **Contextualización Colombiana:** El asistente está instruido para considerar los lineamientos del Ministerio de Educación Nacional de Colombia (MEN) y la Guía 30.
*   **Formulario Detallado:** Un formulario exhaustivo permite especificar todos los aspectos relevantes para el diseño de la actividad.
*   **Integración con Firebase:** Las propuestas generadas se pueden almacenar en Firestore para referencia futura.
*   **Interfaz Moderna:** Construida con Next.js, React, TypeScript y estilizada con Tailwind CSS y componentes ShadCN/ui.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend (Base de Datos):** [Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/models/gemini) (a través de API Route o Genkit)
*   **Gestión de Estado (Formulario):** React Hook Form (implícito por el uso de `page.tsx` con `useState` y manejo de formularios, podría ser más explícito si se usa `react-hook-form` directamente)
*   **Renderizado de Markdown:** `react-markdown`

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión 18.x o superior recomendada)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
*   Una cuenta de [Firebase](https://firebase.google.com/) con un proyecto creado.
*   Una API Key de [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey).

## Getting Started

Sigue estos pasos para configurar y ejecutar el proyecto localmente:

**1. Clonar el Repositorio:**

```bash
git clone <URL_DEL_REPOSITORIO_AQUI>
cd AprendeTechColombia
```

**2. Instalar Dependencias:**

```bash
npm install
# o
yarn install
```

**3. Configurar Variables de Entorno:**

*   Crea un archivo llamado `.env.local` en la raíz de tu proyecto.
*   Añade tus credenciales de Firebase y tu API Key de Gemini. **¡No comitees este archivo a Git!**

    ```env
    # .env.local

    # --- Configuración de Firebase ---
    NEXT_PUBLIC_FIREBASE_API_KEY="TU_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="TU_PROYECTO_ID.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="TU_PROYECTO_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="TU_PROYECTO_ID.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="TU_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="TU_FIREBASE_APP_ID"
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="TU_FIREBASE_MEASUREMENT_ID" # Opcional

    # --- Configuración de Google Gemini API Key ---
    GOOGLE_GEMINI_API_KEY="TU_API_KEY_DE_GEMINI"
    ```

    *   Reemplaza los valores `TU_...` con tus credenciales reales.
    *   Puedes obtener tus credenciales de Firebase desde la configuración de tu proyecto en la [Consola de Firebase](https://console.firebase.google.com/).
    *   Puedes obtener tu API Key de Gemini desde [Google AI Studio](https://aistudio.google.com/app/apikey).

**4. Configurar Firebase Firestore:**

*   En tu proyecto de Firebase, ve a la sección Firestore Database.
*   Crea una base de datos Firestore.
*   Inicia en modo de prueba o configura tus reglas de seguridad según tus necesidades. Para desarrollo inicial, las reglas de prueba pueden ser suficientes:
    ```json
    // Reglas de seguridad para Firestore (ejemplo para desarrollo)
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true; // ¡NO USAR EN PRODUCCIÓN!
        }
      }
    }
    ```
    **Advertencia:** Las reglas anteriores permiten el acceso abierto a tu base de datos. Asegúrate de configurar reglas de seguridad adecuadas antes de pasar a producción.

**5. Ejecutar el Servidor de Desarrollo:**

```bash
npm run dev
# o
yarn dev
```

Esto iniciará la aplicación en `http://localhost:9003` (o el puerto especificado en tu `package.json`).

**6. (Si usas Genkit para la IA) Ejecutar el Servidor de Genkit:**

Si la lógica de IA se maneja a través de Genkit flows (ver `src/ai/`):

*   En una terminal separada, ejecuta:
    ```bash
    npm run genkit:dev
    # o para recarga automática con cambios:
    # npm run genkit:watch
    ```
    Esto iniciará el servidor de desarrollo de Genkit, típicamente en `http://localhost:3100`.

## Estructura del Proyecto (Simplificada)

```
AprendeTechColombia/
├── .env.local                # Variables de entorno (¡NO COMITEAR!)
├── .gitignore
├── components.json           # Configuración de ShadCN/ui
├── next.config.ts            # Configuración de Next.js
├── package.json
├── README.md                 # Este archivo
├── tailwind.config.ts        # Configuración de Tailwind CSS
├── tsconfig.json             # Configuración de TypeScript
├── src/
│   ├── app/                  # Directorio de la App Router de Next.js
│   │   ├── api/              # API Routes (ej. para Gemini)
│   │   │   └── gemini/
│   │   │       └── route.ts
│   │   ├── globals.css       # Estilos globales y variables de tema ShadCN
│   │   ├── layout.tsx        # Layout principal de la aplicación
│   │   └── page.tsx          # Página principal de la aplicación
│   ├── components/           # Componentes reutilizables
│   │   └── ui/               # Componentes ShadCN/ui
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── firebase/         # Configuración y cliente de Firebase
│   │   │   ├── client.ts
│   │   │   └── config.ts
│   │   └── utils.ts          # Funciones de utilidad (ej. cn para Tailwind)
│   ├── ai/                   # Lógica relacionada con Genkit/IA (si aplica)
│   │   ├── ai-instance.ts
│   │   ├── dev.ts
│   │   └── flows/            # Flujos de Genkit
│   │       ├── generate-activity-proposal.ts
│   │       └── refine-activity-proposal.ts
│   └── hooks/                # Hooks personalizados de React
└── public/                   # Archivos estáticos
```

## Scripts de `package.json`

*   `npm run dev`: Inicia el servidor de desarrollo de Next.js.
*   `npm run build`: Compila la aplicación para producción.
*   `npm run start`: Inicia un servidor de producción de Next.js (después de `build`).
*   `npm run lint`: Ejecuta ESLint para verificar el código.
*   `npm run typecheck`: Ejecuta el chequeo de tipos de TypeScript.
*   `npm run genkit:dev`: (Si aplica) Inicia el servidor de desarrollo de Genkit.
*   `npm run genkit:watch`: (Si aplica) Inicia el servidor de desarrollo de Genkit con recarga automática.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores o reportar bugs.

## Licencia

Este proyecto es para fines educativos y de demostración. Si planeas usarlo en un entorno de producción, revisa y adapta todas las configuraciones de seguridad.
```