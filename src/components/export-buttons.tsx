'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { generateDocxFromHtml } from '@/lib/export/actions';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ contentRef, fileName = 'documento' }) => {
  const { toast } = useToast();
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleDownloadDocx = async () => {
    if (!contentRef.current) {
      toast({ variant: 'destructive', title: 'Error', description: 'No hay contenido para exportar a DOCX.' });
      return;
    }
    setIsDownloadingDocx(true);

    const htmlString = contentRef.current.innerHTML;
    
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
      <Button onClick={handleDownloadDocx} disabled={isDownloadingDocx}>
        {isDownloadingDocx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Descargar .docx
      </Button>
    </>
  );
};
