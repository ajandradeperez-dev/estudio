/* 🧭 Mi análisis · motor de álgebra lineal (PROMPT-MI-ANALISIS, parte 1). Sin DOM y sin librerías: es el punto del proyecto.
   - gaussJordanNum: Gauss-Jordan en decimales con pivoteo parcial, columnas pivote, rango y los pasos con la misma notación
     que el editor de matrices (R₂ → R₂ − 0.5R₁, R₁ ↔ R₃, R₁ → R₁ ÷ 4).
   - nucleo: base del kernel (variables libres = 1, se despejan las pivote), vectores de largo 1.
   - jacobi: valores y vectores propios de una matriz SIMÉTRICA con rotaciones de Jacobi.
   - estandarizar, correlacion y pca (mapa de habilidades).
   - minimosCuadrados: ecuaciones normales resueltas con gaussJordan de matrices.js en FRACCIONES EXACTAS; si el rango es
     menor que 2, el kernel y el motivo.
   EPS = 1e-9 relativo al máximo de la matriz. */
import {F,gaussJordan,notacion,texto as textoF,valor,esCero,rango as rangoF} from '../matrices.js';

export const EPS=1e-9;
const sub=n=>String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
const Rn=i=>`R${sub(i+1)}`;
const num=x=>{const r=Math.round(x*100)/100;return String(Object.is(r,-0)?0:r).replace('-','−')};
export const copiaM=M=>M.map(f=>f.slice());
export const transpuesta=M=>M[0].map((_,j)=>M.map(f=>f[j]));
export const producto=(A,B)=>A.map(f=>B[0].map((_,j)=>f.reduce((s,x,k)=>s+x*B[k][j],0)));
export const porVector=(A,v)=>A.map(f=>f.reduce((s,x,k)=>s+x*v[k],0));
export const norma=v=>Math.sqrt(v.reduce((s,x)=>s+x*x,0));
export const punto=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
export const identidad=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));

/* ---------- Gauss-Jordan numérico ---------- */
export function gaussJordanNum(M0,{cols,pasos:conPasos=true}={}){
  const M=copiaM(M0),m=M.length,n=cols??M[0].length;
  const tol=EPS*Math.max(1,...M.flat().map(Math.abs));
  const pasos=[],piv=[];let fila=0;
  const limpia=()=>{for(const f of M)for(let j=0;j<f.length;j++)if(Math.abs(f[j])<tol)f[j]=0};
  for(let c=0;c<n&&fila<m;c++){
    let p=fila;for(let i=fila+1;i<m;i++)if(Math.abs(M[i][c])>Math.abs(M[p][c]))p=i;
    if(Math.abs(M[p][c])<tol)continue;
    if(p!==fila){[M[p],M[fila]]=[M[fila],M[p]];if(conPasos)pasos.push({op:`${Rn(fila)} ↔ ${Rn(p)}`,M:copiaM(M)})}
    const d=M[fila][c];
    if(Math.abs(d-1)>tol){M[fila]=M[fila].map(x=>x/d);limpia();if(conPasos)pasos.push({op:`${Rn(fila)} → ${Rn(fila)} ÷ ${d<0?`(${num(d)})`:num(d)}`,M:copiaM(M)})}
    for(let i=0;i<m;i++){if(i===fila)continue;const k=M[i][c];if(Math.abs(k)<tol)continue;
      M[i]=M[i].map((x,j)=>x-k*M[fila][j]);limpia();
      if(conPasos)pasos.push({op:`${Rn(i)} → ${Rn(i)} ${k>0?'−':'+'} ${num(Math.abs(k))===1?'':num(Math.abs(k))}${Rn(fila)}`,M:copiaM(M)})}
    piv.push(c);fila++;
  }
  limpia();
  return {M,pivotes:piv,rango:piv.length,pasos};
}
// Base del kernel: por cada columna libre, variable libre = 1 y se despejan las pivote de la reducida
export function nucleo(M0){
  const n=M0[0].length,{M,pivotes}=gaussJordanNum(M0,{pasos:false}),libres=[...Array(n).keys()].filter(j=>!pivotes.includes(j));
  return libres.map(l=>{const v=Array(n).fill(0);v[l]=1;pivotes.forEach((c,i)=>{v[c]=-M[i][l]});const k=norma(v);return v.map(x=>x/k)});
}

/* ---------- Jacobi (matriz simétrica) ---------- */
export function jacobi(C0,{maxBarridos=100,tol=1e-12}={}){
  const n=C0.length,A=copiaM(C0),V=identidad(n);
  const fuera=()=>{let s=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j)s+=A[i][j]**2;return Math.sqrt(s)};
  let barridos=0;
  while(fuera()>=tol&&barridos<maxBarridos){barridos++;
    for(let p=0;p<n-1;p++)for(let q=p+1;q<n;q++){
      if(Math.abs(A[p][q])<1e-300)continue;
      const th=(A[q][q]-A[p][p])/(2*A[p][q]),t=Math.sign(th||1)/(Math.abs(th)+Math.sqrt(th*th+1)),c=1/Math.sqrt(t*t+1),s=t*c;
      for(let k=0;k<n;k++){const akp=A[k][p],akq=A[k][q];A[k][p]=c*akp-s*akq;A[k][q]=s*akp+c*akq}
      for(let k=0;k<n;k++){const apk=A[p][k],aqk=A[q][k];A[p][k]=c*apk-s*aqk;A[q][k]=s*apk+c*aqk}
      for(let k=0;k<n;k++){const vkp=V[k][p],vkq=V[k][q];V[k][p]=c*vkp-s*vkq;V[k][q]=s*vkp+c*vkq}
    }}
  const pares=[...Array(n).keys()].map(i=>{let v=V.map(f=>f[i]);const g=v.reduce((a,x,k)=>Math.abs(x)>Math.abs(v[a])?k:a,0);if(v[g]<0)v=v.map(x=>-x);return {valor:A[i][i],vector:v}})
    .sort((a,b)=>b.valor-a.valor);
  return {valores:pares.map(x=>x.valor),vectores:pares.map(x=>x.vector),barridos};
}

/* ---------- estadística ---------- */
export function estandarizar(X,nombres=[]){
  const n=X.length,m=X[0].length,medias=[],desv=[],quitadas=[],quedan=[];
  for(let j=0;j<m;j++){const col=X.map(f=>f[j]),mu=col.reduce((a,b)=>a+b,0)/n,s=Math.sqrt(col.reduce((a,x)=>a+(x-mu)**2,0)/(n-1));
    if(!(s>1e-12)){quitadas.push(nombres[j]??j);continue}medias.push(mu);desv.push(s);quedan.push(j)}
  const Z=X.map(f=>quedan.map((j,k)=>(f[j]-medias[k])/desv[k]));
  return {Z,medias,desv,quedan,quitadas,nombres:quedan.map(j=>nombres[j]??j)};
}
export const correlacion=Z=>{const n=Z.length,C=producto(transpuesta(Z),Z);return C.map(f=>f.map(x=>x/(n-1)))};
export function pca(X,nombres=[]){
  const e=estandarizar(X,nombres),C=correlacion(e.Z),{valores,vectores}=jacobi(C),total=valores.reduce((a,b)=>a+b,0);
  const varianza=valores.map(l=>l/total),coords=e.Z.map(z=>[punto(z,vectores[0]),punto(z,vectores[1]??Array(z.length).fill(0))]);
  return {...e,C,valores,vectores,varianza,coords};
}

/* ---------- mínimos cuadrados con ecuaciones normales (fracciones exactas) ---------- */
export function minimosCuadrados(t,y){
  const n=t.length,St=t.reduce((a,b)=>a+b,0),Sy=y.reduce((a,b)=>a+b,0),Stt=t.reduce((a,b)=>a+b*b,0),Sty=t.reduce((a,b,i)=>a+b*y[i],0);
  const aumentada=[[n,St,Sy],[St,Stt,Sty]].map(f=>f.map(x=>F(x)));
  const {M,pasos}=gaussJordan(aumentada,2),rg=rangoF(aumentada.map(f=>f.slice(0,2)));
  const r={n,sumas:{St,Sy,Stt,Sty},aumentada,reducida:M,pasos:pasos.map(p=>({op:notacion(p.op),M:p.M})),rango:rg};
  if(rg<2){
    // XᵀX tiene rango 1: (Σt, −n) cumple n·Σt − Σt·n = 0 y Σt·Σt − Σt²·n = 0 cuando todos los t son iguales: es su kernel
    const k=[St,-n],l=Math.hypot(...k)||1;
    return {...r,singular:true,nucleo:k.map(x=>x/l),motivo:'Todos los datos son del mismo día: XᵀX tiene rango 1 y la recta no queda determinada (hay infinitas).'};
  }
  const b0=M[0][2],b1=M[1][2];
  return {...r,singular:false,b0,b1,b0num:valor(b0),b1num:valor(b1),b0txt:textoF(b0),b1txt:textoF(b1),
    predecir:x=>valor(b0)+valor(b1)*x,comprobar:()=>!esCero(F(1))&&Math.abs(n*valor(b0)+St*valor(b1)-Sy)<1e-9&&Math.abs(St*valor(b0)+Stt*valor(b1)-Sty)<1e-9};
}
export {num as fmt2};
