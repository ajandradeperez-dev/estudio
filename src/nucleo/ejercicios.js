/* Ejercicios en formato común. Los textos son HTML escrito en el repositorio (contenido de confianza).
   {tipo:'opcion',    pregunta, opciones:[…], correcta:índice, codigo?, explicacion?}
   {tipo:'completar', pregunta, respuestas:[aceptadas…], pista?, codigo?, explicacion?}
   {tipo:'tarjeta',   frente, reverso}   el usuario voltea la tarjeta y se califica: "La sabía" / "No la sabía" */
import {$,esc} from '../utilidades.js';

export function htmlEjercicio(ej){
  const codigo=ej.codigo?`<pre class="ej-codigo">${esc(ej.codigo)}</pre>`:'';
  let cuerpo;
  if(ej.tipo==='opcion')cuerpo=`<p class="ej-preg">${ej.pregunta}</p>${codigo}<div class="opts" id="ej-ops">${ej.opciones.map((o,i)=>`<button data-op="${i}">${o}</button>`).join('')}</div>`;
  else if(ej.tipo==='completar')cuerpo=`<p class="ej-preg">${ej.pregunta}</p>${codigo}
<form class="row" id="ej-form"><label for="ej-resp">Tu respuesta<input id="ej-resp" autocomplete="off" autocapitalize="off" spellcheck="false"></label><button class="btn" id="ej-ok">Comprobar</button></form>
${ej.pista?`<p class="ej-pista">Pista: ${ej.pista}</p>`:''}`;
  else cuerpo=`<div class="tarjeta"><div class="ej-k">Tarjeta</div><div class="ej-preg">${ej.frente}</div><div class="tarjeta-reverso" id="ej-reverso" hidden>${ej.reverso}</div></div>
<div class="row" style="margin-top:12px"><button class="btn" id="ej-voltear">Mostrar respuesta</button><button class="btn" data-sabia="1" hidden>La sabía</button><button class="btn ghost" data-sabia="0" hidden>No la sabía</button></div>`;
  return `<div id="ej" data-tipo="${ej.tipo}">${cuerpo}<div id="ej-fb" class="result" hidden></div></div>`;
}

/* ---------- comparar respuestas escritas ---------- */
const normal=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’‘`´]/g,"'").replace(/[−–]/g,'-').replace(/\s+/g,' ').trim().replace(/[.!]$/,'');
const numero=s=>{
  const t=normal(s).replace(/^[a-z]\s*=\s*/,'').replace(/\s/g,'').replace(',','.');
  if(/^[+-]?\d+(\.\d+)?$/.test(t))return parseFloat(t);
  const f=t.match(/^([+-]?\d+)\/(\d+)$/); return f&&+f[2]?f[1]/f[2]:null;
};
export function coincide(valor,respuestas){
  const v=normal(valor),n=numero(valor);
  return respuestas.some(r=>{const a=normal(r),m=numero(r);
    return a===v||a.replace(/\s/g,'')===v.replace(/\s/g,'')||(n!=null&&m!=null&&Math.abs(n-m)<1e-9)});
}

/* ---------- interacción ---------- */
// Recibe el elemento clicado. Devuelve {correcto} si el usuario acaba de responder; null si no.
export function manejarEjercicio(t,ej){
  const caja=$('#ej'); if(!caja||caja.dataset.hecho)return null;
  let correcto;
  if(ej.tipo==='opcion'&&t.dataset.op!==undefined){
    correcto=+t.dataset.op===ej.correcta;
    caja.querySelectorAll('#ej-ops button').forEach(b=>b.className=+b.dataset.op===ej.correcta?'right':(b===t?'wrong':''));
  }else if(ej.tipo==='completar'&&t.id==='ej-ok'){
    const inp=$('#ej-resp'); if(!inp.value.trim()){inp.focus();return null}
    correcto=coincide(inp.value,ej.respuestas);
    inp.readOnly=true;t.hidden=true;
  }else if(ej.tipo==='tarjeta'&&t.id==='ej-voltear'){
    $('#ej-reverso').hidden=false;t.hidden=true;
    caja.querySelectorAll('[data-sabia]').forEach(b=>b.hidden=false);caja.querySelector('[data-sabia="1"]').focus();
    return null;
  }else if(ej.tipo==='tarjeta'&&t.dataset.sabia!==undefined){
    correcto=t.dataset.sabia==='1';
    caja.querySelectorAll('[data-sabia]').forEach(b=>b.hidden=true);
  }else return null;
  caja.dataset.hecho='1';
  return {correcto};
}

// Muestra el resultado con la solución, la explicación y lo que agregue la vista (XP, repaso, botón Siguiente)
export function mostrarResultado(ej,correcto,extra=''){
  const fb=$('#ej-fb'),sol=ej.tipo==='opcion'?ej.opciones[ej.correcta]:ej.tipo==='completar'?esc(ej.respuestas[0]):'';
  const cab=ej.tipo==='tarjeta'?(correcto?'<span class="allow">¡Bien!</span>':'<span class="warn">Te falta practicarla.</span>')
    :correcto?'<span class="allow">¡Correcto!</span>':`<span class="deny">No es correcto.</span> La respuesta es: <b>${sol}</b>`;
  fb.innerHTML=`${cab}${ej.explicacion?`<br>${ej.explicacion}`:''}${extra}`;
  fb.hidden=false;
  fb.querySelector('button')?.focus();
}
