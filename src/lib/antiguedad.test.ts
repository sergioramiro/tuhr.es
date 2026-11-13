import { describe, expect, it } from 'vitest';
import { aniosEntreFechas, calcularPlusAntiguedad, type ReglasPlus } from './antiguedad';

/**
 * Convenio HIPOTÉTICO usado en todas las pruebas:
 * 5 % por cuatrienio sobre un salario base de 18.000 €/año, sin tope.
 * No es un convenio real: sirve para fijar los números esperados.
 */
const CONVENIO_HIPOTETICO: ReglasPlus = {
  baseAnual: 18_000,
  duracionTramoAnios: 4,
  tipoIncremento: 'porcentaje',
  valorIncremento: 5,
  tipoTope: 'ninguno',
  valorTope: null,
  prorratearTramoEnCurso: false,
  pagas: 12,
};

describe('tramos completos', () => {
  it('5 años con tramo de 4 años = 1 tramo y 5 %', () => {
    const r = calcularPlusAntiguedad(5, CONVENIO_HIPOTETICO);
    expect(r.estado).toBe('ok');
    expect(r.tramos).toBe(1);
    expect(r.porcentajeAplicado).toBe(5);
    expect(r.importeAnual).toBe(900); // 18.000 × 5 %
    expect(r.importeMensual).toBe(75); // equivalente en 12 pagas
  });

  it('10 años con tramo de 4 años = 2 tramos y 10 %', () => {
    const r = calcularPlusAntiguedad(10, CONVENIO_HIPOTETICO);
    expect(r.tramos).toBe(2);
    expect(r.importeAnual).toBe(1800);
  });

  it('el tramo en curso no suma hasta completarse', () => {
    const r = calcularPlusAntiguedad(7.9, CONVENIO_HIPOTETICO);
    expect(r.tramos).toBe(1);
    expect(r.importeAnual).toBe(900);
  });
});

describe('tramos incompletos', () => {
  it('3,5 años no alcanza el primer cuatrienio: cero y sin inventar cifra', () => {
    const r = calcularPlusAntiguedad(3.5, CONVENIO_HIPOTETICO);
    expect(r.estado).toBe('ok');
    expect(r.tramos).toBe(0);
    expect(r.importeAnual).toBe(0);
    expect(r.importeMensual).toBe(0);
  });

  it('indica cuántos años faltan para el primer tramo', () => {
    const r = calcularPlusAntiguedad(3.5, CONVENIO_HIPOTETICO);
    expect(r.siguienteTramoEn).toBe(0.5);
  });

  it('a los 5 años faltan 3 para el siguiente tramo', () => {
    const r = calcularPlusAntiguedad(5, CONVENIO_HIPOTETICO);
    expect(r.siguienteTramoEn).toBe(3);
  });

  it('con prorrateo, el tramo en curso sí cuenta la fracción', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, prorratearTramoEnCurso: true });
    // 10 / 4 = 2,5 tramos × 5 % = 12,5 %
    expect(r.tramos).toBe(2.5);
    expect(r.porcentajeAplicado).toBe(12.5);
    expect(r.importeAnual).toBe(2250);
  });
});

describe('límite máximo', () => {
  it('recorta el porcentaje al tope del convenio', () => {
    const r = calcularPlusAntiguedad(40, {
      ...CONVENIO_HIPOTETICO,
      tipoTope: 'porcentaje',
      valorTope: 25,
    });
    // 40 / 4 = 10 tramos × 5 % = 50 %, topado al 25 %
    expect(r.porcentajeAplicado).toBe(25);
    expect(r.importeAnual).toBe(4500);
    expect(r.topeAplicado).toBe(true);
  });

  it('recorta el importe cuando el tope es en euros', () => {
    const r = calcularPlusAntiguedad(40, {
      ...CONVENIO_HIPOTETICO,
      tipoTope: 'importe',
      valorTope: 2000,
    });
    expect(r.importeAnual).toBe(2000);
    expect(r.topeAplicado).toBe(true);
  });

  it('no marca tope si el cálculo queda por debajo', () => {
    const r = calcularPlusAntiguedad(5, {
      ...CONVENIO_HIPOTETICO,
      tipoTope: 'porcentaje',
      valorTope: 25,
    });
    expect(r.topeAplicado).toBe(false);
  });
});

describe('ausencia de reglas: nunca una estimación personal por defecto', () => {
  it('sin base salarial no da importe y dice qué falta', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, baseAnual: null });
    expect(r.estado).toBe('faltan-datos');
    expect(r.faltan).toContain('base');
    expect(r.importeAnual).toBe(0);
  });

  it('sin duración de tramo no da importe', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, duracionTramoAnios: null });
    expect(r.estado).toBe('faltan-datos');
    expect(r.faltan).toContain('duracionTramo');
    expect(r.importeAnual).toBe(0);
  });

  it('sin valor de incremento no da importe', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, valorIncremento: null });
    expect(r.estado).toBe('faltan-datos');
    expect(r.faltan).toContain('valorIncremento');
    expect(r.importeAnual).toBe(0);
  });

  it('con varios campos vacíos los enumera todos', () => {
    const r = calcularPlusAntiguedad(10, {
      ...CONVENIO_HIPOTETICO,
      baseAnual: null,
      duracionTramoAnios: null,
      valorIncremento: null,
    });
    expect(r.faltan).toEqual(['base', 'duracionTramo', 'valorIncremento']);
  });

  it('si el convenio no reconoce plus lo dice sin cifra', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, sinPlus: true });
    expect(r.estado).toBe('sin-plus');
    expect(r.importeAnual).toBe(0);
    expect(r.importeMensual).toBe(0);
  });
});

describe('incremento en importe fijo', () => {
  it('suma el importe por tramo, no un porcentaje', () => {
    const r = calcularPlusAntiguedad(7, {
      ...CONVENIO_HIPOTETICO,
      duracionTramoAnios: 3,
      tipoIncremento: 'importe',
      valorIncremento: 300,
    });
    expect(r.tramos).toBe(2); // 7 / 3 = 2,33 → 2 tramos
    expect(r.importeAnual).toBe(600);
    expect(r.porcentajeAplicado).toBe(0);
  });
});

describe('equivalente mensual', () => {
  it('divide entre 12 por defecto', () => {
    const r = calcularPlusAntiguedad(10, CONVENIO_HIPOTETICO);
    expect(r.importeMensual).toBe(150);
  });

  it('respeta las pagas del convenio', () => {
    const r = calcularPlusAntiguedad(10, { ...CONVENIO_HIPOTETICO, pagas: 14 });
    expect(r.importeMensual).toBe(128.57);
  });
});

describe('entradas límite', () => {
  it('años negativos se tratan como cero', () => {
    const r = calcularPlusAntiguedad(-3, CONVENIO_HIPOTETICO);
    expect(r.anios).toBe(0);
    expect(r.importeAnual).toBe(0);
  });

  it('años con decimales muy largos no rompen el conteo de tramos', () => {
    const r = calcularPlusAntiguedad(8, CONVENIO_HIPOTETICO);
    expect(r.tramos).toBe(2);
  });
});

describe('aniosEntreFechas', () => {
  it('cuenta años completos', () => {
    expect(aniosEntreFechas(new Date('2016-01-01'), new Date('2026-01-01'))).toBeCloseTo(10, 1);
  });

  it('devuelve 0 con fechas invertidas', () => {
    expect(aniosEntreFechas(new Date('2026-01-01'), new Date('2016-01-01'))).toBe(0);
  });

  it('cuenta la fracción de año', () => {
    // del 1 de enero al 1 de julio ≈ 0,5 años
    expect(aniosEntreFechas(new Date('2026-01-01'), new Date('2026-07-01'))).toBeCloseTo(0.5, 2);
  });
});
