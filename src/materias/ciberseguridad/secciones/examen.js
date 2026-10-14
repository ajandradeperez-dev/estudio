/* Examen rápido de Ciberseguridad: preguntas para escribir con el motor de sesiones (variantes aceptadas, por qué y regla al fallar) */
import {quiz} from '../datos/preguntas.js';
import {registrarExamen,ejercicio} from '../progreso.js';
import {deBanco} from '../../../nucleo/ejercicios.js';
import {crearSesion} from '../../../nucleo/sesion.js';
import {boton,intro} from '../../../nucleo/ui.js';
import {htmlCierre} from '../../../nucleo/cierre.js';

let fase='inicio',ses=null;
function empezar(){
  const reglas=[];
  ses=crearSesion({
    titulo:'Examen rápido',tono:'ciber',salir:'ciberseguridad/quiz',sinPistas:true,
    total:()=>quiz.length,
    siguiente:st=>st.i<quiz.length?{...deBanco(quiz[st.i]),n:st.i}:null,
    responder(p,r){if(!r.correcto)reglas.push(p.regla);ejercicio(`examen/${p.n}`,r.correcto);return {}},
    fin(st){
      registrarExamen(st.ok,quiz.length);
      return `<span class="fin-icono" aria-hidden="true">${st.ok===quiz.length?'🏅':'🛡️'}</span><h1>${st.ok} de ${quiz.length}</h1>
<p class="nota">${st.ok===quiz.length?'Excelente, dominas lo básico.':'Las que fallaste ya están en Repasar.'}</p>
<button class="btn ancho" id="qreset">Repetir</button>${htmlCierre({xp:st.xp,aprendido:reglas,excluir:'ciberseguridad/quiz'})}`;
    }
  });
  ses.alEntrar();fase='sesion';
}
export const inmersiva=()=>fase==='sesion';
export const alEntrar=()=>{fase='inicio';ses=null};
export const alSalir=()=>ses?.alSalir?.();
export const vista=()=>fase==='sesion'?ses.vista():`<h1>📝 Examen rápido</h1>${intro(`${quiz.length} preguntas para escribir sobre firewalls, VPN y seguridad.`,['Escribe la respuesta (hay varias formas aceptadas).','Si fallas, verás por qué y la regla.','Las que falles vuelven en Repasar.'])}
${boton({texto:'Empezar',id:'qempezar',clase:'ancho area'})}`;
export const alMostrar=()=>{if(fase==='sesion')ses.alMostrar()};
export async function alClic(t,ir,repintar){
  if(t.id==='qempezar'||t.id==='qreset'){empezar();repintar();return true}
  if(fase==='sesion')return ses.alClic(t,ir,repintar);
}
