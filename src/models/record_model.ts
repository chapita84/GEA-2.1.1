// En tu archivo src/models/record_model.ts

export interface Record {
  id?: string;
  fecha: string;
  monto: number;
  descripcion: string;
  usuario: string;
  rubro: string; // Cambiado de categoria a rubro
  status?: 'pendiente' | 'approved' | 'rejected';
  greenCoins?: number;
  cuit?: string; // ✅ AÑADE ESTA LÍNEA
  clienteUid?: string; // ✅ Se añade el campo para vincular al cliente
  isSustainable?: boolean; // ✅ Se añade el campo de sostenibilidad
}
