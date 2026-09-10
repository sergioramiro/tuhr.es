/**
 * Cálculo de finiquito en España (Art. 56 ET).
 *
 * El finiquito se paga SIEMPRE en toda extinción contractual.
 * Es distinto de la indemnización.
 *
 * Componentes:
 * 1. Salario pendiente del mes (días trabajados)
 * 2. Vacaciones no disfrutadas
 * 3. Pagas extraordinarias proporcionales (si no están prorrateadas)
 *
 * Salario diario = bruto anual (incluye pagas extras) / 365
 *
 * ⚠️  Verificar normativa vigente antes de producción.
 */

export interface FiniquitoInput {
  /** Salario bruto anual (incluye pagas extras) */
  salarioAnual: number;
  /** ¿Las pagas extras están prorrateadas en nómina? */
  pagasProrrateadas: boolean;
  /** Meses trabajados desde la última paga extra cobrada */
  mesesDesdeUltimaPaga: number;
  /** Días de vacaciones pendientes (no disfrutados) */
  vacacionesPendientes: number;
  /** Días trabajados en el mes de salida */
  diasTrabajadosMes: number;
  /** Días totales del mes de salida */
  diasDelMes: number;
}

export interface FiniquitoResult {
  /** Salario pendiente del mes */
  salarioPendienteMes: number;
  /** Vacaciones no disfrutadas */
  vacacionesProporcionales: number;
  /** Pagas extraordinarias proporcionales */
  pagasExtrasProporcionales: number;
  /** Total finiquito bruto */
  totalFiniquito: number;
  /** Detalle */
  desglose: {
    salarioDiario: number;
    salarioMensual: number;
    diasTrabajados: number;
    vacacionesPendientes: number;
    mesesDesdeUltimaPaga: number;
    pagasProrrateadas: boolean;
  };
}

export function calcularFiniquito(input: FiniquitoInput): FiniquitoResult {
  const {
    salarioAnual,
    pagasProrrateadas,
    mesesDesdeUltimaPaga,
    vacacionesPendientes,
    diasTrabajadosMes,
    diasDelMes,
  } = input;

  // Salario diario (Art. 56 ET: bruto anual / 365)
  const salarioDiario = salarioAnual / 365;

  // Salario mensual (14 pagas)
  const salarioMensual = salarioAnual / 14;

  // 1. Salario pendiente del mes
  const salarioPendienteMes = salarioDiario * diasTrabajadosMes;

  // 2. Vacaciones no disfrutadas
  const vacacionesProporcionales = salarioDiario * vacacionesPendientes;

  // 3. Pagas extraordinarias proporcionales
  let pagasExtrasProporcionales = 0;
  if (!pagasProrrateadas && mesesDesdeUltimaPaga > 0) {
    // Cada paga extra = salario bruto de 1 mes / 14 pagas
    // Se prorratea desde la última paga extra cobrada
    const importePagaExtra = salarioAnual / 14;
    pagasExtrasProporcionales = (importePagaExtra / 12) * mesesDesdeUltimaPaga;
  }

  const totalFiniquito =
    salarioPendienteMes +
    vacacionesProporcionales +
    pagasExtrasProporcionales;

  return {
    salarioPendienteMes: Math.round(salarioPendienteMes * 100) / 100,
    vacacionesProporcionales: Math.round(vacacionesProporcionales * 100) / 100,
    pagasExtrasProporcionales: Math.round(pagasExtrasProporcionales * 100) / 100,
    totalFiniquito: Math.round(totalFiniquito * 100) / 100,
    desglose: {
      salarioDiario: Math.round(salarioDiario * 100) / 100,
      salarioMensual: Math.round(salarioMensual * 100) / 100,
      diasTrabajados: diasTrabajadosMes,
      vacacionesPendientes,
      mesesDesdeUltimaPaga,
      pagasProrrateadas,
    },
  };
}
