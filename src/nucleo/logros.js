/* Pestaña Logros: medallas de toda la app (se calculan a partir del progreso, no se guardan aparte)
   y lo propio de cada materia (progresoHtml: p. ej. las medallas de Inglés · Hablar, guardadas en materias.ingles.extra.medallas). */
import {materias} from './materias.js';
import {progreso,datosMateria,racha,nivel} from './progreso.js';
import {barra} from './ui.js';

const xpTotal=p=>materias.reduce((s,m)=>s+datosMateria(p,m.id).xp,0);
const dominadas=p=>materias.reduce((s,m)=>s+Object.values(datosMateria(p,m.id).lecciones).filter(x=>x?.dominada).length,0);
const ejercicios=p=>Object.values(p.dias).reduce((s,d)=>s+(d?.ej||0),0);
const mejorRacha=p=>Math.max(racha(p),p.mejorRacha||0);
const extra=(p,clave)=>materias.reduce((s,m)=>s+Object.keys(datosMateria(p,m.id).extra?.[clave]||{}).length,0);
// {id, icono, nombre, desc, valor(p), meta}: ganada cuando valor ≥ meta; si no, se ve el avance
export const LOGROS=[
  {id:'primera',icono:'🌱',nombre:'Primer paso',desc:'Domina tu primera habilidad.',valor:dominadas,meta:1},
  {id:'cinco',icono:'🌿',nombre:'En marcha',desc:'Domina 5 habilidades.',valor:dominadas,meta:5},
  {id:'veinte',icono:'🌳',nombre:'Experto',desc:'Domina 20 habilidades.',valor:dominadas,meta:20},
  {id:'racha3',icono:'🔥',nombre:'3 días',desc:'Cumple tu meta 3 días seguidos.',valor:mejorRacha,meta:3},
  {id:'racha7',icono:'⚡',nombre:'Una semana',desc:'Racha de 7 días.',valor:mejorRacha,meta:7},
  {id:'racha30',icono:'💎',nombre:'Un mes',desc:'Racha de 30 días.',valor:mejorRacha,meta:30},
  {id:'cien',icono:'💯',nombre:'100 respuestas',desc:'Responde 100 ejercicios.',valor:ejercicios,meta:100},
  {id:'mil',icono:'🚀',nombre:'1000 respuestas',desc:'Responde 1000 ejercicios.',valor:ejercicios,meta:1000},
  {id:'repasador',icono:'🧠',nombre:'Memoria larga',desc:'Saca 10 ejercicios del repaso por recordarlos meses.',valor:p=>p.dominados||0,meta:10},
  {id:'cofre',icono:'🎁',nombre:'Cazador de cofres',desc:'Abre 5 cofres de repaso.',valor:p=>extra(p,'cofres'),meta:5},
  {id:'jefe',icono:'🏆',nombre:'Jefe vencido',desc:'Vence al jefe de un tema.',valor:p=>extra(p,'jefes'),meta:1},
  {id:'nivel5',icono:'⭐',nombre:'Nivel 5',desc:'Llega al nivel 5 en una materia.',valor:p=>Math.max(...materias.map(m=>nivel(datosMateria(p,m.id).xp).nivel)),meta:5}
];
export const logrosGanados=(p=progreso())=>LOGROS.filter(l=>l.valor(p)>=l.meta);

export const logros={
  titulo:'Logros',
  vista(){
    const p=progreso(),ganados=logrosGanados(p).length;
    const tarjeta=l=>{const v=Math.min(l.valor(p),l.meta),ok=v>=l.meta;
      return `<div class="medalla${ok?' ganada':''}" title="${l.desc}"><span class="medalla-icono" aria-hidden="true">${l.icono}</span><span>${l.nombre}</span>${ok?'<span class="chip ok">✓</span>':`${barra(v,l.meta)}<span class="nota" style="font-size:12px">${v}/${l.meta}</span>`}<span class="oculto">${l.desc}</span></div>`};
    return `<h1>🏆 Logros</h1>
<p class="lead">${ganados?`${ganados} de ${LOGROS.length} medallas · ${xpTotal(p)} XP en total.`:'Aún no tienes medallas. ¡Haz tu primera lección y gana la primera! 🌱'}</p>
<div class="medallas">${LOGROS.map(tarjeta).join('')}</div>
${materias.filter(m=>m.progresoHtml).map(m=>`<h2>${m.icono||''} ${m.nombre}</h2><div class="card">${m.progresoHtml(datosMateria(p,m.id))}</div>`).join('')}`;
  }
};
