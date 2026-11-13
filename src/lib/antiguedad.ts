/**
 * Plus de antigüedad: lógica de cálculo.
 *
 * No existe una regla general en el Estatuto de los Trabajadores. El artículo 25.1
 * remite la promoción económica "a los términos fijados en convenio colectivo o
 * contrato individual", así que aquí no hay porcentajes por defecto: sin las reglas
 * del convenio del usuario el cálculo devuelve `faltan-datos` y ningún importe.
 *
 * Cualquier cifra que salga de aquí es una estimación condicionada a los datos que
 * ha introducido la persona, no un derecho adquirido.
 */

export type TipoIncremento = 'porcentaje' | 'importe';
export type TipoTope = 'ninguno' | 'porcentaje' | 'importe';

export interface ReglasPlus {
  /** Base sobre la que el convenio aplica el plus (normalmente salario base anual). */
  baseAnual: number | null;
  /** Años que hay que completar para subir de tramo (2 = bienio, 4 = cuatrienio...). */
  duracionTramoAnios: number | null;
  tipoIncremento: TipoIncremento;
  /** % por tramo, o € anuales por tramo cuando tipoIncremento === 'importe'. */
  valorIncremento: number | null;
  tipoTope: TipoTope;
  valorTope: number | null;
  /** Si el convenio reconoce la parte proporcional del tramo en curso. */
  prorratearTramoEnCurso: boolean;
  /** Pagas en las que se abona el plus, para el equivalente mensual. */
  pagas: number;
  /** El convenio no reconoce plus de antigüedad. */
  sinPlus?: boolean;
}

export interface ResultadoPlus {
  estado: 'ok' | 'faltan-datos' | 'sin-plus';
  /** Campos que impiden dar una cifra personal. */
  faltan: string[];
  anios: number;
  tramos: number;
  porcentajeAplicado: number;
  importeAnual: number;
  importeMensual: number;
  topeAplicado: boolean;
  /** Años que faltan para el siguiente tramo, o null si no hay tramo superior conocido. */
  siguienteTramoEn: number | null;
}

const EPS = 1e-9;

function esNumeroPositivo(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

export function calcularPlusAntiguedad(
  anios: number,
  reglas: ReglasPlus,
): ResultadoPlus {
  const aniosSeguros = Number.isFinite(anios) && anios > 0 ? anios : 0;
  const pagas = esNumeroPositivo(reglas.pagas) ? reglas.pagas : 12;

  const base: ResultadoPlus = {
    estado: 'faltan-datos',
    faltan: [],
    anios: aniosSeguros,
    tramos: 0,
    porcentajeAplicado: 0,
    importeAnual: 0,
    importeMensual: 0,
    topeAplicado: false,
    siguienteTramoEn: null,
  };

  if (reglas.sinPlus) {
    return { ...base, estado: 'sin-plus', faltan: [] };
  }

  const faltan: string[] = [];
  if (!esNumeroPositivo(reglas.baseAnual)) faltan.push('base');
  if (!esNumeroPositivo(reglas.duracionTramoAnios)) faltan.push('duracionTramo');
  if (!esNumeroPositivo(reglas.valorIncremento)) faltan.push('valorIncremento');

  if (faltan.length > 0) {
    return { ...base, faltan };
  }

  const duracion = reglas.duracionTramoAnios as number;
  const baseAnual = reglas.baseAnual as number;
  const valor = reglas.valorIncremento as number;

  const tramosBrutos = aniosSeguros / duracion;
  const tramos = reglas.prorratearTramoEnCurso
    ? Math.round(tramosBrutos * 1000) / 1000
    : Math.floor(tramosBrutos + EPS);

  let porcentajeAplicado = 0;
  let importeAnual = 0;

  if (reglas.tipoIncremento === 'porcentaje') {
    porcentajeAplicado = tramos * valor;
    if (reglas.tipoTope === 'porcentaje' && esNumeroPositivo(reglas.valorTope)) {
      if (porcentajeAplicado > reglas.valorTope + EPS) {
        porcentajeAplicado = reglas.valorTope;
        base.topeAplicado = true;
      }
    }
    importeAnual = (baseAnual * porcentajeAplicado) / 100;
  } else {
    importeAnual = tramos * valor;
  }

  if (reglas.tipoTope === 'importe' && esNumeroPositivo(reglas.valorTope)) {
    if (importeAnual > reglas.valorTope + EPS) {
      importeAnual = reglas.valorTope;
      base.topeAplicado = true;
    }
  }

  const tramosCompletos = Math.floor(tramosBrutos + EPS);
  const siguienteTramoEn = Math.round((duracion * (tramosCompletos + 1) - aniosSeguros) * 1000) / 1000;

  return {
    estado: 'ok',
    faltan: [],
    anios: aniosSeguros,
    tramos,
    porcentajeAplicado: Math.round(porcentajeAplicado * 1000) / 1000,
    importeAnual: Math.round(importeAnual * 100) / 100,
    importeMensual: Math.round((importeAnual / pagas) * 100) / 100,
    topeAplicado: base.topeAplicado,
    siguienteTramoEn: siguienteTramoEn > 0 ? siguienteTramoEn : null,
  };
}

/**
 * Años de antigüedad entre dos fechas, en años decimales.
 * Cuenta días naturales: es la convención habitual para los tramos de antigüedad.
 */
export function aniosEntreFechas(alta: Date, corte: Date): number {
  const ms = corte.getTime() - alta.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.round((ms / 86400000 / 365.2425) * 1000) / 1000;
}
