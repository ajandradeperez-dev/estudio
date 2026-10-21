/* 🧪 Laboratorio de Python: «escribe la función», corregido como un juez (nucleo/python/juez.js) con Python de verdad.
   Rutas (bajo #cursos/python/laboratorio): (vacía) todas las unidades · <unidad> sus ejercicios · t/<id> un ejercicio.
   En cada ejercicio: «▶ Probar» corre las pruebas visibles; «✅ Enviar», también las ocultas, y dice qué caso falló.
   Ayuda para principiantes: «💡 Pista» en escalera (idea → primer paso con los datos del ejemplo → solución explicada y
   «Ahora tú» con el ejercicio gemelo) y «🤷 No sé cómo empezar» (la solución paso a paso y luego el gemelo; no es un fallo).
   Resolverlo la primera vez da 20 XP (10 si usaste pista) y cuenta para la meta del día. Se guarda en extra.lab[id]. */
import {esc} from '../../../utilidades.js';
import {htmlEditor,activarEditor,teclaEditor,htmlResultado} from '../../../nucleo/python/editor.js';
import {ejecutar,detener,cargarPython,estadoPython} from '../../../nucleo/python/runner.js';
import {programaPruebas,leerResultados,salidaPropia} from '../../../nucleo/python/juez.js';
import {explicarError} from '../../../nucleo/python/errores.js';
import {progreso,datosMateria,cambiarExtra,registrarEjercicio,hoy} from '../../../nucleo/progreso.js';
import {conFormulas} from '../../../nucleo/formula.js';
import {LABORATORIO,tarea,tareasDe} from '../laboratorio.js';
import defs from '../temas.js';
import {leerGuardado,guardarCodigo,textoEstado,escucharEstado} from './editor.js';
import {aviso} from '../../../nucleo/ui.js';

const RAIZ='cursos/python/laboratorio';
const resueltos=()=>datosMateria(progreso(),'python').extra.lab||{};
const unidad=id=>defs.find(t=>t.id===id);
const miga=(...partes)=>`<p class="miga"><button class="enlace" data-go="${RAIZ}">🧪 Laboratorio</button>${partes.map(([t,r])=>` › ${r?`<button class="enlace" data-go="${r}">${t}</button>`:t}`).join('')}</p>`;

function portada(){
  return {titulo:'Laboratorio de Python',vista(){
    const r=resueltos();
    return `<div class="area-python">${miga()}<h1>🧪 Laboratorio de Python</h1>
<p class="intro">Aquí escribes funciones completas y un juez las prueba con casos visibles y ocultos, como en un examen de programación. Si no sabes cómo empezar, cada ejercicio te guía paso a paso.</p>
<div class="pila">${defs.map(t=>{const l=tareasDe(t.id),h=l.filter(x=>r[x.id]).length;
  return `<button class="tarjeta-nav" data-go="${RAIZ}/${t.id}"><span class="tarjeta-icono" aria-hidden="true">${t.icono}</span><span><b>${t.titulo}</b><span class="nota">${h}/${l.length} resueltos</span></span></button>`}).join('')}</div></div>`}};
}
function vistaUnidad(t){
  return {titulo:`Laboratorio: ${t.titulo}`,vista(){
    const r=resueltos();
    return `<div class="area-python">${miga([t.titulo])}<h1>${t.icono} ${t.titulo}</h1>
<div class="pila">${tareasDe(t.id).map(x=>`<button class="tarjeta-nav" data-go="${RAIZ}/t/${x.id}"><span class="tarjeta-icono" aria-hidden="true">${r[x.id]?'✅':'🧪'}</span><span><b>${esc(x.titulo)}</b><span class="nota">${r[x.id]?'Resuelto':'Escribe la función'}</span></span></button>`).join('')}</div>
<p style="margin-top:16px"><button class="btn ghost ancho" data-go="cursos/python/${t.id}">Volver al tema</button></p></div>`}};
}

function vistaTarea(x){
  let res=null,corriendo=false,pista=0,nose=false,quitar=null,uso=false;
  const desfase=`${x.preparar||''}\n`.split('\n').length-1;
  // El editor del laboratorio tiene su propio id: al venir del editor libre, su textarea todavía está en la página
  const guardado=()=>leerGuardado()[`lab:${x.id}`]??x.inicio;
  const codigoActual=()=>document.getElementById('lab-codigo')?.value??guardado();
  const gem=x.gemelo&&tarea(x.gemelo);
  const htmlPasos=()=>`<ol class="pasos-proc">${x.pasos.map(([q,c,p],i)=>`<li class="paso-proc"><p class="paso-que"><b>${i+1}. ${esc(q)}</b></p><p><code>${esc(c)}</code></p><p class="nota">💡 ${esc(p)}</p></li>`).join('')}</ol>
<p class="etiqueta-actividad">Una solución</p><pre class="py-salida">${esc(x.solucion)}</pre>`;
  function htmlResultados(){
    if(!res)return '';
    if(res.error&&!res.casos.length)return htmlResultado(res.r,{desfase});
    const ok=res.casos.filter(c=>c.ok).length,total=res.casos.length;
    const filas=res.casos.map((c,i)=>{const ex=c.error?explicarError({tipo:c.error,mensaje:c.mensaje}):null;
      return `<li class="py-caso ${c.ok?'bien':'mal'}"><span aria-hidden="true">${c.ok?'✅':'❌'}</span> <span><code>${esc(c.llamada)}</code>${c.visible?'':' <span class="nota">(caso oculto)</span>'}<br>
${c.ok?`<span class="nota">da ${esc(c.obtuvo)}</span>`:ex?`<span class="nota">da <b>${esc(c.error)}</b>: ${esc(ex.explicacion)}</span>`:`<span class="nota">esperado <b>${esc(c.esperado)}</b>, tu función dio <b>${esc(c.obtuvo)}</b></span>`}</span></li>`}).join('');
    const propia=salidaPropia(res.r.salida);
    return `<p class="etiqueta-actividad">${res.todas?'Todas las pruebas':'Pruebas visibles'}: ${ok}/${total}</p><ul class="py-casos">${filas}</ul>
${propia?`<p class="etiqueta-actividad">📤 Lo que imprimió tu código</p><pre class="py-salida">${esc(propia)}</pre>`:''}
${res.todas&&ok===total?`<div class="card tema-terminado"><p style="margin:0"><b>🎉 ¡Resuelto!</b> ${res.xp?`+${res.xp} XP.`:''}</p>${gem?`<p class="nota">Practica lo mismo con otro caso:</p><button class="btn ancho area" data-go="${RAIZ}/t/${gem.id}">Siguiente: ${esc(gem.titulo)}</button>`:''}</div>`
  :!res.todas&&ok===total?'<p class="nota">✅ Pasan las visibles. Ahora toca «Enviar» para probar también los casos ocultos.</p>':'<p class="nota">Lee el primer caso que falla: compara lo esperado con lo que dio tu función.</p>'}`;
  }
  function htmlAyuda(){
    if(nose)return `<div class="ayuda-caja"><p class="etiqueta-actividad">📖 Así se resuelve, paso a paso</p>${htmlPasos()}<p class="nota">No pasa nada: esto cuenta como visto, no como error.</p>${gem?`<button class="btn ancho" data-go="${RAIZ}/t/${gem.id}">Ahora tú: ${esc(gem.titulo)}</button>`:''}</div>`;
    if(!pista)return '';
    return `<p class="pista"><b>💡 Idea:</b> ${conFormulas(x.idea)}</p>${pista>=2?`<div class="pista"><b>Primer paso:</b> ${x.primero}</div>`:''}
${pista>=3?`<div class="ayuda-caja"><p class="etiqueta-actividad">📖 Solución explicada</p>${htmlPasos()}${gem?`<button class="btn ancho" data-go="${RAIZ}/t/${gem.id}">Ahora tú: ${esc(gem.titulo)}</button>`:''}</div>`:''}
<p class="nota">Con pista cuenta como práctica. Para dominarlo, resuelve el gemelo sin ayuda.</p>`;
  }
  async function correr(todas,repintar){
    const codigo=codigoActual();guardarCodigo(`lab:${x.id}`,codigo);
    corriendo=true;res=null;repintar();
    let r;try{r=await ejecutar(programaPruebas(codigo,x,{todas}))}finally{corriendo=false}
    const casos=leerResultados(r.salida);res={r,casos,todas,error:r.error};
    if(todas&&casos.length&&casos.every(c=>c.ok)){
      const primera=!resueltos()[x.id],xp=primera?(uso?10:20):0;
      cambiarExtra('python',e=>{e.lab={...(e.lab||{}),[x.id]:e.lab?.[x.id]||hoy()}});
      registrarEjercicio({materia:'python',correcto:true,xp,repasar:false});res.xp=xp;
      if(primera)aviso(`🎉 ¡Resuelto! +${xp} XP`);
    }
    repintar();document.getElementById('py-resultado')?.scrollIntoView({block:'nearest'});
  }
  return {titulo:x.titulo,
    alEntrar(){res=null;pista=0;nose=false;uso=false;quitar?.();quitar=escucharEstado();cargarPython().catch(()=>{})},
    alSalir(){quitar?.();quitar=null},
    vista(){
      const t=unidad(x.unidad),hecho=resueltos()[x.id];
      return `<div class="area-python">${miga([t.titulo,`${RAIZ}/${t.id}`],[esc(x.titulo)])}<h1>${hecho?'✅ ':''}${esc(x.titulo)}</h1>
<div class="card"><p>${x.enunciado}</p><p class="etiqueta-actividad">Ejemplos (pruebas visibles)</p><ul class="py-ejemplos">${x.pruebas.map(c=>`<li><code>${esc(c.llamada)}</code> → <code>${esc(c.esperado)}</code></li>`).join('')}</ul>
<p class="nota">Además hay ${x.ocultas.length} casos ocultos que se prueban al enviar.</p></div>
<p class="nota" id="py-estado" role="status">${textoEstado(estadoPython())}</p>
${htmlEditor({id:'lab-codigo',codigo:guardado(),filas:10})}
<div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" class="btn ghost" id="lab-probar"${corriendo?' disabled':''}>▶ Probar</button><button type="button" class="btn area" id="lab-enviar"${corriendo?' disabled':''}>✅ Enviar</button>${corriendo?'<button type="button" class="btn ghost" id="py-detener">⏹ Detener</button>':''}</div>
<div class="row" style="gap:8px;flex-wrap:wrap">${pista<3&&!nose?`<button type="button" class="btn ghost btn-chico" id="lab-pista">💡 Pista ${pista+1}/3</button>`:''}${!nose?'<button type="button" class="btn ghost btn-chico" id="lab-nose">🤷 No sé cómo empezar</button>':''}<button type="button" class="btn ghost btn-chico" id="lab-reiniciar">↺ Código inicial</button></div>
${htmlAyuda()}
<div id="py-resultado" aria-live="polite">${corriendo?'<p class="nota">Probando tu función…</p>':htmlResultados()}</div></div>`;
    },
    alMostrar(){const ta=document.getElementById('lab-codigo');activarEditor(ta);ta?.addEventListener('input',()=>guardarCodigo(`lab:${x.id}`,ta.value))},
    async alClic(t,ir,repintar){
      if(teclaEditor(t))return true;
      if(t.id==='py-detener'){detener();return true}
      if(t.id==='lab-probar'&&!corriendo){await correr(false,repintar);return true}
      if(t.id==='lab-enviar'&&!corriendo){await correr(true,repintar);return true}
      if(t.id==='lab-pista'){guardarCodigo(`lab:${x.id}`,codigoActual());pista++;uso=true;repintar();return true}
      if(t.id==='lab-nose'){guardarCodigo(`lab:${x.id}`,codigoActual());nose=true;uso=true;repintar();document.querySelector('.ayuda-caja')?.scrollIntoView({block:'start'});return true}
      if(t.id==='lab-reiniciar'){guardarCodigo(`lab:${x.id}`,x.inicio);res=null;repintar();return true}
    }};
}

export function ruta(resto){
  const [a,b]=resto;
  if(a==='t'&&tarea(b))return {ruta:`${RAIZ}/t/${b}`,v:vistaTarea(tarea(b))};
  if(a&&unidad(a))return {ruta:`${RAIZ}/${a}`,v:vistaUnidad(unidad(a))};
  return {ruta:RAIZ,v:portada()};
}
export {LABORATORIO};
