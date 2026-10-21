/* Curso de Python (💼 Cursos): piezas para armar ejercicios (sin DOM). Cada pregunta lleva `py` con el código que se
   ejecuta y lo que debe pasar ({codigo, salida} o {codigo, error}): npm run python lo corre en Pyodide y falla si Python
   no imprime exactamente eso. Así ningún «¿Qué imprime?» depende de que la cuenta en JavaScript sea igual a la de Python.
   Tipos:
     predice({codigo, salida, traza, errores})          «¿Qué imprime?» (se escribe la salida)
     completa({codigo con ___, respuestas, salida, …})  completar el hueco (se comprueba el texto y se ejecuta el código completo)
     encuentraError({codigo, linea, tipo, arreglo, …})  ¿en qué línea está el error? o ¿qué error da? (NameError, TypeError…)
     ordenar({lineas, salida, …})                       ordenar las líneas (con su sangría) para que el programa funcione
   traza: [[que, como, porque], …] con los valores de ESE ejercicio (el primer paso de la pista usa sus números). */
import {paso,final} from './pasos.js';
// La clave de un ejercicio (para no repetirlo) incluye su código: el enunciado suele ser el mismo («¿Qué imprime…?»)
const conClave=q=>({...q,clave:`${q.enunciado}
${q.codigo||''}
${(q.piezas||[]).join('|')}`});

export const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export const cod=s=>`<code>${escH(s)}</code>`;
const norm=s=>String(s??'').trim().replace(/\s+/g,' ');
// Misma salida: varias líneas se pueden escribir separadas por espacio o coma; 3,5 vale como 3.5
export function mismaSalida(e,salida){
  const a=norm(String(e??'').replace(/(\d),(\d)/g,'$1.$2')),l=String(salida).split('\n');
  const ops=new Set([l.join(' '),l.join(', '),l.join(',')].map(norm));
  return ops.has(a)||ops.has(a.replace(/^["']|["']$/g,''));
}
// Mismo código: sin espacios y con comillas dobles o simples
export const normCod=s=>String(s??'').trim().replace(/\s+/g,'').replace(/'/g,'"');
// Un valor como lo imprime Python (enteros y floats; los floats enteros llevan .0)
export const pyNum=(x,esFloat=false)=>esFloat&&Number.isInteger(x)?`${x}.0`:String(x);
export const pyLista=v=>`[${v.map(x=>typeof x==='string'?`'${x}'`:String(x)).join(', ')}]`;
export const pyBool=b=>b?'True':'False';

const errs=(lista,ok)=>lista.filter(([v])=>v!==undefined&&!ok(String(v))).map(([v,por,pasoI])=>({valor:String(v),si:e=>mismaSalida(e,String(v)),por,...(pasoI!==undefined?{paso:pasoI}:{})}));

export function predice({codigo,salida,traza,errores=[],enun,regla,pista,profundidad,entrada}){
  salida=String(salida);
  const varias=salida.includes('\n');
  return conClave({enunciado:`${enun||'¿Qué imprime este código?'}${varias?'<br><span class="nota">Imprime varias líneas: escríbelas en orden, separadas por un espacio.</span>':''}`,
    codigo,respuesta:salida.split('\n').join(' '),verificar:e=>mismaSalida(e,salida),
    pasos:[...traza.map(([q,c,p])=>paso(q,c,p)),final('Lo que aparece en pantalla',cod(salida).replace(/\n/g,'<br>'),'Cada print escribe en su propia línea.',salida.split('\n').join(' '))],
    errores:errs(errores,v=>mismaSalida(v,salida)),regla,pista,profundidad,tolera:false,teclado:'py',py:{codigo,salida,entrada}});
}

export function completa({codigo,respuestas,salida,traza,errores=[],enun,regla,pista,profundidad,entrada}){
  salida=String(salida);
  const ok=e=>respuestas.some(r=>normCod(e)===normCod(r));
  const completo=codigo.replace('___',respuestas[0]);
  return conClave({enunciado:enun||`Completa el hueco <code>___</code> para que el programa imprima ${cod(salida.split('\n').join(' / '))}.`,
    codigo,respuesta:respuestas[0],aceptadas:respuestas,verificar:ok,
    pasos:[...traza.map(([q,c,p])=>paso(q,c,p)),final('Completa el hueco',cod(completo).replace(/\n/g,'<br>'),'Con eso el programa hace lo que se pide.',respuestas[0])],
    errores:errores.filter(([v])=>!ok(v)).map(([v,por])=>({valor:String(v),si:e=>normCod(e)===normCod(v),por})),regla,pista,profundidad,tolera:false,teclado:'py',py:{codigo:completo,salida,entrada}});
}

// Línea con el error (pregunta 'linea') o el nombre del error que da Python (pregunta 'tipo')
export function encuentraError({codigo,linea,tipo,arreglo,salidaArreglo,pregunta='linea',traza,errores=[],regla,pista,profundidad,entrada}){
  const lineas=codigo.split('\n'),numerado=lineas.map((l,i)=>`${i+1} | ${l}`).join('\n');
  const resp=pregunta==='linea'?String(linea):tipo;
  const ok=e=>pregunta==='linea'?String(e).replace(/\D/g,'')===String(linea):norm(e).toLowerCase()===tipo.toLowerCase();
  return conClave({enunciado:pregunta==='linea'?'Este programa tiene un error. ¿En qué línea está? (escribe el número)':'¿Qué error da Python al ejecutar este código? (escribe su nombre, por ejemplo <code>NameError</code>)',
    codigo:pregunta==='linea'?numerado:codigo,respuesta:resp,verificar:ok,
    pasos:[...traza.map(([q,c,p])=>paso(q,c,p)),final('El error y cómo se arregla',`Línea ${linea}: ${tipo}. Arreglo: ${cod(arreglo)}`,'Leer el mensaje de error (tipo y línea) es la forma más rápida de encontrarlo.',resp)],
    errores:errores.filter(([v])=>!ok(String(v))).map(([v,por])=>({valor:String(v),si:e=>norm(e).toLowerCase()===String(v).toLowerCase(),por})),regla,pista,profundidad,tolera:false,teclado:'py',
    py:{codigo,error:tipo,arreglo:codigo.split('\n').map((l,i)=>i===linea-1?arreglo:l).join('\n'),salida:salidaArreglo,entrada}});
}

// Ordenar líneas: la sangría se ve con «⇥ » (una por nivel). Cada pieza debe ser única.
const verLinea=l=>{const m=/^( *)(.*)$/.exec(l);return `${'⇥ '.repeat(m[1].length/4)}${m[2]}`};
export function ordenar({lineas,salida,traza,regla,pista,profundidad,enun,entrada}){
  const piezas=lineas.map(verLinea),resp=piezas.join(' ');
  return conClave({tipo:'ordenar',enunciado:enun||`Ordena las líneas para que el programa imprima ${cod(String(salida).split('\n').join(' / '))}. <span class="nota">⇥ = sangría (4 espacios).</span>`,
    piezas,respuesta:resp,verificar:e=>norm(e)===norm(resp),
    pasos:[...traza.map(([q,c,p])=>paso(q,c,p)),final('El programa en orden',cod(lineas.join('\n')).replace(/\n/g,'<br>'),'Python ejecuta de arriba abajo; lo que va con sangría pertenece a la línea con «:» de arriba.',resp)],
    errores:[],regla,pista,profundidad,tolera:false,py:{codigo:lineas.join('\n'),salida:String(salida),entrada}});
}
