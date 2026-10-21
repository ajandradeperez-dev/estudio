/* Pestaña 📝 Notas: un cuaderno real (reemplaza la lista de resúmenes "Mis notas").
   Rutas: 'notas' (lista: búsqueda, filtros, cuadernos área → materia → tema y respaldo) · 'notas/n/<id>' (editor)
          'notas/tema/<materia>/<tema>' (resumen automático del tema: reglas de la app + lo que marcaste en tus notas)
   Los datos viven en IndexedDB (cuaderno/db.js) y se cargan de forma asíncrona: la vista se pinta con lo que hay y
   se vuelve a pintar al terminar de cargar (evento 'repintar'). Todo texto del usuario pasa por esc() o por render(). */
import {GENERADORES} from './generadores/index.js';
import {esc} from '../utilidades.js';
import {materias,materia as buscarMateria,tema as buscarTema,leccion,rutaLeccion,analizar} from './materias.js';
import {progreso} from './progreso.js';
import {vacio,confirmar,elegir,aviso,avisoAccion,menuAcciones,chip} from './ui.js';
import {tex,conFormulas} from './formula.js';
import {soporte,escuchar} from './voz.js';
import {crear} from './generadores/index.js';
import {generadorDe} from './practica.js';
import {todasLasNotas,leerNota,leerArchivo,enMemoria} from './cuaderno/db.js';
import {render,alternarCasilla,tarjetasDe,imagenesDe,plano,normal,TARJETA} from './cuaderno/formato.js';
import {cuadernoDe,fechaCorta,guardar,crearNota,borrarNotas,restaurarNotas,sincronizarResumenes} from './cuaderno/notas.js';
import {comprimirFoto,guardarImagen,abrirDibujo} from './cuaderno/medios.js';
import {archivoRespaldo,leerRespaldo,aplicarRespaldo,resumenRespaldo,resumenLocal,descargar} from './cuaderno/respaldo.js';
import {misMaterias,recargarMias} from './mias/datos.js';
import {vistaFoto} from './cuaderno/foto.js';

const repintar=()=>document.dispatchEvent(new Event('repintar'));
const opcTex={tex:s=>tex(s)};
// URLs de las imágenes mostradas (se liberan al volver a pintar)
let urls=[];
async function cargarImagenes(raiz=document){
  urls.forEach(u=>URL.revokeObjectURL(u));urls=[];
  for(const img of raiz.querySelectorAll('img[data-img]')){
    const a=await leerArchivo(img.dataset.img).catch(()=>null);
    if(a?.blob){const u=URL.createObjectURL(a.blob);urls.push(u);img.src=u;if(a.ancho){img.width=a.ancho;img.height=a.alto}}else img.alt='(imagen no disponible)';
  }
}

/* ---------- respaldo: «💾 Mis datos» (también lo usa Perfil) ---------- */
const kb=b=>b<1024*1024?`${Math.max(1,Math.round(b/1024))} KB`:`${(b/1024/1024).toFixed(1)} MB`;
const fechaLarga=f=>f?new Date(f.length===10?f+'T12:00':f).toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'}):'—';
const puedeCompartirArchivo=()=>{try{return !!navigator.canShare?.({files:[new File(['x'],'x.estudio',{type:'application/octet-stream'})]})}catch(e){return false}};
export const htmlRespaldo=()=>`<div class="card respaldo">
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
let cache=null,cargando=null,buscar='',filtro='todas',orden='recientes';
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
const ordenar=l=>[...l].sort((a,b)=>(b.fijada-a.fijada)||(b.editada-a.editada));
function filtrar(l){
  const q=normal(buscar.trim());
  return l.filter(n=>(filtro==='todas'||filtro==='fijadas'&&n.fijada||filtro==='tarjetas'&&tarjetasDe(n.cuerpo).length||filtro.startsWith('#')&&(n.etiquetas||[]).includes(filtro.slice(1)))
    &&(!q||normal(`${n.titulo} ${n.cuerpo} ${(n.etiquetas||[]).join(' ')} ${cuadernoDe(n).nombre}`).includes(q)));
}
function resumenTexto(n,q){
  const t=plano(n.cuerpo).replace(/\s+/g,' ');
  if(!q)return t.slice(0,110);
  const i=normal(t).indexOf(normal(q));return (i>40?'…':'')+t.slice(Math.max(0,i-40),i+90);
}
const item=n=>{const c=cuadernoDe(n),nt=tarjetasDe(n.cuerpo).length,sel=seleccion?.has(n.id);
  const dentro=`<span class="nota-item-cab"><b>${seleccion?`<span aria-hidden="true">${sel?'☑️':'⬜'}</span> `:''}${n.fijada?'📌 ':''}${esc(n.titulo||'Sin título')}</b><span class="nota">${fechaCorta(n.editada)}</span></span>
<span class="nota-item-txt">${esc(resumenTexto(n,buscar))||'<i>Vacía</i>'}</span>
<span class="nota-item-pie">${chip(esc(c.nombre))}${nt?chip(`🃏 ${nt}`):''}${imagenesDe(n.cuerpo).length?chip('🖼️'):''}${(n.etiquetas||[]).slice(0,3).map(e=>chip('#'+esc(e))).join('')}</span>`;
  if(seleccion)return `<button type="button" class="nota-item${sel?' elegida':''}" data-sel="${esc(n.id)}" aria-pressed="${!!sel}">${dentro}</button>`;
  return `<div class="nota-fila"><button class="nota-item" data-go="notas/n/${esc(n.id)}">${dentro}</button><button type="button" class="nota-menu" data-menu="${esc(n.id)}" aria-label="Más opciones de «${esc(n.titulo||'Sin título')}»">⋯</button></div>`};
function htmlLista(){
  if(!cache)return '<p class="cargando">Cargando tus notas</p>';
  const l=ordenar(filtrar(cache));
  if(!cache.length)return vacio({icono:'📝',titulo:'Tu cuaderno está vacío',texto:'Crea una nota, o guarda procedimientos y errores con «📝 Guardar en mis notas» mientras practicas.'});
  if(!l.length)return `<p class="nota" style="text-align:center">Nada coincide con «${esc(buscar)}».</p>`;
  if(orden==='recientes')return `<div class="pila-notas">${l.map(item).join('')}</div>`;
  // Por cuaderno: área → materia → tema
  const grupos=new Map();
  for(const n of l){const c=cuadernoDe(n),k=`${c.area?.nombre||'General'}`,k2=c.nombre;
    if(!grupos.has(k))grupos.set(k,{icono:c.area?.icono||'🗂️',sub:new Map()});const g=grupos.get(k);
    if(!g.sub.has(k2))g.sub.set(k2,{c,notas:[]});g.sub.get(k2).notas.push(n)}
  return [...grupos].map(([a,g])=>`<h2>${g.icono} ${esc(a)}</h2>${[...g.sub].map(([nombre,{c,notas}])=>`<div class="cuaderno"><div class="cuaderno-cab"><h3>${esc(nombre)}</h3>
${c.t?`<button class="btn ghost btn-chico" data-go="notas/tema/${c.m.id}/${c.t.id}">📚 Resumen</button>`:c.propia?`<button class="btn ghost btn-chico" data-go="mias/${c.propia.id}">🎓 Materia</button>`:''}</div><div class="pila-notas">${notas.map(item).join('')}</div></div>`).join('')}`).join('');
}
function vistaLista(){
  const filtros=()=>{const etiquetas=[...new Set((cache||[]).flatMap(n=>n.etiquetas||[]))].sort().slice(0,12);
    return [['todas','Todas'],['fijadas','📌 Fijadas'],['tarjetas','🃏 Con tarjetas'],...etiquetas.map(e=>['#'+e,'#'+esc(e)])]};
  return {
    titulo:'Notas',
    alEntrar(){cache=null;seleccion=null;cargar()},
    vista:()=>`<div class="row" style="justify-content:space-between;align-items:center"><h1 style="margin:0">📝 Notas</h1><span class="row"><button type="button" class="btn ghost btn-chico" data-go="notas/foto">📸 Foto a nota</button><button type="button" class="btn btn-chico" id="nota-nueva">＋ Nueva</button></span></div>
${enMemoria?'<p class="aviso-linea">⚠️ Este navegador no deja guardar notas: se perderán al cerrar la app (¿modo privado?).</p>':''}
<label class="buscar"><span class="oculto-visual">Buscar en tus notas</span><input type="search" id="notas-buscar" placeholder="🔎 Buscar en tus notas" value="${esc(buscar)}" autocomplete="off"></label>
<div class="filtros" role="group" aria-label="Filtrar">${filtros().map(([v,t])=>`<button type="button" class="chip-filtro" data-filtro="${esc(v)}" aria-pressed="${filtro===v}">${t}</button>`).join('')}</div>
<div class="ajuste" style="border:0;padding:4px 0"><span class="nota">Ordenar</span><span class="segmentos" role="group">${[['recientes','Recientes'],['cuaderno','Por cuaderno']].map(([v,t])=>`<button type="button" data-orden="${v}" aria-pressed="${orden===v}">${t}</button>`).join('')}</span></div>
${cache?.length?(seleccion?`<div class="nota-seleccion" role="region" aria-label="Seleccionar notas"><span id="notas-contador" class="nota" aria-live="polite"><b>${seleccion.size===1?'1 seleccionada':`${seleccion.size} seleccionadas`}</b></span>
<span class="row"><button type="button" class="btn ghost btn-chico" id="sel-todas">Todas</button><button type="button" class="btn ghost btn-chico" id="sel-cancelar">Cancelar</button><button type="button" class="btn peligro btn-chico" id="sel-borrar"${seleccion.size?'':' disabled'}>🗑️ Borrar</button></span></div>`
:`<div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost btn-chico" id="sel-empezar">☑️ Seleccionar</button></div>`):''}
<div id="notas-lista">${htmlLista()}</div>
<h2>💾 Respaldo</h2>${htmlRespaldo()}`,
    alMostrar(){
      const b=document.getElementById('notas-buscar');
      b?.addEventListener('input',()=>{buscar=b.value;document.getElementById('notas-lista').innerHTML=htmlLista()});
      activarImportar(()=>{cargar()});
      if(!escuchaCambio){escuchaCambio=true;document.addEventListener('notas-cambio',()=>{if(document.getElementById('notas-lista')){cache=null;cargar()}})}
    },
    async alClic(t,ir,repintar){
      if(t.dataset.filtro){filtro=t.dataset.filtro;repintar();return true}
      if(t.dataset.orden){orden=t.dataset.orden;repintar();return true}
      if(t.id==='sel-empezar'){seleccion=new Set();repintar();return true}
      if(t.id==='sel-cancelar'){seleccion=null;repintar();return true}
      if(t.id==='sel-todas'){const vis=ordenar(filtrar(cache||[]));seleccion=vis.every(n=>seleccion.has(n.id))?new Set():new Set(vis.map(n=>n.id));repintar();return true}
      if(t.dataset.sel){const id=t.dataset.sel;seleccion.has(id)?seleccion.delete(id):seleccion.add(id);repintar();return true}
      if(t.id==='sel-borrar'){const l=(cache||[]).filter(n=>seleccion.has(n.id));await borrarConConfirmar(l,()=>{seleccion=null});repintar();return true}
      if(t.dataset.menu){const n=(cache||[]).find(x=>x.id===t.dataset.menu);if(!n)return true;
        const r=await menuAcciones({titulo:esc(n.titulo||'Sin título'),opciones:[['abrir','✏️ Abrir'],['fijar',n.fijada?'📌 Desfijar':'📍 Fijar arriba'],['borrar','🗑️ Borrar','peligro-texto']]});
        if(r==='abrir')ir(`notas/n/${n.id}`);
        else if(r==='fijar'){Object.assign(n,await guardar({...n,fijada:!n.fijada},{tocada:false}));repintar()}
        else if(r==='borrar'){await borrarConConfirmar([n]);repintar()}
        return true}
      if(t.id==='nota-nueva'){
        // el cuaderno sale de dónde estabas estudiando (lo último que abriste)
        const u=progreso().ultimo,x=u?analizar(u.ruta):{};
        const n=await crearNota({materia:x.m?.id||null,tema:x.l?.tema||x.t?.id||null});
        ir(`notas/n/${n.id}`);return true;
      }
      return clicRespaldo(t);
    }
  };
}

/* ---------- editor ---------- */
// Barra de formato: [acción, etiqueta, texto accesible]
const BARRA=[['negrita','<b>B</b>','Negrita'],['cursiva','<i>I</i>','Cursiva'],['titulo','H','Título'],['lista','•','Lista'],['casilla','☐','Casilla'],
  ['cita','❝','Cita'],['codigo','&lt;/&gt;','Código'],['formula','∑','Fórmula'],['resaltar','🖍️','Resaltar'],['camara','📷','Tomar foto'],['galeria','🖼️','Foto de la galería'],
  ['dibujo','✏️','Dibujar'],['dictar-es','🎤ES','Dictar en español'],['dictar-en','🎤EN','Dictar en inglés'],['enlace','🔗','Enlace a una lección'],['tarjeta','🃏','Convertir la línea en tarjeta']];
function opcionesCuaderno(n){
  const ops=[['','General']];
  for(const m of materias){ops.push([m.id,m.nombre]);for(const t of m.temas||[])ops.push([`${m.id}|${t.id}`,`${m.nombre} · ${t.titulo}`])}
  for(const m of misMaterias()){ops.push([m.id,`🎓 ${m.nombre}`]);for(const u of m.unidades)for(const t of u.temas)ops.push([`${m.id}|${t.id}`,`🎓 ${m.nombre} · ${t.titulo}`])}
  const actual=n.materia?(n.tema?`${n.materia}|${n.tema}`:n.materia):'';
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
function vistaEditor(id){
  let n=null,modo='editar',estado='',timer=null,pendiente=false,error='';
  const cuerpo=()=>document.getElementById('nota-cuerpo');
  const ponerEstado=e=>{estado=e;const el=document.getElementById('nota-estado');if(el)el.textContent=e};
  async function guardarYa(){
    clearTimeout(timer);if(!pendiente||!n)return;pendiente=false;
    try{n=await guardar(n);ponerEstado('✓ Guardado')}catch(e){pendiente=true;ponerEstado('⚠️ No se pudo guardar')}
  }
  const cambio=()=>{pendiente=true;ponerEstado('Guardando…');clearTimeout(timer);timer=setTimeout(guardarYa,600)};
  // leer lo que hay en pantalla antes de cambiar algo
  const leerCampos=()=>{const c=cuerpo(),t=document.getElementById('nota-titulo');if(c)n.cuerpo=c.value;if(t)n.titulo=t.value};
  /* ---- edición del texto ---- */
  function editar(fn){
    const c=cuerpo();if(!c)return;
    const {value:v,selectionStart:a,selectionEnd:b}=c,[nuevo,s0,s1]=fn(v,a,b);
    c.value=nuevo;c.focus();c.setSelectionRange(s0,s1);n.cuerpo=c.value;cambio();ajustarAlto();
  }
  const envolver=(pre,post=pre,ejemplo='texto')=>editar((v,a,b)=>{const sel=v.slice(a,b)||ejemplo;return [v.slice(0,a)+pre+sel+post+v.slice(b),a+pre.length,a+pre.length+sel.length]});
  const prefijo=pre=>editar((v,a,b)=>{
    const ini=v.lastIndexOf('\n',a-1)+1,finL=v.indexOf('\n',b),fin=finL<0?v.length:finL;
    const lineas=v.slice(ini,fin).split('\n'),todas=lineas.every(l=>l.startsWith(pre));
    const nuevas=lineas.map(l=>todas?l.slice(pre.length):pre+l.replace(/^(#+ |[-*] \[[ xX]\] |[-*] |> )/,'')).join('\n');
    return [v.slice(0,ini)+nuevas+v.slice(fin),ini+nuevas.length,ini+nuevas.length];
  });
  const insertar=(txt,{linea=false}={})=>editar((v,a,b)=>{const antes=v.slice(0,a),sep=linea&&antes&&!antes.endsWith('\n')?'\n':'',fin=linea?'\n':'';
    const t=sep+txt+fin;return [antes+t+v.slice(b),a+t.length,a+t.length]});
  function tarjeta(){editar((v,a,b)=>{
    const ini=v.lastIndexOf('\n',a-1)+1,finL=v.indexOf('\n',a),fin=finL<0?v.length:finL;let l=v.slice(ini,fin);
    if(l.startsWith(TARJETA)){aviso('Esa línea ya es una tarjeta.');return [v,a,b]}
    l=l.replace(/^(#+ |[-*] \[[ xX]\] |[-*] |> |\d+[.)] )/,'');
    const conRespuesta=l.includes('|'),nueva=`${TARJETA} ${l||'¿Pregunta?'}${conRespuesta?'':' | '}`;
    aviso(conRespuesta?'🃏 Tarjeta creada: entra a Repasar hoy.':'🃏 Escribe la respuesta después de « | ».');
    return [v.slice(0,ini)+nueva+v.slice(fin),ini+nueva.length,ini+nueva.length];
  })}
  function ajustarAlto(){const c=cuerpo();if(!c)return;c.style.height='auto';c.style.height=Math.max(220,c.scrollHeight+8)+'px'}
  async function foto(file){
    if(!file)return;ponerEstado('Procesando la foto…');
    try{const img=await comprimirFoto(file);insertar(await guardarImagen(n.id,img,'foto'),{linea:true});aviso(`📷 Foto guardada (${Math.round(img.blob.size/1024)} KB)`);pintarMiniaturas()}
    catch(e){aviso(e.message||'No se pudo guardar la foto.');ponerEstado('')}
  }
  async function dictar(idioma,boton){
    if(!soporte.escuchar){aviso('Tu navegador no reconoce la voz. Usa Chrome en Android.',3500);return}
    boton.classList.add('grabando');aviso(idioma==='en-US'?'🎤 Habla en inglés…':'🎤 Habla…');
    try{const r=await escuchar({idioma,alternativas:1,maxSegundos:30});insertar(r.transcripcion+' ')}
    catch(e){aviso(e.message||'No se entendió. Intenta de nuevo.')}
    boton.classList.remove('grabando');
  }
  function pintarMiniaturas(){
    const caja=document.getElementById('nota-miniaturas');if(!caja)return;
    const ids=imagenesDe(n.cuerpo);caja.innerHTML=ids.map(i=>`<img data-img="${esc(i)}" alt="Imagen de la nota">`).join('');caja.hidden=!ids.length;cargarImagenes(caja);
  }
  const textoMarkdown=async()=>{let t=`# ${n.titulo||'Nota'}\n\n${n.cuerpo}`;
    for(const i of imagenesDe(n.cuerpo)){const a=await leerArchivo(i).catch(()=>null);if(a?.blob){const d=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(a.blob)});t=t.split(`img:${i}`).join(d)}}
    return t};
  // teclado en pantalla: la barra de formato queda justo encima (visualViewport)
  const teclado=()=>{const vv=window.visualViewport;if(!vv)return;const alto=Math.max(0,innerHeight-vv.height-vv.offsetTop);document.documentElement.style.setProperty('--teclado',alto+'px')};
  return {
    titulo:'Nota',
    alEntrar(){
      modo='editar';n=null;error='';document.body.classList.add('editando-nota');
      leerNota(id).then(x=>{if(!x)error='Esa nota no existe (quizá la borraste).';n=x||null;repintar()}).catch(()=>{error='No se pudo abrir la nota.';repintar()});
      window.visualViewport?.addEventListener('resize',teclado);window.visualViewport?.addEventListener('scroll',teclado);
    },
    alSalir(){if(n&&cuerpo())leerCampos();guardarYa();document.body.classList.remove('editando-nota');document.documentElement.style.removeProperty('--teclado');
      window.visualViewport?.removeEventListener('resize',teclado);window.visualViewport?.removeEventListener('scroll',teclado);urls.forEach(u=>URL.revokeObjectURL(u));urls=[]},
    vista(){
      if(error)return vacio({icono:'🗒️',titulo:error,boton:'<button class="btn" data-go="notas">Ver mis notas</button>'});
      if(!n)return '<p class="cargando">Abriendo la nota</p>';
      const c=cuadernoDe(n),nt=tarjetasDe(n.cuerpo).length;
      const pestanas=`<div class="segmentos nota-modos" role="tablist">${[['editar','✏️ Escribir'],['ver','👁️ Ver'],['repasar','🧠 Repasar']].map(([v,t])=>`<button type="button" role="tab" data-modo="${v}" aria-selected="${modo===v}" aria-pressed="${modo===v}">${t}</button>`).join('')}</div>`;
      const cab=`<div class="nota-cab"><button type="button" class="btn-icono" data-go="notas" aria-label="Volver a mis notas">←</button><span id="nota-estado" class="nota" aria-live="polite">${estado}</span>
<span class="row" style="gap:4px;flex-wrap:nowrap"><button type="button" class="btn-icono" id="nota-borrar" aria-label="Borrar nota" title="Borrar">🗑️</button><button type="button" class="btn-icono" id="nota-fijar" aria-pressed="${!!n.fijada}" aria-label="${n.fijada?'Desfijar':'Fijar arriba'}">${n.fijada?'📌':'📍'}</button></span></div>
<input id="nota-titulo" class="nota-titulo" placeholder="Título" value="${esc(n.titulo)}" aria-label="Título de la nota" autocomplete="off">
<p class="nota" style="margin:0 0 8px">${esc(c.nombre)}${nt?` · 🃏 ${nt} ${nt===1?'tarjeta':'tarjetas'} en Repasar`:''}</p>${pestanas}`;
      if(modo==='editar')return `<div class="nota-editor">${cab}
<textarea id="nota-cuerpo" class="nota-cuerpo" placeholder="Escribe aquí. **negrita**, *cursiva*, $x^2$ para fórmulas, - [ ] para casillas…" aria-label="Texto de la nota">${esc(n.cuerpo)}</textarea>
<div id="nota-miniaturas" class="nota-miniaturas" hidden></div>
<details class="nota-datos"><summary>🗂️ Cuaderno y etiquetas</summary>
<label class="campo">Cuaderno<select id="nota-cuaderno">${opcionesCuaderno(n)}</select></label>
<label class="campo">Etiquetas (separadas por comas)<input id="nota-etiquetas" value="${esc((n.etiquetas||[]).join(', '))}" placeholder="examen, dudas" autocomplete="off"></label></details>
<details class="nota-datos"><summary>❓ Cómo dar formato</summary><ul class="nota">
<li><code>**palabra**</code> negrita (en «Repasar» se tapa) · <code>*cursiva*</code> · <code>==resaltado==</code></li>
<li><code># Título</code> · <code>- lista</code> · <code>- [ ] casilla</code> · <code>&gt; cita</code> · <code>\`código\`</code></li>
<li><code>$x^2 + 1$</code> fórmula · <code>🃏 pregunta | respuesta</code> tarjeta para Repasar</li></ul></details>
<input type="file" id="nota-camara" accept="image/*" capture="environment" class="oculto-visual" tabindex="-1">
<input type="file" id="nota-galeria" accept="image/*" class="oculto-visual" tabindex="-1">
<div class="nota-barra" role="toolbar" aria-label="Formato">${BARRA.map(([a,e,t])=>`<button type="button" data-fmt="${a}" aria-label="${t}" title="${t}">${e}</button>`).join('')}</div></div>`;
      const html=render(n.cuerpo,{...opcTex,repasar:modo==='repasar'});
      return `<div class="nota-editor nota-imprimir">${cab}
${modo==='repasar'?'<p class="intro">Las palabras en negrita están tapadas: intenta recordarlas y toca para comprobar.</p>':''}
<article class="nota-render">${html||'<p class="nota">La nota está vacía.</p>'}</article>
${modo==='repasar'?'<button type="button" class="btn ghost ancho" id="nota-destapar">Destapar todo</button>':`<div class="row hoja-acciones nota-compartir">
<button type="button" class="btn ghost btn-chico" id="nota-compartir">📤 Compartir</button><button type="button" class="btn ghost btn-chico" id="nota-pdf">🖨️ PDF</button>
<button type="button" class="btn ghost btn-chico" id="nota-md">⬇️ Markdown</button><button type="button" class="btn ghost btn-chico peligro-texto" id="nota-borrar2">🗑️ Borrar</button></div>`}</div>`;
    },
    alMostrar(){
      if(!n)return;
      const c=cuerpo(),t=document.getElementById('nota-titulo');
      t?.addEventListener('input',()=>{n.titulo=t.value;cambio()});
      if(c){c.addEventListener('input',()=>{n.cuerpo=c.value;cambio();ajustarAlto()});ajustarAlto();pintarMiniaturas();
        c.addEventListener('focus',()=>setTimeout(()=>{teclado()},300));
        if(!n.cuerpo&&!n.titulo)t?.focus();}
      // la barra de formato no le quita el foco al texto (así el teclado no se cierra)
      document.querySelector('.nota-barra')?.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
      document.getElementById('nota-cuaderno')?.addEventListener('change',e=>{const [m,tm]=e.target.value.split('|');n.materia=m||null;n.tema=tm||null;cambio()});
      document.getElementById('nota-etiquetas')?.addEventListener('input',e=>{n.etiquetas=[...new Set(e.target.value.split(',').map(x=>x.trim().replace(/^#/,'')).filter(Boolean))].slice(0,10);cambio()});
      for(const [idInp] of [['nota-camara'],['nota-galeria']])document.getElementById(idInp)?.addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';foto(f)});
      if(modo!=='editar')cargarImagenes(document.querySelector('.nota-render'));
    },
    async alClic(b,ir,repintarV){
      if(!n)return;
      if(b.dataset.modo){leerCampos();await guardarYa();modo=b.dataset.modo;repintarV();window.scrollTo(0,0);return true}
      if(b.id==='nota-fijar'){n.fijada=!n.fijada;pendiente=true;await guardarYa();repintarV();return true}
      if(b.dataset.casilla!==undefined){n.cuerpo=alternarCasilla(n.cuerpo,+b.dataset.casilla);pendiente=true;await guardarYa();repintarV();return true}
      if(b.dataset.revelar!==undefined){b.classList.toggle('vista');return true}
      if(b.id==='nota-destapar'){document.querySelectorAll('.tapada').forEach(x=>x.classList.add('vista'));return true}
      const f=b.dataset.fmt;
      if(f){
        ({negrita:()=>envolver('**'),cursiva:()=>envolver('*'),resaltar:()=>envolver('==','==','importante'),codigo:()=>envolver('`','`','código'),formula:()=>envolver('$','$','x^2'),
          titulo:()=>prefijo('## '),lista:()=>prefijo('- '),casilla:()=>prefijo('- [ ] '),cita:()=>prefijo('> '),tarjeta,
          camara:()=>document.getElementById('nota-camara').click(),galeria:()=>document.getElementById('nota-galeria').click(),
          dibujo:async()=>{const d=await abrirDibujo();if(d){insertar(await guardarImagen(n.id,d,'dibujo'),{linea:true});pintarMiniaturas();aviso('✏️ Dibujo guardado')}},
          'dictar-es':()=>dictar('es-MX',b),'dictar-en':()=>dictar('en-US',b),
          enlace:async()=>{const x=await elegirLeccion();if(x)insertar(`[${x.l.titulo}](#${rutaLeccion(x.m,x.l)})`)}})[f]?.();
        return true;
      }
      if(b.id==='nota-compartir'){
        const texto=`${n.titulo||'Nota'}\n\n${plano(n.cuerpo)}`;
        try{
          const files=[];for(const i of imagenesDe(n.cuerpo).slice(0,5)){const a=await leerArchivo(i).catch(()=>null);if(a?.blob)files.push(new File([a.blob],`${i}.${a.tipo==='image/png'?'png':'jpg'}`,{type:a.tipo}))}
          if(navigator.share){const datos={title:n.titulo||'Nota',text:texto};if(files.length&&navigator.canShare?.({files}))datos.files=files;await navigator.share(datos)}
          else{await navigator.clipboard.writeText(texto);aviso('📋 Copiada: pégala donde quieras')}
        }catch(e){if(e.name!=='AbortError')aviso('No se pudo compartir.')}
        return true;
      }
      if(b.id==='nota-pdf'){document.body.classList.add('imprimiendo');await cargarImagenes(document.querySelector('.nota-render'));
        const fin=()=>{document.body.classList.remove('imprimiendo');removeEventListener('afterprint',fin)};addEventListener('afterprint',fin);
        setTimeout(()=>{window.print();setTimeout(fin,1000)},100);return true}
      if(b.id==='nota-md'){const t=await textoMarkdown();descargar(new Blob([t],{type:'text/markdown'}),`${(n.titulo||'nota').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,60)||'nota'}.md`);return true}
      if(b.id==='nota-borrar'||b.id==='nota-borrar2'){
        leerCampos();clearTimeout(timer);if(pendiente){pendiente=false;n=await guardar(n)}
        if(await borrarConConfirmar([n]))ir('notas');
        return true;
      }
    }
  };
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
      if(b.id==='nota-pdf'){document.body.classList.add('imprimiendo');const fin=()=>{document.body.classList.remove('imprimiendo');removeEventListener('afterprint',fin)};addEventListener('afterprint',fin);setTimeout(()=>{window.print();setTimeout(fin,1000)},100);return true}
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
