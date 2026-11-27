/* 🔒 Mis libros · importar (PROMPT-MIS-LIBROS): convierte un archivo del usuario al MISMO formato de los libros de Lectura
   ({titulo, autor, idioma, capitulos:[{n, titulo, palabras}]} y cada capítulo {bloques:[{t, x}]}), todo en el dispositivo.
   - EPUB: content.opf (metadatos y orden de lectura), nav.xhtml o toc.ncx (títulos), portada e imágenes (comprimidas);
     el HTML se sanea: solo encabezados, párrafos, listas, citas, versos, imágenes y b/i/sup/sub/br.
   - PDF (pdf.js, se carga SOLO al importar un PDF): reconstruye párrafos, une las palabras partidas con guion, quita
     encabezados y pies que se repiten y los números de página, y detecta capítulos por tamaño de letra o por patrones.
   - TXT y Markdown: capítulos por «#» o «Capítulo…/Chapter…», párrafos por líneas en blanco.
   - DOCX: word/document.xml (estilos de título → capítulos; negrita y cursiva).
   - DRM: un EPUB con cifrado de contenido (encryption.xml que no sea solo de fuentes) o rights.xml de Adobe, y los Kindle
     .azw/.azw3/.kfx, NO se abren: se avisa con amabilidad. No se quita ningún DRM.
   Sin DOM salvo DOMParser y canvas (para las imágenes). */

export class LibroProtegido extends Error{constructor(m){super(m);this.name='LibroProtegido'}}
export const AVISO_DRM='Este libro está protegido contra copia (DRM) y no se puede abrir aquí. Usa un EPUB o PDF sin DRM.';

/* ---------- ZIP (EPUB y DOCX): lectura con DecompressionStream('deflate-raw') ---------- */
async function inflar(datos){
  const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(datos);w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
export async function leerZip(buf){
  const b=new Uint8Array(buf),v=new DataView(b.buffer,b.byteOffset,b.byteLength),dec=new TextDecoder();
  let fin=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){fin=i;break}
  if(fin<0)throw new Error('No es un archivo ZIP válido.');
  const n=v.getUint16(fin+10,true);let p=v.getUint32(fin+16,true);const archivos=new Map();
  for(let k=0;k<n;k++){
    if(v.getUint32(p,true)!==0x02014b50)break;
    const metodo=v.getUint16(p+10,true),comp=v.getUint32(p+20,true),ln=v.getUint16(p+28,true),le=v.getUint16(p+30,true),lc=v.getUint16(p+32,true),off=v.getUint32(p+42,true);
    const nombre=dec.decode(b.subarray(p+46,p+46+ln));
    archivos.set(nombre,{metodo,comp,off});p+=46+ln+le+lc;
  }
  const leer=async nombre=>{const a=archivos.get(nombre);if(!a)return null;const lnl=v.getUint16(a.off+26,true),lel=v.getUint16(a.off+28,true),ini=a.off+30+lnl+lel,datos=b.subarray(ini,ini+a.comp);
    return a.metodo===0?datos:a.metodo===8?await inflar(datos):null};
  return {nombres:[...archivos.keys()],leer,texto:async n=>{const d=await leer(n);return d?dec.decode(d):null}};
}

/* ---------- utilidades de texto ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const limpio=s=>String(s??'').replace(/\s+/g,' ').trim();
export const contarPalabras=bloques=>bloques.reduce((a,b)=>a+(b.t==='img'?0:String(b.x).replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length),0);
const ES=['el','la','de','que','y','en','los','se','del','las','un','por','con','no','una','su','para','es','al','lo','como','más','pero','sus','le','ya','o','fue','este','ha','sí','porque','esta','son','entre','cuando','muy','sin','sobre','también','me','hasta'];
const EN=['the','of','and','to','in','a','is','that','for','it','as','was','with','be','by','on','not','he','i','this','are','or','his','from','at','which','but','have','an','had','they','you','were','their','one','all','we','can','her','has','there'];
export function detectarIdioma(texto){
  const ps=String(texto).toLowerCase().slice(0,20000).match(/\p{L}+/gu)||[],es=new Set(ES),en=new Set(EN);let a=0,b=0;for(const p of ps){if(es.has(p))a++;if(en.has(p))b++}
  return b>a*1.2?'en':'es';
}
// Dificultad estimada: largo promedio de las oraciones y de las palabras
export function estimarDificultad(texto){
  const t=String(texto).slice(0,60000),oraciones=t.split(/[.!?¡¿…]+/).map(x=>x.trim()).filter(x=>x.split(/\s+/).length>2),palabras=t.match(/\p{L}+/gu)||[];
  if(!oraciones.length||!palabras.length)return 'Media';
  const po=palabras.length/oraciones.length,pl=palabras.reduce((a,w)=>a+w.length,0)/palabras.length,p=po/18+pl/5.2;
  return p<1.75?'Fácil':p<2.25?'Media':'Difícil';
}
// Versos: varios renglones cortos seguidos, con mayúscula al inicio, se muestran como poesía (un bloque 'v' con <br>)
export function marcarVersos(bloques){
  const out=[];let grupo=[];
  const corto=b=>b.t==='p'&&!/<br>/.test(b.x)&&b.x.replace(/<[^>]+>/g,'').length<=55&&/^[«"“¡¿—-]?\p{Lu}/u.test(b.x.replace(/<[^>]+>/g,'').trim());
  const soltar=()=>{if(grupo.length>=4)out.push({t:'v',x:grupo.map(b=>b.x).join('<br>')});else out.push(...grupo);grupo=[]};
  for(const b of bloques){if(corto(b))grupo.push(b);else{soltar();if(b.t==='p'&&/<br>/.test(b.x)){const ls=b.x.split('<br>');if(ls.length>=3&&ls.every(l=>l.replace(/<[^>]+>/g,'').length<=60))out.push({...b,t:'v'});else out.push(b)}else out.push(b)}}
  soltar();return out;
}

/* ---------- HTML → bloques (saneado) ---------- */
const PERMITIDAS=new Set(['B','STRONG','I','EM','SUP','SUB','BR','SMALL','CITE']);
function enLinea(nodo){
  let s='';
  for(const n of nodo.childNodes){
    if(n.nodeType===3){s+=esc(n.textContent.replace(/\s+/g,' '));continue}
    if(n.nodeType!==1)continue;
    const tag=n.tagName.toUpperCase();
    if(tag==='BR'){s+='<br>';continue}
    if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM','BUTTON','INPUT','NOSCRIPT'].includes(tag))continue;
    const dentro=enLinea(n);
    if(tag==='B'||tag==='STRONG')s+=`<b>${dentro}</b>`;else if(tag==='I'||tag==='EM'||tag==='CITE')s+=`<i>${dentro}</i>`;
    else if(tag==='SUP'||(tag==='A'&&/noteref/.test(n.getAttribute('epub:type')||n.getAttribute('role')||'')))s+=`<sup>${dentro}</sup>`;else if(tag==='SUB')s+=`<sub>${dentro}</sub>`;
    else s+=dentro;
  }
  return s;
}
const BLOQUE=new Set(['P','DIV','SECTION','ARTICLE','BLOCKQUOTE','UL','OL','LI','H1','H2','H3','H4','H5','H6','FIGURE','TABLE','TR','PRE','ASIDE','HEADER','FOOTER','MAIN','NAV','DL','DT','DD','BODY','FIGCAPTION','HR']);
export async function bloquesDeHtml(doc,{imagen}={}){
  const out=[];
  async function recorrer(el){
    for(const n of el.childNodes){
      if(n.nodeType===3){const t=limpio(n.textContent);if(t)out.push({t:'p',x:esc(t)});continue}
      if(n.nodeType!==1)continue;
      const tag=n.tagName.toUpperCase();
      if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','NOSCRIPT','HEAD','TITLE','FORM','BUTTON'].includes(tag))continue;
      if(tag==='NAV'&&/toc|landmarks|page-list/.test(n.getAttribute('epub:type')||''))continue;
      if(tag==='IMG'||tag==='IMAGE'){if(imagen){const r=await imagen(n.getAttribute('src')||n.getAttribute('xlink:href')||n.getAttribute('href'),n.getAttribute('alt')||'');if(r)out.push(r)}continue}
      if(/^H[1-6]$/.test(tag)){const x=limpio(enLinea(n));if(x)out.push({t:'h',x,nivel:+tag[1]});continue}
      if(tag==='LI'){const tieneBloques=[...n.children].some(c=>BLOQUE.has(c.tagName.toUpperCase())&&c.tagName.toUpperCase()!=='LI');if(!tieneBloques){const x=limpio(enLinea(n));if(x)out.push({t:'li',x})}else await recorrer(n);continue}
      if(tag==='BLOCKQUOTE'){const antes=out.length;await recorrer(n);for(let i=antes;i<out.length;i++)if(out[i].t==='p')out[i]={...out[i],t:'cita'};continue}
      if(tag==='PRE'){const x=n.textContent.replace(/\s+$/,'');if(x.trim())out.push({t:'code',x});continue}
      if(tag==='HR')continue;
      const hijosBloque=[...n.childNodes].some(c=>c.nodeType===1&&(BLOQUE.has(c.tagName.toUpperCase())||['IMG','IMAGE'].includes(c.tagName.toUpperCase())));
      if(hijosBloque||tag==='BODY'){await recorrer(n);continue}
      const x=enLinea(n).replace(/^(\s|<br>)+|(\s|<br>)+$/g,'').trim();if(x)out.push({t:'p',x});
    }
  }
  await recorrer(doc.body||doc.documentElement);
  return out;
}

/* ---------- imágenes: a un tamaño razonable (≤ 1200 px, JPEG) ---------- */
async function comprimirImagen(bytes,tipo){
  try{
    const blob=new Blob([bytes],{type:tipo||'image/jpeg'}),bm=await createImageBitmap(blob),k=Math.min(1,1200/Math.max(bm.width,bm.height));
    if(k>=1&&bytes.length<350000)return {blob,ancho:bm.width,alto:bm.height};
    const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);
    return {blob:await new Promise(r=>c.toBlob(r,'image/jpeg',0.82)),ancho:c.width,alto:c.height};
  }catch(e){return null}
}
const rutaRelativa=(base,href)=>{const partes=(base.includes('/')?base.slice(0,base.lastIndexOf('/')+1):'').split('/').filter(Boolean);
  for(const s of decodeURIComponent(String(href).split('#')[0]).split('/')){if(s==='..')partes.pop();else if(s&&s!=='.')partes.push(s)}return partes.join('/')};

/* ---------- EPUB ---------- */
// ¿Cifrado de contenido (DRM) o solo la ofuscación de fuentes que usan muchos EPUB sin DRM?
export function esDrmEpub(encryptionXml,rightsXml){
  if(rightsXml)return true;
  if(!encryptionXml)return false;
  const datos=[...encryptionXml.matchAll(/<(?:\w+:)?EncryptedData[\s\S]*?<\/(?:\w+:)?EncryptedData>/g)].map(m=>m[0]);
  if(!datos.length)return false;
  return datos.some(d=>{const alg=(d.match(/Algorithm="([^"]+)"/)||[])[1]||'',uri=(d.match(/CipherReference[^>]*URI="([^"]+)"/)||[])[1]||'';
    const fuente=/\.(otf|ttf|woff2?)$/i.test(uri)||/fonts?\//i.test(uri),ofusca=/idpf\.org\/2008\/embedding|ns\.adobe\.com\/pdf\/enc#RC/.test(alg);return !(fuente&&ofusca)});
}
export async function importarEpub(buf,{alProgreso=()=>{}}={}){
  const z=await leerZip(buf);
  if(esDrmEpub(await z.texto('META-INF/encryption.xml'),await z.texto('META-INF/rights.xml')))throw new LibroProtegido(AVISO_DRM);
  const P=new DOMParser(),xml=t=>P.parseFromString(t,'application/xml');
  const cont=await z.texto('META-INF/container.xml');if(!cont)throw new Error('El EPUB no tiene META-INF/container.xml.');
  const opfRuta=xml(cont).querySelector('rootfile')?.getAttribute('full-path');const opf=xml(await z.texto(opfRuta));
  const md=t=>opf.getElementsByTagName(t)[0]?.textContent?.trim()||'';
  const manifiesto=new Map([...opf.getElementsByTagName('item')].map(i=>[i.getAttribute('id'),{href:rutaRelativa(opfRuta,i.getAttribute('href')),tipo:i.getAttribute('media-type'),props:i.getAttribute('properties')||''}]));
  const spine=[...opf.getElementsByTagName('itemref')].filter(i=>i.getAttribute('linear')!=='no').map(i=>manifiesto.get(i.getAttribute('idref'))).filter(x=>x&&/html/.test(x.tipo));
  // títulos del índice: nav.xhtml (EPUB 3) o toc.ncx (EPUB 2)
  const titulos=new Map();
  const nav=[...manifiesto.values()].find(x=>/\bnav\b/.test(x.props));
  if(nav){const d=P.parseFromString(await z.texto(nav.href),'application/xhtml+xml');const toc=[...d.getElementsByTagName('nav')].find(n=>/toc/.test(n.getAttribute('epub:type')||''))||d.getElementsByTagName('nav')[0];
    for(const a of toc?.getElementsByTagName('a')||[]){const r=rutaRelativa(nav.href,a.getAttribute('href')||'');if(!titulos.has(r))titulos.set(r,limpio(a.textContent))}}
  const ncxItem=[...manifiesto.values()].find(x=>/ncx/.test(x.tipo));
  if(!titulos.size&&ncxItem){const d=xml(await z.texto(ncxItem.href));for(const np of d.getElementsByTagName('navPoint')){const r=rutaRelativa(ncxItem.href,np.getElementsByTagName('content')[0]?.getAttribute('src')||'');if(!titulos.has(r))titulos.set(r,limpio(np.getElementsByTagName('text')[0]?.textContent))}}
  // portada
  let portada=null;const idPortada=[...opf.getElementsByTagName('meta')].find(m=>m.getAttribute('name')==='cover')?.getAttribute('content');
  const itPortada=[...manifiesto.values()].find(x=>/cover-image/.test(x.props))||manifiesto.get(idPortada);
  if(itPortada&&/image/.test(itPortada.tipo)){const d=await z.leer(itPortada.href);if(d)portada=await comprimirImagen(d,itPortada.tipo)}
  const imagenes=[];
  const capitulos=[];let pendiente=[];
  for(const [i,it] of spine.entries()){
    alProgreso(`Leyendo el libro… ${i+1} de ${spine.length}`);
    const html=await z.texto(it.href);if(!html)continue;
    const d=P.parseFromString(html,/xhtml/.test(it.tipo)?'application/xhtml+xml':'text/html');
    const doc=d.getElementsByTagName('parsererror').length?P.parseFromString(html,'text/html'):d;
    const bloques=await bloquesDeHtml(doc,{imagen:async(src,alt)=>{if(!src)return null;const ruta=rutaRelativa(it.href,src);if(itPortada&&ruta===itPortada.href)return null;const datos=await z.leer(ruta);if(!datos)return null;
      const im=await comprimirImagen(datos,[...manifiesto.values()].find(x=>x.href===ruta)?.tipo);if(!im)return null;const id=`img${imagenes.length+1}`;imagenes.push({id,...im});return {t:'img',x:id,alt:limpio(alt)}}});
    const todos=[...pendiente,...bloques],palabras=contarPalabras(todos);
    // documentos casi vacíos (portada, créditos cortos): se juntan con el siguiente
    if(palabras<40&&!bloques.some(b=>b.t==='img'&&todos.length>2)){pendiente=todos;continue}
    pendiente=[];
    const titulo=titulos.get(it.href)||todos.find(b=>b.t==='h')?.x.replace(/<[^>]+>/g,'')||`Capítulo ${capitulos.length+1}`;
    capitulos.push({titulo:limpio(titulo).slice(0,120),bloques:marcarVersos(todos)});
  }
  if(pendiente.length&&capitulos.length)capitulos.at(-1).bloques.push(...pendiente);else if(pendiente.length)capitulos.push({titulo:'Capítulo 1',bloques:pendiente});
  return {titulo:md('dc:title')||md('title'),autor:md('dc:creator')||md('creator'),idioma:(md('dc:language')||md('language')).slice(0,2).toLowerCase(),descripcion:limpio(md('dc:description')||md('description')).replace(/<[^>]+>/g,'').slice(0,200),portada,imagenes,capitulos,formato:'EPUB'};
}

/* ---------- TXT y Markdown ---------- */
const PATRON_CAP=/^(cap[ií]tulo|chapter|parte|part|libro|book)\s+([\divxlcdm]+|primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|one|two|three|four|five|six|seven|eight|nine|ten)\b|^[IVXLC]+\.?$/i;
function mdEnLinea(s){return esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/__([^_]+)__/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<i>$2</i>').replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g,'$1<i>$2</i>')}
export function importarTexto(texto,{markdown=false}={}){
  const lineas=String(texto).replace(/\r/g,'').replace(/^\uFEFF/,'').split('\n'),capitulos=[];let cap=null,parrafo=[];
  const cerrarP=()=>{if(!parrafo.length)return;const t=parrafo.map(l=>l.trim()).filter(Boolean);parrafo=[];if(!t.length)return;
    // renglones cortos dentro de un párrafo: versos (se conservan los saltos)
    const versos=t.length>=3&&t.every(l=>l.length<=60);(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:versos?'v':'p',x:(versos?t.map(mdEnLinea).join('<br>'):mdEnLinea(t.join(' ').replace(/(\p{L})- (\p{Ll})/gu,'$1$2')))})};
  const nuevo=t=>{cerrarP();if(cap&&(cap.bloques.length||cap.titulo!=='Inicio'))capitulos.push(cap);cap={titulo:limpio(t).slice(0,120),bloques:[]}};
  for(const l of lineas){
    const t=l.trim();let m;
    if(markdown&&(m=t.match(/^(#{1,2})\s+(.+)$/))){nuevo(m[2].replace(/[*_]/g,''));continue}
    if(markdown&&(m=t.match(/^#{3,6}\s+(.+)$/))){cerrarP();(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:'h',x:mdEnLinea(m[1])});continue}
    if(!markdown&&t.length<70&&PATRON_CAP.test(t)){nuevo(t);continue}
    if(markdown&&PATRON_CAP.test(t)&&t.length<70){nuevo(t);continue}
    if(!t){cerrarP();continue}
    if(markdown&&(m=t.match(/^[-*+]\s+(.*)$/))){cerrarP();(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:'li',x:mdEnLinea(m[1])});continue}
    if(markdown&&(m=t.match(/^>\s?(.*)$/))){cerrarP();(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:'cita',x:mdEnLinea(m[1])});continue}
    parrafo.push(l);
  }
  cerrarP();if(cap&&cap.bloques.length)capitulos.push(cap);
  // un capítulo «Inicio» sin nada útil antes del primer capítulo (p. ej. solo el título) se quita
  if(capitulos.length>1&&capitulos[0].titulo==='Inicio'&&contarPalabras(capitulos[0].bloques)<25)capitulos.shift();
  return {titulo:'',autor:'',idioma:detectarIdioma(texto),descripcion:'',portada:null,imagenes:[],capitulos:partirLargos(capitulos),formato:markdown?'Markdown':'TXT'};
}
// Sin capítulos detectados: partes de ~2500 palabras, cortando en un párrafo
export function partirLargos(caps,maximo=6000){
  if(caps.length!==1||contarPalabras(caps[0].bloques)<=maximo)return caps;
  const out=[];let act={titulo:'Parte 1',bloques:[]},n=0;
  for(const b of caps[0].bloques){act.bloques.push(b);n+=contarPalabras([b]);if(n>=2500){out.push(act);act={titulo:`Parte ${out.length+1}`,bloques:[]};n=0}}
  if(act.bloques.length)out.push(act);return out;
}

/* ---------- DOCX ---------- */
export async function importarDocx(buf){
  const z=await leerZip(buf),x=await z.texto('word/document.xml');if(!x)throw new Error('El DOCX no tiene word/document.xml.');
  const d=new DOMParser().parseFromString(x,'application/xml'),W='http://schemas.openxmlformats.org/wordprocessingml/2006/main',capitulos=[];let cap=null;
  const tit=(d.getElementsByTagNameNS(W,'p')[0]);void tit;
  for(const p of d.getElementsByTagNameNS(W,'p')){
    const estilo=p.getElementsByTagNameNS(W,'pStyle')[0]?.getAttributeNS(W,'val')||p.getElementsByTagNameNS(W,'pStyle')[0]?.getAttribute('w:val')||'';
    let s='';for(const r of p.getElementsByTagNameNS(W,'r')){const pr=r.getElementsByTagNameNS(W,'rPr')[0],b=!!pr?.getElementsByTagNameNS(W,'b').length,it=!!pr?.getElementsByTagNameNS(W,'i').length;
      let t='';for(const n of r.childNodes){if(n.localName==='t')t+=esc(n.textContent);else if(n.localName==='br')t+='<br>';else if(n.localName==='tab')t+=' '}
      if(t)s+=b&&it?`<b><i>${t}</i></b>`:b?`<b>${t}</b>`:it?`<i>${t}</i>`:t}
    const plano=s.replace(/<[^>]+>/g,'').trim();if(!plano)continue;
    if(/^(Heading1|Title|Ttulo1|Titulo1|Título1|Heading 1)$/i.test(estilo)||PATRON_CAP.test(plano)&&plano.length<70){if(cap)capitulos.push(cap);cap={titulo:plano.slice(0,120),bloques:[]};continue}
    if(/^(Heading[2-6]|Ttulo[2-6]|Subtitle)$/i.test(estilo)){(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:'h',x:s});continue}
    (cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:/^ListParagraph$/i.test(estilo)?'li':'p',x:s});
  }
  if(cap)capitulos.push(cap);
  const todo=capitulos.flatMap(c=>c.bloques.map(b=>b.x)).join(' ');
  return {titulo:'',autor:'',idioma:detectarIdioma(todo.replace(/<[^>]+>/g,' ')),descripcion:'',portada:null,imagenes:[],capitulos:partirLargos(capitulos.map(c=>({...c,bloques:marcarVersos(c.bloques)}))),formato:'DOCX'};
}

/* ---------- PDF (con pdf.js, que se carga solo aquí) ---------- */
// Renglones de cada página → párrafos y capítulos. Separado del lector de pdf.js para poder probarlo.
export function reconstruirPdf(paginas){
  // paginas: [[{x, y (desde arriba), tam, texto}…]…] ya agrupados por renglón
  const norm=t=>t.replace(/\d+/g,'#').replace(/\s+/g,' ').trim().toLowerCase();
  const repetidos=new Set(),cuenta=new Map();
  for(const ls of paginas){const vistos=new Set();for(const l of [...ls.slice(0,2),...ls.slice(-2)]){const k=norm(l.texto);if(k&&!vistos.has(k)){vistos.add(k);cuenta.set(k,(cuenta.get(k)||0)+1)}}}
  for(const [k,c] of cuenta)if(paginas.length>=3&&c>=Math.max(2,Math.ceil(paginas.length*0.5)))repetidos.add(k);
  const esNumPagina=t=>/^(p[aá]g(ina)?\.?\s*)?\d{1,4}(\s*(de|of|\/)\s*\d{1,4})?$/i.test(t.trim())||/^[-–—]\s*\d{1,4}\s*[-–—]$/.test(t.trim());
  const tams=paginas.flat().map(l=>l.tam).sort((a,b)=>a-b),mediana=tams[Math.floor(tams.length/2)]||10;
  const capitulos=[];let cap=null,parr=null,ultimo=null;
  const cerrarParr=()=>{if(parr){(cap||(cap={titulo:'Inicio',bloques:[]})).bloques.push({t:'p',x:esc(parr.trim())});parr=null}};
  const nuevoCap=t=>{cerrarParr();if(cap&&(cap.bloques.length||cap.titulo!=='Inicio'))capitulos.push(cap);cap={titulo:t.slice(0,120),bloques:[]}};
  for(const ls of paginas){
    const utiles=ls.filter((l,i)=>!((i<2||i>=ls.length-2)&&(repetidos.has(norm(l.texto))||esNumPagina(l.texto))));
    let anteriorY=null;
    for(const l of utiles){
      const t=l.texto.trim();if(!t)continue;
      const grande=l.tam>=mediana*1.3;
      if((grande&&t.length<90)||(PATRON_CAP.test(t)&&t.length<70)){
        // un título en dos renglones grandes seguidos se junta
        if(ultimo?.grande&&cap&&!cap.bloques.length&&anteriorY!==null&&l.y-anteriorY<l.tam*2)cap.titulo=(cap.titulo+' '+t).slice(0,120);else nuevoCap(t);
        ultimo={grande:true};anteriorY=l.y;continue}
      const salto=anteriorY!==null&&l.y-anteriorY>l.tam*1.75;
      const sangria=ultimo?.x!==undefined&&l.x-ultimo.x>l.tam*0.8;
      if(parr&&(salto||sangria||(/[.!?:»”"]$/.test(parr.trim())&&ultimo?.corto)))cerrarParr();
      if(parr){
        // palabra partida con guion al final del renglón: se une (sin el guion) si sigue en minúscula
        if(/\p{L}-$/u.test(parr)&&/^\p{Ll}/u.test(t))parr=parr.slice(0,-1)+t;else parr+=' '+t;
      }else parr=t;
      ultimo={x:l.x,corto:t.length<45,grande:false};anteriorY=l.y;
    }
    // al cambiar de página el párrafo sigue (a menos que termine en punto y el renglón fuera corto)
  }
  cerrarParr();if(cap&&cap.bloques.length)capitulos.push(cap);
  if(capitulos.length>1&&capitulos[0].titulo==='Inicio'&&contarPalabras(capitulos[0].bloques)<25)capitulos.shift();
  return partirLargos(capitulos.map(c=>({...c,bloques:marcarVersos(c.bloques)})));
}
export async function importarPdf(buf,{alProgreso=()=>{},ocr}={}){
  alProgreso('Abriendo el PDF…');
  const pdfjs=await import('pdfjs-dist');
  const {default:urlWorker}=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc=urlWorker;
  const doc=await pdfjs.getDocument({data:new Uint8Array(buf),isEvalSupported:false}).promise;
  const meta=await doc.getMetadata().catch(()=>null),paginas=[];let caracteres=0;
  for(let i=1;i<=doc.numPages;i++){
    alProgreso(`Leyendo el libro… página ${i} de ${doc.numPages}`);
    const pg=await doc.getPage(i),vp=pg.getViewport({scale:1}),tc=await pg.getTextContent(),renglones=[];
    for(const it of tc.items){if(!('str' in it)||!it.str)continue;const x=it.transform[4],y=vp.height-it.transform[5],tam=Math.abs(it.transform[3])||Math.hypot(it.transform[2],it.transform[3])||10;
      let r=renglones.find(r=>Math.abs(r.y-y)<tam*0.45);if(!r){r={y,x,tam,partes:[]};renglones.push(r)}r.partes.push({x,str:it.str,w:it.width||0});r.x=Math.min(r.x,x);r.tam=Math.max(r.tam,tam)}
    renglones.sort((a,b)=>a.y-b.y);
    paginas.push(renglones.map(r=>{r.partes.sort((a,b)=>a.x-b.x);let s='',fin=null;for(const p of r.partes){if(fin!==null&&p.x-fin>r.tam*0.15&&!s.endsWith(' ')&&!p.str.startsWith(' '))s+=' ';s+=p.str;fin=p.x+p.w}
      caracteres+=s.trim().length;return {x:r.x,y:r.y,tam:r.tam,texto:s.replace(/\s+/g,' ')}}));
  }
  // PDF escaneado (sin texto): reconocimiento de texto (el de Foto a nota) si la persona quiere esperar
  if(caracteres<40*Math.max(1,doc.numPages)/4){
    if(!ocr)throw new Error('SIN_TEXTO');
    const textos=[];
    for(let i=1;i<=doc.numPages;i++){alProgreso(`Reconociendo el texto… página ${i} de ${doc.numPages} (tarda)`);
      const pg=await doc.getPage(i),vp=pg.getViewport({scale:2}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
      await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;textos.push(await ocr(c))}
    const r=importarTexto(textos.join('\n\n'));return {...r,formato:'PDF (escaneado)'};
  }
  const capitulos=reconstruirPdf(paginas),todo=capitulos.flatMap(c=>c.bloques.map(b=>b.x)).join(' ');
  const info=meta?.info||{};
  return {titulo:limpio(info.Title||''),autor:limpio(info.Author||''),idioma:detectarIdioma(todo),descripcion:'',portada:null,imagenes:[],capitulos,formato:'PDF'};
}

/* ---------- entrada única ---------- */
export async function importarArchivo(file,opc={}){
  const nombre=file.name||'libro',ext=(nombre.match(/\.([a-z0-9]+)$/i)||[])[1]?.toLowerCase()||'';
  if(['azw','azw3','azw4','kfx','kfx-zip','prc'].includes(ext))throw new LibroProtegido(AVISO_DRM);
  if(['mobi'].includes(ext))throw new Error('Los libros .mobi de Kindle no se pueden abrir aquí. Usa un EPUB o PDF sin DRM.');
  const buf=await file.arrayBuffer();
  let r;
  if(ext==='epub'||file.type==='application/epub+zip')r=await importarEpub(buf,opc);
  else if(ext==='pdf'||file.type==='application/pdf')r=await importarPdf(buf,opc);
  else if(ext==='docx')r=await importarDocx(buf);
  else if(['txt','md','markdown','text'].includes(ext)||/^text\//.test(file.type))r=importarTexto(new TextDecoder().decode(buf),{markdown:ext==='md'||ext==='markdown'});
  else throw new Error('Ese formato no se puede importar. Usa EPUB, PDF, TXT, Markdown o DOCX.');
  opc.alProgreso?.('Detectando capítulos…');
  r.capitulos=r.capitulos.filter(c=>c.bloques.length);
  if(!r.capitulos.length)throw new Error('No encontré texto en el archivo.');
  if(!r.titulo)r.titulo=nombre.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim();
  const texto=r.capitulos.flatMap(c=>c.bloques.map(b=>b.x)).join(' ').replace(/<[^>]+>/g,' ');
  if(!['es','en'].includes(r.idioma))r.idioma=detectarIdioma(texto);
  r.dificultad=estimarDificultad(texto);
  return r;
}
