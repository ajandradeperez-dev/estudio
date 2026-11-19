/* Simulacro corto A1 (contenido original). */
import {op,es,crit,SALUDO} from './base.js';

export default [{
  id:'a1-1',nivel:'A1',titulo:'Simulacro A1 · Un día en la ciudad',corto:true,
  minutos:{lectura:10,escritura:8,escucha:8,habla:5},
  lectura:[
   {id:'l1',consigna:'Lee el aviso y elige la respuesta correcta.',texto:`SWIMMING POOL
Open Monday to Saturday, 7 a.m. – 8 p.m.
Closed on Sundays.
Children under 10 must swim with an adult.
Please bring a towel.`,
    preguntas:[op('When is the pool closed?',['On Saturdays','On Sundays','In the morning'],1,'Closed on Sundays = cerrado los domingos.'),
     op('A child of 8 can swim…',['alone','with an adult','only on Sundays'],1,'must swim with an adult = debe nadar con un adulto.')]},
   {id:'l2',consigna:'Lee el mensaje y responde con una o dos palabras.',texto:`Hi Sara,
I'm at the supermarket. Do we need milk? I have bread, eggs and apples. I can buy pizza for dinner. Is that OK? I'm home at six.
Love, Mom`,
    preguntas:[es('Where is Mom?',['at the supermarket','the supermarket','supermarket'],'I\'m at the supermarket.'),
     es('What can she buy for dinner?',['pizza','a pizza'],'I can buy pizza for dinner.'),
     es('What time is she home?',['at six','six','6','at 6',"six o'clock"],'I\'m home at six.')]},
   {id:'l3',consigna:'Lee el texto y elige verdadero o falso.',texto:`My name is Tom. I live in a small house with my parents and my sister, Lily. Lily is twelve. We have a cat called Max. My father is a taxi driver and my mother works in a school. I go to school by bike.`,
    preguntas:[op('Tom has a brother.',['True','False'],1,'Tiene una hermana (sister), no un hermano.'),
     op('The cat\'s name is Max.',['True','False'],0,'a cat called Max.'),
     op('Tom\'s mother is a taxi driver.',['True','False'],1,'El taxista es el papá; la mamá trabaja en una escuela.')]}
  ],
  escritura:[
   {id:'w1',tipo:'mensaje',consigna:'Escribe un mensaje corto a tu amigo Leo: dónde estás, qué haces y a qué hora llegas a casa.',min:15,max:40,
    criterios:[SALUDO,crit('Dices dónde estás (I\'m at / in…)',"\\b(i'm|i am) (at|in)\\b",'Usa I\'m at the… / I\'m in….'),crit('Dices una hora (at + hora)','\\bat \\d|\\bat (one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\\b','Las horas van con at: at 7.')],
    modelo:`Hi Leo,
I'm at the park with my sister. We are playing football. I'm home at six. See you later!
Ana`}
  ],
  escucha:[
   {id:'e1',consigna:'Escucha y responde. Puedes oírlo dos veces.',audio:[['A','Excuse me, what time is the next bus to the airport?'],['B','The next bus is at ten fifteen.'],['A','Ten fifteen? Thank you.']],
    preguntas:[op('What time is the next bus?',['10:50','10:15','10:05'],1,'ten fifteen = 10:15; ten fifty = 10:50.')]},
   {id:'e2',consigna:'Escucha y responde.',audio:[['A','Can I have a coffee, please?'],['B','Small or large?'],['A','Large, please. And a chocolate cake.'],['B','That\'s six dollars.']],
    preguntas:[op('What does she order?',['A small coffee and a cake','A large coffee and a cake','A large tea'],1,'Large, please. And a chocolate cake.'),
     es('How much is it? (dólares)',['6','six','$6','six dollars'],'That\'s six dollars.')]},
   {id:'e3',consigna:'Escucha y responde.',audio:[['A','Is this your bag?'],['B','No, my bag is black. That bag is blue.'],['A','Oh, it\'s Peter\'s bag then.']],
    preguntas:[es('What color is her bag?',['black'],'my bag is black.'),es('Whose is the blue bag?',["Peter's",'Peter','peters'],'it\'s Peter\'s bag.')]}
  ],
  habla:{partes:[
   {tipo:'entrevista',titulo:'Preguntas personales',preguntas:['What\'s your name?','Where are you from?','What do you do?','What do you like doing on weekends?','Do you have any brothers or sisters?'],
    modelos:['My name is Laura.','I\'m from Mexico.','I\'m a student.','I like playing football and watching movies.','Yes, I have one brother.'],segundos:20}
  ]}
}];
