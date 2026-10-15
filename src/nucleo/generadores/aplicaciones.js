/* Problemas de APLICACIÓN de Matemáticas (con contexto) y escenarios de varias preguntas. Se usan en "🎯 Retos y escenarios"
   (retos.js); no son nodos del camino. Cada generador tiene 3 contextos (plantillas) en cada nivel y comprobar(). Sin DOM. */
import {num,casi,igualNum,lista,equivalente,limpiar} from './verificar.js';
import {lineal,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt,sg} from './algebra-temas.js';

const dinero=v=>`$${Number.isInteger(v)?v:v.toFixed(2)}`;
const igualTol=(tol)=>(e,v)=>{const x=num(String(e).replace(/[$\s]|años?|horas?|metros?|m\b|s\b|segundos?|unidades|gb/gi,''));return Number.isFinite(x)&&Math.abs(x-v)<=tol*Math.max(1,Math.abs(v))};
const sinUnidades=e=>String(e).replace(/[$]|\b(años?|horas?|metros?|segundos?|unidades|gb|boletos?|cafés?|panes?|monedas?|km|visitas?|meses)\b/gi,'');

/* ---------- Comparar planes (ecuación y desigualdad lineal) ---------- */
const CTX_PLAN={
  telefonia:{u:'GB',uno:'GB',cuantos:'cuántos GB',A:'Plan Básico',B:'Plan Plus',elA:'el Plan Básico',elB:'el Plan Plus'},
  gimnasio:{u:'visitas',uno:'visita',cuantos:'cuántas visitas',A:'Pago por visita',B:'Membresía',elA:'el pago por visita',elB:'la membresía'},
  taxi:{u:'km',uno:'km',cuantos:'cuántos km',A:'Taxi A',B:'Taxi B',elA:'el taxi A',elB:'el taxi B'}
};
const planes={
  titulo:'Comparar planes',profundidad:()=> 'aplicacion',
  alternativa:'Escribe el costo de cada plan como "fijo + precio por unidad × unidades". Donde los dos costos son iguales está el punto de quiebre: antes conviene uno y después el otro.',
  generar(n,rng){
    const ps={};
    for(const [k,t] of Object.entries(CTX_PLAN))ps[k]=()=>{
      const dec=n>=4;let F1,F2,p1,p2,x0;
      do{F1=rng.entero(0,4)*5;F2=F1+rng.entero(2,10)*5;p1=dec?rng.entero(4,16)/2:rng.entero(3,9);p2=dec?rng.entero(1,Math.max(1,p1*2-2))/2:rng.entero(1,p1-1);x0=(F2-F1)/(p1-p2)}
      while(p2>=p1||(n<=3&&!Number.isInteger(x0))||(n>=4&&Number.isInteger(x0))||x0>60);
      const A=x=>F1+p1*x,B=x=>F2+p2*x;
      const ctx=`<b>${t.A}</b>: ${dinero(F1)} fijos + ${dinero(p1)} por ${t.uno}. <b>${t.B}</b>: ${dinero(F2)} fijos + ${dinero(p2)} por ${t.uno}.`;
      const reglaP='Costo = fijo + precio × unidades. Iguala los dos costos para encontrar el punto donde da lo mismo.';
      if(n===1){const x=rng.entero(3,20),v=A(x);return {enunciado:`${ctx}<br>¿Cuánto pagas con ${t.elA} si usas ${x} ${t.u}?`,v,resp:dinero(v).slice(1),regla:reglaP,
        pasos:[paso('Escribe el costo',`\\(C = ${F1} + ${p1}\\cdot ${x}\\)`,'Fijo más precio por unidad por unidades.'),final('Calcula',`\\(C = ${c(v)}\\)`,'Primero multiplica.',numTxt(v))],
        errores:[malNum(F1+p1+x,'El precio se multiplica por las unidades.'),malNum(p1*x,'Falta el cargo fijo.'),malNum(B(x),'Ese es el costo del otro plan.')],comprobar:()=>v===F1+p1*x}}
      if(n===2||n===4){const v=x0;return {enunciado:`${ctx}<br>¿Con ${t.cuantos} cuestan lo mismo las dos opciones?${n===4?' (puede tener decimales)':''}`,v,resp:numTxt(v),regla:reglaP,
        pasos:[paso('Plantea la igualdad',`\\(${F1} + ${p1}x = ${F2} + ${p2}x\\)`,'Costo del primero = costo del segundo.'),paso('Junta las x',`\\(${+(p1-p2).toFixed(2)}x = ${F2-F1}\\)`,'x a un lado, números al otro.'),final('Despeja',`\\(x = ${c(numTxt(v).includes('/')?frac(F2-F1,p1-p2):+v.toFixed(2))}\\)`,'Ese es el punto de quiebre.',numTxt(v))],
        errores:[malNum((F2-F1)/(p1+p2),'Al pasar '+p2+'x al otro lado se resta: '+p1+' − '+p2+'.'),malNum((F2+F1)/(p1-p2),'Los fijos también se restan.'),malNum(F2-F1,'Falta dividir entre la diferencia de precios.')],comprobar:()=>casi(A(v),B(v))}}
      if(n===3){const m=Number.isInteger(x0)?x0+1:Math.ceil(x0);return {enunciado:`${ctx}<br>¿A partir de ${t.cuantos} (número entero) <b>conviene más</b> ${t.elB}?`,v:m,resp:String(m),regla:'Para "más barato que", plantea una desigualdad; el primer entero que la cumple es la respuesta.',
        pasos:[paso('Plantea la desigualdad',`\\(${F2} + ${p2}x \\lt ${F1} + ${p1}x\\)`,`${t.B} cuesta menos que ${t.A}.`),paso('Despeja',`\\(x \\gt ${numTxt(x0)}\\)`,'Igual que una ecuación (dividimos entre un positivo).'),final('Primer entero que cumple',`\\(x = ${c(m)}\\)`,Number.isInteger(x0)?`Con ${x0} cuestan lo mismo; con ${m} ya es más barato.`:'El siguiente entero.',String(m))],
        errores:[malNum(Number.isInteger(x0)?x0:Math.floor(x0),Number.isInteger(x0)?`Con ${x0} cuestan exactamente lo mismo: todavía no es más barato.`:'Ese entero aún no cumple la desigualdad.'),malNum(m+1,'Revisa: con '+m+' ya es más barato.'),malNum(F2-F1,'Divide entre la diferencia de precios.')],comprobar:()=>B(m)<A(m)&&!(B(m-1)<A(m-1))}}
      const x=rng.entero(Math.ceil(x0)+2,Math.ceil(x0)+20),ah=A(x)-B(x);return {enunciado:`${ctx}<br>Si usas ${x} ${t.u}, ¿cuánto ahorras con la opción más conveniente?`,v:ah,resp:numTxt(+ah.toFixed(2)),regla:reglaP,
        pasos:[paso('Costo de cada plan',`\\(${t.A.replace(/ /g,'\\ ')}: ${F1} + ${p1}\\cdot${x} = ${A(x)}\\);&nbsp; \\(${t.B.replace(/ /g,'\\ ')}: ${F2} + ${p2}\\cdot${x} = ${B(x)}\\)`,'Evalúa cada plan.'),final('Diferencia',`\\(${A(x)} - ${B(x)} = ${c(+ah.toFixed(2))}\\)`,'El ahorro es la diferencia.',numTxt(+ah.toFixed(2)))],
        errores:[malNum(B(x),'Ese es el costo, no el ahorro.'),malNum((p1-p2)*x,'También cuentan los cargos fijos.'),malNum(A(x)+B(x),'El ahorro es la resta.')],comprobar:()=>casi(ah,(F1+p1*x)-(F2+p2*x))&&ah>0}
    };
    const x=plantillas(rng,ps);
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualTol(1e-3)(sinUnidades(e),x.v),pasos:x.pasos,errores:x.errores,regla:x.regla,
      pista:'Escribe el costo de cada plan como fijo + precio × unidades.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Boletos y mezclas (sistema 2×2) ---------- */
const CTX_BOL={
  cine:{a:'boletos de adulto',b:'boletos de niño',tot:'boletos',lugar:'Un cine vendió',cuantos:'Cuántos'},
  cafeteria:{a:'cafés',b:'panes',tot:'productos',lugar:'Una cafetería vendió',cuantos:'Cuántos'},
  monedas:{a:'monedas de $10',b:'monedas de $5',tot:'monedas',lugar:'Una alcancía tiene',cuantos:'Cuántas'}
};
const boletos={
  titulo:'Boletos y mezclas',profundidad:()=> 'aplicacion',
  alternativa:'Dos datos, dos incógnitas: "cuántos hay en total" da x + y = N y "cuánto suman" da precio·x + precio·y = total. Resuelve el sistema.',
  generar(n,rng){
    const ps={};
    for(const [k,t] of Object.entries(CTX_BOL))ps[k]=()=>{
      let pa,pb;if(k==='monedas'){pa=10;pb=5}else{pa=n>=5?rng.entero(9,25)+0.5:rng.entero(4,15);do pb=n>=5?rng.entero(3,12)+0.5:rng.entero(2,10);while(pb>=pa)}
      const X=rng.entero(n<=2?3:10,n<=2?20:120),Y=rng.entero(n<=2?3:10,n<=2?20:150),N=X+Y,Tot=pa*X+pb*Y,pide=n%2===1?'a':'b',v=pide==='a'?X:Y;
      const enunciado=`${t.lugar} ${N} ${t.tot} en total${k==='monedas'?` que suman ${dinero(Tot)}`:`: los ${t.a} cuestan ${dinero(pa)} y los ${t.b}, ${dinero(pb)}. En total juntó ${dinero(Tot)}`}. ¿${t.cuantos} ${t[pide]} ${k==='monedas'?'hay':'se vendieron'}?`;
      return {enunciado,v,resp:String(v),
        pasos:[paso('Plantea el sistema',`\\(\\begin{cases} x + y = ${N} \\\\ ${pa}x + ${pb}y = ${Tot} \\end{cases}\\)`,`x = ${t.a}, y = ${t.b}.`),
          paso('Sustituye y = '+N+' − x',`\\(${pa}x + ${pb}(${N} - x) = ${Tot} \\Rightarrow ${+(pa-pb).toFixed(2)}x = ${+(Tot-pb*N).toFixed(2)}\\)`,'Despeja una letra de la primera ecuación.'),
          final('Resuelve',`\\(x = ${X},\\ y = ${Y}\\ \\Rightarrow\\ ${c(v)}\\)`,'Comprueba: los dos datos se cumplen.',String(v))],
        errores:[malNum(pide==='a'?Y:X,'Intercambiaste: esa es la otra cantidad.'),malNum(Math.round(Tot/(pa+pb)),'No se reparte el total entre la suma de precios: plantea un sistema.'),malNum(N-v+1,'Revisa la resta al sustituir.')],
        comprobar:()=>X+Y===N&&casi(pa*X+pb*Y,Tot)};
    };
    const x=plantillas(rng,ps);
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(sinUnidades(e),x.v),pasos:x.pasos,errores:x.errores,
      regla:'Con dos incógnitas necesitas dos ecuaciones: una con las cantidades y otra con los valores. Resuelve por sustitución o eliminación.',pista:'x + y = total de cosas; precio·x + precio·y = total de dinero.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Áreas y movimiento (ecuación cuadrática) ---------- */
const areas={
  titulo:'Problemas con cuadráticas',profundidad:()=> 'aplicacion',
  alternativa:'Cuando una medida depende de otra ("el largo es 3 más que el ancho") y te dan un área, multiplicar da x²: es una cuadrática. Resuelve y quédate con la solución que tiene sentido (una longitud no es negativa).',
  generar(n,rng){
    const ps={
      terreno:()=>{const w=rng.entero(n<=2?3:5,n<=2?12:30),k=rng.entero(1,n<=3?8:15),A=w*(w+k);
        return {enunciado:`Un terreno rectangular mide ${k} m más de largo que de ancho y su área es ${A} m². ¿Cuánto mide de ancho?`,v:w,resp:String(w),
          pasos:[paso('Plantea',`\\(x(x + ${k}) = ${A} \\Rightarrow x^{2} + ${k}x - ${A} = 0\\)`,'Ancho x, largo x + '+k+'.'),paso('Factoriza',`\\((x - ${w})(x + ${w+k}) = 0\\)`,'Dos números que multiplican −'+A+' y suman '+k+'.'),final('Elige la solución con sentido',`\\(x = ${c(w)}\\) (la otra, \\(-${w+k}\\), es negativa)`,'Una longitud no puede ser negativa.',String(w))],
          errores:[malNum(w+k,'Ese es el largo.'),malNum(-(w+k),'Una longitud no puede ser negativa.'),malNum(Math.round(Math.sqrt(A)),'No es la raíz del área: los lados no son iguales.')],comprobar:()=>w*(w+k)===A}},
      marco:()=>{const L=rng.entero(4,n<=3?12:20),W=rng.entero(3,L),m=rng.entero(1,n<=3?3:6),A=(L+2*m)*(W+2*m);
        return {enunciado:`Una foto de ${L} cm × ${W} cm lleva un marco del mismo ancho en todos los lados. Con el marco, el área total es ${A} cm². ¿Cuánto mide el ancho del marco?`,v:m,resp:String(m),
          pasos:[paso('Plantea',`\\((${L} + 2x)(${W} + 2x) = ${A}\\)`,'El marco agrega x en cada lado: 2x en cada medida.'),paso('Desarrolla e iguala a cero',`\\(4x^{2} + ${2*(L+W)}x + ${L*W-A} = 0\\)`,'Producto de binomios.'),final('Resuelve y elige la positiva',`\\(x = ${c(m)}\\)`,'La otra solución es negativa.',String(m))],
          errores:[malNum(2*m,'2x es lo que crece cada medida; el ancho del marco es x.'),malNum(+((A-L*W)/(2*(L+W))).toFixed(2),'No olvides el término 4x².'),malNum(+(Math.sqrt(A)-Math.sqrt(L*W)).toFixed(2),'Plantea la ecuación con (L + 2x)(W + 2x).')],comprobar:()=>(L+2*m)*(W+2*m)===A}},
      pelota:()=>{const v0=rng.entero(2,n<=3?6:9)*5,h0=n>=4?rng.entero(1,4)*5:0;// h(t) = −5t² + v0 t + h0
        const t=h0===0?v0/5:(v0+Math.sqrt(v0*v0+20*h0))/10;
        return {enunciado:`Se lanza una pelota hacia arriba${h0?` desde ${h0} m de altura`:''}; su altura es \\(h(t) = -5t^{2} + ${v0}t${h0?` + ${h0}`:''}\\) (metros, t en segundos). ¿Cuándo llega al suelo?${h0?' (2 decimales)':''}`,v:t,resp:h0?t.toFixed(2):numTxt(t),tol:h0?0.006:1e-6,
          pasos:[paso('En el suelo, h = 0',`\\(-5t^{2} + ${v0}t${h0?` + ${h0}`:''} = 0\\)`,'Resuelve la ecuación.'),h0?paso('Fórmula general',`\\(t = \\dfrac{-${v0} \\pm \\sqrt{${v0*v0} + ${20*h0}}}{-10}\\)`,'a = −5, b = '+v0+', c = '+h0+'.'):paso('Factor común',`\\(t(-5t + ${v0}) = 0\\)`,'t = 0 es el momento del lanzamiento.'),final('La solución positiva (después de lanzar)',`\\(t \\approx ${c(+t.toFixed(2))}\\) s`,'El tiempo negativo no tiene sentido.',h0?t.toFixed(2):numTxt(t))],
          errores:[malNum(h0?+((v0-Math.sqrt(v0*v0+20*h0))/10).toFixed(2):0,h0?'Esa solución es negativa: no tiene sentido.':'t = 0 es cuando se lanza.'),malNum(+(v0/10).toFixed(2),'Ese es el momento de la altura máxima, no cuando cae.'),malNum(v0/5+1,'Revisa el despeje.')],comprobar:()=>Math.abs(-5*t*t+v0*t+h0)<1e-6&&t>0}}
    };
    const x=plantillas(rng,ps),tol=x.tol||1e-6;
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>{const v=num(sinUnidades(e).replace(/cm|s\b/g,''));return Number.isFinite(v)&&Math.abs(v-x.v)<=tol*Math.max(1,Math.abs(x.v))},pasos:x.pasos,errores:x.errores,
      regla:'Plantea la ecuación con lo que dice el problema, iguala a cero y resuelve; descarta las soluciones que no tienen sentido (negativas en longitudes o tiempos).',pista:'Llama x a la medida que te piden y escribe las demás en función de x.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Crecimiento y decrecimiento (exponenciales y logaritmos) ---------- */
const crecimiento={
  titulo:'Crecimiento exponencial',profundidad:()=> 'aplicacion',
  alternativa:'Si algo se multiplica siempre por el mismo número en cada periodo (se duplica, crece 5 %), el valor después de t periodos es inicial × factorᵗ. Para despejar t, usa logaritmos.',
  generar(n,rng){
    const ps={
      bacterias:()=>{const d=rng.entero(1,6),N0=rng.elegir([100,200,500,1000]),k=rng.entero(n<=2?2:4,n<=2?5:10),N=N0*2**k;
        if(n<=3)return {enunciado:`Un cultivo empieza con ${N0} bacterias y se duplica cada ${d===1?'hora':d+' h'}. ¿En cuántas horas llega a ${N}?`,v:k*d,resp:String(k*d),
          pasos:[paso('Plantea',`\\(${N0}\\cdot 2^{t/${d}} = ${N}\\ \\Rightarrow\\ 2^{t/${d}} = ${2**k}\\)`,'Se multiplica por 2 en cada periodo de '+d+' h.'),paso('Exponente',`\\(\\dfrac{t}{${d}} = \\log_{2} ${2**k} = ${k}\\)`,k+' duplicaciones.'),final('Despeja t',`\\(t = ${c(k*d)}\\) h`,'Multiplica por la duración de cada periodo.',String(k*d))],
          errores:[malNum(k,'Esas son las duplicaciones: multiplica por '+d+' h.'),malNum(N/N0*d/2,'No es proporcional: cuenta duplicaciones.'),malNum((k+1)*d,'Revisa cuántas veces se duplica: 2^'+k+' = '+2**k+'.')],comprobar:()=>N0*Math.pow(2,k*d/d)===N}
        const meta=rng.elegir([3,5,10,20]),t=d*Math.log2(meta);return {enunciado:`Un cultivo se duplica cada ${d===1?'hora':d+' h'}. ¿Cuántas horas tarda en multiplicarse por ${meta}? (2 decimales)`,v:t,resp:t.toFixed(2),tol:0.006,
          pasos:[paso('Plantea',`\\(2^{t/${d}} = ${meta}\\)`,'Factor de crecimiento.'),paso('Aplica logaritmo',`\\(\\dfrac{t}{${d}} = \\dfrac{\\ln ${meta}}{\\ln 2} \\approx ${Math.log2(meta).toFixed(3)}\\)`,'log₂ '+meta+' no es entero: usa ln.'),final('Despeja',`\\(t \\approx ${c(t.toFixed(2))}\\) h`,'Multiplica por '+d+'.',t.toFixed(2))],
          errores:[malNum(+(meta*d/2).toFixed(2),'No es proporcional: usa logaritmos.'),malNum(+Math.log2(meta).toFixed(2),'Falta multiplicar por '+d+' h.'),malNum(+(d*Math.log10(meta)).toFixed(2),'Es log en base 2 (ln '+meta+' / ln 2).')],comprobar:()=>Math.abs(Math.pow(2,t/d)-meta)<1e-9}},
      interes:()=>{const C=rng.elegir([1000,2000,5000,10000]),r=rng.elegir([3,4,5,6,8,10]),t=rng.entero(n<=2?1:3,n<=2?2:n<=3?5:10);
        if(n<=3){const v=C*Math.pow(1+r/100,t);return {enunciado:`Inviertes ${dinero(C)} al ${r} % anual con interés compuesto. ¿Cuánto tendrás en ${t} año${t>1?'s':''}? (2 decimales)`,v,resp:v.toFixed(2),tol:0.0005,
          pasos:[paso('Fórmula',`\\(M = C(1 + r)^{t} = ${C}(1 + ${r/100})^{${t}}\\)`,'Cada año se multiplica por 1 + r.'),final('Calcula',`\\(M \\approx ${c(v.toFixed(2))}\\)`,'Potencia y luego multiplica.',v.toFixed(2))],
          errores:[malNum(+(C*(1+r*t/100)).toFixed(2),'Eso es interés simple; el compuesto se multiplica cada año.'),malNum(+(C*r/100*t).toFixed(2),'Ese es solo el interés (simple), no el monto.'),malNum(+(C*Math.pow(1+r,t)).toFixed(2),'El '+r+' % es '+r/100+', no '+r+'.')],comprobar:()=>casi(v,C*Math.pow(1+r/100,t))}}
        const v=Math.log(2)/Math.log(1+r/100);return {enunciado:`Inviertes dinero al ${r} % anual con interés compuesto. ¿En cuántos años se duplica? (2 decimales)`,v,resp:v.toFixed(2),tol:0.006,
          pasos:[paso('Plantea',`\\((1 + ${r/100})^{t} = 2\\)`,'Duplicar: el monto es 2 veces el capital.'),paso('Aplica ln',`\\(t = \\dfrac{\\ln 2}{\\ln ${1+r/100}}\\)`,'ln(aᵗ) = t·ln a.'),final('Calcula',`\\(t \\approx ${c(v.toFixed(2))}\\) años`,'Regla del 72: aprox. 72/'+r+' = '+(72/r).toFixed(1)+'.',v.toFixed(2))],
          errores:[malNum(+(100/r).toFixed(2),'Eso sería con interés simple.'),malNum(+(2/(r/100)).toFixed(2),'Usa logaritmos: el crecimiento es exponencial.'),malNum(+(Math.log10(2)/(r/100)).toFixed(2),'Divide entre ln(1 + r), no entre r.')],comprobar:()=>Math.abs(Math.pow(1+r/100,v)-2)<1e-9}},
      depreciacion:()=>{const V=rng.elegir([10000,20000,30000,50000]),p=rng.elegir([10,15,20,25]),t=rng.entero(2,n<=3?4:8);
        if(n<=3){const v=V*Math.pow(1-p/100,t);return {enunciado:`Un auto de ${dinero(V)} pierde el ${p} % de su valor cada año. ¿Cuánto vale después de ${t} años? (2 decimales)`,v,resp:v.toFixed(2),tol:0.0005,
          pasos:[paso('Cada año queda el '+(100-p)+' %',`\\(V = ${V}\\cdot ${1-p/100}^{${t}}\\)`,'Multiplica por 1 − '+p/100+' cada año.'),final('Calcula',`\\(V \\approx ${c(v.toFixed(2))}\\)`,'Potencia y luego multiplica.',v.toFixed(2))],
          errores:[malNum(+(V*(1-p*t/100)).toFixed(2),'No se resta '+p+' % del valor inicial cada año: se calcula sobre el valor de ese año.'),malNum(+(V*Math.pow(p/100,t)).toFixed(2),'Lo que queda es el '+(100-p)+' %, no el '+p+' %.'),malNum(+(V*Math.pow(1-p/100,t-1)).toFixed(2),'Son '+t+' años: '+t+' multiplicaciones.')],comprobar:()=>casi(v,V*Math.pow(1-p/100,t))}}
        const v=Math.ceil(Math.log(0.5)/Math.log(1-p/100));return {enunciado:`Un equipo pierde el ${p} % de su valor cada año. ¿Después de cuántos años completos vale <b>menos de la mitad</b>?`,v,resp:String(v),
          pasos:[paso('Plantea',`\\(${1-p/100}^{t} \\lt 0.5\\)`,'Lo que queda después de t años.'),paso('Aplica logaritmos',`\\(t \\gt \\dfrac{\\ln 0.5}{\\ln ${1-p/100}} \\approx ${(Math.log(0.5)/Math.log(1-p/100)).toFixed(2)}\\)`,'Al dividir entre un ln negativo, el signo se voltea.'),final('Primer entero',`\\(t = ${c(v)}\\) años`,'Años completos.',String(v))],
          errores:[malNum(v-1,'Con '+(v-1)+' años todavía vale más de la mitad.'),malNum(Math.ceil(50/p),'No es lineal: cada año pierde '+p+' % de lo que queda.'),malNum(+(Math.log(0.5)/Math.log(1-p/100)).toFixed(2),'Piden años completos: redondea hacia arriba.')],comprobar:()=>Math.pow(1-p/100,v)<0.5&&Math.pow(1-p/100,v-1)>=0.5}}
    };
    const x=plantillas(rng,ps),tol=x.tol||1e-6;
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>{const v=num(sinUnidades(e).replace(/,(?=\d{3}\b)/g,''));return Number.isFinite(v)&&Math.abs(v-x.v)<=tol*Math.max(1,Math.abs(x.v))},pasos:x.pasos,errores:x.errores,
      regla:'Crecimiento exponencial: valor = inicial × (factor)ᵗ. Para despejar t usa logaritmos: t = ln(cociente) / ln(factor).',pista:'¿Por cuánto se multiplica en cada periodo?',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Escenario: el negocio (varias preguntas con el mismo contexto) ---------- */
export function escenarioNegocio(rng){
  const prod=rng.elegir([['pulseras','pulsera'],['tazas personalizadas','taza'],['cuadernos','cuaderno'],['playeras estampadas','playera']]),F=rng.entero(4,30)*50,cu=rng.entero(3,40),pv=cu+rng.entero(5,30),gan=pv-cu;
  const ctx=`<p class="contexto">Quieres vender <b>${prod[0]}</b>. Pagas ${dinero(F)} al mes de gastos fijos (renta, internet), cada ${prod[1]} te cuesta ${dinero(cu)} hacerla y la vendes en ${dinero(pv)}.</p>`;
  const eq=F/gan,eqE=Math.ceil(F/gan-1e-9)+(Number.isInteger(F/gan)?1:0),meta=rng.entero(2,10)*100,nMeta=Math.ceil((F+meta)/gan),q=rng.entero(Math.ceil(eq)+5,Math.ceil(eq)+80),Gq=gan*q-F;
  const G=`${gan}x - ${F}`;
  const regla='Ganancia = ingresos − costos = (precio − costo unitario)·x − gastos fijos. El punto de equilibrio es donde la ganancia es 0.';
  const base=(enun,resp,verificar,pasos,errores,extra={})=>({enunciado:ctx+enun,respuesta:resp,verificar,pasos,errores,regla,pista:'Ganancia por unidad = precio − costo.',teclado:'mat',tipo:'escribir',...extra});
  const n_=v=>e=>igualNum(sinUnidades(e),v);
  return [
    base(`1/4 · Escribe la ganancia mensual G(x) si vendes x ${prod[0]}.`,`G(x) = ${G}`,e=>equivalente(limpiar(e).replace(/^\s*(g\s*\(\s*x\s*\)|y)\s*=\s*/i,''),G),
      [paso('Ingresos y costos',`\\(I = ${pv}x,\\ C = ${F} + ${cu}x\\)`,'Lo que entra y lo que sale.'),final('Resta',`\\(G(x) = ${pv}x - (${F} + ${cu}x) = ${c(G)}\\)`,'Ganancia = ingresos − costos.',`G(x) = ${G}`)],
      [{valor:`G(x) = ${pv}x - ${F}`,si:e=>equivalente(limpiar(e).replace(/^.*=\s*/,''),`${pv}x - ${F}`),por:'Falta restar el costo de cada '+prod[1]+'.'},{valor:`G(x) = ${gan}x + ${F}`,si:e=>equivalente(limpiar(e).replace(/^.*=\s*/,''),`${gan}x + ${F}`),por:'Los gastos fijos se restan.'},{valor:`G(x) = ${pv+cu}x - ${F}`,si:e=>equivalente(limpiar(e).replace(/^.*=\s*/,''),`${pv+cu}x - ${F}`),por:'El costo unitario se resta del precio.'}]),
    base(`2/4 · ¿Cuántas ${prod[0]} tienes que vender como mínimo para <b>no perder</b> dinero (G ≥ 0)?`,String(Math.ceil(eq-1e-9)),n_(Math.ceil(eq-1e-9)),
      [paso('Plantea',`\\(${G} \\ge 0 \\Rightarrow x \\ge ${numTxt(eq)}\\)`,'Punto de equilibrio.'),final('Primer entero',`\\(x = ${c(Math.ceil(eq-1e-9))}\\)`,'No se venden fracciones.',String(Math.ceil(eq-1e-9)))],
      [malNum(Math.floor(eq-1e-9)===Math.ceil(eq-1e-9)?Math.ceil(eq)-1:Math.floor(eq),'Con ese número todavía pierdes.'),malNum(Math.ceil(F/pv),'Cada venta deja '+gan+' de ganancia, no '+pv+'.'),malNum(F,'Divide los gastos fijos entre la ganancia por unidad.')]),
    base(`3/4 · ¿Cuánto ganas en un mes en que vendes ${q}?`,String(Gq),n_(Gq),
      [paso('Evalúa G',`\\(G(${q}) = ${gan}\\cdot${q} - ${F}\\)`,'Sustituye x.'),final('Calcula',`\\(${c(Gq)}\\)`,'Ganancia del mes.',String(Gq))],
      [malNum(pv*q-F,'Falta restar el costo de cada '+prod[1]+'.'),malNum(gan*q,'Faltan los gastos fijos.'),malNum(pv*q,'Ese es el ingreso, no la ganancia.')]),
    base(`4/4 · Quieres ganar al menos ${dinero(meta)} al mes. ¿Cuántas ${prod[0]} tienes que vender como mínimo?`,String(nMeta),n_(nMeta),
      [paso('Plantea',`\\(${G} \\ge ${meta} \\Rightarrow ${gan}x \\ge ${F+meta}\\)`,'Ganancia mayor o igual a la meta.'),paso('Despeja',`\\(x \\ge ${numTxt((F+meta)/gan)}\\)`,'Divide entre '+gan+'.'),final('Primer entero',`\\(x = ${c(nMeta)}\\)`,'Redondea hacia arriba.',String(nMeta))],
      [malNum(Math.ceil(meta/gan),'También tienes que cubrir los gastos fijos.'),malNum(Math.floor((F+meta)/gan)===nMeta?nMeta-1:Math.floor((F+meta)/gan),'Redondea hacia arriba: con ese número no llegas a la meta.'),malNum(Math.ceil((F+meta)/pv),'La ganancia por unidad es '+gan+'.')])
  ].map(p=>({...p,profundidad:'escenario',comprobar:()=>p.verificar(p.respuesta)}));
}

/* ---------- Movimiento (derivadas): velocidad, cuándo se detiene, altura máxima ---------- */
const movimiento={
  titulo:'Movimiento y derivadas',profundidad:()=> 'aplicacion',
  alternativa:'La posición cambia; su ritmo de cambio es la velocidad (s′) y el ritmo de cambio de la velocidad es la aceleración (s″). Algo se detiene o llega a lo más alto cuando su velocidad es 0.',
  generar(n,rng){
    const ps={
      pelota:()=>{const v0=rng.entero(2,8)*5,h0=n>=3?rng.entero(0,4)*5:0,pide=n===1?'vel':n===2?'cima':n===3?'hmax':n===4?'vel':'hmax',t=rng.entero(1,Math.max(1,Math.floor(v0/10)));
        const s=x=>-5*x*x+v0*x+h0,txt=`Una pelota se lanza hacia arriba${h0?` desde ${h0} m`:''}: su altura es \\(h(t) = -5t^{2} + ${v0}t${h0?` + ${h0}`:''}\\) (m, t en s).`;
        if(pide==='vel'){const v=v0-10*t;return {enunciado:`${txt} ¿Cuál es su velocidad en \\(t = ${t}\\) s (m/s)?`,v,resp:String(v),pasos:[paso('v(t) = h′(t)',`\\(-10t + ${v0}\\)`,'Deriva la altura.'),final('Evalúa',`\\(${c(v)}\\)`,v<0?'Negativa: ya va bajando.':'Positiva: todavía sube.',String(v))],errores:[malNum(s(t),'Esa es la altura.'),malNum(v0-5*t,'(5t²)′ = 10t.'),malNum(-10,'Esa es la aceleración.')].filter(e=>e.valor!==String(v)),comprobar:()=>casi((s(t+1e-6)-s(t-1e-6))/2e-6,v,1e-4)}}
        const tc=v0/10;if(pide==='cima')return {enunciado:`${txt} ¿En qué momento llega a lo más alto (s)?`,v:tc,resp:numTxt(tc),pasos:[paso('Arriba la velocidad es 0',`\\(-10t + ${v0} = 0\\)`,'h′(t) = 0.'),final('Despeja',`\\(t = ${c(numTxt(tc))}\\)`,'Ahí deja de subir.',numTxt(tc))],errores:[malNum(v0/5,'Ese es cuando vuelve al suelo.'),malNum(s(tc),'Esa es la altura máxima.'),malNum(v0,'Divide entre 10.')],comprobar:()=>s(tc)>=s(tc+0.01)&&s(tc)>=s(tc-0.01)};
        const hm=s(tc);return {enunciado:`${txt} ¿Cuál es la altura máxima (m)?`,v:hm,resp:numTxt(hm),pasos:[paso('Momento de la cima',`\\(h'(t) = 0 \\Rightarrow t = ${numTxt(tc)}\\)`,'Velocidad cero.'),final('Evalúa la altura',`\\(h(${numTxt(tc)}) = ${c(numTxt(hm))}\\)`,'Altura máxima.',numTxt(hm))],errores:[malNum(tc,'Ese es el tiempo.'),malNum(v0*tc,'Evalúa toda la función.'),malNum(hm-h0,'Suma la altura inicial.')].filter(e=>Math.abs(num(e.valor)-hm)>1e-9),comprobar:()=>{let m=-Infinity;for(let x=0;x<=v0/5;x+=0.01)m=Math.max(m,s(x));return Math.abs(m-hm)<1e-3}}},
      frenado:()=>{const v0=rng.elegir([10,20,30,40]),a=rng.elegir([2,4,5]),tS=v0/a,d=v0*tS-a*tS*tS/2;const pide=n<=2||n===4?'tiempo':'distancia';
        const txt=`Un auto frena: su posición es \\(s(t) = ${v0}t - ${numTxt(a/2)}t^{2}\\) (m, t en s).`;
        if(pide==='tiempo')return {enunciado:`${txt} ¿Cuántos segundos tarda en detenerse?`,v:tS,resp:numTxt(tS),pasos:[paso('v(t) = s′(t)',`\\(${v0} - ${a}t\\)`,'Derivada.'),final('Se detiene: v = 0',`\\(t = ${c(numTxt(tS))}\\)`,'Despeja.',numTxt(tS))],errores:[malNum(d,'Esa es la distancia.'),malNum(v0/(a/2),'(kt²)′ = 2kt.'),malNum(v0,'Divide entre la desaceleración.')],comprobar:()=>casi(v0-a*tS,0)};
        return {enunciado:`${txt} ¿Qué distancia recorre hasta detenerse (m)?`,v:d,resp:numTxt(d),pasos:[paso('Se detiene cuando v = 0',`\\(${v0} - ${a}t = 0 \\Rightarrow t = ${numTxt(tS)}\\)`,'Derivada = 0.'),final('Posición en ese momento',`\\(s(${numTxt(tS)}) = ${c(numTxt(d))}\\)`,'Distancia de frenado.',numTxt(d))],errores:[malNum(tS,'Ese es el tiempo.'),malNum(v0*tS,'Falta restar el término del frenado.'),malNum(2*d,'Revisa: s(t) = v₀t − (a/2)t².')],comprobar:()=>casi(d,v0*v0/(2*a))}},
      cohete:()=>{const k=rng.elegir([1,2]),t=rng.entero(1,4),pide=n<=2?'vel':n<=4?'acel':'vel',s=x=>k*x**3+2*x*x,v=3*k*t*t+4*t,ac=6*k*t+4;
        const txt=`Un cohete de juguete sube con altura \\(s(t) = ${k===1?'':k}t^{3} + 2t^{2}\\) (m) en los primeros segundos.`;
        if(pide==='acel')return {enunciado:`${txt} ¿Cuál es su aceleración en \\(t = ${t}\\) s (m/s²)?`,v:ac,resp:String(ac),pasos:[paso('v = s′',`\\(${3*k}t^{2} + 4t\\)`,'Primera derivada.'),paso('a = v′ = s″',`\\(${6*k}t + 4\\)`,'Segunda derivada.'),final('Evalúa',`\\(${c(ac)}\\)`,'m/s².',String(ac))],errores:[malNum(v,'Esa es la velocidad.'),malNum(s(t),'Esa es la altura.'),malNum(6*k*t,'Falta el 4.')].filter(e=>e.valor!==String(ac)),comprobar:()=>casi((s(t+1e-3)-2*s(t)+s(t-1e-3))/1e-6,ac,1e-2)};
        return {enunciado:`${txt} ¿Qué velocidad lleva en \\(t = ${t}\\) s (m/s)?`,v,resp:String(v),pasos:[paso('v = s′',`\\(${3*k}t^{2} + 4t\\)`,'Deriva.'),final('Evalúa',`\\(${c(v)}\\)`,'m/s.',String(v))],errores:[malNum(s(t),'Esa es la altura.'),malNum(ac,'Esa es la aceleración.'),malNum(3*k*t*t,'Falta el término 4t.')].filter(e=>e.valor!==String(v)),comprobar:()=>casi((s(t+1e-6)-s(t-1e-6))/2e-6,v,1e-4)}}
    };
    const x=plantillas(rng,ps);
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(String(e).replace(/\s*(m\/s²|m\/s|m|s)\s*$/,''),x.v),pasos:x.pasos,errores:x.errores,
      regla:'Velocidad = s′(t), aceleración = s″(t); se detiene o llega a lo más alto cuando la velocidad es 0.',pista:'Deriva la posición.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Escenario: el cohete de agua (cálculo diferencial) ---------- */
export function escenarioCohete(rng){
  const v0=rng.entero(3,8)*10,h0=rng.entero(1,4)*5,h=t=>-5*t*t+v0*t+h0,tc=v0/10,hm=h(tc),tf=(v0+Math.sqrt(v0*v0+20*h0))/10;
  const ctx=`<p class="contexto">En la feria de ciencias lanzas un cohete de agua desde un techo de ${h0} m. Su altura es \\(h(t) = -5t^{2} + ${v0}t + ${h0}\\) (m, t en segundos).</p>`;
  const regla='Velocidad = h′(t); en lo más alto h′ = 0; toca el suelo cuando h = 0.';
  const q=(enun,v,txt,pasos,errores,tol=1e-6)=>({tipo:'escribir',enunciado:ctx+enun,respuesta:txt,verificar:e=>{const x=num(String(e).replace(/\s*(m\/s|m|s)\s*$/,''));return Number.isFinite(x)&&Math.abs(x-v)<=tol*Math.max(1,Math.abs(v))},pasos,errores,regla,pista:'Deriva la altura.',teclado:'mat',profundidad:'escenario'});
  return [
    q('1/4 · ¿Con qué velocidad sale el cohete (m/s)?',v0,String(v0),[paso('v(t) = h′(t)',`\\(-10t + ${v0}\\)`,'Deriva.'),final('En t = 0',`\\(${c(v0)}\\)`,'Velocidad inicial.',String(v0))],[malNum(h0,'Esa es la altura inicial.'),malNum(-10,'Esa es la aceleración.'),malNum(v0/10,'Evalúa en t = 0.')]),
    q('2/4 · ¿En qué momento llega a lo más alto (s)?',tc,numTxt(tc),[paso('h′(t) = 0',`\\(-10t + ${v0} = 0\\)`,'Velocidad cero.'),final('Despeja',`\\(t = ${c(numTxt(tc))}\\)`,'Cima.',numTxt(tc))],[malNum(v0/5,'Divide entre 10.'),malNum(hm,'Esa es la altura máxima.'),malNum(+tf.toFixed(2),'Ese es cuando cae.')]),
    q('3/4 · ¿Qué altura máxima alcanza (m)?',hm,numTxt(hm),[paso('Evalúa en la cima',`\\(h(${numTxt(tc)})\\)`,'Sustituye.'),final('Resultado',`\\(${c(numTxt(hm))}\\)`,'Altura máxima.',numTxt(hm))],[malNum(hm-h0,'Suma la altura del techo.'),malNum(tc,'Ese es el tiempo.'),malNum(v0*tc,'Evalúa toda la función.')]),
    q('4/4 · ¿Cuándo toca el suelo (s, 2 decimales)?',tf,tf.toFixed(2),[paso('h(t) = 0',`\\(-5t^{2} + ${v0}t + ${h0} = 0\\)`,'Cuadrática.'),final('Fórmula general (solución positiva)',`\\(t \\approx ${c(tf.toFixed(2))}\\)`,'La negativa no tiene sentido.',tf.toFixed(2))],[malNum(+(v0/5).toFixed(2),'Eso sería saliendo desde el suelo.'),malNum(+((v0-Math.sqrt(v0*v0+20*h0))/10).toFixed(2),'Esa solución es negativa.'),malNum(tc,'Esa es la cima.')],0.003)
  ].map(p=>({...p,comprobar:()=>p.verificar(p.respuesta)&&Math.abs(h(tf))<1e-6}));
}

/* ---------- Acumulación (integral definida): distancia, agua, costo total ---------- */
const simpsonA=(f,a,b,n=2000)=>{const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3};
const acumulacion={
  titulo:'Acumulación con integrales',profundidad:()=> 'aplicacion',
  alternativa:'Si sabes qué tan rápido cambia algo (velocidad, caudal, costo por unidad), la integral suma esos cambios y te da el total acumulado: distancia recorrida, litros que entraron o costo total.',
  generar(n,rng){
    const ps={
      distancia:()=>{const a=rng.entero(1,4)*(n>=3?1:0),b=rng.entero(2,10),T=rng.entero(2,n<=2?4:6),v=t=>a*t*t+b,tot=a*T**3/3+b*T;
        return {enunciado:`Un ciclista va a \\(v(t) = ${a?`${a===1?'':a}t^{2} + `:''}${b}\\) m/s. ¿Cuántos metros recorre en los primeros ${T} segundos?`,v:tot,resp:numTxt(tot),
          pasos:[paso('Distancia = ∫ velocidad',`\\(\\int_{0}^{${T}} (${a?`${a}t^{2} + `:''}${b})\\,dt\\)`,'La integral de la velocidad es lo recorrido.'),final('Integra y evalúa',`\\(${a?`\\tfrac{${a}t^{3}}{3} + `:''}${b}t\\Big|_{0}^{${T}} = ${c(numTxt(tot))}\\)`,'Metros.',numTxt(tot))],
          errores:[malNum(v(T),'Esa es la velocidad final, no la distancia.'),malNum(v(T)*T,'La velocidad no es constante: integra.'),malNum(a*T*T+b,'Integra, no evalúes.')].filter(e=>Math.abs(num(e.valor)-tot)>1e-9),comprobar:()=>Math.abs(simpsonA(v,0,T)-tot)<1e-6}},
      tanque:()=>{const r0=rng.entero(5,20),k=rng.entero(1,4),T=rng.entero(2,n<=2?5:10),f=t=>r0+k*t,tot=r0*T+k*T*T/2;
        return {enunciado:`A un tanque entra agua a razón de \\(r(t) = ${r0} + ${k===1?'':k}t\\) litros por minuto. ¿Cuántos litros entran en ${T} minutos?`,v:tot,resp:numTxt(tot),
          pasos:[paso('Total = ∫ razón',`\\(\\int_{0}^{${T}} (${r0} + ${k}t)\\,dt\\)`,'Suma de lo que entra cada instante.'),final('Integra',`\\(${r0}t + \\tfrac{${k}t^{2}}{2}\\Big|_{0}^{${T}} = ${c(numTxt(tot))}\\)`,'Litros.',numTxt(tot))],
          errores:[malNum(f(T),'Esa es la razón al final.'),malNum(r0*T,'La razón aumenta: integra el término '+k+'t.'),malNum(f(T)*T,'No es constante.')].filter(e=>Math.abs(num(e.valor)-tot)>1e-9),comprobar:()=>Math.abs(simpsonA(f,0,T)-tot)<1e-6}},
      costo:()=>{const a=rng.entero(1,5),b=rng.entero(5,40),q1=rng.entero(0,10)*10,q2=q1+rng.entero(1,5)*10,m=q=>a*q/10+b,tot=a*(q2*q2-q1*q1)/20+b*(q2-q1);
        return {enunciado:`El costo marginal de producir es \\(C'(q) = ${numTxt(a/10)}q + ${b}\\) pesos por unidad. ¿Cuánto aumenta el costo al pasar de ${q1} a ${q2} unidades?`,v:tot,resp:numTxt(tot),
          pasos:[paso('Aumento = ∫ costo marginal',`\\(\\int_{${q1}}^{${q2}} (${numTxt(a/10)}q + ${b})\\,dq\\)`,'Teorema fundamental: C(q₂) − C(q₁).'),final('Integra',`\\(\\tfrac{${numTxt(a/10)}q^{2}}{2} + ${b}q\\Big|_{${q1}}^{${q2}} = ${c(numTxt(tot))}\\)`,'Pesos.',numTxt(tot))],
          errores:[malNum(m(q2)-m(q1),'Eso es el cambio del marginal, no del costo.'),malNum(m(q2)*(q2-q1),'El marginal no es constante.'),malNum(b*(q2-q1),'Falta el término que crece con q.')].filter(e=>Math.abs(num(e.valor)-tot)>1e-9),comprobar:()=>Math.abs(simpsonA(m,q1,q2)-tot)<1e-6}}
    };
    const x=plantillas(rng,ps);
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(String(e).replace(/\s*(m|litros|l|pesos|\$)\s*$/i,'').replace('$',''),x.v),pasos:x.pasos,errores:x.errores,
      regla:'Total acumulado = ∫ (razón de cambio) dt: la integral de la velocidad es la distancia; la del caudal, el volumen; la del costo marginal, el costo.',pista:'Integra la razón entre los dos instantes.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Escenario: la presa (cálculo integral) ---------- */
export function escenarioPresa(rng){
  const a=rng.entero(2,6),b=rng.entero(10,40),T=rng.entero(4,10),sal=rng.entero(5,15),r=t=>b+a*t,entra=b*T+a*T*T/2,neto=entra-sal*T,tc=(sal-b)/a;
  const ctx=`<p class="contexto">En temporada de lluvias, a una presa le entra agua a razón de \\(r(t) = ${b} + ${a}t\\) miles de m³ por día (t en días) y se sueltan ${sal} mil m³ por día por las compuertas.</p>`;
  const regla='Lo que se acumula es la integral de lo que entra menos lo que sale.';
  const q=(enun,v,txt,pasos,errores)=>({tipo:'escribir',enunciado:ctx+enun,respuesta:txt,verificar:e=>igualNum(e,v),pasos,errores,regla,pista:'Integra la razón de entrada.',teclado:'mat',profundidad:'escenario'});
  return [
    q(`1/3 · ¿Cuánta agua entra (miles de m³) en los primeros ${T} días?`,entra,numTxt(entra),[paso('∫ de la entrada',`\\(\\int_{0}^{${T}} (${b} + ${a}t)\\,dt\\)`,'Total que entra.'),final('Integra',`\\(${b}\\cdot${T} + \\tfrac{${a}\\cdot${T*T}}{2} = ${c(numTxt(entra))}\\)`,'Miles de m³.',numTxt(entra))],[malNum(r(T),'Esa es la razón del último día.'),malNum(b*T,'Falta el término que crece.'),malNum(r(T)*T,'La razón no es constante.')]),
    q(`2/3 · ¿Cuánto aumenta el agua almacenada en esos ${T} días (entra menos sale)?`,neto,numTxt(neto),[paso('Neto = ∫(entra − sale)',`\\(\\int_{0}^{${T}} (${b} + ${a}t - ${sal})\\,dt\\)`,'Lo que se queda.'),final('Integra',`\\(${numTxt(entra)} - ${sal}\\cdot${T} = ${c(numTxt(neto))}\\)`,'Miles de m³.',numTxt(neto))],[malNum(entra,'Resta lo que sale.'),malNum(entra-sal,'Sale '+sal+' cada día: '+sal*T+' en total.'),malNum(sal*T,'Eso es lo que sale.')]),
    q(`3/3 · ¿Cuál es la razón de entrada (miles de m³/día) el día ${T}?`,r(T),String(r(T)),[paso('Evalúa la razón',`\\(r(${T}) = ${b} + ${a}\\cdot${T}\\)`,'No hay que integrar.'),final('Resultado',`\\(${c(r(T))}\\)`,'Razón instantánea.',String(r(T)))],[malNum(entra,'Eso es el total acumulado.'),malNum(r(T)-sal,'Pide solo la entrada.'),malNum(b,'Esa es la del día 0.')])
  ].map(p=>({...p,errores:p.errores.filter(e=>e.valor!==p.respuesta),comprobar:()=>p.verificar(p.respuesta)&&Math.abs(simpsonA(r,0,T)-entra)<1e-6}));
}

export default {'apl/planes':planes,'apl/boletos':boletos,'apl/areas':areas,'apl/crecimiento':crecimiento,'apl/movimiento':movimiento,'apl/acumulacion':acumulacion};
