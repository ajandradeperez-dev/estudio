import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/componentes.css';
import './estilos/secciones.css';
import {$} from './utilidades.js';
import {analizar,rutaMateria,rutaTema} from './nucleo/materias.js';
import {visitar,guardarUltimo,sumarSegundos,registrarSesion,pendientes} from './nucleo/progreso.js';
import {portada,vistaArea,vistaMateria,vistaTema,htmlBarraSup,htmlMigas} from './nucleo/portada.js';
import {vistaHabilidad,vistaCofre,vistaJefe} from './nucleo/habilidad.js';
import {repaso} from './nucleo/repaso.js';
import {perfil} from './nucleo/miprogreso.js';
import {logros} from './nucleo/logros.js';
import {notas} from './nucleo/notas.js';
import {vistaUbicacion} from './nucleo/ubicacion.js';
import {aplicarTema} from './nucleo/ajustes.js';
import {cerrarHoja,intro,boton} from './nucleo/ui.js';
import {cerrarProcedimiento} from './nucleo/procedimiento.js';
import {leccion,rutaLeccion} from './nucleo/materias.js';
import {registerSW} from 'virtual:pwa-register';
import {hablar} from './nucleo/voz.js';

/* Rutas (van en el #hash de la URL): ver analizar() en nucleo/materias.js.
   ''  Aprender (portada) · 'repaso' · 'logros' · 'perfil' · 'notas' · '<área>' · '<área>/<materia>' · '…/<tema>' · '…/l/<lección>' · '…/<sección>'
   Las rutas viejas (#ingles/l/can, #algebra/…, #fw, #progreso) se resuelven y se reescriben a la canónica.
   Cada vista exporta vista() y, si las necesita, alEntrar(), alMostrar(), alSalir(), alClic(t, ir, repintar)
   e inmersiva (true mientras es una sesión de práctica a pantalla completa: sin barras de la app). */
const ESPECIALES={repaso,logros,perfil,notas};
function resolver(ruta){
  const x=analizar(ruta),{m}=x;
  if(x.tipo==='portada')return {...x,v:portada};
  if(x.tipo==='especial')return {...x,v:ESPECIALES[x.ruta]};
  if(x.tipo==='area')return {...x,v:vistaArea(x.area)};
  if(x.tipo==='tema')return {...x,v:vistaTema(m,x.t)};
  if(x.tipo==='leccion')return {...x,v:vistaHabilidad(m,x.l),ultimo:true};
  if(x.tipo==='cofre'){const v=vistaCofre(m,x.t,x.k);return v?{...x,v}:{...x,tipo:'tema',ruta:rutaTema(m,x.t),v:vistaTema(m,x.t)}}
  if(x.tipo==='jefe')return {...x,v:vistaJefe(m,x.t)};
  if(x.tipo==='ubicacion')return {...x,v:vistaUbicacion(m)};
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
const PESTANAS=[['','🏠','Aprender'],['repaso','🔁','Repasar'],['logros','🏆','Logros'],['perfil','👤','Perfil']];
// Pestaña activa: Repasar, Logros y Perfil (incluye Mis notas); todo lo demás es Aprender
const pestana=()=>cur.tipo==='especial'?(cur.ruta==='notas'?'perfil':cur.ruta):'';
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
function go(ruta){
  const nueva=resolver(ruta);
  // Hay una versión nueva instalada: se aplica al cambiar de pantalla, nunca en medio de un ejercicio
  if(hayVersionNueva&&cur&&nueva.ruta!==cur.ruta){
    try{history.replaceState(null,'',nueva.ruta?'#'+nueva.ruta:location.pathname+location.search)}catch(e){}
    location.reload();return;
  }
  cur?.v.alSalir?.();cerrarHoja();cerrarProcedimiento();
  cur=nueva;
  if(cur.seccion)visitar(cur.m.id,cur.seccion);
  // Historial de sesiones por materia (para que "¿Qué sigue?" alterne materias)
  if(cur.m&&!['materia','tema','area'].includes(cur.tipo))registrarSesion(cur.m.id,cur.ruta);
  if(cur.ultimo)guardarUltimo({ruta:cur.ruta,materia:cur.m.id});
  cur.v.alEntrar?.();
  pintar();pintarBarra();
  if(cur.ruta!==anterior){const v=$('#vista');v.classList.remove('entrando');void v.offsetWidth;v.classList.add('entrando');anterior=cur.ruta}
  document.title=cur.ruta?`${cur.v.titulo} · CiberLab`:'CiberLab';
  try{history.replaceState(null,'',cur.ruta?'#'+cur.ruta:location.pathname+location.search)}catch(e){}
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
  if(t.dataset.go!==undefined){go(t.dataset.go);return}
  // Cualquier botón con data-decir lee su texto en inglés (data-lento = velocidad lenta).
  // La vista también recibe el clic (p. ej. para saber si se usó "lento").
  if(t.dataset.decir!==undefined)hablar(t.dataset.decir,{lento:!!t.dataset.lento});
  cur.v.alClic?.(t,cur.ir||go,pintar);
});
window.addEventListener('progreso',()=>{pintarBarra();pintarNav()});
document.addEventListener('repintar',pintar); // p. ej. cuando se acaba el tiempo de un jefe

/* ---------- minutos para la meta diaria: solo cuenta con la pestaña visible y actividad en el último minuto ---------- */
let ultimaAccion=Date.now();
for(const ev of ['pointerdown','keydown','scroll'])document.addEventListener(ev,()=>{ultimaAccion=Date.now()},{passive:true,capture:true});
setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-ultimaAccion<60000)sumarSegundos(15)},15000);

/* ---------- PWA: funciona sin internet y se actualiza sola ---------- */
// El service worker nuevo toma el control solo (autoUpdate); en vez de recargar de golpe, go() recarga al cambiar de pantalla.
let hayVersionNueva=false;
registerSW({
  immediate:true,
  onNeedReload(){hayVersionNueva=true},
  onRegisteredSW(url,reg){
    if(!reg)return;
    const buscar=()=>{if(navigator.onLine)reg.update().catch(()=>{})};
    setInterval(buscar,60*60*1000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')buscar()});
  }
});

const rutaDelHash=()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(e){return ''}};
// Si alguien cambia el #hash a mano o abre un enlace con la app ya abierta (replaceState no dispara este evento)
window.addEventListener('hashchange',()=>{const r=rutaDelHash();if(r!==cur.ruta)go(r)});
go(rutaDelHash());
