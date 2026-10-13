/* Ejercicios en formato común. Los textos son HTML escrito en el repositorio (contenido de confianza).
   {tipo:'opcion',    pregunta, opciones:[…], correcta, porque:{índice:'por qué está mal'}, regla, codigo?}
   {tipo:'completar', pregunta, respuestas:[aceptadas…], errores?:{'respuesta típica':'por qué está mal'}, regla, pista?, codigo?}
   {tipo:'tarjeta',   frente, reverso}   (no cuenta como producción)
   Producción = completar (escribir, traducir, resolver). La opción múltiple solo se usa para introducir. */
import {$,esc} from '../utilidades.js';

// opciones.pista=false oculta el botón de pista (examen de ubicación)
export function htmlEjercicio(ej,{pista=true}={}){
  const codigo=ej.codigo?`<pre class="ej-codigo">${esc(ej.codigo)}</pre>`:'';
  let cuerpo;
  if(ej.tipo==='opcion')cuerpo=`<p class="ej-preg">${ej.pregunta}</p>${codigo}<div class="opts" id="ej-ops">${ej.opciones.map((o,i)=>`<button data-op="${i}">${o}</button>`).join('')}</div>`;
  else if(ej.tipo==='completar')cuerpo=`<p class="ej-preg">${ej.pregunta}</p>${codigo}
<form class="row" id="ej-form"><label for="ej-resp">Tu respuesta<input id="ej-resp" autocomplete="off" autocapitalize="off" spellcheck="false"></label><button class="btn" id="ej-ok">Comprobar</button>${pista&&ej.pista?'<button type="button" class="btn ghost" id="ej-ver-pista">Ver pista</button>':''}</form>
${pista&&ej.pista?`<p class="ej-pista" id="ej-pista" hidden>Pista: ${ej.pista} <span class="progress">(con pista, este ejercicio no cuenta para dominar la lección)</span></p>`:''}`;
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
// Recibe el elemento clicado. Devuelve {correcto, pista, respuesta?, op?} si el usuario acaba de responder; null si no.
export function manejarEjercicio(t,ej){
  const caja=$('#ej'); if(!caja||caja.dataset.hecho)return null;
  if(t.id==='ej-ver-pista'){$('#ej-pista').hidden=false;t.hidden=true;caja.dataset.pista='1';$('#ej-resp').focus();return null}
  const r={pista:caja.dataset.pista==='1'};
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
  if(ej.tipo==='opcion')return ej.porque?.[r.op]||'';
  if(ej.tipo==='completar'&&ej.errores)for(const [mal,motivo] of Object.entries(ej.errores))if(coincide(r.respuesta,[mal]))return motivo;
  return ej.tipo==='completar'?'Tu respuesta no coincide con ninguna forma correcta.':'';
}
const solucion=ej=>ej.tipo==='opcion'?ej.opciones[ej.correcta]:ej.tipo==='completar'?esc(ej.respuestas[0]):'';

// Resultado: si acierta, corto; si falla, qué escribió, por qué está mal, la regla y la respuesta correcta
export function mostrarResultado(ej,r,extra=''){
  const fb=$('#ej-fb'),regla=ej.regla||ej.explicacion||'';
  let html;
  if(ej.tipo==='tarjeta')html=r.correcto?'<span class="allow">¡Bien!</span>':'<span class="warn">Te falta practicarla.</span>';
  else if(r.correcto)html=r.pista?'<span class="warn">Correcto, con pista.</span> No cuenta para dominar la lección.':'<span class="allow">¡Correcto!</span>';
  else{const pq=porQue(ej,r);
    html=`<span class="deny">No es correcto.</span>${r.respuesta?` Escribiste «${esc(r.respuesta)}».`:''}
${pq?`<div class="fb-linea"><b>Por qué:</b> ${pq}</div>`:''}${regla?`<div class="fb-linea"><b>Regla:</b> ${regla}</div>`:''}
<div class="fb-linea"><b>Respuesta correcta:</b> ${solucion(ej)}</div>`}
  fb.innerHTML=html+extra;
  fb.hidden=false;
  fb.querySelector('button')?.focus();
}
