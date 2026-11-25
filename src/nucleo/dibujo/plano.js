/* 📈 Plano cartesiano editable del dibujo (PROMPT-PLANOS-MATRICES, parte 1). Sin DOM: lo usan el editor, el pintor y las pruebas.
   Un plano es un objeto del dibujo {t:'plano', id, pid, x, y, w, h, xMin, xMax, yMin, yMax, pasoX, pasoY, numCada,
   rejilla:'no'|'principal'|'secundaria', igual, ejeX, ejeY, flechas, origen, estilo:'centrado'|'cuadrante'|'borde',
   color, ancho, fijo, moverVista, ecuaciones, objetos:[…]}.
   - `id` cambia con cada versión (los objetos del dibujo son inmutables y el historial compara ids); `pid` es fijo y es
     al que se anclan los trazos y textos que se dibujan dentro (`ancla:pid`): al mover, escalar o cambiar el rango del
     plano se transforman con `matrizPlano` (conservan sus coordenadas del plano).
   - `objetos`: objetos matemáticos exactos en coordenadas del plano: punto {x,y,nombre}, funcion {expr}, recta / segmento
     / vector {a,b}, circulo {c,r}, tabla {pts,unir}, region {expr,a,b} (área bajo la curva), desigualdad {expr,op} y
     medida {a,b} (la de ✌️ Medir). Las funciones se evalúan con `compilar` de los generadores (nunca eval).
   - Los planos que se insertaban antes desde 📐 (un grupo de trazos y textos con forma:'plano') se convierten a este
     objeto con el mismo tamaño, centro y escala (`migrarPlanosViejos`). */
import {compilar} from '../generadores/verificar.js';

const r2=v=>Math.round(v*100)/100;
let cuenta=0;
const idP=p=>`${p}${Date.now().toString(36)}${(cuenta++).toString(36)}${Math.random().toString(36).slice(2,5)}`;
export const COLORES_PLANO=['#2563eb','#dc2626','#15803d','#7c3aed','#ea580c','#0891b2','#db2777'];
export const PLANO0={xMin:-10,xMax:10,yMin:-10,yMax:10,pasoX:1,pasoY:1,numCada:2,rejilla:'principal',igual:true,ejeX:'x',ejeY:'y',
  flechas:true,origen:true,estilo:'centrado',color:'#1f2430',ancho:1.6,fijo:false,moverVista:false,ecuaciones:true,objetos:[]};
export const PRESETS=[['10','−10 a 10',{xMin:-10,xMax:10,yMin:-10,yMax:10,pasoX:1,pasoY:1,numCada:2,estilo:'centrado'}],
  ['5','−5 a 5',{xMin:-5,xMax:5,yMin:-5,yMax:5,pasoX:1,pasoY:1,numCada:1,estilo:'centrado'}],
  ['q1','0 a 10 (1er cuadrante)',{xMin:0,xMax:10,yMin:0,yMax:10,pasoX:1,pasoY:1,numCada:1,estilo:'cuadrante'}],
  ['trig','Trigonometría (−2π a 2π)',{xMin:-2*Math.PI,xMax:2*Math.PI,yMin:-2,yMax:2,pasoX:Math.PI/2,pasoY:1,numCada:1,estilo:'centrado',igual:false}]];
const num=v=>typeof v==='number'&&Number.isFinite(v);

/* ---------- crear, igualar escalas y validar ---------- */
export function nuevoPlano(x,y,w,h,extra={}){
  return igualar({t:'plano',id:idP('o'),pid:idP('p'),x:r2(x),y:r2(y),w:r2(Math.max(40,w)),h:r2(Math.max(40,h)),...PLANO0,objetos:[],...extra});
}
// Misma escala en x y en y: el rango de y se ajusta (alrededor de su centro) a la forma del plano
export function igualar(p){
  if(!p.igual)return p;
  const k=p.w/(p.xMax-p.xMin),alto=p.h/k;
  if(p.estilo==='cuadrante'&&p.yMin>=0)return {...p,yMin:p.yMin,yMax:p.yMin+alto};
  const c=(p.yMin+p.yMax)/2;return {...p,yMin:c-alto/2,yMax:c+alto/2};
}
const OBJ={punto:o=>num(o.x)&&num(o.y),funcion:o=>typeof o.expr==='string',recta:o=>par(o.a)&&par(o.b),segmento:o=>par(o.a)&&par(o.b),vector:o=>par(o.a)&&par(o.b),
  circulo:o=>par(o.c)&&num(o.r)&&o.r>0,tabla:o=>Array.isArray(o.pts)&&o.pts.every(par),region:o=>typeof o.expr==='string'&&num(o.a)&&num(o.b),
  desigualdad:o=>typeof o.expr==='string'&&['>','>=','<','<='].includes(o.op),medida:o=>par(o.a)&&par(o.b),
  pendiente:o=>typeof o.pa==='string'&&typeof o.pb==='string'};   // recta por dos puntos del plano (sus id) con m, d y la ecuación en vivo
const par=v=>Array.isArray(v)&&num(v[0])&&num(v[1]);
export function planoValido(o){
  return ['x','y','w','h','xMin','xMax','yMin','yMax','pasoX','pasoY'].every(k=>num(o[k]))&&o.w>0&&o.h>0&&o.xMax>o.xMin&&o.yMax>o.yMin&&o.pasoX>0&&o.pasoY>0&&typeof o.pid==='string';
}
export const limpiarPlano=o=>({...PLANO0,...o,objetos:(Array.isArray(o.objetos)?o.objetos:[]).filter(x=>x&&typeof x.id==='string'&&OBJ[x.k]?.(x))});

/* ---------- coordenadas: lienzo ↔ plano ---------- */
export const kx=p=>p.w/(p.xMax-p.xMin),ky=p=>p.h/(p.yMax-p.yMin);
export const aLienzo=(p,[u,v])=>[p.x+(u-p.xMin)*kx(p),p.y+(p.yMax-v)*ky(p)];
export const aPlanoDe=(p,[X,Y])=>[p.xMin+(X-p.x)/kx(p),p.yMax-(Y-p.y)/ky(p)];
export const dentroPlano=(p,X,Y,m=0)=>X>=p.x-m&&X<=p.x+p.w+m&&Y>=p.y-m&&Y<=p.y+p.h+m;
export function planoEn(objs,X,Y,m=0){for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.t==='plano'&&dentroPlano(o,X,Y,m))return o}return null}
// Matriz [a,b,c,d,e,f] que lleva lo de un plano a la misma posición del plano en su nueva versión (mover, tamaño o rango)
export function matrizPlano(v,n){
  const a=kx(n)/kx(v),d=ky(n)/ky(v);
  return [a,0,0,d,n.x+(v.xMin-n.xMin)*kx(n)-v.x*a,n.y+(n.yMax-v.yMax)*ky(n)-v.y*d];
}
// ¿cuál es el centro de un objeto anclable? (para anclarlo al plano donde cae)
export const anclable=o=>o.t==='trazo'||o.t==='texto'||o.t==='formula';

/* ---------- marcas de los ejes ---------- */
export function marcas(min,max,paso){
  const r=[],i0=Math.ceil(min/paso-1e-9),i1=Math.floor(max/paso+1e-9);
  if(i1-i0>400)return r;for(let i=i0;i<=i1;i++)r.push({i,v:i*paso});return r;
}
// «π/2», «3π/2», «2π», «0.5», «−3»
export function textoMarca(v,paso){
  const q=paso/Math.PI;
  if(Math.abs(q*12-Math.round(q*12))<1e-6&&Math.abs(q)>1e-9){
    const n=Math.round(v/Math.PI*12);if(!n)return '0';const mcd=(a,b)=>b?mcd(b,a%b):a,g=mcd(Math.abs(n),12),nu=n/g,de=12/g;
    return `${nu<0?'−':''}${Math.abs(nu)===1?'':Math.abs(nu)}π${de===1?'':'/'+de}`;
  }
  return numero(v);
}
export const numero=v=>{const r=Math.round(v*1000)/1000;return String(Object.is(r,-0)?0:r).replace('-','−')};
// Dónde quedan los ejes: en 0 si cabe (centrado) o al borde (estadística o fuera de rango)
export function ejes(p){
  const enX=p.estilo!=='borde'&&p.yMin<=0&&p.yMax>=0?0:p.yMin,enY=p.estilo!=='borde'&&p.xMin<=0&&p.xMax>=0?0:p.xMin;
  return {yEjeX:enX,xEjeY:enY};
}
// Posición de los números de los extremos (para tocarlos dos veces y escribir el límite)
export function limitesEn(p){
  const {yEjeX,xEjeY}=ejes(p),[,Y]=aLienzo(p,[0,yEjeX]),[X]=aLienzo(p,[xEjeY,0]);
  return [{campo:'xMin',x:p.x+10,y:Y+14},{campo:'xMax',x:p.x+p.w-12,y:Y+14},{campo:'yMax',x:X-16,y:p.y+10},{campo:'yMin',x:X-16,y:p.y+p.h-10}];
}

/* ---------- funciones: evaluar seguro y graficar sin unir las asíntotas ---------- */
const cacheF=new Map();
export function funcionDe(expr){
  const t=String(expr||'').replace(/^\s*(y|f\s*\(\s*x\s*\))\s*=\s*/i,'').trim();
  if(cacheF.has(t))return cacheF.get(t);
  let f=null;try{const g=compilar(t);g({x:1.2345});f=x=>{try{const y=g({x});return Number.isFinite(y)?y:NaN}catch(e){return NaN}}}catch(e){f=null}
  if(cacheF.size>200)cacheF.clear();cacheF.set(t,f);return f;
}
export const expresionValida=expr=>!!funcionDe(expr);
/* Tramos de la curva en coordenadas del lienzo: [[ [X,Y]… ], …]. Muestreo cada medio px; se corta donde no está definida,
   donde se sale mucho del rango o donde salta (asíntota: el punto medio no queda entre los dos vecinos). */
export function tramosFuncion(p,expr,{desde=p.xMin,hasta=p.xMax}={}){
  const f=funcionDe(expr);if(!f)return [];
  const n=Math.max(60,Math.min(2400,Math.ceil(p.w*2))),alto=p.yMax-p.yMin,lim=[p.yMin-alto*4,p.yMax+alto*4];
  const tramos=[];let act=[],prev=null;
  for(let i=0;i<=n;i++){
    const u=desde+(hasta-desde)*i/n,v=f(u);
    const ok=Number.isFinite(v)&&v>lim[0]&&v<lim[1];
    if(ok&&prev){const salto=Math.abs(v-prev.v)>alto*.5;
      if(salto){const um=(u+prev.u)/2,vm=f(um);if(!Number.isFinite(vm)||vm<Math.min(v,prev.v)-alto*.01||vm>Math.max(v,prev.v)+alto*.01){if(act.length>1)tramos.push(act);act=[]}}}
    if(ok)act.push(aLienzo(p,[u,v]));else{if(act.length>1)tramos.push(act);act=[]}
    prev=ok?{u,v}:null;
  }
  if(act.length>1)tramos.push(act);
  return tramos;
}
// Recta por dos puntos recortada al rango del plano
export function rectaEnRango(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1];if(!dx&&!dy)return null;
  const ts=[];const add=(t)=>{const u=a[0]+dx*t,v=a[1]+dy*t;if(u>=p.xMin-1e-9&&u<=p.xMax+1e-9&&v>=p.yMin-1e-9&&v<=p.yMax+1e-9)ts.push(t)};
  if(dx){add((p.xMin-a[0])/dx);add((p.xMax-a[0])/dx)}if(dy){add((p.yMin-a[1])/dy);add((p.yMax-a[1])/dy)}
  if(ts.length<2)return null;const t0=Math.min(...ts),t1=Math.max(...ts);
  return [[a[0]+dx*t0,a[1]+dy*t0],[a[0]+dx*t1,a[1]+dy*t1]];
}
// Ecuaciones para las etiquetas
export function ecuacionRecta(a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1];if(Math.abs(dx)<1e-9)return `x = ${numero(a[0])}`;
  const m=dy/dx,c=a[1]-m*a[0];if(Math.abs(m)<1e-9)return `y = ${numero(c)}`;
  return `y = ${Math.abs(m-1)<1e-9?'':Math.abs(m+1)<1e-9?'−':numero(m)}x${Math.abs(c)<1e-9?'':c<0?` − ${numero(-c)}`:` + ${numero(c)}`}`;
}
export const ecuacionCirculo=(c,r)=>`${c[0]?`(x ${c[0]<0?'+':'−'} ${numero(Math.abs(c[0]))})²`:'x²'} + ${c[1]?`(y ${c[1]<0?'+':'−'} ${numero(Math.abs(c[1]))})²`:'y²'} = ${numero(r*r)}`;
export const nombrePunto=(o,p)=>`${o.nombre||''}(${numero(o.x)}, ${numero(o.y)})`;
// El siguiente nombre libre: A, B, C…
export function siguienteNombre(p){const usados=new Set(p.objetos.filter(o=>o.k==='punto').map(o=>o.nombre));for(const l of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')if(!usados.has(l))return l;return 'P'}
export const ajustarAPaso=(p,[u,v])=>[Math.round(u/p.pasoX)*p.pasoX,Math.round(v/p.pasoY)*p.pasoY].map(x=>Math.round(x*1e6)/1e6);

/* ---------- tocar un objeto matemático del plano (para moverlo o editarlo) ---------- */
export function objetoPlanoEn(p,X,Y,r=10){
  const d2=(a)=>{const [x,y]=aLienzo(p,a);return Math.hypot(x-X,y-Y)};
  const seg=(a,b)=>{const A=aLienzo(p,a),B=aLienzo(p,b),dx=B[0]-A[0],dy=B[1]-A[1],l=dx*dx+dy*dy;let t=l?((X-A[0])*dx+(Y-A[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(X-A[0]-t*dx,Y-A[1]-t*dy)};
  for(let i=p.objetos.length-1;i>=0;i--){const o=p.objetos[i];
    if(o.k==='punto'&&d2([o.x,o.y])<=r+4)return o;
    if((o.k==='segmento'||o.k==='vector'||o.k==='medida')&&seg(o.a,o.b)<=r)return o;
    if(o.k==='recta'){const q=rectaEnRango(p,o.a,o.b);if(q&&seg(q[0],q[1])<=r)return o}
    if(o.k==='circulo'){const [cx,cy]=aLienzo(p,o.c);if(Math.abs(Math.hypot((X-cx)/kx(p),(Y-cy)/ky(p))-o.r)*kx(p)<=r)return o}
    if(o.k==='tabla'&&o.pts.some(q=>d2(q)<=r+4))return o;
    if(o.k==='funcion'||o.k==='region'||o.k==='desigualdad'){const f=funcionDe(o.expr),[u]=aPlanoDe(p,[X,Y]),v=f?.(u);if(Number.isFinite(v)&&Math.abs(aLienzo(p,[u,v])[1]-Y)<=r)return o}
  }
  return null;
}
// «Ajustar a lo dibujado»: el rango que abarca los objetos del plano (y lo anclado), con margen
export function rangoDeObjetos(p,anclados=[]){
  const xs=[],ys=[];const add=([u,v])=>{xs.push(u);ys.push(v)};
  for(const o of p.objetos){if(o.k==='punto')add([o.x,o.y]);if(o.a)add(o.a);if(o.b)add(o.b);if(o.k==='circulo'){add([o.c[0]-o.r,o.c[1]-o.r]);add([o.c[0]+o.r,o.c[1]+o.r])}if(o.k==='tabla')o.pts.forEach(add);if(o.k==='region'){add([o.a,0]);add([o.b,0])}}
  for(const o of anclados)for(const q of o.pts||[[o.x,o.y]])add(aPlanoDe(p,q));
  if(!xs.length)return null;
  let x0=Math.min(...xs,0),x1=Math.max(...xs,0),y0=Math.min(...ys,0),y1=Math.max(...ys,0);
  const mx=Math.max(1,(x1-x0)*.12),my=Math.max(1,(y1-y0)*.12);
  return {xMin:Math.floor(x0-mx),xMax:Math.ceil(x1+mx),yMin:Math.floor(y0-my),yMax:Math.ceil(y1+my)};
}

/* ---------- migrar los planos viejos de 📐 (grupo de trazos con forma 'plano') ---------- */
export function planoDesdeCaja(x0,y0,w,h,{color='#1f2430',ancho=1.6}={}){
  // misma escala que el dibujo de antes: n marcas por lado en el lado corto, cada u px
  const n=Math.max(2,Math.min(10,Math.round(Math.min(w,h)/2/28))),u=Math.min(w,h)/2/(n+.6),X=w/2/u,Y=h/2/u;
  return nuevoPlano(x0,y0,w,h,{xMin:-X,xMax:X,yMin:-Y,yMax:Y,pasoX:1,pasoY:1,numCada:1,rejilla:'no',color,ancho:Math.max(1.2,ancho*.7)});
}
export function migrarPlanosViejos(objs){
  const grupos=new Map();for(const o of objs)if(o.g&&o.forma==='plano')grupos.set(o.g,[...(grupos.get(o.g)||[]),o]);
  if(!grupos.size)return {objs,quitados:null};
  const quitados=new Set(),fuera=new Set(),nuevos=new Map();
  for(const [g,os] of grupos){
    const tr=os.filter(o=>o.t==='trazo');if(tr.length<4)continue;
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const o of tr.slice(0,4))for(const q of o.pts){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
    nuevos.set(g,planoDesdeCaja(x0,y0,x1-x0,y1-y0,{color:tr[0].color,ancho:tr[0].ancho}));
    for(const o of objs)if(o.g===g){quitados.add(o.id);fuera.add(o)}
  }
  if(!nuevos.size)return {objs,quitados:null};
  const r=[],puesto=new Set();
  for(const o of objs){if(!quitados.has(o.id)){r.push(o);continue}if(!puesto.has(o.g)){puesto.add(o.g);r.push(nuevos.get(o.g))}}
  return {objs:r,quitados};
}
