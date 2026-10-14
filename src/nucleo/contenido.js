/* Estado del contenido de cada tema según src/contenido/PLAN.md (la fuente de verdad; temas.js la sigue):
   ✅ completo · 🟡 parcial · ⚪ próximamente. Sin DOM: también lo usa npm run revisar.
   Habilidad completa: mini explicación + ejemplo resuelto + ejemplo con huecos (salen de los pasos de su generador o de su lección)
   y ejercicios de al menos dos profundidades: básico y procedimiento (o de nivel superior).
   Tema completo: todas sus habilidades completas, ningún nodo "Próximamente" y al menos 1 reto de aplicación o escenario (retos.js). */
import {crear,GENERADORES,BANCOS} from './generadores/index.js';
import {retosDe} from './retos.js';

const cacheProf=new Map();
// Profundidades que aparecen en una habilidad (muestreo del generador en sus 5 niveles + lección + banco)
export function profundidadesDe(h){
  if(cacheProf.has(h)) return cacheProf.get(h);
  const s=new Set();
  if(h.gen&&GENERADORES[h.gen])for(let n=1;n<=5;n++)for(let i=0;i<4;i++){try{s.add(crear(h.gen,n,{semilla:i*131+n}).profundidad)}catch(e){}}
  for(const ej of (h.rondas||[]).flat())s.add(ej.profundidad||h.profundidad||'basico');
  if(h.banco&&BANCOS[h.banco])s.add(h.banco==='ciber/incidentes'?'escenario':'basico');
  cacheProf.set(h,s);return s;
}
export function revisarHabilidad(h){
  const g=h.gen&&GENERADORES[h.gen],p=profundidadesDe(h),faltan=[];
  if(!(h.explicacion?.length||g?.explicacion))faltan.push('mini explicación');
  if(!(g||h.ejemplos?.length))faltan.push('ejemplo resuelto');
  if(!g)faltan.push('ejemplo con huecos (necesita un generador con pasos)');
  if(!p.has('basico'))faltan.push('ejercicios básicos');
  if(![...p].some(x=>x!=='basico'))faltan.push('ejercicios de procedimiento');
  return {completa:!faltan.length,faltan,profundidades:[...p]};
}
export function estadoTema(m,t){
  const habs=(t.lecciones||[]),proximos=(t.nodos||[]).filter(n=>n.proximo).length,retos=retosDe(m.id,t.id);
  const revisadas=habs.map(h=>({h,...revisarHabilidad(h)})),completas=revisadas.filter(x=>x.completa).length;
  const estado=!habs.length?'proximo':!proximos&&completas===habs.length&&retos.some(r=>['aplicacion','escenario'].includes(r.profundidad))?'completo':'parcial';
  return {estado,habilidades:habs.length,completas,proximos,retos:retos.length,revisadas};
}
export const ESTADO={completo:{icono:'✅',texto:'Completo'},parcial:{icono:'🟡',texto:'En construcción'},proximo:{icono:'⚪',texto:'Próximamente'}};
