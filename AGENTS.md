## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project conventions

- Language: Spanish (all content, comments, commit messages)
- Stack: Astro 7 + Tailwind CSS 3 + React (for interactive components)
- Hosting: Netlify (static)
- Font: Plus Jakarta Sans (Google Fonts, preloaded)
- Color scheme: Green primary (#0e7c46) — professional, trustworthy
- Naming: Spanish lowercase with hyphens for file/folder names
- Pages: `src/pages/<seccion>/<slug>/index.astro`

## Key files

- `tailwind.config.mjs` — Design tokens (colors, spacing, typography)
- `src/layouts/Layout.astro` — Base layout with SEO, fonts, meta tags
- `src/styles/global.css` — Base styles + Tailwind layers
