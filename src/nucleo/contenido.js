/* Estado del contenido para la app: lo calcula npm run revisar con la «Definición de terminado» (nucleo/terminado.js) y lo
   deja en src/contenido/estado.json, para no tener que generar cientos de ejercicios al abrir una pantalla.
   ✅ completo · 🟡 en construcción · ⚪ próximamente · 🔧 solo herramientas. Cobertura del temario = habilidades ✅ / total del plan. */
import ESTADOS from '../contenido/estado.json';

export const ESTADO={completo:{icono:'✅',texto:'Completo'},parcial:{icono:'🟡',texto:'En construcción'},proximo:{icono:'⚪',texto:'Próximamente'},herramientas:{icono:'🔧',texto:'Herramientas'}};
const vacio={estado:'parcial',cobertura:{completas:0,total:0,pct:0},temas:{},habilidades:{}};
export const estadoMateria=mid=>ESTADOS.materias?.[mid]||vacio;
// Estado de un tema: {estado, completas, total, faltan}
export function estadoTema(m,t){
  const e=estadoMateria(m.id).temas[t.id];
  if(e)return e;
  const habs=t.lecciones?.length||0,prox=(t.nodos||[]).filter(n=>n.proximo).length;
  return {estado:!habs&&!prox?'herramientas':!habs?'proximo':'parcial',completas:0,total:habs+prox,faltan:[]};
}
// Estado de una habilidad: {estado:'completa'|'parcial', faltan}
export const estadoHabilidad=(mid,hid)=>estadoMateria(mid).habilidades[hid]||{estado:'parcial',faltan:[]};
export const cobertura=mid=>estadoMateria(mid).cobertura;
// "Cobertura del temario: X %" con su barra
export const textoCobertura=c=>`Cobertura del temario: ${c.pct} % (${c.completas} de ${c.total} habilidades ✅)`;
