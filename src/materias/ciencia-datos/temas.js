/* Temas de Ciencia de datos y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Referencias: Diez, Çetinkaya-Rundel y Barr, «OpenIntro Statistics» (4.ª ed., gratis; secciones); McKinney, «Python for Data
   Analysis» (3.ª ed.) y la guía de usuario de pandas; James et al., «An Introduction to Statistical Learning» (ISLR) y la
   documentación de scikit-learn. Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies.
   Cada nodo: ref (temario) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'estadistica',titulo:'Datos y estadística descriptiva',icono:'📏',descripcion:'Tipos de variables, muestreo y sesgos, tablas, centro, dispersión, percentiles, gráficas y correlación.',
   referencias:['OpenIntro Statistics — cap. 1 «Introducción a los datos» y cap. 2 «Resumir datos»'],nodos:[
    {id:'tipos-de-variables',gen:'est/variables',ref:'OpenIntro 1.2 – Datos: tipos de variables',obj:'clasificar variables como numéricas (discretas o continuas) o categóricas (nominales u ordinales).'},
    {id:'muestreo',titulo:'Muestreo y sesgos',gen:'est/muestreo',ref:'OpenIntro 1.3 – Muestreo: principios y estrategias',obj:'elegir un tipo de muestreo y reconocer los sesgos más comunes.'},
    {id:'tablas-frecuencia',titulo:'Tablas de frecuencia',gen:'est/frecuencias',ref:'OpenIntro 2.2 – Datos categóricos: tablas de contingencia',obj:'calcular frecuencias relativas, acumuladas y porcentajes condicionales.'},
    {id:'tendencia-central',gen:'est/tendencia',ref:'OpenIntro 2.1 – Media y mediana',obj:'calcular e interpretar media, mediana y moda.'},
    {id:'dispersion',titulo:'Rango, varianza y desviación estándar',gen:'est/dispersion',ref:'OpenIntro 2.1 – Varianza y desviación estándar',obj:'calcular rango, varianza y desviación estándar e interpretar la dispersión.'},
    {id:'percentiles',titulo:'Percentiles y boxplot',gen:'est/percentil',ref:'OpenIntro 2.1 – Boxplots, cuartiles y mediana',obj:'calcular cuartiles y percentiles, el rango intercuartil y leer un boxplot.'},
    {id:'histogramas',titulo:'Histogramas y forma de la distribución',gen:'est/histogramas',ref:'OpenIntro 2.1 – Histogramas y forma',obj:'construir histogramas y leer la forma y el sesgo de una distribución.'},
    {id:'correlacion',titulo:'Correlación',gen:'est/correlacion',ref:'OpenIntro 8.1 – Correlación (r)',obj:'calcular e interpretar r y r², sin confundir correlación con causa.'}
  ]},
  {id:'probabilidad',titulo:'Probabilidad',icono:'🎲',descripcion:'Reglas, conteo, condicional, independencia, Bayes, variables aleatorias y distribuciones.',
   referencias:['OpenIntro Statistics — cap. 3 «Probabilidad» y cap. 4 «Distribuciones de variables aleatorias»'],nodos:[
    {id:'probabilidad-basica',titulo:'Reglas de probabilidad',gen:'prob/basica',ref:'OpenIntro 3.1 – Definición de probabilidad',obj:'calcular probabilidades con casos favorables entre posibles y la regla del complemento.'},
    {id:'conteo',titulo:'Conteo: permutaciones y combinaciones',gen:'prob/conteo',ref:'OpenIntro 3.4 (y apéndice) – Conteo',obj:'contar casos con el principio multiplicativo, permutaciones y combinaciones.'},
    {id:'probabilidad-compuesta',titulo:'Condicional e independencia',gen:'prob/compuesta',ref:'OpenIntro 3.2 – Probabilidad condicional',obj:'calcular probabilidades de eventos combinados, condicionales e independientes.'},
    {id:'bayes',titulo:'Teorema de Bayes',gen:'prob/bayes',ref:'OpenIntro 3.2 – Teorema de Bayes',obj:'actualizar probabilidades con Bayes y entender los falsos positivos.'},
    {id:'variables-aleatorias',titulo:'Variables aleatorias, esperanza y varianza',gen:'prob/va',ref:'OpenIntro 3.4 – Variables aleatorias',obj:'calcular la esperanza y la varianza de una variable aleatoria discreta.'},
    {id:'binomial',titulo:'Distribución binomial',gen:'prob/binomial',ref:'OpenIntro 4.3 – Distribución binomial',obj:'calcular probabilidades, media y varianza de la binomial.'},
    {id:'poisson',titulo:'Distribución de Poisson',gen:'prob/poisson',ref:'OpenIntro 4.5 – Distribución de Poisson',obj:'modelar conteos por intervalo con Poisson.'},
    {id:'normal',titulo:'Distribución normal',gen:'prob/normal',ref:'OpenIntro 4.1 – Distribución normal',obj:'estandarizar con z y calcular probabilidades de la normal.'},
    {id:'limite-central',titulo:'Teorema del límite central',gen:'prob/tlc',ref:'OpenIntro 5.1 – Estimaciones puntuales y variabilidad muestral',obj:'usar el error estándar y el límite central para la media muestral.'}
  ]},
  {id:'inferencia',titulo:'Inferencia',icono:'🔍',descripcion:'Distribución muestral, intervalos de confianza, pruebas de hipótesis, chi-cuadrada y regresión.',
   referencias:['OpenIntro Statistics — caps. 5 a 9 (fundamentos de inferencia, proporciones, medias y regresión)'],nodos:[
    {id:'distribucion-muestral',titulo:'Distribución muestral',gen:'inf/muestral',ref:'OpenIntro 5.1 – Variabilidad muestral',obj:'calcular el error estándar y razonar con la distribución muestral.'},
    {id:'intervalos-confianza',titulo:'Intervalos de confianza (media y proporción)',gen:'inf/ic',ref:'OpenIntro 5.2 y 7.1 – Intervalos de confianza',obj:'construir e interpretar intervalos de confianza y elegir el tamaño de muestra.'},
    {id:'pruebas-hipotesis',titulo:'Pruebas de hipótesis (z, t y proporción)',gen:'inf/hipotesis',ref:'OpenIntro 5.3 y 7.1 – Pruebas de hipótesis',obj:'plantear hipótesis, calcular el estadístico y decidir.'},
    {id:'valor-p',titulo:'Valor p y errores tipo I y II',gen:'inf/valor-p',ref:'OpenIntro 5.3 – Decisiones y errores',obj:'interpretar el valor p y distinguir errores tipo I y II.'},
    {id:'chi-cuadrada',titulo:'Chi-cuadrada',gen:'inf/chi',ref:'OpenIntro 6.3–6.4 – Pruebas chi-cuadrada',obj:'aplicar pruebas chi-cuadrada de bondad de ajuste e independencia.'},
    {id:'regresion-simple',titulo:'Regresión lineal simple',gen:'inf/regresion',ref:'OpenIntro 8.2–8.4 – Regresión lineal',obj:'ajustar e interpretar una recta de mínimos cuadrados.'},
    {id:'regresion-multiple',titulo:'Regresión múltiple: interpretación',gen:'inf/multiple',ref:'OpenIntro 9.1 – Regresión múltiple',obj:'interpretar coeficientes, variables indicadoras y R² ajustado.'}
  ]},
  {id:'python-pandas',titulo:'Python para datos',icono:'🐍',descripcion:'Tipos, listas, diccionarios, condicionales, ciclos, funciones, pandas y visualización.',
   referencias:['McKinney, «Python for Data Analysis» — caps. 2–3 (Python básico) y 5–10 (pandas)','Guía de usuario de pandas (pandas.pydata.org)'],nodos:[
    {id:'python-tipos',titulo:'Tipos y variables',gen:'py/tipos',ref:'McKinney cap. 2 – Python básico',obj:'usar los tipos básicos de Python y sus operadores.'},
    {id:'listas-diccionarios',titulo:'Listas y diccionarios',gen:'py/listas',ref:'McKinney cap. 3 – Estructuras de datos',obj:'guardar y leer datos con listas, rebanadas y diccionarios.'},
    {id:'condicionales-ciclos',titulo:'Condicionales y ciclos',gen:'py/control',ref:'McKinney cap. 2 – Control de flujo',obj:'controlar el flujo con if, for, while y comprensiones de listas.'},
    {id:'funciones-python',titulo:'Funciones',gen:'py/funciones',ref:'McKinney cap. 3 – Funciones',obj:'escribir funciones con parámetros, return y lambda.'},
    {id:'pandas-basico',gen:'py/pandas-basico',ref:'McKinney cap. 5 · pandas – Leer y seleccionar datos',obj:'leer una tabla con pandas y seleccionar columnas y filas.'},
    {id:'pandas-salida',titulo:'¿Qué imprime este código?',gen:'py/pandas',ref:'McKinney cap. 5 · pandas – Operaciones básicas',obj:'predecir la salida de operaciones básicas de pandas.'},
    {id:'pandas-filtrar',titulo:'Filtrar y ordenar con pandas',gen:'py/filtrar',ref:'pandas – Indexing and selecting data; sort_values',obj:'filtrar filas con condiciones y ordenar un DataFrame.'},
    {id:'pandas-agrupar',titulo:'Agrupar y unir con pandas',gen:'py/agrupar',ref:'McKinney cap. 8 y 10 · pandas – merge y groupby',obj:'resumir con groupby y unir tablas con merge.'},
    {id:'pandas-limpieza',titulo:'Valores faltantes y limpieza',gen:'py/faltantes',ref:'McKinney cap. 7 · pandas – Working with missing data',obj:'detectar, eliminar o rellenar faltantes y limpiar textos y tipos.'},
    {id:'leer-grafica',titulo:'Leer una gráfica de barras',gen:'viz/barras',ref:'McKinney cap. 9 – Graficar y visualizar',obj:'leer valores, diferencias y proporciones en una gráfica de barras.'},
    {id:'que-grafica',titulo:'Qué gráfica usar',gen:'viz/que-grafica',ref:'McKinney cap. 9 – Tipos de gráficas',obj:'elegir la gráfica adecuada para cada pregunta.'}
  ]},
  {id:'machine-learning',titulo:'Machine learning básico',icono:'🤖',descripcion:'Tipos de aprendizaje, train/test, regresión, clasificación, métricas, sobreajuste y ética.',
   referencias:['James et al., «An Introduction to Statistical Learning» — caps. 2 a 5 y 8','Documentación de scikit-learn — guía de usuario (model evaluation)'],nodos:[
    {id:'tipos-aprendizaje',titulo:'Qué es y tipos de aprendizaje',gen:'ml/tipos',ref:'ISLR 2.1 – ¿Qué es el aprendizaje estadístico?',obj:'distinguir aprendizaje supervisado, no supervisado y por refuerzo.'},
    {id:'validacion',titulo:'Entrenamiento, prueba y validación cruzada',gen:'ml/validacion',ref:'ISLR 5.1 – Validación cruzada',obj:'separar datos y validar un modelo sin fuga de datos.'},
    {id:'regresion-ml',titulo:'Regresión lineal (modelo)',gen:'ml/regresion',ref:'ISLR 3 – Regresión lineal',obj:'evaluar un modelo de regresión con MAE, MSE y RMSE.'},
    {id:'regresion-logistica',titulo:'Regresión logística',gen:'ml/logistica',ref:'ISLR 4.3 – Regresión logística',obj:'calcular probabilidades con la sigmoide y decidir con un umbral.'},
    {id:'knn',titulo:'k vecinos más cercanos (k-NN)',gen:'ml/knn',ref:'ISLR 2.2 – k-NN',obj:'clasificar con k-NN, distancias y escalado.'},
    {id:'arboles',titulo:'Árboles de decisión',gen:'ml/arboles',ref:'ISLR 8.1 – Árboles de decisión',obj:'calcular Gini y entropía y evitar árboles sobreajustados.'},
    {id:'ml-metricas',titulo:'Métricas: exactitud, precisión, recall y F1',gen:'ml/metricas',ref:'scikit-learn – Model evaluation; ISLR 4.4',obj:'calcular exactitud, precisión, recall y F1 a partir de una matriz de confusión.'},
    {id:'sobreajuste',titulo:'Sobreajuste y regularización',gen:'ml/sobreajuste',ref:'ISLR 2.2 y 6.2 – Compromiso sesgo-varianza y regularización',obj:'detectar sobreajuste y subajuste y aplicar regularización.'},
    {id:'etica-ml',titulo:'Ética y sesgos en modelos',gen:'ml/etica',ref:'Concepto general – Sesgos en datos y modelos',obj:'detectar sesgos en datos y modelos y aplicar buenas prácticas.'}
  ]}
];
