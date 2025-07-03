// test-gemini.js (Versión Vertex AI)
require('dotenv').config({ path: '.env.local' });
const { VertexAI } = require('@google-cloud/vertexai');

async function runTest() {
  console.log('--- Iniciando prueba de conexión con Vertex AI ---');
  try {
    const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const location = 'us-central1';

    if (!project) {
      console.error('¡ERROR! No se encontró la variable NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      return;
    }

    console.log(`Usando Proyecto: ${project}, Ubicación: ${location}`);

    const vertexAI = new VertexAI({ project, location });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });

    const prompt = "¿Cuál es la capital de Colombia?";
    console.log(`Enviando prompt simple: "${prompt}"`);

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('--- ¡ÉXITO! ---');
    console.log('La conexión con Vertex AI funciona correctamente.');
    console.log('Respuesta recibida:', text);

  } catch (error) {
    console.error('--- ¡ERROR! ---');
    console.error('La conexión con Vertex AI falló. Este es el error detallado:');
    console.error(error);
  }
}

runTest();
