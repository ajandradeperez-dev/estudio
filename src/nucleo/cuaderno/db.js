/* Almacenamiento del cuaderno en IndexedDB ('ciberlab-notas'): localStorage no alcanza para fotos y dibujos.
   - notas:    {id, titulo, cuerpo, materia, tema, etiquetas:[], fijada, creada, editada (ms), origen?, origenFecha?}
               origen 'resumen:<materia>/<habilidad>' = copia de un resumen de "Mis notas" (progreso.notas)
   - archivos: {id, nota, blob, tipo, ancho, alto, creada}   fotos (JPEG comprimido) y dibujos (PNG)
   - materias: materias propias ("🎓 Mis materias", ver mias/esquema.js)   (desde la versión 2)
   - generados: bancos generados con IA por tema, id '<materia>/<tema>'    (desde la versión 2)
   Si IndexedDB no está disponible (modo privado estricto), todo vive en memoria mientras la app esté abierta.
   Al subir VERSION, onupgradeneeded solo agrega lo que falta: lo guardado se conserva. */
const NOMBRE='ciberlab-notas',VERSION=2;
let db=null;
const memoria={notas:new Map(),archivos:new Map(),materias:new Map(),generados:new Map()};
export let enMemoria=false;

function abrir(){
  if(db)return db;
  db=new Promise((res,rej)=>{
    try{
      const r=indexedDB.open(NOMBRE,VERSION);
      r.onupgradeneeded=()=>{const d=r.result;
        if(!d.objectStoreNames.contains('notas'))d.createObjectStore('notas',{keyPath:'id'});
        if(!d.objectStoreNames.contains('archivos'))d.createObjectStore('archivos',{keyPath:'id'}).createIndex('nota','nota');
        if(!d.objectStoreNames.contains('materias'))d.createObjectStore('materias',{keyPath:'id'});
        if(!d.objectStoreNames.contains('generados'))d.createObjectStore('generados',{keyPath:'id'});};
      r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onblocked=()=>rej(new Error('bloqueada'));
    }catch(e){rej(e)}
  }).catch(e=>{enMemoria=true;return null});
  return db;
}
// Una operación sobre un almacén; devuelve el resultado de la petición
async function op(almacen,modo,fn){
  const d=await abrir();
  if(!d)return fn(null,memoria[almacen]);
  return new Promise((res,rej)=>{
    const t=d.transaction(almacen,modo),s=t.objectStore(almacen);let out;
    const r=fn(s);if(r)r.onsuccess=()=>{out=r.result};
    t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('Se canceló al guardar'));
  });
}
const lista=m=>[...m.values()];
export const todasLasNotas=()=>op('notas','readonly',(s,m)=>s?s.getAll():lista(m));
export const leerNota=id=>op('notas','readonly',(s,m)=>s?s.get(id):m.get(id));
export const guardarNota=n=>op('notas','readwrite',(s,m)=>s?s.put(n):void m.set(n.id,n));
export const borrarNotaDb=id=>op('notas','readwrite',(s,m)=>s?s.delete(id):void m.delete(id));
export const leerArchivo=id=>op('archivos','readonly',(s,m)=>s?s.get(id):m.get(id));
export const guardarArchivo=a=>op('archivos','readwrite',(s,m)=>s?s.put(a):void m.set(a.id,a));
export const borrarArchivo=id=>op('archivos','readwrite',(s,m)=>s?s.delete(id):void m.delete(id));
export const todosLosArchivos=()=>op('archivos','readonly',(s,m)=>s?s.getAll():lista(m));
export const todasLasMaterias=()=>op('materias','readonly',(s,m)=>s?s.getAll():lista(m));
export const guardarMateriaDb=x=>op('materias','readwrite',(s,m)=>s?s.put(x):void m.set(x.id,x));
export const borrarMateriaDb=id=>op('materias','readwrite',(s,m)=>s?s.delete(id):void m.delete(id));
export const todosLosGenerados=()=>op('generados','readonly',(s,m)=>s?s.getAll():lista(m));
export const guardarGeneradoDb=x=>op('generados','readwrite',(s,m)=>s?s.put(x):void m.set(x.id,x));
export const borrarGeneradoDb=id=>op('generados','readwrite',(s,m)=>s?s.delete(id):void m.delete(id));
// Borra todo (antes de importar un respaldo)
export async function vaciar(){for(const a of ['notas','archivos','materias','generados'])await op(a,'readwrite',(s,m)=>s?s.clear():void m.clear())}

// Pide al navegador que no borre estos datos aunque falte espacio (Chrome lo concede a apps instaladas o muy usadas)
export async function pedirPersistencia(){
  try{if(!navigator.storage?.persist)return false;if(await navigator.storage.persisted())return true;return await navigator.storage.persist()}catch(e){return false}
}
export const nuevoId=()=>(crypto.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`).replace(/[^\w-]/g,'');
