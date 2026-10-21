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
import {registrar} from './nucleo/diagnostico.js';
import {vistaPropuestas,recibirEnlaceMagico,sincronizarPropuestas} from './nucleo/propuestas/vistas.js';
import {cargarMias} from './nucleo/mias/datos.js';
import {vistaUbicacion} from './nucleo/ubicacion.js';
import {vistaRetos} from './nucleo/vista-retos.js';
import {vistaExamenFinal,vistaCertificado} from './nucleo/examen.js';
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
import {vistaDiagPasos} from './nucleo/diag-pasos.js';
const ESPECIALES={repaso,logros,perfil,acerca,'ajustes-ia':ajustesIA,get notas(){return vistaNotas([])},get bienvenida(){return vistaBienvenida()}};
function resolver(ruta){
  const x=analizar(ruta),{m}=x;
  // La primera vez (sin progreso) la portada es la bienvenida: nombre, qué estudiar y meta diaria
  if(x.tipo==='portada')return tocaBienvenida()?{...x,tipo:'especial',ruta:'bienvenida',v:vistaBienvenida()}:{...x,v:portada};
  if(x.diag)return {...x,v:vistaDiagPasos(x.diag)};
  if(x.tipo==='especial')return {...x,v:ESPECIALES[x.ruta]};

  if(x.tipo==='notas')return {...x,v:vistaNotas(x.resto)};
  if(x.tipo==='mias')return {...x,v:vistaMias(x.resto)};
  if(x.tipo==='propuestas')return {...x,v:vistaPropuestas(x.resto)};
  if(x.tipo==='area')return {...x,v:vistaArea(x.area)};
  if(x.tipo==='tema')return {...x,v:vistaTema(m,x.t)};
  if(x.tipo==='leccion')return {...x,v:vistaHabilidad(m,x.l),ultimo:true};
  if(x.tipo==='cofre'){const v=vistaCofre(m,x.t,x.k);return v?{...x,v}:{...x,tipo:'tema',ruta:rutaTema(m,x.t),v:vistaTema(m,x.t)}}
  if(x.tipo==='jefe')return {...x,v:vistaJefe(m,x.t)};
  if(x.tipo==='examen-final')return {...x,v:vistaExamenFinal(m)};
  if(x.tipo==='certificado')return {...x,v:vistaCertificado(m)};
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
  if(inm&&!enPop&&pintadaRuta===cur.ruta&&!pintadaInm&&!est()?.inm){const e=est()||{};empujar(cur.ruta,{inm:1,desde:e.i??0})}
  pintadaRuta=cur.ruta;pintadaInm=inm;
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
/* ---------- historial y botón Atrás (Android, APK/TWA, PWA, laptop y el ← de las migas) ----------
   El historial del navegador ES la pila de pantallas: UNA entrada por cada navegación que hace la persona, creada con
   pushState de forma síncrona dentro del toque o clic (lleva la activación del usuario; Chrome en Android se salta con el
   botón Atrás las entradas agregadas sin ella, "history manipulation intervention"). Las navegaciones automáticas
   (redirecciones, rutas viejas, la vuelta de un enlace) usan replaceState. No hay entradas de relleno ni trampas.
   - popstate SOLO pinta la ruta guardada en la entrada (o cierra la capa de encima): nunca hace push ni replace.
   - Capas (modal, hoja de feedback, procedimiento, dibujo, visor): cada una agrega su propia entrada al abrirse (se abren
     con un toque) y Atrás la cierra; si se cierra con su botón, la app quita su entrada con history.back().
   - Práctica (vista inmersiva sobre la misma ruta): al empezarla con un toque se agrega una entrada; Atrás sale de ella.
   - Enlace directo o recarga en una ruta profunda: al PRIMER toque se reconstruye la cadena de padres (Aprender → … →
     la pantalla) con pushState, ya con activación, para que Atrás baje nivel por nivel.
   - Portada de Aprender: debajo queda una entrada "base"; Atrás llega a ella y muestra «Toca otra vez para salir»; el
     siguiente Atrás ya no tiene entradas de la app y cierra (en la laptop, sale de la página).
   Estado de cada entrada: {app:1, i (posición), ruta, inm? (práctica), capa? (id), desde? (posición de la pantalla debajo)}.
   Diagnóstico: los últimos 30 eventos se guardan (nucleo/diagnostico.js) y se ven en Acerca de (3 toques en la versión). */
let colaIr=null,enPop=false,ignorarPop=0,traversando=false,capaN=0,pintadaRuta=null,pintadaInm=false;
const urlDe=r=>r?'#'+r:location.pathname+location.search;
const est=()=>history.state&&history.state.app?history.state:null;
const pos=()=>est()?.i??0;
function empujar(ruta,extra={}){try{history.pushState({app:1,i:pos()+1,ruta,...extra},'',urlDe(ruta));registrar('push',{ruta,nota:extra.capa?'capa':extra.inm?'práctica':'',enPop})}catch(e){}}
function reemplazar(ruta,extra={}){try{const e=est()||{};history.replaceState({app:1,i:e.i??0,ruta,...(e.base&&ruta===''?{base:1}:{}),...extra},'',urlDe(ruta));registrar('replace',{ruta,enPop})}catch(e){}}
// Primer toque: si la app se abrió en una ruta profunda (enlace o recarga sin cadena), reconstruye Aprender → padres → pantalla;
// en la portada sin nada debajo, agrega la entrada de la portada sobre la base (así Atrás muestra «Toca otra vez para salir»)
function alPrimerToque(){
  if(enPop||!cur)return;
  const e=est();
  if(e&&e.i>0)return;
  if(cur.tipo==='portada'){if(!e||e.i===0){reemplazar('',{base:1});empujar('')}return}
  if(e&&e.cadena)return;
  const cadena=[];let r=padreDe(cur);
  while(r!==null&&r!==undefined&&cadena.length<12){cadena.unshift(r);r=r===''?null:padreDe(r)}
  try{
    history.replaceState({app:1,i:0,ruta:'',base:1},'',urlDe(''));
    let k=0;for(const x of cadena){history.pushState({app:1,i:++k,ruta:x},'',urlDe(x))}
    history.pushState({app:1,i:++k,ruta:cur.ruta,cadena:1},'',urlDe(cur.ruta));
    registrar('cadena',{ruta:cur.ruta,nota:cadena.join(' > ')||'(portada)'});
  }catch(x){}
}
for(const ev of ['pointerdown','keydown'])document.addEventListener(ev,alPrimerToque,{capture:true,passive:true});

/* ---------- capas con su propia entrada ---------- */
const SELECTOR_CAPA='.modal-fondo,.dibujo-fondo,#procedimiento,#hoja';
// Cierra una capa sin tocar el historial (la llama popstate): cancelar en modales, cerrar procedimiento/hoja/dibujo
function cerrarElemento(el){
  if(el.matches('.modal-fondo')){const b=el.querySelector('[data-r="0"],[data-x],[data-cancelar],.cerrar,[aria-label="Cerrar"]');b?b.click():el.remove();return}
  if(el.matches('.dibujo-fondo')){const b=el.querySelector('[data-d="cancelar"]');b?b.click():el.remove();return}
  if(el.id==='procedimiento'){cerrarProcedimiento();return}
  if(el.id==='hoja'){cerrarHoja();return}
  el.remove();
}
new MutationObserver(cambios=>{
  for(const c of cambios){
    for(const n of c.addedNodes){if(n.nodeType!==1||!n.matches(SELECTOR_CAPA)||n.dataset.capa)continue;
      n.dataset.capa=String(++capaN);
      if(!enPop){const e=est()||{};empujar(cur.ruta,{capa:capaN,inm:e.inm,desde:e.desde??e.i??0})}}
    for(const n of c.removedNodes){if(n.nodeType!==1||!n.dataset?.capa||n.dataset.sinVolver)continue;
      // cerrada con su propio botón: se quita su entrada (si sigue siendo la de arriba y no hay ya un regreso en camino,
      // p. ej. «Salir» de la práctica, que vuelve de un salto a la pantalla de abajo)
      const id=+n.dataset.capa;
      setTimeout(()=>{if(!traversando&&!enPop&&est()?.capa===id){traversando=true;ignorarPop++;registrar('back',{ruta:cur.ruta,nota:'cerrar capa'});history.back()}},0);}
  }
}).observe(document.body,{childList:true});

window.addEventListener('popstate',e=>{
  registrar('popstate',{ruta:e.state?.ruta,nota:ignorarPop?'propio':''});
  if(ignorarPop){ignorarPop--;traversando=false;if(colaIr){const r=colaIr;colaIr=null;go(r)}return}
  const s=e.state&&e.state.app?e.state:null;
  enPop=true;
  try{
    // 1) capas abiertas que ya no tienen su entrada: se cierran (de arriba hacia abajo)
    const abiertas=[...document.querySelectorAll(SELECTOR_CAPA)].filter(x=>x.dataset.capa).sort((a,b)=>+b.dataset.capa-+a.dataset.capa);
    for(const el of abiertas)if(!s?.capa||+el.dataset.capa>s.capa){el.dataset.sinVolver='1';cerrarElemento(el)}
    // 2) la pantalla de la entrada (sin práctica si la entrada no es de práctica)
    const ruta=s?s.ruta:rutaDelHash();
    if(ruta!==cur.ruta||(cur.v.inmersiva&&!s?.inm))go(ruta,{modo:'pop'});
    // 3) en la base de la portada: aviso de salida (el siguiente Atrás cierra la app)
    else if(s?.base&&cur.tipo==='portada')aviso('Toca otra vez para salir',2000);
  }finally{enPop=false}
});
// El ← de las migas: un Atrás si hay una pantalla de la app debajo; si no (enlace directo sin toques), va al padre
function atras(){if(pos()>0){registrar('back',{ruta:cur.ruta,nota:'← migas'});history.back()}else{const p=padreDe(cur);if(p!==null)go(p,{modo:'replace'})}}
// Navegación pedida por otros módulos: document.dispatchEvent(new CustomEvent('ir',{detail:'ruta'})) o {detail:{ruta, reemplazar:true}}
document.addEventListener('ir',e=>{const d=e.detail;typeof d==='object'&&d?go(String(d.ruta||''),{modo:d.reemplazar?'replace':'push'}):go(String(d||''))});

/* modo: 'push' (la persona navegó: una entrada nueva, síncrona dentro de su toque) · 'replace' (automático) · 'pop' (Atrás:
   solo pinta). Volver a la misma ruta saliendo de una práctica o capa regresa a su entrada en vez de agregar otra. */
function go(ruta,{modo='push'}={}){
  // un regreso propio en camino (p. ej. al cerrar un diálogo con su botón): se navega cuando termine, si no el
  // history.back() llegaría después del push y devolvería a la pantalla de antes
  if(modo==='push'&&traversando){colaIr=ruta;registrar('nav',{ruta,nota:'en cola'});return}
  const nueva=resolver(ruta),e=est();
  registrar('nav',{ruta:nueva.ruta,nota:modo});
  if(modo==='push'&&cur){
    if((e?.inm||e?.capa)&&nueva.ruta===e.ruta&&e.desde!==undefined&&e.i>e.desde){   // salir de la práctica o capa: un solo salto
      document.querySelectorAll('[data-capa]').forEach(x=>{x.dataset.sinVolver='1'});
      traversando=true;ignorarPop++;registrar('back',{ruta:nueva.ruta,nota:`salto ${e.desde-e.i}`});history.go(e.desde-e.i)}
    else if(e?.capa)reemplazar(nueva.ruta);              // una capa (p. ej. la hoja) que lleva a otra pantalla: la reemplaza
    else if(nueva.ruta===cur.ruta)reemplazar(nueva.ruta);
    else empujar(nueva.ruta);
  }else if(modo==='replace'||!cur){if(!enPop)reemplazar(nueva.ruta)}
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
// (cuando lo dispara un Atrás, popstate ya pintó esa ruta y aquí no pasa nada)
window.addEventListener('hashchange',()=>{if(recibirEnlaceMagico(location.hash)){go('propuestas/admin',{modo:'replace'});return}const r=rutaDelHash();if(r!==cur.ruta)go(r,{modo:'replace'})});   // la entrada que creó el navegador queda con la ruta canónica
// Las materias propias se leen de IndexedDB antes de pintar (el repaso y la portada las necesitan); como mucho 1,5 s de espera
await Promise.race([cargarMias(),new Promise(r=>setTimeout(r,1500))]);
window.addEventListener('mias',()=>{pintarNav();if(!cur?.v.inmersiva&&['portada','mias'].includes(cur?.tipo))pintar()});
// Vuelta del enlace mágico del administrador (#access_token=…): se guarda la sesión y se abre el modo administrador
if(recibirEnlaceMagico(location.hash))try{history.replaceState({app:1,i:0,ruta:'propuestas/admin'},'',location.pathname+location.search+'#propuestas/admin')}catch(e){}
// Primera pantalla: sin agregar entradas. Al recargar, el navegador conserva las entradas de la app y su estado.
registrar('carga',{ruta:rutaDelHash(),nota:document.referrer?'referrer '+document.referrer:''});
go(rutaDelHash(),{modo:'replace'});
// Pantalla de bienvenida (splash) fuera en cuanto se pinta la app
{const s=document.getElementById('splash');if(s){s.classList.add('fuera');setTimeout(()=>s.remove(),300)}}
vigilarConexion();
// 🗳️ Votos pendientes y novedades de Propuestas: al abrir y al volver la red (sin bloquear la app)
const sincProp=()=>sincronizarPropuestas().then(()=>{if(cur?.tipo==='portada')pintar()});
sincProp();addEventListener('online',sincProp);
// Recordatorio diario: con la app abierta se revisa cada minuto y al volver a ella
setInterval(revisarRecordatorio,60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revisarRecordatorio()});revisarRecordatorio();
