/* Generadores de cálculo diferencial e integral. Las expresiones se verifican por equivalencia (se evalúan en varios puntos),
   así que cualquier forma correcta vale: "6x+2" o "2(3x+1)". Las antiderivadas exigen la constante + C.
   Los pasos usan los números de cada ejercicio (ver pasos.js). */
import {igualNum,equivalente,sinConstante,mcd} from './verificar.js';
import {lineal,frac,polinomio,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {areaCurva} from './diagramas.js';

const T=(cf,o={})=>polinomio(cf,{tex:true,...o}),X=cf=>polinomio(cf,{tex:false});      // polinomio en TeX y en texto
const der=cf=>cf.slice(1).map((a,k)=>a*(k+1));                                         // derivada de coeficientes [a0,a1,…]
const coefsAl=(rng,grado,R)=>{const cf=Array.from({length:grado+1},()=>rng.entero(-R,R));if(!cf[grado])cf[grado]=rng.noCero(1,R);return cf};
const lim=a=>`\\lim_{x\\to ${a}}`;
const INF=['infinito','∞','inf','+infinito','+∞','oo'];
const evalp=(cf,x)=>cf.reduce((s,a,k)=>s+a*x**k,0);
const sinPrefijo=e=>String(e).replace(/^[a-z]'?\s*\(x\)\s*=/i,'');
const sg=(a,o)=>a<0?`- ${Math.abs(a)}`:`+ ${a}`;

// Límites: sustituir (1–2), 0/0 factorizando (3–4), al infinito (5)
const limites={
  titulo:'Límites',
  explicacion:'Primero sustituye. Si sale 0/0, factoriza y simplifica. Si x → ∞, mandan los términos de mayor grado.',
  alternativa:'Un límite pregunta: "¿a qué valor se <b>acerca</b> la función si me acerco a ese punto?", aunque justo en el punto haya un hueco. Es como ver a dónde lleva un camino aunque falte una baldosa: si al sustituir sale 0/0 (la baldosa que falta), simplificas para "tapar el hueco" y miras otra vez.',
  generar(n,rng){
    const R='En polinomios el límite se calcula sustituyendo. Si sale 0/0, factoriza y cancela. Si x → ∞, mandan los términos de mayor grado.';
    if(n===1){const cf=coefsAl(rng,2,5),a=rng.entero(-4,4),v=evalp(cf,a);
      return {enunciado:`\\(${lim(a)} (${T(cf)})\\)`,respuesta:String(v),verificar:e=>igualNum(e,v),
        pasos:[paso('Mira qué tipo de función es',`\\(${T(cf)}\\) es un polinomio`,'Los polinomios no tienen huecos: el límite es el valor de la función.'),
          paso(`Sustituye x = ${a}`,`\\(${cf[2]}\\cdot${par(a)}^2 ${sg(cf[1])}\\cdot${par(a)} ${sg(cf[0])}\\)`,'Pon el número en cada x.',{ojo:'Un negativo al cuadrado da positivo.'}),
          final('Calcula',`\\(${cf[2]*a*a} ${sg(cf[1]*a)} ${sg(cf[0])} = ${c(v)}\\)`,'Ese es el límite.',String(v))],
        errores:[],regla:R,pista:'Sustituye x por el valor.',teclado:'mat'}}
    if(n===2){const p=rng.noCero(-6,6),q=rng.noCero(-6,6),a=rng.entero(-4,4);if(a+q===0)return limites.generar(1,rng);
      return {enunciado:`\\(${lim(a)} \\dfrac{${lineal([[1,'x'],[p,'']])}}{${lineal([[1,'x'],[q,'']])}}\\)`,respuesta:frac(a+p,a+q,{tex:false}),verificar:e=>igualNum(e,(a+p)/(a+q)),
        pasos:[paso('Revisa el denominador en el punto',`\\(${a} ${sg(q)} = ${c(a+q)} \\neq 0\\)`,'Si el denominador no se anula, no hay hueco: se puede sustituir.'),
          paso('Sustituye arriba y abajo',`\\(\\dfrac{${a} ${sg(p)}}{${a} ${sg(q)}} = \\dfrac{${a+p}}{${a+q}}\\)`,'Cada x se cambia por el número.'),
          final('Simplifica',`\\(${c(frac(a+p,a+q))}\\)`,'Reduce la fracción si se puede.',frac(a+p,a+q,{tex:false}))],
        errores:[],regla:R,pista:'Sustituye.',teclado:'mat'}}
    if(n<=4){const r=rng.noCero(-6,6);let s;do s=rng.entero(-6,6);while(s===r);
      const num_=[r*s,-(r+s),1],fr=`x ${sg(-r)}`,fs=`x ${sg(-s)}`;
      if(n===3){const v=r-s;return {enunciado:`\\(${lim(r)} \\dfrac{${T(num_)}}{${fr}}\\)`,respuesta:String(v),verificar:e=>igualNum(e,v),
        pasos:[paso('Intenta sustituir',`Arriba: \\(${r}^2 ${sg(-(r+s))}\\cdot${par(r)} ${sg(r*s)} = 0\\); abajo: \\(${r} ${sg(-r)} = 0\\) → \\(\\tfrac{0}{0}\\)`,'0/0 no es un número: es una señal de que hay un factor que se puede cancelar.',{ojo:'0/0 no vale 0 ni "no existe": hay que simplificar.'}),
          paso('Factoriza el numerador',`\\(${T(num_)} = ${c(`(${fr})(${fs})`)}\\)`,`Si en x = ${r} se anula, \\((${fr})\\) es un factor.`),
          paso('Cancela el factor común',`\\(\\dfrac{(${fr})(${fs})}{${fr}} = ${c(fs)}\\)`,`Para x ≠ ${r} son la misma expresión: el límite no cambia.`),
          final('Ahora sí, sustituye',`\\(${r} ${sg(-s)} = ${c(v)}\\)`,'Ya no hay división entre cero.',String(v))],
        errores:[{valor:'0',si:e=>igualNum(e,0)&&v!==0,por:'0/0 no es el resultado: es una indeterminación. Factoriza y simplifica.'},{si:e=>INF.includes(String(e).trim().toLowerCase())||/no existe/i.test(e),por:'Sí existe: al simplificar desaparece el 0 del denominador.'}],
        regla:R,pista:'El numerador tiene el factor del denominador.',teclado:'mat'}}
      const k=rng.noCero(-5,5);if(r+k===0)return limites.generar(3,rng);
      const den=[-r*k,k-r,1],fk=`x ${sg(k)}`,v=(r-s)/(r+k);
      return {enunciado:`\\(${lim(r)} \\dfrac{${T(num_)}}{${T(den)}}\\)`,respuesta:frac(r-s,r+k,{tex:false}),verificar:e=>igualNum(e,v),
        pasos:[paso('Intenta sustituir',`Arriba y abajo dan 0 → \\(\\tfrac{0}{0}\\)`,'Indeterminación: los dos tienen el factor que se anula en el punto.'),
          paso('Factoriza arriba y abajo',`\\(\\dfrac{(${fr})(${fs})}{(${fr})(${fk})}\\)`,'Busca dos números que multipliquen el término independiente y sumen el del medio.'),
          paso('Cancela el factor común',`\\(${c(`\\dfrac{${fs}}{${fk}}`)}\\)`,`El factor \\((${fr})\\) se va.`),
          final('Sustituye',`\\(\\dfrac{${r-s}}{${r+k}} = ${c(frac(r-s,r+k))}\\)`,'Ya no se anula el denominador.',frac(r-s,r+k,{tex:false}))],
        errores:[{valor:'0',si:e=>igualNum(e,0)&&v!==0,por:'0/0 es una indeterminación: factoriza los dos y cancela.'}],regla:R,pista:'Factoriza arriba y abajo.',teclado:'mat'}
    }
    const a=rng.noCero(-6,6),d=rng.noCero(-6,6),gd=rng.prob(.7)?2:3,N=coefsAl(rng,2,6),D=coefsAl(rng,gd,6);N[2]=a;D[gd]=d;
    const v=gd===2?a/d:0;
    return {enunciado:`\\(${lim('\\infty')} \\dfrac{${T(N)}}{${T(D)}}\\)`,respuesta:gd===2?frac(a,d,{tex:false}):'0',verificar:e=>igualNum(e,v),
      pasos:[paso('Quédate con los términos de mayor grado',`\\(\\dfrac{${c(`${a}x^{2}`)}}{${c(`${d}x^{${gd}}`)}}\\)`,'Cuando x es enorme, los demás términos son despreciables.'),
        paso('Simplifica las potencias de x',gd===2?`\\(\\dfrac{${a}x^{2}}{${d}x^{2}} = \\dfrac{${a}}{${d}}\\)`:`\\(\\dfrac{${a}x^{2}}{${d}x^{3}} = \\dfrac{${a}}{${d}x}\\)`,gd===2?'Mismo grado: las x se cancelan.':'Queda una x abajo: al crecer, la fracción se achica.'),
        final('Resultado',`\\(${c(gd===2?frac(a,d):'0')}\\)`,gd===2?'Mismo grado → cociente de los coeficientes principales.':'Denominador de mayor grado → tiende a 0.',gd===2?frac(a,d,{tex:false}):'0')],
      errores:[{si:e=>INF.includes(String(e).trim().toLowerCase()),por:gd===2?'Con el mismo grado arriba y abajo el límite es el cociente de los coeficientes principales.':'El denominador tiene mayor grado: tiende a 0.'}],
      regla:R,pista:'Fíjate solo en los términos de mayor grado.',teclado:'mat'};
  }
};

// Derivada de polinomios: grado 2 (1) → 3 (2) → 4 con negativos (3) → potencias altas (4) → con k/x (5)
const derivadaPolinomio={
  titulo:'Derivada de polinomios',
  explicacion:'Regla de la potencia: (xⁿ)′ = n·xⁿ⁻¹. Las constantes salen y se derivan término a término; un número solo se vuelve 0.',
  alternativa:'La derivada dice <b>qué tan rápido cambia</b> algo. Un número solo (como 7) nunca cambia: su derivada es 0. En \\(x^{3}\\), el exponente "baja" a multiplicar y queda uno menos: \\(3x^{2}\\). Es una receta que se aplica a cada término por separado.',
  generar(n,rng){
    const g=[2,3,4,6,3][n-1],cf=coefsAl(rng,g,n<=2?5:9);if(n===4)for(let k=1;k<g;k++)if(rng.prob(.4))cf[k]=0;
    const d=der(cf);let f=X(cf),fT=T(cf),dTxt=X(d),dTex=T(d),extra=0;
    if(n===5){extra=rng.noCero(-6,6);f+=` + ${extra}/x`;fT+=` ${extra<0?'-':'+'} \\dfrac{${Math.abs(extra)}}{x}`;dTxt+=` - ${extra}/x^2`;dTex+=` ${extra<0?'+':'-'} \\dfrac{${Math.abs(extra)}}{x^{2}}`}
    dTxt=dTxt.replace(/\+ -/g,'- ').replace(/- -/g,'+ ');
    const sinExp=X(cf.slice(1));
    const terminos=cf.map((a,k)=>[a,k]).filter(([a,k])=>a&&k>0).reverse().slice(0,3);
    return {enunciado:`Deriva: \\(f(x) = ${fT}\\)`,respuesta:dTxt,verificar:e=>equivalente(sinPrefijo(e),dTxt),
      pasos:[paso('Deriva término a término',`\\((${fT})' = ${cf.map((a,k)=>[a,k]).filter(([a])=>a).reverse().map(([a,k])=>`(${k?`${a}x^{${k}}`:a})'`).join(' + ')}${n===5?` + \\left(\\tfrac{${extra}}{x}\\right)'`:''}\\)`,'La derivada de una suma es la suma de las derivadas.'),
        paso('Baja el exponente y réstale 1',terminos.map(([a,k])=>`\\((${a}x^{${k}})' = ${a}\\cdot${k}x^{${k-1}} = ${c(`${a*k}x^{${k-1}}`)}\\)`).join('<br>'),'(axⁿ)′ = a·n·xⁿ⁻¹.',{ojo:'Multiplica el coeficiente por el exponente.'}),
        ...(cf[0]?[paso('La constante desaparece',`\\((${cf[0]})' = ${c(0)}\\)`,'Un número solo no cambia: su derivada es 0.')]:[]),
        ...(n===5?[paso('El término con x abajo',`\\(\\tfrac{${extra}}{x} = ${extra}x^{-1}\\ \\Rightarrow\\ ${c(`${-extra}x^{-2}`)}\\)`,'Escríbelo como potencia negativa y aplica la misma regla.')]:[]),
        final('Junta los términos',`\\(f'(x) = ${dTex}\\)`,'Esa es la derivada.',dTxt)],
      pasoMal:{i:1,texto:terminos.map(([a,k])=>`\\((${a}x^{${k}})' = ${c(`${a}x^{${k-1}}`)}\\)`).join('<br>'),por:'falta multiplicar por el exponente.'},
      errores:[{valor:sinExp,si:e=>equivalente(e,sinExp)&&!equivalente(sinExp,dTxt),por:'Al derivar xⁿ el exponente baja multiplicando: (xⁿ)′ = n·xⁿ⁻¹.'},...(cf[0]?[{si:e=>equivalente(e,`${dTxt} + ${cf[0]}`),por:`La derivada de una constante (${cf[0]}) es 0.`}]:[])],
      regla:'(xⁿ)′ = n·xⁿ⁻¹; (k·f)′ = k·f′; (f + g)′ = f′ + g′; la derivada de una constante es 0.',pista:'Baja el exponente multiplicando y réstale 1.',teclado:'mat'};
  }
};

// Regla del producto (f·g)′ = f′g + fg′
const producto={
  titulo:'Regla del producto',
  explicacion:'(f·g)′ = f′·g + f·g′: deriva uno dejando el otro, y suma al revés.',
  alternativa:'Piensa en el área de un rectángulo de lados f y g que crecen. Si crece el lado f, el área aumenta f′·g; si crece g, aumenta f·g′. El cambio total es la suma de los dos: f′g + fg′. Por eso NO es simplemente f′·g′.',
  generar(n,rng){
    const gf=n<=2?1:2,gg=n<=1?1:n<=3?2:3,F=coefsAl(rng,gf,6),G=coefsAl(rng,gg,6);
    const f=X(F),g=X(G),fp=X(der(F)),gp=X(der(G)),resp=`(${fp})(${g}) + (${f})(${gp})`;
    return {enunciado:`Deriva con la regla del producto: \\(h(x) = (${T(F)})(${T(G)})\\)`,respuesta:resp,verificar:e=>equivalente(sinPrefijo(e),resp),
      pasos:[paso('Identifica los dos factores',`\\(f = ${T(F)}\\), \\(g = ${T(G)}\\)`,'Es un producto de dos funciones.'),
        paso('Deriva cada factor',`\\(f' = ${c(T(der(F)))}\\), \\(g' = ${c(T(der(G)))}\\)`,'Regla de la potencia en cada uno.'),
        paso('Aplica la regla del producto',`\\(h' = f'g + fg' = (${T(der(F))})(${T(G)}) + (${T(F)})(${T(der(G))})\\)`,'Deriva uno dejando el otro igual, y al revés; suma.',{ojo:'No es f′·g′.'}),
        final('Simplifica (opcional)',`\\(h' = ${c(T(sumaPol(mulPol(der(F),G),mulPol(F,der(G)))))}\\)`,'Puedes dejarlo sin simplificar: es la misma expresión.',resp)],
      pasoMal:{i:2,texto:`\\(h' = f'g' = (${T(der(F))})(${T(der(G))})\\)`,por:'la derivada de un producto no es el producto de las derivadas.'},
      errores:[{valor:`(${fp})(${gp})`,si:e=>equivalente(e,`(${fp})(${gp})`),por:'La derivada de un producto NO es el producto de las derivadas: (fg)′ = f′g + fg′.'}],
      regla:'Regla del producto: (f·g)′ = f′·g + f·g′.',pista:'Deriva f dejando g; luego deja f y deriva g; suma.',teclado:'mat'};
  }
};
const mulPol=(A,B)=>{const r=Array(A.length+B.length-1).fill(0);A.forEach((a,i)=>B.forEach((b,j)=>r[i+j]+=a*b));return r};
const sumaPol=(A,B)=>Array.from({length:Math.max(A.length,B.length)},(_,i)=>(A[i]||0)+(B[i]||0));

// Regla del cociente (f/g)′ = (f′g − fg′)/g²
const cociente={
  titulo:'Regla del cociente',
  explicacion:'(f/g)′ = (f′·g − f·g′)/g²: "abajo por la derivada de arriba, menos arriba por la derivada de abajo, sobre abajo al cuadrado".',
  alternativa:'Truco para recordarla: "<b>baja por de arriba, menos arriba por de abajo, sobre abajo al cuadrado</b>". El orden importa porque hay una resta: empieza siempre por la derivada del de arriba.',
  generar(n,rng){
    let F,G;
    do{F=coefsAl(rng,n<=2?1:n===3?2:1,6);G=coefsAl(rng,n<=3?1:2,6)}while(F.length===G.length&&F.every((x,i)=>x*G[1]===G[i]*F[1]));
    const f=X(F),g=X(G),fp=X(der(F)),gp=X(der(G)),resp=`((${fp})(${g}) - (${f})(${gp}))/(${g})^2`,numS=sumaPol(mulPol(der(F),G),mulPol(F,der(G)).map(x=>-x));
    return {enunciado:`Deriva con la regla del cociente: \\(h(x) = \\dfrac{${T(F)}}{${T(G)}}\\)`,respuesta:resp,verificar:e=>equivalente(sinPrefijo(e),resp),
      pasos:[paso('Identifica arriba y abajo',`\\(f = ${T(F)}\\) (arriba), \\(g = ${T(G)}\\) (abajo)`,'Es un cociente de dos funciones.'),
        paso('Deriva cada una',`\\(f' = ${c(T(der(F)))}\\), \\(g' = ${c(T(der(G)))}\\)`,'Regla de la potencia.'),
        paso('Aplica la regla',`\\(h' = \\dfrac{(${T(der(F))})(${T(G)}) - (${T(F)})(${T(der(G))})}{(${T(G)})^2}\\)`,'f′g − fg′ sobre g².',{ojo:'El orden de la resta importa: primero f′g.'}),
        final('Simplifica el numerador',`\\(h' = \\dfrac{${c(T(numS))}}{(${T(G)})^2}\\)`,'Desarrolla y junta términos semejantes (el denominador se deja así).',resp)],
      errores:[{valor:`((${f})(${gp}) - (${fp})(${g}))/(${g})^2`,si:e=>equivalente(e,`((${f})(${gp}) - (${fp})(${g}))/(${g})^2`),por:'El orden importa: f′g − fg′ (empieza por la derivada de arriba).'},
        {valor:`(${fp})/(${gp})`,si:e=>equivalente(e,`(${fp})/(${gp})`),por:'La derivada de un cociente no es el cociente de las derivadas.'}],
      regla:'Regla del cociente: (f/g)′ = (f′g − fg′)/g².',pista:'f′g − fg′, todo sobre g².',teclado:'mat'};
  }
};

// Regla de la cadena: (ax+b)ⁿ (1–2), (x²+c)ⁿ (3), (ax²+bx+c)ⁿ (4), √(ax+b) (5)
const cadena={
  titulo:'Regla de la cadena',
  explicacion:'(f(g(x)))′ = f′(g(x))·g′(x): deriva la de afuera dejando la de adentro igual, y multiplica por la derivada de adentro.',
  alternativa:'Es como pelar una cebolla: derivas la <b>capa de afuera</b> (la potencia o la raíz) sin tocar lo de adentro, y después multiplicas por la derivada de <b>lo de adentro</b>. Si lo de adentro cambia el doble de rápido, todo cambia el doble de rápido: por eso se multiplica.',
  generar(n,rng){
    let I;
    if(n<=2)I=[rng.noCero(-9,9),rng.noCero(n===1?2:-6,6)];else if(n===3)I=[rng.noCero(-9,9),0,1];else if(n===4)I=coefsAl(rng,2,5);else I=[rng.entero(1,9),rng.entero(1,6)];
    const ip=X(der(I)),i=X(I),iT=T(I),ipT=T(der(I));
    if(n===5){const resp=`(${ip})/(2*sqrt(${i}))`;
      return {enunciado:`Deriva: \\(h(x) = \\sqrt{${iT}}\\)`,respuesta:resp,verificar:e=>equivalente(sinPrefijo(e),resp),
        pasos:[paso('Identifica afuera y adentro',`Afuera: \\(\\sqrt{u} = u^{1/2}\\). Adentro: \\(u = ${c(iT)}\\)`,'Una función dentro de otra.'),
          paso('Deriva la de afuera (deja u igual)',`\\((u^{1/2})' = \\tfrac{1}{2}u^{-1/2} = ${c('\\dfrac{1}{2\\sqrt{u}}')}\\)`,'Regla de la potencia con exponente 1/2.'),
          paso('Deriva la de adentro',`\\(u' = ${c(ipT)}\\)`,'La derivada de lo que está dentro de la raíz.'),
          final('Multiplica',`\\(h' = \\dfrac{1}{2\\sqrt{${iT}}}\\cdot ${ipT} = ${c(`\\dfrac{${ipT}}{2\\sqrt{${iT}}}`)}\\)`,'La regla de la cadena multiplica las dos derivadas.',resp,{ojo:'Sin la derivada de adentro el resultado está incompleto.'})],
        errores:[{valor:`1/(2*sqrt(${i}))`,si:e=>equivalente(e,`1/(2*sqrt(${i}))`),por:`Falta multiplicar por la derivada de adentro (${ip}).`}],
        regla:'Regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x). Para √u: (√u)′ = u′/(2√u).',pista:'Deriva la raíz y multiplica por la derivada de lo de adentro.',teclado:'mat'}}
    const k=rng.entero(2,n<=2?4:6),resp=`${k}(${i})^${k-1}*(${ip})`;
    return {enunciado:`Deriva: \\(h(x) = (${iT})^{${k}}\\)`,respuesta:resp,verificar:e=>equivalente(sinPrefijo(e),resp),
      pasos:[paso('Identifica afuera y adentro',`Afuera: \\(u^{${k}}\\). Adentro: \\(u = ${c(iT)}\\)`,'Hay una función dentro de otra: se usa la regla de la cadena.'),
        paso('Deriva la de afuera dejando u igual',`\\((u^{${k}})' = ${c(`${k}u^{${k-1}}`)} = ${k}(${iT})^{${k-1}}\\)`,'Regla de la potencia, sin tocar lo de adentro.'),
        paso('Deriva la de adentro',`\\(u' = (${iT})' = ${c(ipT)}\\)`,'La derivada de lo que está dentro del paréntesis.'),
        final('Multiplica las dos',`\\(h' = ${k}(${iT})^{${k-1}}\\cdot(${ipT})\\)`,'Derivada de afuera por derivada de adentro.',resp,{ojo:'Olvidar multiplicar por la derivada de adentro es el error más común.'})],
      pasoMal:{i:3,texto:`\\(h' = ${k}(${iT})^{${k-1}}\\)`,por:'falta multiplicar por la derivada de adentro.'},
      errores:[{valor:`${k}(${i})^${k-1}`,si:e=>equivalente(e,`${k}(${i})^${k-1}`),por:`Falta multiplicar por la derivada de adentro (${ip}).`}],
      regla:'Regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x).',pista:'Deriva "lo de afuera" y multiplica por la derivada de "lo de adentro".',teclado:'mat'};
  }
};

/* ---------- integrales ---------- */
// Antiderivada de un polinomio en texto (con fracciones) y TeX
function antider(cf){
  const t=cf.map((a,k)=>[a,k+1]).filter(([a])=>a);
  const txt=t.map(([a,k])=>{const g=mcd(a,k);return `${a<0?'-':'+'} (${Math.abs(a)/g}/${k/g})x^${k}`}).join(' ').replace(/^\+ /,'').replace(/\(([^/()]+)\/1\)/g,'$1');
  const texto=t.map(([a,k],i)=>`${a<0?'-':i?'+':''} ${frac(Math.abs(a),k)}x^{${k}}`).join(' ').replace(/(^|[+-] )1x/g,'$1x');
  return {txt,tex:texto};
}
const conC=(e,F)=>{const [s,cc]=sinConstante(e);return cc&&equivalente(s,F,{constanteLibre:true})};
const faltaC=F=>({si:e=>{const [s,cc]=sinConstante(e);return !cc&&equivalente(s,F,{constanteLibre:true})},por:'Falta la constante: toda antiderivada lleva + C.'});

const antiderivada={
  titulo:'Antiderivadas básicas',
  explicacion:'∫ xⁿ dx = xⁿ⁺¹/(n+1) + C: sube el exponente en 1 y divide entre el nuevo. Las constantes salen; las sumas se integran término a término.',
  alternativa:'Integrar es <b>derivar al revés</b>: buscas una función cuya derivada sea la que te dan. Como derivar baja el exponente y multiplica, integrar sube el exponente y divide. El + C aparece porque cualquier número sumado desaparece al derivar, así que no sabemos cuál era.',
  generar(n,rng){
    const g=[1,2,3,4,3][n-1],cf=coefsAl(rng,g,n<=2?6:9),A=antider(cf);
    let txt=A.txt,te=A.tex,fT=T(cf),extra=0;
    if(n===5){extra=rng.noCero(-5,5);fT+=` ${extra<0?'-':'+'} \\dfrac{${Math.abs(extra)}}{x^{2}}`;txt+=` - (${extra})/x`;te+=` ${extra<0?'+':'-'} \\dfrac{${Math.abs(extra)}}{x}`}
    const dTxt=X(der(cf)),terms=cf.map((a,k)=>[a,k]).filter(([a])=>a).reverse().slice(0,3);
    return {enunciado:`Calcula \\(\\displaystyle\\int (${fT})\\,dx\\)`,respuesta:`${txt} + C`,verificar:e=>conC(e,txt),
      pasos:[paso('Integra término a término',`\\(\\int (${fT})\\,dx = ${cf.map((a,k)=>[a,k]).filter(([a])=>a).reverse().map(([a,k])=>`\\int ${k?`${a}x^{${k}}`:a}\\,dx`).join(' + ')}${n===5?` + \\int\\tfrac{${extra}}{x^{2}}dx`:''}\\)`,'La integral de una suma es la suma de las integrales; las constantes salen.'),
        paso('Sube el exponente y divide entre el nuevo',terms.map(([a,k])=>`\\(\\int ${k?`${a}x^{${k}}`:a}\\,dx = ${a}\\cdot\\dfrac{x^{${k+1}}}{${k+1}} = ${c(`${frac(a,k+1)}x^{${k+1}}`)}\\)`).join('<br>'),'∫ xⁿ dx = xⁿ⁺¹/(n + 1).',{ojo:'Se divide entre el exponente NUEVO.'}),
        ...(n===5?[paso('El término con x abajo',`\\(\\tfrac{${extra}}{x^{2}} = ${extra}x^{-2}\\ \\Rightarrow\\ ${extra}\\cdot\\dfrac{x^{-1}}{-1} = ${c(`${-extra}x^{-1}`)}\\)`,'Escríbelo como potencia negativa y aplica la misma regla.')]:[]),
        final('Junta y suma + C',`\\(${te} ${c('+ C')}\\)`,'Toda antiderivada lleva + C: al derivar, la constante desaparece.',`${txt} + C`,{ojo:'Sin + C la respuesta está incompleta.'})],
      errores:[faltaC(txt),{valor:`${dTxt} + C`,si:e=>{const [s]=sinConstante(e);return equivalente(s,dTxt)},por:'Eso es la derivada; para integrar se SUBE el exponente y se divide.'}],
      regla:'∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C (n ≠ −1). Las constantes salen y una suma se integra término a término.',pista:'Exponente + 1 y divide entre el nuevo exponente.',teclado:'mat'};
  }
};

// Integral definida de un polinomio (resultado exacto como fracción)
function definidaExacta(cf,a,b){let N=0;for(let k=0;k<cf.length;k++)N+=cf[k]*(b**(k+1)-a**(k+1))*(12/(k+1));return [N,12]}
const Fval=(cf,x)=>{let N=0;for(let k=0;k<cf.length;k++)N+=cf[k]*x**(k+1)*(12/(k+1));return frac(N,12)};
const definida={
  titulo:'Integral definida',
  explicacion:'∫ₐᵇ f(x) dx = F(b) − F(a): busca una antiderivada F y resta su valor en los límites.',
  alternativa:'La integral definida es el <b>total acumulado</b> entre dos puntos. Si f es una velocidad, F es la distancia recorrida: lo que marca el cuentakilómetros al final (F(b)) menos lo que marcaba al principio (F(a)). Por eso no hace falta + C: se cancela al restar.',
  generar(n,rng){
    const g=[0,1,2,2,3][n-1],cf=coefsAl(rng,g,n<=2?5:6),a=n<=2?0:rng.entero(-3,2),b=a+rng.entero(1,n<=3?3:4);
    const [N,D]=definidaExacta(cf,a,b),v=N/D,A=antider(cf);
    return {enunciado:`Calcula \\(\\displaystyle\\int_{${a}}^{${b}} (${T(cf)})\\,dx\\)`,respuesta:frac(N,D,{tex:false}),verificar:e=>igualNum(e,v),
      diagrama:areaCurva(x=>evalp(cf,x),a,b),
      pasos:[paso('Busca una antiderivada',`\\(F(x) = ${c(A.tex)}\\)`,'Sube cada exponente y divide (aquí no hace falta + C).'),
        paso('Evalúa en el límite de arriba',`\\(F(${b}) = ${c(Fval(cf,b))}\\)`,'Sustituye el número de arriba en F.'),
        paso('Evalúa en el límite de abajo',`\\(F(${a}) = ${c(Fval(cf,a))}\\)`,'Sustituye el número de abajo.'),
        final('Resta: arriba menos abajo',`\\(F(${b}) - F(${a}) = ${Fval(cf,b)} - ${par(Fval(cf,a))} = ${c(frac(N,D))}\\)`,'Teorema fundamental del cálculo.',frac(N,D,{tex:false}),{ojo:'Es F(b) − F(a), no al revés.'})],
      errores:[{valor:frac(-N,D,{tex:false}),si:e=>igualNum(e,-v)&&v!==0,por:'Es F(b) − F(a): el límite de arriba menos el de abajo.'}],
      regla:'Teorema fundamental: ∫ₐᵇ f(x) dx = F(b) − F(a), con F antiderivada de f (aquí no hace falta + C).',pista:'Primero la antiderivada; luego evalúa arriba menos abajo.',teclado:'mat'};
  }
};

// Sustitución: ∫ k(ax+b)ⁿ (1–2), ∫ 2x(x²+c)ⁿ (3), ∫ x(x²+c)ⁿ (4), ∫ (2ax+b)(ax²+bx+c)ⁿ (5)
const sustitucion={
  titulo:'Integración por sustitución',
  explicacion:'Si aparece una función y su derivada, llama u a la de adentro: du = u′ dx, integra en u y vuelve a x.',
  alternativa:'Sustituir es <b>cambiar de nombre</b> a lo complicado para que se vea simple. Si ves (algo)ⁿ y al lado está la derivada de ese "algo", llama u al "algo": la integral se convierte en ∫ uⁿ du, que ya sabes hacer. Al final devuelves el nombre original.',
  generar(n,rng){
    const m=rng.entero(2,n<=2?4:5);let inner,innerT,fT,F,duT,elige,ajuste;
    if(n<=2){const a=rng.entero(2,6),b=rng.noCero(-7,7),k=n===1?a:rng.entero(1,4)*a;inner=`${a}x ${sg(b)}`;innerT=lineal([[a,'x'],[b,'']]);
      fT=`${k===1?'':k}(${innerT})^{${m}}`;F=`(${k}/(${a*(m+1)}))(${inner})^${m+1}`;duT=`du = ${a}\\,dx \\Rightarrow dx = \\tfrac{du}{${a}}`;
      elige=`Lo de adentro del paréntesis es lineal: su derivada (${a}) es un número.`;ajuste=`\\(${k}\\int u^{${m}}\\tfrac{du}{${a}} = ${frac(k,a)}\\int u^{${m}}du\\)`}
    else{const cc=rng.noCero(-6,6),I=n===5?coefsAl(rng,2,4):[cc,0,1];inner=X(I);innerT=T(I);const dI=der(I),fac=n===4?'x':`(${T(dI)})`;
      fT=`${fac}(${innerT})^{${m}}`;F=n===4?`(1/${2*(m+1)})(${inner})^${m+1}`:`(1/${m+1})(${inner})^${m+1}`;duT=`du = (${T(dI)})\\,dx`;
      elige=n===4?`Su derivada es 2x y afuera hay una x: solo falta un 2.`:`Su derivada \\(${T(dI)}\\) está multiplicando afuera.`;ajuste=n===4?`\\(\\int x\\,u^{${m}}dx = \\tfrac{1}{2}\\int u^{${m}}du\\)`:`\\(\\int u^{${m}}du\\)`}
    const Fu=n<=2?`${frac(n===1?1:F.match(/^\((\d+)\//)[1]/1,1)}`:'';
    return {enunciado:`Calcula \\(\\displaystyle\\int ${fT}\\,dx\\)`,respuesta:`${F} + C`,verificar:e=>conC(e,F),
      pasos:[paso('Elige u: lo de adentro',`\\(u = ${c(innerT)}\\)`,elige),
        paso('Calcula du',`\\(${c(duT)}\\)`,'Derivas u y escribes dx en función de du.'),
        paso('Reescribe la integral en u',ajuste,'Todo queda en u: ya no hay x.',{ojo:'Ajusta la constante que sale de du.'}),
        paso('Integra en u',`\\(\\int u^{${m}}du = ${c(`\\dfrac{u^{${m+1}}}{${m+1}}`)}\\)`,'Regla de la potencia.'),
        final('Vuelve a x y suma + C',`\\(${F.replace(/\^(\d+)/g,'^{$1}').replace(/\*/g,'')} ${c('+ C')}\\)`,'Cambia u por lo que era y no olvides la constante.',`${F} + C`)],
      errores:[faltaC(F),{si:e=>{const [s]=sinConstante(e);return equivalente(s,`(${inner})^${m+1}/${m+1}`)&&!equivalente(F,`(${inner})^${m+1}/${m+1}`,{constanteLibre:true})},por:'Falta dividir (o multiplicar) por la constante que sale de du.'}],
      regla:'Sustitución: si el integrando es f(g(x))·g′(x), con u = g(x) queda ∫ f(u) du. Vuelve a escribir en x y suma + C.',pista:'¿Qué parte tiene su derivada al lado?',teclado:'mat',_fu:Fu};
  }
};

// Área bajo la curva: f positiva en [a, b] (1–3) o parábola entre sus raíces (4–5)
const area={
  titulo:'Área bajo la curva',
  explicacion:'El área entre una curva positiva y el eje x, de a a b, es ∫ₐᵇ f(x) dx. Si la curva queda bajo el eje, el área es el valor absoluto.',
  alternativa:'Imagina rellenar con pintura la zona entre la curva y el suelo (el eje x). La integral suma franjas finísimas de alto f(x): eso es el área. Si la curva está bajo el suelo, la integral sale negativa, pero un área siempre se mide en positivo.',
  generar(n,rng){
    if(n<=3){let cf,a,b;do{cf=coefsAl(rng,n===1?1:2,5);a=rng.entero(0,2);b=a+rng.entero(1,3)}while([a,b,(a+b)/2,a+.25,b-.25].some(x=>evalp(cf,x)<=0));
      const [N,D]=definidaExacta(cf,a,b),A=antider(cf);
      return {enunciado:`Área bajo \\(f(x) = ${T(cf)}\\) entre \\(x = ${a}\\) y \\(x = ${b}\\)`,respuesta:frac(N,D,{tex:false}),verificar:e=>igualNum(e,N/D),diagrama:areaCurva(x=>evalp(cf,x),a,b),
        pasos:[paso('Comprueba que la curva está sobre el eje',`\\(f(${a}) = ${evalp(cf,a)}\\), \\(f(${b}) = ${evalp(cf,b)}\\): positiva`,'Si f ≥ 0, el área es directamente la integral.'),
          paso('Antiderivada',`\\(F(x) = ${c(A.tex)}\\)`,'Sube los exponentes y divide.'),
          final('Arriba menos abajo',`\\(F(${b}) - F(${a}) = ${Fval(cf,b)} - ${par(Fval(cf,a))} = ${c(frac(N,D))}\\)`,'Área = ∫ₐᵇ f(x) dx.',frac(N,D,{tex:false}))],errores:[],
        regla:'Área bajo una curva positiva entre a y b = ∫ₐᵇ f(x) dx.',pista:'Integra de a a b.',teclado:'mat'}}
    const r=rng.entero(-3,1),s=r+rng.entero(1,4),k=rng.entero(1,3)*(n===5?-1:1);
    const cf=[-k*r*s,k*(r+s),-k],[N,D]=definidaExacta(cf,r,s),v=Math.abs(N/D);
    return {enunciado:`Área entre \\(f(x) = ${T(cf)}\\) y el eje x${n===5?' (ojo: la curva queda debajo del eje)':''}`,respuesta:frac(Math.abs(N),D,{tex:false}),verificar:e=>igualNum(e,v),diagrama:areaCurva(x=>evalp(cf,x),r,s),
      pasos:[paso('Busca dónde corta el eje x',`\\(${T(cf)} = 0 \\Rightarrow x = ${c(r)},\\ x = ${c(s)}\\)`,'El área encerrada va de un corte al otro.'),
        paso('Integra entre los cortes',`\\(\\int_{${r}}^{${s}} f(x)\\,dx = ${c(frac(N,D))}\\)`,'Antiderivada evaluada arriba menos abajo.'),
        final(n===5?'Toma el valor absoluto':'Ese es el área',n===5?`\\(\\left|${frac(N,D)}\\right| = ${c(frac(Math.abs(N),D))}\\)`:`Área \\(= ${c(frac(N,D))}\\)`,n===5?'La curva está bajo el eje: la integral es negativa, pero un área se mide en positivo.':'La curva está sobre el eje entre los cortes.',frac(Math.abs(N),D,{tex:false}))],
      errores:n===5?[{valor:frac(N,D,{tex:false}),si:e=>igualNum(e,N/D),por:'Un área no puede ser negativa: si la curva está debajo del eje, toma el valor absoluto.'}]:[],
      regla:'Área entre una curva y el eje x: integra entre los cortes; si la curva está debajo del eje, toma el valor absoluto.',pista:'Busca dónde corta el eje x.',teclado:'mat'};
  }
};

export default {'cd/limites':limites,'cd/derivada-polinomio':derivadaPolinomio,'cd/producto':producto,'cd/cociente':cociente,'cd/cadena':cadena,
  'ci/antiderivada':antiderivada,'ci/definida':definida,'ci/sustitucion':sustitucion,'ci/area':area};
