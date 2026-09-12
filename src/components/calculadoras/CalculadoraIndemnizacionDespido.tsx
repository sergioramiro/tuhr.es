import { useState } from 'react';

type TipoDespido = 'objetivo' | 'improcedente';

interface ResultadoIndemnizacion {
  tipo: TipoDespido;
  annosTrabajados: number;
  salarioDiario: number;
  salarioMensual: number;
  diasPorAnno: number;
  indemnizacionTotal: number;
  mensualidadesMaximas: number;
  desglose: {
    tipo: TipoDespido;
    diasPorAnno: number;
    annosTrabajados: number;
    salarioDiario: number;
    mensualidadesMaximas: number;
  };
}

function calcularIndemnizacion(
  salarioAnual: number,
  annosTrabajados: number,
  tipo: TipoDespido
): ResultadoIndemnizacion {
  const salarioMensual = salarioAnual / 12;
  const salarioDiario = salarioMensual / 30;

  let diasPorAnno: number;
  let mensualidadesMaximas: number;

  if (tipo === 'objetivo') {
    diasPorAnno = 20;
    mensualidadesMaximas = 12;
  } else {
    diasPorAnno = 33;
    mensualidadesMaximas = 24;
  }

  // Cálculo de la indemnización total
  const indemnizacionTotal = (salarioDiario * diasPorAnno * annosTrabajados);

  // Aplicar tope de mensualidades si es necesario
  const indemnizacionConTope = Math.min(indemnizacionTotal, salarioMensual * mensualidadesMaximas);

  return {
    tipo,
    annosTrabajados,
    salarioDiario,
    salarioMensual,
    diasPorAnno,
    indemnizacionTotal: indemnizacionConTope,
    mensualidadesMaximas,
    desglose: {
      tipo,
      diasPorAnno,
      annosTrabajados,
      salarioDiario,
      mensualidadesMaximas,
    },
  };
}

export default function CalculadoraIndemnizacionDespido() {
  const [salarioAnual, setSalarioAnual] = useState<number>(30000);
  const [annosTrabajados, setAnnosTrabajados] = useState<number>(5);
  const [tipo, setTipo] = useState<TipoDespido>('objetivo');

  const result = calcularIndemnizacion(salarioAnual, annosTrabajados, tipo);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <div className="space-y-space-lg">
          {/* Tipo de despido */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Tipo de despido
            </label>
            <div className="flex gap-space-sm">
              <button
                onClick={() => setTipo('objetivo')}
                className={`flex-1 px-space-md py-space-sm rounded-button border transition-all ${
                  tipo === 'objetivo'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-card text-on-surface border-outline-variant hover:border-primary/50'
                }`}
              >
                Objetivo (20 días/año)
              </button>
              <button
                onClick={() => setTipo('improcedente')}
                className={`flex-1 px-space-md py-space-sm rounded-button border transition-all ${
                  tipo === 'improcedente'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-card text-on-surface border-outline-variant hover:border-primary/50'
                }`}
              >
                Improcedente (33 días/año)
              </button>
            </div>
          </div>

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
        <h3 className="font-headline text-headline-md font-bold text-on-surface mb-space-lg">
          Indemnización por despido {tipo === 'objetivo' ? 'objetivo' : 'improcedente'}
        </h3>

        <div className="text-center mb-space-xl">
          <p className="text-body-sm text-on-surface/60">Total indemnización estimada</p>
          <p className="font-headline text-headline-xl font-extrabold text-primary">
            {result.indemnizacionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </p>
        </div>

        <div className="space-y-space-sm">
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Tipo de despido</span>
            <span className="font-semibold text-on-surface">{tipo === 'objetivo' ? 'Objetivo' : 'Improcedente'}</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Días por año trabajado</span>
            <span className="font-semibold text-on-surface">{result.diasPorAnno} días</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Salario diario</span>
            <span className="font-semibold text-on-surface">{result.salarioDiario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Tope máximo</span>
            <span className="font-semibold text-on-surface">{result.mensualidadesMaximas} mensualidades</span>
          </div>
          <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
            <span className="text-on-surface/60">Cálculo</span>
            <span className="font-semibold text-on-surface">{result.diasPorAnno} días × {annosTrabajados} años × {result.salarioDiario.toFixed(2)}€/día</span>
          </div>
        </div>
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/40 text-center">
        ⚠️ Cálculo orientativo. La indemnización real puede variar según convenio colectivo, antigüedad anterior al 12/02/2012 y otros factores. Consulta con un asesor laboral.
      </p>
    </div>
  );
}
