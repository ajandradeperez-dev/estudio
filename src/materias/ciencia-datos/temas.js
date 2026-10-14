/* Temas de Ciencia de datos y sus nodos, en orden (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. */
export default [
  {id:'estadistica',titulo:'Estadística descriptiva',icono:'📏',descripcion:'Centro, dispersión y percentiles.',nodos:[
    {id:'tendencia-central',gen:'est/tendencia'},
    {id:'tipos-de-variables'},
    {id:'dispersion',titulo:'Rango y desviación estándar',gen:'est/dispersion'},
    {id:'percentiles',titulo:'Percentiles',gen:'est/percentil'}
  ]},
  {id:'probabilidad',titulo:'Probabilidad',icono:'🎲',descripcion:'Dados, cartas y urnas.',nodos:[
    {id:'probabilidad-basica',titulo:'Probabilidad básica',gen:'prob/basica'},
    {id:'probabilidad-compuesta',titulo:'Eventos combinados',gen:'prob/compuesta'},
    {titulo:'Distribución normal',proximo:true}
  ]},
  {id:'python-pandas',titulo:'Python y pandas',icono:'🐍',descripcion:'Cargar, explorar y predecir la salida.',nodos:[
    {id:'pandas-basico'},
    {id:'pandas-salida',titulo:'¿Qué imprime este código?',gen:'py/pandas'},
    {titulo:'Agrupar con groupby',proximo:true}
  ]},
  {id:'visualizacion',titulo:'Visualización',icono:'📊',descripcion:'Leer e interpretar gráficas.',nodos:[
    {id:'leer-grafica',titulo:'Leer una gráfica de barras',gen:'viz/barras'},
    {titulo:'Qué gráfico usar',proximo:true}
  ]},
  {id:'machine-learning',titulo:'Machine learning básico',icono:'🤖',descripcion:'Modelos, entrenamiento y evaluación.',nodos:[
    {id:'ml-metricas',titulo:'Exactitud, precisión y recall',gen:'ml/metricas'},
    {titulo:'Entrenamiento y prueba',proximo:true},
    {titulo:'Regresión lineal',proximo:true}
  ]}
];
