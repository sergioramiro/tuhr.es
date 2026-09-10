/**
 * Cálculo de finiquito en España.
 *
 * El finiquito incluye:
 * 1. Parte proporcional de vacaciones no disfrutadas
 * 2. Parte proporcional de pagas extras pendientes
 * 3. Día del mes trabajado (parte proporcional)
 *
 * ⚠️  Verificar normativa vigente antes de producción.
 */

export interface FiniquitoInput {
  /** Salario bruto mensual */
  salarioMensual: number;
  /** Pagas extras al año (0, 1, 2) */
  pagasExtras: number;
  /** Días de vacaciones pendientes */
  vacacionesPendientes: number;
  /** Días trabajados en el mes de salida */
  diasTrabajadosMes: number;
  /** Días totales del mes de salida */
  diasDelMes: number;
  /** Fecha de entrada */
  fechaEntrada: Date;
  /** Fecha de salida */
  fechaSalida: Date;
}

export interface FiniquitoResult {
  /** Parte proporcional de vacaciones */
  vacacionesProporcionales: number;
  /** Parte proporcional de pagas extras */
  pagasExtrasProporcionales: number;
  /** Día del mes trabajado */
  parteProporcionalMes: number;
  /** Total finiquito bruto */
  totalFiniquito: number;
  /** Detalle de días */
  diasVacaciones: number;
  diasPagasExtras: number;
}

export function calcularFiniquito(input: FiniquitoInput): FiniquitoResult {
  const {
    salarioMensual,
    pagasExtras,
    vacacionesPendientes,
    diasTrabajadosMes,
    diasDelMes,
  } = input;

  // Diario = salario mensual / 30 (convenio general)
  const salarioDiario = salarioMensual / 30;

  // Vacaciones proporcionales: días pendientes * salario diario
  const vacacionesProporcionales = salarioDiario * vacacionesPendientes;

  // Pagas extras: parte proporcional de las pendientes
  // Si hay 2 pagas extras y no se han cobrado, se prorratea
  const importePagaExtra = salarioMensual; // cada paga extra = 1 mes
  const pagasPendientes = pagasExtras; // simplificación: todas las pendientes
  const pagasExtrasProporcionales = importePagaExtra * pagasPendientes;

  // Día del mes: parte proporcional de los días trabajados
  const parteProporcionalMes = salarioDiario * diasTrabajadosMes;

  const totalFiniquito =
    vacacionesProporcionales +
    pagasExtrasProporcionales +
    parteProporcionalMes;

  return {
    vacacionesProporcionales: Math.round(vacacionesProporcionales * 100) / 100,
    pagasExtrasProporcionales: Math.round(pagasExtrasProporcionales * 100) / 100,
    parteProporcionalMes: Math.round(parteProporcionalMes * 100) / 100,
    totalFiniquito: Math.round(totalFiniquito * 100) / 100,
    diasVacaciones: vacacionesPendientes,
    diasPagasExtras: pagasPendientes,
  };
}
