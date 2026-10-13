const R1='Si la función es continua en el punto (como los polinomios), el límite se calcula sustituyendo: lím x→a f(x) = f(a).';
const R2='Si al sustituir sale 0/0, factoriza y simplifica antes de sustituir: 0/0 es una indeterminación, no el resultado.';
const R3='Cuando x → ∞ en un cociente de polinomios mandan los términos de mayor grado; si arriba y abajo tienen el mismo grado, el límite es el cociente de sus coeficientes.';
const lim=a=>`lím<sub>x→${a}</sub>`;

export default {
  titulo:'Límites',
  resumen:'El valor al que se acerca una función: sustituir, simplificar el 0/0 y límites al infinito.',
  explicacion:[
    `El <b>límite</b> ${lim('a')} f(x) es el valor al que se acerca f(x) cuando x se acerca a a. Es la base de la derivada.`,
    `<b>1. Sustituye.</b> En polinomios y funciones continuas, el límite es f(a): ${lim(2)} (x² + 1) = 5.`,
    '<b>2. Si sale 0/0, simplifica.</b> Es una indeterminación: factoriza y cancela. (x² − 4)/(x − 2) = (x − 2)(x + 2)/(x − 2) = x + 2, que en x = 2 vale 4.',
    `<b>3. En x → ∞</b> mandan los términos de mayor grado: ${lim('∞')} (3x² + 1)/(x² − 5) = 3/1 = 3.`,
    'Escribe exponentes con ^ (x^2) y fracciones con / (1/2).'
  ],
  ejemplos:[
    [`${lim(3)} (2x − 1) = 5`,'sustituir'],
    [`${lim(1)} (x² − 1)/(x − 1) = ${lim(1)} (x + 1) = 2`,'0/0: factorizar'],
    [`${lim('∞')} (2x + 1)/(4x − 3) = 2/4 = 1/2`,'mismo grado']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:`${lim(2)} (x² + 1) =`,opciones:['5','3','No existe'],correcta:0,
     porque:{1:'Sustituye x por 2: 2² + 1 = 5.',2:'Un polinomio es continuo: el límite existe y es f(2).'},regla:R1},
    {tipo:'completar',pregunta:`${lim(3)} (2x − 1) =`,respuestas:['5'],
     errores:{'6':'Falta restar 1: 2·3 − 1 = 5.','3':'Sustituye en toda la expresión: 2·3 − 1 = 5.'},regla:R1},
    {tipo:'completar',pregunta:`${lim('−1')} (x² + 3x) =`,respuestas:['-2'],pista:'(−1)² = 1',
     errores:{'4':'3·(−1) = −3: 1 − 3 = −2.','-4':'(−1)² = +1, no −1: 1 − 3 = −2.'},regla:R1},
    {tipo:'completar',pregunta:`${lim(2)} (x² − 4)/(x − 2) =`,respuestas:['4'],pista:'x² − 4 = (x − 2)(x + 2)',
     errores:{'0':'Sale 0/0: simplifica (x − 2)(x + 2)/(x − 2) = x + 2 → 4.','0/0':'0/0 es una indeterminación, no el resultado: simplifica primero.','no existe':'Sí existe: simplifica y da 4.'},regla:R2},
    {tipo:'completar',pregunta:`${lim(3)} (x² − 9)/(x − 3) =`,respuestas:['6'],
     errores:{'0':'Sale 0/0: simplifica a x + 3 → 6.','0/0':'0/0 es una indeterminación, no el resultado: simplifica primero.','3':'Tras simplificar queda x + 3, que con x = 3 da 6.'},regla:R2},
    {tipo:'completar',pregunta:`${lim('∞')} (3x² + 1)/(x² − 5) =`,respuestas:['3'],
     errores:{'∞':'Mismo grado arriba y abajo: el límite es 3/1 = 3.','infinito':'Mismo grado arriba y abajo: el límite es 3/1 = 3.','0':'Mismo grado: no tiende a 0, tiende a 3/1.','-1/5':'Eso sería x → 0; en ∞ mandan 3x² y x².'},regla:R3}
  ],[
    {tipo:'opcion',pregunta:`Al sustituir en ${lim(1)} (x² − 1)/(x − 1) sale 0/0. ¿Qué haces?`,opciones:['Digo que el límite es 0','Factorizo y simplifico','Digo que no existe'],correcta:1,
     porque:{0:'0/0 es una indeterminación, no vale 0.',2:'Puede existir: hay que simplificar para saberlo.'},regla:R2},
    {tipo:'completar',pregunta:`${lim(4)} √x =`,respuestas:['2'],
     errores:{'16':'Es la raíz, no el cuadrado: √4 = 2.','-2':'La raíz cuadrada principal es positiva: √4 = 2.'},regla:R1},
    {tipo:'completar',pregunta:`${lim(0)} (5x³ − 2x + 7) =`,respuestas:['7'],
     errores:{'0':'Solo se anulan los términos con x: queda 7.','5':'5·0³ = 0: queda 7.'},regla:R1},
    {tipo:'completar',pregunta:`${lim(1)} (x² − 1)/(x − 1) =`,respuestas:['2'],
     errores:{'0':'0/0 no es el resultado: (x − 1)(x + 1)/(x − 1) = x + 1 → 2.','0/0':'0/0 es una indeterminación: simplifica a x + 1.','1':'Tras simplificar queda x + 1, que con x = 1 da 2.'},regla:R2},
    {tipo:'completar',pregunta:`${lim(0)} (x² + 5x)/x =`,respuestas:['5'],pista:'saca x de factor común',
     errores:{'0':'Sale 0/0: x(x + 5)/x = x + 5 → 5.','0/0':'0/0 es una indeterminación: simplifica a x + 5.'},regla:R2},
    {tipo:'completar',pregunta:`${lim('∞')} (2x + 1)/(4x − 3) =`,respuestas:['1/2','0.5'],
     errores:{'2':'Es 2/4, no 4/2: 1/2.','-1/3':'Eso sería x → 0; en ∞ mandan 2x y 4x.','∞':'Mismo grado: el límite es 2/4 = 1/2.'},regla:R3}
  ]]
};
