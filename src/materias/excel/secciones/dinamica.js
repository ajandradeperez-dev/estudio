/* Simulador de tabla dinámica: datos de ventas (Región, Producto, Mes, Ventas) y la tabla resumen según lo que se elija en
   Filas, Columnas, Valores (Suma / Cuenta / Promedio) y el filtro de Mes. */
import {$,esc} from '../../../utilidades.js';
import {crearRng} from '../../../nucleo/rng.js';
import {htmlHoja} from '../../../nucleo/excel/hoja.js';
import {aCeldas} from '../../../nucleo/generadores/excel-base.js';

const CAMPOS=['Región','Producto','Mes'],CALC={suma:'Suma',cuenta:'Cuenta',promedio:'Promedio'};
let st=null;
function datos(){const r=crearRng(),reg=['Norte','Sur','Centro'],pro=['Laptop','Monitor','Mouse'],mes=['Ene','Feb','Mar'];
  return Array.from({length:11},()=>[r.elegir(reg),r.elegir(pro),r.elegir(mes),r.entero(5,60)*100])}
const fmt=v=>v===null?'':Number.isInteger(v)?v.toLocaleString('en-US'):v.toLocaleString('en-US',{maximumFractionDigits:2});
function calcular(lista,calc){if(!lista.length)return null;const s=lista.reduce((a,b)=>a+b,0);return calc==='suma'?s:calc==='cuenta'?lista.length:s/lista.length}
function pivote(){
  const fi=CAMPOS.indexOf(st.filas),ci=st.columnas?CAMPOS.indexOf(st.columnas):-1;
  const filas=st.datos.filter(f=>st.mes==='todos'||f[2]===st.mes);
  const vf=[...new Set(filas.map(f=>f[fi]))].sort(),vc=ci>=0?[...new Set(filas.map(f=>f[ci]))].sort():[];
  const de=(a,b)=>filas.filter(f=>(a===null||f[fi]===a)&&(b===null||f[ci]===b)).map(f=>f[3]);
  const cab=ci>=0?[...vc,'Total general']:[`${CALC[st.calc]} de Ventas`];
  const fila=a=>ci>=0?[...vc.map(b=>calcular(de(a,b),st.calc)),calcular(de(a,null),st.calc)]:[calcular(de(a,null),st.calc)];
  if(!vf.length)return '<p class="nota">No hay datos con ese filtro.</p>';
  return `<div class="xl-marco"><table class="xl-hoja xl-pivote"><thead><tr><th>${esc(st.filas)}${ci>=0?` \\ ${esc(st.columnas)}`:''}</th>${cab.map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead>
<tbody>${vf.map(a=>`<tr><th scope="row">${esc(a)}</th>${fila(a).map(v=>`<td>${fmt(v)}</td>`).join('')}</tr>`).join('')}
<tr class="xl-total"><th scope="row">Total general</th>${fila(null).map(v=>`<td>${fmt(v)}</td>`).join('')}</tr></tbody></table></div>
<p class="nota">${vf.length} fila${vf.length===1?'':'s'}${ci>=0?` × ${vc.length} columna${vc.length===1?'':'s'}`:''} · equivale a ${st.calc==='suma'?'SUMAR.SI':st.calc==='cuenta'?'CONTAR.SI':'PROMEDIO.SI'}${ci>=0?'.CONJUNTO':''} por cada celda.</p>`;
}
const sel=(id,etq,ops,val)=>`<label for="${id}">${etq}<select id="${id}">${ops.map(([v,t])=>`<option value="${esc(v)}"${v===val?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
export function vista(){
  if(!st)st={datos:datos(),filas:'Región',columnas:'',calc:'suma',mes:'todos'};
  return `<div class="card"><div class="xl-controles">
${sel('td-filas','Filas',CAMPOS.map(c=>[c,c]),st.filas)}
${sel('td-cols','Columnas',[['','(ninguna)'],...CAMPOS.filter(c=>c!==st.filas).map(c=>[c,c])],st.columnas)}
${sel('td-calc','Valores',Object.entries(CALC).map(([k,t])=>[k,`${t} de Ventas`]),st.calc)}
${sel('td-mes','Filtro: Mes',[['todos','(Todos)'],['Ene','Ene'],['Feb','Feb'],['Mar','Mar']],st.mes)}
</div><div id="td-res">${pivote()}</div></div>
<details class="como-se-usa"><summary>Datos de origen (${st.datos.length} ventas)</summary>${htmlHoja({celdas:aCeldas({cab:['Región','Producto','Mes','Ventas'],filas:st.datos}),filas:12,cols:4})}</details>
<button class="btn ghost ancho" id="td-nuevos">🔄 Datos nuevos</button>`;
}
export function alMostrar(){
  const upd=()=>{st.filas=$('#td-filas').value;st.columnas=$('#td-cols').value===st.filas?'':$('#td-cols').value;st.calc=$('#td-calc').value;st.mes=$('#td-mes').value;document.dispatchEvent(new Event('repintar'))};
  ['td-filas','td-cols','td-calc','td-mes'].forEach(id=>$('#'+id).addEventListener('change',upd));
}
export function alClic(t){if(t.id==='td-nuevos'){st.datos=datos();document.dispatchEvent(new Event('repintar'));return true}}
