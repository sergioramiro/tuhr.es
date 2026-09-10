import { useState } from 'react';
import { calcularIndemnizacion, type DespidoInput } from '../../lib/despido';

export default function SimuladorDespido() {
  const [salarioAnual, setSalarioAnual] = useState<number>(30000);
  const [anosTrabajados, setAnosTrabajados] = useState<number>(3);
  const [mesesTrabajados, setMesesTrabajados] = useState<number>(0);
  const [tipoDespido, setTipoDespido] = useState<DespidoInput['tipoDespido']>('improcedente');

  const input: DespidoInput = {
    salarioAnual,
    anosTrabajados,
    mesesTrabajados,
    fechaInicio: new Date('2020-01-01'),
    tipoDespido,
  };
  const result = calcularIndemnizacion(input);

  const tipoDespidoLabels: Record<string, string> = {
    improcedente: 'Despido improcedente',
    objetivo: 'Despido objetivo (ETOP)',
    procedente: 'Despido procedente',
    temporal: 'Fin de contrato temporal',
  };

  const tipoDespidoDescriptions: Record<string, string> = {
    improcedente: 'El empresario no acredita causa. 33 días/año, tope 24 mensualidades.',
    objetivo: 'Causas económicas, técnicas, organizativas o de producción. 20 días/año, tope 12 mensualidades.',
    procedente: 'Incumplimiento grave del trabajador. Sin indemnización.',
    temporal: 'Finalización del contrato temporal. 12 días/año, sin tope mensual.',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Salario anual */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Salario bruto anual (€) — incluye pagas extras
            </label>
            <input
              type="number"
              value={salarioAnual}
              onChange={(e) => setSalarioAnual(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              min={0}
              step={500}
            />
            <input
              type="range"
              min={10000}
              max={120000}
              step={1000}
              value={salarioAnual}
              onChange={(e) => setSalarioAnual(Number(e.target.value))}
              className="w-full mt-space-sm accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>10.000€</span>
              <span>120.000€</span>
            </div>
          </div>

          {/* Tiempo trabajado */}
          <div className="grid grid-cols-2 gap-space-md">
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
                Años trabajados
              </label>
              <input
                type="number"
                value={anosTrabajados}
                onChange={(e) => setAnosTrabajados(Number(e.target.value))}
                className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                min={0}
                max={50}
              />
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={anosTrabajados}
                onChange={(e) => setAnosTrabajados(Number(e.target.value))}
                className="w-full mt-space-sm accent-primary"
              />
            </div>
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
                Meses adicionales
              </label>
              <input
                type="number"
                value={mesesTrabajados}
                onChange={(e) => setMesesTrabajados(Number(e.target.value))}
                className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                min={0}
                max={11}
              />
              <input
                type="range"
                min={0}
                max={11}
                step={1}
                value={mesesTrabajados}
                onChange={(e) => setMesesTrabajados(Number(e.target.value))}
                className="w-full mt-space-sm accent-primary"
              />
            </div>
          </div>

          {/* Tipo de despido */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Tipo de despido
            </label>
            <div className="space-y-space-sm">
              {(['improcedente', 'objetivo', 'temporal', 'procedente'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoDespido(tipo)}
                  className={`w-full py-space-sm px-space-md rounded-button text-left text-body-sm font-semibold transition-all ${
                    tipoDespido === tipo
                      ? tipo === 'procedente'
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface border border-outline-variant'
                  }`}
                >
                  <span>{tipoDespidoLabels[tipo]}</span>
                  <span className="block text-body-sm font-normal opacity-70 mt-0.5">
                    {tipoDespidoDescriptions[tipo]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">Indemnización estimada</h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total indemnización</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {result.indemnizacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </p>
          {result.topeAplicado && (
            <p className="mt-space-sm text-body-sm text-amber-600 font-semibold">
              ⚠️ Se ha aplicado el tope de {result.topeMensualidades} mensualidades
            </p>
          )}
          {result.baremoDoble && (
            <p className="mt-space-sm text-body-sm text-blue-600 font-semibold">
              ℹ️ Baremo doble aplicado (contrato pre/post 12/02/2012)
            </p>
          )}
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Tipo de despido</span>
            <span className="font-semibold text-on-surface">{tipoDespidoLabels[result.tipoDespido]}</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Días por año trabajado</span>
            <span className="font-semibold text-on-surface">{result.diasPorAno} días</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Salario diario</span>
            <span className="font-semibold text-on-surface">{result.desglose.salarioDiario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Meses totales trabajados</span>
            <span className="font-semibold text-on-surface">{result.desglose.mesesTotales} meses</span>
          </div>
          {!result.topeAplicado && result.tipoDespido !== 'procedente' && (
            <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
              <span className="text-on-surface/60">Mensualidades equivalentes</span>
              <span className="font-semibold text-on-surface">{result.mensualidadesIndemnizacion} meses</span>
            </div>
          )}
          {result.topeAplicado && (
            <div className="flex justify-between text-body-sm p-space-sm bg-amber-50 border border-amber-200 rounded-button">
              <span className="text-amber-700">Sin tope habría sido</span>
              <span className="font-semibold text-amber-700">{result.indemnizacionSinTope.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. La indemnización real puede variar según convenio colectivo, antigüedad anterior a 2012 y otros factores. Consulta con un abogado laboralista.
      </p>
    </div>
  );
}
