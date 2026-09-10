import { useState } from 'react';
import { calcularNomina, type NominaInput } from '../../lib/nomina';

export default function CalculadoraNomina() {
  const [brutoAnual, setBrutoAnual] = useState<number>(30000);
  const [pagas, setPagas] = useState<12 | 14>(14);
  const [estadoCivil, setEstadoCivil] = useState<NominaInput['estadoCivil']>('soltero');
  const [hijos, setHijos] = useState(0);
  const [discapacidad, setDiscapacidad] = useState(false);

  const input: NominaInput = { brutoAnual, pagas, estadoCivil, hijos, discapacidad };
  const result = calcularNomina(input);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Formulario */}
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Salario bruto anual */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Salario bruto anual (€)
            </label>
            <input
              type="number"
              value={brutoAnual}
              onChange={(e) => setBrutoAnual(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              min={0}
              step={500}
            />
            <input
              type="range"
              min={10000}
              max={120000}
              step={1000}
              value={brutoAnual}
              onChange={(e) => setBrutoAnual(Number(e.target.value))}
              className="w-full mt-space-sm accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>10.000€</span>
              <span>120.000€</span>
            </div>
          </div>

          {/* Pagas */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Pagas al año
            </label>
            <div className="flex gap-space-md">
              <button
                onClick={() => setPagas(12)}
                className={`flex-1 py-space-sm px-space-md rounded-button font-semibold text-body-sm transition-all ${
                  pagas === 12
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface border border-outline-variant'
                }`}
              >
                12 pagas
              </button>
              <button
                onClick={() => setPagas(14)}
                className={`flex-1 py-space-sm px-space-md rounded-button font-semibold text-body-sm transition-all ${
                  pagas === 14
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface border border-outline-variant'
                }`}
              >
                14 pagas
              </button>
            </div>
          </div>

          {/* Estado civil */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Estado civil
            </label>
            <select
              value={estadoCivil}
              onChange={(e) => setEstadoCivil(e.target.value as NominaInput['estadoCivil'])}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="soltero">Soltero/a, viudo/a, divorciado/a</option>
              <option value="casado_1 partner">Casado/a — 1 único trabajador</option>
              <option value="casado_2 partners">Casado/a — 2 trabajadores</option>
            </select>
          </div>

          {/* Hijos */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Hijos: {hijos}
            </label>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={hijos}
              onChange={(e) => setHijos(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Discapacidad */}
          <div className="flex items-center gap-space-sm">
            <input
              type="checkbox"
              id="discapacidad"
              checked={discapacidad}
              onChange={(e) => setDiscapacidad(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="discapacidad" className="text-body-sm text-on-surface">
              Discapacidad igual o superior al 33%
            </label>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">Resultado</h3>

        <div className="grid grid-cols-2 gap-space-md">
          <div className="bg-surface-card rounded-button p-space-md text-center">
            <p className="text-body-sm text-on-surface/60">Bruto mensual</p>
            <p className="font-headline text-headline-md font-bold text-on-surface">{result.brutoMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
          </div>
          <div className="bg-surface-card rounded-button p-space-md text-center">
            <p className="text-body-sm text-on-surface/60">Neto mensual</p>
            <p className="font-headline text-headline-md font-bold text-primary">{result.netoMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
          </div>
        </div>

        <div className="mt-space-lg space-y-space-sm">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface/60">Retención IRPF</span>
            <span className="font-semibold text-on-surface">{result.retencionIrpf.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€ ({result.tipoEfectivoIrpf}%)</span>
          </div>

          {/* Desglose SS */}
          <div className="p-space-md bg-surface-card rounded-button">
            <p className="text-body-sm font-semibold text-on-surface mb-space-sm">Cuota Seguridad Social ({result.cuotaSs.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€)</p>
            <div className="space-y-1 text-body-sm text-on-surface/60">
              <div className="flex justify-between">
                <span>Contingencias comunes (4,70%)</span>
                <span>{result.desgloseSs.contingenciasComunes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
              </div>
              <div className="flex justify-between">
                <span>Desempleo (1,55%)</span>
                <span>{result.desgloseSs.desempleo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
              </div>
              <div className="flex justify-between">
                <span>Formación profesional (0,10%)</span>
                <span>{result.desgloseSs.formacionProfesional.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
              </div>
              <div className="flex justify-between">
                <span>MEI — Equidad intergeneracional (0,15%)</span>
                <span>{result.desgloseSs.mei.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-body-sm border-t border-outline-variant/30 pt-space-sm">
            <span className="text-on-surface/60">Total deducciones</span>
            <span className="font-semibold text-on-surface">{result.totalDeducciones.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
        </div>

        <div className="mt-space-lg p-space-md bg-surface-card rounded-button">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface/60">Neto anual</span>
            <span className="font-semibold text-on-surface">{result.netoAnual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo basado en la escala general IRPF estatal, cuotas SS estándar y reducción por obtención de rentas del trabajo. Cada CCAA aplica su tipo autonómico. Consulta con un asesor fiscal para datos exactos.
      </p>
    </div>
  );
}
