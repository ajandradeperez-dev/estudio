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

const RAIZ='estudio/lectura';
const BASE=import.meta.env?.BASE_URL||'/';
const libro=id=>LIBROS.find(l=>l.id===id);
const ruta=(id,n)=>`${RAIZ}/libro/${id}${n?`/${n}`:''}`;
const datos=id=>datosMateria(progreso(),'lectura').extra.libros?.[id]||{leidos:{}};
const PRACTICA={python:t=>`cursos/python/${t}`,'ciencia-datos':t=>`estudio/ciencia-datos/${t}`};
// Preferencias del lector (solo una comodidad de este teléfono)
const CLAVE='ciberlab-lectura';
const prefs=()=>{try{return {letra:18,oscuro:false,pos:{},...JSON.parse(localStorage.getItem(CLAVE)||'{}')}}catch(e){return {letra:18,oscuro:false,pos:{}}}};
const guardarPrefs=f=>{try{const x=prefs();f(x);localStorage.setItem(CLAVE,JSON.stringify(x))}catch(e){}};
// Capítulos descargados (en memoria mientras la app está abierta)
const cache=new Map();
async function cargarCapitulo(id,n){
  const k=`${id}/${n}`;if(cache.has(k))return cache.get(k);
  const r=await fetch(`${BASE}libros/${id}/${n}.json`);if(!r.ok)throw new Error(r.status);
  const c=await r.json();cache.set(k,c);return c;
}

/* ---------- biblioteca (página de la materia): filtros, buscador y secciones ---------- */
// Filtros por idioma, género y nivel (se combinan y se recuerdan en este teléfono) y búsqueda por título o autor
const minutos=(l,palabras)=>Math.max(1,Math.round(palabras/(l.idioma==='en'?150:200)));
export const duracion=l=>{const m=minutos(l,l.capitulos.reduce((s,c)=>s+c.palabras,0));return m<60?`${m} min`:`${Math.round(m/60)} h`};
const IDIOMAS={es:'🇲🇽 Español',en:'🇺🇸 Inglés'};
const ORDEN_NIVEL=['A1','A2','B1','B2','C1','Fácil','Media','Avanzada','Introductorio','Universitario'];
const leidos=l=>Object.keys(datos(l.id).leidos||{}).length;
const sinAcentos=t=>String(t).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
function tarjetaLibro(l){
  const h=leidos(l);
  return `<button class="tarjeta-nav libro-tarjeta" data-go="${ruta(l.id)}"><span class="tarjeta-icono" aria-hidden="true">${l.icono}</span><span><b>${esc(l.titulo)}</b><span class="nota">${esc(l.autor)}</span>
<span class="libro-etiquetas">${[IDIOMAS[l.idioma],(l.niveles||[l.nivel]).join('–'),...(l.generos||[]).slice(0,2),l.relacionada?`📐 ${l.relacionada}`:''].filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</span>
${h?barra(h,l.capitulos.length):''}<span class="nota">${h?`${h}/${l.capitulos.length} capítulos · `:`${l.capitulos.length} capítulos · `}≈ ${duracion(l)} · ${esc(l.licencia)}</span></span></button>`;
}
export function vistaBiblioteca(m){
  let buscar='';
  const filtros=()=>prefs().filtros||{};
  const pasa=(l,f)=>(!f.idioma||l.idioma===f.idioma)&&(!f.genero||(l.generos||[]).includes(f.genero))&&(!f.nivel||(l.niveles||[l.nivel]).includes(f.nivel))
    &&(!buscar||sinAcentos(`${l.titulo} ${l.autor}`).includes(buscar));
  const chips=(clave,opciones,f)=>`<div class="filtros" role="group" aria-label="${clave}"><button type="button" class="chip-filtro" data-filtro="${clave}" data-valor="" aria-pressed="${!f[clave]}">Todos</button>${opciones.map(([v,t])=>`<button type="button" class="chip-filtro" data-filtro="${clave}" data-valor="${esc(v)}" aria-pressed="${f[clave]===v}">${esc(t)}</button>`).join('')}</div>`;
  const lista=()=>{const f=filtros(),todos=LIBROS.filter(l=>pasa(l,f));
    const continuar=todos.filter(l=>{const h=leidos(l);return h&&h<l.capitulos.length}),faciles=['es','en'].map(i=>todos.filter(l=>l.idioma===i&&!l.tecnico).sort((a,b)=>ORDEN_NIVEL.indexOf((a.niveles||[a.nivel])[0])-ORDEN_NIVEL.indexOf((b.niveles||[b.nivel])[0]))[0]).filter(Boolean);
    if(!todos.length)return `<p class="nota" style="text-align:center">Ningún libro coincide con esos filtros.</p>`;
    return `${continuar.length?`<h2>📖 Continuar leyendo</h2><div class="pila">${continuar.map(tarjetaLibro).join('')}</div>`:''}
${faciles.length&&!buscar?`<h2>🌱 Para empezar</h2><div class="pila">${faciles.map(tarjetaLibro).join('')}</div>`:''}
<h2>📚 Todos · ${todos.length}</h2><div class="pila">${todos.map(tarjetaLibro).join('')}</div>`};
  return {titulo:'Lectura',vista(){
    const f=filtros(),generos=[...new Set(LIBROS.flatMap(l=>l.generos||[]))].sort(),niveles=ORDEN_NIVEL.filter(n=>LIBROS.some(l=>(l.niveles||[l.nivel]).includes(n)));
    return `<div class="area-${m.tono||'estudio'}">${cabecera({icono:'📚',titulo:'Lectura',desc:'Libros libres para leer en el teléfono, también sin internet.'})}
<p class="intro">Todos son de dominio público o tienen una licencia abierta que permite compartirlos. Toca una palabra para ver qué significa (en inglés, también oírla y guardarla en tu repaso).</p>
<label class="buscar"><span class="oculto-visual">Buscar por título o autor</span><input type="search" id="lib-buscar" placeholder="🔎 Título o autor" value="${esc(buscar)}" autocomplete="off"></label>
<details class="nota-datos lib-filtros"${f.idioma||f.genero||f.nivel?' open':''}><summary>Filtrar${f.idioma||f.genero||f.nivel?' (activos)':''}</summary>
<p class="prog-k">Idioma</p>${chips('idioma',Object.entries(IDIOMAS),f)}<p class="prog-k">Género</p>${chips('genero',generos.map(g=>[g,g]),f)}<p class="prog-k">Nivel</p>${chips('nivel',niveles.map(n=>[n,n]),f)}</details>
<div id="lib-lista">${lista()}</div></div>`},
    alMostrar(){const b=document.getElementById('lib-buscar');b?.addEventListener('input',()=>{buscar=sinAcentos(b.value.trim());document.getElementById('lib-lista').innerHTML=lista()})},
    alClic(t,ir,repintar){if(t.dataset.filtro){const k=t.dataset.filtro,v=t.dataset.valor;guardarPrefs(x=>{x.filtros={...(x.filtros||{}),[k]:v||undefined}});repintar();return true}}
  };
}

/* ---------- portada de un libro ---------- */
function vistaPortada(l){
  return {titulo:l.titulo,vista(){
    const d=datos(l.id),leidosL=d.leidos||{},sig=l.capitulos.find(c=>!leidosL[c.n])||l.capitulos[0];
    return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › ${esc(l.titulo)}</p>
<div class="libro-portada"><span class="libro-icono" aria-hidden="true">${l.icono}</span><div><h1>${esc(l.titulo)}</h1><p class="lead">${esc(l.autor)}</p>
<div class="row" style="gap:6px;flex-wrap:wrap">${chip(IDIOMAS[l.idioma])}${chip(esc((l.niveles||[l.nivel]).join('–')))}${(l.generos||[]).map(g=>chip(esc(g))).join('')}${l.relacionada?chip(`📐 ${esc(l.relacionada)}`):''}${chip(`⏱️ ≈ ${duracion(l)}`)}${chip('📜 '+esc(l.licencia))}</div></div></div>
<p>${esc(l.descripcion)}</p>
${boton({texto:`${Object.keys(leidosL).length?'▶ Seguir':'▶ Empezar'}: ${sig.n}. ${esc(sig.titulo)}`,go:ruta(l.id,sig.n),clase:'ancho area'})}
<h2>Capítulos</h2><ol class="capitulos">${l.capitulos.map(c=>`<li><button class="capitulo${leidosL[c.n]?' leido':''}" data-go="${ruta(l.id,c.n)}"><span>${leidosL[c.n]?'✅':c.n}</span><span><b>${esc(c.titulo)}</b><span class="nota">≈ ${minutos(l,c.palabras)} min${PREGUNTAS[l.id]?.[c.n-1]?` · ${PREGUNTAS[l.id][c.n-1].length} preguntas`:''}</span></span></button></li>`).join('')}</ol>
<div class="card licencia"><p class="etiqueta-actividad">📜 Licencia y atribución</p><p>${esc(l.atribucion)}</p><p class="nota">Licencia: <b>${esc(l.licencia)}</b>. Fuente: <a href="${esc(l.fuente)}" target="_blank" rel="noopener">${esc(l.fuente)}</a></p></div></div>`}};
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
  let estado='cargando',cap=null,palabra=null,ses=null,traduciendo=false,guardarPos=null;
  // preguntas escritas a mano (preguntas.js) o, en español, las de «completa la frase» que trae el capítulo
  let qs=PREGUNTAS[l.id]?.[n-1]||[];
  const voz=l.idioma==='en'?'en-US':'es-MX',conVoz=!l.tecnico&&soporte.hablar;
  const bloqueHtml=(b,i)=>b.t==='h'?`<h2 class="lec-bloque">${b.x}</h2>`:b.t==='code'?`<pre class="py-salida">${esc(b.x)}</pre>`:b.t==='fuente'?`<p class="nota"><a href="${esc(b.x)}" target="_blank" rel="noopener">Ver esta sección con sus figuras e interactivos en el sitio original ↗</a></p>`
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
  function marcarLeido(){cambiarExtra('lectura',e=>{e.libros={...(e.libros||{})};const d=e.libros[l.id]={leidos:{},...(e.libros[l.id]||{})};d.leidos={...d.leidos,[n]:d.leidos[n]||hoy()};d.ultimo=n})}
  function htmlPalabra(){
    if(!palabra)return '';
    if(l.idioma==='es'){const def=definicion(palabra.w,palabra.frase);
      return `<div class="modal-fondo lec-palabra"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="pal-t">
<h2 id="pal-t">${esc(palabra.w)} ${soporte.hablar?`<button type="button" class="btn-icono" data-decir aria-label="Escuchar">🔊</button>`:''}</h2>
<p class="nota">«${esc(palabra.frase)}»</p>
${def?`<p><b>${esc(def.palabra)}:</b> ${esc(def.significado)}</p>${def.nota?`<p class="nota">${esc(def.nota)}</p>`:''}`:'<p class="nota">No está en el glosario de palabras antiguas del libro.</p>'}
<div class="pila">${def?'':`<button type="button" class="btn ancho" id="pal-luego">🔖 Guardar para buscar luego</button>`}
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
    alSalir(){ses?.alSalir?.();if(guardarPos)removeEventListener('scroll',guardarPos);guardarPos=null},
    vista(){
      if(ses)return ses.vista();
      const pr=prefs(),leido=datos(l.id).leidos?.[n],sig=l.capitulos.find(x=>x.n===n+1);
      const cuerpo=estado==='cargando'?'<p class="cargando">Abriendo el capítulo</p>':estado==='error'?'<div class="card"><p>No se pudo abrir el capítulo. La primera vez necesita internet; después queda guardado para leerlo sin conexión.</p></div>'
        :`<article class="lector${pr.oscuro?' lector-oscuro':''}" style="--letra:${pr.letra}px" lang="${l.idioma}">${cap.bloques.map(bloqueHtml).join('')}</article>`;
      return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › <button class="enlace" data-go="${ruta(l.id)}">${esc(l.titulo)}</button> › ${n}</p>
<h1>${esc(c.titulo)}</h1>
<div class="lector-barra" role="toolbar" aria-label="Lector"><button type="button" class="btn ghost btn-chico" data-letra="-1" aria-label="Letra más chica">A−</button><button type="button" class="btn ghost btn-chico" data-letra="1" aria-label="Letra más grande">A+</button>
<button type="button" class="btn ghost btn-chico" id="lec-tema" aria-pressed="${pr.oscuro}">${pr.oscuro?'☀️ Claro':'🌙 Oscuro'}</button>${leido?chip('✅ Leído','ok'):''}</div>
${!l.tecnico?`<p class="nota">👆 ${l.idioma==='en'?'Toca cualquier palabra para oírla, ver su significado y guardarla en tu repaso.':'Toca una palabra antigua o difícil para ver qué significa.'}</p>`:''}
${(datos(l.id).porBuscar||[]).length?`<p class="nota">🔖 Palabras para buscar luego: ${(datos(l.id).porBuscar||[]).map(esc).join(', ')}</p>`:''}
${cuerpo}
${estado==='listo'?`<div class="card lector-fin">${qs.length?`<p><b>¿Lo entendiste?</b> ${qs.length} preguntas cortas sobre este capítulo.</p>${boton({texto:'❓ Responder preguntas',id:'lec-preguntas',clase:'ancho area'})}`:''}
${l.tecnico&&c.tema&&PRACTICA[l.materia]?boton({texto:'🎯 Practicar este capítulo',go:PRACTICA[l.materia](c.tema),clase:'ancho area'}):''}
${leido?'':boton({texto:'✅ Marcar como leído',id:'lec-leido',clase:'ancho ghost'})}
${sig?boton({texto:`Siguiente: ${sig.n}. ${esc(sig.titulo)}`,go:ruta(l.id,sig.n),clase:'ancho ghost'}):''}</div>
<p class="nota">${esc(l.atribucion)}</p>`:''}</div>${htmlPalabra()}`;
    },
    alMostrar(){
      if(ses){ses.alMostrar?.();return}
      if(estado!=='listo')return;
      // volver a donde ibas (una vez, al abrir) y recordar mientras lees
      const k=`${l.id}/${n}`,pos=prefs().pos?.[k];
      if(pos&&!this._restaurado){this._restaurado=true;requestAnimationFrame(()=>window.scrollTo(0,pos*(document.documentElement.scrollHeight-innerHeight)))}
      if(!guardarPos){let t=null;guardarPos=()=>{clearTimeout(t);t=setTimeout(()=>{const h=document.documentElement.scrollHeight-innerHeight;if(h>0)guardarPrefs(x=>{x.pos={...(x.pos||{}),[k]:scrollY/h}})},400)};addEventListener('scroll',guardarPos,{passive:true})}
      if(!l.tecnico)document.querySelector('.lector')?.addEventListener('click',e=>{
        if(e.target.closest('button,a'))return;const r=palabraEn(e.clientX,e.clientY);
        if(r){palabra={...r,sig:''};document.dispatchEvent(new Event('repintar'))}});
      document.getElementById('pal-sig')?.addEventListener('input',e=>{if(palabra)palabra.sig=e.target.value});
    },
    async alClic(t,ir,repintar){
      if(ses)return ses.alClic(t,ir,repintar);
      if(t.dataset.letra){guardarPrefs(x=>{x.letra=Math.min(28,Math.max(14,(x.letra||18)+2*t.dataset.letra))});repintar();return true}
      if(t.id==='lec-tema'){guardarPrefs(x=>{x.oscuro=!x.oscuro});repintar();return true}
      if(t.dataset.oir!==undefined){const b=cap.bloques[+t.dataset.oir];hablar(String(b.x).replace(/<br\s*\/?>/g,'. ').replace(/<[^>]+>/g,''),{idioma:voz});return true}
      if(t.id==='lec-leido'){marcarLeido();aviso('✅ Capítulo marcado como leído');repintar();return true}
      if(t.id==='lec-preguntas'){ses=sesionPreguntas();ses.alEntrar();repintar();window.scrollTo(0,0);return true}
      if(t.dataset.decir!==undefined&&palabra){hablar(palabra.w,{idioma:voz});return true}
      if(t.id==='pal-luego'&&palabra){const w=palabra.w.toLowerCase();cambiarExtra('lectura',e=>{e.libros={...(e.libros||{})};const d=e.libros[l.id]={leidos:{},...(e.libros[l.id]||{})};d.porBuscar=[...new Set([...(d.porBuscar||[]),w])].slice(-50)});
        aviso('🔖 Guardada: la verás al inicio del capítulo');palabra=null;repintar();return true}
      if(t.dataset.cerrarPalabra!==undefined){palabra=null;repintar();return true}
      if(t.id==='pal-ia'&&palabra){traduciendo=true;repintar();
        try{const r=await pedir({sistema:'Eres un diccionario inglés-español para estudiantes latinoamericanos. Responde SOLO con la traducción más adecuada en ese contexto (1 a 4 palabras), sin explicaciones.',mensajes:[{role:'user',content:`Palabra: "${palabra.w}". Oración: "${palabra.frase}"`}],maxTokens:40});
          palabra.sig=String(r).trim().replace(/^["«]|["»]$/g,'').slice(0,60)}catch(e){aviso(e.message||'No se pudo traducir.')}
        traduciendo=false;repintar();return true}
      if(t.id==='pal-guardar'&&palabra){const sig=(document.getElementById('pal-sig')?.value||'').trim();
        if(!sig){aviso('Escribe primero qué significa (o tradúcela con IA).');return true}
        agregarTarjeta({q:`¿Qué significa «${palabra.w}»? — ${palabra.frase}`,a:sig,materia:'lectura',titulo:l.titulo,origen:'lectura'});
        aviso('🃏 Guardada: aparecerá en Repasar');palabra=null;repintar();return true}
    }};
}

// Subrutas de la sección «libro»
export function rutaLibro(resto){
  const [id,n]=resto,l=libro(id);
  if(!l)return {ruta:RAIZ,v:vistaBiblioteca({tono:'estudio'})};
  if(n&&l.capitulos.some(c=>c.n===+n))return {ruta:ruta(id,+n),v:vistaCapitulo(l,+n)};
  return {ruta:ruta(id),v:vistaPortada(l)};
}
export {LIBROS};
