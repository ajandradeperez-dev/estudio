const R='can + verbo base, igual para todas las personas (nunca “cans” ni “can to”). Negativo: can’t. Pregunta: Can + sujeto + verbo.';
const R_SABER='Para capacidades (saber nadar, saber conducir) se usa can, no “know”.';

export default {
  titulo:'Can y can’t',nivel:'A1',
  resumen:'Capacidad y permiso: I can swim, can you help me?',
  explicacion:[
    '<b>can</b> expresa capacidad o permiso: <i>I can swim. Can I sit here?</i>',
    'Es igual para todas las personas (nunca “cans”) y va seguido del verbo base sin <i>to</i>: <i>She can drive.</i>',
    'Negativo: <b>can’t</b> (cannot). Pregunta: <b>Can</b> + sujeto + verbo: <i>Can you help me?</i> Para “saber hacer algo” también se usa can: <i>I can’t swim</i> = no sé nadar.'
  ],
  ejemplos:[
    ['I can speak two languages.','Puedo (sé) hablar dos idiomas.'],
    ['He can’t come today.','No puede venir hoy.'],
    ['Can you open the window?','Petición educada']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'She ___ play the guitar.',opciones:['can','cans','can to'],correcta:0,
     porque:{1:'can nunca lleva -s.',2:'Después de can no va to.'},regla:R},
    {tipo:'completar',pregunta:'Completa: My dad can ___ (cook) very well.',respuestas:['cook'],
     errores:{cooks:'Después de can, verbo base sin -s.','to cook':'Después de can no va to.'},regla:R},
    {tipo:'completar',pregunta:'Escribe en negativo: I can swim.',respuestas:["I can't swim",'I cannot swim','I can not swim'],
     errores:{"I don't can swim":'can no usa don’t: su negativo es can’t.'},regla:R},
    {tipo:'completar',pregunta:'Convierte en pregunta: You can help me.',respuestas:['Can you help me?'],
     errores:{'Do you can help me?':'can forma la pregunta solo: Can you…?','You can help me?':'can va antes del sujeto.'},regla:R},
    {tipo:'completar',pregunta:'Traduce: Ella no puede venir mañana.',respuestas:["She can't come tomorrow",'She cannot come tomorrow'],
     errores:{"She can't comes tomorrow":'Después de can’t, verbo base.',"She doesn't can come tomorrow":'El negativo de can es can’t.'},regla:R}
  ],[
    {tipo:'opcion',pregunta:'___ I use your phone?',opciones:['Can','Do','Am'],correcta:0,
     porque:{1:'Para pedir permiso se usa can; do no expresa permiso.',2:'Am es del verbo to be.'},regla:R},
    {tipo:'completar',pregunta:'Completa: We ___ (not / park) here.',respuestas:["can't park",'cannot park'],
     errores:{"don't can park":'Negativo: can’t + verbo.',"can't to park":'Sin to después de can’t.'},regla:R},
    {tipo:'completar',pregunta:'Completa: He can ___ (speak) Japanese.',respuestas:['speak'],
     errores:{speaks:'Verbo base después de can.'},regla:R},
    {tipo:'completar',pregunta:'Traduce: ¿Puedes repetir, por favor?',respuestas:['Can you repeat, please?','Can you repeat that, please?'],
     errores:{'You can repeat, please?':'En la pregunta, can va primero.'},regla:R},
    {tipo:'completar',pregunta:'Traduce: No sé nadar.',respuestas:["I can't swim",'I cannot swim',"I don't know how to swim"],
     errores:{"I don't know swim":'know necesita how to delante del verbo; lo más natural es I can’t swim.',"I don't know to swim":'know necesita how to delante del verbo; lo más natural es I can’t swim.'},regla:R_SABER}
  ]]
};
