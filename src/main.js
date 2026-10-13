import {$} from './utilidades.js';
import {areas,analizar,rutaMateria,rutaTema,rutaLeccion} from './nucleo/materias.js';
import {visitar,guardarUltimo,sumarSegundos,registrarSesion} from './nucleo/progreso.js';
import {portada,vistaArea,vistaMateria,vistaTema,htmlBarraSup,htmlMigas} from './nucleo/portada.js';
import {vistaLeccion} from './nucleo/leccion.js';
import {repaso} from './nucleo/repaso.js';
import {miProgreso} from './nucleo/miprogreso.js';
import {notas} from './nucleo/notas.js';
import {vistaUbicacion} from './nucleo/ubicacion.js';
import {registerSW} from 'virtual:pwa-register';
import {hablar} from './nucleo/voz.js';

/* Rutas (van en el #hash de la URL): ver analizar() en nucleo/materias.js.
   ''  portada · 'repaso' / 'progreso' / 'notas' · '<área>' · '<área>/<materia>' · '…/<tema>' · '…/l/<lección>' · '…/ubicacion' · '…/<sección>'
   Las rutas viejas (#ingles/l/can, #algebra/…, #fw) se resuelven y se reescriben a la canónica.
   Cada vista exporta vista() y, si las necesita, alEntrar(), alMostrar() y alClic(t, ir, repintar). */
function resolver(ruta){
  const x=analizar(ruta),{m}=x;
  if(x.tipo==='portada')return {...x,v:portada};
  if(x.tipo==='especial')return {...x,v:{repaso,progreso:miProgreso,notas}[x.ruta]};
  if(x.tipo==='area')return {...x,v:vistaArea(x.area)};
  if(x.tipo==='tema')return {...x,v:vistaTema(m,x.t)};
  if(x.tipo==='leccion')return {...x,v:vistaLeccion(m,x.l),ultimo:true};
  if(x.tipo==='ubicacion')return {...x,v:vistaUbicacion(m)};
  if(x.tipo==='seccion'){
    const s=m.secciones[x.seccion];
    // Secciones con subrutas (p. ej. estudio/ingles/hablar/dialogo/<id>): el módulo exporta ruta(resto) → {ruta, v}
    if(s.modulo.ruta)return {...x,...s.modulo.ruta(x.resto),ultimo:true};
    // Las secciones llaman a ir('clave') con claves de su propia materia
    return {...x,ruta:`${rutaMateria(m)}/${x.seccion}`,ultimo:true,ir:k=>go(`${rutaMateria(m)}/${k}`),
      v:{titulo:s.titulo,vista:s.modulo.vista,alMostrar:s.modulo.alMostrar,alClic:s.modulo.alClic}};
  }
  return {...x,v:vistaMateria(m)};
}

/* ---------- navegación ---------- */
let cur,anterior='';
function pintar(){$('#vista').innerHTML=htmlMigas(cur)+cur.v.vista();cur.v.alMostrar?.()}
const pintarBarra=()=>{$('#barra').innerHTML=htmlBarraSup()};
function pintarNav(){
  const b=(ruta,txt,cls='')=>`<button data-go="${ruta}"${cls?` class="${cls}"`:''} aria-current="${ruta===cur.ruta}">${txt}</button>`;
  // Dentro de la materia abierta: sus temas, o sus lecciones y secciones
  const sub=m=>{
    if(m.temas)return m.temas.map(t=>b(rutaTema(m,t),`${t.icono} ${t.titulo}`,'sub')).join('');
    const ss=Object.entries(m.secciones||{}),grupos=[...new Set(ss.map(([,s])=>s.grupo))];
    const ls=(m.lecciones?.length&&ss.length?'<div class="navsub">Lecciones</div>':'')+(m.lecciones||[]).map((l,i)=>b(rutaLeccion(m,l),`${i+1}. ${l.titulo}`,'sub')).join('');
    return ls+grupos.map(g=>`${g?`<div class="navsub">${g}</div>`:''}${ss.filter(([,s])=>s.grupo===g).map(([k,s])=>b(`${rutaMateria(m)}/${k}`,s.titulo,'sub')).join('')}`).join('');
  };
  const abierta=m=>m===cur.m;
  $('#nav').innerHTML=`<div class="brand">Ciber<span>Lab</span></div>
${b('','Inicio')}${b('repaso','Repasar hoy')}${b('notas','Mis notas')}${b('progreso','Mi progreso')}
${areas.map(a=>`<div class="navlabel">${a.icono} ${a.nombre}</div>${a.materias.map(m=>b(rutaMateria(m),m.nombre,abierta(m)?'abierta':'')+(abierta(m)?sub(m):'')).join('')}`).join('')}`;
}
function go(ruta){
  const nueva=resolver(ruta);
  // Hay una versión nueva instalada: se aplica al cambiar de pantalla, nunca en medio de un ejercicio
  if(hayVersionNueva&&cur&&nueva.ruta!==cur.ruta){
    try{history.replaceState(null,'',nueva.ruta?'#'+nueva.ruta:location.pathname+location.search)}catch(e){}
    location.reload();return;
  }
  cur=nueva;
  if(cur.seccion)visitar(cur.m.id,cur.seccion);
  // Historial de sesiones por materia (para que "¿Qué sigue?" alterne materias)
  if(cur.m&&!['materia','tema'].includes(cur.tipo))registrarSesion(cur.m.id,cur.ruta);
  if(cur.ultimo)guardarUltimo({ruta:cur.ruta,materia:cur.m.id});
  cur.v.alEntrar?.();
  pintar();pintarNav();pintarBarra();
  if(cur.ruta!==anterior){const v=$('#vista');v.classList.remove('entrando');void v.offsetWidth;v.classList.add('entrando');anterior=cur.ruta}
  document.title=cur.ruta?`${cur.v.titulo} · CiberLab`:'CiberLab';
  try{history.replaceState(null,'',cur.ruta?'#'+cur.ruta:location.pathname+location.search)}catch(e){}
  window.scrollTo(0,0);
}

$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
$('#main').addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('[data-go]');if(c&&c.tagName!=='BUTTON')go(c.dataset.go)}});
$('#main').addEventListener('submit',e=>e.preventDefault()); // Enter en una respuesta escrita = clic en "Comprobar"
$('#main').addEventListener('click',e=>{
  const t=e.target.closest('button,[data-go],tr[data-pid]'); if(!t)return;
  if(t.dataset.go!==undefined){go(t.dataset.go);return}
  // Cualquier botón con data-decir lee su texto en inglés (data-lento = velocidad lenta).
  // La vista también recibe el clic (p. ej. para saber si se usó "lento").
  if(t.dataset.decir!==undefined)hablar(t.dataset.decir,{lento:!!t.dataset.lento});
  cur.v.alClic?.(t,cur.ir||go,pintar);
});
window.addEventListener('progreso',pintarBarra);

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
