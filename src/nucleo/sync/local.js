/* Datos locales de la sincronización (sin DOM):
   - identificador de este equipo ('ciberlab-equipo', distinto del anónimo de las votaciones para no ligar votos a una cuenta);
   - lápidas de lo borrado ('ciberlab-borradas' {id: fecha ms}): notas, materias propias y lo generado con IA. Viajan en el
     respaldo y a la nube para que un borrado no «resucite» al combinar. Se olvidan a los 180 días. */
const EQUIPO='ciberlab-equipo',BORRADAS='ciberlab-borradas',VIDA=180*864e5;
const uuid=()=>globalThis.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g,()=>(Math.random()*16|0).toString(16));
let equipo=null;
export function miEquipo(){
  if(equipo)return equipo;
  try{equipo=localStorage.getItem(EQUIPO)}catch(e){}
  if(!equipo){equipo=uuid();try{localStorage.setItem(EQUIPO,equipo)}catch(e){}}
  return equipo;
}
export function lapidas(){
  let x={};try{x=JSON.parse(localStorage.getItem(BORRADAS))||{}}catch(e){}
  const corte=Date.now()-VIDA;for(const k of Object.keys(x))if(!(x[k]>corte))delete x[k];
  return x;
}
const guardar=x=>{try{localStorage.setItem(BORRADAS,JSON.stringify(x))}catch(e){}};
export function marcarBorradas(ids,cuando=Date.now()){if(!ids.length)return;const x=lapidas();for(const id of ids)x[id]=cuando;guardar(x);avisarCambio()}
export function quitarLapidas(ids){const x=lapidas();let c=false;for(const id of ids)if(id in x){delete x[id];c=true}if(c)guardar(x)}
export function ponerLapidas(x){guardar({...x})}
// La sincronización escucha esto para subir los cambios (con espera)
export function avisarCambio(tipo='datos'){try{globalThis.dispatchEvent?.(new CustomEvent('datos-cambiaron',{detail:tipo}))}catch(e){}}
