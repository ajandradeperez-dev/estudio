/* Registro de generadores de ejercicios y bancos (sin DOM: también los usa npm run revisar).
   GENERADORES['<prefijo>/<habilidad>'] = {titulo, explicacion?, generar(nivel 1–5, rng) → pregunta}
   BANCOS['<id>'] = () → [preguntas con ref]   (ejercicios fijos que no se pueden generar, p. ej. casos narrativos)
   Pregunta generada: {enunciado, respuesta, verificar(entrada) → bool, pasos[], errores[{si(entrada), por, valor?}],
     regla, pista, tipo? ('escribir' por defecto | 'opcion' | 'ordenar' | 'emparejar' | 'hablar'), teclado?, forma?, pasoMal?, clave?}
   Ver "Escribir un generador" en CLAUDE.md. */
import {crearRng} from '../rng.js';
import matematicas from './matematicas.js';
import algebraBasica from './algebra-basica.js';
import algebraLineal from './algebra-lineal.js';
import calculo from './calculo.js';
import redes from './redes.js';
import seguridad from './seguridad.js';
import datos from './datos.js';
import ingles from './ingles.js';
import {bancos} from './bancos.js';

export const GENERADORES={...matematicas,...algebraBasica,...algebraLineal,...calculo,...redes,...seguridad,...datos,...ingles};
export const BANCOS=bancos;

// Una pregunta nueva del generador al nivel pedido; con vistos (Set de claves) no se repite en la sesión
export function crear(id,nivel=1,{semilla,vistos}={}){
  const g=GENERADORES[id];if(!g)return null;
  const n=Math.min(5,Math.max(1,Math.round(nivel)));
  let p,s;
  for(let k=0;k<30;k++){
    s=semilla!==undefined&&k===0?semilla:(Math.random()*2**32)>>>0;
    p=g.generar(n,crearRng(s));
    p.clave=p.clave||p.enunciado;
    if(!vistos?.has(p.clave))break;
  }
  vistos?.add(p.clave);
  // Un error típico cuyo valor resulta correcto en este ejercicio (p. ej. 180° − 90° = 90°) se descarta
  if((p.tipo||'escribir')==='escribir'&&!p.forma&&p.errores)p.errores=p.errores.filter(e=>{if(e.valor===undefined)return true;try{return !p.verificar(e.valor)}catch(x){return true}});
  return {tipo:'escribir',...p,gen:id,nivel:n,semilla:s};
}
