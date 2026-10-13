export default {
  titulo:'Vocabulario de trabajo y falsos amigos',
  resumen:'meeting, deadline, file… y palabras que engañan: actually, library.',
  explicacion:[
    'Muchas palabras de oficina y tecnología se parecen al español, pero algunas son <b>falsos amigos</b>: se parecen y significan otra cosa.',
    'Los clásicos: <b>actually</b> significa “en realidad” (“actualmente” es <i>currently</i>) y <b>library</b> es “biblioteca” (“librería” es <i>bookstore</i>).',
    'En las tarjetas, intenta decir la respuesta en voz alta antes de voltearlas y sé honesto al calificarte: lo que marques como “No la sabía” vuelve en tu repaso.'
  ],
  ejemplos:[
    ['I have a meeting with my manager.','meeting = reunión · manager = jefe, gerente'],
    ['Please send me the file by email.','file = archivo'],
    ['Actually, I work remotely.','actually = en realidad · remotely = a distancia'],
    ['The deadline is on Friday.','deadline = fecha límite']
  ],
  practica:[
    {tipo:'tarjeta',frente:'<b>deadline</b>',reverso:'fecha límite'},
    {tipo:'tarjeta',frente:'<b>to schedule</b> a meeting',reverso:'programar o agendar una reunión'},
    {tipo:'tarjeta',frente:'<b>currently</b>',reverso:'actualmente (¡no <i>actually</i>!)'},
    {tipo:'opcion',pregunta:'¿Qué significa <b>actually</b>?',opciones:['Actualmente','En realidad','Exactamente'],correcta:1},
    {tipo:'opcion',pregunta:'“Librería” en inglés es…',opciones:['library','bookstore','bookcase'],correcta:1,
     explicacion:'<i>library</i> = biblioteca; <i>bookstore</i> = librería.'},
    {tipo:'completar',pregunta:'Escribe en inglés: “reunión”',respuestas:['meeting','a meeting']}
  ]
};
