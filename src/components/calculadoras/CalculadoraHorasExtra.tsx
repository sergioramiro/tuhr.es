import { useState } from 'react';

interface ResultadoHorasExtra {
  horasNormales: number;
  horasNocturnas: number;
  salarioHoraNormal: number;
  salarioHoraNocturna: number;
  totalHorasNormales: number;
  totalHorasNocturnas: number;
  totalBruto: number;
  desglose: {
    horasNormales: number;
    multiplicadorNormal: number;
    horasNocturnas: number;
    multiplicadorNocturno: number;
  };
}

function calcularHorasExtra(
  salarioAnual: number,
  horasNormales: number,
  horasNocturnas: number,
  pagasProrrateadas: boolean,
  jornadaSemanal: number = 40
): ResultadoHorasExtra {
  // Salario mensual base
  const pagasExtraCount = pagasProrrateadas ? 0 : 2;
  const mesesCobro = pagasProrrateadas ? 14 : 12;
  const salarioMensual = (salarioAnual / mesesCobro);
  
  // Salario hora normal (sobre 40h/semanal)
  const horasMensuales = (jornadaSemanal * 52) / 12;
  const salarioHoraNormal = salarioMensual / horasMensuales;

  // Multiplicador según Estatuto de los Trabajadores
  const multiplicadorNormal = 1.5; // 1.5× para horas extra ordinarias
  const multiplicadorNocturno = 2.0; // 2× para horas nocturnas (entre 22h y 6h)

  // Horas extra nocturnas se consideran también horas extra normales
  const totalHorasNormales = horasNormales;
  const totalHorasNocturnas = horasNocturnas;

  const totalBruto =
    totalHorasNormales * salarioHoraNormal * multiplicadorNormal +
    totalHorasNocturnas * salarioHoraNormal * multiplicadorNocturno;

  return {
    horasNormales,
    horasNocturnas,
    salarioHoraNormal,
    salarioHoraNocturna: salarioHoraNormal,
    totalHorasNormales,
    totalHorasNocturnas,
    totalBruto,
    desglose: {
      horasNormales: totalHorasNormales,
      multiplicadorNormal,
      horasNocturnas: totalHorasNocturnas,
      multiplicadorNocturno: multiplicadorNocturno,
    },
  };
}

export default function CalculadoraHorasExtra() {
  const [salarioAnual, setSalarioAnual] = useState<number>(30000);
  const [horasNormales, setHorasNormales] = useState<number>(10);
  const [horasNocturnas, setHorasNocturnas] = useState<number>(0);
  const [pagasProrrateadas, setPagasProrrateadas] = useState<boolean>(false);

  const result = calcularHorasExtra(salarioAnual, horasNormales, horasNocturnas, pagasProrrateadas);

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
              id="prorrateadas-he"
              checked={pagasProrrateadas}
              onChange={(e) => setPagasProrrateadas(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="prorrateadas-he" className="text-body-sm text-on-surface">
              Las pagas extras están prorrateadas en nómina (cobras más cada mes)
            </label>
          </div>

          {/* Horas extra normales */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Horas extra normales (mes): {horasNormales}
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={horasNormales}
              onChange={(e) => setHorasNormales(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>0 horas</span>
              <span>80 horas</span>
            </div>
          </div>

          {/* Horas extra nocturnas */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Horas extra nocturnas (22h–6h): {horasNocturnas}
            </label>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={horasNocturnas}
              onChange={(e) => setHorasNocturnas(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-body-sm text-on-surface/50 mt-1">
              <span>0 horas</span>
              <span>40 horas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-space-xl bg-primary/5 rounded-card p-space-xl border border-primary/20">
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">Tus horas extra</h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total bruto a cobrar</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {result.totalBruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </p>
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Salario hora base</span>
            <span className="font-semibold text-on-surface">{result.salarioHoraNormal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€/h</span>
          </div>
          {horasNormales > 0 && (
            <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
              <span className="text-on-surface/60">Horas normales ({horasNormales}h × 1.5×)</span>
              <span className="font-semibold text-on-surface">{(horasNormales * result.salarioHoraNormal * 1.5).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
          )}
          {horasNocturnas > 0 && (
            <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
              <span className="text-on-surface/60">Horas nocturnas ({horasNocturnas}h × 2×)</span>
              <span className="font-semibold text-on-surface">{(horasNocturnas * result.salarioHoraNormal * 2).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. Los multiplicadores pueden variar según convenio colectivo. Consulta con un asesor laboral.
      </p>
    </div>
  );
}
