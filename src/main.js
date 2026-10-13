import {$} from './utilidades.js';
import {materias,materia,leccion} from './nucleo/materias.js';
import {visitar,guardarUltimo,sumarSegundos} from './nucleo/progreso.js';
import {portada,vistaMateria,htmlBarraSup} from './nucleo/portada.js';
import {vistaLeccion} from './nucleo/leccion.js';
import {repaso} from './nucleo/repaso.js';
import {miProgreso} from './nucleo/miprogreso.js';
import {notas} from './nucleo/notas.js';
import {vistaUbicacion} from './nucleo/ubicacion.js';
import {registerSW} from 'virtual:pwa-register';

/* Rutas (van en el #hash de la URL):
   ''                      portada con las materias
   'repaso' / 'progreso' / 'notas'   Repasar hoy / Mi progreso / Mis notas
   '<materia>'             página de la materia
   '<materia>/ubicacion'   examen de ubicación
   '<materia>/l/<lección>' lección en formato común
   '<materia>/<sección>'   sección propia de la materia (p. ej. ciberseguridad/fw)
   Cada vista exporta vista() y, si las necesita, alEntrar(), alMostrar() y alClic(t, ir, repintar). */
function resolver(ruta){
  if(!ruta||ruta==='inicio')return {ruta:'',v:portada};
  if(ruta==='repaso')return {ruta,v:repaso};
  if(ruta==='progreso')return {ruta,v:miProgreso};
  if(ruta==='notas')return {ruta,v:notas};
  // Rutas antiguas de una sola palabra (#fw, #vpn…) de cuando solo existía Ciberseguridad
  if(!ruta.includes('/')&&!materia(ruta)){const m=materias.find(x=>x.secciones?.[ruta]);if(m)ruta=`${m.id}/${ruta}`}
  const [mid,a,b]=ruta.split('/'),m=materia(mid);
  if(!m)return resolver('');
  if(a==='l'&&leccion(m,b))return {ruta:`${m.id}/l/${b}`,m,v:vistaLeccion(m,leccion(m,b)),ultimo:true};
  if(a==='ubicacion'&&m.lecciones?.length)return {ruta:`${m.id}/ubicacion`,m,v:vistaUbicacion(m)};
  const s=a&&m.secciones?.[a];
  // Las secciones llaman a ir('clave') con claves de su propia materia
  if(s)return {ruta:`${m.id}/${a}`,m,seccion:a,ultimo:true,ir:k=>go(`${m.id}/${k}`),
    v:{titulo:s.titulo,vista:s.modulo.vista,alMostrar:s.modulo.alMostrar,alClic:s.modulo.alClic}};
  return {ruta:m.id,m,v:vistaMateria(m)};
}

/* ---------- navegación ---------- */
let cur;
function pintar(){$('#vista').innerHTML=cur.v.vista();cur.v.alMostrar?.()}
const pintarBarra=()=>{$('#barra').innerHTML=htmlBarraSup()};
function pintarNav(){
  const b=(ruta,txt,cls='')=>`<button data-go="${ruta}"${cls?` class="${cls}"`:''} aria-current="${ruta===cur.ruta}">${txt}</button>`;
  const sub=m=>{
    const ss=Object.entries(m.secciones||{}),grupos=[...new Set(ss.map(([,s])=>s.grupo))];
    const ls=(m.lecciones?.length&&ss.length?'<div class="navsub">Lecciones</div>':'')+(m.lecciones||[]).map((l,i)=>b(`${m.id}/l/${l.id}`,`${i+1}. ${l.titulo}`,'sub')).join('');
    return ls+grupos.map(g=>`${g?`<div class="navsub">${g}</div>`:''}${ss.filter(([,s])=>s.grupo===g).map(([k,s])=>b(`${m.id}/${k}`,s.titulo,'sub')).join('')}`).join('');
  };
  $('#nav').innerHTML=`<div class="brand">Ciber<span>Lab</span></div>
${b('','Inicio')}${b('repaso','Repasar hoy')}${b('notas','Mis notas')}${b('progreso','Mi progreso')}
<div class="navlabel">Materias</div>
${materias.map(m=>b(m.id,m.nombre,m===cur.m?'abierta':'')+(m===cur.m?sub(m):'')).join('')}`;
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
  if(cur.ultimo)guardarUltimo({ruta:cur.ruta,materia:cur.m.id});
  cur.v.alEntrar?.();
  pintar();pintarNav();pintarBarra();
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
