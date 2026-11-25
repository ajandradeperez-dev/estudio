/* ▦ Diálogo para crear o editar una matriz (PROMPT-PLANOS-MATRICES): lo usan el dibujo (insertar) y el teclado Σ del
   cuaderno (escribe el LaTeX: bmatrix, pmatrix, vmatrix o array con | para la aumentada; nadie escribe & ni \\ a mano).
   - Tamaño con una cuadrícula táctil (tocar o arrastrar hasta r × c) y botones 2×2, 3×3, 3×4 aumentada, 4×5 aumentada e
     Identidad n×n; casilla «Aumentada» (la línea antes de la última columna, o donde elijas); paréntesis y alineación.
   - conCeldas: una cuadrícula de casillas para escribir los números (Tab avanza).
   - sistema: «Pegar un sistema» («x + 3y + 3z = 2» por renglón) arma la matriz aumentada sola.
   dialogoMatriz({titulo, inicial:{celdas, paren, aumentada, alinear}, conCeldas, sistema, boton}) → Promise<{celdas, paren, aumentada, alinear}|null> */
import {esc} from '../utilidades.js';
import {leerSistema,aTextos} from './matrices.js';

const MAXF=6,MAXC=6;
const PARENTESIS=[['[]','[ ]'],['()','( )'],['{}','{ }'],['||','| |'],['','ninguno']];
export function dialogoMatriz({titulo='▦ Matriz',inicial=null,conCeldas=true,sistema=false,boton='Insertar'}={}){
  return new Promise(res=>{
    let filas=inicial?.celdas?.length||3,cols=inicial?.celdas?.[0]?.length||4,celdas=inicial?.celdas?.map(f=>f.slice())||null;
    let paren=inicial?.paren??'[]',aum=inicial?inicial.aumentada:3,alinear=inicial?.alinear||'derecha';
    if(!inicial){aum=null;filas=3;cols=3}
    const m=document.createElement('div');m.className='modal-fondo';
    const leer=()=>{if(!conCeldas)return;celdas=Array.from({length:filas},(_,i)=>Array.from({length:cols},(_,j)=>m.querySelector(`[data-cel="${i}-${j}"]`)?.value.trim()??celdas?.[i]?.[j]??''))};
    const pintar=()=>{
      const cel=(i,j)=>celdas?.[i]?.[j]??'';
      m.innerHTML=`<form class="modal mtz-dlg" role="dialog" aria-modal="true" aria-labelledby="mz-t"><h2 id="mz-t" style="margin-top:0">${titulo}</h2>
<p class="nota" style="margin:0 0 6px">Tamaño: <b class="mtz-tam">${filas} × ${cols}</b>${aum!=null?' · aumentada':''}</p>
<div class="mtz-rejilla" role="grid" aria-label="Elige el tamaño tocando o arrastrando">${Array.from({length:MAXF},(_,i)=>Array.from({length:MAXC},(_,j)=>`<button type="button" class="mtz-c${i<filas&&j<cols?' on':''}" data-rc="${i+1}-${j+1}" aria-label="${i+1} × ${j+1}"></button>`).join('')).join('')}</div>
<div class="row mtz-rapidos">${[['2-2','2×2'],['3-3','3×3'],['3-4a','3×4 aumentada'],['4-5a','4×5 aumentada'],['id','Identidad']].map(([v,n])=>`<button type="button" class="btn ghost btn-chico" data-rap="${v}">${n}</button>`).join('')}</div>
<label class="dib-check"><input type="checkbox" data-aum ${aum!=null?'checked':''}> Aumentada (línea antes de la columna ${(aum??cols-1)+1})</label>
${aum!=null&&cols>2?`<label class="campo">La línea va antes de la columna <select data-aumcol>${Array.from({length:cols-1},(_,k)=>`<option value="${k+1}" ${aum===k+1?'selected':''}>${k+2}</option>`).join('')}</select></label>`:''}
<div class="segmentos" role="group" aria-label="Paréntesis">${PARENTESIS.map(([v,n])=>`<button type="button" data-par="${v}" aria-pressed="${paren===v}">${n}</button>`).join('')}</div>
<div class="segmentos" role="group" aria-label="Alinear los números">${[['derecha','Números a la derecha'],['centro','Centrados']].map(([v,n])=>`<button type="button" data-ali="${v}" aria-pressed="${alinear===v}">${n}</button>`).join('')}</div>
${conCeldas?`<div class="mtz-celdas" style="--cols:${cols}" role="group" aria-label="Celdas">${Array.from({length:filas},(_,i)=>Array.from({length:cols},(_,j)=>`<input data-cel="${i}-${j}" value="${esc(cel(i,j))}" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Renglón ${i+1}, columna ${j+1}"${aum!=null&&j===aum?' class="tras-linea"':''}>`).join('')).join('')}</div>`:''}
${sistema?`<details class="mtz-sistema"><summary>📋 Pegar un sistema de ecuaciones</summary><textarea data-sis rows="4" spellcheck="false" placeholder="x + 3y + 3z = 2&#10;2x + 3y + 9z = 4&#10;2x + 4y + 2z = 4"></textarea><p class="nota mtz-sis-nota">Se arma la matriz aumentada (0 en las variables que falten).</p></details>`:''}
<p class="nota mtz-error" role="alert" style="color:var(--bad)"></p>
<div class="row"><button type="button" class="btn ghost" data-r="0">Cancelar</button><button type="submit" class="btn">${boton}</button></div></form>`;
    };
    const tam=(f,c)=>{leer();filas=Math.max(1,Math.min(MAXF,f));cols=Math.max(1,Math.min(MAXC,c));if(aum!=null&&aum>=cols)aum=cols>1?cols-1:null;pintar()};
    const cerrar=v=>{m.remove();removeEventListener('pointerup',soltar);res(v)};
    pintar();
    // arrastrar sobre la cuadrícula elige el tamaño
    let arr=false;
    m.addEventListener('pointerdown',e=>{const c=e.target.closest('[data-rc]');if(c){arr=true;const [f,co]=c.dataset.rc.split('-').map(Number);tam(f,co)}});
    m.addEventListener('pointermove',e=>{if(!arr)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-rc]');if(el){const [f,co]=el.dataset.rc.split('-').map(Number);if(f!==filas||co!==cols)tam(f,co)}});
    const soltar=()=>{arr=false};addEventListener('pointerup',soltar);
    m.addEventListener('click',e=>{
      const b=e.target.closest('button');if(e.target===m){cerrar(null);return}if(!b)return;
      if(b.dataset.r==='0'){cerrar(null);return}
      if(b.dataset.rap){leer();const r=b.dataset.rap;
        if(r==='id'){const n=Math.max(2,Math.min(MAXF,filas));filas=cols=n;aum=null;celdas=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?'1':'0'));pintar();return}
        const [f,c]=r.replace('a','').split('-').map(Number);aum=r.endsWith('a')?c-1:null;tam(f,c);return}
      if(b.dataset.par!==undefined){leer();paren=b.dataset.par;pintar();return}
      if(b.dataset.ali){leer();alinear=b.dataset.ali;pintar();return}
    });
    m.addEventListener('change',e=>{const t=e.target;
      if(t.dataset.aum!==undefined){leer();aum=t.checked?(cols>1?cols-1:null):null;pintar()}
      if(t.dataset.aumcol!==undefined){leer();aum=+t.value;pintar()}
    });
    m.addEventListener('input',e=>{if(e.target.dataset.sis===undefined)return;const s=leerSistema(e.target.value),nota=m.querySelector('.mtz-sis-nota');
      nota.textContent=s?`✓ ${s.M.length} ecuaciones con ${s.vars.join(', ')}: matriz ${s.M.length} × ${s.vars.length+1} aumentada.`:'Escribe una ecuación por renglón, como «2x + 3y = 4».'});
    m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
    m.addEventListener('submit',e=>{e.preventDefault();leer();
      const sis=m.querySelector('[data-sis]')?.value.trim();
      if(sis){const s=leerSistema(sis);if(!s){m.querySelector('.mtz-error').textContent='No entiendo el sistema: escribe una ecuación por renglón, como «x + 3y = 2».';return}
        cerrar({celdas:aTextos(s.M),paren,aumentada:s.vars.length,alinear,vars:s.vars});return}
      cerrar({celdas:celdas||Array.from({length:filas},()=>Array(cols).fill('')),paren,aumentada:aum,alinear});
    });
    document.body.appendChild(m);(m.querySelector('[data-cel]')||m.querySelector('[data-rc]')).focus();
  });
}
