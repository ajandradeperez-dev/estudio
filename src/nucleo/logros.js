/* Pestaña Logros: medallas de toda la app. Se CALCULAN a partir del progreso (no se guardan aparte), así que quien ya
   cumplía un logro nuevo lo ve ganado sin migrar nada. Además de las generales, se GENERAN del contenido real:
     - por materia (del registro de materias): primera habilidad dominada, la mitad y la materia completa;
     - Inglés: un logro por nivel MCER (A1, A2, B1, B2: los temas con id de nivel en ingles/temas.js);
     - Python: uno por unidad (sus habilidades dominadas y su laboratorio resuelto) y otro por terminar el curso;
     - Lectura: primer libro terminado, 5 capítulos, un libro en inglés y uno en español (del catálogo).
   Al agregar materias, temas, niveles o libros, sus logros aparecen solos. Y lo propio de cada materia (progresoHtml). */
import {materias} from './materias.js';
import {progreso,datosMateria,racha,nivel} from './progreso.js';
import {barra} from './ui.js';
import {LIBROS} from '../materias/lectura/catalogo.js';
import {LABORATORIO} from '../materias/python/laboratorio.js';

const conHabilidades=()=>materias.filter(m=>!m.proximo&&(m.lecciones||[]).length);
const xpTotal=p=>materias.reduce((s,m)=>s+datosMateria(p,m.id).xp,0);
const dominadas=p=>materias.reduce((s,m)=>s+Object.values(datosMateria(p,m.id).lecciones).filter(x=>x?.dominada).length,0);
const ejercicios=p=>Object.values(p.dias).reduce((s,d)=>s+(d?.ej||0),0);
const mejorRacha=p=>Math.max(racha(p),p.mejorRacha||0);
const extra=(p,clave)=>materias.reduce((s,m)=>s+Object.keys(datosMateria(p,m.id).extra?.[clave]||{}).length,0);
const dominadasDe=(p,m,ids)=>{const l=datosMateria(p,m.id).lecciones;return ids.filter(id=>l[id]?.dominada).length};
// Lectura
const libros=p=>datosMateria(p,'lectura').extra.libros||{};
const capitulosLeidos=p=>Object.values(libros(p)).reduce((s,d)=>s+Object.keys(d?.leidos||{}).length,0);
const terminados=(p,filtro=()=>true)=>LIBROS.filter(filtro).filter(l=>{const d=libros(p)[l.id]?.leidos||{};return l.capitulos.every(c=>d[c.n])}).length;

// {id, icono, nombre, desc, valor(p), meta, grupo}: ganada cuando valor ≥ meta; si no, se ve el avance
const GENERALES=[
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
  {id:'nivel5',icono:'⭐',nombre:'Nivel 5',desc:'Llega al nivel 5 en una materia.',valor:p=>Math.max(0,...materias.map(m=>nivel(datosMateria(p,m.id).xp).nivel)),meta:5}
].map(l=>({...l,grupo:'General'}));

// Generados del contenido
export function logrosDelContenido(){
  const out=[];
  for(const m of conHabilidades()){
    const ids=m.lecciones.map(l=>l.id),n=ids.length,grupo=`${m.icono||m.sigla} ${m.nombre}`;
    out.push({id:`${m.id}-1`,icono:'🎯',nombre:`Primera de ${m.nombre}`,desc:`Domina tu primera habilidad de ${m.nombre}.`,valor:p=>dominadasDe(p,m,ids),meta:1,grupo},
      {id:`${m.id}-mitad`,icono:'🌓',nombre:`Mitad de ${m.nombre}`,desc:`Domina ${Math.ceil(n/2)} de las ${n} habilidades de ${m.nombre}.`,valor:p=>dominadasDe(p,m,ids),meta:Math.ceil(n/2),grupo},
      {id:`${m.id}-completa`,icono:'👑',nombre:`${m.nombre} completa`,desc:`Domina las ${n} habilidades de ${m.nombre}.`,valor:p=>dominadasDe(p,m,ids),meta:n,grupo});
    // Inglés: un logro por nivel MCER (temas con id a1, a2, b1, b2, c1…)
    if(m.id==='ingles')for(const t of (m.temas||[]).filter(t=>/^[abc][12]$/.test(t.id))){const tid=t.lecciones.map(l=>l.id);
      out.push({id:`ingles-${t.id}`,icono:'🇺🇸',nombre:`Inglés ${t.id.toUpperCase()}`,desc:`Domina las ${tid.length} habilidades del nivel ${t.id.toUpperCase()}.`,valor:p=>dominadasDe(p,m,tid),meta:tid.length,grupo})}
    // Python: un logro por unidad (sus habilidades + su laboratorio) y el curso completo
    if(m.id==='python'){
      for(const t of m.temas||[]){const tid=t.lecciones.map(l=>l.id),lab=LABORATORIO.filter(x=>x.unidad===t.id).map(x=>x.id);
        out.push({id:`python-${t.id}`,icono:t.icono||'🐍',nombre:`Python: ${t.titulo}`,desc:`Domina ${tid.length===1?'su habilidad':`sus ${tid.length} habilidades`} y resuelve ${lab.length} ejercicios del laboratorio.`,
          valor:p=>dominadasDe(p,m,tid)+lab.filter(id=>datosMateria(p,'python').extra.lab?.[id]).length,meta:tid.length+lab.length,grupo})}
      const lab=LABORATORIO.map(x=>x.id);
      out.push({id:'python-curso',icono:'🐍',nombre:'Curso de Python',desc:`Domina las ${n} habilidades y resuelve los ${lab.length} ejercicios del laboratorio.`,valor:p=>dominadasDe(p,m,ids)+lab.filter(id=>datosMateria(p,'python').extra.lab?.[id]).length,meta:n+lab.length,grupo});
    }
  }
  // Lectura (del catálogo de libros)
  const g='📚 Lectura',hay=f=>LIBROS.some(f);
  out.push({id:'libro-1',icono:'📖',nombre:'Primer libro',desc:'Termina un libro completo (todos sus capítulos).',valor:p=>terminados(p),meta:1,grupo:g},
    {id:'capitulos-5',icono:'📑',nombre:'5 capítulos',desc:'Lee 5 capítulos.',valor:capitulosLeidos,meta:5,grupo:g});
  if(hay(l=>l.idioma==='en'))out.push({id:'libro-en',icono:'🇺🇸',nombre:'Un libro en inglés',desc:'Termina un libro en inglés.',valor:p=>terminados(p,l=>l.idioma==='en'),meta:1,grupo:g});
  if(hay(l=>l.idioma==='es'))out.push({id:'libro-es',icono:'🇲🇽',nombre:'Un libro en español',desc:'Termina un libro en español.',valor:p=>terminados(p,l=>l.idioma==='es'),meta:1,grupo:g});
  return out;
}
export const LOGROS=[...GENERALES,...logrosDelContenido()];
export const logrosGanados=(p=progreso())=>LOGROS.filter(l=>l.valor(p)>=l.meta);

export const logros={
  titulo:'Logros',
  vista(){
    const p=progreso(),ganados=logrosGanados(p).length;
    const tarjeta=l=>{const v=Math.min(l.valor(p),l.meta),ok=v>=l.meta;
      return `<div class="medalla${ok?' ganada':''}" title="${l.desc}"><span class="medalla-icono" aria-hidden="true">${l.icono}</span><span>${l.nombre}</span>${ok?'<span class="chip ok">✓</span>':`${barra(v,l.meta)}<span class="nota">${v}/${l.meta}</span>`}</div>`};
    const grupos=[...new Set(LOGROS.map(l=>l.grupo))];
    return `<h1>🏆 Logros</h1>
<p class="lead">${ganados?`${ganados} de ${LOGROS.length} medallas · ${xpTotal(p)} XP en total.`:'Aún no tienes medallas. ¡Haz tu primera lección y gana la primera! 🌱'}</p>
${grupos.map(g=>{const ls=LOGROS.filter(l=>l.grupo===g),k=ls.filter(l=>l.valor(p)>=l.meta).length;
  return `<h2>${g} <span class="nota">${k}/${ls.length}</span></h2><div class="medallas">${ls.map(tarjeta).join('')}</div>`}).join('')}
${materias.filter(m=>m.progresoHtml).map(m=>`<h2>${m.icono||''} ${m.nombre}</h2><div class="card">${m.progresoHtml(datosMateria(p,m.id))}</div>`).join('')}`;
  }
};
