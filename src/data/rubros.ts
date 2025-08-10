// Lista de rubros predefinidos para comercios y productos
export const RUBROS_COMERCIOS = [
  'Alimentación',
  'Restaurantes y Gastronomía',
  'Supermercados',
  'Panadería y Pastelería',
  'Carnicería',
  'Verdulería y Frutería',
  'Productos Orgánicos',
  'Ropa y Textiles',
  'Moda Sostenible',
  'Calzado',
  'Accesorios',
  'Belleza y Cuidado Personal',
  'Cosmética Natural',
  'Peluquería y Estética',
  'Salud y Farmacia',
  'Medicina Natural',
  'Fitness y Deportes',
  'Hogar y Decoración',
  'Muebles Sostenibles',
  'Electrodomésticos',
  'Jardín y Plantas',
  'Tecnología',
  'Electrónicos Eco-friendly',
  'Servicios Profesionales',
  'Consultoría Ambiental',
  'Energías Renovables',
  'Transporte Sostenible',
  'Turismo Ecológico',
  'Educación Ambiental',
  'Arte y Cultura',
  'Reciclaje y Gestión de Residuos',
  'Construcción Sostenible',
  'Otros'
] as const;

export const RUBROS_PRODUCTOS = [
  'Alimentos Orgánicos',
  'Bebidas Naturales',
  'Productos de Limpieza Ecológicos',
  'Cosméticos Naturales',
  'Ropa Sostenible',
  'Accesorios Eco-friendly',
  'Productos para el Hogar',
  'Tecnología Verde',
  'Productos de Jardín',
  'Herramientas Sostenibles',
  'Libros y Educación',
  'Juguetes Ecológicos',
  'Productos de Bienestar',
  'Artesanías',
  'Productos Reciclados',
  'Energía Renovable',
  'Otros'
] as const;

// Unión de todos los rubros para usar en transacciones
export const TODOS_LOS_RUBROS = Array.from(
  new Set([...RUBROS_COMERCIOS, ...RUBROS_PRODUCTOS])
).sort();

// Tipos TypeScript
export type RubroComercio = typeof RUBROS_COMERCIOS[number];
export type RubroProducto = typeof RUBROS_PRODUCTOS[number];
export type Rubro = typeof TODOS_LOS_RUBROS[number];
