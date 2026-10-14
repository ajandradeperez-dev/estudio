/* Registro de generadores de ejercicios y bancos (sin DOM: también los usa npm run revisar).
   GENERADORES['<materia corta>/<habilidad>'] = {titulo, generar(nivel 1–5, rng) → pregunta}
   BANCOS['<id>'] = () → [preguntas]   (ejercicios fijos que no se pueden generar, p. ej. casos narrativos)
   Ver "Escribir un generador" en CLAUDE.md. */
export const GENERADORES={};
export const BANCOS={};
