# PROGRESS

**Última actualización:** 2026-11-07

Sitio en producción con 42 páginas y datos de Search Console desde septiembre de 2026.

## Hecho

- Calculadoras de finiquito, indemnización por despido, nómina, pagas extras y baja médica, con tests de la lógica de indemnización (19 casos).
- Guías SEO de finiquito, despido, nómina, antigüedad y contratos de arrendamiento.
- Plantillas legales descargables en HTML y PDF.
- Canibalización identificada entre despido, finiquito e indemnización (documentada en Search Console).
- Verificación automatizada: Vitest + build en CI y en hook `pre-push` (2026-11-07).

## En progreso

- Reducir la canibalización: una guía canónica por tema y enlazado interno hacia ella.

## Bloqueado / deuda conocida

- **`npx astro check` devuelve 14 errores de tipos** en páginas `.astro` (por ejemplo `className` en `div` dentro de `src/pages/plantillas/trabajo-temporal/index.astro`). Mientras no llegue a cero, el typecheck no entra en `npm run check`.
- Cobertura de tests limitada a indemnización: despido, finiquito, nómina, pagas y baja médica no tienen tests propios.

## Próximos pasos

1. Arreglar los 14 errores de `astro check` y añadirlo al comando `check`.
2. Tests de `despido.ts` y `finiquito.ts` con casos reales y referencia legal.
3. Revisar en Search Console las páginas con impresiones y cero clics.
