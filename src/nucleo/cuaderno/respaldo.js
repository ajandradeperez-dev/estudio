/* Respaldo de TODO lo de este teléfono en un archivo .estudio (JSON comprimido con gzip): progreso (racha, XP, repasos,
   tarjetas…), ajustes, notas del cuaderno con sus fotos y dibujos (en base64), las materias propias con lo generado con IA
   y las lápidas de lo borrado. Sirve para guardar una copia o pasar los datos a otro teléfono.
   Nunca incluye la clave de IA ('ciberlab-ia') ni la sesión de la cuenta: son personales de cada dispositivo.
   Al importar se elige «Combinar» (sync/fusionar.js: no se pierde nada de ningún lado) o «Reemplazar».
   También lee los respaldos .json de antes (formato 1). */
import {todasLasNotas,todosLosArchivos,guardarNota,guardarArchivo,borrarNotaDb,borrarArchivo,vaciar,todasLasMaterias,todosLosGenerados,
  guardarMateriaDb,guardarGeneradoDb,borrarMateriaDb,borrarGeneradoDb} from './db.js';
import {progreso,reemplazarProgreso,normalizar,hoy} from '../progreso.js';
import {fusionarProgreso,fusionarNotas,fusionarPorId,unirLapidas,marcarAportes,resumenProgreso} from '../sync/fusionar.js';
import {miEquipo,lapidas,ponerLapidas,avisarCambio} from '../sync/local.js';
import {APP_NOMBRE} from '../../config.js';

const TIPO='ciberlab-respaldo',FORMATO=2;
const AJUSTES='ciberlab-ajustes',USUARIO='ciberlab-usuario';
const aDataUrl=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)});
async function deDataUrl(u){const r=await fetch(u);return r.blob()}
const leerLS=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const escribirLS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

export async function crearRespaldo(){
  const notas=await todasLasNotas(),archivos=[];
  for(const a of await todosLosArchivos()){const {blob,...resto}=a;archivos.push({...resto,data:await aDataUrl(blob)})}
  const materias=await todasLasMaterias().catch(()=>[]),generados=await todosLosGenerados().catch(()=>[]);
  return {tipo:TIPO,formato:FORMATO,app:APP_NOMBRE,fecha:new Date().toISOString(),dispositivo:miEquipo(),
    progreso:marcarAportes(progreso(),miEquipo()),ajustes:leerLS(AJUSTES),usuario:leerLS(USUARIO),notas,archivos,materias,generados,borradas:lapidas()};
}
// gzip con CompressionStream (Chrome 80+, Safari 16.4+); si no hay, el mismo JSON sin comprimir (también se lee)
async function comprimir(texto){
  if(typeof CompressionStream==='undefined')return new Blob([texto],{type:'application/octet-stream'});
  const s=new Blob([texto]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Blob([await new Response(s).arrayBuffer()],{type:'application/octet-stream'});
}
async function descomprimir(file){
  const b=new Uint8Array(await file.slice(0,2).arrayBuffer());
  if(b[0]===0x1f&&b[1]===0x8b){
    if(typeof DecompressionStream==='undefined')throw new Error('Este navegador no puede abrir respaldos comprimidos: actualízalo.');
    return new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  return file.text();
}
export const nombreRespaldo=()=>`${APP_NOMBRE.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'app'}-respaldo-${hoy()}.estudio`;
export async function archivoRespaldo(){
  const r=await crearRespaldo(),blob=await comprimir(JSON.stringify(r));
  return {blob,nombre:nombreRespaldo(),notas:r.notas.length,archivos:r.archivos.length,bytes:blob.size};
}
export async function descargarRespaldo(){const x=await archivoRespaldo();descargar(x.blob,x.nombre);return x}
export function descargar(blob,nombre){
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=nombre;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),4000);
}
// Lee y valida un respaldo (sin aplicarlo todavía)
export async function leerRespaldo(file){
  let r;try{r=JSON.parse(await descomprimir(file))}catch(e){throw new Error(e.message?.includes('navegador')?e.message:'El archivo no es un respaldo válido.')}
  if(!r||r.tipo!==TIPO||!Array.isArray(r.notas)||!Array.isArray(r.archivos))throw new Error('Este archivo no es un respaldo de la app.');
  if(r.formato>FORMATO)throw new Error('El respaldo es de una versión más nueva de la app: actualízala primero.');
  return r;
}
// Lo que trae un respaldo (para decidir): XP, notas, fotos y último uso
export function resumenRespaldo(r){
  const p=resumenProgreso(normalizar(r.progreso));
  return {...p,notas:r.notas.length,fotos:r.archivos.length,materias:(r.materias||[]).length,ultimo:p.ultimo||String(r.fecha||'').slice(0,10)||null};
}
export async function resumenLocal(){
  const p=resumenProgreso(progreso());
  return {...p,notas:(await todasLasNotas().catch(()=>[])).length,fotos:(await todosLosArchivos().catch(()=>[])).length};
}
const archivosValidos=async lista=>{const out=[];for(const a of lista||[])if(a&&typeof a.id==='string'&&typeof a.data==='string'&&a.data.startsWith('data:image/')){const {data,...resto}=a;out.push({...resto,blob:await deDataUrl(data)})}return out};
const materiasValidas=l=>(Array.isArray(l)?l:[]).filter(m=>m&&typeof m.id==='string'&&/^mp-/.test(m.id));
const generadosValidos=l=>(Array.isArray(l)?l:[]).filter(g=>g&&typeof g.id==='string');

/* Reemplazar: el progreso, los ajustes y el cuaderno de este teléfono pasan a ser los del respaldo.
   Combinar: se unen los dos sin perder nada (lo más nuevo gana; la XP de cada dispositivo se suma una sola vez). */
export async function aplicarRespaldo(r,{modo='reemplazar'}={}){
  const archivos=await archivosValidos(r.archivos);
  if(modo==='combinar')return combinarDatos({...r,archivos});
  if(r.progreso)reemplazarProgreso(r.progreso);
  if(r.ajustes)escribirLS(AJUSTES,r.ajustes);
  if(r.usuario)escribirLS(USUARIO,r.usuario);
  await vaciar();
  for(const n of r.notas)if(n&&typeof n.id==='string')await guardarNota(n);
  for(const a of archivos)await guardarArchivo(a);
  for(const m of materiasValidas(r.materias))await guardarMateriaDb(m);
  for(const g of generadosValidos(r.generados))await guardarGeneradoDb(g);
  ponerLapidas(r.borradas||{});avisarCambio('todo');
  return {notas:r.notas.length,archivos:archivos.length,materias:materiasValidas(r.materias).length};
}
/* Combina datos de otro dispositivo (respaldo o nube) con los de este. `d` = {progreso, dispositivo, notas, archivos (con blob),
   materias, generados, borradas, usuario}. Devuelve cuánto se agregó o actualizó de cada cosa. */
export async function combinarDatos(d){
  const bor=unirLapidas(lapidas(),d.borradas||{});
  if(d.progreso)reemplazarProgreso(fusionarProgreso(progreso(),normalizar(d.progreso),{yo:miEquipo(),el:d.dispositivo||'respaldo',borradas:bor}));
  // notas: escribe solo lo que cambia; quita las que tienen una lápida más nueva
  const locales=await todasLasNotas(),porId=new Map(locales.map(n=>[n.id,n]));
  const unidas=fusionarNotas(locales,(d.notas||[]).filter(n=>n&&typeof n.id==='string'),bor),quedan=new Set(unidas.map(n=>n.id));
  let notas=0;
  for(const n of unidas){const x=porId.get(n.id);if(!x||(n.editada||0)>(x.editada||0)){await guardarNota(n);notas++}}
  for(const n of locales)if(!quedan.has(n.id))await borrarNotaDb(n.id);
  // fotos y dibujos: se agregan las que faltan (salvo las borradas aquí)
  const tengo=new Set((await todosLosArchivos().catch(()=>[])).map(a=>a.id));let archivos=0;
  for(const a of d.archivos||[])if(a?.blob&&!tengo.has(a.id)&&!bor[a.id]){await guardarArchivo(a);archivos++}
  for(const id of tengo)if(bor[id])await borrarArchivo(id).catch(()=>{});
  // materias propias y lo generado
  const mLoc=await todasLasMaterias().catch(()=>[]),gLoc=await todosLosGenerados().catch(()=>[]);
  const mU=fusionarPorId(mLoc,materiasValidas(d.materias),'editada',bor),gU=fusionarPorId(gLoc,generadosValidos(d.generados),'creado',bor);
  const mMap=new Map(mLoc.map(x=>[x.id,x])),gMap=new Map(gLoc.map(x=>[x.id,x]));let materias=0;
  for(const m of mU)if(mMap.get(m.id)!==m){await guardarMateriaDb(m);materias++}
  for(const g of gU)if(gMap.get(g.id)!==g)await guardarGeneradoDb(g);
  for(const m of mLoc)if(!mU.includes(m))await borrarMateriaDb(m.id);
  for(const g of gLoc)if(!gU.includes(g))await borrarGeneradoDb(g.id);
  // el nombre, si aquí no hay
  const u=leerLS(USUARIO)||{};if(!u.nombre&&d.usuario?.nombre)escribirLS(USUARIO,{...u,nombre:d.usuario.nombre});
  ponerLapidas(bor);
  return {notas,archivos,materias};
}
