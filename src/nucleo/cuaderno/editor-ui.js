/* Piezas del editor del cuaderno (notas.js): teclado de fórmulas, visor de fotos, recortar y girar, «🃏 Crear tarjeta»
   y el bloque de dibujo dentro de la nota (dedo y ratón: lápiz, borrador, 3 grosores, 4 colores, deshacer; un dedo
   dibuja y dos desplazan; el S Pen sigue igual que en nucleo/lienzo.js). */
import {esc} from '../../utilidades.js';
import {crearLienzo} from '../lienzo.js';

/* ---------- Σ teclado de fórmulas: [lo que se ve, lo que se escribe, dónde queda el cursor (desde el final)] ---------- */
export const SIMBOLOS=[['√','\\sqrt{}',1],['x²','^2',0],['xⁿ','^{}',1],['a/b','\\frac{}{}',3],['∫','\\int ',0],['Σ','\\sum ',0],['π','\\pi ',0],
  ['≤','\\le ',0],['≥','\\ge ',0],['≠','\\ne ',0],['→','\\to ',0],['±','\\pm ',0],['·','\\cdot ',0],['∞','\\infty ',0],['α','\\alpha ',0],['β','\\beta ',0],
  ['θ','\\theta ',0],['λ','\\lambda ',0],['μ','\\mu ',0],['σ','\\sigma ',0],['Δ','\\Delta ',0],['x₁','_{}',1],['lím','\\lim_{x \\to }',1],
  ['( )','\\left(  \\right)',8],['[2×2]','\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',0]];
export const htmlTecladoFormulas=()=>`<div class="ed-tfx" id="ed-tfx" role="group" aria-label="Símbolos para fórmulas">${SIMBOLOS.map(([v],i)=>`<button type="button" data-tfx="${i}" aria-label="Escribir ${esc(v)}">${esc(v)}</button>`).join('')}<button type="button" data-tfx="cerrar" aria-label="Cerrar los símbolos">✕</button></div>`;

/* ---------- visor: la foto en grande (tocar para ampliar; Atrás o tocar fuera la cierra) ---------- */
export function abrirVisor(url,pie=''){
  const f=document.createElement('div');f.className='modal-fondo nota-visor';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label','Foto ampliada');
  f.innerHTML=`<figure class="nota-visor-caja"><img src="${url}" alt="${esc(pie||'Foto de la nota')}">${pie?`<figcaption>${esc(pie)}</figcaption>`:''}</figure><button type="button" class="btn" data-x>Cerrar</button>`;
  const cerrar=()=>{f.remove();document.removeEventListener('keydown',tecla,true)},tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar()}};
  f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-x]'))cerrar()});
  document.addEventListener('keydown',tecla,true);document.body.appendChild(f);f.querySelector('[data-x]').focus();
}

/* ---------- ✂️ recortar y girar una foto: devuelve {blob, ancho, alto} o null ---------- */
export function editarFoto(blob){
  return new Promise(async res=>{
    let img;try{img=await createImageBitmap(blob)}catch(e){res(null);return}
    const f=document.createElement('div');f.className='modal-fondo';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label','Recortar o girar');
    f.innerHTML=`<div class="modal modal-ancho"><h2 style="margin-top:0">✂️ Recortar o girar</h2><p class="nota" style="margin-top:0">Arrastra sobre la foto para elegir lo que se queda.</p>
<canvas class="ed-recorte" aria-label="Foto: arrastra para recortar"></canvas>
<div class="row" style="flex-wrap:wrap;margin-top:8px"><button type="button" class="btn ghost btn-chico" data-r="girar">⟳ Girar</button><button type="button" class="btn ghost btn-chico" data-r="todo">Toda la foto</button></div>
<div class="row" style="margin-top:12px"><button type="button" class="btn ghost" data-r="no">Cancelar</button><button type="button" class="btn" data-r="si">Guardar</button></div></div>`;
    document.body.appendChild(f);
    const cv=f.querySelector('canvas'),x=cv.getContext('2d');let giro=0,sel=null,arrastre=null;
    const dims=()=>giro%2?[img.height,img.width]:[img.width,img.height];
    function pintar(){
      const [w,h]=dims(),max=Math.min(f.querySelector('.modal').clientWidth-8,640),k=Math.min(max/w,(innerHeight*.5)/h);
      cv.width=Math.round(w*k);cv.height=Math.round(h*k);x.save();x.translate(cv.width/2,cv.height/2);x.rotate(giro*Math.PI/2);
      const [iw,ih]=giro%2?[cv.height,cv.width]:[cv.width,cv.height];x.drawImage(img,-iw/2,-ih/2,iw,ih);x.restore();
      if(sel){const [a,b,c,d]=sel.map((v,i)=>v*(i%2?cv.height:cv.width));x.fillStyle='rgba(0,0,0,.5)';
        x.fillRect(0,0,cv.width,b);x.fillRect(0,d,cv.width,cv.height-d);x.fillRect(0,b,a,d-b);x.fillRect(c,b,cv.width-c,d-b);
        x.strokeStyle='#fff';x.lineWidth=2;x.setLineDash([6,4]);x.strokeRect(a,b,c-a,d-b);x.setLineDash([])}
    }
    const rel=e=>{const r=cv.getBoundingClientRect();return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))]};
    cv.style.touchAction='none';
    cv.addEventListener('pointerdown',e=>{arrastre=rel(e);try{cv.setPointerCapture(e.pointerId)}catch(z){}});
    cv.addEventListener('pointermove',e=>{if(!arrastre)return;const p=rel(e);sel=[Math.min(arrastre[0],p[0]),Math.min(arrastre[1],p[1]),Math.max(arrastre[0],p[0]),Math.max(arrastre[1],p[1])];pintar()});
    cv.addEventListener('pointerup',()=>{arrastre=null;if(sel&&(sel[2]-sel[0]<.04||sel[3]-sel[1]<.04)){sel=null;pintar()}});
    const cerrar=v=>{img.close?.();f.remove();document.removeEventListener('keydown',tecla,true);res(v)},tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}};
    document.addEventListener('keydown',tecla,true);
    f.addEventListener('click',async e=>{const b=e.target.closest('[data-r]');if(!b)return;const r=b.dataset.r;
      if(r==='no')cerrar(null);
      if(r==='girar'){giro=(giro+1)%4;sel=null;pintar()}
      if(r==='todo'){sel=null;pintar()}
      if(r==='si'){
        if(!giro&&!sel){cerrar(null);return}
        const [w,h]=dims(),s=sel||[0,0,1,1],o=document.createElement('canvas'),k=Math.min(1,1600/Math.max(w*(s[2]-s[0]),h*(s[3]-s[1])));
        o.width=Math.max(1,Math.round(w*(s[2]-s[0])*k));o.height=Math.max(1,Math.round(h*(s[3]-s[1])*k));const y=o.getContext('2d');
        y.fillStyle='#fff';y.fillRect(0,0,o.width,o.height);y.scale(k,k);y.translate(-s[0]*w,-s[1]*h);
        y.translate(w/2,h/2);y.rotate(giro*Math.PI/2);y.drawImage(img,-img.width/2,-img.height/2);
        o.toBlob(b2=>cerrar(b2?{blob:b2,ancho:o.width,alto:o.height}:null),'image/jpeg',.85);
      }});
    pintar();
  });
}

/* ---------- 🃏 crear una tarjeta de repaso (la respuesta viene del texto seleccionado) ---------- */
export function pedirTarjeta(respuesta=''){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='modal-fondo';
    f.innerHTML=`<form class="modal" role="dialog" aria-modal="true" aria-labelledby="tj-t"><h2 id="tj-t" style="margin-top:0">🃏 Crear tarjeta de repaso</h2>
<label class="campo">Pregunta<input id="tj-q" autocomplete="off" placeholder="¿Qué quieres recordar?" required></label>
<label class="campo">Respuesta<textarea id="tj-a" rows="2" required>${esc(respuesta)}</textarea></label>
<p class="nota">Se agrega al final de la nota y entra hoy a Repasar.</p>
<div class="row"><button type="button" class="btn ghost" data-x>Cancelar</button><button type="submit" class="btn">Crear tarjeta</button></div></form>`;
    const cerrar=v=>{f.remove();res(v)};
    f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-x]'))cerrar(null)});
    f.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
    f.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const q=f.querySelector('#tj-q').value.replace(/[|\n]/g,' ').trim(),a=f.querySelector('#tj-a').value.replace(/[|\n]/g,' ').trim();if(q&&a)cerrar({q,a})});
    document.body.appendChild(f);f.querySelector('#tj-q').focus();
  });
}

/* ---------- ✏️ bloque de dibujo dentro de la nota ---------- */
export const COLORES=[['Negro','#1f2430'],['Azul','#2563eb'],['Rojo','#dc2626'],['Verde','#15803d']];
export const GROSORES=[['Fino',2],['Medio',3.5],['Grueso',7]];
export const htmlDibujo=()=>`<div class="ed-dib-barra" role="toolbar" aria-label="Herramientas de dibujo">
<span class="segmentos" role="group" aria-label="Herramienta"><button type="button" data-dib="lapiz" aria-pressed="true" aria-label="Lápiz">✏️</button><button type="button" data-dib="borrar" aria-pressed="false" aria-label="Borrador">🧽</button></span>
<span class="segmentos" role="group" aria-label="Grosor">${GROSORES.map(([n,g],i)=>`<button type="button" data-dibg="${g}" aria-pressed="${i===1}" aria-label="${n}"><span class="dibujo-grosor" style="--g:${Math.round(g*1.6)}px"></span></button>`).join('')}</span>
<span class="dibujo-colores" role="group" aria-label="Color">${COLORES.map(([n,c],i)=>`<button type="button" class="color" data-dibc="${c}" aria-label="${n}" aria-pressed="${i===0}" style="--c:${c}"></button>`).join('')}</span>
<button type="button" class="btn-icono" data-dib="deshacer" aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↩️</button></div>
<canvas class="ed-lienzo" aria-label="Lienzo: dibuja con un dedo, el ratón o el lápiz; con dos dedos te mueves por la nota"></canvas>
<div class="row ed-dib-pie"><span class="nota">Un dedo dibuja · dos dedos se desplazan</span><button type="button" class="btn ghost btn-chico" data-dib="cancelar">Cancelar</button><button type="button" class="btn btn-chico" data-dib="listo">✓ Listo</button></div>`;
// Activa el lienzo de un bloque de dibujo; los trazos son los del dibujo que se edita (o vacíos)
export function activarDibujo(caja,trazos=[]){
  const cv=caja.querySelector('.ed-lienzo'),l=crearLienzo(cv,{trazos:trazos.map(t=>({...t,puntos:t.puntos.map(p=>[...p])}))});l.grosor(3.5);
  const marcar=(sel,b)=>caja.querySelectorAll(sel).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  caja.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.dib==='lapiz'||b.dataset.dib==='borrar'){l.herramienta(b.dataset.dib);marcar('[data-dib="lapiz"],[data-dib="borrar"]',b)}
    if(b.dataset.dib==='deshacer')l.deshacer();
    if(b.dataset.dibg){l.grosor(+b.dataset.dibg);marcar('[data-dibg]',b)}
    if(b.dataset.dibc){l.color(b.dataset.dibc);marcar('[data-dibc]',b);marcar('[data-dib="lapiz"],[data-dib="borrar"]',caja.querySelector('[data-dib="lapiz"]'))}
  });
  return l;
}
// Trazos más livianos para guardar (un decimal)
export const trazosLigeros=ts=>ts.map(t=>({...t,puntos:t.puntos.map(p=>p.map(v=>Math.round(v*10)/10))}));
