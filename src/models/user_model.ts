// src/models/user_model.ts

// Se define una interfaz para la estructura de gamificación
export interface GamificationData {
  level: number;
  title: string;
  points: number; // Esto será el total de GreenCoins
  nextLevelPoints?: number; // Puntos necesarios para el siguiente nivel
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  isAdmin?: boolean;
  status?: 'active' | 'inactive';
  password?: string;
  createdAt?: string;
  interests?: string[];
  onboardingCompleted?: boolean;
  greenCoins?: number; // El total de monedas del usuario
  gamification?: GamificationData; // ✅ Se usa la nueva interfaz
}
