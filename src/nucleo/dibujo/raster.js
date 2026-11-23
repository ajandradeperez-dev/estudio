/* Fórmulas y HTML como imagen para el lienzo (sin librerías): el HTML de KaTeX va dentro de un SVG (foreignObject) con
   los estilos y las fuentes de KaTeX incrustados (data:), así se dibuja nítido a cualquier zoom y también en el PNG y el
   PDF. Si el navegador no lo permite, el lienzo escribe el LaTeX como texto. Y un PDF mínimo (una imagen JPEG por página). */
import katex from 'katex';
import {OPCIONES} from '../formula.js';

let estilos=null;
const aDataUrl=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)});
// Las reglas de KaTeX y sus fuentes (woff2) como data:, una sola vez
function cssKatex(){
  if(estilos)return estilos;
  estilos=(async()=>{
    const reglas=[],fuentes=[];
    for(const s of document.styleSheets){let rs;try{rs=s.cssRules}catch(e){continue}
      for(const r of rs){if(r.type===5&&/KaTeX/.test(r.style.getPropertyValue('font-family')))fuentes.push(r);else if(r.selectorText&&/\.katex/.test(r.selectorText))reglas.push(r.cssText)}}
    const ff=await Promise.all(fuentes.map(async r=>{
      const m=r.style.getPropertyValue('src').match(/url\(["']?([^"')]+?\.woff2)["']?\)/);if(!m)return '';
      try{const url=new URL(m[1],r.parentStyleSheet?.href||location.href).href,data=await aDataUrl(await (await fetch(url)).blob());
        return `@font-face{font-family:${r.style.getPropertyValue('font-family')};font-style:${r.style.getPropertyValue('font-style')||'normal'};font-weight:${r.style.getPropertyValue('font-weight')||'normal'};src:url(${data}) format("woff2")}`}
      catch(e){return ''}}));
    return ff.join('')+reglas.join('');
  })();
  return estilos;
}
const xml=s=>new XMLSerializer().serializeToString(s);
// Mide un fragmento de HTML con su ancho máximo (px CSS)
function medir(html,{max=0,tam=20,color='#1f2430'}={}){
  const d=document.createElement('div');d.style.cssText=`position:fixed;left:-9999px;top:0;visibility:hidden;font:${tam}px system-ui,sans-serif;color:${color};${max?`width:${max}px`:'white-space:nowrap'};line-height:1.35`;
  d.innerHTML=html;document.body.appendChild(d);const r=d.getBoundingClientRect(),w=Math.ceil(r.width)+4,h=Math.ceil(r.height)+4;d.remove();return {w,h};
}
async function svgDe(html,{w,h,tam,color,max}){
  const div=document.createElement('div');div.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
  div.setAttribute('style',`font:${tam}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:${color};line-height:1.35;padding:2px;${max?`width:${max}px`:'white-space:nowrap'}`);
  div.innerHTML=html;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><style>${await cssKatex()}.katex .katex-mathml{display:none}</style>${xml(div)}</foreignObject></svg>`;
  return new Promise(res=>{const img=new Image();img.onload=()=>res(img);img.onerror=()=>res(null);img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
}
// ¿El navegador deja exportar un canvas con un SVG así? (si no, el PNG saldría vacío: se usa el texto)
let permite=null;
async function sePuede(img){
  if(permite!==null)return permite;
  try{const c=document.createElement('canvas');c.width=c.height=4;const x=c.getContext('2d');x.drawImage(img,0,0,4,4);c.toDataURL();permite=true}catch(e){permite=false}
  return permite;
}
const formulas=new Map();
const html=tex=>{try{return katex.renderToString(tex,{...OPCIONES,output:'html',displayMode:true})}catch(e){return null}};
/* Imagen de una fórmula: {img, w, h} (w y h en px CSS para tam px de letra). Se cachea por fórmula y color. */
export function imagenFormula(tex,{tam=22,color='#1f2430'}={}){
  const clave=`${color}|${tam}|${tex}`;if(formulas.has(clave))return formulas.get(clave);
  const pr=(async()=>{
    const h=html(tex);if(!h)return null;
    const m=medir(h,{tam,color}),img=await svgDe(h,{...m,tam,color});
    if(!img||!(await sePuede(img)))return {img:null,...m};
    return {img,...m};
  })();
  formulas.set(clave,pr);return pr;
}
export const medirFormula=(tex,tam=22)=>{const h=html(tex);return h?medir(h,{tam}):null};
// Un fragmento de HTML de la app (p. ej. el enunciado de un ejercicio, con sus fórmulas ya dibujadas) → PNG
export async function htmlAPng(fragmento,{ancho=360,tam=17,color='#1f2430',fondo='#ffffff',escala=2}={}){
  const m=medir(fragmento,{max:ancho,tam,color}),img=await svgDe(fragmento,{...m,tam,color,max:ancho});
  if(!img||!(await sePuede(img)))return null;
  const c=document.createElement('canvas');c.width=Math.round(m.w*escala);c.height=Math.round(m.h*escala);const x=c.getContext('2d');
  x.fillStyle=fondo;x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));
  return blob?{blob,ancho:c.width,alto:c.height,w:m.w,h:m.h}:null;
}

/* ---------- PDF mínimo: cada página es una imagen JPEG a lo ancho de una hoja carta ---------- */
export async function pdfDePaginas(paginas){   // paginas: [{blob (JPEG), ancho, alto}]
  const enc=new TextEncoder(),partes=[],offs=[];let largo=0;
  const poner=x=>{const b=typeof x==='string'?enc.encode(x):x;partes.push(b);largo+=b.length};
  const obj=(n,cuerpo)=>{offs[n]=largo;poner(`${n} 0 obj\n`);for(const c of [].concat(cuerpo))poner(c);poner('\nendobj\n')};
  poner('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n=paginas.length,W=612,kids=paginas.map((_,i)=>`${3+i*3} 0 R`).join(' ');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  for(let i=0;i<n;i++){
    const p=paginas[i],H=Math.round(W*p.alto/p.ancho),datos=new Uint8Array(await p.blob.arrayBuffer()),pg=3+i*3,im=pg+1,ct=pg+2;
    const dibujo=`q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${im} 0 R >> >> /Contents ${ct} 0 R >>`);
    obj(im,[`<< /Type /XObject /Subtype /Image /Width ${p.ancho} /Height ${p.alto} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${datos.length} >>\nstream\n`,datos,'\nendstream']);
    obj(ct,`<< /Length ${dibujo.length} >>\nstream\n${dibujo}\nendstream`);
  }
  const total=3+n*3,xref=largo;
  poner(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)poner(`${String(offs[i]).padStart(10,'0')} 00000 n \n`);
  poner(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(partes,{type:'application/pdf'});
}
