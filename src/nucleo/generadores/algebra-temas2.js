/* Generadores del tema Álgebra (parte 2): sistemas 3×3, fracciones algebraicas, exponenciales y logaritmos, funciones.
   Igual que algebra-temas.js: 3 plantillas por nivel y comprobar() con un segundo cálculo independiente. Sin DOM. */
import {num,casi,equivalente,limpiar,igualNum,lista,compilar} from './verificar.js';
import {lineal,polinomio,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {T,sg,plantillas,mal,malNum,terminos,numTxt} from './algebra-temas.js';

/* ---------- Sistemas 3×3 ---------- */
// "x = 1, y = 2, z = 3", "(1, 2, 3)", "1, 2, 3" → [x, y, z]
export function triple(e){
  const s=limpiar(e).toLowerCase(),v={};
  for(const m of s.matchAll(/([xyz])\s*=\s*([^,;xyz]+)/g))v[m[1]]=num(m[2]);
  if('x' in v&&'y' in v&&'z' in v)return [v.x,v.y,v.z];
  const l=lista(s);return l.length===3?l:null;
}
const ec3=(a,b,d,r)=>`${lineal([[a,'x'],[b,'y'],[d,'z']])} = ${r}`;
const R_S3='En un sistema 3×3, elimina una incógnita para quedarte con un sistema 2×2, resuélvelo y sustituye hacia atrás. La solución cumple las tres ecuaciones.';
const sistema3={
  titulo:'Sistemas 3×3',
  explicacion:'Con tres ecuaciones y tres incógnitas: usa una ecuación para eliminar la misma letra de las otras dos. Te queda un sistema 2×2; lo resuelves y sustituyes hacia atrás para encontrar la tercera.',
  alternativa:'Es como un rompecabezas en cascada: si una ecuación ya te dice z, la usas para encontrar y en otra, y con y y z encuentras x. Cuando no viene en cascada, tú la armas: combinas ecuaciones para que una letra desaparezca, hasta que quede una sola letra.',
  referencia:'Ver: Grossman, Álgebra lineal, sec. 1.2; Baldor, Álgebra, cap. 25.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const sol=[rng.entero(-5,5),rng.entero(-5,5),rng.entero(-5,5)],[X,Y,Z]=sol;
    const R=n<=2?3:n<=3?4:6;const rr=(a,b)=>rng.entero(a,b);
    const fila=(a,b,d)=>[a,b,d,a*X+b*Y+d*Z];
    let M,tipo;
    const P={
      1:{'cascada':()=>[fila(1,rr(-3,3),rr(-3,3)),fila(0,1,rr(-3,3)),fila(0,0,1)],
         'cascada-coef':()=>[fila(rr(1,3),rr(-3,3),rr(-3,3)),fila(0,rr(1,3),rr(-3,3)),fila(0,0,rr(2,4))],
         'sumas-de-pares':()=>[fila(1,1,0),fila(0,1,1),fila(1,0,1)]},
      2:{'falta-una':()=>[fila(1,1,1),fila(1,rng.noCero(-2,2),0),fila(0,1,rng.noCero(-2,2))],
         'x-despejada':()=>[fila(1,rng.noCero(-2,2),rng.noCero(-2,2)),fila(rng.noCero(-2,2),1,rng.noCero(-2,2)),fila(rng.noCero(-2,2),rng.noCero(-2,2),1)],
         'sumas-con-signo':()=>[fila(1,1,1),fila(1,-1,1),fila(1,1,-1)]},
      3:{'general-uno':()=>[fila(1,rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R))],
         'con-ceros':()=>[fila(1,0,rng.noCero(-R,R)),fila(0,rng.noCero(1,R),rng.noCero(-R,R)),fila(rng.noCero(-R,R),rng.noCero(-R,R),0)],
         'simetrico':()=>{const a=rng.noCero(-3,3);return [fila(1,a,1),fila(a,1,1),fila(1,1,a)]}},
      4:{'general':()=>[fila(1,rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R))],
         'primero-menos-uno':()=>[fila(-1,rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R))],
         'con-un-cero':()=>[fila(1,rr(-R,R),0),fila(rng.noCero(-R,R),0,rr(-R,R)),fila(0,rng.noCero(-R,R),rng.noCero(-R,R))]},
      5:{'general':()=>[fila(1,rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R))],
         'coeficientes-grandes':()=>[fila(rng.elegir([1,-1]),rr(-8,8),rr(-8,8)),fila(rr(-8,8),rr(-8,8),rr(-8,8)),fila(rr(-8,8),rr(-8,8),rr(-8,8))],
         'reordenar':()=>[fila(0,rng.noCero(-R,R),rr(-R,R)),fila(1,rr(-R,R),rr(-R,R)),fila(rng.noCero(-R,R),rr(-R,R),rr(-R,R))]}
    };
    // eliminación con enteros: pivote x en la fila que tenga ±1; luego y; z al final
    const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
    // eliminación: pivote x arriba, quita x de las filas 2 y 3, luego y; null si algún pivote queda en 0
    const eliminar=filas=>{let F=[...filas];const ip=F.findIndex(f=>Math.abs(f[0])===1);if(ip>0)[F[0],F[ip]]=[F[ip],F[0]];else if(F[0][0]===0){const j=F.findIndex(f=>f[0]!==0);if(j<0)return null;[F[0],F[j]]=[F[j],F[0]]}
      const p=F[0][0],comb=f=>f.map((v,i)=>p*v-f[0]*F[0][i]);let G=[comb(F[1]),comb(F[2])];if(G[0][1]===0)G=[G[1],G[0]];if(G[0][1]===0)return null;
      const q=G[0][1],H=G[1].map((v,i)=>q*v-G[1][1]*G[0][i]);if(H[2]===0)return null;return {F,G,H,p}};
    const triangular=f=>f[1][0]===0&&f[2][0]===0&&f[2][1]===0;
    let x;
    for(let k=0;k<80;k++){x=plantillas(rng,P[n]);M=[x[0],x[1],x[2]];if(det(M.map(f=>f.slice(0,3)))!==0&&(triangular(M)||eliminar(M)))break}
    tipo=x.plantilla;const filas=[M[0],M[1],M[2]];
    // pasos con los números del ejercicio
    const lin=f=>ec3(f[0],f[1],f[2],f[3]);
    const pasos=[];
    // ¿ya está en cascada (triangular)?
    const triang=triangular(filas);let el=null;
    if(triang){
      pasos.push(paso('Despeja z de la última ecuación',`\\(${filas[2][2]}z = ${filas[2][3]}\\ \\Rightarrow\\ z = ${c(Z)}\\)`,'La última ecuación solo tiene z.'));
      pasos.push(paso('Sustituye z en la segunda',`\\(${lineal([[filas[1][1],'y']])} ${sg(filas[1][2]*Z)} = ${filas[1][3]}\\ \\Rightarrow\\ y = ${c(Y)}\\)`,'Con z conocida, la segunda solo tiene y.'));
      pasos.push(paso('Sustituye y y z en la primera',`\\(${lineal([[filas[0][0],'x']])} ${sg(filas[0][1]*Y)} ${sg(filas[0][2]*Z)} = ${filas[0][3]}\\ \\Rightarrow\\ x = ${c(X)}\\)`,'Hacia atrás: cada ecuación da una letra.'));
    }else{
      el=eliminar(filas);const {F,G,H,p}=el;
      pasos.push(paso('Elimina x de las ecuaciones 2 y 3',`Con la ecuación \\(${lin(F[0])}\\):<br>\\(${ec3(0,G[0][1],G[0][2],G[0][3]).replace(/^0 = /,'0 = ')}\\)<br>\\(${ec3(0,G[1][1],G[1][2],G[1][3])}\\)`,`Multiplica y resta para que la x desaparezca (${p===1?'basta restar múltiplos de la ecuación con x sola':'multiplica cada una por '+p+' antes de restar'}).`));
      pasos.push(paso('Elimina y del sistema 2×2',`\\(${lineal([[H[2],'z']])} = ${H[3]}\\ \\Rightarrow\\ z = ${c(Z)}\\)`,'Ahora las dos ecuaciones solo tienen y y z: elimina la y igual que en un 2×2.'));
      pasos.push(paso('Sustituye hacia atrás',`\\(${lineal([[G[0][1],'y']])} ${sg(G[0][2]*Z)} = ${G[0][3]}\\ \\Rightarrow\\ y = ${c(Y)}\\);&nbsp; \\(${lineal([[F[0][0],'x']])} ${sg(F[0][1]*Y)} ${sg(F[0][2]*Z)} = ${F[0][3]}\\ \\Rightarrow\\ x = ${c(X)}\\)`,'Con z, sale y; con y y z, sale x.'));
    }
    const resp=`x = ${X}, y = ${Y}, z = ${Z}`;
    pasos.push(final('Comprueba en las tres ecuaciones',filas.map(f=>`\\(${f[0]}\\cdot${par(X)} ${sg(f[1])}\\cdot${par(Y)} ${sg(f[2])}\\cdot${par(Z)} = ${f[3]}\\) ✓`).join('<br>'),'La solución tiene que cumplir las tres.',resp));
    const igual=e=>{const v=triple(e);return !!v&&v.every((a,i)=>casi(a,sol[i]))};
    const err=(v,por)=>({valor:`x = ${v[0]}, y = ${v[1]}, z = ${v[2]}`,si:e=>{const t=triple(e);return !!t&&t.every((a,i)=>casi(a,v[i]))},por});
    const errores=[err([Y,X,Z],'Intercambiaste x e y: escribe en orden x, y, z.'),err([X,Y,-Z],'z tiene el signo cambiado: revisa la eliminación.'),err([Z,Y,X],'Intercambiaste x y z.'),err([-X,-Y,-Z],'Todos los signos están cambiados: revisa al pasar términos.')]
      .filter(e=>!igual(e.valor));
    return {plantilla:tipo,enunciado:`Resuelve el sistema (escribe x, y, z):\\[\\begin{cases} ${filas.map(lin).join(' \\\\ ')} \\end{cases}\\]`,respuesta:resp,verificar:igual,pasos,errores,regla:R_S3,
      pista:triang?'Empieza por la última ecuación: solo tiene z.':'Usa la ecuación con x sola para eliminar x de las otras dos.',teclado:'mat',
      comprobar:()=>filas.every(f=>f[0]*X+f[1]*Y+f[2]*Z===f[3])&&Math.abs(det(filas.map(f=>f.slice(0,3))))>0
        &&(triang||el.H[2]*Z===el.H[3]&&el.G[0][1]*Y+el.G[0][2]*Z===el.G[0][3]&&el.F[0][0]*X+el.F[0][1]*Y+el.F[0][2]*Z===el.F[0][3])};
  }
};

/* ---------- Fracciones algebraicas ---------- */
const R_FA='Para simplificar, factoriza arriba y abajo y cancela FACTORES iguales (nunca términos sueltos). Para sumar, usa un denominador común.';
const fracciones={
  titulo:'Fracciones algebraicas',
  explicacion:'Factoriza el numerador y el denominador y cancela los factores que se repiten. Para sumar o restar, busca el denominador común (el producto de los distintos) y ajusta cada numerador.',
  alternativa:'Funciona igual que con números: 6/8 = (2·3)/(2·4) = 3/4 porque el 2 es un FACTOR que está multiplicando arriba y abajo. En (x + 3)/3 no puedes tachar el 3: ahí está sumando, no multiplicando. Primero factoriza para ver qué está multiplicando.',
  referencia:'Ver: Baldor, Álgebra, cap. 13 y 14 (fracciones algebraicas).',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    const bin=(a)=>`x ${sg(a)}`;
    const P={
      1:{
        'monomios':()=>{const b=rng.entero(2,6),k=rng.entero(2,5)*rng.signo(),m=rng.entero(3,7),j=rng.entero(1,m-1),e=`(${k*b}x^${m})/(${b}x^${j})`,resp=`${k}x^${m-j}`.replace(/x\^1$/,'x');
          return {tex:`\\dfrac{${k*b}x^{${m}}}{${b}x^{${j}}}`,e,resp,pasos:[paso('Divide los coeficientes',`\\(${k*b} \\div ${b} = ${c(k)}\\)`,'Los números se dividen.'),final('Resta los exponentes de x',`\\(x^{${m}-${j}} = x^{${m-j}} \\Rightarrow ${c(T(resp))}\\)`,'Misma base al dividir: se restan los exponentes.',resp)],
            errores:[mal(`${k}x^${m+j}`,'Al dividir se RESTAN los exponentes.'),mal(`${k*b-b}x^${m-j}`,'Los coeficientes se dividen, no se restan.'),mal(`${k}x^${Math.round(m/j*100)/100}`,'Los exponentes se restan, no se dividen.')],
            comprobar:()=>equivalente(e,resp)}},
        'factor-comun-num':()=>{const k=rng.entero(2,9),a=r(-9,9),e=`(${k}x ${sg(k*a)})/${k}`,resp=bin(a);
          return {tex:`\\dfrac{${k}x ${sg(k*a)}}{${k}}`,e,resp,pasos:[paso('Saca factor común arriba',`\\(\\dfrac{${k}(${bin(a)})}{${k}}\\)`,`Los dos términos de arriba son múltiplos de ${k}.`),final('Cancela el factor común',`\\(${c(bin(a))}\\)`,`El ${k} multiplica a todo el numerador: se cancela.`,resp)],
            errores:[mal(`x ${sg(k*a)}`,`El ${k} divide a los dos términos: ${k*a} ÷ ${k} = ${a}.`),mal(`${k}x ${sg(a)}`,`También se divide el ${k}x.`),mal(`x ${sg(k*a-k)}`,'Dividir no es restar.')],
            comprobar:()=>equivalente(e,resp)}},
        'sacar-x':()=>{const a=r(-9,9),k=rng.entero(1,4),e=`(${k===1?'':k}x^2 ${sg(a)}x)/x`,resp=lineal([[k,'x'],[a,'']]);
          return {tex:`\\dfrac{${T(lineal([[k,'x^2'],[a,'x']]))}}{x}`,e,resp,pasos:[paso('Saca factor común x',`\\(\\dfrac{x(${resp})}{x}\\)`,'x está en los dos términos de arriba.'),final('Cancela la x',`\\(${c(resp)}\\)`,'x es factor arriba y abajo.',resp)],
            errores:[mal(lineal([[k,'x'],[a,'x']]),'Al dividir entre x, el término '+a+'x queda como '+a+'.'),mal(lineal([[k,'x^2'],[a,'']]),'Divide los dos términos entre x.'),mal(lineal([[k,'x'],[a,'']]).replace(/ [+-] \d+$/,''),'Falta el segundo término.')],
            comprobar:()=>equivalente(e,resp)}}
      },
      2:{
        'diferencia-cuadrados':()=>{const a=rng.entero(1,9),s=rng.signo(),e=`(x^2 - ${a*a})/(x ${s<0?'-':'+'} ${a})`,resp=`x ${s<0?'+':'-'} ${a}`;
          return {tex:`\\dfrac{x^{2} - ${a*a}}{x ${s<0?'-':'+'} ${a}}`,e,resp,pasos:[paso('Factoriza el numerador',`\\(\\dfrac{(x - ${a})(x + ${a})}{x ${s<0?'-':'+'} ${a}}\\)`,'Diferencia de cuadrados.'),final('Cancela el factor repetido',`\\(${c(resp)}\\)`,'Se cancelan factores, no términos.',resp)],
            errores:[mal(`x ${s<0?'-':'+'} ${a}`,'Te quedaste con el factor que se cancela.'),mal(`x - ${a*a/1}`.replace(/- (\d+)$/,(m,d)=>`- ${d}`),'No se puede tachar x² con x: primero factoriza.'),mal(`x^2 - ${a}`,'Factoriza: x² − '+a*a+' = (x − '+a+')(x + '+a+').')],
            comprobar:()=>equivalente(e,resp)}},
        'trinomio':()=>{let a,b;do{a=r(-8,8);b=r(-8,8)}while(a===b);const e=`(${polinomio([a*b,a+b,1],{tex:false})})/(${bin(a)})`,resp=bin(b);
          return {tex:`\\dfrac{${T(polinomio([a*b,a+b,1],{tex:false}))}}{${bin(a)}}`,e,resp,pasos:[paso('Factoriza el trinomio',`\\(\\dfrac{(${bin(a)})(${bin(b)})}{${bin(a)}}\\)`,`Dos números que multiplican ${a*b} y suman ${a+b}.`),final('Cancela',`\\(${c(resp)}\\)`,'El factor común arriba y abajo se cancela.',resp)],
            errores:[mal(bin(a),'Ese es el factor que se cancela.'),mal(lineal([[1,'x'],[a+b-a,'x']]).replace(/.*/,`x ${sg(a+b)}`),'No se pueden tachar términos sueltos.'),mal(bin(-b),'Revisa los signos al factorizar.')],
            comprobar:()=>equivalente(e,resp)}},
        'factor-comun-den':()=>{const k=rng.entero(2,9)*rng.signo(),a=r(-9,9),e=`(${k}x ${sg(k*a)})/(${bin(a)})`,resp=String(k);
          return {tex:`\\dfrac{${k}x ${sg(k*a)}}{${bin(a)}}`,e,resp,pasos:[paso('Saca factor común arriba',`\\(\\dfrac{${k}(${bin(a)})}{${bin(a)}}\\)`,`Los dos términos son múltiplos de ${k}.`),final('Cancela el binomio',`\\(${c(k)}\\)`,'Arriba y abajo está el mismo factor.',resp)],
            errores:[mal(`${k}x`,`El ${k*a} también es parte del factor ${k}(x ${sg(a)}).`),mal(`${-k}`,'Revisa el signo del factor común.'),mal(`${k}x ${sg(k*a)}`,'Falta cancelar el binomio de abajo.')],
            comprobar:()=>equivalente(e,resp)}}
      },
      3:{
        'multiplicar':()=>{const a=rng.entero(1,8),k=rng.entero(2,6),e=`((x^2 - ${a*a})/(${k}x))*((${k}x^2)/(x + ${a}))`,resp=`x^2 - ${a}x`;
          return {tex:`\\dfrac{x^{2} - ${a*a}}{${k}x}\\cdot\\dfrac{${k}x^{2}}{x + ${a}}`,e,resp,pasos:[paso('Factoriza todo',`\\(\\dfrac{(x - ${a})(x + ${a})}{${k}x}\\cdot\\dfrac{${k}x\\cdot x}{x + ${a}}\\)`,'Diferencia de cuadrados y factores de '+k+'x².'),
            paso('Cancela factores repetidos',`\\((x - ${a})\\cdot ${c('x')}\\)`,`Se cancelan \\(x + ${a}\\) y \\(${k}x\\).`),final('Desarrolla',`\\(${c(T(resp))}\\)`,'Multiplica lo que quedó.',resp)],
            errores:[mal(`x - ${a}`,'Sobra una x: '+k+'x² entre '+k+'x deja x.'),mal(`x^2 + ${a}x`,'Se cancela (x + '+a+'), queda (x − '+a+').'),mal(`${k}x^2 - ${k*a}x`,`El ${k} se cancela con el de abajo.`)],
            comprobar:()=>equivalente(e,resp)}},
        'dividir':()=>{const a=r(-7,7),k=rng.entero(2,6),e=`((${k}x ${sg(k*a)})/(x^2))/((${bin(a)})/x)`,resp=`${k}/x`;
          return {tex:`\\dfrac{${k}x ${sg(k*a)}}{x^{2}} \\div \\dfrac{${bin(a)}}{x}`,e,resp,pasos:[paso('Multiplica por la fracción volteada',`\\(\\dfrac{${k}(${bin(a)})}{x^{2}}\\cdot\\dfrac{x}{${bin(a)}}\\)`,'Dividir es multiplicar por el recíproco.'),final('Cancela',`\\(${c(`\\dfrac{${k}}{x}`)}\\)`,'Se cancelan el binomio y una x.',resp)],
            errores:[mal(`${k}x`,'Al voltear, la x queda arriba solo una vez: x/x² = 1/x.'),mal(`${k}`,'Queda una x abajo: x/x² = 1/x.'),mal(`${k}/x^3`,'Dividir es multiplicar por la fracción volteada, no multiplicar directo.')],
            comprobar:()=>equivalente(e,resp)}},
        'trinomio-trinomio':()=>{let a,b,d;do{a=r(-6,6);b=r(-6,6);d=r(-6,6)}while(a===b||a===d||b===d);const e=`(${polinomio([a*b,a+b,1],{tex:false})})/(${polinomio([a*d,a+d,1],{tex:false})})`,resp=`(${bin(b)})/(${bin(d)})`;
          return {tex:`\\dfrac{${T(polinomio([a*b,a+b,1],{tex:false}))}}{${T(polinomio([a*d,a+d,1],{tex:false}))}}`,e,resp,pasos:[paso('Factoriza arriba y abajo',`\\(\\dfrac{(${bin(a)})(${bin(b)})}{(${bin(a)})(${bin(d)})}\\)`,'Dos trinomios x² + bx + c.'),final('Cancela el factor común',`\\(${c(`\\dfrac{${bin(b)}}{${bin(d)}}`)}\\)`,`\\(${bin(a)}\\) está arriba y abajo.`,resp)],
            errores:[mal(`(${bin(a)})/(${bin(d)})`,'Ese es el factor que se cancela; queda el otro.'),mal(`${a*b}/${a*d}`,'No se tachan los x²: primero factoriza.'),mal(`(${bin(b)})/(${bin(-d)})`,'Revisa el signo al factorizar el denominador.')],
            comprobar:()=>equivalente(e,resp)}}
      },
      4:{
        'misma-base':()=>{const a=r(-9,9),p=r(-9,9);let q;do q=r(-9,9);while(p+q===0);const e=`${p}/(${bin(a)}) + ${par(q)}/(${bin(a)})`,resp=`${p+q}/(${bin(a)})`;
          return {tex:`\\dfrac{${p}}{${bin(a)}} + \\dfrac{${q}}{${bin(a)}}`,e,resp,pasos:[paso('Mismo denominador',`\\(\\dfrac{${p} ${sg(q)}}{${bin(a)}}\\)`,'Se suman los numeradores y el denominador se conserva.'),final('Suma',`\\(${c(`\\dfrac{${p+q}}{${bin(a)}}`)}\\)`,'El denominador NO se suma.',resp)],
            errores:[mal(`${p+q}/(2x ${sg(2*a)})`,'El denominador se conserva: no se suman los de abajo.'),mal(`${p*q}/(${bin(a)})`,'Los numeradores se suman, no se multiplican.'),mal(`${p-q}/(${bin(a)})`,'Revisa el signo del segundo numerador.')],
            comprobar:()=>equivalente(e,resp)}},
        'resta-numerador-binomio':()=>{const a=r(-8,8),b=r(-8,8),e=`(2x ${sg(b)})/(${bin(a)}) - (x ${sg(b-a)})/(${bin(a)})`,resp='1';
          return {tex:`\\dfrac{2x ${sg(b)}}{${bin(a)}} - \\dfrac{x ${sg(b-a)}}{${bin(a)}}`,e,resp,pasos:[paso('Resta los numeradores (con paréntesis)',`\\(\\dfrac{2x ${sg(b)} - (x ${sg(b-a)})}{${bin(a)}}\\)`,'El menos afecta a TODO el segundo numerador.'),
            paso('Simplifica el numerador',`\\(\\dfrac{${c(bin(a))}}{${bin(a)}}\\)`,`\\(2x - x = x\\) y \\(${b} - ${par(b-a)} = ${a}\\).`),final('Cancela',`\\(${c(1)}\\)`,'Algo entre sí mismo da 1.',resp)],
            errores:[mal(`(x ${sg(2*b-a)})/(${bin(a)})`,'El menos también cambia el signo del número del segundo numerador.'),mal('0','El numerador no da cero: x − x no es lo que queda; 2x − x = x.'),mal(`(3x ${sg(2*b-a)})/(${bin(a)})`,'Es una resta: 2x − x.')],
            comprobar:()=>equivalente(e,resp)}},
        'x-mas-a':()=>{const a=r(-9,9),e=`x/(${bin(a)}) + ${par(a)}/(${bin(a)})`,resp='1';
          return {tex:`\\dfrac{x}{${bin(a)}} + \\dfrac{${a}}{${bin(a)}}`,e,resp,pasos:[paso('Mismo denominador: suma numeradores',`\\(\\dfrac{${c(bin(a))}}{${bin(a)}}\\)`,'Se suman arriba, abajo se conserva.'),final('Simplifica',`\\(${c(1)}\\)`,'Numerador y denominador son iguales.',resp)],
            errores:[mal(`(x ${sg(a)})/(2x ${sg(2*a)})`,'El denominador no se suma.'),mal(`x ${sg(a)}`,'Falta dividir entre el denominador.'),mal('0','Numerador igual al denominador da 1, no 0.')],
            comprobar:()=>equivalente(e,resp)}}
      },
      5:{
        'distinto-denominador':()=>{const p=r(-6,6),q=r(-6,6),a=r(-7,7),e=`${p}/x + ${par(q)}/(${bin(a)})`,resp=`(${lineal([[p+q,'x'],[p*a,'']])})/(x(${bin(a)}))`;
          return {tex:`\\dfrac{${p}}{x} + \\dfrac{${q}}{${bin(a)}}`,e,resp,pasos:[paso('Denominador común',`\\(x(${bin(a)})\\)`,'El producto de los dos denominadores (no tienen factores en común).'),
            paso('Ajusta cada numerador',`\\(\\dfrac{${p}(${bin(a)}) + ${par(q)}x}{x(${bin(a)})}\\)`,'Cada numerador se multiplica por lo que le falta a su denominador.'),final('Simplifica el numerador',`\\(${c(`\\dfrac{${lineal([[p+q,'x'],[p*a,'']])}}{x(${bin(a)})}`)}\\)`,`\\(${p}x ${sg(p*a)} ${sg(q)}x\\).`,resp)],
            errores:[mal(`${p+q}/(2x ${sg(a)})`,'No se suman los denominadores: busca el denominador común.'),mal(`(${lineal([[p+q,'x'],[a,'']])})/(x(${bin(a)}))`,`El ${p} multiplica a todo (x ${sg(a)}): ${p}·${par(a)} = ${p*a}.`),mal(`${p+q}/(x(${bin(a)}))`,'Cada numerador se multiplica por el denominador que le falta.')],
            comprobar:()=>equivalente(e,resp)}},
        'resta-conjugados':()=>{const a=rng.entero(1,9),e=`1/(x - ${a}) - 1/(x + ${a})`,resp=`${2*a}/(x^2 - ${a*a})`;
          return {tex:`\\dfrac{1}{x - ${a}} - \\dfrac{1}{x + ${a}}`,e,resp,pasos:[paso('Denominador común',`\\((x - ${a})(x + ${a}) = x^{2} - ${a*a}\\)`,'Producto de los dos denominadores.'),
            paso('Ajusta y resta',`\\(\\dfrac{(x + ${a}) - (x - ${a})}{x^{2} - ${a*a}}\\)`,'Cuidado: el menos afecta a todo el segundo numerador.'),final('Simplifica',`\\(${c(`\\dfrac{${2*a}}{x^{2} - ${a*a}}`)}\\)`,`\\(x + ${a} - x + ${a} = ${2*a}\\).`,resp)],
            errores:[mal(`0/(x^2 - ${a*a})`,'El menos cambia el signo del −'+a+': queda +'+a+'.'),mal(`0`,'No se restan los denominadores.'),mal(`${-2*a}/(x^2 - ${a*a})`,'Revisa el orden: (x + '+a+') − (x − '+a+').')],
            comprobar:()=>equivalente(e,resp)}},
        'dos-binomios':()=>{let a,b;do{a=r(-6,6);b=r(-6,6)}while(a===b);const p=r(-4,4),q=r(-4,4);if(p+q===0)return P[5]['distinto-denominador']();
          const e=`${p}/(${bin(a)}) + ${par(q)}/(${bin(b)})`,resp=`(${lineal([[p+q,'x'],[p*b+q*a,'']])})/((${bin(a)})(${bin(b)}))`;
          return {tex:`\\dfrac{${p}}{${bin(a)}} + \\dfrac{${q}}{${bin(b)}}`,e,resp,pasos:[paso('Denominador común',`\\((${bin(a)})(${bin(b)})\\)`,'Producto de los dos binomios.'),
            paso('Ajusta cada numerador',`\\(\\dfrac{${p}(${bin(b)}) + ${par(q)}(${bin(a)})}{(${bin(a)})(${bin(b)})}\\)`,'Lo que le falta a cada denominador.'),final('Simplifica el numerador',`\\(${c(`\\dfrac{${lineal([[p+q,'x'],[p*b+q*a,'']])}}{(${bin(a)})(${bin(b)})}`)}\\)`,'Junta x con x y números con números.',resp)],
            errores:[mal(`${p+q}/(2x ${sg(a+b)})`,'No se suman los denominadores.'),mal(`(${lineal([[p+q,'x'],[p*a+q*b,'']])})/((${bin(a)})(${bin(b)}))`,'Cada numerador se multiplica por el OTRO binomio.'),mal(`${p+q}/((${bin(a)})(${bin(b)}))`,'Te faltó multiplicar cada numerador por el binomio que le falta.')],
            comprobar:()=>equivalente(e,resp)}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {plantilla:x.plantilla,enunciado:`Simplifica: \\(${x.tex}\\)`,respuesta:x.resp,verificar:e=>equivalente(e,x.resp)&&terminos(e)<=Math.max(1,terminos(x.resp)),pasos:x.pasos,
      errores:[{si:e=>equivalente(e,x.resp)&&terminos(e)>terminos(x.resp),por:'Es equivalente, pero todavía se puede simplificar más.'},...x.errores],
      regla:R_FA,pista:'Factoriza arriba y abajo antes de cancelar.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Exponenciales y logaritmos ---------- */
const R_LOG='log_b(x) = y significa bʸ = x. Propiedades: log(mn) = log m + log n, log(m/n) = log m − log n, log(mᵏ) = k·log m.';
const logaritmos={
  titulo:'Exponenciales y logaritmos',
  explicacion:'Un logaritmo responde "¿a qué exponente elevo la base para obtener este número?": log₂ 8 = 3 porque 2³ = 8. Para resolver bˣ = número, escribe los dos lados con la misma base e iguala exponentes, o aplica logaritmos.',
  alternativa:'Piensa en "cuántas veces duplico". Empiezo en 1 y duplico: 2, 4, 8, 16. Para llegar a 16 dupliqué 4 veces: log₂ 16 = 4. El logaritmo cuenta cuántas veces multiplicas por la base. Por eso log₁₀ 1000 = 3: tres ceros, tres veces por 10.',
  referencia:'Ver: Stewart, Precálculo, cap. 4 (funciones exponenciales y logarítmicas).',
  profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const base=()=>rng.elegir([2,3,5,10]),pot=(b,k)=>b**k;
    const lg=(b,x)=>b===10?`\\log ${x}`:`\\log_{${b}} ${x}`;
    const L=(b,x)=>Math.log(x)/Math.log(b);
    const P={
      1:{
        'log-directo':()=>{const b=base(),k=rng.entero(1,b===10?5:b===2?7:4),x=pot(b,k);return {tex:`${lg(b,x)}`,pre:'Calcula',v:k,
          pasos:[paso('Pregunta: ¿a qué exponente elevo la base?',`\\(${b}^{?} = ${x}\\)`,'Eso es un logaritmo.'),final('Cuenta',`\\(${b}^{${k}} = ${x} \\Rightarrow ${c(k)}\\)`,`Multiplicas ${k} veces por ${b}.`,String(k))],
          errores:[malNum(x/b,'No es dividir entre la base: es el exponente.'),malNum(x,'El logaritmo es el exponente, no el número.'),malNum(k+1,'Cuenta bien: '+b+'^'+k+' = '+x+'.')],comprobar:k===Math.round(L(b,x))}},
        'potencia':()=>{const b=rng.elegir([2,3,4,5]),k=rng.entero(2,b===2?8:4),x=pot(b,k);return {tex:`${b}^{${k}}`,pre:'Calcula',v:x,
          pasos:[paso('Multiplica la base por sí misma',`\\(${Array(k).fill(b).join('\\cdot')}\\)`,`El exponente dice cuántas veces.`),final('Resultado',`\\(${c(x)}\\)`,'Potencia.',String(x))],
          errores:[malNum(b*k,'No es base por exponente.'),malNum(pot(b,k-1),'Multiplicaste una vez menos.'),malNum(pot(k,b),'Intercambiaste base y exponente.')],comprobar:x===Math.pow(b,k)}},
        'log-uno':()=>{const b=base(),q=rng.elegir(['uno','base']);const x=q==='uno'?1:b,v=q==='uno'?0:1;return {tex:lg(b,x),pre:'Calcula',v,
          pasos:[paso('Pregunta: ¿a qué exponente elevo la base?',`\\(${b}^{?} = ${x}\\)`,q==='uno'?'Todo número (distinto de 0) elevado a 0 da 1.':'Cualquier base elevada a 1 da ella misma.'),final('Resultado',`\\(${c(v)}\\)`,q==='uno'?'log_b 1 = 0.':'log_b b = 1.',String(v))],
          errores:[malNum(1-v,q==='uno'?'b⁰ = 1, así que log 1 = 0.':'b¹ = b.'),malNum(b,'El logaritmo es el exponente, no la base.'),malNum(-1,'Revisa: '+b+'^'+v+' = '+x+'.')],comprobar:v===Math.round(L(b,x))}}
      },
      2:{
        'log-fraccion':()=>{const b=rng.elegir([2,3,5,10]),k=rng.entero(1,3),x=pot(b,k);return {tex:b===10?`\\log \\dfrac{1}{${x}}`:`\\log_{${b}} \\dfrac{1}{${x}}`,pre:'Calcula',v:-k,
          pasos:[paso('Escribe 1/'+x+' como potencia de '+b,`\\(\\dfrac{1}{${x}} = ${b}^{-${k}}\\)`,'Un exponente negativo es "uno entre".'),final('El logaritmo es el exponente',`\\(${c(-k)}\\)`,'log_b(bᵏ) = k.',String(-k))],
          errores:[malNum(k,'1/'+x+' es '+b+' a la −'+k+': el signo es negativo.'),malNum(1/k,'No es 1/'+k+': es el exponente negativo.'),malNum(0,'Solo log 1 = 0.')],comprobar:Math.abs(L(b,1/x)+k)<1e-9}},
        'ec-exponencial':()=>{const b=rng.elegir([2,3,5]),k=rng.entero(2,b===2?7:4);return {tex:`${b}^{x} = ${pot(b,k)}`,pre:'Resuelve',v:k,
          pasos:[paso('Escribe el número como potencia de '+b,`\\(${b}^{x} = ${b}^{${k}}\\)`,'Misma base en los dos lados.'),final('Iguala exponentes',`\\(x = ${c(k)}\\)`,'Si las bases son iguales, los exponentes también.',`x = ${k}`)],
          errores:[malNum(pot(b,k)/b,'No se divide entre la base.'),malNum(pot(b,k),'x es el exponente.'),malNum(k-1,'Revisa: '+b+'^'+k+' = '+pot(b,k)+'.')],comprobar:Math.pow(b,k)===pot(b,k)}},
        'ec-log':()=>{const b=rng.elegir([2,3,4,5,10]),k=rng.entero(1,b===2?6:3);return {tex:`${lg(b,'x')} = ${k}`,pre:'Resuelve',v:pot(b,k),
          pasos:[paso('Pasa a forma exponencial',`\\(x = ${b}^{${k}}\\)`,'log_b x = k significa bᵏ = x.'),final('Calcula',`\\(x = ${c(pot(b,k))}\\)`,'Potencia.',`x = ${pot(b,k)}`)],
          errores:[malNum(b*k,'No es base por k: es base elevada a k.'),malNum(pot(k,b),'Intercambiaste base y exponente.'),malNum(k,'x es el número, no el exponente.')],comprobar:Math.abs(L(b,pot(b,k))-k)<1e-9}}
      },
      3:{
        'exponente-lineal':()=>{const b=rng.elegir([2,3,5]),a=rng.entero(2,4),x0=rng.entero(-2,4),d=rng.noCero(-3,3),k=a*x0+d;if(k<0||k>(b===2?9:5))return P[3]['misma-base']();
          return {tex:`${b}^{${a}x ${sg(d)}} = ${pot(b,k)}`,pre:'Resuelve',v:x0,
          pasos:[paso('Misma base',`\\(${b}^{${a}x ${sg(d)}} = ${b}^{${k}}\\)`,`${pot(b,k)} = ${b}^${k}.`),paso('Iguala exponentes',`\\(${a}x ${sg(d)} = ${k}\\)`,'Bases iguales, exponentes iguales.'),final('Despeja',`\\(x = ${c(x0)}\\)`,'Ecuación lineal.',`x = ${x0}`)],
          errores:[malNum((k+d)/a,`El ${d} pasa con el signo contrario.`),malNum(k-d,`Falta dividir entre ${a}.`),malNum(k,'Iguala exponentes y despeja x.')],comprobar:Math.pow(b,a*x0+d)===pot(b,k)}},
        'misma-base':()=>{const [b,B,p]=rng.elegir([[4,2,2],[8,2,3],[9,3,2],[27,3,3],[25,5,2]]),k=rng.elegir([1,2,3,4,5].filter(q=>q%p!==0));// b^x = B^k → x = k/p
          return {tex:`${b}^{x} = ${pot(B,k)}`,pre:'Resuelve',v:k/p,
          pasos:[paso(`Escribe todo como potencia de ${B}`,`\\((${B}^{${p}})^{x} = ${B}^{${k}}\\)`,`${b} = ${B}^${p}.`),paso('Iguala exponentes',`\\(${p}x = ${k}\\)`,'Potencia de potencia: se multiplican.'),final('Despeja',`\\(x = ${c(frac(k,p))}\\)`,'Puede ser fracción.',`x = ${frac(k,p,{tex:false})}`)],
          errores:[malNum(k,'Primero escribe '+b+' como potencia de '+B+'.'),malNum(k*p,`Se divide entre ${p}, no se multiplica.`),malNum(p/k,'Al revés: x = '+k+'/'+p+'.')],comprobar:Math.abs(Math.pow(b,k/p)-pot(B,k))<1e-6}},
        'propiedad-suma':()=>{const b=rng.elegir([2,3,10]),k=rng.entero(2,b===2?6:3),m=pot(b,rng.entero(1,k-1))*rng.elegir([1]),q=pot(b,k)/m;
          const f=rng.elegir([[2,pot(b,k)/2],[m,q]]);const [u,w]=Number.isInteger(f[1])&&f[0]>1&&f[1]>1?f:[m,q];
          return {tex:`${lg(b,u)} + ${lg(b,w)}`,pre:'Calcula',v:k,
          pasos:[paso('Junta en un solo logaritmo',`\\(${lg(b,`(${u}\\cdot${w})`)} = ${lg(b,u*w)}\\)`,'log m + log n = log(m·n).'),final('Calcula',`\\(${b}^{${k}} = ${u*w} \\Rightarrow ${c(k)}\\)`,'Exponente al que se eleva la base.',String(k))],
          errores:[malNum(L(b,u+w),'La suma de logaritmos es el log del PRODUCTO, no de la suma.'),malNum(u*w,'El resultado es el exponente, no el número.'),malNum(k+1,'Revisa la potencia.')],comprobar:Math.abs(L(b,u)+L(b,w)-k)<1e-9}}
      },
      4:{
        'propiedad-resta':()=>{const b=rng.elegir([2,3,10]),k=rng.entero(1,b===2?5:3),w=rng.elegir([3,5,6,7]),u=pot(b,k)*w;
          return {tex:`${lg(b,u)} - ${lg(b,w)}`,pre:'Calcula',v:k,
          pasos:[paso('Junta en un solo logaritmo',`\\(${lg(b,`\\dfrac{${u}}{${w}}`)} = ${lg(b,u/w)}\\)`,'log m − log n = log(m/n).'),final('Calcula',`\\(${c(k)}\\)`,`${b}^${k} = ${u/w}.`,String(k))],
          errores:[malNum(L(b,u-w),'La resta de logaritmos es el log del COCIENTE.'),malNum(u/w,'El resultado es el exponente.'),malNum(-k,'Revisa el signo.')],comprobar:Math.abs(L(b,u)-L(b,w)-k)<1e-9}},
        'propiedad-potencia':()=>{const b=rng.elegir([2,3,10]),j=rng.entero(1,3),m=rng.entero(2,4),x=pot(b,j);
          return {tex:`${m}\\,${lg(b,x)}`,pre:'Calcula',v:m*j,
          pasos:[paso('Calcula el logaritmo',`\\(${lg(b,x)} = ${j}\\)`,`${b}^${j} = ${x}.`),final('Multiplica',`\\(${m}\\cdot${j} = ${c(m*j)}\\)`,'También: k·log m = log(mᵏ).',String(m*j))],
          errores:[malNum(j,`Falta multiplicar por ${m}.`),malNum(m+j,'Es un producto, no una suma.'),malNum(Math.pow(j,m),'k·log m no es (log m)ᵏ.')],comprobar:Math.abs(m*L(b,x)-m*j)<1e-9}},
        'ec-log-producto':()=>{const b=rng.elegir([2,3]),k=rng.entero(3,b===2?7:4),cc=pot(b,rng.entero(1,2)),x=pot(b,k)/cc;
          return {tex:`${lg(b,'x')} + ${lg(b,cc)} = ${k}`,pre:'Resuelve',v:x,
          pasos:[paso('Junta los logaritmos',`\\(${lg(b,`(${cc}x)`)} = ${k}\\)`,'log m + log n = log(mn).'),paso('Forma exponencial',`\\(${cc}x = ${b}^{${k}} = ${pot(b,k)}\\)`,'log_b A = k ⇒ A = bᵏ.'),final('Despeja',`\\(x = ${c(x)}\\)`,`Divide entre ${cc}.`,`x = ${x}`)],
          errores:[malNum(pot(b,k),`Falta dividir entre ${cc}.`),malNum(pot(b,k)-cc,'Es un producto dentro del log: se divide, no se resta.'),malNum(pot(b,k-Math.round(L(b,cc)))*cc,'Revisa el despeje.')],comprobar:Math.abs(L(b,x)+L(b,cc)-k)<1e-9}}
      },
      5:{
        'cambio-base':()=>{const [b,B,p]=rng.elegir([[4,2,2],[8,2,3],[9,3,2],[25,5,2],[27,3,3]]),k=rng.elegir([1,2,3,4,5,7].filter(q=>q%p!==0)),x=pot(B,k);
          return {tex:`\\log_{${b}} ${x}`,pre:'Calcula (puede ser fracción)',v:k/p,
          pasos:[paso(`Escribe base y número como potencias de ${B}`,`\\(${b} = ${B}^{${p}},\\ ${x} = ${B}^{${k}}\\)`,'Misma base.'),paso('Plantea',`\\((${B}^{${p}})^{y} = ${B}^{${k}} \\Rightarrow ${p}y = ${k}\\)`,'El log es el exponente y.'),final('Despeja',`\\(y = ${c(frac(k,p))}\\)`,'Exponente fraccionario.',frac(k,p,{tex:false}))],
          errores:[malNum(k,'Ese sería el log en base '+B+'.'),malNum(k*p,'Se divide entre '+p+'.'),malNum(p/k,'Al revés.')],comprobar:Math.abs(L(b,x)-k/p)<1e-9}},
        'ln':()=>{const cc=rng.elegir([2,3,5,7,10,20]),a=rng.entero(1,3);return {tex:`e^{${a}x} = ${cc}`,pre:'Resuelve (2 decimales)',v:Math.log(cc)/a,tol:0.006,
          pasos:[paso('Aplica ln a los dos lados',`\\(${a}x = \\ln ${cc}\\)`,'ln es el logaritmo en base e: ln(eᵘ) = u.'),final('Despeja',`\\(x = \\dfrac{\\ln ${cc}}{${a}} \\approx ${c((Math.log(cc)/a).toFixed(2))}\\)`,'ln '+cc+' ≈ '+Math.log(cc).toFixed(3)+'.',(Math.log(cc)/a).toFixed(2))],
          errores:[malNum(+(cc/a).toFixed(2),'Aplica ln: e no se "pasa dividiendo".'),malNum(+Math.log(cc).toFixed(2),a>1?`Falta dividir entre ${a}.`:'Revisa el despeje.'),malNum(+(Math.log10(cc)/a).toFixed(2),'Es ln (base e), no log base 10.')],comprobar:Math.abs(Math.exp(a*Math.log(cc)/a)-cc)<1e-9}},
        'duplicar':()=>{const d=rng.entero(2,9),k=rng.entero(2,6),f=pot(2,k);return {pre:'',tex:'',enunciado:`Una inversión se duplica cada ${d} años. ¿En cuántos años se multiplica por ${f}?`,v:k*d,
          pasos:[paso('Plantea con potencias de 2',`\\(2^{n} = ${f} \\Rightarrow n = \\log_{2} ${f} = ${k}\\)`,`${k} duplicaciones.`),final('Multiplica por el tiempo de cada duplicación',`\\(${k}\\cdot${d} = ${c(k*d)}\\) años`,'Cada duplicación tarda '+d+' años.',String(k*d))],
          errores:[malNum(f*d/2,'No es proporcional al factor: cuenta cuántas veces se duplica.'),malNum(k,'Esas son las duplicaciones; falta multiplicar por '+d+' años.'),malNum(f*d,'Cuenta duplicaciones (log₂ '+f+'), no el factor.')],comprobar:Math.pow(2,k*d/d)===f}}
      }
    };
    const x=plantillas(rng,P[n]);const tol=x.tol||1e-6;
    const vs=Number.isInteger(x.v)?String(x.v):Math.abs(x.v*6-Math.round(x.v*6))<1e-9?frac(Math.round(x.v*6),6,{tex:false}):x.v.toFixed(2);
    const resp=x.pasos.at(-1).res;
    return {plantilla:x.plantilla,enunciado:x.enunciado||`${x.pre}: \\(${x.tex}\\)`,respuesta:resp||vs,verificar:e=>{const v=num(e);return Number.isFinite(v)&&Math.abs(v-x.v)<=tol*Math.max(1,Math.abs(x.v))},
      pasos:x.pasos,errores:x.errores,regla:R_LOG,pista:'¿A qué exponente hay que elevar la base?',teclado:'mat',comprobar:()=>x.comprobar!==false};
  }
};

/* ---------- Funciones y gráficas ---------- */
// "y = 2x + 3", "f(x) = 2x+3", "2x + 3" → texto de la expresión en x
const derecha=e=>limpiar(e).replace(/^\s*(y|f\s*\(\s*x\s*\)|f\^?-1\s*\(\s*x\s*\)|f⁻¹\s*\(\s*x\s*\))\s*=\s*/i,'');
// "y = (1/2)x - 3/4" a partir de pendiente y ordenada (números)
const rectaFmt=(m,b)=>{const mt=numTxt(m),bt=numTxt(Math.abs(b)),mx=m===1?'x':m===-1?'-x':mt.includes('/')?`(${mt})x`:`${mt}x`;return `y = ${m===0?'':mx}${b===0?(m===0?'0':''):`${m===0?(b<0?'-':''):` ${b<0?'-':'+'} `}${bt}`}`};
const R_FUN='Una función asigna a cada x un único valor f(x). Recta: y = mx + b, con pendiente m = (y₂ − y₁)/(x₂ − x₁) y ordenada al origen b.';
const funciones={
  titulo:'Funciones y gráficas',
  explicacion:'Evaluar f(a) es cambiar x por a. Una recta y = mx + b tiene pendiente m (cuánto sube por cada paso a la derecha) y corta el eje y en b. Componer f(g(x)) es meter g dentro de f.',
  alternativa:'Una función es una máquina: entra un número y sale otro. f(x) = 2x + 3 es "duplica y suma 3": si entra 4, sale 11. La pendiente de una recta es como la inclinación de una rampa: 2 significa que por cada metro que avanzas, subes 2.',
  referencia:'Ver: Stewart, Precálculo, cap. 2 y sec. 1.10 (rectas).',
  profundidad:n=>n<=1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    const recta=(m,b)=>`y = ${lineal([[m,'x'],[b,'']])}`;
    const P={
      1:{
        'evaluar-lineal':()=>{const a=r(-9,9),b=r(-9,9),k=r(-6,6),v=a*k+b;return {tex:`f(x) = ${lineal([[a,'x'],[b,'']])}`,preg:`f(${k})`,v,resp:String(v),
          pasos:[paso('Cambia x por '+k,`\\(f(${k}) = ${a}\\cdot${par(k)} ${sg(b)}\\)`,'Evaluar es sustituir.'),final('Calcula',`\\(${c(v)}\\)`,'Primero multiplica, luego suma.',String(v))],
          errores:[malNum(a+k+b,'ax es a POR x.'),malNum(a*k,`Falta el ${b}.`),malNum(-a*k+b,'Revisa el signo de la multiplicación.')],comprobar:()=>casi(compilar(lineal([[a,'x'],[b,'']]))({x:k}),v)}},
        'evaluar-cuadratica':()=>{const b=rng.entero(-6,6),d=r(-9,9),k=r(-4,4),v=k*k+b*k+d,e=polinomio([d,b,1],{tex:false});return {tex:`f(x) = ${T(e)}`,preg:`f(${k})`,v,resp:String(v),
          pasos:[paso('Sustituye (con paréntesis)',`\\(f(${k}) = ${par(k)}^{2} ${sg(b)}\\cdot${par(k)} ${sg(d)}\\)`,'Los negativos van entre paréntesis.'),final('Calcula',`\\(${k*k} ${sg(b*k)} ${sg(d)} = ${c(v)}\\)`,'Primero la potencia.',String(v))],
          errores:[malNum(-k*k+b*k+d,`\\(${par(k)}^{2} = ${k*k}\\), positivo.`),malNum(2*k+b*k+d,'x² no es 2x.'),malNum(k*k+b*k,`Falta el ${d}.`)],comprobar:()=>casi(compilar(e)({x:k}),v)}},
        'pendiente':()=>{const m=r(-6,6),x1=rng.entero(-5,3),dx=rng.entero(1,5),y1=rng.entero(-8,8),x2=x1+dx,y2=y1+m*dx;return {enun:`¿Cuál es la pendiente de la recta que pasa por \\((${x1}, ${y1})\\) y \\((${x2}, ${y2})\\)?`,v:m,resp:String(m),
          pasos:[paso('Fórmula de la pendiente',`\\(m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}}\\)`,'Cambio en y entre cambio en x.'),final('Calcula',`\\(m = \\dfrac{${y2-y1}}{${dx}} = ${c(m)}\\)`,'Cuánto sube por cada paso a la derecha.',String(m))],
          errores:[malNum(dx/(y2-y1),'Es (cambio en y)/(cambio en x), no al revés.'),malNum(-m,'Resta en el mismo orden arriba y abajo.'),malNum(y2-y1,`Falta dividir entre ${dx}.`)],comprobar:()=>casi((y2-y1)/(x2-x1),m)}}
      },
      2:{
        'recta-dos-puntos':()=>{const m=r(-5,5),b=rng.entero(-8,8),x1=rng.entero(-4,2),x2=x1+rng.entero(1,4),y1=m*x1+b,y2=m*x2+b,resp=recta(m,b);
          return {enun:`Escribe la ecuación de la recta que pasa por \\((${x1}, ${y1})\\) y \\((${x2}, ${y2})\\) (y = mx + b).`,expr:lineal([[m,'x'],[b,'']]),resp,
          pasos:[paso('Pendiente',`\\(m = \\dfrac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = ${c(m)}\\)`,'Cambio en y entre cambio en x.'),paso('Ordenada al origen',`\\(${y1} = ${m}\\cdot${par(x1)} + b \\Rightarrow b = ${c(b)}\\)`,'Sustituye un punto en y = mx + b.'),final('Escribe la recta',`\\(${resp}\\)`,'Con m y b.',resp)],
          errores:[mal(rectaFmt(m,y1),'b no es la y del punto: despeja b con y = mx + b.'),mal(rectaFmt(-m,b+2*m*x1),'Revisa el signo de la pendiente.'),mal(rectaFmt(m,-b),'Revisa el despeje de b.')],
          comprobar:()=>m*x1+b===y1&&m*x2+b===y2}},
        'cortes':()=>{const m=r(-6,6),x0=r(-6,6),b=-m*x0;return {tex:`y = ${lineal([[m,'x'],[b,'']])}`,enun:`¿En qué valor de x corta la recta \\(y = ${lineal([[m,'x'],[b,'']])}\\) al eje x?`,v:x0,resp:`x = ${x0}`,
          pasos:[paso('En el eje x, y = 0',`\\(0 = ${lineal([[m,'x'],[b,'']])}\\)`,'Los puntos del eje x tienen y = 0.'),final('Despeja x',`\\(x = ${c(x0)}\\)`,'Ecuación lineal.',`x = ${x0}`)],
          errores:[malNum(b,'Ese es el corte con el eje y (x = 0).'),malNum(-x0,'Revisa el signo al despejar.'),malNum(b/m,'Pasa el número con el signo contrario: x = −b/m.')],comprobar:()=>m*x0+b===0}},
        'suma-valores':()=>{const a=r(-5,5),b=r(-9,9),p=r(-4,4),q=r(-4,4),v=a*p+b+a*q+b;return {tex:`f(x) = ${lineal([[a,'x'],[b,'']])}`,preg:`f(${p}) + f(${q})`,v,resp:String(v),
          pasos:[paso('Calcula cada valor',`\\(f(${p}) = ${a*p+b},\\ f(${q}) = ${a*q+b}\\)`,'Evalúa por separado.'),final('Suma',`\\(${a*p+b} + ${par(a*q+b)} = ${c(v)}\\)`,'f(p) + f(q) no es f(p + q) (salvo casos especiales).',String(v))],
          errores:[malNum(a*(p+q)+b,'f(p) + f(q) no es f(p + q): el '+b+' se suma dos veces.'),malNum(a*p+b,'Falta sumar f('+q+').'),malNum(a*p+a*q,`Falta sumar el ${b} en cada valor.`)],comprobar:()=>v===(a*p+b)+(a*q+b)}}
      },
      3:{
        'composicion-valor':()=>{const a=r(-4,4),b=r(-6,6),cc=r(-3,3),d=r(-5,5),k=r(-3,3),g=cc*k+d,v=a*g+b;
          return {tex:`f(x) = ${lineal([[a,'x'],[b,'']])},\\ g(x) = ${lineal([[cc,'x'],[d,'']])}`,preg:`f(g(${k}))`,v,resp:String(v),
          pasos:[paso('Primero la de adentro',`\\(g(${k}) = ${cc}\\cdot${par(k)} ${sg(d)} = ${c(g)}\\)`,'Se evalúa de adentro hacia afuera.'),final('Luego f de ese valor',`\\(f(${g}) = ${a}\\cdot${par(g)} ${sg(b)} = ${c(v)}\\)`,'f(g(k)): g primero.',String(v))],
          errores:[malNum(cc*(a*k+b)+d,'Ese es g(f('+k+')): el orden importa.'),malNum((a*k+b)*(cc*k+d),'Componer no es multiplicar.'),malNum(g,'Falta aplicar f.')],comprobar:()=>v===a*(cc*k+d)+b}},
        'inversa':()=>{const a=rng.elegir([2,3,4,5,-2,-3]),b=r(-9,9);
          // f⁻¹(x) = (x − b)/a; con a negativo se escribe (b − x)/|a|
          const num=a>0?`x ${sg(-b)}`:lineal([[-1,'x'],[b,'']]),den=Math.abs(a),resp=`(${num})/${den}`;
          return {enun:`Encuentra la función inversa de \\(f(x) = ${lineal([[a,'x'],[b,'']])}\\). Escribe \\(f^{-1}(x)\\).`,expr:resp,resp:`f^-1(x) = ${resp}`,
          pasos:[paso('Escribe y = f(x) e intercambia x e y',`\\(x = ${lineal([[a,'y'],[b,'']])}\\)`,'La inversa deshace lo que hace f.'),paso('Despeja y',`\\(${lineal([[a,'y']])} = x ${sg(-b)}\\ \\Rightarrow\\ y = \\dfrac{x ${sg(-b)}}{${a}}\\)`,`Primero pasa el ${b}, luego divide entre ${a}.`),
            final('Resultado',`\\(f^{-1}(x) = ${c(`\\dfrac{${num}}{${den}}`)}\\)`,'Comprueba: f(f⁻¹(x)) = x.',`f^-1(x) = ${resp}`)],
          errores:[mal(`1/(${lineal([[a,'x'],[b,'']])})`,'La inversa no es 1/f(x).'),mal(a>0?`(x ${sg(b)})/${a}`:`(${lineal([[-1,'x'],[-b,'']])})/${-a}`,`El ${b} pasa con el signo contrario.`),mal(lineal([[a,'x'],[-b,'']]),`Se divide entre ${a}, no se multiplica.`)],
          comprobar:()=>[-3,0,1,4].every(t=>casi(a*compilar(resp)({x:t})+b,t))}},
        'vertice-x':()=>{const h=r(-6,6),a=rng.elegir([1,2,-1,3]),k=rng.entero(-9,9),b=-2*a*h,cc=a*h*h+k,e=polinomio([cc,b,a],{tex:false});
          return {enun:`¿En qué valor de x está el vértice de la parábola \\(y = ${T(e)}\\)?`,v:h,resp:`x = ${h}`,
          pasos:[paso('Fórmula del vértice',`\\(x_v = -\\dfrac{b}{2a} = -\\dfrac{${b}}{2\\cdot${par(a)}}\\)`,'El vértice está en el eje de simetría.'),final('Calcula',`\\(x_v = ${c(h)}\\)`,'Ahí la parábola cambia de dirección.',`x = ${h}`)],
          errores:[malNum(-h,'Es −b/(2a): cuida el signo.'),malNum(-b/a,'Es entre 2a, no entre a.'),malNum(b/2,'Divide entre 2a y cambia el signo.')],comprobar:()=>{const f=t=>a*t*t+b*t+cc;return a>0?f(h)<=f(h+0.5)&&f(h)<=f(h-0.5):f(h)>=f(h+0.5)&&f(h)>=f(h-0.5)}}}
      },
      4:{
        'composicion-expresion':()=>{const a=r(-4,4),b=r(-6,6),cc=r(-3,3),d=r(-5,5),resp=lineal([[a*cc,'x'],[a*d+b,'']]);
          return {enun:`Si \\(f(x) = ${lineal([[a,'x'],[b,'']])}\\) y \\(g(x) = ${lineal([[cc,'x'],[d,'']])}\\), escribe \\(f(g(x))\\).`,expr:resp,resp,
          pasos:[paso('Mete g(x) donde está la x de f',`\\(f(g(x)) = ${a}(${lineal([[cc,'x'],[d,'']])}) ${sg(b)}\\)`,'g va adentro.'),final('Simplifica',`\\(${c(resp)}\\)`,'Distributiva.',resp)],
          errores:[mal(lineal([[a*cc,'x'],[cc*b+d,'']]),'Ese es g(f(x)): el orden importa.'),mal(lineal([[a*cc,'x'],[d+b,'']]),`El ${a} multiplica también al ${d}.`),mal(lineal([[a+cc,'x'],[b+d,'']]),'Componer no es sumar.')],
          comprobar:()=>[-2,0,3].every(t=>casi(a*(cc*t+d)+b,compilar(resp)({x:t})))}},
        'dominio':()=>{const a=r(-9,9),k=rng.entero(1,5);return {enun:`¿Qué valor de x NO está en el dominio de \\(f(x) = \\dfrac{${k}}{x ${sg(-a)}}\\)?`,v:a,resp:`x = ${a}`,
          pasos:[paso('Una fracción no existe si el denominador es 0',`\\(x ${sg(-a)} = 0\\)`,'No se puede dividir entre cero.'),final('Despeja',`\\(x = ${c(a)}\\)`,'Ese valor queda fuera del dominio.',`x = ${a}`)],
          errores:[malNum(-a,'Iguala el denominador a 0 y despeja: cambia el signo.'),malNum(0,'x = 0 sí sirve aquí: el problema es cuando el DENOMINADOR es 0.'),malNum(k,'El numerador puede ser cualquier número.')],comprobar:()=>a-a===0}},
        'paralela-perpendicular':()=>{const [mn,md]=rng.elegir([[2,1],[3,1],[4,1],[5,1],[-2,1],[-3,1],[-4,1],[1,2],[-1,3],[2,3],[-3,4]]),m=mn/md,b=r(-9,9),tipo=rng.elegir(['paralela','perpendicular']);
          const [vn,vd]=tipo==='paralela'?[mn,md]:[-md,mn],v=vn/vd,mt=frac(mn,md),vt=frac(vn,vd,{tex:false});
          return {enun:`¿Cuál es la pendiente de una recta <b>${tipo}</b> a \\(y = ${mt}x ${sg(b)}\\)?`,v,resp:vt,
          pasos:[paso('Pendiente de la recta dada',`\\(m = ${mt}\\)`,'Es el número que multiplica a x.'),final(tipo==='paralela'?'Paralelas: misma pendiente':'Perpendiculares: inversa y con signo contrario',`\\(${tipo==='paralela'?'':`-\\dfrac{1}{${mt}} = `}${c(frac(vn,vd))}\\)`,tipo==='paralela'?'Mismo ángulo, nunca se cruzan.':'m₁·m₂ = −1.',vt)],
          errores:[malNum(tipo==='paralela'?-1/m:m,tipo==='paralela'?'Paralelas tienen la MISMA pendiente.':'Perpendicular: voltea y cambia el signo.'),malNum(-m,'Solo cambiar el signo no basta: también se invierte.'),malNum(1/m,'Falta cambiar el signo.')],comprobar:()=>tipo==='paralela'?v===m:casi(v*m,-1)}}
      },
      5:{
        'recta-perpendicular':()=>{const m=rng.elegir([2,-2,3,-3,4,-4]),x1=r(-4,4),y1=rng.entero(-6,6);
          // pendiente −1/m y b = y1 + x1/m, como fracciones exactas
          const mn=-1,md=m,bn=y1*m+x1,bd=m,mt=frac(mn,md),bt=frac(bn,bd),mtx=frac(mn,md,{tex:false}),btx=frac(bn,bd,{tex:false});
          const coefTxt=mtx.includes('/')?`(${mtx})x`:`${mtx}x`,bAbs=frac(Math.abs(bn),Math.abs(bd),{tex:false}),bneg=bn/bd<0;
          const resp=bn===0?`y = ${coefTxt}`:`y = ${coefTxt} ${bneg?'-':'+'} ${bAbs}`,expr=`${mn/md}*x + ${bn/bd}`;
          const rTex=`y = ${mt}x${bn===0?'':` ${bneg?'-':'+'} ${frac(Math.abs(bn),Math.abs(bd))}`}`;
          return {enun:`Escribe la recta perpendicular a \\(y = ${lineal([[m,'x']])} + 1\\) que pasa por \\((${x1}, ${y1})\\).`,expr,resp,
          pasos:[paso('Pendiente perpendicular',`\\(m_\\perp = -\\dfrac{1}{${m}} = ${c(mt)}\\)`,'Inversa con signo contrario.'),paso('Despeja b con el punto',`\\(${y1} = ${mt}\\cdot${par(x1)} + b \\Rightarrow b = ${c(bt)}\\)`,'Sustituye el punto en y = mx + b.'),final('Escribe la recta',`\\(${rTex}\\)`,'y = mx + b.',resp)],
          errores:[mal(rectaFmt(m,y1-m*x1),'Esa es paralela: la perpendicular tiene pendiente −1/m.'),mal(rectaFmt(-mn/md,y1+(mn/md)*x1),'Revisa el signo de la pendiente.'),mal(rectaFmt(mn/md,y1),'b no es la y del punto: despéjala.')],
          comprobar:()=>casi((mn/md)*m,-1)&&casi((mn/md)*x1+bn/bd,y1)}},
        'interseccion':()=>{const X=r(-5,5),Y=rng.entero(-6,6);let m1,m2;do{m1=r(-4,4);m2=r(-4,4)}while(m1===m2);const b1=Y-m1*X,b2=Y-m2*X;
          return {enun:`¿En qué punto se cruzan \\(y = ${lineal([[m1,'x'],[b1,'']])}\\) y \\(y = ${lineal([[m2,'x'],[b2,'']])}\\)? Escribe (x, y).`,punto:[X,Y],resp:`(${X}, ${Y})`,
          pasos:[paso('Iguala las dos rectas',`\\(${lineal([[m1,'x'],[b1,'']])} = ${lineal([[m2,'x'],[b2,'']])}\\)`,'En el cruce tienen la misma y.'),paso('Despeja x',`\\(${lineal([[m1-m2,'x']])} = ${b2-b1} \\Rightarrow x = ${c(X)}\\)`,'Ecuación lineal.'),final('Calcula y',`\\(y = ${m1}\\cdot${par(X)} ${sg(b1)} = ${c(Y)}\\)`,'Sustituye x en cualquiera de las dos.',`(${X}, ${Y})`)],
          errores:[{valor:`(${Y}, ${X})`,por:'Primero va x y luego y.'},{valor:`(${X}, ${m2*X+b1})`,por:'Revisa el cálculo de y.'},{valor:`(${-X}, ${Y})`,por:'Revisa el signo de x.'}],comprobar:()=>m1*X+b1===Y&&m2*X+b2===Y}},
        'vertice-punto':()=>{const h=r(-5,5),k=rng.entero(-9,9),a=rng.elegir([1,-1,2]),b=-2*a*h,cc=a*h*h+k,e=polinomio([cc,b,a],{tex:false});
          return {enun:`¿Cuál es el vértice de \\(y = ${T(e)}\\)? Escribe (x, y).`,punto:[h,k],resp:`(${h}, ${k})`,
          pasos:[paso('x del vértice',`\\(x_v = -\\dfrac{${b}}{2\\cdot${par(a)}} = ${c(h)}\\)`,'−b/(2a).'),final('y del vértice: evalúa',`\\(y_v = ${a===1?'':a===-1?'-':a}${par(h)}^{2} ${sg(b)}\\cdot${par(h)} ${sg(cc)} = ${c(k)}\\)`,'Sustituye x_v en la parábola.',`(${h}, ${k})`)],
          errores:[{valor:`(${-h}, ${k})`,por:'x del vértice = −b/(2a): cuida el signo.'},{valor:`(${h}, ${cc})`,por:'La y del vértice se obtiene evaluando en x_v, no es c.'},{valor:`(${k}, ${h})`,por:'Primero x, luego y.'}],comprobar:()=>a*h*h+b*h+cc===k}}
      }
    };
    const x=plantillas(rng,P[n]);
    let verificar;
    if(x.punto)verificar=e=>{const l=lista(e);return l.length===2&&casi(l[0],x.punto[0])&&casi(l[1],x.punto[1])};
    else if(x.expr)verificar=e=>{const d=derecha(e);return /x/.test(d)&&equivalente(d,x.expr)};
    else verificar=e=>igualNum(e,x.v);
    const errores=x.errores.map(er=>x.punto&&!er.si?{...er,si:e=>{const l=lista(e),v=lista(er.valor);return l.length===2&&casi(l[0],v[0])&&casi(l[1],v[1])}}:x.expr?{...er,si:e=>equivalente(derecha(e),derecha(er.valor))}:er);
    return {plantilla:x.plantilla,enunciado:x.enun||`Si \\(${x.tex}\\), calcula \\(${x.preg}\\).`,respuesta:x.resp,verificar,pasos:x.pasos,errores,regla:R_FUN,
      pista:'Sustituye con cuidado; para rectas, primero la pendiente.',teclado:'mat',comprobar:x.comprobar};
  }
};

export default {'alg/sistema-3x3':sistema3,'alg/fracciones-algebraicas':fracciones,'alg/logaritmos':logaritmos,'alg/funciones':funciones};
