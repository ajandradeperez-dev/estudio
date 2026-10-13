const R1='Solo se suman términos con la misma letra y el mismo exponente: se suman los coeficientes y la parte literal se conserva.';
const R2='Distributiva: a(b + c) = ab + ac. Un signo menos delante del paréntesis cambia el signo de cada término.';

export default {
  titulo:'Términos semejantes y propiedad distributiva',
  resumen:'Simplifica expresiones: 3x + 5x = 8x y 3(x + 4) = 3x + 12.',
  explicacion:[
    'Los <b>términos semejantes</b> tienen la misma letra con el mismo exponente; solo esos se suman: 3x + 5x = 8x, pero 3x + 5y se queda así.',
    'La <b>propiedad distributiva</b> multiplica lo de afuera por cada término de adentro: a(b + c) = ab + ac. Cuidado con los signos: −2(x − 3) = −2x + 6.'
  ],
  ejemplos:[
    ['4x + 3x − x = 6x','todos son términos en x'],
    ['2a + 5b + 3a = 5a + 5b','solo se juntan los términos en a'],
    ['−(2x − 5) = −2x + 5','el menos cambia el signo de cada término']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'Simplifica: 5x + 2x − 3x',opciones:['4x','10x','4'],correcta:0,
     porque:{1:'Sumaste el 3x; tiene signo menos y se resta.',2:'La x no desaparece: 4x.'},regla:R1},
    {tipo:'completar',pregunta:'Simplifica: 7y − 2y + y',respuestas:['6y'],pista:'y sola vale 1y',
     errores:{'5y':'y sola vale 1y: 7 − 2 + 1 = 6.','6':'La parte literal se conserva: 6y.'},regla:R1},
    {tipo:'completar',pregunta:'Simplifica: 3a + 2b + a − b',respuestas:['4a + b','b + 4a'],
     errores:{'4a + 3b':'2b − b = b, no 3b.','5ab':'a y b no son semejantes: no se juntan.','4a':'Falta el término en b: 2b − b = b.'},regla:R1},
    {tipo:'completar',pregunta:'Desarrolla: 4(x − 2)',respuestas:['4x − 8'],
     errores:{'4x − 2':'El 4 también multiplica al −2: −8.','4x + 8':'4 · (−2) = −8.'},regla:R2},
    {tipo:'completar',pregunta:'Desarrolla: −2(x − 3)',respuestas:['−2x + 6','6 − 2x'],
     errores:{'−2x − 6':'(−2) · (−3) = +6.','−2x − 3':'El −2 también multiplica al −3: +6.','−2x + 3':'(−2) · (−3) = +6, no +3.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'¿Cuál es un par de términos semejantes?',opciones:['3x² y 3x','5y y −2y','4a y 4b'],correcta:1,
     porque:{0:'Misma letra pero distinto exponente.',2:'Letras distintas.'},regla:R1},
    {tipo:'completar',pregunta:'Simplifica: 6m − 4m + 3',respuestas:['2m + 3','3 + 2m'],
     errores:{'5m':'El 3 no tiene m: no se suma con 2m.','5':'2m y 3 no son semejantes.'},regla:R1},
    {tipo:'completar',pregunta:'Simplifica: x² + 2x + 3x²',respuestas:['4x² + 2x','2x + 4x²'],pista:'junta solo los x²',
     errores:{'6x³':'x² y x no son semejantes.','6x²':'2x no es semejante a x²: queda aparte.'},regla:R1},
    {tipo:'completar',pregunta:'Desarrolla: 5(2x + 1)',respuestas:['10x + 5','5 + 10x'],
     errores:{'10x + 1':'El 5 también multiplica al 1.','7x + 5':'5 · 2x = 10x: se multiplica, no se suma.'},regla:R2},
    {tipo:'completar',pregunta:'Desarrolla y simplifica: 3(x + 2) + x',respuestas:['4x + 6','6 + 4x'],
     errores:{'3x + 6 + x':'Falta juntar 3x + x = 4x.','4x + 2':'3 · 2 = 6.','3x + 2 + x':'El 3 también multiplica al 2.'},regla:R2}
  ]]
};
