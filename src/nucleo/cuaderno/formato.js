/* Formato de las notas del cuaderno (texto con marcas simples, sin DOM: también lo usan npm run revisar y las pruebas).
   Marcas:  **negrita**  *cursiva*  ==resaltado==  `código`  $fórmula$ (KaTeX)  [texto](#ruta) enlace a la app
            # Título  ## Subtítulo  - lista  1. lista  - [ ] o [ ] casilla  - [x] hecha  > cita  ``` bloque de código ```
            $$fórmula en bloque$$ (en una línea o en varias, entre dos líneas $$)
            ![pie de foto](img:<id>) imagen o dibujo guardado en IndexedDB; sola en su línea es un bloque con su pie
            («foto», «dibujo» o «imagen» = sin pie, como las notas de antes)
            🃏 pregunta | respuesta   tarjeta que entra al repaso espaciado */
const ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>ESC[c]);
export const TARJETA='🃏';

// Enlaces: solo a rutas de la app (#…) o a páginas https
function enlace(txt,url){
  if(/^#/.test(url))return `<a href="${esc(url)}" data-go="${esc(url.slice(1))}">${txt}</a>`;
  if(/^https:\/\//i.test(url))return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
  return txt;
}

/* Formato dentro de una línea. tex(fórmula) → HTML (KaTeX); repasar: la negrita se tapa para recordarla */
export function enLinea(s,{tex=x=>`<code>${esc(x)}</code>`,repasar=false}={}){
  const guardados=[];const g=h=>`\u0000${guardados.push(h)-1}\u0000`;
  // primero lo que no se debe tocar: código y fórmulas
  s=String(s).replace(/`([^`]+)`/g,(_,x)=>g(`<code>${esc(x)}</code>`)).replace(/\$([^$\n]+)\$/g,(_,x)=>g(tex(x)));
  s=esc(s);
  s=s.replace(/!\[([^\]]*)\]\(img:([\w-]+)\)/g,(_,alt,id)=>g(`<img class="nota-img" data-img="${id}" alt="${alt||'imagen'}">`))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,t,u)=>enlace(t,u.replace(/&amp;/g,'&')))
    .replace(/\*\*([^*]+)\*\*/g,(_,x)=>repasar?`<button type="button" class="tapada" data-revelar aria-label="Palabra oculta: toca para verla"><span>${x}</span></button>`:`<b>${x}</b>`)
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<i>$2</i>')
    .replace(/==([^=]+)==/g,'<mark>$1</mark>');
  return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>guardados[+i]);
}

/* Nota completa → HTML. Las casillas llevan data-casilla con su número de línea para marcarlas con un toque. */
export function render(texto,opc={}){
  const lineas=String(texto??'').replace(/\r/g,'').split('\n'),out=[];let lista=null,codigo=null,formula=null;
  const tex=opc.tex||(x=>`<code>${esc(x)}</code>`),fbloque=f=>`<div class="nota-fbloque">${tex(f.trim(),true)}</div>`;
  const ETQ={ul:['<ul>','</ul>'],ol:['<ol>','</ol>'],cas:['<ul class="nota-casillas">','</ul>']};
  const cerrarLista=()=>{if(lista){out.push(ETQ[lista][1]);lista=null}};
  const abrirLista=t=>{if(lista!==t){cerrarLista();out.push(ETQ[t][0]);lista=t}};
  lineas.forEach((l,i)=>{
    if(codigo!==null){if(/^```/.test(l)){out.push(`<pre class="nota-codigo"><code>${esc(codigo.join('\n'))}</code></pre>`);codigo=null}else codigo.push(l);return}
    if(formula!==null){const fin=l.trim().endsWith('$$');formula.push(fin?l.trim().slice(0,-2):l);
      if(fin){out.push(fbloque(formula.join('\n')));formula=null}return}
    if(/^```/.test(l)){cerrarLista();codigo=[];return}
    let m;
    if((m=l.trim().match(/^\$\$([\s\S]*?)\$\$$/))&&m[1].trim()){cerrarLista();out.push(fbloque(m[1]));return}
    if(l.trim().startsWith('$$')){cerrarLista();formula=[l.trim().slice(2)];return}
    if((m=l.trim().match(/^!\[([^\]]*)\]\(img:([\w-]+)\)$/))){cerrarLista();const pie=pieDe(m[1]);
      out.push(`<figure class="nota-fig"><img class="nota-img" data-img="${m[2]}" alt="${esc(pie||m[1]||'imagen')}">${pie?`<figcaption>${esc(pie)}</figcaption>`:''}</figure>`);return}
    if((m=l.match(/^\s*(?:[-*] )?\[( |x|X)\](?: (.*)|$)/))){
      abrirLista('cas');const hecha=m[1]!==' ';
      out.push(`<li class="${hecha?'hecha':''}"><button type="button" class="nota-check" data-casilla="${i}" role="checkbox" aria-checked="${hecha}" aria-label="${hecha?'Desmarcar':'Marcar'}">${hecha?'☑':'☐'}</button><span>${enLinea(m[2]||'',opc)}</span></li>`);return;
    }
    if((m=l.match(/^\s*[-*] (.*)$/))){abrirLista('ul');out.push(`<li>${enLinea(m[1],opc)}</li>`);return}
    if((m=l.match(/^\s*\d+[.)] (.*)$/))){abrirLista('ol');out.push(`<li>${enLinea(m[1],opc)}</li>`);return}
    cerrarLista();
    if(!l.trim()){out.push('');return}
    if((m=l.match(/^(#{1,3}) (.*)$/))){const n=Math.min(4,m[1].length+2);out.push(`<h${n} class="nota-h">${enLinea(m[2],opc)}</h${n}>`);return}
    if((m=l.match(/^> ?(.*)$/))){out.push(`<blockquote>${enLinea(m[1],opc)}</blockquote>`);return}
    if(l.startsWith(TARJETA)){const [q,a]=l.slice(TARJETA.length).split('|').map(x=>x.trim());
      const resp=a===undefined?'':opc.repasar?`<button type="button" class="tapada" data-revelar aria-label="Respuesta oculta: toca para verla"><span>${enLinea(a,{...opc,repasar:false})}</span></button>`:enLinea(a,opc);
      out.push(`<div class="nota-tarjeta"><span class="nota-tarjeta-q">${TARJETA} ${enLinea(q||'',opc)}</span>${resp?`<span class="nota-tarjeta-a">${resp}</span>`:''}</div>`);return}
    out.push(`<p>${enLinea(l,opc)}</p>`);
  });
  if(codigo!==null)out.push(`<pre class="nota-codigo"><code>${esc(codigo.join('\n'))}</code></pre>`);
  if(formula!==null)out.push(fbloque(formula.join('\n')));
  cerrarLista();
  return out.filter(Boolean).join('\n');
}

// Pie de una imagen: su texto alternativo, salvo los de siempre («foto», «dibujo», «imagen»), que no son pie
const SIN_PIE=new Set(['','foto','dibujo','imagen']);
export const pieDe=alt=>SIN_PIE.has(String(alt).trim().toLowerCase())?'':String(alt).trim();

/* ---------- bloques del editor ----------
   La nota sigue siendo el mismo texto (no hay migración): el editor la parte en bloques para editarlos y moverlos.
   Un bloque es {tipo:'texto'|'formula'|'imagen', texto}: las imágenes solas en su línea y las fórmulas $$…$$ son
   bloques aparte; el resto se separa por líneas en blanco (sin partir un bloque de código ```). Al unirlos quedan
   separados por una línea en blanco, que se ve igual. */
const IMG_SOLA=/^!\[[^\]]*\]\(img:[\w-]+\)$/;
export function bloques(texto){
  const ls=String(texto??'').replace(/\r/g,'').split('\n'),out=[];let act=null,codigo=false,formula=null;
  const cerrar=()=>{if(act){const t=act.join('\n').replace(/^\n+|\n+$/g,'');if(t.trim())out.push({tipo:'texto',texto:t});act=null}};
  for(const l of ls){
    if(formula){formula.push(l);if(l.trim().endsWith('$$')){out.push({tipo:'formula',texto:formula.join('\n')});formula=null}continue}
    if(codigo){act.push(l);if(/^```/.test(l))codigo=false;continue}
    if(/^```/.test(l)){(act||(act=[])).push(l);codigo=true;continue}
    const t=l.trim();
    if(IMG_SOLA.test(t)){cerrar();out.push({tipo:'imagen',texto:t});continue}
    if(t.startsWith('$$')){cerrar();if(t.length>4&&t.endsWith('$$'))out.push({tipo:'formula',texto:t});else formula=[l];continue}
    if(!t){cerrar();continue}
    (act||(act=[])).push(l);
  }
  if(formula)out.push({tipo:'formula',texto:formula.join('\n')});
  cerrar();
  return out;
}
export const unirBloques=bs=>bs.map(b=>String(b.texto).replace(/^\n+|\s+$/g,'')).filter(t=>t.trim()).join('\n\n');
// Lo de adentro de un bloque $$…$$
export const formulaDe=t=>String(t).trim().replace(/^\$\$/,'').replace(/\$\$$/,'').trim();

/* Fórmula LaTeX → texto corto y legible para la lista (sin código raro): \frac{a}{b} → a/b, \sqrt{x} → √x, x^2 → x²… */
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','+':'⁺','-':'⁻','i':'ⁱ'};
const SIMB={pm:'±',mp:'∓',cdot:'·',times:'×',div:'÷',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',to:'→',rightarrow:'→',infty:'∞',
  pi:'π',alpha:'α',beta:'β',gamma:'γ',delta:'δ',Delta:'Δ',theta:'θ',lambda:'λ',mu:'μ',sigma:'σ',Sigma:'Σ',omega:'ω',int:'∫',sum:'Σ',
  partial:'∂',in:'∈',cdots:'…',ldots:'…',lim:'lím',sin:'sen',cos:'cos',tan:'tan',ln:'ln',log:'log'};
const grupo=s=>s.length>1&&/[^\w.]/.test(s)?`(${s})`:s;
export function formulaCorta(f){
  let s=String(f);
  for(let k=0;k<4;k++)s=s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,(_,a,b)=>`${grupo(a)}/${grupo(b)}`).replace(/\\sqrt\{([^{}]*)\}/g,(_,a)=>`√${grupo(a)}`);
  return s.replace(/\^\{?([0-9n+\-i])\}?(?![\w{])/g,(_,a)=>SUP[a]).replace(/\^\{([^{}]*)\}/g,'^($1)')
    .replace(/\\(left|right|,|;|!|quad|displaystyle)/g,'').replace(/\\([A-Za-z]+)/g,(m,n)=>SIMB[n]??n).replace(/[{}_]/g,'').replace(/\s+/g,' ').trim();
}
export const tieneFormulas=texto=>/\$[^$\n]+\$/.test(String(texto??''));
// Vista previa de la lista: texto plano con las fórmulas como texto corto
export const vistaPrevia=texto=>String(texto??'').replace(/\$\$([\s\S]+?)\$\$/g,(_,f)=>formulaCorta(f)).replace(/\$([^$\n]+)\$/g,(_,f)=>formulaCorta(f))
  .replace(/!\[[^\]]*\]\(img:[\w-]+\)/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/^🃏\s*/gm,'')
  .replace(/\*\*|==|`|^#+ |^> |^\s*[-*] \[[ xX]\] |^\s*[-*] |^\s*\d+[.)] /gm,'').replace(/\s+/g,' ').trim();

// Marca o desmarca la casilla de la línea i
export function alternarCasilla(texto,i){
  const ls=String(texto).split('\n');
  if(ls[i])ls[i]=ls[i].replace(/^(\s*(?:[-*] )?\[)( |x|X)(\])/,(_,a,x,b)=>a+(x===' '?'x':' ')+b);
  return ls.join('\n');
}

// Tarjetas de una nota: líneas "🃏 pregunta | respuesta" con las dos partes
export const tarjetasDe=texto=>String(texto??'').split('\n').filter(l=>l.startsWith(TARJETA)&&l.includes('|'))
  .map(l=>{const [q,...a]=l.slice(TARJETA.length).split('|');return {q:q.trim(),a:a.join('|').trim()}}).filter(x=>x.q&&x.a);
// Imágenes usadas en una nota
export const imagenesDe=texto=>[...String(texto??'').matchAll(/!\[[^\]]*\]\(img:([\w-]+)\)/g)].map(m=>m[1]);

// Texto plano (búsqueda, vista previa en la lista, compartir como texto)
export const plano=texto=>String(texto??'').replace(/!\[[^\]]*\]\(img:[\w-]+\)/g,'🖼️').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
  .replace(/\*\*|==|`|^#+ |^> |^\s*[-*] \[[ xX]\] |^\s*[-*] /gm,'').replace(/\$([^$]+)\$/g,'$1').trim();
export const normal=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

/* HTML de la app (pasos, reglas, explicaciones) → texto de nota: fórmulas KaTeX \( \) y \[ \] pasan a $…$,
   \cambio{…} se quita (queda lo de adentro), <b> → **, <mark> → ==, tablas y saltos → líneas. */
function sinCambio(s){
  let r='',i=0;const k='\\cambio{';
  while(i<s.length){
    const j=s.indexOf(k,i);if(j<0){r+=s.slice(i);break}
    r+=s.slice(i,j);let n=1,p=j+k.length;const ini=p;
    while(p<s.length&&n){if(s[p]==='{')n++;else if(s[p]==='}')n--;p++}
    r+=s.slice(ini,p-1);i=p;
  }
  return r;
}
const ENT={'&lt;':'<','&gt;':'>','&amp;':'&','&quot;':'"','&#39;':"'",'&nbsp;':' '};
export function deHtml(html){
  let s=sinCambio(String(html??''));
  s=s.replace(/\\\(([\s\S]+?)\\\)/g,(_,x)=>`$${x.replace(/\s+/g,' ').trim()}$`).replace(/\\\[([\s\S]+?)\\\]/g,(_,x)=>`$${x.replace(/\s+/g,' ').trim()}$`);
  s=s.replace(/<br\s*\/?>|<table[^>]*>/gi,'\n').replace(/<\/(p|div|tr|li|h\d)>/gi,'\n').replace(/<t[dh][^>]*>/gi,' | ')
    .replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi,'**$2**').replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi,'==$1==').replace(/<(i|em)>([\s\S]*?)<\/\1>/gi,'*$2*')
    .replace(/<[^>]+>/g,'').replace(/&(lt|gt|amp|quot|#39|nbsp);/g,m=>ENT[m]);
  return s.split('\n').map(l=>l.replace(/^\s*\|\s*/,'').replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n');
}
