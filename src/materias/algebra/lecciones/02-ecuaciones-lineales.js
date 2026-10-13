export default {
  titulo:'Ecuaciones lineales',
  resumen:'Despeja la incógnita con operaciones inversas: 2x + 5 = 17 → x = 6.',
  explicacion:[
    'Resolver una ecuación es encontrar el valor de la incógnita que hace verdadera la igualdad.',
    'La regla de oro: <b>lo que hagas de un lado, hazlo del otro</b>. Para despejar se aplica la operación inversa: lo que suma pasa restando y lo que multiplica pasa dividiendo.',
    'Comprueba siempre: sustituye el resultado en la ecuación original y verifica que los dos lados den lo mismo.'
  ],
  ejemplos:[
    ['x + 7 = 12 → x = 12 − 7 = 5'],
    ['3x = 21 → x = 21 ÷ 3 = 7'],
    ['2x + 5 = 17 → 2x = 12 → x = 6','Primero se quita el 5, luego el 2'],
    ['Comprobación: 2(6) + 5 = 17 ✓']
  ],
  practica:[
    {tipo:'completar',pregunta:'Resuelve: x − 4 = 10',respuestas:['14'],
     explicacion:'x = 10 + 4 = 14.'},
    {tipo:'opcion',pregunta:'Resuelve: 5x = 35',opciones:['x = 30','x = 7','x = 175'],correcta:1,
     explicacion:'x = 35 ÷ 5 = 7.'},
    {tipo:'completar',pregunta:'Resuelve: 3x + 2 = 20',respuestas:['6'],
     explicacion:'3x = 18 → x = 6.'},
    {tipo:'opcion',pregunta:'¿Cuál es el primer paso para resolver 4x − 3 = 9?',opciones:['Dividir entre 4','Sumar 3 en ambos lados','Restar 9 en ambos lados'],correcta:1,
     explicacion:'Primero se elimina el término sin x: 4x = 12, y luego x = 3.'},
    {tipo:'completar',pregunta:'Resuelve: 2(x + 1) = 14',respuestas:['6'],
     explicacion:'Distributiva: 2x + 2 = 14 → 2x = 12 → x = 6.'},
    {tipo:'tarjeta',frente:'¿Cómo compruebo que x = 3 es solución de 4x − 5 = 7?',reverso:'Sustituyo: 4(3) − 5 = 12 − 5 = 7 ✓. Se cumple la igualdad.'}
  ]
};
