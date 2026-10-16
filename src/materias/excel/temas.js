/* Temas del curso de Excel y sus nodos, en el orden de src/contenido/PLAN.md. Alineado con los dominios del examen
   Microsoft Excel Associate (MO-200): 1 administrar hojas y libros · 2 administrar celdas y rangos · 3 tablas ·
   4 fórmulas y funciones · 5 gráficos (más tablas dinámicas y validación). Referencia: soporte oficial de Microsoft.
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Cada habilidad tiene su generador
   (xl/…) con niveles básico → procedimiento; aplicaciones y escenarios en nucleo/retos.js. herramienta: sección que se
   abre desde la habilidad. Cada nodo: ref (dominio de MO-200) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'interfaz',titulo:'Interfaz, hojas y datos',icono:'🧭',descripcion:'Hojas y libros, celdas y rangos, tipos de datos y formato de números y fechas.',
   referencias:['Microsoft — Objetivos del examen MO-200 (Excel Associate)','Soporte de Microsoft — «Formatos de número disponibles en Excel»'],nodos:[
    {titulo:'Administrar hojas y libros',proximo:true,ref:'MO-200 1.x – Administrar hojas y libros (importar, navegar, formatear, imprimir)'},
    {id:'celdas',titulo:'Celdas y rangos',gen:'xl/celdas',herramienta:'hoja',ref:'MO-200 2.1 – Manipular datos en celdas y rangos',obj:'nombrar celdas, escribir rangos y contar sus celdas.'},
    {id:'tipos-datos',titulo:'Tipos de datos',gen:'xl/tipos-datos',ref:'MO-200 2.1 – Datos en celdas',obj:'distinguir números, textos, fechas, lógicos y fórmulas, y prever cómo los trata Excel.'},
    {id:'formato-numeros',titulo:'Formato de números y fechas',gen:'xl/formato',ref:'MO-200 2.2 – Dar formato a celdas y rangos',obj:'predecir cómo se ve un valor con formato de moneda, porcentaje, decimales o fecha.'}
  ]},
  {id:'formulas',titulo:'Fórmulas y referencias',icono:'✏️',descripcion:'Operadores, orden de las operaciones, referencias relativas, absolutas y mixtas, y rangos con nombre.',
   referencias:['Soporte de Microsoft — «Información general sobre fórmulas» y «Cambiar entre referencias relativas, absolutas y mixtas»'],nodos:[
    {id:'operadores',titulo:'Fórmulas y operadores',gen:'xl/operadores',herramienta:'hoja',ref:'MO-200 4.1 – Insertar referencias y fórmulas',obj:'escribir fórmulas con operadores respetando el orden de las operaciones.'},
    {id:'referencias',titulo:'Referencias relativas, absolutas y mixtas',gen:'xl/referencias',herramienta:'hoja',ref:'MO-200 4.1 – Referencias relativas, absolutas y mixtas',obj:'usar $ para que una fórmula funcione al copiarla.'},
    {titulo:'Rangos con nombre',proximo:true,ref:'MO-200 2.3 – Definir y referenciar rangos con nombre'}
  ]},
  {id:'resumen',titulo:'Funciones de resumen',icono:'➕',descripcion:'SUMA, PROMEDIO, CONTAR, CONTARA, MAX, MIN y REDONDEAR.',
   referencias:['Soporte de Microsoft — «Función SUMA», «Función PROMEDIO», «Función CONTAR»'],nodos:[
    {id:'suma-promedio',titulo:'SUMA y PROMEDIO',gen:'xl/suma-promedio',ref:'MO-200 4.2 – Calcular y transformar datos (SUMA, PROMEDIO)',obj:'sumar y promediar rangos, filas y columnas.'},
    {id:'contar-max-min',titulo:'CONTAR, CONTARA, MAX y MIN',gen:'xl/contar-max-min',ref:'MO-200 4.2 – CONTAR, CONTARA, MAX, MIN',obj:'contar celdas con números o no vacías y encontrar extremos.'},
    {id:'redondear',titulo:'REDONDEAR',gen:'xl/redondear',ref:'MO-200 4.2 – Calcular datos',obj:'redondear a decimales, centenas o miles con REDONDEAR.'}
  ]},
  {id:'logica',titulo:'Lógica',icono:'🔀',descripcion:'SI, Y, O, SI anidado y SI.ERROR.',
   referencias:['Soporte de Microsoft — «Función SI», «Funciones SI anidadas» y «Función SI.ERROR»'],nodos:[
    {id:'si',titulo:'Función SI',gen:'xl/si',ref:'MO-200 4.2 – Realizar operaciones condicionales con SI',obj:'devolver un valor u otro según una condición.'},
    {id:'y-o',titulo:'Y, O',gen:'xl/y-o',ref:'MO-200 4.2 – Condiciones múltiples',obj:'combinar condiciones con Y y O dentro de SI.'},
    {id:'si-anidado',titulo:'SI anidado',gen:'xl/si-anidado',ref:'MO-200 4.2 – Condiciones por tramos',obj:'clasificar por tramos con SI anidados en el orden correcto.'},
    {id:'si-error',titulo:'SI.ERROR',gen:'xl/si-error',ref:'MO-200 4.2 – Manejo de errores',obj:'reconocer los errores de Excel y reemplazarlos con SI.ERROR.'}
  ]},
  {id:'condicionales',titulo:'Funciones condicionales',icono:'🎯',descripcion:'CONTAR.SI(.CONJUNTO), SUMAR.SI(.CONJUNTO) y PROMEDIO.SI.',
   referencias:['Soporte de Microsoft — «Función CONTAR.SI», «Función SUMAR.SI.CONJUNTO»'],nodos:[
    {id:'contar-si',titulo:'CONTAR.SI y CONTAR.SI.CONJUNTO',gen:'xl/contar-si',ref:'MO-200 4.2 – CONTAR.SI',obj:'contar celdas que cumplen uno o varios criterios.'},
    {id:'sumar-si',titulo:'SUMAR.SI y PROMEDIO.SI',gen:'xl/sumar-si',ref:'MO-200 4.2 – SUMAR.SI y PROMEDIO.SI',obj:'sumar y promediar solo lo que cumple un criterio.'}
  ]},
  {id:'busqueda',titulo:'Búsqueda',icono:'🔎',descripcion:'BUSCARV, BUSCARX e INDICE + COINCIDIR.',
   referencias:['Soporte de Microsoft — «Función BUSCARV», «Función BUSCARX», «Función INDICE» y «Función COINCIDIR»'],nodos:[
    {id:'buscarv',titulo:'BUSCARV',gen:'xl/buscarv',ref:'Soporte Microsoft – BUSCARV (más allá de MO-200)',obj:'buscar datos en una tabla con coincidencia exacta y aproximada.'},
    {id:'buscarx',titulo:'BUSCARX',gen:'xl/buscarx',ref:'Soporte Microsoft – BUSCARX (Excel 365/2021)',obj:'buscar en cualquier dirección con BUSCARX y su valor si no se encuentra.'},
    {id:'indice-coincidir',titulo:'INDICE + COINCIDIR',gen:'xl/indice-coincidir',ref:'Soporte Microsoft – INDICE y COINCIDIR',obj:'combinar INDICE y COINCIDIR para búsquedas en dos direcciones.'}
  ]},
  {id:'texto-fechas',titulo:'Texto y fechas',icono:'🔤',descripcion:'IZQUIERDA, EXTRAE, LARGO, MAYUSC, unir textos, HOY, FECHA y DIAS.',
   referencias:['Soporte de Microsoft — «Funciones de texto» y «Funciones de fecha y hora»'],nodos:[
    {id:'texto',titulo:'Funciones de texto',gen:'xl/texto',ref:'MO-200 4.3 – Dar formato y modificar texto',obj:'extraer, unir y limpiar textos con funciones de texto.'},
    {id:'fechas',titulo:'Funciones de fecha',gen:'xl/fechas',ref:'Soporte Microsoft – Funciones de fecha',obj:'calcular días, antigüedad y fechas con HOY, FECHA, DIAS y AÑO.'}
  ]},
  {id:'organizar-datos',titulo:'Tablas, ordenar, filtrar y formato',icono:'🗂️',descripcion:'Tablas, ordenar y filtrar, formato condicional y validación de datos.',
   referencias:['Soporte de Microsoft — «Crear y dar formato a tablas», «Usar el formato condicional» y «Aplicar la validación de datos»'],nodos:[
    {titulo:'Tablas: crear, estilos y fila de totales',proximo:true,ref:'MO-200 3.1–3.2 – Crear y modificar tablas'},
    {id:'ordenar-filtrar',titulo:'Ordenar y filtrar',gen:'xl/ordenar-filtrar',herramienta:'organizar',ref:'MO-200 3.3 – Filtrar y ordenar datos de tablas',obj:'predecir el resultado de ordenar (incluso por varios niveles) y filtrar.'},
    {id:'formato-condicional',titulo:'Formato condicional',gen:'xl/formato-condicional',herramienta:'organizar',ref:'MO-200 2.4 – Formato condicional',obj:'escribir reglas de formato condicional, incluidas las de fórmula para filas completas.'},
    {id:'validacion',titulo:'Validación de datos',gen:'xl/validacion',herramienta:'organizar',ref:'Soporte Microsoft – Validación de datos',obj:'predecir qué valores acepta una regla de validación.'}
  ]},
  {id:'dinamicas',titulo:'Tablas dinámicas',icono:'📋',descripcion:'Filas, columnas, valores y filtros para resumir datos.',
   referencias:['Soporte de Microsoft — «Crear una tabla dinámica para analizar datos»'],nodos:[
    {id:'tabla-dinamica',titulo:'Tablas dinámicas',gen:'xl/tabla-dinamica',herramienta:'dinamica',ref:'Soporte Microsoft – Tablas dinámicas',obj:'leer y armar tablas dinámicas con suma, cuenta, promedio, cruces y filtros.'}
  ]},
  {id:'graficos',titulo:'Gráficos',icono:'📈',descripcion:'Cuál elegir y por qué; crear, modificar y dar formato.',
   referencias:['Soporte de Microsoft — «Tipos de gráficos disponibles en Office»'],nodos:[
    {id:'graficos',titulo:'Gráficos: cuál elegir',gen:'xl/graficos',ref:'MO-200 5.1 – Crear gráficos',obj:'elegir el gráfico adecuado para cada pregunta y detectar gráficos engañosos.'},
    {titulo:'Modificar y dar formato a gráficos',proximo:true,ref:'MO-200 5.2–5.3 – Modificar y dar formato a gráficos'}
  ]},
  {id:'atajos-teclado',titulo:'Atajos de teclado',icono:'⌨️',descripcion:'Los atajos más útiles, como tarjetas de repaso.',
   referencias:['Soporte de Microsoft — «Métodos abreviados de teclado de Excel»'],nodos:[
    {id:'atajos',titulo:'Atajos de teclado',gen:'xl/atajos',ref:'Soporte Microsoft – Métodos abreviados de teclado',obj:'usar los atajos de teclado más comunes de Excel en español.'}
  ]},
  {id:'escenarios',titulo:'Escenarios y herramientas',icono:'💼',descripcion:'Reporte de ventas, gastos, calificaciones e inventario, y la hoja libre.',
   referencias:['Microsoft — Objetivos del examen MO-200 (tareas tipo examen)'],nodos:[
    {ir:'hoja',titulo:'Hoja libre',icono:'🧮'},
    {ir:'dinamica',titulo:'Simulador de tabla dinámica',icono:'📋'},
    {ir:'organizar',titulo:'Ordenar, filtrar y formato',icono:'🗂️'}
  ]}
];
