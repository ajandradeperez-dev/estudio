/* ▦ Matriz del dibujo (PROMPT-PLANOS-MATRICES, parte 2). Sin DOM: medidas, celdas y pasos; las cuentas, en nucleo/matrices.js.
   Objeto {t:'matriz', id, mid, x, y, w, h, filas, cols, celdas:[[texto]], aumentada (índice de la columna antes de la
   que va la línea, o null), paren:'[]'|'()'|'{}'|'||'|'', alinear:'derecha'|'centro', tam, color, fijo, prefijo (texto corto a la izquierda: '~', 'Aᵀ =', 'A⁻¹ ='…),
   notas:[texto por renglón] (la operación de renglón, en gris, a la derecha), esperado:[[texto]]|null (modo «Lo hago yo»),
   marcas:[[null|'ok'|'mal']]|null, ops:[{tipo,i,j,k}] (las operaciones que llevaron de la anterior a esta), de (mid de la
   anterior) y serie (la cadena de Gauss-Jordan)}.
   - `id` cambia con cada versión; `mid` es fijo y es al que se anclan los trazos escritos a mano en una celda.
   - w y h se recalculan con `medirMatriz` cada vez que cambia el contenido (así la caja, el lazo y el PDF la conocen). */
import {fr} from '../matrices.js';

let cuenta=0;
const idM=p=>`${p}${Date.now().toString(36)}${(cuenta++).toString(36)}${Math.random().toString(36).slice(2,5)}`;
const r2=v=>Math.round(v*100)/100;
export const PARENTESIS=[['[]','[ ]'],['()','( )'],['{}','{ }'],['||','| | det'],['','sin paréntesis']];
const ancho=(t,tam)=>Math.max(1,String(t).length)*tam*.56,anchoN=(n,tam)=>Math.max(1,n)*tam*.56;
// Partes de una celda para pintarla: fracción apilada o texto (con el signo menos de verdad)
export function partesCelda(t){
  const s=String(t??'').trim().replace(/-/g,'−');if(!s)return {vacia:true};
  const m=s.match(/^(−?)(\d+)\/(\d+)$/);if(m)return {frac:true,signo:m[1],num:m[2],den:m[3]};
  return {texto:s};
}
// Medidas: ancho de cada columna, alto de cada renglón, márgenes y dónde va cada celda (en coordenadas del lienzo)
export function medidas(o){
  const T=o.tam||22,colW=Array.from({length:o.cols},(_,j)=>Math.max(T*.8,...o.celdas.map(f=>{const p=partesCelda(f[j]);return p.vacia?T*.8:p.frac?anchoN(Math.max(p.num.length,p.den.length),T*.78)+(p.signo?T*.6:0):ancho(p.texto,T)}))+T*.8);
  const filaH=o.celdas.map(f=>f.some(x=>partesCelda(x).frac)?T*2.25:T*1.55);
  const pre=o.prefijo?ancho(o.prefijo,T)+T*.45:0,bracket=o.paren?T*.55:T*.15,notaW=Math.max(0,...(o.notas||[]).map(n=>n?ancho(n,T*.7)+T*.8:0));
  const x0=o.x+pre+bracket,y0=o.y+T*.25,cuerpoW=colW.reduce((a,b)=>a+b,0),cuerpoH=filaH.reduce((a,b)=>a+b,0);
  const xs=[x0];colW.forEach(w=>xs.push(xs.at(-1)+w));const ys=[y0];filaH.forEach(h=>ys.push(ys.at(-1)+h));
  return {T,colW,filaH,xs,ys,pre,bracket,notaW,cuerpo:[x0,y0,x0+cuerpoW,y0+cuerpoH],w:pre+bracket*2+cuerpoW+notaW,h:cuerpoH+T*.5};
}
export const medirMatriz=o=>{const m=medidas(o);return {...o,w:r2(m.w),h:r2(m.h)}};
export const celdaEn=(o,X,Y)=>{const m=medidas(o);if(X<m.cuerpo[0]||X>m.cuerpo[2]||Y<m.cuerpo[1]||Y>m.cuerpo[3])return null;
  const j=m.xs.findIndex((x,k)=>k<o.cols&&X>=x&&X<m.xs[k+1]),i=m.ys.findIndex((y,k)=>k<o.filas&&Y>=y&&Y<m.ys[k+1]);return i<0||j<0?null:[i,j]};
export const renglonEn=(o,Y)=>{const m=medidas(o);const i=m.ys.findIndex((y,k)=>k<o.filas&&Y>=y&&Y<m.ys[k+1]);return i<0?null:i};
export const cajaCelda=(o,i,j)=>{const m=medidas(o);return [m.xs[j],m.ys[i],m.xs[j+1],m.ys[i+1]]};
export const vacias=(filas,cols)=>Array.from({length:filas},()=>Array(cols).fill(''));
export function nuevaMatriz(x,y,filas,cols,extra={}){
  const celdas=extra.celdas||vacias(filas,cols);
  return medirMatriz({t:'matriz',id:idM('o'),mid:idM('m'),x:r2(x),y:r2(y),filas,cols,celdas,aumentada:null,paren:'[]',alinear:'derecha',tam:22,color:'#1f2430',fijo:false,
    prefijo:'',notas:Array(filas).fill(''),esperado:null,marcas:null,ops:null,de:null,serie:null,...extra,celdas});
}
export const identidadTextos=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?'1':'0'));
export const columnasPivote=o=>o.aumentada??o.cols;
const valida=o=>Number.isInteger(o.filas)&&Number.isInteger(o.cols)&&o.filas>0&&o.cols>0&&o.filas<=12&&o.cols<=12&&Array.isArray(o.celdas)&&o.celdas.length===o.filas&&o.celdas.every(f=>Array.isArray(f)&&f.length===o.cols);
export const matrizValida=o=>valida(o)&&typeof o.mid==='string'&&[o.x,o.y].every(Number.isFinite);
export function limpiarMatriz(o){
  const n=o.filas;return medirMatriz({...o,celdas:o.celdas.map(f=>f.map(x=>String(x??'').slice(0,12))),notas:Array.from({length:n},(_,i)=>String(o.notas?.[i]||'').slice(0,40)),
    aumentada:Number.isInteger(o.aumentada)&&o.aumentada>0&&o.aumentada<o.cols?o.aumentada:null,paren:PARENTESIS.some(p=>p[0]===o.paren)?o.paren:'[]',
    prefijo:String(o.prefijo||'').slice(0,8),esperado:Array.isArray(o.esperado)&&o.esperado.length===n?o.esperado:null,marcas:Array.isArray(o.marcas)&&o.marcas.length===n?o.marcas:null});
}
// Cambiar el tamaño (filas, columnas) conservando lo escrito
export function redimensionar(o,filas,cols){
  filas=Math.max(1,Math.min(12,filas));cols=Math.max(1,Math.min(12,cols));
  const celdas=Array.from({length:filas},(_,i)=>Array.from({length:cols},(_,j)=>o.celdas[i]?.[j]??''));
  return medirMatriz({...o,filas,cols,celdas,notas:Array.from({length:filas},(_,i)=>o.notas?.[i]||''),aumentada:o.aumentada!=null&&o.aumentada<cols?o.aumentada:null,esperado:null,marcas:null});
}
// ¿Cuántas celdas tienen un número? (las operaciones necesitan todas)
export const numerica=o=>o.celdas.every(f=>f.every(x=>fr(x)));
// Revisar «Lo hago yo»: cada celda llena contra la esperada (por valor: «1/2» = «0.5»)
export function revisarCeldas(o){
  if(!o.esperado)return null;let ok=0,mal=0,vacia=0;
  const marcas=o.celdas.map((f,i)=>f.map((x,j)=>{if(!String(x).trim()){vacia++;return null}const a=fr(x),b=fr(o.esperado[i][j]);if(a&&b&&a.n===b.n&&a.d===b.d){ok++;return 'ok'}mal++;return 'mal'}));
  return {marcas,ok,mal,vacia};
}

/* ---------- pintar (solo usa el contexto 2D que le pasan) ---------- */
const FUENTE='"Cambria Math","STIX Two Math","Times New Roman",serif';
// col: color de la tinta ya visible (modo oscuro resuelto); gris: notas y casillas vacías
export function dibujarMatriz(x,o,{col='#1f2430',gris='#64748b',oscuro=false}={}){
  const m=medidas(o),T=m.T,[x0,y0,x1,y1]=m.cuerpo,lw=Math.max(1,T*.07);
  x.save();x.strokeStyle=col;x.fillStyle=col;x.lineCap='round';x.lineJoin='round';x.textBaseline='middle';
  if(o.prefijo){x.font=`${T}px ${FUENTE}`;x.textAlign='left';x.fillText(o.prefijo,o.x,(y0+y1)/2)}
  // marcas de «✓ Revisar»
  if(o.marcas)o.marcas.forEach((f,i)=>f.forEach((v,j)=>{if(!v)return;x.fillStyle=v==='ok'?(oscuro?'rgba(34,197,94,.28)':'rgba(34,197,94,.2)'):(oscuro?'rgba(248,113,113,.3)':'rgba(239,68,68,.18)');
    x.fillRect(m.xs[j]+1,m.ys[i]+1,m.colW[j]-2,m.filaH[i]-2)}));
  x.fillStyle=col;
  // paréntesis del alto exacto de las filas
  const b=m.bracket,izq=x0-b*.75,der=x1+b*.75,p=T*.28;x.lineWidth=lw;
  const lado=(xx,s)=>{x.beginPath();
    if(o.paren==='[]'){x.moveTo(xx+s*p,y0);x.lineTo(xx,y0);x.lineTo(xx,y1);x.lineTo(xx+s*p,y1)}
    else if(o.paren==='()'){x.moveTo(xx+s*p,y0);x.quadraticCurveTo(xx-s*p*.9,(y0+y1)/2,xx+s*p,y1)}
    else if(o.paren==='||'){x.moveTo(xx+s*p*.4,y0);x.lineTo(xx+s*p*.4,y1)}
    else if(o.paren==='{}'){const c=(y0+y1)/2,q=p*.9,a=xx+s*q;
      x.moveTo(a+s*q*.6,y0);x.quadraticCurveTo(a,y0,a,y0+T*.35);x.lineTo(a,c-T*.3);x.quadraticCurveTo(a,c,xx,c);x.quadraticCurveTo(a,c,a,c+T*.3);x.lineTo(a,y1-T*.35);x.quadraticCurveTo(a,y1,a+s*q*.6,y1)}
    x.stroke()};
  if(o.paren){lado(izq,1);lado(der,-1)}
  // línea de la aumentada
  if(o.aumentada!=null){const xa=m.xs[o.aumentada];x.lineWidth=Math.max(1,T*.05);x.beginPath();x.moveTo(xa,y0+T*.1);x.lineTo(xa,y1-T*.1);x.stroke()}
  // celdas
  for(let i=0;i<o.filas;i++)for(let j=0;j<o.cols;j++){
    const c=partesCelda(o.celdas[i][j]),cy=(m.ys[i]+m.ys[i+1])/2,der2=m.xs[j+1]-T*.25,cen=(m.xs[j]+m.xs[j+1])/2,centro=o.alinear==='centro';
    if(c.vacia){x.save();x.strokeStyle=gris;x.globalAlpha=.55;x.lineWidth=1;x.setLineDash([3,3]);x.strokeRect(cen-T*.4,cy-T*.45,T*.8,T*.9);x.restore();continue}
    if(c.frac){const fT=T*.78,wn=anchoN(Math.max(c.num.length,c.den.length),fT),ws=c.signo?T*.6:0,tot=wn+ws,xi=centro?cen-tot/2:der2-tot;
      x.font=`${fT}px ${FUENTE}`;x.textAlign='center';
      if(c.signo){x.font=`${T}px ${FUENTE}`;x.fillText('−',xi+ws/2,cy);x.font=`${fT}px ${FUENTE}`}
      x.fillText(c.num,xi+ws+wn/2,cy-fT*.62);x.fillText(c.den,xi+ws+wn/2,cy+fT*.62);
      x.lineWidth=Math.max(1,T*.05);x.beginPath();x.moveTo(xi+ws,cy);x.lineTo(xi+ws+wn,cy);x.stroke();continue}
    x.font=`${T}px ${FUENTE}`;x.textAlign=centro?'center':'right';x.fillText(c.texto,centro?cen:der2,cy);
  }
  // operación de renglón anotada a la derecha (en gris)
  if(o.notas?.some(Boolean)){x.fillStyle=gris;x.font=`${T*.7}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;x.textAlign='left';
    o.notas.forEach((n,i)=>{if(n)x.fillText(n,x1+b+T*.5,(m.ys[i]+m.ys[i+1])/2)})}
  x.restore();
}
