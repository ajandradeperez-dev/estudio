/* Respaldo de TODO lo de este teléfono en un archivo .json: progreso (racha, XP, repasos, tarjetas…), ajustes,
   notas del cuaderno y sus fotos y dibujos (en base64), y las materias propias con lo generado con IA. Sirve para pasar los datos a otro teléfono.
   Nunca incluye la clave de IA ('ciberlab-ia'): es personal y se vuelve a pegar en el otro dispositivo. */
import {todasLasNotas,todosLosArchivos,guardarNota,guardarArchivo,vaciar,todasLasMaterias,todosLosGenerados,guardarMateriaDb,guardarGeneradoDb} from './db.js';
import {reemplazarProgreso,hoy} from '../progreso.js';
import {APP_NOMBRE} from '../../config.js';

const TIPO='ciberlab-respaldo',FORMATO=1;
const AJUSTES='ciberlab-ajustes',USUARIO='ciberlab-usuario';
const aDataUrl=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)});
async function deDataUrl(u){const r=await fetch(u);return r.blob()}

export async function crearRespaldo(){
  let progreso=null,ajustes=null;
  try{progreso=JSON.parse(localStorage.getItem('ciberlab-progreso'))}catch(e){}
  let usuario=null;
  try{ajustes=JSON.parse(localStorage.getItem(AJUSTES))}catch(e){}
  try{usuario=JSON.parse(localStorage.getItem(USUARIO))}catch(e){}
  const notas=await todasLasNotas(),archivos=[];
  for(const a of await todosLosArchivos()){const {blob,...resto}=a;archivos.push({...resto,data:await aDataUrl(blob)})}
  const materias=await todasLasMaterias().catch(()=>[]),generados=await todosLosGenerados().catch(()=>[]);
  return {tipo:TIPO,formato:FORMATO,app:APP_NOMBRE,fecha:new Date().toISOString(),progreso,ajustes,usuario,notas,archivos,materias,generados};
}
export async function descargarRespaldo(){
  const r=await crearRespaldo(),blob=new Blob([JSON.stringify(r)],{type:'application/json'});
  descargar(blob,`${APP_NOMBRE.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'app'}-respaldo-${hoy()}.json`);
  return {notas:r.notas.length,archivos:r.archivos.length,bytes:blob.size};
}
export function descargar(blob,nombre){
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=nombre;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),4000);
}
// Lee y valida un respaldo (sin aplicarlo todavía)
export async function leerRespaldo(file){
  let r;try{r=JSON.parse(await file.text())}catch(e){throw new Error('El archivo no es un respaldo válido (no es JSON).')}
  if(!r||r.tipo!==TIPO||!Array.isArray(r.notas)||!Array.isArray(r.archivos))throw new Error('Este archivo no es un respaldo de la app.');
  if(r.formato>FORMATO)throw new Error('El respaldo es de una versión más nueva de la app: actualízala primero.');
  return r;
}
// Reemplaza el progreso, los ajustes y el cuaderno de este teléfono por los del respaldo
export async function aplicarRespaldo(r){
  if(r.progreso)reemplazarProgreso(r.progreso);
  if(r.ajustes)try{localStorage.setItem(AJUSTES,JSON.stringify(r.ajustes))}catch(e){}
  if(r.usuario)try{localStorage.setItem(USUARIO,JSON.stringify(r.usuario))}catch(e){}
  await vaciar();
  for(const n of r.notas)if(n&&typeof n.id==='string')await guardarNota(n);
  for(const a of r.archivos)if(a&&typeof a.id==='string'&&typeof a.data==='string'&&a.data.startsWith('data:image/')){const {data,...resto}=a;await guardarArchivo({...resto,blob:await deDataUrl(data)})}
  for(const m of Array.isArray(r.materias)?r.materias:[])if(m&&typeof m.id==='string'&&/^mp-/.test(m.id))await guardarMateriaDb(m);
  for(const g of Array.isArray(r.generados)?r.generados:[])if(g&&typeof g.id==='string')await guardarGeneradoDb(g);
  return {notas:r.notas.length,archivos:r.archivos.length,materias:(r.materias||[]).length};
}
