/* Ejercicios en formato común. Los textos son HTML escrito en el repositorio (contenido de confianza).
   {tipo:'opcion',    pregunta, opciones:[…], correcta, porque:{índice:'por qué está mal'}, regla, codigo?}
   {tipo:'completar', pregunta, respuestas:[aceptadas…], errores?:{'respuesta típica':'por qué está mal'}, regla, pista?, codigo?, oir?}
                      oir: texto en inglés que se puede escuchar (comprensión auditiva)
   {tipo:'tarjeta',   frente, reverso}   (no cuenta como producción)
   {tipo:'hablar',    frase, es?, regla, sonidos?, materia?}                      decir una frase en voz alta (pronunciación ≥ 80)
   {tipo:'hablar',    pregunta, oir?, acepta, errores?, modelo, pista?, regla}    responder hablando (diálogos)
   Producción = completar o hablar. La opción múltiple solo se usa para introducir.
   hablar usa el micrófono; si el navegador no reconoce voz, se responde escribiendo. */
import {$,esc} from '../utilidades.js';
import {soporte,htmlMic,htmlOir,htmlFraseEvaluada,escucharConBoton} from './voz.js';
import {evaluar,evaluarRespuesta} from './pronunciacion.js';
import {registrarHabla,registrarSonidos} from './progreso.js';
export const META_PRONUNCIACION=80;

// opciones.pista=false oculta el botón de pista (examen de ubicación)
export function htmlEjercicio(ej,{pista=true}={}){
  const codigo=ej.codigo?`<pre class="ej-codigo">${esc(ej.codigo)}</pre>`:'';
  let cuerpo;
  if(ej.tipo==='opcion')cuerpo=`<p class="ej-preg">${ej.pregunta}</p>${codigo}<div class="opts" id="ej-ops">${ej.opciones.map((o,i)=>`<button data-op="${i}">${o}</button>`).join('')}</div>`;
  else if(ej.tipo==='completar')cuerpo=`${ej.oir?`<div class="row centro">${htmlOir(ej.oir)}</div>`:''}<p class="ej-preg">${ej.pregunta}</p>${codigo}
<form class="row" id="ej-form"><label for="ej-resp">Tu respuesta<input id="ej-resp" autocomplete="off" autocapitalize="off" spellcheck="false"></label><button class="btn" id="ej-ok">Comprobar</button>${pista&&ej.pista?'<button type="button" class="btn ghost" id="ej-ver-pista">Ver pista</button>':''}</form>
${pista&&ej.pista?`<p class="ej-pista" id="ej-pista" hidden>Pista: ${ej.pista} <span class="progress">(con pista, este ejercicio no cuenta para dominar la lección)</span></p>`:''}`;
  else if(ej.tipo==='hablar'){
    const formulario=`<form class="row" id="ej-form"${soporte.escuchar?' hidden':''}><label for="ej-resp">${ej.frase?'Escribe la frase':'Tu respuesta'}<input id="ej-resp" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en"></label><button class="btn" id="ej-ok">Comprobar</button></form>`;
    cuerpo=(ej.frase?`<p class="ej-preg">Di en voz alta:</p><p class="frase-objetivo" lang="en">${esc(ej.frase)}</p>${ej.es?`<p class="nota">${ej.es}</p>`:''}${htmlOir(ej.frase)}`
      :`<p class="ej-preg">${ej.pregunta}</p>${ej.oir?htmlOir(ej.oir):''}`)
      +(soporte.escuchar?`${htmlMic('ej-mic')}<div class="row centro"><button type="button" class="btn ghost btn-chico" id="ej-escribir">Prefiero escribir</button>${pista&&ej.pista?'<button type="button" class="btn ghost btn-chico" id="ej-ver-pista">Ver pista</button>':''}</div>`
        :`<p class="ej-pista">${esc('Micrófono no disponible en este navegador: escribe la respuesta.')}</p>`)
      +formulario+(pista&&ej.pista?`<p class="ej-pista" id="ej-pista" hidden>Pista: ${ej.pista} <span class="progress">(con pista no cuenta como dominado)</span></p>`:'');
  }
  else cuerpo=`<div class="tarjeta"><div class="ej-k">Tarjeta</div><div class="ej-preg">${ej.frente}</div><div class="tarjeta-reverso" id="ej-reverso" hidden>${ej.reverso}</div></div>
<div class="row" style="margin-top:12px"><button class="btn" id="ej-voltear">Mostrar respuesta</button><button class="btn" data-sabia="1" hidden>La sabía</button><button class="btn ghost" data-sabia="0" hidden>No la sabía</button></div>`;
  return `<div id="ej" data-tipo="${ej.tipo}">${cuerpo}<div id="ej-fb" class="result" hidden></div></div>`;
}

/* ---------- comparar respuestas escritas ---------- */
const normal=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  .replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"').replace(/[−–]/g,'-').replace(/²/g,'^2').replace(/³/g,'^3')
  .replace(/^[¿¡\s]+/,'').replace(/[.!?\s]+$/,'').replace(/\s+/g,' ').trim();
const sinEspacios=s=>s.replace(/\s/g,'');
const sinPuntuacion=s=>s.replace(/[,;:]/g,'').replace(/\s+/g,' ');
const numero=s=>{
  const t0=normal(s).replace(/^[a-z]\s*=\s*/,'');
  if(/,\s/.test(t0))return null; // "3, 2" es una lista o un par, no el decimal 3,2
  const t=sinEspacios(t0).replace(',','.');
  if(/^[+-]?\d+(\.\d+)?$/.test(t))return parseFloat(t);
  const f=t.match(/^([+-]?\d+)\/(\d+)$/); return f&&+f[2]?f[1]/f[2]:null;
};
export function coincide(valor,respuestas){
  const v=normal(valor),n=numero(valor);
  return respuestas.some(r=>{const a=normal(r),m=numero(r);
    return a===v||sinEspacios(a)===sinEspacios(v)||sinPuntuacion(a)===sinPuntuacion(v)||(n!=null&&m!=null&&Math.abs(n-m)<1e-9)});
}

/* ---------- interacción ---------- */
// Evalúa lo dicho (o escrito) en un ejercicio de hablar
function evaluarHablar(ej,alternativas,r){
  if(ej.frase){
    const ev=evaluar(ej.frase,alternativas,{sonidos:ej.sonidos||[]});
    return Object.assign(r,{correcto:ev.puntaje>=META_PRONUNCIACION,respuesta:ev.transcripcion,eval:ev});
  }
  const er=evaluarRespuesta(alternativas,ej);
  return Object.assign(r,{correcto:er.ok,respuesta:er.dicho,errorTipico:er.error});
}

// Recibe el elemento clicado. Devuelve {correcto, pista, respuesta?, op?} si el usuario acaba de responder; null si no.
// En ejercicios de hablar con micrófono devuelve una promesa (las vistas hacen await).
export function manejarEjercicio(t,ej){
  const caja=$('#ej'); if(!caja||caja.dataset.hecho)return null;
  if(t.id==='ej-ver-pista'){$('#ej-pista').hidden=false;t.hidden=true;caja.dataset.pista='1';$('#ej-resp')?.focus();return null}
  const r={pista:caja.dataset.pista==='1'};
  if(ej.tipo==='hablar'){
    if(t.id==='ej-escribir'){$('#ej-form').hidden=false;t.hidden=true;$('#ej-resp').focus();return null}
    if(t.id==='ej-ok'){
      const inp=$('#ej-resp'); if(!inp.value.trim()){inp.focus();return null}
      inp.readOnly=true;t.hidden=true;caja.dataset.hecho='1';
      return evaluarHablar(ej,[{transcripcion:inp.value.trim(),confianza:1}],r);
    }
    if(t.id==='ej-mic')return (async()=>{
      let res;
      try{res=await escucharConBoton(t)}catch(e){const est=$('#ej-mic-estado');if(est)est.textContent=e.message;return null}
      if(!res||caja.dataset.hecho)return null;
      caja.dataset.hecho='1';t.disabled=true;
      evaluarHablar(ej,res.alternativas,r);r.hablado=true;
      registrarHabla({frases:1,seg:res.segundos});
      if(r.eval)registrarSonidos(ej.materia||'ingles',r.eval.sonidos);
      return r;
    })();
    return null;
  }
  if(ej.tipo==='opcion'&&t.dataset.op!==undefined){
    r.op=+t.dataset.op;r.correcto=r.op===ej.correcta;
    caja.querySelectorAll('#ej-ops button').forEach(b=>b.className=+b.dataset.op===ej.correcta?'right':(b===t?'wrong':''));
  }else if(ej.tipo==='completar'&&t.id==='ej-ok'){
    const inp=$('#ej-resp'); if(!inp.value.trim()){inp.focus();return null}
    r.respuesta=inp.value.trim();r.correcto=coincide(inp.value,ej.respuestas);
    inp.readOnly=true;t.hidden=true;if($('#ej-ver-pista'))$('#ej-ver-pista').hidden=true;
  }else if(ej.tipo==='tarjeta'&&t.id==='ej-voltear'){
    $('#ej-reverso').hidden=false;t.hidden=true;
    caja.querySelectorAll('[data-sabia]').forEach(b=>b.hidden=false);caja.querySelector('[data-sabia="1"]').focus();
    return null;
  }else if(ej.tipo==='tarjeta'&&t.dataset.sabia!==undefined){
    r.correcto=t.dataset.sabia==='1';
    caja.querySelectorAll('[data-sabia]').forEach(b=>b.hidden=true);
  }else return null;
  caja.dataset.hecho='1';
  return r;
}
// Marca el ejercicio como no respondido ("No lo sé") sin mostrar nada
export function rendirse(){const caja=$('#ej');if(!caja||caja.dataset.hecho)return false;caja.dataset.hecho='1';return true}

// Por qué está mal: la explicación de esa opción o de ese error típico, si existe
function porQue(ej,r){
  if(ej.tipo==='hablar'){
    if(r.errorTipico)return r.errorTipico;
    const d=r.eval?.detecciones?.[0],s=d&&(ej.sonidos||[]).find(x=>x.id===d.sonido);
    if(s)return `${d.oido?`Se entendió «${esc(d.oido)}» en vez de «${esc(d.palabra)}»`:`No se entendió «${esc(d.palabra)}»`}. ${s.causa} <b>Tip:</b> ${s.tip}`;
    return r.eval?`Puntaje ${r.eval.puntaje} de 100: necesitas ${META_PRONUNCIACION}. Las palabras en rojo no se entendieron bien.`:'Tu respuesta no encaja con lo que se pedía.';
  }
  if(ej.tipo==='opcion')return ej.porque?.[r.op]||'';
  if(ej.tipo==='completar'&&ej.errores)for(const [mal,motivo] of Object.entries(ej.errores))if(coincide(r.respuesta,[mal]))return motivo;
  return ej.tipo==='completar'?'Tu respuesta no coincide con ninguna forma correcta.':'';
}
const solucion=ej=>ej.tipo==='opcion'?ej.opciones[ej.correcta]:ej.tipo==='completar'?esc(ej.respuestas[0])
  :ej.tipo==='hablar'?`${esc(ej.modelo||ej.frase)} ${htmlOir(ej.modelo||ej.frase)}`:'';

// Resultado: si acierta, corto; si falla, qué escribió, por qué está mal, la regla y la respuesta correcta
export function mostrarResultado(ej,r,extra=''){
  const fb=$('#ej-fb'),regla=ej.regla||ej.explicacion||'';
  let html;
  const evaluada=r.eval?`${htmlFraseEvaluada(r.eval)}<div class="progress">Pronunciación: ${r.eval.puntaje}/100${r.hablado?'':' (escrita)'}</div>`:'';
  if(ej.tipo==='hablar'&&r.correcto)html=`<span class="allow">¡Bien dicho!</span>${evaluada}${!ej.frase&&ej.modelo&&r.respuesta?`<div class="fb-linea nota">Otra forma natural: ${esc(ej.modelo)}</div>`:''}`;
  else if(ej.tipo==='hablar')html=`<span class="deny">Todavía no.</span>${r.respuesta?` ${r.hablado?'Se entendió':'Escribiste'} «${esc(r.respuesta)}».`:''}${evaluada}
<div class="fb-linea"><b>Por qué:</b> ${porQue(ej,r)}</div>${regla?`<div class="fb-linea"><b>Regla:</b> ${regla}</div>`:''}
<div class="fb-linea"><b>${ej.frase?'Frase':'Respuesta modelo'}:</b> ${solucion(ej)}</div>`;
  else if(ej.tipo==='tarjeta')html=r.correcto?'<span class="allow">¡Bien!</span>':'<span class="warn">Te falta practicarla.</span>';
  else if(r.correcto)html=r.pista?'<span class="warn">Correcto, con pista.</span> No cuenta para dominar la lección.':'<span class="allow">¡Correcto!</span>';
  else{const pq=porQue(ej,r);
    html=`<span class="deny">No es correcto.</span>${r.respuesta?` Escribiste «${esc(r.respuesta)}».`:''}
${pq?`<div class="fb-linea"><b>Por qué:</b> ${pq}</div>`:''}${regla?`<div class="fb-linea"><b>Regla:</b> ${regla}</div>`:''}
<div class="fb-linea"><b>Respuesta correcta:</b> ${solucion(ej)}</div>`}
  fb.innerHTML=html+extra;
  fb.hidden=false;
  fb.querySelector('button')?.focus();
}
