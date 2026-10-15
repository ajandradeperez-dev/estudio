/* Casos de prueba del evaluador de Excel (src/nucleo/excel/formulas.js): fórmula → resultado esperado.
   npm run revisar los corre todos. La hoja de prueba imita una tabla de ventas:
       A          B        C       D        E
   1   Vendedor   Región   Ventas  Fecha    Meta
   2   Ana        Norte    1200    45292    1000
   3   Luis       Sur      800     45300    1000
   4   Marta      Norte    1500    45310    1000
   5   Pedro      Este     (vacía) 45320    1000
   6   sofía      Sur      950     45330    1000
   7   Total      texto    abc     VERDADERO 0
   G1 = "  hola   mundo  " · G2 = 0 · G3 = "=1/0" · G4 = "=C2*2" · G5 = "=G6+1" · G6 = "=G5+1" (circular) */
export const HOJA={
  A1:'Vendedor',B1:'Región',C1:'Ventas',D1:'Fecha',E1:'Meta',
  A2:'Ana',B2:'Norte',C2:1200,D2:45292,E2:1000,
  A3:'Luis',B3:'Sur',C3:800,D3:45300,E3:1000,
  A4:'Marta',B4:'Norte',C4:1500,D4:45310,E4:1000,
  A5:'Pedro',B5:'Este',D5:45320,E5:1000,
  A6:'sofía',B6:'Sur',C6:950,D6:45330,E6:1000,
  A7:'Total',B7:'texto',C7:'abc',D7:true,E7:0,
  G1:'  hola   mundo  ',G2:0,G3:'=1/0',G4:'=C2*2',G5:'=G6+1',G6:'=G5+1',
  H1:1,H2:3,H3:5,H4:7,H5:9
};
export const HOY=45400; // 18/04/2024
// [fórmula, esperado] · esperado: número, texto, booleano o {err:'#N/A'}
export const CASOS=[
  // operadores y precedencia
  ['=1+2*3',7],['=(1+2)*3',9],['=2^3',8],['=-2^2',4],['=10/4',2.5],['=50%',0.5],['=C2+C3',2000],['=C2-C3*2',-400],['="a"&"b"&1',"ab1"],
  ['=C2>C3',true],['=A2="ana"',true],['=C5+1',1],['=A2&C5',"Ana"],['=1/0',{err:'#¡DIV/0!'}],['=C2/G2',{err:'#¡DIV/0!'}],['=A2+1',{err:'#¡VALOR!'}],
  ['="5"+1',6],['=G4',2400],['=G3+1',{err:'#¡DIV/0!'}],['=G5',{err:'#¡REF!'}],['=Z99',{err:'#¡REF!'}],['=hola',{err:'#¿NOMBRE?'}],['=SUMAR(C2:C6)',{err:'#¿NOMBRE?'}],
  ['=1+',{err:'#¡ERROR!'}],['=SUMA(C2:C6',{err:'#¡ERROR!'}],
  // separadores: ; con coma decimal y , con punto decimal
  ['=REDONDEAR(2,567;2)',2.57],['=REDONDEAR(2.567,2)',2.57],['=SUMA(1;2;3)',6],['=SUMA(1.5,2)',3.5],
  // resumen
  ['=SUMA(C2:C6)',4450],['=SUM(C2:C6)',4450],['=SUMA(C2:C7)',4450],['=PROMEDIO(C2:C6)',1112.5],['=PROMEDIO(C5)',{err:'#¡DIV/0!'}],['=AVERAGE(H1:H5)',5],
  ['=CONTAR(C2:C7)',4],['=CONTAR(A2:A7)',0],['=CONTARA(C2:C7)',5],['=CONTARA(A1:A7)',7],['=CONTAR.BLANCO(C2:C7)',1],['=MAX(C2:C6)',1500],['=MIN(C2:C6)',800],['=MAX(A2:A6)',0],
  ['=SUMA(C2:C6;G3)',{err:'#¡DIV/0!'}],['=SUMA(G3:G4)',{err:'#¡DIV/0!'}],['=CONTAR(G2:G4)',2],
  ['=REDONDEAR(1112.5;0)',1113],['=REDONDEAR(-2.5;0)',-3],['=REDONDEAR(1234.5678;-2)',1200],['=REDONDEAR(0.125;2)',0.13],['=ROUND(2.345,2)',2.35],
  // lógica
  ['=SI(C2>=E2;"Cumple";"No cumple")',"Cumple"],['=SI(C3>=E3;"Cumple";"No cumple")',"No cumple"],['=SI(C3>E3;1)',false],['=IF(C2>1000,"alto","bajo")',"alto"],
  ['=SI(C2>1400;"A";SI(C2>1000;"B";"C"))',"B"],['=Y(C2>1000;B2="Norte")',true],['=Y(C2>1000;B2="Sur")',false],['=O(C3>1000;B3="Sur")',true],['=O(C3>1000;B3="Este")',false],
  ['=AND(TRUE,FALSE)',false],['=OR(FALSE,1)',true],['=Y(A2)',{err:'#¡VALOR!'}],['=NO(VERDADERO)',false],
  ['=SI.ERROR(C2/G2;0)',0],['=SI.ERROR(C2/E2;0)',1.2],['=IFERROR(1/0,"sin dato")',"sin dato"],['=SI(G3>0;1;2)',{err:'#¡DIV/0!'}],
  // condicionales
  ['=CONTAR.SI(B2:B6;"Norte")',2],['=CONTAR.SI(B2:B6;"norte")',2],['=CONTAR.SI(C2:C6;">1000")',2],['=CONTAR.SI(C2:C6;">=950")',3],['=CONTAR.SI(C2:C6;"<>800")',4],
  ['=CONTAR.SI(A2:A6;"*a")',3],['=CONTAR.SI(A2:A6;"?uis")',1],['=CONTAR.SI(C2:C6;"")',1],['=COUNTIF(C2:C6,1200)',1],
  ['=CONTAR.SI.CONJUNTO(B2:B6;"Norte";C2:C6;">1300")',1],['=COUNTIFS(B2:B6,"Sur",C2:C6,"<900")',1],
  ['=SUMAR.SI(B2:B6;"Norte";C2:C6)',2700],['=SUMAR.SI(C2:C6;">900")',3650],['=SUMIF(B2:B6,"Sur",C2:C6)',1750],
  ['=SUMAR.SI.CONJUNTO(C2:C6;B2:B6;"Sur";C2:C6;">900")',950],['=SUMIFS(C2:C6,B2:B6,"Norte")',2700],
  ['=PROMEDIO.SI(B2:B6;"Sur";C2:C6)',875],['=PROMEDIO.SI(B2:B6;"Oeste";C2:C6)',{err:'#¡DIV/0!'}],['=AVERAGEIF(C2:C6,">1000")',1350],
  // búsqueda
  ['=BUSCARV("Marta";A2:C6;3;FALSO)',1500],['=BUSCARV("marta";A2:C6;2;0)',"Norte"],['=BUSCARV("Zoe";A2:C6;3;FALSO)',{err:'#N/A'}],['=BUSCARV("Ana";A2:C6;5;FALSO)',{err:'#¡REF!'}],
  ['=BUSCARV("Ana";A2:C6;0;FALSO)',{err:'#¡VALOR!'}],['=VLOOKUP("Luis",A2:C6,3,FALSE)',800],['=BUSCARV(6;H1:H5;1)',5],['=BUSCARV(6;H1:H5;1;VERDADERO)',5],['=BUSCARV(0;H1:H5;1)',{err:'#N/A'}],
  ['=BUSCARV(100;H1:H5;1)',9],['=BUSCARV("Pedro";A2:C6;3;FALSO)',0],
  ['=BUSCARX("Luis";A2:A6;C2:C6)',800],['=BUSCARX("Zoe";A2:A6;C2:C6;"No está")',"No está"],['=BUSCARX("Zoe";A2:A6;C2:C6)',{err:'#N/A'}],['=XLOOKUP("Marta",A2:A6,B2:B6)',"Norte"],
  ['=BUSCARX(6;H1:H5;H1:H5;;-1)',5],['=BUSCARX(6;H1:H5;H1:H5;;1)',7],['=BUSCARX("M*";A2:A6;C2:C6;;2)',1500],['=BUSCARX("Ventas";A1:E1;A3:E3)',800],
  ['=INDICE(A2:C6;3;1)',"Marta"],['=INDICE(C2:C6;2)',800],['=INDEX(A2:C6,1,3)',1200],['=INDICE(A2:C6;9;1)',{err:'#¡REF!'}],['=INDICE(A1:E1;3)',"Ventas"],
  ['=COINCIDIR("Marta";A2:A6;0)',3],['=MATCH("Zoe",A2:A6,0)',{err:'#N/A'}],['=COINCIDIR(6;H1:H5;1)',3],['=COINCIDIR(6;H1:H5)',3],
  ['=INDICE(C2:C6;COINCIDIR("Luis";A2:A6;0))',800],['=INDICE(B2:B6;COINCIDIR(MAX(C2:C6);C2:C6;0))',"Norte"],
  // texto
  ['=CONCATENAR(A2;" - ";B2)',"Ana - Norte"],['=CONCAT(A2:A3)',"AnaLuis"],['=CONCATENATE("x",1)',"x1"],['=IZQUIERDA(A4;3)',"Mar"],['=IZQUIERDA(A4)',"M"],['=DERECHA(A4;2)',"ta"],
  ['=EXTRAE(A4;2;3)',"art"],['=LARGO(A4)',5],['=LARGO(G1)',16],['=MAYUSC(A2)',"ANA"],['=MINUSC(B2)',"norte"],['=NOMPROPIO(A6)',"Sofía"],['=ESPACIOS(G1)',"hola mundo"],
  ['=LEFT("Excel",2)',"Ex"],['=MID("Excel",2,3)',"xce"],['=LEN("")',0],['=IZQUIERDA(A2;-1)',{err:'#¡VALOR!'}],['=UPPER(TRIM(G1))',"HOLA MUNDO"],
  // fechas (número de serie: 45292 = 01/01/2024)
  ['=FECHA(2024;1;1)',45292],['=DATE(2024,3,1)',45352],['=FECHA(2024;13;1)',45658],['=DIAS(D3;D2)',8],['=DAYS(D6,D2)',38],['=D3-D2',8],['=HOY()',45400],['=TODAY()-D2',108],
  ['=AÑO(D2)',2024],['=MES(D4)',1],['=DIA(D4)',19],['=YEAR(45352)',2024],['=DIAS("2024-01-10";"2024-01-01")',9],['=DIAS("15/03/2024";"01/03/2024")',14],
  ['=SI(DIAS(HOY();D2)>30;"Vencido";"Al día")',"Vencido"]
];
// copiarFormula(fórmula, de, a) → esperado
export const COPIAS=[
  ['=C2*E2','F2','F3','=C3*E3'],['=C2*$E$2','F2','F5','=C5*$E$2'],['=C$2+$A3','D4','F6','=E$2+$A5'],['=SUMA(C2:C6)','C8','D8','=SUMA(D2:D6)'],
  ['=A1&"B2"','B1','B2','=A2&"B2"'],['=A2','B2','B1','=A1'],['=A1','B2','B1','=#¡REF!']
];
