const R_EXP='Explorar: df.head() primeras filas (5 por defecto); df.shape tamaño (sin paréntesis); df.describe() estadísticas.';
const R_COL='Columna: df["nombre"]; métodos con paréntesis: .mean() media, .median() mediana, .max() máximo.';
const R_CARGA='Cargar: df = pd.read_csv("archivo.csv").';

export default {
  titulo:'Primeros pasos con pandas',
  resumen:'Carga un CSV y explora la tabla: head, shape, describe y columnas.',
  explicacion:[
    '<b>pandas</b> trabaja con tablas llamadas <b>DataFrame</b>. Carga un CSV con <code>df = pd.read_csv("ventas.csv")</code>.',
    'Para explorar: <code>df.head()</code> muestra las primeras filas, <code>df.shape</code> da (filas, columnas) y <code>df.describe()</code> resume las columnas numéricas.',
    'Selecciona una columna con <code>df["precio"]</code> y resúmela con <code>.mean()</code>, <code>.median()</code> o <code>.max()</code>.'
  ],
  ejemplos:[
    ['<code>import pandas as pd</code>','por convención se importa como pd'],
    ['<code>df.head(3)</code>','primeras 3 filas'],
    ['<code>df["precio"].mean()</code>','precio promedio']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Qué devuelve <code>df.shape</code>?',opciones:['El número de filas y de columnas','Las primeras 5 filas','El tipo de cada columna'],correcta:0,
     porque:{1:'Eso es df.head().',2:'Eso es df.dtypes.'},regla:R_EXP},
    {tipo:'completar',pregunta:'Escribe el código para ver las primeras filas de <code>df</code>.',respuestas:['df.head()','df.head(5)'],
     errores:{'df.head':'Es un método: lleva paréntesis, df.head().','head()':'Falta el DataFrame: df.head().'},regla:R_EXP},
    {tipo:'completar',pregunta:'Escribe el código para cargar "ventas.csv" en <code>df</code> (pandas importado como pd).',respuestas:['df = pd.read_csv("ventas.csv")',"df = pd.read_csv('ventas.csv')"],
     errores:{'pd.read_csv("ventas.csv")':'Falta guardarlo en df: df = pd.read_csv(…).','df = pd.read("ventas.csv")':'La función es read_csv.'},regla:R_CARGA},
    {tipo:'completar',pregunta:'Escribe el código para la media de la columna "precio".',respuestas:['df["precio"].mean()',"df['precio'].mean()",'df.precio.mean()'],
     errores:{'df["precio"].mean':'Falta (): .mean().','mean(df["precio"])':'En pandas es un método: df["precio"].mean().'},regla:R_COL},
    {tipo:'completar',pregunta:'Escribe el código para la mediana de la columna "edad".',respuestas:['df["edad"].median()',"df['edad'].median()",'df.edad.median()'],
     errores:{'df["edad"].mean()':'.mean() es la media; la mediana es .median().'},regla:R_COL}
  ],[
    {tipo:'opcion',pregunta:'¿Qué hace <code>df.describe()</code>?',opciones:['Resume estadísticas de las columnas numéricas','Borra las filas vacías','Ordena la tabla'],correcta:0,
     porque:{1:'Eso es df.dropna().',2:'Eso es df.sort_values().'},regla:R_EXP},
    {tipo:'completar',pregunta:'Escribe el código para ver el tamaño (filas, columnas) de <code>df</code>.',respuestas:['df.shape'],
     errores:{'df.shape()':'shape es un atributo: va sin paréntesis.','df.size':'size es el total de celdas; filas y columnas es df.shape.'},regla:R_EXP},
    {tipo:'completar',pregunta:'Escribe el código para el valor máximo de la columna "ventas".',respuestas:['df["ventas"].max()',"df['ventas'].max()",'df.ventas.max()'],
     errores:{'max(df)':'Selecciona la columna y usa .max(): df["ventas"].max().','df["ventas"].max':'Falta (): .max().'},regla:R_COL},
    {tipo:'completar',pregunta:'Escribe el código para ver las primeras 3 filas de <code>df</code>.',respuestas:['df.head(3)'],
     errores:{'df.head()':'Sin número muestra 5 filas; pon 3 dentro.','df.head[3]':'Es un método: paréntesis, no corchetes.'},regla:R_EXP},
    {tipo:'completar',pregunta:'¿Qué devuelve este código?',codigo:'df = pd.DataFrame({"x": [1, 2, 3, 4]})\ndf["x"].mean()',respuestas:['2.5'],
     errores:{'10':'Esa es la suma; la media divide entre 4.','2':'(1 + 2 + 3 + 4) / 4 = 2.5.'},regla:R_COL}
  ]]
};
