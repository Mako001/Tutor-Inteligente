// src/components/printable-content.tsx
import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface PrintableContentProps {
  content: string;
}

const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(
  ({ content }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '8.5in', // Ancho de una hoja tamaño carta
          padding: '1in', // Márgenes para la impresión
          background: 'white',
          color: 'black',
          fontSize: '12pt', // A standard font size for documents
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

PrintableContent.displayName = 'PrintableContent';

export default PrintableContent;
