/* Generadores del tema Cálculo diferencial (parte 2): continuidad, definición de derivada, derivadas trascendentes,
   derivación implícita, máximos y mínimos, optimización, razón de cambio y regla de L'Hôpital.
   3 plantillas por nivel (p.plantilla) y comprobar() con un segundo cálculo independiente. Sin DOM. */
import {num,casi,igualNum,equivalente,lista,limpiar,compilar} from './verificar.js';
import {lineal,polinomio,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt,sg,mal} from './algebra-temas.js';

const T=cf=>polinomio(cf,{tex:true}),X=cf=>polinomio(cf,{tex:false});
const der=cf=>cf.slice(1).map((a,k)=>a*(k+1));
const ev=(cf,x)=>cf.reduce((s,a,k)=>s+a*x**k,0);
const sinPrefijo=e=>String(e).replace(/^\s*(?:[a-z]'*\s*\(\s*[a-z]\s*\)|y'|dy\/dx|[a-z]')\s*=\s*/i,'');
const fx=s=>{try{return compilar(s)}catch(e){return null}};
// Derivada numérica (diferencia central) para comprobar de forma independiente
const dnum=(f,x,h=1e-5)=>(f({x:x+h})-f({x:x-h}))/(2*h);
const derOk=(fTxt,dTxt,pts=[0.7,1.3,2.1])=>{const f=fx(fTxt),d=fx(dTxt);return !!f&&!!d&&pts.every(x=>Math.abs(dnum(f,x)-d({x}))<=1e-4*Math.max(1,Math.abs(d({x}))))};
// La expresión como la escribiría una persona (y que compilar() sigue entendiendo): 2e^x, sen(x), sin 1* ni + -
export const bonito=t=>String(t).replace(/\^1(?![\d.])/g,'').replace(/(^|[^\^\d.])(\d+)\*(?=[a-z(])/g,'$1$2').replace(/(^|[^\^\d.])1(?=[a-z(])/g,'$1')
  .replace(/exp\(([^()]*)\)/g,(m,a)=>a.trim()==='x'?'e^x':`e^(${a})`).replace(/(?<![a-z])sin\(/g,'sen(').replace(/\+ -/g,'- ').replace(/- -/g,'+ ').replace(/\(-1x\)/g,'(-x)').replace(/\s+/g,' ').trim();
const expr=(enun,f,resp,pasos,errores,extra={})=>({enunciado:enun,respuesta:bonito(resp),verificar:e=>equivalente(sinPrefijo(e),resp),pasos:pasos.map((p,i)=>i===pasos.length-1&&p.res!==undefined?{...p,res:bonito(p.res)}:p),errores:errores.map(er=>({...er,valor:er.valor===undefined?undefined:bonito(er.valor),si:er.si||(e=>equivalente(sinPrefijo(e),er.valor))})),comprobar:()=>derOk(f,resp)&&equivalente(bonito(resp),resp),...extra});
const numQ=(enun,v,txt,pasos,errores,comprobar,extra={})=>({enunciado:enun,respuesta:txt,verificar:extra.ver||(e=>igualNum(String(e).replace(/^\s*[a-z]\s*=\s*/i,''),v)),pasos,errores,comprobar,...extra});
const esSi=e=>/^\s*(s[ií]|continua)(?![a-zñáéíóú])/i.test(limpiar(e)),esNo=e=>/^\s*(no|discontinua)(?![a-zñáéíóú])/i.test(limpiar(e));
const PI_TXT=v=>`${numTxt(v)}π`;

/* ---------- Continuidad ---------- */
const trozos=(p,q,a,op='<')=>`f(x) = \\begin{cases} ${T(p)} & x ${op==='<'?'\\lt':'\\le'} ${a} \\\\ ${T(q)} & x ${op==='<'?'\\ge':'\\gt'} ${a} \\end{cases}`;
const continuidad={
  titulo:'Continuidad',
  explicacion:'f es continua en a si existe f(a), existe el límite cuando x → a y los dos coinciden: se puede dibujar sin levantar el lápiz. En una función por partes, los límites laterales tienen que ser iguales entre sí y a f(a).',
  alternativa:'Imagina que caminas sobre la gráfica. Si en x = a hay un hoyo (falta el punto), un escalón (salto) o un precipicio (se va al infinito), te caes: ahí no es continua. Para revisar un escalón, mira a qué altura llegas por la izquierda y por la derecha: tienen que coincidir.',
  referencia:'Ver: Stewart, Cálculo, sec. 2.5.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    const lateral=lado=>{const a=rng.entero(-3,3),p=[rng.entero(-6,6),r(-4,4)],q=[rng.entero(-6,6),rng.entero(-3,3),r(-2,2)],v=lado==='izq'?ev(p,a):ev(q,a);
      return numQ(`Si \\(${trozos(p,q,a)}\\), calcula \\(\\lim_{x\\to ${a}^{${lado==='izq'?'-':'+'}}} f(x)\\).`,v,String(v),[paso(lado==='izq'?'Por la izquierda (x < '+a+') vale el primer tramo':'Por la derecha (x ≥ '+a+') vale el segundo tramo',`\\(${T(lado==='izq'?p:q)}\\)`,'Cada límite lateral usa el tramo de su lado.'),final('Sustituye x = '+a,`\\(${c(v)}\\)`,'Son polinomios: basta sustituir.',String(v))],
        [malNum(lado==='izq'?ev(q,a):ev(p,a),'Ese es el otro lado.'),malNum(-v,'Revisa los signos.'),malNum(a,'Sustituye x en el tramo.')].filter(e=>e.valor!==String(v)),()=>casi(fx(X(lado==='izq'?p:q))({x:a-(lado==='izq'?1e-9:-1e-9)}),v,1e-6))};
    const P={
      1:{
        'polinomio':()=>{const cf=[rng.entero(-5,5),rng.entero(-5,5),r(-3,3)],a=rng.entero(-4,4);return {enunciado:`¿Es continua \\(f(x) = ${T(cf)}\\) en \\(x = ${a}\\)? Responde sí o no.`,respuesta:'Sí',verificar:esSi,
          pasos:[paso('Los polinomios son continuos en todo ℝ',`\\(f(${a}) = ${ev(cf,a)} = \\lim_{x\\to ${a}} f(x)\\)`,'No tienen hoyos, saltos ni asíntotas.'),final('Conclusión','Sí es continua.','Polinomio ⇒ continua en todas partes.','Sí')],errores:[{valor:'No',si:esNo,por:'Los polinomios son continuos en todos los reales.'}],comprobar:()=>true}},
        'lateral-izq':()=>lateral('izq'),
        'lateral-der':()=>lateral('der')
      },
      2:{
        'por-partes':()=>{const a=rng.entero(-3,3),p=[rng.entero(-6,6),r(-4,4)],cont=rng.prob(.5);let q=[rng.entero(-5,5),r(-3,3)];if(cont)q[0]=ev(p,a)-q[1]*a;else if(ev(q,a)===ev(p,a))q[0]+=rng.noCero(-3,3);
          const L=ev(p,a),R=ev(q,a);return {enunciado:`¿Es continua \\(${trozos(p,q,a)}\\) en \\(x = ${a}\\)? Responde sí o no.`,respuesta:cont?'Sí':'No',verificar:cont?esSi:esNo,
            pasos:[paso('Límites laterales',`izquierda: \\(${c(L)}\\), derecha: \\(${c(R)}\\)`,'Sustituye en cada tramo.'),final(cont?'Coinciden (y f(a) también)':'No coinciden: hay un salto',cont?`\\(${L} = ${R} = f(${a})\\)`:`\\(${L} \\ne ${R}\\)`,'Continua ⇔ límites laterales iguales a f(a).',cont?'Sí':'No')],
            errores:[{valor:cont?'No':'Sí',si:cont?esNo:esSi,por:cont?'Los dos tramos llegan a la misma altura.':'Hay un salto: los laterales son distintos.'}],comprobar:()=>cont===(L===R)}},
        'denominador-cero':()=>{const a=r(-8,8),k=rng.entero(1,6);return numQ(`¿En qué valor de x no es continua \\(f(x) = \\dfrac{${k}}{x ${sg(-a)}}\\)?`,a,`x = ${a}`,[paso('Una división no existe si el denominador es 0',`\\(x ${sg(-a)} = 0\\)`,'Ahí f no está definida.'),final('Despeja',`\\(x = ${c(a)}\\)`,'Asíntota vertical.',`x = ${a}`)],[malNum(-a,'Iguala el denominador a 0.'),malNum(0,'En x = 0 sí está definida.'),malNum(k,'El numerador no importa.')].filter(e=>e.valor!==String(a)),()=>!Number.isFinite(k/(a-a)))},
        'valor-en-punto':()=>{const a=rng.entero(-3,3),p=[rng.entero(-6,6),r(-4,4)],q=[rng.entero(-6,6),rng.entero(-3,3),r(-2,2)],v=ev(q,a);
          return numQ(`Si \\(${trozos(p,q,a)}\\), ¿cuánto vale \\(f(${a})\\)?`,v,String(v),[paso('¿Qué tramo incluye a '+a+'?',`El segundo: \\(x \\ge ${a}\\)`,'El signo ≥ incluye al punto.'),final('Sustituye',`\\(${c(v)}\\)`,'Evalúa ese tramo.',String(v))],[malNum(ev(p,a),'El primer tramo es para x < '+a+' (no incluye al punto).'),malNum(-v,'Revisa signos.'),malNum(ev(p,a)+v,'Solo un tramo.')].filter(e=>e.valor!==String(v)),()=>v===ev(q,a))}
      },
      3:{
        'k-continua':()=>{const a=r(-3,3),b=rng.entero(-6,6),cc=rng.entero(-6,6);// kx + b (x<a) ; x² + cc (x≥a) → k = (a²+cc−b)/a
          const k=(a*a+cc-b)/a;return numQ(`¿Qué valor de k hace continua \\(f(x) = \\begin{cases} kx ${sg(b)} & x \\lt ${a} \\\\ x^{2} ${sg(cc)} & x \\ge ${a}\\end{cases}\\)?`,k,`k = ${numTxt(k)}`,[paso('Iguala los dos tramos en x = '+a,`\\(${a}k ${sg(b)} = ${a*a} ${sg(cc)}\\)`,'Los laterales tienen que coincidir.'),final('Despeja k',`\\(k = ${c(frac(a*a+cc-b,a))}\\)`,'Ecuación lineal.',`k = ${numTxt(k)}`)],[malNum((a*a+cc+b)/a,'El '+b+' pasa con el signo contrario.'),malNum(a*a+cc-b,'Falta dividir entre '+a+'.'),malNum(-k,'Revisa signos.')].filter(e=>Math.abs(num(e.valor)-k)>1e-9),()=>casi(k*a+b,a*a+cc))},
        'hueco':()=>{const a=r(-7,7);return numQ(`\\(f(x) = \\dfrac{x^{2} - ${a*a}}{x ${sg(-a)}}\\) no está definida en \\(x = ${a}\\). ¿Qué valor hay que darle a \\(f(${a})\\) para que sea continua?`,2*a,String(2*a),[paso('Factoriza y simplifica',`\\(\\dfrac{(x - ${Math.abs(a)})(x + ${Math.abs(a)})}{x ${sg(-a)}} = x ${sg(a)}\\)`,'Diferencia de cuadrados.'),final('El límite tapa el hueco',`\\(\\lim_{x\\to ${a}} (x ${sg(a)}) = ${c(2*a)}\\)`,'Discontinuidad removible.',String(2*a))],[malNum(0,'0/0 no es 0: simplifica primero.'),malNum(a,'Sustituye en x '+sg(a)+'.'),malNum(a*a,'Simplifica y luego sustituye.')].filter(e=>e.valor!==String(2*a)),()=>Math.abs(((a+1e-7)**2-a*a)/(1e-7)-2*a)<1e-4)},
        'salto':()=>{const a=rng.entero(-3,3),p=[rng.entero(-6,6),r(-4,4)];let q=[rng.entero(-6,6),r(-3,3)];if(ev(q,a)===ev(p,a))q[0]+=2;const s=Math.abs(ev(q,a)-ev(p,a));
          return numQ(`¿De qué tamaño es el salto de \\(${trozos(p,q,a)}\\) en \\(x = ${a}\\)?`,s,String(s),[paso('Límites laterales',`\\(${ev(p,a)}\\) y \\(${ev(q,a)}\\)`,'Sustituye en cada tramo.'),final('Diferencia (en valor absoluto)',`\\(${c(s)}\\)`,'La altura del escalón.',String(s))],[malNum(ev(q,a)+ev(p,a),'Es la diferencia.'),malNum(0,'Hay un salto.'),malNum(ev(q,a),'Resta los dos laterales.')].filter(e=>e.valor!==String(s)),()=>s>0&&s===Math.abs(ev(q,a)-ev(p,a)))}
      },
      4:{
        'k-cuadratica':()=>{const a=r(-3,3),b=rng.entero(-6,6);// x² + k (x<a) ; kx + b (x≥a) → a² + k = ka + b → k(1−a) = b − a²
          if(a===1)return P[3]['k-continua']();const k=(b-a*a)/(1-a);return numQ(`¿Qué valor de k hace continua \\(f(x) = \\begin{cases} x^{2} + k & x \\lt ${a} \\\\ kx ${sg(b)} & x \\ge ${a}\\end{cases}\\)?`,k,`k = ${numTxt(k)}`,[paso('Iguala en x = '+a,`\\(${a*a} + k = ${a}k ${sg(b)}\\)`,'Laterales iguales.'),paso('Junta las k',`\\(${1-a}k = ${b-a*a}\\)`,'k a un lado.'),final('Despeja',`\\(k = ${c(frac(b-a*a,1-a))}\\)`,'Ecuación lineal.',`k = ${numTxt(k)}`)],[malNum((b+a*a)/(1-a),'Revisa el signo al pasar '+a*a+'.'),malNum((b-a*a)/(1+a),'Al pasar '+a+'k se resta.'),malNum(-k,'Revisa signos.')].filter(e=>Math.abs(num(e.valor)-k)>1e-9),()=>casi(a*a+k,k*a+b))},
        'tipo':()=>{const tipo=rng.elegir(['removible','salto','infinita']),a=r(-5,5);let tex;
          if(tipo==='removible')tex=`\\dfrac{x^{2} - ${a*a}}{x ${sg(-a)}}`;else if(tipo==='infinita')tex=`\\dfrac{1}{(x ${sg(-a)})^{2}}`;else tex=`\\begin{cases} x & x \\lt ${a} \\\\ x + ${rng.entero(1,5)} & x \\ge ${a}\\end{cases}`;
          return {enunciado:`¿Qué tipo de discontinuidad tiene \\(f(x) = ${tex}\\) en \\(x = ${a}\\)? (removible, salto o infinita)`,respuesta:tipo,clave:tex,verificar:e=>new RegExp('^\\s*'+tipo.slice(0,5),'i').test(limpiar(e))||(tipo==='removible'&&/hueco|evitable/i.test(e))||(tipo==='infinita'&&/asintot|asíntot/i.test(e)),
            pasos:[paso('Mira los límites laterales',tipo==='removible'?'Existe el límite (2a) pero f(a) no está definida.':tipo==='salto'?'Los laterales existen pero son distintos.':'Los laterales se van a infinito.','Clasifica según el límite.'),final('Tipo',tipo,'Removible: hoyo · salto: escalón · infinita: asíntota vertical.',tipo)],
            errores:[{valor:tipo==='removible'?'salto':'removible',si:e=>new RegExp('^\\s*'+(tipo==='removible'?'salt':'remov'),'i').test(e),por:tipo==='removible'?'El límite existe: solo falta el punto (hoyo).':'Calcula los límites laterales.'}],comprobar:()=>true}},
        'cuantas':()=>{let a,b;do{a=r(-6,6);b=r(-6,6)}while(a===b);const k=rng.entero(1,5);return numQ(`¿En cuántos valores de x no es continua \\(f(x) = \\dfrac{${k}}{(x ${sg(-a)})(x ${sg(-b)})}\\)?`,2,'2',[paso('Ceros del denominador',`\\(x = ${a}\\) y \\(x = ${b}\\)`,'Cada factor da uno.'),final('Cuéntalos',`\\(${c(2)}\\)`,'Dos asíntotas verticales.','2')],[malNum(1,'Hay dos factores.'),malNum(0,'El denominador se anula.'),malNum(3,'Solo los ceros del denominador.')],()=>a!==b)}
      },
      5:{
        'k-hueco':()=>{const a=rng.noCero(-5,5),k=rng.noCero(-6,6),m=-a*a-k*a;if(m===0)return P[5]['tvi']();// (x² + kx + m)/(x − a) removible ⇔ a² + ka + m = 0
          return numQ(`¿Para qué k la función \\(\\dfrac{x^{2} + kx ${sg(m)}}{x ${sg(-a)}}\\) tiene un hueco (discontinuidad removible) en \\(x = ${a}\\)?`,k,`k = ${k}`,[paso('El numerador también tiene que ser 0 en x = '+a,`\\(${a*a} + ${par(a)}k ${sg(m)} = 0\\)`,'Así se puede cancelar (x − '+a+').'),final('Despeja',`\\(k = ${c(k)}\\)`,'Ecuación lineal.',`k = ${k}`)],[malNum(-k,'Revisa el signo.'),malNum(a,'Plantea numerador = 0 en x = '+a+'.'),malNum(m,'Ese es el término independiente.')].filter(e=>e.valor!==String(k)),()=>a*a+k*a+m===0)},
        'tvi':()=>{let cf,a,b;do{cf=[rng.entero(-8,8),rng.entero(-5,5),rng.entero(-3,3),r(-2,2)];a=rng.entero(-3,1);b=a+rng.entero(1,3)}while(ev(cf,a)===0||ev(cf,b)===0);const si=ev(cf,a)*ev(cf,b)<0;
          return {enunciado:`¿Garantiza el teorema del valor intermedio que \\(${T(cf)} = 0\\) tiene una solución entre \\(x = ${a}\\) y \\(x = ${b}\\)? Responde sí o no.`,respuesta:si?'Sí':'No',verificar:si?esSi:esNo,
            pasos:[paso('Evalúa en los extremos',`\\(f(${a}) = ${ev(cf,a)},\\ f(${b}) = ${ev(cf,b)}\\)`,'Es continua (polinomio).'),final(si?'Cambia de signo':'No cambia de signo',si?'Entre un negativo y un positivo hay un cero.':'El teorema no garantiza nada (puede o no haber).','TVI: continua y cambio de signo ⇒ hay raíz.',si?'Sí':'No')],
            errores:[{valor:si?'No':'Sí',si:si?esNo:esSi,por:si?'Los signos son opuestos: sí lo garantiza.':'Sin cambio de signo, el teorema no lo garantiza.'}],comprobar:()=>si===(ev(cf,a)*ev(cf,b)<0)}},
        'k-continua':()=>P[3]['k-continua']()
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'f es continua en a si f(a) existe, el límite existe y son iguales; en una función por partes, los límites laterales deben coincidir.',pista:'Compara los límites laterales y f(a).',teclado:'mat',...x};
  }
};

/* ---------- Definición de derivada ---------- */
const definicion={
  titulo:'Definición de derivada',
  explicacion:'La derivada en a es el límite de la pendiente de la secante: f′(a) = lím (f(a + h) − f(a))/h cuando h → 0. Geométricamente, es la pendiente de la recta tangente; físicamente, la velocidad instantánea.',
  alternativa:'Mide la pendiente entre dos puntos de la curva muy cercanos: a y a + h. Ese cociente es la pendiente de una secante. Si acercas h a 0, la secante se convierte en la tangente: su pendiente es la derivada.',
  referencia:'Ver: Stewart, Cálculo, sec. 2.7 y 2.8.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    const secante=()=>{const cf=[rng.entero(-5,5),rng.entero(-4,4),r(-3,3)],a=rng.entero(-3,2),b=a+rng.entero(1,3),v=(ev(cf,b)-ev(cf,a))/(b-a);
      return numQ(`Pendiente de la recta secante a \\(f(x) = ${T(cf)}\\) entre \\(x = ${a}\\) y \\(x = ${b}\\)`,v,numTxt(v),[paso('Evalúa en los dos puntos',`\\(f(${a}) = ${ev(cf,a)},\\ f(${b}) = ${ev(cf,b)}\\)`,'Dos puntos de la curva.'),final('Cambio en y entre cambio en x',`\\(\\dfrac{${ev(cf,b)} - ${par(ev(cf,a))}}{${b} - ${par(a)}} = ${c(frac(ev(cf,b)-ev(cf,a),b-a))}\\)`,'Pendiente promedio.',numTxt(v))],
        [malNum(ev(cf,b)-ev(cf,a),'Falta dividir entre '+(b-a)+'.'),malNum((b-a)/(ev(cf,b)-ev(cf,a)||1),'Es Δy/Δx, no al revés.'),malNum(ev(der(cf),a),'Esa es la pendiente de la tangente en '+a+'.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(v*(b-a),ev(cf,b)-ev(cf,a)))};
    const porDef=(cf,a)=>{const d=ev(der(cf),a);// (f(a+h) − f(a))/h = f'(a) + (resto en h)
      const k2=cf[2]||0,k3=cf[3]||0,h1=k2+3*k3*a,h2=k3;// coef de h y h² en el cociente
      const cociente=lineal([[d,''],[h1,'h'],[h2,'h^2']].filter(([v])=>v).reverse().length?[[h2,'h^2'],[h1,'h'],[d,'']]:[[0,'']]);
      return {d,cociente,pasos:[paso('Plantea el cociente',`\\(\\dfrac{f(${a} + h) - f(${a})}{h}\\)`,'Pendiente de la secante entre a y a + h.'),paso('Desarrolla y simplifica (se cancela la h de abajo)',`\\(${c(cociente.replace(/\^2/g,'^{2}'))}\\)`,'Todos los términos sin h se anulan.'),final('h → 0',`\\(f'(${a}) = ${c(d)}\\)`,'Los términos con h desaparecen.',String(d))]}};
    const P={
      1:{
        'secante':secante,
        'lineal':()=>{const m=r(-8,8),b=rng.entero(-9,9),a=rng.entero(-5,5);return numQ(`Con la definición, calcula \\(f'(${a})\\) para \\(f(x) = ${lineal([[m,'x'],[b,'']])}\\)`,m,String(m),[paso('Cociente',`\\(\\dfrac{${m}(${a} + h) ${sg(b)} - (${m}\\cdot${par(a)} ${sg(b)})}{h} = \\dfrac{${m}h}{h}\\)`,'Se cancela todo menos '+m+'h.'),final('Límite',`\\(${c(m)}\\)`,'Una recta tiene la misma pendiente en todos lados.',String(m))],[malNum(m*a+b,'Ese es f('+a+'), no la pendiente.'),malNum(b,'b es la ordenada al origen.'),malNum(0,'Solo las constantes tienen derivada 0.')].filter(e=>e.valor!==String(m)),()=>casi(dnum(fx(`${m}*x+${b}`),a),m))},
        'velocidad-promedio':()=>{const v0=rng.entero(5,30),t1=rng.entero(0,2),t2=t1+rng.entero(1,3),s=t=>v0*t-5*t*t,v=(s(t2)-s(t1))/(t2-t1);
          return numQ(`La altura de una pelota es \\(s(t) = ${v0}t - 5t^{2}\\) (m). ¿Cuál es su velocidad promedio entre \\(t = ${t1}\\) y \\(t = ${t2}\\) s (m/s)?`,v,numTxt(v),[paso('Alturas',`\\(s(${t1}) = ${s(t1)},\\ s(${t2}) = ${s(t2)}\\)`,'Evalúa.'),final('Δs/Δt',`\\(${c(numTxt(v))}\\)`,'Velocidad promedio = pendiente de la secante.',numTxt(v))],[malNum(s(t2)-s(t1),'Divide entre el tiempo.'),malNum(s(t2)/t2,'Es (s₂ − s₁)/(t₂ − t₁).'),malNum(v0-10*t1,'Esa es la instantánea en '+t1+'.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(v*(t2-t1),s(t2)-s(t1)))}
      },
      2:{
        'x-cuadrada':()=>{const a=rng.entero(-6,6),cf=[rng.entero(-5,5),0,1],{d,pasos}=porDef(cf,a);return numQ(`Usa la definición para calcular \\(f'(${a})\\) con \\(f(x) = ${T(cf)}\\)`,d,String(d),pasos,[malNum(ev(cf,a),'Ese es f('+a+').'),malNum(a,'Es 2a.'),malNum(a*a,'Deriva: 2a.')].filter(e=>e.valor!==String(d)),()=>casi(dnum(fx(X(cf)),a),d,1e-6))},
        'cociente-h':()=>{const a=rng.entero(-4,4),k=r(-3,3),cf=[rng.entero(-5,5),0,k],resp=lineal([[k,'h'],[2*k*a,'']]);
          return {enunciado:`Para \\(f(x) = ${T(cf)}\\), simplifica \\(\\dfrac{f(${a} + h) - f(${a})}{h}\\) (escribe una expresión en h).`,respuesta:resp,verificar:e=>equivalente(String(e).replace(/h/g,'x'),resp.replace(/h/g,'x')),
            pasos:[paso('Desarrolla f(a + h)',`\\(${k}(${a} + h)^{2} = ${k*a*a} + ${2*k*a}h + ${k}h^{2}\\)`,'Cuadrado de binomio.'),final('Resta f(a) y divide entre h',`\\(${c(resp)}\\)`,'Se cancela el término sin h.',resp)],
            errores:[{valor:String(2*k*a),si:e=>igualNum(e,2*k*a),por:'Todavía no tomes el límite: deja la h.'},{valor:lineal([[k,'h'],[k*a,'']]),si:e=>equivalente(String(e).replace(/h/g,'x'),lineal([[k,'x'],[k*a,'']])),por:'(a + h)² tiene 2ah.'},{valor:lineal([[k,'h^2'],[2*k*a,'h']]),si:e=>equivalente(String(e).replace(/h/g,'x'),lineal([[k,'x^2'],[2*k*a,'x']])),por:'Falta dividir entre h.'}],
            comprobar:()=>{const h=0.37;return casi((ev(cf,a+h)-ev(cf,a))/h,k*h+2*k*a)}}},
        'secante':secante
      },
      3:{
        'cuadratica':()=>{const a=rng.entero(-4,4),cf=[rng.entero(-6,6),rng.entero(-5,5),r(-3,3)],{d,pasos}=porDef(cf,a);return numQ(`Usa la definición para calcular \\(f'(${a})\\) con \\(f(x) = ${T(cf)}\\)`,d,String(d),pasos,[malNum(ev(cf,a),'Ese es f(a).'),malNum(2*cf[2]*a,'Falta el término '+cf[1]+'x.'),malNum(-d,'Revisa signos.')].filter(e=>e.valor!==String(d)),()=>casi(dnum(fx(X(cf)),a),d,1e-6))},
        'tangente':()=>{const a=rng.entero(-3,3),cf=[rng.entero(-6,6),rng.entero(-4,4),r(-2,2)],m=ev(der(cf),a),y0=ev(cf,a),b=y0-m*a,resp=`y = ${lineal([[m,'x'],[b,'']])}`;
          return {enunciado:`Recta tangente a \\(f(x) = ${T(cf)}\\) en \\(x = ${a}\\) (escribe y = mx + b).`,respuesta:resp,verificar:e=>{const d=String(e).replace(/^\s*y\s*=\s*/i,'');return (m===0||/x/.test(d))&&equivalente(d,lineal([[m,'x'],[b,'']]))},
            pasos:[paso('Punto de tangencia',`\\(f(${a}) = ${c(y0)}\\)`,'La tangente pasa por (a, f(a)).'),paso('Pendiente = f′(a)',`\\(f'(x) = ${T(der(cf))} \\Rightarrow f'(${a}) = ${c(m)}\\)`,'Derivada en el punto.'),final('y − f(a) = m(x − a)',`\\(${c(resp)}\\)`,'Despeja y.',resp)],
            errores:[{valor:`y = ${lineal([[m,'x'],[y0,'']])}`,si:e=>equivalente(String(e).replace(/^\s*y\s*=\s*/i,''),lineal([[m,'x'],[y0,'']]))&&a!==0,por:'b no es f(a): usa y − f(a) = m(x − a).'},{valor:`y = ${lineal([[y0,'x'],[b,'']])}`,si:e=>equivalente(String(e).replace(/^\s*y\s*=\s*/i,''),lineal([[y0,'x'],[b,'']])),por:'La pendiente es f′(a), no f(a).'}],
            comprobar:()=>casi(m*a+b,y0)&&casi(dnum(fx(X(cf)),a),m,1e-6)}},
        'velocidad-instantanea':()=>{const v0=rng.entero(10,40),t=rng.entero(1,3),v=v0-10*t;return numQ(`La altura de una pelota es \\(s(t) = ${v0}t - 5t^{2}\\) (m). ¿Cuál es su velocidad instantánea en \\(t = ${t}\\) s?`,v,String(v),[paso('Velocidad = s′(t)',`\\(s'(t) = ${v0} - 10t\\)`,'Límite de la velocidad promedio.'),final('Evalúa',`\\(s'(${t}) = ${c(v)}\\)`,'Negativa: va bajando.',String(v))],[malNum(v0*t-5*t*t,'Esa es la altura.'),malNum(v0-5*t,'(5t²)′ = 10t.'),malNum(v0,'Esa es la velocidad inicial.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(`${v0}*x-5*x^2`),t),v,1e-6))}
      },
      4:{
        'cubica':()=>{const a=rng.entero(-3,3),cf=[rng.entero(-5,5),0,0,r(-2,2)],{d,pasos}=porDef(cf,a);return numQ(`Usa la definición para calcular \\(f'(${a})\\) con \\(f(x) = ${T(cf)}\\)`,d,String(d),pasos,[malNum(ev(cf,a),'Ese es f(a).'),malNum(cf[3]*a*a,'(a + h)³ da 3a²h.'),malNum(-d,'Revisa signos.')].filter(e=>e.valor!==String(d)),()=>casi(dnum(fx(X(cf)),a),d,1e-5))},
        'tangente':()=>P[3]['tangente'](),
        'uno-entre-x':()=>{const a=rng.elegir([1,2,-1,-2,4,-4]),k=rng.elegir([1,2,3,-1]),v=-k/(a*a);return numQ(`Con la definición, \\(f'(${a})\\) para \\(f(x) = \\dfrac{${k}}{x}\\)`,v,frac(-k,a*a,{tex:false}),[paso('Cociente',`\\(\\dfrac{\\frac{${k}}{${a} + h} - \\frac{${k}}{${a}}}{h} = \\dfrac{-${k}}{${a}(${a} + h)}\\)`,'Común denominador; se cancela la h.'),final('h → 0',`\\(-\\dfrac{${k}}{${a*a}} = ${c(frac(-k,a*a))}\\)`,'(k/x)′ = −k/x².',frac(-k,a*a,{tex:false}))],[malNum(k/(a*a),'Lleva signo menos.'),malNum(k/a,'Ese es f(a).'),malNum(-k/a,'Es entre a².')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(dnum(fx(`${k}/x`),a),v,1e-5))}
      },
      5:{
        'raiz':()=>{const s=rng.elegir([1,4,9,16,25]),v=1/(2*Math.sqrt(s));return numQ(`Con la definición, \\(f'(${s})\\) para \\(f(x) = \\sqrt{x}\\)`,v,numTxt(v),[paso('Racionaliza el cociente',`\\(\\dfrac{\\sqrt{${s} + h} - ${Math.sqrt(s)}}{h}\\cdot\\dfrac{\\sqrt{${s} + h} + ${Math.sqrt(s)}}{\\sqrt{${s} + h} + ${Math.sqrt(s)}} = \\dfrac{1}{\\sqrt{${s} + h} + ${Math.sqrt(s)}}\\)`,'Multiplica por el conjugado.'),final('h → 0',`\\(\\dfrac{1}{2\\cdot${Math.sqrt(s)}} = ${c(frac(1,2*Math.sqrt(s)))}\\)`,'(√x)′ = 1/(2√x).',numTxt(v))],[malNum(Math.sqrt(s),'Ese es f(a).'),malNum(1/Math.sqrt(s),'Falta el 2.'),malNum(s/2,'(√x)′ = 1/(2√x).')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(dnum(fx('sqrt(x)'),s),v,1e-5))},
        'cubica-general':()=>{const a=rng.entero(-2,2),cf=[rng.entero(-5,5),rng.entero(-4,4),rng.entero(-3,3),r(-2,2)],{d,pasos}=porDef(cf,a);return numQ(`Usa la definición para calcular \\(f'(${a})\\) con \\(f(x) = ${T(cf)}\\)`,d,String(d),pasos,[malNum(ev(cf,a),'Ese es f(a).'),malNum(-d,'Revisa signos.'),malNum(d+1,'Revisa el desarrollo.')].filter(e=>e.valor!==String(d)),()=>casi(dnum(fx(X(cf)),a),d,1e-5))},
        'uno-entre-x':()=>P[4]['uno-entre-x']()
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:"f′(a) = lím (f(a + h) − f(a))/h cuando h → 0: la pendiente de la tangente (la secante con h → 0).",pista:'Plantea (f(a + h) − f(a))/h, simplifica y haz h → 0.',teclado:'mat',...x};
  }
};

/* ---------- Derivadas trigonométricas, exponenciales y logarítmicas ---------- */
const R_TRAS="(sen x)′ = cos x · (cos x)′ = −sen x · (eˣ)′ = eˣ · (ln x)′ = 1/x · (aˣ)′ = aˣ ln a; con la regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x).";
const trascendentes={
  titulo:'Derivadas trigonométricas, exponenciales y logarítmicas',
  explicacion:'Fórmulas base: (sen x)′ = cos x, (cos x)′ = −sen x, (eˣ)′ = eˣ, (ln x)′ = 1/x. Si adentro hay otra función, multiplica por la derivada de adentro (regla de la cadena). Puedes escribir sen o sin, y e^x o exp(x).',
  alternativa:'eˣ es la única función que es su propia velocidad: crece exactamente tanto como vale. El seno y el coseno se persiguen: la derivada del seno es el coseno y la del coseno es menos el seno (como una rueda que gira). Y ln x crece cada vez más lento: su ritmo es 1/x.',
  referencia:'Ver: Stewart, Cálculo, sec. 3.1, 3.3 y 3.6.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const k=()=>rng.elegir([2,3,4,5,-2,-3]),kk=v=>v===1?'':v===-1?'-':String(v);
    const D=(f,fTex,d,dTex,pasos,errores)=>expr(`Deriva: \\(f(x) = ${fTex}\\)`,f,d,[...pasos,final('Resultado',`\\(f'(x) = ${c(dTex)}\\)`,'Simplifica si puedes.',d)],errores);
    const P={
      1:{
        'seno-coseno':()=>{const a=k(),t=rng.elegir(['sin','cos']),f=`${a}*${t}(x)`,d=t==='sin'?`${a}*cos(x)`:`${-a}*sin(x)`;
          return D(f,`${kk(a)}\\${t==='sin'?'sin':'cos'} x`,d,t==='sin'?`${kk(a)}\\cos x`:`${kk(-a)}\\sin x`,[paso('Regla',t==='sin'?'\\((\\sin x)\' = \\cos x\\)':'\\((\\cos x)\' = -\\sin x\\)','La constante sale.')],
            [{valor:t==='sin'?`${-a}*cos(x)`:`${a}*sin(x)`,por:t==='sin'?'(sen x)′ = +cos x.':'(cos x)′ = −sen x: lleva menos.'},{valor:t==='sin'?`${a}*sin(x)`:`${a}*cos(x)`,por:'Cambia la función al derivar.'},{valor:t==='sin'?'cos(x)':'-sin(x)',por:`La constante ${a} se conserva.`}])},
        'exponencial':()=>{const a=k(),f=`${a}*exp(x)`;return D(f,`${kk(a)}e^{x}`,f,`${kk(a)}e^{x}`,[paso('Regla',`\\((e^{x})' = e^{x}\\)`,'eˣ es su propia derivada.')],[{valor:`${a}*x*exp(x-1)`,por:'No es la regla de la potencia: (eˣ)′ = eˣ.'},{valor:String(a),por:'eˣ no es constante.'},{valor:`exp(x)`,por:`La constante ${a} se conserva.`}])},
        'logaritmo':()=>{const a=k(),f=`${a}*ln(x)`,d=`${a}/x`;return D(f,`${kk(a)}\\ln x`,d,`\\dfrac{${a}}{x}`,[paso('Regla',`\\((\\ln x)' = \\dfrac{1}{x}\\)`,'La constante sale.')],[{valor:`${a}*ln(x)/x`,por:'(ln x)′ = 1/x (el ln desaparece).'},{valor:`${a}*x`,por:'Es 1/x, no x.'},{valor:'1/x',por:`Multiplica por ${a}.`}])}
      },
      2:{
        'suma':()=>{const a=k(),b=k(),cc=k(),f=`${a}*sin(x) + ${b}*exp(x) + ${cc}*ln(x)`,d=`${a}*cos(x) + ${b}*exp(x) + ${cc}/x`;
          return D(f,`${kk(a)}\\sin x ${b<0?'-':'+'} ${kk(Math.abs(b))}e^{x} ${cc<0?'-':'+'} ${kk(Math.abs(cc))}\\ln x`,d,`${kk(a)}\\cos x ${b<0?'-':'+'} ${kk(Math.abs(b))}e^{x} ${cc<0?'-':'+'} \\dfrac{${Math.abs(cc)}}{x}`,[paso('Término a término',`\\((\\sin x)' = \\cos x,\\ (e^{x})' = e^{x},\\ (\\ln x)' = \\dfrac{1}{x}\\)`,'La derivada de una suma es la suma de derivadas.')],
            [{valor:`${a}*cos(x) + ${b}*exp(x) + ${cc}*ln(x)/x`,por:'(ln x)′ = 1/x.'},{valor:`${-a}*cos(x) + ${b}*exp(x) + ${cc}/x`,por:'(sen x)′ = +cos x.'},{valor:`${a}*cos(x) + ${b}*x*exp(x) + ${cc}/x`,por:'(eˣ)′ = eˣ.'}])},
        'base-a':()=>{const a=rng.elegir([2,3,5,10]),f=`${a}^x`,d=`${a}^x*ln(${a})`;return D(f,`${a}^{x}`,d,`${a}^{x}\\ln ${a}`,[paso('Regla',`\\((a^{x})' = a^{x}\\ln a\\)`,'Con base distinta de e aparece ln a.')],[{valor:`x*${a}^(x-1)`,por:'No es la regla de la potencia: x está en el exponente.'},{valor:`${a}^x`,por:'Solo eˣ es su propia derivada: falta ln '+a+'.'},{valor:`${a}^x/ln(${a})`,por:'Se multiplica por ln a.'}])},
        'tangente':()=>{const a=k(),f=`${a}*tan(x)`,d=`${a}/cos(x)^2`;return D(f,`${kk(a)}\\tan x`,d,`${kk(a)}\\sec^{2} x`,[paso('Regla',`\\((\\tan x)' = \\sec^{2} x = \\dfrac{1}{\\cos^{2} x}\\)`,'Sale de la regla del cociente sen/cos.')],[{valor:`${a}*cos(x)^2`,por:'Es 1/cos², no cos².'},{valor:`${a}/sin(x)^2`,por:'Es entre cos².'},{valor:`${a}*tan(x)^2`,por:'sec² x = 1 + tan² x, no tan² x.'}])}
      },
      3:{
        'cadena-lineal':()=>{const a=k(),t=rng.elegir(['sin','cos','exp','ln']),b=rng.entero(1,5);let f,d,fT,dT;
          if(t==='sin'){f=`sin(${a}*x)`;d=`${a}*cos(${a}*x)`;fT=`\\sin(${a}x)`;dT=`${a}\\cos(${a}x)`}else if(t==='cos'){f=`cos(${a}*x)`;d=`${-a}*sin(${a}*x)`;fT=`\\cos(${a}x)`;dT=`${-a}\\sin(${a}x)`}else if(t==='exp'){f=`exp(${a}*x)`;d=`${a}*exp(${a}*x)`;fT=`e^{${a}x}`;dT=`${a}e^{${a}x}`}else{const A=Math.abs(a);f=`ln(${A}*x + ${b})`;d=`${A}/(${A}*x + ${b})`;fT=`\\ln(${A}x + ${b})`;dT=`\\dfrac{${A}}{${A}x + ${b}}`}
          return D(f,fT,d,dT,[paso('Regla de la cadena',`\\((g(${t==='ln'?Math.abs(a)+'x + '+b:a+'x'}))' = g'(\\dots)\\cdot ${t==='ln'?Math.abs(a):a}\\)`,'Multiplica por la derivada de adentro.')],
            [{valor:d.replace(/^-?\d+\*|^\d+\//,t==='ln'?'1/':''),si:e=>equivalente(sinPrefijo(e),t==='ln'?`1/(${Math.abs(a)}*x + ${b})`:d.replace(/^-?\d+\*/,'')),por:'Falta multiplicar por la derivada de adentro.'},{valor:t==='exp'?`exp(${a}*x)`:t==='sin'?`cos(${a}*x)`:t==='cos'?`-sin(${a}*x)`:`1/x`,por:'Regla de la cadena: por la derivada de adentro.'},{valor:t==='exp'?`${a}*x*exp(${a}*x-1)`:t==='sin'?`${a}*cos(x)`:t==='cos'?`${a}*sin(${a}*x)`:`${Math.abs(a)}/x`,por:'Revisa la fórmula base y lo de adentro.'}])},
        'x-por-exp':()=>{const a=rng.elegir([1,2,3,-1]),f=`x*exp(${a}*x)`,d=`exp(${a}*x) + ${a}*x*exp(${a}*x)`;return D(f,`xe^{${a===1?'':a===-1?'-':a}x}`,d,`e^{${a===1?'':a}x}(1 ${sg(a)}x)`,[paso('Regla del producto',`\\((x)'e^{${a}x} + x(e^{${a}x})'\\)`,'f′g + fg′.')],[{valor:`${a}*exp(${a}*x)`,por:'Es un producto: f′g + fg′.'},{valor:`exp(${a}*x)`,por:'Falta el término x·(e^{'+a+'x})′.'},{valor:`${a}*x*exp(${a}*x)`,por:'Falta el término (x)′·e^{'+a+'x}.'}])},
        'ln-cuadrado':()=>{const a=rng.entero(1,9),f=`ln(x^2 + ${a})`,d=`2*x/(x^2 + ${a})`;return D(f,`\\ln(x^{2} + ${a})`,d,`\\dfrac{2x}{x^{2} + ${a}}`,[paso('(ln u)′ = u′/u',`\\(u = x^{2} + ${a},\\ u' = 2x\\)`,'Cadena.')],[{valor:`1/(x^2 + ${a})`,por:'Falta multiplicar por u′ = 2x.'},{valor:`2*x*ln(x^2 + ${a})`,por:'(ln u)′ = u′/u.'},{valor:`1/(2*x)`,por:'Es u′/u.'}])}
      },
      4:{
        'exp-cuadrado':()=>{const a=rng.elegir([1,2,-1,3]),f=`exp(${a}*x^2)`,d=`${2*a}*x*exp(${a}*x^2)`;return D(f,`e^{${a===1?'':a===-1?'-':a}x^{2}}`,d,`${2*a}xe^{${a===1?'':a===-1?'-':a}x^{2}}`,[paso('Cadena',`\\(u = ${a}x^{2},\\ u' = ${2*a}x\\)`,'(e^u)′ = e^u·u′.')],[{valor:f,por:'Falta multiplicar por u′.'},{valor:`${a}*x^2*exp(${a}*x^2-1)`,por:'No es la regla de la potencia.'},{valor:`${a}*x*exp(${a}*x^2)`,por:'(x²)′ = 2x.'}])},
        'x-por-seno':()=>{const a=rng.elegir([1,2,3]),A=a===1?'':a,f=`x*sin(${a}*x)`,d=`sin(${a}*x) + ${a}*x*cos(${a}*x)`;return D(f,`x\\sin(${A}x)`,d,`\\sin(${A}x) + ${A}x\\cos(${A}x)`,[paso('Producto',`\\((x)'\\sin(${A}x) + x(\\sin(${A}x))'\\)`,'f′g + fg′.')],[{valor:`${a}*cos(${a}*x)`,por:'Es un producto: f′g + fg′.'},{valor:`${a}*x*cos(${a}*x)`,por:'Falta (x)′·sen.'},{valor:`sin(${a}*x) - ${a}*x*cos(${a}*x)`,por:'(sen u)′ = +cos u·u′.'}])},
        'ln-sobre-x':()=>{const k=rng.elegir([1,2,3]),f=`ln(x)/x^${k}`,d=`(1 - ${k}*ln(x))/x^${k+1}`;return D(f,`\\dfrac{\\ln x}{x${k>1?`^{${k}}`:''}}`,d,`\\dfrac{1 - ${k>1?k:''}\\ln x}{x^{${k+1}}}`,[paso('Cociente',`\\(\\dfrac{\\frac{1}{x}\\cdot x^{${k}} - \\ln x\\cdot ${k}x^{${k-1}}}{x^{${2*k}}}\\)`,'(f′g − fg′)/g².')],[{valor:`1/(${k}*x^${k})`,por:'Es un cociente: usa la regla.'},{valor:`(${k}*ln(x) - 1)/x^${k+1}`,por:'El orden: f′g − fg′.'},{valor:`1/x^${k+1}`,por:'Falta el término con ln x.'}])}
      },
      5:{
        'exp-por-seno':()=>{const a=rng.elegir([1,2,3]),f=`exp(${a}*x)*sin(x)`,d=`${a}*exp(${a}*x)*sin(x) + exp(${a}*x)*cos(x)`;return D(f,`e^{${a===1?'':a}x}\\sin x`,d,`e^{${a===1?'':a}x}(${a===1?'':a}\\sin x + \\cos x)`,[paso('Producto + cadena',`\\((e^{${a}x})' = ${a}e^{${a}x}\\)`,'f′g + fg′.')],[{valor:`${a}*exp(${a}*x)*cos(x)`,por:'Es un producto: f′g + fg′.'},{valor:`exp(${a}*x)*sin(x) + exp(${a}*x)*cos(x)`,por:`(e^{${a}x})′ = ${a}e^{${a}x}.`},{valor:`${a}*exp(${a}*x)*sin(x) - exp(${a}*x)*cos(x)`,por:'(sen x)′ = +cos x.'}])},
        'seno-cuadrado':()=>{const k=rng.elegir([1,2,3,-1]),t=rng.elegir(['sin','cos']),K=k===1?'':k===-1?'-':k,f=`${k}*${t}(x)^2`,d=t==='sin'?`${2*k}*sin(x)*cos(x)`:`${-2*k}*cos(x)*sin(x)`;
          return D(f,`${K}\\${t}^{2} x`,d,`${t==='sin'?2*k:-2*k}\\sin x\\cos x`,[paso('Cadena: (u²)′ = 2u·u′',`\\(u = \\${t} x,\\ u' = ${t==='sin'?'\\cos x':'-\\sin x'}\\)`,'Potencia de una función.')],[{valor:`${2*k}*${t}(x)`,por:'Falta multiplicar por la derivada de adentro.'},{valor:`${k}*${t==='sin'?'cos':'sin'}(x)^2`,por:'Regla de la cadena: 2u·u′.'},{valor:t==='sin'?`${-2*k}*sin(x)*cos(x)`:`${2*k}*cos(x)*sin(x)`,por:'Revisa el signo de la derivada de adentro.'}])},
        'ln-raiz':()=>{const a=rng.entero(1,6),f=`ln(sqrt(x^2 + ${a}))`,d=`x/(x^2 + ${a})`;return D(f,`\\ln\\sqrt{x^{2} + ${a}}`,d,`\\dfrac{x}{x^{2} + ${a}}`,[paso('Simplifica antes',`\\(\\ln\\sqrt{u} = \\tfrac{1}{2}\\ln u\\)`,'Propiedad de logaritmos.'),paso('Deriva',`\\(\\tfrac{1}{2}\\cdot\\dfrac{2x}{x^{2} + ${a}}\\)`,'Cadena.')],[{valor:`2*x/(x^2 + ${a})`,por:'Falta el 1/2 de la raíz.'},{valor:`1/sqrt(x^2 + ${a})`,por:'(ln u)′ = u′/u.'},{valor:`x/sqrt(x^2 + ${a})`,por:'Simplifica con ln √u = ½ ln u.'}])}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:R_TRAS,pista:'Fórmula base y, si hay algo adentro, multiplica por su derivada.',teclado:'mat',...x};
  }
};

/* ---------- Derivación implícita ---------- */
// Verifica y' = F(x, y) en puntos que están SOBRE la curva (pts) comparando con la fórmula esperada
const enCurva=(resp,pts)=>e=>{let f,g;try{f=compilar(sinPrefijo(e));g=compilar(resp)}catch(x){return false}return pts.every(([x,y])=>{const a=f({x,y}),b=g({x,y});return Number.isFinite(a)&&Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b))})};
const implicita={
  titulo:'Derivación implícita',
  explicacion:'Cuando y no está despejada, deriva los dos lados respecto a x tratando a y como función de x: cada vez que derivas algo con y, multiplica por y′ (regla de la cadena). Luego despeja y′.',
  alternativa:'Piensa que y es "una función escondida" de x. Derivar y² es como derivar (algo)²: da 2·(algo)·(derivada de ese algo) = 2y·y′. Después juntas los términos con y′ de un lado y despejas, como en cualquier ecuación.',
  referencia:'Ver: Stewart, Cálculo, sec. 3.5.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const Q=(eq,resp,pts,pasos,errores,extra={})=>({enunciado:`Encuentra \\(y'\\) si \\(${eq}\\) (puede quedar en función de x y de y).`,respuesta:`y' = ${bonito(resp)}`,verificar:enCurva(resp,pts),
      pasos:[...pasos,final('Despeja y′',`\\(y' = ${c(extra.tex||resp)}\\)`,'Todo lo que tiene y′ a un lado.',`y' = ${bonito(resp)}`)],errores:errores.filter(([v])=>pts.every(([x,y])=>{const f=fx(v);return !!f&&Number.isFinite(f({x,y}))})).map(([v,por])=>({valor:`y' = ${bonito(v)}`,si:enCurva(v,pts),por})),
      comprobar:()=>pts.every(([x,y])=>{const F=fx(extra.F),G=fx(resp);if(!F)return true;const h=1e-6,Fx=(F({x:x+h,y})-F({x:x-h,y}))/(2*h),Fy=(F({x,y:y+h})-F({x,y:y-h}))/(2*h);return Math.abs(-Fx/Fy-G({x,y}))<1e-4*Math.max(1,Math.abs(G({x,y})))}),...extra});
    const P={
      1:{
        'circulo':()=>{const R=rng.elegir([5,10,13,25]),pts=R===5?[[3,4],[4,-3],[-3,4]]:R===10?[[6,8],[8,-6]]:R===13?[[5,12],[12,-5]]:[[7,24],[24,7]];return Q(`x^{2} + y^{2} = ${R*R}`,'-x/y',pts,[paso('Deriva los dos lados',`\\(2x + 2y\\,y' = 0\\)`,'(y²)′ = 2y·y′.')],[['x/y','Al despejar, 2x pasa con el signo contrario.'],['-y/x','Despeja bien: y′ = −2x/(2y).'],['-2*x','Falta dividir entre 2y.']],{tex:'-\\dfrac{x}{y}',F:`x^2+y^2-${R*R}`})},
        'recta':()=>{const a=rng.noCero(-6,6),b=rng.noCero(-6,6),cc=rng.entero(-9,9),pts=[[0,cc/b],[1,(cc-a)/b],[2,(cc-2*a)/b]];return Q(`${lineal([[a,'x'],[b,'y']])} = ${cc}`,frac(-a,b,{tex:false}),pts,[paso('Deriva',`\\(${a} + ${b}y' = 0\\)`,'Cada término respecto a x.')],[[frac(a,b,{tex:false}),'Revisa el signo.'],[frac(-b,a,{tex:false}),'Al revés.'],[String(-a),`Divide entre ${b}.`]],{tex:frac(-a,b),F:`${a}*x+${b}*y-${cc}`})},
        'parabola-y':()=>{const k=rng.elegir([2,4,8,-2]),pts=[[k*1,k],[k*4,2*k],[k*9,3*k]].map(([x,y])=>[x/k*Math.abs(k)/Math.abs(k),y]).map(([x,y])=>[y*y/k,y]);return Q(`y^{2} = ${k}x`,`${frac(k,2,{tex:false})}/y`.replace(/^(-?\d+)\/(\d+)\/y$/,'$1/($2*y)'),pts,[paso('Deriva',`\\(2y\\,y' = ${k}\\)`,'(y²)′ = 2y·y′.')],[[`${k}/2`,'Falta dividir entre y.'],[`2*y/${k}`,'Al revés.'],[`${k}*y/2`,'Divide entre 2y.']],{tex:`\\dfrac{${k}}{2y}`,F:`y^2-${k}*x`})}
      },
      2:{
        'elipse':()=>{const a=rng.entero(1,4),b=rng.entero(1,4),pts=[[1,2],[2,1],[-1,3]].map(([x,y])=>[x,y]),C=pts.map(([x,y])=>a*x*x+b*y*y);// usa la curva que pasa por el primer punto
          const K=a+4*b,p=[[1,2],[1,-2],[-1,2]],g=((m,n)=>{while(n){[m,n]=[n,m%n]}return m})(a,b),A=a/g,B=b/g;return Q(`${a===1?'':a}x^{2} + ${b===1?'':b}y^{2} = ${K}`,B===1?`-${A}*x/y`:`-${A}*x/(${B}*y)`,p,[paso('Deriva',`\\(${2*a}x + ${2*b}y\\,y' = 0\\)`,'(y²)′ = 2y·y′.')],[[`${a}*x/(${b}*y)`,'Revisa el signo.'],[`-${b}*y/(${a}*x)`,'Al revés.'],[`-${2*a}*x`,`Divide entre ${2*b}y.`]],{tex:`-\\dfrac{${a===1?'':a}x}{${b===1?'':b}y}`,F:`${a}*x^2+${b}*y^2-${K}`})},
        'xy-constante':()=>{const k=rng.noCero(-12,12),pts=[[1,k],[2,k/2],[-3,-k/3]];return Q(`xy = ${k}`,'-y/x',pts,[paso('Producto: (xy)′ = y + x y′',`\\(y + x\\,y' = 0\\)`,'Regla del producto.')],[['y/x','Revisa el signo.'],['-x/y','Al revés.'],['-y','Divide entre x.']],{tex:'-\\dfrac{y}{x}',F:`x*y-${k}`})},
        'y-cubo':()=>{const pts=[[1,1],[8,2],[-8,-2]];return Q('y^{3} = x','1/(3*y^2)',pts,[paso('Deriva',"\\(3y^{2}\\,y' = 1\\)",'(y³)′ = 3y²·y′.')],[['3*y^2','Al revés.'],['1/(3*y)','Es y², no y.'],['1/3','Falta y².']],{tex:'\\dfrac{1}{3y^{2}}',F:'y^3-x'})}
      },
      3:{
        'pendiente-en-punto':()=>{const [x0,y0,R]=rng.elegir([[3,4,5],[4,3,5],[6,8,10],[5,12,13],[-3,4,5],[3,-4,5],[8,-6,10]]),v=-x0/y0;
          return numQ(`Pendiente de la tangente a \\(x^{2} + y^{2} = ${R*R}\\) en el punto \\((${x0}, ${y0})\\)`,v,numTxt(v),[paso('Derivada implícita',`\\(y' = -\\dfrac{x}{y}\\)`,'2x + 2y y′ = 0.'),final('Sustituye el punto',`\\(-\\dfrac{${x0}}{${y0}} = ${c(frac(-x0,y0))}\\)`,'Pendiente en ese punto.',numTxt(v))],[malNum(x0/y0,'Revisa el signo.'),malNum(-y0/x0,'Es −x/y.'),malNum(-x0,'Divide entre y.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>x0*x0+y0*y0===R*R)},
        'xy-mas-y':()=>{const k=rng.noCero(-10,10),pts=[[1,k/2],[3,k/4],[-3,-k/2]];return Q(`xy + y = ${k}`,'-y/(x + 1)',pts,[paso('Deriva',`\\(y + x\\,y' + y' = 0\\)`,'Producto en xy.'),paso('Saca factor y′',`\\(y'(x + 1) = -y\\)`,'Junta los términos con y′.')],[['y/(x + 1)','Revisa el signo.'],['-y/x','Falta el y′ del segundo término.'],['-(x + 1)/y','Al revés.']],{tex:'-\\dfrac{y}{x + 1}',F:`x*y+y-${k}`})},
        'mixta':()=>{const pts=[[1,1],[1,-2],[-1,2]];return Q('x^{2} + xy + y^{2} = 3','-(2*x + y)/(x + 2*y)',pts,[paso('Deriva',`\\(2x + y + x\\,y' + 2y\\,y' = 0\\)`,'xy con la regla del producto.'),paso('Agrupa',`\\(y'(x + 2y) = -(2x + y)\\)`,'Factor común y′.')],[['(2*x + y)/(x + 2*y)','Revisa el signo.'],['-2*x/(2*y)','Falta derivar el término xy.'],['-(x + 2*y)/(2*x + y)','Al revés.']],{tex:'-\\dfrac{2x + y}{x + 2y}',F:'x^2+x*y+y^2-3'})}
      },
      4:{
        'pendiente-elipse':()=>{const [a,b,x0,y0]=rng.elegir([[1,4,2,1],[4,1,1,2],[1,2,2,1],[2,1,1,2],[1,9,3,1],[9,1,1,3]]),K=a*x0*x0+b*y0*y0,v=-a*x0/(b*y0);
          return numQ(`Pendiente de la tangente a \\(${a===1?'':a}x^{2} + ${b===1?'':b}y^{2} = ${K}\\) en \\((${x0}, ${y0})\\)`,v,numTxt(v),[paso('Derivada implícita',`\\(y' = -\\dfrac{${a}x}{${b}y}\\)`,'Deriva y despeja.'),final('Sustituye',`\\(${c(frac(-a*x0,b*y0))}\\)`,'En el punto.',numTxt(v))],[malNum(-v,'Revisa el signo.'),malNum(-b*y0/(a*x0),'Al revés.'),malNum(-x0/y0,'Faltan los coeficientes.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>a*x0*x0+b*y0*y0===K)},
        'exponencial':()=>{const pts=[[1,0],[Math.E,1],[Math.E**2,2]];return Q('e^{y} = x','1/x',pts,[paso('Deriva',"\\(e^{y}\\,y' = 1\\)",'(e^y)′ = e^y·y′.')],[['x','Al revés.'],['exp(y)','Es 1/e^y = 1/x.'],['1','Falta dividir entre e^y.']],{tex:'\\dfrac{1}{e^{y}} = \\dfrac{1}{x}',F:'exp(y)-x'})},
        'xy-cuadrado':()=>{const k=rng.elegir([4,9,16,36]),s=Math.sqrt(k),pts=[[1,s],[s,1],[-1,-s]];return Q(`x^{2}y^{2} = ${k}`,'-y/x',pts,[paso('Deriva',`\\(2xy^{2} + x^{2}\\cdot 2y\\,y' = 0\\)`,'Producto.'),paso('Despeja',`\\(y' = -\\dfrac{2xy^{2}}{2x^{2}y}\\)`,'Simplifica.')],[['y/x','Revisa el signo.'],['-x/y','Al revés.'],['-2*x*y^2','Falta dividir.']],{tex:'-\\dfrac{y}{x}',F:`x^2*y^2-${k}`})}
      },
      5:{
        'seno-y':()=>{const pts=[[Math.sin(1),1],[0.5,Math.PI/6],[-0.5,-Math.PI/6]];return Q('\\sin y = x','1/cos(y)',pts,[paso('Deriva',"\\(\\cos y\\,y' = 1\\)",'(sen y)′ = cos y·y′.')],[['cos(y)','Al revés.'],['1/sin(y)','(sen y)′ = cos y.'],['-1/cos(y)','Sin signo menos.']],{tex:'\\dfrac{1}{\\cos y}',F:'sin(y)-x'})},
        'mixta-menos':()=>{const pts=[[1,-1],[-1,1],[1,2]];return Q('x^{2} - xy + y^{2} = 3','(y - 2*x)/(2*y - x)',pts,[paso('Deriva',"\\(2x - y - x\\,y' + 2y\\,y' = 0\\)",'xy con la regla del producto.'),paso('Agrupa',"\\(y'(2y - x) = y - 2x\\)",'Factor común y′.')],[['(2*x - y)/(2*y - x)','Revisa el signo.'],['-2*x/(2*y)','Falta derivar −xy.'],['(2*y - x)/(y - 2*x)','Al revés.']],{tex:'\\dfrac{y - 2x}{2y - x}',F:'x^2-x*y+y^2-3'})},
        'pendiente-xy':()=>{const k=rng.elegir([6,8,12,-6]),x0=rng.elegir([1,2,3,-2]),y0=k/x0,v=-y0/x0;return numQ(`Pendiente de la tangente a \\(xy = ${k}\\) en \\((${x0}, ${numTxt(y0)})\\)`,v,numTxt(v),[paso('y′ = −y/x',`\\(-\\dfrac{${numTxt(y0)}}{${x0}}\\)`,'Derivada implícita.'),final('Calcula',`\\(${c(numTxt(v))}\\)`,'En el punto.',numTxt(v))],[malNum(-v,'Revisa el signo.'),malNum(-x0/y0,'Al revés.'),malNum(y0,'Divide entre x.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(x0*y0,k))}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:"Derivación implícita: deriva los dos lados respecto a x; cada término con y se multiplica por y′ (cadena); luego despeja y′.",pista:"(y²)′ = 2y·y′ y (xy)′ = y + x·y′.",teclado:'mat',...x};
  }
};

/* ---------- Máximos y mínimos ---------- */
const listaRaices=(e,rs)=>{const l=lista(String(e).replace(/x\s*=\s*/gi,'').replace(/\s+y\s+/g,','));const a=[...new Set(l)].sort((p,q)=>p-q),b=[...new Set(rs)].sort((p,q)=>p-q);return a.length===b.length&&a.every((x,i)=>casi(x,b[i]))};
const maximos={
  titulo:'Máximos y mínimos',
  explicacion:'Los extremos locales están donde f′(x) = 0 (puntos críticos). Con la segunda derivada: f″ > 0 es mínimo y f″ < 0 es máximo. En un intervalo cerrado, el extremo absoluto está en un punto crítico o en un extremo del intervalo.',
  alternativa:'En la cima de una montaña o en el fondo de un valle, el camino está plano: pendiente 0. Por eso buscas f′ = 0. Para saber si es cima o valle, mira si la curva "sonríe" (f″ > 0, valle) o "está triste" (f″ < 0, cima).',
  referencia:'Ver: Stewart, Cálculo, sec. 4.1 y 4.3.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    // cúbica con puntos críticos p, q: f′ = 3a(x − p)(x − q) → f = a(x³ − (3/2)(p+q)x² + 3pq x) + d; p+q par para coeficientes enteros
    const cubica=()=>{let p,q;do{p=rng.entero(-4,3);q=p+2*rng.entero(1,3)}while(false);const a=rng.elegir([1,-1]),d=rng.entero(-5,5),cf=[d,3*a*p*q,-3*a*(p+q)/2,a];return {cf,p,q,a}};
    const P={
      1:{
        'vertice':()=>{const h=r(-6,6),a=rng.elegir([1,2,-1,-3]),cf=[rng.entero(-9,9),-2*a*h,a];return numQ(`¿En qué x tiene \\(f(x) = ${T(cf)}\\) su ${a>0?'mínimo':'máximo'}?`,h,`x = ${h}`,[paso('Deriva e iguala a 0',`\\(f'(x) = ${T(der(cf))} = 0\\)`,'Punto crítico.'),final('Despeja',`\\(x = ${c(h)}\\)`,a>0?'Parábola hacia arriba: mínimo.':'Hacia abajo: máximo.',`x = ${h}`)],[malNum(-h,'Revisa el signo al despejar.'),malNum(cf[0],'Ese es f(0).'),malNum(2*h,'Divide entre '+2*a+'.')].filter(e=>e.valor!==String(h)),()=>casi(dnum(fx(X(cf)),h),0,1e-6))},
        'crece-decrece':()=>{const cf=[rng.entero(-5,5),rng.entero(-6,6),r(-3,3)],a=rng.entero(-3,3),d=ev(der(cf),a);if(d===0)return P[1]['vertice']();const t=d>0?'crece':'decrece';
          return {enunciado:`En \\(x = ${a}\\), ¿la función \\(f(x) = ${T(cf)}\\) crece o decrece?`,respuesta:t,verificar:e=>new RegExp('^\\s*'+t,'i').test(limpiar(e))||(t==='crece'&&/creciente/i.test(e))||(t==='decrece'&&/decreciente/i.test(e)),
            pasos:[paso('Signo de la derivada',`\\(f'(${a}) = ${c(d)}\\)`,'f′ > 0 crece; f′ < 0 decrece.'),final('Interpreta',t,'Pendiente '+(d>0?'positiva':'negativa')+'.',t)],errores:[{valor:d>0?'decrece':'crece',si:e=>new RegExp('^\\s*'+(d>0?'decre':'crece'),'i').test(e),por:'Mira el signo de f′, no el de f.'}],comprobar:()=>(dnum(fx(X(cf)),a)>0)===(d>0)}},
        'critico-de-derivada':()=>{const a=r(-5,5),b=rng.entero(-12,12),v=-b/a;return numQ(`Si \\(f'(x) = ${lineal([[a,'x'],[b,'']])}\\), ¿en qué x hay un punto crítico?`,v,`x = ${numTxt(v)}`,[paso('f′(x) = 0',`\\(${lineal([[a,'x'],[b,'']])} = 0\\)`,'Pendiente cero.'),final('Despeja',`\\(x = ${c(frac(-b,a))}\\)`,'Ecuación lineal.',`x = ${numTxt(v)}`)],[malNum(b/a,'Revisa el signo.'),malNum(b,'Despeja x.'),malNum(-a/b||1,'Al revés.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(a*v+b,0))}
      },
      2:{
        'criticos-cubica':()=>{const s=rng.entero(1,5),k=rng.elegir([1,2,-1]),cf=[rng.entero(-5,5),-3*k*s*s,0,k];return {enunciado:`Puntos críticos de \\(f(x) = ${T(cf)}\\) (escribe los valores de x separados por coma).`,respuesta:`x = ${-s}, x = ${s}`,verificar:e=>listaRaices(e,[-s,s]),
          pasos:[paso('Deriva',`\\(f'(x) = ${T(der(cf))}\\)`,'Regla de la potencia.'),final('Iguala a 0',`\\(${3*k}(x^{2} - ${s*s}) = 0 \\Rightarrow x = \\pm ${c(s)}\\)`,'Dos puntos críticos.',`x = ${-s}, x = ${s}`)],
          errores:[{valor:`x = ${s}`,si:e=>listaRaices(e,[s]),por:'También x = −'+s+'.'},{valor:`x = ${s*s}`,si:e=>listaRaices(e,[s*s]),por:'Falta la raíz cuadrada.'},{valor:'x = 0',si:e=>listaRaices(e,[0]),por:'f′(0) no es 0 aquí.'}],comprobar:()=>[-s,s].every(x=>casi(ev(der(cf),x),0))}},
        'max-o-min':()=>{const {cf,p,q,a}=cubica(),x0=rng.prob(.5)?p:q,f2=ev(der(der(cf)),x0),t=f2>0?'mínimo':'máximo';
          return {enunciado:`\\(x = ${x0}\\) es punto crítico de \\(f(x) = ${T(cf.map(v=>Math.round(v)))}\\). ¿Es máximo o mínimo local?`,respuesta:t,verificar:e=>new RegExp('^\\s*'+t.slice(0,3),'i').test(limpiar(e).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace('max','máx').replace('min','mín'))||new RegExp('^\\s*'+t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').slice(0,3),'i').test(limpiar(e).normalize('NFD').replace(/[\u0300-\u036f]/g,'')),
            pasos:[paso('Segunda derivada',`\\(f''(x) = ${T(der(der(cf)))}\\)`,'Deriva dos veces.'),final('Evalúa y mira el signo',`\\(f''(${x0}) = ${c(f2)}\\)`,'f″ > 0 mínimo; f″ < 0 máximo.',t)],
            errores:[{valor:f2>0?'máximo':'mínimo',si:e=>new RegExp('^\\s*'+(f2>0?'max':'min'),'i').test(limpiar(e).normalize('NFD').replace(/[\u0300-\u036f]/g,'')),por:'f″ positiva es mínimo (la curva sonríe).'}],comprobar:()=>Number.isInteger(cf[2])&&casi(ev(der(cf),x0),0)}},
        'valor-maximo':()=>{const h=r(-5,5),k=rng.entero(-9,9),a=rng.elegir([-1,-2,-3]),cf=[a*h*h+k,-2*a*h,a];return numQ(`¿Cuál es el valor máximo de \\(f(x) = ${T(cf)}\\)?`,k,String(k),[paso('Punto crítico',`\\(f'(x) = 0 \\Rightarrow x = ${c(h)}\\)`,'Vértice.'),final('Evalúa',`\\(f(${h}) = ${c(k)}\\)`,'El máximo es el valor de f, no el x.',String(k))],[malNum(h,'Ese es el x del máximo.'),malNum(cf[0],'Ese es f(0).'),malNum(-k,'Revisa signos.')].filter(e=>e.valor!==String(k)),()=>ev(cf,h)===k&&ev(cf,h+1)<k)}
      },
      3:{
        'criticos-cubica-general':()=>{const {cf,p,q}=cubica();if(!Number.isInteger(cf[2]))return P[2]['criticos-cubica']();return {enunciado:`Puntos críticos de \\(f(x) = ${T(cf)}\\) (valores de x separados por coma).`,respuesta:`x = ${p}, x = ${q}`,verificar:e=>listaRaices(e,[p,q]),
          pasos:[paso('Deriva',`\\(f'(x) = ${T(der(cf))}\\)`,'Potencias.'),paso('Factoriza',`\\(${3*cf[3]}(x ${sg(-p)})(x ${sg(-q)}) = 0\\)`,'Trinomio.'),final('Raíces',`\\(x = ${c(p)},\\ x = ${c(q)}\\)`,'Puntos críticos.',`x = ${p}, x = ${q}`)],
          errores:[{valor:`x = ${-p}, x = ${-q}`,si:e=>listaRaices(e,[-p,-q]),por:'Signos al revés.'},{valor:`x = ${p}`,si:e=>listaRaices(e,[p]),por:'Hay dos.'},{valor:`x = ${(p+q)/2}`,si:e=>listaRaices(e,[(p+q)/2]),por:'Ese es el punto de inflexión.'}],comprobar:()=>[p,q].every(x=>casi(ev(der(cf),x),0))}},
        'absoluto-intervalo':()=>{const h=r(-3,3),a=rng.elegir([1,-1]),cf=[rng.entero(-5,5),-2*a*h,a],L=h-rng.entero(1,3),R=h+rng.entero(1,4),vals=[ev(cf,L),ev(cf,R),ev(cf,h)],mx=Math.max(...vals);
          return numQ(`Valor máximo absoluto de \\(f(x) = ${T(cf)}\\) en \\([${L}, ${R}]\\)`,mx,String(mx),[paso('Puntos críticos dentro del intervalo',`\\(x = ${h}\\)`,'f′ = 0.'),paso('Evalúa críticos y extremos',`\\(f(${L}) = ${vals[0]},\\ f(${R}) = ${vals[1]},\\ f(${h}) = ${vals[2]}\\)`,'Candidatos.'),final('El mayor',`\\(${c(mx)}\\)`,'Máximo absoluto.',String(mx))],[malNum(Math.min(...vals),'Ese es el mínimo.'),malNum(vals[2],'Revisa también los extremos del intervalo.'),malNum(R,'Es el valor de f, no de x.')].filter(e=>e.valor!==String(mx)),()=>{let m=-Infinity;for(let t=L;t<=R+1e-9;t+=0.01)m=Math.max(m,ev(cf,t));return Math.abs(m-mx)<1e-6})},
        'inflexion':()=>{const {cf,p,q}=cubica();if(!Number.isInteger(cf[2]))return P[3]['absoluto-intervalo']();const xi=(p+q)/2;return numQ(`¿En qué x tiene \\(f(x) = ${T(cf)}\\) un punto de inflexión?`,xi,`x = ${xi}`,[paso('Segunda derivada',`\\(f''(x) = ${T(der(der(cf)))}\\)`,'Deriva dos veces.'),final('f″ = 0',`\\(x = ${c(xi)}\\)`,'Cambia la concavidad.',`x = ${xi}`)],[malNum(p,'Ese es un punto crítico (f′ = 0).'),malNum(-xi,'Revisa el signo.'),malNum(0,'Iguala f″ a 0.')].filter(e=>e.valor!==String(xi)),()=>casi(ev(der(der(cf)),xi),0))}
      },
      4:{
        'absoluto-cubica':()=>{const {cf,p,q}=cubica();if(!Number.isInteger(cf[2]))return P[3]['absoluto-intervalo']();const L=p-1,R=q+1,cand=[L,p,q,R].map(x=>ev(cf,x)),mx=Math.max(...cand);
          return numQ(`Valor máximo absoluto de \\(f(x) = ${T(cf)}\\) en \\([${L}, ${R}]\\)`,mx,String(mx),[paso('Críticos',`\\(x = ${p},\\ x = ${q}\\)`,'f′ = 0.'),paso('Evalúa',`\\(${[L,p,q,R].map((x,i)=>`f(${x}) = ${cand[i]}`).join(',\\ ')}\\)`,'Críticos y extremos.'),final('El mayor',`\\(${c(mx)}\\)`,'Absoluto.',String(mx))],[malNum(Math.min(...cand),'Ese es el mínimo.'),malNum(Math.max(ev(cf,p),ev(cf,q)),'Revisa también los extremos.'),malNum(R,'Es el valor de f.')].filter(e=>e.valor!==String(mx)),()=>{let m=-Infinity;for(let t=L;t<=R+1e-9;t+=0.01)m=Math.max(m,ev(cf,t));return Math.abs(m-mx)<1e-6})},
        'segunda-derivada':()=>{const cf=[rng.entero(-5,5),rng.entero(-5,5),rng.entero(-4,4),r(-3,3)],a=rng.entero(-3,3),v=ev(der(der(cf)),a);return numQ(`Calcula \\(f''(${a})\\) para \\(f(x) = ${T(cf)}\\)`,v,String(v),[paso('Primera',`\\(${T(der(cf))}\\)`,'Deriva.'),paso('Segunda',`\\(${T(der(der(cf)))}\\)`,'Otra vez.'),final('Evalúa',`\\(${c(v)}\\)`,'Concavidad en ese punto.',String(v))],[malNum(ev(der(cf),a),'Esa es f′.'),malNum(ev(cf,a),'Esa es f.'),malNum(-v,'Revisa signos.')].filter(e=>e.valor!==String(v)),()=>casi((ev(cf,a+1e-3)-2*ev(cf,a)+ev(cf,a-1e-3))/1e-6,v,1e-3))},
        'max-o-min':()=>P[2]['max-o-min']()
      },
      5:{
        'cuartica':()=>{const s=rng.entero(1,3),cf=[rng.entero(-5,5),0,-2*s*s,0,1];return {enunciado:`Puntos críticos de \\(f(x) = ${T(cf)}\\) (valores de x separados por coma).`,respuesta:`x = ${-s}, x = 0, x = ${s}`,verificar:e=>listaRaices(e,[-s,0,s]),
          pasos:[paso('Deriva',`\\(f'(x) = ${T(der(cf))}\\)`,'Potencias.'),final('Factoriza',`\\(4x(x^{2} - ${s*s}) = 0 \\Rightarrow x = 0,\\ \\pm ${c(s)}\\)`,'Factor común y diferencia de cuadrados.',`x = ${-s}, x = 0, x = ${s}`)],
          errores:[{valor:`x = ${-s}, x = ${s}`,si:e=>listaRaices(e,[-s,s]),por:'Falta x = 0 (el factor 4x).'},{valor:'x = 0',si:e=>listaRaices(e,[0]),por:'Faltan ±'+s+'.'},{valor:`x = ${s*s}`,si:e=>listaRaices(e,[s*s]),por:'Saca raíz.'}],comprobar:()=>[-s,0,s].every(x=>casi(ev(der(cf),x),0))}},
        'clasificar-cuartica':()=>{const s=rng.entero(1,3),cf=[rng.entero(-5,5),0,-2*s*s,0,1],x0=rng.elegir([0,s,-s]),t=x0===0?'máximo':'mínimo';return {enunciado:`\\(x = ${x0}\\) es punto crítico de \\(f(x) = ${T(cf)}\\). ¿Es máximo o mínimo local?`,respuesta:t,verificar:e=>new RegExp('^\\s*'+(t==='máximo'?'max':'min'),'i').test(limpiar(e).normalize('NFD').replace(/[\u0300-\u036f]/g,'')),
          pasos:[paso('f″',`\\(${T(der(der(cf)))}\\)`,'Segunda derivada.'),final('Signo en el punto',`\\(f''(${x0}) = ${c(ev(der(der(cf)),x0))}\\)`,'Negativa: máximo; positiva: mínimo.',t)],errores:[{valor:t==='máximo'?'mínimo':'máximo',si:e=>new RegExp('^\\s*'+(t==='máximo'?'min':'max'),'i').test(limpiar(e).normalize('NFD').replace(/[\u0300-\u036f]/g,'')),por:'Revisa el signo de f″.'}],comprobar:()=>(ev(der(der(cf)),x0)<0)===(t==='máximo')}},
        'inflexion-cuartica':()=>{const s=rng.elegir([3,6,12]),cf=[0,0,-s,0,1],xi=Math.sqrt(s/6),txt=Number.isInteger(xi)?String(xi):`√${s/6}`;return {enunciado:`Puntos de inflexión de \\(f(x) = ${T(cf)}\\) (valores de x; puedes usar √).`,respuesta:`x = -${txt}, x = ${txt}`,verificar:e=>{const l=lista(String(e).replace(/x\s*=\s*/gi,''));return l.length===2&&listaRaices(l.join(','),[-xi,xi])},
          pasos:[paso('f″',`\\(12x^{2} - ${2*s}\\)`,'Segunda derivada.'),final('f″ = 0',`\\(x = \\pm\\sqrt{${frac(2*s,12)}}\\)`,'Cambia la concavidad.',`x = -${txt}, x = ${txt}`)],errores:[{valor:`x = ${s/6}`,si:e=>listaRaices(e,[s/6]),por:'Falta la raíz y el ±.'},{valor:`x = ${txt}`,si:e=>listaRaices(e,[xi]),por:'También el negativo.'}],comprobar:()=>casi(12*xi*xi-2*s,0)}}
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:"Extremos locales donde f′ = 0; f″ > 0 mínimo, f″ < 0 máximo. Absolutos en un intervalo cerrado: compara críticos y extremos.",pista:'Deriva, iguala a cero y usa f″ para clasificar.',teclado:'mat',...x};
  }
};

/* ---------- Optimización ---------- */
const optimizacion={
  titulo:'Optimización',
  explicacion:'1) Escribe lo que quieres maximizar o minimizar como función de UNA variable (usa la restricción para eliminar la otra). 2) Deriva e iguala a 0. 3) Comprueba que es máximo o mínimo y responde lo que te piden.',
  alternativa:'Es buscar la cima de una montaña, pero la montaña la tienes que dibujar tú: primero conviertes el problema en una función (área según el ancho, por ejemplo). Después la cima está donde la pendiente es 0.',
  referencia:'Ver: Stewart, Cálculo, sec. 4.7.',
  profundidad:n=>n===1?'basico':'aplicacion',
  generar(n,rng){
    const q=(enun,v,txt,pasos,errores,comprobar,extra={})=>numQ(enun,v,txt,pasos,errores,comprobar,{...extra,ver:extra.ver||(e=>{const x=num(String(e).replace(/[a-z²³]+$/i,'').replace(/^\s*[a-z]\s*=\s*/i,'').trim());return Number.isFinite(x)&&Math.abs(x-v)<=1e-6*Math.max(1,Math.abs(v))})});
    const P={
      1:{
        'suma-producto':()=>{const S=2*rng.entero(5,30),v=S*S/4;return q(`Dos números suman ${S}. ¿Cuál es el mayor producto posible?`,v,String(v),[paso('Producto en una variable',`\\(P(x) = x(${S} - x)\\)`,'El otro número es '+S+' − x.'),paso('P′ = 0',`\\(${S} - 2x = 0 \\Rightarrow x = ${S/2}\\)`,'Los dos números son iguales.'),final('Producto máximo',`\\(${S/2}\\cdot${S/2} = ${c(v)}\\)`,'Es máximo (P″ = −2 < 0).',String(v))],[malNum(S/2,'Ese es cada número; piden el producto.'),malNum(S,'Esa es la suma.'),malNum(S*S/2,'Es (S/2)².')],()=>{let m=0;for(let x=0;x<=S;x+=0.5)m=Math.max(m,x*(S-x));return m===v})},
        'perimetro-area':()=>{const P_=4*rng.entero(5,40),v=(P_/4)**2;return q(`Con ${P_} m de cerca se quiere un rectángulo de área máxima. ¿Cuál es esa área (m²)?`,v,String(v),[paso('Área en una variable',`\\(A(x) = x\\left(${P_/2} - x\\right)\\)`,'Largo + ancho = medio perímetro.'),paso('A′ = 0',`\\(x = ${P_/4}\\)`,'Es un cuadrado.'),final('Área',`\\(${P_/4}^{2} = ${c(v)}\\)`,'Máxima.',String(v))],[malNum(P_/4,'Ese es el lado.'),malNum((P_/2)**2,'Usa medio perímetro.'),malNum(P_*P_/8,'El rectángulo óptimo es un cuadrado.')],()=>{const L=P_/2;return L*L/4===v})},
        'rio':()=>{const L=4*rng.entero(10,60),v=L*L/8;return q(`Un terreno junto a un río se cerca por 3 lados (el río es el cuarto) con ${L} m de malla. ¿Área máxima (m²)?`,v,String(v),[paso('Área',`\\(A(x) = x(${L} - 2x)\\)`,'Dos lados de ancho x y el largo de lo que sobra.'),paso('A′ = 0',`\\(${L} - 4x = 0 \\Rightarrow x = ${L/4}\\)`,'Derivada.'),final('Área',`\\(${L/4}\\cdot${L/2} = ${c(v)}\\)`,'Máxima.',String(v))],[malNum((L/4)**2,'No es cuadrado: hay solo 3 lados.'),malNum((L/3)**2,'Plantea A(x) = x(L − 2x).'),malNum(L/4,'Ese es el ancho.')],()=>{let m=0;for(let x=0;x<=L/2;x+=0.25)m=Math.max(m,x*(L-2*x));return Math.abs(m-v)<1e-9})}
      },
      2:{
        'caja':()=>{const s=6*rng.entero(2,10),x=s/6,V=x*(s-2*x)**2;return q(`De una lámina cuadrada de ${s} cm se cortan cuadrados de lado x en las esquinas para hacer una caja sin tapa. ¿Qué x da el volumen máximo (cm)?`,x,String(x),[paso('Volumen',`\\(V(x) = x(${s} - 2x)^{2}\\)`,'Altura x, base (s − 2x)².'),paso('V′ = 0',`\\((${s} - 2x)(${s} - 6x) = 0\\)`,'Producto y cadena.'),final('La solución con sentido',`\\(x = ${c(x)}\\)`,'x = '+s/2+' daría una caja sin base.',String(x))],[malNum(s/2,'Con x = '+s/2+' no queda base.'),malNum(s/4,'Deriva V(x) = x(s − 2x)².'),malNum(V,'Ese es el volumen; piden x.')],()=>{let mx=0,arg=0;for(let t=0;t<=s/2;t+=0.01){const v=t*(s-2*t)**2;if(v>mx){mx=v;arg=t}}return Math.abs(arg-x)<0.02})},
        'minimo-suma':()=>{const k=rng.elegir([4,9,16,25,36,49]),v=2*Math.sqrt(k);return q(`¿Cuál es el valor mínimo de \\(f(x) = x + \\dfrac{${k}}{x}\\) para \\(x > 0\\)?`,v,String(v),[paso('Deriva',`\\(f'(x) = 1 - \\dfrac{${k}}{x^{2}}\\)`,'Regla de la potencia.'),paso('f′ = 0',`\\(x = ${Math.sqrt(k)}\\)`,'x > 0.'),final('Evalúa',`\\(f(${Math.sqrt(k)}) = ${c(v)}\\)`,'Mínimo.',String(v))],[malNum(Math.sqrt(k),'Ese es el x del mínimo.'),malNum(k,'Evalúa f en el crítico.'),malNum(k+1,'Ese es f(1).')],()=>{let m=Infinity;for(let x=0.1;x<20;x+=0.01)m=Math.min(m,x+k/x);return Math.abs(m-v)<1e-3})},
        'producto-restriccion':()=>{const S=4*rng.entero(3,20),x=S/2,y=S/4,v=x*y;return q(`Si \\(x + 2y = ${S}\\), ¿cuál es el máximo de \\(xy\\)?`,v,String(v),[paso('Despeja x',`\\(x = ${S} - 2y \\Rightarrow P(y) = (${S} - 2y)y\\)`,'Una variable.'),paso('P′ = 0',`\\(${S} - 4y = 0 \\Rightarrow y = ${y}\\)`,'Derivada.'),final('Producto',`\\(x = ${x},\\ xy = ${c(v)}\\)`,'Máximo.',String(v))],[malNum(S*S/4,'Usa la restricción con el 2y.'),malNum(y,'Ese es y.'),malNum(x,'Ese es x.')],()=>{let m=0;for(let t=0;t<=S/2;t+=0.25)m=Math.max(m,(S-2*t)*t);return m===v})}
      },
      3:{
        'lata':()=>{const V=rng.elegir([2,16,54,128]),r=Math.cbrt(V/2),h=2*r;return q(`Una lata cilíndrica (con tapas) debe contener \\(${V}\\pi\\) cm³. ¿Qué radio usa la menor cantidad de material (cm)?`,r,String(r),[paso('Área en función de r',`\\(A(r) = 2\\pi r^{2} + \\dfrac{2\\cdot${V}\\pi}{r}\\)`,'h = V/(πr²).'),paso('A′ = 0',`\\(4\\pi r - \\dfrac{${2*V}\\pi}{r^{2}} = 0 \\Rightarrow r^{3} = ${V/2}\\)`,'Despeja.'),final('Radio',`\\(r = ${c(r)}\\)`,'Altura = diámetro.',String(r))],[malNum(h,'Esa es la altura.'),malNum(+Math.sqrt(V/2).toFixed(4),'Es raíz cúbica.'),malNum(V/2,'Saca la raíz cúbica.')],()=>{const A=t=>2*Math.PI*t*t+2*V*Math.PI/t;return A(r)<=A(r*1.01)&&A(r)<=A(r*0.99)})},
        'caja':()=>P[2]['caja'](),
        'ganancia':()=>{const a=rng.entero(1,4),b=rng.entero(20,80)*a*2,cf=rng.entero(50,300),q0=b/(2*a),G=t=>-a*t*t+b*t-cf;return q(`La ganancia de vender q artículos es \\(G(q) = -${a===1?'':a}q^{2} + ${b}q - ${cf}\\). ¿Cuántos artículos maximizan la ganancia?`,q0,String(q0),[paso('G′ = 0',`\\(-${2*a}q + ${b} = 0\\)`,'Derivada.'),final('Despeja',`\\(q = ${c(q0)}\\)`,'G″ < 0: máximo.',String(q0))],[malNum(G(q0),'Esa es la ganancia máxima; piden q.'),malNum(b/a,'Es b/(2a).'),malNum(cf,'Ese es el costo fijo.')],()=>G(q0)>=G(q0+1)&&G(q0)>=G(q0-1))}
      },
      4:{
        'ganancia-maxima':()=>{const a=rng.entero(1,4),b=rng.entero(20,80)*a*2,cf=rng.entero(50,300),q0=b/(2*a),G=t=>-a*t*t+b*t-cf,v=G(q0);return q(`Con \\(G(q) = -${a===1?'':a}q^{2} + ${b}q - ${cf}\\), ¿cuál es la ganancia máxima?`,v,String(v),[paso('q óptimo',`\\(q = ${q0}\\)`,'G′ = 0.'),final('Evalúa',`\\(G(${q0}) = ${c(v)}\\)`,'Máxima.',String(v))],[malNum(q0,'Ese es q.'),malNum(v+cf,'Resta el costo fijo.'),malNum(b*q0,'Evalúa toda la función.')],()=>v===G(q0))},
        'distancia-punto-recta':()=>{const m=rng.elegir([1,2,-1,3]),P0=[rng.entero(-5,5),rng.entero(-5,5)];// punto de y = mx más cercano a P0: x = (P0x + m P0y)/(1 + m²)
          const x=(P0[0]+m*P0[1])/(1+m*m);return q(`¿Qué punto de la recta \\(y = ${m===1?'':m===-1?'-':m}x\\) está más cerca de \\((${P0[0]}, ${P0[1]})\\)? Escribe su coordenada x.`,x,numTxt(x),[paso('Distancia² en función de x',`\\(D(x) = (x - ${par(P0[0])})^{2} + (${m}x - ${par(P0[1])})^{2}\\)`,'Minimizar D² es lo mismo que D.'),paso("D′ = 0",`\\(2(x - ${par(P0[0])}) + 2\\cdot${m}(${m}x - ${par(P0[1])}) = 0\\)`,'Derivada.'),final('Despeja',`\\(x = ${c(frac(P0[0]+m*P0[1],1+m*m))}\\)`,'El más cercano.',numTxt(x))],[malNum(P0[0],'No es el x del punto.'),malNum((P0[0]+P0[1])/2,'Plantea la distancia.'),malNum(-x,'Revisa signos.')].filter(e=>Math.abs(num(e.valor)-x)>1e-9),()=>{const D=t=>(t-P0[0])**2+(m*t-P0[1])**2;return D(x)<=D(x+0.01)&&D(x)<=D(x-0.01)})},
        'lata':()=>P[3]['lata']()
      },
      5:{
        'ventana':()=>{const P_=rng.elegir([8,12,16,20]);// rectángulo + semicírculo: máximo de luz x = P/(4 + π) (radio)
          const r=P_/(4+Math.PI);return q(`Una ventana es un rectángulo coronado por un semicírculo; su perímetro total es ${P_} m. ¿Qué radio del semicírculo deja pasar más luz (máxima área)? (2 decimales)`,r,r.toFixed(2),[paso('Perímetro',`\\(2r + 2h + \\pi r = ${P_}\\)`,'Base 2r, dos lados h y el arco.'),paso('Área en función de r',`\\(A = 2rh + \\tfrac{1}{2}\\pi r^{2}\\)`,'Sustituye h.'),final("A′ = 0",`\\(r = \\dfrac{${P_}}{4 + \\pi} \\approx ${c(r.toFixed(2))}\\)`,'Máximo.',r.toFixed(2))],[malNum(+(P_/4).toFixed(2),'Incluye el semicírculo en el perímetro.'),malNum(+(P_/(2+Math.PI)).toFixed(2),'Revisa el área.'),malNum(+(2*r).toFixed(2),'Ese es el ancho (2r).')],()=>{const A=t=>{const h=(P_-2*t-Math.PI*t)/2;return 2*t*h+Math.PI*t*t/2};return A(r)>=A(r+0.01)&&A(r)>=A(r-0.01)},{ver:e=>Math.abs(num(e)-r)<=0.006})},
        'ganancia-maxima':()=>P[4]['ganancia-maxima'](),
        'distancia-punto-recta':()=>P[4]['distancia-punto-recta']()
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Optimización: función de una variable (usa la restricción), deriva, iguala a 0 y comprueba que sea máximo o mínimo.',pista:'¿Qué quieres maximizar? Escríbelo con una sola variable.',teclado:'mat',...x};
  }
};

/* ---------- Razón de cambio ---------- */
const razon={
  titulo:'Razón de cambio',
  explicacion:'La derivada mide qué tan rápido cambia una cantidad. Velocidad = s′(t), aceleración = s″(t), costo marginal = C′(q). En razones relacionadas, deriva la relación entre las cantidades respecto al tiempo (regla de la cadena) y despeja la razón que buscas.',
  alternativa:'Si inflas un globo, el radio y el volumen crecen a la vez pero a ritmos distintos. La fórmula V = (4/3)πr³ los conecta; derivarla respecto al tiempo conecta sus ritmos: dV/dt = 4πr²·dr/dt.',
  referencia:'Ver: Stewart, Cálculo, sec. 3.7 y 3.9.',
  profundidad:n=>n===1?'basico':'aplicacion',
  generar(n,rng){
    const r=(a,b)=>rng.noCero(a,b);
    const conPi=v=>e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-v)<=1e-3*Math.max(1,Math.abs(v))};
    const P={
      1:{
        'velocidad':()=>{const cf=[rng.entero(0,9),rng.entero(-5,10),rng.entero(-3,3),r(-2,2)],t=rng.entero(0,4),v=ev(der(cf),t);return numQ(`La posición es \\(s(t) = ${T(cf).replace(/x/g,'t')}\\) (m). ¿Cuál es la velocidad en \\(t = ${t}\\) s?`,v,String(v),[paso('v(t) = s′(t)',`\\(${T(der(cf)).replace(/x/g,'t')}\\)`,'Deriva la posición.'),final('Evalúa',`\\(v(${t}) = ${c(v)}\\)`,'m/s.',String(v))],[malNum(ev(cf,t),'Esa es la posición.'),malNum(ev(der(der(cf)),t),'Esa es la aceleración.'),malNum(-v,'Revisa signos.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(X(cf)),t),v,1e-6))},
        'costo-marginal':()=>{const a=rng.entero(1,5)/100,b=rng.entero(5,40),cf0=rng.entero(100,999),q=rng.entero(10,200),v=+(2*a*q+b).toFixed(2);return numQ(`El costo de producir q unidades es \\(C(q) = ${a}q^{2} + ${b}q + ${cf0}\\). ¿Cuál es el costo marginal en \\(q = ${q}\\)?`,v,String(v),[paso("C′(q)",`\\(${2*a}q + ${b}\\)`,'Derivada.'),final('Evalúa',`\\(C'(${q}) = ${c(v)}\\)`,'Costo aproximado de una unidad más.',String(v))],[malNum(+(a*q*q+b*q+cf0).toFixed(2),'Ese es el costo total.'),malNum(+(a*q+b).toFixed(2),'(q²)′ = 2q.'),malNum(b,'Falta el término 2aq.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(`${a}*x^2+${b}*x+${cf0}`),q),v,1e-4))},
        'tasa-promedio':()=>{const cf=[rng.entero(-5,5),rng.entero(-4,6),r(-2,3)],a=rng.entero(0,3),b=a+rng.entero(1,4),v=(ev(cf,b)-ev(cf,a))/(b-a);return numQ(`Tasa de cambio promedio de \\(f(x) = ${T(cf)}\\) entre \\(x = ${a}\\) y \\(x = ${b}\\)`,v,numTxt(v),[paso('f en los extremos',`\\(f(${a}) = ${ev(cf,a)},\\ f(${b}) = ${ev(cf,b)}\\)`,'Evalúa.'),final('Δf/Δx',`\\(${c(numTxt(v))}\\)`,'Pendiente de la secante.',numTxt(v))],[malNum(ev(cf,b)-ev(cf,a),'Divide entre '+(b-a)+'.'),malNum(ev(der(cf),a),'Esa es la instantánea.'),malNum(-v,'Revisa el orden de la resta.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>casi(v*(b-a),ev(cf,b)-ev(cf,a)))}
      },
      2:{
        'aceleracion':()=>{const cf=[rng.entero(0,9),rng.entero(-5,10),rng.entero(-3,3),r(-2,2)],t=rng.entero(0,4),v=ev(der(der(cf)),t);return numQ(`La posición es \\(s(t) = ${T(cf).replace(/x/g,'t')}\\) (m). ¿Cuál es la aceleración en \\(t = ${t}\\) s?`,v,String(v),[paso('a(t) = s″(t)',`\\(${T(der(der(cf))).replace(/x/g,'t')}\\)`,'Deriva dos veces.'),final('Evalúa',`\\(${c(v)}\\)`,'m/s².',String(v))],[malNum(ev(der(cf),t),'Esa es la velocidad.'),malNum(ev(cf,t),'Esa es la posición.'),malNum(-v,'Revisa signos.')].filter(e=>e.valor!==String(v)),()=>casi((ev(cf,t+1e-3)-2*ev(cf,t)+ev(cf,t-1e-3))/1e-6,v,1e-3))},
        'circulo':()=>{const rr=rng.entero(2,15),dr=rng.entero(1,5),v=2*rr*dr;return numQ(`Una mancha circular crece: el radio aumenta ${dr} cm/s. ¿Qué tan rápido crece el área cuando r = ${rr} cm? (en cm²/s; escribe el número que multiplica a π)`,v,`${v}π`,[paso('A = πr²; deriva respecto a t',`\\(\\dfrac{dA}{dt} = 2\\pi r\\dfrac{dr}{dt}\\)`,'Regla de la cadena.'),final('Sustituye',`\\(2\\pi\\cdot${rr}\\cdot${dr} = ${c(v)}\\pi\\)`,'cm²/s.',`${v}π`)],[malNum(rr*rr,'Ese sería el área entre π.'),malNum(rr*dr,'Falta el 2.'),malNum(2*rr,'Multiplica por dr/dt.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(`pi*(${rr}+${dr}*x)^2`),0),v*Math.PI,1e-6),{ver:e=>{const s=String(e).replace(/π|pi/gi,'').trim();return igualNum(s,v)||conPi(v*Math.PI)(e)}})},
        'globo':()=>{const rr=rng.entero(1,10),dr=rng.entero(1,4),v=4*rr*rr*dr;return numQ(`Se infla un globo esférico: el radio crece ${dr} cm/s. ¿Qué tan rápido crece el volumen cuando r = ${rr} cm? (escribe el número que multiplica a π)`,v,`${v}π`,[paso('V = (4/3)πr³; deriva',`\\(\\dfrac{dV}{dt} = 4\\pi r^{2}\\dfrac{dr}{dt}\\)`,'Cadena.'),final('Sustituye',`\\(4\\pi\\cdot${rr*rr}\\cdot${dr} = ${c(v)}\\pi\\)`,'cm³/s.',`${v}π`)],[malNum(4*rr*rr,'Multiplica por dr/dt.'),malNum(4*rr**3*dr/3,'Deriva el volumen.'),malNum(2*rr*dr,'Esa sería la de un círculo.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(`4/3*pi*(${rr}+${dr}*x)^3`),0),v*Math.PI,1e-5),{ver:e=>{const s=String(e).replace(/π|pi/gi,'').trim();return igualNum(s,v)||conPi(v*Math.PI)(e)}})}
      },
      3:{
        'escalera':()=>{const [x,y,L]=rng.elegir([[3,4,5],[6,8,10],[5,12,13],[8,6,10],[12,5,13]]),dx=rng.entero(1,4),v=-x*dx/y;return numQ(`Una escalera de ${L} m está apoyada en una pared. La base se aleja a ${dx} m/s. ¿Con qué rapidez baja la parte de arriba cuando la base está a ${x} m de la pared? (m/s, negativo si baja)`,v,numTxt(v),[paso('Pitágoras',`\\(x^{2} + y^{2} = ${L*L}\\)`,'La escalera no cambia de largo.'),paso('Deriva respecto a t',`\\(2x\\dfrac{dx}{dt} + 2y\\dfrac{dy}{dt} = 0\\)`,'Cadena.'),final('Sustituye (y = '+y+')',`\\(\\dfrac{dy}{dt} = -\\dfrac{${x}\\cdot${dx}}{${y}} = ${c(numTxt(v))}\\)`,'Negativa: baja.',numTxt(v))],[malNum(-v,'Lleva signo menos: la parte de arriba baja.'),malNum(-y*dx/x,'Es −x·(dx/dt)/y.'),malNum(-dx,'No baja a la misma velocidad.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),()=>{const h=1e-6,X1=x+dx*h,Y1=Math.sqrt(L*L-X1*X1);return Math.abs((Y1-y)/h-v)<1e-4})},
        'cubo':()=>{const s=rng.entero(2,10),ds=rng.entero(1,4),v=3*s*s*ds;return numQ(`Un cubo de hielo se derrite: su lado disminuye ${ds} mm/min. ¿Qué tan rápido disminuye su volumen cuando el lado mide ${s} mm? (mm³/min, como número positivo)`,v,String(v),[paso('V = s³',`\\(\\dfrac{dV}{dt} = 3s^{2}\\dfrac{ds}{dt}\\)`,'Cadena.'),final('Sustituye',`\\(3\\cdot${s*s}\\cdot${ds} = ${c(v)}\\)`,'mm³/min.',String(v))],[malNum(s**3,'Ese es el volumen.'),malNum(3*s*s,'Multiplica por ds/dt.'),malNum(s*s*ds,'Falta el 3.')].filter(e=>e.valor!==String(v)),()=>casi(dnum(fx(`(${s}+${ds}*x)^3`),0),v,1e-5),{ver:e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(Math.abs(x)-v)<1e-9}})},
        'globo':()=>P[2]['globo']()
      },
      4:{
        'autos':()=>{const [x,y,z]=rng.elegir([[3,4,5],[6,8,10],[5,12,13],[9,12,15]]),vx=rng.entero(20,60),vy=rng.entero(20,60),v=(x*vx+y*vy)/z;return numQ(`Dos autos salen del mismo cruce: uno hacia el este a ${vx} km/h y otro hacia el norte a ${vy} km/h. Cuando están a ${x} km y ${y} km del cruce, ¿qué tan rápido crece la distancia entre ellos (km/h, 2 decimales)?`,v,v.toFixed(2),[paso('Pitágoras',`\\(z^{2} = x^{2} + y^{2},\\ z = ${z}\\)`,'Distancia entre ellos.'),paso('Deriva',`\\(z\\dfrac{dz}{dt} = x\\dfrac{dx}{dt} + y\\dfrac{dy}{dt}\\)`,'Cadena (los 2 se cancelan).'),final('Sustituye',`\\(\\dfrac{${x}\\cdot${vx} + ${y}\\cdot${vy}}{${z}} \\approx ${c(v.toFixed(2))}\\)`,'km/h.',v.toFixed(2))],[malNum(vx+vy,'No se suman las velocidades.'),malNum(Math.hypot(vx,vy),'Eso supondría salir del mismo punto con esas velocidades siempre (vale solo si x/y = vx/vy).'),malNum(x*vx+y*vy,'Divide entre z.')].filter(e=>Math.abs(num(e.valor)-v)>0.01),()=>{const h=1e-4;return Math.abs((Math.hypot(x+vx*h,y+vy*h)-Math.hypot(x-vx*h,y-vy*h))/(2*h)-v)<1e-4},{ver:e=>Math.abs(num(e)-v)<=0.006})},
        'escalera':()=>P[3]['escalera'](),
        'sombra':()=>{const H=rng.entero(5,8),h=rng.elegir([1.5,1.6,1.8,2]),vel=rng.entero(1,3),v=+(h*vel/(H-h)).toFixed(4);return numQ(`Una persona de ${h} m camina a ${vel} m/s alejándose de un poste de luz de ${H} m. ¿Qué tan rápido crece su sombra (m/s)? (2 decimales)`,v,v.toFixed(2),[paso('Triángulos semejantes',`\\(\\dfrac{${H}}{x + s} = \\dfrac{${h}}{s} \\Rightarrow s = \\dfrac{${h}x}{${+(H-h).toFixed(2)}}\\)`,'s = sombra, x = distancia al poste.'),final('Deriva',`\\(\\dfrac{ds}{dt} = \\dfrac{${h}}{${+(H-h).toFixed(2)}}\\cdot${vel} \\approx ${c(v.toFixed(2))}\\)`,'No depende de dónde esté.',v.toFixed(2))],[malNum(vel,'La sombra no crece igual que la persona.'),malNum(+(H*vel/(H-h)).toFixed(2),'Esa es la rapidez de la punta de la sombra.'),malNum(+(h*vel/H).toFixed(2),'Es entre H − h.')],()=>casi(v,h*vel/(H-h),1e-3),{ver:e=>Math.abs(num(e)-v)<=0.006})}
      },
      5:{
        'cono':()=>{const R=rng.entero(2,5),H=2*R,dV=rng.entero(1,6),h=rng.entero(2,8),k=R/H,v=dV/(Math.PI*k*k*h*h);return numQ(`Un tanque cónico (vértice abajo) tiene radio ${R} m y altura ${H} m. Entra agua a ${dV} m³/min. ¿Qué tan rápido sube el nivel cuando el agua tiene ${h} m de profundidad? (m/min, 3 decimales)`,v,v.toFixed(3),[paso('Radio del agua',`\\(r = \\tfrac{${R}}{${H}}h = \\tfrac{h}{2}\\)`,'Triángulos semejantes.'),paso('Volumen en función de h',`\\(V = \\tfrac{1}{3}\\pi\\left(\\tfrac{h}{2}\\right)^{2}h = \\tfrac{\\pi}{12}h^{3}\\)`,'Una sola variable.'),final('Deriva y despeja',`\\(\\dfrac{dh}{dt} = \\dfrac{4\\cdot${dV}}{\\pi\\cdot${h*h}} \\approx ${c(v.toFixed(3))}\\)`,'dV/dt = (π/4)h²·dh/dt.',v.toFixed(3))],[malNum(+(dV/(Math.PI*h*h)).toFixed(3),'El radio del agua es h/2, no h.'),malNum(+(dV/(Math.PI*R*R)).toFixed(3),'El radio cambia con la altura.'),malNum(dV,'Plantea el volumen.')],()=>{const V=t=>Math.PI/12*t**3,hh=1e-6;return Math.abs((V(h+v*hh)-V(h))/hh-dV)<1e-3},{ver:e=>Math.abs(num(e)-v)<=0.0006})},
        'autos':()=>P[4]['autos'](),
        'sombra':()=>P[4]['sombra']()
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Velocidad = s′, aceleración = s″, marginal = C′. Razones relacionadas: deriva la relación entre cantidades respecto a t y despeja.',pista:'Escribe la fórmula que relaciona las cantidades y derívala respecto a t.',teclado:'mat',...x};
  }
};

/* ---------- Regla de L'Hôpital ---------- */
const lhopital={
  titulo:"Regla de L’Hôpital",
  explicacion:"Si al sustituir sale 0/0 o ∞/∞, el límite de f/g es el límite de f′/g′ (derivando arriba y abajo por separado, NO con la regla del cociente). Se puede repetir si vuelve a salir indeterminado.",
  alternativa:"Cerca del punto, f y g se parecen a sus rectas tangentes: f ≈ f′(a)(x − a) y g ≈ g′(a)(x − a). Al dividir, el (x − a) se cancela y queda f′/g′. Por eso basta comparar qué tan rápido se van a cero (o a infinito) arriba y abajo.",
  referencia:'Ver: Stewart, Cálculo, sec. 4.4.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const L=(tex,a,v,txt,pasos,errores,f)=>numQ(`Calcula \\(\\displaystyle\\lim_{x\\to ${a}} ${tex}\\)`,v,txt,pasos,errores,()=>{const F=fx(f);if(!F)return false;const inf=a==='\\infty',der0=String(a).includes('^{+}'),pt=inf?1e3:der0?1e-7:+a,h=inf||der0?0:1e-4,val=inf||der0?F({x:pt}):(F({x:pt+h})+F({x:pt-h}))/2;return Math.abs(val-v)<=2e-2*Math.max(1,Math.abs(v))});
    const P={
      1:{
        'seno':()=>{const k=rng.elegir([2,3,4,5,-2]),v=k;return L(`\\dfrac{\\sin(${k}x)}{x}`,0,v,String(v),[paso('Sustituye: 0/0',`\\(\\dfrac{\\sin 0}{0}\\)`,'Indeterminado: aplica L’Hôpital.'),final('Deriva arriba y abajo',`\\(\\lim \\dfrac{${k}\\cos(${k}x)}{1} = ${c(v)}\\)`,'cos 0 = 1.',String(v))],[malNum(0,'0/0 no es 0.'),malNum(1,'Falta el '+k+' de la regla de la cadena.'),malNum(1/k,'Al revés.')].filter(e=>e.valor!==String(v)),`sin(${k}*x)/x`)},
        'exponencial':()=>{const k=rng.elegir([2,3,-1,4]),v=k;return L(`\\dfrac{e^{${k}x} - 1}{x}`,0,v,String(v),[paso('0/0',`\\(\\dfrac{e^{0} - 1}{0}\\)`,'Indeterminado.'),final('Deriva',`\\(\\lim ${k}e^{${k}x} = ${c(v)}\\)`,'e⁰ = 1.',String(v))],[malNum(0,'0/0 no es 0.'),malNum(1,'Falta el '+k+'.'),malNum(Math.E,'Sustituye x = 0 después de derivar.')].filter(e=>e.valor!==String(v)),`(exp(${k}*x)-1)/x`)},
        'polinomio':()=>{const a=rng.noCero(-6,6),v=2*a;return L(`\\dfrac{x^{2} - ${a*a}}{x ${sg(-a)}}`,a,v,String(v),[paso('0/0',`\\(\\dfrac{${a*a} - ${a*a}}{0}\\)`,'Indeterminado.'),final('Deriva',`\\(\\lim \\dfrac{2x}{1} = ${c(v)}\\)`,'O factoriza: da lo mismo.',String(v))],[malNum(0,'0/0 no es 0.'),malNum(a,'Es 2a.'),malNum(a*a,'Deriva arriba: 2x.')].filter(e=>e.valor!==String(v)),`(x^2-${a*a})/(x-${a})`)}
      },
      2:{
        'ln':()=>{const k=rng.elegir([1,2,3]),v=1/k;return L(`\\dfrac{\\ln x}{${k===1?'':k}x - ${k}}`,1,v,numTxt(v),[paso('0/0',`\\(\\dfrac{\\ln 1}{0} = \\dfrac{0}{0}\\)`,'Indeterminado.'),final('Deriva',`\\(\\lim \\dfrac{1/x}{${k}} = ${c(frac(1,k))}\\)`,'En x = 1.',numTxt(v))],[malNum(0,'0/0 no es 0.'),malNum(k,'Al revés.'),malNum(1,'Deriva también abajo.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),`ln(x)/(${k}*x-${k})`)},
        'seno-seno':()=>{const a=rng.elegir([2,3,4,6]),b=rng.elegir([1,2,3,5].filter(x=>x!==a)),v=a/b;return L(`\\dfrac{\\sin(${a}x)}{\\sin(${b===1?'':b}x)}`,0,v,numTxt(v),[paso('0/0',`\\(\\dfrac{0}{0}\\)`,'Indeterminado.'),final('Deriva',`\\(\\dfrac{${a}\\cos 0}{${b}\\cos 0} = ${c(frac(a,b))}\\)`,'Cadena arriba y abajo.',numTxt(v))],[malNum(b/a,'Al revés.'),malNum(1,'Faltan los coeficientes de la cadena.'),malNum(0,'0/0 no es 0.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),`sin(${a}*x)/sin(${b}*x)`)},
        'cubico':()=>{const a=rng.noCero(-4,4),v=3*a*a;return L(`\\dfrac{x^{3} ${sg(-(a**3))}}{x ${sg(-a)}}`,a,v,String(v),[paso('0/0','Sustituye.','Indeterminado.'),final('Deriva',`\\(\\lim 3x^{2} = ${c(v)}\\)`,'En x = '+a+'.',String(v))],[malNum(a*a,'Falta el 3.'),malNum(3*a,'Es 3a².'),malNum(0,'0/0 no es 0.')].filter(e=>e.valor!==String(v)),`(x^3-(${a**3}))/(x-(${a}))`)}
      },
      3:{
        'dos-veces':()=>{const v=1/2;return L(`\\dfrac{e^{x} - 1 - x}{x^{2}}`,0,v,'1/2',[paso('0/0: deriva',`\\(\\dfrac{e^{x} - 1}{2x}\\)`,'Otra vez 0/0.'),final('Deriva de nuevo',`\\(\\dfrac{e^{x}}{2} \\to ${c('\\tfrac{1}{2}')}\\)`,'Se puede repetir.','1/2')],[malNum(0,'Sigue siendo 0/0 después de la primera derivada.'),malNum(1,'Falta el 2 de abajo.'),malNum(2,'Al revés.')],'(exp(x)-1-x)/x^2')},
        'infinito':()=>{const a=rng.noCero(-6,6),b=rng.noCero(1,6),v=a/b,p1=rng.entero(1,9),p2=rng.entero(1,9);return L(`\\dfrac{${a}x^{2} + ${p1}x}{${b===1?'':b}x^{2} - ${p2}}`,'\\infty',v,numTxt(v),[paso('∞/∞: deriva dos veces',`\\(\\dfrac{${2*a}}{${2*b}}\\)`,'O divide entre x².'),final('Resultado',`\\(${c(frac(a,b))}\\)`,'Cociente de coeficientes principales.',numTxt(v))],[malNum(b/a,'Al revés.'),malNum(0,'Los grados son iguales.'),malNum(a,'Divide entre '+b+'.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),`(${a}*x^2+${p1}*x)/(${b}*x^2-${p2})`)},
        'exp-domina':()=>{const k=rng.elegir([2,3,5]);return L(`\\dfrac{x^{${k}}}{e^{x}}`,'\\infty',0,'0',[paso('∞/∞',`Deriva ${k} veces`,'Arriba baja el grado; abajo sigue eˣ.'),final('Resultado',`\\(\\dfrac{${[1,2,6,24,120][k-1]}}{e^{x}} \\to ${c(0)}\\)`,'eˣ crece más rápido que cualquier potencia.','0')],[malNum(1,'eˣ gana: tiende a 0.'),malNum(k,'Sigue derivando: arriba queda un número.'),{valor:'infinito',si:e=>/inf|∞/i.test(e),por:'La exponencial crece más rápido.'}],`x^${k}/exp(x)`)}
      },
      4:{
        'x-ln-x':()=>L('x\\ln x','0^{+}',0,'0',[paso('0·(−∞): reescribe',`\\(\\dfrac{\\ln x}{1/x}\\)`,'Ahora es −∞/∞.'),final('Deriva',`\\(\\dfrac{1/x}{-1/x^{2}} = -x \\to ${c(0)}\\)`,'x gana.','0')],[malNum(-1,'Simplifica −x y sustituye.'),{valor:'-infinito',si:e=>/inf|∞/i.test(e),por:'x va a 0 más fuerte.'},malNum(1,'Revisa la derivada.')],'x*ln(x)'),
        'coseno':()=>{const k=rng.elegir([1,2,3,4]),v=k*k/2;return L(`\\dfrac{1 - \\cos(${k===1?'':k}x)}{x^{2}}`,0,v,numTxt(v),[paso('0/0: deriva',`\\(\\dfrac{${k}\\sin(${k}x)}{2x}\\)`,'Otra vez 0/0.'),final('Deriva otra vez',`\\(\\dfrac{${k*k}\\cos(${k}x)}{2} \\to ${c(numTxt(v))}\\)`,'cos 0 = 1.',numTxt(v))],[malNum(0,'Sigue siendo 0/0.'),malNum(k/2,'Cadena dos veces: k².'),malNum(k*k,'Falta el 2 de abajo.')].filter(e=>Math.abs(num(e.valor)-v)>1e-9),`(1-cos(${k}*x))/x^2`)},
        'tangente':()=>{const k=rng.elegir([2,3,5]);return L(`\\dfrac{\\tan(${k}x)}{x}`,0,k,String(k),[paso('0/0',`Deriva`,'Indeterminado.'),final('Resultado',`\\(\\dfrac{${k}\\sec^{2}(0)}{1} = ${c(k)}\\)`,'sec 0 = 1.',String(k))],[malNum(1,'Falta el '+k+'.'),malNum(0,'0/0 no es 0.'),malNum(1/k,'Al revés.')],`tan(${k}*x)/x`)}
      },
      5:{
        'ln-x':()=>{const k=rng.elegir([1,2,3]);return L(`\\dfrac{\\ln x}{x^{${k===1?'':k}}}`.replace('^{}',''),'\\infty',0,'0',[paso('∞/∞: deriva',`\\(\\dfrac{1/x}{${k}x^{${k-1}}} = \\dfrac{1}{${k}x^{${k}}}\\)`,'Simplifica.'),final('Resultado',`\\(${c(0)}\\)`,'Cualquier potencia gana al logaritmo.','0')],[malNum(1,'Tiende a 0.'),{valor:'infinito',si:e=>/inf|∞/i.test(e),por:'ln crece más lento.'},malNum(1/k,'Sigue el límite: x → ∞.')],`ln(x)/x^${k}`)},
        'dos-exponenciales':()=>{const a=rng.elegir([2,3,5]),b=rng.elegir([1,-1,4].filter(x=>x!==a)),v=a-b;return L(`\\dfrac{e^{${a}x} - e^{${b===1?'':b===-1?'-':b}x}}{x}`,0,v,String(v),[paso('0/0: deriva',`\\(\\dfrac{${a}e^{${a}x} - ${par(b)}e^{${b}x}}{1}\\)`,'Cadena en cada exponencial.'),final('x = 0',`\\(${a} - ${par(b)} = ${c(v)}\\)`,'e⁰ = 1.',String(v))],[malNum(a+b,'Es una resta.'),malNum(0,'0/0 no es 0.'),malNum(a*b,'Deriva cada término.')].filter(e=>e.valor!==String(v)),`(exp(${a}*x)-exp(${b}*x))/x`)},
        'dos-veces':()=>P[3]['dos-veces']()
      }
    };
    const x=plantillas(rng,P[n]);
    return {regla:"L’Hôpital: si el límite de f/g da 0/0 o ∞/∞, vale lo mismo que el de f′/g′ (derivando arriba y abajo por separado).",pista:'Sustituye primero: ¿sale 0/0 o ∞/∞? Entonces deriva arriba y abajo.',teclado:'mat',...x,
      verificar:x.verificar||(e=>igualNum(e,0))};
  }
};

export default {'cd/continuidad':continuidad,'cd/definicion':definicion,'cd/trascendentes':trascendentes,'cd/implicita':implicita,'cd/maximos':maximos,'cd/optimizacion':optimizacion,'cd/razon-cambio':razon,'cd/lhopital':lhopital};
