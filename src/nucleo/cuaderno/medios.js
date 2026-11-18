/* Fotos y dibujos de las notas.
   - comprimirFoto(file): la foto de la cámara o la galería se reduce (lado mayor 1600 px, JPEG 80 %) antes de guardarla.
   - abrirDibujo(): lienzo a pantalla completa para dibujar con el dedo o el S Pen (lápiz, borrador, 3 colores, 3 grosores,
     deshacer y rehacer); devuelve un PNG. */
import {guardarArchivo,nuevoId} from './db.js';
import {crearLienzo} from '../lienzo.js';

const MAX=1600;
const aBlob=(c,tipo,q)=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('No se pudo procesar la imagen.')),tipo,q));
async function cargarImagen(file){
  if('createImageBitmap' in window){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){}}
  return new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{res(i);setTimeout(()=>URL.revokeObjectURL(u),1000)};i.onerror=()=>rej(new Error('No se pudo abrir la imagen.'));i.src=u});
}
export async function comprimirFoto(file){
  const img=await cargarImagen(file),w0=img.width,h0=img.height,k=Math.min(1,MAX/Math.max(w0,h0));
  const c=document.createElement('canvas');c.width=Math.round(w0*k);c.height=Math.round(h0*k);
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);img.close?.();
  return {blob:await aBlob(c,'image/jpeg',.8),ancho:c.width,alto:c.height};
}
// Guarda una imagen de la nota y devuelve su marca para el texto: ![alt](img:<id>)
export async function guardarImagen(notaId,{blob,ancho,alto},alt){
  const id=nuevoId();
  await guardarArchivo({id,nota:notaId,blob,tipo:blob.type,ancho,alto,creada:Date.now()});
  return `![${alt}](img:${id})`;
}

/* ---------- dibujo a mano (dedo, ratón o S Pen: presión, palma, borrador del lápiz; ver nucleo/lienzo.js) ---------- */
const COLORES=[['Negro','#1f2430'],['Azul','#2563eb'],['Rojo','#dc2626']];
const GROSORES=[['Fino',2],['Medio',3.5],['Grueso',6]];
export function abrirDibujo(){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='dibujo-fondo';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label','Dibujo');
    f.innerHTML=`<div class="dibujo-barra">
<button type="button" class="btn-icono" data-d="cancelar" aria-label="Cancelar">✕</button>
<span class="segmentos dibujo-herr" role="group" aria-label="Herramienta"><button type="button" data-h="lapiz" aria-pressed="true" aria-label="Lápiz">✏️</button><button type="button" data-h="borrar" aria-pressed="false" aria-label="Borrador">🧽</button></span>
<span class="dibujo-colores" role="group" aria-label="Color">${COLORES.map(([n,c],i)=>`<button type="button" class="color" data-c="${c}" aria-label="${n}" aria-pressed="${i===0}" style="--c:${c}"></button>`).join('')}</span>
<span class="segmentos" role="group" aria-label="Grosor">${GROSORES.map(([n,g],i)=>`<button type="button" data-g="${g}" aria-pressed="${i===1}" aria-label="${n}"><span class="dibujo-grosor" style="--g:${g*2}px"></span></button>`).join('')}</span>
<button type="button" class="btn-icono" data-d="deshacer" aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↩️</button><button type="button" class="btn-icono" data-d="rehacer" aria-label="Rehacer" title="Rehacer (Ctrl+Y)">↪️</button>
</div><canvas class="dibujo-lienzo"></canvas>
<p class="nota dibujo-ayuda">Con el S Pen, el trazo sigue la presión; el botón del lápiz borra. Con el lápiz en uso, el dedo solo desplaza.</p>
<div class="dibujo-pie"><button type="button" class="btn ghost" data-d="limpiar">Limpiar</button><button type="button" class="btn" data-d="guardar">Guardar dibujo</button></div>`;
    document.body.appendChild(f);
    const cv=f.querySelector('canvas'),l=crearLienzo(cv);l.grosor(3.5);
    const cerrar=v=>{l.destruir();f.remove();document.removeEventListener('keydown',tecla,true);res(v)};
    const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?l.rehacer():l.deshacer()}
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();l.rehacer()}};
    document.addEventListener('keydown',tecla,true);
    const marcar=(sel,b)=>f.querySelectorAll(sel).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    f.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.h){l.herramienta(b.dataset.h);marcar('[data-h]',b)}
      if(b.dataset.c){l.color(b.dataset.c);marcar('[data-c]',b);marcar('[data-h]',f.querySelector('[data-h="lapiz"]'))}
      if(b.dataset.g){l.grosor(+b.dataset.g);marcar('[data-g]',b)}
      if(b.dataset.d==='deshacer')l.deshacer();
      if(b.dataset.d==='rehacer')l.rehacer();
      if(b.dataset.d==='limpiar')l.limpiar();
      if(b.dataset.d==='cancelar')cerrar(null);
      if(b.dataset.d==='guardar'){if(!l.usado){cerrar(null);return}b.disabled=true;cerrar(await l.aBlob())}
    });
  });
}
