/* Temas de Inglés por nivel MCER (A1→B2), en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Referencia: Marco Común Europeo (MCER) y los exámenes de Cambridge English (A2 Key, B1 Preliminary, B2 First); gramática
   según Murphy, «Essential Grammar in Use» (A1–A2) y «English Grammar in Use» (B1–B2). Método de Nation (metodo.md).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies (las lecciones viven en temas/<tema>/).
   Hablar (unidades con escucha → chunks → forma → pronunciación → diálogo → fluidez → jefe) es la sección hablar/: el tema
   "Hablar y escuchar" la enlaza. Cada nodo: ref (temario) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'a1',titulo:'A1 · Primeros pasos',icono:'🌱',descripcion:'To be, presente simple, artículos, posesivos, there is, can, imperativos y el día a día.',
   referencias:['Murphy, «Essential Grammar in Use» (Cambridge) — unidades de to be, present simple, a/an/the, there is y can','Cambridge English — A1 Movers / Pre A1 Starters: listas de vocabulario'],nodos:[
    {id:'saludos',titulo:'Presentarse y saludar',gen:'en/saludos',ref:'MCER A1 – Presentarse y dar datos personales',obj:'saludar, presentarte y despedirte en situaciones reales.'},
    {id:'numeros-fechas-hora',titulo:'Números, fechas y hora',gen:'en/numeros',ref:'MCER A1 – Números, la hora y las fechas',obj:'decir y entender números, precios, la hora y las fechas.'},
    {id:'verbo-to-be',gen:'en/to-be',ref:'MCER A1 · Murphy EGU – Verbo to be',obj:'presentarte y describir personas y cosas con am, is y are.'},
    {id:'presente-simple',gen:'en/presente-simple',ref:'MCER A1 · Murphy EGU – Present simple',obj:'hablar de rutinas y hechos con el presente simple (incluida la -s de tercera persona).'},
    {id:'articulos',titulo:'Artículos: a, an, the',gen:'en/articulos',ref:'MCER A1 · Murphy EGU – a/an y the',obj:'elegir entre a, an, the o nada antes de un sustantivo.'},
    {id:'plurales',titulo:'Plurales',gen:'en/plurales',ref:'MCER A1 · Murphy EGU – Plurales',obj:'formar plurales regulares e irregulares.'},
    {id:'posesivos',titulo:'Posesivos: my, your, ’s',gen:'en/posesivos',ref:'MCER A1 · Murphy EGU – Posesivos y ’s',obj:'decir de quién es algo con my, his, her, their, ’s y mine.'},
    {id:'there-is-there-are',gen:'en/there-is',ref:'MCER A1 · Murphy EGU – There is / there are',obj:'decir qué hay en un lugar con there is y there are.'},
    {id:'can',gen:'en/can',ref:'MCER A1 · Murphy EGU – Can / can’t',obj:'hablar de habilidades y pedir permiso con can.'},
    {id:'preposiciones',titulo:'Preposiciones de lugar y tiempo',gen:'en/preposiciones',ref:'MCER A1 · Murphy EGU – at/on/in (tiempo y lugar)',obj:'usar at, on e in con horas, días, fechas y lugares.'},
    {id:'imperativos',titulo:'Imperativos e instrucciones',gen:'en/imperativos',ref:'MCER A1 · Murphy EGU – Imperativos',obj:'dar y entender instrucciones e indicaciones, y proponer con let’s.'},
    {id:'familia',titulo:'Familia y personas',gen:'en/familia',ref:'Cambridge A1 – Vocabulario: familia',obj:'hablar de tu familia y describir a una persona.'},
    {id:'rutinas',titulo:'Rutinas diarias',gen:'en/rutinas',ref:'Cambridge A1 – Vocabulario: rutina diaria',obj:'contar tu rutina diaria con las expresiones fijas más comunes.'},
    {id:'casa',titulo:'La casa',gen:'en/casa',ref:'Cambridge A1 – Vocabulario: casa y muebles',obj:'nombrar las partes de la casa y decir dónde están las cosas.'},
    {id:'comida-compras',titulo:'Comida y compras',gen:'en/comida',ref:'Cambridge A1 – Vocabulario: comida, tiendas y precios',obj:'pedir en un restaurante, preguntar precios y pagar.'},
    {id:'ciudad',titulo:'La ciudad',gen:'en/ciudad',ref:'Cambridge A1 – Vocabulario: lugares de la ciudad',obj:'preguntar y dar indicaciones para llegar a un lugar.'},
    {id:'chunks',titulo:'Frases hechas (chunks)',gen:'en/chunks',ref:'Nation – Frases hechas de alta frecuencia (A1)',obj:'usar las frases hechas más frecuentes del día a día.'},
    {id:'lecturas-a1',titulo:'Lecturas graduadas A1',gen:'en/lecturas-a1',ref:'MCER A1 – Comprensión de lectura',obj:'entender textos cortos (anuncios, notas, perfiles) y encontrar datos.'},
    {id:'escritura-a1',titulo:'Escritura guiada A1: mensajes cortos',gen:'en/escritura-a1',ref:'MCER A1 – Expresión escrita: notas y mensajes',obj:'escribir mensajes cortos con saludo, mensaje y cierre.'}
  ]},
  {id:'a2',titulo:'A2 · Contar y planear',icono:'🌿',descripcion:'Pasado, presente continuo, futuro, comparativos, contables, frecuencia, should; viajes, salud y trabajo.',
   referencias:['Murphy, «Essential Grammar in Use» — unidades de past simple, present continuous, going to/will y comparativos','Cambridge English — A2 Key: lista de vocabulario y formato del examen'],nodos:[
    {id:'pasado-simple',gen:'en/pasado-simple',ref:'Cambridge A2 Key · Murphy EGU – Past simple (regular e irregular)',obj:'contar lo que pasó con el pasado simple de verbos regulares e irregulares.'},
    {id:'presente-continuo',gen:'en/presente-continuo',ref:'Cambridge A2 Key · Murphy EGU – Present continuous',obj:'describir lo que pasa ahora y planes cercanos con el presente continuo.'},
    {id:'futuro-going-to-will',gen:'en/futuro',ref:'Cambridge A2 Key · Murphy EGU – Going to y will',obj:'hablar de planes con going to y de decisiones o predicciones con will.'},
    {id:'comparativos',titulo:'Comparativos y superlativos',gen:'en/comparativos',ref:'Cambridge A2 Key · Murphy EGU – Comparativos y superlativos',obj:'comparar cosas y personas con -er, more, the most y as … as.'},
    {id:'contables',titulo:'Contables e incontables',gen:'en/contables',ref:'Cambridge A2 Key · Murphy EGU – Countable/uncountable, some/any, much/many',obj:'usar much, many, some, any y a few con contables e incontables.'},
    {id:'adverbios-frecuencia',titulo:'Adverbios de frecuencia',gen:'en/frecuencia',ref:'Cambridge A2 Key · Murphy EGU – always, usually, never',obj:'decir con qué frecuencia haces algo y poner el adverbio en su lugar.'},
    {id:'should',titulo:'Should para consejos',gen:'en/should',ref:'Cambridge A2 Key · Murphy EGU – should',obj:'dar y pedir consejos con should y shouldn’t.'},
    {id:'viajes',titulo:'Viajes y direcciones',gen:'en/viajes',ref:'Cambridge A2 Key – Vocabulario: viajes, transporte y direcciones',obj:'moverte en aeropuertos, hoteles y transporte, y dar indicaciones.'},
    {id:'salud',titulo:'Salud',gen:'en/salud',ref:'Cambridge A2 Key – Vocabulario: salud y cuerpo',obj:'describir síntomas y entender al médico o al farmacéutico.'},
    {id:'vocabulario-trabajo',gen:'en/trabajo',ref:'Cambridge A2 Key – Vocabulario: trabajo',obj:'hablar de tu trabajo y tus tareas con el vocabulario básico de oficina.'},
    {id:'clima',titulo:'El clima',gen:'en/clima',ref:'Cambridge A2 Key – Vocabulario: clima',obj:'describir el clima y el pronóstico con it’s.'},
    {id:'experiencias',titulo:'Experiencias',gen:'en/experiencias',ref:'Cambridge A2 Key – Hablar de experiencias',obj:'hablar de experiencias con have you ever… y pasar al pasado para los detalles.'},
    {id:'pronunciacion-a2',titulo:'Pronunciación: -ed, -s y TH',gen:'en/pronunciacion-a2',ref:'MCER A2 – Pronunciación',obj:'pronunciar bien las terminaciones -ed y -s y el sonido TH.'},
    {id:'orden-palabras',titulo:'Orden de las palabras',gen:'en/ordenar',ref:'Cambridge A2 Key · Murphy EGU – Orden de la oración',obj:'ordenar oraciones afirmativas, negativas y preguntas.'},
    {id:'traducir',titulo:'Traducir frases cortas',gen:'en/traducir',ref:'MCER A2 – Mediación: frases cotidianas',obj:'traducir frases cotidianas cortas del español al inglés.'},
    {id:'lecturas-a2',titulo:'Lecturas graduadas A2',gen:'en/lecturas-a2',ref:'Cambridge A2 Key – Reading',obj:'entender correos, anuncios y relatos cortos sin caer en las trampas.'},
    {id:'escritura-a2',titulo:'Escritura guiada A2: correos cortos',gen:'en/escritura-a2',ref:'Cambridge A2 Key – Writing (correo de 25 palabras o más)',obj:'escribir correos cortos que respondan a 2 o 3 puntos.'}
  ]},
  {id:'b1',titulo:'B1 · Opinar y resolver',icono:'🌳',descripcion:'Present perfect, pasado continuo, condicionales, pasiva, modales, relativas, phrasal verbs, emails y entrevistas.',
   referencias:['Murphy, «English Grammar in Use» (Cambridge) — unidades de present perfect, condicionales, pasiva y modales','Cambridge English — B1 Preliminary: formato del examen y lista de vocabulario'],nodos:[
    {id:'presente-perfecto',titulo:'Present perfect vs past simple',gen:'en/presente-perfecto',ref:'Cambridge B1 Preliminary · Murphy EGU – Present perfect',obj:'elegir entre present perfect y past simple según el momento y la relación con el presente.'},
    {id:'pasado-continuo',titulo:'Pasado continuo',gen:'en/pasado-continuo',ref:'Cambridge B1 Preliminary · Murphy EGU – Past continuous',obj:'contar lo que estaba pasando en un momento del pasado y qué lo interrumpió.'},
    {id:'condicionales',titulo:'Condicionales 0, 1 y 2',gen:'en/condicionales',ref:'Cambridge B1 Preliminary · Murphy EGU – If clauses',obj:'hablar de verdades, posibilidades reales y situaciones imaginarias con if.'},
    {id:'voz-pasiva',titulo:'Voz pasiva básica',gen:'en/pasiva',ref:'Cambridge B1 Preliminary · Murphy EGU – Passive',obj:'describir procesos, avisos y noticias con la voz pasiva.'},
    {id:'modales',titulo:'Modales: must, have to, might',gen:'en/modales',ref:'Cambridge B1 Preliminary · Murphy EGU – Modales de obligación y posibilidad',obj:'expresar obligación, prohibición, lo opcional y la posibilidad.'},
    {id:'relativas',titulo:'Oraciones relativas',gen:'en/relativas',ref:'Cambridge B1 Preliminary · Murphy EGU – Relative clauses',obj:'unir ideas con who, which, that, where y whose.'},
    {id:'gerundio-infinitivo',titulo:'Gerundio vs infinitivo',gen:'en/gerundio-infinitivo',ref:'Cambridge B1 Preliminary · Murphy EGU – Verb + -ing / to',obj:'elegir entre -ing y to después de los verbos más frecuentes.'},
    {id:'phrasal-verbs',titulo:'Phrasal verbs frecuentes',gen:'en/phrasal-verbs',ref:'Cambridge B1 Preliminary – Phrasal verbs',obj:'entender y usar los phrasal verbs más comunes del trabajo y la vida diaria.'},
    {id:'estudios-trabajo-tecnologia',titulo:'Estudios, trabajo y tecnología',gen:'en/tecnologia',ref:'Cambridge B1 Preliminary – Vocabulario: educación, trabajo y tecnología',obj:'hablar de tus estudios, tu carrera y la tecnología que usas.'},
    {id:'medio-ambiente',titulo:'Medio ambiente',gen:'en/medio-ambiente',ref:'Cambridge B1 Preliminary – Vocabulario: medio ambiente',obj:'describir problemas ambientales, sus causas y soluciones.'},
    {id:'correos',titulo:'Correos formales e informales',gen:'en/correos',ref:'Cambridge B1 Preliminary – Writing: email',obj:'escribir correos con el tono correcto, formal o informal.'},
    {id:'contar-historias',titulo:'Contar historias',gen:'en/historias',ref:'Cambridge B1 Preliminary – Writing: story',obj:'contar una historia con pasado, fondo y conectores de tiempo.'},
    {id:'opinar',titulo:'Opinar y argumentar',gen:'en/opinar',ref:'MCER B1 – Expresar y justificar opiniones',obj:'dar tu opinión, estar o no de acuerdo y justificarla con razones y ejemplos.'},
    {id:'entrevista',titulo:'Entrevista de trabajo',gen:'en/entrevista',ref:'MCER B1 – Entrevistas',obj:'responder las preguntas típicas de una entrevista de trabajo.'},
    {id:'lecturas-b1',titulo:'Lecturas graduadas B1',gen:'en/lecturas-b1',ref:'Cambridge B1 Preliminary – Reading',obj:'entender artículos, reseñas y avisos, con su idea principal y sus matices.'}
  ]},
  {id:'b2',titulo:'B2 · Inglés profesional',icono:'🏔️',descripcion:'Condicional 3, reported speech, pasiva avanzada, deducción, wish, conectores, collocations e inglés de TI.',
   referencias:['Murphy, «English Grammar in Use» — unidades de reported speech, condicional 3, wish y modales de deducción','Cambridge English — B2 First: formato del examen'],nodos:[
    {id:'condicional-3',titulo:'Condicional 3 y mixtos',gen:'en/condicional-3',ref:'Cambridge B2 First · Murphy EGU – Third and mixed conditionals',obj:'hablar de un pasado distinto y sus consecuencias en el pasado o en el presente.'},
    {id:'reported-speech',titulo:'Reported speech',gen:'en/reported-speech',ref:'Cambridge B2 First · Murphy EGU – Reported speech',obj:'contar lo que otra persona dijo, preguntó o pidió.'},
    {id:'pasiva-avanzada',titulo:'Pasiva avanzada',gen:'en/pasiva-avanzada',ref:'Cambridge B2 First · Murphy EGU – Passive (have something done, it is said that)',obj:'usar have something done, it is said that y la pasiva con modales y tiempos perfectos.'},
    {id:'deduccion',titulo:'Modales de deducción',gen:'en/deduccion',ref:'Cambridge B2 First · Murphy EGU – must/might/can’t have',obj:'deducir con must, might y can’t sobre el presente y el pasado.'},
    {id:'wish',titulo:'Wish e if only',gen:'en/wish',ref:'Cambridge B2 First · Murphy EGU – Wish',obj:'expresar deseos, arrepentimientos y quejas con wish e if only.'},
    {id:'conectores',titulo:'Conectores',gen:'en/conectores',ref:'Cambridge B2 First – Linking words',obj:'unir ideas con conectores de contraste, causa, efecto y adición.'},
    {id:'collocations',titulo:'Collocations',gen:'en/collocations',ref:'Cambridge B2 First – Collocations',obj:'usar las combinaciones de palabras que suenan naturales (make a decision, heavy traffic).'},
    {id:'ingles-ti',titulo:'Inglés técnico de TI y ciberseguridad',gen:'en/ti',ref:'MCER B2 – Inglés profesional (TI)',obj:'entender y escribir tickets, reportes de incidentes y conversaciones técnicas.'},
    {id:'presentaciones',titulo:'Presentaciones',gen:'en/presentaciones',ref:'MCER B2 – Exposición oral',obj:'guiar una presentación con el lenguaje de apertura, transición y cierre.'},
    {id:'debates',titulo:'Debates',gen:'en/debates',ref:'MCER B2 – Interacción: debatir',obj:'defender una postura, conceder y rebatir con cortesía.'},
    {id:'audios-naturales',titulo:'Comprensión de audios naturales',gen:'en/audios',ref:'Cambridge B2 First – Listening',obj:'entender el inglés hablado real: reducciones, muletillas y expresiones.'}
  ]},
  {id:'hablar-escuchar',titulo:'Hablar y escuchar',icono:'🎙️',descripcion:'Unidades con escucha, chunks, diálogos, fluidez y jefe.',
   referencias:['Paul Nation, «What Should Every EFL Teacher Know?» — las cuatro vertientes'],nodos:[
    {ir:'hablar',titulo:'Hablar: tu mapa',icono:'🗺️'},
    {ir:'hablar/u/presentarte',titulo:'Unidad 1: Presentarte',icono:'🙋'},
    {ir:'hablar/u/rutina-trabajo',titulo:'Unidad 2: Rutina y trabajo',icono:'💼'},
    {ir:'hablar/u/pedir-comprar',titulo:'Unidad 3: Pedir y comprar',icono:'🛒'},
    {ir:'hablar/u/ciudad-viajes',titulo:'Unidad 4: Ciudad y viajes',icono:'✈️'},
    {ir:'hablar/u/contar-pasado',titulo:'Unidad 5: Contar el pasado',icono:'📖'},
    {ir:'hablar/u/trabajo-ti',titulo:'Unidad 6: Trabajo en TI',icono:'💻'},
    {ir:'hablar/ia',titulo:'Conversación con IA',icono:'✨'}
  ]},
  {id:'examenes',titulo:'Prueba de nivel y simulacros',icono:'🎓',descripcion:'Ubícate de A1 a B2 y practica con simulacros inspirados en A2 Key, B1 Preliminary y B2 First (no son exámenes oficiales).',
   referencias:['Cambridge English — descripción oficial de A2 Key, B1 Preliminary y B2 First'],nodos:[
    {id:'prueba-nivel',titulo:'Prueba de nivel A1–B2',gen:'en/prueba-nivel',ref:'MCER – Descriptores de nivel A1 a B2',obj:'ubicar tu nivel de A1 a B2 con preguntas que suben de dificultad.'},
    {id:'simulacro-a2',titulo:'Simulacro estilo A2 Key',gen:'en/simulacro-a2',ref:'Cambridge A2 Key – Formato (sin copiar exámenes reales)',obj:'practicar el tipo de tareas de un examen A2 (sin ser un examen oficial).'},
    {id:'simulacro-b1',titulo:'Simulacro estilo B1 Preliminary',gen:'en/simulacro-b1',ref:'Cambridge B1 Preliminary – Formato (sin copiar exámenes reales)',obj:'practicar el tipo de tareas de un examen B1 (sin ser un examen oficial).'},
    {id:'simulacro-b2',titulo:'Simulacro estilo B2 First',gen:'en/simulacro-b2',ref:'Cambridge B2 First – Formato (sin copiar exámenes reales)',obj:'practicar el tipo de tareas de un examen B2 (sin ser un examen oficial).'}
  ]}
];
