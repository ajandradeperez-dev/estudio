/* Inglés A1 (2): vocabulario en contexto (familia, rutina, casa, comida y compras, ciudad), lecturas graduadas y
   escritura guiada de mensajes cortos. Mismo formato que ingles-a1.js (6 plantillas por habilidad). */
import {bancoEn,K,I,en} from './extensiones/ingles-base.js';

/* ---------- Familia y personas ---------- */
const familia=bancoEn({titulo:'Familia y personas',
  explicacion:'Familia: <i>mother / mom, father / dad, parents</i> (padres: ¡no «fathers»!), <i>brother, sister, son, daughter, husband, wife, grandparents, cousin, aunt, uncle</i>. Para describir: <i>She\'s tall</i>, <i>He has brown eyes</i> (los ojos y el pelo van con <b>have</b>), <i>He\'s 40</i>. Para preguntar: <i>Do you have any brothers or sisters?</i>',
  alternativa:'Truco: <i>parents</i> son papá y mamá; <i>relatives</i> son todos los parientes. Y para describir el cuerpo, piensa «tiene»: <i>She has long hair</i>; para cómo es: <i>She is friendly</i>.',
  referencia:'Cambridge A1 – Vocabulario: familia',regla:'parents = papá y mamá; relatives = parientes. Ojos y pelo con have (She has blue eyes); edad y carácter con be (She\'s 30, She\'s friendly).',pista:'¿Es pariente, descripción física o carácter?',
  tarjetas:[['«Mis padres» (papá y mamá)','my parents (no «my fathers»).'],['«Tiene ojos cafés»','She has brown eyes (con have).'],['primo / prima','cousin (igual para los dos).'],['«¿Tienes hermanos?»','Do you have any brothers or sisters?']],
  plantillas:{
    b1:K.dice([I('mis padres','my parents',[['my fathers','«Padres» (papá y mamá) es parents; fathers son varios papás.'],['my relatives','relatives son todos los parientes.']]),I('mi primo','my cousin',[['my primo','primo es cousin.']]),
      I('mis abuelos','my grandparents',[['my grandfathers','«Abuelos» (los dos) es grandparents.']]),I('mi esposa','my wife',[['my esposa','esposa es wife.'],['my woman','Para tu esposa se dice wife.']]),
      I('mi tía','my aunt',[['my uncle','uncle es tío; tía es aunt.']]),I('mis hijos','my children',[['my sons','sons son solo hijos varones; hijos e hijas: children.'],['my childs','El plural de child es children.']])]),
    b2:K.significa([I('My sister-in-law',['mi cunada','mi cuñada']),I('My nephew',['mi sobrino'],[['mi nieto','nieto es grandson.']]),I('My grandson',['mi nieto'],[['mi sobrino','sobrino es nephew.']]),
      I('My relatives',['mis parientes','mis familiares'],[['mis padres','padres es parents.']]),I('She is an only child',['es hija unica','ella es hija unica','es hija única','no tiene hermanos']),I('He is my stepfather',['es mi padrastro','el es mi padrastro'])]),
    p1:K.completa([I('My sister ___ long black hair.','has',[['is','El pelo va con have: has.'],['have','Con she: has.']],'My sister has long black hair.'),I('My father ___ 52 years old.','is',[['has','La edad va con be: is.']],'My father is 52 years old.'),
      I('Do you have ___ brothers or sisters?','any',[['some','En preguntas: any.']],'Do you have any brothers or sisters?'),I('My grandmother is very ___. She always helps everyone. (amable)',['kind','nice','friendly'],[['kindly','Después de be va un adjetivo: kind.']],'My grandmother is very kind.'),
      I('My brother is ___ than me. (más alto)','taller',[['more tall','tall es corto: taller.']],'My brother is taller than me.'),I('Her ___ are blue. (ojos)','eyes',[['eye','Son dos: eyes.']],'Her eyes are blue.')]),
    p2:K.traduce([I('Tengo dos hermanos y una hermana.',['I have two brothers and a sister','I have two brothers and one sister','I\'ve got two brothers and a sister'],[['I have two brothers and a brother','Hermana es sister.']]),
      I('Mi mamá tiene ojos verdes.',['My mom has green eyes','My mother has green eyes','My mum has green eyes'],[['My mom is green eyes','Los ojos van con have.'],['My mom have green eyes','Con she / my mom: has.']]),
      I('Mis padres viven en Monterrey.',['My parents live in Monterrey'],[['My fathers live in Monterrey','Padres = parents.'],['My parents lives in Monterrey','parents es plural: live.']]),
      I('Mi hijo es muy tímido.',['My son is very shy'],[['My son is very timid','timid existe, pero lo natural es shy.'],['My son has very shy','Carácter con be.']]),
      I('No tengo hijos.',["I don't have any children","I don't have children","I have no children","I don't have kids","I don't have any kids"],[["I don't have childs",'El plural es children.'],["I haven't children",'Lo natural: I don\'t have any children.']])]),
    a1:K.situacion([I('Le enseñas una foto a un compañero: «este es mi hermano mayor, se llama Iván».',["This is my older brother. His name is Iván","This is my older brother, his name is Ivan","This is my big brother. His name is Iván","This is my older brother. His name's Ivan"],[["This is my older brother. Her name is Iván",'Ivan es hombre: his.'],["This is my bigger brother. His name is Iván",'«Mayor» (edad) es older o big brother.']]),
      I('Te preguntan por tu familia. Di que eres hija única.',["I'm an only child"],[["I'm an unique daughter",'Se dice I\'m an only child.']]),
      I('Describes a tu jefa a un cliente que va a buscarla: es alta y tiene pelo corto.',["She's tall and she has short hair","She is tall and has short hair","She's tall with short hair"],[["She's tall and she is short hair",'El pelo va con have.']]),
      I('Escribe en una tarjeta: «Feliz cumpleaños, abuela».',['Happy birthday, Grandma','Happy birthday Grandma','Happy birthday, Granny','Happy birthday, grandmother'],[['Happy birthday, Grandfather','grandfather es abuelo.']])]),
    a2:K.dialogo([I('A: Do you have any brothers or sisters?<br>B: (sí, una hermana menor)',['Yes, I have a younger sister','Yes, I have a little sister','Yes, one younger sister','Yes, I have one younger sister'],[['Yes, I have a smaller sister','«Menor» (edad) es younger o little.']]),
      I('A: Are you married?<br>B: (no, soy soltero)',["No, I'm single","No, I'm not. I'm single"],[["No, I'm alone",'«Soltero» es single.']]),
      I('A: What does your father look like?<br>B: (es bajo y tiene barba)',["He's short and he has a beard","He is short and has a beard","He's short with a beard"],[["He's short and he is a beard",'La barba va con have.']]),
      I('A: How old is your daughter?<br>B: (tiene siete años)',["She's seven","She's seven years old","She is 7","She's 7 years old"],[["She has seven years",'La edad con be.']])])
  }});

/* ---------- Rutinas diarias ---------- */
const rutinas=bancoEn({titulo:'Rutinas diarias',
  explicacion:'Rutina en presente simple: <i>I get up at 6</i>, <i>I have breakfast</i>, <i>I take a shower</i>, <i>I go to work</i>, <i>I get home at 7</i>, <i>I go to bed at 11</i>. Con he / she: <i>She gets up</i>, <i>he has lunch</i>. Ojo con las comidas: se usa <b>have</b> (<i>have lunch</i>), no «take» ni «eat lunch» como regla.',
  alternativa:'Muchas acciones de la rutina son pares fijos: <i>get up</i> (levantarse), <i>take a shower</i> (bañarse), <i>have breakfast</i> (desayunar), <i>go to bed</i> (acostarse). Apréndelos como bloques.',
  referencia:'Cambridge A1 – Vocabulario: rutina diaria',regla:'get up, take a shower, have breakfast/lunch/dinner, go to work, get home, go to bed. Con he/she: -s (gets up, has).',pista:'Piensa en el bloque completo.',
  tarjetas:[['desayunar','have breakfast.'],['levantarse','get up (She gets up at 7).'],['llegar a casa','get home (sin to).'],['acostarse','go to bed.']],
  plantillas:{
    b1:K.dice([I('desayunar','have breakfast',[['take breakfast','Las comidas van con have.'],['breakfast','Como acción: have breakfast.']]),I('levantarse','get up',[['raise','raise es «levantar algo»; levantarte tú: get up.']]),
      I('bañarse (en regadera)',['take a shower','have a shower','shower'],[['take a bath','bath es tina; regadera: shower.']]),I('acostarse','go to bed',[['go to the bed','Se dice go to bed, sin the.']]),
      I('llegar a casa','get home',[['arrive to home','Se dice get home (sin to).'],['get to home','home va sin to.']]),I('lavarse los dientes','brush my teeth',[['wash my teeth','Los dientes se cepillan: brush.']])]),
    b2:K.significa([I('I wake up at six',['me despierto a las seis','despierto a las seis']),I('She works out every morning',['hace ejercicio todas las mananas','ella hace ejercicio todas las mañanas','entrena todas las mañanas','entrena todas las mananas']),
      I('I commute by bus',['voy al trabajo en autobus','me traslado en autobus','voy al trabajo en camion','viajo al trabajo en autobus']),I('We have dinner at eight',['cenamos a las ocho']),I('He takes a nap after lunch',['toma una siesta despues de comer','duerme la siesta despues de comer','toma una siesta después de comer'])]),
    p1:K.completa([I('My sister ___ up at 5:30. (get)','gets',[['get','Con my sister: gets.']],'My sister gets up at 5:30.'),I('I ___ lunch at 1 p.m.','have',[['take','Las comidas van con have.'],['eat','have lunch es la forma natural.']],'I have lunch at 1 p.m.'),
      I('He ___ home at 7. (llega)','gets',[['arrives to','Lo natural: gets home.'],['get','Con he: gets.']],'He gets home at 7.'),I('They go to ___ at 11 p.m.','bed',[['the bed','Se dice go to bed.']],'They go to bed at 11 p.m.'),
      I('My dad ___ the dishes after dinner. (lava)','washes',[['wash','Con my dad: washes.'],['washs','Termina en -sh: washes.']],'My dad washes the dishes after dinner.'),I('I ___ to work by train. (voy)','go',[['goes','Con I: go.']],'I go to work by train.')]),
    p2:K.traduce([I('Me levanto a las 7 y desayuno.',['I get up at 7 and have breakfast','I get up at seven and I have breakfast','I wake up at 7 and have breakfast','I get up at 7 and I have breakfast'],[['I raise at 7 and have breakfast','Levantarse es get up.']]),
      I('Ella va al gimnasio después del trabajo.',['She goes to the gym after work'],[['She go to the gym after work','Con she: goes.'],['She goes to the gym after the work','after work, sin the.']]),
      I('Normalmente ceno en casa.',['I usually have dinner at home','Usually I have dinner at home','I usually eat dinner at home'],[['I usually take dinner at home','Las comidas con have.'],['I usually have dinner in home','«En casa» es at home.']]),
      I('Los sábados no trabajo.',["I don't work on Saturdays","On Saturdays I don't work"],[["I no work on Saturdays",'Negativo: don\'t work.']]),
      I('Mi hermano se baña en la noche.',['My brother takes a shower at night','My brother showers at night','My brother has a shower at night'],[['My brother take a shower at night','Con my brother: takes.'],['My brother takes a shower in the night','Se dice at night.']])]),
    a1:K.situacion([I('En una entrevista te preguntan a qué hora empiezas a trabajar. Empiezas a las 8:30.',['I start work at 8:30','I start work at half past eight','I start working at 8:30','I start at 8:30','I start work at eight thirty'],[['I start work in 8:30','Con la hora: at.']]),
      I('Cuéntale a un colega qué haces después del trabajo: vas a correr al parque.',['I go running in the park','I go for a run in the park','I run in the park','After work I go running in the park'],[['I go to run to the park','Lo natural: I go running in the park.']]),
      I('Explicas por qué no contestas mensajes temprano: «me despierto tarde los domingos».',['I wake up late on Sundays','I get up late on Sundays','On Sundays I wake up late'],[['I wake up late in Sundays','Con días: on Sundays.']]),
      I('Describes la rutina de tu hija: va a la escuela en autobús.',['She goes to school by bus','She takes the bus to school','My daughter goes to school by bus'],[['She goes to the school in bus','Lo natural: goes to school by bus.']])]),
    a2:K.dialogo([I('A: What time do you get up?<br>B: (a las seis y media)',['I get up at six thirty','I get up at half past six','At six thirty','At 6:30','I get up at 6:30'],[['I get up in six thirty','Con la hora: at.']]),
      I('A: Do you have breakfast at home?<br>B: (no, desayuno en la oficina)',['No, I have breakfast at the office','No, I have breakfast at work','No, I eat breakfast at the office'],[['No, I take breakfast at the office','Comidas con have.']]),
      I('A: What does your husband do in the evening?<br>B: (cocina y ve la tele)',['He cooks and watches TV','He cooks and he watches TV'],[['He cook and watch TV','Con he: cooks y watches.']]),
      I('A: When do you go to bed?<br>B: (normalmente a las once)',['Usually at eleven','I usually go to bed at eleven','I usually go to bed at 11','Usually at 11'],[['I usually go to the bed at eleven','Se dice go to bed.']])])
  }});

/* ---------- La casa ---------- */
const casa=bancoEn({titulo:'La casa',
  explicacion:'Partes de la casa: <i>bedroom, bathroom, kitchen, living room, dining room, garden / yard, garage</i>. Muebles y cosas: <i>bed, sofa / couch, table, chair, closet, fridge, stove, sink, shelf</i>. Para decir dónde está algo: <i>in the kitchen</i>, <i>on the shelf</i>, <i>next to the sofa</i>, <i>under the bed</i>, <i>between</i>, <i>in front of</i>. «Departamento» es <i>apartment</i> (EE. UU.) o <i>flat</i> (Reino Unido).',
  alternativa:'Combina dos piezas: lugar + preposición. «¿Dónde están mis llaves?» → <i>They\'re on the table, next to the lamp</i>.',
  referencia:'Cambridge A1 – Vocabulario: casa y muebles',regla:'in the kitchen (dentro), on the shelf (encima), under, next to, between, in front of. apartment / flat = departamento.',pista:'¿Dentro, encima, debajo o al lado?',
  tarjetas:[['recámara / dormitorio','bedroom.'],['refrigerador','fridge (o refrigerator).'],['«al lado de»','next to.'],['departamento','apartment (EE. UU.) / flat (Reino Unido).']],
  plantillas:{
    b1:K.dice([I('la cocina','the kitchen',[['the cuisine','cuisine es «estilo de cocina» (comida); el cuarto es kitchen.'],['the kitchenette','kitchenette es una cocina muy pequeña.']]),I('la sala','the living room',[['the sala','Sala es living room.'],['the room','room es cualquier cuarto.']]),
      I('el refrigerador',['the fridge','the refrigerator'],[['the freezer','freezer es el congelador.']]),I('el armario / clóset','the closet',[['the armary','Se dice closet (o wardrobe).']]),
      I('el departamento',['the apartment','the flat'],[['the department','department es un área de una empresa; la vivienda es apartment.']]),I('la estufa',['the stove','the cooker'],[['the heater','heater es calentador.']])]),
    b2:K.significa([I('The keys are under the sofa',['las llaves estan debajo del sofa','las llaves están debajo del sillón','las llaves estan bajo el sofa','las llaves estan debajo del sillon']),
      I('The lamp is next to the bed',['la lampara esta al lado de la cama','la lámpara está junto a la cama','la lampara esta junto a la cama']),
      I('The bathroom is upstairs',['el bano esta arriba','el baño está arriba','el bano esta en el piso de arriba']),I('There is a sink in the kitchen',['hay un fregadero en la cocina','hay una tarja en la cocina','hay un lavabo en la cocina','hay un lavaplatos en la cocina']),
      I('Our yard is small',['nuestro patio es pequeno','nuestro jardín es pequeño','nuestro patio es chico','nuestro jardin es pequeno'])]),
    p1:K.completa([I('The milk is ___ the fridge.','in',[['on','Dentro de algo: in.']],'The milk is in the fridge.'),I('Your phone is ___ the table.','on',[['in','Encima de una superficie: on.']],'Your phone is on the table.'),
      I('The cat is sleeping ___ the bed. (debajo)','under',[['below','Para «debajo de» un objeto: under.']],'The cat is sleeping under the bed.'),I('The bank is ___ the pharmacy and the café. (entre)','between',[['among','Entre dos cosas: between.']],'The bank is between the pharmacy and the café.'),
      I('There\'s a TV ___ the living room.','in',[['on','Dentro de un cuarto: in.']],"There's a TV in the living room."),I('The car is ___ the house. (enfrente)','in front of',[['in front','Falta of: in front of.'],['front of','Falta in: in front of.']],'The car is in front of the house.')]),
    p2:K.traduce([I('Mi departamento tiene dos recámaras.',['My apartment has two bedrooms','My flat has two bedrooms'],[['My department has two bedrooms','Departamento (vivienda) = apartment.']]),
      I('Las toallas están en el baño.',['The towels are in the bathroom'],[['The towels are on the bathroom','Dentro de un cuarto: in.']]),
      I('El sofá está enfrente de la tele.',['The sofa is in front of the TV','The couch is in front of the TV'],[['The sofa is in front the TV','Falta of: in front of.']]),
      I('No hay cortinas en mi cuarto.',["There aren't any curtains in my room","There are no curtains in my room","There aren't any curtains in my bedroom"],[["There isn't curtains in my room",'curtains es plural: aren\'t.']]),
      I('Mis libros están en el estante.',['My books are on the shelf'],[['My books are in the shelf','Encima de un estante: on.']])]),
    a1:K.situacion([I('Un amigo que se queda en tu casa busca las toallas. Dile que están en el clóset del baño.',["They're in the bathroom closet","The towels are in the bathroom closet","They're in the closet in the bathroom"],[["They're on the bathroom closet",'Dentro del clóset: in.']]),
      I('Publicas un anuncio para rentar tu departamento: «departamento de una recámara cerca del centro».',['One-bedroom apartment near downtown','One-bedroom apartment near the city center','One bedroom apartment near downtown','One-bedroom flat near the city centre','1-bedroom apartment near downtown'],[['Department of one bedroom near downtown','Departamento = apartment; lo natural: one-bedroom apartment.']]),
      I('Le dices al técnico dónde está el router: «está debajo del escritorio».',["It's under the desk","The router is under the desk"],[["It's below of the desk",'«Debajo de» es under.']]),
      I('Dejaste comida para tu roomie. Escríbele: «hay pizza en el refri».',["There's pizza in the fridge","There is some pizza in the fridge","There's some pizza in the fridge"],[["There's pizza on the fridge",'Dentro del refri: in.']])]),
    a2:K.dialogo([I('A: Where are my glasses?<br>B: (están en la mesa, junto a la lámpara)',["They're on the table, next to the lamp","They are on the table next to the lamp","On the table, next to the lamp"],[["They're in the table, next to the lamp",'Encima de la mesa: on.']]),
      I('A: How many rooms are there in your house?<br>B: (hay cinco)',['There are five','There are five rooms','Five'],[['There is five','Son cinco: there are.']]),
      I('A: Is the kitchen big?<br>B: (no, es bastante pequeña)',["No, it's quite small","No, it's pretty small","No, it is quite small"],[["No, is quite small",'Falta el sujeto: it\'s.']]),
      I('A: Where do you work at home?<br>B: (en el comedor)',['In the dining room','I work in the dining room'],[['On the dining room','Dentro de un cuarto: in.']])])
  }});

/* ---------- Comida y compras ---------- */
const comida=bancoEn({titulo:'Comida y compras',
  explicacion:'Pedir: <i>Can I have a coffee, please?</i> / <i>I\'d like the chicken, please</i>. Preguntar el precio: <i>How much is it?</i> (singular) / <i>How much are they?</i> (plural). Cantidades: <i>a bottle of water, a kilo of apples, a loaf of bread</i>. Pagar: <i>Can I pay by card?</i> La cuenta: <i>Can I have the check (bill), please?</i>',
  alternativa:'Para pedir casi cualquier cosa sirve un molde: <i>Can I have … , please?</i> o <i>I\'d like …</i>. No digas «I want» al mesero: suena brusco.',
  referencia:'Cambridge A1 – Vocabulario: comida, tiendas y precios',regla:'Can I have… / I\'d like… para pedir; How much is it / are they? para el precio; a bottle of, a kilo of; the check (EE. UU.) / the bill (Reino Unido).',pista:'¿Pides, preguntas el precio o pagas?',
  tarjetas:[['«La cuenta, por favor»','Can I have the check (bill), please?'],['«¿Cuánto cuesta?»','How much is it? (plural: How much are they?)'],['Pedir con cortesía','I\'d like… / Can I have…, please?'],['«Para llevar»','To go (EE. UU.) / to take away (Reino Unido).']],
  plantillas:{
    b1:K.dice([I('la cuenta, por favor',['The check, please','The bill, please','Can I have the check, please?','Can I have the bill, please?','Could I have the check, please?'],[['The account, please','account es una cuenta de banco; en el restaurante: the check / the bill.']]),
      I('¿Cuánto cuesta?',['How much is it?','How much does it cost?','How much is this?'],[['How many is it?','Para dinero: How much.'],['How much costs?','Lo natural: How much is it?']]),
      I('para llevar',['to go','to take away','takeaway'],[['for carry','Se dice to go.']]),I('una botella de agua','a bottle of water',[['a water bottle','a water bottle es la botella vacía; con agua: a bottle of water.']]),
      I('Quisiera un café',["I'd like a coffee","I would like a coffee","Can I have a coffee?","I'd like a coffee, please"],[['I want a coffee','Al pedir, I want suena brusco; usa I\'d like.']]),I('el pan','bread',[['the pan','pan es bread; pan en inglés es «sartén».']])]),
    b2:K.significa([I('Is service included?',['esta incluido el servicio','incluye la propina','la propina esta incluida','esta incluida la propina']),I("We're out of milk",['se nos acabo la leche','no tenemos leche','ya no hay leche','se acabó la leche']),
      I("It's on sale",['esta en oferta','esta en rebaja','está en oferta','tiene descuento']),I('Keep the change',['quedese con el cambio','quedate con el cambio','quédese con el cambio']),I('Anything else?',['algo mas','¿algo más?','algo mas?'])]),
    p1:K.completa([I('How much ___ these shoes?','are',[['is','shoes es plural: are.']],'How much are these shoes?'),I("I'd ___ a table for two, please.",'like',[['want','I\'d like es la fórmula de cortesía.']],"I'd like a table for two, please."),
      I('Can I pay ___ card?','by',[['with the','Lo natural: pay by card.']],'Can I pay by card?'),I('A ___ of bread, please. (una pieza / barra)',['loaf'],[['bread','Contable: a loaf of bread.']],'A loaf of bread, please.'),
      I('How ___ apples do you want?','many',[['much','apples es contable: many.']],'How many apples do you want?'),I('How ___ sugar do you need?','much',[['many','sugar es incontable: much.']],'How much sugar do you need?')]),
    p2:K.traduce([I('Quisiera la sopa y una ensalada, por favor.',["I'd like the soup and a salad, please","I would like the soup and a salad, please","Can I have the soup and a salad, please?"],[['I want the soup and a salad','Al pedir: I\'d like.']]),
      I('¿Tienen leche sin lactosa?',['Do you have lactose-free milk?','Do you have lactose free milk?','Have you got lactose-free milk?'],[['Do you have milk without lactose?','Lo natural es lactose-free milk.']]),
      I('Son 120 pesos en total.',["It's 120 pesos in total","That's 120 pesos","It's 120 pesos","That's 120 pesos in total","It's a hundred and twenty pesos"],[["Are 120 pesos in total",'Para el total: It\'s / That\'s…']]),
      I('Un kilo de tomates, por favor.',['A kilo of tomatoes, please','One kilo of tomatoes, please'],[['A kilo of tomatos, please','El plural es tomatoes.']]),
      I('No tengo efectivo.',["I don't have any cash","I don't have cash","I have no cash"],[["I don't have effective",'Efectivo (dinero) es cash.']])]),
    a1:K.situacion([I('En una cafetería pides un café americano grande para llevar.',["Can I have a large Americano to go, please?","I'd like a large Americano to go, please","A large Americano to go, please","Could I have a large Americano to go, please?","Can I get a large Americano to go, please?"],[['I want a big Americano for carry','Pide con I\'d like / Can I have y di to go.']]),
      I('En el restaurante ya terminaste. Pide la cuenta amablemente.',['Can I have the check, please?','Could I have the check, please?','Can I have the bill, please?','Could we have the check, please?','Could we have the bill, please?','Can we have the check, please?'],[['Give me the account','Suena brusco y account es cuenta de banco.']]),
      I('En una tienda te gustan unos audífonos. Pregunta cuánto cuestan.',['How much are these headphones?','How much are they?','How much do these headphones cost?','How much are these earphones?'],[['How much is these headphones?','headphones es plural: are.']]),
      I('El mesero te pregunta si quieres algo más. Di que no, que eso es todo.',["No, that's all, thanks","No, that's everything, thank you","No, thanks. That's all","That's all, thank you"],[["No, it's all",'Lo natural: That\'s all.']])]),
    a2:K.dialogo([I('A: Are you ready to order?<br>B: (sí, quisiera el pollo, por favor)',["Yes, I'd like the chicken, please","Yes, I would like the chicken, please","Yes, can I have the chicken, please?","Yes, the chicken, please"],[['Yes, I want the chicken','Al pedir: I\'d like.']]),
      I('A: Cash or card?<br>B: (con tarjeta, por favor)',['By card, please','Card, please','I will pay by card','By card'],[['With card, please','Lo natural: By card, please.']]),
      I('A: That\'s $12.50.<br>B: (aquí tiene, quédese con el cambio)',['Here you are. Keep the change','Here you go. Keep the change','Here you are, keep the change','Here you go, keep the change'],[['Here is. Keep the change','Para dar algo: Here you are / Here you go.']]),
      I('A: Would you like a bag?<br>B: (no, gracias, traigo la mía)',["No, thanks. I have my own","No, thank you, I have my own","No thanks, I've got my own","No, thanks. I brought my own"],[["No, thanks. I have mine own",'«La mía propia» es my own.']])])
  }});

/* ---------- La ciudad ---------- */
const ciudad=bancoEn({titulo:'La ciudad',
  explicacion:'Lugares: <i>bank, pharmacy / drugstore, hospital, supermarket, bus stop, train station, post office, park, museum, mall</i>. Para preguntar el camino: <i>Excuse me, where is the station?</i> / <i>Is there a pharmacy near here?</i> Indicaciones: <i>go straight, turn left / right, it\'s on the corner, it\'s across from the park, it\'s two blocks away</i>.',
  alternativa:'Para orientarte basta un molde: <i>Excuse me, how do I get to…?</i> y escuchar tres palabras: <i>straight</i> (derecho), <i>left</i> (izquierda), <i>right</i> (derecha).',
  referencia:'Cambridge A1 – Vocabulario: lugares de la ciudad',regla:'Excuse me, where is…? / How do I get to…? Go straight, turn left/right, on the corner, across from, next to, two blocks away.',pista:'¿Preguntas o das indicaciones?',
  tarjetas:[['farmacia','pharmacy (EE. UU. también drugstore).'],['«a dos cuadras»','two blocks away.'],['«enfrente de» (cruzando la calle)','across from.'],['«¿Cómo llego a…?»','How do I get to…?']],
  plantillas:{
    b1:K.dice([I('la farmacia',['the pharmacy','the drugstore','the chemist'],[['the farmacy','Se escribe pharmacy (ph = f).']]),I('la parada del autobús','the bus stop',[['the bus station','bus station es la terminal; la parada es bus stop.']]),
      I('el centro comercial','the mall',[['the commercial center','Calco: se dice the mall (o shopping center).']]),I('la librería','the bookstore',[['the library','library es biblioteca; librería es bookstore.']]),
      I('a dos cuadras','two blocks away',[['to two blocks','Se dice two blocks away.']]),I('en la esquina','on the corner',[['in the corner','En la esquina de la calle: on the corner.']])]),
    b2:K.significa([I("It's across from the park",['esta enfrente del parque','está frente al parque','esta frente al parque','esta cruzando el parque']),I('Turn right at the traffic lights',['da vuelta a la derecha en el semaforo','dobla a la derecha en el semaforo','gira a la derecha en el semáforo','gira a la derecha en el semaforo']),
      I('The library is closed on Sundays',['la biblioteca cierra los domingos','la biblioteca esta cerrada los domingos'],[['la libreria cierra los domingos','library es biblioteca, no librería.']]),I("It's a ten-minute walk",['esta a diez minutos caminando','son diez minutos caminando','está a diez minutos a pie','esta a diez minutos a pie'])]),
    p1:K.completa([I('Excuse me, how do I get ___ the museum?','to',[['at','Para el destino: get to.']],'Excuse me, how do I get to the museum?'),I('The bank is ___ the corner.','on',[['in','En la esquina de la calle: on the corner.']],'The bank is on the corner.'),
      I('Go ___ for two blocks. (derecho)','straight',[['right','right es derecha; derecho es straight.']],'Go straight for two blocks.'),I('The café is ___ to the bank. (al lado)','next',[['near','next to = al lado de.']],'The café is next to the bank.'),
      I('Is there a gas station ___ here? (cerca)','near',[['next','Para «cerca de aquí»: near here.']],'Is there a gas station near here?')]),
    p2:K.traduce([I('Disculpe, ¿dónde está la estación de tren?',['Excuse me, where is the train station?',"Excuse me, where's the train station?"],[['Excuse me, where the train station is?','En la pregunta: where is the…?']]),
      I('El hospital está a cinco minutos.',["The hospital is five minutes away","It's five minutes to the hospital"],[['The hospital is to five minutes','Se dice five minutes away.']]),
      I('Dobla a la izquierda en el semáforo.',['Turn left at the traffic lights','Turn left at the traffic light','Turn left at the light'],[['Double left at the traffic lights','«Doblar» es turn.']]),
      I('¿Hay un supermercado cerca de aquí?',['Is there a supermarket near here?','Is there a supermarket nearby?'],[['There is a supermarket near here?','En la pregunta: Is there…?']]),
      I('La biblioteca está enfrente de la escuela.',['The library is across from the school','The library is opposite the school','The library is in front of the school'],[['The bookstore is across from the school','Biblioteca es library.']])]),
    a1:K.situacion([I('Un turista te pregunta por el metro. Está a dos cuadras, a la derecha.',["It's two blocks away, on the right","It's two blocks away on the right","Go two blocks and it's on the right","It's two blocks from here, on the right"],[["It's to two blocks, on the right",'Se dice two blocks away.']]),
      I('Estás perdido en otra ciudad. Pregunta cómo llegar a la plaza principal.',['Excuse me, how do I get to the main square?','Excuse me, how can I get to the main square?','How do I get to the main square?','Excuse me, where is the main square?'],[['Excuse me, how I arrive to the main square?','Se dice How do I get to…?']]),
      I('Le explicas a un cliente dónde estacionarse: «hay un estacionamiento detrás del edificio».',["There's a parking lot behind the building","There is a car park behind the building","There's a parking lot at the back of the building"],[["There's a parking behind the building",'parking es la acción; el lugar: parking lot / car park.']]),
      I('Recomiendas un lugar a un visitante: «el museo es muy interesante y la entrada es gratis».',["The museum is very interesting and admission is free","The museum is very interesting and it's free","The museum is very interesting and entry is free","The museum is really interesting and the entrance is free"],[['The museum is very interesting and the entrance is gratis','Gratis en inglés es free.']])]),
    a2:K.dialogo([I('A: Excuse me, is the post office far?<br>B: (no, está a diez minutos caminando)',["No, it's a ten-minute walk","No, it's ten minutes on foot","No, it's ten minutes away on foot","No, it's a ten minute walk","No, it's about ten minutes walking"],[["No, it's to ten minutes",'Se dice a ten-minute walk.']]),
      I('A: Where is the nearest ATM?<br>B: (hay uno dentro del centro comercial)',["There's one in the mall","There is one inside the mall","There's one inside the mall"],[["Has one in the mall",'«Hay» es there is.']]),
      I('A: Which bus goes downtown?<br>B: (el 25, la parada está en la esquina)',["The 25. The stop is on the corner","Number 25. The bus stop is on the corner","The 25, the bus stop is on the corner"],[["The 25. The stop is in the corner",'En la esquina de la calle: on the corner.']])])
  }});

/* ---------- Lecturas graduadas A1 ---------- */
const TX={
  ana:'<p lang="en" class="lectura">Hi! My name is Ana and I\'m 28. I\'m from Guadalajara, but I live in Mexico City with my sister. I\'m a nurse at a big hospital. I work from Monday to Friday, and I start at 7 a.m. On weekends I go to the park with my dog, Toby. I love cooking, but my sister doesn\'t!</p>',
  tom:'<p lang="en" class="lectura">Tom is a web developer. He works from home. He gets up at 8, has coffee and starts work at 9. At 1 p.m. he has lunch in the kitchen. In the afternoon he has video calls with his team in Canada. He finishes at 6 and goes to the gym. He can\'t cook, so he often orders food.</p>',
  depa:'<p lang="en" class="lectura">FOR RENT. One-bedroom apartment on the second floor. There is a small kitchen, a bathroom and a living room with a big window. There isn\'t a garage, but there is a bus stop in front of the building. It\'s near a supermarket and a park. $600 a month. Call Laura: 555-0147.</p>',
  nota:'<p lang="en" class="lectura">Hi Marco, I\'m at the dentist. I can\'t go to the meeting at 4. Can you take notes for me, please? The report is on my desk, next to the computer. Please give it to Ms. Ruiz. Thanks! See you tomorrow. — Paula</p>'
};
const R1=(t,pregunta)=>`${TX[t]}${pregunta}`;
const lecturasA1=bancoEn({titulo:'Lecturas graduadas A1',
  explicacion:'Lee primero la pregunta y luego busca en el texto la palabra que responde (<i>who</i> = quién, <i>where</i> = dónde, <i>when / what time</i> = cuándo, <i>how many</i> = cuántos). Las respuestas cortas casi siempre están escritas tal cual en el texto. Si una palabra no la conoces, adivínala por el contexto antes de traducirla.',
  alternativa:'Es como buscar un dato en un folleto: no necesitas entender cada palabra. Subraya mentalmente el nombre, el lugar o el número que pide la pregunta.',
  referencia:'MCER A1 – Comprensión de lectura',regla:'Lee la pregunta, ubica la palabra clave (who, where, when, how many) y busca el dato en el texto; responde corto.',pista:'Busca la palabra clave en el texto.',
  tarjetas:[['who / where / when','quién / dónde / cuándo.'],['How many…?','¿Cuántos…? (pide un número).'],['Estrategia para leer','Lee la pregunta primero y busca el dato; no traduzcas todo.']],
  plantillas:{
    b1:{prof:'basico',enun:it=>it.q,que:'Busca el dato en el texto',como:()=>'Ubica la palabra clave de la pregunta.',porque:'El dato está escrito en el texto.',items:[
      I(R1('ana','Where is Ana from? (en inglés)'),['Guadalajara','She is from Guadalajara',"She's from Guadalajara",'From Guadalajara'],[['Mexico City','Vive en Mexico City, pero es de Guadalajara.']],null,'Dice: I\'m from Guadalajara.'),
      I(R1('ana','What is the name of her dog?'),['Toby','Her dog is Toby',"Its name is Toby",'Toby is her dog'],[],null,'my dog, Toby.'),
      I(R1('tom','What time does Tom start work?'),['At 9','At nine','9','nine',"At 9 o'clock",'He starts work at 9','He starts at nine'],[['At 8','A las 8 se levanta; empieza a las 9.']],null,'starts work at 9.'),
      I(R1('depa','How much is the apartment a month?'),['$600','600 dollars','600','six hundred dollars',"It's $600"],[],null,'$600 a month.'),
      I(R1('nota','Where is Paula?'),['At the dentist',"She's at the dentist",'the dentist','She is at the dentist'],[['At the meeting','Dice que no puede ir a la reunión.']],null,"I'm at the dentist.")]},
    b2:{prof:'basico',es:true,enun:it=>it.q,que:'Adivina por el contexto',como:()=>'Mira las palabras de alrededor.',porque:'El contexto ayuda a entender palabras nuevas.',items:[
      I(R1('ana','En el texto, ¿qué significa «nurse»?'),['enfermera','enfermero'],[['doctora','Doctora sería doctor.']]),
      I(R1('depa','En el anuncio, ¿qué significa «For rent»?'),['se renta','en renta','se alquila','en alquiler','para rentar','se arrienda'],[['en venta','En venta sería For sale.']]),
      I(R1('tom','En el texto, ¿qué significa «orders food»?'),['pide comida','ordena comida','pide comida a domicilio','pide comida por app']),
      I(R1('nota','En la nota, ¿qué significa «take notes»?'),['tomar notas','tomar apuntes','apuntar','anotar']),
      I(R1('depa','En el anuncio, ¿qué significa «second floor»?'),['segundo piso','el segundo piso','segundo nivel'])]},
    p1:{prof:'procedimiento',es:true,enun:it=>`${it.q}<br><span class="nota">Escribe <b>verdadero</b> o <b>falso</b>.</span>`,que:'Compara la frase con el texto',como:()=>'Busca la parte del texto que habla de eso.',porque:'Una sola palabra distinta (un día, un número) la vuelve falsa.',items:[
      I(R1('ana','«Ana lives alone.»'),['falso','false','f'],[['verdadero','Vive con su hermana: with my sister.']],null,'Dice: I live in Mexico City with my sister.'),
      I(R1('ana','«Ana works on Saturdays.»'),['falso','false','f'],[['verdadero','Trabaja de lunes a viernes.']],null,'from Monday to Friday.'),
      I(R1('tom','«Tom works in an office.»'),['falso','false','f'],[['verdadero','Trabaja desde casa: He works from home.']]),
      I(R1('tom','«Tom\'s team is in Canada.»'),['verdadero','true','v'],[['falso','Dice: video calls with his team in Canada.']]),
      I(R1('depa','«The apartment has a garage.»'),['falso','false','f'],[['verdadero','There isn\'t a garage.']]),
      I(R1('nota','«The report is next to the computer.»'),['verdadero','true','v'],[['falso','Dice: on my desk, next to the computer.']])]},
    p2:{prof:'procedimiento',enun:it=>it.q,que:'Busca el dato y escríbelo en inglés',como:()=>'Combina dos datos del texto si hace falta.',porque:'La respuesta sale de juntar información.',items:[
      I(R1('tom','What does Tom do after work?'),['He goes to the gym','He goes to the gym.','Goes to the gym','He goes to the gym after work'],[['He has lunch','Eso es a la 1; después del trabajo va al gym.']]),
      I(R1('depa','What is in front of the building?'),['A bus stop',"There's a bus stop",'There is a bus stop','a bus stop'],[['A park','Está cerca de un parque; enfrente hay una parada.']]),
      I(R1('nota','Who should Marco give the report to?'),['Ms. Ruiz','To Ms. Ruiz','Ms Ruiz','to Ms Ruiz'],[['Paula','Paula escribe la nota; el informe es para Ms. Ruiz.']]),
      I(R1('ana','Who doesn\'t like cooking?'),['Her sister',"Ana's sister",'Her sister doesn\'t',"Ana's sister doesn't"],[['Ana','Ana dice I love cooking.']])]},
    a1:{prof:'aplicacion',es:true,enun:it=>it.q,que:'Piensa en el propósito del texto',como:()=>'¿Para qué se escribió?',porque:'Entender la intención es parte de leer.',items:[
      I(R1('nota','¿Para qué escribe Paula la nota? (en español, corto)'),['para pedir que tome notas','pedir que tome notas','para pedirle un favor','pedir un favor','para pedir ayuda','pedirle que tome notas y entregue el informe','para pedirle que tome notas']),
      I(R1('depa','Buscas un lugar con estacionamiento. ¿Te sirve este departamento? (sí o no)'),['no'],[['si','There isn\'t a garage.']]),
      I(R1('tom','¿Por qué Tom pide comida seguido? (en español)'),['porque no sabe cocinar','no sabe cocinar','porque no puede cocinar','no puede cocinar'])]},
    a2:{prof:'aplicacion',enun:it=>it.q,que:'Responde con una frase completa',como:()=>'Usa los datos del texto.',porque:'Responder con frase completa practica la escritura.',items:[
      I(R1('depa','You want to visit the apartment. Who do you call?'),['Laura','I call Laura','Call Laura','I should call Laura'],[['Ms. Ruiz','Ms. Ruiz no aparece en el anuncio; llamas a Laura.']]),
      I(R1('ana','What does Ana do on weekends?'),['She goes to the park with her dog','She goes to the park with Toby','She goes to the park','Goes to the park with her dog'],[['She works','Los fines de semana va al parque.']]),
      I(R1('tom','Where does Tom have lunch?'),['In the kitchen','He has lunch in the kitchen','in his kitchen'],[['At a restaurant','Come en la cocina: in the kitchen.']])]}
  }});

/* ---------- Escritura guiada A1: mensajes cortos ---------- */
const escrituraA1=bancoEn({titulo:'Escritura guiada A1: mensajes cortos',
  explicacion:'Un mensaje corto tiene tres partes: saludo (<i>Hi Ana,</i>), el mensaje (lo que necesitas, en 1–3 frases) y cierre (<i>Thanks! / See you soon / Best,</i>) con tu nombre. Frases útiles: <i>I\'m running late</i>, <i>I can\'t come</i>, <i>Can you…?</i>, <i>Are you free on…?</i>, <i>Let me know</i>.',
  alternativa:'Piensa en un sándwich: pan (saludo), relleno (lo que quieres decir) y pan (despedida). Si cada frase tiene sujeto y verbo, el mensaje se entiende.',
  referencia:'MCER A1 – Expresión escrita: notas y mensajes',regla:'Saludo + mensaje (sujeto + verbo, 1–3 frases) + cierre. Útiles: I\'m running late, I can\'t…, Can you…?, Let me know.',pista:'Saludo, mensaje y cierre.',
  tarjetas:[['«Voy tarde»','I\'m running late.'],['«Avísame»','Let me know.'],['Partes de un mensaje','Saludo, mensaje (1–3 frases) y cierre con tu nombre.']],
  plantillas:{
    b1:K.dice([I('Voy tarde',["I'm running late","I'm late"],[['I go late','Se dice I\'m running late.']]),I('Avísame',['Let me know'],[['Advise me','advise es aconsejar; avisar es let me know.']]),
      I('¿Estás libre el viernes?',['Are you free on Friday?','Are you free Friday?'],[['Are you free in Friday?','Con días: on.'],['You are free on Friday?','En la pregunta el verbo va primero.']]),I('Nos vemos pronto',['See you soon'],[['We see soon','Se dice See you soon.']]),
      I('Gracias por tu ayuda',['Thanks for your help','Thank you for your help'],[['Thanks for you help','«Tu» es your.']])],{prof:'basico'}),
    b2:K.significa([I("I'm stuck in traffic",['estoy atorado en el trafico','estoy en el trafico','estoy atrapado en el tráfico','estoy atorado en el tráfico']),I('Talk to you later',['hablamos luego','hablamos despues','hablamos más tarde','te hablo luego']),
      I('Sorry for the short notice',['perdon por avisar tan tarde','perdón por avisar con poca anticipación','disculpa el aviso tan tarde','perdon por el aviso tan tarde']),I('Are we still on for tonight?',['sigue en pie lo de esta noche','seguimos con lo de hoy en la noche','sigue en pie lo de hoy'])]),
    p1:K.completa([I("Hi Leo, I'm running ___. I'll be there in 10 minutes.",'late',[['later','La expresión es running late.']],"Hi Leo, I'm running late."),I('Are you ___ for lunch tomorrow? (libre)','free',[['freedom','Se dice free.']],'Are you free for lunch tomorrow?'),
      I('Please let me ___ by Friday.','know',[['knowing','Después de let me: verbo base.']],'Please let me know by Friday.'),I('Thanks ___ the invitation!','for',[['to','Thanks for…']],'Thanks for the invitation!'),
      I("Sorry, I ___ come tonight. I'm sick.",["can't","cannot"],[["don't can",'can no usa do.']],"Sorry, I can't come tonight.")]),
    p2:K.traduce([I('Hola Sofía, ¿puedes llamarme después de las 5?',['Hi Sofía, can you call me after 5?','Hi Sofia, can you call me after five?','Hi Sofía, could you call me after 5?','Hi Sofia, can you call me after 5 p.m.?'],[['Hi Sofía, can you call to me after 5?','call va sin to.']]),
      I('Estoy enfermo hoy. No puedo ir a trabajar.',["I'm sick today. I can't go to work","I'm ill today. I can't come to work","I'm sick today. I can't come to work","I'm sick today and I can't go to work"],[["I'm sick today. I don't can go to work",'can no usa do.']]),
      I('Te veo en la entrada a las 7.',["See you at the entrance at 7","I'll see you at the entrance at 7","See you at the entrance at seven"],[['See you in the entrance in 7','En un punto y con la hora: at.']]),
      I('Gracias de nuevo. Saludos, Daniel.',['Thanks again. Best, Daniel','Thanks again. Regards, Daniel','Thank you again. Best wishes, Daniel','Thanks again. Best regards, Daniel'],[['Thanks again. Greetings, Daniel','En un mensaje se cierra con Best / Regards.']])]),
    a1:K.situacion([I('Escribe a tu compañero Raúl que llegas tarde 15 minutos. Empieza con «Hi Raúl,».',["Hi Raúl, I'm running 15 minutes late","Hi Raul, I'm running 15 minutes late","Hi Raúl, I'm 15 minutes late","Hi Raul, I'll be 15 minutes late","Hi Raúl, I'll be 15 minutes late","Hi Raul, I'm running fifteen minutes late","Hi Raúl, I'm running late. I'll be there in 15 minutes"],[["Hi Raúl, I arrive late 15 minutes",'Lo natural: I\'m running 15 minutes late / I\'ll be 15 minutes late.']]),
      I('Invita a tu amiga Kim a cenar el sábado (una pregunta).',['Kim, do you want to have dinner on Saturday?','Hi Kim, are you free for dinner on Saturday?','Kim, would you like to have dinner on Saturday?','Hi Kim, do you want to have dinner on Saturday?','Hi Kim, would you like to have dinner on Saturday?','Hi Kim, do you want to go to dinner on Saturday?'],[['Kim, you want dinner in Saturday?','Con días: on; la pregunta necesita do/would.']]),
      I('Avisa a tu jefa que hoy trabajas desde casa (una frase).',["I'm working from home today","I'm working from home today.","Today I'm working from home","I am working from home today"],[["I'm working in home today",'Se dice from home.']]),
      I('Agradece a tu vecino por cuidar a tu perro (una frase).',['Thanks for taking care of my dog','Thank you for taking care of my dog','Thanks for looking after my dog','Thank you for looking after my dog'],[['Thanks for take care of my dog','Después de for: -ing (taking).']])]),
    a2:K.dialogo([I('A (mensaje): Are you coming to the party tonight?<br>B: (sí, llego a las 9)',["Yes, I'll be there at 9","Yes, I'll be there at nine","Yes! I'll arrive at 9","Yes, I'm coming. I'll be there at 9"],[['Yes, I arrive in 9','Con la hora: at.']]),
      I('A (mensaje): Can you send me the file today?<br>B: (claro, te lo mando en una hora)',["Sure, I'll send it in an hour","Sure, I'll send it to you in an hour","Of course, I'll send it in an hour","Sure, I'll send you the file in an hour"],[["Sure, I send you in an hour",'Para una promesa: I\'ll send it.']]),
      I('A (mensaje): Where are you?<br>B: (estoy atorado en el tráfico, perdón)',["I'm stuck in traffic, sorry","Sorry, I'm stuck in traffic","I'm stuck in traffic. Sorry!"],[['I am stuck in the traffic, sorry','Lo natural: stuck in traffic, sin the.']])])
  }});

export default {'en/familia':familia,'en/rutinas':rutinas,'en/casa':casa,'en/comida':comida,'en/ciudad':ciudad,'en/lecturas-a1':lecturasA1,'en/escritura-a1':escrituraA1};
