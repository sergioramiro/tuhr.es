import { useState } from 'react';

/**
 * Calculadora de paro (prestación contributiva por desempleo).
 *
 * Datos oficiales SEPE para 2026:
 * - SMI: 1.221,00 €/mes (RD 126/2026) · IPREM: 600,00 €/mes
 * - Cuantía: 70 % de la base reguladora los primeros 180 días, 60 % desde el día 181
 * - Topes: mín. 560 € (sin hijos) / 749 € (1 hijo o más)
 *          máx. 1.225 € (sin hijos) / 1.400 € (1 hijo) / 1.575 € (2 o más)
 * - Cotización SS a cargo del trabajador: 4,85 % sobre la base reguladora
 * - Duración: escala RD 625/2014 (días cotizados en los 6 años anteriores → días de prestación)
 */

const COTIZACION_SS = 0.0485;

const ESCALA_DURACION: Array<[number, number]> = [
  [360, 120],
  [540, 180],
  [720, 240],
  [900, 300],
  [1080, 360],
  [1260, 420],
  [1440, 480],
  [1620, 540],
  [1800, 600],
  [1980, 660],
  [2160, 720],
];

const ESCALA_SUBSIDIO: Array<[number, number]> = [
  [180, 6],
  [150, 5],
  [120, 4],
  [90, 3],
];

function duracionPrestacion(dias: number): number {
  let duracion = 0;
  for (const [umbral, diasPrestacion] of ESCALA_DURACION) {
    if (dias >= umbral) duracion = diasPrestacion;
  }
  return duracion;
}

function duracionSubsidio(dias: number): number {
  for (const [umbral, meses] of ESCALA_SUBSIDIO) {
    if (dias >= umbral) return meses;
  }
  return 0;
}

interface Resultado {
  tipo: 'prestacion' | 'subsidio' | 'ninguno';
  cuantia70: number;
  cuantia60: number;
  meses70: number;
  meses60: number;
  meses: number;
  diasDuracion: number;
  totalBruto: number;
  cuotaSS: number;
  irpf: number;
  netoMensual: number;
  tope: number;
  minimo: number;
  topeAplicado: null | 'max' | 'min';
  subsidioMensual: number;
  subsidioMeses: number;
}

function calcularParo(
  baseReguladora: number,
  diasCotizados: number,
  hijos: number,
  irpfPct: number
): Resultado {
  const tope = hijos === 0 ? 1225 : hijos === 1 ? 1400 : 1575;
  const minimo = hijos === 0 ? 560 : 749;

  const aplicarTopes = (importe: number) => {
    if (importe > tope) return { valor: tope, tope: 'max' as const };
    if (importe < minimo) return { valor: minimo, tope: 'min' as const };
    return { valor: importe, tope: null };
  };

  const base: Resultado = {
    tipo: 'ninguno',
    cuantia70: 0,
    cuantia60: 0,
    meses70: 0,
    meses60: 0,
    meses: 0,
    diasDuracion: 0,
    totalBruto: 0,
    cuotaSS: 0,
    irpf: 0,
    netoMensual: 0,
    tope,
    minimo,
    topeAplicado: null,
    subsidioMensual: 0,
    subsidioMeses: 0,
  };

  // Menos de 90 días cotizados: ni prestación ni subsidio
  if (diasCotizados < 90) return base;

  // Entre 90 y 359 días: subsidio por cotizaciones insuficientes
  if (diasCotizados < 360) {
    const subsidioMeses = duracionSubsidio(diasCotizados);
    // 95 % del IPREM (600 €) durante los primeros 180 días de subsidio
    return {
      ...base,
      tipo: 'subsidio',
      subsidioMensual: 600 * 0.95,
      subsidioMeses,
      totalBruto: 600 * 0.95 * subsidioMeses,
      irpf: 0,
      netoMensual: 600 * 0.95,
    };
  }

  const r70 = aplicarTopes(baseReguladora * 0.7);
  const r60 = aplicarTopes(baseReguladora * 0.6);
  const diasDuracion = duracionPrestacion(diasCotizados);
  const meses = diasDuracion / 30;
  const meses70 = Math.min(6, meses);
  const meses60 = Math.max(0, meses - 6);

  const cuotaSS = baseReguladora * COTIZACION_SS;
  const irpf = r70.valor * (irpfPct / 100);

  return {
    ...base,
    tipo: 'prestacion',
    cuantia70: r70.valor,
    cuantia60: r60.valor,
    meses70,
    meses60,
    meses,
    diasDuracion,
    totalBruto: r70.valor * meses70 + r60.valor * meses60,
    cuotaSS,
    irpf,
    netoMensual: r70.valor - cuotaSS - irpf,
    topeAplicado: r70.tope ?? r60.tope,
  };
}

const eur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });

export default function CalculadoraParo() {
  const [baseReguladora, setBaseReguladora] = useState<number>(1800);
  const [diasCotizados, setDiasCotizados] = useState<number>(1080);
  const [hijos, setHijos] = useState<number>(0);
  const [irpfPct, setIrpfPct] = useState<number>(2);

  const result = calcularParo(baseReguladora, diasCotizados, hijos, irpfPct);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Base reguladora */}
          <div>
            <label htmlFor="br-paro" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Base reguladora mensual (€)
            </label>
            <input
              id="br-paro"
              type="number"
              value={baseReguladora}
              onChange={(e) => setBaseReguladora(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              min={0}
              step={50}
            />
            <input
              type="range"
              min={500}
              max={5000}
              step={50}
              value={Math.min(5000, Math.max(500, baseReguladora))}
              onChange={(e) => setBaseReguladora(Number(e.target.value))}
              className="w-full mt-space-sm accent-primary"
              aria-label="Base reguladora mensual"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>500€</span>
              <span>5.000€</span>
            </div>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              Es la media de tus bases de cotización por desempleo de los últimos 180 días cotizados
              (sin horas extra). Como orientación, suele parecerse a tu bruto mensual con pagas extras prorrateadas.
            </p>
          </div>

          {/* Días cotizados */}
          <div>
            <label htmlFor="dias-paro" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Días cotizados por desempleo en los últimos 6 años: {diasCotizados.toLocaleString('es-ES', { useGrouping: true })}
            </label>
            <input
              id="dias-paro"
              type="range"
              min={0}
              max={2400}
              step={30}
              value={diasCotizados}
              onChange={(e) => setDiasCotizados(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>0 días</span>
              <span>2.400 días</span>
            </div>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              Míralo en tu informe de vida laboral (solo los periodos con cotización por desempleo).
              Necesitas como mínimo 360 días para cobrar el paro.
            </p>
          </div>

          {/* Hijos a cargo */}
          <div>
            <label htmlFor="hijos-paro" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Hijos o hijas a cargo
            </label>
            <select
              id="hijos-paro"
              value={hijos}
              onChange={(e) => setHijos(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value={0}>Sin hijos a cargo</option>
              <option value={1}>1 hijo o hija a cargo</option>
              <option value={2}>2 o más hijos o hijas a cargo</option>
            </select>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              Cuentan los menores de 26 años (o mayores con discapacidad) que conviven contigo, dependen
              económicamente de ti y no superan el SMI en rentas. Sube el tope máximo de la prestación.
            </p>
          </div>

          {/* IRPF */}
          <div>
            <label htmlFor="irpf-paro" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Retención de IRPF estimada (%)
            </label>
            <select
              id="irpf-paro"
              value={irpfPct}
              onChange={(e) => setIrpfPct(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value={2}>2 % — retención mínima habitual</option>
              <option value={8}>8 %</option>
              <option value={12}>12 %</option>
              <option value={15}>15 %</option>
            </select>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              El SEPE retiene como mínimo un 2 % y puede subir la retención si se lo pides. Ajusta el
              porcentaje si ya sabes cuánto te retienen normalmente.
            </p>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        {result.tipo === 'ninguno' && (
          <div>
            <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-md">
              Con menos de 90 días no hay prestación
            </h3>
            <p className="text-body-md text-on-surface/70">
              Ni el paro ni el subsidio por cotizaciones insuficientes. En ese caso puede haber otras
              ayudas (ayudas autonómicas, Renta garantizada o, en su caso, ingreso mínimo vital).
            </p>
          </div>
        )}

        {result.tipo === 'subsidio' && (
          <div>
            <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-md">
              Subsidio por cotizaciones insuficientes
            </h3>
            <p className="text-body-sm text-on-surface/60 mb-space-lg">
              No llegas a los 360 días del paro, pero con al menos 90 días cotizados puedes tener
              derecho al subsidio. Su cuantía es fija: el 95 % del IPREM (600 €) durante los primeros
              180 días, y depende de tus rentas, no de tu salario.
            </p>
            <div className="text-center mb-space-lg">
              <p className="text-body-sm text-on-surface/60">Cuantía mensual estimada</p>
              <p className="font-headline text-headline-xl font-extrabold text-primary">
                {eur(result.subsidioMensual)}€
              </p>
            </div>
            <div className="space-y-space-sm">
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Duración máxima</span>
                <span className="font-semibold text-on-surface">{result.subsidioMeses} meses</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Total estimado</span>
                <span className="font-semibold text-on-surface">{eur(result.totalBruto)}€</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Días cotizados</span>
                <span className="font-semibold text-on-surface">{diasCotizados.toLocaleString('es-ES', { useGrouping: true })} días</span>
              </div>
            </div>
            <p className="mt-space-lg text-body-sm text-on-surface/60">
              Con responsabilidades familiares la duración puede llegar a 21 meses (a partir de 180 días
              cotizados). Además se exige carencia de rentas: no superar el 75 % del SMI (915,75 €/mes).
            </p>
          </div>
        )}

        {result.tipo === 'prestacion' && (
          <div>
            <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">
              Tu prestación por desempleo
            </h3>

            <div className="text-center mb-space-xl">
              <p className="text-body-sm text-on-surface/60">Bruto mensual — primeros 6 meses (70 %)</p>
              <p className="font-headline text-headline-xl font-extrabold text-primary">
                {eur(result.cuantia70)}€
              </p>
              <p className="text-body-sm text-on-surface/60 mt-space-xs">
                Desde el mes 7 (60 %): {eur(result.cuantia60)}€/mes
              </p>
            </div>

            <div className="space-y-space-sm">
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Base reguladora</span>
                <span className="font-semibold text-on-surface">{eur(baseReguladora)}€/mes</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Duración</span>
                <span className="font-semibold text-on-surface">
                  {result.diasDuracion} días ({result.meses} meses)
                </span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Total bruto estimado</span>
                <span className="font-semibold text-on-surface">{eur(result.totalBruto)}€</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">− Seguridad Social (4,85 % sobre la base)</span>
                <span className="font-semibold text-on-surface">−{eur(result.cuotaSS)}€</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">− IRPF (estimado {irpfPct} %)</span>
                <span className="font-semibold text-on-surface">−{eur(result.irpf)}€</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-md bg-primary/10 rounded-button border border-primary/20">
                <span className="font-semibold text-on-surface">Neto estimado primer mes</span>
                <span className="font-bold text-primary">{eur(result.netoMensual)}€/mes</span>
              </div>
            </div>

            {result.topeAplicado === 'max' && (
              <p className="mt-space-md text-body-sm text-on-surface/60">
                ⚠️ Se aplica el <strong>tope máximo</strong> de {eur(result.tope)}€/mes por tu situación
                familiar: aunque tu base reguladora dé más, el SEPE no puede pagarte por encima.
              </p>
            )}
            {result.topeAplicado === 'min' && (
              <p className="mt-space-md text-body-sm text-on-surface/60">
                ⚠️ Se aplica el <strong>tope mínimo</strong> de {eur(result.minimo)}€/mes: el SEPE no
                puede pagarte por debajo de esa cuantía.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo con las cuantías oficiales del SEPE para 2026. El importe final lo
        fija el SEPE según tu vida laboral y tu situación familiar. Consulta tu caso con el SEPE o con
        un asesor laboral.
      </p>
    </div>
  );
}
