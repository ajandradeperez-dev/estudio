/* Reglas del método de aprendizaje (ver src/nucleo/METODO.md y "Método de aprendizaje" en CLAUDE.md).
   Sin dependencias: lo usan la app y scripts/revisar-contenido.mjs. */

export const DOMINIO=0.8;          // aciertos sin pista para dar algo por aprendido
export const ULTIMAS=10;           // dominio de una habilidad: DOMINIO de las últimas ULTIMAS respuestas…
export const DIAS_DOMINIO=2;       // …y práctica en al menos DIAS_DOMINIO días distintos
export const MIN_PRODUCCION=0.7;   // proporción mínima de ejercicios de producción en cada ronda
export const MAX_PALABRAS=150;     // palabras máximas de la explicación de una lección
export const UBICACION_MIN=10,UBICACION_MAX=15;
export const SESION=8;             // ejercicios por sesión (5–10 minutos)
export const OBJETIVO=0.85;        // acierto buscado: la dificultad se ajusta para quedarse cerca

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
  if(!l.rondas?.length)return [];
  const r=l.rondas.length-1;
  return l.rondas[r].map((ej,i)=>({ej,indice:indiceGlobal(l,r,i)})).filter(x=>esProduccion(x.ej)).slice(0,k);
}

// Palabras de un texto HTML (sin etiquetas)
export const palabras=html=>String(html).replace(/<[^>]+>/g,' ').split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
// Frases de un resumen escrito por el usuario
export const frases=t=>String(t).split(/[.!?]+(?:\s|$)/).map(s=>s.trim()).filter(s=>s.length>1).length;

/* ---------- dominio de una habilidad ---------- */
// ult: últimas respuestas (1 = bien sin pista); dias: días distintos en que se practicó
export function estadoDominio({ult=[],dias=[]}={}){
  const r=ult.slice(-ULTIMAS),ok=r.reduce((a,b)=>a+b,0);
  return {ok,n:r.length,dias:new Set(dias).size,dominada:r.length>=ULTIMAS&&ok/ULTIMAS>=DOMINIO&&new Set(dias).size>=DIAS_DOMINIO};
}

/* ---------- dificultad adaptativa (tipo Elo, de 1 a 5) ---------- */
// Acierto rápido sin pista sube más; con pista baja un poco; un error baja bastante (y el siguiente es más fácil).
// Con +0,1 por acierto y −0,5 por error el equilibrio queda en ~83–85 % de aciertos (OBJETIVO).
export function nuevoRating(r=1,{correcto,pista,rapido}){
  const d=!correcto?-0.5:pista?-0.1:rapido?0.15:0.1;
  return Math.round(Math.min(5,Math.max(1,r+d))*100)/100;
}
export const nivelDe=r=>Math.min(5,Math.max(1,Math.round(r||1)));

/* ---------- repetición espaciada SM-2 ---------- */
// Calidad del recuerdo (0–5): 0 fallo · 3 bien con pista · 4 bien · 5 bien y rápido
export const calidad=({correcto,pista,rapido})=>!correcto?0:pista?3:rapido?5:4;
// Siguiente repaso de un ítem {rep, int, ef}: si se falla vuelve mañana; si se acierta el intervalo crece (1, 3 y luego × facilidad)
export function sm2({rep=0,int=0,ef=2.5}={},q){
  if(q<3)return {rep:0,int:1,ef:Math.max(1.3,ef-0.2)};
  const nrep=rep+1,nint=nrep===1?1:nrep===2?3:Math.round(int*ef);
  return {rep:nrep,int:nint,ef:Math.max(1.3,Math.round((ef+0.1-(5-q)*(0.08+(5-q)*0.02))*100)/100)};
}
// Un ejercicio sale del repaso cuando ya se recuerda a más de 2 meses (las habilidades se siguen repasando, con tope de 6 meses)
export const SALE_DEL_REPASO=60,TOPE_HABILIDAD=180;
// Esquema anterior (1, 3, 7, 14 y 30 días) → SM-2: 'paso' aciertos seguidos equivalen a ese intervalo
export const INTERVALOS_V6=[0,1,3,7,14,30];
