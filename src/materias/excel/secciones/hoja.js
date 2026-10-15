/* Hoja libre: datos de ejemplo + barra de fórmulas. Tocar una celda la selecciona; con una fórmula abierta (empieza con =),
   tocar celdas escribe sus referencias. Lo que escribas se guarda solo en este dispositivo ('ciberlab-excel'). */
import {$,esc} from '../../../utilidades.js';
import {crearHoja,valorCelda,mostrar,esError,FUNCIONES,nombreIngles} from '../../../nucleo/excel/formulas.js';
import {htmlHoja,activarHoja,insertarRef,olvidarRef} from '../../../nucleo/excel/hoja.js';
import {tablaVentas,tablaCalif,tablaInventario,tablaNomina,aCeldas} from '../../../nucleo/generadores/excel-base.js';
import {crearRng} from '../../../nucleo/rng.js';

const CLAVE='ciberlab-excel';
const DATOS={ventas:['🛒 Ventas',tablaVentas],calif:['🎓 Calificaciones',tablaCalif],inventario:['📦 Inventario',tablaInventario],nomina:['💼 Nómina',tablaNomina],vacia:['⬜ Vacía',null]};
const EXPLICA={'#¡DIV/0!':'Dividiste entre cero (o entre una celda vacía).','#N/A':'La búsqueda no encontró el valor.','#¿NOMBRE?':'Excel no reconoce un nombre: revisa la función o pon el texto entre comillas.','#¡REF!':'La referencia no es válida o la fórmula se usa a sí misma.','#¡VALOR!':'Hay un tipo de dato que no sirve para esa cuenta (por ejemplo, texto).','#¡ERROR!':'La fórmula está incompleta: revisa paréntesis, comillas y separadores.','#¡NUM!':'El número resultante no es válido.'};
const ATAJO=['SUMA','PROMEDIO','CONTAR','MAX','MIN','REDONDEAR','SI','Y','O','SI.ERROR','CONTAR.SI','SUMAR.SI','BUSCARV','BUSCARX','INDICE','COINCIDIR','CONCATENAR','IZQUIERDA','DERECHA','EXTRAE','LARGO','MAYUSC','HOY','FECHA','DIAS'];

let st=null;
function cargar(){try{const x=JSON.parse(localStorage.getItem(CLAVE));if(x&&typeof x.celdas==='object')return x}catch(e){}return null}
function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify({datos:st.datos,celdas:st.celdas}))}catch(e){}}
function nuevos(datos){const g=DATOS[datos]?.[1];return g?aCeldas(g(crearRng(),8)):{}}
const hoja=()=>({celdas:st.celdas,filas:12,cols:8});

function pintarHoja(){
  const h=crearHoja(st.celdas),v=valorCelda(h,st.activa),txt=mostrar(v),raw=st.celdas[st.activa];
  $('#xh-marco').innerHTML=htmlHoja(hoja(),{activa:st.activa,minFilas:10});
  $('#xh-ref').textContent=st.activa;
  const info=esError(v)?`<span class="deny">${esc(txt)}: ${EXPLICA[txt]||''}</span>`:raw!==undefined&&String(raw).startsWith('=')?`Resultado: <b>${esc(txt)}</b>`:'';
  $('#xh-info').innerHTML=info;
  activarHoja($('#xh-marco .xl-marco'),{alTocar:tocar,alRango:r=>{const [a,b]=r.split(':');insertarRef($('#xh-f'),a,$('#xh-marco .xl-marco'));insertarRef($('#xh-f'),b,$('#xh-marco .xl-marco'))}});
}
function tocar(r){
  const inp=$('#xh-f');
  if(inp.value.trim().startsWith('=')&&st.editando){insertarRef(inp,r,$('#xh-marco .xl-marco'));return}
  st.activa=r;st.editando=false;olvidarRef();
  const raw=st.celdas[r];inp.value=raw===undefined?'':String(raw);pintarHoja();
}
function aceptar(){
  const inp=$('#xh-f'),s=inp.value.trim();
  if(s==='')delete st.celdas[st.activa];
  else st.celdas[st.activa]=s.startsWith('=')?s:/^-?\d+([.,]\d+)?$/.test(s)?+s.replace(',','.'):/^(verdadero|falso)$/i.test(s)?/^v/i.test(s):s;
  st.editando=false;olvidarRef();guardar();
  // baja una fila, como Enter en Excel
  const m=/^([A-Z]+)(\d+)$/.exec(st.activa);if(m&&+m[2]<12)st.activa=m[1]+(+m[2]+1);
  inp.value=st.celdas[st.activa]===undefined?'':String(st.celdas[st.activa]);pintarHoja();
}

export function vista(){
  if(!st){const g=cargar();st=g?{...g,activa:'G2',editando:false}:{datos:'ventas',celdas:nuevos('ventas'),activa:'F2',editando:false}}
  return `<div class="row xl-funciones" role="group" aria-label="Datos de ejemplo">${Object.entries(DATOS).map(([k,[t]])=>`<button class="btn ghost${st.datos===k?' activo':''}" data-xdatos="${k}" aria-pressed="${st.datos===k}">${t}</button>`).join('')}</div>
<div class="xl-barra"><span class="xl-ref" id="xh-ref">${st.activa}</span><span aria-hidden="true">fx</span>
<input id="xh-f" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Barra de fórmulas" placeholder="Escribe un dato o =fórmula">
<button class="btn" id="xh-ok" aria-label="Aceptar">✓</button><button class="btn ghost" id="xh-x" aria-label="Cancelar">✕</button></div>
<p class="nota" id="xh-info" aria-live="polite"></p>
<div id="xh-marco"></div>
<details class="como-se-usa"><summary>Funciones disponibles (toca para insertarla)</summary><div class="xl-funciones">${ATAJO.map(f=>`<button class="tecla" data-xfn="${f}" title="${nombreIngles(f)||''}">${f}</button>`).join('')}</div>
<p class="nota">También: ${FUNCIONES.filter(f=>!ATAJO.includes(f)).join(', ')}. Los nombres en inglés (SUM, VLOOKUP…) también funcionan. Separador: «;» o «,».</p></details>`;
}
export function alMostrar(){
  const inp=$('#xh-f');inp.value=st.celdas[st.activa]===undefined?'':String(st.celdas[st.activa]);pintarHoja();
  inp.addEventListener('input',()=>{st.editando=true});
  inp.addEventListener('focus',()=>{st.editando=true});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();aceptar()}if(e.key==='Escape'){tocar(st.activa)}});
}
export function alClic(t){
  if(t.dataset.xdatos){st.datos=t.dataset.xdatos;st.celdas=nuevos(st.datos);st.activa='G2';guardar();document.dispatchEvent(new Event('repintar'));return true}
  if(t.id==='xh-ok'){aceptar();return true}
  if(t.id==='xh-x'){st.editando=false;tocar(st.activa);return true}
  if(t.dataset.xfn){const inp=$('#xh-f');let v=inp.value,pos=inp.selectionStart??v.length;if(!v.trim()){v='=';pos=1}const k=t.dataset.xfn+'(';inp.value=v.slice(0,pos)+k+v.slice(pos);st.editando=true;olvidarRef();inp.focus();try{inp.setSelectionRange(pos+k.length,pos+k.length)}catch(e){}return true}
}
