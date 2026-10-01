/**
 * Cálculo de la prestación de incapacidad temporal (IT) — "baja médica".
 *
 * Base legal: arts. 172 y 173 del texto refundido de la LGSS (RDL 8/2015).
 *
 * Porcentajes sobre la base reguladora diaria (base de cotización del mes
 * anterior sin horas extra ÷ 30):
 * - Enfermedad común o accidente no laboral (contingencias comunes):
 *     · días 1 a 3: no se abonan (art. 173.2 LGSS), salvo continuidad
 *       con un proceso anterior o mejora de convenio
 *     · días 4 a 20: 60 %
 *     · días 21 a 27: 75 %
 *     · a partir del día 28: 100 %
 * - Accidente de trabajo o enfermedad profesional: 100 % desde el día 1
 *   (incluidos los tres primeros días).
 *
 * Topes de la base de cotización 2026 (Orden PJC/297/2026):
 * - mínima general (grupos 4 a 7): 1.424,40 €/mes
 * - máxima: 5.101,20 €/mes (tope máximo de cotización)
 */

export const BASE_MINIMA_2026 = 1424.4;
export const BASE_MAXIMA_2026 = 5101.2;

export type Contingencia = 'comun' | 'laboral';

/**
 * - 'legal': regla general de las contingencias comunes (3 primeros días sin abonar)
 * - 'continuidad': continuación de un proceso anterior de IT → se abona desde el día 1
 * - 'convenio': mejora habitual de convenio colectivo → 100 % desde el día 1
 */
export type Cobertura = 'legal' | 'continuidad' | 'convenio';

export interface BajaInput {
  /** Base de cotización del mes anterior al hecho causante (€/mes) */
  baseMensual: number;
  /** Días naturales de baja */
  diasBaja: number;
  contingencia: Contingencia;
  cobertura: Cobertura;
}

export interface TramoIT {
  /** Primer día del tramo (inclusive) */
  desde: number;
  /** Último día del tramo (inclusive) */
  hasta: number;
  porcentaje: number;
  /** Días del tramo realmente abonados */
  dias: number;
  importe: number;
}

export interface BajaResult {
  /** Base ya sujeta a topes (€/mes) */
  baseAplicada: number;
  /** baseAplicada / 30 */
  baseDiaria: number;
  topeAplicado: null | 'min' | 'max';
  tramos: TramoIT[];
  /** Días de la baja que no generan prestación (0 si todos se abonan) */
  diasNoAbonados: number;
  /** Total bruto de la prestación durante la baja */
  totalBruto: number;
  /** Total bruto / días de baja */
  mediaDiaria: number;
}

const eur = (n: number): number => Math.round(n * 100) / 100;

export function calcularBaja(input: BajaInput): BajaResult {
  const { baseMensual, diasBaja, contingencia, cobertura } = input;
  const dias = Math.max(0, Math.min(365, Math.floor(diasBaja)));

  // Topes: la base reguladora no puede salir de las bases de cotización vigentes
  let baseAplicada = baseMensual;
  let topeAplicado: BajaResult['topeAplicado'] = null;
  if (baseAplicada < BASE_MINIMA_2026) {
    baseAplicada = BASE_MINIMA_2026;
    topeAplicado = 'min';
  } else if (baseAplicada > BASE_MAXIMA_2026) {
    baseAplicada = BASE_MAXIMA_2026;
    topeAplicado = 'max';
  }

  const baseDiaria = baseAplicada / 30;

  // Accidente de trabajo o enfermedad profesional: 100 % desde el día 1
  const esContingenciaProfesional = contingencia === 'laboral';
  const mejoraConvenio = !esContingenciaProfesional && cobertura === 'convenio';
  const primerosDiasAbonados =
    esContingenciaProfesional || cobertura !== 'legal';

  const porcentajeDia = (dia: number): number => {
    if (esContingenciaProfesional) return 100;
    if (mejoraConvenio) return 100;
    if (dia <= 3) return primerosDiasAbonados ? 60 : 0;
    if (dia <= 20) return 60;
    if (dia <= 27) return 75;
    return 100;
  };

  const limites: Array<[number, number]> = esContingenciaProfesional || mejoraConvenio
    ? [[1, Math.max(dias, 1)]]
    : [[1, 3], [4, 20], [21, 27], [28, Math.max(dias, 28)]];

  const tramos: TramoIT[] = [];

  for (const [tramoDesde, tramoHasta] of limites) {
    if (dias === 0) break;
    const desde = Math.max(tramoDesde, 1);
    const hasta = Math.min(tramoHasta, dias);
    if (hasta < desde) continue;

    const porcentaje = porcentajeDia(desde);
    const diasAbonados = porcentaje > 0 ? hasta - desde + 1 : 0;
    const importe = eur((baseDiaria * porcentaje) / 100 * diasAbonados);

    tramos.push({
      desde,
      hasta,
      porcentaje,
      dias: diasAbonados,
      importe,
    });
  }

  const totalBruto = eur(tramos.reduce((acc, t) => acc + t.importe, 0));
  const diasNoAbonados = dias - tramos.reduce((acc, t) => acc + t.dias, 0);

  return {
    baseAplicada: eur(baseAplicada),
    baseDiaria: eur(baseDiaria),
    topeAplicado,
    tramos,
    diasNoAbonados,
    totalBruto,
    mediaDiaria: dias > 0 ? eur(totalBruto / dias) : 0,
  };
}
