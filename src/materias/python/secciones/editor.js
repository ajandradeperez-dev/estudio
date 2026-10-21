/* ▶️ Editor de Python (#cursos/python/editor): escribir y ejecutar código de verdad (Pyodide en un Web Worker), con
   entrada simulada para input(), límite de tiempo y «Detener», y los errores explicados para principiantes.
   El código se recuerda en este teléfono (localStorage 'ciberlab-python', solo una comodidad). */
import {esc} from '../../../utilidades.js';
import {htmlEditor,activarEditor,teclaEditor,htmlResultado} from '../../../nucleo/python/editor.js';
import {ejecutar,detener,cargarPython,estadoPython} from '../../../nucleo/python/runner.js';
import {cabecera} from '../../../nucleo/ui.js';

const CLAVE='ciberlab-python';
export const leerGuardado=()=>{try{return JSON.parse(localStorage.getItem(CLAVE)||'{}')||{}}catch(e){return {}}};
export const guardarCodigo=(k,codigo)=>{try{const g=leerGuardado();g[k]=codigo;localStorage.setItem(CLAVE,JSON.stringify(g))}catch(e){}};
export const EJEMPLOS=[
  ['Hola mundo','# Mi primer programa\nprint("¡Hola, mundo!")\nprint(2 + 3)\n'],
  ['Con input()','nombre = input()\nedad = int(input())\nprint(f"{nombre} tendrá {edad + 1} años el próximo año")\n'],
  ['Bucle y lista','compras = ["pan", "leche", "huevo"]\nfor i, cosa in enumerate(compras, start=1):\n    print(i, cosa)\n'],
  ['Función','def area(base, altura):\n    return base * altura\n\nprint(area(3, 4))\n'],
  ['Un error (para ver la explicación)','precio = 10\nprint("Total: " + precio)\n']
];
// Texto del estado de Python (lo actualiza el evento 'python-estado')
export const textoEstado=e=>({'sin-cargar':'Python se descarga la primera vez que lo usas (unos 10 MB) y luego funciona sin internet.','cargando':'⏳ Cargando Python… la primera vez tarda un poco.','listo':'✅ Python 3.13 listo.','error':'⚠️ No se pudo cargar Python. La primera vez necesita internet.'})[e]||'';
export function escucharEstado(){
  const f=e=>{const el=document.getElementById('py-estado');if(el)el.textContent=textoEstado(e.detail)};
  document.addEventListener('python-estado',f);return ()=>document.removeEventListener('python-estado',f);
}

let resultado=null,corriendo=false,quitar=null;
export function vista(){
  const g=leerGuardado(),codigo=g.editor??EJEMPLOS[0][1];
  return `<div class="area-python">${cabecera({icono:'▶️',titulo:'Editor de Python',desc:'Escribe un programa y ejecútalo aquí mismo, sin instalar nada.'})}
<p class="nota" id="py-estado" role="status">${textoEstado(estadoPython())}</p>
<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">${EJEMPLOS.map(([t],i)=>`<button type="button" class="chip-filtro" data-ejemplo="${i}">${esc(t)}</button>`).join('')}</div>
${htmlEditor({codigo,filas:12})}
<details class="nota-datos"${g.entrada?' open':''}><summary>⌨️ Entrada para input() (una por línea)</summary><textarea id="py-entrada" class="py-editor" rows="3" spellcheck="false" autocapitalize="off">${esc(g.entrada||'')}</textarea></details>
<div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" class="btn area" id="py-ejecutar"${corriendo?' disabled':''}>▶ Ejecutar</button><button type="button" class="btn ghost" id="py-detener"${corriendo?'':' disabled'}>⏹ Detener</button></div>
<div id="py-resultado" aria-live="polite">${corriendo?'<p class="nota">Ejecutando…</p>':htmlResultado(resultado)}</div></div>`;
}
export function alEntrar(){resultado=null;quitar?.();quitar=escucharEstado();cargarPython().catch(()=>{})}
export function alSalir(){quitar?.();quitar=null}
export function alMostrar(){
  const ta=document.getElementById('py-codigo');activarEditor(ta);
  ta?.addEventListener('input',()=>guardarCodigo('editor',ta.value));
  document.getElementById('py-entrada')?.addEventListener('input',e=>guardarCodigo('entrada',e.target.value));
}
export async function alClic(t,ir,repintar){
  if(teclaEditor(t))return true;
  if(t.dataset.ejemplo!==undefined){const [,c]=EJEMPLOS[+t.dataset.ejemplo];guardarCodigo('editor',c);resultado=null;repintar();return true}
  if(t.id==='py-detener'){detener();return true}
  if(t.id==='py-ejecutar'&&!corriendo){
    const codigo=document.getElementById('py-codigo').value,entrada=(document.getElementById('py-entrada')?.value||'').split('\n').filter((x,i,a)=>x!==''||i<a.length-1);
    guardarCodigo('editor',codigo);corriendo=true;resultado=null;repintar();
    try{resultado=await ejecutar(codigo,{entrada})}finally{corriendo=false}
    repintar();document.getElementById('py-resultado')?.scrollIntoView({block:'nearest'});return true;
  }
}
