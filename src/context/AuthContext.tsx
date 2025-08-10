'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase-client';
import { User } from '@/models/user_model';
import { Client } from '@/models/client_model';

// Se crea un tipo unificado que combina User y Client
export type CustomUser = User & Partial<Client>;

type AuthContextType = {
  user: CustomUser | null;
  isLoading: boolean;
  logout: () => void;
  updateUser: (updatedData: Partial<CustomUser>) => void; // Se re-añade para actualizaciones locales
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      console.log('AuthStateChanged - Firebase User:', firebaseUser?.uid, firebaseUser?.email);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const clientDocRef = doc(db, 'clients', firebaseUser.uid);

        try {
          const [userDocSnap, clientDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(clientDocRef),
          ]);

          console.log('User doc exists:', userDocSnap.exists());
          console.log('Client doc exists:', clientDocSnap.exists());

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            const clientData = clientDocSnap.exists() ? clientDocSnap.data() as Client : {};
            
            const combinedUser = {
              ...userData,
              ...clientData,
              uid: firebaseUser.uid,
              email: firebaseUser.email || userData.email,
            };
            
            console.log('Setting user data:', combinedUser);
            setUser(combinedUser);
          } else {
            console.error(`No se encontró el documento de usuario para el UID: ${firebaseUser.uid}`);
            console.log('Attempting to create user document...');
            
            // Intentar crear el documento de usuario si no existe
            const newUserData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || firebaseUser.email || undefined,
              photoUrl: firebaseUser.photoURL || 'https://via.placeholder.com/150',
              createdAt: new Date().toISOString(),
              isAdmin: false,
              greenCoins: 0,
              gamification: { level: 1, points: 0, title: 'Explorador Ecológico' },
            };
            
            await setDoc(userDocRef, newUserData);
            console.log('User document created successfully');
            setUser(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);
  
  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = (updatedData: Partial<CustomUser>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      return newUser;
    });
  };

  const value = { user, isLoading, logout, updateUser };

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
