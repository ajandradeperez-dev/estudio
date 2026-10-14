# Método de estudio de Estudio+

Cómo enseña la app y por qué. Las constantes viven en `src/nucleo/metodo.js`; el motor, en `habilidad.js` (práctica de una habilidad), `actividades.js` (tipos de actividad), `practica.js` (de dónde salen las preguntas), `repaso.js` (repetición espaciada) y `camino.js` (cofres, jefes y desbloqueo).

## 1. Práctica de recuperación
Recordar fortalece la memoria más que releer. Casi todo es **producir** la respuesta: escribir, calcular, ordenar, decir en voz alta. La opción múltiple solo **introduce** una habilidad nueva (la primera pregunta) y no cuenta para el dominio.

## 2. Repetición espaciada (SM-2)
Cada ejercicio fallado y cada habilidad dominada tienen su próxima fecha según qué tan bien la recordaste:

| Calidad | Cuándo | Efecto |
|---|---|---|
| 0 | Fallo | Vuelve mañana y empieza de nuevo |
| 3 | Bien con pista | El intervalo crece poco |
| 4 | Bien | Crece (1 día, 3 días y luego × facilidad) |
| 5 | Bien y rápido | Crece más |

Un ejercicio sale del repaso cuando ya lo recuerdas a más de 2 meses. Las habilidades dominadas se siguen repasando (tope de 6 meses). El esquema anterior (1-3-7-14-30) se migró en el progreso v7 conservando las fechas.

## 3. Intercalado
El repaso mezcla materias y habilidades. Cada 3 habilidades del camino hay un **cofre**: un repaso mezclado de esas tres. Al final de cada tema, el **jefe** mezcla todo el tema con tiempo. Mezclar cuesta un poco más, pero se recuerda mejor y se aprende a elegir qué regla usar.

## 4. Ejemplos con desvanecimiento
En una habilidad nueva: primero un **ejemplo resuelto** (solo se lee), luego uno **con hueco** (completas el último paso) y después ejercicios **solos**.

## 5. Dominio
Una habilidad está dominada con **≥ 80 % de las últimas 10 respuestas sin pista** y práctica en **al menos 2 días distintos** (lo aprendido en un solo día se olvida rápido). El examen de ubicación puede marcar habilidades como dominadas para no estudiar lo que ya sabes.

## 6. Feedback elaborado inmediato
Cada error muestra la respuesta correcta, **por qué** está mal, el **error típico** detectado (signo olvidado, confundir /24 con /16, olvidar la -s…) y la **regla**, con la solución paso a paso a mano.

## 7. Dificultad deseable adaptativa
Cada habilidad tiene una dificultad de 1 a 5 (rating tipo Elo): un acierto rápido sin pista la sube, un error la baja y el siguiente ejercicio es **más fácil y del mismo tipo**. Con +0,1 por acierto y −0,5 por error, el acierto se estabiliza cerca del **85 %**, la zona donde más se aprende. Se ve como 1–5 puntos.

## 8. Autoexplicación
Una vez por sesión, tras un acierto, la app pregunta **"¿por qué?"**: elegir la regla que lo explica entre la de esta habilidad y las de otras. No cuenta para el dominio.

## 9. Sesiones cortas
Cada sesión tiene 8 preguntas (5–10 minutos). La meta diaria y la racha premian la constancia; la pestaña Repasar muestra cuántos repasos tocan hoy.

## También
Ubicación inicial, "Mis notas" (al dominar una habilidad se pide un resumen de 1–2 frases), Hablar con su misión diaria y el recomendador "👉 Lo siguiente para ti" siguen igual.
