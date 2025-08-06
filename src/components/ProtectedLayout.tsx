'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false); // Estado para controlar la verificación

  useEffect(() => {
    // Este código solo se ejecuta en el cliente
    try {
      // 1. Busca una clave llamada 'user' en el almacenamiento local.
      const userString = localStorage.getItem('user');
      
      if (!userString) {
        // 2. Si NO la encuentra, te redirige al login.
        router.push('/login');
      } else {
        // 3. Si SÍ la encuentra, marca la verificación como exitosa y muestra la página.
        setIsVerified(true);
      }
    } catch (error) {
        // En caso de que localStorage no esté disponible (p. ej. en SSR)
        console.error("Could not access localStorage", error);
        router.push('/login');
    }
  }, [router]);

  // Mientras se verifica, no se muestra nada para evitar parpadeos.
  if (!isVerified) {
    return null;
  }

  // Si la verificación fue exitosa, muestra el contenido protegido.
  return <>{children}</>;
}