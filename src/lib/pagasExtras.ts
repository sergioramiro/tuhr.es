/**
 * Comparativa de pagas extras: 12 vs 14 pagas.
 *
 * Con 14 pagas, el salario bruto anual se divide en 14 pagos iguales
 * (12 mensuales + 2 extras). Con 12 pagas, el bruto anual se divide
 * en 12 pagos, y las pagas extras se incluyen en cada mensualidad.
 *
 * La diferencia práctica: con 14 pagas, las 2 pagas extras se cobran
 * en junio y diciembre (o la fecha del convenio), mientras que con 12
 * pagas el dinero se distribuye uniformemente.
 *
 * El IRPF se calcula sobre la base anual, por lo que el tipo efectivo
 * es similar. La diferencia principal es el flujo de caja.
 */

export interface PagasExtrasInput {
  /** Salario bruto anual en € */
  brutoAnual: number;
}

export interface PagasExtrasResult {
  /** Opción 12 pagas */
  pagas12: {
    mensualBruto: number;
    totalAnual: number;
    description: string;
  };
  /** Opción 14 pagas */
  pagas14: {
    mensualBruto: number;
    pagaExtraBruto: number;
    totalAnual: number;
    description: string;
  };
  /** Diferencia mensual */
  diferenciaMensual: number;
}

export function compararPagasExtras(input: PagasExtrasInput): PagasExtrasResult {
  const { brutoAnual } = input;

  const mensual12 = brutoAnual / 12;
  const mensual14 = brutoAnual / 14;
  const pagaExtra = brutoAnual / 14; // cada paga extra = 1/14 del anual

  return {
    pagas12: {
      mensualBruto: Math.round(mensual12 * 100) / 100,
      totalAnual: brutoAnual,
      description: `Cobras ${Math.round(mensual12 * 100) / 100}€ brutos cada mes. Las 2 pagas extras están incluidas en cada mensualidad.`,
    },
    pagas14: {
      mensualBruto: Math.round(mensual14 * 100) / 100,
      pagaExtraBruto: Math.round(pagaExtra * 100) / 100,
      totalAnual: brutoAnual,
      description: `Cobras ${Math.round(mensual14 * 100) / 100}€ brutos al mes, más 2 pagas extras de ${Math.round(pagaExtra * 100) / 100}€ (junio y diciembre).`,
    },
    diferenciaMensual: Math.round((mensual12 - mensual14) * 100) / 100,
  };
}
