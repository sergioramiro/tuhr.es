import { useState } from 'react';
import {
  calcularBaja,
  BASE_MINIMA_2026,
  BASE_MAXIMA_2026,
  type Cobertura,
  type Contingencia,
} from '../../lib/bajaMedica';

/**
 * Calculadora de baja médica (incapacidad temporal).
 *
 * Tramos legales: 60 % (días 4-20), 75 % (21-27) y 100 % (desde el 28)
 * sobre la base reguladora diaria, con los 3 primeros días sin abonar salvo
 * continuidad o mejora de convenio. Accidente de trabajo y enfermedad
 * profesional: 100 % desde el día 1.
 */

const eur = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });

const labelTramo = (desde: number, hasta: number, dias: number): string => {
  if (dias === 1) return `Día ${desde}`;
  if (hasta >= desde) return `Días ${desde} a ${hasta}`;
  return `Desde el día ${desde}`;
};

export default function CalculadoraBajaMedica() {
  const [baseMensual, setBaseMensual] = useState<number>(1800);
  const [diasBaja, setDiasBaja] = useState<number>(30);
  const [contingencia, setContingencia] = useState<Contingencia>('comun');
  const [cobertura, setCobertura] = useState<Cobertura>('legal');

  // En contingencias profesionales el importe no depende de la cobertura:
  // se abona el 100 % desde el día 1, así que se ignora el selector.
  const esLaboral = contingencia === 'laboral';

  const result = calcularBaja({
    baseMensual,
    diasBaja,
    contingencia,
    cobertura: esLaboral ? 'continuidad' : cobertura,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Base de cotización */}
          <div>
            <label htmlFor="base-baja" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Base de cotización mensual (€) — la del mes anterior a la baja
            </label>
            <input
              id="base-baja"
              type="number"
              value={baseMensual}
              onChange={(e) => setBaseMensual(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              min={0}
              step={50}
            />
            <input
              type="range"
              min={900}
              max={6000}
              step={50}
              value={Math.min(6000, Math.max(900, baseMensual))}
              onChange={(e) => setBaseMensual(Number(e.target.value))}
              className="w-full mt-space-sm accent-primary"
              aria-label="Base de cotización mensual"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>900€</span>
              <span>6.000€</span>
            </div>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              Míralo en tu nómina o en tu vida laboral. Sin horas extra y sin pluses variables.
              Topes 2026: {eur(BASE_MINIMA_2026)}€/mes a {eur(BASE_MAXIMA_2026)}€/mes.
            </p>
          </div>

          {/* Días de baja */}
          <div>
            <label htmlFor="dias-baja" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Días naturales de baja: {diasBaja}
            </label>
            <input
              id="dias-baja"
              type="range"
              min={1}
              max={365}
              step={1}
              value={diasBaja}
              onChange={(e) => setDiasBaja(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>1 día</span>
              <span>365 días</span>
            </div>
          </div>

          {/* Tipo de baja */}
          <div>
            <label htmlFor="tipo-baja" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Tipo de baja
            </label>
            <select
              id="tipo-baja"
              value={contingencia}
              onChange={(e) => setContingencia(e.target.value as Contingencia)}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="comun">Enfermedad común o accidente no laboral</option>
              <option value="laboral">Accidente de trabajo o enfermedad profesional</option>
            </select>
            <p className="mt-space-sm text-body-sm text-on-surface/50">
              {esLaboral
                ? 'Las contingencias profesionales se abonan al 100 % de la base reguladora desde el día 1.'
                : 'En las contingencias comunes los tres primeros días no se abonan y los porcentajes suben por tramos.'}
            </p>
          </div>

          {/* Cobertura de los 3 primeros días */}
          {!esLaboral && (
            <div>
              <label htmlFor="cobertura-baja" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
                ¿Se abonan los tres primeros días?
              </label>
              <select
                id="cobertura-baja"
                value={cobertura}
                onChange={(e) => setCobertura(e.target.value as Cobertura)}
                className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="legal">No — regla general (art. 173.2 LGSS)</option>
                <option value="continuidad">Sí — continuidad con un proceso anterior de IT</option>
                <option value="convenio">Sí — mejora de convenio (100 % desde el día 1)</option>
              </select>
              <p className="mt-space-sm text-body-sm text-on-surface/50">
                Hay continuidad cuando tu baja continúa un proceso anterior sin que hayas vuelto a
                trabajar. Muchos convenios colectivos mejoran estos tres días o pagan el 100 % desde el día 1.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">
          Cuánto cobras de baja médica
        </h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total bruto estimado de la prestación</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {eur(result.totalBruto)}€
          </p>
          <p className="text-body-sm text-on-surface/60 mt-space-xs">
            Media de {eur(result.mediaDiaria)}€ por día de baja
          </p>
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Base reguladora diaria</span>
            <span className="font-semibold text-on-surface">{eur(result.baseDiaria)}€</span>
          </div>

          {result.tramos.map((tramo) => (
            <div
              key={`${tramo.desde}-${tramo.hasta}-${tramo.porcentaje}`}
              className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button"
            >
              <span className="text-on-surface/60">
                {labelTramo(tramo.desde, tramo.hasta, tramo.dias)} · {tramo.porcentaje} %
                {tramo.dias > 0 ? ` · ${tramo.dias} ${tramo.dias === 1 ? 'día' : 'días'}` : ''}
              </span>
              <span className="font-semibold text-on-surface">
                {tramo.dias > 0 ? `${eur(tramo.importe)}€` : 'no abonado'}
              </span>
            </div>
          ))}

          <div className="flex justify-between text-body-sm p-space-md bg-primary/10 rounded-button border border-primary/20">
            <span className="font-semibold text-on-surface">Total bruto estimado</span>
            <span className="font-bold text-primary">{eur(result.totalBruto)}€</span>
          </div>
        </div>

        {result.diasNoAbonados > 0 && (
          <p className="mt-space-md text-body-sm text-on-surface/60">
            ⚠️ Los <strong>{result.diasNoAbonados} primeros {result.diasNoAbonados === 1 ? 'día' : 'días'}</strong>{' '}
            no se abonan: en contingencias comunes los tres primeros días de IT no generan prestación
            (salvo continuidad o mejora de convenio).
          </p>
        )}

        {result.topeAplicado === 'min' && (
          <p className="mt-space-md text-body-sm text-on-surface/60">
            ⚠️ Se aplica la <strong>base mínima de cotización</strong> de {eur(BASE_MINIMA_2026)}€/mes
            (grupos 4 a 7 en 2026): aunque tu salario sea menor, la prestación se calcula sobre esa base.
          </p>
        )}
        {result.topeAplicado === 'max' && (
          <p className="mt-space-md text-body-sm text-on-surface/60">
            ⚠️ Se aplica el <strong>tope máximo de cotización</strong> de {eur(BASE_MAXIMA_2026)}€/mes
            en 2026: la prestación no se calcula sobre una base superior a esa.
          </p>
        )}
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo con los porcentajes legales del art. 172 LGSS. No incluye posibles
        complementos de convenio ni la retención de IRPF de los días que abona la empresa.
        Consulta tu caso con la Seguridad Social o con un asesor laboral.
      </p>
    </div>
  );
}
