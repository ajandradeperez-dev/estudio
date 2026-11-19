/* Simulacros B1 (formato inspirado en B1 Preliminary; contenido original, no es un examen oficial). */
import {op,es,crit,SALUDO,CIERRE} from './base.js';

const correo=(consigna,modelo)=>({id:'w1',tipo:'correo',consigna,min:80,max:120,modelo,
  criterios:[SALUDO,crit('Respondes a todos los puntos con conectores (also, because, so, but)','\\b(also|because|so|but|however|as well)\\b','Une ideas: because, so, but, also.'),
   crit('Haces una pregunta o propuesta (Would you like / Shall we / Why don\'t we…?)','\\?','Incluye al menos una pregunta.'),
   crit('Usas una forma de futuro o condicional (will / going to / would / if)','\\b(will|going to|would|if)\\b','Habla de planes: I\'m going to… / It would be….'),CIERRE]});
const articulo=(consigna,modelo)=>({id:'w2',tipo:'articulo',consigna,min:100,max:140,modelo,
  criterios:[crit('Tiene un título o una pregunta que enganche al lector','^\\s*[^\\n]{3,60}\\n|\\?','Empieza con un título o una pregunta al lector.'),
   crit('Das tu opinión (I think / In my opinion / For me)','\\b(i think|in my opinion|for me|i believe|personally)\\b','Opina: In my opinion, ….'),
   crit('Das un ejemplo (for example / for instance / such as)','\\b(for example|for instance|such as)\\b','Pon un ejemplo.'),
   crit('Cierras con una conclusión o consejo (So / To sum up / You should)','\\b(so|to sum up|in conclusion|you should|why not)\\b','Termina con un consejo o conclusión.')]});

export default [{
  id:'b1-1',nivel:'B1',titulo:'Simulacro B1 · 1',minutos:{lectura:40,escritura:40,escucha:30,habla:12},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Mensajes cortos. Elige qué significa cada uno.',texto:`A) From: Gym reception — "Due to repairs, the changing rooms will be unavailable on Saturday morning. Members are advised to arrive already changed."
B) Note on a fridge — "Lucas, I've taken the car to the garage. The keys for the bike are in the drawer by the door. Back at 6. — Mum"`,
    preguntas:[op('A: On Saturday morning, gym members should…',['not come to the gym','come wearing their sports clothes','use the changing rooms early'],1,'arrive already changed = lleguen ya cambiados.'),
     op('B: Lucas can…',['use the bike','drive the car','go to the garage at 6'],0,'The keys for the bike are in the drawer.')]},
   {id:'l2',consigna:'Parte 2 · Empareja a cada persona con el curso ideal.',texto:`PEOPLE
1. Marta wants to improve her English for job interviews, but she can only study at weekends.
2. Omar loves cooking and wants to learn dishes from other countries, preferably in the evenings.
3. Julia needs a short course to learn basic first aid before starting a job at a summer camp.

COURSES
A) World Kitchen: eight evening classes on Asian and Mediterranean food.
B) Speak Up Saturdays: interview practice and business vocabulary, Saturday mornings.
C) Safe & Ready: one-day first aid course with a certificate.
D) Grammar Online: self-study grammar course, any time.`,
    preguntas:[op('Marta',['A','B','C','D'],1,'Fin de semana + entrevistas: Speak Up Saturdays.'),op('Omar',['A','B','C','D'],0,'Cocina de otros países por las tardes: World Kitchen.'),op('Julia',['A','B','C','D'],2,'Primeros auxilios, curso corto: Safe & Ready.')]},
   {id:'l3',consigna:'Parte 3 · Lee el texto y elige la respuesta correcta.',texto:`When I was offered a job in a small town in Scotland, I nearly said no. I had always lived in big cities and I was worried I would feel bored and lonely. My friends thought I was crazy to even consider it.

In the end, I decided to give it a try for a year. That was four years ago, and I'm still here. What changed my mind was the people. On my second day, my neighbour knocked on the door with a cake and an invitation to a village dinner. Within a month I knew more people here than I had known in five years in the city.

Of course, there are disadvantages. The nearest cinema is forty minutes away by car, and in winter it gets dark at four in the afternoon. But I've discovered hobbies I would never have tried in the city, like sailing and singing in a choir. If someone had told me this five years ago, I wouldn't have believed them.`,
    preguntas:[op('At first, the writer…',['was excited about the job','almost refused the job','already knew the town'],1,'I nearly said no = casi dije que no.'),
     op('What made the writer stay?',['The salary','The people','The weather'],1,'What changed my mind was the people.'),
     op('One disadvantage of the town is that…',['it has no shops','the cinema is far away','people are unfriendly'],1,'The nearest cinema is forty minutes away.'),
     op('How does the writer feel now?',['Surprised and happy','Lonely','Ready to leave'],0,'If someone had told me this…, I wouldn\'t have believed them.')]},
   {id:'l4',consigna:'Parte 4 · Elige la palabra correcta para cada hueco.',texto:`Many people (1) ___ that working from home is easier, but it can be difficult to stay focused. Experts recommend (2) ___ a separate place to work and taking short breaks. It is also important to (3) ___ in touch with colleagues, (4) ___ you might feel isolated.`,
    preguntas:[op('(1)',['believe','agree','tell'],0,'believe that… = creer que….'),op('(2)',['have','having','to have'],1,'recommend + -ing.'),op('(3)',['stay','make','take'],0,'Collocation: stay in touch (o keep in touch) = mantenerse en contacto.'),op('(4)',['so','because','otherwise'],2,'otherwise = de lo contrario.')]},
   {id:'l5',consigna:'Parte 5 · Escribe UNA palabra en cada hueco.',texto:`I've (1) ___ learning English for three years. At first I found it hard, but now I can watch films (2) ___ subtitles. Next year I'm planning (3) ___ take an exam, and if I pass, I (4) ___ apply for a job abroad.`,
    preguntas:[es('(1)',['been'],'Presente perfecto continuo: I\'ve been learning.'),es('(2)',['without'],'without subtitles = sin subtítulos.'),es('(3)',['to'],'plan + to + verbo.'),es('(4)',['will',"'ll",'can','could','might'],'Condicional 1: if I pass, I will….')]}
  ],
  escritura:[
   correo('Recibiste este correo de tu amigo Tom: «I\'m visiting your city next month for four days. What should I see? Where should I stay? Would you have time to meet?» Escríbele (80–120 palabras).',`Hi Tom,
Great news! You'll love my city. First, you should visit the old town, because the buildings are beautiful, and also the market on Sunday. I think the best area to stay is near the main square, so you can walk everywhere. There are some nice small hotels there.
Of course I'd love to meet! I'm working during the week, but I'm free on Saturday. Shall we have lunch together? I know a great Mexican restaurant. If the weather is good, we could also go hiking in the afternoon.
Let me know your dates.
Best,
Carlos`),
   articulo('Escribe un artículo para la revista de tu escuela (100–140 palabras): «Una app que cambió mi vida». ¿Qué app es, cómo la usas y por qué la recomiendas?',`An app that changed my life
Do you waste time every day? I did, until I found a simple app called FocusTime.
The idea is easy: you choose a task, the app starts a 25-minute timer and you can't use your phone until it finishes. Then you get a five-minute break. For example, I use it when I study English or when I clean my room.
In my opinion, the best part is that it shows how much time you really spend on social media. I was shocked! Now I finish my homework faster and I have more free time.
So, if you find it hard to concentrate, you should try an app like this. It might change your life too.`)
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige la respuesta.',audio:[['A','Shall we take the train or drive to the conference?'],['B','The train is faster, but it\'s more expensive, and we\'d still need a taxi from the station.'],['A','True. And if we drive, we can stop for lunch on the way.'],['B','OK, let\'s drive then. I\'ll pick you up at seven.']],
    preguntas:[op('How will they travel?',['By train','By car','By taxi'],1,'let\'s drive then.')]},
   {id:'e2',consigna:'Parte 2 · Escucha la entrevista y elige.',audio:[['A','So you started your bakery during the pandemic?'],['B','Yes. I lost my job in a hotel, and I had always loved baking bread, so I started selling it to my neighbours.'],['A','And now you have a shop.'],['B','Two, actually. The second one opened last month. The hardest part was learning to manage money, not baking.']],
    preguntas:[op('Why did she start baking for neighbours?',['She lost her job','She wanted to leave the hotel','A friend asked her'],0,'I lost my job in a hotel.'),op('What was the hardest part?',['Baking bread','Managing money','Finding a shop'],1,'The hardest part was learning to manage money.')]},
   {id:'e3',consigna:'Parte 3 · Escucha el anuncio y completa con una o dos palabras.',audio:[['A','Welcome to the Science Museum. Today the dinosaur hall is closed until two p.m. because of a school visit. Our planetarium shows begin every hour, starting at eleven. Tickets for the shows are sold at the information desk, not at the entrance. The café on the top floor offers a ten percent discount for students.']],
    preguntas:[es('The dinosaur hall opens at…',['2 p.m.','two','2','2 pm','two p.m.'],'closed until two p.m.'),es('First planetarium show:',['11','eleven','at eleven','11 a.m.'],'starting at eleven.'),es('Buy show tickets at the … desk.',['information'],'at the information desk.'),es('Student discount in the café:',['10%','ten percent','10 percent','10'],'ten percent discount.')]},
   {id:'e4',consigna:'Parte 4 · Escucha la conversación y elige.',audio:[['A','I\'m thinking of quitting my job to study full time.'],['B','Really? Can you afford it?'],['A','I\'ve saved enough for a year, and the course only lasts ten months.'],['B','Then I think you should do it. You\'ve been unhappy at work for ages.'],['A','I know. My only worry is finding a job afterwards.']],
    preguntas:[op('What is the woman\'s main worry?',['Money for the course','Finding a job after the course','The length of the course'],1,'My only worry is finding a job afterwards.'),op('What does the man think?',['She should keep her job','She should study','She should find a cheaper course'],1,'I think you should do it.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['Tell me something about where you live.','What do you enjoy doing in your free time?','How long have you been learning English?','What do you think you will be doing in five years?'],
    modelos:['I live in a busy neighbourhood in Guadalajara. There are lots of cafés and a big park.','I enjoy cycling and playing the guitar with friends.','I\'ve been learning English for three years, mostly online.','In five years I think I\'ll be working as an engineer, maybe abroad.'],segundos:40},
   {tipo:'descripcion',titulo:'Parte 2 · Describe la imagen',escena:'oficina',consigna:'Describe lo que ves en la imagen: el lugar, las personas, qué están haciendo y qué crees que pasa.',
    preguntas:['Describe the picture. What can you see?'],modelos:['This picture shows an office. On the left there\'s a woman on the phone. She looks worried, probably because there is an error on her computer screen. Next to her, the printer isn\'t working and there are papers on the floor. A man is bringing coffee. There\'s a meeting at ten, so I think they are in a hurry.'],segundos:60},
   {tipo:'discusion',titulo:'Parte 3 · Discusión',consigna:'Hablemos del trabajo en equipo y la tecnología.',
    preguntas:['Do you think technology makes work easier or more stressful? Why?','Would you prefer to work from home or in an office?','What makes a good colleague?'],
    modelos:['I think it makes work easier, but it can be stressful when things break, like in the picture.','I\'d prefer a mix. At home I can focus, but in the office I learn from my colleagues.','A good colleague is someone who helps you and communicates clearly.'],segundos:45}
  ]}
},{
  id:'b1-2',nivel:'B1',titulo:'Simulacro B1 · 2',minutos:{lectura:40,escritura:40,escucha:30,habla:12},
  lectura:[
   {id:'l1',consigna:'Parte 1 · Mensajes cortos. Elige qué significa cada uno.',texto:`A) Email from a teacher — "The deadline for your projects has been extended to Monday. However, late projects after that date will lose 10% of their marks."
B) Sign in a shop — "Items in the sale can be exchanged but not refunded."`,
    preguntas:[op('A: Students…',['must hand in projects today','have more time to finish','will lose marks on Monday'],1,'has been extended to Monday = se extendió hasta el lunes.'),
     op('B: If you buy something in the sale, you…',['can get your money back','can change it for something else','cannot change it'],1,'exchanged but not refunded = se cambia, pero no se reembolsa.')]},
   {id:'l2',consigna:'Parte 2 · Empareja a cada persona con el alojamiento ideal.',texto:`PEOPLE
1. The Garcías are a family of five who want to cook their own meals and be near the beach.
2. Kenji is travelling alone on a small budget and wants to meet other travellers.
3. Laura and Pete want a quiet, romantic place in the mountains with a good restaurant.

PLACES
A) Sunny Hostel: shared rooms, cheap prices, social events every night.
B) Pine Lodge: a small hotel in the mountains, famous for its restaurant. Adults only.
C) Sea Breeze Apartments: two-bedroom flats with kitchens, 200 metres from the beach.
D) City Grand Hotel: luxury rooms in the city centre, near the shops.`,
    preguntas:[op('The Garcías',['A','B','C','D'],2,'Cocina y cerca de la playa: Sea Breeze Apartments.'),op('Kenji',['A','B','C','D'],0,'Barato y conocer viajeros: Sunny Hostel.'),op('Laura and Pete',['A','B','C','D'],1,'Montaña, tranquilo y buen restaurante: Pine Lodge.')]},
   {id:'l3',consigna:'Parte 3 · Lee el texto y elige la respuesta correcta.',texto:`Every year, millions of tonnes of food are thrown away while they are still safe to eat. A group of students in Bogotá decided to do something about it. They created an app that connects restaurants and supermarkets with people who want to buy food at the end of the day for a much lower price.

"At first, shops didn't trust us," explains Valentina, one of the founders. "They thought customers would stop buying at normal prices." To convince them, the students offered the service free for six months and showed that most app users were new customers.

Today the app is used by more than four hundred businesses in three cities. It has saved around two hundred tonnes of food, and the team is now working on a version for schools and hospitals. Valentina believes the biggest change is not in the numbers, but in attitudes: "People have started to see leftover food as an opportunity, not as rubbish."`,
    preguntas:[op('What does the app do?',['Delivers food to schools','Sells food that would be thrown away','Teaches people to cook'],1,'buy food at the end of the day for a much lower price.'),
     op('Why didn\'t shops trust the idea at first?',['They thought it would reduce normal sales','It was too expensive','It didn\'t work well'],0,'customers would stop buying at normal prices.'),
     op('How did the students convince the shops?',['By paying them','By offering it free for six months','By advertising on TV'],1,'offered the service free for six months.'),
     op('According to Valentina, the biggest change is…',['the money they make','the number of cities','how people think about leftover food'],2,'the biggest change is not in the numbers, but in attitudes.')]},
   {id:'l4',consigna:'Parte 4 · Elige la palabra correcta para cada hueco.',texto:`If you (1) ___ to improve your memory, try to get enough sleep. Scientists have (2) ___ that the brain organizes information while we sleep. Reviewing your notes before bed is (3) ___ more effective (4) ___ studying for hours without a break.`,
    preguntas:[op('(1)',['want','will want','wanted'],0,'Condicional 1 / 0: if + presente.'),op('(2)',['find','found','finding'],1,'Presente perfecto: have + participio (found).'),op('(3)',['much','many','very'],0,'much + comparativo: much more effective.'),op('(4)',['that','as','than'],2,'more … than.')]},
   {id:'l5',consigna:'Parte 5 · Escribe UNA palabra en cada hueco.',texto:`Last summer I worked as a volunteer in a national park. The work was hard, (1) ___ I loved it. I was (2) ___ charge of showing visitors the main paths. The best part was the people I met, some of (3) ___ are still my friends. I'd definitely do it (4) ___.`,
    preguntas:[es('(1)',['but'],'Contraste: but.'),es('(2)',['in'],'in charge of = a cargo de.'),es('(3)',['whom','them'],'some of whom = algunos de los cuales.'),es('(4)',['again'],'do it again = hacerlo otra vez.')]}
  ],
  escritura:[
   correo('Tu amiga inglesa Kate te escribe: «I\'d like to learn Spanish. Should I take classes, use an app or find a conversation partner? What worked for you with English?» Respóndele (80–120 palabras).',`Hi Kate,
That's great news! In my opinion, the best thing is to mix all three. I used an app every day for vocabulary, but it wasn't enough, so I also took classes on Saturdays because I needed someone to explain the grammar.
However, what really helped me was finding a conversation partner. We met online twice a week: thirty minutes in English and thirty in Spanish. If you want, I can introduce you to my cousin Sofía. She's going to start learning English next month, so it would be perfect for both of you!
Would you like her email?
Best wishes,
Andrea`),
   articulo('Escribe un artículo para un blog de viajes (100–140 palabras): «El mejor lugar que he visitado». ¿Dónde fue, qué hiciste y por qué lo recomiendas?',`The best place I've ever visited
Have you ever been to San Cristóbal de las Casas? If not, you should put it on your list.
I went there last year with two friends. The town is in the mountains of Chiapas, so it's cool even in summer. We walked around the colourful streets, visited the markets and tried amazing coffee. For example, one day we took a boat through the Sumidero Canyon and saw crocodiles!
In my opinion, the best thing about it is the people. Everyone was friendly and happy to tell us stories about the town.
So, if you love culture, nature and good food, why not go there on your next holiday?`)
  ],
  escucha:[
   {id:'e1',consigna:'Parte 1 · Escucha y elige.',audio:[['A','Do you want to see the film at six or at nine?'],['B','Six is too early for me; I finish work at half past five and it takes me an hour to get there.'],['A','Nine it is, then. I\'ll book the tickets.']],
    preguntas:[op('What time will they see the film?',['6:00','5:30','9:00'],2,'Nine it is, then.')]},
   {id:'e2',consigna:'Parte 2 · Escucha y elige.',audio:[['A','How did the job interview go?'],['B','Better than I expected. They asked me to give a presentation, which made me nervous, but I\'d practised a lot.'],['A','When will you know?'],['B','They said they\'d call me by Friday.']],
    preguntas:[op('How did the interview go?',['Badly','Better than expected','She doesn\'t know'],1,'Better than I expected.'),op('When will they call her?',['Today','By Friday','Next month'],1,'They said they\'d call me by Friday.')]},
   {id:'e3',consigna:'Parte 3 · Escucha y completa con una o dos palabras.',audio:[['A','Hi everyone, here are the details for Saturday\'s hiking trip. We meet at the north gate of the park at seven thirty. The walk is about twelve kilometres, so bring comfortable shoes and plenty of water. Lunch is not included, but there\'s a café at the top of the hill. If it rains, the trip will be moved to Sunday.']],
    preguntas:[es('Meeting point: the … gate.',['north'],'the north gate.'),es('Distance (km):',['12','twelve'],'about twelve kilometres.'),es('If it rains, the trip is moved to…',['Sunday'],'moved to Sunday.')]},
   {id:'e4',consigna:'Parte 4 · Escucha y elige.',audio:[['A','I read that our city wants to ban cars from the centre.'],['B','About time! The air is terrible, and the buses are always stuck in traffic.'],['A','But what about people who can\'t walk far, or shop owners?'],['B','That\'s fair. Maybe they should allow delivery vans in the morning and improve public transport first.']],
    preguntas:[op('What does the woman think about the ban at first?',['She is against it','She supports it','She has no opinion'],1,'About time! = ¡Ya era hora!'),op('What does she suggest in the end?',['Cancel the ban','Allow some vehicles and improve transport','Build more car parks'],1,'allow delivery vans… and improve public transport.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Parte 1 · Entrevista',preguntas:['What do you do, and what do you like about it?','How do you usually spend your weekends?','Tell me about a trip you really enjoyed.','What would you like to learn in the future?'],
    modelos:['I work in customer service. I like helping people solve problems.','I usually go cycling on Saturday and visit my family on Sunday.','I really enjoyed a trip to Oaxaca because of the food and the markets.','I\'d like to learn to play the piano and maybe another language.'],segundos:40},
   {tipo:'descripcion',titulo:'Parte 2 · Describe la imagen',escena:'estacion',consigna:'Describe lo que ves: el lugar, las personas y qué crees que está pasando.',
    preguntas:['Describe the picture. What can you see?'],modelos:['This is a train station. A train is waiting at the platform, and the board shows that one train is delayed. A man with a suitcase is running, maybe because he is late. A woman is sitting on a bench looking at her phone, and a member of staff is helping a tourist with a map.'],segundos:60},
   {tipo:'discusion',titulo:'Parte 3 · Discusión',consigna:'Hablemos de viajes y transporte.',
    preguntas:['Do you prefer travelling by train, bus or plane? Why?','Should cities invest more in public transport?','How will people travel in twenty years?'],
    modelos:['I prefer the train because it\'s comfortable and you can see the landscape.','Yes, because it reduces traffic and pollution.','I think there will be more electric cars and fast trains.'],segundos:45}
  ]}
}];
