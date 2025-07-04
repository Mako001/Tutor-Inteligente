'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
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
        const errorMessage = "Configuración de Firebase no válida. El servicio de autenticación no pudo inicializarse.";
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
        } catch (error: any) {
          console.error('Error durante el inicio de sesión anónimo:', error);
          const errorMessageString = String(error?.message || '');
          // This is a more robust check for the specific API key error.
          if (error?.code === 'auth/invalid-api-key' || error?.code === 'auth/api-key-not-valid' || errorMessageString.includes('API key not valid')) {
              const friendlyError = "La API Key de Firebase no es válida. La aplicación no puede conectarse a los servicios de autenticación.";
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
                      <p className="text-foreground">La aplicación no pudo conectarse a los servicios de Firebase debido a un problema con las credenciales.</p>
                      <div className="p-4 bg-secondary rounded-md">
                        <p className="font-semibold text-foreground">Mensaje de Error:</p>
                        <p className="font-mono text-sm text-muted-foreground">{configError}</p>
                      </div>
                      <p className="font-semibold">Pasos para solucionarlo:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Asegúrate de tener un archivo llamado <code className="bg-secondary p-1 rounded-sm font-semibold">.env.local</code> en la raíz del proyecto.</li>
                          <li>Verifica que la variable <code className="bg-secondary p-1 rounded-sm font-semibold">NEXT_PUBLIC_FIREBASE_API_KEY</code> y las otras variables de Firebase en ese archivo sean las correctas para tu proyecto.</li>
                          <li>
                              Después de guardar los cambios en <code className="bg-secondary p-1 rounded-sm font-semibold">.env.local</code>, **debes reiniciar el servidor de desarrollo** para que los cambios se apliquen.
                          </li>
                      </ol>
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
