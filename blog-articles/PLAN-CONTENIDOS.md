---
title: Plan de contenidos blog tuhr.es
created: 2026-09-14
updated: 2026-11-02
status: active
source_of_truth: "Obsidian/Cerebro/proyectos/calendario-contenido-tuhr.md"
---

# Plan de contenidos — tuhr.es

> **Reescrito el 02/11/2026.** El cron llevaba tres semanas generando contra un calendario
> que ya no era el real y acumuló once piezas escritas sin página publicada. El calendario
> bueno —el que elige keywords con datos de GSC— vive en
> `~/Obsidian/Cerebro/proyectos/calendario-contenido-tuhr.md`. Si los dos discrepan, gana el
> de Obsidian y este fichero se actualiza en la misma sesión.

## Estado real a 02/11/2026

- **Publicadas: 18 piezas.** Las cuatro últimas salieron el 26-27/10 del backlog que llevaba
  semanas parado: convenio colectivo, baja por maternidad y paternidad, contrato temporal y
  ERTE sin cobrar.
- **Bloqueadas a propósito: 2.** `18-calculadora-erte` y `20-calculadora-vacaciones`. Su
  canonical apunta a `/calculadoras/erte/` y `/calculadoras/vacaciones/`, que no existen.
  **No se publican hasta que exista la herramienta**: publicarlas manda a Google a un 404 y
  promete al lector algo que no puede usar.
- **Descartada: 1.** `descartados/10-despido-procedente-improcedente.md` duplicaba
  `/blog/despido-improcedente/`, ya publicado. Se conserva como material de partida.

## Reglas para el agente (además de las de estilo)

1. **Comprobar que el tema no está cubierto antes de escribir.** Buscar la keyword y sus
   sinónimos en `src/pages/` y en `blog-articles/`. Si ya hay una URL que responde a esa
   intención, no se escribe otra pieza: se mejora la existente. Los clusters de despido,
   finiquito e indemnización ya tienen canibalización medida en GSC.
2. **Enlaces internos solo a URLs que existan.** Antes de commitear, validar cada
   `](/ruta/)` contra `src/pages/`. Se corrigieron cuatro enlaces rotos que apuntaban a slugs
   que nunca se crearon: `/blog/smi-2026-salario-minimo/`,
   `/blog/baja-medica-cuanto-cobras-derechos/`, `/blog/permisos-laborales-retribuidos-espana/`
   y `/blog/autonomo-vs-cuenta-ajena/`.
3. **Escribir el markdown no publica nada.** Cada artículo necesita su
   `src/pages/blog/<slug>/index.astro` que lea el md, más su entrada en
   `src/pages/blog/index.astro`. Sin eso el trabajo se queda en el cajón, que es lo que pasó
   con once piezas.
4. **El canonical apunta a la URL real**, nunca a una herramienta que aún no existe.
5. **Fechas coherentes:** `datePublished` igual al día real de publicación y el "Última
   actualización" del cuerpo en el mismo mes.

## Semanas próximas

### Semana 5 (3-7 nov)
- [x] 📝 **Convenio colectivo** — publicado el 26/10 en `/blog/convenio-colectivo-guia/`.
- [ ] ⬜ **Hueco libre.** "Horas extra: cuánto cobras" se cae: ya lo cubren
  `/blog/horas-extraordinarias-espana/` y `/calculadoras/horas-extra/`. Candidato natural
  para ocuparlo: el editorial del cluster ERTE en cuanto exista `/calculadoras/erte/`.

### Semana 6 (10-14 nov)
- [ ] 📝 **Autónomo vs asalariado (actualizado)** — ya existe `/blog/autonomo-vs-ajena/`.
  Es **actualización de esa pieza**, no un artículo nuevo.
- [ ] 📝 **Contrato temporal vs indefinido** — ojo: `/blog/contrato-temporal-reforma-laboral/`
  se publicó el 26/10 y ya cubre tipos, duración e indemnización. Solo tiene sentido si el
  ángulo es la comparación directa y la pieza publicada queda como madre del cluster.

### Semana 7 (1-5 dic)
- [ ] 🔧 **Calculadora de jubilación** — keyword: "calcular jubilación".
- [ ] 📝 **Subsidio por desempleo 2026** — keyword: "subsidio desempleo".

## Herramientas pendientes (desbloquean contenido parado)

| Herramienta | Ruta | Desbloquea |
|---|---|---|
| Calculadora de ERTE | `/calculadoras/erte/` | artículo 18 |
| Calculadora de vacaciones | `/calculadoras/vacaciones/` | artículo 20 |

Las dos pueden construirse reutilizando la lógica de `/calculadoras/paro/` y
`/calculadoras/finiquito/`. Mientras no existan, esos artículos no se tocan.

## Estilo

2.000-2.500 palabras · frontmatter YAML completo (title, slug, description, date, author
"tuhr.es", category, tags, canonical) · H2 y H3 · al menos un enlace a calculadora y otro a
guía o plantilla · tabla o lista práctica · CTA a herramientas · español de España, cercano y
profesional.

Commit por pieza: `feat(blog): artículo N — [título corto]`.
