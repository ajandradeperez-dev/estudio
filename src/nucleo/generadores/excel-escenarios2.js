/* Escenarios de Excel por tema (P5): 4 pasos sobre la MISMA hoja. Los de fórmulas se verifican por resultado en la hoja que
   se ve y en otra con otros datos (formulaQ de excel-base.js), con un cálculo independiente en JS (esperado). Los de temas sin
   fórmulas (interfaz, organizar, gráficos, atajos) son decisiones con respuesta corta. Sin DOM. */
import {crearRng} from '../rng.js';
import {paso,final,marca,code,tablaVentas,tablaCalif,tablaInventario,tablaNomina,aCeldas,formulaQ,NOMBRES,APELLIDOS} from './excel-base.js';
import {serial} from '../excel/formulas.js';
import {txt} from './extensiones/ingles-base.js';

const sum=a=>a.reduce((s,x)=>s+x,0);
const con=(ctx,p)=>({...p,enunciado:`<p class="contexto">${ctx}</p>${p.enunciado}`,profundidad:'escenario'});
const misma=(rng,construir)=>{const a=rng.entero(1,2**31-1);return r=>construir(r===rng?crearRng(a):r)};
const P=(que,como,porque)=>paso(que,como,porque),F=(que,f,porque)=>final(que,code(f),porque);

/* ---------- Fórmulas y referencias · Cotización con IVA ---------- */
export function escenarioCotizacion(rng){
  const m=6,u=m+1;
  const base=(r,hasta)=>{const filas=r.barajar([['Laptop',12500],['Mouse',250],['Teclado',480],['Monitor',3200],['Audífonos',650],['Bocina',720],['Tableta',5400]]).slice(0,m).map(([p,pr])=>[p,r.entero(1,10),pr]);
    const c=aCeldas({cab:['Producto','Cantidad','Precio'],filas},{D1:'Subtotal',E1:'IVA',F1:'Total',G1:'Tasa IVA',H1:0.16});
    for(let i=2;i<=u;i++){if(hasta>=1)c['D'+i]=`=B${i}*C${i}`;if(hasta>=2)c['E'+i]=`=D${i}*$H$1`;if(hasta>=3)c['F'+i]=`=D${i}+E${i}`}
    return {celdas:c,filas}};
  const d=[0,1,2,3].map(k=>misma(rng,r=>base(r,k)));
  const subt=x=>x.filas.map(f=>f[1]*f[2]);
  const ctx='Armas una cotización: cantidad × precio de cada producto, el IVA con la tasa de H1 (que puede cambiar) y el total.';
  return [
    con(ctx,formulaQ({rng,datos:d[0],destino:'D2',formula:'=B2*C2',copiar:m-1,enunciado:'1/4 · Escribe en <b>D2</b> el Subtotal (Cantidad × Precio); se copiará hacia abajo.',
      pasos:[P('Misma fila','B2 y C2','Relativas: cambian al copiar.'),F('Fórmula','=B2*C2','Se copia a cada fila.')],errores:[['=B2+C2','Se multiplica.']],regla:'Referencias relativas: se ajustan al copiar.',pista:'Cantidad × Precio.',esperado:subt})),
    con(ctx,formulaQ({rng,datos:d[1],destino:'E2',formula:'=D2*$H$1',copiar:m-1,enunciado:'2/4 · Escribe en <b>E2</b> el IVA del subtotal usando la tasa de <b>H1</b>; se copiará hacia abajo.',
      pasos:[P('La tasa no se mueve','$H$1','Absoluta con F4.'),F('Fórmula','=D2*$H$1','El subtotal sí cambia de fila.')],errores:[['=D2*H1','Al copiar, H1 se movería a H2, H3…']],regla:'Fija con $ la celda que no debe moverse.',pista:'Subtotal × $H$1.',esperado:x=>subt(x).map(v=>v*0.16)})),
    con(ctx,formulaQ({rng,datos:d[2],destino:'F2',formula:'=D2+E2',copiar:m-1,enunciado:'3/4 · Escribe en <b>F2</b> el Total (Subtotal + IVA); se copiará hacia abajo.',
      pasos:[P('Suma la fila','D2 + E2','Relativas.'),F('Fórmula','=D2+E2','Total por producto.')],errores:[['=D2*E2','Se suma, no se multiplica.']],regla:'Total = subtotal + impuesto.',pista:'D2 + E2.',esperado:x=>subt(x).map(v=>v*1.16)})),
    con(ctx,formulaQ({rng,datos:d[3],destino:'H3',formula:`=SUMA(F2:F${u})`,enunciado:'4/4 · Escribe en <b>H3</b> el total de la cotización.',
      pasos:[P('Rango de totales',`F2:F${u}`,'Sin encabezado.'),F('Suma',`=SUMA(F2:F${u})`,'Total general.')],errores:[[`=SUMA(D2:D${u})`,'Eso es sin IVA.']],regla:'SUMA(rango).',pista:'Suma la columna Total.',esperado:x=>[sum(subt(x))*1.16]}))
  ];
}

/* ---------- Funciones de resumen · Reporte de nómina ---------- */
export function escenarioNomina(rng){
  const m=8,u=m+1;
  const d=misma(rng,r=>{const t=tablaNomina(r,m);return {celdas:aCeldas(t,{F1:'Indicador',G1:'Valor'}),tabla:t}});
  const sueldos=x=>x.tabla.filas.map(f=>f[2]);
  const ctx='Recursos Humanos te pide un resumen de la nómina del mes: total, promedio, cuántos empleados y el sueldo más alto.';
  return [
    con(ctx,formulaQ({rng,datos:d,destino:'G2',formula:`=SUMA(C2:C${u})`,enunciado:'1/4 · Escribe en <b>G2</b> el total de sueldos.',
      pasos:[P('Columna Sueldo',`C2:C${u}`,'Sin encabezado.'),F('Suma',`=SUMA(C2:C${u})`,'Total.')],errores:[[`=SUMA(D2:D${u})`,'Esas son horas extra.']],regla:'SUMA(rango).',pista:'SUMA de la columna Sueldo.',esperado:x=>[sum(sueldos(x))]})),
    con(ctx,formulaQ({rng,datos:d,destino:'G3',formula:`=REDONDEAR(PROMEDIO(C2:C${u});0)`,enunciado:'2/4 · Escribe en <b>G3</b> el sueldo promedio redondeado a pesos enteros.',
      pasos:[P('Promedio',`PROMEDIO(C2:C${u})`,'Primero el cálculo.'),F('Redondea a 0 decimales',`=REDONDEAR(PROMEDIO(C2:C${u});0)`,'Una función dentro de otra.')],errores:[[`=PROMEDIO(C2:C${u})`,'Falta redondear.']],regla:'REDONDEAR(número; 0) da un entero.',pista:'REDONDEAR(PROMEDIO(…);0).',esperado:x=>{const s=sueldos(x);return [Math.round(sum(s)/s.length)]}})),
    con(ctx,formulaQ({rng,datos:d,destino:'G4',formula:`=CONTARA(A2:A${u})`,enunciado:'3/4 · Escribe en <b>G4</b> cuántos empleados hay (cuenta los nombres).',
      pasos:[P('Los nombres son texto','CONTARA','CONTAR no cuenta textos.'),F('Cuenta',`=CONTARA(A2:A${u})`,'No vacías.')],errores:[[`=CONTAR(A2:A${u})`,'CONTAR solo cuenta números: daría 0.']],regla:'CONTARA cuenta celdas no vacías.',pista:'CONTARA de los nombres.',esperado:()=>[m]})),
    con(ctx,formulaQ({rng,datos:d,destino:'G5',formula:`=MAX(C2:C${u})`,enunciado:'4/4 · Escribe en <b>G5</b> el sueldo más alto.',
      pasos:[P('El mayor','MAX','Extremo superior.'),F('Fórmula',`=MAX(C2:C${u})`,'Sueldo máximo.')],errores:[[`=MIN(C2:C${u})`,'Ese es el más bajo.']],regla:'MAX(rango).',pista:'MAX de la columna Sueldo.',esperado:x=>[Math.max(...sueldos(x))]}))
  ];
}

/* ---------- Lógica · Boleta de calificaciones ---------- */
export function escenarioBoleta(rng){
  const m=7,u=m+1;
  const base=(r,hasta)=>{const t=tablaCalif(r,m);const c=aCeldas(t,{F1:'Promedio',G1:'Resultado',H1:'Letra'});
    for(let i=2;i<=u;i++)if(hasta>=1)c['F'+i]=`=PROMEDIO(B${i}:D${i})`;return {celdas:c,tabla:t}};
  const d0=misma(rng,r=>base(r,0)),d1=misma(rng,r=>base(r,1));
  const prom=x=>x.tabla.filas.map(f=>(f[1]+f[2]+f[3])/3),asis=x=>x.tabla.filas.map(f=>f[4]);
  const ctx='Preparas la boleta del grupo: promedio de los tres exámenes, si aprueba, si pasa también por asistencia y su letra.';
  return [
    con(ctx,formulaQ({rng,datos:d0,destino:'F2',formula:'=PROMEDIO(B2:D2)',copiar:m-1,enunciado:'1/4 · Escribe en <b>F2</b> el promedio de los tres exámenes (B a D); se copiará hacia abajo.',
      pasos:[P('Los tres exámenes','B2:D2','La fila del alumno.'),F('Promedio','=PROMEDIO(B2:D2)','Se copia a cada alumno.')],errores:[['=SUMA(B2:D2)','Eso es la suma, no el promedio.']],regla:'PROMEDIO(rango de la fila).',pista:'PROMEDIO de B2 a D2.',esperado:prom})),
    con(ctx,formulaQ({rng,datos:d1,destino:'G2',formula:'=SI(F2>=70;"Aprobado";"Reprobado")',copiar:m-1,enunciado:'2/4 · Escribe en <b>G2</b> «Aprobado» si el promedio es 70 o más; si no, «Reprobado».',
      pasos:[P('Prueba','F2>=70','70 también aprueba.'),F('SI','=SI(F2>=70;"Aprobado";"Reprobado")','Textos entre comillas.')],errores:[['=SI(F2>70;"Aprobado";"Reprobado")','Con > el 70 exacto reprobaría.']],regla:'SI(prueba; si_verdadero; si_falso).',pista:'SI(F2>=70;…;…).',esperado:x=>prom(x).map(p=>p>=70?'Aprobado':'Reprobado')})),
    con(ctx,formulaQ({rng,datos:d1,destino:'G2',formula:'=SI(Y(F2>=70;E2>=0.8);"Sí";"No")',copiar:m-1,enunciado:'3/4 · Ahora usa la columna Resultado para otra regla: escribe en <b>G2</b> «Sí» si pasa por promedio (≥ 70) <b>y</b> por asistencia (E ≥ 0.8); si no, «No».',
      pasos:[P('Dos condiciones','Y(F2>=70;E2>=0.8)','Las dos deben cumplirse.'),F('SI con Y','=SI(Y(F2>=70;E2>=0.8);"Sí";"No")','Y dentro de SI.')],errores:[['=SI(O(F2>=70;E2>=0.8);"Sí";"No")','Con O bastaría una condición.']],regla:'Y es verdadero solo si todas las condiciones se cumplen.',pista:'SI(Y(…);"Sí";"No").',esperado:x=>prom(x).map((p,i)=>p>=70&&asis(x)[i]>=0.8?'Sí':'No')})),
    con(ctx,formulaQ({rng,datos:d1,destino:'H2',formula:'=SI(F2>=90;"A";SI(F2>=80;"B";"C"))',copiar:m-1,enunciado:'4/4 · Escribe en <b>H2</b> la letra: «A» con 90 o más, «B» con 80 o más, si no «C».',
      pasos:[P('Del tramo más alto al más bajo','F2>=90, luego F2>=80','Si empiezas por 80, el 95 sería B.'),F('SI anidado','=SI(F2>=90;"A";SI(F2>=80;"B";"C"))','El segundo SI va en el «si no».')],errores:[['=SI(F2>=80;"B";SI(F2>=90;"A";"C"))','El orden está al revés: un 95 saldría B.']],regla:'En SI anidados evalúa los tramos en orden.',pista:'Empieza por el tramo más alto.',esperado:x=>prom(x).map(p=>p>=90?'A':p>=80?'B':'C')}))
  ];
}

/* ---------- Funciones condicionales · Ventas por región ---------- */
export function escenarioRegiones(rng){
  const m=10,u=m+1,reg=rng.elegir(['Norte','Sur','Centro','Este']);
  const d=misma(rng,r=>{const t=tablaVentas(r,m);t.filas[0][1]=reg;t.filas[1][1]=reg;return {celdas:aCeldas(t,{G1:'Indicador',H1:'Valor'}),tabla:t}});
  const de=x=>x.tabla.filas.filter(f=>f[1]===reg);
  const ctx=`El gerente de la región <b>${reg}</b> quiere sus números: cuántas ventas tuvo, cuántas unidades vendió, cuántas ventas fueron grandes (más de 10 unidades) y su promedio de unidades.`;
  return [
    con(ctx,formulaQ({rng,datos:d,destino:'H2',formula:`=CONTAR.SI(B2:B${u};"${reg}")`,enunciado:`1/4 · Escribe en <b>H2</b> cuántas ventas hubo en la región ${reg}.`,
      pasos:[P('Rango y criterio',`B2:B${u}; "${reg}"`,'La región está en B.'),F('Cuenta',`=CONTAR.SI(B2:B${u};"${reg}")`,'Un criterio.')],errores:[[`=CONTAR(B2:B${u})`,'CONTAR no filtra por región.']],regla:'CONTAR.SI(rango; criterio).',pista:'CONTAR.SI sobre la columna Región.',esperado:x=>[de(x).length]})),
    con(ctx,formulaQ({rng,datos:d,destino:'H3',formula:`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,enunciado:`2/4 · Escribe en <b>H3</b> cuántas unidades se vendieron en ${reg}.`,
      pasos:[P('Criterio en B, suma en D',`B2:B${u}; "${reg}"; D2:D${u}`,'Tercer argumento: lo que se suma.'),F('Suma condicionada',`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,'Unidades de esa región.')],errores:[[`=SUMAR.SI(B2:B${u};"${reg}";E2:E${u})`,'Eso suma precios, no unidades.']],regla:'SUMAR.SI(rango_criterio; criterio; rango_suma).',pista:'SUMAR.SI con la columna Unidades.',esperado:x=>[sum(de(x).map(f=>f[3]))]})),
    con(ctx,formulaQ({rng,datos:d,destino:'H4',formula:`=CONTAR.SI.CONJUNTO(B2:B${u};"${reg}";D2:D${u};">10")`,enunciado:`3/4 · Escribe en <b>H4</b> cuántas ventas de ${reg} tuvieron más de 10 unidades.`,
      pasos:[P('Dos criterios',`región = "${reg}" y unidades ">10"`,'Deben cumplirse los dos.'),F('Varios criterios',`=CONTAR.SI.CONJUNTO(B2:B${u};"${reg}";D2:D${u};">10")`,'Pares rango–criterio.')],errores:[[`=CONTAR.SI(D2:D${u};">10")`,'Eso cuenta todas las regiones.']],regla:'CONTAR.SI.CONJUNTO(rango1; crit1; rango2; crit2).',pista:'.CONJUNTO con dos pares.',esperado:x=>[de(x).filter(f=>f[3]>10).length]})),
    con(ctx,formulaQ({rng,datos:d,destino:'H5',formula:`=PROMEDIO.SI(B2:B${u};"${reg}";D2:D${u})`,enunciado:`4/4 · Escribe en <b>H5</b> el promedio de unidades por venta en ${reg}.`,
      pasos:[P('Igual que SUMAR.SI','PROMEDIO.SI','Promedia lo que cumple.'),F('Promedio condicionado',`=PROMEDIO.SI(B2:B${u};"${reg}";D2:D${u})`,'Solo esa región.')],errores:[[`=PROMEDIO(D2:D${u})`,'Eso promedia todas las regiones.']],regla:'PROMEDIO.SI(rango_criterio; criterio; rango_promedio).',pista:'PROMEDIO.SI con unidades.',esperado:x=>{const v=de(x).map(f=>f[3]);return [sum(v)/v.length]}}))
  ];
}

/* ---------- Búsqueda · Consulta de inventario ---------- */
export function escenarioInventarioBusca(rng){
  const m=8,u=m+1;
  const d=misma(rng,r=>{const t=tablaInventario(r,m);return {celdas:aCeldas(t,{G1:'Producto a consultar',H1:t.filas[2][0],G2:'Precio',G3:'Existencia',G4:'Más existencia',G5:'Impresora'}),tabla:t}});
  const fila=x=>x.tabla.filas.find(f=>f[0]===x.celdas.H1);
  const ctx='En el almacén te piden una hoja de consulta: escribes un producto en <b>H1</b> y aparecen su precio y su existencia. También quieren saber cuál tiene más piezas y si hay impresoras.';
  return [
    con(ctx,formulaQ({rng,datos:d,destino:'H2',formula:`=BUSCARV(H1;A2:E${u};5;FALSO)`,enunciado:'1/4 · Escribe en <b>H2</b> el Precio del producto de H1 con BUSCARV.',
      pasos:[P('Busca en la primera columna',`H1 en A2:E${u}`,'El producto está en A.'),F('Columna 5 = Precio, exacta',`=BUSCARV(H1;A2:E${u};5;FALSO)`,'FALSO = coincidencia exacta.')],errores:[[`=BUSCARV(H1;A2:E${u};4;FALSO)`,'La columna 4 es Mínimo; Precio es la 5.']],regla:'BUSCARV(valor; tabla; columna; FALSO).',pista:'Precio es la 5.ª columna.',esperado:x=>[fila(x)[4]]})),
    con(ctx,formulaQ({rng,datos:d,destino:'H3',formula:`=BUSCARX(H1;A2:A${u};C2:C${u})`,enunciado:'2/4 · Escribe en <b>H3</b> la Existencia del producto de H1, ahora con BUSCARX.',
      pasos:[P('Dónde buscar y qué devolver',`A2:A${u} → C2:C${u}`,'Dos rangos del mismo tamaño.'),F('BUSCARX',`=BUSCARX(H1;A2:A${u};C2:C${u})`,'Exacta por defecto.')],errores:[[`=BUSCARX(H1;C2:C${u};A2:A${u})`,'Los rangos están al revés.']],regla:'BUSCARX(valor; rango_búsqueda; rango_resultado).',pista:'Busca en A y devuelve C.',esperado:x=>[fila(x)[2]]})),
    con(ctx,formulaQ({rng,datos:d,destino:'H4',formula:`=INDICE(A2:A${u};COINCIDIR(MAX(C2:C${u});C2:C${u};0))`,enunciado:'3/4 · Escribe en <b>H4</b> el nombre del producto con más existencia.',
      pasos:[P('La existencia mayor',`MAX(C2:C${u})`,'El valor.'),P('Su posición',`COINCIDIR(MAX(C2:C${u});C2:C${u};0)`,'Exacta.'),F('El nombre en esa posición',`=INDICE(A2:A${u};COINCIDIR(MAX(C2:C${u});C2:C${u};0))`,'INDICE + COINCIDIR.')],
      errores:[[`=MAX(C2:C${u})`,'Eso da la cantidad, no el nombre.']],regla:'INDICE(resultado; COINCIDIR(valor; búsqueda; 0)).',pista:'MAX, COINCIDIR e INDICE.',esperado:x=>{const e=x.tabla.filas.map(f=>f[2]),k=e.indexOf(Math.max(...e));return [x.tabla.filas[k][0]]}})),
    con(ctx,formulaQ({rng,datos:d,destino:'H5',formula:`=SI.ERROR(BUSCARV(G5;A2:E${u};5;FALSO);"No existe")`,enunciado:'4/4 · En G5 dice «Impresora». Escribe en <b>H5</b> su precio con BUSCARV, pero que muestre «No existe» si no está en el inventario.',
      pasos:[P('La búsqueda puede fallar',`BUSCARV(G5;A2:E${u};5;FALSO)`,'Daría #N/D.'),F('Envuélvela con SI.ERROR',`=SI.ERROR(BUSCARV(G5;A2:E${u};5;FALSO);"No existe")`,'El segundo argumento es el reemplazo.')],
      errores:[[`=BUSCARV(G5;A2:E${u};5;FALSO)`,'Sin SI.ERROR se ve #N/D.']],regla:'SI.ERROR(valor; valor_si_error).',pista:'SI.ERROR(BUSCARV(…);"No existe").',esperado:x=>[x.tabla.filas.some(f=>f[0]==='Impresora')?x.tabla.filas.find(f=>f[0]==='Impresora')[4]:'No existe']}))
  ];
}

/* ---------- Texto y fechas · Base de clientes ---------- */
export function escenarioClientes(rng){
  const m=6,u=m+1,PAISES=['MX','CO','PE','CL','AR'];
  const d=misma(rng,r=>{const filas=r.barajar(NOMBRES).slice(0,m).map(n=>[n,r.elegir(APELLIDOS),`${r.elegir(PAISES)}-${r.entero(1000,9999)}`,serial(r.entero(2018,2025),r.entero(1,12),r.entero(1,28))]);
    return {celdas:aCeldas({cab:['Nombre','Apellido','Código','Alta'],filas},{E1:'Nombre completo',F1:'País',G1:'Número',H1:'Año de alta'}),filas}});
  const ctx='Limpias la base de clientes: nombre completo, el país (las 2 letras al inicio del código), el número del código (los 4 dígitos finales) y el año de alta.';
  const anio=s=>new Date(Date.UTC(1899,11,30)+s*864e5).getUTCFullYear();
  return [
    con(ctx,formulaQ({rng,datos:d,destino:'E2',formula:'=A2&" "&B2',copiar:m-1,enunciado:'1/4 · Escribe en <b>E2</b> el nombre completo (Nombre, espacio, Apellido); se copiará hacia abajo.',
      pasos:[P('Une con &','A2 & " " & B2','El " " es el espacio.'),F('Fórmula','=A2&" "&B2','Texto unido.')],errores:[['=A2&B2','Falta el espacio.']],regla:'& une textos; el espacio va entre comillas.',pista:'A2&" "&B2.',esperado:x=>x.filas.map(f=>f[0]+' '+f[1])})),
    con(ctx,formulaQ({rng,datos:d,destino:'F2',formula:'=IZQUIERDA(C2;2)',copiar:m-1,enunciado:'2/4 · Escribe en <b>F2</b> el país: las 2 primeras letras del Código.',
      pasos:[P('Desde la izquierda','IZQUIERDA(C2;2)','2 caracteres.'),F('Fórmula','=IZQUIERDA(C2;2)','País.')],errores:[['=DERECHA(C2;2)','Esas son las últimas.']],regla:'IZQUIERDA(texto; n).',pista:'Las primeras 2 letras.',esperado:x=>x.filas.map(f=>f[2].slice(0,2))})),
    con(ctx,formulaQ({rng,datos:d,destino:'G2',formula:'=DERECHA(C2;4)',copiar:m-1,enunciado:'3/4 · Escribe en <b>G2</b> los 4 dígitos finales del Código.',
      pasos:[P('Desde la derecha','DERECHA(C2;4)','4 caracteres.'),F('Fórmula','=DERECHA(C2;4)','Número.')],errores:[['=IZQUIERDA(C2;4)','Eso da «MX-1».']],regla:'DERECHA(texto; n).',pista:'Los últimos 4.',esperado:x=>x.filas.map(f=>f[2].slice(-4))})),
    con(ctx,formulaQ({rng,datos:d,destino:'H2',formula:'=AÑO(D2)',copiar:m-1,enunciado:'4/4 · Escribe en <b>H2</b> el año de alta.',
      pasos:[P('La fecha es un número','AÑO(D2)','Extrae el año.'),F('Fórmula','=AÑO(D2)','Año.')],errores:[['=DERECHA(D2;4)','La fecha es un número de serie: usa AÑO.']],regla:'AÑO(fecha).',pista:'AÑO de la fecha de alta.',esperado:x=>x.filas.map(f=>anio(f[3]))}))
  ];
}

/* ---------- Temas sin fórmulas: decisiones ---------- */
const q=(contexto,que,{enunciado,acepta,errores,regla,x})=>({...txt({enunciado:`<p class="contexto">${contexto}</p>${enunciado}`,acepta,errores,regla,es:true,pista:'Piensa qué necesitas lograr.',
  pasos:[paso('¿Qué pide este paso?',que,'Cada paso usa algo distinto del tema.'),final('Escribe la respuesta',marca(acepta[0]),x)]}),profundidad:'escenario'});

export function escenarioLibro(rng){
  const mes=rng.elegir(['enero','marzo','julio']);
  const C=`Preparas el libro de reportes de ${mes}: una hoja por área y una hoja «Resumen» que se imprimirá para la junta.`;
  return [
    q(C,'Referenciar otra hoja',{enunciado:'1/4 · En «Resumen», ¿cómo traes el total que está en B20 de la hoja «Ventas»?',acepta:['=Ventas!B20','Ventas!B20'],errores:[['=Ventas:B20','El separador de hoja es «!».']],regla:'Hoja!Celda.',x:'=Ventas!B20.'}),
    q(C,'Fijar encabezados',{enunciado:'2/4 · La hoja «Ventas» tiene 900 filas. ¿Qué haces para no perder de vista los encabezados?',acepta:['inmovilizar la fila superior','inmovilizar paneles','inmovilizar fila superior'],errores:[['ocultar filas','Se inmovilizan los paneles.']],regla:'Vista › Inmovilizar paneles.',x:'Inmovilizar la fila superior.'}),
    q(C,'Imprimir en una hoja',{enunciado:'3/4 · El «Resumen» se imprime en 2 páginas por 2 columnas. ¿Qué opción de impresión usas?',acepta:['ajustar a una pagina','ajustar a 1 pagina','ajustar hoja en una pagina','ajustar a una página'],errores:[['reducir la letra','Usa «Ajustar a una página».']],regla:'Ajustar a una página / orientación.',x:'Ajustar a una página.'}),
    q(C,'Elegir el formato del archivo',{enunciado:'4/4 · El libro tiene una macro que actualiza todo. ¿En qué formato lo guardas?',acepta:['.xlsm','xlsm'],errores:[['.csv','CSV pierde todo menos los datos.'],['.xlsx','.xlsx no guarda macros.']],regla:'.xlsm guarda macros.',x:'.xlsm.'})
  ];
}
export function escenarioOrganizar(rng){
  const tope=rng.elegir([1000,5000,10000]);
  const C=`Recibes una lista de 3 000 pedidos y debes dejarla lista para analizar: tabla, orden, filtros, formato y captura sin errores.`;
  return [
    q(C,'Convertir en tabla',{enunciado:'1/4 · ¿Qué atajo convierte la lista en tabla?',acepta:['Ctrl+T','ctrl t'],errores:[['Ctrl+Shift+L','Ese solo activa filtros.']],regla:'Ctrl+T crea la tabla.',x:'Ctrl+T.'}),
    q(C,'Ordenar por dos niveles',{enunciado:'2/4 · Quieres los pedidos por región y, dentro de cada región, del más caro al más barato. ¿Cuál es el primer nivel de orden?',acepta:['region','la region','región'],errores:[['monto','Primero se agrupa por región.']],regla:'Ordenar por varios niveles: primero el criterio principal.',x:'Región, luego monto descendente.'}),
    q(C,'Resaltar pedidos grandes',{enunciado:`3/4 · Quieres pintar toda la fila de los pedidos de más de $${tope} (monto en la columna E, datos desde la fila 2). ¿Qué fórmula usas en el formato condicional?`,acepta:[`=$E2>${tope}`,`$E2>${tope}`],errores:[[`=E2>${tope}`,'Sin $ en la columna no pinta la fila completa.']],regla:'Formato condicional por fórmula, con la columna fija.',x:`=$E2>${tope}.`}),
    q(C,'Evitar errores de captura',{enunciado:'4/4 · La columna Estado solo puede ser «Pendiente», «Enviado» o «Entregado». ¿Qué validación usas?',acepta:['lista','una lista desplegable','validacion de lista'],errores:[['texto','Una lista evita variantes mal escritas.']],regla:'Validación de datos › Lista.',x:'Lista desplegable.'})
  ];
}
export function escenarioGraficoJunta(rng){
  const C='Preparas los gráficos de la junta mensual: ventas por mes, ventas por región, participación de 3 productos y margen junto a las ventas.';
  return [
    q(C,'Tendencia',{enunciado:'1/4 · Para mostrar cómo evolucionaron las ventas mes a mes, ¿qué gráfico usas?',acepta:['lineas','líneas','de lineas'],errores:[['circular','El circular no muestra el tiempo.']],regla:'Tiempo: líneas.',x:'Líneas.'}),
    q(C,'Comparar categorías',{enunciado:'2/4 · Para comparar las ventas de 4 regiones, ¿qué gráfico usas?',acepta:['columnas','barras','de columnas'],errores:[['lineas','Para categorías: columnas o barras.']],regla:'Categorías: columnas o barras.',x:'Columnas.'}),
    q(C,'Escalas distintas',{enunciado:'3/4 · Combinas ventas (millones) y margen (%) y el margen se ve plano. ¿Qué agregas?',acepta:['eje secundario','un eje secundario'],errores:[['otra leyenda','Escalas distintas: eje secundario.']],regla:'Eje secundario para series con escalas muy distintas.',x:'Eje secundario.'}),
    q(C,'Que se entienda',{enunciado:'4/4 · ¿Qué elemento haces que diga la conclusión, por ejemplo «El Norte creció 20 %»?',acepta:['el titulo','titulo','título'],errores:[['la leyenda','El título comunica la idea principal.']],regla:'Título claro, ejes con unidades, sin adornos.',x:'El título.'})
  ];
}
export function escenarioAtajos(rng){
  const C='Tienes 10 minutos para preparar un reporte antes de una junta: solo con el teclado.';
  return [
    q(C,'Copiar un dato',{enunciado:'1/4 · Copias la celda A2 y la pegas en D2. ¿Qué atajos usas? (en orden, separados por coma)',acepta:['Ctrl+C, Ctrl+V','ctrl c ctrl v'],errores:[['Ctrl+X, Ctrl+V','Eso mueve, no copia.']],regla:'Ctrl+C copiar; Ctrl+V pegar.',x:'Ctrl+C, Ctrl+V.'}),
    q(C,'Sumar rápido',{enunciado:'2/4 · Debajo de una columna de montos quieres la suma automática. ¿Qué atajo usas?',acepta:['Alt+=','alt ='],errores:[['Ctrl+S','Ctrl+S es subrayado en Excel en español.']],regla:'Alt+= autosuma.',x:'Alt+=.'}),
    q(C,'Fijar una referencia',{enunciado:'3/4 · Escribiendo =B2*H1, quieres que H1 quede como $H$1. ¿Qué tecla presionas?',acepta:['F4'],errores:[['F2','F2 edita la celda.']],regla:'F4 alterna los $.',x:'F4.'}),
    q(C,'Guardar',{enunciado:'4/4 · Antes de la junta guardas el archivo. ¿Qué atajo usas en Excel en español?',acepta:['Ctrl+G','ctrl g'],errores:[['Ctrl+S','En español es Ctrl+G.']],regla:'Ctrl+G guardar.',x:'Ctrl+G.'})
  ];
}

/* ---------- Escenario de oficina · Control de asistencia ---------- */
export function escenarioAsistencia(rng){
  const m=8,u=m+1,dias=rng.elegir([20,22]);
  const base=(r,hasta)=>{const filas=r.barajar(NOMBRES).slice(0,m).map(n=>[n,r.entero(Math.round(dias*0.6),dias),dias]);
    const c=aCeldas({cab:['Empleado','Asistió','Días hábiles'],filas},{D1:'% asistencia',E1:'Estado',G1:'Indicador',H1:'Valor'});
    for(let i=2;i<=u;i++){if(hasta>=1)c['D'+i]=`=B${i}/C${i}`;if(hasta>=2)c['E'+i]=`=SI(D${i}<0.8;"Revisar";"OK")`}
    return {celdas:c,filas}};
  const d=[0,1,2].map(k=>misma(rng,r=>base(r,k)));
  const pct=x=>x.filas.map(f=>f[1]/f[2]);
  const ctx=`Controlas la asistencia del mes (${dias} días hábiles): porcentaje de cada empleado, quién necesita revisión (menos de 80 %), cuántos son y el promedio del equipo.`;
  return [
    con(ctx,formulaQ({rng,datos:d[0],destino:'D2',formula:'=B2/C2',copiar:m-1,enunciado:'1/4 · Escribe en <b>D2</b> el porcentaje de asistencia (Asistió ÷ Días hábiles); se copiará hacia abajo.',
      pasos:[P('Parte entre total','B2/C2','Da un decimal entre 0 y 1.'),F('Fórmula','=B2/C2','Con formato de % se ve como porcentaje.')],errores:[['=C2/B2','Está al revés.']],regla:'Porcentaje = parte / total (y formato %).',pista:'Asistió ÷ Días hábiles.',esperado:pct})),
    con(ctx,formulaQ({rng,datos:d[1],destino:'E2',formula:'=SI(D2<0.8;"Revisar";"OK")',copiar:m-1,enunciado:'2/4 · Escribe en <b>E2</b> «Revisar» si la asistencia es menor a 0.8 (80 %); si no, «OK».',
      pasos:[P('Prueba','D2<0.8','80 % = 0.8.'),F('SI','=SI(D2<0.8;"Revisar";"OK")','Textos entre comillas.')],errores:[['=SI(D2<80;"Revisar";"OK")','D2 es un decimal: 80 % es 0.8.']],regla:'Un porcentaje en Excel es un decimal (80 % = 0.8).',pista:'Compara con 0.8.',esperado:x=>pct(x).map(p=>p<0.8?'Revisar':'OK')})),
    con(ctx,formulaQ({rng,datos:d[2],destino:'H2',formula:`=CONTAR.SI(E2:E${u};"Revisar")`,enunciado:'3/4 · Escribe en <b>H2</b> cuántos empleados están en «Revisar».',
      pasos:[P('Columna Estado',`E2:E${u}`,'Ya tiene el resultado de SI.'),F('Cuenta',`=CONTAR.SI(E2:E${u};"Revisar")`,'Un criterio de texto.')],errores:[[`=CONTAR(E2:E${u})`,'CONTAR no cuenta textos ni filtra.']],regla:'CONTAR.SI(rango; "texto").',pista:'CONTAR.SI de "Revisar".',esperado:x=>[pct(x).filter(p=>p<0.8).length]})),
    con(ctx,formulaQ({rng,datos:d[2],destino:'H3',formula:`=PROMEDIO(D2:D${u})`,enunciado:'4/4 · Escribe en <b>H3</b> el promedio de asistencia del equipo.',
      pasos:[P('Columna de porcentajes',`D2:D${u}`,'Promedio de los %.'),F('Promedio',`=PROMEDIO(D2:D${u})`,'Del equipo.')],errores:[[`=PROMEDIO(B2:B${u})`,'Eso promedia días, no porcentajes.']],regla:'PROMEDIO(rango).',pista:'PROMEDIO de la columna D.',esperado:x=>{const p=pct(x);return [sum(p)/p.length]}}))
  ];
}
