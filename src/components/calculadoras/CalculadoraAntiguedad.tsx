import { useMemo, useState } from 'react';
import {
  aniosEntreFechas,
  calcularPlusAntiguedad,
  type ReglasPlus,
  type TipoIncremento,
  type TipoTope,
} from '../../lib/antiguedad';

const eur = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

const hoy = () => {
  const d = new Date();
  // Fecha local, no UTC: a las 23:30 en España toISOString ya daría el día siguiente.
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const EJEMPLO = {
  alta: '2016-01-01',
  corte: '2026-01-01',
  baseAnual: 18000,
  duracion: 4,
  tipoIncremento: 'porcentaje' as TipoIncremento,
  valor: 5,
  tipoTope: 'ninguno' as TipoTope,
  valorTope: 0,
  prorrateo: false,
  pagas: 12,
};

export default function CalculadoraAntiguedad() {
  // Todo vacío al cargar: sin reglas del convenio no hay cifra que enseñar.
  const [alta, setAlta] = useState('');
  const [corte, setCorte] = useState(hoy());
  const [baseAnual, setBaseAnual] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tipoIncremento, setTipoIncremento] = useState<TipoIncremento>('porcentaje');
  const [valor, setValor] = useState('');
  const [tipoTope, setTipoTope] = useState<TipoTope>('ninguno');
  const [valorTope, setValorTope] = useState('');
  const [prorrateo, setProrrateo] = useState(false);
  const [pagas, setPagas] = useState(12);
  const [sinPlus, setSinPlus] = useState(false);
  const [esEjemplo, setEsEjemplo] = useState(false);

  const num = (v: string) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const anios = useMemo(() => {
    if (!alta || !corte) return 0;
    const a = new Date(alta);
    const c = new Date(corte);
    if (Number.isNaN(a.getTime()) || Number.isNaN(c.getTime())) return 0;
    return aniosEntreFechas(a, c);
  }, [alta, corte]);

  const reglas: ReglasPlus = {
    baseAnual: num(baseAnual),
    duracionTramoAnios: num(duracion),
    tipoIncremento,
    valorIncremento: num(valor),
    tipoTope,
    valorTope: num(valorTope),
    prorratearTramoEnCurso: prorrateo,
    pagas,
    sinPlus,
  };

  const requiereFechas = !alta || !corte;
  const resultado = useMemo(() => calcularPlusAntiguedad(anios, reglas), [
    anios, baseAnual, duracion, tipoIncremento, valor, tipoTope, valorTope, prorrateo, pagas, sinPlus,
  ]);

  const cargarEjemplo = () => {
    setAlta(EJEMPLO.alta);
    setCorte(EJEMPLO.corte);
    setBaseAnual(String(EJEMPLO.baseAnual));
    setDuracion(String(EJEMPLO.duracion));
    setTipoIncremento(EJEMPLO.tipoIncremento);
    setValor(String(EJEMPLO.valor));
    setTipoTope(EJEMPLO.tipoTope);
    setValorTope('');
    setProrrateo(EJEMPLO.prorrateo);
    setPagas(EJEMPLO.pagas);
    setSinPlus(false);
    setEsEjemplo(true);
  };

  const limpiar = () => {
    setAlta('');
    setCorte(hoy());
    setBaseAnual('');
    setDuracion('');
    setValor('');
    setValorTope('');
    setTipoTope('ninguno');
    setTipoIncremento('porcentaje');
    setProrrateo(false);
    setSinPlus(false);
    setEsEjemplo(false);
  };

  const mostrarCifra = resultado.estado === 'ok' && !requiereFechas && !sinPlus;

  const faltaTexto: Record<string, string> = {
    base: 'la base salarial sobre la que tu convenio aplica el plus',
    duracionTramo: 'cada cuántos años sube el tramo (bienio, trienio, cuatrienio…)',
    valorIncremento: 'cuánto sube en cada tramo (un porcentaje o un importe)',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-surface-card rounded-card p-space-xl shadow-card border border-outline-variant/30">
        <h2 className="font-headline text-headline-md font-bold text-on-surface mb-space-xs">
          Reglas de tu convenio
        </h2>
        <p className="text-body-sm text-on-surface/60 mb-space-lg">
          El Estatuto no fija un plus de antigüedad: el artículo 25 remite a lo que diga tu convenio o tu
          contrato. Copia los tres datos de la tabla salarial o del artículo del plus y el cálculo se ajusta
          a tu caso.
        </p>

        <div className="grid gap-space-md sm:grid-cols-2">
          <div>
            <label htmlFor="alta" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Fecha de alta en la empresa
            </label>
            <input
              id="alta"
              type="date"
              value={alta}
              onChange={(e) => { setAlta(e.target.value); setEsEjemplo(false); }}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="corte" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Calcular hasta
            </label>
            <input
              id="corte"
              type="date"
              value={corte}
              onChange={(e) => { setCorte(e.target.value); setEsEjemplo(false); }}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {!requiereFechas && (
          <p className="mt-space-sm text-body-sm text-on-surface/60">
            Antigüedad: <strong className="text-on-surface">{anios.toLocaleString('es-ES')} años</strong>
            {' '}({Math.floor(anios)} años y {Math.round((anios % 1) * 12)} meses)
          </p>
        )}

        <div className="mt-space-lg">
          <label htmlFor="base" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
            Base salarial anual sobre la que se aplica el plus (€)
          </label>
          <input
            id="base"
            type="number"
            inputMode="decimal"
            min={0}
            step={500}
            value={baseAnual}
            onChange={(e) => { setBaseAnual(e.target.value); setEsEjemplo(false); }}
            placeholder="Ej. 18.000"
            className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          <p className="mt-space-sm text-body-sm text-on-surface/50">
            No es lo mismo que tu salario bruto anual. Casi todos los convenios aplican el plus sobre el{' '}
            <strong className="text-on-surface/70">salario base</strong>, sin complementos ni pagas extras. Si
            metes el bruto con complementos, el resultado saldrá más alto de lo que te corresponde.
          </p>
        </div>

        <div className="grid gap-space-md sm:grid-cols-2 mt-space-lg">
          <div>
            <label htmlFor="duracion" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Cada cuántos años sube el tramo
            </label>
            <select
              id="duracion"
              value={duracion}
              onChange={(e) => { setDuracion(e.target.value); setEsEjemplo(false); }}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Selecciona…</option>
              <option value="3">Cada 3 años (trienio)</option>
              <option value="4">Cada 4 años (cuatrienio)</option>
              <option value="5">Cada 5 años (quinquenio)</option>
              <option value="2">Cada 2 años (bienio)</option>
              <option value="1">Cada año</option>
            </select>
          </div>
          <div>
            <label htmlFor="pagas" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Pagas en las que se abona
            </label>
            <select
              id="pagas"
              value={pagas}
              onChange={(e) => setPagas(Number(e.target.value))}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value={12}>12 pagas</option>
              <option value={14}>14 pagas</option>
            </select>
          </div>
        </div>

        <div className="grid gap-space-md sm:grid-cols-2 mt-space-lg">
          <div>
            <label htmlFor="tipoIncremento" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Cómo sube cada tramo
            </label>
            <select
              id="tipoIncremento"
              value={tipoIncremento}
              onChange={(e) => { setTipoIncremento(e.target.value as TipoIncremento); setEsEjemplo(false); }}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="porcentaje">Un porcentaje sobre la base</option>
              <option value="importe">Un importe fijo al año</option>
            </select>
          </div>
          <div>
            <label htmlFor="valor" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              {tipoIncremento === 'porcentaje' ? 'Porcentaje por tramo (%)' : 'Importe por tramo (€/año)'}
            </label>
            <input
              id="valor"
              type="number"
              inputMode="decimal"
              min={0}
              step={tipoIncremento === 'porcentaje' ? 0.5 : 50}
              value={valor}
              onChange={(e) => { setValor(e.target.value); setEsEjemplo(false); }}
              placeholder={tipoIncremento === 'porcentaje' ? 'Ej. 5' : 'Ej. 300'}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="grid gap-space-md sm:grid-cols-2 mt-space-lg">
          <div>
            <label htmlFor="tipoTope" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
              Límite máximo
            </label>
            <select
              id="tipoTope"
              value={tipoTope}
              onChange={(e) => { setTipoTope(e.target.value as TipoTope); setEsEjemplo(false); }}
              className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="ninguno">Sin límite o no consta</option>
              <option value="porcentaje">Un porcentaje máximo</option>
              <option value="importe">Un importe máximo al año</option>
            </select>
          </div>
          {tipoTope !== 'ninguno' && (
            <div>
              <label htmlFor="valorTope" className="block text-body-sm font-semibold text-on-surface mb-space-sm">
                {tipoTope === 'porcentaje' ? 'Tope (%)' : 'Tope (€/año)'}
              </label>
              <input
                id="valorTope"
                type="number"
                inputMode="decimal"
                min={0}
                step={tipoTope === 'porcentaje' ? 1 : 100}
                value={valorTope}
                onChange={(e) => { setValorTope(e.target.value); setEsEjemplo(false); }}
                placeholder={tipoTope === 'porcentaje' ? 'Ej. 25' : 'Ej. 2.000'}
                className="w-full px-space-md py-space-sm border border-outline-variant rounded-input text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-space-lg space-y-space-sm">
          <label className="flex items-start gap-space-sm text-body-sm text-on-surface/80">
            <input
              type="checkbox"
              checked={prorrateo}
              onChange={(e) => { setProrrateo(e.target.checked); setEsEjemplo(false); }}
              className="mt-1 accent-primary"
            />
            <span>
              Mi convenio reconoce la parte proporcional del tramo que aún no he completado
            </span>
          </label>
          <label className="flex items-start gap-space-sm text-body-sm text-on-surface/80">
            <input
              type="checkbox"
              checked={sinPlus}
              onChange={(e) => { setSinPlus(e.target.checked); setEsEjemplo(false); }}
              className="mt-1 accent-primary"
            />
            <span>Mi convenio no reconoce plus de antigüedad</span>
          </label>
        </div>

        <div className="mt-space-lg flex flex-wrap gap-space-sm">
          <button
            type="button"
            onClick={cargarEjemplo}
            className="px-space-lg py-space-sm rounded-button border border-primary text-primary text-body-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            Ver un ejemplo hipotético
          </button>
          {(alta || baseAnual || duracion || valor) && (
            <button
              type="button"
              onClick={limpiar}
              className="px-space-lg py-space-sm rounded-button text-on-surface/60 text-body-sm hover:text-on-surface transition-colors"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-space-xl rounded-card p-space-xl border border-outline-variant/30 bg-surface-container-low/50" aria-live="polite">
        {sinPlus && (
          <p className="text-body-default text-on-surface">
            Si tu convenio no recoge plus de antigüedad, no hay nada que calcular: el Estatuto no lo impone y
            no existe un importe mínimo legal por años trabajados.
          </p>
        )}

        {!sinPlus && !mostrarCifra && (
          <>
            <h3 className="font-headline text-headline-sm font-bold text-on-surface mb-space-sm">
              Sin datos de tu convenio no hay importe
            </h3>
            <p className="text-body-sm text-on-surface/70 mb-space-md">
              {requiereFechas
                ? 'Falta la fecha de alta para saber cuántos años llevas.'
                : 'Para darte una cifra necesito lo que dice tu convenio o tu contrato:'}
            </p>
            {!requiereFechas && resultado.faltan.length > 0 && (
              <ul className="list-disc list-inside text-body-sm text-on-surface/60 space-y-1">
                {resultado.faltan.map((f) => (
                  <li key={f}>{faltaTexto[f] ?? f}</li>
                ))}
              </ul>
            )}
            <p className="mt-space-md text-body-sm text-on-surface/50">
              No damos una estimación por defecto porque no existe un porcentaje legal común: dos convenios
              pueden pagar un 3 % por bienio y otro un 10 % por cuatrienio.
            </p>
          </>
        )}

        {mostrarCifra && (
          <>
            {esEjemplo && (
              <p className="mb-space-md inline-block rounded-button bg-amber-100 text-amber-900 text-body-sm font-semibold px-space-sm py-1">
                Ejemplo hipotético · convenio inventado: 5 % por cuatrienio sobre 18.000 €/año, sin tope
              </p>
            )}
            <p className="text-body-sm text-on-surface/60">Plus de antigüedad anual</p>
            <p className="font-headline text-headline-xl font-extrabold text-primary">
              {eur(resultado.importeAnual)}
            </p>
            <p className="mt-space-sm text-body-sm text-on-surface/70">
              Equivale a {eur(resultado.importeMensual)} al mes repartido en {pagas} pagas. No es
              necesariamente lo que aparecerá en cada nómina: depende de cómo el convenio ordene el abono
              (en 12 o 14 pagas, prorrateado o en un pago único).
            </p>

            <div className="mt-space-lg space-y-space-sm">
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Antigüedad</span>
                <span className="font-semibold text-on-surface">{resultado.anios.toLocaleString('es-ES')} años</span>
              </div>
              <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                <span className="text-on-surface/60">Tramos completados</span>
                <span className="font-semibold text-on-surface">{resultado.tramos}</span>
              </div>
              {tipoIncremento === 'porcentaje' && (
                <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                  <span className="text-on-surface/60">Porcentaje aplicado</span>
                  <span className="font-semibold text-on-surface">{resultado.porcentajeAplicado} %</span>
                </div>
              )}
              {resultado.topeAplicado && (
                <div className="flex justify-between text-body-sm p-space-sm bg-amber-50 rounded-button">
                  <span className="text-amber-900/80">Tope del convenio aplicado</span>
                  <span className="font-semibold text-amber-900">Sí</span>
                </div>
              )}
              {resultado.siguienteTramoEn !== null && (
                <div className="flex justify-between text-body-sm p-space-sm bg-surface-card rounded-button">
                  <span className="text-on-surface/60">Siguiente tramo</span>
                  <span className="font-semibold text-on-surface">
                    en {resultado.siguienteTramoEn} años
                  </span>
                </div>
              )}
            </div>

            <p className="mt-space-lg text-body-sm text-on-surface/60">
              Cómo se calcula: tramos completados × incremento del convenio, aplicado sobre la base que has
              indicado. No incluye atrasos, regularizaciones ni el efecto de los cambios de convenio.
            </p>

            <p className="mt-space-md text-body-sm text-on-surface/60">
              ¿Quieres entender de dónde sale cada tramo?{' '}
              <a href="/guias/antiguedad-laboral/" className="text-primary hover:underline font-semibold">
                Guía de antigüedad laboral
              </a>
              .
            </p>
          </>
        )}
      </div>

      <p className="mt-space-lg text-body-sm text-on-surface/50 text-center">
        Estimación orientativa con los datos que has introducido. No es un cálculo oficial ni sustituye al
        recibo de salario ni al informe de tu convenio.
      </p>
    </div>
  );
}
