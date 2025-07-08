'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { generateDocxFromHtml } from '@/lib/export/actions';
import { useToast } from '@/hooks/use-toast';
import PrintableContent from './printable-content';

interface ExportButtonsProps {
  content: string;
  fileName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ content, fileName = 'documento' }) => {
  const { toast } = useToast();
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    if (!printableRef.current || !content) {
      toast({ variant: 'destructive', title: 'Error', description: 'No hay contenido para exportar a PDF.' });
      return;
    }
    setIsDownloadingPdf(true);

    const element = printableRef.current;

    const opt = {
      margin:       1,
      filename:     `${fileName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save()
      .catch(err => {
        console.error("Error al exportar a PDF:", err);
        toast({ variant: 'destructive', title: 'Error al exportar PDF', description: 'No se pudo generar el archivo PDF.' });
      })
      .finally(() => {
        setIsDownloadingPdf(false);
      });
  };

  const handleDownloadDocx = async () => {
    if (!printableRef.current || !content) {
      toast({ variant: 'destructive', title: 'Error', description: 'No hay contenido para exportar a DOCX.' });
      return;
    }
    setIsDownloadingDocx(true);

    const htmlString = printableRef.current.innerHTML;
    
    try {
      const result = await generateDocxFromHtml(htmlString);

      if (result.success && result.data) {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        saveAs(blob, `${fileName}.docx`);
      } else {
        console.error("Error generating DOCX file:", result.error);
        toast({ variant: "destructive", title: "Error al exportar DOCX", description: result.error || 'No se pudo generar el archivo.' });
      }
    } catch (error) {
        console.error("Error calling server action for DOCX export:", error);
        toast({ variant: "destructive", title: "Error de conexión", description: 'No se pudo contactar al servidor para generar el DOCX.' });
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <>
      <PrintableContent ref={printableRef} content={content} />

      <Button onClick={handleDownloadDocx} disabled={isDownloadingDocx || isDownloadingPdf || !content}>
        {isDownloadingDocx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Descargar .docx
      </Button>
      <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloadingDocx || isDownloadingPdf || !content}>
        {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Descargar .pdf
      </Button>
    </>
  );
};
