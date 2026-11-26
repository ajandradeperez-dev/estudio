/* Simulacros «estilo examen parcial» de Álgebra lineal (PROMPT-ALGEBRA-PULIR, parte 4): 5–6 problemas largos de desarrollo,
   cada uno con varios incisos que comparten los mismos datos (como en un parcial de universidad). El alumno escribe el
   resultado de cada inciso; al final ve la solución completa paso a paso de TODOS los incisos. Con tiempo y sin pistas
   (sesionExamen). Cada inciso es una pregunta normal de sesion.js con su comprobar() independiente. Sin DOM. */
import {paso,final,c} from './pasos.js';
import {mat,vec,lineal,par} from './formato.js';
import {num,lista,casi,limpiar,igualConjunto,equivalente} from './verificar.js';
import {comoVector,comoMatriz,det2,det3} from './algebra-lineal.js';
import {rango,detEliminacion,resolverSistema} from './auditoria.js';

const mul=(A,B)=>A.map(f=>B[0].map((_,j)=>f.reduce((s,x,k)=>s+x*B[k][j],0)));
const mulV=(A,v)=>A.map(f=>f.reduce((s,x,k)=>s+x*v[k],0));
const iguales=(A,B)=>JSON.stringify(A)===JSON.stringify(B);
const cruz=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const sisTex=(A,b,v='xyz')=>`\\begin{cases}${A.map((f,i)=>`${lineal(f.map((x,j)=>[x,v[j]]))} = ${b[i]}`).join(' \\\\ ')}\\end{cases}`;
const esSi=e=>/^\s*s[ií](?![a-zñ])/i.test(limpiar(e)),esNo=e=>/^\s*no(?![a-zñ])/i.test(limpiar(e));
const proporcional=(e,v)=>{if(!Array.isArray(e)||e.length!==v.length)return false;const x=e.map(num);if(!x.every(Number.isFinite)||x.every(z=>Math.abs(z)<1e-9))return false;
  const k=v.findIndex(z=>z!==0),t=x[k]/v[k];return v.every((z,i)=>Math.abs(x[i]-t*z)<1e-6)};
const numQ=(v,dec=0)=>({respuesta:String(dec?+v.toFixed(dec):v),verificar:e=>{const x=num(String(e).replace(/^[a-zλ]\s*=\s*/i,''));return Number.isFinite(x)&&Math.abs(x-v)<=(dec?0.5*10**-dec+1e-9:1e-6)},teclado:'mat'});
const R='Revisa el procedimiento completo al final del examen.';

// Arma los incisos de un problema: el contexto se repite en cada uno (pantalla por pantalla) y la letra dice cuál es
function problema(n,contexto,incisos,gen){
  return incisos.map((q,i)=>{const letra='abcdef'[i];
    return {...q,gen,tipo:'escribir',regla:q.regla||R,profundidad:'aplicacion',plantilla:`parcial-${n}${letra}`,
      enunciado:`<p class="nota"><b>Problema ${n}</b> · inciso ${letra}) de ${incisos.length}</p>${contexto}<p><b>${letra})</b> ${q.pide}</p>`,
      clave:`p${n}${letra}:${contexto}`}});
}
const inv2=A=>{const d=det2(A);return [[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]].map(f=>f.map(x=>x+0))};
const matDet1=r=>{let A;do A=[[r.entero(-3,3),r.entero(-3,3)],[r.entero(-3,3),r.entero(-3,3)]];while(Math.abs(det2(A))!==1);return A};
const conPropios=(r,l1,l2)=>{const P=matDet1(r),D=[[l1,0],[0,l2]];return {P,A:mul(mul(P,D),inv2(P)).map(f=>f.map(Math.round))}};

/* ---------- Parcial 1: sistemas, matrices y determinantes ---------- */
function parcial1(r){
  const l=[];
  {let A,D;do{A=Array.from({length:3},()=>[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)]);D=det3(A)}while(D===0||Math.abs(D)>25);const s=[r.entero(-4,4),r.entero(-4,4),r.entero(-4,4)],b=mulV(A,s);
    l.push(...problema(1,`<p>Considera el sistema \\[${sisTex(A,b)}\\]</p>`,[
      {pide:'Calcula el determinante de la matriz de coeficientes.',...numQ(D),pasos:[paso('Matriz de coeficientes',`\\(A = ${mat(A)}\\)`,'Sin la columna de resultados.'),final('Cofactores por el primer renglón',`\\(\\det A = ${c(D)}\\)`,'a(ei − fh) − b(di − fg) + c(dh − eg).',String(D))],comprobar:()=>casi(detEliminacion(A),D)},
      {pide:'Resuelve el sistema (escribe x, y, z).',...comoVector(s),pasos:[paso('Matriz aumentada',`\\(\\left(\\begin{array}{ccc|c}${A.map((f,i)=>[...f,b[i]].join(' & ')).join(' \\\\ ')}\\end{array}\\right)\\)`,'Coeficientes y resultados.'),paso('Escalona (Gauss)','Ceros debajo de cada pivote','Operaciones de renglón.'),final('Sustitución hacia atrás',`\\((x, y, z) = ${c(vec(s))}\\)`,`det A = ${D} ≠ 0: la solución es única.`,vec(s))],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&t.every((x,i)=>casi(x,s[i]))}}],'al/gauss'))}
  {const A=matDet1(r),B=matDet1(r),AB=mul(A,B),dAB=det2(AB),I=inv2(AB).map(f=>f.map(Math.round));
    l.push(...problema(2,`<p>Sean \\(A = ${mat(A)}\\) y \\(B = ${mat(B)}\\).</p>`,[
      {pide:'Calcula \\(AB\\).',...comoMatriz(AB),pasos:[paso('Renglón por columna','Cada entrada (i, j) es el renglón i de A por la columna j de B','Producto de matrices.'),final('Resultado',`\\(AB = ${c(mat(AB))}\\)`,'2×2.',mat(AB))],comprobar:()=>iguales(mulV(AB,[1,2]),mulV(A,mulV(B,[1,2])))},
      {pide:'Calcula \\(\\det(AB)\\).',...numQ(dAB),pasos:[paso('Propiedad',`\\(\\det(AB) = \\det A\\cdot\\det B = ${det2(A)}\\cdot${par(det2(B))}\\)`,'El determinante de un producto es el producto.'),final('Resultado',`\\(${c(dAB)}\\)`,'También sale del 2×2 directo.',String(dAB))],comprobar:()=>dAB===det2(A)*det2(B)},
      {pide:'Calcula \\((AB)^{-1}\\).',...comoMatriz(I),pasos:[paso('Determinante',`\\(\\det(AB) = ${dAB}\\)`,'Distinto de 0: hay inversa.'),final('Fórmula 2×2',`\\((AB)^{-1} = ${c(mat(I))}\\)`,'Intercambia a y d, cambia el signo de b y c, divide entre el determinante.',mat(I))],comprobar:()=>iguales(mul(AB,I),[[1,0],[0,1]])}],'al/inversa'))}
  {const U=[[1,r.entero(-3,3),r.entero(-3,3)],[0,1,r.entero(-3,3)],[0,0,1]],L=[[1,0,0],[r.entero(-2,2),1,0],[r.entero(-2,2),r.entero(-2,2),1]],A=mul(L,U),Ai=(()=>{const inv=M=>{const n=3,X=M.map((f,i)=>[...f,...[0,1,2].map(j=>+(i===j))]);for(let cc=0;cc<n;cc++){let p=cc;while(Math.abs(X[p][cc])<1e-12)p++;[X[p],X[cc]]=[X[cc],X[p]];const d=X[cc][cc];X[cc]=X[cc].map(x=>x/d);for(let i=0;i<n;i++)if(i!==cc){const k=X[i][cc];X[i]=X[i].map((x,j)=>x-k*X[cc][j])}}return X.map(f=>f.slice(3).map(x=>Math.round(x)+0))};return inv(A)})(),x=[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)],b=mulV(A,x);
    l.push(...problema(3,`<p>Sea \\(A = ${mat(A)}\\) (su determinante es 1).</p>`,[
      {pide:'Calcula \\(A^{-1}\\) con Gauss-Jordan sobre \\([A\\,|\\,I]\\).',...comoMatriz(Ai),pasos:[paso('Escribe [A | I]','La identidad a la derecha','Lo que le hagas a A se lo haces a I.'),paso('Escalona y reduce','Hasta tener I a la izquierda','Gauss-Jordan.'),final('Lee la derecha',`\\(A^{-1} = ${c(mat(Ai))}\\)`,'Comprueba que AA⁻¹ = I.',mat(Ai))],comprobar:()=>iguales(mul(A,Ai),[[1,0,0],[0,1,0],[0,0,1]])},
      {pide:`Usa \\(A^{-1}\\) para resolver \\(Ax = ${vec(b)}\\).`,...comoVector(x),pasos:[paso('x = A⁻¹b',`\\(x = ${mat(Ai)}${vec(b)}\\)`,'Multiplica por la izquierda.'),final('Multiplica',`\\(x = ${c(vec(x))}\\)`,'Renglón por vector.',vec(x))],comprobar:()=>iguales(mulV(A,x),b)}],'al/inversa'))}
  {const m=r.entero(2,4),cc=r.prob(0.5)?m:m+r.entero(1,3),infinitas=cc===m;
    l.push(...problema(4,`<p>Considera el sistema \\(\\begin{cases}x + ky = 1 \\\\ kx + ${m*m}y = ${cc}\\end{cases}\\) que depende de k.</p>`,[
      {pide:'¿Para qué valores de k NO tiene solución única? (sepáralos con coma)',respuesta:`k = ${-m}, k = ${m}`,verificar:e=>igualConjunto(String(e).replace(/k\s*=\s*/gi,''),[-m,m]),teclado:'mat',pasos:[paso('Determinante',`\\(\\det\\begin{pmatrix}1 & k \\\\ k & ${m*m}\\end{pmatrix} = ${m*m} - k^{2}\\)`,'Solución única ⇔ det ≠ 0.'),final('Iguala a 0',`\\(k^{2} = ${m*m} \\Rightarrow k = ${c(`\\pm ${m}`)}\\)`,'Los dos signos.',`k = ${-m}, k = ${m}`)],comprobar:()=>[-m,m].every(k=>m*m-k*k===0)},
      {pide:`Con \\(k = ${m}\\), ¿cuántas soluciones tiene? (escribe ninguna o infinitas)`,respuesta:infinitas?'Infinitas':'Ninguna',verificar:e=>infinitas?/infinit/i.test(e):/ningun|no tiene|sin soluc/i.test(e),pasos:[paso('Sustituye k',`\\(\\begin{cases}x + ${m}y = 1 \\\\ ${m}x + ${m*m}y = ${cc}\\end{cases}\\)`,'det = 0: o ninguna o infinitas.'),paso(`Renglón 2 menos ${m} veces el 1`,`\\(0 = ${cc} - ${m} = ${c(cc-m)}\\)`,'Se cancelan las incógnitas.'),final('Concluye',infinitas?'0 = 0: infinitas soluciones':`0 = ${cc-m}: contradicción, ninguna`,'Si queda 0 = 0, una ecuación sobra.',infinitas?'Infinitas':'Ninguna')],comprobar:()=>{const ra=rango([[1,m],[m,m*m]]),rb=rango([[1,m,1],[m,m*m,cc]]);return infinitas?ra===rb&&ra<2:ra<rb}}],'al/gauss-jordan'))}
  {const a=r.elegir([1,2,-1]),bb=r.entero(-4,4),lm=r.noCero(-3,3),u=r.noCero(-4,4),A=[[a,bb],[lm*a,lm*bb+u]],U=[[a,bb],[0,u]],x=[r.entero(-4,4),r.entero(-4,4)],b=mulV(A,x);
    l.push(...problema(5,`<p>Sea \\(A = ${mat(A)}\\) y \\(b = ${vec(b)}\\).</p>`,[
      {pide:'Factoriza \\(A = LU\\): ¿cuánto vale el multiplicador \\(\\ell_{21}\\)?',...numQ(lm),pasos:[paso('Entrada a eliminar entre el pivote',`\\(\\ell_{21} = \\dfrac{${A[1][0]}}{${a}}\\)`,'F₂ − ℓF₁.'),final('Resultado',`\\(${c(lm)}\\)`,'Va debajo de la diagonal de L.',String(lm))],comprobar:()=>A[1][0]===lm*a},
      {pide:'Escribe \\(U\\).',...comoMatriz(U),pasos:[paso('F₂ − ℓ₂₁F₁',`\\(${A[1][1]} - ${par(lm)}\\cdot${par(bb)} = ${c(u)}\\)`,'Lo demás del renglón 1 queda igual.'),final('U',`\\(${c(mat(U))}\\)`,'Triangular superior.',mat(U))],comprobar:()=>iguales(mul([[1,0],[lm,1]],U),A)},
      {pide:'Resuelve \\(Ax = b\\) usando L y U (escribe x₁, x₂).',...comoVector(x),pasos:[paso('Ly = b',`\\(y = ${vec([b[0],b[1]-lm*b[0]])}\\)`,'Hacia adelante.'),final('Ux = y',`\\(x = ${c(vec(x))}\\)`,'Hacia atrás.',vec(x))],comprobar:()=>iguales(mulV(A,x),b)}],'al/lu'))}
  return l;
}

/* ---------- Parcial 2: espacios vectoriales y transformaciones ---------- */
function parcial2(r){
  const l=[];
  {let u,v;do{u=[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)];v=[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)]}while(rango([u,v])<2);const a=r.noCero(-3,3),b=r.noCero(-3,3),w=u.map((x,i)=>a*x+b*v[i]);
    l.push(...problema(1,`<p>Sean \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\) y \\(w = ${vec(w)}\\) en \\(\\mathbb{R}^3\\).</p>`,[
      {pide:'¿Cuál es el rango de la matriz con u, v y w como renglones?',...numQ(2),pasos:[paso('Escalona',`\\(${mat([u,v,w])}\\)`,'Cuenta los pivotes.'),final('Pivotes',`\\(${c(2)}\\)`,'Un renglón se vuelve cero.','2')],comprobar:()=>rango([u,v,w])===2},
      {pide:'¿Son linealmente independientes? (sí o no)',respuesta:'No',verificar:esNo,pasos:[paso('Compara rango y número de vectores','Rango 2 con 3 vectores','Independientes ⇔ rango = número de vectores.'),final('Concluye','No: uno es combinación de los otros','Son dependientes.','No')],comprobar:()=>rango([u,v,w])<3},
      {pide:'Escribe w como \\(a\\,u + b\\,v\\): da a, b.',...comoVector([a,b]),pasos:[paso('Plantea',`\\(a${vec(u)} + b${vec(v)} = ${vec(w)}\\)`,'Un sistema de 3 ecuaciones y 2 incógnitas.'),final('Resuelve con dos ecuaciones y comprueba la tercera',`\\(a = ${c(a)},\\ b = ${c(b)}\\)`,'La tercera también se cumple.',vec([a,b]))],comprobar:()=>w.every((x,i)=>x===a*u[i]+b*v[i])}],'al/independencia'))}
  {let r1,r2;do{r1=[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)];r2=[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)]}while(rango([r1,r2])<2);const k=r.noCero(-2,2),A=[r1,r2,r1.map((x,i)=>x+k*r2[i])],nv=cruz(r1,r2);
    l.push(...problema(2,`<p>Sea \\(A = ${mat(A)}\\).</p>`,[
      {pide:'Calcula el rango de A.',...numQ(2),pasos:[paso('El renglón 3',`\\(F_3 = F_1 ${k<0?'-':'+'} ${Math.abs(k)===1?'':Math.abs(k)}F_2\\)`,'Se anula al escalonar.'),final('Pivotes',`\\(${c(2)}\\)`,'Dos renglones independientes.','2')],comprobar:()=>rango(A)===2},
      {pide:'¿Cuál es la nulidad de A (dimensión del núcleo)?',...numQ(1),pasos:[paso('Teorema del rango',`\\(\\text{rango} + \\text{nulidad} = 3\\)`,'Número de columnas.'),final('Despeja',`\\(3 - 2 = ${c(1)}\\)`,'Una variable libre.','1')],comprobar:()=>3-rango(A)===1},
      {pide:'Da un vector distinto de cero del núcleo (cualquier múltiplo sirve).',forma:{filas:1,cols:3},celdas:nv.map(String),respuesta:vec(nv),verificar:e=>proporcional(e,nv),teclado:'mat',pasos:[paso('El núcleo es perpendicular a los renglones','Un vector perpendicular a F₁ y F₂ es F₁ × F₂','En ℝ³, el producto cruz.'),final('Calcula',`\\(${c(vec(nv))}\\)`,'Comprueba: A·n = 0.',vec(nv))],comprobar:()=>mulV(A,nv).every(x=>x===0)&&nv.some(x=>x)}],'al/nucleo-imagen'))}
  {const B=matDet1(r),b1=[B[0][0],B[1][0]],b2=[B[0][1],B[1][1]],cc=[r.entero(-4,4),r.entero(-4,4)],w=mulV(B,cc),Pi=inv2(B);
    l.push(...problema(3,`<p>Sea la base \\(B = \\{${vec(b1)},\\ ${vec(b2)}\\}\\) de \\(\\mathbb{R}^2\\) y \\(w = ${vec(w)}\\).</p>`,[
      {pide:'Calcula \\([w]_B\\).',...comoVector(cc),pasos:[paso('Plantea',`\\(c_1${vec(b1)} + c_2${vec(b2)} = ${vec(w)}\\)`,'Sistema 2×2.'),final('Resuelve',`\\([w]_B = ${c(vec(cc))}\\)`,'Eliminación.',vec(cc))],comprobar:()=>iguales(mulV(B,cc),w)},
      {pide:'Escribe la matriz P de cambio de base de B a la usual.',...comoMatriz(B),pasos:[paso('Columnas',`b₁ y b₂ como columnas`,'P[w]_B = w.'),final('P',`\\(${c(mat(B))}\\)`,'2×2.',mat(B))],comprobar:()=>iguales(mulV(B,[1,0]),b1)},
      {pide:'Escribe \\(P^{-1}\\) (de la usual a B).',...comoMatriz(Pi),pasos:[paso('Determinante',`\\(\\det P = ${det2(B)}\\)`,'±1: la inversa tiene enteros.'),final('Inversa',`\\(${c(mat(Pi))}\\)`,'Fórmula 2×2.',mat(Pi))],comprobar:()=>iguales(mul(B,Pi),[[1,0],[0,1]])}],'al/cambio-base'))}
  {const M=[[r.entero(-4,4),r.entero(-4,4)],[r.entero(-4,4),r.entero(-4,4)]];if(det2(M)===0)M[0][0]+=1;const p=[r.entero(-3,3),r.entero(-3,3)],Tp=mulV(M,p),f=fila=>lineal([[fila[0],'x'],[fila[1],'y']]);
    l.push(...problema(4,`<p>Sea \\(T(x, y) = (${f(M[0])},\\ ${f(M[1])})\\).</p>`,[
      {pide:'Escribe la matriz estándar de T.',...comoMatriz(M),pasos:[paso('Columnas',`\\(T(1,0) = ${vec([M[0][0],M[1][0]])},\\ T(0,1) = ${vec([M[0][1],M[1][1]])}\\)`,'Las imágenes de la base.'),final('Matriz',`\\(${c(mat(M))}\\)`,'[T(e₁) T(e₂)].',mat(M))],comprobar:()=>iguales(mulV(M,[1,0]),[M[0][0],M[1][0]])},
      {pide:`Calcula \\(T${vec(p)}\\).`,...comoVector(Tp),pasos:[paso('Matriz por vector',`\\(${mat(M)}${vec(p)}\\)`,'Renglón por vector.'),final('Resultado',`\\(${c(vec(Tp))}\\)`,'O sustituye en la fórmula.',vec(Tp))],comprobar:()=>iguales(Tp,[M[0][0]*p[0]+M[0][1]*p[1],M[1][0]*p[0]+M[1][1]*p[1]])},
      {pide:'¿Por cuánto multiplica T las áreas?',...numQ(Math.abs(det2(M))),pasos:[paso('Determinante',`\\(\\det = ${det2(M)}\\)`,'ad − bc.'),final('Valor absoluto',`\\(${c(Math.abs(det2(M)))}\\)`,'El área no es negativa.',String(Math.abs(det2(M))))],comprobar:()=>casi(Math.abs(detEliminacion(M)),Math.abs(det2(M)))}],'al/matriz-transformacion'))}
  {const a=r.noCero(-3,3),b=r.noCero(-3,3),cte=r.prob(0.5)?0:r.noCero(-4,4),es=cte===0;
    l.push(...problema(5,`<p>Sea \\(W = \\{(x, y, z) : ${lineal([[a,'x'],[b,'y'],[1,'z']])} = ${cte}\\}\\).</p>`,[
      {pide:'¿Es W un subespacio de \\(\\mathbb{R}^3\\)? (sí o no)',respuesta:es?'Sí':'No',verificar:es?esSi:esNo,pasos:[paso('¿Contiene al 0?',`\\(${a}\\cdot0 + ${par(b)}\\cdot0 + 0 = 0 ${es?'=':'\\neq'} ${cte}\\)`,'Un subespacio siempre contiene al origen.'),final('Concluye',es?'Sí: plano por el origen':'No: no contiene al 0','Un plano que pasa por el origen sí es subespacio.',es?'Sí':'No')],comprobar:()=>es===(a*0+b*0+0===cte)},
      {pide:'¿Cuál es la dimensión del conjunto de soluciones (un plano)?',...numQ(2),pasos:[paso('Variables libres','Una ecuación con 3 incógnitas','Se despeja z.'),final('Dimensión',`\\(3 - 1 = ${c(2)}\\)`,'Dos parámetros (x y y libres).','2')],comprobar:()=>3-rango([[a,b,1]])===2}],'al/combinacion-lineal'))}
  return l;
}

/* ---------- Parcial 3: valores propios, ortogonalidad y mínimos cuadrados ---------- */
function parcial3(r){
  const l=[];
  {let l1,l2;do{l1=r.entero(-4,5);l2=r.entero(-4,5)}while(l1===l2);const {P,A}=conPropios(r,l1,l2),v1=[P[0][0],P[1][0]],tr=A[0][0]+A[1][1],dt=det2(A),pol=`λ^2 ${tr?`${-tr<0?'-':'+'} ${Math.abs(tr)===1?'':Math.abs(tr)}λ `:''}${dt<0?'-':'+'} ${Math.abs(dt)}`;
    l.push(...problema(1,`<p>Sea \\(A = ${mat(A)}\\).</p>`,[
      {pide:'Escribe el polinomio característico en λ.',respuesta:pol,verificar:e=>{try{return equivalente(limpiar(e).replace(/λ/g,'x').replace(/=\s*0\s*$/,''),`x^2 - (${tr})*x + (${dt})`)}catch(x){return false}},teclado:'mat',pasos:[paso('det(A − λI)',`\\((${A[0][0]} - \\lambda)(${A[1][1]} - \\lambda) - ${par(A[0][1])}\\cdot${par(A[1][0])}\\)`,'Resta λ en la diagonal.'),final('Desarrolla',`\\(${c(pol.replace(/λ\^2/,'\\lambda^{2}').replace(/λ/g,'\\lambda'))}\\)`,'λ² − (traza)λ + det.',pol)],comprobar:()=>[l1,l2].every(x=>x*x-tr*x+dt===0)},
      {pide:'Encuentra los valores propios (sepáralos con coma).',respuesta:`λ = ${l1}, λ = ${l2}`,verificar:e=>igualConjunto(String(e).replace(/λ\s*=\s*/g,''),[l1,l2]),teclado:'mat',pasos:[paso('Raíces del polinomio',`\\(${pol.replace(/λ\^2/,'\\lambda^{2}').replace(/λ/g,'\\lambda')} = 0\\)`,'Factoriza o usa la fórmula general.'),final('Valores propios',`\\(\\lambda = ${c(l1)},\\ \\lambda = ${c(l2)}\\)`,'Suma = traza, producto = det.',`λ = ${l1}, λ = ${l2}`)],comprobar:()=>[l1,l2].every(x=>Math.abs(detEliminacion([[A[0][0]-x,A[0][1]],[A[1][0],A[1][1]-x]]))<1e-9)},
      {pide:`Da un vector propio para \\(\\lambda = ${l1}\\).`,forma:{filas:1,cols:2},celdas:v1.map(String),respuesta:vec(v1),verificar:e=>proporcional(e,v1),teclado:'mat',pasos:[paso('Resuelve (A − λI)v = 0',`\\(${mat([[A[0][0]-l1,A[0][1]],[A[1][0],A[1][1]-l1]])}v = 0\\)`,'Los renglones son proporcionales.'),final('Un vector',`\\(v = ${c(vec(v1))}\\)`,'Cualquier múltiplo ≠ 0 sirve.',vec(v1))],comprobar:()=>iguales(mulV(A,v1),v1.map(x=>l1*x))}],'al/valores-propios'));
    const k=r.entero(2,4),Akv=v1.map(x=>l1**k*x);
    l.push(...problema(2,`<p>La matriz del problema 1 se diagonaliza con \\(P = ${mat(P)}\\) (columnas: vectores propios de \\(\\lambda = ${l1}\\) y \\(\\lambda = ${l2}\\)).</p>`,[
      {pide:'Escribe la matriz diagonal D tal que \\(A = PDP^{-1}\\).',...comoMatriz([[l1,0],[0,l2]]),pasos:[paso('En el orden de las columnas de P','Primero λ = '+l1+', luego λ = '+l2,'Cada valor propio con su vector.'),final('D',`\\(${c(mat([[l1,0],[0,l2]]))}\\)`,'Diagonal.',mat([[l1,0],[0,l2]]))],comprobar:()=>iguales(mul(A,P),mul(P,[[l1,0],[0,l2]]))},
      {pide:`Calcula \\(A^{${k}}${vec(v1)}\\).`,...comoVector(Akv),pasos:[paso('Es vector propio de λ = '+l1,`\\(A^{${k}}v = ${l1}^{${k}}v\\)`,'Cada vez que aplicas A se multiplica por λ.'),final('Calcula',`\\(${l1**k}${vec(v1)} = ${c(vec(Akv))}\\)`,'Sin multiplicar matrices.',vec(Akv))],comprobar:()=>{let x=v1;for(let i=0;i<k;i++)x=mulV(A,x);return iguales(x,Akv)}}],'al/diagonalizacion'))}
  {let v1;do v1=[r.entero(-3,3),r.entero(-3,3)];while(!v1[0]&&!v1[1]);const t=r.noCero(-2,2),q=r.noCero(-2,2),perp=[-v1[1]*q,v1[0]*q],v2=v1.map((x,i)=>t*x+perp[i]),pr=v1.map(x=>t*x);
    l.push(...problema(3,`<p>Aplica Gram-Schmidt a \\(v_1 = ${vec(v1)}\\) y \\(v_2 = ${vec(v2)}\\).</p>`,[
      {pide:'Calcula \\(\\text{proy}_{v_1} v_2\\).',...comoVector(pr),pasos:[paso('Cociente',`\\(\\dfrac{v_2\\cdot v_1}{v_1\\cdot v_1} = \\dfrac{${v2[0]*v1[0]+v2[1]*v1[1]}}{${v1[0]**2+v1[1]**2}} = ${c(t)}\\)`,'Cuántas veces cabe v₁.'),final('Multiplica',`\\(${t}${vec(v1)} = ${c(vec(pr))}\\)`,'La sombra de v₂.',vec(pr))],comprobar:()=>{const e=[v2[0]-pr[0],v2[1]-pr[1]];return e[0]*v1[0]+e[1]*v1[1]===0}},
      {pide:'Calcula \\(w_2 = v_2 - \\text{proy}_{v_1} v_2\\).',...comoVector(perp),pasos:[paso('Resta',`\\(${vec(v2)} - ${vec(pr)}\\)`,'Componente a componente.'),final('Resultado',`\\(w_2 = ${c(vec(perp))}\\)`,`Comprueba: w₂·v₁ = 0.`,vec(perp))],comprobar:()=>perp[0]*v1[0]+perp[1]*v1[1]===0}],'al/gram-schmidt'))}
  {const xs=[0,1,2,3],ys=xs.map(x=>r.entero(-2,2)+2*x+r.entero(0,3)),n=4,sx=6,sy=ys.reduce((a,b)=>a+b,0),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),sxx=14,m=(n*sxy-sx*sy)/(n*sxx-sx*sx),b=(sy-m*sx)/n;
    const norm=resolverSistema([[n,sx],[sx,sxx]],[sy,sxy]);
    l.push(...problema(4,`<p>Ajusta la recta \\(y = b + mx\\) por mínimos cuadrados a los puntos ${xs.map((x,i)=>`(${x}, ${ys[i]})`).join(', ')}.</p>`,[
      {pide:'Calcula la pendiente m (2 decimales).',...numQ(m,2),pasos:[paso('Sumas',`\\(\\Sigma x = 6,\\ \\Sigma y = ${sy},\\ \\Sigma xy = ${sxy},\\ \\Sigma x^{2} = 14\\)`,'n = 4.'),final('Pendiente',`\\(m = \\dfrac{4\\cdot${sxy} - 6\\cdot${sy}}{4\\cdot14 - 36} \\approx ${c(m.toFixed(2))}\\)`,'Ecuaciones normales.',String(+m.toFixed(2)))],comprobar:()=>!!norm&&casi(norm[1],m)},
      {pide:'Calcula la ordenada b (2 decimales).',...numQ(b,2),pasos:[paso('Fórmula',`\\(b = \\dfrac{\\Sigma y - m\\Sigma x}{n}\\)`,'La recta pasa por el punto promedio.'),final('Calcula',`\\(\\dfrac{${sy} - ${+m.toFixed(4)}\\cdot6}{4} \\approx ${c(b.toFixed(2))}\\)`,'Ordenada al origen.',String(+b.toFixed(2)))],comprobar:()=>!!norm&&casi(norm[0],b)}],'al/minimos-cuadrados'))}
  {let l1,l2;do{l1=r.entero(-4,7);l2=r.entero(-4,7)}while(l1===l2||(l1+l2)%2);const A=[[(l1+l2)/2,(l1-l2)/2],[(l1-l2)/2,(l1+l2)/2]],pos=l1>0&&l2>0;
    l.push(...problema(5,`<p>Sea la forma cuadrática \\(Q(x, y) = ${lineal([[A[0][0],'x^{2}'],[2*A[0][1],'xy'],[A[1][1],'y^{2}']])}\\).</p>`,[
      {pide:'Encuentra los valores propios de su matriz simétrica (sepáralos con coma).',respuesta:`λ = ${Math.max(l1,l2)}, λ = ${Math.min(l1,l2)}`,verificar:e=>igualConjunto(String(e).replace(/λ\s*=\s*/g,''),[l1,l2]),teclado:'mat',pasos:[paso('Matriz simétrica',`\\(${mat(A)}\\)`,'El término xy se reparte a la mitad.'),final('Valores propios',`\\(\\lambda = ${c(Math.max(l1,l2))},\\ \\lambda = ${c(Math.min(l1,l2))}\\)`,'det(A − λI) = 0.',`λ = ${Math.max(l1,l2)}, λ = ${Math.min(l1,l2)}`)],comprobar:()=>[l1,l2].every(x=>Math.abs(detEliminacion([[A[0][0]-x,A[0][1]],[A[1][0],A[1][1]-x]]))<1e-9)},
      {pide:'¿Es definida positiva? (sí o no)',respuesta:pos?'Sí':'No',verificar:pos?esSi:esNo,pasos:[paso('Signo de los valores propios',`\\(${l1}\\) y \\(${l2}\\)`,'Definida positiva ⇔ todos positivos.'),final('Concluye',pos?'Sí':'No','Mira el signo de los dos.',pos?'Sí':'No')],comprobar:()=>{const Q=(x,y)=>A[0][0]*x*x+2*A[0][1]*x*y+A[1][1]*y*y;return pos?[[1,0],[0,1],[1,1],[1,-1],[2,-1]].every(([x,y])=>Q(x,y)>0):[[1,1],[1,-1],[1,0],[0,1]].some(([x,y])=>Q(x,y)<=0)}}],'al/diagonalizacion-ortogonal'))}
  return l;
}

export const PARCIALES=[
  {id:'mat-parcial-lineal-1',titulo:'Parcial 1 · Sistemas, matrices y determinantes',minutos:45,crear:parcial1,
   desc:'5 problemas de desarrollo con incisos (Gauss, producto e inversa, Gauss-Jordan, un sistema con parámetro y LU). 45 minutos.'},
  {id:'mat-parcial-lineal-2',titulo:'Parcial 2 · Espacios vectoriales y transformaciones',minutos:45,crear:parcial2,
   desc:'5 problemas con incisos: independencia, rango y núcleo, cambio de base, una transformación y subespacios. 45 minutos.'},
  {id:'mat-parcial-lineal-3',titulo:'Parcial 3 · Valores propios y ortogonalidad',minutos:45,crear:parcial3,
   desc:'5 problemas con incisos: valores y vectores propios, diagonalización, Gram-Schmidt, mínimos cuadrados y formas cuadráticas. 45 minutos.'}
];
