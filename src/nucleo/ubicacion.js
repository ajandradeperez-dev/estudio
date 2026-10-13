/* Examen de ubicación de una materia: 10–15 preguntas de producción, sin pista.
   Las lecciones en las que aciertas DOMINIO de sus preguntas quedan dominadas y puedes saltarlas. */
import {htmlEjercicio,manejarEjercicio,mostrarResultado,rendirse} from './ejercicios.js';
import {progreso,datosMateria,registrarEjercicio,guardarUbicacion} from './progreso.js';
import {repartoUbicacion,preguntasUbicacion} from './metodo.js';
import {barra} from './ui.js';
import {htmlCierre,xpHoy} from './cierre.js';
import {rutaMateria,rutaLeccion} from './materias.js';

export function vistaUbicacion(m){
  let preguntas=[],i=0,resultados={},nuevas=null,respondida=false,xp0=0;
  const ls=m.lecciones||[];
  function siguiente(repintar){i++;respondida=false;if(i>=preguntas.length)nuevas=guardarUbicacion(m.id,resultados);repintar()}

  return {
    titulo:`Ubicación · ${m.nombre}`,
    alEntrar(){
      const k=repartoUbicacion(ls.length);
      preguntas=ls.flatMap((l,j)=>preguntasUbicacion(l,k[j]).map(x=>({leccion:l,...x})));
      resultados=Object.fromEntries(ls.map(l=>[l.id,[0,0]]));i=0;nuevas=null;respondida=false;xp0=xpHoy();
    },
    vista(){
      const cab=`<h1>Examen de ubicación</h1>`;
      if(!preguntas.length)return `${cab}<p class="lead">Esta materia no tiene lecciones.</p>`;
      if(i<preguntas.length)return `${cab}<p class="lead">Responde sin pista. Si no sabes, pulsa <strong>No lo sé</strong>: es mejor que adivinar. Las lecciones que ya sabes quedarán marcadas como dominadas.</p>
<div class="card"><p class="progress">Pregunta ${i+1} de ${preguntas.length} · ${preguntas[i].leccion.titulo}</p>${barra(i,preguntas.length)}
<div style="margin-top:14px">${htmlEjercicio(preguntas[i].ej,{pista:false})}</div>
<div class="row" style="margin-top:10px"><button class="btn ghost" id="ub-nose">No lo sé</button></div></div>`;
      const fila=l=>{const [ok,t]=resultados[l.id];if(!t)return '';
        return `<li><span>${l.titulo}</span><span class="tag${nuevas.includes(l.id)?' on':''}">${nuevas.includes(l.id)?'✓ Dominada':`${ok} de ${t}`}</span></li>`};
      const dom=datosMateria(progreso(),m.id).lecciones,pendiente=ls.find(l=>!dom[l.id]?.dominada);
      return `${cab}<div class="card"><h3>${nuevas.length?`${nuevas.length} ${nuevas.length===1?'lección dominada':'lecciones dominadas'}`:'Empieza desde la primera lección'}</h3>
<ul class="lista-ubicacion">${ls.map(fila).join('')}</ul>
${htmlCierre({xp:xpHoy()-xp0,aprendido:nuevas.length?[`Ya dominas ${nuevas.length} ${nuevas.length===1?'lección':'lecciones'}: puedes saltarlas.`]:[],excluir:`${rutaMateria(m)}/ubicacion`})}
<div class="row" style="margin-top:12px">${pendiente?`<button class="btn ghost" data-go="${rutaLeccion(m,pendiente)}">Empezar: ${pendiente.titulo}</button>`:''}<button class="btn ghost" data-go="${rutaMateria(m)}">Volver a ${m.nombre}</button></div></div>`;
    },
    async alClic(t,ir,repintar){
      if(i>=preguntas.length)return;
      if(t.id==='ub-sig'){siguiente(repintar);return true}
      const x=preguntas[i];
      if(t.id==='ub-nose'){if(!respondida&&rendirse()){resultados[x.leccion.id][1]++;registrarEjercicio({materia:m.id,correcto:false,repasar:false})}siguiente(repintar);return true}
      const r=await manejarEjercicio(t,x.ej); if(!r)return;
      respondida=true;
      resultados[x.leccion.id][1]++;if(r.correcto)resultados[x.leccion.id][0]++;
      // Lo que no sabes todavía no va al repaso: lo aprenderás en la lección
      registrarEjercicio({materia:m.id,correcto:r.correcto,repasar:false});
      $nose()?.remove();
      mostrarResultado(x.ej,r,`<div class="fb-pie"><span></span><button class="btn" id="ub-sig">${i+1<preguntas.length?'Siguiente':'Ver resultado'}</button></div>`);
      return true;
    }
  };
}
const $nose=()=>document.getElementById('ub-nose');
