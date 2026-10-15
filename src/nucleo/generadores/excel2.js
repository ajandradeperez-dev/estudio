/* Curso de Excel (parte 2): condicionales, búsqueda, texto y fechas, ordenar/filtrar/formato/validación, tablas dinámicas,
   gráficos y atajos. Las fórmulas se verifican por resultado en dos hojas (excel-base.js); lo demás con la hoja a la vista
   y un segundo cálculo independiente (comprobar). Sin DOM. */
import {paso,final,marca,code,fn,tablaVentas,tablaCalif,tablaInventario,tablaNomina,aCeldas,col,ultima,valores,formulaQ,valorQ,NOMBRES,APELLIDOS,REGIONES,PRODUCTOS} from './excel-base.js';
import {crearHoja,evaluar,mostrar,serial,textoFecha,deSerial,ref,numACol} from '../excel/formulas.js';

const esSi=e=>/^\s*s[ií](?![a-zñáéíóú])/i.test(String(e)),esNo=e=>/^\s*no(?![a-zñáéíóú])/i.test(String(e));
const prof=n=>n<=2?'basico':'procedimiento';
const sum=a=>a.reduce((s,x)=>s+x,0);
const hoja=(celdas,extra={})=>({celdas,filas:12,cols:8,...extra});
const SEP='En Excel en español los argumentos se separan con «;» (en inglés con «,»); aquí sirven los dos.';
const conT=(t,extra={})=>({celdas:aCeldas(t,extra),tabla:t});
const elegirPlantilla=(rng,P)=>{const k=rng.elegir(Object.keys(P));return {...P[k](),plantilla:k}};

/* ---------- CONTAR.SI y CONTAR.SI.CONJUNTO ---------- */
const R_CSI=`CONTAR.SI(rango; criterio) (COUNTIF) cuenta las celdas que cumplen el criterio: "Norte", ">20", "<>Sur", "A*". Con varias condiciones: CONTAR.SI.CONJUNTO(rango1; criterio1; rango2; criterio2…) (COUNTIFS). ${SEP}`;
const contarSi={
  titulo:'CONTAR.SI y CONTAR.SI.CONJUNTO',
  explicacion:`${fn('CONTAR.SI')}(rango; criterio) cuenta las celdas que cumplen algo: <code>=CONTAR.SI(B2:B9;"Norte")</code> o <code>=CONTAR.SI(D2:D9;">20")</code>. El criterio va entre comillas cuando lleva un operador. Para varias condiciones a la vez: ${fn('CONTAR.SI.CONJUNTO')}(rango1; criterio1; rango2; criterio2).`,
  alternativa:'Es pasar lista con una condición: "levanten la mano los de la región Norte". Con CONTAR.SI.CONJUNTO pides dos cosas a la vez: "los del Norte que vendieron más de 20".',
  referencia:'Ver: Soporte de Microsoft, «Función CONTAR.SI» y «Función CONTAR.SI.CONJUNTO».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1,res=`G2`;
    const reg=rng.elegir(REGIONES),lim=rng.elegir([10,15,20,25]),[prod]=rng.elegir(PRODUCTOS);
    const datos=r=>{const t=tablaVentas(r,m);t.filas[0][1]=reg;return conT(t,{G1:'Resultado'})};
    const q=(formula,enun,pasos,errores,esperado)=>formulaQ({rng,datos,destino:res,formula,enunciado:enun,pasos,errores,regla:R_CSI,pista:'CONTAR.SI(rango;criterio).',esperado});
    const P={
      1:{'texto':()=>q(`=CONTAR.SI(B2:B${u};"${reg}")`,`Escribe en <b>G2</b> cuántas ventas son de la región <b>${reg}</b>.`,[paso('Rango donde buscar',`B2:B${u} (Región)`,'La columna de la condición.'),final('Criterio entre comillas',code(`=CONTAR.SI(B2:B${u};"${reg}")`),'Cuenta las celdas iguales a '+reg+'.')],[[`=CONTAR(B2:B${u})`,'CONTAR cuenta números, no aplica condiciones.'],[`=CONTARA(B2:B${u})`,'CONTARA cuenta todas las regiones.']],d=>[d.tabla.filas.filter(f=>f[1]===reg).length]),
        'mayor':()=>q(`=CONTAR.SI(D2:D${u};">${lim}")`,`Escribe en <b>G2</b> cuántas ventas tienen <b>más de ${lim}</b> unidades.`,[paso('Rango',`D2:D${u} (Unidades)`,'Donde se compara.'),final('Operador y número entre comillas',code(`=CONTAR.SI(D2:D${u};">${lim}")`),'">'+lim+'" = mayor que '+lim+'.')],[[`=CONTAR.SI(D2:D${u};">=${lim}")`,'«Más de» no incluye el '+lim+'.'],[`=CONTAR.SI(D2:D${u};${lim})`,'Sin el operador cuenta las iguales a '+lim+'.']],d=>[d.tabla.filas.filter(f=>f[3]>lim).length])},
      2:{'distinto':()=>q(`=CONTAR.SI(B2:B${u};"<>${reg}")`,`Escribe en <b>G2</b> cuántas ventas NO son de la región <b>${reg}</b>.`,[paso('«Distinto de» es <>','"<>'+reg+'"','Operador dentro de las comillas.'),final('Fórmula',code(`=CONTAR.SI(B2:B${u};"<>${reg}")`),'Cuenta las demás.')],[[`=CONTAR.SI(B2:B${u};"${reg}")`,'Esas son las que SÍ son de '+reg+'.']],d=>[d.tabla.filas.filter(f=>f[1]!==reg).length]),
        'texto':()=>P[1]['texto'](),'mayor':()=>P[1]['mayor']()},
      3:{'comodin':()=>{const l=rng.elegir(['A','M','L','P','S','C','D','R','E']);return q(`=CONTAR.SI(A2:A${u};"${l}*")`,`Escribe en <b>G2</b> cuántos vendedores tienen un nombre que empieza con <b>${l}</b>.`,[paso('El * reemplaza cualquier texto',`"${l}*"`,'Empieza con '+l+' y sigue lo que sea.'),final('Fórmula',code(`=CONTAR.SI(A2:A${u};"${l}*")`),'Comodines: * varios caracteres, ? uno.')],[[`=CONTAR.SI(A2:A${u};"${l}")`,'Sin * solo cuenta los nombres que son exactamente «'+l+'».'],[`=CONTAR.SI(A2:A${u};"*${l}")`,'"*'+l+'" busca los que TERMINAN con '+l+'.']],d=>[d.tabla.filas.filter(f=>f[0][0].toUpperCase()===l).length])},
        'conjunto':()=>q(`=CONTAR.SI.CONJUNTO(B2:B${u};"${reg}";D2:D${u};">${lim}")`,`Escribe en <b>G2</b> cuántas ventas son de <b>${reg}</b> y además tienen <b>más de ${lim}</b> unidades.`,[paso('Primera condición',`B2:B${u};"${reg}"`,'Rango y criterio.'),paso('Segunda condición',`D2:D${u};">${lim}"`,'Otro par.'),final('Las dos juntas',code(`=CONTAR.SI.CONJUNTO(B2:B${u};"${reg}";D2:D${u};">${lim}")`),'Cuenta las filas que cumplen todo.')],[[`=CONTAR.SI(B2:B${u};"${reg}")`,'Falta la condición de las unidades.'],[`=CONTAR.SI(B2:B${u};"${reg}")+CONTAR.SI(D2:D${u};">${lim}")`,'Sumar dos CONTAR.SI cuenta dos veces; usa CONTAR.SI.CONJUNTO para «y».']],d=>[d.tabla.filas.filter(f=>f[1]===reg&&f[3]>lim).length]),
        'distinto':()=>P[2]['distinto']()},
      4:{'celda-criterio':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Región',G2:r.elegir(t.filas)[1],H1:'Ventas'})},destino:'H2',formula:`=CONTAR.SI(B2:B${u};G2)`,enunciado:'La región a contar está en <b>G2</b>. Escribe en <b>H2</b> cuántas ventas hay de esa región (si cambias G2, el resultado debe cambiar).',
          pasos:[paso('Criterio en una celda','G2','Sin comillas: es una referencia.'),final('Fórmula',code(`=CONTAR.SI(B2:B${u};G2)`),'Así sirve para cualquier región.')],errores:[[`=CONTAR.SI(B2:B${u};"G2")`,'"G2" con comillas busca el texto «G2», no lo que hay en la celda.']],regla:R_CSI,pista:'El criterio puede ser una celda.',esperado:d=>[d.tabla.filas.filter(f=>f[1]===d.celdas.G2).length]}),
        'conjunto':()=>P[3]['conjunto'](),'comodin':()=>P[3]['comodin']()},
      5:{'mayor-celda':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Mínimo',G2:r.entero(5,30),H1:'Ventas'})},destino:'H2',formula:`=CONTAR.SI(D2:D${u};">="&G2)`,enunciado:'Escribe en <b>H2</b> cuántas ventas tienen al menos las unidades que dice <b>G2</b>.',
          pasos:[paso('Operador + celda','">="&G2','El operador va entre comillas y se une con & a la celda.',{ojo:'">=G2" buscaría el texto G2.'}),final('Fórmula',code(`=CONTAR.SI(D2:D${u};">="&G2)`),'Criterio armado con &.')],errores:[[`=CONTAR.SI(D2:D${u};">=G2")`,'Dentro de las comillas G2 es solo texto: une el operador con &G2.'],[`=CONTAR.SI(D2:D${u};">"&G2)`,'«Al menos» incluye el igual: >=.']],regla:R_CSI,pista:'">="&G2',esperado:d=>[d.tabla.filas.filter(f=>f[3]>=d.celdas.G2).length]}),
        'celda-criterio':()=>P[4]['celda-criterio'](),'conjunto':()=>P[3]['conjunto']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- SUMAR.SI, SUMAR.SI.CONJUNTO y PROMEDIO.SI ---------- */
const R_SSI=`SUMAR.SI(rango; criterio; rango_suma) (SUMIF) suma lo que cumple; SUMAR.SI.CONJUNTO(rango_suma; rango1; criterio1…) (SUMIFS) pone primero lo que se suma; PROMEDIO.SI (AVERAGEIF) promedia. ${SEP}`;
const sumarSi={
  titulo:'SUMAR.SI y PROMEDIO.SI',
  explicacion:`${fn('SUMAR.SI')}(rango; criterio; rango_suma): <code>=SUMAR.SI(B2:B9;"Norte";D2:D9)</code> suma las unidades del Norte. ${fn('SUMAR.SI.CONJUNTO')} pone <b>primero</b> lo que se suma y luego los pares rango–criterio. ${fn('PROMEDIO.SI')} funciona como SUMAR.SI, pero promedia.`,
  alternativa:'SUMAR.SI es "suma solo lo de los del Norte": una columna dice QUIÉN cuenta (la región) y otra QUÉ se suma (las unidades). Cuidado: en SUMAR.SI.CONJUNTO lo que se suma va al principio.',
  referencia:'Ver: Soporte de Microsoft, «Función SUMAR.SI» y «Función SUMAR.SI.CONJUNTO».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1,reg=rng.elegir(REGIONES),lim=rng.elegir([10,15,20]);
    const datos=r=>{const t=tablaVentas(r,m);t.filas[0][1]=reg;return conT(t,{G1:'Resultado'})};
    const q=(formula,enun,pasos,errores,esperado)=>formulaQ({rng,datos,destino:'G2',formula,enunciado:enun,pasos,errores,regla:R_SSI,pista:'¿Qué columna decide y qué columna se suma?',esperado});
    const del=d=>d.tabla.filas.filter(f=>f[1]===reg);
    const P={
      1:{'sumar':()=>q(`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,`Escribe en <b>G2</b> el total de <b>unidades</b> vendidas en la región <b>${reg}</b>.`,[paso('Rango de la condición',`B2:B${u}`,'Región.'),paso('Criterio',`"${reg}"`,'Entre comillas.'),final('Rango a sumar al final',code(`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`),'Suma las unidades de esas filas.')],[[`=SUMAR.SI(D2:D${u};"${reg}";B2:B${u})`,'Los rangos están al revés: primero donde está la condición (Región).'],[`=CONTAR.SI(B2:B${u};"${reg}")`,'CONTAR.SI cuenta las ventas; aquí se suman las unidades.']],d=>[sum(del(d).map(f=>f[3]))]),
        'sumar-mayor':()=>q(`=SUMAR.SI(D2:D${u};">${lim}")`,`Escribe en <b>G2</b> la suma de las unidades de las ventas con <b>más de ${lim}</b> unidades.`,[paso('Misma columna para condición y suma',`D2:D${u}`,'Sin tercer argumento suma el mismo rango.'),final('Fórmula',code(`=SUMAR.SI(D2:D${u};">${lim}")`),'Suma solo las mayores.')],[[`=CONTAR.SI(D2:D${u};">${lim}")`,'Eso cuenta cuántas son; se pide la suma.']],d=>[sum(d.tabla.filas.filter(f=>f[3]>lim).map(f=>f[3]))])},
      2:{'promedio':()=>q(`=PROMEDIO.SI(B2:B${u};"${reg}";D2:D${u})`,`Escribe en <b>G2</b> el promedio de unidades de las ventas de <b>${reg}</b>.`,[paso('Igual que SUMAR.SI','rango; criterio; rango a promediar','Mismo orden.'),final(`Usa ${fn('PROMEDIO.SI')}`,code(`=PROMEDIO.SI(B2:B${u};"${reg}";D2:D${u})`),'Promedia solo esas filas.')],[[`=PROMEDIO(D2:D${u})`,'Ese es el promedio de todas las regiones.'],[`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,'Eso es la suma, no el promedio.']],d=>{const v=del(d).map(f=>f[3]);return [sum(v)/v.length]}),
        'sumar':()=>P[1]['sumar'](),'sumar-mayor':()=>P[1]['sumar-mayor']()},
      3:{'conjunto':()=>q(`=SUMAR.SI.CONJUNTO(D2:D${u};B2:B${u};"${reg}";D2:D${u};">${lim}")`,`Escribe en <b>G2</b> la suma de unidades de <b>${reg}</b> solo de las ventas con <b>más de ${lim}</b> unidades.`,[paso('Primero lo que se suma',`D2:D${u}`,'En SUMAR.SI.CONJUNTO va al principio.',{ojo:'Al revés que en SUMAR.SI.'}),paso('Luego los pares',`B2:B${u};"${reg}" · D2:D${u};">${lim}"`,'Rango y criterio.'),final('Fórmula',code(`=SUMAR.SI.CONJUNTO(D2:D${u};B2:B${u};"${reg}";D2:D${u};">${lim}")`),'Todas las condiciones a la vez.')],[[`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,'Falta la condición de más de '+lim+'.']],d=>[sum(del(d).filter(f=>f[3]>lim).map(f=>f[3]))]),
        'promedio':()=>P[2]['promedio'](),
        'venta-region':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);t.filas[0][1]=reg;const c=aCeldas(t,{F1:'Venta',G1:'Resultado'});for(let i=2;i<=u;i++)c['F'+i]=`=D${i}*E${i}`;return {celdas:c,tabla:t}},destino:'G2',formula:`=SUMAR.SI(B2:B${u};"${reg}";F2:F${u})`,
          enunciado:`La columna F tiene el total de cada venta. Escribe en <b>G2</b> cuánto se vendió en pesos en la región <b>${reg}</b>.`,pasos:[paso('Condición','B2:B'+u+';"'+reg+'"','Región.'),final('Suma la columna de ventas',code(`=SUMAR.SI(B2:B${u};"${reg}";F2:F${u})`),'Rango a sumar: F.')],errores:[[`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,'Eso suma unidades, no pesos.']],regla:R_SSI,pista:'El tercer argumento es la columna F.',esperado:d=>[sum(del(d).map(f=>f[3]*f[4]))]})},
      4:{'tabla-resumen':()=>{const regs=REGIONES;return formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);const c=aCeldas(t,{G1:'Región',H1:'Unidades'});regs.forEach((x,i)=>{c['G'+(i+2)]=x});return {celdas:c,tabla:t}},destino:'H2',formula:`=SUMAR.SI($B$2:$B$${u};G2;$D$2:$D$${u})`,copiar:3,
          enunciado:'En G2:G5 están las cuatro regiones. Escribe en <b>H2</b> el total de unidades de la región de G2, listo para copiar hasta H5.',pasos:[paso('Criterio en la celda de al lado','G2','Relativa: baja a G3, G4…'),paso('Rangos fijos','$B$2:$B$'+u+' · $D$2:$D$'+u,'Si no, se mueven al copiar.'),final('Fórmula',code(`=SUMAR.SI($B$2:$B$${u};G2;$D$2:$D$${u})`),'Un resumen por región.')],
          errores:[[`=SUMAR.SI(B2:B${u};G2;D2:D${u})`,'Sin $, al copiar los rangos de la tabla se mueven y dejan filas fuera.']],regla:R_SSI,pista:'Fija los rangos con $ y deja relativa la región.',esperado:d=>regs.map(x=>sum(d.tabla.filas.filter(f=>f[1]===x).map(f=>f[3])))})},
        'conjunto':()=>P[3]['conjunto'](),'venta-region':()=>P[3]['venta-region']()},
      5:{'tabla-resumen':()=>P[4]['tabla-resumen'](),'conjunto':()=>P[3]['conjunto'](),
        'promedio-nomina':()=>{const pu=rng.elegir(['Ventas','Soporte','Analista']);return formulaQ({rng,datos:r=>{const t=tablaNomina(r,m);t.filas[0][1]=pu;return conT(t,{G1:'Promedio'})},destino:'G2',formula:`=PROMEDIO.SI(B2:B${u};"${pu}";C2:C${u})`,
          enunciado:`Escribe en <b>G2</b> el sueldo promedio del puesto <b>${pu}</b>.`,pasos:[paso('Condición',`B2:B${u};"${pu}"`,'Puesto.'),final('Promedia los sueldos',code(`=PROMEDIO.SI(B2:B${u};"${pu}";C2:C${u})`),'Columna C.')],errores:[[`=SUMAR.SI(B2:B${u};"${pu}";C2:C${u})`,'Eso es la suma, no el promedio.']],regla:R_SSI,pista:'PROMEDIO.SI(…;…;C2:C…).',esperado:d=>{const v=d.tabla.filas.filter(f=>f[1]===pu).map(f=>f[2]);return [sum(v)/v.length]}})}}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- BUSCARV ---------- */
const R_BV=`BUSCARV(valor; tabla; columna; FALSO) (VLOOKUP) busca el valor en la PRIMERA columna de la tabla y devuelve el dato de la columna indicada. FALSO (o 0) = coincidencia exacta. ${SEP}`;
const conBusca=(gen,m,clave='G2')=>r=>{const t=gen(r,m);return conT(t,{G1:'Buscar',[clave]:r.elegir(t.filas)[0],H1:'Resultado'})};
const buscarv={
  titulo:'BUSCARV',
  explicacion:`${fn('BUSCARV')}(valor_buscado; tabla; número_de_columna; FALSO): busca en la <b>primera columna</b> de la tabla y devuelve el dato de la columna que pidas (contando desde 1). Pon siempre <b>FALSO</b> al final para coincidencia exacta; sin él busca un valor aproximado y puede devolver otro registro.`,
  alternativa:'Es como buscar en la lista de contactos: buscas el nombre (primera columna) y lees el teléfono que está en la 3.ª columna. FALSO dice "quiero exactamente ese nombre, no uno parecido".',
  referencia:'Ver: Soporte de Microsoft, «Función BUSCARV».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1;
    const [gen,campos]=rng.elegir([[tablaVentas,['Región','Producto','Unidades','Precio']],[tablaCalif,['Parcial 1','Parcial 2','Final']],[tablaNomina,['Puesto','Sueldo','Horas extra']]]);
    const k=rng.elegir(campos),cab=gen===tablaVentas?['Vendedor','Región','Producto','Unidades','Precio']:gen===tablaCalif?['Alumno','Parcial 1','Parcial 2','Final','Asistencia']:['Empleado','Puesto','Sueldo','Horas extra','Ingreso'],ci=cab.indexOf(k)+1,ult=numACol(Math.max(ci,3));
    const tabla=`A2:${ult}${u}`;
    const esp=d=>[d.tabla.filas.find(f=>f[0]===d.celdas.G2)[ci-1]];
    const q=(formula,enun,pasos,errores,extra={})=>formulaQ({rng,datos:conBusca(gen,m),destino:'H2',formula,enunciado:enun,pasos,errores,regla:R_BV,pista:'BUSCARV(G2; tabla; columna; FALSO).',esperado:esp,...extra});
    const base=()=>q(`=BUSCARV(G2;${tabla};${ci};FALSO)`,`El nombre a buscar está en <b>G2</b>. Escribe en <b>H2</b> su <b>${k}</b> con BUSCARV.`,
      [paso('Valor buscado','G2','El nombre.'),paso('Tabla desde la columna de nombres',tabla,'La búsqueda siempre es en la primera columna.'),paso('Número de columna',`${k} es la columna ${ci} de la tabla`,'Contando desde la A = 1.'),final('Coincidencia exacta',code(`=BUSCARV(G2;${tabla};${ci};FALSO)`),'FALSO = exacta.')],
      [[`=BUSCARV(G2;${tabla};${ci})`,'Sin FALSO busca un valor aproximado (la tabla no está ordenada) y puede devolver otro registro.'],[`=BUSCARV(G2;${tabla};${ci+1};FALSO)`,'Esa es la columna de al lado: cuenta desde la primera columna de la tabla.'],[`=BUSCARV(G2;${tabla};${ci-1};FALSO)`,'Te quedaste una columna antes.']]);
    const P={
      1:{'evaluar':()=>{const t=gen(rng,m),i=rng.entero(0,m-1),nom=t.filas[i][0],f=`=BUSCARV("${nom}";${tabla};${ci};FALSO)`,v=t.filas[i][ci-1];return valorQ({enunciado:`Con la hoja a la vista, ¿qué devuelve <code>${f}</code>?`,respuesta:String(v),numero:typeof v==='number'?v:undefined,hoja:hoja(aCeldas(t)),
          pasos:[paso('Busca en la primera columna',`${nom} está en la fila ${i+2}`,'Columna A.'),final(`Lee la columna ${ci}`,`${k}: ${marca(v)}`,'Columna '+ci+' de la tabla.')],errores:[[String(t.filas[i][Math.min(ci,cab.length-1)]),'Esa es otra columna: cuenta desde la A = 1.']].filter(([x])=>x!==String(v)),regla:R_BV,pista:'Fila del nombre, columna '+ci+'.',comprobar:()=>mostrar(evaluar(crearHoja(aCeldas(t)),f))===String(v),clave:f+JSON.stringify(t.filas)})},
        'basico':base},
      2:{'basico':base,'columna':()=>{const t=gen(rng,m);return valorQ({enunciado:`En <code>=BUSCARV(G2;${tabla};?;FALSO)</code>, ¿qué número de columna devuelve <b>${k}</b>?`,respuesta:String(ci),numero:ci,hoja:hoja(aCeldas(t)),
          pasos:[paso('La tabla empieza en la columna A','A = 1, B = 2, C = 3…','Se cuenta dentro de la tabla.'),final(`${k} está en ${numACol(ci)}`,marca(ci),'Número de columna.')],errores:[[numACol(ci),'Se pide el número (1, 2, 3…), no la letra.'],[String(ci+1),'Cuenta desde 1 en la primera columna de la tabla.']],regla:R_BV,pista:'A = 1.',clave:'col'+k+ci})}},
      3:{'basico':base,'fijo':()=>formulaQ({rng,datos:r=>{const t=gen(r,m),nom=r.barajar(t.filas).slice(0,3).map(f=>f[0]);return conT(t,{G1:'Buscar',G2:nom[0],G3:nom[1],G4:nom[2],H1:k})},destino:'H2',formula:`=BUSCARV(G2;$A$2:$${ult}$${u};${ci};FALSO)`,copiar:2,
          enunciado:`En G2:G4 hay tres nombres. Escribe en <b>H2</b> el <b>${k}</b> del nombre de G2 con BUSCARV, listo para copiar hasta H4.`,pasos:[paso('Valor relativo','G2','Baja a G3 y G4.'),paso('Tabla fija',`$A$2:$${ult}$${u}`,'Si no, la tabla baja y deja fuera filas.'),final('Fórmula',code(`=BUSCARV(G2;$A$2:$${ult}$${u};${ci};FALSO)`),'F4 pone los $.')],
          errores:[[`=BUSCARV(G2;${tabla};${ci};FALSO)`,'Sin $, al copiar la tabla se mueve y alguna búsqueda da #N/A.']],regla:R_BV,pista:'Fija la tabla con $.',esperado:d=>['G2','G3','G4'].map(x=>d.tabla.filas.find(f=>f[0]===d.celdas[x])[ci-1])})},
      4:{'error':()=>q(`=SI.ERROR(BUSCARV(G2;${tabla};${ci};FALSO);"No encontrado")`,`Escribe en <b>H2</b> el <b>${k}</b> del nombre de G2; si no está, «No encontrado».`,[paso('BUSCARV exacto',`BUSCARV(G2;${tabla};${ci};FALSO)`,'Da #N/A si no está.'),final('Plan B',code(`=SI.ERROR(BUSCARV(G2;${tabla};${ci};FALSO);"No encontrado")`),'SI.ERROR.')],[[`=BUSCARV(G2;${tabla};${ci};FALSO)`,'Si el nombre no está, muestra #N/A.']],{datos:r=>{const t=gen(r,m);return conT(t,{G1:'Buscar',G2:r.prob(.5)?r.elegir(t.filas)[0]:'Zoe',H1:'Resultado'})},esperado:d=>{const f=d.tabla.filas.find(x=>x[0]===d.celdas.G2);return [f?f[ci-1]:'No encontrado']}}),
        'fijo':()=>P[3]['fijo'](),'basico':base},
      5:{'tramos':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);return conT(t,{F1:'Comisión',G1:'Desde',H1:'%',G2:0,G3:10,G4:20,G5:30,H2:0,H3:0.02,H4:0.05,H5:0.08})},destino:'F2',formula:'=BUSCARV(D2;$G$2:$H$5;2)',copiar:m-1,
          enunciado:'En G2:H5 hay una tabla de tramos (Desde 0, 10, 20, 30 unidades) con su % de comisión. Escribe en <b>F2</b> el % que le toca a cada venta según sus Unidades (búsqueda APROXIMADA).',
          pasos:[paso('Tabla ordenada de menor a mayor','G2:H5','Aquí sí conviene la búsqueda aproximada.'),paso('Sin FALSO (o VERDADERO)','Busca el mayor «Desde» que no pase de las unidades','Así funcionan los tramos.'),final('Fórmula',code('=BUSCARV(D2;$G$2:$H$5;2)'),'Tabla fija con $.')],
          errores:[['=BUSCARV(D2;$G$2:$H$5;2;FALSO)','Con FALSO solo encuentra 0, 10, 20 o 30 exactos: para tramos, búsqueda aproximada.']],regla:R_BV,pista:'Búsqueda aproximada en una tabla ordenada.',esperado:d=>d.tabla.filas.map(f=>f[3]>=30?d.celdas.H5:f[3]>=20?d.celdas.H4:f[3]>=10?d.celdas.H3:d.celdas.H2)}),
        'error':()=>P[4]['error'](),'fijo':()=>P[3]['fijo']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- BUSCARX ---------- */
const R_BX=`BUSCARX(valor; dónde_buscar; qué_devolver; [si_no_está]) (XLOOKUP) busca en una columna y devuelve lo de otra (puede estar a la izquierda); exacta por defecto. ${SEP}`;
const buscarx={
  titulo:'BUSCARX',
  explicacion:`${fn('BUSCARX')}(valor; matriz_buscada; matriz_devuelta; [si_no_se_encuentra]): <code>=BUSCARX(G2;A2:A9;D2:D9)</code>. Es exacta por defecto, la columna devuelta puede estar a la izquierda y el 4.º argumento evita #N/A. Está en Excel 365 y 2021.`,
  alternativa:'BUSCARX es un BUSCARV mejorado: le dices "busca aquí" y "devuélveme de allá", sin contar columnas y sin olvidar el FALSO.',
  referencia:'Ver: Soporte de Microsoft, «Función BUSCARX».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1;
    const datosCod=r=>{const t=tablaInventario(r,m);t.cab.push('Código');t.filas.forEach((f,i)=>f.push(`P-${100+i*7+r.entero(0,6)}`));return conT(t,{G1:'Buscar',G2:r.elegir(t.filas)[5],H1:'Resultado'})};
    const datos=r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Buscar',G2:r.elegir(t.filas)[0],H1:'Resultado'})};
    const k=rng.elegir(['Región','Producto','Unidades']),ci=['Vendedor','Región','Producto','Unidades','Precio'].indexOf(k),c=numACol(ci+1);
    const base=()=>formulaQ({rng,datos,destino:'H2',formula:`=BUSCARX(G2;A2:A${u};${c}2:${c}${u})`,enunciado:`Escribe en <b>H2</b> el dato de <b>${k}</b> del vendedor que está en G2, con BUSCARX.`,
      pasos:[paso('Valor','G2','El nombre.'),paso('Dónde buscar',`A2:A${u}`,'La columna de nombres.'),final('Qué devolver',code(`=BUSCARX(G2;A2:A${u};${c}2:${c}${u})`),'La columna de '+k+'.')],
      errores:[[`=BUSCARX(G2;${c}2:${c}${u};A2:A${u})`,'Los rangos están al revés: primero dónde buscar (nombres), luego qué devolver.']],regla:R_BX,pista:'BUSCARX(valor; dónde; qué).',esperado:d=>[d.tabla.filas.find(f=>f[0]===d.celdas.G2)[ci]]});
    const P={
      1:{'basico':base,'evaluar':()=>{const t=tablaVentas(rng,m),i=rng.entero(0,m-1),f=`=BUSCARX("${t.filas[i][0]}";A2:A${u};${c}2:${c}${u})`,v=t.filas[i][ci];return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:String(v),numero:typeof v==='number'?v:undefined,hoja:hoja(aCeldas(t)),
        pasos:[paso('Busca el nombre',`fila ${i+2}`,'En A.'),final('Lee la columna devuelta',marca(v),c+'.')],errores:[],regla:R_BX,pista:'Fila del nombre en la columna '+c+'.',comprobar:()=>mostrar(evaluar(crearHoja(aCeldas(t)),f))===String(v),clave:f+JSON.stringify(t.filas)})}},
      2:{'basico':base,'no-esta':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Buscar',G2:r.prob(.5)?r.elegir(t.filas)[0]:'Zoe',H1:'Resultado'})},destino:'H2',formula:`=BUSCARX(G2;A2:A${u};${c}2:${c}${u};"No está")`,enunciado:`Escribe en <b>H2</b> el dato de <b>${k}</b> del vendedor de G2 con BUSCARX; si no está, que muestre «No está» (sin SI.ERROR).`,
        pasos:[paso('Búsqueda',`G2;A2:A${u};${c}2:${c}${u}`,'Igual que siempre.'),final('4.º argumento',code(`=BUSCARX(G2;A2:A${u};${c}2:${c}${u};"No está")`),'Lo que muestra si no lo encuentra.')],errores:[[`=BUSCARX(G2;A2:A${u};${c}2:${c}${u})`,'Sin el 4.º argumento muestra #N/A.']],regla:R_BX,pista:'Usa el 4.º argumento.',esperado:d=>{const f=d.tabla.filas.find(x=>x[0]===d.celdas.G2);return [f?f[ci]:'No está']}})},
      3:{'izquierda':()=>formulaQ({rng,datos:datosCod,destino:'H2',formula:`=BUSCARX(G2;F2:F${u};A2:A${u})`,enunciado:'Los códigos están en la columna F (a la derecha). Escribe en <b>H2</b> el nombre del <b>Producto</b> (columna A) cuyo código está en G2.',
          pasos:[paso('Busca en los códigos',`F2:F${u}`,'Columna F.'),final('Devuelve de la izquierda',code(`=BUSCARX(G2;F2:F${u};A2:A${u})`),'BUSCARV no puede devolver columnas a la izquierda; BUSCARX sí.')],errores:[[`=BUSCARX(G2;A2:A${u};F2:F${u})`,'Al revés: busca en los códigos y devuelve el producto.']],regla:R_BX,pista:'Dónde buscar: F; qué devolver: A.',esperado:d=>[d.tabla.filas.find(f=>f[5]===d.celdas.G2)[0]]}),
        'no-esta':()=>P[2]['no-esta']()},
      4:{'izquierda':()=>P[3]['izquierda'](),'no-esta':()=>P[2]['no-esta'](),
        'copiar':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m),nom=r.barajar(t.filas).slice(0,3).map(f=>f[0]);return conT(t,{G1:'Buscar',G2:nom[0],G3:nom[1],G4:nom[2],H1:k})},destino:'H2',formula:`=BUSCARX(G2;$A$2:$A$${u};$${c}$2:$${c}$${u})`,copiar:2,
          enunciado:`Escribe en <b>H2</b> el dato de <b>${k}</b> del nombre de G2 con BUSCARX, listo para copiar hasta H4.`,pasos:[paso('Valor relativo','G2','Baja.'),final('Rangos fijos',code(`=BUSCARX(G2;$A$2:$A$${u};$${c}$2:$${c}$${u})`),'Con $.')],errores:[[`=BUSCARX(G2;A2:A${u};${c}2:${c}${u})`,'Sin $, al copiar los rangos bajan y dejan fuera filas.']],regla:R_BX,pista:'Fija los rangos.',esperado:d=>['G2','G3','G4'].map(x=>d.tabla.filas.find(f=>f[0]===d.celdas[x])[ci])})},
      5:{'copiar':()=>P[4]['copiar'](),'izquierda':()=>P[3]['izquierda'](),
        'horizontal':()=>formulaQ({rng,datos:r=>{const t=tablaCalif(r,m);return conT(t,{G1:'Examen',G2:r.elegir(['Parcial 1','Parcial 2','Final']),H1:'Resultado'})},destino:'H2',formula:'=BUSCARX(G2;B1:D1;B2:D2)',enunciado:'En G2 está el nombre de un examen (Parcial 1, Parcial 2 o Final). Escribe en <b>H2</b> la calificación de ese examen del primer alumno (fila 2), buscando en los encabezados.',
          pasos:[paso('Busca en los encabezados','B1:D1','BUSCARX también busca en filas.'),final('Devuelve de la fila 2',code('=BUSCARX(G2;B1:D1;B2:D2)'),'Búsqueda horizontal.')],errores:[['=BUSCARX(G2;B1:D1;B2:B'+u+')','Devuelve la fila del alumno (B2:D2), no una columna.']],regla:R_BX,pista:'Busca en B1:D1, devuelve B2:D2.',esperado:d=>[d.tabla.filas[0][d.tabla.cab.indexOf(d.celdas.G2)]]})}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- INDICE y COINCIDIR ---------- */
const R_IC=`INDICE(rango; fila; [columna]) (INDEX) devuelve la celda en esa posición; COINCIDIR(valor; rango; 0) (MATCH) da la posición exacta. Juntas: INDICE(lo_que_quiero; COINCIDIR(valor; dónde_busco; 0)). ${SEP}`;
const indiceCoincidir={
  titulo:'INDICE + COINCIDIR',
  explicacion:`${fn('INDICE')}(rango; fila; [columna]) devuelve lo que está en esa posición. ${fn('COINCIDIR')}(valor; rango; 0) dice en qué posición está un valor (0 = exacta). Juntas buscan en cualquier dirección: <code>=INDICE(D2:D9;COINCIDIR(G2;A2:A9;0))</code>.`,
  alternativa:'COINCIDIR es "¿en qué lugar de la fila está Ana? — en el 3.º"; INDICE es "dame lo que está en el 3.º lugar de esta otra columna". Juntas hacen lo mismo que una búsqueda, pero sin importar el orden de las columnas.',
  referencia:'Ver: Soporte de Microsoft, «Función INDICE» y «Función COINCIDIR».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1,k=rng.elegir(['Región','Producto','Unidades','Precio']),ci=['Vendedor','Región','Producto','Unidades','Precio'].indexOf(k),c=numACol(ci+1);
    const datos=r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Buscar',G2:r.elegir(t.filas)[0],H1:'Resultado'})};
    const P={
      1:{'indice':()=>{const t=tablaVentas(rng,m),i=rng.entero(1,m),f=`=INDICE(${c}2:${c}${u};${i})`,v=t.filas[i-1][ci];return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:String(v),numero:typeof v==='number'?v:undefined,hoja:hoja(aCeldas(t)),
          pasos:[paso('Posición dentro del rango',`La ${i}.ª celda de ${c}2:${c}${u}`,'Se cuenta desde el inicio del rango, no desde la fila 1.'),final('Es la fila '+(i+1),marca(v),'INDICE.')],errores:i<m?[[String(t.filas[i][ci]),'Contaste desde la fila 1: la posición 1 es la primera celda del rango (fila 2).']].filter(([x])=>x!==String(v)):[],regla:R_IC,pista:'Cuenta desde el inicio del rango.',comprobar:()=>mostrar(evaluar(crearHoja(aCeldas(t)),f))===String(v),clave:f+JSON.stringify(t.filas)})},
        'coincidir':()=>{const t=tablaVentas(rng,m),i=rng.entero(0,m-1),nom=t.filas[i][0],f=`=COINCIDIR("${nom}";A2:A${u};0)`;return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:String(i+1),numero:i+1,hoja:hoja(aCeldas(t)),
          pasos:[paso('Busca el valor',`${nom} está en la fila ${i+2}`,'Columna A.'),final('Posición dentro del rango',`${i+2} − 1 = ${marca(i+1)}`,'El rango empieza en la fila 2.')],errores:[[String(i+2),'COINCIDIR da la posición dentro del rango, no el número de fila de la hoja.']],regla:R_IC,pista:'Posición, no fila.',comprobar:()=>evaluar(crearHoja(aCeldas(t)),f)===i+1,clave:f+JSON.stringify(t.filas)})}},
      2:{'coincidir-f':()=>formulaQ({rng,datos,destino:'H2',formula:`=COINCIDIR(G2;A2:A${u};0)`,enunciado:'Escribe en <b>H2</b> en qué posición de la lista (A2:A'+u+') está el nombre de G2.',
          pasos:[paso('Valor y rango','G2 · A2:A'+u,'Dónde buscar.'),final('0 = exacta',code(`=COINCIDIR(G2;A2:A${u};0)`),'Sin 0 busca aproximado.')],errores:[[`=COINCIDIR(G2;A2:A${u})`,'Sin el 0 la búsqueda es aproximada (la lista no está ordenada).'],[`=COINCIDIR(G2;A1:A${u};0)`,'Con A1 la posición queda corrida en 1 (cuenta el encabezado).']],regla:R_IC,pista:'COINCIDIR(G2;rango;0).',esperado:d=>[d.tabla.filas.findIndex(f=>f[0]===d.celdas.G2)+1]}),
        'indice':()=>P[1]['indice'](),'coincidir':()=>P[1]['coincidir']()},
      3:{'juntas':()=>formulaQ({rng,datos,destino:'H2',formula:`=INDICE(${c}2:${c}${u};COINCIDIR(G2;A2:A${u};0))`,enunciado:`Escribe en <b>H2</b> el dato de <b>${k}</b> del vendedor de G2 usando INDICE y COINCIDIR.`,
          pasos:[paso('Posición del nombre',`COINCIDIR(G2;A2:A${u};0)`,'¿En qué lugar está?'),paso('Columna que quieres',`${c}2:${c}${u}`,'Mismo tamaño y mismas filas.'),final('INDICE con esa posición',code(`=INDICE(${c}2:${c}${u};COINCIDIR(G2;A2:A${u};0))`),'Busca en A, devuelve de '+c+'.')],
          errores:[[`=INDICE(${c}1:${c}${u};COINCIDIR(G2;A2:A${u};0))`,'Los dos rangos deben empezar en la misma fila (2): si no, se recorre una posición.'],[`=INDICE(${c}2:${c}${u};COINCIDIR(G2;A2:A${u}))`,'Falta el 0 de coincidencia exacta.']],regla:R_IC,pista:'INDICE(lo que quiero; COINCIDIR(…;…;0)).',esperado:d=>[d.tabla.filas.find(f=>f[0]===d.celdas.G2)[ci]]}),
        'coincidir-f':()=>P[2]['coincidir-f']()},
      4:{'izquierda':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m);return conT(t,{G1:'Producto',G2:r.elegir(t.filas)[2],H1:'Vendedor'})},destino:'H2',formula:`=INDICE(A2:A${u};COINCIDIR(G2;C2:C${u};0))`,enunciado:'Escribe en <b>H2</b> el primer <b>Vendedor</b> (columna A) que vendió el producto de G2 (columna C).',
          pasos:[paso('Busca el producto',`COINCIDIR(G2;C2:C${u};0)`,'En la columna C.'),final('Devuelve de la A',code(`=INDICE(A2:A${u};COINCIDIR(G2;C2:C${u};0))`),'A la izquierda: BUSCARV no podría.')],errores:[[`=INDICE(C2:C${u};COINCIDIR(G2;A2:A${u};0))`,'Al revés: buscas en C (productos) y devuelves de A.']],regla:R_IC,pista:'COINCIDIR en C, INDICE en A.',esperado:d=>[d.tabla.filas.find(f=>f[2]===d.celdas.G2)[0]]}),
        'juntas':()=>P[3]['juntas']()},
      5:{'dos-vias':()=>formulaQ({rng,datos:r=>{const t=tablaCalif(r,m);return conT(t,{G1:'Alumno',G2:r.elegir(t.filas)[0],G3:r.elegir(['Parcial 1','Parcial 2','Final']),H1:'Calificación'})},destino:'H2',formula:`=INDICE(B2:D${u};COINCIDIR(G2;A2:A${u};0);COINCIDIR(G3;B1:D1;0))`,
          enunciado:'En G2 hay un alumno y en G3 un examen (Parcial 1, Parcial 2 o Final). Escribe en <b>H2</b> esa calificación buscando fila y columna.',
          pasos:[paso('Fila del alumno',`COINCIDIR(G2;A2:A${u};0)`,'Posición en la lista.'),paso('Columna del examen','COINCIDIR(G3;B1:D1;0)','Posición en los encabezados.'),final('INDICE con las dos',code(`=INDICE(B2:D${u};COINCIDIR(G2;A2:A${u};0);COINCIDIR(G3;B1:D1;0))`),'Búsqueda en dos direcciones.')],
          errores:[[`=INDICE(B2:D${u};COINCIDIR(G3;B1:D1;0);COINCIDIR(G2;A2:A${u};0))`,'Primero va la fila (el alumno) y luego la columna (el examen).']],regla:R_IC,pista:'INDICE(tabla; fila; columna).',esperado:d=>[d.tabla.filas.find(f=>f[0]===d.celdas.G2)[d.tabla.cab.indexOf(d.celdas.G3)]]}),
        'izquierda':()=>P[4]['izquierda'](),'juntas':()=>P[3]['juntas']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Funciones de texto ---------- */
const R_TXT=`IZQUIERDA/DERECHA(texto; n) (LEFT/RIGHT), EXTRAE(texto; inicio; n) (MID), LARGO (LEN), MAYUSC/MINUSC/NOMPROPIO (UPPER/LOWER/PROPER), ESPACIOS (TRIM) y CONCATENAR o & para unir. ${SEP}`;
const CIUDADES=['Monterrey','Puebla','Bogotá','Lima','Quito','Mérida','Cali','Toluca'];
function tablaClientes(r,n){
  const nom=r.barajar(NOMBRES).slice(0,n);
  return {cab:['Nombre','Apellido','Código','Ciudad','Correo'],filas:nom.map(x=>{const ap=r.elegir(APELLIDOS),ci=r.elegir(CIUDADES);return [x,ap,`${ci.slice(0,3).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}-${r.entero(2019,2025)}-${String(r.entero(1,999)).padStart(3,'0')}`,ci,`${x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}.${ap.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}@correo.com`]})};
}
const texto={
  titulo:'Funciones de texto',
  explicacion:`${fn('IZQUIERDA')}(texto; n) y ${fn('DERECHA')} toman caracteres de un extremo; ${fn('EXTRAE')}(texto; inicio; n) del medio; ${fn('LARGO')} cuenta caracteres; ${fn('MAYUSC')}, ${fn('MINUSC')} y ${fn('NOMPROPIO')} cambian mayúsculas; ${fn('ESPACIOS')} quita los sobrantes. Para unir: <code>=A2&" "&B2</code> o ${fn('CONCATENAR')}.`,
  alternativa:'Piensa en el texto como una fila de casillas numeradas desde 1: IZQUIERDA toma las primeras, DERECHA las últimas y EXTRAE un pedazo desde la casilla que digas.',
  referencia:'Ver: Soporte de Microsoft, «Funciones de texto (referencia)».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const datos=r=>conT(tablaClientes(r,m),{F1:'Resultado'});
    const q=(formula,enun,pasos,errores,esperado)=>formulaQ({rng,datos,destino:'F2',formula,copiar:m-1,enunciado:enun+' (se copiará hacia abajo).',pasos,errores,regla:R_TXT,pista:'Cuenta los caracteres desde 1.',esperado});
    const evalT=()=>{const s=rng.elegir(['Excel 365','Monterrey','Hoja de cálculo','Reporte-2024','Ventas Norte']),[f,v,ex]=rng.elegir([[`=IZQUIERDA("${s}";3)`,s.slice(0,3),'Los 3 primeros.'],[`=DERECHA("${s}";4)`,s.slice(-4),'Los 4 últimos.'],[`=LARGO("${s}")`,s.length,'Cuenta también los espacios.'],[`=MAYUSC("${s}")`,s.toUpperCase(),'Todo en mayúsculas.'],[`=EXTRAE("${s}";2;3)`,s.substr(1,3),'Desde el 2.º, 3 caracteres.']]);
      return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:String(v),numero:typeof v==='number'?v:undefined,pasos:[paso('Cuenta las posiciones',[...s].map((ch,i)=>`${i+1}:${ch===' '?'␣':ch}`).slice(0,10).join(' '),'Cada carácter es una casilla, también los espacios.'),final('Resultado',marca(v),ex)],errores:[],regla:R_TXT,pista:'Cuenta desde 1.',comprobar:()=>mostrar(evaluar(crearHoja(),f))===String(v),clave:f})};
    const P={
      1:{'evaluar':evalT,'unir':()=>q('=A2&" "&B2','Escribe en <b>F2</b> el nombre completo (Nombre, un espacio y Apellido)',[paso('Une con &','A2 & " " & B2','El espacio va entre comillas.'),final('Fórmula',code('=A2&" "&B2'),'También vale =CONCATENAR(A2;" ";B2).')],[['=A2&B2','Falta el espacio entre nombre y apellido.'],['=A2+" "+B2','+ suma números; para unir textos es &.']],d=>d.tabla.filas.map(f=>f[0]+' '+f[1]))},
      2:{'mayusc':()=>q('=MAYUSC(D2)','Escribe en <b>F2</b> la Ciudad en mayúsculas',[paso('Función',fn('MAYUSC'),'Convierte a mayúsculas.'),final('Fórmula',code('=MAYUSC(D2)'),'Al copiar, cada fila.')],[['=MINUSC(D2)','MINUSC convierte a minúsculas.']],d=>d.tabla.filas.map(f=>f[3].toUpperCase())),
        'izquierda':()=>q('=IZQUIERDA(C2;3)','El código empieza con 3 letras de la ciudad. Escribe en <b>F2</b> esas 3 letras',[paso('Del inicio','IZQUIERDA','Primeros caracteres.'),final('3 caracteres',code('=IZQUIERDA(C2;3)'),'Del código en C.')],[['=DERECHA(C2;3)','DERECHA toma el final del código.'],['=IZQUIERDA(C2;4)','Con 4 incluyes el guion.']],d=>d.tabla.filas.map(f=>f[2].slice(0,3))),
        'unir':()=>P[1]['unir']()},
      3:{'derecha':()=>q('=DERECHA(C2;3)','Escribe en <b>F2</b> los 3 dígitos del final del código',[paso('Del final','DERECHA','Últimos caracteres.'),final('3 caracteres',code('=DERECHA(C2;3)'),'Del código.')],[['=IZQUIERDA(C2;3)','IZQUIERDA toma el inicio.']],d=>d.tabla.filas.map(f=>f[2].slice(-3))),
        'extrae':()=>q('=EXTRAE(C2;5;4)','El código tiene la forma CIU-AAAA-NNN. Escribe en <b>F2</b> el año (los 4 dígitos del medio)',[paso('¿Dónde empieza el año?','C I U - A: posición 5','Cuenta desde 1 (el guion es la 4).'),final('4 caracteres desde la 5',code('=EXTRAE(C2;5;4)'),'EXTRAE(texto;inicio;cuántos).',{ojo:'El guion también cuenta.'})],[['=EXTRAE(C2;4;4)','En la posición 4 está el guion: el año empieza en la 5.'],['=EXTRAE(C2;5;3)','El año tiene 4 dígitos.']],d=>d.tabla.filas.map(f=>f[2].substr(4,4))),
        'mayusc':()=>P[2]['mayusc']()},
      4:{'largo':()=>q('=LARGO(E2)','Escribe en <b>F2</b> cuántos caracteres tiene el Correo',[paso('Función',fn('LARGO'),'Cuenta caracteres.'),final('Fórmula',code('=LARGO(E2)'),'Incluye @ y puntos.')],[['=CONTAR(E2)','CONTAR cuenta celdas con números, no caracteres.']],d=>d.tabla.filas.map(f=>f[4].length)),
        'iniciales':()=>q('=IZQUIERDA(A2;1)&IZQUIERDA(B2;1)','Escribe en <b>F2</b> las iniciales (primera letra del Nombre y del Apellido, juntas)',[paso('Primera letra de cada uno','IZQUIERDA(A2;1) · IZQUIERDA(B2;1)','Con n = 1.'),final('Únelas',code('=IZQUIERDA(A2;1)&IZQUIERDA(B2;1)'),'&.')],[['=IZQUIERDA(A2;1)','Falta la inicial del apellido.']],d=>d.tabla.filas.map(f=>f[0][0]+f[1][0])),
        'extrae':()=>P[3]['extrae']()},
      5:{'correo':()=>q('=MINUSC(A2)&"@empresa.com"','Escribe en <b>F2</b> un correo nuevo: el Nombre en minúsculas seguido de @empresa.com',[paso('Nombre en minúsculas','MINUSC(A2)','Sin mayúsculas.'),final('Únelo con el dominio',code('=MINUSC(A2)&"@empresa.com"'),'El texto fijo entre comillas.')],[['=A2&"@empresa.com"','Falta pasar el nombre a minúsculas.']],d=>d.tabla.filas.map(f=>f[0].toLowerCase()+'@empresa.com')),
        'limpiar':()=>formulaQ({rng,datos:r=>{const t=tablaClientes(r,m);t.filas.forEach(f=>{f[0]=`  ${f[0].toUpperCase()}  `});return conT(t,{F1:'Limpio'})},destino:'F2',formula:'=NOMPROPIO(ESPACIOS(A2))',copiar:m-1,enunciado:'Los nombres llegaron con espacios de más y en MAYÚSCULAS. Escribe en <b>F2</b> el nombre limpio con solo la inicial en mayúscula (se copiará hacia abajo).',
          pasos:[paso('Quita espacios','ESPACIOS(A2)','Los de los lados y los dobles.'),final('Inicial en mayúscula',code('=NOMPROPIO(ESPACIOS(A2))'),'Funciones anidadas.')],errores:[['=ESPACIOS(A2)','Siguen en MAYÚSCULAS.'],['=NOMPROPIO(A2)','Siguen los espacios de más.']],regla:R_TXT,pista:'NOMPROPIO(ESPACIOS(…)).',esperado:d=>d.tabla.filas.map(f=>{const s=f[0].trim().toLowerCase();return s[0].toUpperCase()+s.slice(1)})}),
        'iniciales':()=>P[4]['iniciales']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Fechas ---------- */
const R_FEC=`Las fechas son números de serie: restarlas da días. HOY() (TODAY) es la fecha de hoy, FECHA(año; mes; día) (DATE) arma una fecha, DIAS(fin; inicio) (DAYS) cuenta los días y AÑO/MES/DIA (YEAR/MONTH/DAY) sacan sus partes. ${SEP}`;
const fechas={
  titulo:'Funciones de fecha',
  explicacion:`Una fecha es un número (días desde 1900), así que <code>=B2-A2</code> da los días entre dos fechas. ${fn('HOY')} da la fecha de hoy; ${fn('FECHA')}(año; mes; día) arma una fecha; ${fn('DIAS')}(fin; inicio) cuenta días; ${fn('AÑO')}, ${fn('MES')} y ${fn('DIA')} sacan cada parte. En estos ejercicios «hoy» es la fecha que dice el enunciado.`,
  alternativa:'Excel cuenta los días como un calendario numerado: el 1 de enero de 2024 es el día 45292. Por eso sumar 30 a una fecha es "30 días después" y restar dos fechas es "cuántos días hay entre ellas".',
  referencia:'Ver: Soporte de Microsoft, «Funciones de fecha y hora (referencia)».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9),hoyS=serial(2025,rng.entero(1,12),rng.entero(1,28)),hoyT=textoFecha(hoyS);
    const datos=r=>conT(tablaNomina(r,m),{F1:'Resultado'});
    const fmts=d=>{const f={};for(let i=2;i<=m+1;i++)f['E'+i]='fecha';return f};
    const q=(formula,enun,pasos,errores,esperado,extra={})=>formulaQ({rng,datos,destino:'F2',formula,copiar:m-1,hoy:hoyS,enunciado:`Hoy es <b>${hoyT}</b>. ${enun} (se copiará hacia abajo).`,pasos,errores,regla:R_FEC,pista:'Las fechas se restan como números.',esperado,formatos:fmts,...extra});
    const anio=s=>deSerial(s).a;
    const P={
      1:{'anio':()=>q('=AÑO(E2)','Escribe en <b>F2</b> el año de ingreso de cada empleado',[paso('La fecha está en E2','Ingreso','Columna E.'),final(`Usa ${fn('AÑO')}`,code('=AÑO(E2)'),'Saca el año.')],[['=MES(E2)','MES da el mes, no el año.']],d=>d.tabla.filas.map(f=>anio(f[4]))),
        'evaluar':()=>{const a=rng.entero(2020,2026),mm=rng.entero(1,12),dd=rng.entero(1,28),f=`=FECHA(${a};${mm};${dd})`,s=serial(a,mm,dd);return valorQ({enunciado:`¿Qué fecha (dd/mm/aaaa) muestra <code>${f}</code> con formato de fecha?`,respuesta:textoFecha(s),pasos:[paso('FECHA(año; mes; día)',`año ${a}, mes ${mm}, día ${dd}`,'En ese orden.'),final('Fecha',marca(textoFecha(s)),'Formato dd/mm/aaaa.')],errores:[[`${String(mm).padStart(2,'0')}/${String(dd).padStart(2,'0')}/${a}`,'FECHA recibe (año; mes; día): el día va al final.']].filter(([x])=>x!==textoFecha(s)),regla:R_FEC,pista:'Año, mes, día.',comprobar:()=>evaluar(crearHoja(),f)===s,clave:f})}},
      2:{'dias':()=>q('=HOY()-E2','Escribe en <b>F2</b> cuántos días lleva cada empleado en la empresa',[paso('Hoy menos el ingreso','HOY()-E2','Restar fechas da días.'),final('Fórmula',code('=HOY()-E2'),'Con formato General se ve el número de días. También vale =DIAS(HOY();E2).')],[['=E2-HOY()','Al revés da negativo: hoy − ingreso.']],d=>d.tabla.filas.map(f=>hoyS-f[4])),
        'anio':()=>P[1]['anio'](),'evaluar':()=>P[1]['evaluar']()},
      3:{'antiguedad':()=>q('=AÑO(HOY())-AÑO(E2)','Escribe en <b>F2</b> la diferencia entre el año actual y el año de ingreso',[paso('Año de hoy','AÑO(HOY())','Funciones anidadas.'),paso('Año de ingreso','AÑO(E2)','La fecha de E.'),final('Resta',code('=AÑO(HOY())-AÑO(E2)'),'Años calendario (no años cumplidos exactos).')],[['=HOY()-E2','Eso da días, no años.']],d=>d.tabla.filas.map(f=>anio(hoyS)-anio(f[4]))),
        'vence':()=>q('=E2+90','Cada empleado tiene un periodo de prueba de 90 días desde su ingreso. Escribe en <b>F2</b> la fecha en que termina',[paso('Sumar días a una fecha','E2+90','Una fecha + número = otra fecha.'),final('Fórmula',code('=E2+90'),'Dale formato de fecha.')],[['=E2+3','3 meses no es +3: se suman 90 días.']],d=>d.tabla.filas.map(f=>f[4]+90),{formatos:d=>{const f=fmts(d);for(let i=2;i<=m+1;i++)f['F'+i]='fecha';return f}}),
        'dias':()=>P[2]['dias']()},
      4:{'dias-f':()=>q('=DIAS(HOY();E2)','Escribe en <b>F2</b> con la función DIAS cuántos días lleva cada empleado',[paso(`${fn('DIAS')}(fin; inicio)`,'fin = HOY(), inicio = E2','Primero la fecha más reciente.'),final('Fórmula',code('=DIAS(HOY();E2)'),'Igual que HOY()−E2.')],[['=DIAS(E2;HOY())','Al revés da negativo: DIAS(fin; inicio).']],d=>d.tabla.filas.map(f=>hoyS-f[4])),
        'antiguedad':()=>P[3]['antiguedad'](),'vence':()=>P[3]['vence']()},
      5:{'aniversario':()=>q('=FECHA(AÑO(HOY());MES(E2);DIA(E2))','Escribe en <b>F2</b> la fecha del aniversario de ingreso de este año (mismo día y mes, año de hoy)',[paso('Partes de la fecha de ingreso','MES(E2) · DIA(E2)','Mes y día.'),paso('Año de hoy','AÑO(HOY())','Este año.'),final('Ármala',code('=FECHA(AÑO(HOY());MES(E2);DIA(E2))'),'FECHA(año; mes; día).')],[['=FECHA(AÑO(E2);MES(E2);DIA(E2))','Así sale la fecha de ingreso, no la de este año.']],d=>d.tabla.filas.map(f=>{const x=deSerial(f[4]);return serial(anio(hoyS),x.m,x.d)}),{formatos:d=>{const f=fmts(d);for(let i=2;i<=m+1;i++)f['F'+i]='fecha';return f}}),
        'antiguedad':()=>P[3]['antiguedad'](),'dias-f':()=>P[4]['dias-f']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Ordenar y filtrar ---------- */
const R_ORD='Ordenar cambia el orden de las filas completas según una columna (A→Z, menor a mayor o al revés). Filtrar oculta las filas que no cumplen la condición; no las borra.';
const ordenarFiltrar={
  titulo:'Ordenar y filtrar',
  explicacion:'<b>Ordenar</b> (Datos → Ordenar) reacomoda las filas completas según una columna: A→Z, de menor a mayor o al revés; con varios niveles, primero por una columna y, en los empates, por otra. <b>Filtrar</b> (Ctrl+Shift+L) muestra solo las filas que cumplen una condición; las demás se ocultan, no se borran.',
  alternativa:'Ordenar es acomodar las tarjetas de una baraja; filtrar es sacar de la vista las que no te interesan, sin tirarlas: al quitar el filtro vuelven todas.',
  referencia:'Ver: Soporte de Microsoft, «Ordenar datos en un rango o tabla» y «Filtrar datos en un rango o tabla».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),t=tablaVentas(rng,m),c=aCeldas(t),h=hoja(c),u=m+1;
    const ordenada=(k,desc)=>{const i=t.cab.indexOf(k);return [...t.filas].sort((a,b)=>{const x=a[i],y=b[i];const r=typeof x==='number'?x-y:x.localeCompare(y,'es');return desc?-r:r})};
    const reg=rng.elegir(t.filas)[1],lim=rng.elegir([10,15,20]);
    const P={
      1:{'primero':()=>{const desc=rng.prob(.5),o=ordenada('Unidades',desc),v=o[0][0];const empate=o.filter(f=>f[3]===o[0][3]).length>1;return valorQ({enunciado:`Si ordenas la tabla por <b>Unidades</b> ${desc?'de mayor a menor':'de menor a mayor'}, ¿qué Vendedor queda en la primera fila de datos?${empate?' (si hay empate, el que aparece primero en la tabla)':''}`,respuesta:v,hoja:h,
          pasos:[paso(desc?'Busca el mayor':'Busca el menor',`Unidades: ${o[0][3]}`,'Se mueve la fila completa.'),final('Su vendedor',marca(v),'Fila 2 después de ordenar.')],errores:[[o.at(-1)[0],'Ese queda al final: revisa el sentido del orden.']].filter(([x])=>x!==v),regla:R_ORD,pista:desc?'El que más vendió.':'El que menos vendió.',comprobar:()=>evaluar(crearHoja(c),`=${desc?'MAX':'MIN'}(D2:D${u})`)===o[0][3],clave:'p'+desc+JSON.stringify(t.filas)})},
        'filtro':()=>{const v=t.filas.filter(f=>f[1]===reg).length;return valorQ({enunciado:`Si filtras la columna Región para ver solo <b>${reg}</b>, ¿cuántas filas de datos quedan visibles?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Cuenta las de esa región',`Región = ${reg}`,'Las demás se ocultan.'),final('Visibles',marca(v),'No se borran: al quitar el filtro vuelven.')],errores:[[String(m-v),'Esas son las que se ocultan.']],regla:R_ORD,pista:'Cuenta las filas de '+reg+'.',comprobar:()=>evaluar(crearHoja(c),`=CONTAR.SI(B2:B${u};"${reg}")`)===v,clave:'f'+reg+JSON.stringify(t.filas)})}},
      2:{'alfabetico':()=>{const o=ordenada('Vendedor',false),k=rng.entero(1,Math.min(3,m-1)),v=o[k][0];return valorQ({enunciado:`Si ordenas por <b>Vendedor</b> de A a Z, ¿qué nombre queda en la fila ${k+2}?`,respuesta:v,hoja:h,
          pasos:[paso('Ordena alfabéticamente',o.slice(0,k+1).map(f=>f[0]).join(', ')+'…','A→Z.'),final(`Fila ${k+2} (posición ${k+1})`,marca(v),'La fila 1 es el encabezado.')],errores:[[o[k-1][0],'Ese está una fila arriba: la fila 1 es el encabezado.']],regla:R_ORD,pista:'La fila 2 es la primera de datos.',clave:'a'+k+JSON.stringify(t.filas)})},
        'filtro':()=>P[1]['filtro'](),'primero':()=>P[1]['primero']()},
      3:{'filtro-num':()=>{const v=t.filas.filter(f=>f[3]>lim).length;return valorQ({enunciado:`Con un filtro de número «mayor que ${lim}» en Unidades, ¿cuántas filas quedan visibles?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Compara cada fila',`Unidades > ${lim}`,'«Mayor que» no incluye el '+lim+'.'),final('Visibles',marca(v),'Filtro de número.')],errores:[[String(t.filas.filter(f=>f[3]>=lim).length),'«Mayor que» no incluye el igual.']].filter(([x])=>+x!==v),regla:R_ORD,pista:'Cuenta las mayores (sin el igual).',comprobar:()=>evaluar(crearHoja(c),`=CONTAR.SI(D2:D${u};">${lim}")`)===v,clave:'n'+lim+JSON.stringify(t.filas)})},
        'alfabetico':()=>P[2]['alfabetico'](),'filtro':()=>P[1]['filtro']()},
      4:{'dos-filtros':()=>{const v=t.filas.filter(f=>f[1]===reg&&f[3]>lim).length;return valorQ({enunciado:`Filtras Región = <b>${reg}</b> y además Unidades mayor que <b>${lim}</b>. ¿Cuántas filas quedan visibles?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Primer filtro',`${reg}: ${t.filas.filter(f=>f[1]===reg).length} filas`,'Región.'),final('Segundo filtro sobre esas',marca(v),'Los filtros se combinan con «y».')],errores:[[String(t.filas.filter(f=>f[1]===reg).length),'Falta aplicar el segundo filtro.']].filter(([x])=>+x!==v),regla:R_ORD,pista:'Las dos condiciones a la vez.',comprobar:()=>evaluar(crearHoja(c),`=CONTAR.SI.CONJUNTO(B2:B${u};"${reg}";D2:D${u};">${lim}")`)===v,clave:'d'+reg+lim+JSON.stringify(t.filas)})},
        'filtro-num':()=>P[3]['filtro-num']()},
      5:{'dos-niveles':()=>{const i1=1,i2=3,o=[...t.filas].sort((a,b)=>a[i1].localeCompare(b[i1],'es')||b[i2]-a[i2]),k=rng.entero(1,Math.min(4,m-1)),v=o[k][0];return valorQ({enunciado:`Ordenas por <b>Región</b> (A→Z) y luego, dentro de cada región, por <b>Unidades</b> de mayor a menor. ¿Qué Vendedor queda en la fila ${k+2}?`,respuesta:v,hoja:h,
          pasos:[paso('Primer nivel: Región A→Z',[...new Set(o.map(f=>f[1]))].join(' → '),'Agrupa por región.'),paso('Segundo nivel en los empates','Unidades de mayor a menor','Dentro de cada región.'),final(`Fila ${k+2}`,marca(v),'Orden de varios niveles.')],errores:[[o[k-1][0],'Ese está una fila arriba.']],regla:R_ORD,pista:'Primero región, luego unidades.',clave:'dn'+k+JSON.stringify(t.filas)})},
        'dos-filtros':()=>P[4]['dos-filtros']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Formato condicional ---------- */
const R_FC='El formato condicional colorea las celdas que cumplen una regla. Con «Usar una fórmula», la fórmula se escribe para la primera celda y se copia al rango: fija con $ la columna que se compara ($C2) para pintar la fila completa.';
const formatoCondicional={
  titulo:'Formato condicional',
  explicacion:'Inicio → Formato condicional colorea lo que cumple una regla: «mayor que 50», «texto que contiene», barras de datos… Para pintar la <b>fila completa</b> usa «Usar una fórmula»: se escribe para la primera fila del rango, como <code>=$C2&lt;$D2</code>, con $ en las columnas para que todas las celdas de la fila miren las mismas.',
  alternativa:'Es un resaltador automático: le dices "pinta de rojo lo que esté bajo el mínimo" y lo hace solo, y se actualiza cuando cambian los datos.',
  referencia:'Ver: Soporte de Microsoft, «Usar el formato condicional para resaltar información».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,10),u=m+1;
    const t=tablaInventario(rng,m),c=aCeldas(t),h=hoja(c),lim=rng.elegir([10,20,30]);
    const destinos=[];for(let f=2;f<=u;f++)for(const col of 'ABCDE')destinos.push(col+f);
    const P={
      1:{'cuantas':()=>{const v=t.filas.filter(f=>f[2]<lim).length;return valorQ({enunciado:`Regla: resaltar las celdas de <b>Existencia</b> menores que <b>${lim}</b>. ¿Cuántas celdas se pintan?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Revisa cada existencia',`< ${lim}`,'Una por una.'),final('Pintadas',marca(v),'Se actualiza si cambian los datos.')],errores:[[String(t.filas.filter(f=>f[2]<=lim).length),'«Menor que» no incluye el '+lim+'.']].filter(([x])=>+x!==v),regla:R_FC,pista:'Cuenta las menores.',comprobar:()=>evaluar(crearHoja(c),`=CONTAR.SI(C2:C${u};"<${lim}")`)===v,clave:'c'+lim+JSON.stringify(t.filas)})},
        'bajo-minimo':()=>{const v=t.filas.filter(f=>f[2]<f[3]).length;return valorQ({enunciado:'Regla: resaltar los productos con Existencia menor que su Mínimo. ¿Cuántos productos se pintan?',respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Compara cada fila','Existencia < Mínimo','C contra D.'),final('Pintados',marca(v),'Alerta de inventario.')],errores:[[String(t.filas.filter(f=>f[2]<=f[3]).length),'«Menor que» no incluye el igual.']].filter(([x])=>+x!==v),regla:R_FC,pista:'C < D en cada fila.',clave:'b'+JSON.stringify(t.filas)})}},
      2:{'bajo-minimo':()=>P[1]['bajo-minimo'](),'cuantas':()=>P[1]['cuantas'](),
        'texto':()=>{const cat=rng.elegir(t.filas)[1],v=t.filas.filter(f=>f[1]===cat).length;return valorQ({enunciado:`Regla «Texto que contiene: ${cat}» sobre la columna Categoría. ¿Cuántas celdas se pintan?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Busca el texto',cat,'En la columna B.'),final('Pintadas',marca(v),'Reglas de texto.')],errores:[],regla:R_FC,pista:'Cuenta las de esa categoría.',comprobar:()=>evaluar(crearHoja(c),`=CONTAR.SI(B2:B${u};"*${cat}*")`)===v,clave:'t'+cat+JSON.stringify(t.filas)})}},
      3:{'formula-fila':()=>formulaQ({rng,datos:r=>conT(tablaInventario(r,m)),destino:'A2',formula:'=$C2<$D2',destinos,virtual:true,
          enunciado:`Escribe la fórmula de la regla (para la celda A2, aplicada a A2:E${u}) que pinte la <b>fila completa</b> cuando la Existencia es menor que el Mínimo.`,
          pasos:[paso('Compara en la primera fila','C2<D2','Existencia < Mínimo.'),paso('Fija las columnas','$C2<$D2','Así B2, E2… también miran C y D.',{ojo:'Sin $, la celda E2 compararía G2 con H2.'}),final('Fórmula de la regla',code('=$C2<$D2'),'La fila queda libre para que baje.')],
          errores:[['=C2<D2','Sin $ en las columnas, cada celda compara otras columnas y solo se pinta parte de la fila.'],['=$C$2<$D$2','Con la fila fija, todas las filas miran la fila 2.']],regla:R_FC,pista:'$ antes de la letra, no del número.',esperado:d=>destinos.map(x=>{const f=d.tabla.filas[+x.slice(1)-2];return f[2]<f[3]})}),
        'texto':()=>P[2]['texto']()},
      4:{'formula-fila':()=>P[3]['formula-fila'](),
        'formula-cat':()=>{const cat=rng.elegir(['Cómputo','Audio','Oficina','Papelería']);return formulaQ({rng,datos:r=>conT(tablaInventario(r,m)),destino:'A2',formula:`=$B2="${cat}"`,destinos,virtual:true,
          enunciado:`Escribe la fórmula de la regla (para A2, aplicada a A2:E${u}) que pinte las filas de la categoría <b>${cat}</b>.`,pasos:[paso('Compara la categoría',`B2="${cat}"`,'Texto entre comillas.'),final('Fija la columna',code(`=$B2="${cat}"`),'Toda la fila mira la columna B.')],
          errores:[[`=B2="${cat}"`,'Sin $ en la B, cada columna miraría otra.']],regla:R_FC,pista:'$B2.',esperado:d=>destinos.map(x=>d.tabla.filas[+x.slice(1)-2][1]===cat)})}},
      5:{'formula-dos':()=>{const p=rng.elegir([100,500,1000]);return formulaQ({rng,datos:r=>conT(tablaInventario(r,m)),destino:'A2',formula:`=Y($C2<$D2;$E2>${p})`,destinos,virtual:true,
          enunciado:`Escribe la fórmula de la regla (para A2, aplicada a A2:E${u}) que pinte las filas con Existencia menor que el Mínimo <b>y</b> Precio mayor que ${p}.`,pasos:[paso('Dos condiciones',`$C2<$D2 · $E2>${p}`,'Columnas fijas.'),final('Juntas con Y',code(`=Y($C2<$D2;$E2>${p})`),'Las dos a la vez.')],
          errores:[[`=O($C2<$D2;$E2>${p})`,'O pinta las que cumplen solo una.'],[`=Y(C2<D2;E2>${p})`,'Faltan los $ en las columnas.']],regla:R_FC,pista:'Y(…;…) con $ en las columnas.',esperado:d=>destinos.map(x=>{const f=d.tabla.filas[+x.slice(1)-2];return f[2]<f[3]&&f[4]>p})})},
        'formula-cat':()=>P[4]['formula-cat'](),'formula-fila':()=>P[3]['formula-fila']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Validación de datos ---------- */
const R_VAL='La validación de datos (Datos → Validación) solo deja escribir lo que cumple la regla: números enteros o decimales entre límites, una lista, una fecha o un largo de texto. Lo demás se rechaza con un mensaje.';
const validacion={
  titulo:'Validación de datos',
  explicacion:'<b>Datos → Validación de datos</b> limita lo que se puede escribir en una celda: número entero entre 1 y 100, decimal mayor o igual a 0, una <b>lista</b> desplegable (Norte, Sur, Centro), fechas posteriores a otra o textos de cierto largo. Si alguien escribe algo fuera de la regla, Excel lo rechaza.',
  alternativa:'Es el cadenero de la celda: revisa cada dato antes de dejarlo pasar. "¿Es un número entero entre 1 y 100? Pasa. ¿150? No pasas."',
  referencia:'Ver: Soporte de Microsoft, «Aplicar la validación de datos a celdas».',
  profundidad:prof,item:true,
  generar(n,rng){
    const a=rng.entero(1,20),b=a+rng.entero(10,90);
    const REGLAS=[
      {txt:`Número entero entre ${a} y ${b}`,ok:x=>typeof x==='number'&&Number.isInteger(x)&&x>=a&&x<=b,vals:[a,b,a-1,b+1,(a+b)/2+0.5,Math.round((a+b)/2),'diez']},
      {txt:'Decimal mayor o igual que 0',ok:x=>typeof x==='number'&&x>=0,vals:[0,2.5,-1,-0.01,15,'cero']},
      {txt:'Lista: Norte, Sur, Centro',ok:x=>['Norte','Sur','Centro'].includes(x),vals:['Norte','Sur','Este','Centro','Nortee','Oeste']},
      {txt:'Longitud de texto menor o igual que 5',ok:x=>String(x).length<=5,vals:['Ana','Pedro','Sofía','Valeria','Iván','Andrés']},
      {txt:`Fecha posterior al ${textoFecha(serial(2024,6,30))}`,ok:x=>typeof x==='number'&&x>serial(2024,6,30),vals:[serial(2024,7,1),serial(2024,6,30),serial(2024,1,15),serial(2025,2,3)],fecha:true}
    ];
    const ver=(r,x)=>r.fecha&&typeof x==='number'?textoFecha(x):String(x);
    const unoQ=()=>{const r=rng.elegir(REGLAS),x=rng.elegir(r.vals),s=r.ok(x);return {enunciado:`Regla de validación: <b>${r.txt}</b>. ¿Se acepta el valor <b>${ver(r,x)}</b>? Responde sí o no.`,respuesta:s?'Sí':'No',verificar:e=>esSi(e)===s&&(esSi(e)||esNo(e)),
      pasos:[paso('Revisa la regla',r.txt,'Tipo y límites.'),final(s?'La cumple':'No la cumple',`${ver(r,x)} → ${marca(s?'Sí':'No')}`,s?'Se acepta.':'Excel lo rechaza.',s?'Sí':'No')],errores:[{valor:s?'No':'Sí',si:e=>esSi(e)!==s&&(esSi(e)||esNo(e)),por:'Revisa el tipo y si los límites se incluyen («entre» incluye los extremos).'}],regla:R_VAL,pista:'¿Es del tipo correcto y está dentro de los límites?',comprobar:()=>true,clave:r.txt+x}};
    const cuantasQ=()=>{const r=rng.elegir(REGLAS),xs=rng.barajar(r.vals).slice(0,4),v=xs.filter(x=>!r.ok(x)).length;return valorQ({enunciado:`Regla: <b>${r.txt}</b>. Alguien intenta escribir: ${xs.map(x=>`<b>${ver(r,x)}</b>`).join(', ')}. ¿Cuántos valores rechaza Excel?`,respuesta:String(v),numero:v,
      pasos:[paso('Revisa uno por uno',xs.map(x=>`${ver(r,x)} ${r.ok(x)?'✓':'✗'}`).join(' · '),'Tipo y límites.'),final('Rechazados',marca(v),'Los que no cumplen.')],errores:[[String(4-v),'Esos son los aceptados.']].filter(([x])=>+x!==v),regla:R_VAL,pista:'Cuenta los que no cumplen.',clave:r.txt+xs.join()})};
    const P={1:{'uno':unoQ,'uno-b':unoQ},2:{'uno':unoQ,'cuantas':cuantasQ},3:{'cuantas':cuantasQ,'uno':unoQ},4:{'cuantas':cuantasQ,'cuantas-b':cuantasQ},5:{'cuantas':cuantasQ,'uno':unoQ}};
    return {...elegirPlantilla(rng,P[n]),regla:R_VAL};
  }
};

/* ---------- Tablas dinámicas ---------- */
const R_TD='Una tabla dinámica resume datos: en Filas van las categorías (cada valor distinto una vez), en Columnas otra categoría opcional y en Valores un cálculo (Suma, Cuenta, Promedio) de un campo numérico.';
const MESES=['Ene','Feb','Mar'];
function tablaPivote(r,n){return {cab:['Región','Producto','Mes','Ventas'],filas:Array.from({length:n},()=>[r.elegir(REGIONES.slice(0,3)),r.elegir(['Laptop','Monitor','Mouse']),r.elegir(MESES),r.entero(5,60)*100])}}
const tablaDinamica={
  titulo:'Tablas dinámicas',
  explicacion:'Insertar → <b>Tabla dinámica</b> resume una tabla sin fórmulas: arrastras un campo a <b>Filas</b> (cada valor distinto sale una vez, como Norte, Sur, Centro), opcionalmente otro a <b>Columnas</b>, y un número a <b>Valores</b> con Suma, Cuenta o Promedio. Practica con el simulador de la materia.',
  alternativa:'Es como pedirle a alguien: "agrupa las ventas por región y súmalas". La tabla dinámica hace los SUMAR.SI por ti, para todas las regiones a la vez.',
  referencia:'Ver: Soporte de Microsoft, «Crear una tabla dinámica para analizar datos».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(8,11),t=tablaPivote(rng,m),c=aCeldas(t),h=hoja(c),u=m+1;
    const regs=[...new Set(t.filas.map(f=>f[0]))],r0=rng.elegir(regs),prods=[...new Set(t.filas.map(f=>f[1]))],p0=rng.elegir(t.filas.filter(f=>f[0]===r0))[1];
    const suma=f=>sum(t.filas.filter(f).map(x=>x[3]));
    const ev=f=>evaluar(crearHoja(c),f);
    const P={
      1:{'suma':()=>{const v=suma(f=>f[0]===r0);return valorQ({enunciado:`Tabla dinámica: Filas = <b>Región</b>, Valores = <b>Suma de Ventas</b>. ¿Qué valor sale para <b>${r0}</b>?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Junta las filas de esa región',t.filas.filter(f=>f[0]===r0).map(f=>f[3]).join(' + '),'Filas = agrupar.'),final('Suma',marca(v),'Igual a SUMAR.SI.')],errores:[[String(t.filas.filter(f=>f[0]===r0).length),'Eso sería «Cuenta de Ventas»; aquí es Suma.']],regla:R_TD,pista:'Suma las ventas de esa región.',comprobar:()=>ev(`=SUMAR.SI(A2:A${u};"${r0}";D2:D${u})`)===v,clave:'s'+r0+JSON.stringify(t.filas)})},
        'filas':()=>{const v=regs.length;return valorQ({enunciado:'Con Filas = <b>Región</b>, ¿cuántas filas de datos tiene la tabla dinámica (sin contar el Total general)?',respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Valores distintos',regs.join(', '),'Cada uno una vez.'),final('Filas',marca(v),'Más una de Total general.')],errores:[[String(m),'No es una fila por registro: cada región sale una sola vez.'],[String(v+1),'Sin contar el Total general.']],regla:R_TD,pista:'¿Cuántas regiones distintas hay?',clave:'f'+JSON.stringify(t.filas)})}},
      2:{'cuenta':()=>{const v=t.filas.filter(f=>f[0]===r0).length;return valorQ({enunciado:`Filas = <b>Región</b>, Valores = <b>Cuenta de Ventas</b>. ¿Qué valor sale para <b>${r0}</b>?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Cuenta = cuántos registros','Filas de '+r0,'No suma: cuenta.'),final('Cuenta',marca(v),'Igual a CONTAR.SI.')],errores:[[String(suma(f=>f[0]===r0)),'Eso es la Suma; aquí se pide la Cuenta.']],regla:R_TD,pista:'¿Cuántas ventas hay?',comprobar:()=>ev(`=CONTAR.SI(A2:A${u};"${r0}")`)===v,clave:'c'+r0+JSON.stringify(t.filas)})},
        'total':()=>{const v=suma(()=>true);return valorQ({enunciado:'Filas = Región, Valores = Suma de Ventas. ¿Cuánto da el <b>Total general</b>?',respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Suma todas las regiones',regs.map(x=>`${x}: ${suma(f=>f[0]===x)}`).join(' · '),'Cada fila.'),final('Total general',marca(v),'= SUMA de toda la columna.')],errores:[],regla:R_TD,pista:'Suma todas las ventas.',comprobar:()=>ev(`=SUMA(D2:D${u})`)===v,clave:'t'+JSON.stringify(t.filas)})},
        'suma':()=>P[1]['suma']()},
      3:{'promedio':()=>{const l=t.filas.filter(f=>f[0]===r0).map(f=>f[3]),v=sum(l)/l.length;return valorQ({enunciado:`Filas = <b>Región</b>, Valores = <b>Promedio de Ventas</b>. ¿Qué valor sale para <b>${r0}</b>? (hasta 2 decimales)`,respuesta:String(+v.toFixed(2)),numero:+v.toFixed(2),tolerancia:0.006/Math.max(1,v),hoja:h,
          pasos:[paso('Suma y cuenta de la región',`${sum(l)} ÷ ${l.length}`,'Promedio.'),final('Promedio',marca(+v.toFixed(2)),'Igual a PROMEDIO.SI.')],errores:[[String(sum(l)),'Eso es la Suma.']],regla:R_TD,pista:'Suma ÷ cuenta.',comprobar:()=>Math.abs(ev(`=PROMEDIO.SI(A2:A${u};"${r0}";D2:D${u})`)-v)<1e-9,clave:'p'+r0+JSON.stringify(t.filas)})},
        'cruce':()=>{const v=suma(f=>f[0]===r0&&f[1]===p0);return valorQ({enunciado:`Filas = <b>Región</b>, Columnas = <b>Producto</b>, Valores = Suma de Ventas. ¿Qué valor hay en el cruce <b>${r0}</b> × <b>${p0}</b>?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Filtra las dos cosas',`${r0} y ${p0}`,'Fila y columna.'),final('Suma',marca(v),'Igual a SUMAR.SI.CONJUNTO.')],errores:[[String(suma(f=>f[0]===r0)),'Esa es la suma de toda la región, sin separar por producto.']],regla:R_TD,pista:'Las dos condiciones.',comprobar:()=>ev(`=SUMAR.SI.CONJUNTO(D2:D${u};A2:A${u};"${r0}";B2:B${u};"${p0}")`)===v,clave:'x'+r0+p0+JSON.stringify(t.filas)})},
        'cuenta':()=>P[2]['cuenta']()},
      4:{'mayor':()=>{const tot=regs.map(x=>[x,suma(f=>f[0]===x)]).sort((a,b)=>b[1]-a[1]);const v=tot[0][0],empate=tot.length>1&&tot[1][1]===tot[0][1];return valorQ({enunciado:`Con Filas = Región y Suma de Ventas, ¿qué región vendió más?${empate?' (si hay empate, escribe cualquiera de las empatadas)':''}`,respuesta:v,alternativas:empate?tot.filter(x=>x[1]===tot[0][1]).map(x=>x[0]):[],hoja:h,
          pasos:[paso('Total por región',tot.map(([x,s])=>`${x}: ${s}`).join(' · '),'Agrupa y suma.'),final('La mayor',marca(v),'Ordena de mayor a menor.')],errores:[[tot.at(-1)[0],'Esa es la que menos vendió.']].filter(([x])=>x!==v&&tot.at(-1)[1]!==tot[0][1]),regla:R_TD,pista:'Suma cada región y compara.',clave:'m'+JSON.stringify(t.filas)})},
        'celdas':()=>{const v=regs.length*prods.length;return valorQ({enunciado:'Filas = Región y Columnas = Producto. ¿Cuántas celdas de valores tiene la tabla dinámica (sin totales)?',respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('Regiones distintas',`${regs.length}`,'Filas.'),paso('Productos distintos',`${prods.length}`,'Columnas.'),final('Multiplica',`${regs.length} × ${prods.length} = ${marca(v)}`,'Un cruce por par (algunos pueden quedar vacíos).')],errores:[[String(regs.length+prods.length),'Es filas × columnas.']],regla:R_TD,pista:'Filas × columnas.',clave:'k'+JSON.stringify(t.filas)})},
        'cruce':()=>P[3]['cruce']()},
      5:{'filtro-mes':()=>{const mes=rng.elegir(t.filas)[2],v=suma(f=>f[0]===r0&&f[2]===mes);return valorQ({enunciado:`Filas = Región, Valores = Suma de Ventas y un <b>filtro</b> Mes = <b>${mes}</b>. ¿Qué valor sale para <b>${r0}</b>?`,respuesta:String(v),numero:v,hoja:h,
          pasos:[paso('El filtro deja solo ese mes',mes,'Lo demás no cuenta.'),final('Suma de la región en ese mes',marca(v),'Si no hay, la región no aparece (o queda vacía).')],errores:[[String(suma(f=>f[0]===r0)),'Te faltó aplicar el filtro del mes.']].filter(([x])=>+x!==v),regla:R_TD,pista:'Solo las filas de ese mes.',comprobar:()=>ev(`=SUMAR.SI.CONJUNTO(D2:D${u};A2:A${u};"${r0}";C2:C${u};"${mes}")`)===v,clave:'fm'+r0+mes+JSON.stringify(t.filas)})},
        'mayor':()=>P[4]['mayor'](),'cruce':()=>P[3]['cruce']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Gráficos ---------- */
const R_GRA='Columnas o barras para comparar categorías; líneas para ver una tendencia en el tiempo; circular para partes de un todo (pocas categorías); dispersión para la relación entre dos números; histograma para ver cómo se reparten los valores.';
const GRAF=[
  ['Comparar las ventas de 5 sucursales en el mes','columnas',['barras','columna','barra','grafico de columnas','grafico de barras']],
  ['Ver cómo cambió la temperatura cada día del mes','líneas',['linea','lineas','grafico de lineas']],
  ['Mostrar qué porcentaje del presupuesto va a renta, comida, transporte y ahorro','circular',['pastel','pay','grafico circular','anillo']],
  ['Ver si a más horas de estudio corresponde una mejor calificación','dispersión',['dispersion','xy','grafico de dispersion']],
  ['Ver cuántos alumnos sacaron entre 0–59, 60–69, 70–79, 80–89 y 90–100','histograma',['columnas','histogramas']],
  ['Comparar las ventas de 12 vendedores con nombres largos','barras',['barras horizontales','barra','grafico de barras']],
  ['Mostrar los usuarios de la app mes a mes durante dos años','líneas',['linea','lineas']],
  ['Comparar ventas planeadas contra reales en cada trimestre','columnas',['columnas agrupadas','barras','columna']],
  ['Mostrar la participación de mercado de 3 marcas este año','circular',['pastel','pay','anillo']],
  ['Ver si el precio de una casa sube con sus metros cuadrados','dispersión',['dispersion','xy']]
];
const MALOS=[['Un gráfico circular con 15 categorías','demasiadas categorías',['muchas categorias','demasiadas rebanadas','son muchas categorias','usar barras']],
  ['Un gráfico de columnas cuyo eje vertical empieza en 950 en lugar de 0','el eje no empieza en cero',['eje no empieza en 0','exagera las diferencias','eje truncado']],
  ['Un gráfico de líneas para comparar las ventas de cinco productos distintos (sin orden en el tiempo)','las categorías no son tiempo',['usar columnas','no hay tendencia','no es una serie de tiempo','deberia ser de columnas']]];
const graficos={
  titulo:'Gráficos: cuál elegir',
  explicacion:'Elige el gráfico según la pregunta: <b>columnas/barras</b> para comparar categorías (barras si los nombres son largos o son muchas), <b>líneas</b> para tendencias en el tiempo, <b>circular</b> para partes de un todo con pocas categorías, <b>dispersión</b> para ver si dos números se relacionan e <b>histograma</b> para ver cómo se reparten los valores.',
  alternativa:'Pregúntate qué quieres contar: "¿quién es más grande?" → columnas; "¿sube o baja con el tiempo?" → líneas; "¿de qué se compone el total?" → circular; "¿una cosa depende de otra?" → dispersión.',
  referencia:'Ver: Soporte de Microsoft, «Tipos de gráficos disponibles en Office».',
  profundidad:prof,item:true,
  generar(n,rng){
    const P={
      1:{'elegir':()=>{const [s,g,alt]=rng.elegir(GRAF);return valorQ({enunciado:`¿Qué tipo de gráfico usarías para: <b>${s}</b>? (columnas, barras, líneas, circular, dispersión o histograma)`,respuesta:g,alternativas:alt,
          pasos:[paso('¿Qué pregunta responde?',s,'El objetivo define el gráfico.'),final('Gráfico',marca(g),R_GRA)],errores:[['circular','El circular solo muestra partes de un todo con pocas categorías.'],['líneas','Las líneas son para tendencias en el tiempo.']].filter(([x])=>x!==g&&!alt.includes(x)),regla:R_GRA,pista:'¿Comparar, tendencia, partes, relación o reparto?',clave:'g'+s})}},
      2:{'elegir':()=>{const [s,g,alt]=rng.elegir(GRAF);return valorQ({enunciado:`¿Qué tipo de gráfico usarías para: <b>${s}</b>?`,respuesta:g,alternativas:alt,pasos:[paso('Objetivo',s,'¿Qué quieres mostrar?'),final('Gráfico',marca(g),R_GRA)],errores:[['circular','El circular es solo para partes de un todo.']].filter(([x])=>x!==g&&!alt.includes(x)),regla:R_GRA,pista:'Piensa en la pregunta que responde.',clave:'g'+s})}},
      3:{'elegir':()=>P[2]['elegir'](),'malo':()=>{const [s,r,alt]=rng.elegir(MALOS);return valorQ({enunciado:`¿Qué está mal en este gráfico? <b>${s}</b> (responde en pocas palabras)`,respuesta:r,alternativas:alt,pasos:[paso('Mira qué confunde al lector',s,'Un buen gráfico se entiende rápido.'),final('Problema',marca(r),R_GRA)],errores:[],regla:R_GRA,pista:'¿Qué haría que alguien lo lea mal?',clave:'m'+s})}},
      4:{'malo':()=>P[3]['malo'](),'elegir':()=>P[2]['elegir']()},
      5:{'malo':()=>P[3]['malo'](),'elegir':()=>P[2]['elegir']()}
    };
    return elegirPlantilla(rng,P[n]);
  }
};

/* ---------- Atajos de teclado ---------- */
const R_AT='Los atajos ahorran tiempo: Ctrl+C/V/X copiar, pegar y cortar; Ctrl+Z deshacer; F2 editar la celda; F4 poner $ en una referencia; Ctrl+Shift+L filtros; Alt+= autosuma.';
const ATAJOS=[['Ctrl+C','copiar'],['Ctrl+V','pegar'],['Ctrl+X','cortar'],['Ctrl+Z','deshacer'],['Ctrl+Y','rehacer'],['Ctrl+G','guardar'],['F2','editar la celda'],['F4','fijar la referencia con $'],
  ['Ctrl+Shift+L','activar los filtros'],['Ctrl+T','convertir en tabla'],['Alt+=','autosuma'],['Ctrl+;','escribir la fecha de hoy'],['Ctrl+Inicio','ir a la celda A1'],['Ctrl+1','abrir formato de celdas'],
  ['Ctrl+Espacio','seleccionar la columna'],['Shift+Espacio','seleccionar la fila'],['Ctrl+J','copiar la celda de arriba (rellenar hacia abajo)'],['Ctrl+B','buscar'],['Ctrl+Flecha abajo','ir al final de los datos'],['Ctrl+Shift+Flecha abajo','seleccionar hasta el final de los datos']];
const SECUENCIAS=[['copiar A1 y pegarlo en B1',['Ctrl+C','Ctrl+V']],['mover (cortar y pegar) una celda',['Ctrl+X','Ctrl+V']],['convertir los datos en tabla y activar los filtros',['Ctrl+T','Ctrl+Shift+L']],
  ['entrar a editar una celda y fijar la referencia con $',['F2','F4']],['deshacer un error y luego rehacerlo',['Ctrl+Z','Ctrl+Y']],['ir al final de una columna de datos y luego volver a A1',['Ctrl+Flecha abajo','Ctrl+Inicio']],
  ['escribir la fecha de hoy y guardar el archivo',['Ctrl+;','Ctrl+G']],['seleccionar una columna completa y copiarla',['Ctrl+Espacio','Ctrl+C']],['seleccionar una fila completa y copiarla',['Shift+Espacio','Ctrl+C']],['abrir el formato de celdas y luego guardar',['Ctrl+1','Ctrl+G']]];
const normAt=s=>String(s).toLowerCase().replace(/control/g,'ctrl').replace(/mayús|mayus|shift/g,'shift').replace(/\s+/g,'').replace(/flecha|↓/g,'flecha');
const atajos={
  titulo:'Atajos de teclado',
  explicacion:'Atajos de Excel en español: <b>Ctrl+C</b> copiar, <b>Ctrl+V</b> pegar, <b>Ctrl+Z</b> deshacer, <b>Ctrl+G</b> guardar, <b>F2</b> editar la celda, <b>F4</b> poner $ en una referencia, <b>Ctrl+Shift+L</b> filtros, <b>Alt+=</b> autosuma, <b>Ctrl+;</b> fecha de hoy. (En Excel en inglés, guardar es Ctrl+S y buscar Ctrl+F.)',
  alternativa:'Aprende primero los de todos los días (copiar, pegar, deshacer, guardar) y suma uno por semana. Cada atajo es un viaje al menú que te ahorras.',
  referencia:'Ver: Soporte de Microsoft, «Métodos abreviados de teclado de Excel».',
  profundidad:n=>n<=2?'basico':'procedimiento',item:true,
  generar(n,rng){
    if(n>=3&&rng.prob(.5)){const [quiero,sec]=rng.elegir(SECUENCIAS);return {enunciado:`¿Qué atajos usas, en orden, para <b>${quiero}</b>? (sepáralos con coma)`,respuesta:sec.join(', '),verificar:e=>{const l=String(e).split(/,|→|\sy\s/).map(normAt).filter(Boolean);return l.length===sec.length&&l.every((x,i)=>x===normAt(sec[i]))},
      pasos:[...sec.slice(0,-1).map((k,i)=>paso(`Paso ${i+1}`,marca(k),ATAJOS.find(x=>x[0]===k)?.[1]||'')),final(`Paso ${sec.length}`,marca(sec.at(-1)),ATAJOS.find(x=>x[0]===sec.at(-1))?.[1]||'',sec.join(', '))],
      errores:[{valor:[...sec].reverse().join(', '),si:e=>{const l=String(e).split(/,/).map(normAt).filter(Boolean);return l.length===sec.length&&l.every((x,i)=>x===normAt([...sec].reverse()[i]))},por:'El orden importa.'}].filter(x=>sec.length>1&&sec[0]!==sec.at(-1)),regla:R_AT,pista:'Piensa qué haces primero.',comprobar:()=>sec.every(k=>ATAJOS.some(x=>x[0]===k)),clave:'s'+quiero,plantilla:'secuencia'}}
    const lista=ATAJOS.slice(0,n<=2?10:ATAJOS.length),[k,hace]=rng.elegir(lista);
    if(rng.prob(.5)||n<=1)return {...valorQ({enunciado:`¿Qué hace el atajo <b>${k}</b> en Excel (en español)?`,respuesta:hace,alternativas:[hace.split(' (')[0],hace.replace(/^(ir a |abrir |activar |escribir )/,'')],
      pasos:[paso('Recuerda la familia',k.startsWith('Ctrl')?'Ctrl + letra: acciones de archivo y edición':'Teclas de función o Shift','Agrúpalos para recordarlos.'),final('Hace',marca(hace),'Atajo de Excel.')],errores:ATAJOS.filter(x=>x[0]!==k).slice(0,2).map(x=>[x[1],`Eso es ${x[0]}.`]),regla:R_AT,pista:'Piensa en la letra.',clave:'q'+k}),plantilla:'que-hace'};
    return {enunciado:`¿Qué atajo sirve para <b>${hace}</b>? (por ejemplo: Ctrl+C)`,respuesta:k,verificar:e=>normAt(e)===normAt(k),
      pasos:[paso('Acción',hace,'Busca la tecla.'),final('Atajo',marca(k),'Practícalo en Excel.',k)],errores:ATAJOS.filter(x=>x[0]!==k).slice(0,3).map(x=>({valor:x[0],si:e=>normAt(e)===normAt(x[0]),por:`${x[0]} es para ${x[1]}.`})),regla:R_AT,pista:'Empieza con Ctrl, Alt, Shift o F.',comprobar:()=>true,clave:'a'+k,plantilla:'cual-atajo'};
  }
};

export default {'xl/contar-si':contarSi,'xl/sumar-si':sumarSi,'xl/buscarv':buscarv,'xl/buscarx':buscarx,'xl/indice-coincidir':indiceCoincidir,'xl/texto':texto,'xl/fechas':fechas,
  'xl/ordenar-filtrar':ordenarFiltrar,'xl/formato-condicional':formatoCondicional,'xl/validacion':validacion,'xl/tabla-dinamica':tablaDinamica,'xl/graficos':graficos,'xl/atajos':atajos};
