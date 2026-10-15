/* Mini hoja de cálculo táctil: cuadrícula A1… con encabezados, la celda donde va la respuesta resaltada y selección de
   celdas y rangos con el dedo (un toque escribe la referencia en la barra de fórmulas; otro toque seguido la convierte en
   rango, A2:A9; con mouse también se puede arrastrar). Solo la hoja se desplaza de lado: la página no. */
import {esc} from '../../utilidades.js';
import {crearHoja,valorCelda,mostrar,numACol,ref,partes,copiarFormula,esError} from './formulas.js';

const usadas=h=>{let f=1,c=1;for(const k of Object.keys(h.celdas)){const p=partes(k);if(p){f=Math.max(f,p.f);c=Math.max(c,p.c)}}return {f,c}};
// Resultado de escribir una fórmula en el destino (y sus copias): {ref: texto que se ve}
export function previa(h,formula){
  const s=String(formula||'').trim();if(!s)return {};
  const f=s.startsWith('=')?s:'='+s,dest=h.destinos?.length?h.destinos:[h.destino],c={...h.celdas};
  for(const x of dest)c[x]=copiarFormula(f,h.destino,x);
  const hh=crearHoja(c,{filas:h.filas,cols:h.cols,hoy:h.hoy}),out={};
  for(const x of dest)out[x]=mostrar(valorCelda(hh,x),h.formatos?.[x]);
  return out;
}
/* h: {celdas, filas, cols, destino?, destinos?, formatos?, marcar?, hoy?} · o: {previa:{ref:texto}, seleccion:Set, activa, editable} */
export function htmlHoja(h,o={}){
  const hh=crearHoja(h.celdas,{filas:h.filas||12,cols:h.cols||8,hoy:h.hoy}),u=usadas(h);
  const dest=new Set([h.destino,...(h.destinos||[])].filter(Boolean));
  const filas=Math.min(hh.filas,Math.max(u.f+1,...[...dest].map(x=>partes(x).f),o.minFilas||6)),cols=hh.cols;
  const marcar=new Set(h.marcar||[]),sel=o.seleccion||new Set();
  const celda=(c,f)=>{const r=ref(c,f);let txt,cls=[];
    if(dest.has(r)){txt=o.previa?.[r]??(r===h.destino?'?':'…');cls.push(r===h.destino?'xl-destino':'xl-copia')}
    else{const v=valorCelda(hh,r);txt=mostrar(v,h.formatos?.[r]);if(typeof v==='number')cls.push('xl-num');if(esError(v))cls.push('xl-err')}
    if(o.previa?.[r]&&/^#/.test(o.previa[r]))cls.push('xl-err');
    if(marcar.has(r))cls.push('xl-marca');if(sel.has(r))cls.push('xl-sel');if(o.activa===r)cls.push('xl-activa');
    return `<td data-celda="${r}"${cls.length?` class="${cls.join(' ')}"`:''}>${esc(txt)}</td>`};
  return `<div class="xl-marco" role="region" aria-label="Hoja de cálculo (desliza de lado para ver todas las columnas)" tabindex="0"><table class="xl-hoja">
<thead><tr><th class="xl-esq" aria-hidden="true"></th>${Array.from({length:cols},(_,i)=>`<th scope="col">${numACol(i+1)}</th>`).join('')}</tr></thead>
<tbody>${Array.from({length:filas},(_,i)=>`<tr><th scope="row">${i+1}</th>${Array.from({length:cols},(_,j)=>celda(j+1,i+1)).join('')}</tr>`).join('')}</tbody></table></div>`;
}
// Celdas de un rango ('A2:B4' → Set)
export function celdasDe(r){
  const [a,b]=String(r).split(':').map(partes);if(!a)return new Set();const z=b||a,s=new Set();
  for(let f=Math.min(a.f,z.f);f<=Math.max(a.f,z.f);f++)for(let c=Math.min(a.c,z.c);c<=Math.max(a.c,z.c);c++)s.add(ref(c,f));
  return s;
}
const marcarSel=(marco,r)=>{marco.querySelectorAll('.xl-sel').forEach(x=>x.classList.remove('xl-sel'));const s=celdasDe(r);marco.querySelectorAll('td[data-celda]').forEach(td=>{if(s.has(td.dataset.celda))td.classList.add('xl-sel')})};

/* Escribe la referencia tocada en la barra de fórmulas. Si el cursor está justo después de la última referencia tocada,
   el nuevo toque la convierte en rango (A2 → A2:A9); así se arma un rango con dos toques. */
let ultima=null;
export function insertarRef(inp,r,marco){
  if(!inp)return;
  let v=inp.value,pos=inp.selectionStart??v.length;
  if(ultima&&ultima.inp===inp&&ultima.fin===pos&&v.slice(ultima.ini,ultima.fin)===ultima.txt){
    const txt=`${ultima.celda}:${r}`;inp.value=v.slice(0,ultima.ini)+txt+v.slice(ultima.fin);ultima={...ultima,txt,fin:ultima.ini+txt.length};
  }else{
    if(!v.trim()){v='=';pos=1}
    inp.value=v.slice(0,pos)+r+v.slice(pos);ultima={inp,ini:pos,fin:pos+r.length,txt:r,celda:r};
  }
  try{inp.setSelectionRange(ultima.fin,ultima.fin)}catch(e){}
  if(marco)marcarSel(marco,ultima.txt);
  if(matchMedia('(pointer:fine)').matches)inp.focus({preventScroll:true});
  inp.dispatchEvent(new Event('input',{bubbles:true}));
}
export const olvidarRef=()=>{ultima=null};

/* Toques en la hoja: alTocar(ref) en cada toque; con mouse, arrastrar llama a alRango('A2:C5') */
export function activarHoja(marco,{alTocar,alRango}){
  if(!marco)return;
  let ini=null,fin=null,arrastro=false;
  marco.addEventListener('pointerdown',e=>{const td=e.target.closest('td[data-celda]');if(!td||e.pointerType!=='mouse')return;ini=fin=td.dataset.celda;arrastro=false});
  marco.addEventListener('pointerover',e=>{if(!ini||!(e.buttons&1))return;const td=e.target.closest('td[data-celda]');if(td&&td.dataset.celda!==fin){fin=td.dataset.celda;arrastro=true;marcarSel(marco,`${ini}:${fin}`)}});
  marco.addEventListener('pointerup',()=>{if(ini&&arrastro&&alRango){alRango(`${ini}:${fin}`);marco.dataset.ignorar='1'}ini=null});
  marco.addEventListener('click',e=>{if(marco.dataset.ignorar){delete marco.dataset.ignorar;return}const td=e.target.closest('td[data-celda]');if(td)alTocar?.(td.dataset.celda,td)});
}
