/* Ejecutar Python en el navegador (worker.js con Pyodide). Sin claves ni servidor: todo corre en el teléfono.
   cargarPython()                      → promesa: descarga e inicia Python (la primera vez tarda; luego sale de la caché)
   ejecutar(codigo, {entrada, limite}) → {salida, error?:{tipo, mensaje}, detenido?}
   detener()                           → termina el worker (bucle infinito o botón «Detener») y el siguiente se crea de nuevo
   estadoPython()                      → 'sin-cargar' | 'cargando' | 'listo' | 'error' */
let w=null,seq=0,carga=null,estado='sin-cargar';
const pend=new Map();
const avisar=()=>document.dispatchEvent(new CustomEvent('python-estado',{detail:estado}));
function crear(){
  w=new Worker(new URL('./worker.js',import.meta.url));
  w.onmessage=e=>{const p=pend.get(e.data?.id);if(p){pend.delete(e.data.id);p(e.data)}};
  w.onerror=e=>{for(const p of pend.values())p({error:{tipo:'Carga',mensaje:e.message||'No se pudo iniciar Python.'}});pend.clear()};
}
const enviar=msg=>new Promise(res=>{if(!w)crear();const id=++seq;pend.set(id,res);w.postMessage({...msg,id})});
export const estadoPython=()=>estado;
export function cargarPython(){
  if(!carga){estado='cargando';avisar();
    carga=enviar({tipo:'cargar'}).then(r=>{if(r.error){estado='error';carga=null;avisar();throw r.error}estado='listo';avisar();return r});}
  return carga;
}
export function detener(){
  if(w){w.terminate();w=null}
  for(const p of pend.values())p({detenido:true,salida:'',error:{tipo:'Detenido',mensaje:'Detuviste el programa.'}});
  pend.clear();carga=null;estado='sin-cargar';avisar();
}
// limite (ms) cuenta desde que Python ya está cargado: así la primera descarga no se confunde con un bucle infinito
export async function ejecutar(codigo,{entrada=[],limite=6000}={}){
  try{await cargarPython()}catch(e){return {salida:'',error:e}}
  return new Promise(res=>{
    const t=setTimeout(()=>{detener();res({salida:'',detenido:true,error:{tipo:'Tiempo',mensaje:`El programa siguió corriendo más de ${limite/1000} s.`}})},limite);
    enviar({tipo:'correr',codigo,entrada}).then(r=>{clearTimeout(t);res(r)});
  });
}
