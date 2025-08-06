/**
 * Valida un número de CUIT/CUIL argentino.
 * @param {string} cuit - El CUIT a validar, puede contener guiones o no.
 * @returns {boolean} - Devuelve true si el CUIT es válido, false en caso contrario.
 */
export function validarCuit(cuit: string): boolean {
  if (!cuit || typeof cuit !== 'string') {
    return false;
  }

  // Limpiar el CUIT de guiones y espacios
  const cuitLimpio = cuit.replace(/[-\s]/g, '');

  // Validar longitud
  if (cuitLimpio.length !== 11) {
    return false;
  }

  // Validar que sean solo números
  if (!/^\d+$/.test(cuitLimpio)) {
    return false;
  }

  const [a, b, c, d, e, f, g, h, i, j, k] = cuitLimpio.split('').map(Number);

  const coeficientes = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digitos = [a, b, c, d, e, f, g, h, i, j];

  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[i] * coeficientes[i];
  }

  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : (resto === 1 ? 9 : 11 - resto);

  return digitoVerificador === k;
}
