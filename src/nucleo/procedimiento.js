/* Procedimiento paso a paso de un ejercicio: {que, como, porque, ojo?} con los números de ESE ejercicio.
   - htmlPaso / htmlPasos: un paso o la lista (lo que cambia va resaltado con \cambio{…} o <mark class="cambio">).
   - abrirProcedimiento(p, opciones): pantalla completa con los pasos revelables uno por uno ("Siguiente paso"),
     🔊 para escuchar cada paso, 📝 para guardarlo en Mis notas y, si se pide, la explicación alternativa ("No entendí")
     y "✨ Explícamelo de otra forma" con IA (si hay clave). */
import {esc} from '../utilidades.js';
import {conFormulas} from './formula.js';
import {hablar,callar,soporte} from './voz.js';

// Acepta pasos viejos en texto (p. ej. de la IA) además de {que, como, porque}
export const normalPaso=x=>typeof x==='string'?{que:'',como:x,porque:''}:x;
export function htmlPaso(x,i,{acciones=true,nota=true}={}){
  const p=normalPaso(x);
  return `<li class="paso-proc" data-paso="${i}">
${p.que?`<p class="paso-que">${conFormulas(p.que)}</p>`:''}${p.como?`<div class="paso-como">${conFormulas(p.como)}</div>`:''}
${p.porque?`<p class="paso-porque">💡 ${conFormulas(p.porque)}</p>`:''}${p.ojo?`<p class="paso-ojo">⚠️ <b>Ojo:</b> ${conFormulas(p.ojo)}</p>`:''}
${acciones?`<div class="paso-acciones">${soporte.hablar?`<button type="button" class="btn-icono" data-leer-paso="${i}" aria-label="Escuchar el paso ${i+1}">🔊</button>`:''}${nota?`<button type="button" class="btn-icono" data-nota-paso="${i}" aria-label="Guardar el paso ${i+1} en Mis notas">📝</button>`:''}</div>`:''}</li>`;
}
export const htmlPasos=(pasos,opc)=>`<ol class="pasos-proc">${(pasos||[]).map((x,i)=>htmlPaso(x,i,opc)).join('')}</ol>`;

// Texto para leer en voz alta: sin etiquetas y con la notación de KaTeX en palabras
export function textoPlano(html){
  return String(html??'').replace(/<[^>]+>/g,' ')
    .replace(/\\cambio\{([^}]*)\}/g,'$1').replace(/\\(?:d|t)?frac\{([^}]*)\}\{([^}]*)\}/g,'$1 sobre $2').replace(/\\sqrt\{([^}]*)\}/g,'raíz de $1')
    .replace(/\^\{?2\}?/g,' al cuadrado').replace(/\^\{?(-?\w+)\}?/g,' a la $1').replace(/\\cdot|\\times/g,' por ').replace(/\\int/g,'integral de ')
    .replace(/\\lim_\{[^}]*\}/g,'límite ').replace(/\\(left|right|displaystyle|,|;|quad|!)/g,' ').replace(/\\[a-zA-Z]+/g,' ').replace(/[\\{}()[\]]/g,' ').replace(/\s+/g,' ').trim();
}
const textoPaso=x=>{const p=normalPaso(x);return [p.que,p.como,p.porque&&`Por qué: ${p.porque}`,p.ojo&&`Ojo: ${p.ojo}`].filter(Boolean).map(textoPlano).join('. ')};

/* opciones: {revelar (de a uno), alternativa (HTML, "No entendí"), ia (async () → texto), guardar (paso|null → void), idioma} */
export function abrirProcedimiento(p,{revelar=true,alternativa='',ia=null,guardar=null,idioma='es'}={}){
  cerrarProcedimiento();
  const pasos=(p.pasos||[]).map(normalPaso);let vistos=revelar?1:pasos.length,avanzo=false;
  const f=document.createElement('div');f.className='proc-fondo';f.id='procedimiento';
  const pintar=()=>{f.innerHTML=`<div class="proc" role="dialog" aria-modal="true" aria-labelledby="proc-t">
<header class="proc-cab"><h2 id="proc-t">📖 Procedimiento</h2><button type="button" class="btn-icono" data-cerrar aria-label="Cerrar">✕</button></header>
<div class="proc-cuerpo">
${alternativa?`<div class="card alternativa"><p class="ej-k">🤔 Otra forma de verlo</p>${conFormulas(alternativa)}${ia?`<div class="row" style="margin-top:8px"><button type="button" class="btn ghost btn-chico" data-ia>✨ Explícamelo de otra forma</button></div><div id="proc-ia" aria-live="polite"></div>`:''}</div>`:''}
<div class="pregunta" style="font-size:18px">${conFormulas(p.enunciado||'')}</div>
${p.diagrama?`<div class="diagrama-caja">${p.diagrama}</div>`:''}
<ol class="pasos-proc">${pasos.slice(0,vistos).map((x,i)=>htmlPaso(x,i,{acciones:true,nota:!!guardar})).join('')}</ol>
${vistos<pasos.length?`<p class="nota">¿Cuál crees que es el paso ${vistos+1}? Piénsalo y luego míralo.</p>`:''}
</div>
<footer class="proc-pie">${vistos<pasos.length?`<button type="button" class="btn ghost" data-todo>Ver todo</button><button type="button" class="btn" data-sig>Siguiente paso (${vistos+1}/${pasos.length})</button>`
  :`${guardar?`<button type="button" class="btn ghost" data-nota-todo>📝 Guardar todo</button>`:''}<button type="button" class="btn" data-cerrar>Entendido</button>`}</footer></div>`;
    (f.querySelector('[data-sig]')||f.querySelector('[data-cerrar]:not(.btn-icono)'))?.focus({preventScroll:true});
    const ult=f.querySelector('.pasos-proc li:last-child');if(ult&&avanzo)ult.scrollIntoView({block:'nearest',behavior:'smooth'});};
  f.addEventListener('click',async e=>{
    const t=e.target.closest('button');if(!t){if(e.target===f)cerrarProcedimiento();return}
    if(t.dataset.cerrar!==undefined){cerrarProcedimiento();return}
    if(t.dataset.sig!==undefined){vistos++;avanzo=true;pintar();return}
    if(t.dataset.todo!==undefined){vistos=pasos.length;avanzo=true;pintar();return}
    if(t.dataset.leerPaso!==undefined){hablar(textoPaso(pasos[+t.dataset.leerPaso]),{idioma});return}
    if(t.dataset.notaPaso!==undefined&&guardar){await guardar(pasos[+t.dataset.notaPaso]);t.textContent='✅';return}
    if(t.dataset.notaTodo!==undefined&&guardar){await guardar(null);t.textContent='✅ Guardado';t.disabled=true;return}
    if(t.dataset.ia!==undefined&&ia){const caja=f.querySelector('#proc-ia');t.disabled=true;caja.innerHTML='<p class="cargando">Preguntando a Claude</p>';
      try{caja.innerHTML=`<div class="ia-explica">${conFormulas(esc(await ia()).replace(/\\\\/g,'\\').replace(/\n/g,'<br>'))}</div>`}catch(err){caja.innerHTML=`<p class="deny">${esc(err.message||'No se pudo conectar. Usa la explicación de arriba.')}</p>`}}
  });
  f.addEventListener('keydown',e=>{if(e.key==='Escape')cerrarProcedimiento()});
  document.body.appendChild(f);pintar();
}
export function cerrarProcedimiento(){callar();document.getElementById('procedimiento')?.remove()}
