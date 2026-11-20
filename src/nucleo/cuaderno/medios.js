/* Fotos y dibujos de las notas.
   - comprimirFoto(file): la foto de la cámara o la galería se reduce (lado mayor 1600 px, JPEG 80 %) antes de guardarla.
   El dibujo es un bloque dentro de la nota (cuaderno/editor-ui.js). */
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
