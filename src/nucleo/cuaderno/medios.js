/* Fotos y dibujos de las notas.
   - comprimirFoto(file): la foto de la cámara o la galería se reduce (lado mayor 1600 px, JPEG 80 %) antes de guardarla.
   - abrirDibujo(): lienzo a pantalla completa para dibujar con el dedo (lápiz, borrador, 3 colores, deshacer); devuelve un PNG. */
import {guardarArchivo,nuevoId} from './db.js';

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

/* ---------- dibujo a mano ---------- */
const COLORES=[['Negro','#1f2430'],['Azul','#2563eb'],['Rojo','#dc2626']];
export function abrirDibujo(){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='dibujo-fondo';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label','Dibujo');
    f.innerHTML=`<div class="dibujo-barra">
<button type="button" class="btn-icono" data-d="cancelar" aria-label="Cancelar">✕</button>
<span class="segmentos dibujo-herr" role="group" aria-label="Herramienta"><button type="button" data-h="lapiz" aria-pressed="true">✏️</button><button type="button" data-h="borrar" aria-pressed="false" aria-label="Borrador">🧽</button></span>
<span class="dibujo-colores" role="group" aria-label="Color">${COLORES.map(([n,c],i)=>`<button type="button" class="color" data-c="${c}" aria-label="${n}" aria-pressed="${i===0}" style="--c:${c}"></button>`).join('')}</span>
<button type="button" class="btn-icono" data-d="deshacer" aria-label="Deshacer">↩️</button>
</div><canvas class="dibujo-lienzo"></canvas>
<div class="dibujo-pie"><button type="button" class="btn ghost" data-d="limpiar">Limpiar</button><button type="button" class="btn" data-d="guardar">Guardar dibujo</button></div>`;
    document.body.appendChild(f);
    const cv=f.querySelector('canvas'),ctx=cv.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1);
    const r=cv.getBoundingClientRect();cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
    const blanco=()=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore()};
    ctx.scale(dpr,dpr);blanco();ctx.lineCap='round';ctx.lineJoin='round';
    let color=COLORES[0][1],herr='lapiz',trazando=null,usado=false;const historia=[];
    const pos=e=>{const b=cv.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top]};
    cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);
      historia.push(ctx.getImageData(0,0,cv.width,cv.height));if(historia.length>20)historia.shift();
      trazando=pos(e);ctx.strokeStyle=herr==='borrar'?'#fff':color;ctx.lineWidth=herr==='borrar'?22:3;
      ctx.beginPath();ctx.moveTo(...trazando);ctx.lineTo(trazando[0]+.1,trazando[1]+.1);ctx.stroke();usado=true});
    cv.addEventListener('pointermove',e=>{if(!trazando)return;const p=pos(e);ctx.beginPath();ctx.moveTo(...trazando);ctx.lineTo(...p);ctx.stroke();trazando=p});
    const fin=()=>{trazando=null};cv.addEventListener('pointerup',fin);cv.addEventListener('pointercancel',fin);
    const cerrar=v=>{f.remove();document.removeEventListener('keydown',tecla,true);res(v)};
    const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}};
    document.addEventListener('keydown',tecla,true);
    f.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.h){herr=b.dataset.h;f.querySelectorAll('[data-h]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}
      if(b.dataset.c){color=b.dataset.c;herr='lapiz';f.querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));f.querySelectorAll('[data-h]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.h==='lapiz')))}
      if(b.dataset.d==='deshacer'&&historia.length)ctx.putImageData(historia.pop(),0,0);
      if(b.dataset.d==='limpiar'){historia.push(ctx.getImageData(0,0,cv.width,cv.height));blanco()}
      if(b.dataset.d==='cancelar')cerrar(null);
      if(b.dataset.d==='guardar'){if(!usado){cerrar(null);return}b.disabled=true;cerrar({blob:await aBlob(cv,'image/png'),ancho:cv.width,alto:cv.height})}
    });
  });
}
