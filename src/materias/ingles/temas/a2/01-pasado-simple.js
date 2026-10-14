const R1='Regulares: -ed (consonante + y → -ied). Irregulares frecuentes: went, had, did, saw, got, made, said.';
const R2='Negativo y pregunta: did/didn’t + verbo base (sin -ed), igual para todas las personas.';

export default {
  titulo:'Pasado simple',nivel:'A2',
  resumen:'Acciones terminadas: worked, went, did you…?',
  explicacion:[
    'El pasado simple cuenta acciones <b>terminadas</b>: <i>yesterday, last week, in 2020</i>.',
    'Regulares: <b>-ed</b> (work → worked, study → studied). Los irregulares más frecuentes: go → went, have → had, do → did, see → saw, get → got, make → made, say → said.',
    'Negativo y pregunta con <b>did</b> + verbo base, para todas las personas: <i>I didn’t go. Did she call?</i>'
  ],
  ejemplos:[
    ['I worked late yesterday.','Trabajé hasta tarde ayer.'],
    ['We went to the beach.','go → went'],
    ['Did you see the email?','Did + verbo base (see, no saw)']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'Yesterday I ___ to the supermarket.',opciones:['go','went','goed'],correcta:1,
     porque:{0:'go es presente; yesterday pide pasado.',2:'go es irregular: went.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: Last night we ___ (watch) a movie.',respuestas:['watched'],
     errores:{watch:'last night pide pasado: watched.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: She ___ (have) a meeting at 9 yesterday.',respuestas:['had'],
     errores:{haved:'have es irregular: had.',has:'has es presente.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: I saw the game.',respuestas:["I didn't see the game",'I did not see the game'],
     errores:{"I didn't saw the game":'Con didn’t, verbo base: see.'},regla:R2},
    {tipo:'completar',pregunta:'Convierte en pregunta: You finished the report.',respuestas:['Did you finish the report?'],
     errores:{'Did you finished the report?':'Con did, verbo base: finish.','You finished the report?':'Falta did antes del sujeto.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'They ___ the bus this morning.',opciones:["didn't catch","didn't caught","don't caught"],correcta:0,
     porque:{1:'Después de didn’t va el verbo base.',2:'this morning ya pasó: didn’t.'},regla:R2},
    {tipo:'completar',pregunta:'Completa: He ___ (get) a new job last month.',respuestas:['got'],
     errores:{getted:'get es irregular: got.',get:'last month pide pasado.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: I ___ (study) for three hours.',respuestas:['studied'],
     errores:{studyed:'Consonante + y → -ied.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: She said yes.',respuestas:["She didn't say yes",'She did not say yes'],
     errores:{"She didn't said yes":'Con didn’t, verbo base: say.'},regla:R2},
    {tipo:'completar',pregunta:'Traduce: ¿Qué hiciste el fin de semana?',respuestas:['What did you do on the weekend?','What did you do at the weekend?','What did you do over the weekend?','What did you do this weekend?','What did you do last weekend?'],
     errores:{'What did you did on the weekend?':'Después de did, verbo base: do.','What you did on the weekend?':'Falta did antes del sujeto.'},regla:R2}
  ]]
};
