/* Temas de Ciencia de datos y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Los nodos {titulo, proximo:true} son
   lo que el PLAN pide y todavía no existe. */
export default [
  {id:'estadistica',titulo:'Estadística descriptiva',icono:'📏',descripcion:'Tipos de datos, centro, dispersión, percentiles y tablas.',nodos:[
    {id:'tipos-de-variables'},
    {id:'tendencia-central',gen:'est/tendencia'},
    {id:'dispersion',titulo:'Rango y desviación estándar',gen:'est/dispersion'},
    {id:'percentiles',titulo:'Percentiles y boxplot',gen:'est/percentil'},
    {titulo:'Tablas de frecuencia',proximo:true}
  ]},
  {id:'probabilidad',titulo:'Probabilidad',icono:'🎲',descripcion:'Conteo, probabilidad condicional, Bayes y distribuciones.',nodos:[
    {titulo:'Conteo: permutaciones y combinaciones',proximo:true},
    {id:'probabilidad-basica',titulo:'Probabilidad básica',gen:'prob/basica'},
    {id:'probabilidad-compuesta',titulo:'Eventos combinados y probabilidad condicional',gen:'prob/compuesta'},
    {titulo:'Teorema de Bayes',proximo:true},
    {titulo:'Variables aleatorias',proximo:true},
    {titulo:'Distribución binomial',proximo:true},
    {titulo:'Distribución normal',proximo:true}
  ]},
  {id:'inferencia',titulo:'Inferencia',icono:'🔍',descripcion:'Muestreo, intervalos, pruebas de hipótesis y regresión.',nodos:[
    {titulo:'Muestreo',proximo:true},
    {titulo:'Intervalos de confianza',proximo:true},
    {titulo:'Pruebas de hipótesis',proximo:true},
    {titulo:'Correlación y regresión lineal',proximo:true}
  ]},
  {id:'python-pandas',titulo:'Python para datos',icono:'🐍',descripcion:'Python básico, pandas, limpieza y qué gráfica usar.',nodos:[
    {titulo:'Tipos, listas, diccionarios y funciones',proximo:true},
    {id:'pandas-basico'},
    {id:'pandas-salida',titulo:'¿Qué imprime este código?',gen:'py/pandas'},
    {titulo:'Filtrar, agrupar y unir con pandas',proximo:true},
    {titulo:'Limpieza de datos',proximo:true},
    {id:'leer-grafica',titulo:'Leer una gráfica de barras',gen:'viz/barras'},
    {titulo:'Qué gráfica usar',proximo:true}
  ]},
  {id:'machine-learning',titulo:'Machine learning básico',icono:'🤖',descripcion:'Tipos de aprendizaje, entrenamiento, métricas y modelos simples.',nodos:[
    {titulo:'Qué es y tipos de aprendizaje',proximo:true},
    {titulo:'Entrenamiento y prueba',proximo:true},
    {titulo:'Regresión vs clasificación',proximo:true},
    {id:'ml-metricas',titulo:'Exactitud, precisión y recall',gen:'ml/metricas'},
    {titulo:'Sobreajuste',proximo:true},
    {titulo:'k-NN y árboles (intuición)',proximo:true}
  ]}
];
