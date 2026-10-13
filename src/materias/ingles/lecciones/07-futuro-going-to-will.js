const R1='going to: planes ya decididos o algo que se ve venir. will: decisión en el momento, promesa o predicción.';
const R2='will / won’t + verbo base, igual para todas las personas y sin to.';

export default {
  titulo:'Futuro: going to y will',nivel:'A2',
  resumen:'Planes, decisiones y predicciones.',
  explicacion:[
    '<b>going to</b> + verbo: planes ya decididos y lo que se ve venir. <i>I’m going to visit my parents. Look at those clouds: it’s going to rain.</i>',
    '<b>will</b> + verbo: decisiones en el momento, promesas y predicciones. <i>I’ll call you later. I think she’ll win.</i>',
    'Negativo: <i>not going to</i> y <b>won’t</b>. will no cambia con la persona y va sin <i>to</i>.'
  ],
  ejemplos:[
    ['We’re going to move in June.','Plan ya decidido'],
    ['I’ll help you with that.','Decisión en el momento'],
    ['It won’t take long.','won’t = will not']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'The phone is ringing. — I ___ answer it.',opciones:["'ll","'m going to",'will to'],correcta:0,
     porque:{1:'Lo decides en ese momento: will.',2:'Después de will no va to.'},regla:R1},
    {tipo:'completar',pregunta:'Completa (plan ya decidido): I ___ (start) a course next month.',respuestas:["'m going to start",'am going to start'],
     errores:{'will start':'Es un plan ya decidido: going to.','going to start':'Falta am: I’m going to.'},regla:R1},
    {tipo:'completar',pregunta:'Completa (promesa): Don’t worry, I ___ (not / tell) anyone.',respuestas:["won't tell",'will not tell'],
     errores:{"don't tell":'Promesa sobre el futuro: won’t.',"won't to tell":'Sin to después de won’t.'},regla:R2},
    {tipo:'completar',pregunta:'Completa: Look at those clouds! It ___ (rain).',respuestas:["'s going to rain",'is going to rain'],
     errores:{'will rain':'Hay una evidencia (las nubes): going to.'},regla:R1},
    {tipo:'completar',pregunta:'Traduce (decisión en el momento): Te llamo más tarde.',respuestas:["I'll call you later",'I will call you later'],
     errores:{'I call you later':'Para el futuro: I’ll call you later.'},regla:R1}
  ],[
    {tipo:'opcion',pregunta:'I think Brazil ___ the match.',opciones:['will win','wins','will wins'],correcta:0,
     porque:{1:'Es una predicción sobre el futuro: will.',2:'Después de will, verbo base.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: She ___ (be) 30 next year.',respuestas:["'ll be",'will be'],
     errores:{'will is':'will + verbo base: be.','will to be':'Sin to después de will.'},regla:R2},
    {tipo:'completar',pregunta:'Completa (plan ya decidido): We ___ (buy) a car this year.',respuestas:["'re going to buy",'are going to buy'],
     errores:{'will buy':'Es un plan decidido: going to.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: They are going to come.',respuestas:["They aren't going to come",'They are not going to come',"They're not going to come"],
     errores:{"They don't going to come":'Negativo: aren’t going to.'},regla:R1},
    {tipo:'completar',pregunta:'Traduce: No tardará mucho.',respuestas:["It won't take long",'It will not take long'],
     errores:{"It won't takes long":'Después de won’t, verbo base.'},regla:R2}
  ]]
};
