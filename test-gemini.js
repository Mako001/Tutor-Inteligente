// test-gemini.js

// Importamos la librería para cargar las variables de entorno de .env.local
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Función principal asíncrona para poder usar await
async function runTest() {
  console.log('--- Iniciando prueba de conexión con Gemini ---');

  // 1. Verificamos que la API Key se esté leyendo
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('¡ERROR CRÍTICO! No se encontró la variable GOOGLE_GEMINI_API_KEY en tu archivo .env.local');
    return;
  }
  console.log('API Key encontrada. Intentando conectar...');

  try {
    // 2. Inicializamos el cliente con la clave
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // 3. Hacemos una pregunta muy simple
    const prompt = "¿Cuál es la capital de Colombia?";
    console.log(`Enviando prompt simple: "${prompt}"`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Mostramos el resultado si todo fue bien
    console.log('--- ¡ÉXITO! ---');
    console.log('La conexión con la API de Gemini funciona correctamente.');
    console.log('Respuesta recibida:', text);
    console.log('---------------------------------');

  } catch (error) {
    // 5. Mostramos el error EXACTO si algo falló
    console.error('--- ¡ERROR! ---');
    console.error('La conexión con la API de Gemini falló. Este es el error detallado:');
    console.error(error);
    console.error('---------------------------------');
  }
}

// Ejecutamos la función
runTest();
