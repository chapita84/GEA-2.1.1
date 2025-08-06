export interface Client {
  id: string; // igual al uid del usuario
  usuarioUid: string; // referencia al usuario
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  documento: string;
  // otros atributos...
}