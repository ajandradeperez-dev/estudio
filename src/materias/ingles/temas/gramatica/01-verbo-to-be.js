const R1='I → am; he/she/it → is; you/we/they → are.';
const R2='Negativo: am/is/are + not (isn’t, aren’t). Pregunta: el verbo va antes del sujeto (Are you…?). Con to be no se usa do.';

export default {
  titulo:'Verbo to be',nivel:'A1',
  resumen:'El verbo más usado: I am, she is, they are.',
  explicacion:[
    '<b>To be</b> (ser o estar) es el verbo más frecuente del inglés: <b>I am</b>, <b>he/she/it is</b>, <b>you/we/they are</b>.',
    'Al hablar se contrae: I’m, you’re, he’s, she’s, it’s, we’re, they’re.',
    'Negativo: añade <b>not</b> (I’m not, he isn’t, they aren’t). Pregunta: pon el verbo antes del sujeto: <i>You are tired → Are you tired?</i> Con to be nunca se usa do.'
  ],
  ejemplos:[
    ['I’m a nurse.','Soy enfermera.'],
    ['She isn’t at home.','Ella no está en casa.'],
    ['Are they ready?','¿Están listos?']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'We ___ from Mexico.',opciones:['am','is','are'],correcta:2,
     porque:{0:'am solo va con I.',1:'is va con he, she o it; we es plural.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: My sister ___ a teacher.',respuestas:['is'],pista:'my sister = she',
     errores:{are:'My sister es una sola persona (she), no plural.',am:'am solo va con I.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: They are at work.',respuestas:["They aren't at work","They are not at work","They're not at work"],
     errores:{"They isn't at work":'They es plural: aren’t.',"They don't are at work":'Con to be no se usa do: basta con not.'},regla:R2},
    {tipo:'completar',pregunta:'Convierte en pregunta: She is your boss.',respuestas:['Is she your boss?'],
     errores:{'She is your boss?':'En la pregunta, is va antes del sujeto.','Does she is your boss?':'Con to be no se usa does.'},regla:R2},
    {tipo:'completar',pregunta:'Traduce: Estamos cansados.',respuestas:["We're tired","We are tired"],
     errores:{'We is tired':'we es plural: are.','We are tire':'cansado = tired (con -d final).'},regla:R1}
  ],[
    {tipo:'opcion',pregunta:'It ___ cold today.',opciones:['is','are','am'],correcta:0,
     porque:{1:'are va con you, we o they.',2:'am solo va con I.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: You ___ my best friend.',respuestas:['are'],
     errores:{is:'Con you siempre se usa are, aunque sea una sola persona.'},regla:R1},
    {tipo:'completar',pregunta:'Completa en negativo: He ___ (not) Canadian.',respuestas:["isn't",'is not'],
     errores:{"aren't":'he es singular: isn’t.',"don't":'Con to be no se usa don’t.',"doesn't":'Con to be no se usa doesn’t.'},regla:R2},
    {tipo:'completar',pregunta:'Convierte en pregunta: They are ready.',respuestas:['Are they ready?'],
     errores:{'They are ready?':'El verbo va antes del sujeto: Are they…?','Do they are ready?':'Con to be no se usa do.'},regla:R2},
    {tipo:'completar',pregunta:'Traduce: Ella no está aquí.',respuestas:["She isn't here","She is not here","She's not here"],
     errores:{"She don't here":'Con to be: isn’t, no don’t.','She not here':'Falta el verbo: She isn’t here.'},regla:R2}
  ]]
};
