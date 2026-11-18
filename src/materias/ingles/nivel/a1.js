/* Inglés A1: práctica del nivel (ver datos.js). Temas: presentarse, familia, rutina, casa, comida, compras, ciudad,
   hora y fechas. Gramática: to be, presente simple, there is/are, can, posesivos, preposiciones e imperativos. */
import {q,crit,SALUDO,CIERRE} from './base.js';

const lecturas=[
 {id:'a1-l-perfil',titulo:'A new student',tipoTexto:'Perfil en una red de la escuela',texto:`My name is Diego Ramírez. I'm 24 years old and I'm from Cali, in Colombia. Now I live in Lima, Peru, with two friends. We have a small apartment near the university.

I'm a student. I study computer science, and I also work in a café on Saturdays and Sundays. I make coffee and sandwiches. My favorite day is Friday because I don't have classes in the afternoon.

I like music, football and video games. I don't like cold weather! I have one brother and one sister. My brother, Andrés, is a doctor in Bogotá. My sister, Camila, is 16 and she is in high school.

I'm in this English class because I want to work for an international company. Nice to meet you all!`,
  preguntas:[q('Where is Diego from? (city)',['Cali','He is from Cali','Cali, Colombia',"He's from Cali"],'I\'m from… dice el origen; I live in… dice dónde vive ahora.',{Lima:'Vive en Lima, pero es de Cali.'}),
   q('What does he study?',['computer science','He studies computer science','Computer Science'],'Busca el verbo study: I study computer science.'),
   q('When does he work in the café?',['On Saturdays and Sundays','on weekends','Saturdays and Sundays','at the weekend'],'Los días van con on: on Saturdays.',{'On Fridays':'El viernes es su día favorito; trabaja sábado y domingo.'}),
   q('What is his brother\'s job?',['doctor','a doctor','He is a doctor',"He's a doctor"],'Las profesiones llevan a/an: He\'s a doctor.'),
   q('Why is he in the English class? He wants to work for an ___ company.',['international'],'want to + verbo: I want to work for…')]},
 {id:'a1-l-anuncio',titulo:'Room for rent',tipoTexto:'Anuncio',texto:`ROOM FOR RENT – Green Street, number 45

Big, sunny room in a quiet house. The room has a bed, a desk, a chair and a large closet. There is a window with a view of the park.

In the house there are two bathrooms, a kitchen with a new fridge and a living room with a TV. There is Wi-Fi. There isn't a washing machine, but there is a laundry next door.

The house is ten minutes from the subway station and five minutes from a supermarket. Pets are not allowed. No smoking, please.

Price: $450 a month, water and electricity included.
Call or text Mrs. Brown: 555-0193 (Monday to Friday, 9 a.m. to 6 p.m.).`,
  preguntas:[q('How much is the room a month?',['$450','450 dollars','450','four hundred fifty dollars'],'Busca el precio: $450 a month.'),
   q('Is there a washing machine in the house? (yes/no)',['no',"No, there isn't",'No there is not'],'There isn\'t a… = no hay un…'),
   q('What is next door?',['a laundry','laundry','There is a laundry','a laundromat'],'next door = en la puerta de al lado.'),
   q('Can you have a cat in the house? (yes/no)',['no','No, you can\'t','No, pets are not allowed'],'Pets are not allowed = no se permiten mascotas.'),
   q('Who do you call?',['Mrs. Brown','Mrs Brown','Call Mrs. Brown'],'Al final del anuncio está el contacto.')]},
 {id:'a1-l-rutina',titulo:'A day in the life of a nurse',tipoTexto:'Artículo corto de revista',texto:`Sofía is a nurse at a children's hospital in Monterrey. Her day starts very early. She gets up at 5:30, takes a shower and has a quick breakfast: coffee and toast. She takes the bus to work at 6:15.

Sofía starts work at 7 o'clock. In the morning she checks the children, gives them medicine and talks to their parents. At 12:30 she has lunch with the other nurses in the hospital cafeteria.

She finishes work at 3 p.m. In the afternoon she goes to the gym or walks in the park with her dog, Lucky. She has dinner at 7:30 and watches a series on TV. She goes to bed at 10, because she is always tired!

"My job is difficult, but I love it," she says.`,
  preguntas:[q('What time does Sofía get up?',['At 5:30','5:30','At half past five','half past five'],'get up = levantarse. La hora va con at.',{'At 6:15':'A las 6:15 toma el autobús.'}),
   q('How does she go to work?',['by bus','She takes the bus','the bus','by bus.'],'Medios de transporte: by bus / She takes the bus.'),
   q('Where does she have lunch?',['in the hospital cafeteria','in the cafeteria','the hospital cafeteria','at the cafeteria'],'Busca lunch en el texto.'),
   q('What is her dog\'s name?',['Lucky'],'her dog, Lucky: la coma presenta el nombre.'),
   q('Why does she go to bed at 10? Because she is always ___',['tired'],'because = porque; tired = cansada.')]},
 {id:'a1-l-menu',titulo:'Mario\'s Café',tipoTexto:'Menú',texto:`MARIO'S CAFÉ – Open every day, 7 a.m. to 9 p.m.

BREAKFAST (7 to 11 a.m.)
Eggs with toast – $6
Pancakes with fruit – $7
Yogurt with honey and nuts – $5

LUNCH AND DINNER
Chicken soup – $8
Vegetable pizza – $11
Fish with rice and salad – $14
Cheese sandwich – $6 (vegetarian)

DRINKS
Coffee or tea – $2
Orange juice – $3
Water – free!

DESSERTS
Chocolate cake – $5
Ice cream (vanilla or strawberry) – $4

Kids under 6 eat free on Sundays. We don't take credit cards on the terrace.`,
  preguntas:[q('How much are the pancakes?',['$7','7 dollars','7','seven dollars'],'Busca el plato y su precio.'),
   q('What time does the café close?',['at 9 p.m.','9 p.m.','at nine','9','at 9'],'to 9 p.m. = hasta las 9 de la noche.'),
   q('Can you have eggs at 1 p.m.? (yes/no)',['no','No, you can\'t'],'El desayuno es de 7 a 11 a.m.'),
   q('Name a vegetarian dish.',['cheese sandwich','vegetable pizza','the cheese sandwich','yogurt with honey and nuts','pancakes with fruit'],'vegetarian = sin carne.'),
   q('How much is the water?',['free','It\'s free','nothing','$0'],'free = gratis (también libre).')]},
 {id:'a1-l-correo',titulo:'Welcome to the team',tipoTexto:'Correo de trabajo',texto:`Hi Paula,

Welcome to the team! I'm Kevin, the office manager. Your first day is Monday, May 6th. Please come to the main entrance at 8:45. I can meet you there.

Your desk is on the third floor, next to the window. Your computer is ready, and your password is on a card in the top drawer. Please change it on your first day.

The team has a short meeting every Monday at 10 a.m. in Room B. After the meeting, Linda can show you the building: the kitchen, the printers and the parking lot.

Lunch is from 1 to 2. There is a nice Mexican restaurant across the street!

If you have questions, call me at extension 214.

See you on Monday,
Kevin`,
  preguntas:[q('What day is Paula\'s first day?',['Monday','on Monday','Monday, May 6th','May 6th'],'Los días van con on: on Monday.'),
   q('Where is her desk? On the ___ floor.',['third','3rd'],'Números ordinales: first, second, third.'),
   q('Where is the password?',['in the top drawer','on a card in the top drawer','in the drawer','on a card'],'Busca password en el texto.'),
   q('Who can show her the building?',['Linda'],'After the meeting, Linda can show you the building.'),
   q('What is Kevin\'s extension?',['214','two one four'],'extension = número interno del teléfono.')]},
 {id:'a1-l-ciudad',titulo:'My neighborhood',tipoTexto:'Blog personal',texto:`I live in Coyoacán, a beautiful neighborhood in the south of Mexico City. The streets are old and there are a lot of trees.

In the center there is a big square with a church and two fountains. On weekends there are many families, musicians and people selling ice cream. Near the square there is a market. I buy fruit, vegetables and flowers there because they are fresh and cheap.

There are many cafés, bookstores and small museums. My favorite place is a little bookstore on Francisco Sosa Street. It has old books and a cat that sleeps on the books!

The neighborhood is quiet during the week, but it is very busy on Sundays. There isn't a subway station in the center, but there are buses and you can walk or ride a bike everywhere.`,
  preguntas:[q('Where is Coyoacán?',['in the south of Mexico City','in Mexico City','in the south','south of Mexico City'],'in the south of… = en el sur de…'),
   q('What does the writer buy at the market? (one thing)',['fruit','vegetables','flowers','fruit, vegetables and flowers'],'Busca market y lo que dice después.'),
   q('Why does the writer buy there? Because they are fresh and ___',['cheap'],'cheap = barato.'),
   q('What sleeps on the books?',['a cat','the cat','cat'],'a cat that sleeps on the books.'),
   q('Is there a subway station in the center? (yes/no)',['no',"No, there isn't",'No there is not'],'There isn\'t… = no hay…')]}
];

const escuchas=[
 {id:'a1-e-telefono',titulo:'A phone message',tipoTexto:'Mensaje de voz',texto:`Hi Carla, it's Ben. I'm calling about dinner on Friday. Can we meet at 8 instead of 7? I finish work late on Fridays. The restaurant is on King Street, next to the bank. Oh, and my sister Lucy can come too. Call me back, my number is 555-0182. Bye!`,
  preguntas:[q('What day is the dinner?',['Friday','on Friday'],'Los días con on: on Friday.'),
   q('What time do they meet now?',['at 8','8','at eight','eight'],'instead of 7 = en lugar de las 7.',{'7':'Era a las 7; ahora proponen las 8.'}),
   q('The restaurant is next to the ___',['bank'],'next to = al lado de.'),
   q('Who can come too?',['Lucy','his sister','his sister Lucy'],'my sister Lucy can come too.')]},
 {id:'a1-e-aeropuerto',titulo:'At the airport',tipoTexto:'Anuncio en el aeropuerto',texto:`Good afternoon, passengers. Flight 342 to Miami is now boarding at gate 12. Please have your passport and boarding pass ready. Passengers with children can board first. The flight to Chicago is delayed one hour. The new departure time is 5:30. Thank you.`,
  preguntas:[q('Where does flight 342 go?',['Miami','to Miami'],'Flight … to Miami = vuelo a Miami.'),
   q('What gate?',['12','gate 12','twelve'],'gate = puerta de embarque.'),
   q('Who can board first?',['passengers with children','people with children','families with children'],'board = abordar.'),
   q('What time is the new departure for Chicago?',['5:30','at 5:30','half past five'],'delayed = retrasado; departure = salida.')]},
 {id:'a1-e-tienda',titulo:'In a clothes store',tipoTexto:'Conversación',texto:`Can I help you? — Yes, I'm looking for a jacket. — What size are you? — Medium, I think. — We have this blue jacket in medium. It's forty dollars. — Can I try it on? — Sure, the fitting rooms are over there. — Thanks. Hmm, it's perfect. Do you have it in black? — Sorry, only blue and gray. — OK, I'll take the blue one.`,
  preguntas:[q('What is the customer looking for?',['a jacket','jacket'],'I\'m looking for… = estoy buscando…'),
   q('What size?',['medium','M'],'size = talla.'),
   q('How much is the jacket?',['$40','40 dollars','forty dollars','40'],'forty = 40 (fourteen = 14).',{'14':'Dijo forty (40), no fourteen (14).'}),
   q('What color does the customer buy?',['blue','the blue one'],'I\'ll take the blue one = me llevo la azul.',{black:'No la tienen en negro: compra la azul.'})]},
 {id:'a1-e-direcciones',titulo:'How do I get to the museum?',tipoTexto:'Indicaciones en la calle',texto:`Excuse me, how do I get to the City Museum? — Oh, it's easy. Go straight on this street for two blocks. Then turn left at the traffic lights. The museum is on the right, across from the post office. It's about five minutes on foot. — Is it open today? — Yes, it's open until six. — Great, thank you!`,
  preguntas:[q('How many blocks straight?',['two','2','two blocks'],'Go straight for two blocks = sigue derecho dos cuadras.'),
   q('Where do you turn left?',['at the traffic lights','at the lights','traffic lights'],'traffic lights = semáforo.'),
   q('The museum is across from the ___',['post office'],'across from = enfrente de.'),
   q('Until what time is it open?',['six','6','until six','6 p.m.'],'until = hasta.')]},
 {id:'a1-e-familia',titulo:'Photos of my family',tipoTexto:'Conversación',texto:`Who's that? — That's my grandmother, Rosa. She's eighty-two, but she's very active. She walks every morning. — And the man with glasses? — That's my uncle Tom, my mother's brother. He's a chef. He has a restaurant in Lima. — Wow. And the little girl? — That's my niece, Emma. She's five. She loves dogs.`,
  preguntas:[q('How old is the grandmother?',['82','eighty-two','eighty two'],'eighty-two = 82.',{'28':'Dijo eighty-two: 82.'}),
   q('What does she do every morning?',['she walks','walks','She walks every morning'],'every morning = todas las mañanas.'),
   q('What is uncle Tom\'s job?',['chef','a chef','He is a chef'],'chef = cocinero profesional.'),
   q('Who is Emma? (en inglés)',['his niece','her niece','the niece','niece','my niece'],'niece = sobrina; nephew = sobrino.')]},
 {id:'a1-e-clima',titulo:'The weather this weekend',tipoTexto:'Pronóstico del tiempo en la radio',texto:`And now the weather. Today is sunny and warm, with a high of twenty-six degrees. Tomorrow, Saturday, there are clouds in the morning and rain in the afternoon, so take an umbrella. On Sunday it's cold and windy, with a high of only twelve degrees. Have a good weekend!`,
  preguntas:[q('What is the weather like today?',['sunny and warm','sunny','warm','It\'s sunny and warm'],'sunny = soleado; warm = cálido.'),
   q('What do you need on Saturday afternoon?',['an umbrella','umbrella'],'rain = lluvia; take an umbrella.'),
   q('What is the weather like on Sunday?',['cold and windy','cold','windy','It\'s cold and windy'],'windy = con viento.'),
   q('What is the high on Sunday? (degrees)',['12','twelve'],'twelve = 12 (twenty = 20).',{'20':'Dijo twelve: 12.'})]}
];

// Vocabulario: 10 temas × 40 = 400 (renglones «en | es | ejemplo»)
const vocabulario=[
 {tema:'Personas y presentaciones',icono:'👋',palabras:`hello | hola | Hello, my name is Ana.
goodbye | adiós | Goodbye, see you tomorrow.
name | nombre | What's your name?
first name | nombre de pila | My first name is Luis.
last name | apellido | My last name is Pérez.
age | edad | What's your age?
country | país | Mexico is a big country.
city | ciudad | I live in a big city.
nationality | nacionalidad | What's your nationality?
Mexican | mexicano | She is Mexican.
Colombian | colombiano | My friend is Colombian.
Spanish | español (idioma o de España) | I speak Spanish.
English | inglés | I'm learning English.
student | estudiante | I'm a student.
teacher | maestro | Our teacher is from Canada.
friend | amigo | He is my best friend.
neighbor | vecino | My neighbor has a big dog.
man | hombre | The man is tall.
woman | mujer | That woman is a doctor.
child | niño, niña | The child is six years old.
people | gente, personas | There are many people here.
boy | niño, chico | The boy plays football.
girl | niña, chica | The girl is reading.
married | casado | Are you married?
single | soltero | I'm single.
nice to meet you | mucho gusto | Hi, I'm Tom. Nice to meet you.
how are you? | ¿cómo estás? | Hi Ana, how are you?
I'm fine, thanks | bien, gracias | I'm fine, thanks. And you?
please | por favor | A coffee, please.
thank you | gracias | Thank you for your help.
you're welcome | de nada | You're welcome!
excuse me | disculpe, con permiso | Excuse me, where is the bank?
sorry | perdón, lo siento | Sorry, I'm late.
address | dirección | What's your address?
phone number | número de teléfono | Can I have your phone number?
email address | correo electrónico | My email address is ana@mail.com.
birthday | cumpleaños | My birthday is in May.
to live | vivir | I live in Puebla.
to come from | ser de, venir de | I come from Chile.
to spell | deletrear | Can you spell your name, please?`},
 {tema:'Familia',icono:'👪',palabras:`family | familia | I have a big family.
mother | madre | My mother is a nurse.
father | padre | My father works in a bank.
parents | padres | My parents live in Lima.
brother | hermano | I have one brother.
sister | hermana | My sister is twelve.
son | hijo | Their son is a baby.
daughter | hija | Her daughter studies law.
husband | esposo | Her husband is from Spain.
wife | esposa | His wife is a teacher.
grandmother | abuela | My grandmother cooks very well.
grandfather | abuelo | My grandfather is 80.
grandparents | abuelos | I visit my grandparents on Sundays.
uncle | tío | My uncle lives in Texas.
aunt | tía | My aunt has three cats.
cousin | primo, prima | My cousin is my best friend.
nephew | sobrino | My nephew is five.
niece | sobrina | My niece loves dogs.
baby | bebé | The baby is sleeping.
twins | gemelos | They are twins.
boyfriend | novio | Her boyfriend is a musician.
girlfriend | novia | His girlfriend is very funny.
partner | pareja | My partner and I live together.
relatives | parientes | All my relatives come at Christmas.
only child | hijo único | I'm an only child.
older | mayor | My older sister is a lawyer.
younger | menor | My younger brother is in school.
tall | alto | My father is tall.
short | bajo, corto | My mother is short.
young | joven | My aunt is young.
old | viejo, mayor | Our dog is old.
hair | cabello | She has long hair.
eyes | ojos | He has brown eyes.
glasses | lentes | My grandfather wears glasses.
beard | barba | My uncle has a beard.
friendly | amable, simpático | My neighbors are friendly.
funny | divertido, chistoso | My cousin is very funny.
shy | tímido | My sister is shy.
to look like | parecerse a | I look like my mother.
to have | tener | I have two brothers.`},
 {tema:'Rutina diaria',icono:'⏰',palabras:`to wake up | despertarse | I wake up at 6.
to get up | levantarse | I get up at 6:15.
to take a shower | bañarse | I take a shower in the morning.
to get dressed | vestirse | I get dressed quickly.
to brush your teeth | lavarse los dientes | Brush your teeth after breakfast.
to have breakfast | desayunar | I have breakfast at 7.
to have lunch | comer, almorzar | We have lunch at 2.
to have dinner | cenar | They have dinner at 8.
to go to work | ir a trabajar | I go to work by bus.
to go to school | ir a la escuela | My son goes to school at 8.
to start | empezar | Work starts at 9.
to finish | terminar | I finish work at 5.
to go home | ir a casa | I go home at 6.
to cook | cocinar | My husband cooks dinner.
to clean | limpiar | I clean the house on Saturday.
to do homework | hacer la tarea | The kids do homework after school.
to watch TV | ver la tele | We watch TV after dinner.
to read | leer | I read before bed.
to go to bed | acostarse | I go to bed at 11.
to sleep | dormir | Babies sleep a lot.
to relax | descansar, relajarse | I relax on Sundays.
to walk | caminar | I walk to work.
to drive | manejar | My father drives a taxi.
to work | trabajar | She works in an office.
to study | estudiar | I study English at night.
to listen to music | escuchar música | I listen to music on the bus.
to go shopping | ir de compras | We go shopping on Saturday.
to exercise | hacer ejercicio | I exercise three times a week.
always | siempre | I always drink coffee.
usually | normalmente | I usually walk to work.
often | a menudo, seguido | We often eat out.
sometimes | a veces | I sometimes cook.
never | nunca | I never get up late.
every day | todos los días | I study every day.
in the morning | en la mañana | I run in the morning.
in the afternoon | en la tarde | I work in the afternoon.
in the evening | en la noche (temprano) | We eat in the evening.
at night | en la noche | I read at night.
on weekends | los fines de semana | I sleep late on weekends.
early | temprano | I get up early.`},
 {tema:'La casa',icono:'🏠',palabras:`house | casa | They live in a big house.
apartment | departamento | I live in a small apartment.
home | hogar, casa | I'm at home.
room | cuarto | My room is small.
bedroom | recámara | The bedroom has a big bed.
bathroom | baño | The bathroom is upstairs.
kitchen | cocina | We eat in the kitchen.
living room | sala | The TV is in the living room.
dining room | comedor | We have dinner in the dining room.
garden | jardín | There are flowers in the garden.
garage | garaje, cochera | The car is in the garage.
floor | piso | My apartment is on the third floor.
stairs | escaleras | Take the stairs.
door | puerta | Please close the door.
window | ventana | Open the window, please.
wall | pared | The walls are white.
bed | cama | My bed is comfortable.
table | mesa | The keys are on the table.
chair | silla | There are four chairs.
sofa | sofá | The cat is on the sofa.
desk | escritorio | My laptop is on the desk.
lamp | lámpara | Turn on the lamp.
closet | clóset | My clothes are in the closet.
shelf | repisa, estante | The books are on the shelf.
fridge | refrigerador | The milk is in the fridge.
stove | estufa | Don't touch the stove.
sink | fregadero, lavabo | The dishes are in the sink.
shower | regadera | The shower is very small.
mirror | espejo | There's a mirror in the bathroom.
key | llave | Where are my keys?
neighborhood | barrio, colonia | My neighborhood is quiet.
to rent | rentar | I rent an apartment.
in | en, dentro de | The milk is in the fridge.
on | sobre, en | The book is on the table.
under | debajo de | The cat is under the bed.
next to | al lado de | The lamp is next to the bed.
between | entre | The sofa is between the windows.
in front of | enfrente de | The car is in front of the house.
behind | detrás de | The garden is behind the house.
there is / there are | hay | There is a park near my house.`},
 {tema:'Comida y bebida',icono:'🍽️',palabras:`food | comida | I love Mexican food.
breakfast | desayuno | Breakfast is ready.
lunch | comida, almuerzo | What's for lunch?
dinner | cena | Dinner is at eight.
water | agua | Can I have some water?
coffee | café | I drink coffee every morning.
tea | té | Would you like some tea?
milk | leche | I need milk for my coffee.
juice | jugo | Orange juice, please.
bread | pan | We need bread.
rice | arroz | I eat rice with beans.
beans | frijoles | Beans are good for you.
egg | huevo | I have two eggs for breakfast.
cheese | queso | I love cheese.
meat | carne | I don't eat meat.
chicken | pollo | Chicken soup is my favorite.
fish | pescado | We eat fish on Fridays.
vegetables | verduras | Eat your vegetables.
fruit | fruta | I eat fruit every day.
apple | manzana | An apple a day.
banana | plátano | Bananas are cheap here.
orange | naranja | This orange is sweet.
potato | papa | French fries are made of potatoes.
tomato | jitomate, tomate | Put tomato in the salad.
onion | cebolla | I don't like onion.
salad | ensalada | A salad, please.
soup | sopa | The soup is hot.
sandwich | sándwich | I have a sandwich for lunch.
cake | pastel | Happy birthday! Here's your cake.
sugar | azúcar | No sugar, thanks.
salt | sal | Pass the salt, please.
hungry | con hambre | I'm hungry.
thirsty | con sed | I'm thirsty.
delicious | delicioso | This pizza is delicious.
sweet | dulce | The cake is very sweet.
spicy | picante | Is it spicy?
menu | menú | Can I see the menu?
the bill / the check | la cuenta | Can we have the bill, please?
I'd like… | quisiera… | I'd like a coffee, please.
to order | pedir (en un restaurante) | Are you ready to order?`},
 {tema:'Compras y dinero',icono:'🛒',palabras:`store | tienda | The store opens at 9.
supermarket | supermercado | I go to the supermarket on Mondays.
market | mercado | The market sells fresh fruit.
mall | centro comercial | Let's go to the mall.
pharmacy | farmacia | Is there a pharmacy near here?
bakery | panadería | The bakery has fresh bread.
money | dinero | I don't have money.
cash | efectivo | Do you take cash?
credit card | tarjeta de crédito | Can I pay by credit card?
price | precio | What's the price?
cheap | barato | This shirt is cheap.
expensive | caro | The phone is expensive.
How much is it? | ¿cuánto cuesta? | How much is this jacket?
to buy | comprar | I want to buy shoes.
to sell | vender | They sell vegetables.
to pay | pagar | I pay with cash.
to try on | probarse (ropa) | Can I try it on?
size | talla | What size are you?
small | chico | This shirt is too small.
medium | mediano | I'm a medium.
large | grande | Do you have it in large?
clothes | ropa | I need new clothes.
shirt | camisa | A white shirt.
T-shirt | playera | This T-shirt is ten dollars.
pants | pantalón | These pants are long.
jeans | jeans, pantalón de mezclilla | I wear jeans every day.
dress | vestido | She has a red dress.
skirt | falda | The skirt is short.
jacket | chamarra | Take a jacket. It's cold.
shoes | zapatos | My shoes are new.
sneakers | tenis | I run in my sneakers.
bag | bolsa | Do you need a bag?
receipt | recibo, ticket | Here's your receipt.
change | cambio | Here's your change.
sale | rebaja, oferta | The shoes are on sale.
open | abierto | The store is open.
closed | cerrado | The bank is closed on Sunday.
color | color | What color do you want?
I'm just looking | solo estoy viendo | No, thanks. I'm just looking.
I'll take it | me lo llevo | It's perfect. I'll take it.`},
 {tema:'La ciudad y los lugares',icono:'🏙️',palabras:`street | calle | I live on Juárez Street.
avenue | avenida | The bank is on Reforma Avenue.
square | plaza | There is a fountain in the square.
park | parque | We walk in the park.
bank | banco | The bank opens at 9.
hospital | hospital | The hospital is near here.
school | escuela | My school is big.
church | iglesia | The church is very old.
museum | museo | The museum is free on Sundays.
library | biblioteca | I study at the library.
restaurant | restaurante | Let's go to a restaurant.
hotel | hotel | Our hotel is downtown.
post office | oficina de correos | The post office is closed.
police station | estación de policía | Where is the police station?
bus stop | parada de autobús | The bus stop is over there.
subway | metro | I take the subway to work.
train station | estación de tren | The train station is far.
airport | aeropuerto | The airport is 20 minutes away.
downtown | el centro | I work downtown.
near | cerca de | My house is near the park.
far from | lejos de | The airport is far from here.
corner | esquina | The café is on the corner.
block | cuadra | Walk two blocks.
traffic lights | semáforo | Turn left at the traffic lights.
go straight | sigue derecho | Go straight for two blocks.
turn left | da vuelta a la izquierda | Turn left on Main Street.
turn right | da vuelta a la derecha | Turn right at the bank.
on the left | a la izquierda | The hotel is on the left.
on the right | a la derecha | It's on the right.
across from | enfrente de | The bank is across from the park.
bus | autobús | I take the bus.
taxi | taxi | Let's take a taxi.
car | coche, carro | My car is blue.
bike | bicicleta | I ride my bike to work.
on foot | a pie | It's ten minutes on foot.
map | mapa | Do you have a map?
ticket | boleto | One ticket, please.
busy | concurrido, ocupado | The streets are busy.
quiet | tranquilo | My street is quiet.
Where is…? | ¿dónde está…? | Where is the station?`},
 {tema:'Hora, días y fechas',icono:'📅',palabras:`time | hora, tiempo | What time is it?
o'clock | en punto | It's three o'clock.
half past | y media | It's half past six.
a quarter past | y cuarto | It's a quarter past two.
a quarter to | cuarto para | It's a quarter to nine.
minute | minuto | Wait a minute.
hour | hora | The class is one hour.
day | día | Have a nice day!
week | semana | I work five days a week.
month | mes | My birthday is next month.
year | año | I'm 30 years old.
today | hoy | Today is Monday.
tomorrow | mañana | See you tomorrow.
yesterday | ayer | Yesterday was Sunday.
morning | mañana | Good morning!
afternoon | tarde | Good afternoon!
evening | noche (temprano) | Good evening!
Monday | lunes | I go to the gym on Monday.
Tuesday | martes | The class is on Tuesday.
Wednesday | miércoles | Wednesday is a busy day.
Thursday | jueves | See you on Thursday.
Friday | viernes | Friday is my favorite day.
Saturday | sábado | I clean on Saturday.
Sunday | domingo | The store is closed on Sunday.
weekend | fin de semana | Have a good weekend!
January | enero | My birthday is in January.
April | abril | It rains in April.
July | julio | We go to the beach in July.
December | diciembre | Christmas is in December.
date | fecha | What's the date today?
first | primero | Today is May first.
second | segundo | My appointment is on the second.
third | tercero | Your desk is on the third floor.
next | próximo, siguiente | See you next week.
last | pasado, último | I was in Cancún last month.
now | ahora | I'm busy now.
later | más tarde | Call me later.
at (+ hora) | a las | The meeting is at 10.
on (+ día) | el (día) | See you on Friday.
in (+ mes) | en (mes) | It's cold in January.`},
 {tema:'Trabajo y estudios',icono:'💼',palabras:`job | trabajo, empleo | I have a new job.
work | trabajo | I go to work at 8.
office | oficina | My office is downtown.
company | empresa | I work for a big company.
boss | jefe | My boss is nice.
coworker | compañero de trabajo | My coworkers are friendly.
meeting | reunión | The meeting is at 10.
computer | computadora | My computer is slow.
laptop | laptop | I work on my laptop.
email | correo | Send me an email.
phone | teléfono | My phone is dead.
doctor | médico | She is a doctor.
nurse | enfermero | He is a nurse.
engineer | ingeniero | My brother is an engineer.
lawyer | abogado | Her father is a lawyer.
waiter | mesero | The waiter is very kind.
driver | chofer, conductor | He's a bus driver.
cook | cocinero | My uncle is a cook.
salesperson | vendedor | She is a salesperson.
developer | desarrollador | I'm a web developer.
receptionist | recepcionista | Ask the receptionist.
manager | gerente | The manager is in a meeting.
class | clase | My English class is on Monday.
university | universidad | I study at the university.
homework | tarea | I have a lot of homework.
exam | examen | The exam is tomorrow.
notebook | cuaderno | Open your notebook.
pen | pluma | Can I borrow a pen?
pencil | lápiz | Write with a pencil.
dictionary | diccionario | Use a dictionary to check the word.
printer | impresora | The printer is not working.
schedule | horario | What's your schedule this week?
free | libre | Are you free at 3?
easy | fácil | The exercise is easy.
difficult | difícil | English is not difficult.
to help | ayudar | Can you help me?
to write | escribir | Write your name here.
to call | llamar | Call me at 5.
to send | enviar | I send emails every day.
to learn | aprender | I want to learn English.`},
 {tema:'Tiempo libre, clima y salud',icono:'⚽',palabras:`hobby | pasatiempo | My hobby is cooking.
music | música | I love music.
movie | película | Let's watch a movie.
book | libro | I'm reading a good book.
game | juego | We play a game on Fridays.
sport | deporte | Football is my favorite sport.
football / soccer | futbol | I play soccer on Sundays.
to swim | nadar | I can swim.
to run | correr | I run in the park.
to dance | bailar | She dances very well.
to sing | cantar | I can't sing.
to play the guitar | tocar la guitarra | My brother plays the guitar.
to travel | viajar | I love to travel.
beach | playa | We go to the beach in summer.
mountain | montaña | The mountain is beautiful.
weather | clima | The weather is nice today.
sunny | soleado | It's sunny today.
rainy | lluvioso | It's rainy in July.
cloudy | nublado | It's cloudy and cold.
windy | con viento | It's very windy.
hot | caluroso | It's hot in Monterrey.
cold | frío | It's cold in December.
warm | cálido | It's warm today.
snow | nieve | There's snow on the mountain.
umbrella | paraguas | Take an umbrella.
summer | verano | I love summer.
winter | invierno | Winter is cold here.
spring | primavera | Spring starts in March.
fall / autumn | otoño | The leaves fall in autumn.
sick | enfermo | I'm sick today.
headache | dolor de cabeza | I have a headache.
cold (illness) | resfriado | I have a cold.
fever | fiebre | The baby has a fever.
tired | cansado | I'm very tired.
happy | feliz | I'm happy today.
sad | triste | Why are you sad?
to like | gustar | I like pizza.
to love | encantar, amar | I love this song.
favorite | favorito | Blue is my favorite color.
fun | divertido | The party is fun.`}
];

const escritura=[
 {id:'a1-w-presentate',tipo:'mensaje',titulo:'Preséntate a tu nuevo grupo',consigna:'Estás en un grupo nuevo de WhatsApp de tu clase de inglés. Escribe un mensaje para presentarte: tu nombre, de dónde eres, a qué te dedicas, una cosa que te gusta y por qué estudias inglés.',min:30,max:70,
  criterios:[SALUDO,crit('Dices tu nombre (My name is… / I\'m…)',"\\b(my name is|i'm|i am)\\b",'Usa My name is… o I\'m…'),crit('Dices de dónde eres (I\'m from…)','\\bfrom\\b','Usa I\'m from + lugar.'),
   crit('Dices a qué te dedicas (I\'m a… / I work… / I study…)',"\\b(i'm an? |i am an? |i work|i study)",'Usa I\'m a + profesión, o I work in… / I study….'),crit('Dices algo que te gusta (I like / I love)','\\bi (like|love|enjoy)\\b','Usa I like + algo.'),
   crit('Explicas por qué estudias inglés (because / I want to)','\\b(because|i want to|i need)\\b','Usa because… o I want to + verbo.')],
  modelo:`Hi everyone!
My name is Laura and I'm from Puebla, Mexico. I'm a graphic designer and I work from home. I love movies and cooking. I'm learning English because I want to work with international clients.
See you in class!`},
 {id:'a1-w-invitacion',tipo:'mensaje',titulo:'Invita a un amigo',consigna:'Escribe un mensaje a tu amigo Sam para invitarlo a tu cumpleaños: qué día, a qué hora, dónde y qué tiene que llevar. Pídele que te confirme.',min:30,max:60,
  criterios:[SALUDO,crit('Dices el día (on + día)','\\bon (monday|tuesday|wednesday|thursday|friday|saturday|sunday)','Los días van con on: on Saturday.'),crit('Dices la hora (at + hora)','\\bat \\d','Las horas van con at: at 7.'),
   crit('Dices el lugar (at my house / in…)','\\b(at my|at the|in the|in my|at home)\\b','Di dónde: at my house, at the park…'),crit('Le pides que confirme (Let me know / Can you come?)','(let me know|can you come|are you coming|tell me)','Termina con Let me know! o Can you come?'),CIERRE],
  modelo:`Hi Sam!
My birthday party is on Saturday at 7 p.m. at my house. Can you bring some drinks? There is food and music.
Let me know if you can come!
See you,
Carlos`},
 {id:'a1-w-casa',tipo:'descripcion',titulo:'Describe tu casa',consigna:'Escribe un párrafo corto para un intercambio de casas: describe tu casa o departamento (cuartos, qué hay y dónde está) y tu barrio. Usa there is / there are y al menos dos preposiciones de lugar.',min:40,max:90,
  criterios:[crit('Usas there is / there are','\\bthere (is|are|\'s)\\b','Para decir qué hay: There is a… / There are two….'),crit('Usas preposiciones de lugar (next to, near, in front of, between…)','\\b(next to|near|in front of|between|behind|across from|on the corner)\\b','Di dónde está: next to, near, in front of….'),
   crit('Nombras al menos tres partes de la casa','(kitchen|bedroom|bathroom|living room|garden|dining room|garage|balcony)[\\s\\S]*(kitchen|bedroom|bathroom|living room|garden|dining room|garage|balcony)[\\s\\S]*(kitchen|bedroom|bathroom|living room|garden|dining room|garage|balcony)','Nombra cuartos: kitchen, bedroom, bathroom….'),
   crit('Usas un adjetivo para describir (big, small, quiet, sunny…)','\\b(big|small|quiet|sunny|new|old|nice|beautiful|modern|comfortable|cozy|bright)\\b','Agrega adjetivos: a small kitchen, a quiet street.'),crit('Sin «there are» con algo en singular','there are an? \\b','Con una cosa: There is a…; con varias: There are two….',{no:true})],
  modelo:`I live in a small apartment in Guadalajara. There are two bedrooms, a bathroom and a kitchen with a big window. The living room is next to the kitchen. There is a nice park in front of my building and a supermarket near my house. The street is quiet and sunny.`}
];

export default {nivel:'A1',completo:true,lecturas,escuchas,vocabulario,escritura};
