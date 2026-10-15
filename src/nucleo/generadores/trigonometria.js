/* Generadores del tema Trigonometría: razones trigonométricas, círculo unitario, identidades y ecuaciones trigonométricas.
   3 plantillas por nivel y comprobar() con un cálculo independiente (Math.sin/cos/tan). Los valores exactos se escriben
   con √ (√3/2) y los ángulos en grados o con π. Sin DOM. */
import {num,casi,igualNum,equivalente,lista,limpiar,compilar} from './verificar.js';
import {frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt,sg} from './algebra-temas.js';

const RAD=Math.PI/180;
const TRIPLES=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[20,21,29]];
// valores exactos de los ángulos notables
const EXACTO={0:['0','1','0'],30:['1/2','√3/2','√3/3'],45:['√2/2','√2/2','1'],60:['√3/2','1/2','√3'],90:['1','0',null]};
const TEX=t=>String(t).replace(/√(\d+)\/(\d+)/,'\\tfrac{\\sqrt{$1}}{$2}').replace(/^(-?)(\d+)\/(\d+)$/,'$1\\tfrac{$2}{$3}').replace(/√(\d+)/,'\\sqrt{$1}');
const neg=t=>t==='0'?'0':t.startsWith('-')?t.slice(1):'-'+t;
// valor exacto (texto) de sen/cos/tan en un ángulo múltiplo de 30° o 45°
function exacto(f,g){g=((g%360)+360)%360;const q=Math.floor(g/90),ref=[g,180-g,g-180,360-g][q]%360;const r=ref===90&&f!=='tan'?90:ref;
  const base=EXACTO[r===360?0:r];if(!base)return null;let t=base[{sen:0,cos:1,tan:2}[f]];if(t===null)return null;
  const signo={sen:[1,1,-1,-1],cos:[1,-1,-1,1],tan:[1,-1,1,-1]}[f][g%90===0?[0,1,2,3][g/90]:q];
  if(g%90===0){const v={sen:Math.round(Math.sin(g*RAD)),cos:Math.round(Math.cos(g*RAD)),tan:Math.round(Math.tan(g*RAD))}[f];return String(v===-0?0:v)}
  return signo<0?neg(t):t}
const nota='<br><span class="nota">Valor exacto con √ (por ejemplo √3/2) o decimal con 3 cifras.</span>';
const verVal=v=>e=>{const x=num(e);return Number.isFinite(x)&&Math.abs(x-v)<=1e-3*Math.max(1,Math.abs(v))};
const nQ=(enun,v,txt,pasos,errores,comprobar,extra={})=>({enunciado:enun,respuesta:txt,verificar:extra.ver||verVal(v),pasos,errores:errores.filter(e=>Math.abs(num(e.valor)-v)>1e-6),comprobar,...extra});
const radTxt=g=>{const k=g/180,f=numTxt(k);return f==='0'?'0':f==='1'?'π':f==='-1'?'-π':f.includes('/')?`${f.split('/')[0].replace(/^1$/,'').replace(/^-1$/,'-')}π/${f.split('/')[1]}`:`${f}π`};
const radTex=g=>radTxt(g).replace(/(-?\d*)π\/(\d+)/,(m,a,b)=>`\\tfrac{${a}\\pi}{${b}}`).replace('π','\\pi');

/* ---------- Razones trigonométricas ---------- */
const razones={
  titulo:'Razones trigonométricas',
  explicacion:'En un triángulo rectángulo, para un ángulo θ: sen θ = opuesto/hipotenusa, cos θ = adyacente/hipotenusa y tan θ = opuesto/adyacente (SOH-CAH-TOA). Si conoces un ángulo y un lado, despejas los demás; si conoces dos lados, el ángulo sale con arcsen, arccos o arctan.',
  alternativa:'Imagina una rampa: la hipotenusa es la rampa, el cateto opuesto es lo que subes y el adyacente lo que avanzas. El seno dice qué fracción de la rampa es subida; el coseno, qué fracción es avance; la tangente, cuánto subes por cada metro que avanzas (la pendiente).',
  referencia:'Ver: Stewart, Precálculo, sec. 6.2; Baldor, Trigonometría, cap. 2.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const tri=()=>{const t=rng.elegir(TRIPLES);return rng.prob(.5)?t:[t[1],t[0],t[2]]};
    const razon=f=>{const [op,ad,hip]=tri(),v=f==='sen'?op/hip:f==='cos'?ad/hip:op/ad,t=f==='sen'?frac(op,hip,{tex:false}):f==='cos'?frac(ad,hip,{tex:false}):frac(op,ad,{tex:false});
      return nQ(`En un triángulo rectángulo, el cateto opuesto a θ mide ${op}, el adyacente ${ad} y la hipotenusa ${hip}. ¿Cuánto vale ${f==='sen'?'sen':f==='cos'?'cos':'tan'} θ?`,v,t,[paso(f==='sen'?'SOH: opuesto/hipotenusa':f==='cos'?'CAH: adyacente/hipotenusa':'TOA: opuesto/adyacente',`\\(\\dfrac{${f==='cos'?ad:op}}{${f==='tan'?ad:hip}}\\)`,'Identifica cada lado respecto a θ.'),final('Simplifica',`\\(${c(TEX(t))}\\)`,'Es un número sin unidades.',t)],
        [malNum(f==='sen'?ad/hip:f==='cos'?op/hip:ad/op,f==='tan'?'Es opuesto/adyacente.':'Confundiste opuesto y adyacente.'),malNum(f==='tan'?op/hip:hip/(f==='sen'?op:ad),f==='tan'?'Eso es el seno.':'Al revés: el lado sobre la hipotenusa.'),malNum(f==='sen'?op/ad:ad/op,'Esa es otra razón.')],()=>casi(v,f==='sen'?Math.sin(Math.atan2(op,ad)):f==='cos'?Math.cos(Math.atan2(op,ad)):Math.tan(Math.atan2(op,ad))))};
    const lado=tipo=>{const g=rng.elegir([30,45,60]),h=rng.entero(2,20),s=Math.sin(g*RAD),co=Math.cos(g*RAD),tg=Math.tan(g*RAD);
      if(tipo==='op')return nQ(`Una rampa (hipotenusa) mide ${h} m y forma ${g}° con el suelo. ¿Cuánto sube (cateto opuesto)? (2 decimales)`,h*s,(h*s).toFixed(2),[paso('sen = opuesto/hipotenusa',`\\(\\text{op} = ${h}\\sin ${g}^\\circ\\)`,'Despeja el opuesto.'),final('Calcula',`\\(${h}\\cdot${s.toFixed(4)} \\approx ${c((h*s).toFixed(2))}\\)`,'sen '+g+'° ≈ '+s.toFixed(4)+'.',(h*s).toFixed(2))],[malNum(+(h*co).toFixed(2),'Eso es lo que avanza (coseno).'),malNum(+(h/s).toFixed(2),'Se multiplica por el seno, no se divide.'),malNum(+(h*tg).toFixed(2),'Con la hipotenusa se usa seno.')],()=>casi(Math.hypot(h*s,h*co),h),{ver:e=>Math.abs(num(e)-h*s)<=0.006});
      if(tipo==='hip'){const op=rng.entero(2,20);return nQ(`El cateto opuesto a un ángulo de ${g}° mide ${op}. ¿Cuánto mide la hipotenusa? (2 decimales)`,op/s,(op/s).toFixed(2),[paso('sen = op/hip',`\\(\\text{hip} = \\dfrac{${op}}{\\sin ${g}^\\circ}\\)`,'Despeja.'),final('Calcula',`\\(\\approx ${c((op/s).toFixed(2))}\\)`,'La hipotenusa es la más larga.',(op/s).toFixed(2))],[malNum(+(op*s).toFixed(2),'Se divide entre el seno.'),malNum(+(op/co).toFixed(2),'Con el opuesto se usa seno.'),malNum(+(op/tg).toFixed(2),'Ese sería el adyacente.')],()=>casi((op/s)*s,op),{ver:e=>Math.abs(num(e)-op/s)<=0.006})}
      const ad=rng.entero(2,20);return nQ(`Desde ${ad} m de un árbol, la punta se ve con un ángulo de ${g}°. ¿Qué altura tiene? (2 decimales)`,ad*tg,(ad*tg).toFixed(2),[paso('tan = opuesto/adyacente',`\\(h = ${ad}\\tan ${g}^\\circ\\)`,'Altura = opuesto; distancia = adyacente.'),final('Calcula',`\\(\\approx ${c((ad*tg).toFixed(2))}\\)`,'tan '+g+'° ≈ '+tg.toFixed(4)+'.',(ad*tg).toFixed(2))],[malNum(+(ad*s).toFixed(2),'Con opuesto y adyacente se usa tangente.'),malNum(+(ad/tg).toFixed(2),'Se multiplica por la tangente.'),malNum(+(ad*co).toFixed(2),'Usa tangente.')],()=>casi(Math.atan2(ad*tg,ad)/RAD,g),{ver:e=>Math.abs(num(e)-ad*tg)<=0.006})};
    const angulo=()=>{const [op,ad]=[rng.entero(1,12),rng.entero(1,12)],g=Math.atan2(op,ad)/RAD;return nQ(`Un triángulo rectángulo tiene catetos ${op} (opuesto a θ) y ${ad} (adyacente). ¿Cuánto mide θ en grados? (1 decimal)`,g,g.toFixed(1),[paso('tan θ = op/ad',`\\(\\tan\\theta = \\dfrac{${op}}{${ad}}\\)`,'Con los dos catetos, tangente.'),final('Arcotangente',`\\(\\theta = \\arctan\\dfrac{${op}}{${ad}} \\approx ${c(g.toFixed(1))}^\\circ\\)`,'En grados.',g.toFixed(1))],[malNum(+(90-g).toFixed(1),'Ese es el otro ángulo agudo.'),malNum(+(op/ad).toFixed(2),'Eso es la tangente; falta arctan.'),malNum(+(Math.atan2(op,ad)).toFixed(2),'Está en radianes; pásalo a grados.')],()=>casi(Math.tan(g*RAD),op/ad),{ver:e=>Math.abs(num(String(e).replace('°',''))-g)<=0.06})};
    const desdeOtra=()=>{const [op,ad,hip]=tri(),pide=rng.elegir(['cos','tan']),v=pide==='cos'?ad/hip:op/ad,t=pide==='cos'?frac(ad,hip,{tex:false}):frac(op,ad,{tex:false});return nQ(`Si θ es agudo y \\(\\sin\\theta = ${TEX(frac(op,hip,{tex:false}))}\\), ¿cuánto vale ${pide==='cos'?'cos':'tan'} θ?`,v,t,[paso('Dibuja el triángulo: opuesto '+op+', hipotenusa '+hip,`\\(\\text{ady} = \\sqrt{${hip*hip} - ${op*op}} = ${c(ad)}\\)`,'Pitágoras.'),final('Calcula la razón',`\\(${c(TEX(t))}\\)`,pide==='cos'?'ady/hip.':'op/ady.',t)],[malNum(op/hip,'Ese es el seno.'),malNum(pide==='cos'?op/ad:ad/hip,'Esa es otra razón.'),malNum(pide==='cos'?hip/ad:ad/op,'Al revés.')],()=>casi(Math.sin(Math.asin(op/hip)),op/hip)&&casi(v,pide==='cos'?Math.cos(Math.asin(op/hip)):Math.tan(Math.asin(op/hip))))};
    const reciproca=()=>{const [op,ad,hip]=tri(),f=rng.elegir(['csc','sec','cot']),v=f==='csc'?hip/op:f==='sec'?hip/ad:ad/op,t=f==='csc'?frac(hip,op,{tex:false}):f==='sec'?frac(hip,ad,{tex:false}):frac(ad,op,{tex:false});return nQ(`Con opuesto ${op}, adyacente ${ad} e hipotenusa ${hip}, ¿cuánto vale ${f} θ?`,v,t,[paso(f==='csc'?'csc = 1/sen = hip/op':f==='sec'?'sec = 1/cos = hip/ady':'cot = 1/tan = ady/op','Recíprocas.','Voltea la razón.'),final('Calcula',`\\(${c(TEX(t))}\\)`,'Fracción.',t)],[malNum(1/v,'Esa es la razón sin voltear.'),malNum(f==='csc'?hip/ad:hip/op,'Revisa qué lado va abajo.'),malNum(op/hip,'Ese es el seno.')],()=>casi(v,f==='csc'?1/Math.sin(Math.atan2(op,ad)):f==='sec'?1/Math.cos(Math.atan2(op,ad)):1/Math.tan(Math.atan2(op,ad))))};
    const P={1:{'seno':()=>razon('sen'),'coseno':()=>razon('cos'),'tangente':()=>razon('tan')},
      2:{'opuesto':()=>lado('op'),'hipotenusa':()=>lado('hip'),'altura':()=>lado('ad')},
      3:{'angulo':angulo,'desde-otra':desdeOtra,'altura':()=>lado('ad')},
      4:{'reciproca':reciproca,'angulo':angulo,'hipotenusa':()=>lado('hip')},
      5:{'desde-otra':desdeOtra,'reciproca':reciproca,'opuesto':()=>lado('op')}};
    const x=plantillas(rng,P[n]);
    return {regla:'SOH-CAH-TOA: sen = opuesto/hipotenusa, cos = adyacente/hipotenusa, tan = opuesto/adyacente.',pista:'Identifica qué lados conoces respecto al ángulo.',teclado:'mat',...x};
  }
};

/* ---------- Círculo unitario ---------- */
const circulo={
  titulo:'Círculo unitario',
  explicacion:'En el círculo de radio 1, el punto del ángulo θ es (cos θ, sen θ). Los ángulos notables (30°, 45°, 60°) dan valores exactos; en otros cuadrantes se usa el ángulo de referencia y el signo del cuadrante (todas positivas en I, solo seno en II, tangente en III, coseno en IV). π rad = 180°.',
  alternativa:'Piensa en una rueda de la fortuna de radio 1: tu altura es el seno y tu distancia horizontal al centro es el coseno. Al dar la vuelta, los valores se repiten: en 150° estás a la misma altura que en 30°, pero del otro lado.',
  referencia:'Ver: Stewart, Precálculo, sec. 5.1 y 5.2.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const NOT=[30,45,60],todos=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
    const valor=(f,g,enGrados=true)=>{const t=exacto(f,g);if(t===null)return valor(f,g+30,enGrados);const v=f==='sen'?Math.sin(g*RAD):f==='cos'?Math.cos(g*RAD):Math.tan(g*RAD),q=Math.floor((((g%360)+360)%360)/90)+1,ref=[g%360,180-g%360,g%360-180,360-g%360][q-1];
      return nQ(`Valor exacto de \\(\\${f==='sen'?'sin':f}(${enGrados?`${g}^\\circ`:radTex(g)})\\)${nota}`,v,t,[paso('Cuadrante y ángulo de referencia',`${enGrados?`${g}°`:radTxt(g)+' = '+g+'°'}: cuadrante ${q}, referencia ${ref}°`,'Se mira el ángulo con el eje x.'),final('Valor del notable con el signo del cuadrante',`\\(${c(TEX(t))}\\)`,'Signos: I todas, II sen, III tan, IV cos.',t)],
        [malNum(-v,'Revisa el signo del cuadrante.'),malNum(f==='sen'?Math.cos(g*RAD):Math.sin(g*RAD),'Confundiste seno y coseno.'),malNum(+(f==='sen'?Math.sin(g):Math.cos(g)).toFixed(3),'Usaste radianes en la calculadora.')],()=>Math.abs(num(t)-v)<1e-9)};
    const P={
      1:{'grados-a-rad':()=>{const g=rng.elegir(todos.filter(x=>x)),t=radTxt(g),v=g*RAD;return nQ(`Convierte ${g}° a radianes (usa π).`,v,t,[paso('Multiplica por π/180',`\\(${g}\\cdot\\dfrac{\\pi}{180}\\)`,'180° = π rad.'),final('Simplifica',`\\(${c(radTex(g))}\\)`,'Fracción de π.',t)],[malNum(g*180/Math.PI,'Al revés: multiplica por π/180.'),malNum(g/180,'Falta π.'),malNum(Math.PI/g,'Es g·π/180.')],()=>casi(num(t),v))},
         'rad-a-grados':()=>{const g=rng.elegir(todos.filter(x=>x));return nQ(`Convierte \\(${radTex(g)}\\) rad a grados.`,g,String(g),[paso('Multiplica por 180/π',`\\(${radTex(g)}\\cdot\\dfrac{180}{\\pi}\\)`,'π se cancela.'),final('Resultado',`\\(${c(g)}^\\circ\\)`,'Grados.',String(g))],[malNum(g*RAD,'Eso es en radianes.'),malNum(g/180,'Multiplica por 180.'),malNum(360-g,'Revisa la fracción.')],()=>casi(num(radTxt(g))/RAD,g),{ver:e=>igualNum(String(e).replace('°',''),g)})},
         'notable':()=>valor(rng.elegir(['sen','cos']),rng.elegir(NOT))},
      2:{'seno':()=>valor('sen',rng.elegir(todos)),'coseno':()=>valor('cos',rng.elegir(todos)),
         'cuadrante':()=>{const g=rng.elegir([20,75,100,160,200,250,290,340]),q=Math.floor(g/90)+1;return nQ(`¿En qué cuadrante está el ángulo de ${g}°? (1, 2, 3 o 4)`,q,String(q),[paso('Cada cuadrante abarca 90°',`\\(${(q-1)*90}^\\circ < ${g}^\\circ < ${q*90}^\\circ\\)`,'Se cuenta desde el eje x positivo, antihorario.'),final('Cuadrante',`\\(${c(q)}\\)`,'I, II, III o IV.',String(q))],[malNum(q===4?1:q+1,'Cuenta desde 0° en sentido antihorario.'),malNum(q===1?4:q-1,'Revisa los límites: 90°, 180°, 270°.'),malNum(Math.ceil(g/100),'Cada cuadrante mide 90°, no 100°.')],()=>q===Math.floor(g/90)+1)}},
      3:{'tangente':()=>valor('tan',rng.elegir(todos.filter(x=>x%90))),'seno':()=>valor('sen',rng.elegir(todos.filter(x=>x>90))),'coseno':()=>valor('cos',rng.elegir(todos.filter(x=>x>90)))},
      4:{'seno-rad':()=>valor('sen',rng.elegir(todos),false),'coseno-rad':()=>valor('cos',rng.elegir(todos),false),
         'coterminal':()=>{const g=rng.elegir(todos.filter(x=>x)),k=rng.entero(1,2)*rng.signo(),h=g+360*k;return nQ(`Ángulo entre 0° y 360° coterminal con ${h}°`,g,String(g),[paso(k>0?'Resta vueltas de 360°':'Suma vueltas de 360°',`\\(${h} ${k>0?'-':'+'} ${360*Math.abs(k)}\\)`,'Misma posición en el círculo.'),final('Resultado',`\\(${c(g)}^\\circ\\)`,'Entre 0° y 360°.',String(g))],[malNum(h,'Quita las vueltas completas.'),malNum(360-g,'Coterminal no es el suplemento.'),malNum(h%180,'Las vueltas son de 360°.')],()=>(((h%360)+360)%360)===g,{ver:e=>igualNum(String(e).replace('°',''),g)})}},
      5:{'negativo':()=>{const g=rng.elegir(todos.filter(x=>x)),f=rng.elegir(['sen','cos']),t=exacto(f,-g),v=f==='sen'?Math.sin(-g*RAD):Math.cos(-g*RAD);return nQ(`Valor exacto de \\(\\${f==='sen'?'sin':'cos'}(-${radTex(g)})\\)${nota}`,v,t,[paso(f==='sen'?'El seno es impar: sen(−x) = −sen x':'El coseno es par: cos(−x) = cos x',`\\(${f==='sen'?'-':''}\\${f==='sen'?'sin':'cos'}(${radTex(g)})\\)`,'Simetría.'),final('Valor',`\\(${c(TEX(t))}\\)`,'Ángulo de referencia y signo.',t)],[malNum(-v,f==='sen'?'sen(−x) = −sen x.':'cos(−x) = cos x (no cambia).'),malNum(f==='sen'?Math.cos(g*RAD):Math.sin(g*RAD),'Confundiste seno y coseno.'),malNum(0,'Calcula el valor.')],()=>Math.abs(num(t)-v)<1e-9)},
         'mas-de-una-vuelta':()=>{const g=rng.elegir(todos),f=rng.elegir(['sen','cos']),h=g+360;return valor(f,h,false)},
         'tangente-rad':()=>valor('tan',rng.elegir(todos.filter(x=>x%90)),false)}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'En el círculo unitario el punto es (cos θ, sen θ). Usa el ángulo de referencia y el signo del cuadrante; π rad = 180°.',pista:'¿En qué cuadrante está y cuál es su ángulo de referencia?',teclado:'mat',...x};
  }
};

/* ---------- Identidades ---------- */
const identidades={
  titulo:'Identidades trigonométricas',
  explicacion:'Las más usadas: sen²x + cos²x = 1, tan x = sen x / cos x, 1 + tan²x = sec²x, sen 2x = 2 sen x cos x y cos 2x = cos²x − sen²x = 1 − 2 sen²x. Sirven para simplificar expresiones y para hallar una razón conociendo otra. Puedes escribir sen o sin.',
  alternativa:'sen²x + cos²x = 1 es Pitágoras en el círculo unitario: el punto (cos x, sen x) está a distancia 1 del centro. Las demás salen de ahí o de escribir todo en senos y cosenos.',
  referencia:'Ver: Stewart, Precálculo, sec. 7.1 a 7.3.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const simp=(enunTex,expr,resp,respTxt,pasos,errores)=>({enunciado:`Simplifica: \\(${enunTex}\\)`,respuesta:respTxt,verificar:e=>equivalente(e,resp),pasos:[...pasos,final('Resultado',`\\(${c(respTxt.replace(/sen/g,'\\sin ').replace(/cos/g,'\\cos ').replace(/\^2/g,'^{2}'))}\\)`,'Identidad.',respTxt)],errores:errores.map(([v,por])=>({valor:v,si:e=>equivalente(e,v.replace(/sen/g,'sin')),por})),comprobar:()=>equivalente(expr,resp)});
    const otraRazon=()=>{const t=rng.elegir(TRIPLES),q=rng.elegir([1,2,3,4]),[op,ad,h]=t,sS=[1,1,-1,-1][q-1],sC=[1,-1,-1,1][q-1],pide=rng.elegir(['cos','tan']),v=pide==='cos'?sC*ad/h:(sS*op)/(sC*ad),txt=frac(pide==='cos'?sC*ad:sS*sC*op,pide==='cos'?h:ad,{tex:false});
      return nQ(`Si \\(\\sin\\theta = ${TEX(frac(sS*op,h,{tex:false}))}\\) y θ está en el cuadrante ${['I','II','III','IV'][q-1]}, ¿cuánto vale ${pide==='cos'?'cos':'tan'} θ?`,v,txt,[paso('sen² + cos² = 1',`\\(\\cos\\theta = \\pm\\sqrt{1 - \\tfrac{${op*op}}{${h*h}}} = \\pm\\tfrac{${ad}}{${h}}\\)`,'Pitágoras.'),paso('Signo del cuadrante',`cuadrante ${['I','II','III','IV'][q-1]}: coseno ${sC>0?'positivo':'negativo'}`,'Todas, Seno, Tangente, Coseno.'),final(pide==='cos'?'Coseno':'tan = sen/cos',`\\(${c(TEX(txt))}\\)`,'Con su signo.',txt)],[malNum(-v,'Revisa el signo del cuadrante.'),malNum(pide==='cos'?sS*op/h:ad/op,'Esa es otra razón.'),malNum(pide==='cos'?1-op/h:v*h,'Usa sen² + cos² = 1.')],()=>{const th=Math.atan2(sS*op,sC*ad);return casi(Math.sin(th),sS*op/h)&&casi(pide==='cos'?Math.cos(th):Math.tan(th),v)})};
    const P={
      1:{'pitagorica':()=>simp('\\sin^{2}x + \\cos^{2}x','sin(x)^2+cos(x)^2','1','1',[paso('Identidad pitagórica',`\\(\\sin^{2}x + \\cos^{2}x = 1\\)`,'Siempre vale 1.')],[['0','Es la suma de cuadrados: vale 1.'],['2','No son 1 cada uno.']]),
         'tan-por-cos':()=>simp('\\tan x\\cos x','tan(x)*cos(x)','sin(x)','sen(x)',[paso('Escribe tan = sen/cos',`\\(\\dfrac{\\sin x}{\\cos x}\\cos x\\)`,'Todo en senos y cosenos.')],[['cos(x)','Se cancela el coseno: queda seno.'],['tan(x)','Se puede simplificar.'],['1','Queda sen x.']]),
         'otra-razon':otraRazon},
      2:{'uno-menos-seno':()=>simp('1 - \\sin^{2}x','1-sin(x)^2','cos(x)^2','cos(x)^2',[paso('Despeja de sen² + cos² = 1',`\\(\\cos^{2}x = 1 - \\sin^{2}x\\)`,'Pitagórica.')],[['cos(x)','Es cos², no cos.'],['sen(x)^2 - 1','Es al revés.'],['1','Resta sen².']]),
         'sec-tan':()=>simp('1 + \\tan^{2}x','1+tan(x)^2','1/cos(x)^2','1/cos(x)^2',[paso('Identidad',`\\(1 + \\tan^{2}x = \\sec^{2}x = \\dfrac{1}{\\cos^{2}x}\\)`,'Divide sen² + cos² = 1 entre cos².')],[['cos(x)^2','Es 1/cos².'],['1/sen(x)^2','Es secante (coseno abajo).'],['tan(x)^2','Falta el 1.']]),
         'otra-razon':otraRazon},
      3:{'doble-seno':()=>{const t=rng.elegir(TRIPLES),[op,ad,h]=t,v=2*op*ad/(h*h);return nQ(`Si θ es agudo con \\(\\sin\\theta = ${TEX(frac(op,h,{tex:false}))}\\), calcula \\(\\sin 2\\theta\\).`,v,frac(2*op*ad,h*h,{tex:false}),[paso('cos θ',`\\(\\tfrac{${ad}}{${h}}\\)`,'Pitágoras.'),final('sen 2θ = 2 sen θ cos θ',`\\(2\\cdot\\tfrac{${op}}{${h}}\\cdot\\tfrac{${ad}}{${h}} = ${c(TEX(frac(2*op*ad,h*h,{tex:false})))}\\)`,'Ángulo doble.',frac(2*op*ad,h*h,{tex:false}))],[malNum(2*op/h,'sen 2θ ≠ 2 sen θ.'),malNum(op*ad/(h*h),'Falta el 2.'),malNum((ad*ad-op*op)/(h*h),'Eso es cos 2θ.')],()=>casi(Math.sin(2*Math.asin(op/h)),v))},
         'doble-coseno':()=>{const t=rng.elegir(TRIPLES),[op,ad,h]=t,v=1-2*op*op/(h*h);return nQ(`Si θ es agudo con \\(\\sin\\theta = ${TEX(frac(op,h,{tex:false}))}\\), calcula \\(\\cos 2\\theta\\).`,v,frac(h*h-2*op*op,h*h,{tex:false}),[paso('Fórmula sin necesidad del coseno',`\\(\\cos 2\\theta = 1 - 2\\sin^{2}\\theta\\)`,'Ángulo doble.'),final('Sustituye',`\\(1 - 2\\cdot\\tfrac{${op*op}}{${h*h}} = ${c(TEX(frac(h*h-2*op*op,h*h,{tex:false})))}\\)`,'Puede ser negativo.',frac(h*h-2*op*op,h*h,{tex:false}))],[malNum(2*ad/h,'cos 2θ ≠ 2 cos θ.'),malNum(1-op*op/(h*h),'Es 1 − 2sen².'),malNum(2*op*ad/(h*h),'Eso es sen 2θ.')],()=>casi(Math.cos(2*Math.asin(op/h)),v))},
         'cociente':()=>simp('\\dfrac{1 - \\cos^{2}x}{\\sin x}','(1-cos(x)^2)/sin(x)','sin(x)','sen(x)',[paso('1 − cos² = sen²',`\\(\\dfrac{\\sin^{2}x}{\\sin x}\\)`,'Pitagórica.')],[['sen(x)^2','Se cancela un seno.'],['cos(x)','1 − cos² es sen².'],['1','Queda un seno.']])},
      4:{'suma-angulos':()=>{const [a,b,f]=rng.elegir([[45,30,'sen'],[45,30,'cos'],[60,45,'sen'],[60,45,'cos'],[45,-30,'sen'],[45,-30,'cos']]),g=a+b,v=f==='sen'?Math.sin(g*RAD):Math.cos(g*RAD);return nQ(`Calcula el valor exacto de \\(\\${f==='sen'?'sin':'cos'} ${g}^\\circ\\) usando ${g}° = ${a}° ${b<0?'−':'+'} ${Math.abs(b)}°.${nota}`,v,v.toFixed(3),[paso(f==='sen'?'sen(a ± b) = sen a cos b ± cos a sen b':'cos(a ± b) = cos a cos b ∓ sen a sen b',`Con ${a}° y ${Math.abs(b)}°`,'Fórmula de suma.'),final('Calcula',`\\(\\approx ${c(v.toFixed(3))}\\)`,'Exacto: (√6 ± √2)/4.',v.toFixed(3))],[malNum(+(f==='sen'?Math.sin(a*RAD)+Math.sin(b*RAD):Math.cos(a*RAD)+Math.cos(b*RAD)).toFixed(3),'sen(a + b) ≠ sen a + sen b.'),malNum(+(f==='sen'?Math.cos(g*RAD):Math.sin(g*RAD)).toFixed(3),'Usa la fórmula correcta.'),malNum(+(-v).toFixed(3),'Revisa el signo.')],()=>casi(v,f==='sen'?Math.sin(a*RAD)*Math.cos(b*RAD)+Math.cos(a*RAD)*Math.sin(b*RAD):Math.cos(a*RAD)*Math.cos(b*RAD)-Math.sin(a*RAD)*Math.sin(b*RAD)))},
         'doble-seno':()=>P[3]['doble-seno'](),
         'tan-doble':()=>{const t=rng.elegir(TRIPLES.filter(x=>x[0]!==x[1])),[op,ad]=t,tg=op/ad,v=2*tg/(1-tg*tg);return nQ(`Si θ es agudo con \\(\\tan\\theta = ${TEX(frac(op,ad,{tex:false}))}\\), calcula \\(\\tan 2\\theta\\).`,v,frac(2*op*ad,ad*ad-op*op,{tex:false}),[paso('tan 2θ = 2tan θ / (1 − tan² θ)',`\\(\\dfrac{2\\cdot\\tfrac{${op}}{${ad}}}{1 - \\tfrac{${op*op}}{${ad*ad}}}\\)`,'Ángulo doble.'),final('Simplifica',`\\(${c(TEX(frac(2*op*ad,ad*ad-op*op,{tex:false})))}\\)`,'Puede ser negativa.',frac(2*op*ad,ad*ad-op*op,{tex:false}))],[malNum(2*tg,'tan 2θ ≠ 2 tan θ.'),malNum(2*tg/(1+tg*tg),'Es 1 − tan².'),malNum(tg*tg,'Usa la fórmula del doble.')],()=>casi(Math.tan(2*Math.atan(op/ad)),v))}},
      5:{'potencia-reducida':()=>simp('\\cos^{2}x','cos(x)^2','(1+cos(2*x))/2','(1 + cos(2x))/2',[paso('Despeja de cos 2x = 2cos²x − 1',`\\(\\cos^{2}x = \\dfrac{1 + \\cos 2x}{2}\\)`,'Reducción de potencia (útil para integrar).')],[['(1 - cos(2x))/2','Ese es sen²x.'],['cos(2x)/2','Falta el 1.'],['2cos(x)','No es el doble.']]),
         'suma-angulos':()=>P[4]['suma-angulos'](),
         'cociente-doble':()=>simp('\\dfrac{\\sin 2x}{2\\cos x}','sin(2*x)/(2*cos(x))','sin(x)','sen(x)',[paso('sen 2x = 2 sen x cos x',`\\(\\dfrac{2\\sin x\\cos x}{2\\cos x}\\)`,'Ángulo doble.')],[['tan(x)','Se cancelan 2 y cos.'],['sen(x)*cos(x)','Se cancela el coseno.'],['1/2','Simplifica bien.']])}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'sen²x + cos²x = 1 · tan x = sen x/cos x · 1 + tan²x = sec²x · sen 2x = 2 sen x cos x · cos 2x = 1 − 2sen²x.',pista:'Escríbelo todo en senos y cosenos o usa la identidad pitagórica.',teclado:'mat',...x};
  }
};

/* ---------- Ecuaciones trigonométricas ---------- */
const conjuntoGrados=(e,sol,rad=false)=>{const l=lista(String(e).replace(/°|x\s*=\s*|θ\s*=\s*/g,'').replace(/\s+y\s+/g,','));const a=[...new Set(l.map(v=>Math.round(v*1e4)/1e4))].sort((p,q)=>p-q),b=[...sol].map(v=>rad?v*RAD:v).sort((p,q)=>p-q);return a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<=(rad?2e-3:0.05))};
const ecuaciones={
  titulo:'Ecuaciones trigonométricas',
  explicacion:'Despeja la función (sen x = …), busca el ángulo de referencia y escribe TODAS las soluciones en una vuelta: el seno se repite en los cuadrantes con su mismo signo (por ejemplo sen x = 1/2 en 30° y 150°). Si es cuadrática, factoriza primero.',
  alternativa:'En el círculo unitario, sen x = 1/2 es una línea horizontal a la altura 1/2: corta el círculo en DOS puntos (30° y 150°). Por eso casi siempre hay dos soluciones por vuelta.',
  referencia:'Ver: Stewart, Precálculo, sec. 7.4 y 7.5.',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const SOL={sen:{'1/2':[30,150],'-1/2':[210,330],'√2/2':[45,135],'-√2/2':[225,315],'√3/2':[60,120],'-√3/2':[240,300],'1':[90],'-1':[270],'0':[0,180]},
      cos:{'1/2':[60,300],'-1/2':[120,240],'√2/2':[45,315],'-√2/2':[135,225],'√3/2':[30,330],'-√3/2':[150,210],'1':[0],'-1':[180],'0':[90,270]},
      tan:{'1':[45,225],'-1':[135,315],'√3':[60,240],'-√3':[120,300],'√3/3':[30,210],'0':[0,180]}};
    const Q=(enunTex,sol,pasos,errores,rad=false,check)=>{const txt=sol.map(g=>rad?radTxt(g):`${g}°`).join(', ');return {enunciado:`Resuelve \\(${enunTex}\\) para ${rad?'\\(0 \\le x < 2\\pi\\) (en radianes, con π)':'\\(0^\\circ \\le x < 360^\\circ\\) (en grados)'}. Escribe todas las soluciones separadas por coma.`,respuesta:txt,verificar:e=>conjuntoGrados(e,sol,rad),
      pasos:[...pasos,final('Todas las soluciones en una vuelta',`\\(${sol.map(g=>rad?radTex(g):`${g}^\\circ`).join(',\\ ')}\\)`,'Revisa cada cuadrante.',txt)],errores:errores.map(([v,por])=>({valor:v.map(g=>rad?radTxt(g):`${g}°`).join(', '),si:e=>conjuntoGrados(e,v,rad),por})).filter(er=>!conjuntoGrados(er.valor,sol,rad)),comprobar:check||(()=>true)}};
    const simple=(f,rad=false)=>{const vals=Object.keys(SOL[f]).filter(k=>SOL[f][k].length===2),k=rng.elegir(vals),sol=SOL[f][k],ref=sol[0]<=90?sol[0]:null,fn=f==='sen'?Math.sin:f==='cos'?Math.cos:Math.tan;
      return Q(`\\${f==='sen'?'sin':f} x = ${TEX(k)}`,sol,[paso('Ángulo de referencia',`\\(\\${f==='sen'?'sin':f}\\,\\theta_{r} = ${TEX(k.replace('-',''))} \\Rightarrow \\theta_{r} = ${[30,45,60].find(r=>Math.abs((f==='sen'?Math.sin:f==='cos'?Math.cos:Math.tan)(r*RAD)-Math.abs(num(k)))<1e-9)||0}^\\circ\\)`,'Del valor sin signo.'),paso('Cuadrantes con ese signo',k.startsWith('-')?'Negativo':'Positivo','Todas, Seno, Tangente, Coseno.')],
        [[[sol[0]],'Hay dos soluciones por vuelta.'],[sol.map(g=>(g+180)%360),'Revisa en qué cuadrantes tiene ese signo.'],[[Math.abs(Math.round(Math.asin(Math.min(1,Math.abs(num(k))))/RAD))],'Falta usar el signo y el segundo cuadrante.']],rad,()=>sol.every(g=>Math.abs(fn(g*RAD)-num(k))<1e-9))};
    const despejar=()=>{const f=rng.elegir(['sen','cos']),[a,k]=rng.elegir([[2,'1/2'],[2,'-1/2'],[2,'√3/2'],[2,'√2/2']]),b=num(k)*a;const sol=SOL[f][k];const bt=k.includes('√')?k.replace(/\/2$/,'').replace('√','\\sqrt{')+(k.includes('√')?'}':''):String(b);
      return Q(`${a}\\${f==='sen'?'sin':f} x ${b<0?'+':'-'} ${k.includes('√')?k.replace('-','').replace(/\/2$/,'').replace(/√(\d+)/,'\\sqrt{$1}'):Math.abs(b)} = 0`,sol,[paso('Despeja la función',`\\(\\${f==='sen'?'sin':f} x = ${TEX(k)}\\)`,'Pasa el número y divide.'),paso('Referencia y cuadrantes',`\\(${sol.map(g=>g+'^\\circ').join(',\\ ')}\\)`,'Dos por vuelta.')],[[[sol[0]],'Hay dos soluciones.'],[sol.map(g=>(360-g)%360),'Revisa el cuadrante del signo.']],false,()=>sol.every(g=>Math.abs(a*(f==='sen'?Math.sin:Math.cos)(g*RAD)-b)<1e-9))};
    const cuadratica=()=>{const tipo=rng.elegir(['sen2','cos2','producto']);
      if(tipo==='sen2')return Q('4\\sin^{2}x = 1',[30,150,210,330],[paso('Despeja',`\\(\\sin x = \\pm\\tfrac{1}{2}\\)`,'Raíz con ±.')],[[[30,150],'También sen x = −1/2.'],[[30],'Hay cuatro soluciones.']],false,()=>[30,150,210,330].every(g=>Math.abs(4*Math.sin(g*RAD)**2-1)<1e-9));
      if(tipo==='cos2')return Q('2\\cos^{2}x - 1 = 0',[45,135,225,315],[paso('Despeja',`\\(\\cos x = \\pm\\tfrac{\\sqrt{2}}{2}\\)`,'Raíz con ±.')],[[[45,315],'También cos x = −√2/2.'],[[45],'Hay cuatro soluciones.']],false,()=>[45,135,225,315].every(g=>Math.abs(2*Math.cos(g*RAD)**2-1)<1e-9));
      return Q('\\sin x\\cos x = 0',[0,90,180,270],[paso('Producto cero',`\\(\\sin x = 0\\ \\text{o}\\ \\cos x = 0\\)`,'Cada factor.')],[[[0,180],'Falta cos x = 0.'],[[90,270],'Falta sen x = 0.']],false,()=>[0,90,180,270].every(g=>Math.abs(Math.sin(g*RAD)*Math.cos(g*RAD))<1e-9))};
    const factorizable=()=>{const tipo=rng.elegir(['a','b']);if(tipo==='a')return Q('2\\sin^{2}x - \\sin x - 1 = 0',[90,210,330],[paso('Factoriza con u = sen x',`\\((2u + 1)(u - 1) = 0\\)`,'Cuadrática en sen x.'),paso('Cada factor',`\\(\\sin x = 1\\ \\text{o}\\ \\sin x = -\\tfrac{1}{2}\\)`,'Resuelve cada una.')],[[[90],'Falta sen x = −1/2.'],[[210,330],'Falta sen x = 1.'],[[90,30,150],'sen x = −1/2 está en III y IV.']],false,()=>[90,210,330].every(g=>Math.abs(2*Math.sin(g*RAD)**2-Math.sin(g*RAD)-1)<1e-9));
      return Q('2\\cos^{2}x + \\cos x - 1 = 0',[60,180,300],[paso('Factoriza con u = cos x',`\\((2u - 1)(u + 1) = 0\\)`,'Cuadrática en cos x.'),paso('Cada factor',`\\(\\cos x = \\tfrac{1}{2}\\ \\text{o}\\ \\cos x = -1\\)`,'Resuelve cada una.')],[[[60,300],'Falta cos x = −1.'],[[180],'Falta cos x = 1/2.'],[[60,120,180],'cos x = 1/2 está en I y IV.']],false,()=>[60,180,300].every(g=>Math.abs(2*Math.cos(g*RAD)**2+Math.cos(g*RAD)-1)<1e-9))};
    const P={
      1:{'seno':()=>simple('sen'),'coseno':()=>simple('cos'),'tangente':()=>simple('tan')},
      2:{'despejar':despejar,'seno':()=>simple('sen'),'tangente':()=>simple('tan')},
      3:{'cuadratica':cuadratica,'despejar':despejar,'coseno':()=>simple('cos')},
      4:{'seno-rad':()=>simple('sen',true),'coseno-rad':()=>simple('cos',true),'cuadratica':cuadratica},
      5:{'factorizable':factorizable,'tangente-rad':()=>simple('tan',true),'cuadratica':cuadratica}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Despeja la función trigonométrica, halla el ángulo de referencia y escribe todas las soluciones de una vuelta según el signo de cada cuadrante.',pista:'Ángulo de referencia + cuadrantes con ese signo.',teclado:'mat',...x};
  }
};

export default {'tri/razones':razones,'tri/circulo':circulo,'tri/identidades':identidades,'tri/ecuaciones':ecuaciones};
