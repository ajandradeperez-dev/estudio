/* Ejercicios escritos a mano (lecciones, examen, diálogos) en formato común, y su adaptación a preguntas del motor de sesiones.
   {tipo:'opcion',    pregunta, opciones:[…], correcta, porque:{índice:'por qué está mal'}, regla, codigo?}
   {tipo:'completar', pregunta, respuestas:[aceptadas…], errores?:{'respuesta típica':'por qué está mal'}, regla, pista?, codigo?, oir?}
                      oir: texto en inglés que se puede escuchar (comprensión auditiva)
   {tipo:'hablar',    frase, es?, regla, sonidos?, materia?}                      decir una frase en voz alta (pronunciación ≥ 80)
   {tipo:'hablar',    pregunta, oir?, acepta, errores?, modelo, pista?, regla}    responder hablando (diálogos)
   Producción = completar o hablar. La opción múltiple solo se usa para introducir.
   hablar usa el micrófono; si el navegador no reconoce voz, se responde escribiendo. */
import {esc} from '../utilidades.js';
import {evaluar,evaluarRespuesta} from './pronunciacion.js';
import {coincide} from './comparar.js';
export const META_PRONUNCIACION=80;
export {coincide};

// Evalúa lo dicho (o escrito) en un ejercicio de hablar
export function evaluarHablar(ej,alternativas,r={}){
  if(ej.frase){
    const ev=evaluar(ej.frase,alternativas,{sonidos:ej.sonidos||[]});
    return Object.assign(r,{correcto:ev.puntaje>=META_PRONUNCIACION,respuesta:ev.transcripcion,eval:ev});
  }
  const er=evaluarRespuesta(alternativas,ej);
  return Object.assign(r,{correcto:er.ok,respuesta:er.dicho,errorTipico:er.error});
}

// Ejercicio escrito a mano → pregunta del motor (nucleo/sesion.js)
export function deBanco(ej,extra={}){
  const base={regla:ej.regla||ej.explicacion||'',pista:ej.pista,codigo:ej.codigo,oir:ej.oir,...extra};
  if(ej.tipo==='opcion')return {...base,tipo:'opcion',enunciado:ej.pregunta,opciones:ej.opciones,correcta:ej.correcta,porque:ej.porque,respuesta:ej.opciones[ej.correcta]};
  if(ej.tipo==='hablar')return {...ej,...base,tipo:'hablar',enunciado:ej.pregunta,respuesta:ej.modelo||ej.frase};
  // completar: cualquiera de las respuestas aceptadas; los errores típicos explican por qué
  return {...base,tipo:'escribir',enunciado:ej.pregunta,respuesta:esc(ej.respuestas[0]),
    verificar:e=>coincide(e,ej.respuestas),
    errores:Object.entries(ej.errores||{}).map(([valor,por])=>({valor,por,si:e=>coincide(e,[valor])}))};
}
