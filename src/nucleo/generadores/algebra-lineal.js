/* Generadores de álgebra lineal. Las respuestas de vectores y matrices se escriben celda por celda (forma {filas, cols});
   verificar recibe el arreglo de casillas y celdas trae las correctas (para probar). Pasos con los números de cada ejercicio. */
import {num,casi,igualNum} from './verificar.js';
import {frac,par,mat,vec} from './formato.js';
import {paso,final,c} from './pasos.js';
import {planoVectores} from './diagramas.js';

const celdasIguales=(e,valores,tol=1e-6)=>Array.isArray(e)&&e.length===valores.length&&e.every((x,i)=>casi(num(x),valores[i],tol));
const vecAl=(rng,n,R)=>Array.from({length:n},()=>rng.entero(-R,R));
const TRIPLES2=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[12,16,20]];
const TRIPLES3=[[1,2,2,3],[2,3,6,7],[1,4,8,9],[4,4,7,9],[2,6,9,11],[2,10,11,15],[6,6,7,11],[3,4,12,13]];
const conSignos=(rng,v)=>v.map(x=>x*rng.signo());
const comoVector=valores=>({forma:{filas:1,cols:valores.length},celdas:valores.map(String),respuesta:vec(valores),verificar:e=>celdasIguales(e,valores)});
const comoMatriz=M=>({forma:{filas:M.length,cols:M[0].length},celdas:M.flat().map(String),respuesta:`\\(${mat(M)}\\)`,verificar:e=>celdasIguales(e,M.flat())});
const enPlano=vs=>vs.every(x=>x.v.length===2)?planoVectores(vs):undefined;

// Vector entre dos puntos (1), norma con ternas pitagóricas (2–3), norma no entera (4), distancia en 3D (5)
const magnitud={
  titulo:'Vectores y norma',
  explicacion:'El vector de A a B es B − A; su norma (longitud) es la raíz de la suma de los cuadrados de sus componentes.',
  alternativa:'Un vector es una <b>flecha de instrucciones</b>: (3, 4) dice "camina 3 a la derecha y 4 hacia arriba". Para ir de A a B restas: final menos inicio. Su largo sale de Pitágoras, como la diagonal de una cancha: los lados miden 3 y 4, la diagonal mide 5.',
  generar(n,rng){
    const R_N='La norma de v = (a, b, c) es ‖v‖ = √(a² + b² + c²): se elevan al cuadrado las componentes, se suman y se saca la raíz.';
    if(n===1){const A=vecAl(rng,2,9),B=vecAl(rng,2,9),v=B.map((x,i)=>x-A[i]);
      return {...comoVector(v),enunciado:`Vector que va de \\(A = ${vec(A)}\\) a \\(B = ${vec(B)}\\)`,diagrama:planoVectores([{v:A,nombre:'A',clase:'v0'},{v:B,nombre:'B',clase:'v1'},{v,desde:A,nombre:'B − A',clase:'v2'}]),
        pasos:[paso('Resta final menos inicio',`\\(B - A = (${B[0]} - ${par(A[0])},\\ ${B[1]} - ${par(A[1])})\\)`,'El vector dice cuánto hay que moverse desde A para llegar a B.',{ojo:'Es B − A, no A − B: el orden cambia el sentido.'}),
          paso('Calcula cada componente',`x: \\(${B[0]} - ${par(A[0])} = ${c(v[0])}\\); y: \\(${B[1]} - ${par(A[1])} = ${c(v[1])}\\)`,'Componente a componente, por separado.'),
          final('Resultado',`\\(\\vec{AB} = ${vec(v)}\\)`,`Desde A, ${Math.abs(v[0])} ${v[0]>=0?'a la derecha':'a la izquierda'} y ${Math.abs(v[1])} ${v[1]>=0?'hacia arriba':'hacia abajo'}.`,vec(v))],
        errores:[{si:e=>celdasIguales(e,v.map(x=>-x)),por:'Calculaste A − B: el vector de A a B es B − A (final menos inicio).'},{si:e=>celdasIguales(e,B.map((x,i)=>x+A[i])),por:'Se resta, no se suma.'}],
        regla:'El vector de A a B es B − A, componente a componente.',pista:'Final menos inicio.'}}
    let v,res,t;
    if(n===2){t=rng.elegir(TRIPLES2);v=conSignos(rng,rng.prob(.5)?[t[0],t[1]]:[t[1],t[0]]);res=t[2]}
    else if(n===3||n===5){t=rng.elegir(TRIPLES3);v=conSignos(rng,rng.barajar(t.slice(0,3)));res=t[3]}
    else{do v=vecAl(rng,rng.prob(.5)?2:3,6);while(Number.isInteger(Math.sqrt(v.reduce((s,x)=>s+x*x,0)))||v.every(x=>!x));res=Math.sqrt(v.reduce((s,x)=>s+x*x,0))}
    const suma=v.reduce((s,x)=>s+x*x,0),exacta=Number.isInteger(res)?String(res):`√${suma}`;
    let enunciado=`Calcula \\(\\lVert v \\rVert\\) para \\(v = ${vec(v)}\\)`+(n===4?'<br><span class="nota">Puedes escribir √n o el decimal con 2 cifras.</span>':''),A;
    if(n===5){A=vecAl(rng,3,6);enunciado=`Distancia entre \\(A = ${vec(A)}\\) y \\(B = ${vec(A.map((x,i)=>x+v[i]))}\\)`}
    return {enunciado,respuesta:exacta,verificar:e=>Math.abs(num(e)-res)<=(Number.isInteger(res)?1e-9:0.01),diagrama:enPlano([{v,nombre:'v'}]),
      pasos:[...(n===5?[paso('Calcula el vector entre los puntos',`\\(B - A = ${c(vec(v))}\\)`,'La distancia entre dos puntos es la norma del vector que los une.')]:[]),
        paso('Eleva al cuadrado cada componente',`\\(${v.map(x=>`${par(x)}^2`).join(' + ')} = ${v.map(x=>c(x*x)).join(' + ')}\\)`,'Pitágoras: los catetos al cuadrado.',{ojo:'Un negativo al cuadrado es positivo.'}),
        paso('Suma',`\\(${v.map(x=>x*x).join(' + ')} = ${c(suma)}\\)`,'La suma de los cuadrados es el cuadrado de la longitud.'),
        final('Saca la raíz',`\\(\\sqrt{${suma}} = ${c(Number.isInteger(res)?res:res.toFixed(2))}\\)`,'La raíz deshace el cuadrado: así obtienes la longitud.',exacta,{ojo:'No olvides la raíz.'})],
      errores:[{valor:String(suma),si:e=>igualNum(e,suma),por:`Falta sacar la raíz: \\(\\sqrt{${suma}}\\).`},{valor:String(v.reduce((s,x)=>s+x,0)),si:e=>igualNum(e,v.reduce((s,x)=>s+x,0))&&v.reduce((s,x)=>s+x,0)!==res,por:'No se suman las componentes: se suman sus cuadrados y se saca la raíz.'}],
      regla:R_N,pista:'Eleva cada componente al cuadrado.',teclado:'mat'};
  }
};

// Suma, resta, número por vector y combinaciones (2D → 3D)
const operaciones={
  titulo:'Operaciones con vectores',
  explicacion:'Se suman, restan y multiplican por un número componente a componente.',
  alternativa:'Piensa en listas de compras: (2 manzanas, 3 peras) + (1 manzana, 4 peras) = (3 manzanas, 7 peras). Cada casilla se opera con su par. Multiplicar por 3 es comprar 3 veces la misma lista: todo se triplica.',
  generar(n,rng){
    const d=n<=2?2:3,R=n<=3?6:9,u=vecAl(rng,d,R),v=vecAl(rng,d,R);
    let a=1,b=1,txt,r;
    if(n===1){txt='u + v';r=u.map((x,i)=>x+v[i])}
    else if(n===2){a=rng.noCero(-4,4);b=0;txt=`${a}u`;r=u.map(x=>a*x)}
    else if(n===3){txt='u - v';b=-1;r=u.map((x,i)=>x-v[i])}
    else{a=rng.noCero(-3,3);b=rng.noCero(-3,3);txt=`${a===1?'':a===-1?'-':a}u ${b<0?'-':'+'} ${Math.abs(b)===1?'':Math.abs(b)}v`;r=u.map((x,i)=>a*x+b*v[i])}
    const au=u.map(x=>a*x),bv=v.map(x=>b*x);
    const pasos=n===2?[paso(`Multiplica cada componente por ${a}`,`\\(${a}\\cdot${vec(u)} = (${u.map(x=>`${a}\\cdot${par(x)}`).join(',\\ ')})\\)`,'El número multiplica a todas las componentes.',a<0?{ojo:'Un número negativo cambia el signo de cada componente.'}:{}),
        final('Resultado',`\\(${c(vec(r))}\\)`,'Es el mismo vector estirado (y si el número es negativo, dado vuelta).',vec(r))]
      :[...(n>=4?[paso('Multiplica cada vector por su número',`\\(${a}u = ${vec(au)}\\), \\(${b}v = ${vec(bv)}\\)`,'Primero los números por los vectores, después la suma.')]:[]),
        paso(n===3?'Resta componente a componente':'Suma componente a componente',`\\((${(n>=4?au:u).map((x,i)=>`${x} ${n===3?'-':'+'} ${par((n>=4?bv:v)[i]*(n===3?1:1))}`).join(',\\ ')})\\)`,'Primera con primera, segunda con segunda…',n===3?{ojo:'Es u − v: a cada componente de u le restas la de v.'}:{}),
        final('Resultado',`\\(${c(vec(r))}\\)`,'Cada casilla del resultado sale solo de sus casillas.',vec(r))];
    return {...comoVector(r),enunciado:`Con \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\), calcula \\(${txt}\\)`,pasos,
      diagrama:d===2&&n!==2?planoVectores([{v:u,nombre:'u',clase:'v0'},{v:n===3?v.map(x=>-x):v,desde:u,nombre:n===3?'−v':'v',clase:'v1'},{v:r,nombre:'resultado',clase:'v2'}]):undefined,
      errores:[n===3?{si:e=>celdasIguales(e,v.map((x,i)=>x-u[i])),por:'Restaste al revés: es u − v.'}:{si:e=>celdasIguales(e,u.map((x,i)=>x*v[i])),por:'Se suma componente a componente, no se multiplica.'}],
      regla:'Las operaciones con vectores se hacen componente a componente: (a, b) + (c, d) = (a + c, b + d) y k(a, b) = (ka, kb).',pista:'Primera con primera, segunda con segunda…'};
  }
};

const interpretar=d=>d>0?'positivo: el ángulo entre ellos es agudo (menos de 90°)':d<0?'negativo: el ángulo es obtuso (más de 90°)':'cero: los vectores son perpendiculares (90°)';
// Producto punto (2D → 3D) y valor de k para que sean perpendiculares (5)
const productoPunto={
  titulo:'Producto punto',
  explicacion:'u·v se calcula multiplicando componente a componente y sumando: da un número. Si es 0, son perpendiculares.',
  alternativa:'Es como sacar el total de una cuenta: (2 cafés, 3 panes)·(precio café 4, precio pan 1) = 2·4 + 3·1 = 11. Multiplicas cada cantidad por su precio y sumas. Su signo dice si los vectores "apuntan hacia el mismo lado" (positivo), "a lados opuestos" (negativo) o forman ángulo recto (cero).',
  generar(n,rng){
    const R='Producto punto: (a, b)·(c, d) = ac + bd. Es un número; si vale 0, los vectores son perpendiculares.';
    if(n===5){const a=rng.noCero(-6,6),b=rng.noCero(-6,6),cc=rng.noCero(-6,6),k=-a*cc/b;
      return {enunciado:`¿Cuánto vale k para que \\(${vec([a,b])}\\) y \\(${vec([cc,'k'])}\\) sean perpendiculares?`,respuesta:`k = ${frac(-a*cc,b,{tex:false})}`,verificar:e=>igualNum(e,k),
        pasos:[paso('Perpendiculares → producto punto 0',`\\(${vec([a,b])}\\cdot${vec([cc,'k'])} = 0\\)`,'Dos vectores forman 90° exactamente cuando su producto punto es 0.'),
          paso('Escribe el producto punto',`\\(${a}\\cdot${par(cc)} + ${b}k = 0\\ \\Rightarrow\\ ${c(a*cc)} + ${b}k = 0\\)`,'Primera por primera más segunda por segunda.'),
          paso('Despeja k',`\\(${b}k = ${c(-a*cc)}\\)`,`El ${a*cc} pasa al otro lado con signo contrario.`),
          final('Divide',`\\(k = \\dfrac{${-a*cc}}{${b}} = ${c(frac(-a*cc,b))}\\)`,`El ${b} multiplica a k: pasa dividiendo.`,`k = ${frac(-a*cc,b,{tex:false})}`)],
        errores:[{valor:`k = ${frac(a*cc,b,{tex:false})}`,si:e=>igualNum(e,a*cc/b)&&a*cc!==0,por:'Revisa el signo al despejar k.'}],regla:R,pista:'Iguala el producto punto a 0.',teclado:'mat'}}
    const d=n<=2?2:3,u=vecAl(rng,d,n===1?5:9),v=vecAl(rng,d,n===1?5:9),prods=u.map((x,i)=>x*v[i]),r=prods.reduce((s,x)=>s+x,0);
    return {enunciado:`Calcula \\(${vec(u)} \\cdot ${vec(v)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),diagrama:enPlano([{v:u,nombre:'u'},{v,nombre:'v'}]),
      pasos:[paso('Escribe la fórmula',`\\(u\\cdot v = ${d===2?'u_1v_1 + u_2v_2':'u_1v_1 + u_2v_2 + u_3v_3'}\\)`,'Se multiplica cada componente por la que está en su misma posición.'),
        paso('Multiplica componente a componente',`\\(${u.map((x,i)=>`${par(x)}\\cdot${par(v[i])}`).join(' + ')} = ${prods.map(x=>c(par(x))).join(' + ')}\\)`,'Primera por primera, segunda por segunda…',{ojo:'Cuida los signos de cada producto.'}),
        paso('Suma los productos',`\\(${prods.map(par).join(' + ')} = ${c(r)}\\)`,'El producto punto es la suma: un solo número, no un vector.'),
        final('Interpreta el signo',`\\(u\\cdot v = ${r}\\)`,`Es ${interpretar(r)}.`,String(r))],
      pasoMal:{i:2,texto:`\\(${prods.map(par).join(' + ')} = ${r+(r%2?1:2)}\\)`,por:'la suma está mal hecha.'},
      errores:[{valor:String(u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0)),si:e=>igualNum(e,u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0))&&u.reduce((s,x)=>s+x,0)+v.reduce((s,x)=>s+x,0)!==r,por:'No se suman todas las componentes: se multiplica por pares y luego se suma.'},
        {si:e=>/[(,]/.test(String(e)),por:'El producto punto es un número, no un vector.'}],
      regla:R,pista:'Primera por primera, segunda por segunda… y suma.',teclado:'mat'};
  }
};

// Ángulo entre dos vectores en grados (con 1 decimal)
const angulo={
  titulo:'Ángulo entre vectores',
  explicacion:'cos θ = u·v / (‖u‖‖v‖); luego θ = arccos(…). Si u·v = 0, son perpendiculares (90°).',
  alternativa:'El producto punto mide "cuánto se parecen las direcciones". Si lo divides entre los largos de los dos vectores, te queda solo la parte de la dirección: el coseno del ángulo. Coseno 1 = misma dirección (0°), 0 = perpendiculares (90°), −1 = opuestos (180°).',
  generar(n,rng){
    const FACILES=[[[1,0],[0,1]],[[1,0],[1,1]],[[1,1],[-1,1]],[[2,0],[-3,0]],[[1,0],[1,0]],[[3,0],[2,2]],[[0,4],[3,3]],[[1,0],[-1,1]]];
    let u,v;
    if(n<=2){const k1=rng.entero(1,n===1?3:5),k2=rng.entero(1,n===1?3:5),s=rng.signo();[u,v]=rng.elegir(FACILES).map((x,i)=>x.map(y=>y*(i?k2:k1*s)))}
    else{const d=n>=4?3:2;do{u=vecAl(rng,d,5);v=vecAl(rng,d,5)}while(u.every(x=>!x)||v.every(x=>!x))}
    const dot=u.reduce((s,x,i)=>s+x*v[i],0),nu=Math.hypot(...u),nv=Math.hypot(...v),cos=Math.max(-1,Math.min(1,dot/(nu*nv))),ang=Math.acos(cos)*180/Math.PI,r=Math.round(ang*10)/10;
    return {enunciado:`Ángulo entre \\(u = ${vec(u)}\\) y \\(v = ${vec(v)}\\), en grados (1 decimal)`,respuesta:String(r),verificar:e=>Math.abs(num(String(e).replace('°',''))-ang)<=0.15,diagrama:enPlano([{v:u,nombre:'u'},{v,nombre:'v'}]),
      pasos:[paso('Producto punto',`\\(u\\cdot v = ${u.map((x,i)=>`${par(x)}\\cdot${par(v[i])}`).join(' + ')} = ${c(dot)}\\)`,'Multiplica por pares y suma.'),
        paso('Normas',`\\(\\lVert u\\rVert = \\sqrt{${u.map(x=>x*x).join(' + ')}} = ${c(nu.toFixed(3))}\\),\\ \\(\\lVert v\\rVert = ${c(nv.toFixed(3))}\\)`,'La longitud de cada vector (Pitágoras).'),
        paso('Coseno del ángulo',`\\(\\cos\\theta = \\dfrac{${dot}}{${nu.toFixed(3)}\\cdot${nv.toFixed(3)}} = ${c(cos.toFixed(4))}\\)`,'Dividir entre las normas deja solo la información de la dirección.',{ojo:'Divide entre el PRODUCTO de las dos normas.'}),
        final('Arcocoseno',`\\(\\theta = \\arccos(${cos.toFixed(4)}) = ${c(r)}^\\circ\\)`,`Coseno ${dot>0?'positivo → agudo':dot<0?'negativo → obtuso':'cero → 90°'}.`,String(r))],
      errores:[{valor:String(Math.round((180-ang)*10)/10),si:e=>Math.abs(num(e)-(180-ang))<=0.15&&Math.abs(ang-90)>0.2,por:'Revisa el signo del producto punto: si es negativo, el ángulo es mayor de 90°.'}],
      regla:'cos θ = u·v / (‖u‖·‖v‖). Producto punto 0 → 90°; positivo → agudo; negativo → obtuso.',pista:'Primero el producto punto y las dos normas.',teclado:'mat'};
  }
};

// Producto de matrices: 2×2 (1–3), 2×3 · 3×2 (4), 3×3 (5)
const productoMatrices={
  titulo:'Multiplicación de matrices',
  explicacion:'Cada casilla (i, j) del resultado es el producto punto de la fila i de A con la columna j de B.',
  alternativa:'Imagina que A es una tabla de "cuántos productos compra cada cliente" y B una tabla de "precio de cada producto en cada tienda". La casilla (cliente 1, tienda 1) es lo que gasta ese cliente en esa tienda: sus cantidades (fila) por los precios de esa tienda (columna), sumado. Por eso es "fila por columna".',
  generar(n,rng){
    const [f,k,cc]=n<=3?[2,2,2]:n===4?[2,3,2]:[3,3,3],R=n===1?3:n<=3?6:5;
    const A=Array.from({length:f},()=>vecAl(rng,k,R)),B=Array.from({length:k},()=>vecAl(rng,cc,R));
    const C=A.map(fi=>Array.from({length:cc},(_,j)=>fi.reduce((s,x,t)=>s+x*B[t][j],0)));
    const elem=f===k&&k===cc?A.map((fi,i)=>fi.map((x,j)=>x*B[i][j])):null;
    const casilla=(i,j)=>`\\((${A[i].join(', ')})\\cdot(${B.map(r=>r[j]).join(', ')}) = ${A[i].map((x,t)=>`${par(x)}\\cdot${par(B[t][j])}`).join(' + ')} = ${c(C[i][j])}\\)`;
    return {...comoMatriz(C),enunciado:`Calcula \\(AB\\) con \\(A = ${mat(A)}\\) y \\(B = ${mat(B)}\\)`,
      pasos:[paso('Comprueba que se puede multiplicar',`A es ${f}×${k} y B es ${k}×${cc}: el resultado es ${f}×${cc}`,'Las columnas de A tienen que ser tantas como las filas de B.'),
        paso('Casilla (1, 1): fila 1 de A por columna 1 de B',casilla(0,0),'Cada casilla es un producto punto.',{ojo:'No es casilla por casilla: es fila por columna.'}),
        paso('Casilla (1, 2): fila 1 por columna 2',casilla(0,1),'Misma fila, la siguiente columna.'),
        paso('Repite para cada fila de A y columna de B',f>1?casilla(1,0):'…','Fila i de A con columna j de B da la casilla (i, j).'),
        final('Resultado',`\\(AB = ${mat(C)}\\)`,'Todas las casillas calculadas.',C.flat().join(', '))],
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
  alternativa:'El determinante de una 2×2 mide <b>cuánto agranda el área</b> la matriz: si dibujas un cuadrado de lado 1 y lo transformas, el área del paralelogramo que resulta es |ad − bc|. Si da 0, la figura se aplasta en una línea (y la matriz no tiene inversa).',
  generar(n,rng){
    const d=n<=3?2:3,R=n===1?5:n<=3?9:5,M=Array.from({length:d},()=>vecAl(rng,d,R));
    if(d===2){const r=det2(M),[[a,b],[cc,dd]]=M;
      return {enunciado:`Calcula \\(\\det ${mat(M)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),
        pasos:[paso('Escribe la fórmula',`\\(\\det\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix} = ad - bc\\)`,'Diagonal principal menos diagonal secundaria.'),
          paso('Multiplica las diagonales',`\\(ad = ${par(a)}\\cdot${par(dd)} = ${c(a*dd)}\\),\\ \\(bc = ${par(b)}\\cdot${par(cc)} = ${c(b*cc)}\\)`,'Primero cada producto por separado.'),
          final('Resta',`\\(${a*dd} - ${par(b*cc)} = ${c(r)}\\)`,'La principal menos la secundaria.',String(r),{ojo:'Si bc es negativo, restarlo suma.'})],
        pasoMal:{i:2,texto:`\\(${a*dd} + ${par(b*cc)} = ${a*dd+b*cc}\\)`,por:'se suma bc en vez de restarlo.'},
        errores:[{valor:String(a*dd+b*cc),si:e=>igualNum(e,a*dd+b*cc)&&b*cc!==0,por:'Es ad − bc: el segundo producto se resta.'},{valor:String(a*b-cc*dd),si:e=>igualNum(e,a*b-cc*dd)&&a*b-cc*dd!==r,por:'Multiplica las diagonales: a·d (principal) menos b·c (secundaria).'}],
        regla:'det de una 2×2 = ad − bc (diagonal principal menos diagonal secundaria).',pista:'Diagonal principal menos diagonal secundaria.',teclado:'mat'}}
    const r=det3(M),cf=[M[1][1]*M[2][2]-M[1][2]*M[2][1],M[1][0]*M[2][2]-M[1][2]*M[2][0],M[1][0]*M[2][1]-M[1][1]*M[2][0]];
    const menor=j=>{const S=M.slice(1).map(f=>f.filter((_,k)=>k!==j));return `\\(\\det${mat(S)} = ${S[0][0]}\\cdot${par(S[1][1])} - ${par(S[0][1])}\\cdot${par(S[1][0])} = ${c(cf[j])}\\)`};
    return {enunciado:`Calcula \\(\\det ${mat(M)}\\)`,respuesta:String(r),verificar:e=>igualNum(e,r),
      pasos:[paso('Desarrolla por la primera fila',`\\(\\det = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}\\)`,'Cada elemento de la fila 1 por el determinante que queda al tachar su fila y su columna, con signos +, −, +.'),
        paso(`Menor de ${M[0][0]} (tacha fila 1 y columna 1)`,menor(0),'Un determinante 2×2.'),
        paso(`Menor de ${M[0][1]} (columna 2)`,menor(1),'Ojo: este lleva signo menos en la suma.',{ojo:'Los signos alternan: +, −, +.'}),
        paso(`Menor de ${M[0][2]} (columna 3)`,menor(2),'El último lleva signo más.'),
        final('Combina',`\\(${par(M[0][0])}\\cdot(${cf[0]}) - ${par(M[0][1])}\\cdot(${cf[1]}) + ${par(M[0][2])}\\cdot(${cf[2]}) = ${c(r)}\\)`,'Suma con los signos alternados.',String(r))],
      errores:[{valor:String(M[0][0]*cf[0]+M[0][1]*cf[1]+M[0][2]*cf[2]),si:e=>igualNum(e,M[0][0]*cf[0]+M[0][1]*cf[1]+M[0][2]*cf[2])&&M[0][1]*cf[1]!==0,por:'Los signos de los cofactores alternan: +, −, +.'}],
      regla:'det 3×3 por la primera fila: a₁₁·M₁₁ − a₁₂·M₁₂ + a₁₃·M₁₃ (cada M es el determinante 2×2 que queda al tachar su fila y columna).',pista:'Signos alternados: + − +.',teclado:'mat'};
  }
};

// Inversa 2×2: det ±1 (1–2, enteros) y fracciones (3–5)
const inversa={
  titulo:'Inversa de una matriz 2×2',
  explicacion:'A⁻¹ = (1/det)·(d −b; −c a): intercambia la diagonal, cambia de signo la otra y divide entre el determinante.',
  alternativa:'La inversa "deshace" lo que hace la matriz, como dividir deshace multiplicar. Para una 2×2 hay una receta fija: cambia de lugar los dos de la diagonal principal, cámbiale el signo a los otros dos y divide todo entre el determinante. Si el determinante es 0 no se puede: sería dividir entre cero.',
  generar(n,rng){
    let M,D;
    do{M=Array.from({length:2},()=>vecAl(rng,2,n<=2?4:7));D=det2(M)}while(D===0||(n<=2&&Math.abs(D)!==1)||(n>2&&Math.abs(D)===1));
    const [[a,b],[cc,d]]=M,adj=[[d,-b],[-cc,a]],inv=adj.map(f=>f.map(x=>x/D));
    const txt=adj.map(f=>f.map(x=>frac(x,D,{tex:false}))),fin=mat(adj.map(f=>f.map(x=>frac(x,D))));
    return {forma:{filas:2,cols:2},celdas:txt.flat(),respuesta:`\\(${fin}\\)`,verificar:e=>celdasIguales(e,inv.flat()),
      enunciado:`Calcula la inversa de \\(A = ${mat(M)}\\)${n>2?'<br><span class="nota">Las fracciones se escriben como 3/2.</span>':''}`,
      pasos:[paso('Calcula el determinante',`\\(\\det A = ${a}\\cdot${par(d)} - ${par(b)}\\cdot${par(cc)} = ${c(D)}\\)`,'Si fuera 0, la matriz no tendría inversa.'),
        paso('Intercambia la diagonal principal y cambia el signo de la otra',`\\(${mat([[c(d),c(-b)],[c(-cc),c(a)]])}\\)`,'Es la receta de la 2×2: (d, −b; −c, a).',{ojo:'Solo cambia de signo la diagonal secundaria.'}),
        final(`Divide todo entre ${D}`,`\\(A^{-1} = \\dfrac{1}{${D}}${mat(adj)} = ${fin}\\)`,'Así A·A⁻¹ da la identidad.',txt.flat().join(', '))],
      errores:[{si:e=>D!==1&&celdasIguales(e,adj.flat()),por:`Falta dividir entre el determinante (${D}).`},{si:e=>celdasIguales(e,[[a,b],[cc,d]].flat().map(x=>x/D)),por:'Hay que intercambiar la diagonal principal y cambiar el signo de la secundaria.'}],
      regla:'A⁻¹ = (1/det A)·[[d, −b], [−c, a]]. Solo existe si det A ≠ 0.',pista:'Primero el determinante.'};
  }
};

// Sistemas por Gauss: 2×2 (1–2) y 3×3 (3–5), solución entera
const gauss={
  titulo:'Sistemas por Gauss',
  explicacion:'Escribe la matriz aumentada, haz ceros debajo de la diagonal con operaciones entre filas y despeja de abajo hacia arriba.',
  alternativa:'Gauss es ordenar el problema en escalera: usas la primera ecuación para borrar la x de las demás, luego la segunda para borrar la y de la tercera. Al final la última ecuación tiene una sola letra (fácil de despejar) y subes sustituyendo, como bajar y volver a subir una escalera.',
  generar(n,rng){
    const d=n<=2?2:3,R=n<=3?4:6,X=vecAl(rng,d,n<=3?5:8);let A;
    do A=Array.from({length:d},()=>vecAl(rng,d,R));while((d===2?det2(A):det3(A))===0||A[0][0]===0);
    const b=A.map(f=>f.reduce((s,x,i)=>s+x*X[i],0)),v=d===2?['x','y']:['x','y','z'];
    const ecs=A.map((f,i)=>`${f.map((x,j)=>[x,v[j]]).reduce((s,[cf,l])=>cf?s+(s?(cf<0?' - ':' + '):(cf<0?'-':''))+(Math.abs(cf)===1?'':Math.abs(cf))+l:s,'')||'0'} = ${b[i]}`);
    const aum=M=>`\\left(\\begin{array}{${'c'.repeat(d)}|c}${M.map(f=>f.map(x=>Number.isInteger(x)?x:frac(Math.round(x*A[0][0]),A[0][0])).join(' & ')).join(' \\\\ ')}\\end{array}\\right)`;
    // un paso de eliminación real: fila 2 ← fila 2 − (a21/a11)·fila 1 (multiplicando por a11 para no usar fracciones)
    const F=A.map((f,i)=>[...f,b[i]]),k1=A[0][0],k2=A[1][0],F2=F[1].map((x,j)=>k1*x-k2*F[0][j]);
    return {...comoVector(X),enunciado:`Resuelve por Gauss (escribe ${v.join(', ')}):\\[\\begin{cases}${ecs.join(' \\\\ ')}\\end{cases}\\]`,
      pasos:[paso('Escribe la matriz aumentada',`\\(${aum(F)}\\)`,'Los coeficientes a la izquierda y los resultados a la derecha de la raya.'),
        paso('Haz cero la x de la fila 2',`\\(F_2 \\leftarrow ${k1}F_2 - ${par(k2)}F_1\\): \\((${F2.map((x,j)=>j===0?c(x):x).join(',\\ ')})\\)`,'Restar un múltiplo de otra fila no cambia las soluciones y deja un cero debajo de la diagonal.',{ojo:'Opera también la columna de resultados.'}),
        paso(d===3?'Repite hasta que quede escalonada':'Despeja y de la fila 2',d===3?'Haz cero la x de la fila 3 y luego la y de la fila 3 con la fila 2.':`\\(${F2[1]}y = ${F2[2]}\\ \\Rightarrow\\ y = ${c(X[1])}\\)`,d===3?'La última fila queda con una sola incógnita.':'Una ecuación con una sola letra.'),
        final('Despeja de abajo hacia arriba',`\\(${v.map((l,i)=>`${l} = ${c(X[i])}`).join(',\\ ')}\\)`,'Con la última letra conocida, sustituyes en la fila de arriba y así sucesivamente.',X.join(', '))],
      errores:[{si:e=>Array.isArray(e)&&celdasIguales([...e].reverse(),X),por:`Escribe los valores en orden: ${v.join(', ')}.`}],
      regla:'Gauss: con operaciones entre filas (sumar a una fila un múltiplo de otra) se deja la matriz escalonada; luego se despeja de abajo hacia arriba.',pista:'Usa la fila 1 para hacer cero la x de las demás.'};
  }
};

export default {'al/vector-magnitud':magnitud,'al/vector-operaciones':operaciones,'al/producto-punto':productoPunto,'al/angulo':angulo,
  'al/matriz-producto':productoMatrices,'al/determinante':determinante,'al/inversa':inversa,'al/gauss':gauss};
