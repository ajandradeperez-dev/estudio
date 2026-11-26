/* Matemáticas — habilidades que faltaban contra los temarios de universidad (PROMPT-ALGEBRA-PULIR, parte 2).
   Álgebra: división de polinomios (larga y sintética), números complejos, ecuaciones racionales (soluciones extrañas),
   sucesiones y series, inducción matemática (guiada).
   Álgebra lineal: regla de Cramer, matrices elementales y LU, coordenadas y cambio de base, matriz de una
   transformación, producto interno y mínimos cuadrados, matrices simétricas y formas cuadráticas.
   6 plantillas por habilidad (2 básicas, 2 de procedimiento, 2 de aplicación), una acción por paso y comprobar() con
   un cálculo distinto al de la respuesta (multiplicar de regreso, sustituir, resolver por eliminación…). Sin DOM. */
import {prob,paso,final,marca,crearGen} from './extensiones/base.js';
import {c} from './pasos.js';
import {compilar,equivalente,limpiar,num,lista,casi,igualConjunto,mcd} from './verificar.js';
import {polinomio,lineal,par,frac,vec,mat} from './formato.js';
import {T,sg,sgv,cv,simplificada} from './algebra-temas.js';
import {celdasIguales,comoVector,comoMatriz,det2,det3} from './algebra-lineal.js';
import {resolverSistema,detEliminacion} from './auditoria.js';

const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
const PT=co=>polinomio(co),PX=co=>polinomio(co,{tex:false});           // polinomio de coeficientes [a0, a1, …] en TeX o texto
const evalP=(co,x)=>co.reduce((s,a,k)=>s+a*x**k,0);
const malE=(valor,por,o={})=>({valor,si:e=>equivalente(e,valor,o),por});
const malV=(v,por)=>({si:e=>celdasIguales(e,v.flat?v.flat():v),por});
const esSi=e=>/^\s*s[ií](?![a-zñ])/i.test(limpiar(e)),esNo=e=>/^\s*no(?![a-zñ])/i.test(limpiar(e));
const siNo=(es,por)=>({respuesta:es?'Sí':'No',verificar:es?esSi:esNo,errores:[{valor:es?'No':'Sí',si:es?esNo:esSi,por}]});
// respuesta = expresión simplificada (no vale dejar la división indicada)
const expr=(resp,pasos,errores,comprobar,extra={})=>({respuesta:resp,verificar:e=>simplificada(e,resp),pasos,errores,comprobar,teclado:'mat',...extra});
const mulM=(A,B)=>A.map(f=>B[0].map((_,j)=>f.reduce((s,x,k)=>s+x*B[k][j],0)));
const mulMV=(A,v)=>A.map(f=>f.reduce((s,x,k)=>s+x*v[k],0));
const iguales=(A,B)=>JSON.stringify(A)===JSON.stringify(B);

/* =====================================================================================================================
   ÁLGEBRA
   ===================================================================================================================== */

/* ---------- División de polinomios ---------- */
// coeficientes de (x − a)·Q(x) + R
const porBinomio=(Q,a,R=0)=>{const P=Array(Q.length+1).fill(0);Q.forEach((q,k)=>{P[k+1]+=q;P[k]-=a*q});P[0]+=R;return P};
// división sintética de P (coeficientes de mayor a menor) entre (x − a): [cociente de mayor a menor, residuo]
const sintetica=(desc,a)=>{const q=[desc[0]];for(let i=1;i<desc.length;i++)q.push(desc[i]+a*q[i-1]);const R=q.pop();return [q,R]};
const division=crearGen({titulo:'División de polinomios (larga y sintética)',niveles:NIV,
  explicacion:'Para dividir P(x) entre (x − a) se usa la división sintética: escribe los coeficientes, baja el primero y en cada columna suma el de arriba más a por el último número que obtuviste. Los números de abajo son los coeficientes del cociente (un grado menos) y el último es el residuo. La división larga hace lo mismo con letras: divide los primeros términos, multiplica, resta y baja el siguiente.',
  alternativa:'Es como repartir dulces: el cociente es cuánto le toca a cada quien y el residuo lo que sobra. En la sintética solo trabajas con los números: «baja, multiplica por a, suma» y repites hasta el final.',
  referencia:'Stewart, Precálculo 3.2 – División de polinomios',regla:'P(x) = (x − a)·Q(x) + R: el cociente tiene un grado menos y el residuo es P(a).',pista:'En la sintética se usa a (el número que hace cero al divisor): baja, multiplica por a y suma.',
  tarjetas:[['¿Qué número se usa en la división sintética entre x + 3?','−3 (el valor que hace cero al divisor)'],['Grado del cociente de P(x) ÷ (x − a)','Un grado menos que P'],['¿Cómo se comprueba una división?','Cociente × divisor + residuo = dividendo'],['División larga: los 4 pasos','Divide los primeros términos, multiplica, resta y baja el siguiente']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const g=r.entero(3,5),a=r.noCero(-5,5),co=Array.from({length:g+1},(_,k)=>k===g?r.entero(1,4):r.entero(-6,6));return prob({
      enunciado:`Divides \\(P(x) = ${PT(co)}\\) entre \\(x ${sg(-a)}\\). ¿De qué grado es el cociente?`,v:g-1,dec:0,
      pasos:[paso('Grado del dividendo',`\\(P\\) es de grado \\(${g}\\)`,'El exponente mayor de P.'),final('Resta uno',`\\(${g} - 1 = ${c(g-1)}\\)`,'Dividir entre un binomio de grado 1 baja el grado en uno.')],
      errores:[[g,'El cociente tiene un grado menos que el dividendo.'],[g-2,'Solo baja un grado: el divisor es de grado 1.']],comprobar:()=>sintetica([...co].reverse(),a)[0].length-1===g-1})}},
    b2:{prof:'basico',f:(n,r)=>{const k=r.noCero(-9,9);return prob({
      enunciado:`En la división sintética de un polinomio entre \\(x ${sg(k)}\\), ¿qué número se usa para multiplicar (el que va en la esquina)?`,v:-k,dec:0,
      pasos:[paso('Iguala el divisor a cero',`\\(x ${sg(k)} = 0\\)`,'Se usa el valor que hace cero al divisor.'),final('Despeja x',`\\(x = ${c(-k)}\\)`,'Ese número va en la esquina.')],
      errores:[[k,'Es el valor que hace cero al divisor: cambia el signo.'],[1,'El 1 es el coeficiente de x, no el número de la esquina.']],comprobar:()=>-k+k===0})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.noCero(n<=2?-3:-5,n<=2?3:5),p=r.entero(-5,5),q=r.noCero(-6,6),Q=[q,p,1],P=porBinomio(Q,a),[,R]=sintetica([...P].reverse(),a),resp=PX(Q);
      const d=[...P].reverse();
      return {enunciado:`Divide con división sintética: \\((${PT(P)}) \\div (x ${sg(-a)})\\). Escribe el cociente.`,...expr(resp,[
        paso('Escribe los coeficientes',`\\(${d.join(',\\ ')}\\)`,`Del término de mayor grado al independiente; el número de la esquina es \\(${a}\\).`),
        paso('Baja el primero',`\\(${c(1)}\\)`,'El primer coeficiente pasa igual.'),
        paso('Segunda columna: suma el de arriba más a por el anterior',`\\(${d[1]} + ${par(a)}\\cdot 1 = ${c(p)}\\)`,'Multiplica por la esquina y suma.'),
        paso('Tercera columna',`\\(${d[2]} + ${par(a)}\\cdot${par(p)} = ${c(q)}\\)`,'Lo mismo con el número que acabas de obtener.'),
        paso('Última columna: el residuo',`\\(${d[3]} + ${par(a)}\\cdot${par(q)} = ${c(R)}\\)`,'Residuo 0: la división es exacta.'),
        final('Escribe el cociente',`\\(${c(PT(Q))}\\)`,'Los números de abajo (sin el residuo) son los coeficientes, un grado menos.',resp)],
        [malE(PX(sintetica(d,-a)[0].reverse()),'Usaste el número con el signo cambiado: es el que hace cero al divisor.'),malE(PX([q,p,1,0].map((x,i)=>i===0?0:[q,p,1][i-1])),'El cociente tiene un grado menos que el dividendo.'),malE(PX([d[2],d[1],1]),'En cada columna hay que sumar a por el número anterior.')],
        ()=>equivalente(`(x ${sg(-a)})*(${resp})`,PX(P))&&R===evalP(P,a))}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const A=r.entero(1,n<=3?2:4),rr=r.noCero(-4,4),B=r.entero(-6,6),C=r.noCero(-9,9),k=B+A*rr,R=C+k*rr;return prob({
      enunciado:`Con división larga, divide \\(${PT([C,B,A])}\\) entre \\(x ${sg(-rr)}\\). ¿Cuál es el residuo?`,v:R,dec:0,
      pasos:[paso('Divide los primeros términos',`\\(\\dfrac{${cv(A,'x^{2}')}}{x} = ${c(cv(A,'x'))}\\)`,'Primer término del cociente.'),
        paso('Multiplica ese término por el divisor',`\\(${cv(A,'x')}(x ${sg(-rr)}) = ${PT([0,-A*rr,A])}\\)`,'Todo el divisor.'),
        paso('Resta',`\\(${PT([C,B,A])} - (${PT([0,-A*rr,A])}) = ${PT([C,k])}\\)`,'Al restar cambian los signos de lo que restas.',{ojo:'Restar un negativo es sumar.'}),
        paso('Divide otra vez los primeros términos',`\\(\\dfrac{${PT([0,k])}}{x} = ${c(k)}\\)`,'Segundo término del cociente.'),
        paso('Multiplica por el divisor',`\\(${par(k)}(x ${sg(-rr)}) = ${PT([-k*rr,k])}\\)`,'Otra vez todo el divisor.'),
        final('Resta: lo que queda es el residuo',`\\(${PT([C,k])} - (${PT([-k*rr,k])}) = ${c(R)}\\)`,'Ya no se puede dividir: es el residuo.')],
      errores:[[A*rr*rr-B*rr+C,'Usaste el número con el signo cambiado.'],[C-k*rr,'Al restar, el signo de lo que restas cambia.'],[k,'Ese es el segundo término del cociente, no el residuo.']],
      comprobar:()=>R===evalP([C,B,A],rr)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const s=r.entero(1,8),t=r.entero(1,9),P=porBinomio([t,1],-s),resp=PX([t,1]);return {
      enunciado:`Un terreno rectangular tiene área \\(${PT(P)}\\) m² y uno de sus lados mide \\(x + ${s}\\) m. ¿Cuánto mide el otro lado? (exprésalo en x)`,...expr(resp,[
        paso('Área = largo × ancho',`\\(\\text{otro lado} = (${PT(P)}) \\div (x + ${s})\\)`,'El lado que falta es el cociente.'),
        paso('Número de la esquina',`\\(x + ${s} = 0 \\Rightarrow x = ${-s}\\)`,'Para la división sintética.'),
        paso('Sintética',`\\(1,\\ ${P[1]},\\ ${P[0]} \\;\\to\\; 1,\\ ${t},\\ \\text{residuo } 0\\)`,'Baja, multiplica por la esquina y suma.'),
        final('El otro lado',`\\(${c(PT([t,1]))}\\) m`,'Residuo 0: el lado es exacto.',resp)],
        [malE(PX([t+2*s,1]),'Usa −'+s+' en la esquina, no '+s+'.'),malE(PX([P[0],1]),'Divide: no basta con quitar la x del medio.'),malE(PX([P[0],P[1]]),'Divide entre (x + '+s+'): el resultado es de grado 1.')],
        ()=>equivalente(`(x + ${s})*(${resp})`,PX(P)))}}},
    a2:{prof:'aplicacion',f:(n,r)=>{const s=r.entero(1,5),p=r.entero(2,7),q=r.entero(1,9),Q=[q,p,1],P=porBinomio(Q,-s),resp=PX(Q);return {
      enunciado:`Una caja tiene volumen \\(${PT(P)}\\) cm³ y su altura mide \\(x + ${s}\\) cm. ¿Cuál es el área de la base? (exprésala en x)`,...expr(resp,[
        paso('Volumen = base × altura',`\\(\\text{base} = (${PT(P)}) \\div (x + ${s})\\)`,'El área de la base es el cociente.'),
        paso('Número de la esquina',`\\(x = ${-s}\\)`,'Hace cero a la altura.'),
        paso('Baja, multiplica y suma',`\\(1,\\ ${P[2]},\\ ${P[1]},\\ ${P[0]} \\;\\to\\; 1,\\ ${p},\\ ${q},\\ 0\\)`,'División sintética completa.'),
        final('Área de la base',`\\(${c(PT(Q))}\\) cm²`,'Un grado menos que el volumen.',resp)],
        [malE(PX(sintetica([1,P[2],P[1],P[0]],s)[0].reverse()),'La esquina es −'+s+'.'),malE(PX([P[1],P[2],1]),'Falta dividir: eso es el volumen sin el término independiente.'),malE(PX([q,p]),'El cociente conserva la x².')],
        ()=>equivalente(`(x + ${s})*(${resp})`,PX(P)))}}}
  }});

/* ---------- Números complejos ---------- */
// "3 - 2i", "-i", "4", "2i" → [re, im] (lineal en i; con i², i·i o división, null)
export function complejo(e){
  let s=limpiar(e).replace(/\s/g,'').replace(/j/g,'i');if(!s||/[^0-9i+\-*/.()]/.test(s))return null;
  let f;try{f=compilar(s)}catch(x){return null}
  const v=t=>{try{return f({i:t})}catch(x){return NaN}},a=v(0),b=v(1)-a;
  if(![a,b].every(Number.isFinite)||!casi(v(2),a+2*b)||!casi(v(-3),a-3*b))return null;
  return [a,b];
}
const cTxt=(a,b)=>b===0?String(a):a===0?(b===1?'i':b===-1?'-i':`${b}i`):`${a} ${b<0?'-':'+'} ${Math.abs(b)===1?'':Math.abs(b)}i`;
const cTex=(a,b)=>cTxt(a,b).replace(/-/g,'-');
const verC=(a,b)=>e=>{const z=complejo(e);return !!z&&casi(z[0],a)&&casi(z[1],b)};
const malC=(a,b,por)=>({valor:cTxt(a,b),si:verC(a,b),por});
const cRes=(a,b,pasos,errores,comprobar)=>({respuesta:cTxt(a,b),verificar:verC(a,b),pasos,errores:errores.filter(x=>!verC(a,b)(x.valor)),comprobar});
const complejos=crearGen({titulo:'Números complejos',niveles:NIV,
  // i¹ a propósito: la potencia se reduce a i⁰, i¹, i² o i³ según el residuo
  auditoria:{permitir:{b1:['x^1']}},
  explicacion:'Un número complejo es a + bi, con i² = −1: a es la parte real y b la imaginaria. Se suman parte con parte; se multiplican como binomios cambiando i² por −1; para dividir, multiplica arriba y abajo por el conjugado del denominador (a − bi). En el plano, a + bi es el punto (a, b): su módulo es √(a² + b²) y su argumento el ángulo con el eje real.',
  alternativa:'Piensa en i como una letra con una regla especial: i·i = −1. Todo lo demás es álgebra de siempre: (2 + 3i) + (1 − i) se suma como (2 + 3x) + (1 − x).',
  referencia:'Stewart, Precálculo 1.6 – Números complejos; 8.3 – Forma polar',regla:'i² = −1; (a + bi)(c + di) = (ac − bd) + (ad + bc)i; para dividir se multiplica por el conjugado.',pista:'Trata i como una letra y al final cambia i² por −1.',
  tarjetas:[['i²','−1'],['Conjugado de a + bi','a − bi'],['Módulo de a + bi','√(a² + b²)'],['Potencias de i','Se repiten cada 4: i, −1, −i, 1']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const m=r.entero(2,n<=2?20:60),k=m%4,val=[[1,0],[0,1],[-1,0],[0,-1]][k];return {
      enunciado:`Calcula \\(i^{${m}}\\).`,...cRes(val[0],val[1],[paso('Divide el exponente entre 4',`\\(${m} = 4\\cdot${Math.floor(m/4)} + ${c(k)}\\)`,'Las potencias de i se repiten cada 4.'),
        final('Usa el residuo',`\\(i^{${m}} = i^{${k}} = ${c(cTex(val[0],val[1]))}\\)`,'i⁰ = 1, i¹ = i, i² = −1, i³ = −i.',cTxt(val[0],val[1]))],
        [malC(-val[0],-val[1],'Revisa el residuo de dividir entre 4.'),malC(val[1],val[0],'i¹ = i, i² = −1, i³ = −i, i⁴ = 1.'),malC(...[[0,1],[-1,0],[0,-1],[1,0]][k],'Usa el residuo, no el cociente: cuenta otra vez.')],
        ()=>{let z=[1,0];for(let j=0;j<m;j++)z=[-z[1],z[0]];return z[0]===val[0]&&z[1]===val[1]})}}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(-9,9),b=r.noCero(-9,9),cc=r.entero(-9,9),d=r.noCero(-9,9),resta=r.prob(0.5),A=resta?a-cc:a+cc,B=resta?b-d:b+d,o=resta?'-':'+';return {
      enunciado:`Calcula \\((${cTex(a,b)}) ${o} (${cTex(cc,d)})\\).`,...cRes(A,B,[paso('Parte real',`\\(${a} ${o} ${par(cc)} = ${c(A)}\\)`,'Reales con reales.'),paso('Parte imaginaria',`\\(${b} ${o} ${par(d)} = ${c(B)}\\)`,'Imaginarios con imaginarios.'),
        final('Junta',`\\(${c(cTex(A,B))}\\)`,'a + bi.',cTxt(A,B))],[malC(resta?a+cc:a-cc,resta?b+d:b-d,resta?'Al restar, cambia el signo de las dos partes del segundo.':'Es una suma: no cambies signos.'),malC(A+B,0,'La parte real y la imaginaria no se juntan.'),malC(B,A,'Primero la parte real y después la imaginaria.')],
        ()=>{const z=complejo(`(${cTxt(a,b)}) ${o} (${cTxt(cc,d)})`);return !!z&&z[0]===A&&z[1]===B})}}},
    p1:{prof:'procedimiento',f:(n,r)=>{const R=n<=2?4:7,a=r.entero(-R,R),b=r.noCero(-R,R),cc=r.entero(-R,R),d=r.noCero(-R,R),A=a*cc-b*d,B=a*d+b*cc;return {
      enunciado:`Multiplica \\((${cTex(a,b)})(${cTex(cc,d)})\\).`,...cRes(A,B,[
        paso('Multiplica todos contra todos',`\\(${a}\\cdot${par(cc)} + ${par(a)}\\cdot${par(d)}i + ${par(b)}\\cdot${par(cc)}i + ${par(b)}\\cdot${par(d)}i^{2}\\)`,'Como dos binomios.'),
        paso('Cambia i² por −1',`\\(${par(b*d)}i^{2} = ${c(-b*d)}\\)`,'Porque i² = −1.'),
        paso('Junta las partes reales',`\\(${a*cc} ${sg(-b*d)} = ${c(A)}\\)`,'Los términos sin i.'),
        paso('Junta las partes imaginarias',`\\(${a*d} ${sg(b*cc)} = ${c(B)}\\)`,'Los términos con i.'),
        final('Resultado',`\\(${c(cTex(A,B))}\\)`,'a + bi.',cTxt(A,B))],
        [malC(a*cc+b*d,B,'i² = −1: el producto de las partes imaginarias se resta.'),malC(a*cc,b*d,'Faltan los productos cruzados (ad + bc)i.'),malC(a*cc-b*d,a*d-b*cc,'Revisa el signo de la parte imaginaria.')],
        ()=>{let x=[a,b],y=[cc,d];return x[0]*y[0]-x[1]*y[1]===A&&x[0]*y[1]+x[1]*y[0]===B})}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const qa=r.entero(-5,5),qb=r.noCero(-5,5),cc=r.noCero(-4,4),d=r.noCero(-4,4),a=qa*cc-qb*d,b=qa*d+qb*cc,M=cc*cc+d*d;return {
      enunciado:`Divide \\(\\dfrac{${cTex(a,b)}}{${cTex(cc,d)}}\\).`,...cRes(qa,qb,[
        paso('Multiplica arriba y abajo por el conjugado',`\\(\\dfrac{(${cTex(a,b)})(${cTex(cc,-d)})}{(${cTex(cc,d)})(${cTex(cc,-d)})}\\)`,`El conjugado de ${cTxt(cc,d)} es ${cTxt(cc,-d)}.`),
        paso('Denominador',`\\(${par(cc)}^{2} + ${par(d)}^{2} = ${c(M)}\\)`,'(c + di)(c − di) = c² + d²: queda un número real.'),
        paso('Numerador',`\\(${c(cTex(qa*M,qb*M))}\\)`,'Multiplica como binomios y cambia i² por −1.'),
        final('Divide cada parte entre '+M,`\\(\\dfrac{${qa*M}}{${M}} ${qb*M<0?'-':'+'} \\dfrac{${Math.abs(qb*M)}}{${M}}i = ${c(cTex(qa,qb))}\\)`,'Parte real y parte imaginaria por separado.',cTxt(qa,qb))],
        [malC(...(()=>{const nu=[a*cc-b*d,a*d+b*cc];return [nu[0]/M,nu[1]/M]})(),'Se multiplica por el conjugado (cambia el signo de la parte imaginaria), no por el mismo número.'),malC(qa,-qb,'Revisa el signo de la parte imaginaria.'),malC(qa*M,qb*M,`Falta dividir entre ${M}.`)],
        ()=>{const x=[qa*cc-qb*d,qa*d+qb*cc];return x[0]===a&&x[1]===b})}}},
    a1:{prof:'aplicacion',f:(n,r)=>{const [p,q,h]=r.elegir([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20]]),a=p*r.signo(),b=q*r.signo();return prob({
      enunciado:`La impedancia de un circuito de corriente alterna es \\(Z = ${cTex(a,b)}\\) Ω. ¿Cuánto vale su magnitud \\(|Z|\\) (el módulo), en Ω?`,v:h,dec:2,unidad:'Ω',
      pasos:[paso('Módulo',`\\(|Z| = \\sqrt{${par(a)}^{2} + ${par(b)}^{2}}\\)`,'Distancia del origen al punto (a, b).'),paso('Eleva y suma',`\\(${a*a} + ${b*b} = ${c(h*h)}\\)`,'Los cuadrados siempre son positivos.'),final('Saca la raíz',`\\(\\sqrt{${h*h}} = ${c(h)}\\)`,'Ohms.')],
      errores:[[Math.abs(a)+Math.abs(b),'El módulo no es la suma: es la raíz de la suma de cuadrados.'],[h*h,'Falta sacar la raíz.']],comprobar:()=>casi(Math.hypot(a,b),h)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(1,9),[a,b,ang]=r.elegir([[k,k,45],[-k,k,135],[-k,-k,-135],[k,-k,-45],[0,k,90],[0,-k,-90],[k,0,0],[-k,0,180]]);return prob({
      enunciado:`En un circuito, un fasor se representa con el complejo \\(${cTex(a,b)}\\). ¿Cuál es su argumento (ángulo con el eje real positivo) en grados, entre −180° y 180°?`,v:ang,dec:0,unidad:'°',
      pasos:[paso('Ubica el punto',`\\((${a}, ${b})\\)`,'Parte real en x y parte imaginaria en y.'),paso('Cuadrante',a===0||b===0?'Está sobre un eje':`Cuadrante ${a>0?(b>0?'I':'IV'):(b>0?'II':'III')}`,'El signo de a y b dice el cuadrante.'),final('Ángulo',`\\(\\theta = ${c(ang)}^{\\circ}\\)`,'Desde el eje real positivo; negativo si está abajo.')],
      errores:[[-ang||180,'Revisa el signo: debajo del eje real el ángulo es negativo.'],[ang===45?135:45,'Fíjate en el cuadrante.']],comprobar:()=>casi(Math.atan2(b,a)*180/Math.PI,ang)})}}
  }});

/* ---------- Ecuaciones racionales ---------- */
const racionalesEc=crearGen({titulo:'Ecuaciones racionales',niveles:NIV,
  explicacion:'Una ecuación racional tiene la incógnita en un denominador. Primero anota qué valores anulan algún denominador (están prohibidos). Luego multiplica todo por el mínimo común denominador para quitar las fracciones y resuelve. Al final comprueba: una solución que anula un denominador es «extraña» y se descarta.',
  alternativa:'Es como quitar los pisos de un edificio: multiplicas por el denominador común y queda una ecuación «normal». Pero antes de festejar revisa que la respuesta no haga 0 un denominador: dividir entre 0 no existe.',
  referencia:'Stewart, Precálculo 1.5 – Otras clases de ecuaciones (racionales)',regla:'Multiplica por el mínimo común denominador, resuelve y descarta las soluciones que anulan un denominador.',pista:'¿Qué valor de x hace cero algún denominador? Ese no puede ser solución.',
  tarjetas:[['Valor prohibido en a/(x − r)','x = r (anula el denominador)'],['Solución extraña','Una solución de la ecuación sin fracciones que anula un denominador: se descarta'],['Primer paso con varias fracciones','Multiplicar todo por el mínimo común denominador']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const k=r.noCero(-9,9),rr=r.noCero(-9,9),m=r.noCero(-5,5);return prob({
      enunciado:`En la ecuación \\(\\dfrac{${k}}{x ${sg(-rr)}} = ${m}\\), ¿qué valor NO puede tomar x?`,v:rr,dec:0,
      pasos:[paso('El denominador no puede valer 0',`\\(x ${sg(-rr)} = 0\\)`,'No se puede dividir entre 0.'),final('Despeja',`\\(x = ${c(rr)}\\)`,'Ese valor está prohibido.')],
      errores:[[-rr,'Iguala el denominador a cero: x '+(rr>0?'−':'+')+' '+Math.abs(rr)+' = 0.'],[k,'El numerador sí puede valer cualquier cosa.']],comprobar:()=>rr-rr===0&&!Number.isFinite(k/(rr-rr))})}},
    b2:{prof:'basico',f:(n,r)=>{let a,b;do{a=r.entero(2,6);b=r.entero(2,6)}while(a===b);const L=a*b/mcd(a,b),x=L*r.noCero(-4,4),cc=x/a+x/b;return prob({
      enunciado:`Resuelve: \\(\\dfrac{x}{${a}} + \\dfrac{x}{${b}} = ${cc}\\).`,v:x,dec:0,
      pasos:[paso('Multiplica todo por el mínimo común denominador',`\\(${L}\\cdot\\dfrac{x}{${a}} + ${L}\\cdot\\dfrac{x}{${b}} = ${L}\\cdot${par(cc)}\\)`,`El mcm de ${a} y ${b} es ${L}.`),
        paso('Simplifica cada término',`\\(${cv(L/a,'x')} + ${cv(L/b,'x')} = ${L*cc}\\)`,'Las fracciones desaparecen.'),
        paso('Junta las x',`\\(${cv(L/a+L/b,'x')} = ${L*cc}\\)`,'Términos semejantes.'),
        final('Despeja',`\\(x = \\dfrac{${L*cc}}{${L/a+L/b}} = ${c(x)}\\)`,'Divide.')],
      errores:[[cc*(a+b),'No se suman los denominadores.'],[cc*a*b,'Multiplica por el mcm a TODOS los términos, también al lado derecho.']],comprobar:()=>casi(x/a+x/b,cc)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{let x,rr,s,k;do{x=r.entero(-8,8);rr=r.noCero(-6,6);s=r.noCero(-6,6);k=r.noCero(-3,3)}while(x===rr||x===-s||rr===-s);const a=k*(x-rr),b=k*(x+s);return prob({
      enunciado:`Resuelve: \\(\\dfrac{${a}}{x ${sg(-rr)}} = \\dfrac{${b}}{x ${sg(s)}}\\).`,v:x,dec:0,
      pasos:[paso('Multiplica en cruz',`\\(${a}(x ${sg(s)}) = ${b}(x ${sg(-rr)})\\)`,'Así se quitan los dos denominadores.'),
        paso('Distribuye',`\\(${PT([a*s,a])} = ${PT([-b*rr,b])}\\)`,'Cada número multiplica a todo el paréntesis.'),
        paso('Junta las x a la izquierda',`\\(${cv(a-b,'x')} = ${-b*rr-a*s}\\)`,'x de un lado, números del otro.'),
        paso('Despeja',`\\(x = ${c(x)}\\)`,'Divide entre el coeficiente.'),
        final('Comprueba los denominadores',`\\(x ${sg(-rr)} = ${x-rr} \\neq 0\\)`,'No anula ningún denominador: es válida.')],
      errores:[[-x,'Revisa los signos al pasar términos.'],[rr,'Ese valor anula un denominador: no puede ser solución.']],comprobar:()=>casi(a/(x-rr),b/(x+s))})}},
    p2:{prof:'procedimiento',f:(n,r)=>{let rr,p;do{rr=r.noCero(-6,6);p=r.entero(-6,6)}while(-rr-p===rr||r.sig()<0&&false);const K=rr*rr+p*rr,sol=-rr-p;return prob({
      enunciado:`Resuelve: \\(\\dfrac{${PT([0,p,1])}}{x ${sg(-rr)}} = \\dfrac{${K}}{x ${sg(-rr)}}\\). (Si hay una solución extraña, descártala.)`,v:sol,dec:0,
      pasos:[paso(`Multiplica todo por (x ${rr<0?'+':'−'} ${Math.abs(rr)})`,`\\(${PT([0,p,1])} = ${K}\\)`,'Los dos lados tienen el mismo denominador.'),
        paso('Pasa todo a un lado',`\\(${PT([-K,p,1])} = 0\\)`,'Iguala a cero para factorizar.'),
        paso('Factoriza',`\\((x ${sg(-rr)})(x ${sg(rr+p)}) = 0\\)`,`Dos números con producto ${-K} y suma ${p}.`),
        paso('Descarta la que anula el denominador',`\\(x = ${rr}\\) hace \\(x ${sg(-rr)} = 0\\)`,'Es una solución extraña.',{ojo:'Comprueba siempre en la ecuación original.'}),
        final('La única solución',`\\(x = ${c(sol)}\\)`,'La otra raíz sí sirve.')],
      errores:[[rr,`x = ${rr} anula el denominador: es una solución extraña.`],[rr+p,'Revisa el signo al factorizar.']],comprobar:()=>casi((sol*sol+p*sol)/(sol-rr),K/(sol-rr))&&sol!==rr})}},
    a1:{prof:'aplicacion',f:(n,r)=>{let a,b;do{a=r.entero(2,9);b=r.entero(2,12)}while(a===b);const t=a*b/(a+b);return prob({
      enunciado:`Una llave llena un tinaco en ${a} h y otra en ${b} h. Si se abren las dos juntas, ¿en cuántas horas lo llenan? (2 decimales)`,v:t,dec:2,unidad:'h',
      pasos:[paso('Plantea lo que llena cada una en una hora',`\\(\\dfrac{1}{${a}} + \\dfrac{1}{${b}} = \\dfrac{1}{t}\\)`,'Las fracciones de trabajo se suman.'),
        paso('Multiplica por el mcm',`\\(${b}t + ${a}t = ${a*b}\\)`,`Multiplica todo por ${a}·${b}·t.`),
        final('Despeja t',`\\(t = \\dfrac{${a*b}}{${a+b}} \\approx ${c(t.toFixed(2))}\\)`,'Juntas tardan menos que la más rápida.')],
      errores:[[(a+b)/2,'Los tiempos no se promedian: se suman las rapideces.'],[a+b,'Juntas tardan menos, no más.']],comprobar:()=>casi(1/a+1/b,1/t)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const [R1,R2,R]=r.elegir([[3,6,2],[4,12,3],[6,12,4],[10,15,6],[12,24,8],[20,30,12],[6,3,2],[10,40,8],[5,20,4],[30,60,20],[12,6,4],[15,10,6]]);return prob({
      enunciado:`Dos resistencias en paralelo dan \\(R = ${R}\\) Ω. Una mide \\(R_1 = ${R1}\\) Ω. Con \\(\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}\\), ¿cuánto mide \\(R_2\\)?`,v:R2,dec:2,unidad:'Ω',
      pasos:[paso('Despeja 1/R₂',`\\(\\dfrac{1}{R_2} = \\dfrac{1}{${R}} - \\dfrac{1}{${R1}}\\)`,'Pasa 1/R₁ restando.'),
        paso('Resta las fracciones',`\\(\\dfrac{1}{R_2} = \\dfrac{${R1} - ${R}}{${R*R1}} = \\dfrac{${R1-R}}{${R*R1}}\\)`,'Denominador común.'),
        final('Voltea',`\\(R_2 = \\dfrac{${R*R1}}{${R1-R}} = ${c(R2)}\\)`,'Si 1/R₂ = a/b, entonces R₂ = b/a.')],
      errores:[[R1-R,'Las resistencias en paralelo no se restan directamente.'],[R+R1,'En paralelo la total es menor que cada una.'],[(R1-R)/(R*R1),'Falta voltear: eso es 1/R₂.']],comprobar:()=>casi(1/R1+1/R2,1/R)})}}
  }});

/* ---------- Sucesiones y series ---------- */
const sucesiones=crearGen({titulo:'Sucesiones y series',niveles:NIV,
  explicacion:'En una sucesión aritmética cada término suma la diferencia d: aₙ = a₁ + (n − 1)d, y la suma de n términos es Sₙ = n(a₁ + aₙ)/2. En una geométrica cada término se multiplica por la razón r: aₙ = a₁·rⁿ⁻¹, y Sₙ = a₁(rⁿ − 1)/(r − 1).',
  alternativa:'Aritmética = escalera de escalones iguales (sumas lo mismo cada vez). Geométrica = fotocopiadora con zoom (multiplicas por lo mismo cada vez). Para sumar 1 + 2 + … + 100, Gauss emparejó el primero con el último: 50 parejas de 101.',
  referencia:'Stewart, Precálculo 12.1–12.3 – Sucesiones aritméticas y geométricas',regla:'Aritmética: aₙ = a₁ + (n − 1)d, Sₙ = n(a₁ + aₙ)/2. Geométrica: aₙ = a₁rⁿ⁻¹, Sₙ = a₁(rⁿ − 1)/(r − 1).',pista:'¿Se suma o se multiplica por lo mismo cada vez?',
  tarjetas:[['Término n de una aritmética','aₙ = a₁ + (n − 1)d'],['Suma de n términos aritméticos','Sₙ = n(a₁ + aₙ)/2'],['Término n de una geométrica','aₙ = a₁·rⁿ⁻¹'],['Suma de n términos geométricos','Sₙ = a₁(rⁿ − 1)/(r − 1)']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-10,20),d=r.noCero(-7,9),t=[0,1,2,3].map(k=>a+k*d);return prob({
      enunciado:`¿Cuál es la diferencia común de la sucesión aritmética \\(${t.join(',\\ ')},\\ \\dots\\)?`,v:d,dec:0,
      pasos:[paso('Resta un término menos el anterior',`\\(${t[1]} - ${par(t[0])} = ${c(d)}\\)`,'En una aritmética esa resta siempre da lo mismo.'),final('Comprueba con otro par',`\\(${t[3]} - ${par(t[2])} = ${c(d)}\\)`,'Es la diferencia común.')],
      errores:[[-d,'Es el término menos el anterior, no al revés.'],[t[1],'Ese es el segundo término.']],comprobar:()=>t.every((x,k)=>k===0||x-t[k-1]===d)})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.noCero(-5,6),q=r.elegir([-3,-2,2,3,4,5]),t=[0,1,2,3].map(k=>a*q**k);return prob({
      enunciado:`¿Cuál es la razón de la sucesión geométrica \\(${t.join(',\\ ')},\\ \\dots\\)?`,v:q,dec:2,
      pasos:[paso('Divide un término entre el anterior',`\\(\\dfrac{${t[1]}}{${t[0]}} = ${c(q)}\\)`,'En una geométrica ese cociente es constante.'),final('Comprueba',`\\(\\dfrac{${t[2]}}{${t[1]}} = ${c(q)}\\)`,'Es la razón.')],
      errores:[[t[1]-t[0],'Eso es la diferencia: en una geométrica se divide.'],[1/q,'Es el término entre el anterior, no al revés.']],comprobar:()=>t.every((x,k)=>k===0||x===t[k-1]*q)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(-10,15),d=r.noCero(-6,8),m=r.entero(n<=2?8:15,n<=2?20:60),v=a+(m-1)*d;return prob({
      enunciado:`En la sucesión aritmética \\(${a},\\ ${a+d},\\ ${a+2*d},\\ \\dots\\) calcula el término \\(a_{${m}}\\).`,v,dec:0,
      pasos:[paso('Identifica a₁ y d',`\\(a_1 = ${a},\\ d = ${c(d)}\\)`,'La diferencia es la resta de dos términos seguidos.'),
        paso('Usa la fórmula',`\\(a_{${m}} = ${a} + (${m} - 1)\\cdot${par(d)}\\)`,'aₙ = a₁ + (n − 1)d.'),
        final('Calcula',`\\(${a} + ${m-1}\\cdot${par(d)} = ${c(v)}\\)`,'Primero la multiplicación.')],
      errores:[[a+m*d,'Son n − 1 saltos, no n.'],[m*d,'Falta el primer término.']],comprobar:()=>{let x=a;for(let k=1;k<m;k++)x+=d;return x===v}})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(-5,12),d=r.noCero(-4,6),m=r.entero(n<=2?6:10,n<=3?20:40),am=a+(m-1)*d,S=m*(a+am)/2;return prob({
      enunciado:`Suma los primeros ${m} términos de la sucesión aritmética \\(${a},\\ ${a+d},\\ ${a+2*d},\\ \\dots\\)`,v:S,dec:0,
      pasos:[paso('Último término',`\\(a_{${m}} = ${a} + ${m-1}\\cdot${par(d)} = ${c(am)}\\)`,'aₙ = a₁ + (n − 1)d.'),
        paso('Usa la fórmula de la suma',`\\(S_{${m}} = \\dfrac{${m}(${a} ${sg(am)})}{2}\\)`,'Primero + último, por la cantidad de parejas.'),
        final('Calcula',`\\(\\dfrac{${m}\\cdot${par(a+am)}}{2} = ${c(S)}\\)`,'Divide al final.')],
      errores:[[m*(a+am),'Falta dividir entre 2.'],[a+am,'Falta multiplicar por el número de términos.']],comprobar:()=>{let s=0;for(let k=0;k<m;k++)s+=a+k*d;return s===S}})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(3,7),h=2**k*r.entero(1,5),m=r.entero(3,k),v=h/2**m;return prob({
      enunciado:`Una pelota se suelta desde ${h} cm y en cada rebote sube a la mitad de la altura anterior. ¿A qué altura llega en el rebote número ${m}?`,v,dec:2,unidad:'cm',
      pasos:[paso('Es geométrica',`\\(a_1 = ${h/2},\\ r = \\dfrac{1}{2}\\)`,'Cada rebote multiplica por 1/2.'),paso('Fórmula',`\\(a_{${m}} = ${h/2}\\cdot\\left(\\dfrac{1}{2}\\right)^{${m-1}}\\)`,'aₙ = a₁·rⁿ⁻¹.'),final('Calcula',`\\(${c(v)}\\) cm`,'Altura del rebote.')],
      errores:[[h/2**(m+1),'El primer rebote ya es la mitad: el exponente es n − 1 sobre a₁ = '+h/2+'.'],[h-m*h/2/m,'No se resta lo mismo cada vez: se multiplica por 1/2.']],comprobar:()=>{let x=h;for(let j=0;j<m;j++)x/=2;return casi(x,v)}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const q=r.entero(2,4),m=r.entero(3,n<=4?5:7),S=(q**(m+1)-1)/(q-1)-1;return prob({
      enunciado:`Mandas un mensaje a ${q} amigos; cada uno lo reenvía a ${q} personas nuevas, y así sucesivamente. ¿Cuántas personas lo recibieron en total después de ${m} rondas?`,v:S,dec:0,unidad:'personas',
      pasos:[paso('Cada ronda multiplica por '+q,`\\(${q},\\ ${q**2},\\ ${q**3},\\ \\dots\\)`,'Geométrica con a₁ = '+q+' y r = '+q+'.'),
        paso('Suma geométrica',`\\(S_{${m}} = \\dfrac{${q}(${q}^{${m}} - 1)}{${q} - 1}\\)`,'Sₙ = a₁(rⁿ − 1)/(r − 1).'),
        final('Calcula',`\\(${c(S)}\\)`,'Personas en total.')],
      errores:[[q**m,'Eso es solo la última ronda: se suman todas.'],[q*m,'No se suma lo mismo cada ronda: se multiplica.']],comprobar:()=>{let s=0;for(let k=1;k<=m;k++)s+=q**k;return s===S}})}}
  }});

/* ---------- Inducción matemática (guiada) ---------- */
const FAMILIAS=[
  {suma:'1 + 2 + 3 + \\dots + n',f:'\\dfrac{n(n + 1)}{2}',t:i=>i,tTex:'n',F:n=>n*(n+1)/2},
  {suma:'1 + 3 + 5 + \\dots + (2n - 1)',f:'n^{2}',t:i=>2*i-1,tTex:'2n - 1',F:n=>n*n},
  {suma:'1^{2} + 2^{2} + \\dots + n^{2}',f:'\\dfrac{n(n + 1)(2n + 1)}{6}',t:i=>i*i,tTex:'n^{2}',F:n=>n*(n+1)*(2*n+1)/6},
  {suma:'1 + 2 + 4 + \\dots + 2^{n - 1}',f:'2^{n} - 1',t:i=>2**(i-1),tTex:'2^{n - 1}',F:n=>2**n-1},
  {suma:'2 + 4 + 6 + \\dots + 2n',f:'n(n + 1)',t:i=>2*i,tTex:'2n',F:n=>n*(n+1)}];
const sumaDirecta=(fam,m)=>{let s=0;for(let i=1;i<=m;i++)s+=fam.t(i);return s};
const induccion=crearGen({titulo:'Inducción matemática',niveles:NIV,
  explicacion:'Para probar que una fórmula vale para todo n ≥ 1: (1) caso base: compruébala con n = 1; (2) hipótesis: supón que vale para n = k; (3) paso inductivo: usa la hipótesis para probar que vale para n = k + 1 (normalmente sumando el término que sigue). Si las dos partes se cumplen, vale para todos, como fichas de dominó que se tiran una a otra.',
  alternativa:'Dominó: si tiras la primera ficha (caso base) y cada ficha tira a la siguiente (paso inductivo), caen todas. En las sumas, «la siguiente ficha» es sumar el término k + 1 a la fórmula de k y ver que da la fórmula de k + 1.',
  referencia:'Stewart, Precálculo 12.5 – Inducción matemática',regla:'Caso base (n = 1) + paso inductivo (si vale para k, vale para k + 1) ⇒ vale para todo n ≥ 1.',pista:'En una suma, pasar de k a k + 1 es sumar el término número k + 1.',
  tarjetas:[['Las dos partes de una prueba por inducción','Caso base y paso inductivo'],['Hipótesis de inducción','Suponer que la fórmula vale para n = k'],['Paso inductivo en una suma','S(k + 1) = S(k) + término k + 1']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const fam=r.elegir(FAMILIAS),m=r.entero(3,5),terms=Array.from({length:m},(_,i)=>fam.t(i+1)),v=sumaDirecta(fam,m);return prob({
      enunciado:`Para probar \\(${fam.suma} = ${fam.f}\\), compruébala con \\(n = ${m}\\): ¿cuánto vale el lado izquierdo?`,v,dec:0,
      pasos:[paso('Escribe los primeros '+m+' términos',`\\(${terms.join(' + ')}\\)`,'Sustituye i = 1, 2, …, '+m+' en el término general.'),final('Suma',`\\(${c(v)}\\)`,`Coincide con la fórmula: ${fam.F(m)}.`)],
      errores:[[fam.t(m),'Ese es solo el último término.'],[sumaDirecta(fam,m-1),'Te faltó un término.']],comprobar:()=>v===fam.F(m)})}},
    b2:{prof:'basico',f:(n,r)=>{const fam=r.elegir(FAMILIAS),k=r.entero(3,9),v=fam.t(k+1);return prob({
      enunciado:`En el paso inductivo de \\(${fam.suma} = ${fam.f}\\), para pasar de \\(n = ${k}\\) a \\(n = ${k+1}\\) se suma un término. ¿Cuánto vale ese término?`,v,dec:0,
      pasos:[paso('El término general',`\\(${fam.tTex}\\)`,'Es lo que se suma en el lugar n.'),final('Sustituye n = '+(k+1),`\\(${c(v)}\\)`,'El término número k + 1.')],
      errores:[[fam.t(k),'Ese es el término k; el que se agrega es el k + 1.'],[fam.F(k+1),'Esa es la suma completa, no el término que se agrega.']],comprobar:()=>fam.F(k+1)-fam.F(k)===v})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const fam=r.elegir(FAMILIAS),k=r.entero(4,12),Sk=fam.F(k),t=fam.t(k+1),v=Sk+t;return prob({
      enunciado:`Hipótesis: \\(${fam.suma} = ${fam.f}\\) vale para \\(n = ${k}\\), así que la suma vale \\(${Sk}\\). Con el paso inductivo, ¿cuánto vale la suma para \\(n = ${k+1}\\)?`,v,dec:0,
      pasos:[paso('Término que se agrega',`\\(${fam.tTex.replace(/n/g,`(${k+1})`)} = ${c(t)}\\)`,'El término número k + 1.'),paso('Súmalo a la hipótesis',`\\(${Sk} + ${t} = ${c(v)}\\)`,'S(k + 1) = S(k) + término k + 1.'),final('Coincide con la fórmula',`\\(${fam.f.replace(/n/g,`(${k+1})`)} = ${c(fam.F(k+1))}\\)`,'Por eso el paso inductivo funciona.')],
      errores:[[Sk,'Falta sumar el término k + 1.'],[Sk+fam.t(k),'Se suma el término k + 1, no el k.']],comprobar:()=>v===fam.F(k+1)&&v===sumaDirecta(fam,k+1)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(3,9);return prob({
      enunciado:`Para probar que \\(${a}^{n} - 1\\) es divisible entre \\(${a-1}\\) se escribe \\(${a}^{k+1} - 1 = ${a}\\,(${a}^{k} - 1) + c\\). ¿Cuánto vale c?`,v:a-1,dec:0,
      pasos:[paso('Desarrolla el producto',`\\(${a}\\,(${a}^{k} - 1) = ${a}^{k+1} - ${a}\\)`,'Distributiva.'),paso('Compara con lo que quieres',`\\(${a}^{k+1} - 1 = ${a}^{k+1} - ${a} + ${c(a-1)}\\)`,'Falta sumar lo que hace que −'+a+' se vuelva −1.'),final('El valor de c',`\\(c = ${c(a-1)}\\)`,`Como ${a}(${a}^k − 1) y ${a-1} son divisibles entre ${a-1}, la suma también.`)],
      errores:[[a,'Revisa: −'+a+' + c = −1.'],[1,'c compensa la diferencia entre −'+a+' y −1.']],comprobar:()=>[1,2,3,4].every(k=>a**(k+1)-1===a*(a**k-1)+(a-1))&&(a**5-1)%(a-1)===0})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const m=r.entero(5,n<=3?20:40),v=m*(m+1)/2;return prob({
      enunciado:`Construyes una escalera con cubos: el escalón 1 lleva 1 cubo, el 2 lleva 2, y así hasta el escalón ${m}. ¿Cuántos cubos usas en total? (Usa la fórmula probada por inducción.)`,v,dec:0,unidad:'cubos',
      pasos:[paso('Es la suma 1 + 2 + … + n',`\\(\\dfrac{n(n + 1)}{2}\\) con \\(n = ${m}\\)`,'Fórmula de Gauss.'),final('Calcula',`\\(\\dfrac{${m}\\cdot${m+1}}{2} = ${c(v)}\\)`,'Cubos en total.')],
      errores:[[m*(m+1),'Falta dividir entre 2.'],[m*m,'Esa sería la suma de los impares.']],comprobar:()=>v===sumaDirecta(FAMILIAS[0],m)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const m=r.entero(4,n<=3?15:30),v=m*(m-1)/2;return prob({
      enunciado:`En una reunión hay ${m} personas y cada una saluda de mano una vez a cada una de las demás. ¿Cuántos saludos hay? (Fórmula: \\(\\dfrac{n(n - 1)}{2}\\), que se prueba por inducción: llega una persona y saluda a las n que ya estaban.)`,v,dec:0,unidad:'saludos',
      pasos:[paso('Sustituye n',`\\(\\dfrac{${m}(${m} - 1)}{2}\\)`,'Cada saludo junta a dos personas.'),final('Calcula',`\\(\\dfrac{${m}\\cdot${m-1}}{2} = ${c(v)}\\)`,'Saludos.')],
      errores:[[m*(m-1),'Así cada saludo se cuenta dos veces: divide entre 2.'],[m*m,'Nadie se saluda a sí mismo.']],comprobar:()=>{let s=0;for(let i=0;i<m;i++)for(let j=i+1;j<m;j++)s++;return s===v}})}}
  }});

/* =====================================================================================================================
   ÁLGEBRA LINEAL
   ===================================================================================================================== */
const sis2Tex=(A,b,v=['x','y'])=>`\\begin{cases}${A.map((f,i)=>`${lineal(f.map((x,j)=>[x,v[j]]))} = ${b[i]}`).join(' \\\\ ')}\\end{cases}`;
const reemplaza=(A,b,j)=>A.map((f,i)=>f.map((x,k)=>k===j?b[i]:x));

/* ---------- Regla de Cramer ---------- */
const cramer=crearGen({titulo:'Regla de Cramer',niveles:NIV,
  explicacion:'Si el determinante D de la matriz de coeficientes no es 0, cada incógnita es un cociente de determinantes: x = Dₓ/D, y = Dᵧ/D (y z = D_z/D). Dₓ es el determinante que resulta de cambiar la columna de x por la columna de resultados.',
  alternativa:'Cramer es una receta: un determinante para el denominador (siempre el mismo) y uno por cada incógnita, donde su columna se cambia por los resultados. Si D = 0 la receta no sirve: el sistema no tiene solución única.',
  referencia:'Lay 3.3 – Regla de Cramer; Grossman 3.5',regla:'x = Dₓ/D: en Dₓ la columna de x se cambia por los resultados. Solo si D ≠ 0.',pista:'Primero calcula D; luego cambia la columna de la incógnita por los resultados.',
  tarjetas:[['Regla de Cramer para x','x = Dₓ/D'],['¿Cómo se forma Dₓ?','Se cambia la columna de x por la columna de resultados'],['¿Cuándo no se puede usar Cramer?','Cuando D = 0']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{let A;do A=[[r.noCero(-6,6),r.entero(-6,6)],[r.entero(-6,6),r.noCero(-6,6)]];while(det2(A)===0);const s=[r.entero(-5,5),r.entero(-5,5)],b=mulMV(A,s),D=det2(A);return prob({
      enunciado:`Para resolver \\(${sis2Tex(A,b)}\\) con la regla de Cramer, ¿cuánto vale el determinante D del sistema?`,v:D,dec:0,
      pasos:[paso('Matriz de coeficientes',`\\(${mat(A)}\\)`,'Solo los números que acompañan a x y a y.'),final('Determinante',`\\(D = ${A[0][0]}\\cdot${par(A[1][1])} - ${par(A[0][1])}\\cdot${par(A[1][0])} = ${c(D)}\\)`,'ad − bc.')],
      errores:[[A[0][0]*A[1][1]+A[0][1]*A[1][0],'Es ad − bc: el segundo producto se resta.'],[-D,'Revisa el orden: ad − bc.']],comprobar:()=>casi(detEliminacion(A),D)})}},
    b2:{prof:'basico',f:(n,r)=>{let A;do A=[[r.noCero(-6,6),r.entero(-6,6)],[r.entero(-6,6),r.noCero(-6,6)]];while(det2(A)===0);const s=[r.entero(-5,5),r.entero(-5,5)],b=mulMV(A,s),Dx=det2(reemplaza(A,b,0));return prob({
      enunciado:`En \\(${sis2Tex(A,b)}\\), ¿cuánto vale \\(D_x\\) (la columna de x se cambia por los resultados)?`,v:Dx,dec:0,
      pasos:[paso('Cambia la columna de x por los resultados',`\\(${mat(reemplaza(A,b,0))}\\)`,'La primera columna son ahora '+b.join(' y ')+'.'),final('Determinante',`\\(D_x = ${b[0]}\\cdot${par(A[1][1])} - ${par(A[0][1])}\\cdot${par(b[1])} = ${c(Dx)}\\)`,'ad − bc.')],
      errores:[[det2(reemplaza(A,b,1)),'Ese es Dᵧ: para Dₓ se cambia la columna de x.'],[det2(A),'Ese es D, el determinante sin cambiar columnas.']],comprobar:()=>casi(detEliminacion(reemplaza(A,b,0)),Dx)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{let A,D;do{A=[[r.noCero(-6,6),r.entero(-6,6)],[r.entero(-6,6),r.noCero(-6,6)]];D=det2(A)}while(D===0);const s=[r.entero(-6,6),r.entero(-6,6)],b=mulMV(A,s),Dx=det2(reemplaza(A,b,0)),Dy=det2(reemplaza(A,b,1));return {
      enunciado:`Resuelve con la regla de Cramer (escribe x, y): \\[${sis2Tex(A,b)}\\]`,...comoVector(s),
      pasos:[paso('Determinante del sistema',`\\(D = ${c(D)}\\)`,'De la matriz de coeficientes.'),paso('Columna de x cambiada',`\\(D_x = ${c(Dx)}\\)`,'Resultados en la primera columna.'),paso('Columna de y cambiada',`\\(D_y = ${c(Dy)}\\)`,'Resultados en la segunda columna.'),
        paso('Calcula x',`\\(x = \\dfrac{${Dx}}{${D}} = ${c(s[0])}\\)`,'x = Dₓ/D.'),final('Calcula y',`\\(y = \\dfrac{${Dy}}{${D}} = ${c(s[1])}\\)`,'y = Dᵧ/D.',vec(s))],
      errores:[malV([s[1],s[0]],'Intercambiaste x y y.'),malV([-s[0],-s[1]],'Revisa el signo de D.'),malV([Dx,Dy],`Falta dividir entre D = ${D}.`)],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&casi(t[0],s[0])&&casi(t[1],s[1])}}}},
    p2:{prof:'procedimiento',f:(n,r)=>{let A,D;do{A=Array.from({length:3},()=>[r.entero(-3,3),r.entero(-3,3),r.entero(-3,3)]);D=det3(A)}while(D===0||Math.abs(D)>30);const s=[r.entero(-4,4),r.entero(-4,4),r.entero(-4,4)],b=mulMV(A,s),j=r.entero(0,2),Dj=det3(reemplaza(A,b,j)),nom='xyz'[j];return prob({
      enunciado:`Con la regla de Cramer, calcula solo \\(${nom}\\) en \\[${sis2Tex(A,b,['x','y','z'])}\\]`,v:s[j],dec:2,
      pasos:[paso('Determinante del sistema',`\\(D = ${c(D)}\\)`,'Por cofactores o Sarrus.'),paso(`Cambia la columna de ${nom} por los resultados`,`\\(D_${nom} = \\det${mat(reemplaza(A,b,j))} = ${c(Dj)}\\)`,'Solo esa columna cambia.'),final('Divide',`\\(${nom} = \\dfrac{${Dj}}{${D}} = ${c(s[j])}\\)`,`${nom} = D_${nom}/D.`)],
      errores:[[Dj,'Falta dividir entre D.'],[-s[j],'Revisa el signo de los determinantes.'],[D/(Dj||1),'Es D_'+nom+'/D, no al revés.']],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&casi(t[j],s[j])}})}},
    a1:{prof:'aplicacion',f:(n,r)=>{let A,D;do{A=[[r.entero(1,5),r.entero(1,5)],[r.entero(1,5),r.entero(1,5)]];D=det2(A)}while(D===0);const s=[r.entero(2,6)*5,r.entero(2,8)*5],b=mulMV(A,s),Dx=det2(reemplaza(A,b,0));return prob({
      enunciado:`En una cafetería, ${A[0][0]} cafés y ${A[0][1]} panes cuestan $${b[0]}; ${A[1][0]} cafés y ${A[1][1]} panes cuestan $${b[1]}. Con la regla de Cramer, ¿cuánto cuesta un café?`,v:s[0],dec:2,unidad:'pesos',
      pasos:[paso('Plantea el sistema',`\\(${sis2Tex(A,b,['c','p'])}\\)`,'c = café, p = pan.'),paso('D',`\\(D = ${c(D)}\\)`,'Coeficientes.'),paso('Dc',`\\(D_c = ${c(Dx)}\\)`,'Resultados en la columna del café.'),final('Divide',`\\(c = \\dfrac{${Dx}}{${D}} = ${c(s[0])}\\)`,'Precio del café.')],
      errores:[[s[1],'Ese es el precio del pan.'],[Dx,'Falta dividir entre D.']],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&casi(t[0],s[0])}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{let A,D;do{A=[[1,1],[r.entero(2,9),r.entero(2,9)]];D=det2(A)}while(D===0);const s=[r.entero(5,40),r.entero(5,40)],b=mulMV(A,s),Dy=det2(reemplaza(A,b,1));return prob({
      enunciado:`Se vendieron ${b[0]} boletos: unos de $${A[1][0]} y otros de $${A[1][1]}, y se juntaron $${b[1]}. Con la regla de Cramer, ¿cuántos boletos de $${A[1][1]} se vendieron?`,v:s[1],dec:0,unidad:'boletos',
      pasos:[paso('Plantea el sistema',`\\(${sis2Tex(A,b,['a','b'])}\\)`,'Cantidad de boletos y dinero.'),paso('D',`\\(D = ${c(D)}\\)`,'Coeficientes.'),paso('Db',`\\(D_b = ${c(Dy)}\\)`,'Resultados en la segunda columna.'),final('Divide',`\\(b = \\dfrac{${Dy}}{${D}} = ${c(s[1])}\\)`,'Boletos de $'+A[1][1]+'.')],
      errores:[[s[0],'Esos son los otros boletos.'],[Dy,'Falta dividir entre D.']],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&casi(t[1],s[1])}})}}
  }});

/* ---------- Matrices elementales y factorización LU ---------- */
const lu=crearGen({titulo:'Matrices elementales y factorización LU',niveles:NIV,
  explicacion:'Una matriz elemental es la identidad con UNA operación de renglón aplicada; multiplicar por ella hace esa operación. Al escalonar A sin intercambios queda U (triangular superior) y los multiplicadores ℓᵢⱼ (lo que se resta: Fᵢ − ℓᵢⱼFⱼ) forman L (triangular inferior con unos en la diagonal): A = LU. Luego Ax = b se resuelve en dos pasos fáciles: Ly = b (hacia adelante) y Ux = y (hacia atrás).',
  alternativa:'LU es «guardar las cuentas de Gauss»: U es la matriz escalonada y L es la libreta donde anotaste cuánto restaste de cada renglón. Si tienes que resolver muchos sistemas con la misma A, ya no repites la eliminación.',
  referencia:'Lay 2.2 (matrices elementales) y 2.5 – Factorizaciones de matrices (LU)',regla:'A = LU: U es la escalonada; en L, debajo de la diagonal, van los multiplicadores ℓᵢⱼ = (entrada a eliminar)/(pivote).',pista:'El multiplicador es la entrada que quieres hacer cero dividida entre el pivote de arriba.',
  tarjetas:[['Matriz elemental','La identidad con una operación de renglón aplicada'],['Inversa de la elemental de F₂ − kF₁','La de F₂ + kF₁'],['A = LU','U escalonada; L triangular inferior con unos y los multiplicadores'],['Resolver Ax = b con LU','Ly = b hacia adelante; Ux = y hacia atrás']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const k=r.noCero(-6,6),E=[[1,0],[-k,1]];return {
      enunciado:`¿Qué matriz elemental \\(E\\) (2×2) hace la operación \\(F_2 \\to F_2 ${sg(-k).replace(/(\d+)$/,'$1F_1')}\\)?`,...comoMatriz(E),
      pasos:[paso('Empieza con la identidad',`\\(I = ${mat([[1,0],[0,1]])}\\)`,'La elemental es la identidad con la operación aplicada.'),final('Aplica la operación a la identidad',`\\(E = ${c(mat(E))}\\)`,`Al renglón 2 se le ${k>0?'resta':'suma'} ${Math.abs(k)} veces el renglón 1.`,mat(E))],
      errores:[malV([[1,0],[k,1]],'Revisa el signo: la operación '+(k>0?'resta':'suma')+'.'),malV([[1,-k],[0,1]],'La operación cambia el renglón 2: el número va abajo a la izquierda.'),malV([[1,0],[0,1]],'Falta aplicar la operación.')],comprobar:()=>iguales(mulM(E,[[2,3],[5,7]]),[[2,3],[5-2*k,7-3*k]])}}},
    b2:{prof:'basico',f:(n,r)=>{const k=r.noCero(-7,7),E=[[1,0],[k,1]],Ei=[[1,0],[-k,1]];return {
      enunciado:`Calcula la inversa de la matriz elemental \\(E = ${mat(E)}\\).`,...comoMatriz(Ei),
      pasos:[paso('¿Qué operación hace E?',`\\(F_2 \\to F_2 ${sg(k)}F_1\\)`,'Es la identidad con esa operación.'),final('La inversa la deshace',`\\(E^{-1} = ${c(mat(Ei))}\\)`,'Se hace la operación contraria: cambia el signo.',mat(Ei))],
      errores:[malV(E,'Esa es E: la inversa deshace la operación.'),malV([[1,k],[0,1]],'Solo cambia el signo; no se transpone.'),malV([[-1,0],[-k,-1]],'No se cambian los unos de la diagonal.')],comprobar:()=>iguales(mulM(E,Ei),[[1,0],[0,1]])}}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.elegir([1,2,3,-1,-2]),b=r.entero(-5,5),l=r.noCero(-4,4),u=r.noCero(-6,6),A=[[a,b],[l*a,l*b+u]],U=[[a,b],[0,u]];return {
      enunciado:`Encuentra \\(U\\) en la factorización \\(A = LU\\) de \\(A = ${mat(A)}\\).`,...comoMatriz(U),
      pasos:[paso('Multiplicador',`\\(\\ell_{21} = \\dfrac{${A[1][0]}}{${a}} = ${c(l)}\\)`,'Entrada a eliminar entre el pivote.'),
        paso('Renglón 2 menos ℓ por el renglón 1',`\\(${A[1][1]} - ${par(l)}\\cdot${par(b)} = ${c(u)}\\)`,'La primera entrada se vuelve 0.'),
        final('Escribe U',`\\(U = ${c(mat(U))}\\)`,'Triangular superior: la escalonada.',mat(U))],
      errores:[malV([[a,b],[0,A[1][1]+l*b]],'F₂ − ℓF₁: el producto se resta.'),malV([[1,0],[l,1]],'Esa es L; se pide U.'),malV(A,'Falta escalonar.')],comprobar:()=>iguales(mulM([[1,0],[l,1]],U),A)}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const U=[[r.elegir([1,-1,2]),r.entero(-3,3),r.entero(-3,3)],[0,r.elegir([1,-1,2,-2]),r.entero(-3,3)],[0,0,r.noCero(-4,4)]],l21=r.entero(-3,3),l31=r.entero(-3,3),l32=r.noCero(-3,3),L=[[1,0,0],[l21,1,0],[l31,l32,1]],A=mulM(L,U),a32=A[2][1]-l31*U[0][1];return {
      enunciado:`Encuentra \\(L\\) (triangular inferior con unos en la diagonal) en la factorización \\(A = LU\\) de \\(A = ${mat(A)}\\).`,...comoMatriz(L),
      pasos:[paso('Primer multiplicador',`\\(\\ell_{21} = \\dfrac{${A[1][0]}}{${U[0][0]}} = ${c(l21)}\\)`,'Renglón 2 entre el pivote 1.'),
        paso('Segundo multiplicador',`\\(\\ell_{31} = \\dfrac{${A[2][0]}}{${U[0][0]}} = ${c(l31)}\\)`,'Renglón 3 entre el pivote 1.'),
        paso('Entrada (3,2) después de eliminar',`\\(${A[2][1]} - ${par(l31)}\\cdot${par(U[0][1])} = ${c(a32)}\\)`,'F₃ − ℓ₃₁F₁.'),
        paso('Tercer multiplicador',`\\(\\ell_{32} = \\dfrac{${a32}}{${U[1][1]}} = ${c(l32)}\\)`,'Entre el segundo pivote.'),
        final('Escribe L',`\\(L = ${c(mat(L))}\\)`,'Unos en la diagonal y los multiplicadores debajo.',mat(L))],
      errores:[malV([[1,0,0],[-l21,1,0],[-l31,-l32,1]],'En L van los multiplicadores con su signo (lo que se resta), no cambiados.'),malV(U,'Esa es U; se pide L.'),malV([[1,l21,l31],[0,1,l32],[0,0,1]],'L es triangular inferior: los números van debajo de la diagonal.')],
      comprobar:()=>iguales(mulM(L,U),A)}}},
    a1:{prof:'aplicacion',f:(n,r)=>{const l=r.noCero(-3,3),U=[[r.elegir([1,2,-1]),r.entero(-3,3)],[0,r.elegir([1,-1,2])]],L=[[1,0],[l,1]],A=mulM(L,U),x=[r.entero(-5,5),r.entero(-5,5)],b=mulMV(A,x),y=[b[0],b[1]-l*b[0]];return {
      enunciado:`Un programa ya factorizó \\(A = LU\\) con \\(L = ${mat(L)}\\) y \\(U = ${mat(U)}\\). Resuelve \\(Ax = ${vec(b)}\\) (escribe x₁, x₂).`,...comoVector(x),
      pasos:[paso('Hacia adelante: primer renglón de Ly = b',`\\(y_1 = ${c(y[0])}\\)`,'L tiene un 1 en la diagonal.'),paso('Segundo renglón de Ly = b',`\\(y_2 = ${b[1]} - ${par(l)}\\cdot${par(y[0])} = ${c(y[1])}\\)`,'Sustituye y₁.'),
        paso('Hacia atrás: último renglón de Ux = y',`\\(x_2 = \\dfrac{${y[1]}}{${U[1][1]}} = ${c(x[1])}\\)`,'U es triangular superior.'),final('Primer renglón',`\\(x_1 = \\dfrac{${y[0]} - ${par(U[0][1])}\\cdot${par(x[1])}}{${U[0][0]}} = ${c(x[0])}\\)`,'Sustituye x₂.',vec(x))],
      errores:[malV(y,'Ese es y (el paso intermedio); falta Ux = y.'),malV([x[1],x[0]],'Escribe primero x₁.'),malV(b,'Esos son los datos b.')],comprobar:()=>{const t=resolverSistema(A,b);return !!t&&casi(t[0],x[0])&&casi(t[1],x[1])}}}},
    a2:{prof:'aplicacion',f:(n,r)=>{const L=[[1,0,0],[r.entero(-3,3),1,0],[r.entero(-3,3),r.entero(-3,3),1]],y=[r.entero(-6,6),r.entero(-6,6),r.entero(-6,6)],b=mulMV(L,y);return {
      enunciado:`Una ingeniera resuelve muchos sistemas con la misma matriz y ya tiene \\(L = ${mat(L)}\\). Para \\(b = ${vec(b)}\\), resuelve \\(Ly = b\\) hacia adelante (escribe y₁, y₂, y₃).`,...comoVector(y),
      pasos:[paso('Primer renglón',`\\(y_1 = ${c(y[0])}\\)`,'Solo y₁.'),paso('Segundo renglón',`\\(y_2 = ${b[1]} - ${par(L[1][0])}\\cdot${par(y[0])} = ${c(y[1])}\\)`,'Sustituye y₁.'),final('Tercer renglón',`\\(y_3 = ${b[2]} - ${par(L[2][0])}\\cdot${par(y[0])} - ${par(L[2][1])}\\cdot${par(y[1])} = ${c(y[2])}\\)`,'Sustituye y₁ y y₂.',vec(y))],
      errores:[malV(b,'Esos son los datos: hay que restar lo de los renglones anteriores.'),malV([y[0],b[1]+L[1][0]*y[0],y[2]],'Se resta ℓ·y, no se suma.'),malV([...y].reverse(),'En orden y₁, y₂, y₃.')],comprobar:()=>{const t=resolverSistema(L,b);return !!t&&t.every((v,i)=>casi(v,y[i]))}}}}
  }});

/* ---------- Coordenadas y cambio de base ---------- */
const baseBonita=r=>{let B;do B=[[r.entero(-3,3),r.entero(-3,3)],[r.entero(-3,3),r.entero(-3,3)]];while(Math.abs(det2(B))!==1);return B};   // columnas b₁, b₂ con det ±1
const colsDe=B=>[[B[0][0],B[1][0]],[B[0][1],B[1][1]]];
const inv2=B=>{const d=det2(B);return [[B[1][1]/d,-B[0][1]/d],[-B[1][0]/d,B[0][0]/d]]};
const cambioBase=crearGen({titulo:'Coordenadas y cambio de base',niveles:NIV,
  explicacion:'Las coordenadas de w en una base B = {b₁, b₂} son los números c₁, c₂ con w = c₁b₁ + c₂b₂. La matriz de cambio de base de B a la usual tiene a b₁ y b₂ como COLUMNAS: P·[w]_B = w. Para ir de la usual a B se usa la inversa: [w]_B = P⁻¹w.',
  alternativa:'Una base es un sistema de medidas: (3, 2) en la base usual es «3 pasos al este y 2 al norte». En otra base los pasos tienen otra dirección y otro largo, así que el mismo punto tiene otras coordenadas.',
  referencia:'Lay 4.4 – Sistemas de coordenadas; 4.7 – Cambio de base',regla:'w = c₁b₁ + c₂b₂; P = [b₁ b₂] (columnas): w = P[w]_B y [w]_B = P⁻¹w.',pista:'Escribe w = c₁b₁ + c₂b₂ y resuelve el sistema.',
  tarjetas:[['Coordenadas de w en la base B','Los c tales que w = c₁b₁ + c₂b₂'],['Matriz de cambio de base de B a la usual','Las columnas son los vectores de B'],['De la usual a B','Se multiplica por P⁻¹']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const B=baseBonita(r),[b1,b2]=colsDe(B),cc=[r.entero(-4,4),r.entero(-4,4)],w=mulMV(B,cc);return {
      enunciado:`Con la base \\(B = \\{${vec(b1)},\\ ${vec(b2)}\\}\\) y \\(w = c_1${vec(b1)} + c_2${vec(b2)}\\), si \\([w]_B = ${vec(cc)}\\), ¿quién es w en la base usual?`,...comoVector(w),
      pasos:[paso('Multiplica cada vector por su coeficiente',`\\(${cc[0]}${vec(b1)} + ${par(cc[1])}${vec(b2)}\\)`,'w = c₁b₁ + c₂b₂.'),final('Suma componente a componente',`\\(w = ${c(vec(w))}\\)`,'Primera con primera, segunda con segunda.',vec(w))],
      errores:[malV(cc,'Esas son las coordenadas en B, no en la usual.'),malV(mulMV([[B[0][0],B[1][0]],[B[0][1],B[1][1]]],cc),'Los vectores de la base van como columnas.'),malV(b1.map(x=>x*cc[0]),'Falta sumar c₂b₂.')],comprobar:()=>casi(w[0],cc[0]*b1[0]+cc[1]*b2[0])&&casi(w[1],cc[0]*b1[1]+cc[1]*b2[1])}}},
    b2:{prof:'basico',f:(n,r)=>{const B=[[r.noCero(-4,4),r.entero(-4,4)],[r.entero(-4,4),r.noCero(-4,4)]],[b1,b2]=colsDe(B);return {
      enunciado:`Escribe la matriz de cambio de base de \\(B = \\{${vec(b1)},\\ ${vec(b2)}\\}\\) a la base usual.`,...comoMatriz(B),
      pasos:[paso('Pon cada vector de B como columna',`\\(b_1 = ${vec(b1)}\\) va en la columna 1`,'La matriz convierte coordenadas de B en coordenadas usuales.'),final('Escribe P',`\\(P = ${c(mat(B))}\\)`,'P·[w]_B = w.',mat(B))],
      errores:[malV([b1,b2],'Los vectores van como columnas, no como renglones.'),malV([[1,0],[0,1]],'Esa es la identidad.'),malV(colsDe([[b2[0],b1[0]],[b2[1],b1[1]]]).map(x=>x),'Respeta el orden de la base: b₁ primero.')].filter(e=>!e.si(B.flat().map(String))),comprobar:()=>iguales(mulMV(B,[1,0]),b1)&&iguales(mulMV(B,[0,1]),b2)}}},
    p1:{prof:'procedimiento',f:(n,r)=>{const B=baseBonita(r),[b1,b2]=colsDe(B),cc=[r.entero(-5,5),r.entero(-5,5)],w=mulMV(B,cc);return {
      enunciado:`Encuentra las coordenadas de \\(w = ${vec(w)}\\) en la base \\(B = \\{${vec(b1)},\\ ${vec(b2)}\\}\\). Escribe \\([w]_B\\).`,...comoVector(cc),
      pasos:[paso('Plantea w = c₁b₁ + c₂b₂',`\\(\\begin{cases}${lineal([[b1[0],'c_1'],[b2[0],'c_2']])} = ${w[0]} \\\\ ${lineal([[b1[1],'c_1'],[b2[1],'c_2']])} = ${w[1]}\\end{cases}\\)`,'Una ecuación por componente.'),
        paso('Resuelve c₁',`\\(c_1 = ${c(cc[0])}\\)`,'Por eliminación o con la inversa de P.'),final('Resuelve c₂',`\\(c_2 = ${c(cc[1])}\\)`,'Sustituye c₁.',vec(cc))],
      errores:[malV(w,'Esas son las coordenadas usuales.'),malV([cc[1],cc[0]],'El orden importa: c₁ va con b₁.'),malV([-cc[0],-cc[1]],'Revisa los signos.')],comprobar:()=>{const t=resolverSistema(B,w);return !!t&&casi(t[0],cc[0])&&casi(t[1],cc[1])}}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const B=baseBonita(r),[b1,b2]=colsDe(B),Pi=inv2(B).map(f=>f.map(x=>x+0));return {
      enunciado:`Con \\(B = \\{${vec(b1)},\\ ${vec(b2)}\\}\\), escribe la matriz que convierte coordenadas usuales en coordenadas de B (la inversa de \\(P = [b_1\\ b_2]\\)).`,...comoMatriz(Pi),
      pasos:[paso('Escribe P con b₁ y b₂ como columnas',`\\(P = ${mat(B)}\\)`,'De B a la usual.'),paso('Determinante',`\\(\\det P = ${c(det2(B))}\\)`,'ad − bc.'),final('Inversa 2×2',`\\(P^{-1} = ${c(mat(Pi))}\\)`,'Intercambia a y d, cambia el signo de b y c y divide entre el determinante.',mat(Pi))],
      errores:[malV(B,'Esa es P: de B a la usual. Se pide la inversa.'),malV([[Pi[0][0],Pi[1][0]],[Pi[0][1],Pi[1][1]]],'No se transpone: se usa la fórmula de la inversa.'),malV(Pi.map(f=>f.map(x=>-x)),'Revisa el signo del determinante.')],comprobar:()=>iguales(mulM(B,Pi).map(f=>f.map(x=>Math.round(x*1e9)/1e9)),[[1,0],[0,1]])}}},
    a1:{prof:'aplicacion',f:(n,r)=>{const B=baseBonita(r),[b1,b2]=colsDe(B),cc=[r.entero(-6,6),r.entero(-6,6)],w=mulMV(B,cc);return {
      enunciado:`Un videojuego dibuja en una cuadrícula inclinada con ejes \\(b_1 = ${vec(b1)}\\) y \\(b_2 = ${vec(b2)}\\). Un personaje está en el punto \\(${vec(w)}\\) de la pantalla. ¿Cuáles son sus coordenadas en la cuadrícula (c₁, c₂)?`,...comoVector(cc),
      pasos:[paso('Plantea',`\\(c_1${vec(b1)} + c_2${vec(b2)} = ${vec(w)}\\)`,'Combinación de los ejes.'),paso('Resuelve c₁',`\\(c_1 = ${c(cc[0])}\\)`,'Eliminación.'),final('Resuelve c₂',`\\(c_2 = ${c(cc[1])}\\)`,'Sustituye.',vec(cc))],
      errores:[malV(w,'Esas son las coordenadas de la pantalla.'),malV([cc[1],cc[0]],'c₁ va con b₁.')],comprobar:()=>{const t=resolverSistema(B,w);return !!t&&casi(t[0],cc[0])&&casi(t[1],cc[1])}}}},
    a2:{prof:'aplicacion',f:(n,r)=>{const B=[[r.entero(1,4),r.entero(0,3)],[r.entero(0,3),r.entero(1,4)]];if(det2(B)===0)B[0][0]++;const [b1,b2]=colsDe(B),cc=[r.entero(1,6),r.entero(1,6)],w=mulMV(B,cc);return {
      enunciado:`Un robot avanza con dos motores: el motor 1 lo mueve \\(${vec(b1)}\\) metros por vuelta y el motor 2 \\(${vec(b2)}\\). Si da ${cc[0]} vueltas con el 1 y ${cc[1]} con el 2, ¿en qué punto queda (partiendo del origen)?`,...comoVector(w),
      pasos:[paso('Combinación lineal',`\\(${cc[0]}${vec(b1)} + ${cc[1]}${vec(b2)}\\)`,'Las vueltas son las coordenadas en la base de los motores.'),final('Suma',`\\(${c(vec(w))}\\)`,'Coordenadas usuales.',vec(w))],
      errores:[malV(cc,'Esas son las vueltas (coordenadas en la base de los motores).'),malV(b1.map((x,i)=>x+b2[i]),'Multiplica por el número de vueltas.')],comprobar:()=>casi(w[0],cc[0]*b1[0]+cc[1]*b2[0])&&casi(w[1],cc[0]*b1[1]+cc[1]*b2[1])}}}
  }});

/* ---------- Matriz de una transformación lineal ---------- */
const GEOM=[['refleja en el eje x',[[1,0],[0,-1]]],['refleja en el eje y',[[-1,0],[0,1]]],['refleja en la recta y = x',[[0,1],[1,0]]],['rota 90° en sentido contrario al reloj',[[0,-1],[1,0]]],['rota 180°',[[-1,0],[0,-1]]],['rota 90° en el sentido del reloj',[[0,1],[-1,0]]]];
const matrizTrans=crearGen({titulo:'Matriz de una transformación lineal',niveles:NIV,
  explicacion:'La matriz estándar de una transformación lineal T tiene como columnas las imágenes de los vectores de la base: [T(e₁) T(e₂) …]. Si T(x, y) = (ax + by, cx + dy), la matriz es [[a, b], [c, d]]: cada renglón son los coeficientes de una componente. En otra base B, la matriz es [T]_B = P⁻¹AP, con P = [b₁ b₂].',
  alternativa:'Para «fotografiar» una transformación basta ver a dónde manda a e₁ = (1, 0) y a e₂ = (0, 1): esas imágenes son las columnas. Lo demás se obtiene por linealidad.',
  referencia:'Lay 1.9 – La matriz de una transformación lineal; 5.4 – Vectores propios y transformaciones lineales',regla:'Columnas = T(e₁), T(e₂), …; en la base B: [T]_B = P⁻¹AP.',pista:'Calcula T(1, 0) y T(0, 1): son las columnas.',
  tarjetas:[['Columnas de la matriz estándar de T','T(e₁), T(e₂), …'],['Matriz de T(x, y) = (ax + by, cx + dy)','[[a, b], [c, d]]'],['Matriz de T en la base B','P⁻¹AP con P = [b₁ b₂]'],['Matriz de «primero S, luego T»','[T][S] (la última va a la izquierda)']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const M=[[r.entero(-6,6),r.entero(-6,6)],[r.entero(-6,6),r.entero(-6,6)]];if(M.flat().every(x=>!x))M[0][0]=1;const f=(fila)=>lineal([[fila[0],'x'],[fila[1],'y']]);return {
      enunciado:`Escribe la matriz estándar de \\(T(x, y) = (${f(M[0])},\\ ${f(M[1])})\\).`,...comoMatriz(M),
      pasos:[paso('Primera componente: sus coeficientes son el renglón 1',`\\(${f(M[0])} \\to (${M[0].join(', ')})\\)`,'Coeficiente de x y de y.'),final('Segunda componente: renglón 2',`\\(${c(mat(M))}\\)`,'Cada renglón es una componente.',mat(M))],
      errores:[malV([[M[0][0],M[1][0]],[M[0][1],M[1][1]]],'Los coeficientes de cada componente van en un RENGLÓN.'),malV([[M[0][1],M[0][0]],[M[1][1],M[1][0]]],'Primero el coeficiente de x y luego el de y.')].filter(e=>!e.si(M.flat().map(String))),comprobar:()=>iguales(mulMV(M,[1,0]),[M[0][0],M[1][0]])}}},
    b2:{prof:'basico',f:(n,r)=>{const u=[r.entero(-5,5),r.entero(-5,5)],v=[r.entero(-5,5),r.entero(-5,5)],M=[[u[0],v[0]],[u[1],v[1]]];return {
      enunciado:`Una transformación lineal cumple \\(T(1, 0) = ${vec(u)}\\) y \\(T(0, 1) = ${vec(v)}\\). ¿Cuál es su matriz?`,...comoMatriz(M),
      pasos:[paso('T(e₁) es la primera columna',`\\(${vec(u)}\\)`,'Las imágenes de la base van como columnas.'),final('T(e₂) es la segunda',`\\(${c(mat(M))}\\)`,'[T(e₁) T(e₂)].',mat(M))],
      errores:[malV([u,v],'Van como columnas, no como renglones.'),malV([[v[0],u[0]],[v[1],u[1]]],'T(e₁) va primero.')].filter(e=>!e.si(M.flat().map(String))),comprobar:()=>iguales(mulMV(M,[1,0]),u)&&iguales(mulMV(M,[0,1]),v)}}},
    p1:{prof:'procedimiento',f:(n,r)=>{const M=[[r.entero(-4,4),r.entero(-4,4)],[r.entero(-4,4),r.entero(-4,4)],[r.entero(-4,4),r.entero(-4,4)]];if(M.flat().every(x=>!x))M[2][1]=1;const f=fila=>lineal([[fila[0],'x'],[fila[1],'y']]);return {
      enunciado:`Escribe la matriz (3×2) de \\(T:\\mathbb{R}^2 \\to \\mathbb{R}^3\\), \\(T(x, y) = (${M.map(f).join(',\\ ')})\\).`,...comoMatriz(M),
      pasos:[paso('Calcula T(1, 0)',`\\(T(1, 0) = ${vec(M.map(x=>x[0]))}\\)`,'Primera columna.'),paso('Calcula T(0, 1)',`\\(T(0, 1) = ${vec(M.map(x=>x[1]))}\\)`,'Segunda columna.'),final('Junta las columnas',`\\(${c(mat(M))}\\)`,'3 renglones (llegada) × 2 columnas (salida).',mat(M))],
      errores:[malV(M.map(f=>[f[1],f[0]]),'Primero la columna de x.'),malV(M.map(f=>[-f[0],f[1]]),'Revisa los signos de la primera columna.')].filter(e=>!e.si(M.flat().map(String))),comprobar:()=>iguales(mulMV(M,[2,-3]),M.map(f=>2*f[0]-3*f[1]))}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const P=baseBonita(r),Pi=inv2(P).map(f=>f.map(x=>x+0)),A=[[r.entero(-3,3),r.entero(-3,3)],[r.entero(-3,3),r.entero(-3,3)]],AP=mulM(A,P),TB=mulM(Pi,AP).map(f=>f.map(x=>Math.round(x)));return {
      enunciado:`La transformación T tiene matriz estándar \\(A = ${mat(A)}\\). Calcula su matriz en la base \\(B = \\{${vec([P[0][0],P[1][0]])},\\ ${vec([P[0][1],P[1][1]])}\\}\\): \\([T]_B = P^{-1}AP\\).`,...comoMatriz(TB),
      pasos:[paso('P con los vectores de B como columnas',`\\(P = ${mat(P)}\\)`,'De B a la usual.'),paso('Inversa de P',`\\(P^{-1} = ${mat(Pi)}\\)`,`det P = ${det2(P)}.`),paso('Multiplica AP',`\\(AP = ${c(mat(AP))}\\)`,'Primero A por P.'),final('Multiplica por P⁻¹ a la izquierda',`\\([T]_B = ${c(mat(TB))}\\)`,'P⁻¹(AP).',mat(TB))],
      errores:[malV(A,'Esa es la matriz en la base usual.'),malV(mulM(mulM(P,A),Pi).map(f=>f.map(Math.round)),'Es P⁻¹AP, no PAP⁻¹.'),malV(AP,'Falta multiplicar por P⁻¹.')].filter(e=>!e.si(TB.flat().map(String))),
      comprobar:()=>iguales(mulM(P,TB),AP)}}},
    a1:{prof:'aplicacion',f:(n,r)=>{const [txt,M]=r.elegir(GEOM),k=r.entero(2,4),K=M.map(f=>f.map(x=>k*x));return {
      enunciado:`En una app de dibujo, un botón ${txt} y luego amplía todo por ${k}. ¿Cuál es la matriz de esa transformación?`,...comoMatriz(K),
      pasos:[paso('Matriz de la primera transformación',`\\(${mat(M)}\\)`,'Columnas: a dónde van (1, 0) y (0, 1).'),paso('Ampliar por '+k,`\\(${k}I\\)`,'Multiplica todo por '+k+'.'),final('Compón (la última a la izquierda)',`\\(${k}I\\cdot${mat(M)} = ${c(mat(K))}\\)`,'Ampliar conmuta con todo.',mat(K))],
      errores:[malV(M,'Falta ampliar por '+k+'.'),malV(M.map(f=>f.map(x=>x+k)),'Ampliar multiplica, no suma.'),malV([[k,0],[0,k]],'Falta la primera transformación.')],comprobar:()=>{const v=mulMV(K,[1,0]),w=mulMV(M,[1,0]).map(x=>k*x);return iguales(v,w)}}}},
    a2:{prof:'aplicacion',f:(n,r)=>{let [t1,M1]=r.elegir(GEOM),[t2,M2]=r.elegir(GEOM);if(t1===t2)[t2,M2]=GEOM[(GEOM.findIndex(g=>g[0]===t1)+2)%GEOM.length];const C=mulM(M2,M1);return {
      enunciado:`Un filtro de imagen primero ${t1} y después ${t2}. ¿Cuál es la matriz de todo el filtro?`,...comoMatriz(C),
      pasos:[paso('Primera transformación',`\\(A = ${mat(M1)}\\)`,'Se aplica primero.'),paso('Segunda',`\\(B = ${mat(M2)}\\)`,'Se aplica después.'),final('La que va después va a la izquierda',`\\(BA = ${c(mat(C))}\\)`,'Primero A, luego B: B·A.',mat(C))],
      errores:[malV(mulM(M1,M2),'El orden importa: la segunda va a la izquierda (BA).'),malV(M1,'Falta la segunda transformación.'),malV(M2,'Falta la primera transformación.')].filter(e=>!e.si(C.flat().map(String))),comprobar:()=>iguales(mulMV(C,[3,-2]),mulMV(M2,mulMV(M1,[3,-2])))}}}
  }});

/* ---------- Producto interno, proyección ortogonal y mínimos cuadrados ---------- */
const ajusteRecta=(xs,ys)=>{const nn=xs.length,sx=xs.reduce((a,b)=>a+b,0),sy=ys.reduce((a,b)=>a+b,0),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),sxx=xs.reduce((a,x)=>a+x*x,0),m=(nn*sxy-sx*sy)/(nn*sxx-sx*sx),b=(sy-m*sx)/nn;return {sx,sy,sxy,sxx,m,b}};
// las ecuaciones normales AᵀA c = Aᵀy, resueltas por eliminación: un cálculo distinto a la fórmula de la pendiente
const normales=(xs,ys)=>resolverSistema([[xs.length,xs.reduce((a,b)=>a+b,0)],[xs.reduce((a,b)=>a+b,0),xs.reduce((a,x)=>a+x*x,0)]],[ys.reduce((a,b)=>a+b,0),xs.reduce((a,x,i)=>a+x*ys[i],0)]);
const minimos=crearGen({titulo:'Producto interno, proyección ortogonal y mínimos cuadrados',niveles:NIV,
  explicacion:'Un producto interno ⟨u, v⟩ generaliza el producto punto (puede tener pesos). La proyección ortogonal de b sobre la recta de u es (⟨b, u⟩/⟨u, u⟩)·u: la «sombra» de b. Si Ax = b no tiene solución, la de mínimos cuadrados resuelve las ecuaciones normales AᵀA x̂ = Aᵀb; para ajustar una recta y = b + mx a datos, eso da la pendiente y la ordenada que minimizan los errores al cuadrado.',
  alternativa:'Mínimos cuadrados es encontrar la recta que pasa «lo más cerca posible» de puntos que no están alineados: la que hace más chica la suma de los errores al cuadrado. Proyectar es lo mismo: buscar el punto de la recta más cercano a b.',
  referencia:'Lay 6.1–6.2 (producto interno, proyección) y 6.5–6.6 – Mínimos cuadrados y modelos lineales',regla:'proy_u b = (⟨b,u⟩/⟨u,u⟩)u; mínimos cuadrados: AᵀA x̂ = Aᵀb; recta: m = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²), b = (Σy − mΣx)/n.',pista:'Calcula las sumas Σx, Σy, Σxy y Σx² antes de la fórmula.',
  tarjetas:[['Proyección de b sobre la recta de u','(b·u/u·u)·u'],['Ecuaciones normales','AᵀA x̂ = Aᵀb'],['¿Qué minimiza la recta de mínimos cuadrados?','La suma de los errores al cuadrado'],['Producto interno con pesos 2 y 1','⟨u, v⟩ = 2u₁v₁ + u₂v₂']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const w=[r.entero(1,4),r.entero(1,4)],u=[r.entero(-5,5),r.entero(-5,5)],v=[r.entero(-5,5),r.entero(-5,5)],val=w[0]*u[0]*v[0]+w[1]*u[1]*v[1];return prob({
      enunciado:`Con el producto interno \\(\\langle u, v\\rangle = ${w[0]}u_1v_1 + ${w[1]}u_2v_2\\), calcula \\(\\langle ${vec(u)},\\ ${vec(v)}\\rangle\\).`,v:val,dec:0,
      pasos:[paso('Sustituye',`\\(${w[0]}\\cdot${par(u[0])}\\cdot${par(v[0])} + ${w[1]}\\cdot${par(u[1])}\\cdot${par(v[1])}\\)`,'Cada producto con su peso.'),final('Calcula',`\\(${w[0]*u[0]*v[0]} ${sg(w[1]*u[1]*v[1])} = ${c(val)}\\)`,'Es un número.')],
      errores:[[u[0]*v[0]+u[1]*v[1],'Faltan los pesos: este producto interno no es el punto usual.'],[w[0]*u[0]*v[0],'Falta el segundo término.']].filter(([x])=>x!==val),comprobar:()=>{let s=0;for(let i=0;i<2;i++)s+=w[i]*u[i]*v[i];return s===val}})}},
    b2:{prof:'basico',f:(n,r)=>{let u;do u=[r.entero(-3,3),r.entero(-3,3)];while(!u[0]&&!u[1]);const k=r.noCero(-3,3),t=r.noCero(-2,2),perp=[-u[1]*t,u[0]*t],b=[k*u[0]+perp[0],k*u[1]+perp[1]],p=[k*u[0],k*u[1]],bu=b[0]*u[0]+b[1]*u[1],uu=u[0]**2+u[1]**2;return {
      enunciado:`Calcula la proyección ortogonal de \\(b = ${vec(b)}\\) sobre la recta generada por \\(u = ${vec(u)}\\).`,...comoVector(p),
      pasos:[paso('Producto b·u',`\\(b\\cdot u = ${c(bu)}\\)`,'Primera por primera más segunda por segunda.'),paso('Producto u·u',`\\(u\\cdot u = ${c(uu)}\\)`,'El cuadrado de la norma de u.'),paso('Cociente',`\\(\\dfrac{${bu}}{${uu}} = ${c(k)}\\)`,'Cuántas veces cabe u.'),final('Multiplica por u',`\\(${k}${vec(u)} = ${c(vec(p))}\\)`,'La sombra de b sobre la recta.',vec(p))],
      errores:[malV(u.map(x=>x*bu),'Falta dividir entre u·u.'),malV(b,'Ese es b: la proyección está sobre la recta de u.'),malV(perp,'Esa es la parte perpendicular (b − proyección).')],comprobar:()=>{const e=[b[0]-p[0],b[1]-p[1]];return e[0]*u[0]+e[1]*u[1]===0&&p[0]*u[1]-p[1]*u[0]===0}}}},
    p1:{prof:'procedimiento',f:(n,r)=>{const A=[[1,r.entero(-3,3)],[1,r.entero(-3,3)],[1,r.entero(-3,3)]],At=A[0].map((_,j)=>A.map(f=>f[j])),M=mulM(At,A);return {
      enunciado:`Para mínimos cuadrados se necesita \\(A^{T}A\\). Calcúlala con \\(A = ${mat(A)}\\).`,...comoMatriz(M),
      pasos:[paso('Transpuesta',`\\(A^{T} = ${mat(At)}\\)`,'Renglones por columnas.'),paso('Entrada (1,1): columna 1 · columna 1',`\\(${A.map(f=>`${par(f[0])}^{2}`).join(' + ')} = ${c(M[0][0])}\\)`,'Siempre la suma de cuadrados de la columna.'),paso('Entrada (1,2): columna 1 · columna 2',`\\(${A.map(f=>`${par(f[0])}\\cdot${par(f[1])}`).join(' + ')} = ${c(M[0][1])}\\)`,'Es simétrica: (2,1) es igual.'),final('Entrada (2,2) y la matriz',`\\(A^{T}A = ${c(mat(M))}\\)`,'2×2 y simétrica.',mat(M))],
      errores:[malV([[M[0][0],0],[0,M[1][1]]],'Faltan los productos de una columna por la otra.'),malV([[3,A.reduce((s,f)=>s+f[1],0)],[A.reduce((s,f)=>s+f[1],0),A.reduce((s,f)=>s+f[1],0)]],'La entrada (2,2) es la suma de CUADRADOS de la columna 2.')],comprobar:()=>{let ok=true;for(let i=0;i<2;i++)for(let j=0;j<2;j++)ok=ok&&M[i][j]===A.reduce((s,f)=>s+f[i]*f[j],0);return ok&&M[0][1]===M[1][0]}}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const xs=n<=3?[0,1,2,3]:[1,2,3,4,5],ys=xs.map(x=>r.entero(-3,3)+2*x+r.entero(0,3)),f=ajusteRecta(xs,ys),N=xs.length;return prob({
      enunciado:`Ajusta una recta \\(y = b + mx\\) por mínimos cuadrados a los puntos ${xs.map((x,i)=>`(${x}, ${ys[i]})`).join(', ')}. ¿Cuánto vale la pendiente m? (2 decimales)`,v:f.m,dec:2,
      pasos:[paso('Suma las x',`\\(\\Sigma x = ${c(f.sx)}\\)`,`Hay n = ${N} puntos.`),paso('Suma las y',`\\(\\Sigma y = ${c(f.sy)}\\)`,'Todas las y.'),paso('Suma los productos x·y',`\\(\\Sigma xy = ${c(f.sxy)}\\)`,'Punto por punto.'),paso('Suma los cuadrados de x',`\\(\\Sigma x^{2} = ${c(f.sxx)}\\)`,'x por x.'),
        final('Fórmula de la pendiente',`\\(m = \\dfrac{${N}\\cdot${f.sxy} - ${f.sx}\\cdot${f.sy}}{${N}\\cdot${f.sxx} - ${f.sx}^{2}} \\approx ${c(f.m.toFixed(2))}\\)`,'Viene de las ecuaciones normales.')],
      errores:[[(ys.at(-1)-ys[0])/(xs.at(-1)-xs[0]),'Eso es la pendiente entre el primer y el último punto, no la de mínimos cuadrados.'],[f.sy/f.sx,'No es Σy/Σx.']],comprobar:()=>{const s=normales(xs,ys);return !!s&&casi(s[1],f.m)}})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const xs=[1,2,3,4],ys=xs.map(x=>10*r.entero(2,5)+5*x*r.entero(1,3)+r.entero(-4,4)),f=ajusteRecta(xs,ys),v=f.b+5*f.m;return prob({
      enunciado:`Una tienda vendió ${ys.join(', ')} piezas en los meses 1 a 4. Con la recta de mínimos cuadrados, ¿cuántas piezas se pronostican para el mes 5? (2 decimales)`,v,dec:2,unidad:'piezas',
      pasos:[paso('Suma las ventas',`\\(${ys.join(' + ')} = ${c(f.sy)}\\)`,'Σy; los meses suman Σx = 10.'),paso('Pendiente por mínimos cuadrados',`\\(m \\approx ${c(f.m.toFixed(4))}\\)`,'Con las sumas Σx, Σy, Σxy y Σx².'),paso('Ordenada',`\\(b = \\dfrac{${f.sy} - m\\cdot${f.sx}}{4} \\approx ${c(f.b.toFixed(4))}\\)`,'La recta pasa por el punto promedio.'),final('Evalúa en x = 5',`\\(b + 5m \\approx ${c(v.toFixed(2))}\\)`,'Pronóstico.')],
      errores:[[ys.at(-1)+(ys.at(-1)-ys.at(-2)),'Eso solo sigue la última subida; la recta usa todos los datos.'],[f.sy/4,'Ese es el promedio, no el pronóstico.']],comprobar:()=>{const s=normales(xs,ys);return !!s&&casi(s[0]+5*s[1],v)}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const xs=[0,2,4,6],ys=xs.map(x=>r.entero(12,18)+x*r.entero(1,2)+r.entero(-1,1)),f=ajusteRecta(xs,ys);return prob({
      enunciado:`Un sensor midió la temperatura cada 2 horas: ${xs.map((x,i)=>`a las ${x} h, ${ys[i]} °C`).join('; ')}. Con la recta de mínimos cuadrados \\(T = b + mt\\), ¿cuánto vale la ordenada b (la temperatura estimada a las 0 h)? (2 decimales)`,v:f.b,dec:2,unidad:'°C',
      pasos:[paso('Suma las temperaturas',`\\(${ys.join(' + ')} = ${c(f.sy)}\\)`,'ΣT; las horas suman Σt = 12.'),paso('Pendiente',`\\(m \\approx ${c(f.m.toFixed(4))}\\)`,'Con Σt, ΣT, ΣtT y Σt².'),final('Ordenada',`\\(b = \\dfrac{${f.sy} - m\\cdot${f.sx}}{4} \\approx ${c(f.b.toFixed(2))}\\)`,'b = (Σy − mΣx)/n.')],
      errores:[[ys[0],'La primera medición tiene error; la recta usa todas.'],[f.sy/4,'Ese es el promedio de T.']],comprobar:()=>{const s=normales(xs,ys);return !!s&&casi(s[0],f.b)}})}}
  }});

/* ---------- Matrices simétricas, diagonalización ortogonal y formas cuadráticas ---------- */
// simétrica 2×2 con valores propios enteros: con v = (1, 1) o v = (1, 2)
const simetrica=r=>{if(r.prob(0.5)){let l1,l2;do{l1=r.entero(-6,8);l2=r.entero(-6,8)}while(l1===l2||(l1+l2)%2);return {A:[[(l1+l2)/2,(l1-l2)/2],[(l1-l2)/2,(l1+l2)/2]],l1,l2,v1:[1,1],v2:[-1,1]}}
  let l1,l2;do{l1=r.entero(-6,9);l2=r.entero(-6,9)}while(l1===l2||(l1-l2)%5);return {A:[[(l1+4*l2)/5,(2*l1-2*l2)/5],[(2*l1-2*l2)/5,(4*l1+l2)/5]],l1,l2,v1:[1,2],v2:[-2,1]}};
const proporcional=(e,v)=>{if(!Array.isArray(e)||e.length!==2)return false;const x=e.map(num);if(!x.every(Number.isFinite)||x.every(z=>Math.abs(z)<1e-9))return false;return Math.abs(x[0]*v[1]-x[1]*v[0])<1e-9};
const diagOrt=crearGen({titulo:'Matrices simétricas y formas cuadráticas',niveles:NIV,
  explicacion:'Una matriz simétrica (A = Aᵀ) siempre tiene valores propios reales y vectores propios PERPENDICULARES: se diagonaliza con una matriz ortogonal, A = QDQᵀ. Una forma cuadrática Q(x, y) = ax² + bxy + cy² se escribe con la matriz simétrica [[a, b/2], [b/2, c]]; sus valores propios dicen su forma: si los dos son positivos es definida positiva (como un tazón).',
  alternativa:'La matriz simétrica es la «tabla» de la forma cuadrática: la diagonal lleva los coeficientes de x² y y², y el término cruzado se reparte a la mitad en las dos esquinas. Girar a los ejes de los vectores propios quita el término xy.',
  referencia:'Lay 7.1 – Diagonalización de matrices simétricas; 7.2 – Formas cuadráticas',regla:'A simétrica ⇒ A = QDQᵀ con vectores propios ortogonales; Q(x) = xᵀAx con A = [[a, b/2], [b/2, c]].',pista:'En la matriz de la forma, el coeficiente de xy se reparte a la mitad.',
  tarjetas:[['Matriz de ax² + bxy + cy²','[[a, b/2], [b/2, c]]'],['Vectores propios de una simétrica (valores distintos)','Son perpendiculares'],['Forma cuadrática definida positiva','Todos sus valores propios son positivos'],['Diagonalización ortogonal','A = QDQᵀ, con Q ortogonal (Qᵀ = Q⁻¹)']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.noCero(-6,6),b=2*r.noCero(-5,5),cc=r.noCero(-6,6),M=[[a,b/2],[b/2,cc]];return {
      enunciado:`Escribe la matriz simétrica de la forma cuadrática \\(Q(x, y) = ${lineal([[a,'x^{2}'],[b,'xy'],[cc,'y^{2}']])}\\).`,...comoMatriz(M),
      pasos:[paso('En la diagonal, los coeficientes de x² y y²',`\\(${a}\\) y \\(${cc}\\)`,'a arriba a la izquierda, c abajo a la derecha.'),paso('El término cruzado se reparte',`\\(\\dfrac{${b}}{2} = ${c(b/2)}\\)`,'La mitad en cada esquina.'),final('La matriz',`\\(${c(mat(M))}\\)`,'Simétrica.',mat(M))],
      errores:[malV([[a,b],[b,cc]],'El coeficiente de xy se reparte a la MITAD en las dos esquinas.'),malV([[a,b],[0,cc]],'Debe ser simétrica: la mitad en cada esquina.'),malV([[cc,b/2],[b/2,a]],'x² va arriba a la izquierda.')],
      comprobar:()=>[[1,2],[-3,1],[2,-2]].every(([x,y])=>x*(M[0][0]*x+M[0][1]*y)+y*(M[1][0]*x+M[1][1]*y)===a*x*x+b*x*y+cc*y*y)}}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(-5,5),b=2*r.entero(-4,4),cc=r.entero(-5,5),x=r.entero(-3,3),y=r.noCero(-3,3),v=a*x*x+b*x*y+cc*y*y;return prob({
      enunciado:`Evalúa la forma cuadrática \\(Q(x, y) = ${lineal([[a,'x^{2}'],[b,'xy'],[cc,'y^{2}']])}\\) en \\((${x}, ${y})\\).`,v,dec:0,
      pasos:[paso('Sustituye',`\\(${a}\\cdot${par(x)}^{2} ${sg(b)}\\cdot${par(x)}\\cdot${par(y)} ${sg(cc)}\\cdot${par(y)}^{2}\\)`,'x = '+x+', y = '+y+'.'),final('Calcula',`\\(${a*x*x} ${sg(b*x*y)} ${sg(cc*y*y)} = ${c(v)}\\)`,'Cuida los signos.')],
      errores:[[a*x*x+cc*y*y,'Falta el término cruzado bxy.'],[a*x*x+b*x*y/2+cc*y*y,'En la fórmula el término es bxy completo (la mitad solo va en la matriz).']].filter(([z])=>z!==v),
      comprobar:()=>{const M=[[a,b/2],[b/2,cc]];return x*(M[0][0]*x+M[0][1]*y)+y*(M[1][0]*x+M[1][1]*y)===v}})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const {A,l1,l2}=simetrica(r),tr=A[0][0]+A[1][1],dt=det2(A);return {
      enunciado:`Encuentra los valores propios de la matriz simétrica \\(A = ${mat(A)}\\) (sepáralos con coma).`,respuesta:`λ = ${Math.max(l1,l2)}, λ = ${Math.min(l1,l2)}`,verificar:e=>igualConjunto(String(e).replace(/λ\s*=\s*/g,''),[l1,l2]),teclado:'mat',
      pasos:[paso('Traza y determinante',`\\(\\text{tr}\\,A = ${c(tr)}\\), \\(\\det A = ${c(dt)}\\)`,'Para una 2×2: λ² − (traza)λ + det = 0.'),paso('Ecuación característica',`\\(\\lambda^{2} ${tr?`- ${tr===1?'':par(tr)}\\lambda `:''}+ ${par(dt)} = 0\\)`,'det(A − λI) = 0.'),final('Resuelve',`\\(\\lambda = ${c(Math.max(l1,l2))},\\ \\lambda = ${c(Math.min(l1,l2))}\\)`,'Reales, como en toda simétrica.',`λ = ${Math.max(l1,l2)}, λ = ${Math.min(l1,l2)}`)],
      errores:[{valor:`λ = ${A[0][0]}, λ = ${A[1][1]}`,si:e=>igualConjunto(String(e).replace(/λ\s*=\s*/g,''),[A[0][0],A[1][1]])&&A[0][1]!==0,por:'La diagonal no da los valores propios: no es triangular.'},{valor:`λ = ${-l1}, λ = ${-l2}`,si:e=>igualConjunto(String(e).replace(/λ\s*=\s*/g,''),[-l1,-l2])&&l1!==-l2,por:'Revisa los signos de la ecuación característica.'}],
      comprobar:()=>[l1,l2].every(l=>Math.abs(detEliminacion([[A[0][0]-l,A[0][1]],[A[1][0],A[1][1]-l]]))<1e-9)}}},
    p2:{prof:'procedimiento',f:(n,r)=>{const {A,l1,l2,v1,v2}=simetrica(r);return {
      enunciado:`La matriz simétrica \\(A = ${mat(A)}\\) tiene el vector propio \\(${vec(v1)}\\) con \\(\\lambda = ${l1}\\). Da un vector propio para el otro valor propio, \\(\\lambda = ${l2}\\).`,forma:{filas:1,cols:2},celdas:v2.map(String),respuesta:vec(v2),verificar:e=>proporcional(e,v2),teclado:'mat',
      pasos:[paso('En una simétrica, los vectores propios son perpendiculares',`\\(${vec(v1)}\\cdot (a, b) = 0\\)`,'Valores propios distintos ⇒ vectores ortogonales.'),paso('Elige uno perpendicular',`\\((a, b) = ${c(vec(v2))}\\)`,'Cambia el orden y un signo.'),final('Comprueba',`\\(A${vec(v2)} = ${vec(mulMV(A,v2))} = ${l2}${vec(v2)}\\)`,'Cualquier múltiplo distinto de cero sirve.',vec(v2))],
      errores:[{si:e=>proporcional(e,v1),por:'Ese es el vector propio de λ = '+l1+'.'},{si:e=>Array.isArray(e)&&e.every(x=>num(x)===0),por:'El vector cero no es vector propio.'}],
      comprobar:()=>iguales(mulMV(A,v2),v2.map(x=>l2*x))&&v1[0]*v2[0]+v1[1]*v2[1]===0}}},
    a1:{prof:'aplicacion',f:(n,r)=>{const {A,l1,l2}=simetrica(r),pos=l1>0&&l2>0,q=lineal([[A[0][0],'x^{2}'],[2*A[0][1],'xy'],[A[1][1],'y^{2}']]);return {
      enunciado:`La energía de un sistema de dos resortes es \\(E(x, y) = ${q}\\). Sus valores propios son \\(${l1}\\) y \\(${l2}\\). ¿Es una forma definida positiva (energía positiva para todo (x, y) ≠ (0, 0))? Responde sí o no.`,...siNo(pos,pos?'Los dos valores propios son positivos: sí es definida positiva.':'Hay un valor propio que no es positivo: no es definida positiva.'),
      pasos:[paso('Mira el signo de cada valor propio',`\\(${l1}\\) y \\(${l2}\\)`,'Definida positiva ⇔ todos positivos.'),final('Concluye',pos?'Los dos son positivos':'Alguno es 0 o negativo','La forma tiene «forma de tazón» solo si todos son positivos.',pos?'Sí':'No')],
      comprobar:()=>{const Q=(x,y)=>A[0][0]*x*x+2*A[0][1]*x*y+A[1][1]*y*y;const muestras=[[1,0],[0,1],[1,1],[1,-1],[1,2],[-2,1],[3,-1]].map(([x,y])=>Q(x,y));return pos===muestras.every(v=>v>0)||!pos&&[[1,1],[-1,1],[1,2],[-2,1]].some(([x,y])=>Q(x,y)<=0)}}}},
    a2:{prof:'aplicacion',f:(n,r)=>{const {A,l1,l2}=simetrica(r),q=lineal([[A[0][0],'x^{2}'],[2*A[0][1],'xy'],[A[1][1],'y^{2}']]),v=Math.max(l1,l2);return prob({
      enunciado:`Una antena tiene el perfil \\(${q} = 1\\). Al girar a los ejes principales queda \\(\\lambda_1X^{2} + \\lambda_2Y^{2} = 1\\). ¿Cuánto vale el MAYOR de \\(\\lambda_1\\), \\(\\lambda_2\\)?`,v,dec:0,
      pasos:[paso('Matriz simétrica de la forma',`\\(${mat(A)}\\)`,'El término xy se reparte a la mitad.'),paso('Ecuación característica',`\\(\\lambda^{2} ${A[0][0]+A[1][1]?`- ${A[0][0]+A[1][1]===1?'':par(A[0][0]+A[1][1])}\\lambda `:''}+ ${par(det2(A))} = 0\\)`,'λ² − (traza)λ + det = 0.'),final('El mayor',`\\(${c(v)}\\)`,'Los λ son los coeficientes en los ejes principales.')],
      errores:[[Math.min(l1,l2),'Ese es el menor.'],[A[0][0],'La diagonal no da los valores propios.']].filter(([z])=>z!==v),comprobar:()=>Math.abs(detEliminacion([[A[0][0]-v,A[0][1]],[A[1][0],A[1][1]-v]]))<1e-9&&l1+l2===A[0][0]+A[1][1]})}}
  }});

export default {'alg/division-polinomios':division,'alg/complejos':complejos,'alg/ecuaciones-racionales':racionalesEc,'alg/sucesiones':sucesiones,'alg/induccion':induccion,
  'al/cramer':cramer,'al/lu':lu,'al/cambio-base':cambioBase,'al/matriz-transformacion':matrizTrans,'al/minimos-cuadrados':minimos,'al/diagonalizacion-ortogonal':diagOrt};
