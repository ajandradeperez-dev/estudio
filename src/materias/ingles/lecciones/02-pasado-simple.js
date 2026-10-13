export default {
  titulo:'Pasado simple',
  resumen:'Acciones terminadas: worked, went, did you…?',
  explicacion:[
    'El pasado simple habla de acciones <b>terminadas</b> en un momento del pasado: <i>yesterday, last week, in 2020</i>.',
    'Verbos regulares: se agrega <b>-ed</b> (work → worked, play → played, study → studied). Muchos verbos comunes son <b>irregulares</b> y hay que aprenderlos: go → went, see → saw, eat → ate, have → had.',
    'Para negar y preguntar se usa <b>did</b> con el verbo en forma base, igual para todas las personas: <i>I didn’t go. Did she call?</i>'
  ],
  ejemplos:[
    ['I worked from home yesterday.','work → worked (regular)'],
    ['We went to the beach last summer.','go → went (irregular)'],
    ['She didn’t see the email.','did not + verbo base (see, no saw)'],
    ['Did you finish the report?','Did + sujeto + verbo base']
  ],
  practica:[
    {tipo:'opcion',pregunta:'Yesterday I ___ to the supermarket.',opciones:['go','went','goed'],correcta:1,
     explicacion:'<i>go</i> es irregular: su pasado es <i>went</i>.'},
    {tipo:'completar',pregunta:'Last night we ___ (watch) a movie.',respuestas:['watched'],
     explicacion:'Verbo regular: watch + ed.'},
    {tipo:'opcion',pregunta:'¿Cuál es correcta?',opciones:['Did you saw the game?','Did you see the game?','Do you saw the game?'],correcta:1,
     explicacion:'Después de <i>did</i>, el verbo va en forma base.'},
    {tipo:'completar',pregunta:'She ___ (have) a meeting at 9 yesterday.',respuestas:['had'],
     explicacion:'<i>have</i> es irregular: had.'},
    {tipo:'tarjeta',frente:'Pasado de <b>eat</b>, <b>buy</b> y <b>write</b>',reverso:'ate · bought · wrote'},
    {tipo:'opcion',pregunta:'They ___ the bus this morning.',opciones:['didn’t catch','didn’t caught','don’t caught'],correcta:0,
     explicacion:'Negación en pasado: didn’t + verbo base.'}
  ]
};
