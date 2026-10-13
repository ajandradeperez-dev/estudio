export default {
  titulo:'Media, mediana y moda',
  resumen:'Resume un conjunto de datos con un valor típico y elige la medida correcta.',
  explicacion:[
    'Las medidas de tendencia central resumen un conjunto de datos con un solo valor “típico”.',
    '<b>Media</b>: la suma de los valores entre la cantidad de valores. <b>Mediana</b>: el valor del centro con los datos ordenados (si hay dos centrales, su promedio). <b>Moda</b>: el valor que más se repite.',
    'La media se deja arrastrar por valores extremos (atípicos); la mediana no. Por eso los salarios o los precios de vivienda suelen resumirse con la mediana.'
  ],
  ejemplos:[
    ['Datos: 2, 4, 4, 5, 10','Media = 25 / 5 = 5 · Mediana = 4 · Moda = 4'],
    ['Datos: 3, 7, 8, 12','Mediana = (7 + 8) / 2 = 7.5'],
    ['Salarios (miles): 10, 11, 12, 13, 200','Media = 49.2, pero la mediana es 12: aquí la media engaña']
  ],
  practica:[
    {tipo:'completar',pregunta:'Calcula la media de: 4, 8, 6, 2',respuestas:['5'],
     explicacion:'(4 + 8 + 6 + 2) / 4 = 20 / 4 = 5.'},
    {tipo:'completar',pregunta:'Calcula la mediana de: 9, 1, 5, 3, 7',respuestas:['5'],
     explicacion:'Ordenados: 1, 3, 5, 7, 9. El del centro es 5.'},
    {tipo:'opcion',pregunta:'¿Cuál es la moda de: 3, 5, 5, 2, 8, 5, 2?',opciones:['2','5','8'],correcta:1,
     explicacion:'El 5 aparece tres veces; el 2, dos.'},
    {tipo:'opcion',pregunta:'Si los datos tienen un valor atípico muy grande, ¿qué medida representa mejor el valor típico?',opciones:['La media','La mediana','La suma'],correcta:1,
     explicacion:'La mediana solo depende del orden, así que un extremo no la mueve.'},
    {tipo:'completar',pregunta:'Calcula la mediana de: 2, 4, 6, 8',respuestas:['5'],
     explicacion:'Hay dos valores centrales (4 y 6): (4 + 6) / 2 = 5.'},
    {tipo:'tarjeta',frente:'¿Puede un conjunto de datos tener más de una moda?',reverso:'Sí. Si dos valores empatan como los más frecuentes es <b>bimodal</b>; y si ningún valor se repite, no hay moda.'}
  ]
};
