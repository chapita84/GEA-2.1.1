// src/lib/green-coins-calculator.ts

interface CalculationParams {
  monto: number;
  isSustainable: boolean;
}

/**
 * Calcula la cantidad de Monedas Verdes generadas por una transacción.
 * La lógica actual es: si la transacción es sostenible, se otorga 1 moneda
 * por cada 500 pesos gastados, redondeando siempre hacia arriba.
 * @param {CalculationParams} params - Los parámetros para el cálculo.
 * @returns {number} La cantidad de Monedas Verdes calculadas.
 */
export function calculateGreenCoins({ monto, isSustainable }: CalculationParams): number {
  if (!isSustainable || monto <= 0) {
    return 0;
  }

  const ratio = 500; // 1 moneda por cada 500 pesos
  const calculatedCoins = monto / ratio;

  // Redondea siempre hacia arriba al entero más cercano
  return Math.ceil(calculatedCoins);
}
