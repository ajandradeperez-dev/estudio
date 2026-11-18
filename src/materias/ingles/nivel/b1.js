/* Inglés B1: práctica del nivel (ver datos.js). Temas: estudios y trabajo, tecnología, medio ambiente, opiniones,
   entrevistas y correos formales. Gramática: presente perfecto vs. pasado, pasado continuo, condicionales 0/1/2, pasiva,
   modales (must / have to / might), relativas, gerundio vs. infinitivo y phrasal verbs frecuentes. */
import {q,crit,SALUDO} from './base.js';

const lecturas=[
 {id:'b1-l-remoto',titulo:'Is working from home here to stay?',tipoTexto:'Artículo de opinión',texto:`Five years ago, very few people worked from home. Today, millions of office workers spend at least two days a week at home, and many companies have closed part of their offices.

Supporters of remote work say that it saves time and money. Workers don't have to commute, so they have more time for their families, and companies spend less on rent. Some studies have also shown that people who work from home are more productive, because there are fewer interruptions.

However, not everyone is happy. Many young employees say they feel lonely and that it is harder to learn from experienced colleagues. Managers often worry that teams lose their creativity when people never meet face to face.

For this reason, most companies have chosen a "hybrid" model: three days in the office and two at home. If this model works, it might become the new normal for office jobs.`,
  preguntas:[q('According to the article, what do workers save when they don\'t commute? (one thing)',['time','money','time and money'],'commute = trasladarse al trabajo.'),
   q('Why might people who work from home be more productive? Because there are fewer ___',['interruptions'],'fewer = menos (contables).'),
   q('Who often feels lonely?',['young employees','many young employees','young workers'],'Busca lonely en el texto.'),
   q('What do managers worry about? That teams lose their ___',['creativity'],'worry that… = preocuparse de que….'),
   q('How many days at home does the hybrid model usually have?',['two','2','two days'],'three days in the office and two at home.')]},
 {id:'b1-l-plastico',titulo:'The town that said no to plastic',tipoTexto:'Reportaje',texto:`In 2019, the small fishing town of Puerto Claro decided to ban single-use plastic. Shops stopped giving plastic bags, and restaurants replaced plastic straws and cups with paper and glass.

At first, many people complained. "I had been using plastic bags for thirty years," says Rosa, who sells vegetables in the market. "Customers forgot their own bags and were angry." But after a few months, things changed. Shoppers started bringing cloth bags, and the market began selling cheap ones made by local women.

The results have been impressive. The beach, which used to be covered with plastic after every weekend, is now much cleaner, and tourists have noticed. Fishermen say they are catching fewer plastic bottles in their nets.

The town has received visits from mayors of other coastal towns who want to copy the idea. "If a small town like ours can do it," Rosa says, "big cities can do it too."`,
  preguntas:[q('In what year did the town ban single-use plastic?',['2019','in 2019'],'ban = prohibir.'),
   q('What did restaurants use instead of plastic straws and cups? (one material)',['paper','glass','paper and glass'],'replaced X with Y = reemplazaron X por Y.'),
   q('How long had Rosa been using plastic bags?',['thirty years','30 years','for thirty years','30'],'had been using = había estado usando.'),
   q('Who made the cheap cloth bags?',['local women','women from the town','local women.'],'made by = hechas por (pasiva).'),
   q('What do fishermen catch less of now?',['plastic bottles','fewer plastic bottles','bottles'],'catch = atrapar.')]},
 {id:'b1-l-entrevista',titulo:'How to prepare for a job interview',tipoTexto:'Guía práctica',texto:`A job interview can be stressful, but good preparation makes a big difference. Here are some tips from recruiters.

First, research the company. Look at its website and social media, and try to find out what problems it is trying to solve. Interviewers love candidates who have done their homework.

Second, prepare stories. Instead of saying "I'm a good team player," describe a real situation: what the problem was, what you did and what happened. Recruiters remember examples much better than adjectives.

Third, practice the difficult questions out loud. "What is your biggest weakness?" is not a trap; it's a chance to show that you are aware of your weaknesses and are working on them.

Finally, prepare two or three questions for the interviewer. If you don't ask anything, they might think you are not really interested. And remember to send a short thank-you email the same day.`,
  preguntas:[q('What should you research first?',['the company','the company\'s website','the company and its website'],'research = investigar.'),
   q('What do recruiters remember better than adjectives?',['examples','real examples','stories'],'remember X better than Y.'),
   q('Is "What is your biggest weakness?" a trap, according to the text? (yes/no)',['no',"No, it isn't",'no, it is a chance'],'not a trap = no es una trampa.'),
   q('How many questions should you prepare for the interviewer?',['two or three','2 or 3','two or three questions'],'Busca Finally.'),
   q('When should you send the thank-you email?',['the same day','on the same day','that day'],'the same day = el mismo día.')]},
 {id:'b1-l-resena',titulo:'Review: The Silent Coast',tipoTexto:'Reseña de una serie',texto:`★★★★☆  The Silent Coast (8 episodes)

I started watching The Silent Coast on a Friday night and I finished it on Sunday afternoon. I simply couldn't stop.

The series is set in a small village in the north of Spain, where a young journalist returns after twenty years to investigate the disappearance of a teenager. While she is looking for answers, she discovers that her own family is hiding a secret.

The acting is excellent, especially Lucía Ferrer as the journalist, and the photography of the coast is beautiful. The music, which was written by a local band, creates a dark, mysterious atmosphere.

My only complaint is the ending. The last episode is too rushed, and some questions are never answered. Maybe the writers are planning a second season.

If you enjoy slow mysteries with complex characters, you will love this series. If you prefer action, it might be a bit too slow for you.`,
  preguntas:[q('How many stars did the reviewer give it?',['four','4','4 stars'],'Cuenta las estrellas llenas.'),
   q('Where is the series set?',['in a small village in the north of Spain','in the north of Spain','in a village in Spain','Spain'],'is set in = transcurre en.'),
   q('Who wrote the music?',['a local band','local band'],'which was written by = que fue escrita por (pasiva).'),
   q('What is the reviewer\'s only complaint?',['the ending','the last episode','the ending is too rushed'],'complaint = queja.'),
   q('Who might find it too slow?',['people who prefer action','people who like action','those who prefer action'],'If you prefer action, it might be….')]},
 {id:'b1-l-correo-formal',titulo:'Request for information',tipoTexto:'Correo formal',texto:`Dear Admissions Office,

I am writing to ask for information about your one-year Data Analysis course, which I saw advertised on your website.

I graduated in Economics three years ago and I have been working as an assistant in a bank since then. I use Excel every day, but I have never studied programming, so I would like to know whether the course is suitable for beginners.

I would also be grateful if you could tell me if the classes are online or in person, and how many hours a week students are expected to study. As I work full time, I would need a flexible schedule.

Finally, could you let me know if there are any scholarships or payment plans? I have attached a copy of my CV in case it is useful.

I look forward to hearing from you.

Yours faithfully,
Martín Aguirre`,
  preguntas:[q('What course is Martín interested in?',['Data Analysis','the Data Analysis course','a one-year Data Analysis course'],'Busca course.'),
   q('What did he study at university?',['Economics'],'graduated in = se graduó en.'),
   q('How long has he been working at the bank?',['three years','for three years','3 years','since he graduated'],'have been working since then = presente perfecto continuo.'),
   q('Why does he need a flexible schedule?',['because he works full time','he works full time','he works full-time'],'As I work full time… = como trabajo tiempo completo….'),
   q('What has he attached?',['his CV','a copy of his CV','his CV.'],'attached = adjuntó.')]},
 {id:'b1-l-historia',titulo:'The night the lights went out',tipoTexto:'Relato',texto:`It was a cold evening in January. Ana was cooking dinner, her husband was helping their son with his homework, and the TV was playing in the living room. Suddenly, everything went dark.

At first they thought it was just their apartment, but when Ana looked out of the window, she saw that the whole street was dark. Nobody had heard about any problem, and their phones had little battery.

Instead of complaining, they found some candles, put on warm sweaters and sat together in the kitchen. They finished cooking on the gas stove and ate by candlelight. Then their son suggested playing a board game they hadn't played for years.

The lights came back at midnight. By then, they had laughed more than in many weeks. "We should turn off the lights more often," their son said as he went to bed.

The next day they found out that a storm had damaged a power line outside the city.`,
  preguntas:[q('What was Ana doing when the lights went out?',['cooking dinner','she was cooking dinner','cooking'],'Pasado continuo: was cooking = estaba cocinando.'),
   q('What was her husband doing?',['helping their son with his homework','helping their son','he was helping their son with his homework'],'was helping = estaba ayudando.'),
   q('Where did they sit?',['in the kitchen','the kitchen'],'sat = se sentaron.'),
   q('Who suggested playing a board game?',['their son','the son','her son'],'suggest + -ing: suggested playing.'),
   q('What caused the blackout? A ___ damaged a power line.',['storm'],'had damaged = había dañado (pasado perfecto).')]}
];

const escuchas=[
 {id:'b1-e-podcast',titulo:'A podcast about learning languages',tipoTexto:'Fragmento de pódcast',texto:`Welcome back to Language Talk. Today's guest has learned four languages as an adult. — Thanks for having me. People always ask me about talent, but I don't think talent matters much. What really matters is consistency. I study twenty minutes every single day, even on holidays. — Twenty minutes? That's not much. — No, but if you do it every day, it adds up to more than a hundred hours a year. I also try to use the language for things I enjoy, like cooking videos or football commentary, so it doesn't feel like homework.`,
  preguntas:[q('How many languages has the guest learned?',['four','4'],'has learned = ha aprendido.'),
   q('According to the guest, what really matters?',['consistency','being consistent'],'what really matters = lo que de verdad importa.'),
   q('How long does the guest study every day? (minutes)',['twenty','20','twenty minutes'],'every single day = todos los días sin falta.'),
   q('Name one thing the guest enjoys in the language.',['cooking videos','football commentary','cooking videos or football commentary'],'like… = como….')]},
 {id:'b1-e-reunion',titulo:'A team meeting',tipoTexto:'Reunión de trabajo',texto:`OK, let's start. The client has asked us to finish the new website by the end of the month, which is two weeks earlier than planned. — Two weeks? That's going to be tough. The design hasn't been approved yet. — I know. If they approve it by Wednesday, we might make it. Carlos, can you call them this afternoon? — Sure. And what about the testing? — Elena will be in charge of testing. We'll need to work on Saturday next week, but you'll get an extra day off in June.`,
  preguntas:[q('When does the client want the website?',['by the end of the month','at the end of the month','the end of the month'],'by = a más tardar.'),
   q('What hasn\'t been approved yet?',['the design','design'],'hasn\'t been approved = no ha sido aprobado (pasiva).'),
   q('Who is going to call the client?',['Carlos'],'can you call them…? Sure.'),
   q('What will they get for working on Saturday?',['an extra day off','an extra day off in June','a day off'],'day off = día libre.')]},
 {id:'b1-e-noticia',titulo:'Local news: a new bike lane',tipoTexto:'Noticia de radio',texto:`And in local news, the city council has approved a new bike lane along River Avenue. The project, which will cost two million dollars, is expected to be finished next spring. Supporters say it will reduce traffic and pollution, while some shop owners are worried that they will lose parking spaces. The council has promised to build a new car park behind the central market. Work will begin in September, and some streets will be closed at night.`,
  preguntas:[q('Where will the new bike lane be?',['along River Avenue','on River Avenue','River Avenue'],'along = a lo largo de.'),
   q('How much will it cost?',['two million dollars','$2 million','2 million dollars','two million'],'will cost = costará.'),
   q('Who is worried about losing parking spaces?',['shop owners','some shop owners'],'are worried that… = les preocupa que….'),
   q('When will work begin?',['in September','September'],'begin = comenzar.')]},
 {id:'b1-e-anuncio',titulo:'Museum audio guide',tipoTexto:'Audioguía',texto:`Welcome to room five. The painting in front of you was painted in 1889, while the artist was staying in a small hospital in the south of France. He was going through a difficult time, but he painted more than a hundred works that year. Look closely at the sky: the brushstrokes seem to move, almost like the wind. The painting was sold for a very small amount of money, and today it is considered one of the most valuable in the world. Please do not use flash photography.`,
  preguntas:[q('When was the painting painted?',['in 1889','1889'],'was painted = fue pintado (pasiva).'),
   q('Where was the artist staying?',['in a small hospital in the south of France','in a hospital','in a small hospital','in a hospital in France'],'was staying = se estaba quedando.'),
   q('How many works did he paint that year? More than a ___',['hundred','100'],'more than a hundred = más de cien.'),
   q('What is not allowed?',['flash photography','using flash','flash'],'Please do not… = por favor no….')]},
 {id:'b1-e-servicio',titulo:'Calling technical support',tipoTexto:'Llamada a soporte técnico',texto:`Thank you for calling. How can I help? — My internet has been really slow since yesterday, and it keeps disconnecting. — I'm sorry to hear that. Have you tried turning the router off and on again? — Yes, twice. — OK, I can see there's a problem in your area. Our technicians are working on it and it should be fixed within twenty-four hours. If it isn't, call us back and we'll send someone to your home. I'll also give you a discount on this month's bill.`,
  preguntas:[q('Since when has the internet been slow?',['since yesterday','yesterday'],'has been … since = ha estado … desde.'),
   q('How many times did the customer restart the router?',['twice','two times','2'],'twice = dos veces.'),
   q('Within how many hours should it be fixed?',['24','twenty-four','24 hours','twenty-four hours'],'within = dentro de.'),
   q('What will the customer get on this month\'s bill?',['a discount','discount'],'bill = factura.')]},
 {id:'b1-e-opinion',titulo:'Should homework be banned?',tipoTexto:'Debate en la radio',texto:`Our listeners have been sending messages all morning. Sarah, a teacher, says homework helps students become independent, but only if it's short. Tom, a father of three, thinks children spend too many hours at school already and should have time to play. And Mia, who is sixteen, says she wouldn't mind homework if it were more creative, like projects instead of worksheets. What do you think? Send us your opinion before eleven o'clock.`,
  preguntas:[q('What is Sarah\'s job?',['teacher','a teacher','she is a teacher'],'Sarah, a teacher, = Sarah, que es maestra.'),
   q('According to Sarah, homework is useful only if it is ___',['short'],'only if = solo si.'),
   q('How many children does Tom have?',['three','3'],'a father of three = papá de tres.'),
   q('What kind of homework would Mia prefer?',['projects','creative projects','more creative homework','creative'],'Condicional 2: if it were more creative = si fuera más creativa.')]}
];

const vocabulario=[
 {tema:'Estudios y aprendizaje',icono:'🎓',palabras:`degree | título universitario | She has a degree in law.
course | curso | I'm taking an online course.
subject | materia | Math is my favorite subject.
lecture | clase magistral, conferencia | The lecture starts at 9.
assignment | trabajo, tarea (escolar) | The assignment is due on Monday.
essay | ensayo | I have to write an essay.
grade | calificación | I got a good grade.
to pass (an exam) | aprobar | I passed my driving test.
to fail (an exam) | reprobar | He failed the math exam.
to take an exam | presentar un examen | I'm taking an exam tomorrow.
to graduate | graduarse | She graduated in 2020.
scholarship | beca | He got a scholarship to study abroad.
tuition | colegiatura | Tuition is very expensive.
knowledge | conocimiento | Knowledge is power.
to memorize | memorizar | Don't just memorize the rules.
to revise | repasar (para un examen) | I'm revising for my exams.
to look up | buscar (en un diccionario) | Look up the word online.
to figure out | entender, resolver | I can't figure out this problem.
to keep up with | mantenerse al día con | It's hard to keep up with the class.
to fall behind | atrasarse | I fell behind when I was sick.
skill | habilidad | Writing is an important skill.
fluent | fluido | She is fluent in three languages.
native speaker | hablante nativo | Practice with native speakers.
mistake | error | Everybody makes mistakes.
to make progress | avanzar | You're making great progress.
deadline | fecha límite | The deadline is next Friday.
research | investigación | I'm doing research on climate change.
teacher's notes | apuntes del profesor | The teacher's notes are online.
to take notes | tomar apuntes | Take notes during the lecture.
distance learning | educación a distancia | Distance learning is popular now.
qualification | título, certificación | You need a teaching qualification.
certificate | certificado | You get a certificate at the end.
to enroll | inscribirse | I enrolled in a French course.
to drop out | abandonar los estudios | He dropped out of college.
attendance | asistencia | Attendance is compulsory.
compulsory | obligatorio | English is compulsory at my school.
optional | optativo | Art is an optional subject.
to improve | mejorar | I want to improve my English.
challenge | reto | Learning a language is a challenge.
to be good at | ser bueno para | I'm good at math.`},
 {tema:'Trabajo y carrera',icono:'💼',palabras:`to apply | postularse, solicitar | I applied for three jobs.
candidate | candidato | They interviewed five candidates.
recruiter | reclutador | A recruiter called me yesterday.
job offer | oferta de trabajo | I accepted the job offer.
contract | contrato | Read the contract carefully.
permanent | permanente, de planta | I have a permanent contract.
temporary | temporal | It's a temporary job.
benefits | prestaciones | The benefits include health insurance.
raise | aumento de sueldo | I asked for a raise.
to negotiate | negociar | We negotiated the salary.
responsibilities | responsabilidades | What are your responsibilities?
to be in charge of | estar a cargo de | She is in charge of the sales team.
to deal with | lidiar con, atender | I deal with customer complaints.
to run (a company) | dirigir | He runs a small business.
to set up | montar, fundar | They set up a company in 2018.
entrepreneur | emprendedor | She is a young entrepreneur.
startup | empresa emergente | I work for a tech startup.
freelancer | trabajador independiente | I'm a freelancer.
self-employed | autónomo, por cuenta propia | My father is self-employed.
unemployed | desempleado | He has been unemployed for months.
to resign | renunciar | She resigned last week.
to be laid off | ser despedido (por recorte) | Fifty workers were laid off.
workload | carga de trabajo | My workload is too heavy.
work-life balance | equilibrio vida-trabajo | Work-life balance is important.
to commute | trasladarse al trabajo | I commute by train.
headquarters | sede, oficina central | Our headquarters are in Madrid.
branch | sucursal | The bank has a new branch.
staff | personal | The staff are very friendly.
supervisor | supervisor | Ask your supervisor.
performance | desempeño | My performance review is next week.
feedback | retroalimentación | Thanks for your feedback.
goal | meta | What are your goals for this year?
to achieve | lograr | We achieved our sales goal.
strength | fortaleza | Patience is one of my strengths.
weakness | debilidad | My weakness is public speaking.
reference | referencia | Can you give me a reference?
to take over | hacerse cargo de | She took over the project.
to hand in | entregar | Hand in your report by Friday.
to fill in | llenar (un formulario) | Fill in this form, please.
to carry out | llevar a cabo | We carried out a survey.`},
 {tema:'Tecnología',icono:'💻',palabras:`device | dispositivo | Turn off all your devices.
software | programas | Install the new software.
hardware | equipo físico | The hardware is old.
data | datos | We collect a lot of data.
cloud | la nube | My files are in the cloud.
storage | almacenamiento | I need more storage.
to back up | respaldar | Back up your files every week.
backup | respaldo | Do you have a backup?
to crash | colgarse, fallar | My computer crashed.
bug | error (de programa) | There's a bug in the app.
to fix | arreglar | They fixed the bug.
to update | actualizar | Update your browser.
browser | navegador | Which browser do you use?
search engine | buscador | Google is a search engine.
artificial intelligence | inteligencia artificial | Artificial intelligence is everywhere.
algorithm | algoritmo | The algorithm chooses the videos.
privacy | privacidad | Check your privacy settings.
security | seguridad | Security is our priority.
hacker | hacker, pirata informático | Hackers stole the data.
virus | virus | Your computer has a virus.
to hack | hackear | Someone hacked my account.
scam | estafa | That email is a scam.
spam | correo basura | My inbox is full of spam.
to block | bloquear | Block that number.
settings | configuración | Go to settings.
to connect | conectar | Connect to the Wi-Fi.
to disconnect | desconectar | It keeps disconnecting.
network | red | The network is down.
to stream | transmitir en línea | I stream music on my phone.
subscription | suscripción | I canceled my subscription.
user-friendly | fácil de usar | The app is very user-friendly.
screen time | tiempo frente a la pantalla | I want to reduce my screen time.
to scroll | desplazarse (en la pantalla) | I scroll on my phone before bed.
gadget | aparato | He loves new gadgets.
to go viral | hacerse viral | The video went viral.
influencer | influencer | She's a famous influencer.
to unplug | desconectar(se) | I unplug on weekends.
to plug in | enchufar | Plug in the charger.
out of date | desactualizado | This phone is out of date.
cutting-edge | de vanguardia | They use cutting-edge technology.`},
 {tema:'Medio ambiente',icono:'🌍',palabras:`climate change | cambio climático | Climate change affects everyone.
global warming | calentamiento global | Global warming is real.
greenhouse gases | gases de efecto invernadero | Cars produce greenhouse gases.
carbon footprint | huella de carbono | Reduce your carbon footprint.
emissions | emisiones | We need to cut emissions.
renewable energy | energía renovable | Solar power is a renewable energy.
solar panel | panel solar | We installed solar panels.
wind farm | parque eólico | There's a wind farm near the coast.
fossil fuels | combustibles fósiles | Oil is a fossil fuel.
to waste | desperdiciar | Don't waste water.
waste | desechos, desperdicio | Food waste is a big problem.
rubbish / garbage | basura | Put the garbage in the bin.
landfill | relleno sanitario | Most plastic ends up in landfills.
recycling bin | bote de reciclaje | Use the recycling bin.
single-use plastic | plástico de un solo uso | Avoid single-use plastic.
to reuse | reutilizar | Reuse your shopping bags.
to reduce | reducir | Reduce, reuse, recycle.
to save energy | ahorrar energía | Turn off the lights to save energy.
drought | sequía | The drought lasted two years.
flood | inundación | The flood destroyed many houses.
heatwave | ola de calor | There's a heatwave this week.
wildfire | incendio forestal | Wildfires are more common now.
endangered species | especie en peligro | Pandas are an endangered species.
extinct | extinto | Dinosaurs are extinct.
habitat | hábitat | Animals are losing their habitat.
deforestation | deforestación | Deforestation is a serious problem.
to protect | proteger | We must protect the oceans.
to pollute | contaminar | Factories pollute the river.
air quality | calidad del aire | The air quality is bad today.
sustainable | sostenible | We need sustainable transport.
eco-friendly | ecológico | This bag is eco-friendly.
organic | orgánico | I buy organic vegetables.
public transport | transporte público | Use public transport.
to cut down (trees) | talar | They cut down the forest.
to run out of | quedarse sin | We are running out of water.
resource | recurso | Water is a precious resource.
consumption | consumo | Energy consumption is rising.
to take action | tomar medidas | Governments must take action.
awareness | conciencia | We need more awareness.
volunteer | voluntario | I'm a volunteer at a beach clean-up.`},
 {tema:'Opiniones y debate',icono:'💬',palabras:`in my opinion | en mi opinión | In my opinion, it's a good idea.
I believe | creo | I believe education is the key.
as far as I know | hasta donde sé | As far as I know, it's free.
to agree | estar de acuerdo | I agree with you.
to disagree | no estar de acuerdo | I disagree completely.
I see your point | entiendo tu punto | I see your point, but…
on the one hand | por un lado | On the one hand, it's cheap.
on the other hand | por otro lado | On the other hand, it's slow.
however | sin embargo | It's cheap. However, it's slow.
although | aunque | Although it rained, we went out.
despite | a pesar de | Despite the rain, we went out.
whereas | mientras que | I like tea, whereas she likes coffee.
therefore | por lo tanto | It's late; therefore, we should go.
as a result | como resultado | As a result, prices went up.
for example | por ejemplo | For example, buses are cheaper.
such as | como (por ejemplo) | Fruits such as apples are healthy.
in addition | además | In addition, it saves time.
moreover | además, es más | Moreover, it's free.
firstly | en primer lugar | Firstly, let me explain.
finally | por último | Finally, I'd like to thank you.
to sum up | en resumen | To sum up, it was a success.
advantage | ventaja | The main advantage is the price.
disadvantage | desventaja | One disadvantage is the noise.
pros and cons | pros y contras | Let's discuss the pros and cons.
point of view | punto de vista | From my point of view, it's fair.
to argue | argumentar, discutir | He argued that it was too expensive.
argument | argumento, discusión | That's a good argument.
to convince | convencer | You convinced me.
to point out | señalar | She pointed out a mistake.
to support | apoyar | I support the idea.
to be against | estar en contra | I'm against the new law.
to be in favor of | estar a favor de | I'm in favor of remote work.
it depends | depende | It depends on the price.
fair | justo | That's not fair!
unfair | injusto | The decision was unfair.
reasonable | razonable | The price is reasonable.
obviously | obviamente | Obviously, we need more time.
probably | probablemente | It will probably rain.
definitely | definitivamente | I'll definitely come.
to be honest | para ser honesto | To be honest, I didn't like it.`},
 {tema:'Phrasal verbs frecuentes',icono:'🔗',palabras:`to find out | averiguar, enterarse | I found out the truth.
to give up | rendirse, dejar | Don't give up!
to look for | buscar | I'm looking for my keys.
to look after | cuidar | She looks after her grandmother.
to look forward to | esperar con ganas | I look forward to hearing from you.
to get on with | llevarse bien con | I get on well with my boss.
to get over | superar | She got over the flu quickly.
to put off | posponer | Don't put off your homework.
to call off | cancelar | They called off the meeting.
to turn down | rechazar | He turned down the offer.
to show up | presentarse, llegar | He showed up late.
to come up with | ocurrírsele (una idea) | She came up with a great idea.
to run into | encontrarse con | I ran into an old friend.
to bring up | sacar (un tema) | Don't bring up politics.
to work out | hacer ejercicio, resolver | I work out three times a week.
to set off | salir (de viaje) | We set off at 6 a.m.
to pick up | recoger | I'll pick you up at 8.
to drop off | dejar (a alguien) | Drop me off at the station.
to go on | continuar | Please go on.
to carry on | seguir | Carry on with your work.
to break down | descomponerse | My car broke down.
to sort out | arreglar, resolver | We sorted out the problem.
to make up | inventar, reconciliarse | He made up an excuse.
to cut down on | reducir (consumo) | I'm cutting down on sugar.
to take up | empezar (un hobby) | I took up yoga last year.
to grow up | crecer | I grew up in Puebla.
to calm down | calmarse | Calm down, please.
to turn up | subir (volumen), aparecer | Turn up the music.
to put on | ponerse (ropa) | Put on your jacket.
to take off | quitarse, despegar | The plane took off late.
to fill up | llenar | Fill up the tank.
to check in | registrarse | We checked in at the hotel.
to hold on | esperar (al teléfono) | Hold on a second.
to get back | regresar | When did you get back?
to look into | investigar | We'll look into the problem.
to point at | señalar con el dedo | Don't point at people.
to throw away | tirar a la basura | Don't throw it away.
to try on | probarse | Try on these shoes.
to wake (someone) up | despertar (a alguien) | Wake me up at 7.
to end up | terminar (haciendo) | We ended up staying home.`},
 {tema:'Correos y comunicación formal',icono:'📧',palabras:`Dear Sir or Madam | Estimado señor o señora | Dear Sir or Madam, I am writing to…
I am writing to | le escribo para | I am writing to complain about…
I am writing regarding | le escribo con respecto a | I am writing regarding my order.
I would be grateful if | le agradecería que | I would be grateful if you could help me.
Could you please | podría por favor | Could you please send me the details?
I would like to know | me gustaría saber | I would like to know the price.
Please find attached | adjunto encontrará | Please find attached my CV.
As requested | como lo solicitó | As requested, here is the report.
I apologize for | me disculpo por | I apologize for the delay.
Unfortunately | lamentablemente | Unfortunately, the item is out of stock.
I look forward to hearing from you | quedo en espera de su respuesta | I look forward to hearing from you soon.
Yours faithfully | atentamente (sin nombre) | Yours faithfully, Ana López
Yours sincerely | atentamente (con nombre) | Yours sincerely, Ana López
Kind regards | saludos cordiales | Kind regards, Luis
to reply | responder | Please reply by Friday.
to forward | reenviar | I forwarded the email to my boss.
to confirm | confirmar | Please confirm your attendance.
confirmation | confirmación | You'll receive a confirmation email.
to inform | informar | We are pleased to inform you…
to enclose | adjuntar (en papel) | I enclose a copy of my receipt.
inquiry / enquiry | consulta | Thank you for your inquiry.
complaint | queja | I want to make a complaint.
refund | reembolso | I'd like a refund.
to cancel | cancelar | I want to cancel my subscription.
subject line | asunto (del correo) | Write a clear subject line.
recipient | destinatario | Check the recipient before sending.
formal | formal | Use formal language with clients.
informal | informal | This email is too informal.
to arrange | organizar, concertar | Let's arrange a meeting.
availability | disponibilidad | What's your availability next week?
to reschedule | reprogramar | Can we reschedule the meeting?
urgent | urgente | This is urgent.
as soon as possible | lo antes posible | Please reply as soon as possible.
in advance | por adelantado | Thank you in advance.
to remind | recordar (a alguien) | Remind me tomorrow.
reminder | recordatorio | This is a friendly reminder.
to follow up | dar seguimiento | I'm following up on my last email.
on behalf of | en nombre de | I'm writing on behalf of my company.
signature | firma | Add your signature at the end.
P.S. | posdata | P.S. Say hi to your family.`},
 {tema:'Relaciones y sociedad',icono:'🤝',palabras:`relationship | relación | They have a good relationship.
to get married | casarse | They got married in June.
to get divorced | divorciarse | My parents got divorced.
to fall in love | enamorarse | They fell in love in Paris.
to break up | terminar (una relación) | They broke up last year.
engaged | comprometido | My sister is engaged.
acquaintance | conocido | He's an acquaintance, not a friend.
close friend | amigo cercano | She's a close friend.
to trust | confiar | I trust you.
to rely on | contar con | You can rely on me.
to argue with | discutir con | I argued with my brother.
to apologize | disculparse | He apologized for being late.
to forgive | perdonar | I forgive you.
to keep in touch | mantenerse en contacto | Let's keep in touch.
to lose touch | perder el contacto | We lost touch after college.
generation | generación | My generation grew up with the internet.
community | comunidad | We have a strong community.
neighborhood | vecindario | It's a safe neighborhood.
society | sociedad | Technology changes society.
citizen | ciudadano | Every citizen can vote.
government | gobierno | The government raised taxes.
law | ley | It's against the law.
crime | delito | Crime is falling in the city.
equality | igualdad | We believe in equality.
poverty | pobreza | Poverty is a global problem.
wealth | riqueza | Wealth is not everything.
unemployment | desempleo | Unemployment is rising.
to vote | votar | Did you vote?
election | elección | The election is in May.
volunteering | voluntariado | Volunteering is good for you.
charity | organización benéfica | I give money to charity.
to donate | donar | We donated food.
custom | costumbre | It's a local custom.
tradition | tradición | It's a family tradition.
culture | cultura | I love Mexican culture.
to respect | respetar | Respect other people.
to be used to | estar acostumbrado a | I'm used to waking up early.
to get used to | acostumbrarse a | I got used to the cold.
peer pressure | presión social | Teenagers feel peer pressure.
role model | modelo a seguir | My mother is my role model.`},
 {tema:'Medios y noticias',icono:'📰',palabras:`news | noticias | Did you see the news?
headline | titular | The headline was shocking.
article | artículo | I read an interesting article.
journalist | periodista | She works as a journalist.
reporter | reportero | The reporter asked many questions.
newspaper | periódico | I read the newspaper online.
magazine | revista | I bought a magazine at the airport.
the press | la prensa | The press was at the event.
broadcast | transmisión | The broadcast starts at 8.
to broadcast | transmitir | The match was broadcast live.
live | en vivo | We watched the concert live.
podcast | pódcast | I listen to podcasts on the bus.
audience | público, audiencia | The audience loved it.
viewer | televidente | Millions of viewers watched it.
advertisement | anuncio | There are too many advertisements.
fake news | noticias falsas | Be careful with fake news.
source | fuente | Check the source.
reliable | confiable | It's a reliable source.
to report | informar, reportar | The TV reported the accident.
interview | entrevista | I watched the interview.
documentary | documental | We watched a documentary about whales.
to censor | censurar | The government censored the film.
to publish | publicar | The book was published in 2010.
editor | editor | The editor changed the title.
column | columna | She writes a weekly column.
review | reseña | The film got great reviews.
critic | crítico | Critics loved the show.
celebrity | celebridad | She's a famous celebrity.
gossip | chisme | I don't like gossip.
announcement | anuncio, comunicado | They made an announcement.
breaking news | noticia de última hora | Breaking news: the president resigned.
to go on air | salir al aire | The show goes on air at 9.
channel | canal | Change the channel.
subtitles | subtítulos | I watch movies with subtitles.
episode | episodio | The last episode was great.
season | temporada | The second season is better.
plot | trama | The plot is very complicated.
character | personaje | The main character is a detective.
to be based on | estar basado en | The film is based on a true story.
trailer | tráiler | Have you seen the trailer?`},
 {tema:'Viajes y experiencias',icono:'🧳',palabras:`have you ever…? | ¿alguna vez has…? | Have you ever been to Peru?
I've never | nunca he | I've never seen snow.
once in a lifetime | única en la vida | It was a once in a lifetime trip.
destination | destino | Cancún is a popular destination.
accommodation | alojamiento | Accommodation is expensive there.
hostel | hostal | We stayed in a hostel.
to backpack | viajar de mochilero | I backpacked around Europe.
itinerary | itinerario | Here's our itinerary.
to go abroad | ir al extranjero | I went abroad for the first time.
jet lag | desfase horario | I have terrible jet lag.
customs | aduana | We waited at customs for an hour.
visa | visa | Do I need a visa?
local | local, lugareño | Ask the locals.
landscape | paisaje | The landscape was beautiful.
breathtaking | impresionante | The view was breathtaking.
crowded | abarrotado | The museum was crowded.
off the beaten track | fuera de lo turístico | We like places off the beaten track.
to explore | explorar | We explored the old town.
to get lost | perderse | We got lost in the city.
to set out | ponerse en camino | We set out early.
adventure | aventura | It was a real adventure.
memorable | memorable | It was a memorable night.
to experience | vivir, experimentar | I want to experience new cultures.
budget | presupuesto | We traveled on a budget.
travel insurance | seguro de viaje | Don't forget travel insurance.
package holiday | paquete vacacional | We booked a package holiday.
cruise | crucero | We went on a cruise.
resort | complejo turístico | The resort had three pools.
scenery | paisaje, escenario | The scenery was amazing.
souvenir shop | tienda de recuerdos | There are many souvenir shops.
to be worth it | valer la pena | It was expensive, but worth it.
to recommend | recomendar | I recommend the tour.
to complain | quejarse | We complained about the room.
upgrade | mejora (de categoría) | We got a free upgrade.
to take a break | tomar un descanso | Let's take a break.
sunset | atardecer | We watched the sunset.
sunrise | amanecer | We got up early to see the sunrise.
to sunbathe | asolearse | We sunbathed all afternoon.
to go sightseeing | ir a conocer lugares | We went sightseeing in Rome.
homesick | con nostalgia (de casa) | I felt homesick after a month.`}
];

const escritura=[
 {id:'b1-w-formal',tipo:'correo',titulo:'Correo formal: pedir información',consigna:'Quieres tomar un curso de verano de inglés en Canadá. Escribe un correo formal a la escuela: preséntate brevemente, di por qué te interesa y pide información sobre dos cosas (fechas, precio, alojamiento o nivel).',min:100,max:160,
  criterios:[crit('Saludo formal (Dear …)','^\\s*dear\\b','Empieza con Dear Sir or Madam, o Dear + apellido.'),crit('Dices el propósito (I am writing to…)','\\bi am writing (to|about|regarding)\\b','Primera frase: I am writing to ask for information about….'),
   crit('Haces dos preguntas indirectas (I would like to know / Could you tell me…)','(i would like to know|could you (please )?(tell|let)|i would be grateful if|i was wondering)[\\s\\S]*(i would like to know|could you (please )?(tell|let)|i would be grateful if|i was wondering|could you)','En un correo formal: Could you tell me…? / I would like to know….'),
   crit('Usas conectores (also, in addition, however, finally)','\\b(also|in addition|however|finally|moreover|furthermore)\\b','Ordena con also, in addition, finally.'),crit('Cierre formal (I look forward to hearing from you)','look forward to hearing','Antes de despedirte: I look forward to hearing from you.'),
   crit('Despedida formal (Yours faithfully / Yours sincerely / Kind regards)','\\b(yours faithfully|yours sincerely|kind regards|best regards)\\b','Cierra con Yours faithfully, o Kind regards,.'),crit('Sin contracciones (I\'m, don\'t…)',"\\b(i'm|you're|we're|they're|it's|that's|there's|let's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|shouldn't|couldn't|i've|we've|you've|they've|i'll|we'll|you'll|it'll|i'd|we'd|you'd|gonna|wanna)\\b",'En un correo formal escribe completo: I am, do not.',{no:true})],
  modelo:`Dear Sir or Madam,
I am writing to ask for information about your summer English courses in Vancouver. I am a software developer from Mexico and I would like to improve my English for my job, as I often work with clients in the United States.
I would like to know the dates of the courses in July and August. In addition, could you please tell me whether you can arrange accommodation with a local family? I would also be grateful if you could send me the prices.
Finally, I have an intermediate level, so I would like to know if there is a placement test before the course.
I look forward to hearing from you.
Yours faithfully,
Jorge Medina`},
 {id:'b1-w-opinion',tipo:'opinion',titulo:'Opinión: ¿redes sociales en la escuela?',consigna:'Escribe un párrafo de opinión para la revista de tu escuela: «¿Deberían prohibirse los teléfonos en las escuelas?». Da tu opinión, dos razones con ejemplos y una conclusión.',min:100,max:170,
  criterios:[crit('Das tu opinión al principio (In my opinion / I believe / I think)','\\b(in my opinion|i believe|i think|personally|from my point of view)\\b','Abre con tu postura: In my opinion,….'),crit('Ordenas tus razones (firstly, secondly, also…)','\\b(firstly|first of all|secondly|another reason|in addition|moreover|also)\\b','Usa Firstly, … Secondly, ….'),
   crit('Das un ejemplo (for example / for instance / such as)','\\b(for example|for instance|such as)\\b','Apoya con un ejemplo: For example,….'),crit('Muestras el otro lado (however / on the other hand / although)','\\b(however|on the other hand|although|even though|while)\\b','Reconoce el otro punto de vista: However,….'),
   crit('Cierras con una conclusión (To sum up / In conclusion / Overall)','\\b(to sum up|in conclusion|overall|all in all|to conclude)\\b','Termina con To sum up,….'),crit('Usas un condicional (if … will / would)','\\bif\\b[^.]*\\b(will|would|might|can|could)\\b','Imagina una consecuencia: If schools banned phones, students would….')],
  modelo:`In my opinion, phones should not be completely banned in schools, but their use should be limited. Firstly, phones can be very useful for learning. For example, students can look up words, use educational apps or take photos of the board. Secondly, many parents want to contact their children in an emergency. However, I agree that phones are a big distraction in class, and some students spend too much time on social media. If schools allowed phones only during breaks or for specific activities, students would get the advantages without the problems. To sum up, a clear set of rules is better than a total ban.`},
 {id:'b1-w-historia',tipo:'relato',titulo:'Cuenta una experiencia',consigna:'Escribe un relato corto que empiece con: «It was the most unexpected day of my life.» Usa pasado simple y pasado continuo, y al menos un conector de tiempo.',min:100,max:170,
  criterios:[crit('Empiezas con la frase indicada','^\\s*it was the most unexpected day of my life','Copia la primera frase tal cual.'),crit('Usas pasado continuo (was/were + -ing)','\\b(was|were) \\w+ing\\b','Describe la escena: I was walking…, it was raining….'),
   crit('Usas pasado simple (went, saw, decided…)','\\b(went|saw|decided|found|called|said|told|realized|heard|arrived|took|got)\\b','Las acciones principales en pasado simple.'),crit('Usas conectores de tiempo (suddenly, then, after that, when, while)','\\b(suddenly|then|after that|when|while|later|finally|as soon as)\\b','Ordena con suddenly, then, when….'),
   crit('Dices cómo te sentiste (I felt / I was + emoción)','\\b(i felt|i was (so |very )?(happy|surprised|scared|excited|nervous|shocked|relieved|amazed|confused))','Cuenta cómo te sentiste: I felt….')],
  modelo:`It was the most unexpected day of my life. I was walking to work in the rain when my phone rang. It was a number I didn't know, so I almost didn't answer. Then a woman said, "Congratulations, you have won the photography contest!" I was so surprised that I stopped in the middle of the street. A few months before, I had sent a photo of my grandmother cooking, but I had forgotten about it. When I arrived at the office, I told my colleagues and they didn't believe me. After that, I called my grandmother. She laughed and said she wanted half of the prize. I felt proud and happy all day.`}
];

export default {nivel:'B1',completo:true,lecturas,escuchas,vocabulario,escritura};
