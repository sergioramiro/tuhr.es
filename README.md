# tuhr.es

Herramientas laborales para trabajadores y autónomos en España. Calculadoras, plantillas de contratos, guías SEO y contenido de recursos humanos.

**Stack:** Astro 7 + Tailwind CSS 3 + Netlify
**Dominio:** tuhr.es
**Estado:** En desarrollo (semana 1/12)

## Estructura del proyecto

```
src/
├── layouts/Layout.astro          # Layout base con SEO, fonts, meta
├── pages/
│   ├── index.astro               # Home page
│   ├── calculadoras/             # Calculadoras laborales
│   ├── plantillas/               # Plantillas descargables
│   ├── guias/                    # Guías SEO
│   └── 404.astro                 # Página de error
├── styles/global.css             # Estilos base + Tailwind
└── components/                   # Componentes React (próximamente)
```

## Desarrollo

```bash
npm install
npm run dev        # Dev server
npm run build      # Build producción
npm run preview    # Preview build
```

## Roadmap

Ver el roadmap completo en el vault: `proyectos/tuhr-es/roadmap.md`

- **Semana 1:** Setup Astro + Netlify, estructura base, home page ✅
- **Semana 2:** 5 calculadoras funcionales (React)
- **Semana 3:** 10 plantillas con preview + descarga PDF
- **Semana 4:** 5 guías SEO (2.000+ palabras)
- **Semana 5:** Google Search Console + Umami + sitemap
- **Semanas 6-8:** Blog: 2 artículos/semana
- **Semanas 9-12:** Optimización SEO + link building

## SEO

- Sitemap automático via `@astrojs/sitemap`
- JSON-LD structured data en home
- Canonical URLs
- Open Graph + Twitter Cards
- Meta descriptions optimizadas
