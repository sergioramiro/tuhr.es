import { describe, expect, it } from 'vitest';
import {
  calcularIndemnizacion,
  descuentoPreaviso,
  diasIndemnizacion,
  formatoEuros,
  mesesCompletos,
  redondear2,
  topeDiasDeCausa,
} from './indemnizacion';

// Salario base de las pruebas: 36.500 € brutos al año con pagas incluidas
// → 100 € de salario diario y 3.041,67 € al mes. Así los días se leen en euros.
const SALARIO = 36_500;

describe('mesesCompletos', () => {
  it('cuenta años completos como 12 meses', () => {
    expect(mesesCompletos('2016-01-01', '2026-01-01')).toBe(120);
  });

  it('no cuenta el mes que no se ha cumplido entero', () => {
    expect(mesesCompletos('2016-01-15', '2016-02-14')).toBe(0);
    expect(mesesCompletos('2016-01-15', '2016-02-15')).toBe(1);
  });

  it('devuelve 0 si las fechas están invertidas', () => {
    expect(mesesCompletos('2026-01-01', '2016-01-01')).toBe(0);
  });
});

describe('improcedente después de la reforma de 2012', () => {
  it('paga 33 días por año, prorrateando por meses', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '2016-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.dias).toBe(330); // 10 años × 33
    expect(r.importe).toBe(33_000);
    expect(r.topeAplicado).toBe(false);
    expect(r.tramos).toHaveLength(1);
  });

  it('prorratea los meses sueltos', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '2020-01-01',
      fechaFin: '2020-07-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.dias).toBe(16.5); // 6 meses × 2,75
    expect(r.importe).toBe(1_650);
  });

  it('aplica el tope de 24 mensualidades (720 días)', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '2012-02-13',
      fechaFin: '2040-02-13',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.diasSinTope).toBe(924); // 28 años × 33
    expect(r.dias).toBe(720);
    expect(r.topeAplicado).toBe(true);
    expect(r.importe).toBe(72_000);
    expect(r.topeDias).toBe(topeDiasDeCausa('improcedente'));
  });
});

describe('improcedente con contrato anterior al 12/02/2012 (DT 5ª)', () => {
  it('paga 45 días por año si todo el contrato es anterior a la reforma', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '2000-01-01',
      fechaFin: '2004-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.dias).toBe(180); // 4 años × 45
    expect(r.importe).toBe(18_000);
  });

  it('separa el tramo pre-2012 (45 días) del posterior (33 días)', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '2008-01-01',
      fechaFin: '2016-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.tramos).toHaveLength(2);
    const [pre, post] = r.tramos;
    expect(pre.diasPorAnio).toBe(45);
    expect(pre.meses).toBe(49); // 01/2008 → 02/2012, con el mes de febrero sin cumplir
    expect(post.diasPorAnio).toBe(33);
    expect(post.meses).toBe(46);
    // 49 × 3,75 = 183,75 y 46 × 2,75 = 126,50
    expect(r.diasSinTope).toBe(310.25);
    expect(r.importe).toBe(31_025);
    expect(r.topeAplicado).toBe(false);
  });

  it('usa el tramo pre-2012 como tope cuando supera los 720 días', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '1990-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    // pre: 265 meses × 3,75 = 993,75 días → ese resultado pasa a ser el tope
    expect(r.tramos[0].dias).toBe(993.75);
    expect(r.diasSinTope).toBe(1_450.25);
    expect(r.dias).toBe(993.75);
    expect(r.topeAplicado).toBe(true);
    expect(r.importe).toBe(99_375);
  });

  it('nunca rebasa las 42 mensualidades (1.260 días)', () => {
    const r = calcularIndemnizacion({
      causa: 'improcedente',
      fechaInicio: '1980-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.dias).toBe(1_260);
    expect(r.importe).toBe(126_000);
  });
});

describe('otras causas de extinción', () => {
  it('despido objetivo: 20 días por año con tope de 12 mensualidades', () => {
    const corto = calcularIndemnizacion({
      causa: 'objetivo',
      fechaInicio: '2016-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(corto.dias).toBe(200); // 10 años × 20
    expect(corto.importe).toBe(20_000);

    const largo = calcularIndemnizacion({
      causa: 'objetivo',
      fechaInicio: '2000-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(largo.dias).toBe(360); // tope de 12 mensualidades
    expect(largo.topeAplicado).toBe(true);
  });

  it('fin de contrato temporal: 12 días por año', () => {
    const r = calcularIndemnizacion({
      causa: 'temporal',
      fechaInicio: '2024-01-01',
      fechaFin: '2026-01-01',
      salarioBrutoAnual: SALARIO,
    });
    expect(r.dias).toBe(24);
    expect(r.importe).toBe(2_400);
    expect(r.topeDias).toBeNull();
  });

  it('procedente y baja voluntaria no generan indemnización', () => {
    for (const causa of ['procedente', 'baja-voluntaria'] as const) {
      const r = calcularIndemnizacion({
        causa,
        fechaInicio: '2016-01-01',
        fechaFin: '2026-01-01',
        salarioBrutoAnual: SALARIO,
      });
      expect(r.dias).toBe(0);
      expect(r.importe).toBe(0);
      expect(r.tramos).toHaveLength(0);
    }
  });

  it('rechaza un salario de cero o negativo', () => {
    expect(() =>
      calcularIndemnizacion({
        causa: 'improcedente',
        fechaInicio: '2016-01-01',
        fechaFin: '2026-01-01',
        salarioBrutoAnual: 0,
      }),
    ).toThrow();
  });
});

describe('preaviso incumplido', () => {
  it('descuenta solo los días que faltaron por avisar', () => {
    const r = descuentoPreaviso({
      salarioBrutoAnual: SALARIO,
      diasPreavisoRequeridos: 15,
      diasPreavisoDados: 5,
    });
    expect(r.diasNoAvisados).toBe(10);
    expect(r.descuento).toBe(1_000);
  });

  it('no descuenta nada si se avisó de más', () => {
    const r = descuentoPreaviso({
      salarioBrutoAnual: SALARIO,
      diasPreavisoRequeridos: 15,
      diasPreavisoDados: 30,
    });
    expect(r.diasNoAvisados).toBe(0);
    expect(r.descuento).toBe(0);
  });
});

describe('formato', () => {
  it('redondea a dos decimales', () => {
    expect(redondear2(183.755)).toBe(183.76);
    expect(redondear2(310.254)).toBe(310.25);
  });

  it('muestra euros con separador español', () => {
    const texto = formatoEuros(33_000);
    expect(texto).toContain('33.000,00');
    expect(texto).toContain('€');
  });
});

describe('diasIndemnizacion', () => {
  it('devuelve ceros cuando la antigüedad es nula', () => {
    const r = diasIndemnizacion('improcedente', '2026-01-01', '2026-01-01');
    expect(r.dias).toBe(0);
    expect(r.meses).toBe(0);
  });
});
