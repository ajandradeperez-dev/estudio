/* Generadores del tema Álgebra (parte 1): expresiones, desigualdades, productos notables y ecuaciones cuadráticas.
   Cada nivel tiene 3 plantillas (p.plantilla: los básicos se retiran por plantilla) y cada pregunta trae comprobar():
   un segundo cálculo independiente (sustituir, probar puntos) que npm run revisar exige que dé true. Sin DOM. */
import {num,casi,equivalente,limpiar,igualNum,compilar} from './verificar.js';
import {lineal,polinomio,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';

// ---------- utilidades comunes (también las usan algebra-temas2.js y aplicaciones.js) ----------
export const T=s=>String(s).replace(/\^(-?\d+)/g,'^{$1}');                  // texto → TeX (x^2 → x^{2})
export const sg=n=>n<0?`- ${-n}`:`+ ${n}`;
export const plantillas=(rng,ps)=>{const k=rng.elegir(Object.keys(ps));return {...ps[k](),plantilla:k}};
export const mal=(valor,por,o={})=>({valor,si:e=>equivalente(e,valor,o),por});
// Número como texto: entero, fracción con denominador ≤ 12 o 4 decimales
export const numTxt=v=>{if(Math.abs(v-Math.round(v))<1e-9)return String(Math.round(v));for(let d=2;d<=12;d++){const k=Math.round(v*d);if(Math.abs(v*d-k)<1e-9)return `${k}/${d}`}return String(+v.toFixed(4))};
export const malNum=(v,por)=>({valor:numTxt(v),si:e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-v)<=1e-3*Math.max(1,Math.abs(v))},por});
// Términos al nivel de afuera de una expresión ("3x^2 - 2x + 1" → 3); sirve para pedir la forma simplificada
export function terminos(e){
  const s=limpiar(e).replace(/\s/g,'');let n=s?1:0,p=0;
  for(let i=1;i<s.length;i++){const ch=s[i];if(ch==='(')p++;else if(ch===')')p--;else if((ch==='+'||ch==='-')&&p===0&&!'^*/('.includes(s[i-1]))n++}
  return n;
}
// Respuesta simplificada: equivalente, sin paréntesis y con no más términos que la respuesta esperada
export const simplificada=(e,resp,o={})=>!/[()]/.test(limpiar(e))&&terminos(e)<=terminos(resp)&&equivalente(e,resp,o);
const R_SEM='Solo se juntan términos semejantes (misma letra y mismo exponente): se suman los coeficientes y la parte literal se conserva.';
const R_DIS='Distributiva: a(b + c) = ab + ac. Un signo menos delante del paréntesis cambia el signo de cada término de adentro.';

/* ---------- Expresiones: términos semejantes, distributiva, evaluar ---------- */
const expresiones={
  titulo:'Términos semejantes y propiedad distributiva',
  explicacion:'Junta solo los términos con la misma letra y el mismo exponente (se suman los coeficientes). Para quitar un paréntesis, multiplica lo de afuera por cada término de adentro.',
  alternativa:'Piensa en frutas: 3 manzanas + 5 manzanas = 8 manzanas, pero 3 manzanas + 5 peras no se juntan. La x y la y son frutas distintas, y x² es otra fruta distinta de x. Un número delante de un paréntesis son "bolsas iguales": 3(x + 4) son 3 bolsas con una x y 4 unidades, o sea 3x + 12.',
  referencia:'Ver: Baldor, Álgebra, cap. 1 a 3 (términos semejantes y multiplicación).',
  profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);let vars=['x'];
    const P={
      1:{
        'semejantes-x':()=>{let a,b,d;do{a=r(-9,9);b=r(-9,9);d=r(-9,9)}while(a+b+d===0||a+b+d===1);const s=a+b+d,e=lineal([[a,'x'],[b,'x'],[d,'x']]);
          return {e,resp:`${s}x`,regla:R_SEM,pasos:[paso('Los tres términos tienen x',`\\(${e}\\)`,'Son semejantes: misma letra, mismo exponente.'),
            final('Suma los coeficientes',`\\(${a} ${sg(b)} ${sg(d)} = ${c(s)}\\ \\Rightarrow\\ ${s}x\\)`,'La x se conserva; solo se suman los números de adelante.',`${s}x`)],
            errores:[mal(`${Math.abs(a)+Math.abs(b)+Math.abs(d)}x`,'Ignoraste los signos: un término con − se resta.'),mal(`${s}`,'La parte literal se conserva: no se pierde la x.'),mal(`${s}x^3`,'Al sumar términos no se suman los exponentes: x + x = 2x, no x².')],
            comprobar:()=>equivalente(e,`${s}x`)}},
        'semejantes-dos':()=>{vars=['x','y'];let a,b,d,f;do{a=r(-8,8);b=r(-8,8);d=r(-8,8);f=r(-8,8)}while(a+d===0||b+f===0||f===0);
          const e=lineal([[a,'x'],[b,'y'],[d,'x'],[f,'y']]),resp=lineal([[a+d,'x'],[b+f,'y']]);
          return {e,resp,regla:R_SEM,pasos:[paso('Agrupa los términos de cada letra',`\\((${lineal([[a,'x'],[d,'x']])}) + (${lineal([[b,'y'],[f,'y']])})\\)`,'Las x van con las x y las y con las y.'),
            final('Suma los coeficientes de cada grupo',`\\(${c(resp)}\\)`,'x e y no son semejantes: quedan como dos términos.',resp)],
            errores:[mal(`${a+b+d+f}xy`,'x e y no son semejantes: no se pueden juntar en un solo término.'),mal(lineal([[a+d,'x'],[b-f,'y']]),'Revisa el signo del último término en y.'),mal(lineal([[a+d,'x']]),'Te faltó el grupo de las y.')],
            comprobar:()=>equivalente(e,resp,{vars:['x','y']})}},
        'evaluar':()=>{const a=r(-9,9),b=r(-12,12),k=r(-6,6),v=a*k+b,e=lineal([[a,'x'],[b,'']]);
          return {enunciado:`Calcula el valor de \\(${e}\\) cuando \\(x = ${k}\\)`,resp:String(v),num:v,regla:'Para evaluar, cambia la letra por su valor (entre paréntesis si es negativo) y respeta el orden: primero multiplicar, luego sumar.',
            pasos:[paso('Sustituye x por su valor',`\\(${a}\\cdot${par(k)} ${sg(b)}\\)`,'Pon el número entre paréntesis si es negativo.'),final('Calcula',`\\(${a*k} ${sg(b)} = ${c(v)}\\)`,'Primero la multiplicación, después la suma.',String(v))],
            errores:[malNum(a+k+b,'Sumaste el valor de x; ax significa a por x.'),malNum(a*k,`Te faltó sumar el ${b}.`),malNum(-a*k+b,'Revisa el signo de la multiplicación.')],
            comprobar:()=>casi(compilar(e)({x:k}),v)}}
      },
      2:{
        'distributiva':()=>{const a=rng.entero(2,9)*rng.signo(),b=r(-9,9),e=`${a}(${lineal([[1,'x'],[b,'']])})`,resp=lineal([[a,'x'],[a*b,'']]);
          return {e,resp,regla:R_DIS,pasos:[paso(`Multiplica el ${a} por cada término`,`\\(${a}\\cdot x ${a*b<0?'-':'+'} ${a}\\cdot${par(b)}\\)`,'Lo de afuera multiplica a todo lo de adentro.',{ojo:`El ${a} también multiplica al ${b}.`}),
            final('Calcula',`\\(${c(resp)}\\)`,'Cuida los signos: menos por menos da más.',resp)],
            errores:[mal(lineal([[a,'x'],[b,'']]),`El ${a} también multiplica al ${b}.`),mal(lineal([[a,'x'],[-a*b,'']]),`Signo: ${a}·(${b}) = ${a*b}.`),mal(lineal([[1,'x'],[a*b,'']]),`El ${a} también multiplica a la x.`)],
            comprobar:()=>equivalente(e,resp)}},
        'menos-parentesis':()=>{let a,b,d;do{a=rng.entero(2,9);b=r(-9,9);d=r(-12,12)}while(d===b||d===a);const e=`${d} - (${lineal([[a,'x'],[b,'']])})`,resp=lineal([[-a,'x'],[d-b,'']]);
          return {e,resp,regla:R_DIS,pasos:[paso('El menos cambia el signo de cada término del paréntesis',`\\(${d} ${c(lineal([[-a,'x'],[-b,'']]).replace(/^-/,'- '))}\\)`,'−(a + b) = −a − b.',{ojo:'Cambia el signo de TODOS los términos, no solo del primero.'}),
            final('Junta los números',`\\(${c(resp)}\\)`,'Los números sueltos son semejantes entre sí.',resp)],
            errores:[mal(lineal([[-a,'x'],[d+b,'']]),`El menos también cambia el signo del ${b}.`),mal(lineal([[a,'x'],[d-b,'']]),'El menos también cambia el signo del término con x.'),mal(lineal([[d-a,'x'],[-b,'']]),`El ${d} no es semejante a ${a}x: no se pueden juntar.`)],
            comprobar:()=>equivalente(e,resp)}},
        'evaluar-cuadratico':()=>{const a=r(-4,4),b=r(-6,6),d=r(-9,9),k=rng.elegir([-3,-2,-1,2,3]),v=a*k*k+b*k+d,e=polinomio([d,b,a],{tex:false});
          return {enunciado:`Calcula el valor de \\(${T(e)}\\) cuando \\(x = ${k}\\)`,resp:String(v),num:v,regla:'Al evaluar, primero las potencias: (−3)² = 9. Pon los negativos entre paréntesis.',
            pasos:[paso('Sustituye x (entre paréntesis)',`\\(${a}\\cdot${par(k)}^{2} ${sg(b)}\\cdot${par(k)} ${sg(d)}\\)`,'Así no te equivocas con los signos.'),
              paso('Calcula la potencia',`\\(${par(k)}^{2} = ${c(k*k)}\\)`,'Un número negativo al cuadrado da positivo.',{ojo:`\\(${par(k)}^{2}\\) no es \\(${-k*k}\\).`}),
              final('Multiplica y suma',`\\(${a*k*k} ${sg(b*k)} ${sg(d)} = ${c(v)}\\)`,'Primero multiplicaciones, después sumas.',String(v))],
            errores:[malNum(-a*k*k+b*k+d,`\\(${par(k)}^{2} = ${k*k}\\), positivo.`),malNum(2*a*k+b*k+d,'x² es x por x, no 2 por x.'),malNum(a*k*k+b*k,`Te faltó sumar el ${d}.`)],
            comprobar:()=>casi(v,a*Math.pow(k,2)+b*k+d)}}
      },
      3:{
        'distribuir-y-juntar':()=>{let a,b,d,f;do{a=rng.entero(2,7)*rng.signo();b=r(-8,8);d=r(-8,8);f=r(-12,12)}while(a+d===0||a*b+f===0);
          const e=`${a}(${lineal([[1,'x'],[b,'']])}) ${sg(d).replace(/(\d+)$/,'$1x').replace(/ 1x$/,' x')} ${sg(f)}`,resp=lineal([[a+d,'x'],[a*b+f,'']]);
          return {e,resp,regla:R_DIS,pasos:[paso('Quita el paréntesis',`\\(${c(lineal([[a,'x'],[a*b,'']]))} ${sg(d).replace(/(\d+)$/,'$1x').replace(/ 1x$/,' x')} ${sg(f)}\\)`,'Distributiva: multiplica por cada término.'),
            paso('Agrupa semejantes',`\\((${lineal([[a,'x'],[d,'x']])}) + (${lineal([[a*b,''],[f,'']])})\\)`,'x con x y números con números.'),
            final('Simplifica',`\\(${c(resp)}\\)`,'Suma los coeficientes de cada grupo.',resp)],
            errores:[mal(lineal([[a+d,'x'],[b+f,'']]),`El ${a} también multiplica al ${b}.`),mal(`${a+d+a*b+f}x`,'Los números sueltos no se juntan con los términos en x.'),mal(lineal([[a-d,'x'],[a*b+f,'']]),'Revisa el signo del término en x.')],
            comprobar:()=>equivalente(e,resp)}},
        'dos-parentesis':()=>{let a,b,d,f;do{a=rng.entero(2,9);d=rng.entero(2,9);b=r(-8,8);f=r(-8,8)}while(a===d||a*b-d*f===0);
          const e=`${a}(${lineal([[1,'x'],[b,'']])}) - ${d}(${lineal([[1,'x'],[f,'']])})`,resp=lineal([[a-d,'x'],[a*b-d*f,'']]);
          return {e,resp,regla:R_DIS,pasos:[paso('Quita los dos paréntesis',`\\(${lineal([[a,'x'],[a*b,'']])} ${c(lineal([[-d,'x'],[-d*f,'']]).replace(/^-/,'- '))}\\)`,'El −'+d+' multiplica a los dos términos del segundo paréntesis.',{ojo:`\\(-${d}\\cdot${par(f)} = ${-d*f}\\)`}),
            final('Junta semejantes',`\\(${c(resp)}\\)`,'x con x y números con números.',resp)],
            errores:[mal(lineal([[a-d,'x'],[a*b+d*f,'']]),`El −${d} también multiplica al ${f}: cambia su signo.`),mal(lineal([[a+d,'x'],[a*b-d*f,'']]),`Es ${a}x − ${d}x, no una suma.`),mal(lineal([[a-d,'x'],[b-f,'']]),'Te faltó multiplicar los números de adentro.')],
            comprobar:()=>equivalente(e,resp)}},
        'cuadraticos':()=>{let a,b,d,f;do{a=r(-7,7);b=r(-7,7);d=r(-7,7);f=r(-7,7)}while(a+d===0||b+f===0);
          const e=lineal([[a,'x^2'],[b,'x'],[d,'x^2'],[f,'x']]),resp=lineal([[a+d,'x^2'],[b+f,'x']]);
          return {e:e,resp,regla:R_SEM,pasos:[paso('Agrupa por exponente',`\\((${T(lineal([[a,'x^2'],[d,'x^2']]))}) + (${lineal([[b,'x'],[f,'x']])})\\)`,'x² y x NO son semejantes: tienen distinto exponente.'),
            final('Suma coeficientes',`\\(${c(T(resp))}\\)`,'Cada grupo conserva su parte literal.',resp)],
            errores:[mal(`${a+b+d+f}x^2`,'x² y x no son semejantes.'),mal(lineal([[a+d,'x^4'],[b+f,'x^2']]),'Al sumar no se suman los exponentes.'),mal(lineal([[a+d,'x^2'],[b-f,'x']]),'Revisa el signo del último término.')],
            comprobar:()=>equivalente(e,resp)}}
      },
      4:{
        'binomio-por-binomio':()=>{let a,b;do{a=r(-9,9);b=r(-9,9)}while(a+b===0);const e=`(${lineal([[1,'x'],[a,'']])})(${lineal([[1,'x'],[b,'']])})`,resp=polinomio([a*b,a+b,1],{tex:false});
          return {e,resp,regla:'Para multiplicar dos binomios, multiplica cada término del primero por cada término del segundo y junta semejantes.',
            pasos:[paso('Multiplica todos contra todos',`\\(x\\cdot x ${sg(b)}x ${sg(a)}x ${sg(a*b)}\\)`,'Son 4 productos: primeros, externos, internos y últimos.'),
              final('Junta los términos en x',`\\(${c(T(resp))}\\)`,`\\(${b}x ${sg(a)}x = ${a+b}x\\).`,resp)],
            errores:[mal(polinomio([a*b,0,1],{tex:false}),'Faltan los productos cruzados (el término en x).'),mal(polinomio([a+b,a*b,1],{tex:false}),'Intercambiaste: el término en x es la suma y el número suelto es el producto.'),mal(polinomio([-a*b,a+b,1],{tex:false}),`El último término es \\(${a}\\cdot${par(b)} = ${a*b}\\).`)],
            comprobar:()=>equivalente(e,resp)}},
        'monomio-por-binomio':()=>{const a=rng.entero(2,6)*rng.signo(),b=rng.entero(1,6),d=r(-9,9),e=`${a}x(${lineal([[b,'x'],[d,'']])})`,resp=lineal([[a*b,'x^2'],[a*d,'x']]);
          return {e,resp,regla:'Al multiplicar potencias de la misma base se suman los exponentes: x·x = x².',
            pasos:[paso(`Multiplica ${a}x por cada término`,`\\((${a}x)\\cdot(${b===1?'':b}x) + (${a}x)\\cdot${par(d)}\\)`,'Distributiva.'),
              final('Calcula',`\\(${c(T(resp))}\\)`,'x·x = x² y los coeficientes se multiplican.',resp)],
            errores:[mal(`${a*b+a*d}x`,'x·x es x², no x.'),mal(lineal([[a*b,'x^2'],[d,'']]),`El ${a}x también multiplica al ${d}.`),mal(lineal([[a*b,'x'],[a*d,'x']]),'x·x = x².')],
            comprobar:()=>equivalente(e,resp)}},
        'dos-variables':()=>{vars=['x','y'];let a,b,p,q,s,t;do{a=rng.entero(2,6);b=rng.entero(2,6);p=r(-5,5);q=r(-5,5);s=r(-5,5);t=r(-5,5)}while(a*p-b*s===0||a*q-b*t===0||t===0);
          const e=`${a}(${lineal([[p,'x'],[q,'y']])}) - ${b}(${lineal([[s,'x'],[t,'y']])})`,resp=lineal([[a*p-b*s,'x'],[a*q-b*t,'y']]);
          return {e,resp,regla:R_DIS,pasos:[paso('Quita los paréntesis',`\\(${lineal([[a*p,'x'],[a*q,'y']])} ${c(lineal([[-b*s,'x'],[-b*t,'y']]).replace(/^-/,'- '))}\\)`,`El −${b} cambia el signo de los dos términos.`),
            final('Junta x con x e y con y',`\\(${c(resp)}\\)`,'Cada letra por separado.',resp)],
            errores:[mal(lineal([[a*p-b*s,'x'],[a*q+b*t,'y']]),`El −${b} también multiplica al término en y.`),mal(lineal([[p-s,'x'],[q-t,'y']]),'Te faltó multiplicar por los números de afuera.'),mal(lineal([[a*p+b*s,'x'],[a*q-b*t,'y']]),'Revisa el signo del término en x.')],
            comprobar:()=>equivalente(e,resp,{vars:['x','y']})}}
      },
      5:{
        'binomios-coef':()=>{let a,b,d,f;do{a=rng.entero(2,5)*rng.signo();b=r(-7,7);d=rng.entero(2,5);f=r(-7,7)}while(a*f+b*d===0);
          const e=`(${lineal([[a,'x'],[b,'']])})(${lineal([[d,'x'],[f,'']])})`,resp=polinomio([b*f,a*f+b*d,a*d],{tex:false});
          return {e,resp,regla:'Multiplica cada término del primero por cada término del segundo (4 productos) y junta semejantes.',
            pasos:[paso('Los cuatro productos',`\\(${a*d}x^{2} ${sg(a*f)}x ${sg(b*d)}x ${sg(b*f)}\\)`,'Primeros, externos, internos y últimos.'),
              final('Junta los términos en x',`\\(${c(T(resp))}\\)`,`\\(${a*f} ${sg(b*d)} = ${a*f+b*d}\\).`,resp)],
            errores:[mal(polinomio([b*f,0,a*d],{tex:false}),'Faltan los productos cruzados.'),mal(polinomio([b*f,a*f-b*d,a*d],{tex:false}),'Revisa el signo de uno de los productos cruzados.'),mal(polinomio([b+f,a*f+b*d,a+d],{tex:false}),'Los coeficientes se multiplican, no se suman.')],
            comprobar:()=>equivalente(e,resp)}},
        'resta-productos':()=>{let a,b;do{a=r(-6,6);b=rng.entero(1,6)}while(Math.abs(a)===b);
          const e=`(${lineal([[1,'x'],[a,'']])})^2 - (x + ${b})(x - ${b})`,resp=lineal([[2*a,'x'],[a*a+b*b,'']]);
          return {e,resp,regla:'(x + a)² = x² + 2ax + a² y (x + b)(x − b) = x² − b². Un menos delante de un paréntesis cambia todos los signos.',
            pasos:[paso('Desarrolla cada producto',`\\((${T(polinomio([a*a,2*a,1],{tex:false}))}) - (x^{2} - ${b*b})\\)`,'Cuadrado de binomio y suma por diferencia.'),
              paso('Quita el paréntesis con el menos',`\\(${T(polinomio([a*a,2*a,1],{tex:false}))} ${c(`- x^{2} + ${b*b}`)}\\)`,'El menos cambia el signo de cada término.'),
              final('Junta semejantes',`\\(${c(resp)}\\)`,'Los x² se cancelan.',resp)],
            errores:[mal(lineal([[2*a,'x'],[a*a-b*b,'']]),`El menos cambia el signo de −${b*b}: queda +${b*b}.`),mal(`${a*a+b*b}`,'Falta el término 2ax del cuadrado del binomio.'),mal(lineal([[2,'x^2'],[2*a,'x'],[a*a-b*b,'']]),'El menos también cambia el signo del x² del segundo producto.')],
            comprobar:()=>equivalente(e,resp)}},
        'fracciones':()=>{const p=rng.elegir([2,3,4]),q=rng.elegir([2,3,5]);let a,b,d,f;do{a=r(-4,4);b=r(-5,5);d=r(-4,4);f=r(-5,5)}while(a+d===0||b+f===0);
          const e=`\\frac{1}{${p}}(${lineal([[p*a,'x'],[p*b,'']])}) + \\frac{1}{${q}}(${lineal([[q*d,'x'],[q*f,'']])})`,eTxt=`(1/${p})(${lineal([[p*a,'x'],[p*b,'']])}) + (1/${q})(${lineal([[q*d,'x'],[q*f,'']])})`,resp=lineal([[a+d,'x'],[b+f,'']]);
          return {enunciado:`Simplifica: \\(${e}\\)`,e:eTxt,resp,regla:R_DIS,pasos:[paso('Reparte cada fracción',`\\(${lineal([[a,'x'],[b,'']])} + ${par(lineal([[d,'x'],[f,'']]))}\\)`,`Dividir entre ${p} cada término: \\(${p*a}x \\div ${p} = ${a}x\\).`),
            final('Junta semejantes',`\\(${c(resp)}\\)`,'x con x y números con números.',resp)],
            errores:[mal(lineal([[a+d,'x'],[p*b+q*f,'']]),'La fracción también reparte a los números de adentro.'),mal(lineal([[p*a+q*d,'x'],[p*b+q*f,'']]),'Te faltó multiplicar por las fracciones.'),mal(lineal([[a-d,'x'],[b+f,'']]),'Revisa el signo del término en x.')],
            comprobar:()=>equivalente(eTxt,resp)}}
      }
    };
    const x=plantillas(rng,P[n]);
    const esNum=x.num!==undefined;
    return {plantilla:x.plantilla,enunciado:x.enunciado||`Simplifica: \\(${T(x.e)}\\)`,respuesta:x.resp,
      verificar:esNum?e=>igualNum(e,x.num):e=>simplificada(e,x.resp,{vars}),pasos:x.pasos,errores:[...(esNum?[]:[{si:e=>!/[()]/.test(limpiar(e))&&equivalente(e,x.resp,{vars})&&terminos(e)>terminos(x.resp),por:'Es equivalente, pero falta juntar los términos semejantes.'},{si:e=>/[()]/.test(limpiar(e))&&equivalente(e,x.resp,{vars}),por:'Es equivalente, pero quita los paréntesis (desarrolla).'}]),...(esNum?x.errores:x.errores.map(er=>({...er,si:e=>equivalente(e,er.valor,{vars})})))],
      regla:x.regla,pista:esNum?'Sustituye y respeta el orden de operaciones.':'Quita paréntesis y junta x con x y números con números.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Desigualdades lineales ---------- */
// "x < 3", "3 > x", "x ≥ -1/2", "-2 < x ≤ 5" → {ops:[…]} con x a la izquierda: [{op:'<', v:3}] (compuesta: dos condiciones)
export function desigualdad(e){
  let s=limpiar(e).toLowerCase().replace(/≤|=</g,'<=').replace(/≥|=>/g,'>=').replace(/\s/g,'');
  const N='([-+]?[\\d.,/a-z()√]+?)',inv={'<':'>','>':'<','<=':'>=','>=':'<='};
  let m=s.match(new RegExp(`^${N}(<=|<)x(<=|<)${N}$`));
  if(m)return [{op:inv[m[2]],v:num(m[1])},{op:m[3],v:num(m[4])}];
  m=s.match(new RegExp(`^${N}(>=|>)x(>=|>)${N}$`));
  if(m)return [{op:inv[m[2]],v:num(m[1])},{op:m[3],v:num(m[4])}];
  m=s.match(/^x(<=|>=|<|>)(.+)$/);if(m)return [{op:m[1],v:num(m[2])}];
  m=s.match(/^(.+?)(<=|>=|<|>)x$/);if(m)return [{op:inv[m[2]],v:num(m[1])}];
  return null;
}
const igualDes=(e,esperada)=>{const a=desigualdad(e);if(!a||a.length!==esperada.length)return false;
  const ord=l=>[...l].sort((p,q)=>(p.op[0]==='>'?0:1)-(q.op[0]==='>'?0:1));const A=ord(a),B=ord(esperada);
  return A.every((x,i)=>x.op===B[i].op&&casi(x.v,B[i].v))};
const cumple=(op,x,v)=>op==='<'?x<v:op==='<='?x<=v:op==='>'?x>v:x>=v;
const opTex={'<':'\\lt','<=':'\\le','>':'\\gt','>=':'\\ge'},voltea={'<':'>','>':'<','<=':'>=','>=':'<='};
const opTxt=op=>op;
// Prueba puntos alrededor de los extremos: la desigualdad original y la respuesta dicen lo mismo (2.º cálculo independiente)
const mismasSoluciones=(orig,resp)=>{const vs=resp.map(r=>r.v),pts=[];for(const v of vs)pts.push(v-1,v-0.25,v,v+0.25,v+1);pts.push(-1000,1000,0);
  return pts.every(x=>orig(x)===resp.every(r=>cumple(r.op,x,r.v)))};
const desig={
  titulo:'Desigualdades',
  explicacion:'Se resuelven como ecuaciones, con una regla extra: si multiplicas o divides los dos lados entre un número negativo, el signo de la desigualdad se voltea.',
  alternativa:'Piensa en temperaturas: 3 < 5 es cierto. Si multiplicas los dos por −1 queda −3 y −5, y ahora −3 > −5 (−3 es más calor). Por eso al multiplicar o dividir entre un negativo el signo se voltea. Sumar o restar no cambia el orden: si tú eres más alto que yo y los dos subimos a una silla, sigues siendo más alto.',
  referencia:'Ver: Stewart, Precálculo, sec. 1.8 (desigualdades).',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b),op0=()=>rng.elegir(['<','<=','>','>=']);
    // ax + b (op) d  →  la respuesta, con el paso de dividir (voltea si a < 0)
    const lineal1=(a,b,d,op,{izq}={})=>{const B=d-b,v=B/a,op2=a<0?voltea[op]:op,vt=frac(B,a,{tex:false}),e=izq||lineal([[a,'x'],[b,'']]);
      const pasos=[...(b?[paso('Pasa el número al otro lado',`\\(${a===1?'':a===-1?'-':a}x ${opTex[op]} ${d} ${c(sg(-b))}\\)`,'Restar o sumar en los dos lados no cambia el signo de la desigualdad.')]:[]),
        paso(`Divide entre ${a}`,`\\(x ${c(opTex[op2])} \\dfrac{${B}}{${a}}\\)`,a<0?'Dividir entre un negativo VOLTEA el signo.':'Dividir entre un positivo deja el signo igual.',a<0?{ojo:'Aquí el signo se voltea.'}:{}),
        final('Simplifica',`\\(x ${opTex[op2]} ${frac(B,a)}\\)`,'Esa es la solución: todos los x que cumplen.',`x ${op2} ${vt}`)];
      return {e:`${e} ${opTex[op]} ${d}`,resp:[{op:op2,v}],respTxt:`x ${op2} ${vt}`,pasos,orig:x=>cumple(op,a*x+b,d),
        errores:[...(a<0?[{valor:`x ${op} ${vt}`,por:'Dividiste entre un negativo: el signo se tiene que voltear.'}]:[{valor:`x ${voltea[op]} ${vt}`,por:'Solo se voltea al multiplicar o dividir entre un NEGATIVO.'}]),
          {valor:`x ${op2} ${frac(d+b,a,{tex:false})}`,por:`El ${b} pasa al otro lado con el signo contrario.`},{valor:`x ${op2.length>1?op2[0]:op2+'='} ${vt}`,por:'Cuida si el extremo se incluye (≤, ≥) o no (<, >).'}]}};
    const P={
      1:{
        'suma':()=>{const b=r(-12,12),d=r(-15,15),op=op0();return lineal1(1,b,d,op)},
        'coef-positivo':()=>{const a=rng.entero(2,9),v=r(-9,9),op=op0();return lineal1(a,0,a*v,op)},
        'dos-pasos':()=>{const a=rng.entero(2,6),v=r(-8,8),b=r(-10,10),op=op0();return lineal1(a,b,a*v+b,op)}
      },
      2:{
        'coef-negativo':()=>{const a=-rng.entero(2,9),v=r(-9,9),op=op0();return lineal1(a,0,a*v,op)},
        'negativo-dos-pasos':()=>{const a=-rng.entero(2,6),v=r(-8,8),b=r(-10,10),op=op0();return lineal1(a,b,a*v+b,op)},
        'menos-x':()=>{const b=r(-12,12),d=r(-12,12),op=op0();return lineal1(-1,b,d,op)}
      },
      3:{
        'dos-lados':()=>{let a,cc;do{a=r(-7,7);cc=r(-7,7)}while(a===cc);const A=a-cc,v=r(-6,6),b=r(-10,10),op=op0();
          // a x + b (op) cc x + dd, con dd tal que la solución sea v
          const dd=A*v+b,base=lineal1(A,b,dd,op);
          return {...base,e:`${lineal([[a,'x'],[b,'']])} ${opTex[op]} ${lineal([[cc,'x'],[dd,'']])}`,
            orig:x=>cumple(op,a*x+b,cc*x+dd),pasos:[paso('Junta las x a la izquierda',`\\(${lineal([[a,'x'],[-cc,'x'],[b,'']])} ${opTex[op]} ${dd}\\)`,`El \\(${cc}x\\) pasa restando: \\(${a} - ${par(cc)} = ${A}\\).`),...base.pasos]}},
        'parentesis':()=>{const a=rng.entero(2,6)*rng.signo(),b=r(-6,6),v=r(-7,7),op=op0(),d=a*(v+b);const base=lineal1(a,a*b,d,op);
          return {...base,e:`${a}(${lineal([[1,'x'],[b,'']])}) ${opTex[op]} ${d}`,orig:x=>cumple(op,a*(x+b),d),pasos:[paso('Quita el paréntesis',`\\(${c(lineal([[a,'x'],[a*b,'']]))} ${opTex[op]} ${d}\\)`,`Distributiva: ${a}·${par(b)} = ${a*b}.`),...base.pasos]}},
        'fraccion':()=>{const a=rng.entero(2,5),b=r(-8,8),v=r(-6,6),op=op0(),d=v+b;// x/a + b op d → x op a(d−b)
          const B=a*(d-b);return {e:`\\dfrac{x}{${a}} ${sg(b)} ${opTex[op]} ${d}`,resp:[{op,v:B}],respTxt:`x ${op} ${B}`,orig:x=>cumple(op,x/a+b,d),
            pasos:[paso('Pasa el número',`\\(\\dfrac{x}{${a}} ${opTex[op]} ${c(d-b)}\\)`,'Sumar o restar no cambia el signo.'),final(`Multiplica por ${a}`,`\\(x ${opTex[op]} ${c(B)}\\)`,'Multiplicar por un positivo deja el signo igual.',`x ${op} ${B}`)],
            errores:[{valor:`x ${op} ${frac(d-b,a,{tex:false})}`,por:`Para quitar el ÷${a} se multiplica por ${a}, no se divide.`},{valor:`x ${op} ${a*(d+b)}`,por:`El ${b} pasa con el signo contrario.`},{valor:`x ${voltea[op]} ${B}`,por:'Multiplicar por un positivo no voltea el signo.'}]}}
      },
      4:{
        'resultado-fraccion':()=>{let a,b,d;do{a=rng.entero(2,7)*rng.signo();b=r(-9,9);d=r(-15,15)}while((d-b)%a===0);return lineal1(a,b,d,op0())},
        'mayor-entero':()=>{let a,b,d;do{a=rng.entero(2,6)*rng.signo();b=r(-9,9);d=r(-15,15)}while((d-b)%a===0);const op=rng.elegir(['<','<=']);
          const base=lineal1(a,b,d,a>0?op:voltea[op]);const lim=(d-b)/a,s=base.resp[0].op,ent=s==='<'?Math.ceil(lim)-1:s==='<='?Math.floor(lim):s==='>'?Math.floor(lim)+1:Math.ceil(lim);
          const busca=s[0]==='<'?'mayor':'menor';
          return {...base,enunciado:`¿Cuál es el <b>${busca}</b> número entero que cumple \\(${base.e}\\)?`,resp:null,num:ent,siguiente:busca==='mayor'?ent+1:ent-1,respTxt:String(ent),
            pasos:[...base.pasos.slice(0,-1),paso('Resuelve la desigualdad',`\\(x ${opTex[s]} ${frac(d-b,a)} \\approx ${(lim).toFixed(2)}\\)`,'Primero despeja x como siempre.'),final(`Busca el ${busca} entero`,`\\(x = ${c(ent)}\\)`,`Es el entero más ${busca==='mayor'?'grande':'chico'} que cumple la condición.`,String(ent))],
            errores:[malNum(Math.round(lim)===ent?ent+(busca==='mayor'?1:-1):Math.round(lim),'Redondeaste; tienes que buscar el entero que sí cumple.'),malNum(-ent,'Revisa el signo.'),malNum(s[0]==='<'?ent+1:ent-1,'Ese entero ya no cumple: pruébalo en la desigualdad.')],
            orig2:true}},
        'dos-lados-parentesis':()=>{let a,b,cc,d;do{a=rng.entero(2,5)*rng.signo();b=r(-5,5);cc=r(-6,6);d=r(-12,12)}while(a===cc||(d-a*b)%(a-cc)!==0);const op=op0(),A=a-cc;
          const base=lineal1(A,a*b,d,op);return {...base,e:`${a}(${lineal([[1,'x'],[b,'']])}) ${opTex[op]} ${lineal([[cc,'x'],[d,'']])}`,orig:x=>cumple(op,a*(x+b),cc*x+d),
            pasos:[paso('Quita el paréntesis y junta las x',`\\(${lineal([[a,'x'],[-cc,'x'],[a*b,'']])} ${opTex[op]} ${d}\\)`,'Distributiva y luego pasa el término en x de la derecha.'),...base.pasos]}}
      },
      5:{
        'compuesta':()=>{const a=rng.entero(2,5),b=r(-8,8),lo=r(-6,3),hi=lo+rng.entero(2,7),o1=rng.elegir(['<','<=']),o2=rng.elegir(['<','<=']);
          const L=a*lo+b,H=a*hi+b;return {e:`${L} ${opTex[o1]} ${lineal([[a,'x'],[b,'']])} ${opTex[o2]} ${H}`,resp:[{op:o1==='<'?'>':'>=',v:lo},{op:o2,v:hi}],respTxt:`${lo} ${o1} x ${o2} ${hi}`,
            orig:x=>cumple(o1,L,a*x+b)&&cumple(o2,a*x+b,H),
            pasos:[paso('Resta en las tres partes',`\\(${L-b} ${opTex[o1]} ${a}x ${opTex[o2]} ${H-b}\\)`,`Lo que haces en el medio lo haces en los dos extremos: ${sg(-b)}.`),
              final(`Divide las tres partes entre ${a}`,`\\(${c(lo)} ${opTex[o1]} x ${opTex[o2]} ${c(hi)}\\)`,'Dividir entre un positivo no voltea los signos.',`${lo} ${o1} x ${o2} ${hi}`)],
            errores:[{valor:`${frac(L,a,{tex:false})} ${o1} x ${o2} ${frac(H,a,{tex:false})}`,por:`Primero resta el ${b} en las tres partes y después divide.`},{valor:`${L} ${o1} x ${o2} ${H}`,por:'Falta despejar: resta y divide en las tres partes.'},{valor:`${lo} ${o1==='<'?'<=':'<'} x ${o2} ${hi}`,por:'Conserva cada signo: < no incluye el extremo y ≤ sí.'}]}},
        'compuesta-negativa':()=>{const a=-rng.entero(2,5),b=r(-8,8),lo=r(-6,3),hi=lo+rng.entero(2,7);// a·x+b entre a·hi+b (abajo) y a·lo+b (arriba)
          const L=a*hi+b,H=a*lo+b;return {e:`${L} < ${lineal([[a,'x'],[b,'']])} < ${H}`,resp:[{op:'>',v:lo},{op:'<',v:hi}],respTxt:`${lo} < x < ${hi}`,orig:x=>L<a*x+b&&a*x+b<H,
            pasos:[paso('Resta en las tres partes',`\\(${L-b} < ${a}x < ${H-b}\\)`,'Lo mismo en las tres partes.'),
              paso(`Divide entre ${a} y voltea los dos signos`,`\\(${hi} ${c('>')} x ${c('>')} ${lo}\\)`,'Dividir entre un negativo voltea TODOS los signos.'),
              final('Escríbelo de menor a mayor',`\\(${lo} < x < ${hi}\\)`,'Es lo mismo leído al revés.',`${lo} < x < ${hi}`)],
            errores:[{valor:`${hi} < x < ${lo}`,por:'Al dividir entre un negativo los signos se voltean: el menor queda a la izquierda.'},{valor:`${-hi} < x < ${-lo}`,por:'Revisa los signos al dividir.'},{valor:`${L} < x < ${H}`,por:'Falta despejar x.'}]}},
        'palabras':()=>{const k=rng.entero(2,6),b=rng.entero(1,12),v=rng.entero(-5,9),op=rng.elegir(['>','>=','<','<=']),d=k*v-b;
          const txt={'>':'es mayor que','>=':'es por lo menos','<':'es menor que','<=':'es como mucho'}[op],veces={2:'El doble',3:'El triple',4:'El cuádruple',5:'Cinco veces',6:'Seis veces'}[k];
          const base=lineal1(k,-b,d,op);return {...base,enunciado:`${veces} ${k>=5?'':'de '}un número, menos ${b}, ${txt} ${d}. Escribe la desigualdad que cumple el número (x ${op} …).`,
            pasos:[paso('Traduce a símbolos',`\\(${k}x - ${b} ${opTex[op]} ${d}\\)`,'«El triple de un número» es 3x; «menos 4» resta 4.'),...base.pasos]}}
      }
    };
    const x=plantillas(rng,P[n]);
    const errores=(x.errores||[]).map(e=>e.si?e:{...e,si:v=>igualDes(v,desigualdad(e.valor)||[])}).filter(e=>e.valor===undefined||desigualdad(e.valor)||!isNaN(num(e.valor)));
    if(x.num!==undefined)return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.respTxt,verificar:e=>igualNum(e,x.num),pasos:x.pasos,errores:x.errores,
      regla:'Al multiplicar o dividir una desigualdad entre un número negativo, el signo se voltea.',pista:'Resuelve la desigualdad y prueba enteros cerca del extremo.',teclado:'mat',
      comprobar:()=>x.orig(x.num)&&!x.orig(x.siguiente)};
    return {plantilla:x.plantilla,enunciado:x.enunciado||`Resuelve: \\(${x.e}\\)<br><span class="nota">Escribe la solución como x &lt; 3, x ≥ −2 o −1 &lt; x ≤ 4.</span>`,respuesta:x.respTxt,
      verificar:e=>igualDes(e,x.resp),pasos:x.pasos,errores,
      regla:'Una desigualdad se resuelve como una ecuación, pero al multiplicar o dividir entre un número negativo el signo se voltea.',
      pista:'¿Divides entre un número negativo? Entonces voltea el signo.',teclado:'mat',comprobar:()=>mismasSoluciones(x.orig,x.resp)};
  }
};

/* ---------- Productos notables ---------- */
const R_PN='(a + b)² = a² + 2ab + b² · (a − b)² = a² − 2ab + b² · (a + b)(a − b) = a² − b² · (a + b)³ = a³ + 3a²b + 3ab² + b³.';
const productos={
  titulo:'Productos notables',
  explicacion:'Hay productos que salen tanto que conviene saberlos de memoria: el cuadrado de un binomio (a ± b)² = a² ± 2ab + b², la suma por la diferencia (a + b)(a − b) = a² − b² y el cubo de un binomio.',
  alternativa:'Dibuja un cuadrado de lado (a + b): adentro caben un cuadrado a×a, otro b×b y DOS rectángulos a×b. Por eso (a + b)² = a² + 2ab + b², y no solo a² + b²: los dos rectángulos son el 2ab que se suele olvidar.',
  referencia:'Ver: Baldor, Álgebra, cap. 8 (productos notables).',
  profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    let vars=['x'];
    const bin=(k,v,b)=>lineal([[k,v],[b,'']]);
    const co=(k,v)=>k===1?v:k+v;
    const P={
      1:{
        'cuadrado-suma':()=>{const a=rng.entero(1,12),e=`(x + ${a})^2`,resp=polinomio([a*a,2*a,1],{tex:false});
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = x,\\ b = ${a}\\)`,'Es el cuadrado de una suma.'),paso('Aplica a² + 2ab + b²',`\\(x^{2} + 2\\cdot x\\cdot ${a} + ${a}^{2}\\)`,'El término del medio es el doble del producto.',{ojo:'No olvides el 2ab.'}),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([a*a,0,1],{tex:false}),'Falta el término del medio: 2·x·'+a+' = '+2*a+'x.'),mal(polinomio([a*a,a,1],{tex:false}),'El término del medio es el DOBLE del producto: 2ab.'),mal(polinomio([2*a,2*a,1],{tex:false}),`El último término es ${a}² = ${a*a}, no ${a}·2.`)]}},
        'cuadrado-resta':()=>{const a=rng.entero(1,12),e=`(x - ${a})^2`,resp=polinomio([a*a,-2*a,1],{tex:false});
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = x,\\ b = ${a}\\)`,'Es el cuadrado de una resta.'),paso('Aplica a² − 2ab + b²',`\\(x^{2} - 2\\cdot x\\cdot ${a} + ${a}^{2}\\)`,'El último término siempre es positivo.'),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([a*a,0,-1+2],{tex:false}),'Falta el término del medio −2ab.'),mal(polinomio([-a*a,-2*a,1],{tex:false}),`${a}² es positivo aunque se reste: (−${a})² = ${a*a}.`),mal(polinomio([a*a,2*a,1],{tex:false}),'En el cuadrado de una resta, el término del medio es negativo.')]}},
        'conjugados':()=>{const a=rng.entero(1,12),e=`(x + ${a})(x - ${a})`,resp=polinomio([-a*a,0,1],{tex:false});
          return {e,resp,pasos:[paso('Es suma por diferencia',`\\((x + ${a})(x - ${a})\\)`,'Los mismos dos términos, uno con + y otro con −.'),final('Aplica a² − b²',`\\(${c(T(resp))}\\)`,'Los productos cruzados se cancelan.',resp)],
            errores:[mal(polinomio([a*a,0,1],{tex:false}),'El último término es −b²: (+'+a+')(−'+a+') es negativo.'),mal(polinomio([-a*a,2*a,1],{tex:false}),'Los términos cruzados (+'+a+'x y −'+a+'x) se cancelan.'),mal(polinomio([-2*a,0,1],{tex:false}),`b² es ${a}·${a} = ${a*a}.`)]}}
      },
      2:{
        'cuadrado-coef':()=>{const k=rng.entero(2,6),a=rng.entero(1,9)*rng.signo(),e=`(${bin(k,'x',a)})^2`,resp=polinomio([a*a,2*k*a,k*k],{tex:false});
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = ${k}x,\\ b = ${a}\\)`,'El coeficiente va dentro de a.'),paso('Aplica a² + 2ab + b²',`\\((${k}x)^{2} + 2\\cdot ${k}x\\cdot${par(a)} + ${par(a)}^{2}\\)`,`\\((${k}x)^{2} = ${k*k}x^{2}\\): el coeficiente también se eleva.`),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([a*a,2*k*a,k],{tex:false}),`El ${k} también se eleva al cuadrado: ${k*k}x².`),mal(polinomio([a*a,0,k*k],{tex:false}),'Falta el término del medio 2ab.'),mal(polinomio([a*a,k*a,k*k],{tex:false}),'El término del medio es el doble del producto.')]}},
        'conjugados-coef':()=>{const k=rng.entero(2,7),a=rng.entero(1,9),e=`(${k}x + ${a})(${k}x - ${a})`,resp=polinomio([-a*a,0,k*k],{tex:false});
          return {e,resp,pasos:[paso('Suma por diferencia',`\\(a = ${k}x,\\ b = ${a}\\)`,'Mismo par de términos con signos opuestos.'),final('Aplica a² − b²',`\\(${c(T(resp))}\\)`,`\\((${k}x)^{2} = ${k*k}x^{2}\\).`,resp)],
            errores:[mal(polinomio([-a*a,0,k],{tex:false}),`El ${k} también se eleva: ${k*k}x².`),mal(polinomio([a*a,0,k*k],{tex:false}),'El último término es negativo: −b².'),mal(polinomio([-a*a,2*k*a,k*k],{tex:false}),'Los términos cruzados se cancelan.')]}},
        'cuadrado-resta-coef':()=>{const k=rng.entero(2,6),a=rng.entero(1,9),e=`(${a} - ${k}x)^2`,resp=polinomio([a*a,-2*k*a,k*k],{tex:false});
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = ${a},\\ b = ${k}x\\)`,'El orden no importa: el cuadrado da lo mismo.'),paso('Aplica a² − 2ab + b²',`\\(${a}^{2} - 2\\cdot${a}\\cdot${k}x + (${k}x)^{2}\\)`,'Cuadrado de una resta.'),final('Ordena',`\\(${c(T(resp))}\\)`,'De mayor a menor exponente.',resp)],
            errores:[mal(polinomio([a*a,-2*k*a,-k*k],{tex:false}),'(−'+k+'x)² es positivo.'),mal(polinomio([a*a,0,k*k],{tex:false}),'Falta el término del medio.'),mal(polinomio([a*a,2*k*a,k*k],{tex:false}),'El término del medio es negativo en el cuadrado de una resta.')]}}
      },
      3:{
        'dos-letras':()=>{vars=['x','y'];const p=rng.entero(1,5),q=rng.entero(1,6),s=rng.signo(),e=`(${p===1?'':p}x ${s<0?'-':'+'} ${q===1?'':q}y)^2`,resp=`${p*p===1?'':p*p}x^2 ${s<0?'-':'+'} ${2*p*q}xy + ${q*q===1?'':q*q}y^2`;
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = ${p===1?'':p}x,\\ b = ${q===1?'':q}y\\)`,'Cada término con su coeficiente.'),final('Aplica la fórmula',`\\(${c(T(resp))}\\)`,'a² ± 2ab + b², con el producto de las dos letras en el medio.',resp)],
            errores:[mal(`${co(p*p,'x^2')} + ${co(q*q,'y^2')}`,'Falta el término del medio 2ab = '+2*p*q+'xy.'),mal(`${co(p*p,'x^2')} ${s<0?'-':'+'} ${co(p*q,'xy')} + ${co(q*q,'y^2')}`,'El término del medio es el doble del producto.'),mal(`${co(p*p,'x^2')} ${s<0?'+':'-'} ${2*p*q}xy + ${co(q*q,'y^2')}`,'Revisa el signo del término del medio.')]}},
        'conjugados-letras':()=>{vars=['x','y'];const p=rng.entero(1,6),q=rng.entero(1,6),e=`(${p===1?'':p}x + ${q===1?'':q}y)(${p===1?'':p}x - ${q===1?'':q}y)`,resp=`${p*p===1?'':p*p}x^2 - ${q*q===1?'':q*q}y^2`;
          return {e,resp,pasos:[paso('Suma por diferencia',`\\(a = ${p===1?'':p}x,\\ b = ${q===1?'':q}y\\)`,'Mismos términos, signos opuestos.'),final('a² − b²',`\\(${c(T(resp))}\\)`,'Los términos en xy se cancelan.',resp)],
            errores:[mal(`${co(p*p,'x^2')} + ${co(q*q,'y^2')}`,'El segundo término es negativo: −b².'),mal(`${co(p*p,'x^2')} - ${2*p*q}xy - ${co(q*q,'y^2')}`,'Los términos cruzados se cancelan.'),mal(`${co(p,'x^2')} - ${co(q,'y^2')}`,'Los coeficientes también se elevan al cuadrado.')]}},
        'cuadrado-x2':()=>{const a=rng.entero(1,9)*rng.signo(),e=`(x^2 ${sg(a)})^2`,resp=polinomio([a*a,0,2*a,0,1],{tex:false});
          return {e,resp,pasos:[paso('Identifica a y b',`\\(a = x^{2},\\ b = ${a}\\)`,'a es x².'),paso('Aplica a² + 2ab + b²',`\\((x^{2})^{2} + 2\\cdot x^{2}\\cdot${par(a)} + ${par(a)}^{2}\\)`,'(x²)² = x⁴: potencia de potencia.'),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([a*a,0,0,0,1],{tex:false}),'Falta el término del medio.'),mal(`x^3 ${sg(2*a)}x^2 + ${a*a}`,'(x²)² = x⁴, no x³.'),mal(polinomio([a*a,0,a,0,1],{tex:false}),'El término del medio es 2ab.')]}}
      },
      4:{
        'cubo-suma':()=>{const a=rng.entero(1,5),e=`(x + ${a})^3`,resp=polinomio([a**3,3*a*a,3*a,1],{tex:false});
          return {e,resp,pasos:[paso('Fórmula del cubo',`\\((a + b)^{3} = a^{3} + 3a^{2}b + 3ab^{2} + b^{3}\\)`,'Coeficientes 1, 3, 3, 1.'),paso('Sustituye',`\\(x^{3} + 3x^{2}\\cdot${a} + 3x\\cdot${a}^{2} + ${a}^{3}\\)`,'Las potencias de x bajan y las de b suben.'),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([a**3,0,0,1],{tex:false}),'(a + b)³ no es a³ + b³: faltan los términos del medio.'),mal(polinomio([a**3,a*a,a,1],{tex:false}),'Los términos del medio llevan coeficiente 3.'),mal(polinomio([3*a,3*a*a,3*a,1],{tex:false}),`b³ = ${a}³ = ${a**3}.`)]}},
        'cubo-resta':()=>{const a=rng.entero(1,5),e=`(x - ${a})^3`,resp=polinomio([-(a**3),3*a*a,-3*a,1],{tex:false});
          return {e,resp,pasos:[paso('Fórmula del cubo de una resta',`\\((a - b)^{3} = a^{3} - 3a^{2}b + 3ab^{2} - b^{3}\\)`,'Los signos se alternan.'),paso('Sustituye',`\\(x^{3} - 3x^{2}\\cdot${a} + 3x\\cdot${a}^{2} - ${a}^{3}\\)`,'Coeficientes 1, 3, 3, 1.'),final('Calcula',`\\(${c(T(resp))}\\)`,'Resultado desarrollado.',resp)],
            errores:[mal(polinomio([-(a**3),0,0,1],{tex:false}),'Faltan los términos del medio.'),mal(polinomio([-(a**3),-3*a*a,-3*a,1],{tex:false}),'Los signos se alternan: − + −.'),mal(polinomio([a**3,3*a*a,-3*a,1],{tex:false}),`El último término es −${a}³ = −${a**3}.`)]}},
        'termino-comun':()=>{let a,b;do{a=rng.noCero(-9,9);b=rng.noCero(-9,9)}while(a===b||a===-b);const e=`(x ${sg(a)})(x ${sg(b)})`,resp=polinomio([a*b,a+b,1],{tex:false});
          return {e,resp,pasos:[paso('Binomios con término común',`\\((x + a)(x + b) = x^{2} + (a + b)x + ab\\)`,'Suma en el medio y producto al final.'),final('Sustituye',`\\(x^{2} + (${a} ${sg(b)})x + ${a}\\cdot${par(b)} = ${c(T(resp))}\\)`,'Calcula la suma y el producto.',resp)],
            errores:[mal(polinomio([a*b,0,1],{tex:false}),'Falta el término en x: (a + b)x.'),mal(polinomio([a+b,a*b,1],{tex:false}),'La suma va con la x y el producto es el número suelto.'),mal(polinomio([-a*b,a+b,1],{tex:false}),'Revisa el signo del producto.')]}}
      },
      5:{
        'diferencia-cuadrados-binomios':()=>{const a=rng.entero(1,9),e=`(x + ${a})^2 - (x - ${a})^2`,resp=`${4*a}x`;
          return {e,resp,pasos:[paso('Desarrolla cada cuadrado',`\\((${T(polinomio([a*a,2*a,1],{tex:false}))}) - (${T(polinomio([a*a,-2*a,1],{tex:false}))})\\)`,'Dos cuadrados de binomio.'),paso('Quita el paréntesis con el menos',`\\(${T(polinomio([a*a,2*a,1],{tex:false}))} ${c(T(`- x^2 + ${2*a}x - ${a*a}`))}\\)`,'El menos cambia todos los signos.'),final('Junta semejantes',`\\(${c(resp)}\\)`,'x² y los números se cancelan.',resp)],
            errores:[mal('0','El menos cambia el signo del −2ab del segundo cuadrado: no se cancela.'),mal(`${2*a}x`,'Son dos términos de '+2*a+'x: '+4*a+'x.'),mal(`${2*a*a}`,'Los números se cancelan; quedan los términos en x.')]}},
        'conjugados-cuadrados':()=>{const a=rng.entero(1,4),e=`(x - ${a})(x + ${a})(x^2 + ${a*a})`,resp=polinomio([-(a**4),0,0,0,1],{tex:false});
          return {e,resp,pasos:[paso('Primero la suma por diferencia',`\\((x^{2} - ${a*a})(x^{2} + ${a*a})\\)`,'(x − a)(x + a) = x² − a².'),final('Otra vez suma por diferencia',`\\(${c(T(resp))}\\)`,'Ahora con a = x² y b = '+a*a+'.',resp)],
            errores:[mal(polinomio([a**4,0,0,0,1],{tex:false}),'El resultado de una suma por diferencia es una RESTA.'),mal(polinomio([-(a*a),0,0,0,1],{tex:false}),`(${a*a})² = ${a**4}.`),mal(polinomio([-(a**4),0,2*a*a,0,1],{tex:false}),'Los términos cruzados se cancelan.')]}},
        'cubo-coef':()=>{const k=rng.entero(2,3),a=rng.entero(1,3)*rng.signo(),e=`(${k}x ${sg(a)})^3`,resp=polinomio([a**3,3*k*a*a,3*k*k*a,k**3],{tex:false});
          return {e,resp,pasos:[paso('Fórmula del cubo',`\\((${k}x)^{3} + 3(${k}x)^{2}${par(a)} + 3(${k}x)${par(a)}^{2} + ${par(a)}^{3}\\)`,'Con a = '+k+'x.'),paso('Calcula cada término',`\\(${k**3}x^{3} ${sg(3*k*k*a)}x^{2} ${sg(3*k*a*a)}x ${sg(a**3)}\\)`,`\\((${k}x)^{3} = ${k**3}x^{3}\\).`),final('Resultado',`\\(${c(T(resp))}\\)`,'Desarrollado.',resp)],
            errores:[mal(polinomio([a**3,0,0,k**3],{tex:false}),'Faltan los términos del medio.'),mal(polinomio([a**3,3*k*a*a,3*k*k*a,k],{tex:false}),`El ${k} también se eleva al cubo.`),mal(polinomio([a**3,k*a*a,k*k*a,k**3],{tex:false}),'Los términos del medio llevan un 3.')]}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {plantilla:x.plantilla,enunciado:`Desarrolla: \\(${T(x.e)}\\)`,respuesta:x.resp,verificar:e=>simplificada(e,x.resp,{vars}),pasos:x.pasos,
      errores:[{si:e=>/[()]/.test(limpiar(e))&&equivalente(e,x.resp,{vars}),por:'Es lo mismo, pero sin desarrollar: quita los paréntesis.'},...x.errores.map(er=>({...er,si:e=>equivalente(e,er.valor,{vars})}))],
      regla:R_PN,pista:'¿Es cuadrado de binomio, suma por diferencia o cubo? Usa su fórmula.',teclado:'mat',comprobar:()=>equivalente(x.e,x.resp,{vars})};
  }
};

/* ---------- Ecuaciones cuadráticas ---------- */
// "x = 2, x = -3", "2 y -3", "x₁ = 1 + √3, x₂ = 1 − √3", "1 ± √3" → [números]
export function raices(e){
  let s=limpiar(e).toLowerCase().replace(/x\s*[₁₂12]\s*=/g,'x =').replace(/\s+(y|o)\s+/g,',').replace(/;/g,',');
  const out=[];
  for(let parte of s.split(',')){parte=parte.trim().replace(/^x\s*=\s*/,'');if(!parte)continue;
    const pm=parte.match(/^(.*?)(±|\+-|\+\/-)(.*)$/);
    if(pm){const a=pm[1].trim()?num(pm[1]):0,b=num(pm[3]);out.push(a+b,a-b)}else out.push(num(parte))}
  return out;
}
const igualRaices=(e,rs,tol=1e-6)=>{const a=[...new Set(raices(e).map(x=>Math.round(x*1e6)/1e6))],b=[...new Set(rs.map(x=>Math.round(x*1e6)/1e6))];
  return a.length===b.length&&a.every(x=>Number.isFinite(x))&&[...a].sort((p,q)=>p-q).every((x,i)=>casi(x,[...b].sort((p,q)=>p-q)[i],tol))};
const R_CUAD='Una ecuación cuadrática ax² + bx + c = 0 se resuelve factorizando (cada factor = 0) o con la fórmula x = (−b ± √(b² − 4ac)) / 2a.';
const cuadratica={
  titulo:'Ecuaciones cuadráticas',
  explicacion:'Iguala a cero y factoriza: si un producto es cero, alguno de los factores es cero. Si no se puede factorizar, usa la fórmula general x = (−b ± √(b² − 4ac)) / 2a. El discriminante b² − 4ac dice cuántas soluciones hay.',
  alternativa:'Si dos números multiplicados dan 0, uno de los dos TIENE que ser 0 (no hay otra forma de obtener 0 multiplicando). Por eso (x − 2)(x + 5) = 0 se parte en dos ecuaciones fáciles: x − 2 = 0 o x + 5 = 0. Una cuadrática casi siempre tiene dos respuestas: la parábola cruza el eje x en dos puntos.',
  referencia:'Ver: Stewart, Precálculo, sec. 1.5; Baldor, Álgebra, cap. 33.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const poli=(a,b,cc)=>T(polinomio([cc,b,a],{tex:false}));
    const fact=(a,r1,r2)=>{// a(x − r1)(x − r2) con raíces enteras
      const b=-a*(r1+r2),cc=a*r1*r2;return {a,b,cc}};
    const resolverFactor=(r1,r2,eq)=>({rs:[r1,r2],resp:r1===r2?`x = ${r1}`:`x = ${r1}, x = ${r2}`,
      pasos:[paso('Factoriza',`\\(${eq}\\)`,'Busca dos números que multipliquen c y sumen b.'),final('Cada factor igual a cero',`\\(x ${sg(-r1)} = 0 \\Rightarrow x = ${c(r1)}\\)${r1===r2?'':`; \\(x ${sg(-r2)} = 0 \\Rightarrow x = ${c(r2)}\\)`}`,'Si un producto es cero, alguno de los factores es cero.',r1===r2?`x = ${r1}`:`x = ${r1}, x = ${r2}`)]});
    const P={
      1:{
        'raiz':()=>{const k=rng.entero(1,12);return {e:`x^{2} = ${k*k}`,rs:[k,-k],resp:`x = ${k}, x = -${k}`,
          pasos:[paso('Saca raíz cuadrada en los dos lados',`\\(x = \\pm\\sqrt{${k*k}}\\)`,'Hay dos números que al cuadrado dan '+k*k+'.',{ojo:'No olvides el negativo.'}),final('Calcula',`\\(x = ${c(k)},\\ x = ${c(-k)}\\)`,`\\(${k}^{2} = (-${k})^{2} = ${k*k}\\).`,`x = ${k}, x = -${k}`)],
          errores:[{valor:`x = ${k}`,por:`También sirve x = −${k}: (−${k})² = ${k*k}.`},{valor:`x = ${k*k/2}`,por:'x² no es 2x: se saca raíz, no se divide entre 2.'},{valor:`x = ${k*k}`,por:'Falta sacar la raíz cuadrada.'}]}},
        'raiz-coef':()=>{const a=rng.entero(2,6),k=rng.entero(1,9);return {e:`${a}x^{2} = ${a*k*k}`,rs:[k,-k],resp:`x = ${k}, x = -${k}`,
          pasos:[paso(`Divide entre ${a}`,`\\(x^{2} = ${c(k*k)}\\)`,'Primero deja sola la x².'),final('Raíz cuadrada (con ±)',`\\(x = \\pm ${k}\\)`,'Dos soluciones: positiva y negativa.',`x = ${k}, x = -${k}`)],
          errores:[{valor:`x = ${k}`,por:`Falta la solución negativa x = −${k}.`},{valor:`x = ${k*k}, x = -${k*k}`,por:'Falta sacar la raíz cuadrada.'},{valor:`x = ${a*k}, x = -${a*k}`,por:`Primero divide entre ${a}.`}]}},
        'factorizada':()=>{let r1,r2;do{r1=rng.noCero(-9,9);r2=rng.noCero(-9,9)}while(r1===r2);const eq=`(x ${sg(-r1)})(x ${sg(-r2)}) = 0`;
          return {e:eq,...resolverFactor(r1,r2,eq),errores:[{valor:`x = ${-r1}, x = ${-r2}`,por:`El signo cambia: x ${sg(-r1)} = 0 da x = ${r1}.`},{valor:`x = ${r1}`,por:'Son dos factores: hay dos soluciones.'},{valor:`x = ${r1*r2}`,por:'Iguala cada factor a cero; no multipliques los números.'}]}}
      },
      2:{
        'trinomio':()=>{let r1,r2;do{r1=rng.noCero(-9,9);r2=rng.noCero(-9,9)}while(r1===r2||r1===-r2);const {b,cc}=fact(1,r1,r2),eq=`(x ${sg(-r1)})(x ${sg(-r2)}) = 0`,f=resolverFactor(r1,r2,eq);
          return {e:`${poli(1,b,cc)} = 0`,...f,errores:[{valor:`x = ${-r1}, x = ${-r2}`,por:'Signos al revés: cada raíz es el número que hace cero su factor.'},{valor:`x = ${r1}`,por:'Falta la otra solución.'},{valor:`x = ${b}, x = ${cc}`,por:'Las soluciones no son b y c: factoriza primero.'}]}},
        'factor-comun':()=>{const a=rng.entero(1,6),r=rng.noCero(-9,9),b=-a*r;return {e:`${poli(a,b,0)} = 0`,rs:[0,r],resp:`x = 0, x = ${r}`,
          pasos:[paso('Saca factor común x',`\\(x(${lineal([[a,'x'],[b,'']])}) = 0\\)`,'No hay número suelto: x está en los dos términos.'),final('Cada factor igual a cero',`\\(x = ${c(0)}\\) o \\(${lineal([[a,'x'],[b,'']])} = 0 \\Rightarrow x = ${c(r)}\\)`,'Producto cero: algún factor es cero.',`x = 0, x = ${r}`,{ojo:'No dividas entre x: perderías la solución x = 0.'})],
          errores:[{valor:`x = ${r}`,por:'Falta x = 0: si divides entre x la pierdes.'},{valor:`x = 0, x = ${-r}`,por:'Revisa el signo al despejar.'},{valor:`x = ${-b}`,por:`Despeja bien: ${a}x = ${-b} ⇒ x = ${r}.`}]}},
        'diferencia':()=>{const k=rng.entero(1,12);return {e:`x^{2} - ${k*k} = 0`,rs:[k,-k],resp:`x = ${k}, x = -${k}`,
          pasos:[paso('Factoriza la diferencia de cuadrados',`\\((x - ${k})(x + ${k}) = 0\\)`,'a² − b² = (a − b)(a + b).'),final('Cada factor igual a cero',`\\(x = ${c(k)}\\) o \\(x = ${c(-k)}\\)`,'Dos soluciones opuestas.',`x = ${k}, x = -${k}`)],
          errores:[{valor:`x = ${k}`,por:'Falta la solución negativa.'},{valor:`x = ${k*k}`,por:'Falta la raíz cuadrada.'},{valor:`x = ${k*k}, x = -${k*k}`,por:'Las soluciones son ±√'+k*k+' = ±'+k+'.'}]}}
      },
      3:{
        'ax2':()=>{let a,p,q;do{a=rng.entero(2,4);p=rng.noCero(-7,7);q=rng.noCero(-6,6)}while(p%a===0);// (a x − p)(x − q) = 0 → p/a, q
          const b=-(a*q+p),cc=p*q,r1=p/a;return {e:`${poli(a,b,cc)} = 0`,rs:[r1,q],resp:`x = ${frac(p,a,{tex:false})}, x = ${q}`,
            pasos:[paso('Factoriza (método a·c)',`\\((${lineal([[a,'x'],[-p,'']])})(x ${sg(-q)}) = 0\\)`,'Dos números que multipliquen a·c y sumen b.'),final('Cada factor igual a cero',`\\(x = ${c(frac(p,a))}\\), \\(x = ${c(q)}\\)`,`\\(${a}x = ${p}\\) da una fracción.`,`x = ${frac(p,a,{tex:false})}, x = ${q}`)],
            errores:[{valor:`x = ${p}, x = ${q}`,por:`En ${a}x ${sg(-p)} = 0 falta dividir entre ${a}.`},{valor:`x = ${frac(-p,a,{tex:false})}, x = ${-q}`,por:'Signos al revés.'},{valor:`x = ${q}`,por:'Falta la otra solución.'}]}},
        'reordenar':()=>{let r1,r2;do{r1=rng.noCero(-8,8);r2=rng.noCero(-8,8)}while(r1===r2||r1===-r2);const b=-(r1+r2),cc=r1*r2,eq=`(x ${sg(-r1)})(x ${sg(-r2)}) = 0`,f=resolverFactor(r1,r2,eq);
          return {e:`${poli(1,b,0)} = ${-cc}`,...f,pasos:[paso('Iguala a cero',`\\(${poli(1,b,cc)} = 0\\)`,'Pasa todo a un lado: solo así sirve "producto = 0".'),...f.pasos],
            errores:[{valor:`x = 0, x = ${-b}`,por:'Primero iguala a cero; no factorices con el número del otro lado.'},{valor:`x = ${-r1}, x = ${-r2}`,por:'Signos al revés.'},{valor:`x = ${r1}`,por:'Falta la otra solución.'}]}},
        'cuadrado-binomio':()=>{const a=rng.noCero(-6,6),k=rng.entero(1,8);return {e:`(x ${sg(a)})^{2} = ${k*k}`,rs:[-a+k,-a-k],resp:`x = ${-a+k}, x = ${-a-k}`,
          pasos:[paso('Raíz cuadrada en los dos lados',`\\(x ${sg(a)} = \\pm ${k}\\)`,'No hace falta desarrollar el cuadrado.'),final('Despeja x',`\\(x = ${-a} \\pm ${k} \\Rightarrow ${c(-a+k)},\\ ${c(-a-k)}\\)`,`Pasa el ${a} restando.`,`x = ${-a+k}, x = ${-a-k}`)],
          errores:[{valor:`x = ${-a+k}`,por:'Falta la solución con −'+k+'.'},{valor:`x = ${a+k}, x = ${a-k}`,por:`El ${a} pasa con el signo contrario.`},{valor:`x = ${k*k-a}`,por:'Saca raíz cuadrada en los dos lados.'}]}}
      },
      4:{
        'formula':()=>{let a,p,q;do{a=rng.entero(2,5);p=rng.noCero(-9,9);q=rng.noCero(-5,5)}while(p%a===0||Math.abs(p*q)>40);const b=-(a*q+p),cc=p*q,D=b*b-4*a*cc,sq=Math.round(Math.sqrt(D)),r1=p/a;
          return {e:`${poli(a,b,cc)} = 0`,rs:[r1,q],resp:`x = ${frac(p,a,{tex:false})}, x = ${q}`,
            pasos:[paso('Identifica a, b y c',`\\(a = ${a},\\ b = ${b},\\ c = ${cc}\\)`,'Con la ecuación igualada a cero.'),
              paso('Calcula el discriminante',`\\(b^{2} - 4ac = ${b*b} - 4\\cdot${a}\\cdot${par(cc)} = ${c(D)}\\)`,'Si es positivo hay dos soluciones.'),
              final('Aplica la fórmula',`\\(x = \\dfrac{${-b} \\pm ${sq}}{${2*a}} \\Rightarrow ${c(frac(-b+sq,2*a))},\\ ${c(frac(-b-sq,2*a))}\\)`,'Una con + y otra con −.',`x = ${frac(p,a,{tex:false})}, x = ${q}`,{ojo:'−b cambia el signo de b.'})],
            errores:[{valor:`x = ${frac(b+sq,2*a,{tex:false})}, x = ${frac(b-sq,2*a,{tex:false})}`,por:'En la fórmula va −b: cambia el signo de b.'},{valor:`x = ${frac(-b+sq,2,{tex:false})}, x = ${frac(-b-sq,2,{tex:false})}`,por:`Divide entre 2a = ${2*a}, no entre 2.`},{valor:`x = ${q}`,por:'Falta la otra solución.'}]}},
        'discriminante':()=>{const tipo=rng.elegir([0,1,2]),a=rng.entero(1,4)*rng.signo();let b,cc;
          if(tipo===1){const r=rng.noCero(-5,5);b=-2*a*r;cc=a*r*r}else if(tipo===2){do{b=rng.entero(-9,9);cc=rng.noCero(-9,9)}while(b*b-4*a*cc<=0)}else{do{b=rng.entero(-6,6);cc=rng.noCero(-9,9)}while(b*b-4*a*cc>=0)}
          const D=b*b-4*a*cc;return {enunciado:`¿Cuántas soluciones reales tiene \\(${poli(a,b,cc)} = 0\\)? (0, 1 o 2)`,num:tipo,resp:String(tipo),
            pasos:[paso('Calcula el discriminante',`\\(b^{2} - 4ac = ${b*b} - 4\\cdot${par(a)}\\cdot${par(cc)} = ${c(D)}\\)`,'No hace falta resolver.'),final('Interpreta el signo',`\\(${D} ${D>0?'> 0':D===0?'= 0':'< 0'} \\Rightarrow ${c(tipo)}\\)`,'Positivo: 2 · cero: 1 · negativo: 0 soluciones reales.',String(tipo))],
            errores:[malNum(tipo===2?1:2,'Mira el signo del discriminante: positivo 2, cero 1, negativo 0.'),malNum(tipo===0?2:0,'Calcula b² − 4ac con cuidado con los signos.'),malNum(tipo===1?2:1,'Solo hay una solución cuando el discriminante es exactamente 0.')],
            comprobar:()=>tipo===(D>0?2:D===0?1:0)}},
        'doble':()=>{const r=rng.noCero(-9,9),a=rng.entero(1,3);return {e:`${poli(a,-2*a*r,a*r*r)} = 0`,rs:[r],resp:`x = ${r}`,
          pasos:[paso(a>1?`Divide entre ${a} y reconoce un cuadrado perfecto`:'Reconoce un trinomio cuadrado perfecto',`\\((x ${sg(-r)})^{2} = 0\\)`,'a² − 2ab + b² = (a − b)².'),final('Una sola solución (doble)',`\\(x = ${c(r)}\\)`,'Los dos factores son iguales.',`x = ${r}`)],
          errores:[{valor:`x = ${-r}`,por:'Signo al revés.'},{valor:`x = ${r}, x = ${-r}`,por:'Es un cuadrado perfecto: la única solución es '+r+'.'},{valor:`x = ${r*r}`,por:'La raíz de '+r*r+' es '+Math.abs(r)+'.'}]}}
      },
      5:{
        'irracional':()=>{const p=rng.noCero(-6,6);const d=rng.elegir([2,3,5,6,7,10,11,13,14,15]);// x² + 2p x + (p² − d) = 0 → −p ± √d
          const b=2*p,cc=p*p-d;return {e:`${poli(1,b,cc)} = 0`,rs:[-p+Math.sqrt(d),-p-Math.sqrt(d)],resp:`x = ${-p} + √${d}, x = ${-p} - √${d}`,tol:1e-3,
            pasos:[paso('Discriminante',`\\(${b*b} - 4\\cdot${par(cc)} = ${c(4*d)}\\)`,'No es un cuadrado perfecto: las soluciones llevan raíz.'),
              paso('Fórmula general',`\\(x = \\dfrac{${-b} \\pm \\sqrt{${4*d}}}{2} = \\dfrac{${-b} \\pm 2\\sqrt{${d}}}{2}\\)`,`\\(\\sqrt{${4*d}} = 2\\sqrt{${d}}\\).`),
              final('Simplifica',`\\(x = ${-p} \\pm \\sqrt{${d}}\\)`,'Divide los dos términos entre 2.',`x = ${-p} + √${d}, x = ${-p} - √${d}`)],
            errores:[{valor:`x = ${p} + √${d}, x = ${p} - √${d}`,por:'En la fórmula va −b: cambia el signo.'},{valor:`x = ${-p} + √${4*d}, x = ${-p} - √${4*d}`,por:'También divide la raíz entre 2: √'+4*d+'/2 = √'+d+'.'},{valor:`x = ${-p} + √${d}`,por:'Falta la solución con −.'}]}},
        'sin-solucion':()=>{const a=rng.entero(1,3);let b,cc;do{b=rng.entero(-6,6);cc=rng.entero(1,12)}while(b*b-4*a*cc>=0);const D=b*b-4*a*cc;
          return {e:`${poli(a,b,cc)} = 0`,sin:true,resp:'No tiene solución real',
            pasos:[paso('Discriminante',`\\(${b*b} - 4\\cdot${a}\\cdot${cc} = ${c(D)}\\)`,'Es negativo.'),final('Interpreta',`\\(${D} < 0\\)`,'No existe raíz cuadrada real de un negativo: la parábola no toca el eje x.','No tiene solución real')],
            errores:[{valor:'x = 0',si:e=>/^\s*x?\s*=?\s*0\s*$/.test(e),por:'El discriminante es negativo: no hay soluciones reales.'},
              {valor:`x = ${frac(-b,2*a,{tex:false})}`,por:'Ese es el x del vértice; la parábola no llega a tocar el eje x.'},
              {si:e=>raices(e).length>0&&raices(e).every(Number.isFinite),por:'Ningún número real cumple: b² − 4ac es negativo.'}]}},
        'formula-racional':()=>{let a,p,q,s;do{a=rng.entero(2,4);s=rng.entero(2,4);p=rng.noCero(-7,7);q=rng.noCero(-7,7)}while(p%a===0||q%s===0||p*s===q*a);// (a x − p)(s x − q)
          const A=a*s,B=-(a*q+p*s),C=p*q,D=B*B-4*A*C,sq=Math.round(Math.sqrt(D));return {e:`${poli(A,B,C)} = 0`,rs:[p/a,q/s],resp:`x = ${frac(p,a,{tex:false})}, x = ${frac(q,s,{tex:false})}`,
            pasos:[paso('a, b, c y discriminante',`\\(a = ${A},\\ b = ${B},\\ c = ${C};\\ b^{2} - 4ac = ${c(D)}\\)`,'Es un cuadrado perfecto: soluciones racionales.'),
              final('Fórmula general',`\\(x = \\dfrac{${-B} \\pm ${sq}}{${2*A}} \\Rightarrow ${c(frac(-B+sq,2*A))},\\ ${c(frac(-B-sq,2*A))}\\)`,'Simplifica cada fracción.',`x = ${frac(p,a,{tex:false})}, x = ${frac(q,s,{tex:false})}`)],
            errores:[{valor:`x = ${frac(B+sq,2*A,{tex:false})}, x = ${frac(B-sq,2*A,{tex:false})}`,por:'Va −b en la fórmula.'},{valor:`x = ${frac(-B+sq,A,{tex:false})}, x = ${frac(-B-sq,A,{tex:false})}`,por:`El denominador es 2a = ${2*A}.`},{valor:`x = ${frac(p,a,{tex:false})}`,por:'Falta la otra solución.'}]}}
      }
    };
    const x=plantillas(rng,P[n]);
    if(x.num!==undefined)return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(e,x.num),pasos:x.pasos,errores:x.errores,regla:R_CUAD,pista:'Calcula b² − 4ac.',teclado:'mat',comprobar:x.comprobar};
    const verificar=x.sin?e=>/no|ningun|sin|∅|vac/i.test(e)&&!/\d/.test(e.replace(/x\s*[²2]/,'')):e=>igualRaices(e,x.rs,x.tol||1e-6);
    return {plantilla:x.plantilla,enunciado:`Resuelve: \\(${x.e}\\)<br><span class="nota">Escribe todas las soluciones separadas por coma: x = 2, x = −3${n===5?' (puedes usar √ o decimales)':''}.</span>`,respuesta:x.resp,verificar,pasos:x.pasos,
      errores:x.errores.map(e=>e.si?e:{...e,si:v=>igualRaices(v,raices(e.valor),x.tol||1e-6)}),regla:R_CUAD,
      pista:n<=2?'¿Puedes factorizar o sacar raíz?':'Iguala a cero y prueba factorizar; si no, usa la fórmula.',teclado:'mat',
      comprobar:()=>x.sin||x.rs.every(r=>{const ev=compilarEc(x.e);return ev?Math.abs(ev(r))<1e-6:true})};
  }
};
// "3x^{2} - 5x + 2 = 0" → f(x) = izquierda − derecha (para comprobar sustituyendo)
function compilarEc(tex){const [i,d]=tex.replace(/\{|\}/g,'').replace(/\\left|\\right/g,'').split('=');try{const f=compilar(i),g=compilar(d);return x=>f({x})-g({x})}catch(e){return null}}

export default {'alg/expresiones':expresiones,'alg/desigualdad':desig,'alg/productos-notables':productos,'alg/cuadratica':cuadratica};
