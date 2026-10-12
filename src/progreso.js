/* Progreso del usuario guardado en este navegador (localStorage).
   Si el almacenamiento no está disponible (modo privado, bloqueado), la app funciona igual sin guardar nada.
   Los casos se guardan por posición en datos/incidentes.js: si se reordenan, el progreso guardado se desfasa. */
const CLAVE='ciberlab-progreso';
const vacio=()=>({visitadas:[],casos:[],examen:null});

export function progreso(){
  try{
    const p=JSON.parse(localStorage.getItem(CLAVE));
    if(p&&typeof p==='object')return {
      visitadas:Array.isArray(p.visitadas)?p.visitadas:[],
      casos:Array.isArray(p.casos)?p.casos:[],
      examen:p.examen&&typeof p.examen.aciertos==='number'&&p.examen.total>0?p.examen:null};
  }catch(e){}
  return vacio();
}
function guardar(p){try{localStorage.setItem(CLAVE,JSON.stringify(p))}catch(e){}}

export function marcarVisita(s){const p=progreso();if(!p.visitadas.includes(s)){p.visitadas.push(s);guardar(p)}}
export function marcarCaso(i){const p=progreso();if(!p.casos.includes(i)){p.casos.push(i);guardar(p)}}
// Se queda con el mejor porcentaje, por si cambia el número de preguntas
export function registrarExamen(aciertos,total){const p=progreso(),e=p.examen;if(!e||aciertos/total>e.aciertos/e.total){p.examen={aciertos,total};guardar(p)}}
export function reiniciarProgreso(){guardar(vacio())}
