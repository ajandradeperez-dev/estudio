import {$} from '../../../utilidades.js';
import {quiz} from '../datos/preguntas.js';
import {registrarExamen,ejercicio} from '../progreso.js';

let qi=0,score=0,answered=false;
export const vista=()=> qi>=quiz.length?`<h1>Examen rápido</h1><div class="card"><h3>Resultado: ${score} de ${quiz.length}</h3><p>${score===quiz.length?'Excelente, dominas lo básico.':'Repasa las secciones de las preguntas que fallaste y vuelve a intentarlo.'}</p><button class="btn" id="qreset">Repetir</button></div>`:
`<h1>Examen rápido</h1><p class="progress">Pregunta ${qi+1} de ${quiz.length} · aciertos ${score}</p>
<div class="card"><h3>${quiz[qi][0]}</h3><div class="opts" id="qo">${quiz[qi][1].map((o,i)=>`<button data-q="${i}">${o}</button>`).join('')}</div>
<div id="qfb" class="result" hidden></div>
<div class="row" style="margin-top:12px"><button class="btn" id="qnext" hidden>Siguiente</button></div></div>`;

export function alClic(t,ir){
  if(t.dataset.q!==undefined&&!answered){answered=true;const i=+t.dataset.q,bien=i===quiz[qi][2];if(bien)score++;ejercicio(`examen/${qi}`,bien);
    document.querySelectorAll('#qo button').forEach(b=>b.className=+b.dataset.q===quiz[qi][2]?'right':(b===t?'wrong':''));
    // Cada error muestra la regla correcta
    if(!bien){$('#qfb').innerHTML=`<span class="deny">No es correcto.</span> <b>Regla:</b> ${quiz[qi][3]}`;$('#qfb').hidden=false}
    $('#qnext').hidden=false;$('#qnext').focus();return true}
  if(t.id==='qnext'){qi++;answered=false;if(qi>=quiz.length)registrarExamen(score,quiz.length);ir('quiz');return true}
  if(t.id==='qreset'){qi=0;score=0;answered=false;ir('quiz');return true}
}
