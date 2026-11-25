/* Pinta un dibujo (modelo.js) en un canvas 2D con una vista {x, y, z}: pantalla = (lienzo − (x, y)) × z.
   - Cada trazo guarda su Path2D (caché por objeto, que es inmutable): al hacer zoom no se recalcula nada y la tinta sale
     nítida a cualquier tamaño. Solo se pinta lo que cae en la vista (caja de cada objeto).
   - Grosor variable (lápiz con presión o pluma fuente): el contorno se calcula una vez y se rellena.
   - Modo oscuro: la tinta oscura se ve clara (sin cambiar el color guardado) y el fondo usa líneas tenues.
   - Orden: fondo e imágenes → resaltador (detrás) → tinta, textos y fórmulas → papeles del modo práctica. */
import {caja,cruzan,capaDe,anchoEn,PAGINA,CUADRO,CM,origenCartesiano,unidadCartesiano,pasoCartesiano} from './modelo.js';
import {aLienzo,kx,ky,ejes,marcas,textoMarca,numero,tramosFuncion,rectaEnRango,ecuacionRecta,ecuacionCirculo,nombrePunto} from './plano.js';

const caminos=new WeakMap();
function contorno(o){
  const p=o.pts,n=p.length,L=[],R=[];
  for(let i=0;i<n;i++){
    const a=p[Math.max(0,i-1)],b=p[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const w=anchoEn(o,p[i][2])/2;L.push([p[i][0]-dy*w,p[i][1]+dx*w]);R.push([p[i][0]+dy*w,p[i][1]-dx*w]);
  }
  const c=new Path2D(),pasar=(arr,ini)=>{if(ini)c.moveTo(arr[0][0],arr[0][1]);for(let i=1;i<arr.length-1;i++)c.quadraticCurveTo(arr[i][0],arr[i][1],(arr[i][0]+arr[i+1][0])/2,(arr[i][1]+arr[i+1][1])/2);c.lineTo(arr[arr.length-1][0],arr[arr.length-1][1])};
  pasar(L,true);const rr=R.slice().reverse();c.lineTo(rr[0][0],rr[0][1]);pasar(rr,false);c.closePath();
  // puntas redondas
  for(const i of [0,n-1]){const w=anchoEn(o,p[i][2])/2;c.moveTo(p[i][0]+w,p[i][1]);c.arc(p[i][0],p[i][1],w,0,Math.PI*2)}
  return c;
}
function linea(o){
  const p=o.pts,c=new Path2D();c.moveTo(p[0][0],p[0][1]);
  if(o.recto)for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);
  else{for(let i=1;i<p.length-1;i++)c.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);if(p.length>1)c.lineTo(p[p.length-1][0],p[p.length-1][1])}
  return c;
}
export function caminoDe(o){
  let c=caminos.get(o);if(c)return c;
  c=o.pts.length===1?null:o.vari&&o.herr!=='resaltador'&&!o.recto?{relleno:contorno(o)}:{linea:linea(o)};
  caminos.set(o,c);return c;
}
// Textura del lápiz: un patrón de grano con el color (se cachea por color)
const granos=new Map();
function grano(ctx,col){
  let pat=granos.get(col);if(pat)return pat;
  const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d'),img=x.createImageData(24,24);
  const [r,g,b]=rgb(col);let s=7;
  for(let i=0;i<img.data.length;i+=4){s=(s*16807)%2147483647;img.data[i]=r;img.data[i+1]=g;img.data[i+2]=b;img.data[i+3]=110+(s%146)}
  x.putImageData(img,0,0);pat=ctx.createPattern(c,'repeat');granos.set(col,pat);return pat;
}
export function rgb(c){
  let h=String(c||'#000').replace('#','');if(h.length<6)h=h.split('').map(x=>x+x).join('');
  return [parseInt(h.slice(0,2),16)||0,parseInt(h.slice(2,4),16)||0,parseInt(h.slice(4,6),16)||0];
}
const luz=c=>{const [r,g,b]=rgb(c).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
// En modo oscuro la tinta muy oscura se ve clara (el color guardado no cambia)
export const colorVisible=(c,oscuro)=>oscuro&&luz(c)<.06?'#e8ebf2':oscuro&&luz(c)<.14?'#c7cdda':c;

export function pintarTrazo(x,o,{oscuro=false,z=1}={}){
  const col=colorVisible(o.color,oscuro),c=caminoDe(o);
  x.lineCap='round';x.lineJoin='round';
  if(o.herr==='resaltador'){x.globalAlpha=oscuro?.42:.36;x.strokeStyle=col;x.lineWidth=o.ancho;x.lineCap=o.recto?'butt':'round';
    if(c)x.stroke(c.linea);else{x.fillStyle=col;x.fillRect(o.pts[0][0]-o.ancho/2,o.pts[0][1]-o.ancho/2,o.ancho,o.ancho)}x.globalAlpha=1;return}
  if(!c){const w=anchoEn(o,o.pts[0][2])/2;x.fillStyle=col;x.beginPath();x.arc(o.pts[0][0],o.pts[0][1],w,0,Math.PI*2);x.fill();return}
  if(c.relleno){x.fillStyle=col;x.fill(c.relleno,'nonzero');return}
  if(o.tipo==='lapiz'){const p=grano(x,col);p.setTransform?.(new DOMMatrix().scale(1/Math.max(.25,z)));x.strokeStyle=p;x.globalAlpha=.92}else x.strokeStyle=col;
  x.lineWidth=o.ancho;x.stroke(c.linea);x.globalAlpha=1;
}
function pintarTexto(x,o,oscuro){
  x.save();const c=caja(o),w=o.w??c[2]-c[0],h=o.h??c[3]-c[1];
  if(o.rot){x.translate(o.x+w/2,o.y+h/2);x.rotate(o.rot);x.translate(-(o.x+w/2),-(o.y+h/2))}
  x.fillStyle=colorVisible(o.color||'#1f2430',oscuro);x.font=`${o.tam}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;x.textBaseline='top';
  String(o.texto).split('\n').forEach((l,i)=>x.fillText(l,o.x+2,o.y+i*o.tam*1.3+o.tam*.1));
  x.restore();
}
function pintarCaja(x,o,dibujar){
  x.save();if(o.rot){x.translate(o.x+o.w/2,o.y+o.h/2);x.rotate(o.rot);x.translate(-(o.x+o.w/2),-(o.y+o.h/2))}dibujar();x.restore();
}
/* Pinta los objetos. op: {vista:{x,y,z}, ancho, alto (px CSS de la vista), k (px del canvas por px CSS), oscuro, capas,
   practica, revelados (Set de ids), imagen(id) → ImageBitmap|null, formula(o) → {img}|null, excluir (Set de ids)} */
export function pintarObjetos(x,objs,op){
  const {vista:v,ancho,alto,k=1,oscuro=false,capas={tinta:true,resaltado:true,fondo:true},practica=false,revelados,excluir}=op;
  x.setTransform(k*v.z,0,0,k*v.z,-v.x*v.z*k,-v.y*v.z*k);
  const vis=[v.x,v.y,v.x+ancho/v.z,v.y+alto/v.z],ver=o=>!excluir?.has(o.id)&&capas[capaDe(o)]!==false&&cruzan(caja(o),vis);
  for(const capa of ['fondo','resaltado','tinta']){
    for(const o of objs){if(o.t==='papel'||capaDe(o)!==capa||!ver(o))continue;pintarObjeto(x,o,op)}
  }
  for(const o of objs)if(o.t==='papel'&&!excluir?.has(o.id)&&cruzan(caja(o),vis))pintarPapel(x,o,{practica,revelado:revelados?.has(o.id),oscuro,z:v.z});
}
export function pintarObjeto(x,o,{vista,oscuro=false,imagen,formula}={}){
  const z=vista?.z||1;
  if(o.t==='trazo')return pintarTrazo(x,o,{oscuro,z});
  if(o.t==='texto')return pintarTexto(x,o,oscuro);
  if(o.t==='plano')return pintarPlano(x,o,{oscuro});
  if(o.t==='imagen'){const b=imagen?.(o.archivo);pintarCaja(x,o,()=>{if(b)x.drawImage(b,o.x,o.y,o.w,o.h);else{x.fillStyle=oscuro?'#2a2f3a':'#eef0f4';x.fillRect(o.x,o.y,o.w,o.h)}});return}
  if(o.t==='formula'){const f=formula?.(o,oscuro);pintarCaja(x,o,()=>{
    if(f?.img)x.drawImage(f.img,o.x,o.y,o.w,o.h);
    else{x.fillStyle=colorVisible(o.color||'#1f2430',oscuro);x.font=`italic ${o.tam||22}px "Times New Roman",serif`;x.textBaseline='top';x.fillText(o.tex,o.x,o.y)}});}
}
/* ---------- 📈 plano cartesiano editable (plano.js): cuadrícula, ejes, números y sus objetos matemáticos ---------- */
const tramosCache=new WeakMap();
function tramosDe(p,o){let m=tramosCache.get(p);if(!m){m=new Map();tramosCache.set(p,m)}const k=o.id+'|'+o.expr+'|'+(o.a??'')+'|'+(o.b??'');if(!m.has(k))m.set(k,o.k==='region'?tramosFuncion(p,o.expr,{desde:Math.max(p.xMin,Math.min(o.a,o.b)),hasta:Math.min(p.xMax,Math.max(o.a,o.b))}):tramosFuncion(p,o.expr));return m.get(k)}
function flechaP(x,a,b,t){const an=Math.atan2(b[1]-a[1],b[0]-a[0]);x.beginPath();x.moveTo(b[0],b[1]);x.lineTo(b[0]-t*Math.cos(an-.45),b[1]-t*Math.sin(an-.45));x.moveTo(b[0],b[1]);x.lineTo(b[0]-t*Math.cos(an+.45),b[1]-t*Math.sin(an+.45));x.stroke()}
function etiquetaP(x,t,X,Y,{col,oscuro,tam=12,al='left',base='bottom'}={}){
  x.font=`600 ${tam}px system-ui,-apple-system,"Segoe UI",sans-serif`;x.textAlign=al;x.textBaseline=base;
  x.lineWidth=3;x.strokeStyle=oscuro?'rgba(20,24,32,.85)':'rgba(255,255,255,.9)';x.lineJoin='round';x.strokeText(t,X,Y);x.fillStyle=col;x.fillText(t,X,Y);
}
export function pintarPlano(x,p,{oscuro=false}={}){
  const tinta=colorVisible(p.color||'#1f2430',oscuro),fina=oscuro?'rgba(180,190,210,.22)':'rgba(70,82,110,.18)',muyFina=oscuro?'rgba(180,190,210,.1)':'rgba(70,82,110,.08)';
  const {yEjeX,xEjeY}=ejes(p),[ex0,eY]=aLienzo(p,[p.xMin,yEjeX]),[eX,ey0]=aLienzo(p,[xEjeY,p.yMax]),K=Math.min(kx(p),ky(p));
  x.save();x.beginPath();x.rect(p.x-1,p.y-1,p.w+2,p.h+2);x.clip();x.lineCap='round';
  // cuadrícula
  if(p.rejilla!=='no'){
    if(p.rejilla==='secundaria'){x.strokeStyle=muyFina;x.lineWidth=.6;x.beginPath();
      for(const m of marcas(p.xMin,p.xMax,p.pasoX/5)){const [X]=aLienzo(p,[m.v,0]);x.moveTo(X,p.y);x.lineTo(X,p.y+p.h)}
      for(const m of marcas(p.yMin,p.yMax,p.pasoY/5)){const [,Y]=aLienzo(p,[0,m.v]);x.moveTo(p.x,Y);x.lineTo(p.x+p.w,Y)}x.stroke()}
    x.strokeStyle=fina;x.lineWidth=.9;x.beginPath();
    for(const m of marcas(p.xMin,p.xMax,p.pasoX)){const [X]=aLienzo(p,[m.v,0]);x.moveTo(X,p.y);x.lineTo(X,p.y+p.h)}
    for(const m of marcas(p.yMin,p.yMax,p.pasoY)){const [,Y]=aLienzo(p,[0,m.v]);x.moveTo(p.x,Y);x.lineTo(p.x+p.w,Y)}x.stroke();
  }
  // objetos que van debajo de los ejes: regiones y desigualdades
  for(const o of p.objetos){const col=o.color||'#2563eb';
    if(o.k==='region'){for(const t of tramosDe(p,o)){const [,Y0]=aLienzo(p,[0,0]);x.beginPath();x.moveTo(t[0][0],Y0);t.forEach(q=>x.lineTo(q[0],q[1]));x.lineTo(t.at(-1)[0],Y0);x.closePath();x.globalAlpha=.25;x.fillStyle=col;x.fill();x.globalAlpha=1}}
    if(o.k==='desigualdad'){const arriba=o.op[0]==='>';x.save();x.globalAlpha=.16;x.fillStyle=col;
      for(const t of tramosDe(p,o)){x.beginPath();x.moveTo(t[0][0],arriba?p.y:p.y+p.h);t.forEach(q=>x.lineTo(q[0],q[1]));x.lineTo(t.at(-1)[0],arriba?p.y:p.y+p.h);x.closePath();x.fill()}x.restore()}
  }
  // ejes, marcas y números
  x.strokeStyle=tinta;x.fillStyle=tinta;x.lineWidth=p.ancho||1.6;x.beginPath();x.moveTo(p.x,eY);x.lineTo(p.x+p.w,eY);x.moveTo(eX,p.y);x.lineTo(eX,p.y+p.h);x.stroke();
  if(p.flechas){flechaP(x,[p.x,eY],[p.x+p.w-1,eY],9);flechaP(x,[eX,p.y+p.h],[eX,p.y+1],9)}
  const tam=Math.max(9,Math.min(13,K*.42,p.w/28));x.font=`${tam}px system-ui,-apple-system,"Segoe UI",sans-serif`;x.lineWidth=Math.max(1,(p.ancho||1.6)*.7);
  const cada=Math.max(1,p.numCada|0);
  x.textAlign='center';x.textBaseline='top';x.beginPath();
  for(const m of marcas(p.xMin,p.xMax,p.pasoX)){const [X]=aLienzo(p,[m.v,0]);if(Math.abs(m.v-xEjeY)<1e-9||X>p.x+p.w-14)continue;x.moveTo(X,eY-4);x.lineTo(X,eY+4);if(m.i%cada===0)x.fillText(textoMarca(m.v,p.pasoX),X,eY+6)}
  x.textAlign='right';x.textBaseline='middle';
  for(const m of marcas(p.yMin,p.yMax,p.pasoY)){const [,Y]=aLienzo(p,[0,m.v]);if(Math.abs(m.v-yEjeX)<1e-9||Y<p.y+14)continue;x.moveTo(eX-4,Y);x.lineTo(eX+4,Y);if(m.i%cada===0)x.fillText(textoMarca(m.v,p.pasoY),eX-6,Y)}
  x.stroke();
  if(p.origen&&xEjeY===0&&yEjeX===0){x.textAlign='right';x.textBaseline='top';x.fillText('0',eX-4,eY+4)}
  x.font=`italic 600 ${tam+3}px "Times New Roman",serif`;x.textAlign='right';x.textBaseline='bottom';x.fillText(p.ejeX||'x',p.x+p.w-4,eY-6);
  x.textAlign='left';x.textBaseline='top';x.fillText(p.ejeY||'y',eX+8,p.y+2);
  // objetos matemáticos
  for(const o of p.objetos){const col=colorVisible(o.color||'#2563eb',oscuro),lw=Math.max(1.8,(p.ancho||1.6)*1.3);x.strokeStyle=col;x.fillStyle=col;x.lineWidth=lw;x.setLineDash([]);
    if(o.k==='funcion'||o.k==='desigualdad'||o.k==='region'){
      if(o.k==='desigualdad'&&o.op.length===1)x.setLineDash([7,5]);
      const ts=tramosDe(p,o);for(const t of ts){x.beginPath();t.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke()}x.setLineDash([]);
      if(p.ecuaciones&&o.k!=='region'){const ult=ts.flatMap(t=>t).filter(q=>q[1]>p.y+16&&q[1]<p.y+p.h-6).at(-1);
        if(ult)etiquetaP(x,o.k==='funcion'?`y = ${o.expr.replace(/^\s*y\s*=\s*/,'')}`:`y ${o.op.replace('>=','≥').replace('<=','≤')} ${o.expr}`,Math.min(ult[0],p.x+p.w-6),ult[1]-6,{col,oscuro,al:'right'})}
    }
    if(o.k==='recta'){const q=rectaEnRango(p,o.a,o.b);if(q){const [A,B]=q.map(z=>aLienzo(p,z));x.beginPath();x.moveTo(...A);x.lineTo(...B);x.stroke();
      if(p.ecuaciones){const m=aLienzo(p,[(o.a[0]+o.b[0])/2,(o.a[1]+o.b[1])/2]);etiquetaP(x,ecuacionRecta(o.a,o.b),m[0]+8,m[1]-8,{col,oscuro})}}}
    if(o.k==='segmento'||o.k==='vector'||o.k==='medida'){const A=aLienzo(p,o.a),B=aLienzo(p,o.b);
      if(o.k==='medida'){x.save();x.strokeStyle=oscuro?'#94a3b8':'#6b7280';x.lineWidth=1.2;x.setLineDash([4,4]);const E=aLienzo(p,[o.b[0],o.a[1]]);x.beginPath();x.moveTo(...A);x.lineTo(...E);x.lineTo(...B);x.stroke();x.restore()}
      x.beginPath();x.moveTo(...A);x.lineTo(...B);x.stroke();if(o.k==='vector')flechaP(x,A,B,11);
      if(o.k==='medida'){const dx=o.b[0]-o.a[0],dy=o.b[1]-o.a[1],ls=[`Δx = ${numero(dx)}  Δy = ${numero(dy)}`,`m = ${Math.abs(dx)<1e-9?'—':numero(dy/dx)}`,`d = ${numero(Math.hypot(dx,dy))}`,ecuacionRecta(o.a,o.b)];
        ls.forEach((t,i)=>etiquetaP(x,t,Math.max(A[0],B[0])+10,Math.min(A[1],B[1])+i*16+12,{col,oscuro}))}
      for(const P of o.k==='vector'?[A]:[A,B]){x.beginPath();x.arc(P[0],P[1],3.2,0,Math.PI*2);x.fill()}}
    if(o.k==='circulo'){const [cx,cy]=aLienzo(p,o.c);x.beginPath();x.ellipse(cx,cy,o.r*kx(p),o.r*ky(p),0,0,Math.PI*2);x.stroke();x.beginPath();x.arc(cx,cy,2.6,0,Math.PI*2);x.fill();
      if(p.ecuaciones)etiquetaP(x,ecuacionCirculo(o.c,o.r),cx+o.r*kx(p)*.72+4,cy-o.r*ky(p)*.72-2,{col,oscuro})}
    if(o.k==='tabla'){const ps=o.pts.map(q=>aLienzo(p,q));if(o.unir&&ps.length>1){x.beginPath();ps.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q));x.stroke()}
      for(const q of ps){x.beginPath();x.arc(q[0],q[1],4,0,Math.PI*2);x.fill()}}
  }
  // puntos encima de todo, con su etiqueta A(2, 3)
  for(const o of p.objetos)if(o.k==='punto'){const col=colorVisible(o.color||'#dc2626',oscuro),[X,Y]=aLienzo(p,[o.x,o.y]);
    x.fillStyle=col;x.beginPath();x.arc(X,Y,5,0,Math.PI*2);x.fill();x.lineWidth=1.5;x.strokeStyle=oscuro?'#141820':'#fff';x.stroke();
    const t=nombrePunto(o,p);x.font='600 12px system-ui,-apple-system,"Segoe UI",sans-serif';const izq=X+8+x.measureText(t).width>p.x+p.w-2;
    etiquetaP(x,t,izq?X-8:X+8,Y-6<p.y+14?Y+18:Y-6,{col,oscuro,al:izq?'right':'left'})}
  x.restore();
}
function pintarPapel(x,o,{practica,revelado,oscuro,z}){
  x.save();
  if(practica&&!revelado){x.fillStyle=oscuro?'#3a4152':'#dfe3ea';x.fillRect(o.x,o.y,o.w,o.h);x.fillStyle=oscuro?'#c7cdda':'#4b5563';
    x.font=`${14/z}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('Toca para ver',o.x+o.w/2,o.y+o.h/2)}
  else{x.setLineDash([6/z,4/z]);x.strokeStyle=oscuro?'#8b93a7':'#94a3b8';x.lineWidth=1.5/z;x.strokeRect(o.x,o.y,o.w,o.h);x.fillStyle=oscuro?'rgba(139,147,167,.1)':'rgba(148,163,184,.1)';x.fillRect(o.x,o.y,o.w,o.h)}
  x.restore();
}

/* ---------- fondos (en coordenadas del lienzo: se escalan con el zoom) ---------- */
export function pintarFondo(x,d,op){
  const {vista:v,ancho,alto,k=1,oscuro=false,papel,mesa,transparente=false}=op,z=v.z;
  x.setTransform(1,0,0,1,0,0);
  if(transparente)x.clearRect(0,0,x.canvas.width,x.canvas.height);
  else{x.fillStyle=d.modo==='paginas'?mesa:papel;x.fillRect(0,0,x.canvas.width,x.canvas.height)}
  x.setTransform(k*z,0,0,k*z,-v.x*z*k,-v.y*z*k);
  const vis=[v.x,v.y,v.x+ancho/z,v.y+alto/z];
  const zonas=d.modo==='paginas'?paginasVisibles(vis):[vis];
  for(const r of zonas){
    if(d.modo==='paginas'&&!transparente){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(r[0]+2/z,r[1]+3/z,r[2]-r[0],r[3]-r[1]);x.fillStyle=papel;x.fillRect(r[0],r[1],r[2]-r[0],r[3]-r[1])}
    x.save();x.beginPath();x.rect(r[0],r[1],r[2]-r[0],r[3]-r[1]);x.clip();patron(x,d,r,vis,z,oscuro);x.restore();
  }
}
function paginasVisibles(vis){
  const H=PAGINA.h+PAGINA.hueco,r=[];
  for(let i=Math.max(0,Math.floor(vis[1]/H));i*H<vis[3];i++)r.push([0,i*H,PAGINA.w,i*H+PAGINA.h]);
  return r;
}
function patron(x,d,zona,vis,z,oscuro){
  const tipo=d.fondo;if(tipo==='liso')return;
  const a=[Math.max(zona[0],vis[0]),Math.max(zona[1],vis[1]),Math.min(zona[2],vis[2]),Math.min(zona[3],vis[3])];if(a[0]>=a[2]||a[1]>=a[3])return;
  const fina=oscuro?'rgba(160,170,190,.16)':'rgba(70,110,170,.16)',fuerte=oscuro?'rgba(160,170,190,.32)':'rgba(70,110,170,.3)';
  const lineas=(paso,dir,color,cada=1,ancho=1)=>{
    let p=paso;while(p*z<6)p*=2;   // con poco zoom, menos líneas
    x.strokeStyle=color;x.lineWidth=ancho/z;x.beginPath();
    const o=dir==='h'?zona[1]:zona[0],ini=dir==='h'?a[1]:a[0],fin=dir==='h'?a[3]:a[2];
    for(let i=Math.ceil((ini-o)/p);o+i*p<=fin;i++){if(i%cada)continue;const c=o+i*p;if(dir==='h'){x.moveTo(a[0],c);x.lineTo(a[2],c)}else{x.moveTo(c,a[1]);x.lineTo(c,a[3])}}
    x.stroke();
  };
  if(tipo==='cuadricula'){lineas(CUADRO,'h',fina);lineas(CUADRO,'v',fina)}
  if(tipo==='renglones'){lineas(32,'h',fuerte);x.strokeStyle=oscuro?'rgba(240,120,120,.3)':'rgba(220,60,60,.3)';x.lineWidth=1.2/z;x.beginPath();x.moveTo(zona[0]+64,a[1]);x.lineTo(zona[0]+64,a[3]);x.stroke()}
  if(tipo==='puntos'){let p=CUADRO;while(p*z<8)p*=2;x.fillStyle=fuerte;const r=Math.max(1.1/z,.9);
    for(let i=Math.ceil((a[0]-zona[0])/p);zona[0]+i*p<=a[2];i++)for(let j=Math.ceil((a[1]-zona[1])/p);zona[1]+j*p<=a[3];j++){x.fillRect(zona[0]+i*p-r,zona[1]+j*p-r,2*r,2*r)}}
  if(tipo==='pentagrama'){x.strokeStyle=fuerte;x.lineWidth=1/z;x.beginPath();
    for(let g=Math.floor((a[1]-zona[1])/96);zona[1]+g*96<=a[3];g++)for(let l=0;l<5;l++){const y=zona[1]+g*96+40+l*9;x.moveTo(a[0],y);x.lineTo(a[2],y)}x.stroke()}
  if(tipo==='cartesiano'){
    // con el origen, la unidad y el paso propios del dibujo (se ajustan en «Fondo → Ajustar el plano de fondo»)
    const [ox,oy]=origenCartesiano(d),U=unidadCartesiano(d),paso=pasoCartesiano(d);let c=U/2;while(c*z<6)c*=2;
    x.strokeStyle=fina;x.lineWidth=1/z;x.beginPath();
    for(let i=Math.ceil((a[0]-ox)/c);ox+i*c<=a[2];i++){x.moveTo(ox+i*c,a[1]);x.lineTo(ox+i*c,a[3])}
    for(let j=Math.ceil((a[1]-oy)/c);oy+j*c<=a[3];j++){x.moveTo(a[0],oy+j*c);x.lineTo(a[2],oy+j*c)}x.stroke();
    x.strokeStyle=oscuro?'rgba(200,210,230,.6)':'rgba(40,50,70,.55)';x.lineWidth=1.6/z;x.beginPath();x.moveTo(a[0],oy);x.lineTo(a[2],oy);x.moveTo(ox,a[1]);x.lineTo(ox,a[3]);x.stroke();
    const L=U*paso;
    if(L*z>=18){x.fillStyle=oscuro?'rgba(200,210,230,.75)':'rgba(40,50,70,.7)';x.font=`${11/z}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='top';
      for(let i=Math.ceil((a[0]-ox)/L);ox+i*L<=a[2];i++)if(i)x.fillText(numero(i*paso),ox+i*L,oy+3/z);
      x.textAlign='right';x.textBaseline='middle';for(let j=Math.ceil((a[1]-oy)/L);oy+j*L<=a[3];j++)if(j)x.fillText(numero(-j*paso),ox-4/z,oy+j*L)}
  }

}
