const R1='there is + singular o no contable; there are + plural. Pregunta: Is there…? / Are there…?';
const R2='some en afirmativo; any en negativo y en preguntas.';

export default {
  titulo:'There is / there are',nivel:'A1',
  resumen:'Decir qué hay: there is a bank, there are two exits.',
  explicacion:[
    '<b>There is</b> (singular) y <b>there are</b> (plural) significan “hay”: <i>There is a bank near here. There are two exits.</i>',
    'Negativo: there isn’t / there aren’t. Pregunta: <i>Is there…? Are there…?</i>',
    'Con plurales y no contables (water, money, milk) se usa <b>some</b> en afirmativo y <b>any</b> en negativo y preguntas. Los no contables van en singular: <i>There isn’t any water.</i>'
  ],
  ejemplos:[
    ['There is a meeting at 3.','Hay una reunión a las 3.'],
    ['There aren’t any eggs.','No hay huevos.'],
    ['Is there a pharmacy near here?','¿Hay una farmacia cerca?']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'There ___ three people in the room.',opciones:['is','are','have'],correcta:1,
     porque:{0:'three people es plural: are.',2:'“Hay” no se dice have: there are.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: There ___ a problem with the printer.',respuestas:['is',"'s"],
     errores:{are:'a problem es singular: is.'},regla:R1},
    {tipo:'completar',pregunta:'Completa con some o any: There aren’t ___ tickets left.',respuestas:['any'],
     errores:{some:'En negativo se usa any.'},regla:R2},
    {tipo:'completar',pregunta:'Convierte en pregunta: There is a bus stop here.',respuestas:['Is there a bus stop here?'],
     errores:{'There is a bus stop here?':'En la pregunta, is va antes de there.'},regla:R1},
    {tipo:'completar',pregunta:'Traduce: Hay dos baños.',respuestas:['There are two bathrooms','There are two restrooms','There are two toilets'],
     errores:{'There is two bathrooms':'Plural: there are.','Have two bathrooms':'“Hay” = there is / there are.'},regla:R1}
  ],[
    {tipo:'opcion',pregunta:'___ there any milk?',opciones:['Is','Are','Do'],correcta:0,
     porque:{1:'milk es no contable: va en singular (is).',2:'Con there no se usa do.'},regla:R1},
    {tipo:'completar',pregunta:'Completa con some o any: There are ___ apples on the table.',respuestas:['some'],
     errores:{any:'En afirmativo se usa some.'},regla:R2},
    {tipo:'completar',pregunta:'Escribe en negativo: There is a gym in the hotel.',respuestas:["There isn't a gym in the hotel",'There is not a gym in the hotel'],
     errores:{"There aren't a gym in the hotel":'a gym es singular: isn’t.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: ___ there any questions?',respuestas:['Are'],
     errores:{Is:'questions es plural: Are.'},regla:R1},
    {tipo:'completar',pregunta:'Traduce: No hay nada de agua.',respuestas:["There isn't any water",'There is not any water',"There's no water",'There is no water'],
     errores:{"There aren't any water":'water es no contable: va en singular, isn’t.',"There isn't some water":'En negativo se usa any.'},regla:R2}
  ]]
};
