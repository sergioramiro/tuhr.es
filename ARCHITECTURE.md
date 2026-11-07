# Arquitectura — tuhr.es

Sitio estático en Astro con calculadoras laborales, plantillas descargables y guías SEO
para trabajadores y autónomos en España. Todo el cálculo se ejecuta en el navegador:
no hay backend ni base de datos.

## Stack

- **Astro 7** con salida estática y algunas islas de **React 19**.
- **Tailwind 3** + PostCSS; estilos base en `src/styles/global.css`.
- **Vitest** para la lógica de cálculo laboral.
- **marked** para renderizar el contenido en Markdown de `blog-articles/`.
- Despliegue en **Netlify** desde `main`, con redirecciones en `netlify.toml`.

## Mapa de directorios

```
src/
  pages/
    index.astro                 home
    calculadoras/               calculadoras interactivas (finiquito, nómina, paro, baja…)
    guias/                      guías SEO largas (finiquito, despido, nómina, arrendamientos)
    plantillas/                 plantillas legales descargables
    blog/                       artículos de blog
    aviso-legal/, cookies/, politica-privacidad/
  lib/                          lógica de cálculo, una función por concepto
    indemnizacion.ts            despido objetivo/procedente/improcedente, topes y preaviso
    despido.ts                  cálculo por causa y antigüedad
    finiquito.ts                saldo de vacaciones, pagas y partes proporcionales
    nomina.ts                   nómina mensual, bases de cotización e IRPF
    pagasExtras.ts              comparación de pagas prorrateadas o no
    bajaMedica.ts               prestación por incapacidad temporal
    marked-config.ts            render de Markdown con slugs estables
  layouts/                      Layout, BlogLayout y GuideLayout
  templates/                    HTML de las plantillas descargables + estilos
  components/                   cabecera y piezas compartidas
scripts/
  generate-pdfs.mjs             genera los PDF de las plantillas
  generate-infographics.py
  request-indexing.py
blog-articles/                  fuente Markdown de los artículos
public/                         estáticos servidos tal cual
```

## Reglas de contenido que afectan al código

- **`BlogLayout` añade "| tuhr.es" al título; `GuideLayout` no.** Si se toca el SEO de una
  guía, el sufijo del título lo pone el layout, no la página.
- **Una guía canónica por tema.** Hay canibalización conocida entre despido, finiquito e
  indemnización: antes de crear una página nueva sobre lo mismo, se enlaza a la existente.
- **Las cifras legales llevan fecha.** Bases de cotización, SMI y tipos cambian cada año;
  una cifra sin año es un error, no una simplificación.

## Invariantes que no se rompen

- **La indemnización nunca supera el tope legal por causa** (`topeDiasDeCausa`).
- **Los meses se cuentan completos**: un mes que no se ha cumplido entero no suma
  (`mesesCompletos`).
- **La reforma de 2012 parte el cómputo en dos tramos** (`FECHA_REFORMA_2012`): 45 días por
  año antes y 33 después, con el tope correspondiente.
- **Los redondeos son a dos decimales** (`redondear2`) y se aplican al final, no en cada paso.

## Verificación

```bash
npm run check   # vitest run && astro build
```

El mismo comando corre en CI y en el hook `pre-push`.

`npx astro check` (typecheck de las plantillas `.astro`) **todavía no está en el pipeline**:
hoy devuelve 14 errores preexistentes de tipos en las páginas. Es deuda técnica conocida,
listada en `PROGRESS.md`; se incorporará al `check` cuando llegue a cero.
