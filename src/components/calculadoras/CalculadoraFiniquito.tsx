import { useState } from 'react';
import { calcularFiniquito, type FiniquitoInput } from '../../lib/finiquito';

export default function CalculadoraFiniquito() {
  const [salarioAnual, setSalarioAnual] = useState<number>(30000);
  const [pagasProrrateadas, setPagasProrrateadas] = useState(false);
  const [mesesDesdeUltimaPaga, setMesesDesdeUltimaPaga] = useState(6);
  const [vacacionesPendientes, setVacacionesPendientes] = useState(15);
  const [diasTrabajadosMes, setDiasTrabajadosMes] = useState(15);

  const input: FiniquitoInput = {
    salarioAnual,
    pagasProrrateadas,
    mesesDesdeUltimaPaga,
    vacacionesPendientes,
    diasTrabajadosMes,
    diasDelMes: 30,
  };
  const result = calcularFiniquito(input);

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

          {/* Pagas prorrateadas */}
          <div className="flex items-center gap-space-sm">
            <input
              type="checkbox"
              id="prorrateadas"
              checked={pagasProrrateadas}
              onChange={(e) => setPagasProrrateadas(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="prorrateadas" className="text-body-sm text-on-surface">
              Las pagas extras están prorrateadas en nómina (cobras más cada mes)
            </label>
          </div>

          {/* Meses desde última paga extra */}
          {!pagasProrrateadas && (
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
                Meses desde la última paga extra cobrada: {mesesDesdeUltimaPaga}
              </label>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={mesesDesdeUltimaPaga}
                onChange={(e) => setMesesDesdeUltimaPaga(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
                <span>0 meses</span>
                <span>12 meses</span>
              </div>
            </div>
          )}

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
            <span className="text-on-surface/60">Salario día del mes ({result.desglose.diasTrabajados} días × {result.desglose.salarioDiario}€/día)</span>
            <span className="font-semibold text-on-surface">{result.salarioPendienteMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Vacaciones no disfrutadas ({result.desglose.vacacionesPendientes} días)</span>
            <span className="font-semibold text-on-surface">{result.vacacionesProporcionales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          {!pagasProrrateadas && mesesDesdeUltimaPaga > 0 && (
            <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
              <span className="text-on-surface/60">Pagas extras proporcionales ({result.desglose.mesesDesdeUltimaPaga} meses)</span>
              <span className="font-semibold text-on-surface">{result.pagasExtrasProporcionales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
          )}
          {pagasProrrateadas && (
            <div className="flex justify-between text-body-sm p-space-sm bg-surface-container-low rounded-button">
              <span className="text-on-surface/50 italic">Pagas extras: prorrateadas (ya incluidas en nómina)</span>
              <span className="text-on-surface/50">0€</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. El finiquito real puede incluir otros conceptos según convenio colectivo. Consulta con un asesor laboral.
      </p>
    </div>
  );
}
