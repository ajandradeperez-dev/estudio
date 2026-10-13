export default {
  titulo:'Presente simple',
  resumen:'Rutinas y hechos: I work, she works, do / does.',
  explicacion:[
    'El presente simple se usa para <b>rutinas</b>, <b>hábitos</b> y <b>hechos</b> que siempre son ciertos.',
    'Con <b>he, she, it</b> el verbo lleva <b>-s</b>, o <b>-es</b> si termina en -o, -sh, -ch, -x o -ss (<i>goes, watches</i>). Si termina en consonante + y, cambia a <b>-ies</b>: <i>study → studies</i>.',
    'Para negar y preguntar se usa el auxiliar <b>do / does</b> y el verbo vuelve a su forma base: <i>She doesn’t work. Does she work?</i>'
  ],
  ejemplos:[
    ['I work in an office.','Yo trabajo en una oficina.'],
    ['She watches the news every morning.','watch + es → watches'],
    ['He doesn’t like coffee.','does + not + verbo base (like, no likes)'],
    ['Do you speak English?','Pregunta: Do + sujeto + verbo base']
  ],
  practica:[
    {tipo:'opcion',pregunta:'My brother ___ in a bank.',opciones:['work','works','working'],correcta:1,
     explicacion:'<i>My brother</i> equivale a <i>he</i>, así que el verbo lleva -s.'},
    {tipo:'completar',pregunta:'She ___ (study) English every day.',respuestas:['studies'],
     explicacion:'Consonante + y → -ies: study → studies.'},
    {tipo:'opcion',pregunta:'¿Cuál es la negación correcta?',opciones:['He don’t play football.','He doesn’t plays football.','He doesn’t play football.'],correcta:2,
     explicacion:'Con <i>he</i> se usa <i>doesn’t</i> y el verbo queda en forma base.'},
    {tipo:'completar',pregunta:'Completa la pregunta: ___ you live in Mexico City?',respuestas:['do'],
     explicacion:'Con <i>you</i> la pregunta se forma con <b>Do</b>.'},
    {tipo:'tarjeta',frente:'¿Cómo se dice <b>“Ella no trabaja los lunes”</b>?',reverso:'She doesn’t work on Mondays.'},
    {tipo:'opcion',pregunta:'The sun ___ in the east.',opciones:['rise','rises','is rise'],correcta:1,
     explicacion:'Es un hecho siempre cierto y el sujeto equivale a <i>it</i>: rises.'}
  ]
};
