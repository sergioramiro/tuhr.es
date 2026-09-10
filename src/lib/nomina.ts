/**
 * Cálculo de nómina bruto a neto en España.
 *
 * Fórmulas basadas en la normativa fiscal y de Seguridad Social 2026.
 * Incluye: retención IRPF (escala general), cuotas SS a cargo del trabajador,
 * MEI, y reducción por obtención de rentas del trabajo.
 *
 * ⚠️  Los porcentajes y tramos se actualizan cada año. Verificar con BOE.
 */

// ─── Tramos IRPF escala general 2026 (Art. 63 Ley 35/2006) ───
// Estos son los tramos estatales. Cada CCAA aplica su tipo autonómico
// sobre la base estatal.
const IRPF_BRACKETS = [
  { min: 0,      max: 12450,   rate: 19 },
  { min: 12450,  max: 20200,   rate: 24 },
  { min: 20200,  max: 35200,   rate: 30 },
  { min: 35200,  max: 60000,   rate: 37 },
  { min: 60000,  max: 300000,  rate: 45 },
  { min: 300000, max: Infinity, rate: 47 },
];

// ─── Reducción por obtención de rentas del trabajo ───
// Se aplica antes de calcular IRPF sobre la base liquidable
function calcularReduccionTrabajo(baseImponible: number): number {
  if (baseImponible <= 14000) return 6498;
  if (baseImponible >= 19750) return 0;
  // Lineal desde 6498 (en 14.000) hasta 0 (en 19.750)
  return Math.max(0, 6498 * (1 - (baseImponible - 14000) / (19750 - 14000)));
}

// ─── Cuotas Seguridad Social a cargo del trabajador 2026 ───
const SS_EMPLEADO = {
  contingenciasComunes: 0.047,      // 4,70%
  desempleoIndefinido: 0.0155,      // 1,55%
  desempleoTemporal: 0.0160,        // 1,60%
  formacionProfesional: 0.0010,     // 0,10%
  mei: 0.0015,                      // 0,15% — Mecanismo Equidad Intergeneracional
};

// Tope base de cotización general 2026
const TOPE_BASE_COTIZACION = 5101.20; // €/mes

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
  /** Desglose cuotas SS */
  desgloseSs: {
    contingenciasComunes: number;
    desempleo: number;
    formacionProfesional: number;
    mei: number;
  };
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

  // Base de cotización (bruto mensual, con tope)
  const brutoMensual = brutoAnual / pagas;
  const baseCotizacionMensual = Math.min(brutoMensual, TOPE_BASE_COTIZACION);

  // Cuotas SS a cargo del trabajador
  const contingenciasComunes = baseCotizacionMensual * SS_EMPLEADO.contingenciasComunes;
  const desempleo = baseCotizacionMensual *
    (input.estadoCivil === 'soltero' ? SS_EMPLEADO.desempleoIndefinido : SS_EMPLEADO.desempleoIndefinido);
  const formacionProfesional = baseCotizacionMensual * SS_EMPLEADO.formacionProfesional;
  const mei = baseCotizacionMensual * SS_EMPLEADO.mei;
  const cuotaSsMensual = contingenciasComunes + desempleo + formacionProfesional + mei;

  // Base para IRPF: bruto - cuotas SS
  const baseIrpfMensual = brutoMensual - cuotaSsMensual;

  // Reducción por obtención de rentas del trabajo
  const baseIrpfAnual = baseIrpfMensual * pagas;
  const reduccion = calcularReduccionTrabajo(baseIrpfAnual);

  // Base liquidable = base imponible - reducción
  const baseLiquidable = Math.max(0, baseIrpfAnual - reduccion);

  // Retención IRPF sobre base liquidable
  const retencionIrpfAnual = calcularRetencionIrpf(baseLiquidable);
  const retencionIrpfMensual = retencionIrpfAnual / pagas;

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
    desgloseSs: {
      contingenciasComunes: Math.round(contingenciasComunes * 100) / 100,
      desempleo: Math.round(desempleo * 100) / 100,
      formacionProfesional: Math.round(formacionProfesional * 100) / 100,
      mei: Math.round(mei * 100) / 100,
    },
  };
}
