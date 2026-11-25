/* Matemáticas · Álgebra — Binomio de Newton: triángulo de Pascal, coeficientes binomiales C(n,k), desarrollar (a + b)^n
   (n ≤ 6), el k-ésimo término, el coeficiente del término con x^r y aplicaciones (monedas, interés). Las expresiones se
   verifican con equivalente() (motor simbólico de verificar.js) y cada pregunta trae comprobar(): un segundo cálculo
   (multiplicar el binomio n veces o sumar la fila de arriba de Pascal). Sin DOM. */
import {prob,paso,final,marca,fmt,crearGen} from './extensiones/base.js';
import {equivalente,limpiar} from './verificar.js';
import {polinomio} from './formato.js';
import {T,simplificada} from './algebra-temas.js';

const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p3'],3:['p1','p2','p3','a1'],4:['p1','p2','p3','a1','a2'],5:['p2','p3','a1','a2']};
export const binom=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)};
const fact=n=>n<=1?1:n*fact(n-1);
const fila=n=>Array.from({length:n+1},(_,k)=>binom(n,k));
// (px + q) como texto: 2x - 3, x + 4
const bin=(p,q)=>`${p===1?'':p===-1?'-':p}x ${q<0?'-':'+'} ${Math.abs(q)}`;
const par=x=>x<0?`(${x})`:String(x);
// Coeficientes de (px + q)^n, del término independiente a x^n
const coefs=(p,q,n)=>Array.from({length:n+1},(_,r)=>binom(n,r)*p**r*q**(n-r));
// Segundo cálculo: multiplicar (px + q) n veces, coeficiente por coeficiente
function multiplicar(p,q,n){let c=[1];for(let i=0;i<n;i++){const d=Array(c.length+1).fill(0);c.forEach((v,j)=>{d[j]+=v*q;d[j+1]+=v*p});c=d}return c}
const igualesC=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
// Pregunta con respuesta de expresión (desarrollo o término): forma simplificada y equivalente
function expr({enunciado,resp,pasos,errores,comprobar}){
  const lista=errores.filter(([v])=>v&&!equivalente(v,resp)).map(([valor,por])=>({valor,si:e=>equivalente(e,valor),por}));
  return {enunciado,respuesta:resp,verificar:e=>simplificada(e,resp),teclado:'mat',
    pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:resp}],
    errores:[{si:e=>/[()]/.test(limpiar(e))&&equivalente(e,resp),por:'Es lo mismo, pero sin desarrollar: multiplica y quita los paréntesis.'},...lista],comprobar};
}
const termino=(c,r)=>polinomio(Array.from({length:r+1},(_,i)=>i===r?c:0),{tex:false})||'0';

const binomioNewton=crearGen({titulo:'Binomio de Newton',niveles:NIV,
  explicacion:'Para elevar un binomio a una potencia n sin multiplicar n veces: (a + b)ⁿ = Σ C(n,k)·a^(n−k)·b^k. Los coeficientes C(n,k) = n!/(k!(n−k)!) son la fila n del triángulo de Pascal (1; 1 1; 1 2 1; 1 3 3 1…). La potencia de a baja de n a 0 y la de b sube de 0 a n; si b es negativo, los signos se alternan.',
  alternativa:'Piensa en (a + b)³ = (a + b)(a + b)(a + b): de cada paréntesis eliges a o b. ¿De cuántas formas eliges b exactamente una vez? De 3: ese es el 3 de 3a²b. Contar esas formas es justo lo que hace C(n,k), y el triángulo de Pascal las cuenta sumando los dos números de arriba.',
  referencia:'Stewart, Precálculo 12.6 – El teorema del binomio',
  regla:'(a + b)ⁿ = Σ C(n,k)·a^(n−k)·b^k, con k de 0 a n. C(n,k) = n!/(k!(n−k)!). El término k+1 es C(n,k)·a^(n−k)·b^k; la constante también se eleva y conserva su signo.',
  pista:'Saca los coeficientes de la fila n de Pascal y eleva cada parte del binomio a su potencia.',
  tarjetas:[['(a + b)ⁿ =','Σ C(n,k)·a^(n−k)·b^k, con k = 0 … n.'],['C(n,k) =','n! / (k!·(n − k)!) — la entrada k de la fila n del triángulo de Pascal.'],['Fila 4 del triángulo de Pascal','1, 4, 6, 4, 1.'],['Término general de (a + b)ⁿ','T(k+1) = C(n,k)·a^(n−k)·b^k.']],
  plantillas:{
    // C(n,k)
    b1:{prof:'basico',f:(n,r)=>{const N=r.entero(4,n>1?10:7),k=r.entero(2,N-2),v=binom(N,k);return prob({enunciado:`Calcula el coeficiente binomial \\(\\binom{${N}}{${k}}\\).`,v,dec:0,
      pasos:[paso('Escribe la fórmula con tus números',`\\(\\binom{${N}}{${k}} = \\dfrac{${N}!}{${k}!\\,${N-k}!}\\)`,'C(n,k) = n! / (k!(n − k)!).'),
        paso('Cancela el factorial más grande de abajo',`\\(\\dfrac{${Array.from({length:Math.min(k,N-k)},(_,i)=>N-i).join('\\cdot ')}}{${Math.min(k,N-k)}!}\\)`,`Del ${N}! solo quedan los factores mayores que ${Math.max(k,N-k)}.`),
        final('Divide',marca(v),'Siempre da un entero: cuenta de cuántas formas se eligen.')],
      errores:[[fact(N)/fact(k),'Falta dividir también entre (n − k)!.'],[fact(N)/fact(N-k),'Eso son las permutaciones: en C(n,k) también se divide entre k!.'],[N*k,'C(n,k) no es n·k: usa la fórmula con factoriales.']],
      comprobar:()=>v===binom(N-1,k-1)+binom(N-1,k)})}},
    // Triángulo de Pascal
    b2:{prof:'basico',f:(n,r)=>{const N=r.entero(4,n>1?8:6),k=r.entero(2,N-2),arriba=fila(N-1),v=binom(N,k);return prob({enunciado:`La fila ${N-1} del triángulo de Pascal es ${arriba.join(', ')}. ¿Cuál es el número ${k+1} de la fila ${N}? (la fila ${N} empieza 1, ${N}, …)`,v,dec:0,
      pasos:[paso('Busca los dos números de arriba',`${arriba[k-1]} y ${arriba[k]}`,`El número ${k+1} de la fila ${N} está entre el ${k} y el ${k+1} de la fila de arriba.`),
        final('Súmalos',`${arriba[k-1]} + ${arriba[k]} = ${marca(v)}`,'Cada número de Pascal es la suma de los dos que tiene encima.')],
      errores:[[arriba[k],'Ese número es de la fila de arriba: súmale su vecino.'],[arriba[k-1]*arriba[k],'Se suman, no se multiplican.'],[binom(N,k+1),'Te recorriste una posición: la fila empieza con el 1 en la posición 1.']],
      comprobar:()=>v===fact(N)/(fact(k)*fact(N-k))})}},
    // Desarrollar (px + q)^n
    p1:{prof:'procedimiento',f:(n,r)=>{
      const N=n===1?3:n===2?r.entero(3,4):n===3?r.entero(4,5):r.entero(4,6);
      const p=n<=2?1:r.entero(1,N>5?1:2),q=(n===1?r.entero(2,3):r.entero(2,N>4?2:3))*(n>=2&&r.prob(.5)?-1:1);
      const cs=coefs(p,q,N),resp=polinomio(cs,{tex:false}),fl=fila(N);
      const partes=fl.map((c,k)=>`${c}${p===1?`\\,x^{${N-k}}`:`(${p}x)^{${N-k}}`}${par(q)}^{${k}}`).join(' + ').replace(/x\^\{0\}/g,'').replace(/\(\d+x\)\^\{0\}/g,'');
      return expr({enunciado:`Desarrolla con el binomio de Newton: \\((${bin(p,q)})^{${N}}\\)`,resp,
        pasos:[paso(`Escribe la fila ${N} del triángulo de Pascal`,`\\(${fl.join(',\\ ')}\\)`,`Son los coeficientes C(${N},k): tantos como términos (${N+1}).`),
          paso('Arma cada término',`\\(${partes}\\)`,`La potencia de ${p===1?'x':`${p}x`} baja de ${N} a 0 y la de ${q} sube de 0 a ${N}.`,{ojo:q<0?'El número negativo va entre paréntesis: con potencia impar queda negativo.':'La constante también se eleva.'}),
          final('Multiplica en cada término',`\\(${T(resp)}\\)`,'Ordena de mayor a menor potencia de x.')],
        errores:[[polinomio(cs.map((c,i)=>p**i*q**(N-i)),{tex:false}),'Olvidaste los coeficientes de Pascal: cada término lleva su C(n,k).'],
          [q<0?polinomio(cs.map(Math.abs),{tex:false}):polinomio(cs.map((c,i)=>i===0||i===N?c:0),{tex:false}),q<0?'Con b negativo los signos se alternan: (−b)^k es negativo cuando k es impar.':'(a + b)ⁿ no es aⁿ + bⁿ: faltan los términos del medio.'],
          [polinomio(fl.map((c,k)=>c*p**(N-k)*(k?q:1)).reverse(),{tex:false}),'La constante también se eleva a su potencia: b^k, no b.']],
        comprobar:()=>igualesC(cs,multiplicar(p,q,N))})}},
    // Coeficiente del término con x^r en (px + q)^n
    p2:{prof:'procedimiento',f:(n,r)=>{
      const N=n<=3?r.entero(4,5):r.entero(5,6),p=r.entero(2,3),q=r.entero(2,3)*(r.prob(.6)?-1:1),R=r.entero(1,N-1),k=N-R,C=binom(N,k),v=C*p**R*q**k;
      return prob({enunciado:`En el desarrollo de \\((${bin(p,q)})^{${N}}\\), ¿cuál es el coeficiente del término que contiene \\(x^{${R}}\\)?`,v,dec:0,
        pasos:[paso('Elige el término con la potencia pedida',`\\(\\binom{${N}}{${k}}(${p}x)^{${R}}${par(q)}^{${k}}\\)`,`Para tener x^${R}, (${p}x) va a la ${R} y la constante a la ${N} − ${R} = ${k}.`),
          paso('Calcula el coeficiente binomial',`\\(\\binom{${N}}{${k}} = ${C}\\)`,`Fila ${N} de Pascal: ${fila(N).join(', ')}.`),
          paso(`Eleva el ${p}`,`\\(${p}^{${R}} = ${p**R}\\)`,'El coeficiente de x también se eleva.'),
          paso(`Eleva el ${q}`,`\\(${par(q)}^{${k}} = ${q**k}\\)`,q<0?`Exponente ${k%2?'impar: queda negativo':'par: queda positivo'}.`:'La constante también se eleva.'),
          final('Multiplica todo',`${C} · ${p**R} · ${par(q**k)} = ${marca(v)}`,'Ese es el coeficiente de x^'+R+'.')],
        errores:[[p**R*q**k,'Olvidaste el coeficiente binomial C(n,k).'],[Math.abs(v),'Revisa el signo: la constante es negativa y su potencia es impar.'],[C*p**R*q,'La constante también se eleva a su potencia.'],[C*p*q**k,'El coeficiente de x también se eleva.']],
        comprobar:()=>multiplicar(p,q,N)[R]===v})}},
    // El k-ésimo término de (x + a)^n
    p3:{prof:'procedimiento',f:(n,r)=>{
      const N=n<=2?r.entero(4,5):r.entero(5,6),a=r.entero(2,3)*(n>=4&&r.prob(.5)?-1:1),K=r.entero(2,N),k=K-1,c=binom(N,k)*a**k,resp=termino(c,N-k);
      const ord=['','primer','segundo','tercer','cuarto','quinto','sexto','séptimo'][K];
      return expr({enunciado:`Escribe el ${ord} término del desarrollo de \\((x ${a<0?'-':'+'} ${Math.abs(a)})^{${N}}\\) (ordenado de mayor a menor potencia de x).`,resp,
        pasos:[paso('Usa el término general con k = '+k,`\\(T_{${K}} = \\binom{${N}}{${k}}\\,x^{${N-k}}${par(a)}^{${k}}\\)`,`El término número ${K} usa k = ${K} − 1 = ${k}.`),
          paso('Calcula el coeficiente binomial',`\\(\\binom{${N}}{${k}} = ${binom(N,k)}\\)`,`Fila ${N} de Pascal: ${fila(N).join(', ')}.`),
          paso(`Eleva el ${a}`,`\\(${par(a)}^{${k}} = ${a**k}\\)`,a<0?'Con exponente impar queda negativo.':'La constante también se eleva.'),
          final('Multiplica',`\\(${binom(N,k)}\\cdot ${par(a**k)}\\,x^{${N-k}} = ${T(resp)}\\)`,'Coeficiente por la potencia de x.')],
        errores:[[termino(binom(N,K)*a**K,N-K),`El término ${K} usa k = ${k}, no ${K}: el primero es k = 0.`],[termino(a**k,N-k),'Olvidaste el coeficiente binomial.'],[termino(binom(N,k)*a,N-k),'La constante también se eleva a su potencia.']],
        comprobar:()=>multiplicar(1,a,N)[N-k]===c})}},
    // Aplicación: monedas
    a1:{prof:'aplicacion',f:(n,r)=>{const N=r.entero(5,n>4?12:10),k=r.entero(2,N-2),v=binom(N,k);return prob({enunciado:`Lanzas una moneda ${N} veces y anotas la secuencia (por ejemplo AASA…). ¿En cuántas secuencias salen exactamente ${k} águilas?`,v,dec:0,unidad:'secuencias',
      pasos:[paso('Reconoce el coeficiente binomial',`\\(\\binom{${N}}{${k}}\\)`,`Eliges en cuáles de los ${N} lanzamientos sale águila: es el coeficiente de A^${k}S^${N-k} en (A + S)^${N}.`),
        paso('Escribe la fórmula',`\\(\\dfrac{${N}!}{${k}!\\,${N-k}!}\\)`,'n! / (k!(n − k)!).'),
        final('Calcula',marca(v),'Número de secuencias.')],
      errores:[[2**N,'Ese es el total de secuencias posibles, no las que tienen exactamente '+k+' águilas.'],[fact(N)/fact(N-k),'El orden de las águilas entre sí no importa: divide también entre k!.'],[N*k,'Usa C(n,k), no n·k.']],
      comprobar:()=>{let s=0;for(let m=0;m<2**N;m++){let b=0,x=m;while(x){b+=x&1;x>>=1}if(b===k)s++}return s===v}})}},
    // Aplicación: interés compuesto aproximado
    a2:{prof:'aplicacion',f:(n,r)=>{const N=r.entero(3,6),tasa=r.entero(1,4),i=tasa/100,v=1+N*i+binom(N,2)*i*i,P=r.elegir([1000,5000,10000,20000]);return prob({enunciado:`Inviertes $${P} al ${tasa} % anual durante ${N} años: el factor de crecimiento es \\((1 + ${fmt(i,2)})^{${N}}\\). Aproxímalo con los 3 primeros términos del binomio de Newton (4 decimales).`,v,dec:4,
      pasos:[paso('Primer término',`\\(\\binom{${N}}{0}1^{${N}} = 1\\)`,'La potencia de 1 siempre es 1.'),
        paso('Segundo término',`\\(\\binom{${N}}{1}(${fmt(i,2)}) = ${fmt(N*i,4)}\\)`,'C(n,1) = n.'),
        paso('Tercer término',`\\(\\binom{${N}}{2}(${fmt(i,2)})^{2} = ${fmt(binom(N,2)*i*i,4)}\\)`,`C(${N},2) = ${binom(N,2)}; los términos siguientes son muy pequeños.`),
        final('Suma',`1 + ${fmt(N*i,4)} + ${fmt(binom(N,2)*i*i,4)} = ${marca(fmt(v,4))}`,`Tu dinero se multiplica por ≈ ${fmt(v,4)}: unos $${fmt(P*v,2)}.`)],
      errores:[[1+N*i,'Faltó el tercer término, C(n,2)·i².'],[1+N*i+i*i,'El tercer término lleva C(n,2) = '+binom(N,2)+'.'],[N*i+binom(N,2)*i*i,'El primer término es 1.']],
      comprobar:()=>Math.abs((1+i)**N-v)<N**3*i**3})}}
  }});

export default {'alg/binomio-newton':binomioNewton};
