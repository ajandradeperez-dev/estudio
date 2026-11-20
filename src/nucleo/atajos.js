/* Teclado físico (Book Cover Keyboard, DeX, laptop): atajos globales, ayuda con «?», búsqueda con Ctrl+K y detección
   del teclado de verdad para esconder los teclados de símbolos en pantalla.
   Atajos (fuera de un campo de texto, salvo Enter, Esc, Ctrl+K y Ctrl+Enter):
     Enter comprobar o continuar · 1–4 elegir opción · H siguiente pista · S ver la solución · B borrador
     Esc cerrar el panel o el diálogo (igual que Atrás) · Ctrl+K buscar · ←/→ páginas del lector (lector.js)
     Ctrl+Enter ejecutar en Python · ? esta ayuda
   Teclado físico: se nota cuando alguien escribe con él (las teclas del teclado de la pantalla en Android llegan como
   «Unidentified» / 229); desde ahí no se muestran el teclado matemático ni la barra de símbolos de Python, salvo que se
   pidan con «⌨️ Símbolos» (html[data-teclado-fisico], html[data-simbolos]). */
import {materias,rutaMateria,rutaTema,rutaLeccion} from './materias.js';
import {LIBROS} from '../materias/lectura/catalogo.js';
import {todasLasNotas} from './cuaderno/db.js';
import {esc} from '../utilidades.js';

export const ATAJOS=[['Enter','Comprobar o continuar'],['1 – 4','Elegir una opción'],['H','Siguiente pista'],['S','Ver la solución'],['B','Abrir o cerrar el borrador'],
  ['Esc','Cerrar el panel o el diálogo (como Atrás)'],['Ctrl + K','Buscar materias, temas, notas y libros'],['← →','Página anterior o siguiente en el lector'],['Ctrl + Enter','Ejecutar en Python'],
  ['Ctrl + N','Notas: nueva nota'],['Ctrl + B · Ctrl + M','Notas: negrita · fórmula'],['Ctrl + Shift + 8','Notas: lista'],['Alt + ↑ ↓','Notas: mover el bloque'],
  ['Esc','Notas: terminar el bloque y luego volver a la lista'],['Espacio · 1 2 3','Repasar una nota: mostrar · Otra vez, Bien, Fácil'],['?','Esta ayuda']];
const ir=ruta=>document.dispatchEvent(new CustomEvent('ir',{detail:ruta}));
const q=s=>document.querySelector(s);
const clic=s=>{const b=q(s);if(b&&!b.disabled&&b.offsetParent!==null){b.click();return true}return false};
const escribiendo=t=>!!t?.closest?.('input,textarea,select,[contenteditable="true"]');
const abierto=()=>q('.modal-fondo,.dibujo-fondo');

/* ---------- diálogo propio (ayuda y búsqueda): se cierra con Esc, el botón o tocando fuera ---------- */
function dialogo(html,alAbrir){
  const f=document.createElement('div');f.className='modal-fondo';
  f.innerHTML=`<div class="modal modal-ancho" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${html}<button type="button" class="btn ghost ancho" data-x>Cerrar</button></div>`;
  const cerrar=()=>{f.remove();document.removeEventListener('keydown',tecla,true)};
  const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();cerrar()}};
  f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-x]'))cerrar()});
  document.addEventListener('keydown',tecla,true);document.body.appendChild(f);alAbrir?.(f,cerrar);return f;
}
export function ayudaAtajos(){
  dialogo(`<h2 id="dlg-t">⌨️ Atajos de teclado</h2><table class="atajos"><tbody>${ATAJOS.map(([k,t])=>`<tr><td><kbd>${k}</kbd></td><td>${t}</td></tr>`).join('')}</tbody></table>
<p class="nota">Funcionan con el teclado de la tablet (Book Cover Keyboard), en DeX y en la computadora. Tab recorre los botones en orden.</p>`,f=>f.querySelector('[data-x]').focus());
}

/* ---------- 🔎 buscar (Ctrl+K) ---------- */
const normal=t=>String(t||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
function indice(notas){
  const xs=[];
  for(const m of materias){if(m.proximo)continue;xs.push({icono:m.icono||'📘',titulo:m.nombre,desc:'Materia',ruta:rutaMateria(m)});
    for(const t of m.temas||[])xs.push({icono:t.icono||'📂',titulo:t.titulo,desc:`Tema · ${m.nombre}`,ruta:rutaTema(m,t)});
    for(const l of m.lecciones||[])if(l.titulo)xs.push({icono:'🎯',titulo:l.titulo,desc:`Habilidad · ${m.nombre}`,ruta:rutaLeccion(m,l)})}
  for(const l of LIBROS)xs.push({icono:l.icono||'📚',titulo:l.titulo,desc:`Libro · ${l.autor}`,ruta:`estudio/lectura/libro/${l.id}`});
  for(const n of notas)xs.push({icono:'📝',titulo:n.titulo||'Sin título',desc:'Nota',ruta:`notas/n/${n.id}`,extra:n.cuerpo});
  return xs;
}
export async function buscar(){
  if(q('#buscar-global'))return;
  let xs=indice([]);
  const lista=t=>{const k=normal(t).trim();if(!k)return '<p class="nota">Escribe para buscar en materias, temas, habilidades, notas y libros.</p>';
    const r=xs.map(x=>({x,p:normal(x.titulo).startsWith(k)?0:normal(x.titulo).includes(k)?1:normal(x.extra).includes(k)?2:9})).filter(y=>y.p<9).sort((a,b)=>a.p-b.p).slice(0,30);
    return r.length?r.map(({x},i)=>`<button type="button" class="opcion-enlace buscar-res" data-ruta="${esc(x.ruta)}"${i===0?' aria-selected="true"':''}><span aria-hidden="true">${x.icono}</span> <b>${esc(x.titulo)}</b> <span class="nota">${esc(x.desc)}</span></button>`).join(''):'<p class="nota">Nada coincide.</p>'};
  dialogo(`<h2 id="dlg-t">🔎 Buscar</h2><input type="search" id="buscar-global" placeholder="Materias, temas, notas, libros…" autocomplete="off" aria-label="Buscar"><div class="lista-enlaces" id="buscar-lista" role="listbox">${lista('')}</div>`,(f,cerrar)=>{
    const inp=f.querySelector('#buscar-global'),caja=f.querySelector('#buscar-lista');inp.focus();
    const pintar=()=>{caja.innerHTML=lista(inp.value)};inp.addEventListener('input',pintar);
    todasLasNotas().then(ns=>{xs=indice(ns);pintar()}).catch(()=>{});
    f.addEventListener('click',e=>{const b=e.target.closest('[data-ruta]');if(b){cerrar();ir(b.dataset.ruta)}});
    // ↑ ↓ recorren los resultados; Enter abre el elegido
    inp.addEventListener('keydown',e=>{const rs=[...caja.querySelectorAll('[data-ruta]')];if(!rs.length)return;let i=rs.findIndex(x=>x.getAttribute('aria-selected')==='true');
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();rs[i]?.removeAttribute('aria-selected');i=(i+(e.key==='ArrowDown'?1:-1)+rs.length)%rs.length;rs[i].setAttribute('aria-selected','true');rs[i].scrollIntoView({block:'nearest'})}
      else if(e.key==='Enter'){e.preventDefault();(rs[i]||rs[0]).click()}});
  });
}

/* ---------- atajos globales ---------- */
function alTeclear(e){
  // ¿teclado de verdad? (el de la pantalla de Android manda «Unidentified» / 229)
  if(e.key&&e.key.length===1&&e.key!=='Unidentified'&&e.keyCode!==229&&!e.isComposing&&!document.documentElement.dataset.tecladoFisico&&escribiendo(e.target))
    document.documentElement.dataset.tecladoFisico='1';
  const ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&e.key.toLowerCase()==='k'){e.preventDefault();buscar();return}
  if(ctrl&&e.key==='Enter'){if(clic('#py-ejecutar')||clic('#lab-probar'))e.preventDefault();return}
  if(abierto())return;                                  // los diálogos atienden sus propias teclas
  if(e.key==='Escape'){
    if(e.target.closest?.('#procedimiento'))return;   // el procedimiento ya se cerró solo
    if(q('#procedimiento')){e.preventDefault();history.back();return}
    if(clic('#ses-panel-cerrar')){e.preventDefault();return}
    if(q('#ses-borrador[aria-pressed="true"]')){e.preventDefault();clic('#ses-borrador');return}
    return;
  }
  if(ctrl||e.altKey)return;
  if(e.key==='Enter'){
    // en un botón o enlace, Enter ya lo activa; en la respuesta escrita, la sesión comprueba
    if(escribiendo(e.target)||e.target.closest?.('button,a,summary,[data-go]'))return;
    if(clic('#hoja-seguir')||clic('#ses-comprobar')||clic('#ses-continuar'))e.preventDefault();
    return;
  }
  if(escribiendo(e.target))return;
  if(e.key==='?'){e.preventDefault();ayudaAtajos();return}
  const k=e.key.toLowerCase();
  if(/^[1-4]$/.test(k)&&q('.sesion')){if(clic(`#vista [data-op="${+k-1}"]`))e.preventDefault();return}
  if(k==='h'){if(clic('#ses-pista'))e.preventDefault();return}
  if(k==='s'){if(clic('#hoja-proc')||clic('#ses-nosecomo')||clic('[data-ver-todos]'))e.preventDefault();return}
  if(k==='b'){if(clic('#ses-borrador'))e.preventDefault();return}
}
export function activarAtajos(){
  document.addEventListener('keydown',alTeclear);
  // «⌨️ Símbolos»: con teclado físico, muestra otra vez los teclados de símbolos en pantalla
  document.addEventListener('click',e=>{const b=e.target.closest('[data-ver-simbolos]');if(!b)return;const r=document.documentElement;
    if(r.dataset.simbolos)delete r.dataset.simbolos;else r.dataset.simbolos='1'},true);
  // DeX o ratón: clic derecho en una nota de la lista abre su menú «⋯»
  document.addEventListener('contextmenu',e=>{const f=e.target.closest?.('.nota-fila');const m=f?.querySelector('.nota-menu');if(m){e.preventDefault();m.click()}});
}
