/* Práctica de una habilidad (nodo del camino) con el método de METODO.md:
   - Habilidad nueva: explicación corta → ejemplo resuelto → ejemplo con hueco → ejercicios solos (desvanecimiento).
   - Recuperación: casi todo es producir la respuesta; la opción múltiple solo introduce.
   - Dificultad adaptativa (rating 1–5): tras un error, el siguiente es más fácil y del mismo tipo.
   - Rotan las actividades (escribir, verdadero/falso con justificación, encontrar el error) y una vez por sesión se pide
     "¿por qué?" (autoexplicación).
   - Dominio: ≥80 % de las últimas 10 respuestas sin pista y práctica en 2 días distintos. Al dominarla: resumen para Mis notas.
   También: cofres (repaso intercalado de 3 habilidades) y jefe del tema (mezcla cronometrada). */
import {$,esc} from '../utilidades.js';
import {progreso,datosMateria,datosHabilidad,registrarEjercicio,registrarRespuesta,cerrarSesionHabilidad,guardarNota,abrirCofre,guardarJefe,sumarXP} from './progreso.js';
import {SESION,ULTIMAS,DIAS_DOMINIO,DOMINIO,estadoDominio,nivelDe,frases} from './metodo.js';
import {boton,chip,puntos,cabecera,barra} from './ui.js';
import {crearSesion} from './sesion.js';
import {htmlCierre} from './cierre.js';
import {crearRng} from './rng.js';
import {fuentes,generadorDe,preguntaHabilidad,ejerciciosDe} from './practica.js';
import {crear} from './generadores/index.js';
import {deBanco} from './ejercicios.js';
import {comoEjemplo,comoHueco,comoOpcion,comoPorque,variar} from './actividades.js';
import {tema as temaDe,areaDe,rutaTema,rutaLeccion} from './materias.js';
import {cofresTema} from './camino.js';
import {conFormulas} from './formula.js';
import {preguntaIA,iaDisponible} from './ia-preguntas.js';

const tonoDe=m=>{const a=areaDe(m);return a.tono||a.id};
export const teoriaLeccion=l=>`${(l.explicacion||[]).map(p=>`<p class="lec-p">${conFormulas(p)}</p>`).join('')}
${l.ejemplos?.length?`<ul class="ejemplos">${l.ejemplos.map(([t,nt])=>`<li><span>${conFormulas(t)}</span>${nt?`<span class="nota">${nt}</span>`:''}</li>`).join('')}</ul>`:''}`;
export const formNota=(texto='')=>`<div class="nota-form"><label for="lec-nota">Resume en 1 o 2 frases lo que aprendiste (va a Mis notas)
<textarea id="lec-nota" rows="3" maxlength="300">${esc(texto)}</textarea></label>
<div class="row"><button class="btn ghost" id="lec-guardar-nota">Guardar en Mis notas</button><span id="lec-nota-msg" class="nota" role="status"></span></div></div>`;
export function guardarResumen(materia,leccion){
  const txt=$('#lec-nota').value.trim().replace(/\s+/g,' '),f=frases(txt),msg=$('#lec-nota-msg');
  if(!txt||f<1)msg.textContent='Escribe al menos una frase.';
  else if(f>2)msg.textContent=`Son ${f} frases: resúmelo en 1 o 2.`;
  else{guardarNota(materia,leccion,txt);msg.textContent='✓ Guardado en Mis notas'}
}
// Texto corto de cuánto falta para dominarla
export function faltaDominio(e){
  if(e.dominada)return 'Dominada';
  const necesita=Math.ceil(DOMINIO*ULTIMAS);
  return `${e.ok}/${ULTIMAS} bien de las últimas · ${Math.min(e.dias,DIAS_DOMINIO)}/${DIAS_DOMINIO} días`+(e.n>=ULTIMAS&&e.ok<necesita?` · necesitas ${necesita}`:'');
}
// Reglas de otras habilidades de la materia (opciones de "¿por qué?")
const otrasReglas=(m,h)=>m.lecciones.filter(x=>x.id!==h.id).flatMap(x=>{const g=generadorDe(x);if(g)try{return [crear(x.gen,1).regla]}catch(e){}return (x.rondas||[]).flat().map(e=>e.regla)}).filter(Boolean).slice(0,40);

/* ---------- la sesión de una habilidad ---------- */
function sesionHabilidad(m,h,{salir,volver,alTerminar}){
  const d0=datosHabilidad(progreso(),m.id,h.id),nueva=!d0||!(d0.sesiones||d0.ult?.length),fs=fuentes(h),gen=fs.includes('gen');
  const rng=crearRng(),vistos=new Set(),nivel=()=>nivelDe(datosHabilidad(progreso(),m.id,h.id)?.rating||1);
  // Lección: la ronda que toca, en orden (la opción múltiple va primero, para introducir)
  const ronda=h.rondas?.length?ejerciciosDe(m,h).filter(x=>h.rondas[(d0?.intentos||0)%h.rondas.length].includes(x.ej)):[];
  let previos=nueva&&gen?['ejemplo','hueco']:[],k=0,porqueHecho=false,ind=0,okInd=0,res=null;
  const total=()=>previos.length+SESION+(porqueHecho?1:0);
  const cola=[];
  function siguiente(st){
    if(cola.length)return cola.shift();
    const ult=st.historial.at(-1);
    // autoexplicación: tras el 3.er acierto, una vez
    if(!porqueHecho&&ult?.r.correcto&&ult.p.cuenta&&okInd>=3){porqueHecho=true;const q=comoPorque(ult.p,otrasReglas(m,h),rng);if(q)return q}
    if(previos.length){
      const tipo=previos.shift(),p=crear(h.gen,1,{vistos});
      const q=tipo==='ejemplo'?comoEjemplo(p):comoHueco(p);
      if(q)return {...q,habilidad:h.id,ref:`${m.id}/g/${h.id}/1`,cuenta:false,etapa:tipo};
    }
    if(ind>=SESION)return null;
    ind++;
    // fuente: ronda de la lección en orden; luego alterna; tras un error, el generador (más fácil y parecido)
    let p;
    const falló=ult&&!ult.r.correcto&&ult.p.cuenta;
    if(ronda.length&&!(falló&&gen)){const x=ronda.shift();vistos.add(x.ref);p={...deBanco(x.ej),ref:x.ref,habilidad:h.id,materia:m.id}}
    else if(gen){p=preguntaHabilidad(m,h,{nivel:nivel(),fuente:'gen',vistos,rng});
      p=ind===1&&nueva?(comoOpcion(p,rng)||p):variar(p,k++,rng)}
    else p=preguntaHabilidad(m,h,{nivel:nivel(),vistos,rng});
    if(!p)return null;
    return {...p,cuenta:!p.intro};
  }
  return crearSesion({
    titulo:h.titulo,tono:tonoDe(m),salir,
    total:st=>Math.max(total(),st.i+1),
    nivel:()=>nivel(),
    siguiente,
    ia:iaDisponible()&&gen?async()=>{const q=await preguntaIA(m,h,nivel());return q?{...q,cuenta:true,habilidad:h.id,materia:m.id}:null}:null,
    responder(p,r){
      if(p.noCuenta)return {};
      const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      if(p.cuenta){if(bien)okInd++;
        const e=registrarRespuesta(m.id,h.id,r);
        registrarEjercicio({materia:m.id,ref:p.ref,correcto:bien,xp});
        const est=estadoDominio(e);
        return {xp,nota:bien?`Dominio ${est.ok}/${ULTIMAS}`:'Volverá en Repasar.'};
      }
      registrarEjercicio({materia:m.id,correcto:r.correcto,xp,repasar:false});
      return {xp};
    },
    fin(st){
      const cont=st.historial.filter(x=>x.p.cuenta);
      if(!res)res=cerrarSesionHabilidad(m.id,h.id,{ok:cont.filter(x=>x.r.correcto&&!x.r.pista).length,total:cont.length});
      alTerminar?.(res);
      const nota=progreso().notas[`${m.id}/${h.id}`];
      const reglas=[...new Set(st.historial.filter(x=>!x.r.correcto&&x.p.regla).map(x=>x.p.regla))];
      return `<span class="fin-icono" aria-hidden="true">${res.primera?'👑':res.dominada?'🌟':'💪'}</span>
<h1>${res.primera?'¡Habilidad dominada!':'¡Sesión completa!'}</h1>
<p class="nota">${res.dominada?(res.primera?`+${res.extra} XP por dominarla. Volverá en tus repasos para no olvidarla.`:'Ya la dominas: sigue repasando para no olvidarla.')
  :`Para dominarla: ${Math.ceil(DOMINIO*ULTIMAS)} de las últimas ${ULTIMAS} bien y práctica en ${DIAS_DOMINIO} días distintos.`}</p>
<div class="fin-datos"><div class="dato xp"><b>+${st.xp+(res.extra||0)}</b><span>XP</span></div><div class="dato ok"><b>${cont.filter(x=>x.r.correcto&&!x.r.pista).length}/${cont.length}</b><span>Bien</span></div><div class="dato"><b>${res.ok}/${ULTIMAS}</b><span>Dominio</span></div></div>
<p class="nota">${faltaDominio(res)} · dificultad ${puntos(nivelDe(res.rating))}</p>
${res.primera?formNota(nota?.texto):''}
<button class="btn ancho" id="hab-otra">Practicar otra vez</button>
${htmlCierre({xp:st.xp+(res.extra||0),aprendido:reglas.length?reglas:[h.resumen].filter(Boolean),excluir:rutaLeccion(m,h)})}
<button class="btn ghost ancho" data-go="${volver}">Volver al tema</button>`;
    }
  });
}

/* ---------- pantalla de la habilidad: explicación corta y "Practicar" ---------- */
export function vistaHabilidad(m,h){
  const t=temaDe(m,h.tema),salir=t?rutaTema(m,t):'',tono=tonoDe(m),g=generadorDe(h);
  let ses=null;
  const empezar=()=>{ses=sesionHabilidad(m,h,{salir:rutaLeccion(m,h),volver:salir});ses.alEntrar()};
  return {
    titulo:h.titulo,
    get inmersiva(){return !!ses},
    alEntrar(){ses=null},
    alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const d=datosHabilidad(progreso(),m.id,h.id),e=estadoDominio(d||{}),nueva=!d||!(d.sesiones||d.ult?.length),nota=progreso().notas[`${m.id}/${h.id}`];
      const explicacion=h.explicacion?.length?teoriaLeccion(h):g?.explicacion?`<p class="lec-p">${conFormulas(g.explicacion)}</p>`:'';
      return `<div class="area-${tono}"><p class="etiqueta-actividad">${t?`${t.icono} ${t.titulo}`:m.nombre}</p>
<h1>${h.titulo}</h1>${h.resumen?`<p class="lead">${h.resumen}</p>`:''}
<div class="row" style="margin-bottom:12px">${d?.dominada?chip('👑 Dominada','ok'):chip(faltaDominio({...e,dominada:false}),'area')}<span class="chip">Dificultad ${puntos(nivelDe(d?.rating||1))}</span></div>
${explicacion?`<div class="card">${explicacion}</div>`:''}
${nota?`<div class="card nota-propia"><div class="ej-k">Tu resumen</div>${esc(nota.texto)}</div>`:''}
<div style="margin-top:20px">${boton({texto:nueva&&g?'Empezar con un ejemplo':'Practicar',id:'hab-empezar',clase:'ancho area'})}</div>
<p class="nota" style="text-align:center;margin-top:8px">${SESION} preguntas · unos 5 minutos</p>
${h.herramienta?`<div style="margin-top:8px">${boton({texto:`🔧 ${h.herramienta.titulo}`,go:h.herramienta.ruta,clase:'ghost ancho'})}</div>`:''}</div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(t2,ir,repintar){
      if(t2.id==='hab-empezar'||t2.id==='hab-otra'){empezar();repintar();window.scrollTo(0,0);return true}
      if(t2.id==='lec-guardar-nota'){guardarResumen(m.id,h.id);return true}
      if(ses)return ses.alClic(t2,ir,repintar);
    }
  };
}

/* ---------- cofre: repaso intercalado de varias habilidades ---------- */
function sesionMezcla(m,hs,{titulo,salir,n,crono,sinPistas,fin}){
  const rng=crearRng(),vistos=new Set();let k=0;
  return crearSesion({
    titulo,tono:tonoDe(m),salir,crono,sinPistas,
    total:()=>n,
    siguiente:st=>{if(st.i>=n)return null;const h=hs[k++%hs.length];
      const p=preguntaHabilidad(m,h,{nivel:nivelDe(datosHabilidad(progreso(),m.id,h.id)?.rating||1),vistos,rng});
      return p&&{...p,cuenta:true,etiqueta:p.etiqueta||h.titulo}},
    responder(p,r){
      const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      registrarRespuesta(m.id,p.habilidad,r);registrarEjercicio({materia:m.id,ref:p.ref,correcto:bien,xp});
      return {xp};
    },
    fin
  });
}
export function vistaCofre(m,t,k){
  const c=cofresTema(t).find(x=>x.k===+k),salir=rutaTema(m,t);
  if(!c)return null;
  let ses=null,primera=null;
  return {
    titulo:'Cofre',
    get inmersiva(){return !!ses},
    alEntrar(){ses=null;primera=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      return `<div class="area-${tonoDe(m)}">${cabecera({icono:'🎁',titulo:'Cofre de repaso',desc:`Mezcla de ${c.habilidades.map(h=>h.titulo).join(', ')}.`})}
<p class="intro">Repasar mezclado (intercalado) cuesta un poco más, pero fija mejor lo aprendido.</p>${boton({texto:'Abrir el cofre',id:'cofre-empezar',clase:'ancho area'})}</div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(t2,ir,repintar){
      if(t2.id==='cofre-empezar'){
        ses=sesionMezcla(m,c.habilidades,{titulo:'Cofre',salir,n:6,fin:st=>{
          if(primera===null){primera=abrirCofre(m.id,c.id);if(primera)sumarXP(m.id,20)}
          return `<span class="fin-icono" aria-hidden="true">🎁</span><h1>¡Cofre abierto!</h1><p class="nota">${primera?'+20 XP de premio. ':''}${st.ok} de ${st.i} bien.</p>
${htmlCierre({xp:st.xp+(primera?20:0),excluir:location.hash.slice(1)})}<button class="btn ghost ancho" data-go="${salir}">Volver al tema</button>`}});
        ses.alEntrar();repintar();return true;
      }
      if(ses)return ses.alClic(t2,ir,repintar);
    }
  };
}
/* ---------- jefe del tema: mezcla cronometrada ---------- */
export const JEFE={preguntas:8,segundos:240};
export function vistaJefe(m,t){
  const salir=rutaTema(m,t);let ses=null,res=null;
  return {
    titulo:`Jefe: ${t.titulo}`,
    get inmersiva(){return !!ses},
    alEntrar(){ses=null;res=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const mejor=datosMateria(progreso(),m.id).extra.jefes?.[t.id]?.mejor;
      return `<div class="area-${tonoDe(m)}">${cabecera({icono:'🏆',titulo:`Jefe: ${t.titulo}`,desc:`${JEFE.preguntas} preguntas de todo el tema en ${JEFE.segundos/60} minutos, sin pistas.`})}
<p class="intro">Necesitas el ${Math.round(DOMINIO*100)} % para vencerlo.${mejor?` Tu mejor marca: ${Math.round(mejor*100)} %.`:''}</p>${boton({texto:'¡A la batalla!',id:'jefe-empezar',clase:'ancho area'})}</div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(t2,ir,repintar){
      if(t2.id==='jefe-empezar'){
        ses=sesionMezcla(m,t.lecciones,{titulo:'Jefe',salir,n:JEFE.preguntas,crono:JEFE.segundos,sinPistas:true,fin:st=>{
          const pct=st.ok/JEFE.preguntas;
          if(!res){res=guardarJefe(m.id,t.id,pct);if(res.primera)sumarXP(m.id,50)}
          return `<span class="fin-icono" aria-hidden="true">${res.vencido?'🏆':'⚔️'}</span><h1>${res.vencido?'¡Jefe vencido!':'Casi…'}</h1>
<p class="nota">${st.ok} de ${JEFE.preguntas} bien (${Math.round(pct*100)} %)${res.vencido?'':` · necesitas ${Math.round(DOMINIO*100)} %`}${res.primera?' · +50 XP':''}</p>
<button class="btn ancho" id="jefe-empezar">${res.vencido?'Repetir':'Intentar otra vez'}</button>
${htmlCierre({xp:st.xp+(res.primera?50:0),excluir:location.hash.slice(1)})}<button class="btn ghost ancho" data-go="${salir}">Volver al tema</button>`}});
        res=null;ses.alEntrar();repintar();return true;
      }
      if(ses)return ses.alClic(t2,ir,repintar);
    }
  };
}
