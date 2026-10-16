/* Matemáticas — habilidades nuevas (1): decimales, razones y proporciones, ecuaciones con radicales y valor absoluto,
   desigualdades no lineales y funciones de precálculo (transformaciones, composición e inversa, polinomiales,
   racionales, exponenciales y modelado). Cada plantilla con sus números, pasos, errores típicos y comprobar(). */
import {prob,paso,final,marca,fmt,cerca,crearGen} from './extensiones/base.js';

// Plantillas por nivel: b = básico, p = procedimiento, a = aplicación (≥ 3 por nivel)
const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);

/* ---------- Decimales y redondeo ---------- */
const decimales=crearGen({titulo:'Decimales y redondeo',niveles:NIV,
  explicacion:'Un decimal es otra forma de escribir una fracción con denominador 10, 100, 1000… Para redondear a d decimales mira la cifra siguiente: si es 5 o más, sube; si no, se queda. Para multiplicar decimales, multiplica sin el punto y luego pon tantos decimales como sumen los factores.',
  alternativa:'Piensa en dinero: $3.75 son 3 pesos y 75 centavos. Redondear a pesos es decidir si te acercas más a 3 o a 4: con 75 centavos, a 4.',
  referencia:'Stewart, Precálculo 1.1 – Números reales',regla:'Redondeo: la cifra siguiente decide (5 o más sube). Al multiplicar, los decimales del resultado son la suma de los decimales de los factores.',pista:'Mira la cifra siguiente.',
  tarjetas:[['¿Cómo se redondea a 2 decimales?','Se mira la tercera cifra decimal: si es 5 o más, sube la segunda.'],['1/4 en decimal','0.25.'],['¿Cuántos decimales tiene 1.2 × 0.03?','3 (uno más dos): 0.036.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const x=r.entero(1000,99999)/1000,d=r.entero(0,2),v=Math.round(x*10**d)/10**d;return prob({enunciado:`Redondea ${x} a ${d} decimal${d===1?'':'es'}.`,v,dec:d,
      pasos:[paso('Mira la cifra siguiente',`${x}`,'Si es 5 o más, sube.'),final('Redondea',marca(fmt(v,d)),'Se quedan '+d+' decimales.')],errores:[[Math.trunc(x*10**d)/10**d,'Redondear no es cortar.']],comprobar:()=>Math.abs(v-x)<=0.5*10**-d+1e-12})}},
    b2:{prof:'basico',f:(n,r)=>{const [a,b]=r.elegir([[1,4],[3,4],[1,8],[3,8],[5,8],[1,5],[2,5],[7,20],[3,25],[1,2]]),v=a/b;return prob({enunciado:`Escribe ${a}/${b} como decimal.`,v,dec:4,
      pasos:[paso('Divide numerador entre denominador',`${a} ÷ ${b}`,'Una fracción es una división.'),final('Resultado',marca(fmt(v,4)),'Decimal exacto.')],errores:[[b/a,'Es numerador entre denominador.'],[a/10,'No basta con poner el punto.']],comprobar:()=>cerca(v*b,a)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(11,99)/10,b=r.entero(11,99)/(n>2?100:10),v=a*b;return prob({enunciado:`Calcula ${a} × ${b} sin calculadora.`,v,dec:4,
      pasos:[paso('Multiplica sin el punto',`${Math.round(a*10)} × ${Math.round(b*(n>2?100:10))} = ${Math.round(a*10)*Math.round(b*(n>2?100:10))}`,'Como enteros.'),final('Coloca el punto',`${n>2?3:2} decimales: ${marca(fmt(v,4))}`,'Suma los decimales de los factores.')],
      errores:[[Math.round(a*10)*Math.round(b*(n>2?100:10)),'Falta poner el punto decimal.'],[a+b,'Es multiplicación, no suma.']],comprobar:()=>cerca(v,Math.round(a*10)*Math.round(b*(n>2?100:10))/(n>2?1000:100))})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const [num,den,txt]=r.elegir([[1,3,'0.333…'],[2,3,'0.666…'],[1,6,'0.1666…'],[1,9,'0.111…'],[4,9,'0.444…'],[5,6,'0.8333…'],[7,9,'0.777…'],[1,11,'0.0909…']]);return prob({enunciado:`Escribe el decimal periódico ${txt} como fracción (puedes dar a/b).`,v:num/den,dec:5,
      pasos:[paso('Llama x al número y multiplica por 10 (o 100)',`10x − x quita la parte que se repite`,'Las colas periódicas se cancelan.'),final('Despeja y simplifica',marca(`${num}/${den}`),'Fracción.')],
      errores:[[Number(txt.replace('…','')),'Un periódico no es el decimal cortado.'],[den/num,'Fracción al revés.']],comprobar:()=>cerca(num/den,Number(txt.replace('…','').padEnd(12,txt.at(-2))),1e-4)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const items=[r.entero(10,90)+r.entero(0,99)/100,r.entero(10,90)+r.entero(0,99)/100,r.entero(10,90)+r.entero(0,99)/100],tot=+(items[0]+items[1]+items[2]).toFixed(2),pago=Math.ceil(tot/100)*100+(tot%100>50?0:0),v=+(pago-tot).toFixed(2);return prob({enunciado:`En la tienda compras artículos de $${items.join(', $')} y pagas con $${pago}. ¿Cuánto cambio recibes?`,v,dec:2,unidad:'pesos',
      pasos:[paso('Suma alineando el punto',`${items.join(' + ')} = ${tot}`,'Centavos con centavos.'),final('Resta del pago',`${pago} − ${tot} = ${marca(fmt(v))}`,'Cambio.')],errores:[[pago-Math.round(tot),'Los centavos también cuentan.'],[tot,'Ese es el total, no el cambio.']],comprobar:()=>cerca(v+tot,pago,1e-9)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const L=r.entero(10,60)+r.entero(0,9)/10,p=r.entero(20,26)+r.entero(0,99)/100,v=Math.round(L*p*100)/100;return prob({enunciado:`Cargas ${L} litros de gasolina a $${p} por litro. ¿Cuánto pagas (redondeado a centavos)?`,v,dec:2,unidad:'pesos',
      pasos:[paso('Multiplica',`${L} × ${p} = ${fmt(L*p,4)}`,'Litros por precio.'),final('Redondea a centavos',marca(fmt(v)),'2 decimales.')],errores:[[Math.trunc(L*p*100)/100,'Redondea, no cortes.'],[L+p,'Se multiplica.']],comprobar:()=>Math.abs(v-L*p)<=0.005+1e-9})}}
  }});

/* ---------- Razones y proporciones ---------- */
const razones=crearGen({titulo:'Razones y proporciones',niveles:NIV,
  explicacion:'Una razón compara dos cantidades (a : b o a/b). Una proporción iguala dos razones: a/b = c/d, y se resuelve con productos cruzados (a·d = b·c). Si dos cantidades son directamente proporcionales, crecen juntas; si son inversamente proporcionales, cuando una crece la otra baja y su producto es constante.',
  alternativa:'Una receta para 4 personas que pide 2 tazas de arroz: para 8 personas, el doble de todo (directa). Si 4 pintores tardan 6 días, 8 pintores tardan la mitad (inversa).',
  referencia:'Stewart, Precálculo 1.1 – Razones y proporciones',regla:'a/b = c/d ⇔ a·d = b·c. Directa: el cociente es constante; inversa: el producto es constante.',pista:'Productos cruzados.',
  tarjetas:[['Proporción directa','y/x es constante: si x se duplica, y también.'],['Proporción inversa','x·y es constante: si x se duplica, y se reduce a la mitad.'],['¿Cómo se resuelve a/b = x/d?','x = a·d/b (productos cruzados).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const k=r.entero(2,9),a=r.entero(1,9)*k,b=r.entero(1,9)*k,g=gcd(a,b);return prob({enunciado:`Simplifica la razón ${a} : ${b} (escríbela como fracción a/b).`,v:a/b,dec:5,
      pasos:[paso('Máximo común divisor',`mcd(${a}, ${b}) = ${g}`,'Divide ambos.'),final('Razón simplificada',marca(`${a/g}/${b/g}`),'Misma razón, números menores.')],errores:[[b/a,'El orden importa: primero '+a+'.'],[(a-g)/(b-g),'Se divide, no se resta.']],comprobar:()=>cerca((a/g)/(b/g),a/b)})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(2,12),b=r.entero(2,12),k=r.entero(2,9),v=b*k;return prob({enunciado:`Resuelve la proporción ${a}/${b} = ${a*k}/x.`,v,dec:2,
      pasos:[paso('Productos cruzados',`${a}·x = ${b}·${a*k}`,'a·d = b·c.'),final('Despeja',`x = ${marca(v)}`,'Divide entre '+a+'.')],errores:[[a*k*a/b,'Revisa qué se multiplica en cruz.'],[a*k+b-a,'No es suma.']],comprobar:()=>cerca(a/b,a*k/v)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const w=r.entero(2,8),d=r.entero(3,12)*2,w2=r.elegir([2,3,4,6].map(f=>w*f).concat([w*2])),v=w*d/w2;return prob({enunciado:`${w} pintores tardan ${d} días en pintar una casa. ¿Cuántos días tardarían ${w2} pintores (al mismo ritmo)?`,v,dec:2,unidad:'días',
      pasos:[paso('Es inversa: el producto es constante',`${w}·${d} = ${w*d} días-pintor`,'Más pintores, menos días.'),final('Divide',`${w*d} ÷ ${w2} = ${marca(fmt(v))}`,'Días.')],errores:[[d*w2/w,'Es inversa, no directa.'],[d,'Cambia el número de pintores.']],comprobar:()=>cerca(v*w2,w*d)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,7),b=r.entero(1,7)+a,T=(a+b)*r.entero(10,200),v=T*b/(a+b);return prob({enunciado:`Reparte $${T} en la razón ${a} : ${b}. ¿Cuánto le toca a la parte mayor?`,v,dec:2,unidad:'pesos',
      pasos:[paso('Partes totales',`${a} + ${b} = ${a+b}`,'Suma la razón.'),paso('Valor de cada parte',`${T} ÷ ${a+b} = ${T/(a+b)}`,'Una parte.'),final('Parte mayor',`${b} × ${T/(a+b)} = ${marca(fmt(v))}`,'Multiplica.')],errores:[[T*a/(a+b),'Esa es la parte menor.'],[T/2,'No es mitad y mitad.']],comprobar:()=>cerca(v+T*a/(a+b),T)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const k=r.elegir([10000,25000,50000,100000]),c=r.entero(2,30)/2,v=c*k/100000;return prob({enunciado:`En un mapa con escala 1:${k}, dos pueblos están a ${c} cm. ¿Cuántos kilómetros los separan en la realidad?`,v,dec:3,unidad:'km',
      pasos:[paso('Distancia real en cm',`${c} × ${k} = ${c*k} cm`,'1 cm del mapa = '+k+' cm reales.'),final('Pasa a km',`${c*k} ÷ 100 000 = ${marca(fmt(v,3))}`,'1 km = 100 000 cm.')],errores:[[c*k,'Faltó pasar de cm a km.'],[c*k/1000,'1 km son 100 000 cm.']],comprobar:()=>cerca(v*100000/k,c)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const p=r.elegir([4,6,8]),g=r.entero(2,9)*50,q=r.elegir([10,12,15,20]),v=g*q/p;return prob({enunciado:`Una receta para ${p} personas lleva ${g} g de harina. ¿Cuánta harina necesitas para ${q} personas?`,v,dec:2,unidad:'g',
      pasos:[paso('Es directa',`${g}/${p} = x/${q}`,'Más personas, más harina.'),final('Despeja',`x = ${g}·${q}/${p} = ${marca(fmt(v))}`,'Gramos.')],errores:[[g*p/q,'Es directa, no inversa.'],[g+q-p,'No se suma la diferencia.']],comprobar:()=>cerca(v/q,g/p)})}}
  }});

/* ---------- Ecuaciones con radicales y valor absoluto ---------- */
const radicales=crearGen({titulo:'Ecuaciones con radicales y valor absoluto',niveles:NIV,
  explicacion:'Para una ecuación con raíz, aísla la raíz y eleva al cuadrado ambos lados; al final COMPRUEBA, porque elevar al cuadrado puede crear soluciones falsas. Para |A| = c (c ≥ 0), resuelve A = c y A = −c; si c < 0 no hay solución.',
  alternativa:'El valor absoluto es una distancia: |x − 3| = 2 pregunta qué números están a 2 de distancia del 3: el 1 y el 5. Con raíces, elevar al cuadrado es como «quitar la máscara», pero a veces aparece un impostor: por eso se comprueba.',
  referencia:'Stewart, Precálculo 1.5 – Otros tipos de ecuaciones',regla:'|A| = c ⇔ A = c o A = −c (c ≥ 0). Con radicales: aísla, eleva al cuadrado y comprueba cada solución.',pista:'Aísla primero.',
  tarjetas:[['|A| = c (con c ≥ 0)','A = c o A = −c.'],['¿Por qué se comprueba al resolver con raíces?','Elevar al cuadrado puede introducir soluciones falsas (extrañas).'],['√x = −3','No tiene solución: una raíz cuadrada no es negativa.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-9,9),b=r.entero(1,9),v=a+b;return prob({enunciado:`Resuelve |x − (${a})| = ${b} y da la solución MAYOR.`,v,dec:0,
      pasos:[paso('Dos casos',`x − (${a}) = ${b}  o  x − (${a}) = −${b}`,'Distancia '+b+'.'),final('Soluciones',`x = ${a+b} o x = ${a-b}; la mayor: ${marca(v)}`,'Comprueba ambas.')],errores:[[a-b,'Esa es la menor.'],[b,'Falta sumar '+a+'.']],comprobar:()=>Math.abs(v-a)===b})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(2,15),v=a*a;return prob({enunciado:`Resuelve √x = ${a}.`,v,dec:0,
      pasos:[paso('Eleva al cuadrado',`x = ${a}²`,'Deshace la raíz.'),final('Calcula',marca(v),'Comprueba: √'+v+' = '+a+'.')],errores:[[2*a,'Elevar al cuadrado no es duplicar.'],[Math.sqrt(a),'Se eleva al cuadrado, no se saca raíz.']],comprobar:()=>Math.sqrt(v)===a})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,6),c=r.entero(2,9),x=r.entero(-5,15),b=c*c-a*x;return prob({enunciado:`Resuelve √(${a}x ${b<0?'−':'+'} ${Math.abs(b)}) = ${c}.`,v:x,dec:2,
      pasos:[paso('Eleva al cuadrado',`${a}x ${b<0?'−':'+'} ${Math.abs(b)} = ${c*c}`,'La raíz ya está aislada.'),paso('Despeja',`${a}x = ${c*c-b}`,'Lineal.'),final('Comprueba',`x = ${marca(x)}: √(${a*x+b}) = ${c} ✓`,'Verifica en la original.')],errores:[[(c-b)/a,'Primero eleva al cuadrado ambos lados.'],[(c*c+b)/a,'Revisa el signo al despejar.']],comprobar:()=>a*x+b>=0&&cerca(Math.sqrt(a*x+b),c)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(2,5),x1=r.entero(-8,8),c=a*r.entero(1,6),x2=x1-2*c/a,b=c-a*x1;return prob({enunciado:`Resuelve |${a}x ${b<0?'−':'+'} ${Math.abs(b)}| = ${c} y da la solución MENOR.`,v:Math.min(x1,x2),dec:2,
      pasos:[paso('Dos casos',`${a}x + ${b} = ${c}  o  ${a}x + ${b} = −${c}`,'|A| = c.'),paso('Resuelve cada uno',`x = ${fmt((c-b)/a)} o x = ${fmt((-c-b)/a)}`,'Lineales.'),final('La menor',marca(fmt(Math.min(x1,x2))),'Compara.')],errores:[[Math.max(x1,x2),'Esa es la mayor.'],[(c-b)/a===Math.min(x1,x2)?(-c+b)/a:(c+b)/a,'Revisa el signo de b.']],comprobar:()=>cerca(Math.abs(a*Math.min(x1,x2)+b),c)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const m=r.entero(50,200),t=r.entero(1,5);return prob({enunciado:`Una pieza debe medir ${m} mm con tolerancia ${t} mm: |x − ${m}| ≤ ${t}. ¿Cuál es la medida MÁXIMA aceptable?`,v:m+t,dec:0,unidad:'mm',
      pasos:[paso('Desigualdad doble',`−${t} ≤ x − ${m} ≤ ${t}`,'Distancia al valor nominal.'),final('Extremo superior',`x ≤ ${marca(m+t)}`,'Suma '+m+'.')],errores:[[m-t,'Esa es la mínima.'],[m,'Ese es el valor nominal.']],comprobar:()=>Math.abs(m+t-m)<=t})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const t=r.entero(1,6),g=9.8,v=g*t*t/2;return prob({enunciado:`Una piedra cae en t = √(2h/9.8) segundos desde una altura h. Si tarda ${t} s, ¿desde qué altura cayó? (2 decimales)`,v,dec:2,unidad:'m',
      pasos:[paso('Eleva al cuadrado',`${t}² = 2h/9.8`,'Quita la raíz.'),final('Despeja h',`h = 9.8·${t*t}/2 = ${marca(fmt(v))}`,'Metros.')],errores:[[9.8*t/2,'Hay que elevar t al cuadrado.'],[2*t*t/9.8,'Despeja h: multiplica por 9.8 y divide entre 2.']],comprobar:()=>cerca(Math.sqrt(2*v/9.8),t)})}}
  }});

/* ---------- Desigualdades cuadráticas y con valor absoluto ---------- */
const desigNL=crearGen({titulo:'Desigualdades cuadráticas y con valor absoluto',niveles:NIV,
  explicacion:'Para (x − p)(x − q) < 0 o > 0, encuentra las raíces p y q y revisa el signo en cada intervalo: un trinomio con a > 0 es negativo ENTRE sus raíces y positivo fuera. |x − a| < b significa a − b < x < a + b; |x − a| > b significa x < a − b o x > a + b.',
  alternativa:'Dibuja la parábola: si abre hacia arriba, está por debajo del eje entre sus raíces. Y |x − a| < b son los números a menos de b pasos del a.',
  referencia:'Stewart, Precálculo 1.8 – Desigualdades no lineales y con valor absoluto',regla:'Cuadrática con a > 0: negativa entre las raíces. |x − a| < b ⇔ a − b < x < a + b.',pista:'Raíces y tabla de signos.',
  tarjetas:[['x² − (p+q)x + pq < 0 con p < q','p < x < q (entre las raíces).'],['|x − a| < b','a − b < x < a + b.'],['|x − a| > b','x < a − b o x > a + b.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(2,12);return prob({enunciado:`Resuelve x² < ${a*a}. ¿Cuál es el extremo DERECHO del intervalo solución?`,v:a,dec:0,
      pasos:[paso('Raíces',`x² = ${a*a} → x = ±${a}`,'Puntos donde cambia el signo.'),final('Entre las raíces',`−${a} < x < ${marca(a)}`,'x² es menor entre ellas.')],errores:[[a*a,'Saca la raíz.'],[-a,'Ese es el extremo izquierdo.']],comprobar:()=>(a-0.01)**2<a*a&&(a+0.01)**2>a*a})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(-9,9),b=r.entero(1,8);return prob({enunciado:`Resuelve |x − (${a})| < ${b}. ¿Cuál es el extremo IZQUIERDO del intervalo?`,v:a-b,dec:0,
      pasos:[paso('Desigualdad doble',`−${b} < x − (${a}) < ${b}`,'Distancia menor que '+b+'.'),final('Suma '+a,`${marca(a-b)} < x < ${a+b}`,'Intervalo.')],errores:[[a+b,'Ese es el derecho.'],[-b,'Falta sumar '+a+'.']],comprobar:()=>Math.abs((a-b+0.001)-a)<b})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const p=r.entero(-6,4),q=p+r.entero(1,8);return prob({enunciado:`Resuelve x² ${-(p+q)<0?'−':'+'} ${Math.abs(p+q)}x ${p*q<0?'−':'+'} ${Math.abs(p*q)} < 0. ¿Cuánto mide el intervalo solución (derecho − izquierdo)?`,v:q-p,dec:0,
      pasos:[paso('Factoriza',`(x − (${p}))(x − ${q}) < 0`,'Raíces '+p+' y '+q+'.'),paso('Signo',`negativo entre ${p} y ${q}`,'a > 0: abre hacia arriba.'),final('Longitud',`${q} − (${p}) = ${marca(q-p)}`,'Intervalo ('+p+', '+q+').')],errores:[[p+q,'Se restan los extremos.'],[p*q,'Ese es el producto de las raíces.']],comprobar:()=>{const m=(p+q)/2;return (m-p)*(m-q)<0}})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,4),c=a*r.entero(1,5),x0=r.entero(-5,5),b=-a*x0;return prob({enunciado:`Resuelve |${a}x ${b<0?'−':'+'} ${Math.abs(b)}| ≥ ${c}. La solución es x ≤ m o x ≥ M. ¿Cuánto vale M?`,v:x0+c/a,dec:2,
      pasos:[paso('Dos casos',`${a}x + ${b} ≥ ${c}  o  ${a}x + ${b} ≤ −${c}`,'|A| ≥ c.'),final('Caso mayor',`x ≥ ${marca(fmt(x0+c/a))}`,'Despeja.')],errores:[[x0-c/a,'Ese es m (el otro extremo).'],[c/a,'Falta considerar b.']],comprobar:()=>cerca(Math.abs(a*(x0+c/a)+b),c)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const p=r.entero(5,20),q=p+r.entero(10,60);return prob({enunciado:`La ganancia de un taller al hacer x muebles es G(x) = −x² + ${p+q}x − ${p*q}. ¿Hasta cuántos muebles (máximo) hay ganancia positiva (G > 0)?`,v:q,dec:0,unidad:'muebles',
      pasos:[paso('Raíces',`−(x − ${p})(x − ${q}) > 0`,'Factoriza.'),final('Entre las raíces (abre hacia abajo)',`${p} < x < ${marca(q)}`,'Extremo superior.')],errores:[[p,'Ese es el mínimo para ganar.'],[(p+q)/2,'Ese es el de máxima ganancia.']],comprobar:()=>-((q-0.5)**2)+(p+q)*(q-0.5)-p*q>0})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const T=r.entero(18,24),d=r.entero(1,4);return prob({enunciado:`Un termostato mantiene la temperatura con |t − ${T}| ≤ ${d} °C. ¿Cuál es la temperatura MÍNIMA permitida?`,v:T-d,dec:0,unidad:'°C',
      pasos:[paso('Desigualdad doble',`${T} − ${d} ≤ t ≤ ${T} + ${d}`,'Distancia a la meta.'),final('Mínima',marca(T-d),'Extremo izquierdo.')],errores:[[T+d,'Esa es la máxima.'],[T,'Esa es la meta.']],comprobar:()=>Math.abs(T-d-T)<=d})}}
  }});

/* ---------- Gráficas y transformaciones ---------- */
const transformaciones=crearGen({titulo:'Gráficas y transformaciones',niveles:NIV,
  explicacion:'Si conoces la gráfica de f, puedes moverla: f(x − h) la corre h a la DERECHA, f(x) + k la sube k, a·f(x) la estira verticalmente (a > 1) o la refleja si a < 0, y f(−x) la refleja en el eje y. El vértice de a(x − h)² + k es (h, k).',
  alternativa:'Es como mover una calcomanía: dentro del paréntesis (x − h) mueves de lado (y al revés de como se ve: −h es derecha); fuera (+ k) mueves arriba o abajo.',
  referencia:'Stewart, Precálculo 2.6 – Transformaciones de funciones',regla:'f(x − h) + k: h a la derecha, k arriba; a·f(x) estira y, si a < 0, refleja.',pista:'Lo de adentro mueve en x; lo de afuera, en y.',
  tarjetas:[['f(x − h)','Desplaza la gráfica h unidades a la derecha.'],['f(x) + k','Desplaza la gráfica k unidades hacia arriba.'],['Vértice de a(x − h)² + k','(h, k).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const h=r.entero(-6,6),k=r.entero(-6,6);return prob({enunciado:`La parábola y = x² se mueve a y = (x ${h<0?'+':'−'} ${Math.abs(h)})² ${k<0?'−':'+'} ${Math.abs(k)}. ¿Cuál es la coordenada x de su vértice?`,v:h,dec:0,
      pasos:[paso('Forma a(x − h)² + k',`h = ${h}, k = ${k}`,'Lee h y k.'),final('Vértice',`(${marca(h)}, ${k})`,'x del vértice = h.')],errores:[[-h,'(x − h): el signo dentro se invierte.'],[k,'Esa es la coordenada y.']],comprobar:()=>(h-h)**2+k===k})}},
    b2:{prof:'basico',f:(n,r)=>{const k=r.entero(-9,9),a=r.entero(-5,5);return prob({enunciado:`Si f(x) = x² y g(x) = f(x) ${k<0?'−':'+'} ${Math.abs(k)}, ¿cuánto vale g(${a})?`,v:a*a+k,dec:0,
      pasos:[paso('Evalúa f',`f(${a}) = ${a*a}`,'Primero f.'),final('Suma '+k,`${a*a} ${k<0?'−':'+'} ${Math.abs(k)} = ${marca(a*a+k)}`,'Desplazamiento vertical.')],errores:[[(a+k)**2,'k se suma afuera, no adentro.'],[a*a,'Falta el desplazamiento.']],comprobar:()=>a*a+k===a*a+k})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.elegir([-3,-2,2,3]),h=r.entero(-4,4),k=r.entero(-5,5),x=r.entero(-5,5),v=a*(x-h)**2+k;return prob({enunciado:`g(x) = ${a}(x ${h<0?'+':'−'} ${Math.abs(h)})² ${k<0?'−':'+'} ${Math.abs(k)} es una transformación de x². Calcula g(${x}).`,v,dec:0,
      pasos:[paso('Desplazamiento horizontal',`(${x} − (${h}))² = ${(x-h)**2}`,'Adentro.'),paso('Estiramiento',`${a}·${(x-h)**2} = ${a*(x-h)**2}`,'Multiplica.'),final('Desplazamiento vertical',`+ (${k}) = ${marca(v)}`,'Afuera.')],errores:[[a*(x+h)**2+k,'(x − h): resta h.'],[(a*(x-h))**2+k,'a multiplica al cuadrado, no se eleva.']],comprobar:()=>v===a*(x-h)*(x-h)+k})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.elegir([-2,-1,2,3]),h=r.entero(-4,4),k=r.entero(-8,8),v=k;return prob({enunciado:`La gráfica de y = ${a}(x ${h<0?'+':'−'} ${Math.abs(h)})² ${k<0?'−':'+'} ${Math.abs(k)}, ¿qué valor ${a>0?'mínimo':'máximo'} alcanza?`,v,dec:0,
      pasos:[paso('Vértice',`(${h}, ${k})`,'Forma vértice.'),final(a>0?'Abre hacia arriba: mínimo':'Abre hacia abajo: máximo',marca(k),'y del vértice.')],errores:[[h,'Esa es la x del vértice.'],[a,'a da la apertura, no el valor.']],comprobar:()=>a*(h-h)**2+k===k})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(2,8),t=r.entero(0,10),f0=r.entero(10,25),v=f0+k;return prob({enunciado:`La temperatura de ayer siguió T(t); hoy cada hora estuvo ${k} °C más caliente: H(t) = T(t) + ${k}. Si T(${t}) = ${f0} °C, ¿cuánto marcó H(${t})?`,v,dec:0,unidad:'°C',
      pasos:[paso('Desplazamiento vertical','H(t) = T(t) + '+k,'Se suma afuera.'),final('Sustituye',`${f0} + ${k} = ${marca(v)}`,'°C.')],errores:[[f0,'Falta sumar '+k+'.'],[f0*k,'Es suma, no producto.']],comprobar:()=>v-k===f0})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const d=r.entero(1,6),x=r.entero(2,12),p=r.entero(10,50),v=p;return prob({enunciado:`Un tren sale ${d} h después que otro con el mismo horario: su posición es g(t) = f(t − ${d}). Si el primero estaba en el km ${p} en t = ${x}, ¿en qué km estará el segundo en t = ${x+d}?`,v,dec:0,unidad:'km',
      pasos:[paso('Desplazamiento horizontal',`g(${x+d}) = f(${x+d} − ${d}) = f(${x})`,'Va '+d+' h detrás.'),final('Mismo punto',marca(p),'km.')],errores:[[p+d,'El desplazamiento es en el tiempo, no en km.'],[p-d,'g(t) = f(t − d).']],comprobar:()=>x+d-d===x})}}
  }});

/* ---------- Composición e inversa ---------- */
const composicion=crearGen({titulo:'Composición e inversa',niveles:NIV,
  explicacion:'(f ∘ g)(x) = f(g(x)): primero aplicas g y al resultado le aplicas f. La inversa f⁻¹ deshace a f: si f(a) = b, entonces f⁻¹(b) = a. Para encontrarla, escribe y = f(x), despeja x y cambia los nombres.',
  alternativa:'Componer es como una línea de producción: primero una máquina (g) y luego otra (f). La inversa es la máquina que regresa el producto a como estaba.',
  referencia:'Stewart, Precálculo 2.7–2.8 – Combinación de funciones e inversas',regla:'(f ∘ g)(x) = f(g(x)); f⁻¹(b) = a ⇔ f(a) = b.',pista:'De adentro hacia afuera.',
  tarjetas:[['(f ∘ g)(x)','f(g(x)): primero g, después f.'],['¿Cómo se encuentra f⁻¹?','y = f(x), despeja x y cambia x por y.'],['f(f⁻¹(x))','x.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(2,5),b=r.entero(-5,5),c=r.entero(2,5),d=r.entero(-5,5),x=r.entero(-4,4),v=a*(c*x+d)+b;return prob({enunciado:`Si f(x) = ${a}x ${b<0?'−':'+'} ${Math.abs(b)} y g(x) = ${c}x ${d<0?'−':'+'} ${Math.abs(d)}, calcula (f ∘ g)(${x}).`,v,dec:0,
      pasos:[paso('Primero g',`g(${x}) = ${c*x+d}`,'Adentro.'),final('Luego f',`f(${c*x+d}) = ${marca(v)}`,'Afuera.')],errores:[[c*(a*x+b)+d,'Ese es (g ∘ f): el orden importa.'],[(a*x+b)*(c*x+d),'Componer no es multiplicar.']],comprobar:()=>v===a*(c*x+d)+b})}},
    b2:{prof:'basico',f:(n,r)=>{const m=r.entero(2,9),b=r.entero(-9,9),x=r.entero(-6,6),y=m*x+b;return prob({enunciado:`Si f(x) = ${m}x ${b<0?'−':'+'} ${Math.abs(b)}, ¿cuánto vale f⁻¹(${y})?`,v:x,dec:2,
      pasos:[paso('Plantea',`${m}x ${b<0?'−':'+'} ${Math.abs(b)} = ${y}`,'f⁻¹(y) es el x con f(x) = y.'),final('Despeja',`x = ${marca(x)}`,'Inversa.')],errores:[[m*y+b,'Ese es f('+y+'), no f⁻¹.'],[1/y,'f⁻¹ no es 1/f.']],comprobar:()=>m*x+b===y})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,3),b=r.entero(-4,4),x=r.entero(-3,3),c=r.entero(2,4),g=c*x-1,v=a*g*g+b;return prob({enunciado:`Si f(x) = ${a}x² ${b<0?'−':'+'} ${Math.abs(b)} y g(x) = ${c}x − 1, calcula (f ∘ g)(${x}).`,v,dec:0,
      pasos:[paso('g primero',`g(${x}) = ${g}`,'Adentro.'),final('f después',`${a}(${g})² ${b<0?'−':'+'} ${Math.abs(b)} = ${marca(v)}`,'Afuera.')],errores:[[c*(a*x*x+b)-1,'Ese es (g ∘ f).'],[a*c*x*x+b,'Sustituye g(x) completo y elévalo al cuadrado.']],comprobar:()=>v===a*(c*x-1)**2+b})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(2,6),b=r.entero(1,9),x=r.entero(1,9),y=(a*x+b)/(x);return prob({enunciado:`Si f(x) = (${a}x + ${b})/x, ¿cuánto vale f⁻¹(${fmt(y,4)})? (2 decimales)`,v:x,dec:2,
      pasos:[paso('Plantea',`(${a}x + ${b})/x = ${fmt(y,4)}`,'f(x) = y.'),paso('Despeja',`${a}x + ${b} = ${fmt(y,4)}x → x = ${b}/(${fmt(y,4)} − ${a})`,'Junta las x.'),final('Calcula',marca(fmt(x)),'f⁻¹.')],errores:[[(a*y+b)/y,'Ese es f(y).'],[b/(y+a),'Revisa el signo al juntar x.']],comprobar:()=>cerca((a*x+b)/x,y)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const F=r.entero(-4,40)*5+32,v=(F-32)*5/9;return prob({enunciado:`F(C) = (9/5)C + 32 convierte °C a °F. Usa la inversa para pasar ${F} °F a °C. (2 decimales)`,v,dec:2,unidad:'°C',
      pasos:[paso('Inversa',`C = (5/9)(F − 32)`,'Despeja C.'),final('Evalúa',`(5/9)(${F} − 32) = ${marca(fmt(v))}`,'°C.')],errores:[[F*5/9-32,'Primero resta 32.'],[9/5*F+32,'Esa es la ida, no la inversa.']],comprobar:()=>cerca(9/5*v+32,F)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const P=r.entero(2,40)*50,d=r.elegir([10,15,20]),v=P*(1-d/100)*1.16;return prob({enunciado:`Una tienda aplica primero un descuento del ${d} % (g) y luego el IVA del 16 % (f). ¿Cuánto pagas por un artículo de $${P}? (f ∘ g)`,v,dec:2,unidad:'pesos',
      pasos:[paso('g: descuento',`${P}·${1-d/100} = ${fmt(P*(1-d/100))}`,'Primero g.'),final('f: IVA',`${fmt(P*(1-d/100))}·1.16 = ${marca(fmt(v))}`,'Luego f.')],errores:[[P*(1.16-d/100),'Los porcentajes se aplican en cadena (multiplicando).'],[P*1.16,'Falta el descuento.']],comprobar:()=>cerca(v,P*1.16*(1-d/100))})}}
  }});

/* ---------- Funciones polinomiales ---------- */
const polinomiales=crearGen({titulo:'Funciones polinomiales',niveles:NIV,
  explicacion:'Un polinomio de grado n tiene a lo más n raíces reales. Teorema del residuo: el residuo de dividir P(x) entre (x − a) es P(a); si P(a) = 0, (x − a) es factor. El término de mayor grado decide el comportamiento en los extremos.',
  alternativa:'Para saber si 2 es raíz no hace falta dividir: sustituye x = 2. Si da 0, «encaja» como raíz y (x − 2) es factor.',
  referencia:'Stewart, Precálculo 3.1–3.4 – Funciones polinomiales y ceros',regla:'Residuo de P(x) ÷ (x − a) = P(a); P(a) = 0 ⇔ (x − a) es factor.',pista:'Sustituye x = a.',
  tarjetas:[['Teorema del residuo','El residuo de P(x) ÷ (x − a) es P(a).'],['Teorema del factor','(x − a) es factor de P(x) si y solo si P(a) = 0.'],['Número de raíces reales de un polinomio de grado n','A lo más n.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const g=r.entero(2,6),c=r.entero(2,9);return prob({enunciado:`¿Cuál es el grado de P(x) = ${c}x^${g} − ${r.entero(1,9)}x + ${r.entero(1,9)}?`,v:g,dec:0,
      pasos:[paso('Busca el exponente mayor',`${c}x^${g}`,'Término principal.'),final('Grado',marca(g),'Exponente mayor.')],errores:[[c,'Ese es el coeficiente principal.'],[g-1,'El grado es el exponente mayor.']],comprobar:()=>g>=2})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(1,4),b=r.entero(-5,5),c=r.entero(-9,9),x=r.entero(-3,3),v=a*x**3+b*x+c;return prob({enunciado:`Evalúa P(x) = ${a}x³ ${b<0?'−':'+'} ${Math.abs(b)}x ${c<0?'−':'+'} ${Math.abs(c)} en x = ${x}.`,v,dec:0,
      pasos:[paso('Sustituye',`${a}(${x})³ + (${b})(${x}) + (${c})`,'Cada x por '+x+'.'),final('Calcula',marca(v),'Valor.')],errores:[[a*x*3+b*x+c,'x³ no es 3x.'],[a*x**3+b+c,'Falta multiplicar b por x.']],comprobar:()=>v===a*x*x*x+b*x+c})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const c=[r.entero(1,3),r.entero(-5,5),r.entero(-5,5),r.entero(-9,9)],a=r.entero(-3,3),v=((c[0]*a+c[1])*a+c[2])*a+c[3];return prob({enunciado:`¿Cuál es el residuo de dividir P(x) = ${c[0]}x³ + (${c[1]})x² + (${c[2]})x + (${c[3]}) entre (x − (${a}))?`,v,dec:0,
      pasos:[paso('Teorema del residuo','Residuo = P('+a+')','No hace falta dividir.'),final('Evalúa (Horner)',marca(v),'Residuo.')],errores:[[c[3],'Ese es el término independiente.'],[((c[0]*-a+c[1])*-a+c[2])*-a+c[3],'Se evalúa en x = '+a+', no en −'+a+'.']],comprobar:()=>v===c[0]*a**3+c[1]*a*a+c[2]*a+c[3]})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(-4,4),b=r.entero(-4,4),c=r.entero(-5,5);return prob({enunciado:`P(x) = (x − (${a}))(x − (${b}))(x − k) tiene término independiente ${-a*b*c}. Si ${a} y ${b} son raíces, ¿cuánto vale la tercera raíz k?`,v:c,dec:0,
      pasos:[paso('Término independiente',`(−${a})(−${b})(−k) = −${a*b}k`,'Producto de las constantes.'),final('Despeja',`−${a*b}k = ${-a*b*c} → k = ${marca(c)}`,'Tercera raíz.')],errores:[[-c,'Revisa el signo.'],[a+b,'No es la suma de las otras.']],comprobar:()=>a*b===0||-a*b*c===-(a*b*c)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const L=r.entero(20,40),W=r.entero(15,30),x=r.entero(2,6),v=x*(L-2*x)*(W-2*x);return prob({enunciado:`De un cartón de ${L}×${W} cm se cortan cuadrados de lado x en las esquinas para hacer una caja: V(x) = x(${L} − 2x)(${W} − 2x). ¿Cuál es el volumen con x = ${x} cm?`,v,dec:0,unidad:'cm³',
      pasos:[paso('Dimensiones',`${L-2*x} × ${W-2*x} × ${x}`,'Largo, ancho, altura.'),final('Multiplica',marca(v),'cm³.')],errores:[[L*W*x,'Falta restar los cortes.'],[x*(L-x)*(W-x),'Se corta x de cada lado: 2x.']],comprobar:()=>v===x*(L-2*x)*(W-2*x)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const t=r.entero(1,6),v=-(t**3)+9*t*t+10;return prob({enunciado:`El número de visitas a un sitio (en miles) es V(t) = −t³ + 9t² + 10 durante una campaña (t en días). ¿Cuántas visitas hubo el día ${t}?`,v,dec:0,unidad:'miles',
      pasos:[paso('Sustituye',`−${t}³ + 9(${t})² + 10`,'Evalúa.'),final('Calcula',marca(v),'Miles de visitas.')],errores:[[(t**3)+9*t*t+10,'El primer término es negativo.'],[-t*3+9*t*t+10,'t³ no es 3t.']],comprobar:()=>v===-(t*t*t)+9*t*t+10})}}
  }});

/* ---------- Funciones racionales y asíntotas ---------- */
const racionales=crearGen({titulo:'Funciones racionales y asíntotas',niveles:NIV,
  explicacion:'Una función racional es un cociente de polinomios. Asíntota vertical: donde se anula el denominador (y no el numerador). Asíntota horizontal: si los grados son iguales, el cociente de coeficientes principales; si el numerador tiene menor grado, y = 0. Si un factor se cancela, hay un hueco, no una asíntota.',
  alternativa:'Cerca de donde el denominador vale 0, la función «se dispara». Muy lejos (x enorme), solo importan los términos de mayor grado.',
  referencia:'Stewart, Precálculo 3.6 – Funciones racionales',regla:'AV: denominador = 0 (sin cancelar). AH: grados iguales → cociente de coeficientes principales; grado de arriba menor → y = 0.',pista:'Denominador para las verticales; grados para la horizontal.',
  tarjetas:[['Asíntota vertical de una racional','Valores donde el denominador es 0 y el factor no se cancela.'],['Asíntota horizontal con grados iguales','y = cociente de los coeficientes principales.'],['Si (x − a) se cancela arriba y abajo…','hay un hueco en x = a, no una asíntota.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(1,9),c=r.entero(-8,8);let b=r.entero(-9,9);if(a*c+b===0)b+=1;return prob({enunciado:`¿Dónde está la asíntota vertical de f(x) = (${a}x ${b<0?'−':'+'} ${Math.abs(b)})/(x ${c<0?'+':'−'} ${Math.abs(c)})? (da el valor de x)`,v:c,dec:2,
      pasos:[paso('Denominador igual a 0',`x − (${c}) = 0`,'Ahí no está definida.'),final('Asíntota',`x = ${marca(c)}`,'El numerador no se anula ahí.')],errores:[[-c,'Revisa el signo: x − c = 0 → x = c.'],[a,'Esa es la horizontal.']],comprobar:()=>a*c+b!==0})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(1,9),c=r.entero(1,9),b=r.entero(-9,9),d=r.entero(-9,9),v=a/c;return prob({enunciado:`¿Cuál es la asíntota horizontal de f(x) = (${a}x ${b<0?'−':'+'} ${Math.abs(b)})/(${c}x ${d<0?'−':'+'} ${Math.abs(d)})? (da y)`,v,dec:4,
      pasos:[paso('Mismo grado',`grado 1 / grado 1`,'Compara grados.'),final('Cociente de coeficientes principales',`y = ${a}/${c} = ${marca(fmt(v,4))}`,'Asíntota.')],errores:[[b/d,'Se usan los coeficientes de x, no las constantes.'],[0,'Con grados iguales no es 0.']],comprobar:()=>cerca((a*1e9+b)/(c*1e9+d),v,1e-6)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(2,9);let a=r.entero(1,9);if(a===b)a=b===9?1:a+1;return prob({enunciado:`f(x) = (x + ${a})/(x² − ${b*b}) tiene dos asíntotas verticales. ¿Cuál es la positiva?`,v:b,dec:0,
      pasos:[paso('Factoriza el denominador',`(x − ${b})(x + ${b})`,'Diferencia de cuadrados.'),final('Valores',`x = ±${b}; la positiva: ${marca(b)}`,'No se cancelan con x + '+a+'.')],errores:[[b*b,'Saca la raíz.'],[-b,'Esa es la negativa.']],comprobar:()=>a!==b})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(-8,8)||3;return prob({enunciado:`f(x) = (x² − ${a*a})/(x − ${a}) tiene un hueco en x = ${a}. ¿Cuál es la coordenada y del hueco?`,v:2*a,dec:0,
      pasos:[paso('Factoriza y cancela',`(x − ${a})(x + ${a})/(x − ${a}) = x + ${a}`,'El factor se cancela.'),final('Evalúa la simplificada',`${a} + ${a} = ${marca(2*a)}`,'y del hueco.')],errores:[[0,'No es 0: simplifica primero.'],[a,'Evalúa x + '+a+' en x = '+a+'.']],comprobar:()=>cerca(((a+1e-7)**2-a*a)/1e-7,2*a,1e-4)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const F=r.entero(500,5000),c=r.entero(5,40);return prob({enunciado:`El costo promedio por pieza es A(x) = (${F} + ${c}x)/x. ¿Cuál es su asíntota horizontal (el costo al que se acerca con producción enorme)?`,v:c,dec:2,unidad:'pesos',
      pasos:[paso('Grados iguales',`(${c}x + ${F})/x`,'Coeficientes principales '+c+' y 1.'),final('Asíntota',`y = ${marca(c)}`,'Costo variable.')],errores:[[F,'El fijo se reparte entre muchas piezas.'],[F+c,'Divide entre x.']],comprobar:()=>cerca((F+c*1e9)/1e9,c,1e-5)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(2,20),b=r.entero(1,10);return prob({enunciado:`La concentración de un fármaco es C(t) = ${a}t/(t + ${b}) mg/L. ¿A qué valor se acerca con el tiempo (asíntota horizontal)?`,v:a,dec:2,unidad:'mg/L',
      pasos:[paso('Grados iguales',`${a}t / (t + ${b})`,'Coeficientes '+a+' y 1.'),final('Asíntota',`y = ${marca(a)}`,'Nivel estable.')],errores:[[b,'b es la constante del denominador.'],[a/b,'Usa los coeficientes de t.']],comprobar:()=>cerca(a*1e9/(1e9+b),a,1e-6)})}}
  }});

/* ---------- Funciones exponenciales ---------- */
const exponenciales=crearGen({titulo:'Funciones exponenciales',niveles:NIV,
  explicacion:'f(x) = a·bˣ crece si b > 1 y decrece si 0 < b < 1; a es el valor inicial (x = 0). Un crecimiento del r % por periodo es multiplicar por (1 + r); un decaimiento, por (1 − r). Si dos potencias de la misma base son iguales, sus exponentes son iguales.',
  alternativa:'Una noticia viral: cada persona se la pasa a 2 más, así que cada ronda se multiplica por 2 (1, 2, 4, 8…). Eso es exponencial: no suma, multiplica.',
  referencia:'Stewart, Precálculo 4.1–4.2 – Funciones exponenciales',regla:'a·bˣ: a = valor inicial, b = factor por periodo (1 ± r). bᵐ = bⁿ ⇒ m = n.',pista:'Factor por periodo.',
  tarjetas:[['En f(x) = a·bˣ, ¿qué es a?','El valor inicial, f(0).'],['Crecimiento del r % por periodo','Multiplicar por (1 + r) cada periodo.'],['Si 2ˣ = 2⁵…','x = 5 (misma base, mismos exponentes).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(1,9),b=r.elegir([2,3,5]),x=r.entero(0,4),v=a*b**x;return prob({enunciado:`Evalúa f(x) = ${a}·${b}ˣ en x = ${x}.`,v,dec:0,
      pasos:[paso('Potencia',`${b}^${x} = ${b**x}`,'Primero la potencia.'),final('Multiplica',`${a}·${b**x} = ${marca(v)}`,'Valor.')],errores:[[(a*b)**x,'a no se eleva.'],[a*b*x,'bˣ no es b·x.']],comprobar:()=>v===a*b**x})}},
    b2:{prof:'basico',f:(n,r)=>{const p=r.elegir([3,5,8,10,15,20]),dec=r.prob(.5),v=dec?1-p/100:1+p/100;return prob({enunciado:`Una cantidad ${dec?'disminuye':'aumenta'} ${p} % cada año. ¿Por qué factor se multiplica cada año?`,v,dec:4,
      pasos:[paso('Pasa a decimal',`${p} % = ${p/100}`,'Divide entre 100.'),final(dec?'1 − r':'1 + r',marca(fmt(v,4)),'Factor por periodo.')],errores:[[p/100,'Falta sumar o restar al 1.'],[dec?1+p/100:1-p/100,'Revisa si crece o decrece.']],comprobar:()=>cerca(v,1+(dec?-1:1)*p/100)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const b=r.elegir([2,3,5]),k=r.entero(2,6),a=r.entero(-3,3);return prob({enunciado:`Resuelve ${b}^(x ${a<0?'−':'+'} ${Math.abs(a)}) = ${b**k}.`,v:k-a,dec:0,
      pasos:[paso('Misma base',`${b**k} = ${b}^${k}`,'Escribe como potencia.'),final('Iguala exponentes',`x + (${a}) = ${k} → x = ${marca(k-a)}`,'Despeja.')],errores:[[k,'Falta despejar x.'],[b**k-a,'Iguala exponentes, no potencias.']],comprobar:()=>b**(k-a+a)===b**k})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const k=r.entero(1,5);return prob({enunciado:`Resuelve 4ˣ = 2^${2*k+2}.`,v:k+1,dec:0,
      pasos:[paso('Escribe 4 como 2²',`(2²)ˣ = 2^(2x)`,'Misma base.'),final('Iguala',`2x = ${2*k+2} → x = ${marca(k+1)}`,'Despeja.')],errores:[[2*k+2,'Falta dividir entre 2.'],[(2*k+2)/4,'4ˣ = 2^(2x).']],comprobar:()=>4**(k+1)===2**(2*k+2)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const V0=r.entero(15,60)*10000,p=r.elegir([10,12,15,20]),t=r.entero(2,6),v=V0*(1-p/100)**t;return prob({enunciado:`Un auto de $${V0} se deprecia ${p} % al año. ¿Cuánto valdrá en ${t} años? (2 decimales)`,v,dec:2,unidad:'pesos',
      pasos:[paso('Factor',`1 − ${p/100} = ${1-p/100}`,'Decaimiento.'),final('V = V₀·factor^t',`${V0}·${1-p/100}^${t} = ${marca(fmt(v))}`,'Valor.')],errores:[[V0*(1-p*t/100),'No es lineal: el porcentaje se aplica al valor que queda.'],[V0*(p/100)**t,'El factor es 1 − r.']],comprobar:()=>{let x=V0;for(let i=0;i<t;i++)x*=1-p/100;return cerca(x,v)}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const C0=r.entero(1,20)*10,T=r.elegir([2,5,8]),k=r.entero(1,4),v=C0/2**k;return prob({enunciado:`Un isótopo tiene vida media de ${T} horas. Si hay ${C0} mg, ¿cuánto queda después de ${k*T} horas? (2 decimales)`,v,dec:2,unidad:'mg',
      pasos:[paso('Número de vidas medias',`${k*T} ÷ ${T} = ${k}`,'Cada una divide entre 2.'),final('C = C₀·(1/2)^'+k,`${C0}/${2**k} = ${marca(fmt(v))}`,'mg.')],errores:[[C0/(2*k),'No se divide entre 2k: es 2 elevado a k.'],[C0-C0/2*k,'No es lineal.']],comprobar:()=>cerca(v*2**k,C0)})}}
  }});

/* ---------- Modelado con funciones ---------- */
const modelado=crearGen({titulo:'Modelado con funciones',niveles:NIV,
  explicacion:'Modelar es elegir la función que describe un fenómeno: lineal si cambia la misma CANTIDAD por periodo (y = mx + b), exponencial si cambia el mismo PORCENTAJE (y = a·bᵗ o y = a·e^{kt}). Con dos datos encuentras los parámetros y luego predices.',
  alternativa:'Si tu ahorro sube $100 cada mes, es lineal; si tu inversión sube 5 % cada año, es exponencial: crece cada vez más rápido.',
  referencia:'Stewart, Precálculo 4.6 – Modelado con funciones exponenciales y logarítmicas',regla:'Lineal: m = Δy/Δx. Exponencial continua: k = ln(factor)/tiempo; tiempo de duplicación = ln 2 / k.',pista:'¿Cambia una cantidad fija o un porcentaje fijo?',
  tarjetas:[['¿Cuándo usar un modelo lineal?','Cuando cambia la misma cantidad cada periodo.'],['¿Cuándo usar un modelo exponencial?','Cuando cambia el mismo porcentaje cada periodo.'],['Tiempo de duplicación en P = P₀e^{kt}','ln 2 / k.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const x1=r.entero(0,5),x2=x1+r.entero(1,6),m=r.entero(-9,9)||2,b=r.entero(-9,9),y1=m*x1+b,y2=m*x2+b;return prob({enunciado:`Un modelo lineal pasa por (${x1}, ${y1}) y (${x2}, ${y2}). ¿Cuál es su pendiente?`,v:m,dec:2,
      pasos:[paso('Δy / Δx',`(${y2} − ${y1})/(${x2} − ${x1})`,'Cambio por unidad.'),final('Pendiente',marca(m),'Tasa constante.')],errores:[[(x2-x1)/(y2-y1),'Es Δy/Δx.'],[y2-y1,'Divide entre Δx.']],comprobar:()=>cerca((y2-y1)/(x2-x1),m)})}},
    b2:{prof:'basico',f:(n,r)=>{const f=r.elegir([1.02,1.05,1.1,0.9,0.95,1.25]),v=(f-1)*100;return prob({enunciado:`Un modelo exponencial multiplica por ${f} cada año. ¿Qué porcentaje cambia por año? (negativo si disminuye)`,v,dec:2,unidad:'%',
      pasos:[paso('Factor − 1',`${f} − 1 = ${fmt(f-1,2)}`,'Lo que cambia.'),final('A porcentaje',marca(fmt(v))+' %','× 100.')],errores:[[f*100,'Resta 1 antes.'],[f,'Ese es el factor.']],comprobar:()=>cerca(1+v/100,f)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const T=r.entero(2,30),v=Math.log(2)/T;return prob({enunciado:`Una población P = P₀e^{kt} se duplica cada ${T} años. ¿Cuánto vale k? (4 decimales)`,v,dec:4,
      pasos:[paso('Duplicar',`e^{k·${T}} = 2`,'P = 2P₀.'),final('Despeja con ln',`k = ln 2 / ${T} = ${marca(fmt(v,4))}`,'Tasa continua.')],errores:[[2/T,'Usa ln 2, no 2.'],[Math.log(T)/2,'k = ln 2 / T.']],comprobar:()=>cerca(Math.exp(v*T),2)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const m=r.entero(2,9),b=r.entero(10,99),x=r.entero(1,20),v=m*x+b;return prob({enunciado:`Un modelo y = ${m}x + ${b} describe ventas (x en semanas). ¿Qué predice para la semana ${x}?`,v,dec:0,
      pasos:[paso('Sustituye',`${m}(${x}) + ${b}`,'Evalúa el modelo.'),final('Predicción',marca(v),'Ventas.')],errores:[[m*(x+b),'b no se multiplica por x.'],[m+x+b,'m multiplica a x.']],comprobar:()=>v===m*x+b})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const P0=r.entero(10,90)*1000,k=r.elegir([0.01,0.02,0.03]),t=r.entero(5,30),v=P0*Math.exp(k*t);return prob({enunciado:`Una ciudad de ${P0} habitantes crece según P = ${P0}e^{${k}t}. ¿Cuántos habitantes tendrá en ${t} años? (redondea a enteros)`,v:Math.round(v),dec:0,unidad:'hab.',
      pasos:[paso('Exponente',`${k}·${t} = ${fmt(k*t,3)}`,'kt.'),final('Evalúa',`${P0}·e^{${fmt(k*t,3)}} ≈ ${marca(Math.round(v))}`,'Habitantes.')],errores:[[P0*(1+k*t),'Eso es crecimiento lineal.'],[P0*k*t,'Falta la exponencial.']],tol:1,comprobar:()=>cerca(Math.log(v/P0)/t,k)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const Ta=r.entero(18,25),T0=r.entero(80,95),k=r.elegir([0.05,0.1]),t=r.entero(5,20),v=Ta+(T0-Ta)*Math.exp(-k*t);return prob({enunciado:`Un café a ${T0} °C se enfría en un cuarto a ${Ta} °C según T = ${Ta} + ${T0-Ta}e^{−${k}t}. ¿Qué temperatura tendrá a los ${t} minutos? (2 decimales)`,v,dec:2,unidad:'°C',
      pasos:[paso('Factor',`e^{−${fmt(k*t,2)}} = ${fmt(Math.exp(-k*t),4)}`,'Decaimiento de la diferencia.'),final('T',`${Ta} + ${T0-Ta}·${fmt(Math.exp(-k*t),4)} = ${marca(fmt(v))}`,'°C.')],errores:[[(T0-Ta)*Math.exp(-k*t),'Falta sumar la temperatura del cuarto.'],[T0*Math.exp(-k*t),'Lo que decae es la diferencia con el cuarto.']],comprobar:()=>cerca(Ta-Math.log((v-Ta)/(T0-Ta))/k*0+(v-Ta)/Math.exp(-k*t)+Ta-Ta,T0-Ta+Ta-Ta+0)||cerca((v-Ta)/(T0-Ta),Math.exp(-k*t))})}}
  }});

export default {'pre/decimales':decimales,'pre/razones':razones,'alg/radicales-absoluto':radicales,'alg/desigualdad-no-lineal':desigNL,
  'fun/transformaciones':transformaciones,'fun/composicion-inversa':composicion,'fun/polinomiales':polinomiales,'fun/racionales':racionales,'fun/exponenciales':exponenciales,'fun/modelado':modelado};
