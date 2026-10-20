/* Práctica de una habilidad (nodo del camino) con el método de METODO.md:
   - Habilidad nueva: mini-lección (1 la idea, 2 un ejemplo resuelto, 3 un ejemplo a medias) y luego ejemplos que se
     desvanecen: la app da casi todos los pasos y tú haces el resto; cada acierto quita un paso dado, hasta resolverlo solo.
     Siempre empieza en el nivel 1. «Ya lo sé, ir a practicar» se salta la mini-lección y los ejemplos.
   - Recuperación: casi todo es producir la respuesta; la opción múltiple solo introduce.
   - Dificultad adaptativa (rating 1–5): tras un error, el siguiente es más fácil y del mismo tipo.
   - Rotan las actividades (escribir, verdadero/falso con justificación, encontrar el error) y una vez por sesión se pide
     "¿por qué?" (autoexplicación).
   - Dominio: ≥80 % de las últimas 10 respuestas sin pista y práctica en 2 días distintos. Al dominarla: resumen para Mis notas.
   También: cofres (repaso intercalado de 3 habilidades) y jefe del tema (mezcla cronometrada). */
import {$,esc} from '../utilidades.js';
import {progreso,datosMateria,datosHabilidad,registrarEjercicio,registrarRespuesta,cerrarSesionHabilidad,guardarNota,abrirCofre,guardarJefe,sumarXP,basicoRetirado,registrarBasico,pedirRefuerzo,tomarRefuerzo,retiradosDe,reactivarBasicos,programarRepaso} from './progreso.js';
import {SESION,ULTIMAS,DIAS_DOMINIO,DOMINIO,estadoDominio,nivelDe,frases} from './metodo.js';
import {boton,chip,puntos,cabecera,barra,aviso} from './ui.js';
import {agregarAlTema,bloqueExplicacion,crearNota} from './cuaderno/notas.js';
import {crearSesion} from './sesion.js';
import {htmlCierre} from './cierre.js';
import {crearRng} from './rng.js';
import {fuentes,generadorDe,preguntaHabilidad,ejerciciosDe,preguntaDeBasico,profundidadLeccion,claveBasicoLeccion} from './practica.js';
import {crear,gemelo} from './generadores/index.js';
import {deBanco} from './ejercicios.js';
import {comoEjemplo,comoHueco,comoOpcion,comoPorque,variar} from './actividades.js';
import {tema as temaDe,areaDe,rutaMateria,rutaTema,rutaLeccion} from './materias.js';
import {cofresTema} from './camino.js';
import {conFormulas} from './formula.js';
import {preguntaIA,iaDisponible,explicarIA} from './ia-preguntas.js';
import {retosDe} from './retos.js';
import {htmlPaso,normalPaso} from './procedimiento.js';

// Mini-lección pedida desde la práctica (tras usar 2 veces «No sé cómo empezar»): '<materia>/<habilidad>'
const pedirMini=new Set();
const MAX_DESVANECIDOS=4;

const tonoDe=m=>{const a=areaDe(m);return m.tono||a.tono||a.id};
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

/* ---------- niveles de profundidad ---------- */
// Un básico bien respondido cuenta para retirarlo; un error en algo de nivel superior pide un refuerzo de lo básico
export function registrarProfundidad(p,r,st,materia,habilidad){
  if(p.basico)registrarBasico(p.basico,r,{sesion:st?.id||'s',materia,habilidad});
  else if(!r.correcto&&p.profundidad&&p.profundidad!=='basico')pedirRefuerzo(materia,habilidad);
}

/* ---------- la sesión de una habilidad ---------- */
function sesionHabilidad(m,h,{salir,volver,alTerminar,conMini=false}){
  const d0=datosHabilidad(progreso(),m.id,h.id),nueva=!d0||!(d0.sesiones||d0.ult?.length),fs=fuentes(h),gen=fs.includes('gen');
  const rng=crearRng(),vistos=new Set(),nivel=()=>nivelDe(datosHabilidad(progreso(),m.id,h.id)?.rating||1);
  // Lección: la ronda que toca, en orden (la opción múltiple va primero, para introducir)
  // Los básicos ya retirados (bien en 2 sesiones distintas) no vuelven a salir: ver progreso.js → registrarBasico
  const retirados={has:k=>basicoRetirado(k)};
  const ronda=h.rondas?.length?ejerciciosDe(m,h).filter(x=>h.rondas[(d0?.intentos||0)%h.rondas.length].includes(x.ej))
    .filter(x=>!(profundidadLeccion(h,x.ej)==='basico'&&basicoRetirado(claveBasicoLeccion(x.ref)))):[];
  // m.ejemplosResueltos (Matemáticas: 2) ejemplos resueltos antes del ejemplo con hueco
  // Sin la mini-lección (ya la saltó o no aplica): los ejemplos de siempre. Con ella: ejemplos que se desvanecen
  let previos=nueva&&gen&&!conMini?[...Array(m.ejemplosResueltos||1).fill('ejemplo'),'hueco']:[],k=0,porqueHecho=false,ind=0,okInd=0,res=null;
  let quitados=nueva&&gen&&conMini?0:null,desvanecidos=0;
  const total=()=>previos.length+SESION+(porqueHecho?1:0);
  const cola=[];
  // refuerzo: tras fallar un ejercicio de nivel superior de esta habilidad, vuelve una vez un básico retirado
  if(tomarRefuerzo(m.id,h.id)){const k=retiradosDe(m.id,h.id)[0],q=k&&preguntaDeBasico(m,h,k);if(q)cola.push({...q,cuenta:true,etiqueta:'🔁 Refuerzo de lo básico'})}
  function siguiente(st){
    if(cola.length)return cola.shift();
    const ult=st.historial.at(-1);
    // autoexplicación: tras el 3.er acierto, una vez
    if(!porqueHecho&&ult?.r.correcto&&ult.p.cuenta&&okInd>=3){porqueHecho=true;const q=comoPorque(ult.p,otrasReglas(m,h),rng);if(q)return q}
    // ejemplo que se desvanece: n−1−quitados pasos dados; cada acierto sin pista quita uno
    if(quitados!==null&&desvanecidos<MAX_DESVANECIDOS){
      const p=crear(h.gen,1,{vistos}),n=p?.pasos?.length||0,dados=n-1-quitados;
      if(p&&n>=2&&dados>=1&&(p.tipo||'escribir')==='escribir'){desvanecidos++;
        return {...p,tipo:'escribir',pasosPrevios:p.pasos.slice(0,dados),desvanecido:true,hueco:dados===n-1?'¿Cuál es el resultado?':`Sigue tú desde el paso ${dados+1} hasta la respuesta`,
          habilidad:h.id,materia:m.id,ref:`${m.id}/g/${h.id}/1`,cuenta:false,etapa:'desvanecido'}}
      quitados=null;
    }
    if(previos.length){
      const tipo=previos.shift(),p=crear(h.gen,1,{vistos});
      const q=tipo==='ejemplo'?comoEjemplo(p):comoHueco(p);
      if(q)return {...q,habilidad:h.id,ref:`${m.id}/g/${h.id}/1`,cuenta:false,etapa:tipo};
    }
    if(ind>=SESION)return null;
    ind++;
    // fuente: ronda de la lección en orden; luego alterna; tras un error, el generador (más fácil y parecido)
    let p;
    // tras un error (o "No entendí"), uno más fácil y del mismo tipo
    const falló=ult&&!ult.r.correcto&&ult.p.cuenta||st.facil;
    if(ronda.length&&!(falló&&gen)){const x=ronda.shift(),prof=profundidadLeccion(h,x.ej);vistos.add(x.ref);
      p={...deBanco(x.ej),ref:x.ref,habilidad:h.id,materia:m.id,profundidad:prof,basico:prof==='basico'?claveBasicoLeccion(x.ref):null}}
    else if(gen){p=preguntaHabilidad(m,h,{nivel:st.facil?Math.max(1,nivel()-1):nivel(),fuente:'gen',vistos,rng,retirados});st.facil=false;
      if(p)p=ind===1&&nueva?(comoOpcion(p,rng)||p):variar(p,k++,rng)}
    else p=preguntaHabilidad(m,h,{nivel:nivel(),vistos,rng,retirados});
    if(!p)return null;
    return {...p,cuenta:!p.intro};
  }
  return crearSesion({
    titulo:h.titulo,tono:tonoDe(m),salir,materia:m.id,habilidad:h.id,
    total:st=>Math.max(total(),st.i+1),
    nivel:()=>nivel(),
    siguiente,
    explicarIA:iaDisponible()?(p,entrada)=>explicarIA(m,h,p,entrada):null,
    // gemelo de la misma habilidad: cuenta igual que la pregunta original
    gemelo:p=>{if(!p?.gen)return null;const q=gemelo(p);return q&&{...q,habilidad:h.id,materia:m.id,ref:p.ref||`${m.id}/g/${h.id}/${q.nivel}`,cuenta:p.cuenta,basico:p.basico,profundidad:q.profundidad,etiqueta:'🔁 Ahora tú: uno parecido'}},
    minileccion:()=>{pedirMini.add(`${m.id}/${h.id}`);document.dispatchEvent(new CustomEvent('ir',{detail:rutaLeccion(m,h)}))},
    ia:iaDisponible()&&gen?async()=>{const q=await preguntaIA(m,h,nivel());return q?{...q,cuenta:true,habilidad:h.id,materia:m.id}:null}:null,
    responder(p,r,st){
      if(p.noCuenta)return {};
      if(p.etapa==='desvanecido'&&quitados!==null&&r.correcto&&!r.pista)quitados++;
      const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      if(p.cuenta)registrarProfundidad(p,r,st,m.id,h.id);
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
      if(!res){res=cerrarSesionHabilidad(m.id,h.id,{ok:cont.filter(x=>x.r.correcto&&!x.r.pista).length,total:cont.length});
        // tarjetas de los conceptos clave de la habilidad: entran al repaso espaciado desde la primera práctica (ref '<materia>/k/<habilidad>/<i>')
        const tj=generadorDe(h)?.tarjetas||h.tarjetas||[];if(tj.length&&cont.length)programarRepaso(tj.map((_,i)=>`${m.id}/k/${h.id}/${i}`))}
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
  let mini=null,conMini=false;   // mini-lección: {paso:1–3, ej, medias, hecho}
  const empezar=()=>{ses=sesionHabilidad(m,h,{salir:rutaLeccion(m,h),volver:salir,conMini});ses.alEntrar()};
  const nuevaH=()=>{const d=datosHabilidad(progreso(),m.id,h.id);return !d||!(d.sesiones||d.ult?.length)};
  const verMini=()=>{const k=`${m.id}/${h.id}`;if(pedirMini.has(k)||(nuevaH()&&!mini?.fin)){pedirMini.delete(k);if(!mini)mini={paso:1}}};
  function htmlMini(){
    const explicacion=h.explicacion?.length?teoriaLeccion(h):g?.explicacion?`<p class="lec-p">${conFormulas(g.explicacion)}</p>`:'';
    const pasosH=ps=>`<ol class="pasos-proc">${ps.map(normalPaso).map((x,i)=>htmlPaso(x,i,{acciones:false})).join('')}</ol>`;
    let cuerpo='';
    if(mini.paso===1)cuerpo=`<h2>La idea</h2>${explicacion||`<p class="lec-p">${h.resumen||''}</p>`}${g?.alternativa?`<details class="nota-datos"><summary>🤔 Dicho de otra forma</summary><p>${conFormulas(g.alternativa)}</p></details>`:''}`;
    if(mini.paso===2){mini.ej??=g?crear(h.gen,1):null;const e=mini.ej;
      cuerpo=e?`<h2>Un ejemplo resuelto</h2><div class="pregunta">${conFormulas(e.enunciado)}</div>${e.diagrama?`<div class="diagrama-caja">${e.diagrama}</div>`:''}${pasosH(e.pasos||[])}<p class="hoja-linea"><b>Respuesta:</b> ${conFormulas(String(e.respuesta))}</p>${e.regla?`<p class="nota">${conFormulas(e.regla)}</p>`:''}`
        :`<h2>Ejemplos</h2><ul class="ejemplos">${(h.ejemplos||[]).map(([t,nt])=>`<li><span>${conFormulas(t)}</span>${nt?`<span class="nota">${nt}</span>`:''}</li>`).join('')}</ul>`}
    if(mini.paso===3){mini.medias??=crear(h.gen,1,{evitar:q=>q.enunciado===mini.ej?.enunciado});const e=mini.medias,ps=e.pasos||[];
      cuerpo=`<h2>Ahora tú: completa el último paso</h2><div class="pregunta">${conFormulas(e.enunciado)}</div>${pasosH(ps.slice(0,-1))}
<label class="campo">Paso ${ps.length}: ${conFormulas(normalPaso(ps.at(-1)||{}).que||'¿cuál es el resultado?')}<input id="mini-resp" class="respuesta-libre" autocomplete="off" autocapitalize="off" spellcheck="false"${e.lang?` lang="${e.lang}"`:''} placeholder="${e.forma?'Separa los valores con comas':'Tu respuesta'}"${mini.ok!==undefined?' readonly':''}></label>
${mini.ok===undefined?'<button type="button" class="btn ancho" id="mini-comprobar">Comprobar</button>'
  :`<p class="hoja-linea">${mini.ok?'✅ ¡Correcto! Ya viste cómo se hace: ahora a practicar.':`La respuesta era <b>${conFormulas(String(e.respuesta))}</b>. ${e.regla?conFormulas(e.regla):''}`}</p>`}`;}
    const ultimo=g?3:2;
    return `<div class="card mini-leccion"><p class="etiqueta-actividad">📘 Mini-lección · ${mini.paso} de ${ultimo}</p>${cuerpo}
<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">${mini.paso<ultimo?boton({texto:'Siguiente',id:'mini-siguiente',clase:'area'}):(mini.paso===3&&mini.ok===undefined?'':boton({texto:'Empezar a practicar',id:'mini-practicar',clase:'area'}))}
${mini.paso<ultimo||mini.ok===undefined?boton({texto:'Ya lo sé, ir a practicar',id:'mini-saltar',clase:'ghost'}):''}</div></div>`;
  }
  return {
    titulo:h.titulo,
    get inmersiva(){return !!ses},
    alEntrar(){ses=null;mini=null},
    alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      verMini();
      const d=datosHabilidad(progreso(),m.id,h.id),e=estadoDominio(d||{}),nueva=!d||!(d.sesiones||d.ult?.length),nota=progreso().notas[`${m.id}/${h.id}`];
      if(mini&&!mini.fin)return `<div class="area-${tono}"><p class="etiqueta-actividad">${t?`${t.icono} ${t.titulo}`:m.nombre}</p><h1>${h.titulo}</h1>${h.resumen?`<p class="lead">${h.resumen}</p>`:''}${htmlMini()}</div>`;
      // Todo lo de esta habilidad era básico y ya está retirado: no hay nada nuevo que practicar aquí
      const todoRetirado=!fuentes(h).includes('gen')&&!fuentes(h).includes('banco')&&retiradosDe(m.id,h.id).length>0
        &&!preguntaHabilidad(m,h,{nivel:5,retirados:{has:k=>basicoRetirado(k)}});
      const explicacion=h.explicacion?.length?teoriaLeccion(h):g?.explicacion?`<p class="lec-p">${conFormulas(g.explicacion)}</p>`:'';
      return `<div class="area-${tono}"><p class="etiqueta-actividad">${t?`${t.icono} ${t.titulo}`:m.nombre}</p>
<h1>${h.titulo}</h1>${h.resumen?`<p class="lead">${h.resumen}</p>`:''}
<div class="row" style="margin-bottom:12px">${d?.dominada?chip('👑 Dominada','ok'):chip(faltaDominio({...e,dominada:false}),'area')}<span class="chip">Dificultad ${puntos(nivelDe(d?.rating||1))}</span></div>
${explicacion?`<div class="card">${explicacion}${g?.referencia?`<p class="nota" style="margin:8px 0 0">📖 ${g.referencia}</p>`:''}</div>`:''}
<div class="row hoja-acciones">${explicacion?'<button type="button" class="btn ghost btn-chico" id="hab-nota-exp">📝 Guardar explicación</button>':''}<button type="button" class="btn ghost btn-chico" id="hab-nota-nueva">🗒️ Nota nueva del tema</button></div>
${nota?`<div class="card nota-propia"><div class="ej-k">Tu resumen</div>${esc(nota.texto)}</div>`:''}
${todoRetirado?`<div class="card" style="margin-top:20px"><p><b>✅ Ya dominas lo básico de esta habilidad.</b> Lo acertaste sin pista en sesiones distintas, así que ya no sale en la práctica: volverá solo como refuerzo si fallas algo más difícil.</p>
${t&&retosDe(m.id,t.id).length?boton({texto:'🎯 Retos y escenarios del tema',go:`${rutaTema(m,t)}/retos`,clase:'ancho area'}):''}
<div style="margin-top:8px">${boton({texto:'🔁 Volver a ver lo retirado',id:'hab-reactivar',clase:'ghost ancho'})}</div></div>`
:`<div style="margin-top:20px">${boton({texto:nueva&&g?'Empezar con un ejemplo':'Practicar',id:'hab-empezar',clase:'ancho area'})}</div>
<p class="nota" style="text-align:center;margin-top:8px">${SESION} preguntas · unos 5 minutos</p>`}
${h.herramienta&&m.secciones?.[h.herramienta]?`<div style="margin-top:12px">${boton({texto:`🔧 Abrir: ${m.secciones[h.herramienta].titulo}`,go:`${rutaMateria(m)}/${h.herramienta}`,clase:'ghost ancho'})}</div>`:''}</div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(t2,ir,repintar){
      if(t2.id==='hab-empezar'||t2.id==='hab-otra'){empezar();repintar();window.scrollTo(0,0);return true}
      if(t2.id==='mini-siguiente'&&mini){mini.paso++;repintar();window.scrollTo(0,0);return true}
      if(t2.id==='mini-comprobar'&&mini?.medias){const v=$('#mini-resp')?.value.trim()||'';if(!v)return true;const e=mini.medias;
        try{mini.ok=!!e.verificar(e.forma?v.replace(/^[([]|[)\]]$/g,'').split(/\s*[,;]\s*/):v)}catch(x){mini.ok=false}repintar();return true}
      // terminar o saltar la mini-lección: empieza la práctica (con ejemplos que se desvanecen solo si la terminó)
      if(t2.id==='mini-practicar'||t2.id==='mini-saltar'){conMini=t2.id==='mini-practicar';mini={fin:true};empezar();repintar();window.scrollTo(0,0);return true}
      if(t2.id==='lec-guardar-nota'){guardarResumen(m.id,h.id);return true}
      if(t2.id==='hab-reactivar'){reactivarBasicos(m.id,[h.id]);aviso('🔁 Lo básico vuelve a salir en la práctica.');repintar();return true}
      if(t2.id==='hab-nota-exp'){t2.disabled=true;const g=generadorDe(h),html=h.explicacion?.length?h.explicacion.join('<br>'):g?.explicacion||'';
        try{const n=await agregarAlTema({materia:m.id,habilidad:h.id},bloqueExplicacion(m,h,html));t2.textContent='✅ Guardada';aviso(`📝 Guardado en «${n.titulo}»`)}catch(e){t2.disabled=false;aviso('No se pudo guardar la nota.')}return true}
      if(t2.id==='hab-nota-nueva'){const n=await crearNota({materia:m.id,tema:h.tema||null,cuerpo:`[${h.titulo}](#${rutaLeccion(m,h)})

`});ir(`notas/n/${n.id}`);return true}
      if(ses)return ses.alClic(t2,ir,repintar);
    }
  };
}

/* ---------- cofre: repaso intercalado de varias habilidades ---------- */
function sesionMezcla(m,hs,{titulo,salir,n,crono,sinPistas,fin}){
  const rng=crearRng(),vistos=new Set();let k=0;
  return crearSesion({
    titulo,tono:tonoDe(m),salir,crono,sinPistas,materia:m.id,
    total:()=>n,
    siguiente:st=>{if(st.i>=n)return null;const h=hs[k++%hs.length];
      const p=preguntaHabilidad(m,h,{nivel:nivelDe(datosHabilidad(progreso(),m.id,h.id)?.rating||1),vistos,rng,retirados:{has:x=>basicoRetirado(x)}});
      return p&&{...p,cuenta:true,etiqueta:p.etiqueta||h.titulo}},
    responder(p,r,st){
      const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      registrarProfundidad(p,r,st,m.id,p.habilidad);
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
