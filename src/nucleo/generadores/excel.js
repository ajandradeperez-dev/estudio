/* Curso de Excel (parte 1): interfaz y datos, fórmulas y referencias, funciones de resumen y lógica.
   Funciones en español (como Excel en español) con su nombre en inglés entre paréntesis. Las fórmulas se verifican por
   resultado en dos hojas (ver excel-base.js). Sin DOM. */
import {paso,final,marca,code,fn,tablaVentas,tablaCalif,tablaInventario,tablaNomina,aCeldas,col,ultima,rangoCol,valores,formatosDe,formulaQ,valorQ,igualRango,NOMBRES} from './excel-base.js';
import {crearHoja,evaluar,mostrar,copiarFormula,numACol,ref,serial,textoFecha,esError} from '../excel/formulas.js';

const prof=n=>n<=2?'basico':'procedimiento';
const sum=a=>a.reduce((s,x)=>s+x,0);
const r2=x=>Math.round(x*100)/100;
const hoja=(celdas,extra={})=>({celdas,filas:12,cols:8,...extra});
const SEP='En Excel en español los argumentos se separan con «;» (en inglés con «,»); aquí sirven los dos.';

/* ---------- Celdas y rangos ---------- */
const R_CEL='Una celda se nombra con la letra de su columna y el número de su fila (C5). Un rango va de la esquina superior izquierda a la inferior derecha con dos puntos (B2:D6).';
const rangoQ=(enunciado,resp,pasos,errores,h,clave)=>({enunciado,respuesta:resp,verificar:e=>igualRango(e,resp),pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:resp}],
  errores:errores.filter(([v])=>!igualRango(v,resp)).map(([v,por])=>({valor:v,si:e=>igualRango(e,v),por})),regla:R_CEL,pista:'Primera celda : última celda.',hoja:h,comprobar:()=>true,clave});
const celdas={
  titulo:'Celdas y rangos',
  explicacion:'La hoja es una cuadrícula: las columnas tienen letras (A, B, C…) y las filas números (1, 2, 3…). Cada celda se nombra columna + fila: <b>C5</b>. Un <b>rango</b> es un rectángulo de celdas: <b>B2:D6</b> va de B2 a D6. Para contar sus celdas: columnas × filas.',
  alternativa:'Es como jugar "batalla naval": la letra es la columna y el número la fila. Un rango es el rectángulo que dibujas arrastrando el dedo de una esquina a la otra.',
  referencia:'Ver: Soporte de Microsoft, «Información general sobre fórmulas en Excel».',
  profundidad:prof,
  generar(n,rng){
    const P={
      1:{'direccion':()=>{const c=rng.entero(1,8),f=rng.entero(1,30),r=ref(c,f);return valorQ({enunciado:`¿Cómo se llama la celda de la columna <b>${numACol(c)}</b> y la fila <b>${f}</b>?`,respuesta:r,
          pasos:[paso('Primero la letra de la columna',numACol(c),'Las columnas son letras.'),final('Después el número de fila',marca(r),'Columna + fila.')],errores:[[`${f}${numACol(c)}`,'Primero va la letra de la columna y después el número de fila.']],regla:R_CEL,pista:'Letra y luego número.',clave:'dir'+r})},
        'leer':()=>{const t=tablaVentas(rng,6),i=rng.entero(0,5),k=rng.elegir(['Vendedor','Región','Producto','Unidades']),cel=col(t,k)+(i+2),v=valores(t,k)[i],otro=valores(t,k)[(i+1)%6];
          return valorQ({enunciado:`Mira la hoja: ¿qué hay en la celda <b>${cel}</b>?`,respuesta:String(v),numero:typeof v==='number'?v:undefined,hoja:hoja(aCeldas(t),{marcar:[cel]}),
            pasos:[paso('Busca la columna arriba',`${col(t,k)} → ${k}`,'Las letras están arriba.'),final('Baja hasta la fila',`Fila ${i+2}: ${marca(v)}`,'Los números de fila están a la izquierda.')],
            errores:otro!==v?[[String(otro),'Esa es la fila de abajo: la fila 1 tiene los encabezados.']]:[],regla:R_CEL,pista:'Columna arriba, fila a la izquierda.'})}},
      2:{'contar':()=>{const c1=rng.entero(1,4),c2=c1+rng.entero(1,4),f1=rng.entero(1,10),f2=f1+rng.entero(2,15),r=`${ref(c1,f1)}:${ref(c2,f2)}`,nc=c2-c1+1,nf=f2-f1+1;
          return valorQ({enunciado:`¿Cuántas celdas tiene el rango <b>${r}</b>?`,respuesta:String(nc*nf),numero:nc*nf,pasos:[paso('Cuenta columnas',`${numACol(c1)} a ${numACol(c2)}: ${nc}`,'Incluye las dos de los extremos.'),paso('Cuenta filas',`${f1} a ${f2}: ${f2} − ${f1} + 1 = ${nf}`,'También con los extremos.',{ojo:'No olvides el +1.'}),final('Multiplica',`${nc} × ${nf} = ${marca(nc*nf)}`,'Es un rectángulo.')],
            errores:[[String((nc-1)*(nf-1)),'Cuenta también la primera columna y la primera fila (+1 en cada una).'],[String(nc+nf),'Se multiplica columnas × filas, no se suma.']],regla:R_CEL,pista:'Columnas × filas.',comprobar:()=>nc*nf>0})},
        'leer':()=>P[1]['leer'](),
        'esquina':()=>{const c1=rng.entero(1,4),c2=c1+rng.entero(1,4),f1=rng.entero(1,9),f2=f1+rng.entero(2,20),r=`${ref(c1,f1)}:${ref(c2,f2)}`,q=ref(c2,f2);
          return valorQ({enunciado:`En el rango <b>${r}</b>, ¿cuál es la celda de la esquina inferior derecha?`,respuesta:q,pasos:[paso('Un rango se escribe esquina:esquina',`${ref(c1,f1)} arriba a la izquierda`,'Así lo escribe Excel.'),final('La segunda es la de abajo a la derecha',marca(q),'Última columna y última fila.')],errores:[[ref(c1,f2),'Esa es la esquina inferior IZQUIERDA.'],[ref(c2,f1),'Esa es la esquina superior derecha.']],regla:R_CEL,pista:'Mira la parte después de los dos puntos.',clave:'esq'+r})}},
      3:{'rango-de':()=>{const t=tablaVentas(rng,rng.entero(5,10)),k=rng.elegir(['Unidades','Precio','Vendedor','Región']),r=rangoCol(t,k);
          return rangoQ(`Escribe el rango con todos los datos de <b>${k}</b> (sin el encabezado).`,r,[paso('Columna',`${k} está en la columna ${col(t,k)}`,'Busca el encabezado.'),paso('Filas de datos',`De la 2 a la ${ultima(t)}`,'La fila 1 es el encabezado.'),final('Rango',marca(r),'Primera:última.')],
            [[`${col(t,k)}1:${col(t,k)}${ultima(t)}`,'Ese rango incluye el encabezado (fila 1).'],[`${col(t,k)}2:${col(t,k)}${ultima(t)-1}`,'Te faltó la última fila.']],hoja(aCeldas(t)),k+ultima(t))},
        'contar':()=>P[2]['contar'](),
        'fila-de':()=>{const t=tablaCalif(rng,rng.entero(5,9)),i=rng.entero(0,t.filas.length-1),q=t.filas[i][0],r=`B${i+2}:D${i+2}`;
          return rangoQ(`Escribe el rango con las tres calificaciones (Parcial 1, Parcial 2 y Final) de <b>${q}</b>.`,r,[paso('Fila del alumno',`${q} está en la fila ${i+2}`,'Busca el nombre en la columna A.'),paso('Columnas','Parcial 1 = B · Final = D','De B a D.'),final('Rango',marca(r),'Una fila, tres columnas.')],
            [[`A${i+2}:D${i+2}`,'Ese rango incluye el nombre (columna A).'],[`B${i+1}:D${i+1}`,'Esa es la fila de arriba.']],hoja(aCeldas(t)),q+i)}},
      4:{'dos-rangos':()=>{const a=[rng.entero(1,3),rng.entero(2,5)],b=[rng.entero(1,2),rng.entero(3,8)],r1=`A1:${ref(a[0],a[1])}`,r2=`D1:${ref(3+b[0],b[1])}`,v=a[0]*a[1]+b[0]*b[1];
          return valorQ({enunciado:`¿Cuántas celdas suma <code>=SUMA(${r1};${r2})</code>?`,respuesta:String(v),numero:v,pasos:[paso('Primer rango',`${r1}: ${a[0]} × ${a[1]} = ${a[0]*a[1]}`,'Columnas × filas.'),paso('Segundo rango',`${r2}: ${b[0]} × ${b[1]} = ${b[0]*b[1]}`,'El ; separa rangos distintos.'),final('Súmalos',`${a[0]*a[1]} + ${b[0]*b[1]} = ${marca(v)}`,'Son dos rectángulos.')],errores:[[String(a[0]*a[1]),'El «;» agrega un segundo rango: cuéntalo también.']],regla:R_CEL,pista:'Cuenta cada rango y súmalos.'})},
        'rango-de':()=>P[3]['rango-de'](),'fila-de':()=>P[3]['fila-de']()},
      5:{'tabla':()=>{const t=tablaInventario(rng,rng.entero(5,10)),r=`A1:E${ultima(t)}`;
          return rangoQ('Escribe el rango de TODA la tabla, con encabezados, para convertirla en tabla o crear una tabla dinámica.',r,[paso('Esquina superior izquierda','A1 (primer encabezado)','Incluye encabezados.'),paso('Esquina inferior derecha',`Columna E, fila ${ultima(t)}`,'Último dato.'),final('Rango',marca(r),'Toda la tabla.')],
            [[`A2:E${ultima(t)}`,'Para una tabla dinámica hacen falta los encabezados (fila 1).'],[`A1:D${ultima(t)}`,'Te faltó la última columna (Precio).']],hoja(aCeldas(t)),'t'+ultima(t))},
        'dos-rangos':()=>P[4]['dos-rangos'](),'fila-de':()=>P[3]['fila-de']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- Tipos de datos ---------- */
const R_TIP='Excel distingue números (se alinean a la derecha y se pueden sumar), textos (a la izquierda), fechas (números de serie con formato), valores lógicos (VERDADERO/FALSO) y fórmulas (empiezan con =).';
const TIPOS=[['1200','número'],['Ventas','texto'],['15/03/2024','fecha'],['=B2*C2','fórmula'],['VERDADERO','lógico'],['25%','número'],['Calle 5 #12','texto'],["'00123",'texto'],['=SUMA(A1:A5)','fórmula'],['3.1416','número'],['01/12/2025','fecha'],['FALSO','lógico'],['N/D','texto'],['-45','número']];
const tiposDatos={
  titulo:'Tipos de datos',
  explicacion:'Cada celda guarda un tipo de dato: <b>número</b> (se alinea a la derecha), <b>texto</b> (a la izquierda), <b>fecha</b> (un número de serie con formato de fecha), <b>lógico</b> (VERDADERO o FALSO) o <b>fórmula</b> (empieza con =). Con texto no se puede hacer cuentas: <code>="Ana"+1</code> da #¡VALOR!. SUMA ignora los textos de un rango.',
  alternativa:'Piensa en cajones con etiqueta: en el de números puedes sumar; en el de textos solo guardas palabras. Si mezclas, Excel se queja (#¡VALOR!) o ignora lo que no es número.',
  referencia:'Ver: Soporte de Microsoft, «Tipos de datos en Excel».',
  profundidad:prof,item:true,
  generar(n,rng){
    const t=tablaVentas(rng,6),h=crearHoja(aCeldas(t,{C8:'pendiente'}));
    const evalQ=(f,porque,ind)=>{const v=evaluar(h,f),s=mostrar(v);return valorQ({enunciado:`Con la hoja a la vista, ¿qué devuelve <code>${f}</code>?`,respuesta:s,numero:typeof v==='number'?v:undefined,hoja:hoja(h.celdas),
      pasos:[paso('Mira el tipo de cada celda',porque,'El tipo decide qué puede hacer Excel.'),final('Resultado',marca(s),'Así lo muestra Excel.')],errores:esError(v)?[['0','Con un texto en la cuenta, Excel no da 0: da #¡VALOR!.']]:[['#¡VALOR!','Aquí no hay error: '+porque]],regla:R_TIP,pista:'¿Hay textos o celdas vacías?',comprobar:()=>!ind||mostrar(ind())===s,clave:f+JSON.stringify(t.filas)})};
    const P={
      1:{'tipo':()=>{const [x,tp]=rng.elegir(TIPOS);return valorQ({enunciado:`¿Qué tipo de dato es <code>${x}</code>? (número, texto, fecha, lógico o fórmula)`,respuesta:tp,alternativas:tp==='lógico'?['booleano','logico']:tp==='fórmula'?['formula']:tp==='número'?['numero','numérico']:[],
          pasos:[paso('Mira cómo empieza y qué contiene',x.startsWith('=')?'Empieza con =':x.startsWith("'")?'Empieza con apóstrofo: se guarda como texto':/^(VERDADERO|FALSO)$/.test(x)?'Es VERDADERO o FALSO':/\d+\/\d+\/\d+/.test(x)?'Tiene forma de fecha':/^-?[\d.]+%?$/.test(x)?'Solo cifras (el % es formato)':'Tiene letras','Cada tipo se reconoce así.'),final('Tipo',marca(tp),'Excel lo trata como '+tp+'.')],
          errores:TIPOS.filter(([,y])=>y!==tp).slice(0,2).map(([,y])=>[y,'No: '+R_TIP]),regla:R_TIP,pista:'¿Empieza con =? ¿Tiene letras?',clave:'t'+x})},
        'alinea':()=>{const [x,tp]=rng.elegir(TIPOS.filter(([,y])=>y==='número'||y==='texto')),a=tp==='número'?'derecha':'izquierda';return valorQ({enunciado:`Con alineación automática, ¿hacia qué lado se ve <code>${x}</code> en la celda? (izquierda o derecha)`,respuesta:a,alternativas:['a la '+a],
          pasos:[paso('¿Es número o texto?',`${x} → ${tp}`,'Excel lo detecta al escribir.'),final('Alineación',marca(a),'Números a la derecha, textos a la izquierda.')],errores:[[a==='derecha'?'izquierda':'derecha','Números a la derecha, textos a la izquierda.']],regla:R_TIP,pista:'¿Se puede sumar?',clave:'a'+x})}},
      2:{'ceros':()=>{const k=rng.entero(1,999),s=String(k).padStart(5,'0');return valorQ({enunciado:`Escribes <code>${s}</code> en una celda con formato General. ¿Qué número se ve?`,respuesta:String(k),numero:k,
          pasos:[paso('Excel lo reconoce como número',s,'Los ceros a la izquierda no cambian el valor.'),final('Se ve',marca(k),'Para conservarlos: apóstrofo (\''+s+') o formato Texto.')],errores:[[s,'Como número, los ceros de la izquierda desaparecen (usa \' para guardarlo como texto).']],regla:R_TIP,pista:'¿Cuánto vale ese número?',clave:'c'+s})},
        'tipo':()=>P[1]['tipo'](),'alinea':()=>P[1]['alinea']()},
      3:{'texto-mas':()=>evalQ('=A2+1','A2 tiene un texto (el vendedor): no se puede sumar → #¡VALOR!'),
        'suma-texto':()=>evalQ('=SUMA(D2:D8)','D2:D8 tiene números y D8 está vacía: SUMA solo suma los números',()=>sum(valores(t,'Unidades'))),
        'vacia':()=>evalQ('=D10*2+5','D10 está vacía: en una cuenta vale 0',()=>5)},
      4:{'suma-con-texto':()=>evalQ('=SUMA(C2:C8)','C2:C8 son textos (productos y «pendiente»): SUMA los ignora',()=>0),
        'concat':()=>evalQ('=A2&D2','& une como texto: el nombre y el número pegados',()=>t.filas[0][0]+t.filas[0][3]),
        'texto-mas':()=>P[3]['texto-mas']()},
      5:{'mas-directo':()=>{const v=rng.entero(2,90);return evalQ(`="${v}"+D3`,`"${v}" es texto con forma de número: en una suma, Excel lo convierte`,()=>v+t.filas[1][3])},
        'suma-con-texto':()=>P[4]['suma-con-texto'](),'vacia':()=>P[3]['vacia']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- Formato de números y fechas ---------- */
const R_FMT='El formato cambia cómo se VE un número, no lo que vale: 0.25 con formato % se ve 25%; una fecha es un número de serie (01/01/2024 = 45292) con formato de fecha.';
const fmtMoneda=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const formato={
  titulo:'Formato de números y fechas',
  explicacion:'El <b>formato</b> cambia cómo se ve un número, no su valor. 0.256 con formato porcentaje sin decimales se ve <b>26%</b>; 1234.5 con formato moneda se ve <b>$1,234.50</b>. Las fechas son números de serie: el 01/01/2024 es el 45292; por eso puedes restar fechas para saber cuántos días hay entre ellas.',
  alternativa:'Es como ponerle lentes a un número: la celda sigue teniendo el mismo valor, pero lo muestra con signo de pesos, con % o como fecha. Si quitas el formato, aparece el número de siempre.',
  referencia:'Ver: Soporte de Microsoft, «Formatos de número disponibles en Excel».',
  profundidad:prof,
  generar(n,rng){
    const base=serial(2024,1,1);
    const P={
      1:{'porcentaje':()=>{const v=rng.entero(10,980)/1000,s=Math.round(v*100)+'%';return valorQ({enunciado:`Una celda tiene <b>${v}</b> y le das formato <b>Porcentaje sin decimales</b>. ¿Qué se ve?`,respuesta:s,alternativas:[s.replace('%',' %')],
          pasos:[paso('Porcentaje = valor × 100',`${v} × 100 = ${+(v*100).toFixed(1)}`,'El formato % multiplica por 100 al mostrar.'),final('Sin decimales: redondea',marca(s),'El valor guardado sigue siendo '+v+'.')],errores:[[`${v}%`,'El formato % multiplica por 100 al mostrar.'],[`${Math.round(v*1000)/10}%`,'Sin decimales: redondea al entero.']],regla:R_FMT,pista:'Multiplica por 100.',comprobar:()=>mostrar(v,'%0')===s})},
        'moneda':()=>{const v=rng.entero(100,99999)+rng.elegir([0,0.5,0.25,0.75]),s=fmtMoneda(v);return valorQ({enunciado:`Una celda tiene <b>${v}</b> con formato <b>Moneda</b> (2 decimales). ¿Qué se ve?`,respuesta:s,alternativas:[s.replace('$',''),s.replace(/,/g,''),s.replace('$','').replace(/,/g,''),'$ '+s.slice(1)],
          pasos:[paso('Separador de miles',`${Math.floor(v).toLocaleString('en-US')}`,'Cada 3 cifras.'),final('Signo y 2 decimales',marca(s),'Siempre dos decimales.')],errores:[[`$${v}`,'El formato moneda muestra siempre 2 decimales y separa los miles.']],regla:R_FMT,pista:'$, separador de miles y 2 decimales.',comprobar:()=>mostrar(v,'moneda')===s})}},
      2:{'decimales':()=>{const v=+(rng.entero(1000,99999)/1000+rng.entero(0,9)/100000).toFixed(5),d=rng.entero(0,2),s=v.toFixed(d);return valorQ({enunciado:`Una celda tiene <b>${v}</b> y le pones formato con <b>${d}</b> decimal${d===1?'':'es'}. ¿Qué se ve?`,respuesta:s,numero:+s,tolerancia:1e-12,
          pasos:[paso('Mira la cifra siguiente',`${v}`,'Si es 5 o más, sube.'),final('Se ve',marca(s),'Pero la celda sigue valiendo '+v+'.')],errores:[[String(Math.trunc(v*10**d)/10**d),'El formato redondea, no corta.']].filter(([x])=>+x!==+s),regla:R_FMT,pista:'Redondea a esa cantidad de decimales.'})},
        'fecha-serial':()=>{const k=rng.entero(1,58),v=base+k,s=textoFecha(v);return valorQ({enunciado:`Si 45292 es el 01/01/2024, ¿qué fecha (dd/mm/aaaa) se ve en una celda con <b>${v}</b> y formato de fecha?`,respuesta:s,alternativas:[s.replace(/^0/,'').replace(/\/0/,'/')],
          pasos:[paso('Diferencia en días',`${v} − 45292 = ${k}`,'Cada número es un día.'),final('Cuenta desde el 1 de enero',marca(s),'Enero tiene 31 días; febrero 2024, 29.')],errores:[[textoFecha(v-1),'Cuenta bien: el 45292 ya es el día 1.']],regla:R_FMT,pista:'Cada número de serie es un día.'})},
        'porcentaje':()=>P[1]['porcentaje']()},
      3:{'valor-real':()=>{const v=+(rng.entero(1000,9999)/1000).toFixed(3)+0.0004,f=rng.elegir([10,100]),res=+(v*f).toFixed(6);return valorQ({enunciado:`A1 tiene <b>${v}</b> pero, con formato de 2 decimales, se ve <b>${v.toFixed(2)}</b>. ¿Qué da <code>=A1*${f}</code>?`,respuesta:String(res),numero:res,tolerancia:1e-9,
          pasos:[paso('El formato no cambia el valor',`A1 vale ${v}`,'Solo cambia cómo se ve.'),final('Multiplica el valor real',`${v} × ${f} = ${marca(res)}`,'Por eso a veces los totales "no cuadran" con lo que se ve.')],errores:[[String(+(+v.toFixed(2)*f).toFixed(4)),'Usaste lo que se ve; Excel calcula con el valor completo.']],regla:R_FMT,pista:'¿Qué vale A1 de verdad?'})},
        'serial-de':()=>{const k=rng.entero(1,58),v=base+k,s=textoFecha(v);return valorQ({enunciado:`Si 01/01/2024 = 45292, ¿qué número de serie guarda Excel para el <b>${s}</b>?`,respuesta:String(v),numero:v,
          pasos:[paso('Días desde el 1 de enero',`${k}`,'Enero 31 días, febrero 29 (2024).'),final('Suma',`45292 + ${k} = ${marca(v)}`,'Un número por día.')],errores:[[String(v+1),'El 1 de enero ya es 45292: suma solo los días que pasan.']],regla:R_FMT,pista:'Cuenta los días desde el 01/01/2024.'})},
        'decimales':()=>P[2]['decimales']()},
      4:{'resta':()=>{const a=base+rng.entero(0,40),b=a+rng.entero(3,90);return valorQ({enunciado:`A1 = <b>${textoFecha(a)}</b> y A2 = <b>${textoFecha(b)}</b> (fechas). ¿Qué da <code>=A2-A1</code> (con formato General)?`,respuesta:String(b-a),numero:b-a,
          pasos:[paso('Las fechas son números',`${textoFecha(b)} = ${b} · ${textoFecha(a)} = ${a}`,'Números de serie.'),final('Resta',`${b} − ${a} = ${marca(b-a)}`,'Días entre las dos fechas.')],errores:[[String(b-a+1),'La resta no cuenta el primer día.']],regla:R_FMT,pista:'Resta los números de serie.',comprobar:()=>evaluar(crearHoja({A1:a,A2:b}),'=DIAS(A2;A1)')===b-a})},
        'pct-valor':()=>{const p=rng.entero(1,199)/2,v=p/100;return valorQ({enunciado:`Una celda muestra <b>${p}%</b>. ¿Qué número tiene guardado?`,respuesta:String(v),numero:v,
          pasos:[paso('El % multiplica por 100 al mostrar',`Se ve ${p}%`,'Formato.'),final('Divide entre 100',`${p} ÷ 100 = ${marca(v)}`,'Valor real.')],errores:[[String(p),'Ese es el número que se ve; guarda el valor entre 100.']],regla:R_FMT,pista:'Divide entre 100.'})},
        'valor-real':()=>P[3]['valor-real']()},
      5:{'fecha-mas':()=>{const a=serial(2024,2,rng.entero(20,28)),k=rng.entero(2,20),s=textoFecha(a+k);return valorQ({enunciado:`A1 = <b>${textoFecha(a)}</b>. ¿Qué fecha muestra <code>=A1+${k}</code> con formato de fecha? (dd/mm/aaaa)`,respuesta:s,
          pasos:[paso('Sumar a una fecha suma días',`${a} + ${k} = ${a+k}`,'Número de serie.'),final('Pásalo a fecha',marca(s),'2024 es bisiesto: febrero tiene 29 días.',{ojo:'No olvides el 29 de febrero.'})],errores:[[textoFecha(a+k+1),'2024 es bisiesto: febrero tiene 29 días.']],regla:R_FMT,pista:'Febrero de 2024 tiene 29 días.',comprobar:()=>evaluar(crearHoja({A1:a}),`=FECHA(2024;2;${+textoFecha(a).slice(0,2)+k})`)===a+k})},
        'resta':()=>P[4]['resta'](),'pct-valor':()=>P[4]['pct-valor']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- Operadores y fórmulas básicas ---------- */
const R_OP='Una fórmula empieza con =. Excel calcula primero paréntesis, luego potencias (^), luego * y /, y al final + y −.';
const conTotal=(t,extra={})=>({celdas:aCeldas(t,extra),tabla:t});
const operadores={
  titulo:'Fórmulas y operadores',
  explicacion:'Toda fórmula empieza con <b>=</b>: <code>=D2*E2</code> multiplica las celdas D2 y E2. Operadores: + − * / ^ y & (unir textos). Orden: <b>paréntesis → ^ → * y / → + y −</b>. Usa referencias (D2) en vez de escribir los números: si el dato cambia, el resultado se actualiza solo.',
  alternativa:'Una fórmula es una receta: "toma lo de D2 y multiplícalo por lo de E2". Si cambian los ingredientes, el resultado se recalcula solo. Y como en matemáticas, primero multiplicas y luego sumas, salvo que pongas paréntesis.',
  referencia:'Ver: Soporte de Microsoft, «Usar operadores de cálculo en fórmulas de Excel».',
  profundidad:prof,
  generar(n,rng){
    const num=()=>rng.entero(2,12);
    const precedencia=dificil=>{const a=num(),b=num(),c=num(),d=rng.entero(1,4);
      const [f,v,mal,porMal]=dificil?rng.elegir([[`=${a}+${b}^2*${d}`,a+b*b*d,(a+b)**2*d,'La potencia va primero, luego la multiplicación y al final la suma.'],[`=${a*c}/${c}-${b}*${d}`,a-b*d,(a*c/c-b)*d,'* y / van antes que la resta.'],[`=(${a}+${b})^2-${c}`,(a+b)**2-c,a+b*b-c,'Los paréntesis van primero.']])
        :rng.elegir([[`=${a}+${b}*${c}`,a+b*c,(a+b)*c,'Primero se multiplica y luego se suma.'],[`=(${a}+${b})*${c}`,(a+b)*c,a+b*c,'Con paréntesis, primero la suma.'],[`=${a*b}/${b}+${c}`,a+c,a*b/(b+c),'Primero la división, luego la suma.']]);
      return valorQ({enunciado:`¿Qué resultado da <code>${f}</code>?`,respuesta:String(v),numero:v,pasos:[paso('Orden de las operaciones','( ) → ^ → * / → + −','Como en matemáticas.'),final('Calcula',`${f.slice(1)} = ${marca(v)}`,'Resultado.')],errores:[[String(+mal.toFixed(4)),porMal]],regla:R_OP,pista:'Paréntesis, potencias, * y /, + y −.',comprobar:()=>evaluar(crearHoja(),f)===v,clave:f})};
    const fila=(t,i,k)=>t.filas[i][t.cab.indexOf(k)];
    const P={
      1:{'precedencia':()=>precedencia(false),
        'total':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Total'}),destino:'F2',formula:'=D2*E2',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> la fórmula del <b>Total</b> (Unidades × Precio). Se copiará hacia abajo a todas las filas.',
          pasos:[paso('Ubica los datos de la fila 2','Unidades en D2, Precio en E2','Usa referencias, no los números.'),final('Multiplica',`${code('=D2*E2')}`,'Al copiarla, cada fila usa sus propias celdas.')],
          errores:[['=D2+E2','El total es Unidades × Precio: se multiplica.'],['=D3*E3','Empieza en la fila 2, la misma de la celda F2.']],regla:R_OP,pista:'Unidades por precio de la misma fila.',
          esperado:d=>d.tabla.filas.map(f=>f[3]*f[4]),formatos:d=>formatosDe(d.tabla,{Precio:'moneda'})})}},
      2:{'total':()=>P[1]['total'](),'precedencia':()=>precedencia(false),
        'iva':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Con IVA'}),destino:'F2',formula:'=E2*1.16',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> el <b>Precio con IVA</b> del 16 % (se copiará hacia abajo).',
          pasos:[paso('Precio + 16 % del precio',`E2 + E2 × 0.16`,'Sumar el 16 %.'),final('Es lo mismo que × 1.16',`${code('=E2*1.16')}`,'Más corto (también vale =E2*(1+16%)).')],
          errores:[['=E2*16%','Eso es solo el IVA; súmale el precio: × 1.16.'],['=E2+16%','16% vale 0.16: sumarlo no agrega el impuesto.']],regla:R_OP,pista:'Precio × 1.16.',esperado:d=>d.tabla.filas.map(f=>f[4]*1.16)})}},
      3:{'promedio-manual':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Promedio'}),destino:'F2',formula:'=(B2+C2+D2)/3',copiar:m-1,
          enunciado:'Sin usar funciones, escribe en <b>F2</b> el promedio de Parcial 1, Parcial 2 y Final (se copiará hacia abajo).',
          pasos:[paso('Suma las tres',`B2 + C2 + D2`,'Promedio = suma ÷ cantidad.'),final('Entre paréntesis y divide entre 3',`${code('=(B2+C2+D2)/3')}`,'Sin paréntesis solo dividirías D2.',{ojo:'La división va antes que la suma.'})],
          errores:[['=B2+C2+D2/3','Sin paréntesis solo divides la última calificación: la división va antes que la suma.']],regla:R_OP,pista:'Suma entre paréntesis y luego ÷ 3.',esperado:d=>d.tabla.filas.map(f=>(f[1]+f[2]+f[3])/3)})},
        'descuento':()=>{const m=rng.entero(5,9),dto=rng.elegir([5,10,15,20,25]);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Con descuento'}),destino:'F2',formula:`=D2*E2*(1-${dto}%)`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b> el total con <b>${dto} % de descuento</b> (Unidades × Precio, menos el descuento).`,
          pasos:[paso('Total sin descuento','D2*E2','Unidades × Precio.'),final(`Pagas el ${100-dto} %`,`${code(`=D2*E2*(1-${dto}%)`)}`,`1 − ${dto}% = ${(100-dto)/100}.`)],
          errores:[[`=D2*E2*${dto}%`,'Eso es solo el descuento, no lo que se paga.'],[`=D2*E2-${dto}%`,`Restar ${dto}% es restar ${dto/100}: hay que multiplicar por (1 − ${dto}%).`]],regla:R_OP,pista:'Multiplica por (1 − descuento).',esperado:d=>d.tabla.filas.map(f=>f[3]*f[4]*(100-dto)/100)})},
        'precedencia':()=>precedencia(true)},
      4:{'horas-extra':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaNomina(r,m),{F1:'Pago extra'}),destino:'F2',formula:'=D2*C2/240*2',copiar:m-1,
          enunciado:'Cada hora extra se paga doble. La hora normal vale Sueldo ÷ 240 (30 días × 8 horas). Escribe en <b>F2</b> el pago de las horas extra.',
          pasos:[paso('Valor de la hora','C2/240','Sueldo mensual entre 240 horas.'),paso('Hora extra = doble','C2/240*2','Se paga al doble.'),final('Por la cantidad de horas',`${code('=D2*C2/240*2')}`,'* y / se hacen de izquierda a derecha.')],
          errores:[['=D2*C2/240','Te faltó pagar doble (× 2).'],['=D2*C2/(240*2)','Así pagas la mitad: el doble es × 2, no ÷ 2.']],regla:R_OP,pista:'Horas × (sueldo ÷ 240) × 2.',esperado:d=>d.tabla.filas.map(f=>f[3]*f[2]/240*2)})},
        'promedio-manual':()=>P[3]['promedio-manual'](),'descuento':()=>P[3]['descuento']()},
      5:{'pct-total':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'% de unidades'}),destino:'F2',formula:`=D2/SUMA($D$2:$D$${m+1})`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b> qué parte del total de unidades vendió cada vendedor (Unidades ÷ suma de todas las unidades). Se copiará hacia abajo.`,
          pasos:[paso('Total de unidades',`SUMA(D2:D${m+1})`,'El mismo para todas las filas.'),paso('Fíjalo con $',`$D$2:$D$${m+1}`,'Si no, al copiar el rango se mueve.',{ojo:'Sin $, en la fila 3 sumaría D3:D'+(m+2)+'.'}),final('Divide',`${code(`=D2/SUMA($D$2:$D$${m+1})`)}`,'Dale formato % para verlo como porcentaje.')],
          errores:[[`=D2/SUMA(D2:D${m+1})`,'Sin $, al copiar hacia abajo el rango del total se mueve y deja fuera filas.']],regla:R_OP,pista:'Divide entre el total y fija el rango con $.',esperado:d=>{const s=sum(valores(d.tabla,'Unidades'));return d.tabla.filas.map(f=>f[3]/s)},formatos:()=>({})})},
        'horas-extra':()=>P[4]['horas-extra'](),'precedencia':()=>precedencia(true)}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- Referencias relativas, absolutas y mixtas ---------- */
const R_REF='Al copiar una fórmula, las referencias relativas (B2) se mueven; con $ quedan fijas: $B$2 no se mueve, $B2 fija la columna y B$2 la fila. En Excel, F4 pone los $.';
const normF=s=>String(s).toUpperCase().replace(/\s/g,'').replace(/^=?/,'=').replace(/;/g,',');
const copiaQ=(f,de,a,extra)=>{const r=copiarFormula(f,de,a);return {enunciado:`Copias <code>${f}</code> de <b>${de}</b> a <b>${a}</b>. ¿Qué fórmula queda en ${a}?`,respuesta:r,verificar:e=>normF(e)===normF(r),
  pasos:[paso('¿Cuánto se mueve?',`De ${de} a ${a}`,'Columnas y filas de diferencia.'),...(extra||[]),final('Mueve lo que no tiene $',marca(r),'Lo que lleva $ se queda igual.',r)],
  errores:[[f,'Al copiar, las referencias sin $ se mueven.'],[copiarFormula(f.replace(/\$/g,''),de,a),'Lo que tiene $ no se mueve.']].filter(([v])=>normF(v)!==normF(r)).map(([v,por])=>({valor:v,si:e=>normF(e)===normF(v),por})),
  regla:R_REF,pista:'Mueve solo lo que no tiene $.',comprobar:()=>true,clave:f+de+a}};
const referencias={
  titulo:'Referencias relativas, absolutas y mixtas',
  explicacion:'Al copiar una fórmula, sus referencias se <b>mueven</b>: =B2*C2 copiada una fila abajo queda =B3*C3 (relativa). Con <b>$</b> se fijan: <b>$H$2</b> no se mueve nunca (absoluta), <b>$A2</b> fija la columna y <b>B$1</b> la fila (mixtas). Fija con $ el dato que comparten todas las filas, como un tipo de cambio.',
  alternativa:'Una referencia relativa es "la celda que está dos a la izquierda": si te mueves, apunta a otra. Una absoluta ($H$2) es una dirección exacta: desde donde la copies, siempre es la misma casa. El $ es un "candado".',
  referencia:'Ver: Soporte de Microsoft, «Cambiar entre referencias relativas, absolutas y mixtas».',
  profundidad:prof,
  generar(n,rng){
    const f0=rng.entero(2,5),d=rng.entero(2,8);
    const P={
      1:{'relativa':()=>copiaQ(`=B${f0}*C${f0}`,`D${f0}`,`D${f0+d}`),'columna':()=>copiaQ(`=B${f0}+C${f0}`,`D${f0}`,`${numACol(4+rng.entero(1,3))}${f0}`)},
      2:{'absoluta':()=>copiaQ(`=B${f0}*$G$1`,`D${f0}`,`D${f0+d}`),'relativa':()=>P[1]['relativa'](),
        'cual-fija':()=>{const h=numACol(rng.entero(6,8))+rng.entero(1,3);return valorQ({enunciado:`En <code>=B2*$${h.replace(/(\d)/,'$$$1')}</code>, ¿qué celda NO cambia al copiar la fórmula?`,respuesta:h,
          pasos:[paso('Busca los $',`$${h[0]}$${h.slice(1)}`,'El $ fija.'),final('Esa queda fija',marca(h),'B2 sí se mueve.')],errores:[['B2','B2 no tiene $: se mueve.']],regla:R_REF,pista:'La que tiene $.',clave:'cf'+h})}},
      3:{'tipo-cambio':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>({...conTotal(tablaVentas(r,m),{F1:'Precio USD',H1:'Tipo de cambio',H2:r.entero(160,210)/10}),}),destino:'F2',formula:'=E2/$H$2',copiar:m-1,
          enunciado:'El tipo de cambio está en <b>H2</b>. Escribe en <b>F2</b> el precio en dólares (Precio ÷ tipo de cambio) de modo que funcione al copiarla hacia abajo.',
          pasos:[paso('Precio de la fila','E2','Relativa: al copiar baja a E3, E4…'),paso('Tipo de cambio','$H$2','Absoluta: todas las filas usan la misma celda.',{ojo:'Sin $, en la fila 3 usaría H3, que está vacía.'}),final('Divide',`${code('=E2/$H$2')}`,'F4 pone los $ en Excel.')],
          errores:[['=E2/H2','Sin $, al copiar hacia abajo H2 se vuelve H3 (vacía) y da #¡DIV/0!.']],regla:R_REF,pista:'Fija el tipo de cambio con $.',esperado:d=>d.tabla.filas.map(f=>f[4]/d.celdas.H2)})},
        'absoluta':()=>P[2]['absoluta'](),
        'comision':()=>{const m=rng.entero(5,9);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Comisión',H1:'% comisión',H2:r.entero(2,9)/100}),destino:'F2',formula:'=D2*E2*$H$2',copiar:m-1,
          enunciado:'El porcentaje de comisión está en <b>H2</b>. Escribe en <b>F2</b> la comisión de cada vendedor (Unidades × Precio × %), lista para copiar hacia abajo.',
          pasos:[paso('Venta de la fila','D2*E2','Relativas.'),final('Por el % fijo',`${code('=D2*E2*$H$2')}`,'El % es el mismo para todos: va con $.')],
          errores:[['=D2*E2*H2','Sin $, al copiar H2 se mueve a H3 (vacía) y la comisión da 0.']],regla:R_REF,pista:'El porcentaje es el mismo para todas las filas.',esperado:d=>d.tabla.filas.map(f=>f[3]*f[4]*d.celdas.H2)})}},
      4:{'mixta':()=>copiaQ(`=$A${f0}*B$1`,`B${f0}`,`${numACol(2+rng.entero(1,3))}${f0+d}`,[paso('$A fija la columna A; $1 fija la fila 1','$A… y …$1','Mixtas.')]),
        'tipo-cambio':()=>P[3]['tipo-cambio'](),'comision':()=>P[3]['comision']()},
      5:{'tabla':()=>{const k=rng.entero(3,4),destinos=[];for(let f=2;f<2+k;f++)for(let c=2;c<2+k;c++)destinos.push(ref(c,f));
          return formulaQ({rng,datos:r=>{const c={A1:'×'};for(let i=0;i<k;i++){c[ref(i+2,1)]=r.entero(2,15);c['A'+(i+2)]=r.entero(2,15)}return {celdas:c}},destino:'B2',formula:'=$A2*B$1',destinos,
            enunciado:`Escribe en <b>B2</b> una sola fórmula que, copiada a todo el rango B2:${ref(k+1,k+1)}, multiplique el número de la columna A de su fila por el número de la fila 1 de su columna.`,
            pasos:[paso('El de la columna A','$A2','Fija la columna (A) y deja moverse la fila.'),paso('El de la fila 1','B$1','Fija la fila (1) y deja moverse la columna.'),final('Multiplica',`${code('=$A2*B$1')}`,'Referencias mixtas: un $ en cada una.')],
            errores:[['=A2*B1','Sin $, al copiar se mueven las dos referencias.'],['=$A$2*$B$1','Con todo fijo sale el mismo número en toda la tabla.'],['=A$2*$B1','Pusiste los $ al revés.']],regla:R_REF,pista:'Un $ antes de la A y otro antes del 1.',
            esperado:d=>destinos.map(x=>{const c=x.charCodeAt(0)-64,f=+x.slice(1);return d.celdas['A'+f]*d.celdas[ref(c,1)]})})},
        'mixta':()=>P[4]['mixta'](),'tipo-cambio':()=>P[3]['tipo-cambio']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- SUMA y PROMEDIO ---------- */
const R_SUM=`SUMA (SUM) suma los números de un rango; PROMEDIO (AVERAGE) los suma y divide entre cuántos números hay (ignora textos y celdas vacías). ${SEP}`;
const sumaPromedio={
  titulo:'SUMA y PROMEDIO',
  explicacion:`<code>=SUMA(D2:D9)</code> suma un rango; <code>=PROMEDIO(B2:B9)</code> saca su promedio. Escribe el rango sin el encabezado. También puedes sumar varios rangos: <code>=SUMA(B2:B9;D2:D9)</code>. ${fn('SUMA')} · ${fn('PROMEDIO')}.`,
  alternativa:'SUMA es la calculadora que suma toda la columna de un jalón; PROMEDIO es "si todos hubieran sacado lo mismo, ¿cuánto sería?". Solo dile dónde empieza y dónde termina el rango.',
  referencia:'Ver: Soporte de Microsoft, «Función SUMA» y «Función PROMEDIO».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9),u=m+1,abajo=`${u+1}`;
    const total=(gen,k,fnN,etq)=>formulaQ({rng,datos:r=>{const t=gen(r,m);return {celdas:aCeldas(t,{[`A${u+1}`]:etq}),tabla:t}},destino:`${colDe(gen,k)}${u+1}`,formula:`=${fnN}(${colDe(gen,k)}2:${colDe(gen,k)}${u})`,
      enunciado:`Escribe en <b>${colDe(gen,k)}${u+1}</b> ${fnN==='SUMA'?'el total':'el promedio'} de <b>${k}</b>.`,
      pasos:[paso('Rango de datos',`${colDe(gen,k)}2:${colDe(gen,k)}${u}`,'Sin el encabezado.'),final(`Usa ${fn(fnN)}`,code(`=${fnN}(${colDe(gen,k)}2:${colDe(gen,k)}${u})`),fnN==='SUMA'?'Suma todo el rango.':'Suma y divide entre cuántos hay.')],
      errores:[[`=${fnN}(${colDe(gen,k)}2:${colDe(gen,k)}${u-1})`,'Te faltó la última fila.'],[`=${fnN==='SUMA'?'PROMEDIO':'SUMA'}(${colDe(gen,k)}2:${colDe(gen,k)}${u})`,fnN==='SUMA'?'PROMEDIO divide entre la cantidad; aquí se pide el total.':'SUMA da el total; el promedio además divide entre la cantidad.']],
      regla:R_SUM,pista:`${fnN}(primera:última).`,esperado:d=>{const v=valores(d.tabla,k);return [fnN==='SUMA'?sum(v):sum(v)/v.length]}});
    const P={
      1:{'suma':()=>total(tablaVentas,'Unidades','SUMA','Total'),'promedio':()=>total(tablaCalif,rng.elegir(['Parcial 1','Parcial 2','Final']),'PROMEDIO','Promedio')},
      2:{'suma-fila':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Puntos'}),destino:'F2',formula:'=SUMA(B2:D2)',copiar:m-1,enunciado:'Escribe en <b>F2</b> la suma de los tres exámenes del alumno (se copiará hacia abajo).',
          pasos:[paso('Rango de la fila','B2:D2','Parcial 1 a Final.'),final('Suma',code('=SUMA(B2:D2)'),'Al copiar baja a B3:D3…')],errores:[['=SUMA(B2:E2)','La asistencia (E) no es un examen.'],['=SUMA(A2:D2)','La columna A es el nombre (SUMA lo ignora, pero no es parte del rango).']],regla:R_SUM,pista:'Rango de B a D en la misma fila.',esperado:d=>d.tabla.filas.map(f=>f[1]+f[2]+f[3])}),
        'suma':()=>P[1]['suma'](),'promedio':()=>P[1]['promedio']()},
      3:{'promedio-fila':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Promedio'}),destino:'F2',formula:'=PROMEDIO(B2:D2)',copiar:m-1,enunciado:'Escribe en <b>F2</b> el promedio de los tres exámenes del alumno con PROMEDIO (se copiará hacia abajo).',
          pasos:[paso('Rango de la fila','B2:D2','Tres exámenes.'),final('Promedio',code('=PROMEDIO(B2:D2)'),'Suma y divide entre 3.')],errores:[['=SUMA(B2:D2)/2','Son 3 exámenes: dividir entre 2 da de más.'],['=SUMA(B2:D2)','Eso es la suma, falta dividir.']],regla:R_SUM,pista:'PROMEDIO de B a D.',esperado:d=>d.tabla.filas.map(f=>(f[1]+f[2]+f[3])/3)}),
        'dos-columnas':()=>formulaQ({rng,datos:r=>{const t=tablaCalif(r,m);return {celdas:aCeldas(t,{[`A${u+1}`]:'Total parciales'}),tabla:t}},destino:`B${u+1}`,formula:`=SUMA(B2:C${u})`,
          enunciado:`Escribe en <b>B${u+1}</b> la suma de TODOS los puntos de Parcial 1 y Parcial 2 juntos.`,pasos:[paso('Las dos columnas forman un rectángulo',`B2:C${u}`,'Un rango puede tener varias columnas.'),final('Suma',code(`=SUMA(B2:C${u})`),'También vale =SUMA(B2:B'+u+';C2:C'+u+').')],
          errores:[[`=SUMA(B2:B${u})`,'Falta el Parcial 2 (columna C).']],regla:R_SUM,pista:'Rango de B2 a la última fila de C.',esperado:d=>[sum(d.tabla.filas.map(f=>f[1]+f[2]))]}),
        'suma-fila':()=>P[2]['suma-fila']()},
      4:{'redondeado':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Promedio'}),destino:'F2',formula:'=REDONDEAR(PROMEDIO(B2:D2);1)',copiar:m-1,enunciado:'Escribe en <b>F2</b> el promedio de los tres exámenes redondeado a 1 decimal (se copiará hacia abajo).',
          pasos:[paso('Promedio','PROMEDIO(B2:D2)','Primero el cálculo.'),final(`Envuélvelo en ${fn('REDONDEAR')}`,code('=REDONDEAR(PROMEDIO(B2:D2);1)'),'Función dentro de función: se calcula de adentro hacia afuera.')],
          errores:[['=PROMEDIO(B2:D2)','Falta redondear a 1 decimal.'],['=REDONDEAR(PROMEDIO(B2:D2);0)','El 0 redondea al entero; pide 1 decimal.']],regla:R_SUM,pista:'REDONDEAR(PROMEDIO(…);1).',esperado:d=>d.tabla.filas.map(f=>Math.round((f[1]+f[2]+f[3])/3*10+1e-9)/10)}),
        'dos-columnas':()=>P[3]['dos-columnas'](),'promedio-fila':()=>P[3]['promedio-fila']()},
      5:{'gran-total':()=>formulaQ({rng,datos:r=>{const t=tablaVentas(r,m),c=aCeldas(t,{F1:'Total',[`E${u+1}`]:'Gran total'});for(let i=2;i<=u;i++)c['F'+i]=`=D${i}*E${i}`;return {celdas:c,tabla:t}},destino:`F${u+1}`,formula:`=SUMA(F2:F${u})`,
          enunciado:`La columna F ya tiene el total de cada venta (=D2*E2…). Escribe en <b>F${u+1}</b> el gran total vendido.`,pasos:[paso('Totales por fila',`F2:F${u}`,'Ya están calculados.'),final('Súmalos',code(`=SUMA(F2:F${u})`),'Se puede sumar un rango de fórmulas.')],
          errores:[[`=SUMA(D2:D${u})*SUMA(E2:E${u})`,'Multiplicar las sumas no es lo mismo que sumar los productos.'],[`=SUMA(D2:E${u})`,'Eso suma unidades y precios revueltos.']],regla:R_SUM,pista:'Suma la columna de totales.',esperado:d=>[sum(d.tabla.filas.map(f=>f[3]*f[4]))]}),
        'redondeado':()=>P[4]['redondeado'](),'dos-columnas':()=>P[3]['dos-columnas']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};
const colDe=(gen,k)=>{const c=(gen===tablaVentas?['Vendedor','Región','Producto','Unidades','Precio']:gen===tablaCalif?['Alumno','Parcial 1','Parcial 2','Final','Asistencia']:gen===tablaInventario?['Producto','Categoría','Existencia','Mínimo','Precio']:['Empleado','Puesto','Sueldo','Horas extra','Ingreso']).indexOf(k);return numACol(c+1)};

/* ---------- CONTAR, CONTARA, MAX y MIN ---------- */
const R_CNT='CONTAR (COUNT) cuenta celdas con números; CONTARA (COUNTA) cuenta las que no están vacías (también textos); MAX y MIN dan el mayor y el menor número.';
const contarMaxMin={
  titulo:'CONTAR, CONTARA, MAX y MIN',
  explicacion:`${fn('CONTAR')} cuenta celdas con <b>números</b>; ${fn('CONTARA')} cuenta las <b>no vacías</b> (números y textos). ${fn('MAX')} y ${fn('MIN')} dan el mayor y el menor número. Ejemplo: si en Final hay calificaciones y algunos «Pendiente», CONTAR da cuántos ya tienen calificación y CONTARA cuántos alumnos hay.`,
  alternativa:'CONTAR solo cuenta las casillas con número, como quien cuenta billetes; CONTARA cuenta todo lo que tenga algo escrito, como pasar lista. MAX y MIN buscan al más alto y al más bajo de la fila.',
  referencia:'Ver: Soporte de Microsoft, «Función CONTAR», «Función CONTARA», «Función MAX».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(6,9),u=m+1,falt=rng.entero(1,3);
    const datos=r=>{const t=tablaCalif(r,m,{faltan:falt});return {celdas:aCeldas(t,{[`A${u+1}`]:'Resultado'}),tabla:t}};
    const nums=(d,k)=>valores(d.tabla,k).filter(x=>typeof x==='number');
    const q=(dest,formula,enun,pasos,errores,esperado,extra={})=>formulaQ({rng,datos,destino:dest,formula,enunciado:enun,pasos,errores,regla:R_CNT,pista:extra.pista||'¿Números o todo lo que no esté vacío?',esperado,...extra});
    const P={
      1:{'max':()=>{const k=rng.elegir(['Parcial 1','Parcial 2']),c=colDe(tablaCalif,k);return q(`${c}${u+1}`,`=MAX(${c}2:${c}${u})`,`Escribe en <b>${c}${u+1}</b> la calificación más alta de <b>${k}</b>.`,[paso('Rango',`${c}2:${c}${u}`,'Sin encabezado.'),final(`Usa ${fn('MAX')}`,code(`=MAX(${c}2:${c}${u})`),'El mayor número.')],[[`=MIN(${c}2:${c}${u})`,'MIN da la más baja.']],d=>[Math.max(...nums(d,k))])},
        'min':()=>{const k=rng.elegir(['Parcial 1','Parcial 2']),c=colDe(tablaCalif,k);return q(`${c}${u+1}`,`=MIN(${c}2:${c}${u})`,`Escribe en <b>${c}${u+1}</b> la calificación más baja de <b>${k}</b>.`,[paso('Rango',`${c}2:${c}${u}`,'Sin encabezado.'),final(`Usa ${fn('MIN')}`,code(`=MIN(${c}2:${c}${u})`),'El menor número.')],[[`=MAX(${c}2:${c}${u})`,'MAX da la más alta.']],d=>[Math.min(...nums(d,k))])}},
      2:{'contar':()=>q(`D${u+1}`,`=CONTAR(D2:D${u})`,`En Final algunos dicen «Pendiente». Escribe en <b>D${u+1}</b> cuántos alumnos YA tienen calificación final.`,[paso('Solo los números','Los «Pendiente» son texto','CONTAR ignora los textos.'),final(`Usa ${fn('CONTAR')}`,code(`=CONTAR(D2:D${u})`),'Cuenta celdas con números.')],[[`=CONTARA(D2:D${u})`,'CONTARA también cuenta los «Pendiente» (textos).']],d=>[nums(d,'Final').length]),
        'contara':()=>q(`A${u+2}`,`=CONTARA(A2:A${u})`,`Escribe en <b>A${u+2}</b> cuántos alumnos hay en la lista (cuenta los nombres).`,[paso('Los nombres son texto','A2:A'+u,'CONTAR daría 0.'),final(`Usa ${fn('CONTARA')}`,code(`=CONTARA(A2:A${u})`),'Cuenta las celdas no vacías.')],[[`=CONTAR(A2:A${u})`,'CONTAR solo cuenta números: los nombres son texto (daría 0).']],d=>[m]),
        'max':()=>P[1]['max']()},
      3:{'rango':()=>{const c='B';return q(`B${u+1}`,`=MAX(B2:B${u})-MIN(B2:B${u})`,`Escribe en <b>B${u+1}</b> la diferencia entre la calificación más alta y la más baja de Parcial 1.`,[paso('Más alta','MAX(B2:B'+u+')','Mayor.'),paso('Más baja','MIN(B2:B'+u+')','Menor.'),final('Réstalas',code(`=MAX(B2:B${u})-MIN(B2:B${u})`),'Se llama rango (amplitud).')],[[`=MIN(B2:B${u})-MAX(B2:B${u})`,'Al revés da negativo: mayor − menor.']],d=>{const v=nums(d,'Parcial 1');return [Math.max(...v)-Math.min(...v)]})},
        'pendientes':()=>q(`D${u+1}`,`=CONTARA(D2:D${u})-CONTAR(D2:D${u})`,`Escribe en <b>D${u+1}</b> cuántos alumnos tienen la Final «Pendiente» (sin escribir el texto).`,[paso('Todos los que tienen algo',`CONTARA(D2:D${u})`,'Números y textos.'),paso('Los que tienen número',`CONTAR(D2:D${u})`,'Solo números.'),final('La diferencia son los textos',code(`=CONTARA(D2:D${u})-CONTAR(D2:D${u})`),'También vale CONTAR.SI(D2:D'+u+';"Pendiente").')],[[`=CONTAR(D2:D${u})`,'Eso cuenta los que SÍ tienen calificación.']],d=>[falt]),
        'contar':()=>P[2]['contar']()},
      4:{'mejor-fila':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Mejor'}),destino:'F2',formula:'=MAX(B2:D2)',copiar:m-1,enunciado:'Escribe en <b>F2</b> la mejor calificación de cada alumno entre sus tres exámenes (se copiará hacia abajo).',
          pasos:[paso('Rango de la fila','B2:D2','Tres exámenes.'),final('El mayor',code('=MAX(B2:D2)'),'Al copiar baja de fila.')],errores:[['=MAX(B2:B'+u+')','Ese es el mejor de la columna, no del alumno.']],regla:R_CNT,pista:'MAX de B a D en la fila.',esperado:d=>d.tabla.filas.map(f=>Math.max(f[1],f[2],f[3]))}),
        'rango':()=>P[3]['rango'](),'pendientes':()=>P[3]['pendientes']()},
      5:{'pct-entregado':()=>q(`D${u+1}`,`=CONTAR(D2:D${u})/CONTARA(A2:A${u})`,`Escribe en <b>D${u+1}</b> qué fracción de los alumnos ya tiene calificación final (con calificación ÷ total de alumnos).`,[paso('Con calificación',`CONTAR(D2:D${u})`,'Números.'),paso('Total de alumnos',`CONTARA(A2:A${u})`,'Nombres.'),final('Divide',code(`=CONTAR(D2:D${u})/CONTARA(A2:A${u})`),'Con formato % se ve como porcentaje.')],[[`=CONTARA(D2:D${u})/CONTARA(A2:A${u})`,'CONTARA cuenta también los «Pendiente»: daría 100 %.']],d=>[(m-falt)/m]),
        'mejor-fila':()=>P[4]['mejor-fila'](),'pendientes':()=>P[3]['pendientes']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- REDONDEAR ---------- */
const R_RED=`REDONDEAR(número; decimales) (ROUND) redondea: 5 o más sube. Con decimales negativos redondea a decenas (−1), centenas (−2)… ${SEP}`;
const redondearX=(x,d)=>{const f=10**d;return Math.sign(x)*Math.round(+(Math.abs(x)*f).toPrecision(15))/f};
const redondear={
  titulo:'REDONDEAR',
  explicacion:`${fn('REDONDEAR')}(número; decimales) cambia el VALOR (no solo cómo se ve): <code>=REDONDEAR(3.14159;2)</code> da 3.14. Si la cifra siguiente es 5 o más, sube: 2.5 → 3. Con −1 redondea a decenas y con −2 a centenas: <code>=REDONDEAR(1234;-2)</code> da 1200.`,
  alternativa:'Redondear es como dar el cambio en una tienda que no tiene monedas chicas: si faltan 5 centavos o más, se sube al siguiente; si no, se baja.',
  referencia:'Ver: Soporte de Microsoft, «Función REDONDEAR».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const numQ=(x,d)=>{const v=redondearX(x,d),f=`=REDONDEAR(${x};${d})`;return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:String(v),numero:v,tolerancia:1e-12,
      pasos:[paso(d>=0?`Mira la cifra ${d+1} después del punto`:`Mira la cifra de las ${d===-1?'unidades':d===-2?'decenas':'centenas'}`,`${x}`,'Si es 5 o más, sube.'),final('Redondea',marca(v),d<0?'Lo de la derecha queda en ceros.':'Quedan '+d+' decimales.')],
      errores:[[String(Math.trunc(x*10**d)/10**d),'Redondear no es cortar: si la cifra siguiente es 5 o más, sube.']],regla:R_RED,pista:'¿La cifra siguiente es 5 o más?',comprobar:()=>evaluar(crearHoja(),f)===v,clave:f})};
    const P={
      1:{'decimales':()=>numQ(+(rng.entero(100,99999)/1000).toFixed(3),rng.entero(0,2)),'mitad':()=>numQ(rng.entero(1,40)+0.5,0)},
      2:{'negativo':()=>numQ(rng.entero(1000,99999)+rng.entero(0,9)/10,rng.elegir([-1,-2,-3])),'decimales':()=>P[1]['decimales'](),'mitad':()=>numQ(+(rng.entero(10,999)/100+0.005).toFixed(3),2)},
      3:{'iva':()=>formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Con IVA'}),destino:'F2',formula:'=REDONDEAR(E2*1.16;2)',copiar:m-1,enunciado:'Escribe en <b>F2</b> el precio con IVA (× 1.16) redondeado a 2 decimales (se copiará hacia abajo).',
          pasos:[paso('Precio con IVA','E2*1.16','Primero el cálculo.'),final('Redondea a centavos',code('=REDONDEAR(E2*1.16;2)'),'El cálculo va dentro de REDONDEAR.')],errores:[['=E2*1.16','Falta redondear a 2 decimales.'],['=REDONDEAR(E2;2)*1.16','Redondeaste antes de multiplicar: el resultado puede tener más decimales.']],regla:R_RED,pista:'REDONDEAR(cálculo;2).',esperado:d=>d.tabla.filas.map(f=>redondearX(f[4]*1.16,2))}),
        'negativo':()=>P[2]['negativo']()},
      4:{'diario':()=>formulaQ({rng,datos:r=>conTotal(tablaNomina(r,m),{F1:'Sueldo diario'}),destino:'F2',formula:'=REDONDEAR(C2/30;2)',copiar:m-1,enunciado:'Escribe en <b>F2</b> el sueldo diario (Sueldo ÷ 30) redondeado a centavos (se copiará hacia abajo).',
          pasos:[paso('Divide entre 30','C2/30','Mes de 30 días.'),final('Redondea a 2 decimales',code('=REDONDEAR(C2/30;2)'),'Centavos.')],errores:[['=C2/30','Falta redondear a 2 decimales.'],['=REDONDEAR(C2/30;0)','0 decimales redondea a pesos enteros.']],regla:R_RED,pista:'REDONDEAR(C2/30;2).',esperado:d=>d.tabla.filas.map(f=>redondearX(f[2]/30,2))}),
        'iva':()=>P[3]['iva']()},
      5:{'miles':()=>formulaQ({rng,datos:r=>conTotal(tablaNomina(r,m),{F1:'Sueldo anual (miles)'}),destino:'F2',formula:'=REDONDEAR(C2*12;-3)',copiar:m-1,enunciado:'Escribe en <b>F2</b> el sueldo anual (× 12) redondeado a miles (se copiará hacia abajo).',
          pasos:[paso('Sueldo anual','C2*12','12 meses.'),final('A miles: −3',code('=REDONDEAR(C2*12;-3)'),'−1 decenas, −2 centenas, −3 miles.')],errores:[['=REDONDEAR(C2*12;3)','3 deja tres decimales; para miles es −3.'],['=C2*12','Falta redondear a miles.']],regla:R_RED,pista:'Decimales negativos.',esperado:d=>d.tabla.filas.map(f=>redondearX(f[2]*12,-3))}),
        'diario':()=>P[4]['diario'](),'negativo':()=>P[2]['negativo']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- SI ---------- */
const R_SI=`SI(prueba; si_verdadero; si_falso) (IF) devuelve una cosa u otra según la prueba. Los textos van entre comillas; «al menos» es >=. ${SEP}`;
const si={
  titulo:'Función SI',
  explicacion:`${fn('SI')}(prueba; valor_si_verdadero; valor_si_falso): <code>=SI(D2>=60;"Aprobado";"Reprobado")</code>. La prueba compara con = &lt;&gt; &lt; &gt; &lt;= &gt;=. Los textos van entre comillas. «Al menos 60» es <b>&gt;=60</b>; «más de 60» es <b>&gt;60</b>.`,
  alternativa:'SI es una bifurcación en el camino: "¿sacó 60 o más? Si sí, escribe Aprobado; si no, Reprobado". Siempre tiene tres partes: la pregunta, lo que pasa si sí y lo que pasa si no.',
  referencia:'Ver: Soporte de Microsoft, «Función SI».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const evalSi=()=>{const lim=rng.elegir([60,70,80]),v=rng.entero(lim-5,lim+5),f=`=SI(A1>=${lim};"Aprobado";"Reprobado")`,res=v>=lim?'Aprobado':'Reprobado';
      return valorQ({enunciado:`A1 vale <b>${v}</b>. ¿Qué devuelve <code>${f}</code>?`,respuesta:res,pasos:[paso('Evalúa la prueba',`${v} >= ${lim} → ${v>=lim?'VERDADERO':'FALSO'}`,'>= incluye el igual.'),final('Toma la rama',marca(res),v>=lim?'Si es verdadera, el 2.º argumento.':'Si es falsa, el 3.º.')],errores:[[res==='Aprobado'?'Reprobado':'Aprobado','Revisa la prueba: >= incluye el igual.']],regla:R_SI,pista:'¿La prueba es verdadera?',comprobar:()=>evaluar(crearHoja({A1:v}),f)===res,clave:f+v})};
    const P={
      1:{'evaluar':evalSi,'evaluar2':()=>{const a=rng.entero(1,50),b=rng.entero(1,50),f=`=SI(A1>A2;A1-A2;0)`,res=a>b?a-b:0;return valorQ({enunciado:`A1 = <b>${a}</b> y A2 = <b>${b}</b>. ¿Qué devuelve <code>${f}</code>?`,respuesta:String(res),numero:res,
        pasos:[paso('Prueba',`${a} > ${b} → ${a>b?'VERDADERO':'FALSO'}`,'Compara.'),final('Rama',marca(res),a>b?'Calcula A1 − A2.':'Devuelve 0.')],errores:[[String(a-b),'Si la prueba es falsa se usa el tercer argumento.']].filter(([x])=>+x!==res),regla:R_SI,pista:'¿A1 es mayor?',comprobar:()=>evaluar(crearHoja({A1:a,A2:b}),f)===res,clave:'e2'+a+b})}},
      2:{'aprobado':()=>{const lim=rng.elegir([60,70]);return formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Estado'}),destino:'F2',formula:`=SI(D2>=${lim};"Aprobado";"Reprobado")`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b>: «Aprobado» si la Final es de al menos ${lim}; si no, «Reprobado» (se copiará hacia abajo).`,
          pasos:[paso('Prueba',`D2>=${lim}`,'«Al menos» incluye el '+lim+'.',{ojo:'> dejaría fuera el '+lim+' justo.'}),final('Las dos respuestas entre comillas',code(`=SI(D2>=${lim};"Aprobado";"Reprobado")`),'Texto entre comillas.')],
          errores:[[`=SI(D2>${lim};"Aprobado";"Reprobado")`,`Con > no entra el ${lim} justo: «al menos» es >=.`],[`=SI(D2>=${lim};"Reprobado";"Aprobado")`,'Las ramas están al revés.']],regla:R_SI,pista:'SI(prueba;"sí";"no").',esperado:d=>d.tabla.filas.map(f=>f[3]>=lim?'Aprobado':'Reprobado')})},
        'evaluar':evalSi},
      3:{'pedir':()=>formulaQ({rng,datos:r=>conTotal(tablaInventario(r,m),{F1:'Acción'}),destino:'F2',formula:'=SI(C2<D2;"Pedir";"OK")',copiar:m-1,enunciado:'Escribe en <b>F2</b>: «Pedir» si la Existencia es menor que el Mínimo; si no, «OK» (se copiará hacia abajo).',
          pasos:[paso('Prueba','C2<D2','Existencia menor que mínimo.'),final('Respuestas',code('=SI(C2<D2;"Pedir";"OK")'),'Si sí: Pedir; si no: OK.')],errores:[['=SI(C2>D2;"Pedir";"OK")','La comparación está al revés: se pide cuando hay MENOS que el mínimo.'],['=SI(C2<D2;Pedir;OK)','Los textos van entre comillas.']],regla:R_SI,pista:'Compara C2 con D2.',esperado:d=>d.tabla.filas.map(f=>f[2]<f[3]?'Pedir':'OK')}),
        'aprobado':()=>P[2]['aprobado']()},
      4:{'volumen':()=>{const lim=rng.elegir([10,15,20]),dto=rng.elegir([5,10]);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Total'}),destino:'F2',formula:`=SI(D2>${lim};D2*E2*(1-${dto}%);D2*E2)`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b> el total (Unidades × Precio), pero si se vendieron más de ${lim} unidades, con ${dto} % de descuento.`,
          pasos:[paso('Prueba',`D2>${lim}`,'Más de '+lim+'.'),paso('Si sí',`D2*E2*(1-${dto}%)`,'Con descuento.'),final('Si no, el total normal',code(`=SI(D2>${lim};D2*E2*(1-${dto}%);D2*E2)`),'Cada rama puede ser un cálculo.')],
          errores:[[`=SI(D2>${lim};D2*E2*${dto}%;D2*E2)`,'En la rama del sí calculaste solo el descuento, no lo que se paga.'],[`=SI(D2>=${lim};D2*E2*(1-${dto}%);D2*E2)`,`«Más de ${lim}» no incluye el ${lim}: usa >.`]],regla:R_SI,pista:'Cada rama es una cuenta.',esperado:d=>d.tabla.filas.map(f=>f[3]>lim?f[3]*f[4]*(100-dto)/100:f[3]*f[4])})},
        'pedir':()=>P[3]['pedir']()},
      5:{'meta':()=>formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'¿Meta?',H1:'Meta',H2:r.entero(10,30)}),destino:'F2',formula:'=SI(D2>=$H$2;"Cumplió";"")',copiar:m-1,
          enunciado:'La meta de unidades está en <b>H2</b>. Escribe en <b>F2</b> «Cumplió» si las Unidades llegan a la meta; si no, deja la celda vacía ("").',
          pasos:[paso('Prueba con la meta fija','D2>=$H$2','La meta es la misma para todos: $.'),final('Vacío = comillas sin nada',code('=SI(D2>=$H$2;"Cumplió";"")'),'"" se ve como celda vacía.')],errores:[['=SI(D2>=H2;"Cumplió";"")','Sin $, al copiar la meta se mueve a H3 (vacía).']],regla:R_SI,pista:'Fija la meta con $ y usa "".',esperado:d=>d.tabla.filas.map(f=>f[3]>=d.celdas.H2?'Cumplió':'')}),
        'volumen':()=>P[4]['volumen'](),'pedir':()=>P[3]['pedir']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- Y, O ---------- */
const R_YO=`Y(…) (AND) es VERDADERO si TODAS las pruebas lo son; O(…) (OR) si AL MENOS UNA lo es. Se usan como prueba de SI. ${SEP}`;
const yo={
  titulo:'Y, O',
  explicacion:`${fn('Y')} es VERDADERO solo si todas sus pruebas lo son; ${fn('O')}, si al menos una lo es. Dentro de SI: <code>=SI(Y(D2>=60;E2>=0.8);"Aprobado";"Reprobado")</code> aprueba solo con calificación Y asistencia.`,
  alternativa:'Y es un portero estricto: entras solo si cumples todo (boleto Y credencial). O es uno relajado: con cualquiera de las dos te deja pasar.',
  referencia:'Ver: Soporte de Microsoft, «Función Y» y «Función O».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const evalYO=()=>{const op=rng.elegir(['Y','O']),a=rng.entero(1,9),b=rng.entero(1,9),c=rng.entero(1,9),d=rng.entero(1,9),p1=a>b,p2=c>d,res=op==='Y'?p1&&p2:p1||p2,f=`=${op}(${a}>${b};${c}>${d})`,s=res?'VERDADERO':'FALSO';
      return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:s,alternativas:[res?'TRUE':'FALSE',res?'verdadero':'falso'],pasos:[paso('Cada prueba',`${a}>${b} → ${p1?'V':'F'} · ${c}>${d} → ${p2?'V':'F'}`,'Evalúa por separado.'),final(op==='Y'?'Y: todas':'O: al menos una',marca(s),op==='Y'?'Basta una falsa para FALSO.':'Basta una verdadera para VERDADERO.')],
        errores:[[res?'FALSO':'VERDADERO',op==='Y'?'Y necesita que TODAS sean verdaderas.':'O necesita que al menos UNA sea verdadera.']],regla:R_YO,pista:'Evalúa cada prueba.',comprobar:()=>evaluar(crearHoja(),f)===res,clave:f})};
    const P={
      1:{'evaluar':evalYO,'evaluar-b':evalYO},
      2:{'aprobar':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Estado'}),destino:'F2',formula:'=SI(Y(D2>=60;E2>=0.8);"Aprobado";"Reprobado")',copiar:m-1,
          enunciado:'Escribe en <b>F2</b>: «Aprobado» si la Final es al menos 60 <b>y</b> la Asistencia al menos 80 % (0.8); si no, «Reprobado».',
          pasos:[paso('Las dos condiciones','D2>=60 · E2>=0.8','80 % = 0.8.'),paso('Deben cumplirse las dos','Y(D2>=60;E2>=0.8)','Y.'),final('Dentro de SI',code('=SI(Y(D2>=60;E2>=0.8);"Aprobado";"Reprobado")'),'Y es la prueba de SI.')],
          errores:[['=SI(O(D2>=60;E2>=0.8);"Aprobado";"Reprobado")','O aprueba con solo una de las dos; se piden ambas.'],['=SI(Y(D2>=60;E2>=80);"Aprobado";"Reprobado")','La asistencia está como 0.8 (80 %), no 80.']],regla:R_YO,pista:'Y(…;…) como prueba.',esperado:d=>d.tabla.filas.map(f=>f[3]>=60&&f[4]>=0.8?'Aprobado':'Reprobado')}),
        'evaluar':evalYO},
      3:{'zona':()=>{const [a,b]=rng.barajar(['Norte','Sur','Centro','Este']);return formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'Zona'}),destino:'F2',formula:`=SI(O(B2="${a}";B2="${b}");"Zona A";"Zona B")`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b>: «Zona A» si la Región es ${a} <b>o</b> ${b}; si no, «Zona B».`,
          pasos:[paso('Una u otra',`B2="${a}" · B2="${b}"`,'Textos entre comillas.'),final('O dentro de SI',code(`=SI(O(B2="${a}";B2="${b}");"Zona A";"Zona B")`),'Basta con una.')],
          errores:[[`=SI(Y(B2="${a}";B2="${b}");"Zona A";"Zona B")`,'Y pide que sea las dos regiones a la vez (imposible): usa O.']],regla:R_YO,pista:'O(…;…).',esperado:d=>d.tabla.filas.map(f=>f[1]===a||f[1]===b?'Zona A':'Zona B')})},
        'aprobar':()=>P[2]['aprobar']()},
      4:{'urgente':()=>{const cat=rng.elegir(['Cómputo','Audio','Oficina','Papelería']);return formulaQ({rng,datos:r=>conTotal(tablaInventario(r,m),{F1:'Prioridad'}),destino:'F2',formula:`=SI(Y(C2<D2;B2="${cat}");"Urgente";"")`,copiar:m-1,
          enunciado:`Escribe en <b>F2</b> «Urgente» solo si la Existencia es menor que el Mínimo <b>y</b> la Categoría es ${cat}; si no, vacío ("").`,
          pasos:[paso('Dos condiciones',`C2<D2 · B2="${cat}"`,'Las dos a la vez.'),final('Y dentro de SI',code(`=SI(Y(C2<D2;B2="${cat}");"Urgente";"")`),'"" deja la celda vacía.')],
          errores:[[`=SI(O(C2<D2;B2="${cat}");"Urgente";"")`,'O marcaría también los que solo cumplen una condición.']],regla:R_YO,pista:'Y(…;…).',esperado:d=>d.tabla.filas.map(f=>f[2]<f[3]&&f[1]===cat?'Urgente':'')})},
        'zona':()=>P[3]['zona']()},
      5:{'revisar':()=>formulaQ({rng,datos:r=>conTotal(tablaNomina(r,m),{F1:'Revisar'}),destino:'F2',formula:'=SI(O(D2>8;C2<15000);"Revisar";"OK")',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> «Revisar» si el empleado tiene más de 8 horas extra <b>o</b> gana menos de 15000; si no, «OK».',
          pasos:[paso('Condiciones','D2>8 · C2<15000','Cualquiera.'),final('O dentro de SI',code('=SI(O(D2>8;C2<15000);"Revisar";"OK")'),'Basta con una.')],
          errores:[['=SI(Y(D2>8;C2<15000);"Revisar";"OK")','Con Y solo marcarías a quien cumple las dos.'],['=SI(O(D2>=8;C2<15000);"Revisar";"OK")','«Más de 8» no incluye el 8.']],regla:R_YO,pista:'O(…;…).',esperado:d=>d.tabla.filas.map(f=>f[3]>8||f[2]<15000?'Revisar':'OK')}),
        'urgente':()=>P[4]['urgente'](),'zona':()=>P[3]['zona']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- SI anidado ---------- */
const R_ANI='Un SI dentro de otro revisa varias condiciones en orden: la primera que se cumple gana. Empieza por el límite más alto (o el más bajo) y sigue en orden.';
const siAnidado={
  titulo:'SI anidado',
  explicacion:'Para más de dos resultados, pon un SI dentro del «si no» de otro: <code>=SI(D2>=90;"A";SI(D2>=70;"B";"C"))</code>. Excel revisa en orden: la primera prueba verdadera gana. Por eso empieza por el límite más alto cuando usas >=.',
  alternativa:'Es como clasificar fruta por tamaño: "¿es grande? → caja A; si no, ¿es mediana? → caja B; si no → caja C". Si preguntaras primero "¿es mediana o más?", la grande también caería en B.',
  referencia:'Ver: Soporte de Microsoft, «Funciones SI anidadas».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const evalA=()=>{const v=rng.entero(40,100),f='=SI(A1>=90;"A";SI(A1>=70;"B";"C"))',res=v>=90?'A':v>=70?'B':'C';return valorQ({enunciado:`A1 = <b>${v}</b>. ¿Qué devuelve <code>${f}</code>?`,respuesta:res,
      pasos:[paso('Primera prueba',`${v}>=90 → ${v>=90?'V':'F'}`,'Si es verdadera, termina.'),...(v<90?[paso('Segunda prueba',`${v}>=70 → ${v>=70?'V':'F'}`,'Solo si la primera falló.')]:[]),final('Resultado',marca(res),'La primera verdadera gana.')],errores:['A','B','C'].filter(x=>x!==res).map(x=>[x,'Revisa las pruebas en orden.']),regla:R_ANI,pista:'Prueba por prueba, en orden.',comprobar:()=>evaluar(crearHoja({A1:v}),f)===res,clave:'a'+v})};
    const P={
      1:{'evaluar':evalA,'evaluar-b':()=>{const v=rng.entero(0,40),f='=SI(A1>30;"Mucho";SI(A1>10;"Normal";"Poco"))',res=v>30?'Mucho':v>10?'Normal':'Poco';return valorQ({enunciado:`A1 = <b>${v}</b>. ¿Qué devuelve <code>${f}</code>?`,respuesta:res,
        pasos:[paso('Primera prueba',`${v}>30 → ${v>30?'V':'F'}`,'Orden.'),final('Resultado',marca(res),'La primera verdadera gana.')],errores:['Mucho','Normal','Poco'].filter(x=>x!==res).map(x=>[x,'Revisa las pruebas en orden; > no incluye el igual.']),regla:R_ANI,pista:'En orden.',comprobar:()=>evaluar(crearHoja({A1:v}),f)===res,clave:'b'+v})}},
      2:{'letras':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Letra'}),destino:'F2',formula:'=SI(D2>=90;"A";SI(D2>=70;"B";"C"))',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> la letra de la Final: «A» si es al menos 90, «B» si es al menos 70 y «C» en otro caso.',
          pasos:[paso('Empieza por el más alto','D2>=90 → "A"','Si no, sigue.'),paso('Dentro del «si no»','SI(D2>=70;"B";"C")','Segundo nivel.'),final('Junta',code('=SI(D2>=90;"A";SI(D2>=70;"B";"C"))'),'Cierra los dos paréntesis.')],
          errores:[['=SI(D2>=70;"B";SI(D2>=90;"A";"C"))','Empezaste por el 70: un 95 también cumple >=70 y se queda con B.']],regla:R_ANI,pista:'Empieza por >=90.',esperado:d=>d.tabla.filas.map(f=>f[3]>=90?'A':f[3]>=70?'B':'C')}),
        'evaluar':evalA},
      3:{'cuatro':()=>formulaQ({rng,datos:r=>conTotal(tablaCalif(r,m),{F1:'Nivel'}),destino:'F2',formula:'=SI(D2>=90;"Excelente";SI(D2>=80;"Bien";SI(D2>=60;"Suficiente";"Insuficiente")))',copiar:m-1,
          enunciado:'Escribe en <b>F2</b>: «Excelente» (≥ 90), «Bien» (≥ 80), «Suficiente» (≥ 60) o «Insuficiente».',
          pasos:[paso('Del más alto al más bajo','90 → 80 → 60','Tres pruebas.'),final('Tres SI anidados',code('=SI(D2>=90;"Excelente";SI(D2>=80;"Bien";SI(D2>=60;"Suficiente";"Insuficiente")))'),'Tres paréntesis al final.')],
          errores:[['=SI(D2>=60;"Suficiente";SI(D2>=80;"Bien";SI(D2>=90;"Excelente";"Insuficiente")))','Al empezar por 60, todos los que pasan quedan como «Suficiente».']],regla:R_ANI,pista:'90, luego 80, luego 60.',esperado:d=>d.tabla.filas.map(f=>f[3]>=90?'Excelente':f[3]>=80?'Bien':f[3]>=60?'Suficiente':'Insuficiente')}),
        'letras':()=>P[2]['letras']()},
      4:{'comision':()=>formulaQ({rng,datos:r=>conTotal(tablaVentas(r,m),{F1:'% comisión'}),destino:'F2',formula:'=SI(D2>=30;10%;SI(D2>=15;5%;0))',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> el porcentaje de comisión: 10 % con 30 unidades o más, 5 % con 15 o más y 0 en otro caso.',
          pasos:[paso('Tramo más alto','D2>=30 → 10%','Primero.'),final('Siguiente tramo dentro',code('=SI(D2>=30;10%;SI(D2>=15;5%;0))'),'10% = 0.1 (sin comillas: es número).')],
          errores:[['=SI(D2>=15;5%;SI(D2>=30;10%;0))','Al empezar por 15, quien vende 30 recibe 5 %.'],['=SI(D2>=30;"10%";SI(D2>=15;"5%";0))','Con comillas el % queda como texto y no se puede multiplicar.']],regla:R_ANI,pista:'Empieza por 30.',esperado:d=>d.tabla.filas.map(f=>f[3]>=30?0.1:f[3]>=15?0.05:0)}),
        'cuatro':()=>P[3]['cuatro']()},
      5:{'bono':()=>formulaQ({rng,datos:r=>conTotal(tablaNomina(r,m),{F1:'Bono'}),destino:'F2',formula:'=SI(C2<15000;C2*10%;SI(C2<30000;C2*5%;1000))',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> el bono: 10 % del sueldo si gana menos de 15000, 5 % si gana menos de 30000 y 1000 fijos en otro caso.',
          pasos:[paso('Con «menos de», empieza por el límite más bajo','C2<15000 → C2*10%','Así no se traslapan.'),final('Siguiente tramo',code('=SI(C2<15000;C2*10%;SI(C2<30000;C2*5%;1000))'),'Cada rama es una cuenta.')],
          errores:[['=SI(C2<30000;C2*5%;SI(C2<15000;C2*10%;1000))','Empezando por 30000, quien gana 12000 recibe 5 % en lugar de 10 %.']],regla:R_ANI,pista:'Con <, del límite más bajo al más alto.',esperado:d=>d.tabla.filas.map(f=>f[2]<15000?f[2]*0.1:f[2]<30000?f[2]*0.05:1000)}),
        'comision':()=>P[4]['comision'](),'cuatro':()=>P[3]['cuatro']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

/* ---------- SI.ERROR ---------- */
const R_ERR=`SI.ERROR(valor; si_error) (IFERROR) devuelve el valor, o lo que pongas si el valor es un error (#¡DIV/0!, #N/A…). ${SEP}`;
const siError={
  titulo:'SI.ERROR',
  explicacion:`${fn('SI.ERROR')}(valor; valor_si_error): si el cálculo da error, muestra otra cosa. <code>=SI.ERROR(F2/D2;0)</code> da 0 en vez de #¡DIV/0! cuando D2 es 0. Errores comunes: <b>#¡DIV/0!</b> (dividir entre 0), <b>#N/A</b> (no se encontró), <b>#¡VALOR!</b> (tipo de dato), <b>#¿NOMBRE?</b> (función mal escrita), <b>#¡REF!</b> (referencia inválida).`,
  alternativa:'SI.ERROR es un plan B: "intenta esta cuenta; si se rompe, mejor escribe esto otro". No arregla la causa del error, solo cambia lo que se ve.',
  referencia:'Ver: Soporte de Microsoft, «Función SI.ERROR».',
  profundidad:prof,
  generar(n,rng){
    const m=rng.entero(5,9);
    const ventas0=(r,k)=>{const t=tablaVentas(r,k);t.cab[3]='Unidades';const c=r.barajar([...Array(k).keys()]).slice(0,r.entero(1,2));t.filas.forEach((f,i)=>{if(c.includes(i))f[3]=0});return t};
    const ERRS=[['=10/0','#¡DIV/0!','dividir entre cero'],['=SUMAR(A1:A3)','#¿NOMBRE?','una función que no existe (es SUMA)'],['="hola"*2','#¡VALOR!','multiplicar un texto'],['=BUSCARV("Zoe";A1:B3;2;FALSO)','#N/A','buscar algo que no está']];
    const P={
      1:{'que-error':()=>{const [f,e,por]=rng.elegir(ERRS);return valorQ({enunciado:`¿Qué error muestra Excel con <code>${f}</code>?`,respuesta:e,alternativas:[e.replace(/[¡¿]/g,'')],pasos:[paso('¿Qué hace la fórmula?',por,'Cada error tiene una causa.'),final('Error',marca(e),'Así lo muestra Excel.')],errores:ERRS.filter(x=>x[1]!==e).slice(0,2).map(x=>[x[1],x[1]+' es por '+x[2]+'.']),regla:R_ERR,pista:'¿Qué salió mal?',comprobar:()=>mostrar(evaluar(crearHoja({A1:'Ana',B1:1}),f))===e,clave:f})},
        'evaluar':()=>{const a=rng.entero(1,99),b=rng.elegir([0,0,rng.entero(1,9)]),f=`=SI.ERROR(${a}/${b};"Sin dato")`,res=b===0?'Sin dato':String(+(a/b).toFixed(10));return valorQ({enunciado:`¿Qué devuelve <code>${f}</code>?`,respuesta:res,numero:b===0?undefined:a/b,tolerancia:1e-9,
          pasos:[paso('Calcula el valor',`${a}/${b} → ${b===0?'#¡DIV/0!':res}`,'Primero el cálculo.'),final(b===0?'Es error: usa el plan B':'No es error: queda el valor',marca(res),'SI.ERROR solo actúa si hay error.')],errores:[[b===0?'#¡DIV/0!':'Sin dato',b===0?'SI.ERROR cambia el error por lo que pusiste.':'Si no hay error, se muestra el resultado.']],regla:R_ERR,pista:'¿Hay error?',clave:f})}},
      2:{'precio-unit':()=>formulaQ({rng,datos:r=>{const t=ventas0(r,m),c=aCeldas(t,{F1:'Venta',G1:'Precio unitario'});for(let i=2;i<=m+1;i++)c['F'+i]=c['D'+i]*c['E'+i];return {celdas:c,tabla:t}},destino:'G2',formula:'=SI.ERROR(F2/D2;0)',copiar:m-1,
          enunciado:'Algunas filas tienen 0 unidades. Escribe en <b>G2</b> el precio unitario (Venta ÷ Unidades) que muestre 0 en vez de error (se copiará hacia abajo).',
          pasos:[paso('Cálculo','F2/D2','Con 0 unidades da #¡DIV/0!.'),final('Envuélvelo en SI.ERROR',code('=SI.ERROR(F2/D2;0)'),'Si da error, 0.')],errores:[['=F2/D2','Con 0 unidades da #¡DIV/0!: usa SI.ERROR.'],['=SI.ERROR(F2/D2;"0")','"0" con comillas es texto; pon 0 sin comillas.']],regla:R_ERR,pista:'SI.ERROR(cálculo;0).',esperado:d=>d.tabla.filas.map(f=>f[3]===0?0:f[4])}),
        'que-error':()=>P[1]['que-error']()},
      3:{'buscar':()=>{const datos=r=>{const t=tablaVentas(r,m),nom=r.prob(.5)?r.elegir(t.filas)[0]:r.elegir(['Zoe','Bruno','Inés'].filter(x=>!t.filas.some(f=>f[0]===x)));return {celdas:aCeldas(t,{G1:'Buscar',G2:nom,H1:'Región'}),tabla:t}};
          return formulaQ({rng,datos,destino:'H2',formula:'=SI.ERROR(BUSCARV(G2;A2:B'+(m+1)+';2;FALSO);"No existe")',enunciado:`Escribe en <b>H2</b> la Región del vendedor escrito en G2; si no está en la tabla, «No existe».`,
            pasos:[paso('Busca exacto',`BUSCARV(G2;A2:B${m+1};2;FALSO)`,'Columna 2 = Región.'),final('Si no está, plan B',code(`=SI.ERROR(BUSCARV(G2;A2:B${m+1};2;FALSO);"No existe")`),'BUSCARV da #N/A si no lo encuentra.')],
            errores:[[`=BUSCARV(G2;A2:B${m+1};2;FALSO)`,'Si el nombre no está, muestra #N/A: envuélvelo en SI.ERROR.']],regla:R_ERR,pista:'SI.ERROR(BUSCARV(…);"No existe").',esperado:d=>{const f=d.tabla.filas.find(x=>x[0].toLowerCase()===String(d.celdas.G2).toLowerCase());return [f?f[1]:'No existe']}})},
        'precio-unit':()=>P[2]['precio-unit']()},
      4:{'cobertura':()=>formulaQ({rng,datos:r=>{const t=tablaInventario(r,m);t.filas.forEach(f=>{if(r.prob(.3))f[3]=0});return {celdas:aCeldas(t,{F1:'Veces el mínimo'}),tabla:t}},destino:'F2',formula:'=SI.ERROR(C2/D2;"Sin mínimo")',copiar:m-1,
          enunciado:'Escribe en <b>F2</b> cuántas veces cabe el Mínimo en la Existencia (Existencia ÷ Mínimo); si el mínimo es 0, «Sin mínimo».',
          pasos:[paso('Cálculo','C2/D2','Con mínimo 0 → #¡DIV/0!.'),final('Con plan B',code('=SI.ERROR(C2/D2;"Sin mínimo")'),'Texto entre comillas.')],errores:[['=C2/D2','Con mínimo 0 da #¡DIV/0!.'],['=SI.ERROR(D2/C2;"Sin mínimo")','La división está al revés.']],regla:R_ERR,pista:'SI.ERROR(C2/D2;"Sin mínimo").',esperado:d=>d.tabla.filas.map(f=>f[3]===0?'Sin mínimo':f[2]/f[3])}),
        'buscar':()=>P[3]['buscar']()},
      5:{'cobertura':()=>P[4]['cobertura'](),'buscar':()=>P[3]['buscar'](),'precio-unit':()=>P[2]['precio-unit']()}
    };
    const k=rng.elegir(Object.keys(P[n]));return {...P[n][k](),plantilla:k};
  }
};

export default {'xl/celdas':celdas,'xl/tipos-datos':tiposDatos,'xl/formato':formato,'xl/operadores':operadores,'xl/referencias':referencias,
  'xl/suma-promedio':sumaPromedio,'xl/contar-max-min':contarMaxMin,'xl/redondear':redondear,'xl/si':si,'xl/y-o':yo,'xl/si-anidado':siAnidado,'xl/si-error':siError};
