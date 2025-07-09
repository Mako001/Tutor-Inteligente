// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Hub } from '@/components/hub';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/lib/firebase/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AprendeTech Colombia - Asistente de IA para Docentes',
  description: 'Una herramienta para generar planes de clase, actividades y recursos educativos con la ayuda de la inteligencia artificial.',
  openGraph: {
    title: 'AprendeTech Colombia - Asistente de IA para Docentes',
    description: 'Una herramienta para generar planes de clase, actividades y recursos educativos con la ayuda de la inteligencia artificial.',
    images: [
      {
        url: 'https://placehold.co/1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Página principal de AprendeTech Colombia',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
      </head>
      <body className="antialiased bg-secondary text-foreground" suppressHydrationWarning={true}>
        <AuthProvider>
          <Hub />
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
