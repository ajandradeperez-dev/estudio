/* Simulacros A2 (formato inspirado en A2 Key; contenido original, no es un examen oficial). */
import {op,es,crit,SALUDO,CIERRE} from './base.js';

const historia=(escena,consigna)=>({id:'w2',tipo:'historia',escena,consigna,min:35,max:70,
  criterios:[crit('Cuentas en pasado (was, went, saw, had…)','\\b(was|were|went|saw|had|made|took|ate|drank|ran|got|came|left|found|decided|started|cooked|played|walked)\\b','Una historia va en pasado: went, saw, had….'),
   crit('Usas conectores de secuencia (first, then, after that, finally)','\\b(first|then|after that|later|finally|suddenly|when)\\b','Ordena con First, Then, After that, Finally.'),
   crit('Mencionas al menos tres cosas de la escena','__ESCENA3__','Nombra cosas que ves en el dibujo (personas, objetos, lugar).')]});

export default [{
  id:'a2-1',nivel:'A2',titulo:'Simulacro A2 · 1',minutos:{lectura:25,escritura:20,escucha:20,habla:8},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Avisos. ¿Qué dice cada aviso? Elige la opción correcta.',texto:`A) LIBRARY: Books must be returned within 14 days. You can renew them online.
B) GYM: The swimming pool is closed for cleaning until Thursday. The gym is open as usual.
C) CAFÉ: Buy 5 coffees and get the 6th free. Ask for your card at the counter.`,
    preguntas:[op('Aviso A: You…',['can keep books for two weeks','must buy the books','can only renew books in person'],0,'within 14 days = dentro de 14 días (dos semanas).'),
     op('Aviso B: On Wednesday you can…',['swim in the pool','use the gym','clean the pool'],1,'closed until Thursday: el miércoles la alberca sigue cerrada, pero el gimnasio abre.'),
     op('Aviso C: The sixth coffee…',['costs half price','is free','is only for new customers'],1,'get the 6th free = el sexto es gratis.')]},
   {id:'l2',consigna:'Parte 2 · Lee los mensajes y elige la respuesta correcta.',texto:`Jenny: Hi Max! Are you still coming to the cinema tonight? The film starts at 8:15, but let's meet at 7:45 to buy popcorn.
Max: Sorry, I finish work late today. I can be there at 8:10. Can you buy my ticket? I'll pay you back.
Jenny: OK, no problem. I'll wait for you inside.`,
    preguntas:[op('Why can\'t Max meet at 7:45?',['He has to work late.','He doesn\'t like popcorn.','He doesn\'t have money.'],0,'I finish work late today.'),
     op('What will Jenny do?',['Wait outside the cinema','Buy Max\'s ticket','Go home'],1,'Can you buy my ticket? — OK, no problem.')]},
   {id:'l3',consigna:'Parte 3 · Lee el texto y responde.',texto:`Last year, Carla decided to learn to cook. She lived alone in a small flat and was tired of eating sandwiches every night. First she watched videos online, but it was difficult to follow them. Then her grandmother offered to teach her. Every Sunday they cooked together: soup, rice, chicken and Carla's favourite, chocolate cake. Now Carla cooks dinner five nights a week, and last month she cooked for twelve friends at her birthday party. "My grandmother is the best teacher," she says.`,
    preguntas:[op('Why did Carla want to learn to cook?',['She was bored of sandwiches.','She wanted to open a restaurant.','Her friends asked her.'],0,'was tired of eating sandwiches = estaba harta de comer sándwiches.'),
     op('What was the problem with the videos?',['They were expensive.','They were hard to follow.','They were in Spanish.'],1,'it was difficult to follow them.'),
     op('How many friends came to her party?',['Five','Twelve','Two'],1,'she cooked for twelve friends.')]},
   {id:'l4',consigna:'Parte 4 · Elige la palabra correcta para cada hueco.',texto:`Dear Mr. Patel,
I am sorry, but I can't come to class (1) ___ Monday because I have a doctor's appointment. Could you please send (2) ___ the homework by email? I will do it (3) ___ the weekend.
Thank you,
Rosa`,
    preguntas:[op('(1)',['in','on','at'],1,'Días de la semana: on Monday.'),op('(2)',['me','my','I'],0,'send + persona (objeto): send me.'),op('(3)',['at','in','on'],0,'En inglés británico: at the weekend (en EE. UU. también on the weekend).')]},
   {id:'l5',consigna:'Parte 5 · Escribe UNA palabra en cada hueco.',texto:`Hi Daniel,
Thanks (1) ___ your email. I'm in Lima now and the weather is great. Yesterday I (2) ___ to the old town and took lots of photos. Tomorrow I'm going (3) ___ visit a museum. See you soon!
Paula`,
    preguntas:[es('(1)',['for'],'Thanks for… = gracias por….'),es('(2)',['went','walked','go'],'Ayer: pasado (went).'),es('(3)',['to'],'be going to + verbo.')]}
  ],
  escritura:[
   {id:'w1',tipo:'mensaje',consigna:'Tu amiga Emma te invitó a su casa el sábado, pero no puedes ir. Escríbele (25–40 palabras): discúlpate, explica por qué no puedes y propón otro día.',min:25,max:45,
    criterios:[SALUDO,crit('Te disculpas (Sorry / I\'m afraid)','\\b(sorry|i\'m afraid|unfortunately)\\b','Empieza disculpándote: Sorry, I can\'t come.'),crit('Explicas por qué (because)','\\bbecause\\b','Da la razón: because I have to….'),
     crit('Propones otro día (How about / Can we meet on…)','\\b(how about|what about|can we|could we|are you free|let\'s)\\b','Propón: How about Sunday?'),CIERRE],
    modelo:`Hi Emma,
Sorry, I can't come on Saturday because I have to work all day. How about Sunday afternoon? We can have coffee and talk.
See you soon,
Diego`},
   {...historia('cocina','Mira la escena de la cocina. Escribe una historia corta (35–70 palabras) sobre lo que pasó esa mañana.'),
    modelo:`Last Monday Sara got up early and went to the kitchen. First she made breakfast for her son: eggs, bread and orange juice. Then she looked at the clock. It was half past seven and they were late! After that, they ate quickly and ran to the bus.`}
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige la respuesta.',audio:[['A','Hi, I\'d like to book a table for Friday evening.'],['B','Sure. For how many people?'],['A','Four. At eight o\'clock, please.'],['B','Sorry, eight is full. Is half past eight OK?'],['A','Yes, that\'s fine.']],
    preguntas:[op('What time is the table booked for?',['8:00','8:30','8:15'],1,'half past eight = 8:30.')]},
   {id:'e2',consigna:'Parte 2 · Escucha y elige la respuesta.',audio:[['A','How was your holiday in Canada?'],['B','Great! We stayed with my cousin in Toronto for a week and then took the train to Montreal.'],['A','Was it cold?'],['B','Not really. It rained a lot in Montreal, but it was warm.']],
    preguntas:[op('Where did they stay with the cousin?',['Montreal','Toronto','Vancouver'],1,'We stayed with my cousin in Toronto.'),op('What was the weather like in Montreal?',['Cold and sunny','Rainy but warm','Snowy'],1,'It rained a lot… but it was warm.')]},
   {id:'e3',consigna:'Parte 3 · Escucha el mensaje y completa con una palabra o un número.',audio:[['A','Hello, this is Mike from Green Garden shop. Your new table is ready. You can pick it up on Thursday, after two o\'clock. The shop is at 45 River Road. Please bring your receipt. Thanks!']],
    preguntas:[es('Day to pick up the table:',['Thursday'],'on Thursday.'),es('Number of the shop on River Road:',['45','forty-five','forty five'],'45 River Road.'),es('Bring your…',['receipt'],'Please bring your receipt.')]},
   {id:'e4',consigna:'Parte 4 · Escucha y elige la respuesta.',audio:[['A','What are you going to do this summer, Jake?'],['B','I wanted to travel, but I need money. So I\'m going to work in my uncle\'s restaurant. Maybe I\'ll travel at Christmas.']],
    preguntas:[op('What is Jake going to do this summer?',['Travel','Work in a restaurant','Study'],1,'I\'m going to work in my uncle\'s restaurant.')]},
   {id:'e5',consigna:'Parte 5 · Escucha y elige la respuesta.',audio:[['A','Excuse me, is there a pharmacy near here?'],['B','Yes, go straight on and take the second street on the left. It\'s next to the bank, opposite the park.']],
    preguntas:[op('Where is the pharmacy?',['Next to the park','Next to the bank','Opposite the bank'],1,'It\'s next to the bank, opposite the park.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['What\'s your name and where do you live?','How do you usually travel to work or school?','What did you do last weekend?','What are you going to do next summer?','Tell me about your favourite food.'],
    modelos:['My name is Diego and I live in Monterrey.','I usually take the bus. It takes about forty minutes.','Last weekend I visited my grandparents and we cooked together.','Next summer I\'m going to visit the beach with my friends.','My favourite food is enchiladas. My mother makes them every Sunday.'],segundos:30},
   {tipo:'conversacion',titulo:'Parte 2 · Conversación guiada',consigna:'Tu amigo y tú quieren hacer algo el sábado. Hablen de las opciones: el cine, un parque, un museo o cocinar en casa. ¿Cuál prefieres y por qué?',
    preguntas:['Which do you think is the best idea for Saturday? Why?','Do you prefer doing things indoors or outdoors?','What do you usually do with your friends?'],
    modelos:['I think the park is the best idea because the weather is nice and it\'s free.','I prefer doing things outdoors. I like walking and playing sports.','We usually go to the cinema or have dinner together.'],segundos:40}
  ]}
},{
  id:'a2-2',nivel:'A2',titulo:'Simulacro A2 · 2',minutos:{lectura:25,escritura:20,escucha:20,habla:8},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Avisos. Elige la opción correcta.',texto:`A) TRAIN STATION: Tickets bought online must be printed or shown on your phone.
B) HOTEL: Breakfast is served from 7 to 10 in the garden restaurant. Room service costs extra.
C) SCHOOL: The art class on Friday will be in Room 12, not Room 3.`,
    preguntas:[op('Aviso A: If you buy a ticket online…',['you can show it on your phone','you must buy another one','you can\'t travel'],0,'printed or shown on your phone = impreso o en tu teléfono.'),
     op('Aviso B: Breakfast in your room is…',['free','not possible','more expensive'],2,'Room service costs extra = cuesta aparte.'),
     op('Aviso C: On Friday the art class is…',['cancelled','in a different room','in Room 3'],1,'in Room 12, not Room 3.')]},
   {id:'l2',consigna:'Parte 2 · Lee los textos sobre tres personas y responde.',texto:`ANA: I work in a hospital, so I often work at night. On my free days I love sleeping late and reading in bed.
BEN: I'm a teacher. I get up at six every day, even on Sundays, because I go running before breakfast.
CHLOE: I work from home as a designer. I usually start at ten, but I often finish very late at night.`,
    preguntas:[op('Who gets up early every day?',['Ana','Ben','Chloe'],1,'I get up at six every day, even on Sundays.'),op('Who works from home?',['Ana','Ben','Chloe'],2,'I work from home as a designer.'),op('Who often works at night in a hospital?',['Ana','Ben','Chloe'],0,'I work in a hospital, so I often work at night.')]},
   {id:'l3',consigna:'Parte 3 · Lee el texto y responde.',texto:`When Luis was fifteen, he found an old guitar in his grandfather's house. Nobody in his family could play it, so he started to learn with free lessons on the internet. He practised for an hour every evening after school. At first his neighbours complained about the noise, but two years later they came to listen to him at a concert in the town square. Today Luis is twenty-two and he plays in a band. They have recorded their first song, and next month they are going to play in Mexico City.`,
    preguntas:[op('How did Luis learn to play?',['With his grandfather','With free online lessons','At a music school'],1,'free lessons on the internet.'),op('What did the neighbours do two years later?',['They complained','They went to his concert','They bought a guitar'],1,'they came to listen to him at a concert.'),op('What will the band do next month?',['Record their first song','Play in Mexico City','Buy new guitars'],1,'next month they are going to play in Mexico City.')]},
   {id:'l4',consigna:'Parte 4 · Elige la palabra correcta para cada hueco.',texto:`The new shopping centre opened (1) ___ March. It is (2) ___ than the old one, with more than a hundred shops. There (3) ___ also a cinema and a big car park.`,
    preguntas:[op('(1)',['on','in','at'],1,'Meses: in March.'),op('(2)',['big','bigger','biggest'],1,'Comparativo: bigger than.'),op('(3)',['is','are','be'],0,'There is + singular (a cinema…).')]},
   {id:'l5',consigna:'Parte 5 · Escribe UNA palabra en cada hueco.',texto:`Dear Kate,
I'm writing to tell you about my new job. I started (1) ___ Monday. My boss is very friendly and my colleagues (2) ___ helpful. I work (3) ___ 9 to 5, so I have free time in the evening.
Love, Ben`,
    preguntas:[es('(1)',['on','last'],'Días: on Monday (o last Monday).'),es('(2)',['are','were'],'colleagues (plural) + are.'),es('(3)',['from'],'from 9 to 5 = de 9 a 5.')]}
  ],
  escritura:[
   {id:'w1',tipo:'mensaje',consigna:'Compraste algo en línea y quieres cambiarlo. Escribe un mensaje a la tienda (25–40 palabras): qué compraste, cuál es el problema y qué quieres.',min:25,max:45,
    criterios:[SALUDO,crit('Dices qué compraste (I bought / I ordered)','\\b(i bought|i ordered|i got)\\b','Cuenta qué compraste: I bought a….'),crit('Explicas el problema (but / it is too… / it doesn\'t)','\\b(but|too|doesn\'t|does not|wrong|broken|small|big)\\b','Di qué pasa: it is too small.'),
     crit('Pides algo (Can I / Could you / I would like)','\\b(can i|could you|could i|i would like|i\'d like|can you)\\b','Pide con cortesía: Can I change it?'),CIERRE],
    modelo:`Hello,
Last week I bought a blue jacket on your website, but it is too small for me. Can I change it for a large one, please?
Thank you,
Marta López`},
   {...historia('parque','Mira la escena del parque. Escribe una historia corta (35–70 palabras) sobre ese domingo.'),
    modelo:`Last Sunday was sunny, so my family went to the park. First we had a picnic on the grass. Then my brothers played football and I read a book under a tree. After that, a man ran past with his dog and the dog took our ball! Finally we bought ice cream.`}
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige.',audio:[['A','How much are these sunglasses?'],['B','They were forty dollars, but today they\'re on sale. Twenty-five.'],['A','Great, I\'ll take them.']],
    preguntas:[op('How much does she pay?',['$40','$25','$15'],1,'today they\'re on sale. Twenty-five.')]},
   {id:'e2',consigna:'Parte 2 · Escucha y elige.',audio:[['A','Are you coming to the meeting on Tuesday?'],['B','Didn\'t you get the email? It moved to Wednesday morning.'],['A','Oh, what time?'],['B','Half past nine, in room four.']],
    preguntas:[op('When is the meeting now?',['Tuesday at 9:30','Wednesday at 9:30','Wednesday at 4:00'],1,'It moved to Wednesday morning… half past nine.')]},
   {id:'e3',consigna:'Parte 3 · Escucha y completa con una palabra o un número.',audio:[['A','Welcome to the City Bike tour. The tour lasts two hours and we stop at the castle and the river. Please wear a helmet. The tour costs eighteen dollars and it includes a bottle of water.']],
    preguntas:[es('The tour lasts … hours.',['two','2'],'lasts two hours.'),es('Price in dollars:',['18','eighteen'],'eighteen dollars.'),es('You must wear a …',['helmet'],'Please wear a helmet.')]},
   {id:'e4',consigna:'Parte 4 · Escucha y elige.',audio:[['A','Doctor, I have a terrible headache and I feel tired.'],['B','How long have you had it?'],['A','Since Monday.'],['B','You should drink more water and sleep more. Come back on Friday if it doesn\'t get better.']],
    preguntas:[op('What should the patient do?',['Take medicine','Drink water and sleep more','Go to hospital'],1,'You should drink more water and sleep more.')]},
   {id:'e5',consigna:'Parte 5 · Escucha y elige.',audio:[['A','What did you think of the film?'],['B','The actors were good, but it was too long. Three hours!'],['A','I loved the music.'],['B','Yes, the music was the best part.']],
    preguntas:[op('What did they both like?',['The actors','The length','The music'],2,'Yes, the music was the best part.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['Where do you live, and do you like it?','What do you usually do in the evenings?','Tell me about the last time you went shopping.','What will you do on your next holiday?','What is your favourite season and why?'],
    modelos:['I live in Puebla. I like it because it is quiet.','I usually cook dinner and watch a series.','Last Saturday I went to the market and bought fruit and shoes.','I will probably visit my aunt in Oaxaca.','My favourite season is spring because it is warm and sunny.'],segundos:30},
   {tipo:'conversacion',titulo:'Parte 2 · Conversación guiada',consigna:'Un amigo cumple años. Hablen de qué regalarle: un libro, ropa, un boleto para un concierto o una cena. ¿Qué es mejor y por qué?',
    preguntas:['What do you think is the best present? Why?','Do you prefer to give things or experiences?','What was the best present you ever received?'],
    modelos:['I think a concert ticket is the best present because it is a special experience.','I prefer to give experiences, like a dinner or a trip.','The best present was a guitar from my parents.'],segundos:40}
  ]}
}];
