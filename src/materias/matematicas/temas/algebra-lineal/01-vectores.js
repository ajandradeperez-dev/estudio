const R1='El vector que va de A a B es B − A: se resta componente a componente, final menos inicio.';
const R2='La norma (longitud) de v = (a, b) es ‖v‖ = √(a² + b²); en 3D se suma también c². Nunca es negativa.';
const R3='La dimensión de un vector es su número de componentes: (1, 0, 5) está en ℝ³.';

export default {
  titulo:'Vectores',
  resumen:'Qué es un vector, el vector entre dos puntos y su longitud (norma).',
  explicacion:[
    'Un <b>vector</b> es una flecha con dirección y longitud. Se escribe con sus componentes: <b>v</b> = (3, 4) significa 3 hacia la derecha y 4 hacia arriba. Con 2 componentes vive en ℝ², con 3 en ℝ³.',
    'El vector que va del punto A al punto B es <b>B − A</b> (final menos inicio): de A = (1, 2) a B = (4, 6) es (3, 4).',
    'Su <b>norma</b> o longitud sale del teorema de Pitágoras: ‖v‖ = √(a² + b²). Para (3, 4): √(9 + 16) = √25 = 5. En 3D se suma también el cuadrado de la tercera componente.',
    'Escribe tus respuestas como (x, y), por ejemplo (5, −4).'
  ],
  ejemplos:[
    ['(4, 6) − (1, 2) = (3, 4)','vector de A = (1, 2) a B = (4, 6)'],
    ['‖(6, 8)‖ = √(36 + 64) = √100 = 10'],
    ['‖(1, 2, 2)‖ = √(1 + 4 + 4) = 3','un vector de ℝ³']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Cuál es el vector que va de A = (1, 2) a B = (4, 6)?',opciones:['(3, 4)','(5, 8)','(−3, −4)'],correcta:0,
     porque:{1:'Sumaste las coordenadas; el vector es B − A.',2:'Restaste al revés (A − B): ese vector va de B a A.'},regla:R1},
    {tipo:'completar',pregunta:'Vector que va de A = (2, 5) a B = (7, 1). Escribe (x, y).',respuestas:['(5, −4)','5, −4','<5, −4>'],pista:'B − A: 7 − 2 y 1 − 5',
     errores:{'(-5, 4)':'Es A − B; el vector de A a B es B − A (final menos inicio).','(9, 6)':'No se suman: se resta B − A.','(5, 4)':'1 − 5 = −4: cuida el signo.'},regla:R1},
    {tipo:'completar',pregunta:'Norma de <b>v</b> = (3, 4): ‖v‖ = ?',respuestas:['5'],
     errores:{'7':'No se suman las componentes: √(3² + 4²) = √25 = 5.','25':'Falta la raíz: √25 = 5.'},regla:R2},
    {tipo:'completar',pregunta:'Norma de <b>v</b> = (6, 8): ‖v‖ = ?',respuestas:['10'],
     errores:{'14':'No se suman las componentes: √(36 + 64) = √100 = 10.','100':'Falta sacar la raíz: √100 = 10.'},regla:R2},
    {tipo:'completar',pregunta:'¿Cuántas componentes tiene un vector de ℝ³?',respuestas:['3'],
     errores:{'2':'ℝ³ tiene 3 componentes: (x, y, z).'},regla:R3},
    {tipo:'completar',pregunta:'Norma de <b>v</b> = (2, −1, 2): ‖v‖ = ?',respuestas:['3'],pista:'4 + 1 + 4',
     errores:{'9':'Falta la raíz: √9 = 3.','√7':'(−1)² = +1, no −1: 4 + 1 + 4 = 9 → 3.','3,3':'Es un número, no un vector: √9 = 3.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'¿Cuál es la norma de <b>v</b> = (5, 12)?',opciones:['17','13','169'],correcta:1,
     porque:{0:'No se suman las componentes: √(25 + 144).',2:'Falta la raíz: √169 = 13.'},regla:R2},
    {tipo:'completar',pregunta:'Vector que va de P = (−1, 3) a Q = (2, 3).',respuestas:['(3, 0)','3, 0','<3, 0>'],
     errores:{'(-3, 0)':'Es P − Q; el vector de P a Q es Q − P.','(1, 6)':'Se resta, no se suma.','(3, 6)':'3 − 3 = 0.'},regla:R1},
    {tipo:'completar',pregunta:'El vector de A a B es (4, −2) y A = (1, 1). ¿Cuánto vale B?',respuestas:['(5, −1)','5, −1','<5, −1>'],pista:'B = A + vector',
     errores:{'(-3, 3)':'Calculaste A − vector: B = A + (4, −2).','(3, -3)':'B = A + vector, no vector − A.','(4, -2)':'Ese es el vector; B = (1, 1) + (4, −2).'},regla:R1},
    {tipo:'completar',pregunta:'‖(0, −7)‖ = ?',respuestas:['7'],
     errores:{'-7':'La norma nunca es negativa: √49 = 7.','49':'Falta la raíz: √49 = 7.'},regla:R2},
    {tipo:'completar',pregunta:'‖(1, 2, 2)‖ = ?',respuestas:['3'],
     errores:{'5':'Se suman los cuadrados, no las componentes: 1 + 4 + 4 = 9 → 3.','9':'Falta la raíz: √9 = 3.'},regla:R2},
    {tipo:'completar',pregunta:'¿En qué espacio está <b>v</b> = (4, 0, −1, 2)? Escribe R y el número (por ejemplo, R2).',respuestas:['R4','ℝ4','ℝ⁴','R^4'],
     errores:{'R3':'Cuenta todas las componentes: son 4.','R2':'Cuenta todas las componentes: son 4.'},regla:R3}
  ]]
};
