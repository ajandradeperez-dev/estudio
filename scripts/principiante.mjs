/* npm run principiante: un principiante simulado recorre cada habilidad publicada (con generador) y comprueba que
   - tiene mini-lección: explicación sencilla, un ejemplo resuelto y un ejemplo a medias (último paso en blanco);
   - el primer ejercicio de una habilidad nueva es de nivel 1;
   - hay 3 niveles de pista y el 2.º usa los números (o los datos) de ESE ejercicio;
   - «No sé cómo empezar» lleva a la solución completa (≥ 2 pasos) y a un gemelo (mismo tipo, otros datos).
   Reporta la cobertura por materia y falla si alguna habilidad publicada no cumple. Sin navegador: usa los generadores.
   --detalle muestra cada habilidad que falla con un ejemplo. */
import {readdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','src');
const {GENERADORES,crear,gemelo}=await import(pathToFileURL(join(raiz,'nucleo','generadores','index.js')).href);
const {escalera,pistaConDatos,pasoConDatos}=await import(pathToFileURL(join(raiz,'nucleo','pistas.js')).href);
const {comoHueco}=await import(pathToFileURL(join(raiz,'nucleo','actividades.js')).href);
const detalle=process.argv.includes('--detalle'),MUESTRAS=12;

const cobertura={};let fallos=0;
for(const materia of readdirSync(join(raiz,'materias'))){
  const fTemas=join(raiz,'materias',materia,'temas.js');if(!existsSync(fTemas))continue;
  const temas=(await import(pathToFileURL(fTemas).href)).default;
  const c=cobertura[materia]={total:0,ok:0,mal:[],directo:0,partimos:[]};
  for(const t of temas)for(const n of t.nodos||[]){
    if(!n.id||n.proximo||n.ir||!n.gen)continue;
    const g=GENERADORES[n.gen];if(!g)continue;
    c.total++;const prob=[];
    // mini-lección: explicación + ejemplo resuelto + ejemplo a medias
    if(!g.explicacion)prob.push('sin explicación');
    const ej=crear(n.gen,1,{semilla:7});
    if(!(ej.pasos?.length>=2))prob.push('ejemplo resuelto sin pasos');
    let medias=false;for(let s=0;s<MUESTRAS&&!medias;s++)medias=!!(comoHueco(crear(n.gen,1,{semilla:100+s}))||(crear(n.gen,1,{semilla:100+s}).pasos?.length>=2));
    if(!medias)prob.push('sin ejemplo a medias');
    // primer ejercicio de nivel 1
    if(ej.nivel!==1)prob.push('el primer ejercicio no es de nivel 1');
    // escalera con datos en los 5 niveles
    let sinDatos=null,sinEsc=null,conPartimos=0,muestras=0;
    for(let nv=1;nv<=5;nv++)for(let s=0;s<MUESTRAS;s++){const p=crear(n.gen,nv,{semilla:1000*nv+s});
      const e=escalera(p);if(!e?.idea||!e.primero||!(e.pasos.length>=2)){sinEsc??=p;continue}
      muestras++;if(!pistaConDatos(p))sinDatos??=p;else if(!pasoConDatos(p))conPartimos++}
    if(conPartimos/Math.max(1,muestras)<=0.2)c.directo++;else c.partimos.push(`${n.gen} (${Math.round(100*conPartimos/muestras)} %)`);
    if(sinEsc)prob.push(`sin escalera de 3 niveles (nivel ${sinEsc.nivel})`);
    if(sinDatos)prob.push(`pista 2 sin datos del ejercicio (nivel ${sinDatos.nivel}: «${String(sinDatos.enunciado).replace(/<[^>]+>/g,' ').slice(0,70)}» → «${escalera(sinDatos).primero.replace(/<[^>]+>/g,' ').slice(0,70)}»)`);
    // «No sé cómo empezar»: solución + gemelo distinto del mismo tipo
    const p=crear(n.gen,2,{semilla:42}),gem=gemelo(p);
    if(!gem||(gem.clave||gem.enunciado)===(p.clave||p.enunciado))prob.push('no hay gemelo distinto');
    if(prob.length){c.mal.push(`${n.gen}: ${prob.join('; ')}`);fallos++}else c.ok++;
  }
}
for(const [m,c] of Object.entries(cobertura)){if(!c.total)continue;
  console.log(`${m}: ${c.ok}/${c.total} habilidades (${Math.round(100*c.ok/c.total)} %) · paso 1 que ya opera con los datos: ${c.directo}/${c.total} (las demás anteponen «Partimos de»)`);
  if(detalle&&c.partimos.length)console.log('  · con «Partimos de»: '+c.partimos.join(', '));
  if(c.mal.length)console.log((detalle?c.mal:c.mal.slice(0,5)).map(x=>'  ✗ '+x).join('\n')+(!detalle&&c.mal.length>5?`\n  … y ${c.mal.length-5} más (--detalle)`:''));}
console.log(fallos?`\n${fallos} habilidades no están listas para un principiante.`:'\nTodas las habilidades están listas para un principiante.');
process.exit(fallos?1:0);
