/* Contenido de cada unidad para las vertientes que no son lecciones:
   escucha   input comprensible: texto corto en inglés (~95–98 % de palabras ya vistas en la unidad) que se escucha
             (normal o lento) y preguntas de comprensión escritas (formato común: respuestas, errores, regla)
   chunks    frases hechas útiles de la unidad, para repetir en voz alta (en, es, uso)
   fluidez   tema para el 4-3-2 (contar lo mismo en 60, 45 y 30 s) con una guía de ideas
   El repaso guarda 'e/<unidad>/<pregunta>' y 'c/<unidad>/<chunk>': agrega elementos nuevos al final de cada lista. */

export const CONTENIDO={
  'presentarte':{
    escucha:{titulo:'Laura se presenta',
      texto:"Hi, I'm Laura. I'm from Bogotá, in Colombia, but I live in Toronto now. I'm a nurse, and I work at a big hospital. I'm thirty-two years old. My husband is from Canada. His name is Mark, and he's a teacher. We have a dog called Max. I'm learning English because I want to get a better job. Nice to meet you!",
      preguntas:[
        {tipo:'completar',pregunta:'¿De dónde es Laura? (ciudad)',respuestas:['Bogotá','Bogota, Colombia','Colombia'],errores:{Toronto:'Vive en Toronto, pero es de Bogotá: I\'m from Bogotá.'},regla:'I\'m from… = de dónde eres; I live in… = dónde vives ahora.'},
        {tipo:'completar',pregunta:'¿Cuál es su trabajo? (en inglés)',respuestas:['nurse','a nurse','she is a nurse'],errores:{teacher:'Teacher es Mark, su esposo.','a teacher':'Teacher es Mark, su esposo.'},regla:'Las profesiones llevan a/an: I\'m a nurse.'},
        {tipo:'completar',pregunta:'¿Cuántos años tiene? (número)',respuestas:['32','thirty-two'],errores:{'23':'Dijo thirty-two: 32 (las decenas van primero).','30':'Dijo thirty-two: 32.'},regla:'La edad va con to be: I\'m 32 (years old). Nunca "I have 32 years".'},
        {tipo:'completar',pregunta:'Completa por qué aprende inglés: because she wants to get a better ___',respuestas:['job'],errores:{work:'Dijo a better job: job es contable (a job); work no lleva a.'},regla:'want to + verbo: I want to get a better job.'}
      ]},
    chunks:[
      {en:'Nice to meet you.',es:'Mucho gusto.',uso:'Al conocer a alguien'},
      {en:"I'm from Mexico, but I live in Madrid.",es:'Soy de México, pero vivo en Madrid.',uso:'Origen y dónde vives'},
      {en:'I work as a developer.',es:'Trabajo como desarrollador.',uso:'Tu trabajo (work as)'},
      {en:"I'm learning English for work.",es:'Estoy aprendiendo inglés por trabajo.',uso:'Por qué estudias'},
      {en:'What do you do?',es:'¿A qué te dedicas?',uso:'Preguntar por el trabajo'},
      {en:'Where are you from?',es:'¿De dónde eres?',uso:'Preguntar el origen'},
      {en:'How about you?',es:'¿Y tú?',uso:'Devolver la pregunta'},
      {en:'See you later.',es:'Nos vemos.',uso:'Despedirte'}
    ],
    fluidez:{tema:'Preséntate',guia:['Tu nombre y de dónde eres','Dónde vives y a qué te dedicas','Por qué aprendes inglés']}
  },
  'rutina-trabajo':{
    escucha:{titulo:'Un día de Tom',
      texto:"Tom works in an office downtown. He gets up at six thirty every day and takes the bus to work. He starts at eight. In the morning he answers emails and has meetings. At one o'clock he has lunch with his team. He finishes work at five. On weekends he doesn't work. He plays soccer on Saturdays and visits his parents on Sundays.",
      preguntas:[
        {tipo:'completar',pregunta:'¿A qué hora se levanta Tom? (por ejemplo, 7:15)',respuestas:['6:30','6.30','six thirty','half past six'],errores:{'6':'Dijo six thirty: 6:30.','7:30':'Dijo six thirty: 6:30.'},regla:'La hora: six thirty = 6:30. Levantarse = get up.'},
        {tipo:'completar',pregunta:'¿Cómo va al trabajo? Completa: He takes the ___',respuestas:['bus'],errores:{train:'Dijo the bus.',car:'Dijo the bus.'},regla:'Transporte: take the bus / the train.'},
        {tipo:'completar',pregunta:'¿Qué hace los sábados? Completa: He plays ___',respuestas:['soccer','football'],errores:{'the soccer':'Los deportes van sin artículo: play soccer.',tennis:'Dijo soccer.'},regla:'Deportes sin artículo: play soccer, play tennis.'},
        {tipo:'completar',pregunta:'¿Trabaja los fines de semana? Responde con una respuesta corta en inglés.',respuestas:["No, he doesn't",'No, he does not'],errores:{"No, he don't":'Con he se usa doesn\'t.',"No, he isn't":'La pregunta es con does: No, he doesn\'t.',"Yes, he does":'Dijo: On weekends he doesn\'t work.'},regla:'Respuestas cortas con does: Yes, he does / No, he doesn\'t.'}
      ]},
    chunks:[
      {en:'I usually start work at nine.',es:'Normalmente empiezo a trabajar a las nueve.',uso:'Tu horario'},
      {en:'I take the bus to work.',es:'Voy al trabajo en autobús.',uso:'Cómo vas al trabajo'},
      {en:'I have a meeting at ten.',es:'Tengo una reunión a las diez.',uso:'Tu agenda'},
      {en:'What time do you finish?',es:'¿A qué hora terminas?',uso:'Preguntar el horario'},
      {en:'On weekends I relax at home.',es:'Los fines de semana descanso en casa.',uso:'Tu tiempo libre'},
      {en:"I'm busy today.",es:'Hoy estoy ocupado.',uso:'Decir que tienes trabajo'},
      {en:'How was your weekend?',es:'¿Qué tal tu fin de semana?',uso:'Small talk del lunes'},
      {en:'Not bad, thanks.',es:'Nada mal, gracias.',uso:'Responder sin entrar en detalles'}
    ],
    fluidez:{tema:'Describe un día normal',guia:['A qué hora te levantas y cómo vas al trabajo','Qué haces en la mañana y en la tarde','Qué haces los fines de semana']}
  },
  'pedir-comprar':{
    escucha:{titulo:'Una cena en Nueva York',
      texto:"Waiter: Good evening. Are you ready to order? Customer: Yes. Can I have the chicken soup and a green salad, please? Waiter: Sure. Anything to drink? Customer: Just water, please. Waiter: Would you like dessert? Customer: No, thank you. Can I have the check, please? Waiter: Of course. That's twenty-four dollars.",
      preguntas:[
        {tipo:'completar',pregunta:'¿Qué sopa pide? Completa: the ___ soup',respuestas:['chicken'],errores:{tomato:'Dijo chicken soup.'},regla:'El sustantivo que describe va antes: chicken soup (sopa de pollo).'},
        {tipo:'completar',pregunta:'¿Qué toma? Completa: Just ___, please.',respuestas:['water'],errores:{coffee:'Dijo just water.'},regla:'Just + cosa = solo eso: Just water, please.'},
        {tipo:'completar',pregunta:'¿Cuánto paga? (número)',respuestas:['24','twenty-four','$24','24 dollars'],errores:{'42':'Dijo twenty-four: 24 (no 42).','20':'Dijo twenty-four: 24.'},regla:'twenty-four = 24: las decenas primero, como en español.'},
        {tipo:'completar',pregunta:'Escribe la frase con la que pide la cuenta.',respuestas:['Can I have the check, please?','Can I have the check?'],errores:{'Can I have the account, please?':'La cuenta del restaurante es the check (o the bill); account es una cuenta bancaria.'},regla:'Pedir la cuenta: Can I have the check, please?'}
      ]},
    chunks:[
      {en:'Can I have the menu, please?',es:'¿Me da la carta, por favor?',uso:'Al sentarte'},
      {en:"I'd like the soup, please.",es:'Quisiera la sopa, por favor.',uso:'Pedir un plato'},
      {en:'Could I have some water?',es:'¿Me podría dar agua?',uso:'Pedir algo con cortesía'},
      {en:'How much is it?',es:'¿Cuánto cuesta?',uso:'Preguntar el precio'},
      {en:'Can I pay by card?',es:'¿Puedo pagar con tarjeta?',uso:'Al pagar (by card)'},
      {en:"I'm just looking, thanks.",es:'Solo estoy mirando, gracias.',uso:'En una tienda'},
      {en:'Do you have this in a medium?',es:'¿Tiene esto en mediana?',uso:'Preguntar por una talla'},
      {en:'Can I have the check, please?',es:'¿Me trae la cuenta, por favor?',uso:'Al terminar de comer'}
    ],
    fluidez:{tema:'Pide una comida completa',guia:['Saluda y pide un plato','Pide una bebida y pregunta el precio','Pide la cuenta y despídete']}
  },
  'ciudad-viajes':{
    escucha:{titulo:'¿Hay una farmacia cerca?',
      texto:"Excuse me, is there a pharmacy near here? Yes, there is. Go straight on Main Street and turn right at the bank. The pharmacy is next to a small café. It's about five minutes on foot. There are two pharmacies, but the other one is far away. Thank you! You're welcome. And be careful: they're working on the road today, so it's a bit noisy.",
      preguntas:[
        {tipo:'completar',pregunta:'¿Qué busca la persona? Completa: a ___',respuestas:['pharmacy','drugstore'],errores:{bank:'El banco es solo la referencia para girar.'},regla:'¿Hay un/una…? = Is there a…?'},
        {tipo:'completar',pregunta:'¿Hacia dónde gira en el banco? (left o right)',respuestas:['right'],errores:{left:'Dijo turn right (a la derecha).'},regla:'turn right = gira a la derecha; turn left = a la izquierda.'},
        {tipo:'completar',pregunta:'¿Qué hay junto a la farmacia? Completa: a small ___',respuestas:['café','coffee shop'],errores:{bank:'En el banco giras; junto a la farmacia hay un café.'},regla:'next to = junto a.'},
        {tipo:'completar',pregunta:'¿Por qué hay ruido hoy? Completa: they\'re ___ on the road',respuestas:['working'],errores:{work:'Es algo que pasa ahora: they\'re working.'},regla:'Algo que pasa ahora: am/is/are + verbo-ing.'}
      ]},
    chunks:[
      {en:'Excuse me, is there a pharmacy near here?',es:'Disculpe, ¿hay una farmacia cerca?',uso:'Preguntar por un lugar'},
      {en:'How do I get to the station?',es:'¿Cómo llego a la estación?',uso:'Pedir direcciones'},
      {en:'Turn left at the corner.',es:'Gira a la izquierda en la esquina.',uso:'Dar indicaciones'},
      {en:"It's next to the bank.",es:'Está junto al banco.',uso:'Decir dónde está algo'},
      {en:'Is it far from here?',es:'¿Está lejos de aquí?',uso:'Preguntar la distancia'},
      {en:"I'm looking for my gate.",es:'Estoy buscando mi puerta de embarque.',uso:'En el aeropuerto'},
      {en:'Is the flight on time?',es:'¿El vuelo va a tiempo?',uso:'En el aeropuerto'},
      {en:'Where can I get a taxi?',es:'¿Dónde puedo tomar un taxi?',uso:'Al llegar a una ciudad'}
    ],
    fluidez:{tema:'Explica cómo llegar de tu casa a un lugar cercano',guia:['Qué lugar es y qué hay cerca','Las indicaciones: derecho, izquierda, derecha','Cuánto tiempo se tarda']}
  },
  'contar-pasado':{
    escucha:{titulo:'Un lunes en casa',
      texto:"Last Monday I didn't feel well. I had a terrible headache and a sore throat, so I called my boss and stayed at home. In the afternoon I went to the doctor. She asked me some questions and gave me some medicine. I slept a lot that night. On Wednesday I felt much better, and I went back to work.",
      preguntas:[
        {tipo:'completar',pregunta:'¿Qué día se sintió mal? (en inglés)',respuestas:['Monday','last Monday','on Monday'],errores:{Wednesday:'El miércoles ya se sentía mejor.'},regla:'Last Monday = el lunes pasado; los días van con on: on Monday.'},
        {tipo:'completar',pregunta:'¿Qué le dolía además de la garganta? Completa: a terrible ___',respuestas:['headache'],errores:{head:'Dolor de cabeza es una palabra: headache.',stomachache:'Dijo headache (dolor de cabeza).'},regla:'Dolores con -ache: headache, stomachache, backache.'},
        {tipo:'completar',pregunta:'Escribe el pasado de go que aparece en el audio.',respuestas:['went'],errores:{goed:'go es irregular: went.',go:'Está en pasado: went.'},regla:'Irregulares frecuentes: go → went, have → had, feel → felt.'},
        {tipo:'completar',pregunta:'¿Cuándo volvió al trabajo? (en inglés)',respuestas:['Wednesday','on Wednesday'],errores:{Monday:'El lunes se quedó en casa.'},regla:'went back = volvió (go back en pasado).'}
      ]},
    chunks:[
      {en:"I didn't feel well yesterday.",es:'Ayer no me sentía bien.',uso:'Contar que estuviste enfermo'},
      {en:'I have a headache.',es:'Me duele la cabeza.',uso:'En el doctor'},
      {en:'It started two days ago.',es:'Empezó hace dos días.',uso:'Decir desde cuándo (ago)'},
      {en:'I called my boss and stayed home.',es:'Llamé a mi jefe y me quedé en casa.',uso:'Contar lo que hiciste'},
      {en:'What happened?',es:'¿Qué pasó?',uso:'Preguntar por algo pasado'},
      {en:"I'm feeling much better now.",es:'Ya me siento mucho mejor.',uso:'Decir que mejoraste'},
      {en:'Could I speak to Mr. Brown, please?',es:'¿Podría hablar con el señor Brown?',uso:'Al teléfono'},
      {en:'Can I leave a message?',es:'¿Puedo dejar un mensaje?',uso:'Al teléfono'}
    ],
    fluidez:{tema:'Cuenta qué hiciste el fin de semana pasado',guia:['Qué hiciste el sábado','Qué hiciste el domingo','Qué fue lo mejor (en pasado)']}
  },
  'trabajo-ti':{
    escucha:{titulo:'Daniel, soporte de TI',
      texto:"Hi, I'm Daniel. I work in IT support for a small company. Yesterday our email server stopped working, so I spent the morning on the phone with users. Today I'm checking the logs to find the problem. Next week we're going to move the server to the cloud. I think it will be faster and safer. In the future, I want to work in cybersecurity.",
      preguntas:[
        {tipo:'completar',pregunta:'¿En qué trabaja Daniel? Completa: IT ___',respuestas:['support'],errores:{security:'Hoy trabaja en IT support; quiere pasar a cybersecurity en el futuro.'},regla:'IT support = soporte de TI.'},
        {tipo:'completar',pregunta:'¿Qué dejó de funcionar ayer? Completa: the email ___',respuestas:['server'],errores:{service:'Dijo the email server.'},regla:'stopped working = dejó de funcionar (stop + verbo-ing).'},
        {tipo:'completar',pregunta:'¿Qué van a hacer la próxima semana? Completa: move the server to the ___',respuestas:['cloud'],errores:{class:'Dijo the cloud (la nube).'},regla:'Plan decidido: be going to + verbo (we\'re going to move).'},
        {tipo:'completar',pregunta:'¿En qué área quiere trabajar en el futuro? (en inglés)',respuestas:['cybersecurity','cyber security','security'],errores:{support:'Ya trabaja en soporte; quiere pasar a cybersecurity.'},regla:'Deseos para el futuro: I want to work in + área.'}
      ]},
    chunks:[
      {en:'I work in IT support.',es:'Trabajo en soporte de TI.',uso:'Presentar tu trabajo'},
      {en:'The server stopped working.',es:'El servidor dejó de funcionar.',uso:'Reportar un problema'},
      {en:"I'm checking the logs.",es:'Estoy revisando los registros.',uso:'Decir qué estás haciendo'},
      {en:"We're going to move it to the cloud.",es:'Lo vamos a pasar a la nube.',uso:'Planes del equipo'},
      {en:"I'll send you an update.",es:'Te mando una actualización.',uso:'Comprometerte a algo'},
      {en:'Could you restart your computer?',es:'¿Podrías reiniciar tu computadora?',uso:'Dar soporte'},
      {en:'It depends on the problem.',es:'Depende del problema.',uso:'Responder con matices'},
      {en:"I'm good at solving problems.",es:'Soy bueno resolviendo problemas.',uso:'En una entrevista'}
    ],
    fluidez:{tema:'Explica tu trabajo (o el que quieres) y un problema que resolviste',guia:['Qué haces en tu trabajo','Un problema que tuviste y qué hiciste (en pasado)','Qué vas a hacer o aprender después (en futuro)']}
  }
};
