/* Pestaña 📝 Notas: un cuaderno real (reemplaza la lista de resúmenes "Mis notas").
   Rutas: 'notas' (lista: búsqueda, filtros, cuadernos área → materia → tema y respaldo) · 'notas/n/<id>' (editor)
          'notas/tema/<materia>/<tema>' (resumen automático del tema: reglas de la app + lo que marcaste en tus notas)
   Los datos viven en IndexedDB (cuaderno/db.js) y se cargan de forma asíncrona: la vista se pinta con lo que hay y
   se vuelve a pintar al terminar de cargar (evento 'repintar'). Todo texto del usuario pasa por esc() o por render(). */
import {GENERADORES} from './generadores/index.js';
import {imprimir} from './plataforma.js';
import {esc} from '../utilidades.js';
import {materias,materia as buscarMateria,tema as buscarTema,leccion,rutaLeccion,analizar} from './materias.js';
import {progreso,responderRepaso,refTarjeta,idTarjeta} from './progreso.js';
import {vacio,confirmar,elegir,aviso,avisoAccion,menuAcciones,chip} from './ui.js';
import {tex,conFormulas} from './formula.js';
import {soporte,escuchar} from './voz.js';
import {crear} from './generadores/index.js';
import {generadorDe} from './practica.js';
import {todasLasNotas,leerNota,leerArchivo,guardarArchivo,borrarArchivo,nuevoId,enMemoria,leerBorradorDibujo,guardarBorradorDibujo,borrarBorradorDibujo} from './cuaderno/db.js';
import {render,enLinea,alternarCasilla,tarjetasDe,imagenesDe,plano,normal,TARJETA,bloques,unirBloques,pieDe,vistaPrevia,tieneFormulas} from './cuaderno/formato.js';
import {cuadernoDe,fechaCorta,guardar,crearNota,borrarNotas,restaurarNotas,sincronizarResumenes} from './cuaderno/notas.js';
import {comprimirFoto,guardarImagen} from './cuaderno/medios.js';
import {SIMBOLOS,htmlTecladoFormulas,abrirVisor,editarFoto,pedirTarjeta} from './cuaderno/editor-ui.js';
import {dialogoMatriz} from './matriz-dialogo.js';
import {aLatex,deLatex} from './matrices.js';
import {abrirEditorDibujo} from './dibujo/editor.js';
import {migrarDibujo,imagenesDibujo,nuevoIdObj} from './dibujo/modelo.js';
import {archivoRespaldo,leerRespaldo,aplicarRespaldo,resumenRespaldo,resumenLocal,descargar} from './cuaderno/respaldo.js';
import {misMaterias,recargarMias} from './mias/datos.js';
import {vistaFoto} from './cuaderno/foto.js';

const repintar=()=>document.dispatchEvent(new Event('repintar'));
const opcTex={tex:(s,bloque)=>tex(s,bloque)};
// URLs de las imágenes mostradas (se liberan al volver a pintar)
let urls=[];
// Miniatura (lado mayor 320 px) para las tiras de fotos: no se decodifica la foto completa solo para verla chiquita
async function miniatura(blob){
  try{const b=await createImageBitmap(blob,{resizeWidth:320,resizeQuality:'medium'});const c=document.createElement('canvas');c.width=b.width;c.height=b.height;c.getContext('2d').drawImage(b,0,0);b.close?.();
    return await new Promise(r=>c.toBlob(x=>r(x||blob),'image/jpeg',.8))}catch(e){return blob}
}
async function cargarImagenes(raiz){
  if(!raiz)return;
  urls.forEach(u=>URL.revokeObjectURL(u));urls=[];
  for(const img of raiz.querySelectorAll('img[data-img]')){
    const a=await leerArchivo(img.dataset.img).catch(()=>null);img.decoding='async';img.loading='lazy';
    if(a?.blob){const mini=img.closest('.nota-miniaturas'),u=URL.createObjectURL(mini?await miniatura(a.blob):a.blob);urls.push(u);img.src=u;if(a.ancho&&!mini){img.width=a.ancho;img.height=a.alto}}else img.alt='(imagen no disponible)';
  }
}

/* ---------- respaldo: «💾 Mis datos» (también lo usa Perfil) ---------- */
const kb=b=>b<1024*1024?`${Math.max(1,Math.round(b/1024))} KB`:`${(b/1024/1024).toFixed(1)} MB`;
const fechaLarga=f=>f?new Date(f.length===10?f+'T12:00':f).toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'}):'—';
const puedeCompartirArchivo=()=>{try{return !!navigator.canShare?.({files:[new File(['x'],'x.estudio',{type:'application/octet-stream'})]})}catch(e){return false}};
export const htmlRespaldo=()=>`<div class="card respaldo">
<p class="aviso-linea" style="margin-top:0">📦 Respaldo completo (solo se abre en Estudio+). Para ver o mandar tus notas usa <b>⤓ Descargar</b> en PDF.</p>
<p style="margin-top:0">Tu progreso, tus notas y tus fotos viven <b>en este teléfono</b>. Con un respaldo no los pierdes y los pasas a otro teléfono o a la laptop:</p>
<ol class="nota" style="padding-left:20px"><li><b>Exportar</b>: se crea un archivo <code>.estudio</code> (comprimido) con todo.</li><li>Guárdalo o mándatelo (Drive, correo, WhatsApp a ti mismo…).</li><li>En el otro dispositivo abre la app y toca <b>Importar</b>: eliges <b>Combinar</b> (no se pierde nada de ningún lado) o <b>Reemplazar</b>.</li></ol>
<div class="row" style="flex-wrap:wrap"><button type="button" class="btn ghost btn-chico" id="resp-exportar">💾 Exportar</button>${puedeCompartirArchivo()?`<button type="button" class="btn ghost btn-chico" id="resp-compartir">📤 Compartir</button>`:''}<label class="btn ghost btn-chico" for="resp-archivo">📥 Importar</label>
<input type="file" id="resp-archivo" class="oculto-visual"></div>
<details class="nota-datos"><summary>¿Y por código QR?</summary><p class="nota">Un QR guarda como mucho unos 3 KB y un respaldo pesa mucho más (con fotos, varios MB), así que no cabe sin un servidor de por medio. Por eso se pasa como archivo.</p></details>
<p class="nota" style="margin-bottom:0">La clave de IA no se incluye: es personal y se pega de nuevo en cada dispositivo.</p></div>`;
export async function clicRespaldo(t){
  if(t.id==='resp-exportar'||t.id==='resp-compartir'){t.disabled=true;
    try{const r=await archivoRespaldo();
      if(t.id==='resp-compartir'){try{await navigator.share({files:[new File([r.blob],r.nombre,{type:'application/octet-stream'})],title:r.nombre})}catch(e){if(e?.name!=='AbortError')descargar(r.blob,r.nombre)}}
      else descargar(r.blob,r.nombre);
      aviso(`💾 Respaldo listo (${kb(r.bytes)}): ${r.notas} notas y ${r.archivos} imágenes`)}
    catch(e){aviso('No se pudo exportar: '+(e.message||e))}
    t.disabled=false;return true}
}
const lineaResumen=x=>`<b>${x.xp.toLocaleString('es-MX')} XP</b> · ${x.notas} notas · ${x.fotos} fotos · ${x.dominadas} dominadas · último uso: ${fechaLarga(x.ultimo)}`;
export function activarImportar(alTerminar){
  const inp=document.getElementById('resp-archivo');if(!inp)return;
  inp.addEventListener('change',async()=>{
    const f=inp.files[0];inp.value='';if(!f)return;
    try{
      const r=await leerRespaldo(f),otro=resumenRespaldo(r),aqui=await resumenLocal();
      const modo=await elegir({titulo:'📥 Importar respaldo',
        texto:`<p>El archivo (del ${fechaLarga(String(r.fecha).slice(0,10))}):<br>${lineaResumen(otro)}</p><p>En este dispositivo:<br>${lineaResumen(aqui)}</p>`,
        opciones:[{valor:'combinar',texto:'🔀 Combinar',clase:'',desc:'Une los dos: lo más nuevo gana y no se pierde ni se duplica nada.'},
          {valor:'reemplazar',texto:'♻️ Reemplazar',clase:'ghost',desc:'Borra lo de este dispositivo y deja solo lo del archivo.'}]});
      if(!modo)return;
      if(modo==='reemplazar'&&!(await confirmar({titulo:'¿Reemplazar todo?',texto:'Se pierde lo que hay en este dispositivo y queda solo lo del archivo.',si:'Sí, reemplazar',peligro:true})))return;
      const x=await aplicarRespaldo(r,{modo});await recargarMias();cache=null;
      aviso(modo==='combinar'?`🔀 Combinado: ${x.notas} notas nuevas o actualizadas y ${x.archivos} imágenes`:`📥 Importado: ${x.notas} notas y ${x.archivos} imágenes`,4000);alTerminar?.();
    }catch(e){aviso(e.message||'No se pudo importar el archivo.',4000)}
  });
}

/* ---------- lista ---------- */
let cache=null,cargando=null,buscar='',filtro='todas',orden='recientes',focoBuscar=false;
try{orden=localStorage.getItem('ciberlab-notas-orden')||'recientes'}catch(e){}
addEventListener('datos-sincronizados',()=>{cache=null});   // llegaron notas de otro dispositivo
function cargar(){
  if(!cargando)cargando=(async()=>{try{await sincronizarResumenes()}catch(e){}cache=await todasLasNotas().catch(()=>[]);cargando=null;repintar()})();
  return cargando;
}
let seleccion=null,escuchaCambio=false; // modo «Seleccionar» de la lista: Set de ids, o null
const nombreNotas=k=>k===1?'1 nota':`${k} notas`;
/* Borra una o varias notas tras confirmar en un diálogo propio (Atrás o Cancelar no borran) y ofrece «Deshacer» 8 s,
   que la restaura completa: texto, fechas, fotos, tarjetas, repasos y enlaces. Devuelve true si se borró. */
async function borrarConConfirmar(lista,alTerminar){
  if(!lista.length)return false;
  const una=lista.length===1,fotos=lista.reduce((s,n)=>s+imagenesDe(n.cuerpo||'').length,0),tj=lista.reduce((s,n)=>s+tarjetasDe(n.cuerpo||'').length,0);
  const extra=[fotos?`${fotos} ${fotos===1?'imagen':'imágenes'}`:'',tj?`${tj} ${tj===1?'tarjeta':'tarjetas'} de Repasar`:''].filter(Boolean).join(' y ');
  const ok=await confirmar({titulo:una?'¿Borrar esta nota?':`¿Borrar ${nombreNotas(lista.length)}?`,
    texto:`${una?`«${esc(lista[0].titulo||'Sin título')}»`:'Las notas elegidas'}${extra?` con sus ${extra}`:''} se ${una?'borra':'borran'} de este teléfono. Podrás deshacerlo unos segundos.`,si:'🗑️ Borrar',peligro:true});
  if(!ok)return false;
  const copia=await borrarNotas(lista);
  if(cache){const ids=new Set(lista.map(n=>n.id));cache=cache.filter(n=>!ids.has(n.id))}
  alTerminar?.();
  avisoAccion(una?'🗑️ Nota borrada':`🗑️ ${nombreNotas(lista.length)} borradas`,'Deshacer',async()=>{
    await restaurarNotas(copia);cache=null;aviso(una?'↩️ Nota restaurada':`↩️ ${nombreNotas(lista.length)} restauradas`);
    document.dispatchEvent(new CustomEvent('notas-cambio'));
  });
  return true;
}
// Fijadas arriba; luego por fecha de edición o de la A a la Z
const ordenar=l=>[...l].sort((a,b)=>(b.fijada-a.fijada)||(orden==='az'?String(a.titulo||'').localeCompare(String(b.titulo||''),'es',{sensitivity:'base'}):b.editada-a.editada));
// Materia (o «🎓 materia propia») de una nota, para su chip de color y el filtro
const materiaDe=n=>{const c=cuadernoDe(n);return c.propia?{id:c.propia.id,nombre:c.propia.nombre,color:c.propia.color}:c.m?{id:c.m.id,nombre:c.m.nombre,tono:c.m.tono||c.area?.tono}:null};
const FILTROS={todas:()=>true,fijadas:n=>n.fijada,formulas:n=>tieneFormulas(n.cuerpo),fotos:n=>imagenesDe(n.cuerpo).length>0,repasar:n=>tarjetasDe(n.cuerpo).length>0};
function filtrar(l){
  const q=normal(buscar.trim());
  return l.filter(n=>(FILTROS[filtro]?FILTROS[filtro](n):filtro.startsWith('m:')?materiaDe(n)?.id===filtro.slice(2):filtro.startsWith('#')&&(n.etiquetas||[]).includes(filtro.slice(1)))
    &&(!q||normal(`${n.titulo} ${n.cuerpo} ${(n.etiquetas||[]).join(' ')} ${cuadernoDe(n).nombre}`).includes(q)));
}
function resumenTexto(n,q){
  const t=vistaPrevia(n.cuerpo);
  if(!q)return t.slice(0,160);
  const i=normal(t).indexOf(normal(q));return i<0?t.slice(0,160):(i>40?'…':'')+t.slice(Math.max(0,i-40),i+120);
}
// «hace 2 h», «ayer», «hace 3 días» o la fecha
export function fechaRelativa(ms){
  const s=(Date.now()-ms)/1000;
  if(s<60)return 'ahora';if(s<3600)return `hace ${Math.floor(s/60)} min`;if(s<86400)return `hace ${Math.floor(s/3600)} h`;
  const d=Math.floor(s/86400);return d===1?'ayer':d<7?`hace ${d} días`:fechaCorta(ms);
}
const chipMateria=n=>{const m=materiaDe(n);if(!m)return `<span class="nota-mat">General</span>`;
  return m.color?`<span class="nota-mat" style="--mat:${esc(m.color)}">🎓 ${esc(m.nombre)}</span>`:`<span class="nota-mat area-${esc(m.tono||'estudio')}">${esc(m.nombre)}</span>`};
const dentroItem=n=>{const nt=tarjetasDe(n.cuerpo).length,nf=imagenesDe(n.cuerpo).length,sel=seleccion?.has(n.id);
  return `<span class="nota-item-cab"><b>${seleccion?`<span aria-hidden="true">${sel?'☑️':'⬜'}</span> `:''}${n.fijada?'<span aria-label="Fijada">📌</span> ':''}${esc(n.titulo||'Sin título')}</b><span class="nota nota-fecha">${fechaRelativa(n.editada)}</span></span>
<span class="nota-item-txt">${esc(resumenTexto(n,buscar))||'<i>Vacía</i>'}</span>
<span class="nota-item-pie">${chipMateria(n)}${nf?`<span class="nota-ico" title="Con foto o dibujo" aria-label="Con foto o dibujo">🖼️</span>`:''}${nt?`<span class="nota-ico" title="${nt} tarjetas de repaso" aria-label="${nt} tarjetas de repaso">🃏 ${nt}</span>`:''}${(n.etiquetas||[]).slice(0,2).map(e=>`<span class="nota-etq">#${esc(e)}</span>`).join('')}</span>`};
const item=n=>{
  if(seleccion)return `<button type="button" class="nota-item${seleccion.has(n.id)?' elegida':''}" data-sel="${esc(n.id)}" aria-pressed="${seleccion.has(n.id)}">${dentroItem(n)}</button>`;
  return `<div class="nota-fila"><button class="nota-item" data-go="notas/n/${esc(n.id)}">${dentroItem(n)}</button><button type="button" class="nota-menu" data-menu="${esc(n.id)}" aria-label="Más opciones de «${esc(n.titulo||'Sin título')}»">⋯</button></div>`};
// Lista de al lado mientras se edita una nota (dos paneles en la laptop y la tablet; en el teléfono no se ve)
const htmlLado=actual=>!cache?'<p class="cargando">Cargando tus notas</p>':`<div class="pila-notas">${ordenar(filtrar(cache)).map(n=>`<button class="nota-item" data-go="notas/n/${esc(n.id)}"${n.id===actual?' aria-current="true"':''}>${dentroItem(n)}</button>`).join('')||'<p class="nota">Nada coincide.</p>'}</div>`;
async function nuevaNota(ir){
  // el cuaderno sale de dónde estabas estudiando (lo último que abriste)
  const u=progreso().ultimo,x=u?analizar(u.ruta):{};
  const n=await crearNota({materia:x.m?.id||null,tema:x.l?.tema||x.t?.id||null});
  if(cache)cache.unshift(n);
  ir(`notas/n/${n.id}`);
}
function htmlLista(){
  if(!cache)return '<p class="cargando">Cargando tus notas</p>';
  if(!cache.length)return vacio({icono:'📝',titulo:'Aún no tienes notas',texto:'Escribe lo que aprendes con fórmulas, listas y fotos, o guarda procedimientos con «📝 Guardar en mis notas» mientras practicas.',
    boton:'<div class="row" style="justify-content:center;flex-wrap:wrap"><button type="button" class="btn" id="nota-nueva-vacia">✏️ Escribir una nota</button><button type="button" class="btn ghost" data-go="notas/foto">📸 Foto a nota</button></div>'});
  const l=ordenar(filtrar(cache));
  if(!l.length)return `<p class="nota" style="text-align:center">${buscar?`Nada coincide con «${esc(buscar)}».`:'No hay notas con este filtro.'}</p>`;
  if(orden!=='cuaderno')return `<div class="pila-notas">${l.map(item).join('')}</div>`;
  // Por cuaderno: área → materia → tema
  const grupos=new Map();
  for(const n of l){const c=cuadernoDe(n),k=`${c.area?.nombre||'General'}`,k2=c.nombre;
    if(!grupos.has(k))grupos.set(k,{icono:c.area?.icono||'🗂️',sub:new Map()});const g=grupos.get(k);
    if(!g.sub.has(k2))g.sub.set(k2,{c,notas:[]});g.sub.get(k2).notas.push(n)}
  return [...grupos].map(([a,g])=>`<h2>${g.icono} ${esc(a)}</h2>${[...g.sub].map(([nombre,{c,notas}])=>`<div class="cuaderno"><div class="cuaderno-cab"><h3>${esc(nombre)}</h3>
${c.t?`<button class="btn ghost btn-chico" data-go="notas/tema/${c.m.id}/${c.t.id}">📚 Resumen</button>`:c.propia?`<button class="btn ghost btn-chico" data-go="mias/${c.propia.id}">🎓 Materia</button>`:''}</div><div class="pila-notas">${notas.map(item).join('')}</div></div>`).join('')}`).join('');
}
// Chips de filtro: Todas, Fijadas, cada materia con notas, Con fórmulas, Con fotos, Para repasar y las etiquetas
function chipsFiltro(){
  const mats=new Map();for(const n of cache||[]){const m=materiaDe(n);if(m&&!mats.has(m.id))mats.set(m.id,m)}
  const etiquetas=[...new Set((cache||[]).flatMap(n=>n.etiquetas||[]))].sort().slice(0,8);
  const fs=[['todas','Todas'],['fijadas','📌 Fijadas'],...[...mats.values()].map(m=>['m:'+m.id,esc(m.nombre)]),['formulas','∑ Con fórmulas'],['fotos','🖼️ Con fotos'],['repasar','🃏 Para repasar'],...etiquetas.map(e=>['#'+e,'#'+esc(e)])];
  if(!fs.some(([v])=>v===filtro))filtro='todas';
  return `<div class="filtros notas-filtros" role="group" aria-label="Filtrar">${fs.map(([v,t])=>`<button type="button" class="chip-filtro" data-filtro="${esc(v)}" aria-pressed="${filtro===v}">${t}</button>`).join('')}</div>`;
}
const htmlBuscar=()=>`<label class="buscar"><span class="oculto-visual">Buscar en tus notas</span><input type="search" id="notas-buscar" placeholder="🔎 Buscar en tus notas" value="${esc(buscar)}" autocomplete="off"></label>`;
function activarBuscar(alCambiar){
  const b=document.getElementById('notas-buscar');if(!b)return;
  b.addEventListener('input',()=>{buscar=b.value;alCambiar()});
  if(focoBuscar){focoBuscar=false;b.focus();b.select()}
}
function vistaLista(){
  const conNotas=()=>!!cache?.length;
  return {
    titulo:'Cuaderno',
    alEntrar(){cache=null;seleccion=null;cargar()},
    vista:()=>`<div class="notas-dos"><div class="panel-principal">
<div class="notas-cab"><h1>Cuaderno</h1><button type="button" class="btn" id="nota-nueva">＋ Nueva nota</button></div>
${enMemoria?'<p class="aviso-linea">⚠️ Este navegador no deja guardar notas: se perderán al cerrar la app (¿modo privado?).</p>':''}
${conNotas()?`${htmlBuscar()}${chipsFiltro()}
${seleccion?`<div class="nota-seleccion" role="region" aria-label="Seleccionar notas"><span id="notas-contador" class="nota" aria-live="polite"><b>${seleccion.size===1?'1 seleccionada':`${seleccion.size} seleccionadas`}</b></span>
<span class="row"><button type="button" class="btn ghost btn-chico" id="sel-todas">Todas</button><button type="button" class="btn ghost btn-chico" id="sel-cancelar">Cancelar</button><button type="button" class="btn ghost btn-chico" id="sel-exportar"${seleccion.size?'':' disabled'}>⤓ Descargar</button><button type="button" class="btn peligro btn-chico" id="sel-borrar"${seleccion.size?'':' disabled'}>🗑️ Borrar</button></span></div>`
:`<div class="notas-herr"><label class="notas-orden"><span class="nota">Ordenar</span><select id="notas-orden" aria-label="Ordenar las notas">${[['recientes','Recientes'],['az','A–Z'],['cuaderno','Por cuaderno']].map(([v,t])=>`<option value="${v}"${orden===v?' selected':''}>${t}</option>`).join('')}</select></label>
<span class="row"><button type="button" class="btn ghost btn-chico" data-go="notas/foto" aria-label="Foto a nota" title="Foto a nota">📸<span class="solo-ancho"> Foto a nota</span></button><button type="button" class="btn ghost btn-chico" id="sel-empezar" aria-label="Seleccionar notas" title="Seleccionar">☑️<span class="solo-ancho"> Seleccionar</span></button></span></div>`}`:''}
<div id="notas-lista">${htmlLista()}</div>
<details class="nota-datos notas-respaldo"><summary>💾 Respaldo de tus notas</summary>${htmlRespaldo()}</details>
${conNotas()&&!seleccion?'<button type="button" class="notas-fab" id="nota-nueva-fab" aria-label="Nueva nota">＋</button>':''}</div>
<div class="panel-vacio solo-dos"><p style="font-size:40px;margin:0" aria-hidden="true">🗒️</p><p>Elige una nota de la lista para verla aquí, o crea una nueva.</p><p class="nota">Ctrl + N nueva nota · Ctrl + K buscar</p></div></div>`,
    alMostrar(){
      activarBuscar(()=>{document.getElementById('notas-lista').innerHTML=htmlLista()});
      document.getElementById('notas-orden')?.addEventListener('change',e=>{orden=e.target.value;try{localStorage.setItem('ciberlab-notas-orden',orden)}catch(x){}repintar()});
      activarImportar(()=>{cargar()});
      if(!escuchaCambio){escuchaCambio=true;document.addEventListener('notas-cambio',()=>{if(document.getElementById('notas-lista')){cache=null;cargar()}})}
      teclasNotas=e=>{const ctrl=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
        if(ctrl&&k==='k'){e.preventDefault();e.stopPropagation();const b=document.getElementById('notas-buscar');b?.focus();b?.select();return}
        if((ctrl||e.altKey)&&k==='n'&&!e.shiftKey){e.preventDefault();e.stopPropagation();nuevaNota(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})))}};
    },
    alSalir(){teclasNotas=null},
    async alClic(t,ir,repintar){
      if(t.dataset.filtro){filtro=t.dataset.filtro;repintar();return true}
      if(t.id==='sel-empezar'){seleccion=new Set();repintar();return true}
      if(t.id==='sel-cancelar'){seleccion=null;repintar();return true}
      if(t.id==='sel-todas'){const vis=ordenar(filtrar(cache||[]));seleccion=vis.every(n=>seleccion.has(n.id))?new Set():new Set(vis.map(n=>n.id));repintar();return true}
      if(t.dataset.sel){const id=t.dataset.sel;seleccion.has(id)?seleccion.delete(id):seleccion.add(id);repintar();return true}
      if(t.id==='sel-exportar'){const l=(cache||[]).filter(n=>seleccion.has(n.id));const {abrirExportar}=await import('./cuaderno/exportar-ui.js');await abrirExportar(l);return true}
      if(t.id==='sel-borrar'){const l=(cache||[]).filter(n=>seleccion.has(n.id));await borrarConConfirmar(l,()=>{seleccion=null});repintar();return true}
      if(t.dataset.menu){const n=(cache||[]).find(x=>x.id===t.dataset.menu);if(!n)return true;
        const r=await menuAcciones({titulo:esc(n.titulo||'Sin título'),opciones:[['abrir','✏️ Abrir'],['exportar','⤓ Descargar o compartir'],['fijar',n.fijada?'📌 Desfijar':'📍 Fijar arriba'],['borrar','🗑️ Borrar','peligro-texto']]});
        if(r==='abrir')ir(`notas/n/${n.id}`);
        else if(r==='exportar'){const {abrirExportar}=await import('./cuaderno/exportar-ui.js');await abrirExportar([n])}
        else if(r==='fijar'){Object.assign(n,await guardar({...n,fijada:!n.fijada},{tocada:false}));repintar()}
        else if(r==='borrar'){await borrarConConfirmar([n]);repintar()}
        return true}
      if(t.id==='nota-nueva'||t.id==='nota-nueva-fab'||t.id==='nota-nueva-vacia'){await nuevaNota(ir);return true}
      return clicRespaldo(t);
    }
  };
}
// Atajos del cuaderno (Ctrl+K, Ctrl+N, Ctrl+B…): los pone la vista que está a la vista; van antes que los globales
let teclasNotas=null;
addEventListener('keydown',e=>{if(teclasNotas&&!document.querySelector('.modal-fondo'))teclasNotas(e)},true);

/* ---------- editor: un solo modo, por bloques ----------
   La nota es el mismo texto de siempre; aquí se ve formateada y cada bloque (párrafo o lista, fórmula $$…$$, foto o
   dibujo) se edita al tocarlo: el bloque activo muestra su texto con marcas (y la vista previa de sus fórmulas) y los
   demás se ven ya formateados. Los bloques se mueven y se borran desde su menú «⋮». Guardado automático. */
// Barra de herramientas: [acción, etiqueta, texto accesible]
const BARRA=[['titulo','H','Título'],['negrita','<b>B</b>','Negrita (Ctrl+B)'],['lista','•','Lista (Ctrl+Shift+8)'],['casilla','☐','Casilla'],
  ['formula','∑','Fórmula (Ctrl+M)'],['imagen','🖼️','Foto o dibujo'],['mas','⋯','Más formato']];
const MAS=[['cursiva','<i>I</i> Cursiva'],['cita','❝ Cita'],['codigo','&lt;/&gt; Código'],['resaltar','🖍️ Resaltar'],['fbloque','∑ Fórmula en bloque'],['numerada','1. Lista numerada'],
  ['tarjeta','🃏 La línea → tarjeta de repaso'],['enlace','🔗 Enlace a una lección'],['dictar-es','🎤 Dictar en español'],['dictar-en','🎤 Dictar en inglés']];
function opcionesCuaderno(n){
  const ops=[['','General']];
  for(const m of materias){ops.push([m.id,m.nombre]);for(const t of m.temas||[])ops.push([`${m.id}|${t.id}`,`${m.nombre} · ${t.titulo}`])}
  for(const m of misMaterias()){ops.push([m.id,`🎓 ${m.nombre}`]);for(const u of m.unidades)for(const t of u.temas)ops.push([`${m.id}|${t.id}`,`🎓 ${m.nombre} · ${t.titulo}`])}
  // si el tema ya no existe, se elige su materia (no «General»)
  let actual=n.materia?(n.tema?`${n.materia}|${n.tema}`:n.materia):'';if(!ops.some(([v])=>v===actual))actual=n.materia||'';
  return ops.map(([v,t])=>`<option value="${esc(v)}"${v===actual?' selected':''}>${esc(t)}</option>`).join('');
}
// Elegir una lección o habilidad para enlazarla
function elegirLeccion(){
  return new Promise(res=>{
    const todas=materias.flatMap(m=>(m.lecciones||[]).map(l=>({m,l,txt:`${m.nombre} · ${l.titulo}`})));
    const f=document.createElement('div');f.className='modal-fondo';
    const lista=q=>todas.filter(x=>!q||normal(x.txt).includes(normal(q))).slice(0,40).map((x,i)=>`<button type="button" class="opcion-enlace" data-i="${todas.indexOf(x)}">${esc(x.txt)}</button>`).join('')||'<p class="nota">Sin resultados.</p>';
    f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="enl-t"><h2 id="enl-t">🔗 Enlazar una lección</h2>
<input type="search" id="enl-buscar" placeholder="Buscar (p. ej. subred, cadena, past)" autocomplete="off"><div class="lista-enlaces" id="enl-lista">${lista('')}</div>
<button type="button" class="btn ghost ancho" data-x>Cancelar</button></div>`;
    const cerrar=v=>{f.remove();res(v)};
    f.addEventListener('click',e=>{const b=e.target.closest('button');if(e.target===f||b?.dataset.x!==undefined)cerrar(null);else if(b?.dataset.i!==undefined)cerrar(todas[+b.dataset.i])});
    f.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar(null)});
    document.body.appendChild(f);const q=f.querySelector('#enl-buscar');q.focus();q.addEventListener('input',()=>{f.querySelector('#enl-lista').innerHTML=lista(q.value)});
  });
}
// Pie de foto (texto corto)
function pedirPie(actual){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='modal-fondo';
    f.innerHTML=`<form class="modal" role="dialog" aria-modal="true" aria-labelledby="pie-t"><h2 id="pie-t" style="margin-top:0">💬 Pie de foto</h2>
<label class="campo">Texto bajo la foto (opcional)<input id="pie-txt" maxlength="120" autocomplete="off" value="${esc(actual)}"></label>
<div class="row"><button type="button" class="btn ghost" data-x>Cancelar</button><button type="submit" class="btn">Guardar</button></div></form>`;
    const cerrar=v=>{f.remove();res(v)};
    f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-x]'))cerrar(null)});
    f.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
    f.querySelector('form').addEventListener('submit',e=>{e.preventDefault();cerrar(f.querySelector('#pie-txt').value.replace(/[\[\]\n]/g,' ').trim())});
    document.body.appendChild(f);f.querySelector('#pie-txt').focus();
  });
}
const usaTeclado=()=>!!document.documentElement.dataset.tecladoFisico||matchMedia('(hover:hover) and (pointer:fine)').matches;
// ¿Algún otro lugar usa esta imagen? (otra nota, u otro bloque de esta)
async function imagenUsada(id,nota,texto){
  if(imagenesDe(texto).includes(id))return true;
  const ns=await todasLasNotas().catch(()=>[]);return ns.some(x=>x.id!==nota&&imagenesDe(x.cuerpo||'').includes(id));
}
const idImagen=t=>t.match(/\(img:([\w-]+)\)/)?.[1];
const altImagen=t=>t.match(/^!\[([^\]]*)\]/)?.[1]||'';

function vistaEditor(id){
  let n=null,modo='editar',estado='',timer=null,pendiente=false,error='';
  let bs=[],act=-1,cursor=null,tfx=false,dib=false,rep=null,urlsBloques=[];
  const caja=()=>document.getElementById('ed-bloques');
  const ta=()=>document.querySelector('#ed-bloques .ed-texto');
  const ponerEstado=e=>{estado=e;const el=document.getElementById('nota-estado');if(el)el.textContent=e};
  async function guardarYa(){
    clearTimeout(timer);if(!pendiente||!n)return;pendiente=false;
    try{n=await guardar(n);ponerEstado('Guardado ✓');
      if(cache){const i=cache.findIndex(x=>x.id===n.id);if(i>=0)cache[i]=n;else cache.unshift(n);pintarLado()}}
    catch(e){pendiente=true;ponerEstado('⚠️ No se pudo guardar')}
  }
  const pintarLado=()=>{const l=document.getElementById('notas-lado');if(l)l.innerHTML=htmlLado(id)};
  const cambio=()=>{pendiente=true;ponerEstado('Guardando…');clearTimeout(timer);timer=setTimeout(guardarYa,600)};
  const deBloques=()=>{n.cuerpo=unirBloques(bs);cambio()};

  /* ---- pintar los bloques ---- */
  const claseTexto=t=>/^#{1,3} [^\n]*$/.test(t)?' ed-h':'';
  const conPrevia=t=>/\$/.test(t);
  const menuBloque=(i,siempre)=>`<button type="button" class="ed-bmenu${siempre?' siempre':''}" data-bmenu="${i}" aria-label="Opciones del bloque: mover o borrar">⋮</button>`;
  function htmlBloque(b,i){
    if(i===act&&b.tipo!=='imagen'){
      const f=b.tipo==='formula';
      return `<div class="ed-bloque activo" data-i="${i}" data-tipo="${b.tipo}"><div class="ed-fila"><textarea class="ed-texto${f?' ed-formula':claseTexto(b.texto)}" rows="1" aria-label="${f?'Fórmula (LaTeX entre $$)':'Texto del bloque'}" spellcheck="${!f}">${esc(b.texto)}</textarea>${menuBloque(i,true)}</div>
<div class="ed-previa nota-render" hidden aria-live="polite"></div></div>`;
    }
    if(b.tipo==='imagen'){const pie=pieDe(altImagen(b.texto)),esDib=altImagen(b.texto)==='dibujo';
      return `<div class="ed-bloque" data-i="${i}" data-tipo="imagen"><figure class="nota-fig"><button type="button" class="ed-img" data-ampliar="${i}" aria-label="${esDib?'Abrir el dibujo para editarlo':'Ampliar la foto'}"><img class="nota-img" data-img="${esc(idImagen(b.texto)||'')}" alt="${esc(pie||'Imagen de la nota')}"></button>${pie?`<figcaption>${esc(pie)}</figcaption>`:''}</figure>${menuBloque(i,true)}</div>`;
    }
    return `<div class="ed-bloque" data-i="${i}" data-tipo="${b.tipo}"><div class="ed-vista nota-render" data-editar="${i}">${render(b.texto,opcTex)||'<p class="nota">(vacío)</p>'}</div>${menuBloque(i,false)}</div>`;
  }
  const htmlBloques=()=>`${bs.map(htmlBloque).join('')}<button type="button" class="ed-final" id="ed-final" aria-label="Escribir al final de la nota">${bs.length?'':'Toca aquí para escribir. Usa la barra para títulos, listas, fórmulas y fotos.'}</button>`;
  function pintarBloques({foco=true}={}){
    const c=caja();if(!c)return;
    c.innerHTML=htmlBloques();
    cargarImagenes(c);
    const t=ta();
    if(t){ajustar(t);if(foco){t.focus({preventScroll:true});const p=cursor??t.value.length;t.setSelectionRange(p[0]??p,p[1]??p);cursor=null;visible(t)}
      t.addEventListener('input',()=>escribir(t));t.addEventListener('keydown',e=>teclaTexto(e,t));t.addEventListener('select',()=>marcarSeleccion());
      t.addEventListener('keyup',()=>{marcarSeleccion();previa(t)});t.addEventListener('pointerup',()=>setTimeout(()=>{marcarSeleccion();previa(t)},0));previa(t)}
    marcarSeleccion();
  }
  const lineaCursor=t=>{const v=t.value,a=t.selectionStart,ini=v.lastIndexOf('\n',a-1)+1,fin=v.indexOf('\n',a);return v.slice(ini,fin<0?v.length:fin)};
  const ajustar=t=>{t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px'};
  // que el cursor no quede detrás de la barra de herramientas (teléfono, con el teclado abierto)
  function visible(t){
    const barra=document.querySelector('.ed-herr');if(!barra||getComputedStyle(barra).position!=='fixed')return;
    const r=t.getBoundingClientRect(),lineas=t.value.split('\n'),antes=t.value.slice(0,t.selectionStart).split('\n').length;
    const y=r.top+r.height*antes/Math.max(1,lineas.length),tope=barra.getBoundingClientRect().top-12;
    if(y>tope)window.scrollBy(0,y-tope+24);else if(y<80)window.scrollBy(0,y-100);
  }
  let tPrevia=null;
  function escribir(t){
    const i=act;if(i<0||!bs[i])return;bs[i].texto=t.value;deBloques();ajustar(t);visible(t);
    if(bs[i].tipo==='texto'){t.classList.toggle('ed-h',/^#{1,3} [^\n]*$/.test(t.value))}
    previa(t);
  }
  // Vista previa de las fórmulas mientras se escribe: la fórmula en bloque completa; en un texto, la línea del cursor
  function previa(t){
    clearTimeout(tPrevia);tPrevia=setTimeout(()=>{const pv=t.closest('.ed-bloque')?.querySelector('.ed-previa');if(!pv)return;
      const linea=lineaCursor(t),txt=bs[act]?.tipo==='formula'?t.value:conPrevia(linea)?linea:'';pv.hidden=!txt.trim();pv.innerHTML=txt.trim()?render(txt,opcTex):''},100);
  }
  // Enter sigue la lista (- , 1. , - [ ] , >); en una línea de lista vacía, la termina
  function teclaTexto(e,t){
    if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&t.selectionStart===t.selectionEnd){
      const v=t.value,a=t.selectionStart,ini=v.lastIndexOf('\n',a-1)+1,linea=v.slice(ini,a),m=linea.match(/^(\s*)([-*] \[[ xX]\] |\[[ xX]\] |[-*] |(\d+)([.)]) |> )(.*)$/);
      if(!m)return;
      e.preventDefault();
      if(!m[5].trim()){t.setRangeText('',ini,a,'end');}
      else{const sig=m[3]?`${+m[3]+1}${m[4]} `:m[2].replace(/\[[xX]\]/,'[ ]');t.setRangeText('\n'+m[1]+sig,a,a,'end')}
      escribir(t);
    }
    if(e.key==='Backspace'&&!t.value&&act>0){e.preventDefault();bs.splice(act,1);const p=act-1;act=-1;deBloques();if(bs[p]&&bs[p].tipo!=='imagen')activar(p);else pintarBloques()}
  }
  /* ---- activar y soltar un bloque ---- */
  function soltar(){
    if(act<0)return;
    const b=bs[act];
    if(b&&b.tipo!=='imagen'){const nuevos=bloques(b.texto);bs.splice(act,1,...nuevos)}
    act=-1;deBloques();
  }
  function activar(i,pos){
    if(i===act&&ta()){if(pos!=null){const t=ta();t.focus();t.setSelectionRange(pos,pos)}return}
    const id0=bs[i];soltar();i=bs.indexOf(id0);if(i<0)i=Math.min(bs.length-1,i);
    if(i<0||!bs[i]||bs[i].tipo==='imagen'){act=-1;pintarBloques();return}
    act=i;cursor=pos??bs[i].texto.length;pintarBloques();
  }
  // El bloque de texto donde va lo que se escriba con la barra: el activo, o uno nuevo al final
  function bloqueTexto(){
    if(act>=0&&bs[act]?.tipo!=='imagen'&&ta())return ta();
    const u=bs[bs.length-1];
    if(u&&u.tipo==='texto'){activar(bs.length-1);return ta()}
    soltar();bs.push({tipo:'texto',texto:''});act=bs.length-1;cursor=0;pintarBloques();return ta();
  }
  function editar(fn){
    const t=bloqueTexto();if(!t)return;
    const {value:v,selectionStart:a,selectionEnd:b}=t,[nuevo,s0,s1]=fn(v,a,b);
    t.value=nuevo;t.focus();t.setSelectionRange(s0,s1);escribir(t);
  }
  const envolver=(pre,post=pre,ejemplo='texto')=>editar((v,a,b)=>{const sel=v.slice(a,b)||ejemplo;return [v.slice(0,a)+pre+sel+post+v.slice(b),a+pre.length,a+pre.length+sel.length]});
  const prefijo=pre=>editar((v,a,b)=>{
    const ini=v.lastIndexOf('\n',a-1)+1,finL=v.indexOf('\n',b),fin=finL<0?v.length:finL;
    const lineas=v.slice(ini,fin).split('\n'),todas=lineas.every(l=>l.startsWith(pre));
    const nuevas=lineas.map((l,k)=>todas?l.slice(pre.length):(pre==='1. '?`${k+1}. `:pre)+l.replace(/^(#+ |[-*] \[[ xX]\] |[-*] |> |\d+[.)] )/,'')).join('\n');
    return [v.slice(0,ini)+nuevas+v.slice(fin),ini+nuevas.length,ini+nuevas.length];
  });
  const insertar=txt=>editar((v,a,b)=>[v.slice(0,a)+txt+v.slice(b),a+txt.length,a+txt.length]);
  function tarjetaLinea(){editar((v,a,b)=>{
    const ini=v.lastIndexOf('\n',a-1)+1,finL=v.indexOf('\n',a),fin=finL<0?v.length:finL;let l=v.slice(ini,fin);
    if(l.startsWith(TARJETA)){aviso('Esa línea ya es una tarjeta.');return [v,a,b]}
    l=l.replace(/^(#+ |[-*] \[[ xX]\] |[-*] |> |\d+[.)] )/,'');
    const conRespuesta=l.includes('|'),nueva=`${TARJETA} ${l||'¿Pregunta?'}${conRespuesta?'':' | '}`;
    aviso(conRespuesta?'🃏 Tarjeta creada: entra a Repasar hoy.':'🃏 Escribe la respuesta después de « | ».');
    return [v.slice(0,ini)+nueva+v.slice(fin),ini+nueva.length,ini+nueva.length];
  })}
  // Bloques nuevos (foto, dibujo, fórmula) van después del activo, o al final
  function insertarBloque(b){const p=act>=0?act:bs.length-1;soltar();const i=Math.min(bs.length,p+1);bs.splice(i,0,b);return i}
  function mover(i,d){const j=i+d;if(j<0||j>=bs.length)return;const ac=bs[act];soltar();const a=bs[i];bs.splice(i,1);bs.splice(j,0,a);deBloques();
    act=-1;pintarBloques({foco:false});const el=caja()?.querySelector(`[data-i="${j}"]`);el?.scrollIntoView({block:'nearest'});el?.classList.add('movido');setTimeout(()=>el?.classList.remove('movido'),600);if(ac&&ac===a)activar(j)}
  async function borrarBloque(i){
    const b=bs[i];if(!b)return;soltar();const j=bs.indexOf(b);if(j<0)return;bs.splice(j,1);deBloques();pintarBloques({foco:false});
    avisoAccion('🗑️ Bloque borrado','Deshacer',()=>{bs.splice(Math.min(j,bs.length),0,b);deBloques();pintarBloques({foco:false})});
  }
  /* ---- fotos y dibujos ---- */
  async function foto(file){
    if(!file)return;ponerEstado('Procesando la foto…');
    try{const img=await comprimirFoto(file),marca=await guardarImagen(n.id,img,'foto');const i=insertarBloque({tipo:'imagen',texto:marca});deBloques();pintarBloques({foco:false});
      caja()?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({block:'nearest'});aviso(`📷 Foto guardada (${Math.round(img.blob.size/1024)} KB)`)}
    catch(e){aviso(e.message||'No se pudo guardar la foto.');ponerEstado('')}
  }
  /* ✏️ Dibujo: editor a pantalla completa (dibujo/editor.js). Se guarda como un archivo nuevo (PNG para verlo en la nota +
     el dibujo en vectores para volver a editarlo); el anterior se borra si nadie más lo usa. Mientras dibujas se guarda un
     borrador cada pocos segundos: si la app se cierra de golpe, al volver a la nota se ofrece recuperarlo. */
  async function abrirDibujo(i=null,{recuperado=null}={}){
    if(dib||!n)return;dib=true;soltar();await guardarYa();
    const a=i!==null?await leerArchivo(idImagen(bs[i]?.texto||'')).catch(()=>null):null,nuevas=[];
    let dibujo=recuperado||(a?migrarDibujo(a):null);
    // dibujo de antes de los vectores (solo PNG): queda como imagen fija para escribir encima
    if(a&&!recuperado&&!a.dibujo&&!a.trazos&&a.blob){
      const id=nuevoId(),ancho=Math.round(Math.min(720,a.ancho/Math.min(3,window.devicePixelRatio||1))),alto=Math.round(ancho*a.alto/a.ancho);
      await guardarArchivo({id,nota:n.id,blob:a.blob,tipo:a.tipo||'image/png',ancho:a.ancho,alto:a.alto,creada:Date.now()});nuevas.push(id);
      dibujo={...dibujo,ancho,alto,objetos:[{t:'imagen',id:nuevoIdObj(),x:0,y:0,w:ancho,h:alto,archivo:id,fija:true}]};
    }
    const para=a?.id||'nuevo';
    const r=await abrirEditorDibujo({dibujo,titulo:n.titulo||'Dibujo',nuevo:!a&&!recuperado,
      cargarImagen:async id=>(await leerArchivo(id).catch(()=>null))?.blob||null,
      nuevaImagen:async img=>{const id=nuevoId();await guardarArchivo({id,nota:n.id,blob:img.blob,tipo:img.blob.type||'image/jpeg',ancho:img.ancho,alto:img.alto,creada:Date.now()});nuevas.push(id);return id},
      autoguardar:x=>guardarBorradorDibujo({nota:n.id,para,dibujo:x}).catch(()=>{})});
    dib=false;
    try{
      if(r.cambiado&&r.png){
        const nuevo=nuevoId(),{blob,ancho,alto}=r.png;
        await guardarArchivo({id:nuevo,nota:n.id,blob,tipo:'image/png',ancho,alto,creada:Date.now(),dibujo:r.dibujo});
        const j=a?bs.findIndex(x=>idImagen(x.texto||'')===a.id):-1;
        if(j>=0)bs[j]={tipo:'imagen',texto:`![dibujo](img:${nuevo})`};else insertarBloque({tipo:'imagen',texto:`![dibujo](img:${nuevo})`});
        deBloques();await guardarYa();
        if(a&&!(await imagenUsada(a.id,n.id,n.cuerpo)))await borrarArchivo(a.id).catch(()=>{});
        aviso('✏️ Dibujo guardado');
      }else if(r.cambiado&&a){const j=bs.findIndex(x=>idImagen(x.texto||'')===a.id);if(j>=0)borrarBloque(j)}
      else if(r.vistaCambio&&a&&!nuevas.length)await guardarArchivo({...a,dibujo:r.dibujo});
      // las imágenes que el dibujo ya no usa (ni puede devolver al deshacer)
      const usadas=new Set(imagenesDibujo(r.dibujo)),antes=a?imagenesDibujo(migrarDibujo(a)):[];
      for(const id of new Set([...antes,...nuevas]))if((!usadas.has(id)||!r.cambiado&&nuevas.includes(id))&&!(await imagenUsada(id,n.id,n.cuerpo)))await borrarArchivo(id).catch(()=>{});
    }catch(e){aviso('No se pudo guardar el dibujo.')}
    await borrarBorradorDibujo(n.id).catch(()=>{});
    pintarBloques({foco:false});
  }
  async function ofrecerBorrador(){
    const b=await leerBorradorDibujo(n.id).catch(()=>null);if(!b?.dibujo)return;
    const i=b.para==='nuevo'?null:bs.findIndex(x=>idImagen(x.texto||'')===b.para);
    avisoAccion('✏️ Hay un dibujo sin guardar','Recuperar',()=>abrirDibujo(i===-1?null:i,{recuperado:b.dibujo}),10000);
  }
  async function recortar(i){
    const a=await leerArchivo(idImagen(bs[i].texto)).catch(()=>null);if(!a?.blob)return;
    const r=await editarFoto(a.blob);if(!r)return;
    const marca=await guardarImagen(n.id,r,altImagen(bs[i].texto)||'foto'),viejo=a.id;bs[i]={tipo:'imagen',texto:marca};deBloques();
    if(!(await imagenUsada(viejo,n.id,n.cuerpo)))await borrarArchivo(viejo).catch(()=>{});
    pintarBloques({foco:false});aviso('✂️ Foto actualizada');
  }
  async function ampliar(i){if(altImagen(bs[i]?.texto||'')==='dibujo'){abrirDibujo(i);return}const a=await leerArchivo(idImagen(bs[i]?.texto||'')).catch(()=>null);if(!a?.blob)return;
    const u=URL.createObjectURL(a.blob);urlsBloques.push(u);abrirVisor(u,pieDe(altImagen(bs[i].texto)))}
  async function menuDe(i){
    const b=bs[i];if(!b)return;const img=b.tipo==='imagen',a=img?await leerArchivo(idImagen(b.texto)).catch(()=>null):null;
    const ops=[...(i>0?[['subir','↑ Subir']]:[]),...(i<bs.length-1?[['bajar','↓ Bajar']]:[]),
      ...(img?(a?.dibujo||a?.trazos||altImagen(b.texto)==='dibujo'?[['dibujo','✏️ Editar el dibujo']]:[['recortar','✂️ Recortar o girar'],['pie','💬 Pie de foto']]):[['editar',b.tipo==='formula'?'∑ Editar la fórmula':'✏️ Editar']]),
      ['borrar','🗑️ Borrar el bloque','peligro-texto']];
    const r=await menuAcciones({titulo:img?(a?.dibujo||a?.trazos||altImagen(b.texto)==='dibujo'?'Dibujo':'Foto'):b.tipo==='formula'?'Fórmula':'Bloque de texto',opciones:ops});
    if(r==='subir')mover(i,-1);if(r==='bajar')mover(i,1);if(r==='borrar')borrarBloque(i);if(r==='editar')activar(i);
    if(r==='dibujo')abrirDibujo(i);if(r==='recortar')recortar(i);
    if(r==='pie'){const p=await pedirPie(pieDe(altImagen(b.texto)));if(p!==null){bs[i]={tipo:'imagen',texto:b.texto.replace(/^!\[[^\]]*\]/,`![${p||'foto'}]`)};deBloques();pintarBloques({foco:false})}}
  }
  /* ---- 🃏 tarjeta desde lo seleccionado ---- */
  const seleccionado=()=>{const t=ta();if(t&&document.activeElement===t&&t.selectionEnd>t.selectionStart)return t.value.slice(t.selectionStart,t.selectionEnd);
    const s=getSelection();return s&&!s.isCollapsed&&s.anchorNode&&document.querySelector('.nota-render')?.closest('.ed')?.contains(s.anchorNode)?String(s).trim():''};
  function marcarSeleccion(){const b=document.getElementById('ed-tarjeta-sel');if(b)b.hidden=!seleccionado().trim()}
  async function tarjetaDeSeleccion(){
    const sel=seleccionado().replace(/\$/g,'').trim();const r=await pedirTarjeta(sel.slice(0,200));if(!r)return;
    soltar();bs.push({tipo:'texto',texto:`${TARJETA} ${r.q} | ${r.a}`});deBloques();await guardarYa();
    if(modo==='editar')pintarBloques({foco:false});else repintar();aviso('🃏 Tarjeta creada: entra a Repasar hoy.');
  }
  async function dictar(idioma,boton){
    if(!soporte.escuchar){aviso('Tu navegador no reconoce la voz. Usa Chrome en Android.',3500);return}
    const t=bloqueTexto();boton?.classList.add('grabando');aviso(idioma==='en-US'?'🎤 Habla en inglés…':'🎤 Habla…');
    try{const r=await escuchar({idioma,alternativas:1,maxSegundos:30});t.focus();insertar(r.transcripcion+' ')}
    catch(e){aviso(e.message||'No se entendió. Intenta de nuevo.')}
    boton?.classList.remove('grabando');
  }
  const accion=async(f,boton)=>{
    const tabla={negrita:()=>envolver('**'),cursiva:()=>envolver('*'),resaltar:()=>envolver('==','==','importante'),codigo:()=>envolver('`','`','código'),
      formula:()=>{const t=bloqueTexto();const v=t.value,a=t.selectionStart,dentro=(v.slice(0,a).match(/\$/g)||[]).length%2===1;
        if(!dentro)envolver('$','$','x^2');if(!usaTeclado()){tfx=true;pintarTfx()}},
      fbloque:()=>{const i=insertarBloque({tipo:'formula',texto:'$$ x^2 $$'});act=i;cursor=[3,6];pintarBloques();if(!usaTeclado()){tfx=true;pintarTfx()}},
      titulo:()=>prefijo('## '),lista:()=>prefijo('- '),numerada:()=>prefijo('1. '),casilla:()=>prefijo('- [ ] '),cita:()=>prefijo('> '),tarjeta:tarjetaLinea,
      imagen:async()=>{const r=await menuAcciones({titulo:'Agregar a la nota',opciones:[['camara','📷 Tomar foto'],['galeria','🖼️ Foto de la galería'],['dibujo','✏️ Dibujo']]});
        if(r==='camara')document.getElementById('nota-camara').click();if(r==='galeria')document.getElementById('nota-galeria').click();if(r==='dibujo')abrirDibujo()},
      camara:()=>document.getElementById('nota-camara').click(),galeria:()=>document.getElementById('nota-galeria').click(),dibujo:()=>abrirDibujo(),
      mas:async()=>{const r=await menuAcciones({titulo:'Más formato',opciones:MAS});if(r)accion(r,boton)},
      'dictar-es':()=>dictar('es-MX',boton),'dictar-en':()=>dictar('en-US',boton),
      enlace:async()=>{const x=await elegirLeccion();if(x)insertar(`[${x.l.titulo}](#${rutaLeccion(x.m,x.l)})`)}};
    await tabla[f]?.();
  };
  function pintarTfx(){const el=document.getElementById('ed-tfx');if(el)el.hidden=!tfx;document.body.classList.toggle('con-tfx',tfx)}
  /* ---- repasar las tarjetas de la nota ---- */
  function htmlRepasar(){
    const tj=tarjetasDe(n.cuerpo);
    if(!tj.length)return `<div class="ed-repaso">${vacio({icono:'🃏',titulo:'Esta nota no tiene tarjetas',texto:'Selecciona un texto y toca «🃏 Crear tarjeta», o escribe una línea así: <code>🃏 pregunta | respuesta</code>.',boton:'<button type="button" class="btn ghost" id="rep-tapar">🫣 Tapar las negritas</button>'})}</div>`;
    if(!rep)rep={i:0,ver:false,hechas:0};
    if(rep.i>=tj.length)return `<div class="ed-repaso">${vacio({icono:'🎉',titulo:`¡Repasaste ${tj.length} ${tj.length===1?'tarjeta':'tarjetas'}!`,texto:'Volverán a Repasar cuando toque recordarlas.',boton:'<button type="button" class="btn" id="rep-otra">🔁 Otra vuelta</button>'})}</div>`;
    const x=tj[rep.i];
    return `<div class="ed-repaso"><p class="nota">Tarjeta ${rep.i+1} de ${tj.length}</p>
<div class="ed-tarjeta"><div class="ed-tarjeta-q nota-render">${enLinea(x.q,opcTex)}</div>${rep.ver?`<hr><div class="ed-tarjeta-a nota-render">${enLinea(x.a,opcTex)}</div>`:''}</div>
${rep.ver?`<div class="ed-calif" role="group" aria-label="¿Qué tan bien la recordaste?"><button type="button" class="btn ghost" data-calif="1">Otra vez <kbd>1</kbd></button><button type="button" class="btn" data-calif="2">Bien <kbd>2</kbd></button><button type="button" class="btn ghost" data-calif="3">Fácil <kbd>3</kbd></button></div>`
:`<button type="button" class="btn ancho" id="rep-mostrar">Mostrar respuesta <kbd>Espacio</kbd></button>`}</div>`;
  }
  function calificar(c){
    const tj=tarjetasDe(n.cuerpo),x=tj[rep?.i];if(!x||!rep.ver)return;
    responderRepaso(refTarjeta(n.materia,idTarjeta(n.id,x.q,x.a)),c>1,{ms:c===3?0:60000});
    rep={i:rep.i+1,ver:false,hechas:rep.hechas+1};repintar();
  }
  /* ---- atajos ---- */
  function teclas(e){
    const ctrl=e.ctrlKey||e.metaKey,k=e.key.toLowerCase(),enCampo=e.target.closest?.('input,select,textarea');
    const hecho=()=>{e.preventDefault();e.stopPropagation()};
    if(modo==='repasar'&&!enCampo&&!ctrl){
      if(e.key===' '&&document.getElementById('rep-mostrar')){hecho();rep.ver=true;repintar();return}
      if(['1','2','3'].includes(e.key)&&rep?.ver){hecho();calificar(+e.key);return}
    }
    if(ctrl&&k==='k'){hecho();const b=document.getElementById('notas-buscar');if(b&&b.offsetParent){b.focus();b.select()}else{focoBuscar=true;document.dispatchEvent(new CustomEvent('ir',{detail:'notas'}))}return}
    if((ctrl||e.altKey)&&k==='n'&&!e.shiftKey){hecho();(async()=>{await guardarYa();nuevaNota(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})))})();return}
    if(modo!=='editar')return;
    if(ctrl&&!e.shiftKey&&k==='b'){hecho();accion('negrita');return}
    if(ctrl&&!e.shiftKey&&k==='i'&&enCampo?.classList.contains('ed-texto')){hecho();accion('cursiva');return}
    if(ctrl&&e.shiftKey&&(e.code==='Digit8'||e.key==='*')){hecho();accion('lista');return}
    if(ctrl&&k==='m'){hecho();accion('formula');return}
    if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')&&act>=0){hecho();mover(act,e.key==='ArrowUp'?-1:1);return}
    if(e.key==='Escape'&&!document.querySelector('#procedimiento')){
      if(tfx){hecho();tfx=false;pintarTfx();return}
      if(act>=0){hecho();soltar();pintarBloques({foco:false});return}
      if(!enCampo||enCampo.id==='nota-titulo'){hecho();guardarYa().then(()=>document.dispatchEvent(new CustomEvent('ir',{detail:'notas'})))}
    }
  }
  const textoMarkdown=async()=>{let t=`# ${n.titulo||'Nota'}\n\n${n.cuerpo}`;
    for(const i of imagenesDe(n.cuerpo)){const a=await leerArchivo(i).catch(()=>null);if(a?.blob){const d=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(a.blob)});t=t.split(`img:${i}`).join(d)}}
    return t};
  // teclado en pantalla: la barra queda justo encima (visualViewport)
  const teclado=()=>{const vv=window.visualViewport;if(!vv)return;const alto=Math.max(0,innerHeight-vv.height-vv.offsetTop);document.documentElement.style.setProperty('--teclado',alto+'px')};
  const alSel=()=>marcarSeleccion();
  return {
    titulo:'Nota',
    alEntrar(){
      modo='editar';n=null;error='';bs=[];act=-1;dib=false;rep=null;tfx=false;document.body.classList.add('editando-nota');
      if(!cache)todasLasNotas().then(l=>{cache=cache||l;pintarLado()}).catch(()=>{});
      leerNota(id).then(x=>{if(!x)error='Esa nota no existe (quizá la borraste).';n=x||null;if(n){bs=bloques(n.cuerpo);ofrecerBorrador()}repintar()}).catch(()=>{error='No se pudo abrir la nota.';repintar()});
      window.visualViewport?.addEventListener('resize',teclado);window.visualViewport?.addEventListener('scroll',teclado);
      document.addEventListener('selectionchange',alSel);teclasNotas=teclas;
    },
    alSalir(){soltar();guardarYa();document.body.classList.remove('editando-nota','con-tfx');document.documentElement.style.removeProperty('--teclado');
      window.visualViewport?.removeEventListener('resize',teclado);window.visualViewport?.removeEventListener('scroll',teclado);document.removeEventListener('selectionchange',alSel);teclasNotas=null;
      urls.forEach(u=>URL.revokeObjectURL(u));urls=[];urlsBloques.forEach(u=>URL.revokeObjectURL(u));urlsBloques=[]},
    vista(){
      const lado=`<aside class="panel-lista" aria-label="Tus notas"><div class="notas-cab"><h2>Cuaderno</h2><button type="button" class="btn btn-chico" id="nota-nueva">＋ Nueva</button></div>${htmlBuscar()}<div id="notas-lado">${htmlLado(id)}</div></aside>`;
      return `<div class="notas-dos">${lado}<div class="panel-detalle">${this.detalle()}</div></div>`;
    },
    detalle(){
      if(error)return vacio({icono:'🗒️',titulo:error,boton:'<button class="btn" data-go="notas">Ver mis notas</button>'});
      if(!n)return '<p class="cargando">Abriendo la nota</p>';
      const nt=tarjetasDe(n.cuerpo).length;
      const cab=`<div class="nota-cab ed-cab"><button type="button" class="btn-icono" data-go="notas" aria-label="Volver a mis notas">←</button><span id="nota-estado" class="nota ed-estado" aria-live="polite">${estado}</span>
<span class="ed-cab-der">${modo==='editar'?`<button type="button" class="btn-icono" id="nota-leer" aria-label="Modo lectura" title="Modo lectura">👁️</button>`:`<button type="button" class="btn-icono" id="nota-editar" aria-label="Editar la nota" title="Editar">✏️</button>`}
<button type="button" class="btn-icono" id="nota-repasar" aria-label="Repasar las tarjetas de esta nota" title="Repasar${nt?` (${nt})`:''}" aria-pressed="${modo==='repasar'}">🧠</button>
<button type="button" class="btn-icono" id="nota-exportar" aria-label="Descargar o compartir" title="Descargar o compartir">⤓</button>
<button type="button" class="btn-icono" id="nota-mas" aria-label="Más: fijar, descargar, compartir, borrar">⋯</button></span></div>`;
      const meta=`<div class="ed-meta"><label class="ed-meta-cuaderno"><span class="oculto-visual">Cuaderno</span><select id="nota-cuaderno" aria-label="Materia o tema de la nota">${opcionesCuaderno(n)}</select></label>
<label class="ed-meta-etq"><span aria-hidden="true">#</span><input id="nota-etiquetas" value="${esc((n.etiquetas||[]).join(', '))}" placeholder="etiquetas" aria-label="Etiquetas, separadas por comas" autocomplete="off"></label>
<span class="nota">${n.fijada?'📌 · ':''}${fechaRelativa(n.editada)}</span></div>`;
      if(modo==='editar')return `<div class="ed">${cab}
<input id="nota-titulo" class="nota-titulo" placeholder="Título" value="${esc(n.titulo)}" aria-label="Título de la nota" autocomplete="off" enterkeyhint="next">
${meta}
<div class="ed-herr">${htmlTecladoFormulas()}<div class="ed-barra" role="toolbar" aria-label="Formato"><button type="button" id="ed-tarjeta-sel" class="ed-tsel" data-fmt="tarjeta-sel" hidden aria-label="Crear tarjeta de repaso con lo seleccionado">🃏 Tarjeta</button>${BARRA.map(([a,e,t])=>`<button type="button" data-fmt="${a}" aria-label="${t}" title="${t}">${e}</button>`).join('')}</div></div>
<div id="ed-bloques" class="ed-bloques">${htmlBloques()}</div>
<input type="file" id="nota-camara" accept="image/*" capture="environment" class="oculto-visual" tabindex="-1">
<input type="file" id="nota-galeria" accept="image/*" class="oculto-visual" tabindex="-1"></div>`;
      if(modo==='repasar')return `<div class="ed">${cab}<h1 class="ed-titulo-leer">${esc(n.titulo||'Sin título')}</h1>${htmlRepasar()}</div>`;
      const html=render(n.cuerpo,{...opcTex,repasar:modo==='tapar'});
      return `<div class="ed nota-imprimir">${cab}<h1 class="ed-titulo-leer">${esc(n.titulo||'Sin título')}</h1>
${modo==='tapar'?'<p class="intro">Las palabras en negrita están tapadas: intenta recordarlas y toca para comprobar.</p>':''}
<article class="nota-render nota-leer">${html||'<p class="nota">La nota está vacía.</p>'}</article>
<button type="button" id="ed-tarjeta-sel" class="btn ed-tsel-flota" data-fmt="tarjeta-sel" hidden>🃏 Crear tarjeta</button>
${modo==='tapar'?'<button type="button" class="btn ghost ancho" id="nota-destapar">Destapar todo</button>':`<div class="row hoja-acciones nota-compartir">
<button type="button" class="btn ghost btn-chico" id="nota-compartir">📤 Compartir</button><button type="button" class="btn btn-chico" id="nota-exportar">⤓ Descargar o compartir</button></div>`}</div>`;
    },
    alMostrar(){
      activarBuscar(pintarLado);
      if(!n)return;
      const t=document.getElementById('nota-titulo');
      t?.addEventListener('input',()=>{n.titulo=t.value;cambio()});
      t?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activar(bs.findIndex(b=>b.tipo!=='imagen')>=0?bs.findIndex(b=>b.tipo!=='imagen'):(bs.push({tipo:'texto',texto:''}),bs.length-1),0)}});
      document.getElementById('nota-cuaderno')?.addEventListener('change',e=>{const [m,tm]=e.target.value.split('|');n.materia=m||null;n.tema=tm||null;cambio()});
      document.getElementById('nota-etiquetas')?.addEventListener('input',e=>{n.etiquetas=[...new Set(e.target.value.split(',').map(x=>x.trim().replace(/^#/,'')).filter(Boolean))].slice(0,10);cambio()});
      for(const idInp of ['nota-camara','nota-galeria'])document.getElementById(idInp)?.addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';foto(f)});
      // la barra y los símbolos no le quitan el foco al texto (así el teclado del teléfono no se cierra)
      for(const s of ['.ed-barra','#ed-tfx'])document.querySelector(s)?.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
      document.getElementById('ed-tfx')?.addEventListener('click',async e=>{const b=e.target.closest('[data-tfx]');if(!b)return;
        if(b.dataset.tfx==='cerrar'){tfx=false;pintarTfx();return}
        let [,txt,atras]=SIMBOLOS[+b.dataset.tfx],t=bloqueTexto();const v=t.value,a=t.selectionStart,b0=t.selectionEnd;
        // ▦ Matriz: tamaño, paréntesis y celdas en una cuadrícula; se escribe el LaTeX (nadie escribe & ni \ a mano)
        if(txt==='matriz'){const r=await dialogoMatriz({titulo:'▦ Matriz',inicial:{celdas:[['',''],['','']],paren:'[]',aumentada:null},sistema:true});if(!r)return;
          txt=aLatex(r.celdas,{paren:r.paren,aumentada:r.aumentada});const t3=ta();if(!t3)return;t3.focus();t3.setSelectionRange(a,b0)}
        if(bs[act]?.tipo!=='formula'&&(v.slice(0,a).match(/\$/g)||[]).length%2===0){envolver('$','$','');}
        const t2=ta(),p=t2.selectionStart;t2.setRangeText(txt,p,t2.selectionEnd,'end');const q=t2.selectionStart-atras;t2.setSelectionRange(q,q);escribir(t2)});
      // tocar un bloque formateado lo edita, con el cursor cerca de donde se tocó (o dentro de la fórmula tocada)
      caja()?.addEventListener('click',e=>{
        if(e.target.closest('a,button:not(.ed-final),input,textarea'))return;
        const v=e.target.closest('[data-editar]');
        if(v){const i=+v.dataset.editar,f=bs[i]?.texto||'';
          const k=e.target.closest('.katex');if(k){const todas=[...v.querySelectorAll('.katex')].filter(x=>!x.closest('.katex-display'));const nIdx=todas.indexOf(k);
            const ms=[...f.matchAll(/\$\$?([^$]+)\$\$?/g)];const m=bs[i].tipo==='formula'?ms[0]:ms.filter(x=>!x[0].startsWith('$$'))[nIdx]||ms[0];
            if(m){const ini=m.index+(m[0].startsWith('$$')?2:1);activar(i,ini);const t=ta();t?.setSelectionRange(ini,ini+m[1].length);
              // una matriz se vuelve a abrir en su cuadrícula para editarla
              const mz=deLatex(m[1]);if(mz){dialogoMatriz({titulo:'▦ Editar la matriz',inicial:mz,boton:'Guardar'}).then(r=>{const t2=ta();if(!r||!t2)return;t2.focus();t2.setRangeText(aLatex(r.celdas,{paren:r.paren,aumentada:r.aumentada}),ini,ini+m[1].length,'end');escribir(t2)})}
              return}}
          activar(i,cursorDesde(e,f));return}
      });
      caja()?.addEventListener('click',e=>{if(e.target.closest('#ed-final')){
        const u=bs[bs.length-1];if(u?.tipo==='texto')activar(bs.length-1);else{soltar();bs.push({tipo:'texto',texto:''});act=bs.length-1;cursor=0;pintarBloques()}}});
      // al salir de un bloque (tocar fuera), se formatea
      document.querySelector('.ed')?.addEventListener('focusout',e=>{
        setTimeout(()=>{const a=document.activeElement;if(act<0||dib||document.querySelector('.modal-fondo'))return;
          if(!a||a===document.body||(!caja()?.contains(a)&&!a.closest('.ed-barra,#ed-tfx'))){soltar();pintarBloques({foco:false})}},150)});
      if(modo==='editar'){pintarTfx();cargarImagenes(caja());const t2=ta();if(t2){ajustar(t2);t2.addEventListener('input',()=>escribir(t2));t2.addEventListener('keydown',ev=>teclaTexto(ev,t2))}
        if(!n.cuerpo&&!n.titulo)t?.focus()}
      else cargarImagenes(document.querySelector('.nota-render'));
    },
    async alClic(b,ir,repintarV){
      if(b.id==='nota-nueva'){await guardarYa();await nuevaNota(ir);return true}
      if(!n)return;
      if(b.id==='nota-leer'||b.id==='nota-editar'||b.id==='nota-repasar'||b.id==='rep-tapar'){
        soltar();await guardarYa();
        modo=b.id==='nota-leer'?'leer':b.id==='nota-editar'?'editar':b.id==='rep-tapar'?'tapar':modo==='repasar'?'editar':'repasar';rep=null;tfx=false;repintarV();window.scrollTo(0,0);return true}
      if(b.id==='rep-mostrar'){rep.ver=true;repintarV();return true}
      if(b.dataset.calif){calificar(+b.dataset.calif);return true}
      if(b.id==='rep-otra'){rep=null;repintarV();return true}
      if(b.dataset.casilla!==undefined){const bl=b.closest('.ed-bloque');
        if(bl){const i=+bl.dataset.i;bs[i].texto=alternarCasilla(bs[i].texto,+b.dataset.casilla);deBloques();pintarBloques({foco:false})}
        else{n.cuerpo=alternarCasilla(n.cuerpo,+b.dataset.casilla);bs=bloques(n.cuerpo);pendiente=true;await guardarYa();repintarV()}
        return true}
      if(b.dataset.revelar!==undefined){b.classList.toggle('vista');return true}
      if(b.id==='nota-destapar'){document.querySelectorAll('.tapada').forEach(x=>x.classList.add('vista'));return true}
      if(b.dataset.bmenu!==undefined){menuDe(+b.dataset.bmenu);return true}
      if(b.dataset.ampliar!==undefined){ampliar(+b.dataset.ampliar);return true}
      if(b.dataset.fmt==='tarjeta-sel'){tarjetaDeSeleccion();return true}
      if(b.dataset.fmt){await accion(b.dataset.fmt,b);return true}
      if(b.id==='nota-mas'){
        const r=await menuAcciones({titulo:esc(n.titulo||'Nota'),opciones:[['exportar','⤓ Descargar o compartir'],['fijar',n.fijada?'📌 Desfijar':'📍 Fijar arriba'],['compartir','📤 Compartir como texto'],['borrar','🗑️ Borrar la nota','peligro-texto']]});
        if(r==='exportar')return this.alClic({id:'nota-exportar',dataset:{}},ir,repintarV);
        if(r==='fijar'){n.fijada=!n.fijada;pendiente=true;await guardarYa();repintarV()}
        if(r==='compartir')return this.alClic({id:'nota-compartir',dataset:{}},ir,repintarV);
        if(r==='pdf')return this.alClic({id:'nota-pdf',dataset:{}},ir,repintarV);
        if(r==='md')return this.alClic({id:'nota-md',dataset:{}},ir,repintarV);
        if(r==='borrar')return this.alClic({id:'nota-borrar',dataset:{}},ir,repintarV);
        return true}
      if(b.id==='nota-exportar'){await guardarYa();const {abrirExportar}=await import('./cuaderno/exportar-ui.js');await abrirExportar([n]);return true}
      if(b.id==='nota-compartir'){
        const texto=`${n.titulo||'Nota'}\n\n${plano(n.cuerpo)}`;
        try{
          const files=[];for(const i of imagenesDe(n.cuerpo).slice(0,5)){const a=await leerArchivo(i).catch(()=>null);if(a?.blob)files.push(new File([a.blob],`${i}.${a.tipo==='image/png'?'png':'jpg'}`,{type:a.tipo}))}
          if(navigator.share){const datos={title:n.titulo||'Nota',text:texto};if(files.length&&navigator.canShare?.({files}))datos.files=files;await navigator.share(datos)}
          else{await navigator.clipboard.writeText(texto);aviso('📋 Copiada: pégala donde quieras')}
        }catch(e){if(e.name!=='AbortError')aviso('No se pudo compartir.')}
        return true;
      }
      if(b.id==='nota-pdf'){if(modo!=='leer'){soltar();await guardarYa();modo='leer';repintarV()}
        document.body.classList.add('imprimiendo');await cargarImagenes(document.querySelector('.nota-render'));
        await imprimir(n.titulo||'Nota');document.body.classList.remove('imprimiendo');return true}
      if(b.id==='nota-md'){await guardarYa();const t=await textoMarkdown();descargar(new Blob([t],{type:'text/markdown'}),`${(n.titulo||'nota').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,60)||'nota'}.md`);return true}
      if(b.id==='nota-borrar'){
        soltar();clearTimeout(timer);if(pendiente){pendiente=false;n=await guardar(n)}
        if(await borrarConConfirmar([n]))ir('notas');
        return true;
      }
    }
  };
}
// Dónde poner el cursor al tocar un texto ya formateado: se busca el texto tocado en la fuente del bloque
function cursorDesde(e,fuente){
  try{
    let nodo=null,off=0;
    if(document.caretPositionFromPoint){const c=document.caretPositionFromPoint(e.clientX,e.clientY);nodo=c?.offsetNode;off=c?.offset||0}
    else if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(e.clientX,e.clientY);nodo=r?.startContainer;off=r?.startOffset||0}
    if(nodo?.nodeType===3){const t=nodo.textContent,antes=t.slice(Math.max(0,off-20),off),despues=t.slice(off,off+20);
      let i=fuente.indexOf(antes+despues);if(i>=0)return i+antes.length;
      if(antes.length>=3&&(i=fuente.indexOf(antes))>=0)return i+antes.length;
      if(despues.length>=3&&(i=fuente.indexOf(despues))>=0)return i;}
  }catch(x){}
  return fuente.length;
}

/* ---------- resumen automático del tema ---------- */
function reglasDe(h){
  const r=new Set();
  for(const e of (h.rondas||[]).flat())if(e?.regla)r.add(e.regla);
  if(!r.size&&h.gen){try{const p=crear(h.gen,1,{semilla:1});if(p.regla)r.add(p.regla)}catch(e){}}
  return [...r].slice(0,2);
}
// Lo que marcaste en tus notas: títulos, negritas, resaltados y tarjetas
function marcado(texto){
  const out=[];
  for(const l of String(texto).split('\n')){
    if(/^#{1,3} /.test(l))out.push(['h',l.replace(/^#+ /,'')]);
    for(const m of l.matchAll(/\*\*([^*]+)\*\*|==([^=]+)==/g))out.push(['b',m[1]||m[2]]);
    if(l.startsWith(TARJETA))out.push(['t',l.slice(TARJETA.length).trim()]);
  }
  return out;
}
function vistaTema(mid,tid){
  const m=buscarMateria(mid),t=m&&buscarTema(m,tid);let notas=null;
  const textoResumen=()=>{const p=progreso(),hs=(t.nodos||[]).map(x=>x.id&&leccion(m,x.id)).filter(Boolean);
    const partes=[`# Resumen: ${t.titulo}`];
    for(const h of hs){partes.push(`## ${h.titulo}`);if(h.obj)partes.push(`*Al terminar puedes ${h.obj}*`);for(const r of reglasDe(h))partes.push(`- ${r}`);
      for(const [q,r] of (GENERADORES[h.gen]?.tarjetas||h.tarjetas||[]))partes.push(`- **${q}** ${r}`);const r=p.notas[`${m.id}/${h.id}`];if(r)partes.push(`> Mi resumen: ${r.texto}`)}
    const mios=(notas||[]).flatMap(n=>marcado(n.cuerpo));
    if(mios.length){partes.push('## Lo que marqué en mis notas');for(const [k,x] of mios)partes.push(k==='t'?`${TARJETA} ${x}`:`- ${k==='h'?`**${x}**`:x}`)}
    return partes.join('\n')};
  return {
    titulo:t?`Resumen: ${t.titulo}`:'Resumen',
    alEntrar(){notas=null;todasLasNotas().then(l=>{notas=l.filter(n=>n.materia===mid&&n.tema===tid);repintar()}).catch(()=>{notas=[];repintar()})},
    vista(){
      if(!t)return vacio({icono:'📚',titulo:'Ese tema no existe',boton:'<button class="btn" data-go="notas">Ver mis notas</button>'});
      return `<div class="nota-editor nota-imprimir"><div class="nota-cab"><button type="button" class="btn-icono" data-go="notas" aria-label="Volver a mis notas">←</button><span class="nota">Resumen automático</span><span></span></div>
<h1>📚 ${t.icono||''} ${t.titulo}</h1><p class="intro">Hoja del tema: el objetivo, las reglas y los conceptos clave de cada habilidad, tus resúmenes y lo que marcaste en tus notas de este tema (negritas, resaltados, títulos y tarjetas).</p>
${notas===null?'<p class="cargando">Leyendo tus notas</p>':`<article class="nota-render">${render(textoResumen(),opcTex)}</article>
<div class="row hoja-acciones nota-compartir"><button type="button" class="btn ghost btn-chico" id="res-guardar">🗒️ Guardar como nota</button><button type="button" class="btn ghost btn-chico" id="nota-pdf">🖨️ PDF</button></div>`}</div>`;
    },
    async alClic(b,ir){
      if(b.id==='res-guardar'){const n=await crearNota({materia:mid,tema:tid,titulo:`Resumen: ${t.titulo}`,cuerpo:textoResumen().replace(/^# .*\n/,''),etiquetas:['resumen']});ir(`notas/n/${n.id}`);return true}
      if(b.id==='nota-pdf'){document.body.classList.add('imprimiendo');imprimir().then(()=>document.body.classList.remove('imprimiendo'));return true}
    }
  };
}

// Vista según la subruta de 'notas/…'
export function vistaNotas(resto=[]){
  if(resto[0]==='foto')return vistaFoto(resto[1],resto[2]);
  if(resto[0]==='n'&&resto[1])return vistaEditor(resto[1]);
  if(resto[0]==='tema'&&resto[1]&&resto[2])return vistaTema(resto[1],resto[2]);
  return vistaLista();
}
