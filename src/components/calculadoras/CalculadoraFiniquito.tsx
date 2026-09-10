import { useState } from 'react';
import { calcularFiniquito, type FiniquitoInput } from '../../lib/finiquito';

export default function CalculadoraFiniquito() {
  const [salarioMensual, setSalarioMensual] = useState<number>(2000);
  const [pagasExtras, setPagasExtras] = useState(2);
  const [vacacionesPendientes, setVacacionesPendientes] = useState(15);
  const [diasTrabajadosMes, setDiasTrabajadosMes] = useState(15);
  const [diasDelMes, setDiasDelMes] = useState(30);

  const input: FiniquitoInput = {
    salarioMensual,
    pagasExtras,
    vacacionesPendientes,
    diasTrabajadosMes,
    diasDelMes,
    fechaEntrada: new Date('2020-01-01'),
    fechaSalida: new Date(),
  };
  const result = calcularFiniquito(input);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Salario mensual */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Salario bruto mensual (€)
            </label>
            <input
              type="number"
              value={salarioMensual}
              onChange={(e) => setSalarioMensual(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              min={0}
              step={100}
            />
            <input
              type="range"
              min={800}
              max={10000}
              step={100}
              value={salarioMensual}
              onChange={(e) => setSalarioMensual(Number(e.target.value))}
              className="w-full mt-space-sm accent-primary"
            />
          </div>

          {/* Pagas extras */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Pagas extras pendientes
            </label>
            <div className="flex gap-space-md">
              {[0, 1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => setPagasExtras(n)}
                  className={`flex-1 py-space-sm px-space-md rounded-button font-semibold text-body-sm transition-all ${
                    pagasExtras === n
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface border border-outline-variant'
                  }`}
                >
                  {n === 0 ? 'Ninguna' : `${n} paga${n > 1 ? 's' : ''}`}
                </button>
              ))}
            </div>
          </div>

          {/* Vacaciones pendientes */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Días de vacaciones pendientes: {vacacionesPendientes}
            </label>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={vacacionesPendientes}
              onChange={(e) => setVacacionesPendientes(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Días trabajados en el mes */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Días trabajados en el mes de salida: {diasTrabajadosMes}
            </label>
            <input
              type="range"
              min={0}
              max={31}
              step={1}
              value={diasTrabajadosMes}
              onChange={(e) => setDiasTrabajadosMes(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">Tu finiquito</h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total estimado</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {result.totalFiniquito.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </p>
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Vacaciones no disfrutadas ({result.diasVacaciones} días)</span>
            <span className="font-semibold text-on-surface">{result.vacacionesProporcionales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Pagas extras pendientes ({result.diasPagasExtras})</span>
            <span className="font-semibold text-on-surface">{result.pagasExtrasProporcionales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Día del mes trabajado</span>
            <span className="font-semibold text-on-surface">{result.parteProporcionalMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. El finiquito real puede incluir otros conceptos según convenio colectivo. Consulta con un asesor laboral.
      </p>
    </div>
  );
}
