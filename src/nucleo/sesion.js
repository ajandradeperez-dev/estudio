/* Sesión de práctica a pantalla completa: UNA pregunta por pantalla, ✕ para salir, barra de progreso arriba,
   botón grande "Comprobar" abajo y hoja inferior verde (✓) o roja (respuesta correcta, por qué, error típico y regla).

   crearSesion(cfg) devuelve una vista {vista, alClic, alMostrar, inmersiva}. cfg:
     titulo, tono ('ciber'|'estudio'), salir (ruta del ✕)
     siguiente(st)            → la próxima pregunta o null para terminar (puede adaptar la dificultad según st.historial)
     total(st)                → cuántas preguntas tendrá (para la barra)
     responder(p, r, st)      → registra la respuesta; devuelve {xp?, nota?} para la hoja
     fin(st)                  → HTML de la pantalla final (dentro de .fin-sesion)
     nivel?(st)               → dificultad actual 1–5 (puntos en la cabecera)
     rendirse?                → muestra "No lo sé" (examen de ubicación)
     sinPistas?               → oculta el botón de pista
     crono?                   → segundos (jefe): al acabarse, termina
     ia?(st)                  → promesa con una pregunta nueva generada por IA (botón ✨)
   Pregunta (ver tipos en ACT): {tipo, enunciado, respuesta, verificar?, errores?:[{si(entrada), por, valor?}], regla?, pista?, pasos?, …}
   r = {correcto, pista, rendido, entrada, ms, porque} */
import {$,esc} from '../utilidades.js';
import {barra,puntos,abrirHoja,cerrarHoja,confirmar,aviso} from './ui.js';
import {soporte,htmlMic,htmlOir,htmlFraseEvaluada,escucharConBoton,hablar} from './voz.js';
import {evaluarHablar,META_PRONUNCIACION} from './ejercicios.js';
import {registrarHabla,registrarSonidos} from './progreso.js';
import {sonar} from './sonido.js';
import {agregarAlTema,bloqueProcedimiento,bloqueError} from './cuaderno/notas.js';
import {htmlPaso,normalPaso,textoPlano,abrirProcedimiento,cerrarProcedimiento} from './procedimiento.js';
import {vibrar} from './ajustes.js';
import {conFormulas} from './formula.js';

const mezclar=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const ELOGIOS=['¡Bien!','¡Excelente!','¡Correcto!','¡Muy bien!','¡Así se hace!'];
const TECLADOS={
  mat:['√','^','/','(',')','π','−','x','·',','],
  ip:['.','/','0','1','2','5'],
  vector:['(',')',',','−','/','√']
};
const etiqueta=(icono,txt)=>`<p class="etiqueta-actividad"><span aria-hidden="true">${icono}</span>${txt}</p>`;
const enunciado=p=>`<div class="pregunta">${conFormulas(p.enunciado||'')}</div>${p.codigo?`<pre class="ej-codigo" style="margin-bottom:16px">${esc(p.codigo)}</pre>`:''}${p.oir?`<div class="row" style="margin-bottom:16px">${htmlOir(p.oir)}</div>`:''}`;
const teclado=p=>p.teclado&&TECLADOS[p.teclado]?`<div class="teclado" aria-label="Símbolos">${TECLADOS[p.teclado].map(k=>`<button type="button" class="tecla" data-tecla="${esc(k)}">${esc(k)}</button>`).join('')}</div>`:'';
const casillaFoco={el:null};

/* ---------- actividades ---------- */
// html(p, e): pantalla · listo(e): ¿se puede comprobar? · leer(e): la entrada · comprobar(p, entrada, e): {correcto, porque}
export const ACT={
  escribir:{
    html(p){
      const previos=p.pasosPrevios?.length?`<ol class="pasos-proc">${p.pasosPrevios.map((x,i)=>htmlPaso(x,i,{acciones:false})).join('')}<li class="paso-proc hueco"><p class="paso-que">${conFormulas(p.hueco||'¿Cuál es el resultado?')}</p></li></ol>`:'';
      const campo=p.forma?`<div class="matriz" style="grid-template-columns:repeat(${p.forma.cols},auto)" role="group" aria-label="${p.forma.filas>1?'Matriz':'Vector'}">${Array.from({length:p.forma.filas*p.forma.cols},(_,k)=>`<input class="celda" data-k="${k}" inputmode="text" autocomplete="off" aria-label="Fila ${Math.floor(k/p.forma.cols)+1}, columna ${k%p.forma.cols+1}">`).join('')}</div>`
        :`<input class="respuesta-libre" id="ses-resp" autocomplete="off" autocapitalize="off" spellcheck="false"${p.lang?` lang="${p.lang}"`:''} placeholder="Tu respuesta" aria-label="Tu respuesta">`;
      return `${etiqueta(previos?'🧩':'✍️',previos?'Completa el último paso':p.etiqueta||'Escribe la respuesta')}${enunciado(p)}${previos}${campo}${teclado(p)}`;
    },
    listo:()=>{const c=document.querySelectorAll('#vista .celda');return c.length?[...c].every(x=>x.value.trim()):!!$('#ses-resp')?.value.trim()},
    leer(){const c=[...document.querySelectorAll('#vista .celda')];return c.length?c.map(x=>x.value.trim()):$('#ses-resp').value.trim()},
    bloquear(){document.querySelectorAll('#ses-resp,#vista .celda').forEach(x=>x.readOnly=true)},
    comprobar(p,entrada){
      const correcto=!!p.verificar(entrada);
      const err=correcto?null:(p.errores||[]).find(x=>{try{return x.si(entrada)}catch(e){return false}});
      return {correcto,porque:err?.por};
    }
  },
  opcion:{
    html(p,e){return `${etiqueta('👆',p.etiqueta||'Elige la respuesta')}${enunciado(p)}<div class="opciones" role="group">${p.opciones.map((o,i)=>`<button type="button" class="opcion" data-op="${i}" aria-pressed="${e.op===i}"><span class="letra" aria-hidden="true">${i+1}</span><span>${conFormulas(o)}</span></button>`).join('')}</div>`},
    listo:e=>e.op!==undefined,
    leer:e=>e.op,
    clic(t,p,e){if(t.dataset.op===undefined)return false;e.op=+t.dataset.op;document.querySelectorAll('#vista [data-op]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.op===e.op));return true},
    marcar(p,e){document.querySelectorAll('#vista [data-op]').forEach(b=>{b.disabled=true;const i=+b.dataset.op;if(i===p.correcta)b.classList.add('correcta');else if(i===e.op)b.classList.add('incorrecta')})},
    comprobar:(p,op)=>({correcto:op===p.correcta,porque:p.porque?.[op]})
  },
  // Autoexplicación: "¿por qué es así?" (no cuenta para el dominio)
  porque:{
    html(p,e){return `${etiqueta('🤔','¿Por qué?')}${enunciado(p)}<div class="opciones" role="group">${p.opciones.map((o,i)=>`<button type="button" class="opcion" data-op="${i}" aria-pressed="${e.op===i}"><span>${conFormulas(o)}</span></button>`).join('')}</div>`},
    listo:e=>e.op!==undefined,leer:e=>e.op,
    clic:(t,p,e)=>ACT.opcion.clic(t,p,e),marcar:(p,e)=>ACT.opcion.marcar(p,e),
    comprobar:(p,op)=>({correcto:op===p.correcta,porque:p.porque?.[op]})
  },
  ordenar:{
    html(p,e){
      e.orden=e.orden||[];e.banco=e.banco||mezclar(p.piezas.map((_,i)=>i));
      return `${etiqueta('🔀',p.etiqueta||'Ordena las piezas')}${enunciado(p)}
<div class="piezas respuesta" aria-label="Tu respuesta">${e.orden.map((i,k)=>`<button type="button" class="pieza" data-quitar="${k}">${esc(p.piezas[i])}</button>`).join('')}</div>
<div class="piezas" aria-label="Piezas">${e.banco.map(i=>`<button type="button" class="pieza${e.orden.includes(i)?' usada':''}" data-pieza="${i}"${e.orden.includes(i)?' tabindex="-1" aria-hidden="true"':''}>${esc(p.piezas[i])}</button>`).join('')}</div>`;
    },
    listo:e=>e.orden?.length>0,
    leer:(e,p)=>e.orden.map(i=>p.piezas[i]).join(' '),
    clic(t,p,e,repintar){
      if(t.dataset.pieza!==undefined){const i=+t.dataset.pieza;if(!e.orden.includes(i))e.orden.push(i);repintar();return true}
      if(t.dataset.quitar!==undefined){e.orden.splice(+t.dataset.quitar,1);repintar();return true}
      return false;
    },
    comprobar(p,entrada){const correcto=!!p.verificar(entrada);return {correcto,porque:correcto?'':(p.errores||[]).find(x=>x.si(entrada))?.por}}
  },
  // Emparejar: toca uno de cada columna; se resuelve sola al terminar (bien si hubo como mucho 1 error)
  emparejar:{
    html(p,e){
      e.izq=e.izq||mezclar(p.pares.map((_,i)=>i));e.der=e.der||mezclar(p.pares.map((_,i)=>i));e.hechos=e.hechos||[];e.fallos=e.fallos||0;
      const b=(lado,i)=>`<button type="button" class="opcion${e.hechos.includes(i)?' hecho':''}" data-par="${lado}${i}" aria-pressed="${e.sel===lado+i}"${e.hechos.includes(i)?' disabled':''}>${conFormulas(p.pares[i][lado==='i'?0:1])}</button>`;
      return `${etiqueta('🔗',p.etiqueta||'Empareja')}${enunciado(p)}<div class="pares">${e.izq.map((i,k)=>b('i',i)+b('d',e.der[k])).join('')}</div>`;
    },
    listo:()=>false,
    clic(t,p,e,repintar,resolver){
      const v=t.dataset.par;if(!v)return false;
      if(!e.sel||e.sel[0]===v[0]){e.sel=v;repintar();return true}
      const a=+e.sel.slice(1),b=+v.slice(1);e.sel=null;
      if(a===b){e.hechos.push(a);sonar.acierto()}else{e.fallos++;sonar.fallo();vibrar(30)}
      repintar();
      if(e.hechos.length===p.pares.length)resolver({correcto:e.fallos<=1,porque:e.fallos>1?`Tuviste ${e.fallos} parejas equivocadas.`:''},e.fallos);
      return true;
    }
  },
  // Verdadero o falso, y por qué
  vf:{
    html(p,e){return `${etiqueta('⚖️','¿Verdadero o falso?')}${p.enunciado?`<div class="pregunta" style="font-size:17px">${conFormulas(p.enunciado)}</div>`:''}<div class="afirmacion">${conFormulas(p.afirmacion)}</div>
<div class="vf"><button type="button" class="opcion" data-vf="1" aria-pressed="${e.vf===true}">✓ Verdadero</button><button type="button" class="opcion" data-vf="0" aria-pressed="${e.vf===false}">✗ Falso</button></div>
${p.razones?`<p class="etiqueta-actividad" style="margin-top:16px">🤔 ¿Por qué?</p><div class="opciones">${p.razones.map((o,i)=>`<button type="button" class="opcion" data-op="${i}" aria-pressed="${e.op===i}"><span>${conFormulas(o)}</span></button>`).join('')}</div>`:''}`},
    listo:(e,p)=>e.vf!==undefined&&(!p.razones||e.op!==undefined),
    leer:e=>({vf:e.vf,op:e.op}),
    clic(t,p,e,repintar){if(t.dataset.vf!==undefined){e.vf=t.dataset.vf==='1';repintar();return true}if(t.dataset.op!==undefined){e.op=+t.dataset.op;repintar();return true}return false},
    comprobar(p,x){const okVf=x.vf===p.valor,okR=!p.razones||x.op===p.razonCorrecta;
      return {correcto:okVf&&okR,porque:!okVf?(p.valor?'La afirmación es verdadera.':'La afirmación es falsa.'):!okR?'Acertaste verdadero/falso, pero el motivo no es ese.':''}}
  },
  // Elegir el paso equivocado de una solución
  error:{
    html(p,e){return `${etiqueta('🔎','Encuentra el error')}${enunciado(p)}<ol class="pasos-sol">${p.pasos.map(normalPaso).map((x,i)=>`<li><button type="button" class="opcion" data-op="${i}" aria-pressed="${e.op===i}"><span>${x.que?`<small class="nota">${conFormulas(x.que)}</small><br>`:''}${conFormulas(x.como)}</span></button></li>`).join('')}</ol>`},
    listo:e=>e.op!==undefined,leer:e=>e.op,
    clic:(t,p,e,repintar)=>{if(t.dataset.op===undefined)return false;e.op=+t.dataset.op;repintar();return true},
    comprobar:(p,op)=>({correcto:op===p.mal,porque:op===p.mal?'':`El error está en el paso ${p.mal+1}.`})
  },
  // Ejemplo resuelto: se revela paso a paso (intenta adivinar el siguiente antes de verlo)
  ejemplo:{
    html(p,e){const n=p.pasos.length,v=Math.min(n,e.vistos||1);
      return `${etiqueta('👀','Ejemplo resuelto')}${enunciado(p)}${p.diagrama?`<div class="diagrama-caja">${p.diagrama}</div>`:''}
<ol class="pasos-proc">${p.pasos.slice(0,v).map((x,i)=>htmlPaso(x,i,{nota:false})).join('')}</ol>
${v<n?`<p class="nota">¿Cuál es el paso ${v+1}? Piénsalo y míralo.</p><button type="button" class="btn ghost ancho" id="ses-paso">Siguiente paso (${v+1}/${n})</button>`
  :`<p class="hoja-linea"><b>Respuesta:</b> ${conFormulas(p.respuesta)}</p>${p.regla?`<p class="nota">${conFormulas(p.regla)}</p>`:''}`}`},
    clic(t,p,e,repintar){
      if(t.id==='ses-paso'){e.vistos=(e.vistos||1)+1;repintar();document.querySelector('.pasos-proc li:last-child')?.scrollIntoView({block:'nearest'});return true}
      if(t.dataset.leerPaso!==undefined){hablar(textoPlano([p.pasos[+t.dataset.leerPaso]].map(normalPaso).map(x=>[x.que,x.como,x.porque].join('. '))[0]),{idioma:p.lang==='en'?'en-US':'es'});return true}
      return false;
    },
    lectura:true
  },
  teoria:{html:p=>`${p.titulo?`<h1>${p.titulo}</h1>`:''}${p.html}`,lectura:true},
  hablar:{
    html(p,e){
      const cab=p.frase?`${etiqueta('🗣️','Di en voz alta')}<p class="frase-objetivo" lang="en">${esc(p.frase)}</p>${p.es?`<p class="nota" style="text-align:center">${p.es}</p>`:''}<div class="row centro">${htmlOir(p.frase)}</div>`
        :`${etiqueta('🗣️','Responde hablando')}${enunciado(p)}`;
      const escribir=e.escribir||!soporte.escuchar;
      return cab+(escribir?`<input class="respuesta-libre" id="ses-resp" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${p.frase?'Escribe la frase':'Tu respuesta en inglés'}" aria-label="Tu respuesta" style="margin-top:16px">${soporte.escuchar?'':`<p class="nota">Tu navegador no reconoce voz: escribe la respuesta.</p>`}`
        :`${htmlMic('ses-mic',p.frase?'Toca y repite':'Toca y responde')}<div class="row centro"><button type="button" class="btn ghost btn-chico" id="ses-escribir">Prefiero escribir</button></div>`);
    },
    listo:e=>(e.escribir||!soporte.escuchar)&&!!$('#ses-resp')?.value.trim(),
    leer:()=>$('#ses-resp').value.trim(),
    bloquear(){const i=$('#ses-resp');if(i)i.readOnly=true},
    async clic(t,p,e,repintar,resolver){
      if(t.id==='ses-escribir'){e.escribir=true;repintar();$('#ses-resp')?.focus();return true}
      if(t.id!=='ses-mic')return false;
      let res;try{res=await escucharConBoton(t)}catch(err){const est=$('#ses-mic-estado');if(est)est.textContent=err.message;return true}
      if(!res)return true;
      const r=evaluarHablar(p,res.alternativas,{});
      registrarHabla({frases:1,seg:res.segundos});if(r.eval)registrarSonidos(p.materia||'ingles',r.eval.sonidos);
      resolver({correcto:r.correcto,porque:r.errorTipico||(r.eval&&!r.correcto?`Puntaje ${r.eval.puntaje}/100: necesitas ${META_PRONUNCIACION}.`:''),evalHabla:r.eval,dicho:r.respuesta},res.transcripcion);
      return true;
    },
    comprobar(p,txt){const r=evaluarHablar(p,[{transcripcion:txt,confianza:1}],{});return {correcto:r.correcto,porque:r.errorTipico||'',evalHabla:r.eval}}
  }
};

/* ---------- la sesión ---------- */
export function crearSesion(cfg){
  let st;
  const nuevo=()=>({i:0,ok:0,xp:0,historial:[],fase:'pregunta',actual:null,e:{},pista:false,t0:Date.now(),fin0:cfg.crono?Date.now()+cfg.crono*1000:0,cargandoIA:false});
  const act=()=>ACT[st.actual?.tipo]||ACT.escribir;
  let reloj;
  const terminar=()=>{st.fase='fin';cerrarHoja();clearInterval(reloj);sonar.fin()};
  function avanzar(){
    cerrarHoja();
    st.actual=cfg.siguiente(st);st.e={};st.pista=false;st.t0=Date.now();
    if(!st.actual)terminar();else st.fase='pregunta';
  }

  function cabecera(){
    const total=Math.max(st.i+(st.fase==='fin'?0:1),cfg.total?.(st)||0);
    const crono=cfg.crono?`<span class="cronometro" id="ses-crono" aria-live="off">${tiempoRestante()}</span>`:'';
    return `<header class="sesion-cab"><button type="button" class="btn-icono" data-salir aria-label="Salir">✕</button>${barra(st.fase==='fin'?total:st.i,total,{gruesa:true})}${crono}${cfg.nivel&&st.fase!=='fin'?puntos(cfg.nivel(st)):''}</header>`;
  }
  const tiempoRestante=()=>{const s=Math.max(0,Math.ceil((st.fin0-Date.now())/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};

  function pie(){
    const p=st.actual,a=act();
    if(a.lectura)return `<footer class="sesion-pie"><button class="btn ancho" id="ses-continuar">Continuar</button></footer>`;
    const pista=p.pista&&!cfg.sinPistas&&!st.pista?`<button type="button" class="btn ghost" id="ses-pista" aria-label="Ver pista" title="Ver pista">💡</button>`:'';
    const ia=cfg.ia&&st.i>0?`<button type="button" class="btn ghost" id="ses-ia" aria-label="Pregunta nueva con IA" title="Pregunta nueva con IA"${st.cargandoIA?' disabled':''}>✨</button>`:'';
    const nose=cfg.rendirse?`<button type="button" class="btn ghost" id="ses-nose">No lo sé</button>`:'';
    const sinBoton=p.tipo==='emparejar'||(p.tipo==='hablar'&&soporte.escuchar&&!st.e.escribir);
    return `<footer class="sesion-pie">${pista}${ia}${nose}${sinBoton?'':`<button class="btn" id="ses-comprobar"${a.listo?.(st.e,p)?'':' disabled'}>Comprobar</button>`}</footer>`;
  }

  function vista(){
    if(st.fase==='fin')return `<div class="sesion ${cfg.tono?`area-${cfg.tono}`:''}">${cabecera()}<div class="sesion-cuerpo"><div class="fin-sesion">${cfg.fin(st)}</div></div></div>`;
    const p=st.actual;
    return `<div class="sesion ${cfg.tono?`area-${cfg.tono}`:''}">${cabecera()}<div class="sesion-cuerpo" id="ses-cuerpo">${act().html(p,st.e)}
${st.pista&&p.pista?`<p class="pista">💡 ${conFormulas(p.pista)} <span class="nota">Con pista no cuenta para dominar.</span></p>`:''}</div>${pie()}</div>`;
  }

  // "📝 Guardar en mis notas": a la nota del tema de la habilidad (ver cuaderno/notas.js)
  const dondeDe=p=>({materia:p.materia||cfg.materia,habilidad:p.habilidad||cfg.habilidad});
  const guardarPasos=p=>dondeDe(p).materia?async paso=>{const n=await agregarAlTema(dondeDe(p),bloqueProcedimiento(p,dondeDe(p),paso));aviso(`📝 Guardado en «${n.titulo}»`)}:null;

  // Muestra la hoja con el resultado y lo registra
  function resolver(r,entrada,repintar){
    if(st.fase!=='pregunta')return;
    const p=st.actual,ms=Date.now()-st.t0;
    st.fase='respondida';
    Object.assign(r,{pista:st.pista,entrada,ms});
    act().bloquear?.();act().marcar?.(p,st.e);
    document.querySelectorAll('#ses-comprobar,#ses-pista,#ses-nose,#ses-ia').forEach(b=>b.disabled=true);
    st.historial.push({p,r});st.i++;
    if(r.correcto&&!r.pista)st.ok++;
    const extra=cfg.responder?.(p,r,st)||{};st.xp+=extra.xp||0;
    (r.correcto?sonar.acierto:sonar.fallo)();vibrar(r.correcto?15:[30,40,30]);
    const lineas=[];
    if(r.evalHabla)lineas.push(htmlFraseEvaluada(r.evalHabla));
    if(r.correcto){
      if(p.tipo==='hablar'&&p.modelo&&!p.frase)lineas.push(`<p class="hoja-linea">Otra forma natural: <span lang="en">${esc(p.modelo)}</span></p>`);
      if(r.pista)lineas.push('<p class="hoja-linea">Correcto, pero con pista: no cuenta para dominar.</p>');
      if(p.explicacion)lineas.push(`<p class="hoja-linea">${conFormulas(p.explicacion)}</p>`);
    }else{
      const sol=p.tipo==='opcion'||p.tipo==='porque'?p.opciones[p.correcta]:p.tipo==='hablar'?esc(p.modelo||p.frase):p.respuesta;
      if(sol!==undefined&&!['vf','error','emparejar'].includes(p.tipo))lineas.push(`<p class="hoja-linea"><b>Respuesta correcta:</b> <span${p.lang||p.tipo==='hablar'?' lang="en"':''}>${conFormulas(String(sol))}</span></p>`);
      if(typeof entrada==='string'&&entrada&&!r.rendido)lineas.push(`<p class="hoja-linea"><b>Tu respuesta:</b> «${esc(entrada)}»</p>`);
      if(r.porque)lineas.push(`<p class="hoja-linea"><b>${p.tipo==='opcion'||p.errores?.length?'Error típico':'Por qué'}:</b> ${conFormulas(r.porque)}</p>`);
      if(p.tipo==='error'&&p.porqueMal)lineas.push(`<p class="hoja-linea">${conFormulas(p.porqueMal)}</p>`);
      if(p.explicacion&&p.tipo!=='error')lineas.push(`<p class="hoja-linea">${conFormulas(p.explicacion)}</p>`);
      if(p.regla)lineas.push(`<p class="hoja-linea"><b>Regla:</b> ${conFormulas(p.regla)}</p>`);
    }
    // Procedimiento paso a paso y "No entendí" (explicación alternativa + el siguiente ejercicio más fácil)
    const botones=[p.pasos?.length&&p.tipo!=='error'?'<button type="button" class="btn ghost btn-chico" id="hoja-proc">📖 Ver procedimiento</button>':'',
      !r.correcto&&(p.alternativa||p.regla)?'<button type="button" class="btn ghost btn-chico" id="hoja-noentendi">🤔 No entendí</button>':'',
      dondeDe(p).materia&&(!r.correcto||p.pasos?.length||p.frase)?'<button type="button" class="btn ghost btn-chico" id="hoja-nota">📝 Guardar en mis notas</button>':''].filter(Boolean);
    if(botones.length)lineas.push(`<div class="row hoja-acciones">${botones.join('')}</div>`);
    const pieXp=[extra.xp?`<span class="hoja-xp">+${extra.xp} XP</span>`:'',extra.nota||''].filter(Boolean).join(' · ');
    if(pieXp)lineas.push(`<p class="hoja-linea nota">${pieXp}</p>`);
    abrirHoja({bien:r.correcto,titulo:r.correcto?ELOGIOS[st.i%ELOGIOS.length]:r.rendido?'Esta era la respuesta':'No es correcto',cuerpo:lineas.join(''),boton:'Continuar'});
  }

  return {
    titulo:cfg.titulo,
    inmersiva:true,
    alEntrar(){st=nuevo();avanzar();clearInterval(reloj);
      if(cfg.crono)reloj=setInterval(()=>{if(!st||st.fase==='fin'){clearInterval(reloj);return}
        const el=$('#ses-crono');if(el)el.textContent=tiempoRestante();
        if(Date.now()>=st.fin0&&st.fase==='pregunta'){terminar();document.dispatchEvent(new Event('repintar'))}},500)},
    alSalir(){clearInterval(reloj);cerrarHoja();cerrarProcedimiento()},
    vista,
    estado:()=>st,
    alMostrar(){
      // Comprobar se activa al escribir; Enter comprueba
      const actualizar=()=>{const b=$('#ses-comprobar');if(b&&st.fase==='pregunta')b.disabled=!act().listo?.(st.e,st.actual)};
      document.querySelectorAll('#ses-resp,#vista .celda').forEach(inp=>{
        inp.addEventListener('input',actualizar);
        inp.addEventListener('focus',()=>{casillaFoco.el=inp});
        inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();$('#ses-comprobar')?.click()}});
      });
      const primero=$('#ses-resp')||document.querySelector('#vista .celda');
      if(primero&&st.fase==='pregunta'&&matchMedia('(pointer:fine)').matches)primero.focus({preventScroll:true});
    },
    async alClic(t,ir,repintar){
      if(t.dataset.salir!==undefined){
        if(st.fase!=='fin'&&st.i>0&&!(await confirmar({titulo:'¿Salir de la lección?',texto:'Perderás el avance de esta ronda (lo que ya respondiste sí queda guardado).',si:'Salir',no:'Seguir'})))return true;
        cerrarHoja();clearInterval(reloj);ir(cfg.salir);return true;
      }
      if(t.id==='hoja-seguir'||t.id==='ses-continuar'){avanzar();repintar();window.scrollTo(0,0);return true}
      const ult=st.historial.at(-1);
      if(t.id==='hoja-proc'&&ult){abrirProcedimiento(ult.p,{revelar:true,guardar:guardarPasos(ult.p),idioma:ult.p.lang==='en'?'en-US':'es'});return true}
      if(t.id==='hoja-nota'&&ult){t.disabled=true;
        const d=dondeDe(ult.p),bloque=!ult.r.correcto||!ult.p.pasos?.length?bloqueError(ult.p,d,ult.r):bloqueProcedimiento(ult.p,d);
        try{const n=await agregarAlTema(d,bloque);t.textContent='✅ Guardado';aviso(`📝 Guardado en «${n.titulo}»`)}catch(e){t.disabled=false;aviso('No se pudo guardar la nota.')}
        return true}
      if(t.id==='hoja-noentendi'&&ult){st.facil=true;
        abrirProcedimiento(ult.p,{revelar:false,alternativa:`${ult.p.alternativa||''}${ult.p.regla?`<p><b>La regla:</b> ${ult.p.regla}</p>`:''}<p class="nota">El siguiente ejercicio será más fácil.</p>`,
          ia:cfg.explicarIA?()=>cfg.explicarIA(ult.p,ult.r.entrada):null,guardar:guardarPasos(ult.p)});return true}
      if(st.fase!=='pregunta')return;
      const p=st.actual,a=act();
      if(t.dataset.tecla!==undefined){
        const inp=casillaFoco.el&&document.body.contains(casillaFoco.el)?casillaFoco.el:$('#ses-resp');
        if(inp){const k=t.dataset.tecla==='−'?'-':t.dataset.tecla==='·'?'*':t.dataset.tecla,ini=inp.selectionStart??inp.value.length;
          inp.value=inp.value.slice(0,ini)+k+inp.value.slice(inp.selectionEnd??ini);inp.focus();inp.setSelectionRange?.(ini+k.length,ini+k.length);inp.dispatchEvent(new Event('input'))}
        return true;
      }
      if(t.id==='ses-pista'){st.pista=true;repintar();return true}
      if(t.id==='ses-ia'&&cfg.ia){st.cargandoIA=true;repintar();
        try{const q=await cfg.ia(st);if(q){st.actual=q;st.e={};st.pista=false;st.t0=Date.now()}}catch(e){}
        st.cargandoIA=false;repintar();return true}
      if(t.id==='ses-nose'){resolver({correcto:false,rendido:true},'',repintar);return true}
      if(a.clic){const r=await a.clic(t,p,st.e,()=>{const y=window.scrollY;repintar();window.scrollTo(0,y)},(res,entrada)=>resolver(res,entrada,repintar));
        if(r){const b=$('#ses-comprobar');if(b&&st.fase==='pregunta')b.disabled=!a.listo?.(st.e,p);return true}}
      if(t.id==='ses-comprobar'&&a.listo?.(st.e,p)){
        const entrada=a.leer(st.e,p);
        resolver(a.comprobar(p,entrada,st.e),entrada,repintar);
        return true;
      }
    }
  };
}
