/* Escenarios integradores de Inglés: una situación real resuelta en 4 pasos con lo de todo el nivel (sin DOM).
   Cada caso tiene variantes (nombres, lugares, horas) para que cada intento sea distinto. */
import {txt,paso,final,marca,en} from './extensiones/ingles-base.js';

const ctx=t=>`<p class="contexto">${t}</p>`;
const q=(contexto,paso1,{enunciado,acepta,errores,regla,x})=>({...txt({enunciado:ctx(contexto)+enunciado,acepta,errores,regla,pista:'Piensa qué necesitas lograr en este paso.',
  pasos:[paso('¿Qué pide este paso?',paso1,'Cada paso del caso usa algo distinto del nivel.'),final('Escribe la respuesta',marca(acepta[0]),x)]}),profundidad:'escenario'});

// A1 · Tu primer día en la oficina: saludar y presentarte, preguntar dónde está algo, pedir de comer y despedirte
export function escenarioPrimerDia(rng){
  const [jefa,ciudad,lugar]=rng.elegir([['Ms. Brown','Puebla','the kitchen'],['Ms. Lee','Cali','the printer'],['Ms. Carter','Rosario','the meeting room']]),hora=rng.elegir([['5','five'],['6','six']]);
  const C=`Es tu primer día en una empresa en Toronto. Te recibe tu jefa, ${jefa}.`;
  return [
    q(C,'Saludar y presentarte',{enunciado:`1/4 · ${jefa} dice «Hi! Welcome. I'm your manager.». Salúdala, di tu nombre (usa «Alex») y que eres de ${ciudad}.`,
      acepta:[`Hi, I'm Alex. I'm from ${ciudad}`,`Hello, I'm Alex. I'm from ${ciudad}`,`Hi, my name is Alex and I'm from ${ciudad}`,`Hello, my name is Alex. I'm from ${ciudad}`,`Hi, I'm Alex and I'm from ${ciudad}`,`Nice to meet you, I'm Alex. I'm from ${ciudad}`,`Hi, nice to meet you. I'm Alex and I'm from ${ciudad}`,`Hi, my name's Alex. I'm from ${ciudad}`],
      errores:[[`Hi, I call Alex. I'm from ${ciudad}`,'«Me llamo» = I\'m / My name is.'],[`Hi, I'm Alex. I'm of ${ciudad}`,'Origen: from.']],regla:'I\'m + nombre; I\'m from + lugar.',x:'Saludo + nombre + origen.'}),
    q(C,'Preguntar dónde está algo',{enunciado:`2/4 · Pregunta dónde está ${lugar.replace('the ','la ').replace('kitchen','cocina').replace('printer','impresora').replace('meeting room','sala de juntas')}.`,
      acepta:[`Where is ${lugar}?`,`Excuse me, where is ${lugar}?`,`Sorry, where is ${lugar}?`],errores:[[`Where ${lugar} is?`,'En la pregunta: Where is…?'],[`Where are ${lugar}?`,'Es una sola cosa: is.']],regla:'Where is + lugar?',x:'Where is…?'}),
    q(C,'Pedir algo en la cafetería',{enunciado:'3/4 · A mediodía, en la cafetería, pide un sándwich y un agua de forma educada.',
      acepta:["Can I have a sandwich and a water, please?","I'd like a sandwich and a water, please","Can I have a sandwich and a bottle of water, please?","I'd like a sandwich and a bottle of water, please","A sandwich and a water, please","Could I have a sandwich and a water, please?","Can I get a sandwich and a water, please?"],
      errores:[['I want a sandwich and a water','Al pedir suena brusco: usa I\'d like o Can I have…, please?']],regla:'Can I have… / I\'d like…, please.',x:'Pide con cortesía.'}),
    q(C,'Despedirte y confirmar la hora',{enunciado:`4/4 · Terminas a las ${hora[0]}. Despídete: «nos vemos mañana a las 9».`,
      acepta:['See you tomorrow at 9','See you tomorrow at nine','See you tomorrow at 9 a.m.',"See you tomorrow at nine o'clock","See you tomorrow at 9 o'clock"],errores:[['See you tomorrow in 9','Con la hora: at.'],['We see tomorrow at 9','Se dice See you…']],regla:'See you + cuándo; la hora con at.',x:'See you tomorrow at 9.'})
  ];
}

// A2 · Viaje de trabajo: vuelo retrasado, aviso al cliente, hotel e indicaciones, y contar cómo te fue
export function escenarioViaje(rng){
  const [ciudad,apellido,horas]=rng.elegir([['Chicago','Rivera','two'],['Boston','Morales','three'],['Denver','Castro','two']]);
  const C=`Viajas a ${ciudad} por trabajo. Tu vuelo sale a las 8 a.m.`;
  return [
    q(C,'Entender el aviso del aeropuerto',{enunciado:`1/4 · En la pantalla dice: «Flight 214 to ${ciudad} – DELAYED – new time 10:00». ¿A qué hora sale tu vuelo ahora? (en inglés, una frase)`,
      acepta:["It leaves at 10","It leaves at ten","At 10","At 10 a.m.","It's leaving at 10","The flight leaves at 10","It will leave at 10","At ten o'clock"],errores:[['It leaves at 8','Ese era el horario original: ahora es a las 10.']],regla:'delayed = retrasado; new time = nuevo horario.',x:'El vuelo está retrasado hasta las 10.'}),
    q(C,'Avisar al cliente',{enunciado:`2/4 · Escribe al cliente: «mi vuelo está retrasado, llegaré ${horas==='two'?'dos':'tres'} horas tarde».`,
      acepta:[`My flight is delayed. I'll be ${horas} hours late`,`My flight is delayed, so I'll be ${horas} hours late`,`My flight is delayed, I'll arrive ${horas} hours late`,`My flight is delayed. I'll arrive ${horas} hours late`,`My flight's delayed. I'll be ${horas} hours late`,`My flight is delayed and I'll be ${horas} hours late`],
      errores:[[`My flight is retarded. I'll be ${horas} hours late`,'Retrasado (vuelo) es delayed.'],[`My flight is delayed. I arrive ${horas} hours late`,'Para avisar lo que pasará: I\'ll arrive / I\'ll be.']],regla:'delayed; I\'ll be … late.',x:'Avisa con will.'}),
    q(C,'Registrarte en el hotel',{enunciado:`3/4 · En la recepción del hotel: tienes una reservación a nombre de ${apellido} por dos noches.`,
      acepta:[`Hi, I have a reservation under ${apellido} for two nights`,`Hello, I have a reservation under ${apellido} for two nights`,`I have a reservation under ${apellido} for two nights`,`Hi, I have a reservation under the name ${apellido} for two nights`,`Hello, I have a booking under ${apellido} for two nights`,`Good evening, I have a reservation under ${apellido} for two nights`],
      errores:[[`I have a reservation with the name ${apellido} for two nights`,'Se dice under the name…']],regla:'I have a reservation under + nombre + for + noches.',x:'under + apellido.'}),
    q(C,'Contar el viaje',{enunciado:'4/4 · De regreso, tu jefe pregunta «How was the trip?». Contesta: «fue cansado pero la reunión salió muy bien».',
      acepta:['It was tiring, but the meeting went very well','It was tiring but the meeting went really well','It was tiring, but the meeting went great','It was exhausting, but the meeting went very well','It was tiring, but the meeting was very good'],
      errores:[['It was tired, but the meeting went very well','tired es como te sientes tú; el viaje fue tiring.'],['It is tiring, but the meeting goes very well','Es pasado: was, went.']],regla:'Past simple: was, went; tiring (que cansa) vs tired (cansado).',x:'Pasado simple.'})
  ];
}

// B1 · Un aviso de phishing en tu empresa: entender el problema, reportarlo en pasiva, dar instrucciones y un correo formal
export function escenarioPhishing(rng){
  const [n,dia]=rng.elegir([['three','Monday'],['five','Tuesday'],['two','Wednesday']]);
  const C=`Trabajas en soporte de TI. El ${dia==='Monday'?'lunes':dia==='Tuesday'?'martes':'miércoles'}, ${n==='three'?'tres':n==='five'?'cinco':'dos'} empleados recibieron un correo falso que pedía su contraseña.`;
  return [
    q(C,'Reportar en voz pasiva',{enunciado:`1/4 · Escribe el reporte: «${n==='three'?'tres':n==='five'?'cinco':'dos'} empleados fueron engañados por un correo falso».`,
      acepta:[`${n[0].toUpperCase()+n.slice(1)} employees were tricked by a fake email`,`${n[0].toUpperCase()+n.slice(1)} employees were fooled by a fake email`,`${n[0].toUpperCase()+n.slice(1)} employees were deceived by a fake email`,`${n[0].toUpperCase()+n.slice(1)} employees were tricked by a phishing email`],
      errores:[[`${n[0].toUpperCase()+n.slice(1)} employees tricked by a fake email`,'Falta be: were tricked.'],[`${n[0].toUpperCase()+n.slice(1)} employees was tricked by a fake email`,'employees es plural: were.']],regla:'Pasiva en pasado: were + participio + by…',x:'Pasiva: were tricked by…'}),
    q(C,'Dar una regla clara',{enunciado:'2/4 · Escribe la regla para el equipo: «no deben compartir su contraseña (está prohibido)».',
      acepta:["You mustn't share your password","You must not share your password","Do not share your password","Don't share your password","Employees must not share their passwords","You must never share your password"],
      errores:[["You don't have to share your password",'don\'t have to = no es necesario; prohibido es mustn\'t.']],regla:'Prohibido: mustn\'t / must not.',x:'mustn\'t = prohibido.'}),
    q(C,'Explicar qué hacer con un condicional',{enunciado:'3/4 · Agrega: «si reciben un correo sospechoso, reenvíenlo a seguridad».',
      acepta:['If you receive a suspicious email, forward it to security','If you get a suspicious email, forward it to security','If you receive a suspicious email, forward it to the security team','If you get a suspicious email, send it to security'],
      errores:[['If you will receive a suspicious email, forward it to security','Después de if, presente.']],regla:'If + presente, imperativo.',x:'Condicional con imperativo.'}),
    q(C,'Cerrar con un correo formal',{enunciado:'4/4 · Escribe la frase final del correo formal: «si tienen alguna pregunta, no duden en contactarme».',
      acepta:["If you have any questions, please do not hesitate to contact me","If you have any questions, don't hesitate to contact me","If you have any questions, please don't hesitate to contact me","If you have any questions, please feel free to contact me","Please do not hesitate to contact me if you have any questions"],
      errores:[['If you have some questions, please do not hesitate to contact me','En condicionales y preguntas: any.'],['If you have any questions, do not doubt to contact me','Calco: se dice do not hesitate to contact me.']],regla:'Cierre formal: Please do not hesitate to contact me.',x:'Fórmula de cierre formal.'})
  ];
}

// B2 · Revisión posterior a un incidente (postmortem) ante el equipo: qué pasó, qué dijo el proveedor, qué habría pasado y qué sigue
export function escenarioPostmortem(rng){
  const [hrs,prov]=rng.elegir([['dos','el proveedor de nube'],['tres','la empresa de hosting'],['cuatro','el proveedor']]);
  const C=`Presentas en inglés la revisión de una caída de ${hrs} horas en el sitio web de tu empresa.`;
  return [
    q(C,'Abrir la presentación',{enunciado:'1/4 · Abre: «hoy me gustaría repasar lo que pasó el martes».',
      acepta:["Today I'd like to go over what happened on Tuesday","Today I would like to review what happened on Tuesday","Today I'd like to review what happened on Tuesday","Today I'd like to talk about what happened on Tuesday","Today I'd like to go through what happened on Tuesday"],
      errores:[['Today I like to review what happened in Tuesday',"I'd like to… y con días: on Tuesday."],['Today I would like to review what did happen on Tuesday','En la oración incrustada: what happened.']],regla:"Today I'd like to + verbo; días con on.",x:"Apertura con I'd like to."}),
    q(C,'Contar lo que dijo el proveedor (reported speech)',{enunciado:`2/4 · ${prov[0].toUpperCase()+prov.slice(1)} dijo: «We will send a full report». Repórtalo: «dijeron que enviarían un informe completo».`,
      acepta:['They said they would send a full report','They said that they would send a full report',"They said they'd send a full report"],
      errores:[['They said they will send a full report','En reported speech: will → would.'],['They told they would send a full report','told necesita persona; sin persona: said.']],regla:'Reported speech: will → would; said (sin persona) / told + persona.',x:'will → would.'}),
    q(C,'Explicar qué habría evitado el problema (3.er condicional)',{enunciado:'3/4 · «Si hubiéramos tenido un servidor de respaldo, el sitio no se habría caído».',
      acepta:["If we had had a backup server, the site wouldn't have gone down","If we'd had a backup server, the site wouldn't have gone down","If we had had a backup server, the website wouldn't have gone down","If we had had a backup server, the site would not have gone down"],
      errores:[["If we would have had a backup server, the site wouldn't have gone down",'Después de if: had had.'],["If we had a backup server, the site wouldn't have gone down",'Pasado imaginario: had had.']],regla:'If + had + participio, would have + participio.',x:'Tercer condicional.'}),
    q(C,'Cerrar con los próximos pasos (conectores)',{enunciado:'4/4 · Cierra: «por lo tanto, vamos a agregar monitoreo; además, haremos pruebas cada mes».',
      acepta:["Therefore, we're going to add monitoring. Moreover, we'll run tests every month","Therefore, we will add monitoring. In addition, we will run tests every month","Therefore, we're going to add monitoring; furthermore, we'll test every month","As a result, we're going to add monitoring. Moreover, we'll run monthly tests","Therefore, we will add monitoring. Moreover, we will run tests every month"],
      errores:[["However, we're going to add monitoring. Moreover, we'll run tests every month",'However es contraste; para consecuencia: Therefore.']],regla:'Therefore / As a result (consecuencia); Moreover / In addition (añadir).',x:'Conectores formales.'})
  ];
}

// Exámenes · Un día de evaluación de inglés en tu trabajo: una tarea de cada nivel, de A2 a B2
export function escenarioEvaluacion(rng){
  const nombre=rng.elegir(['Ms. Grant','Mr. Hughes','Ms. Patel']);
  const C=`Tu empresa evalúa tu inglés para un puesto internacional. ${nombre} te pide cuatro tareas, cada una más difícil.`;
  return [
    q(C,'A2 · Un correo corto',{enunciado:'1/4 (A2) · Escribe: «gracias por la invitación; llegaré a las 10».',
      acepta:["Thanks for the invitation. I'll arrive at 10","Thank you for the invitation. I will arrive at 10","Thanks for the invitation, I'll be there at 10","Thank you for the invitation. I'll be there at 10"],errores:[['Thanks for the invitation. I arrive in 10','Promesa con will y hora con at.']],regla:"Thanks for…; I'll + verbo; at + hora.",x:'A2: correo corto.'}),
    q(C,'B1 · Una opinión con razón',{enunciado:'2/4 (B1) · Opina: «creo que el trabajo remoto es útil porque ahorra tiempo».',
      acepta:['I think remote work is useful because it saves time','In my opinion, remote work is useful because it saves time','I believe remote work is useful because it saves time'],errores:[['I think remote work is useful because saves time','Falta el sujeto: it saves time.']],regla:'I think / In my opinion + razón con because.',x:'B1: opinión justificada.'}),
    q(C,'B2 · Transformar (pasiva avanzada)',{enunciado:'3/4 (B2) · Transforma «People say that the new manager is very strict» empezando con «The new manager…».',
      acepta:['The new manager is said to be very strict'],errores:[['The new manager is said being very strict','is said to be.'],['The new manager says to be very strict','Pasiva: is said to be.']],regla:'People say that X is… → X is said to be…',x:'B2: transformación.'}),
    q(C,'B2 · Deducción',{enunciado:'4/4 (B2) · Deduce: «el informe no está en el servidor; alguien debe haberlo borrado».',
      acepta:["The report isn't on the server. Someone must have deleted it","The report is not on the server; someone must have deleted it","The report isn't on the server, so someone must have deleted it"],errores:[["The report isn't on the server. Someone must deleted it",'must have + participio.']],regla:'Deducción en pasado: must have + participio.',x:'B2: deducción.'})
  ];
}
