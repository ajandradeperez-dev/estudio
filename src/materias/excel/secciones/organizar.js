/* Ordenar, filtrar, formato condicional y validación sobre un inventario de ejemplo (simulación visual de las pestañas
   Datos e Inicio de Excel). */
import {$,esc} from '../../../utilidades.js';
import {crearRng} from '../../../nucleo/rng.js';
import {tablaInventario} from '../../../nucleo/generadores/excel-base.js';

let st=null;
const COLS=['Producto','Categoría','Existencia','Mínimo','Precio'];
function nuevo(){return {t:tablaInventario(crearRng(),10),orden:'',sentido:'asc',cat:'todas',fc:true,barras:false,prueba:''}}
function filas(){
  let l=st.t.filas.map((f,i)=>({f,i}));
  if(st.cat!=='todas')l=l.filter(x=>x.f[1]===st.cat);
  if(st.orden!==''){const k=+st.orden;l.sort((a,b)=>{const x=a.f[k],y=b.f[k],r=typeof x==='number'?x-y:String(x).localeCompare(y,'es');return st.sentido==='asc'?r:-r})}
  return l;
}
function tabla(){
  const l=filas(),max=Math.max(...st.t.filas.map(f=>f[2]),1);
  return `<div class="xl-marco"><table class="xl-hoja"><thead><tr><th class="xl-esq" aria-hidden="true"></th>${COLS.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>
${l.map(({f,i})=>{const bajo=st.fc&&f[2]<f[3];return `<tr><th scope="row">${i+2}</th>${f.map((v,j)=>`<td class="${typeof v==='number'?'xl-num':''}${bajo?' xl-pinta':''}">${esc(j===4?'$'+v.toLocaleString('en-US'):String(v))}${j===2&&st.barras?`<span class="xl-barrita" style="width:${Math.round(v/max*40)}px" aria-hidden="true"></span>`:''}</td>`).join('')}</tr>`}).join('')}</tbody></table></div>
<p class="nota">${l.length} de ${st.t.filas.length} filas visibles${st.cat!=='todas'?' (las demás están ocultas por el filtro, no borradas)':''}${st.fc?` · ${l.filter(x=>x.f[2]<x.f[3]).length} bajo el mínimo (regla =$C2<$D2)`:''}.</p>`;
}
function validar(){
  const s=st.prueba.trim();if(!s)return '';
  const n=Number(s.replace(',','.')),ok=/^-?\d+$/.test(s)&&n>=0&&n<=100;
  return ok?`<span class="permit">✅ Aceptado: es un número entero entre 0 y 100.</span>`:`<span class="deny">⛔ Rechazado: ${!/^-?\d+([.,]\d+)?$/.test(s)?'no es un número':!Number.isInteger(n)?'no es entero':'está fuera de 0 a 100'}.</span>`;
}
const sel=(id,etq,ops,val)=>`<label for="${id}">${etq}<select id="${id}">${ops.map(([v,t])=>`<option value="${esc(v)}"${String(v)===String(val)?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
export function vista(){
  if(!st)st=nuevo();
  const cats=[...new Set(st.t.filas.map(f=>f[1]))].sort();
  return `<div class="card"><h2 style="margin-top:0">↕️ Ordenar y filtrar</h2><div class="xl-controles">
${sel('or-col','Ordenar por',[['','(sin ordenar)'],...COLS.map((c,i)=>[i,c])],st.orden)}
${sel('or-sen','Sentido',[['asc','A→Z / menor a mayor'],['desc','Z→A / mayor a menor']],st.sentido)}
${sel('or-cat','Filtro: Categoría',[['todas','(Todas)'],...cats.map(c=>[c,c])],st.cat)}</div>
<div class="xl-funciones"><button class="btn ghost" id="or-fc" aria-pressed="${st.fc}">${st.fc?'✅':'⬜'} 🎨 Formato condicional: Existencia &lt; Mínimo</button>
<button class="btn ghost" id="or-barras" aria-pressed="${st.barras}">${st.barras?'✅':'⬜'} 📊 Barras de datos en Existencia</button></div>
<div id="or-tabla">${tabla()}</div></div>
<div class="card"><h2 style="margin-top:0">✅ Validación de datos</h2><p>Regla para la columna Mínimo: <b>número entero entre 0 y 100</b>. Escribe un valor para probarla:</p>
<div class="xl-controles"><label for="or-val">Valor<input id="or-val" value="${esc(st.prueba)}" autocomplete="off" inputmode="text"></label></div><p id="or-res" aria-live="polite">${validar()}</p></div>
<button class="btn ghost ancho" id="or-nuevo">🔄 Datos nuevos</button>`;
}
export function alMostrar(){
  const upd=()=>{st.orden=$('#or-col').value;st.sentido=$('#or-sen').value;st.cat=$('#or-cat').value;$('#or-tabla').innerHTML=tabla()};
  ['or-col','or-sen','or-cat'].forEach(id=>$('#'+id).addEventListener('change',upd));
  $('#or-val').addEventListener('input',e=>{st.prueba=e.target.value;$('#or-res').innerHTML=validar()});
}
export function alClic(t){
  if(t.id==='or-fc'||t.id==='or-barras'){const k=t.id==='or-fc'?'fc':'barras';st[k]=!st[k];t.setAttribute('aria-pressed',st[k]);t.textContent=t.textContent.replace(/^(✅|⬜)/,st[k]?'✅':'⬜');$('#or-tabla').innerHTML=tabla();return true}
  if(t.id==='or-nuevo'){st=nuevo();document.dispatchEvent(new Event('repintar'));return true}}
