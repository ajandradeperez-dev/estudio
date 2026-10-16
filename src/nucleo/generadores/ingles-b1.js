/* Inglés B1: pasado continuo, condicionales 0–2, pasiva, modales, relativas, gerundio/infinitivo, phrasal verbs, vocabulario
   (estudios, trabajo y tecnología; medio ambiente), correos, historias, opinar, entrevista y lecturas. 6 plantillas cada uno. */
import {bancoEn,K,I,en} from './extensiones/ingles-base.js';

/* ---------- Pasado continuo ---------- */
const pasadoContinuo=bancoEn({titulo:'Pasado continuo',
  explicacion:'<b>was / were + -ing</b> describe una acción en progreso en un momento del pasado: <i>At 8 p.m. I was having dinner</i>. Con el pasado simple: la acción larga va en continuo y la que la interrumpe en simple: <i>I was cooking when the phone rang</i>. <b>while</b> + continuo para dos acciones al mismo tiempo: <i>While I was working, she was studying</i>.',
  alternativa:'Piensa en una película: el pasado continuo es la escena de fondo (estaba lloviendo, estaba manejando) y el pasado simple es lo que de pronto pasa (sonó el teléfono).',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – Past continuous',regla:'was/were + -ing para la acción de fondo; past simple para la que interrumpe (when); while + continuo para acciones simultáneas.',pista:'¿Es la acción de fondo o la que interrumpe?',
  tarjetas:[['Pasado continuo','was / were + verbo-ing (I was working).'],['«Estaba cocinando cuando sonó el teléfono»','I was cooking when the phone rang.'],['when o while','when + acción corta (past simple); while + acción larga (continuo).']],
  plantillas:{
    b1:K.completa([I('At 9 p.m. we ___ (watch) a movie.',['were watching'],[['was watching','Con we: were.'],['watched','Para una acción en progreso en un momento: were watching.']],'At 9 p.m. we were watching a movie.'),
      I('She ___ (drive) when it started to rain.','was driving',[['drove','La acción de fondo va en continuo: was driving.']],'She was driving when it started to rain.'),
      I('I ___ (not / sleep) when you called.',["wasn't sleeping","was not sleeping"],[["didn't sleeping",'Negativo del continuo: wasn\'t sleeping.']],"I wasn't sleeping when you called."),
      I('What ___ you doing at 10 last night?','were',[['was','Con you: were.'],['did','Para el continuo: were you doing.']],'What were you doing at 10 last night?')],{prof:'basico',que:'was/were + -ing para la acción en progreso'}),
    b2:K.dice([I('Estaba trabajando',['I was working'],[['I was work','Falta -ing: I was working.']]),I('¿Qué estabas haciendo?',['What were you doing?'],[['What was you doing?','Con you: were.']]),
      I('Estaban durmiendo',['They were sleeping','They were asleep'],[['They was sleeping','Con they: were.']]),I('mientras manejaba','while I was driving',[['while I drove','Con while, acción larga: was driving.']])]),
    p1:K.completa([I('I ___ (cook) when the power ___ (go) out.',['was cooking, went','was cooking went'],[['cooked, was going','La acción larga (cocinar) va en continuo; la que interrumpe (se fue la luz), en simple.']],'I was cooking when the power went out.'),
      I('While she ___ (study), her brother ___ (play) video games.',['was studying, was playing','was studying was playing'],[['studied, played','Dos acciones largas al mismo tiempo: continuo en las dos.']],'While she was studying, her brother was playing video games.'),
      I('The server ___ (crash) while we ___ (update) it.',['crashed, were updating','crashed were updating'],[['was crashing, updated','La interrupción (crash) en simple; la de fondo en continuo.']],'The server crashed while we were updating it.')]),
    p2:K.traduce([I('Estaba lloviendo cuando salí de la oficina.',['It was raining when I left the office'],[['It rained when I was leaving the office','La lluvia es el fondo: It was raining when I left.']]),
      I('¿Qué estabas haciendo cuando te llamé?',['What were you doing when I called you?','What were you doing when I called?'],[['What did you do when I was calling you?','La acción de fondo es la tuya: What were you doing when I called?']]),
      I('Me corté mientras cocinaba.',['I cut myself while I was cooking','I cut myself while cooking'],[['I was cutting myself while I cooked','La interrupción (cortarse) en simple.']])]),
    a1:K.situacion([I('Explicas a soporte qué pasó: «estaba guardando el archivo cuando se congeló la pantalla».',['I was saving the file when the screen froze'],[['I saved the file when the screen was freezing','La acción de fondo (guardar) va en continuo.'],['I was saving the file when the screen freezed','freeze → froze.']]),
      I('Cuentas a la policía lo que viste: «un hombre estaba corriendo y una mujer estaba gritando».',['A man was running and a woman was shouting','A man was running and a woman was screaming','A man was running and a woman was yelling'],[['A man ran and a woman shouted','Para describir la escena: was running, was shouting.']]),
      I('Te disculpas: «perdón, no contesté, estaba manejando».',["Sorry, I didn't answer. I was driving","Sorry I didn't answer, I was driving","Sorry, I couldn't answer. I was driving"],[["Sorry, I didn't answer. I drove",'Para la acción de fondo: I was driving.']])]),
    a2:K.dialogo([I('A: Why didn\'t you see my message?<br>B: (estaba en una junta)',['I was in a meeting','Because I was in a meeting',"I was in a meeting, sorry"],[['I am in a meeting','Es pasado: I was in a meeting.']]),
      I('A: How did you break your arm?<br>B: (me caí mientras esquiaba)',['I fell while I was skiing','I fell while skiing','I fell down while I was skiing'],[['I was falling while I skied','La interrupción (caerse) en simple.']]),
      I('A: What were you doing at midnight?<br>B: (estaba viendo una serie)',['I was watching a series','I was watching a show','I was watching a TV series'],[['I watched a series','Para un momento concreto: I was watching.']])])
  }});

/* ---------- Condicionales 0, 1 y 2 ---------- */
const condicionales=bancoEn({titulo:'Condicionales 0, 1 y 2',
  explicacion:'<b>Cero</b> (verdades): <i>If you heat water to 100 °C, it boils</i> (presente + presente). <b>Primero</b> (posible y real): <i>If it rains, I\'ll stay home</i> (presente + will). <b>Segundo</b> (imaginario o poco probable): <i>If I had more time, I would travel</i> (pasado + would). Después de <i>if</i> nunca va <i>will</i>. En el segundo, <i>If I were you…</i> para dar consejos.',
  alternativa:'Mide qué tan real es: siempre pasa → cero; puede pasar → primero (will); es un sueño o imposible ahora → segundo (would). El «if» nunca lleva will ni would.',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – If clauses',regla:'0: if + presente, presente. 1: if + presente, will + verbo. 2: if + pasado, would + verbo. Nunca will/would después de if. If I were you…',pista:'¿Siempre, posible o imaginario?',
  tarjetas:[['Primer condicional','If + presente, will + verbo (If it rains, I\'ll stay home).'],['Segundo condicional','If + pasado, would + verbo (If I won, I would travel).'],['Consejo con condicional','If I were you, I would…'],['Error típico','Nunca will después de if: If it rains (no «if it will rain»).']],
  plantillas:{
    b1:K.completa([I('If it ___ (rain) tomorrow, we will cancel the trip.','rains',[['will rain','Después de if, presente: rains.']],'If it rains tomorrow, we will cancel the trip.'),
      I('If I ___ (have) a car, I would drive to work.','had',[['have','Imaginario (segundo): pasado, had.'],['would have','Después de if no va would.']],'If I had a car, I would drive to work.'),
      I('If you mix red and blue, you ___ (get) purple.','get',[['will get','Es una verdad general (cero): get.']],'If you mix red and blue, you get purple.'),
      I('If I ___ you, I would accept the offer.','were',[['am','Para consejos: If I were you.'],['was','En el registro cuidado: If I were you.']],'If I were you, I would accept the offer.'),
      I("If you study, you ___ (pass) the exam.",["'ll pass","will pass"],[['would pass','Es posible y real: will pass.']],"If you study, you'll pass the exam.")],{prof:'basico',que:'¿Verdad general, posible o imaginario?'}),
    b2:K.dice([I('Si yo fuera tú…','If I were you',[['If I am you','Para consejos: If I were you.']]),I('Si llueve, me quedo en casa (posible)',["If it rains, I'll stay at home","If it rains, I'll stay home","If it rains, I will stay home"],[["If it will rain, I'll stay at home",'Después de if, presente.']]),
      I('Si tuviera dinero, compraría una casa',['If I had money, I would buy a house',"If I had money, I'd buy a house","If I had the money, I would buy a house"],[['If I would have money, I would buy a house','Después de if no va would.']]),I('Si calientas hielo, se derrite',['If you heat ice, it melts'],[['If you will heat ice, it melts','Después de if, presente.']])]),
    p1:K.traduce([I('Si terminas temprano, llámame.',['If you finish early, call me',"If you finish early, give me a call"],[['If you will finish early, call me','Después de if, presente.']]),
      I('Si viviera cerca, iría caminando.',["If I lived nearby, I would walk","If I lived near, I'd walk","If I lived close by, I would walk","If I lived nearby, I'd walk"],[['If I live nearby, I would walk','Imaginario: If I lived…']]),
      I('No iré si no me invitan.',["I won't go if they don't invite me","I won't go unless they invite me"],[["I won't go if they won't invite me",'Después de if, presente: if they don\'t invite me.']]),
      I('¿Qué harías si ganaras la lotería?',['What would you do if you won the lottery?'],[['What will you do if you win the lottery?','Es imaginario: would / won.']])]),
    p2:K.completa([I('If the client ___ (call), tell him I\'m in a meeting.','calls',[['will call','Después de if, presente.']],"If the client calls, tell him I'm in a meeting."),
      I("We ___ (not / finish) on time if we don't start now.",["won't finish","will not finish"],[["don't finish",'Resultado futuro: won\'t finish.']],"We won't finish on time if we don't start now."),
      I("If she ___ (speak) English, she would get the job.",'spoke',[['speaks','Imaginario: spoke.']],'If she spoke English, she would get the job.'),
      I("I would help you if I ___ (can).",'could',[['can','Segundo condicional: could.']],'I would help you if I could.')]),
    a1:K.situacion([I('Aconsejas a un compañero que está cansado: «si yo fuera tú, me tomaría unos días».',["If I were you, I would take a few days off","If I were you, I'd take a few days off","If I were you, I would take some days off","If I were you, I'd take some time off"],[["If I was you, I will take a few days off",'Consejo: If I were you, I would…']]),
      I('Avisas al equipo: «si el servidor se cae, reiniciaremos el servicio».',["If the server goes down, we'll restart the service","If the server goes down, we will restart the service","If the server crashes, we'll restart the service"],[["If the server will go down, we'll restart the service",'Después de if, presente.']]),
      I('Explicas una regla del laboratorio: «si mezclas estos químicos, explotan».',['If you mix these chemicals, they explode'],[['If you will mix these chemicals, they explode','Después de if, presente.']])]),
    a2:K.dialogo([I('A: What will you do if you don\'t get the job?<br>B: (buscaré otro)',["I'll look for another one","I will look for another one","I'll look for another job"],[['I would look for another one','La pregunta es con will (posible).']]),
      I('A: Would you move abroad?<br>B: (sí, si tuviera la oportunidad)',["Yes, if I had the chance","Yes, if I had the opportunity","Yes, I would if I had the chance"],[['Yes, if I have the chance','Imaginario: if I had.']]),
      I('A: Can you help me tomorrow?<br>B: (si tengo tiempo, sí)',["If I have time, yes","Yes, if I have time","If I have time, I will"],[['If I will have time, yes','Después de if, presente.']])])
  }});

/* ---------- Voz pasiva ---------- */
const pasiva=bancoEn({titulo:'Voz pasiva básica',
  explicacion:'La pasiva pone el foco en lo que recibe la acción: <b>be + participio</b>. Presente: <i>English is spoken here</i>; pasado: <i>The bridge was built in 1990</i>; futuro: <i>The results will be sent tomorrow</i>. Quién lo hace va con <b>by</b> solo si importa: <i>The app was developed by a small team</i>. Se usa mucho en noticias, procesos y textos técnicos.',
  alternativa:'Activa: «Ana escribió el informe». Pasiva: «El informe fue escrito (por Ana)». En inglés, el verbo be lleva el tiempo y el participio no cambia.',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – Passive',regla:'be (en el tiempo que toque) + participio: is made, was built, will be sent, has been fixed. by + quién, solo si importa.',pista:'be + participio; ¿qué tiempo es?',
  tarjetas:[['Pasiva en presente','is / are + participio (Coffee is grown in Colombia).'],['Pasiva en pasado','was / were + participio (It was built in 1990).'],['¿Cuándo se dice by…?','Solo si importa quién lo hizo.']],
  plantillas:{
    b1:K.completa([I('Spanish ___ (speak) in 20 countries.','is spoken',[['speaks','En pasiva: is spoken.'],['is speak','Falta el participio: spoken.']],'Spanish is spoken in 20 countries.'),
      I('This house ___ (build) in 1950.','was built',[['built','En pasiva: was built.'],['was build','Falta el participio: built.']],'This house was built in 1950.'),
      I('The results ___ (send) tomorrow.','will be sent',[['will send','Los resultados no envían: will be sent.']],'The results will be sent tomorrow.'),
      I('These phones ___ (make) in Korea.','are made',[['is made','phones es plural: are made.']],'These phones are made in Korea.')],{prof:'basico',que:'be + participio en el tiempo correcto'}),
    b2:K.dice([I('Fue diseñado por un equipo pequeño',['It was designed by a small team'],[['It designed by a small team','Falta be: It was designed.']]),I('Se habla inglés aquí',['English is spoken here'],[['Is spoken English here','Orden: English is spoken here.']]),
      I('El problema ya fue resuelto',['The problem has already been solved','The problem was already solved','The problem has been solved'],[['The problem has already solved','Falta been: has been solved.']]),I('Los correos se revisan cada mañana',['The emails are checked every morning','Emails are checked every morning'],[['The emails check every morning','En pasiva: are checked.']])]),
    p1:K.completa([I('Activa: «Someone stole my bike.» → Pasiva: My bike ___.','was stolen',[['was stole','Participio de steal: stolen.'],['stole','En pasiva: was stolen.']],'My bike was stolen.'),
      I('Activa: «They clean the office every day.» → Pasiva: The office ___ every day.','is cleaned',[['cleans','En pasiva: is cleaned.']],'The office is cleaned every day.'),
      I('Activa: «The IT team will update the system.» → Pasiva: The system ___ by the IT team.','will be updated',[['will update','En pasiva: will be updated.']],'The system will be updated by the IT team.')]),
    p2:K.traduce([I('La reunión fue cancelada.',['The meeting was cancelled','The meeting was canceled'],[['The meeting cancelled','Falta be: was cancelled.']]),
      I('Los paquetes se entregan en 24 horas.',['The packages are delivered in 24 hours','Packages are delivered within 24 hours','The packages are delivered within 24 hours'],[['The packages deliver in 24 hours','En pasiva: are delivered.']]),
      I('El edificio será renovado el próximo año.',['The building will be renovated next year'],[['The building will renovate next year','En pasiva: will be renovated.']])]),
    a1:K.situacion([I('Escribes un aviso: «la oficina será cerrada el lunes por mantenimiento».',['The office will be closed on Monday for maintenance','The office will be closed on Monday due to maintenance'],[['The office will close on Monday for maintenance','Para un aviso formal: will be closed.']]),
      I('Reportas un incidente de seguridad: «tres cuentas fueron bloqueadas esta mañana».',['Three accounts were blocked this morning','Three accounts were locked this morning'],[['Three accounts was blocked this morning','accounts es plural: were.']]),
      I('Explicas un proceso: «los datos se guardan en un servidor seguro».',['The data is stored on a secure server','The data are stored on a secure server','Data is stored on a secure server'],[['The data stores on a secure server','En pasiva: is stored.']])]),
    a2:K.dialogo([I('A: Who painted this?<br>B: (fue pintado por un artista local)',['It was painted by a local artist'],[['It painted by a local artist','Falta be: was painted.']]),
      I('A: Is the bug fixed?<br>B: (sí, se corrigió ayer)',['Yes, it was fixed yesterday'],[['Yes, it fixed yesterday','En pasiva: it was fixed.']]),
      I('A: Where is coffee grown in your country?<br>B: (se cultiva en el sur)',["It's grown in the south","It is grown in the south"],[["It's grow in the south",'Participio de grow: grown.']])])
  }});

/* ---------- Modales: must, have to, might ---------- */
const modales=bancoEn({titulo:'Modales: must, have to, might',
  explicacion:'<b>must</b>: obligación que decide quien habla o una regla escrita (<i>You must wear a helmet</i>). <b>have to</b>: obligación externa (<i>I have to work on Saturday</i>; pasado: <i>had to</i>). <b>mustn\'t</b> = está prohibido; <b>don\'t have to</b> = no es necesario. <b>might / may</b>: posibilidad (<i>It might rain</i>). Todos van con verbo base sin <i>to</i>, salvo <i>have to</i>.',
  alternativa:'La trampa más común: <i>mustn\'t</i> es «no puedes» (prohibido) y <i>don\'t have to</i> es «no tienes que» (opcional). Son muy distintos.',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – Modales de obligación y posibilidad',regla:'must / have to = obligación; mustn\'t = prohibido; don\'t have to = no es necesario; might / may = posibilidad. Verbo base después (sin to, salvo have to).',pista:'¿Obligación, prohibición, algo opcional o posibilidad?',
  tarjetas:[['mustn\'t','Prohibido (You mustn\'t smoke here).'],['don\'t have to','No es necesario (You don\'t have to come).'],['Pasado de must / have to','had to.'],['might','Posibilidad (It might rain).']],
  plantillas:{
    b1:K.completa([I('You ___ smoke in the hospital. (prohibido)',["mustn't","must not"],[["don't have to",'don\'t have to = no es necesario; prohibido es mustn\'t.']],"You mustn't smoke in the hospital."),
      I("It's Sunday. You ___ get up early. (no es necesario)",["don't have to","do not have to"],[["mustn't",'mustn\'t = prohibido; aquí no es necesario: don\'t have to.']],"You don't have to get up early."),
      I('Take an umbrella. It ___ rain later. (quizá)',['might','may','could'],[['must','must es obligación; para posibilidad: might.']],'It might rain later.'),
      I('Yesterday I ___ work until 10 p.m. (tuve que)','had to',[['must','must no tiene pasado: had to.']],'Yesterday I had to work until 10 p.m.')],{prof:'basico',que:'¿Obligación, prohibición, opcional o posibilidad?'}),
    b2:K.dice([I('Tengo que irme',['I have to go','I must go',"I've got to go"],[['I must to go','must va sin to.']]),I('No tienes que pagar',["You don't have to pay"],[["You mustn't pay",'mustn\'t = prohibido; aquí: don\'t have to.']]),
      I('Quizá llegue tarde',['I might be late','I may be late'],[['I might to be late','might va sin to.']]),I('Tuvimos que esperar',['We had to wait'],[['We must waited','En pasado: had to wait.']])]),
    p1:K.traduce([I('Los empleados deben usar credencial.',['Employees must wear their badges','Employees must wear a badge','Employees have to wear their ID badges','Employees must wear ID badges'],[['Employees must to wear their badges','must va sin to.']]),
      I('No tienes que traer nada.',["You don't have to bring anything"],[["You mustn't bring anything",'mustn\'t = prohibido.']]),
      I('Puede que el vuelo se retrase.',['The flight might be delayed','The flight may be delayed'],[['The flight must be delayed','Para posibilidad: might.']])]),
    p2:K.completa([I('A: Do I ___ to sign here? B: Yes, you do.','have',[['must','Con do: Do I have to…?']],'Do I have to sign here?'),I('She ___ to leave early yesterday.','had',[['must','En pasado: had to.']],'She had to leave early yesterday.'),
      I("I'm not sure. He ___ be at home.",['might','may'],[['must','No es seguro: might.']],'He might be at home.')]),
    a1:K.situacion([I('Escribes las reglas del laboratorio: «está prohibido compartir contraseñas».',["You mustn't share passwords","You must not share passwords","Passwords must not be shared"],[["You don't have to share passwords",'Eso significaría «no es necesario».']]),
      I('Le dices a un invitado que no es necesario traer regalo.',["You don't have to bring a gift","You don't need to bring a gift","You don't have to bring a present"],[["You mustn't bring a gift",'Eso sería «prohibido».']]),
      I('Avisas que quizá no llegues a la junta.',["I might not make it to the meeting","I might not come to the meeting","I may not be at the meeting","I might not be at the meeting"],[["I mustn't come to the meeting",'Para posibilidad: might not.']])]),
    a2:K.dialogo([I('A: Why are you so tired?<br>B: (tuve que trabajar todo el fin de semana)',['I had to work all weekend','I had to work the whole weekend'],[['I must work all weekend','En pasado: had to.']]),
      I('A: Is the training mandatory?<br>B: (sí, todos tienen que asistir)',['Yes, everyone has to attend','Yes, everybody has to attend','Yes, everyone must attend'],[['Yes, everyone have to attend','everyone es singular: has to.']]),
      I('A: Where is Carla?<br>B: (no sé, puede que esté en el almuerzo)',["I don't know, she might be at lunch","I'm not sure, she might be at lunch","I don't know. She may be at lunch"],[["I don't know, she must to be at lunch",'Posibilidad: might be.']])])
  }});

/* ---------- Oraciones relativas ---------- */
const relativas=bancoEn({titulo:'Oraciones relativas',
  explicacion:'Unen dos ideas sobre un sustantivo: <b>who</b> para personas (<i>The woman who called is my boss</i>), <b>which</b> para cosas (<i>The app which I use is free</i>), <b>that</b> para los dos (más informal), <b>where</b> para lugares (<i>the city where I was born</i>) y <b>whose</b> para posesión (<i>the man whose car was stolen</i>). Si el relativo es el objeto, se puede omitir: <i>The book (that) I read</i>.',
  alternativa:'Pregúntate de qué hablas: persona → who; cosa → which; lugar → where; «cuyo» → whose. Y no repitas el pronombre: no «the man who he called».',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – Relative clauses',regla:'who (personas), which (cosas), that (ambos), where (lugares), whose (posesión). No repitas el sujeto (no «who he»).',pista:'¿Persona, cosa, lugar o posesión?',
  tarjetas:[['Relativo para personas','who (o that).'],['Relativo para lugares','where (the city where I live).'],['«cuyo»','whose (the man whose car…).'],['Error típico','No repetir el sujeto: the man who called (no «who he called»).']],
  plantillas:{
    b1:K.completa([I('The doctor ___ helped me was very kind.',['who','that'],[['which','Para personas: who.']],'The doctor who helped me was very kind.'),I('This is the laptop ___ I bought last week.',['which','that'],[['who','Para cosas: which / that.']],'This is the laptop which I bought last week.'),
      I('That\'s the restaurant ___ we had our first date.','where',[['which','Para lugares: where.']],"That's the restaurant where we had our first date."),I('I know a girl ___ father is a pilot.','whose',[['who','Para posesión: whose.']],'I know a girl whose father is a pilot.')],{prof:'basico',que:'¿Persona, cosa, lugar o posesión?'}),
    b2:K.dice([I('la persona que llamó','the person who called',[['the person which called','Para personas: who.'],['the person who she called','No repitas el sujeto.']]),I('la ciudad donde nací','the city where I was born',[['the city which I was born','Para lugares: where.']]),
      I('el hombre cuyo carro robaron',['the man whose car was stolen'],[['the man who his car was stolen','«cuyo» = whose.']]),I('el correo que te mandé',['the email I sent you','the email that I sent you','the email which I sent you'],[['the email what I sent you','No se usa what como relativo.']])]),
    p1:K.completa([I('Une: «I have a friend. She lives in Rome.» → I have a friend ___ in Rome.',['who lives','that lives'],[['who she lives','No repitas el sujeto.'],['which lives','Para personas: who.']],'I have a friend who lives in Rome.'),
      I('Une: «This is the hotel. We stayed there.» → This is the hotel ___ we stayed.','where',[['which','Para lugares (con there): where.']],'This is the hotel where we stayed.'),
      I('Une: «The software is old. We use it.» → The software ___ we use is old.',['which','that'],[['what','No se usa what como relativo.']],'The software which we use is old.')]),
    p2:K.traduce([I('La mujer que contraté habla tres idiomas.',['The woman I hired speaks three languages','The woman who I hired speaks three languages','The woman that I hired speaks three languages','The woman whom I hired speaks three languages'],[['The woman which I hired speaks three languages','Para personas: who.']]),
      I('Es la empresa donde trabajé cinco años.',["It's the company where I worked for five years","It's the company where I worked five years"],[["It's the company which I worked for five years",'Para el lugar donde trabajaste: where.']]),
      I('Necesito un programa que haga respaldos automáticos.',['I need a program that makes automatic backups','I need software that makes automatic backups','I need a program which makes automatic backups'],[['I need a program what makes automatic backups','No se usa what como relativo.']])]),
    a1:K.situacion([I('Describes a un candidato en una junta: «es la persona que resolvió el problema del servidor».',["He's the person who solved the server problem","She's the person who solved the server problem","He is the person who fixed the server problem","She's the person that solved the server issue"],[["He's the person which solved the server problem",'Para personas: who.']]),
      I('Recomiendas un lugar: «es el café donde hacen el mejor pan».',["It's the café where they make the best bread","It's the cafe where they make the best bread"],[["It's the café which they make the best bread",'Para lugares: where.']]),
      I('Pides algo en una tienda: «busco un cargador que funcione con este teléfono».',["I'm looking for a charger that works with this phone","I'm looking for a charger which works with this phone"],[["I'm looking for a charger who works with this phone",'Para cosas: that / which.']])]),
    a2:K.dialogo([I('A: Who is Tom?<br>B: (es el chico que trabaja en ventas)',["He's the guy who works in sales","He's the guy that works in sales","He's the one who works in sales"],[["He's the guy who he works in sales",'No repitas el sujeto.']]),
      I('A: Which phone do you want?<br>B: (el que tiene mejor cámara)',['The one that has the best camera','The one which has the best camera','The one with the best camera'],[['The one who has the best camera','Para cosas: that / which.']])])
  }});

/* ---------- Gerundio vs infinitivo ---------- */
const gerundio=bancoEn({titulo:'Gerundio vs infinitivo',
  explicacion:'Algunos verbos piden <b>-ing</b>: <i>enjoy, finish, avoid, mind, suggest, keep</i> (<i>I enjoy cooking</i>). Otros piden <b>to + verbo</b>: <i>want, decide, plan, hope, need, agree, promise</i> (<i>I decided to quit</i>). Después de preposición siempre va -ing: <i>I\'m interested in learning</i>, <i>Thanks for coming</i>. <i>like / love / hate</i> aceptan los dos.',
  alternativa:'Apréndelos en dos listas cortas. Truco: los verbos de «futuro» (want, plan, hope, decide) miran hacia adelante y usan to; los de «experiencia» (enjoy, finish, avoid) usan -ing.',
  referencia:'Cambridge B1 Preliminary · Murphy EGU – Verb + -ing / to',regla:'enjoy, finish, avoid, mind, suggest, keep + -ing; want, decide, plan, hope, need, agree + to; preposición + -ing.',pista:'¿El verbo es de la lista -ing o de la lista to?',
  tarjetas:[['enjoy, finish, avoid…','+ -ing (I enjoy reading).'],['want, decide, plan…','+ to (I decided to leave).'],['Después de preposición','-ing (interested in learning).'],['«Gracias por venir»','Thanks for coming.']],
  plantillas:{
    b1:K.completa([I('I enjoy ___ (cook) on weekends.','cooking',[['to cook','enjoy va con -ing.']],'I enjoy cooking on weekends.'),I('She decided ___ (quit) her job.','to quit',[['quitting','decide va con to.']],'She decided to quit her job.'),
      I('Have you finished ___ (write) the report?','writing',[['to write','finish va con -ing.']],'Have you finished writing the report?'),I('We need ___ (talk).','to talk',[['talking','need va con to.']],'We need to talk.'),
      I("I'm interested in ___ (learn) Python.",'learning',[['learn','Después de preposición: -ing.'],['to learn','Después de in: -ing.']],"I'm interested in learning Python.")],{prof:'basico',que:'¿-ing o to?'}),
    b2:K.dice([I('Gracias por venir','Thanks for coming',[['Thanks for come','Después de for: -ing.'],['Thanks for to come','Después de for: -ing.']]),I('Evita usar el celular',['Avoid using your phone','Avoid using the phone'],[['Avoid to use your phone','avoid va con -ing.']]),
      I('Planeo viajar en julio',['I plan to travel in July',"I'm planning to travel in July"],[['I plan traveling in July','plan va con to.']]),I('¿Te importa esperar?',['Do you mind waiting?'],[['Do you mind to wait?','mind va con -ing.']])]),
    p1:K.traduce([I('Prometió llamarme.',['He promised to call me','She promised to call me'],[['He promised calling me','promise va con to.']]),
      I('Sugiero empezar a las 9.',['I suggest starting at 9','I suggest starting at nine','I suggest we start at 9'],[['I suggest to start at 9','suggest va con -ing.']]),
      I('Estoy cansado de esperar.',["I'm tired of waiting"],[["I'm tired of wait",'Después de of: -ing.']])]),
    p2:K.completa([I('He kept ___ (talk) during the movie.','talking',[['to talk','keep va con -ing.']],'He kept talking during the movie.'),I('They agreed ___ (help) us.','to help',[['helping','agree va con to.']],'They agreed to help us.'),
      I('I look forward to ___ (meet) you.','meeting',[['meet','look forward to + -ing.']],'I look forward to meeting you.')]),
    a1:K.situacion([I('En una entrevista: «disfruto trabajar en equipo».',['I enjoy working in a team','I enjoy working in teams','I enjoy teamwork','I enjoy working with a team'],[['I enjoy to work in a team','enjoy va con -ing.']]),
      I('Escribes al final de un correo: «espero tener noticias suyas pronto».',['I look forward to hearing from you soon','I hope to hear from you soon'],[['I look forward to hear from you soon','look forward to + -ing.']]),
      I('Explicas tu meta: «decidí aprender inglés para conseguir un mejor trabajo».',['I decided to learn English to get a better job','I decided to learn English so I can get a better job'],[['I decided learning English to get a better job','decide va con to.']])]),
    a2:K.dialogo([I('A: Do you want to come with us?<br>B: (me encantaría, pero tengo que terminar de estudiar)',["I'd love to, but I have to finish studying","I'd love to, but I need to finish studying"],[["I'd love to, but I have to finish to study",'finish va con -ing.']]),
      I('A: Why did you leave your last job?<br>B: (quería aprender cosas nuevas)',['I wanted to learn new things'],[['I wanted learning new things','want va con to.']])])
  }});

/* ---------- Phrasal verbs ---------- */
const phrasal=bancoEn({titulo:'Phrasal verbs frecuentes',
  explicacion:'Un phrasal verb es verbo + partícula con un significado propio: <i>find out</i> (descubrir), <i>give up</i> (rendirse, dejar), <i>look for</i> (buscar), <i>look after</i> (cuidar), <i>turn on / off</i> (encender / apagar), <i>set up</i> (configurar, instalar), <i>run out of</i> (quedarse sin), <i>get along with</i> (llevarse bien), <i>call back</i> (devolver la llamada), <i>put off</i> (posponer).',
  alternativa:'No intentes deducirlos de las palabras sueltas: apréndelos como vocabulario nuevo, cada uno con una frase de ejemplo de tu vida.',
  referencia:'Cambridge B1 Preliminary – Phrasal verbs',regla:'find out = descubrir; give up = dejar/rendirse; look for = buscar; look after = cuidar; set up = configurar; run out of = quedarse sin; put off = posponer.',pista:'Piensa en la frase de ejemplo.',
  tarjetas:[['run out of','quedarse sin (We ran out of coffee).'],['put off','posponer (They put off the meeting).'],['set up','configurar, instalar (set up an account).'],['get along with','llevarse bien con.']],
  plantillas:{
    b1:K.dice([I('buscar (algo perdido)','look for',[['search','search se usa más con un lugar: search the house; buscar algo: look for.']]),I('rendirse / dejar de',['give up'],[['give down','Se dice give up.']]),
      I('descubrir / averiguar','find out',[['discover out','Se dice find out.']]),I('posponer','put off',[['put of','Se escribe put off.']]),I('cuidar (a alguien)','look after',[['look for','look for es buscar.']]),I('quedarse sin','run out of',[['finish of','Se dice run out of.']])],{prof:'basico'}),
    b2:K.significa([I('I get along with my coworkers',['me llevo bien con mis companeros','me llevo bien con mis compañeros de trabajo','me llevo bien con mis colegas']),I('Can you call me back?',['puedes devolverme la llamada','me puedes regresar la llamada','me llamas de vuelta','puedes llamarme de vuelta']),
      I('We set up a new account',['configuramos una cuenta nueva','creamos una cuenta nueva','abrimos una cuenta nueva']),I('Turn off the lights',['apaga las luces'],[['prende las luces','Prender es turn on.']])]),
    p1:K.completa([I('We ran ___ of paper. Can you buy more?','out',[['off','Se dice run out of.']],'We ran out of paper.'),I("I'm looking ___ my keys. Have you seen them?",'for',[['after','look after es cuidar.']],"I'm looking for my keys."),
      I('They put ___ the meeting until Friday.','off',[['of','Se escribe put off.']],'They put off the meeting until Friday.'),I('I need to find ___ what happened.','out',[['up','Se dice find out.']],'I need to find out what happened.')]),
    p2:K.traduce([I('Dejé de fumar hace dos años.',['I gave up smoking two years ago','I quit smoking two years ago'],[['I gave up to smoke two years ago','give up va con -ing.']]),
      I('¿Puedes cuidar a mi perro el fin de semana?',['Can you look after my dog on the weekend?','Could you look after my dog this weekend?','Can you take care of my dog on the weekend?','Can you look after my dog this weekend?'],[['Can you look for my dog on the weekend?','look for es buscar.']]),
      I('Instalamos la impresora nueva.',['We set up the new printer','We installed the new printer'],[['We set on the new printer','Se dice set up.']])]),
    a1:K.situacion([I('Llamas a soporte: «no puedo encender la computadora».',["I can't turn on the computer","I can't turn the computer on","I can't switch on the computer"],[["I can't turn off the computer",'turn off es apagar.']]),
      I('Avisas al cliente: «tenemos que posponer la entrega una semana».',['We have to put off the delivery for a week','We need to put off the delivery by a week','We have to postpone the delivery for a week'],[['We have to put of the delivery for a week','Se escribe put off.']]),
      I('Explicas por qué te gusta tu trabajo: «me llevo muy bien con mi equipo».',['I get along very well with my team','I get on really well with my team','I get along really well with my team'],[['I carry well with my team','Se dice get along with.']])]),
    a2:K.dialogo([I("A: Did you find out who sent the email?<br>B: (no, todavía lo estoy investigando)",["No, I'm still looking into it","No, I'm still trying to find out","Not yet, I'm still looking into it"],[["No, I'm still looking it into",'Se dice looking into it.']]),
      I('A: Why are you so stressed?<br>B: (nos quedamos sin tiempo)',['We ran out of time',"We're running out of time"],[['We finished of time','Se dice run out of time.']])])
  }});

/* ---------- Estudios, trabajo y tecnología ---------- */
const tecnologia=bancoEn({titulo:'Estudios, trabajo y tecnología',
  explicacion:'Estudios: <i>degree</i> (título), <i>major in</i> (especializarse en), <i>graduate from</i>, <i>take a course</i>, <i>pass / fail an exam</i>. Trabajo: <i>apply for a job, hire, fire, get promoted, résumé / CV, skills</i>. Tecnología: <i>download, upload, log in, update, back up, a bug, a password, a device, the cloud</i>.',
  alternativa:'Agrupa por historia: «Me gradué (graduated from) en Sistemas (majored in), solicité un trabajo (applied for), me contrataron (hired) y ahora respaldo datos (back up) en la nube».',
  referencia:'Cambridge B1 Preliminary – Vocabulario: educación, trabajo y tecnología',regla:'apply for a job, get hired/promoted, graduate from, major in, take a course, back up, log in, update, upload/download.',pista:'¿Qué verbo va con esa palabra?',
  tarjetas:[['solicitar un empleo','apply for a job.'],['respaldar (datos)','back up (a backup = un respaldo).'],['carrera / título universitario','degree (I have a degree in…).'],['aprobar / reprobar','pass / fail (an exam).']],
  plantillas:{
    b1:K.dice([I('solicitar un empleo','apply for a job',[['apply a job','Lleva for: apply for.'],['solicit a job','solicit tiene otro sentido; se dice apply for.']]),I('respaldar los archivos','back up the files',[['respald the files','Se dice back up.']]),
      I('aprobar un examen','pass an exam',[['approve an exam','approve es autorizar; aprobar un examen es pass.']]),I('ascender (en el trabajo)','get promoted',[['ascend','Se dice get promoted.']]),I('el currículum',['the résumé','the resume','the CV'],[['the curriculum','curriculum es el plan de estudios.']])],{prof:'basico'}),
    b2:K.significa([I('She majored in economics',['estudio economia','se especializo en economia','su carrera fue economia','estudió economía']),I('I failed the test',['reprobe el examen','reprobé el examen','no pase el examen'],[['aprobe el examen','Aprobar es pass.']]),
      I('They fired him',['lo despidieron','lo corrieron'],[['lo contrataron','Contratar es hire.']]),I('Please update the app',['por favor actualiza la app','por favor actualiza la aplicacion'])]),
    p1:K.completa([I('I graduated ___ the University of Chile in 2019.','from',[['of','Se dice graduate from.']],'I graduated from the University of Chile in 2019.'),I('She applied ___ a job at Google.','for',[['to','Para un puesto: apply for.']],'She applied for a job at Google.'),
      I("Don't forget to ___ up your files.",'back',[['make','Se dice back up.']],"Don't forget to back up your files."),I('I have a ___ in computer science. (título)','degree',[['title','Título universitario: degree.']],'I have a degree in computer science.')]),
    p2:K.traduce([I('Me contrataron hace tres meses.',['They hired me three months ago','I was hired three months ago','I got hired three months ago'],[['They contracted me three months ago','Contratar a un empleado: hire.']]),
      I('Subí el archivo a la nube.',['I uploaded the file to the cloud'],[['I downloaded the file to the cloud','download es bajar; subir es upload.']]),
      I('Estoy tomando un curso de ciberseguridad.',["I'm taking a cybersecurity course","I'm taking a course in cybersecurity","I'm doing a cybersecurity course"],[["I'm making a cybersecurity course",'Se dice take a course.']])]),
    a1:K.situacion([I('En una entrevista: «estudié ingeniería y me gradué en 2020».',['I studied engineering and graduated in 2020','I studied engineering and I graduated in 2020','I majored in engineering and graduated in 2020'],[['I studied engineering and I graduated of 2020','Con el año: in 2020.']]),
      I('Explicas a un usuario: «tienes que iniciar sesión con tu correo».',['You have to log in with your email','You need to log in with your email','You have to sign in with your email'],[['You have to log on your email','Se dice log in with…']]),
      I('Reportas un problema: «la actualización tiene un error».',['The update has a bug',"There's a bug in the update",'The update has an error'],[['The actualization has a bug','Actualización es update.']])]),
    a2:K.dialogo([I('A: What did you study?<br>B: (tengo una licenciatura en administración)',['I have a degree in business administration','I have a degree in business','I have a bachelor\'s degree in business administration'],[['I have a license in business administration','Licenciatura es degree.']]),
      I('A: Did you get the job?<br>B: (sí, empiezo el lunes)',["Yes, I start on Monday","Yes, I'm starting on Monday","Yes! I start on Monday"],[['Yes, I start in Monday','Con días: on.']])])
  }});

/* ---------- Medio ambiente ---------- */
const ambiente=bancoEn({titulo:'Medio ambiente',
  explicacion:'Vocabulario clave: <i>climate change, global warming, pollution, waste, recycle, renewable energy, save energy, plastic bags, carbon footprint, endangered species, deforestation</i>. Para proponer: <i>We should…, It\'s important to…, One solution is to…</i>. Para causa y efecto: <i>…causes…, …because of…, As a result,…</i>',
  alternativa:'Ordena el tema como problema → causa → solución: <i>Pollution</i> (problema) <i>is caused by cars</i> (causa); <i>we should use public transport</i> (solución).',
  referencia:'Cambridge B1 Preliminary – Vocabulario: medio ambiente',regla:'Problema (pollution, waste) + causa (is caused by, because of) + solución (we should, one solution is to).',pista:'¿Problema, causa o solución?',
  tarjetas:[['contaminación','pollution.'],['energía renovable','renewable energy.'],['huella de carbono','carbon footprint.'],['especies en peligro de extinción','endangered species.']],
  plantillas:{
    b1:K.dice([I('la contaminación','pollution',[['contamination','contamination es contagio o contaminación de una sustancia; la del ambiente es pollution.']]),I('reciclar','recycle',[['reciclate','Se dice recycle.']]),
      I('energía renovable','renewable energy',[['renovable energy','Se dice renewable.']]),I('ahorrar energía','save energy',[['economize energy','Se dice save energy.']]),I('los residuos / la basura',['waste','trash','garbage','rubbish'],[['residues','Lo común: waste.']])],{prof:'basico'}),
    b2:K.significa([I('Many species are endangered',['muchas especies estan en peligro de extincion','muchas especies están en peligro']),I('Reduce your carbon footprint',['reduce tu huella de carbono']),
      I('Deforestation is a serious problem',['la deforestacion es un problema grave','la deforestación es un problema serio']),I('Global warming',['el calentamiento global','calentamiento global'])]),
    p1:K.completa([I('Air pollution is caused ___ cars and factories.','by',[['for','Pasiva con agente: caused by.']],'Air pollution is caused by cars and factories.'),I('We should ___ plastic bottles. (reciclar)','recycle',[['reciclate','Se dice recycle.']],'We should recycle plastic bottles.'),
      I('Solar panels produce ___ energy. (renovable)','renewable',[['renovable','Se dice renewable.']],'Solar panels produce renewable energy.'),I('Turn off the lights to ___ energy.','save',[['safe','safe es seguro; ahorrar es save.']],'Turn off the lights to save energy.')]),
    p2:K.traduce([I('Deberíamos usar menos plástico.',['We should use less plastic'],[['We should use fewer plastic','plastic es incontable: less.']]),
      I('El cambio climático afecta a todos.',['Climate change affects everyone','Climate change affects everybody'],[['The climatic change affects everyone','Se dice climate change.']]),
      I('Muchos ríos están contaminados.',['Many rivers are polluted','A lot of rivers are polluted'])]),
    a1:K.situacion([I('En una encuesta te preguntan qué haces por el planeta: «ahorro energía y casi no uso bolsas de plástico».',["I save energy and I hardly ever use plastic bags","I save energy and I rarely use plastic bags","I save energy and I almost never use plastic bags"],[["I save energy and I use almost never plastic bags",'El adverbio va antes del verbo.']]),I('Propones en la oficina: «deberíamos poner botes de reciclaje en cada piso».',['We should put recycling bins on every floor','We should have recycling bins on each floor','We should put recycling bins on each floor'],[['We should put recycle bins in every floor','Se dice recycling bins on every floor.']]),
      I('Escribes la conclusión de un ensayo: «una solución es usar más transporte público».',['One solution is to use more public transport','One solution is to use public transportation more','One solution is using more public transport'],[['One solution is use more public transport','Después de is: to use.']])]),
    a2:K.dialogo([I('A: What can we do about pollution?<br>B: (podemos usar la bici en lugar del carro)',['We can ride a bike instead of driving','We can use bikes instead of cars','We can cycle instead of driving','We can use a bike instead of the car'],[['We can use the bike instead of drive','Después de instead of: -ing.']]),
      I('A: Do you recycle at home?<br>B: (sí, separamos el papel y el plástico)',['Yes, we separate paper and plastic','Yes, we separate the paper and the plastic','Yes, we sort paper and plastic'],[['Yes, we separate the paper of the plastic','Lo natural: separate paper and plastic.']])])
  }});

/* ---------- Correos formales e informales ---------- */
const correos=bancoEn({titulo:'Correos formales e informales',
  explicacion:'<b>Formal</b>: <i>Dear Mr. / Ms. + apellido,</i> · <i>I am writing to inquire about…</i> · <i>Could you please…?</i> · <i>I would be grateful if…</i> · <i>I look forward to hearing from you.</i> · <i>Kind regards,</i>. Sin contracciones. <b>Informal</b>: <i>Hi Sam,</i> · <i>Thanks for your message!</i> · <i>Guess what…</i> · <i>Can\'t wait to see you</i> · <i>Take care / Cheers,</i>.',
  alternativa:'Imagina a quién le hablas en persona: a un cliente le dirías «¿podría…?»; a un amigo, «oye…». El correo cambia igual: formal = frases completas y sin contracciones.',
  referencia:'Cambridge B1 Preliminary – Writing: email',regla:'Formal: Dear Ms. X, I am writing to…, Could you please…, I look forward to hearing from you, Kind regards. Informal: Hi X, Thanks for…, Take care. Sin contracciones en lo formal.',pista:'¿A quién le escribes?',
  tarjetas:[['Abrir un correo formal','Dear Mr./Ms. + apellido, I am writing to…'],['Cerrar un correo formal','I look forward to hearing from you. Kind regards,'],['Pedir algo formalmente','Could you please…? / I would be grateful if you could…'],['Cerrar un correo informal','Take care / See you soon / Cheers,']],
  plantillas:{
    b1:K.dice([I('Estimada Sra. López,','Dear Ms. López,',[['Esteemed Ms. López','Se dice Dear Ms. López.']]),I('Le escribo para solicitar información',['I am writing to request information','I am writing to ask for information','I am writing to inquire about'],[['I write to you for ask information','Se dice I am writing to…']]),
      I('Le agradecería si pudiera…','I would be grateful if you could',[['I would thank if you can','Se dice I would be grateful if you could…']]),I('Cuídate (al cerrar un correo informal)',['Take care','Take care!'],[['Care yourself','Se dice Take care.']])],{prof:'basico'}),
    b2:K.significa([I('Please find attached my CV',['adjunto mi cv','le envio adjunto mi curriculum','adjunto mi curriculum','encuentre adjunto mi cv']),I('I look forward to hearing from you',['quedo en espera de su respuesta','espero su respuesta','quedo atento a su respuesta','espero tener noticias suyas']),
      I("Guess what!",['adivina que','¿adivina qué?','adivina']),I('Sorry for the late reply',['perdon por responder tarde','disculpa la demora en responder','perdón por la respuesta tardía'])]),
    p1:K.completa([I('Formal: I am writing ___ apply for the position of analyst.','to',[['for','Para el propósito: to + verbo.']],'I am writing to apply for the position of analyst.'),I('Formal: ___ you please send me the invoice?','Could',[['Can','Para lo formal: Could you please…?']],'Could you please send me the invoice?'),
      I('Formal: I look forward to ___ from you.','hearing',[['hear','look forward to + -ing.']],'I look forward to hearing from you.'),I('Informal: Thanks ___ your message!','for',[['to','Thanks for…']],'Thanks for your message!')]),
    p2:K.completa([I('Reescribe en formal: «Can you send me the price list?» → ___ the price list?',['Could you please send me','Could you send me','Would you please send me'],[['Can you send me','Para un correo formal: Could you please…?']],'Could you please send me the price list?'),
      I("Reescribe en formal: «I'm sorry I can't come.» → I ___ that I am unable to attend.",['regret to inform you','am sorry to inform you'],[["I'm sorry",'En formal se evitan contracciones: I regret to inform you…']],'I regret to inform you that I am unable to attend.'),
      I('Reescribe en informal: «Dear Mr. Smith» (a tu amigo Sam) → ___','Hi Sam',[['Dear Sam','Para un amigo: Hi Sam.']],'Hi Sam,')]),
    a1:K.situacion([I('Escribe la primera frase de un correo formal para pedir información sobre un curso.',['I am writing to request information about the course','I am writing to ask for information about the course','I am writing to inquire about the course','I am writing to enquire about the course'],[["I'm writing you for information about the course",'Formal y sin contracciones: I am writing to…']]),
      I('Escribe la frase de cierre de un correo formal (antes de «Kind regards»).',['I look forward to hearing from you','I look forward to your reply'],[['I wait your answer','Se dice I look forward to hearing from you.']]),
      I('Escribe a un amigo (informal): «¡gracias por la invitación, no puedo esperar a verte!».',["Thanks for the invitation, I can't wait to see you!","Thanks for inviting me! I can't wait to see you","Thanks for the invite! I can't wait to see you"],[["Thanks for the invitation, I can't wait for see you",'Se dice can\'t wait to see you.']])]),
    a2:K.dialogo([I('A (correo de un cliente): Could you confirm the delivery date?<br>B: (formal: con gusto; la entrega será el 15 de marzo)',['Certainly. The delivery will be on March 15th','Of course. The delivery date is March 15th','Certainly, the delivery will take place on March 15th','Of course. Delivery will be on March 15'],[['Sure! Delivery is in March 15','Formal y con on para la fecha.']]),
      I('A (correo de un amigo): Are you free this weekend?<br>B: (informal: ¡sí! ¿qué tienes en mente?)',["Yes! What do you have in mind?","Yes! What did you have in mind?","Yeah! What do you have in mind?"],[["Yes! What you have in mind?",'La pregunta necesita do.']])])
  }});

/* ---------- Contar historias ---------- */
const historias=bancoEn({titulo:'Contar historias',
  explicacion:'Una historia en inglés usa el <b>pasado simple</b> para los hechos (<i>I got up, I left</i>), el <b>pasado continuo</b> para el fondo (<i>It was raining</i>) y conectores de tiempo: <i>First, Then, After that, Suddenly, In the end, Finally</i>. Para dar emoción: <i>I couldn\'t believe it!</i>, <i>Luckily…</i>, <i>Unfortunately…</i>',
  alternativa:'Piensa en una tira cómica: cada viñeta es una acción en pasado simple, el fondo de la viñeta va en continuo y los conectores son las flechas entre viñetas.',
  referencia:'Cambridge B1 Preliminary – Writing: story',regla:'Hechos en past simple, fondo en past continuous, y conectores: first, then, after that, suddenly, luckily, in the end.',pista:'¿Hecho, fondo o conector?',
  tarjetas:[['«De repente»','Suddenly.'],['«Al final» (de la historia)','In the end.'],['«Por suerte» / «Por desgracia»','Luckily / Unfortunately.']],
  plantillas:{
    b1:K.dice([I('de repente','suddenly',[['of repent','Se dice suddenly.']]),I('al final (de la historia)','in the end',[['at the end','at the end va con «of…» (at the end of the day); para la conclusión: in the end.']]),
      I('por suerte','luckily',[['for luck','Se dice luckily.']]),I('después de eso','after that',[['after of that','Se dice after that.']])],{prof:'basico'}),
    b2:K.completa([I('It ___ (snow) when we arrived at the cabin.','was snowing',[['snowed','Para el fondo: was snowing.']],'It was snowing when we arrived at the cabin.'),I('___, the train was on time, so we didn\'t miss the flight. (por suerte)','Luckily',[['Unfortunately','Es algo bueno: Luckily.']],"Luckily, the train was on time."),
      I('We waited for hours. ___ the end, the concert was cancelled.','In',[['At','Para la conclusión: In the end.']],'In the end, the concert was cancelled.')],{prof:'basico'}),
    p1:K.completa([I('I was walking home when ___ (suddenly / hear) a strange noise.',['suddenly I heard','I suddenly heard'],[['suddenly I was hearing','Lo que interrumpe va en past simple: heard.']],'I was walking home when suddenly I heard a strange noise.'),
      I('First, we ___ (pack) the car. Then we ___ (drive) to the beach.',['packed, drove','packed drove'],[['packed, drived','drive → drove.']],'First, we packed the car. Then we drove to the beach.'),
      I("When I opened the door, I ___ (can not) believe it: everyone was there!","couldn't",[["can't",'Es pasado: couldn\'t.']],"I couldn't believe it!")]),
    p2:K.traduce([I('Por desgracia, perdí mi pasaporte.',['Unfortunately, I lost my passport'],[['Unfortunately, I losed my passport','lose → lost.']]),
      I('Mientras esperábamos, empezó a llover.',['While we were waiting, it started to rain','While we were waiting, it started raining','It started to rain while we were waiting'],[['While we waited, it was starting to rain','La interrupción (empezó) va en simple.']]),
      I('Al final, todo salió bien.',['In the end, everything went well','In the end, everything turned out fine','In the end, everything was fine'],[['At the end, everything went well','Para la conclusión: In the end.']])]),
    a1:K.situacion([I('A la mitad de tu historia agregas: «por desgracia, nadie tenía batería en el celular».',["Unfortunately, nobody had any battery on their phone","Unfortunately, no one had battery on their phone","Unfortunately, nobody's phone had any battery left"],[["Unfortunately, nobody hadn't battery on their phone",'nobody ya es negativo: nobody had.']]),I('Empieza una historia para tu clase: «era un viernes por la noche y estaba lloviendo».',['It was a Friday night and it was raining','It was Friday night and it was raining'],[['It was a Friday night and it rained','Para el fondo: it was raining.']]),
      I('Termina tu historia: «al final, encontramos el perro y nos fuimos a casa».',['In the end, we found the dog and went home','In the end we found the dog and we went home'],[['In the end, we finded the dog and went home','find → found.']])]),
    a2:K.dialogo([I('A: So what happened next?<br>B: (de repente, se fue la luz)',['Suddenly, the power went out','Suddenly, the lights went out','Suddenly the power went off'],[['Suddenly, the light was going out','La interrupción va en simple: went out.']]),
      I('A: Did you get to the airport on time?<br>B: (por suerte, sí; el vuelo estaba retrasado)',['Luckily, yes. The flight was delayed','Luckily, yes, the flight was delayed','Luckily yes, because the flight was delayed'],[['Luckily, yes. The flight is delayed','Es pasado: was delayed.']])])
  }});

/* ---------- Opinar y argumentar ---------- */
const opinar=bancoEn({titulo:'Opinar y argumentar',
  explicacion:'Opinar: <i>I think…, In my opinion…, I believe…, Personally,…</i>. Estar de acuerdo o no: <i>I agree (with you)</i> (¡no «I\'m agree»!), <i>I don\'t agree / I disagree</i>, <i>That\'s a good point, but…</i>. Argumentar: <i>First of all…, Another reason is…, For example…, On the other hand…, That\'s why…</i>',
  alternativa:'Una opinión fuerte tiene tres piezas: lo que piensas (I think…), por qué (because…) y un ejemplo (For example…). Con eso ya argumentas.',
  referencia:'MCER B1 – Expresar y justificar opiniones',regla:'I think / In my opinion + razón (because) + ejemplo (for example). I agree / I disagree (nunca «I\'m agree»). On the other hand para contrastar.',pista:'Opinión + razón + ejemplo.',
  tarjetas:[['«Estoy de acuerdo»','I agree (no «I\'m agree»).'],['«Por otro lado»','On the other hand.'],['«En mi opinión»','In my opinion (no «in my opinion I think»).']],
  plantillas:{
    b1:K.dice([I('Estoy de acuerdo','I agree',[["I'm agree",'agree es un verbo: I agree.']]),I('No estoy de acuerdo',["I don't agree",'I disagree'],[["I'm not agree",'Se dice I don\'t agree.']]),
      I('en mi opinión','in my opinion',[['in my opinión I think','Basta in my opinion.'],['for my opinion','Se dice in my opinion.']]),I('por otro lado','on the other hand',[['for other side','Se dice on the other hand.']])],{prof:'basico'}),
    b2:K.completa([I('I agree ___ you.','with',[['to','Se dice agree with.']],'I agree with you.'),I("That's a good point, ___ I think it's too expensive.",'but',[['and','Para contrastar: but.']],"That's a good point, but I think it's too expensive."),
      I('Working from home saves time. ___ the other hand, it can be lonely.','On',[['In','Se dice On the other hand.']],'On the other hand, it can be lonely.')],{prof:'basico'}),
    p1:K.traduce([I('Creo que deberíamos contratar a más gente.',['I think we should hire more people','I think we should hire more staff'],[['I think that we should to hire more people','should va sin to.']]),
      I('Personalmente, prefiero trabajar en la oficina.',['Personally, I prefer working in the office','Personally, I prefer to work in the office','Personally, I prefer working at the office'],[['Personally, I prefer work in the office','prefer + -ing o to.']]),
      I('Otra razón es que es más barato.',["Another reason is that it's cheaper","Another reason is that it is cheaper"],[["Other reason is that it's cheaper",'Se dice Another reason.']])]),
    p2:K.completa([I('In my opinion, social media is useful ___ it helps people stay in touch.','because',[['so','Para la razón: because.']],'In my opinion, social media is useful because it helps people stay in touch.'),
      I('Cities should have more bike lanes. ___ example, Amsterdam has very little traffic.','For',[['By','Se dice For example.']],'For example, Amsterdam has very little traffic.'),
      I("It's cheaper and faster. That's ___ I prefer the train.",'why',[['because','Para la conclusión: That\'s why.']],"That's why I prefer the train.")]),
    a1:K.situacion([I('Das un ejemplo para apoyar tu idea: «por ejemplo, en mi equipo la productividad subió 20 %».',["For example, in my team productivity went up by 20%","For example, productivity in my team went up 20%","For example, in my team productivity increased by 20%"],[["By example, in my team productivity went up by 20%",'Se dice For example.']]),I('En una junta das tu opinión: «en mi opinión, el proyecto necesita más tiempo».',['In my opinion, the project needs more time','I think the project needs more time','In my opinion the project needs more time'],[['In my opinion, the project need more time','the project = it: needs.']]),
      I('Contestas con cortesía a una idea con la que no estás de acuerdo.',["That's a good point, but I don't agree","I see your point, but I disagree","I understand, but I don't agree","That's a good point, but I see it differently"],[["That's a good point, but I'm not agree",'Se dice I don\'t agree.']])]),
    a2:K.dialogo([I('A: I think remote work is better.<br>B: (estoy de acuerdo, ahorras mucho tiempo)',['I agree. You save a lot of time','I agree, you save a lot of time','I agree with you. You save a lot of time'],[["I'm agree. You save a lot of time",'Se dice I agree.']]),
      I('A: Should we ban phones in schools?<br>B: (no creo; los estudiantes los usan para investigar)',["I don't think so. Students use them for research","I don't think so, students use them to do research"],[["I think no. Students use them for research",'Se dice I don\'t think so.']])])
  }});

/* ---------- Entrevista de trabajo ---------- */
const entrevista=bancoEn({titulo:'Entrevista de trabajo',
  explicacion:'Preguntas típicas: <i>Tell me about yourself</i>, <i>Why do you want this job?</i>, <i>What are your strengths / weaknesses?</i>, <i>Where do you see yourself in five years?</i> Respuestas útiles: <i>I have three years of experience in…</i>, <i>I\'m good at…</i>, <i>I\'m responsible for…</i>, <i>I\'m looking for a new challenge</i>, <i>Do you have any questions for us?</i> → <i>What does a typical day look like?</i>',
  alternativa:'Prepara tres piezas: quién eres (experiencia), qué haces bien (con un ejemplo) y por qué ellos. Con esas tres contestas casi todo.',
  referencia:'MCER B1 – Entrevistas',regla:'I have X years of experience in…; I\'m good at + -ing; I\'m responsible for + -ing; I\'m looking for…; strengths / weaknesses.',pista:'Experiencia, fortalezas y motivo.',
  tarjetas:[['«Tengo 3 años de experiencia en…»','I have three years of experience in…'],['«Soy bueno para…»','I\'m good at + -ing / sustantivo.'],['fortalezas y debilidades','strengths and weaknesses.'],['Pregunta para el entrevistador','What does a typical day look like?']],
  plantillas:{
    b1:K.dice([I('fortalezas','strengths',[['fortitudes','Se dice strengths.']]),I('Tengo cinco años de experiencia',['I have five years of experience',"I've got five years of experience","I have five years' experience"],[['I have five years of experiences','experience (experiencia laboral) es incontable.']]),
      I('Soy bueno para resolver problemas',["I'm good at solving problems","I'm good at problem-solving","I'm good at problem solving"],[["I'm good in solving problems",'Se dice good at.']]),I('Busco un nuevo reto',["I'm looking for a new challenge"],[["I'm searching a new challenge",'Se dice looking for.']])],{prof:'basico'}),
    b2:K.significa([I('Tell me about yourself',['hablame de ti','háblame de ti','cuentame sobre ti','hableme de usted']),I('Where do you see yourself in five years?',['donde te ves en cinco anos','dónde te ves en cinco años','donde se ve en cinco años']),
      I('What are your weaknesses?',['cuales son tus debilidades','cuáles son sus debilidades','cuales son tus puntos debiles']),I('We will be in touch',['nos pondremos en contacto','te contactaremos','estaremos en contacto'])]),
    p1:K.completa([I("I'm responsible ___ managing the team.",'for',[['of','Se dice responsible for.']],"I'm responsible for managing the team."),I("I'm very good ___ working under pressure.",'at',[['in','Se dice good at.']],"I'm very good at working under pressure."),
      I('I have three years of ___ in sales.','experience',[['experiences','Experiencia laboral: experience (sin -s).']],'I have three years of experience in sales.'),I("I'm applying ___ the marketing position.",'for',[['to','Para un puesto: apply for.']],"I'm applying for the marketing position.")]),
    p2:K.traduce([I('Me interesa este puesto porque me gusta trabajar con datos.',["I'm interested in this position because I like working with data","I'm interested in this job because I enjoy working with data","I'm interested in this position because I like to work with data"],[["I'm interesting in this position because I like working with data",'interested (yo siento interés), no interesting.']]),
      I('Una de mis debilidades es que soy perfeccionista.',["One of my weaknesses is that I'm a perfectionist","One of my weaknesses is that I am a perfectionist"],[["One of my weakness is that I'm a perfectionist",'one of my + plural: weaknesses.']]),
      I('¿Cómo es un día típico en este puesto?',['What does a typical day look like in this position?','What is a typical day like in this role?','What does a typical day look like in this role?'],[['How is a typical day in this position?','Lo natural: What is a typical day like…?']])]),
    a1:K.situacion([I('Te dicen «Tell me about yourself». Empieza: «soy analista de datos con cuatro años de experiencia».',["I'm a data analyst with four years of experience","I am a data analyst with four years of experience","I'm a data analyst and I have four years of experience"],[["I'm data analyst with four years of experience",'Con profesión: a data analyst.']]),
      I('Te preguntan por qué quieres el trabajo: «me gustaría crecer en una empresa internacional».',["I'd like to grow in an international company","I would like to grow at an international company","I'd like to develop my career in an international company"],[["I'd like growing in an international company",'would like + to.']]),
      I('Al final de la entrevista, agradece su tiempo.',['Thank you for your time','Thanks for your time','Thank you very much for your time'],[['Thank you for you time','Tu/su = your.']])]),
    a2:K.dialogo([I('A: What are your strengths?<br>B: (me organizo muy bien y aprendo rápido)',["I'm very organized and I learn quickly","I'm very organized and I learn fast","I'm well organized and I'm a fast learner"],[["I'm very organize and I learn quickly",'El adjetivo es organized.']]),
      I('A: Why did you leave your last job?<br>B: (buscaba más responsabilidades)',['I was looking for more responsibility','I was looking for more responsibilities','I wanted more responsibility'],[['I was searching more responsibility','Se dice looking for.']]),
      I('A: Do you have any questions for us?<br>B: (sí, ¿cuándo sería la fecha de inicio?)',['Yes, when would the start date be?','Yes, what would the start date be?','Yes, when is the start date?'],[['Yes, when would be the start date?','Orden: when would the start date be?']])])
  }});

/* ---------- Lecturas graduadas B1 ---------- */
const TX={
  articulo:'<p lang="en" class="lectura">More and more companies are offering a four-day working week. In a recent trial in the UK, 61 companies reduced working hours without cutting salaries. At the end of six months, most of them decided to continue with the new schedule. Employees reported less stress and better sleep, while managers said that productivity stayed the same or even improved. However, the system does not work for every business: hospitals and shops, for example, need staff every day.</p>',
  resena:'<p lang="en" class="lectura">I had high expectations for this phone, and in some ways it didn\'t disappoint. The camera is excellent, especially at night, and the screen is bright and sharp. On the other hand, the battery is a real problem: it barely lasts a full day, and charging takes almost two hours. The price is also quite high. If photography is your priority, it\'s worth it. If not, there are cheaper options that do the job.</p>',
  aviso:'<p lang="en" class="lectura">IMPORTANT: Phishing alert. Several employees have received emails that appear to come from the IT department asking them to "confirm" their passwords. These messages are fake. The IT department will never ask for your password by email. If you receive one of these emails, do not click any links. Forward it to security@company.com and then delete it. If you have already clicked a link, change your password immediately and call the help desk.</p>'
};
const R3=(t,p)=>`${TX[t]}${p}`;
const lecturasB1=bancoEn({titulo:'Lecturas graduadas B1',
  explicacion:'En B1 los textos (100–150 palabras) dan opiniones y matices. Además de buscar datos, identifica: la <b>idea principal</b> (¿de qué trata el texto?), la <b>opinión</b> del autor (palabras como <i>excellent, a real problem, worth it</i>) y los <b>conectores de contraste</b> (<i>however, on the other hand, while</i>), que suelen anunciar la información importante.',
  alternativa:'Lee en dos pasadas: la primera rápida, para saber de qué trata; la segunda lenta, solo en la parte donde está la respuesta.',
  referencia:'Cambridge B1 Preliminary – Reading',regla:'Idea principal en la primera y última frase; opinión en adjetivos valorativos; contraste en however / on the other hand.',pista:'Busca el conector de contraste.',
  tarjetas:[['however','sin embargo (anuncia un contraste).'],['worth it','vale la pena.'],['Idea principal','Suele estar en la primera y en la última frase.']],
  plantillas:{
    b1:{prof:'basico',enun:it=>it.q,que:'Busca el dato en el texto',como:()=>'Ubica la palabra clave.',porque:'El dato está en el texto.',items:[
      I(R3('articulo','How many companies took part in the UK trial?'),['61','Sixty-one','61 companies','sixty one'],[]),
      I(R3('resena','How long does charging take?'),['Almost two hours','almost 2 hours','About two hours','nearly two hours','Two hours'],[['A full day','Eso es lo que dura la batería.']]),
      I(R3('aviso','Where should you forward a suspicious email?'),['To security@company.com','security@company.com'],[['To the IT department','El correo se reenvía a security@company.com.']])]},
    b2:{prof:'basico',es:true,enun:it=>it.q,que:'Adivina por el contexto',como:()=>'Mira las palabras de alrededor.',porque:'El contexto explica la palabra.',items:[
      I(R3('articulo','¿Qué significa «trial» en el artículo?'),['prueba','periodo de prueba','ensayo','experimento','piloto','prueba piloto'],[['juicio','En otro contexto sí, pero aquí es una prueba.']]),
      I(R3('resena','¿Qué significa «it\'s worth it»?'),['vale la pena','lo vale']),
      I(R3('aviso','¿Qué significa «fake» en el aviso?'),['falsos','falso','falsas']),
      I(R3('resena','¿Qué significa «barely lasts a full day»?'),['apenas dura un dia completo','apenas aguanta un dia','casi no dura un dia','apenas dura un día'])]},
    p1:{prof:'procedimiento',es:true,enun:it=>`${it.q}<br><span class="nota">Escribe <b>verdadero</b> o <b>falso</b>.</span>`,que:'Compara con el texto',como:()=>'Busca la frase exacta.',porque:'Los matices (most, never, every) cambian el sentido.',items:[
      I(R3('articulo','«All the companies decided to continue.»'),['falso','false','f'],[['verdadero','Dice most of them (la mayoría), no todas.']]),
      I(R3('articulo','«Employees earned less money.»'),['falso','false','f'],[['verdadero','Dice without cutting salaries.']]),
      I(R3('aviso','«The IT department sometimes asks for passwords by email.»'),['falso','false','f'],[['verdadero','Dice will never ask.']]),
      I(R3('resena','«The writer thinks the camera is very good.»'),['verdadero','true','v'],[['falso','Dice The camera is excellent.']])]},
    p2:{prof:'procedimiento',enun:it=>it.q,que:'Identifica la idea principal o el contraste',como:()=>'Fíjate en however / on the other hand.',porque:'El contraste marca lo importante.',items:[
      I(R3('articulo','According to the text, which businesses can\'t easily use a four-day week? (in English)'),['Hospitals and shops','hospitals and shops'],[['Offices','El texto da como ejemplo hospitales y tiendas.']]),
      I(R3('resena','What is the main problem with the phone?'),['The battery','the battery','Its battery','The battery life'],[['The camera','La cámara es lo mejor; el problema es la batería.']]),
      I(R3('aviso','What should you do if you have already clicked a link?'),['Change your password immediately and call the help desk','Change your password and call the help desk','Change your password immediately','Change my password and call the help desk'])]},
    a1:{prof:'aplicacion',es:true,enun:it=>it.q,que:'Aplica el texto a una decisión',como:()=>'Busca la parte que te afecta.',porque:'Leer sirve para decidir.',items:[
      I(R3('resena','Un amigo quiere un teléfono barato con buena batería. Según la reseña, ¿le conviene este? (sí o no)'),['no'],[['si','La batería es el gran problema y el precio es alto.']]),
      I(R3('aviso','Recibes un correo «de TI» que pide tu contraseña. Según el aviso, ¿qué es lo primero que NO debes hacer? (en español, corto)'),['no dar clic en los enlaces','no hacer clic en ningun enlace','no dar clic','no abrir los enlaces','no hacer clic en los links','no hacer clic']),
      I(R3('articulo','¿El artículo está a favor o en contra de la semana de cuatro días? (a favor / en contra / neutral)'),['a favor','neutral'],[['en contra','Presenta sobre todo resultados positivos, con un límite al final.']])]},
    a2:{prof:'aplicacion',enun:it=>it.q,que:'Resume en inglés',como:()=>'Una frase con la idea central.',porque:'Resumir demuestra que entendiste.',items:[
      I(R3('aviso','In one short sentence, what is the main message of the notice?'),["Don't give your password by email","The emails asking for passwords are fake","Never send your password by email","Some emails asking for your password are fake"]),
      I(R3('resena','Who is the phone good for, according to the writer?'),['People who care about photography','For people who love photography','People whose priority is photography','People who like taking photos'])]}
  }});

export default {'en/pasado-continuo':pasadoContinuo,'en/condicionales':condicionales,'en/pasiva':pasiva,'en/modales':modales,'en/relativas':relativas,'en/gerundio-infinitivo':gerundio,
  'en/phrasal-verbs':phrasal,'en/tecnologia':tecnologia,'en/medio-ambiente':ambiente,'en/correos':correos,'en/historias':historias,'en/opinar':opinar,'en/entrevista':entrevista,'en/lecturas-b1':lecturasB1};
