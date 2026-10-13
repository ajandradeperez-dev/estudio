import {quiz} from '../datos/preguntas.js';
import {registrarExamen,ejercicio} from '../progreso.js';
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from '../../../nucleo/ejercicios.js';

// Preguntas para escribir la respuesta, con el componente común de ejercicios (variantes aceptadas, por qué y regla al fallar)
let qi=0,score=0;
export const vista=()=> qi>=quiz.length?`<h1>Examen rápido</h1><div class="card"><h3>Resultado: ${score} de ${quiz.length}</h3><p>${score===quiz.length?'Excelente, dominas lo básico.':'Las que fallaste ya están en Repasar hoy. Repasa esas secciones y vuelve a intentarlo.'}</p><button class="btn" id="qreset">Repetir</button></div>`:
`<h1>Examen rápido</h1><p class="progress">Pregunta ${qi+1} de ${quiz.length} · aciertos ${score}</p>
<div class="card">${htmlEjercicio(quiz[qi],{pista:false})}</div>`;

export function alClic(t,ir){
  if(t.id==='qnext'){qi++;if(qi>=quiz.length)registrarExamen(score,quiz.length);ir('quiz');return true}
  if(t.id==='qreset'){qi=0;score=0;ir('quiz');return true}
  if(qi>=quiz.length)return;
  const r=manejarEjercicio(t,quiz[qi]); if(!r)return;
  if(r.correcto)score++;
  ejercicio(`examen/${qi}`,r.correcto);
  mostrarResultado(quiz[qi],r,`<div class="fb-pie"><span></span><button class="btn" id="qnext">${qi+1<quiz.length?'Siguiente':'Ver resultado'}</button></div>`);
  return true;
}
