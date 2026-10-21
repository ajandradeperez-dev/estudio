/* ☁️ Sincronización en el navegador: sesión de la cuenta, el motor con los datos de este dispositivo y cuándo sincronizar.
   - Cuenta opcional: correo y contraseña (crear cuenta, entrar, olvidé mi contraseña) o, como alternativa, un código de
     6 dígitos por correo (o Google si SUPABASE_GOOGLE). La sesión vive en 'ciberlab-cuenta' (solo aquí;
     nunca en respaldos). Las claves de IA nunca se suben: no son parte de nada de lo que se sincroniza.
   - Cuándo: al abrir la app, al terminar de practicar (cambios del progreso, con 20 s de espera), al guardar una nota
     (5 s de espera) y al volver la conexión. Sin conexión no se pierde nada: queda pendiente y se envía después.
   - Estado (para Perfil y la pantalla Cuenta): evento 'sync' en window; textoEstado() lo dice en una línea. */
import {crearApiSync} from './api.js';
import {crearMotor} from './motor.js';
import {fusionarProgreso} from './fusionar.js';
import {miEquipo,lapidas,ponerLapidas} from './local.js';
import {progreso,reemplazarProgreso,normalizar} from '../progreso.js';
import {todasLasNotas,guardarNota,borrarNotaDb,todosLosArchivos,leerArchivo,guardarArchivo,borrarArchivo,todasLasMaterias,guardarMateriaDb,borrarMateriaDb,
  todosLosGenerados,guardarGeneradoDb,borrarGeneradoDb,vaciar} from '../cuaderno/db.js';
import {recargarMias} from '../mias/datos.js';
import {usuario,guardarUsuario} from '../usuario.js';
import {SUPABASE_URL,SUPABASE_CLAVE_PUBLICA,SUPABASE_GOOGLE} from '../../config.js';

const CUENTA='ciberlab-cuenta',ESTADO='ciberlab-sync';
export const api=crearApiSync({url:SUPABASE_URL,clave:SUPABASE_CLAVE_PUBLICA});
export const configurado=()=>api.listo;
export const conGoogle=()=>api.listo&&SUPABASE_GOOGLE;
const leer=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const escribir=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
export const cuenta=()=>leer(CUENTA);

/* ---------- sesión ---------- */
const volverA=()=>location.origin+location.pathname+'?cuenta=1';
const datosJWT=t=>{try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return {}}};
const guardarSesion=(t,refresh,expiraEn,extra={})=>{const j=datosJWT(t);if(!t||!j.sub)return false;
  escribir(CUENTA,{access_token:t,refresh_token:refresh,expira:Date.now()+(+expiraEn||3600)*1000,uid:j.sub,email:j.email||extra.email||''});return true};
// Vuelta de un enlace del correo (confirmar la cuenta, código/enlace mágico, contraseña olvidada) o de Google:
// ?cuenta=1#access_token=…&refresh_token=…&expires_in=…&type=signup|magiclink|recovery
let nuevaContrasena=false;
export const pideNuevaContrasena=()=>nuevaContrasena&&!!cuenta();
export function recibirSesionCuenta(){
  if(!/[?&]cuenta=1/.test(location.search)||!/access_token=/.test(location.hash))return false;
  const q=new URLSearchParams(location.hash.slice(1));
  if(!guardarSesion(q.get('access_token'),q.get('refresh_token'),q.get('expires_in')))return false;
  if(q.get('type')==='recovery')nuevaContrasena=true;
  return true;
}
// Respuesta de /token o /verify con la sesión → queda guardada
const conSesion=(r,email)=>{if(!r.ok)return r;const d=r.datos||{};
  return guardarSesion(d.access_token,d.refresh_token,d.expires_in,{email})?{ok:true}:{ok:false,error:'servidor'}};
export const entrar=async(email,password)=>conSesion(await api.entrar(email,password),email);
// {ok, sesion} si el proyecto no pide confirmar el correo; {ok, confirmar} si llega un correo; {ok:false, error:'existe'}
export async function crearCuenta(email,password){
  const r=await api.crearCuenta(email,password,volverA());
  if(!r.ok)return r.codigo==='user_already_exists'?{ok:false,error:'existe'}:r;
  if(r.datos?.access_token)return {...conSesion(r,email),sesion:true};
  const u=r.datos?.user||r.datos;
  if(Array.isArray(u?.identities)&&!u.identities.length)return {ok:false,error:'existe'};
  return {ok:true,confirmar:true};
}
export const recuperar=email=>api.recuperar(email,volverA());
// alternativa sin contraseña: código de 6 dígitos (y enlace) por correo; o Google
export const enviarCodigo=email=>api.enviarEnlace(email,volverA());
export const urlGoogle=()=>api.urlGoogle(volverA());
export const verificarCodigo=async(email,codigo)=>conSesion(await api.verificarCodigo(email,codigo),email);
export async function cambiarContrasena(password){
  const s=await sesion();if(!s)return {ok:false,error:'sin_sesion'};
  const r=await api.cambiarContrasena(s.token,password);if(r.ok)nuevaContrasena=false;return r;
}
export const omitirNuevaContrasena=()=>{nuevaContrasena=false};
async function sesion(){
  const s=cuenta();if(!s)return null;
  if(Date.now()<s.expira-60000)return {token:s.access_token,uid:s.uid};
  const r=await api.renovar(s.refresh_token);
  if(!r.ok){if(r.error==='sesion'||r.error==='servidor'){escribir(CUENTA,null);avisar({error:'sesion'})}return null}
  escribir(CUENTA,{...s,access_token:r.datos.access_token,refresh_token:r.datos.refresh_token,expira:Date.now()+(r.datos.expires_in||3600)*1000});
  return {token:r.datos.access_token,uid:s.uid};
}

/* ---------- este dispositivo ---------- */
export function nombreEquipo(){
  const ua=navigator.userAgent||'',so=/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iPhone':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':/Linux/.test(ua)?'Linux':'Dispositivo';
  const app=document.referrer?.startsWith('android-app://')?'APK':matchMedia?.('(display-mode: standalone)').matches?'app instalada':/Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'navegador';
  return `${so} · ${app}`;
}
let cambioMias=false,cambioNotas=false;
const local={
  progreso:()=>progreso(),
  // lo que llegó de la nube se combina con lo de AHORA (por si se practicó mientras se sincronizaba)
  combinarProgreso:(rem,el,lap)=>reemplazarProgreso(fusionarProgreso(progreso(),normalizar(rem),{yo:miEquipo(),el,borradas:lap})),
  lapidas,ponerLapidas,
  notas:()=>todasLasNotas(),guardarNota:async n=>{await guardarNota(n);cambioNotas=true},borrarNota:async id=>{await borrarNotaDb(id);cambioNotas=true},
  archivos:async()=>(await todosLosArchivos()).map(({blob,...m})=>m),leerArchivo:async id=>(await leerArchivo(id))?.blob||null,
  guardarArchivo:async(m,blob)=>{await guardarArchivo({...m,blob});cambioNotas=true},borrarArchivo:async id=>{await borrarArchivo(id);cambioNotas=true},
  materias:()=>todasLasMaterias(),guardarMateria:async m=>{await guardarMateriaDb(m);cambioMias=true},borrarMateria:async id=>{await borrarMateriaDb(id);cambioMias=true},
  generados:()=>todosLosGenerados(),guardarGenerado:async g=>{await guardarGeneradoDb(g);cambioMias=true},borrarGenerado:async id=>{await borrarGeneradoDb(id);cambioMias=true},
  estado:()=>leer(ESTADO),ponerEstado:s=>escribir(ESTADO,{...(leer(ESTADO)||{}),...s}),
  nombre:()=>usuario().nombre||'',ponerNombre:n=>guardarUsuario({nombre:n})
};
const motor=crearMotor({api,local,sesion,equipo:miEquipo(),nombreEquipo});

/* ---------- sincronizar ---------- */
let ocupado=false,otraVez=false,espera=null,ultimoResultado=null;
function avisar(x={}){ultimoResultado={...(ultimoResultado||{}),...x};dispatchEvent(new CustomEvent('sync',{detail:estadoSync()}))}
export function estadoSync(){
  const st=leer(ESTADO)||{};
  return {configurado:configurado(),cuenta:cuenta(),ocupado,ultima:st.ultima||null,pendiente:!!st.pendiente,error:st.error||null,fotos:ultimoResultado?.fotos||null};
}
export async function sincronizarAhora(){
  if(!configurado()||!cuenta())return {ok:false,error:'sin_sesion'};
  if(ocupado){otraVez=true;return {ok:false,error:'ocupado'}}
  clearTimeout(espera);ocupado=true;cambioMias=cambioNotas=false;avisar();
  let r;try{r=await motor.sincronizar()}catch(e){r={ok:false,error:'servidor',detalle:String(e?.message||e)}}
  ocupado=false;
  local.ponerEstado({pendiente:!r.ok,error:r.ok?null:r.error});
  if(cambioMias)await recargarMias().catch(()=>{});
  if(cambioNotas||cambioMias||r.bajadas)dispatchEvent(new Event('datos-sincronizados'));
  avisar({fotos:r.fotos||null,primera:r.primera||null});
  if(otraVez){otraVez=false;programar(1000)}
  return r;
}
export function programar(ms=5000){
  if(!configurado()||!cuenta())return;
  local.ponerEstado({pendiente:true});clearTimeout(espera);
  espera=setTimeout(()=>{if(navigator.onLine!==false)sincronizarAhora()},ms);
}
export function textoEstado(e=estadoSync()){
  if(!e.configurado)return 'Próximamente: sincronizar entre dispositivos';
  if(!e.cuenta)return 'Sin cuenta: tus datos están solo en este dispositivo';
  if(e.ocupado)return '🔄 Sincronizando…';
  if(navigator.onLine===false||e.error==='red')return '📴 Sin conexión: se enviará luego';
  if(e.error==='sesion'||e.error==='sin_sesion')return '⚠️ Vuelve a iniciar sesión';
  if(e.error)return '⚠️ No se pudo sincronizar: se reintentará';
  if(e.pendiente)return '⏳ Cambios por enviar';
  if(!e.ultima)return 'Todavía no se sincroniza';
  const min=Math.round((Date.now()-e.ultima)/60000);
  return `✓ Sincronizado ${min<1?'hace un momento':min<60?`hace ${min} min`:min<1440?`hace ${Math.round(min/60)} h`:`hace ${Math.round(min/1440)} días`}`;
}
// Al abrir la app: sincroniza y queda escuchando cambios, la red y la vuelta a la app
export function iniciarSync(){
  if(!configurado())return;
  addEventListener('progreso',()=>programar(20000));
  addEventListener('datos-cambiaron',()=>programar(5000));
  addEventListener('online',()=>{if(cuenta())sincronizarAhora()});
  document.addEventListener('visibilitychange',()=>{const st=leer(ESTADO)||{};
    if(document.visibilityState==='visible'&&cuenta()&&(st.pendiente||Date.now()-(st.ultima||0)>5*60000))sincronizarAhora();
    if(document.visibilityState==='hidden'&&st.pendiente&&cuenta())sincronizarAhora()});
  if(cuenta())setTimeout(sincronizarAhora,1500);
}
export const dispositivos=()=>motor.dispositivos();
export const usoFotos=()=>motor.usoFotos();
// Cerrar sesión: se puede dejar todo en este dispositivo o borrarlo (la nube no cambia)
export async function cerrarSesion({borrarLocal=false}={}){
  const s=cuenta();if(s)await api.salir(s.access_token).catch(()=>{});
  escribir(CUENTA,null);escribir(ESTADO,null);
  if(borrarLocal){await vaciar();for(const k of ['ciberlab-progreso','ciberlab-borradas','ciberlab-lectura'])try{localStorage.removeItem(k)}catch(e){}}
  avisar({});
}
// Borrar la cuenta y lo que hay en la nube; lo de este dispositivo se queda (se puede borrar con «Reiniciar»)
export async function borrarCuenta(){
  const r=await motor.borrarCuenta();
  if(r.ok){escribir(CUENTA,null);escribir(ESTADO,null);avisar({})}
  return r;
}
