import {$,esc} from '../../../utilidades.js';
import {incidents} from '../datos/incidentes.js';
import {marcarCaso,ejercicio} from '../progreso.js';

// barajar opciones una vez para que la correcta no sea siempre la primera
incidents.forEach(c=>{[['o','a'],['do','da']].forEach(([k,a])=>{const right=c[k][c[a]];c[k]=c[k].map(v=>[Math.random(),v]).sort((p,q)=>p[0]-q[0]).map(v=>v[1]);c[a]=c[k].indexOf(right)})});

let incIdx=0,intentoA=false,intentoB=false; // solo el primer intento de cada pregunta cuenta como ejercicio
export const vista=()=>{
 const x=incidents[incIdx];intentoA=intentoB=false;
 return `<h1>Laboratorio de incidentes</h1>
<p class="lead">Piensa como analista de seguridad: lee los registros simulados del firewall, identifica qué tipo de ataque es y elige la respuesta defensiva.</p>
<div class="tabs" id="itabs">${incidents.map((c,i)=>`<button data-i="${i}" aria-pressed="${i===incIdx}">Caso ${i+1}</button>`).join('')}</div>
<div class="card"><h3>${x.t}</h3><pre>${esc(x.log)}</pre>
 <p style="margin:14px 0 0"><strong>1. ${x.q}</strong></p><div class="opts" id="o1">${x.o.map((o,i)=>`<button data-a="${i}">${o}</button>`).join('')}</div>
 <div id="stage2" hidden><p style="margin:14px 0 0"><strong>2. ${x.d}</strong></p><div class="opts" id="o2">${x.do.map((o,i)=>`<button data-b="${i}">${o}</button>`).join('')}</div></div>
 <div id="iexp" class="result" hidden></div></div>`;
};

export function alClic(t,ir){
  if(t.dataset.i!==undefined){incIdx=+t.dataset.i;ir('incidentes');return true}
  if(t.dataset.a!==undefined){const x=incidents[incIdx],i=+t.dataset.a;
    if(!intentoA){intentoA=true;ejercicio(`incidentes/${incIdx}/a`,i===x.a)}
    document.querySelectorAll('#o1 button').forEach(b=>b.className=+b.dataset.a===x.a?'right':(b===t?'wrong':''));
    if(i===x.a)$('#stage2').hidden=false;return true}
  if(t.dataset.b!==undefined){const x=incidents[incIdx],i=+t.dataset.b;
    if(!intentoB){intentoB=true;ejercicio(`incidentes/${incIdx}/b`,i===x.da)}
    document.querySelectorAll('#o2 button').forEach(b=>b.className=+b.dataset.b===x.da?'right':(b===t?'wrong':''));
    if(i===x.da){marcarCaso(incIdx);$('#iexp').hidden=false;$('#iexp').innerHTML=`<span class="allow">Correcto.</span> ${x.ex}${incIdx<incidents.length-1?` <button class="btn ghost" data-i="${incIdx+1}">Siguiente caso</button>`:''}`}return true}
}
