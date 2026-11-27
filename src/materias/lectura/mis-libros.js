/* 🔒 Mis libros · almacenamiento (PROMPT-MIS-LIBROS). Los libros importados son PRIVADOS y LOCALES:
   - viven en su propia base IndexedDB 'ciberlab-mis-libros' (libros, capítulos comprimidos con gzip e imágenes), así que
     la sincronización con Supabase y el respaldo .estudio no los ven (el respaldo solo los incluye si se marca la casilla);
   - el avance (capítulos leídos, último capítulo) va en localStorage 'ciberlab-mis-libros-avance', no en el progreso que
     se sincroniza;
   - nunca van al repositorio, al APK, a dist/ ni a GitHub Pages: solo existen en este dispositivo.
   Libro: {id:'mio-…', propio:true, titulo, autor, idioma, descripcion, icono, color, generos, dificultad, licencia:'🔒 Solo
   para mí', formato, portada:<id de imagen>|null, capitulos:[{n, titulo, palabras}], bytes, creado}. */
const NOMBRE='ciberlab-mis-libros',VERSION=1;
let base=null;
function abrir(){
  if(base)return base;
  base=new Promise((res,rej)=>{const r=indexedDB.open(NOMBRE,VERSION);
    r.onupgradeneeded=()=>{const d=r.result;for(const s of ['libros','capitulos','imagenes'])if(!d.objectStoreNames.contains(s))d.createObjectStore(s,{keyPath:'id'})};
    r.onsuccess=()=>res(r.result);r.onerror=()=>{base=null;rej(r.error)}});
  return base;
}
const op=async(al,modo,f)=>{const d=await abrir();return new Promise((res,rej)=>{const t=d.transaction(al,modo),s=t.objectStore(al);let out;const q=f(s);if(q)q.onsuccess=()=>{out=q.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})};

/* ---------- gzip del texto de cada capítulo ---------- */
async function comprimir(obj){
  const datos=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream!=='function')return new Blob([datos],{type:'application/json'});
  const cs=new CompressionStream('gzip'),w=cs.writable.getWriter();w.write(datos);w.close();
  return new Blob([await new Response(cs.readable).arrayBuffer()],{type:'application/gzip'});
}
async function descomprimir(blob){
  if(blob.type!=='application/gzip')return JSON.parse(await blob.text());
  const ds=new DecompressionStream('gzip'),w=ds.writable.getWriter();w.write(new Uint8Array(await blob.arrayBuffer()));w.close();
  return JSON.parse(new TextDecoder().decode(await new Response(ds.readable).arrayBuffer()));
}

/* ---------- lista en memoria (la biblioteca y el lector la leen sin esperar) ---------- */
let cache=[];
export const misLibros=()=>cache;
export const miLibro=id=>cache.find(l=>l.id===id)||null;
export async function cargarMisLibros(){try{cache=((await op('libros','readonly',s=>s.getAll()))||[]).sort((a,b)=>(b.abierto||b.creado)-(a.abierto||a.creado))}catch(e){cache=[]}dispatchEvent(new Event('mis-libros'));return cache}

export async function guardarLibro(r,meta){
  const id='mio-'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2,8)).slice(0,12);
  let bytes=0;const idsImg=new Map();
  for(const im of r.imagenes||[]){const k=`${id}/${im.id}`;idsImg.set(im.id,k);bytes+=im.blob.size;await op('imagenes','readwrite',s=>s.put({id:k,blob:im.blob,ancho:im.ancho,alto:im.alto}))}
  let portada=null;if(r.portada?.blob){portada=`${id}/portada`;bytes+=r.portada.blob.size;await op('imagenes','readwrite',s=>s.put({id:portada,blob:r.portada.blob,ancho:r.portada.ancho,alto:r.portada.alto}))}
  const capitulos=[];
  for(const [i,c] of r.capitulos.entries()){
    const bloques=c.bloques.map(b=>b.t==='img'?{...b,x:idsImg.get(b.x)||b.x}:b),blob=await comprimir({bloques});bytes+=blob.size;
    await op('capitulos','readwrite',s=>s.put({id:`${id}/${i+1}`,blob}));
    capitulos.push({n:i+1,titulo:c.titulo,palabras:contar(bloques)});
  }
  const libro={id,propio:true,licencia:'🔒 Solo para mí',...meta,portada,capitulos,bytes,creado:Date.now()};
  await op('libros','readwrite',s=>s.put(libro));await cargarMisLibros();
  pedirPersistencia();
  return libro;
}
const contar=bs=>bs.reduce((a,b)=>a+(b.t==='img'?0:String(b.x).replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length),0);
export async function actualizarLibro(id,cambios){const l=miLibro(id);if(!l)return;const n={...l,...cambios};await op('libros','readwrite',s=>s.put(n));await cargarMisLibros();return n}
export async function leerCapituloMio(id,n){const c=await op('capitulos','readonly',s=>s.get(`${id}/${n}`));if(!c)throw new Error('sin capítulo');return descomprimir(c.blob)}
export async function guardarCapituloMio(id,n,bloques){const blob=await comprimir({bloques});await op('capitulos','readwrite',s=>s.put({id:`${id}/${n}`,blob}))}
export const leerImagenMia=id=>op('imagenes','readonly',s=>s.get(id));
// Volver a dividir: el libro con sus capítulos ya reorganizados (unir, partir, renombrar)
export async function reescribirCapitulos(id,caps){
  const l=miLibro(id);if(!l)return;
  for(const c of l.capitulos)await op('capitulos','readwrite',s=>s.delete(`${id}/${c.n}`));
  const capitulos=[];for(const [i,c] of caps.entries()){await guardarCapituloMio(id,i+1,c.bloques);capitulos.push({n:i+1,titulo:c.titulo,palabras:contar(c.bloques)})}
  return actualizarLibro(id,{capitulos});
}
// Borrar con Deshacer: devuelve una copia completa que restaurarLibro vuelve a poner tal cual
export async function borrarLibro(id){
  const l=miLibro(id);if(!l)return null;
  const caps=[],imgs=[];
  for(const c of l.capitulos){const x=await op('capitulos','readonly',s=>s.get(`${id}/${c.n}`));if(x)caps.push(x);await op('capitulos','readwrite',s=>s.delete(`${id}/${c.n}`))}
  const todas=(await op('imagenes','readonly',s=>s.getAll()))||[];
  for(const im of todas.filter(x=>x.id.startsWith(id+'/'))){imgs.push(im);await op('imagenes','readwrite',s=>s.delete(im.id))}
  await op('libros','readwrite',s=>s.delete(id));
  borrarAvance(id);await cargarMisLibros();
  return {libro:l,caps,imgs,avance:avanceDe(id,true)};
}
export async function restaurarLibro(copia){
  await op('libros','readwrite',s=>s.put(copia.libro));
  for(const c of copia.caps)await op('capitulos','readwrite',s=>s.put(c));
  for(const i of copia.imgs)await op('imagenes','readwrite',s=>s.put(i));
  if(copia.avance)guardarAvance(copia.libro.id,copia.avance);
  await cargarMisLibros();
}
export function pedirPersistencia(){try{navigator.storage?.persist?.()}catch(e){}}
export const tamano=b=>b<1024*1024?`${Math.max(1,Math.round(b/1024))} KB`:`${(b/1024/1024).toFixed(1)} MB`;

/* ---------- avance solo en este dispositivo ---------- */
const CLAVE='ciberlab-mis-libros-avance';
let papelera={};
const todos=()=>{try{return JSON.parse(localStorage.getItem(CLAVE)||'{}')}catch(e){return {}}};
export const avanceDe=(id,dePapelera=false)=>(dePapelera?papelera[id]:todos()[id])||{leidos:{}};
export function guardarAvance(id,a){try{const t=todos();t[id]=a;localStorage.setItem(CLAVE,JSON.stringify(t))}catch(e){}}
export function marcarLeidoMio(id,n){const a=avanceDe(id);a.leidos={...(a.leidos||{}),[n]:a.leidos?.[n]||new Date().toISOString().slice(0,10)};a.ultimo=n;guardarAvance(id,a)}
function borrarAvance(id){try{const t=todos();papelera[id]=t[id];delete t[id];localStorage.setItem(CLAVE,JSON.stringify(t))}catch(e){}}

/* ---------- respaldo opcional (solo si se marca «Incluir mis libros») ---------- */
const aB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(b)});
const deB64=(t,tipo)=>new Blob([Uint8Array.from(atob(t),c=>c.charCodeAt(0))],{type:tipo});
export async function librosParaRespaldo(){
  const libros=(await op('libros','readonly',s=>s.getAll()))||[],caps=(await op('capitulos','readonly',s=>s.getAll()))||[],imgs=(await op('imagenes','readonly',s=>s.getAll()))||[];
  return {libros,caps:await Promise.all(caps.map(async c=>({id:c.id,tipo:c.blob.type,datos:await aB64(c.blob)}))),imgs:await Promise.all(imgs.map(async i=>({id:i.id,ancho:i.ancho,alto:i.alto,tipo:i.blob.type,datos:await aB64(i.blob)}))),avance:todos()};
}
export async function restaurarDeRespaldo(r){
  if(!r?.libros)return 0;
  for(const l of r.libros)await op('libros','readwrite',s=>s.put(l));
  for(const c of r.caps||[])await op('capitulos','readwrite',s=>s.put({id:c.id,blob:deB64(c.datos,c.tipo)}));
  for(const i of r.imgs||[])await op('imagenes','readwrite',s=>s.put({id:i.id,ancho:i.ancho,alto:i.alto,blob:deB64(i.datos,i.tipo)}));
  try{localStorage.setItem(CLAVE,JSON.stringify({...todos(),...(r.avance||{})}))}catch(e){}
  await cargarMisLibros();return r.libros.length;
}
