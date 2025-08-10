
export interface Product {
  id?: string;
  name: string;
  description: string;
  rubro: string;
  coinsRequired: number;
  stock: number;
  imageUrl?: string;
  status: 'active' | 'inactive'; // ✅ Se añade el estado
  validFrom: string;             // ✅ Fecha de inicio de vigencia (formato YYYY-MM-DD)
  validTo: string;               // ✅ Fecha de fin de vigencia (formato YYYY-MM-DD)
}