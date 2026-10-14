/* Generadores de álgebra básica: sistemas 2×2, factorización y leyes de exponentes.
   Los pasos se calculan con los números de cada ejercicio (ver pasos.js). */
import {num,lista,casi,equivalente,limpiar} from './verificar.js';
import {lineal,frac,par,polinomio} from './formato.js';
import {paso,final,c} from './pasos.js';

// "x = 2, y = -1", "(2, -1)", "2, -1" → [x, y]
export function parXY(e){
  const s=limpiar(e).toLowerCase(),mx=s.match(/x\s*=\s*([^,;y]+)/),my=s.match(/y\s*=\s*([^,;x]+)/);
  if(mx&&my)return [num(mx[1]),num(my[1])];
  const l=lista(s);return l.length===2?l:null;
}
// ¿Está escrita como producto? (ningún + o − fuera de los paréntesis, salvo el signo inicial o el de un exponente)
export function esProducto(e){
  const s=limpiar(e).replace(/\s/g,'');if(!s.includes('('))return false;
  let p=0;
  for(let i=0;i<s.length;i++){const ch=s[i];if(ch==='(')p++;else if(ch===')')p--;else if((ch==='+'||ch==='-')&&p===0&&i>0&&s[i-1]!=='^')return false}
  return true;
}
const sg=n=>n<0?`- ${-n}`:`+ ${n}`;
const texPot=s=>s.replace(/\^(-?\d+)/g,'^{$1}');

// Sistemas 2×2 con solución entera (1–4) o fraccionaria (5), resueltos por eliminación
const sistema={
  titulo:'Sistemas 2×2',
  explicacion:'Busca x e y que cumplan las dos ecuaciones a la vez: multiplica para que una letra tenga coeficientes opuestos, suma las ecuaciones y despeja.',
  alternativa:'Imagina dos tickets de la misma tienda: «2 cafés y 1 pan = 7» y «1 café y 1 pan = 4». Si a un ticket le restas el otro, el pan desaparece: 1 café = 3. Luego vuelves a cualquier ticket para sacar el pan (= 1). Eliminar una letra es exactamente eso: combinar las ecuaciones para que una desaparezca.',
  generar(n,rng){
    const R=n<=1?4:n<=3?6:9;let a1,b1,a2,b2,det;
    do{a1=n===1?1:rng.noCero(-R,R);b1=rng.noCero(-R,R);a2=rng.noCero(-R,R);b2=n<=2?rng.entero(1,R):rng.noCero(-R,R);det=a1*b2-a2*b1}while(det===0||Math.abs(det)>40||(n===5&&Math.abs(det)<2));
    let c1,c2;
    if(n<5){const x=rng.entero(-6,6),y=rng.entero(-6,6);c1=a1*x+b1*y;c2=a2*x+b2*y}
    else do{c1=rng.entero(-20,20);c2=rng.entero(-20,20)}while((c1*b2-c2*b1)%det===0&&(a1*c2-a2*c1)%det===0);
    const nx=c1*b2-c2*b1,ny=a1*c2-a2*c1,x=nx/det,y=ny/det;
    const fx=frac(nx,det,{tex:false}),fy=frac(ny,det,{tex:false});
    // eliminar y: (ec. 1)·b2 − (ec. 2)·b1
    const pasos=[
      paso('Elige una letra para eliminar: la y',`Multiplica la ecuación 1 por \\(${b2}\\) y la 2 por \\(${b1}\\):<br>\\(${lineal([[a1*b2,'x'],[b1*b2,'y']])} = ${c1*b2}\\)<br>\\(${lineal([[a2*b1,'x'],[b1*b2,'y']])} = ${c2*b1}\\)`,'Así la y tiene el mismo coeficiente en las dos y al restarlas desaparece.'),
      paso('Resta las ecuaciones',`\\((${a1*b2} - ${par(a2*b1)})x = ${c1*b2} - ${par(c2*b1)}\\ \\Rightarrow\\ ${c(det)}x = ${c(nx)}\\)`,'Restar miembro a miembro elimina la y.',{ojo:'Resta TODO el segundo lado, incluidos los signos.'}),
      paso('Despeja x',`\\(x = \\dfrac{${nx}}{${det}} = ${c(frac(nx,det))}\\)`,'Lo que multiplica a x pasa dividiendo.'),
      paso('Sustituye x en la ecuación 1 y despeja y',`\\(${a1}\\cdot${par(frac(nx,det))} + ${b1}y = ${c1}\\ \\Rightarrow\\ y = ${c(frac(ny,det))}\\)`,'Con una letra conocida, la otra sale de cualquiera de las dos ecuaciones.'),
      final('Comprueba en la ecuación 2',`\\(${a2}\\cdot${par(frac(nx,det))} + ${b2}\\cdot${par(frac(ny,det))} = ${c2}\\) ✓`,'La solución tiene que cumplir las dos ecuaciones.',`x = ${fx}, y = ${fy}`)
    ];
    const errores=[];
    if(!casi(x,y))errores.push({valor:`x = ${fy}, y = ${fx}`,si:e=>{const v=parXY(e);return !!v&&casi(v[0],y)&&casi(v[1],x)},por:'Intercambiaste los valores: escribe primero x y luego y.'});
    if(y!==0)errores.push({valor:`x = ${fx}, y = ${frac(-ny,det,{tex:false})}`,si:e=>{const v=parXY(e);return !!v&&casi(v[0],x)&&casi(v[1],-y)},por:'El valor de y tiene el signo cambiado: revisa la resta al eliminar.'});
    return {
      enunciado:`Resuelve el sistema (escribe x, y):\\[\\begin{cases} ${lineal([[a1,'x'],[b1,'y']])} = ${c1} \\\\ ${lineal([[a2,'x'],[b2,'y']])} = ${c2} \\end{cases}\\]`,
      respuesta:`x = ${fx}, y = ${fy}`,
      verificar:e=>{const v=parXY(e);return !!v&&casi(v[0],x)&&casi(v[1],y)},
      pasos,errores,regla:'Un sistema 2×2 se resuelve eliminando una incógnita (sumar o restar ecuaciones multiplicadas) o sustituyendo; la solución cumple las dos ecuaciones.',
      pista:'Multiplica las ecuaciones para que una letra tenga el mismo coeficiente y resta.',teclado:'mat'
    };
  }
};

// Factorización: factor común (1) → diferencia de cuadrados (2) → x²+bx+c (3) → ax²+bx+c (4) → factor común + trinomio (5)
const factorizacion={
  titulo:'Factorización',
  explicacion:'Factorizar es escribir una expresión como producto: primero el factor común; luego busca diferencia de cuadrados o dos números que sumen b y multipliquen c.',
  alternativa:'Factorizar es lo contrario de repartir. Si tienes 12 lápices y 18 borradores y los repartes en kits iguales, cada kit lleva 2 lápices y 3 borradores con 6 kits: 12 + 18 = 6·(2 + 3). Buscas "qué se repite" y lo sacas fuera del paréntesis. En un trinomio, buscas dos números que <b>multiplicados</b> den el último término y <b>sumados</b> den el del medio.',
  generar(n,rng){
    let exp,resp,errores=[],pasos,regla;
    const mal=(t,por)=>({valor:t,si:e=>equivalente(e,t),por});
    if(n===1){const k=rng.entero(2,9),m=rng.noCero(-9,9);exp=`${k}x ${sg(k*m)}`;resp=`${k}(x ${sg(m)})`;
      pasos=[paso('Busca el número que divide a los dos términos',`\\(${k}x\\) y \\(${k*m}\\) son múltiplos de \\(${c(k)}\\)`,'El factor común es lo que se repite en todos los términos.'),
        paso('Divide cada término entre el factor común',`\\(${k}x \\div ${k} = x\\), \\(${k*m} \\div ${k} = ${c(m)}\\)`,'Lo que queda de cada término va dentro del paréntesis.',{ojo:'Divide también el número, no solo la x.'}),
        final('Escribe el producto',`\\(${c(`${k}(x ${sg(m)})`)}\\)`,'ka + kb = k(a + b): comprueba multiplicando que vuelves al original.',resp)];
      regla='Factor común: saca lo que divide a todos los términos: ka + kb = k(a + b).';
      errores=[mal(`${k}(x ${sg(k*m)})`,`Al sacar el ${k}, divide también el número: ${k*m} ÷ ${k} = ${m}.`)]}
    else if(n===2){const cc=rng.prob(0.5)?1:rng.entero(2,5),a=rng.entero(1,12),cx=cc===1?'x':`${cc}x`;exp=`${cc===1?'':cc*cc}x^2 - ${a*a}`;resp=`(${cx} - ${a})(${cx} + ${a})`;
      pasos=[paso('Reconoce dos cuadrados restados',`\\(${cc===1?'':cc*cc}x^2 = (${c(cx)})^2\\) y \\(${a*a} = ${c(a)}^2\\)`,'Es una diferencia de cuadrados: algo al cuadrado menos otra cosa al cuadrado.'),
        paso('Usa la fórmula',`\\(a^2 - b^2 = (a - b)(a + b)\\) con \\(a = ${cx}\\), \\(b = ${a}\\)`,'Siempre se factoriza como (resta)(suma) de las bases.'),
        final('Escribe el producto',`\\(${c(resp)}\\)`,'Multiplicando, los términos del medio se cancelan y vuelves al original.',resp,{ojo:'No es (a − b)²: ese cuadrado tiene término del medio.'})];
      regla='Diferencia de cuadrados: a² − b² = (a − b)(a + b).';
      errores=[mal(`(${cx} - ${a})^2`,'Un cuadrado de binomio tiene término del medio: falta el factor con +.'),mal(`(${cx} + ${a})^2`,'Un factor lleva − y el otro +.')]}
    else if(n===3){let r1,r2;do{r1=rng.noCero(-9,9);r2=rng.noCero(-9,9)}while(r1===-r2);const b=-(r1+r2),cc=r1*r2;
      exp=polinomio([cc,b,1],{tex:false});resp=`(x ${sg(-r1)})(x ${sg(-r2)})`;
      pasos=[paso('Identifica b y c',`En \\(${polinomio([cc,b,1])}\\): \\(b = ${b}\\), \\(c = ${cc}\\)`,'En x² + bx + c buscas dos números relacionados con b y c.'),
        paso('Busca dos números: producto c, suma b',`\\(${c(-r1)}\\cdot${par(c(-r2))} = ${cc}\\) y \\(${-r1} + ${par(-r2)} = ${b}\\)`,'Prueba con los divisores de c y quédate con el par que sume b.',{ojo:'Cuida los signos: producto positivo → mismo signo; negativo → signos distintos.'}),
        final('Escribe los factores',`\\(${c(resp)}\\)`,'Cada número va sumado a la x en su paréntesis.',resp)];
      regla='Trinomio x² + bx + c: busca dos números que multipliquen c y sumen b; quedan (x + m)(x + n).';
      errores=[mal(`(x ${sg(r1)})(x ${sg(r2)})`,`Los signos están al revés: \\(${-r1}\\) y \\(${-r2}\\) suman \\(${b}\\).`)]}
    else if(n===4){const p=rng.entero(2,5),r=rng.noCero(-7,7);let q;do q=rng.noCero(-7,7);while(p*r+q===0||q===p*r);exp=polinomio([q*r,p*r+q,p],{tex:false});resp=`(${p}x ${sg(q)})(x ${sg(r)})`;
      pasos=[paso('Multiplica a·c',`\\(${p}\\cdot${par(q*r)} = ${c(p*q*r)}\\)`,'En ax² + bx + c se buscan dos números cuyo producto sea a·c.'),
        paso('Busca dos números: producto a·c, suma b',`\\(${c(p*r)}\\) y \\(${c(q)}\\): producto \\(${p*q*r}\\), suma \\(${p*r+q}\\)`,'Con ellos separas el término del medio en dos.'),
        paso('Separa el término del medio y agrupa',`\\(${p}x^2 ${sg(p*r)}x ${sg(q)}x ${sg(q*r)} = ${c(`${p}x(x ${sg(r)}) ${sg(q)}(x ${sg(r)})`)}\\)`,'Sacas factor común de cada pareja de términos.'),
        final('Saca el paréntesis común',`\\(${c(resp)}\\)`,'(x + r) aparece en los dos grupos: es el factor común.',resp)];
      regla='ax² + bx + c: busca dos números que multipliquen a·c y sumen b, separa bx con ellos y agrupa.';
      errores=[mal(`(${p}x ${sg(-q)})(x ${sg(-r)})`,'Los signos de los factores están cambiados.')]}
    else{const k=rng.entero(2,5);let r1,r2;do{r1=rng.noCero(-6,6);r2=rng.noCero(-6,6)}while(r1===-r2);
      exp=polinomio([k*r1*r2,-k*(r1+r2),k],{tex:false});resp=`${k}(x ${sg(-r1)})(x ${sg(-r2)})`;
      pasos=[paso('Saca el factor común',`\\(${c(k)}(${polinomio([r1*r2,-(r1+r2),1])})\\)`,`Los tres términos son múltiplos de ${k}.`),
        paso('Factoriza el trinomio de adentro',`Producto \\(${r1*r2}\\), suma \\(${-(r1+r2)}\\): \\(${-r1}\\) y \\(${-r2}\\)`,'Es un trinomio x² + bx + c.'),
        final('Junta todo',`\\(${c(resp)}\\)`,'El factor común queda delante de los dos paréntesis.',resp,{ojo:`No olvides el ${k} de adelante.`})];
      regla='Primero el factor común; después factoriza lo que queda dentro.';
      errores=[{si:e=>esProducto(e)&&equivalente(e,`(x ${sg(-r1)})(x ${sg(-r2)})`),por:`Falta el factor común ${k} al frente.`}]}
    errores.unshift({si:e=>!esProducto(e)&&equivalente(e,exp),por:'Eso es la misma expresión desarrollada: escríbela como producto (con paréntesis).'});
    return {enunciado:`Factoriza: \\(${texPot(exp)}\\)`,respuesta:resp,verificar:e=>esProducto(e)&&equivalente(e,exp),pasos,errores,regla,
      pista:n===2?'¿Es una resta de dos cuadrados?':n===1?'¿Qué número divide a los dos términos?':'Busca dos números: su producto y su suma.',teclado:'mat'};
  }
};

// Leyes de exponentes: producto (1), potencia de potencia (2), cociente (3), coeficiente (4), dos variables (5)
const exponentes={
  titulo:'Leyes de exponentes',
  explicacion:'Misma base: al multiplicar se suman los exponentes; al dividir se restan; una potencia de potencia los multiplica.',
  alternativa:'Un exponente cuenta cuántas veces multiplicas la base. \\(x^{3}\\cdot x^{2}\\) es \\((x\\cdot x\\cdot x)\\cdot(x\\cdot x)\\): cinco x en total, así que \\(x^{5}\\) (se suman). \\((x^{3})^{2}\\) es \\(x^{3}\\cdot x^{3}\\): seis x (se multiplican). Al dividir, las x de abajo cancelan x de arriba (se restan).',
  generar(n,rng){
    let enun,resp,errores=[],pasos,regla,vars=['x'];
    const mal=(t,por)=>({valor:t,si:e=>equivalente(e,t,{vars}),por});
    if(n===1){const a=rng.entero(2,12),b=rng.entero(2,12);enun=`x^{${a}} \\cdot x^{${b}}`;resp=`x^${a+b}`;regla='Producto de igual base: se suman los exponentes, xᵃ·xᵇ = xᵃ⁺ᵇ.';
      pasos=[paso('Fíjate que la base es la misma',`\\(x^{${a}}\\cdot x^{${b}}\\): las dos son potencias de x`,'Solo se combinan exponentes si la base es igual.'),
        paso('Suma los exponentes',`\\(x^{${a}+${b}} = x^{${c(a+b)}}\\)`,`Son ${a} x por ${b} x: ${a+b} x multiplicadas.`,{ojo:'No se multiplican los exponentes.'}),
        final('Resultado',`\\(x^{${a+b}}\\)`,'Producto de igual base: se suman los exponentes.',resp)];
      if(a*b!==a+b)errores=[mal(`x^${a*b}`,'Multiplicaste los exponentes: al multiplicar potencias de igual base se suman.')]}
    else if(n===2){const a=rng.entero(2,9),b=rng.entero(2,6);enun=`(x^{${a}})^{${b}}`;resp=`x^${a*b}`;regla='Potencia de una potencia: se multiplican los exponentes, (xᵃ)ᵇ = xᵃᵇ.';
      pasos=[paso('Es una potencia elevada a otra',`\\((x^{${a}})^{${b}} = ${Array(Math.min(b,4)).fill(`x^{${a}}`).join('\\cdot ')}${b>4?'\\cdots':''}\\)`,`Es multiplicar \\(x^{${a}}\\) por sí misma ${b} veces.`),
        paso('Multiplica los exponentes',`\\(x^{${a}\\cdot${b}} = x^{${c(a*b)}}\\)`,`${b} grupos de ${a} x son ${a*b} x.`,{ojo:'Aquí no se suman: se multiplican.'}),
        final('Resultado',`\\(x^{${a*b}}\\)`,'Potencia de potencia: se multiplican los exponentes.',resp)];
      if(a*b!==a+b)errores=[mal(`x^${a+b}`,'Sumaste los exponentes: en una potencia de potencia se multiplican.')]}
    else if(n===3){const a=rng.entero(2,9);let b;do b=rng.entero(2,9);while(b===a);enun=`\\dfrac{x^{${a}}}{x^{${b}}}`;resp=`x^${a-b}`;regla='Cociente de igual base: se restan los exponentes, xᵃ/xᵇ = xᵃ⁻ᵇ (y x⁻ⁿ = 1/xⁿ).';
      pasos=[paso('Misma base arriba y abajo',`\\(\\dfrac{x^{${a}}}{x^{${b}}}\\)`,'Cada x de abajo cancela una x de arriba.'),
        paso('Resta los exponentes (arriba menos abajo)',`\\(x^{${a}-${b}} = x^{${c(a-b)}}\\)`,'Al dividir potencias de igual base se restan los exponentes.',{ojo:'Es el de arriba menos el de abajo, en ese orden.'}),
        final('Resultado',a-b<0?`\\(x^{${a-b}} = \\dfrac{1}{x^{${b-a}}}\\)`:`\\(x^{${a-b}}\\)`,'Un exponente negativo significa que la x queda abajo.',resp)];
      errores=[mal(`x^${a+b}`,'Al dividir potencias de igual base se restan los exponentes.'),mal(`x^${b-a}`,'Es el exponente de arriba menos el de abajo.')]}
    else if(n===4){const k=rng.entero(2,5),a=rng.entero(2,6),b=rng.entero(2,3);enun=`(${k}x^{${a}})^{${b}}`;resp=`${k**b}x^${a*b}`;regla='La potencia afecta a cada factor: (kxᵃ)ᵇ = kᵇ·xᵃᵇ.';
      pasos=[paso('La potencia afecta a cada factor',`\\((${k}x^{${a}})^{${b}} = ${k}^{${b}}\\cdot(x^{${a}})^{${b}}\\)`,'Elevar un producto es elevar cada factor.'),
        paso('Eleva el coeficiente',`\\(${k}^{${b}} = ${c(k**b)}\\)`,`Es ${Array(b).fill(k).join('·')}.`,{ojo:`No es ${k}·${b}.`}),
        paso('Multiplica los exponentes de x',`\\((x^{${a}})^{${b}} = x^{${c(a*b)}}\\)`,'Potencia de potencia.'),
        final('Junta',`\\(${k**b}x^{${a*b}}\\)`,'Coeficiente elevado por la x con su exponente.',resp)];
      errores=[mal(`${k}x^${a*b}`,`El ${k} también se eleva a ${b}: \\(${k}^{${b}} = ${k**b}\\).`)];if(k*b!==k**b)errores.push(mal(`${k*b}x^${a*b}`,`\\(${k}^{${b}}\\) no es \\(${k}\\cdot${b}\\).`))}
    else{vars=['x','y'];const m=rng.entero(2,4),k=m*rng.entero(2,4),a=rng.entero(3,7),cc=rng.entero(1,a-1),b=rng.entero(1,4);let d;do d=rng.entero(1,5);while(d===b);
      enun=`\\dfrac{${k}x^{${a}}y^{${b}}}{${m}x^{${cc}}y^{${d}}}`;const ey=b-d;resp=`${k/m}x^${a-cc}y^${ey}`;
      regla='Divide los coeficientes y resta los exponentes de cada letra por separado.';
      pasos=[paso('Divide los coeficientes',`\\(${k} \\div ${m} = ${c(k/m)}\\)`,'Los números se dividen como siempre.'),
        paso('Resta los exponentes de x',`\\(x^{${a}-${cc}} = x^{${c(a-cc)}}\\)`,'Misma base: arriba menos abajo.'),
        paso('Resta los exponentes de y',`\\(y^{${b}-${d}} = y^{${c(ey)}}\\)`,'Cada letra se trabaja por separado.',ey<0?{ojo:'Un exponente negativo deja la y abajo: está bien.'}:{}),
        final('Junta todo',`\\(${k/m}x^{${a-cc}}y^{${ey}}\\)`,'Coeficiente y cada letra con su exponente.',resp)];
      errores=[mal(`${k/m}x^${a-cc}y^${-ey}`,'En y, es el exponente de arriba menos el de abajo.')]}
    return {enunciado:`Simplifica: \\(${enun}\\)`,respuesta:resp,verificar:e=>equivalente(e,resp,{vars}),pasos,errores,regla,pista:'Misma base: ¿multiplicas, divides o elevas?',teclado:'mat'};
  }
};

export default {'alg/sistema-2x2':sistema,'alg/factorizacion':factorizacion,'alg/exponentes':exponentes};
