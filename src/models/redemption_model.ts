// En: src/models/redemption_model.ts

export interface Redemption {
  id?: string;
  userId: string; // UID del usuario que canjeó
  productId: string;
  productName: string;
  coinsSpent: number;
  redeemedAt: string; // Fecha en formato ISO
}
