'use server';

import htmlToDocx from 'html-to-docx';
import { Buffer } from 'buffer';

export async function generateDocxFromHtml(htmlString: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  if (!htmlString) {
    return { success: false, error: 'HTML content is empty.' };
  }

  try {
    const fileBuffer = await htmlToDocx(htmlString, undefined, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // When running in Node.js, html-to-docx returns a Buffer.
    // We convert it to a Base64 string to send it over the network to the client.
    const base64String = (fileBuffer as Buffer).toString('base64');
    
    return { success: true, data: base64String };
  } catch (error: any) {
    console.error("Error generating DOCX file on server:", error);
    return { success: false, error: 'Failed to generate DOCX file on the server.' };
  }
}
