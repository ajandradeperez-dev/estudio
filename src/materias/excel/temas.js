/* Temas del curso de Excel y sus nodos, en el orden de src/contenido/PLAN.md. Los ids de tema van en la URL y los de
   habilidad en el progreso: no los cambies. Cada habilidad tiene su generador (xl/…) con niveles básico → procedimiento;
   las aplicaciones y escenarios están en nucleo/retos.js. herramienta: sección que se abre desde la habilidad. */
export default [
  {id:'interfaz',titulo:'Interfaz y datos',icono:'🧭',descripcion:'Celdas y rangos, tipos de datos y formato de números y fechas.',nodos:[
    {id:'celdas',titulo:'Celdas y rangos',gen:'xl/celdas',herramienta:'hoja'},
    {id:'tipos-datos',titulo:'Tipos de datos',gen:'xl/tipos-datos'},
    {id:'formato-numeros',titulo:'Formato de números y fechas',gen:'xl/formato'}
  ]},
  {id:'formulas',titulo:'Fórmulas y referencias',icono:'✏️',descripcion:'Operadores, orden de las operaciones y referencias relativas, absolutas y mixtas.',nodos:[
    {id:'operadores',titulo:'Fórmulas y operadores',gen:'xl/operadores',herramienta:'hoja'},
    {id:'referencias',titulo:'Referencias relativas, absolutas y mixtas',gen:'xl/referencias',herramienta:'hoja'}
  ]},
  {id:'resumen',titulo:'Funciones de resumen',icono:'➕',descripcion:'SUMA, PROMEDIO, CONTAR, CONTARA, MAX, MIN y REDONDEAR.',nodos:[
    {id:'suma-promedio',titulo:'SUMA y PROMEDIO',gen:'xl/suma-promedio'},
    {id:'contar-max-min',titulo:'CONTAR, CONTARA, MAX y MIN',gen:'xl/contar-max-min'},
    {id:'redondear',titulo:'REDONDEAR',gen:'xl/redondear'}
  ]},
  {id:'logica',titulo:'Lógica',icono:'🔀',descripcion:'SI, Y, O, SI anidado y SI.ERROR.',nodos:[
    {id:'si',titulo:'Función SI',gen:'xl/si'},
    {id:'y-o',titulo:'Y, O',gen:'xl/y-o'},
    {id:'si-anidado',titulo:'SI anidado',gen:'xl/si-anidado'},
    {id:'si-error',titulo:'SI.ERROR',gen:'xl/si-error'}
  ]},
  {id:'condicionales',titulo:'Condicionales',icono:'🎯',descripcion:'CONTAR.SI(.CONJUNTO), SUMAR.SI(.CONJUNTO) y PROMEDIO.SI.',nodos:[
    {id:'contar-si',titulo:'CONTAR.SI y CONTAR.SI.CONJUNTO',gen:'xl/contar-si'},
    {id:'sumar-si',titulo:'SUMAR.SI y PROMEDIO.SI',gen:'xl/sumar-si'}
  ]},
  {id:'busqueda',titulo:'Búsqueda',icono:'🔎',descripcion:'BUSCARV, BUSCARX e INDICE + COINCIDIR.',nodos:[
    {id:'buscarv',titulo:'BUSCARV',gen:'xl/buscarv'},
    {id:'buscarx',titulo:'BUSCARX',gen:'xl/buscarx'},
    {id:'indice-coincidir',titulo:'INDICE + COINCIDIR',gen:'xl/indice-coincidir'}
  ]},
  {id:'texto-fechas',titulo:'Texto y fechas',icono:'🔤',descripcion:'IZQUIERDA, EXTRAE, LARGO, MAYUSC, unir textos, HOY, FECHA y DIAS.',nodos:[
    {id:'texto',titulo:'Funciones de texto',gen:'xl/texto'},
    {id:'fechas',titulo:'Funciones de fecha',gen:'xl/fechas'}
  ]},
  {id:'organizar-datos',titulo:'Ordenar, filtrar y formato',icono:'🗂️',descripcion:'Ordenar y filtrar, formato condicional y validación de datos.',nodos:[
    {id:'ordenar-filtrar',titulo:'Ordenar y filtrar',gen:'xl/ordenar-filtrar',herramienta:'organizar'},
    {id:'formato-condicional',titulo:'Formato condicional',gen:'xl/formato-condicional',herramienta:'organizar'},
    {id:'validacion',titulo:'Validación de datos',gen:'xl/validacion',herramienta:'organizar'}
  ]},
  {id:'dinamicas',titulo:'Tablas dinámicas',icono:'📋',descripcion:'Filas, columnas, valores y filtros para resumir datos.',nodos:[
    {id:'tabla-dinamica',titulo:'Tablas dinámicas',gen:'xl/tabla-dinamica',herramienta:'dinamica'}
  ]},
  {id:'graficos',titulo:'Gráficos',icono:'📈',descripcion:'Cuál elegir según lo que quieres mostrar, y errores comunes.',nodos:[
    {id:'graficos',titulo:'Gráficos: cuál elegir',gen:'xl/graficos'}
  ]},
  {id:'atajos-teclado',titulo:'Atajos de teclado',icono:'⌨️',descripcion:'Los atajos más útiles, como tarjetas de repaso.',nodos:[
    {id:'atajos',titulo:'Atajos de teclado',gen:'xl/atajos'}
  ]},
  {id:'escenarios',titulo:'Escenarios y herramientas',icono:'💼',descripcion:'Reporte de ventas, gastos, calificaciones e inventario, y la hoja libre.',nodos:[
    {ir:'hoja',titulo:'Hoja libre',icono:'🧮'},
    {ir:'dinamica',titulo:'Simulador de tabla dinámica',icono:'📋'},
    {ir:'organizar',titulo:'Ordenar, filtrar y formato',icono:'🗂️'}
  ]}
];
