/* 🗣️ Parte de habla del simulacro: un examinador que pregunta en voz alta (TTS) y escucha (reconocimiento de voz).
   - Con IA: sigue el guion del nivel, hace preguntas de seguimiento según lo que respondiste y, al final, califica con
     una rúbrica inspirada en Cambridge (0–5 por criterio) en JSON con esquema fijo: 3 cosas bien, hasta 5 errores con
     su corrección y 3 frases útiles. La pronunciación se estima con el reconocedor (voz.js) y se dice que es estimada.
   - Sin IA: el examinador sigue el guion fijo (sin seguimiento); al final, autoevaluación guiada con la rúbrica,
     comparando tus respuestas con las respuestas modelo, y la pronunciación estimada.
   A la IA solo se le manda texto (la transcripción), nunca audio, y nada personal más allá del nivel. */
import {esc} from '../../../utilidades.js';
import {soporte,hablar,callar,htmlMic,escucharConBoton,AVISO_SIN_RECONOCIMIENTO,AVISO_PRIVACIDAD} from '../../../nucleo/voz.js';
import {iaDisponible,pedir} from '../../../nucleo/ia.js';
import {registrarHabla} from '../../../nucleo/progreso.js';
import {ESCENAS} from './escenas.js';
import {CRITERIOS_HABLA} from './motor.js';

export const MAX_SEGUIMIENTOS=1;    // preguntas de seguimiento de la IA por cada pregunta del guion

const SISTEMA_TURNO=(s,pt)=>`You are a friendly but professional English speaking examiner for a practice test inspired by Cambridge ${s.nivel==='A2'?'A2 Key':s.nivel==='B1'?'B1 Preliminary':s.nivel==='B2'?'B2 First':'A1'} (NOT an official exam). Level: ${s.nivel}.
Current part: ${pt.titulo} (${pt.tipo}). ${pt.consigna?`Task: ${pt.consigna}`:''}
Script questions for this part, in order: ${pt.preguntas.map((q,i)=>`${i+1}) ${q}`).join(' ')}
Rules: speak only English, use vocabulary of level ${s.nivel}, one short question at a time (max 2 sentences). After the candidate answers a script question you may ask at most ONE short follow-up question based on what they said, then move to the next script question. Never correct the candidate during the test. Do not give feedback.
Return JSON: "dice" = what you say next; "accion" = "seguimiento" (a follow-up to the last answer), "siguiente" (the next script question) or "fin_parte" (the part is complete: all script questions asked). "pregunta" = number of the script question you are on (1-based).`;
const ESQ_TURNO={type:'object',properties:{dice:{type:'string'},accion:{type:'string',enum:['seguimiento','siguiente','fin_parte']},pregunta:{type:'integer'}},required:['dice','accion','pregunta']};
const SISTEMA_NOTA=(s,crits)=>`You are an English speaking examiner for a practice test inspired by Cambridge, level ${s.nivel} (NOT an official exam). The candidate is a Spanish speaker from Latin America. Their answers come from speech recognition: ignore punctuation and capitalization, but words that seem wrong in context may be mispronounced.
Grade each criterion from 0 to 5 using level ${s.nivel} expectations: ${crits.map(([k,t])=>`${k} (${t})`).join(', ')}. For "pronunciacion", rely mainly on the estimated pronunciation score provided (it is an approximation) and say so.
Write all comments in Spanish, short and concrete. "bien": exactly 3 things the candidate did well. "errores": up to 5 real errors, each with the candidate's original phrase, the corrected English phrase and a short reason in Spanish. "frases": 3 useful English phrases for next time (with Spanish meaning). "nivel": your CEFR estimate.`;
const ESQ_NOTA=crits=>({type:'object',properties:{
  criterios:{type:'object',properties:Object.fromEntries(crits.map(([k])=>[k,{type:'object',properties:{nota:{type:'integer',minimum:0,maximum:5},comentario:{type:'string'}},required:['nota','comentario']}])),required:crits.map(([k])=>k)},
  bien:{type:'array',items:{type:'string'}},
  errores:{type:'array',items:{type:'object',properties:{original:{type:'string'},corregida:{type:'string'},por:{type:'string'}},required:['original','corregida','por']}},
  frases:{type:'array',items:{type:'object',properties:{en:{type:'string'},es:{type:'string'}},required:['en','es']}},
  nivel:{type:'string'}},required:['criterios','bien','errores','frases']});

// Descriptores para la autoevaluación sin IA (0–5)
const DESCRIPTORES={gramatica:['No pude responder','Palabras sueltas','Frases simples con muchos errores','Frases correctas casi siempre','Variedad y pocos errores','Precisión y vocabulario rico'],
  discurso:['Sin respuesta','Ideas sueltas','Algo de orden','Ideas ordenadas con and/but/because','Conectores variados','Discurso claro y bien enlazado'],
  pronunciacion:['No se entendió','Muy difícil de entender','Se entendió con esfuerzo','Se entiende bien','Clara casi siempre','Clara y natural'],
  interaccion:['No respondí','Respondí muy poco','Respondí, sin desarrollar','Respondí y desarrollé algo','Desarrollé y mantuve la conversación','Fluido, natural y con iniciativa']};

/* La vista de la parte de habla. h: estado guardado (est.partes.habla); guardar(): persiste el intento; alTerminar(): sigue */
export function crearHabla(s,h,{guardar,alTerminar}){
  const partes=s.habla.partes,crits=CRITERIOS_HABLA(s.nivel),conIA=()=>iaDisponible()&&!h.sinIA;
  Object.assign(h,{k:h.k||0,q:h.q||0,seg:h.seg||0,log:h.log||[],rep:h.rep||{},fase:h.fase||'inicio'});
  let cargando=false,error='',escribir=!soporte.escuchar;
  const pt=()=>partes[h.k];
  const actual=()=>h.log.filter(x=>x.rol==='ex').at(-1)?.texto||'';
  function decir(texto){if(soporte.hablar)hablar(texto)}
  async function examinador(){
    // Sin IA (o la IA falló): la siguiente pregunta del guion
    const avanzarGuion=()=>{
      if(h.q<pt().preguntas.length){const t=pt().preguntas[h.q];h.log.push({rol:'ex',texto:t,k:h.k,q:h.q});h.q++;return t}
      if(h.k<partes.length-1){h.k++;h.q=0;h.seg=0;const t=`${partes[h.k].titulo.replace(/^Parte \d · /,'')}. ${partes[h.k].preguntas[0]}`;h.log.push({rol:'ex',texto:partes[h.k].preguntas[0],k:h.k,q:0,nueva:true});h.q=1;return t}
      h.fase='calificar';return null};
    if(!conIA()||!h.log.some(x=>x.rol==='yo'&&x.k===h.k)){const t=avanzarGuion();guardar();return t}
    cargando=true;
    try{
      const historial=h.log.filter(x=>x.k===h.k).map(x=>({role:x.rol==='ex'?'assistant':'user',content:x.texto}));
      const r=await pedir({nivel:'texto',maxTokens:400,esquemaJSON:ESQ_TURNO,sistema:SISTEMA_TURNO(s,pt()),mensajes:[...historial,{role:'user',content:'[Decide your next turn]'}]});
      cargando=false;
      if(r.accion==='seguimiento'&&h.seg<MAX_SEGUIMIENTOS*pt().preguntas.length&&r.dice){h.seg++;h.log.push({rol:'ex',texto:r.dice,k:h.k,q:h.q-1,seguimiento:true});guardar();return r.dice}
      return avanzarGuion();
    }catch(e){cargando=false;error=`${e.message} Sigo con el guion sin IA.`;h.sinIA=true;const t=avanzarGuion();guardar();return t}
  }
  async function responder(texto,res){
    texto=String(texto||'').trim();if(!texto)return;
    const conf=res?.confianza>0?res.confianza:null;
    h.log.push({rol:'yo',texto,k:h.k,conf,seg:res?.segundos||0});
    if(res)registrarHabla({frases:1,turnos:1,seg:res.segundos||0});
    guardar();
    const t=await examinador();
    if(t)decir(t);
  }
  const pronEstimada=()=>{const cs=h.log.filter(x=>x.rol==='yo'&&x.conf).map(x=>x.conf);return cs.length?Math.round(cs.reduce((a,b)=>a+b,0)/cs.length*100):null};
  async function calificar(){
    if(!conIA()){h.fase='autoeval';guardar();return}
    cargando=true;error='';
    try{
      const transcripcion=h.log.map(x=>`${x.rol==='ex'?'EXAMINER':'CANDIDATE'}: ${x.texto}`).join('\n'),p=pronEstimada();
      const r=await pedir({nivel:'texto',maxTokens:2500,esfuerzo:'medium',esquemaJSON:ESQ_NOTA(crits),sistema:SISTEMA_NOTA(s,crits),
        mensajes:[{role:'user',content:`Estimated pronunciation score from speech recognition (0-100, approximate): ${p??'not available (typed answers)'}\n\nTranscript:\n${transcripcion}`}]});
      h.calificacion=r;h.fase='fin';h.terminada=true;cargando=false;guardar();alTerminar();
    }catch(e){cargando=false;error=`${e.message} Puedes calificarte tú con la rúbrica.`;h.fase='autoeval';guardar()}
  }

  const htmlEscena=id=>{const e=ESCENAS[id];return e?`<figure class="sim-escena">${e.svg}<figcaption><details><summary>Descripción de la imagen</summary>${esc(e.descripcion)}</details></figcaption></figure>`:''};
  const turnoHtml=()=>{
    const p=pt(),ultimo=actual(),rep=h.rep[h.log.length]||0;
    return `<p class="etiqueta-actividad">${esc(p.titulo)}</p>${p.consigna?`<p class="nota">${esc(p.consigna)}</p>`:''}${p.escena?htmlEscena(p.escena):''}
<div class="burbuja ella sim-ex"><span class="quien">Examinador</span><span lang="en">${esc(ultimo)}</span></div>
<div class="row">${soporte.hablar?`<button type="button" class="btn ghost btn-chico" id="hb-repetir"${rep>=1?' disabled':''}>🔁 Repetir${rep>=1?' (ya repetido)':''}</button>`:''}${p.segundos?`<span class="nota">Tienes hasta ${p.segundos} s para responder.</span>`:''}</div>
${cargando?'<p class="cargando">El examinador piensa</p>':escribir?`<label class="campo">Tu respuesta en inglés<textarea id="hb-texto" rows="3" lang="en" autocapitalize="sentences" spellcheck="false"></textarea></label><button class="btn ancho area" id="hb-enviar">Responder</button>${soporte.escuchar?'<button class="btn ghost btn-chico" id="hb-voz">🎙️ Mejor hablar</button>':''}`
  :`${htmlMic('hb-mic','Toca para hablar')}<div class="row centro"><button class="btn ghost btn-chico" id="hb-escribir">Prefiero escribir</button></div>`}
${error?`<p class="aviso-linea">⚠️ ${esc(error)}</p>`:''}`};
  const transcripcionHtml=()=>`<div class="sim-transcripcion"><p class="etiqueta-actividad">📝 Transcripción</p>${h.log.length?h.log.map(x=>`<div class="burbuja ${x.rol==='ex'?'ella':'yo'}"><span class="quien">${x.rol==='ex'?'Examinador':'Tú'}${x.conf?` · ${Math.round(x.conf*100)} % de confianza`:''}</span><span lang="en">${esc(x.texto)}</span></div>`).join(''):'<p class="nota">Aquí aparece lo que dices.</p>'}</div>`;
  function autoevalHtml(){
    const p=pronEstimada(),a=h.autoeval||{};
    const modelos=partes.flatMap((pt,k)=>pt.preguntas.map((q,i)=>{const mias=h.log.filter(x=>x.rol==='yo'&&x.k===k);return `<li><b lang="en">${esc(q)}</b><br><span class="nota">Modelo:</span> <span lang="en">${esc(pt.modelos[i]||'')}</span>${mias[i]?`<br><span class="nota">Tú:</span> <span lang="en">${esc(mias[i].texto)}</span>`:''}</li>`})).join('');
    return `<h2>Autoevaluación</h2><p class="nota">${conIA()?'':'Sin IA, compárate con las respuestas modelo y califícate con la rúbrica (0–5).'} ${p!==null?`Pronunciación estimada por el reconocimiento de voz: <b>${p}/100</b> (es una aproximación).`:''}</p>
<details class="como-se-usa" open><summary>Respuestas modelo</summary><ol>${modelos}</ol></details>
${crits.map(([k,t])=>`<div class="sim-crit"><p><b>${esc(t)}</b><br><span class="nota">${esc(DESCRIPTORES[k][a[k]??-1]||'Elige de 0 a 5')}</span></p><div class="sim-escala" role="group" aria-label="${esc(t)}">${[0,1,2,3,4,5].map(n=>`<button type="button" data-autoeval="${k}:${n}" aria-pressed="${a[k]===n}">${n}</button>`).join('')}</div></div>`).join('')}
<button class="btn ancho area" id="hb-guardar-auto"${crits.every(([k])=>typeof a[k]==='number')?'':' disabled'}>Guardar mi calificación</button>`;
  }
  return {
    vista(){
      if(h.fase==='inicio')return `<div class="sim-habla-inicio"><p>${partes.length} ${partes.length===1?'parte':'partes'}: ${partes.map(p=>esc(p.titulo)).join(' · ')}.</p>
<p class="nota">${AVISO_PRIVACIDAD}</p>${soporte.escuchar?'':`<p class="aviso-linea">⚠️ ${AVISO_SIN_RECONOCIMIENTO}</p>`}
<p class="nota">${iaDisponible()?'✨ Con IA: el examinador hace preguntas de seguimiento y te califica al final.':'Sin IA: el examinador sigue el guion y al final te calificas con la rúbrica y las respuestas modelo.'}</p>
<button class="btn ancho area" id="hb-empezar">🗣️ Empezar a hablar</button></div>`;
      if(h.fase==='calificar')return `<div class="sim-dos"><div>${cargando?'<p class="cargando">Calificando tu parte de habla</p>':`<p>Terminaste la parte de habla.</p>${error?`<p class="aviso-linea">⚠️ ${esc(error)}</p>`:''}<button class="btn ancho area" id="hb-calificar">${conIA()?'✨ Calificar con IA':'Calificarme con la rúbrica'}</button>`}</div>${transcripcionHtml()}</div>`;
      if(h.fase==='autoeval')return `<div class="sim-dos"><div>${autoevalHtml()}</div>${transcripcionHtml()}</div>`;
      if(h.fase==='fin')return `<p>✅ Parte de habla calificada.</p>`;
      return `<div class="sim-dos"><div>${turnoHtml()}</div>${transcripcionHtml()}</div>`;
    },
    alMostrar(){if(h.fase==='turno'&&!cargando&&h._dicho!==h.log.length){h._dicho=h.log.length;decir(actual())}},
    async alClic(t,repintar){
      if(t.id==='hb-empezar'){h.fase='turno';const x=await examinador();repintar();if(x)decir(x);return true}
      if(t.id==='hb-repetir'){h.rep[h.log.length]=(h.rep[h.log.length]||0)+1;guardar();decir(actual());repintar();return true}
      if(t.id==='hb-escribir'){escribir=true;repintar();document.getElementById('hb-texto')?.focus();return true}
      if(t.id==='hb-voz'){escribir=false;repintar();return true}
      if(t.id==='hb-enviar'){const v=document.getElementById('hb-texto')?.value;callar();cargando=!!conIA();repintar();await responder(v,null);cargando=false;repintar();return true}
      if(t.id==='hb-mic'){
        callar();let res;
        const p=pt(),largo=['turno','descripcion'].includes(p.tipo);
        try{res=await escucharConBoton(t,{maxSegundos:p.segundos||40,silencio:largo?4000:2500,continuo:largo})}catch(e){error=e.message;repintar();return true}
        if(!res)return true;
        error='';cargando=!!conIA();repintar();await responder(res.transcripcion,res);cargando=false;repintar();return true}
      if(t.id==='hb-calificar'){repintar();await calificar();repintar();return true}
      if(t.dataset.autoeval){const [k,n]=t.dataset.autoeval.split(':');h.autoeval={...(h.autoeval||{}),[k]:+n};guardar();repintar();return true}
      if(t.id==='hb-guardar-auto'){h.fase='fin';h.terminada=true;guardar();alTerminar();return true}
    },
    salir(){callar()}
  };
}
