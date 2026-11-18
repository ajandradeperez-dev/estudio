/* Inglés B2: práctica del nivel (ver datos.js). Temas: inglés técnico de TI y ciberseguridad, presentaciones, debates,
   negocios y sociedad. Gramática: condicional 3 y mixtos, reported speech, pasiva avanzada, modales de deducción,
   wish / if only, conectores y collocations. */
import {q,crit} from './base.js';

const lecturas=[
 {id:'b2-l-phishing',titulo:'Anatomy of a phishing attack',tipoTexto:'Artículo de divulgación (ciberseguridad)',texto:`Last spring, an accountant at a mid-sized logistics company received an email that appeared to come from the CEO. It asked her to transfer $48,000 to a new supplier "before the end of the day" and stressed that the matter was confidential. The message had the CEO's name, his signature and even his usual greeting.

She was about to make the payment when she noticed something odd: the domain ended in ".co" instead of ".com". She called the CEO, who had never sent the email.

Security experts say this type of fraud, known as business email compromise, relies less on technical skill than on psychology. Attackers create a sense of urgency, appeal to authority and ask for secrecy, so that victims act before they think.

Had the accountant not checked the address, the company would have lost the money. Since then, it has introduced a simple rule: any payment request received by email must be confirmed by phone, using a number that is already known.`,
  preguntas:[q('How much money did the email ask her to transfer?',['$48,000','48,000 dollars','48000','forty-eight thousand dollars'],'Busca la cifra en el primer párrafo.'),
   q('What detail made her suspicious? The domain ended in ___',['.co','".co"','co'],'odd = raro; instead of = en lugar de.'),
   q('According to experts, this fraud relies more on ___ than on technical skill.',['psychology'],'relies less on X than on Y = depende menos de X que de Y.'),
   q('Name one technique attackers use.',['urgency','a sense of urgency','authority','appeal to authority','secrecy','asking for secrecy'],'Busca la frase con create, appeal y ask.'),
   q('What is the new rule? Payment requests must be confirmed by ___',['phone','telephone','calling','a phone call'],'must be confirmed = deben confirmarse (pasiva con modal).')]},
 {id:'b2-l-ia',titulo:'Will AI take our jobs?',tipoTexto:'Ensayo de opinión',texto:`Every major technological change has been accompanied by fears of mass unemployment. When ATMs spread in the 1980s, many predicted the end of bank tellers; instead, banks opened more branches and the number of tellers actually grew for years. Artificial intelligence, however, may be different, because it affects tasks that were once considered uniquely human: writing, translating and even diagnosing diseases.

Optimists argue that AI will mostly automate the boring parts of jobs, leaving people free to focus on creativity, judgement and relationships. A lawyer who no longer has to read thousands of pages, for example, can spend more time with clients.

Pessimists point out that the benefits may not be evenly distributed. Workers whose tasks are easily automated could see their wages fall, while those who own or control the technology could become much richer.

What seems clear is that the skills that will matter most are those machines struggle with: asking good questions, working with people and learning continuously. Education systems that keep rewarding memorization might be preparing students for a world that no longer exists.`,
  preguntas:[q('What happened to the number of bank tellers after ATMs appeared?',['it grew','it increased','it went up','grew','increased'],'actually grew = de hecho creció.'),
   q('Why may AI be different? Because it affects tasks once considered uniquely ___',['human'],'uniquely = exclusivamente.'),
   q('According to optimists, AI will automate the ___ parts of jobs.',['boring'],'Busca Optimists argue that….'),
   q('What worry do pessimists have? The benefits may not be ___ distributed.',['evenly','equally','fairly'],'evenly = de forma pareja.'),
   q('Name one skill that will matter most, according to the writer.',['asking good questions','working with people','learning continuously','asking questions'],'those machines struggle with = las que a las máquinas se les dificultan.')]},
 {id:'b2-l-informe',titulo:'Incident report: database outage',tipoTexto:'Informe técnico',texto:`Summary
On 14 March, the customer database was unavailable for 3 hours and 20 minutes (09:12–12:32). During this period, users could not log in or place orders. No data was lost.

Cause
The outage was caused by a scheduled update that had been tested only in the staging environment. In production, the update triggered a lock on the main orders table, which prevented other queries from running. The monitoring system detected the problem within two minutes, but the alert was sent to an email address that is no longer in use.

Response
The on-call engineer was informed by the support team at 09:40 and rolled back the update at 12:20. Services were fully restored by 12:32.

Actions
1. All updates must be tested with a copy of production data before deployment.
2. Alerts will be sent to the on-call phone, not to email.
3. A checklist for rollbacks has been written and shared with the team.`,
  preguntas:[q('How long was the database unavailable?',['3 hours and 20 minutes','three hours and twenty minutes','3h 20m','3 hours 20 minutes'],'Busca Summary.'),
   q('Was any data lost? (yes/no)',['no','No data was lost',"No, it wasn't"],'No data was lost = no se perdió información.'),
   q('Where had the update been tested?',['in the staging environment','staging','the staging environment','only in staging'],'had been tested = había sido probada (pasiva en pasado perfecto).'),
   q('Why did nobody see the alert at first? It was sent to an email address that is no longer in ___',['use'],'no longer = ya no.'),
   q('Where will alerts be sent from now on?',['to the on-call phone','the on-call phone','to a phone','the phone'],'will be sent = serán enviadas.')]},
 {id:'b2-l-ciudades',titulo:'The fifteen-minute city',tipoTexto:'Artículo (urbanismo)',texto:`Imagine being able to reach your work, school, doctor, supermarket and a park within fifteen minutes on foot or by bike. This is the idea behind the "fifteen-minute city", a concept promoted by the urbanist Carlos Moreno and adopted, at least partly, by cities such as Paris, Melbourne and Bogotá.

Supporters claim that it would reduce traffic, pollution and the hours people lose commuting. Local shops would benefit, and neighborhoods would become safer because more people would be on the streets.

Critics, however, argue that the model works better in dense, wealthy city centers than in poorer suburbs, where jobs are scarce. Some also worry that it could be used as an excuse to restrict car use without offering real alternatives.

Paris offers an interesting example. Since 2020 it has turned hundreds of streets into pedestrian or cycling areas and opened school playgrounds to the public at weekends. Car traffic in the center has fallen considerably, although many residents of the outer suburbs complain that their journeys have become longer.`,
  preguntas:[q('How far should everyday places be? Within ___ minutes.',['fifteen','15'],'within = dentro de.'),
   q('Who promoted the concept?',['Carlos Moreno','the urbanist Carlos Moreno'],'promoted by = promovido por.'),
   q('Why would neighborhoods become safer? Because more people would be on the ___',['streets','street'],'Condicional: would become… because….'),
   q('Where do critics say the model works better? In dense, ___ city centers.',['wealthy','rich'],'wealthy = adinerado.'),
   q('Who complains that their journeys have become longer?',['residents of the outer suburbs','people in the suburbs','residents of the suburbs','suburban residents'],'Último párrafo.')]},
 {id:'b2-l-carta',titulo:'Letter to the editor: noise',tipoTexto:'Carta al editor',texto:`Dear Editor,

I am writing in response to your article "City nights come back to life" (12 June), which praised the council's decision to allow bars in the old town to stay open until 3 a.m.

While I appreciate that tourism brings jobs and money, the article failed to mention those of us who actually live in the area. Since the new rules were introduced, my family has not had a single full night's sleep from Thursday to Sunday. Music, shouting and broken glass have become part of our weekends, and several elderly neighbors have already moved out.

I am not suggesting that the bars should be closed. However, I believe a reasonable compromise is possible: closing at 1 a.m. on weekdays, stricter limits on outdoor music and more street cleaning. If the council had consulted residents before changing the rules, this conflict could have been avoided.

I hope your newspaper will give residents the chance to be heard.

Yours faithfully,
Inés Cabrera`,
  preguntas:[q('Until what time can bars stay open now?',['3 a.m.','3 am','until 3 a.m.','three in the morning','3'],'stay open until = permanecer abiertos hasta.'),
   q('What did the article fail to mention?',['the residents','people who live in the area','residents','those who live in the area'],'failed to mention = no mencionó.'),
   q('What have several elderly neighbors done?',['moved out','they have moved out','left the area','moved'],'move out = mudarse de un lugar.'),
   q('What closing time does she propose for weekdays?',['1 a.m.','1 am','one a.m.','1'],'compromise = acuerdo intermedio.'),
   q('According to her, how could the conflict have been avoided? If the council had ___ residents.',['consulted'],'Condicional 3: If + had + participio, could have + participio.')]},
 {id:'b2-l-ciencia',titulo:'Why we forget',tipoTexto:'Artículo de ciencia',texto:`In the 1880s, the German psychologist Hermann Ebbinghaus spent years memorizing lists of meaningless syllables and testing himself at different intervals. He discovered that we forget most new information surprisingly fast: roughly half within an hour and around two thirds within a day, unless we review it.

His "forgetting curve" has been confirmed by many later studies, and it has an important practical consequence. Reviewing material just before we are about to forget it strengthens the memory far more than reviewing it repeatedly in a single session. This is known as spaced repetition, and it is the principle behind many language apps.

A second technique, retrieval practice, involves trying to recall information instead of simply rereading it. Students who test themselves remember considerably more after a week than those who spend the same time rereading their notes, even though rereading feels more productive at the time.

The lesson is somewhat counterintuitive: the methods that feel easiest are often the least effective, while the ones that feel difficult are the ones that make knowledge stick.`,
  preguntas:[q('What did Ebbinghaus memorize?',['meaningless syllables','lists of meaningless syllables','syllables'],'meaningless = sin sentido.'),
   q('Roughly how much do we forget within an hour?',['half','about half','roughly half','50%'],'roughly = aproximadamente.'),
   q('What is the name of the technique of reviewing just before forgetting?',['spaced repetition'],'This is known as… = esto se conoce como….'),
   q('In retrieval practice, you try to ___ information instead of rereading it.',['recall','remember'],'recall = recordar activamente.'),
   q('According to the article, methods that feel easiest are often the ___ effective.',['least'],'the least = el menos.')]}
];

const escuchas=[
 {id:'b2-e-presentacion',titulo:'Opening a presentation',tipoTexto:'Inicio de una presentación de trabajo',texto:`Good morning, everyone, and thank you for coming. I'm going to talk about the results of our customer survey and what they mean for next year. I've divided the presentation into three parts. First, I'll give you a quick overview of the numbers. Then I'll focus on the two main complaints, which were delivery times and the mobile app. Finally, I'll suggest three changes we could make with our current budget. The whole thing should take about twenty minutes, and there'll be time for questions at the end.`,
  preguntas:[q('What is the presentation about? The results of a customer ___',['survey'],'survey = encuesta.'),
   q('How many parts does it have?',['three','3'],'I\'ve divided the presentation into three parts.'),
   q('Name one of the two main complaints.',['delivery times','the mobile app','delivery','the app'],'complaints = quejas.'),
   q('When can the audience ask questions?',['at the end','at the end of the presentation','after the presentation'],'at the end = al final.')]},
 {id:'b2-e-podcast-seguridad',titulo:'Passwords and passkeys',tipoTexto:'Pódcast de tecnología',texto:`So why are companies moving away from passwords? — The main problem is that people reuse them. If one website is breached, attackers try the same email and password everywhere else, which is called credential stuffing. Passkeys solve that, because there's no shared secret stored on the server: your device proves who you are with a cryptographic key, usually unlocked with your fingerprint or face. — And if I lose my phone? — Your passkeys are normally synced to your account, so you'd restore them on a new device. But you should still have a backup method set up beforehand.`,
  preguntas:[q('What is the main problem with passwords, according to the guest?',['people reuse them','reuse','password reuse','people reuse passwords'],'reuse = reutilizar.'),
   q('What is it called when attackers try the same password on other sites?',['credential stuffing'],'which is called = lo que se llama.'),
   q('How is the passkey usually unlocked? (one way)',['with your fingerprint','fingerprint','with your face','face','your fingerprint or face'],'unlocked with = desbloqueada con.'),
   q('What should you set up beforehand?',['a backup method','backup method','a backup'],'beforehand = de antemano.')]},
 {id:'b2-e-debate',titulo:'Debate: a four-day work week',tipoTexto:'Debate radial',texto:`I'm convinced a four-day week would make us more productive. The trials in the UK showed that most companies kept the same output and staff were far less stressed. — With respect, those trials were voluntary. The companies that joined were precisely the ones that expected it to work. I'm not against the idea, but it simply wouldn't be practical in hospitals or schools. — Nobody is saying it should be imposed everywhere overnight. — Then we agree more than it seems: it should be tested sector by sector.`,
  preguntas:[q('According to the first speaker, the UK trials showed that staff were less ___',['stressed'],'far less = mucho menos.'),
   q('What does the second speaker criticize about the trials? They were ___',['voluntary'],'With respect… = con todo respeto….'),
   q('Where would it not be practical, according to the second speaker? (one place)',['hospitals','schools','in hospitals','in schools','hospitals or schools'],'it simply wouldn\'t be practical in….'),
   q('What do they finally agree on? It should be tested sector by ___',['sector'],'Then we agree… = entonces coincidimos….')]},
 {id:'b2-e-noticias',titulo:'Business news',tipoTexto:'Boletín de noticias',texto:`Shares in the electric car maker Voltra fell by twelve percent yesterday after the company admitted that deliveries would be delayed until the autumn. The chief executive said the delay had been caused by a shortage of batteries, which are produced by a single supplier in Asia. Analysts warned that the company might have to cut its sales forecast for the year. Meanwhile, its main competitor announced that it would open a new factory in Mexico, creating around three thousand jobs.`,
  preguntas:[q('By how much did Voltra\'s shares fall?',['twelve percent','12%','12 percent','twelve'],'fell by = cayeron un….'),
   q('Until when will deliveries be delayed?',['the autumn','until the autumn','autumn','fall'],'admitted that deliveries would be delayed = reconoció que las entregas se retrasarían (estilo indirecto).'),
   q('What caused the delay? A shortage of ___',['batteries'],'shortage = escasez.'),
   q('Where will the competitor open a new factory?',['Mexico','in Mexico'],'announced that it would… = anunció que….')]},
 {id:'b2-e-mentoria',titulo:'Advice from a mentor',tipoTexto:'Conversación de mentoría',texto:`Looking back, what would you have done differently at the start of your career? — Honestly, I wish I had asked for feedback much earlier. I spent two years assuming I was doing fine, and then I found out in a performance review that my reports were too long and nobody read them. If someone had told me in the first month, I would have saved myself a lot of frustration. — So what do you recommend? — Ask your manager every few weeks: what's one thing I could do better? It feels uncomfortable, but it works.`,
  preguntas:[q('What does the mentor wish she had done earlier?',['asked for feedback','ask for feedback','asked for feedback much earlier'],'I wish I had + participio = ojalá hubiera….'),
   q('How long did she assume she was doing fine?',['two years','2 years','for two years'],'assuming = suponiendo.'),
   q('What was wrong with her reports? They were too ___',['long'],'too long = demasiado largos.'),
   q('How often does she recommend asking your manager?',['every few weeks','every couple of weeks','every few weeks.'],'every few weeks = cada pocas semanas.')]},
 {id:'b2-e-guia',titulo:'Guided tour: the old factory',tipoTexto:'Visita guiada',texto:`This building must have been one of the busiest places in the city a century ago. It was built in 1912 as a textile factory, and at its peak it employed over two thousand people, most of them women. The large windows you can see weren't decorative; they were designed to let in as much light as possible, since electric lighting was expensive. The factory closed in the seventies, and for decades it was left empty. It was restored ten years ago and now houses studios, a market and a small museum about the workers' lives.`,
  preguntas:[q('When was the building built?',['in 1912','1912'],'was built = fue construido.'),
   q('How many people did it employ at its peak? Over two ___',['thousand'],'over = más de.'),
   q('Why were the windows so large? To let in as much ___ as possible.',['light'],'Modal de deducción: must have been = debe haber sido.'),
   q('What does it house now? (one thing)',['studios','a market','a small museum','a museum'],'houses = alberga.')]}
];

const vocabulario=[
 {tema:'Ciberseguridad',icono:'🛡️',palabras:`threat | amenaza | Phishing is the most common threat.
vulnerability | vulnerabilidad | The update fixes a critical vulnerability.
to exploit | explotar (una falla) | Attackers exploited a bug in the server.
breach | brecha, filtración | The data breach affected millions of users.
attacker | atacante | The attacker used a fake login page.
malware | software malicioso | The laptop was infected with malware.
ransomware | ransomware | Ransomware encrypted all the files.
phishing | suplantación por correo | Never click links in phishing emails.
social engineering | ingeniería social | Social engineering targets people, not machines.
two-factor authentication | autenticación de dos factores | Turn on two-factor authentication.
encryption | cifrado | Encryption protects data in transit.
to encrypt | cifrar | All backups are encrypted.
firewall | firewall, cortafuegos | The firewall blocked the connection.
patch | parche | Install the patch as soon as possible.
to patch | parchar | We patched the servers overnight.
credentials | credenciales | Never share your credentials.
access control | control de acceso | Access control limits who can see the data.
least privilege | mínimo privilegio | Apply the principle of least privilege.
incident | incidente | Report the incident to the security team.
incident response | respuesta a incidentes | Our incident response plan has five steps.
to contain | contener | First, contain the attack.
to mitigate | mitigar | We mitigated the risk with a new rule.
to detect | detectar | The system detected unusual activity.
suspicious | sospechoso | Report any suspicious email.
log | registro (log) | Check the logs for failed logins.
audit | auditoría | The audit found several weaknesses.
compliance | cumplimiento normativo | Compliance with the law is mandatory.
risk assessment | evaluación de riesgos | We carry out a risk assessment every year.
backup policy | política de respaldos | Our backup policy requires daily copies.
to restore | restaurar | We restored the data from a backup.
brute-force attack | ataque de fuerza bruta | A brute-force attack tries thousands of passwords.
denial of service | denegación de servicio | The website suffered a denial of service attack.
to leak | filtrar | The documents were leaked online.
to spoof | suplantar | The sender's address was spoofed.
zero-day | día cero | A zero-day has no patch yet.
awareness training | capacitación de concientización | Awareness training reduced clicks on phishing links.
to grant access | dar acceso | Only admins can grant access.
to revoke | revocar | Revoke access when someone leaves.
endpoint | equipo final | Every endpoint needs antivirus.
safeguard | salvaguarda | Backups are an essential safeguard.`},
 {tema:'Tecnología e informática',icono:'🖥️',palabras:`to deploy | desplegar, publicar | We deploy new code every Friday.
deployment | despliegue | The deployment failed.
release | versión, lanzamiento | The new release fixes many bugs.
to roll back | revertir | We rolled back the update.
downtime | tiempo de inactividad | We had two hours of downtime.
outage | caída (de servicio) | The outage affected all users.
uptime | tiempo de disponibilidad | Our uptime last year was 99.9%.
scalable | escalable | The system must be scalable.
bottleneck | cuello de botella | The database is the bottleneck.
to troubleshoot | diagnosticar fallas | I spent all day troubleshooting the network.
workaround | solución provisional | There's a workaround until the fix arrives.
legacy system | sistema heredado | We still use a legacy system.
to migrate | migrar | We migrated to the cloud last year.
infrastructure | infraestructura | The infrastructure is hosted in the cloud.
server | servidor | The server is down.
database | base de datos | The database stores all the orders.
query | consulta | The query takes ten seconds.
user interface | interfaz de usuario | The user interface is very clear.
user experience | experiencia de usuario | We want to improve the user experience.
requirement | requisito | What are the requirements?
feature | función, característica | The app has a new feature.
to test | probar | Test the code before you deploy it.
testing | pruebas | Testing found three bugs.
source code | código fuente | The source code is on GitHub.
open source | código abierto | It's an open source project.
version control | control de versiones | We use Git for version control.
repository | repositorio | Clone the repository.
to debug | depurar | Debug the function step by step.
to automate | automatizar | We automated the reports.
script | script, guion | I wrote a script to clean the data.
bandwidth | ancho de banda | Video calls use a lot of bandwidth.
latency | latencia | High latency makes the game slow.
to configure | configurar | Configure the router first.
to monitor | monitorear | We monitor the servers 24/7.
alert | alerta | The alert was sent to my phone.
on-call | de guardia | I'm on call this weekend.
ticket | ticket, solicitud | Open a ticket with IT support.
stakeholder | parte interesada | Inform all the stakeholders.
specifications | especificaciones | Read the technical specifications.
to integrate | integrar | We integrated the payment system.`},
 {tema:'Negocios y economía',icono:'📈',palabras:`revenue | ingresos | Revenue grew by 10% last year.
profit | ganancia | The company made a profit.
loss | pérdida | The company reported a loss.
turnover | facturación, rotación | Staff turnover is high.
budget | presupuesto | We're over budget.
forecast | pronóstico | The sales forecast is optimistic.
market share | cuota de mercado | We increased our market share.
competitor | competidor | Our main competitor is cheaper.
merger | fusión | The merger was announced yesterday.
acquisition | adquisición | The acquisition cost $2 billion.
shareholder | accionista | Shareholders were unhappy.
shares | acciones | Shares fell by 5%.
investment | inversión | It was a good investment.
to invest | invertir | We invested in new software.
supply chain | cadena de suministro | The supply chain was disrupted.
supplier | proveedor | We changed suppliers.
shortage | escasez | There's a shortage of chips.
demand | demanda | Demand for electric cars is growing.
inflation | inflación | Inflation reached 6%.
interest rate | tasa de interés | Interest rates went up.
recession | recesión | Many feared a recession.
growth | crecimiento | Growth slowed down this year.
to launch | lanzar | We launched a new product.
target market | mercado meta | Students are our target market.
brand | marca | It's a well-known brand.
negotiation | negociación | The negotiation lasted weeks.
deal | trato, acuerdo | We closed the deal.
to outsource | subcontratar | They outsourced customer service.
cost-effective | rentable | It's a cost-effective solution.
return on investment | retorno de inversión | What's the return on investment?
cash flow | flujo de efectivo | Cash flow is a problem for small businesses.
to break even | no ganar ni perder | We expect to break even next year.
to go bankrupt | quebrar | The company went bankrupt.
startup capital | capital inicial | We needed startup capital.
quarterly | trimestral | The quarterly results are out.
annual report | informe anual | Read the annual report.
to cut costs | recortar costos | We need to cut costs.
productivity | productividad | Productivity has improved.
key performance indicator | indicador clave de desempeño | Sales per customer is our main KPI.
to meet a target | cumplir un objetivo | We met our sales target.`},
 {tema:'Presentaciones y reuniones',icono:'🎤',palabras:`to give a presentation | dar una presentación | I'm giving a presentation tomorrow.
agenda | orden del día | Let's look at the agenda.
to chair a meeting | presidir una reunión | Who's chairing the meeting?
to take the minutes | levantar el acta | Can you take the minutes?
action points | tareas acordadas | Let's review the action points.
to bring forward | adelantar (fecha) | The meeting was brought forward to Monday.
to postpone | posponer | We postponed the launch.
to outline | esbozar, resumir | Let me outline the plan.
overview | panorama general | Here's a quick overview.
to move on | pasar a otro punto | Let's move on to the next point.
to sum up | resumir | To sum up, sales are growing.
to highlight | destacar | I'd like to highlight two points.
slide | diapositiva | Look at this slide.
chart | gráfica | The chart shows our growth.
as you can see | como pueden ver | As you can see, costs fell.
to elaborate | desarrollar, explicar más | Could you elaborate on that?
to interrupt | interrumpir | Sorry to interrupt, but…
to clarify | aclarar | Let me clarify what I mean.
to make a point | señalar algo | She made a good point.
to raise an issue | plantear un tema | I'd like to raise an issue.
consensus | consenso | We reached a consensus.
to reach an agreement | llegar a un acuerdo | We reached an agreement.
proposal | propuesta | Here's my proposal.
to propose | proponer | I propose a new schedule.
feedback | retroalimentación | Any feedback is welcome.
brainstorming | lluvia de ideas | Let's do some brainstorming.
to follow up on | dar seguimiento a | I'll follow up on that.
deadline extension | prórroga | We asked for a deadline extension.
to wrap up | concluir | Let's wrap up the meeting.
to run over time | pasarse del tiempo | The meeting ran over time.
handout | material impreso | I'll send the handout later.
Q&A session | sesión de preguntas | There's a Q&A session at the end.
to address (an issue) | abordar | We need to address this problem.
to delegate | delegar | Learn to delegate tasks.
to prioritize | priorizar | We have to prioritize.
key takeaway | idea principal | The key takeaway is simple.
to be on the same page | estar en sintonía | Let's make sure we're on the same page.
to touch base | ponerse en contacto | Let's touch base next week.
to keep someone posted | mantener informado | Keep me posted.
to go over | revisar | Let's go over the numbers.`},
 {tema:'Conectores avanzados',icono:'🧩',palabras:`nevertheless | no obstante | It was risky; nevertheless, we did it.
nonetheless | aun así | The plan is expensive. Nonetheless, it's worth it.
furthermore | además | Furthermore, the costs are lower.
in contrast | en cambio | In contrast, the old model was slow.
whereas | mientras que | The first test failed, whereas the second worked.
even though | aunque | Even though it rained, we went out.
in spite of | a pesar de | In spite of the delay, we finished.
owing to | debido a | Owing to the storm, flights were canceled.
due to | debido a | The delay was due to bad weather.
consequently | en consecuencia | Sales fell; consequently, we cut costs.
thus | así, por lo tanto | Thus, the project was approved.
hence | de ahí que | It's cheaper, hence more popular.
provided that | siempre que | You can go, provided that you finish.
unless | a menos que | We'll lose money unless we act.
as long as | mientras | You can stay as long as you're quiet.
in case | por si | Take an umbrella in case it rains.
so that | para que | Speak louder so that everyone can hear.
in order to | con el fin de | We met in order to discuss the budget.
as a matter of fact | de hecho | As a matter of fact, I agree.
in other words | en otras palabras | In other words, we failed.
that is to say | es decir | The deadline, that is to say Friday.
on the contrary | al contrario | It isn't boring; on the contrary, it's great.
by contrast | por el contrario | By contrast, rural areas are quieter.
likewise | del mismo modo | Likewise, we need more staff.
similarly | de manera similar | Similarly, prices rose in Spain.
above all | sobre todo | Above all, be honest.
in particular | en particular | I liked the music in particular.
namely | a saber | Two countries, namely Peru and Chile.
regarding | con respecto a | Regarding your question, yes.
as for | en cuanto a | As for the budget, it's fine.
all in all | en general | All in all, it was a success.
in the long run | a largo plazo | In the long run, it will pay off.
as a whole | en su conjunto | The team as a whole did well.
to a certain extent | hasta cierto punto | I agree to a certain extent.
by no means | de ninguna manera | It's by no means easy.
needless to say | huelga decir | Needless to say, we were tired.
whereby | por el cual | A system whereby users vote.
meanwhile | mientras tanto | Meanwhile, prices kept rising.
subsequently | posteriormente | He was subsequently promoted.
ultimately | en última instancia | Ultimately, it's your decision.`},
 {tema:'Collocations frecuentes',icono:'🧲',palabras:`make a decision | tomar una decisión | We need to make a decision today.
make an effort | hacer un esfuerzo | Make an effort to arrive on time.
make progress | avanzar | We're making good progress.
make a mistake | cometer un error | I made a mistake in the report.
do research | investigar | She did research on climate change.
do business | hacer negocios | We do business in Asia.
take a risk | arriesgarse | Sometimes you have to take a risk.
take advantage of | aprovechar | Take advantage of the offer.
take responsibility | asumir la responsabilidad | He took responsibility for the error.
pay attention | prestar atención | Pay attention to the details.
draw a conclusion | sacar una conclusión | It's too early to draw a conclusion.
raise awareness | crear conciencia | The campaign raises awareness.
meet a deadline | cumplir un plazo | We met the deadline.
miss a deadline | no cumplir un plazo | We can't miss this deadline.
reach a decision | llegar a una decisión | They reached a decision.
run a business | dirigir un negocio | She runs a small business.
set a goal | fijar una meta | Set realistic goals.
break a record | romper un récord | He broke the world record.
keep a promise | cumplir una promesa | Always keep your promises.
heavy traffic | tráfico pesado | There's heavy traffic downtown.
strong coffee | café cargado | I need a strong coffee.
high quality | alta calidad | It's a high quality product.
deeply concerned | profundamente preocupado | We're deeply concerned about it.
highly recommended | muy recomendado | The book is highly recommended.
fully aware | plenamente consciente | I'm fully aware of the risks.
widely used | ampliamente usado | It's a widely used tool.
bitterly disappointed | profundamente decepcionado | She was bitterly disappointed.
a sharp increase | un aumento brusco | There was a sharp increase in prices.
a slight decrease | una ligera disminución | We saw a slight decrease in sales.
a wide range of | una amplia gama de | We offer a wide range of courses.
a key role | un papel clave | Teachers play a key role.
come to an end | llegar a su fin | The project came to an end.
catch someone's attention | llamar la atención | The ad caught my attention.
face a challenge | enfrentar un reto | We're facing a big challenge.
give priority to | dar prioridad a | Give priority to safety.
hold a meeting | celebrar una reunión | We'll hold a meeting on Monday.
gain experience | ganar experiencia | I gained experience abroad.
lose track of time | perder la noción del tiempo | I lost track of time.
bear in mind | tener en cuenta | Bear in mind that it's expensive.
burst into tears | romper en llanto | She burst into tears.`},
 {tema:'Sociedad y temas actuales',icono:'🏛️',palabras:`inequality | desigualdad | Inequality has grown in many countries.
policy | política (medida) | The new policy starts in January.
legislation | legislación | New legislation protects workers.
to regulate | regular | Governments should regulate AI.
regulation | regulación | The regulation is too strict.
to ban | prohibir | They banned plastic bags.
human rights | derechos humanos | Human rights must be respected.
freedom of speech | libertad de expresión | Freedom of speech is essential.
immigration | inmigración | Immigration is a political issue.
to emigrate | emigrar | Many young people emigrate to find work.
refugee | refugiado | The country welcomed refugees.
welfare | bienestar social | The welfare system needs reform.
healthcare | atención médica | Healthcare should be accessible.
housing crisis | crisis de vivienda | The housing crisis affects young people.
affordable | asequible | We need affordable housing.
gentrification | gentrificación | Gentrification pushes out locals.
urban | urbano | Urban areas are growing fast.
rural | rural | Rural areas lack services.
aging population | envejecimiento de la población | Japan has an aging population.
life expectancy | esperanza de vida | Life expectancy has increased.
mental health | salud mental | Mental health matters.
well-being | bienestar | Exercise improves well-being.
diversity | diversidad | Diversity makes teams stronger.
inclusion | inclusión | We promote inclusion at work.
discrimination | discriminación | Discrimination is illegal.
stereotype | estereotipo | Avoid stereotypes.
bias | sesgo | The algorithm showed bias.
misinformation | desinformación | Misinformation spreads fast online.
public opinion | opinión pública | Public opinion has changed.
campaign | campaña | The campaign was a success.
protest | protesta | Thousands joined the protest.
to raise funds | recaudar fondos | We raised funds for the school.
nonprofit | organización sin fines de lucro | She works for a nonprofit.
corruption | corrupción | Corruption is a serious problem.
transparency | transparencia | We demand transparency.
accountability | rendición de cuentas | Leaders need accountability.
sustainable development | desarrollo sostenible | Sustainable development is the goal.
remote area | zona remota | Internet is slow in remote areas.
digital divide | brecha digital | The digital divide is still large.
to tackle | abordar, combatir | We must tackle poverty.`},
 {tema:'Matices: deducción, deseos y lamentos',icono:'🤔',palabras:`must have been | debe haber sido | It must have been difficult.
can't have been | no puede haber sido | It can't have been him.
might have | podría haber | She might have forgotten.
could have | podría haber | You could have told me!
should have | debería haber | I should have studied more.
shouldn't have | no debería haber | You shouldn't have said that.
needn't have | no hacía falta | You needn't have brought anything.
I wish I had | ojalá hubiera | I wish I had more time.
I wish I could | ojalá pudiera | I wish I could speak French.
if only | ojalá, si tan solo | If only I'd known!
I'd rather | preferiría | I'd rather stay home.
it's high time | ya es hora de | It's high time we left.
to regret | arrepentirse | I regret not studying abroad.
in hindsight | en retrospectiva | In hindsight, it was a mistake.
to blame | culpar | Don't blame yourself.
to be supposed to | se supone que | You're supposed to be at work.
to be likely to | es probable que | It's likely to rain.
to be bound to | seguro que | It's bound to happen.
apparently | al parecer | Apparently, he resigned.
presumably | presumiblemente | Presumably, they're on their way.
evidently | evidentemente | Evidently, she was upset.
allegedly | supuestamente | He allegedly stole the money.
it seems that | parece que | It seems that the plan worked.
it turned out that | resultó que | It turned out that he was right.
there's no doubt | no hay duda | There's no doubt about it.
I bet | apuesto a que | I bet he forgot.
chances are | lo más probable es que | Chances are she's busy.
no wonder | con razón | No wonder you're tired!
to come across as | dar la impresión de | He comes across as arrogant.
to make sense | tener sentido | That makes sense.
to take for granted | dar por sentado | Don't take your health for granted.
to jump to conclusions | sacar conclusiones apresuradas | Don't jump to conclusions.
to second-guess | dudar de, cuestionar | Don't second-guess yourself.
to be in two minds | estar indeciso | I'm in two minds about it.
on second thought | pensándolo bien | On second thought, let's stay.
to have second thoughts | tener dudas | I'm having second thoughts.
for all I know | por lo que yo sé | For all I know, he's in Paris.
to the best of my knowledge | según mi conocimiento | To the best of my knowledge, it's free.
to put it mildly | por decirlo suavemente | It was a mistake, to put it mildly.
as it happens | da la casualidad de que | As it happens, I know her.`},
 {tema:'Estilo indirecto y verbos de reporte',icono:'🗣️',palabras:`to claim | afirmar | He claimed that he was innocent.
to admit | admitir | She admitted she was wrong.
to deny | negar | He denied stealing the money.
to insist | insistir | She insisted on paying.
to warn | advertir | They warned us about the storm.
to urge | instar | The doctor urged him to rest.
to persuade | persuadir | She persuaded me to come.
to remind | recordar (a alguien) | He reminded me to call.
to promise | prometer | They promised to help.
to refuse | negarse | He refused to answer.
to threaten | amenazar | They threatened to quit.
to announce | anunciar | The company announced new jobs.
to state | declarar | The report states that…
to mention | mencionar | She mentioned a new project.
to explain | explicar | He explained why he was late.
to complain | quejarse | Customers complained about the delay.
to accuse | acusar | They accused him of lying.
to apologize for | disculparse por | She apologized for the mistake.
to congratulate | felicitar | They congratulated her on the promotion.
to blame for | culpar de | They blamed him for the delay.
to suggest | sugerir | She suggested meeting earlier.
to recommend | recomendar | He recommended that we wait.
to advise | aconsejar | I advised her to see a lawyer.
to encourage | animar | My teacher encouraged me to apply.
to point out | señalar | He pointed out a mistake.
to argue | sostener | She argued that it was unfair.
to reveal | revelar | The study revealed surprising results.
to confirm | confirmar | They confirmed the meeting.
to acknowledge | reconocer | He acknowledged the problem.
to assure | asegurar (a alguien) | I assure you it's safe.
to estimate | estimar | Experts estimate that prices will rise.
to predict | predecir | Nobody predicted the crisis.
to report | informar | Police reported two arrests.
according to | según | According to the report, sales fell.
she told me that | me dijo que | She told me that she was tired.
he asked me if | me preguntó si | He asked me if I was ready.
the day before | el día anterior | She said she had arrived the day before.
the following day | al día siguiente | He said he would call the following day.
it is said that | se dice que | It is said that the house is haunted.
is believed to | se cree que | He is believed to be in Spain.`},
 {tema:'Trabajo profesional y liderazgo',icono:'🧭',palabras:`leadership | liderazgo | She has great leadership skills.
to lead | liderar | He leads a team of twenty.
to motivate | motivar | Good managers motivate their teams.
to empower | empoderar | We want to empower employees.
ownership | sentido de pertenencia, responsabilidad | We want people to take ownership of their work.
initiative | iniciativa | She showed a lot of initiative.
to take the lead | tomar la iniciativa | He took the lead on the project.
to mentor | ser mentor | I mentor two junior developers.
mentor | mentor | My mentor gave me great advice.
soft skills | habilidades blandas | Soft skills are as important as technical ones.
teamwork | trabajo en equipo | Teamwork made it possible.
conflict resolution | resolución de conflictos | Conflict resolution is part of my job.
to collaborate | colaborar | We collaborate with other departments.
time management | gestión del tiempo | Time management is key.
burnout | agotamiento laboral | Burnout is common in tech.
to meet expectations | cumplir expectativas | The results met our expectations.
to exceed expectations | superar expectativas | She exceeded expectations.
appraisal | evaluación de desempeño | My appraisal is next month.
to give constructive criticism | dar crítica constructiva | Learn to give constructive criticism.
career path | trayectoria profesional | What's your career path?
to climb the ladder | escalar posiciones | He climbed the corporate ladder.
to step down | dimitir, hacerse a un lado | The CEO stepped down.
to headhunt | reclutar talento | She was headhunted by Google.
job security | estabilidad laboral | Job security is important to me.
notice period | periodo de aviso | My notice period is one month.
to give notice | avisar (que te vas) | I gave notice on Monday.
severance pay | indemnización | He received severance pay.
flexible hours | horario flexible | We have flexible hours.
remote-first | remoto por defecto | We're a remote-first company.
onboarding | integración (de nuevos) | Onboarding takes two weeks.
networking | hacer contactos | Networking helped me find this job.
to pitch | presentar (una idea) | I pitched my idea to the board.
to keep track of | llevar el control de | Keep track of your hours.
to oversee | supervisar | She oversees three projects.
to streamline | simplificar, agilizar | We streamlined the process.
to implement | implementar | We implemented a new system.
to evaluate | evaluar | We need to evaluate the results.
outcome | resultado | The outcome was positive.
milestone | hito | We reached an important milestone.
trade-off | compensación, sacrificio | There's always a trade-off.`}
];

const escritura=[
 {id:'b2-w-incidente',tipo:'informe',titulo:'Correo: reporte de un incidente',consigna:'Eres parte del equipo de TI. Ayer varios empleados recibieron un correo de phishing y uno ingresó su contraseña. Escribe un correo a todo el personal: qué pasó (en voz pasiva al menos una vez), qué se hizo, qué deben hacer ahora y cómo reconocer correos sospechosos.',min:140,max:220,
  criterios:[crit('Saludo profesional (Dear all / Dear colleagues / Hi everyone)','^\\s*(dear (all|colleagues|team|everyone)|hi (all|everyone|team)|hello (all|everyone|team))\\b','Empieza con Dear all, / Dear colleagues,.'),crit('Usas la voz pasiva (was sent, were reset, has been blocked…)','\\b(was|were|has been|have been|is being|will be)\\s+\\w+(ed|en|t)\\b','Explica qué pasó en pasiva: the email was sent…, passwords were reset.'),
   crit('Das instrucciones claras (please + verbo / you should / make sure)','\\b(please \\w+|you should|make sure|do not|don\'t|never)\\b','Di qué hacer: Please change…, Never click….'),crit('Explicas cómo reconocer un correo sospechoso (sender, link, urgent…)','\\b(sender|link|urgent|attachment|domain|address|spelling)\\b','Da señales: check the sender\'s address, urgent requests, strange links.'),
   crit('Usas conectores (however, therefore, as a result, in addition)','\\b(however|therefore|as a result|in addition|consequently|furthermore|moreover)\\b','Une ideas con therefore, as a result, in addition.'),crit('Cierre profesional (Best regards / Kind regards)','\\b(best regards|kind regards|regards|many thanks)\\b','Cierra con Best regards, + tu nombre y área.')],
  modelo:`Dear all,
Yesterday afternoon, a phishing email was sent to around forty employees. It looked like a message from our payroll provider and asked people to "confirm their bank details". Unfortunately, one colleague entered their password on the fake page.
The account was blocked within ten minutes and the password has been reset. In addition, the fake website has been reported and is now blocked on our network. As a result, no data was lost.
Please be careful with any email that creates a sense of urgency, asks for passwords or contains links to login pages. Always check the sender's address: this one came from "payro11-services.co". If you are not sure, do not click anything and forward the email to security@ourcompany.com.
If you have any questions, please contact the IT team on extension 400.
Thank you for your attention and for helping us keep our company safe.
Best regards,
Daniela Ruiz, IT Security`},
 {id:'b2-w-ensayo',tipo:'ensayo',titulo:'Ensayo: ¿la IA en el trabajo es más una oportunidad que una amenaza?',consigna:'Escribe un ensayo corto (estilo B2 First) con introducción, dos argumentos con ejemplos, un contraargumento y una conclusión con tu postura.',min:160,max:240,
  criterios:[crit('Presentas el tema en la introducción (Nowadays / In recent years / It is often said)','^\\s*(nowadays|in recent years|these days|it is (often|widely) (said|argued|believed)|over the last|today)\\b','Abre con el contexto: In recent years, ….'),crit('Ordenas los argumentos (firstly, secondly, furthermore…)','\\b(firstly|first of all|secondly|furthermore|moreover|in addition)\\b','Firstly, … Furthermore, ….'),
   crit('Presentas un contraargumento (however / on the other hand / admittedly)','\\b(however|on the other hand|admittedly|nevertheless|that said|it could be argued)\\b','Reconoce la otra postura: On the other hand, ….'),crit('Das ejemplos (for instance / such as / for example)','\\b(for instance|for example|such as)\\b','Apoya con un ejemplo.'),
   crit('Usas un condicional complejo (would / could have / if … had)','\\b(would|could have|might have|if [^.]* had)\\b','Usa un condicional: If companies trained workers, they would….'),crit('Concluyes con tu postura (In conclusion / All things considered / To conclude)','\\b(in conclusion|to conclude|all things considered|on balance|overall)\\b','Termina con In conclusion, … I believe….'),
   crit('Registro formal (sin contracciones)',"\\b(i'm|you're|we're|they're|it's|that's|there's|let's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|shouldn't|couldn't|i've|we've|you've|they've|i'll|we'll|you'll|it'll|i'd|we'd|you'd|gonna|wanna)\\b",'En un ensayo escribe completo: do not, it is.',{no:true})],
  modelo:`In recent years, artificial intelligence has started to change the way we work, and many people are worried about losing their jobs. In my opinion, AI is more of an opportunity than a threat, provided that companies and governments prepare workers for the change.
Firstly, AI can take over repetitive tasks and leave more time for creative work. For instance, an accountant who no longer has to enter data manually can spend more time advising clients. Furthermore, AI tools can make small businesses more competitive, because they can now use technology that used to be available only to large companies.
On the other hand, it would be naive to ignore the risks. Workers whose tasks are easily automated could lose their jobs, and not everyone will find it easy to learn new skills. If governments did not invest in training, inequality would probably increase.
In conclusion, I believe that AI will create more opportunities than problems, but only if we make sure that the benefits are shared and that people have the chance to adapt.`},
 {id:'b2-w-propuesta',tipo:'propuesta',titulo:'Propuesta para tu jefe',consigna:'Tu equipo quiere trabajar desde casa dos días por semana. Escribe una propuesta formal a tu gerente: la situación actual, la propuesta, los beneficios con datos o ejemplos, cómo se resolverían los posibles problemas y una recomendación final.',min:150,max:230,
  criterios:[crit('Dices el propósito al inicio (The aim of this proposal / I am writing to propose)','\\b(the (aim|purpose) of this (proposal|report)|i am writing to propose|this proposal)\\b','Abre con The aim of this proposal is to….'),crit('Usas encabezados o párrafos ordenados (Current situation, Benefits…)','(current situation|proposal|benefits|possible (problems|issues|concerns)|recommendation)','Organiza con encabezados: Current situation, Benefits, Recommendation.'),
   crit('Mencionas beneficios con un dato o ejemplo (%, hours, for example)','(\\d+\\s?%|\\d+ (hours|minutes|days)|for example|for instance)','Apoya con datos: we spend 2 hours commuting….'),crit('Anticipas un problema y su solución (to avoid / in order to / we could)','\\b(to avoid|in order to|we could|we would|this could be solved|to prevent)\\b','Anticipa objeciones: To avoid…, we could….'),
   crit('Haces una recomendación final (I recommend / I suggest / We recommend)','\\b(i (would )?recommend|we (would )?recommend|i (would )?suggest|we (would )?suggest)\\b','Cierra con I recommend that….'),crit('Registro formal (sin contracciones)',"\\b(i'm|you're|we're|they're|it's|that's|there's|let's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|shouldn't|couldn't|i've|we've|you've|they've|i'll|we'll|you'll|it'll|i'd|we'd|you'd|gonna|wanna)\\b",'Escribe completo: we are, it is.',{no:true})],
  modelo:`Dear Ms. Torres,
The aim of this proposal is to suggest a hybrid schedule for the data team: three days in the office and two days working from home.
Current situation
At present, all six members of the team work in the office five days a week. On average, each of us spends 90 minutes commuting every day, and most of our work is done on our laptops.
Benefits
Working from home two days a week would save each person about 3 hours a week. For example, the time could be used to finish reports without interruptions. It would also reduce the cost of parking for the company.
Possible problems
Communication could become more difficult. To avoid this, we could keep a daily 15-minute video call and choose the same office days for the whole team.
Recommendation
I recommend testing this schedule for three months and then evaluating the results together.
Kind regards,
Ana Beltrán`}
];

export default {nivel:'B2',completo:true,lecturas,escuchas,vocabulario,escritura};
