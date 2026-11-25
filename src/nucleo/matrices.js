/* Matrices con fracciones exactas (sin DOM): lo usan el editor de dibujo (▦ Matriz, operaciones de renglón,
   determinante, inversa…), el teclado de fórmulas del cuaderno y las pruebas. Nunca decimales: 1/3 es 1/3.
   - Fracción: {n, d} con d > 0 y reducida. fr(texto | número) la lee («−3», «1/2», «0.25», «2 1/2» no).
   - Matriz: arreglo de filas de fracciones. Las operaciones devuelven una matriz nueva.
   - Operaciones de renglón (las tres elementales), con su notación (R₂ → R₂ − 2R₁) y su descripción.
   - escalonada / reducida, siguiente paso sugerido (el pivote siguiente), solución del sistema (única, ninguna o infinitas
     con parámetro), determinante con su desarrollo (2×2, Sarrus 3×3, cofactores n×n), transpuesta, inversa por
     Gauss-Jordan con [A | I] (paso a paso), rango, suma y producto, LaTeX y leer un sistema de ecuaciones. */

/* ---------- fracciones ---------- */
const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1};
export const F=(n,d=1)=>{if(!d)throw new Error('división entre cero');if(d<0){n=-n;d=-d}const g=mcd(n,d);return {n:n/g||0,d:d/g}};
export const CERO=F(0),UNO=F(1);
export const suma=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d),resta=(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d);
export const mult=(a,b)=>F(a.n*b.n,a.d*b.d),divi=(a,b)=>F(a.n*b.d,a.d*b.n),neg=a=>F(-a.n,a.d);
export const esCero=a=>a.n===0,esUno=a=>a.n===1&&a.d===1,iguales=(a,b)=>a.n===b.n&&a.d===b.d;
// Lee «3», «−2», «1/2», «-3/4», «0.25», «,5»; null si no es un número
export function fr(t){
  if(t&&typeof t==='object'&&'n' in t)return t;
  if(typeof t==='number'){if(!Number.isFinite(t))return null;if(Number.isInteger(t))return F(t);const s=String(t);return fr(s)}
  const s=String(t??'').trim().replace(/[−–]/g,'-').replace(/\s+/g,'').replace(',','.');
  if(!s)return null;
  let m=s.match(/^([+-]?\d+)\/([+-]?\d+)$/);if(m)return +m[2]?F(+m[1],+m[2]):null;
  m=s.match(/^([+-]?)(\d*)\.(\d+)$/);if(m){const d=10**m[3].length;return F((m[1]==='-'?-1:1)*(+(m[2]||0)*d+ +m[3]),d)}
  m=s.match(/^[+-]?\d+$/);if(m)return F(+s);
  return null;
}
// «−1/2», «3», «0»: con el signo menos de verdad
export const texto=a=>`${a.n<0?'−':''}${Math.abs(a.n)}${a.d===1?'':'/'+a.d}`;
export const tex=a=>a.d===1?`${a.n<0?'-':''}${Math.abs(a.n)}`:`${a.n<0?'-':''}\\frac{${Math.abs(a.n)}}{${a.d}}`;
export const valor=a=>a.n/a.d;

/* ---------- matrices ---------- */
export const deTextos=celdas=>celdas.map(f=>f.map(fr));
export const esNumerica=M=>M.every(f=>f.every(Boolean));
export const aTextos=M=>M.map(f=>f.map(texto));
export const copia=M=>M.map(f=>f.slice());
export const identidad=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?UNO:CERO));
export const transpuesta=M=>M[0].map((_,j)=>M.map(f=>f[j]));
export function sumaM(A,B){if(A.length!==B.length||A[0].length!==B[0].length)throw new Error(`No se pueden sumar: ${A.length}×${A[0].length} y ${B.length}×${B[0].length} no tienen el mismo tamaño.`);return A.map((f,i)=>f.map((x,j)=>suma(x,B[i][j])))}
export function producto(A,B){if(A[0].length!==B.length)throw new Error(`No se pueden multiplicar: las columnas de A (${A[0].length}) no son las filas de B (${B.length}).`);
  return A.map(f=>B[0].map((_,j)=>f.reduce((s,x,k)=>suma(s,mult(x,B[k][j])),CERO)))}
const SUB='₀₁₂₃₄₅₆₇₈₉',sub=n=>String(n).split('').map(c=>SUB[+c]).join('');
export const R=i=>`R${sub(i+1)}`;

/* ---------- operaciones de renglón: {tipo:'intercambiar', i, j} · {tipo:'multiplicar', i, k} · {tipo:'sumar', i, j, k} (Ri → Ri + k·Rj) ---------- */
export function aplicarOp(M,op){
  const A=copia(M);
  if(op.tipo==='intercambiar')[A[op.i],A[op.j]]=[A[op.j],A[op.i]];
  else if(op.tipo==='multiplicar'){if(esCero(op.k))throw new Error('Multiplicar un renglón por 0 no es una operación válida.');A[op.i]=A[op.i].map(x=>mult(x,op.k))}
  else if(op.tipo==='sumar'){if(op.i===op.j)throw new Error('Elige dos renglones distintos.');A[op.i]=A[op.i].map((x,c)=>suma(x,mult(op.k,M[op.j][c])))}
  return A;
}
export const aplicarOps=(M,ops)=>ops.reduce((A,op)=>aplicarOp(A,op),M);
// La notación estándar: R₁ ↔ R₂ · R₂ → ½R₂ · R₂ → R₂ − 2R₁
export function notacion(op){
  const k=op.k&&(op.k.d===1?texto(op.k):`(${texto(op.k)})`);
  if(op.tipo==='intercambiar')return `${R(op.i)} ↔ ${R(op.j)}`;
  if(op.tipo==='multiplicar')return `${R(op.i)} → ${esUno(op.k)?'':op.k.n===-1&&op.k.d===1?'−':k}${R(op.i)}`;
  const neg_=op.k.n<0,ab=F(Math.abs(op.k.n),op.k.d),a=ab.d===1?texto(ab):`(${texto(ab)})`;
  return `${R(op.i)} → ${R(op.i)} ${neg_?'−':'+'} ${a==='1'?'':a}${R(op.j)}`;
}
// Para la pista: cómo se calcula una celda que cambió
export function pistaCelda(M,op,i,c){
  if(op.tipo==='intercambiar')return `${R(i)} es el ${R(i===op.i?op.j:op.i)} de antes: copia ese renglón.`;
  if(op.tipo==='multiplicar')return `En ${R(i)}, columna ${c+1}: ${texto(op.k)} · ${texto(M[i][c])} = ?`;
  return `En ${R(i)}, columna ${c+1}: ${texto(M[i][c])} ${op.k.n<0?'−':'+'} ${texto(F(Math.abs(op.k.n),op.k.d))}·${M[op.j][c].n<0?`(${texto(M[op.j][c])})`:texto(M[op.j][c])} = ?`;
}
// Celdas de la nueva matriz que cambiaron
export const cambios=(A,B)=>A.flatMap((f,i)=>f.map((x,j)=>iguales(x,B[i][j])?null:[i,j]).filter(Boolean));

/* ---------- forma escalonada ---------- */
const pivote=f=>f.findIndex(x=>!esCero(x));
// cols: cuántas columnas cuentan para los pivotes (en la aumentada, sin la última)
export function esEscalonada(M,cols=M[0].length){
  let ult=-1,cero=false;
  for(const f of M){const p=pivote(f.slice(0,cols));if(p<0){cero=true;continue}if(cero||p<=ult)return false;ult=p}
  return true;
}
export function esReducida(M,cols=M[0].length){
  if(!esEscalonada(M,cols))return false;
  for(const [i,f] of M.entries()){const p=pivote(f.slice(0,cols));if(p<0)continue;if(!esUno(f[p]))return false;if(M.some((g,k)=>k!==i&&!esCero(g[p])))return false}
  return true;
}
// El siguiente paso de Gauss-Jordan (pivote, hacer 1, hacer ceros abajo y arriba), sin hacerlo; null si ya está reducida
export function sugerencia(M,cols=M[0].length){
  let fila=0;
  for(let c=0;c<cols&&fila<M.length;c++){
    let p=-1;for(let i=fila;i<M.length;i++)if(!esCero(M[i][c])){p=i;break}
    if(p<0)continue;
    if(p!==fila)return {tipo:'intercambiar',i:fila,j:p};
    for(let i=fila+1;i<M.length;i++)if(!esCero(M[i][c]))return {tipo:'sumar',i,j:fila,k:neg(divi(M[i][c],M[fila][c]))};
    fila++;
  }
  // hacia atrás: pivotes en 1 y ceros arriba
  for(let i=M.length-1;i>=0;i--){const p=pivote(M[i].slice(0,cols));if(p<0)continue;
    if(!esUno(M[i][p]))return {tipo:'multiplicar',i,k:divi(UNO,M[i][p])};
    for(let k=0;k<i;k++)if(!esCero(M[k][p]))return {tipo:'sumar',i:k,j:i,k:neg(M[k][p])}}
  return null;
}
// Todos los pasos hasta la escalonada reducida (para la inversa y las pruebas)
export function gaussJordan(M,cols=M[0].length){const pasos=[];let A=M,op;while((op=sugerencia(A,cols))&&pasos.length<200){A=aplicarOp(A,op);pasos.push({op,M:A})}return {M:A,pasos}}
export function rango(M){const {M:A}=gaussJordan(M);return A.filter(f=>f.some(x=>!esCero(x))).length}
// Solución de un sistema (matriz aumentada, la última columna son las constantes)
export function solucion(M,vars){
  const n=M[0].length-1,v=vars||(n<=3?['x','y','z'].slice(0,n):Array.from({length:n},(_,i)=>`x${sub(i+1)}`));
  const {M:A}=gaussJordan(M,n);
  if(A.some(f=>f.slice(0,n).every(esCero)&&!esCero(f[n])))return {tipo:'ninguna',texto:'Sistema sin solución (incompatible): un renglón dice 0 = algo distinto de 0.'};
  const piv=A.map(f=>pivote(f.slice(0,n))).filter(p=>p>=0),libres=v.map((_,j)=>j).filter(j=>!piv.includes(j));
  if(!libres.length){const val=v.map((_,j)=>A.find(f=>pivote(f.slice(0,n))===j)[n]);return {tipo:'unica',valores:val,texto:v.map((x,j)=>`${x} = ${texto(val[j])}`).join(', ')}}
  const par=['t','s','r','u'];
  const expr=v.map((x,j)=>{if(libres.includes(j))return `${x} = ${par[libres.indexOf(j)]}`;const f=A.find(g=>pivote(g.slice(0,n))===j);
    let s=esCero(f[n])?'':texto(f[n]);for(const l of libres){const c=neg(f[l]);if(esCero(c))continue;const t=`${esUno(F(Math.abs(c.n),c.d))?'':texto(F(Math.abs(c.n),c.d))}${par[libres.indexOf(l)]}`;s=s?`${s} ${c.n<0?'−':'+'} ${t}`:`${c.n<0?'−':''}${t}`}return `${x} = ${s||'0'}`});
  return {tipo:'infinitas',texto:`Infinitas soluciones: ${expr.join(', ')} (${libres.map(l=>par[libres.indexOf(l)]).join(', ')} cualquier número).`};
}

/* ---------- determinante, inversa ---------- */
export function det(M){
  const n=M.length;if(M.some(f=>f.length!==n))throw new Error('El determinante solo existe para matrices cuadradas.');
  if(n===1)return M[0][0];if(n===2)return resta(mult(M[0][0],M[1][1]),mult(M[0][1],M[1][0]));
  return M[0].reduce((s,x,j)=>{if(esCero(x))return s;const c=mult(x,det(M.slice(1).map(f=>f.filter((_,k)=>k!==j))));return j%2?resta(s,c):suma(s,c)},CERO);
}
const p=a=>a.n<0?`(${texto(a)})`:texto(a);
// El desarrollo para mostrarlo: líneas de texto
export function pasosDet(M){
  const n=M.length,d=det(M);
  if(n===2)return [`det = ${p(M[0][0])}·${p(M[1][1])} − ${p(M[0][1])}·${p(M[1][0])}`,`= ${texto(mult(M[0][0],M[1][1]))} − ${p(mult(M[0][1],M[1][0]))}`,`= ${texto(d)}`];
  if(n===3){const [a,b,c]=M,t=(x,y,z)=>`${p(x)}·${p(y)}·${p(z)}`,m3=(x,y,z)=>mult(mult(x,y),z);
    const pos=[m3(a[0],b[1],c[2]),m3(a[1],b[2],c[0]),m3(a[2],b[0],c[1])],ng=[m3(a[2],b[1],c[0]),m3(a[0],b[2],c[1]),m3(a[1],b[0],c[2])];
    return ['Regla de Sarrus: diagonales hacia abajo menos diagonales hacia arriba',`det = ${t(a[0],b[1],c[2])} + ${t(a[1],b[2],c[0])} + ${t(a[2],b[0],c[1])}`,`    − ${t(a[2],b[1],c[0])} − ${t(a[0],b[2],c[1])} − ${t(a[1],b[0],c[2])}`,
      `= ${pos.map(texto).join(' + ')} − (${ng.map(texto).join(' + ')})`.replace(/\+ −/g,'− '),`= ${texto(pos.reduce(suma))} − ${p(ng.reduce(suma))} = ${texto(d)}`]}
  return [`Desarrollo por cofactores en el renglón 1:`,`det = ${M[0].map((x,j)=>`${j%2?'−':'+'}${p(x)}·det(M${sub(1)}${sub(j+1)})`).join(' ')}`,`= ${texto(d)}`];
}
export function inversa(M){
  const n=M.length;if(M.some(f=>f.length!==n))throw new Error('Solo las matrices cuadradas tienen inversa.');
  const aum=M.map((f,i)=>[...f,...identidad(n)[i]]),gj=gaussJordan(aum,n);
  if(!esEscalonada(gj.M,n)||gj.M.some((f,i)=>!esUno(f[i])))return {existe:false,pasos:gj.pasos,texto:'No tiene inversa: su determinante es 0.'};
  return {existe:true,inversa:gj.M.map(f=>f.slice(n)),pasos:gj.pasos,aumentada:aum};
}

/* ---------- LaTeX y leer un sistema ---------- */
const ENTORNO={'[]':'bmatrix','()':'pmatrix','||':'vmatrix','{}':'Bmatrix','':'matrix'};
const PAR={'[]':['[',']'],'()':['(',')'],'||':['|','|'],'{}':['\\{','\\}'],'':['.','.']};
// celdas: textos de las celdas; aumentada: índice de la columna antes de la cual va la línea (o null)
export function aLatex(celdas,{paren='[]',aumentada=null}={}){
  const c=t=>{const f=fr(t);return f?tex(f):String(t||'').replace(/−/g,'-')||'\\,'};
  const cuerpo=celdas.map(f=>f.map(c).join(' & ')).join(' \\\\ ');
  if(aumentada==null)return `\\begin{${ENTORNO[paren]??'bmatrix'}} ${cuerpo} \\end{${ENTORNO[paren]??'bmatrix'}}`;
  const n=celdas[0].length,col='c'.repeat(aumentada)+'|'+'c'.repeat(n-aumentada),[a,b]=PAR[paren]??PAR['[]'];
  return `\\left${a}\\begin{array}{${col}} ${cuerpo} \\end{array}\\right${b}`;
}
// De LaTeX (lo que escribe aLatex) a celdas, para volver a editar una matriz de una nota; null si no es una matriz
export function deLatex(s){
  const m=String(s).match(/\\begin\{(b|p|v|B|)matrix\}([\s\S]*?)\\end\{\1matrix\}/)||String(s).match(/\\left(\[|\(|\||\\\{|\.)\\begin\{array\}\{([c|]+)\}([\s\S]*?)\\end\{array\}\\right/);
  if(!m)return null;
  const arr=m[0].startsWith('\\left'),cuerpo=arr?m[3]:m[2];
  const celdas=cuerpo.split(/\\\\/).map(f=>f.split('&').map(x=>x.trim().replace(/^\\frac\{(-?\d+)\}\{(\d+)\}$/,'$1/$2').replace(/^-\\frac\{(\d+)\}\{(\d+)\}$/,'-$1/$2').replace(/\\,/g,'').replace(/-/g,'−'))).filter(f=>f.some(x=>x!==''));
  const paren=arr?({'[':'[]','(':'()','|':'||','\\{':'{}','.':''})[m[1]]:({b:'[]',p:'()',v:'||',B:'{}','':''})[m[1]];
  return {celdas,paren,aumentada:arr?m[2].indexOf('|'):null};
}
/* «x + 3y + 3z = 2» por renglón → matriz aumentada (detecta las variables y pone 0 en las que falten). */
export function leerSistema(t){
  const lineas=String(t||'').split(/\n|;/).map(l=>l.trim()).filter(Boolean);if(!lineas.length)return null;
  const vars=[],ecs=[];
  for(const l of lineas){
    const [izq,der]=l.replace(/[−–]/g,'-').replace(/\s+/g,'').split('=');if(der===undefined||!izq)return null;
    const c={};let resto=izq.replace(/^(?=[^+-])/,'+');
    const re=/([+-])(\d+(?:\/\d+)?(?:\.\d+)?)?\*?([a-zA-Z]\w*)?/g;let m,leido='';
    while((m=re.exec(resto))&&m[0]){leido+=m[0];const k=fr((m[1]==='-'?'-':'')+(m[2]||'1'));if(!k)return null;
      if(m[3]){if(!vars.includes(m[3]))vars.push(m[3]);c[m[3]]=suma(c[m[3]]||CERO,k)}else c._=suma(c._||CERO,k)}
    if(leido!==resto)return null;
    const d=fr(der);if(!d)return null;ecs.push({c,d:resta(d,c._||CERO)});
  }
  const orden=['x','y','z','w'].filter(v=>vars.includes(v)).concat(vars.filter(v=>!['x','y','z','w'].includes(v)));
  return {vars:orden,M:ecs.map(e=>[...orden.map(v=>e.c[v]||CERO),e.d])};
}
