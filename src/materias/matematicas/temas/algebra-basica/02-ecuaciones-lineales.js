const R1='Aplica la operación inversa en ambos lados: primero quita lo que suma o resta a la x, después divide entre su coeficiente.';
const R2='Si hay paréntesis, primero aplica la distributiva; si hay x en ambos lados, pásalas a uno solo.';

export default {
  titulo:'Ecuaciones lineales',
  resumen:'Despeja la incógnita: 2x + 5 = 17 → x = 6.',
  explicacion:[
    'Resolver una ecuación es hallar el valor que hace verdadera la igualdad. Lo que hagas de un lado, hazlo del otro.',
    'Despeja con la operación <b>inversa</b>: lo que suma pasa restando y lo que multiplica pasa dividiendo. Primero los términos sin x, luego el coeficiente.',
    'Comprueba sustituyendo: si 2x + 5 = 17 da x = 6, entonces 2(6) + 5 = 17 ✓.'
  ],
  ejemplos:[
    ['x + 7 = 12 → x = 12 − 7 = 5'],
    ['3x = 21 → x = 21 ÷ 3 = 7'],
    ['2x + 5 = 17 → 2x = 12 → x = 6','primero el 5, después el 2']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Cuál es el primer paso para resolver 4x − 3 = 9?',opciones:['Dividir entre 4','Sumar 3 en ambos lados','Restar 9 en ambos lados'],correcta:1,
     porque:{0:'Dividir primero deja fracciones; antes quita el −3.',2:'El 9 no acompaña a la x; lo que hay que quitar es el −3.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: x − 4 = 10',respuestas:['14'],
     errores:{'6':'El −4 pasa sumando: 10 + 4 = 14.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: 5x = 35',respuestas:['7'],
     errores:{'30':'El 5 multiplica a la x: pasa dividiendo, 35 ÷ 5.','175':'Se divide, no se multiplica.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: 3x + 2 = 20',respuestas:['6'],
     errores:{'22/3':'El +2 pasa restando: 3x = 18.','18':'Falta dividir 18 entre 3.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: 2(x + 1) = 14',respuestas:['6'],pista:'2(x + 1) = 2x + 2',
     errores:{'7':'Distribuye primero: 2x + 2 = 14 → 2x = 12.','13/2':'2(x + 1) = 2x + 2, no 2x + 1.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'¿Cuál es la solución de x + 9 = 4?',opciones:['x = 13','x = −5','x = 5'],correcta:1,
     porque:{0:'El 9 pasa restando: 4 − 9.',2:'4 − 9 es negativo: −5.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: x / 3 = 4',respuestas:['12'],
     errores:{'4/3':'La x está dividida entre 3: pasa multiplicando, 4 · 3.','1':'4 − 3 no: la división se deshace multiplicando.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: 7x − 5 = 30',respuestas:['5'],
     errores:{'25/7':'El −5 pasa sumando: 7x = 35.','35':'Falta dividir 35 entre 7.'},regla:R1},
    {tipo:'completar',pregunta:'Resuelve: 4x + 3 = 2x + 11',respuestas:['4'],pista:'pasa las x a la izquierda',
     errores:{'7':'Junta las x: 4x − 2x = 2x; luego 2x = 8.','8':'Falta dividir 8 entre 2.'},regla:R2},
    {tipo:'completar',pregunta:'Resuelve: 3(x − 2) = 9',respuestas:['5'],
     errores:{'11/3':'Distribuye: 3x − 6 = 9 → 3x = 15.','3':'3x − 6 = 9 → 3x = 15 → x = 5.','15':'Falta dividir 15 entre 3.'},regla:R2}
  ]]
};
