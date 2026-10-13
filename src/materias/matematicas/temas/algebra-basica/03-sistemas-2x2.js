const R1='Reducción: si una incógnita tiene coeficientes opuestos, suma las ecuaciones; si son iguales, réstalas.';
const R2='Sustitución: reemplaza la incógnita despejada en la otra ecuación, resuelve y luego calcula la otra.';

export default {
  titulo:'Sistemas de ecuaciones 2×2',
  resumen:'Dos ecuaciones, dos incógnitas: reducción y sustitución.',
  explicacion:[
    'Un sistema 2×2 son dos ecuaciones con dos incógnitas; la solución (x, y) cumple las dos a la vez.',
    '<b>Reducción</b>: suma o resta las ecuaciones para eliminar una incógnita. <b>Sustitución</b>: despeja una incógnita y reemplázala en la otra ecuación.',
    'Comprueba siempre la solución en ambas ecuaciones.'
  ],
  ejemplos:[
    ['x + y = 10 y x − y = 2','sumando: 2x = 12 → x = 6, y = 4'],
    ['y = 2x y x + y = 9','sustituyendo: 3x = 9 → x = 3, y = 6']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Qué método conviene si una ecuación ya dice y = 2x + 1?',opciones:['Sustitución','Reducción','Ninguno de los dos'],correcta:0,
     porque:{1:'Funciona, pero la y ya está despejada: sustituir es más directo.',2:'Ambos sirven; aquí sustitución es el más corto.'},regla:R2},
    {tipo:'completar',pregunta:'x + y = 8 y x − y = 2. ¿Cuánto vale x?',respuestas:['5'],
     errores:{'3':'Ese es y. Sumando: 2x = 10 → x = 5.','10':'2x = 10: falta dividir entre 2.'},regla:R1},
    {tipo:'completar',pregunta:'En el mismo sistema (x + y = 8, x − y = 2), ¿cuánto vale y?',respuestas:['3'],
     errores:{'5':'Ese es x; y = 8 − 5 = 3.'},regla:R2},
    {tipo:'completar',pregunta:'y = 3x y x + y = 12. ¿Cuánto vale x?',respuestas:['3'],
     errores:{'4':'x + 3x = 4x = 12 → x = 3.','9':'Ese es y.'},regla:R2},
    {tipo:'completar',pregunta:'2x + y = 7 y x − y = 2. ¿Cuánto vale x?',respuestas:['3'],
     errores:{'5':'Sumando: 3x = 9.','9':'3x = 9: falta dividir entre 3.'},regla:R1}
  ],[
    {tipo:'opcion',pregunta:'Para eliminar y en 3x + 2y = 12 y x + 2y = 8:',opciones:['Sumar las ecuaciones','Restar las ecuaciones','Multiplicar la primera por 3'],correcta:1,
     porque:{0:'Sumando quedaría 4y: los coeficientes de y son iguales, hay que restar.',2:'No hace falta: 2y ya es igual en ambas.'},regla:R1},
    {tipo:'completar',pregunta:'3x + 2y = 12 y x + 2y = 8. ¿Cuánto vale x?',respuestas:['2'],
     errores:{'4':'Restando: 2x = 4 → x = 2.'},regla:R1},
    {tipo:'completar',pregunta:'En el mismo sistema (3x + 2y = 12, x + 2y = 8), ¿cuánto vale y?',respuestas:['3'],
     errores:{'2':'Ese es x. Con x = 2: 2 + 2y = 8 → y = 3.','6':'2y = 6: falta dividir entre 2.'},regla:R2},
    {tipo:'completar',pregunta:'x = y + 1 y x + y = 9. ¿Cuánto vale y?',respuestas:['4'],
     errores:{'5':'Ese es x. (y + 1) + y = 9 → 2y = 8.','8':'2y = 8: falta dividir entre 2.'},regla:R2},
    {tipo:'completar',pregunta:'x + y = 5 y x − y = 1. Escribe la solución como (x, y).',respuestas:['(3, 2)','3, 2','x = 3, y = 2'],
     errores:{'(2, 3)':'El orden es (x, y): x = 3 y y = 2.'},regla:R1}
  ]]
};
