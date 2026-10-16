/* Matemáticas — habilidades nuevas (2): trigonometría (radianes, gráficas, suma y ángulo doble, leyes de senos y cosenos)
   y álgebra lineal (rectas y planos, base y dimensión, rango, núcleo e imagen, diagonalización, Gram-Schmidt). */
import {prob,paso,final,marca,fmt,cerca,crearGen} from './extensiones/base.js';

const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
const rad=g=>g*Math.PI/180,gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const NOT=[30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
const dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0),norma=u=>Math.hypot(...u);

/* ---------- Ángulos y radianes ---------- */
const radianes=crearGen({titulo:'Ángulos y radianes',niveles:NIV,
  explicacion:'Un radián es el ángulo que abre un arco igual al radio. 180° = π rad, así que para pasar de grados a radianes multiplicas por π/180, y al revés por 180/π. Con θ en radianes: longitud de arco s = rθ y área del sector A = r²θ/2.',
  alternativa:'Imagina medir el borde de una pizza con un hilo del tamaño del radio: cada hilo que cabe es un radián. Media pizza son π hilos (unos 3.14).',
  referencia:'Stewart, Precálculo 6.1 – Medida de ángulos',regla:'180° = π rad. Con θ en radianes: s = rθ y A = r²θ/2.',pista:'Multiplica por π/180.',
  tarjetas:[['180° en radianes','π.'],['Longitud de arco','s = rθ (θ en radianes).'],['Área de un sector','A = r²θ/2 (θ en radianes).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const g=r.elegir(NOT),d=gcd(g,180);return prob({enunciado:`Pasa ${g}° a radianes. Escribe k tal que ${g}° = kπ (como fracción o decimal).`,v:g/180,dec:4,
      pasos:[paso('Multiplica por π/180',`${g}·π/180`,'180° = π.'),final('Simplifica',`${g/d}/${180/d} π → k = ${marca(`${g/d}/${180/d}`)}`,'Fracción de π.')],errores:[[180/g,'Es grados/180, no al revés.'],[g/360,'180° (no 360°) equivale a π.']],comprobar:()=>cerca(rad(g),Math.PI*g/180)})}},
    b2:{prof:'basico',f:(n,r)=>{const [p,q]=r.elegir([[1,6],[1,4],[1,3],[1,2],[2,3],[3,4],[5,6],[7,6],[5,4],[3,2],[5,3],[7,4],[11,6]]),v=p*180/q;return prob({enunciado:`Pasa ${p}π/${q} rad a grados.`,v,dec:2,unidad:'°',
      pasos:[paso('Multiplica por 180/π',`(${p}π/${q})·(180/π)`,'π se cancela.'),final('Calcula',`${p}·180/${q} = ${marca(fmt(v))}°`,'Grados.')],errores:[[p*360/q,'π equivale a 180°, no a 360°.'],[p/q,'Falta multiplicar por 180.']],comprobar:()=>cerca(rad(v),p*Math.PI/q)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const R=r.entero(2,20),g=r.elegir([30,45,60,90,120,150,270]),v=R*rad(g);return prob({enunciado:`Un arco de una circunferencia de radio ${R} cm subtiende ${g}°. ¿Cuánto mide el arco? (2 decimales)`,v,dec:2,unidad:'cm',
      pasos:[paso('Pasa a radianes',`${g}° = ${fmt(rad(g),4)} rad`,'s = rθ pide radianes.'),final('s = rθ',`${R}·${fmt(rad(g),4)} = ${marca(fmt(v))}`,'cm.')],errores:[[R*g,'θ debe estar en radianes.'],[R*R*rad(g)/2,'Esa es el área del sector.']],comprobar:()=>cerca(v,2*Math.PI*R*g/360)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const R=r.entero(2,15),g=r.elegir([30,45,60,90,120]),v=R*R*rad(g)/2;return prob({enunciado:`¿Cuál es el área de un sector circular de radio ${R} m y ángulo ${g}°? (2 decimales)`,v,dec:2,unidad:'m²',
      pasos:[paso('Radianes',`${g}° = ${fmt(rad(g),4)}`,'A = r²θ/2.'),final('Área',`${R}²·${fmt(rad(g),4)}/2 = ${marca(fmt(v))}`,'m².')],errores:[[R*rad(g),'Esa es la longitud de arco.'],[R*R*g/2,'θ en radianes.']],comprobar:()=>cerca(v,Math.PI*R*R*g/360)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const R=r.entero(25,40),k=r.entero(10,200),v=2*Math.PI*R*k/100;return prob({enunciado:`La rueda de una bicicleta tiene radio ${R} cm. ¿Cuántos metros avanzas si da ${k} vueltas? (2 decimales)`,v,dec:2,unidad:'m',
      pasos:[paso('Una vuelta = 2π rad',`arco = ${R}·2π = ${fmt(2*Math.PI*R,3)} cm`,'s = rθ.'),final(`${k} vueltas, en metros`,`${fmt(2*Math.PI*R,3)}·${k}/100 = ${marca(fmt(v))}`,'1 m = 100 cm.')],errores:[[R*k/100,'Cada vuelta avanza 2πr.'],[2*Math.PI*R*k,'Pasa de cm a m.']],comprobar:()=>cerca(v,Math.PI*2*R*k/100)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const rpm=r.elegir([30,60,90,120,300,600,1200]),v=rpm*2*Math.PI/60;return prob({enunciado:`Un ventilador gira a ${rpm} revoluciones por minuto. ¿Cuál es su velocidad angular en rad/s? (2 decimales)`,v,dec:2,unidad:'rad/s',
      pasos:[paso('Una revolución = 2π rad',`${rpm}·2π rad/min`,'Pasa vueltas a radianes.'),final('Pasa a segundos',`÷ 60 = ${marca(fmt(v))}`,'rad/s.')],errores:[[rpm/60,'Falta multiplicar por 2π.'],[rpm*2*Math.PI,'Divide entre 60.']],comprobar:()=>cerca(v*60/(2*Math.PI),rpm)})}}
  }});

/* ---------- Gráficas trigonométricas ---------- */
const graficas=crearGen({titulo:'Gráficas de funciones trigonométricas',niveles:NIV,
  explicacion:'En y = A·sen(Bx − C) + D: |A| es la amplitud (la mitad de la altura total), el periodo es 2π/B, el desfase es C/B (a la derecha si es positivo) y D sube o baja la gráfica (línea media). El máximo es D + |A| y el mínimo D − |A|.',
  alternativa:'Piensa en una ola: A es qué tan alta es, B qué tan seguido se repite (más B, ondas más juntas), C cuándo empieza y D el nivel del mar.',
  referencia:'Stewart, Precálculo 5.3–5.4 – Gráficas trigonométricas',regla:'y = A sen(Bx − C) + D: amplitud |A|, periodo 2π/B, desfase C/B, máximo D + |A|.',pista:'Lee cada parámetro.',
  tarjetas:[['Amplitud de y = A sen(Bx)','|A|.'],['Periodo de y = sen(Bx)','2π/B.'],['Máximo de A sen x + D','D + |A|.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const A=r.elegir([-5,-3,-2,2,3,4,6]),B=r.entero(1,4);return prob({enunciado:`¿Cuál es la amplitud de y = ${A}·sen(${B}x)?`,v:Math.abs(A),dec:2,
      pasos:[paso('Coeficiente de afuera',`A = ${A}`,'Altura de la onda.'),final('Valor absoluto',marca(Math.abs(A)),'La amplitud es positiva.')],errores:[[A,'La amplitud es |A|.'],[B,'B cambia el periodo, no la amplitud.']],comprobar:()=>Math.abs(A)>0})}},
    b2:{prof:'basico',f:(n,r)=>{const B=r.elegir([1,2,3,4,6]);return prob({enunciado:`El periodo de y = sen(${B}x) es kπ. ¿Cuánto vale k?`,v:2/B,dec:4,
      pasos:[paso('Periodo = 2π/B',`2π/${B}`,'Una vuelta completa de Bx.'),final('k',marca(fmt(2/B,4)),'Fracción de π.')],errores:[[2*B,'Es 2/B, no 2B.'],[1/B,'El periodo de sen x es 2π.']],comprobar:()=>cerca(Math.sin(B*(1+2*Math.PI/B)),Math.sin(B))})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const B=r.elegir([1,2,3,4]),C=r.elegir([1,2,3])*B,v=C/B;return prob({enunciado:`¿Cuál es el desfase (corrimiento horizontal) de y = sen(${B}x − ${C})? (da un número; positivo = a la derecha)`,v,dec:4,
      pasos:[paso('Factoriza B',`sen(${B}(x − ${C}/${B}))`,'Saca el factor de x.'),final('Desfase',marca(fmt(v,4)),'A la derecha.')],errores:[[C,'Divide entre B.'],[-v,'Bx − C se mueve a la derecha.']],comprobar:()=>cerca(Math.sin(B*v-C),0)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const A=r.entero(1,9),D=r.entero(-5,10);return prob({enunciado:`¿Cuál es el valor máximo de y = ${A}·cos(x) ${D<0?'−':'+'} ${Math.abs(D)}?`,v:A+D,dec:0,
      pasos:[paso('cos x vale como máximo 1',`${A}·1 ${D<0?'−':'+'} ${Math.abs(D)}`,'Máximo del coseno.'),final('Máximo',marca(A+D),'D + |A|.')],errores:[[D-A,'Ese es el mínimo.'],[A,'Falta sumar la línea media.']],comprobar:()=>A*Math.cos(0)+D===A+D})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const A=r.entero(1,4),D=r.entero(4,9);return prob({enunciado:`La altura de la marea es h(t) = ${D} + ${A}·sen(πt/6) metros. ¿Cuál es la marea más alta del día?`,v:A+D,dec:0,unidad:'m',
      pasos:[paso('sen vale como máximo 1',`${D} + ${A}·1`,'Pleamar.'),final('Máximo',marca(A+D),'m.')],errores:[[D-A,'Esa es la bajamar.'],[D,'Esa es la línea media.']],comprobar:()=>cerca(D+A*Math.sin(Math.PI*3/6),A+D)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const f=r.elegir([50,60,100,250,440,1000]),v=1000/f;return prob({enunciado:`Una señal y = sen(2π·${f}·t) tiene frecuencia ${f} Hz. ¿Cuál es su periodo en milisegundos? (2 decimales)`,v,dec:2,unidad:'ms',
      pasos:[paso('Periodo = 2π/B',`2π/(2π·${f}) = 1/${f} s`,'B = 2π·f.'),final('A milisegundos',`× 1000 = ${marca(fmt(v))}`,'ms.')],errores:[[f,'Esa es la frecuencia.'],[1/f,'Pasa de segundos a milisegundos.']],comprobar:()=>cerca(v*f,1000)})}}
  }});

/* ---------- Suma de ángulos y ángulo doble ---------- */
const sumaDoble=crearGen({titulo:'Suma de ángulos y ángulo doble',niveles:NIV,
  explicacion:'sen(a ± b) = sen a cos b ± cos a sen b; cos(a ± b) = cos a cos b ∓ sen a sen b. Ángulo doble: sen 2θ = 2 sen θ cos θ y cos 2θ = cos²θ − sen²θ = 1 − 2 sen²θ. Sirven para calcular valores exactos como sen 75° = sen(45° + 30°).',
  alternativa:'Si conoces sen y cos de 45° y de 30°, ya «armas» los de 75° y 15° con estas fórmulas, como piezas de Lego.',
  referencia:'Stewart, Precálculo 7.2–7.3 – Fórmulas de adición y de ángulo doble',regla:'sen(a + b) = sen a cos b + cos a sen b; sen 2θ = 2 sen θ cos θ; cos 2θ = 1 − 2sen²θ.',pista:'Descompón en ángulos notables.',
  tarjetas:[['sen(a + b)','sen a cos b + cos a sen b.'],['sen 2θ','2 sen θ cos θ.'],['cos 2θ','cos²θ − sen²θ = 1 − 2 sen²θ = 2 cos²θ − 1.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const [a,b,c]=r.elegir([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]),v=2*a*b/(c*c);return prob({enunciado:`Si sen θ = ${a}/${c} y cos θ = ${b}/${c}, ¿cuánto vale sen 2θ? (fracción o decimal)`,v,dec:4,
      pasos:[paso('Ángulo doble',`sen 2θ = 2·(${a}/${c})·(${b}/${c})`,'2 sen cos.'),final('Calcula',marca(`${2*a*b}/${c*c}`),'Resultado.')],errores:[[2*a/c,'Falta multiplicar por cos θ.'],[a*b/(c*c),'Falta el 2.']],comprobar:()=>cerca(Math.sin(2*Math.asin(a/c)),v)})}},
    b2:{prof:'basico',f:(n,r)=>{const [a,b,c]=r.elegir([[3,4,5],[5,12,13],[8,15,17]]),v=(b*b-a*a)/(c*c);return prob({enunciado:`Si sen θ = ${a}/${c} y cos θ = ${b}/${c}, ¿cuánto vale cos 2θ?`,v,dec:4,
      pasos:[paso('cos²θ − sen²θ',`${b*b}/${c*c} − ${a*a}/${c*c}`,'Ángulo doble.'),final('Resta',marca(`${b*b-a*a}/${c*c}`),'Resultado.')],errores:[[(a*a-b*b)/(c*c),'Es cos² − sen².'],[2*b/c,'cos 2θ no es 2 cos θ.']],comprobar:()=>cerca(Math.cos(2*Math.asin(a/c)),v)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const [a,b,op]=r.elegir([[45,30,'+'],[60,45,'+'],[45,30,'−'],[60,45,'−'],[90,30,'+'],[60,30,'+']]),ang=op==='+'?a+b:a-b,v=Math.sin(rad(ang));return prob({enunciado:`Calcula sen(${ang}°) usando sen(${a}° ${op} ${b}°). (4 decimales)`,v,dec:4,
      pasos:[paso('Fórmula de '+(op==='+'?'suma':'resta'),`sen ${a}° cos ${b}° ${op} cos ${a}° sen ${b}°`,'Ángulos notables.'),final('Sustituye valores exactos',marca(fmt(v,4)),'Resultado.')],errores:[[Math.sin(rad(a))+(op==='+'?1:-1)*Math.sin(rad(b)),'sen(a + b) no es sen a + sen b.'],[Math.cos(rad(ang)),'Ese es el coseno.']],comprobar:()=>cerca(Math.sin(rad(a))*Math.cos(rad(b))+(op==='+'?1:-1)*Math.cos(rad(a))*Math.sin(rad(b)),v)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const [a,b,op]=r.elegir([[45,30,'+'],[60,45,'−'],[45,30,'−'],[30,45,'+']]),ang=op==='+'?a+b:a-b,v=Math.cos(rad(ang));return prob({enunciado:`Calcula cos(${ang}°) usando cos(${a}° ${op} ${b}°). (4 decimales)`,v,dec:4,
      pasos:[paso('Fórmula',`cos ${a}° cos ${b}° ${op==='+'?'−':'+'} sen ${a}° sen ${b}°`,'Ojo: el signo se invierte en el coseno.'),final('Sustituye',marca(fmt(v,4)),'Resultado.')],errores:[[Math.cos(rad(a))*Math.cos(rad(b))+(op==='+'?1:-1)*Math.sin(rad(a))*Math.sin(rad(b)),'En cos(a ± b) el signo del medio es el contrario.'],[Math.cos(rad(a))+(op==='+'?1:-1)*Math.cos(rad(b)),'cos(a + b) no es cos a + cos b.']],comprobar:()=>cerca(Math.cos(rad(a))*Math.cos(rad(b))-(op==='+'?1:-1)*Math.sin(rad(a))*Math.sin(rad(b)),v)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const v0=r.entero(10,30),th=r.elegir([15,30,45,60,75]),v=v0*v0*Math.sin(rad(2*th))/9.8;return prob({enunciado:`Un balón sale a ${v0} m/s con ángulo ${th}°. Su alcance es R = v₀²·sen(2θ)/9.8. ¿Qué tan lejos llega? (2 decimales)`,v,dec:2,unidad:'m',
      pasos:[paso('Ángulo doble',`sen(${2*th}°) = ${fmt(Math.sin(rad(2*th)),4)}`,'2θ.'),final('Alcance',`${v0}²·${fmt(Math.sin(rad(2*th)),4)}/9.8 = ${marca(fmt(v))}`,'Metros.')],errores:[[v0*v0*Math.sin(rad(th))/9.8,'La fórmula usa sen(2θ).'],[v0*v0*2*Math.sin(rad(th))/9.8,'sen 2θ no es 2 sen θ.']],comprobar:()=>cerca(v,2*v0*v0*Math.sin(rad(th))*Math.cos(rad(th))/9.8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const L=r.entero(2,10),th=r.elegir([15,30,45,60]),v=L*L*Math.sin(rad(2*th))/2;return prob({enunciado:`Un toldo triangular tiene dos lados de ${L} m que forman un ángulo de ${2*th}° (2·${th}°). Su área es (1/2)L²·sen(2θ). ¿Cuánto mide? (2 decimales)`,v,dec:2,unidad:'m²',
      pasos:[paso('sen 2θ = 2 sen θ cos θ',`2·sen ${th}°·cos ${th}° = ${fmt(Math.sin(rad(2*th)),4)}`,'Ángulo doble.'),final('Área',`(1/2)·${L*L}·${fmt(Math.sin(rad(2*th)),4)} = ${marca(fmt(v))}`,'m².')],errores:[[L*L*Math.sin(rad(th))/2,'El ángulo entre los lados es 2θ.'],[L*L*Math.sin(rad(2*th)),'Falta el 1/2.']],comprobar:()=>cerca(v,L*L*Math.sin(rad(th))*Math.cos(rad(th)))})}}
  }});

/* ---------- Ley de senos y ley de cosenos ---------- */
const leyes=crearGen({titulo:'Ley de senos y ley de cosenos',niveles:NIV,
  explicacion:'Para cualquier triángulo: ley de senos a/sen A = b/sen B = c/sen C (úsala con dos ángulos y un lado, o dos lados y un ángulo opuesto); ley de cosenos c² = a² + b² − 2ab·cos C (úsala con dos lados y el ángulo entre ellos, o con los tres lados).',
  alternativa:'La ley de cosenos es Pitágoras con corrección: si el ángulo es de 90°, cos C = 0 y queda c² = a² + b².',
  referencia:'Stewart, Precálculo 6.5–6.6 – Leyes de senos y cosenos',regla:'a/sen A = b/sen B; c² = a² + b² − 2ab cos C.',pista:'¿Tienes el ángulo entre los dos lados? Cosenos.',
  tarjetas:[['Ley de senos','a/sen A = b/sen B = c/sen C.'],['Ley de cosenos','c² = a² + b² − 2ab cos C.'],['¿Cuándo usar la ley de cosenos?','Con dos lados y el ángulo entre ellos, o con los tres lados.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const A=r.entero(30,80),B=r.entero(30,80),b=r.entero(5,30),v=b*Math.sin(rad(A))/Math.sin(rad(B));return prob({enunciado:`En un triángulo, A = ${A}°, B = ${B}° y b = ${b}. Calcula a con la ley de senos. (2 decimales)`,v,dec:2,
      pasos:[paso('a/sen A = b/sen B',`a = ${b}·sen ${A}°/sen ${B}°`,'Despeja a.'),final('Calcula',marca(fmt(v)),'Lado a.')],errores:[[b*Math.sin(rad(B))/Math.sin(rad(A)),'Los senos van al revés.'],[b*A/B,'Se usan los senos de los ángulos.']],comprobar:()=>cerca(v/Math.sin(rad(A)),b/Math.sin(rad(B)))})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(3,20),b=r.entero(3,20),C=r.elegir([30,45,60,90,120]),v=Math.sqrt(a*a+b*b-2*a*b*Math.cos(rad(C)));return prob({enunciado:`Dos lados de un triángulo miden ${a} y ${b} y el ángulo entre ellos es ${C}°. ¿Cuánto mide el tercer lado? (2 decimales)`,v,dec:2,
      pasos:[paso('Ley de cosenos',`c² = ${a}² + ${b}² − 2·${a}·${b}·cos ${C}°`,'Dos lados y el ángulo entre ellos.'),final('Raíz',marca(fmt(v)),'Lado c.')],errores:[[Math.hypot(a,b),'Solo es Pitágoras si el ángulo es 90°.'],[a*a+b*b-2*a*b*Math.cos(rad(C)),'Falta sacar la raíz.']],comprobar:()=>cerca(v*v,a*a+b*b-2*a*b*Math.cos(rad(C)))})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(4,15),b=r.entero(4,15),c=r.entero(Math.abs(a-b)+1,a+b-1),v=Math.acos((a*a+b*b-c*c)/(2*a*b))*180/Math.PI;return prob({enunciado:`Un triángulo tiene lados a = ${a}, b = ${b} y c = ${c}. ¿Cuánto mide el ángulo C (opuesto a c)? (1 decimal)`,v,dec:1,unidad:'°',
      pasos:[paso('Despeja cos C',`cos C = (${a}² + ${b}² − ${c}²)/(2·${a}·${b}) = ${fmt((a*a+b*b-c*c)/(2*a*b),4)}`,'Ley de cosenos.'),final('arccos',marca(fmt(v,1))+'°','Ángulo.')],errores:[[(a*a+b*b-c*c)/(2*a*b),'Ese es el coseno, no el ángulo.'],[180-v,'Revisa el signo del coseno.']],comprobar:()=>cerca(c*c,a*a+b*b-2*a*b*Math.cos(rad(v)),1e-3)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const A=r.entero(25,70),a=r.entero(8,20),b=r.entero(3,a-1),v=Math.asin(b*Math.sin(rad(A))/a)*180/Math.PI;return prob({enunciado:`En un triángulo, A = ${A}°, a = ${a} y b = ${b}. Con la ley de senos, ¿cuánto mide B (agudo)? (1 decimal)`,v,dec:1,unidad:'°',
      pasos:[paso('sen B = b·sen A / a',`${b}·sen ${A}°/${a} = ${fmt(b*Math.sin(rad(A))/a,4)}`,'Ley de senos.'),final('arcsen',marca(fmt(v,1))+'°','Ángulo agudo.')],errores:[[b*Math.sin(rad(A))/a,'Ese es el seno, no el ángulo.'],[A*b/a,'Se usan senos, no ángulos.']],comprobar:()=>cerca(a/Math.sin(rad(A)),b/Math.sin(rad(v)),1e-3)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const d1=r.entero(5,30),d2=r.entero(5,30),C=r.elegir([40,60,75,90,110,130]),v=Math.sqrt(d1*d1+d2*d2-2*d1*d2*Math.cos(rad(C)));return prob({enunciado:`Dos barcos salen del mismo puerto: uno recorre ${d1} km y otro ${d2} km, en rumbos que forman ${C}°. ¿Qué distancia los separa? (2 decimales)`,v,dec:2,unidad:'km',
      pasos:[paso('Ley de cosenos',`d² = ${d1}² + ${d2}² − 2·${d1}·${d2}·cos ${C}°`,'Ángulo entre los rumbos.'),final('Raíz',marca(fmt(v)),'km.')],errores:[[Math.hypot(d1,d2),'Solo con 90° es Pitágoras.'],[d1+d2,'No van en sentidos opuestos.']],comprobar:()=>cerca(v*v,d1*d1+d2*d2-2*d1*d2*Math.cos(rad(C)))})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const base=r.entero(50,300),A=r.entero(40,70),B=r.entero(40,70),C=180-A-B,v=base*Math.sin(rad(B))/Math.sin(rad(C));return prob({enunciado:`Dos observadores separados ${base} m ven una antena con ángulos de ${A}° y ${B}° respecto a la línea que los une. ¿A qué distancia está la antena del primer observador? (2 decimales)`,v,dec:2,unidad:'m',
      pasos:[paso('Tercer ángulo',`C = 180° − ${A}° − ${B}° = ${C}°`,'Suma 180°.'),final('Ley de senos',`${base}·sen ${B}°/sen ${C}° = ${marca(fmt(v))}`,'Lado opuesto a B.')],errores:[[base*Math.sin(rad(A))/Math.sin(rad(C)),'Esa es la distancia al segundo observador.'],[base*Math.sin(rad(B)),'Falta dividir entre sen C.']],comprobar:()=>cerca(v/Math.sin(rad(B)),base/Math.sin(rad(C)))})}}
  }});

/* ---------- Rectas y planos en R³ ---------- */
const rectasPlanos=crearGen({titulo:'Rectas y planos en R³',niveles:NIV,
  explicacion:'Una recta en R³ es r(t) = P₀ + t·d (un punto y una dirección). Un plano con vector normal n = (a, b, c) que pasa por P₀ es a(x − x₀) + b(y − y₀) + c(z − z₀) = 0, o ax + by + cz = d con d = n·P₀. La distancia de un punto Q al plano es |a·x + b·y + c·z − d|/‖n‖.',
  alternativa:'La recta es la ruta de un dron: sale de un punto y avanza en una dirección. El plano es como una pared: lo define un punto de la pared y la dirección que apunta «hacia afuera» (la normal).',
  referencia:'Grossman, Álgebra lineal – Rectas y planos en el espacio',regla:'Recta: P₀ + t·d. Plano: n·(X − P₀) = 0 ⇒ ax + by + cz = n·P₀. Distancia: |n·Q − d|/‖n‖.',pista:'Identifica el punto y el vector.',
  tarjetas:[['Ecuación vectorial de una recta','r(t) = P₀ + t·d.'],['Ecuación de un plano con normal n que pasa por P₀','n·(X − P₀) = 0.'],['Distancia de Q al plano ax + by + cz = d','|aQx + bQy + cQz − d| / ‖(a, b, c)‖.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const P=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)],d=[r.entero(-3,3),r.entero(-3,3),r.entero(1,3)],t=r.entero(-3,4),v=P[2]+t*d[2];return prob({enunciado:`La recta r(t) = (${P.join(', ')}) + t(${d.join(', ')}). ¿Cuál es la coordenada z del punto con t = ${t}?`,v,dec:0,
      pasos:[paso('Componente z',`${P[2]} + ${t}·${d[2]}`,'z₀ + t·d_z.'),final('Calcula',marca(v),'z.')],errores:[[P[0]+t*d[0],'Esa es la x.'],[P[2]*t+d[2],'Es z₀ + t·d_z.']],comprobar:()=>v===P[2]+t*d[2]})}},
    b2:{prof:'basico',f:(n,r)=>{const nn=[r.entero(1,5),r.entero(-4,4),r.entero(1,5)],Q=[r.entero(-4,4),r.entero(-4,4),r.entero(-4,4)],d=r.entero(-10,10),v=dot(nn,Q)-d;return prob({enunciado:`Sustituye Q = (${Q.join(', ')}) en el plano ${nn[0]}x + (${nn[1]})y + ${nn[2]}z = ${d}: ¿cuánto vale ${nn[0]}x + (${nn[1]})y + ${nn[2]}z − ${d}? (0 significa que Q está en el plano)`,v,dec:0,
      pasos:[paso('Sustituye',`${nn[0]}(${Q[0]}) + (${nn[1]})(${Q[1]}) + ${nn[2]}(${Q[2]})`,'Evalúa.'),final('Resta d',`${dot(nn,Q)} − ${d} = ${marca(v)}`,v===0?'Está en el plano.':'No está en el plano.')],errores:[[dot(nn,Q),'Falta restar d.'],[dot(nn,Q)+d,'Se resta d.']],comprobar:()=>v===dot(nn,Q)-d})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const nn=[r.entero(1,6),r.entero(-5,5),r.entero(1,6)],P=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)],v=dot(nn,P);return prob({enunciado:`El plano con normal n = (${nn.join(', ')}) que pasa por P₀ = (${P.join(', ')}) es ${nn[0]}x + (${nn[1]})y + ${nn[2]}z = d. ¿Cuánto vale d?`,v,dec:0,
      pasos:[paso('d = n·P₀',`${nn[0]}(${P[0]}) + (${nn[1]})(${P[1]}) + ${nn[2]}(${P[2]})`,'El punto cumple la ecuación.'),final('Calcula',marca(v),'Ecuación del plano.')],errores:[[-v,'d = n·P₀ (sin signo menos).'],[nn[0]+nn[1]+nn[2],'Multiplica por las coordenadas del punto.']],comprobar:()=>v===dot(nn,P)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const [a,b,c,m]=r.elegir([[1,2,2,3],[2,1,2,3],[2,3,6,7],[1,4,8,9],[4,4,7,9]]),Q=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)],d=r.entero(-9,9),v=Math.abs(a*Q[0]+b*Q[1]+c*Q[2]-d)/m;return prob({enunciado:`¿Cuál es la distancia de Q = (${Q.join(', ')}) al plano ${a}x + ${b}y + ${c}z = ${d}? (2 decimales)`,v,dec:2,
      pasos:[paso('Numerador',`|${a}(${Q[0]}) + ${b}(${Q[1]}) + ${c}(${Q[2]}) − ${d}| = ${Math.abs(a*Q[0]+b*Q[1]+c*Q[2]-d)}`,'Evalúa y resta d.'),paso('Norma de n',`√(${a*a} + ${b*b} + ${c*c}) = ${m}`,'‖n‖.'),final('Divide',marca(fmt(v)),'Distancia.')],errores:[[Math.abs(a*Q[0]+b*Q[1]+c*Q[2]-d),'Falta dividir entre ‖n‖.'],[Math.abs(a*Q[0]+b*Q[1]+c*Q[2])/m,'Falta restar d.']],comprobar:()=>cerca(m*m,a*a+b*b+c*c)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const P=[r.entero(0,10),r.entero(0,10),0],d=[r.entero(1,4),r.entero(-3,3),r.entero(1,3)],t=r.entero(2,10),v=P[2]+d[2]*t;return prob({enunciado:`Un dron despega de (${P.join(', ')}) m y avanza con velocidad (${d.join(', ')}) m/s. ¿A qué altura está a los ${t} s?`,v,dec:0,unidad:'m',
      pasos:[paso('Posición',`r(${t}) = (${P.join(', ')}) + ${t}(${d.join(', ')})`,'P₀ + t·d.'),final('Altura (z)',`${P[2]} + ${t}·${d[2]} = ${marca(v)}`,'m.')],errores:[[P[0]+d[0]*t,'Esa es la x.'],[d[2],'Esa es la velocidad vertical.']],comprobar:()=>v===d[2]*t})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const h=r.entero(2,8),Q=[r.entero(0,6),r.entero(0,6),r.entero(0,h-1)];return prob({enunciado:`El techo de una bodega es el plano z = ${h} (m). Una lámpara está en (${Q.join(', ')}). ¿A qué distancia del techo está?`,v:h-Q[2],dec:0,unidad:'m',
      pasos:[paso('Plano 0x + 0y + 1z = '+h,`|${Q[2]} − ${h}|/1`,'Normal (0, 0, 1).'),final('Distancia',marca(h-Q[2]),'m.')],errores:[[Q[2],'Esa es la altura de la lámpara.'],[h,'Esa es la altura del techo.']],comprobar:()=>Math.abs(Q[2]-h)===h-Q[2]})}}
  }});

/* ---------- Base y dimensión ---------- */
const baseDim=crearGen({titulo:'Base y dimensión',niveles:NIV,
  explicacion:'Una base de un espacio es un conjunto de vectores linealmente independientes que lo generan. La dimensión es cuántos vectores tiene cualquier base: Rⁿ tiene dimensión n, un plano por el origen en R³ tiene 2 y una recta por el origen, 1. Para Ax = 0 con A de n columnas, la dimensión de las soluciones es n − rango(A).',
  alternativa:'La dimensión es el número de «direcciones independientes» en que te puedes mover: en una línea, 1; en una hoja, 2; en el espacio, 3.',
  referencia:'Lay 4.3 y 4.5 – Bases y dimensión',regla:'Base = independiente + generador. dim Rⁿ = n. dim{Ax = 0} = n − rango(A).',pista:'Cuenta direcciones independientes.',
  tarjetas:[['Base de un espacio vectorial','Vectores linealmente independientes que generan el espacio.'],['dim Rⁿ','n.'],['Dimensión del espacio solución de Ax = 0','número de columnas − rango(A).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const k=r.entero(2,8);return prob({enunciado:`¿Cuál es la dimensión de R^${k}?`,v:k,dec:0,
      pasos:[paso('Base canónica',`e₁, …, e${k}`,'Un vector por coordenada.'),final('Dimensión',marca(k),'Vectores de la base.')],errores:[[k-1,'Cuenta todas las coordenadas.'],[k*k,'No es k².']],comprobar:()=>k>0})}},
    b2:{prof:'basico',f:(n,r)=>{const [que,v]=r.elegir([['un plano que pasa por el origen en R³',2],['una recta que pasa por el origen en R³',1],['una recta que pasa por el origen en R²',1],['el espacio R³ completo',3]]);return prob({enunciado:`¿Cuál es la dimensión de ${que}?`,v,dec:0,
      pasos:[paso('Direcciones independientes',que,'¿En cuántas direcciones te puedes mover?'),final('Dimensión',marca(v),'Tamaño de una base.')],errores:[[3,'Ese es todo R³.'],[0,'Solo el punto {0} tiene dimensión 0.']].filter(([x])=>x!==v),comprobar:()=>v>=1})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const u=[r.entero(1,5),r.entero(-4,4)],par=r.prob(.5),k=r.entero(2,3),w=par?[u[0]*k,u[1]*k]:[r.entero(-4,4),r.entero(1,5)],det=u[0]*w[1]-u[1]*w[0],v=det===0?1:2;return prob({enunciado:`¿Cuál es la dimensión del espacio generado por (${u.join(', ')}) y (${w.join(', ')})?`,v,dec:0,
      pasos:[paso('Determinante',`${u[0]}·${w[1]} − (${u[1]})·${w[0]} = ${det}`,'¿Son independientes?'),final(det===0?'Son paralelos':'Son independientes',marca(v),det===0?'Generan una recta.':'Generan el plano.')],errores:[[det===0?2:1,det===0?'Uno es múltiplo del otro.':'No son paralelos.']],comprobar:()=>(det===0)===(v===1)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const cols=r.entero(3,6),rg=r.entero(1,cols-1),v=cols-rg;return prob({enunciado:`Una matriz A de ${cols} columnas tiene rango ${rg}. ¿Cuál es la dimensión del espacio de soluciones de Ax = 0?`,v,dec:0,
      pasos:[paso('Variables libres',`${cols} − ${rg}`,'Columnas sin pivote.'),final('Dimensión',marca(v),'Teorema del rango.')],errores:[[rg,'Ese es el rango.'],[cols,'Resta el rango.']],comprobar:()=>v+rg===cols})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const c=r.entero(3,6),dep=r.entero(1,c-1);return prob({enunciado:`Una estación mide ${c} variables, pero ${dep} de ellas se calculan exactamente a partir de las demás. ¿Cuántas mediciones independientes hay (dimensión del espacio de datos)?`,v:c-dep,dec:0,
      pasos:[paso('Quita las dependientes',`${c} − ${dep}`,'No aportan dirección nueva.'),final('Dimensión',marca(c-dep),'Independientes.')],errores:[[c,'Las calculadas no son independientes.'],[dep,'Esas son las dependientes.']],comprobar:()=>c-dep>0})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const v=3;return prob({enunciado:`Los colores de una pantalla se forman mezclando rojo, verde y azul (RGB). ¿Cuál es la dimensión del espacio de colores?`,v,dec:0,
      pasos:[paso('Base','rojo, verde, azul','Tres canales independientes.'),final('Dimensión',marca(3),'R³.')],errores:[[2,'Son tres canales.'],[256,'256 son los niveles de cada canal, no la dimensión.']],comprobar:()=>true})}}
  }});

/* ---------- Rango ---------- */
const rango=crearGen({titulo:'Rango y teorema de la dimensión',niveles:NIV,
  explicacion:'El rango de una matriz es el número de pivotes en su forma escalonada: cuántas filas (o columnas) son linealmente independientes. Teorema de la dimensión (rango–nulidad): rango(A) + nulidad(A) = número de columnas. Una matriz cuadrada n×n tiene rango n si y solo si su determinante no es 0.',
  alternativa:'El rango cuenta la «información nueva»: si una fila es suma de otras, no agrega nada y no cuenta.',
  referencia:'Lay 4.6 – Rango',regla:'rango = número de pivotes; rango + nulidad = columnas; det ≠ 0 ⇔ rango completo.',pista:'Escalona y cuenta pivotes.',
  tarjetas:[['Rango de una matriz','Número de pivotes de su forma escalonada.'],['Teorema rango–nulidad','rango(A) + nulidad(A) = número de columnas.'],['Matriz n×n con det ≠ 0','tiene rango n.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const d=[r.entero(0,1)*r.entero(1,9),r.entero(1,9),r.entero(0,1)*r.entero(1,9),r.entero(1,9)],v=d.filter(x=>x!==0).length;return prob({enunciado:`¿Cuál es el rango de la matriz diagonal con diagonal (${d.join(', ')})?`,v,dec:0,
      pasos:[paso('Cuenta entradas no nulas','Cada una es un pivote','Diagonal.'),final('Rango',marca(v),'Pivotes.')],errores:[[4,'Los ceros de la diagonal no son pivotes.'],[d.filter(x=>x===0).length,'Esos son los ceros.']].filter(([x])=>x!==v),comprobar:()=>v<=4})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(1,6),b=r.entero(-5,5),k=r.entero(2,4),dep=r.prob(.5),c=dep?a*k:r.entero(1,6),d=dep?b*k:r.entero(-5,5),det=a*d-b*c,v=det!==0?2:1;return prob({enunciado:`¿Cuál es el rango de [[${a}, ${b}], [${c}, ${d}]]?`,v,dec:0,
      pasos:[paso('Determinante',`${a}·${d} − ${b}·${c} = ${det}`,'2×2.'),final(det!==0?'det ≠ 0':'det = 0',marca(v),det!==0?'Rango completo.':'Las filas son proporcionales.')],errores:[[det!==0?1:2,'Revisa el determinante.']],comprobar:()=>(det===0)===(v===1)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const z=r.entero(0,2),diag=[r.entero(1,5),r.entero(1,5),r.entero(1,5)].map((x,i)=>i<z?x:x),zeros=r.barajar([0,1,2]).slice(0,z);zeros.forEach(i=>diag[i]=0);const v=3-z;return prob({enunciado:`Una matriz triangular superior 3×3 tiene diagonal (${diag.join(', ')}) (y el resto arbitrario). Suponiendo que cada cero de la diagonal no deja pivote en su columna, ¿cuál es su rango?`,v,dec:0,
      pasos:[paso('Pivotes en la diagonal',`no nulos: ${diag.filter(x=>x).length}`,'Ya está escalonada.'),final('Rango',marca(v),'Número de pivotes.')],errores:[[3,'Las columnas con 0 en la diagonal no aportan pivote (según el enunciado).'],[z,'Esos son los ceros.']].filter(([x])=>x!==v),comprobar:()=>v===diag.filter(x=>x).length})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const c=r.entero(3,7),rg=r.entero(1,c);return prob({enunciado:`A tiene ${c} columnas y rango ${rg}. ¿Cuál es su nulidad (dimensión del núcleo)?`,v:c-rg,dec:0,
      pasos:[paso('Rango + nulidad = columnas',`${rg} + nulidad = ${c}`,'Teorema de la dimensión.'),final('Despeja',marca(c-rg),'Nulidad.')],errores:[[rg,'Ese es el rango.'],[c+rg,'Se restan.']],comprobar:()=>c-rg+rg===c})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(3,6),rep=r.entero(1,k-1);return prob({enunciado:`Una encuesta tiene ${k} preguntas, pero las respuestas de ${rep} se obtienen sumando otras. La matriz de respuestas tiene ${k} columnas. ¿Cuál es su rango como máximo?`,v:k-rep,dec:0,
      pasos:[paso('Columnas dependientes',`${rep}`,'No suman información.'),final('Rango máximo',`${k} − ${rep} = ${marca(k-rep)}`,'Independientes.')],errores:[[k,'Las columnas que son sumas no cuentan.'],[rep,'Esas son las dependientes.']],comprobar:()=>k-rep>0})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(1,5),b=r.entero(1,5),det=a*4-2*b;return prob({enunciado:`Un circuito se describe con la matriz [[${a}, 2], [${b}, 4]]. ¿Cuánto vale su determinante? (si es 0, el sistema no tiene solución única)`,v:det,dec:0,
      pasos:[paso('ad − bc',`${a}·4 − 2·${b}`,'2×2.'),final('Determinante',marca(det),det===0?'Rango 1: no hay solución única.':'Rango 2: solución única.')],errores:[[a*4+2*b,'Es ad − bc.'],[a+4,'Eso es la traza.']],comprobar:()=>det===a*4-2*b})}}
  }});

/* ---------- Núcleo e imagen ---------- */
const nucleo=crearGen({titulo:'Núcleo e imagen',niveles:NIV,
  explicacion:'El núcleo (espacio nulo) de A son los vectores x con Ax = 0; la imagen (espacio columna) son todos los Ax posibles. dim(imagen) = rango(A) y dim(núcleo) = columnas − rango. Un vector está en el núcleo si al multiplicarlo por A da el vector cero.',
  alternativa:'El núcleo es lo que la transformación «aplasta» hasta el origen; la imagen es todo lo que puede producir.',
  referencia:'Lay 4.2 – Espacios nulos y columna',regla:'v ∈ Nul A ⇔ Av = 0. dim Col A = rango; dim Nul A = n − rango.',pista:'Multiplica A por el vector.',
  tarjetas:[['Núcleo de A','{x : Ax = 0}.'],['Imagen (espacio columna) de A','Todas las combinaciones de las columnas: {Ax}.'],['dim núcleo + dim imagen','número de columnas de A.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const A=[[r.entero(-3,3),r.entero(-3,3)],[r.entero(-3,3),r.entero(-3,3)]],x=[r.entero(-3,3),r.entero(-3,3)],v=A[0][0]*x[0]+A[0][1]*x[1];return prob({enunciado:`Con A = [[${A[0].join(', ')}], [${A[1].join(', ')}]] y v = (${x.join(', ')}), ¿cuál es la primera componente de Av? (si Av = 0, v está en el núcleo)`,v,dec:0,
      pasos:[paso('Fila 1 por v',`${A[0][0]}·${x[0]} + ${A[0][1]}·${x[1]}`,'Producto.'),final('Componente',marca(v),'Primera entrada de Av.')],errores:[[A[1][0]*x[0]+A[1][1]*x[1],'Esa es la segunda componente.'],[A[0][0]*x[0]+A[1][0]*x[1],'Usa la fila, no la columna.']],comprobar:()=>v===A[0][0]*x[0]+A[0][1]*x[1]})}},
    b2:{prof:'basico',f:(n,r)=>{const rg=r.entero(1,4);return prob({enunciado:`Si A tiene rango ${rg}, ¿cuál es la dimensión de su imagen (espacio columna)?`,v:rg,dec:0,
      pasos:[paso('dim imagen = rango','Columnas pivote','Definición.'),final('Dimensión',marca(rg),'Imagen.')],errores:[[rg+1,'Es exactamente el rango.'],[0,'Solo la matriz cero tiene rango 0.']],comprobar:()=>rg>0})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const c=r.entero(2,6),rg=r.entero(1,c);return prob({enunciado:`Una transformación T: R^${c} → R^m tiene matriz de rango ${rg}. ¿Cuál es la dimensión de su núcleo?`,v:c-rg,dec:0,
      pasos:[paso('Rango + nulidad = '+c,`nulidad = ${c} − ${rg}`,'Teorema de la dimensión.'),final('Dimensión',marca(c-rg),'Núcleo.')],errores:[[rg,'Ese es el de la imagen.'],[c,'Resta el rango.']],comprobar:()=>c-rg>=0})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,6),b=r.entero(1,6),v=-a/b;return prob({enunciado:`A = [[${a}, ${b}], [${2*a}, ${2*b}]]. ¿Para qué k el vector (1, k) está en el núcleo? (2 decimales)`,v,dec:2,
      pasos:[paso('Av = 0 (basta la fila 1)',`${a}·1 + ${b}k = 0`,'La fila 2 es el doble.'),final('Despeja',`k = −${a}/${b} = ${marca(fmt(v))}`,'Vector del núcleo.')],errores:[[a/b,'Revisa el signo.'],[-b/a,'Despeja k: −a/b.']],comprobar:()=>cerca(a+b*v,0)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const p=r.entero(2,9),q=r.entero(2,9);return prob({enunciado:`Un almacén registra entradas y salidas con A = [[1, −1]] (entra x, sale y). ¿Qué salida y deja el inventario igual si entran ${p*q} piezas? (vector (${p*q}, y) en el núcleo)`,v:p*q,dec:0,unidad:'piezas',
      pasos:[paso('Ax = 0',`${p*q} − y = 0`,'Sin cambio neto.'),final('Despeja',marca(p*q),'Salida.')],errores:[[0,'Entonces el inventario sube.'],[-p*q,'Revisa el signo.']],comprobar:()=>p*q-p*q===0})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const c=r.entero(3,5);return prob({enunciado:`Un filtro de imagen manda cada color (R, G, B) a su brillo: T(R, G, B) = R + G + B (un número). ¿Cuál es la dimensión del núcleo (colores que dan brillo 0, como (1, −1, 0))?`,v:2,dec:0,
      pasos:[paso('Rango de [[1, 1, 1]]','1','Una fila no nula.'),final('Núcleo',`3 − 1 = ${marca(2)}`,'Teorema de la dimensión.')],errores:[[1,'Ese es el rango.'],[3,'Resta el rango.']],comprobar:()=>c>=3})}}
  }});

/* ---------- Diagonalización ---------- */
const diagonal=crearGen({titulo:'Diagonalización',niveles:NIV,
  explicacion:'Si A tiene n vectores propios independientes, A = PDP⁻¹ con D diagonal (los valores propios) y P con los vectores propios en columnas. Entonces Aᵏ = PDᵏP⁻¹ y Dᵏ solo eleva la diagonal: sirve para calcular potencias rápido. Una matriz n×n con n valores propios distintos siempre es diagonalizable.',
  alternativa:'Diagonalizar es cambiar a unos «ejes naturales» donde la matriz solo estira: ahí multiplicarla muchas veces es fácil (cada eje se estira λᵏ).',
  referencia:'Lay 5.3 – Diagonalización',regla:'A = PDP⁻¹ ⇒ Aᵏ = PDᵏP⁻¹; traza(Aᵏ) = Σλᵢᵏ; det(Aᵏ) = (Πλᵢ)ᵏ.',pista:'Trabaja con los valores propios.',
  tarjetas:[['A = PDP⁻¹','D: valores propios en la diagonal; P: vectores propios en columnas.'],['Aᵏ si A = PDP⁻¹','PDᵏP⁻¹.'],['Condición suficiente para diagonalizar una n×n','Tener n valores propios distintos.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const l=r.entero(-3,4)||2,k=r.entero(2,5),v=l**k;return prob({enunciado:`D es diagonal con un ${l} en la posición (1, 1). ¿Qué entrada hay en (1, 1) de D^${k}?`,v,dec:0,
      pasos:[paso('Potencia de una diagonal','Se elevan las entradas de la diagonal','Sin mezclar.'),final('Calcula',`${l}^${k} = ${marca(v)}`,'Entrada.')],errores:[[l*k,'Es una potencia, no un producto por k.'],[l,'Falta elevar.']],comprobar:()=>v===l**k})}},
    b2:{prof:'basico',f:(n,r)=>{const d=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)];return prob({enunciado:`Una matriz triangular tiene diagonal (${d.join(', ')}). ¿Cuál es su valor propio MAYOR?`,v:Math.max(...d),dec:0,
      pasos:[paso('Triangular','Los valores propios son la diagonal','det(A − λI) es el producto de la diagonal.'),final('Mayor',marca(Math.max(...d)),'Valor propio.')],errores:[[Math.min(...d),'Ese es el menor.'],[d[0]+d[1]+d[2],'Esa es la traza.']].filter(([x])=>x!==Math.max(...d)),comprobar:()=>true})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const l1=r.entero(-3,3)||2,l2=r.entero(-3,3)||-1,k=r.entero(2,4),v=l1**k+l2**k;return prob({enunciado:`A es diagonalizable con valores propios ${l1} y ${l2}. ¿Cuánto vale la traza de A^${k}?`,v,dec:0,
      pasos:[paso('Valores propios de A^'+k,`${l1}^${k} y ${l2}^${k}`,'Dᵏ.'),final('Traza = suma',`${l1**k} + ${l2**k} = ${marca(v)}`,'La traza no cambia con P.')],errores:[[(l1+l2)**k,'Se elevan por separado.'],[(l1+l2)*k,'No es la traza por k.']],comprobar:()=>v===l1**k+l2**k})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const l1=r.entero(-3,3)||2,l2=r.entero(-3,3)||3,k=r.entero(2,4),v=(l1*l2)**k;return prob({enunciado:`A tiene valores propios ${l1} y ${l2}. ¿Cuánto vale det(A^${k})?`,v,dec:0,
      pasos:[paso('det A = producto',`${l1}·${l2} = ${l1*l2}`,'Producto de valores propios.'),final('det(Aᵏ) = (det A)ᵏ',`${l1*l2}^${k} = ${marca(v)}`,'Potencia.')],errores:[[l1*l2*k,'Es potencia, no producto por k.'],[l1**k+l2**k,'Esa es la traza de Aᵏ.']],comprobar:()=>v===(l1**k)*(l2**k)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const lam=r.elegir([1.1,1.2,1.5,2]),P0=r.entero(1,9)*100,k=r.entero(2,6),v=P0*lam**k;return prob({enunciado:`Una población de insectos se describe con una matriz cuyo valor propio dominante es ${lam}. Si a largo plazo crece como P₀·λᵏ con P₀ = ${P0}, ¿cuántos habrá aproximadamente en ${k} generaciones? (2 decimales)`,v,dec:2,
      pasos:[paso('Potencia del valor propio',`${lam}^${k} = ${fmt(lam**k,4)}`,'Dᵏ.'),final('Multiplica',`${P0}·${fmt(lam**k,4)} = ${marca(fmt(v))}`,'Población.')],errores:[[P0*lam*k,'Es λ elevado a k.'],[P0+lam*k,'Es multiplicativo.']],comprobar:()=>{let x=P0;for(let i=0;i<k;i++)x*=lam;return cerca(x,v)}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const l2=r.elegir([0.5,0.2,0.8]),k=r.entero(3,10),v=l2**k;return prob({enunciado:`Una cadena de Markov tiene valores propios 1 y ${l2}. La parte que desaparece decae como ${l2}^k. ¿Cuánto vale después de ${k} pasos? (4 decimales)`,v,dec:4,
      pasos:[paso('Potencia',`${l2}^${k}`,'Dᵏ.'),final('Calcula',marca(fmt(v,4)),'Se acerca a 0: el sistema llega al estado estable.')],errores:[[l2*k,'Es una potencia.'],[1,'Ese es el valor propio del estado estable.']],comprobar:()=>cerca(v,Math.pow(l2,k))})}}
  }});

/* ---------- Ortogonalidad y Gram-Schmidt ---------- */
const gram=crearGen({titulo:'Ortogonalidad y Gram-Schmidt',niveles:NIV,
  explicacion:'Dos vectores son ortogonales si su producto punto es 0. La proyección de u sobre v es proy_v u = (u·v / v·v)·v. Gram-Schmidt convierte una base en una base ortogonal: w₁ = v₁ y w₂ = v₂ − proy_{w₁} v₂ (le quitas a v₂ su parte en la dirección de w₁).',
  alternativa:'La proyección es la «sombra» de u sobre la línea de v con el sol cayendo en perpendicular. Gram-Schmidt quita esa sombra para quedarse con la parte perpendicular.',
  referencia:'Lay 6.2 y 6.4 – Conjuntos ortogonales y proceso de Gram-Schmidt',regla:'proy_v u = (u·v / v·v) v; w₂ = v₂ − proy_{w₁} v₂.',pista:'Calcula primero u·v y v·v.',
  tarjetas:[['Vectores ortogonales','Su producto punto es 0.'],['Proyección de u sobre v','(u·v / v·v)·v.'],['Gram-Schmidt (paso 2)','w₂ = v₂ − proy_{w₁}(v₂).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const u=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)],v=[r.entero(-5,5),r.entero(-5,5),r.entero(-5,5)],d=dot(u,v);return prob({enunciado:`Calcula u·v para u = (${u.join(', ')}) y v = (${v.join(', ')}). (Si da 0, son ortogonales.)`,v:d,dec:0,
      pasos:[paso('Producto punto',u.map((x,i)=>`${x}·${v[i]}`).join(' + '),'Suma de productos.'),final('Resultado',marca(d),d===0?'Ortogonales.':'No son ortogonales.')],errores:[[u.reduce((a,b)=>a+b)*v.reduce((a,b)=>a+b),'No se multiplican las sumas.'],[u[0]*v[0],'Faltan componentes.']],comprobar:()=>d===dot(u,v)})}},
    b2:{prof:'basico',f:(n,r)=>{const [v,m]=r.elegir([[[3,4],5],[[6,8],10],[[5,12],13],[[8,15],17]]),u=[r.entero(-5,9),r.entero(-5,9)],val=dot(u,v)/m;return prob({enunciado:`¿Cuál es la proyección escalar de u = (${u.join(', ')}) sobre v = (${v.join(', ')})? (u·v/‖v‖, 2 decimales)`,v:val,dec:2,
      pasos:[paso('u·v',`${dot(u,v)}`,'Producto punto.'),final('Divide entre ‖v‖ = '+m,marca(fmt(val)),'Proyección escalar.')],errores:[[dot(u,v),'Falta dividir entre ‖v‖.'],[dot(u,v)/(m*m),'La escalar se divide entre ‖v‖, no ‖v‖².']],comprobar:()=>cerca(val*m,dot(u,v))})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const v=[r.entero(1,4),r.entero(-3,3)],u=[r.entero(-5,5),r.entero(-5,5)],c=dot(u,v)/dot(v,v),val=c*v[0];return prob({enunciado:`Calcula la componente x de proy_v u, con u = (${u.join(', ')}) y v = (${v.join(', ')}). (2 decimales)`,v:val,dec:2,
      pasos:[paso('Coeficiente',`u·v / v·v = ${dot(u,v)}/${dot(v,v)}`,'Escalar.'),final('Por la componente x de v',`${fmt(c,4)}·${v[0]} = ${marca(fmt(val))}`,'Componente.')],errores:[[c,'Falta multiplicar por v.'],[dot(u,v)*v[0],'Divide entre v·v.']],comprobar:()=>cerca(val,dot(u,v)*v[0]/dot(v,v))})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const v1=[1,r.entero(0,2)],v2=[r.entero(-3,3),r.entero(1,4)],c=dot(v2,v1)/dot(v1,v1),w2=[v2[0]-c*v1[0],v2[1]-c*v1[1]];return prob({enunciado:`Gram-Schmidt con v₁ = (${v1.join(', ')}) y v₂ = (${v2.join(', ')}): ¿cuál es la primera componente de w₂ = v₂ − proy_{v₁} v₂? (2 decimales)`,v:w2[0],dec:2,
      pasos:[paso('Proyección',`(${dot(v2,v1)}/${dot(v1,v1)})·v₁`,'Parte de v₂ sobre v₁.'),final('Resta',`${v2[0]} − ${fmt(c*v1[0],4)} = ${marca(fmt(w2[0]))}`,'w₂ ⟂ v₁.')],errores:[[v2[0],'Falta restar la proyección.'],[c*v1[0],'Esa es la proyección, no w₂.']],comprobar:()=>cerca(dot(w2,v1),0,1e-9)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const F=r.entero(10,100),ang=r.elegir([20,30,45,60]),v=F*Math.cos(rad(ang));return prob({enunciado:`Jalas un carrito con ${F} N a ${ang}° sobre el piso. ¿Qué parte de la fuerza va en la dirección del piso (proyección)? (2 decimales)`,v,dec:2,unidad:'N',
      pasos:[paso('Proyección sobre la horizontal',`${F}·cos ${ang}°`,'u·v/‖v‖ con v unitario.'),final('Calcula',marca(fmt(v)),'N.')],errores:[[F*Math.sin(rad(ang)),'Esa es la componente vertical.'],[F,'Solo una parte va en el piso.']],comprobar:()=>cerca(v*v+(F*Math.sin(rad(ang)))**2,F*F)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const w=[r.entero(-20,20),r.entero(-20,20)],[p,m]=r.elegir([[[3,4],5],[[0,1],1],[[1,0],1],[[4,3],5]]),v=dot(w,p)/m;return prob({enunciado:`El viento sopla con velocidad (${w.join(', ')}) km/h y la pista apunta en dirección (${p.join(', ')}). ¿Cuánto viento sopla a lo largo de la pista? (proyección escalar, 2 decimales; negativo = de frente)`,v,dec:2,unidad:'km/h',
      pasos:[paso('Producto punto',`${dot(w,p)}`,'w·p.'),final('Entre ‖p‖ = '+m,marca(fmt(v)),'km/h.')],errores:[[dot(w,p),'Divide entre ‖p‖.'],[Math.hypot(...w),'Esa es la rapidez total.']].filter(([x])=>m!==1||x!==dot(w,p)),comprobar:()=>cerca(v*m,dot(w,p))})}}
  }});

export default {'tri/radianes':radianes,'tri/graficas':graficas,'tri/suma-doble':sumaDoble,'tri/leyes':leyes,
  'al/rectas-planos':rectasPlanos,'al/base-dimension':baseDim,'al/rango':rango,'al/nucleo-imagen':nucleo,'al/diagonalizacion':diagonal,'al/gram-schmidt':gram};
