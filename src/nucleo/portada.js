/* Pestaña Aprender: portada (áreas), página de área (materias), página de materia (temas o lecciones),
   camino de un tema (nodos en zigzag), migas de pan con botón atrás y barra superior (racha y meta del día) */
import {esc} from '../utilidades.js';
import {areas,analizar,areaDe,rutaMateria,rutaTema,rutaLeccion} from './materias.js';
import {progreso,datosMateria,nivel,racha,estadoHoy} from './progreso.js';
import {barra,chip,tarjetaNav,cabecera,boton} from './ui.js';
import {recomendar} from './recomendador.js';
import {repartoUbicacion} from './metodo.js';

const secciones=m=>Object.entries(m.secciones||{});
const dominada=(d,l)=>!!d.lecciones[l.id]?.dominada;
const conteo=(d,ls)=>({hechas:ls.filter(l=>dominada(d,l)).length,total:ls.length});
const tonoDe=a=>a.tono||a.id;

export function htmlNivel(xp){
  const n=nivel(xp);
  return `<div class="row" style="gap:8px;margin-bottom:8px">${chip(`Nivel ${n.nivel}`,'area')}<span class="nota">${xp} XP · faltan ${n.hasta-xp} para el ${n.nivel+1}</span></div>${barra(xp-n.desde,n.hasta-n.desde)}`;
}

/* ---------- barra superior ---------- */
export function htmlBarraSup(){
  const p=progreso(),h=estadoHoy(p),r=racha(p);
  return `<button class="marca enlace" data-go="" aria-label="CiberLab, ir a Aprender">Ciber<span>Lab</span></button>
<span class="sup-chip fuego" title="Racha: días seguidos cumpliendo la meta">🔥 ${r}<span class="oculto"> ${r===1?'día':'días'} de racha</span></span>
<span class="sup-chip meta" title="Meta de hoy: ${h.hecho} de ${h.meta} ${h.tipo==='minutos'?'minutos':'ejercicios'}">${h.ok?'✅':'🎯'} ${barra(h.hecho,h.meta)}<span class="oculto">Meta de hoy ${h.hecho} de ${h.meta}</span></span>`;
}

/* ---------- migas de pan y botón atrás ---------- */
function niveles(c){
  const n=[{ruta:'',txt:'Aprender'}];
  if(c.tipo==='portada')return {n:[],actual:''};
  if(c.tipo==='especial')return c.ruta==='notas'?{n:[{ruta:'perfil',txt:'Perfil'}],actual:'Mis notas'}:{n:[],actual:''};
  const a=c.area;
  if(c.tipo==='area')return {n,actual:`${a.icono||''} ${a.nombre}`};
  const m=c.m,colapsa=rutaMateria(m)===m.id&&a.id===m.id;
  if(!colapsa)n.push({ruta:a.id,txt:`${a.icono||''} ${a.nombre}`});
  if(c.tipo==='materia')return {n,actual:m.nombre};
  n.push({ruta:rutaMateria(m),txt:m.nombre});
  if(c.tipo==='tema')return {n,actual:`${c.t.icono} ${c.t.titulo}`};
  if(c.tipo==='leccion'){if(c.t)n.push({ruta:rutaTema(m,c.t),txt:`${c.t.icono} ${c.t.titulo}`});return {n,actual:c.l.titulo}}
  if(c.tipo==='ubicacion')return {n,actual:'Examen de ubicación'};
  // Sección: el título solo si es su portada; dentro, la sección pone sus propias migas
  const s=m.secciones[c.seccion];
  return {n,actual:c.resto?.length?'':s.titulo};
}
export function htmlMigas(c){
  const {n,actual}=niveles(c);
  if(!n.length)return '';
  const atras=n[n.length-1];
  return `<nav class="migas" aria-label="Ruta"><button class="btn-icono atras" data-go="${esc(atras.ruta)}" aria-label="Volver a ${esc(atras.txt.trim())}">←</button>
<ol>${n.map(x=>`<li><button class="enlace" data-go="${esc(x.ruta)}">${x.txt}</button></li>`).join('')}${actual?`<li aria-current="page">${actual}</li>`:''}</ol></nav>`;
}

/* ---------- "continuar donde te quedaste" ---------- */
function continuar(p){
  const u=p.ultimo; if(!u)return null;
  const x=analizar(u.ruta),m=x.m; if(!m)return null;
  if(x.tipo==='leccion'){
    const l=x.l,d=datosMateria(p,m.id),e=d.enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda],h=d.lecciones[l.id];
    const det=ejs&&e.i<ejs.length?`Pregunta ${e.i+1} de ${ejs.length}`:h?.dominada?'Dominada':h?`Por repetir · ${Math.round(h.mejor*100)}%`:'Sin empezar';
    return {ruta:x.ruta,titulo:l.titulo,detalle:`${m.nombre} · ${det}`};
  }
  if(x.tipo!=='seccion')return null;
  const s=m.secciones[x.seccion];
  return {ruta:x.ruta,titulo:s.titulo,detalle:m.nombre};
}
const htmlSiguiente=r=>`<button class="siguiente-para-ti" data-go="${esc(r.ruta)}"><span class="sup-k">👉 Lo siguiente para ti</span><span class="siguiente-titulo">${esc(r.titulo)}</span><span class="nota">${esc(r.porque)}</span><span class="btn">Empezar</span></button>`;

function resumenArea(a,p){
  let hechas=0,total=0;
  for(const m of a.materias){const c=conteo(datosMateria(p,m.id),m.lecciones||[]);hechas+=c.hechas;total+=c.total}
  return {hechas,total};
}

/* ---------- Aprender: lo siguiente, continuar y las áreas ---------- */
export const portada={
  titulo:'Aprender',
  vista(){
    const p=progreso(),r=recomendar({},p),c0=continuar(p),c=c0&&c0.ruta!==r.ruta?c0:null;
    return `${htmlSiguiente(r)}
${c?`<div class="card continuar"><div><div class="sup-k">Continuar</div><h3>${esc(c.titulo)}</h3><span class="nota">${esc(c.detalle)}</span></div>${boton({texto:'Seguir',go:c.ruta,clase:'ghost'})}</div>`:''}
<h2>¿Qué quieres aprender?</h2>
<div class="lista-nav">${areas.map(a=>{const x=resumenArea(a,p);
  return tarjetaNav({go:a.id,icono:a.icono,titulo:a.nombre,clase:`area area-${tonoDe(a)}`,
    desc:a.materias.length>1?a.materias.map(m=>m.nombre).join(' · '):a.descripcion,
    pie:x.total?`${barra(x.hechas,x.total)}<span class="nota">${x.hechas}/${x.total} dominadas</span>`:''})}).join('')}</div>`;
  }
};

/* ---------- página de un área: sus materias ---------- */
export function vistaArea(a){
  return {
    titulo:a.nombre,
    vista(){
      const p=progreso();
      return `<div class="area-${tonoDe(a)}">${cabecera({icono:a.icono,titulo:a.nombre,desc:a.descripcion})}
<div class="lista-nav">${a.materias.map(m=>{const d=datosMateria(p,m.id),{hechas,total}=conteo(d,m.lecciones||[]);
  return tarjetaNav({go:rutaMateria(m),icono:m.icono||m.sigla,titulo:m.nombre,desc:m.descripcion,pie:total?`${barra(hechas,total)}<span class="nota">${hechas}/${total} dominadas · ${d.xp} XP</span>`:''})}).join('')}</div></div>`;
    }
  };
}

/* ---------- página de una materia: lo siguiente, temas (o lecciones) y herramientas ---------- */
export function vistaMateria(m){
  const tono=tonoDe(areaDe(m));
  return {
    titulo:m.nombre,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),ls=m.lecciones||[],r=recomendar({materia:m.id},p),u=d.ubicacion,k=repartoUbicacion(ls.length).reduce((a,b)=>a+b,0);
      const ss=secciones(m).filter(([k])=>`${rutaMateria(m)}/${k}`!==m.destacado?.ruta),grupos=[...new Set(ss.map(([,s])=>s.grupo))];
      const temas=m.temas?`<h2>Temas</h2><div class="lista-nav">${m.temas.map(t=>{const c=conteo(d,t.lecciones),prox=!t.lecciones.length;
        return tarjetaNav({go:rutaTema(m,t),icono:t.icono,titulo:t.titulo,desc:t.descripcion,clase:prox?'proximo':'',
          pie:prox?chip('Próximamente'):`${barra(c.hechas,c.total)}<span class="nota">${c.hechas}/${c.total} lecciones${t.proximas.length?` · ${t.proximas.length} pronto`:''}</span>`})}).join('')}</div>`
        :ls.length?`<h2>Lecciones</h2><div class="lista-nav">${ls.map((l,i)=>tarjetaNav({go:rutaLeccion(m,l),icono:dominada(d,l)?'✅':i+1,titulo:l.titulo,desc:l.resumen})).join('')}</div>`:'';
      return `<div class="area-${tono}">${cabecera({icono:m.icono||m.sigla,titulo:m.nombre,desc:m.descripcion})}
${r.ruta?htmlSiguiente(r):''}
${m.destacado?`<button class="destacado" data-go="${m.destacado.ruta}"><span class="destacado-titulo">${m.destacado.titulo}</span><span class="nota">${m.destacado.desc}</span></button>`:''}
<div class="card">${htmlNivel(d.xp)}</div>
${temas}
${ls.length?`<details class="como-se-usa" style="margin-top:16px"><summary>🧭 ¿Ya sabes algo? Examen de ubicación</summary><p class="nota">${u?`Último: ${u.aciertos} de ${u.total} aciertos · ${u.dominadas.length} lecciones marcadas como dominadas.`:`${k} preguntas para saltar lo que ya sabes.`}</p>${boton({texto:u?'Repetir examen':'Hacer el examen',go:`${rutaMateria(m)}/ubicacion`,clase:'ghost'})}</details>`:''}
${grupos.map(g=>`<h2>${g||'Herramientas'}</h2><div class="lista-nav">${ss.filter(([,s])=>s.grupo===g).map(([k,s])=>tarjetaNav({go:`${rutaMateria(m)}/${k}`,icono:d.visitadas.includes(k)?'✅':'🔧',titulo:s.titulo,desc:s.desc})).join('')}</div>`).join('')}</div>`;
    }
  };
}

/* ---------- camino de un tema: nodos circulares en zigzag ---------- */
// dominado (dorado con corona) · actual (anillo pulsante) · pendiente (se puede abrir) · próximamente (bloqueado gris)
const ZIGZAG=[0,52,76,52,0,-52,-76,-52];
export function vistaTema(m,t){
  const tono=tonoDe(areaDe(m));
  return {
    titulo:t.titulo,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),c=conteo(d,t.lecciones),actual=t.lecciones.find(l=>!dominada(d,l));
      let k=0;const x=()=>`--x:${ZIGZAG[k++%ZIGZAG.length]}px`;
      const nodo=l=>{const est=dominada(d,l)?'dominado':l===actual?'actual':'pendiente',h=d.lecciones[l.id];
        return `<li style="${x()}">${l===actual?`<span class="globo">${h?'Seguir':'Empezar'}</span>`:''}<button class="nodo ${est}" data-go="${rutaLeccion(m,l)}" aria-label="${esc(l.titulo)}: ${est}">${est==='dominado'?'👑':est==='actual'?'★':'●'}</button><span class="camino-titulo">${l.titulo}</span></li>`};
      const n=t.lecciones.length;
      return `<div class="area-${tono}">${cabecera({icono:t.icono,titulo:t.titulo,desc:t.descripcion})}
${n?`${barra(c.hechas,c.total)}<p class="nota" style="margin-top:6px">${c.hechas}/${c.total} dominadas</p>`:''}
<ol class="camino">${t.lecciones.map(nodo).join('')}
${t.proximas.map(tit=>`<li style="${x()}"><span class="nodo proximo" aria-hidden="true">🔒</span><span class="camino-titulo">${tit}</span><span class="camino-sub">Próximamente</span></li>`).join('')}</ol>
${!n?'<p class="nota" style="text-align:center">Este tema todavía no tiene lecciones. Sigue con los otros temas de la materia.</p>':''}</div>`;
    }
  };
}
