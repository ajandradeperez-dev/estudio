/* Modelo de los dibujos del cuaderno (sin DOM: lo usan el editor, npm run revisar y npm run dibujo).
   Dibujo v2 (va en el archivo del cuaderno, campo `dibujo`, junto al PNG que se ve en la nota):
     {v:2, ancho, alto?, modo:'crece'|'paginas', fondo, objetos:[…], vista:{x,y,z}|null, bloqueado, capas:{tinta,resaltado,fondo},
      practica?, historial:[op…] (los últimos 100 cambios, para deshacer al volver a abrirlo)}
   Todo está en coordenadas del LIENZO (px CSS al 100 %), no de la pantalla: el zoom y el movimiento no deforman nada.
   Objetos (inmutables: un cambio crea otro objeto con otro id; así un cambio es una diferencia entre dos listas):
   - trazo   {t:'trazo', id, herr:'pluma'|'resaltador', tipo:'boli'|'fuente'|'lapiz', color, ancho, pts:[[x,y,p]], vari?, recto?, forma?, g?, capa?}
             vari = el grosor cambia con p (presión del lápiz o velocidad del dedo); recto = polígono sin suavizar (formas)
   - texto   {t:'texto', id, x, y, w, h, texto, tam, color, rot?, g?}
   - formula {t:'formula', id, x, y, w, h, tex, tam, color, rot?}
   - imagen  {t:'imagen', id, x, y, w, h, archivo, fija?, rot?}
   - papel   {t:'papel', id, x, y, w, h}    modo práctica: tapa una parte del dibujo; se toca para verla
   capa: 'tinta' (por defecto), 'resaltado' (el resaltador, detrás de la tinta) o 'fondo' (imágenes y plantillas).
   Formato anterior (v1): el archivo traía `trazos:[{herr:'lapiz'|'borrar', color, ancho, pen, puntos}]`; migrarDibujo() lo
   convierte (la goma de entonces pintaba con el color del papel: ahora recorta de verdad los trazos que tapaba). */
import {planoValido,limpiarPlano,migrarPlanosViejos,planoDesdeCaja,aPlanoDe,planoEn,nuevoPlano} from './plano.js';
import {matrizValida,limpiarMatriz,nuevaMatriz} from './matriz.js';
export const VERSION_DIBUJO=2;
export const PAGINA={w:816,h:1056,hueco:28};        // carta a 96 px por pulgada
export const CM=37.8,CUADRO=CM/2;                    // 1 cm y la cuadrícula de 5 mm
export const ZOOM_MIN=.25,ZOOM_MAX=8,MAX_HISTORIAL=100;
export const TINTA='#1f2430';
let cuenta=0;
export const nuevoIdObj=()=>`o${Date.now().toString(36)}${(cuenta++).toString(36)}${Math.random().toString(36).slice(2,5)}`;
export const capaDe=o=>o.capa||(o.t==='trazo'&&o.herr==='resaltador'?'resaltado':o.t==='imagen'||o.t==='plano'?'fondo':'tinta');
const num=v=>typeof v==='number'&&Number.isFinite(v);
const r2=v=>Math.round(v*100)/100;

export function nuevoDibujo({ancho=720,modo='crece',fondo='liso'}={}){
  return {v:VERSION_DIBUJO,ancho:Math.round(Math.max(240,Math.min(2400,ancho))),modo,fondo,objetos:[],vista:null,bloqueado:false,capas:{tinta:true,resaltado:true,fondo:true},historial:[]};
}

/* ---------- geometría ---------- */
export const anchoMax=o=>o.herr==='resaltador'?o.ancho:o.vari?o.ancho*1.65:o.ancho;
// grosor de un punto (la misma fórmula del lienzo de antes: ancho × (0.35 + 1.3 × presión))
export const anchoEn=(o,p)=>o.vari?o.ancho*(.35+1.3*(p??.5)):o.ancho;
export function cajaPuntos(pts,m=0){
  let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;
  for(const p of pts){if(p[0]<a)a=p[0];if(p[0]>c)c=p[0];if(p[1]<b)b=p[1];if(p[1]>d)d=p[1]}
  return [a-m,b-m,c+m,d+m];
}
export function medidasTexto(texto,tam){const l=String(texto).split('\n');return {w:Math.max(1,...l.map(x=>x.length))*tam*.56+4,h:l.length*tam*1.3}}
const cajas=new WeakMap();
export function caja(o){
  let c=cajas.get(o);if(c)return c;
  if(o.t==='trazo')c=cajaPuntos(o.pts,anchoMax(o)/2+.5);
  else{const w=o.w??medidasTexto(o.texto||'',o.tam||20).w,h=o.h??medidasTexto(o.texto||'',o.tam||20).h;c=[o.x,o.y,o.x+w,o.y+h];
    if(o.rot){const cx=o.x+w/2,cy=o.y+h/2,co=Math.cos(o.rot),s=Math.sin(o.rot);
      c=cajaPuntos([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[cx+x*co-y*s,cy+x*s+y*co]))}}
  cajas.set(o,c);return c;
}
export const cruzan=(a,b)=>a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];
export function cajaDe(objs){
  let c=null;for(const o of objs){const k=caja(o);c=c?[Math.min(c[0],k[0]),Math.min(c[1],k[1]),Math.max(c[2],k[2]),Math.max(c[3],k[3])]:k.slice()}
  return c;
}
export function distSeg(x,y,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((x-a[0])*dx+(y-a[1])*dy)/l:0;t=t<0?0:t>1?1:t;
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function distCamino(x,y,camino){
  if(camino.length===1)return Math.hypot(x-camino[0][0],y-camino[0][1]);
  let m=Infinity;for(let i=1;i<camino.length;i++){const d=distSeg(x,y,camino[i-1],camino[i]);if(d<m)m=d}return m;
}
export const longitud=pts=>{let s=0;for(let i=1;i<pts.length;i++)s+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return s};
// ¿toca el punto (x, y) al objeto, con un margen r?
export function tocaObjeto(o,x,y,r=0){
  const c=caja(o);if(x<c[0]-r||x>c[2]+r||y<c[1]-r||y>c[3]+r)return false;
  if(o.t!=='trazo')return true;
  const w=anchoMax(o)/2+r,p=o.pts;
  if(p.length===1)return Math.hypot(p[0][0]-x,p[0][1]-y)<=w;
  for(let i=1;i<p.length;i++)if(distSeg(x,y,p[i-1],p[i])<=w)return true;
  return false;
}
// El objeto de más arriba en ese punto (filtro opcional)
export function objetoEn(objs,x,y,r=0,filtro=()=>true){for(let i=objs.length-1;i>=0;i--)if(filtro(objs[i])&&tocaObjeto(objs[i],x,y,r))return objs[i];return null}

/* Ramer-Douglas-Peucker: quita puntos que no cambian la forma (tolerancia en px del lienzo); conserva los cambios de presión */
export function simplificar(pts,tol=.3){
  if(pts.length<3)return pts.map(p=>p.slice());
  const n=pts.length,guardar=new Uint8Array(n);guardar[0]=guardar[n-1]=1;const pila=[[0,n-1]];
  while(pila.length){
    const [a,b]=pila.pop();let m=-1,dm=tol;
    for(let i=a+1;i<b;i++){
      const pr=(pts[a][2]??.5)+((pts[b][2]??.5)-(pts[a][2]??.5))*((i-a)/(b-a));
      const d=Math.max(distSeg(pts[i][0],pts[i][1],pts[a],pts[b]),Math.abs((pts[i][2]??.5)-pr)>.08?tol*2:0);
      if(d>dm){dm=d;m=i}
    }
    if(m>0){guardar[m]=1;pila.push([a,m],[m,b])}
  }
  const r=[];for(let i=0;i<n;i++)if(guardar[i])r.push([r2(pts[i][0]),r2(pts[i][1]),Math.round((pts[i][2]??.5)*100)/100]);return r;
}
// Puntos cada `paso` como máximo (para recortar con la goma de precisión)
export function remuestrear(pts,paso){
  if(pts.length<2)return pts.map(p=>p.slice());
  const r=[pts[0].slice()];
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.ceil(d/paso);
    for(let j=1;j<=k;j++){const t=j/k;r.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,(a[2]??.5)+((b[2]??.5)-(a[2]??.5))*t])}
  }
  return r;
}

/* ---------- borradores ---------- */
// Goma de precisión: quita de un trazo lo que queda a menos de r del camino de la goma. null = no lo tocó; [] = lo borró todo
export function recortarTrazo(o,camino,r){
  if(o.t!=='trazo'||!cruzan(caja(o),cajaPuntos(camino,r)))return null;
  const lim=r+anchoMax(o)*.35;
  if(!o.pts.some((p,i)=>distCamino(p[0],p[1],camino)<=lim||i&&distSegCamino(o.pts[i-1],p,camino)<=lim))return null;
  const pts=remuestrear(o.pts,Math.max(.6,Math.min(r/3,3))),trozos=[];let cur=[];
  for(const p of pts){if(distCamino(p[0],p[1],camino)>lim)cur.push(p);else{if(cur.length)trozos.push(cur);cur=[]}}
  if(cur.length)trozos.push(cur);
  return trozos.filter(t=>t.length>=2||o.pts.length===1).map(t=>({...o,id:nuevoIdObj(),pts:simplificar(t,.25)}));
}
function distSegCamino(a,b,camino){   // distancia aproximada entre un tramo y el camino de la goma (para tramos largos)
  let m=Infinity;for(const c of camino){const d=distSeg(c[0],c[1],a,b);if(d<m)m=d}return m;
}
// Aplica la goma de precisión a una lista; filtro: qué objetos se pueden borrar
export function borrarCon(objs,camino,r,filtro=()=>true){
  let cambio=false;const out=[];
  for(const o of objs){if(!filtro(o)){out.push(o);continue}const t=recortarTrazo(o,camino,r);if(!t){out.push(o);continue}cambio=true;out.push(...t)}
  return cambio?out:objs;
}

/* ---------- lazo ---------- */
export function dentro(x,y,poly){
  let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c;
}
// ids de los objetos rodeados por el lazo (un trazo con el 60 % de sus puntos dentro; lo demás, por su centro)
export function enLazo(objs,poly,filtro=()=>true){
  const ids=new Set();
  for(const o of objs){if(!filtro(o))continue;
    if(o.t==='trazo'){const paso=Math.max(1,Math.floor(o.pts.length/40));let n=0,k=0;for(let i=0;i<o.pts.length;i+=paso){k++;if(dentro(o.pts[i][0],o.pts[i][1],poly))n++}if(n/k>=.6)ids.add(o.id)}
    else{const c=caja(o);if(dentro((c[0]+c[2])/2,(c[1]+c[3])/2,poly))ids.add(o.id)}}
  return conGrupos(objs,ids);
}
// Una forma de matemáticas (plano, tabla…) se selecciona completa: sus piezas comparten g
export function conGrupos(objs,ids){
  const gs=new Set(objs.filter(o=>ids.has(o.id)&&o.g).map(o=>o.g)),ps=new Set(objs.filter(o=>ids.has(o.id)&&(o.t==='plano'||o.t==='matriz')).map(o=>o.t==='plano'?o.pid:o.mid));
  if(!gs.size&&!ps.size)return ids;
  // con un plano va lo que está anclado a él (se mueve y se escala con el plano)
  const r=new Set(ids);for(const o of objs)if(o.g&&gs.has(o.g)||o.ancla&&ps.has(o.ancla))r.add(o.id);return r;
}

/* ---------- transformar (mover, escalar, rotar) ---------- */
// m = [a,b,c,d,e,f]: x' = a·x + c·y + e, y' = b·x + d·y + f
export const mMover=(dx,dy)=>[1,0,0,1,dx,dy];
export const mEscalar=(s,cx,cy)=>[s,0,0,s,cx-s*cx,cy-s*cy];
export const mRotar=(a,cx,cy)=>{const c=Math.cos(a),s=Math.sin(a);return [c,s,-s,c,cx-c*cx+s*cy,cy-s*cx-c*cy]};
export const aplicarM=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
export function transformar(o,m,{mismoId=false}={}){
  const s=Math.sqrt(Math.abs(m[0]*m[3]-m[1]*m[2]))||1,id=mismoId?o.id:nuevoIdObj();
  if(o.t==='trazo')return {...o,id,ancho:r2(o.ancho*s),pts:o.pts.map(p=>{const q=aplicarM(m,p[0],p[1]);return [r2(q[0]),r2(q[1]),p[2]]})};
  const k=caja(o),w0=o.w??k[2]-k[0],h0=o.h??k[3]-k[1],[cx,cy]=aplicarM(m,o.x+w0/2,o.y+h0/2),w=w0*s,h=h0*s;
  const r={...o,id,x:r2(cx-w/2),y:r2(cy-h/2),w:r2(w),h:r2(h)};
  if(o.tam)r.tam=r2(o.tam*s);
  if(o.t!=='papel'&&o.t!=='plano'&&o.t!=='matriz'){const rot=(o.rot||0)+Math.atan2(m[1],m[0]);if(Math.abs(rot)>1e-3)r.rot=Math.round(rot*1e4)/1e4;else delete r.rot}
  return r;
}

/* ---------- historial: un cambio es la diferencia entre la lista de antes y la de después ---------- */
// {q:[[i, objeto quitado]], p:[[i, objeto puesto]]} (índices de antes y de después, en orden)
export function diferencia(antes,despues){
  const a=new Set(antes.map(o=>o.id)),d=new Set(despues.map(o=>o.id)),q=[],p=[];
  antes.forEach((o,i)=>{if(!d.has(o.id))q.push([i,o])});despues.forEach((o,i)=>{if(!a.has(o.id))p.push([i,o])});
  return q.length||p.length?{q,p}:null;
}
export function aplicarOp(objs,op,alReves=false){
  const quitar=alReves?op.p:op.q,poner=alReves?op.q:op.p,r=objs.slice();
  for(let k=quitar.length-1;k>=0;k--){const [i,o]=quitar[k];if(r[i]?.id===o.id)r.splice(i,1);else{const j=r.findIndex(x=>x.id===o.id);if(j>=0)r.splice(j,1)}}
  for(const [i,o] of poner)r.splice(Math.min(i,r.length),0,o);
  return r;
}

/* ---------- formas inteligentes: un trazo a mano → la forma limpia ---------- */
const pr=pts=>pts.reduce((s,p)=>s+(p[2]??.5),0)/pts.length;
const angulo=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
export function puntaFlecha(a,b,tam){
  const an=angulo(a,b),t=tam,ab=.45;
  return [[b[0]-t*Math.cos(an-ab),b[1]-t*Math.sin(an-ab)],[b[0]-t*Math.cos(an+ab),b[1]-t*Math.sin(an+ab)]];
}
const tamPunta=(a,b,ancho)=>Math.min(22,Math.max(9,Math.hypot(b[0]-a[0],b[1]-a[1])*.22))+ancho;
const flecha=(a,b,ancho=3)=>{const [h1,h2]=puntaFlecha(a,b,tamPunta(a,b,ancho));return [a,b,h1,b,h2]};
const dobleFlecha=(a,b,ancho=3)=>{const t=tamPunta(a,b,ancho),[p1,p2]=puntaFlecha(b,a,t),[q1,q2]=puntaFlecha(a,b,t);return [p1,a,p2,a,b,q1,b,q2]};
export function elipse(cx,cy,rx,ry,n=64){const r=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;r.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)])}return r}
export function reconocerForma(pts){
  if(pts.length<4)return null;
  const c=cajaPuntos(pts),w=c[2]-c[0],h=c[3]-c[1],diag=Math.hypot(w,h);if(diag<14)return null;
  const p=pr(pts),con=xs=>xs.map(q=>[r2(q[0]),r2(q[1]),p]),ini=pts[0],fin=pts[pts.length-1],largo=longitud(pts);
  const cierre=Math.hypot(fin[0]-ini[0],fin[1]-ini[1]);
  if(cierre>Math.max(diag*.3,14)){   // abierta: recta o flecha
    if(largo/cierre<1.1)return {forma:'linea',pts:con([ini,fin])};
    const v=simplificar(pts,diag*.07);
    // flecha de un solo trazo: la línea larga y, al final, la punta (una o dos "alas" cortas que regresan)
    if(v.length>=3&&v.length<=6){
      const ab=Math.hypot(v[1][0]-v[0][0],v[1][1]-v[0][1]);
      if(ab>diag*.6&&v.slice(2).every(q=>Math.hypot(q[0]-v[1][0],q[1]-v[1][1])<ab*.45)&&largo-ab<ab*1.3)
        return {forma:'flecha',pts:con(flecha(v[0],v[1]))};
    }
    return null;
  }
  // cerrada: elipse o círculo si los puntos quedan a la misma "distancia" del centro
  const cx=(c[0]+c[2])/2,cy=(c[1]+c[3])/2,rx=Math.max(1,w/2),ry=Math.max(1,h/2);
  const err=pts.reduce((s,q)=>s+Math.abs(Math.hypot((q[0]-cx)/rx,(q[1]-cy)/ry)-1),0)/pts.length;
  if(err<.09){
    if(Math.abs(w-h)<Math.max(w,h)*.18){const r=(w+h)/4;return {forma:'circulo',pts:con(elipse(cx,cy,r,r))}}
    return {forma:'elipse',pts:con(elipse(cx,cy,rx,ry))};
  }
  let v=simplificar([...pts,ini],diag*.08).map(q=>[q[0],q[1]]);
  if(v.length>2&&Math.hypot(v[0][0]-v[v.length-1][0],v[0][1]-v[v.length-1][1])<diag*.2)v=v.slice(0,-1);
  // vértices muy juntos (el trazo empieza a mitad de un lado) se unen
  v=v.filter((q,i)=>{const s=v[(i+1)%v.length];return Math.hypot(q[0]-s[0],q[1]-s[1])>diag*.12});
  if(v.length===3)return {forma:'triangulo',pts:con([...v,v[0]])};
  if(v.length===4){
    const ang=v.map((q,i)=>{const a=v[(i+3)%4],b=v[(i+1)%4],u=[a[0]-q[0],a[1]-q[1]],s=[b[0]-q[0],b[1]-q[1]];return Math.abs(Math.acos(Math.max(-1,Math.min(1,(u[0]*s[0]+u[1]*s[1])/(Math.hypot(...u)*Math.hypot(...s)||1))))*180/Math.PI-90)});
    if(ang.every(a=>a<22)){
      const lados=v.map((q,i)=>Math.abs(angulo(q,v[(i+1)%4])*180/Math.PI)%90),recto=lados.every(a=>a<12||a>78);
      if(recto)return {forma:'rectangulo',pts:con([[c[0],c[1]],[c[2],c[1]],[c[2],c[3]],[c[0],c[3]],[c[0],c[1]]])};
    }
    return {forma:'poligono',pts:con([...v,v[0]])};
  }
  if(v.length>=5&&v.length<=8)return {forma:'poligono',pts:con([...v,v[0]])};
  if(err<.16)return {forma:'elipse',pts:con(elipse(cx,cy,rx,ry))};
  return null;
}

/* ---------- 📐 formas directas (matemáticas): de la esquina a a la b, arrastrando ---------- */
export const FORMAS=[['linea','／','Línea'],['flecha','→','Flecha'],['flecha2','↔','Doble flecha'],['vector','↗','Vector'],['rectangulo','▭','Rectángulo'],
  ['circulo','◯','Círculo o elipse'],['triangulo','△','Triángulo'],['plano','⊹','Plano cartesiano'],['recta','⟷','Recta numérica'],['llaves','{ }','Llaves'],
  ['corchetes','[ ]','Corchetes de matriz'],['tabla','⊞','Tabla'],['unitario','◴','Círculo unitario']];
export function formaDirecta(tipo,a,b,{color=TINTA,ancho=2.5,filas=3,cols=3}={}){
  const g=nuevoIdObj(),x0=Math.min(a[0],b[0]),y0=Math.min(a[1],b[1]),x1=Math.max(a[0],b[0]),y1=Math.max(a[1],b[1]),w=x1-x0,h=y1-y0;
  const T=(pts,extra={})=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color,ancho,recto:true,forma:tipo,g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5]),...extra});
  const X=(x,y,texto,tam=13,extra={})=>{const m=medidasTexto(texto,tam);return {t:'texto',id:nuevoIdObj(),x:r2(x-m.w/2),y:r2(y),w:r2(m.w),h:r2(m.h),texto,tam,color,g,...extra}};
  const cx=(x0+x1)/2,cy=(y0+y1)/2;
  switch(tipo){
    case 'linea':return [T([a,b])];
    case 'flecha':case 'vector':return [T(flecha(a,b,ancho))];
    case 'flecha2':return [T(dobleFlecha(a,b,ancho))];
    case 'rectangulo':return [T([[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]])];
    case 'circulo':return [T(elipse(cx,cy,w/2,h/2))];
    case 'triangulo':return [T([[cx,y0],[x1,y1],[x0,y1],[cx,y0]])];
    case 'llaves':case 'corchetes':{
      const k=Math.min(18,Math.max(8,w*.12));
      if(tipo==='corchetes')return [T([[x0+k,y0],[x0,y0],[x0,y1],[x0+k,y1]]),T([[x1-k,y0],[x1,y0],[x1,y1],[x1-k,y1]])];
      // "{": las puntas miran al contenido y el pico del centro hacia afuera; "}" es su reflejo
      const e=t=>t<.12?k*(1-Math.sin(t/.12*Math.PI/2)):0,c=t=>Math.abs(t-.5)<.1?-k*Math.cos((t-.5)/.1*Math.PI/2):0;
      const llave=(x,dir)=>{const r=[];for(let i=0;i<=40;i++){const t=i/40;r.push([x+dir*(e(t)+e(1-t)+c(t)),y0+t*h])}return r};
      return [T(llave(x0+k,1)),T(llave(x1-k,-1))];
    }
    case 'tabla':{
      const f=Math.max(1,Math.min(20,filas|0)),c=Math.max(1,Math.min(12,cols|0)),r=[T([[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]])];
      for(let i=1;i<f;i++){const y=y0+h*i/f;r.push(T([[x0,y],[x1,y]]))}
      for(let j=1;j<c;j++){const x=x0+w*j/c;r.push(T([[x,y0],[x,y1]]))}
      return r;
    }
    case 'recta':{
      const n=Math.max(2,Math.min(10,Math.round(w/50))),u=w/(2*n+1.2),yy=a[1],r=[T(dobleFlecha([x0,yy],[x1,yy],ancho))];
      for(let i=-n;i<=n;i++){const x=cx+i*u;r.push(T([[x,yy-6],[x,yy+6]],{ancho:Math.max(1.2,ancho*.6)}));r.push(X(x,yy+9,String(i),12))}
      return r;
    }
    case 'plano':return [{...planoDesdeCaja(x0,y0,w,h,{color,ancho}),g}];
    case 'planoViejo':{
      const n=Math.max(2,Math.min(10,Math.round(Math.min(w,h)/2/28))),u=Math.min(w,h)/2/(n+.6),r=[T(flecha([cx,cy],[x1,cy],ancho)),T(flecha([cx,cy],[x0,cy],ancho).slice(0,2)),T(flecha([cx,cy],[cx,y0],ancho)),T(flecha([cx,cy],[cx,y1],ancho).slice(0,2))];
      for(let i=-n;i<=n;i++){if(!i)continue;const x=cx+i*u,y=cy+i*u,fino=Math.max(1.2,ancho*.6);
        r.push(T([[x,cy-5],[x,cy+5]],{ancho:fino}),T([[cx-5,y],[cx+5,y]],{ancho:fino}));
        r.push(X(x,cy+8,String(i),11),X(cx-14,y-7,String(-i),11))}
      r.push(X(x1-6,cy-24,'x',15,{tam:15}),X(cx+14,y0-2,'y',15,{tam:15}));
      return r;
    }
    case 'unitario':{
      const R=Math.max(30,Math.min(w,h)/2*.78),r=[T(elipse(cx,cy,R,R)),T([[cx-R*1.18,cy],[cx+R*1.18,cy]]),T([[cx,cy-R*1.18],[cx,cy+R*1.18]])];
      const marcas=[[0,'0'],[30,'π/6'],[45,'π/4'],[60,'π/3'],[90,'π/2'],[120,''],[135,''],[150,''],[180,'π'],[210,''],[225,''],[240,''],[270,'3π/2'],[300,''],[315,''],[330,'']];
      for(const [d,et] of marcas){const an=-d*Math.PI/180,x=cx+R*Math.cos(an),y=cy+R*Math.sin(an);
        r.push(T(elipse(x,y,2.4,2.4,10),{ancho:2.4}));
        if(et)r.push(X(cx+(R+20)*Math.cos(an),cy+(R+20)*Math.sin(an)-8,et,12))}
      r.push(X(cx+R+8,cy+4,'1',11),X(cx-R-10,cy+4,'−1',11));
      return r;
    }
  }
  return [T([a,b])];
}

/* ---------- íconos de red (SVG propio en trazos) para la plantilla de Ciberseguridad ---------- */
/* ---------- ✌️ Dos dedos (PROMPT-DOS-DEDOS): regla, compás, medir, marco y barrido. Todo sale como objetos normales
   (trazos y textos) con un grupo `g`: se deshace en un paso, el lazo lo toma entero y se ve nítido con zoom. ---------- */
export const MODOS_DOS=[['regla','📏','Regla'],['compas','🧭','Compás'],['medir','📐','Medir'],['marco','▭','Marco'],['barrido','🌀','Barrido']];
export const conRejilla=d=>['cuadricula','cartesiano','puntos'].includes(d?.fondo);
// Al cruce más cercano de la cuadrícula de 5 mm (la misma del plano cartesiano), contado desde el origen del plano
export function ajustarRejilla(p,d){const [ox,oy]=origenCartesiano(d),c=d?.cartesiano?unidadCartesiano(d)/2:CUADRO;return [ox+Math.round((p[0]-ox)/c)*c,oy+Math.round((p[1]-oy)/c)*c]}
// Del lienzo al plano cartesiano (1 unidad = 1 cm, y hacia arriba) y de vuelta
// (si el punto cae en un 📈 plano editable, sus coordenadas son las de ese plano)
export const aPlano=(p,d)=>{const pl=d?.objetos&&planoEn(d.objetos,p[0],p[1]);if(pl)return aPlanoDe(pl,p);const [ox,oy]=origenCartesiano(d),u=unidadCartesiano(d);return [(p[0]-ox)/u,(oy-p[1])/u]};
export const dePlano=(q,d)=>{const [ox,oy]=origenCartesiano(d),u=unidadCartesiano(d);return [ox+q[0]*u,oy-q[1]*u]};
const n2=v=>{const r=Math.round(v*100)/100;return Object.is(r,-0)?0:r};
export const numero=v=>String(n2(v)).replace('-','−');
// 📐 Medir: Δx, Δy, pendiente, distancia, punto medio y la ecuación de la recta entre dos puntos del plano
export function medirDos(a,b,d){
  const pl=d?.objetos&&planoEn(d.objetos,a[0],a[1]),cv=q=>pl?aPlanoDe(pl,q):aPlano(q,{...d,objetos:null});
  const [x1,y1]=cv(a),[x2,y2]=cv(b),dx=x2-x1,dy=y2-y1,vertical=Math.abs(dx)<1e-9;
  const m=vertical?null:dy/dx,c=vertical?null:y1-m*x1;
  const ecuacion=vertical?`x = ${numero(x1)}`:Math.abs(m)<1e-9?`y = ${numero(y1)}`
    :`y = ${Math.abs(m-1)<1e-9?'':Math.abs(m+1)<1e-9?'−':numero(m)}x${Math.abs(c)<1e-9?'':c<0?` − ${numero(-c)}`:` + ${numero(c)}`}`;
  return {p1:[n2(x1),n2(y1)],p2:[n2(x2),n2(y2)],dx:n2(dx),dy:n2(dy),m:m===null?null:n2(m),dist:n2(Math.hypot(dx,dy)),medio:[n2((x1+x2)/2),n2((y1+y2)/2)],ecuacion};
}
export const lineasMedida=r=>[`(${numero(r.p1[0])}, ${numero(r.p1[1])}) → (${numero(r.p2[0])}, ${numero(r.p2[1])})`,`Δx = ${numero(r.dx)}   Δy = ${numero(r.dy)}`,
  `m = Δy / Δx = ${r.m===null?'no existe (vertical)':numero(r.m)}`,`d = √(Δx² + Δy²) = ${numero(r.dist)}`,`Punto medio: (${numero(r.medio[0])}, ${numero(r.medio[1])})`,r.ecuacion];
const punto=(x,y,rad,color,g)=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color,ancho:rad,recto:true,forma:'circulo',g,pts:elipse(x,y,rad/2,rad/2,16).map(p=>[r2(p[0]),r2(p[1]),.5])});
const etiqueta=(x,y,texto,tam,color,g)=>{const m=medidasTexto(texto,tam);return {t:'texto',id:nuevoIdObj(),x:r2(x),y:r2(y),w:r2(m.w),h:r2(m.h),texto,tam,color,g}};
// «Dejar en la hoja»: el segmento, los catetos Δx y Δy, los dos puntos y las etiquetas
export function objetosMedida(a,b,d,{color=TINTA,ancho=2}={}){
  const g=nuevoIdObj(),r=medirDos(a,b,d),gris='#6b7280',esq=[b[0],a[1]];
  const T=(pts,c=color,w=ancho)=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color:c,ancho:w,recto:true,forma:'linea',g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])});
  const out=[T([a,esq],gris,1.2),T([esq,b],gris,1.2),T([a,b]),punto(a[0],a[1],6,color,g),punto(b[0],b[1],6,color,g)];
  if(Math.abs(r.dx)>.2)out.push(etiqueta((a[0]+b[0])/2-14,a[1]+(b[1]<a[1]?6:-24),`Δx = ${numero(r.dx)}`,13,gris,g));
  if(Math.abs(r.dy)>.2)out.push(etiqueta(b[0]+(b[0]>=a[0]?8:-78),(a[1]+b[1])/2-8,`Δy = ${numero(r.dy)}`,13,gris,g));
  const x0=Math.max(a[0],b[0])+(Math.abs(r.dy)>.2&&b[0]>=a[0]?96:18),y0=Math.min(a[1],b[1]);   // a la derecha de «Δy = …»
  lineasMedida(r).slice(2).forEach((t,i)=>out.push(etiqueta(x0,y0+i*20,t,14,color,g)));
  return out;
}
// 🧭 Compás: círculo completo o arco desde el ángulo a0 (en el lienzo) recorriendo da (con signo)
export function arcoCompas(c,rad,a0=0,da=Math.PI*2){
  const n=Math.max(12,Math.ceil(Math.abs(da)/(Math.PI*2)*96)),pts=[];
  for(let i=0;i<=n;i++){const a=a0+da*i/n;pts.push([c[0]+rad*Math.cos(a),c[1]+rad*Math.sin(a)])}
  return pts;
}
// Ángulo en grados y radianes («90° = π/2 rad ≈ 1.57 rad»)
export function textoAngulo(rad){
  const a=Math.abs(rad),gr=Math.round(a*180/Math.PI),k=Math.round(a/(Math.PI/12));
  let pi='';if(k&&Math.abs(a-k*Math.PI/12)<.02){const mcd=(x,y)=>y?mcd(y,x%y):x,m=mcd(k,12),nu=k/m,de=12/m;pi=`${nu===1?'':nu}π${de===1?'':'/'+de} rad ≈ `}
  return `${gr}° = ${pi}${(Math.round(a*100)/100).toFixed(2)} rad`;
}
// ▭ Marco (rectángulo) o resaltado (un trazo de resaltador tan grueso como el rectángulo, detrás de la tinta)
export function marcoDos(a,b,{tipo='marco',color=TINTA,ancho=2,colorRes='#facc15'}={}){
  const x0=Math.min(a[0],b[0]),y0=Math.min(a[1],b[1]),x1=Math.max(a[0],b[0]),y1=Math.max(a[1],b[1]),w=x1-x0,h=y1-y0,g=nuevoIdObj();
  if(tipo!=='resaltado')return [{t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color,ancho,recto:true,forma:'rectangulo',g,pts:[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]].map(p=>[r2(p[0]),r2(p[1]),.5])}];
  const gr=Math.max(2,Math.min(w,h)),pts=w>=h?[[x0+gr/2,(y0+y1)/2],[Math.max(x0+gr/2,x1-gr/2),(y0+y1)/2]]:[[(x0+x1)/2,y0+gr/2],[(x0+x1)/2,Math.max(y0+gr/2,y1-gr/2)]];
  return [{t:'trazo',id:nuevoIdObj(),herr:'resaltador',tipo:'boli',color:colorRes,ancho:r2(gr),recto:true,forma:'resaltado',g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])}];
}
// 🌀 Barrido: color a lo largo (degradado) y espejo
export function colorEntre(c1,c2,t){
  const h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),a=h(c1),b=h(c2);
  return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,'0')).join('');
}
export function objetosBarrido(segs,{color=TINTA,color2=null,ancho=1,simetria='no',eje=null}={}){
  const g=nuevoIdObj(),n=segs.length,out=[];
  const T=(pts,c)=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color:c,ancho,recto:true,forma:'barrido',g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])});
  segs.forEach((s,i)=>{const c=color2?colorEntre(color,color2,n>1?i/(n-1):0):color;out.push(T(s,c));
    if(simetria==='h'&&eje)out.push(T(s.map(p=>[2*eje[0]-p[0],p[1]]),c));
    if(simetria==='v'&&eje)out.push(T(s.map(p=>[p[0],2*eje[1]-p[1]]),c))});
  return out;
}
// «Ejemplo: parábola con rectas» (curve stitching): dos ejes con n puntos numerados; unir el i de uno con el i del otro
export function parabolaConRectas(x,y,{n=10,s=CM*.9,color=TINTA}={}){
  const g=nuevoIdObj(),L=n*s,gris='#6b7280',out=[];
  const T=(pts,c=color,w=2)=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color:c,ancho:w,recto:true,forma:'linea',g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])});
  out.push(T([[x,y-s*.6],[x,y+L]]),T([[x,y+L],[x+L+s*.6,y+L]]));
  for(let i=1;i<=n;i++){
    const v=[x,y+(i-1)*s],h=[x+i*s,y+L];
    out.push(punto(v[0],v[1],5,color,g),punto(h[0],h[1],5,color,g));
    out.push(etiqueta(v[0]-(i<10?16:24),v[1]-9,String(i),12,gris,g),etiqueta(h[0]-(i<10?4:8),h[1]+6,String(i),12,gris,g));
  }
  out.push(etiqueta(x,y+L+30,'Une cada punto con el del mismo número en el otro eje: las rectas dibujan una parábola.',13,gris,g));
  // el ejemplo resuelto con la primera recta, para que se entienda
  out.push(T([[x,y],[x+s,y+L]],'#2563eb',1.4));
  return out;
}
export function iconoRed(tipo,x,y,s=56,{color=TINTA,capa='fondo'}={}){
  const g=nuevoIdObj(),T=pts=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color,ancho:2.2,recto:true,g,capa,pts:pts.map(p=>[r2(x+p[0]*s),r2(y+p[1]*s),.5])});
  const caj=(a,b,c,d)=>[[a,b],[c,b],[c,d],[a,d],[a,b]];
  const nombre={pc:'PC',router:'Router',switch:'Switch',servidor:'Servidor',nube:'Internet'}[tipo]||tipo;
  const m=medidasTexto(nombre,12),et={t:'texto',id:nuevoIdObj(),x:r2(x+s/2-m.w/2),y:r2(y+s+4),w:r2(m.w),h:r2(m.h),texto:nombre,tam:12,color,g,capa};
  const out={
    pc:()=>[T(caj(.08,.08,.92,.66)),T(caj(.16,.16,.84,.58)),T([[.5,.66],[.5,.8]]),T([[.28,.84],[.72,.84]])],
    router:()=>[T(elipse(.5,.5,.44,.26,40)),T([[.24,.42],[.76,.58]]),T([[.24,.58],[.76,.42]]),T([[.62,.38],[.76,.42],[.66,.52]])],
    switch:()=>[T(caj(.04,.3,.96,.7)),T([[.2,.44],[.8,.44],[.72,.38]]),T([[.8,.56],[.2,.56],[.28,.62]])],
    servidor:()=>[T(caj(.22,.02,.78,.98)),T([[.22,.34],[.78,.34]]),T([[.22,.66],[.78,.66]]),T([[.32,.18],[.5,.18]]),T([[.32,.5],[.5,.5]]),T([[.32,.82],[.5,.82]])],
    nube:()=>[T([[.2,.72],[.82,.72],...elipse(.82,.56,.14,.16,12).slice(3,10),...elipse(.58,.4,.2,.2,14).slice(9,14),...elipse(.3,.5,.16,.18,12).slice(6,10),[.08,.6],[.2,.72]])]
  }[tipo]?.()||[];
  return [...out,et];
}

/* ---------- plantillas al crear un dibujo ---------- */
export const PLANTILLAS=[['blanco','⬜','En blanco','liso'],['cuadricula','▦','Cuadrícula','cuadricula'],['cornell','📒','Notas Cornell','renglones'],['problema','🧮','Resolver un problema','cuadricula'],
  ['mapa','🧠','Mapa mental','liso'],['comparar','⚖️','Comparar dos cosas','renglones'],['verdad','🔣','Tabla de verdad','liso'],['red','🖧','Diagrama de red','puntos'],
  ['gauss','▦','Gauss-Jordan','liso',true],['funcion','📈','Graficar una función','liso',true],['pendiente','📏','Pendiente y recta','liso',true],['sistema2','✖️','Sistema 2×2 gráfico','liso',true]];
// El sistema de ejemplo de las plantillas de matemáticas (el de la captura de Angel)
export const SISTEMA_EJEMPLO=[['1','3','3','2'],['2','3','9','4'],['2','4','2','4']];
export function plantilla(id,ancho=720,{ejemplo=false}={}){
  const W=ancho,H=Math.round(W*1.3),fondo=(PLANTILLAS.find(p=>p[0]===id)||PLANTILLAS[0])[3],color='#475569';
  const T=(pts,g)=>({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color,ancho:2,recto:true,capa:'fondo',g,pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])});
  const X=(x,y,texto,tam=18,centro=false)=>{const m=medidasTexto(texto,tam);return {t:'texto',id:nuevoIdObj(),x:r2(centro?x-m.w/2:x),y:r2(y),w:r2(m.w),h:r2(m.h),texto,tam,color,capa:'fondo'}};
  const o=[],m=24;
  if(id==='cornell'){o.push(X(m,m,'Tema:',20),T([[m,64],[W-m,64]]),T([[W*.3,64],[W*.3,H*.78]]),T([[m,H*.78],[W-m,H*.78]]),X(m+4,72,'Claves y preguntas',14),X(W*.3+10,72,'Notas',14),X(m+4,H*.78+8,'Resumen',14))}
  if(id==='problema'){const fr=[0,.16,.36,.82,1].map(f=>64+f*(H-88));o.push(X(m,m,'Problema:',20));
    ['Datos','Planteamiento','Solución','Resultado'].forEach((t,i)=>{o.push(T([[m,fr[i]],[W-m,fr[i]]]),X(m+4,fr[i]+6,t,15))});
    o.push(T([[m,fr[3]],[W-m,fr[3]],[W-m,fr[4]],[m,fr[4]],[m,fr[3]]]))}
  if(id==='mapa'){const cx=W/2,cy=H*.4,g=nuevoIdObj();o.push({...T(elipse(cx,cy,110,52),g)},{...X(cx,cy-12,'Tema central',18,true),g});
    for(let i=0;i<6;i++){const an=i/6*Math.PI*2-Math.PI/2,x=cx+Math.cos(an)*W*.36,y=cy+Math.sin(an)*H*.28;
      o.push(T([[cx+Math.cos(an)*112,cy+Math.sin(an)*54],[x-Math.cos(an)*56,y-Math.sin(an)*26]]));const h=nuevoIdObj();o.push(T(elipse(x,y,64,28),h),{...X(x,y-10,`Idea ${i+1}`,15,true),g:h})}}
  if(id==='comparar'){o.push(X(m,m,'Comparar:',20),T([[m,64],[W-m,64]]),T([[W/2,64],[W/2,H*.75]]),X(W/4,72,'A',18,true),X(W*3/4,72,'B',18,true),T([[m,H*.75],[W-m,H*.75]]),X(m+4,H*.75+8,'En común',15))}
  if(id==='verdad'){const cols=['p','q','¬p','p ∧ q','p ∨ q','p → q'],filas=[['V','V'],['V','F'],['F','V'],['F','F']],x0=m,y0=64,cw=(W-2*m)/cols.length,rh=44;
    o.push(X(m,m,'Tabla de verdad',20));const g=nuevoIdObj();
    for(let i=0;i<=filas.length+1;i++)o.push(T([[x0,y0+i*rh],[W-m,y0+i*rh]],g));
    for(let j=0;j<=cols.length;j++)o.push(T([[x0+j*cw,y0],[x0+j*cw,y0+(filas.length+1)*rh]],g));
    cols.forEach((c,j)=>o.push(X(x0+j*cw+cw/2,y0+12,c,16,true)));
    filas.forEach((f,i)=>f.forEach((v,j)=>o.push(X(x0+j*cw+cw/2,y0+(i+1)*rh+12,v,16,true))))}
  /* ---------- plantillas de matemáticas (PROMPT-PLANOS-MATRICES, parte 3): objetos editables, no dibujos ---------- */
  const nota=(x,y,t,tam=15)=>({...X(x,y,t,tam),capa:'tinta',color:'#64748b'});
  if(id==='gauss'){o.push(X(m,m,'Gauss-Jordan',20),nota(m,58,'Toca la matriz → ⇄ Operación de renglón (✍️ Lo hago yo o 🧮 Calcular por mí).',13));
    const mz=nuevaMatriz(m+8,96,3,4,{celdas:ejemplo?SISTEMA_EJEMPLO.map(f=>f.slice()):undefined,aumentada:3,tam:26});o.push(mz);
    const xo=Math.max(mz.x+mz.w+40,W*.58);o.push(T([[xo-12,90],[xo-12,H*.6]]),X(xo,92,'Operaciones',15));
    if(ejemplo)o.push(nota(m,mz.y+mz.h+16,'x + 3y + 3z = 2  ·  2x + 3y + 9z = 4  ·  2x + 4y + 2z = 4',13))}
  if(id==='funcion'){const s=Math.min(W*.62,W-2*m-170),pl=nuevoPlano(m,70,s,s,{objetos:ejemplo?[{k:'funcion',id:nuevoIdObj(),expr:'x^2 - 4',color:'#2563eb'}]:[]});
    o.push(X(m,m,'Graficar una función',20),pl,nota(m,70+s+10,'Toca el plano → ➕ Agregar → 📈 Función y escribe, por ejemplo, x^2 - 4.',13));
    const xs=[-3,-2,-1,0,1,2,3],fx=x=>x*x-4;
    o.push(nuevaMatriz(m+s+24,70,8,2,{celdas:[['x','y'],...xs.map(x=>ejemplo?[String(x),String(fx(x))]:[String(x),''])],paren:'',alinear:'centro',tam:20}),X(m+s+30,48,'Tabla de valores',14))}
  if(id==='pendiente'){const s=Math.min(W-2*m,560),a={k:'punto',id:nuevoIdObj(),x:1,y:2,nombre:'A',color:'#dc2626'},b={k:'punto',id:nuevoIdObj(),x:4,y:8,nombre:'B',color:'#dc2626'};
    o.push(X(m,m,'Pendiente y recta',20),nuevoPlano(m,70,s,s,{objetos:[{k:'pendiente',id:nuevoIdObj(),pa:a.id,pb:b.id,color:'#2563eb'},a,b]}),
      nota(m,70+s+10,'Arrastra A y B: m, la distancia y la ecuación cambian en vivo.',13))}
  if(id==='sistema2'){const s=Math.min(W*.6,W-2*m-180);
    const objs2=ejemplo?[{k:'funcion',id:nuevoIdObj(),expr:'-x + 5',color:'#2563eb'},{k:'funcion',id:nuevoIdObj(),expr:'2x - 1',color:'#dc2626'},{k:'punto',id:nuevoIdObj(),x:2,y:3,nombre:'P',color:'#15803d'}]:[];
    o.push(X(m,m,'Sistema 2×2 gráfico',20),nuevoPlano(m,70,s,s,{objetos:objs2}),
      nuevaMatriz(m+s+28,90,2,3,{celdas:ejemplo?[['1','1','5'],['−2','1','−1']]:undefined,aumentada:2,tam:24}),
      nota(m+s+28,60,ejemplo?'x + y = 5 · −2x + y = −1':'Escribe el sistema en la matriz',13),
      nota(m,70+s+10,ejemplo?'Las rectas se cortan en P(2, 3): la solución es x = 2, y = 3.':'Agrega las dos rectas (➕ Función) y el punto donde se cortan.',13))}
  if(id==='red'){const s=58,y=110;o.push(X(m,m,'Diagrama de red',20));
    o.push(...iconoRed('nube',W/2-s/2,y-40,s),...iconoRed('router',W/2-s/2,y+80,s),...iconoRed('switch',W/2-s/2,y+200,s),
      ...iconoRed('pc',W*.18-s/2,y+330,s),...iconoRed('pc',W/2-s/2,y+330,s),...iconoRed('servidor',W*.82-s/2,y+330,s));
    o.push(T([[W/2,y+18],[W/2,y+90]]),T([[W/2,y+128],[W/2,y+218]]),T([[W/2,y+242],[W*.18,y+330]]),T([[W/2,y+242],[W/2,y+330]]),T([[W/2,y+242],[W*.82,y+330]]))}
  return {fondo,objetos:o};
}

/* ---------- dibujo completo: normalizar, migrar, medidas y guardar ---------- */
const COLOR=/^#[0-9a-f]{3,8}$/i;
function objetoValido(o){
  if(!o||typeof o!=='object'||typeof o.id!=='string')return false;
  if(o.t==='trazo')return Array.isArray(o.pts)&&o.pts.length>0&&o.pts.every(p=>Array.isArray(p)&&num(p[0])&&num(p[1]))&&num(o.ancho)&&o.ancho>0;
  if(o.t==='texto')return typeof o.texto==='string'&&num(o.x)&&num(o.y)&&num(o.tam);
  if(o.t==='formula')return typeof o.tex==='string'&&num(o.x)&&num(o.y)&&num(o.w)&&num(o.h);
  if(o.t==='imagen')return typeof o.archivo==='string'&&num(o.x)&&num(o.y)&&num(o.w)&&num(o.h);
  if(o.t==='papel')return num(o.x)&&num(o.y)&&num(o.w)&&num(o.h);
  if(o.t==='plano')return planoValido(o);
  if(o.t==='matriz')return matrizValida(o);
  return false;
}
// Lo que llega de otro dispositivo, del respaldo o de una versión vieja: se limpia sin perder lo válido
export function normalizarDibujo(d){
  const base=nuevoDibujo({ancho:num(d?.ancho)?d.ancho:720,modo:d?.modo==='paginas'?'paginas':'crece',fondo:FONDOS.some(f=>f[0]===d?.fondo)?d.fondo:'liso'});
  base.objetos=(Array.isArray(d?.objetos)?d.objetos:[]).filter(objetoValido).map(o=>o.t==='trazo'?{...o,color:COLOR.test(o.color||'')?o.color:TINTA}:o.t==='plano'?limpiarPlano(o):o.t==='matriz'?limpiarMatriz(o):o);
  if(num(d?.alto))base.alto=d.alto;
  if(d?.vista&&num(d.vista.x)&&num(d.vista.y)&&num(d.vista.z))base.vista={x:d.vista.x,y:d.vista.y,z:Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,d.vista.z))};
  base.bloqueado=!!d?.bloqueado;base.practica=!!d?.practica;
  if(d?.capas)for(const k of ['tinta','resaltado','fondo'])base.capas[k]=d.capas[k]!==false;
  base.historial=(Array.isArray(d?.historial)?d.historial:[]).filter(op=>op&&Array.isArray(op.q)&&Array.isArray(op.p)).slice(-MAX_HISTORIAL);
  if(d?.cartesiano&&num(d.cartesiano.ox)&&num(d.cartesiano.oy)&&num(d.cartesiano.unidad)&&d.cartesiano.unidad>0)base.cartesiano={ox:d.cartesiano.ox,oy:d.cartesiano.oy,unidad:d.cartesiano.unidad,paso:num(d.cartesiano.paso)&&d.cartesiano.paso>0?d.cartesiano.paso:1};
  // planos viejos de 📐 → plano editable (y fuera del historial los cambios que los tocaban)
  const mg=migrarPlanosViejos(base.objetos);
  if(mg.quitados){base.objetos=mg.objs;base.historial=base.historial.filter(op=>![...op.q,...op.p].some(([,o])=>mg.quitados.has(o?.id)))}
  return base;
}
/* Un archivo de dibujo del cuaderno (v1 con `trazos` o v2 con `dibujo`) → dibujo v2. Los dibujos de antes de PROMPT-NOTAS
   (solo PNG) vuelven vacíos: el editor les pone su PNG como imagen fija para escribir encima. */
export function migrarDibujo(a){
  if(a?.dibujo)return normalizarDibujo(a.dibujo);
  const viejo=Array.isArray(a?.trazos)?a.trazos:[];
  let maxX=0;for(const t of viejo)for(const p of t?.puntos||[])if(num(p?.[0]))maxX=Math.max(maxX,p[0]);
  // el PNG medía el lienzo × la densidad de la pantalla: la más común (de los teléfonos Android a la laptop) que deje caber todos los puntos
  const dens=a?.ancho?[2.625,3,2,2.75,1.5,1,2.5,1.75,2.25,1.25].find(k=>a.ancho/k>=maxX-1)||1:1;
  const ancho=a?.ancho?Math.round(a.ancho/dens):Math.max(320,Math.ceil(maxX+8));
  const d=nuevoDibujo({ancho});if(a?.alto)d.alto=Math.round(a.alto/dens);
  let objs=[];
  for(const t of viejo){
    const pts=(t?.puntos||[]).filter(p=>Array.isArray(p)&&num(p[0])&&num(p[1])).map(p=>[p[0],p[1],num(p[2])?p[2]:.5]);if(!pts.length)continue;
    const ancho=num(t.ancho)&&t.ancho>0?t.ancho:3;
    if(t.herr==='borrar'){objs=borrarCon(objs,pts,ancho*3);continue}
    objs.push({t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:t.pen?'fuente':'boli',...(t.pen?{vari:true}:{}),color:COLOR.test(t.color||'')?t.color:TINTA,ancho,pts});
  }
  d.objetos=objs;return d;
}
export const FONDOS=[['liso','⬜','Liso'],['cuadricula','▦','Cuadrícula (5 mm)'],['renglones','☰','Renglones'],['puntos','⠿','Puntos'],['cartesiano','⊹','Plano cartesiano'],['pentagrama','𝄞','Pentagrama']];
// Origen del plano cartesiano de fondo (centro de la primera página o del ancho)
export const unidadCartesiano=d=>d.cartesiano?.unidad||CM,pasoCartesiano=d=>d.cartesiano?.paso||1;
export const origenCartesiano=d=>d.cartesiano?[d.cartesiano.ox,d.cartesiano.oy]:d.modo==='paginas'?[PAGINA.w/2,PAGINA.h/2]:[Math.round(d.ancho/2/CM)*CM,Math.round(Math.max(8,(d.alto||d.ancho*.8)/2/CM))*CM];
export const anchoPagina=d=>d.modo==='paginas'?PAGINA.w:d.ancho;
// Lo que se ve en la nota y se exporta: [x0, y0, x1, y1] (páginas: hasta la última con algo)
export function region(d,{min=0}={}){
  const vis=d.objetos.filter(o=>o.t!=='papel'),c=cajaDe(vis);
  if(d.modo==='paginas'){const n=paginasUsadas(d);return [0,0,PAGINA.w,n*PAGINA.h+(n-1)*PAGINA.hueco]}
  const alto=Math.max(min,d.alto||0,c?c[3]+24:0,Math.round(d.ancho*.35));
  return [Math.min(0,c?Math.floor(c[0]-16):0),Math.min(0,c?Math.floor(c[1]-16):0),Math.max(d.ancho,c?Math.ceil(c[2]+16):0),Math.ceil(alto)];
}
export function paginasUsadas(d){const c=cajaDe(d.objetos.filter(o=>o.t!=='papel'));return c?Math.max(1,Math.floor(Math.max(0,c[3]-1)/(PAGINA.h+PAGINA.hueco))+1):1}
// Páginas para el PDF: [x0, y0, x1, y1] de cada una
export function paginasPDF(d){
  if(d.modo==='paginas')return Array.from({length:paginasUsadas(d)},(_,i)=>[0,i*(PAGINA.h+PAGINA.hueco),PAGINA.w,i*(PAGINA.h+PAGINA.hueco)+PAGINA.h]);
  const [x0,y0,x1,y1]=region(d),alto=(x1-x0)*PAGINA.h/PAGINA.w,n=Math.max(1,Math.ceil((y1-y0)/alto));
  return Array.from({length:n},(_,i)=>[x0,y0+i*alto,x1,y0+(i+1)*alto]);
}
// Imágenes (archivos del cuaderno) que usa el dibujo, también las que el historial puede devolver al deshacer
export function imagenesDibujo(d){
  const s=new Set();for(const o of d?.objetos||[])if(o.t==='imagen')s.add(o.archivo);
  for(const op of d?.historial||[])for(const [,o] of [...op.q,...op.p])if(o?.t==='imagen')s.add(o.archivo);
  return [...s];
}
// Para guardar: sin cajas calculadas, el historial recortado a los últimos 100 cambios
export function paraGuardar(d){
  return {v:VERSION_DIBUJO,ancho:d.ancho,...(d.alto?{alto:d.alto}:{}),modo:d.modo,fondo:d.fondo,objetos:d.objetos,vista:d.vista,bloqueado:!!d.bloqueado,
    ...(d.practica?{practica:true}:{}),capas:{...d.capas},historial:(d.historial||[]).slice(-MAX_HISTORIAL)};
}
