/* Generadores de cálculo diferencial e integral. Las expresiones se verifican por equivalencia (se evalúan en varios puntos),
   así que cualquier forma correcta vale: "6x+2" o "2(3x+1)". Las antiderivadas exigen la constante + C. */
import {num,igualNum,equivalente,sinConstante,mcd} from './verificar.js';
import {lineal,frac,polinomio,par} from './formato.js';

const T=(c,o={})=>polinomio(c,{tex:true,...o}),X=c=>polinomio(c,{tex:false});      // polinomio en TeX y en texto
const der=c=>c.slice(1).map((a,k)=>a*(k+1));                                         // derivada de coeficientes [a0,a1,…]
const coefsAl=(rng,grado,R)=>{const c=Array.from({length:grado+1},()=>rng.entero(-R,R));if(!c[grado])c[grado]=rng.noCero(1,R);return c};
const lim=a=>`\\lim_{x\\to ${a}}`;
const tex=s=>s.replace(/\^(-?\d+)/g,'^{$1}');
const INF=['infinito','∞','inf','+infinito','+∞','oo'];

// Límites: sustituir (1–2), 0/0 factorizando (3–4), al infinito (5)
const limites={
  titulo:'Límites',
  explicacion:'Primero sustituye. Si sale 0/0, factoriza y simplifica. Si x → ∞, mandan los términos de mayor grado.',
  generar(n,rng){
    if(n===1){const c=coefsAl(rng,2,5),a=rng.entero(-4,4),v=c[0]+c[1]*a+c[2]*a*a;
      return {enunciado:`\\(${lim(a)} (${T(c)})\\)`,respuesta:String(v),verificar:e=>igualNum(e,v),pasos:[`Es un polinomio: sustituye \\(x = ${a}\\)`,`\\(${c[2]}\\cdot${par(a)}^2 + ${c[1]}\\cdot${par(a)} + ${c[0]} = ${v}\\)`],
        errores:[],regla:'En polinomios (funciones continuas) el límite se calcula sustituyendo: lím x→a f(x) = f(a).',pista:'Sustituye x por el valor.',teclado:'mat'}}
    if(n===2){const p=rng.noCero(-6,6),q=rng.noCero(-6,6),a=rng.entero(-4,4);if(a+q===0)return limites.generar(1,rng);
      return {enunciado:`\\(${lim(a)} \\dfrac{${lineal([[1,'x'],[p,'']])}}{${lineal([[1,'x'],[q,'']])}}\\)`,respuesta:frac(a+p,a+q,{tex:false}),verificar:e=>igualNum(e,(a+p)/(a+q)),
        pasos:[`El denominador no se anula en \\(x = ${a}\\): sustituye`,`\\(\\dfrac{${a+p}}{${a+q}} = ${frac(a+p,a+q)}\\)`],errores:[],regla:'Si al sustituir el denominador no es 0, el límite es el valor de la función.',pista:'Sustituye.',teclado:'mat'}}
    if(n<=4){const r=rng.noCero(-6,6);let s;do s=rng.entero(-6,6);while(s===r);
      // (x − r)(x − s)/(x − r) → x − s → r − s   (nivel 4: denominador (x − r)(x + k))
      const num_=[r*s,-(r+s),1];
      if(n===3){const v=r-s;return {enunciado:`\\(${lim(r)} \\dfrac{${T(num_)}}{${lineal([[1,'x'],[-r,'']])}}\\)`,respuesta:String(v),verificar:e=>igualNum(e,v),
        pasos:[`Al sustituir sale \\(\\tfrac{0}{0}\\): factoriza el numerador`,`\\(\\dfrac{(x ${r<0?'+':'-'} ${Math.abs(r)})(x ${s<0?'+':'-'} ${Math.abs(s)})}{x ${r<0?'+':'-'} ${Math.abs(r)}} = x ${s<0?'+':'-'} ${Math.abs(s)}\\)`,`\\(${r} - ${par(s)} = ${v}\\)`],
        errores:[{valor:'0',si:e=>igualNum(e,0)&&v!==0,por:'0/0 no es el resultado: es una indeterminación. Factoriza y simplifica.'},{si:e=>INF.includes(String(e).trim().toLowerCase())||/no existe/i.test(e),por:'Sí existe: al simplificar desaparece el 0 del denominador.'}],
        regla:'Si al sustituir sale 0/0, factoriza, cancela el factor común y vuelve a sustituir.',pista:'El numerador tiene el factor del denominador.',teclado:'mat'}}
      const k=rng.noCero(-5,5);if(r+k===0)return limites.generar(3,rng);
      const den=[-r*k,k-r,1],v=(r-s)/(r+k);
      return {enunciado:`\\(${lim(r)} \\dfrac{${T(num_)}}{${T(den)}}\\)`,respuesta:frac(r-s,r+k,{tex:false}),verificar:e=>igualNum(e,v),
        pasos:[`Sale \\(\\tfrac{0}{0}\\): los dos tienen el factor \\((x ${r<0?'+':'-'} ${Math.abs(r)})\\)`,`Queda \\(\\dfrac{x ${s<0?'+':'-'} ${Math.abs(s)}}{x ${k<0?'-':'+'} ${Math.abs(k)}}\\)`,`\\(\\dfrac{${r-s}}{${r+k}} = ${frac(r-s,r+k)}\\)`],
        errores:[{valor:'0',si:e=>igualNum(e,0)&&v!==0,por:'0/0 es una indeterminación: factoriza los dos y cancela.'}],regla:'Si al sustituir sale 0/0, factoriza numerador y denominador, cancela y vuelve a sustituir.',pista:'Factoriza arriba y abajo.',teclado:'mat'}
    }
    const a=rng.noCero(-6,6),d=rng.noCero(-6,6),gn=2,gd=rng.prob(.7)?2:3,N=coefsAl(rng,gn,6),D=coefsAl(rng,gd,6);N[2]=a;D[gd]=d;
    const v=gd===gn?a/d:0;
    return {enunciado:`\\(${lim('\\infty')} \\dfrac{${T(N)}}{${T(D)}}\\)`,respuesta:gd===gn?frac(a,d,{tex:false}):'0',verificar:e=>igualNum(e,v),
      pasos:[`Mandan los términos de mayor grado: \\(\\dfrac{${a}x^{2}}{${d}x^{${gd}}}\\)`,gd===gn?`Mismo grado: \\(\\dfrac{${a}}{${d}} = ${frac(a,d)}\\)`:'El denominador crece más rápido: el límite es 0'],
      errores:[{si:e=>INF.includes(String(e).trim().toLowerCase()),por:gd===gn?'Con el mismo grado arriba y abajo el límite es el cociente de los coeficientes principales.':'El denominador tiene mayor grado: tiende a 0.'}],
      regla:'Cuando x → ∞ en un cociente de polinomios mandan los términos de mayor grado: mismo grado → cociente de coeficientes; denominador mayor → 0.',pista:'Fíjate solo en los términos de mayor grado.',teclado:'mat'};
  }
};

// Derivada de polinomios: grado 2 (1) → 3 (2) → 4 con negativos (3) → potencias altas (4) → con k/x (5)
const derivadaPolinomio={
  titulo:'Derivada de polinomios',
  explicacion:'Regla de la potencia: (xⁿ)′ = n·xⁿ⁻¹. Las constantes salen y se derivan término a término; un número solo se vuelve 0.',
  generar(n,rng){
    const g=[2,3,4,6,3][n-1],c=coefsAl(rng,g,n<=2?5:9);if(n===4)for(let k=1;k<g;k++)if(rng.prob(.4))c[k]=0;
    const d=der(c);let f=X(c),fT=T(c),dTxt=X(d),dTex=T(d),extra=0;
    if(n===5){extra=rng.noCero(-6,6);f+=` + ${extra}/x`;fT+=` ${extra<0?'-':'+'} \\dfrac{${Math.abs(extra)}}{x}`;dTxt+=` - ${extra}/x^2`;dTex+=` ${extra<0?'+':'-'} \\dfrac{${Math.abs(extra)}}{x^{2}}`}
    const sinExp=X(c.slice(1).map((a,k)=>a)); // olvidó bajar el exponente
    return {enunciado:`Deriva: \\(f(x) = ${fT}\\)`,respuesta:dTxt.replace(/\+ -/g,'- '),verificar:e=>equivalente(String(e).replace(/^f'?\s*\(x\)\s*=/i,''),dTxt),
      pasos:[`Término a término: \\((ax^n)' = a\\,n\\,x^{n-1}\\)`,...(c[0]?[`La constante \\(${c[0]}\\) se vuelve 0`]:[]),...(n===5?[`\\(\\left(\\tfrac{${extra}}{x}\\right)' = (${extra}x^{-1})' = ${-extra}x^{-2}\\)`]:[]),`\\(f'(x) = ${dTex}\\)`],
      pasoMal:{i:0,texto:`Término a término: \\((ax^n)' = a\\,x^{n-1}\\)`,por:'falta multiplicar por el exponente n.'},
      errores:[{valor:sinExp,si:e=>equivalente(e,sinExp)&&!equivalente(sinExp,dTxt),por:'Al derivar xⁿ el exponente baja multiplicando: (xⁿ)′ = n·xⁿ⁻¹.'},...(c[0]?[{si:e=>equivalente(e,`${dTxt} + ${c[0]}`),por:`La derivada de una constante (${c[0]}) es 0.`}]:[])],
      regla:'(xⁿ)′ = n·xⁿ⁻¹; (k·f)′ = k·f′; (f + g)′ = f′ + g′; la derivada de una constante es 0.',pista:'Baja el exponente multiplicando y réstale 1.',teclado:'mat'};
  }
};

// Regla del producto (f·g)′ = f′g + fg′
const producto={
  titulo:'Regla del producto',
  explicacion:'(f·g)′ = f′·g + f·g′: deriva uno dejando el otro, y suma al revés.',
  generar(n,rng){
    const gf=n<=2?1:2,gg=n<=1?1:n<=3?2:3,F=coefsAl(rng,gf,6),G=coefsAl(rng,gg,6);
    const f=X(F),g=X(G),fp=X(der(F)),gp=X(der(G)),resp=`(${fp})(${g}) + (${f})(${gp})`;
    return {enunciado:`Deriva con la regla del producto: \\(h(x) = (${T(F)})(${T(G)})\\)`,respuesta:resp,verificar:e=>equivalente(String(e).replace(/^h'?\s*\(x\)\s*=/i,''),resp),
      pasos:[`\\(f = ${T(F)},\\ f' = ${T(der(F))}\\)`,`\\(g = ${T(G)},\\ g' = ${T(der(G))}\\)`,`\\(h' = f'g + fg' = (${T(der(F))})(${T(G)}) + (${T(F)})(${T(der(G))})\\)`],
      pasoMal:{i:2,texto:`\\(h' = f'g' = (${T(der(F))})(${T(der(G))})\\)`,por:'la derivada de un producto no es el producto de las derivadas.'},
      errores:[{valor:`(${fp})(${gp})`,si:e=>equivalente(e,`(${fp})(${gp})`),por:'La derivada de un producto NO es el producto de las derivadas: (fg)′ = f′g + fg′.'}],
      regla:'Regla del producto: (f·g)′ = f′·g + f·g′.',pista:'Deriva f dejando g; luego deja f y deriva g; suma.',teclado:'mat'};
  }
};

// Regla del cociente (f/g)′ = (f′g − fg′)/g²
const cociente={
  titulo:'Regla del cociente',
  explicacion:'(f/g)′ = (f′·g − f·g′)/g²: "abajo por la derivada de arriba, menos arriba por la derivada de abajo, sobre abajo al cuadrado".',
  generar(n,rng){
    let F,G;
    do{F=coefsAl(rng,n<=2?1:n===3?2:1,6);G=coefsAl(rng,n<=3?1:2,6)}while(F.length===G.length&&F.every((x,i)=>x*G[1]===G[i]*F[1]));
    const f=X(F),g=X(G),fp=X(der(F)),gp=X(der(G)),resp=`((${fp})(${g}) - (${f})(${gp}))/(${g})^2`;
    return {enunciado:`Deriva con la regla del cociente: \\(h(x) = \\dfrac{${T(F)}}{${T(G)}}\\)`,respuesta:resp,verificar:e=>equivalente(String(e).replace(/^h'?\s*\(x\)\s*=/i,''),resp),
      pasos:[`\\(f' = ${T(der(F))},\\ g' = ${T(der(G))}\\)`,`\\(h' = \\dfrac{f'g - fg'}{g^2}\\)`,`\\(h' = \\dfrac{(${T(der(F))})(${T(G)}) - (${T(F)})(${T(der(G))})}{(${T(G)})^2}\\)`],
      errores:[{valor:`((${f})(${gp}) - (${fp})(${g}))/(${g})^2`,si:e=>equivalente(e,`((${f})(${gp}) - (${fp})(${g}))/(${g})^2`),por:'El orden importa: f′g − fg′ (empieza por la derivada de arriba).'},
        {valor:`(${fp})/(${gp})`,si:e=>equivalente(e,`(${fp})/(${gp})`),por:'La derivada de un cociente no es el cociente de las derivadas.'}],
      regla:'Regla del cociente: (f/g)′ = (f′g − fg′)/g².',pista:'f′g − fg′, todo sobre g².',teclado:'mat'};
  }
};

// Regla de la cadena: (ax+b)ⁿ (1–2), (x²+c)ⁿ (3), (ax²+bx+c)ⁿ (4), √(ax+b) (5)
const cadena={
  titulo:'Regla de la cadena',
  explicacion:'(f(g(x)))′ = f′(g(x))·g′(x): deriva la de afuera dejando la de adentro igual, y multiplica por la derivada de adentro.',
  generar(n,rng){
    let I;
    if(n<=2)I=[rng.noCero(-9,9),rng.noCero(n===1?2:-6,6)];else if(n===3)I=[rng.noCero(-9,9),0,1];else if(n===4)I=coefsAl(rng,2,5);else I=[rng.entero(1,9),rng.entero(1,6)];
    const ip=X(der(I)),i=X(I),iT=T(I);
    if(n===5){const resp=`(${ip})/(2*sqrt(${i}))`;
      return {enunciado:`Deriva: \\(h(x) = \\sqrt{${iT}}\\)`,respuesta:resp,verificar:e=>equivalente(String(e).replace(/^h'?\s*\(x\)\s*=/i,''),resp),
        pasos:[`\\(\\sqrt{u} = u^{1/2}\\), con \\(u = ${iT}\\)`,`\\((u^{1/2})' = \\tfrac{1}{2}u^{-1/2}\\cdot u'\\)`,`\\(h' = \\dfrac{${T(der(I))}}{2\\sqrt{${iT}}}\\)`],
        errores:[{valor:`1/(2*sqrt(${i}))`,si:e=>equivalente(e,`1/(2*sqrt(${i}))`),por:`Falta multiplicar por la derivada de adentro (${ip}).`}],
        regla:'Regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x). Para √u: (√u)′ = u′/(2√u).',pista:'Deriva la raíz y multiplica por la derivada de lo de adentro.',teclado:'mat'}}
    const k=rng.entero(2,n<=2?4:6),resp=`${k}(${i})^${k-1}*(${ip})`;
    return {enunciado:`Deriva: \\(h(x) = (${iT})^{${k}}\\)`,respuesta:resp,verificar:e=>equivalente(String(e).replace(/^h'?\s*\(x\)\s*=/i,''),resp),
      pasos:[`Afuera \\(u^{${k}}\\), adentro \\(u = ${iT}\\), \\(u' = ${T(der(I))}\\)`,`\\((u^{${k}})' = ${k}u^{${k-1}}\\cdot u'\\)`,`\\(h' = ${k}(${iT})^{${k-1}}\\cdot(${T(der(I))})\\)`],
      pasoMal:{i:1,texto:`\\((u^{${k}})' = ${k}u^{${k-1}}\\)`,por:'falta multiplicar por la derivada de adentro.'},
      errores:[{valor:`${k}(${i})^${k-1}`,si:e=>equivalente(e,`${k}(${i})^${k-1}`),por:`Falta multiplicar por la derivada de adentro (${ip}).`}],
      regla:'Regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x).',pista:'Deriva "lo de afuera" y multiplica por la derivada de "lo de adentro".',teclado:'mat'};
  }
};

/* ---------- integrales ---------- */
// Antiderivada de un polinomio en texto (con fracciones) y TeX
function antider(c){
  const t=c.map((a,k)=>[a,k+1]).filter(([a])=>a);
  const txt=t.map(([a,k])=>{const g=mcd(a,k);return `${a<0?'-':'+'} (${Math.abs(a)/g}/${k/g})x^${k}`}).join(' ').replace(/^\+ /,'').replace(/\(([^/()]+)\/1\)/g,'$1');
  const texto=t.map(([a,k],i)=>`${a<0?'-':i?'+':''} ${frac(Math.abs(a),k)}x^{${k}}`).join(' ').replace(/(^|[+-] )1x/g,'$1x');
  return {txt,tex:texto};
}
const conC=(e,F)=>{const [s,c]=sinConstante(e);return c&&equivalente(s,F,{constanteLibre:true})};
const faltaC=F=>({si:e=>{const [s,c]=sinConstante(e);return !c&&equivalente(s,F,{constanteLibre:true})},por:'Falta la constante: toda antiderivada lleva + C.'});

const antiderivada={
  titulo:'Antiderivadas básicas',
  explicacion:'∫ xⁿ dx = xⁿ⁺¹/(n+1) + C: sube el exponente en 1 y divide entre el nuevo. Las constantes salen; las sumas se integran término a término.',
  generar(n,rng){
    const g=[1,2,3,4,3][n-1],c=coefsAl(rng,g,n<=2?6:9),A=antider(c);
    let txt=A.txt,te=A.tex,fT=T(c);
    if(n===5){const k=rng.noCero(-5,5);fT+=` ${k<0?'-':'+'} \\dfrac{${Math.abs(k)}}{x^{2}}`;txt+=` - (${k})/x`;te+=` ${k<0?'+':'-'} \\dfrac{${Math.abs(k)}}{x}`}
    const dTxt=X(der(c));
    return {enunciado:`Calcula \\(\\displaystyle\\int (${fT})\\,dx\\)`,respuesta:`${txt} + C`,verificar:e=>conC(e,txt),
      pasos:[`Término a término: \\(\\int ax^n dx = \\dfrac{a}{n+1}x^{n+1}\\)`,`\\(${te} + C\\)`],
      errores:[faltaC(txt),{valor:`${dTxt} + C`,si:e=>{const [s]=sinConstante(e);return equivalente(s,dTxt)},por:'Eso es la derivada; para integrar se SUBE el exponente y se divide.'}],
      regla:'∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C (n ≠ −1). Las constantes salen y una suma se integra término a término.',pista:'Exponente + 1 y divide entre el nuevo exponente.',teclado:'mat'};
  }
};

// Integral definida de un polinomio (resultado exacto como fracción)
function definidaExacta(c,a,b){let N=0;for(let k=0;k<c.length;k++)N+=c[k]*(b**(k+1)-a**(k+1))*(12/(k+1));return [N,12]}
const definida={
  titulo:'Integral definida',
  explicacion:'∫ₐᵇ f(x) dx = F(b) − F(a): busca una antiderivada F y resta su valor en los límites.',
  generar(n,rng){
    const g=[0,1,2,2,3][n-1],c=coefsAl(rng,g,n<=2?5:6);let a=n<=2?0:rng.entero(-3,2),b=a+rng.entero(1,n<=3?3:4);
    const [N,D]=definidaExacta(c,a,b),v=N/D,A=antider(c);
    return {enunciado:`Calcula \\(\\displaystyle\\int_{${a}}^{${b}} (${T(c)})\\,dx\\)`,respuesta:frac(N,D,{tex:false}),verificar:e=>igualNum(e,v),
      pasos:[`Antiderivada: \\(F(x) = ${A.tex}\\)`,`\\(F(${b}) - F(${a})\\)`,`\\(= ${frac(N,D)}\\)`],
      errores:[{valor:frac(-N,D,{tex:false}),si:e=>igualNum(e,-v)&&v!==0,por:'Es F(b) − F(a): el límite de arriba menos el de abajo.'}],
      regla:'Teorema fundamental: ∫ₐᵇ f(x) dx = F(b) − F(a), con F antiderivada de f (aquí no hace falta + C).',pista:'Primero la antiderivada; luego evalúa arriba menos abajo.',teclado:'mat'};
  }
};

// Sustitución: ∫ k(ax+b)ⁿ (1–2), ∫ 2x(x²+c)ⁿ (3), ∫ x(x²+c)ⁿ (4), ∫ (2ax+b)(ax²+bx+c)ⁿ (5)
const sustitucion={
  titulo:'Integración por sustitución',
  explicacion:'Si aparece una función y su derivada, llama u a la de adentro: du = u′ dx, integra en u y vuelve a x.',
  generar(n,rng){
    const m=rng.entero(2,n<=2?4:5);let inner,innerT,fT,F,du;
    if(n<=2){const a=rng.entero(2,6),b=rng.noCero(-7,7),k=n===1?a:rng.entero(1,4)*a;inner=`${a}x + ${b}`.replace('+ -','- ');innerT=lineal([[a,'x'],[b,'']]);
      fT=`${k===1?'':k}(${innerT})^{${m}}`;F=`(${k}/(${a*(m+1)}))(${inner})^${m+1}`;du=`\\(u = ${innerT},\\ du = ${a}\\,dx\\)`}
    else{const c=rng.noCero(-6,6),I=n===5?coefsAl(rng,2,4):[c,0,1];inner=X(I);innerT=T(I);const dI=der(I),f=n===4?'x':`(${T(dI)})`;
      fT=`${f}(${innerT})^{${m}}`;F=n===4?`(1/${2*(m+1)})(${inner})^${m+1}`:`(1/${m+1})(${inner})^${m+1}`;du=`\\(u = ${innerT},\\ du = (${T(dI)})\\,dx\\)`}
    return {enunciado:`Calcula \\(\\displaystyle\\int ${fT}\\,dx\\)`,respuesta:`${F} + C`,verificar:e=>conC(e,F),
      pasos:[du,`Integra en u: \\(\\int u^{${m}}\\,du = \\dfrac{u^{${m+1}}}{${m+1}}\\)`,`Vuelve a x y ajusta las constantes: \\(${F.replace(/\^(\d+)/g,'^{$1}').replace(/\*/g,'')} + C\\)`],
      errores:[faltaC(F),{si:e=>{const [s]=sinConstante(e);return equivalente(s,`(${inner})^${m+1}/${m+1}`)&&!equivalente(F,`(${inner})^${m+1}/${m+1}`,{constanteLibre:true})},por:'Falta dividir (o multiplicar) por la constante que sale de du.'}],
      regla:'Sustitución: si el integrando es f(g(x))·g′(x), con u = g(x) queda ∫ f(u) du. Vuelve a escribir en x y suma + C.',pista:'¿Qué parte tiene su derivada al lado?',teclado:'mat'};
  }
};

// Área bajo la curva: f positiva en [a, b] (1–3) o parábola entre sus raíces (4–5)
const area={
  titulo:'Área bajo la curva',
  explicacion:'El área entre una curva positiva y el eje x, de a a b, es ∫ₐᵇ f(x) dx. Si la curva queda bajo el eje, el área es el valor absoluto.',
  generar(n,rng){
    if(n<=3){let c,a,b;do{c=coefsAl(rng,n===1?1:2,5);a=rng.entero(0,2);b=a+rng.entero(1,3)}while([a,b,(a+b)/2].some(x=>c.reduce((s,k,i)=>s+k*x**i,0)<=0));
      const [N,D]=definidaExacta(c,a,b);
      return {enunciado:`Área bajo \\(f(x) = ${T(c)}\\) entre \\(x = ${a}\\) y \\(x = ${b}\\)`,respuesta:frac(N,D,{tex:false}),verificar:e=>igualNum(e,N/D),
        pasos:[`f es positiva en el intervalo: el área es \\(\\int_{${a}}^{${b}} f(x)\\,dx\\)`,`\\(F(x) = ${antider(c).tex}\\)`,`\\(F(${b}) - F(${a}) = ${frac(N,D)}\\)`],errores:[],
        regla:'Área bajo una curva positiva entre a y b = ∫ₐᵇ f(x) dx.',pista:'Integra de a a b.',teclado:'mat'}}
    const r=rng.entero(-3,1),s=r+rng.entero(1,4),k=rng.entero(1,3)*(n===5?-1:1);
    // f = −k(x − r)(x − s) (arriba del eje entre las raíces si k>0); nivel 5: k<0, queda debajo → valor absoluto
    const c=[-k*r*s,k*(r+s),-k],[N,D]=definidaExacta(c,r,s),v=Math.abs(N/D);
    return {enunciado:`Área entre \\(f(x) = ${T(c)}\\) y el eje x${n===5?' (ojo: la curva queda debajo del eje)':''}`,respuesta:frac(Math.abs(N),D,{tex:false}),verificar:e=>igualNum(e,v),
      pasos:[`Raíces (cortes con el eje): \\(x = ${r}\\) y \\(x = ${s}\\)`,`\\(\\int_{${r}}^{${s}} f(x)\\,dx = ${frac(N,D)}\\)`,n===5?`Es negativa: el área es su valor absoluto, \\(${frac(Math.abs(N),D)}\\)`:`Área \\(= ${frac(N,D)}\\)`],
      errores:n===5?[{valor:frac(N,D,{tex:false}),si:e=>igualNum(e,N/D),por:'Un área no puede ser negativa: si la curva está debajo del eje, toma el valor absoluto.'}]:[],
      regla:'Área entre una curva y el eje x: integra entre los cortes; si la curva está debajo del eje, toma el valor absoluto.',pista:'Busca dónde corta el eje x.',teclado:'mat'};
  }
};

export default {'cd/limites':limites,'cd/derivada-polinomio':derivadaPolinomio,'cd/producto':producto,'cd/cociente':cociente,'cd/cadena':cadena,
  'ci/antiderivada':antiderivada,'ci/definida':definida,'ci/sustitucion':sustitucion,'ci/area':area};
