/* ¿Dónde corre la app? La misma web va en GitHub Pages (navegador, PWA y la TWA vieja) y dentro del APK nativo (Capacitor,
   PROMPT-APP-NATIVA). Lo que en el WebView de Android funciona distinto se resuelve aquí, con el plugin nativo; en el
   navegador todo sigue con la API web de siempre.
   - esNativa(): dentro de la app Android. __NATIVA__ lo pone el build de la app (npm run build:app).
   - instalarNativo(): al arrancar la app nativa. Botón Atrás de Android (cierra la capa o vuelve; sin nada atrás, sale),
     enlaces io.github.ajandradeperez.estudio://auth (evento 'enlace-app'), descargas (<a download> con un blob) y
     navigator.share → archivo en la caché de la app + menú «Compartir» de Android (guardar en Archivos, Drive, WhatsApp…).
   - imprimir(): window.print() en el navegador; en la app, el PrintManager de Android (plugin propio «Imprimir»,
     android-app/…/ImprimirPlugin.java), que también guarda en PDF.
   - vibrarNativo(), recordatorios con @capacitor/local-notifications (programarAvisos). */
export const esNativa=()=>{try{return !!(typeof __NATIVA__!=='undefined'&&__NATIVA__)||!!globalThis.Capacitor?.isNativePlatform?.()}catch(e){return false}};
export const ESQUEMA_APP='io.github.ajandradeperez.estudio';
// Plugin nativo registrado por Capacitor (o null en el navegador)
export const plugin=nombre=>{try{return esNativa()?globalThis.Capacitor?.Plugins?.[nombre]||null:null}catch(e){return null}};

const aBase64=blob=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(String(f.result).split(',')[1]||'');f.onerror=rej;f.readAsDataURL(blob)});
const limpio=n=>String(n||'archivo').replace(/[\\/:*?"<>|]+/g,'-').slice(0,90);
// Escribe un archivo en la caché de la app y devuelve su URI (para compartirlo)
async function aArchivo(blob,nombre){
  const {Filesystem,Directory}=await import('@capacitor/filesystem');
  const r=await Filesystem.writeFile({path:`compartir/${Date.now()}-${limpio(nombre)}`,data:await aBase64(blob),directory:Directory.Cache,recursive:true});
  return r.uri;
}
// Comparte texto, un enlace o archivos con el menú de Android
export async function compartirNativo({title,text,url,files=[]}={}){
  const {Share}=await import('@capacitor/share');
  const uris=[];for(const f of files)uris.push(await aArchivo(f,f.name));
  try{await Share.share({title,text,url,...(uris.length?{files:uris}:{}),dialogTitle:title||'Compartir'})}
  catch(e){if(!/cancel/i.test(e?.message||''))throw e;const x=new Error('cancelado');x.name='AbortError';throw x}
}
// Una «descarga» en la app: el archivo se guarda y se abre el menú para elegir dónde (Archivos, Drive, correo…)
export async function guardarArchivoNativo(blob,nombre){await compartirNativo({title:nombre,files:[new File([blob],nombre,{type:blob.type||'application/octet-stream'})]})}

let instalado=false;
export async function instalarNativo({aviso=()=>{}}={}){
  if(instalado||!esNativa())return;instalado=true;
  document.documentElement.dataset.nativa='1';
  const {App}=await import('@capacitor/app');
  // Atrás de Android: el historial de la app ES la pila de pantallas (main.js); sin nada atrás, se sale de la app
  App.addListener('backButton',({canGoBack})=>{if(canGoBack)history.back();else App.exitApp()});
  // Enlaces que abren la app (los del correo de Supabase: confirmar la cuenta, contraseña olvidada, código)
  const enlace=url=>{if(url)dispatchEvent(new CustomEvent('enlace-app',{detail:String(url)}))};
  App.addListener('appUrlOpen',e=>enlace(e.url));
  App.getLaunchUrl?.().then(r=>enlace(r?.url)).catch(()=>{});
  // navigator.share y las descargas de siempre, con los plugins nativos
  navigator.share=datos=>compartirNativo(datos||{});
  navigator.canShare=()=>true;
  const click=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    if(this.hasAttribute('download')&&/^(blob|data):/.test(this.href)){
      const nombre=this.getAttribute('download')||'archivo';
      fetch(this.href).then(r=>r.blob()).then(b=>guardarArchivoNativo(b,nombre)).catch(e=>{if(e?.name!=='AbortError')aviso('No se pudo guardar el archivo.')});
      return;
    }
    return click.call(this);
  };
  // al volver a la app (p. ej. después del menú de compartir) se revisan los recordatorios
  App.addListener('resume',()=>dispatchEvent(new CustomEvent('app-vuelve')));
}

/* Imprimir: el diálogo de impresión de Android (también «Guardar como PDF»). Resuelve al terminar o cancelar. */
export async function imprimir(titulo=document.title){
  const p=plugin('Imprimir');
  if(p){try{await p.imprimir({titulo})}catch(e){}return}
  await new Promise(res=>{let fin=false;const listo=()=>{if(!fin){fin=true;removeEventListener('afterprint',listo);res()}};addEventListener('afterprint',listo);setTimeout(()=>{window.print();setTimeout(listo,1000)},100)});
}
// Vibración con el motor de Android (navigator.vibrate no siempre funciona en el WebView)
export function vibrarNativo(patron){
  import('@capacitor/haptics').then(({Haptics})=>{const ms=[].concat(patron).filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0)||20;Haptics.vibrate({duration:Math.min(400,ms)})}).catch(()=>{});
}

/* ---------- recordatorios (app nativa): @capacitor/local-notifications, también con la app cerrada ---------- */
const ID_DIARIO=1;
// avisos: {diario:{activo, hora 'HH:MM', cumplidaHoy, titulo, cuerpo}, examenes:[{id, fecha, nombre, ruta}]}
export async function programarAvisos({diario,examenes=[]}){
  const {LocalNotifications}=await import('@capacitor/local-notifications');
  const pendientes=(await LocalNotifications.getPending().catch(()=>({notifications:[]}))).notifications||[];
  if(pendientes.length)await LocalNotifications.cancel({notifications:pendientes.map(n=>({id:n.id}))}).catch(()=>{});
  const lista=[];
  if(diario?.activo){
    const [h,m]=String(diario.hora||'19:00').split(':').map(Number),cuando=new Date();cuando.setHours(h,m||0,0,0);
    // si hoy ya pasó la hora o la meta ya está cumplida, el primero es mañana; luego se repite cada día
    if(cuando<=new Date()||diario.cumplidaHoy)cuando.setDate(cuando.getDate()+1);
    lista.push({id:ID_DIARIO,title:diario.titulo,body:diario.cuerpo,schedule:{at:cuando,repeats:true,every:'day',allowWhileIdle:true},extra:{ruta:''}});
  }
  examenes.forEach((x,i)=>{for(const [d,t,c] of [[7,'📅 En una semana: ','Revisa tu plan: esta semana toca repaso y simulacros.'],[1,'📅 Mañana: ','Haz un simulacro corto y repasa tus temas débiles. ¡Tú puedes!']]){
    const at=new Date(x.fecha+'T09:00');at.setDate(at.getDate()-d);if(at>new Date())lista.push({id:100+i*2+(d===1?1:0),title:t+x.nombre,body:c,schedule:{at,allowWhileIdle:true},extra:{ruta:x.ruta}})}});
  if(!lista.length)return true;
  let perm=await LocalNotifications.checkPermissions().catch(()=>({display:'denied'}));
  if(perm.display!=='granted')perm=await LocalNotifications.requestPermissions().catch(()=>({display:'denied'}));
  if(perm.display!=='granted')return false;
  await LocalNotifications.schedule({notifications:lista});
  return true;
}
export async function alTocarAviso(fn){
  if(!esNativa())return;
  const {LocalNotifications}=await import('@capacitor/local-notifications');
  LocalNotifications.addListener('localNotificationActionPerformed',e=>fn(e.notification?.extra?.ruta||''));
}
