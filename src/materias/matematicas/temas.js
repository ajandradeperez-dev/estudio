/* Temas de Matemáticas y sus nodos, en orden (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. */
export default [
  {id:'algebra-basica',titulo:'Aritmética y álgebra básica',icono:'🧮',descripcion:'Expresiones, ecuaciones, sistemas, factorización y exponentes.',nodos:[
    {id:'expresiones'},
    {id:'ecuaciones-lineales',gen:'alg/ecuacion-lineal'},
    {id:'sistemas-2x2',gen:'alg/sistema-2x2'},
    {id:'factorizacion',titulo:'Factorización',gen:'alg/factorizacion'},
    {id:'exponentes',titulo:'Leyes de exponentes',gen:'alg/exponentes'}
  ]},
  {id:'algebra-lineal',titulo:'Álgebra lineal',icono:'📐',descripcion:'Vectores, matrices, Gauss, determinantes e inversa.',nodos:[
    {id:'vectores',gen:'al/vector-magnitud'},
    {id:'operaciones-producto-punto',gen:'al/vector-operaciones'},
    {id:'producto-punto',titulo:'Producto punto',gen:'al/producto-punto'},
    {id:'angulo-vectores',titulo:'Ángulo entre vectores',gen:'al/angulo'},
    {id:'matrices',titulo:'Multiplicación de matrices',gen:'al/matriz-producto'},
    {id:'gauss',titulo:'Sistemas por Gauss',gen:'al/gauss'},
    {id:'determinantes',titulo:'Determinantes',gen:'al/determinante'},
    {id:'inversa',titulo:'Inversa de una matriz 2×2',gen:'al/inversa'},
    {titulo:'Valores y vectores propios',proximo:true}
  ]},
  {id:'calculo-diferencial',titulo:'Cálculo diferencial',icono:'📈',descripcion:'Límites, derivadas y sus reglas.',nodos:[
    {id:'limites',gen:'cd/limites'},
    {id:'derivada-polinomio',titulo:'Derivada de polinomios',gen:'cd/derivada-polinomio'},
    {id:'regla-producto',titulo:'Regla del producto',gen:'cd/producto'},
    {id:'regla-cociente',titulo:'Regla del cociente',gen:'cd/cociente'},
    {id:'regla-cadena',titulo:'Regla de la cadena',gen:'cd/cadena'},
    {titulo:'Aplicaciones: máximos y mínimos',proximo:true}
  ]},
  {id:'calculo-integral',titulo:'Cálculo integral',icono:'∫',descripcion:'Antiderivadas, integral definida, sustitución y áreas.',nodos:[
    {id:'antiderivadas',gen:'ci/antiderivada'},
    {id:'integral-definida',titulo:'Integral definida',gen:'ci/definida'},
    {id:'sustitucion',titulo:'Integración por sustitución',gen:'ci/sustitucion'},
    {id:'area-curva',titulo:'Área bajo la curva',gen:'ci/area'},
    {titulo:'Integración por partes',proximo:true}
  ]}
];
