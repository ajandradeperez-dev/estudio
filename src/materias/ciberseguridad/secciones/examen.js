import {quiz} from '../datos/preguntas.js';
import {registrarExamen,ejercicio} from '../progreso.js';
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from '../../../nucleo/ejercicios.js';
import {htmlCierre,xpHoy} from '../../../nucleo/cierre.js';

// Preguntas para escribir la respuesta, con el componente común de ejercicios (variantes aceptadas, por qué y regla al fallar)
let qi=0,score=0;
let xp0=xpHoy(),reglas=[];
export const vista=()=> qi>=quiz.length?`<h1>Examen rápido</h1><div class="card"><h3>Resultado: ${score} de ${quiz.length}</h3><p>${score===quiz.length?'Excelente, dominas lo básico.':'Las que fallaste ya están en Repasar hoy. Repasa esas secciones y vuelve a intentarlo.'}</p>
${htmlCierre({xp:xpHoy()-xp0,aprendido:reglas,excluir:'ciberseguridad/quiz'})}<div class="row" style="margin-top:12px"><button class="btn ghost" id="qreset">Repetir</button></div></div>`:
`<h1>Examen rápido</h1><p class="progress">Pregunta ${qi+1} de ${quiz.length} · aciertos ${score}</p>
<div class="card">${htmlEjercicio(quiz[qi],{pista:false})}</div>`;

export async function alClic(t,ir){
  if(t.id==='qnext'){qi++;if(qi>=quiz.length)registrarExamen(score,quiz.length);ir('quiz');return true}
  if(t.id==='qreset'){qi=0;score=0;xp0=xpHoy();reglas=[];ir('quiz');return true}
  if(qi>=quiz.length)return;
  const r=await manejarEjercicio(t,quiz[qi]); if(!r)return;
  if(r.correcto)score++;else reglas.push(quiz[qi].regla);
  ejercicio(`examen/${qi}`,r.correcto);
  mostrarResultado(quiz[qi],r,`<div class="fb-pie"><span></span><button class="btn" id="qnext">${qi+1<quiz.length?'Siguiente':'Ver resultado'}</button></div>`);
  return true;
}
