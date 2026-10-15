/* Generadores del tema Álgebra lineal (parte 2): producto cruz, Gauss-Jordan, espacios vectoriales (combinaciones lineales),
   independencia lineal y bases, transformaciones lineales, valores y vectores propios.
   3 plantillas por nivel (p.plantilla) y comprobar() con un segundo cálculo independiente. Sin DOM. */
import {num,casi,igualNum,lista,equivalente,limpiar} from './verificar.js';
import {frac,par,mat,vec,lineal,polinomio} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt,sg} from './algebra-temas.js';
import {celdasIguales,vecAl,comoVector,comoMatriz,det2,det3} from './algebra-lineal.js';

const cruz=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const punto=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
const norma=v=>Math.hypot(...v);
// Compara números calculados (sin pasar por el lector de texto, que no entiende 1e-16)
const iguales=(a,b)=>a.length===b.length&&a.every((x,i)=>Math.abs(x-(typeof b[i]==='number'?b[i]:Number(b[i])))<1e-9);
const resta=(a,b)=>a.map((x,i)=>x-b[i]);
const mulMV=(A,v)=>A.map(f=>punto(f,v));
const mulMM=(A,B)=>A.map(f=>B[0].map((_,j)=>f.reduce((s,x,t)=>s+x*B[t][j],0)));
const noCeroV=v=>v.some(x=>x!==0);
// Número que puede ser raíz: acepta √n exacta o el decimal con 2 cifras
const raizTxt=s=>{const r=Math.sqrt(s);return Number.isInteger(r)?String(r):`√${s}`};
const verRaiz=(valor)=>e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-valor)<=(Number.isInteger(valor)?1e-9:0.01)};
// sí / no
const esSi=e=>/^\s*(s[ií]|independientes?|verdadero|cierto)(?![a-zñáéíóú])/i.test(limpiar(e));
const esNo=e=>/^\s*(no|dependientes?|falso)(?![a-zñáéíóú])/i.test(limpiar(e));
const siNo=v=>v?esSi:esNo;
const NOTA_RAIZ='<br><span class="nota">Puedes escribir √n o el decimal con 2 cifras.</span>';

/* ---------- Producto cruz ---------- */
const R_CRUZ='u × v = (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁). Es perpendicular a u y a v, y su norma es el área del paralelogramo que forman.';
const pasosCruz=(u,v,w)=>[paso('Primera componente: tapa la primera columna',`\\(${par(u[1])}\\cdot${par(v[2])} - ${par(u[2])}\\cdot${par(v[1])} = ${c(w[0])}\\)`,'u₂v₃ − u₃v₂.'),
  paso('Segunda componente (ojo con el orden)',`\\(${par(u[2])}\\cdot${par(v[0])} - ${par(u[0])}\\cdot${par(v[2])} = ${c(w[1])}\\)`,'u₃v₁ − u₁v₃.',{ojo:'Es la que más se equivoca: el signo de la segunda componente.'}),
  paso('Tercera componente',`\\(${par(u[0])}\\cdot${par(v[1])} - ${par(u[1])}\\cdot${par(v[0])} = ${c(w[2])}\\)`,'u₁v₂ − u₂v₁.')];
const productoCruz={
  titulo:'Producto cruz',
  explicacion:'El producto cruz de dos vectores de ℝ³ da otro vector, perpendicular a los dos. Se calcula componente por componente con "determinantes 2×2"; su norma es el área del paralelogramo que forman.',
  alternativa:'Piensa en apretar un tornillo: si giras de u hacia v, el tornillo avanza en la dirección de u × v (regla de la mano derecha). Por eso u × v = −(v × u): girar al revés lo hace avanzar al revés. Y si u y v apuntan igual, no hay giro: el resultado es el vector cero.',
  referencia:'Ver: Grossman, Álgebra lineal, sec. 4.4; Stewart, Cálculo, sec. 12.4.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const vectorRes=(enun,u,v,extraPasos=[],w=cruz(u,v))=>({...comoVector(w),enunciado:enun,pasos:[...extraPasos,...pasosCruz(u,v,w),final('Resultado',`\\(${c(vec(w))}\\)`,'Comprueba: el resultado es perpendicular a los dos (producto punto 0).',vec(w))],
      errores:[{si:e=>celdasIguales(e,w.map(x=>-x))&&noCeroV(w),por:'Te salió v × u: el orden importa (u × v = −v × u).'},{si:e=>celdasIguales(e,[w[0],-w[1],w[2]])&&w[1]!==0,por:'Revisa la segunda componente: es u₃v₁ − u₁v₃.'},{si:e=>celdasIguales(e,u.map((x,i)=>x*v[i])),por:'No es multiplicar componente a componente: usa la fórmula del producto cruz.'}],
      comprobar:()=>punto(w,u)===0&&punto(w,v)===0&&casi(norma(w)**2,norma(u)**2*norma(v)**2-punto(u,v)**2)});
    const numRes=(enun,valor,txt,pasos,errores,comprobar)=>({enunciado:enun,respuesta:txt,verificar:verRaiz(valor),pasos,errores,comprobar});
    const P={
      1:{
        'unitarios':()=>{const E=[[1,0,0],[0,1,0],[0,0,1]],nom=['i','j','k'],a=rng.entero(0,2);let b;do b=rng.entero(0,2);while(b===a);const k1=rng.elegir([1,2,3]),k2=rng.elegir([1,2,-1]);
          const u=E[a].map(x=>x*k1),v=E[b].map(x=>x*k2);return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)},
        'con-ceros':()=>{const u=[rng.entero(-4,4),0,rng.entero(-4,4)],v=[0,rng.noCero(-4,4),rng.entero(-4,4)];return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)},
        'pequenos':()=>{let u,v;do{u=vecAl(rng,3,2);v=vecAl(rng,3,2)}while(!noCeroV(cruz(u,v)));return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)}
      },
      2:{
        'general':()=>{let u,v;do{u=vecAl(rng,3,5);v=vecAl(rng,3,5)}while(!noCeroV(cruz(u,v)));return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)},
        'paralelos':()=>{let u;do u=vecAl(rng,3,4);while(!noCeroV(u));const k=rng.elegir([2,3,-1,-2]),v=u.map(x=>k*x);
          return {...vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v,[paso('Observa: v = '+k+'u',`\\(${vec(v)} = ${k}\\cdot${vec(u)}\\)`,'Son paralelos: el producto cruz de vectores paralelos es el vector cero.')])}},
        'orden-inverso':()=>{let u,v;do{u=vecAl(rng,3,4);v=vecAl(rng,3,4)}while(!noCeroV(cruz(u,v)));const w=cruz(u,v),r=w.map(x=>-x);
          return {...comoVector(r),enunciado:`Si \\(u \\times v = ${vec(w)}\\), ¿cuánto vale \\(v \\times u\\)?`,pasos:[paso('Propiedad anticonmutativa',`\\(v \\times u = -(u \\times v)\\)`,'Cambiar el orden cambia el sentido (regla de la mano derecha).'),final('Cambia el signo de cada componente',`\\(${c(vec(r))}\\)`,'Mismo tamaño, sentido contrario.',vec(r))],
            errores:[{si:e=>celdasIguales(e,w),por:'El producto cruz NO es conmutativo: v × u = −(u × v).'},{si:e=>celdasIguales(e,w.map(Math.abs)),por:'Se cambia el signo de todas, no se quitan los signos.'}],comprobar:()=>celdasIguales(cruz(v,u),r)}}
      },
      3:{
        'grandes':()=>{let u,v;do{u=vecAl(rng,3,8);v=vecAl(rng,3,8)}while(!noCeroV(cruz(u,v)));return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)},
        'area-paralelogramo':()=>{let u,v,w;do{u=vecAl(rng,3,4);v=vecAl(rng,3,4);w=cruz(u,v)}while(!noCeroV(w));const s=punto(w,w),a=Math.sqrt(s);
          return numRes(`Área del paralelogramo formado por \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)${NOTA_RAIZ}`,a,raizTxt(s),[...pasosCruz(u,v,w),paso('Norma del producto cruz',`\\(\\lVert ${vec(w)}\\rVert = \\sqrt{${s}}\\)`,'El área es la norma de u × v.'),final('Resultado',`\\(${c(raizTxt(s).replace('√','\\sqrt{')+(raizTxt(s).includes('√')?'}':''))}${Number.isInteger(a)?'':` \\approx ${a.toFixed(2)}`}\\)`,'Área del paralelogramo.',raizTxt(s))],
            [malNum(s,'Falta sacar la raíz.'),malNum(+(a/2).toFixed(2),'La mitad es el área del triángulo, no del paralelogramo.'),malNum(Math.abs(punto(u,v)),'Es la norma del producto CRUZ, no el producto punto.')],()=>casi(s,punto(u,u)*punto(v,v)-punto(u,v)**2))},
        'componente':()=>{let u,v,w;do{u=vecAl(rng,3,6);v=vecAl(rng,3,6);w=cruz(u,v)}while(!noCeroV(w));const k=rng.entero(0,2),nom=['primera','segunda','tercera'][k];
          return {enunciado:`¿Cuál es la <b>${nom}</b> componente de \\(u \\times v\\), con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)?`,respuesta:String(w[k]),verificar:e=>igualNum(e,w[k]),
            pasos:[pasosCruz(u,v,w)[k],final('Resultado',`\\(${c(w[k])}\\)`,'Solo esa componente.',String(w[k]))],errores:[malNum(-w[k],'Revisa el orden de la resta.'),malNum(u[k]*v[k],'No es componente por componente.'),malNum(w[(k+1)%3],'Esa es otra componente.')],comprobar:()=>cruz(u,v)[k]===w[k]}}
      },
      4:{
        'area-triangulo':()=>{let A,B,C,w;do{A=vecAl(rng,3,4);B=vecAl(rng,3,4);C=vecAl(rng,3,4);w=cruz(resta(B,A),resta(C,A))}while(!noCeroV(w));const s=punto(w,w),a=Math.sqrt(s)/2,txt=Number.isInteger(a)?String(a):Number.isInteger(Math.sqrt(s))?numTxt(a):`√${s}/2`;
          return numRes(`Área del triángulo con vértices \\(A = ${vec(A)}\\), \\(B = ${vec(B)}\\), \\(C = ${vec(C)}\\)${NOTA_RAIZ}`,a,txt,[paso('Vectores desde A',`\\(AB = ${vec(resta(B,A))},\\ AC = ${vec(resta(C,A))}\\)`,'Dos lados del triángulo.'),paso('Producto cruz',`\\(AB \\times AC = ${c(vec(w))}\\)`,'Su norma es el área del paralelogramo.'),final('La mitad de la norma',`\\(\\dfrac{\\sqrt{${s}}}{2} \\approx ${c(a.toFixed(2))}\\)`,'El triángulo es medio paralelogramo.',txt)],
            [malNum(+Math.sqrt(s).toFixed(2),'Esa es el área del paralelogramo: el triángulo es la mitad.'),malNum(s/2,'Falta la raíz.'),malNum(+(s/4).toFixed(2),'Saca la raíz antes de dividir.')],()=>casi(4*a*a,punto(w,w)))},
        'normal-plano':()=>{let A,B,C,w;do{A=vecAl(rng,3,3);B=vecAl(rng,3,3);C=vecAl(rng,3,3);w=cruz(resta(B,A),resta(C,A))}while(!noCeroV(w));const u=resta(B,A),v=resta(C,A);
          return vectorRes(`Un vector normal al plano que pasa por \\(A = ${vec(A)}\\), \\(B = ${vec(B)}\\) y \\(C = ${vec(C)}\\) es \\(AB \\times AC\\). Calcúlalo.`,u,v,[paso('Vectores sobre el plano',`\\(AB = ${vec(u)},\\ AC = ${vec(v)}\\)`,'B − A y C − A.')])},
        'negativos':()=>{let u,v;do{u=vecAl(rng,3,9).map(x=>-Math.abs(x));v=vecAl(rng,3,9)}while(!noCeroV(cruz(u,v)));return vectorRes(`Calcula \\(u \\times v\\) con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,u,v)}
      },
      5:{
        'volumen':()=>{let u,v,w,t;do{u=vecAl(rng,3,4);v=vecAl(rng,3,4);w=vecAl(rng,3,4);t=punto(u,cruz(v,w))}while(t===0);const V=Math.abs(t);
          return numRes(`Volumen del paralelepípedo formado por \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\) y \\(w = ${vec(w)}\\)`,V,String(V),[paso('Producto cruz v × w',`\\(${c(vec(cruz(v,w)))}\\)`,'Primero el cruz.'),paso('Producto punto con u',`\\(u\\cdot(v\\times w) = ${c(t)}\\)`,'Producto mixto.'),final('Valor absoluto',`\\(V = |${t}| = ${c(V)}\\)`,'Un volumen no es negativo.',String(V))],
            [malNum(-V,'El volumen es el valor absoluto.'),malNum(+norma(cruz(v,w)).toFixed(2),'Falta el producto punto con u.'),malNum(punto(u,v)+punto(v,w),'Es u · (v × w).')],()=>Math.abs(det3([u,v,w]))===V)},
        'coplanares':()=>{let u,v,w;const cop=rng.prob(0.5);do{u=vecAl(rng,3,4);v=vecAl(rng,3,4);w=cop?u.map((x,i)=>rng.elegir([1,2,-1])*0+x+2*v[i]):vecAl(rng,3,4)}while(!noCeroV(cruz(u,v))||(!cop&&det3([u,v,w])===0));const t=punto(u,cruz(v,w));
          return {enunciado:`¿Están en un mismo plano (son coplanares) \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\) y \\(w = ${vec(w)}\\)? Responde sí o no.`,respuesta:t===0?'Sí':'No',verificar:siNo(t===0),
            pasos:[paso('Producto mixto',`\\(u\\cdot(v\\times w) = ${c(t)}\\)`,'Es el volumen (con signo) que forman.'),final('Interpreta',t===0?'Volumen 0: están en un plano.':'Volumen distinto de 0: no son coplanares.','Coplanares ⇔ producto mixto = 0.',t===0?'Sí':'No')],
            errores:[{valor:t===0?'No':'Sí',si:siNo(t!==0),por:t===0?'El producto mixto es 0: sí son coplanares.':'El producto mixto no es 0: no son coplanares.'}],comprobar:()=>(det3([u,v,w])===0)===(t===0)}},
        'area-3d-entera':()=>{const triples=[[1,2,2,3],[2,3,6,7],[1,4,8,9],[2,6,9,11]];const t=rng.elegir(triples),k=rng.entero(1,3),u=[k,0,0];const w0=[0,...rng.barajar([t[1],t[2]])];// u × v con u en x
          const v=[rng.entero(-3,3),-w0[2]/k,w0[1]/k];if(!Number.isInteger(v[1])||!Number.isInteger(v[2]))return P[5]['volumen']();const w=cruz(u,v),s=punto(w,w),a=Math.sqrt(s);
          return numRes(`Área del paralelogramo formado por \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)`,a,raizTxt(s),[...pasosCruz(u,v,w),final('Norma',`\\(\\sqrt{${s}} = ${c(raizTxt(s))}\\)`,'Área = ‖u × v‖.',raizTxt(s))],
            [malNum(s,'Falta la raíz.'),malNum(a/2,'Eso es el triángulo.'),malNum(Math.abs(punto(u,v)),'Es el producto cruz, no el punto.')],()=>casi(s,punto(u,u)*punto(v,v)-punto(u,v)**2))}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:R_CRUZ,pista:'Tapa una columna a la vez; la segunda componente va al revés.',teclado:'mat',...x};
  }
};

/* ---------- Gauss-Jordan ---------- */
// Reducción con fracciones (números): devuelve las operaciones y la matriz final
function gaussJordan(M0){
  const M=M0.map(f=>[...f]),ops=[],m=M.length,nc=M[0].length-1;let r=0;
  for(let col=0;col<nc&&r<m;col++){
    let p=r;while(p<m&&Math.abs(M[p][col])<1e-12)p++;if(p===m)continue;
    if(p!==r){[M[p],M[r]]=[M[r],M[p]];ops.push(`F_{${r+1}} \\leftrightarrow F_{${p+1}}`)}
    const pv=M[r][col];if(Math.abs(pv-1)>1e-12){M[r]=M[r].map(x=>x/pv);ops.push(`F_{${r+1}} \\leftarrow \\tfrac{1}{${numTxt(pv).replace(/(-?\d+)\/(\d+)/,'$1/$2')}}F_{${r+1}}`)}
    for(let i=0;i<m;i++)if(i!==r&&Math.abs(M[i][col])>1e-12){const k=M[i][col];M[i]=M[i].map((x,j)=>x-k*M[r][j]);ops.push(`F_{${i+1}} \\leftarrow F_{${i+1}} ${k<0?'+':'-'} ${numTxt(Math.abs(k))}F_{${r+1}}`)}
    r++;
  }
  return {M:M.map(f=>f.map(x=>Math.abs(x)<1e-12?0:x)),ops,rango:r};
}
const matTxt=M=>`\\left(\\begin{array}{${'c'.repeat(M[0].length-1)}|c}${M.map(f=>f.map(x=>{const t=numTxt(+x.toFixed(10));return t.includes('/')?`\\tfrac{${t.split('/')[0]}}{${t.split('/')[1]}}`:t}).join(' & ')).join(' \\\\ ')}\\end{array}\\right)`;
const matNum=M=>`\\begin{pmatrix}${M.map(f=>f.join(' & ')).join(' \\\\ ')}\\end{pmatrix}`;
const ecsTxt=(A,b,v)=>A.map((f,i)=>`${lineal(f.map((x,j)=>[x,v[j]]))} = ${b[i]}`);
const gaussJ={
  titulo:'Gauss-Jordan',
  explicacion:'Gauss-Jordan sigue reduciendo la matriz aumentada hasta que a la izquierda queda la identidad (unos en la diagonal y ceros arriba y abajo): entonces la última columna ES la solución. El número de filas con pivote es el rango.',
  alternativa:'Es ordenar el escritorio por completo: con Gauss dejas la escalera (ceros abajo) y luego despejas; con Gauss-Jordan sigues limpiando también hacia arriba, hasta que cada fila dice directamente "x = …", "y = …". Solo usas tres movimientos: cambiar filas, multiplicar una fila por un número y sumarle a una fila un múltiplo de otra.',
  referencia:'Ver: Grossman, Álgebra lineal, sec. 1.3; Lay, Álgebra lineal y sus aplicaciones, sec. 1.2.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const resolver=(A,X,{intercambio}={})=>{const d=A.length,v=['x','y','z'].slice(0,d),b=A.map(f=>punto(f,X)),{M,ops}=gaussJordan(A.map((f,i)=>[...f,b[i]]));
      return {...comoVector(X),enunciado:`Resuelve con Gauss-Jordan (escribe ${v.join(', ')}):\\[\\begin{cases}${ecsTxt(A,b,v).join(' \\\\ ')}\\end{cases}\\]`,
        pasos:[paso('Matriz aumentada',`\\(${matTxt(A.map((f,i)=>[...f,b[i]]))}\\)`,'Coeficientes | resultados.'),
          paso('Operaciones entre filas',`\\(${ops.slice(0,6).join(',\\ ')}${ops.length>6?',\\ \\dots':''}\\)`,intercambio?'Primero intercambia filas para tener un pivote distinto de 0.':'Pivote en 1 y ceros arriba y abajo, columna por columna.'),
          paso('Forma escalonada reducida',`\\(${matTxt(M)}\\)`,'A la izquierda queda la identidad.'),final('Lee la solución',`\\(${v.map((l,i)=>`${l} = ${c(X[i])}`).join(',\\ ')}\\)`,'La última columna es la solución.',X.join(', '))],
        errores:[{si:e=>Array.isArray(e)&&celdasIguales([...e].reverse(),X)&&X.join()!==[...X].reverse().join(),por:`Escribe los valores en orden: ${v.join(', ')}.`},{si:e=>Array.isArray(e)&&celdasIguales(e,X.map(x=>-x))&&X.some(Boolean),por:'Revisa los signos de las operaciones entre filas.'}],
        comprobar:()=>A.every((f,i)=>punto(f,X)===b[i])&&M.every((f,i)=>f.slice(0,d).every((x,j)=>casi(x,i===j?1:0))&&casi(f[d],X[i]))}};
    const inv=A=>(A.length===2?det2(A):det3(A))!==0;
    const P={
      1:{
        '2x2':()=>{let A;do A=[[1,rng.entero(-3,3)],[rng.entero(-3,3),rng.entero(1,4)]];while(!inv(A));return resolver(A,vecAl(rng,2,6))},
        'diagonal':()=>{const A=[[rng.noCero(-4,4),0,0],[0,rng.noCero(-4,4),0],[0,0,rng.noCero(-4,4)]];return resolver(A,vecAl(rng,3,5))},
        'triangular':()=>{const A=[[1,rng.entero(-2,2),rng.entero(-2,2)],[0,1,rng.entero(-2,2)],[0,0,1]];return resolver(A,vecAl(rng,3,5))}
      },
      2:{
        '2x2-coef':()=>{let A;do A=[[rng.noCero(-4,4),rng.entero(-4,4)],[rng.entero(-4,4),rng.noCero(-4,4)]];while(!inv(A));return resolver(A,vecAl(rng,2,6))},
        'intercambio':()=>{let A;do A=[[0,rng.noCero(-3,3),rng.entero(-2,2)],[1,rng.entero(-2,2),rng.entero(-2,2)],[rng.entero(-2,2),rng.entero(-2,2),rng.noCero(1,3)]];while(!inv(A));return resolver(A,vecAl(rng,3,4),{intercambio:true})},
        '3x3-uno':()=>{let A;do A=[[1,rng.entero(-2,2),rng.entero(-2,2)],[rng.entero(-2,2),1,rng.entero(-2,2)],[rng.entero(-2,2),rng.entero(-2,2),1]];while(!inv(A));return resolver(A,vecAl(rng,3,4))}
      },
      3:{
        '3x3':()=>{let A;do A=Array.from({length:3},()=>vecAl(rng,3,3));while(!inv(A)||A[0][0]===0);return resolver(A,vecAl(rng,3,5))},
        'con-ceros':()=>{let A;do A=[[rng.noCero(-3,3),0,rng.entero(-3,3)],[0,rng.noCero(-3,3),rng.entero(-3,3)],[rng.entero(-3,3),rng.entero(-3,3),0]];while(!inv(A));return resolver(A,vecAl(rng,3,5))},
        'rango':()=>{const r=rng.elegir([1,2,3]);let A;do{const f1=vecAl(rng,3,3),f2=vecAl(rng,3,3);A=r===3?[f1,f2,vecAl(rng,3,3)]:r===2?[f1,f2,f1.map((x,i)=>x+rng.elegir([1,-1,2])*0+f2[i])]:[f1,f1.map(x=>2*x),f1.map(x=>-x)]}while(gaussJordan(A.map(f=>[...f,0])).rango!==r||!noCeroV(A[0]));
          return {enunciado:`¿Cuál es el rango de \\(${matNum(A)}\\)?`,respuesta:String(r),verificar:e=>igualNum(e,r),pasos:[paso('Escalona la matriz',`\\(${gaussJordan(A.map(f=>[...f,0])).ops.slice(0,5).join(',\\ ')||'\\text{ya está}'}\\)`,'Ceros debajo de cada pivote.'),final('Cuenta las filas que no son cero',`\\(\\text{rango} = ${c(r)}\\)`,'Rango = número de pivotes.',String(r))],
            errores:[malNum(3,'Una fila es combinación de otras: al escalonar se vuelve cero.'),malNum(r===1?2:1,'Cuenta las filas con pivote después de escalonar.'),malNum(0,'Solo la matriz cero tiene rango 0.')],comprobar:()=>gaussJordan(A.map(f=>[...f,0])).rango===r&&(r<3)===(det3(A)===0)}}
      },
      4:{
        '3x3-grandes':()=>{let A;do A=Array.from({length:3},()=>vecAl(rng,3,5));while(!inv(A)||A[0][0]===0);return resolver(A,vecAl(rng,3,6))},
        'intercambio-grande':()=>{let A;do A=[[0,rng.noCero(-5,5),rng.entero(-5,5)],vecAl(rng,3,5),vecAl(rng,3,5)];while(!inv(A));return resolver(A,vecAl(rng,3,6),{intercambio:true})},
        'tipo-solucion':()=>{const f1=[1,rng.entero(-3,3),rng.entero(-3,3)],f2=[0,1,rng.entero(-3,3)],tipo=rng.elegir(['única','infinitas','ninguna']);const X=vecAl(rng,3,4);
          let A,b;if(tipo==='única'){A=[f1,f2,[0,0,rng.noCero(1,3)]];b=A.map(f=>punto(f,X))}else{A=[f1,f2,f1.map((x,i)=>x+f2[i])];b=[punto(f1,X),punto(f2,X)];b.push(tipo==='infinitas'?b[0]+b[1]:b[0]+b[1]+rng.noCero(-4,4))}
          const resp={única:'Una solución',infinitas:'Infinitas soluciones',ninguna:'No tiene solución'}[tipo],ver={única:/una|única|unica|1/i,infinitas:/infinit/i,ninguna:/no tiene|ningun|sin soluci|0/i}[tipo];
          return {enunciado:`¿Cuántas soluciones tiene?\\[\\begin{cases}${ecsTxt(A,b,['x','y','z']).join(' \\\\ ')}\\end{cases}\\]<span class="nota">Responde: una solución, infinitas o no tiene solución.</span>`,respuesta:resp,verificar:e=>ver.test(e),
            pasos:[paso('Escalona',`\\(${matTxt(gaussJordan(A.map((f,i)=>[...f,b[i]])).M)}\\)`,'Reduce y mira la última fila.'),final('Interpreta',tipo==='única'?'Tres pivotes: una solución.':tipo==='infinitas'?'Fila 0 = 0: una variable libre, infinitas soluciones.':'Fila 0 = número: contradicción, sin solución.','Rango de A vs. rango de la aumentada.',resp)],
            errores:[{valor:tipo==='ninguna'?'Infinitas soluciones':'No tiene solución',si:e=>tipo==='ninguna'?/infinit/i.test(e):/no tiene|ningun/i.test(e),por:tipo==='ninguna'?'La última fila dice 0 = un número distinto de 0: imposible.':'Revisa la última fila: no hay contradicción.'},{valor:tipo==='única'?'Infinitas soluciones':'Una solución',si:e=>tipo==='única'?/infinit/i.test(e):/^\s*(una|única|1)\b/i.test(e),por:tipo==='única'?'Hay tres pivotes: la solución es única.':'La tercera fila no aporta pivote.'}],
            comprobar:()=>{const ra=gaussJordan(A.map(f=>[...f,0])).rango,rb=gaussJordan(A.map((f,i)=>[...f,b[i],0])).rango;return tipo==='única'?ra===3:tipo==='infinitas'?ra===rb&&ra<3:rb>ra}}}
      },
      5:{
        'inversa-3x3':()=>{let A;do A=[[1,rng.entero(-2,2),rng.entero(-2,2)],[0,1,rng.entero(-2,2)],[rng.entero(-1,1),rng.entero(-1,1),1]];while(Math.abs(det3(A))!==1);
          const I=A.map((f,i)=>[...f,...[0,1,2].map(j=>i===j?1:0)]),R=I.map(f=>[...f]);// Gauss-Jordan sobre [A | I]
          for(let col=0;col<3;col++){let p=col;while(R[p][col]===0)p++;[R[p],R[col]]=[R[col],R[p]];const pv=R[col][col];R[col]=R[col].map(x=>x/pv);for(let i=0;i<3;i++)if(i!==col){const k=R[i][col];R[i]=R[i].map((x,j)=>x-k*R[col][j])}}
          const Inv=R.map(f=>f.slice(3).map(x=>Math.round(x)));
          return {...comoMatriz(Inv),enunciado:`Calcula \\(A^{-1}\\) con Gauss-Jordan sobre \\([A\\,|\\,I]\\), \\(A = ${matNum(A)}\\)`,
            pasos:[paso('Escribe [A | I]',`\\(\\left(\\begin{array}{ccc|ccc}${I.map(f=>f.join(' & ')).join(' \\\\ ')}\\end{array}\\right)\\)`,'La identidad a la derecha.'),paso('Reduce hasta tener I a la izquierda',`\\(\\left(\\begin{array}{ccc|ccc}${R.map(f=>f.map(x=>Math.round(x)).join(' & ')).join(' \\\\ ')}\\end{array}\\right)\\)`,'Las mismas operaciones afectan a la derecha.'),final('La derecha es la inversa',`\\(${c(matNum(Inv))}\\)`,'Comprueba: A·A⁻¹ = I.',Inv.flat().join(', '))],
            errores:[{si:e=>celdasIguales(e,A.flat()),por:'Esa es A: la inversa queda a la derecha al final.'},{si:e=>celdasIguales(e,A[0].map((_,j)=>A.map(f=>f[j])).flat()),por:'La transpuesta no es la inversa.'}],
            comprobar:()=>mulMM(A,Inv).every((f,i)=>f.every((x,j)=>x===(i===j?1:0)))}},
        'variables-libres':()=>{const f1=[1,rng.entero(-3,3),rng.entero(-3,3)],k=rng.elegir([1,2]);const A=k===1?[f1,[0,1,rng.entero(-3,3)],[1,f1[1]+1,f1[2]+0].map((x,i)=>f1[i]+[0,1,0][i]*0+(i===1?0:0))]:[f1,f1.map(x=>2*x),f1.map(x=>-x)];
          const r=gaussJordan(A.map(f=>[...f,0])).rango,lib=3-r;
          return {enunciado:`El sistema homogéneo con matriz \\(${matNum(A)}\\) (igualado a 0), ¿cuántas variables libres tiene?`,respuesta:String(lib),verificar:e=>igualNum(e,lib),
            pasos:[paso('Escalona y cuenta pivotes',`\\(\\text{rango} = ${c(r)}\\)`,'Pivotes = variables que se despejan.'),final('Libres = incógnitas − pivotes',`\\(3 - ${r} = ${c(lib)}\\)`,'Cada variable sin pivote es un parámetro.',String(lib))],
            errores:[malNum(r,'Ese es el rango; las libres son 3 − rango.'),malNum(0,'Hay filas que se anulan al escalonar.'),malNum(3,'No todas: las que tienen pivote se despejan.')],comprobar:()=>lib===3-gaussJordan(A.map(f=>[...f,0])).rango}},
        '3x3-fracciones':()=>{let A,X;do{A=Array.from({length:3},()=>vecAl(rng,3,4));X=[rng.entero(-6,6),rng.entero(-6,6),rng.entero(-6,6)]}while(!inv(A)||A[0][0]===0||Math.abs(A[0][0])===1);return resolver(A,X)}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Gauss-Jordan: con operaciones entre filas deja la identidad a la izquierda; la última columna es la solución. Rango = número de pivotes.',pista:'Pivote en 1 y ceros en el resto de su columna.',teclado:'mat',...x};
  }
};

/* ---------- Espacios vectoriales: combinaciones lineales y subespacios ---------- */
const parAB=e=>{const s=limpiar(e).toLowerCase(),m={};for(const t of s.matchAll(/([abc])\s*=\s*([^,;abc]+)/g))m[t[1]]=num(t[2]);if(Object.keys(m).length)return ['a','b','c'].filter(k=>k in m).map(k=>m[k]);return lista(s)};
const igualCoef=(e,vals)=>{const v=parAB(e);return v.length===vals.length&&v.every((x,i)=>casi(x,vals[i]))};
const combinacion={
  titulo:'Espacios vectoriales y combinaciones lineales',
  explicacion:'Una combinación lineal de u y v es a·u + b·v. El espacio generado (span) son todas esas combinaciones. Un subconjunto es subespacio si contiene al 0 y es cerrado bajo suma y multiplicación por escalar (por ejemplo, un plano que pasa por el origen).',
  alternativa:'Piensa en recetas: con "harina" (u) y "agua" (v) puedes hacer muchas masas distintas mezclando cantidades a y b. El span es todo lo que puedes cocinar con esos ingredientes. Preguntar si w está en el span es preguntar si existe una receta (a, b) que lo dé.',
  referencia:'Ver: Grossman, Álgebra lineal, cap. 5; Lay, sec. 1.3 y 4.1.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const coefRes=(enun,U,ab,extra={})=>{const w=U[0].map((_,i)=>U.reduce((s,u,k)=>s+ab[k]*u[i],0)),letras=['a','b','c'].slice(0,U.length),resp=letras.map((l,i)=>`${l} = ${ab[i]}`).join(', ');
      return {enunciado:enun(w),respuesta:resp,verificar:e=>igualCoef(e,ab),
        pasos:[paso('Plantea la combinación',`\\(${letras.map((l,i)=>`${l}${vec(U[i])}`).join(' + ')} = ${vec(w)}\\)`,'Igualdad componente a componente.'),paso('Sistema',`\\(\\begin{cases}${w.map((wi,i)=>`${lineal(U.map((u,k)=>[u[i],letras[k]]))} = ${wi}`).join(' \\\\ ')}\\end{cases}\\)`,'Una ecuación por componente.'),final('Resuelve',`\\(${letras.map((l,i)=>`${l} = ${c(ab[i])}`).join(',\\ ')}\\)`,'Comprueba sustituyendo.',resp)],
        errores:[{valor:letras.map((l,i)=>`${l} = ${ab[(i+1)%ab.length]}`).join(', '),si:e=>igualCoef(e,ab.map((_,i)=>ab[(i+1)%ab.length])),por:'Intercambiaste los coeficientes.'},{valor:letras.map((l,i)=>`${l} = ${-ab[i]}`).join(', '),si:e=>igualCoef(e,ab.map(x=>-x)),por:'Signos cambiados.'},{valor:w.slice(0,ab.length).join(', '),si:e=>igualCoef(e,w.slice(0,ab.length)),por:'Esas son las componentes de w, no los coeficientes.'}],
        comprobar:()=>w.every((wi,i)=>U.reduce((s,u,k)=>s+ab[k]*u[i],0)===wi),...extra}};
    const base2=()=>{let u,v;do{u=vecAl(rng,2,4);v=vecAl(rng,2,4)}while(det2([u,v])===0);return [u,v]};
    const P={
      1:{
        'escalar':()=>{let u;do u=vecAl(rng,3,5);while(!noCeroV(u));const k=rng.noCero(-5,5),w=u.map(x=>k*x);
          return {enunciado:`¿Por qué número hay que multiplicar \\(u = ${vec(u)}\\) para obtener \\(${vec(w)}\\)?`,respuesta:String(k),verificar:e=>igualNum(e,k),pasos:[paso('Divide una componente no nula',`\\(${w.find((x,i)=>u[i])}\\div${par(u.find(x=>x))} = ${c(k)}\\)`,'Todas las componentes se multiplican por el mismo número.'),final('Comprueba con las demás',`\\(${k}\\cdot${vec(u)} = ${vec(w)}\\)`,'Así w está en la recta generada por u.',String(k))],
            errores:[malNum(-k,'Revisa el signo.'),malNum(1/k,'Al revés: w = k·u.'),malNum(w.reduce((s,x)=>s+x,0),'No se suman las componentes.')],comprobar:()=>w.every((x,i)=>x===k*u[i])}},
        'evaluar':()=>{const [u,v]=base2(),a=rng.noCero(-3,3),b=rng.noCero(-3,3),w=u.map((x,i)=>a*x+b*v[i]);
          return {...comoVector(w),enunciado:`Calcula la combinación lineal \\(${a}u ${b<0?'-':'+'} ${Math.abs(b)}v\\) con \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\)`,pasos:[paso('Multiplica cada vector',`\\(${a}u = ${vec(u.map(x=>a*x))},\\ ${b}v = ${vec(v.map(x=>b*x))}\\)`,'Escalar por vector.'),final('Suma',`\\(${c(vec(w))}\\)`,'Componente a componente.',vec(w))],
            errores:[{si:e=>celdasIguales(e,u.map((x,i)=>x+v[i])),por:'Faltó multiplicar por los coeficientes.'},{si:e=>celdasIguales(e,u.map((x,i)=>a*x-b*v[i])),por:'Revisa el signo del segundo término.'}],comprobar:()=>w.every((x,i)=>x===a*u[i]+b*v[i])}},
        'combinacion-2d':()=>{const [u,v]=base2();return coefRes(w=>`Escribe \\(w = ${vec(w)}\\) como \\(a\\,u + b\\,v\\) con \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\). Escribe a, b.`,[u,v],[rng.entero(-4,4),rng.entero(-4,4)])}
      },
      2:{
        'combinacion-2d':()=>{const [u,v]=base2();return coefRes(w=>`Escribe \\(w = ${vec(w)}\\) como \\(a\\,u + b\\,v\\) con \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\). Escribe a, b.`,[u,v],[rng.noCero(-6,6),rng.noCero(-6,6)])},
        'en-la-recta':()=>{let u;do u=vecAl(rng,2,5);while(!u[0]||!u[1]);const esta=rng.prob(0.5),k=rng.noCero(-4,4),w=esta?u.map(x=>k*x):[k*u[0],k*u[1]+rng.noCero(-3,3)];
          return {enunciado:`¿Está \\(${vec(w)}\\) en el espacio generado por \\(u = ${vec(u)}\\) (la recta que pasa por el origen en esa dirección)? Responde sí o no.`,respuesta:esta?'Sí':'No',verificar:siNo(esta),
            pasos:[paso('¿Es un múltiplo de u?',`\\(${w[0]}\\div${par(u[0])} = ${numTxt(w[0]/u[0])},\\ ${w[1]}\\div${par(u[1])} = ${numTxt(w[1]/u[1])}\\)`,'Las dos componentes deben dar el mismo número.'),final(esta?'Mismo factor: sí está':'Factores distintos: no está',esta?`\\(${vec(w)} = ${k}u\\)`:'No existe un k que sirva para las dos.','El span de un vector son sus múltiplos.',esta?'Sí':'No')],
            errores:[{valor:esta?'No':'Sí',si:siNo(!esta),por:esta?`Sí: es ${k}·u.`:'Los cocientes no coinciden: no es múltiplo.'}],comprobar:()=>esta===(w[0]*u[1]===w[1]*u[0])}},
        'plano-origen':()=>{const nrm=vecAl(rng,3,4).map((x,i)=>i===2&&!x?1:x),esta=rng.prob(0.5);let p;do p=vecAl(rng,3,5);while((punto(nrm,p)===0)!==esta);
          return {enunciado:`El plano \\(${lineal([[nrm[0],'x'],[nrm[1],'y'],[nrm[2],'z']])} = 0\\) es un subespacio de \\(\\mathbb{R}^3\\). ¿Pertenece el vector \\(${vec(p)}\\)? Responde sí o no.`,respuesta:esta?'Sí':'No',verificar:siNo(esta),
            pasos:[paso('Sustituye',`\\(${nrm.map((a,i)=>`${par(a)}\\cdot${par(p[i])}`).join(' + ')} = ${c(punto(nrm,p))}\\)`,'Un punto está en el plano si cumple la ecuación.'),final('Interpreta',esta?'Da 0: sí pertenece.':'No da 0: no pertenece.','Cumple la ecuación ⇔ pertenece.',esta?'Sí':'No')],
            errores:[{valor:esta?'No':'Sí',si:siNo(!esta),por:'Sustituye x, y, z y mira si da 0.'}],comprobar:()=>esta===(punto(nrm,p)===0)}}
      },
      3:{
        'combinacion-3d':()=>{let U;do U=Array.from({length:3},()=>vecAl(rng,3,2));while(det3(U)===0);return coefRes(w=>`Escribe \\(w = ${vec(w)}\\) como \\(a\\,u + b\\,v + c\\,t\\) con \\(u = ${vec(U[0])}\\), \\(v = ${vec(U[1])}\\), \\(t = ${vec(U[2])}\\). Escribe a, b, c.`,U,vecAl(rng,3,3))},
        'es-subespacio':()=>{const casos=[['la recta \\(y = 2x\\) (en \\(\\mathbb{R}^2\\))',true,'Pasa por el origen y sumar o escalar puntos de la recta deja en la recta.'],['la recta \\(y = 2x + 1\\)',false,'No contiene al (0, 0).'],['el plano \\(x + y + z = 0\\)',true,'Pasa por el origen y es cerrado bajo suma y escalares.'],['el plano \\(x + y + z = 3\\)',false,'No contiene al origen.'],['los vectores \\((x, y)\\) con \\(x \\ge 0\\)',false,'(1, 0) está, pero −1·(1, 0) no: no es cerrado bajo escalares.'],['el conjunto \\(\\{(0, 0, 0)\\}\\)',true,'El subespacio cero: contiene al 0 y es cerrado.'],['los \\((x, y)\\) con \\(xy = 0\\) (los dos ejes)',false,'(1, 0) + (0, 1) = (1, 1) no está: no es cerrado bajo la suma.'],['los vectores \\((t, 2t, -t)\\)',true,'Es el span de (1, 2, −1).']];
          const [txt,es,porque]=rng.elegir(casos);
          return {enunciado:`Conjunto: ${txt}. ¿Es un subespacio vectorial? Responde sí o no.`,clave:txt,respuesta:es?'Sí':'No',verificar:siNo(es),pasos:[paso('Revisa las 3 condiciones',`¿Contiene al 0? ¿Es cerrado bajo la suma? ¿Y bajo la multiplicación por escalar?`,'Las tres tienen que cumplirse.'),final(es?'Cumple las tres':'Falla una',porque,'Con una sola que falle, ya no es subespacio.',es?'Sí':'No')],
            errores:[{valor:es?'No':'Sí',si:siNo(!es),por:porque}],comprobar:()=>true}},
        'dimension-span':()=>{const r=rng.elegir([1,2,3]);let U;do{const a=vecAl(rng,3,3),b=vecAl(rng,3,3);U=r===1?[a,a.map(x=>2*x),a.map(x=>-x)]:r===2?[a,b,a.map((x,i)=>x+b[i])]:[a,b,vecAl(rng,3,3)]}while(gaussJordan(U.map(f=>[...f,0])).rango!==r);
          return {enunciado:`¿Qué dimensión tiene el espacio generado por \\(${vec(U[0])}\\), \\(${vec(U[1])}\\) y \\(${vec(U[2])}\\)?`,respuesta:String(r),verificar:e=>igualNum(e,r),
            pasos:[paso('Ponlos como filas y escalona',`\\(${matNum(U)}\\)`,'Las filas que no se anulan son independientes.'),final('Dimensión = rango',`\\(${c(r)}\\)`,'Cuántos vectores independientes hay.',String(r))],
            errores:[malNum(3,'Son 3 vectores, pero no todos independientes.'),malNum(r===1?2:1,'Escalona para ver cuántos son independientes.'),malNum(0,'Solo el {0} tiene dimensión 0.')],comprobar:()=>gaussJordan(U.map(f=>[...f,0])).rango===r}}
      },
      4:{
        'combinacion-3d':()=>{let U;do U=Array.from({length:3},()=>vecAl(rng,3,3));while(det3(U)===0);return coefRes(w=>`Escribe \\(w = ${vec(w)}\\) como \\(a\\,u + b\\,v + c\\,t\\) con \\(u = ${vec(U[0])}\\), \\(v = ${vec(U[1])}\\), \\(t = ${vec(U[2])}\\). Escribe a, b, c.`,U,vecAl(rng,3,4))},
        'k-en-span':()=>{const u=[1,rng.entero(-3,3),rng.entero(-3,3)],v=[0,1,rng.entero(-3,3)],a=rng.noCero(-3,3),b=rng.noCero(-3,3),w=u.map((x,i)=>a*x+b*v[i]);
          return {enunciado:`¿Qué valor de k hace que \\((${w[0]}, ${w[1]}, k)\\) esté en el espacio generado por \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\)?`,respuesta:`k = ${w[2]}`,verificar:e=>igualNum(e,w[2]),
            pasos:[paso('Usa las dos primeras componentes para a y b',`\\(a = ${c(a)}\\) (primera) y \\(${u[1]}a + b = ${w[1]} \\Rightarrow b = ${c(b)}\\)`,'Dos ecuaciones, dos incógnitas.'),final('La tercera da k',`\\(k = ${a}\\cdot${par(u[2])} + ${b}\\cdot${par(v[2])} = ${c(w[2])}\\)`,'k tiene que coincidir con la combinación.',`k = ${w[2]}`)],
            errores:[malNum(a*u[2]-b*v[2],'Revisa el signo de b.'),malNum(u[2]+v[2],'Faltan los coeficientes a y b.'),malNum(0,'No cualquier k sirve: solo uno.')],comprobar:()=>det3([u,v,w])===0}},
        'dimension-span':()=>{const r=rng.elegir([1,2]);let U;do{const a=vecAl(rng,3,4),b=vecAl(rng,3,4);U=r===1?[a,a.map(x=>-3*x),a.map(x=>2*x)]:[a,b,a.map((x,i)=>2*x-b[i])]}while(gaussJordan(U.map(f=>[...f,0])).rango!==r);
          return {enunciado:`¿Qué dimensión tiene el espacio generado por \\(${vec(U[0])}\\), \\(${vec(U[1])}\\) y \\(${vec(U[2])}\\)?`,respuesta:String(r),verificar:e=>igualNum(e,r),
            pasos:[paso('Busca relaciones',r===1?'Todos son múltiplos del primero.':'El tercero es 2·(primero) − (segundo).','Un vector que es combinación de otros no aumenta la dimensión.'),final('Dimensión',`\\(${c(r)}\\)`,'Número de vectores independientes.',String(r))],
            errores:[malNum(3,'Hay vectores que dependen de otros.'),malNum(r===1?2:1,'Cuenta solo los independientes.'),malNum(0,'Hay vectores no nulos.')],comprobar:()=>gaussJordan(U.map(f=>[...f,0])).rango===r}}
      },
      5:{
        'combinacion-fracciones':()=>{let u,v;do{u=vecAl(rng,2,5);v=vecAl(rng,2,5)}while(Math.abs(det2([u,v]))<2);const w=vecAl(rng,2,6),D=det2([u,v]),a=(w[0]*v[1]-w[1]*v[0])/D,b=(u[0]*w[1]-u[1]*w[0])/D;
          return {enunciado:`Escribe \\(w = ${vec(w)}\\) como \\(a\\,u + b\\,v\\) con \\(u = ${vec(u)}\\), \\(v = ${vec(v)}\\). Escribe a, b (pueden ser fracciones).`,respuesta:`a = ${frac(w[0]*v[1]-w[1]*v[0],D,{tex:false})}, b = ${frac(u[0]*w[1]-u[1]*w[0],D,{tex:false})}`,verificar:e=>igualCoef(e,[a,b]),
            pasos:[paso('Sistema',`\\(\\begin{cases}${u[0]}a ${sg(v[0])}b = ${w[0]} \\\\ ${u[1]}a ${sg(v[1])}b = ${w[1]}\\end{cases}\\)`,'Una ecuación por componente.'),paso('Regla de Cramer',`\\(D = ${D},\\ a = \\dfrac{${w[0]*v[1]-w[1]*v[0]}}{${D}},\\ b = \\dfrac{${u[0]*w[1]-u[1]*w[0]}}{${D}}\\)`,'Determinantes 2×2.'),final('Simplifica',`\\(a = ${c(frac(w[0]*v[1]-w[1]*v[0],D))},\\ b = ${c(frac(u[0]*w[1]-u[1]*w[0],D))}\\)`,'Pueden quedar fracciones.',`a = ${frac(w[0]*v[1]-w[1]*v[0],D,{tex:false})}, b = ${frac(u[0]*w[1]-u[1]*w[0],D,{tex:false})}`)],
            errores:[{valor:`a = ${frac(u[0]*w[1]-u[1]*w[0],D,{tex:false})}, b = ${frac(w[0]*v[1]-w[1]*v[0],D,{tex:false})}`,si:e=>igualCoef(e,[b,a]),por:'Intercambiaste a y b.'},{valor:`a = ${frac(-(w[0]*v[1]-w[1]*v[0]),D,{tex:false})}, b = ${frac(-(u[0]*w[1]-u[1]*w[0]),D,{tex:false})}`,si:e=>igualCoef(e,[-a,-b]),por:'Signos cambiados.'},{valor:`a = ${numTxt(a*D)}, b = ${numTxt(b*D)}`,si:e=>igualCoef(e,[a*D,b*D]),por:'Falta dividir entre el determinante.'}],
            comprobar:()=>casi(a*u[0]+b*v[0],w[0])&&casi(a*u[1]+b*v[1],w[1])}},
        'k-en-span':()=>P[4]['k-en-span'](),
        'genera-r2':()=>{let u,v;const gen=rng.prob(0.6);do{u=vecAl(rng,2,5);v=gen?vecAl(rng,2,5):u.map(x=>rng.elegir([2,-1,3])*x)}while(!noCeroV(u)||(det2([u,v])!==0)!==gen);
          return {enunciado:`¿Generan \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\) todo \\(\\mathbb{R}^2\\)? Responde sí o no.`,respuesta:gen?'Sí':'No',verificar:siNo(gen),pasos:[paso('Determinante',`\\(${u[0]}\\cdot${par(v[1])} - ${par(u[1])}\\cdot${par(v[0])} = ${c(det2([u,v]))}\\)`,'Si es distinto de 0, son independientes.'),final('Interpreta',gen?'Dos independientes en ℝ² generan todo el plano.':'Son paralelos: solo generan una recta.','En ℝ², 2 vectores generan todo ⇔ det ≠ 0.',gen?'Sí':'No')],
            errores:[{valor:gen?'No':'Sí',si:siNo(!gen),por:gen?'det ≠ 0: sí generan ℝ².':'det = 0: son paralelos.'}],comprobar:()=>gen===(det2([u,v])!==0)}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'w está en el span de u, v si existen a, b con w = a·u + b·v (resuelve el sistema). Un subespacio contiene al 0 y es cerrado bajo suma y escalares.',pista:'Plantea a·u + b·v = w componente a componente.',teclado:'mat',...x};
  }
};

/* ---------- Independencia lineal y bases ---------- */
const independencia={
  titulo:'Independencia lineal y base',
  explicacion:'Varios vectores son linealmente independientes si ninguno es combinación de los otros: la única forma de que a·u + b·v (+ c·w) = 0 es con todos los coeficientes en 0. n vectores de ℝⁿ son independientes (y forman una base) si su determinante es distinto de 0.',
  alternativa:'Piensa en direcciones para llegar a un lugar: "norte" y "este" son independientes (no puedes reemplazar una con la otra). "Norte" y "2 veces norte" no: el segundo no agrega nada nuevo. Una base es un juego mínimo de direcciones con el que llegas a todos lados.',
  referencia:'Ver: Grossman, Álgebra lineal, sec. 5.4 y 5.5; Lay, sec. 1.7 y 4.3.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const pregInd=(U,det,txtVs)=>{const ind=det!==0;return {enunciado:`¿Son linealmente independientes ${txtVs}? Responde sí o no.`,respuesta:ind?'Sí':'No',verificar:siNo(ind),
      pasos:[paso('Determinante de la matriz que forman',`\\(\\det${matNum(U)} = ${c(det)}\\)`,'Con n vectores de ℝⁿ basta el determinante.'),final('Interpreta',ind?'det ≠ 0: independientes.':'det = 0: dependientes (uno es combinación de los otros).','Independientes ⇔ det ≠ 0.',ind?'Sí':'No')],
      errores:[{valor:ind?'No':'Sí',si:siNo(!ind),por:ind?`El determinante es ${det} ≠ 0: son independientes.`:'El determinante es 0: son dependientes.'}],comprobar:()=>ind===(gaussJordan(U.map(f=>[...f,0])).rango===U.length)}};
    const P={
      1:{
        'dos-2d':()=>{let u,v;const ind=rng.prob(0.5);do{u=vecAl(rng,2,5);v=ind?vecAl(rng,2,5):u.map(x=>rng.elegir([2,-1,3,-2])*x)}while(!noCeroV(u)||(det2([u,v])!==0)!==ind);return pregInd([u,v],det2([u,v]),`\\(${vec(u)}\\) y \\(${vec(v)}\\)`)},
        'multiplo':()=>{let u;do u=vecAl(rng,3,4);while(!noCeroV(u));const k=rng.elegir([2,3,-1,-2]),v=u.map(x=>k*x);
          return {enunciado:`¿Son linealmente independientes \\(${vec(u)}\\) y \\(${vec(v)}\\)? Responde sí o no.`,respuesta:'No',verificar:esNo,pasos:[paso('Compara',`\\(${vec(v)} = ${k}\\cdot${vec(u)}\\)`,'Uno es múltiplo del otro.'),final('Dependientes',`\\(${k}u - v = 0\\)`,'Hay una combinación con coeficientes no nulos que da 0.','No')],
            errores:[{valor:'Sí',si:esSi,por:`El segundo es ${k} veces el primero: son dependientes.`}],comprobar:()=>cruz(u,v).every(x=>x===0)}},
        'det-2x2':()=>{let u,v;do{u=vecAl(rng,2,6);v=vecAl(rng,2,6)}while(!noCeroV(u)||!noCeroV(v));const d=det2([u,v]);
          return {enunciado:`Para saber si \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\) son independientes, calcula \\(\\det\\begin{pmatrix}${u.join(' & ')} \\\\ ${v.join(' & ')}\\end{pmatrix}\\).`,respuesta:String(d),verificar:e=>igualNum(e,d),
            pasos:[paso('ad − bc',`\\(${u[0]}\\cdot${par(v[1])} - ${par(u[1])}\\cdot${par(v[0])}\\)`,'Diagonal principal menos secundaria.'),final('Resultado',`\\(${c(d)}\\)`,d?'Distinto de 0: independientes.':'Cero: dependientes.',String(d))],
            errores:[malNum(u[0]*v[1]+u[1]*v[0],'Es ad − bc: se resta.'),malNum(-d,'Revisa el orden de la resta.'),malNum(u[0]*v[0]-u[1]*v[1],'Multiplica en cruz.')],comprobar:()=>d===u[0]*v[1]-u[1]*v[0]}}
      },
      2:{
        'tres-3d':()=>{const ind=rng.prob(0.5);let U;do{const a=vecAl(rng,3,3),b=vecAl(rng,3,3);U=[a,b,ind?vecAl(rng,3,3):a.map((x,i)=>rng.elegir([1,2,-1])*x+b[i])]}while((det3(U)!==0)!==ind||!noCeroV(U[0]));return pregInd(U,det3(U),`\\(${vec(U[0])}\\), \\(${vec(U[1])}\\) y \\(${vec(U[2])}\\)`)},
        'k-dependientes':()=>{const a=rng.noCero(-5,5),b=rng.noCero(-5,5),m=rng.elegir([2,3,-2,4]),cc=a*m,k=b*m;// (a, b) y (cc, k) dependientes ⇔ a·k − b·cc = 0
          return {enunciado:`¿Para qué valor de k son linealmente <b>dependientes</b> \\(${vec([a,b])}\\) y \\((${cc}, k)\\)?`,respuesta:`k = ${k}`,verificar:e=>igualNum(e,k),
            pasos:[paso('Dependientes ⇔ determinante 0',`\\(${a}k - ${par(b)}\\cdot${par(cc)} = 0\\)`,'ad − bc = 0.'),final('Despeja',`\\(k = \\dfrac{${b*cc}}{${a}} = ${c(k)}\\)`,'Así el segundo es múltiplo del primero.',`k = ${k}`)],
            errores:[malNum(-k,'Revisa el signo al despejar.'),malNum(cc/b===Math.round(cc/b)?cc/b:a*b,'Plantea ad − bc = 0.'),malNum(b,'k tiene que hacer proporcionales a los dos vectores.')],comprobar:()=>a*k-b*cc===0}},
        'base-r2':()=>{let u,v;const base=rng.prob(0.6);do{u=vecAl(rng,2,5);v=base?vecAl(rng,2,5):u.map(x=>2*x)}while(!noCeroV(u)||(det2([u,v])!==0)!==base);
          return {enunciado:`¿Forman \\(${vec(u)}\\) y \\(${vec(v)}\\) una base de \\(\\mathbb{R}^2\\)? Responde sí o no.`,respuesta:base?'Sí':'No',verificar:siNo(base),
            pasos:[paso('Una base de ℝ² son 2 vectores independientes',`\\(\\det = ${c(det2([u,v]))}\\)`,'2 vectores en ℝ²: basta que sean independientes.'),final('Interpreta',base?'Independientes: sí son base.':'Dependientes: no son base.','Base = independientes + generan.',base?'Sí':'No')],
            errores:[{valor:base?'No':'Sí',si:siNo(!base),por:base?'det ≠ 0: sí son base.':'Son paralelos: no generan ℝ².'}],comprobar:()=>base===(det2([u,v])!==0)}}
      },
      3:{
        'coordenadas':()=>{let u,v;do{u=vecAl(rng,2,4);v=vecAl(rng,2,4)}while(Math.abs(det2([u,v]))!==1);const a=rng.entero(-5,5),b=rng.entero(-5,5),w=u.map((x,i)=>a*x+b*v[i]);
          return {...comoVector([a,b]),enunciado:`Coordenadas de \\(w = ${vec(w)}\\) en la base \\(B = \\{${vec(u)},\\ ${vec(v)}\\}\\): escribe \\([w]_B\\).`,
            pasos:[paso('Plantea',`\\(a${vec(u)} + b${vec(v)} = ${vec(w)}\\)`,'Las coordenadas son los coeficientes.'),final('Resuelve el sistema',`\\([w]_B = ${c(vec([a,b]))}\\)`,'Comprueba sustituyendo.',vec([a,b]))],
            errores:[{si:e=>celdasIguales(e,w),por:'Esas son las coordenadas en la base usual, no en B.'},{si:e=>celdasIguales(e,[b,a]),por:'Intercambiaste a y b.'}],comprobar:()=>w.every((x,i)=>x===a*u[i]+b*v[i])}},
        'rango':()=>{const r=rng.elegir([1,2,3]);let U;do{const a=vecAl(rng,3,4),b=vecAl(rng,3,4);U=r===1?[a,a.map(x=>-2*x),a.map(x=>3*x)]:r===2?[a,b,a.map((x,i)=>x-b[i])]:[a,b,vecAl(rng,3,4)]}while(gaussJordan(U.map(f=>[...f,0])).rango!==r);
          return {enunciado:`¿Cuántos vectores linealmente independientes hay entre \\(${vec(U[0])}\\), \\(${vec(U[1])}\\) y \\(${vec(U[2])}\\)?`,respuesta:String(r),verificar:e=>igualNum(e,r),pasos:[paso('Escalona',`\\(${matNum(U)}\\)`,'Filas que no se anulan.'),final('Rango',`\\(${c(r)}\\)`,'Número máximo de independientes.',String(r))],
            errores:[malNum(3,'Revisa: alguno es combinación de otros.'),malNum(r===1?2:1,'Escalona con cuidado.'),malNum(0,'Hay vectores no nulos.')],comprobar:()=>gaussJordan(U.map(f=>[...f,0])).rango===r}},
        'k-3d':()=>{const a=vecAl(rng,3,3),b=[0,1,rng.entero(-2,2)],m=rng.noCero(-2,2),q=rng.noCero(-2,2),w=a.map((x,i)=>m*x+q*b[i]);if(!a[0])a[0]=1;const w2=a.map((x,i)=>m*x+q*b[i]);
          return {enunciado:`¿Para qué k son dependientes \\(${vec(a)}\\), \\(${vec(b)}\\) y \\((${w2[0]}, ${w2[1]}, k)\\)?`,respuesta:`k = ${w2[2]}`,verificar:e=>igualNum(e,w2[2]),
            pasos:[paso('Dependientes ⇔ det = 0',`\\(\\det${matNum([a,b,[w2[0],w2[1],'k']])} = 0\\)`,'Desarrolla y despeja k.'),final('Despeja',`\\(k = ${c(w2[2])}\\)`,`Es ${m}·(primero) ${q<0?'−':'+'} ${Math.abs(q)}·(segundo).`,`k = ${w2[2]}`)],
            errores:[malNum(-w2[2],'Revisa el signo.'),malNum(0,'k = 0 no anula el determinante aquí.'),malNum(w2[0]+w2[1],'Plantea det = 0.')],comprobar:()=>det3([a,b,w2])===0&&a[0]!==0}}
      },
      4:{
        'tres-3d':()=>P[2]['tres-3d'](),
        'coordenadas':()=>{let u,v;do{u=vecAl(rng,2,5);v=vecAl(rng,2,5)}while(Math.abs(det2([u,v]))!==1);const a=rng.entero(-7,7),b=rng.entero(-7,7),w=u.map((x,i)=>a*x+b*v[i]);
          return {...comoVector([a,b]),enunciado:`Coordenadas de \\(w = ${vec(w)}\\) en la base \\(B = \\{${vec(u)},\\ ${vec(v)}\\}\\): escribe \\([w]_B\\).`,
            pasos:[paso('Plantea',`\\(a${vec(u)} + b${vec(v)} = ${vec(w)}\\)`,'Coeficientes de la combinación.'),final('Resuelve',`\\([w]_B = ${c(vec([a,b]))}\\)`,'Comprueba.',vec([a,b]))],
            errores:[{si:e=>celdasIguales(e,w),por:'Esas son las coordenadas usuales.'},{si:e=>celdasIguales(e,[b,a]),por:'Intercambiaste a y b.'}],comprobar:()=>w.every((x,i)=>x===a*u[i]+b*v[i])}},
        'cuatro-en-r3':()=>({enunciado:`¿Pueden ser linealmente independientes 4 vectores de \\(\\mathbb{R}^3\\)? Responde sí o no.`,clave:'cuatro-r3-'+rng.entero(1,9),respuesta:'No',verificar:esNo,
          pasos:[paso('Dimensión de ℝ³',`\\(\\dim \\mathbb{R}^3 = 3\\)`,'Como máximo 3 independientes.'),final('Conclusión','Con 4 vectores, alguno es combinación de los otros.','En ℝⁿ hay como máximo n independientes.','No')],
          errores:[{valor:'Sí',si:esSi,por:'En ℝ³ como máximo hay 3 vectores independientes.'}],comprobar:()=>true})
      },
      5:{
        'coordenadas-3d':()=>{let U;do U=[[1,rng.entero(-2,2),rng.entero(-2,2)],[0,1,rng.entero(-2,2)],[0,0,1]];while(det3(U)!==1);const ab=vecAl(rng,3,4),w=[0,1,2].map(i=>U.reduce((s,u,k)=>s+ab[k]*u[i],0));
          return {...comoVector(ab),enunciado:`Coordenadas de \\(w = ${vec(w)}\\) en la base \\(B = \\{${U.map(vec).join(',\\ ')}\\}\\): escribe \\([w]_B\\).`,
            pasos:[paso('Plantea el sistema',`\\(a${vec(U[0])} + b${vec(U[1])} + c${vec(U[2])} = ${vec(w)}\\)`,'Primera componente → a; luego b; luego c.'),final('Resuelve en cascada',`\\([w]_B = ${c(vec(ab))}\\)`,'La primera ecuación solo tiene a.',vec(ab))],
            errores:[{si:e=>celdasIguales(e,w),por:'Esas son las coordenadas usuales.'},{si:e=>celdasIguales(e,[...ab].reverse())&&ab[0]!==ab[2],por:'El orden es el de la base.'}],comprobar:()=>w.every((x,i)=>x===U.reduce((s,u,k)=>s+ab[k]*u[i],0))}},
        'k-3d':()=>P[3]['k-3d'](),
        'combinacion-nula':()=>{const a=vecAl(rng,3,3),b=vecAl(rng,3,3),p=rng.noCero(-3,3),q=rng.noCero(-3,3),w=a.map((x,i)=>p*x+q*b[i]);if(!noCeroV(cruz(a,b)))return P[5]['coordenadas-3d']();
          return {enunciado:`\\(w = ${vec(w)}\\) es combinación de \\(u = ${vec(a)}\\) y \\(v = ${vec(b)}\\): \\(w = p\\,u + q\\,v\\). Escribe p, q.`,respuesta:`p = ${p}, q = ${q}`,verificar:e=>{const l=lista(String(e).replace(/[pq]\s*=\s*/gi,''));return l.length===2&&casi(l[0],p)&&casi(l[1],q)},
            pasos:[paso('Sistema con dos componentes',`\\(\\begin{cases}${a[0]}p ${sg(b[0])}q = ${w[0]} \\\\ ${a[1]}p ${sg(b[1])}q = ${w[1]}\\end{cases}\\)`,'Usa dos ecuaciones y comprueba con la tercera.'),final('Resultado',`\\(p = ${c(p)},\\ q = ${c(q)}\\)`,'Así se ve que u, v, w son dependientes.',`p = ${p}, q = ${q}`)],
            errores:[{valor:`p = ${q}, q = ${p}`,si:e=>{const l=lista(String(e).replace(/[pq]\s*=\s*/gi,''));return l.length===2&&casi(l[0],q)&&casi(l[1],p)},por:'Intercambiaste p y q.'}],comprobar:()=>w.every((x,i)=>x===p*a[i]+q*b[i])}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Independientes: a·u + b·v (+ c·w) = 0 solo con todos los coeficientes en 0. n vectores de ℝⁿ son base ⇔ su determinante ≠ 0.',pista:'Calcula el determinante o escalona.',teclado:'mat',...x};
  }
};

/* ---------- Transformaciones lineales ---------- */
const TRIG={30:[Math.sqrt(3)/2,1/2],45:[Math.SQRT1_2,Math.SQRT1_2],60:[1/2,Math.sqrt(3)/2],90:[0,1],180:[-1,0]};
const transformaciones={
  titulo:'Transformaciones lineales',
  explicacion:'Una transformación lineal T(v) = A·v queda definida por su matriz A: las columnas de A son las imágenes de los vectores básicos e₁, e₂. Componer transformaciones es multiplicar matrices, y |det A| dice por cuánto se multiplican las áreas.',
  alternativa:'Imagina una hoja de papel cuadriculado que estiras, giras o reflejas sin doblarla: las líneas siguen rectas y el origen no se mueve. Basta saber a dónde van los dos vectores de un cuadrito (e₁ y e₂) para saber a dónde va todo lo demás: esas dos flechas son las columnas de la matriz.',
  referencia:'Ver: Grossman, Álgebra lineal, cap. 7; Lay, sec. 1.8 y 1.9.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const aplicar=(A,v,enun,extra=[])=>{const r=mulMV(A,v);return {...comoVector(r),enunciado:enun,pasos:[...extra,paso('Multiplica A por v',A.map((f,i)=>`\\(${f.map((x,j)=>`${par(x)}\\cdot${par(v[j])}`).join(' + ')} = ${c(r[i])}\\)`).join('<br>'),'Cada componente es fila de A · v.'),final('Resultado',`\\(${c(vec(r))}\\)`,'T(v) = A·v.',vec(r))],
      errores:[{si:e=>celdasIguales(e,A[0].map((_,j)=>A.reduce((s,f,i)=>s+f[j]*v[i],0))),por:'Usaste columnas en vez de filas: cada componente es fila · v.'},{si:e=>celdasIguales(e,v),por:'Falta aplicar la matriz.'}],comprobar:()=>r.every((x,i)=>x===A[i].reduce((s,a,j)=>s+a*v[j],0))}};
    const P={
      1:{
        'aplicar-2x2':()=>{const A=[vecAl(rng,2,4),vecAl(rng,2,4)],v=vecAl(rng,2,5);return aplicar(A,v,`Si \\(T(v) = A v\\) con \\(A = ${matNum(A)}\\), calcula \\(T${vec(v)}\\).`)},
        'rotacion-90':()=>{const A=[[0,-1],[1,0]],v=vecAl(rng,2,6);return aplicar(A,v,`La rotación de 90° (antihorario) tiene matriz \\(${matNum(A)}\\). ¿A dónde va \\(${vec(v)}\\)?`,[paso('Rotar 90°',`\\((x, y) \\mapsto (-y, x)\\)`,'Lo que estaba en x pasa a y, y lo de y a −x.')])},
        'escala':()=>{const k=rng.elegir([2,3,-1,-2]),A=[[k,0],[0,k]],v=vecAl(rng,2,6);return aplicar(A,v,`La transformación \\(T(v) = ${k}v\\) tiene matriz \\(${matNum(A)}\\). Calcula \\(T${vec(v)}\\).`)}
      },
      2:{
        'matriz-desde-imagenes':()=>{const t1=vecAl(rng,2,5),t2=vecAl(rng,2,5),A=[[t1[0],t2[0]],[t1[1],t2[1]]];
          return {...comoMatriz(A),enunciado:`Una transformación lineal cumple \\(T(1, 0) = ${vec(t1)}\\) y \\(T(0, 1) = ${vec(t2)}\\). Escribe su matriz.`,pasos:[paso('Las imágenes de e₁ y e₂ son las columnas',`\\(A = \\big(T(e_1)\\ \\ T(e_2)\\big)\\)`,'Columnas, no filas.'),final('Matriz',`\\(${c(matNum(A))}\\)`,'Primera columna T(e₁), segunda T(e₂).',A.flat().join(', '))],
            errores:[{si:e=>celdasIguales(e,[t1[0],t1[1],t2[0],t2[1]])&&(t1[1]!==t2[0]),por:'Las imágenes van como COLUMNAS, no como filas.'}],comprobar:()=>iguales(mulMV(A,[1,0]),t1)&&iguales(mulMV(A,[0,1]),t2)}},
        'reflexion':()=>{const [nom,A]=rng.elegir([['el eje x',[[1,0],[0,-1]]],['el eje y',[[-1,0],[0,1]]],['la recta y = x',[[0,1],[1,0]]]]),v=vecAl(rng,2,6);return aplicar(A,v,`La reflexión respecto a ${nom} tiene matriz \\(${matNum(A)}\\). ¿A dónde va \\(${vec(v)}\\)?`)},
        'aplicar-3x3':()=>{const A=Array.from({length:3},()=>vecAl(rng,3,3)),v=vecAl(rng,3,4);return aplicar(A,v,`Si \\(T(v) = A v\\) con \\(A = ${matNum(A)}\\), calcula \\(T${vec(v)}\\).`)}
      },
      3:{
        'composicion':()=>{const A=[vecAl(rng,2,3),vecAl(rng,2,3)],B=[vecAl(rng,2,3),vecAl(rng,2,3)],C=mulMM(B,A);
          return {...comoMatriz(C),enunciado:`Primero se aplica \\(A = ${matNum(A)}\\) y después \\(B = ${matNum(B)}\\). Escribe la matriz de la composición.`,pasos:[paso('Primero A, después B',`\\(B(Av) = (BA)v\\)`,'La que se aplica primero va a la DERECHA.',{ojo:'No es AB.'}),final('Multiplica BA',`\\(${c(matNum(C))}\\)`,'Fila de B por columna de A.',C.flat().join(', '))],
            errores:[{si:e=>celdasIguales(e,mulMM(A,B).flat())&&!iguales(mulMM(A,B).flat(),C.flat()),por:'Ese es AB: la primera transformación (A) va a la derecha: BA.'}],comprobar:()=>{const v=[1,2];return iguales(mulMV(C,v),mulMV(B,mulMV(A,v)))}}},
        'factor-area':()=>{let A;do A=[vecAl(rng,2,5),vecAl(rng,2,5)];while(det2(A)===0);const f=Math.abs(det2(A)),a0=rng.entero(1,6);
          return {enunciado:`Una figura de área ${a0} se transforma con \\(A = ${matNum(A)}\\). ¿Qué área tiene la imagen?`,respuesta:String(f*a0),verificar:e=>igualNum(e,f*a0),pasos:[paso('Factor de área = |det A|',`\\(|${det2(A)}| = ${c(f)}\\)`,'El determinante mide cómo cambian las áreas.'),final('Multiplica',`\\(${a0}\\cdot${f} = ${c(f*a0)}\\)`,'Área nueva = |det| × área original.',String(f*a0))],
            errores:[malNum(det2(A)*a0,'El área no es negativa: usa |det|.'),malNum(f,'Multiplica por el área original.'),malNum(a0,'Falta el factor |det A|.')].filter(e=>e.valor!==String(f*a0)),comprobar:()=>f===Math.abs(A[0][0]*A[1][1]-A[0][1]*A[1][0])}},
        'preimagen':()=>{let A;do A=[vecAl(rng,2,3),vecAl(rng,2,3)];while(Math.abs(det2(A))!==1);const v=vecAl(rng,2,5),w=mulMV(A,v);
          return {...comoVector(v),enunciado:`Con \\(A = ${matNum(A)}\\), ¿qué vector v cumple \\(A v = ${vec(w)}\\)?`,pasos:[paso('Plantea el sistema',`\\(\\begin{cases}${A[0][0]}x ${sg(A[0][1])}y = ${w[0]} \\\\ ${A[1][0]}x ${sg(A[1][1])}y = ${w[1]}\\end{cases}\\)`,'A·v = w.'),final('Resuelve',`\\(v = ${c(vec(v))}\\)`,'O usa v = A⁻¹w.',vec(v))],
            errores:[{si:e=>celdasIguales(e,mulMV(A,w)),por:'Aplicaste A otra vez: hay que deshacerla (A⁻¹).'},{si:e=>celdasIguales(e,w),por:'w es la imagen; v es el que entra.'}],comprobar:()=>iguales(mulMV(A,v),w)}}
      },
      4:{
        'rotacion-angulo':()=>{const ang=rng.elegir([30,45,60,90,180]),[co,se]=TRIG[ang],v=vecAl(rng,2,4).map((x,i)=>i===0&&!x?1:x),r=[co*v[0]-se*v[1],se*v[0]+co*v[1]].map(x=>+x.toFixed(2));
          return {forma:{filas:1,cols:2},celdas:r.map(String),respuesta:vec(r),verificar:e=>Array.isArray(e)&&e.length===2&&e.every((x,i)=>Math.abs(num(x)-r[i])<=0.015),enunciado:`Rota \\(${vec(v)}\\) ${ang}° en sentido antihorario (2 decimales).`,
            pasos:[paso('Matriz de rotación',`\\(\\begin{pmatrix}\\cos ${ang}^\\circ & -\\sin ${ang}^\\circ \\\\ \\sin ${ang}^\\circ & \\cos ${ang}^\\circ\\end{pmatrix}\\)`,'cos '+ang+'° ≈ '+co.toFixed(3)+', sen '+ang+'° ≈ '+se.toFixed(3)+'.'),final('Multiplica',`\\(${c(vec(r))}\\)`,'(x cos θ − y sen θ, x sen θ + y cos θ).',vec(r))],
            errores:[{si:e=>Array.isArray(e)&&e.length===2&&Math.abs(num(e[0])-(co*v[0]+se*v[1]))<0.015&&Math.abs(num(e[1])-(-se*v[0]+co*v[1]))<0.015&&se!==0,por:'Esa es la rotación en sentido horario.'}],comprobar:()=>casi(Math.hypot(...r),Math.hypot(...v),0.01)}},
        'nucleo':()=>{const a=rng.noCero(-4,4),b=rng.noCero(-4,4),m=rng.noCero(-3,3),A=[[a,b],[m*a,m*b]],k=-a/b;
          return {enunciado:`La matriz \\(${matNum(A)}\\) manda al vector \\((1, k)\\) al cero. ¿Cuánto vale k?`,respuesta:`k = ${numTxt(k)}`,verificar:e=>igualNum(e,k),pasos:[paso('A(1, k) = 0',`\\(${a} ${sg(b)}k = 0\\)`,'La primera fila basta (la segunda es múltiplo).'),final('Despeja',`\\(k = ${c(frac(-a,b))}\\)`,'Ese vector está en el núcleo.',`k = ${numTxt(k)}`)],
            errores:[malNum(a/b,'Revisa el signo al despejar.'),malNum(-b/a,'Al revés: k = −a/b.'),malNum(0,'Con k = 0 no da cero.')],comprobar:()=>casi(a+b*k,0)&&casi(m*a+m*b*k,0)}},
        'composicion':()=>P[3]['composicion']()
      },
      5:{
        'proyeccion':()=>{const [ux,uy]=rng.elegir([[1,0],[0,1],[1,1],[1,-1],[3,4],[4,3]]),v=(()=>{let t;do t=vecAl(rng,2,6);while(t[0]*ux+t[1]*uy===0);return t})(),d=ux*ux+uy*uy,f=(v[0]*ux+v[1]*uy)/d,r=[f*ux,f*uy];
          return {forma:{filas:1,cols:2},celdas:r.map(numTxt),respuesta:vec(r.map(numTxt)),verificar:e=>celdasIguales(e,r),enunciado:`Proyecta \\(v = ${vec(v)}\\) sobre la recta con dirección \\(u = ${vec([ux,uy])}\\) (puedes usar fracciones).`,
            pasos:[paso('Fórmula',`\\(\\text{proy}_u v = \\dfrac{v\\cdot u}{u\\cdot u}\\,u = \\dfrac{${v[0]*ux+v[1]*uy}}{${d}}\\,u\\)`,'Producto punto entre norma al cuadrado.'),final('Multiplica',`\\(${c(vec(r.map(numTxt)))}\\)`,'Es la sombra de v sobre la recta.',vec(r.map(numTxt)))],
            errores:[{si:e=>celdasIguales(e,[ux,uy].map(x=>x*(v[0]*ux+v[1]*uy))),por:'Falta dividir entre u·u.'},{si:e=>celdasIguales(e,v),por:'Ese es v, no su proyección.'}],comprobar:()=>casi(punto(resta(v,r),[ux,uy]),0)}},
        'punto-fijo':()=>{const k=rng.noCero(-3,3),A=[[1,k],[0,1]],t=rng.noCero(-5,5);
          return {enunciado:`El corte \\(A = ${matNum(A)}\\) deja fijos los vectores del eje x. Si \\(A(t, 0) = (t, 0)\\), ¿qué vector es \\(A(${t}, 1)\\)? Escribe (x, y).`,respuesta:`(${t+k}, 1)`,verificar:e=>{const l=lista(e);return l.length===2&&casi(l[0],t+k)&&casi(l[1],1)},
            pasos:[paso('Multiplica',`\\((1\\cdot${par(t)} + ${k}\\cdot1,\\ 0\\cdot${par(t)} + 1)\\)`,'Fila por vector.'),final('Resultado',`\\(${c(`(${t+k}, 1)`)}\\)`,'El corte desplaza según la altura.',`(${t+k}, 1)`)],
            errores:[{valor:`(${t}, 1)`,si:e=>{const l=lista(e);return l.length===2&&casi(l[0],t)&&casi(l[1],1)},por:'Solo los del eje x quedan fijos; este se desplaza k.'},{valor:`(${t}, ${1+k})`,si:e=>{const l=lista(e);return l.length===2&&casi(l[0],t)&&casi(l[1],1+k)},por:'Se desplaza la x, no la y.'}],comprobar:()=>iguales(mulMV(A,[t,1]),[t+k,1])}},
        'composicion-3':()=>{const R=[[0,-1],[1,0]],S=[[1,0],[0,-1]],v=vecAl(rng,2,5),r=mulMV(S,mulMV(R,v));
          return {...comoVector(r),enunciado:`Primero rotas \\(${vec(v)}\\) 90° (antihorario) y después lo reflejas en el eje x. ¿Dónde queda?`,pasos:[paso('Rota 90°',`\\(${vec(mulMV(R,v))}\\)`,'(x, y) → (−y, x).'),final('Refleja en el eje x',`\\(${c(vec(r))}\\)`,'(x, y) → (x, −y).',vec(r))],
            errores:[{si:e=>celdasIguales(e,mulMV(R,mulMV(S,v)))&&!iguales(mulMV(R,mulMV(S,v)),r),por:'El orden importa: primero rota, después refleja.'},{si:e=>celdasIguales(e,mulMV(R,v)),por:'Falta la reflexión.'}],comprobar:()=>celdasIguales(r,[-v[1],-v[0]])}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'T(v) = A·v; las columnas de A son T(e₁), T(e₂). Componer es multiplicar (la primera va a la derecha) y |det A| es el factor de área.',pista:'Fila de A por el vector.',teclado:'mat',...x};
  }
};

/* ---------- Valores y vectores propios ---------- */
const raicesSet=(e,rs)=>{const l=lista(String(e).replace(/λ\s*[₁₂12]?\s*=|l\s*=/gi,'').replace(/\by\b/g,','));const a=[...new Set(l.map(x=>Math.round(x*1e6)/1e6))].sort((p,q)=>p-q),b=[...new Set(rs)].sort((p,q)=>p-q);return a.length===b.length&&a.every((x,i)=>casi(x,b[i]))};
const proporcional=(e,v)=>{const l=Array.isArray(e)?e.map(num):lista(e);return l.length===v.length&&l.some(x=>x!==0)&&l.every(Number.isFinite)&&casi(l[0]*v[1],l[1]*v[0])};
const propios={
  titulo:'Valores y vectores propios',
  explicacion:'v ≠ 0 es vector propio de A con valor propio λ si A·v = λ·v: la matriz solo lo estira (no lo gira). Los valores propios son las raíces de det(A − λI) = 0; en una 2×2, λ² − (traza)λ + det = 0.',
  alternativa:'Imagina que la matriz es un viento que empuja todo el plano. Casi todas las flechas cambian de dirección, pero algunas solo se estiran o encogen: esas son los vectores propios, y el valor propio dice cuánto se estiran (2 = el doble, −1 = se dan vuelta).',
  referencia:'Ver: Grossman, Álgebra lineal, cap. 8; Lay, sec. 5.1 y 5.2.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    // 2×2 con valores propios enteros l1, l2: A = P D P⁻¹ con P de det ±1
    const conPropios=(l1,l2)=>{let Pm;do Pm=[[rng.entero(-2,2),rng.entero(-2,2)],[rng.entero(-2,2),rng.entero(-2,2)]];while(Math.abs(det2(Pm))!==1);const d=det2(Pm),Pi=[[Pm[1][1]/d,-Pm[0][1]/d],[-Pm[1][0]/d,Pm[0][0]/d]];
      return {A:mulMM(mulMM(Pm,[[l1,0],[0,l2]]),Pi).map(f=>f.map(Math.round)),v1:[Pm[0][0],Pm[1][0]],v2:[Pm[0][1],Pm[1][1]]}};
    const valores=(A,ls,enun)=>{const tr=A[0][0]+A[1][1],dt=det2(A),resp=[...new Set(ls)].map(l=>`λ = ${l}`).join(', ');
      return {enunciado:enun||`Valores propios de \\(A = ${matNum(A)}\\) (sepáralos con coma).`,respuesta:resp,verificar:e=>raicesSet(e,ls),
        pasos:[paso('Polinomio característico',`\\(\\lambda^{2} - (${tr})\\lambda + (${dt}) = 0\\)`,'λ² − traza·λ + det.'),final('Raíces',`\\(${ls.map(l=>`\\lambda = ${c(l)}`).join(',\\ ')}\\)`,'Factoriza o usa la fórmula.',resp)],
        errores:[{valor:ls.map(l=>`λ = ${-l}`).join(', '),si:e=>raicesSet(e,ls.map(l=>-l))&&ls.some(l=>!ls.includes(-l)),por:'Signos al revés: revisa la factorización.'},{valor:`λ = ${A[0][0]}, λ = ${A[1][1]}`,si:e=>raicesSet(e,[A[0][0],A[1][1]])&&(A[0][1]*A[1][0]!==0),por:'La diagonal solo da los valores propios si la matriz es triangular.'},{valor:`λ = ${tr}, λ = ${dt}`,si:e=>raicesSet(e,[tr,dt])&&!raicesSet(`${tr}, ${dt}`,ls),por:'La traza y el det no son los valores propios: son su suma y su producto.'}],
        comprobar:()=>ls.every(l=>casi(det2([[A[0][0]-l,A[0][1]],[A[1][0],A[1][1]-l]]),0))}};
    const P={
      1:{
        'diagonal':()=>{const a=rng.noCero(-6,6),b=rng.noCero(-6,6),A=[[a,0],[0,b]];return valores(A,[a,b])},
        'triangular':()=>{const a=rng.noCero(-6,6),b=rng.noCero(-6,6),A=[[a,rng.noCero(-5,5)],[0,b]];return valores(A,[a,b],`Valores propios de la matriz triangular \\(A = ${matNum(A)}\\) (sepáralos con coma).`)},
        'comprobar-vector':()=>{const l1=rng.noCero(-4,4);let l2;do l2=rng.noCero(-4,4);while(l2===l1);const {A,v1}=conPropios(l1,l2);
          return {enunciado:`\\(v = ${vec(v1)}\\) es vector propio de \\(A = ${matNum(A)}\\). ¿Cuál es su valor propio λ?`,respuesta:`λ = ${l1}`,verificar:e=>igualNum(String(e).replace(/λ/,'x'),l1),
            pasos:[paso('Calcula A·v',`\\(A v = ${vec(mulMV(A,v1))}\\)`,'Multiplica.'),final('Compara con v',`\\(${vec(mulMV(A,v1))} = ${c(l1)}\\cdot${vec(v1)}\\)`,'Av = λv.',`λ = ${l1}`)],
            errores:[malNum(-l1,'Revisa el signo.'),malNum(l2,'Ese es el otro valor propio.'),malNum(mulMV(A,v1)[0],'λ es el factor, no una componente de Av.')],comprobar:()=>iguales(mulMV(A,v1),v1.map(x=>l1*x))}}
      },
      2:{
        'enteros':()=>{const l1=rng.noCero(-5,5);let l2;do l2=rng.noCero(-5,5);while(l2===l1);return valores(conPropios(l1,l2).A,[l1,l2])},
        'polinomio':()=>{const {A}=conPropios(rng.noCero(-4,4),rng.noCero(-4,4)),tr=A[0][0]+A[1][1],dt=det2(A),resp=`λ^2 ${tr?(-tr>0?'+ ':'- ')+Math.abs(tr)+'λ':''} ${dt>=0?'+':'-'} ${Math.abs(dt)}`.replace(/\s+/g,' ').replace(/ 1λ/,' λ');
          return {enunciado:`Escribe el polinomio característico de \\(A = ${matNum(A)}\\) en λ.`,respuesta:resp,verificar:e=>equivalente(limpiar(e).replace(/λ/g,'x').replace(/^.*=\s*(?=[^=]*$)/,'').replace(/\s*=\s*0\s*$/,''),`x^2 - ${tr}x + ${dt}`),
            pasos:[paso('det(A − λI)',`\\((${A[0][0]} - \\lambda)(${A[1][1]} - \\lambda) - (${A[0][1]})(${A[1][0]})\\)`,'Resta λ en la diagonal.'),final('Desarrolla',`\\(\\lambda^{2} - ${par(tr)}\\lambda + ${par(dt)}\\)`,'λ² − traza·λ + det.',resp)],
            errores:[{valor:`λ^2 + ${tr}λ + ${dt}`,si:e=>equivalente(limpiar(e).replace(/λ/g,'x'),`x^2 + ${tr}x + ${dt}`)&&tr!==0,por:'El término en λ lleva −traza.'},{valor:`λ^2 - ${tr}λ - ${dt}`,si:e=>equivalente(limpiar(e).replace(/λ/g,'x'),`x^2 - ${tr}x - ${dt}`)&&dt!==0,por:'El término independiente es +det.'}],comprobar:()=>casi(tr,A[0][0]+A[1][1])}},
        'vector-propio':()=>{const l1=rng.noCero(-4,4);let l2;do l2=rng.noCero(-4,4);while(l2===l1);const {A,v1}=conPropios(l1,l2);
          return {forma:{filas:1,cols:2},celdas:v1.map(String),respuesta:vec(v1),verificar:e=>proporcional(e,v1),enunciado:`\\(\\lambda = ${l1}\\) es valor propio de \\(A = ${matNum(A)}\\). Da un vector propio (cualquier múltiplo sirve).`,
            pasos:[paso('Resuelve (A − λI)v = 0',`\\(${matNum([[A[0][0]-l1,A[0][1]],[A[1][0],A[1][1]-l1]])}v = 0\\)`,'Las dos filas son proporcionales.'),final('Un vector del núcleo',`\\(v = ${c(vec(v1))}\\)`,'Cualquier múltiplo no nulo también sirve.',vec(v1))],
            errores:[{si:e=>proporcional(e,conPropios.length?[0,0]:[0,0]),por:'El vector cero no cuenta.'},{si:e=>Array.isArray(e)&&e.every(x=>num(x)===0),por:'El vector cero no es vector propio.'}],comprobar:()=>iguales(mulMV(A,v1),v1.map(x=>l1*x))}}
      },
      3:{
        'enteros':()=>P[2]['enteros'](),
        'vector-propio':()=>P[2]['vector-propio'](),
        'triangular-3x3':()=>{const d=[rng.noCero(-5,5),rng.noCero(-5,5),rng.noCero(-5,5)],A=[[d[0],rng.entero(-4,4),rng.entero(-4,4)],[0,d[1],rng.entero(-4,4)],[0,0,d[2]]],resp=[...new Set(d)].map(l=>`λ = ${l}`).join(', ');
          return {enunciado:`Valores propios de \\(${matNum(A)}\\) (sepáralos con coma).`,respuesta:resp,verificar:e=>raicesSet(e,d),pasos:[paso('Matriz triangular',`\\(\\det(A - \\lambda I) = (${d[0]} - \\lambda)(${d[1]} - \\lambda)(${d[2]} - \\lambda)\\)`,'El determinante de una triangular es el producto de la diagonal.'),final('Raíces',`\\(${d.map(l=>c(l)).join(',\\ ')}\\)`,'Los de la diagonal.',resp)],
            errores:[{valor:d.map(l=>`λ = ${-l}`).join(', '),si:e=>raicesSet(e,d.map(l=>-l))&&d.some(l=>!d.includes(-l)),por:'Signos al revés.'},{valor:`λ = ${d.reduce((s,x)=>s+x,0)}`,si:e=>raicesSet(e,[d.reduce((s,x)=>s+x,0)]),por:'Esa es la traza (la suma), no los valores propios.'}],comprobar:()=>d.every(l=>det3(A.map((f,i)=>f.map((x,j)=>i===j?x-l:x)))===0)}}
      },
      4:{
        'potencia':()=>{const l1=rng.elegir([2,-2,3,-1]);let l2;do l2=rng.noCero(-3,3);while(l2===l1);const {A,v1}=conPropios(l1,l2),k=rng.entero(2,4),r=v1.map(x=>x*l1**k);
          return {...comoVector(r),enunciado:`\\(v = ${vec(v1)}\\) es vector propio de \\(A = ${matNum(A)}\\) con \\(\\lambda = ${l1}\\). Calcula \\(A^{${k}} v\\).`,pasos:[paso('Aᵏv = λᵏv',`\\(A^{${k}}v = (${l1})^{${k}}v\\)`,'Cada vez que aplicas A, se multiplica por λ.'),final('Calcula',`\\(${l1**k}\\cdot${vec(v1)} = ${c(vec(r))}\\)`,'Sin multiplicar matrices.',vec(r))],
            errores:[{si:e=>celdasIguales(e,v1.map(x=>x*l1*k)),por:'Es λ elevado a k, no λ·k.'},{si:e=>celdasIguales(e,v1.map(x=>x*l1)),por:'Eso es Av; falta elevar.'}],comprobar:()=>{let w=v1;for(let i=0;i<k;i++)w=mulMV(A,w);return celdasIguales(w,r)}}},
        'traza-det':()=>{const l1=rng.noCero(-5,5),l2=rng.noCero(-5,5),q=rng.elegir(['suma','producto']),{A}=conPropios(l1,l2),v=q==='suma'?l1+l2:l1*l2;
          return {enunciado:`Sin calcularlos, ¿cuánto da ${q==='suma'?'la':'el'} <b>${q}</b> de los valores propios de \\(A = ${matNum(A)}\\)?`,respuesta:String(v),verificar:e=>igualNum(e,v),pasos:[paso(q==='suma'?'Suma = traza':'Producto = determinante',q==='suma'?`\\(${A[0][0]} + ${par(A[1][1])}\\)`:`\\(${A[0][0]}\\cdot${par(A[1][1])} - ${par(A[0][1])}\\cdot${par(A[1][0])}\\)`,'Del polinomio característico.'),final('Resultado',`\\(${c(v)}\\)`,'λ₁ + λ₂ = traza; λ₁λ₂ = det.',String(v))],
            errores:[malNum(q==='suma'?l1*l2:l1+l2,q==='suma'?'Eso es el producto (det).':'Eso es la suma (traza).'),malNum(-v,'Revisa el signo.'),malNum(A[0][0]*A[1][1],'Falta restar bc.')].filter(e=>e.valor!==String(v)),comprobar:()=>v===(q==='suma'?A[0][0]+A[1][1]:det2(A))}},
        'enteros-grandes':()=>{const l1=rng.noCero(-8,8);let l2;do l2=rng.noCero(-8,8);while(l2===l1);return valores(conPropios(l1,l2).A,[l1,l2])}
      },
      5:{
        'simetrica':()=>{const a=rng.entero(-4,4),b=rng.noCero(-3,3),A=[[a,b],[b,a]];return valores(A,[a+b,a-b],`Valores propios de la matriz simétrica \\(A = ${matNum(A)}\\) (sepáralos con coma).`)},
        'vector-propio-2':()=>{const l1=rng.noCero(-5,5);let l2;do l2=rng.noCero(-5,5);while(l2===l1);const {A,v2}=conPropios(l1,l2);
          return {forma:{filas:1,cols:2},celdas:v2.map(String),respuesta:vec(v2),verificar:e=>proporcional(e,v2),enunciado:`Un valor propio de \\(A = ${matNum(A)}\\) es \\(${l1}\\). Encuentra el OTRO valor propio y da un vector propio suyo.`,
            pasos:[paso('Otro valor propio con la traza',`\\(\\lambda_2 = ${A[0][0]+A[1][1]} - ${par(l1)} = ${c(l2)}\\)`,'λ₁ + λ₂ = traza.'),paso('Resuelve (A − λ₂I)v = 0',`\\(${matNum([[A[0][0]-l2,A[0][1]],[A[1][0],A[1][1]-l2]])}v = 0\\)`,'Las filas son proporcionales.'),final('Vector propio',`\\(${c(vec(v2))}\\)`,'Cualquier múltiplo sirve.',vec(v2))],
            errores:[{si:e=>Array.isArray(e)&&proporcional(e,conPropios&&mulMV([[0,0],[0,0]],[0,0]).length?[1,0]:[1,0])&&false,por:''}].filter(()=>false),comprobar:()=>iguales(mulMV(A,v2),v2.map(x=>l2*x))}},
        'diagonalizable':()=>{const tipo=rng.elegir(['distintos','repetido']);let A,res;if(tipo==='distintos'){const l1=rng.noCero(-4,4);let l2;do l2=rng.noCero(-4,4);while(l2===l1);A=conPropios(l1,l2).A;res=true}else{const l=rng.noCero(-4,4);A=[[l,rng.noCero(-3,3)],[0,l]];res=false}
          return {enunciado:`¿Es diagonalizable \\(A = ${matNum(A)}\\)? Responde sí o no.`,respuesta:res?'Sí':'No',verificar:siNo(res),pasos:[paso('Valores propios',res?'Dos valores propios distintos.':`Un solo valor propio repetido: \\(\\lambda = ${A[0][0]}\\).`,'Del polinomio característico.'),final(res?'Distintos → diagonalizable':'Repetido con un solo vector propio → no',res?'Hay dos vectores propios independientes.':`\\(A - \\lambda I = ${matNum([[0,A[0][1]],[0,0]])}\\) solo da una dirección.`,'Diagonalizable ⇔ hay una base de vectores propios.',res?'Sí':'No')],
            errores:[{valor:res?'No':'Sí',si:siNo(!res),por:res?'Valores propios distintos: siempre diagonalizable.':'Tiene un solo vector propio independiente: no alcanza para una base.'}],comprobar:()=>res===((A[0][0]-A[1][1])**2+4*A[0][1]*A[1][0]>0)}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Av = λv. Los valores propios son las raíces de det(A − λI) = 0 (en 2×2: λ² − traza·λ + det); la suma es la traza y el producto el determinante.',pista:'Escribe det(A − λI) y busca sus raíces.',teclado:'mat',...x};
  }
};

export default {'al/producto-cruz':productoCruz,'al/gauss-jordan':gaussJ,'al/combinacion-lineal':combinacion,'al/independencia':independencia,'al/transformaciones':transformaciones,'al/valores-propios':propios};
export {gaussJordan,cruz,punto,mulMV,mulMM};
