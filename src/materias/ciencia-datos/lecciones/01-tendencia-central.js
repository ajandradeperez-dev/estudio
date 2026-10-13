const R_MEDIA='Media = suma de los valores ÷ cantidad de valores.';
const R_MEDIANA='Mediana: ordena los datos; es el valor del centro, o el promedio de los dos centrales si son pares.';
const R_MODA='Moda: el valor que más se repite.';
const R_ATIPICO='La mediana no se mueve con valores extremos; la media sí.';

export default {
  titulo:'Media, mediana y moda',
  resumen:'Resume datos con un valor típico y elige la medida correcta.',
  explicacion:[
    '<b>Media</b>: suma de los valores entre cuántos son. <b>Mediana</b>: el valor del centro con los datos ordenados (si hay dos centrales, su promedio). <b>Moda</b>: el valor que más se repite.',
    'La media se deja arrastrar por valores extremos; la mediana no. Por eso salarios y precios de vivienda se resumen con la mediana.'
  ],
  ejemplos:[
    ['2, 4, 4, 5, 10','media 5 · mediana 4 · moda 4'],
    ['3, 7, 8, 12','mediana (7 + 8) / 2 = 7.5'],
    ['10, 11, 12, 13, 200','media 49.2, pero mediana 12: aquí la media engaña']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'Si los datos tienen un valor atípico muy grande, ¿qué medida representa mejor el valor típico?',opciones:['La media','La mediana','La suma'],correcta:1,
     porque:{0:'La media se deja arrastrar por el valor extremo.',2:'La suma no es un valor típico.'},regla:R_ATIPICO},
    {tipo:'completar',pregunta:'Calcula la media de: 4, 8, 6, 2',respuestas:['5'],
     errores:{'20':'Esa es la suma: falta dividir entre 4.'},regla:R_MEDIA},
    {tipo:'completar',pregunta:'Calcula la mediana de: 9, 1, 2, 8, 7',respuestas:['7'],pista:'primero ordena',
     errores:{'2':'Primero ordena: 1, 2, 7, 8, 9. El del centro es 7.','5.4':'Esa es la media; la mediana es el valor central.'},regla:R_MEDIANA},
    {tipo:'completar',pregunta:'Calcula la moda de: 3, 5, 5, 2, 8, 5, 2',respuestas:['5'],
     errores:{'2':'El 2 aparece dos veces; el 5, tres.'},regla:R_MODA},
    {tipo:'completar',pregunta:'Calcula la mediana de: 2, 4, 6, 8',respuestas:['5'],
     errores:{'4':'Hay dos centrales (4 y 6): su promedio es 5.','6':'Hay dos centrales (4 y 6): su promedio es 5.'},regla:R_MEDIANA}
  ],[
    {tipo:'opcion',pregunta:'En una empresa, el director gana 50 veces más que el resto. ¿Qué medida describe mejor el salario típico?',opciones:['La media','La mediana','El máximo'],correcta:1,
     porque:{0:'El sueldo del director infla la media.',2:'El máximo es solo el sueldo del director.'},regla:R_ATIPICO},
    {tipo:'completar',pregunta:'Calcula la media de: 10, 20, 30, 40, 50',respuestas:['30'],
     errores:{'150':'Esa es la suma: falta dividir entre 5.'},regla:R_MEDIA},
    {tipo:'completar',pregunta:'Calcula la mediana de: 12, 3, 8',respuestas:['8'],
     errores:{'3':'Primero ordena: 3, 8, 12.','23/3':'Esa es la media; la mediana es el valor central.'},regla:R_MEDIANA},
    {tipo:'completar',pregunta:'Calcula la mediana de: 1, 3, 4, 10',respuestas:['3.5'],
     errores:{'3':'Hay dos centrales (3 y 4): (3 + 4) / 2 = 3.5.','4':'Hay dos centrales (3 y 4): (3 + 4) / 2 = 3.5.','4.5':'Esa es la media; la mediana usa solo los dos valores del centro.'},regla:R_MEDIANA},
    {tipo:'completar',pregunta:'Calcula la media de: 2, 3, 3, 4, 8',respuestas:['4'],
     errores:{'3':'Esa es la moda (y la mediana); la media es 20 / 5 = 4.','20':'Esa es la suma: falta dividir entre 5.'},regla:R_MEDIA}
  ]]
};
