/* «⤓ Descargar o compartir» (PROMPT-EXPORTAR-NOTAS): la hoja con el formato (PDF por defecto), las opciones del PDF y
   la acción: 💾 Guardar en el teléfono (app nativa: Documentos/Estudio+, con «Abrir»; web: descarga normal), 📤 Compartir
   (WhatsApp, Drive, correo…) o 🖨️ Imprimir (también «Guardar como PDF» de Android). Recuerda lo último que elegiste. */
import {esc} from '../../utilidades.js';
import {aviso,avisoAccion} from '../ui.js';
import {esNativa,imprimir,compartirNativo} from '../plataforma.js';
import {opciones,guardarOpciones,exportarNotas,FORMATOS} from './exportar.js';
import {descargar,archivoRespaldo} from './respaldo.js';
import {leerArchivo} from './db.js';
import {render} from './formato.js';
import {tex} from '../formula.js';
import {APP_NOMBRE} from '../../config.js';

const FMT=[['pdf','📄 PDF','Recomendado: se abre en cualquier teléfono y se imprime.'],['png','🖼️ Imagen PNG','Una imagen por página, para WhatsApp o historias.'],
  ['txt','📝 Texto (.txt)','Solo el texto, sin formato.'],['md','Ⓜ️ Markdown (.md)','Para Obsidian, Notion o GitHub: las fórmulas quedan como $…$.'],
  ['estudio','📦 Respaldo de Estudio+ (.estudio)','Solo para abrir en Estudio+: lleva TODO (progreso, notas, fotos), no solo esta nota.']];
const radio=(nombre,valor,actual,texto,desc='')=>`<label class="exp-opcion"><input type="radio" name="${nombre}" value="${valor}"${valor===actual?' checked':''}><span><b>${texto}</b>${desc?`<span class="nota">${desc}</span>`:''}</span></label>`;
const casilla=(id,on,texto)=>`<label class="exp-casilla"><input type="checkbox" id="${id}"${on?' checked':''}> <span>${texto}</span></label>`;

function htmlHoja(notas,o){
  const varias=notas.length>1;
  return `<div class="modal exp-hoja" role="dialog" aria-modal="true" aria-labelledby="exp-t"><h2 id="exp-t">⤓ Descargar o compartir</h2>
<p class="nota" style="margin-top:-4px">${varias?`${notas.length} notas`:`«${esc(notas[0].titulo||'Nota')}»`}</p>
<fieldset class="exp-grupo"><legend>Formato</legend>${FMT.map(([v,t,d])=>radio('exp-fmt',v,o.formato,t,d)).join('')}</fieldset>
<fieldset class="exp-grupo" id="exp-pdf"${o.formato==='pdf'||o.formato==='png'?'':' hidden'}><legend>Opciones</legend>
<label class="exp-fila"><span>Tamaño</span><select id="exp-tam"><option value="carta"${o.tam==='carta'?' selected':''}>Carta</option><option value="a4"${o.tam==='a4'?' selected':''}>A4</option></select></label>
<label class="exp-fila"><span>Márgenes</span><select id="exp-margen"><option value="normal"${o.margen==='normal'?' selected':''}>Normales</option><option value="estrecho"${o.margen==='estrecho'?' selected':''}>Estrechos</option></select></label>
${casilla('exp-dibujos',o.dibujos,'Incluir los dibujos')}${casilla('exp-fotos',o.fotos,'Incluir las fotos')}${casilla('exp-tarjetas',o.tarjetas,'Incluir las tarjetas de repaso (al final)')}
<p class="nota" style="margin:6px 0 0">Siempre con fondo blanco, aunque la app esté en modo oscuro.</p></fieldset>
${varias?`<fieldset class="exp-grupo" id="exp-varias"${o.formato==='estudio'?' hidden':''}><legend>Varias notas</legend>${radio('exp-unir','uno',o.unir,'Un solo archivo','Con índice al principio (PDF).')}${radio('exp-unir','zip',o.unir,'Un archivo por nota en un .zip')}</fieldset>`:''}
<div class="pila"><button class="btn ancho" data-exp="guardar">💾 Guardar en el teléfono</button><button class="btn ghost ancho" data-exp="compartir">📤 Compartir</button>
<button class="btn ghost ancho" data-exp="imprimir"${o.formato==='pdf'?'':' hidden'}>🖨️ Imprimir</button><button class="btn ghost ancho" data-exp="cancelar">Cancelar</button></div></div>`;
}
const leerForm=f=>({formato:f.querySelector('[name="exp-fmt"]:checked')?.value||'pdf',tam:f.querySelector('#exp-tam')?.value||'carta',margen:f.querySelector('#exp-margen')?.value||'normal',
  dibujos:!!f.querySelector('#exp-dibujos')?.checked,fotos:!!f.querySelector('#exp-fotos')?.checked,tarjetas:!!f.querySelector('#exp-tarjetas')?.checked,unir:f.querySelector('[name="exp-unir"]:checked')?.value||'uno'});

// Guardar en el teléfono: en la app nativa en Documentos/Estudio+ (con su tipo MIME); en la web, la descarga de siempre
async function guardarArchivos(archivos){
  if(!esNativa()){for(const a of archivos)descargar(a.blob,a.nombre);aviso(archivos.length===1?`⤓ Descargado: ${archivos[0].nombre}`:`⤓ ${archivos.length} archivos descargados`);return}
  const {Filesystem,Directory}=await import('@capacitor/filesystem');
  const base64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(b)});
  let donde='Documentos/Estudio+';
  for(const a of archivos){
    try{await Filesystem.writeFile({path:`${APP_NOMBRE}/${a.nombre}`,data:await base64(a.blob),directory:Directory.Documents,recursive:true})}
    catch(e){donde='el almacenamiento de la app';await Filesystem.writeFile({path:`${APP_NOMBRE}/${a.nombre}`,data:await base64(a.blob),directory:Directory.Data,recursive:true})}
  }
  const a=archivos[0];
  avisoAccion(`💾 Guardado en ${donde}: ${archivos.length===1?a.nombre:`${archivos.length} archivos`}`,'Abrir',()=>compartirNativo({title:a.nombre,files:archivos.map(x=>new File([x.blob],x.nombre,{type:x.blob.type}))}).catch(()=>{}));
}
async function compartirArchivos(archivos){
  const files=archivos.map(a=>new File([a.blob],a.nombre,{type:a.blob.type||'application/octet-stream'}));
  if(navigator.canShare?.({files})){try{await navigator.share({title:archivos[0].nombre,files})}catch(e){if(e.name!=='AbortError')aviso('No se pudo compartir.')}return}
  aviso('Este navegador no comparte archivos: se descargan.');await guardarArchivos(archivos);
}
// Imprimir: las notas formateadas (fórmulas, listas, fotos) en una capa que solo se ve al imprimir
export async function imprimirNotas(notas,o=opciones()){
  const capa=document.createElement('div');capa.id='exp-imprimir';
  capa.innerHTML=notas.map(n=>`<article class="exp-nota"><h1>${esc(n.titulo||'Nota')}</h1><div class="nota-render">${render(o.tarjetas?n.cuerpo:String(n.cuerpo).split('\n').filter(l=>!l.startsWith('🃏')).join('\n'),{tex})}</div></article>`).join('');
  const urls=[];
  for(const img of capa.querySelectorAll('img[data-img]')){const a=await leerArchivo(img.dataset.img).catch(()=>null);
    if(!a?.blob||(a.dibujo?!o.dibujos:!o.fotos)){img.closest('figure')?.remove()||img.remove();continue}const u=URL.createObjectURL(a.blob);urls.push(u);img.src=u}
  document.body.appendChild(capa);document.body.classList.add('imprimiendo-exp');
  await Promise.all([...capa.querySelectorAll('img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));
  try{await imprimir(notas.length===1?notas[0].titulo||'Nota':'Notas')}finally{document.body.classList.remove('imprimiendo-exp');capa.remove();urls.forEach(u=>URL.revokeObjectURL(u))}
}

/* La hoja: devuelve una promesa que se resuelve al cerrarla */
export function abrirExportar(notas){
  if(!notas?.length){aviso('Elige al menos una nota.');return Promise.resolve(null)}
  return new Promise(res=>{
    const f=document.createElement('div');f.className='modal-fondo exp-fondo';f.innerHTML=htmlHoja(notas,opciones());
    const cerrar=v=>{f.remove();document.removeEventListener('keydown',tecla,true);res(v)};
    const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}};
    f.addEventListener('change',()=>{const o=leerForm(f);guardarOpciones(o);
      f.querySelector('#exp-pdf').hidden=!(o.formato==='pdf'||o.formato==='png');const v=f.querySelector('#exp-varias');if(v)v.hidden=o.formato==='estudio';
      f.querySelector('[data-exp="imprimir"]').hidden=o.formato!=='pdf'});
    f.addEventListener('click',async e=>{
      if(e.target===f)return cerrar(null);
      const b=e.target.closest('[data-exp]');if(!b)return;const accion=b.dataset.exp;
      if(accion==='cancelar')return cerrar(null);
      const o=leerForm(f);guardarOpciones(o);
      f.querySelectorAll('[data-exp]').forEach(x=>x.disabled=true);const texto=b.textContent;b.textContent='Preparando…';
      try{
        if(accion==='imprimir'){cerrar('imprimir');await imprimirNotas(notas,o);return}
        const archivos=o.formato==='estudio'?[await archivoRespaldo().then(r=>({nombre:r.nombre,blob:r.blob}))]:await exportarNotas(notas,o);
        globalThis.__ultimaExportacion=archivos.map(x=>({nombre:x.nombre,tipo:x.blob.type,bytes:x.blob.size}));   // para npm run cuaderno
        cerrar(accion);
        if(accion==='guardar')await guardarArchivos(archivos);else await compartirArchivos(archivos);
      }catch(err){console.error(err);b.textContent=texto;f.querySelectorAll('[data-exp]').forEach(x=>x.disabled=false);aviso('No se pudo preparar el archivo.')}
    });
    document.addEventListener('keydown',tecla,true);
    document.body.appendChild(f);f.querySelector('[name="exp-fmt"]:checked')?.focus();
  });
}
export {FORMATOS};
