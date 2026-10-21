/* Pistas en escalera (sin DOM; también las usan npm run revisar y npm run principiante).
   Cada toque a «💡 Pista» revela el siguiente nivel, siempre con los datos de ESE ejercicio:
     1 Idea: qué se busca y el plan (los nombres de sus pasos), en lenguaje sencillo.
     2 Primer paso concreto: el paso 1 con sus números y lo que resulta.
     3 Solución completa: todos los pasos {que, como, porque, ojo}; luego «Ahora tú» con un ejercicio gemelo.
   Un generador puede dar su propia escalera con `escalera:[idea, primerPaso]` (texto con sus números); si no, se arma
   con sus `pasos`, que ya llevan los números del ejercicio. */

const pasosDe=p=>(p.pasos||[]).map(x=>typeof x==='string'?{como:x}:x).filter(x=>x&&(x.que||x.como));
const sinHtml=t=>String(t??'').replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/g,' ');
// Texto plano de un enunciado o paso: sin HTML ni comandos de KaTeX (\frac{1}{2} → 1 2)
export const plano=t=>sinHtml(t).replace(/\\[a-zA-Z]+/g,' ').replace(/[{}\\$]/g,' ').replace(/\s+/g,' ').trim();
// Números que aparecen en un texto (sin signo; 0,5 = 0.5)
// (también cada parte entera suelta: 192.168.1.10 → 192, 168, 1, 10)
export const numerosDe=t=>{const x=plano(t).replace(/−/g,'-'),out=new Set();
  for(const n of x.match(/\d+(?:[.,]\d+)?/g)||[])out.add(String(+n.replace(',','.')));
  for(const n of x.match(/\d+/g)||[])out.add(String(+n));
  return out};
// Palabras de instrucciones que no son datos del ejercicio
const VACIAS=new Set('que qué para como cual cuál cuales este esta estos estas una uno unos unas los las del con por sus son hay sin más mas sobre entre desde donde cuando porque tiene tienen debe hace escribe escribelo completa responde elige resuelve calcula indica usando usar significa dice frase espanol español ingles inglés palabra the and'.split(' ').map(w=>w.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
const palabras=t=>new Set(plano(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!VACIAS.has(w)));

const datosEnunciado=p=>`${p.enunciado||''} ${p.hoja?JSON.stringify(p.hoja.celdas||p.hoja):''} ${p.codigo||''}`;
// ¿Este texto usa los datos del ejercicio? Algún número del enunciado (o, si no tiene números, alguna palabra suya)
function usaDatos(texto,p){
  const enun=datosEnunciado(p),nums=numerosDe(enun);
  if(nums.size){const en=numerosDe(texto);for(const n of nums)if(en.has(n))return true;return false}
  const w=palabras(enun),en=palabras(texto);for(const x of w)if(en.has(x))return true;
  // o alguna fórmula del enunciado aparece tal cual (p. ej. «Partimos de: \(h(x) = x\sqrt{x}\)»)
  if((enun.match(/\\[[\s\S]+?\\]|\\([\s\S]+?\\)/g)||[]).some(f=>texto.includes(f)))return true;
  // o algún fragmento resaltado del enunciado (la frase o palabra que se pregunta) aparece tal cual
  const t=plano(texto).toLowerCase();
  return (enun.match(/<(b|code|span lang="en")[^>]*>[\s\S]*?<\/\1>|«[^»]{1,80}»/g)||[]).some(f=>{const x=plano(f).replace(/[«»]/g,'').toLowerCase().trim();return x.length>=2&&t.includes(x)});
}
// Los datos de partida de un ejercicio, para ponerlos junto al primer paso: sus fórmulas (\( … \) o \[ … \]), o lo que
// va antes de la pregunta si tiene números, o lo que está resaltado (<b>, <code>, «…»)
export function datosDePartida(p){
  const e=String(p.enunciado||''),formulas=e.match(/\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g);
  if(formulas)return formulas.slice(0,3).join(' ');
  const antes=e.split(/¿/)[0].replace(/<pre[\s\S]*?<\/pre>/g,'').trim();
  if(/\d/.test(sinHtml(antes))&&sinHtml(antes).length<=220)return antes;
  const frase=sinHtml(e).split(/(?<=[.?!])\s+/).find(x=>/\d/.test(x)&&x.length<=220);
  if(frase)return frase.replace(/^¿?[^¿]*¿/,'');
  const marcado=e.match(/<(b|code|span lang="en")[^>]*>[\s\S]*?<\/\1>|«[^»]{1,80}»/g);
  return marcado?marcado.slice(0,3).join(' · '):'';
}

const norm=t=>plano(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
// ¿El paso solo repite el enunciado? (p. ej. «Recuerda el dato: <la misma pregunta>»): no ayuda a quien no sabe
const repite=(paso,p)=>{const c=norm(paso.como),e=norm(p.enunciado);return c.length>=6&&(e.includes(c)||c.includes(e))};
// Señal de la respuesta sin regalarla: cuántas palabras tiene y cómo empieza cada una (o cuántas cifras, si es un número)
export function senal(resp){
  const a=plano(resp).replace(/\s+/g,' ').trim();if(!a)return '';
  if(/^-?\d+(?:[.,]\d+)?$/.test(a))return `es un número de ${a.replace(/\D/g,'').length} cifras que empieza con ${a.replace(/^-/,'')[0]}`;
  const w=a.split(' ');
  if(w.length===1&&/^[A-Z0-9]{2,6}$/.test(a))return `tiene ${a.length} letras y empieza con ${a[0]}…`;
  if(w.length===1&&a.length<=3)return '';
  return `tiene ${w.length===1?'una palabra':`${w.length} palabras`}: ${w.map(x=>x.length<=2?'_'.repeat(x.length):`${x.slice(0,Math.max(1,Math.ceil(x.length/3)))}…`).join(' ')}`;
}
// La parte de la regla que tiene que ver con la pregunta (sin la que ya dice la respuesta)
function parteDeRegla(p){
  const partes=String(p.regla||'').split(/(?<=[.;])\s+/).filter(Boolean),resp=norm(p.respuesta);
  const preg=new Set(norm(p.enunciado).split(' ').filter(w=>w.length>=4));
  const ok=partes.filter(x=>!resp||!norm(x).includes(resp));
  let mejor=ok[0]||'',pun=-1;for(const x of ok){const n=norm(x).split(' ').filter(w=>preg.has(w)).length;if(n>pun){pun=n;mejor=x}}
  return mejor;
}
// Lectura: la oración del texto que más se parece a lo que se pregunta
const VACIAS_EN=new Set('the and was were is are you your this that with for from have has had they them their there what when where which who will would can could not but its it\'s the writer text'.split(' '));
function oracionClave(p){
  const m=String(p.enunciado||'').match(/<p[^>]*class="lectura"[^>]*>([\s\S]*?)<\/p>([\s\S]*)/);if(!m)return null;
  const preg=new Set(norm(m[2]).split(' ').filter(w=>w.length>=3&&!VACIAS_EN.has(w)));
  const ors=plano(m[1]).split(/(?<=[.!?])\s+/).filter(Boolean);
  let mejor=null,pun=0;for(const o of ors){const n=norm(o).split(' ').filter(w=>preg.has(w)).length;if(n>pun){pun=n;mejor=o}}
  return pun?mejor:null;
}

// Los 3 niveles de pista de una pregunta: {idea, primeros, partimos, primero, pasos, tipo} (null si no se puede armar).
//  primeros: los pasos que muestra el nivel 2 (de uno en uno, con «Siguiente paso»); partimos: «Partimos de: …» (o null);
//  primero: todo el nivel 2 en texto (para las comprobaciones).
//  - El nivel 2 es el primer paso; si ese paso todavía no usa los datos (p. ej. «Fórmula: …»), agrega los siguientes hasta
//    el primero que los sustituye, sin llegar nunca al último (que da la respuesta). Si aun así no los usa: «Partimos de: …».
//    Un generador puede decir cuántos pasos son con `pista2` (Gauss: la primera eliminación completa).
//  - Lectura: la oración del texto donde está la respuesta.
//  - Recordar un dato (el paso solo repite la pregunta): la regla y una señal de la respuesta (palabras e iniciales).
export function escalera(p){
  const pasos=pasosDe(p);
  if(!pasos.length&&!p.escalera)return null;
  const [ideaPropia,primeroPropio]=p.escalera||[];
  const plan=pasos.length>1?` El plan: ${pasos.map((x,i)=>`${i+1}) ${x.que||'paso '+(i+1)}`).join(' → ')}.`:'';
  const idea=ideaPropia||`${p.idea||p.pista||'Piensa qué te piden y qué datos tienes.'}${plan}`;
  const listo=(primeros,tipo,partimos=null)=>({idea,primeros,partimos,pasos,tipo,primero:primeros.length?`${partimos?`Partimos de: ${partimos} `:''}${primeros.map(x=>`${x.que||''} ${x.como||''}`).join(' ')}`:null});
  if(primeroPropio)return listo([{que:'',como:primeroPropio}],'propia');
  if(!pasos.length)return listo([],'propia');
  if(p.pista2>0)return listo(pasos.slice(0,Math.min(p.pista2,pasos.length-1)),'paso');
  const clave=oracionClave(p);
  if(clave)return listo([{que:'Busca en el texto',como:`La respuesta está en esta parte: <span lang="en">«${clave}»</span>`,porque:pasos[0].porque}],'lectura');
  const sinDatos=!usaDatos(`${pasos[0].que||''} ${pasos[0].como||''}`,p)||repite(pasos[0],p);
  const cue=(p.tipo||'escribir')==='escribir'&&!p.forma?senal(p.respuesta):'';
  if(sinDatos&&(repite(pasos[0],p)||!numerosDe(p.enunciado).size)&&(cue||p.regla))
    return listo([{que:'Acércate a la respuesta',como:`${parteDeRegla(p)||pasos[0].porque||''}${cue?`<br>La respuesta ${cue}.`:''}`}],'recuerdo');
  let k=0;while(k<pasos.length-2&&!usaDatos(`${pasos[k].que||''} ${pasos[k].como||''}`,p))k++;
  const primeros=pasos.slice(0,k+1),texto=primeros.map(x=>`${x.que||''} ${x.como||''}`).join(' ');
  if(!usaDatos(texto,p)){const d=datosDePartida(p);if(d)return listo(primeros,'partimos',d)}
  return listo(primeros,'paso');
}

// ¿El nivel 2 usa los datos de ESE ejercicio? (lo exigen npm run revisar y npm run principiante). La oración del texto y la
// señal de la respuesta salen de ese ejercicio por construcción.
export function pistaConDatos(p){const e=escalera(p);return !!e?.primero&&(['lectura','recuerdo'].includes(e.tipo)&&/[A-Za-z0-9]/.test(e.primero)||usaDatos(e.primero,p))}
// Calidad (informativa): ¿el propio paso opera sobre los datos, sin «Partimos de»? Si no, conviene escribir su escalera
export function pasoConDatos(p){const e=escalera(p);return !!e?.primero&&e.tipo!=='partimos'}
