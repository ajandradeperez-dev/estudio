/* Generadores del tema Cálculo integral (parte 2): integración por partes, fracciones parciales, sustitución trigonométrica,
   volúmenes de revolución e integrales impropias. 3 plantillas por nivel y comprobar() independiente (derivada numérica de la
   antiderivada o integración numérica de Simpson). Sin DOM. */
import {num,casi,igualNum,lista,limpiar,compilar,sinConstante} from './verificar.js';
import {lineal,polinomio,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt,sg} from './algebra-temas.js';
import {bonito} from './calculo-dif.js';

const fx=s=>{try{return compilar(s)}catch(e){return null}};
const PTS=[-2.7,-1.6,-0.85,-0.65,-0.3,0.1,0.35,0.6,0.9,1.45,2.3,3.15,4.4,5.7];
// ¿La derivada numérica de la respuesta (sin + C) es el integrando? Exige + C y al menos 4 puntos válidos.
export function antiOk(e,integrando,{conC=true}={}){
  const [s,cc]=sinConstante(String(e).replace(/^\s*[a-z]\s*\(\s*x\s*\)\s*=\s*/i,''));if(conC&&!cc)return false;
  const F=fx(s),f=fx(integrando);if(!F||!f)return false;let ok=0;
  for(const x of PTS){const h=1e-5,a=F({x:x+h}),b=F({x:x-h}),y=f({x});if(![a,b,y].every(Number.isFinite))continue;if(Math.abs((a-b)/(2*h)-y)>2e-4*Math.max(1,Math.abs(y)))return false;ok++}
  return ok>=4;
}
// Integral numérica (Simpson) para comprobar resultados definidos
export function simpson(f,a,b,n=2000){const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3}
// Simpson en escala logarítmica (x = eᵘ): sirve para intervalos enormes o cerca de 0 (0 < a < b)
export const simpsonLog=(f,a,b,n=4000)=>simpson(u=>f(Math.exp(u))*Math.exp(u),Math.log(a),Math.log(b),n);
// ¿e y v son la misma antiderivada (difieren en una constante)?
const difConst=(e,v)=>{const [s]=sinConstante(String(e));const G=fx(s),H=fx(String(v).replace(/\s*\+\s*C\s*$/,''));if(!G||!H)return false;const pts=[0.3,0.55,1.3,2.2].filter(x=>[G({x}),H({x}),G({x:0.45}),H({x:0.45})].every(Number.isFinite));return pts.length>=3&&pts.every(x=>Math.abs((G({x})-G({x:0.45}))-(H({x})-H({x:0.45})))<1e-6)};
// "A ln|x − a|" legible: (1/3)ln|x + 2|, −ln|x − 4|
const coefLn=(A,dentro)=>{const t=numTxt(Math.abs(A)),k=t==='1'?'':t.includes('/')?`(${t})`:t;return `${A<0?'-':''}${k}ln|${dentro}|`};
// coeficiente de π legible: π, 3π, (9/2)π
const piTxt=v=>{const t=numTxt(v);return t==='1'?'π':t==='-1'?'-π':t.includes('/')||t.includes('.')?`(${t})π`:`${t}π`};
const conPi=v=>e=>{const x=num(String(e).replace(/u(nidades)?\s*(cúbicas|³)?/gi,'').trim());return Number.isFinite(x)&&Math.abs(x-v)<=1e-3*Math.max(1,Math.abs(v))};
const indef=(enun,integrando,F,pasos,errores,extra={})=>({enunciado:enun,respuesta:`${bonito(F)} + C`,verificar:e=>antiOk(e,integrando),
  pasos:pasos.map((p,i)=>i===pasos.length-1?{...p,res:`${bonito(F)} + C`}:p),
  errores:[{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',integrando),por:'Falta la constante: toda antiderivada lleva + C.'},...errores.map(([v,por])=>({valor:`${bonito(v)} + C`,si:e=>{const [s]=sinConstante(e);const G=fx(s),H=fx(v);return !!G&&!!H&&[0.5,1.3,2.2].every(x=>Math.abs((G({x})-G({x:1.7}))-(H({x})-H({x:1.7})))<1e-6)},por}))],
  comprobar:()=>antiOk(F+' + C',integrando),...extra});
const defin=(enun,v,txt,pasos,errores,f,a,b,extra={})=>({enunciado:enun,respuesta:txt,verificar:extra.ver||(e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-v)<=1e-4*Math.max(1,Math.abs(v))}),pasos,errores:errores.filter(e=>Math.abs(num(e.valor)-v)>1e-6),comprobar:()=>{const g=fx(f);return !!g&&Math.abs(simpson(x=>g({x}),a,b)-v)<=1e-4*Math.max(1,Math.abs(v))},...extra});

/* ---------- Integración por partes ---------- */
const R_PARTES='Por partes: ∫u dv = uv − ∫v du. Elige u lo que se simplifica al derivar (x, ln x) y dv lo que se integra fácil (eˣ, sen, cos).';
const partes={
  titulo:'Integración por partes',
  explicacion:'∫u dv = uv − ∫v du. Elige como u la parte que se simplifica al derivar (x, x², ln x) y como dv la que sabes integrar (eˣ, sen x, cos x). Regla práctica LIATE: Logaritmos, Inversas, Algebraicas, Trigonométricas, Exponenciales.',
  alternativa:'Es la regla del producto al revés. Como (uv)′ = u′v + uv′, al integrar: uv = ∫u′v + ∫uv′. Despejas la que no sabes hacer. El truco es escoger u para que la integral que queda sea más fácil que la original.',
  referencia:'Ver: Stewart, Cálculo, sec. 7.1.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const P={
      1:{
        'x-exp':()=>{const k=rng.elegir([1,2,3,4,5,-1,-2,-3]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}x e^{x}\\,dx\\)`,`${k}*x*exp(x)`,`${k}*(x*exp(x) - exp(x))`,[paso('Elige u y dv',`\\(u = x,\\ dv = e^{x}dx \\Rightarrow du = dx,\\ v = e^{x}\\)`,'x se simplifica al derivar; la constante sale.'),final('uv − ∫v du',`\\(${K}(xe^{x} - e^{x})\\)`,'+ C.','')],[[`${k}*x*exp(x)`,'Falta restar ∫v du.'],[`${k}*x^2*exp(x)/2`,'No se integran los factores por separado.'],[`${k}*(x*exp(x) + exp(x))`,'Es uv MENOS ∫v du.']])},
        'x-cos':()=>{const k=rng.elegir([1,2,3,4,5,-1,-2,-3]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}x\\cos x\\,dx\\)`,`${k}*x*cos(x)`,`${k}*(x*sin(x) + cos(x))`,[paso('Elige u y dv',`\\(u = x,\\ dv = \\cos x\\,dx \\Rightarrow v = \\sin x\\)`,'LIATE.'),final('uv − ∫v du',`\\(${K}(x\\sin x + \\cos x)\\)`,'∫sen = −cos.','')],[[`${k}*(x*sin(x) - cos(x))`,'∫sen x dx = −cos x; restarlo da + cos x.'],[`${k}*x*sin(x)`,'Falta − ∫v du.'],[`${k}*x^2*sin(x)/2`,'No se integran por separado.']])},
        'x-sin':()=>{const k=rng.elegir([1,2,3,4,5,-1,-2,-3]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}x\\sin x\\,dx\\)`,`${k}*x*sin(x)`,`${k}*(sin(x) - x*cos(x))`,[paso('Elige u y dv',`\\(u = x,\\ dv = \\sin x\\,dx \\Rightarrow v = -\\cos x\\)`,'LIATE.'),final('uv − ∫v du',`\\(${K}(\\sin x - x\\cos x)\\)`,'Cuidado con los signos.','')],[[`${k}*(x*cos(x) + sin(x))`,'v = −cos x.'],[`${k}*(-x*cos(x) - sin(x))`,'−∫(−cos x) = + sen x.'],[`${-k}*x*cos(x)`,'Falta − ∫v du.']])}
      },
      2:{
        'x-exp-a':()=>{const a=rng.elegir([2,3,-1,-2]),c1=frac(1,a,{tex:false}),c2=frac(1,a*a,{tex:false}),F=`(${c1})*x*exp(${a}*x) - (${c2})*exp(${a}*x)`;return indef(`Calcula \\(\\displaystyle\\int x e^{${a===-1?'-':a}x}\\,dx\\)`,`x*exp(${a}*x)`,F,[paso('u = x, dv = e^{ax}dx',`\\(v = \\tfrac{1}{${a}}e^{${a}x}\\)`,'Integra la exponencial.'),final('uv − ∫v du',`\\(\\tfrac{x}{${a}}e^{${a}x} - \\tfrac{1}{${a*a}}e^{${a}x}\\)`,'Segunda integral otra vez entre a.','')],[[`x*exp(${a}*x)/${a}`,'Falta − ∫v du.'],[`${a}*x*exp(${a}*x) - ${a*a}*exp(${a}*x)`,'Al integrar e^{ax} se DIVIDE entre a.'],[`x*exp(${a}*x)/${a} - exp(${a}*x)/${a}`,'La segunda integral también divide entre a: 1/a².']])},
        'x-cos-a':()=>{const a=rng.elegir([2,3,4]),F=`x*sin(${a}*x)/${a} + cos(${a}*x)/${a*a}`;return indef(`Calcula \\(\\displaystyle\\int x\\cos(${a}x)\\,dx\\)`,`x*cos(${a}*x)`,F,[paso('u = x, dv = cos(ax)dx',`\\(v = \\tfrac{1}{${a}}\\sin(${a}x)\\)`,'Integra.'),final('uv − ∫v du',`\\(\\tfrac{x}{${a}}\\sin(${a}x) + \\tfrac{1}{${a*a}}\\cos(${a}x)\\)`,'Signos.','')],[[`x*sin(${a}*x)/${a}`,'Falta − ∫v du.'],[`x*sin(${a}*x)/${a} - cos(${a}*x)/${a*a}`,'−∫sen = + cos.'],[`${a}*x*sin(${a}*x)`,'Se divide entre a.']])},
        'ln':()=>indef('Calcula \\(\\displaystyle\\int \\ln x\\,dx\\)','ln(x)','x*ln(x) - x',[paso('u = ln x, dv = dx',`\\(du = \\tfrac{1}{x}dx,\\ v = x\\)`,'El truco: dv = dx.'),final('uv − ∫v du',`\\(x\\ln x - \\int 1\\,dx = ${c('x\\ln x - x')}\\)`,'+ C.','')],[['1/x','Eso es la derivada.'],['x*ln(x)','Falta − ∫1 dx.'],['ln(x)^2/2','Eso sería ∫ln x/x dx.']])
      },
      3:{
        'x-ln':()=>{const k=rng.elegir([1,2,3]),F=`x^${k+1}*ln(x)/${k+1} - x^${k+1}/${(k+1)**2}`;return indef(`Calcula \\(\\displaystyle\\int x${k>1?`^{${k}}`:''}\\ln x\\,dx\\)`,`x^${k}*ln(x)`,F,[paso('u = ln x (LIATE), dv = x^'+k+' dx',`\\(v = \\tfrac{x^{${k+1}}}{${k+1}}\\)`,'El logaritmo va como u.'),final('uv − ∫v du',`\\(\\tfrac{x^{${k+1}}}{${k+1}}\\ln x - \\tfrac{x^{${k+1}}}{${(k+1)**2}}\\)`,'∫ x^'+k+'/'+(k+1)+' dx.','')],[[`x^${k+1}*ln(x)/${k+1}`,'Falta − ∫v du.'],[`x^${k+1}*ln(x)/${k+1} - x^${k+1}/${k+1}`,'La segunda integral divide otra vez entre '+(k+1)+'.'],[`x^${k-1}`,'Eso es otra cosa.']])},
        'x-exp-a':()=>P[2]['x-exp-a'](),
        'x-sin-a':()=>{const a=rng.elegir([2,3,5]),F=`-x*cos(${a}*x)/${a} + sin(${a}*x)/${a*a}`;return indef(`Calcula \\(\\displaystyle\\int x\\sin(${a}x)\\,dx\\)`,`x*sin(${a}*x)`,F,[paso('u = x, dv = sen(ax)dx',`\\(v = -\\tfrac{1}{${a}}\\cos(${a}x)\\)`,'Integra.'),final('uv − ∫v du',`\\(-\\tfrac{x}{${a}}\\cos(${a}x) + \\tfrac{1}{${a*a}}\\sin(${a}x)\\)`,'Signos.','')],[[`-x*cos(${a}*x)/${a}`,'Falta − ∫v du.'],[`x*cos(${a}*x)/${a} + sin(${a}*x)/${a*a}`,'v = −cos(ax)/a.'],[`-x*cos(${a}*x)/${a} - sin(${a}*x)/${a*a}`,'−∫(−cos) = + sen.']])}
      },
      4:{
        'definida-x-exp':()=>{const k=rng.elegir([1,2,3,4,-2]);return defin(`Calcula \\(\\displaystyle\\int_{0}^{1} ${k===1?'':k}x e^{x}\\,dx\\)`,k,String(k),[paso('Antiderivada por partes',`\\(${k===1?'':k}(xe^{x} - e^{x})\\)`,'u = x, dv = eˣ dx.'),final('Evalúa de 0 a 1',`\\(${k}[(e - e) - (0 - 1)] = ${c(k)}\\)`,'F(1) − F(0).',String(k))],[malNum(k*Math.E,'Evalúa toda la antiderivada.'),malNum(k*(Math.E-1),'Falta − ∫v du.'),malNum(0,'F(0) = −1, no 0.')],`${k}*x*exp(x)`,0,1)},
        'definida-x-sin':()=>{const k=rng.elegir([1,2,3,-1]);return defin(`Calcula \\(\\displaystyle\\int_{0}^{\\pi} ${k===1?'':k===-1?'-':k}x\\sin x\\,dx\\) (puedes escribir pi)`,k*Math.PI,`${k===1?'':k===-1?'-':k}π`,[paso('Antiderivada',`\\(${k===1?'':k}(-x\\cos x + \\sin x)\\)`,'Por partes.'),final('Evalúa',`\\(${c(`${k===1?'':k===-1?'-':k}\\pi`)}\\)`,'cos π = −1.',`${k===1?'':k===-1?'-':k}π`)],[malNum(-k*Math.PI,'Revisa el signo: −π·cos π = +π.'),malNum(2*k,'Ese sería ∫sen.'),malNum(0,'Evalúa con cuidado.')],`${k}*x*sin(x)`,0,Math.PI)},
        'definida-ln':()=>{const k=rng.elegir([1,2,3,5]);return defin(`Calcula \\(\\displaystyle\\int_{1}^{e} ${k===1?'':k}\\ln x\\,dx\\)`,k,String(k),[paso('Antiderivada',`\\(${k===1?'':k}(x\\ln x - x)\\)`,'Por partes.'),final('Evalúa',`\\(${k}[(e - e) - (0 - 1)] = ${c(k)}\\)`,'ln e = 1, ln 1 = 0.',String(k))],[malNum(k*(Math.E-1),'Falta − x en la antiderivada.'),malNum(0,'F(1) = −1.'),malNum(k*Math.E,'Evalúa arriba menos abajo.')],`${k}*ln(x)`,1,Math.E)}
      },
      5:{
        'x2-exp':()=>{const k=rng.elegir([1,2,3,-1,-2]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}x^{2}e^{x}\\,dx\\)`,`${k}*x^2*exp(x)`,`${k}*exp(x)*(x^2 - 2*x + 2)`,[paso('Partes dos veces',`\\(x^{2}e^{x} - 2\\int xe^{x}dx\\)`,'u = x², dv = eˣ.'),paso('Otra vez',`\\(\\int xe^{x}dx = xe^{x} - e^{x}\\)`,'u = x.'),final('Junta',`\\(${K}e^{x}(x^{2} - 2x + 2)\\)`,'+ C.','')],[[`${k}*(x^2*exp(x) - 2*x*exp(x))`,'Falta el último término +2eˣ.'],[`${k}*x^3*exp(x)/3`,'No se integran por separado.'],[`${k}*exp(x)*(x^2 + 2*x + 2)`,'Los signos alternan.']])},
        'exp-sin':()=>{const k=rng.elegir([1,2,4,-2]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}e^{x}\\sin x\\,dx\\)`,`${k}*exp(x)*sin(x)`,`${k}*exp(x)*(sin(x) - cos(x))/2`,[paso('Partes dos veces: vuelve a aparecer la integral',`\\(I = e^{x}\\sin x - e^{x}\\cos x - I\\)`,'Integral cíclica.'),final('Despeja I',`\\(I = ${K}\\tfrac{e^{x}(\\sin x - \\cos x)}{2}\\)`,'2I = …','')],[[`${k}*exp(x)*(sin(x) - cos(x))`,'Falta dividir entre 2 al despejar.'],[`${k}*exp(x)*cos(x)`,'Revisa: aparece la misma integral.'],[`${k}*exp(x)*(sin(x) + cos(x))/2`,'Revisa el signo del coseno.']])},
        'x2-cos':()=>{const k=rng.elegir([1,2,3,-1]),K=k===1?'':k===-1?'-':k;return indef(`Calcula \\(\\displaystyle\\int ${K}x^{2}\\cos x\\,dx\\)`,`${k}*x^2*cos(x)`,`${k}*(x^2*sin(x) + 2*x*cos(x) - 2*sin(x))`,[paso('Partes: u = x²',`\\(x^{2}\\sin x - 2\\int x\\sin x\\,dx\\)`,'dv = cos x dx.'),paso('Otra vez',`\\(\\int x\\sin x = -x\\cos x + \\sin x\\)`,'u = x.'),final('Junta',`\\(${K}(x^{2}\\sin x + 2x\\cos x - 2\\sin x)\\)`,'+ C.','')],[[`${k}*x^2*sin(x)`,'Faltan términos: aplica partes dos veces.'],[`${k}*(x^2*sin(x) - 2*x*cos(x) - 2*sin(x))`,'Signo de 2x cos x.'],[`${k}*x^3*sin(x)/3`,'No se integran por separado.']])}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:R_PARTES,pista:'u = lo que se simplifica al derivar; dv = lo que sabes integrar.',teclado:'mat',...x};
  }
};

/* ---------- Fracciones parciales ---------- */
const coefPQ=e=>{const s=limpiar(e).toLowerCase(),m={};for(const t of s.matchAll(/([ab])\s*=\s*([^,;ab]+)/g))m[t[1]]=num(t[2]);if('a' in m&&'b' in m)return [m.a,m.b];return lista(s)};
const parciales={
  titulo:'Fracciones parciales',
  explicacion:'Una fracción con denominador factorizado (x − a)(x − b) se separa en A/(x − a) + B/(x − b). Para hallar A, tapa (x − a) y sustituye x = a (y lo mismo con B). Cada parte se integra como un logaritmo: ∫ A/(x − a) dx = A ln|x − a|.',
  alternativa:'Es sumar fracciones al revés: 1/2 + 1/3 = 5/6, y aquí te dan el 5/6 para que encuentres el 1/2 y el 1/3. Separada en piezas simples, cada pieza se integra fácil (dan logaritmos).',
  referencia:'Ver: Stewart, Cálculo, sec. 7.4.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const dos=()=>{let a,b;do{a=rng.noCero(-5,5);b=rng.noCero(-5,5)}while(a===b);return [a,b]};
    const den=(a,b)=>`(x ${sg(-a)})(x ${sg(-b)})`;
    const coeficientes=(m,k)=>{const [a,b]=dos(),A=(m*a+k)/(a-b),B=(m*b+k)/(b-a),numT=lineal([[m,'x'],[k,'']]);
      return {enunciado:`Escribe \\(\\dfrac{${numT}}{${den(a,b)}} = \\dfrac{A}{x ${sg(-a)}} + \\dfrac{B}{x ${sg(-b)}}\\). ¿Cuánto valen A y B? (A = …, B = …)`,respuesta:`A = ${numTxt(A)}, B = ${numTxt(B)}`,verificar:e=>{const v=coefPQ(e);return v.length===2&&casi(v[0],A)&&casi(v[1],B)},
        pasos:[paso('Tapa (x '+sg(-a)+') y sustituye x = '+a,`\\(A = \\dfrac{${m}\\cdot${par(a)} ${sg(k)}}{${a} ${sg(-b)}} = ${c(numTxt(A))}\\)`,'Método de "tapar".'),final('Tapa (x '+sg(-b)+') y sustituye x = '+b,`\\(B = \\dfrac{${m}\\cdot${par(b)} ${sg(k)}}{${b} ${sg(-a)}} = ${c(numTxt(B))}\\)`,'Igual con el otro factor.',`A = ${numTxt(A)}, B = ${numTxt(B)}`)],
        errores:[{valor:`A = ${numTxt(B)}, B = ${numTxt(A)}`,si:e=>{const v=coefPQ(e);return v.length===2&&casi(v[0],B)&&casi(v[1],A)&&A!==B},por:'Intercambiaste A y B.'},{valor:`A = ${numTxt(-A)}, B = ${numTxt(-B)}`,si:e=>{const v=coefPQ(e);return v.length===2&&casi(v[0],-A)&&casi(v[1],-B)},por:'Signos: sustituye x = a en el factor que queda.'},{valor:`A = ${m}, B = ${k}`,si:e=>{const v=coefPQ(e);return v.length===2&&casi(v[0],m)&&casi(v[1],k)&&!(casi(m,A)&&casi(k,B))},por:'A y B no son los coeficientes del numerador.'}],
        comprobar:()=>[0.3,1.7,2.9].every(x=>Math.abs((m*x+k)/((x-a)*(x-b))-(A/(x-a)+B/(x-b)))<1e-9)}};
    const integral=(m,k,extraN)=>{const [a,b]=dos(),A=(m*a+k)/(a-b),B=(m*b+k)/(b-a),numT=lineal([[m,'x'],[k,'']]),F=`${A}*ln(abs(x - (${a}))) + ${B}*ln(abs(x - (${b})))`,Ft=`${coefLn(A,`x ${sg(-a)}`)} ${B<0?'-':'+'} ${coefLn(Math.abs(B),`x ${sg(-b)}`)}`;
      return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{${numT}}{${den(a,b)}}\\,dx\\)`,respuesta:`${Ft} + C`,verificar:e=>antiOk(e,`(${m}*x+${k})/((x-(${a}))*(x-(${b})))`),
        pasos:[paso('Separa en fracciones parciales',`\\(\\dfrac{${numTxt(A)}}{x ${sg(-a)}} + \\dfrac{${numTxt(B)}}{x ${sg(-b)}}\\)`,'Tapa cada factor y sustituye su raíz.'),final('Integra cada una',`\\(${c(Ft.replace(/\|/g,'|'))} + C\\)`,'∫ A/(x − a) dx = A ln|x − a|.',`${Ft} + C`)],
        errores:[{valor:`${coefLn(A,`x ${sg(-a)}`)} + C`,si:e=>difConst(e,`${A}*ln(abs(x-(${a})))`),por:'Falta la segunda fracción.'},{valor:`${coefLn(B,`x ${sg(-a)}`)} ${A<0?'-':'+'} ${coefLn(Math.abs(A),`x ${sg(-b)}`)} + C`,si:e=>difConst(e,`${B}*ln(abs(x-(${a})))+${A}*ln(abs(x-(${b})))`),por:'Intercambiaste A y B.'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`(${m}*x+${k})/((x-(${a}))*(x-(${b})))`),por:'Falta + C.'}],
        comprobar:()=>antiOk(`${F} + C`,`(${m}*x+${k})/((x-(${a}))*(x-(${b})))`)}};
    const P={
      1:{'coef-uno':()=>coeficientes(0,1),'coef-constante':()=>coeficientes(0,rng.noCero(-6,6)),'coef-x':()=>coeficientes(1,0)},
      2:{'coef-general':()=>coeficientes(rng.noCero(-4,4),rng.entero(-6,6)),'integral-uno':()=>integral(0,1),'integral-constante':()=>integral(0,rng.noCero(-6,6))},
      3:{'integral-general':()=>integral(rng.noCero(-4,4),rng.entero(-6,6)),'integral-x':()=>integral(1,0),'coef-general':()=>coeficientes(rng.noCero(-4,4),rng.entero(-6,6))},
      4:{'definida':()=>{const a=rng.entero(1,3),b=-rng.entero(1,3),L=a+1,R=a+rng.entero(2,4),A=1/(a-b),B=1/(b-a),v=A*Math.log((R-a)/(L-a))+B*Math.log((R-b)/(L-b));
          return defin(`Calcula \\(\\displaystyle\\int_{${L}}^{${R}} \\dfrac{1}{${den(a,b)}}\\,dx\\) (2 decimales)`,v,v.toFixed(2),[paso('Fracciones parciales',`\\(\\dfrac{${numTxt(A)}}{x ${sg(-a)}} ${B<0?'-':'+'} \\dfrac{${numTxt(Math.abs(B))}}{x ${sg(-b)}}\\)`,'Tapar y sustituir.'),final('Evalúa los logaritmos',`\\(\\approx ${c(v.toFixed(2))}\\)`,'F(arriba) − F(abajo).',v.toFixed(2))],[malNum(+(-v).toFixed(2),'Arriba menos abajo.'),malNum(+(Math.log((R-a)/(L-a))).toFixed(2),'Falta multiplicar por A y la otra fracción.'),malNum(0,'Evalúa los logaritmos.')],`1/((x-(${a}))*(x-(${b})))`,L,R,{ver:e=>Math.abs(num(e)-v)<=0.006})},
         'integral-general':()=>integral(rng.noCero(-5,5),rng.entero(-8,8)),'coef-general':()=>coeficientes(rng.noCero(-5,5),rng.entero(-8,8))},
      5:{'repetido':()=>{const a=rng.noCero(-4,4),k=rng.noCero(-5,5),F=`ln(abs(x - (${a}))) - ${k+a}/(x - (${a}))`,Ft=`ln|x ${sg(-a)}| ${-(k+a)<0?'-':'+'} ${Math.abs(k+a)}/(x ${sg(-a)})`;// (x + k)/(x − a)² = 1/(x − a) + (k + a)/(x − a)²
          return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{x ${sg(k)}}{(x ${sg(-a)})^{2}}\\,dx\\)`,respuesta:`${Ft} + C`,verificar:e=>antiOk(e,`(x+${k})/(x-(${a}))^2`),
            pasos:[paso('Factor repetido: A/(x − a) + B/(x − a)²',`\\(\\dfrac{1}{x ${sg(-a)}} + \\dfrac{${k+a}}{(x ${sg(-a)})^{2}}\\)`,'x + k = (x − a) + (k + a).'),final('Integra',`\\(\\ln|x ${sg(-a)}| - \\dfrac{${k+a}}{x ${sg(-a)}}\\)`,'∫(x − a)⁻² = −(x − a)⁻¹.',`${Ft} + C`)],
            errores:[{valor:`ln|x ${sg(-a)}| + C`,si:e=>antiOk(e,`1/(x-(${a}))`),por:'Falta la parte con (x − a)².'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`(x+${k})/(x-(${a}))^2`),por:'Falta + C.'}],comprobar:()=>antiOk(`${F} + C`,`(x+${k})/(x-(${a}))^2`)}},
         'integral-general':()=>integral(rng.noCero(-6,6),rng.entero(-9,9)),'definida':()=>P[4]['definida']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Fracciones parciales: separa en A/(x − a) + B/(x − b) (tapa cada factor y sustituye su raíz); cada parte se integra como A ln|x − a|.',pista:'Tapa un factor y sustituye su raíz en lo que queda.',teclado:'mat',...x};
  }
};

/* ---------- Sustitución trigonométrica ---------- */
const sustTrig={
  titulo:'Sustitución trigonométrica',
  explicacion:'Para raíces de la forma √(a² − x²) usa x = a sen θ; para √(a² + x²) o a² + x², x = a tan θ; para √(x² − a²), x = a sec θ. Resultados clave: ∫ dx/(a² + x²) = (1/a) arctan(x/a) + C y ∫ dx/√(a² − x²) = arcsen(x/a) + C. Puedes escribir arcsen o arctan.',
  alternativa:'Cada raíz se parece a un lado de un triángulo rectángulo: √(a² − x²) es el cateto que falta si la hipotenusa es a. Cambiar x por a sen θ convierte la raíz en a cos θ (por sen² + cos² = 1) y desaparece.',
  referencia:'Ver: Stewart, Cálculo, sec. 7.3.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const A=()=>rng.elegir([1,2,3,4,5]);
    const elegir=()=>{const a=A(),tipo=rng.elegir(['sen','tan','sec']),raiz={sen:`\\sqrt{${a*a} - x^{2}}`,tan:`\\sqrt{${a*a} + x^{2}}`,sec:`\\sqrt{x^{2} - ${a*a}}`}[tipo],aT=a===1?'':a;
      const ok=e=>{const s=limpiar(e).toLowerCase().replace(/\s/g,'').replace(/θ|theta|t\b/g,'t');return new RegExp(`x=${aT}\\*?(${tipo==='sen'?'sen|sin':tipo==='tan'?'tan|tg':'sec'})`).test(s)};
      return {enunciado:`Para \\(\\displaystyle\\int ${raiz}\\,dx\\), ¿qué sustitución conviene? (escribe x = …, usa θ o t)`,respuesta:`x = ${aT}${tipo} θ`,verificar:ok,clave:raiz,
        pasos:[paso('Mira la forma de la raíz',tipo==='sen'?'a² − x²':tipo==='tan'?'a² + x²':'x² − a²','Cada forma tiene su sustitución.'),final('Sustitución',`\\(x = ${aT}\\${tipo==='sen'?'sin':tipo} \\theta\\)`,tipo==='sen'?'1 − sen² = cos².':tipo==='tan'?'1 + tan² = sec².':'sec² − 1 = tan².',`x = ${aT}${tipo} θ`)],
        errores:[{valor:`x = ${aT}${tipo==='sen'?'tan':'sen'} θ`,si:e=>!ok(e)&&/x\s*=/.test(e),por:tipo==='sen'?'a² − x² → x = a sen θ.':tipo==='tan'?'a² + x² → x = a tan θ.':'x² − a² → x = a sec θ.'}],comprobar:()=>true}};
    const arctan=k=>{const a=A(),F=`${k}/${a}*atan(x/${a})`,Ft=`${frac(k,a,{tex:false})==='1'?'':frac(k,a,{tex:false}).includes('/')?`(${frac(k,a,{tex:false})})`:frac(k,a,{tex:false})}arctan(${a===1?'x':`x/${a}`})`;
      return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{${k}}{${a*a} + x^{2}}\\,dx\\)`,respuesta:`${Ft} + C`,verificar:e=>antiOk(e,`${k}/(${a*a}+x^2)`),
        pasos:[paso('Forma a² + x² con a = '+a,`\\(\\int \\dfrac{dx}{a^{2} + x^{2}} = \\dfrac{1}{a}\\arctan\\dfrac{x}{a}\\)`,'Sale con x = a tan θ.'),final('Aplica',`\\(${c(`\\dfrac{${k}}{${a}}\\arctan\\dfrac{x}{${a}}`)} + C\\)`,'+ C.',`${Ft} + C`)],
        errores:[...(a!==1?[{valor:`${k===1?'':k}arctan(x/${a}) + C`,si:e=>difConst(e,`${k}*atan(x/${a})`),por:'Falta el 1/a de afuera.'}]:[]),{valor:`${k===1?'':k}ln(${a*a} + x^2) + C`,si:e=>difConst(e,`${k}*ln(${a*a}+x^2)`),por:'Sin x arriba no es un logaritmo.'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`${k}/(${a*a}+x^2)`),por:'Falta + C.'}],comprobar:()=>antiOk(`${F} + C`,`${k}/(${a*a}+x^2)`)}};
    const arcsen=k=>{const a=A(),F=`${k}*asin(x/${a})`,Ft=`${k===1?'':k}arcsen(${a===1?'x':`x/${a}`})`;
      return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{${k}}{\\sqrt{${a*a} - x^{2}}}\\,dx\\)`,respuesta:`${Ft} + C`,verificar:e=>antiOk(e,`${k}/sqrt(${a*a}-x^2)`),
        pasos:[paso('Forma √(a² − x²) con a = '+a,`\\(\\int \\dfrac{dx}{\\sqrt{a^{2} - x^{2}}} = \\arcsin\\dfrac{x}{a}\\)`,'Sale con x = a sen θ.'),final('Aplica',`\\(${c(`${k===1?'':k}\\arcsin\\dfrac{x}{${a}}`)} + C\\)`,'Aquí no aparece 1/a.',`${Ft} + C`)],
        errores:[...(a!==1?[{valor:`(${frac(k,a,{tex:false})})arcsen(x/${a}) + C`,si:e=>difConst(e,`${k}/${a}*asin(x/${a})`),por:'En el arcoseno no se divide entre a.'}]:[]),{valor:`${k===1?'':k}arctan(${a===1?'x':`x/${a}`}) + C`,si:e=>difConst(e,`${k}*atan(x/${a})`),por:'Con raíz es arcoseno, no arcotangente.'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`${k}/sqrt(${a*a}-x^2)`),por:'Falta + C.'}],comprobar:()=>antiOk(`${F} + C`,`${k}/sqrt(${a*a}-x^2)`)}};
    const P={
      1:{'elegir':elegir,'arctan':()=>arctan(1),'arcsen':()=>arcsen(1)},
      2:{'arctan-coef':()=>arctan(rng.elegir([2,3,4,6])),'arcsen-coef':()=>arcsen(rng.elegir([2,3,5])),
         'definida-arctan':()=>{const a=A(),v=Math.PI/(4*a);return defin(`Calcula \\(\\displaystyle\\int_{0}^{${a}} \\dfrac{dx}{${a*a} + x^{2}}\\) (con π o decimal)`,v,`π/${4*a}`,[paso('Antiderivada',`\\(\\tfrac{1}{${a}}\\arctan\\tfrac{x}{${a}}\\)`,'Forma a² + x².'),final('Evalúa',`\\(\\tfrac{1}{${a}}(\\tfrac{\\pi}{4} - 0) = ${c(`\\tfrac{\\pi}{${4*a}}`)}\\)`,'arctan 1 = π/4.',`π/${4*a}`)],[malNum(Math.PI/4,'Falta el 1/a.'),malNum(1/a,'arctan 1 = π/4, no 1.'),malNum(Math.PI/(2*a),'arctan 1 = π/4.')],`1/(${a*a}+x^2)`,0,a,{ver:e=>Math.abs(num(e)-v)<=1e-3})}},
      3:{'cuarto-circulo':()=>{const a=A(),v=Math.PI*a*a/4;return defin(`Calcula \\(\\displaystyle\\int_{0}^{${a}} \\sqrt{${a*a} - x^{2}}\\,dx\\) (con π o decimal)`,v,`${numTxt(a*a/4)}π`,[paso('Interpreta: cuarto de círculo de radio '+a,`\\(y = \\sqrt{${a*a} - x^{2}}\\)`,'Es la mitad de arriba de un círculo.'),final('Área',`\\(\\tfrac{1}{4}\\pi\\cdot${a*a} = ${c(`${numTxt(a*a/4)}\\pi`)}\\)`,'O con x = a sen θ.',`${numTxt(a*a/4)}π`)],[malNum(Math.PI*a*a,'Es solo un cuarto del círculo.'),malNum(Math.PI*a*a/2,'Es un cuarto, no medio.'),malNum(a*a/4,'Falta π.')],`sqrt(${a*a}-x^2)`,0,a,{ver:e=>Math.abs(num(e)-v)<=1e-3*Math.max(1,v)})},
         'definida-arcsen':()=>{const a=A(),v=Math.PI/6;return defin(`Calcula \\(\\displaystyle\\int_{0}^{${numTxt(a/2)}} \\dfrac{dx}{\\sqrt{${a*a} - x^{2}}}\\) (con π o decimal)`,v,'π/6',[paso('Antiderivada',`\\(\\arcsin\\tfrac{x}{${a}}\\)`,'Forma √(a² − x²).'),final('Evalúa',`\\(\\arcsin\\tfrac{1}{2} - 0 = ${c('\\tfrac{\\pi}{6}')}\\)`,'sen(π/6) = 1/2.','π/6')],[malNum(1/2,'arcsen(1/2) = π/6, no 1/2.'),malNum(Math.PI/3,'sen(π/3) = √3/2.'),malNum(Math.PI/(6*a),'En el arcoseno no se divide entre a.')],`1/sqrt(${a*a}-x^2)`,0,a/2,{ver:e=>Math.abs(num(e)-v)<=1e-3})},
         'x-sobre-raiz':()=>{const a=A(),F=`-sqrt(${a*a} - x^2)`;return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{x}{\\sqrt{${a*a} - x^{2}}}\\,dx\\)`,respuesta:`-√(${a*a} - x^2) + C`,verificar:e=>antiOk(e,`x/sqrt(${a*a}-x^2)`),
           pasos:[paso('Aquí basta u = '+a*a+' − x²',`\\(du = -2x\\,dx\\)`,'Hay una x afuera: sustitución simple.'),final('Integra',`\\(-\\sqrt{${a*a} - x^{2}} + C\\)`,'∫u^(−1/2) du = 2u^(1/2).',`-√(${a*a} - x^2) + C`)],errores:[{valor:`arcsen(${a===1?'x':`x/${a}`}) + C`,si:e=>antiOk(e,`1/sqrt(${a*a}-x^2)`),por:'Con x arriba conviene u = a² − x².'},{valor:`√(${a*a} - x^2) + C`,si:e=>antiOk(e,`-x/sqrt(${a*a}-x^2)`),por:'Signo: du = −2x dx.'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`x/sqrt(${a*a}-x^2)`),por:'Falta + C.'}],comprobar:()=>antiOk(`${F} + C`,`x/sqrt(${a*a}-x^2)`)}}},
      4:{'medio-circulo':()=>{const a=A(),v=Math.PI*a*a/2;return defin(`Calcula \\(\\displaystyle\\int_{-${a}}^{${a}} \\sqrt{${a*a} - x^{2}}\\,dx\\) (con π o decimal)`,v,`${numTxt(a*a/2)}π`,[paso('Medio círculo de radio '+a,`\\(y = \\sqrt{${a*a} - x^{2}}\\)`,'De −a a a.'),final('Área',`\\(\\tfrac{1}{2}\\pi\\cdot${a*a} = ${c(`${numTxt(a*a/2)}\\pi`)}\\)`,'Medio círculo.',`${numTxt(a*a/2)}π`)],[malNum(Math.PI*a*a,'Es medio círculo.'),malNum(Math.PI*a*a/4,'De −a a a es medio, no un cuarto.'),malNum(a*a/2,'Falta π.')],`sqrt(${a*a}-x^2)`,-a,a,{ver:e=>Math.abs(num(e)-v)<=1e-3*Math.max(1,v)})},
         'arctan-desplazado':()=>{const a=A(),h=rng.noCero(-4,4),F=`1/${a}*atan((x - (${h}))/${a})`;const Ft=a===1?`arctan(x ${sg(-h)})`:`(1/${a})arctan((x ${sg(-h)})/${a})`;return {enunciado:`Calcula \\(\\displaystyle\\int \\dfrac{dx}{(x ${sg(-h)})^{2} + ${a*a}}\\)`,respuesta:`${Ft} + C`,verificar:e=>antiOk(e,`1/((x-(${h}))^2+${a*a})`),
           pasos:[paso('u = x '+sg(-h),`\\(\\int \\dfrac{du}{u^{2} + ${a*a}}\\)`,'Desplazamiento.'),final('Fórmula del arctan',`\\(\\tfrac{1}{${a}}\\arctan\\tfrac{x ${sg(-h)}}{${a}} + C\\)`,'Vuelve a x.',`${Ft} + C`)],errores:[{valor:a===1?'arctan(x) + C':`(1/${a})arctan(x/${a}) + C`,si:e=>antiOk(e,`1/(x^2+${a*a})`),por:'Falta el desplazamiento: (x − h).'},{si:e=>!sinConstante(e)[1]&&antiOk(e+' + C',`1/((x-(${h}))^2+${a*a})`),por:'Falta + C.'}],comprobar:()=>antiOk(`${F} + C`,`1/((x-(${h}))^2+${a*a})`)}},
         'elegir':elegir},
      5:{'medio-circulo':()=>P[4]['medio-circulo'](),'arctan-desplazado':()=>P[4]['arctan-desplazado'](),'cuarto-circulo':()=>P[3]['cuarto-circulo']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'√(a² − x²) → x = a sen θ; a² + x² → x = a tan θ; √(x² − a²) → x = a sec θ. ∫dx/(a² + x²) = (1/a)arctan(x/a); ∫dx/√(a² − x²) = arcsen(x/a).',pista:'Mira la forma de la raíz o del denominador.',teclado:'mat',...x};
  }
};

/* ---------- Volúmenes de revolución ---------- */
const volumenes={
  titulo:'Volúmenes de revolución',
  explicacion:'Al girar la región bajo y = f(x) (de a a b) alrededor del eje x se forma un sólido de volumen V = π∫ₐᵇ f(x)² dx (método de discos). Si hay un hueco (entre f arriba y g abajo), V = π∫(f² − g²) dx (arandelas). Escribe el resultado con π, por ejemplo 12π.',
  alternativa:'Corta el sólido en rebanadas muy delgadas, como un salami: cada rebanada es un disco de radio f(x) y grosor dx, con volumen π·f(x)²·dx. Sumar (integrar) todas las rebanadas da el volumen.',
  referencia:'Ver: Stewart, Cálculo, sec. 6.2 y 6.3.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const V=(enun,coefPi,txt,pasos,errores,integrando,a,b)=>{const v=coefPi*Math.PI;return {enunciado:enun+' (escribe el resultado con π, p. ej. 12π)',respuesta:piTxt(coefPi),verificar:conPi(v),pasos,errores:errores.map(([cv,por])=>({valor:piTxt(cv),si:conPi(cv*Math.PI),por})).filter(e=>Math.abs(num(e.valor)-v)>1e-6),comprobar:()=>{const g=fx(integrando);return Math.abs(Math.PI*simpson(x=>g({x})**2,a,b)-v)<=1e-6*Math.max(1,v)||Math.abs(simpson(x=>g({x}),a,b)-v)<=1e-6*Math.max(1,v)}}};
    const P={
      1:{
        'cilindro':()=>{const r=rng.entero(1,5),h=rng.entero(1,6);return V(`Gira la región bajo \\(y = ${r}\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Qué volumen tiene el sólido?`,r*r*h,numTxt(r*r*h),[paso('Discos de radio '+r,`\\(V = \\pi\\int_{0}^{${h}} ${r}^{2}\\,dx\\)`,'Es un cilindro.'),final('Integra',`\\(\\pi\\cdot${r*r}\\cdot${h} = ${c(`${r*r*h}\\pi`)}\\)`,'πr²h.',`${r*r*h}π`)],[[r*h,'El radio va al cuadrado.'],[2*r*h,'Es πr²h, no 2πrh.'],[r*r*h/3,'Eso sería un cono.']],`${r}`,0,h)},
        'cono':()=>{const k=rng.entero(1,3),h=rng.entero(1,4),cp=k*k*h**3/3;return V(`Gira la región bajo \\(y = ${k===1?'':k}x\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Qué volumen tiene el sólido?`,cp,numTxt(cp),[paso('Discos de radio '+k+'x',`\\(V = \\pi\\int_{0}^{${h}} ${k*k}x^{2}\\,dx\\)`,'Un cono.'),final('Integra',`\\(\\pi\\cdot\\tfrac{${k*k}x^{3}}{3}\\Big|_{0}^{${h}} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'πr²h/3.',`${numTxt(cp)}π`)],[[k*h*h/2,'El radio va al cuadrado.'],[k*k*h**3,'Falta dividir entre 3.'],[k*k*h*h/2,'∫x² = x³/3.']],`${k}*x`,0,h)},
        'raiz':()=>{const h=rng.entero(1,6),cp=h*h/2;return V(`Gira la región bajo \\(y = \\sqrt{x}\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Volumen?`,cp,numTxt(cp),[paso('Discos: f² = x',`\\(V = \\pi\\int_{0}^{${h}} x\\,dx\\)`,'(√x)² = x.'),final('Integra',`\\(\\pi\\tfrac{${h*h}}{2} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'Paraboloide.',`${numTxt(cp)}π`)],[[2*h**1.5/3,'Eleva f al cuadrado antes de integrar.'],[h*h,'Falta dividir entre 2.'],[h,'Integra x.']],'sqrt(x)',0,h)}
      },
      2:{
        'parabola':()=>{const h=rng.entero(1,3),cp=h**5/5;return V(`Gira la región bajo \\(y = x^{2}\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Volumen?`,cp,numTxt(cp),[paso('f² = x⁴',`\\(V = \\pi\\int_{0}^{${h}} x^{4}\\,dx\\)`,'Eleva al cuadrado.'),final('Integra',`\\(\\pi\\tfrac{${h**5}}{5} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'x⁵/5.',`${numTxt(cp)}π`)],[[h**3/3,'Eleva f al cuadrado.'],[h**5,'Divide entre 5.'],[h**4/4,'∫x⁴ = x⁵/5.']],'x^2',0,h)},
        'cono':()=>P[1]['cono'](),
        'lineal-desplazada':()=>{const k=rng.entero(1,3),h=rng.entero(1,3),cp=(k*k*h**3/3+k*h*h+h);return V(`Gira la región bajo \\(y = ${k===1?'':k}x + 1\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Volumen?`,cp,numTxt(cp),[paso('Discos',`\\(V = \\pi\\int_{0}^{${h}} (${k===1?'':k}x + 1)^{2}\\,dx\\)`,'Desarrolla el cuadrado.'),final('Integra',`\\(\\pi\\left(\\tfrac{${k*k}x^{3}}{3} + ${k}x^{2} + x\\right)\\Big|_{0}^{${h}} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'Término a término.',`${numTxt(cp)}π`)],[[k*k*h**3/3+h,'(kx + 1)² tiene el término 2kx.'],[k*h*h/2+h,'Eleva al cuadrado.'],[cp*3,'Revisa la integral.']],`${k}*x+1`,0,h)}
      },
      3:{
        'esfera':()=>{const r=rng.entero(1,5),cp=4*r**3/3;return V(`Gira la región bajo \\(y = \\sqrt{${r*r} - x^{2}}\\) entre \\(x = -${r}\\) y \\(x = ${r}\\) alrededor del eje x. ¿Volumen?`,cp,numTxt(cp),[paso('f² = '+r*r+' − x²',`\\(V = \\pi\\int_{-${r}}^{${r}} (${r*r} - x^{2})\\,dx\\)`,'La raíz desaparece al elevar al cuadrado.'),final('Integra',`\\(\\pi\\left(${r*r}x - \\tfrac{x^{3}}{3}\\right)\\Big|_{-${r}}^{${r}} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'Es una esfera: (4/3)πr³.',`${numTxt(cp)}π`)],[[2*r**3/3,'De −r a r, no de 0 a r.'],[r**3,'Revisa: (4/3)r³.'],[4*r*r,'Esa es el área de la superficie / π.']],`sqrt(${r*r}-x^2)`,-r,r)},
        'arandela':()=>{const k=rng.entero(1,3),cp=2*k*k/15,K=k===1?'':k;return V(`Gira la región entre \\(y = ${K}x\\) (arriba) y \\(y = ${K}x^{2}\\) (abajo), de \\(x = 0\\) a \\(x = 1\\), alrededor del eje x. ¿Volumen?`,cp,numTxt(cp),[paso('Arandelas: R = '+K+'x, r = '+K+'x²',`\\(V = \\pi\\int_{0}^{1} ${k*k===1?'':k*k}(x^{2} - x^{4})\\,dx\\)`,'Disco grande menos disco chico.'),final('Integra',`\\(${k*k}\\pi\\left(\\tfrac{1}{3} - \\tfrac{1}{5}\\right) = ${c(`${numTxt(cp)}\\pi`)}\\)`,'R² − r², no (R − r)².',`${numTxt(cp)}π`)],[[k*k/30,'Es R² − r², no (R − r)².'],[k/6,'Esa es el área de la región.'],[k*k/3,'Resta el hueco.']],'0',0,1)},
        'parabola':()=>P[2]['parabola']()
      },
      4:{
        'exponencial':()=>{const h=rng.entero(1,2),cp=(Math.exp(2*h)-1)/2;return {...V(`Gira la región bajo \\(y = e^{x}\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje x. ¿Volumen? (2 decimales del coeficiente de π)`,cp,cp.toFixed(2),[paso('f² = e^{2x}',`\\(V = \\pi\\int_{0}^{${h}} e^{2x}\\,dx\\)`,'Eleva al cuadrado.'),final('Integra',`\\(\\pi\\tfrac{e^{${2*h}} - 1}{2} \\approx ${c(`${cp.toFixed(2)}\\pi`)}\\)`,'∫e^{2x} = e^{2x}/2.',`${cp.toFixed(2)}π`)],[[Math.exp(h)-1,'Eleva f al cuadrado.'],[Math.exp(2*h)-1,'Divide entre 2.'],[Math.exp(2*h)/2,'Resta el valor en 0.']],'exp(x)',0,h),verificar:e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-cp*Math.PI)<=0.02*Math.PI}}},
        'arandela-general':()=>{const R=rng.entero(2,4),cp=R*R*2-8/3;// entre y = R y y = √(2x)… simplificado: entre y = R e y = x de 0 a 2
          const v=R*R*2-8/3;return V(`Gira la región entre \\(y = ${R}\\) (arriba) y \\(y = x\\) (abajo), de \\(x = 0\\) a \\(x = 2\\), alrededor del eje x. ¿Volumen?`,v,numTxt(v),[paso('Arandelas: R = '+R+', r = x',`\\(V = \\pi\\int_{0}^{2} (${R*R} - x^{2})\\,dx\\)`,'R² − r².'),final('Integra',`\\(\\pi\\left(${2*R*R} - \\tfrac{8}{3}\\right) = ${c(`${numTxt(v)}\\pi`)}\\)`,'Término a término.',`${numTxt(v)}π`)],[[(R*2-2)**2,'Es R² − r², no (R − r)².'],[2*R*R,'Resta el hueco.'],[2*R-2,'Eleva al cuadrado.']],'0',0,2)},
        'esfera':()=>P[3]['esfera']()
      },
      5:{
        'casquetes':()=>{const h=rng.entero(1,4),cp=2*h**3/3;return V(`Gira la región bajo \\(y = x\\) entre \\(x = 0\\) y \\(x = ${h}\\) alrededor del eje <b>y</b>. ¿Volumen? (método de casquetes: \\(V = 2\\pi\\int x f(x)\\,dx\\))`,cp,numTxt(cp),[paso('Casquetes',`\\(V = 2\\pi\\int_{0}^{${h}} x\\cdot x\\,dx\\)`,'Radio x, altura f(x).'),final('Integra',`\\(2\\pi\\tfrac{${h**3}}{3} = ${c(`${numTxt(cp)}\\pi`)}\\)`,'Casquetes cilíndricos.',`${numTxt(cp)}π`)],[[h**3/3,'Falta el 2 de 2π.'],[h**2,'Integra x².'],[h**3/3*2*2,'Revisa la fórmula.']],'0',0,1)},
        'exponencial':()=>P[4]['exponencial'](),
        'arandela':()=>P[3]['arandela']()
      }
    };
    const x=plantillas(rng,P[n]);
    // la comprobación de arandelas/casquetes no se puede leer de f: se rehace con su propia integral
    if(['arandela','arandela-general','casquetes'].includes(x.plantilla))x.comprobar=()=>{const v=num(x.respuesta);if(x.plantilla==='arandela'){const k=Math.round(Math.sqrt(v/Math.PI*15/2));return Math.abs(Math.PI*k*k*simpson(t=>t*t-t**4,0,1)-v)<=1e-3*v}if(x.plantilla==='casquetes'){const h=Math.cbrt(v/Math.PI*3/2);return Math.abs(2*Math.PI*simpson(t=>t*t,0,h)-v)<1e-6}const R=Math.sqrt((v/Math.PI+8/3)/2);return Math.abs(Math.PI*simpson(t=>R*R-t*t,0,2)-v)<1e-6};
    return {regla:'Discos: V = π∫f(x)² dx. Arandelas: V = π∫(R² − r²) dx. Casquetes (eje y): V = 2π∫x·f(x) dx.',pista:'Eleva el radio al cuadrado y multiplica por π.',teclado:'mat',...x};
  }
};

/* ---------- Integrales impropias ---------- */
const esDiverge=e=>/diverg|infinit|∞|no converge|no existe/i.test(String(e));
const impropias={
  titulo:'Integrales impropias',
  explicacion:'Si un límite de integración es ∞ (o el integrando explota en un extremo), se calcula como un límite: ∫₁^∞ f = lím ∫₁ᵇ f cuando b → ∞. Si el límite es un número, converge; si no, diverge. ∫₁^∞ 1/xᵖ converge solo si p > 1.',
  alternativa:'Es preguntar si un área infinitamente larga puede tener tamaño finito. Sí puede, si la curva baja lo bastante rápido: 1/x² baja tan rápido que el área total es 1; 1/x baja más lento y el área crece sin límite.',
  referencia:'Ver: Stewart, Cálculo, sec. 7.8.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const Q=(enun,v,txt,pasos,errores,comprobar)=>({enunciado:enun+'<br><span class="nota">Escribe el número o «diverge».</span>',respuesta:txt,verificar:v===null?esDiverge:(e=>!esDiverge(e)&&Math.abs(num(e)-v)<=1e-4*Math.max(1,Math.abs(v))),pasos,errores,comprobar});
    const potencia=()=>{const p=rng.elegir([2,3,4,1.5]),v=1/(p-1);return Q(`Calcula \\(\\displaystyle\\int_{1}^{\\infty} \\dfrac{dx}{x^{${p===1.5?'3/2':p}}}\\)`,v,numTxt(v),[paso('Como límite',`\\(\\lim_{b\\to\\infty}\\left[\\dfrac{x^{${numTxt(1-p)}}}{${numTxt(1-p)}}\\right]_{1}^{b}\\)`,'Sube el exponente.'),final('El término con b va a 0',`\\(0 - \\dfrac{1}{${numTxt(1-p)}} = ${c(numTxt(v))}\\)`,'p > 1: converge.',numTxt(v))],[{valor:'diverge',si:esDiverge,por:'p > 1: converge.'},malNum(1/p,'Es 1/(p − 1).'),malNum(0,'b^(1−p) → 0, pero queda el término del 1.')],()=>Math.abs(simpsonLog(x=>1/x**p,1,1e6)+(1e6)**(1-p)/(p-1)-v)<1e-4)};
    const exp=()=>{const a=rng.elegir([1,2,3,4,0.5]),v=1/a;return Q(`Calcula \\(\\displaystyle\\int_{0}^{\\infty} e^{-${a===1?'':numTxt(a)}x}\\,dx\\)`,v,numTxt(v),[paso('Como límite',`\\(\\lim_{b\\to\\infty}\\left[-\\tfrac{1}{${numTxt(a)}}e^{-${numTxt(a)}x}\\right]_{0}^{b}\\)`,'Antiderivada.'),final('e^{−ab} → 0',`\\(0 + \\tfrac{1}{${numTxt(a)}} = ${c(numTxt(v))}\\)`,'Converge.',numTxt(v))],[{valor:'diverge',si:esDiverge,por:'La exponencial decae rápido: converge.'},malNum(a,'Es 1/a.'),malNum(0,'Queda el término en 0.')],()=>Math.abs(simpson(x=>Math.exp(-a*x),0,60/a,20000)-v)<1e-4)};
    const unoX=()=>Q('Calcula \\(\\displaystyle\\int_{1}^{\\infty} \\dfrac{dx}{x}\\)',null,'diverge',[paso('Como límite',`\\(\\lim_{b\\to\\infty} \\ln b\\)`,'∫1/x = ln x.'),final('ln b → ∞','\\(\\infty\\)','p = 1: diverge.','diverge')],[malNum(1,'ln b crece sin límite.'),malNum(0,'ln b no tiende a 0.')],()=>simpsonLog(x=>1/x,1,1e6)>10);
    const raizCero=()=>{const k=rng.elegir([1,2,3]),v=2*k;return Q(`Calcula \\(\\displaystyle\\int_{0}^{1} \\dfrac{${k}}{\\sqrt{x}}\\,dx\\)`,v,String(v),[paso('El integrando explota en 0: límite',`\\(\\lim_{t\\to 0^{+}} [${2*k}\\sqrt{x}]_{t}^{1}\\)`,'x^(−1/2) → 2x^(1/2).'),final('√t → 0',`\\(${c(v)}\\)`,'Converge.',String(v))],[{valor:'diverge',si:esDiverge,por:'p = 1/2 < 1 cerca de 0: converge.'},malNum(k,'∫x^(−1/2) = 2x^(1/2).'),malNum(k/2,'Sube el exponente: −1/2 + 1 = 1/2.')],()=>Math.abs(simpsonLog(x=>k/Math.sqrt(x),1e-10,1)+2*k*1e-5-v)<1e-4)};
    const p1Cero=()=>Q('Calcula \\(\\displaystyle\\int_{0}^{1} \\dfrac{dx}{x^{2}}\\)',null,'diverge',[paso('Explota en 0: límite',`\\(\\lim_{t\\to 0^{+}} \\left[-\\tfrac{1}{x}\\right]_{t}^{1} = \\lim (-1 + \\tfrac{1}{t})\\)`,'Antiderivada −1/x.'),final('1/t → ∞','\\(\\infty\\)','Cerca de 0, p ≥ 1 diverge.','diverge')],[malNum(-1,'No ignores el límite: 1/t → ∞.'),malNum(1,'Diverge.')],()=>simpsonLog(x=>1/(x*x),1e-6,1)>1e4);
    const P={
      1:{'potencia':potencia,'exponencial':exp,'uno-x':unoX},
      2:{'potencia':potencia,'raiz-cero':raizCero,'exponencial':exp},
      3:{'x-exp':()=>{const a=rng.elegir([1,2,3,0.5]),v=1/(a*a),A=a===1?'':numTxt(a);return Q(`Calcula \\(\\displaystyle\\int_{0}^{\\infty} x e^{-${A}x}\\,dx\\)`,v,numTxt(v),[paso('Partes',`\\(-\\tfrac{x}{${numTxt(a)}}e^{-${A}x} - \\tfrac{1}{${numTxt(a*a)}}e^{-${A}x}\\)`,'u = x.'),final('Límite',`\\(0 + \\tfrac{1}{${numTxt(a*a)}} = ${c(numTxt(v))}\\)`,'xe^{−ax} → 0.',numTxt(v))],[{valor:'diverge',si:esDiverge,por:'La exponencial gana: converge.'},malNum(1/a,'Es 1/a² (dos integraciones).'),malNum(0,'Evalúa en 0.')],()=>Math.abs(simpson(x=>x*Math.exp(-a*x),0,80/a,20000)-v)<1e-4)},
         'p1-cero':()=>{const p=rng.elegir([1,2,3]),k=rng.elegir([1,2,5]);return Q(`Calcula \\(\\displaystyle\\int_{0}^{1} \\dfrac{${k}}{x^{${p===1?'':p}}}\\,dx\\)`.replace('x^{}','x'),null,'diverge',[paso('Explota en 0: límite',`\\(\\lim_{t\\to 0^{+}}\\int_{t}^{1}\\dfrac{${k}}{x${p>1?`^{${p}}`:''}}dx\\)`,'Integral impropia.'),final('Crece sin límite','\\(\\infty\\)','Cerca de 0, p ≥ 1 diverge.','diverge')],[malNum(p===1?0:-k/(p-1),'No ignores el límite: crece sin límite.'),malNum(k,'Diverge.')],()=>simpsonLog(x=>k/x**p,1e-8,1)>10)},
         'raiz-cero':raizCero},
      4:{'arctan-infinito':()=>{const a=rng.elegir([1,2,3,4]),k=rng.elegir([1,2,4]),v=k*Math.PI/(2*a);return Q(`Calcula \\(\\displaystyle\\int_{0}^{\\infty} \\dfrac{${k}}{${a*a} + x^{2}}\\,dx\\) (con π o decimal)`,v,`${numTxt(k/(2*a))}π`,[paso('Antiderivada',`\\(\\tfrac{${k}}{${a}}\\arctan\\tfrac{x}{${a}}\\)`,'Forma a² + x².'),final('arctan → π/2',`\\(\\tfrac{${k}}{${a}}\\cdot\\tfrac{\\pi}{2} = ${c(`${numTxt(k/(2*a))}\\pi`)}\\)`,'Converge.',`${numTxt(k/(2*a))}π`)],[{valor:'diverge',si:esDiverge,por:'arctan tiene límite π/2.'},malNum(k*Math.PI/a,'arctan → π/2, no π.'),malNum(k*Math.PI/2,'Falta el 1/a.')],()=>Math.abs(simpson(x=>k/(a*a+x*x),0,1,2000)+simpsonLog(x=>k/(a*a+x*x),1,1e7)+k*1e-7-v)<1e-4)},
         'potencia':potencia,'p1-cero':()=>P[3]['p1-cero']()},
      5:{'comparar-p':()=>{const p=rng.elegir([0.5,1,2,3,4,1.5]),conv=p>1,v=conv?1/(p-1):null;return Q(`¿Converge \\(\\displaystyle\\int_{1}^{\\infty} \\dfrac{dx}{${p===1?'x':`x^{${p===0.5?'1/2':p===1.5?'3/2':p}}`}}\\)? Si converge, da su valor.`,v,conv?numTxt(v):'diverge',[paso('Criterio p',`\\(p = ${numTxt(p)}\\)`,'Converge solo si p > 1.'),final(conv?'Converge':'Diverge',conv?`\\(\\tfrac{1}{p - 1} = ${c(numTxt(v))}\\)`:'\\(\\infty\\)','En ∞: p > 1 converge.',conv?numTxt(v):'diverge')],conv?[{valor:'diverge',si:esDiverge,por:'p > 1: converge.'},malNum(1/p,'Es 1/(p − 1).')]:[malNum(p===1?1:2,'p ≤ 1: diverge.'),malNum(0,'Diverge.')],()=>conv?Math.abs(simpsonLog(x=>1/x**p,1,1e6)+(1e6)**(1-p)/(p-1)-v)<1e-4:simpsonLog(x=>1/x**p,1,1e6)>10)},
         'x-exp':()=>P[3]['x-exp'](),'arctan-infinito':()=>P[4]['arctan-infinito']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Integral impropia = límite de una integral normal. ∫₁^∞ 1/xᵖ converge si p > 1 (vale 1/(p − 1)); ∫₀¹ 1/xᵖ converge si p < 1.',pista:'Cambia ∞ por b, integra y haz b → ∞.',teclado:'mat',...x};
  }
};

export default {'ci/partes':partes,'ci/fracciones-parciales':parciales,'ci/sustitucion-trig':sustTrig,'ci/volumenes':volumenes,'ci/impropias':impropias};
