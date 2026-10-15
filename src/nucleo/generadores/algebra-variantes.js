/* Más plantillas para los generadores de Álgebra que ya existían (ecuaciones lineales, sistemas 2×2, factorización y
   exponentes): cada nivel queda con 3 (la "clásica" del generador original + 2 nuevas), con comprobar() independiente.
   Mismos ids: index.js las registra encima de las originales; el progreso no cambia. Sin DOM. */
import {num,casi,equivalente,limpiar,igualNum,compilar} from './verificar.js';
import {lineal,polinomio,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {T,sg,mal,malNum,numTxt} from './algebra-temas.js';
import {parXY,esProducto} from './algebra-basica.js';
import orig1 from './matematicas.js';
import orig2 from './algebra-basica.js';

// TeX sencillo → texto que entiende compilar(): \dfrac{a}{b} → ((a)/(b)), x^{3} → x^(3), \cdot → *
export function texATexto(t){
  let s=String(t).replace(/\\left|\\right/g,'').replace(/\\cdot/g,'*').replace(/\\,/g,'');
  for(let i=0;i<6;i++)s=s.replace(/\^\{([^{}]*)\}/g,'^($1)').replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]*)\}/g,'sqrt($1)');
  s=s.replace(/\\(sin|cos|tan|ln|log|exp)\b/g,'$1');
  return s.replace(/[{}]/g,'');
}
const dentro=en=>{const m=String(en).match(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/);return m?(m[1]||m[2]):''};
// Equivalencia con error relativo en puntos cercanos a 1 (sirve con exponentes grandes)
const equivRel=(a,b,vars=['x','y'])=>{try{const f=compilar(a),g=compilar(b);return [0.6,0.9,1.13,1.37,1.71].every((t,i)=>{const v=Object.fromEntries(vars.map((k,j)=>[k,t+0.11*j*(i%2?1:-1)]));const A=f(v),B=g(v);return Number.isFinite(A)&&Number.isFinite(B)&&Math.abs(A-B)<=1e-9*Math.max(1,Math.abs(A),Math.abs(B))})}catch(e){return false}};
const ladosOk=(eq,vals)=>{const [i,d]=texATexto(eq).split('=');try{return casi(compilar(i)(vals),compilar(d)(vals))}catch(e){return false}};
// Comprobación independiente de la plantilla clásica, leyendo el ejercicio de su propio enunciado
export const COMPROBAR={
  ecuacion:p=>ladosOk(dentro(p.enunciado),{x:num(p.respuesta)}),
  sistema:p=>{const v=parXY(p.respuesta),m=p.enunciado.match(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/);return !!v&&!!m&&m[1].split('\\\\').every(eq=>ladosOk(eq,{x:v[0],y:v[1]}))},
  factor:p=>equivRel(p.respuesta,texATexto(dentro(p.enunciado))),
  exponente:p=>equivRel(p.respuesta,texATexto(dentro(p.enunciado)))
};
// Envuelve un generador: en cada nivel elige entre la plantilla clásica y las nuevas de ese nivel
export const conVariantes=(g,extra,tipo,def={})=>({...g,generar(n,rng){
  const ks=['clasica',...Object.keys(extra[n]||{})],k=rng.elegir(ks);
  if(k==='clasica'){const p=g.generar(n,rng);return {...p,plantilla:'clasica',comprobar:()=>typeof tipo==='function'?tipo(p,n):COMPROBAR[tipo](p)}}
  return {...def,...extra[n][k](rng),plantilla:k};
}});

/* ---------- Ecuaciones lineales ---------- */
const R_ECU='Para despejar x, haz lo mismo en los dos lados: lo que suma pasa restando (y al revés) y lo que multiplica pasa dividiendo.';
const ecu=(enun,x,pasos,errores,extra={})=>({enunciado:`Resuelve: \\(${enun}\\)`,respuesta:`x = ${numTxt(x)}`,verificar:v=>igualNum(v,x),pasos,errores,regla:R_ECU,pista:'Deja la x sola haciendo lo mismo en los dos lados.',teclado:'mat',...extra});
const fin=(x,comp)=>final('Comprueba sustituyendo',`Con \\(x = ${frac(Math.round(x*60),60)}\\): ${comp} ✓`,'Si los dos lados dan lo mismo, está bien.',`x = ${numTxt(x)}`);
const ecuacion=conVariantes(orig1['alg/ecuacion-lineal'],{
  1:{
    'x-mas-b':rng=>{const b=rng.noCero(-15,15),x=rng.entero(-12,12),d=x+b;
      return ecu(`x ${sg(b)} = ${d}`,x,[paso('Pasa el número al otro lado',`\\(x = ${d} ${c(sg(-b))}\\)`,`Lo que ${b>0?'suma':'resta'} pasa ${b>0?'restando':'sumando'}.`),fin(x,`\\(${x} ${sg(b)} = ${d}\\)`)],
        [malNum(d+b,`El ${b} pasa con el signo contrario.`),malNum(-x,'Revisa el signo del resultado.'),malNum(d,`Falta pasar el ${b}.`)],{comprobar:()=>x+b===d})},
    'x-entre-a':rng=>{const a=rng.entero(2,9),cc=rng.noCero(-9,9),x=a*cc;
      return ecu(`\\dfrac{x}{${a}} = ${cc}`,x,[paso(`Multiplica los dos lados por ${a}`,`\\(x = ${cc}\\cdot ${a}\\)`,'Lo que divide pasa multiplicando.'),fin(x,`\\(${x} \\div ${a} = ${cc}\\)`)],
        [malNum(cc/a,'Lo que divide pasa MULTIPLICANDO.'),malNum(cc+a,'Se multiplica, no se suma.'),malNum(-x,'Revisa el signo.')],{comprobar:()=>x/a===cc})}
  },
  2:{
    'resta-ax':rng=>{const a=rng.entero(2,9),x=rng.noCero(-9,9),b=rng.noCero(-15,15),d=b-a*x;
      return ecu(`${b} - ${a}x = ${d}`,x,[paso('Pasa el número suelto',`\\(-${a}x = ${d} ${c(sg(-b))} = ${d-b}\\)`,`El ${b} pasa ${b>0?'restando':'sumando'}.`),paso(`Divide entre −${a}`,`\\(x = \\dfrac{${d-b}}{-${a}} = ${c(x)}\\)`,'El coeficiente es negativo: menos entre menos da más.',{ojo:`El coeficiente de x es −${a}, no ${a}.`}),fin(x,`\\(${b} - ${a}\\cdot${par(x)} = ${d}\\)`)],
        [malNum(-x,`El coeficiente es −${a}: al dividir cambia el signo.`),malNum((d+b)/a,`El ${b} pasa con el signo contrario.`),malNum(d-b,`Falta dividir entre −${a}.`)],{comprobar:()=>b-a*x===d})},
    'fraccion-mas-b':rng=>{const a=rng.entero(2,6),x=a*rng.noCero(-6,6),b=rng.noCero(-10,10),d=x/a+b;
      return ecu(`\\dfrac{x}{${a}} ${sg(b)} = ${d}`,x,[paso('Pasa el número',`\\(\\dfrac{x}{${a}} = ${c(d-b)}\\)`,'Primero lo que suma o resta.'),paso(`Multiplica por ${a}`,`\\(x = ${d-b}\\cdot${a} = ${c(x)}\\)`,'Lo que divide pasa multiplicando.'),fin(x,`\\(${x}/${a} ${sg(b)} = ${d}\\)`)],
        [malNum((d-b)/a,'Lo que divide pasa multiplicando.'),malNum(a*(d+b),`El ${b} pasa con el signo contrario.`),malNum(d-b,`Falta multiplicar por ${a}.`)],{comprobar:()=>x/a+b===d})}
  },
  3:{
    'decimales':rng=>{const [a1,a2]=rng.elegir([[0.5,0.25],[1.5,0.5],[0.6,0.2],[0.8,0.3],[1.2,0.7],[2.5,1.5]]),A=+(a1-a2).toFixed(2),x=rng.noCero(-8,8)*(A===0.25?4:A===0.4?5:2),b1=rng.noCero(-9,9),b2=+(A*x+b1).toFixed(2);
      return ecu(`${a1}x ${sg(b1)} = ${a2}x ${sg(b2)}`,x,[paso('Junta las x',`\\(${a1}x - ${a2}x = ${b2} ${sg(-b1)} \\Rightarrow ${A}x = ${c(+(b2-b1).toFixed(2))}\\)`,'Los decimales se restan como siempre.'),paso(`Divide entre ${A}`,`\\(x = \\dfrac{${+(b2-b1).toFixed(2)}}{${A}} = ${c(x)}\\)`,'Puedes multiplicar arriba y abajo por 10 o 100 para quitar los decimales.'),fin(x,`\\(${a1}\\cdot${par(x)} ${sg(b1)} = ${+(a1*x+b1).toFixed(2)}\\) y \\(${a2}\\cdot${par(x)} ${sg(b2)} = ${+(a2*x+b2).toFixed(2)}\\)`)],
        [malNum(+((b2-b1)/(a1+a2)).toFixed(4),`Al pasar ${a2}x se resta: ${a1} − ${a2} = ${A}.`),malNum(+((b2+b1)/A).toFixed(4),`El ${b1} pasa con el signo contrario.`),malNum(+(b2-b1).toFixed(2),`Falta dividir entre ${A}.`)],{comprobar:()=>casi(a1*x+b1,a2*x+b2)})},
    'coef-fraccion':rng=>{const p=rng.entero(2,5),q=rng.elegir([2,3,4,5,7].filter(z=>z!==p)),x=q*rng.noCero(-6,6),b=rng.noCero(-9,9),d=p*x/q-b;
      return ecu(`\\dfrac{${p}}{${q}}x - ${par(b)} = ${d}`.replace('- (-','+ (').replace(/\+ \((\d+)\)/,'+ $1'),x,[paso('Pasa el número',`\\(\\dfrac{${p}}{${q}}x = ${c(d+b)}\\)`,'Primero lo que suma o resta.'),paso(`Multiplica por \\(\\dfrac{${q}}{${p}}\\)`,`\\(x = ${d+b}\\cdot\\dfrac{${q}}{${p}} = ${c(x)}\\)`,'Para quitar una fracción que multiplica, multiplica por su recíproca.'),fin(x,`\\(\\dfrac{${p}}{${q}}\\cdot${par(x)} - ${par(b)} = ${d}\\)`)],
        [malNum((d+b)*p/q,'Multiplica por la fracción volteada: q/p.'),malNum((d-b)*q/p,`El ${b} pasa con el signo contrario.`),malNum(d+b,'Falta quitar la fracción.')],{comprobar:()=>casi(p*x/q-b,d)})}
  },
  4:{
    'dos-parentesis':rng=>{let a,cc,b,d,x;do{a=rng.entero(2,6)*rng.signo();cc=rng.entero(2,6)*rng.signo();b=rng.noCero(-6,6);x=rng.noCero(-8,8);d=0}while(a===cc);
      // a(x + b) = cc(x + d) con solución x: d = (a(x + b) − cc·x)/cc debe ser entero
      const rhs=a*(x+b);if((rhs-cc*x)%cc!==0)return ecuacion.generar(4,rng);d=(rhs-cc*x)/cc;if(d===0)return ecuacion.generar(4,rng);
      return ecu(`${a}(x ${sg(b)}) = ${cc}(x ${sg(d)})`,x,[paso('Quita los dos paréntesis',`\\(${lineal([[a,'x'],[a*b,'']])} = ${c(lineal([[cc,'x'],[cc*d,'']]))}\\)`,'Distributiva en cada lado.'),paso('Junta las x a la izquierda',`\\(${lineal([[a-cc,'x']])} = ${cc*d-a*b}\\)`,'Cada término cambia de signo al pasar.'),paso(`Divide entre ${a-cc}`,`\\(x = ${c(x)}\\)`,'Lo que multiplica pasa dividiendo.'),fin(x,`izquierda \\(${a*(x+b)}\\), derecha \\(${cc*(x+d)}\\)`)],
        [malNum((d-b)/(a-cc),`Multiplica también los números de adentro: ${a}·${par(b)} y ${cc}·${par(d)}.`),malNum(a+cc?(cc*d-a*b)/(a+cc):x+1,`Al pasar ${cc}x se resta: ${a} − ${par(cc)}.`),malNum(-x,'Revisa el signo al dividir.')],{comprobar:()=>a*(x+b)===cc*(x+d)})},
    'menos-parentesis':rng=>{const a=rng.entero(2,6),b=rng.noCero(-8,8),x=rng.noCero(-8,8),e=rng.noCero(-15,15),f=e-x-b-a*x;
      return ecu(`${e} - (x ${sg(b)}) = ${lineal([[a,'x'],[f,'']])}`,x,[paso('Quita el paréntesis (el menos cambia los signos)',`\\(${e} ${c(`- x ${sg(-b)}`)} = ${lineal([[a,'x'],[f,'']])}\\)`,'−(x + b) = −x − b.'),paso('Junta las x a la derecha y los números a la izquierda',`\\(${e-b-f} = ${a+1}x\\)`,`Pasa −x sumando: ${a}x + x = ${a+1}x.`),paso(`Divide entre ${a+1}`,`\\(x = ${c(x)}\\)`,'Lo que multiplica pasa dividiendo.'),fin(x,`izquierda \\(${e-(x+b)}\\), derecha \\(${a*x+f}\\)`)],
        [malNum((e+b-f)/(a+1),`El menos también cambia el signo del ${b}.`),malNum((e-b-f)/(a-1),'−x pasa al otro lado SUMANDO: '+a+'x + x.'),malNum(-x,'Revisa los signos.')],{comprobar:()=>e-(x+b)===a*x+f})}
  },
  5:{
    'dos-fracciones':rng=>{const [a,b]=rng.elegir([[2,3],[2,4],[3,4],[2,5],[3,6],[4,6],[3,5]]),cc=rng.noCero(-9,9),x=a*b*cc/(a+b);
      return ecu(`\\dfrac{x}{${a}} + \\dfrac{x}{${b}} = ${cc}`,x,[paso(`Multiplica todo por ${a*b}`,`\\(${b}x + ${a}x = ${a*b*cc}\\)`,'Así desaparecen los denominadores.'),paso('Junta las x',`\\(${a+b}x = ${a*b*cc}\\)`,'Suma los coeficientes.'),final('Divide',`\\(x = ${c(frac(a*b*cc,a+b))}\\)`,'Simplifica la fracción si se puede.',`x = ${numTxt(x)}`)],
        [malNum(cc*(a+b),'Se suman las fracciones, no los denominadores.'),malNum(cc*a*b,`Falta dividir entre ${a+b}.`),malNum(2*cc/(1/a+1/b)/2*2,'Revisa: x/'+a+' + x/'+b+' = ('+b+'x + '+a+'x)/'+a*b+'.')],{comprobar:()=>casi(x/a+x/b,cc)})},
    'proporcion':rng=>{let a,b,cc,d;do{a=rng.noCero(-8,8);b=rng.entero(2,6);cc=rng.noCero(-8,8);d=rng.entero(2,7)}while(b===d);const x=-(b*cc+d*a)/(d-b);
      return ecu(`\\dfrac{x ${sg(a)}}{${b}} = \\dfrac{x ${sg(-cc)}}{${d}}`,x,[paso('Multiplica en cruz',`\\(${d}(x ${sg(a)}) = ${b}(x ${sg(-cc)})\\)`,'Para quitar los dos denominadores.'),paso('Distribuye y junta las x',`\\(${d-b}x = ${-b*cc-d*a}\\)`,'x a un lado, números al otro.'),final('Despeja',`\\(x = ${c(frac(-b*cc-d*a,d-b))}\\)`,'Puede quedar fracción.',`x = ${numTxt(x)}`)],
        [malNum((b*cc+d*a)/(d-b),'Revisa los signos al pasar los números.'),malNum((-cc-a)/(d-b),'Al multiplicar en cruz, el número de cada lado también se multiplica.'),malNum(-(b*cc+d*a)/(d+b),`Al pasar ${b}x se resta: ${d} − ${b}.`)],{comprobar:()=>casi((x+a)/b,(x-cc)/d)})}
  }
},'ecuacion');

/* ---------- Sistemas 2×2 ---------- */
const R_SIS='Un sistema 2×2 se resuelve eliminando una incógnita (sumar o restar ecuaciones multiplicadas) o sustituyendo; la solución cumple las dos ecuaciones.';
const sis=(e1,e2,x,y,pasos,extra={})=>{const resp=`x = ${numTxt(x)}, y = ${numTxt(y)}`,igual=e=>{const v=parXY(e);return !!v&&casi(v[0],x)&&casi(v[1],y)};
  const err=(a,b,por)=>({valor:`x = ${numTxt(a)}, y = ${numTxt(b)}`,si:e=>{const v=parXY(e);return !!v&&casi(v[0],a)&&casi(v[1],b)},por});
  return {enunciado:`Resuelve el sistema (escribe x, y):\\[\\begin{cases} ${e1} \\\\ ${e2} \\end{cases}\\]`,respuesta:resp,verificar:igual,pasos:[...pasos,final('Escribe la solución',`\\(x = ${frac(Math.round(x*60),60)},\\ y = ${frac(Math.round(y*60),60)}\\)`,'Comprueba en las dos ecuaciones.',resp)],
    errores:[err(y,x,'Intercambiaste x e y.'),err(x,-y,'y tiene el signo cambiado.'),err(-x,y,'x tiene el signo cambiado.')].filter(e=>!igual(e.valor)),regla:R_SIS,pista:'Sustituye o elimina una letra.',teclado:'mat',...extra}};
const tipoSol=(e1,e2,tipo,pasos)=>({enunciado:`¿Cuántas soluciones tiene el sistema?\\[\\begin{cases} ${e1} \\\\ ${e2} \\end{cases}\\]<span class="nota">Resuélvelo o escribe «no tiene solución» o «infinitas».</span>`,
  respuesta:tipo==='ninguna'?'No tiene solución':'Infinitas soluciones',verificar:e=>tipo==='ninguna'?/no tiene|ningun|sin soluci|incompatible|∅/i.test(e):/infinit/i.test(e),
  pasos,errores:[{si:e=>!!parXY(e),por:tipo==='ninguna'?'Ningún par cumple las dos: son rectas paralelas.':'No hay un solo par: las dos ecuaciones son la misma recta.'},{valor:tipo==='ninguna'?'Infinitas soluciones':'No tiene solución',si:e=>tipo==='ninguna'?/infinit/i.test(e):/no tiene|ningun|sin soluci/i.test(e),por:tipo==='ninguna'?'Al eliminar queda una contradicción (0 = número): no hay solución.':'Al eliminar queda 0 = 0: siempre se cumple.'},{valor:'x = 0, y = 0',si:e=>{const v=parXY(e);return !!v&&v[0]===0&&v[1]===0},por:'Prueba (0, 0) en las ecuaciones: no sirve.'}],
  regla:'Si al eliminar queda 0 = 0, hay infinitas soluciones (misma recta); si queda 0 = número, no hay solución (rectas paralelas).',pista:'Elimina una letra y mira qué queda.',teclado:'mat'});
const tipoSolucion=rng=>{const a=rng.noCero(-5,5),b=rng.noCero(-5,5),k=rng.elegir([2,3,-2,-1]),c1=rng.entero(-9,9),tipo=rng.elegir(['ninguna','infinitas']),c2=tipo==='infinitas'?k*c1:k*c1+rng.noCero(-6,6);
  const e1=`${lineal([[a,'x'],[b,'y']])} = ${c1}`,e2=`${lineal([[k*a,'x'],[k*b,'y']])} = ${c2}`;
  return {...tipoSol(e1,e2,tipo,[paso(`Multiplica la primera por ${k}`,`\\(${lineal([[k*a,'x'],[k*b,'y']])} = ${k*c1}\\)`,'Queda con los mismos coeficientes que la segunda.'),final('Resta las ecuaciones',`\\(0 = ${c(c2-k*c1)}\\)`,tipo==='infinitas'?'0 = 0 siempre se cumple: es la misma recta.':'0 = '+(c2-k*c1)+' es imposible: rectas paralelas.',tipo==='ninguna'?'No tiene solución':'Infinitas soluciones')]),comprobar:()=>(c2===k*c1)===(tipo==='infinitas')}};
const sistema2=conVariantes(orig2['alg/sistema-2x2'],{
  1:{
    'suma-resta':rng=>{const x=rng.entero(-9,9),y=rng.entero(-9,9),s=x+y,d=x-y;
      return {...sis(`x + y = ${s}`,`x - y = ${d}`,x,y,[paso('Suma las dos ecuaciones',`\\(2x = ${s+d}\\Rightarrow x = ${c(x)}\\)`,'La y se cancela: +y − y = 0.'),paso('Sustituye en la primera',`\\(${x} + y = ${s}\\Rightarrow y = ${c(y)}\\)`,'Con x conocida sale y.')]),comprobar:()=>x+y===s&&x-y===d}},
    'y-despejada':rng=>{const x=rng.entero(-6,6),y0=rng.entero(-8,8),m=rng.noCero(-4,4),b=y0-m*x,a=rng.noCero(-5,5),cc=rng.noCero(-5,5),e=a*x+cc*y0;if(a+cc*m===0)return sistema2.generar(1,rng);
      return {...sis(`y = ${lineal([[m,'x'],[b,'']])}`,`${lineal([[a,'x'],[cc,'y']])} = ${e}`,x,y0,[paso('Sustituye y en la segunda',`\\(${a}x ${sg(cc)}(${lineal([[m,'x'],[b,'']])}) = ${e}\\)`,'La primera ya da y: métela en la otra.'),paso('Resuelve para x',`\\(${a+cc*m}x = ${e-cc*b} \\Rightarrow x = ${c(x)}\\)`,'Distributiva y despeje.'),paso('Calcula y',`\\(y = ${m}\\cdot${par(x)} ${sg(b)} = ${c(y0)}\\)`,'Usa la ecuación con y despejada.')]),comprobar:()=>y0===m*x+b&&a*x+cc*y0===e}}
  },
  2:{
    'igualacion':rng=>{const x=rng.entero(-6,6),y=rng.entero(-9,9);let m1,m2;do{m1=rng.noCero(-5,5);m2=rng.noCero(-5,5)}while(m1===m2);const b1=y-m1*x,b2=y-m2*x;
      return {...sis(`y = ${lineal([[m1,'x'],[b1,'']])}`,`y = ${lineal([[m2,'x'],[b2,'']])}`,x,y,[paso('Iguala las dos expresiones de y',`\\(${lineal([[m1,'x'],[b1,'']])} = ${lineal([[m2,'x'],[b2,'']])}\\)`,'Si las dos valen y, son iguales entre sí.'),paso('Despeja x',`\\(${m1-m2}x = ${b2-b1} \\Rightarrow x = ${c(x)}\\)`,'x a un lado, números al otro.'),paso('Calcula y',`\\(y = ${m1}\\cdot${par(x)} ${sg(b1)} = ${c(y)}\\)`,'En cualquiera de las dos.')]),comprobar:()=>y===m1*x+b1&&y===m2*x+b2}},
    'x-despejada':rng=>{const x0=rng.entero(-9,9),y=rng.entero(-6,6),k=rng.noCero(-4,4),b=x0-k*y,a=rng.noCero(-5,5),cc=rng.noCero(-5,5),e=a*x0+cc*y;if(a*k+cc===0)return sistema2.generar(2,rng);
      return {...sis(`x = ${lineal([[k,'y'],[b,'']])}`,`${lineal([[a,'x'],[cc,'y']])} = ${e}`,x0,y,[paso('Sustituye x en la segunda',`\\(${a}(${lineal([[k,'y'],[b,'']])}) ${sg(cc)}y = ${e}\\)`,'La primera ya da x.'),paso('Resuelve para y',`\\(${a*k+cc}y = ${e-a*b} \\Rightarrow y = ${c(y)}\\)`,'Distributiva y despeje.'),paso('Calcula x',`\\(x = ${k}\\cdot${par(y)} ${sg(b)} = ${c(x0)}\\)`,'Con la ecuación despejada.')]),comprobar:()=>x0===k*y+b&&a*x0+cc*y===e}}
  },
  3:{
    'coef-opuestos':rng=>{const x=rng.entero(-7,7),y=rng.entero(-7,7),a=rng.noCero(-6,6),b=rng.entero(2,7),d=rng.noCero(-6,6);if(a+d===0)return sistema2.generar(3,rng);const c1=a*x+b*y,c2=d*x-b*y;
      return {...sis(`${lineal([[a,'x'],[b,'y']])} = ${c1}`,`${lineal([[d,'x'],[-b,'y']])} = ${c2}`,x,y,[paso('Suma las ecuaciones',`\\(${a+d}x = ${c1+c2} \\Rightarrow x = ${c(x)}\\)`,`+${b}y y −${b}y se cancelan.`),paso('Sustituye',`\\(${a}\\cdot${par(x)} + ${b}y = ${c1} \\Rightarrow y = ${c(y)}\\)`,'En la primera ecuación.')]),comprobar:()=>a*x+b*y===c1&&d*x-b*y===c2}},
    'multiplica-una':rng=>{const x=rng.entero(-7,7),y=rng.entero(-7,7),a=rng.noCero(-4,4),b=rng.noCero(-4,4),k=rng.elegir([2,3,-2,-3]),d=rng.noCero(-6,6);if(d===k*a)return sistema2.generar(3,rng);const c1=a*x+b*y,c2=d*x+k*b*y;
      return {...sis(`${lineal([[a,'x'],[b,'y']])} = ${c1}`,`${lineal([[d,'x'],[k*b,'y']])} = ${c2}`,x,y,[paso(`Multiplica la primera por ${k}`,`\\(${lineal([[k*a,'x'],[k*b,'y']])} = ${k*c1}\\)`,'Así la y tiene el mismo coeficiente en las dos.'),paso('Resta la segunda',`\\(${k*a-d}x = ${k*c1-c2} \\Rightarrow x = ${c(x)}\\)`,'La y desaparece.'),paso('Sustituye',`\\(y = ${c(y)}\\)`,'En la primera ecuación.')]),comprobar:()=>a*x+b*y===c1&&d*x+k*b*y===c2}}
  },
  4:{
    'tipo-solucion':tipoSolucion,
    'fracciones':rng=>{const p=rng.entero(2,4),q=rng.entero(2,5),x=p*rng.noCero(-4,4),y=q*rng.noCero(-4,4),s=x/p+y/q,d=x-y;
      return {...sis(`\\dfrac{x}{${p}} + \\dfrac{y}{${q}} = ${s}`,`x - y = ${d}`,x,y,[paso(`Multiplica la primera por ${p*q}`,`\\(${q}x + ${p}y = ${p*q*s}\\)`,'Quita los denominadores.'),paso('Despeja x de la segunda y sustituye',`\\(x = y ${sg(d)} \\Rightarrow ${q}(y ${sg(d)}) + ${p}y = ${p*q*s}\\)`,'Sustitución.'),paso('Resuelve',`\\(${p+q}y = ${p*q*s-q*d} \\Rightarrow y = ${c(y)},\\ x = ${c(x)}\\)`,'Despeja y y luego x.')]),comprobar:()=>casi(x/p+y/q,s)&&x-y===d}}
  },
  5:{
    'tipo-solucion':tipoSolucion,
    'decimales':rng=>{const x=rng.entero(-9,9)*2,y=rng.entero(-9,9)*2,c1=+(0.5*x+1.5*y).toFixed(2),c2=+(0.2*x-0.4*y).toFixed(2);
      return {...sis(`0.5x + 1.5y = ${c1}`,`0.2x - 0.4y = ${c2}`,x,y,[paso('Quita los decimales',`\\(x + 3y = ${+(2*c1).toFixed(2)},\\ \\ x - 2y = ${+(5*c2).toFixed(2)}\\)`,'Multiplica la primera por 2 y la segunda por 5.'),paso('Resta',`\\(5y = ${+(2*c1-5*c2).toFixed(2)} \\Rightarrow y = ${c(y)}\\)`,'La x se cancela.'),paso('Sustituye',`\\(x = ${c(x)}\\)`,'En x − 2y.')]),comprobar:()=>casi(0.5*x+1.5*y,c1)&&casi(0.2*x-0.4*y,c2)}}
  }
},'sistema');

/* ---------- Factorización ---------- */
const fac=(exp,resp,pasos,errores,regla,extra={})=>{const vars=extra.vars||['x'];return {enunciado:`Factoriza: \\(${T(exp)}\\)`,respuesta:resp,verificar:e=>esProducto(e)&&equivalente(e,exp,{vars}),pasos,
  errores:[{si:e=>!esProducto(e)&&equivalente(e,exp,{vars}),por:'Eso es la misma expresión: escríbela como producto (con paréntesis).'},...errores.map(er=>({...er,si:e=>equivalente(e,er.valor,{vars})&&esProducto(e)}))],regla,pista:'¿Hay factor común? ¿Es un producto notable?',teclado:'mat',comprobar:()=>equivRel(resp,exp),...extra}};
const factorizacion=conVariantes(orig2['alg/factorizacion'],{
  1:{
    'factor-x':rng=>{let a,b;do{a=rng.entero(1,9);b=rng.noCero(-9,9)}while(Math.abs(b)%a===0&&a>1);const exp=lineal([[a,'x^2'],[b,'x']]),resp=`x(${lineal([[a,'x'],[b,'']])})`;
      return fac(exp,resp,[paso('La x está en los dos términos',`\\(${T(exp)} = x\\cdot ${a===1?'':a}x ${sg(b)}\\cdot x\\)`,'Factor común: lo que se repite.'),final('Sácala',`\\(${c(resp)}\\)`,'x²/x = x y '+b+'x/x = '+b+'.',resp)],
        [{valor:`x(${lineal([[a,'x^2'],[b,'']])})`,por:'Al sacar x, x² queda como x.'},{valor:`x^2(${lineal([[a,''],[b,'x']])})`,por:'Solo puedes sacar x una vez: '+b+'x no tiene x².'},{valor:`x(${lineal([[a,'x'],[-b,'']])})`,por:'Revisa el signo.'}],'Factor común: saca lo que se repite en todos los términos: ax² + bx = x(ax + b).')},
    'factor-monomio':rng=>{const k=rng.entero(2,6),a=rng.entero(1,5),b=rng.noCero(-7,7);if(Math.abs(b)%a===0&&a>1)return factorizacion.generar(1,rng);const exp=lineal([[k*a,'x^3'],[k*b,'x^2']]),resp=`${k}x^2(${lineal([[a,'x'],[b,'']])})`;
      return fac(exp,resp,[paso('Máximo factor común',`\\(${k}x^{2}\\)`,`${k} divide a ${k*a} y ${k*b}; x² es la menor potencia.`),final('Divide cada término',`\\(${c(T(resp))}\\)`,`\\(${k*a}x^{3} \\div ${k}x^{2} = ${a}x\\).`,resp)],
        [{valor:`${k}x(${lineal([[a,'x^2'],[b,'x']])})`,por:'Todavía hay x en común: saca x².'},{valor:`x^2(${lineal([[k*a,'x'],[k*b,'']])})`,por:`También puedes sacar el ${k}.`},{valor:`${k}x^2(${lineal([[a,'x'],[-b,'']])})`,por:'Revisa el signo.'}],'Saca el máximo factor común: el mayor número que divide a todos y la menor potencia de x.')}
  },
  2:{
    'cuadrado-perfecto':rng=>{const a=rng.noCero(-9,9),exp=polinomio([a*a,2*a,1],{tex:false}),resp=`(x ${sg(a)})^2`;
      return fac(exp,resp,[paso('Reconoce un trinomio cuadrado perfecto',`\\(x^{2} ${sg(2*a)}x + ${a*a} = x^{2} + 2\\cdot x\\cdot${par(a)} + ${par(a)}^{2}\\)`,'Primero y último son cuadrados; el del medio es el doble del producto.'),final('Escribe el cuadrado',`\\(${c(T(resp))}\\)`,'a² + 2ab + b² = (a + b)².',resp)],
        [{valor:`(x ${sg(-a)})^2`,por:'El signo del binomio es el del término del medio.'},{valor:`(x ${sg(a)})(x ${sg(-a)})`,por:'Eso da x² − '+a*a+': falta el término del medio.'},{valor:`(x ${sg(2*a)})^2`,por:'Dentro va la raíz de '+a*a+', no '+2*a+'.'}],'Trinomio cuadrado perfecto: a² ± 2ab + b² = (a ± b)².')},
    'diferencia-dos-letras':rng=>{const p=rng.entero(1,6),q=rng.entero(1,7),A=p===1?'x':`${p}x`,B=q===1?'y':`${q}y`,exp=`${p*p===1?'':p*p}x^2 - ${q*q===1?'':q*q}y^2`,resp=`(${A} - ${B})(${A} + ${B})`;
      return fac(exp,resp,[paso('Dos cuadrados restados',`\\(${T(exp)} = (${A})^{2} - (${B})^{2}\\)`,'Diferencia de cuadrados.'),final('(a − b)(a + b)',`\\(${c(resp)}\\)`,'Resta por suma de las bases.',resp)],
        [{valor:`(${A} - ${B})^2`,por:'Un cuadrado de binomio tiene término del medio.'},{valor:`(${p*p}x - ${q*q}y)(${p*p}x + ${q*q}y)`,por:'Dentro van las raíces: '+A+' y '+B+'.'},{valor:`(${A} + ${B})^2`,por:'Uno lleva − y otro +.'}],'Diferencia de cuadrados: a² − b² = (a − b)(a + b).',{vars:['x','y']})}
  },
  3:{
    'agrupacion':rng=>{const a=rng.noCero(-6,6),b=rng.noCero(-6,6),exp=polinomio([a*b,b,a,1],{tex:false}),resp=`(x ${sg(a)})(x^2 ${sg(b)})`;
      return fac(exp,resp,[paso('Agrupa de dos en dos',`\\((x^{3} ${sg(a)}x^{2}) + (${b}x ${sg(a*b)})\\)`,'Cuatro términos: prueba agrupar.'),paso('Factor común en cada grupo',`\\(x^{2}(x ${sg(a)}) ${sg(b)}(x ${sg(a)})\\)`,'Cada grupo deja el mismo binomio.'),final('Saca el binomio común',`\\(${c(T(resp))}\\)`,'(x + a) se repite.',resp)],
        [{valor:`(x ${sg(-a)})(x^2 ${sg(b)})`,por:'Revisa el signo del binomio.'},{valor:`(x ${sg(a)})(x^2 ${sg(-b)})`,por:'Revisa el signo del segundo factor.'},{valor:`x^2(x ${sg(a)})`,por:'Faltó el segundo grupo.'}],'Factorización por agrupación: agrupa términos, saca factor común de cada grupo y luego el binomio que se repite.')},
    'trinomio-dos-letras':rng=>{let a,b;do{a=rng.noCero(-7,7);b=rng.noCero(-7,7)}while(a+b===0);const exp=`x^2 ${sg(a+b)}xy ${sg(a*b)}y^2`.replace(/ ([+-]) 1xy/,' $1 xy').replace(/ ([+-]) 1y\^2/,' $1 y^2'),resp=`(x ${sg(a)}y)(x ${sg(b)}y)`.replace(/ 1y/g,' y');
      return fac(exp,resp,[paso('Como un trinomio x² + bx + c, con y',`Producto \\(${a*b}\\), suma \\(${a+b}\\): \\(${a}\\) y \\(${b}\\)`,'Los mismos dos números, acompañados de y.'),final('Escribe los factores',`\\(${c(resp)}\\)`,'Cada número va con y.',resp)],
        [{valor:`(x ${sg(-a)}y)(x ${sg(-b)}y)`,por:'Signos al revés.'},{valor:`(x ${sg(a)})(x ${sg(b)})`,por:'Falta la y en cada factor.'},{valor:`(x ${sg(a)}y)(x ${sg(-b)}y)`,por:'Revisa el signo de uno de los factores.'}],'Trinomio en dos letras: busca dos números que multipliquen el último coeficiente y sumen el del medio.',{vars:['x','y']})}
  },
  4:{
    'suma-cubos':rng=>{const a=rng.entero(1,5),exp=`x^3 + ${a**3}`,resp=`(x + ${a})(x^2 - ${a}x + ${a*a})`.replace(' 1x',' x');
      return fac(exp,resp,[paso('Es una suma de cubos',`\\(x^{3} + ${a}^{3}\\)`,`${a**3} = ${a}³.`),final('Fórmula: (a + b)(a² − ab + b²)',`\\(${c(T(resp))}\\)`,'El segundo factor tiene el signo del medio contrario.',resp)],
        [{valor:`(x + ${a})^3`,por:'(x + a)³ tiene más términos: no es lo mismo que x³ + a³.'},{valor:`(x + ${a})(x^2 + ${a}x + ${a*a})`,por:'En la suma de cubos, el término del medio del segundo factor es negativo.'},{valor:`(x - ${a})(x^2 + ${a}x + ${a*a})`,por:'Esa es la diferencia de cubos.'}],'Suma de cubos: a³ + b³ = (a + b)(a² − ab + b²).')},
    'diferencia-cubos':rng=>{const a=rng.entero(1,5),exp=`x^3 - ${a**3}`,resp=`(x - ${a})(x^2 + ${a}x + ${a*a})`.replace(' 1x',' x');
      return fac(exp,resp,[paso('Es una diferencia de cubos',`\\(x^{3} - ${a}^{3}\\)`,`${a**3} = ${a}³.`),final('Fórmula: (a − b)(a² + ab + b²)',`\\(${c(T(resp))}\\)`,'El segundo factor lleva todo +.',resp)],
        [{valor:`(x - ${a})^3`,por:'(x − a)³ no es x³ − a³.'},{valor:`(x - ${a})(x^2 - ${a}x + ${a*a})`,por:'En la diferencia de cubos el segundo factor lleva + en el medio.'},{valor:`(x + ${a})(x^2 - ${a}x + ${a*a})`,por:'Esa es la suma de cubos.'}],'Diferencia de cubos: a³ − b³ = (a − b)(a² + ab + b²).')}
  },
  5:{
    'cuarta-potencia':rng=>{const a=rng.entero(1,4),exp=`x^4 - ${a**4}`,resp=`(x - ${a})(x + ${a})(x^2 + ${a*a})`;
      return fac(exp,resp,[paso('Diferencia de cuadrados',`\\((x^{2} - ${a*a})(x^{2} + ${a*a})\\)`,'x⁴ = (x²)² y '+a**4+' = '+a*a+'².'),final('Otra vez: x² − '+a*a,`\\(${c(T(resp))}\\)`,'x² + '+a*a+' ya no se factoriza en los reales.',resp)],
        [{valor:`(x^2 - ${a*a})(x^2 + ${a*a})`,por:'Todavía se puede: x² − '+a*a+' es diferencia de cuadrados.'},{valor:`(x - ${a})^2(x + ${a})^2`,por:'Eso da otro polinomio: x² + '+a*a+' no es (x + '+a+')².'},{valor:`(x - ${a})(x + ${a})(x^2 - ${a*a})`,por:'El último factor es una suma: x² + '+a*a+'.'}],'Factoriza por completo: después de una diferencia de cuadrados, revisa si algún factor se puede seguir factorizando.')},
    'comun-y-diferencia':rng=>{const k=rng.entero(2,6),a=rng.entero(1,7),exp=`${k}x^3 - ${k*a*a}x`,resp=`${k}x(x - ${a})(x + ${a})`;
      return fac(exp,resp,[paso('Factor común',`\\(${k}x(x^{2} - ${a*a})\\)`,`${k}x está en los dos términos.`),final('Diferencia de cuadrados',`\\(${c(resp)}\\)`,'Siempre revisa si lo de adentro se sigue factorizando.',resp)],
        [{valor:`${k}x(x^2 - ${a*a})`,por:'Falta factorizar x² − '+a*a+'.'},{valor:`x(${k}x - ${k*a})(x + ${a})`,por:'Es correcto pero se ve mejor con el '+k+' afuera: revisa que esté completo.'},{valor:`${k}x(x - ${a})^2`,por:'x² − '+a*a+' es (x − '+a+')(x + '+a+').'}],'Primero el factor común; después factoriza lo que queda (aquí, diferencia de cuadrados).')}
  }
},'factor');

/* ---------- Leyes de exponentes ---------- */
const R_EXP='Misma base: al multiplicar se suman los exponentes, al dividir se restan, potencia de potencia se multiplican; x⁻ⁿ = 1/xⁿ y x⁰ = 1.';
const ex=(enun,resp,pasos,errores,vars=['x'],extra={})=>({enunciado:`Simplifica: \\(${enun}\\)`,respuesta:resp,verificar:e=>equivalente(e,resp,{vars}),pasos,errores:errores.map(er=>({...er,si:e=>equivalente(e,er.valor,{vars})})),regla:R_EXP,pista:'Misma base: ¿multiplicas, divides o elevas?',teclado:'mat',comprobar:()=>equivRel(extra.orig||resp,resp),...extra});
const exponentes=conVariantes(orig2['alg/exponentes'],{
  1:{
    'producto-tres':rng=>{const a=rng.entero(2,7),b=rng.entero(2,7),d=rng.entero(2,7),resp=`x^${a+b+d}`;
      return ex(`x^{${a}}\\cdot x^{${b}}\\cdot x^{${d}}`,resp,[paso('Misma base: suma todos los exponentes',`\\(x^{${a}+${b}+${d}}\\)`,'Se multiplican potencias de x.'),final('Resultado',`\\(${c(T(resp))}\\)`,`${a} + ${b} + ${d} = ${a+b+d}.`,resp)],
        [{valor:`x^${a*b*d}`,por:'Al multiplicar se suman los exponentes, no se multiplican.'},{valor:`3x^${a+b+d}`,por:'No aparece un 3: es una sola x elevada.'},{valor:`x^${a+b}`,por:'Falta el tercer exponente.'}],['x'],{orig:`x^${a}*x^${b}*x^${d}`})},
    'coeficientes':rng=>{const p=rng.entero(2,6),q=rng.entero(2,6),a=rng.entero(1,6),b=rng.entero(2,6),resp=`${p*q}x^${a+b}`;
      return ex(`(${p}x^{${a}})(${q}x^{${b}})`,resp,[paso('Multiplica los coeficientes',`\\(${p}\\cdot${q} = ${c(p*q)}\\)`,'Los números se multiplican.'),final('Suma los exponentes',`\\(${c(T(resp))}\\)`,'Misma base.',resp)],
        [{valor:`${p+q}x^${a+b}`,por:'Los coeficientes se multiplican.'},{valor:`${p*q}x^${a*b}`,por:'Los exponentes se suman.'},{valor:`${p*q}x^${a+b+1}`,por:'Solo suma los exponentes que hay.'}],['x'],{orig:`(${p}x^${a})*(${q}x^${b})`})}
  },
  2:{
    'potencia-producto':rng=>{const a=rng.entero(1,5),b=rng.entero(1,5),k=rng.entero(2,4),resp=`x^${a*k}y^${b*k}`;
      return ex(`(x^{${a}}y^{${b}})^{${k}}`,resp,[paso('La potencia afecta a cada factor',`\\((x^{${a}})^{${k}}(y^{${b}})^{${k}}\\)`,'(ab)ⁿ = aⁿbⁿ.'),final('Multiplica exponentes',`\\(${c(T(resp))}\\)`,'Potencia de potencia.',resp)],
        [{valor:`x^${a+k}y^${b+k}`,por:'Potencia de potencia: se multiplican.'},{valor:`x^${a*k}y^${b}`,por:'La potencia también afecta a y.'},{valor:`x^${a}y^${b*k}`,por:'La potencia también afecta a x.'}],['x','y'],{orig:`(x^${a}*y^${b})^${k}`})},
    'cociente-coef':rng=>{const m=rng.entero(2,5),k=m*rng.entero(2,5),a=rng.entero(4,9),b=rng.entero(1,a-1),resp=`${k/m}x^${a-b}`;
      return ex(`\\dfrac{${k}x^{${a}}}{${m}x^{${b}}}`,resp,[paso('Divide los coeficientes',`\\(${k}\\div${m} = ${c(k/m)}\\)`,'Los números se dividen.'),final('Resta los exponentes',`\\(${c(T(resp))}\\)`,'Arriba menos abajo.',resp)],
        [{valor:`${k/m}x^${a+b}`,por:'Al dividir se restan los exponentes.'},{valor:`${k-m}x^${a-b}`,por:'Los coeficientes se dividen.'},{valor:`${k/m}x^${b-a}`,por:'Es el de arriba menos el de abajo.'}],['x'],{orig:`(${k}x^${a})/(${m}x^${b})`})}
  },
  3:{
    'exponente-negativo':rng=>{const a=rng.entero(2,8),b=rng.entero(2,9),resp=`x^${b-a}`;if(a===b)return exponentes.generar(3,rng);
      return ex(`x^{-${a}}\\cdot x^{${b}}`,resp,[paso('Suma los exponentes (con su signo)',`\\(x^{-${a}+${b}}\\)`,'Misma regla con negativos.'),final('Resultado',`\\(${c(T(resp))}\\)`,`−${a} + ${b} = ${b-a}.`,resp)],
        [{valor:`x^${a+b}`,por:'El exponente −'+a+' es negativo: −'+a+' + '+b+'.'},{valor:`x^${-a*b}`,por:'Al multiplicar se suman.'},{valor:`x^${a-b}`,por:'Revisa el signo: −'+a+' + '+b+' = '+(b-a)+'.'}],['x'],{orig:`x^(-${a})*x^${b}`})},
    'fraccion-potencia':rng=>{const a=rng.entero(1,4),b=rng.entero(1,4),k=rng.entero(2,4),resp=`x^${a*k}/y^${b*k}`;
      return ex(`\\left(\\dfrac{x^{${a}}}{y^{${b}}}\\right)^{${k}}`,resp,[paso('Eleva arriba y abajo',`\\(\\dfrac{(x^{${a}})^{${k}}}{(y^{${b}})^{${k}}}\\)`,'(a/b)ⁿ = aⁿ/bⁿ.'),final('Multiplica exponentes',`\\(${c(`\\dfrac{x^{${a*k}}}{y^{${b*k}}}`)}\\)`,'Potencia de potencia.',resp)],
        [{valor:`x^${a*k}/y^${b}`,por:'La potencia también afecta al denominador.'},{valor:`x^${a+k}/y^${b+k}`,por:'Potencia de potencia: se multiplican.'},{valor:`x^${a}/y^${b*k}`,por:'La potencia también afecta al numerador.'}],['x','y'],{orig:`(x^${a}/y^${b})^${k}`})}
  },
  4:{
    'mixto':rng=>{const a=rng.entero(2,4),b=rng.entero(2,3),cc=rng.entero(1,5),d=rng.entero(1,6),resp=`x^${a*b+cc-d}`;
      return ex(`\\dfrac{(x^{${a}})^{${b}}\\cdot x^{${cc}}}{x^{${d}}}`,resp,[paso('Potencia de potencia',`\\(\\dfrac{x^{${a*b}}\\cdot x^{${cc}}}{x^{${d}}}\\)`,'Se multiplican.'),paso('Producto',`\\(\\dfrac{x^{${a*b+cc}}}{x^{${d}}}\\)`,'Se suman.'),final('Cociente',`\\(${c(T(resp))}\\)`,'Se restan.',resp)],
        [{valor:`x^${a+b+cc-d}`,por:'(xᵃ)ᵇ: los exponentes se multiplican.'},{valor:`x^${a*b*cc-d}`,por:'Al multiplicar se suman.'},{valor:`x^${a*b+cc+d}`,por:'Al dividir se restan.'}],['x'],{orig:`((x^${a})^${b}*x^${cc})/x^${d}`})},
    'divide-negativo':rng=>{const a=rng.entero(2,8),b=rng.entero(2,6),resp=`x^${a+b}`;
      return ex(`\\dfrac{x^{${a}}}{x^{-${b}}}`,resp,[paso('Arriba menos abajo',`\\(x^{${a}-(-${b})}\\)`,'Cuidado con el signo.'),final('Resultado',`\\(${c(T(resp))}\\)`,`${a} + ${b} = ${a+b}.`,resp)],
        [{valor:`x^${a-b}`,por:'Restar un negativo es sumar: '+a+' − (−'+b+').'},{valor:`x^${-a*b}`,por:'Al dividir se restan.'},{valor:`x^${-(a+b)}`,por:'Revisa el signo.'}],['x'],{orig:`x^${a}/x^(-${b})`})}
  },
  5:{
    'coef-negativo':rng=>{const k=rng.entero(2,3),a=rng.entero(1,4),m=rng.entero(2,3),resp=`x^${a*m}/${k**m}`;
      return ex(`(${k}x^{-${a}})^{-${m}}`,resp,[paso('Eleva cada factor a −'+m,`\\(${k}^{-${m}}\\cdot x^{${a*m}}\\)`,'(−'+a+')·(−'+m+') = '+a*m+'.'),final('k⁻ⁿ = 1/kⁿ',`\\(${c(`\\dfrac{x^{${a*m}}}{${k**m}}`)}\\)`,`\\(${k}^{-${m}} = \\dfrac{1}{${k**m}}\\)`,resp)],
        [{valor:`${k**m}x^${a*m}`,por:`${k}⁻${m} es 1/${k**m}: va abajo.`},{valor:`x^${-a*m}/${k**m}`,por:'Menos por menos da más en el exponente de x.'},{valor:`${-k*m}x^${a*m}`,por:'Un exponente negativo no hace negativo al número.'}],['x'],{orig:`(${k}*x^(-${a}))^(-${m})`})},
    'dos-letras':rng=>{const p=rng.entero(2,4),a=rng.entero(1,3),b=rng.entero(1,3),resp=`${p*p}x^${2*a-1}y^${3-2*b}`;
      return ex(`(${p}x^{${a}}y^{-${b}})^{2}\\cdot x^{-1}y^{3}`,resp,[paso('Eleva al cuadrado',`\\(${p*p}x^{${2*a}}y^{-${2*b}}\\cdot x^{-1}y^{3}\\)`,'Cada factor al cuadrado.'),final('Suma exponentes de cada letra',`\\(${c(T(resp))}\\)`,'x y y por separado.',resp)],
        [{valor:`${2*p}x^${2*a-1}y^${3-2*b}`,por:`El ${p} también se eleva: ${p}² = ${p*p}.`},{valor:`${p*p}x^${2*a+1}y^${3-2*b}`,por:'x⁻¹ resta 1 al exponente.'},{valor:`${p*p}x^${2*a-1}y^${3+2*b}`,por:'y tiene exponente −'+2*b+' después de elevar.'}],['x','y'],{orig:`(${p}*x^${a}*y^(-${b}))^2*x^(-1)*y^3`})}
  }
},'exponente');

export default {'alg/ecuacion-lineal':ecuacion,'alg/sistema-2x2':sistema2,'alg/factorizacion':factorizacion,'alg/exponentes':exponentes};
