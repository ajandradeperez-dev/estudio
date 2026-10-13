export default {
  titulo:'Tipos de variables',
  resumen:'Numéricas (discretas, continuas) y categóricas (nominales, ordinales).',
  explicacion:[
    'Antes de analizar, identifica qué tipo de variable tienes: eso decide qué gráficos y cálculos tienen sentido.',
    '<b>Numéricas</b>: <i>discretas</i> si se cuentan (número de hijos) o <i>continuas</i> si se miden (estatura, temperatura). <b>Categóricas</b>: <i>nominales</i> si no tienen orden (color, país) u <i>ordinales</i> si lo tienen (talla S/M/L, nivel de satisfacción).',
    'Que algo tenga dígitos no lo hace numérico: un código postal o un número de cliente son categóricos, porque sumarlos o promediarlos no tiene sentido.'
  ],
  ejemplos:[
    ['Número de compras en un mes','Numérica discreta'],
    ['Tiempo de carga de una página (segundos)','Numérica continua'],
    ['Método de pago: tarjeta, efectivo','Categórica nominal'],
    ['Calificación: malo, regular, bueno','Categórica ordinal']
  ],
  practica:[
    {tipo:'opcion',pregunta:'La estatura de una persona es una variable…',opciones:['Numérica discreta','Numérica continua','Categórica ordinal'],correcta:1,
     explicacion:'Se mide y puede tomar cualquier valor dentro de un rango.'},
    {tipo:'opcion',pregunta:'El país de nacimiento es una variable…',opciones:['Categórica nominal','Categórica ordinal','Numérica discreta'],correcta:0,
     explicacion:'Son categorías sin un orden natural.'},
    {tipo:'opcion',pregunta:'El nivel educativo (primaria, secundaria, universidad) es una variable…',opciones:['Categórica nominal','Categórica ordinal','Numérica continua'],correcta:1,
     explicacion:'Son categorías con un orden.'},
    {tipo:'opcion',pregunta:'Un código postal (por ejemplo, 06700) es una variable…',opciones:['Numérica continua','Categórica','Numérica discreta'],correcta:1,
     explicacion:'Aunque tiene dígitos, no tiene sentido sumarlo ni promediarlo.'},
    {tipo:'completar',pregunta:'El número de visitas a una web por día es una variable numérica ___ (discreta o continua).',respuestas:['discreta'],
     explicacion:'Las visitas se cuentan: 0, 1, 2…'},
    {tipo:'tarjeta',frente:'¿Qué gráfico usarías para una variable categórica nominal?',reverso:'Un gráfico de barras (frecuencia por categoría). Para una numérica continua, un histograma.'}
  ]
};
