const R_NUM='Numérica discreta: se cuenta (0, 1, 2…). Numérica continua: se mide y admite decimales.';
const R_CAT='Categórica nominal: categorías sin orden. Categórica ordinal: categorías con un orden natural.';
const R_DIG='Si sumar o promediar no tiene sentido, la variable es categórica aunque tenga dígitos.';

export default {
  titulo:'Tipos de variables',
  resumen:'Numéricas (discretas, continuas) y categóricas (nominales, ordinales).',
  explicacion:[
    'Identifica el tipo de variable antes de analizar: decide qué gráficos y cálculos tienen sentido.',
    '<b>Numéricas</b>: discretas si se cuentan (número de hijos), continuas si se miden (estatura). <b>Categóricas</b>: nominales si no tienen orden (país), ordinales si lo tienen (talla S/M/L).',
    'Tener dígitos no la hace numérica: un código postal es categórico, porque promediarlo no tiene sentido.'
  ],
  ejemplos:[
    ['Número de compras en un mes','numérica discreta'],
    ['Tiempo de carga de una página (s)','numérica continua'],
    ['Método de pago: tarjeta, efectivo','categórica nominal'],
    ['Calificación: malo, regular, bueno','categórica ordinal']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'La estatura de una persona es una variable…',opciones:['Numérica discreta','Numérica continua','Categórica ordinal'],correcta:1,
     porque:{0:'La estatura se mide y admite decimales.',2:'Es un número medible, no una categoría.'},regla:R_NUM},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): país de nacimiento',respuestas:['nominal','categórica nominal'],
     errores:{ordinal:'Los países no tienen un orden natural.'},regla:R_CAT},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): nivel educativo (primaria, secundaria, universidad)',respuestas:['ordinal','categórica ordinal'],
     errores:{nominal:'Hay un orden: primaria < secundaria < universidad.'},regla:R_CAT},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): visitas a una web por día',respuestas:['discreta','numérica discreta'],
     errores:{continua:'Las visitas se cuentan: no hay 2.5 visitas.'},regla:R_NUM},
    {tipo:'completar',pregunta:'¿Un código postal (por ejemplo, 06700) es una variable numérica o categórica?',respuestas:['categórica','categórica nominal','nominal'],
     errores:{'numérica':'Promediar códigos postales no tiene sentido.',discreta:'Promediar códigos postales no tiene sentido.'},regla:R_DIG}
  ],[
    {tipo:'opcion',pregunta:'El tiempo de carga de una página (en segundos) es una variable…',opciones:['Numérica continua','Numérica discreta','Categórica'],correcta:0,
     porque:{1:'Se mide y admite decimales (1.37 s).',2:'Es una medida numérica.'},regla:R_NUM},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): talla de camiseta (S, M, L, XL)',respuestas:['ordinal','categórica ordinal'],
     errores:{nominal:'Las tallas tienen orden: S < M < L < XL.'},regla:R_CAT},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): número de hijos',respuestas:['discreta','numérica discreta'],
     errores:{continua:'Se cuenta: no hay 1.5 hijos.'},regla:R_NUM},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): método de pago (tarjeta, efectivo, transferencia)',respuestas:['nominal','categórica nominal'],
     errores:{ordinal:'No hay un orden natural entre métodos de pago.'},regla:R_CAT},
    {tipo:'completar',pregunta:'Escribe el tipo (discreta, continua, nominal u ordinal): temperatura en °C',respuestas:['continua','numérica continua'],
     errores:{discreta:'Se mide y admite decimales: 21.5 °C.'},regla:R_NUM}
  ]]
};
