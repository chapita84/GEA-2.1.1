// src/lib/gamification.ts

export interface GamificationLevel {
  level: number;
  title: string;
  minPoints: number;
  icon: string; // ✅ El ícono ahora es un string (el nombre del ícono)
  color: string; // ✅ Se añade la propiedad del color
}

// ✅ La lista de niveles ahora usa los nombres de los íconos como strings
export const gamificationLevels: GamificationLevel[] = [
  { level: 1, title: 'Explorador Ecológico', minPoints: 0, icon: 'Sprout', color: 'text-green-500' },
  { level: 2, title: 'Guardián Verde', minPoints: 500, icon: 'Shield', color: 'text-blue-500' },
  { level: 3, title: 'Activista Sostenible', minPoints: 1500, icon: 'HelpingHand', color: 'text-rose-500' },
  { level: 4, title: 'Héroe del Reciclaje', minPoints: 3000, icon: 'Recycle', color: 'text-teal-500' },
  { level: 5, title: 'Eco-Guerrero', minPoints: 5000, icon: 'Zap', color: 'text-amber-500' },
  { level: 6, title: 'Maestro Compostador', minPoints: 7500, icon: 'Leaf', color: 'text-lime-600' },
  { level: 7, title: 'Embajador del Planeta', minPoints: 10000, icon: 'Globe', color: 'text-indigo-500' },
  { level: 8, title: 'Visionario Verde', minPoints: 15000, icon: 'Sun', color: 'text-orange-500' },
  { level: 9, title: 'Campeón de la Sostenibilidad', minPoints: 20000, icon: 'Gem', color: 'text-purple-500' },
  { level: 10, title: 'Leyenda de GEA', minPoints: 30000, icon: 'Crown', color: 'text-red-600' },
];

/**
 * Calcula el nivel y el título de un usuario basado en sus GreenCoins.
 * @param {number} greenCoins - El total de GreenCoins del usuario.
 * @returns El nivel de gamificación correspondiente.
 */
export function calculateLevel(greenCoins: number): GamificationLevel {
  return [...gamificationLevels].reverse().find(level => greenCoins >= level.minPoints) || gamificationLevels[0];
}
