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

/* ---------- biblioteca (página de la materia) ---------- */
export function vistaBiblioteca(m){
  return {titulo:'Lectura',vista(){
    const grupo=(t,lista)=>`<h2>${t}</h2><div class="pila">${lista.map(l=>{const d=datos(l.id),h=Object.keys(d.leidos||{}).length;
      return `<button class="tarjeta-nav libro-tarjeta" data-go="${ruta(l.id)}"><span class="tarjeta-icono" aria-hidden="true">${l.icono}</span><span><b>${esc(l.titulo)}</b><span class="nota">${esc(l.autor)} · ${esc(l.nivel)}</span>${barra(h,l.capitulos.length)}<span class="nota">${h}/${l.capitulos.length} capítulos · ${esc(l.licencia)}</span></span></button>`}).join('')}</div>`;
    return `<div class="area-${m.tono||'estudio'}">${cabecera({icono:'📚',titulo:'Lectura',desc:'Libros libres para leer en el teléfono, también sin internet.'})}
<p class="intro">Todos son de dominio público o tienen una licencia abierta que permite compartirlos. En los libros en inglés toca una palabra para oírla, ver su significado y guardarla en tu repaso.</p>
${grupo('🇺🇸 Para practicar inglés',LIBROS.filter(l=>!l.tecnico))}${grupo('🧰 Lecturas de apoyo de los cursos',LIBROS.filter(l=>l.tecnico))}</div>`}};
}

/* ---------- portada de un libro ---------- */
function vistaPortada(l){
  return {titulo:l.titulo,vista(){
    const d=datos(l.id),leidos=d.leidos||{},sig=l.capitulos.find(c=>!leidos[c.n])||l.capitulos[0],min=c=>Math.max(1,Math.round(c.palabras/(l.idioma==='en'?150:200)));
    return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › ${esc(l.titulo)}</p>
<div class="libro-portada"><span class="libro-icono" aria-hidden="true">${l.icono}</span><div><h1>${esc(l.titulo)}</h1><p class="lead">${esc(l.autor)}</p>
<div class="row" style="gap:6px;flex-wrap:wrap">${chip(esc(l.nivel))}${chip(l.idioma==='en'?'🇺🇸 En inglés':'Español')}${chip('📜 '+esc(l.licencia))}</div></div></div>
<p>${esc(l.descripcion)}</p>
${boton({texto:`${Object.keys(leidos).length?'▶ Seguir':'▶ Empezar'}: ${sig.n}. ${esc(sig.titulo)}`,go:ruta(l.id,sig.n),clase:'ancho area'})}
<h2>Capítulos</h2><ol class="capitulos">${l.capitulos.map(c=>`<li><button class="capitulo${leidos[c.n]?' leido':''}" data-go="${ruta(l.id,c.n)}"><span>${leidos[c.n]?'✅':c.n}</span><span><b>${esc(c.titulo)}</b><span class="nota">≈ ${min(c)} min${PREGUNTAS[l.id]?.[c.n-1]?` · ${PREGUNTAS[l.id][c.n-1].length} preguntas`:''}</span></span></button></li>`).join('')}</ol>
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
  const qs=PREGUNTAS[l.id]?.[n-1]||[];
  const bloqueHtml=(b,i)=>b.t==='h'?`<h2 class="lec-bloque">${b.x}</h2>`:b.t==='code'?`<pre class="py-salida">${esc(b.x)}</pre>`:b.t==='fuente'?`<p class="nota"><a href="${esc(b.x)}" target="_blank" rel="noopener">Ver esta sección con sus figuras e interactivos en el sitio original ↗</a></p>`
    :`<div class="lec-parrafo"><${b.t==='li'?'p class="lec-bloque lec-li"':'p class="lec-bloque"'} lang="${l.idioma}">${b.t==='li'?'• ':''}${b.x}</p>${l.idioma==='en'&&!l.tecnico&&soporte.hablar?`<button type="button" class="btn-icono lec-oir" data-oir="${i}" aria-label="Escuchar este párrafo" title="Escuchar">🔊</button>`:''}</div>`;
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
      try{cap=await cargarCapitulo(l.id,n);estado='listo'}catch(e){estado='error'}
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
${l.idioma==='en'&&!l.tecnico?'<p class="nota">👆 Toca cualquier palabra para oírla, ver su significado y guardarla en tu repaso.</p>':''}
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
      if(l.idioma==='en'&&!l.tecnico)document.querySelector('.lector')?.addEventListener('click',e=>{
        if(e.target.closest('button,a'))return;const r=palabraEn(e.clientX,e.clientY);
        if(r){palabra={...r,sig:''};document.dispatchEvent(new Event('repintar'))}});
      document.getElementById('pal-sig')?.addEventListener('input',e=>{if(palabra)palabra.sig=e.target.value});
    },
    async alClic(t,ir,repintar){
      if(ses)return ses.alClic(t,ir,repintar);
      if(t.dataset.letra){guardarPrefs(x=>{x.letra=Math.min(28,Math.max(14,(x.letra||18)+2*t.dataset.letra))});repintar();return true}
      if(t.id==='lec-tema'){guardarPrefs(x=>{x.oscuro=!x.oscuro});repintar();return true}
      if(t.dataset.oir!==undefined){const b=cap.bloques[+t.dataset.oir];hablar(String(b.x).replace(/<[^>]+>/g,''),{idioma:'en-US'});return true}
      if(t.id==='lec-leido'){marcarLeido();aviso('✅ Capítulo marcado como leído');repintar();return true}
      if(t.id==='lec-preguntas'){ses=sesionPreguntas();ses.alEntrar();repintar();window.scrollTo(0,0);return true}
      if(t.dataset.decir!==undefined&&palabra){hablar(palabra.w,{idioma:'en-US'});return true}
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
