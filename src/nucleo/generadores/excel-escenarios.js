/* Escenarios integradores del curso de Excel: varias fórmulas sobre LA MISMA tabla (la que se ve), cada una verificada por
   resultado en esa tabla y en otra con otros datos (excel-base.js). Los usa nucleo/retos.js. Sin DOM. */
import {crearRng} from '../rng.js';
import {paso,final,code,tablaVentas,tablaCalif,tablaInventario,aCeldas,formulaQ} from './excel-base.js';

const sum=a=>a.reduce((s,x)=>s+x,0);
const con=(ctx,p)=>({...p,enunciado:`<p class="contexto">${ctx}</p>${p.enunciado}`});
// La hoja que se ve es la misma en todas las preguntas del escenario (semilla fija); la de comprobación cambia en cada una
const misma=(rng,construir)=>{const a=rng.entero(1,2**31-1);return r=>construir(r===rng?crearRng(a):r)};

export function escenarioReporteVentas(rng){
  const m=8,u=m+1,reg=rng.elegir(['Norte','Sur','Centro','Este']);
  const base=(r,conTotal)=>{const t=tablaVentas(r,m);t.filas[0][1]=reg;const c=aCeldas(t,{F1:'Total',G1:'Indicador',H1:'Valor'});if(conTotal)for(let i=2;i<=u;i++)c['F'+i]=`=D${i}*E${i}`;return {celdas:c,tabla:t}};
  const d0=misma(rng,r=>base(r,false)),d1=misma(rng,r=>base(r,true));
  const tot=d=>d.tabla.filas.map(f=>f[3]*f[4]);
  const ctx='Reporte de ventas del mes: tu jefa quiere el total de cada venta, lo vendido en una región, el mejor vendedor y cuántos superaron el promedio.';
  return [
    con(ctx,formulaQ({rng,datos:d0,destino:'F2',formula:'=D2*E2',copiar:m-1,enunciado:'1/4 · Escribe en <b>F2</b> el Total de cada venta (Unidades × Precio); se copiará hacia abajo.',
      pasos:[paso('Unidades por precio','D2*E2','De la misma fila.'),final('Fórmula',code('=D2*E2'),'Se copia a todas las filas.')],errores:[['=D2+E2','Se multiplica.']],regla:'Usa referencias de la misma fila y cópiala hacia abajo.',pista:'Unidades × Precio.',esperado:tot})),
    con(ctx,formulaQ({rng,datos:d1,destino:'H2',formula:`=SUMAR.SI(B2:B${u};"${reg}";F2:F${u})`,enunciado:`2/4 · Ya está la columna Total. Escribe en <b>H2</b> cuánto se vendió en pesos en la región <b>${reg}</b>.`,
      pasos:[paso('Condición','B2:B'+u+';"'+reg+'"','Región.'),final('Suma los totales',code(`=SUMAR.SI(B2:B${u};"${reg}";F2:F${u})`),'Tercer argumento: la columna F.')],errores:[[`=SUMAR.SI(B2:B${u};"${reg}";D2:D${u})`,'Eso suma unidades, no pesos.']],regla:'SUMAR.SI(rango; criterio; rango_suma).',pista:'SUMAR.SI con la columna F.',esperado:d=>[sum(d.tabla.filas.map((f,i)=>f[1]===reg?tot(d)[i]:0))]})),
    con(ctx,formulaQ({rng,datos:d1,destino:'H2',formula:`=INDICE(A2:A${u};COINCIDIR(MAX(F2:F${u});F2:F${u};0))`,enunciado:'3/4 · Escribe en <b>H2</b> el nombre del vendedor con la venta (Total) más alta.',
      pasos:[paso('La venta más alta',`MAX(F2:F${u})`,'El mayor total.'),paso('¿En qué posición está?',`COINCIDIR(MAX(F2:F${u});F2:F${u};0)`,'Exacta.'),final('Devuelve el nombre',code(`=INDICE(A2:A${u};COINCIDIR(MAX(F2:F${u});F2:F${u};0))`),'INDICE + COINCIDIR.')],
      errores:[[`=MAX(F2:F${u})`,'Eso da el monto, no el nombre.']],regla:'INDICE(lo que quiero; COINCIDIR(valor; dónde; 0)).',pista:'Combina MAX, COINCIDIR e INDICE.',esperado:d=>{const t=tot(d),k=t.indexOf(Math.max(...t));return [d.tabla.filas[k][0]]}})),
    con(ctx,formulaQ({rng,datos:d1,destino:'H2',formula:`=CONTAR.SI(F2:F${u};">"&PROMEDIO(F2:F${u}))`,enunciado:'4/4 · Escribe en <b>H2</b> cuántas ventas superaron el promedio de los Totales.',
      pasos:[paso('Promedio',`PROMEDIO(F2:F${u})`,'El límite.'),final('Criterio armado con &',code(`=CONTAR.SI(F2:F${u};">"&PROMEDIO(F2:F${u}))`),'">"& une el operador con el valor.')],
      errores:[[`=CONTAR.SI(F2:F${u};">PROMEDIO(F2:F${u})")`,'Dentro de las comillas la función es solo texto: únela con &.']],regla:'Un criterio con operador y cálculo se arma con ">"&valor.',pista:'">"&PROMEDIO(…).',esperado:d=>{const t=tot(d),p=sum(t)/t.length;return [t.filter(x=>x>p).length]}}))
  ];
}

const CATS=['Comida','Transporte','Renta','Ocio','Servicios'];
const tablaGastos=(r,n)=>({cab:['Día','Concepto','Categoría','Monto'],filas:Array.from({length:n},(_,i)=>{const c=i===0?'Renta':i===1?'Comida':i===2?'Ocio':r.elegir(CATS);
  return [i*3+1,{Comida:r.elegir(['Súper','Mercado','Comida rápida']),Transporte:r.elegir(['Gasolina','Metro','Taxi']),Renta:'Renta',Ocio:r.elegir(['Cine','Concierto','Streaming']),Servicios:r.elegir(['Luz','Internet','Agua'])}[c],c,c==='Renta'?r.entero(30,60)*100:r.entero(5,90)*10]})});
export function escenarioGastos(rng){
  const m=9,u=m+1;
  const d=misma(rng,r=>{const t=tablaGastos(r,m);return {celdas:aCeldas(t,{F1:'Indicador',F2:'Total',F3:'Comida',F4:'Ocio',F5:'% renta',G1:'Valor',H1:'Presupuesto ocio',H2:r.entero(3,8)*100}),tabla:t}});
  const de=(x,c)=>sum(x.tabla.filas.filter(f=>f[2]===c).map(f=>f[3])),total=x=>sum(x.tabla.filas.map(f=>f[3]));
  const ctx='Control de gastos personales: anotaste tus gastos de la quincena y quieres saber en qué se te va el dinero.';
  return [
    con(ctx,formulaQ({rng,datos:d,destino:'G2',formula:`=SUMA(D2:D${u})`,enunciado:'1/4 · Escribe en <b>G2</b> el total gastado.',pasos:[paso('Rango de montos',`D2:D${u}`,'Sin encabezado.'),final('Suma',code(`=SUMA(D2:D${u})`),'Total.')],errores:[[`=SUMA(D2:D${u-1})`,'Te faltó la última fila.']],regla:'SUMA(rango).',pista:'SUMA de la columna Monto.',esperado:x=>[total(x)]})),
    con(ctx,formulaQ({rng,datos:d,destino:'G3',formula:`=SUMAR.SI(C2:C${u};"Comida";D2:D${u})`,enunciado:'2/4 · Escribe en <b>G3</b> cuánto gastaste en <b>Comida</b>.',pasos:[paso('Condición','C2:C'+u+';"Comida"','Categoría.'),final('Suma los montos',code(`=SUMAR.SI(C2:C${u};"Comida";D2:D${u})`),'Rango a sumar: D.')],errores:[[`=CONTAR.SI(C2:C${u};"Comida")`,'Eso cuenta los gastos, no los suma.']],regla:'SUMAR.SI(rango; criterio; rango_suma).',pista:'SUMAR.SI por categoría.',esperado:x=>[de(x,'Comida')]})),
    con(ctx,formulaQ({rng,datos:d,destino:'G4',formula:`=SI(SUMAR.SI(C2:C${u};"Ocio";D2:D${u})>H2;"Te pasaste";"Vas bien")`,enunciado:'3/4 · Tu presupuesto de ocio está en <b>H2</b>. Escribe en <b>G4</b> «Te pasaste» si lo gastado en Ocio es mayor que el presupuesto; si no, «Vas bien».',
      pasos:[paso('Gasto en ocio',`SUMAR.SI(C2:C${u};"Ocio";D2:D${u})`,'Primero el cálculo.'),final('Compáralo dentro de SI',code(`=SI(SUMAR.SI(C2:C${u};"Ocio";D2:D${u})>H2;"Te pasaste";"Vas bien")`),'Una función como prueba de SI.')],
      errores:[[`=SI(SUMAR.SI(C2:C${u};"Ocio";D2:D${u})<H2;"Te pasaste";"Vas bien")`,'La comparación está al revés.']],regla:'SI(prueba; si_verdadero; si_falso); la prueba puede ser un cálculo.',pista:'SI(SUMAR.SI(…)>H2;…;…).',esperado:x=>[de(x,'Ocio')>x.celdas.H2?'Te pasaste':'Vas bien']})),
    con(ctx,formulaQ({rng,datos:d,destino:'G5',formula:`=SUMAR.SI(C2:C${u};"Renta";D2:D${u})/SUMA(D2:D${u})`,enunciado:'4/4 · Escribe en <b>G5</b> qué parte del total se fue en <b>Renta</b> (renta ÷ total).',
      pasos:[paso('Renta',`SUMAR.SI(C2:C${u};"Renta";D2:D${u})`,'Parte.'),paso('Total',`SUMA(D2:D${u})`,'Todo.'),final('Divide',code(`=SUMAR.SI(C2:C${u};"Renta";D2:D${u})/SUMA(D2:D${u})`),'Con formato % se ve como porcentaje.')],
      errores:[[`=SUMA(D2:D${u})/SUMAR.SI(C2:C${u};"Renta";D2:D${u})`,'Al revés: parte ÷ total.']],regla:'Porcentaje = parte ÷ total.',pista:'SUMAR.SI ÷ SUMA.',esperado:x=>[de(x,'Renta')/total(x)]}))
  ];
}

export function escenarioCalificaciones(rng){
  const m=8,u=m+1;
  const base=(r,k)=>{const t=tablaCalif(r,m),c=aCeldas(t,{F1:'Promedio',G1:'Estado',H1:'Resumen'});
    if(k>=1)for(let i=2;i<=u;i++)c['F'+i]=`=REDONDEAR(PROMEDIO(B${i}:D${i});1)`;if(k>=2)for(let i=2;i<=u;i++)c['G'+i]=`=SI(F${i}>=60;"Aprobado";"Reprobado")`;return {celdas:c,tabla:t}};
  const prom=d=>d.tabla.filas.map(f=>Math.round((f[1]+f[2]+f[3])/3*10+1e-9)/10);
  const ctx='Calificaciones de tu grupo: calcula promedios, quién aprueba, cuántos aprobaron y quién tuvo el mejor promedio.';
  return [
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,0)),destino:'F2',formula:'=REDONDEAR(PROMEDIO(B2:D2);1)',copiar:m-1,enunciado:'1/4 · Escribe en <b>F2</b> el promedio de los tres exámenes redondeado a 1 decimal (se copiará hacia abajo).',
      pasos:[paso('Promedio de la fila','PROMEDIO(B2:D2)','Tres exámenes.'),final('Redondea',code('=REDONDEAR(PROMEDIO(B2:D2);1)'),'1 decimal.')],errores:[['=PROMEDIO(B2:D2)','Falta redondear.']],regla:'REDONDEAR(PROMEDIO(…);1).',pista:'Función dentro de función.',esperado:prom})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,1)),destino:'G2',formula:'=SI(F2>=60;"Aprobado";"Reprobado")',copiar:m-1,enunciado:'2/4 · Escribe en <b>G2</b> «Aprobado» si el promedio es al menos 60; si no, «Reprobado» (se copiará hacia abajo).',
      pasos:[paso('Prueba','F2>=60','Al menos 60.'),final('Fórmula',code('=SI(F2>=60;"Aprobado";"Reprobado")'),'Textos entre comillas.')],errores:[['=SI(F2>60;"Aprobado";"Reprobado")','«Al menos» incluye el 60: >=.']],regla:'SI(prueba; "sí"; "no").',pista:'SI(F2>=60;…;…).',esperado:d=>prom(d).map(p=>p>=60?'Aprobado':'Reprobado')})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,2)),destino:'H2',formula:`=CONTAR.SI(G2:G${u};"Aprobado")`,enunciado:'3/4 · Escribe en <b>H2</b> cuántos alumnos aprobaron.',
      pasos:[paso('Rango de estados',`G2:G${u}`,'Columna G.'),final('Cuenta los «Aprobado»',code(`=CONTAR.SI(G2:G${u};"Aprobado")`),'Criterio de texto.')],errores:[[`=CONTARA(G2:G${u})`,'CONTARA cuenta a todos.']],regla:'CONTAR.SI(rango; "texto").',pista:'CONTAR.SI.',esperado:d=>[prom(d).filter(p=>p>=60).length]})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,2)),destino:'H2',formula:`=INDICE(A2:A${u};COINCIDIR(MAX(F2:F${u});F2:F${u};0))`,enunciado:'4/4 · Escribe en <b>H2</b> el nombre del alumno con el mejor promedio.',
      pasos:[paso('Mejor promedio',`MAX(F2:F${u})`,'El mayor.'),final('Busca su nombre',code(`=INDICE(A2:A${u};COINCIDIR(MAX(F2:F${u});F2:F${u};0))`),'INDICE + COINCIDIR.')],errores:[[`=MAX(F2:F${u})`,'Eso da el promedio, no el nombre.']],regla:'INDICE(nombres; COINCIDIR(MAX(…); promedios; 0)).',pista:'MAX dentro de COINCIDIR.',esperado:d=>{const p=prom(d);return [d.tabla.filas[p.indexOf(Math.max(...p))][0]]}}))
  ];
}

export function escenarioInventario(rng){
  const m=9,u=m+1,cat=rng.elegir(['Cómputo','Audio','Oficina','Papelería']);
  const base=(r,k)=>{const t=tablaInventario(r,m);t.filas[0][1]=cat;const c=aCeldas(t,{F1:'Alerta',G1:'Pedir',H1:'Resumen'});if(k>=1)for(let i=2;i<=u;i++)c['F'+i]=`=SI(C${i}<D${i};"Pedir";"OK")`;return {celdas:c,tabla:t}};
  const ctx='Inventario de la tienda: arma alertas para saber qué pedir y cuánto.';
  return [
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,0)),destino:'F2',formula:'=SI(C2<D2;"Pedir";"OK")',copiar:m-1,enunciado:'1/4 · Escribe en <b>F2</b> «Pedir» si la Existencia es menor que el Mínimo; si no, «OK» (se copiará hacia abajo).',
      pasos:[paso('Prueba','C2<D2','Bajo el mínimo.'),final('Fórmula',code('=SI(C2<D2;"Pedir";"OK")'),'Alerta por fila.')],errores:[['=SI(C2>D2;"Pedir";"OK")','Al revés: se pide cuando hay menos.']],regla:'SI(prueba; "sí"; "no").',pista:'Compara C con D.',esperado:d=>d.tabla.filas.map(f=>f[2]<f[3]?'Pedir':'OK')})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,1)),destino:'G2',formula:'=SI(C2<D2;D2*2-C2;0)',copiar:m-1,enunciado:'2/4 · Cuando hay que pedir, se pide lo necesario para llegar al <b>doble del Mínimo</b>. Escribe en <b>G2</b> cuántas piezas pedir (0 si no hace falta).',
      pasos:[paso('Meta','D2*2','El doble del mínimo.'),paso('Lo que falta','D2*2-C2','Meta menos existencia.'),final('Solo si está bajo el mínimo',code('=SI(C2<D2;D2*2-C2;0)'),'Si no, 0.')],errores:[['=D2*2-C2','Sin SI, también «pide» (o da negativo) cuando no hace falta.']],regla:'Cada rama de SI puede ser un cálculo.',pista:'SI(C2<D2; cálculo; 0).',esperado:d=>d.tabla.filas.map(f=>f[2]<f[3]?f[3]*2-f[2]:0)})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,1)),destino:'H2',formula:`=CONTAR.SI(F2:F${u};"Pedir")`,enunciado:'3/4 · Escribe en <b>H2</b> cuántos productos hay que pedir.',
      pasos:[paso('Columna de alertas',`F2:F${u}`,'Ya calculada.'),final('Cuenta',code(`=CONTAR.SI(F2:F${u};"Pedir")`),'Criterio de texto.')],errores:[[`=CONTAR(F2:F${u})`,'CONTAR cuenta números, no textos.']],regla:'CONTAR.SI(rango; "texto").',pista:'CONTAR.SI.',esperado:d=>[d.tabla.filas.filter(f=>f[2]<f[3]).length]})),
    con(ctx,formulaQ({rng,datos:misma(rng,r=>base(r,1)),destino:'H2',formula:`=SUMAR.SI(B2:B${u};"${cat}";C2:C${u})`,enunciado:`4/4 · Escribe en <b>H2</b> la existencia total de la categoría <b>${cat}</b>.`,
      pasos:[paso('Condición',`B2:B${u};"${cat}"`,'Categoría.'),final('Suma existencias',code(`=SUMAR.SI(B2:B${u};"${cat}";C2:C${u})`),'Columna C.')],errores:[[`=CONTAR.SI(B2:B${u};"${cat}")`,'Eso cuenta productos, no piezas.']],regla:'SUMAR.SI(rango; criterio; rango_suma).',pista:'SUMAR.SI.',esperado:d=>[sum(d.tabla.filas.filter(f=>f[1]===cat).map(f=>f[2]))]}))
  ];
}
