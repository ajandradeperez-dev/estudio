/* Temas de la materia, en orden (cada uno es la carpeta temas/<id>/ con sus lecciones).
   proximas: títulos de lecciones que aún no existen (se ven bloqueadas como "Próximamente").
   El id del tema va en la URL: no lo cambies después de publicarlo. Lo usan la app y npm run revisar. */
export default [
  {id:'estadistica',titulo:'Estadística',icono:'📏',descripcion:'Resumir datos: tendencia central y tipos de variables.'},
  {id:'probabilidad',titulo:'Probabilidad',icono:'🎲',descripcion:'Eventos, reglas de probabilidad y distribuciones.',
   proximas:['Probabilidad básica','Probabilidad condicional','Distribución normal']},
  {id:'python-pandas',titulo:'Python y pandas',icono:'🐍',descripcion:'Cargar, explorar y filtrar datos con pandas.',
   proximas:['Filtrar y ordenar','Agrupar con groupby']},
  {id:'visualizacion',titulo:'Visualización',icono:'📊',descripcion:'Elegir y leer gráficos: barras, histogramas y dispersión.',
   proximas:['Qué gráfico usar','Histogramas y dispersión']},
  {id:'machine-learning',titulo:'Machine learning básico',icono:'🤖',descripcion:'Entrenar, evaluar y no engañarte con los datos.',
   proximas:['Qué es un modelo','Entrenamiento y prueba','Regresión lineal']}
];
