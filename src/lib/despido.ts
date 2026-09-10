/**
 * Simulador de indemnización por despido en España.
 *
 * Tipos de despido:
 * - Improcedente: 33 días/año trabajado (tope 24 mensualidades) — contratos post-02/02/2012
 * - Improcedente: 45 días/año trabajado (tope 42 mensualidades) — contratos pre-02/02/2012
 * - Objetivo: 20 días/año trabajado (tope 12 mensualidades)
 * - Procedente: sin indemnización (salvo que el convenio mejore)
 *
 * ⚠️  Verificar normativa vigente antes de producción.
 */

export interface DespidoInput {
  /** Salario bruto mensual (incluye prorrateo de pagas extras) */
  salarioMensual: number;
  /** Años trabajados */
  anosTrabajados: number;
  /** Meses adicionales (0-11) */
  mesesTrabajados: number;
  /** Fecha de inicio del contrato */
  fechaInicio: Date;
  /** Tipo de despido */
  tipoDespido: 'improcedente' | 'objetivo' | 'procedente';
}

export interface DespidoResult {
  /** Tipo de despido seleccionado */
  tipoDespido: string;
  /** Días de indemnización por año */
  diasPorAno: number;
  /** Tope de mensualidades */
  topeMensualidades: number;
  /** Indemnización calculada */
  indemnizacion: number;
  /** Indemnización sin tope */
  indemnizacionSinTope: number;
  /** Si se aplicó el tope */
  topeAplicado: boolean;
  /** Número de mensualidades */
  mensualidadesIndemnizacion: number;
  /** Desglose */
  desglose: {
    diasTotales: number;
    salarioDiario: number;
    anosCompletos: number;
    mesesAdicionales: number;
  };
}

export function calcularIndemnizacion(input: DespidoInput): DespidoResult {
  const {
    salarioMensual,
    anosTrabajados,
    mesesTrabajados,
    fechaInicio,
    tipoDespido,
  } = input;

  // Fecha corte para contratos pre/post 02/02/2012
  const fechaCorte = new Date('2012-02-02');
  const esPre2012 = fechaInicio < fechaCorte;

  let diasPorAno: number;
  let topeMensualidades: number;

  switch (tipoDespido) {
    case 'improcedente':
      diasPorAno = esPre2012 ? 45 : 33;
      topeMensualidades = esPre2012 ? 42 : 24;
      break;
    case 'objetivo':
      diasPorAno = 20;
      topeMensualidades = 12;
      break;
    case 'procedente':
      diasPorAno = 0;
      topeMensualidades = 0;
      break;
  }

  const totalAnos = anosTrabajados + mesesTrabajados / 12;

  // Salario diario (con pagas extras prorrateadas)
  const salarioDiario = salarioMensual / 30;

  // Días totales de indemnización
  const diasTotales = totalAnos * diasPorAno;

  // Indemnización bruta (sin tope)
  const indemnizacionSinTope = salarioDiario * diasTotales;

  // Tope: no puede superar X mensualidades del salario mensual
  const tope = salarioMensual * topeMensualidades;
  const topeAplicado = indemnizacionSinTope > tope && topeMensualidades > 0;
  const indemnizacion = topeAplicado ? tope : indemnizacionSinTope;

  // Mensualidades de indemnización
  const mensualidadesIndemnizacion = salarioMensual > 0
    ? Math.round((indemnizacion / salarioMensual) * 100) / 100
    : 0;

  return {
    tipoDespido,
    diasPorAno,
    topeMensualidades,
    indemnizacion: Math.round(indemnizacion * 100) / 100,
    indemnizacionSinTope: Math.round(indemnizacionSinTope * 100) / 100,
    topeAplicado,
    mensualidadesIndemnizacion,
    desglose: {
      diasTotales: Math.round(diasTotales),
      salarioDiario: Math.round(salarioDiario * 100) / 100,
      anosCompletos: anosTrabajados,
      mesesAdicionales: mesesTrabajados,
    },
  };
}
