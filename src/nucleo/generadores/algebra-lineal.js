/* Generadores de álgebra lineal. Las respuestas de vectores y matrices se escriben celda por celda (forma {filas, cols});
   verificar recibe el arreglo de casillas y celdas trae las correctas (para probar). */
import {num,casi,igualNum} from './verificar.js';
import {frac,par,mat,vec} from './formato.js';

const celdasIguales=(e,valores,tol=1e-6)=>Array.isArray(e)&&e.length===valores.length&&e.every((x,i)=>casi(num(x),valores[i],tol));
const vecAl=(rng,n,R)=>Array.from({length:n},()=>rng.entero(-R,R));
const TRIPLES2=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[12,16,20]];
const TRIPLES3=[[1,2,2,3],[2,3,6,7],[1,4,8,9],[4,4,7,9],[2,6,9,11],[2,10,11,15],[6,6,7,11],[3,4,12,13]];
const conSignos=(rng,v)=>v.map(x=>x*rng.signo());
const comoVector=(valores,etiquetas)=>({forma:{filas:1,cols:valores.length},celdas:valores.map(String),respuesta:vec(valores),verificar:e=>celdasIguales(e,valores),etiquetas});
const comoMatriz=M=>({forma:{filas:M.length,cols:M[0].length},celdas:M.flat().map(String),respuesta:`\\(${mat(M)}\\)`,verificar:e=>celdasIguales(e,M.flat())});

// Vector entre dos puntos (1), norma con ternas pitagóricas (2–3), norma no entera (4), distancia en 3D (5)
const magnitud={
  titulo:'Vectores y norma',
  explicacion:'El vector de A a B es B − A; su norma (longitud) es la raíz de la suma de los cuadrados de sus componentes.',
  generar(n,rng){
    const R_N='La norma de v = (a, b, c) es ‖v‖ = √(a² + b² + c²): se elevan al cuadrado las componentes, se suman y se saca la raíz.';
    if(n===1){const A=vecAl(rng,2,9),B=vecAl(rng,2,9),v=B.map((x,i)=>x-A[i]);
      return {...comoVector(v),enunciado:`Vector que va de \\(A = ${vec(A)}\\) a \\(B = ${vec(B)}\\)`,pasos:[`\\(B - A = (${B[0]} - ${par(A[0])},\\ ${B[1]} - ${par(A[1])})\\)`,`\\(${vec(v)}\\)`],
        errores:[{si:e=>celdasIguales(e,v.map(x=>-x)),por:'Calculaste A − B: el vector de A a B es B − A (final menos inicio).'},{si:e=>celdasIguales(e,B.map((x,i)=>x+A[i])),por:'Se resta, no se suma.'}],
        regla:'El vector de A a B es B − A, componente a componente.',pista:'Final menos inicio.'}}
    let v,res,t;
    if(n===2){t=rng.elegir(TRIPLES2);v=conSignos(rng,rng.prob(.5)?[t[0],t[1]]:[t[1],t[0]]);res=t[2]}
    else if(n===3||n===5){t=rng.elegir(TRIPLES3);v=conSignos(rng,rng.barajar(t.slice(0,3)));res=t[3]}
    else{do v=vecAl(rng,rng.prob(.5)?2:3,6);while(Number.isInteger(Math.sqrt(v.reduce((s,x)=>s+x*x,0)))||v.every(x=>!x));res=Math.sqrt(v.reduce((s,x)=>s+x*x,0))}
    const suma=v.reduce((s,x)=>s+x*x,0),exacta=Number.isInteger(res)?String(res):`√${suma}`;
    let enunciado=`Calcula \\(\\lVert v \\rVert\\) para \\(v = ${vec(v)}\\)`+(n===4?'<br><span class="nota">Puedes escribir √n o el decimal con 2 cifras.</span>':'');
    if(n===5){const A=vecAl(rng,3,6),B=A.map((x,i)=>x+v[i]);enunciado=`Distancia entre \\(A = ${vec(A)}\\) y \\(B = ${vec(B)}\\)`}
    return {enunciado,respuesta:exacta,verificar:e=>Math.abs(num(e)-res)<=(Number.isInteger(res)?1e-9:0.01),
      pasos:[n===5?`\\(B - A = ${vec(v)}\\)`:`Componentes: \\(${v.join(',\\ ')}\\)`,`\\(${v.map(x=>`${par(x)}^2`).join(' + ')} = ${suma}\\)`,`\\(\\sqrt{${suma}} = ${Number.isInteger(res)?res:res.toFixed(2)}\\)`],
      errores:[{valor:String(suma),si:e=>igualNum(e,suma),por:`Falta sacar la raíz: \\(\\sqrt{${suma}}\\).`},{valor:String(v.reduce((s,x)=>s+x,0)),si:e=>igualNum(e,v.reduce((s,x)=>s+x,0))&&v.reduce((s,x)=>s+x,0)!==res,por:'No se suman las componentes: se suman sus cuadrados y se saca la raíz.'}],
      regla:R_N,pista:'Eleva cada componente al cuadrado.',teclado:'mat'};
  }
};

// Suma, resta, número por vector y combinaciones (2D → 3D)
const operaciones={
  titulo:'Operaciones con vectores',
  explicacion:'Se suman, restan y multiplican por un número componente a componente.',
  generar(n,rng){
    const d=n<=2?2:3,R=n<=3?6:9,u=vecAl(rng,d,R),v=vecAl(rng,d,R);
    let a=1,b=1,txt,r;
    if(n===1){txt='u + v';r=u.map((x,i)=>x+v[i])}
    else if(n===2){a=rng.noCero(-4,4);b=0;txt=`${a}u`;r=u.map(x=>a*x)}
    else if(n===3){txt='u - v';b=-1;r=u.map((x,i)=>x-v[i])}
    else{a=rng.noCero(-3,3);b=rng.noCero(-3,3);txt=`${a===1?'':a===-1?'-':a}u ${b<0?'-':'+'} ${Math.abs(b)===1?'':Math.abs(b)}v`;r=u.map((x,i)=>a*x+b*v[i])}
    return {...comoVector(r),enunciado:`Con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\), calcula \\(${txt}\\)`,
      pasos:[n===2?`Multiplica cada componente por ${a}`:`Opera componente a componente`,`\\(${vec(r)}\\)`],
      errores:[n===3?{si:e=>celdasIguales(e,v.map((x,i)=>x-u[i])),por:'Restaste al revés: es u − v.'}:{si:e=>celdasIguales(e,u.map((x,i)=>x*v[i])),por:'Se suma componente a componente, no se multiplica.'}],
      regla:'Las operaciones con vectores se hacen componente a componente: (a, b) + (c, d) = (a + c, b + d) y k(a, b) = (ka, kb).',pista:'Primera con primera, segunda con segunda…'};
  }
};

// Producto punto (2D → 3D) y valor de k para que sean perpendiculares (5)
const productoPunto={
  titulo:'Producto punto',
  explicacion:'u·v se calcula multiplicando componente a componente y sumando: da un número. Si es 0, son perpendiculares.',
  generar(n,rng){
    const R='Producto punto: (a, b)·(c, d) = ac + bd. Es un número; si vale 0, los vectores son perpendiculares.';
    if(n===5){const a=rng.noCero(-6,6),b=rng.noCero(-6,6),c=rng.noCero(-6,6);let k;
      // (a, b)·(c, k) = 0 → k = −ac/b
      k=-a*c/b;return {enunciado:`¿Cuánto vale k para que \\(${vec([a,b])}\\) y \\(${vec([c,'k'])}\\) sean perpendiculares?`,respuesta:`k = ${frac(-a*c,b,{tex:false})}`,verificar:e=>igualNum(e,k),
        pasos:[`Perpendiculares: producto punto 0`,`\\(${a}\\cdot${par(c)} + ${b}k = 0\\)`,`\\(k = ${frac(-a*c,b)}\\)`],errores:[{valor:`k = ${frac(a*c,b,{tex:false})}`,si:e=>igualNum(e,a*c/b)&&a*c!==0,por:'Revisa el signo al despejar k.'}],regla:R,pista:'Iguala el producto punto a 0.',teclado:'mat'}}
    const d=n<=2?2:3,u=vecAl(rng,d,n===1?5:9),v=vecAl(rng,d,n===1?5:9),r=u.reduce((s,x,i)=>s+x*v[i],0);
    return {enunciado:`Calcula \\(${vec(u)} \\cdot ${vec(v)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),
      pasos:[`\\(${u.map((x,i)=>`${par(x)}\\cdot${par(v[i])}`).join(' + ')}\\)`,`\\(${u.map((x,i)=>par(x*v[i])).join(' + ')} = ${r}\\)`],
      pasoMal:{i:1,texto:`\\(${u.map((x,i)=>par(x*v[i])).join(' + ')} = ${r+(r%2?1:2)}\\)`,por:'la suma está mal hecha.'},
      errores:[{valor:String(u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0)),si:e=>igualNum(e,u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0))&&u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0)!==r,por:'No se suman todas las componentes: se multiplica por pares y luego se suma.'},
        {si:e=>/[(,]/.test(String(e)),por:'El producto punto es un número, no un vector.'}],
      regla:R,pista:'Primera por primera, segunda por segunda… y suma.',teclado:'mat'};
  }
};

// Ángulo entre dos vectores en grados (con 1 decimal)
const angulo={
  titulo:'Ángulo entre vectores',
  explicacion:'cos θ = u·v / (‖u‖‖v‖); luego θ = arccos(…). Si u·v = 0, son perpendiculares (90°).',
  generar(n,rng){
    const FACILES=[[[1,0],[0,1]],[[1,0],[1,1]],[[1,1],[-1,1]],[[2,0],[-3,0]],[[1,0],[1,0]],[[3,0],[2,2]],[[0,4],[3,3]],[[1,0],[-1,1]]];
    let u,v;
    if(n<=2){const k1=rng.entero(1,n===1?3:5),k2=rng.entero(1,n===1?3:5),s=rng.signo();[u,v]=rng.elegir(FACILES).map((x,i)=>x.map(y=>y*(i?k2:k1*s)))}
    else{const d=n>=4?3:2;do{u=vecAl(rng,d,5);v=vecAl(rng,d,5)}while(u.every(x=>!x)||v.every(x=>!x))}
    const dot=u.reduce((s,x,i)=>s+x*v[i],0),nu=Math.hypot(...u),nv=Math.hypot(...v),ang=Math.acos(Math.max(-1,Math.min(1,dot/(nu*nv))))*180/Math.PI;
    const r=Math.round(ang*10)/10;
    return {enunciado:`Ángulo entre \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\), en grados (1 decimal)`,respuesta:String(r),verificar:e=>Math.abs(num(String(e).replace('°',''))-ang)<=0.15,
      pasos:[`\\(u\\cdot v = ${dot}\\)`,`\\(\\lVert u\\rVert = ${nu.toFixed(3)},\\ \\lVert v\\rVert = ${nv.toFixed(3)}\\)`,`\\(\\cos\\theta = \\dfrac{${dot}}{${(nu*nv).toFixed(3)}} = ${(dot/(nu*nv)).toFixed(4)}\\)`,`\\(\\theta = ${r}^\\circ\\)`],
      errores:[{valor:String(Math.round((180-ang)*10)/10),si:e=>Math.abs(num(e)-(180-ang))<=0.15&&Math.abs(ang-90)>0.2,por:'Revisa el signo del producto punto: si es negativo, el ángulo es mayor de 90°.'}],
      regla:'cos θ = u·v / (‖u‖·‖v‖). Producto punto 0 → 90°; positivo → agudo; negativo → obtuso.',pista:'Primero el producto punto y las dos normas.',teclado:'mat'};
  }
};

// Producto de matrices: 2×2 (1–3), 2×3 · 3×2 (4), 3×3 (5)
const productoMatrices={
  titulo:'Multiplicación de matrices',
  explicacion:'Cada casilla (i, j) del resultado es el producto punto de la fila i de A con la columna j de B.',
  generar(n,rng){
    const [f,k,c]=n<=3?[2,2,2]:n===4?[2,3,2]:[3,3,3],R=n===1?3:n<=3?6:5;
    const A=Array.from({length:f},()=>vecAl(rng,k,R)),B=Array.from({length:k},()=>vecAl(rng,c,R));
    const C=A.map(fi=>Array.from({length:c},(_,j)=>fi.reduce((s,x,t)=>s+x*B[t][j],0)));
    const elem=f===k&&k===c?A.map((fi,i)=>fi.map((x,j)=>x*B[i][j])):null;
    return {...comoMatriz(C),enunciado:`Calcula \\(AB\\) con \\(A = ${mat(A)}\\) y \\(B = ${mat(B)}\\)`,
      pasos:[`Casilla (1,1): fila 1 de A por columna 1 de B: \\(${A[0].map((x,t)=>`${par(x)}\\cdot${par(B[t][0])}`).join(' + ')} = ${C[0][0]}\\)`,`Repite para cada fila de A y columna de B`,`\\(AB = ${mat(C)}\\)`],
      errores:elem?[{si:e=>celdasIguales(e,elem.flat()),por:'Multiplicaste casilla por casilla: cada casilla es fila por columna (un producto punto).'}]:[],
      regla:'(AB)ᵢⱼ = fila i de A · columna j de B. Solo se puede multiplicar si las columnas de A son tantas como las filas de B.',pista:'Fila por columna, como un producto punto.'};
  }
};

const det2=M=>M[0][0]*M[1][1]-M[0][1]*M[1][0];
const det3=M=>M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
// Determinante 2×2 (1–3) y 3×3 (4–5)
const determinante={
  titulo:'Determinantes',
  explicacion:'2×2: ad − bc. 3×3: por cofactores de la primera fila (o regla de Sarrus).',
  generar(n,rng){
    const d=n<=3?2:3,R=n===1?5:n<=3?9:5,M=Array.from({length:d},()=>vecAl(rng,d,R));
    if(d===2){const r=det2(M),[[a,b],[c,dd]]=M;
      return {enunciado:`Calcula \\(\\det ${mat(M)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),
        pasos:[`\\(ad - bc = ${par(a)}\\cdot${par(dd)} - ${par(b)}\\cdot${par(c)}\\)`,`\\(${a*dd} - ${par(b*c)} = ${r}\\)`],
        pasoMal:{i:1,texto:`\\(${a*dd} + ${par(b*c)} = ${a*dd+b*c}\\)`,por:'se suma bc en vez de restarlo.'},
        errores:[{valor:String(a*dd+b*c),si:e=>igualNum(e,a*dd+b*c)&&b*c!==0,por:'Es ad − bc: el segundo producto se resta.'},{valor:String(a*b-c*dd),si:e=>igualNum(e,a*b-c*dd)&&a*b-c*dd!==r,por:'Multiplica las diagonales: a·d (principal) menos b·c (secundaria).'}],
        regla:'det de una 2×2 = ad − bc (diagonal principal menos diagonal secundaria).',pista:'Diagonal principal menos diagonal secundaria.',teclado:'mat'}}
    const r=det3(M),c=[M[1][1]*M[2][2]-M[1][2]*M[2][1],M[1][0]*M[2][2]-M[1][2]*M[2][0],M[1][0]*M[2][1]-M[1][1]*M[2][0]];
    return {enunciado:`Calcula \\(\\det ${mat(M)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),
      pasos:[`Cofactores de la fila 1 (signos +, −, +)`,`\\(${par(M[0][0])}\\cdot(${c[0]}) - ${par(M[0][1])}\\cdot(${c[1]}) + ${par(M[0][2])}\\cdot(${c[2]})\\)`,`\\(= ${r}\\)`],
      errores:[{valor:String(M[0][0]*c[0]+M[0][1]*c[1]+M[0][2]*c[2]),si:e=>igualNum(e,M[0][0]*c[0]+M[0][1]*c[1]+M[0][2]*c[2])&&M[0][1]*c[1]!==0,por:'Los signos de los cofactores alternan: +, −, +.'}],
      regla:'det 3×3 por la primera fila: a₁₁·M₁₁ − a₁₂·M₁₂ + a₁₃·M₁₃ (cada M es el determinante 2×2 que queda al tachar su fila y columna).',pista:'Signos alternados: + − +.',teclado:'mat'};
  }
};

// Inversa 2×2: det ±1 (1–2, enteros) y fracciones (3–5)
const inversa={
  titulo:'Inversa de una matriz 2×2',
  explicacion:'A⁻¹ = (1/det)·(d −b; −c a): intercambia la diagonal, cambia de signo la otra y divide entre el determinante.',
  generar(n,rng){
    let M,D;
    do{M=Array.from({length:2},()=>vecAl(rng,2,n<=2?4:7));D=det2(M)}while(D===0||(n<=2&&Math.abs(D)!==1)||(n>2&&Math.abs(D)===1));
    const [[a,b],[c,d]]=M,adj=[[d,-b],[-c,a]],inv=adj.map(f=>f.map(x=>x/D));
    const txt=adj.map(f=>f.map(x=>frac(x,D,{tex:false})));
    return {forma:{filas:2,cols:2},celdas:txt.flat(),respuesta:`\\(${mat(adj.map(f=>f.map(x=>frac(x,D))))}\\)`,verificar:e=>celdasIguales(e,inv.flat()),
      enunciado:`Calcula la inversa de \\(A = ${mat(M)}\\)${n>2?'<br><span class="nota">Las fracciones se escriben como 3/2.</span>':''}`,
      pasos:[`\\(\\det A = ${a}\\cdot${par(d)} - ${par(b)}\\cdot${par(c)} = ${D}\\)`,`Intercambia la diagonal y cambia el signo de la otra: \\(${mat(adj)}\\)`,`Divide entre ${D}: \\(${mat(adj.map(f=>f.map(x=>frac(x,D))))}\\)`],
      errores:[{si:e=>D!==1&&celdasIguales(e,adj.flat()),por:`Falta dividir entre el determinante (${D}).`},{si:e=>celdasIguales(e,[[a,b],[c,d]].flat().map(x=>x/D)),por:'Hay que intercambiar la diagonal principal y cambiar el signo de la secundaria.'}],
      regla:'A⁻¹ = (1/det A)·[[d, −b], [−c, a]]. Solo existe si det A ≠ 0.',pista:'Primero el determinante.'};
  }
};

// Sistemas por Gauss: 2×2 (1–2) y 3×3 (3–5), solución entera
const gauss={
  titulo:'Sistemas por Gauss',
  explicacion:'Escribe la matriz aumentada, haz ceros debajo de la diagonal con operaciones entre filas y despeja de abajo hacia arriba.',
  generar(n,rng){
    const d=n<=2?2:3,R=n<=3?4:6,X=vecAl(rng,d,n<=3?5:8);let A;
    do A=Array.from({length:d},()=>vecAl(rng,d,R));while((d===2?det2(A):det3(A))===0||(n===3&&A[0][0]===0));
    const b=A.map(f=>f.reduce((s,x,i)=>s+x*X[i],0)),v=d===2?['x','y']:['x','y','z'];
    const ecs=A.map((f,i)=>`${f.map((x,j)=>[x,v[j]]).reduce((s,[c,l])=>c?s+(s?(c<0?' - ':' + '):(c<0?'-':''))+(Math.abs(c)===1?'':Math.abs(c))+l:s,'')||'0'} = ${b[i]}`);
    return {...comoVector(X),enunciado:`Resuelve por Gauss (escribe ${v.join(', ')}):\\[\\begin{cases}${ecs.join(' \\\\ ')}\\end{cases}\\]`,
      pasos:[`Matriz aumentada: \\(\\left(\\begin{array}{${'c'.repeat(d)}|c}${A.map((f,i)=>[...f,b[i]].join(' & ')).join(' \\\\ ')}\\end{array}\\right)\\)`,`Haz ceros debajo de la diagonal restando múltiplos de la fila 1${d===3?' (y luego de la fila 2)':''}`,`Despeja de abajo hacia arriba: \\(${v.map((l,i)=>`${l} = ${X[i]}`).join(',\\ ')}\\)`],
      errores:[{si:e=>Array.isArray(e)&&celdasIguales([...e].reverse(),X),por:`Escribe los valores en orden: ${v.join(', ')}.`}],
      regla:'Gauss: con operaciones entre filas (sumar a una fila un múltiplo de otra) se deja la matriz escalonada; luego se despeja de abajo hacia arriba.',pista:'Usa la fila 1 para hacer cero la x de las demás.'};
  }
};

export default {'al/vector-magnitud':magnitud,'al/vector-operaciones':operaciones,'al/producto-punto':productoPunto,'al/angulo':angulo,
  'al/matriz-producto':productoMatrices,'al/determinante':determinante,'al/inversa':inversa,'al/gauss':gauss};
