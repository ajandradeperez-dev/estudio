const R_FA='Falsos amigos: actually = en realidad; currently = actualmente; attend = asistir; assist = ayudar; library = biblioteca; bookstore = librería; career = trayectoria; degree = carrera universitaria.';
const R_V='Vocabulario de trabajo: meeting = reunión; deadline = fecha límite; schedule = agendar; file = archivo.';

export default {
  titulo:'Vocabulario de trabajo y falsos amigos',nivel:'A2',
  resumen:'meeting, deadline, file… y palabras que engañan: actually, attend.',
  explicacion:[
    'Estas son palabras de trabajo de uso diario. Ojo con los <b>falsos amigos</b>: parecen españolas y significan otra cosa.',
    '<b>actually</b> = en realidad (actualmente = <i>currently</i>). <b>attend</b> = asistir a (<i>assist</i> = ayudar). <b>library</b> = biblioteca (librería = <i>bookstore</i>). <b>career</b> = trayectoria profesional (carrera universitaria = <i>degree</i>).',
    'Muy frecuentes: <b>meeting</b> (reunión), <b>deadline</b> (fecha límite), <b>schedule</b> (agendar), <b>file</b> (archivo).'
  ],
  ejemplos:[
    ['I have a meeting with my manager.','reunión con mi jefe'],
    ['The deadline is on Friday.','La fecha límite es el viernes.'],
    ['Actually, I work remotely.','En realidad, trabajo a distancia.']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Qué significa <b>actually</b>?',opciones:['Actualmente','En realidad','Exactamente'],correcta:1,
     porque:{0:'Falso amigo: actualmente = currently.',2:'Exactamente = exactly.'},regla:R_FA},
    {tipo:'completar',pregunta:'Traduce: reunión (de trabajo)',respuestas:['meeting','a meeting'],
     errores:{reunion:'En inglés, reunion es un reencuentro (de exalumnos, de familia).'},regla:R_V},
    {tipo:'completar',pregunta:'Traduce: fecha límite',respuestas:['deadline','a deadline'],
     errores:{'limit date':'Se dice deadline.'},regla:R_V},
    {tipo:'completar',pregunta:'Traduce: Actualmente trabajo en ventas.',respuestas:['I currently work in sales','Currently, I work in sales',"I'm currently working in sales",'I am currently working in sales'],
     errores:{'Actually I work in sales':'actually = en realidad; actualmente = currently.','Actually, I work in sales':'actually = en realidad; actualmente = currently.'},regla:R_FA},
    {tipo:'completar',pregunta:'Traduce: Voy a asistir a la conferencia.',respuestas:["I'm going to attend the conference",'I am going to attend the conference',"I'll attend the conference",'I will attend the conference'],
     errores:{"I'm going to assist the conference":'assist = ayudar; asistir a = attend.',"I'm going to assist to the conference":'assist = ayudar; asistir a = attend (sin to).'},regla:R_FA}
  ],[
    {tipo:'opcion',pregunta:'“Librería” en inglés es…',opciones:['library','bookstore','bookcase'],correcta:1,
     porque:{0:'Falso amigo: library = biblioteca.',2:'bookcase = estantería.'},regla:R_FA},
    {tipo:'completar',pregunta:'Traduce: archivo (de computadora)',respuestas:['file','a file'],
     errores:{archive:'archive es un archivo histórico; el de la computadora es file.'},regla:R_V},
    {tipo:'completar',pregunta:'Traduce: Necesito agendar una reunión.',respuestas:['I need to schedule a meeting'],
     errores:{'I need schedule a meeting':'need + to + verbo: need to schedule.','I need to schedule a reunion':'reunión de trabajo = meeting.'},regla:R_V},
    {tipo:'completar',pregunta:'Traduce: Estudié la carrera de Derecho.',respuestas:['I studied law','I have a law degree','I have a degree in law'],
     errores:{'I studied the career of law':'career = trayectoria profesional; para estudios se dice I studied law.','I studied the law career':'career = trayectoria profesional; para estudios se dice I studied law.'},regla:R_FA},
    {tipo:'completar',pregunta:'Traduce: En realidad, no estoy de acuerdo.',respuestas:["Actually, I don't agree",'Actually, I disagree'],
     errores:{"Currently, I don't agree":'currently = actualmente; en realidad = actually.',"Actually, I'm not agree":'agree es un verbo: I don’t agree.',"Actually, I am not agree":'agree es un verbo: I don’t agree.'},regla:R_FA}
  ]]
};
