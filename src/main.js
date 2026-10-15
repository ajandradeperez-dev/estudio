import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/componentes.css';
import './estilos/secciones.css';
import {$} from './utilidades.js';
import {analizar,rutaMateria,rutaTema,padreDe} from './nucleo/materias.js';
import {visitar,guardarUltimo,sumarSegundos,registrarSesion,pendientes} from './nucleo/progreso.js';
import {portada,vistaArea,vistaMateria,vistaTema,htmlBarraSup,htmlMigas} from './nucleo/portada.js';
import {vistaHabilidad,vistaCofre,vistaJefe} from './nucleo/habilidad.js';
import {repaso} from './nucleo/repaso.js';
import {perfil} from './nucleo/miprogreso.js';
import {logros} from './nucleo/logros.js';
import {vistaNotas} from './nucleo/notas.js';
import {vistaMias} from './nucleo/mias/vistas.js';
import {ajustesIA} from './nucleo/ia-ajustes.js';
import {vistaPropuestas,recibirEnlaceMagico,sincronizarPropuestas} from './nucleo/propuestas/vistas.js';
import {cargarMias} from './nucleo/mias/datos.js';
import {vistaUbicacion} from './nucleo/ubicacion.js';
import {vistaRetos} from './nucleo/vista-retos.js';
import {aplicarTema} from './nucleo/ajustes.js';
import {cerrarHoja,intro,boton,aviso} from './nucleo/ui.js';
import {cerrarProcedimiento} from './nucleo/procedimiento.js';
import {leccion,rutaLeccion} from './nucleo/materias.js';
import {registerSW} from 'virtual:pwa-register';
import {hablar} from './nucleo/voz.js';
import {APP_NOMBRE} from './config.js';
import {acerca,vistaBienvenida,tocaBienvenida,vigilarConexion,avisarVersionNueva,guardarRegistroSW,revisarRecordatorio,sincronizarRecordatorio} from './nucleo/app.js';

/* Rutas (van en el #hash de la URL): ver analizar() en nucleo/materias.js.
   ''  Aprender (portada) · 'repaso' · 'logros' · 'perfil' · 'notas' · '<área>' · '<área>/<materia>' · '…/<tema>' · '…/l/<lección>' · '…/<sección>'
   Las rutas viejas (#ingles/l/can, #algebra/…, #fw, #progreso) se resuelven y se reescriben a la canónica.
   Cada vista exporta vista() y, si las necesita, alEntrar(), alMostrar(), alSalir(), alClic(t, ir, repintar)
   e inmersiva (true mientras es una sesión de práctica a pantalla completa: sin barras de la app). */
const ESPECIALES={repaso,logros,perfil,acerca,'ajustes-ia':ajustesIA,get notas(){return vistaNotas([])},get bienvenida(){return vistaBienvenida()}};
function resolver(ruta){
  const x=analizar(ruta),{m}=x;
  // La primera vez (sin progreso) la portada es la bienvenida: nombre, qué estudiar y meta diaria
  if(x.tipo==='portada')return tocaBienvenida()?{...x,tipo:'especial',ruta:'bienvenida',v:vistaBienvenida()}:{...x,v:portada};
  if(x.tipo==='especial')return {...x,v:ESPECIALES[x.ruta]};
  if(x.tipo==='notas')return {...x,v:vistaNotas(x.resto)};
  if(x.tipo==='mias')return {...x,v:vistaMias(x.resto)};
  if(x.tipo==='propuestas')return {...x,v:vistaPropuestas(x.resto)};
  if(x.tipo==='area')return {...x,v:vistaArea(x.area)};
  if(x.tipo==='tema')return {...x,v:vistaTema(m,x.t)};
  if(x.tipo==='leccion')return {...x,v:vistaHabilidad(m,x.l),ultimo:true};
  if(x.tipo==='cofre'){const v=vistaCofre(m,x.t,x.k);return v?{...x,v}:{...x,tipo:'tema',ruta:rutaTema(m,x.t),v:vistaTema(m,x.t)}}
  if(x.tipo==='jefe')return {...x,v:vistaJefe(m,x.t)};
  if(x.tipo==='ubicacion')return {...x,v:vistaUbicacion(m)};
  if(x.tipo==='retos')return {...x,v:vistaRetos(m,x.t)};
  if(x.tipo==='seccion'){
    const s=m.secciones[x.seccion];
    // Secciones con subrutas (p. ej. estudio/ingles/hablar/dialogo/<id>): el módulo exporta ruta(resto) → {ruta, v}
    if(s.modulo.ruta)return {...x,...s.modulo.ruta(x.resto),ultimo:true};
    // Las secciones llaman a ir('clave') con claves de su propia materia
    const mod=s.modulo;
    return {...x,ruta:`${rutaMateria(m)}/${x.seccion}`,ultimo:true,ir:k=>go(`${rutaMateria(m)}/${k}`),
      v:{titulo:s.titulo,vista:s.propia?mod.vista:()=>cabeceraSeccion(m,s)+mod.vista(),alMostrar:mod.alMostrar,alClic:mod.alClic,alEntrar:mod.alEntrar,alSalir:mod.alSalir,get inmersiva(){return mod.inmersiva?.()}}};
  }
  return {...x,v:vistaMateria(m)};
}

// Cabecera común de una herramienta: título, explicación corta, "¿Cómo se usa?" y "Practicar" (ejercicios que cuentan para su habilidad)
function cabeceraSeccion(m,s){
  const h=s.habilidad&&leccion(m,s.habilidad);
  return `<h1>${s.titulo}</h1>${intro(s.intro||s.desc,s.como||[])}${h?`<div style="margin:0 0 16px">${boton({texto:`🎯 Practicar: ${h.titulo}`,go:rutaLeccion(m,h),clase:'ghost ancho'})}</div>`:''}`;
}

/* ---------- navegación ---------- */
let cur,anterior='';
const PESTANAS=[['','🏠','Aprender'],['repaso','🔁','Repasar'],['notas','📝','Notas'],['logros','🏆','Logros'],['perfil','👤','Perfil']];
// Pestaña activa: Repasar, Notas (con el editor y los resúmenes), Logros y Perfil; todo lo demás es Aprender
const pestana=()=>cur.tipo==='notas'?'notas':cur.tipo==='especial'?cur.ruta:''; // Mis materias (mias) es parte de Aprender
function pintar(){
  const inm=!!cur.v.inmersiva;
  document.body.classList.toggle('sesion-activa',inm);
  $('#vista').innerHTML=(inm?'':htmlMigas(cur))+cur.v.vista();
  cur.v.alMostrar?.();
  if(!inm)cerrarHoja();
  pintarNav();
}
const pintarBarra=()=>{$('#barra').innerHTML=htmlBarraSup()};
function pintarNav(){
  const rep=pendientes().length,act=pestana();
  $('#nav').innerHTML=PESTANAS.map(([ruta,icono,txt])=>`<button class="nav-tab" data-go="${ruta}"${act===ruta?' aria-current="page"':''}><span class="nav-icono" aria-hidden="true">${icono}</span><span>${txt}</span>${ruta==='repaso'&&rep?`<span class="nav-insignia" aria-label="${rep} pendientes">${rep>99?'99+':rep}</span>`:''}</button>`).join('');
}
/* ---------- botón Atrás (Android, PWA, APK/TWA, laptop y el ← de las migas) ----------
   No depende de cuántas entradas tenga el historial: cada pantalla sabe cuál es su ruta padre por su forma (padreDe en
   nucleo/materias.js). Navegar dentro de la app solo REEMPLAZA la entrada actual (replaceState), nunca agrega entradas.
   Colchón de historial: Chrome en Android (y el APK/TWA) SE SALTA con el botón Atrás las entradas agregadas con pushState
   sin que la persona haya tocado la pantalla ("history manipulation intervention"); por eso una sola "trampa" repuesta
   después de cada Atrás no basta (al segundo Atrás se cerraba la app). La app mantiene COLCHON entradas propias encima de
   la base ({i: 0…n}) y las rellena en cada toque o tecla (con activación del usuario no se saltan), al cargar, al volver
   de segundo plano (visibilitychange) y desde la bfcache (pageshow persisted). Cada Atrás baja una entrada: popstate →
   se cierra lo abierto (modal, dibujo, procedimiento), se sale de la práctica con su ✕ o se va a la ruta padre; y se
   intenta reponer lo consumido. Así hay margen para muchos Atrás seguidos sin tocar la pantalla.
   Portada de Aprender: en el teléfono, «Toca otra vez para salir»: se baja hasta la base y un segundo Atrás en 2 s cierra
   la app (en la base ya no hay entradas propias); en la laptop no hace nada. Hay UN solo listener de popstate (este).
   Ninguna pantalla cambia location.hash ni usa location.replace: navegan con go() o con el evento 'ir'. */
const COLCHON=12;
let salida=null,ignorarPop=0;
const urlDe=r=>r?'#'+r:location.pathname+location.search;
const esTelefono=()=>matchMedia('(pointer:coarse)').matches||matchMedia('(display-mode: standalone)').matches||document.referrer.startsWith('android-app://');
const posicion=()=>Number.isInteger(history.state?.i)?history.state.i:0;
// La entrada actual muestra la ruta actual (sin agregar entradas)
function marcar(ruta){try{history.replaceState({i:posicion()},'',urlDe(ruta))}catch(e){}}
// Rellena el colchón hasta COLCHON entradas por encima de la base (lo agregado con un toque no se lo salta Chrome)
function rellenar(){
  if(salida)return;   // esperando el segundo Atrás para salir: no se rellena
  try{let p=posicion();const u=urlDe(cur?.ruta||'');while(p<COLCHON){p++;history.pushState({i:p},'',u)}}catch(e){}
}
// Lo que esté abierto encima de la pantalla se cierra primero (modal, dibujo, procedimiento, hoja de feedback)
function cerrarCapa(){
  const modal=[...document.querySelectorAll('.modal-fondo')].pop();
  if(modal){const b=modal.dataset.atras==='si'?modal.querySelector('[data-r="1"]'):modal.querySelector('[data-r="0"],[data-x],[data-cancelar]');b?b.click():modal.remove();return true}
  const dib=document.querySelector('.dibujo-fondo');if(dib){dib.querySelector('[data-d="cancelar"]')?.click();return true}
  if(document.getElementById('procedimiento')){cerrarProcedimiento();return true}
  // la hoja de feedback de una práctica es parte de la práctica: Atrás sale de la práctica (con su ✕), no pasa a la siguiente pregunta
  const hoja=document.getElementById('hoja');if(hoja&&!cur.v.inmersiva){cerrarHoja();return true}
  return false;
}
// Un nivel hacia atrás (lo usan el botón Atrás del sistema y el ← de las migas)
function atras({sistema=false}={}){
  if(cerrarCapa()){marcar(cur.ruta);return}
  // lección o práctica en curso: su ✕ pregunta "¿Salir de la lección?" (si no respondió nada, sale directo)
  const salir=cur.v.inmersiva&&!document.querySelector('.fin-sesion')&&document.querySelector('#vista [data-salir]');
  if(salir){marcar(cur.ruta);salir.click();return}
  const padre=padreDe(cur);
  if(padre!==null){go(padre);return}
  // portada de Aprender
  marcar('');
  if(!sistema||!esTelefono())return;
  aviso('Toca otra vez para salir',2000);
  // baja hasta la base (sin entradas propias abajo): el siguiente Atrás cierra la app; si pasan 2 s, se rellena otra vez
  const p=posicion();
  if(p>0){ignorarPop++;try{history.go(-p)}catch(e){ignorarPop--}}
  clearTimeout(salida);salida=setTimeout(()=>{salida=null;marcar(cur.ruta);rellenar()},2000);
}
window.addEventListener('popstate',e=>{
  if(!e.state)return;                       // un <a href="#…"> agrega entradas sin estado: lo maneja hashchange
  marcar(cur.ruta);                         // la entrada a la que se bajó muestra la pantalla actual (su hashchange no navega)
  if(ignorarPop){ignorarPop--;return}       // la bajada a la base que hizo la propia app
  if(salida){clearTimeout(salida);salida=null}
  atras({sistema:true});
  if(!salida)rellenar();                    // reponer lo consumido (si Chrome se lo salta, aún quedan entradas abajo)
});
// Rellenar con activación del usuario, al volver de segundo plano y al restaurarse desde la bfcache
// (un toque mientras se espera el segundo Atrás de salida cancela la salida: la persona sigue usando la app)
const cancelarSalida=()=>{if(salida){clearTimeout(salida);salida=null}};
for(const ev of ['pointerdown','keydown'])document.addEventListener(ev,()=>{cancelarSalida();if(posicion()<COLCHON)rellenar()},{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')rellenar()});
addEventListener('pageshow',e=>{if(e.persisted)rellenar()});
// Navegación pedida por otros módulos sin tocar location.hash: document.dispatchEvent(new CustomEvent('ir',{detail:'ruta'}))
document.addEventListener('ir',e=>go(String(e.detail||'')));

function go(ruta){
  const nueva=resolver(ruta);
  if(salida){clearTimeout(salida);salida=null}
  cur?.v.alSalir?.();cerrarHoja();cerrarProcedimiento();
  cur=nueva;
  if(cur.seccion)visitar(cur.m.id,cur.seccion);
  // Historial de sesiones por materia (para que "¿Qué sigue?" alterne materias)
  if(cur.m&&!['materia','tema','area'].includes(cur.tipo))registrarSesion(cur.m.id,cur.ruta);
  if(cur.ultimo)guardarUltimo({ruta:cur.ruta,materia:cur.m.id});
  cur.v.alEntrar?.();
  pintar();pintarBarra();
  if(cur.ruta!==anterior){const v=$('#vista');v.classList.remove('entrando');void v.offsetWidth;v.classList.add('entrando');anterior=cur.ruta}
  document.title=cur.ruta?`${cur.v.titulo} · ${APP_NOMBRE}`:APP_NOMBRE;
  marcar(cur.ruta);   // solo reemplaza la entrada actual: navegar nunca agrega entradas
  rellenar();          // si se navegó justo después de un Atrás en la portada, el colchón vuelve
  window.scrollTo(0,0);
}

aplicarTema();
$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
$('#barra').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
$('#main').addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('[data-go]');if(c&&c.tagName!=='BUTTON')go(c.dataset.go)}});
document.addEventListener('submit',e=>e.preventDefault()); // Enter en una respuesta escrita = clic en "Comprobar"
// Los clics de la vista y de la hoja de feedback (que vive fuera de #vista) van a la vista actual
document.addEventListener('click',e=>{
  if(!e.target.closest('#main,#hoja'))return;
  const t=e.target.closest('button,[data-go],tr[data-pid]'); if(!t)return;
  // el ← de las migas hace lo mismo que el botón Atrás
  if(t.classList.contains('atras')&&t.closest('.migas')){atras();return}
  if(t.dataset.go!==undefined){if(t.tagName==='A')e.preventDefault();go(t.dataset.go);return}
  // Cualquier botón con data-decir lee su texto en inglés (data-lento = velocidad lenta).
  // La vista también recibe el clic (p. ej. para saber si se usó "lento").
  if(t.dataset.decir!==undefined)hablar(t.dataset.decir,{lento:!!t.dataset.lento});
  cur.v.alClic?.(t,cur.ir||go,pintar);
});
let sincRec=null;
// Otra pestaña o la app instalada cambió los datos: se vuelve a leer (si no, una pestaña vieja mostraría la racha de antes)
window.addEventListener('storage',e=>{if(e.key==='ciberlab-progreso'||e.key===null){pintarBarra();pintarNav();if(!cur?.v.inmersiva&&!document.body.classList.contains('editando-nota'))pintar()}});
window.addEventListener('progreso',()=>{pintarBarra();pintarNav();clearTimeout(sincRec);sincRec=setTimeout(sincronizarRecordatorio,2000)});
document.addEventListener('repintar',pintar); // p. ej. cuando se acaba el tiempo de un jefe

/* ---------- minutos para la meta diaria: solo cuenta con la pestaña visible y actividad en el último minuto ---------- */
let ultimaAccion=Date.now();
for(const ev of ['pointerdown','keydown','scroll'])document.addEventListener(ev,()=>{ultimaAccion=Date.now()},{passive:true,capture:true});
setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-ultimaAccion<60000)sumarSegundos(15)},15000);

/* ---------- PWA: funciona sin internet y se actualiza sola ---------- */
// El service worker nuevo toma el control solo (autoUpdate); en vez de recargar de golpe, aparece "Hay una versión nueva · Actualizar".
registerSW({
  immediate:true,
  // Versión nueva ya activa: si la app está en segundo plano o en Aprender, se recarga sola (recarga controlada); si estás en
  // una lección u otra pantalla, aparece «Actualizar» para no cortarte, y se recarga sola la próxima vez que vuelvas a la app.
  onNeedReload(){
    if(document.visibilityState==='hidden'||(cur?.tipo==='portada'&&!document.querySelector('.modal-fondo'))){location.reload();return}
    avisarVersionNueva();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!cur?.v.inmersiva)location.reload()});
  },
  onRegisteredSW(url,reg){
    if(!reg)return;
    guardarRegistroSW(reg);
    const buscar=()=>{if(navigator.onLine)reg.update().catch(()=>{})};
    setInterval(buscar,60*60*1000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')buscar()});
  }
});

const rutaDelHash=()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(e){return ''}};
// Si alguien cambia el #hash a mano o abre un enlace con la app ya abierta (replaceState no dispara este evento)
window.addEventListener('hashchange',()=>{if(recibirEnlaceMagico(location.hash)){go('propuestas/admin');return}const r=rutaDelHash();if(r!==cur.ruta)go(r)});
// Las materias propias se leen de IndexedDB antes de pintar (el repaso y la portada las necesitan); como mucho 1,5 s de espera
await Promise.race([cargarMias(),new Promise(r=>setTimeout(r,1500))]);
window.addEventListener('mias',()=>{pintarNav();if(!cur?.v.inmersiva&&['portada','mias'].includes(cur?.tipo))pintar()});
// Vuelta del enlace mágico del administrador (#access_token=…): se guarda la sesión y se abre el modo administrador
if(recibirEnlaceMagico(location.hash))try{history.replaceState({i:0},'',location.pathname+location.search+'#propuestas/admin')}catch(e){}
// Historial: la entrada base (i: 0) y el colchón encima (ver atras()); también al entrar por un enlace directo o al recargar.
// Al recargar, el navegador conserva las entradas: se sigue desde la posición en que estaba.
try{if(!Number.isInteger(history.state?.i))history.replaceState({i:0},'',location.href)}catch(e){}
go(rutaDelHash());
rellenar();
// Pantalla de bienvenida (splash) fuera en cuanto se pinta la app
{const s=document.getElementById('splash');if(s){s.classList.add('fuera');setTimeout(()=>s.remove(),300)}}
vigilarConexion();
// 🗳️ Votos pendientes y novedades de Propuestas: al abrir y al volver la red (sin bloquear la app)
const sincProp=()=>sincronizarPropuestas().then(()=>{if(cur?.tipo==='portada')pintar()});
sincProp();addEventListener('online',sincProp);
// Recordatorio diario: con la app abierta se revisa cada minuto y al volver a ella
setInterval(revisarRecordatorio,60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revisarRecordatorio()});revisarRecordatorio();
