/* Variantes de actividad a partir de una pregunta (generada o de banco), para que las sesiones roten tipos:
   ejemplo resuelto → hueco (completar el último paso) → escribir / verdadero-falso con justificación / encontrar el error,
   opción múltiple solo para introducir, y "¿por qué?" (autoexplicación). Cada función devuelve null si la pregunta
   no tiene lo necesario (pasos, errores típicos con valor, paso erróneo). Sin DOM. */

// Ejemplo resuelto: se lee entero (enunciado, pasos y respuesta). Necesita pasos.
export const comoEjemplo=p=>p.pasos?.length?{...p,tipo:'ejemplo'}:null;

// Ejemplo con hueco: se ven todos los pasos menos el último y se escribe la respuesta. Necesita 2+ pasos.
export const comoHueco=p=>(p.tipo||'escribir')==='escribir'&&p.pasos?.length>=2&&!p.forma?{...p,tipo:'escribir',pasosPrevios:p.pasos.slice(0,-1),hueco:'¿Cuál es el resultado?'}:null;

// Opción múltiple para introducir: la correcta y los valores de los errores típicos. Necesita 2+ errores con valor.
export function comoOpcion(p,rng){
  const malos=[...new Set((p.errores||[]).filter(e=>e.valor!==undefined&&String(e.valor)!==String(p.respuesta)).map(e=>String(e.valor)))].slice(0,3);
  if((p.tipo||'escribir')!=='escribir'||malos.length<2)return null;
  const ops=rng.barajar([String(p.respuesta),...malos]),correcta=ops.indexOf(String(p.respuesta));
  const porque=Object.fromEntries(ops.map((o,i)=>[i,(p.errores.find(e=>String(e.valor)===o)||{}).por]).filter(([,v])=>v));
  return {...p,tipo:'opcion',opciones:ops,correcta,porque,etiqueta:'Elige la respuesta',intro:true};
}

// Verdadero o falso + por qué: se muestra la respuesta correcta o un error típico. Necesita 1+ error con valor y explicación.
export function comoVF(p,rng){
  const errs=(p.errores||[]).filter(e=>e.valor!==undefined&&e.por&&String(e.valor)!==String(p.respuesta));
  if((p.tipo||'escribir')!=='escribir'||!errs.length||!p.regla)return null;
  const verdad=rng.prob(0.5),err=rng.elegir(errs);
  const mostrado=verdad?p.respuesta:err.valor;
  // razones: la regla (si es verdad) o la explicación del error (si es falso), más una que no aplica
  const buena=verdad?p.regla:err.por,otra=verdad?err.por:p.regla;
  const razones=rng.barajar([buena,otra]);
  return {...p,tipo:'vf',afirmacion:`La respuesta es: ${mostrado}`,valor:verdad,razones,razonCorrecta:razones.indexOf(buena),
    respuesta:p.respuesta,explicacion:verdad?'':err.por};
}

// Encontrar el error en una solución paso a paso. Necesita pasoMal {i, texto, por}.
export function comoError(p){
  const m=p.pasoMal;
  if(!m||!p.pasos?.[m.i])return null;
  const orig=typeof p.pasos[m.i]==='string'?{como:p.pasos[m.i]}:p.pasos[m.i];
  const pasos=p.pasos.map(x=>typeof x==='string'?{como:x}:x);pasos[m.i]={...orig,como:m.texto};
  return {...p,tipo:'error',pasos,mal:m.i,porqueMal:`Paso ${m.i+1}: ${m.por} Lo correcto: ${orig.como}`,enunciado:`${p.enunciado}<br><span class="nota">Esta solución tiene un paso equivocado. ¿Cuál?</span>`};
}

// Autoexplicación: tras un acierto, ¿por qué es así? La regla de esta habilidad entre otras dos (no cuenta para el dominio)
export function comoPorque(p,otrasReglas,rng){
  const otras=rng.barajar([...new Set(otrasReglas.filter(r=>r&&r!==p.regla))]).slice(0,2);
  if(!p.regla||otras.length<1)return null;
  const ops=rng.barajar([p.regla,...otras]);
  return {tipo:'porque',enunciado:`Acertaste: ${p.enunciado.replace(/<br>.*$/s,'')} → ${p.respuesta}<br>¿Qué regla lo explica?`,opciones:ops,correcta:ops.indexOf(p.regla),
    regla:p.regla,porque:Object.fromEntries(ops.map((o,i)=>[i,o===p.regla?'':'Esa regla es de otra habilidad.']).filter(([,v])=>v)),noCuenta:true};
}

// Responder diciendo la frase completa en voz alta (Inglés), o escribiéndola si no hay reconocimiento de voz
export const comoHablar=p=>p.frase&&p.lang==='en'&&(p.tipo||'escribir')==='escribir'
  ?{...p,tipo:'hablar',frase:undefined,enunciado:`${p.enunciado}<br><span class="nota">Responde diciendo la frase completa en voz alta.</span>`,
    acepta:['='+p.frase.toLowerCase().replace(/[.,!?¿¡]/g,'').trim()],modelo:p.frase,etiqueta:'Di en voz alta'}:null;

// Rotación de actividades en una sesión: la k-ésima pregunta independiente generada
export function variar(p,k,rng){
  const turno=k%5;
  return (turno===2&&comoVF(p,rng))||(turno===3&&comoHablar(p))||(turno===4&&comoError(p))||p;
}
