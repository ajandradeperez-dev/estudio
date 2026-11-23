/* Actualizaciones de la app nativa (PROMPT-APP-NATIVA, parte 4). La app se actualiza instalando un APK nuevo: no hay
   service worker ni caché que se quede con una versión vieja.
   - buscarApk({manual}): consulta la última Release de GitHub (api.github.com/…/releases/latest); si su versión es mayor
     que la instalada (App.getInfo().version), ofrece «Versión X disponible: novedades…» con «Descargar e instalar», que
     abre la descarga de EstudioPlus.apk en el navegador; al terminar, Android abre su instalador. La primera vez explica el
     permiso «Instalar apps desconocidas».
   - Automática al abrir la app, como mucho una vez al día (ciberlab-actualizacion); manual en Perfil → Acerca de. */
import {esNativa} from './plataforma.js';
import {confirmar,aviso} from './ui.js';
import {esc} from '../utilidades.js';
import {APK_URL} from '../config.js';

const API='https://api.github.com/repos/ajandradeperez-dev/estudio/releases/latest',CLAVE='ciberlab-actualizacion';
const leer=()=>{try{return JSON.parse(localStorage.getItem(CLAVE))||{}}catch(e){return {}}};
const guardar=x=>{try{localStorage.setItem(CLAVE,JSON.stringify({...leer(),...x}))}catch(e){}};
// '2.0.10' > '2.0.9'; las etiquetas pueden traer prefijo (v2.0.0, android-1.2.0)
export function esMayor(a,b){
  const n=v=>String(v||'').replace(/^[^\d]*/,'').split(/[.-]/).map(x=>parseInt(x,10)||0);
  const x=n(a),y=n(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)}return false;
}
export async function versionInstalada(){
  if(!esNativa())return null;
  try{const {App}=await import('@capacitor/app');return (await App.getInfo()).version}catch(e){return null}
}
// Devuelve {nueva, version, notas, url} o null (sin conexión o sin Releases)
export async function consultar(){
  try{
    const r=await fetch(API,{headers:{accept:'application/vnd.github+json'},cache:'no-store'});if(!r.ok)return null;
    const d=await r.json(),apk=(d.assets||[]).find(a=>/^EstudioPlus\.apk$/i.test(a.name));
    const instalada=await versionInstalada();
    return {version:d.tag_name,notas:String(d.body||'').trim(),url:apk?.browser_download_url||APK_URL,instalada,nueva:!!instalada&&esMayor(d.tag_name,instalada)};
  }catch(e){return null}
}
export async function buscarApk({manual=false}={}){
  if(!esNativa())return null;
  const hoy=new Date().toISOString().slice(0,10);
  if(!manual&&leer().revisada===hoy)return null;
  if(!navigator.onLine){if(manual)aviso('Sin conexión: no se puede revisar ahora.');return null}
  const r=await consultar();guardar({revisada:hoy});
  if(!r){if(manual)aviso('No se pudo revisar ahora. Intenta más tarde.');return null}
  if(!r.nueva){if(manual)aviso(`✅ Al día: tienes la versión ${r.instalada}.`);return r}
  const notas=r.notas.replace(/[#*`>]/g,'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,5).join(' · ').slice(0,280);
  if(!(await confirmar({titulo:`✨ Versión ${esc(r.version.replace(/^[^\d]*/,''))} disponible`,texto:`${notas?`Novedades: ${esc(notas)}<br><br>`:''}Tienes la ${esc(r.instalada)}. Tu progreso se conserva al instalarla.`,si:'⬇️ Descargar e instalar',no:'Más tarde'})))return r;
  // la primera vez: el permiso de Android para instalar el APK que se descargó
  if(!leer().explicado){guardar({explicado:true});
    await confirmar({titulo:'Un permiso, una sola vez',texto:'Al abrir el archivo descargado, Android puede pedir permiso para <b>«Instalar apps desconocidas»</b> desde el navegador. Actívalo, toca <b>Instalar</b> y listo: la app se actualiza encima, sin perder nada.',si:'Entendido',no:'Cancelar'})}
  window.open(r.url,'_blank');
  return r;
}
