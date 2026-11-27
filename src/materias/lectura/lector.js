/* 📚 Lectura: biblioteca, portada de cada libro (con su licencia y atribución) y lector de capítulos.
   Rutas (bajo #estudio/lectura): (vacía) biblioteca · libro/<id> portada y capítulos · libro/<id>/<n> un capítulo.
   - Los capítulos son archivos aparte (public/libros/<id>/<n>.json, de scripts/libros.mjs): se descargan al abrirlos y el
     service worker los guarda (caché 'libros') para leerlos sin internet.
   - Lector: tamaño de letra y modo oscuro propios, recuerda dónde ibas (localStorage 'ciberlab-lectura', comodidad de
     este teléfono) y marca los capítulos leídos en el progreso (materias.lectura.extra.libros[id] = {leidos:{n:fecha}, ultimo}).
   - Libros en inglés: toca una palabra para ver su pronunciación (Web Speech), su significado (✨ IA opcional o tu propia
     traducción) y «🃏 Guardar en repaso» (tarjeta 'lectura/t/<id>' en el repaso espaciado); «🔊 Escuchar» lee el párrafo;
     al final, 3 preguntas de comprensión (preguntas.js).
   - Libros técnicos: «🎯 Practicar este capítulo» lleva al tema relacionado del curso. */
import {esc} from '../../utilidades.js';
import {progreso,datosMateria,cambiarExtra,registrarEjercicio,hoy,agregarTarjeta} from '../../nucleo/progreso.js';
import {boton,chip,barra,aviso,cabecera} from '../../nucleo/ui.js';
import {hablar,soporte} from '../../nucleo/voz.js';
import {crearSesion} from '../../nucleo/sesion.js';
import {coincide} from '../../nucleo/comparar.js';
import {iaDisponible} from '../../nucleo/ia-preguntas.js';
import {pedir} from '../../nucleo/ia.js';
import {LIBROS} from './catalogo.js';
import {PREGUNTAS} from './preguntas.js';
import {definicion} from './glosario.js';
import {miLibro,cargarMisLibros,leerCapituloMio,leerImagenMia,avanceDe,marcarLeidoMio,borrarLibro,restaurarLibro,tamano} from './mis-libros.js';
import {htmlMisLibros,dejarArchivo,duracionMia} from './mis-libros-ui.js';
import {avisoAccion,confirmar} from '../../nucleo/ui.js';
import {crearNota} from '../../nucleo/cuaderno/notas.js';
import {nombreProveedor} from '../../nucleo/ia.js';

const RAIZ='estudio/lectura';
const BASE=import.meta.env?.BASE_URL||'/';
const libro=id=>LIBROS.find(l=>l.id===id)||miLibro(id);
const esMio=id=>String(id).startsWith('mio-');
const ruta=(id,n)=>`${RAIZ}/libro/${id}${n?`/${n}`:''}`;
// el avance de Mis libros se queda en este dispositivo (no va al progreso que se sincroniza)
const datos=id=>esMio(id)?avanceDe(id):datosMateria(progreso(),'lectura').extra.libros?.[id]||{leidos:{}};
const PRACTICA={python:t=>`cursos/python/${t}`,'ciencia-datos':t=>`estudio/ciencia-datos/${t}`};
// Preferencias del lector (solo una comodidad de este teléfono)
const CLAVE='ciberlab-lectura';
const prefs=()=>{try{return {letra:18,oscuro:false,pos:{},...JSON.parse(localStorage.getItem(CLAVE)||'{}')}}catch(e){return {letra:18,oscuro:false,pos:{}}}};
const guardarPrefs=f=>{try{const x=prefs();f(x);localStorage.setItem(CLAVE,JSON.stringify(x))}catch(e){}};
// Capítulos descargados (en memoria mientras la app está abierta)
const cache=new Map();
async function cargarCapitulo(id,n){
  const k=`${id}/${n}`;if(cache.has(k))return cache.get(k);
  if(esMio(id)){const c=await leerCapituloMio(id,n);cache.set(k,c);return c}
  const r=await fetch(`${BASE}libros/${id}/${n}.json`);if(!r.ok)throw new Error(r.status);
  const c=await r.json();cache.set(k,c);return c;
}

/* ---------- biblioteca (página de la materia): filtros, buscador y secciones ---------- */
// Filtros por idioma, género y nivel (se combinan y se recuerdan en este teléfono) y búsqueda por título o autor
const minutos=(l,palabras)=>Math.max(1,Math.round(palabras/(l.idioma==='en'?150:200)));
export const duracion=l=>{if(l.propio)return duracionMia(l);const m=minutos(l,l.capitulos.reduce((s,c)=>s+c.palabras,0));return m<60?`${m} min`:`${Math.round(m/60)} h`};
const IDIOMAS={es:'🇲🇽 Español',en:'🇺🇸 Inglés'};
const ORDEN_NIVEL=['A1','A2','B1','B2','C1','Fácil','Media','Avanzada','Introductorio','Universitario'];
const leidos=l=>Object.keys(datos(l.id).leidos||{}).length;
const sinAcentos=t=>String(t).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
function tarjetaLibro(l){
  const h=leidos(l);
  return `<button class="tarjeta-nav libro-tarjeta" data-go="${ruta(l.id)}"><span class="tarjeta-icono" aria-hidden="true">${l.icono}</span><span><b>${esc(l.titulo)}</b><span class="nota">${esc(l.autor)}</span>
<span class="libro-etiquetas">${[IDIOMAS[l.idioma],(l.niveles||[l.nivel||l.dificultad]).join('–'),...(l.generos||[]).slice(0,2),l.relacionada?`📐 ${l.relacionada}`:''].filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</span>
${h?barra(h,l.capitulos.length):''}<span class="nota">${h?`${h}/${l.capitulos.length} capítulos · `:`${l.capitulos.length} capítulos · `}≈ ${duracion(l)} · ${esc(l.licencia)}</span></span></button>`;
}
export function vistaBiblioteca(m){
  let buscar='';
  const filtros=()=>prefs().filtros||{};
  const pasa=(l,f)=>(!f.idioma||l.idioma===f.idioma)&&(!f.genero||(l.generos||[]).includes(f.genero))&&(!f.nivel||(l.niveles||[l.nivel||l.dificultad]).includes(f.nivel))
    &&(!buscar||sinAcentos(`${l.titulo} ${l.autor}`).includes(buscar));
  const chips=(clave,opciones,f)=>`<div class="filtros" role="group" aria-label="${clave}"><button type="button" class="chip-filtro" data-filtro="${clave}" data-valor="" aria-pressed="${!f[clave]}">Todos</button>${opciones.map(([v,t])=>`<button type="button" class="chip-filtro" data-filtro="${clave}" data-valor="${esc(v)}" aria-pressed="${f[clave]===v}">${esc(t)}</button>`).join('')}</div>`;
  const lista=()=>{const f=filtros(),todos=LIBROS.filter(l=>pasa(l,f));
    const continuar=todos.filter(l=>{const h=leidos(l);return h&&h<l.capitulos.length}),faciles=['es','en'].map(i=>todos.filter(l=>l.idioma===i&&!l.tecnico).sort((a,b)=>ORDEN_NIVEL.indexOf((a.niveles||[a.nivel])[0])-ORDEN_NIVEL.indexOf((b.niveles||[b.nivel])[0]))[0]).filter(Boolean);
    if(!todos.length)return `<p class="nota" style="text-align:center">Ningún libro coincide con esos filtros.</p>`;
    return `${continuar.length?`<h2>📖 Continuar leyendo</h2><div class="pila lib-lista">${continuar.map(tarjetaLibro).join('')}</div>`:''}
${faciles.length&&!buscar?`<h2>🌱 Para empezar</h2><div class="pila lib-lista">${faciles.map(tarjetaLibro).join('')}</div>`:''}
<h2>📚 Todos · ${todos.length}</h2><div class="pila lib-lista">${todos.map(tarjetaLibro).join('')}</div>`};
  return {titulo:'Lectura',vista(){
    const f=filtros(),generos=[...new Set(LIBROS.flatMap(l=>l.generos||[]))].sort(),niveles=ORDEN_NIVEL.filter(n=>LIBROS.some(l=>(l.niveles||[l.nivel||l.dificultad]).includes(n)));
    return `<div class="area-${m.tono||'estudio'}">${cabecera({icono:'📚',titulo:'Lectura',desc:'Libros libres para leer en el teléfono, también sin internet.'})}
<p class="intro">Todos son de dominio público o tienen una licencia abierta que permite compartirlos. Toca una palabra para ver qué significa (en inglés, también oírla y guardarla en tu repaso).</p>
${htmlMisLibros(l=>Object.keys(datos(l.id).leidos||{}).length)}
<div class="lib-dos"><aside class="lib-lado"><label class="buscar"><span class="oculto-visual">Buscar por título o autor</span><input type="search" id="lib-buscar" placeholder="🔎 Título o autor" value="${esc(buscar)}" autocomplete="off"></label>
<details class="nota-datos lib-filtros"${f.idioma||f.genero||f.nivel?' open':''}><summary>Filtrar${f.idioma||f.genero||f.nivel?' (activos)':''}</summary>
<p class="prog-k">Idioma</p>${chips('idioma',Object.entries(IDIOMAS),f)}<p class="prog-k">Género</p>${chips('genero',generos.map(g=>[g,g]),f)}<p class="prog-k">Nivel</p>${chips('nivel',niveles.map(n=>[n,n]),f)}</details>
</aside><div id="lib-lista">${lista()}</div></div></div>`},
    // en dos paneles los filtros quedan abiertos en su columna
    alMostrar(){
      if(!this._mis){this._mis=true;cargarMisLibros().then(()=>document.dispatchEvent(new Event('repintar')));
        const v=document.getElementById('vista');v?.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});
        v?.addEventListener('drop',e=>{const fl=e.dataTransfer?.files?.[0];if(!fl)return;e.preventDefault();dejarArchivo(fl);document.dispatchEvent(new CustomEvent('ir',{detail:`${RAIZ}/mis/importar`}))})}
      if(matchMedia('(min-width:840px)').matches&&document.documentElement.dataset.paneles!=='no')document.querySelector('.lib-filtros')?.setAttribute('open','');
      const b=document.getElementById('lib-buscar');b?.addEventListener('input',()=>{buscar=sinAcentos(b.value.trim());document.getElementById('lib-lista').innerHTML=lista()})},
    alClic(t,ir,repintar){if(t.dataset.filtro){const k=t.dataset.filtro,v=t.dataset.valor;guardarPrefs(x=>{x.filtros={...(x.filtros||{}),[k]:v||undefined}});repintar();return true}}
  };
}

/* ---------- portada de un libro ---------- */
function vistaPortada(l){
  let buscando='',resultados=null;
  return {titulo:l.titulo,
    alMostrar(){document.querySelectorAll('[data-mio-img]').forEach(async im=>{const a=await leerImagenMia(im.dataset.mioImg).catch(()=>null);if(a?.blob)im.src=URL.createObjectURL(a.blob)});
      document.getElementById('mio-buscar-f')?.addEventListener('submit',async e=>{e.preventDefault();buscando=document.getElementById('mio-buscar').value.trim();if(buscando.length<2)return;resultados=[];
        const q=sinAcentos(buscando);for(const c of l.capitulos){const cap=await cargarCapitulo(l.id,c.n).catch(()=>null);for(const b of cap?.bloques||[]){const t=String(b.x).replace(/<[^>]+>/g,' ');const i=sinAcentos(t).indexOf(q);if(i>=0)resultados.push({n:c.n,titulo:c.titulo,frag:t.slice(Math.max(0,i-60),i+q.length+80)})}}
        document.dispatchEvent(new Event('repintar'))})},
    async alClic(t,ir){
      if(t.id==='mio-borrar'){if(!(await confirmar({titulo:'¿Borrar este libro?',texto:'Se borra de este dispositivo con sus capítulos y su avance.',si:'Borrar',peligro:true})))return true;
        const copia=await borrarLibro(l.id);ir(RAIZ);avisoAccion('🗑️ Libro borrado','Deshacer',async()=>{await restaurarLibro(copia);document.dispatchEvent(new Event('repintar'))});return true}},
    vista(){
    const d=datos(l.id),leidosL=d.leidos||{},sig=l.capitulos.find(c=>!leidosL[c.n])||l.capitulos[0];
    return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › ${esc(l.titulo)}</p>
<div class="libro-dos"><div class="libro-info"><div class="libro-portada">${l.portada?`<img class="libro-portada-img" data-mio-img="${esc(l.portada)}" alt="Portada de ${esc(l.titulo)}">`:`<span class="libro-icono${l.propio?' libro-mio-icono':''}" style="--mio:${esc(l.color||'#4652d0')}" aria-hidden="true">${l.icono}</span>`}<div><h1>${esc(l.titulo)}</h1><p class="lead">${esc(l.autor)}</p>
<div class="row" style="gap:6px;flex-wrap:wrap">${chip(IDIOMAS[l.idioma])}${chip(esc((l.niveles||[l.nivel||l.dificultad]).join('–')))}${(l.generos||[]).map(g=>chip(esc(g))).join('')}${l.relacionada?chip(`📐 ${esc(l.relacionada)}`):''}${chip(`⏱️ ≈ ${duracion(l)}`)}${chip((l.propio?'':'📜 ')+esc(l.licencia))}</div></div></div>
<p>${esc(l.descripcion||'')}</p>
${boton({texto:`${Object.keys(leidosL).length?'▶ Seguir':'▶ Empezar'}: ${sig.n}. ${esc(sig.titulo)}`,go:ruta(l.id,sig.n),clase:'ancho area'})}</div>
<div><h2>Capítulos</h2><ol class="capitulos">${l.capitulos.map(c=>`<li><button class="capitulo${leidosL[c.n]?' leido':''}" data-go="${ruta(l.id,c.n)}"><span>${leidosL[c.n]?'✅':c.n}</span><span><b>${esc(c.titulo)}</b><span class="nota">≈ ${minutos(l,c.palabras)} min${PREGUNTAS[l.id]?.[c.n-1]?` · ${PREGUNTAS[l.id][c.n-1].length} preguntas`:''}</span></span></button></li>`).join('')}</ol>
${l.propio?`<div class="card"><p class="etiqueta-actividad">🔍 Buscar en el libro</p><form id="mio-buscar-f" class="row" style="gap:8px"><label class="buscar" style="flex:1"><span class="oculto-visual">Buscar</span><input type="search" id="mio-buscar" value="${esc(buscando)}" placeholder="Una palabra o frase"></label><button class="btn btn-chico">Buscar</button></form>
${resultados?resultados.length?`<ol class="mio-resultados">${resultados.slice(0,40).map(x=>`<li><button class="enlace" data-go="${ruta(l.id,x.n)}">${x.n}. ${esc(x.titulo)}</button><span class="nota"> …${esc(x.frag)}…</span></li>`).join('')}</ol>`:'<p class="nota">No aparece en el libro.</p>':''}</div>
<div class="card licencia"><p class="etiqueta-actividad">🔒 Solo para mí</p><p class="nota">Este libro está solo en este dispositivo (${tamano(l.bytes||0)}, ${esc(l.formato||'')}): no se sincroniza ni se comparte. Tu avance tampoco sale de aquí.</p>
<div class="row" style="gap:8px;flex-wrap:wrap">${boton({texto:'✏️ Editar o volver a dividir capítulos',go:`${RAIZ}/mis/${l.id}/editar`,clase:'ghost btn-chico'})}<button type="button" class="btn ghost btn-chico peligro-texto" id="mio-borrar">🗑️ Borrar libro</button></div></div>`:`<div class="card licencia"><p class="etiqueta-actividad">📜 Licencia y atribución</p><p>${esc(l.atribucion)}</p><p class="nota">Licencia: <b>${esc(l.licencia)}</b>. Fuente: <a href="${esc(l.fuente)}" target="_blank" rel="noopener">${esc(l.fuente)}</a></p></div>`}</div></div></div>`}};
}

/* ---------- capítulo ---------- */
// Palabra bajo el dedo (sin envolver cada palabra en un elemento)
function palabraEn(x,y){
  let nodo,off;
  if(document.caretPositionFromPoint){const c=document.caretPositionFromPoint(x,y);nodo=c?.offsetNode;off=c?.offset}
  else if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);nodo=r?.startContainer;off=r?.startOffset}
  if(!nodo||nodo.nodeType!==3)return null;
  const t=nodo.textContent;let a=off,b=off;const letra=c=>/[\p{L}'’-]/u.test(c);
  while(a>0&&letra(t[a-1]))a--;while(b<t.length&&letra(t[b]))b++;
  const w=t.slice(a,b).replace(/^['’-]+|['’-]+$/g,'');
  if(!w)return null;
  // la oración donde aparece (contexto para la traducción y la tarjeta)
  const p=nodo.parentElement?.closest('.lec-bloque')?.textContent||t,i=p.indexOf(w);
  const ini=Math.max(p.lastIndexOf('.',i)+1,p.lastIndexOf('!',i)+1,p.lastIndexOf('?',i)+1,0),fin=[p.indexOf('.',i),p.indexOf('!',i),p.indexOf('?',i)].filter(k=>k>=0);
  return {w,frase:p.slice(ini,(fin.length?Math.min(...fin):p.length)+1).trim().slice(0,220)};
}
function vistaCapitulo(l,n){
  const c=l.capitulos.find(x=>x.n===n);
  let iaCap=null;
  let estado='cargando',cap=null,palabra=null,ses=null,traduciendo=false,guardarPos=null,fraccion=0,alGirar=null,teclas=null;
  // Dos páginas (tablet en horizontal, estilos/tablet.css): el capítulo va en columnas y se pasa de lado, página por página
  const art=()=>document.querySelector('.lector');
  const enLibro=()=>{const a=art();return !!a&&getComputedStyle(a).columnCount==='2'};
  const salto=a=>a.clientWidth+(parseFloat(getComputedStyle(a).columnGap)||0);
  const leerFraccion=()=>{const a=art();if(enLibro())return a.scrollLeft/Math.max(1,a.scrollWidth-a.clientWidth);const h=document.documentElement.scrollHeight-innerHeight;return h>0?scrollY/h:fraccion};
  const irA=f=>{const a=art();if(!a)return;if(enLibro()){const p=salto(a);a.scrollLeft=Math.round(f*(a.scrollWidth-a.clientWidth)/p)*p}else window.scrollTo(0,f*(document.documentElement.scrollHeight-innerHeight))};
  const pasar=d=>{const a=art();if(a)a.scrollBy({left:d*salto(a),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})};
  // alto de las dos páginas: lo que queda de pantalla debajo del título, dejando lugar para «‹ Anterior · Siguiente ›»
  const ajustarAlto=()=>{const a=art();if(!a)return;const arriba=a.getBoundingClientRect().top+scrollY;a.style.setProperty('--lec-alto',Math.max(360,innerHeight-arriba-84)+'px')};
  function paginas(){ajustarAlto();const a=art(),el=document.getElementById('lec-pag');if(!a||!el||!enLibro())return;
    const p=salto(a),total=Math.max(1,Math.ceil((a.scrollWidth+(p-a.clientWidth))/p)),i=Math.round(a.scrollLeft/p)+1;
    el.textContent=`Páginas ${2*i-1}–${Math.min(2*i,2*total)} de ${2*total}`;
    const ant=document.getElementById('lec-ant'),sig=document.getElementById('lec-sig');if(ant)ant.disabled=i<=1;if(sig)sig.disabled=i>=total}
  // preguntas escritas a mano (preguntas.js) o, en español, las de «completa la frase» que trae el capítulo
  let qs=PREGUNTAS[l.id]?.[n-1]||[];
  const voz=l.idioma==='en'?'en-US':'es-MX',conVoz=!l.tecnico&&soporte.hablar;
  const bloqueHtml=(b,i)=>b.t==='img'?`<figure class="lec-fig"><img data-mio-img="${esc(b.x)}" alt="${esc(b.alt||'')}">${b.alt?`<figcaption class="nota">${esc(b.alt)}</figcaption>`:''}</figure>`:b.t==='cita'?`<blockquote class="lec-bloque lec-cita" lang="${l.idioma}">${b.x}</blockquote>`:b.t==='h'?`<h2 class="lec-bloque">${b.x}</h2>`:b.t==='code'?`<pre class="py-salida">${esc(b.x)}</pre>`:b.t==='fuente'?`<p class="nota"><a href="${esc(b.x)}" target="_blank" rel="noopener">Ver esta sección con sus figuras e interactivos en el sitio original ↗</a></p>`
    :`<div class="lec-parrafo"><${b.t==='li'?'p class="lec-bloque lec-li"':b.t==='v'?'p class="lec-bloque lec-verso"':'p class="lec-bloque"'} lang="${l.idioma}">${b.t==='li'?'• ':''}${b.x}</p>${conVoz?`<button type="button" class="btn-icono lec-oir" data-oir="${i}" aria-label="Escuchar este párrafo" title="Escuchar">🔊</button>`:''}</div>`;
  function sesionPreguntas(){
    return crearSesion({titulo:`Preguntas: ${c.titulo}`,tono:'estudio',salir:ruta(l.id,n),materia:'lectura',
      total:()=>qs.length,
      siguiente:st=>{const q=qs[st.i];if(!q)return null;const [enun,resp,ev]=q;
        return {tipo:'escribir',enunciado:enun,respuesta:resp[0],aceptadas:resp,verificar:e=>coincide(e,resp),regla:`En el capítulo dice: «…${esc(ev)}…»`,
          pasos:[{que:'Busca en el capítulo',como:`la parte que dice «${esc(ev)}»`,porque:'La respuesta está escrita en el texto.'},{que:'Responde',como:esc(resp[0]),porque:'Puedes escribirlo en inglés, con las palabras del texto, o en español.',res:resp[0]}],
          etiqueta:`Comprensión · ${l.titulo}`,materia:'lectura'}},
      responder:(p,r)=>{registrarEjercicio({materia:'lectura',correcto:r.correcto,xp:r.correcto?(r.pista?5:10):0,repasar:false});return {xp:r.correcto?(r.pista?5:10):0}},
      fin:st=>{const ok=st.historial.filter(x=>x.r.correcto).length;
        if(ok>=Math.ceil(qs.length*0.6))marcarLeido();
        return `<span class="fin-icono" aria-hidden="true">${ok===qs.length?'🌟':'📖'}</span><h1>${ok} de ${qs.length}</h1><p class="nota">${ok>=Math.ceil(qs.length*0.6)?'Capítulo leído y entendido.':'Vuelve a leer las partes que fallaste y prueba otra vez.'}</p>
${l.capitulos.find(x=>x.n===n+1)?boton({texto:'Siguiente capítulo',go:ruta(l.id,n+1),clase:'ancho area'}):''}<button class="btn ghost ancho" data-go="${ruta(l.id)}">Volver al libro</button>`}});
  }
  function marcarLeido(){if(l.propio)return marcarLeidoMio(l.id,n);cambiarExtra('lectura',e=>{e.libros={...(e.libros||{})};const d=e.libros[l.id]={leidos:{},...(e.libros[l.id]||{})};d.leidos={...d.leidos,[n]:d.leidos[n]||hoy()};d.ultimo=n})}
  function htmlPalabra(){
    if(!palabra)return '';
    if(l.idioma==='es'){const def=definicion(palabra.w,palabra.frase);
      return `<div class="modal-fondo lec-palabra"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="pal-t">
<h2 id="pal-t">${esc(palabra.w)} ${soporte.hablar?`<button type="button" class="btn-icono" data-decir aria-label="Escuchar">🔊</button>`:''}</h2>
<p class="nota">«${esc(palabra.frase)}»</p>
${def?`<p><b>${esc(def.palabra)}:</b> ${esc(def.significado)}</p>${def.nota?`<p class="nota">${esc(def.nota)}</p>`:''}`:'<p class="nota">No está en el glosario de palabras antiguas del libro.</p>'}
<div class="pila">${def?'':`${iaDisponible()?`<button type="button" class="btn ancho" id="pal-explicar"${traduciendo?' disabled':''}>${traduciendo?'Explicando…':'✨ Explicar'}</button><p class="nota" style="margin:0">Solo se envía esta palabra y su oración, nunca el libro.</p>`:''}${palabra.exp?`<p>${esc(palabra.exp)}</p>`:''}<button type="button" class="btn ${iaDisponible()?'ghost ':''}ancho" id="pal-luego">🔖 Guardar para buscar luego</button>`}
<a class="btn ghost ancho" href="https://dle.rae.es/${encodeURIComponent(palabra.w.toLowerCase())}" target="_blank" rel="noopener">📖 Buscar en el diccionario de la RAE ↗</a>
<button type="button" class="btn ghost ancho" data-r="0" data-cerrar-palabra>Cerrar</button></div></div></div>`}
    return `<div class="modal-fondo lec-palabra"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="pal-t">
<h2 id="pal-t" lang="en">${esc(palabra.w)} ${soporte.hablar?`<button type="button" class="btn-icono" data-decir aria-label="Pronunciar">🔊</button>`:''}</h2>
<p class="nota" lang="en">«${esc(palabra.frase)}»</p>
<label class="campo">Significado<input id="pal-sig" value="${esc(palabra.sig||'')}" placeholder="Escribe qué significa aquí" autocomplete="off"></label>
<div class="pila">${iaDisponible()?`<button type="button" class="btn ghost ancho" id="pal-ia"${traduciendo?' disabled':''}>${traduciendo?'Traduciendo…':'✨ Traducir con IA'}</button>`:''}
<a class="btn ghost ancho" href="https://www.wordreference.com/es/translation.asp?tranword=${encodeURIComponent(palabra.w.toLowerCase())}" target="_blank" rel="noopener">📖 Buscar en WordReference ↗</a>
<button type="button" class="btn ancho" id="pal-guardar">🃏 Guardar en repaso</button><button type="button" class="btn ghost ancho" data-r="0" data-cerrar-palabra>Cerrar</button></div></div></div>`;
  }
  return {titulo:c.titulo,
    get inmersiva(){return !!ses},
    async alEntrar(){
      ses=null;palabra=null;estado='cargando';
      try{cap=await cargarCapitulo(l.id,n);estado='listo';if(!qs.length&&cap.preguntas?.length)qs=cap.preguntas}catch(e){estado='error'}
      guardarPrefs(x=>{x.ultimo={...(x.ultimo||{}),[l.id]:n}});
      document.dispatchEvent(new Event('repintar'));
    },
    alSalir(){if(this._cita){document.removeEventListener('selectionchange',this._cita);this._cita=null;document.getElementById('lec-cita')?.remove()}ses?.alSalir?.();if(guardarPos)removeEventListener('scroll',guardarPos);guardarPos=null;removeEventListener('resize',alGirar);document.removeEventListener('keydown',teclas)},
    vista(){
      if(ses)return ses.vista();
      const pr=prefs(),leido=datos(l.id).leidos?.[n],sig=l.capitulos.find(x=>x.n===n+1);
      const cuerpo=estado==='cargando'?'<p class="cargando">Abriendo el capítulo</p>':estado==='error'?'<div class="card"><p>No se pudo abrir el capítulo. La primera vez necesita internet; después queda guardado para leerlo sin conexión.</p></div>'
        :`<article class="lector${pr.oscuro?' lector-oscuro':''}${pr.dosPaginas!==false?' lector-libro':''}" style="--letra:${pr.letra}px" lang="${l.idioma}" tabindex="-1">${cap.bloques.map(bloqueHtml).join('')}</article>
<div class="lec-nav"><button type="button" class="btn ghost btn-chico" id="lec-ant" aria-label="Página anterior">‹ Anterior</button><span class="nota" id="lec-pag" aria-live="polite"></span><button type="button" class="btn ghost btn-chico" id="lec-sig" aria-label="Página siguiente">Siguiente ›</button></div>`;
      return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › <button class="enlace" data-go="${ruta(l.id)}">${esc(l.titulo)}</button> › ${n}</p>
<h1>${esc(c.titulo)}</h1>
<div class="lector-barra" role="toolbar" aria-label="Lector"><button type="button" class="btn ghost btn-chico" data-letra="-1" aria-label="Letra más chica">A−</button><button type="button" class="btn ghost btn-chico" data-letra="1" aria-label="Letra más grande">A+</button>
<button type="button" class="btn ghost btn-chico" id="lec-tema" aria-pressed="${pr.oscuro}">${pr.oscuro?'☀️ Claro':'🌙 Oscuro'}</button><button type="button" class="btn ghost btn-chico lec-paginas" id="lec-paginas" aria-pressed="${pr.dosPaginas!==false}">${pr.dosPaginas!==false?'📄 Una columna':'📖 Dos páginas'}</button>${leido?chip('✅ Leído','ok'):''}</div>
${!l.tecnico?`<p class="nota">👆 ${l.idioma==='en'?'Toca cualquier palabra para oírla, ver su significado y guardarla en tu repaso.':'Toca una palabra antigua o difícil para ver qué significa.'}</p>`:''}
${(datos(l.id).porBuscar||[]).length?`<p class="nota">🔖 Palabras para buscar luego: ${(datos(l.id).porBuscar||[]).map(esc).join(', ')}</p>`:''}
${cuerpo}
${estado==='listo'?`<div class="card lector-fin">${qs.length?`<p><b>¿Lo entendiste?</b> ${qs.length} preguntas cortas sobre este capítulo.</p>${boton({texto:'❓ Responder preguntas',id:'lec-preguntas',clase:'ancho area'})}`:''}
${l.propio&&iaDisponible()?`<p class="etiqueta-actividad">✨ Con IA (opcional)</p><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost btn-chico" data-ia-cap="resumen">Resumen</button><button type="button" class="btn ghost btn-chico" data-ia-cap="preguntas">5 preguntas</button><button type="button" class="btn ghost btn-chico" data-ia-cap="personajes">Personajes y lugares</button></div>
${iaCap?`<div class="card" aria-live="polite">${iaCap.cargando?'<p class="cargando">Pensando</p>':`<p style="white-space:pre-line">${esc(iaCap.texto)}</p>`}</div>`:''}`:''}
${l.tecnico&&c.tema&&PRACTICA[l.materia]?boton({texto:'🎯 Practicar este capítulo',go:PRACTICA[l.materia](c.tema),clase:'ancho area'}):''}
${leido?'':boton({texto:'✅ Marcar como leído',id:'lec-leido',clase:'ancho ghost'})}
${sig?boton({texto:`Siguiente: ${sig.n}. ${esc(sig.titulo)}`,go:ruta(l.id,sig.n),clase:'ancho ghost'}):''}</div>
${l.propio?'<p class="nota">🔒 Solo para mí</p>':`<p class="nota">${esc(l.atribucion)}</p>`}`:''}</div>${htmlPalabra()}`;
    },
    alMostrar(){
      if(ses){ses.alMostrar?.();return}
      if(estado!=='listo')return;
      // volver a donde ibas (una vez, al abrir) y recordar mientras lees. La posición es la fracción leída del capítulo,
      // así sirve igual en una columna (desplazar hacia abajo) que en dos páginas (pasar de lado) y al girar la tablet
      const k=`${l.id}/${n}`,pos=prefs().pos?.[k];
      if(pos&&!this._restaurado){this._restaurado=true;fraccion=pos;requestAnimationFrame(()=>irA(pos))}
      else requestAnimationFrame(()=>irA(fraccion));
      if(!guardarPos){let t=null;guardarPos=()=>{clearTimeout(t);t=setTimeout(()=>{fraccion=leerFraccion();paginas();guardarPrefs(x=>{x.pos={...(x.pos||{}),[k]:fraccion}})},250)};
        addEventListener('scroll',guardarPos,{passive:true});
        // al girar o cambiar de ventana: el mismo punto del texto
        let modo=enLibro();alGirar=()=>{const m=enLibro();if(m!==modo){modo=m;requestAnimationFrame(()=>irA(fraccion))}paginas()};addEventListener('resize',alGirar);
        teclas=e=>{if(!enLibro()||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]')||document.querySelector('.modal-fondo'))return;
          if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();pasar(1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();pasar(-1)}};
        document.addEventListener('keydown',teclas)}
      document.querySelector('.lector')?.addEventListener('scroll',guardarPos,{passive:true});
      paginas();
      document.querySelectorAll('.lector [data-mio-img]').forEach(async im=>{const a=await leerImagenMia(im.dataset.mioImg).catch(()=>null);if(a?.blob)im.src=URL.createObjectURL(a.blob)});
      // «📝 Guardar cita como nota»: aparece al seleccionar texto del capítulo
      if(!this._cita){this._cita=()=>{const sel=getSelection(),dentro=sel&&!sel.isCollapsed&&sel.anchorNode&&document.querySelector('.lector')?.contains(sel.anchorNode);let b=document.getElementById('lec-cita');
        if(dentro&&String(sel).trim().length>3){if(!b){b=document.createElement('button');b.type='button';b.id='lec-cita';b.className='btn lec-cita-btn';b.textContent='📝 Guardar cita como nota';document.body.appendChild(b);b.addEventListener('click',()=>this.alClic(b,()=>{},()=>document.dispatchEvent(new Event('repintar'))))}}else b?.remove()};
        document.addEventListener('selectionchange',this._cita)}
      if(!l.tecnico)document.querySelector('.lector')?.addEventListener('click',e=>{
        if(e.target.closest('button,a'))return;const r=palabraEn(e.clientX,e.clientY);
        if(r){palabra={...r,sig:''};document.dispatchEvent(new Event('repintar'))}});
      document.getElementById('pal-sig')?.addEventListener('input',e=>{if(palabra)palabra.sig=e.target.value});
    },
    async alClic(t,ir,repintar){
      if(ses)return ses.alClic(t,ir,repintar);
      if(t.dataset.letra){fraccion=leerFraccion();guardarPrefs(x=>{x.letra=Math.min(28,Math.max(14,(x.letra||18)+2*t.dataset.letra))});repintar();return true}
      if(t.id==='lec-tema'){fraccion=leerFraccion();guardarPrefs(x=>{x.oscuro=!x.oscuro});repintar();return true}
      if(t.id==='lec-paginas'){fraccion=leerFraccion();guardarPrefs(x=>{x.dosPaginas=x.dosPaginas===false});repintar();return true}
      if(t.id==='lec-ant'||t.id==='lec-sig'){pasar(t.id==='lec-sig'?1:-1);return true}
      if(t.dataset.oir!==undefined){const b=cap.bloques[+t.dataset.oir];hablar(String(b.x).replace(/<br\s*\/?>/g,'. ').replace(/<[^>]+>/g,''),{idioma:voz});return true}
      if(t.id==='lec-leido'){marcarLeido();aviso('✅ Capítulo marcado como leído');repintar();return true}
      if(t.id==='lec-preguntas'){ses=sesionPreguntas();ses.alEntrar();repintar();window.scrollTo(0,0);return true}
      if(t.dataset.decir!==undefined&&palabra){hablar(palabra.w,{idioma:voz});return true}
      if(t.id==='pal-luego'&&palabra){const w=palabra.w.toLowerCase();cambiarExtra('lectura',e=>{e.libros={...(e.libros||{})};const d=e.libros[l.id]={leidos:{},...(e.libros[l.id]||{})};d.porBuscar=[...new Set([...(d.porBuscar||[]),w])].slice(-50)});
        aviso('🔖 Guardada: la verás al inicio del capítulo');palabra=null;repintar();return true}
      if(t.dataset.cerrarPalabra!==undefined){palabra=null;repintar();return true}
      if(t.id==='pal-explicar'&&palabra){traduciendo=true;repintar();
        try{const r=await pedir({sistema:'Eres un diccionario del español para estudiantes de México. Explica en una o dos frases qué significa la palabra en esa oración, sin repetir la oración.',mensajes:[{role:'user',content:`Palabra: "${palabra.w}". Oración: "${palabra.frase}"`}],maxTokens:120});palabra.exp=String(r).trim().slice(0,400)}catch(e){aviso(e.message||'No se pudo explicar.')}
        traduciendo=false;repintar();return true}
      if(t.id==='lec-cita'){const sel=String(getSelection()||'').trim().slice(0,1200);if(!sel)return true;
        await crearNota({titulo:`Cita · ${l.titulo}`,cuerpo:`> ${sel.replace(/\n+/g,'\n> ')}\n\n— *${l.titulo}*${l.autor?`, ${l.autor}`:''}, cap. ${n}: ${c.titulo}`});getSelection()?.removeAllRanges();document.getElementById('lec-cita')?.remove();aviso('📝 Cita guardada en tu Cuaderno');return true}
      if(t.dataset.iaCap){const tipo=t.dataset.iaCap;
        if(!(await confirmar({titulo:'¿Usar la IA con este capítulo?',texto:`Se enviará el texto de ESTE capítulo (no el libro) a ${nombreProveedor()}.`,si:'Enviar'})))return true;
        iaCap={tipo,cargando:true};repintar();
        const texto=cap.bloques.map(b=>String(b.x).replace(/<[^>]+>/g,' ')).join('\n').slice(0,14000);
        const pide={resumen:'Resume este capítulo en 5 a 8 renglones, en español.',preguntas:'Escribe 5 preguntas de comprensión sobre este capítulo, en español, cada una con su respuesta corta.',personajes:'Lista los personajes y los lugares que aparecen en este capítulo, cada uno con una línea de quién o qué es, en español.'}[tipo];
        try{iaCap={tipo,texto:String(await pedir({sistema:'Ayudas a un estudiante a entender un libro que está leyendo. Responde en texto simple, sin Markdown.',mensajes:[{role:'user',content:`${pide}\n\nCapítulo «${c.titulo}»:\n${texto}`}],maxTokens:700})).trim()}}catch(e){iaCap=null;aviso(e.message||'No se pudo usar la IA.')}
        repintar();return true}
      if(t.id==='pal-ia'&&palabra){traduciendo=true;repintar();
        try{const r=await pedir({sistema:'Eres un diccionario inglés-español para estudiantes latinoamericanos. Responde SOLO con la traducción más adecuada en ese contexto (1 a 4 palabras), sin explicaciones.',mensajes:[{role:'user',content:`Palabra: "${palabra.w}". Oración: "${palabra.frase}"`}],maxTokens:40});
          palabra.sig=String(r).trim().replace(/^["«]|["»]$/g,'').slice(0,60)}catch(e){aviso(e.message||'No se pudo traducir.')}
        traduciendo=false;repintar();return true}
      if(t.id==='pal-guardar'&&palabra){const sig=(document.getElementById('pal-sig')?.value||'').trim();
        if(!sig){aviso('Escribe primero qué significa (o tradúcela con IA).');return true}
        agregarTarjeta({q:l.propio?`¿Qué significa «${palabra.w}»?`:`¿Qué significa «${palabra.w}»? — ${palabra.frase}`,a:sig,materia:'lectura',titulo:l.titulo,origen:'lectura'});
        aviso('🃏 Guardada: aparecerá en Repasar');palabra=null;repintar();return true}
    }};
}

// Subrutas de la sección «libro»
export function rutaLibro(resto){
  const [id,n]=resto,l=libro(id);
  if(!l&&esMio(id))return {ruta:ruta(id,n?+n:0),v:{titulo:'Mis libros',async alEntrar(){await cargarMisLibros();if(miLibro(id))document.dispatchEvent(new CustomEvent('ir',{detail:{ruta:ruta(id,n?+n:0),reemplazar:true}}))},vista:()=>'<p class="cargando">Abriendo el libro</p>'}};
  if(!l)return {ruta:RAIZ,v:vistaBiblioteca({tono:'estudio'})};
  if(n&&l.capitulos.some(c=>c.n===+n))return {ruta:ruta(id,+n),v:vistaCapitulo(l,+n)};
  return {ruta:ruta(id),v:vistaPortada(l)};
}
export {LIBROS};
