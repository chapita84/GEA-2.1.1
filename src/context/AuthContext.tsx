'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore'; // ✅ Se importa onSnapshot
import { db } from '@/lib/firebase-client'; // ✅ Se importa la instancia de db

export type CustomUser = {
  uid: string;
  displayName: string | null;
  photoUrl?: string | null;
  email?: string;
  isAdmin?: boolean;
  createdAt?: any;
  greenCoins?: number;
  gamification?: any;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  documento?: string;
  password?: string;
};

type AuthContextType = {
  user: CustomUser | null;
  isLoading: boolean;
  login: (userData: CustomUser) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<CustomUser>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para cargar el usuario inicial desde localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gea-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error al cargar el usuario desde localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ NUEVO EFECTO: Se suscribe a los cambios del usuario en Firestore
  useEffect(() => {
    // Si no hay usuario o la carga inicial no ha terminado, no hacemos nada
    if (!user?.uid || isLoading) return;

    const userDocRef = doc(db, 'users', user.uid);

    // onSnapshot crea un listener en tiempo real
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreUser = { uid: docSnap.id, ...docSnap.data() } as CustomUser;
        
        // Se actualiza el estado y el localStorage con los nuevos datos
        setUser(firestoreUser);
        localStorage.setItem('gea-user', JSON.stringify(firestoreUser));
        console.log("Datos del usuario actualizados en tiempo real:", firestoreUser);
      }
    }, (error) => {
      console.error("Error en el listener de Firestore:", error);
    });

    // Se limpia el listener cuando el componente se desmonta o el usuario cambia
    return () => unsubscribe();
  }, [user?.uid, isLoading]); // Se activa cuando el ID del usuario cambia o la carga termina

  const login = (userData: CustomUser) => {
    localStorage.setItem('gea-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gea-user');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<CustomUser>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('gea-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = { user, isLoading, login, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
