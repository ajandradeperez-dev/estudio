// Revisa que las lecciones cumplan el método de aprendizaje (ver CLAUDE.md). Uso: npm run revisar
// Sale con código 1 si alguna regla no se cumple.
import {readdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {MIN_PRODUCCION,MAX_PALABRAS,UBICACION_MIN,UBICACION_MAX,esProduccion,repartoUbicacion,preguntasUbicacion,palabras} from '../src/nucleo/metodo.js';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','src','materias');
const errores=[],avisos=[];
const mal=(donde,msg)=>errores.push(`${donde}: ${msg}`);

for(const materia of readdirSync(raiz).sort()){
  const dir=join(raiz,materia,'lecciones');
  if(!existsSync(dir))continue;
  const archivos=readdirSync(dir).filter(f=>f.endsWith('.js')).sort();
  const lecciones=[];
  for(const f of archivos){
    const donde=`${materia}/${f}`,l=(await import(pathToFileURL(join(dir,f)).href)).default;
    lecciones.push(l);
    if(!/^\d+-[a-z0-9-]+\.js$/.test(f))mal(donde,'el nombre debe ser NN-id.js (minúsculas y guiones)');
    for(const k of ['titulo','resumen'])if(!l[k])mal(donde,`falta ${k}`);
    const p=palabras((l.explicacion||[]).join(' '));
    if(p>MAX_PALABRAS)mal(donde,`la explicación tiene ${p} palabras (máximo ${MAX_PALABRAS})`);
    if(!l.ejemplos?.length)mal(donde,'faltan ejemplos');
    if(!Array.isArray(l.rondas)||l.rondas.length<2){mal(donde,'necesita al menos 2 rondas de ejercicios distintas (para repetir si no se domina)');continue}
    const vistas=new Set();
    l.rondas.forEach((ronda,r)=>{
      const d=`${donde} ronda ${r+1}`;
      if(ronda.length<5)mal(d,`tiene ${ronda.length} ejercicios (mínimo 5)`);
      const prod=ronda.filter(esProduccion).length;
      if(prod/ronda.length<MIN_PRODUCCION)mal(d,`producción ${prod}/${ronda.length} (mínimo ${MIN_PRODUCCION*100}%)`);
      ronda.forEach((ej,i)=>{
        const e=`${d} ej. ${i+1}`,texto=ej.pregunta||ej.frente;
        if(vistas.has(texto))mal(e,'pregunta repetida en la lección: las rondas deben tener ejercicios distintos');
        vistas.add(texto);
        if(ej.tipo==='opcion'){
          if(i!==0)mal(e,'la opción múltiple solo se usa para introducir: debe ser el primer ejercicio de la ronda');
          if(!(ej.correcta>=0&&ej.correcta<ej.opciones?.length))mal(e,'correcta fuera de rango');
          ej.opciones?.forEach((_,k)=>{if(k!==ej.correcta&&!ej.porque?.[k])mal(e,`falta el porqué de la opción incorrecta ${k}`)});
        }else if(ej.tipo==='completar'){
          if(!ej.respuestas?.length||ej.respuestas.some(x=>typeof x!=='string'||!x.trim()))mal(e,'respuestas vacías');
          if(!ej.errores||!Object.keys(ej.errores).length)avisos.push(`${e}: sin errores típicos (se mostrará una explicación genérica)`);
        }else if(ej.tipo!=='tarjeta')mal(e,`tipo desconocido: ${ej.tipo}`);
        if(ej.tipo!=='tarjeta'&&!ej.regla)mal(e,'falta la regla que se muestra al fallar');
      });
    });
  }
  // Examen de ubicación: entre 10 y 15 preguntas y suficientes ejercicios de producción en la última ronda
  if(lecciones.length){
    const k=repartoUbicacion(lecciones.length),total=k.reduce((a,b)=>a+b,0);
    if(total<UBICACION_MIN||total>UBICACION_MAX)mal(materia,`el examen de ubicación tendría ${total} preguntas`);
    lecciones.forEach((l,j)=>{const n=preguntasUbicacion(l,k[j]).length;if(n<k[j])mal(`${materia}/${archivos[j]}`,`la última ronda tiene ${n} ejercicios de producción y la ubicación necesita ${k[j]}`)});
    console.log(`${materia}: ${lecciones.length} lecciones · ubicación de ${total} preguntas`);
  }
}
avisos.forEach(a=>console.log('aviso  '+a));
errores.forEach(e=>console.log('ERROR  '+e));
console.log(errores.length?`\n${errores.length} errores`:'\nTodo cumple el método de aprendizaje.');
process.exit(errores.length?1:0);
