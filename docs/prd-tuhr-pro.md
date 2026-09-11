---
title: PRD — tuhr.es/plataforma (tuhr.pro)
version: 1.0
date: 2026-09-11
status: Draft
---

# PRD — tuhr.es/plataforma

## Problema

Los autónomos y pymes en España necesitan generar documentos laborales (contratos, cartas) con frecuencia. Hoy deben: buscar una plantilla → descargarla → abrirla en Word → rellenarla a mano → guardarla → subirla a una plataforma de firma → enviarla. Cada paso es fricción, y el resultado a menudo se ve poco profesional.

Las alternativas existentes (Signaturit, Rocket Lawyer) son genéricas — no están especializadas en derecho laboral español y no ofrecen un flujo cerrado desde la generación hasta la firma.

## Solución

Una plataforma integrada en tuhr.es donde el usuario puede:
1. Elegir una plantilla laboral especializada
2. Rellenar campos en un editor visual en el navegador
3. Generar un PDF profesional con un clic
4. Guardar documentos en su cuenta
5. (Pro) Enviar a firma digital directamente desde la plataforma

El usuario llega por contenido SEO (artículos, calculadoras), prueba la plataforma gratis, y escala a Pro cuando necesita más plantillas o firma digital.

## Arquitectura

**tuhr.es (sitio actual — sin cambios)**
- Stack: Astro + Tailwind + Netlify
- Contenido: artículos del blog, guías, calculadoras, plantillas descargables (PDF vacío)
- Función: captación vía SEO, embudo de tráfico

**tuhr.es/pro (nueva aplicación)**
- Stack: Next.js + Clerk + Supabase + Puppeteer + Resend + Stripe
- Hosting: Coolify en Hetzner VPS (~5€/mes)
- Función: plataforma de documentos con editor, guardado y firma digital

## Historias de Usuario

### Fase 1 — MVP (editor + PDF)

> Como **autónomo**, quiero **elegir una plantilla de contrato de prestación de servicios** para que **pueda generarlolaboral sin buscar en Google**.

> Como **autónomo**, quiero **ver una preview de la plantilla antes de registrarme** para que **sepa exactamente qué voy a obtener**.

> Como **autónomo**, quiero **rellenar 6 campos obligatorios y 4 opcionales en un editor visual** para que **mi contrato esté listo en 2 minutos**.

> Como **autónomo**, quiero **generar y descargar un PDF profesional con mi contrato rellenado** para que **se vea serio y esté listo para enviar**.

> Como **usuario registrado**, quiero **guardar mis documentos en mi cuenta** para que **pueda volver a ellos más tarde**.

> Como **usuario registrado**, quiero **editar un documento guardado** para que **pueda corregir errores sin empezar de cero**.

> Como **usuario registrado**, quiero **eliminar un documento** para que **mantenga mi cuenta ordenada**.

> Como **usuario free**, quiero **tener acceso a 2-3 plantillas y guardar 1 documento** para que **pueda probar la plataforma sin pagar**.

> Como **usuario free**, quiero **que me pidan upgrade a Pro cuando intente usar más plantillas o guardar más documentos** para que **sepa que la opción existe**.

> Como **visitante**, quiero **descargar una plantilla vacía sin registrarme** para que **pueda rellenarla en mi PC si no quiero usar la plataforma**.

### Fase 2 — Pro (firma digital + más plantillas)

> Como **usuario Pro**, quiero **enviar un contrato a firmar digitalmente a través de Signaturit** para que **todo el flujo quede centrado en tuhr.es**.

> Como **usuario Pro**, quiero **recibir una notificación cuando la otra parte firme** para que **sepa que el contrato está cerrado**.

> Como **usuario Pro**, quiero **tener 10 firmas digitales incluidas al mes** para que **no me preocupe por costes extra**.

> Como **usuario Pro**, quiero **comprar firmas extra a 1,50€/firma** si necesito más, para que **solo pague por lo que uso**.

> Como **usuario Pro**, quiero **acceder a todas las plantillas (contrato trabajo indefinido, temporal, arrendamiento, cartas)** para que **tenga cubiertas todas mis necesidades laborales**.

> Como **usuario Pro**, quiero **añadir campos personalizados a un contrato** para que **pueda adaptar la plantilla a mi caso específico**.

## Decisiones de Implementación

### Arquitectura técnica

- **Frontend tuhr.es/pro:** Next.js (React) desplegado en Coolify
- **Auth:** Clerk (login/registro con UI pre-hecha, gratis hasta 10K usuarios)
- **DB + Storage:** Supabase (PostgreSQL + almacenamiento de PDFs, gratis hasta 500MB DB + 1GB storage)
- **PDF:** Puppeteer en el mismo VPS (renderiza HTML → PDF con calidad profesional)
- **Emails:** Resend (transaccionales: bienvenida, firma, notificaciones, gratis hasta 3K emails)
- **Pagos:** Stripe (suscripciones Pro, 3,5% + 0,25€ por transacción)
- **Hosting:** Coolify en Hetzner VPS (4GB RAM, ~5€/mes)

### Campos del contrato de prestación de servicios

**Obligatorios (6):**
1. Nombre del prestador (autónomo)
2. Nombre del cliente (empresa)
3. Objeto del contrato (descripción del servicio)
4. Duración del contrato
5. Precio y forma de pago
6. Condiciones de cancelación

**Opcionales con toggle (4):**
7. Horario y lugar de trabajo
8. Cláusula de confidencialidad
9. Propiedad intelectual
10. Periodo de prueba

### Flujo del usuario

1. Visitante llega a tuhr.es por SEO (artículo o guía)
2. Hace click en "Crea tu contrato" → le lleva a tuhr.es/pro
3. Ve la preview del contrato vacío con los campos marcados
4. Hace click en "Rellenar" → abre el editor
5. Rellena los campos (obligatorios + opcionales que quiera)
6. Hace click en "Generar PDF" → le pide registro (Clerk)
7. Se registra (gratis) → se genera el PDF
8. Puede descargar o guardar en su cuenta
9. Si quiere más plantillas o firma digital → upgrade a Pro

### Modelo de negocio y pricing

**Free:**
- 2-3 plantillas (contrato prestación de servicios + 1-2 cartas)
- 1 documento guardado a la vez
- Sin firma digital
- PDF descargable

**Pro — 9,90€/mes:**
- Todas las plantillas (contratos + cartas)
- Documentos guardados ilimitados
- 10 firmas digitales incluidas al mes
- Firmas extra: 1,50€/firma
- Campos personalizados

**Márgenes estimados:**
- Coste firma (Signaturit): ~1,25€/firma
- 10 firmas × 1,25€ = 12,50€ coste vs 9,90€ ingreso → Loss en heavy users
- Pero: 70% de usuarios firman 1-3 documentos/mes → ganancia neta
- El tope de 10 firmas protege contra abuso
- Margen bruto promedio esperado: ~65-70%

### Adquisición de usuarios

- Orgánico vía SEO (artículos del blog como embudo)
- CTA en cada artículo: "Genera tu contrato ahora"
- Plantillas descargables gratuitas como trampa de captación de emails
- Sin inversión en publicidad pagada en fase inicial

### Costes mensuales estimados (arranque)

| Servicio | Coste |
|---|---|
| Hetzner VPS (Coolify) | ~5€/mes |
| Clerk | Gratis (hasta 10K users) |
| Supabase | Gratis (hasta 500MB) |
| Resend | Gratis (hasta 3K emails) |
| Stripe | Solo comisión por transacción |
| **Total fijo** | **~5€/mes** |

## Fuera de Alcance — Fase 1

Las siguientes funcionalidades quedan excluidas del MVP:
- Firma digital (va en Fase 2)
- Más plantillas de las iniciales (van en Fase 2)
- Campos personalizados ilimitados (va en Fase 2)
- App móvil
- Multi-idioma
- Asesoría legal integrada
- Generación de contratos con IA
- API pública
- Plan enterprise

## Notas Adicionales

- El dominio tuhr.es ya está configurado en Netlify con DNS apuntando desde DonDominio
- Umami Analytics ya está integrado para tracking
- Google Search Console ya está verificado
- El blog tiene 6 artículos SEO activos generando tráfico
- La migración de Astro a Next.js NO aplica — tuhr.es sigue en Astro, solo tuhr.es/pro usa Next.js
