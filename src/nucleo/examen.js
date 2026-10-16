/* Exámenes: simulacros de tema (retos con simulacro:true) y examen final acumulativo de cada materia, con tiempo, sin pistas
   y sin feedback hasta el final; al terminar, calificación y revisión de cada error con su procedimiento.
   El examen final guarda el mejor resultado en materias.<id>.extra.examenFinal {fecha, ok, total, pct}; con 70 % o más se
   abre el certificado interno (constancia de práctica de la app, SIN valor oficial: así lo dice la pantalla).
   Rutas: <materia>/examen-final y <materia>/certificado. */
import {esc} from '../utilidades.js';
import {crearSesion} from './sesion.js';
import {crear} from './generadores/index.js';
import {GENERADORES} from './generadores/index.js';
import {progreso,datosMateria,registrarEjercicio,cambiarExtra,hoy} from './progreso.js';
import {abrirProcedimiento} from './procedimiento.js';
import {conFormulas} from './formula.js';
import {cabecera,boton,barra} from './ui.js';
import {crearRng} from './rng.js';
import {rutaMateria,areaDe} from './materias.js';
import {cobertura,estadoMateria,textoCobertura} from './contenido.js';
import {usuario} from './usuario.js';
import {APP_NOMBRE} from '../config.js';

export const APROBAR=0.7,PREGUNTAS_FINAL=20,SEG_POR_PREGUNTA=90;
const tonoDe=m=>{const a=areaDe(m);return m.tono||a.tono||a.id};
const respuestaDe=p=>p.tipo==='opcion'?p.opciones?.[p.correcta]:p.respuesta;

/* Sesión de examen: preguntas ya generadas; alTerminar({ok,total,pct,historial}) se llama una vez */
export function sesionExamen({titulo,m,salir,preguntas,ref,alTerminar,pieFin=''}){
  let ses=null;
  ses=crearSesion({titulo,tono:tonoDe(m),salir,materia:m.id,sinPistas:true,sinFeedback:true,crono:preguntas.length*SEG_POR_PREGUNTA,
    total:()=>preguntas.length,siguiente:st=>preguntas[st.i]?{...preguntas[st.i],ref:preguntas[st.i].ref||ref,cuenta:true}:null,
    responder(p,r){registrarEjercicio({materia:m.id,ref:p.ref||ref,correcto:r.correcto,xp:r.correcto?10:0,repasar:false});return {xp:r.correcto?10:0}},
    fin(st){
      const ok=st.historial.filter(x=>x.r.correcto).length,total=preguntas.length,pct=ok/total,sin=total-st.historial.length;
      if(!st.guardado){st.guardado=true;alTerminar?.({ok,total,pct,historial:st.historial})}
      st.errores=st.historial.filter(x=>!x.r.correcto);
      return `<span class="fin-icono" aria-hidden="true">${pct>=.9?'🏆':pct>=APROBAR?'🎉':'📚'}</span><h1>${ok} de ${total}</h1>
<p class="nota">Calificación: <b>${(pct*10).toFixed(1)}</b> / 10${sin?` · ${sin} sin responder (se acabó el tiempo)`:''}</p>
${st.errores.length?`<h2>Revisa tus errores</h2><ol class="mp-revision">${st.errores.map((x,k)=>`<li><div class="pregunta">${conFormulas(x.p.enunciado)}</div>
<p class="nota">Tu respuesta: «${esc(String(x.r.entrada??''))}» · Correcta: ${conFormulas(esc(String(respuestaDe(x.p)??'')))}</p>${x.p.regla?`<p class="nota">📏 ${x.p.regla}</p>`:''}
${x.p.pasos?.length?`<button type="button" class="btn ghost btn-chico" data-ex-proc="${k}">📖 Ver procedimiento</button>`:''}</li>`).join('')}</ol>`:'<p>¡Sin errores! 🎉</p>'}
${pieFin}${boton({texto:'Volver',go:salir,clase:'ancho'})}`;
    }});
  const original=ses.alClic.bind(ses);
  ses.alClic=async(t,ir,rep)=>{const st=ses.estado();if(t.dataset.exProc!==undefined){const x=st.errores?.[+t.dataset.exProc];if(x)abrirProcedimiento(x.p,{revelar:false});return true}return original(t,ir,rep)};
  return ses;
}

/* Preguntas del examen final: reparte PREGUNTAS_FINAL entre todas las habilidades con generador (niveles 3 y 4) */
export function preguntasFinal(m,rng=crearRng()){
  const gens=(m.lecciones||[]).filter(h=>h.gen&&GENERADORES[h.gen]);
  if(gens.length<4)return [];
  const orden=rng.barajar(gens),l=[];
  for(let i=0;l.length<PREGUNTAS_FINAL&&i<PREGUNTAS_FINAL*3;i++){const h=orden[i%orden.length];try{const p=crear(h.gen,3+(i%2));if(p)l.push({...p,habilidad:h.id,etiqueta:`🎓 Examen final · ${h.titulo}`})}catch(e){}}
  return l;
}
export const resultadoFinal=(mid,p=progreso())=>datosMateria(p,mid).extra.examenFinal||null;

export function vistaExamenFinal(m){
  let ses=null;
  const ruta=`${rutaMateria(m)}/examen-final`;
  return {
    titulo:`Examen final: ${m.nombre}`,
    get inmersiva(){return !!ses},
    alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const r=resultadoFinal(m.id),c=cobertura(m.id),n=(m.lecciones||[]).filter(h=>h.gen).length;
      return `<div class="area-${tonoDe(m)}">${cabecera({icono:'🎓',titulo:`Examen final de ${m.nombre}`,desc:'Acumulativo: preguntas de todos los temas, con tiempo, sin pistas y con calificación al final.'})}
<div class="card"><ul class="nota" style="padding-left:20px;margin:0"><li>${PREGUNTAS_FINAL} preguntas de ${n} habilidades, ${Math.round(PREGUNTAS_FINAL*SEG_POR_PREGUNTA/60)} minutos.</li>
<li>Sin pistas ni correcciones hasta el final; luego revisas cada error con su procedimiento.</li>
<li>Con ${Math.round(APROBAR*100)} % o más obtienes el <b>certificado interno</b> de ${APP_NOMBRE} (constancia de práctica, sin valor oficial).</li></ul>
<p class="nota" style="margin-bottom:0">${textoCobertura(c)}${c.pct<100?' · Puedes presentarlo ya; el examen cubre lo que existe hoy.':''}</p></div>
${r?`<div class="card"><p style="margin:0">Tu mejor resultado: <b>${r.ok} de ${r.total}</b> (${Math.round(r.pct*100)} %) · ${r.fecha}</p>${r.pct>=APROBAR?boton({texto:'🏅 Ver certificado',go:`${rutaMateria(m)}/certificado`,clase:'ghost ancho'}):''}</div>`:''}
${n>=4?boton({texto:r?'Presentar otra vez':'Empezar examen',id:'ef-empezar',clase:'area ancho'}):'<p class="nota">Esta materia todavía no tiene suficientes habilidades con ejercicios generados.</p>'}</div>`;
    },
    alMostrar(){ses?.alMostrar?.()},
    async alClic(t,ir,repintar){
      if(ses)return ses.alClic(t,ir,repintar);
      if(t.id==='ef-empezar'){
        const preguntas=preguntasFinal(m);if(!preguntas.length)return true;
        ses=sesionExamen({titulo:`Examen final: ${m.nombre}`,m,salir:ruta,preguntas,ref:`${m.id}/examen-final`,
          alTerminar:({ok,total,pct})=>cambiarExtra(m.id,e=>{const prev=e.examenFinal;if(!prev||pct>prev.pct||(pct===prev.pct))e.examenFinal={fecha:hoy(),ok,total,pct}}),
          pieFin:''});
        ses.alEntrar();repintar();return true;
      }
    }
  };
}

export function vistaCertificado(m){
  return {
    titulo:`Certificado: ${m.nombre}`,
    vista(){
      const r=resultadoFinal(m.id),c=cobertura(m.id),u=usuario();
      if(!r||r.pct<APROBAR)return `<div class="area-${tonoDe(m)}">${cabecera({icono:'🏅',titulo:'Certificado',desc:'Se obtiene con 70 % o más en el examen final.'})}
${boton({texto:'Ir al examen final',go:`${rutaMateria(m)}/examen-final`,clase:'area ancho'})}</div>`;
      const fecha=new Date(r.fecha+'T12:00').toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'});
      return `<div class="area-${tonoDe(m)}"><div class="certificado nota-imprimir" role="document">
<p class="cert-k">${APP_NOMBRE} · Certificado interno</p>
<h1>${esc(u.nombre||'Estudiante')}</h1>
<p>completó el examen final acumulativo de</p>
<h2>${m.icono||''} ${esc(m.nombre)}</h2>
<p class="cert-puntaje">${r.ok} de ${r.total} · ${Math.round(r.pct*100)} %</p>
<p>${fecha}</p>
<p class="nota">${textoCobertura(c)}${estadoMateria(m.id).estado==='completo'?' · Curso completo':''}</p>
<p class="nota cert-aviso">Constancia de práctica emitida por la app. <b>No tiene valor oficial</b> ni sustituye una certificación (por ejemplo de Microsoft, CompTIA o Cambridge).</p>
</div>
<div class="row hoja-acciones" style="margin-top:12px">${boton({texto:'🖨️ Guardar en PDF',id:'cert-pdf',clase:'ghost'})}${boton({texto:'Volver',go:rutaMateria(m),clase:'ghost'})}</div></div>`;
    },
    alClic(t){
      if(t.id==='cert-pdf'){document.body.classList.add('imprimiendo');const fin=()=>{document.body.classList.remove('imprimiendo');removeEventListener('afterprint',fin)};addEventListener('afterprint',fin);setTimeout(()=>{window.print();setTimeout(fin,1000)},100);return true}
    }
  };
}
