/* npm run python: ejecuta en Python de verdad (Pyodide en Node) todo el curso de Python.
   - Cada generador 'pyc/…' (5 niveles × MUESTRAS): el código de su `py` debe imprimir exactamente su salida (con la entrada
     simulada de input()), o dar el error que dice (NameError, TypeError…) y su arreglo funcionar.
   - Cada ejercicio del laboratorio («escribe la función»): su solución pasa todas sus pruebas (visibles y ocultas), y
     el código inicial NO las pasa (si no, no habría nada que hacer).
   Falla si algo no coincide. La usa npm run calidad. */
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadPyodide} from 'pyodide';

globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','src');
const {GENERADORES,crear}=await import(pathToFileURL(join(raiz,'nucleo','generadores','index.js')).href);
const {LABORATORIO}=await import(pathToFileURL(join(raiz,'materias','python','laboratorio.js')).href).catch(()=>({LABORATORIO:[]}));
const {programaPruebas,leerResultados}=await import(pathToFileURL(join(raiz,'nucleo','python','juez.js')).href);
const MUESTRAS=+(process.argv.find(a=>a.startsWith('--muestras='))?.split('=')[1]||12);

const py=await loadPyodide();
// Ejecuta un programa con su entrada; devuelve {salida, error}
function correr(codigo,entrada=[]){
  const out=[],cola=[...entrada];
  py.setStdout({batched:s=>out.push(s)});py.setStderr({batched:()=>{}});
  py.setStdin({stdin:()=>cola.length?cola.shift():undefined,isatty:false});
  const g=py.globals.get('dict')();
  try{py.runPython(codigo,{globals:g});return {salida:out.join('\n').replace(/\s+$/,''),error:null}}
  catch(e){return {salida:out.join('\n'),error:e.type||String(e.message).split('\n').filter(Boolean).at(-1).split(':')[0]}}
  finally{g.destroy?.()}
}

let fallos=0,corridos=0;const mal=(id,m)=>{fallos++;if(fallos<=40)console.log(`✗ ${id}: ${m}`)};
const ids=Object.keys(GENERADORES).filter(k=>k.startsWith('pyc/'));
for(const id of ids)for(let n=1;n<=5;n++)for(let s=0;s<MUESTRAS;s++){
  const p=crear(id,n,{semilla:9000+n*101+s});if(!p?.py){mal(id,`nivel ${n} sin py`);continue}
  const {codigo,salida,error,arreglo,entrada}=p.py;corridos++;
  const r=correr(codigo,entrada);
  if(error){
    if(r.error!==error)mal(id,`nivel ${n} (${p.plantilla}): se esperaba ${error} y dio ${r.error||'nada'}\n${codigo}`);
    if(arreglo&&salida!==undefined){const a=correr(arreglo,entrada);if(a.error||a.salida!==String(salida))mal(id,`nivel ${n} (${p.plantilla}): el arreglo da «${a.salida}» ${a.error||''} y no «${salida}»\n${arreglo}`)}
  }else{
    if(r.error)mal(id,`nivel ${n} (${p.plantilla}): dio ${r.error}\n${codigo}`);
    else if(r.salida!==String(salida))mal(id,`nivel ${n} (${p.plantilla}): Python imprime «${r.salida}» y la respuesta dice «${salida}»\n${codigo}`);
  }
}
// Laboratorio: la solución pasa todo; el código inicial no
for(const t of LABORATORIO){
  const ok=leerResultados(correr(programaPruebas(t.solucion,t,{todas:true})).salida);
  if(!ok.length||ok.some(x=>!x.ok))mal(`lab/${t.id}`,`la solución no pasa: ${JSON.stringify(ok.filter(x=>!x.ok).slice(0,2))}`);
  const ini=leerResultados(correr(programaPruebas(t.inicio,t,{todas:true})).salida);
  if(ini.length&&ini.every(x=>x.ok))mal(`lab/${t.id}`,'el código inicial ya pasa todas las pruebas');
  corridos++;
}
console.log(`python: ${ids.length} generadores y ${LABORATORIO.length} ejercicios del laboratorio, ${corridos} programas ejecutados en Pyodide`);
console.log(fallos?`${fallos} fallos`:'Todo coincide con Python.');
process.exit(fallos?1:0);
