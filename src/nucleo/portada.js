/* Portada (áreas), página de área (materias), página de materia (temas o lecciones), camino de un tema,
   migas de pan con botón atrás y barra superior (racha, meta diaria, repaso) */
import {esc} from '../utilidades.js';
import {areas,analizar,areaDe,rutaMateria,rutaTema,rutaLeccion} from './materias.js';
import {progreso,datosMateria,nivel,racha,estadoHoy,pendientes} from './progreso.js';
import {barra} from './ui.js';
import {recomendar} from './recomendador.js';
import {repartoUbicacion} from './metodo.js';

const secciones=m=>Object.entries(m.secciones||{});
const dominada=(d,l)=>!!d.lecciones[l.id]?.dominada;
// Lecciones dominadas / existentes de una lista
const conteo=(d,ls)=>({hechas:ls.filter(l=>dominada(d,l)).length,total:ls.length});

export function htmlNivel(xp){
  const n=nivel(xp);
  return `<div class="nivel"><span class="tag on">Nivel ${n.nivel}</span><span class="progress">${xp} XP · faltan ${n.hasta-xp} para el nivel ${n.nivel+1}</span></div>${barra(xp-n.desde,n.hasta-n.desde)}`;
}

/* ---------- barra superior ---------- */
export function htmlBarraSup(){
  const p=progreso(),h=estadoHoy(p),r=racha(p),rep=pendientes(p).length;
  return `<div class="sup-item" title="Días seguidos cumpliendo la meta diaria"><span class="sup-k">Racha</span><strong>${r} ${r===1?'día':'días'}</strong></div>
<div class="sup-item sup-meta" title="Meta diaria"><span class="sup-k">Meta de hoy${h.ok?' · ✓ cumplida':''}</span><strong>${h.hecho}/${h.meta} ${h.tipo==='minutos'?'min':'ejercicios'}</strong>${barra(h.hecho,h.meta)}</div>
<button class="btn${rep?'':' ghost'} sup-repaso" data-go="repaso">Repasar hoy${rep?` · ${rep}`:''}</button>`;
}

/* ---------- migas de pan y botón atrás ---------- */
// Niveles por encima de la pantalla actual: Inicio › área › materia › tema
function niveles(c){
  const n=[{ruta:'',txt:'Inicio'}];
  if(c.tipo==='portada')return {n:[],actual:''};
  if(c.tipo==='especial')return {n,actual:{repaso:'Repasar hoy',progreso:'Mi progreso',notas:'Mis notas'}[c.ruta]};
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
  return `<nav class="migas" aria-label="Ruta"><button class="btn ghost atras" data-go="${esc(atras.ruta)}" aria-label="Volver a ${esc(atras.txt.trim())}">←</button>
<ol>${n.map(x=>`<li><button class="enlace" data-go="${esc(x.ruta)}">${x.txt}</button></li>`).join('')}${actual?`<li aria-current="page">${actual}</li>`:''}</ol></nav>`;
}

/* ---------- "continuar donde te quedaste" ---------- */
function continuar(p){
  const u=p.ultimo; if(!u)return null;
  const x=analizar(u.ruta),m=x.m; if(!m)return null;
  if(x.tipo==='leccion'){
    const l=x.l,d=datosMateria(p,m.id),e=d.enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda],h=d.lecciones[l.id];
    const det=ejs&&e.i<ejs.length?`Ejercicio ${e.i+1} de ${ejs.length}`:h?.dominada?'Lección dominada':h?`Por repetir · ${Math.round(h.mejor*100)}% sin pista`:'Lección sin empezar';
    return {ruta:x.ruta,titulo:l.titulo,detalle:`${m.nombre}${x.t?` · ${x.t.titulo}`:''} · ${det}`};
  }
  if(x.tipo!=='seccion')return null;
  const s=m.secciones[x.seccion];
  return {ruta:x.ruta,titulo:s.titulo,detalle:`${m.nombre} · ${s.grupo||'Sección'}`};
}

// Resumen en una línea de una materia o un área
function resumenMateria(m,d){
  const {hechas,total}=conteo(d,m.lecciones||[]),ss=secciones(m),vis=ss.filter(([k])=>d.visitadas.includes(k)).length;
  return [total?`${hechas}/${total} lecciones`:'',ss.length?`${vis}/${ss.length} herramientas`:'',d.xp?`${d.xp} XP`:''].filter(Boolean).join(' · ');
}
function resumenArea(a,p){
  let hechas=0,total=0,xp=0;
  for(const m of a.materias){const d=datosMateria(p,m.id),c=conteo(d,m.lecciones||[]);hechas+=c.hechas;total+=c.total;xp+=d.xp}
  return {hechas,total,xp,txt:[a.materias.length>1?`${a.materias.length} materias`:'',total?`${hechas}/${total} lecciones dominadas`:'',`${xp} XP`].filter(Boolean).join(' · ')};
}

/* ---------- portada: lo siguiente, continuar y las áreas ---------- */
export const portada={
  titulo:'Inicio',
  vista(){
    const p=progreso(),r=recomendar({},p),c0=continuar(p),c=c0&&c0.ruta!==r.ruta?c0:null;
    return `<h1>¿Qué quieres estudiar hoy?</h1>
<button class="card siguiente-para-ti" data-go="${esc(r.ruta)}"><span class="sup-k">👉 Lo siguiente para ti</span><span class="siguiente-titulo">${esc(r.titulo)}</span><span class="nota">${esc(r.porque)}</span><span class="btn">Empezar</span></button>
${c?`<div class="card continuar"><div><div class="sup-k">Continuar donde te quedaste</div><h3 style="margin:4px 0 2px">${esc(c.titulo)}</h3><p style="margin:0;color:var(--muted)">${esc(c.detalle)}</p></div>
<button class="btn" data-go="${c.ruta}">Continuar</button></div>`:''}
<div class="areas">${areas.map(a=>{const x=resumenArea(a,p);
  return `<button class="card area area-${a.tono||a.id}" data-go="${a.id}"><span class="area-icono" aria-hidden="true">${a.icono}</span>
<span class="area-texto"><span class="area-nombre">${a.nombre}</span><span class="area-desc">${a.descripcion}</span>
<span class="area-resumen">${x.txt}</span>${x.total?barra(x.hechas,x.total):''}</span></button>`}).join('')}</div>`;
  }
};

/* ---------- página de un área: sus materias ---------- */
export function vistaArea(a){
  return {
    titulo:a.nombre,
    vista(){
      const p=progreso();
      return `<div class="area-cab area-${a.tono||a.id}"><span class="area-icono" aria-hidden="true">${a.icono}</span><div><h1 style="margin:0">${a.nombre}</h1><p class="lead" style="margin:4px 0 0">${a.descripcion}</p></div></div>
<div class="grid">${a.materias.map(m=>{const d=datosMateria(p,m.id),{hechas,total}=conteo(d,m.lecciones||[]);
  return `<button class="card click materia area-${a.tono||a.id}" data-go="${rutaMateria(m)}"><span class="materia-cab"><span class="sigla">${m.icono||m.sigla}</span><span class="materia-nombre">${m.nombre}</span></span>
<span class="materia-desc">${m.descripcion}</span><span class="progress">${resumenMateria(m,d)||'Sin empezar'}</span>${total?barra(hechas,total):''}</button>`}).join('')}</div>`;
    }
  };
}

/* ---------- página de una materia ---------- */
export function vistaMateria(m){
  const a=areaDe(m),tono=a.tono||a.id;
  return {
    titulo:m.nombre,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),ls=m.lecciones||[];
      const estado=l=>{const h=d.lecciones[l.id],e=d.enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda];
        if(h?.dominada)return `<span class="tag on">✓ Dominada${h.via==='ubicacion'?' (ubicación)':''}</span>`;
        if(ejs&&e.i<ejs.length)return `<span class="tag on">En curso · ejercicio ${e.i+1} de ${ejs.length}</span>`;
        return h?`<span class="tag warn-tag">Por repetir · ${Math.round(h.mejor*100)}%</span>`:'<span class="tag">Nueva</span>'};
      const sig=ls.find(l=>!dominada(d,l)),u=d.ubicacion,k=repartoUbicacion(ls.length).reduce((a,b)=>a+b,0);
      const ss=secciones(m).filter(([k])=>`${rutaMateria(m)}/${k}`!==m.destacado?.ruta),grupos=[...new Set(ss.map(([,s])=>s.grupo))];
      const temas=m.temas?`<h2>Temas</h2><div class="grid temas">${m.temas.map(t=>{const c=conteo(d,t.lecciones),prox=!t.lecciones.length;
        return `<button class="card click tema area-${tono}${prox?' proximo':''}" data-go="${rutaTema(m,t)}"><span class="tema-icono" aria-hidden="true">${t.icono}</span>
<span class="tema-texto"><span class="tema-titulo">${t.titulo}</span><span class="tema-desc">${t.descripcion}</span>
${prox?'<span class="tag">Próximamente</span>':`<span class="progress">${c.hechas}/${c.total} lecciones${t.proximas.length?` · ${t.proximas.length} próximamente`:''}</span>${barra(c.hechas,c.total)}`}</span></button>`}).join('')}</div>`
        :ls.length?`<h2>Lecciones</h2><div class="grid">${ls.map((l,i)=>`<div class="card click" data-go="${rutaLeccion(m,l)}" tabindex="0">
<div class="progress">Lección ${i+1}${l.nivel?` · ${l.nivel}`:''}</div><h3 style="margin:4px 0">${l.titulo}</h3><p style="margin:0 0 10px;color:var(--muted)">${l.resumen}</p>${estado(l)}</div>`).join('')}</div>`:'';
      return `<div class="area-${tono}"><div class="materia-cab"><span class="sigla">${m.icono||m.sigla}</span><h1 style="margin:0">${m.nombre}</h1></div>
<p class="lead" style="margin-top:8px">${m.intro||m.descripcion}</p>
${m.destacado?`<button class="card destacado" data-go="${m.destacado.ruta}"><span class="destacado-titulo">${m.destacado.titulo}</span><span class="nota">${m.destacado.desc}</span></button>`:''}
<div class="card" style="margin-bottom:14px">${htmlNivel(d.xp)}
${ls.length?`<div class="row materia-acciones">${sig?`<button class="btn" data-go="${rutaLeccion(m,sig)}">${d.lecciones[sig.id]||d.enCurso?.leccion===sig.id?'Seguir':'Empezar'}: ${sig.titulo}</button>`:'<span class="allow">✓ Dominaste todas las lecciones</span>'}
<button class="btn ghost" data-go="${rutaMateria(m)}/ubicacion">${u?'Repetir examen de ubicación':`Examen de ubicación · ${k} preguntas`}</button></div>
<p class="progress" style="margin:8px 0 0">${u?`Ubicación del ${u.fecha}: ${u.aciertos} de ${u.total} aciertos · ${u.dominadas.length} lecciones marcadas como dominadas.`:'¿Ya sabes algo? El examen de ubicación marca como dominadas las lecciones que ya sabes para que no pierdas tiempo.'}</p>`:''}</div>
${temas}
${grupos.map(g=>`<h2>${g||'Herramientas'}</h2><div class="grid">${ss.filter(([,s])=>s.grupo===g).map(([k,s])=>`<div class="card click" data-go="${rutaMateria(m)}/${k}" tabindex="0"><h3>${s.titulo}${d.visitadas.includes(k)?' <span class="tag on">✓ Visitada</span>':''}</h3><p style="margin:0;color:var(--muted)">${s.desc}</p></div>`).join('')}</div>`).join('')}</div>`;
    }
  };
}

/* ---------- camino de lecciones de un tema ---------- */
// Estados: dominada ✓, actual (la primera sin dominar), pendiente (se puede abrir) y próximamente (bloqueada, aún no existe)
export function vistaTema(m,t){
  const a=areaDe(m);
  return {
    titulo:t.titulo,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),c=conteo(d,t.lecciones),actual=t.lecciones.find(l=>!dominada(d,l));
      const nodo=(l,i)=>{const est=dominada(d,l)?'dominada':l===actual?'actual':'pendiente',h=d.lecciones[l.id];
        return `<li class="paso-camino ${est}"><button class="camino-nodo" data-go="${rutaLeccion(m,l)}" aria-label="Lección ${i+1}: ${esc(l.titulo)} (${est})"><span aria-hidden="true">${est==='dominada'?'✓':i+1}</span></button>
<button class="camino-info" data-go="${rutaLeccion(m,l)}"><span class="camino-titulo">${l.titulo}</span><span class="nota">${est==='dominada'?'Dominada':est==='actual'?(h?`Por repetir · ${Math.round(h.mejor*100)}%`:'Te toca esta'):l.resumen}</span></button></li>`};
      const n=t.lecciones.length;
      return `<div class="tema-vista area-${a.tono||a.id}"><div class="area-cab"><span class="area-icono" aria-hidden="true">${t.icono}</span><div><h1 style="margin:0">${t.titulo}</h1><p class="lead" style="margin:4px 0 0">${t.descripcion}</p></div></div>
${n?`<p class="progress">${c.hechas}/${c.total} lecciones dominadas</p>${barra(c.hechas,c.total)}`:''}
${actual?`<div class="row" style="margin:12px 0"><button class="btn" data-go="${rutaLeccion(m,actual)}">${d.lecciones[actual.id]?'Seguir':'Empezar'}: ${actual.titulo}</button></div>`:n?'<p class="allow">✓ Dominaste todo lo disponible de este tema.</p>':''}
<ol class="camino area-${a.tono||a.id}">${t.lecciones.map(nodo).join('')}
${t.proximas.map((x,i)=>`<li class="paso-camino bloqueada"><span class="camino-nodo" aria-hidden="true">🔒</span><span class="camino-info"><span class="camino-titulo">${x}</span><span class="nota">Próximamente</span></span></li>`).join('')}</ol>
${!n?'<p class="nota">Este tema todavía no tiene lecciones. Mientras tanto, sigue con los otros temas de la materia.</p>':''}</div>`;
    }
  };
}
