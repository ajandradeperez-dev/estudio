/* Matemáticas — habilidades nuevas (3): cálculo diferencial (límites al infinito, inversas y derivación logarítmica,
   linealización, valor medio, trazado de curvas) y cálculo integral (Riemann, trigonométricas, cascarones, longitud de arco,
   valor promedio, aplicaciones). Cada respuesta se comprueba con un segundo cálculo numérico (simpson, derivNum, sumas). */
import {prob,paso,final,marca,fmt,cerca,simpson,derivNum,crearGen} from './extensiones/base.js';

const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
const sg=x=>x<0?`− ${Math.abs(x)}`:`+ ${x}`;

/* ---------- Límites al infinito y trigonométricos especiales ---------- */
const limInf=crearGen({titulo:'Límites al infinito y trigonométricos especiales',niveles:NIV,
  explicacion:'Al infinito, en un cociente de polinomios manda el término de mayor grado: si los grados son iguales el límite es el cociente de los coeficientes principales; si el de abajo es mayor, da 0. Cerca de 0: lím sen x / x = 1, así que lím sen(kx)/x = k y lím (1 − cos x)/x² = 1/2.',
  alternativa:'Con x = 1 000 000, el 3x² de arriba aplasta al +5: lo que queda es «3x² entre 2x²», o sea 3/2. Y para ángulos muy chicos (en radianes), sen x es casi igual a x.',
  referencia:'Stewart, Cálculo 2.6 y 3.3 – Límites al infinito; límite de sen x / x',regla:'Grados iguales: cociente de coeficientes principales; grado de abajo mayor: 0. lím sen(kx)/x = k.',pista:'Divide todo entre la mayor potencia de x.',
  tarjetas:[['lím (x→∞) de un cociente de polinomios del mismo grado','El cociente de los coeficientes principales.'],['lím (x→0) sen x / x','1.'],['lím (x→0) (1 − cos x)/x²','1/2.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.noCero(-9,9),b=r.noCero(-9,9),c=r.entero(1,9),d=r.entero(1,9),v=a/c;return prob({enunciado:`Calcula lím (x→∞) de (${a}x² ${sg(b)}) / (${c}x² ${sg(d)}). (fracción o decimal)`,v,dec:4,
      pasos:[paso('Divide entre x²',`(${a} ${sg(b)}/x²)/(${c} ${sg(d)}/x²)`,'Los términos /x² tienden a 0.'),final('Coeficientes principales',`${a}/${c} = ${marca(fmt(v,4))}`,'Mismo grado.')],errores:[[b/d,'Mandan los términos de mayor grado.'],[0,'Solo da 0 si el grado de abajo es mayor.']],comprobar:()=>cerca((a*1e8+b/1e8)/(c*1e8+d/1e8),v,1e-6)})}},
    b2:{prof:'basico',f:(n,r)=>{const k=r.noCero(-9,9);return prob({enunciado:`Calcula lím (x→0) de sen(${k}x)/x.`,v:k,dec:4,
      pasos:[paso('Multiplica y divide entre '+k,`${k}·sen(${k}x)/(${k}x)`,'Forma sen u / u.'),final('sen u / u → 1',marca(k),'Límite especial.')],errores:[[1,'Falta el factor k.'],[1/k,'Es k, no 1/k.']],comprobar:()=>cerca(Math.sin(k*1e-6)/1e-6,k,1e-6)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.noCero(-9,9),c=r.entero(1,9),m=r.entero(1,3),e=m+r.entero(1,2);return prob({enunciado:`Calcula lím (x→∞) de ${a}x^${m} / (${c}x^${e} + 1).`,v:0,dec:4,
      pasos:[paso('Compara grados',`arriba ${m}, abajo ${e}`,'El de abajo crece más rápido.'),final('Divide entre x^'+e,`→ 0/${c} = ${marca(0)}`,'Grado de abajo mayor.')],errores:[[a/c,'Solo si los grados son iguales.'],[Infinity,'Gana el denominador.']],comprobar:()=>Math.abs(a*1e4**m/(c*1e4**e+1))<1e-3})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.noCero(-9,9),b=r.noCero(1,9),v=a/b;return prob({enunciado:`Calcula lím (x→0) de sen(${a}x)/sen(${b}x). (fracción o decimal)`,v,dec:4,
      pasos:[paso('Divide arriba y abajo entre x',`[sen(${a}x)/x]/[sen(${b}x)/x]`,'Dos límites especiales.'),final('Cada uno',`${a}/${b} = ${marca(fmt(v,4))}`,'sen(kx)/x → k.')],errores:[[1,'Los coeficientes no se cancelan dentro del seno.'],[b/a,'Arriba va el de arriba.']],comprobar:()=>cerca(Math.sin(a*1e-6)/Math.sin(b*1e-6),v,1e-6)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(5,50),b=r.entero(1,10);return prob({enunciado:`La concentración de un medicamento en la sangre es C(t) = ${a}t/(t + ${b}) mg/L. ¿A qué valor se acerca a largo plazo (t → ∞)?`,v:a,dec:2,unidad:'mg/L',
      pasos:[paso('Divide entre t',`${a}/(1 + ${b}/t)`,'b/t → 0.'),final('Límite',marca(a),'Nivel de saturación.')],errores:[[a/b,'Al infinito, b/t desaparece.'],[0,'Mismo grado arriba y abajo.']],comprobar:()=>cerca(a*1e9/(1e9+b),a,1e-6)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const F=r.entero(1,20)*1000,c=r.entero(5,80);return prob({enunciado:`Fabricar q piezas cuesta ${F} + ${c}q pesos. ¿A qué valor se acerca el costo promedio por pieza, (${F} + ${c}q)/q, cuando q → ∞?`,v:c,dec:2,unidad:'pesos',
      pasos:[paso('Separa',`${F}/q + ${c}`,'El costo fijo se reparte.'),final('F/q → 0',marca(c),'Costo variable.')],errores:[[F,'El costo fijo se reparte entre muchas piezas.'],[F+c,'F/q tiende a 0.']],comprobar:()=>cerca((F+c*1e12)/1e12,c,1e-6)})}}
  }});

/* ---------- Derivadas de inversas y derivación logarítmica ---------- */
const inversas=crearGen({titulo:'Derivadas de funciones inversas y derivación logarítmica',niveles:NIV,
  explicacion:'(arctan x)′ = 1/(1 + x²) y (arcsen x)′ = 1/√(1 − x²). Para una inversa cualquiera: (f⁻¹)′(f(a)) = 1/f′(a). Derivación logarítmica: si y = x^x (o un producto complicado), toma ln en ambos lados, deriva (y′/y = …) y despeja y′.',
  alternativa:'La gráfica de la inversa es la misma pero reflejada en y = x: las pendientes se invierten, por eso la derivada es 1 entre la original.',
  referencia:'Stewart, Cálculo 3.5–3.6 – Inversas trigonométricas y derivación logarítmica',regla:'(arctan x)′ = 1/(1 + x²); (f⁻¹)′(f(a)) = 1/f′(a); y = x^x ⇒ y′ = x^x(ln x + 1).',pista:'Usa la fórmula y sustituye.',
  tarjetas:[['(arctan x)′','1/(1 + x²).'],['(arcsen x)′','1/√(1 − x²).'],['(f⁻¹)′(f(a))','1/f′(a).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-5,5),v=1/(1+a*a);return prob({enunciado:`Si f(x) = arctan x, ¿cuánto vale f′(${a})? (fracción o decimal)`,v,dec:4,
      pasos:[paso('Fórmula',`1/(1 + x²)`,'Derivada de arctan.'),final('Sustituye',`1/(1 + ${a*a}) = ${marca(fmt(v,4))}`,'Resultado.')],errores:[[1/(1-a*a),'Es 1 + x².'],[1+a*a,'Es 1 entre (1 + x²).']],comprobar:()=>cerca(derivNum(Math.atan,a),v,1e-6)})}},
    b2:{prof:'basico',f:(n,r)=>{const [p,q]=r.elegir([[3,5],[4,5],[5,13],[12,13],[1,2],[0,1]]),a=p/q,v=1/Math.sqrt(1-a*a);return prob({enunciado:`Si f(x) = arcsen x, ¿cuánto vale f′(${p}/${q})? (4 decimales)`,v,dec:4,
      pasos:[paso('Fórmula',`1/√(1 − x²)`,'Derivada de arcsen.'),final('Sustituye',`1/√(1 − ${fmt(a*a,4)}) = ${marca(fmt(v,4))}`,'Resultado.')],errores:[[1/(1+a*a),'Esa es la de arctan.'],[Math.sqrt(1-a*a),'Es 1 entre la raíz.']],comprobar:()=>cerca(derivNum(Math.asin,a),v,1e-5)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,4),v=a**a*(Math.log(a)+1);return prob({enunciado:`Si y = x^x, ¿cuánto vale y′ en x = ${a}? (4 decimales)`,v,dec:4,
      pasos:[paso('Toma ln','ln y = x ln x','Baja el exponente.'),paso('Deriva','y′/y = ln x + 1','Regla del producto.'),final('Despeja y sustituye',`${a}^${a}(ln ${a} + 1) = ${marca(fmt(v,4))}`,'Resultado.')],errores:[[a*a**(a-1),'No es una potencia con exponente fijo.'],[a**a*Math.log(a),'Falta el +1.']],comprobar:()=>cerca(derivNum(x=>x**x,a),v,1e-5)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,4),k=r.entero(1,5),fa=a**3+k*a,v=1/(3*a*a+k);return prob({enunciado:`f(x) = x³ + ${k}x es creciente. ¿Cuánto vale (f⁻¹)′(${fa})? (fracción o decimal)`,v,dec:4,
      pasos:[paso('¿Qué x da '+fa+'?',`f(${a}) = ${fa}`,'Busca a.'),paso('Derivada en a',`f′(${a}) = 3·${a*a} + ${k} = ${3*a*a+k}`,'f′(x) = 3x² + k.'),final('Invierte',`1/${3*a*a+k} = ${marca(fmt(v,4))}`,'Pendiente de la inversa.')],errores:[[3*a*a+k,'Es 1 entre f′(a).'],[1/(3*fa*fa+k),'Evalúa f′ en a, no en f(a).']],comprobar:()=>{let lo=0,hi=10;for(let i=0;i<80;i++){const m=(lo+hi)/2;(m**3+k*m<fa)?lo=m:hi=m}const inv=y=>{let l=0,h=10;for(let i=0;i<80;i++){const m=(l+h)/2;(m**3+k*m<y)?l=m:h=m}return l};return cerca(lo,a,1e-6)&&cerca(derivNum(inv,fa,1e-4),v,1e-4)}})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const d=r.entero(10,60),x=r.entero(0,60),vel=r.entero(10,40),v=d*vel/(d*d+x*x);return prob({enunciado:`Una cámara está a ${d} m de una pista recta y sigue a un auto que va a ${vel} m/s. El ángulo es θ = arctan(x/${d}). ¿Qué tan rápido gira (rad/s) cuando el auto está en x = ${x} m? (4 decimales)`,v,dec:4,unidad:'rad/s',
      pasos:[paso('Regla de la cadena',`dθ/dt = [1/(1 + (x/${d})²)]·(1/${d})·dx/dt`,'arctan de x/d.'),paso('Simplifica',`${d}·${vel}/(${d}² + x²)`,'Multiplica por d²/d².'),final('Sustituye',marca(fmt(v,4)),'rad/s.')],errores:[[vel/(1+(x/d)**2),'Falta el 1/d de la cadena.'],[vel/d,'Solo vale cuando x = 0.']].filter(([e])=>x!==0||e!==vel/d),comprobar:()=>cerca(derivNum(t=>Math.atan((x+vel*t)/d),0),v,1e-5)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(1,4),f=x=>x*x*(x+1)**3,v=2*a*(a+1)**3+3*a*a*(a+1)**2;return prob({enunciado:`El volumen de un tanque en construcción es V(x) = x²(x + 1)³ m³. Con derivación logarítmica, ¿cuánto vale V′(${a})?`,v,dec:2,unidad:'m³ por metro',
      pasos:[paso('ln V','2 ln x + 3 ln(x + 1)','Separa el producto.'),paso('Deriva','V′/V = 2/x + 3/(x + 1)','Cada término.'),final('Multiplica por V',`${f(a)}·(2/${a} + 3/${a+1}) = ${marca(fmt(v))}`,'Resultado.')],errores:[[2*a*3*(a+1)**2,'La derivada de un producto no es el producto de las derivadas.'],[2/a+3/(a+1),'Falta multiplicar por V.']],comprobar:()=>cerca(derivNum(f,a),v,1e-5)})}}
  }});

/* ---------- Linealización y diferenciales ---------- */
const lineal=crearGen({titulo:'Linealización y diferenciales',niveles:NIV,
  explicacion:'Cerca de x = a, f(x) ≈ L(x) = f(a) + f′(a)(x − a): la recta tangente aproxima la curva. El diferencial dy = f′(x)·dx estima cuánto cambia y cuando x cambia un poco (sirve para propagar errores de medición). Caso útil: (1 + x)ⁿ ≈ 1 + nx para x pequeño.',
  alternativa:'De cerca, toda curva suave parece una recta, como la Tierra parece plana desde el suelo: usas esa recta para calcular rápido.',
  referencia:'Stewart, Cálculo 3.10 – Aproximaciones lineales y diferenciales',regla:'L(x) = f(a) + f′(a)(x − a); dy = f′(x) dx.',pista:'Elige un a donde f sea fácil de calcular.',
  tarjetas:[['Linealización de f en a','L(x) = f(a) + f′(a)(x − a).'],['Diferencial dy','dy = f′(x)·dx.'],['(1 + x)ⁿ para x pequeño','≈ 1 + nx.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const s=r.entero(2,12),a=s*s,h=r.elegir([-2,-1,1,2,3]),v=s+h/(2*s);return prob({enunciado:`Usa la linealización de √x en a = ${a} para estimar √${a+h}. (4 decimales)`,v,dec:4,
      pasos:[paso('f(a) y f′(a)',`√${a} = ${s}; f′(${a}) = 1/(2·${s})`,'(√x)′ = 1/(2√x).'),final('L(x)',`${s} + (${h})/${2*s} = ${marca(fmt(v,4))}`,'Aproximación.')],errores:[[s+h,'Falta multiplicar por f′(a).'],[s+h/s,'f′(a) = 1/(2√a).']],comprobar:()=>Math.abs(v-Math.sqrt(a+h))<=h*h/(8*(a-Math.abs(h))**1.5)+1e-9})}},
    b2:{prof:'basico',f:(n,r)=>{const x=r.entero(1,20),dx=r.elegir([0.1,0.05,0.2,0.01]),v=2*x*dx;return prob({enunciado:`Si y = x², ¿cuánto vale el diferencial dy en x = ${x} con dx = ${dx}?`,v,dec:4,
      pasos:[paso('dy = f′(x)dx',`2·${x}·${dx}`,'f′(x) = 2x.'),final('Calcula',marca(fmt(v,4)),'Cambio aproximado.')],errores:[[x*x*dx,'Usa la derivada, no la función.'],[2*dx,'Falta x.']],comprobar:()=>Math.abs((x+dx)**2-x*x-v)<=dx*dx+1e-9})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,5),h=r.elegir([0.1,-0.1,0.02,0.05,-0.05]),v=a**3+3*a*a*h;return prob({enunciado:`Linealiza f(x) = x³ en a = ${a} y estima f(${fmt(a+h,2)}). (4 decimales)`,v,dec:4,
      pasos:[paso('f(a) y f′(a)',`${a**3} y 3·${a*a} = ${3*a*a}`,'f′ = 3x².'),final('L',`${a**3} + ${3*a*a}·(${h}) = ${marca(fmt(v,4))}`,'Aproximación.')],errores:[[(a+h)**3,'Ese es el valor exacto; pide la estimación lineal.'],[a**3+a*a*h,'f′(a) = 3a².']],comprobar:()=>Math.abs(v-(a+h)**3)<0.6})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const k=r.elegir([2,3,5,10,-1,-2]),x=r.elegir([0.01,0.02,0.03,-0.01,0.05]),v=1+k*x;return prob({enunciado:`Aproxima (1 ${sg(x)})^${k} con (1 + x)ⁿ ≈ 1 + nx. (4 decimales)`,v,dec:4,
      pasos:[paso('n y x',`n = ${k}, x = ${x}`,'x pequeño.'),final('1 + nx',`1 + ${k}·${x} = ${marca(fmt(v,4))}`,'Aproximación.')],errores:[[1+x,'Falta multiplicar por n.'],[1+x**k,'Es 1 + nx.']],comprobar:()=>Math.abs((1+x)**k-v)<=Math.abs(k*(k-1))/2*x*x*Math.max((1+Math.abs(x))**Math.abs(k),(1-Math.abs(x))**-(Math.abs(k)+2))+1e-9})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const s=r.entero(5,50),ds=r.elegir([0.1,0.2,0.5]),v=2*s*ds;return prob({enunciado:`Mides el lado de un terreno cuadrado: ${s} m con un error de ±${ds} m. Con diferenciales, ¿cuál es el error aproximado del área?`,v,dec:2,unidad:'m²',
      pasos:[paso('A = s²','dA = 2s·ds','Diferencial.'),final('Sustituye',`2·${s}·${ds} = ${marca(fmt(v))}`,'m².')],errores:[[ds*ds,'Es 2s·ds.'],[s*ds,'Falta el 2.']],comprobar:()=>Math.abs((s+ds)**2-s*s-v)<=ds*ds+1e-9})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const R=r.entero(2,30),dr=r.elegir([0.01,0.05,0.1]),v=4*Math.PI*R*R*dr;return prob({enunciado:`Un globo esférico de radio ${R} cm recibe una capa de pintura de ${dr} cm. ¿Cuánta pintura (volumen) se usa aproximadamente? (2 decimales)`,v,dec:2,unidad:'cm³',
      pasos:[paso('V = (4/3)πr³','dV = 4πr²·dr','Diferencial.'),final('Sustituye',`4π·${R*R}·${dr} = ${marca(fmt(v))}`,'cm³.')],errores:[[4/3*Math.PI*R**3,'Ese es el volumen del globo.'],[4/3*Math.PI*R*R*dr,'La derivada de r³ es 3r².']],comprobar:()=>cerca(4/3*Math.PI*((R+dr)**3-R**3)-v,4*Math.PI*(R*dr*dr+dr**3/3))})}}
  }});

/* ---------- Teorema del Valor Medio ---------- */
const tvm=crearGen({titulo:'Teorema del Valor Medio',niveles:NIV,
  explicacion:'Si f es continua en [a, b] y derivable en (a, b), existe un c entre a y b donde f′(c) = (f(b) − f(a))/(b − a): en algún momento la pendiente de la tangente es igual a la pendiente promedio (la de la secante).',
  alternativa:'Si recorriste 120 km en 2 horas, tu promedio fue 60 km/h; el teorema dice que en algún instante el velocímetro marcó exactamente 60.',
  referencia:'Stewart, Cálculo 4.2 – Teorema del valor medio',regla:'Existe c en (a, b) con f′(c) = [f(b) − f(a)]/(b − a).',pista:'Calcula la pendiente promedio y busca dónde f′ vale eso.',
  tarjetas:[['Teorema del Valor Medio','Hay un c en (a, b) con f′(c) = [f(b) − f(a)]/(b − a).'],['Hipótesis del TVM','f continua en [a, b] y derivable en (a, b).'],['Interpretación física','En algún instante la velocidad instantánea iguala a la promedio.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-5,4),b=a+r.entero(1,6),v=(a+b)/2;return prob({enunciado:`Para f(x) = x² en [${a}, ${b}], ¿qué valor c cumple el Teorema del Valor Medio?`,v,dec:4,
      pasos:[paso('Pendiente promedio',`(${b*b} − ${a*a})/(${b} − ${a}) = ${a+b}`,'Secante.'),final('f′(c) = 2c',`2c = ${a+b} ⇒ c = ${marca(fmt(v,4))}`,'El punto medio.')],errores:[[a+b,'Esa es la pendiente; c = pendiente/2.'],[(b*b-a*a),'Divide entre b − a.']],comprobar:()=>cerca(derivNum(x=>x*x,v),(b*b-a*a)/(b-a),1e-6)})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.entero(-3,2),b=a+r.entero(1,4),v=(b**3-a**3)/(b-a);return prob({enunciado:`¿Cuál es la razón de cambio promedio de f(x) = x³ en [${a}, ${b}]?`,v,dec:4,
      pasos:[paso('f(b) − f(a)',`${b**3} − (${a**3}) = ${b**3-a**3}`,'Cambio total.'),final('Entre b − a',`${b**3-a**3}/${b-a} = ${marca(fmt(v,4))}`,'Pendiente de la secante.')],errores:[[b**3-a**3,'Divide entre b − a.'],[3*b*b,'Esa es la derivada en b, no el promedio.']],comprobar:()=>cerca(v,a*a+a*b+b*b)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(1,6),v=b/Math.sqrt(3);return prob({enunciado:`Para f(x) = x³ en [0, ${b}], ¿qué c > 0 cumple el TVM? (4 decimales)`,v,dec:4,
      pasos:[paso('Pendiente promedio',`${b**3}/${b} = ${b*b}`,'Secante.'),paso('f′(c) = 3c²',`3c² = ${b*b}`,'Iguala.'),final('Despeja',`c = ${b}/√3 = ${marca(fmt(v,4))}`,'Dentro de (0, '+b+').')],errores:[[b/2,'Para x³ no es el punto medio.'],[b*b/3,'Falta sacar la raíz.']],comprobar:()=>cerca(3*v*v,b*b)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const p=r.entero(0,4),q=p+r.entero(1,4),a=p*p,b=q*q,m=(q-p)/(b-a),v=1/(4*m*m);return prob({enunciado:`Para f(x) = √x en [${a}, ${b}], ¿qué c cumple el TVM? (4 decimales)`,v,dec:4,
      pasos:[paso('Pendiente promedio',`(${q} − ${p})/(${b} − ${a}) = ${fmt(m,4)}`,'Secante.'),paso('f′(c) = 1/(2√c)',`1/(2√c) = ${fmt(m,4)}`,'Iguala.'),final('Despeja',`c = 1/(4·${fmt(m,4)}²) = ${marca(fmt(v,4))}`,'c = ((√a + √b)/2)².')],errores:[[(a+b)/2,'Para √x no es el punto medio.'],[1/(2*m),'Eso es √c; elévalo al cuadrado.']],comprobar:()=>cerca(1/(2*Math.sqrt(v)),m)&&v>a&&v<b})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const D=r.entero(50,400),T=r.elegir([1,1.5,2,2.5,3,4]),v=D/T;return prob({enunciado:`Un autobús recorre ${D} km en ${T} h. Según el TVM, ¿qué velocidad marcó con seguridad el velocímetro en algún instante?`,v,dec:2,unidad:'km/h',
      pasos:[paso('Velocidad promedio',`${D}/${T}`,'Secante de la posición.'),final('TVM',marca(fmt(v)),'En algún instante v = promedio.')],errores:[[D*T,'Es distancia entre tiempo.'],[D,'Esa es la distancia.']],comprobar:()=>cerca(v*T,D)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(1,5),T=r.entero(2,8),v=T/2;return prob({enunciado:`Un objeto se mueve con posición s(t) = ${k}t² m. Entre t = 0 y t = ${T} s, ¿en qué instante su velocidad es igual a la promedio?`,v,dec:4,unidad:'s',
      pasos:[paso('Velocidad promedio',`${k*T*T}/${T} = ${k*T}`,'Secante.'),final('s′(c) = 2·'+k+'c',`${2*k}c = ${k*T} ⇒ c = ${marca(fmt(v,4))}`,'Instante.')],errores:[[k*T,'Esa es la velocidad, no el tiempo.'],[T,'Ese es el final del intervalo.']],comprobar:()=>cerca(2*k*v,k*T)})}}
  }});

/* ---------- Crecimiento, concavidad y trazado de curvas ---------- */
const cubica=(r1,r2)=>x=>x**3-1.5*(r1+r2)*x*x+3*r1*r2*x;
const curvas=crearGen({titulo:'Crecimiento, concavidad y trazado de curvas',niveles:NIV,
  explicacion:'f′ > 0: f crece; f′ < 0: decrece. Donde f′ cambia de + a − hay un máximo local; de − a +, un mínimo. f″ > 0: cóncava hacia arriba; f″ < 0: hacia abajo; donde f″ cambia de signo hay un punto de inflección. Para trazar: dominio, cortes, puntos críticos, intervalos y concavidad.',
  alternativa:'f′ dice si vas de subida o de bajada; f″ dice si la subida se está haciendo más empinada o más suave (como pisar o soltar el acelerador).',
  referencia:'Stewart, Cálculo 4.3 y 4.5 – Derivadas y forma de una gráfica; trazado de curvas',regla:'f′ cambia + → −: máximo; − → +: mínimo. f″ cambia de signo: inflección.',pista:'Factoriza f′ y mira los signos.',
  tarjetas:[['Criterio de la primera derivada','f′ cambia de + a −: máximo local; de − a +: mínimo local.'],['f″ > 0 en un intervalo','f es cóncava hacia arriba allí.'],['Punto de inflección','Donde f″ cambia de signo.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(1,6);return prob({enunciado:`f(x) = x³ − ${3*a*a}x. ¿En qué x > 0 tiene un punto crítico?`,v:a,dec:4,
      pasos:[paso('f′(x) = 0',`3x² − ${3*a*a} = 0`,'Deriva.'),final('Despeja',`x² = ${a*a} ⇒ x = ${marca(a)}`,'El positivo.')],errores:[[a*a,'Saca la raíz.'],[3*a*a,'Iguala la derivada a 0.']],comprobar:()=>cerca(derivNum(x=>x**3-3*a*a*x,a),0,1e-5)})}},
    b2:{prof:'basico',f:(n,r)=>{const b=r.noCero(-9,9),v=-b/3;return prob({enunciado:`¿En qué x tiene f(x) = x³ ${sg(b)}x² su punto de inflección? (fracción o decimal)`,v,dec:4,
      pasos:[paso('f″(x)',`6x ${sg(2*b)}`,'Deriva dos veces.'),final('f″ = 0',`x = −${2*b}/6 = ${marca(fmt(v,4))}`,'Cambia de signo ahí.')],errores:[[b/3,'Revisa el signo.'],[-2*b/3,'Usa f″, no f′.']],comprobar:()=>cerca(6*v+2*b,0)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const r1=r.entero(-4,2),r2=r1+r.entero(1,5);return prob({enunciado:`f′(x) = 3(x − ${r1})(x − ${r2}) (es decir, f(x) = x³ − ${fmt(1.5*(r1+r2))}x² + ${3*r1*r2}x). ¿En qué x tiene f su máximo local?`,v:r1,dec:4,
      pasos:[paso('Puntos críticos',`x = ${r1} y x = ${r2}`,'Raíces de f′.'),paso('Signos de f′',`+ antes de ${r1}, − entre ${r1} y ${r2}, + después`,'Coeficiente 3 > 0.'),final('+ → −',`x = ${marca(r1)}`,'Máximo local.')],errores:[[r2,'Ahí f′ pasa de − a +: es el mínimo.'],[(r1+r2)/2,'Ese es el punto de inflección.']],comprobar:()=>{const f=cubica(r1,r2);return f(r1)>f(r1-0.01)&&f(r1)>f(r1+0.01)}})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const r1=r.entero(-4,2),r2=r1+r.entero(1,5),v=(r1+r2)/2;return prob({enunciado:`f′(x) = 3(x − ${r1})(x − ${r2}). ¿Dónde está el punto de inflección de f?`,v,dec:4,
      pasos:[paso('Desarrolla f′',`3x² − ${3*(r1+r2)}x + ${3*r1*r2}`,'Para derivar.'),paso('f″',`6x − ${3*(r1+r2)}`,'Deriva.'),final('f″ = 0',`x = ${marca(fmt(v,4))}`,'Entre los dos críticos.')],errores:[[r1,'Ese es un punto crítico, no de inflección.'],[r1+r2,'Divide entre 2.']],comprobar:()=>cerca(derivNum(x=>derivNum(cubica(r1,r2),x,1e-4),v,1e-3),0,1e-3)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const k=r.entero(2,9);return prob({enunciado:`Las ventas acumuladas de un producto nuevo son S(t) = −t³ + ${3*k}t² (miles, t en meses). ¿En qué mes crecen más rápido (punto de inflección)?`,v:k,dec:4,unidad:'meses',
      pasos:[paso('S″(t)',`−6t + ${6*k}`,'Deriva dos veces.'),final('S″ = 0',`t = ${marca(k)}`,'Ahí S′ es máxima.')],errores:[[2*k,'Ahí S′ = 0 (las ventas dejan de crecer).'],[3*k,'Iguala S″ a 0.']],comprobar:()=>{const d=t=>-3*t*t+6*k*t;return d(k)>d(k-0.1)&&d(k)>d(k+0.1)}})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const r1=r.entero(1,4),r2=r1+r.entero(1,4);return prob({enunciado:`Una población de peces cambia según P′(t) = 3(t − ${r1})(t − ${r2}) (cientos por año). ¿En qué año t alcanza un mínimo local?`,v:r2,dec:4,unidad:'años',
      pasos:[paso('Críticos',`t = ${r1} y t = ${r2}`,'P′ = 0.'),final('− → + en '+r2,`t = ${marca(r2)}`,'Mínimo local.')],errores:[[r1,'Ahí hay un máximo.'],[(r1+r2)/2,'Esa es la inflección.']],comprobar:()=>{const f=cubica(r1,r2);return f(r2)<f(r2-0.01)&&f(r2)<f(r2+0.01)}})}}
  }});

/* ---------- Sumas de Riemann ---------- */
const riemann=crearGen({titulo:'Sumas de Riemann',niveles:NIV,
  explicacion:'Para aproximar el área bajo f en [a, b], divide en n rectángulos de ancho Δx = (b − a)/n y suma f(xᵢ)·Δx. Con el extremo izquierdo de cada tramo es la suma izquierda; con el derecho, la derecha; con el centro, la de punto medio. Al crecer n, la suma se acerca a la integral.',
  alternativa:'Es como contar azulejos para medir un piso de forma rara: con azulejos más chicos (n grande) el conteo se acerca al área real.',
  referencia:'Stewart, Cálculo 5.1 – Áreas y distancias',regla:'Δx = (b − a)/n; Rₙ = Σ f(a + iΔx)Δx (i = 1…n); Lₙ usa i = 0…n − 1.',pista:'Calcula Δx y los puntos de muestra.',
  tarjetas:[['Δx en una suma de Riemann','(b − a)/n.'],['Suma izquierda Lₙ','Σ f(xᵢ₋₁)·Δx: altura en el extremo izquierdo.'],['¿Qué pasa al crecer n?','La suma se acerca a la integral definida.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-5,5),b=a+r.entero(1,12),k=r.elegir([2,4,5,6,8,10]),v=(b-a)/k;return prob({enunciado:`Divides [${a}, ${b}] en ${k} rectángulos iguales. ¿Cuánto vale Δx?`,v,dec:4,
      pasos:[paso('Longitud',`${b} − (${a}) = ${b-a}`,'b − a.'),final('Entre n',`${b-a}/${k} = ${marca(fmt(v,4))}`,'Ancho.')],errores:[[(b-a)*k,'Se divide entre n.'],[k/(b-a),'Es (b − a)/n.']],comprobar:()=>cerca(a+k*v,b)})}},
    b2:{prof:'basico',f:(n,r)=>{const B=r.entero(2,10),k=r.elegir([2,4,5]),dx=B/k;let s=0;for(let i=0;i<k;i++)s+=i*dx*dx;return prob({enunciado:`Calcula la suma izquierda L${k} de f(x) = x en [0, ${B}]. (4 decimales)`,v:s,dec:4,
      pasos:[paso('Δx',`${B}/${k} = ${fmt(dx,4)}`,'Ancho.'),paso('Alturas izquierdas',Array.from({length:k},(_,i)=>fmt(i*dx,4)).join(', '),'x₀ … x_{n−1}.'),final('Suma × Δx',marca(fmt(s,4)),'Subestima (f crece).')],errores:[[B*B/2,'Ese es el valor exacto de la integral.'],[s+B*dx,'Esa es la suma derecha.']],comprobar:()=>cerca(s,dx*dx*k*(k-1)/2)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const B=r.entero(1,6),k=r.elegir([3,4,5,6]),dx=B/k;let s=0;for(let i=1;i<=k;i++)s+=(i*dx)**2*dx;return prob({enunciado:`Calcula la suma derecha R${k} de f(x) = x² en [0, ${B}]. (4 decimales)`,v:s,dec:4,
      pasos:[paso('Δx',`${B}/${k} = ${fmt(dx,4)}`,'Ancho.'),paso('Puntos derechos',`xᵢ = i·${fmt(dx,4)}, i = 1…${k}`,'Extremos derechos.'),final('Σ xᵢ²·Δx',marca(fmt(s,4)),'Sobreestima (f crece).')],errores:[[B**3/3,'Ese es el valor exacto.'],[s-B*B*dx,'Esa es la suma izquierda.']],comprobar:()=>cerca(s,dx**3*k*(k+1)*(2*k+1)/6)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const B=r.entero(1,6),k=r.elegir([2,3,4]),dx=B/k;let s=0;for(let i=0;i<k;i++)s+=((i+.5)*dx)**2*dx;return prob({enunciado:`Calcula la suma de punto medio M${k} de f(x) = x² en [0, ${B}]. (4 decimales)`,v:s,dec:4,
      pasos:[paso('Δx',`${fmt(dx,4)}`,'Ancho.'),paso('Puntos medios',Array.from({length:k},(_,i)=>fmt((i+.5)*dx,4)).join(', '),'Centro de cada tramo.'),final('Σ f(mᵢ)·Δx',marca(fmt(s,4)),'Suele ser la mejor de las tres.')],errores:[[B**3/3,'Ese es el valor exacto.'],[s/dx,'Falta multiplicar por Δx.']],comprobar:()=>cerca(s,B**3/3-B*dx*dx/12)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const v=Array.from({length:5},()=>r.entero(5,30)),dt=r.elegir([1,2,5]),s=v.slice(0,4).reduce((a,b)=>a+b)*dt;return prob({enunciado:`Un ciclista anota su velocidad cada ${dt} s: ${v.join(', ')} m/s (en t = 0, ${dt}, …, ${4*dt}). Estima la distancia con la suma izquierda.`,v:s,dec:2,unidad:'m',
      pasos:[paso('Velocidades izquierdas',v.slice(0,4).join(' + '),'Las 4 primeras.'),final('× Δt',`${v.slice(0,4).reduce((a,b)=>a+b)}·${dt} = ${marca(s)}`,'Distancia aproximada.')],errores:[[v.slice(1).reduce((a,b)=>a+b)*dt,'Esa es la suma derecha.'],[v.reduce((a,b)=>a+b)*dt,'Son 4 intervalos, no 5 puntos.']],comprobar:()=>s===v.slice(0,4).reduce((a,b)=>a+b)*dt})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const q=Array.from({length:4},()=>r.entero(10,60)),dt=r.elegir([10,15,30]),s=q.slice(1).reduce((a,b)=>a+b)*dt;return prob({enunciado:`El caudal de una llave se mide cada ${dt} min: ${q.join(', ')} L/min (en t = 0, ${dt}, ${2*dt}, ${3*dt}). Estima el agua total con la suma derecha.`,v:s,dec:2,unidad:'L',
      pasos:[paso('Caudales derechos',q.slice(1).join(' + '),'Los 3 últimos.'),final('× Δt',marca(s),'Litros.')],errores:[[q.slice(0,3).reduce((a,b)=>a+b)*dt,'Esa es la suma izquierda.'],[q.slice(1).reduce((a,b)=>a+b),'Multiplica por Δt.']],comprobar:()=>s===(q[1]+q[2]+q[3])*dt})}}
  }});

/* ---------- Integrales trigonométricas ---------- */
const trig=crearGen({titulo:'Integrales trigonométricas',niveles:NIV,
  explicacion:'Con potencias pares usa sen²x = (1 − cos 2x)/2 y cos²x = (1 + cos 2x)/2. Con una potencia impar, separa un factor: sen³x = (1 − cos²x)·sen x y sustituye u = cos x. Para sen x cos x, u = sen x da sen²x/2.',
  alternativa:'Las identidades «bajan el grado» hasta que queda algo que ya sabes integrar, como cos 2x.',
  referencia:'Stewart, Cálculo 7.2 – Integrales trigonométricas',regla:'sen²x = (1 − cos 2x)/2; cos²x = (1 + cos 2x)/2; potencia impar: separa un factor y sustituye.',pista:'¿La potencia es par o impar?',
  tarjetas:[['sen²x (para integrar)','(1 − cos 2x)/2.'],['cos²x (para integrar)','(1 + cos 2x)/2.'],['∫ sen³x dx','Separa sen x: ∫(1 − cos²x) sen x dx, con u = cos x.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const k=r.entero(1,4),v=k*Math.PI/2;return prob({enunciado:`Calcula ∫ de 0 a ${k}π de sen²x dx. (4 decimales)`,v,dec:4,
      pasos:[paso('Identidad','sen²x = (1 − cos 2x)/2','Baja el grado.'),final('Integra',`[x/2 − sen 2x/4] = ${k}π/2 = ${marca(fmt(v,4))}`,'sen 2x vale 0 en los extremos.')],errores:[[k*Math.PI,'Falta el 1/2.'],[0,'sen² nunca es negativo.']],comprobar:()=>cerca(simpson(x=>Math.sin(x)**2,0,k*Math.PI),v,1e-8)})}},
    b2:{prof:'basico',f:(n,r)=>{const g=r.elegir([30,45,60,90]),a=g*Math.PI/180,v=Math.sin(a)**2/2;return prob({enunciado:`Calcula ∫ de 0 a ${g}° (en radianes) de sen x·cos x dx. (4 decimales)`,v,dec:4,
      pasos:[paso('u = sen x','du = cos x dx','Sustitución.'),final('∫u du',`sen²(${g}°)/2 = ${marca(fmt(v,4))}`,'Evalúa.')],errores:[[Math.sin(a)**2,'Falta el 1/2.'],[Math.sin(a)*Math.cos(a),'Eso es el integrando, no la integral.']],comprobar:()=>cerca(simpson(x=>Math.sin(x)*Math.cos(x),0,a),v,1e-8)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const g=r.elegir([60,90,120,180]),a=g*Math.PI/180,F=x=>-Math.cos(x)+Math.cos(x)**3/3,v=F(a)-F(0);return prob({enunciado:`Calcula ∫ de 0 a ${g}° (en radianes) de sen³x dx. (4 decimales)`,v,dec:4,
      pasos:[paso('Separa','(1 − cos²x)·sen x','Potencia impar.'),paso('u = cos x','−∫(1 − u²) du = −cos x + cos³x/3','Sustituye.'),final('Evalúa',marca(fmt(v,4)),'F(b) − F(a).')],errores:[[Math.sin(a)**4/4,'No se integra como una potencia de x.'],[F(a),'Resta F(0).']],comprobar:()=>cerca(simpson(x=>Math.sin(x)**3,0,a),v,1e-8)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const g=r.elegir([30,45,60,90,120]),a=g*Math.PI/180,v=a/2+Math.sin(2*a)/4;return prob({enunciado:`Calcula ∫ de 0 a ${g}° (en radianes) de cos²x dx. (4 decimales)`,v,dec:4,
      pasos:[paso('Identidad','(1 + cos 2x)/2','Baja el grado.'),final('Integra',`x/2 + sen 2x/4 → ${marca(fmt(v,4))}`,'Evalúa en 0 y en el límite.')],errores:[[a/2-Math.sin(2*a)/4,'Para cos² el signo es +.'],[Math.sin(a)**3/3,'No es una potencia simple.']],comprobar:()=>cerca(simpson(x=>Math.cos(x)**2,0,a),v,1e-8)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const V=r.elegir([120,127,170,220,311]),R=r.elegir([10,20,50,100]),v=V*V/(2*R);return prob({enunciado:`Una resistencia de ${R} Ω recibe un voltaje V(t) = ${V}·sen(t). La potencia promedio en un ciclo es (1/2π)∫ V²sen²t/R dt de 0 a 2π. ¿Cuánto vale? (2 decimales)`,v,dec:2,unidad:'W',
      pasos:[paso('Promedio de sen² en un ciclo','1/2','(1 − cos 2t)/2 promedia 1/2.'),final('Potencia',`${V}²/(2·${R}) = ${marca(fmt(v))}`,'W.')],errores:[[V*V/R,'Falta el 1/2 del promedio de sen².'],[0,'sen² es siempre ≥ 0.']],comprobar:()=>cerca(simpson(t=>V*V*Math.sin(t)**2/R,0,2*Math.PI)/(2*Math.PI),v,1e-8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const A=r.entero(1,9),k=r.entero(1,4),v=2*A/k;return prob({enunciado:`Un arco de puente tiene forma y = ${A}·sen(${k}x) (m) entre x = 0 y x = π/${k}. ¿Cuál es el área bajo el arco? (4 decimales)`,v,dec:4,unidad:'m²',
      pasos:[paso('Integral',`∫ ${A} sen(${k}x) dx = −(${A}/${k}) cos(${k}x)`,'Antiderivada.'),final('Evalúa',`(${A}/${k})·(1 − (−1)) = ${marca(fmt(v,4))}`,'cos π = −1.')],errores:[[A/k,'cos π = −1: el paréntesis vale 2.'],[2*A,'Divide entre k.']],comprobar:()=>cerca(simpson(x=>A*Math.sin(k*x),0,Math.PI/k),v,1e-8)})}}
  }});

/* ---------- Volúmenes por cascarones ---------- */
const cascarones=crearGen({titulo:'Volúmenes por cascarones',niveles:NIV,
  explicacion:'Al girar alrededor del eje y la región bajo y = f(x) entre x = a y x = b (con a ≥ 0), el sólido se arma con tubos (cascarones) de radio x, altura f(x) y grosor dx: V = 2π ∫ x·f(x) dx de a a b. Es útil cuando despejar x en función de y (discos) sería difícil.',
  alternativa:'Piensa en una cebolla o en los anillos de un tronco: cada capa es un tubo delgado; su volumen es circunferencia × altura × grosor.',
  referencia:'Stewart, Cálculo 6.3 – Volúmenes mediante cascarones cilíndricos',regla:'Alrededor del eje y: V = 2π ∫ x·f(x) dx.',pista:'Radio = x, altura = f(x).',
  tarjetas:[['Volumen por cascarones (eje y)','V = 2π ∫ x·f(x) dx.'],['Volumen de un cascarón delgado','2π·radio·altura·grosor.'],['¿Cuándo conviene usar cascarones?','Cuando girar alrededor del eje y obligaría a despejar x(y).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const R=r.entero(1,10),h=r.entero(1,10),t=r.elegir([0.1,0.2,0.5]),v=2*Math.PI*R*h*t;return prob({enunciado:`¿Cuál es el volumen aproximado de un cascarón cilíndrico de radio ${R}, altura ${h} y grosor ${t}? (2 decimales)`,v,dec:2,
      pasos:[paso('Desenrolla el tubo','largo 2πr, alto h, grosor t','Una lámina.'),final('2πrht',`2π·${R}·${h}·${t} = ${marca(fmt(v))}`,'Volumen.')],errores:[[Math.PI*R*R*h,'Ese es un cilindro sólido.'],[2*Math.PI*R*h,'Falta el grosor.']],comprobar:()=>cerca(Math.PI*((R+t/2)**2-(R-t/2)**2)*h,v)})}},
    b2:{prof:'basico',f:(n,r)=>{const b=r.entero(1,6),v=2*Math.PI*b**3/3;return prob({enunciado:`Gira la región bajo y = x en [0, ${b}] alrededor del eje y. ¿Cuál es el volumen? (2 decimales)`,v,dec:2,
      pasos:[paso('Cascarones',`2π ∫₀^${b} x·x dx`,'Radio x, altura x.'),final('Integra',`2π·${b}³/3 = ${marca(fmt(v))}`,'Volumen.')],errores:[[Math.PI*b**3/3,'Esa es la del eje x (discos).'],[b**3/3,'Falta 2π.']],comprobar:()=>cerca(2*Math.PI*simpson(x=>x*x,0,b),v,1e-8)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(1,4),v=Math.PI*b**4/2;return prob({enunciado:`Gira la región bajo y = x² en [0, ${b}] alrededor del eje y. ¿Cuál es el volumen? (2 decimales)`,v,dec:2,
      pasos:[paso('Planteamiento',`2π ∫₀^${b} x·x² dx`,'Radio x, altura x².'),paso('Integra',`2π·[x⁴/4] = 2π·${b**4}/4`,'Potencia.'),final('Calcula',marca(fmt(v)),'Volumen.')],errores:[[Math.PI*b**5/5,'Esa es alrededor del eje x.'],[2*Math.PI*b**3/3,'La altura es x², no x.']],comprobar:()=>cerca(2*Math.PI*simpson(x=>x**3,0,b),v,1e-8)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const m=r.entero(1,5),v=Math.PI*m**4/6;return prob({enunciado:`Gira la región entre y = ${m}x − x² y el eje x (de 0 a ${m}) alrededor del eje y. ¿Cuál es el volumen? (2 decimales)`,v,dec:2,
      pasos:[paso('Planteamiento',`2π ∫₀^${m} x(${m}x − x²) dx`,'Altura = f(x).'),paso('Integra',`2π[${m}x³/3 − x⁴/4] = 2π(${m**4}/3 − ${m**4}/4)`,'Término a término.'),final('Calcula',marca(fmt(v)),'π m⁴/6.')],errores:[[2*Math.PI*m**4/3,'Falta restar x⁴/4.'],[Math.PI*m**5/30,'Esa es alrededor del eje x.']],comprobar:()=>cerca(2*Math.PI*simpson(x=>x*(m*x-x*x),0,m),v,1e-8)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const r1=r.entero(2,6),r2=r1+r.entero(2,8),h=r.entero(4,10),v=Math.PI*h*(r2*r2-r1*r1);return prob({enunciado:`Un molde de rosca (pastel) tiene altura ${h} cm, radio interior ${r1} cm y exterior ${r2} cm. Con cascarones, V = 2π∫ x·${h} dx de ${r1} a ${r2}. ¿Cuánta masa cabe (cm³)? (2 decimales)`,v,dec:2,unidad:'cm³',
      pasos:[paso('Integra',`2π·${h}·[x²/2] de ${r1} a ${r2}`,'Altura constante.'),final('Calcula',`π·${h}·(${r2*r2} − ${r1*r1}) = ${marca(fmt(v))}`,'cm³.')],errores:[[Math.PI*h*r2*r2,'Resta el hueco del centro.'],[Math.PI*h*(r2-r1)**2,'Es r₂² − r₁², no (r₂ − r₁)².']],comprobar:()=>cerca(2*Math.PI*simpson(x=>x*h,r1,r2),v,1e-8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const H=r.entero(2,10),R=r.entero(2,10),v=Math.PI*H*R*R/2;return prob({enunciado:`Una cúpula tiene perfil y = ${H}(1 − x²/${R*R}) m para 0 ≤ x ≤ ${R}, girado alrededor del eje y. ¿Cuál es su volumen? (2 decimales)`,v,dec:2,unidad:'m³',
      pasos:[paso('Cascarones',`2π ∫₀^${R} x·${H}(1 − x²/${R*R}) dx`,'Radio x.'),paso('Integra',`2π·${H}(${R*R}/2 − ${R*R}/4)`,'Término a término.'),final('Calcula',marca(fmt(v)),'π H R²/2.')],errores:[[Math.PI*H*R*R,'Ese es el cilindro que la contiene.'],[Math.PI*H*R*R/3,'Eso sería un cono.']],comprobar:()=>cerca(2*Math.PI*simpson(x=>x*H*(1-x*x/(R*R)),0,R),v,1e-8)})}}
  }});

/* ---------- Longitud de arco ---------- */
const arco=crearGen({titulo:'Longitud de arco',niveles:NIV,
  explicacion:'La longitud de la curva y = f(x) entre a y b es L = ∫ √(1 + [f′(x)]²) dx de a a b: cada pedacito es la hipotenusa de un triángulo de lados dx y dy. Para una recta da la distancia de siempre; muchas curvas se resuelven con ejemplos preparados o numéricamente.',
  alternativa:'Es medir una carretera curva con muchos tramos rectos muy cortos y sumar sus largos (Pitágoras en cada tramo).',
  referencia:'Stewart, Cálculo 8.1 – Longitud de arco',regla:'L = ∫ₐᵇ √(1 + f′(x)²) dx.',pista:'Calcula f′, elévala al cuadrado y súmale 1.',
  tarjetas:[['Longitud de arco de y = f(x)','L = ∫ √(1 + f′(x)²) dx.'],['De dónde sale la fórmula','Pitágoras: ds = √(dx² + dy²).'],['Longitud de y = mx + b en [0, a]','a·√(1 + m²).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const m=r.entero(-5,5),a=r.entero(1,10),v=a*Math.sqrt(1+m*m);return prob({enunciado:`¿Cuál es la longitud de y = ${m}x + 2 entre x = 0 y x = ${a}? (4 decimales)`,v,dec:4,
      pasos:[paso('f′(x) = '+m,`√(1 + ${m*m})`,'Constante.'),final('× longitud del intervalo',`${a}·√${1+m*m} = ${marca(fmt(v,4))}`,'Distancia.')],errores:[[a,'Esa es solo la distancia horizontal.'],[a*(1+m*m),'Falta la raíz.']],comprobar:()=>cerca(Math.hypot(a,m*a),v)})}},
    b2:{prof:'basico',f:(n,r)=>{const a=r.elegir([3,8,15,24]),v=2/3*((1+a)**1.5-1);return prob({enunciado:`Calcula la longitud de y = (2/3)x^(3/2) entre x = 0 y x = ${a}. (4 decimales)`,v,dec:4,
      pasos:[paso('f′(x) = √x','1 + f′² = 1 + x','Se simplifica.'),final('∫√(1 + x) dx',`(2/3)[(1 + x)^(3/2)] = (2/3)(${(1+a)**1.5} − 1) = ${marca(fmt(v,4))}`,'Evalúa.')],errores:[[2/3*(1+a)**1.5,'Resta el valor en 0.'],[2/3*a**1.5,'Esa es la altura, no la longitud.']],comprobar:()=>cerca(simpson(x=>Math.sqrt(1+x),0,a),v,1e-8)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(2,4),v=b**3/6-1/(2*b)-(1/6-1/2);return prob({enunciado:`Calcula la longitud de y = x³/6 + 1/(2x) entre x = 1 y x = ${b}. (4 decimales)`,v,dec:4,
      pasos:[paso('f′(x)','x²/2 − 1/(2x²)','Deriva.'),paso('1 + f′²','(x²/2 + 1/(2x²))²','Cuadrado perfecto.'),final('Integra x²/2 + 1/(2x²)',`[x³/6 − 1/(2x)] de 1 a ${b} = ${marca(fmt(v,4))}`,'Evalúa.')],errores:[[b**3/6+1/(2*b)-(1/6+1/2),'Esa es la diferencia de alturas f(b) − f(1).'],[b**3/6-1/(2*b),'Resta el valor en 1.']],comprobar:()=>cerca(simpson(x=>Math.sqrt(1+(x*x/2-1/(2*x*x))**2),1,b),v,1e-8)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const a=r.entero(1,4),v=(a*Math.sqrt(1+a*a)+Math.asinh(a))/2;return prob({enunciado:`Calcula la longitud de la parábola y = x²/2 entre x = 0 y x = ${a}. (4 decimales; ∫√(1 + x²)dx = [x√(1 + x²) + ln(x + √(1 + x²))]/2)`,v,dec:4,
      pasos:[paso('f′(x) = x','√(1 + x²)','Integrando.'),final('Fórmula dada',`[${a}·√${1+a*a} + ln(${a} + √${1+a*a})]/2 = ${marca(fmt(v,4))}`,'Evalúa.')],errores:[[a*a/2,'Esa es la altura final.'],[Math.hypot(a,a*a/2),'Esa es la cuerda recta, más corta que la curva.']],comprobar:()=>cerca(simpson(x=>Math.sqrt(1+x*x),0,a),v,1e-8)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const c=r.entero(5,30),a=r.entero(5,30),v=2*c*Math.sinh(a/c);return prob({enunciado:`Un cable cuelga entre dos postes con forma y = ${c}·cosh(x/${c}) m, de x = −${a} a x = ${a}. ¿Cuánto cable se necesita? (2 decimales; 1 + sinh² = cosh²)`,v,dec:2,unidad:'m',
      pasos:[paso('f′ = sinh(x/'+c+')','√(1 + sinh²) = cosh(x/'+c+')','Identidad.'),final('∫cosh',`${c}·[sinh(x/${c})] de −${a} a ${a} = ${marca(fmt(v))}`,'Simétrico.')],errores:[[2*a,'Esa es la distancia entre postes.'],[c*Math.sinh(a/c),'Es de −a a a: el doble.']],comprobar:()=>cerca(simpson(x=>Math.cosh(x/c),-a,a),v,1e-8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const w=r.entero(2,20),h=r.entero(1,10),v=Math.hypot(w,h);return prob({enunciado:`Una rampa recta sube ${h} m en ${w} m horizontales (y = (${h}/${w})x). ¿Cuánto mide la rampa? (2 decimales)`,v,dec:2,unidad:'m',
      pasos:[paso('f′ = '+fmt(h/w,4),`√(1 + ${fmt((h/w)**2,4)})`,'Constante.'),final('× '+w,marca(fmt(v)),'= √(w² + h²).')],errores:[[w+h,'La rampa es la hipotenusa.'],[w,'Esa es la base.']],comprobar:()=>cerca(w*Math.sqrt(1+(h/w)**2),v)})}}
  }});

/* ---------- Valor promedio ---------- */
const promedio=crearGen({titulo:'Valor promedio de una función',niveles:NIV,
  explicacion:'El valor promedio de f en [a, b] es f_prom = (1/(b − a))·∫ₐᵇ f(x) dx: la altura del rectángulo con la misma base y la misma área que la región bajo f. El Teorema del Valor Medio para integrales dice que, si f es continua, en algún punto f(c) = f_prom.',
  alternativa:'Si pudieras «aplanar» el área bajo la curva como plastilina sobre la misma base, la altura que queda es el promedio.',
  referencia:'Stewart, Cálculo 6.5 – Valor promedio de una función',regla:'f_prom = (1/(b − a))∫ₐᵇ f(x) dx.',pista:'Integra y divide entre la longitud del intervalo.',
  tarjetas:[['Valor promedio de f en [a, b]','(1/(b − a))·∫ₐᵇ f dx.'],['Promedio de f(x) = x en [a, b]','(a + b)/2.'],['TVM para integrales','Existe c con f(c) = f_prom (si f es continua).']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const a=r.entero(-5,5),b=a+r.entero(1,10),v=(a+b)/2;return prob({enunciado:`¿Cuál es el valor promedio de f(x) = x en [${a}, ${b}]?`,v,dec:4,
      pasos:[paso('Integral',`(${b*b} − ${a*a})/2`,'∫x dx = x²/2.'),final('Entre b − a',marca(fmt(v,4)),'El punto medio.')],errores:[[(b*b-a*a)/2,'Divide entre b − a.'],[b-a,'Esa es la longitud del intervalo.']],comprobar:()=>cerca(simpson(x=>x,a,b)/(b-a),v,1e-8)})}},
    b2:{prof:'basico',f:(n,r)=>{const b=r.entero(1,9),v=b*b/3;return prob({enunciado:`¿Cuál es el valor promedio de f(x) = x² en [0, ${b}]? (4 decimales)`,v,dec:4,
      pasos:[paso('Integral',`${b}³/3`,'∫x² dx.'),final('Entre '+b,`${b*b}/3 = ${marca(fmt(v,4))}`,'Promedio.')],errores:[[b**3/3,'Divide entre la longitud.'],[b*b/2,'El promedio de x² no es el valor en el punto medio.']],comprobar:()=>cerca(simpson(x=>x*x,0,b)/b,v,1e-8)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const A=r.entero(1,9),v=2*A/Math.PI;return prob({enunciado:`¿Cuál es el valor promedio de f(x) = ${A}·sen x en [0, π]? (4 decimales)`,v,dec:4,
      pasos:[paso('Integral',`${A}·[−cos x] de 0 a π = ${2*A}`,'Antiderivada.'),final('Entre π',`${2*A}/π = ${marca(fmt(v,4))}`,'Promedio.')],errores:[[2*A,'Divide entre π.'],[A/2,'El promedio de sen en [0, π] no es 1/2.']],comprobar:()=>cerca(simpson(x=>A*Math.sin(x),0,Math.PI)/Math.PI,v,1e-8)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(2,9),v=Math.log(b)/(b-1);return prob({enunciado:`¿Cuál es el valor promedio de f(x) = 1/x en [1, ${b}]? (4 decimales)`,v,dec:4,
      pasos:[paso('Integral',`ln ${b} − ln 1 = ${fmt(Math.log(b),4)}`,'∫dx/x = ln x.'),final('Entre '+(b-1),marca(fmt(v,4)),'Promedio.')],errores:[[Math.log(b),'Divide entre b − 1.'],[(1+1/b)/2,'Ese es el promedio de los extremos, no de la función.']],comprobar:()=>cerca(simpson(x=>1/x,1,b)/(b-1),v,1e-8)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const T0=r.entero(10,25),A=r.entero(2,10),v=T0+2*A/Math.PI;return prob({enunciado:`Durante el día la temperatura es T(t) = ${T0} + ${A}·sen(πt/12) °C (t de 0 a 12 h). ¿Cuál es la temperatura promedio en ese lapso? (2 decimales)`,v,dec:2,unidad:'°C',
      pasos:[paso('Integral',`∫₀¹² T dt = ${12*T0} + ${A}·24/π`,'Antiderivada de sen(πt/12).'),final('Entre 12',`${T0} + 2·${A}/π = ${marca(fmt(v))}`,'°C.')],errores:[[T0,'La parte senoidal es positiva en [0, 12].'],[T0+A,'Ese es el máximo.']],comprobar:()=>cerca(simpson(t=>T0+A*Math.sin(Math.PI*t/12),0,12)/12,v,1e-8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(1,5),T=r.entero(2,10),v=a*T*T/3;return prob({enunciado:`Un auto acelera con velocidad v(t) = ${a}t² m/s. ¿Cuál es su velocidad promedio entre t = 0 y t = ${T} s? (2 decimales)`,v,dec:2,unidad:'m/s',
      pasos:[paso('Distancia',`∫₀^${T} ${a}t² dt = ${a}·${T**3}/3`,'Integral.'),final('Entre '+T,marca(fmt(v)),'m/s.')],errores:[[a*T*T/2,'Promedio de las velocidades extremas: no aplica a t².'],[a*T**3/3,'Esa es la distancia.']],comprobar:()=>cerca(simpson(t=>a*t*t,0,T)/T,v,1e-8)})}}
  }});

/* ---------- Aplicaciones: trabajo, física y economía ---------- */
const aplicInt=crearGen({titulo:'Aplicaciones: trabajo, física y economía',niveles:NIV,
  explicacion:'Trabajo de una fuerza variable: W = ∫ F(x) dx. Un resorte (ley de Hooke, F = kx) estirado de x₁ a x₂: W = k(x₂² − x₁²)/2. En economía, el ingreso total es la integral del ingreso marginal y el excedente del consumidor es el área entre la curva de demanda y el precio pagado.',
  alternativa:'Si la fuerza cambia en cada centímetro, sumas «fuerza × pedacito» en todos los pedacitos: eso es la integral.',
  referencia:'Stewart, Cálculo 6.4 y 8.4 – Trabajo; aplicaciones a la economía',regla:'W = ∫ F(x) dx; resorte: W = k(x₂² − x₁²)/2; ingreso = ∫ ingreso marginal.',pista:'Escribe qué se acumula y entre qué límites.',
  tarjetas:[['Trabajo con fuerza variable','W = ∫ F(x) dx.'],['Trabajo para estirar un resorte de x₁ a x₂','k(x₂² − x₁²)/2.'],['Excedente del consumidor','∫₀^q₀ (demanda(q) − p₀) dq.']],
  plantillas:{
    b1:{prof:'basico',f:(n,r)=>{const F=r.entero(5,200),d=r.entero(1,50);return prob({enunciado:`Empujas una caja con una fuerza constante de ${F} N a lo largo de ${d} m. ¿Cuánto trabajo haces?`,v:F*d,dec:2,unidad:'J',
      pasos:[paso('Fuerza constante','W = F·d','La integral de una constante.'),final('Calcula',`${F}·${d} = ${marca(F*d)}`,'Joules.')],errores:[[F/d,'Se multiplica.'],[F+d,'Se multiplica.']],comprobar:()=>cerca(simpson(()=>F,0,d),F*d,1e-9)})}},
    b2:{prof:'basico',f:(n,r)=>{const k=r.entero(10,500),x=r.elegir([0.05,0.1,0.2,0.3]),v=k*x*x/2;return prob({enunciado:`Un resorte tiene k = ${k} N/m. ¿Cuánto trabajo cuesta estirarlo ${x} m desde su largo natural? (4 decimales)`,v,dec:4,unidad:'J',
      pasos:[paso('W = ∫₀ˣ kx dx',`${k}·x²/2`,'Ley de Hooke.'),final('Sustituye',`${k}·${x}²/2 = ${marca(fmt(v,4))}`,'J.')],errores:[[k*x,'Esa es la fuerza final.'],[k*x*x,'Falta el 1/2.']],comprobar:()=>cerca(simpson(s=>k*s,0,x),v,1e-9)})}},
    p1:{prof:'procedimiento',f:(n,r)=>{const k=r.entero(20,300),x1=r.elegir([0.1,0.2]),x2=x1+r.elegir([0.1,0.2,0.3]),v=k*(x2*x2-x1*x1)/2;return prob({enunciado:`Un resorte con k = ${k} N/m ya está estirado ${x1} m. ¿Cuánto trabajo cuesta llevarlo a ${fmt(x2,2)} m? (4 decimales)`,v,dec:4,unidad:'J',
      pasos:[paso('Límites',`∫ de ${x1} a ${fmt(x2,2)} de ${k}x dx`,'Desde donde está.'),final('Evalúa',`${k}(${fmt(x2*x2,4)} − ${fmt(x1*x1,4)})/2 = ${marca(fmt(v,4))}`,'J.')],errores:[[k*(x2-x1)**2/2,'Es x₂² − x₁², no (x₂ − x₁)².'],[k*x2*x2/2,'Empieza en x₁, no en 0.']],comprobar:()=>cerca(simpson(s=>k*s,x1,x2),v,1e-9)})}},
    p2:{prof:'procedimiento',f:(n,r)=>{const b=r.entero(1,5),q0=r.entero(5,40),p0=r.entero(10,100),a=p0+b*q0,v=b*q0*q0/2;return prob({enunciado:`La demanda es p = ${a} − ${b}q y el precio de mercado es ${p0} (se venden q₀ = ${q0}). ¿Cuál es el excedente del consumidor?`,v,dec:2,
      pasos:[paso('Planteamiento',`∫₀^${q0} (${a} − ${b}q − ${p0}) dq`,'Demanda − precio.'),final('Integra',`(${a-p0})·${q0} − ${b}·${q0*q0}/2 = ${marca(fmt(v))}`,'Área del triángulo.')],errores:[[b*q0*q0,'Falta el 1/2 del triángulo.'],[a*q0-b*q0*q0/2,'Resta lo que pagaron (p₀·q₀).']],comprobar:()=>cerca(simpson(q=>a-b*q-p0,0,q0),v,1e-9)})}},
    a1:{prof:'aplicacion',f:(n,r)=>{const R=r.elegir([0.5,1,1.5,2]),H=r.entero(1,5),v=1000*9.8*Math.PI*R*R*H*H/2/1000;return prob({enunciado:`Un tanque cilíndrico de radio ${R} m y altura ${H} m está lleno de agua (1000 kg/m³, g = 9.8). ¿Cuánto trabajo cuesta bombear toda el agua hasta el borde superior? Da kJ. (2 decimales)`,v,dec:2,unidad:'kJ',
      pasos:[paso('Capa a profundidad y',`peso = 9800·π·${R}²·dy; sube y metros`,'Cada capa recorre distinto.'),paso('Integral',`9800π·${R*R}·∫₀^${H} y dy = 9800π·${R*R}·${H*H}/2`,'Suma de capas.'),final('En kJ',marca(fmt(v)),'÷ 1000.')],errores:[[v*2,'Cada capa sube su profundidad, no toda la altura: falta el 1/2.'],[v*1000,'Pasa a kJ.']],comprobar:()=>cerca(simpson(y=>9800*Math.PI*R*R*y,0,H)/1000,v,1e-8)})}},
    a2:{prof:'aplicacion',f:(n,r)=>{const a=r.entero(50,200),b=r.elegir([0.5,1,2]),Q=r.entero(10,Math.floor(a/b)),v=a*Q-b*Q*Q/2;return prob({enunciado:`El ingreso marginal de una tienda es R′(q) = ${a} − ${b}q pesos por unidad. ¿Cuál es el ingreso total por vender ${Q} unidades (R(0) = 0)?`,v,dec:2,unidad:'pesos',
      pasos:[paso('R(Q) = ∫₀^Q R′(q) dq',`${a}q − ${b}q²/2`,'Antiderivada.'),final('Sustituye',`${a}·${Q} − ${b}·${Q*Q}/2 = ${marca(fmt(v))}`,'Pesos.')],errores:[[a-b*Q,'Ese es el ingreso marginal en Q.'],[a*Q-b*Q*Q,'Falta el 1/2.']],comprobar:()=>cerca(simpson(q=>a-b*q,0,Q),v,1e-9)})}}
  }});

export default {'cd/limites-infinito':limInf,'cd/inversas-log':inversas,'cd/linealizacion':lineal,'cd/valor-medio':tvm,'cd/trazado-curvas':curvas,
  'ci/riemann':riemann,'ci/trigonometricas':trig,'ci/cascarones':cascarones,'ci/longitud-arco':arco,'ci/valor-promedio':promedio,'ci/aplicaciones':aplicInt};
