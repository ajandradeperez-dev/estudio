/* 🗳️ Propuestas: qué curso, tema o libro sigue en la app (votos compartidos). */
import {cabecera,vacio} from '../ui.js';

export function vistaPropuestas(){
  return {titulo:'Propuestas',vista:()=>`<div class="area-votos">${cabecera({icono:'🗳️',titulo:'Propuestas',desc:'Vota qué curso, tema o libro sigue en la app.'})}
${vacio({icono:'🛠️',titulo:'La votación abre pronto',texto:'Aquí podrás votar y proponer cursos, temas y libros.'})}</div>`};
}
