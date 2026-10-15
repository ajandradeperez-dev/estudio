/* Temas de Matemáticas y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Los nodos {titulo, proximo:true} son lo
   que el PLAN pide y todavía no existe: al crearlo, cámbialo por {id, gen…} y márcalo [x] en PLAN.md. */
export default [
  {id:'prealgebra',titulo:'Aritmética y prealgebra',icono:'🔢',descripcion:'Fracciones, porcentajes, potencias, raíces y notación científica.',nodos:[
    {id:'fracciones',titulo:'Fracciones',gen:'pre/fracciones'},
    {id:'porcentajes',titulo:'Porcentajes',gen:'pre/porcentajes'},
    {id:'potencias-raices',titulo:'Potencias y raíces',gen:'pre/potencias'},
    {id:'orden-operaciones',titulo:'Orden de operaciones',gen:'pre/operaciones'},
    {id:'notacion-cientifica',titulo:'Notación científica',gen:'pre/cientifica'}
  ]},
  {id:'algebra-basica',titulo:'Álgebra',icono:'🧮',descripcion:'Expresiones, ecuaciones, sistemas, factorización, cuadráticas, logaritmos y funciones.',nodos:[
    {id:'expresiones',gen:'alg/expresiones'},
    {id:'ecuaciones-lineales',gen:'alg/ecuacion-lineal'},
    {id:'desigualdades',titulo:'Desigualdades',gen:'alg/desigualdad'},
    {id:'sistemas-2x2',gen:'alg/sistema-2x2'},
    {id:'sistemas-3x3',titulo:'Sistemas 3×3',gen:'alg/sistema-3x3'},
    {id:'productos-notables',titulo:'Productos notables',gen:'alg/productos-notables'},
    {id:'factorizacion',titulo:'Factorización',gen:'alg/factorizacion'},
    {id:'fracciones-algebraicas',titulo:'Fracciones algebraicas',gen:'alg/fracciones-algebraicas'},
    {id:'ecuaciones-cuadraticas',titulo:'Ecuaciones cuadráticas',gen:'alg/cuadratica'},
    {id:'exponentes',titulo:'Leyes de exponentes',gen:'alg/exponentes'},
    {id:'logaritmos',titulo:'Exponenciales y logaritmos',gen:'alg/logaritmos'},
    {id:'funciones',titulo:'Funciones y gráficas',gen:'alg/funciones'}
  ]},
  {id:'trigonometria',titulo:'Trigonometría',icono:'📐',descripcion:'Razones, círculo unitario, identidades y ecuaciones (lo necesario para cálculo).',nodos:[
    {id:'razones-trigonometricas',titulo:'Razones trigonométricas',gen:'tri/razones'},
    {id:'circulo-unitario',titulo:'Círculo unitario',gen:'tri/circulo'},
    {id:'identidades-trigonometricas',titulo:'Identidades básicas',gen:'tri/identidades'},
    {id:'ecuaciones-trigonometricas',titulo:'Ecuaciones trigonométricas',gen:'tri/ecuaciones'}
  ]},
  {id:'algebra-lineal',titulo:'Álgebra lineal',icono:'🧭',descripcion:'Vectores, matrices, Gauss, determinantes, espacios vectoriales y valores propios.',nodos:[
    {id:'vectores',gen:'al/vector-magnitud'},
    {id:'operaciones-producto-punto',gen:'al/vector-operaciones'},
    {id:'producto-punto',titulo:'Producto punto',gen:'al/producto-punto'},
    {id:'angulo-vectores',titulo:'Ángulo entre vectores',gen:'al/angulo'},
    {id:'producto-cruz',titulo:'Producto cruz',gen:'al/producto-cruz'},
    {id:'matrices',titulo:'Multiplicación de matrices',gen:'al/matriz-producto'},
    {id:'gauss',titulo:'Sistemas por Gauss',gen:'al/gauss'},
    {id:'gauss-jordan',titulo:'Gauss-Jordan y rango',gen:'al/gauss-jordan'},
    {id:'determinantes',titulo:'Determinantes',gen:'al/determinante'},
    {id:'inversa',titulo:'Inversa de una matriz 2×2',gen:'al/inversa'},
    {id:'espacios-vectoriales',titulo:'Espacios vectoriales',gen:'al/combinacion-lineal'},
    {id:'independencia-lineal',titulo:'Independencia lineal y base',gen:'al/independencia'},
    {id:'transformaciones-lineales',titulo:'Transformaciones lineales',gen:'al/transformaciones'},
    {id:'valores-propios',titulo:'Valores y vectores propios',gen:'al/valores-propios'}
  ]},
  {id:'calculo-diferencial',titulo:'Cálculo diferencial',icono:'📈',descripcion:'Límites, continuidad, derivadas y sus aplicaciones.',nodos:[
    {id:'limites',gen:'cd/limites'},
    {id:'continuidad',titulo:'Continuidad',gen:'cd/continuidad'},
    {id:'definicion-derivada',titulo:'Definición de derivada',gen:'cd/definicion'},
    {id:'derivada-polinomio',titulo:'Derivada de polinomios',gen:'cd/derivada-polinomio'},
    {id:'regla-producto',titulo:'Regla del producto',gen:'cd/producto'},
    {id:'regla-cociente',titulo:'Regla del cociente',gen:'cd/cociente'},
    {id:'regla-cadena',titulo:'Regla de la cadena',gen:'cd/cadena'},
    {id:'derivadas-trascendentes',titulo:'Derivadas trigonométricas, exponenciales y logarítmicas',gen:'cd/trascendentes'},
    {id:'derivacion-implicita',titulo:'Derivación implícita',gen:'cd/implicita'},
    {id:'maximos-minimos',titulo:'Máximos y mínimos',gen:'cd/maximos'},
    {id:'optimizacion',titulo:'Optimización',gen:'cd/optimizacion'},
    {id:'razon-cambio',titulo:'Razón de cambio',gen:'cd/razon-cambio'},
    {id:'lhopital',titulo:'Regla de L’Hôpital',gen:'cd/lhopital'}
  ]},
  {id:'calculo-integral',titulo:'Cálculo integral',icono:'∫',descripcion:'Antiderivadas, integral definida, técnicas de integración y aplicaciones.',nodos:[
    {id:'antiderivadas',gen:'ci/antiderivada'},
    {id:'integral-definida',titulo:'Integral definida y Teorema Fundamental',gen:'ci/definida'},
    {id:'sustitucion',titulo:'Integración por sustitución',gen:'ci/sustitucion'},
    {id:'integracion-partes',titulo:'Integración por partes',gen:'ci/partes'},
    {id:'fracciones-parciales',titulo:'Fracciones parciales',gen:'ci/fracciones-parciales'},
    {id:'sustitucion-trigonometrica',titulo:'Sustitución trigonométrica',gen:'ci/sustitucion-trig'},
    {id:'area-curva',titulo:'Área bajo la curva y entre curvas',gen:'ci/area'},
    {id:'volumenes-revolucion',titulo:'Volúmenes de revolución',gen:'ci/volumenes'},
    {id:'integrales-impropias',titulo:'Integrales impropias',gen:'ci/impropias'}
  ]}
];
