/* 🔒 Mis libros · pantallas (PROMPT-MIS-LIBROS): la sección en la biblioteca, «📥 Importar un libro» (también arrastrar y
   soltar en la laptop), el progreso («Leyendo el libro… Detectando capítulos… Listo»), los datos editables antes de
   guardar (título, autor, idioma, descripción, emoji y color de la portada, géneros, dificultad) y «Volver a dividir
   capítulos» (renombrar, unir con el siguiente, partir a la mitad). Rutas: estudio/lectura/mis/importar y
   estudio/lectura/mis/<id>/editar. Todo se procesa en el dispositivo, sin internet. */
import {esc} from '../../utilidades.js';
import {aviso,boton,chip} from '../../nucleo/ui.js';
import {importarArchivo,LibroProtegido,AVISO_DRM,contarPalabras} from './importar.js';
import {misLibros,miLibro,guardarLibro,actualizarLibro,leerCapituloMio,reescribirCapitulos,tamano,cargarMisLibros} from './mis-libros.js';

const RAIZ='estudio/lectura';
export const EMOJIS=['📘','📕','📗','📙','🦉','🦊','🐉','🌙','⭐','🌹','⚔️','🏰','🧪','🧠','✈️','🌊','🔍','🎭','🌳','💡'];
export const COLORES=['#4652d0','#b45309','#15803d','#be185d','#0e7490','#7c3aed','#475569','#c2410c'];
export const GENEROS=['Novela','Fantasía','Cuento','Poesía','Ensayo','Texto escolar','Ciencia','Historia','Biografía','Autoayuda','Técnico'];
export const IDIOMAS_MIOS={es:'🇲🇽 Español',en:'🇺🇸 Inglés'};
const ACEPTA='.epub,.pdf,.txt,.md,.markdown,.docx,.azw,.azw3,.kfx,.mobi,application/epub+zip,application/pdf,text/plain,text/markdown';
// Un archivo soltado en la biblioteca espera aquí mientras se abre la pantalla de importar
let pendiente=null;export const dejarArchivo=f=>{pendiente=f};

/* ---------- sección «🔒 Mis libros» arriba de la biblioteca ---------- */
const minutos=(l,p)=>Math.max(1,Math.round(p/(l.idioma==='en'?150:200)));
export const duracionMia=l=>{const m=minutos(l,l.capitulos.reduce((s,c)=>s+c.palabras,0));return m<60?`${m} min`:`${Math.round(m/60)} h`};
export function tarjetaMia(l,leidos=0){
  return `<button class="tarjeta-nav libro-tarjeta" data-go="${RAIZ}/libro/${l.id}"><span class="tarjeta-icono libro-mio-icono" style="--mio:${esc(l.color||'#4652d0')}" aria-hidden="true">${l.icono||'📘'}</span><span><b>${esc(l.titulo)}</b><span class="nota">${esc(l.autor||'Autor desconocido')}</span>
<span class="libro-etiquetas">${[IDIOMAS_MIOS[l.idioma]||l.idioma,l.dificultad,...(l.generos||[]).slice(0,2),'🔒 Solo para mí'].filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</span>
<span class="nota">${leidos?`${leidos}/${l.capitulos.length} capítulos · `:`${l.capitulos.length} capítulos · `}≈ ${duracionMia(l)} · ${tamano(l.bytes||0)}</span></span></button>`;
}
export function htmlMisLibros(leidosDe=()=>0){
  const ls=misLibros();
  return `<section class="mis-libros" aria-labelledby="mis-t"><div class="mis-cab"><h2 id="mis-t">🔒 Mis libros</h2>${boton({texto:'📥 Importar un libro',go:`${RAIZ}/mis/importar`,clase:'area btn-chico'})}</div>
${ls.length?`<div class="pila lib-lista">${ls.map(l=>tarjetaMia(l,leidosDe(l))).join('')}</div>`:`<p class="nota">Sube un libro tuyo (EPUB, PDF, TXT, Markdown o Word) y léelo aquí con el mismo lector. Solo se guarda en este dispositivo.${matchMedia('(pointer:fine)').matches?' También puedes arrastrarlo a esta página.':''}</p>`}</section>`;
}

/* ---------- importar ---------- */
function formMeta(r){
  return `<form id="mis-form" class="pila mis-form" onsubmit="return false">
<label class="campo">Título<input id="mis-titulo" value="${esc(r.titulo||'')}" maxlength="140" required></label>
<label class="campo">Autor<input id="mis-autor" value="${esc(r.autor||'')}" maxlength="120" placeholder="Autor desconocido"></label>
<label class="campo">Idioma<select id="mis-idioma">${Object.entries(IDIOMAS_MIOS).map(([v,t])=>`<option value="${v}"${r.idioma===v?' selected':''}>${t}</option>`).join('')}</select></label>
<label class="campo">Descripción (una línea)<input id="mis-desc" value="${esc(r.descripcion||'')}" maxlength="200"></label>
<fieldset class="exp-grupo"><legend>Portada</legend>${r.portadaUrl?`<p class="nota">La portada del EPUB se usa en la página del libro. El emoji y el color se ven en la biblioteca.</p><img class="mis-portada-prev" src="${r.portadaUrl}" alt="Portada">`:''}
<div class="mis-emojis" role="radiogroup" aria-label="Emoji de la portada">${EMOJIS.map(e=>`<button type="button" class="mis-emoji" data-emoji="${e}" aria-pressed="${(r.icono||'📘')===e}">${e}</button>`).join('')}</div>
<div class="mis-colores" role="radiogroup" aria-label="Color">${COLORES.map(c=>`<button type="button" class="mis-color" data-color="${c}" style="--c:${c}" aria-pressed="${(r.color||COLORES[0])===c}" aria-label="Color ${c}"></button>`).join('')}</div></fieldset>
<fieldset class="exp-grupo"><legend>Etiquetas</legend><div class="filtros">${GENEROS.map(g=>`<button type="button" class="chip-filtro" data-genero="${g}" aria-pressed="${(r.generos||[]).includes(g)}">${g}</button>`).join('')}</div>
<label class="campo">Dificultad (estimada por el largo de oraciones y palabras)<select id="mis-dif">${['Fácil','Media','Difícil'].map(d=>`<option${r.dificultad===d?' selected':''}>${d}</option>`).join('')}</select></label>
<p class="nota">En lugar de una licencia, la etiqueta dice <b>🔒 Solo para mí</b>.</p></fieldset></form>`;
}
function htmlCapitulos(caps){
  return `<h2>Capítulos (${caps.length})</h2><p class="nota">Revisa que estén bien divididos. Puedes renombrar, unir un capítulo con el siguiente o partirlo en dos.</p>
<ol class="mis-caps">${caps.map((c,i)=>`<li><div class="mis-cap-fila"><input class="mis-cap-titulo" data-i="${i}" value="${esc(c.titulo)}" aria-label="Título del capítulo ${i+1}">
<span class="nota">≈ ${Math.max(1,Math.round(contarPalabras(c.bloques)/200))} min</span></div><div class="row" style="gap:6px;flex-wrap:wrap">
${i<caps.length-1?`<button type="button" class="btn ghost btn-chico" data-unir="${i}">⤵ Unir con el siguiente</button>`:''}${c.bloques.length>1?`<button type="button" class="btn ghost btn-chico" data-partir="${i}">✂️ Partir en dos</button>`:''}</div></li>`).join('')}</ol>`;
}
const leerForm=r=>{const v=id=>document.getElementById(id)?.value?.trim()||'';
  r.titulo=v('mis-titulo')||r.titulo;r.autor=v('mis-autor');r.idioma=v('mis-idioma')||r.idioma;r.descripcion=v('mis-desc');r.dificultad=v('mis-dif')||r.dificultad;
  document.querySelectorAll('.mis-cap-titulo').forEach(x=>{const c=r.capitulos[+x.dataset.i];if(c)c.titulo=x.value.trim()||c.titulo})};
function clicCapitulos(t,r){
  if(t.dataset.unir!==undefined){leerForm(r);const i=+t.dataset.unir,[a,b]=[r.capitulos[i],r.capitulos[i+1]];r.capitulos.splice(i,2,{titulo:a.titulo,bloques:[...a.bloques,...b.bloques]});return true}
  if(t.dataset.partir!==undefined){leerForm(r);const i=+t.dataset.partir,c=r.capitulos[i];let total=contarPalabras(c.bloques),acc=0,k=1;
    for(;k<c.bloques.length-1;k++){acc+=contarPalabras([c.bloques[k-1]]);if(acc>=total/2)break}
    const h=c.bloques[k]?.t==='h'?c.bloques[k].x.replace(/<[^>]+>/g,''):`${c.titulo} (2)`;r.capitulos.splice(i,1,{titulo:c.titulo,bloques:c.bloques.slice(0,k)},{titulo:h,bloques:c.bloques.slice(k)});return true}
  if(t.dataset.emoji){r.icono=t.dataset.emoji;return true}
  if(t.dataset.color){r.color=t.dataset.color;return true}
  if(t.dataset.genero){leerForm(r);const g=t.dataset.genero,s=new Set(r.generos||[]);s.has(g)?s.delete(g):s.add(g);r.generos=[...s];return true}
  return false;
}
export function vistaImportar(){
  let estado='elegir',progreso='',r=null,error='',protegido=false,sinTexto=null;
  async function procesar(file,{ocr=false}={}){
    estado='leyendo';progreso='Leyendo el libro…';error='';protegido=false;document.dispatchEvent(new Event('repintar'));
    const alProgreso=t=>{progreso=t;const el=document.getElementById('mis-progreso');if(el)el.textContent=t};
    try{
      let ocrFn=null;
      if(ocr){const {createWorker}=await import('tesseract.js');const w=await createWorker('spa',1);ocrFn=async c=>{const x=await w.recognize(c);return x.data.text};}
      r=await importarArchivo(file,{alProgreso,ocr:ocrFn});
      r.icono=r.idioma==='en'?'📘':'📕';r.color=COLORES[0];r.generos=[];
      if(r.portada?.blob)r.portadaUrl=URL.createObjectURL(r.portada.blob);
      progreso='Listo';estado='revisar';
    }catch(e){
      if(e instanceof LibroProtegido){protegido=true;error=AVISO_DRM}
      else if(e.message==='SIN_TEXTO'){sinTexto=file;error='Este PDF no tiene texto (es una imagen escaneada).'}
      else error=e.message||'No se pudo leer el archivo.';
      estado='error';
    }
    document.dispatchEvent(new Event('repintar'));
  }
  return {titulo:'Importar un libro',
    alEntrar(){if(estado!=='leyendo'){estado='elegir';r=null;error='';protegido=false;sinTexto=null}if(pendiente){const f=pendiente;pendiente=null;procesar(f)}},
    vista(){
      const miga=`<p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › 🔒 Importar un libro</p>`;
      if(estado==='leyendo')return `<div class="area-estudio">${miga}<h1>📥 Importar un libro</h1><div class="card mis-leyendo"><p class="cargando" id="mis-progreso" aria-live="polite">${esc(progreso)}</p><p class="nota">Todo se procesa en este dispositivo, sin internet.</p></div></div>`;
      if(estado==='error')return `<div class="area-estudio">${miga}<h1>📥 Importar un libro</h1><div class="card ${protegido?'mis-drm':''}" role="alert"><p>${protegido?'🔒 ':'⚠️ '}<b>${esc(error)}</b></p>
${protegido?'<p class="nota">Los libros con protección (DRM) solo se pueden leer en la app de la tienda donde los compraste.</p>':''}
${sinTexto?`<p class="nota">Puedo reconocer el texto de las páginas (el mismo reconocimiento de Foto a nota). Tarda varios segundos por página y funciona mejor con letra clara; la primera vez descarga el idioma.</p>${boton({texto:'🔎 Reconocer el texto',id:'mis-ocr',clase:'ancho area'})}`:''}
${boton({texto:'Elegir otro archivo',id:'mis-otro',clase:'ancho ghost'})}</div></div>`;
      if(estado==='revisar')return `<div class="area-estudio">${miga}<h1>Revisa tu libro</h1><p class="nota">${esc(r.formato)} · ${r.capitulos.length} capítulos · solo se guarda en este dispositivo.</p>
${formMeta(r)}${htmlCapitulos(r.capitulos)}<div class="pila">${boton({texto:'💾 Guardar en Mis libros',id:'mis-guardar',clase:'ancho area'})}${boton({texto:'Cancelar',go:RAIZ,clase:'ancho ghost'})}</div></div>`;
      return `<div class="area-estudio">${miga}<h1>📥 Importar un libro</h1>
<p class="intro">Elige un libro tuyo y se convierte al formato del lector: capítulos, letra grande, modo oscuro, audio y palabras al repaso.</p>
<label class="mis-soltar" for="mis-archivo"><span class="mis-soltar-icono" aria-hidden="true">📥</span><b>Elegir un archivo</b><span class="nota">EPUB (el mejor), PDF con texto, TXT, Markdown o Word (.docx)</span></label>
<input type="file" id="mis-archivo" class="oculto-visual" accept="${ACEPTA}">
<div class="card"><p class="etiqueta-actividad">🔒 Privado</p><p class="nota">El libro se queda en este dispositivo: no se sube a ningún lado, no entra a la sincronización ni a la invitación, y el respaldo solo lo incluye si tú lo pides. No se pueden abrir libros con protección contra copia (DRM).</p></div></div>`;
    },
    alMostrar(){
      const inp=document.getElementById('mis-archivo');inp?.addEventListener('change',()=>{const f=inp.files?.[0];if(f)procesar(f)});
      const z=document.querySelector('.mis-soltar');
      z?.addEventListener('dragover',e=>{e.preventDefault();z.classList.add('encima')});z?.addEventListener('dragleave',()=>z.classList.remove('encima'));
      z?.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer?.files?.[0];if(f)procesar(f)});
    },
    async alClic(t,ir,repintar){
      if(t.id==='mis-otro'){estado='elegir';sinTexto=null;repintar();return true}
      if(t.id==='mis-ocr'&&sinTexto){const f=sinTexto;sinTexto=null;procesar(f,{ocr:true});return true}
      if(estado==='revisar'&&clicCapitulos(t,r)){repintar();return true}
      if(t.id==='mis-guardar'&&r){leerForm(r);if(!r.titulo){aviso('Escribe el título.');return true}
        t.disabled=true;t.textContent='Guardando…';
        try{const l=await guardarLibro(r,{titulo:r.titulo,autor:r.autor,idioma:r.idioma,descripcion:r.descripcion,icono:r.icono,color:r.color,generos:r.generos,dificultad:r.dificultad,formato:r.formato});
          if(r.portadaUrl)URL.revokeObjectURL(r.portadaUrl);aviso('📚 Libro guardado en Mis libros');ir(`${RAIZ}/libro/${l.id}`)}
        catch(e){console.error(e);aviso('No se pudo guardar (¿falta espacio?).');t.disabled=false;t.textContent='💾 Guardar en Mis libros'}
        return true}
    }};
}

/* ---------- editar un libro ya guardado (⋯ → Editar / Volver a dividir capítulos) ---------- */
export function vistaEditar(id){
  let r=null;
  return {titulo:'Editar libro',
    async alEntrar(){await cargarMisLibros();const l=miLibro(id);if(!l)return;
      const caps=[];for(const c of l.capitulos)caps.push({titulo:c.titulo,bloques:(await leerCapituloMio(id,c.n)).bloques});
      r={...l,capitulos:caps};document.dispatchEvent(new Event('repintar'))},
    vista(){
      if(!r)return '<p class="cargando">Abriendo el libro</p>';
      return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">📚 Lectura</button> › <button class="enlace" data-go="${RAIZ}/libro/${id}">${esc(r.titulo)}</button> › Editar</p>
<h1>Editar «${esc(r.titulo)}»</h1>${formMeta(r)}${htmlCapitulos(r.capitulos)}<div class="pila">${boton({texto:'💾 Guardar cambios',id:'mis-guardar-ed',clase:'ancho area'})}${boton({texto:'Cancelar',go:`${RAIZ}/libro/${id}`,clase:'ancho ghost'})}</div></div>`},
    async alClic(t,ir,repintar){
      if(r&&clicCapitulos(t,r)){repintar();return true}
      if(t.id==='mis-guardar-ed'&&r){leerForm(r);
        await actualizarLibro(id,{titulo:r.titulo,autor:r.autor,idioma:r.idioma,descripcion:r.descripcion,icono:r.icono,color:r.color,generos:r.generos,dificultad:r.dificultad});
        await reescribirCapitulos(id,r.capitulos);aviso('✅ Cambios guardados');ir(`${RAIZ}/libro/${id}`);return true}
    }};
}
export function rutaMis(resto){
  const [a,b]=resto;
  if(a==='importar')return {ruta:`${RAIZ}/mis/importar`,v:vistaImportar()};
  if(a&&b==='editar')return {ruta:`${RAIZ}/mis/${a}/editar`,v:vistaEditar(a)};
  return {ruta:`${RAIZ}/mis/importar`,v:vistaImportar()};
}
export {chip};
