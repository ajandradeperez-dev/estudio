import {esc} from '../utilidades.js';
import {fortiTopics} from '../datos/fortigate.js';

let fTopic='pol';
export const vista=()=>`
<h1>FortiGate a fondo</h1>
<p class="lead">El firewall más usado en Latinoamérica. Recorre cada tema y mira cómo se ve en la CLI de FortiOS.</p>
<div class="tabs" id="ftabs">${Object.entries(fortiTopics).map(([k,v])=>`<button data-f="${k}" aria-pressed="${k===fTopic}">${v[0]}</button>`).join('')}</div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
 <div class="card"><h3>${fortiTopics[fTopic][0]}</h3><p style="white-space:pre-line;margin:0">${fortiTopics[fTopic][1]}</p></div>
 <pre>${esc(fortiTopics[fTopic][2])}</pre>
</div>`;

export function alClic(t,ir){
  if(t.dataset.f){fTopic=t.dataset.f;ir('forti');return true}
}
