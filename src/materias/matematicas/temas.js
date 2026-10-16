/* Temas de Matemáticas y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Temario universitario estándar. Referencias: Stewart, Precálculo (7.ª ed.) y Cálculo de una variable (8.ª ed., secciones);
   Lay, Álgebra lineal y sus aplicaciones (5.ª ed., secciones); Grossman, Álgebra lineal (vectores en R³, rectas y planos).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies (una habilidad se puede mover de tema).
   Cada nodo: ref (dónde está en el temario de referencia) y obj (objetivo: «Al terminar puedes…»). Los nodos
   {titulo, proximo:true} son lo que el temario pide y todavía no existe. referencias: «📚 Para profundizar» del tema. */
export default [
  {id:'prealgebra',titulo:'Aritmética y prealgebra',icono:'🔢',descripcion:'Fracciones, decimales, porcentajes, razones, potencias, raíces y notación científica.',
   referencias:['Stewart, Precálculo — cap. 1 «Fundamentos» (números reales, exponentes y radicales)','Khan Academy — Aritmética y prealgebra (gratis, en español)'],nodos:[
    {id:'fracciones',titulo:'Fracciones',gen:'pre/fracciones',ref:'Stewart Precálculo 1.1 – Números reales y fracciones',obj:'operar fracciones (sumar, restar, multiplicar, dividir y simplificar) sin calculadora.'},
    {id:'decimales',titulo:'Decimales y redondeo',gen:'pre/decimales',ref:'Stewart Precálculo 1.1 – Números reales',obj:'redondear, convertir y operar decimales, incluidos los periódicos.'},
    {id:'porcentajes',titulo:'Porcentajes',gen:'pre/porcentajes',ref:'Stewart Precálculo 1.1 – Aplicaciones con porcentajes',obj:'calcular porcentajes, aumentos, descuentos y el porcentaje de cambio.'},
    {id:'razones-proporciones',titulo:'Razones y proporciones',gen:'pre/razones',ref:'Stewart Precálculo 1.1 – Razones y proporciones',obj:'resolver proporciones directas e inversas y repartos proporcionales.'},
    {id:'potencias-raices',titulo:'Potencias y raíces',gen:'pre/potencias',ref:'Stewart Precálculo 1.2 – Exponentes y radicales',obj:'calcular potencias y raíces y simplificar radicales.'},
    {id:'orden-operaciones',titulo:'Orden de operaciones',gen:'pre/operaciones',ref:'Stewart Precálculo 1.1 – Propiedades de los números reales',obj:'evaluar expresiones respetando paréntesis, potencias, productos y sumas.'},
    {id:'notacion-cientifica',titulo:'Notación científica',gen:'pre/cientifica',ref:'Stewart Precálculo 1.2 – Notación científica',obj:'escribir y operar números muy grandes o muy pequeños en notación científica.'}
  ]},
  {id:'algebra-basica',titulo:'Álgebra',icono:'🧮',descripcion:'Polinomios, factorización, fracciones algebraicas, ecuaciones, desigualdades y sistemas.',
   referencias:['Stewart, Precálculo — cap. 1 «Fundamentos» (1.3 a 1.8: expresiones, ecuaciones y desigualdades)','Stewart, Precálculo — cap. 10 «Sistemas de ecuaciones»'],nodos:[
    {id:'expresiones',gen:'alg/expresiones',ref:'Stewart Precálculo 1.3 – Expresiones algebraicas y polinomios',obj:'simplificar expresiones y operar polinomios.'},
    {id:'productos-notables',titulo:'Productos notables',gen:'alg/productos-notables',ref:'Stewart Precálculo 1.3 – Fórmulas de productos especiales',obj:'desarrollar binomios al cuadrado, al cubo y conjugados sin multiplicar término a término.'},
    {id:'factorizacion',titulo:'Factorización',gen:'alg/factorizacion',ref:'Stewart Precálculo 1.3 – Factorización',obj:'factorizar completamente: factor común, diferencia de cuadrados, trinomios y por agrupación.'},
    {id:'fracciones-algebraicas',titulo:'Fracciones algebraicas',gen:'alg/fracciones-algebraicas',ref:'Stewart Precálculo 1.4 – Expresiones racionales',obj:'simplificar, sumar, multiplicar y dividir expresiones racionales.'},
    {id:'ecuaciones-lineales',gen:'alg/ecuacion-lineal',ref:'Stewart Precálculo 1.5 – Ecuaciones lineales',obj:'resolver ecuaciones lineales, también con fracciones y paréntesis.'},
    {id:'ecuaciones-cuadraticas',titulo:'Ecuaciones cuadráticas',gen:'alg/cuadratica',ref:'Stewart Precálculo 1.5 – Ecuaciones cuadráticas y discriminante',obj:'resolver cuadráticas por factorización y fórmula general, e interpretar el discriminante.'},
    {id:'radicales-valor-absoluto',titulo:'Ecuaciones con radicales y valor absoluto',gen:'alg/radicales-absoluto',ref:'Stewart Precálculo 1.5 – Otros tipos de ecuaciones',obj:'resolver ecuaciones con raíces (comprobando soluciones) y con valor absoluto.'},
    {id:'desigualdades',titulo:'Desigualdades lineales',gen:'alg/desigualdad',ref:'Stewart Precálculo 1.8 – Desigualdades lineales',obj:'resolver desigualdades lineales y escribir la solución como intervalo.'},
    {id:'desigualdades-no-lineales',titulo:'Desigualdades cuadráticas y con valor absoluto',gen:'alg/desigualdad-no-lineal',ref:'Stewart Precálculo 1.8 – Desigualdades no lineales y con valor absoluto',obj:'resolver desigualdades cuadráticas y con valor absoluto y escribir el intervalo.'},
    {id:'sistemas-2x2',gen:'alg/sistema-2x2',ref:'Stewart Precálculo 10.1 – Sistemas de dos ecuaciones',obj:'resolver sistemas 2×2 por sustitución, igualación o eliminación.'},
    {id:'sistemas-3x3',titulo:'Sistemas 3×3',gen:'alg/sistema-3x3',ref:'Stewart Precálculo 10.2 – Sistemas de ecuaciones con varias variables',obj:'resolver sistemas de tres ecuaciones con tres incógnitas por eliminación.'},
    {id:'exponentes',titulo:'Leyes de exponentes',gen:'alg/exponentes',ref:'Stewart Precálculo 1.2 – Leyes de los exponentes',obj:'simplificar expresiones con exponentes enteros, negativos y fraccionarios.'}
  ]},
  {id:'precalculo',titulo:'Funciones (precálculo)',icono:'📉',descripcion:'Dominio y rango, gráficas y transformaciones, composición e inversa, polinomiales, racionales, exponenciales y logarítmicas.',
   referencias:['Stewart, Precálculo — cap. 2 «Funciones»','Stewart, Precálculo — cap. 3 «Funciones polinomiales y racionales» y cap. 4 «Funciones exponenciales y logarítmicas»'],nodos:[
    {id:'funciones',titulo:'Funciones: evaluar, dominio y rango',gen:'alg/funciones',ref:'Stewart Precálculo 2.1–2.2 – Funciones, dominio y gráficas',obj:'evaluar funciones y encontrar su dominio y rango.'},
    {id:'transformaciones',titulo:'Gráficas y transformaciones',gen:'fun/transformaciones',ref:'Stewart Precálculo 2.6 – Transformaciones de funciones',obj:'mover, estirar y reflejar gráficas y leer el vértice de a(x − h)² + k.'},
    {id:'composicion-inversa',titulo:'Composición e inversa',gen:'fun/composicion-inversa',ref:'Stewart Precálculo 2.7–2.8 – Combinación de funciones e inversas',obj:'componer funciones y encontrar y usar la función inversa.'},
    {id:'funciones-polinomiales',titulo:'Funciones polinomiales',gen:'fun/polinomiales',ref:'Stewart Precálculo 3.1–3.4 – Funciones polinomiales y ceros',obj:'evaluar polinomios y usar los teoremas del residuo y del factor.'},
    {id:'funciones-racionales',titulo:'Funciones racionales y asíntotas',gen:'fun/racionales',ref:'Stewart Precálculo 3.6 – Funciones racionales',obj:'encontrar asíntotas verticales y horizontales y huecos de funciones racionales.'},
    {id:'funciones-exponenciales',titulo:'Funciones exponenciales',gen:'fun/exponenciales',ref:'Stewart Precálculo 4.1–4.2 – Funciones exponenciales',obj:'evaluar y resolver ecuaciones exponenciales y modelar crecimiento y decaimiento.'},
    {id:'logaritmos',titulo:'Logaritmos: propiedades y ecuaciones',gen:'alg/logaritmos',ref:'Stewart Precálculo 4.3–4.5 – Funciones logarítmicas, leyes y ecuaciones',obj:'usar las leyes de los logaritmos y resolver ecuaciones exponenciales y logarítmicas.'},
    {id:'modelado-funciones',titulo:'Modelado con funciones',gen:'fun/modelado',ref:'Stewart Precálculo 4.6 – Modelado con funciones exponenciales y logarítmicas',obj:'elegir y ajustar modelos lineales y exponenciales para predecir.'}
  ]},
  {id:'trigonometria',titulo:'Trigonometría',icono:'📐',descripcion:'Ángulos y radianes, razones, círculo unitario, gráficas, identidades, ecuaciones y leyes de senos y cosenos.',
   referencias:['Stewart, Precálculo — caps. 5 y 6 «Funciones trigonométricas»','Stewart, Precálculo — cap. 7 «Trigonometría analítica»'],nodos:[
    {id:'radianes',titulo:'Ángulos y radianes',gen:'tri/radianes',ref:'Stewart Precálculo 6.1 – Medida de ángulos',obj:'convertir entre grados y radianes y calcular arcos y sectores'},
    {id:'razones-trigonometricas',titulo:'Razones trigonométricas',gen:'tri/razones',ref:'Stewart Precálculo 6.2 – Trigonometría de triángulos rectángulos',obj:'calcular lados y ángulos de triángulos rectángulos con seno, coseno y tangente.'},
    {id:'circulo-unitario',titulo:'Círculo unitario',gen:'tri/circulo',ref:'Stewart Precálculo 5.1–5.2 – Circunferencia unitaria y funciones trigonométricas',obj:'dar el valor exacto de seno, coseno y tangente de los ángulos notables en los cuatro cuadrantes.'},
    {id:'graficas-trigonometricas',titulo:'Gráficas de funciones trigonométricas',gen:'tri/graficas',ref:'Stewart Precálculo 5.3–5.4 – Gráficas trigonométricas',obj:'leer amplitud, periodo, desfase y línea media de una onda'},
    {id:'identidades-trigonometricas',titulo:'Identidades fundamentales',gen:'tri/identidades',ref:'Stewart Precálculo 7.1 – Identidades trigonométricas',obj:'usar las identidades pitagóricas, recíprocas y de cociente para simplificar y calcular.'},
    {id:'suma-angulo-doble',titulo:'Suma de ángulos y ángulo doble',gen:'tri/suma-doble',ref:'Stewart Precálculo 7.2–7.3 – Fórmulas de adición y de ángulo doble',obj:'calcular valores exactos con las fórmulas de suma y de ángulo doble'},
    {id:'ecuaciones-trigonometricas',titulo:'Ecuaciones trigonométricas',gen:'tri/ecuaciones',ref:'Stewart Precálculo 7.4–7.5 – Ecuaciones trigonométricas',obj:'resolver ecuaciones trigonométricas básicas en un intervalo.'},
    {id:'leyes-senos-cosenos',titulo:'Ley de senos y ley de cosenos',gen:'tri/leyes',ref:'Stewart Precálculo 6.5–6.6 – Leyes de senos y cosenos',obj:'resolver cualquier triángulo con la ley de senos o de cosenos'}
  ]},
  {id:'algebra-lineal',titulo:'Álgebra lineal',icono:'🧭',descripcion:'Sistemas, matrices, determinantes, vectores, espacios vectoriales, transformaciones y valores propios.',
   referencias:['Lay, Álgebra lineal y sus aplicaciones — caps. 1 a 6','Grossman, Álgebra lineal — vectores en R² y R³, producto cruz, rectas y planos'],nodos:[
    {id:'gauss',titulo:'Sistemas por eliminación de Gauss',gen:'al/gauss',ref:'Lay 1.1 – Sistemas de ecuaciones lineales',obj:'resolver sistemas lineales por eliminación gaussiana.'},
    {id:'gauss-jordan',titulo:'Gauss-Jordan, forma escalonada y rango',gen:'al/gauss-jordan',ref:'Lay 1.2 – Reducción por filas y formas escalonadas',obj:'llevar una matriz a forma escalonada reducida y leer el tipo de solución y el rango.'},
    {id:'matrices',titulo:'Matrices y sus operaciones',gen:'al/matriz-producto',ref:'Lay 2.1 – Operaciones con matrices',obj:'sumar, multiplicar y transponer matrices, y saber cuándo el producto existe.'},
    {id:'inversa',titulo:'Inversa de una matriz',gen:'al/inversa',ref:'Lay 2.2 – La inversa de una matriz',obj:'calcular la inversa de una matriz y usarla para resolver sistemas.'},
    {id:'determinantes',titulo:'Determinantes y sus propiedades',gen:'al/determinante',ref:'Lay 3.1–3.2 – Determinantes y sus propiedades',obj:'calcular determinantes por cofactores y usar sus propiedades.'},
    {id:'vectores',gen:'al/vector-magnitud',ref:'Grossman – Vectores en R² y R³; Lay 1.3 – Ecuaciones vectoriales',obj:'calcular la magnitud y el vector unitario de un vector.'},
    {id:'operaciones-producto-punto',gen:'al/vector-operaciones',ref:'Lay 1.3 – Combinaciones de vectores',obj:'sumar vectores y multiplicarlos por un escalar, en R² y R³.'},
    {id:'producto-punto',titulo:'Producto punto',gen:'al/producto-punto',ref:'Lay 6.1 – Producto interno, longitud y ortogonalidad',obj:'calcular el producto punto e identificar vectores ortogonales.'},
    {id:'angulo-vectores',titulo:'Ángulo entre vectores',gen:'al/angulo',ref:'Grossman – Ángulo entre vectores; Lay 6.1',obj:'calcular el ángulo entre dos vectores con el producto punto.'},
    {id:'producto-cruz',titulo:'Producto cruz',gen:'al/producto-cruz',ref:'Grossman – Producto cruz de dos vectores',obj:'calcular el producto cruz y usarlo para áreas y vectores perpendiculares.'},
    {id:'rectas-planos',titulo:'Rectas y planos en R³',gen:'al/rectas-planos',ref:'Grossman – Rectas y planos en el espacio',obj:'escribir rectas y planos en el espacio y medir la distancia de un punto a un plano'},
    {id:'espacios-vectoriales',titulo:'Espacios vectoriales y combinación lineal',gen:'al/combinacion-lineal',ref:'Lay 1.3 y 4.1 – Combinaciones lineales; espacios y subespacios vectoriales',obj:'decidir si un vector es combinación lineal de otros y encontrar los coeficientes.'},
    {id:'independencia-lineal',titulo:'Independencia lineal',gen:'al/independencia',ref:'Lay 1.7 – Independencia lineal',obj:'decidir si un conjunto de vectores es linealmente independiente.'},
    {id:'base-dimension',titulo:'Base y dimensión',gen:'al/base-dimension',ref:'Lay 4.3 y 4.5 – Bases y dimensión',obj:'reconocer una base y calcular la dimensión de un espacio'},
    {id:'rango',titulo:'Rango y teorema de la dimensión',gen:'al/rango',ref:'Lay 4.6 – Rango',obj:'calcular el rango y usar rango + nulidad = columnas'},
    {id:'transformaciones-lineales',titulo:'Transformaciones lineales y su matriz',gen:'al/transformaciones',ref:'Lay 1.8–1.9 – Transformaciones lineales y su matriz',obj:'aplicar una transformación lineal y encontrar su matriz estándar.'},
    {id:'nucleo-imagen',titulo:'Núcleo e imagen',gen:'al/nucleo-imagen',ref:'Lay 4.2 – Espacios nulos y columna',obj:'decidir si un vector está en el núcleo y calcular las dimensiones del núcleo y la imagen'},
    {id:'valores-propios',titulo:'Valores y vectores propios',gen:'al/valores-propios',ref:'Lay 5.1–5.2 – Vectores propios y ecuación característica',obj:'calcular valores y vectores propios con la ecuación característica.'},
    {id:'diagonalizacion',titulo:'Diagonalización',gen:'al/diagonalizacion',ref:'Lay 5.3 – Diagonalización',obj:'usar A = PDP⁻¹ para calcular potencias, trazas y determinantes'},
    {id:'gram-schmidt',titulo:'Ortogonalidad y Gram-Schmidt',gen:'al/gram-schmidt',ref:'Lay 6.2 y 6.4 – Conjuntos ortogonales y proceso de Gram-Schmidt',obj:'proyectar vectores y ortogonalizar una base con Gram-Schmidt'}
  ]},
  {id:'calculo-diferencial',titulo:'Cálculo diferencial',icono:'📈',descripcion:'Límites, continuidad, derivadas, sus reglas y sus aplicaciones.',
   referencias:['Stewart, Cálculo de una variable — cap. 2 «Límites y derivadas»','Stewart, Cálculo de una variable — caps. 3 y 4 «Reglas de derivación» y «Aplicaciones de la derivada»'],nodos:[
    {id:'limites',gen:'cd/limites',ref:'Stewart 2.2–2.3 – Límites y leyes de los límites',obj:'calcular límites por sustitución, factorización y racionalización.'},
    {id:'limites-infinito',titulo:'Límites al infinito y trigonométricos especiales',gen:'cd/limites-infinito',ref:'Stewart 2.6 y 3.3 – Límites al infinito; límite de sen x / x',obj:'calcular límites al infinito de cocientes y los límites especiales con sen x / x'},
    {id:'continuidad',titulo:'Continuidad',gen:'cd/continuidad',ref:'Stewart 2.5 – Continuidad',obj:'decidir si una función es continua en un punto y clasificar discontinuidades.'},
    {id:'definicion-derivada',titulo:'Definición de derivada',gen:'cd/definicion',ref:'Stewart 2.7–2.8 – Derivadas y razones de cambio',obj:'calcular derivadas con la definición por límite e interpretarlas como pendiente.'},
    {id:'derivada-polinomio',titulo:'Regla de la potencia',gen:'cd/derivada-polinomio',ref:'Stewart 3.1 – Derivadas de polinomios y exponenciales',obj:'derivar polinomios y potencias con la regla de la potencia.'},
    {id:'regla-producto',titulo:'Regla del producto',gen:'cd/producto',ref:'Stewart 3.2 – Reglas del producto y el cociente',obj:'derivar productos de funciones.'},
    {id:'regla-cociente',titulo:'Regla del cociente',gen:'cd/cociente',ref:'Stewart 3.2 – Reglas del producto y el cociente',obj:'derivar cocientes de funciones.'},
    {id:'regla-cadena',titulo:'Regla de la cadena',gen:'cd/cadena',ref:'Stewart 3.4 – Regla de la cadena',obj:'derivar funciones compuestas con la regla de la cadena.'},
    {id:'derivadas-trascendentes',titulo:'Derivadas trigonométricas, exponenciales y logarítmicas',gen:'cd/trascendentes',ref:'Stewart 3.3 y 3.6 – Derivadas trigonométricas y logarítmicas',obj:'derivar funciones trigonométricas, exponenciales y logarítmicas.'},
    {id:'derivacion-implicita',titulo:'Derivación implícita',gen:'cd/implicita',ref:'Stewart 3.5 – Derivación implícita',obj:'derivar implícitamente y encontrar la pendiente de una curva definida por una ecuación.'},
    {id:'derivadas-inversas',titulo:'Derivadas de funciones inversas y derivación logarítmica',gen:'cd/inversas-log',ref:'Stewart 3.5–3.6 – Inversas trigonométricas y derivación logarítmica',obj:'derivar arctan, arcsen, inversas en general y funciones como x^x'},
    {id:'razon-cambio',titulo:'Razones relacionadas',gen:'cd/razon-cambio',ref:'Stewart 3.9 – Razones relacionadas',obj:'resolver problemas de razones relacionadas derivando respecto al tiempo.'},
    {id:'linealizacion',titulo:'Linealización y diferenciales',gen:'cd/linealizacion',ref:'Stewart 3.10 – Aproximaciones lineales y diferenciales',obj:'aproximar valores con la recta tangente y estimar errores con diferenciales'},
    {id:'maximos-minimos',titulo:'Valores extremos',gen:'cd/maximos',ref:'Stewart 4.1 – Valores máximos y mínimos',obj:'encontrar puntos críticos y valores extremos absolutos y locales.'},
    {id:'valor-medio',titulo:'Teorema del Valor Medio',gen:'cd/valor-medio',ref:'Stewart 4.2 – Teorema del valor medio',obj:'encontrar el punto c del Teorema del Valor Medio e interpretarlo'},
    {id:'trazado-curvas',titulo:'Crecimiento, concavidad y trazado de curvas',gen:'cd/trazado-curvas',ref:'Stewart 4.3 y 4.5 – Derivadas y forma de una gráfica; trazado de curvas',obj:'hallar máximos, mínimos e inflexiones con f′ y f″'},
    {id:'optimizacion',titulo:'Optimización',gen:'cd/optimizacion',ref:'Stewart 4.7 – Problemas de optimización',obj:'plantear y resolver problemas de optimización con contexto.'},
    {id:'lhopital',titulo:'Regla de L’Hôpital',gen:'cd/lhopital',ref:'Stewart 4.4 – Formas indeterminadas y regla de L’Hôpital',obj:'calcular límites indeterminados con la regla de L’Hôpital.'}
  ]},
  {id:'calculo-integral',titulo:'Cálculo integral',icono:'∫',descripcion:'Antiderivadas, integral definida, técnicas de integración y aplicaciones.',
   referencias:['Stewart, Cálculo de una variable — cap. 5 «Integrales» y cap. 7 «Técnicas de integración»','Stewart, Cálculo de una variable — caps. 6 y 8 «Aplicaciones de la integral»'],nodos:[
    {id:'antiderivadas',gen:'ci/antiderivada',ref:'Stewart 4.9 y 5.4 – Antiderivadas e integrales indefinidas',obj:'encontrar antiderivadas de polinomios y funciones básicas.'},
    {id:'sumas-riemann',titulo:'Sumas de Riemann',gen:'ci/riemann',ref:'Stewart 5.1 – Áreas y distancias',obj:'aproximar áreas y acumulados con sumas izquierda, derecha y de punto medio'},
    {id:'integral-definida',titulo:'Integral definida y Teorema Fundamental',gen:'ci/definida',ref:'Stewart 5.2–5.3 – Integral definida y Teorema Fundamental del Cálculo',obj:'evaluar integrales definidas con el Teorema Fundamental del Cálculo.'},
    {id:'sustitucion',titulo:'Integración por sustitución',gen:'ci/sustitucion',ref:'Stewart 5.5 – Regla de sustitución',obj:'integrar por sustitución (cambio de variable), también en integrales definidas.'},
    {id:'integracion-partes',titulo:'Integración por partes',gen:'ci/partes',ref:'Stewart 7.1 – Integración por partes',obj:'integrar productos con la fórmula de integración por partes.'},
    {id:'integrales-trigonometricas',titulo:'Integrales trigonométricas',gen:'ci/trigonometricas',ref:'Stewart 7.2 – Integrales trigonométricas',obj:'integrar potencias de seno y coseno con identidades y sustitución'},
    {id:'sustitucion-trigonometrica',titulo:'Sustitución trigonométrica',gen:'ci/sustitucion-trig',ref:'Stewart 7.3 – Sustitución trigonométrica',obj:'integrar expresiones con raíces de a² ± x² por sustitución trigonométrica.'},
    {id:'fracciones-parciales',titulo:'Fracciones parciales',gen:'ci/fracciones-parciales',ref:'Stewart 7.4 – Fracciones parciales',obj:'descomponer funciones racionales en fracciones parciales e integrarlas.'},
    {id:'integrales-impropias',titulo:'Integrales impropias',gen:'ci/impropias',ref:'Stewart 7.8 – Integrales impropias',obj:'decidir si una integral impropia converge y calcular su valor.'},
    {id:'area-curva',titulo:'Área bajo la curva y entre curvas',gen:'ci/area',ref:'Stewart 6.1 – Áreas entre curvas',obj:'calcular el área bajo una curva y entre dos curvas.'},
    {id:'volumenes-revolucion',titulo:'Volúmenes: discos y arandelas',gen:'ci/volumenes',ref:'Stewart 6.2 – Volúmenes',obj:'calcular volúmenes de sólidos de revolución por discos y arandelas.'},
    {id:'cascarones',titulo:'Volúmenes por cascarones',gen:'ci/cascarones',ref:'Stewart 6.3 – Volúmenes mediante cascarones cilíndricos',obj:'calcular volúmenes de revolución con cascarones cilíndricos'},
    {id:'longitud-arco',titulo:'Longitud de arco',gen:'ci/longitud-arco',ref:'Stewart 8.1 – Longitud de arco',obj:'calcular la longitud de una curva con la integral de arco'},
    {id:'valor-promedio',titulo:'Valor promedio de una función',gen:'ci/valor-promedio',ref:'Stewart 6.5 – Valor promedio de una función',obj:'calcular e interpretar el valor promedio de una función'},
    {id:'aplicaciones-integral',titulo:'Aplicaciones: trabajo, física y economía',gen:'ci/aplicaciones',ref:'Stewart 6.4 y 8.4 – Trabajo; aplicaciones a la economía',obj:'resolver problemas de trabajo, resortes, bombeo e ingreso con integrales'}
  ]}
];
