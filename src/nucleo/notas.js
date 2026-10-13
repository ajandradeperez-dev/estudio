/* "Mis notas": los resúmenes de 1–2 frases que el usuario escribe al dominar cada lección, por materia y en orden de lección */
import {esc} from '../utilidades.js';
import {materias,leccion} from './materias.js';
import {progreso,borrarNota} from './progreso.js';

const fecha=f=>{const [a,m,d]=f.split('-').map(Number);return new Date(a,m-1,d).toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})};

export const notas={
  titulo:'Mis notas',
  vista(){
    const n=progreso().notas;
    const bloques=materias.map(m=>{
      const ls=(m.lecciones||[]).filter(l=>n[`${m.id}/${l.id}`]);
      return ls.length?`<h2>${m.nombre}</h2>${ls.map(l=>{const k=`${m.id}/${l.id}`,x=n[k];
        return `<div class="card nota"><div class="nota-cab"><button class="enlace" data-go="${m.id}/l/${l.id}">${l.titulo}</button><span class="progress">${fecha(x.fecha)}</span></div>
<p class="nota-texto">${esc(x.texto)}</p><button class="btn ghost btn-chico" data-borrar="${k}" aria-label="Borrar la nota de ${l.titulo}">Borrar</button></div>`}).join('')}`:'';
    }).join('');
    // Notas de lecciones que ya no existen (se borraron o renombraron)
    const huerfanas=Object.keys(n).filter(k=>{const [mid,lid]=k.split('/');const m=materias.find(x=>x.id===mid);return !m||!leccion(m,lid)});
    return `<h1>Mis notas</h1><p class="lead">Tus resúmenes de cada lección dominada y de tus conversaciones con IA. Releerlos es un repaso rápido; escribirlos con tus palabras es lo que fija lo aprendido.</p>
${bloques||'<div class="card"><h3>Todavía no tienes notas</h3><p style="margin:0;color:var(--muted)">Al dominar una lección te pediremos un resumen de 1 o 2 frases y aparecerá aquí.</p></div>'}
${huerfanas.length?`<h2>Otras</h2>${huerfanas.map(k=>`<div class="card nota"><div class="nota-cab"><span>${esc(n[k].titulo||k)}</span><span class="progress">${fecha(n[k].fecha)}</span></div><p class="nota-texto">${esc(n[k].texto)}</p><button class="btn ghost btn-chico" data-borrar="${esc(k)}">Borrar</button></div>`).join('')}`:''}`;
  },
  alClic(t,ir,repintar){
    if(t.dataset.borrar!==undefined){if(confirm('¿Borrar esta nota?')){borrarNota(t.dataset.borrar);repintar()}return true}
  }
};
