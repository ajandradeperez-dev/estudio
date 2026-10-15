/* Experiencia de app instalada: bienvenida (onboarding de 3 pantallas), "Acerca de", instalar, invitar amigos (Web Share + QR),
   avisos de conexión y de versión nueva, y recordatorio diario de la racha.
   El recordatorio: con la app abierta (o en segundo plano) se revisa cada minuto; con la app cerrada, el service worker
   (public/sw-recordatorio.js) lo revisa con Periodic Background Sync cuando el navegador lo permite (Chrome/Android con la
   app instalada). El navegador decide cuándo despierta al service worker: la hora es aproximada. */
import {esc} from '../utilidades.js';
import {APP_NOMBRE,APP_URL,APK_URL,REPO_URL,INVITACION} from '../config.js';
import {areas,materias,rutaMateria} from './materias.js';
import {progreso,cambiarMeta,METAS,estadoHoy,racha,hoy} from './progreso.js';
import {usuario,guardarUsuario} from './usuario.js';
import {aviso,boton} from './ui.js';
import qrcode from 'qrcode-generator';
import {misMaterias} from './mias/datos.js';

/* ---------- instalar ---------- */
let eventoInstalar=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();eventoInstalar=e;dispatchEvent(new Event('instalable'))});
addEventListener('appinstalled',()=>{eventoInstalar=null;aviso(`📲 ${APP_NOMBRE} quedó instalada`)});
// Dónde corre la app: el APK (Trusted Web Activity) se reconoce por el referrer android-app:// al abrir; se recuerda en la sesión
try{if(document.referrer.startsWith('android-app://'))sessionStorage.setItem('ciberlab-contexto','apk')}catch(e){}
export function contexto(){
  let apk=false;try{apk=sessionStorage.getItem('ciberlab-contexto')==='apk'}catch(e){}
  const ua=navigator.userAgent,nav=/SamsungBrowser/.test(ua)?'Samsung Internet':/EdgA?\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Firefox\//.test(ua)?'Firefox':navigator.brave?'Brave':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'tu navegador';
  return {donde:apk?'el APK':instalada()?'la app instalada':'el navegador',navegador:nav,origen:location.origin};
}
export const instalada=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true||document.referrer.startsWith('android-app://');
export const esIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
export const esAndroid=()=>/android/i.test(navigator.userAgent);
export const puedeInstalar=()=>!!eventoInstalar;
export async function instalar(){
  if(eventoInstalar){eventoInstalar.prompt();const r=await eventoInstalar.userChoice.catch(()=>null);eventoInstalar=null;return r?.outcome==='accepted'}
  modal('📲 Instalar la app',esIOS()?`<ol class="pasos-instalar"><li>Abre esta página en <b>Safari</b>.</li><li>Toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> (abajo).</li><li>Elige <b>Agregar a inicio</b> y luego <b>Agregar</b>.</li></ol>`
    :`<ol class="pasos-instalar"><li>Abre el menú del navegador <b>⋮</b>.</li><li>Toca <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.</li></ol>${esAndroid()?`<p class="nota">En Android también puedes <a href="${APK_URL}">descargar el APK</a>.</p>`:''}`);
  return false;
}
function modal(titulo,html){
  const f=document.createElement('div');f.className='modal-fondo';
  f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><h2 id="modal-t">${titulo}</h2><div class="modal-cuerpo">${html}</div><button class="btn ancho" data-x>Entendido</button></div>`;
  const cerrar=()=>{f.remove();document.removeEventListener('keydown',tecla,true)},tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar()}};
  f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-x]'))cerrar()});document.addEventListener('keydown',tecla,true);
  document.body.appendChild(f);f.querySelector('[data-x]').focus();return f;
}

/* ---------- invitar amigos ---------- */
export function htmlQR(texto,{tam=4}={}){
  const q=qrcode(0,'M');q.addData(texto);q.make();
  return q.createSvgTag({cellSize:tam,margin:2,scalable:true,title:`Código QR: ${texto}`});
}
export async function invitar(){
  const datos={title:APP_NOMBRE,text:INVITACION,url:APP_URL};
  if(navigator.share){try{await navigator.share(datos);return}catch(e){if(e.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(`${INVITACION} ${APP_URL}`);aviso('📋 Enlace copiado: pégalo en WhatsApp o donde quieras')}catch(e){mostrarQR()}
}
export function mostrarQR(){
  modal('🤝 Escanea para abrir la app',`<div class="qr">${htmlQR(APP_URL)}</div><p class="nota" style="word-break:break-all">${APP_URL}</p>`);
}

/* ---------- avisos: sin conexión y versión nueva ---------- */
function franja(id,html){let f=document.getElementById(id);if(!html){f?.remove();return}
  if(!f){f=document.createElement('div');f.id=id;f.className='franja';f.setAttribute('role','status');document.body.appendChild(f)}f.innerHTML=html}
export function vigilarConexion(){
  // la franja empuja la barra superior hacia abajo (--franja) en vez de taparla
  const pintar=()=>{franja('sin-conexion',navigator.onLine?'':'📴 Sin conexión: todo funciona menos la IA y el reconocimiento de voz.');
    const f=document.getElementById('sin-conexion');f?document.documentElement.style.setProperty('--franja',f.offsetHeight+'px'):document.documentElement.style.removeProperty('--franja')};
  addEventListener('online',()=>{pintar();aviso('🌐 Conexión de nuevo')});addEventListener('offline',pintar);pintar();
}
// Estado de la actualización (lo muestra Acerca de): 'nueva' cuando ya se descargó una versión más reciente que la que corre
let versionNueva=false,registro=null;
export const hayVersionNueva=()=>versionNueva;
export const guardarRegistroSW=r=>{registro=r};
// Busca una versión nueva ahora (Acerca de → «Buscar actualización»); true si encontró una
export async function buscarActualizacion(){
  try{await registro?.update();await new Promise(r=>setTimeout(r,1500))}catch(e){}
  if(registro?.waiting||registro?.installing)versionNueva=true;
  return versionNueva;
}
export function avisarVersionNueva(){
  versionNueva=true;
  franja('version-nueva',`✨ Hay una versión nueva <button type="button" class="btn btn-chico" id="actualizar-app">Actualizar</button>`);
  document.getElementById('actualizar-app').addEventListener('click',()=>location.reload());
}

/* ---------- recordatorio diario ---------- */
const CACHE_REC='ciberlab-recordatorio',URL_REC='recordatorio.json';
const minutos=h=>{const [a,b]=String(h).split(':').map(Number);return a*60+(b||0)};
export const soporteNotificaciones=()=>'Notification' in window&&'serviceWorker' in navigator;
// El service worker no puede leer localStorage: le dejamos el estado en la caché
export async function sincronizarRecordatorio(){
  if(!('caches' in window))return;
  const u=usuario(),p=progreso(),e=estadoHoy(p);let previo={};
  try{const c=await caches.open(CACHE_REC),r=await c.match(URL_REC);if(r)previo=await r.json()}catch(e){}
  const permiso=typeof Notification!=='undefined'&&Notification.permission==='granted';
  // exámenes de "Mis materias" con aviso (una semana y un día antes)
  const examenes=misMaterias().filter(m=>m.avisos).flatMap(m=>m.examenes.filter(x=>x.fecha>=hoy()).map(x=>({id:`${m.id}/${x.id}`,nombre:`${x.nombre} de ${m.nombre}`,fecha:x.fecha,ruta:`mias/${m.id}`})));
  const estado={...previo,activo:u.recordatorio.activo&&permiso,avisosExamen:permiso,examenes,avisados:previo.avisados||[],hora:u.recordatorio.hora,cumplida:e.ok?hoy():previo.cumplida||'',
    nombre:u.nombre,racha:racha(p),app:APP_NOMBRE};
  try{const c=await caches.open(CACHE_REC);await c.put(URL_REC,new Response(JSON.stringify(estado),{headers:{'content-type':'application/json'}}))}catch(e){}
  return estado;
}
async function marcarNotificado(){try{const c=await caches.open(CACHE_REC),r=await c.match(URL_REC),x=r?await r.json():{};x.notificado=hoy();await c.put(URL_REC,new Response(JSON.stringify(x)))}catch(e){}}
export async function activarRecordatorio(activo,hora=usuario().recordatorio.hora){
  if(activo){
    if(!soporteNotificaciones()){aviso('Este navegador no permite notificaciones.',3500);return false}
    const permiso=Notification.permission==='granted'?'granted':await Notification.requestPermission();
    if(permiso!=='granted'){aviso('Sin permiso para notificar: actívalo en los ajustes del navegador.',4000);guardarUsuario({recordatorio:{activo:false,hora}});return false}
  }
  guardarUsuario({recordatorio:{activo,hora}});
  await sincronizarRecordatorio();
  if(activo){try{const reg=await navigator.serviceWorker.ready;
    if('periodicSync' in reg){const st=await navigator.permissions.query({name:'periodic-background-sync'}).catch(()=>null);
      if(!st||st.state==='granted')await reg.periodicSync.register('recordatorio-racha',{minInterval:60*60*1000})}}catch(e){}}
  else{try{const reg=await navigator.serviceWorker.ready;await reg.periodicSync?.unregister('recordatorio-racha')}catch(e){}}
  return activo;
}
// Avisos de examen: 7 días y 1 día antes, una sola vez cada uno (también los da el service worker con la app cerrada)
async function revisarExamenes(){
  if(!soporteNotificaciones()||Notification.permission!=='granted')return;
  const est=await sincronizarRecordatorio();if(!est?.examenes?.length)return;
  const dias=f=>Math.round((new Date(f+'T00:00')-new Date(hoy()+'T00:00'))/864e5);
  for(const x of est.examenes){const d=dias(x.fecha),k=`${x.id}@${d}`;
    if((d===1||d===7)&&!est.avisados.includes(k)){
      try{const reg=await navigator.serviceWorker.ready;await reg.showNotification(d===1?`📅 Mañana: ${x.nombre}`:`📅 En una semana: ${x.nombre}`,{body:d===1?'Haz un simulacro corto y repasa tus temas débiles. ¡Tú puedes!':'Revisa tu plan: esta semana toca repaso y simulacros.',
        icon:'icons/icon-192.png',badge:'icons/icon-monocromo-512.png',tag:k,data:{url:`./#${x.ruta}`}});est.avisados.push(k)}catch(e){}}}
  try{const c=await caches.open(CACHE_REC);await c.put(URL_REC,new Response(JSON.stringify({...est,avisados:est.avisados.slice(-40)})))}catch(e){}
}
// Con la app abierta: a la hora elegida, si la meta de hoy no está cumplida, una notificación (una vez al día)
export async function revisarRecordatorio(){
  await revisarExamenes();
  const u=usuario();if(!u.recordatorio.activo||!soporteNotificaciones()||Notification.permission!=='granted')return;
  const ahora=new Date(),e=estadoHoy();if(e.ok||ahora.getHours()*60+ahora.getMinutes()<minutos(u.recordatorio.hora))return;
  const est=await sincronizarRecordatorio();if(est?.notificado===hoy())return;
  try{const reg=await navigator.serviceWorker.ready,r=racha();
    await reg.showNotification(r?`🔥 No pierdas tu racha de ${r} ${r===1?'día':'días'}`:`⏰ Hora de estudiar`,{body:`${u.nombre?u.nombre+', t':'T'}e faltan ${e.meta-e.hecho} ${e.tipo==='minutos'?'minutos':'ejercicios'} para tu meta de hoy.`,
      icon:'icons/icon-192.png',badge:'icons/icon-monocromo-512.png',tag:'recordatorio-racha',data:{url:'./#'}});
    await marcarNotificado();
  }catch(e){}
}

/* ---------- bienvenida (primera vez) ---------- */
// Se muestra al abrir la portada si nunca se vio y no hay progreso (quien ya usaba la app no la ve)
export function tocaBienvenida(){
  const u=usuario();if(u.bienvenida)return false;
  const p=progreso(),usado=Object.keys(p.dias).length||Object.values(p.materias).some(m=>m?.xp>0||Object.keys(m?.lecciones||{}).length);
  if(usado){guardarUsuario({bienvenida:true});return false}
  return true;
}
export function vistaBienvenida(alTerminar){
  let paso=0;const u=usuario();let nombre=u.nombre,elegidas=new Set(u.materias),materiaPropia=false;
  const puntos=()=>`<div class="bien-puntos" aria-label="Paso ${paso+1} de 3">${[0,1,2].map(i=>`<span class="${i<=paso?'on':''}"></span>`).join('')}</div>`;
  const terminar=(ir,ruta='')=>{guardarUsuario({nombre:nombre.trim().slice(0,40),materias:[...elegidas],bienvenida:true});alTerminar?.();ir(ruta)};
  return {
    titulo:'Bienvenida',inmersiva:true,
    vista(){
      const pie=(txt,id)=>`<div class="bien-pie">${paso?'<button type="button" class="btn ghost" id="bien-atras">Atrás</button>':'<button type="button" class="btn ghost" id="bien-saltar">Saltar</button>'}<button type="button" class="btn" id="${id}">${txt}</button></div>`;
      if(paso===0)return `<div class="bienvenida">${puntos()}<img class="bien-logo" src="icons/icon-192.png" alt="" width="96" height="96">
<h1>¡Hola! Soy ${APP_NOMBRE}</h1><p class="intro">Estudia con lecciones cortas, repaso espaciado y una racha diaria. Todo se queda en tu teléfono.</p>
<label class="campo">¿Cómo te llamas? <span class="nota">(opcional)</span><input id="bien-nombre" value="${esc(nombre)}" autocomplete="given-name" maxlength="40" placeholder="Tu nombre"></label>${pie('Siguiente','bien-sig')}</div>`;
      if(paso===1)return `<div class="bienvenida">${puntos()}<h1>¿Qué quieres estudiar${nombre.trim()?`, ${esc(nombre.trim())}`:''}?</h1><p class="intro">Marca lo que te interesa: te lo recomendaremos primero. Puedes cambiarlo después en Perfil.</p>
<button type="button" class="bien-materia bien-propia" data-propia aria-pressed="${materiaPropia}"><span aria-hidden="true">🎓</span>¿Tienes una materia que pasar? <span class="nota">Sube tu temario y la fecha del examen: te armo un plan.</span></button>
${areas.map(a=>`<h2>${a.icono} ${a.nombre}</h2><div class="bien-materias">${a.materias.filter(m=>!m.proximo).map(m=>`<button type="button" class="bien-materia" data-materia="${m.id}" aria-pressed="${elegidas.has(m.id)}"><span aria-hidden="true">${m.icono||m.sigla}</span>${m.nombre}</button>`).join('')}</div>`).join('')}
${pie('Siguiente','bien-sig')}</div>`;
      const p=progreso();
      const conUbicacion=materias.filter(m=>m.lecciones?.length&&(!elegidas.size||elegidas.has(m.id)));
      return `<div class="bienvenida">${puntos()}<h1>Tu meta diaria</h1><p class="intro">Poquito cada día rinde más que mucho de vez en cuando. Cumplirla suma a tu racha 🔥.</p>
<div class="bien-metas">${METAS.map(([t,c])=>`<button type="button" class="bien-meta" data-meta="${t}:${c}" aria-pressed="${p.meta.tipo===t&&p.meta.cantidad===c}"><b>${c}</b> ${t==='minutos'?'minutos':'ejercicios'}</button>`).join('')}</div>
<div class="card" style="margin-top:16px"><h3 style="margin-top:0">¿Ya sabes algo?</h3><p class="nota">Un examen de ubicación corto (10–15 preguntas) marca como dominado lo que ya sabes. Es opcional.</p>
<div class="pila">${conUbicacion.slice(0,4).map(m=>`<button type="button" class="btn ghost ancho" data-ubicacion="${m.id}">📝 Examen de ${m.nombre}</button>`).join('')}</div></div>
<div class="bien-pie"><button type="button" class="btn ghost" id="bien-atras">Atrás</button><button type="button" class="btn" id="bien-fin">¡Empezar!</button></div></div>`;
    },
    alMostrar(){const i=document.getElementById('bien-nombre');i?.addEventListener('input',()=>{nombre=i.value});i?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('bien-sig')?.click()})},
    alClic(t,ir,repintar){
      if(t.id==='bien-sig'){paso++;repintar();window.scrollTo(0,0);return true}
      if(t.id==='bien-atras'){paso--;repintar();window.scrollTo(0,0);return true}
      if(t.dataset.materia){const id=t.dataset.materia;elegidas.has(id)?elegidas.delete(id):elegidas.add(id);t.setAttribute('aria-pressed',String(elegidas.has(id)));return true}
      if(t.dataset.meta){const [tipo,c]=t.dataset.meta.split(':');cambiarMeta(tipo,+c);repintar();return true}
      if(t.dataset.propia!==undefined){materiaPropia=!materiaPropia;t.setAttribute('aria-pressed',String(materiaPropia));return true}
      if(t.id==='bien-saltar'||t.id==='bien-fin'){terminar(ir,materiaPropia&&t.id==='bien-fin'?'mias/nueva':'');return true}
      if(t.dataset.ubicacion){const m=materias.find(x=>x.id===t.dataset.ubicacion);terminar(ir,`${rutaMateria(m)}/ubicacion`);return true}
    }
  };
}

/* ---------- acerca de ---------- */
// Dónde se guardan los datos: el APK usa el almacenamiento del navegador que lo abre (Chrome, si es el predeterminado),
// así que comparte progreso con ese navegador; con otro navegador (Samsung Internet, Edge…) los datos son aparte.
function htmlDatos(){
  const c=contexto(),p=progreso(),r=racha(p),dias=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);
    const f=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return {f,ok:!!p.dias[f]?.ok,l:d.toLocaleDateString('es',{weekday:'narrow'})}});
  return `<p style="margin-top:0">Estás usando ${APP_NOMBRE} desde <b>${c.donde}</b> (${esc(c.navegador)}). Tu progreso y tus notas se guardan en el almacenamiento de <b>${esc(c.navegador)}</b> para <code>${esc(c.origen)}</code>.</p>
<p class="nota">El APK guarda sus datos en el navegador que lo abre (normalmente Chrome): si Chrome es tu navegador, el APK y Chrome comparten la misma racha y las mismas notas. Si usas otro navegador, cada uno tiene sus propios datos: pásalos con <b>Exportar todo</b> e <b>Importar</b>.</p>
<p style="margin-bottom:4px">🔥 Racha: <b>${r} ${r===1?'día':'días'}</b> · últimos 7 días:</p><div class="dias-meta" aria-label="Meta cumplida en los últimos 7 días">${dias.map(d=>`<span class="${d.ok?'ok':''}" title="${d.f}${d.ok?' · meta cumplida':''}">${d.l}</span>`).join('')}</div>
<p class="nota" id="acerca-persistente" style="margin-bottom:0"></p>`;
}
let toquesVersion=0,ultimoToque=0;
export const acerca={
  titulo:'Acerca de',
  vista(){
    const u=usuario();
    return `<div class="nota-cab"><button type="button" class="btn-icono" data-go="perfil" aria-label="Volver a Perfil">←</button><span></span><span></span></div>
<div class="acerca-cab"><img src="icons/icon-192.png" alt="" width="88" height="88"><div><h1 style="margin:0">${APP_NOMBRE}</h1><button type="button" class="enlace nota version-boton" id="acerca-version">Versión ${__VERSION__}</button><p class="nota" id="acerca-estado-version" style="margin:0" role="status">${versionNueva?'✨ Actualización disponible':navigator.onLine===false?'Sin conexión: no se puede revisar ahora':'✅ Al día'}</p></div></div>
<p class="intro">Una app para estudiar ciberseguridad, inglés, matemáticas y ciencia de datos con lecciones cortas, repaso espaciado y metas diarias.</p>
<div class="pila" style="margin:8px 0 16px">${versionNueva?boton({texto:'✨ Actualizar ahora',id:'acerca-actualizar',clase:'ancho'}):boton({texto:'🔄 Buscar actualización',id:'acerca-buscar',clase:'ghost ancho'})}</div>
<h2>💾 Tus datos en este dispositivo</h2>
<div class="card" id="acerca-datos">${htmlDatos()}</div>
<h2>🔒 Privacidad</h2>
<div class="card"><p style="margin-top:0"><b>Tus datos se quedan en tu teléfono.</b> No hay cuentas ni servidores: tu progreso, tus notas y tus fotos se guardan solo en este navegador o app.</p>
<ul class="nota" style="padding-left:20px;margin-bottom:0"><li>Cada persona tiene lo suyo: si compartes la app con amigos, nadie ve tu progreso ni tus notas.</li>
<li>Para cambiar de teléfono usa <b>Exportar todo</b> e <b>Importar</b> (en Perfil).</li>
<li>La IA es opcional y usa <b>tu propia clave</b> (Gemini de Google o Claude de Anthropic), guardada solo en este teléfono. Cuando la usas, el texto o la foto que pides analizar va a ese proveedor; nada más sale de tu teléfono. En el plan gratuito de Gemini, Google puede usar lo que envíes para mejorar sus modelos: no envíes datos personales.</li>
<li>El reconocimiento de voz lo hace tu navegador (en Chrome, con los servidores de Google).</li>
<li>🗳️ En Propuestas, para votar se envía un identificador anónimo de este dispositivo y tus votos o propuestas; nada más. Tu progreso y tus notas siguen solo en tu teléfono.</li></ul></div>
<h2>🤝 Invita a tus amigos</h2>
<div class="card centro"><div class="qr">${htmlQR(APP_URL)}</div><p class="nota" style="word-break:break-all">${APP_URL}</p>${boton({texto:'🤝 Compartir el enlace',id:'acerca-invitar',clase:'ancho'})}</div>
<h2>📲 Instálala</h2>
<div class="pila">${instalada()?'<p class="nota">✅ Ya la estás usando como app instalada.</p>':boton({texto:'📲 Instalar app',id:'acerca-instalar',clase:'ghost ancho'})}
${!esIOS()?`<a class="btn ghost ancho" href="${APK_URL}" rel="noopener">🤖 Descargar app para Android (APK)</a>`:''}</div>
<p class="nota" style="margin-top:24px;text-align:center">Código abierto: <a href="${REPO_URL}" target="_blank" rel="noopener">${REPO_URL.replace('https://','')}</a>${u.nombre?` · Hecho para ti, ${esc(u.nombre)}`:''}</p>`;
  },
  alMostrar(){navigator.storage?.persisted?.().then(x=>{const el=document.getElementById('acerca-persistente');if(el)el.textContent=x?'✅ Almacenamiento persistente: el navegador no borrará estos datos por falta de espacio.':'ℹ️ El navegador podría borrar estos datos si se queda sin espacio: instala la app y haz respaldos de vez en cuando.'}).catch(()=>{})},
  async alClic(t){
    // 7 toques en la versión abren el modo administrador de Propuestas
    if(t.id==='acerca-version'){toquesVersion=Date.now()-ultimoToque<1500?toquesVersion+1:1;ultimoToque=Date.now();if(toquesVersion>=7){toquesVersion=0;document.dispatchEvent(new CustomEvent('ir',{detail:'propuestas/admin'}))}return true}
    if(t.id==='acerca-actualizar'){location.reload();return true}
    if(t.id==='acerca-buscar'){const e=document.getElementById('acerca-estado-version');if(e)e.textContent='Buscando…';const n=await buscarActualizacion();if(e)e.textContent=n?'✨ Actualización disponible':navigator.onLine===false?'Sin conexión: no se puede revisar ahora':'✅ Al día';if(n)t.outerHTML=boton({texto:'✨ Actualizar ahora',id:'acerca-actualizar',clase:'ancho'});return true}
    if(t.id==='acerca-invitar'){await invitar();return true}
    if(t.id==='acerca-instalar'){await instalar();return true}
  }
};
