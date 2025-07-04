'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, User, FirebaseError } from 'firebase/auth';
import { auth } from './client';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
        const errorMessage = "Configuración de Firebase no válida. Revisa tu archivo .env.local y las variables de entorno.";
        console.error(errorMessage);
        setConfigError(errorMessage);
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error) {
          console.error('Error signing in anonymously:', error);
          if (error instanceof FirebaseError && (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid')) {
              const friendlyError = "La API Key de Firebase no es válida. Por favor, revisa la variable NEXT_PUBLIC_FIREBASE_API_KEY en tu archivo .env.local. Asegúrate de que el archivo exista, que la clave sea correcta y que hayas reiniciado el servidor de desarrollo.";
              setConfigError(friendlyError);
          } else {
              setConfigError("Ocurrió un error inesperado durante la autenticación. Revisa la consola para más detalles.");
          }
        } finally {
            setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen w-full bg-secondary">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  if (configError) {
      return (
          <div className="flex justify-center items-center h-screen w-full bg-secondary p-4">
              <Card className="max-w-lg w-full bg-card border-destructive">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-6 w-6" />
                          Error de Configuración de Firebase
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-foreground">La aplicación no pudo conectarse a los servicios de Firebase. Esto usualmente se debe a una configuración incorrecta de las variables de entorno.</p>
                      <div className="p-4 bg-secondary rounded-md">
                        <p className="font-semibold text-foreground">Mensaje de Error:</p>
                        <p className="font-mono text-sm text-muted-foreground">{configError}</p>
                      </div>
                      <p className="text-foreground">
                          Por favor, consulta las instrucciones en el archivo <code className="bg-secondary p-1 rounded-sm font-semibold">README.md</code> para configurar tu archivo <code className="bg-secondary p-1 rounded-sm font-semibold">.env.local</code> correctamente.
                      </p>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
