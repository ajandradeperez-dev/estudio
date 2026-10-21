/* Diagnóstico de pasos (ruta oculta #diag-pasos/<generador>, p. ej. #diag-pasos/al/gauss): pinta los pasos de 10
   ejercicios (2 por nivel, semillas fijas) tal como se ven en la app, todos abiertos. npm run calidad la recorre a 360 px
   con cada generador y falla si una fórmula se parte en dos renglones o se sale de la pantalla. No aparece en ningún menú. */
import {crear,GENERADORES} from './generadores/index.js';
import {htmlPaso} from './procedimiento.js';
import {conFormulas} from './formula.js';
import {esc} from '../utilidades.js';

export function vistaDiagPasos(id){
  return {titulo:'Diagnóstico de pasos',vista(){
    if(!GENERADORES[id])return `<h1>Diagnóstico de pasos</h1><p>No existe el generador «${esc(id)}».</p>`;
    const bloques=[];
    for(let n=1;n<=5;n++)for(const s of [11,23]){const p=crear(id,n,{semilla:s*97+n});
      bloques.push(`<section class="card diag-ej" data-nivel="${n}"><div class="pregunta">${conFormulas(p.enunciado||'')}</div><ol class="pasos-proc">${(p.pasos||[]).map((x,i)=>htmlPaso(x,i,{acciones:false})).join('')}</ol></section>`)}
    return `<h1 id="diag-listo">${esc(id)}</h1>${bloques.join('')}`;
  }};
}
