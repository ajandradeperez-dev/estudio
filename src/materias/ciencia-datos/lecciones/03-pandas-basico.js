export default {
  titulo:'Primeros pasos con pandas',
  resumen:'Carga un CSV y explora la tabla: head, shape, describe y columnas.',
  explicacion:[
    '<b>pandas</b> es la librería de Python más usada para trabajar con tablas. Una tabla es un <b>DataFrame</b>: filas y columnas con nombre.',
    'Para cargar un CSV: <code>pd.read_csv("ventas.csv")</code>. Para darle un vistazo: <code>df.head()</code> (primeras filas), <code>df.shape</code> (filas y columnas) y <code>df.describe()</code> (estadísticas de las columnas numéricas).',
    'Una columna se selecciona con corchetes, <code>df["precio"]</code>, y tiene métodos como <code>.mean()</code>, <code>.median()</code> o <code>.max()</code>.'
  ],
  ejemplos:[
    ['<code>import pandas as pd</code>','Por convención se importa como pd'],
    ['<code>df = pd.read_csv("ventas.csv")</code>','Carga el archivo en un DataFrame'],
    ['<code>df.head(3)</code>','Muestra las primeras 3 filas'],
    ['<code>df["precio"].mean()</code>','Precio promedio']
  ],
  practica:[
    {tipo:'opcion',pregunta:'¿Qué devuelve <code>df.shape</code>?',opciones:['El número de filas y de columnas','Las primeras 5 filas','El tipo de cada columna'],correcta:0},
    {tipo:'completar',pregunta:'Completa para ver las primeras filas: <code>df.___()</code>',respuestas:['head','head()','df.head()'],
     explicacion:'<code>df.head()</code> muestra 5 filas por defecto.'},
    {tipo:'opcion',pregunta:'¿Cómo seleccionas la columna “edad”?',opciones:['<code>df.select("edad")</code>','<code>df["edad"]</code>','<code>df(edad)</code>'],correcta:1},
    {tipo:'completar',pregunta:'Completa para calcular la mediana del precio: <code>df["precio"].___()</code>',respuestas:['median','median()'],
     explicacion:'<code>.median()</code> devuelve la mediana; <code>.mean()</code>, la media.'},
    {tipo:'opcion',pregunta:'¿Qué devuelve este código?',codigo:'df = pd.DataFrame({"x": [1, 2, 3, 4]})\ndf["x"].mean()',opciones:['2.5','10','4'],correcta:0,
     explicacion:'(1 + 2 + 3 + 4) / 4 = 2.5.'},
    {tipo:'tarjeta',frente:'¿Para qué sirve <code>df.describe()</code>?',reverso:'Resume las columnas numéricas: conteo, media, desviación estándar, mínimo, cuartiles y máximo.'}
  ]
};
