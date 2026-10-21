/* Temas del curso de Python (💼 Cursos), de cero hasta el nivel de la certificación PCEP (Python Institute) y la parte
   básica de PCAP (archivos, módulos y clases). Cada habilidad tiene su generador 'pyc/…' (python-1/2/3.js) con
   «predice la salida», «completa el código», «encuentra el error», «ordena las líneas» y casos de aplicación; cada tema
   enlaza su 🧪 laboratorio («escribe la función», con pruebas como un juez: laboratorio.js). npm run python ejecuta
   todo en Pyodide. Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. */
const lab=(t,titulo='Laboratorio: escribe la función')=>({ir:`laboratorio/${t}`,titulo,icono:'🧪'});
const editor={ir:'editor',titulo:'Editor: prueba tu código',icono:'▶️'};
export default [
  {id:'primeros-pasos',titulo:'Primeros pasos',icono:'👋',descripcion:'Qué es programar, print, comentarios y los errores más comunes.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 1 (conceptos básicos)','Tutorial oficial de Python (docs.python.org/es) — 3. Una introducción informal'],nodos:[
    {id:'print',titulo:'print y comentarios',gen:'pyc/print',herramienta:'editor',completa:true,ref:'PCEP 1.1 – Fundamentos: intérprete, print, comentarios',obj:'predecir lo que muestra print con textos y cuentas, y usar comentarios.'},
    {id:'errores-comunes',titulo:'Leer los errores',gen:'pyc/errores-comunes',completa:true,ref:'PCEP 1.4 – Errores de sintaxis y de ejecución',obj:'reconocer SyntaxError, NameError, TypeError e IndentationError y encontrar la línea que falla.'},
    lab('primeros-pasos'),editor
  ]},
  {id:'variables',titulo:'Variables, tipos e input',icono:'📦',descripcion:'Asignación, int, float, str y bool, conversión y leer datos con input().',
   referencias:['Python Institute — Temario PCEP-30-02, secciones 1.2 y 1.3','Tutorial oficial de Python — 3.1 Usar Python como calculadora (números y cadenas)'],nodos:[
    {id:'variables',titulo:'Variables y asignación',gen:'pyc/variables',completa:true,ref:'PCEP 1.2 – Variables, nombres y asignación',obj:'seguir el valor de una variable cuando se reasigna o se actualiza con +=.'},
    {id:'tipos',titulo:'Tipos y conversión',gen:'pyc/tipos',completa:true,ref:'PCEP 1.2 – Tipos de datos y conversiones (int, float, str, bool)',obj:'distinguir los tipos y convertir entre ellos con int(), float() y str().'},
    {id:'input',titulo:'input: leer datos',gen:'pyc/input',completa:true,ref:'PCEP 1.3 – Entrada y salida de la consola',obj:'leer datos con input() y convertirlos para hacer cuentas.'},
    lab('variables')
  ]},
  {id:'operadores',titulo:'Operadores y f-strings',icono:'➗',descripcion:'Aritmética, precedencia, //, %, ** y formato de salida con f-strings.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 1.3 (operadores)','Tutorial oficial de Python — 7.1 Formateo elegante de la salida'],nodos:[
    {id:'aritmetica',titulo:'Operadores y precedencia',gen:'pyc/aritmetica',completa:true,ref:'PCEP 1.3 – Operadores aritméticos y su prioridad',obj:'calcular expresiones con / // % ** respetando la precedencia.'},
    {id:'fstrings',titulo:'f-strings y redondeo',gen:'pyc/fstrings',completa:true,ref:'PCEP 1.3 – Formato de cadenas',obj:'armar textos con valores usando f-strings y fijar decimales.'},
    lab('operadores')
  ]},
  {id:'condicionales',titulo:'Condicionales',icono:'🔀',descripcion:'if, elif, else, comparaciones y lógica booleana.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 2.1','Tutorial oficial de Python — 4.1 La sentencia if'],nodos:[
    {id:'if-else',titulo:'if, elif y else',gen:'pyc/if-else',completa:true,ref:'PCEP 2.1 – Ejecución condicional',obj:'decidir qué bloque se ejecuta en un if/elif/else.'},
    {id:'logica',titulo:'Lógica booleana',gen:'pyc/logica',completa:true,ref:'PCEP 2.1 – Operadores lógicos y de comparación',obj:'evaluar condiciones con and, or y not.'},
    lab('condicionales')
  ]},
  {id:'bucles',titulo:'Bucles',icono:'🔁',descripcion:'while, for, range, break y continue.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 2.2','Tutorial oficial de Python — 4.2 a 4.4 (for, range, break y continue)'],nodos:[
    {id:'while',titulo:'Bucle while',gen:'pyc/while',completa:true,ref:'PCEP 2.2 – Bucles while',obj:'seguir un while vuelta por vuelta y evitar bucles infinitos.'},
    {id:'for-range',titulo:'for y range',gen:'pyc/for-range',completa:true,ref:'PCEP 2.2 – Bucles for y range()',obj:'recorrer secuencias y rangos con for.'},
    {id:'break-continue',titulo:'break y continue',gen:'pyc/break-continue',completa:true,ref:'PCEP 2.2 – break y continue',obj:'cortar un bucle o saltar una vuelta.'},
    lab('bucles')
  ]},
  {id:'listas',titulo:'Listas y tuplas',icono:'📋',descripcion:'Índices, métodos de listas, rebanadas y tuplas.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 3.1 y 3.2','Tutorial oficial de Python — 5.1 Más sobre listas y 5.3 Tuplas'],nodos:[
    {id:'listas',titulo:'Listas',gen:'pyc/listas',completa:true,ref:'PCEP 3.1 – Listas: índices y métodos',obj:'leer y modificar listas con índices, append, pop y sort.'},
    {id:'rebanadas',titulo:'Rebanadas',gen:'pyc/rebanadas',completa:true,ref:'PCEP 3.1 – Rebanadas (slicing)',obj:'tomar partes de listas y textos con [a:b:paso].'},
    {id:'tuplas',titulo:'Tuplas',gen:'pyc/tuplas',completa:true,ref:'PCEP 3.2 – Tuplas e inmutabilidad',obj:'usar tuplas, desempaquetar e intercambiar variables.'},
    lab('listas')
  ]},
  {id:'diccionarios',titulo:'Diccionarios y conjuntos',icono:'🗂️',descripcion:'Pares clave: valor, get, items y conjuntos sin repetidos.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 3.3','Tutorial oficial de Python — 5.4 Conjuntos y 5.5 Diccionarios'],nodos:[
    {id:'diccionarios',titulo:'Diccionarios',gen:'pyc/diccionarios',completa:true,ref:'PCEP 3.3 – Diccionarios',obj:'guardar, buscar y recorrer pares clave: valor.'},
    {id:'conjuntos',titulo:'Conjuntos',gen:'pyc/conjuntos',completa:true,ref:'PCEP 3.3 – Conjuntos (set)',obj:'quitar repetidos y usar unión, intersección y diferencia.'},
    lab('diccionarios')
  ]},
  {id:'funciones',titulo:'Funciones',icono:'🧩',descripcion:'def, parámetros, return, valores por defecto y alcance.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 4.1 a 4.3','Tutorial oficial de Python — 4.7 Definir funciones y 4.8 Más sobre definición de funciones'],nodos:[
    {id:'funciones',titulo:'Funciones y return',gen:'pyc/funciones',completa:true,ref:'PCEP 4.1 – Definir y llamar funciones; return y None',obj:'definir funciones, llamarlas y usar lo que devuelven.'},
    {id:'parametros',titulo:'Parámetros por defecto y por nombre',gen:'pyc/parametros',completa:true,ref:'PCEP 4.2 – Parámetros posicionales, con nombre y por defecto',obj:'pasar argumentos por posición o por nombre y usar valores por defecto.'},
    {id:'alcance',titulo:'Alcance de variables',gen:'pyc/alcance',completa:true,ref:'PCEP 4.3 – Alcance (scope) y global',obj:'distinguir variables locales y globales.'},
    lab('funciones')
  ]},
  {id:'cadenas',titulo:'Cadenas a fondo',icono:'🔤',descripcion:'Métodos de texto, split y join, recorrer y analizar textos.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 3.4','Tutorial oficial de Python — 3.1.2 Cadenas de caracteres'],nodos:[
    {id:'metodos-cadena',titulo:'Métodos de cadenas',gen:'pyc/metodos-cadena',completa:true,ref:'PCEP 3.4 – Métodos de cadenas',obj:'limpiar y transformar textos con upper, strip, replace, split y join.'},
    {id:'recorrer-cadenas',titulo:'Recorrer y analizar textos',gen:'pyc/recorrer-cadenas',completa:true,ref:'PCEP 3.4 – Cadenas como secuencias',obj:'contar y validar caracteres recorriendo un texto.'},
    lab('cadenas')
  ]},
  {id:'excepciones',titulo:'Errores y excepciones',icono:'🛟',descripcion:'try, except, else, finally y los tipos de error más comunes.',
   referencias:['Python Institute — Temario PCEP-30-02, sección 4.4','Tutorial oficial de Python — 8. Errores y excepciones'],nodos:[
    {id:'try-except',titulo:'try / except',gen:'pyc/try-except',completa:true,ref:'PCEP 4.4 – Manejo de excepciones',obj:'atrapar errores con try/except para que el programa no se detenga.'},
    {id:'tipos-error',titulo:'Tipos de error',gen:'pyc/tipos-error',completa:true,ref:'PCEP 4.4 – Excepciones integradas',obj:'reconocer ValueError, TypeError, IndexError, KeyError y otros.'},
    lab('excepciones')
  ]},
  {id:'archivos',titulo:'Archivos y módulos',icono:'📁',descripcion:'Leer y escribir archivos (simulados en el teléfono) e importar módulos.',
   referencias:['Python Institute — Temario PCAP-31-03, secciones 1 (módulos) y 4.4 (archivos)','Tutorial oficial de Python — 6. Módulos y 7.2 Leer y escribir archivos'],nodos:[
    {id:'archivos',titulo:'Archivos',gen:'pyc/archivos',completa:true,ref:'PCAP 4.4 – Archivos: open, read, write y with',obj:'escribir, agregar y leer archivos de texto.'},
    {id:'modulos',titulo:'Módulos',gen:'pyc/modulos',completa:true,ref:'PCEP 4.5 / PCAP 1.1 – import, from … import y alias',obj:'importar y usar funciones de math y otros módulos.'},
    lab('archivos')
  ]},
  {id:'clases',titulo:'Clases y objetos',icono:'🏗️',descripcion:'Clases, __init__, self, métodos, __str__ y herencia básica.',
   referencias:['Python Institute — Temario PCAP-31-03, sección 3 (programación orientada a objetos)','Tutorial oficial de Python — 9. Clases'],nodos:[
    {id:'clases',titulo:'Clases y objetos',gen:'pyc/clases',completa:true,ref:'PCAP 3.1 – Clases, objetos, __init__ y self',obj:'definir una clase, crear objetos y leer sus atributos.'},
    {id:'metodos',titulo:'Métodos y estado',gen:'pyc/metodos',completa:true,ref:'PCAP 3.2 – Métodos, __str__ y herencia',obj:'escribir métodos que cambian el estado y usar herencia simple.'},
    lab('clases')
  ]},
  {id:'proyectos',titulo:'Proyectos',icono:'🚀',descripcion:'Calculadora, juego de adivinar, agenda y análisis de calificaciones.',
   referencias:['Python Institute — Temario PCEP-30-02 completo (repaso integrador)'],nodos:[
    {id:'proyectos',titulo:'Proyectos pequeños',gen:'pyc/proyectos',completa:true,ref:'PCEP 1–4 – Repaso integrador',obj:'combinar datos, decisiones, bucles y funciones en un programa completo.'},
    lab('proyectos','Laboratorio: calculadora, adivinar y reporte'),editor
  ]}
];
