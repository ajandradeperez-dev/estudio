/* Reglas del método de aprendizaje (ver "Método de aprendizaje" en CLAUDE.md).
   Sin dependencias: lo usan la app y scripts/revisar-contenido.mjs. */

export const DOMINIO=0.8;          // aciertos sin pista para dar una lección por aprendida
export const MIN_PRODUCCION=0.7;   // proporción mínima de ejercicios de producción en cada ronda
export const MAX_PALABRAS=150;     // palabras máximas de la explicación de una lección
export const UBICACION_MIN=10,UBICACION_MAX=15;

// Producción = el usuario escribe la respuesta (completar, traducir, resolver)
export const esProduccion=ej=>ej.tipo==='completar';

// Todos los ejercicios de una lección en orden; su posición es la que se guarda en el repaso
export const ejerciciosLeccion=l=>(l.rondas||[]).flat();
// Posición global del ejercicio i de la ronda r
export const indiceGlobal=(l,r,i)=>l.rondas.slice(0,r).reduce((s,x)=>s+x.length,0)+i;

// Cuántas preguntas del examen de ubicación salen de cada lección: entre 10 y 15 en total,
// repartidas lo más parejo posible y dando el sobrante a las primeras (las más útiles).
export function repartoUbicacion(n){
  if(!n)return [];
  const total=Math.min(UBICACION_MAX,Math.max(UBICACION_MIN,2*n)),base=Math.floor(total/n),resto=total%n;
  return Array.from({length:n},(_,i)=>base+(i<resto?1:0));
}
// Preguntas de ubicación de una lección: las de producción de la última ronda, para que la práctica empiece con ejercicios nuevos
export function preguntasUbicacion(l,k){
  const r=l.rondas.length-1;
  return l.rondas[r].map((ej,i)=>({ej,indice:indiceGlobal(l,r,i)})).filter(x=>esProduccion(x.ej)).slice(0,k);
}

// Palabras de un texto HTML (sin etiquetas)
export const palabras=html=>String(html).replace(/<[^>]+>/g,' ').split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
// Frases de un resumen escrito por el usuario
export const frases=t=>String(t).split(/[.!?]+(?:\s|$)/).map(s=>s.trim()).filter(s=>s.length>1).length;
