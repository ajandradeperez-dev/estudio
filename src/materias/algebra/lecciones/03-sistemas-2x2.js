export default {
  titulo:'Sistemas de ecuaciones 2×2',
  resumen:'Dos ecuaciones, dos incógnitas: sustitución y reducción.',
  explicacion:[
    'Un <b>sistema de ecuaciones 2×2</b> son dos ecuaciones con dos incógnitas. La solución es el par (x, y) que cumple las dos a la vez.',
    'Método de <b>sustitución</b>: despeja una incógnita en una ecuación y reemplázala en la otra.',
    'Método de <b>reducción</b> (eliminación): suma o resta las ecuaciones para que desaparezca una incógnita.'
  ],
  ejemplos:[
    ['x + y = 10 y x − y = 2','Sumando: 2x = 12 → x = 6, y = 4'],
    ['y = 2x y x + y = 9','Sustitución: x + 2x = 9 → x = 3, y = 6'],
    ['Comprobación del primero: 6 + 4 = 10 ✓ y 6 − 4 = 2 ✓']
  ],
  practica:[
    {tipo:'opcion',pregunta:'Resuelve: x + y = 8 y x − y = 2',opciones:['x = 5, y = 3','x = 3, y = 5','x = 4, y = 4'],correcta:0,
     explicacion:'Sumando: 2x = 10 → x = 5; y = 8 − 5 = 3.'},
    {tipo:'completar',pregunta:'Si y = 3x y x + y = 12, ¿cuánto vale x?',respuestas:['3'],
     explicacion:'x + 3x = 12 → 4x = 12 → x = 3.'},
    {tipo:'completar',pregunta:'En el mismo sistema (y = 3x, x + y = 12), ¿cuánto vale y?',respuestas:['9'],
     explicacion:'y = 3 · 3 = 9. Comprobación: 3 + 9 = 12 ✓'},
    {tipo:'opcion',pregunta:'¿Qué método conviene si una ecuación ya dice <i>y = 2x + 1</i>?',opciones:['Sustitución','Reducción','Ninguno de los dos'],correcta:0,
     explicacion:'La y ya está despejada: basta con reemplazarla en la otra ecuación.'},
    {tipo:'opcion',pregunta:'Para eliminar y en 2x + y = 7 y x − y = 2, ¿qué haces?',opciones:['Restar las ecuaciones','Sumar las ecuaciones','Multiplicar la primera por 2'],correcta:1,
     explicacion:'+y y −y se anulan: 3x = 9 → x = 3 y y = 1.'},
    {tipo:'tarjeta',frente:'¿Qué significa que un sistema 2×2 no tenga solución?',reverso:'Que las dos rectas son paralelas: nunca se cruzan, así que ningún par (x, y) cumple ambas ecuaciones.'}
  ]
};
