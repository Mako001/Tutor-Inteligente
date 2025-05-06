// src/app/api/gemini/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Asegúrate de que tu API Key de Gemini esté en tus variables de entorno
// NO la pongas directamente en el código.
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY; // Debes añadir esta variable a tu .env.local

if (!GEMINI_API_KEY) {
  console.error("ERROR en API Route: GOOGLE_GEMINI_API_KEY no está definida.");
  // En un escenario real, podrías no querer loguear esto tan verbosamente en producción
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ""); // El string vacío es por si no está definida, pero la validación anterior debería capturarlo

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "API Key no configurada en el servidor." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const userPrompt = body.prompt; // El prompt que enviaremos desde el frontend

    if (!userPrompt) {
      return NextResponse.json({ error: "El prompt es requerido." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // O el modelo que prefieras/tengas acceso
    });

    const generationConfig = {
      temperature: 0.7, // Ajusta la creatividad
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 8192, // Ajusta según necesidad
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    console.log("API Route: Recibido prompt para Gemini:", userPrompt);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const responseText = result.response.text();
    console.log("API Route: Respuesta de Gemini:", responseText);

    return NextResponse.json({ generatedText: responseText });

  } catch (error) {
    console.error("Error en la API Route de Gemini:", error);
    // Considera si quieres enviar detalles del error al cliente
    if (error instanceof Error) {
        return NextResponse.json({ error: `Error al procesar la solicitud con Gemini: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: "Error desconocido al procesar la solicitud con Gemini." }, { status: 500 });
  }
}
