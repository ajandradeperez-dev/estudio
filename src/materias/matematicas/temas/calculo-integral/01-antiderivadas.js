const R1='Regla de la potencia: ∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C (para n ≠ −1): sube el exponente en 1 y divide entre el nuevo exponente.';
const R2='Toda antiderivada lleva + C: hay infinitas, que difieren en una constante. Si te dan un punto, úsalo para hallar C.';
const R3='Las constantes salen de la integral y una suma se integra término a término: ∫ (3x² + 2) dx = x³ + 2x + C.';

export default {
  titulo:'Antiderivadas básicas',
  resumen:'Integrar es derivar al revés: regla de la potencia, constantes, sumas y la constante + C.',
  explicacion:[
    'Una <b>antiderivada</b> de f es una función F cuya derivada es f. Se escribe ∫ f(x) dx = F(x) + C.',
    '<b>Regla de la potencia</b>: sube el exponente en 1 y divide entre el nuevo exponente: ∫ x² dx = x³/3 + C (vale para n ≠ −1).',
    'Las <b>constantes salen</b> y una suma se integra término a término: ∫ (3x² + 2) dx = x³ + 2x + C.',
    '<b>+ C siempre</b>: x² + 1 y x² − 7 tienen la misma derivada. Si te dan un punto, como F(0) = 3, sustitúyelo para hallar C.',
    'Escribe exponentes con ^: x^3/3 + C.'
  ],
  ejemplos:[
    ['∫ x⁴ dx = x⁵/5 + C','regla de la potencia'],
    ['∫ 6x dx = 6·x²/2 = 3x² + C','la constante sale'],
    ['F′(x) = 2x y F(0) = 3 → F(x) = x² + 3','el punto fija C']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'∫ x² dx =',opciones:['x³/3 + C','2x + C','x³ + C'],correcta:0,
     porque:{1:'2x es la derivada de x², no su antiderivada.',2:'Al subir el exponente se divide entre el nuevo: x³/3.'},regla:R1},
    {tipo:'completar',pregunta:'∫ x⁴ dx =',respuestas:['x^5/5 + C','x⁵/5 + C','(1/5)x^5 + C','1/5 x^5 + C'],pista:'exponente 5, divide entre 5',
     errores:{'x^5/5':'Falta + C.','4x^3 + C':'Eso es la derivada; para la antiderivada se sube el exponente.','x^5 + C':'Divide entre el nuevo exponente: x⁵/5.'},regla:R1},
    {tipo:'completar',pregunta:'∫ 5 dx =',respuestas:['5x + C'],
     errores:{'5x':'Falta + C.','0':'0 es la derivada de 5; al integrar: 5x + C.','5 + C':'La antiderivada de 5 es 5x: su derivada da 5.'},regla:R3},
    {tipo:'completar',pregunta:'∫ 6x dx =',respuestas:['3x^2 + C'],
     errores:{'6x^2 + C':'∫ x dx = x²/2, así que 6·x²/2 = 3x².','3x^2':'Falta + C.','6 + C':'Eso sería derivar.'},regla:R3},
    {tipo:'completar',pregunta:'∫ (3x² + 2) dx =',respuestas:['x^3 + 2x + C','2x + x^3 + C'],
     errores:{'x^3 + 2x':'Falta + C.','6x + C':'Eso es la derivada.','x^3 + 2 + C':'∫ 2 dx = 2x, no 2.'},regla:R3},
    {tipo:'completar',pregunta:'F′(x) = 2x y F(0) = 3. ¿Cuál es F(x)?',respuestas:['x^2 + 3','3 + x^2','F(x) = x^2 + 3'],pista:'F(x) = x² + C; usa F(0) = 3',
     errores:{'x^2 + C':'Usa F(0) = 3 para hallar C: 0 + C = 3.','x^2':'Falta la constante: F(0) = 3 → C = 3.','2x + 3':'Primero integra 2x: x² + C.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'¿Por qué ∫ 2x dx = x² + C lleva + C?',opciones:['Porque x² + 1, x² − 7… también tienen derivada 2x','Porque es la constante de la derivada','Es opcional'],correcta:0,
     porque:{1:'C no viene de derivar: representa todas las antiderivadas posibles.',2:'Sin + C la respuesta está incompleta.'},regla:R2},
    {tipo:'completar',pregunta:'∫ x³ dx =',respuestas:['x^4/4 + C','x⁴/4 + C','(1/4)x^4 + C','1/4 x^4 + C'],
     errores:{'x^4/4':'Falta + C.','3x^2 + C':'Eso es la derivada.','x^4 + C':'Divide entre el nuevo exponente: x⁴/4.'},regla:R1},
    {tipo:'completar',pregunta:'∫ 4x³ dx =',respuestas:['x^4 + C'],
     errores:{'4x^4 + C':'4·x⁴/4 = x⁴.','12x^2 + C':'Eso es derivar.','x^4':'Falta + C.'},regla:R3},
    {tipo:'completar',pregunta:'∫ (2x + 1) dx =',respuestas:['x^2 + x + C','x + x^2 + C'],
     errores:{'x^2 + 1 + C':'∫ 1 dx = x, no 1.','2 + C':'Eso es la derivada.','x^2 + x':'Falta + C.'},regla:R3},
    {tipo:'completar',pregunta:'∫ x dx =',respuestas:['x^2/2 + C','(1/2)x^2 + C','1/2 x^2 + C','0.5x^2 + C'],
     errores:{'x^2 + C':'Divide entre el nuevo exponente: x²/2.','1 + C':'Eso es la derivada.','x^2/2':'Falta + C.'},regla:R1},
    {tipo:'completar',pregunta:'F′(x) = 3x² y F(1) = 5. ¿Cuál es F(x)?',respuestas:['x^3 + 4','4 + x^3','F(x) = x^3 + 4'],
     errores:{'x^3 + 5':'F(1) = 1 + C = 5 → C = 4.','x^3 + C':'Usa F(1) = 5 para hallar C: 1 + C = 5.','x^3':'Falta la constante: F(1) = 5 → C = 4.'},regla:R2}
  ]]
};
