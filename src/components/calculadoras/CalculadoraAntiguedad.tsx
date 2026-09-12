import { useState } from 'react';

interface ResultadoAntiguedad {
  annosTrabajados: number;
  salarioDiario: number;
  salarioMesesAntiguedad: number;
  porcentaje: number;
  desglose: {
    annos: number;
    salarioBase: number;
    porcentajeAplicable: number;
  };
}

function calcularAntiguedad(salarioAnual: number, annosTrabajados: number): ResultadoAntiguedad {
  const salarioBase = salarioAnual;
  const salarioDiario = salarioBase / 365;

  // Porcentaje de plus de antigüedad según años trabajados
  // Convenios habituales: 1% por cada 2 años, máximo 10% a partir de 20 años
  let porcentaje = 0;
  if (annosTrabajados >= 2) porcentaje = 1;
  if (annosTrabajados >= 4) porcentaje = 2;
  if (annosTrabajados >= 6) porcentaje = 3;
  if (annosTrabajados >= 8) porcentaje = 4;
  if (annosTrabajados >= 10) porcentaje = 5;
  if (annosTrabajados >= 12) porcentaje = 6;
  if (annosTrabajados >= 14) porcentaje = 7;
  if (annosTrabajados >= 16) porcentaje = 8;
  if (annosTrabajados >= 18) porcentaje = 9;
  if (annosTrabajados >= 20) porcentaje = 10;

  const salarioMesesAntiguedad = (salarioBase * porcentaje) / 100;

  return {
    annosTrabajados,
    salarioDiario,
    salarioMesesAntiguedad,
    porcentaje,
    desglose: {
      annos: annosTrabajados,
      salarioBase,
      porcentajeAplicable: porcentaje,
    },
  };
}

export default function CalculadoraAntiguedad() {
  const [salarioAnual, setSalarioAnual] = useState<number>(30000);
  const [annosTrabajados, setAnnosTrabajados] = useState<number>(5);

  const result = calcularAntiguedad(salarioAnual, annosTrabajados);

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

          {/* Años trabajados */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Años trabajados en la empresa: {annosTrabajados}
            </label>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={annosTrabajados}
              onChange={(e) => setAnnosTrabajados(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>1 año</span>
              <span>30 años</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">Plus de antigüedad</h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total anual estimado</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {result.salarioMesesAntiguedad.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </p>
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Años trabajados</span>
            <span className="font-semibold text-on-surface">{result.annosTrabajados} años</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Salario base anual</span>
            <span className="font-semibold text-on-surface">{result.desglose.salarioBase.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Porcentaje aplicable</span>
            <span className="font-semibold text-on-surface">{result.porcentaje}%</span>
          </div>
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. El plus de antigüedad real varía según el convenio colectivo de cada sector. Consulta con un asesor laboral para conocer tu caso específico.
      </p>
    </div>
  );
}
