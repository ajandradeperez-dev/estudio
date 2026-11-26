/* Verificación INDEPENDIENTE de Álgebra lineal para la auditoría de exactitud (npm run auditar-mate).
   No usa nada del generador: lee el enunciado tal como lo ve el alumno (matrices, sistemas y vectores en TeX) y la
   respuesta (p.celdas o p.respuesta), y comprueba con otro cálculo:
   - sistemas: la solución cumple cada ecuación (A·x = b); «infinitas / ninguna» por rangos;
   - inversa: A·A⁻¹ = I (también (Aᵀ)⁻¹ y (AB)⁻¹);
   - determinante: por cofactores Y por eliminación, los dos iguales a la respuesta;
   - rango: por eliminación con pivoteo;
   - valores propios: det(A − λI) = 0 para cada λ, suma = traza y producto = det; vectores propios: A·v = λ·v;
   - productos de matrices, A·v, transpuesta, potencias;
   - producto cruz: w ⟂ u, w ⟂ v, ‖w‖² = ‖u‖²‖v‖² − (u·v)² y orientación (regla de la mano derecha);
   - independencia (sí/no) por rango y coordenadas en una base.
   verificarLineal(p) → {ok:true} | {ok:false, por} | null (si el ejercicio no es de una forma que sepa leer). Sin DOM. */
import {num,lista} from './verificar.js';

const TOL=1e-6,cerca=(a,b,t=TOL)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b));

/* ---------- leer TeX ---------- */
function numTex(t){
  let s=String(t).trim().replace(/\\left|\\right|\\,|\s/g,'').replace(/−/g,'-');
  let sig=1;if(s.startsWith('-')&&/^-\\[dt]?frac/.test(s)){sig=-1;s=s.slice(1)}
  const f=s.match(/^\\[dt]?frac\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}$/);if(f)return sig*(+f[1])/(+f[2]);
  const v=num(s);return Number.isFinite(v)?v:NaN;
}
export function matricesTex(tex){
  const r=[];
  for(const m of String(tex).matchAll(/\\begin\{([pbvB]?matrix|array)\}(?:\{[^}]*\})?([\s\S]*?)\\end\{\1\}/g)){
    const filas=m[2].split(/\\\\/).map(f=>f.trim()).filter(Boolean).map(f=>f.replace(/\|/g,'&').split('&').map(x=>x.trim()).filter(x=>x!=='').map(numTex));
    if(filas.length&&filas.every(f=>f.length===filas[0].length&&f.every(Number.isFinite)))r.push({M:filas,aumentada:m[1]==='array',idx:m.index});else r.push({M:null,idx:m.index});
  }
  return r;
}
// "\begin{cases} 2x - y = 3 \\ x + 4z = -1 \end{cases}" → {A, b, vars}
export function sistemaTex(tex){
  const m=String(tex).match(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/);if(!m)return null;
  const vars=['x','y','z'],A=[],b=[];
  for(const linea of m[1].split(/\\\\/).map(x=>x.trim()).filter(Boolean)){
    const [izq,der]=linea.replace(/\\,|\s/g,'').replace(/−/g,'-').split('=');if(der===undefined)return null;
    const fila=[0,0,0];let s=izq;if(!/^[+-]/.test(s))s='+'+s;
    const re=/([+-])(\d*\.?\d*)([xyz])/g;let t,usado='';
    while((t=re.exec(s))){fila[vars.indexOf(t[3])]+=(t[1]==='-'?-1:1)*(t[2]===''?1:+t[2]);usado+=t[0]}
    if(usado.length!==s.length)return null;
    const d=num(der);if(!Number.isFinite(d))return null;
    A.push(fila);b.push(d);
  }
  const usa=[0,1,2].filter(j=>A.some(f=>f[j]!==0)||/z/.test(m[1])&&j===2||/y/.test(m[1])&&j===1);
  const n=Math.max(...usa)+1;
  return {A:A.map(f=>f.slice(0,n)),b,n};
}
const vectorTex=(tex,nombre)=>{const m=String(tex).match(new RegExp(`${nombre}\\s*=\\s*\\(([^)]*)\\)`));if(!m)return null;const v=m[1].split(',').map(x=>num(x.replace(/\\,/g,'')));return v.every(Number.isFinite)?v:null};

/* ---------- álgebra (con flotantes; tolerancia) ---------- */
const mul=(A,B)=>A.map(f=>B[0].map((_,j)=>f.reduce((s,x,k)=>s+x*B[k][j],0)));
const mulV=(A,v)=>A.map(f=>f.reduce((s,x,k)=>s+x*v[k],0));
const T=A=>A[0].map((_,j)=>A.map(f=>f[j]));
const ident=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
const igualM=(A,B,t=TOL)=>A.length===B.length&&A.every((f,i)=>f.length===B[i].length&&f.every((x,j)=>cerca(x,B[i][j],t)));
// determinante por cofactores (expansión por la primera fila, recursiva)
export function detCofactores(A){const n=A.length;if(n===1)return A[0][0];if(n===2)return A[0][0]*A[1][1]-A[0][1]*A[1][0];
  let s=0;for(let j=0;j<n;j++){if(!A[0][j])continue;const menor=A.slice(1).map(f=>f.filter((_,k)=>k!==j));s+=(j%2?-1:1)*A[0][j]*detCofactores(menor)}return s}
// determinante por eliminación con pivoteo parcial
export function detEliminacion(A0){const A=A0.map(f=>[...f]),n=A.length;let d=1;
  for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(A[i][c])>Math.abs(A[p][c]))p=i;if(Math.abs(A[p][c])<1e-12)return 0;
    if(p!==c){[A[p],A[c]]=[A[c],A[p]];d=-d}d*=A[c][c];for(let i=c+1;i<n;i++){const k=A[i][c]/A[c][c];for(let j=c;j<n;j++)A[i][j]-=k*A[c][j]}}
  return d}
export function rango(A0){const A=A0.map(f=>[...f]);let r=0;const m=A.length,n=A[0].length;
  for(let c=0;c<n&&r<m;c++){let p=r;for(let i=r+1;i<m;i++)if(Math.abs(A[i][c])>Math.abs(A[p][c]))p=i;if(Math.abs(A[p][c])<1e-9)continue;
    [A[p],A[r]]=[A[r],A[p]];for(let i=0;i<m;i++)if(i!==r){const k=A[i][c]/A[r][c];for(let j=c;j<n;j++)A[i][j]-=k*A[r][j]}r++}
  return r}
const cruz=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const punto=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);

/* ---------- la respuesta ---------- */
function respuestaMatriz(p){
  if(p.forma&&Array.isArray(p.celdas)){const v=p.celdas.map(num);if(!v.every(Number.isFinite))return null;const {filas,cols}=p.forma;return Array.from({length:filas},(_,i)=>v.slice(i*cols,(i+1)*cols))}
  const m=matricesTex(p.respuesta)[0];return m?.M||null;
}
function respuestaVector(p){const M=respuestaMatriz(p);if(M&&M.length===1)return M[0];const l=lista(String(p.respuesta).replace(/[a-zλ]\s*=\s*/gi,''));return l.length&&l.every(Number.isFinite)?l:null}
const respuestaNum=p=>{const v=num(String(p.respuesta).replace(/^[a-zλ]\s*=\s*/i,'').replace(/\s*(m²|N·m|u²|pesos|J).*$/,''));return Number.isFinite(v)?v:null};
const siNo=p=>/^s[ií]/i.test(String(p.respuesta).trim())?true:/^no/i.test(String(p.respuesta).trim())?false:null;

/* ---------- verificadores ---------- */
const mal=por=>({ok:false,por}),bien={ok:true};
export function verificarLineal(p){
  const en=String(p.enunciado),ms=matricesTex(en),mats=ms.map(x=>x.M);
  // 1) sistemas en \begin{cases} o con matriz aumentada
  const sis=sistemaTex(en)||(ms.length===1&&ms[0].aumentada&&mats[0]?{A:mats[0].map(f=>f.slice(0,-1)),b:mats[0].map(f=>f.at(-1)),n:mats[0][0].length-1}:null);
  if(sis&&!/cuántas soluciones/i.test(en)){
    const x=respuestaVector(p);if(!x||x.length!==sis.n)return null;
    const r=mulV(sis.A,x);const i=r.findIndex((v,k)=>!cerca(v,sis.b[k]));
    if(i>=0)return mal(`la solución (${x}) no cumple la ecuación ${i+1}: da ${r[i]} y debería dar ${sis.b[i]}`);
    if(sis.A.length===sis.n&&Math.abs(detEliminacion(sis.A))<1e-9)return mal('se pide «la» solución pero el sistema no tiene solución única (det = 0)');
    return bien;
  }
  if(sis&&/cuántas soluciones/i.test(en)){
    const ra=rango(sis.A),rb=rango(sis.A.map((f,i)=>[...f,sis.b[i]])),tipo=ra<rb?'ninguna':ra<sis.n?'infinitas':'una',r=String(p.respuesta).toLowerCase();
    const dice=/no tiene|ninguna|sin soluci/.test(r)?'ninguna':/infinit/.test(r)?'infinitas':/una|única|unica/.test(r)?'una':null;
    return dice===tipo?bien:mal(`el tipo de solución es «${tipo}» (rangos ${ra} y ${rb}) y la respuesta dice «${p.respuesta}»`);
  }
  // 2) inversa
  if(/inversa|\^\{-1\}/i.test(en)&&!/tiene inversa|es .*la inversa|no tiene inversa|valor de k|\\det/i.test(en)){
    const R=respuestaMatriz(p);
    if(/resolver|Resuelve/.test(en)){const A=mats[0],b=vectorTex(en,'A x')||(en.match(/A\s*x\s*=\s*\(([^)]*)\)/)?.[1].split(',').map(num));const x=respuestaVector(p);
      if(!A||!b||!x)return null;return igualM([mulV(A,x)],[b])?bien:mal(`A·x = (${mulV(A,x)}) ≠ (${b})`)}
    if(!R||R.length!==R[0].length)return null;
    let A=mats[0];if(!A)return null;
    if(/\(A\^\{T\}\)\^\{-1\}/.test(en))A=T(A);
    else if(/\(AB\)\^\{-1\}/.test(en)&&mats[1])A=mul(mats[0],mats[1]);
    if(A.length!==R.length)return null;
    return igualM(mul(A,R),ident(A.length))&&igualM(mul(R,A),ident(A.length))?bien:mal('A·A⁻¹ ≠ I');
  }
  // 3) determinante de una matriz concreta
  if(/\\det\s*\\begin|\\det\\begin/.test(en)&&mats[0]&&/^Calcula|calcula \\\(\\det/.test(en)){
    const A=mats[0],v=respuestaNum(p);if(v===null||A.length!==A[0].length)return null;
    const d1=detCofactores(A),d2=detEliminacion(A);
    if(!cerca(d1,d2,1e-9))return mal(`cofactores (${d1}) y eliminación (${d2}) no coinciden`);
    return cerca(d1,v)?bien:mal(`det = ${d1} y la respuesta dice ${v}`);
  }
  // 4) rango de una matriz concreta
  if(/rango de \\\(\\begin/.test(en)&&mats[0]){const v=respuestaNum(p);if(v===null)return null;const r=rango(mats[0]);return r===v?bien:mal(`el rango es ${r} y la respuesta dice ${v}`)}
  // 5) valores y vectores propios
  if(/Valores propios de/.test(en)&&mats[0]){
    const A=mats[0],n=A.length,ls=lista(String(p.respuesta).replace(/λ\s*=\s*/g,''));if(!ls.length||!ls.every(Number.isFinite))return null;
    for(const l of ls){const d=detEliminacion(A.map((f,i)=>f.map((x,j)=>x-(i===j?l:0))));if(Math.abs(d)>1e-6)return mal(`det(A − ${l}I) = ${d}, no 0: ${l} no es valor propio`)}
    if(ls.length===n){const tr=A.reduce((s,f,i)=>s+f[i],0),pr=ls.reduce((a,b)=>a*b,1),su=ls.reduce((a,b)=>a+b,0);
      if(!cerca(su,tr))return mal(`la suma de los valores propios (${su}) no es la traza (${tr})`);if(!cerca(pr,detEliminacion(A)))return mal(`el producto (${pr}) no es el determinante`)}
    else if(new Set(ls).size!==ls.length||ls.length>n)return mal('valores propios repetidos o de más');
    return bien;
  }
  if(/es vector propio de/.test(en)&&/valor propio λ\?/.test(en)&&mats[0]){const v=vectorTex(en,'v'),l=respuestaNum(p);if(!v||l===null)return null;return igualM([mulV(mats[0],v)],[v.map(x=>l*x)])?bien:mal(`A·v ≠ ${l}·v`)}
  if(/es valor propio de/.test(en)&&/vector propio/.test(en)&&mats[0]){const l=num(en.match(/\\lambda\s*=\s*(-?\d+)/)?.[1]),v=respuestaVector(p);if(!v||!Number.isFinite(l))return null;
    if(v.every(x=>x===0))return mal('el vector cero no es vector propio');return igualM([mulV(mats[0],v)],[v.map(x=>l*x)])?bien:mal(`A·v ≠ ${l}·v`)}
  if(/Un valor propio de/.test(en)&&/OTRO valor propio/.test(en)&&mats[0]){const A=mats[0],l1=num(en.match(/es \\\((-?\d+)\\\)/)?.[1]),v=respuestaVector(p);if(!v||!Number.isFinite(l1))return null;
    const l2=A[0][0]+A[1][1]-l1;if(v.every(x=>x===0))return mal('vector cero');return igualM([mulV(A,v)],[v.map(x=>l2*x)])?bien:mal(`A·v ≠ ${l2}·v`)}
  // 6) productos de matrices
  if(/^Calcula \\\((AB|BA|IA|ABC|A \+ B|A\^\{\d+\}|A v|\d+A)\\\)/.test(en)){
    const op=en.match(/^Calcula \\\(([^\\]+)\\\)/)[1],R=op==='A v'?[respuestaVector(p)]:respuestaMatriz(p);if(!R||!R[0])return null;
    const A=mats[0];if(!A)return null;let E;
    if(op==='AB')E=mul(A,mats[1]);else if(op==='IA')E=mul(mats[1],A);else if(op==='ABC')E=mul(mul(A,mats[1]),mats[2]);else if(op==='A + B')E=A.map((f,i)=>f.map((x,j)=>x+mats[1][i][j]));
    else if(/^A\^\{(\d+)\}$/.test(op)){const k=+op.match(/\d+/)[0];E=ident(A.length);for(let i=0;i<k;i++)E=mul(E,A)}
    else if(op==='A v'){const v=vectorTex(en,'v');if(!v)return null;E=[mulV(A,v)]}
    else if(/^\d+A$/.test(op)){const k=+op.slice(0,-1);E=A.map(f=>f.map(x=>k*x))}
    if(!E||E.some(f=>f.some(x=>!Number.isFinite(x))))return null;
    return igualM(E,R)?bien:mal(`${op} calculado aparte no coincide con la respuesta`);
  }
  if(/^Escribe la transpuesta de/.test(en)&&mats[0]){const R=respuestaMatriz(p);return R?(igualM(T(mats[0]),R)?bien:mal('la transpuesta no coincide')):null}
  // 7) producto cruz
  if(/^Calcula \\\(u \\times v\\\)/.test(en)){const u=vectorTex(en,'u'),v=vectorTex(en,'v'),w=respuestaVector(p);if(!u||!v||!w||w.length!==3)return null;
    if(!cerca(punto(w,u),0)||!cerca(punto(w,v),0))return mal('u × v debe ser perpendicular a u y a v');
    if(!cerca(punto(w,w),punto(u,u)*punto(v,v)-punto(u,v)**2))return mal('‖u × v‖² ≠ ‖u‖²‖v‖² − (u·v)²');
    if(punto(w,w)>0&&detEliminacion([u,v,w])<0)return mal('orientación al revés: es v × u');
    return bien}
  // 8) independencia (sí/no) y coordenadas
  if(/linealmente independientes|una base de/.test(en)&&!/valor de k/.test(en)){
    const vs=[...en.matchAll(/\\\(\((-?\d+(?:,\s*-?\d+)+)\)\\\)/g)].map(m=>m[1].split(',').map(Number)),r=siNo(p);if(vs.length<2||r===null)return null;
    const ind=rango(vs)===vs.length&&(!/una base de \\\(\\mathbb\{R\}\^(\d)/.test(en)||vs.length===+en.match(/mathbb\{R\}\^(\d)/)[1]);
    return ind===r?bien:mal(`por rango ${ind?'sí':'no'} ${/base/.test(en)?'forman base':'son independientes'}`)}
  if(/^Coordenadas de \\\(w = /.test(en)){const w=vectorTex(en,'w'),B=[...en.matchAll(/\((-?\d+),\s*(-?\d+)\)/g)].slice(1,3).map(m=>[+m[1],+m[2]]),c=respuestaVector(p);if(!w||B.length<2||!c)return null;
    const r=[c[0]*B[0][0]+c[1]*B[1][0],c[0]*B[0][1]+c[1]*B[1][1]];return igualM([r],[w])?bien:mal(`${c[0]}·b₁ + ${c[1]}·b₂ = (${r}) ≠ w`)}
  return null;
}

// Resuelve A·x = b por eliminación con pivoteo (para comprobar problemas de aplicación con otro cálculo)
export function resolverSistema(A0,b0){const n=A0.length,A=A0.map((f,i)=>[...f,b0[i]]);
  for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(A[i][c])>Math.abs(A[p][c]))p=i;if(Math.abs(A[p][c])<1e-12)return null;[A[p],A[c]]=[A[c],A[p]];
    for(let i=0;i<n;i++)if(i!==c){const k=A[i][c]/A[c][c];for(let j=c;j<=n;j++)A[i][j]-=k*A[c][j]}}
  return A.map((f,i)=>f[n]/f[i])}
// Mínimo de una función dada como texto, muestreando: para comprobar vértices leyendo la fórmula que ve el alumno
export function argMin(f,a=-20,b=20,paso=0.25){let mx=a,mv=Infinity;for(let x=a;x<=b+1e-9;x+=paso){const v=f(x);if(v<mv-1e-12){mv=v;mx=x}}return mx}
