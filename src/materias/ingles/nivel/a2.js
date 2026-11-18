/* Inglés A2: práctica del nivel (ver datos.js). Temas: viajes, salud, trabajo, clima, experiencias y direcciones.
   Gramática: pasado simple, presente continuo, futuro (going to / will), comparativos, contables, frecuencia y should. */
import {q,crit,SALUDO,CIERRE} from './base.js';

const lecturas=[
 {id:'a2-l-viaje',titulo:'My trip to Oaxaca',tipoTexto:'Blog de viajes',texto:`Last summer I went to Oaxaca with my best friend, Marta. We took a night bus from Mexico City and arrived early in the morning. The bus was cheaper than the plane, but it was a long trip: almost seven hours!

We stayed in a small hotel near the main square. The first day we visited the market and tried a lot of food: tlayudas, mole and hot chocolate. I loved the mole, but Marta thought it was too sweet.

On the second day we took a tour to Hierve el Agua. The views were amazing, and the water was colder than I expected. In the evening it started to rain, so we went back to the hotel and played cards.

Oaxaca is one of the most beautiful places I know. Next year we are going to visit Chiapas. I can't wait!`,
  preguntas:[q('How did they travel to Oaxaca?',['by bus','by night bus','They took a night bus','by bus.','on a night bus'],'took a night bus = tomaron un autobús nocturno.',{'by plane':'El autobús fue más barato que el avión; fueron en autobús.'}),
   q('How long was the trip? Almost ___ hours.',['seven','7'],'almost = casi.'),
   q('What did Marta think of the mole? She thought it was too ___',['sweet'],'too + adjetivo = demasiado.'),
   q('What did they do when it started to rain?',['they played cards','played cards','They went back to the hotel and played cards','went back to the hotel'],'Busca rain y lo que pasó después.'),
   q('Where are they going to travel next year?',['Chiapas','to Chiapas'],'be going to = planes futuros.')]},
 {id:'a2-l-oferta',titulo:'Job offer: Customer Support',tipoTexto:'Anuncio de empleo',texto:`CUSTOMER SUPPORT AGENT – BrightNet (remote)

We are looking for a friendly person to help our customers by chat and phone.

You should:
- speak Spanish and English (B1 or higher)
- be good with computers
- have experience in customer service (one year or more)

You don't need a university degree.

We offer:
- a full-time job, Monday to Friday, 9 a.m. to 6 p.m.
- a salary of $1,200 a month, plus a bonus every three months
- free English classes and training in our products
- a new laptop and headphones

You will work from home, but you need a quiet place and a fast internet connection.

Send your CV and a short email in English to jobs@brightnet.com before March 15th. We will call the best candidates for an online interview.`,
  preguntas:[q('Where will the agent work?',['from home','at home','remotely','He will work from home'],'remote = a distancia, desde casa.'),
   q('How many years of experience do you need?',['one','one year','1','one year or more','1 year'],'one year or more = un año o más.'),
   q('Do you need a university degree? (yes/no)',['no',"No, you don't"],'You don\'t need = no necesitas.'),
   q('How often do they pay a bonus? Every ___ months.',['three','3'],'every three months = cada tres meses.'),
   q('What is the deadline to send your CV?',['March 15th','before March 15th','March 15','15th of March'],'deadline = fecha límite; before = antes de.')]},
 {id:'a2-l-salud',titulo:'Five tips for a healthy week',tipoTexto:'Artículo de revista',texto:`Do you feel tired all the time? These five small changes can help.

1. Sleep more. Adults should sleep seven to nine hours a night. Try to go to bed at the same time every day.

2. Drink water. Many people don't drink enough water. Carry a bottle with you and drink before you feel thirsty.

3. Move every hour. If you work at a desk, stand up and walk for two minutes every hour. Take the stairs, not the elevator.

4. Eat more vegetables. Fruit and vegetables are better for you than chips or cookies. Try to eat five portions a day.

5. Spend less time on your phone. Turn it off one hour before bed. You will sleep better, and you will have more time for your family and friends.

Remember: small changes are easier than big ones!`,
  preguntas:[q('How many hours should adults sleep?',['seven to nine','7 to 9','seven to nine hours','7-9','between seven and nine'],'should = debería (consejo).'),
   q('What should you do every hour at a desk?',['stand up and walk','walk for two minutes','stand up','stand up and walk for two minutes'],'every hour = cada hora.'),
   q('What should you take instead of the elevator?',['the stairs','stairs'],'Take the stairs, not the elevator.'),
   q('How many portions of fruit and vegetables a day?',['five','5'],'portions = porciones.'),
   q('When should you turn off your phone? One hour before ___',['bed','going to bed','you go to bed'],'before = antes de.')]},
 {id:'a2-l-correo',titulo:'A problem with my order',tipoTexto:'Correo a una tienda en línea',texto:`Dear Customer Service,

I am writing about my order number 48213. I ordered a pair of running shoes on your website on June 2nd, and they arrived yesterday. Unfortunately, there are two problems.

First, the shoes are the wrong size. I ordered a size 8, but you sent me a size 10. Second, the color is different: I chose gray, but these shoes are bright green.

I would like to return them and get the correct shoes. If that is not possible, could you please give me my money back? I paid $85 by credit card.

I am going to travel on June 20th, and I need the shoes for a race on the 25th, so please answer soon.

Thank you for your help.

Best regards,
Natalia Fuentes`,
  preguntas:[q('What did Natalia order?',['running shoes','a pair of running shoes','shoes'],'a pair of = un par de.'),
   q('What size did she order?',['8','size 8','eight'],'Ordered = pidió; sent = enviaron.',{'10':'Le enviaron la 10; ella pidió la 8.'}),
   q('What color did she choose?',['gray','grey'],'chose = eligió (pasado de choose).',{green:'Le llegaron verdes; ella eligió gris.'}),
   q('How much did she pay?',['$85','85 dollars','85'],'paid = pagó (pasado de pay).'),
   q('Why does she need the shoes soon? For a ___ on the 25th.',['race'],'race = carrera.')]},
 {id:'a2-l-ciudades',titulo:'Two cities, two lives',tipoTexto:'Artículo comparativo',texto:`Juan lives in Buenos Aires and his sister Clara lives in Bariloche, in the south of Argentina. They often compare their cities.

Buenos Aires is much bigger and busier than Bariloche. There are more restaurants, theaters and museums, and the nightlife is fantastic. But Juan says the traffic is terrible and life is more expensive. He spends almost an hour on the bus every day.

Bariloche is smaller and quieter. It is surrounded by mountains and lakes, and the air is cleaner. In winter it is much colder than Buenos Aires, and there is a lot of snow. Clara works in a ski school, so winter is her busiest season. In summer she goes hiking and swimming in the lakes.

"Buenos Aires is more exciting," Juan says, "but Clara is probably happier than me!"`,
  preguntas:[q('Which city is bigger?',['Buenos Aires'],'much bigger than = mucho más grande que.'),
   q('How long is Juan on the bus every day? Almost an ___',['hour'],'almost = casi.'),
   q('Where does Clara work?',['in a ski school','at a ski school','a ski school'],'ski school = escuela de esquí.'),
   q('When is Clara\'s busiest season?',['winter','in winter'],'busiest = la más ocupada (superlativo de busy).'),
   q('Who does Juan think is happier?',['Clara','his sister'],'happier than me = más feliz que yo.')]},
 {id:'a2-l-historia',titulo:'The lost phone',tipoTexto:'Relato corto',texto:`Last Friday, Daniel left work late. He was tired and hungry, so he took a taxi home. When he arrived, he paid the driver and went into his building. Then he put his hand in his pocket… and his phone wasn't there!

He felt terrible. All his photos, his messages and his work were on that phone. He used his neighbor's computer to call his own number, but nobody answered.

The next morning, he called the taxi company. The woman on the phone was very kind. "What color is your phone?" she asked. "It's black, with a red case," Daniel said. "And there is a photo of a dog on the back." She checked and said, "Good news! A driver found it last night."

Daniel went to the office and got his phone back. Now he always checks his pockets before he gets out of a taxi.`,
  preguntas:[q('Why did Daniel take a taxi? Because he was tired and ___',['hungry'],'so = así que; because = porque.'),
   q('Where was the phone?',['in the taxi','in a taxi','the taxi'],'Lee hasta el final.'),
   q('Whose computer did he use?',["his neighbor's",'his neighbors','his neighbor\'s computer','the neighbor\'s'],'neighbor\'s = del vecino.'),
   q('What color is the phone case?',['red'],'case = funda.',{black:'El teléfono es negro; la funda es roja.'}),
   q('What does Daniel do now before he gets out of a taxi?',['he checks his pockets','checks his pockets','He always checks his pockets'],'Hábito: presente simple (he checks).')]}
];

const escuchas=[
 {id:'a2-e-hotel',titulo:'Booking a hotel room',tipoTexto:'Llamada a un hotel',texto:`Good morning, Hotel Mirador. — Hi, I'd like to book a double room for next weekend, from Friday to Sunday. — Let me check. Yes, we have a room with a sea view. It's ninety dollars a night, breakfast included. — Great. Is there parking? — Yes, it's free for guests. — Perfect. My name is Andrea Cruz. — Thank you, Ms. Cruz. Check-in is at three p.m.`,
  preguntas:[q('What kind of room does she book?',['a double room','double','double room'],'double room = habitación doble.'),
   q('How much is it a night?',['$90','90 dollars','ninety dollars','90'],'ninety = 90 (nineteen = 19).',{'19':'Dijo ninety (90).'}),
   q('Is breakfast included? (yes/no)',['yes',"Yes, it is"],'breakfast included = desayuno incluido.'),
   q('What time is check-in?',['3 p.m.','at three','three p.m.','at 3','3'],'check-in = registro de entrada.')]},
 {id:'a2-e-doctor',titulo:'At the doctor\'s',tipoTexto:'Consulta médica',texto:`So, what's the problem? — I've had a terrible headache for three days, and I feel very tired. — Do you have a fever? — Yes, a little. Thirty-eight degrees last night. — I see. Are you sleeping well? — Not really, I'm working a lot this month. — OK. You should rest for two days and drink a lot of water. Take this medicine three times a day. If you don't feel better on Friday, come back.`,
  preguntas:[q('How long has he had the headache? For three ___',['days'],'for + tiempo = desde hace.'),
   q('What was his temperature last night?',['38','thirty-eight','38 degrees'],'degrees = grados.'),
   q('How many days should he rest?',['two','2','two days'],'should = consejo.'),
   q('When should he come back if he doesn\'t feel better?',['on Friday','Friday'],'If… = si….')]},
 {id:'a2-e-aviso',titulo:'Train announcement',tipoTexto:'Anuncio en la estación',texto:`Attention, please. The 4:45 train to Valencia is going to leave from platform 7, not platform 3. We are sorry, but this train is running twenty minutes late. The new departure time is 5:05. Passengers for Madrid, please change trains in Zaragoza. Food and drinks are available in car number 4. Thank you for traveling with us.`,
  preguntas:[q('Which platform does the Valencia train leave from now?',['7','platform 7','seven'],'not platform 3 = ya no es el andén 3.',{'3':'Cambió: ahora sale del andén 7.'}),
   q('How late is the train? (minutes)',['20','twenty','twenty minutes'],'running late = retrasado.'),
   q('Where do passengers for Madrid change trains?',['in Zaragoza','Zaragoza'],'change trains = cambiar de tren.'),
   q('Where can you buy food? In car number ___',['4','four'],'car = vagón.')]},
 {id:'a2-e-entrevista',titulo:'A short job interview',tipoTexto:'Entrevista',texto:`Tell me about your experience. — I worked as a receptionist in a hotel for two years. Then I moved to a call center, where I helped customers with their internet problems. — Why do you want this job? — I like working with people, and I want to use my English more. — What are your strengths? — I'm patient and organized. — Great. Can you start next month? — Yes, I can start on the first.`,
  preguntas:[q('What was her first job?',['receptionist','a receptionist','receptionist in a hotel'],'worked as = trabajó como.'),
   q('How long did she work there? For two ___',['years'],'for two years = durante dos años.'),
   q('What did she do in the call center?',['she helped customers','helped customers with internet problems','helped customers'],'helped = ayudó.'),
   q('Name one of her strengths.',['patient','organized','she is patient','organised'],'strengths = fortalezas.')]},
 {id:'a2-e-clima',titulo:'Weekend plans and the weather',tipoTexto:'Conversación entre amigos',texto:`Are we still going to the beach on Saturday? — I don't know. I checked the weather and it's going to rain all morning. — Oh no. What about Sunday? — Sunday is going to be sunny and hot, about thirty-two degrees. — Then let's go on Sunday. I'll bring the sandwiches. — OK, and I'll drive. I'll pick you up at eight.`,
  preguntas:[q('What is the weather going to be like on Saturday morning?',['rainy','it\'s going to rain','rain','it is going to rain'],'be going to = predicción con evidencia.'),
   q('What day are they going to the beach now?',['Sunday','on Sunday'],'let\'s go on Sunday.'),
   q('How hot is it going to be on Sunday? (degrees)',['32','thirty-two','about 32','32 degrees'],'about = aproximadamente; thirty-two = 32.'),
   q('What time will he pick up his friend?',['at eight','8','at 8','eight'],'pick up = pasar por alguien.')]},
 {id:'a2-e-indicaciones',titulo:'Directions to the conference',tipoTexto:'Mensaje de voz',texto:`Hi, it's Laura from the conference team. The conference is in the Blue Tower, not in the main building. From the subway station, walk along Park Avenue past the cinema. At the second traffic lights, turn right. The Blue Tower is the tall glass building opposite the hospital. Go to the reception on the ground floor and show your ticket. See you there!`,
  preguntas:[q('Where is the conference?',['in the Blue Tower','the Blue Tower','Blue Tower'],'not in the main building = no en el edificio principal.'),
   q('What do you walk past on Park Avenue?',['the cinema','a cinema','cinema'],'past = pasando por.'),
   q('Where do you turn right? At the ___ traffic lights.',['second','2nd'],'Ordinales: first, second, third.'),
   q('What is opposite the Blue Tower?',['the hospital','a hospital','hospital'],'opposite = enfrente de.')]}
];

const vocabulario=[
 {tema:'Viajes y vacaciones',icono:'✈️',palabras:`trip | viaje | We had a great trip to Peru.
journey | viaje, trayecto | The journey took six hours.
vacation | vacaciones | We are on vacation next week.
holiday | día festivo, vacaciones | Monday is a holiday.
passport | pasaporte | Don't forget your passport.
luggage | equipaje | My luggage is too heavy.
suitcase | maleta | I packed my suitcase last night.
backpack | mochila | I travel with a backpack.
flight | vuelo | Our flight was delayed.
boarding pass | pase de abordar | Show your boarding pass at the gate.
gate | puerta (de embarque) | Go to gate 12.
departure | salida | The departure time is 9:40.
arrival | llegada | What's the arrival time?
delayed | retrasado | The train is delayed.
canceled | cancelado | Our flight was canceled.
to book | reservar | I booked a hotel online.
reservation | reservación | I have a reservation for two nights.
single room | habitación sencilla | A single room, please.
double room | habitación doble | We need a double room.
check-in | registro de entrada | Check-in is at 3 p.m.
check-out | salida del hotel | Check-out is at noon.
guest | huésped, invitado | Breakfast is free for guests.
tour | recorrido | We took a tour of the old town.
guide | guía | Our guide spoke three languages.
tourist | turista | The city is full of tourists.
sightseeing | turismo, visitar lugares | We went sightseeing all day.
souvenir | recuerdo | I bought a souvenir for my mom.
abroad | en el extranjero | I want to study abroad.
foreign | extranjero | She speaks two foreign languages.
currency | moneda | What's the currency in Peru?
to exchange money | cambiar dinero | Where can I exchange money?
to pack | empacar | I always pack the night before.
to unpack | desempacar | We unpacked and went to dinner.
to miss (a flight) | perder (un vuelo) | Hurry, or we'll miss the flight!
to get on | subirse a | Get on the bus here.
to get off | bajarse de | Get off at the next stop.
round trip | viaje redondo | A round trip ticket, please.
one way | sencillo (solo ida) | Just a one way ticket.
crowded | lleno de gente | The beach was very crowded.
amazing | increíble | The view was amazing.`},
 {tema:'Salud y cuerpo',icono:'🩺',palabras:`health | salud | Exercise is good for your health.
healthy | sano, saludable | I try to eat healthy food.
head | cabeza | My head hurts.
neck | cuello | I have a pain in my neck.
shoulder | hombro | My shoulder hurts.
arm | brazo | I broke my arm last year.
hand | mano | Wash your hands.
finger | dedo (de la mano) | I cut my finger.
leg | pierna | My legs are tired.
knee | rodilla | I hurt my knee playing soccer.
foot / feet | pie / pies | My feet hurt.
back | espalda | I have a bad back.
stomach | estómago | My stomach hurts.
throat | garganta | I have a sore throat.
tooth / teeth | diente / dientes | Brush your teeth twice a day.
heart | corazón | Running is good for your heart.
to hurt | doler, lastimar | My back hurts.
pain | dolor | I have a pain in my chest.
sore throat | dolor de garganta | Drink tea for a sore throat.
stomachache | dolor de estómago | I have a stomachache.
toothache | dolor de muelas | I have a toothache.
the flu | la gripe | I had the flu last week.
cough | tos | I have a bad cough.
to sneeze | estornudar | I can't stop sneezing.
allergy | alergia | I have an allergy to cats.
medicine | medicina | Take this medicine twice a day.
pill | pastilla | Take one pill after meals.
prescription | receta médica | You need a prescription for this.
appointment | cita | I have a doctor's appointment at 4.
patient | paciente | The patient is in room 5.
dentist | dentista | I go to the dentist twice a year.
to feel | sentirse | I feel much better today.
better | mejor | Get better soon!
worse | peor | My cough is worse today.
to rest | descansar | You should rest for two days.
to recover | recuperarse | She recovered quickly.
injury | lesión | It's a small injury.
to break (a bone) | romperse (un hueso) | He broke his leg skiing.
emergency | emergencia | Call 911 in an emergency.
ambulance | ambulancia | The ambulance arrived quickly.`},
 {tema:'Trabajo y oficina',icono:'🏢',palabras:`career | carrera profesional | She has a great career.
experience | experiencia | I have five years of experience.
skill | habilidad | Communication is an important skill.
salary | sueldo | The salary is good.
full-time | de tiempo completo | It's a full-time job.
part-time | de medio tiempo | I work part-time.
to apply for | solicitar (un empleo) | I applied for a job.
application | solicitud | Fill in the application form.
interview | entrevista | My interview is tomorrow.
CV / résumé | currículum | Send your CV by email.
employee | empleado | The company has 50 employees.
employer | empleador | My employer pays well.
customer | cliente | The customer is always right.
client | cliente (de servicios) | I have a meeting with a client.
colleague | colega | My colleagues are very helpful.
team | equipo | Our team is small.
department | departamento | She works in the sales department.
project | proyecto | The project ends in May.
deadline | fecha límite | The deadline is Friday.
report | informe | I'm writing a report.
task | tarea | I have three tasks today.
schedule | horario, agenda | My schedule is very full.
shift | turno | I work the night shift.
overtime | horas extra | I worked overtime yesterday.
to hire | contratar | They hired two new developers.
to fire | despedir | They fired him last month.
to quit | renunciar | She quit her job.
to retire | jubilarse | My father retired last year.
promotion | ascenso | I got a promotion!
training | capacitación | We have training on Monday.
to earn | ganar (dinero) | How much do you earn?
to manage | dirigir, administrar | She manages a team of ten.
to organize | organizar | I organized the meeting.
to print | imprimir | Can you print this?
to attach | adjuntar | I attached the file.
remote work | trabajo a distancia | I like remote work.
headphones | audífonos | I use headphones for calls.
to log in | iniciar sesión | I can't log in to my account.
password | contraseña | Change your password.
to solve | resolver | We solved the problem.`},
 {tema:'Clima y naturaleza',icono:'🌦️',palabras:`forecast | pronóstico | The forecast says rain.
temperature | temperatura | The temperature is 30 degrees.
degree | grado | It's 15 degrees today.
storm | tormenta | There was a big storm last night.
thunder | trueno | I heard thunder.
lightning | relámpago | The lightning was scary.
fog | niebla | There's a lot of fog this morning.
foggy | con niebla | It's foggy on the highway.
ice | hielo | Be careful, there's ice on the road.
freezing | helado, congelante | It's freezing outside!
humid | húmedo | Veracruz is very humid.
dry | seco | The air is very dry.
wet | mojado | My shoes are wet.
to rain | llover | It rained all day.
to snow | nevar | It snowed in the mountains.
season | estación (del año) | My favorite season is spring.
sky | cielo | The sky is blue.
cloud | nube | There are no clouds today.
sun | sol | The sun is very strong.
moon | luna | Look at the moon!
star | estrella | You can see the stars here.
nature | naturaleza | I love nature.
forest | bosque | We walked in the forest.
river | río | We swam in the river.
lake | lago | There's a lake near the town.
sea | mar | The sea was very calm.
ocean | océano | The Pacific Ocean is huge.
island | isla | We stayed on a small island.
desert | desierto | The desert is hot during the day.
hill | colina | The house is on a hill.
countryside | campo | I grew up in the countryside.
field | campo (de cultivo) | There are cows in the field.
animal | animal | What's your favorite animal?
bird | pájaro | Birds sing in the morning.
tree | árbol | There's a big tree in the garden.
flower | flor | These flowers smell nice.
plant | planta | Water the plants, please.
environment | medio ambiente | We need to protect the environment.
pollution | contaminación | Pollution is a big problem in cities.
to recycle | reciclar | We recycle paper and plastic.`},
 {tema:'Verbos irregulares en pasado',icono:'⏪',palabras:`went (go) | fue (ir) | I went to the beach last summer.
saw (see) | vio (ver) | I saw a great movie.
ate (eat) | comió (comer) | We ate tacos last night.
drank (drink) | bebió (beber) | She drank all the coffee.
bought (buy) | compró (comprar) | I bought a new phone.
brought (bring) | trajo (traer) | He brought flowers.
came (come) | vino (venir) | They came to my party.
did (do) | hizo (hacer) | I did my homework.
made (make) | hizo (fabricar, preparar) | My mom made a cake.
had (have) | tuvo (tener) | We had a great time.
got (get) | consiguió, recibió | I got an email from my boss.
gave (give) | dio (dar) | She gave me a present.
took (take) | tomó (tomar) | I took a lot of photos.
found (find) | encontró (encontrar) | I found my keys.
lost (lose) | perdió (perder) | I lost my wallet.
left (leave) | salió, dejó (irse, dejar) | He left at six.
met (meet) | conoció (conocer a alguien) | I met my wife at work.
thought (think) | pensó (pensar) | I thought it was easy.
knew (know) | supo, sabía (saber) | I knew the answer.
told (tell) | dijo, contó (decir, contar) | She told me a secret.
said (say) | dijo (decir) | He said hello.
spoke (speak) | habló (hablar) | I spoke to the manager.
wrote (write) | escribió (escribir) | I wrote a long email.
read (read) | leyó (leer) | I read the whole book.
ran (run) | corrió (correr) | I ran 5 kilometers.
swam (swim) | nadó (nadar) | We swam in the lake.
slept (sleep) | durmió (dormir) | I slept ten hours.
woke up (wake up) | se despertó (despertarse) | I woke up late.
sat (sit) | se sentó (sentarse) | We sat by the window.
stood (stand) | estuvo de pie (pararse) | We stood in line for an hour.
paid (pay) | pagó (pagar) | I paid by card.
sold (sell) | vendió (vender) | They sold their house.
sent (send) | envió (enviar) | I sent the report.
spent (spend) | gastó, pasó (tiempo) | I spent a week in Lima.
felt (feel) | sintió (sentir) | I felt sick yesterday.
forgot (forget) | olvidó (olvidar) | I forgot your birthday!
began (begin) | comenzó (comenzar) | The movie began at 8.
became (become) | se volvió, se convirtió | She became a doctor.
broke (break) | rompió (romper) | I broke a glass.
drove (drive) | manejó (manejar) | We drove to the coast.`},
 {tema:'Sentimientos y personalidad',icono:'🙂',palabras:`feeling | sentimiento | I have a good feeling about this.
excited | emocionado | I'm excited about the trip.
bored | aburrido (sentirse) | I'm bored. Let's go out.
boring | aburrido (que aburre) | The movie was boring.
interested | interesado | I'm interested in history.
interesting | interesante | That's an interesting idea.
worried | preocupado | I'm worried about the exam.
nervous | nervioso | I was nervous before the interview.
angry | enojado | Why are you angry?
upset | molesto, afectado | She was upset about the news.
surprised | sorprendido | I was surprised to see him.
scared | asustado | The kids were scared of the dog.
proud | orgulloso | I'm proud of you.
relaxed | relajado | I feel relaxed after yoga.
stressed | estresado | I'm stressed at work.
lonely | solo (sentirse) | She feels lonely in the new city.
embarrassed | avergonzado | I was so embarrassed!
confident | seguro de sí mismo | She is very confident.
kind | amable | Thank you, that's very kind.
polite | educado, cortés | He is always polite.
rude | grosero | Don't be rude.
honest | honesto | I want an honest answer.
lazy | flojo | I'm lazy on Sundays.
hard-working | trabajador | Our team is very hard-working.
careful | cuidadoso | Be careful with my laptop.
generous | generoso | My grandmother is very generous.
selfish | egoísta | Don't be selfish. Share!
smart | listo, inteligente | She's very smart.
creative | creativo | He's a creative designer.
calm | tranquilo | Stay calm.
outgoing | extrovertido | My sister is very outgoing.
serious | serio | Why are you so serious?
cheerful | alegre | She's always cheerful.
reliable | confiable | He's a reliable worker.
to worry | preocuparse | Don't worry about it.
to enjoy | disfrutar | I enjoyed the party.
to hate | odiar | I hate waiting.
to prefer | preferir | I prefer tea to coffee.
mood | estado de ánimo | I'm in a good mood today.
to miss (someone) | extrañar | I miss my family.`},
 {tema:'Tecnología y comunicación',icono:'📱',palabras:`smartphone | teléfono inteligente | My smartphone is new.
screen | pantalla | The screen is broken.
battery | batería | My battery is low.
charger | cargador | Can I borrow your charger?
to charge | cargar | I need to charge my phone.
app | aplicación | Download the app.
to download | descargar | I downloaded a new game.
to upload | subir (archivos) | I uploaded the photos.
website | sitio web | Check our website.
internet connection | conexión a internet | The internet connection is slow.
online | en línea | I buy clothes online.
offline | sin conexión | The app works offline.
account | cuenta | Create an account.
username | nombre de usuario | Enter your username.
to text | mandar mensaje | Text me when you arrive.
message | mensaje | I sent you a message.
video call | videollamada | We have a video call at 10.
to call back | devolver la llamada | I'll call you back later.
to hang up | colgar | Don't hang up!
voice message | mensaje de voz | I left you a voice message.
to share | compartir | Share the file with the team.
to search | buscar | Search for it on the internet.
to click | hacer clic | Click on the link.
link | enlace | Send me the link.
file | archivo | Save the file.
to save | guardar | Don't forget to save your work.
to delete | borrar | I deleted the photo.
to install | instalar | Install the update.
update | actualización | There's a new update.
keyboard | teclado | My keyboard is wireless.
mouse | ratón | The mouse isn't working.
printer | impresora | The printer is out of paper.
camera | cámara | The camera is great on this phone.
social media | redes sociales | I don't use social media much.
to post | publicar | She posted a photo.
to follow | seguir | Follow us on Instagram.
notification | notificación | Turn off the notifications.
to turn on | encender | Turn on the computer.
to turn off | apagar | Turn off the lights.
wireless | inalámbrico | I have wireless headphones.`},
 {tema:'En casa: tareas y objetos',icono:'🧹',palabras:`housework | quehaceres | I hate housework.
chores | tareas de la casa | The kids help with the chores.
to do the dishes | lavar los trastes | It's your turn to do the dishes.
to do the laundry | lavar la ropa | I do the laundry on Saturday.
to iron | planchar | I don't iron my shirts.
to vacuum | aspirar | I vacuum the living room every week.
to sweep | barrer | Sweep the kitchen floor, please.
to make the bed | tender la cama | Make your bed every morning.
to take out the trash | sacar la basura | Can you take out the trash?
to water the plants | regar las plantas | Water the plants on Monday.
to feed (the dog) | dar de comer | Did you feed the dog?
to tidy up | ordenar | Tidy up your room!
washing machine | lavadora | The washing machine is broken.
dishwasher | lavaplatos | We don't have a dishwasher.
microwave | microondas | Heat it in the microwave.
oven | horno | The cake is in the oven.
pan | sartén | Use a big pan.
pot | olla | Put water in the pot.
plate | plato | Put the plates on the table.
glass | vaso | Can I have a glass of water?
cup | taza | A cup of tea, please.
fork | tenedor | I need a fork.
knife | cuchillo | Be careful with the knife.
spoon | cuchara | Soup with a spoon.
towel | toalla | There are clean towels in the bathroom.
pillow | almohada | I need a new pillow.
blanket | cobija | It's cold. Take a blanket.
curtains | cortinas | Open the curtains.
carpet | alfombra | The cat sleeps on the carpet.
light | luz | Turn on the light.
heating | calefacción | The heating doesn't work.
air conditioning | aire acondicionado | Turn on the air conditioning.
roof | techo | There's a cat on the roof.
balcony | balcón | We have breakfast on the balcony.
elevator | elevador | The elevator is out of order.
upstairs | arriba | The bedrooms are upstairs.
downstairs | abajo | The kitchen is downstairs.
messy | desordenado | My room is messy.
tidy | ordenado | Her desk is always tidy.
to borrow | pedir prestado | Can I borrow your pen?`},
 {tema:'Tiempo libre y eventos',icono:'🎟️',palabras:`free time | tiempo libre | What do you do in your free time?
party | fiesta | We had a party on Saturday.
wedding | boda | My cousin's wedding is in June.
birthday party | fiesta de cumpleaños | Are you coming to my birthday party?
concert | concierto | We went to a concert last night.
festival | festival | There's a music festival in July.
show | espectáculo, programa | The show starts at 8.
theater | teatro | We saw a play at the theater.
play | obra de teatro | The play was very funny.
exhibition | exposición | There's a new exhibition at the museum.
gallery | galería | We visited an art gallery.
ticket office | taquilla | Buy tickets at the ticket office.
match | partido | Did you watch the match?
score | marcador, resultado | What's the score?
to win | ganar | Our team won 2-1.
to lose | perder | We lost the game.
player | jugador | He's a great player.
fan | aficionado | I'm a big fan of jazz.
gym | gimnasio | I go to the gym after work.
to go hiking | ir de excursión | We went hiking in the mountains.
to go camping | ir de campamento | We went camping last summer.
to go fishing | ir de pesca | My dad loves to go fishing.
to take photos | tomar fotos | I took photos of the sunset.
to paint | pintar | She paints in her free time.
to draw | dibujar | My son likes to draw.
to invite | invitar | I invited all my friends.
invitation | invitación | Thanks for the invitation.
guest list | lista de invitados | Is my name on the guest list?
to celebrate | celebrar | Let's celebrate!
to have fun | divertirse | We had a lot of fun.
to hang out | pasar el rato | We hang out at the mall.
to go out | salir | Do you want to go out tonight?
to stay in | quedarse en casa | I'm tired. Let's stay in.
series | serie | I'm watching a new series.
episode | episodio | I watched three episodes.
comedy | comedia | I love comedies.
horror movie | película de terror | I don't watch horror movies.
actor / actress | actor / actriz | She's my favorite actress.
singer | cantante | The singer has a great voice.
band | banda, grupo musical | What's your favorite band?`},
 {tema:'Comparar, frecuencia y consejos',icono:'⚖️',palabras:`bigger than | más grande que | My city is bigger than yours.
smaller than | más pequeño que | This room is smaller than the other.
more expensive than | más caro que | Taxis are more expensive than buses.
cheaper than | más barato que | The bus is cheaper than the train.
better than | mejor que | This phone is better than mine.
worse than | peor que | The traffic is worse than yesterday.
the best | el mejor | This is the best pizza in town.
the worst | el peor | That was the worst day of my life.
the most popular | el más popular | It's the most popular app.
as … as | tan … como | He is as tall as his father.
the same as | igual que | My phone is the same as yours.
different from | diferente de | Her style is different from mine.
easier | más fácil | The second exam was easier.
harder | más difícil, más duro | This level is harder.
faster | más rápido | The train is faster than the bus.
slower | más lento | My computer is slower than yours.
once a week | una vez por semana | I go swimming once a week.
twice a month | dos veces al mes | We eat out twice a month.
hardly ever | casi nunca | I hardly ever watch TV.
How often…? | ¿con qué frecuencia…? | How often do you exercise?
should | debería | You should see a doctor.
shouldn't | no debería | You shouldn't drink so much coffee.
had better | más vale que | You had better hurry.
advice | consejo(s) | Can I give you some advice?
to recommend | recomendar | I recommend this restaurant.
to suggest | sugerir | I suggest taking a taxi.
Why don't you…? | ¿por qué no…? | Why don't you call her?
How about…? | ¿qué tal si…? | How about a coffee?
some | algo de, algunos | I need some milk.
any | algún, nada de | Do you have any questions?
much | mucho (incontable) | I don't have much time.
many | muchos (contables) | There aren't many people here.
a lot of | mucho, muchos | She has a lot of friends.
a few | unos pocos | I have a few questions.
a little | un poco | I speak a little French.
How much…? | ¿cuánto…? | How much water do you drink?
How many…? | ¿cuántos…? | How many brothers do you have?
too | demasiado | This coffee is too hot.
enough | suficiente | We don't have enough chairs.
already | ya | I already finished.`}
];

const escritura=[
 {id:'a2-w-postal',tipo:'mensaje',titulo:'Cuéntale tu viaje a un amigo',consigna:'Estás de vacaciones. Escribe un mensaje a tu amigo Alex: dónde estás, qué hiciste ayer (en pasado), qué te gustó y qué vas a hacer mañana (going to).',min:50,max:100,
  criterios:[SALUDO,crit('Usas el pasado simple (went, visited, ate, saw…)','\\b(went|visited|ate|saw|took|had|bought|was|were|swam|walked|tried|stayed)\\b','Cuenta lo de ayer en pasado: Yesterday I went…'),
   crit('Usas going to para el plan de mañana','\\b(going to|gonna)\\b','Para el plan: Tomorrow I\'m going to….'),crit('Dices qué te gustó (I loved / I liked / It was amazing)','\\b(i loved|i liked|i enjoyed|was (amazing|great|beautiful|delicious|fantastic|incredible))\\b','Opina: I loved…, It was amazing.'),
   crit('Usas un conector (and, but, then, because, so)','\\b(but|then|because|so|after that)\\b','Une ideas con but, then, because, so.'),CIERRE],
  modelo:`Hi Alex!
I'm in Cancún with my family. Yesterday we went to the beach and swam in the sea. Then we ate fish tacos in a small restaurant. I loved the food, but it was very hot! Tomorrow we are going to visit Chichén Itzá. I'm so excited.
See you soon,
Pablo`},
 {id:'a2-w-queja',tipo:'correo',titulo:'Correo para reportar un problema',consigna:'Compraste una laptop en línea y llegó con la pantalla rota. Escribe un correo a la tienda: qué compraste y cuándo, cuál es el problema y qué quieres que hagan (cambio o reembolso).',min:60,max:120,
  criterios:[crit('Saludo formal (Dear …)','^\\s*dear\\b','En un correo formal: Dear Sir or Madam, / Dear Customer Service,'),crit('Dices por qué escribes (I am writing about / to…)',"\\b(i am writing|i'm writing)\\b",'Empieza con I am writing about my order….'),
   crit('Usas el pasado para lo que pasó (ordered, bought, arrived…)','\\b(ordered|bought|arrived|received|was|paid)\\b','Cuenta lo que pasó en pasado: I ordered…, it arrived….'),crit('Pides algo con cortesía (could you / I would like)','\\b(could you|would you|i would like|i\'d like|can you please)\\b','Pide con cortesía: Could you…? / I would like….'),
   crit('Cierre formal (Best regards / Sincerely)','\\b(best regards|kind regards|sincerely|regards|yours faithfully)\\b','Cierra con Best regards, y tu nombre.'),crit('Sin contracciones informales (gonna, wanna)','\\b(gonna|wanna|gotta)\\b','En un correo formal evita gonna/wanna.',{no:true})],
  modelo:`Dear Customer Service,
I am writing about my order 77120. I bought a laptop on your website on May 3rd and it arrived yesterday. Unfortunately, the screen was broken and it does not turn on. I paid $650 by credit card. Could you please send me a new laptop? If that is not possible, I would like a refund.
Thank you for your help.
Best regards,
Mónica Salas`},
 {id:'a2-w-comparar',tipo:'opinion',titulo:'¿Ciudad o campo?',consigna:'Escribe un párrafo: ¿prefieres vivir en la ciudad o en el campo? Compara los dos lugares con al menos dos comparativos y da un consejo a alguien que se va a mudar (should).',min:60,max:120,
  criterios:[crit('Dices qué prefieres (I prefer / I think … is better)','\\b(i prefer|i think|in my opinion|i would rather|i like)\\b','Da tu opinión: I prefer…, I think….'),crit('Usas al menos dos comparativos (bigger than, more … than)','(\\w+er than|more \\w+ than|less \\w+ than|better than|worse than)[\\s\\S]*(\\w+er than|more \\w+ than|less \\w+ than|better than|worse than)','Compara dos veces: quieter than, more expensive than….'),
   crit('Das un consejo con should','\\bshould\\b','Aconseja: You should….'),crit('Usas because para explicar','\\bbecause\\b','Explica: because….'),crit('Sin «more + adjetivo corto + er» (more bigger)','\\bmore \\w+er than\\b','Con adjetivos cortos solo -er: bigger than (no more bigger).',{no:true})],
  modelo:`I prefer to live in the city because there are more jobs and more things to do. The countryside is quieter than the city and the air is cleaner, but life there is slower and you need a car for everything. Of course, cities are more expensive than small towns. If you are moving to a big city, you should find an apartment near your work, because the traffic can be terrible.`}
];

export default {nivel:'A2',completo:true,lecturas,escuchas,vocabulario,escritura};
