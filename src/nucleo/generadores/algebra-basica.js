/* Generadores de álgebra básica: sistemas 2×2, factorización y leyes de exponentes. */
import {num,lista,casi,equivalente,limpiar} from './verificar.js';
import {lineal,frac,par,polinomio} from './formato.js';

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
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='(')p++;else if(c===')')p--;else if((c==='+'||c==='-')&&p===0&&i>0&&s[i-1]!=='^')return false}
  return true;
}
const sg=n=>n<0?`- ${-n}`:`+ ${n}`;
const texPot=s=>s.replace(/\^(-?\d+)/g,'^{$1}');

// Sistemas 2×2 con solución entera (1–4) o fraccionaria (5)
const sistema={
  titulo:'Sistemas 2×2',
  explicacion:'Busca x e y que cumplan las dos ecuaciones a la vez: por sustitución, por eliminación o con determinantes.',
  generar(n,rng){
    const R=n<=1?4:n<=3?6:9;let a1,b1,a2,b2,det;
    do{a1=n===1?1:rng.noCero(-R,R);b1=rng.noCero(-R,R);a2=rng.noCero(-R,R);b2=n<=2?rng.entero(1,R):rng.noCero(-R,R);det=a1*b2-a2*b1}while(det===0||Math.abs(det)>40||(n===5&&Math.abs(det)<2));
    let c1,c2;
    if(n<5){const x=rng.entero(-6,6),y=rng.entero(-6,6);c1=a1*x+b1*y;c2=a2*x+b2*y}
    else do{c1=rng.entero(-20,20);c2=rng.entero(-20,20)}while((c1*b2-c2*b1)%det===0&&(a1*c2-a2*c1)%det===0);
    const nx=c1*b2-c2*b1,ny=a1*c2-a2*c1,x=nx/det,y=ny/det;
    const fx=frac(nx,det,{tex:false}),fy=frac(ny,det,{tex:false});
    const errores=[];
    if(!casi(x,y))errores.push({valor:`x = ${fy}, y = ${fx}`,si:e=>{const v=parXY(e);return !!v&&casi(v[0],y)&&casi(v[1],x)},por:'Intercambiaste los valores: escribe primero x y luego y.'});
    if(y!==0)errores.push({valor:`x = ${fx}, y = ${frac(-ny,det,{tex:false})}`,si:e=>{const v=parXY(e);return !!v&&casi(v[0],x)&&casi(v[1],-y)},por:'El valor de y tiene el signo cambiado: revisa la resta al eliminar.'});
    return {
      enunciado:`Resuelve el sistema (escribe x, y):\\[\\begin{cases} ${lineal([[a1,'x'],[b1,'y']])} = ${c1} \\\\ ${lineal([[a2,'x'],[b2,'y']])} = ${c2} \\end{cases}\\]`,
      respuesta:`x = ${fx}, y = ${fy}`,
      verificar:e=>{const v=parXY(e);return !!v&&casi(v[0],x)&&casi(v[1],y)},
      pasos:[`Determinante: \\(D = (${a1})(${b2}) - (${a2})(${b1}) = ${det}\\)`,
        `\\(x = \\dfrac{${c1}\\cdot${par(b2)} - ${c2}\\cdot${par(b1)}}{${det}} = ${frac(nx,det)}\\)`,
        `\\(y = \\dfrac{${a1}\\cdot${par(c2)} - ${a2}\\cdot${par(c1)}}{${det}} = ${frac(ny,det)}\\)`],
      errores,regla:'Un sistema 2×2 se resuelve eliminando una incógnita (sumar o restar ecuaciones multiplicadas) o sustituyendo; la solución cumple las dos ecuaciones.',
      pista:'Multiplica una ecuación para que, al sumarlas, se elimine una letra.',teclado:'mat'
    };
  }
};

// Factorización: factor común (1) → diferencia de cuadrados (2) → x²+bx+c (3) → ax²+bx+c (4) → factor común + trinomio (5)
const factorizacion={
  titulo:'Factorización',
  explicacion:'Factorizar es escribir una expresión como producto: primero el factor común; luego busca diferencia de cuadrados o dos números que sumen b y multipliquen c.',
  generar(n,rng){
    let exp,resp,errores=[],pasos,regla;
    const mal=(t,por)=>({valor:t,si:e=>equivalente(e,t),por});
    if(n===1){const k=rng.entero(2,9),m=rng.noCero(-9,9);exp=`${k}x ${sg(k*m)}`;resp=`${k}(x ${sg(m)})`;
      pasos=[`\\(${k}\\) divide a \\(${k}x\\) y a \\(${k*m}\\): es el factor común`,`\\(${k}(x ${sg(m)})\\)`];regla='Factor común: saca lo que divide a todos los términos: ka + kb = k(a + b).';
      errores=[mal(`${k}(x ${sg(k*m)})`,`Al sacar el ${k}, divide también el número: ${k*m} ÷ ${k} = ${m}.`)]}
    else if(n===2){const c=rng.prob(0.5)?1:rng.entero(2,5),a=rng.entero(1,12),cx=c===1?'x':`${c}x`;exp=`${c===1?'':c*c}x^2 - ${a*a}`;resp=`(${cx} - ${a})(${cx} + ${a})`;
      pasos=[`\\(${c===1?'':c*c}x^2 = (${cx})^2\\) y \\(${a*a} = ${a}^2\\): es una diferencia de cuadrados`,`\\(a^2 - b^2 = (a - b)(a + b)\\)`,`\\((${cx} - ${a})(${cx} + ${a})\\)`];regla='Diferencia de cuadrados: a² − b² = (a − b)(a + b).';
      errores=[mal(`(${cx} - ${a})^2`,'Un cuadrado de binomio tiene término del medio: falta el factor con +.'),mal(`(${cx} + ${a})^2`,'Un factor lleva − y el otro +.')]}
    else if(n===3){let r1,r2;do{r1=rng.noCero(-9,9);r2=rng.noCero(-9,9)}while(r1===-r2);const b=-(r1+r2),c=r1*r2;
      exp=polinomio([c,b,1],{tex:false});resp=`(x ${sg(-r1)})(x ${sg(-r2)})`;
      pasos=[`Dos números que multiplicados den \\(${c}\\) y sumados \\(${b}\\): \\(${-r1}\\) y \\(${-r2}\\)`,`\\((x ${sg(-r1)})(x ${sg(-r2)})\\)`];
      regla='Trinomio x² + bx + c: busca dos números que multipliquen c y sumen b; quedan (x + m)(x + n).';
      errores=[mal(`(x ${sg(r1)})(x ${sg(r2)})`,`Los signos están al revés: \\(${-r1}\\) y \\(${-r2}\\) suman \\(${b}\\).`)]}
    else if(n===4){const p=rng.entero(2,5),r=rng.noCero(-7,7);let q;do q=rng.noCero(-7,7);while(p*r+q===0||q===p*r);exp=polinomio([q*r,p*r+q,p],{tex:false});resp=`(${p}x ${sg(q)})(x ${sg(r)})`;
      pasos=[`a·c = \\(${p}\\cdot${par(q*r)} = ${p*q*r}\\); dos números que den eso y sumen \\(${p*r+q}\\): \\(${p*r}\\) y \\(${q}\\)`,`Agrupa: \\(${p}x(x ${sg(r)}) ${sg(q)}(x ${sg(r)})\\)`,`\\((${p}x ${sg(q)})(x ${sg(r)})\\)`];
      regla='ax² + bx + c: busca dos números que multipliquen a·c y sumen b, separa bx con ellos y agrupa.';
      errores=[mal(`(${p}x ${sg(-q)})(x ${sg(-r)})`,'Los signos de los factores están cambiados.')]}
    else{const k=rng.entero(2,5);let r1,r2;do{r1=rng.noCero(-6,6);r2=rng.noCero(-6,6)}while(r1===-r2);
      exp=polinomio([k*r1*r2,-k*(r1+r2),k],{tex:false});resp=`${k}(x ${sg(-r1)})(x ${sg(-r2)})`;
      pasos=[`Factor común: \\(${k}(${polinomio([r1*r2,-(r1+r2),1])})\\)`,`Dentro: dos números que multipliquen \\(${r1*r2}\\) y sumen \\(${-(r1+r2)}\\)`,`\\(${k}(x ${sg(-r1)})(x ${sg(-r2)})\\)`];
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
  generar(n,rng){
    let enun,resp,errores=[],pasos,regla,vars=['x'];
    const mal=(t,por)=>({valor:t,si:e=>equivalente(e,t,{vars}),por});
    if(n===1){const a=rng.entero(2,7),b=rng.entero(2,7);enun=`x^{${a}} \\cdot x^{${b}}`;resp=`x^${a+b}`;regla='Producto de igual base: se suman los exponentes, xᵃ·xᵇ = xᵃ⁺ᵇ.';
      pasos=[`Misma base: suma los exponentes \\(${a} + ${b}\\)`,`\\(x^{${a+b}}\\)`];if(a*b!==a+b)errores=[mal(`x^${a*b}`,'Multiplicaste los exponentes: al multiplicar potencias de igual base se suman.')]}
    else if(n===2){const a=rng.entero(2,9),b=rng.entero(2,6);enun=`(x^{${a}})^{${b}}`;resp=`x^${a*b}`;regla='Potencia de una potencia: se multiplican los exponentes, (xᵃ)ᵇ = xᵃᵇ.';
      pasos=[`Potencia de potencia: multiplica \\(${a}\\cdot${b}\\)`,`\\(x^{${a*b}}\\)`];if(a*b!==a+b)errores=[mal(`x^${a+b}`,'Sumaste los exponentes: en una potencia de potencia se multiplican.')]}
    else if(n===3){const a=rng.entero(2,9);let b;do b=rng.entero(2,9);while(b===a);enun=`\\dfrac{x^{${a}}}{x^{${b}}}`;resp=`x^${a-b}`;regla='Cociente de igual base: se restan los exponentes, xᵃ/xᵇ = xᵃ⁻ᵇ (y x⁻ⁿ = 1/xⁿ).';
      pasos=[`Resta los exponentes: \\(${a} - ${b} = ${a-b}\\)`,a-b<0?`\\(x^{${a-b}} = \\dfrac{1}{x^{${b-a}}}\\)`:`\\(x^{${a-b}}\\)`];
      errores=[mal(`x^${a+b}`,'Al dividir potencias de igual base se restan los exponentes.'),mal(`x^${b-a}`,'Es el exponente de arriba menos el de abajo.')]}
    else if(n===4){const k=rng.entero(2,5),a=rng.entero(2,6),b=rng.entero(2,3);enun=`(${k}x^{${a}})^{${b}}`;resp=`${k**b}x^${a*b}`;regla='La potencia afecta a cada factor: (kxᵃ)ᵇ = kᵇ·xᵃᵇ.';
      pasos=[`El coeficiente también se eleva: \\(${k}^{${b}} = ${k**b}\\)`,`\\(x^{${a}\\cdot${b}} = x^{${a*b}}\\)`,`\\(${k**b}x^{${a*b}}\\)`];
      errores=[mal(`${k}x^${a*b}`,`El ${k} también se eleva a ${b}: \\(${k}^{${b}} = ${k**b}\\).`)];if(k*b!==k**b)errores.push(mal(`${k*b}x^${a*b}`,`\\(${k}^{${b}}\\) no es \\(${k}\\cdot${b}\\).`))}
    else{vars=['x','y'];const m=rng.entero(2,4),k=m*rng.entero(2,4),a=rng.entero(3,7),c=rng.entero(1,a-1),b=rng.entero(1,4);let d;do d=rng.entero(1,5);while(d===b);
      enun=`\\dfrac{${k}x^{${a}}y^{${b}}}{${m}x^{${c}}y^{${d}}}`;const ey=b-d;resp=`${k/m}x^${a-c}y^${ey}`;
      regla='Divide los coeficientes y resta los exponentes de cada letra por separado.';
      pasos=[`Coeficientes: \\(${k} \\div ${m} = ${k/m}\\)`,`x: \\(${a} - ${c} = ${a-c}\\); y: \\(${b} - ${d} = ${ey}\\)`,`\\(${k/m}x^{${a-c}}y^{${ey}}\\)`];
      errores=[mal(`${k/m}x^${a-c}y^${-ey}`,'En y, es el exponente de arriba menos el de abajo.')]}
    return {enunciado:`Simplifica: \\(${enun}\\)`,respuesta:resp,verificar:e=>equivalente(e,resp,{vars}),pasos,errores,regla,pista:'Misma base: ¿multiplicas, divides o elevas?',teclado:'mat'};
  }
};

export default {'alg/sistema-2x2':sistema,'alg/factorizacion':factorizacion,'alg/exponentes':exponentes};
