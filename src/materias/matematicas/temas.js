/* Temas de Matemáticas y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Los nodos {titulo, proximo:true} son lo
   que el PLAN pide y todavía no existe: al crearlo, cámbialo por {id, gen…} y márcalo [x] en PLAN.md. */
export default [
  {id:'prealgebra',titulo:'Aritmética y prealgebra',icono:'🔢',descripcion:'Fracciones, porcentajes, potencias, raíces y notación científica.',nodos:[
    {titulo:'Fracciones',proximo:true},
    {titulo:'Porcentajes',proximo:true},
    {titulo:'Potencias y raíces',proximo:true},
    {titulo:'Orden de operaciones',proximo:true},
    {titulo:'Notación científica',proximo:true}
  ]},
  {id:'algebra-basica',titulo:'Álgebra',icono:'🧮',descripcion:'Expresiones, ecuaciones, sistemas, factorización, cuadráticas, logaritmos y funciones.',nodos:[
    {id:'expresiones'},
    {id:'ecuaciones-lineales',gen:'alg/ecuacion-lineal'},
    {titulo:'Desigualdades',proximo:true},
    {id:'sistemas-2x2',gen:'alg/sistema-2x2'},
    {titulo:'Sistemas 3×3',proximo:true},
    {titulo:'Productos notables',proximo:true},
    {id:'factorizacion',titulo:'Factorización',gen:'alg/factorizacion'},
    {titulo:'Fracciones algebraicas',proximo:true},
    {titulo:'Ecuaciones cuadráticas',proximo:true},
    {id:'exponentes',titulo:'Leyes de exponentes',gen:'alg/exponentes'},
    {titulo:'Exponenciales y logaritmos',proximo:true},
    {titulo:'Funciones y gráficas',proximo:true}
  ]},
  {id:'trigonometria',titulo:'Trigonometría',icono:'📐',descripcion:'Razones, círculo unitario, identidades y ecuaciones (lo necesario para cálculo).',nodos:[
    {titulo:'Razones trigonométricas',proximo:true},
    {titulo:'Círculo unitario',proximo:true},
    {titulo:'Identidades básicas',proximo:true},
    {titulo:'Ecuaciones trigonométricas',proximo:true}
  ]},
  {id:'algebra-lineal',titulo:'Álgebra lineal',icono:'🧭',descripcion:'Vectores, matrices, Gauss, determinantes, espacios vectoriales y valores propios.',nodos:[
    {id:'vectores',gen:'al/vector-magnitud'},
    {id:'operaciones-producto-punto',gen:'al/vector-operaciones'},
    {id:'producto-punto',titulo:'Producto punto',gen:'al/producto-punto'},
    {id:'angulo-vectores',titulo:'Ángulo entre vectores',gen:'al/angulo'},
    {titulo:'Producto cruz',proximo:true},
    {id:'matrices',titulo:'Multiplicación de matrices',gen:'al/matriz-producto'},
    {id:'gauss',titulo:'Sistemas por Gauss',gen:'al/gauss'},
    {titulo:'Gauss-Jordan',proximo:true},
    {id:'determinantes',titulo:'Determinantes',gen:'al/determinante'},
    {id:'inversa',titulo:'Inversa de una matriz 2×2',gen:'al/inversa'},
    {titulo:'Espacios vectoriales',proximo:true},
    {titulo:'Independencia lineal y base',proximo:true},
    {titulo:'Transformaciones lineales',proximo:true},
    {titulo:'Valores y vectores propios',proximo:true}
  ]},
  {id:'calculo-diferencial',titulo:'Cálculo diferencial',icono:'📈',descripcion:'Límites, continuidad, derivadas y sus aplicaciones.',nodos:[
    {id:'limites',gen:'cd/limites'},
    {titulo:'Continuidad',proximo:true},
    {titulo:'Definición de derivada',proximo:true},
    {id:'derivada-polinomio',titulo:'Derivada de polinomios',gen:'cd/derivada-polinomio'},
    {id:'regla-producto',titulo:'Regla del producto',gen:'cd/producto'},
    {id:'regla-cociente',titulo:'Regla del cociente',gen:'cd/cociente'},
    {id:'regla-cadena',titulo:'Regla de la cadena',gen:'cd/cadena'},
    {titulo:'Derivadas trigonométricas, exponenciales y logarítmicas',proximo:true},
    {titulo:'Derivación implícita',proximo:true},
    {titulo:'Máximos y mínimos',proximo:true},
    {titulo:'Optimización',proximo:true},
    {titulo:'Razón de cambio',proximo:true},
    {titulo:'Regla de L’Hôpital',proximo:true}
  ]},
  {id:'calculo-integral',titulo:'Cálculo integral',icono:'∫',descripcion:'Antiderivadas, integral definida, técnicas de integración y aplicaciones.',nodos:[
    {id:'antiderivadas',gen:'ci/antiderivada'},
    {id:'integral-definida',titulo:'Integral definida y Teorema Fundamental',gen:'ci/definida'},
    {id:'sustitucion',titulo:'Integración por sustitución',gen:'ci/sustitucion'},
    {titulo:'Integración por partes',proximo:true},
    {titulo:'Fracciones parciales',proximo:true},
    {titulo:'Sustitución trigonométrica',proximo:true},
    {id:'area-curva',titulo:'Área bajo la curva y entre curvas',gen:'ci/area'},
    {titulo:'Volúmenes de revolución',proximo:true},
    {titulo:'Integrales impropias',proximo:true}
  ]}
];
