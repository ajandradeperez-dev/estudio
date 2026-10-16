/* Registro de generadores de ejercicios y bancos (sin DOM: también los usa npm run revisar).
   GENERADORES['<prefijo>/<habilidad>'] = {titulo, explicacion?, generar(nivel 1–5, rng) → pregunta}
   BANCOS['<id>'] = () → [preguntas con ref]   (ejercicios fijos que no se pueden generar, p. ej. casos narrativos)
   Cada pregunta lleva su profundidad ('basico' | 'procedimiento' | 'aplicacion' | 'escenario') y, si es básica, la clave con que se
   retira (basico: 'g:<id>:<plantilla>' o 'gi:<id>:<clave>'): ver profundidad.js.
   Pregunta generada: {enunciado, respuesta, verificar(entrada) → bool, pasos[], errores[{si(entrada), por, valor?}],
     regla, pista, tipo? ('escribir' por defecto | 'opcion' | 'ordenar' | 'emparejar' | 'hablar'), teclado?, forma?, pasoMal?, clave?}
   Ver "Escribir un generador" en CLAUDE.md. */
import {crearRng} from '../rng.js';
import matematicas from './matematicas.js';
import algebraBasica from './algebra-basica.js';
import algebraTemas from './algebra-temas.js';
import algebraTemas2 from './algebra-temas2.js';
import aplicaciones from './aplicaciones.js';
import algebraVariantes from './algebra-variantes.js';
import algebraLineal2 from './algebra-lineal2.js';
import algebraLinealVariantes from './algebra-lineal-variantes.js';
import aplicacionesLineal from './aplicaciones-lineal.js';
import calculoDif from './calculo-dif.js';
import calculoDifVariantes from './calculo-dif-variantes.js';
import calculoInt from './calculo-int.js';
import calculoIntVariantes from './calculo-int-variantes.js';
import excel from './excel.js';
import {extender} from './extender.js';
import extMatematicas from './extensiones/matematicas.js';
import matNuevos1 from './mat-nuevos1.js';
import matNuevos2 from './mat-nuevos2.js';
import matNuevos3 from './mat-nuevos3.js';
import inglesA1 from './ingles-a1.js';
import inglesA1b from './ingles-a1b.js';
import inglesA2 from './ingles-a2.js';
import inglesB1 from './ingles-b1.js';
import inglesB2 from './ingles-b2.js';
import ciberRedes from './ciber-redes.js';
import ciberFwVpn from './ciber-fw-vpn.js';
import ciberDefensa from './ciber-defensa.js';
import ciberMejoras,{extCiber} from './ciber-mejoras.js';
import {armarExamenes} from './examenes-en.js';
import inglesMejoras from './ingles-mejoras.js';
import excel2 from './excel2.js';
import trigonometria from './trigonometria.js';
import prealgebra from './prealgebra.js';
import algebraLineal from './algebra-lineal.js';
import calculo from './calculo.js';
import redes from './redes.js';
import redes2 from './redes2.js';
import seguridad from './seguridad.js';
import datos from './datos.js';
import ingles from './ingles.js';
import {bancos} from './bancos.js';
import {clasificar} from './profundidad.js';

export const GENERADORES={...matematicas,...algebraBasica,...algebraTemas,...algebraTemas2,...aplicaciones,...algebraVariantes,...algebraLineal2,...aplicacionesLineal,...algebraLineal,...calculo,...redes,...redes2,...seguridad,...datos,...ingles,...calculoDif,...calculoInt,...trigonometria,...prealgebra,...excel,...excel2,...matNuevos1,...matNuevos2,...matNuevos3,...inglesA1,...inglesA1b,...inglesA2,...inglesB1,...inglesB2,...ciberRedes,...ciberFwVpn,...ciberDefensa,...inglesMejoras,...ciberMejoras,...algebraLinealVariantes,...calculoDifVariantes,...calculoIntVariantes};
// Extensiones (tarjetas y problemas de aplicación con contexto) sobre los generadores ya registrados: ver extender.js
for(const ext of [extMatematicas,extCiber])for(const [id,e] of Object.entries(ext))if(GENERADORES[id])GENERADORES[id]=extender(GENERADORES[id],e);
// Prueba de nivel y simulacros de Inglés: mezclan generadores ya registrados
Object.assign(GENERADORES,armarExamenes(GENERADORES));
export const BANCOS=bancos;

// Una pregunta nueva del generador al nivel pedido; con vistos (Set de claves) no se repite en la sesión;
// evitar(p) → true para descartarla (p. ej. un básico ya retirado): se prueba otra, hasta 30 veces
export function crear(id,nivel=1,{semilla,vistos,evitar}={}){
  const g=GENERADORES[id];if(!g)return null;
  const n=Math.min(5,Math.max(1,Math.round(nivel)));
  let p,s;
  for(let k=0;k<30;k++){
    s=semilla!==undefined&&k===0?semilla:(Math.random()*2**32)>>>0;
    p=g.generar(n,crearRng(s));
    p.clave=p.clave||p.enunciado;
    Object.assign(p,clasificar(id,g,n,p));
    if(!vistos?.has(p.clave)&&!evitar?.(p))break;
  }
  vistos?.add(p.clave);
  // Un error típico cuyo valor resulta correcto en este ejercicio (p. ej. 180° − 90° = 90°) se descarta
  if((p.tipo||'escribir')==='escribir'&&!p.forma&&p.errores){const vistos=new Set();p.errores=p.errores.filter(e=>{if(e.valor===undefined)return true;if(vistos.has(e.valor))return false;vistos.add(e.valor);try{return !p.verificar(e.valor)}catch(x){return true}})}
  return {tipo:'escribir',alternativa:g.alternativa,...p,gen:id,nivel:n,semilla:s};
}
