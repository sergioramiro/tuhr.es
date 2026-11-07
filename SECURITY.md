# Política de seguridad

Sitio estático (Astro → Netlify) sin backend ni base de datos. El riesgo real está en
dependencias, en el contenido inyectado y en la cadena de despliegue.

## Cómo reportar

Usa el **aviso privado de vulnerabilidades de GitHub** en este repositorio
(pestaña *Security* → *Report a vulnerability*). No abras un issue público con el detalle.

## Qué entra

- Dependencias con vulnerabilidades conocidas que afecten al build o al sitio publicado.
- XSS o inyección en el renderizado de Markdown (`marked`) o en parámetros de URL.
- Exposición de secretos en el repositorio o en el historial de git.
- Cálculos que devuelvan importes erróneos de forma explotable (por ejemplo, manipulación
  de parámetros que altere una indemnización sin pasar por las validaciones).

## Qué no entra

- Falta de cabeceras de seguridad en Netlify: se gestionan en el panel, no en este repo.
- Ataques de denegación de servicio: los absorbe el CDN.
- Errores de contenido editorial: eso va por issue normal.

## Compromiso

Proyecto personal, sin SLA. Se revisa y se responde lo antes posible, con prioridad a
cualquier cosa que afecte a datos de usuarios.
