const R1='am/is/are + verbo-ing para lo que pasa ahora o en estos días.';
const R2='-e final se quita (make → making); una sílaba con consonante-vocal-consonante duplica la última (run → running).';
const R3='Rutina (usually, every day) → presente simple; ahora o estos días → presente continuo.';

export default {
  titulo:'Presente continuo',nivel:'A1–A2',
  resumen:'Lo que pasa ahora: I’m working, what are you doing?',
  explicacion:[
    'El presente continuo describe lo que pasa <b>ahora</b> o en estos días: <b>am/is/are + verbo-ing</b>. <i>I’m working. They’re studying for an exam.</i>',
    'Ortografía: si el verbo acaba en -e, se quita (make → making); si tiene una sílaba con consonante-vocal-consonante, se duplica la última (run → running).',
    'No lo confundas con la rutina: <i>I work in a bank</i> (siempre) frente a <i>I’m working from home today</i> (hoy).'
  ],
  ejemplos:[
    ['She’s talking on the phone.','Está hablando por teléfono (ahora).'],
    ['We aren’t watching TV.','No estamos viendo la tele.'],
    ['What are you doing?','¿Qué estás haciendo?']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'Look! It ___.',opciones:['rains','is raining','raining'],correcta:1,
     porque:{0:'rains es rutina; “Look!” indica que pasa ahora.',2:'Falta is: It is raining.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: I ___ (read) a good book these days.',respuestas:["'m reading",'am reading'],
     errores:{reading:'Falta am: I’m reading.',read:'Para “estos días” se usa am + -ing.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe la forma -ing de make.',respuestas:['making'],
     errores:{makeing:'La -e final se quita: making.'},regla:R2},
    {tipo:'completar',pregunta:'Escribe la forma -ing de run.',respuestas:['running'],
     errores:{runing:'Consonante-vocal-consonante: se duplica la n.'},regla:R2},
    {tipo:'completar',pregunta:'Traduce: ¿Qué estás haciendo?',respuestas:['What are you doing?'],
     errores:{'What do you doing?':'Presente continuo: are + -ing.','What you are doing?':'En la pregunta, are va antes de you.'},regla:R1}
  ],[
    {tipo:'opcion',pregunta:'Listen, the baby ___.',opciones:['cries','is crying','cry'],correcta:1,
     porque:{0:'cries es rutina; “Listen” indica ahora.',2:'Falta is y la forma -ing.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: They ___ (not / work) today.',respuestas:["aren't working",'are not working',"'re not working"],
     errores:{"don't working":'Negativo: aren’t + -ing.',"isn't working":'They es plural: aren’t.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe la forma -ing de swim.',respuestas:['swimming'],
     errores:{swiming:'Consonante-vocal-consonante: se duplica la m.'},regla:R2},
    {tipo:'completar',pregunta:'Completa: She usually ___ (drive) to work.',respuestas:['drives'],
     errores:{'is driving':'usually indica rutina: presente simple.',drive:'she lleva -s.'},regla:R3},
    {tipo:'completar',pregunta:'Traduce: Estoy trabajando desde casa hoy.',respuestas:["I'm working from home today",'I am working from home today'],
     errores:{'I work from home today':'“Hoy, ahora” → presente continuo: I’m working.'},regla:R3}
  ]]
};
