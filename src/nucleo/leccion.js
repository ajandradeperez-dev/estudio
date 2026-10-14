/* Vista de una lección (ver "Método de aprendizaje" en CLAUDE.md):
   {titulo, resumen, explicacion:[párrafos], ejemplos:[[texto, nota?]…], rondas:[[ejercicios…],[ejercicios…]]}
   Fases: 'aprender' (explicación corta) → práctica a pantalla completa con el motor de sesiones (una pregunta por pantalla).
   Se domina con DOMINIO de aciertos sin pista; si no, se repite con la otra ronda (ejercicios distintos).
   Al dominarla se pide un resumen de 1–2 frases que se guarda en "Mis notas". */
import {$,esc} from '../utilidades.js';
import {deBanco} from './ejercicios.js';
import {progreso,datosMateria,registrarEjercicio,guardarEnCurso,terminarIntento,programarRepaso,guardarNota} from './progreso.js';
import {DOMINIO,indiceGlobal,esProduccion,frases} from './metodo.js';
import {boton,chip} from './ui.js';
import {crearSesion} from './sesion.js';
import {htmlCierre} from './cierre.js';
import {tema,areaDe,rutaMateria,rutaTema,rutaLeccion} from './materias.js';

export const teoriaLeccion=l=>`${l.explicacion.map(p=>`<p class="lec-p">${p}</p>`).join('')}
<ul class="ejemplos">${l.ejemplos.map(([t,nt])=>`<li><span>${t}</span>${nt?`<span class="nota">${nt}</span>`:''}</li>`).join('')}</ul>`;
export const formNota=(texto='')=>`<div class="nota-form"><label for="lec-nota">Resume en 1 o 2 frases lo que aprendiste (va a Mis notas)
<textarea id="lec-nota" rows="3" maxlength="300">${esc(texto)}</textarea></label>
<div class="row"><button class="btn ghost" id="lec-guardar-nota">Guardar en Mis notas</button><span id="lec-nota-msg" class="nota" role="status"></span></div></div>`;
// Guarda el resumen si tiene 1 o 2 frases y avisa al usuario
export function guardarResumen(materia,leccion){
  const txt=$('#lec-nota').value.trim().replace(/\s+/g,' '),f=frases(txt),msg=$('#lec-nota-msg');
  if(!txt||f<1)msg.textContent='Escribe al menos una frase.';
  else if(f>2)msg.textContent=`Son ${f} frases: resúmelo en 1 o 2.`;
  else{guardarNota(materia,leccion,txt);msg.textContent='✓ Guardado en Mis notas'}
}

export function vistaLeccion(m,l){
  const t=l.tema&&tema(m,l.tema),lista=t?t.lecciones:m.lecciones,clave=`${m.id}/${l.id}`,n=lista.indexOf(l);
  const volver=t?rutaTema(m,t):rutaMateria(m),a=areaDe(m),tono=a.tono||a.id;
  const datos=()=>datosMateria(progreso(),m.id).lecciones[l.id];
  const nota=()=>progreso().notas[clave];
  const rondaSiguiente=()=>(datos()?.intentos||0)%l.rondas.length;
  const reglasRonda=r=>[...new Set(l.rondas[r].map(e=>e.regla).filter(Boolean))].slice(0,3);
  let fase='aprender',ses=null;

  function practicar(ronda,desde=0,ok0=0,xp0=0){
    const ejs=l.rondas[ronda];let res=null;
    ses=crearSesion({
      titulo:l.titulo,tono,salir:volver,
      total:()=>ejs.length-desde,
      siguiente:st=>{const i=desde+st.i;return i<ejs.length?deBanco(ejs[i],{ref:`${m.id}/l/${l.id}/${indiceGlobal(l,ronda,i)}`}):null},
      responder(p,r,st){
        const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
        // Con pista no cuenta para el dominio y vuelve en el repaso, igual que un fallo
        registrarEjercicio({materia:m.id,ref:p.ref,correcto:bien,xp});
        guardarEnCurso(m.id,{leccion:l.id,ronda,i:desde+st.i,ok:ok0+st.ok,xp:xp0+st.xp+xp});
        return {xp,nota:bien?'':'Volverá en Repasar.'};
      },
      fin(st){
        if(!res){res=terminarIntento(m.id,l.id,ok0+st.ok,ejs.length);
          if(res.dominada){ // para recordarla: dos ejercicios de producción de otra ronda vuelven mañana
            const otra=(ronda+1)%l.rondas.length,ya=progreso().repaso;
            programarRepaso(l.rondas[otra].map((ej,i)=>({ej,ref:`${m.id}/l/${l.id}/${indiceGlobal(l,otra,i)}`})).filter(x=>esProduccion(x.ej)&&!ya[x.ref]).slice(0,2).map(x=>x.ref));
          }}
        const pct=Math.round(res.porcentaje*100),xp=xp0+st.xp+res.extra;
        return `<span class="fin-icono" aria-hidden="true">${res.dominada?'🏆':'💪'}</span><h1>${res.dominada?'¡Lección dominada!':'¡Buen intento!'}</h1>
<p class="nota">${res.dominada?`${pct} % sin pista`:`${pct} % sin pista · necesitas ${Math.round(DOMINIO*100)} %. Repite con ejercicios distintos.`}</p>
<div class="fin-datos"><div class="dato xp"><b>+${xp}</b><span>XP</span></div><div class="dato ok"><b>${ok0+st.ok}/${ejs.length}</b><span>Sin pista</span></div><div class="dato"><b>${pct}%</b><span>Acierto</span></div></div>
${res.dominada?formNota(nota()?.texto):`<button class="btn ancho" id="lec-repetir">Repetir con otros ejercicios</button>`}
${htmlCierre({xp,aprendido:reglasRonda(ronda),excluir:rutaLeccion(m,l)})}
<button class="btn ghost ancho" data-go="${volver}">Volver a ${t?t.titulo:m.nombre}</button>`;
      }
    });
    ses.alEntrar();fase='practica';
  }

  return {
    titulo:l.titulo,
    get inmersiva(){return fase==='practica'},
    // Si había una práctica a medias guardada, se retoma
    alEntrar(){
      fase='aprender';ses=null;
      const e=datosMateria(progreso(),m.id).enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda];
      if(ejs&&e.i<ejs.length)practicar(e.ronda,e.i,e.ok||0,e.xp||0);
    },
    alSalir(){ses?.alSalir?.()},
    vista(){
      if(fase==='practica')return ses.vista();
      const d=datos();
      return `<div class="area-${tono}"><p class="etiqueta-actividad">Lección ${n+1} de ${lista.length}${l.nivel?` · ${l.nivel}`:''}</p>
<h1>${l.titulo}</h1><p class="lead">${l.resumen}</p>${d?.dominada?chip('✓ Dominada','ok'):''}
<div class="card" style="margin-top:12px">${teoriaLeccion(l)}</div>
${nota()?`<div class="card nota-propia"><div class="ej-k">Tu resumen</div>${esc(nota().texto)}</div>`:''}
<div style="margin-top:20px">${boton({texto:`${d?.dominada?'Practicar otra vez':'Practicar'} · ${l.rondas[rondaSiguiente()].length} preguntas`,id:'lec-empezar',clase:'ancho area'})}</div></div>`;
    },
    alMostrar(){if(fase==='practica')ses.alMostrar()},
    async alClic(t,ir,repintar){
      if(t.id==='lec-empezar'||t.id==='lec-repetir'){practicar(rondaSiguiente());repintar();window.scrollTo(0,0);return true}
      if(t.id==='lec-guardar-nota'){guardarResumen(m.id,l.id);return true}
      if(fase==='practica')return ses.alClic(t,ir,repintar);
    }
  };
}
