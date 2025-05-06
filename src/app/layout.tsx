
'use client';

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {useEffect, useState} from 'react';

// Metadata should be defined in a server component or exported separately
// export const metadata: Metadata = {
//   title: 'AprendeTech Colombia',
//   description: 'Asistente para el diseño de actividades de aprendizaje en el aula de informática',
// };

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add suppressHydrationWarning to the body tag to mitigate hydration errors
  // caused by browser extensions injecting attributes during development.
  // Also, apply class names only on the client side to avoid mismatch.
  return (
    <html lang="es">
      <body
        className={isClient ? `${geistSans.variable} ${geistMono.variable} antialiased` : ''}
        suppressHydrationWarning={true} // Add this line
      >
        {children}
      </body>
    </html>
  );
}
