const R1='Suma y resta de vectores: componente a componente, (a, b) + (c, d) = (a + c, b + d).';
const R2='Un número por un vector multiplica cada componente: k·(a, b) = (ka, kb).';
const R3='Producto punto: (a, b)·(c, d) = ac + bd (en 3D se suma también el tercer par). El resultado es un número, no un vector.';
const R4='Dos vectores son perpendiculares (90°) si su producto punto es 0.';

export default {
  titulo:'Operaciones con vectores y producto punto',
  resumen:'Suma, resta, número por vector y producto punto; cuándo dos vectores son perpendiculares.',
  explicacion:[
    '<b>Suma y resta</b>: componente a componente. (2, −1) + (3, 5) = (5, 4).',
    '<b>Número por vector</b>: el número multiplica cada componente: 3·(2, −4) = (6, −12). Un número negativo invierte el sentido.',
    '<b>Producto punto</b>: multiplica por pares y suma; da un <b>número</b>: (1, 3)·(2, 4) = 1·2 + 3·4 = 14.',
    'Si el producto punto es <b>0</b>, los vectores son <b>perpendiculares</b>: (3, 2)·(−2, 3) = −6 + 6 = 0. Así se comprueba un ángulo recto sin medirlo.'
  ],
  ejemplos:[
    ['(5, 2) − (1, 6) = (4, −4)','componente a componente'],
    ['−2·(1, −3) = (−2, 6)','el signo invierte el sentido'],
    ['(4, 1)·(2, 3) = 8 + 3 = 11','el producto punto es un número']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'(1, 3)·(2, 4) =',opciones:['(2, 12)','14','10'],correcta:1,
     porque:{0:'El producto punto da un número: 1·2 + 3·4 = 14.',2:'No se suman todas las componentes: se multiplica por pares y luego se suma.'},regla:R3},
    {tipo:'completar',pregunta:'(2, −1) + (3, 5) =',respuestas:['(5, 4)','5, 4','<5, 4>'],
     errores:{'(6, -5)':'Se suman, no se multiplican.','(5, 6)':'−1 + 5 = 4.'},regla:R1},
    {tipo:'completar',pregunta:'3·(2, −4) =',respuestas:['(6, −12)','6, −12','<6, −12>'],
     errores:{'(6, -4)':'El 3 multiplica las dos componentes.','(5, -1)':'Se multiplica, no se suma.'},regla:R2},
    {tipo:'completar',pregunta:'(4, 1)·(2, 3) =',respuestas:['11'],
     errores:{'(8, 3)':'El producto punto es un número: 8 + 3 = 11.','10':'Se multiplica por pares: 4·2 + 1·3 = 11.'},regla:R3},
    {tipo:'completar',pregunta:'(5, 2) − (1, 6) =',respuestas:['(4, −4)','4, −4','<4, −4>'],
     errores:{'(6, 8)':'Es una resta, no una suma.','(4, 4)':'2 − 6 = −4.','(-4, 4)':'Restaste al revés: es el primero menos el segundo.'},regla:R1},
    {tipo:'completar',pregunta:'¿Cuánto vale k para que (2, k) sea perpendicular a (3, 6)?',respuestas:['-1','k = -1'],pista:'2·3 + k·6 = 0',
     errores:{'1':'2·3 + 6k = 0 → 6k = −6 → k = −1.','-6':'Falta despejar: 6k = −6 → k = −1.'},regla:R4}
  ],[
    {tipo:'opcion',pregunta:'¿(3, 2) y (−2, 3) son perpendiculares?',opciones:['Sí, su producto punto es 0','No, su producto punto es 12','No, porque tienen signos distintos'],correcta:0,
     porque:{1:'3·(−2) + 2·3 = −6 + 6 = 0.',2:'Los signos no deciden: se calcula el producto punto.'},regla:R4},
    {tipo:'completar',pregunta:'(−1, 4) + 2·(3, 1) =',respuestas:['(5, 6)','5, 6','<5, 6>'],pista:'primero 2·(3, 1)',
     errores:{'(2, 5)':'Primero 2·(3, 1) = (6, 2); luego suma: (5, 6).','(-2, 8)':'El 2 multiplica a (3, 1), no a (−1, 4).'},regla:R2},
    {tipo:'completar',pregunta:'(2, −3)·(4, 1) =',respuestas:['5'],
     errores:{'11':'(−3)·1 = −3: 8 − 3 = 5.','(8, -3)':'El resultado es un número: 8 + (−3) = 5.'},regla:R3},
    {tipo:'completar',pregunta:'(1, 2, 3)·(4, 0, −1) =',respuestas:['1'],
     errores:{'7':'3·(−1) = −3: 4 + 0 − 3 = 1.','(4, 0, -3)':'Suma los productos: 4 + 0 − 3 = 1.'},regla:R3},
    {tipo:'completar',pregunta:'−(3, −5) =',respuestas:['(−3, 5)','−3, 5','<−3, 5>'],
     errores:{'(-3, -5)':'El menos cambia el signo de cada componente: −(−5) = 5.','(3, 5)':'−3: el menos también cambia la primera componente.'},regla:R2},
    {tipo:'completar',pregunta:'<b>u</b> = (4, 2) y <b>v</b> = (1, k) son perpendiculares. ¿Cuánto vale k?',respuestas:['-2','k = -2'],
     errores:{'2':'4 + 2k = 0 → k = −2.','-4':'4 + 2k = 0 → 2k = −4 → k = −2.'},regla:R4}
  ]]
};
