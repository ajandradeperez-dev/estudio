/* Simulacros B2 (formato inspirado en B2 First; contenido original, no es un examen oficial). */
import {op,es,crit,SIN_CONTRACCIONES} from './base.js';

const ensayo=(consigna,modelo)=>({id:'w1',tipo:'ensayo',consigna,min:140,max:190,modelo,
  criterios:[crit('Introduces el tema (Nowadays / In recent years / It is often said…)','^\\s*(nowadays|in recent years|these days|today|it is (often|widely) (said|argued|believed)|many people|over the last)\\b','Abre con el contexto del tema.'),
   crit('Ordenas los argumentos (firstly, furthermore, moreover…)','\\b(firstly|first of all|furthermore|moreover|in addition|secondly)\\b','Ordena: Firstly…, Furthermore….'),
   crit('Presentas el otro punto de vista (however / on the other hand / admittedly)','\\b(however|on the other hand|admittedly|nevertheless|that said)\\b','Reconoce la otra postura.'),
   crit('Concluyes con tu opinión (In conclusion / On balance / All things considered)','\\b(in conclusion|on balance|all things considered|to conclude|overall)\\b','Cierra con In conclusion,….'),SIN_CONTRACCIONES]});

export default [{
  id:'b2-1',nivel:'B2',titulo:'Simulacro B2 · 1',minutos:{lectura:40,uso:30,escritura:80,escucha:40,habla:14},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Lee el artículo y elige la respuesta correcta.',texto:`For most of human history, being bored was simply part of life. Waiting for a bus, standing in a queue or sitting through a long evening meant facing a few minutes with nothing to do. Today, those minutes have almost disappeared: the moment we feel even slightly bored, we reach for our phones.

Psychologists are beginning to wonder whether this is a problem. Several studies suggest that boredom, uncomfortable as it is, plays a useful role. In one experiment, participants who were first given a dull task, such as copying numbers from a phone book, came up with more creative ideas in a later test than those who went straight to the creative task. The researchers' explanation was that boredom pushes the mind to wander, and mind-wandering is where unexpected connections are made.

None of this means we should seek out tedious activities. But it may be worth resisting the urge to fill every empty moment. The next time you are waiting for a train, try leaving your phone in your pocket. You might be surprised by what your mind comes up with.`,
    preguntas:[op('According to the first paragraph, what has changed?',['People are more bored than before','Moments without stimulation are now rare','Phones have made queues shorter'],1,'those minutes have almost disappeared.'),
     op('In the experiment, the participants who copied numbers first…',['felt more relaxed','had more creative ideas later','finished the test faster'],1,'came up with more creative ideas in a later test.'),
     op('What does the writer recommend?',['Doing boring tasks on purpose','Not always filling empty moments','Leaving your phone at home'],1,'it may be worth resisting the urge to fill every empty moment.')]},
   {id:'l2',consigna:'Parte 2 · Elige la frase que falta en cada hueco del texto.',texto:`Running my own café was a childhood dream. (1) ___ The first year, I worked fourteen hours a day and barely made enough to pay the rent. (2) ___ That was when I realised that people weren't coming for the coffee alone; they wanted somewhere to feel at home. (3) ___ Now the café hosts book clubs, language exchanges and small concerts.

A) Then a regular customer asked if she could use the back room for a knitting group.
B) What I hadn't imagined was how exhausting it would be.
C) So I started to think of the café as a community space rather than just a shop.
D) My parents had always run a restaurant in the same street.`,
    preguntas:[op('(1)',['A','B','C','D'],1,'Después de «un sueño de la infancia», el contraste: lo que no había imaginado (lo agotador).'),op('(2)',['A','B','C','D'],0,'Antes de «That was when I realised…»: algo que pasó (una clienta pidió el cuarto).'),op('(3)',['A','B','C','D'],2,'Consecuencia del descubrimiento: empezó a verlo como espacio comunitario.')]},
   {id:'l3',consigna:'Parte 3 · Lee las opiniones sobre el trabajo remoto. ¿Quién dice cada cosa?',texto:`A) PRIYA (designer): I'm far more productive at home, but I had to learn to switch off. For the first months I answered emails at midnight.
B) TOM (sales manager): My team works remotely, and honestly I miss the energy of the office. Ideas used to come from conversations in the kitchen.
C) LUCÍA (developer): Remote work let me move back to my hometown and be close to my parents. I wouldn't go back to a city for any salary.
D) DAN (HR): Contracts are the real issue. Many companies haven't updated their policies, so nobody knows who pays for equipment or internet.`,
    preguntas:[op('Who mentions a family reason?',['A','B','C','D'],2,'be close to my parents.'),op('Who talks about legal or practical rules?',['A','B','C','D'],3,'Contracts… policies… who pays for equipment.'),op('Who found it hard to stop working?',['A','B','C','D'],0,'I had to learn to switch off.'),op('Who misses informal conversations?',['A','B','C','D'],1,'Ideas used to come from conversations in the kitchen.')]},
   {id:'l4',consigna:'Parte 4 · Lee el informe técnico y responde con una o dos palabras.',texto:`Following last week's security incident, the IT department has reviewed how the attackers gained access. An employee received an email that appeared to come from the finance director and clicked on a link to a fake login page. Because the account was not protected by two-factor authentication, the attackers were able to log in and download several invoices.

Three measures will be introduced immediately. Two-factor authentication will become mandatory for all staff, external emails will display a clear warning banner, and every employee will complete a thirty-minute awareness course by the end of the month.`,
    preguntas:[es('The fake email appeared to come from the finance…',['director'],'appeared to come from the finance director.'),es('What did the attackers download?',['invoices','several invoices'],'download several invoices.'),es('What will become mandatory?',['two-factor authentication','2FA','two factor authentication'],'Two-factor authentication will become mandatory.'),es('How long is the awareness course? (minutes)',['30','thirty','thirty minutes','30 minutes'],'a thirty-minute awareness course.')]}
  ],
  uso:[
   {id:'u1',consigna:'Uso del idioma · Parte 1 · Elige la palabra que completa cada hueco.',texto:`When the company announced it would (1) ___ a four-day week, many employees were sceptical. However, after six months, productivity had (2) ___ steady and sick days had fallen sharply. The trial was such a (3) ___ that the board decided to make it permanent.`,
    preguntas:[op('(1)',['introduce','produce','reduce','induce'],0,'introduce a policy = implantar una medida.'),op('(2)',['kept','remained','held','lasted'],1,'remain steady = mantenerse estable.'),op('(3)',['victory','success','win','triumph'],1,'such a success = un éxito tal.')]},
   {id:'u2',consigna:'Uso del idioma · Parte 2 · Escribe UNA palabra en cada hueco.',texto:`(1) ___ the bad weather, the festival went ahead as planned. Thousands of people turned (2) ___, and the organisers said it was the best year they had ever had. Next year they hope to attract even (3) ___ visitors.`,
    preguntas:[es('(1)',['despite'],'Despite + sustantivo = a pesar de.'),es('(2)',['up'],'turn up = presentarse, llegar.'),es('(3)',['more'],'even more = todavía más.')]},
   {id:'u3',consigna:'Uso del idioma · Parte 3 · Forma una palabra con la que está entre paréntesis.',texto:`Online shopping has become (1) ___ (INCREASE) popular. Its main (2) ___ (ADVANTAGE) is that you can't touch the products, which makes some customers feel (3) ___ (COMFORT).`,
    preguntas:[es('(1) INCREASE',['increasingly'],'Adverbio: increasingly popular.'),es('(2) ADVANTAGE',['disadvantage'],'Con «you can\'t touch»: es una desventaja (disadvantage).',{advantage:'El sentido es negativo: disadvantage.'}),es('(3) COMFORT',['uncomfortable'],'feel + adjetivo negativo: uncomfortable.',{comfortable:'El sentido es negativo: uncomfortable.'})]},
   {id:'u4',consigna:'Uso del idioma · Parte 4 · Completa la segunda frase con la palabra dada (2–5 palabras) para que signifique lo mismo.',texto:`1) "I'm sorry I was late," said Mark. → Mark ___ late. (APOLOGISED)
2) It's a pity I didn't study harder. → I ___ harder. (WISH)
3) They will build a new hospital next year. → A new hospital ___ next year. (BE)`,
    preguntas:[es('1) Mark ___ late. (APOLOGISED)',['apologised for being','apologized for being','apologised for having been','apologized for having been'],'apologise for + -ing.'),es('2) I ___ harder. (WISH)',['wish i had studied','wish i\'d studied'],'Lamento del pasado: wish + had + participio.'),es('3) A new hospital ___ next year. (BE)',['will be built','is going to be built'],'Pasiva en futuro: will be + participio.')]}
  ],
  escritura:[
   ensayo('Ensayo (140–190 palabras). Tu profesor te pidió: «Some people say that social media does more harm than good to teenagers. Do you agree?». Escribe sobre: 1) la salud mental, 2) la comunicación con amigos y 3) tu propia idea.',`Nowadays, most teenagers spend several hours a day on social media, and many parents are worried about its effects. In my view, social media can be harmful, but it is not the main problem.
Firstly, there is evidence that comparing yourself with others online can damage self-esteem, especially when young people only see perfect images. Furthermore, endless scrolling can affect sleep, which has a direct impact on mood and school results.
On the other hand, social media helps teenagers stay in touch with friends who live far away and find communities that share their interests. For example, a shy student might find support in an online group that does not exist at school.
In my opinion, the key factor is education. If schools taught young people how algorithms work and how to manage their time, social media would become a useful tool rather than a danger.
In conclusion, social media itself is neither good nor bad; what matters is how teenagers learn to use it.`),
   {id:'w2',tipo:'resena',consigna:'Reseña (140–190 palabras) para una web de tecnología: una app o un dispositivo que uses a diario. Describe qué hace, lo mejor, lo peor y si la recomiendas.',min:140,max:190,
    criterios:[crit('Presentas qué es (It is / This app…)','\\b(this (app|device|phone|tool)|it is|it\'s)\\b','Di qué es y para qué sirve.'),crit('Das lo positivo y lo negativo (the best / the worst / the only drawback)','\\b(best|worst|drawback|downside|disadvantage|advantage)\\b','Incluye lo mejor y lo peor.'),
     crit('Usas vocabulario de opinión variado (impressive, user-friendly, disappointing…)','\\b(impressive|user-friendly|disappointing|reliable|outstanding|frustrating|intuitive|worth)\\b','Usa adjetivos precisos.'),crit('Recomiendas o no, y a quién (I would recommend … to…)','\\b(recommend|worth (it|the money|downloading)|if you)\\b','Termina con una recomendación clara.')],
    modelo:`If you have ever forgotten an important task, Taskly might be the app you need. It is a to-do list that organises your day by priority and reminds you of deadlines at the right moment.
The best thing about Taskly is how user-friendly it is. You can add a task by speaking, and it automatically understands dates such as "next Tuesday at five". I also find the weekly summary impressive: it shows how much time I spent on each project, which has helped me plan more realistically.
However, it is not perfect. The free version only allows three projects, and the premium subscription is rather expensive for students. Another drawback is that it does not work offline, which is frustrating when travelling.
Overall, Taskly is reliable and well designed. I would recommend it to anyone who works on several projects at once, but if you only need a simple shopping list, the free apps on your phone are probably enough.`}
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige la respuesta.',audio:[['A','So, did you accept the offer from the startup?'],['B','I was tempted, the salary is higher, but in the end I turned it down. They couldn\'t tell me what my role would be in six months, and I\'ve had enough uncertainty for a while.']],
    preguntas:[op('Why did the man refuse the offer?',['The salary was too low','The role wasn\'t clear','He wants to start his own company'],1,'They couldn\'t tell me what my role would be.')]},
   {id:'e2',consigna:'Parte 2 · Escucha la charla y completa con una o dos palabras.',audio:[['A','When we started monitoring the river, the levels of plastic were alarming: we found more than two hundred items per square metre on some beaches. Most of it came not from tourists, as people assumed, but from a factory upstream. After a two-year campaign, the factory installed filters, and plastic levels have dropped by around seventy percent. Our next goal is to work with local schools, because changing habits starts with children.']],
    preguntas:[es('Items per square metre on some beaches: more than…',['200','two hundred'],'more than two hundred items.'),es('Most plastic came from a…',['factory'],'from a factory upstream.'),es('Plastic levels dropped by around … percent.',['70','seventy'],'by around seventy percent.'),es('Next they will work with local…',['schools'],'work with local schools.')]},
   {id:'e3',consigna:'Parte 3 · Escucha a dos hablantes y elige.',audio:[['A','I think online courses are great, but I never finish them.'],['B','Same here. Without a deadline or a teacher waiting for my work, I just lose motivation.'],['A','Maybe we should study together. If we agreed to meet every Thursday, we\'d have to keep up.'],['B','That could work. Let\'s give it a month and see.']],
    preguntas:[op('What problem do they share?',['Courses are expensive','They don\'t finish online courses','They don\'t have time'],1,'I never finish them. — Same here.'),op('What do they decide to do?',['Pay for a teacher','Study together once a week','Stop studying online'],1,'meet every Thursday… give it a month.')]},
   {id:'e4',consigna:'Parte 4 · Escucha la entrevista y elige.',audio:[['A','You were a professional athlete for ten years. Was it hard to stop?'],['B','Much harder than I expected. Physically I was ready, but I didn\'t know who I was without competition. It took me two years to feel comfortable again.'],['A','And now you coach young athletes.'],['B','Yes, and the first thing I teach them is to have a life outside sport. I wish someone had told me that at their age.']],
    preguntas:[op('What was hardest about stopping?',['The physical change','Losing her identity','Finding a new job'],1,'I didn\'t know who I was without competition.'),op('What does she teach young athletes first?',['To train harder','To have a life outside sport','To win competitions'],1,'the first thing I teach them is to have a life outside sport.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['What do you find most satisfying about your work or studies?','How has technology changed the way you learn?','If you could live anywhere in the world, where would it be and why?'],
    modelos:['What I find most satisfying is solving problems that actually help people.','I can learn almost anything online now, but I have to be disciplined because there are so many distractions.','I would live in Lisbon, because it combines a relaxed lifestyle with a growing tech scene.'],segundos:40},
   {tipo:'turno',titulo:'Parte 2 · Turno largo (1 minuto)',escena:'parque',consigna:'Habla durante un minuto: ¿por qué crees que estas personas eligieron pasar el domingo en el parque y qué beneficios tiene?',
    preguntas:['Why do you think these people have chosen to spend their Sunday in the park, and what are the benefits?'],modelos:['In the picture, several people are spending a sunny Sunday in the park. A family is having a picnic, two children are playing football and a man is running with his dog. I think they have chosen the park because it is free and gives them a break from screens and work. The benefits are clear: physical exercise, fresh air and time together. Parks must be especially important for people who live in small flats without a garden.'],segundos:60},
   {tipo:'discusion',titulo:'Parte 3 · Discusión',consigna:'Hablemos del tiempo libre y la vida en las ciudades.',
    preguntas:['Do you think people have less free time than in the past?','Should governments spend more money on public parks or on sports centres?','How might cities change in the next twenty years?'],
    modelos:['In some ways yes, because work follows us home on our phones, although technology has also made many tasks quicker.','I would invest in parks first, since they benefit everyone regardless of income.','I expect cities to become greener, with fewer cars and more space for pedestrians.'],segundos:50}
  ]}
},{
  id:'b2-2',nivel:'B2',titulo:'Simulacro B2 · 2',minutos:{lectura:40,uso:30,escritura:80,escucha:40,habla:14},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Lee el artículo y elige la respuesta correcta.',texto:`When the small town of Valle Verde lost its last bank branch, local shop owners feared the worst. Older residents, many of whom had never used online banking, suddenly had to travel forty kilometres to withdraw cash. Some simply stopped going to the shops.

Rather than wait for a solution from above, a group of residents organised weekly sessions in the library where teenagers taught older people how to use banking apps safely. The teenagers, in turn, earned credits that counted towards their school community service.

Two years on, the scheme has spread to six neighbouring towns. Shop owners report that card payments have risen sharply, and the library has become a meeting point for different generations. "We came to teach technology," one sixteen-year-old volunteer said, "but we ended up learning a lot about patience and about our town's history."`,
    preguntas:[op('What problem did the town face?',['Shops were closing','Older people couldn\'t access their money easily','Teenagers had nothing to do'],1,'had to travel forty kilometres to withdraw cash.'),op('What did the teenagers get in return?',['Money','School credits','Free bank accounts'],1,'earned credits that counted towards their school community service.'),op('What did the volunteer say they learned?',['Banking skills','Patience and local history','How to run a library'],1,'we ended up learning a lot about patience and about our town\'s history.')]},
   {id:'l2',consigna:'Parte 2 · Elige la frase que falta en cada hueco.',texto:`Learning to code at forty was not part of my plan. (1) ___ My job in a travel agency had disappeared almost overnight, and I needed a new career quickly. The first weeks were humbling. (2) ___ What kept me going was a study group of other career-changers. (3) ___ Eighteen months later, I was hired as a junior developer by one of my old clients.

A) We met every Sunday to solve problems together and, more importantly, to complain.
B) Younger classmates finished exercises in minutes that took me hours.
C) But in 2020, like many people, I didn't have much choice.
D) I had always been good at mathematics at school.`,
    preguntas:[op('(1)',['A','B','C','D'],2,'«No estaba en mis planes» → «pero en 2020 no tuve opción».'),op('(2)',['A','B','C','D'],1,'Ejemplo de «humbling»: los compañeros jóvenes terminaban en minutos.'),op('(3)',['A','B','C','D'],0,'Desarrolla «study group»: nos reuníamos cada domingo.')]},
   {id:'l3',consigna:'Parte 3 · Lee las reseñas de cursos en línea. ¿Qué reseña dice cada cosa?',texto:`A) "The videos are excellent, but there's no way to ask questions. When I got stuck, I had to search forums for hours."
B) "It's expensive, I'll admit, but the weekly feedback from a real tutor transformed my writing."
C) "I loved that I could study on my phone during my commute. Short lessons, perfect for busy people."
D) "The certificate helped me get a promotion, although the content itself was quite basic."`,
    preguntas:[op('Which review mentions a lack of support?',['A','B','C','D'],0,'there\'s no way to ask questions.'),op('Which review values personal feedback despite the price?',['A','B','C','D'],1,'expensive… but the weekly feedback.'),op('Which review mentions a career benefit?',['A','B','C','D'],3,'helped me get a promotion.'),op('Which review praises flexibility?',['A','B','C','D'],2,'study on my phone during my commute.')]},
   {id:'l4',consigna:'Parte 4 · Lee el correo y responde con una o dos palabras.',texto:`Dear team,
As you know, the migration of our customer database to the new cloud provider was scheduled for this weekend. Unfortunately, during final testing we discovered that some older records were not being transferred correctly. Rather than risk losing data, we have decided to postpone the migration by two weeks.

During this period, the current system will remain in use, so no action is needed from you. However, please avoid making large changes to customer records after the 20th, as these may need to be checked manually.

Thank you for your patience,
Samira Khan, Head of IT`,
    preguntas:[es('What was postponed?',['the migration','migration','the database migration'],'we have decided to postpone the migration.'),es('By how long? (weeks)',['two','2','two weeks'],'postpone the migration by two weeks.'),es('Why? Some older … were not transferred correctly.',['records'],'some older records were not being transferred correctly.'),es('After which date should you avoid large changes? The…',['20th','20','twentieth'],'after the 20th.')]}
  ],
  uso:[
   {id:'u1',consigna:'Uso del idioma · Parte 1 · Elige la palabra que completa cada hueco.',texto:`The museum's new exhibition (1) ___ a lot of attention when it opened last month. Critics praised its (2) ___ use of technology, and visitor numbers have (3) ___ all expectations.`,
    preguntas:[op('(1)',['took','attracted','pulled','drew up'],1,'attract attention = atraer la atención.'),op('(2)',['innovative','innovation','innovate','innovatively'],0,'Antes de un sustantivo (use) va un adjetivo: innovative.'),op('(3)',['overcome','exceeded','passed','beaten'],1,'exceed expectations = superar las expectativas.')]},
   {id:'u2',consigna:'Uso del idioma · Parte 2 · Escribe UNA palabra en cada hueco.',texto:`By the (1) ___ we arrived at the station, the last train had already left. We had no choice (2) ___ to take a taxi, which cost us a fortune. Next time, we will check the timetable (3) ___ advance.`,
    preguntas:[es('(1)',['time'],'By the time = para cuando.'),es('(2)',['but'],'have no choice but to = no tener más remedio que.'),es('(3)',['in'],'in advance = con anticipación.')]},
   {id:'u3',consigna:'Uso del idioma · Parte 3 · Forma una palabra con la que está entre paréntesis.',texto:`The (1) ___ (DECIDE) to close the factory was announced without any (2) ___ (WARN). Workers described the news as completely (3) ___ (EXPECT).`,
    preguntas:[es('(1) DECIDE',['decision'],'Sustantivo: decision.'),es('(2) WARN',['warning'],'Sustantivo: warning.'),es('(3) EXPECT',['unexpected'],'Adjetivo negativo: unexpected.',{expected:'Las noticias sorprendieron: unexpected.'})]},
   {id:'u4',consigna:'Uso del idioma · Parte 4 · Completa la segunda frase con la palabra dada (2–5 palabras).',texto:`1) "Don't touch the screen," the teacher told us. → The teacher ___ the screen. (NOT)
2) I'm sure she forgot about the meeting. → She ___ about the meeting. (MUST)
3) If you don't hurry, you'll miss the bus. → You'll miss the bus ___ hurry. (UNLESS)`,
    preguntas:[es('1) The teacher ___ the screen. (NOT)',['told us not to touch'],'Órdenes en estilo indirecto: told + persona + not to + verbo.'),es('2) She ___ about the meeting. (MUST)',['must have forgotten'],'Deducción en pasado: must have + participio.'),es('3) You\'ll miss the bus ___ hurry. (UNLESS)',['unless you'],'unless = if … not.')]}
  ],
  escritura:[
   ensayo('Ensayo (140–190 palabras): «Every student should learn to code at school. Do you agree?». Escribe sobre: 1) el futuro del trabajo, 2) otras materias que podrían perder tiempo y 3) tu propia idea.',`Nowadays, technology is part of almost every job, so many people argue that coding should be compulsory at school. I partly agree with this view.
Firstly, learning to code teaches logical thinking and problem-solving, skills that are useful far beyond computing. Furthermore, as more tasks become automated, students who understand how software works will be better prepared for the jobs of the future.
On the other hand, the school timetable is already full. If coding became compulsory, subjects such as art, music or history might lose hours, and these subjects develop creativity and critical thinking, which are just as important.
In my opinion, the best solution would be to include basic programming within existing subjects. For instance, students could use simple code to analyse data in science or create animations in art.
In conclusion, every student should have the chance to learn some coding, but not at the expense of a balanced education.`),
   {id:'w2',tipo:'informe',consigna:'Informe (140–190 palabras) para tu jefa: tu equipo probó una herramienta de videollamadas durante un mes. Explica cómo se usó, ventajas, problemas y tu recomendación. Usa títulos.',min:140,max:190,
    criterios:[crit('Dices el objetivo del informe (The aim of this report…)','\\b(the (aim|purpose) of this report|this report)\\b','Empieza con The aim of this report is to….'),crit('Usas títulos (Introduction, Advantages, Problems, Recommendation)','(introduction|advantages|problems|drawbacks|recommendation|conclusion)','Organiza con títulos.'),
     crit('Usas la voz pasiva al menos una vez (was used, were reported…)','\\b(was|were|has been|have been)\\s+\\w+(ed|en|t)\\b','En un informe: The tool was used by….'),crit('Haces una recomendación (I recommend / I would suggest)','\\b(i (would )?recommend|i (would )?suggest|it is recommended)\\b','Cierra con una recomendación.'),SIN_CONTRACCIONES],
    modelo:`Introduction
The aim of this report is to evaluate MeetNow, the video call tool that our team tested during March, and to recommend whether we should adopt it.
How it was used
The tool was used by all eight members of the team for daily meetings and for calls with three external clients.
Advantages
Most colleagues found MeetNow easier to use than our current system. The automatic subtitles were especially useful with international clients, and recordings were saved directly to our shared folder.
Problems
Two problems were reported. Firstly, the sound quality was poor when more than six people joined a call. Secondly, the mobile app crashed several times, which caused delays in two client meetings.
Recommendation
Overall, I would recommend adopting MeetNow for internal meetings, as it saves time and is popular with the team. However, I suggest keeping the current system for large client calls until the sound problem has been solved.`}
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige.',audio:[['A','Have you finished the report for the board?'],['B','Almost. I was going to send it this afternoon, but the sales figures for March still haven\'t arrived, so it\'ll have to wait until tomorrow morning.']],
    preguntas:[op('Why is the report delayed?',['She is ill','Some figures are missing','The board cancelled the meeting'],1,'the sales figures for March still haven\'t arrived.')]},
   {id:'e2',consigna:'Parte 2 · Escucha la charla y completa con una o dos palabras.',audio:[['A','Our city\'s bike-sharing scheme started five years ago with just three hundred bikes. Today there are over two thousand, and electric bikes make up a third of the fleet. The most popular time to ride is between eight and nine in the morning. One unexpected finding was that the scheme reduced car journeys less than expected, but replaced many short bus trips.']],
    preguntas:[es('Number of bikes at the start:',['300','three hundred'],'with just three hundred bikes.'),es('Fraction of electric bikes: a…',['third','1/3'],'make up a third of the fleet.'),es('Most popular time starts at … a.m.',['8','eight'],'between eight and nine in the morning.'),es('The scheme replaced many short … trips.',['bus'],'replaced many short bus trips.')]},
   {id:'e3',consigna:'Parte 3 · Escucha y elige.',audio:[['A','I can\'t believe the concert got cancelled.'],['B','Well, the singer has a throat infection, so they didn\'t have much choice.'],['A','I know, but they announced it two hours before it started. Some people had travelled from other cities!'],['B','True. They should at least offer a refund for travel costs.']],
    preguntas:[op('What is the woman mainly annoyed about?',['The singer\'s illness','How late the cancellation was announced','The ticket price'],1,'they announced it two hours before it started.'),op('What does the man think the organisers should do?',['Find another singer','Pay for people\'s travel','Hold the concert anyway'],1,'offer a refund for travel costs.')]},
   {id:'e4',consigna:'Parte 4 · Escucha y elige.',audio:[['A','You\'ve written six novels. Do you plan them in detail?'],['B','Not at all. I used to, with my first book, but I found the characters felt like puppets. Now I start with a single scene and let the story surprise me.'],['A','Doesn\'t that lead to a lot of rewriting?'],['B','Enormously. My last novel had nine drafts. But I\'d rather rewrite than be bored.']],
    preguntas:[op('How does the writer work now?',['She plans every chapter','She starts with one scene and improvises','She writes with a co-author'],1,'I start with a single scene and let the story surprise me.'),op('How does she feel about rewriting?',['She hates it','She accepts it as the price of not being bored','She avoids it'],1,'I\'d rather rewrite than be bored.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['What kind of skills do you think will be most important in the future?','Tell me about a decision that changed your life.','How do you usually deal with stress?'],
    modelos:['I think the ability to keep learning and to work with people from different cultures will be essential.','Moving to another city for university changed my life, because I became much more independent.','I usually go for a run or call a friend; talking about the problem helps me put it in perspective.'],segundos:40},
   {tipo:'turno',titulo:'Parte 2 · Turno largo (1 minuto)',escena:'cocina',consigna:'Habla durante un minuto: ¿cómo ha cambiado la forma en que las familias comen juntas, y por qué?',
    preguntas:['How have family meals changed, and why do you think this has happened?'],modelos:['The picture shows a typical busy morning: a mother is cooking eggs while her son drinks orange juice, and the clock says it is half past seven, so they are probably in a hurry. I think family meals have changed a lot. In the past, families used to eat together every day, but nowadays work schedules, long commutes and phones mean that many people eat at different times. Even so, I believe shared meals are still important, because they are often the only moment when families really talk.'],segundos:60},
   {tipo:'discusion',titulo:'Parte 3 · Discusión',consigna:'Hablemos de la familia, el trabajo y la tecnología.',
    preguntas:['Should companies limit emails outside working hours?','Is it more difficult to raise children today than in the past?','What role should technology play at home?'],
    modelos:['I think so. Several countries have introduced a right to disconnect, and it seems to reduce burnout.','In some ways yes, because parents have to deal with screens and social media, although they also have more information.','Technology should support family life, not replace conversation; for example, no phones during dinner.'],segundos:50}
  ]}
}];
