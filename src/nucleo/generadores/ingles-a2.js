/* Inglés A2: futuro, comparativos, contables, frecuencia, should, vocabulario en contexto (viajes, salud, trabajo, clima),
   experiencias, pronunciación, lecturas graduadas y correos cortos. 6 plantillas por habilidad (ver ingles-base.js). */
import {bancoEn,K,I,en} from './extensiones/ingles-base.js';

/* ---------- Going to y will ---------- */
const futuro=bancoEn({titulo:'Futuro: going to y will',
  explicacion:'<b>going to</b> + verbo para planes ya decididos (<i>I\'m going to study tonight</i>) y para predicciones con evidencia (<i>Look at the clouds: it\'s going to rain</i>). <b>will</b> + verbo para decisiones en el momento (<i>I\'ll have the soup</i>), promesas y ofrecimientos (<i>I\'ll help you</i>) y predicciones de opinión (<i>I think it will be fine</i>). Negativo: <i>won\'t</i>.',
  alternativa:'going to = «ya lo tengo en la agenda». will = «lo decido ahora» o «te lo prometo». Si el mesero te pregunta y decides en ese momento: <i>I\'ll have…</i>',
  referencia:'Cambridge A2 Key · Murphy EGU – Going to y will',regla:'Plan decidido o evidencia: am/is/are going to + verbo. Decisión del momento, promesa u ofrecimiento: will + verbo (won\'t).',pista:'¿Ya estaba decidido o lo decides ahora?',
  tarjetas:[['Plan ya decidido','be going to + verbo (I\'m going to visit my mom).'],['Decisión en el momento / ofrecimiento','will (I\'ll call her now; I\'ll help you).'],['Negativo de will','won\'t (= will not).']],
  plantillas:{
    b1:K.completa([I("I ___ (visitar, ya lo planeé) my grandma this weekend.",["am going to visit","'m going to visit"],[['will visit','Es un plan ya decidido: going to.']],"I'm going to visit my grandma this weekend."),
      I("The phone is ringing. — I ___ (contestar, lo decido ahora) it!",["'ll answer","will answer"],[['am going to answer','Lo decides en el momento: will.']],"I'll answer it!"),
      I("Look at those clouds! It ___ (llover).",["is going to rain","'s going to rain"],[['will rain','Hay evidencia: going to.']],"It's going to rain."),
      I("Don't worry, I ___ (no) tell anyone. (promesa)",["won't","will not"],[["don't",'Promesa en futuro: won\'t.']],"I won't tell anyone."),
      I("She ___ (empezar) a new job in May. (ya firmó)",["is going to start","'s going to start","is starting"],[['will starts','Después de will, verbo base; y es un plan: going to.']],"She's going to start a new job in May.")],{prof:'basico',que:'¿Plan decidido, evidencia, o decisión del momento?'}),
    b2:K.dice([I('Te ayudo (ofrecimiento)',["I'll help you"],[["I help you",'Para ofrecer ayuda: I\'ll help you.']]),I('Voy a comprar un carro (ya lo decidí)',["I'm going to buy a car"],[['I will to buy a car','Después de will no va to; y para un plan: going to.']]),
      I('No va a funcionar',["It won't work","It isn't going to work","It's not going to work"],[["It will not to work",'will va sin to.']]),I('¿Qué vas a hacer mañana?',['What are you going to do tomorrow?'],[['What you will do tomorrow?','En la pregunta: What are you going to do…?']])]),
    p1:K.traduce([I('Creo que mañana va a hacer calor.',["I think it'll be hot tomorrow","I think it will be hot tomorrow","I think it's going to be hot tomorrow"],[['I think tomorrow will make heat','Calco: se dice it\'ll be hot.']]),
      I('Vamos a mudarnos en junio.',["We're going to move in June","We are moving in June","We're moving in June"],[["We will to move in June",'will va sin to; para un plan: going to.']]),
      I('No voy a ir a la boda.',["I'm not going to go to the wedding","I won't go to the wedding","I'm not going to the wedding"],[["I don't go to the wedding",'Es futuro: I\'m not going to go / I won\'t go.']]),
      I('¿Me llamas cuando llegues? (pídelo con will)',['Will you call me when you arrive?','Will you call me when you get there?','Will you call me when you get here?'],[['Will you call me when you will arrive?','Después de when, presente: when you arrive.']])]),
    p2:K.completa([I("I'll call you when I ___ (llegar) home.",['get','arrive'],[['will get','Después de when, presente: when I get home.']],"I'll call you when I get home."),
      I("A: I'm cold. B: I ___ close the window.","'ll",[['am going to','Lo decides en el momento: I\'ll.']],"I'll close the window."),
      I('A: Are you going to apply for the job? B: Yes, I ___.','am',[['will','La pregunta es con be going to: Yes, I am.']],'Yes, I am.'),
      I("If it rains, we ___ stay at home.","'ll",[['are','Primer condicional: will.']],"If it rains, we'll stay at home.")]),
    a1:K.situacion([I('El mesero pregunta qué vas a pedir. Lo decides en ese momento: el pescado.',["I'll have the fish, please","I'll have the fish","I'll take the fish, please"],[["I'm going to have the fish",'Para una decisión del momento suena más natural I\'ll have.']]),
      I('Le cuentas a tu equipo tu plan: «el próximo año voy a estudiar una maestría».',["Next year I'm going to do a master's degree","I'm going to study for a master's degree next year","Next year I'm going to study a master's","I'm going to do a master's next year"],[["Next year I will to study a master's",'will va sin to; para un plan: going to.']]),
      I('Tu compañero tiene mucho trabajo. Ofrécele ayuda con la presentación.',["I'll help you with the presentation","I can help you with the presentation","Do you want me to help you with the presentation?","Shall I help you with the presentation?"],[["I help you with the presentation",'Para ofrecer: I\'ll help you.']])]),
    a2:K.dialogo([I('A: What are your plans for the summer?<br>B: (vamos a viajar a Perú)',["We're going to travel to Peru","We're going to Peru","We are going to travel to Peru","We're traveling to Peru"],[['We will to travel to Peru','will va sin to.']]),
      I("A: I forgot my wallet!<br>B: (no te preocupes, yo pago)",["Don't worry, I'll pay","No worries, I'll pay","Don't worry, I'll get it"],[["Don't worry, I pay",'Ofrecimiento del momento: I\'ll pay.']]),
      I('A: Do you think the team will win?<br>B: (sí, creo que van a ganar)',["Yes, I think they'll win","Yes, I think they will win","Yes, I think they're going to win"],[['Yes, I think they will to win','will va sin to.']])])
  }});

/* ---------- Comparativos y superlativos ---------- */
const comparativos=bancoEn({titulo:'Comparativos y superlativos',
  explicacion:'Adjetivos cortos: <i>cheap → cheaper than → the cheapest</i>; con -y: <i>easy → easier → the easiest</i>; una vocal + consonante: <i>big → bigger</i>. Largos (2+ sílabas): <i>more expensive than → the most expensive</i>. Irregulares: <i>good → better → the best</i>, <i>bad → worse → the worst</i>, <i>far → farther</i>. Igualdad: <i>as tall as</i>.',
  alternativa:'Mide la palabra: si es corta, ponle -er / -est; si es larga, ponle more / most delante. Nunca las dos: no existe «more cheaper».',
  referencia:'Cambridge A2 Key · Murphy EGU – Comparativos y superlativos',regla:'Corto: -er than / the -est. Largo: more … than / the most … Irregulares: better/best, worse/worst. Igualdad: as … as.',pista:'¿Es una palabra corta o larga?',
  tarjetas:[['Comparativo de good','better (the best).'],['Comparativo de expensive','more expensive (the most expensive).'],['«Tan alto como»','as tall as.'],['Comparativo de big','bigger (se dobla la g).']],
  plantillas:{
    b1:K.completa([I('This phone is ___ than that one. (cheap)','cheaper',[['more cheap','cheap es corto: cheaper.']],'This phone is cheaper than that one.'),I('Math is ___ than history for me. (easy)','easier',[['easyer','-y → -ier: easier.'],['more easy','easy es corto: easier.']],'Math is easier than history for me.'),
      I('My new job is ___ than the old one. (good)','better',[['gooder','good es irregular: better.'],['more good','good es irregular: better.']],'My new job is better than the old one.'),
      I('Today is the ___ day of the year. (hot)','hottest',[['hotest','Una vocal + t: se dobla: hottest.']],'Today is the hottest day of the year.'),
      I('This is the ___ restaurant in town. (expensive)','most expensive',[['expensivest','Palabra larga: the most expensive.']],'This is the most expensive restaurant in town.')],{prof:'basico',que:'¿Comparativo o superlativo, corto o largo?'}),
    b2:K.dice([I('más grande que','bigger than',[['more big than','big es corto: bigger.'],['biger than','Se dobla la g: bigger.']]),I('el peor','the worst',[['the baddest','bad es irregular: the worst.']]),
      I('tan rápido como','as fast as',[['so fast like','Igualdad: as fast as.']]),I('más interesante que','more interesting than',[['interestinger than','Palabra larga: more interesting.']])]),
    p1:K.traduce([I('Mi hermana es más alta que yo.',['My sister is taller than me','My sister is taller than I am'],[['My sister is more tall than me','tall es corto: taller.']]),
      I('Es el mejor café de la ciudad.',["It's the best coffee in the city","It's the best coffee in town"],[["It's the best coffee of the city",'Con superlativo y lugar: in the city.']]),
      I('El tren es menos caro que el avión.',['The train is cheaper than the plane','The train is less expensive than the plane'],[['The train is less cheap than the plane','Lo natural: cheaper o less expensive.']]),
      I('Este examen no es tan difícil como el anterior.',["This exam isn't as difficult as the last one","This exam is not as hard as the previous one","This test isn't as difficult as the last one"],[["This exam isn't so difficult like the last one",'Igualdad negativa: not as … as.']])]),
    p2:K.completa([I('Lima is ___ than Cusco. (far from here)','farther',[['farer','far es irregular: farther (o further).']],'Lima is farther than Cusco.'),I("He's the ___ person I know. (funny)",'funniest',[['most funny','funny termina en -y: funniest.']],"He's the funniest person I know."),
      I('My car is ___ as yours. (old)','as old',[['older','Con as … as: as old as.']],'My car is as old as yours.'),I("This is ___ movie I've ever seen. (bad)",'the worst',[['the baddest','bad es irregular: the worst.']],"This is the worst movie I've ever seen.")]),
    a1:K.situacion([I('Comparas dos laptops para tu jefe: «la Dell es más ligera pero más cara».',["The Dell is lighter but more expensive","The Dell is lighter, but it's more expensive","The Dell laptop is lighter but more expensive"],[['The Dell is more light but more expensive','light es corto: lighter.']]),
      I('Recomiendas un lugar: «es el restaurante más barato cerca de la oficina».',["It's the cheapest restaurant near the office","It is the cheapest restaurant near the office"],[["It's the most cheap restaurant near the office",'cheap es corto: the cheapest.']]),
      I('Te preguntan cómo está tu salud: «me siento mucho mejor que ayer».',["I feel much better than yesterday","I'm feeling much better than yesterday","I feel a lot better than yesterday"],[['I feel much more good than yesterday','good es irregular: better.']])]),
    a2:K.dialogo([I('A: Which is faster, the bus or the subway?<br>B: (el metro es más rápido)',['The subway is faster','The subway is faster than the bus','The metro is faster'],[['The subway is more fast','fast es corto: faster.']]),
      I('A: What was the best part of your trip?<br>B: (la mejor parte fue la comida)',['The best part was the food','The food was the best part'],[['The better part was the food','Superlativo: the best.']]),
      I('A: Is your new apartment big?<br>B: (sí, es más grande que el anterior)',["Yes, it's bigger than the old one","Yes, it's bigger than my old one","Yes, it is bigger than the last one"],[["Yes, it's more big than the old one",'big es corto: bigger.']])])
  }});

/* ---------- Contables e incontables ---------- */
const contables=bancoEn({titulo:'Contables e incontables',
  explicacion:'Contables (se cuentan: <i>an apple, two apples</i>) e incontables (no se cuentan ni llevan -s: <i>water, money, information, advice, furniture, news</i>). Con contables plurales: <i>many, a few, How many?</i>; con incontables: <i>much, a little, How much?</i>; con los dos: <i>some</i> (afirmativo), <i>any</i> (negativo y preguntas), <i>a lot of</i>.',
  alternativa:'Pregúntate: ¿le puedo poner un número delante? «tres manzanas» sí → contable; «tres informaciones» no → incontable. Para contarlo usa un envase: <i>a piece of advice, a bottle of water</i>.',
  referencia:'Cambridge A2 Key · Murphy EGU – Countable/uncountable, some/any, much/many',regla:'many / a few + contable plural; much / a little + incontable; some en afirmativo, any en negativo y preguntas; a lot of con los dos.',pista:'¿Se puede contar?',
  tarjetas:[['¿information es contable?','No: some information (no «informations»).'],['How much o How many con money','How much money?'],['some o any en una pregunta','any (Do you have any questions?).'],['«Un consejo»','a piece of advice.']],
  plantillas:{
    b1:K.completa([I('How ___ people work here?','many',[['much','people se cuenta: many.']],'How many people work here?'),I('How ___ money do you need?','much',[['many','money no se cuenta: much.']],'How much money do you need?'),
      I('I need some ___. (información)','information',[['informations','information no tiene plural.']],'I need some information.'),I("We don't have ___ milk.",'any',[['some','En negativo: any.']],"We don't have any milk."),
      I('There are ___ eggs in the fridge. (unos pocos)','a few',[['a little','eggs se cuenta: a few.']],'There are a few eggs in the fridge.')],{prof:'basico',que:'¿Contable o incontable?'}),
    b2:K.dice([I('un consejo','a piece of advice',[['an advice','advice es incontable: a piece of advice.']]),I('las noticias son buenas','the news is good',[['the news are good','news es incontable: is.']]),
      I('muebles nuevos','new furniture',[['new furnitures','furniture no tiene plural.']]),I('un poco de azúcar','a little sugar',[['a few sugar','sugar es incontable: a little.']])]),
    p1:K.traduce([I('¿Tienes alguna pregunta?',['Do you have any questions?','Have you got any questions?'],[['Do you have some questions?','En preguntas: any.']]),
      I('No tengo mucho tiempo.',["I don't have much time","I haven't got much time"],[["I don't have many time",'time es incontable: much.']]),
      I('Me dio muy buenos consejos.',['He gave me very good advice','She gave me some very good advice','He gave me great advice'],[['He gave me very good advices','advice no tiene plural.']]),
      I('Hay mucho tráfico y muchos coches.',["There's a lot of traffic and a lot of cars","There is a lot of traffic and many cars","There's a lot of traffic and lots of cars"],[['There are many traffic and many cars','traffic es incontable.']])]),
    p2:K.completa([I("Can I have ___ water, please?",'some',[['any','Para pedir u ofrecer: some.']],'Can I have some water, please?'),I("There isn't ___ information about it.",'much',[['many','information es incontable: much.']],"There isn't much information about it."),
      I('I have ___ friends in Chile. (unos pocos)','a few',[['a little','friends se cuenta: a few.']],'I have a few friends in Chile.'),I('How ___ luggage do you have?','much',[['many','luggage es incontable: much.']],'How much luggage do you have?')]),
    a1:K.situacion([I('En el aeropuerto te preguntan por tu equipaje: di que solo traes una maleta.',["I only have one suitcase","I just have one suitcase","Only one suitcase"],[['I only have one luggage','luggage es incontable; se cuenta con suitcase o a piece of luggage.']]),
      I('Pides a soporte más información sobre el error.',["Can you give me more information about the error?","Could you send me more information about the error?","Can I have more information about the error?","Could you give me more information about the error?"],[['Can you give me more informations about the error?','information no tiene plural.']]),
      I('Haces la lista del súper: «necesitamos arroz, unos huevos y un poco de queso».',["We need rice, some eggs and a little cheese","We need some rice, some eggs and a little cheese","We need rice, a few eggs and some cheese"],[['We need rice, some eggs and a few cheese','cheese es incontable: a little / some.']])]),
    a2:K.dialogo([I('A: How many coffees do you drink a day?<br>B: (no muchos, uno o dos)',['Not many, one or two','Not many. One or two'],[['Not much, one or two','Con coffees (tazas): many.']]),
      I('A: Is there any bread?<br>B: (sí, hay un poco)',["Yes, there's a little","Yes, there's some","Yes, there is some","Yes, there's a bit"],[["Yes, there are a few",'bread es incontable.']]),
      I('A: Do you need any help?<br>B: (no, gracias, no necesito ayuda)',["No, thanks. I don't need any help","No, thank you, I don't need any help","No, thanks, I don't need help"],[["No, thanks. I don't need some help",'En negativo: any.']])])
  }});

/* ---------- Adverbios de frecuencia ---------- */
const frecuencia=bancoEn({titulo:'Adverbios de frecuencia',
  explicacion:'De más a menos: <i>always</i> (100 %), <i>usually</i>, <i>often</i>, <i>sometimes</i>, <i>rarely / hardly ever</i>, <i>never</i> (0 %). Van <b>antes del verbo principal</b> (<i>I usually walk</i>) pero <b>después de be</b> (<i>She is never late</i>). Expresiones más largas van al final: <i>once a week, twice a month, every day</i>. Pregunta: <i>How often…?</i>',
  alternativa:'Imagina el adverbio como una etiqueta pegada al verbo: se pega por delante a casi todos (<i>always eat</i>), pero a <i>be</i> por detrás (<i>is always</i>).',
  referencia:'Cambridge A2 Key · Murphy EGU – always, usually, never',regla:'Adverbio antes del verbo principal y después de be. once/twice a week, every day al final. Pregunta: How often…?',pista:'¿El verbo es be o otro?',
  tarjetas:[['Posición con be','después: She is always happy.'],['Posición con otros verbos','antes: I never drink coffee.'],['«Dos veces a la semana»','twice a week.'],['Preguntar la frecuencia','How often do you…?']],
  plantillas:{
    b1:K.dice([I('Nunca como carne',['I never eat meat'],[["I don't never eat meat",'never ya es negativo: I never eat meat.'],['I eat never meat','El adverbio va antes del verbo.']]),I('Siempre llega tarde',["He's always late","She's always late","He always arrives late","She always arrives late"],[['He always is late','Con be, el adverbio va después.']]),
      I('dos veces por semana','twice a week',[['two times for week','Se dice twice a week.']]),I('¿Qué tan seguido vas al gym?',['How often do you go to the gym?'],[['How much do you go to the gym?','Para la frecuencia: How often.']])],{prof:'basico'}),
    b2:K.completa([I('I ___ coffee. (casi nunca tomo)',['hardly ever drink','rarely drink','almost never drink'],[['drink hardly ever','El adverbio va antes del verbo.']],'I hardly ever drink coffee.'),I('The office ___ on Sundays. (siempre está cerrada)','is always closed',[['always is closed','Con be, el adverbio va después.']],'The office is always closed on Sundays.'),
      I('We ___ out on Fridays. (normalmente comemos)','usually eat',[['eat usually','El adverbio va antes del verbo.']],'We usually eat out on Fridays.'),I('I see my parents ___. (una vez al mes)','once a month',[['one time for month','Se dice once a month.']],'I see my parents once a month.')],{prof:'basico'}),
    p1:K.traduce([I('A veces trabajo los sábados.',['I sometimes work on Saturdays','Sometimes I work on Saturdays','I work on Saturdays sometimes'],[['I work sometimes on Saturdays','El adverbio va antes del verbo.']]),
      I('Mi jefe casi nunca está en la oficina.',["My boss is hardly ever in the office","My boss is rarely in the office","My boss is almost never in the office","My boss is hardly ever at the office"],[['My boss hardly ever is in the office','Con be, el adverbio va después.']]),
      I('Reviso mi correo tres veces al día.',['I check my email three times a day'],[['I check my email three times for day','Se dice three times a day.']])]),
    p2:K.completa([I('A: How ___ do you travel? B: About twice a year.','often',[['much','Para la frecuencia: How often.']],'How often do you travel?'),I("She ___ forgets her keys. (a menudo)",'often',[['many times','Una palabra: often.']],'She often forgets her keys.'),
      I("They're ___ busy in December. (normalmente)",'usually',[['use','«Normalmente» es usually.']],"They're usually busy in December.")]),
    a1:K.situacion([I('En una entrevista te preguntan por el trabajo en equipo: «normalmente trabajo con otras cinco personas».',['I usually work with five other people','Usually I work with five other people','I normally work with five other people'],[['I work usually with five other people','El adverbio va antes del verbo.']]),
      I('El doctor pregunta si haces ejercicio: «corro tres veces a la semana».',['I run three times a week','I go running three times a week'],[['I run three times for week','Se dice three times a week.']]),
      I('Le explicas a un cliente: «el sistema casi nunca falla».',['The system hardly ever fails','The system rarely fails','The system almost never fails','The system hardly ever goes down'],[['The system fails hardly ever','El adverbio va antes del verbo.']])]),
    a2:K.dialogo([I('A: Do you cook at home?<br>B: (sí, casi siempre)',['Yes, almost always','Yes, I almost always cook at home','Yes, I usually do','Yes, nearly always'],[['Yes, always almost','Se dice almost always.']]),
      I('A: Are you ever late for work?<br>B: (no, nunca llego tarde)',["No, I'm never late","No, I'm never late for work","No, I never arrive late"],[["No, I'm not never late",'never ya es negativo.']]),
      I('A: How often do you call your mom?<br>B: (todos los días)',['Every day','I call her every day','I call my mom every day'],[['All the days','Se dice every day.']])])
  }});

/* ---------- Should ---------- */
const should=bancoEn({titulo:'Should para consejos',
  explicacion:'<b>should</b> + verbo base para dar consejos y opiniones (<i>You should rest</i>), y <b>shouldn\'t</b> para lo que no conviene (<i>You shouldn\'t drink coffee at night</i>). Como can, no cambia (<i>she should</i>, nunca «shoulds») y va sin <i>to</i>. Para pedir consejo: <i>What should I do?</i> / <i>Should I…?</i>',
  alternativa:'should es «deberías» en tono de amigo. Pon should delante del verbo y listo: <i>You should call her</i> = «deberías llamarle».',
  referencia:'Cambridge A2 Key · Murphy EGU – should',regla:'should / shouldn\'t + verbo base (sin to, sin -s). Pregunta: Should I…? / What should I do?',pista:'should + verbo base.',
  tarjetas:[['«Deberías descansar»','You should rest.'],['«¿Qué debería hacer?»','What should I do?'],['«No deberías…»','You shouldn\'t + verbo.']],
  plantillas:{
    b1:K.completa([I('You ___ (deberías) see a doctor.','should',[['should to','should va sin to.']],'You should see a doctor.'),I('She should ___ (dormir) more.','sleep',[['sleeps','Después de should, verbo base.'],['to sleep','should va sin to.']],'She should sleep more.'),
      I('You ___ (no deberías) work so late.',["shouldn't","should not"],[["don't should",'should no usa do.']],"You shouldn't work so late."),I('___ I call the client now?','Should',[['Do','Para pedir consejo: Should I…?']],'Should I call the client now?')],{prof:'basico',que:'should + verbo base'}),
    b2:K.dice([I('Deberías descansar',['You should rest','You should get some rest'],[['You should to rest','should va sin to.']]),I('¿Qué debería hacer?',['What should I do?'],[['What I should do?','En la pregunta: What should I do?']]),
      I('No deberías comer tanto azúcar',["You shouldn't eat so much sugar"],[["You don't should eat so much sugar",'should no usa do.']]),I('Él debería disculparse',['He should apologize','He should say sorry'],[['He shoulds apologize','should no lleva -s.']])]),
    p1:K.traduce([I('Deberías llevar un paraguas.',['You should take an umbrella','You should bring an umbrella'],[['You should to take an umbrella','should va sin to.']]),
      I('¿Debería aceptar la oferta?',['Should I accept the offer?','Should I take the offer?'],[['I should accept the offer?','En la pregunta should va primero.']]),
      I('No deberíamos llegar tarde.',["We shouldn't be late","We shouldn't arrive late"],[["We shouldn't to be late",'should va sin to.']])]),
    p2:K.completa([I('A: Should I buy this jacket? B: Yes, you ___.','should',[['do','La pregunta es con should.']],'Yes, you should.'),I("I think you ___ talk to your manager.",'should',[['must to','Para un consejo: should.']],'I think you should talk to your manager.'),
      I("You look tired. You should ___ to bed early.",'go',[['going','Después de should, verbo base.']],'You should go to bed early.')]),
    a1:K.situacion([I('Tu compañero tiene dolor de cabeza desde hace días. Aconséjale ir al médico.',['You should see a doctor','You should go to the doctor','I think you should see a doctor','Maybe you should see a doctor'],[['You should to go to the doctor','should va sin to.']]),
      I('Un turista pregunta qué visitar en tu ciudad. Recomiéndale el centro histórico.',['You should visit the historic center','You should see the old town','You should visit the historic downtown','You should visit the historic centre'],[['You should visiting the historic center','Después de should, verbo base.']]),
      I('Pides consejo a tu mentor: «¿debería aprender Python o JavaScript?».',['Should I learn Python or JavaScript?'],[['I should learn Python or JavaScript?','En la pregunta should va primero.']])]),
    a2:K.dialogo([I("A: I can't sleep at night.<br>B: (no deberías tomar café en la tarde)",["You shouldn't drink coffee in the afternoon","You shouldn't have coffee in the afternoon"],[["You don't should drink coffee in the afternoon",'should no usa do.']]),
      I("A: I have an interview tomorrow.<br>B: (deberías llegar temprano)",['You should arrive early','You should get there early','You should be there early'],[['You should arriving early','Después de should, verbo base.']]),
      I("A: My laptop is very slow.<br>B: (deberías reiniciarla)",['You should restart it','You should reboot it','You should turn it off and on again'],[['You should to restart it','should va sin to.']])])
  }});

/* ---------- Viajes y direcciones ---------- */
const viajes=bancoEn({titulo:'Viajes y direcciones',
  explicacion:'En el aeropuerto: <i>check in, boarding pass, gate, carry-on (bag), luggage, delayed, cancelled</i>. En el hotel: <i>I have a reservation under (nombre)</i>, <i>check-out time</i>. Transporte: <i>a one-way / round-trip ticket</i>, <i>get on / get off the bus</i>, <i>take a taxi</i>. Indicaciones: <i>Go past the bank, take the second left, it\'s at the end of the street</i>.',
  alternativa:'Casi todo viaje se resuelve con tres moldes: <i>Where is…?</i>, <i>How do I get to…?</i> y <i>I\'d like a … ticket to…</i>.',
  referencia:'Cambridge A2 Key – Vocabulario: viajes, transporte y direcciones',regla:'boarding pass, gate, delayed; round-trip / one-way ticket; get on / get off; take the second left; I have a reservation under…',pista:'¿Aeropuerto, hotel o transporte?',
  tarjetas:[['pase de abordar','boarding pass.'],['boleto redondo / sencillo','round-trip ticket / one-way ticket.'],['bajarse del autobús','get off the bus.'],['«Tengo una reservación a nombre de…»','I have a reservation under…']],
  plantillas:{
    b1:K.dice([I('pase de abordar','boarding pass',[['boarding ticket','Se dice boarding pass.']]),I('la sala (puerta) de embarque','the gate',[['the door','En el aeropuerto: the gate.']]),
      I('un boleto redondo',['a round-trip ticket','a return ticket'],[['a round ticket','Se dice round-trip ticket (o return).']]),I('equipaje de mano',['carry-on luggage','a carry-on','hand luggage','carry-on bag'],[['hand equipment','Se dice carry-on (bag) o hand luggage.']]),
      I('retrasado (vuelo)','delayed',[['retarded','Esa palabra es ofensiva; un vuelo retrasado es delayed.'],['late flight','Para vuelos: delayed.']])],{prof:'basico'}),
    b2:K.significa([I('Your flight is cancelled',['su vuelo esta cancelado','tu vuelo esta cancelado','su vuelo fue cancelado','se cancelo su vuelo']),I('Take the second left',['toma la segunda a la izquierda','da vuelta en la segunda a la izquierda','gira en la segunda calle a la izquierda']),
      I('Check-out is at noon',['la salida es al mediodia','hay que dejar la habitacion al mediodia','el check out es a las doce']),I('Go past the church',['pasa la iglesia','sigue mas alla de la iglesia','pasa de largo la iglesia'])]),
    p1:K.completa([I('I have a reservation ___ the name Torres.','under',[['with','Se dice under the name…']],'I have a reservation under the name Torres.'),I('Get ___ the bus at the third stop. (bájate)','off',[['down','Bajarse de un transporte: get off.']],'Get off the bus at the third stop.'),
      I('Your flight leaves from gate 12. Boarding starts ___ 6:40.','at',[['in','Con la hora: at.']],'Boarding starts at 6:40.'),I("I'd like a ___ ticket to Boston. (sencillo)",'one-way',[['simple','Se dice one-way ticket.']],"I'd like a one-way ticket to Boston.")]),
    p2:K.traduce([I('¿A qué hora es el check-out?',['What time is check-out?','What time is checkout?','When is check-out?'],[['At what hour is the check-out?','Lo natural: What time is check-out?']]),
      I('Quisiera un boleto redondo a Chicago, por favor.',["I'd like a round-trip ticket to Chicago, please","I'd like a return ticket to Chicago, please","Can I have a round-trip ticket to Chicago, please?"],[['I want a round ticket to Chicago','Lo natural: I\'d like a round-trip ticket…']]),
      I('Mi maleta no llegó.',["My suitcase didn't arrive","My luggage didn't arrive","My bag didn't arrive","My suitcase hasn't arrived"],[["My suitcase didn't arrived",'Después de didn\'t, verbo base.']])]),
    a1:K.situacion([I('En la recepción del hotel: tienes una reservación a nombre de García por tres noches.',['Hi, I have a reservation under García for three nights','Hello, I have a reservation under the name García for three nights','I have a reservation under García for three nights',"Hi, I've got a reservation under García for three nights","Hello, I have a booking under García for three nights"],[['I have a reservation with the name García for three nights','Se dice under the name…']]),
      I('Tu vuelo está retrasado. Avisa a tu cliente que llegarás dos horas tarde.',["My flight is delayed. I'll be two hours late","My flight is delayed, so I'll arrive two hours late","My flight's delayed. I'll be there two hours late"],[["My flight is retarded. I'll be two hours late",'Un vuelo retrasado es delayed (retarded es ofensivo).']]),
      I('Le das indicaciones a un turista: «pasa el banco y toma la segunda a la derecha».',['Go past the bank and take the second right','Go past the bank and take the second on the right','Walk past the bank and take the second right'],[['Pass the bank and take the second to the right','Lo natural: go past the bank and take the second right.']])]),
    a2:K.dialogo([I('A: Window or aisle seat?<br>B: (pasillo, por favor)',['Aisle, please','An aisle seat, please','Aisle seat, please'],[['Corridor, please','En el avión, pasillo es aisle.']]),
      I('A: Do you have any bags to check?<br>B: (no, solo equipaje de mano)',['No, just a carry-on','No, only carry-on luggage','No, just hand luggage','No, only a carry-on bag'],[['No, only hand equipment','Se dice carry-on o hand luggage.']]),
      I('A: How do I get to the museum?<br>B: (toma el metro y bájate en la estación Central)',['Take the subway and get off at Central Station','Take the metro and get off at Central station','Take the subway and get off at Central'],[['Take the subway and go down at Central Station','Bajarse: get off.']])])
  }});

/* ---------- Salud ---------- */
const salud=bancoEn({titulo:'Salud',
  explicacion:'Síntomas con <b>have</b>: <i>I have a headache / a sore throat / a fever / a cold / a stomachache</i>; con <b>hurt</b>: <i>My back hurts</i>. Con <b>feel</b>: <i>I feel sick / dizzy / tired</i>. En el médico: <i>What\'s the matter?</i>, <i>How long have you had it?</i>, <i>Take this twice a day</i>, <i>a prescription</i> (receta). Nota: <i>I\'m sick</i> (EE. UU.) = estoy enfermo.',
  alternativa:'Molde para el médico: «I have a» + parte del cuerpo + «-ache» (headache, toothache, backache) o «My» + parte + «hurts».',
  referencia:'Cambridge A2 Key – Vocabulario: salud y cuerpo',regla:'I have a headache / a fever / a cold; My … hurts; I feel sick / dizzy. prescription = receta; Take it twice a day.',pista:'¿Síntoma con have, hurt o feel?',
  tarjetas:[['«Me duele la cabeza»','I have a headache.'],['«Me duele la espalda»','My back hurts.'],['receta médica','prescription.'],['«Estoy mareado»','I feel dizzy.']],
  plantillas:{
    b1:K.dice([I('Me duele la cabeza',['I have a headache',"I've got a headache"],[['My head pains','Se dice I have a headache.'],['I have headache','Lleva a: a headache.']]),I('Tengo fiebre',['I have a fever',"I've got a fever","I have a temperature"],[['I have fever','Lleva a: a fever.']]),
      I('Me duele la garganta',['I have a sore throat',"I've got a sore throat","My throat hurts"],[['I have pain of throat','Se dice I have a sore throat.']]),I('Estoy mareado',['I feel dizzy',"I'm dizzy"],[['I feel sea','«Mareado» es dizzy.']]),
      I('la receta (médica)','a prescription',[['a recipe','recipe es receta de cocina.']])],{prof:'basico'}),
    b2:K.significa([I("What's the matter?",['que te pasa','que tienes','que le pasa','cual es el problema','qué tiene']),I('I sprained my ankle',['me torci el tobillo','me doble el tobillo','me esguince el tobillo']),
      I('Take one pill twice a day',['toma una pastilla dos veces al dia','tome una pastilla dos veces al dia']),I("I'm allergic to penicillin",['soy alergico a la penicilina','soy alérgica a la penicilina','soy alergica a la penicilina'])]),
    p1:K.completa([I('My back ___ a lot. (duele)','hurts',[['hurt','My back = it: hurts.'],['pains','Se dice hurts.']],'My back hurts a lot.'),I('I ___ sick, so I stayed home. (me sentía)','felt',[['feeled','feel → felt.']],'I felt sick, so I stayed home.'),
      I('She has a bad ___. She can\'t stop coughing. (resfriado)','cold',[['cool','cool es fresco; resfriado es cold.']],'She has a bad cold.'),I('How long have you ___ this pain?','had',[['have','Present perfect: have you had.']],'How long have you had this pain?')]),
    p2:K.traduce([I('Me duelen los ojos por la pantalla.',['My eyes hurt from the screen','My eyes hurt because of the screen','My eyes are hurting from the screen'],[['My eyes hurts from the screen','eyes es plural: hurt.']]),
      I('Necesito una cita con el dentista.',['I need an appointment with the dentist','I need a dentist appointment','I need to make an appointment with the dentist'],[['I need a date with the dentist','Una cita médica es appointment; date es romántica.']]),
      I('Tómate esta medicina después de comer.',['Take this medicine after meals','Take this medicine after eating','Take this medicine after lunch'],[['Take this medicine after of eating','after va sin of.']])]),
    a1:K.situacion([I('Llamas a tu jefe para avisar que estás enfermo y no vas a trabajar hoy.',["I'm sick, so I can't come to work today","I'm sick and I can't come in today","I'm not feeling well, so I can't come to work today","I'm ill, so I won't come to work today","I'm sick today, I can't come to work"],[["I'm sick, so I don't can come today",'can no usa do.']]),
      I('En la farmacia pides algo para el dolor de garganta.',["Do you have anything for a sore throat?","Can I have something for a sore throat?","I need something for a sore throat","Do you have something for a sore throat?"],[['Do you have something for the pain of throat?','Se dice a sore throat.']]),
      I('El médico pregunta desde cuándo te duele. Dile que desde el lunes.',['Since Monday',"It's hurt since Monday","It has hurt since Monday","Since Monday. It started on Monday"],[['From Monday','Desde un momento hasta ahora: since.']])]),
    a2:K.dialogo([I("A: What's the matter?<br>B: (me duele el estómago)",['I have a stomachache',"I've got a stomachache",'My stomach hurts','I have a stomach ache'],[['My stomach pains','Se dice My stomach hurts.']]),
      I('A: Are you allergic to anything?<br>B: (sí, a los mariscos)',["Yes, I'm allergic to seafood","Yes, to seafood","Yes, I'm allergic to shellfish"],[["Yes, I'm allergic of seafood",'allergic to.']]),
      I('A: How are you feeling today?<br>B: (mejor, gracias)',["Better, thanks","I'm feeling better, thanks","I feel better, thank you"],[['More good, thanks','good es irregular: better.']])])
  }});

/* ---------- Vocabulario de trabajo ---------- */
const trabajo=bancoEn({titulo:'Vocabulario de trabajo',
  explicacion:'Lo más usado en una oficina: <i>meeting, deadline, report, schedule, task, team, manager, coworker / colleague, client, salary, day off, shift</i>. Verbos frecuentes: <i>attend a meeting, meet a deadline, send a report, take a day off, work overtime, be in charge of</i>. «Trabajo en…»: <i>I work at / for (empresa)</i>, <i>I work in (área)</i>.',
  alternativa:'Aprende el verbo junto con su sustantivo, como pareja de baile: <i>meet + deadline</i>, <i>take + a day off</i>, <i>attend + a meeting</i>. Así suenas natural.',
  referencia:'Cambridge A2 Key – Vocabulario: trabajo',regla:'work for/at + empresa, work in + área; meet a deadline, attend a meeting, take a day off, work overtime, be in charge of.',pista:'¿Qué verbo va con esa palabra?',
  tarjetas:[['fecha límite','deadline (meet a deadline = cumplir el plazo).'],['día libre','a day off (take a day off).'],['«Estoy a cargo de…»','I\'m in charge of…'],['compañero de trabajo','coworker / colleague.']],
  plantillas:{
    b1:K.dice([I('la fecha límite','the deadline',[['the limit date','Se dice deadline.']]),I('un día libre','a day off',[['a free day','Del trabajo: a day off.']]),I('compañero de trabajo',['coworker','colleague','co-worker'],[['work partner','partner suele ser socio o pareja.']]),
      I('horas extra','overtime',[['extra hours','Se dice overtime (work overtime).']]),I('el sueldo',['the salary','the pay','wages'],[['the sold','Sueldo es salary.']])],{prof:'basico'}),
    b2:K.significa([I("I'm in charge of the sales team",['estoy a cargo del equipo de ventas','soy responsable del equipo de ventas','dirijo el equipo de ventas']),I('We need to meet the deadline',['tenemos que cumplir con la fecha limite','necesitamos cumplir el plazo','tenemos que entregar a tiempo']),
      I("She's on a business trip",['esta en un viaje de negocios','esta de viaje de trabajo','anda en viaje de trabajo']),I('I work the night shift',['trabajo el turno de noche','trabajo en el turno nocturno','trabajo de noche'])]),
    p1:K.completa([I('I work ___ a software company.',['for','at'],[['in','Con la empresa: for / at.']],'I work for a software company.'),I("I'm ___ charge of the budget.",'in',[['on','Se dice in charge of.']],"I'm in charge of the budget."),
      I('Can I ___ a day off next Friday?','take',[['have free','Se dice take a day off.']],'Can I take a day off next Friday?'),I('We have to ___ the deadline. (cumplir)','meet',[['comply','Se dice meet a deadline.']],'We have to meet the deadline.')]),
    p2:K.traduce([I('Tengo una junta con mi jefe a las 10.',["I have a meeting with my boss at 10","I've got a meeting with my manager at 10","I have a meeting with my manager at ten"],[['I have a junta with my boss at 10','Junta es meeting.']]),
      I('Trabajé horas extra toda la semana.',['I worked overtime all week','I worked overtime the whole week'],[['I worked extra hours all week','Se dice overtime.']]),
      I('Mi compañera está de vacaciones.',['My coworker is on vacation','My colleague is on holiday','My coworker is on holiday','My colleague is on vacation'],[['My coworker is in vacation','Se dice on vacation.']])]),
    a1:K.situacion([I('En una entrevista: «trabajo en recursos humanos y estoy a cargo de las contrataciones».',["I work in human resources and I'm in charge of hiring","I work in HR and I'm in charge of hiring","I work in Human Resources and I'm responsible for hiring"],[["I work in human resources and I'm in charge of the contractions",'Contratar es hire (contraction es otra cosa).']]),
      I('Pides a tu jefe un día libre el próximo lunes.',['Can I take a day off next Monday?','Could I take next Monday off?','Can I have next Monday off?','Could I take a day off next Monday?'],[['Can I have a free day next Monday?','Del trabajo: a day off.']]),
      I('Avisas al equipo: «la fecha límite del proyecto es el viernes».',["The project deadline is on Friday","The deadline for the project is Friday","The project's deadline is Friday","The project deadline is Friday"],[['The limit date of the project is Friday','Se dice deadline.']])]),
    a2:K.dialogo([I('A: What do you do exactly?<br>B: (estoy a cargo de la atención al cliente)',["I'm in charge of customer service","I'm responsible for customer service","I manage customer service"],[["I'm in charge of the attention to the client",'Atención al cliente es customer service.']]),
      I('A: Can you finish the report today?<br>B: (sí, te lo mando antes de las 5)',["Yes, I'll send it to you before 5","Yes, I'll send it before five","Sure, I'll send it to you before 5 p.m."],[["Yes, I send you before 5",'Promesa: I\'ll send it.']])])
  }});

/* ---------- El clima ---------- */
const clima=bancoEn({titulo:'El clima',
  explicacion:'El clima se describe con <b>it</b>: <i>It\'s sunny / cloudy / windy / rainy / hot / cold</i>, <i>It\'s raining</i>, <i>It\'s snowing</i>. Pregunta: <i>What\'s the weather like?</i> Temperaturas: <i>It\'s 25 degrees</i>. Pronóstico: <i>It\'s going to rain tomorrow</i>. En inglés no «hace» calor: «está» calor → <i>It\'s hot</i>.',
  alternativa:'Siempre empieza con <i>It\'s</i>: It\'s + adjetivo (sunny) o It\'s + verbo-ing (raining). Nunca «makes».',
  referencia:'Cambridge A2 Key – Vocabulario: clima',regla:'It\'s + sunny/cloudy/windy/hot/cold; It\'s raining/snowing; What\'s the weather like? It\'s going to rain.',pista:'Empieza con It\'s.',
  tarjetas:[['«Hace calor»','It\'s hot (no «it makes hot»).'],['«¿Qué tal el clima?»','What\'s the weather like?'],['«Está lloviendo»','It\'s raining.']],
  plantillas:{
    b1:K.dice([I('Hace calor',["It's hot"],[['It makes hot','Calco: se dice It\'s hot.'],['Is hot','Falta el sujeto: It\'s hot.']]),I('Hace mucho viento',["It's very windy","It's really windy"],[['It makes much wind','Se dice It\'s very windy.']]),
      I('Está nublado',["It's cloudy"],[['Is cloudy','Falta el sujeto.']]),I('Está nevando',["It's snowing"],[['Is snowing','Falta el sujeto.']])],{prof:'basico'}),
    b2:K.significa([I("It's pouring",['esta lloviendo a cantaros','esta diluviando','llueve muchisimo','está lloviendo muy fuerte']),I("It's freezing",['hace muchisimo frio','esta helando','hace un frio terrible','esta helado']),
      I('There might be a storm',['podria haber una tormenta','puede haber una tormenta','quiza haya tormenta']),I("It's chilly",['esta fresco','hace fresco','hace un poco de frio'])]),
    p1:K.completa([I("What's the weather ___ in Lima?",'like',[['how','Se dice What\'s the weather like?']],"What's the weather like in Lima?"),I("It ___ a lot in April. (llueve)",'rains',[['rain','Con it: rains.']],'It rains a lot in April.'),
      I("Take a jacket. It's going ___ cold tonight.",'to be',[['to make','Se dice it\'s going to be cold.']],"It's going to be cold tonight."),I("It's 30 ___ today. (grados)",'degrees',[['grades','Grados de temperatura: degrees.']],"It's 30 degrees today.")]),
    p2:K.traduce([I('Mañana va a llover.',["It's going to rain tomorrow","It will rain tomorrow","Tomorrow it's going to rain"],[['Tomorrow is going to rain','Falta it: It\'s going to rain.']]),
      I('En invierno hace mucho frío aquí.',["It's very cold here in winter","In winter it's really cold here","It's very cold here in the winter"],[['In winter makes very cold here','Se dice it\'s very cold.']]),
      I('¿Hace frío afuera?',["Is it cold outside?"],[['Makes cold outside?','Se dice Is it cold outside?']])]),
    a1:K.situacion([I('Avisas a un cliente que el evento al aire libre se pospone: «hay pronóstico de tormenta para el sábado».',["There's a storm forecast for Saturday","A storm is forecast for Saturday","The forecast says there will be a storm on Saturday","There is a storm forecast for Saturday"],[["There's a storm prognostic for Saturday",'Pronóstico del clima es forecast.']]),I('Un colega de otro país pregunta por el clima en tu ciudad. Hoy está soleado y hace 24 grados.',["It's sunny and it's 24 degrees","It's sunny and 24 degrees","It's sunny, about 24 degrees","Today it's sunny and it's 24 degrees"],[['It makes sun and 24 degrees','Se dice It\'s sunny…']]),
      I('Cancelas un plan: «está lloviendo mucho, mejor otro día».',["It's raining a lot, maybe another day","It's raining hard. Let's do it another day","It's pouring, let's go another day","It's raining a lot. Maybe another day"],[['Is raining a lot, maybe other day','Falta el sujeto: It\'s raining.']])]),
    a2:K.dialogo([I("A: What's the weather like there?<br>B: (está nublado pero no hace frío)",["It's cloudy but it isn't cold","It's cloudy, but it's not cold","It's cloudy but not cold"],[["It's cloudy but don't make cold",'Se dice it isn\'t cold.']]),
      I('A: Do I need an umbrella?<br>B: (sí, va a llover en la tarde)',["Yes, it's going to rain in the afternoon","Yes, it'll rain this afternoon","Yes, it's going to rain this afternoon"],[["Yes, is going to rain in the afternoon",'Falta it.']])])
  }});

/* ---------- Experiencias ---------- */
const experiencias=bancoEn({titulo:'Experiencias',
  explicacion:'Para experiencias de la vida (sin decir cuándo) se usa el <b>present perfect</b>: <i>Have you ever been to Brazil?</i> — <i>Yes, I have / No, I\'ve never been there</i>. Si das el momento, cambias al pasado simple: <i>I went there in 2019</i>. Viajes: <i>been to</i> (fuiste y volviste). Otros participios útiles: <i>tried, eaten, seen, done, met, flown</i>.',
  alternativa:'Piensa en tu vida como una caja: ¿está esto dentro de la caja? Have you ever…? Cuando abres la caja y cuentas el detalle (cuándo, con quién), pasas al pasado.',
  referencia:'Cambridge A2 Key – Hablar de experiencias',regla:'Experiencia sin fecha: Have you ever + participio? / I\'ve never + participio. Con fecha o detalles: past simple. Viajes: been to.',pista:'¿Dices cuándo pasó?',
  tarjetas:[['¿Alguna vez has…?','Have you ever + participio? (Have you ever tried sushi?)'],['«Nunca he ido a…»','I\'ve never been to…'],['Cuando das la fecha','Past simple: I went there in 2019.']],
  plantillas:{
    b1:K.dice([I('¿Alguna vez has ido a Brasil?',['Have you ever been to Brazil?'],[['Have you ever gone to Brazil?','Para experiencias de viaje: been to.'],['Did you ever go to Brazil?','Para experiencias: Have you ever been…?']]),I('Nunca he volado',["I've never flown","I have never flown","I've never been on a plane"],[["I've never flied",'fly → flown.']]),
      I('Lo he visto dos veces',["I've seen it twice","I have seen it twice"],[["I've saw it twice",'Participio de see: seen.']]),I('He conocido a gente famosa',["I've met famous people","I have met famous people"],[["I've meet famous people",'Participio de meet: met.']])],{prof:'basico'}),
    b2:K.completa([I('Have you ever ___ (eat) octopus?','eaten',[['ate','Con have: participio eaten.']],'Have you ever eaten octopus?'),I("I've never ___ (be) to Asia.",'been',[['gone','Para experiencias de viaje: been.']],"I've never been to Asia."),
      I('She has ___ (do) yoga for years.','done',[['did','Participio de do: done.']],'She has done yoga for years.'),I('We ___ (go) to Paris in 2018.','went',[['have gone','Con in 2018: past simple.']],'We went to Paris in 2018.')],{prof:'basico'}),
    p1:K.traduce([I('¿Alguna vez has trabajado de noche?',['Have you ever worked at night?','Have you ever worked nights?','Have you ever worked the night shift?'],[['Did you ever work at night?','Experiencia: Have you ever worked…?']]),
      I('Nunca he probado la comida india.',["I've never tried Indian food","I have never tried Indian food","I've never eaten Indian food"],[["I never have tried Indian food",'Orden: I\'ve never tried.']]),
      I('Fui a Cancún el año pasado.',['I went to Cancún last year','I went to Cancun last year'],[["I've been to Cancún last year",'Con last year: past simple.']])]),
    p2:K.completa([I('A: Have you ever lost your passport? B: Yes, I ___.','have',[['did','La pregunta es con have.']],'Yes, I have.'),I('A: When ___ you lose it? B: Last summer.','did',[['have','Con una fecha (cuándo): past simple.']],'When did you lose it?'),
      I("I've ___ climbed a mountain. (nunca)",'never',[['ever','En afirmativo para «nunca»: never.']],"I've never climbed a mountain.")]),
    a1:K.situacion([I('En una entrevista te preguntan si has trabajado con clientes internacionales. Di que sí, muchas veces.',["Yes, I've worked with international clients many times","Yes, I have, many times","Yes, I've worked with international clients a lot","Yes, many times"],[["Yes, I worked with international clients many times ever",'Para experiencias: I\'ve worked.']]),
      I('Un amigo te recomienda un lugar. Dile que nunca has ido.',["I've never been there","I have never been there","I've never been to that place"],[["I've never gone there",'Para experiencias de viaje: been.']]),
      I('Cuéntale a alguien una experiencia: «he corrido dos maratones».',["I've run two marathons","I have run two marathons"],[["I've ran two marathons",'Participio de run: run.']])]),
    a2:K.dialogo([I('A: Have you ever been to Mexico?<br>B: (sí, fui el año pasado)',['Yes, I have. I went last year','Yes, I went there last year','Yes, I went last year'],[['Yes, I have. I have been last year','Con last year: past simple.']]),
      I('A: Have you ever tried skiing?<br>B: (no, nunca)',["No, never","No, I haven't","No, I've never tried it","No, I've never tried skiing"],[["No, I didn't",'La pregunta es con have.']])])
  }});

/* ---------- Pronunciación: -ed, -s y TH ---------- */
const pronunciacion=bancoEn({titulo:'Pronunciación: -ed, -s y TH',
  explicacion:'La <b>-ed</b> suena /t/ después de sonidos sordos (<i>worked, stopped, watched</i>), /d/ después de sonoros (<i>played, called</i>) y /id/ (sílaba extra) solo tras t o d (<i>wanted, needed</i>). La <b>-s</b> suena /s/ (<i>works</i>), /z/ (<i>plays</i>) o /iz/ tras s, z, sh, ch (<i>watches, buses</i>). La <b>TH</b> se dice con la lengua entre los dientes: <i>think</i> no es «tink» ni «sink».',
  alternativa:'Regla rápida: solo agregas una sílaba (-id, -iz) cuando la palabra ya termina en ese mismo tipo de sonido. <i>work-ed</i> NO tiene dos sílabas: se dice «workt».',
  referencia:'MCER A2 – Pronunciación',regla:'-ed: /id/ solo tras t o d (wanted); si no, /t/ o /d/ sin sílaba extra. -s: /iz/ tras s, z, sh, ch. TH: lengua entre los dientes.',pista:'¿Termina en t o d (para -ed), o en s, sh, ch (para -s)?',
  tarjetas:[['¿Cuántas sílabas tiene «worked»?','Una: «workt».'],['¿Cuándo suena /id/ la -ed?','Solo después de t o d: wanted, needed.'],['¿Cuándo la -s agrega sílaba?','Después de s, z, sh, ch: watches, buses.'],['TH de think','Lengua entre los dientes, soplando: no «tink».']],
  plantillas:{
    b1:{prof:'basico',items:[I('worked','t',[['id','Solo suena /id/ tras t o d; worked suena «workt».']]),I('wanted','id',[['t','want termina en t: suena /id/, wan-tid.']]),I('played','d',[['id','play no termina en t ni d: suena «pleid».']]),
      I('stopped','t',[['id','stop termina en p (sordo): «stopt».']]),I('needed','id',[['d','need termina en d: nee-did.']]),I('called','d',[['id','call no termina en t ni d: «cold».']]),I('watched','t',[['id','watch termina en ch (sordo): «watcht».']])],
      enun:it=>`¿Cómo suena la -ed de <span lang="en"><b>${it.q}</b></span>? Escribe <b>t</b>, <b>d</b> o <b>id</b>.`,que:'Mira el último sonido del verbo base',como:it=>en(it.q),porque:'La -ed cambia según el sonido final.',es:true},
    b2:{prof:'basico',items:[I('watches','iz',[['s','watch termina en ch: watches suena «wat-chiz».']]),I('works','s',[['iz','work no termina en s/sh/ch: «works».']]),I('plays','z',[['iz','play no termina en s/sh/ch.']]),
      I('buses','iz',[['s','bus termina en s: «bu-siz».']]),I('washes','iz',[['s','wash termina en sh.']]),I('cooks','s',[['iz','cook no termina en s/sh/ch.']])],
      enun:it=>`¿Cómo suena la -s de <span lang="en"><b>${it.q}</b></span>? Escribe <b>s</b>, <b>z</b> o <b>iz</b>.`,que:'Mira el último sonido de la palabra base',como:it=>en(it.q),porque:'La -s agrega sílaba solo tras s, z, sh, ch.',es:true},
    p1:{prof:'procedimiento',items:[I('worked','1',[['2','La -ed no agrega sílaba: «workt».']]),I('wanted','2',[['1','Tras t sí agrega sílaba: wan-ted.']]),I('finished','2',[['3','fin-isht: la -ed no agrega sílaba.']]),
      I('decided','3',[['2','de-ci-ded: tras d agrega sílaba.']]),I('watches','2',[['1','Tras ch agrega sílaba: wat-ches.']]),I('looked','1',[['2','«lookt»: una sílaba.']])],
      enun:it=>`¿Cuántas sílabas tiene <span lang="en"><b>${it.q}</b></span> al decirla? (escribe el número)`,que:'Cuenta los golpes de voz',como:it=>en(it.q),porque:'La -ed y la -s solo agregan sílaba en casos concretos.',es:true},
    p2:{prof:'procedimiento',items:[I('three / tree: ¿cuál significa «tres»?','three',[['tree','tree es árbol; three (con TH) es tres.']]),I('think / sink: ¿cuál significa «pensar»?','think',[['sink','sink es fregadero o hundirse.']]),
      I('thank / tank: ¿cuál se usa para «gracias»?','thank',[['tank','tank es tanque.']]),I('thought / taught: ¿cuál es el pasado de «think»?','thought',[['taught','taught es el pasado de teach.']]),I('bath / bat: ¿cuál es «tina»?','bath',[['bat','bat es murciélago o bate.']])],
      enun:it=>`Pares mínimos: ${en(it.q)}`,que:'Distingue el sonido TH',como:it=>it.q,porque:'La TH (lengua entre los dientes) cambia el significado.'},
    a1:{prof:'aplicacion',items:[I('Vas a decir en una junta «I worked on the report». ¿Cuántas sílabas tiene «worked»?','1',[['2','Si dices «work-ed», suena raro: es «workt».']]),
      I('Le dices a un cliente «We needed more time». ¿Cómo suena la -ed de «needed»? (t, d o id)','id',[['d','need termina en d: nee-did.']]),
      I('Presentas: «She watches the logs every day». ¿Cómo suena la -s de «watches»? (s, z o iz)','iz',[['s','watch termina en ch: wat-chiz.']]),
      I('Agradeces en una llamada. ¿Cómo debes pronunciar el inicio de «thanks»: con la lengua entre los dientes o como una t?','entre los dientes',[['como una t','Con t suena «tanks» (tanques).']])],
      enun:it=>it.q,que:'Aplica la regla en la frase',como:it=>it.q,porque:'Pronunciar bien estos finales hace que te entiendan a la primera.',es:true},
    a2:{prof:'aplicacion',items:[I('Escribe la palabra con TH que significa «treinta».','thirty',[['tirty','Lleva TH: thirty.']],'thirty'),I('Escribe el pasado de «think».','thought',[['thinked','think es irregular: thought.']],'thought'),
      I('Escribe en inglés «jueves» (empieza con TH).','Thursday',[['Tursday','Lleva TH: Thursday.']],'Thursday'),I('Escribe en inglés «gracias» (informal, con TH).',['thanks','thank you'],[['tanks','tanks son tanques.']],'Thanks.')],
      enun:it=>it.q,que:'Recuerda la palabra con TH',como:it=>it.q,porque:'Escribirla ayuda a recordar que no se dice como t.'}
  }});

/* ---------- Lecturas graduadas A2 ---------- */
const TX={
  correo:'<p lang="en" class="lectura">Hi team, Next Monday we are moving to the new office on 5th Avenue. Please pack your desks on Friday afternoon. The movers will arrive at 4 p.m. On Monday, the office will open at 10 a.m., not 9, because the internet company is going to install the network in the morning. Parking is free for the first month. If you have any questions, call Diego at extension 214. Thanks, Julia</p>',
  blog:'<p lang="en" class="lectura">Last year I decided to learn to cook. Before, I always ate fast food because I worked long hours. First, I watched videos online and tried easy recipes, like pasta and soups. Some meals were terrible! But after three months I was much better. Now I cook four times a week and I spend less money. My favorite dish is chicken curry. My advice: start with simple recipes and don\'t give up.</p>',
  anuncio:'<p lang="en" class="lectura">CITY BIKES – Rent a bike for only $3 an hour or $15 a day. Stations are open from 6 a.m. to 11 p.m. You can pay with the app or with a credit card at the station. Helmets are not included, but you can buy one for $10. Children under 12 must ride with an adult. Return the bike to any station.</p>'
};
const R2=(t,p)=>`${TX[t]}${p}`;
const lecturasA2=bancoEn({titulo:'Lecturas graduadas A2',
  explicacion:'En A2 los textos son correos, anuncios y relatos de 80–120 palabras. Estrategia: 1) lee el título o la primera línea para saber de qué trata; 2) lee la pregunta y busca la palabra clave; 3) cuidado con las trampas: el texto puede mencionar dos horas o dos lugares, y solo uno responde la pregunta (<i>at 10, <b>not</b> 9</i>).',
  alternativa:'Es como leer las letras pequeñas de un contrato: busca las palabras que cambian el sentido (not, only, must, free, included).',
  referencia:'Cambridge A2 Key – Reading',regla:'Ubica el tema, busca la palabra clave de la pregunta y vigila las palabras que cambian el sentido (not, only, must, included).',pista:'Busca la palabra clave y lee la frase completa.',
  tarjetas:[['Palabras trampa al leer','not, only, must, free, included, except.'],['must','obligación (Children must ride with an adult).'],['included','incluido (Helmets are not included).']],
  plantillas:{
    b1:{prof:'basico',enun:it=>it.q,que:'Busca el dato en el texto',como:()=>'Ubica la palabra clave.',porque:'El dato está en el texto; vigila las palabras trampa.',items:[
      I(R2('correo','What time will the office open on Monday?'),['At 10 a.m.','At 10','10 a.m.','At ten','10','It will open at 10'],[['At 9','Dice at 10 a.m., not 9.']]),
      I(R2('correo','When will the movers arrive?'),['At 4 p.m.','On Friday at 4 p.m.','At 4','On Friday afternoon at 4','Friday at 4 p.m.'],[]),
      I(R2('anuncio','How much is a bike for one day?'),['$15','15 dollars','Fifteen dollars','$15 a day','15'],[['$3','$3 es por hora.']]),
      I(R2('blog','What is the writer\'s favorite dish?'),['Chicken curry','chicken curry',"It's chicken curry"],[['Pasta','La pasta fue de sus primeras recetas.']])]},
    b2:{prof:'basico',es:true,enun:it=>it.q,que:'Adivina por el contexto',como:()=>'Mira las palabras de alrededor.',porque:'El contexto explica la palabra.',items:[
      I(R2('correo','¿Qué significa «movers» en el correo?'),['los de la mudanza','la mudanza','la empresa de mudanzas','los que hacen la mudanza','mudanceros','cargadores']),
      I(R2('blog','¿Qué significa «don\'t give up»?'),['no te rindas','no te des por vencido','no te rindas nunca','no lo dejes']),
      I(R2('anuncio','¿Qué significa «helmets»?'),['cascos','casco']),
      I(R2('blog','¿Qué significa «I spend less money»?'),['gasto menos dinero','gasto menos'])]},
    p1:{prof:'procedimiento',es:true,enun:it=>`${it.q}<br><span class="nota">Escribe <b>verdadero</b> o <b>falso</b>.</span>`,que:'Compara la frase con el texto',como:()=>'Busca la parte que habla de eso.',porque:'Una palabra (not, only) puede cambiarlo todo.',items:[
      I(R2('correo','«Parking is free forever.»'),['falso','false','f'],[['verdadero','Solo el primer mes: for the first month.']]),
      I(R2('anuncio','«Helmets are included in the price.»'),['falso','false','f'],[['verdadero','Dice: Helmets are not included.']]),
      I(R2('anuncio','«You can return the bike to a different station.»'),['verdadero','true','v'],[['falso','Dice: Return the bike to any station.']]),
      I(R2('blog','«All the first meals were good.»'),['falso','false','f'],[['verdadero','Dice: Some meals were terrible!']]),
      I(R2('blog','«The writer cooks every day now.»'),['falso','false','f'],[['verdadero','Cocina cuatro veces por semana.']])]},
    p2:{prof:'procedimiento',enun:it=>it.q,que:'Busca la razón en el texto',como:()=>'Las razones suelen ir después de because o so.',porque:'because introduce la causa.',items:[
      I(R2('correo','Why will the office open late on Monday?'),['Because the internet company is going to install the network','Because they are installing the network','Because of the network installation','The internet company is going to install the network'],[['Because of the movers','Los de la mudanza llegan el viernes.']]),
      I(R2('blog','Why did the writer eat fast food before?'),['Because he worked long hours','Because she worked long hours','Because they worked long hours','He worked long hours','She worked long hours']),
      I(R2('anuncio','Who must ride with an adult?'),['Children under 12','Kids under 12','children under twelve'],[['Children over 12','Dice under 12 (menores de 12).']])]},
    a1:{prof:'aplicacion',es:true,enun:it=>it.q,que:'Aplica lo que leíste a tu situación',como:()=>'Busca la regla que te afecta.',porque:'Leer para decidir es el objetivo real.',items:[
      I(R2('anuncio','Quieres rentar una bici a las 5:30 a.m. ¿Puedes? (sí o no)'),['no'],[['si','Abren a las 6 a.m.']]),
      I(R2('correo','Tienes una duda sobre el estacionamiento. ¿A quién llamas y a qué extensión? (en español)'),['a diego a la extension 214','a diego extension 214','diego 214','a diego, extension 214','a diego en la 214']),
      I(R2('anuncio','Vas con tu hijo de 10 años. ¿Puede ir solo en bici? (sí o no)'),['no'],[['si','Children under 12 must ride with an adult.']])]},
    a2:{prof:'aplicacion',enun:it=>it.q,que:'Responde con una frase completa en inglés',como:()=>'Usa la información del texto.',porque:'Practicas leer y escribir a la vez.',items:[
      I(R2('blog','What is the writer\'s advice? (en inglés)'),["Start with simple recipes and don't give up","Start with simple recipes and don't give up.","Start with easy recipes and don't give up"]),
      I(R2('correo','What should the team do on Friday afternoon?'),['Pack their desks','They should pack their desks','Pack your desks','They have to pack their desks']),
      I(R2('anuncio','How can you pay?'),['With the app or with a credit card','With the app or a credit card','You can pay with the app or with a credit card','With the app or by credit card'])]}
  }});

/* ---------- Escritura guiada A2: correos cortos ---------- */
const escrituraA2=bancoEn({titulo:'Escritura guiada A2: correos cortos',
  explicacion:'Un correo corto (25–40 palabras) responde a 2 o 3 puntos. Estructura: saludo (<i>Hi Sam, / Dear Ms. Lee,</i>), el motivo (<i>I\'m writing to…</i>), los puntos pedidos, y un cierre (<i>See you soon / Best wishes / Kind regards,</i>) con tu nombre. Une ideas con <i>and, but, because, so</i>.',
  alternativa:'Antes de escribir, haz tu lista de los 3 puntos que te piden y escribe una frase por cada uno. Luego pon saludo arriba y cierre abajo.',
  referencia:'Cambridge A2 Key – Writing (correo de 25 palabras o más)',regla:'Saludo + motivo (I\'m writing to…) + una frase por cada punto pedido + cierre. Conecta con and, but, because, so.',pista:'Una frase por cada punto que te piden.',
  tarjetas:[['Abrir un correo formal','Dear Ms. Lee, / I\'m writing to…'],['Cerrar un correo','Best wishes / Kind regards, + nombre.'],['Conectores básicos','and, but, because, so.']],
  plantillas:{
    b1:K.dice([I('Le escribo para…',["I'm writing to","I am writing to"],[['I write you for','Se dice I\'m writing to…']]),I('Quedo atento a su respuesta',['I look forward to hearing from you','I look forward to your reply'],[['I stay attentive to your answer','Calco: se dice I look forward to hearing from you.']]),
      I('Saludos cordiales',['Kind regards','Best regards','Best wishes'],[['Cordial greetings','En correos se cierra con Kind regards.']]),I('Adjunto el archivo',["I've attached the file","Please find the file attached","I attached the file","The file is attached"],[['I adjunt the file','Adjuntar es attach.']])],{prof:'basico'}),
    b2:K.completa([I("I can't come on Friday ___ I'm traveling. (porque)",'because',[['so','La causa va con because.']],"I can't come on Friday because I'm traveling."),I("The meeting is at 3, ___ please be on time. (así que)",'so',[['because','La consecuencia va con so.']],'The meeting is at 3, so please be on time.'),
      I("I'd like to come, ___ I have a doctor's appointment. (pero)",'but',[['and','Para contrastar: but.']],"I'd like to come, but I have a doctor's appointment."),I('I look forward to ___ from you.','hearing',[['hear','Después de look forward to: -ing.']],'I look forward to hearing from you.')],{prof:'basico'}),
    p1:K.traduce([I('Gracias por tu correo.',['Thanks for your email','Thank you for your email','Thanks for your message'],[['Thanks for you email','Tu = your.']]),
      I('¿Podemos cambiar la reunión al jueves?',['Can we move the meeting to Thursday?','Could we change the meeting to Thursday?','Can we change the meeting to Thursday?','Could we move the meeting to Thursday?'],[['We can change the meeting to Thursday?','En la pregunta can va primero.']]),
      I('Te escribo para confirmar mi reservación.',["I'm writing to confirm my reservation","I am writing to confirm my booking","I'm writing to confirm my booking"],[['I write you for confirm my reservation','Se dice I\'m writing to confirm…']])]),
    p2:K.completa([I('Dear Mr. Silva, I\'m writing ___ ask about the course.','to',[['for','Para el propósito: to + verbo.']],"I'm writing to ask about the course."),I('Please find the report ___. (adjunto)','attached',[['adjunted','Adjunto = attached.']],'Please find the report attached.'),
      I('Thanks ___ advance. (de antemano)','in',[['for','Se dice Thanks in advance.']],'Thanks in advance.')]),
    a1:K.situacion([I('Escribe la frase central de un correo a tu profesora: no puedes ir a la clase del martes porque estás enfermo.',["I can't come to class on Tuesday because I'm sick","I can't go to class on Tuesday because I'm sick","I won't be able to come to class on Tuesday because I'm ill","I can't come to the class on Tuesday because I'm sick","I can't attend class on Tuesday because I'm sick"],[["I don't can go to class on Tuesday because I'm sick",'can no usa do.']]),
      I('Escribe una frase para pedir al hotel que te confirmen la hora del check-in.',['Could you confirm the check-in time, please?','Can you confirm the check-in time, please?','Could you please confirm the check-in time?','Can you please confirm the check-in time?'],[['You can confirm the check-in time?','En la pregunta can/could va primero.']]),
      I('Escribe una frase para invitar a tu compañero a la comida del equipo el viernes a la 1.',["Would you like to come to the team lunch on Friday at 1?","Do you want to come to the team lunch on Friday at 1?","Would you like to join the team lunch on Friday at 1?","Do you want to join us for the team lunch on Friday at 1?"],[['You want come to the team lunch in Friday at 1?','Pregunta con do/would; día con on.']])]),
    a2:K.dialogo([I('A (correo): Can you come to the training on May 3rd?<br>B: (sí, ahí estaré; ¿a qué hora empieza?)',["Yes, I'll be there. What time does it start?","Yes, I will be there. What time does it start?","Sure, I'll be there. What time does it start?"],[["Yes, I'll be there. What time it starts?",'Pregunta: What time does it start?']]),
      I('A (correo): Did you receive the invoice?<br>B: (sí, gracias; lo pagaré esta semana)',["Yes, thank you. I'll pay it this week","Yes, thanks. I'll pay it this week","Yes, thanks, I'll pay it this week"],[["Yes, thanks. I pay it this week",'Promesa: I\'ll pay it.']])])
  }});

export default {'en/futuro':futuro,'en/comparativos':comparativos,'en/contables':contables,'en/frecuencia':frecuencia,'en/should':should,'en/viajes':viajes,'en/salud':salud,
  'en/trabajo':trabajo,'en/clima':clima,'en/experiencias':experiencias,'en/pronunciacion-a2':pronunciacion,'en/lecturas-a2':lecturasA2,'en/escritura-a2':escrituraA2};
