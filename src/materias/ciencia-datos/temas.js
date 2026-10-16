/* Temas de Ciencia de datos y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Referencias: Diez, Çetinkaya-Rundel y Barr, «OpenIntro Statistics» (4.ª ed., gratis; secciones); McKinney, «Python for Data
   Analysis» (3.ª ed.) y la guía de usuario de pandas; James et al., «An Introduction to Statistical Learning» (ISLR) y la
   documentación de scikit-learn. Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies.
   Cada nodo: ref (temario) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'estadistica',titulo:'Datos y estadística descriptiva',icono:'📏',descripcion:'Tipos de variables, muestreo y sesgos, tablas, centro, dispersión, percentiles, gráficas y correlación.',
   referencias:['OpenIntro Statistics — cap. 1 «Introducción a los datos» y cap. 2 «Resumir datos»'],nodos:[
    {id:'tipos-de-variables',ref:'OpenIntro 1.2 – Datos: tipos de variables',obj:'clasificar variables como numéricas (discretas o continuas) o categóricas (nominales u ordinales).'},
    {titulo:'Muestreo y sesgos',proximo:true,ref:'OpenIntro 1.3 – Muestreo: principios y estrategias'},
    {titulo:'Tablas de frecuencia',proximo:true,ref:'OpenIntro 2.2 – Datos categóricos: tablas de contingencia'},
    {id:'tendencia-central',gen:'est/tendencia',ref:'OpenIntro 2.1 – Media y mediana',obj:'calcular e interpretar media, mediana y moda.'},
    {id:'dispersion',titulo:'Rango, varianza y desviación estándar',gen:'est/dispersion',ref:'OpenIntro 2.1 – Varianza y desviación estándar',obj:'calcular rango, varianza y desviación estándar e interpretar la dispersión.'},
    {id:'percentiles',titulo:'Percentiles y boxplot',gen:'est/percentil',ref:'OpenIntro 2.1 – Boxplots, cuartiles y mediana',obj:'calcular cuartiles y percentiles, el rango intercuartil y leer un boxplot.'},
    {titulo:'Histogramas y forma de la distribución',proximo:true,ref:'OpenIntro 2.1 – Histogramas y forma'},
    {titulo:'Correlación',proximo:true,ref:'OpenIntro 8.1 – Correlación (r)'}
  ]},
  {id:'probabilidad',titulo:'Probabilidad',icono:'🎲',descripcion:'Reglas, conteo, condicional, independencia, Bayes, variables aleatorias y distribuciones.',
   referencias:['OpenIntro Statistics — cap. 3 «Probabilidad» y cap. 4 «Distribuciones de variables aleatorias»'],nodos:[
    {id:'probabilidad-basica',titulo:'Reglas de probabilidad',gen:'prob/basica',ref:'OpenIntro 3.1 – Definición de probabilidad',obj:'calcular probabilidades con casos favorables entre posibles y la regla del complemento.'},
    {titulo:'Conteo: permutaciones y combinaciones',proximo:true,ref:'OpenIntro 3.4 (y apéndice) – Conteo'},
    {id:'probabilidad-compuesta',titulo:'Condicional e independencia',gen:'prob/compuesta',ref:'OpenIntro 3.2 – Probabilidad condicional',obj:'calcular probabilidades de eventos combinados, condicionales e independientes.'},
    {titulo:'Teorema de Bayes',proximo:true,ref:'OpenIntro 3.2 – Teorema de Bayes'},
    {titulo:'Variables aleatorias, esperanza y varianza',proximo:true,ref:'OpenIntro 3.4 – Variables aleatorias'},
    {titulo:'Distribución binomial',proximo:true,ref:'OpenIntro 4.3 – Distribución binomial'},
    {titulo:'Distribución de Poisson',proximo:true,ref:'OpenIntro 4.5 – Distribución de Poisson'},
    {titulo:'Distribución normal',proximo:true,ref:'OpenIntro 4.1 – Distribución normal'},
    {titulo:'Teorema del límite central',proximo:true,ref:'OpenIntro 5.1 – Estimaciones puntuales y variabilidad muestral'}
  ]},
  {id:'inferencia',titulo:'Inferencia',icono:'🔍',descripcion:'Distribución muestral, intervalos de confianza, pruebas de hipótesis, chi-cuadrada y regresión.',
   referencias:['OpenIntro Statistics — caps. 5 a 9 (fundamentos de inferencia, proporciones, medias y regresión)'],nodos:[
    {titulo:'Distribución muestral',proximo:true,ref:'OpenIntro 5.1 – Variabilidad muestral'},
    {titulo:'Intervalos de confianza (media y proporción)',proximo:true,ref:'OpenIntro 5.2 y 7.1 – Intervalos de confianza'},
    {titulo:'Pruebas de hipótesis (z, t y proporción)',proximo:true,ref:'OpenIntro 5.3 y 7.1 – Pruebas de hipótesis'},
    {titulo:'Valor p y errores tipo I y II',proximo:true,ref:'OpenIntro 5.3 – Decisiones y errores'},
    {titulo:'Chi-cuadrada',proximo:true,ref:'OpenIntro 6.3–6.4 – Pruebas chi-cuadrada'},
    {titulo:'Regresión lineal simple',proximo:true,ref:'OpenIntro 8.2–8.4 – Regresión lineal'},
    {titulo:'Regresión múltiple: interpretación',proximo:true,ref:'OpenIntro 9.1 – Regresión múltiple'}
  ]},
  {id:'python-pandas',titulo:'Python para datos',icono:'🐍',descripcion:'Tipos, listas, diccionarios, condicionales, ciclos, funciones, pandas y visualización.',
   referencias:['McKinney, «Python for Data Analysis» — caps. 2–3 (Python básico) y 5–10 (pandas)','Guía de usuario de pandas (pandas.pydata.org)'],nodos:[
    {titulo:'Tipos y variables',proximo:true,ref:'McKinney cap. 2 – Python básico'},
    {titulo:'Listas y diccionarios',proximo:true,ref:'McKinney cap. 3 – Estructuras de datos'},
    {titulo:'Condicionales y ciclos',proximo:true,ref:'McKinney cap. 2 – Control de flujo'},
    {titulo:'Funciones',proximo:true,ref:'McKinney cap. 3 – Funciones'},
    {id:'pandas-basico',ref:'McKinney cap. 5 · pandas – Leer y seleccionar datos',obj:'leer una tabla con pandas y seleccionar columnas y filas.'},
    {id:'pandas-salida',titulo:'¿Qué imprime este código?',gen:'py/pandas',ref:'McKinney cap. 5 · pandas – Operaciones básicas',obj:'predecir la salida de operaciones básicas de pandas.'},
    {titulo:'Filtrar y ordenar con pandas',proximo:true,ref:'pandas – Indexing and selecting data; sort_values'},
    {titulo:'Agrupar y unir con pandas',proximo:true,ref:'McKinney cap. 8 y 10 · pandas – merge y groupby'},
    {titulo:'Valores faltantes y limpieza',proximo:true,ref:'McKinney cap. 7 · pandas – Working with missing data'},
    {id:'leer-grafica',titulo:'Leer una gráfica de barras',gen:'viz/barras',ref:'McKinney cap. 9 – Graficar y visualizar',obj:'leer valores, diferencias y proporciones en una gráfica de barras.'},
    {titulo:'Qué gráfica usar',proximo:true,ref:'McKinney cap. 9 – Tipos de gráficas'}
  ]},
  {id:'machine-learning',titulo:'Machine learning básico',icono:'🤖',descripcion:'Tipos de aprendizaje, train/test, regresión, clasificación, métricas, sobreajuste y ética.',
   referencias:['James et al., «An Introduction to Statistical Learning» — caps. 2 a 5 y 8','Documentación de scikit-learn — guía de usuario (model evaluation)'],nodos:[
    {titulo:'Qué es y tipos de aprendizaje',proximo:true,ref:'ISLR 2.1 – ¿Qué es el aprendizaje estadístico?'},
    {titulo:'Entrenamiento, prueba y validación cruzada',proximo:true,ref:'ISLR 5.1 – Validación cruzada'},
    {titulo:'Regresión lineal (modelo)',proximo:true,ref:'ISLR 3 – Regresión lineal'},
    {titulo:'Regresión logística',proximo:true,ref:'ISLR 4.3 – Regresión logística'},
    {titulo:'k vecinos más cercanos (k-NN)',proximo:true,ref:'ISLR 2.2 – k-NN'},
    {titulo:'Árboles de decisión',proximo:true,ref:'ISLR 8.1 – Árboles de decisión'},
    {id:'ml-metricas',titulo:'Métricas: exactitud, precisión, recall y F1',gen:'ml/metricas',ref:'scikit-learn – Model evaluation; ISLR 4.4',obj:'calcular exactitud, precisión, recall y F1 a partir de una matriz de confusión.'},
    {titulo:'Sobreajuste y regularización',proximo:true,ref:'ISLR 2.2 y 6.2 – Compromiso sesgo-varianza y regularización'},
    {titulo:'Ética y sesgos en modelos',proximo:true,ref:'Concepto general – Sesgos en datos y modelos'}
  ]}
];
