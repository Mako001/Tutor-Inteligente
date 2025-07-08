'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

interface ExportButtonsProps {
  contentRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ contentRef, fileName = 'documento' }) => {
  const handleDownloadPdf = () => {
    if (!contentRef.current) {
      console.error("Content reference is not available for PDF export.");
      return;
    }

    const element = contentRef.current;
    const opt = {
      margin: 1,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleDownloadDocx = async () => {
    if (!contentRef.current) {
      console.error("Content reference is not available for DOCX export.");
      return;
    }

    const htmlString = contentRef.current.innerHTML;
    
    try {
      const fileBuffer = await htmlToDocx(htmlString, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });
      saveAs(fileBuffer as Blob, `${fileName}.docx`);
    } catch (error) {
        console.error("Error generating DOCX file:", error);
    }
  };

  return (
    <>
      <Button onClick={handleDownloadDocx}>
        <Download className="mr-2 h-4 w-4" />
        Descargar .docx
      </Button>
      <Button variant="outline" onClick={handleDownloadPdf}>
        <Download className="mr-2 h-4 w-4" />
        Descargar .pdf
      </Button>
    </>
  );
};
