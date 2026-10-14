/* Examen de ubicación de una materia: 10–15 preguntas de producción, sin pista.
   Las lecciones en las que aciertas DOMINIO de sus preguntas quedan dominadas y puedes saltarlas. */
import {deBanco} from './ejercicios.js';
import {progreso,datosMateria,registrarEjercicio,guardarUbicacion} from './progreso.js';
import {repartoUbicacion,preguntasUbicacion} from './metodo.js';
import {crearSesion} from './sesion.js';
import {boton,intro} from './ui.js';
import {htmlCierre} from './cierre.js';
import {areaDe,rutaMateria,rutaLeccion} from './materias.js';

export function vistaUbicacion(m){
  // Solo las habilidades con lección escrita (sus preguntas de la última ronda)
  const ls=(m.lecciones||[]).filter(l=>l.rondas?.length),a=areaDe(m),tono=a.tono||a.id;
  let fase='inicio',ses=null;
  function empezar(){
    const k=repartoUbicacion(ls.length),preguntas=ls.flatMap((l,j)=>preguntasUbicacion(l,k[j]).map(x=>({leccion:l,...x})));
    const resultados=Object.fromEntries(ls.map(l=>[l.id,[0,0]]));let nuevas=null;
    ses=crearSesion({
      titulo:`Ubicación · ${m.nombre}`,tono,salir:rutaMateria(m),rendirse:true,sinPistas:true,
      total:()=>preguntas.length,
      siguiente:st=>{const x=preguntas[st.i];return x?{...deBanco(x.ej),leccion:x.leccion.id}:null},
      responder(p,r){
        resultados[p.leccion][1]++;if(r.correcto)resultados[p.leccion][0]++;
        // Lo que no sabes todavía no va al repaso: lo aprenderás en la lección
        registrarEjercicio({materia:m.id,correcto:r.correcto,repasar:false});
        return {xp:r.correcto?10:0};
      },
      fin(st){
        if(!nuevas)nuevas=guardarUbicacion(m.id,resultados);
        const dom=datosMateria(progreso(),m.id).lecciones,pendiente=ls.find(l=>!dom[l.id]?.dominada);
        const fila=l=>{const [ok,t]=resultados[l.id];if(!t)return '';
          return `<li><span>${l.titulo}</span><span class="chip${nuevas.includes(l.id)?' ok':''}">${nuevas.includes(l.id)?'✓ Dominada':`${ok} de ${t}`}</span></li>`};
        return `<span class="fin-icono" aria-hidden="true">🧭</span><h1>${nuevas.length?`${nuevas.length} ${nuevas.length===1?'lección dominada':'lecciones dominadas'}`:'Empieza desde el principio'}</h1>
<ul class="lista-ubicacion">${ls.map(fila).join('')}</ul>
${pendiente?boton({texto:`Empezar: ${pendiente.titulo}`,go:rutaLeccion(m,pendiente),clase:'ancho'}):''}
${htmlCierre({xp:st.xp,aprendido:nuevas.length?[`Ya dominas ${nuevas.length} ${nuevas.length===1?'lección':'lecciones'}: puedes saltarlas.`]:[],excluir:`${rutaMateria(m)}/ubicacion`})}`;
      }
    });
    ses.alEntrar();fase='sesion';
  }
  return {
    titulo:`Ubicación · ${m.nombre}`,
    get inmersiva(){return fase==='sesion'},
    alEntrar(){fase='inicio';ses=null},
    alSalir(){ses?.alSalir?.()},
    vista(){
      if(fase==='sesion')return ses.vista();
      if(!ls.length)return `<h1>Examen de ubicación</h1><p class="lead">Esta materia no tiene lecciones.</p>`;
      const n=repartoUbicacion(ls.length).reduce((x,y)=>x+y,0);
      return `<div class="area-${tono}"><h1>🧭 Examen de ubicación</h1>${intro(`${n} preguntas para saltar lo que ya sabes de ${m.nombre}.`,['Responde sin pista.','Si no sabes, toca <b>No lo sé</b>: es mejor que adivinar.','Las lecciones que ya sabes quedan como dominadas.'])}
${boton({texto:'Empezar',id:'ub-empezar',clase:'ancho area'})}</div>`;
    },
    alMostrar(){if(fase==='sesion')ses.alMostrar()},
    async alClic(t,ir,repintar){
      if(t.id==='ub-empezar'){empezar();repintar();return true}
      if(fase==='sesion')return ses.alClic(t,ir,repintar);
    }
  };
}
