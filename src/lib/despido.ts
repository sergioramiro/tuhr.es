/**
 * Simulador de indemnización por despido en España.
 *
 * Fórmulas oficiales (Art. 56 ET):
 * - Improcedente post-12/02/2012: 33 días/año (tope 24 mensualidades)
 * - Improcedente pre-12/02/2012: 45 días/año (tope 42 mensualidades)
 * - Baremo doble: si el contrato empieza antes del 12/02/2012 y continúa después
 * - Objetivo (ETOP): 20 días/año (tope 12 mensualidades)
 * - Temporal: 12 días/año (sin tope mensual) — RDL 32/2021
 * - Procedente: 0 indemnización
 *
 * Salario diario = bruto anual (incluye pagas extras) / 365
 *
 * ⚠️  Verificar normativa vigente antes de producción.
 */

// Fecha corte para contratos pre/post reforma laboral 2012
const FECHA_CORTE_2012 = new Date('2012-02-12');

export interface DespidoInput {
  /** Salario bruto anual (incluye pagas extras prorrateadas) */
  salarioAnual: number;
  /** Años trabajados completos */
  anosTrabajados: number;
  /** Meses adicionales (0-11) */
  mesesTrabajados: number;
  /** Fecha de inicio del contrato */
  fechaInicio: Date;
  /** Tipo de despido */
  tipoDespido: 'improcedente' | 'objetivo' | 'procedente' | 'temporal';
}

export interface DespidoResult {
  /** Tipo de despido seleccionado */
  tipoDespido: string;
  /** Días de indemnización por año */
  diasPorAno: number;
  /** Tope de mensualidades (0 = sin tope) */
  topeMensualidades: number;
  /** Indemnización calculada */
  indemnizacion: number;
  /** Indemnización sin tope (para comparar) */
  indemnizacionSinTope: number;
  /** Si se aplicó el tope */
  topeAplicado: boolean;
  /** Número de mensualidades equivalentes */
  mensualidadesIndemnizacion: number;
  /** Si se aplica baremo doble */
  baremoDoble: boolean;
  /** Desglose del cálculo */
  desglose: {
    salarioDiario: number;
    salarioMensual: number;
    anosCompletos: number;
    mesesAdicionales: number;
    mesesTotales: number;
    antiguedadMeses: number;
    diasTotales: number;
  };
}

function calcularSalarioDiario(salarioAnual: number): number {
  return salarioAnual / 365;
}

export function calcularIndemnizacion(input: DespidoInput): DespidoResult {
  const {
    salarioAnual,
    anosTrabajados,
    mesesTrabajados,
    fechaInicio,
    tipoDespido,
  } = input;

  const salarioDiario = calcularSalarioDiario(salarioAnual);
  const salarioMensual = salarioAnual / 14; // 14 pagas (incluye extras)

  const totalMeses = anosTrabajados * 12 + mesesTrabajados;
  const antiguedadMeses = totalMeses;

  // Determinar si hay baremo doble
  const esPre2012 = fechaInicio < FECHA_CORTE_2012;
  const hayBaremoDoble = esPre2012 && totalMeses > 0;

  let diasPorAno: number;
  let topeMensualidades: number;
  let indemnizacionBruta: number;

  switch (tipoDespido) {
    case 'improcedente': {
      if (hayBaremoDoble) {
        // Baremo doble: calcular meses pre y post por separado
        const fechaCorteMs = FECHA_CORTE_2012.getTime();
        const fechaFinMs = new Date().getTime();
        const inicioMs = fechaInicio.getTime();

        // Meses en el periodo pre-2012
        const mesesPre = Math.max(0, Math.floor(
          (fechaCorteMs - inicioMs) / (30.44 * 24 * 60 * 60 * 1000)
        ));
        // Meses en el periodo post-2012
        const mesesPost = Math.max(0, totalMeses - mesesPre);

        const indemnPre = salarioDiario * mesesPre * (45 / 12);
        const indemnPost = salarioDiario * mesesPost * (33 / 12);
        indemnizacionBruta = indemnPre + indemnPost;

        // Tope: cada parte con su tope
        const topePre = Math.min(indemnPre, salarioMensual * 42);
        const topePost = Math.min(indemnPost, salarioMensual * 24);
        const indemnConTope = topePre + topePost;

        diasPorAno = 33; // simplificado para display
        topeMensualidades = 24;

        const topeAplicado = indemnizacionBruta > indemnConTope;

        return {
          tipoDespido,
          diasPorAno,
          topeMensualidades,
          indemnizacion: Math.round(indemnConTope * 100) / 100,
          indemnizacionSinTope: Math.round(indemnizacionBruta * 100) / 100,
          topeAplicado,
          mensualidadesIndemnizacion: salarioMensual > 0
            ? Math.round((indemnConTope / salarioMensual) * 100) / 100
            : 0,
          baremoDoble: true,
          desglose: {
            salarioDiario: Math.round(salarioDiario * 100) / 100,
            salarioMensual: Math.round(salarioMensual * 100) / 100,
            anosCompletos: anosTrabajados,
            mesesAdicionales: mesesTrabajados,
            mesesTotales: totalMeses,
            antiguedadMeses: totalMeses,
            diasTotales: Math.round(totalMeses * (33 / 12)),
          },
        };
      }

      diasPorAno = esPre2012 ? 45 : 33;
      topeMensualidades = esPre2012 ? 42 : 24;
      indemnizacionBruta = salarioDiario * totalMeses * (diasPorAno / 12);
      break;
    }
    case 'objetivo':
      diasPorAno = 20;
      topeMensualidades = 12;
      indemnizacionBruta = salarioDiario * totalMeses * (20 / 12);
      break;
    case 'temporal':
      diasPorAno = 12;
      topeMensualidades = 0; // sin tope mensual
      indemnizacionBruta = salarioDiario * totalMeses * (12 / 12);
      break;
    case 'procedente':
      diasPorAno = 0;
      topeMensualidades = 0;
      indemnizacionBruta = 0;
      break;
  }

  // Tope (excepto temporal que no tiene)
  const tope = topeMensualidades > 0 ? salarioMensual * topeMensualidades : Infinity;
  const topeAplicado = indemnizacionBruta > tope;
  const indemnizacion = topeAplicado ? tope : indemnizacionBruta;

  const mensualidadesIndemnizacion = salarioMensual > 0
    ? Math.round((indemnizacion / salarioMensual) * 100) / 100
    : 0;

  return {
    tipoDespido,
    diasPorAno,
    topeMensualidades,
    indemnizacion: Math.round(indemnizacion * 100) / 100,
    indemnizacionSinTope: Math.round(indemnizacionBruta * 100) / 100,
    topeAplicado,
    mensualidadesIndemnizacion,
    baremoDoble: false,
    desglose: {
      salarioDiario: Math.round(salarioDiario * 100) / 100,
      salarioMensual: Math.round(salarioMensual * 100) / 100,
      anosCompletos: anosTrabajados,
      mesesAdicionales: mesesTrabajados,
      mesesTotales: totalMeses,
      antiguedadMeses: totalMeses,
      diasTotales: Math.round(totalMeses * (diasPorAno / 12)),
    },
  };
}
