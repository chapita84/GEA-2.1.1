// src/models/gamification_model.ts

export interface GamificationLevel {
  id?: string;      // ID del documento en Firestore
  level: number;
  title: string;
  minPoints: number;
  icon: string;
  color: string;    // Se añade el color para consistencia
}
