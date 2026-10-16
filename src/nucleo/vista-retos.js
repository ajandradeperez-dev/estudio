/* "🎯 Retos y escenarios" de una materia (#<materia>/retos) o de un tema (#<materia>/<tema>/retos), ver retos.js.
   Filtros por tema, profundidad y dificultad. Un reto con crear() abre una sesión de práctica que no gasta nada (cuenta para
   la meta y la XP, pero no manda los fallos al repaso); ⭐ lo agrega al repaso diario. Un reto con ir abre su herramienta. */
import {esc} from '../utilidades.js';
import {progreso,registrarEjercicio,alternarEstrella} from './progreso.js';
import {retosDe,reto as retoDe} from './retos.js';
import {NOMBRE_PROFUNDIDAD} from './generadores/profundidad.js';
import {cabecera,puntos,chip,vacio,boton,aviso} from './ui.js';
import {sesionExamen} from './examen.js';
import {crearSesion} from './sesion.js';
import {htmlCierre} from './cierre.js';
import {crearRng} from './rng.js';
import {areaDe,rutaMateria,rutaTema} from './materias.js';

const tonoDe=m=>{const a=areaDe(m);return m.tono||a.tono||a.id};
export const rutaRetos=(m,t)=>`${t?rutaTema(m,t):rutaMateria(m)}/retos`;

export function vistaRetos(m,t=null){
  const f={tema:t?.id||'',prof:'',dif:0};let ses=null;
  const salir=rutaRetos(m,t);
  const lista=()=>retosDe(m.id,f.tema||null).filter(r=>(!f.prof||r.profundidad===f.prof)&&(!f.dif||r.dificultad===f.dif));
  const filtro=(grupo,valor,texto,activo)=>`<button class="chip-filtro" data-filtro="${grupo}" data-valor="${esc(String(valor))}" aria-pressed="${activo}">${texto}</button>`;
  const temasCon=(m.temas||[]).filter(x=>retosDe(m.id,x.id).length);
  function empezar(r){
    const preguntas=r.crear(crearRng()).filter(Boolean),ref=`${m.id}/r/${r.id}`;
    if(!preguntas.length){aviso('Este reto no tiene preguntas por ahora.');return false}
    // Simulacro de examen: con tiempo, sin pistas, sin feedback hasta el final, calificación y revisión de cada error
    if(r.simulacro){ses=sesionExamen({titulo:r.titulo,m,salir,preguntas,ref});ses.alEntrar?.();return true}
    ses=crearSesion({
      titulo:r.titulo,tono:tonoDe(m),salir,materia:m.id,
      total:()=>preguntas.length,
      siguiente:st=>{const p=preguntas[st.i];return p&&{...p,ref,cuenta:true,etiqueta:`🎯 ${NOMBRE_PROFUNDIDAD[r.profundidad]||'Reto'}`}},
      responder(p,res){
        const bien=res.correcto&&!res.pista,xp=res.correcto?(res.pista?5:10):0;
        registrarEjercicio({materia:m.id,ref,correcto:bien,xp,repasar:false});
        return {xp};
      },
      fin:st=>`<span class="fin-icono" aria-hidden="true">🎯</span><h1>Reto terminado</h1>
<p class="nota">${st.ok} de ${preguntas.length} bien. Los retos no se gastan: cada vez salen datos nuevos.</p>
<button class="btn ancho" data-reto="${esc(r.id)}">Otra vez</button>
${htmlCierre({xp:st.xp,excluir:location.hash.slice(1)})}<button class="btn ghost ancho" id="retos-volver">Volver a los retos</button>`
    });
    ses.alEntrar?.();return true;
  }
  return {
    titulo:'Retos y escenarios',
    get inmersiva(){return !!ses},
    alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const est=progreso().estrellas||{},l=lista();
      const filtros=`<div class="retos-filtros" role="group" aria-label="Filtrar retos">
${!t&&temasCon.length>1?`<div class="filtros">${filtro('tema','','Todos los temas',!f.tema)}${temasCon.map(x=>filtro('tema',x.id,`${x.icono||''} ${esc(x.titulo)}`,f.tema===x.id)).join('')}</div>`:''}
<div class="filtros">${filtro('prof','','Todo',!f.prof)}${filtro('prof','aplicacion','Aplicación',f.prof==='aplicacion')}${filtro('prof','escenario','Escenario',f.prof==='escenario')}</div>
<div class="filtros">${filtro('dif',0,'Cualquier dificultad',!f.dif)}${[1,2,3,4,5].map(n=>filtro('dif',n,'★'.repeat(n),f.dif===n)).join('')}</div></div>`;
      const tarjetas=l.map(r=>`<div class="card reto">
<div class="reto-cab"><h2>${esc(r.titulo)}</h2>${r.crear?`<button class="btn-icono estrella${est[r.id]?' activa':''}" data-estrella="${esc(r.id)}" aria-pressed="${!!est[r.id]}" aria-label="${est[r.id]?'Quitar del repaso diario':'Agregar al repaso diario'}" title="${est[r.id]?'Está en tu repaso diario':'Agregar al repaso diario'}">${est[r.id]?'⭐':'☆'}</button>`:''}</div>
<p>${esc(r.desc||'')}</p>
<div class="reto-pie">${chip(NOMBRE_PROFUNDIDAD[r.profundidad]||r.profundidad)}${puntos(r.dificultad)}</div>
${r.crear?boton({texto:'Empezar',clase:'area ancho',extra:`data-reto="${esc(r.id)}"`}):boton({texto:'Abrir',clase:'ghost ancho',go:r.ir})}</div>`).join('');
      return `<div class="area-${tonoDe(m)}">${cabecera({icono:'🎯',titulo:'Retos y escenarios',desc:t?esc(t.titulo):esc(m.nombre)})}
<p class="intro">Problemas con contexto y casos reales. No se gastan: practica todas las veces que quieras. Marca ⭐ los que quieras en tu repaso diario.</p>
${filtros}${tarjetas||vacio({icono:'🎯',titulo:'Todavía no hay retos aquí',texto:'Prueba con otros filtros o vuelve pronto: se agregan con cada bloque de contenido.'})}</div>`;
    },
    alMostrar(){ses?.alMostrar?.()},
    alClic(el,ir,repintar){
      const btn=el.closest?.('[data-filtro],[data-estrella],[data-reto],#retos-volver')||el;
      if(btn.dataset?.filtro){const g=btn.dataset.filtro,v=btn.dataset.valor;f[g]=g==='dif'?+v:v;repintar();return true}
      if(btn.dataset?.estrella){const on=alternarEstrella(m.id,btn.dataset.estrella);aviso(on?'⭐ Agregado a tu repaso diario (desde mañana).':'Quitado del repaso diario.');repintar();return true}
      if(btn.dataset?.reto){const r=retoDe(btn.dataset.reto);ses=null;if(r?.crear&&empezar(r))repintar();return true}
      if(btn.id==='retos-volver'){ses=null;repintar();return true}
      if(ses)return ses.alClic(el,ir,repintar);
    }
  };
}
