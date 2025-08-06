// En: src/models/product_model.ts

export interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  coinsRequired: number;
  stock: number; // Cantidad disponible del producto
  imageUrl?: string;
}