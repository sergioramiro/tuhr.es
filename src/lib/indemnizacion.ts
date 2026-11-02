/**
 * Motor de cálculo de indemnización por extinción de contrato (tuhr.es).
 *
 * Módulo puro: no toca React, ni el DOM, ni Astro. Solo fechas, meses y días.
 * Base legal:
 * - Despido improcedente: 33 días/año (art. 56.1 ET), 45 días/año por el tiempo
 *   anterior al 12/02/2012 (DT 5ª Ley 3/2012), prorrateando por meses los
 *   periodos inferiores al año.
 * - Tope improcedente: 720 días (24 mensualidades). Si el tramo anterior al
 *   12/02/2012 supera esos 720 días, ese resultado pasa a ser el tope, sin
 *   rebasar nunca 1.260 días (42 mensualidades).
 * - Despido objetivo: 20 días/año, tope 12 mensualidades (art. 53.1.b ET).
 * - Fin de contrato temporal: 12 días/año (art. 49.1.c ET) o lo que fije el convenio.
 * - Procedente y baja voluntaria: sin indemnización.
 * - Preaviso incumplido: se descuenta el salario de los días no avisados.
 *
 * Convenio de cálculo: 1 mensualidad = 30 días de salario. Todos los importes
 * se redondean a dos decimales al final, nunca en los pasos intermedios.
 *
 * ⚠️ Es una estimación orientativa, no un dictamen jurídico.
 */

export type CausaExtincion =
  | 'improcedente'
  | 'objetivo'
  | 'procedente'
  | 'temporal'
  | 'baja-voluntaria';

/** Fecha de corte de la reforma laboral de 2012 (DT 5ª Ley 3/2012). */
export const FECHA_REFORMA_2012 = '2012-02-12';

/** Días de salario que equivalen a una mensualidad. */
const DIAS_POR_MENSUALIDAD = 30;

export interface TramoCalculo {
  desde: string;
  hasta: string;
  meses: number;
  diasPorAnio: number;
  /** Días de salario generados en el tramo (sin redondear). */
  dias: number;
}

export interface ResultadoIndemnizacion {
  causa: CausaExtincion;
  /** Meses completos de servicio. */
  mesesAntiguedad: number;
  /** Días de salario antes de aplicar el tope. */
  diasSinTope: number;
  /** Días de salario después del tope: es lo que se paga. */
  dias: number;
  topeAplicado: boolean;
  /** Tope aplicado, en días de salario (null si la causa no tiene tope). */
  topeDias: number | null;
  salarioDiario: number;
  salarioMensual: number;
  /** Indemnización bruta en euros. */
  importe: number;
  /** Equivalente en mensualidades (importe / salario mensual). */
  mensualidades: number;
  tramos: TramoCalculo[];
}

interface FechaPartida {
  anio: number;
  mes: number;
  dia: number;
}

function partirFecha(fecha: Date | string): FechaPartida {
  if (fecha instanceof Date) {
    return {
      anio: fecha.getUTCFullYear(),
      mes: fecha.getUTCMonth() + 1,
      dia: fecha.getUTCDate(),
    };
  }
  const limpia = fecha.trim().slice(0, 10);
  const [anio, mes, dia] = limpia.split('-').map(Number);
  if (!anio || !mes || !dia) {
    throw new Error(`Fecha no válida: ${fecha}`);
  }
  return { anio, mes, dia };
}

function aIso(anio: number, mes: number, dia: number): string {
  const mm = String(mes).padStart(2, '0');
  const dd = String(dia).padStart(2, '0');
  return `${anio}-${mm}-${dd}`;
}

/**
 * Meses completos entre dos fechas. Un mes cuenta cuando se ha cumplido el
 * mismo día del mes siguiente; si el día de fin es anterior al de inicio, ese
 * mes todavía no se ha devengado.
 */
export function mesesCompletos(desde: Date | string, hasta: Date | string): number {
  const a = partirFecha(desde);
  const b = partirFecha(hasta);
  let meses = (b.anio - a.anio) * 12 + (b.mes - a.mes);
  if (b.dia < a.dia) {
    meses -= 1;
  }
  return Math.max(0, meses);
}

function menorFecha(a: Date | string, b: Date | string): Date | string {
  const fa = partirFecha(a);
  const fb = partirFecha(b);
  const va = fa.anio * 10000 + fa.mes * 100 + fa.dia;
  const vb = fb.anio * 10000 + fb.mes * 100 + fb.dia;
  return va <= vb ? a : b;
}

function mayorFecha(a: Date | string, b: Date | string): Date | string {
  const fa = partirFecha(a);
  const fb = partirFecha(b);
  const va = fa.anio * 10000 + fa.mes * 100 + fa.dia;
  const vb = fb.anio * 10000 + fb.mes * 100 + fb.dia;
  return va >= vb ? a : b;
}

/** Días por año de salario que corresponden a cada causa (improcedente, ver abajo). */
export function diasPorAnioDeCausa(causa: CausaExtincion): number {
  switch (causa) {
    case 'improcedente':
      return 33;
    case 'objetivo':
      return 20;
    case 'temporal':
      return 12;
    case 'procedente':
    case 'baja-voluntaria':
      return 0;
  }
}

/** Tope en días de salario de cada causa, o null si no tiene. */
export function topeDiasDeCausa(causa: CausaExtincion): number | null {
  switch (causa) {
    case 'improcedente':
      return 24 * DIAS_POR_MENSUALIDAD; // 720 días
    case 'objetivo':
      return 12 * DIAS_POR_MENSUALIDAD; // 360 días
    case 'temporal':
    case 'procedente':
    case 'baja-voluntaria':
      return null;
  }
}

/**
 * Días de salario de indemnización por causa y antigüedad, con el baremo doble
 * de la DT 5ª cuando el contrato empieza antes del 12/02/2012.
 */
export function diasIndemnizacion(
  causa: CausaExtincion,
  fechaInicio: Date | string,
  fechaFin: Date | string,
): { dias: number; diasSinTope: number; topeAplicado: boolean; topeDias: number | null; meses: number; tramos: TramoCalculo[] } {
  const meses = mesesCompletos(fechaInicio, fechaFin);
  const diasPorAnio = diasPorAnioDeCausa(causa);

  if (diasPorAnio === 0 || meses === 0) {
    return {
      dias: 0,
      diasSinTope: 0,
      topeAplicado: false,
      topeDias: topeDiasDeCausa(causa),
      meses,
      tramos: [],
    };
  }

  const tramos: TramoCalculo[] = [];
  const inicioPartido = partirFecha(fechaInicio);
  const finPartido = partirFecha(fechaFin);
  const corte = partirFecha(FECHA_REFORMA_2012);
  const clave = (f: FechaPartida) => f.anio * 10000 + f.mes * 100 + f.dia;
  const empiezaAntesDeLaReforma = clave(inicioPartido) < clave(corte);

  if (causa === 'improcedente' && empiezaAntesDeLaReforma) {
    const finTramoPre = menorFecha(fechaFin, FECHA_REFORMA_2012);
    const inicioTramoPost = mayorFecha(fechaInicio, FECHA_REFORMA_2012);
    const mesesPre = mesesCompletos(fechaInicio, finTramoPre);
    const mesesPost = mesesCompletos(inicioTramoPost, fechaFin);

    if (mesesPre > 0) {
      tramos.push({
        desde: aIso(inicioPartido.anio, inicioPartido.mes, inicioPartido.dia),
        hasta: aIso(corte.anio, corte.mes, corte.dia),
        meses: mesesPre,
        diasPorAnio: 45,
        dias: (mesesPre * 45) / 12,
      });
    }
    if (mesesPost > 0) {
      const inicio = partirFecha(inicioTramoPost);
      tramos.push({
        desde: aIso(inicio.anio, inicio.mes, inicio.dia),
        hasta: aIso(finPartido.anio, finPartido.mes, finPartido.dia),
        meses: mesesPost,
        diasPorAnio: 33,
        dias: (mesesPost * 33) / 12,
      });
    }
  } else {
    tramos.push({
      desde: aIso(inicioPartido.anio, inicioPartido.mes, inicioPartido.dia),
      hasta: aIso(finPartido.anio, finPartido.mes, finPartido.dia),
      meses,
      diasPorAnio,
      dias: (meses * diasPorAnio) / 12,
    });
  }

  const diasSinTope = tramos.reduce((total, tramo) => total + tramo.dias, 0);
  let topeDias = topeDiasDeCausa(causa);

  if (causa === 'improcedente' && empiezaAntesDeLaReforma) {
    const diasPre = tramos.find((tramo) => tramo.diasPorAnio === 45)?.dias ?? 0;
    if (diasPre > 24 * DIAS_POR_MENSUALIDAD) {
      // El tramo pre-2012 pasa a ser el tope, sin superar las 42 mensualidades.
      topeDias = Math.min(diasPre, 42 * DIAS_POR_MENSUALIDAD);
    }
  }

  const dias = topeDias === null ? diasSinTope : Math.min(diasSinTope, topeDias);

  return {
    dias,
    diasSinTope,
    topeAplicado: diasSinTope > dias,
    topeDias,
    meses,
    tramos,
  };
}

export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export interface EntradaIndemnizacion {
  causa: CausaExtincion;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  /** Salario bruto anual con las pagas extras incluidas. */
  salarioBrutoAnual: number;
}

/** Indemnización completa: días, importe y desglose por tramos. */
export function calcularIndemnizacion(entrada: EntradaIndemnizacion): ResultadoIndemnizacion {
  const { causa, fechaInicio, fechaFin, salarioBrutoAnual } = entrada;
  if (!(salarioBrutoAnual > 0)) {
    throw new Error('El salario bruto anual debe ser mayor que cero');
  }
  const salarioDiario = salarioBrutoAnual / 365;
  const salarioMensual = salarioBrutoAnual / 12;
  const calculo = diasIndemnizacion(causa, fechaInicio, fechaFin);
  const importe = calculo.dias * salarioDiario;

  return {
    causa,
    mesesAntiguedad: calculo.meses,
    diasSinTope: redondear2(calculo.diasSinTope),
    dias: redondear2(calculo.dias),
    topeAplicado: calculo.topeAplicado,
    topeDias: calculo.topeDias,
    salarioDiario: redondear2(salarioDiario),
    salarioMensual: redondear2(salarioMensual),
    importe: redondear2(importe),
    mensualidades: redondear2(importe / salarioMensual),
    tramos: calculo.tramos.map((tramo) => ({ ...tramo, dias: redondear2(tramo.dias) })),
  };
}

export interface EntradaPreaviso {
  salarioBrutoAnual: number;
  diasPreavisoRequeridos: number;
  diasPreavisoDados: number;
}

/**
 * Descuento por preaviso incumplido (art. 49.1.c ET): se descuenta el salario
 * de los días que faltaron por avisar.
 */
export function descuentoPreaviso(entrada: EntradaPreaviso): {
  diasNoAvisados: number;
  descuento: number;
} {
  const { salarioBrutoAnual, diasPreavisoRequeridos, diasPreavisoDados } = entrada;
  const diasNoAvisados = Math.max(0, diasPreavisoRequeridos - diasPreavisoDados);
  const salarioDiario = salarioBrutoAnual / 365;
  return {
    diasNoAvisados,
    descuento: redondear2(diasNoAvisados * salarioDiario),
  };
}

/** Importe en formato español: 16.500,00 €. */
export function formatoEuros(importe: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(importe);
}
