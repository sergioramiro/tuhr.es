# Contribuir

Proyecto personal de un solo mantenedor, con reglas fijas para que una persona o un
agente pueda trabajar sin preguntar.

## Antes de tocar nada

```bash
npm ci          # dependencias exactas del lockfile
npm run check   # tests + build
```

## Flujo

1. Rama desde `main`, nunca commit directo.
2. Un cambio por rama, con mensaje en castellano y prefijo (`feat:`, `fix:`, `chore:`, `content:`).
3. `npm run check` en verde antes de commitear. El hook `pre-push` lo repite y bloquea si falla.
4. Pull request con la plantilla: qué cambia, por qué y la salida real de la verificación.

## Reglas de contenido y cálculo

- **Una cifra legal sin año es un error.** Bases de cotización, SMI y tipos cambian cada ejercicio.
- **Un cálculo nuevo necesita test y referencia legal.** El test va antes que la página.
- **Una guía canónica por tema.** Antes de crear una página sobre despido, finiquito o indemnización, mira si ya existe y enlaza.
- Castellano natural de España. Sin anglicismos evitables.

## Deuda conocida

`npx astro check` devuelve 14 errores de tipos en páginas `.astro`. No está en `npm run check` para no bloquear los pushes; ver `PROGRESS.md`. Si tocas una de esas páginas, arregla su error de tipos.

## Qué no se toca sin hablar antes

- `astro.config.mjs`, `netlify.toml` y el dominio.
- La estructura de URLs publicadas: rompe el SEO y los enlaces entrantes.
