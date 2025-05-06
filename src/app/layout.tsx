// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="es" className={inter.variable}><head>
        {/* You can have comments and line breaks INSIDE head without issues */}
        {/* For example, for additional scripts or metatags */}
      </head><body className="antialiased bg-secondary text-foreground" suppressHydrationWarning={true}>{children}</body></html>
  );
}
