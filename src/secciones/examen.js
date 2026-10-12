import {$} from '../utilidades.js';
import {quiz} from '../datos/preguntas.js';

let qi=0,score=0,answered=false;
export const vista=()=> qi>=quiz.length?`<h1>Examen rápido</h1><div class="card"><h3>Resultado: ${score} de ${quiz.length}</h3><p>${score===quiz.length?'Excelente, dominas lo básico.':'Repasa las secciones de las preguntas que fallaste y vuelve a intentarlo.'}</p><button class="btn" id="qreset">Repetir</button></div>`:
`<h1>Examen rápido</h1><p class="progress">Pregunta ${qi+1} de ${quiz.length} · aciertos ${score}</p>
<div class="card"><h3>${quiz[qi][0]}</h3><div class="opts" id="qo">${quiz[qi][1].map((o,i)=>`<button data-q="${i}">${o}</button>`).join('')}</div>
<div class="row" style="margin-top:12px"><button class="btn" id="qnext" hidden>Siguiente</button></div></div>`;

export function alClic(t,ir){
  if(t.dataset.q!==undefined&&!answered){answered=true;const i=+t.dataset.q;if(i===quiz[qi][2])score++;
    document.querySelectorAll('#qo button').forEach(b=>b.className=+b.dataset.q===quiz[qi][2]?'right':(b===t?'wrong':''));$('#qnext').hidden=false;return true}
  if(t.id==='qnext'){qi++;answered=false;ir('quiz');return true}
  if(t.id==='qreset'){qi=0;score=0;answered=false;ir('quiz');return true}
}
