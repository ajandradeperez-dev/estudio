/* Escenarios integradores de Ciencia de datos: un caso de 4 pasos por tema, con datos nuevos en cada intento.
   El de machine learning es el proyecto integrador (predecir bajas de clientes). Sin DOM. */
import {prob,paso,final,marca,fmt,cerca} from './extensiones/base.js';
import {txt} from './extensiones/ingles-base.js';

const sum=a=>a.reduce((s,x)=>s+x,0),media=a=>sum(a)/a.length;
const phi=z=>{const t=1/(1+0.2316419*Math.abs(z)),d=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI),p=d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return z>=0?1-p:p};
const ctx=t=>`<p class="contexto">${t}</p>`;
const N=(c,o)=>{const q=prob(o);return {...q,enunciado:ctx(c)+o.enunciado,profundidad:'escenario',regla:o.regla,pista:o.pista||'Un paso a la vez.'}};
const T=(c,que,{enunciado,acepta,errores,regla,x})=>({...txt({enunciado:ctx(c)+enunciado,acepta,errores,regla,es:true,pista:'Piensa qué necesitas lograr.',
  pasos:[paso('¿Qué pide este paso?',que,'Cada paso usa algo distinto del tema.'),final('Escribe la respuesta',marca(acepta[0]),x)]}),profundidad:'escenario'});

// Estadística · Tiempos de entrega
export function escenarioEntregas(rng){
  const base=Array.from({length:7},()=>rng.entero(20,45)),at=rng.entero(110,160),d=[...base,at].sort((a,b)=>a-b);
  const m=media(d),md=(d[3]+d[4])/2,s=Math.sqrt(sum(d.map(x=>(x-m)**2))/(d.length-1));
  const C=`Tiempos de entrega (minutos) de 8 pedidos: ${d.join(', ')}.`;
  return [
    N(C,{enunciado:'1/4 · ¿Cuál es el tiempo promedio (media)? (2 decimales)',v:m,dec:2,pasos:[paso('Suma',`${sum(d)}`,'Todos los datos.'),final('Entre 8',marca(fmt(m)),'Media.')],errores:[[md,'Esa es la mediana.']],regla:'Media = suma / n.',comprobar:()=>cerca(m*8,sum(d))}),
    N(C,{enunciado:'2/4 · ¿Cuál es la mediana? (2 decimales)',v:md,dec:2,pasos:[paso('Ordenados, n par','4.º y 5.º valor','Los dos centrales.'),final('Promedio',`(${d[3]} + ${d[4]})/2 = ${marca(fmt(md))}`,'Mediana.')],errores:[[m,'Esa es la media.']],regla:'Con n par, la mediana es el promedio de los dos centrales.',comprobar:()=>md>=d[3]&&md<=d[4]}),
    N(C,{enunciado:'3/4 · ¿Cuál es la desviación estándar muestral? (2 decimales)',v:s,dec:2,pasos:[paso('Σ(x − x̄)²',fmt(sum(d.map(x=>(x-m)**2)),2),'Desviaciones al cuadrado.'),final('√(Σ/(n − 1))',marca(fmt(s)),'Desviación estándar.')],errores:[[s*s,'Esa es la varianza.']],regla:'s = √(Σ(x − x̄)²/(n − 1)).',comprobar:()=>cerca(s*s*7,sum(d.map(x=>x*x))-8*m*m)}),
    N(C,{enunciado:`4/4 · El pedido de ${at} minutos jala la media. Escribe 1 si la mediana representa mejor el tiempo típico o 0 si es la media.`,v:1,dec:0,pasos:[paso('Compara',`media ${fmt(m)} vs mediana ${fmt(md)}`,'Hay un atípico.'),final('Mejor medida',marca(1),'La mediana resiste el atípico.')],errores:[[0,'La media se infla con el atípico.']],regla:'Con atípicos, la mediana describe mejor el centro.',comprobar:()=>m>md})
  ];
}

// Probabilidad · Control de calidad
export function escenarioCalidad(rng){
  const p=rng.elegir([0.02,0.05,0.1]),n=rng.entero(5,12),p0=(1-p)**n,sens=0.9,fp=0.05,pD=sens*p+fp*(1-p),post=sens*p/pD;
  const C=`Una línea produce piezas con ${p*100} % de defectuosas, de forma independiente. Un inspector revisa lotes de ${n} piezas.`;
  return [
    N(C,{enunciado:'1/4 · ¿Cuántas piezas defectuosas esperas por lote? (2 decimales)',v:n*p,dec:2,pasos:[paso('Binomial','media = np','Esperanza.'),final('Calcula',marca(fmt(n*p)),'Defectuosas esperadas.')],errores:[[p,'Esa es la probabilidad por pieza.']],regla:'E[X] = np.',comprobar:()=>cerca(n*p/n,p)}),
    N(C,{enunciado:'2/4 · ¿Qué probabilidad hay de un lote sin defectuosas? (4 decimales)',v:p0,dec:4,pasos:[paso('P(X = 0)','(1 − p)^n','Ninguna falla.'),final('Calcula',marca(fmt(p0,4)),'Probabilidad.')],errores:[[1-p0,'Esa es la de al menos una.']],regla:'P(X = 0) = (1 − p)^n.',comprobar:()=>{let x=1;for(let i=0;i<n;i++)x*=1-p;return cerca(x,p0)}}),
    N(C,{enunciado:'3/4 · ¿Y de al menos una defectuosa? (4 decimales)',v:1-p0,dec:4,pasos:[paso('Complemento','1 − P(X = 0)','Al menos una.'),final('Calcula',marca(fmt(1-p0,4)),'Probabilidad.')],errores:[[p0,'Esa es la de ninguna.']],regla:'P(al menos 1) = 1 − (1 − p)^n.',comprobar:()=>cerca(1-p0+p0,1)}),
    N(C,{enunciado:`4/4 · Un sensor marca el 90 % de las piezas defectuosas y el 5 % de las buenas. Si marca una pieza, ¿qué probabilidad hay de que sea defectuosa? (4 decimales)`,v:post,dec:4,pasos:[paso('P(marca)',`0.9×${p} + 0.05×${fmt(1-p,2)} = ${fmt(pD,4)}`,'Total.'),final('Bayes',marca(fmt(post,4)),'Muchas marcas son falsas alarmas.')],errores:[[0.9,'Esa es la sensibilidad.']],regla:'P(D|M) = P(M|D)P(D)/P(M).',comprobar:()=>cerca(post*pD,sens*p)})
  ];
}

// Inferencia · Prueba A/B
export function escenarioAB(rng){
  const n=rng.elegir([400,500,800,1000]),pa=rng.entero(8,14)/100,pb=+(pa+rng.entero(1,5)/100).toFixed(2),pp=(pa+pb)/2,se=Math.sqrt(pp*(1-pp)*(2/n)),z=(pb-pa)/se,seB=Math.sqrt(pb*(1-pb)/n),dec=Math.abs(z)>1.96?1:0;
  const C=`Prueba A/B de un botón: ${n} visitantes ven la versión A y ${n} la B. Convierten el ${Math.round(pa*100)} % con A y el ${Math.round(pb*100)} % con B.`;
  return [
    N(C,{enunciado:'1/4 · ¿Cuál es el error estándar de la proporción de B? (4 decimales)',v:seB,dec:4,pasos:[paso('√(p̂(1 − p̂)/n)',`√(${pb}×${fmt(1-pb,2)}/${n})`,'Para B.'),final('SE',marca(fmt(seB,4)),'Variación esperada.')],errores:[[seB*seB,'Falta la raíz.']],regla:'SE = √(p̂(1 − p̂)/n).',comprobar:()=>cerca(seB*seB*n,pb*(1-pb))}),
    N(C,{enunciado:'2/4 · ¿Cuál es el límite superior del IC del 95 % para la proporción de B? (4 decimales)',v:pb+1.96*seB,dec:4,pasos:[paso('Margen','1.96 × SE','95 %.'),final('p̂ + margen',marca(fmt(pb+1.96*seB,4)),'Límite superior.')],errores:[[pb-1.96*seB,'Ese es el inferior.']],regla:'IC = p̂ ± 1.96·SE.',comprobar:()=>cerca(pb+1.96*seB-pb,1.96*seB)}),
    N(C,{enunciado:'3/4 · Con la proporción combinada, ¿cuánto vale z para la diferencia B − A? (2 decimales)',v:z,dec:2,pasos:[paso('p combinada',`${fmt(pp,3)}; SE = √(p(1 − p)(2/n)) = ${fmt(se,4)}`,'Bajo H₀ son iguales.'),final('z = (p̂B − p̂A)/SE',marca(fmt(z)),'Estadístico.')],errores:[[pb-pa,'Falta dividir entre el SE.']],regla:'z = (p̂₁ − p̂₂)/√(p(1 − p)(1/n₁ + 1/n₂)).',comprobar:()=>cerca(z*se,pb-pa)}),
    N(C,{enunciado:'4/4 · Con α = 0.05 bilateral, ¿la diferencia es significativa? Escribe 1 si sí o 0 si no.',v:dec,dec:0,pasos:[paso('Compara |z| con 1.96',`|${fmt(z)}|`,'Valor crítico.'),final('Decide',marca(dec),dec?'B es mejor con evidencia.':'No hay evidencia suficiente: sigue probando.')],errores:[[1-dec,'Compara con 1.96.']],regla:'Rechaza H₀ si |z| > 1.96.',comprobar:()=>(Math.abs(z)>1.96)===(dec===1)})
  ];
}

// Python · Limpia y resume un archivo de ventas
export function escenarioPandas(rng){
  const arch=rng.elegir(['ventas.csv','pedidos.csv','tickets.csv']);
  const C=`Recibes ${arch} con las columnas «region», «vendedor» y «monto». Debes limpiarlo y resumirlo con pandas (df ya está cargado).`;
  return [
    T(C,'Leer el archivo',{enunciado:`1/4 · ¿Con qué instrucción lo cargaste en df?`,acepta:[`df = pd.read_csv("${arch}")`,`df = pd.read_csv('${arch}')`,`pd.read_csv("${arch}")`],errores:[[`df = pd.open("${arch}")`,'Se usa pd.read_csv.']],regla:'pd.read_csv(ruta).',x:'read_csv.'}),
    T(C,'Contar faltantes',{enunciado:'2/4 · ¿Qué escribes para ver cuántos faltantes hay por columna?',acepta:['df.isna().sum()','df.isnull().sum()'],errores:[['df.dropna()','Eso los quita, no los cuenta.']],regla:'isna().sum() cuenta los NaN por columna.',x:'isna().sum().'}),
    T(C,'Resumir por grupo',{enunciado:'3/4 · ¿Qué escribes para el total de monto por región?',acepta:['df.groupby("region")["monto"].sum()',"df.groupby('region')['monto'].sum()"],errores:[['df["monto"].sum()','Eso es el total general, sin agrupar.']],regla:'groupby(col)[valor].sum().',x:'groupby.'}),
    T(C,'Ordenar',{enunciado:'4/4 · Guardaste ese resultado en «tot». ¿Cómo lo ordenas de mayor a menor?',acepta:['tot.sort_values(ascending=False)','tot.sort_values(ascending = False)'],errores:[['tot.sort_values()','Así queda de menor a mayor.']],regla:'sort_values(ascending=False) para descendente.',x:'Descendente.'})
  ];
}

// Machine learning · Proyecto integrador: ¿qué clientes se van a dar de baja?
export function escenarioChurn(rng){
  const N0=rng.entero(20,60)*100,VP=rng.entero(40,90),FN=rng.entero(10,40),FP=rng.entero(10,60),P=VP/(VP+FP),R=VP/(VP+FN);
  const C=`Proyecto: una empresa de telefonía tiene ${N0} clientes con su historial y si se dieron de baja (sí/no). Quiere predecir quién se irá para ofrecerle una promoción.`;
  return [
    T(C,'Definir el problema',{enunciado:'1/4 · ¿Es un problema de regresión o de clasificación?',acepta:['clasificacion','clasificación'],errores:[['regresion','Se predice sí/no: clasificación.']],regla:'Categoría → clasificación; número → regresión.',x:'Clasificación.'}),
    N(C,{enunciado:'2/4 · Separas 80 % para entrenar. ¿Cuántos clientes quedan para la prueba?',v:N0*0.2,dec:0,pasos:[paso('20 % de prueba',`${N0} × 0.2`,'Lo que el modelo no ve al entrenar.'),final('Clientes',marca(N0*0.2),'Conjunto de prueba.')],errores:[[N0*0.8,'Esos son los de entrenamiento.']],regla:'Prueba = datos que el modelo no ve al entrenar.',comprobar:()=>N0*0.2+N0*0.8===N0}),
    N(C,{enunciado:`3/4 · En la prueba: VP = ${VP}, FN = ${FN}, FP = ${FP}. ¿Cuál es el recall (de los que sí se fueron, cuántos detectó)? (4 decimales)`,v:R,dec:4,pasos:[paso('VP/(VP + FN)',`${VP}/(${VP} + ${FN})`,'Positivos reales.'),final('Recall',marca(fmt(R,4)),'Bajas detectadas.')],errores:[[P,'Esa es la precisión.']],regla:'Recall = VP/(VP + FN).',comprobar:()=>cerca(R*(VP+FN),VP)}),
    T(C,'Elegir la métrica',{enunciado:'4/4 · Perder un cliente sin ofrecerle nada cuesta mucho más que darle una promoción de más. ¿Qué métrica priorizas?',acepta:['recall','sensibilidad'],errores:[['precision','Importa no dejar escapar a quien se va: recall.'],['exactitud','Con clases desbalanceadas, la exactitud engaña.']],regla:'Si los falsos negativos cuestan más, prioriza el recall.',x:'Recall.'})
  ];
}
