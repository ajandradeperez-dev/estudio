/* Generadores de ciencia de datos: estadística descriptiva, percentiles, probabilidad, salida de pandas,
   lectura de gráficas (SVG generado) y métricas de clasificación. */
import {num,igualNum,casi,mcd} from './verificar.js';
import {frac} from './formato.js';
import {paso,final,marca,c} from './pasos.js';

const datos=(rng,n,min,max)=>Array.from({length:n},()=>rng.entero(min,max));
const r2=x=>Math.round(x*100)/100;
const ordenar=a=>[...a].sort((x,y)=>x-y);
const media=a=>a.reduce((s,x)=>s+x,0)/a.length;
const mediana=a=>{const o=ordenar(a),k=o.length;return k%2?o[(k-1)/2]:(o[k/2-1]+o[k/2])/2};
const tolerante=v=>e=>Math.abs(num(e)-v)<=0.011*Math.max(1,Math.abs(v)/100);
const lista=a=>a.join(', ');

// Media, mediana y moda
const tendencia={
  titulo:'Tendencia central',
  alternativa:'Imagina repartir dulces. La <b>media</b> es cuántos le tocarían a cada uno si se reparten parejo (junta todo y divide). La <b>mediana</b> es el niño de en medio cuando los formas por estatura. La <b>moda</b> es lo que más se repite, como la talla de zapato más vendida.',
  explicacion:'Media: suma ÷ cantidad. Mediana: el valor del medio con los datos ORDENADOS (si son pares, el promedio de los dos del medio). Moda: el más repetido.',
  generar(n,rng){
    const k=[5,6,7,8,9][n-1],tipo=rng.elegir(n===1?['media','moda']:['media','mediana','moda']);
    let a=datos(rng,k,1,n<=2?20:99);
    if(tipo==='moda'){const m=rng.elegir(a);a[0]=m;a[1]=m;a=rng.barajar(a);const c={};a.forEach(x=>c[x]=(c[x]||0)+1);const max=Math.max(...Object.values(c));if(Object.values(c).filter(x=>x===max).length>1)return tendencia.generar(n,rng)}
    const R='Media = suma ÷ n. Mediana = el valor central con los datos ordenados. Moda = el valor que más se repite.';
    if(tipo==='media'){const v=media(a);return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es la media? <span class="nota">(2 decimales si hace falta)</span>`,respuesta:String(r2(v)),verificar:tolerante(v),
      pasos:[paso('Suma todos los datos',`\\(${a.join(' + ')} = ${c(a.reduce((s,x)=>s+x,0))}\\)`,'La media reparte el total en partes iguales.'),
        paso('Cuenta los datos',`n = ${k}`,'Se divide entre cuántos datos hay.'),
        final('Divide la suma entre n',`\\(\\dfrac{${a.reduce((s,x)=>s+x,0)}}{${k}} = ${c(r2(v))}\\)`,'Media = suma ÷ cantidad.',String(r2(v)))],errores:[{valor:String(mediana(a)),si:e=>igualNum(e,mediana(a))&&!casi(mediana(a),v),por:'Esa es la mediana; la media es la suma dividida entre la cantidad.'}],regla:R,pista:'Suma todo y divide entre la cantidad de datos.'}}
    if(tipo==='mediana'){const v=mediana(a),sinOrdenar=k%2?a[(k-1)/2]:(a[k/2-1]+a[k/2])/2;
      return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es la mediana?`,respuesta:String(v),verificar:e=>igualNum(e,v),
        pasos:[paso('Ordena de menor a mayor',ordenar(a).map((x,i)=>(k%2?i===(k-1)/2:i===k/2-1||i===k/2)?marca(x):x).join(', '),'La mediana es el valor del medio, y solo tiene sentido con los datos ordenados.',{ojo:'No tomes el del medio de la lista original.'}),
          paso('Busca la posición del medio',k%2?`Hay ${k} datos (impar): el del medio está en la posición \\(\\tfrac{${k}+1}{2} = ${(k+1)/2}\\)`:`n = ${k} (par) → posiciones ${k/2} y ${k/2+1}`,k%2?'Con n impar hay un solo dato en el medio.':'Con n par hay dos datos en el medio.'),
          final(k%2?'Ese es la mediana':'Promedia los dos del medio',k%2?`Mediana = <b>${v}</b>`:`\\(\\dfrac{${ordenar(a)[k/2-1]} + ${ordenar(a)[k/2]}}{2} = ${c(v)}\\)`,'La mitad de los datos queda por debajo y la otra mitad por encima.',String(v))],
        errores:[{valor:String(sinOrdenar),si:e=>igualNum(e,sinOrdenar)&&sinOrdenar!==v,por:'Primero hay que ordenar los datos de menor a mayor.'}],regla:R,pista:'Ordénalos primero.'}}
    const fr={};a.forEach(x=>fr[x]=(fr[x]||0)+1);const v=+Object.entries(fr).sort((x,y)=>y[1]-x[1])[0][0];
    return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es la moda?`,respuesta:String(v),verificar:e=>igualNum(e,v),pasos:[paso('Cuenta cuántas veces aparece cada valor',Object.entries(fr).sort((x,y)=>y[1]-x[1]).map(([x,f])=>+x===v?marca(`${x}: ${f}`):`${x}: ${f}`).join(' · '),'Una tabla de frecuencias muestra cuál se repite más.'),
      final('El más repetido',`Moda = <b>${v}</b> (${fr[v]} veces)`,'La moda es el valor con mayor frecuencia.',String(v))],errores:[],regla:R,pista:'¿Cuál se repite más?'};
  }
};

// Rango, varianza y desviación estándar poblacionales
const dispersion={
  titulo:'Rango y desviación estándar',
  alternativa:'La desviación estándar mide <b>qué tan lejos de la media</b> suelen estar los datos. Calificaciones 7, 7, 7 no se alejan nada (desviación 0); 2, 7, 12 se alejan mucho. Se elevan al cuadrado las distancias para que las negativas no cancelen a las positivas, y al final se saca raíz para volver a las unidades originales.',
  explicacion:'Rango = máximo − mínimo. Desviación estándar (poblacional): promedio de las distancias al cuadrado a la media, y luego la raíz.',
  generar(n,rng){
    const R='Rango = máx − mín. Varianza (poblacional) = promedio de (x − media)². Desviación estándar = √varianza.';
    const tipo=n===1?'rango':n===2?rng.elegir(['rango','varianza']):rng.elegir(['rango','varianza','desv']);
    let a;
    // datos con media entera para que las cuentas sean manejables
    do{a=datos(rng,[5,5,6,7,8][n-1],1,n<=3?12:30)}while(!Number.isInteger(media(a)));
    const m=media(a),va=a.reduce((s,x)=>s+(x-m)**2,0)/a.length,sd=Math.sqrt(va);
    if(tipo==='rango'){const v=Math.max(...a)-Math.min(...a);return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es el rango?`,respuesta:String(v),verificar:e=>igualNum(e,v),pasos:[paso('Busca el mayor y el menor',`Máximo ${marca(Math.max(...a))} · mínimo ${marca(Math.min(...a))}`,'El rango mide de dónde a dónde van los datos.'),final('Resta',`${Math.max(...a)} − ${Math.min(...a)} = <b>${v}</b>`,'Rango = máximo − mínimo.',String(v))],errores:[],regla:R,pista:'El mayor menos el menor.'}}
    const sc=a.reduce((s,x)=>s+(x-m)**2,0);
    const tablaD=`<div class="wrap"><table><tr><th>x</th><th>x − media</th><th>(x − media)²</th></tr>${a.map(x=>`<tr><td>${x}</td><td>${x-m}</td><td>${(x-m)**2}</td></tr>`).join('')}<tr><th colspan="2">Suma</th><th>${sc}</th></tr></table></div>`;
    const pasos=[paso('Calcula la media',`\\(\\dfrac{${a.reduce((s,x)=>s+x,0)}}{${a.length}} = ${c(m)}\\)`,'La desviación se mide respecto a la media.'),
      paso('Resta la media a cada dato y eleva al cuadrado',tablaD,'Al elevar al cuadrado, las distancias negativas no cancelan a las positivas.',{ojo:'(−3)² = 9, no −9.'}),
      final('Promedia los cuadrados (varianza)',`\\(\\dfrac{${sc}}{${a.length}} = ${c(r2(va))}\\)`,'La varianza poblacional divide entre n.',String(r2(va)))];
    if(tipo==='desv')delete pasos[2].res;
    if(tipo==='varianza')return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es la varianza poblacional? <span class="nota">(2 decimales)</span>`,respuesta:String(r2(va)),verificar:tolerante(va),pasos,
      errores:[{valor:String(r2(sd)),si:e=>tolerante(sd)(e)&&!casi(sd,va,0.01),por:'Esa es la desviación estándar; la varianza es antes de sacar la raíz.'}],regla:R,pista:'Promedio de las distancias al cuadrado.'};
    return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es la desviación estándar poblacional? <span class="nota">(2 decimales)</span>`,respuesta:String(r2(sd)),verificar:tolerante(sd),pasos:[...pasos,final('Saca la raíz cuadrada',`\\(\\sqrt{${r2(va)}} = ${c(r2(sd))}\\)`,'La raíz devuelve las unidades originales de los datos.',String(r2(sd)))],
      errores:[{valor:String(r2(va)),si:e=>tolerante(va)(e)&&!casi(sd,va,0.01),por:'Falta sacar la raíz: eso es la varianza.'}],regla:R,pista:'Calcula la varianza y saca la raíz.'};
  }
};

// Percentiles por rango más cercano: posición = ⌈p/100 · n⌉ en los datos ordenados
const percentil={
  titulo:'Percentiles',
  alternativa:'Forma a 100 personas por estatura. El percentil 90 es la estatura de la persona número 90: el 90 % mide eso o menos. Con pocos datos haces lo mismo: ordénalos y busca la posición que corresponde al porcentaje (redondeando hacia arriba).',
  explicacion:'Con el método del rango más cercano: ordena los datos y toma el que está en la posición ⌈p·n/100⌉ (redondeando hacia arriba).',
  generar(n,rng){
    const k=[5,8,10,12,15][n-1],a=datos(rng,k,1,99),o=ordenar(a),p=rng.elegir(n<=2?[25,50,75]:[10,20,25,50,75,80,90]),pos=Math.ceil(p*k/100),v=o[pos-1];
    return {enunciado:`Datos: <b>${lista(a)}</b>. ¿Cuál es el percentil ${p}? <span class="nota">(rango más cercano)</span>`,respuesta:String(v),verificar:e=>igualNum(e,v),
      pasos:[paso('Ordena de menor a mayor',o.map((x,i)=>i===pos-1?marca(x):x).join(', '),'El percentil se cuenta con los datos ordenados.',{ojo:'No uses el orden original.'}),
        paso('Calcula la posición',`\\(\\left\\lceil \\dfrac{${p}\\cdot ${k}}{100} \\right\\rceil = \\lceil ${r2(p*k/100)} \\rceil = ${c(pos)}\\)`,'Se redondea hacia arriba (rango más cercano).'),
        final(`Toma el dato número ${pos}`,`P${p} = <b>${v}</b>`,`El ${p} % de los datos es menor o igual a ese valor.`,String(v))],
      errores:[{valor:String(a[pos-1]),si:e=>igualNum(e,a[pos-1])&&a[pos-1]!==v,por:'Primero hay que ordenar los datos.'}],
      regla:'Percentil p (rango más cercano): ordena y toma el dato en la posición ⌈p·n/100⌉. P25 = Q1, P50 = mediana, P75 = Q3.',pista:'Ordena y calcula la posición.'};
  }
};

// Probabilidad básica: dados, cartas y urnas
const probBasica={
  titulo:'Probabilidad básica',
  alternativa:'Probabilidad es <b>cuántas de las opciones te sirven</b> entre todas las posibles. En un dado hay 6 caras; si te sirven los pares (2, 4, 6), te sirven 3 de 6: 3/6 = 1/2. Siempre: lo que quieres ÷ todo lo que puede pasar.',
  explicacion:'P(suceso) = casos favorables ÷ casos posibles, si todos son igual de probables. Escribe la fracción (o el decimal).',
  generar(n,rng){
    const R='P = casos favorables / casos posibles. Un dado tiene 6 caras; dos dados, 36 combinaciones; una baraja francesa, 52 cartas (13 de cada palo, 12 figuras, 4 ases).';
    const tipo=rng.elegir(n===1?['dado','urna']:['dado','dos','carta','urna']);
    let enun,f,t,pasos;
    if(tipo==='dado'){const c=rng.elegir([['un número par',3],['un número mayor que 4',2],['un 6',1],['un número menor que 3',2],['un múltiplo de 3',2]]);enun=`Al tirar un dado, ¿probabilidad de sacar ${c[0]}?`;f=c[1];t=6;pasos=[`Favorables: ${f} de 6 caras`]}
    else if(tipo==='dos'){const s=rng.entero(2,12);f=6-Math.abs(7-s);t=36;enun=`Al tirar dos dados, ¿probabilidad de que sumen ${s}?`;pasos=[`Hay 36 combinaciones; suman ${s}: ${f}`]}
    else if(tipo==='carta'){const c=rng.elegir([['un corazón',13],['un as',4],['una figura (J, Q o K)',12],['una carta roja',26],['el as de picas',1]]);enun=`Sacas una carta de una baraja francesa de 52. ¿Probabilidad de ${c[0]}?`;f=c[1];t=52;pasos=[`Favorables: ${f} de 52`]}
    else{const r=rng.entero(2,9),az=rng.entero(1,9),v=rng.entero(0,6),col=rng.elegir([['roja',r],['azul',az],['verde',v]].filter(x=>x[1]>0));t=r+az+v;f=col[1];enun=`Una urna tiene ${r} bolas rojas, ${az} azules${v?` y ${v} verdes`:''}. ¿Probabilidad de sacar una ${col[0]}?`;pasos=[`Total: ${t} bolas; ${col[0]}s: ${f}`]}
    return {enunciado:enun+' <span class="nota">(fracción, p. ej. 1/6)</span>',respuesta:frac(f,t,{tex:false}),verificar:e=>igualNum(e,f/t),
      pasos:[paso('Cuenta los casos posibles',`Total: <b>${t}</b>`,'Todos los resultados que pueden salir, igual de probables.'),paso('Cuenta los favorables',pasos[0],'Los que cumplen lo que te preguntan.'),
        final('Divide favorables entre posibles',`\\(P = \\dfrac{${f}}{${t}} = ${c(frac(f,t))}\\)`,'Simplifica la fracción si se puede.',frac(f,t,{tex:false}))],
      errores:[{valor:frac(t-f,t,{tex:false}),si:e=>igualNum(e,(t-f)/t)&&f*2!==t,por:'Calculaste la probabilidad de que NO pase: son los favorables sobre el total.'},{valor:`${f}/${t-f}`,si:e=>igualNum(e,f/(t-f))&&t!==f,por:'Divide entre el TOTAL de casos, no entre los desfavorables.'}],
      regla:R,pista:'Favorables entre posibles.',teclado:'mat'};
  }
};

// Eventos combinados: independientes (×), sin reposición y complemento
const probCompuesta={
  titulo:'Eventos combinados',
  alternativa:'Si dos cosas no se afectan (moneda y dado), la probabilidad de que pasen las dos es <b>multiplicar</b>: la mitad de las veces sale cara, y de esas, 1 de cada 6 sale el 6. Sin devolver la bola, en la segunda saca hay una menos. Y "al menos uno" es más fácil pensarlo al revés: 1 − (que no salga ninguno).',
  explicacion:'Independientes: P(A y B) = P(A)·P(B). Sin reposición, el total baja en 1. "Al menos uno" = 1 − P(ninguno).',
  generar(n,rng){
    const R='Eventos independientes: se multiplican. Sin reposición: la segunda extracción tiene un caso menos. Al menos uno = 1 − P(ninguno).';
    const tipo=rng.elegir(n<=2?['ind','moneda']:n<=3?['ind','moneda','sin']:['ind','sin','almenos']);
    let N,D,enun,pasos;
    if(tipo==='ind'){const EV=[['un número par',3],['un 6',1],['más de 4',2],['menos de 3',2],['un impar',3],['un 1',1],['un múltiplo de 3',2]],[a,b]=[rng.elegir(EV),rng.elegir(EV)];
      N=a[1]*b[1];D=36;enun=`Tiras dos dados. ¿Probabilidad de sacar ${a[0]} en el primero y ${b[0]} en el segundo?`;pasos=[`Son independientes: \\(\\tfrac{${a[1]}}{6}\\cdot\\tfrac{${b[1]}}{6} = ${frac(N,D)}\\)`]}
    else if(tipo==='moneda'){const c=rng.entero(1,3);N=1;D=2*6;const k=rng.elegir([['par',3],['un '+c,1],['mayor que 4',2]]);N=k[1];enun=`Lanzas una moneda y un dado. ¿Probabilidad de cara y ${k[0]}?`;pasos=[`\\(\\tfrac{1}{2}\\cdot\\tfrac{${k[1]}}{6}\\)`]}
    else if(tipo==='sin'){const r=rng.entero(2,6),a=rng.entero(2,6),t=r+a;N=r*(r-1);D=t*(t-1);enun=`Una urna tiene ${r} rojas y ${a} azules. Sacas dos sin devolverlas. ¿Probabilidad de que las dos sean rojas?`;pasos=[`\\(\\tfrac{${r}}{${t}}\\cdot\\tfrac{${r-1}}{${t-1}} = ${frac(N,D)}\\)`]}
    else{const k=rng.entero(2,3);N=6**k-5**k;D=6**k;enun=`Tiras ${k} dados. ¿Probabilidad de sacar al menos un 6?`;pasos=[`P(ningún 6) = \\(\\left(\\tfrac{5}{6}\\right)^{${k}}\\)`,`\\(1 - \\tfrac{${5**k}}{${6**k}} = ${frac(N,D)}\\)`]}
    const errores=tipo==='sin'?[{si:e=>{const r=+enun.match(/(\d+) rojas/)[1],t=r+(+enun.match(/(\d+) azules/)[1]);return igualNum(e,(r/t)**2)},por:'Sin reposición, en la segunda saca queda una roja menos y una bola menos.'}]
      :tipo==='almenos'?[{si:e=>{const k=+enun.match(/Tiras (\d)/)[1];return igualNum(e,k/6)},por:'No se suman las probabilidades: usa 1 − P(ningún 6).'}]:[];
    const intro={ind:['Son independientes','Lo que salga en un dado no cambia al otro: se multiplican las probabilidades.'],moneda:['Son independientes','La moneda no afecta al dado: se multiplican.'],
      sin:['Es sin reposición','Después de la primera saca queda una bola roja menos y una bola menos en total.'],almenos:['Piensa en el contrario','"Al menos un 6" es todo menos "ningún 6", que es más fácil de calcular.']}[tipo];
    const ps=[paso(intro[0],pasos[0],intro[1],tipo==='sin'?{ojo:'No uses el mismo total en las dos sacas.'}:{}),...pasos.slice(1).map(x=>paso('Resta del total',x,'P(al menos uno) = 1 − P(ninguno).'))];
    ps.push(final('Resultado',`\\(P = ${c(frac(N,D))}\\)`,'Simplifica la fracción.',frac(N,D,{tex:false})));
    return {enunciado:enun+' <span class="nota">(fracción)</span>',respuesta:frac(N,D,{tex:false}),verificar:e=>igualNum(e,N/D),pasos:ps,errores,regla:R,pista:'¿Son independientes? ¿Hay reposición?',teclado:'mat'};
  }
};

// ¿Qué imprime este código de pandas? (datos al azar)
const NOMBRES=['Ana','Luis','Sofía','Pedro','Marta','Juan','Lucía','Raúl'];
const pandas={
  titulo:'¿Qué imprime este código?',
  alternativa:'Lee el código <b>de adentro hacia afuera</b>, como haría la computadora: primero qué columna o filtro se toma (lo que está entre corchetes), luego qué operación se le aplica (.sum(), .max()…). Hazlo a mano con la tabla, fila por fila.',
  explicacion:'Lee el código con los datos de la tabla: sum, mean, max, len, filtros con df[condición] y loc/idxmax.',
  generar(n,rng){
    const k=rng.entero(4,n<=2?5:7),nom=rng.barajar(NOMBRES).slice(0,k),edad=datos(rng,k,18,60),ventas=datos(rng,k,1,20).map(x=>x*10);
    const tabla=`<div class="wrap"><table><tr><th></th><th>nombre</th><th>edad</th><th>ventas</th></tr>${nom.map((x,i)=>`<tr><td>${i}</td><td>${x}</td><td>${edad[i]}</td><td>${ventas[i]}</td></tr>`).join('')}</table></div>`;
    const lim=rng.elegir([25,30,35,40]);
    const opciones=[
      ["df['ventas'].sum()",ventas.reduce((s,x)=>s+x,0),'sum() suma toda la columna.'],
      ["df['edad'].max()",Math.max(...edad),'max() da el mayor valor de la columna.'],
      ["len(df)",k,'len(df) es el número de filas.'],
      ["df['ventas'].mean()",r2(media(ventas)),'mean() es el promedio de la columna.'],
      [`len(df[df['edad'] > ${lim}])`,edad.filter(x=>x>lim).length,'df[condición] deja solo las filas que la cumplen; len las cuenta.'],
      ["df.loc[df['ventas'].idxmax(), 'nombre']",nom[ventas.indexOf(Math.max(...ventas))],'idxmax() da el índice del máximo; loc toma el nombre de esa fila.'],
      [`df[df['edad'] < ${lim}]['ventas'].sum()`,ventas.filter((x,i)=>edad[i]<lim).reduce((s,x)=>s+x,0),'Primero filtra las filas y luego suma la columna de esas filas.']
    ];
    const [cod,v,ex]=rng.elegir(n<=1?opciones.slice(0,3):n<=3?opciones.slice(0,5):opciones);
    const esTexto=typeof v==='string';
    return {enunciado:`Con este DataFrame <code>df</code>:${tabla}¿Qué devuelve el código?`,codigo:`print(${cod})`,respuesta:String(v),
      verificar:e=>esTexto?String(e).trim().replace(/['"]/g,'').toLowerCase()===v.toLowerCase():tolerante(v)(e),pasos:[paso('Lee el código de adentro hacia afuera',`<code>${cod}</code>`,ex),final('Aplícalo a la tabla',`Resultado: <b>${v}</b>`,'Hazlo a mano con las filas de la tabla.',String(v))],errores:[],
      regla:'pandas: df[\'col\'] es una columna; .sum(), .mean(), .max() la resumen; df[condición] filtra filas; len(df) cuenta filas; idxmax() da el índice del máximo.',pista:ex};
  }
};

// Gráfica de barras generada (SVG): leer un valor, el máximo o una diferencia
const CAT=[['Lun','Mar','Mié','Jue','Vie'],['Norte','Sur','Este','Oeste'],['Ene','Feb','Mar','Abr','May','Jun'],['A','B','C','D','E']];
function grafica(cats,vals){
  const W=320,H=180,max=Math.max(...vals),esc=v=>Math.round(v/max*120),bw=Math.floor((W-40)/cats.length)-8;
  return `<svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de barras: ${cats.map((c,i)=>`${c} ${vals[i]}`).join(', ')}">
<line class="eje" x1="30" y1="150" x2="${W-5}" y2="150"/><line class="eje" x1="30" y1="20" x2="30" y2="150"/>
${cats.map((c,i)=>{const x=36+i*(bw+8),h=esc(vals[i]);return `<rect class="barra-g" x="${x}" y="${150-h}" width="${bw}" height="${h}" rx="3"/><text x="${x+bw/2}" y="166" text-anchor="middle">${c}</text><text x="${x+bw/2}" y="${146-h}" text-anchor="middle">${vals[i]}</text>`}).join('')}</svg>`;
}
const barras={
  titulo:'Leer una gráfica de barras',
  alternativa:'Cada barra es una columna de una tabla: su altura es el número. Antes de calcular, convierte la gráfica en una lista "categoría: valor"; después la pregunta es solo sumar, restar o buscar el mayor.',
  explicacion:'Mira la altura de cada barra (y su etiqueta). Para comparar, resta; para el total, suma.',
  generar(n,rng){
    const cats=rng.elegir(CAT);let vals;do vals=cats.map(()=>rng.entero(2,n<=2?20:60)*(n>=4?5:1));while(new Set(vals).size<vals.length);
    const i=rng.entero(0,cats.length-1);let j;do j=rng.entero(0,cats.length-1);while(j===i);
    const tipo=rng.elegir(n===1?['valor','max']:n<=3?['valor','max','dif']:['dif','total','max']);
    const R='En una gráfica de barras, la altura de cada barra es su valor; compara alturas para el máximo, resta para la diferencia y suma para el total.';
    const svg=grafica(cats,vals);
    if(tipo==='valor')return {enunciado:`${svg}<p>¿Cuánto vale <b>${cats[i]}</b>?</p>`,respuesta:String(vals[i]),verificar:e=>igualNum(e,vals[i]),pasos:[paso('Busca la barra',cats[i],'Las categorías están en el eje horizontal.'),final('Lee su altura',`${cats[i]} = <b>${vals[i]}</b>`,'La etiqueta encima de la barra es su valor.',String(vals[i]))],errores:[],regla:R,pista:'Lee la etiqueta de la barra.'};
    if(tipo==='max'){const m=cats[vals.indexOf(Math.max(...vals))];return {enunciado:`${svg}<p>¿Qué categoría tiene el valor más alto?</p>`,respuesta:m,verificar:e=>String(e).trim().toLowerCase()===m.toLowerCase(),pasos:[paso('Lista los valores',cats.map((x,k)=>x===m?marca(`${x}: ${vals[k]}`):`${x}: ${vals[k]}`).join(' · '),'Pasar la gráfica a números evita confusiones.'),final('La más alta',`<b>${m}</b> (${Math.max(...vals)})`,'El mayor valor es la barra más alta.',m)],errores:[],regla:R,pista:'La barra más alta.'}}
    if(tipo==='total'){const t=vals.reduce((s,x)=>s+x,0);return {enunciado:`${svg}<p>¿Cuál es el total de todas las barras?</p>`,respuesta:String(t),verificar:e=>igualNum(e,t),pasos:[paso('Lista los valores',cats.map((x,k)=>`${x}: ${vals[k]}`).join(' · '),'Pasa la gráfica a números.'),final('Súmalos',`${vals.join(' + ')} = <b>${t}</b>`,'El total es la suma de todas las barras.',String(t))],errores:[],regla:R,pista:'Suma todas.'}}
    const d=vals[i]-vals[j];
    return {enunciado:`${svg}<p>¿Cuánto más tiene <b>${cats[i]}</b> que <b>${cats[j]}</b>? <span class="nota">(negativo si tiene menos)</span></p>`,respuesta:String(d),verificar:e=>igualNum(e,d),pasos:[paso('Lee las dos barras',`${cats[i]}: ${vals[i]} · ${cats[j]}: ${vals[j]}`,'Primero los números.'),final('Resta en el orden de la pregunta',`${vals[i]} − ${vals[j]} = <b>${d}</b>`,'«Cuánto más tiene A que B» es A − B.',String(d),{ojo:'Si A tiene menos, sale negativo.'})],
      errores:[{valor:String(-d),si:e=>igualNum(e,-d),por:`Es ${cats[i]} menos ${cats[j]}, en ese orden.`}],regla:R,pista:'Resta las dos alturas.'};
  }
};

// Métricas de clasificación desde una matriz de confusión
const metricas={
  titulo:'Exactitud, precisión y recall',
  alternativa:'Piensa en un detector de spam. <b>Precisión</b>: de los correos que mandó a spam, ¿cuántos eran spam de verdad? (que no se equivoque al acusar). <b>Recall</b>: de todo el spam que llegó, ¿cuánto atrapó? (que no se le escape). <b>Exactitud</b>: de todos los correos, ¿cuántos clasificó bien?',
  explicacion:'Exactitud = aciertos / total. Precisión = VP / (VP + FP): de lo que marcó positivo, cuánto era. Recall = VP / (VP + FN): de los positivos reales, cuántos encontró.',
  generar(n,rng){
    const VP=rng.entero(10,90),FP=rng.entero(1,40),FN=rng.entero(1,40),VN=rng.entero(10,90),tot=VP+FP+FN+VN;
    const tipo=rng.elegir(n===1?['exactitud']:n===2?['exactitud','precision']:['exactitud','precision','recall','f1']);
    const R='Exactitud = (VP + VN) / total · Precisión = VP / (VP + FP) · Recall = VP / (VP + FN) · F1 = 2·P·R / (P + R).';
    const P=VP/(VP+FP),Rc=VP/(VP+FN),val={exactitud:(VP+VN)/tot,precision:P,recall:Rc,f1:2*P*Rc/(P+Rc)}[tipo];
    const nombre={exactitud:'la exactitud (accuracy)',precision:'la precisión',recall:'el recall (sensibilidad)',f1:'el F1'}[tipo];
    const tabla=`<div class="wrap"><table><tr><th></th><th>Predice positivo</th><th>Predice negativo</th></tr><tr><th>Es positivo</th><td>VP = ${VP}</td><td>FN = ${FN}</td></tr><tr><th>Es negativo</th><td>FP = ${FP}</td><td>VN = ${VN}</td></tr></table></div>`;
    const ok=e=>{const v=num(e);return Math.abs(v-val)<=0.006||Math.abs(v/100-val)<=0.006&&/%/.test(e)};
    return {enunciado:`${tabla}<p>Calcula ${nombre} <span class="nota">(decimal con 2 cifras, o en %)</span></p>`,respuesta:String(r2(val)),verificar:ok,
      pasos:[paso('Ubica los cuatro valores',`VP = ${VP} · FP = ${FP} · FN = ${FN} · VN = ${VN}`,'VP: positivos bien detectados; FP: falsas alarmas; FN: positivos que se escaparon; VN: negativos bien detectados.'),
        paso('Elige la fórmula',{exactitud:'Exactitud = (VP + VN) / total',precision:'Precisión = VP / (VP + FP)',recall:'Recall = VP / (VP + FN)',f1:'F1 = 2·P·R / (P + R)'}[tipo],{exactitud:'De todos los casos, cuántos acertó.',precision:'De lo que marcó positivo, cuánto era de verdad.',recall:'De los positivos reales, cuántos encontró.',f1:'Equilibra precisión y recall.'}[tipo],tipo==='f1'?{}:{ojo:'Precisión mira la columna de lo predicho; recall, la fila de lo real.'}),
        ...(tipo==='f1'?[paso('Calcula P y R',`P = ${VP}/(${VP}+${FP}) = ${r2(P)} · R = ${VP}/(${VP}+${FN}) = ${r2(Rc)}`,'F1 necesita las dos.')]:[]),
        final('Sustituye y calcula',{exactitud:`(${VP} + ${VN}) / ${tot}`,precision:`${VP} / (${VP} + ${FP})`,recall:`${VP} / (${VP} + ${FN})`,f1:`2·${r2(P)}·${r2(Rc)} / (${r2(P)} + ${r2(Rc)})`}[tipo]+` = <b>${r2(val)}</b>`,'Redondea a 2 decimales.',String(r2(val)))],
      errores:[...(tipo==='precision'&&Math.abs(P-Rc)>0.01?[{valor:String(r2(Rc)),si:e=>Math.abs(num(e)-Rc)<=0.006&&Math.abs(P-Rc)>0.01,por:'Ese es el recall: la precisión divide entre lo que el modelo marcó positivo (VP + FP).'}]:[]),
        ...(tipo==='recall'&&Math.abs(P-Rc)>0.01?[{valor:String(r2(P)),si:e=>Math.abs(num(e)-P)<=0.006&&Math.abs(P-Rc)>0.01,por:'Esa es la precisión: el recall divide entre los positivos reales (VP + FN).'}]:[]),
        {si:e=>Math.abs(num(e)/100-val)<=0.006&&!/%/.test(e),por:'Si lo escribes como porcentaje, agrega %; si no, usa el decimal (0.xx).'}],
      regla:R,pista:'Ubica VP, FP, FN y VN en la tabla.'};
  }
};

export default {'est/tendencia':tendencia,'est/dispersion':dispersion,'est/percentil':percentil,'prob/basica':probBasica,'prob/compuesta':probCompuesta,
  'py/pandas':pandas,'viz/barras':barras,'ml/metricas':metricas};
