import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/componentes.css';
import './estilos/secciones.css';
import {$} from './utilidades.js';
import {analizar,rutaMateria,rutaTema} from './nucleo/materias.js';
import {visitar,guardarUltimo,sumarSegundos,registrarSesion,pendientes} from './nucleo/progreso.js';
import {portada,vistaArea,vistaMateria,vistaTema,htmlBarraSup,htmlMigas,rutaPadre} from './nucleo/portada.js';
import {vistaHabilidad,vistaCofre,vistaJefe} from './nucleo/habilidad.js';
import {repaso} from './nucleo/repaso.js';
import {perfil} from './nucleo/miprogreso.js';
import {logros} from './nucleo/logros.js';
import {vistaNotas} from './nucleo/notas.js';
import {vistaMias} from './nucleo/mias/vistas.js';
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
import {acerca,vistaBienvenida,tocaBienvenida,vigilarConexion,avisarVersionNueva,revisarRecordatorio,sincronizarRecordatorio} from './nucleo/app.js';

/* Rutas (van en el #hash de la URL): ver analizar() en nucleo/materias.js.
   ''  Aprender (portada) · 'repaso' · 'logros' · 'perfil' · 'notas' · '<área>' · '<área>/<materia>' · '…/<tema>' · '…/l/<lección>' · '…/<sección>'
   Las rutas viejas (#ingles/l/can, #algebra/…, #fw, #progreso) se resuelven y se reescriben a la canónica.
   Cada vista exporta vista() y, si las necesita, alEntrar(), alMostrar(), alSalir(), alClic(t, ir, repintar)
   e inmersiva (true mientras es una sesión de práctica a pantalla completa: sin barras de la app). */
const ESPECIALES={repaso,logros,perfil,acerca,get notas(){return vistaNotas([])},get bienvenida(){return vistaBienvenida()}};
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
/* ---------- botón Atrás (Android, PWA, APK y el ← de la barra) ----------
   La app lleva su propia pila de pantallas y el historial del navegador siempre tiene dos entradas: una "base" y la actual.
   Atrás del sistema → el navegador vuelve a la base (popstate) → atras() decide: cierra el modal u hoja abierta; en una lección
   pregunta antes de salir; en la raíz de una pestaña vuelve a Aprender; si no, a la pantalla anterior (o a la de arriba).
   Después repone la entrada actual. Solo en la portada de Aprender se queda en la base 2 s: un segundo Atrás sale de la app. */
const pila=[],RAICES=['repaso','notas','logros','perfil'];
let enBase=false,salida=null;
const urlDe=r=>r?'#'+r:location.pathname+location.search;
function ponerActual(){try{if(enBase){history.pushState({app:1},'',urlDe(cur.ruta));enBase=false}else history.replaceState({app:1},'',urlDe(cur.ruta))}catch(e){}}
// Lo que esté abierto encima de la pantalla se cierra primero (modal, dibujo, procedimiento, hoja de feedback)
function cerrarCapa(){
  const modal=[...document.querySelectorAll('.modal-fondo')].pop();
  if(modal){const b=modal.querySelector('[data-r="0"],[data-x],[data-cancelar]');b?b.click():modal.remove();return true}
  const dib=document.querySelector('.dibujo-fondo');if(dib){dib.querySelector('[data-d="cancelar"]')?.click();return true}
  if(document.getElementById('procedimiento')){cerrarProcedimiento();return true}
  const hoja=document.getElementById('hoja');if(hoja){const s=hoja.querySelector('#hoja-seguir');s?s.click():cerrarHoja();return true}
  return false;
}
async function atras(){
  clearTimeout(salida);
  if(cerrarCapa())return;
  // lección o práctica en curso: su ✕ pregunta "¿Salir de la lección?" (si no respondió nada, sale directo)
  const salir=cur.v.inmersiva&&!document.querySelector('.fin-sesion')&&document.querySelector('#vista [data-salir]');
  if(salir){salir.click();return}
  if(RAICES.includes(cur.ruta)){pila.length=0;go('',{atras:true});return}
  while(pila.length){const r=pila.pop();if(r!==cur.ruta){go(r,{atras:true});return}}
  if(cur.ruta){go(rutaPadre(cur),{atras:true});return}
  // portada de Aprender: aviso, y un segundo Atrás en 2 s sale (seguimos en la base del historial)
  aviso('Toca otra vez para salir',2000);
  salida=setTimeout(()=>{if(enBase)ponerActual()},2000);
  return 'salir';
}
// Solo volver a la entrada base es un Atrás; abrir un #enlace también dispara popstate (sin estado) y lo maneja hashchange
// (si se vuelve a una entrada vieja de la app —p. ej. tras escribir una URL a mano— también es un Atrás, y esa entrada pasa a ser la actual)
window.addEventListener('popstate',e=>{if(!e.state?.base&&!e.state?.app)return;enBase=!!e.state.base;Promise.resolve(atras()).then(r=>{if(r!=='salir')ponerActual()})});

function go(ruta,{atras:hacia=false}={}){
  const nueva=resolver(ruta);
  if(cur&&nueva.ruta!==cur.ruta){
    // ir a la pantalla de la que vienes cuenta como volver (no se apila dos veces)
    if(hacia||pila[pila.length-1]===nueva.ruta){if(pila[pila.length-1]===nueva.ruta)pila.pop()}
    else{pila.push(cur.ruta);if(pila.length>60)pila.shift()}
  }
  clearTimeout(salida);
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
  ponerActual();
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
  onNeedReload(){avisarVersionNueva()},
  onRegisteredSW(url,reg){
    if(!reg)return;
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
if(recibirEnlaceMagico(location.hash))try{history.replaceState(null,'',location.pathname+location.search+'#propuestas/admin')}catch(e){location.hash='propuestas/admin'}
// Historial: una entrada base y la actual (ver atras())
try{history.replaceState({base:1},'',location.href);history.pushState({app:1},'',location.href)}catch(e){}
go(rutaDelHash());
// Pantalla de bienvenida (splash) fuera en cuanto se pinta la app
{const s=document.getElementById('splash');if(s){s.classList.add('fuera');setTimeout(()=>s.remove(),300)}}
vigilarConexion();
// 🗳️ Votos pendientes y novedades de Propuestas: al abrir y al volver la red (sin bloquear la app)
const sincProp=()=>sincronizarPropuestas().then(()=>{if(cur?.tipo==='portada')pintar()});
sincProp();addEventListener('online',sincProp);
// Recordatorio diario: con la app abierta se revisa cada minuto y al volver a ella
setInterval(revisarRecordatorio,60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revisarRecordatorio()});revisarRecordatorio();
