# DECISIONS

**Última actualización:** 2026-11-07

Solo decisiones que un agente necesita entender al entrar hoy. Lo demás está en `git log`.

## 2026-11-07 — `npm run check` como única puerta de verificación

**Decisión:** `npm run check` ejecuta `vitest run && astro build`, y es lo que llaman el CI y el hook `pre-push`.

**Por qué:** cada calculadora puede romper el build sin romper sus tests. Ejecutar los dos pasos en un solo comando evita el caso típico de "tests en verde, despliegue roto".

## 2026-11-07 — El typecheck de plantillas queda fuera del check, de momento

**Decisión:** `astro check` no forma parte de `npm run check` porque hoy devuelve 14 errores preexistentes.

**Por qué:** meterlo ahora bloquea todos los pushes por deuda antigua y empuja a saltarse el hook con `--no-verify`, que es peor que no tenerlo. Se incorporará en el mismo cambio que deje el typecheck en cero.

## 2026-11-07 — Los tests de cálculo usan euros legibles

**Decisión:** las pruebas fijan un salario anual de 36.500 € para que el salario diario sea 100 € y los días se puedan leer directamente en euros.

**Por qué:** cuando un test falla, un número en días no dice nada; en euros, se ve de un vistazo si el error está en el cómputo o en el tope.
