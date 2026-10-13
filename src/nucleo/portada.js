/* Portada (materias + continuar), página de cada materia y barra superior (racha, meta diaria, repaso) */
import {esc} from '../utilidades.js';
import {materias,materia,leccion} from './materias.js';
import {progreso,datosMateria,nivel,racha,estadoHoy,pendientes} from './progreso.js';
import {barra} from './ui.js';
import {repartoUbicacion} from './metodo.js';

const secciones=m=>Object.entries(m.secciones||{});

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

/* ---------- "continuar donde te quedaste" ---------- */
function continuar(p){
  const u=p.ultimo,m=u&&materia(u.materia); if(!m)return null;
  const [,tipo,id]=u.ruta.split('/');
  if(tipo==='l'){
    const l=leccion(m,id); if(!l)return null;
    const d=datosMateria(p,m.id),e=d.enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda],h=d.lecciones[l.id];
    const det=ejs&&e.i<ejs.length?`Ejercicio ${e.i+1} de ${ejs.length}`:h?.dominada?'Lección dominada':h?`Por repetir · ${Math.round(h.mejor*100)}% sin pista`:'Lección sin empezar';
    return {ruta:u.ruta,titulo:l.titulo,detalle:`${m.nombre} · ${det}`};
  }
  const s=m.secciones?.[tipo];
  return s?{ruta:u.ruta,titulo:s.titulo,detalle:`${m.nombre} · ${s.grupo||'Sección'}`}:null;
}

function resumenMateria(m,d){
  const ls=m.lecciones||[],hechas=ls.filter(l=>d.lecciones[l.id]?.dominada).length,ss=secciones(m),vis=ss.filter(([k])=>d.visitadas.includes(k)).length;
  return [ls.length?`${hechas} de ${ls.length} lecciones dominadas`:'',ss.length?`${vis} de ${ss.length} herramientas visitadas`:''].filter(Boolean).join(' · ');
}

/* ---------- portada ---------- */
export const portada={
  titulo:'Inicio',
  vista(){
    const p=progreso(),c=continuar(p);
    return `<h1>¿Qué quieres estudiar hoy?</h1>
<p class="lead">Elige una materia. Cada lección tiene una explicación corta, ejemplos y práctica; lo que falles vuelve en <strong>Repasar hoy</strong> hasta que lo domines.</p>
${c?`<div class="card continuar"><div><div class="sup-k">Continuar donde te quedaste</div><h3 style="margin:4px 0 2px">${esc(c.titulo)}</h3><p style="margin:0;color:var(--muted)">${esc(c.detalle)}</p></div>
<button class="btn" data-go="${c.ruta}">Continuar</button></div>`:''}
<div class="grid">${materias.map(m=>{const d=datosMateria(p,m.id);
  return `<div class="card click materia" data-go="${m.id}" tabindex="0"><div class="materia-cab"><span class="sigla">${m.sigla}</span><h3 style="margin:0">${m.nombre}</h3></div>
<p style="margin:8px 0 12px;color:var(--muted)">${m.descripcion}</p>${htmlNivel(d.xp)}<p class="progress" style="margin:8px 0 0">${resumenMateria(m,d)}</p></div>`}).join('')}</div>`;
  }
};

/* ---------- página de una materia ---------- */
export function vistaMateria(m){
  return {
    titulo:m.nombre,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),ls=m.lecciones||[];
      const estado=l=>{const h=d.lecciones[l.id],e=d.enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda];
        if(h?.dominada)return `<span class="tag on">✓ Dominada${h.via==='ubicacion'?' (ubicación)':''}</span>`;
        if(ejs&&e.i<ejs.length)return `<span class="tag on">En curso · ejercicio ${e.i+1} de ${ejs.length}</span>`;
        return h?`<span class="tag warn-tag">Por repetir · ${Math.round(h.mejor*100)}%</span>`:'<span class="tag">Nueva</span>'};
      const sig=ls.find(l=>!d.lecciones[l.id]?.dominada),u=d.ubicacion,k=repartoUbicacion(ls.length).reduce((a,b)=>a+b,0);
      const grupos=[...new Set(secciones(m).map(([,s])=>s.grupo))];
      return `<div class="materia-cab"><span class="sigla">${m.sigla}</span><h1 style="margin:0">${m.nombre}</h1></div>
<p class="lead" style="margin-top:8px">${m.intro||m.descripcion}</p>
<div class="card" style="margin-bottom:14px">${htmlNivel(d.xp)}
${ls.length?`<div class="row materia-acciones">${sig?`<button class="btn" data-go="${m.id}/l/${sig.id}">${d.lecciones[sig.id]||d.enCurso?.leccion===sig.id?'Seguir':'Empezar'}: ${sig.titulo}</button>`:'<span class="allow">✓ Dominaste todas las lecciones</span>'}
<button class="btn ghost" data-go="${m.id}/ubicacion">${u?'Repetir examen de ubicación':`Examen de ubicación · ${k} preguntas`}</button></div>
<p class="progress" style="margin:8px 0 0">${u?`Ubicación del ${u.fecha}: ${u.aciertos} de ${u.total} aciertos · ${u.dominadas.length} lecciones marcadas como dominadas.`:'¿Ya sabes algo? El examen de ubicación marca como dominadas las lecciones que ya sabes para que no pierdas tiempo.'}</p>`:''}</div>
${ls.length?`<h2>Lecciones</h2><div class="grid">${ls.map((l,i)=>`<div class="card click" data-go="${m.id}/l/${l.id}" tabindex="0">
<div class="progress">Lección ${i+1}${l.nivel?` · ${l.nivel}`:''}</div><h3 style="margin:4px 0">${l.titulo}</h3><p style="margin:0 0 10px;color:var(--muted)">${l.resumen}</p>${estado(l)}</div>`).join('')}</div>`:''}
${grupos.map(g=>`<h2>${g||'Herramientas'}</h2><div class="grid">${secciones(m).filter(([,s])=>s.grupo===g).map(([k,s])=>`<div class="card click" data-go="${m.id}/${k}" tabindex="0"><h3>${s.titulo}${d.visitadas.includes(k)?' <span class="tag on">✓ Visitada</span>':''}</h3><p style="margin:0;color:var(--muted)">${s.desc}</p></div>`).join('')}</div>`).join('')}`;
    }
  };
}
