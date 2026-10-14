/* Formato de las notas del cuaderno (texto con marcas simples, sin DOM: también lo usan npm run revisar y las pruebas).
   Marcas:  **negrita**  *cursiva*  ==resaltado==  `código`  $fórmula$ (KaTeX)  [texto](#ruta) enlace a la app
            # Título  ## Subtítulo  - lista  1. lista  - [ ] casilla  - [x] hecha  > cita  ``` bloque de código ```
            ![foto](img:<id>) imagen o dibujo guardado en IndexedDB
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
  const lineas=String(texto??'').replace(/\r/g,'').split('\n'),out=[];let lista=null,codigo=null;
  const ETQ={ul:['<ul>','</ul>'],ol:['<ol>','</ol>'],cas:['<ul class="nota-casillas">','</ul>']};
  const cerrarLista=()=>{if(lista){out.push(ETQ[lista][1]);lista=null}};
  const abrirLista=t=>{if(lista!==t){cerrarLista();out.push(ETQ[t][0]);lista=t}};
  lineas.forEach((l,i)=>{
    if(codigo!==null){if(/^```/.test(l)){out.push(`<pre class="nota-codigo"><code>${esc(codigo.join('\n'))}</code></pre>`);codigo=null}else codigo.push(l);return}
    if(/^```/.test(l)){cerrarLista();codigo=[];return}
    let m;
    if((m=l.match(/^\s*[-*] \[( |x|X)\] ?(.*)$/))){
      abrirLista('cas');const hecha=m[1]!==' ';
      out.push(`<li class="${hecha?'hecha':''}"><button type="button" class="nota-check" data-casilla="${i}" role="checkbox" aria-checked="${hecha}" aria-label="${hecha?'Desmarcar':'Marcar'}">${hecha?'☑':'☐'}</button><span>${enLinea(m[2],opc)}</span></li>`);return;
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
  cerrarLista();
  return out.filter(Boolean).join('\n');
}

// Marca o desmarca la casilla de la línea i
export function alternarCasilla(texto,i){
  const ls=String(texto).split('\n');
  if(ls[i])ls[i]=ls[i].replace(/^(\s*[-*] \[)( |x|X)(\])/,(_,a,x,b)=>a+(x===' '?'x':' ')+b);
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
