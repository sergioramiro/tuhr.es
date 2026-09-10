/**
 * Cálculo de nómina bruto a neto en España.
 *
 * Fórmulas basadas en la normativa fiscal y de Seguridad Social vigente.
 * Incluye: retención IRPF (escala general), cuotas SS a cargo del trabajador.
 *
 * ⚠️  Los porcentajes y tramos se actualizan cada año. Verificar con BOE.
 */

// ─── Tramos IRPF escala general 2026 (estimación) ───
// Nota: El gobierno actualiza la escala cada año. Estos valores son una
// aproximación basada en la tendencia reciente. Verificar con BOE antes
// de producción.
const IRPF_BRACKETS = [
  { min: 0,      max: 12450,   rate: 19 },
  { min: 12450,  max: 20200,   rate: 24 },
  { min: 20200,  max: 35200,   rate: 30 },
  { min: 35200,  max: 60000,   rate: 37 },
  { min: 60000,  max: 300000,  rate: 45 },
  { min: 300000, max: Infinity, rate: 47 },
];

// ─── Cuotas Seguridad Social a cargo del trabajador 2026 ───
// Base: contingencias generales (tope general de cotización)
const SS_EMPLEADO = {
  contingenciasComunes: 0.064,    // 6.40%
  desempleoIndefinido: 0.0155,    // 1.55%
  desempleoTemporal: 0.0160,      // 1.60%
  formacionProfesional: 0.0010,   // 0.10%
};

// Tope base de cotización general 2026 (estimación)
const TOPE_BASE_COTIZACION = 4909.50; // €/mes (tope superior 2026 estimado)

// Mínimo personal y familiar base para IRPF (estimación 2026)
const MINIMO_PERSONAL = 5550; // €/año

export interface NominaInput {
  /** Salario bruto anual en € */
  brutoAnual: number;
  /** Número de pagas (12 o 14) */
  pagas: 12 | 14;
  /** Estado civil */
  estadoCivil: 'soltero' | 'casado_1 partner' | 'casado_2 partners' | 'viudo';
  /** Hijos (0, 1, 2, ...) */
  hijos: number;
  /** ¿Discapacidad >= 33%? */
  discapacidad: boolean;
}

export interface NominaResult {
  /** Salario bruto mensual */
  brutoMensual: number;
  /** Retención IRPF mensual */
  retencionIrpf: number;
  /** Cuota SS mensual */
  cuotaSs: number;
  /** Total deducciones mensuales */
  totalDeducciones: number;
  /** Salario neto mensual */
  netoMensual: number;
  /** Salario neto anual */
  netoAnual: number;
  /** Tipo efectivo de retención IRPF (%) */
  tipoEfectivoIrpf: number;
  /** Desglose anual */
  brutoAnual: number;
  retencionIrpfAnual: number;
  cuotaSsAnual: number;
}

function calcularRetencionIrpf(baseImponible: number): number {
  let retencion = 0;
  for (const tramo of IRPF_BRACKETS) {
    if (baseImponible <= tramo.min) break;
    const taxable = Math.min(baseImponible, tramo.max) - tramo.min;
    retencion += taxable * (tramo.rate / 100);
  }
  return retencion;
}

export function calcularNomina(input: NominaInput): NominaResult {
  const { brutoAnual, pagas } = input;

  // Base de cotización (la misma que el bruto mensual, con tope)
  const baseCotizacionMensual = Math.min(
    brutoAnual / pagas,
    TOPE_BASE_COTIZACION
  );

  // Cuotas SS a cargo del trabajador
  const cuotaContingencias = baseCotizacionMensual * SS_EMPLEADO.contingenciasComunes;
  const cuotaDesempleo = baseCotizacionMensual *
    (input.estadoCivil === 'soltero' ? SS_EMPLEADO.desempleoIndefinido : SS_EMPLEADO.desempleoIndefinido);
  const cuotaFormacion = baseCotizacionMensual * SS_EMPLEADO.formacionProfesional;
  const cuotaSsMensual = cuotaContingencias + cuotaDesempleo + cuotaFormacion;

  // Base para IRPF: bruto - cuotas SS
  const baseIrpfMensual = (brutoAnual / pagas) - cuotaSsMensual;

  // Retención IRPF (simplificada: aplicamos la escala sobre la base mensual
  // multiplicada por 12 para obtener la anual, luego dividimos entre pagas)
  const baseIrpfAnual = baseIrpfMensual * pagas;
  const retencionIrpfAnual = calcularRetencionIrpf(baseIrpfAnual);
  const retencionIrpfMensual = retencionIrpfAnual / pagas;

  const brutoMensual = brutoAnual / pagas;
  const totalDeducciones = cuotaSsMensual + retencionIrpfMensual;
  const netoMensual = brutoMensual - totalDeducciones;
  const netoAnual = netoMensual * pagas;

  const tipoEfectivoIrpf = brutoAnual > 0
    ? (retencionIrpfAnual / brutoAnual) * 100
    : 0;

  return {
    brutoMensual: Math.round(brutoMensual * 100) / 100,
    retencionIrpf: Math.round(retencionIrpfMensual * 100) / 100,
    cuotaSs: Math.round(cuotaSsMensual * 100) / 100,
    totalDeducciones: Math.round(totalDeducciones * 100) / 100,
    netoMensual: Math.round(netoMensual * 100) / 100,
    netoAnual: Math.round(netoAnual * 100) / 100,
    tipoEfectivoIrpf: Math.round(tipoEfectivoIrpf * 100) / 100,
    brutoAnual,
    retencionIrpfAnual: Math.round(retencionIrpfAnual * 100) / 100,
    cuotaSsAnual: Math.round(cuotaSsMensual * pagas * 100) / 100,
  };
}
