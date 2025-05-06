// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // O la fuente Geist si la prefieres y está configurada
import './globals.css'; // Asegúrate que este archivo exista y tenga los estilos base de Tailwind

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Si usas Geist:
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';

export const metadata: Metadata = {
  title: 'Tutor Inteligente - AprendeTech',
  description: 'Asistente IA para diseño de actividades educativas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}> {/* O `${GeistSans.variable} ${GeistMono.variable}` */}
      <body className="antialiased bg-secondary text-foreground" suppressHydrationWarning={true}> {/* Estilos base del body */}
        {children}
      </body>
    </html>
  );
}
