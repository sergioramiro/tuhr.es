import { useState } from 'react';
import { compararPagasExtras } from '../../lib/pagasExtras';

export default function ComparativaPagas() {
  const [brutoAnual, setBrutoAnual] = useState<number>(30000);

  const result = compararPagasExtras({ brutoAnual });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
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
      </div>

      {/* Comparativa lado a lado */}
      <div className="mt-space-xl grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* 12 pagas */}
        <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
          <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-md">12 pagas</h3>
          <div className="text-center mb-space-lg">
            <p className="text-body-sm text-on-surface/60">Cada mes cobras</p>
            <p className="font-headline text-headline-lg font-extrabold text-primary">
              {result.pagas12.mensualBruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </p>
          </div>
          <p className="text-body-sm text-on-surface/60 text-center">{result.pagas12.description}</p>
        </div>

        {/* 14 pagas */}
        <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
          <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-md">14 pagas</h3>
          <div className="text-center mb-space-lg">
            <p className="text-body-sm text-on-surface/60">Cada mes cobras</p>
            <p className="font-headline text-headline-lg font-extrabold text-primary">
              {result.pagas14.mensualBruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </p>
            <p className="mt-space-sm text-body-sm text-on-surface/60">
              + 2 pagas extras de{' '}
              <span className="font-semibold text-on-surface">
                {result.pagas14.pagaExtraBruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
              </span>
            </p>
          </div>
          <p className="text-body-sm text-on-surface/60 text-center">{result.pagas14.description}</p>
        </div>
      </div>

      {/* Diferencia */}
      <div className="mt-space-lg p-space-lg bg-primary/5 rounded-card border border-primary/20 text-center">
        <p className="text-body-sm text-on-surface/60">Diferencia mensual</p>
        <p className="font-headline text-headline-md font-bold text-on-surface">
          {result.diferenciaMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€ más al mes con 12 pagas
        </p>
      </div>

      {/* Explicación */}
      <div className="mt-space-xl p-space-lg bg-surface-container-low/50 rounded-card">
        <h4 className="font-headline text-headline-sm font-bold text-on-surface mb-space-md">¿Cuál me conviene?</h4>
        <div className="text-body-sm text-on-surface/70 space-y-space-sm">
          <p>
            <strong>12 pagas:</strong> Cobras más cada mes (en este caso, {result.diferenciaMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€ más). Ideal si necesitas un flujo de caja mensual más alto o tienes gastos fijos elevados.
          </p>
          <p>
            <strong>14 pagas:</strong> Cobras menos al mes pero recibes 2 pagas extra en junio y diciembre. Útil si prefieres tener un colchón para gastos extraordinarios o vacaciones.
          </p>
          <p>
            El total anual es exactamente el mismo. La diferencia está en <strong>cómo se distribuye el dinero</strong> a lo largo del año.
          </p>
        </div>
      </div>
    </div>
  );
}
