export default {
  titulo:'Términos semejantes y propiedad distributiva',
  resumen:'Simplifica expresiones: 3x + 5x = 8x y 3(x + 4) = 3x + 12.',
  explicacion:[
    'Una <b>expresión algebraica</b> combina números y letras (variables), por ejemplo <i>3x + 2</i>.',
    'Los <b>términos semejantes</b> tienen la misma parte literal: misma letra y mismo exponente. Solo esos se pueden sumar: 3x + 5x = 8x, pero 3x + 5y se queda así.',
    'La <b>propiedad distributiva</b> multiplica lo de afuera por cada término de adentro: a(b + c) = ab + ac. Cuidado con los signos: −2(x − 3) = −2x + 6.'
  ],
  ejemplos:[
    ['4x + 3x − x = 6x','Todos son términos en x'],
    ['2a + 5b + 3a = 5a + 5b','Solo se juntan los términos en a'],
    ['3(x + 4) = 3x + 12','Distributiva'],
    ['−(2x − 5) = −2x + 5','El signo menos cambia el signo de cada término']
  ],
  practica:[
    {tipo:'opcion',pregunta:'Simplifica: 5x + 2x − 3x',opciones:['4x','10x','4'],correcta:0,
     explicacion:'5 + 2 − 3 = 4, y la x se conserva.'},
    {tipo:'completar',pregunta:'Simplifica: 7y − 2y + y',respuestas:['6y'],
     explicacion:'7 − 2 + 1 = 6 → 6y. Recuerda que <i>y</i> sola vale 1y.'},
    {tipo:'opcion',pregunta:'¿Cuál es igual a 4(x − 2)?',opciones:['4x − 2','4x − 8','x − 8'],correcta:1,
     explicacion:'El 4 multiplica a la x y también al −2.'},
    {tipo:'opcion',pregunta:'Simplifica: 3a + 2b + a − b',opciones:['4a + b','3a + b','4a + 3b'],correcta:0,
     explicacion:'3a + a = 4a y 2b − b = b.'},
    {tipo:'completar',pregunta:'Desarrolla: −2(x − 3) = −2x + ___',respuestas:['6'],
     explicacion:'(−2)·(−3) = +6.'},
    {tipo:'tarjeta',frente:'¿Son semejantes <b>3x²</b> y <b>3x</b>?',reverso:'No: tienen la misma letra pero distinto exponente, así que no se pueden sumar.'}
  ]
};
