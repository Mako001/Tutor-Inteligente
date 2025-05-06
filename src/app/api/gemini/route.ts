// src/app/api/gemini/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Log para depurar qué API Key se está leyendo en el servidor
console.log("API ROUTE - Intentando leer GOOGLE_GEMINI_API_KEY:", GEMINI_API_KEY ? "Clave Encontrada (longitud: " + GEMINI_API_KEY.length + ")" : "Clave NO Encontrada o Vacía");

if (!GEMINI_API_KEY) {
  console.error("ERROR CRÍTICO en API Route: GOOGLE_GEMINI_API_KEY no está definida en las variables de entorno del servidor.");
}

// Inicializa genAI solo si la clave está presente
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (e) {
    console.error("Error al inicializar GoogleGenerativeAI con la API Key:", e);
    genAI = null; // Asegura que genAI es null si la inicialización falla
  }
}


export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Configuración del servidor incompleta: API Key de Gemini no encontrada." }, { status: 500 });
  }
  if (!genAI) {
    return NextResponse.json({ error: "Error del servidor: No se pudo inicializar el cliente de Gemini. Verifica la API Key." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const userPrompt = body.prompt;

    if (!userPrompt) {
      return NextResponse.json({ error: "El prompt es requerido." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // O el modelo que prefieras
    });

    const generationConfig = {
      temperature: 0.7,
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 8192,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    console.log("API Route: Recibido prompt para Gemini:", userPrompt.substring(0, 100) + "..."); // Loguea solo una parte del prompt

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const responseText = result.response.text();
    // console.log("API Route: Respuesta de Gemini:", responseText); // Descomenta si necesitas depurar la respuesta completa

    return NextResponse.json({ generatedText: responseText });

  } catch (error) {
    console.error("Error en la API Route de Gemini durante la generación:", error);
    let errorMessage = "Error desconocido al procesar la solicitud con Gemini.";
    if (error instanceof Error) {
      // Verifica si el error contiene información específica de la API de Google
      // Using type assertion for 'details' as it's not a standard property of Error
      if (error.message.includes("API_KEY_INVALID") || (error as any).details?.some((d:any) => d.reason === "API_KEY_INVALID")) {
        errorMessage = "API key no válida. Por favor, verifica tu API Key.";
      } else {
        errorMessage = `Error al procesar la solicitud: ${error.message}`;
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
