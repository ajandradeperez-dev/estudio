/* Editor de código para el teléfono: fuente monoespaciada, barra con las teclas que cuestan en el teclado móvil
   ( : ( ) [ ] { } " ' = # ⇥ ) y sangría automática (Enter copia la sangría de la línea; después de «:» agrega 4 espacios).
   htmlEditor({id, codigo, filas, etiqueta}) → HTML · activarEditor(textarea) → listeners · teclaEditor(boton) desde el clic */
import {esc} from '../../utilidades.js';
import {explicarError} from './errores.js';

export const TECLAS=[[':',':'],['(','('],[')',')'],['[','['],[']',']'],['{','{'],['}','}'],['"','"'],["'","'"],['=','='],['#','#'],['⇥','    '],['_','_'],[',',',']];
export const htmlEditor=({id='py-codigo',codigo='',filas=10,etiqueta='Tu código'})=>`<label class="oculto-visual" for="${id}">${etiqueta}</label>
<textarea id="${id}" class="py-editor" rows="${filas}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" translate="no">${esc(codigo)}</textarea>
<div class="py-teclas" role="toolbar" aria-label="Símbolos de Python">${TECLAS.map(([t,v])=>`<button type="button" class="tecla" data-pytecla="${esc(v)}" data-para="${id}" aria-label="${t==='⇥'?'Sangría de 4 espacios':t}">${esc(t)}</button>`).join('')}</div>`;

function insertar(ta,txt){
  const a=ta.selectionStart??ta.value.length,b=ta.selectionEnd??a;
  ta.setRangeText(txt,a,b,'end');ta.dispatchEvent(new Event('input',{bubbles:true}));
}
// Sangría de la nueva línea: la de la línea actual, + 4 si termina en «:»
function nuevaLinea(ta){
  const a=ta.selectionStart,ini=ta.value.lastIndexOf('\n',a-1)+1,lineaAct=ta.value.slice(ini,a);
  const sangria=(/^ */.exec(lineaAct)[0])+(/:\s*$/.test(lineaAct)?'    ':'');
  insertar(ta,'\n'+sangria);
}
export function activarEditor(ta){
  if(!ta||ta.dataset.activo)return;ta.dataset.activo='1';
  // beforeinput atrapa el Enter del teclado del teléfono; keydown, el de la computadora y Tab
  ta.addEventListener('beforeinput',e=>{if(e.inputType==='insertLineBreak'||(e.inputType==='insertText'&&e.data==='\n')){e.preventDefault();nuevaLinea(ta)}});
  ta.addEventListener('keydown',e=>{
    if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();insertar(ta,'    ')}
    else if(e.key==='Enter'&&!e.isComposing&&!(e.ctrlKey||e.metaKey)){e.preventDefault();nuevaLinea(ta)}
  });
  // la barra de teclas no le quita el foco al texto (así no se cierra el teclado)
  ta.parentElement?.querySelector('.py-teclas')?.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
}
// Clic en una tecla de la barra: devuelve true si lo atendió
export function teclaEditor(t){
  if(t.dataset.pytecla===undefined)return false;
  const ta=document.getElementById(t.dataset.para);if(!ta)return true;
  ta.focus();insertar(ta,t.dataset.pytecla);return true;
}
// Resultado de una ejecución: salida y, si hubo error, su explicación para principiantes
export function htmlResultado(r,{desfase=0}={}){
  if(!r)return '';
  const salida=String(r.salida||'').replace(/\s+$/,'');
  const ex=r.error?explicarError(r.error,{desfase}):null;
  return `${salida?`<p class="etiqueta-actividad">📤 Salida</p><pre class="py-salida">${esc(salida)}</pre>`:(!ex?'<p class="nota">El programa terminó sin imprimir nada.</p>':'')}
${ex?`<div class="py-error" role="alert"><p><b>⚠️ ${esc(ex.titulo)}</b>${ex.linea?` en la línea ${ex.linea}`:''}: ${esc(ex.explicacion)}</p><p class="nota">💡 ${esc(ex.consejo)}</p>${ex.original&&ex.original!==ex.titulo&&!['Tiempo','Detenido'].includes(ex.titulo)?`<p class="nota"><code>${esc(ex.original)}</code></p>`:''}</div>`:''}`;
}
