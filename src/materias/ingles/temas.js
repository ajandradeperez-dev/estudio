/* Temas de Inglés por nivel MCER (A1→B2), en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Referencia: Marco Común Europeo (MCER) y los exámenes de Cambridge English (A2 Key, B1 Preliminary, B2 First); gramática
   según Murphy, «Essential Grammar in Use» (A1–A2) y «English Grammar in Use» (B1–B2). Método de Nation (metodo.md).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies (las lecciones viven en temas/<tema>/).
   Hablar (unidades con escucha → chunks → forma → pronunciación → diálogo → fluidez → jefe) es la sección hablar/: el tema
   "Hablar y escuchar" la enlaza. Cada nodo: ref (temario) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'a1',titulo:'A1 · Primeros pasos',icono:'🌱',descripcion:'To be, presente simple, artículos, posesivos, there is, can, imperativos y el día a día.',
   referencias:['Murphy, «Essential Grammar in Use» (Cambridge) — unidades de to be, present simple, a/an/the, there is y can','Cambridge English — A1 Movers / Pre A1 Starters: listas de vocabulario'],nodos:[
    {titulo:'Presentarse y saludar',proximo:true,ref:'MCER A1 – Presentarse y dar datos personales'},
    {titulo:'Números, fechas y hora',proximo:true,ref:'MCER A1 – Números, la hora y las fechas'},
    {id:'verbo-to-be',ref:'MCER A1 · Murphy EGU – Verbo to be',obj:'presentarte y describir personas y cosas con am, is y are.'},
    {id:'presente-simple',gen:'en/presente-simple',ref:'MCER A1 · Murphy EGU – Present simple',obj:'hablar de rutinas y hechos con el presente simple (incluida la -s de tercera persona).'},
    {id:'articulos',titulo:'Artículos: a, an, the',gen:'en/articulos',ref:'MCER A1 · Murphy EGU – a/an y the',obj:'elegir entre a, an, the o nada antes de un sustantivo.'},
    {id:'plurales',titulo:'Plurales',gen:'en/plurales',ref:'MCER A1 · Murphy EGU – Plurales',obj:'formar plurales regulares e irregulares.'},
    {titulo:'Posesivos: my, your, ’s',proximo:true,ref:'MCER A1 · Murphy EGU – Posesivos y ’s'},
    {id:'there-is-there-are',ref:'MCER A1 · Murphy EGU – There is / there are',obj:'decir qué hay en un lugar con there is y there are.'},
    {id:'can',ref:'MCER A1 · Murphy EGU – Can / can’t',obj:'hablar de habilidades y pedir permiso con can.'},
    {id:'preposiciones',titulo:'Preposiciones de lugar y tiempo',gen:'en/preposiciones',ref:'MCER A1 · Murphy EGU – at/on/in (tiempo y lugar)',obj:'usar at, on e in con horas, días, fechas y lugares.'},
    {titulo:'Imperativos e instrucciones',proximo:true,ref:'MCER A1 · Murphy EGU – Imperativos'},
    {titulo:'Familia y personas',proximo:true,ref:'Cambridge A1 – Vocabulario: familia'},
    {titulo:'Rutinas diarias',proximo:true,ref:'Cambridge A1 – Vocabulario: rutina diaria'},
    {titulo:'La casa',proximo:true,ref:'Cambridge A1 – Vocabulario: casa y muebles'},
    {titulo:'Comida y compras',proximo:true,ref:'Cambridge A1 – Vocabulario: comida, tiendas y precios'},
    {titulo:'La ciudad',proximo:true,ref:'Cambridge A1 – Vocabulario: lugares de la ciudad'},
    {id:'chunks',titulo:'Frases hechas (chunks)',gen:'en/chunks',ref:'Nation – Frases hechas de alta frecuencia (A1)',obj:'usar las frases hechas más frecuentes del día a día.'},
    {titulo:'Lecturas graduadas A1',proximo:true,ref:'MCER A1 – Comprensión de lectura'},
    {titulo:'Escritura guiada A1: mensajes cortos',proximo:true,ref:'MCER A1 – Expresión escrita: notas y mensajes'}
  ]},
  {id:'a2',titulo:'A2 · Contar y planear',icono:'🌿',descripcion:'Pasado, presente continuo, futuro, comparativos, contables, frecuencia, should; viajes, salud y trabajo.',
   referencias:['Murphy, «Essential Grammar in Use» — unidades de past simple, present continuous, going to/will y comparativos','Cambridge English — A2 Key: lista de vocabulario y formato del examen'],nodos:[
    {id:'pasado-simple',gen:'en/pasado-simple',ref:'Cambridge A2 Key · Murphy EGU – Past simple (regular e irregular)',obj:'contar lo que pasó con el pasado simple de verbos regulares e irregulares.'},
    {id:'presente-continuo',gen:'en/presente-continuo',ref:'Cambridge A2 Key · Murphy EGU – Present continuous',obj:'describir lo que pasa ahora y planes cercanos con el presente continuo.'},
    {id:'futuro-going-to-will',ref:'Cambridge A2 Key · Murphy EGU – Going to y will',obj:'hablar de planes con going to y de decisiones o predicciones con will.'},
    {titulo:'Comparativos y superlativos',proximo:true,ref:'Cambridge A2 Key · Murphy EGU – Comparativos y superlativos'},
    {titulo:'Contables e incontables',proximo:true,ref:'Cambridge A2 Key · Murphy EGU – Countable/uncountable, some/any, much/many'},
    {titulo:'Adverbios de frecuencia',proximo:true,ref:'Cambridge A2 Key · Murphy EGU – always, usually, never'},
    {titulo:'Should para consejos',proximo:true,ref:'Cambridge A2 Key · Murphy EGU – should'},
    {titulo:'Viajes y direcciones',proximo:true,ref:'Cambridge A2 Key – Vocabulario: viajes, transporte y direcciones'},
    {titulo:'Salud',proximo:true,ref:'Cambridge A2 Key – Vocabulario: salud y cuerpo'},
    {id:'vocabulario-trabajo',ref:'Cambridge A2 Key – Vocabulario: trabajo',obj:'hablar de tu trabajo y tus tareas con el vocabulario básico de oficina.'},
    {titulo:'El clima',proximo:true,ref:'Cambridge A2 Key – Vocabulario: clima'},
    {titulo:'Experiencias',proximo:true,ref:'Cambridge A2 Key – Hablar de experiencias'},
    {titulo:'Pronunciación: -ed, -s y TH',proximo:true,ref:'MCER A2 – Pronunciación'},
    {id:'orden-palabras',titulo:'Orden de las palabras',gen:'en/ordenar',ref:'Cambridge A2 Key · Murphy EGU – Orden de la oración',obj:'ordenar oraciones afirmativas, negativas y preguntas.'},
    {id:'traducir',titulo:'Traducir frases cortas',gen:'en/traducir',ref:'MCER A2 – Mediación: frases cotidianas',obj:'traducir frases cotidianas cortas del español al inglés.'},
    {titulo:'Lecturas graduadas A2',proximo:true,ref:'Cambridge A2 Key – Reading'},
    {titulo:'Escritura guiada A2: correos cortos',proximo:true,ref:'Cambridge A2 Key – Writing (correo de 25 palabras o más)'}
  ]},
  {id:'b1',titulo:'B1 · Opinar y resolver',icono:'🌳',descripcion:'Present perfect, pasado continuo, condicionales, pasiva, modales, relativas, phrasal verbs, emails y entrevistas.',
   referencias:['Murphy, «English Grammar in Use» (Cambridge) — unidades de present perfect, condicionales, pasiva y modales','Cambridge English — B1 Preliminary: formato del examen y lista de vocabulario'],nodos:[
    {id:'presente-perfecto',titulo:'Present perfect vs past simple',gen:'en/presente-perfecto',ref:'Cambridge B1 Preliminary · Murphy EGU – Present perfect',obj:'elegir entre present perfect y past simple según el momento y la relación con el presente.'},
    {titulo:'Pasado continuo',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – Past continuous'},
    {titulo:'Condicionales 0, 1 y 2',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – If clauses'},
    {titulo:'Voz pasiva básica',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – Passive'},
    {titulo:'Modales: must, have to, might',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – Modales de obligación y posibilidad'},
    {titulo:'Oraciones relativas',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – Relative clauses'},
    {titulo:'Gerundio vs infinitivo',proximo:true,ref:'Cambridge B1 Preliminary · Murphy EGU – Verb + -ing / to'},
    {titulo:'Phrasal verbs frecuentes',proximo:true,ref:'Cambridge B1 Preliminary – Phrasal verbs'},
    {titulo:'Estudios, trabajo y tecnología',proximo:true,ref:'Cambridge B1 Preliminary – Vocabulario: educación, trabajo y tecnología'},
    {titulo:'Medio ambiente',proximo:true,ref:'Cambridge B1 Preliminary – Vocabulario: medio ambiente'},
    {titulo:'Correos formales e informales',proximo:true,ref:'Cambridge B1 Preliminary – Writing: email'},
    {titulo:'Contar historias',proximo:true,ref:'Cambridge B1 Preliminary – Writing: story'},
    {titulo:'Opinar y argumentar',proximo:true,ref:'MCER B1 – Expresar y justificar opiniones'},
    {titulo:'Entrevista de trabajo',proximo:true,ref:'MCER B1 – Entrevistas'},
    {titulo:'Lecturas graduadas B1',proximo:true,ref:'Cambridge B1 Preliminary – Reading'}
  ]},
  {id:'b2',titulo:'B2 · Inglés profesional',icono:'🏔️',descripcion:'Condicional 3, reported speech, pasiva avanzada, deducción, wish, conectores, collocations e inglés de TI.',
   referencias:['Murphy, «English Grammar in Use» — unidades de reported speech, condicional 3, wish y modales de deducción','Cambridge English — B2 First: formato del examen'],nodos:[
    {titulo:'Condicional 3 y mixtos',proximo:true,ref:'Cambridge B2 First · Murphy EGU – Third and mixed conditionals'},
    {titulo:'Reported speech',proximo:true,ref:'Cambridge B2 First · Murphy EGU – Reported speech'},
    {titulo:'Pasiva avanzada',proximo:true,ref:'Cambridge B2 First · Murphy EGU – Passive (have something done, it is said that)'},
    {titulo:'Modales de deducción',proximo:true,ref:'Cambridge B2 First · Murphy EGU – must/might/can’t have'},
    {titulo:'Wish e if only',proximo:true,ref:'Cambridge B2 First · Murphy EGU – Wish'},
    {titulo:'Conectores',proximo:true,ref:'Cambridge B2 First – Linking words'},
    {titulo:'Collocations',proximo:true,ref:'Cambridge B2 First – Collocations'},
    {titulo:'Inglés técnico de TI y ciberseguridad',proximo:true,ref:'MCER B2 – Inglés profesional (TI)'},
    {titulo:'Presentaciones',proximo:true,ref:'MCER B2 – Exposición oral'},
    {titulo:'Debates',proximo:true,ref:'MCER B2 – Interacción: debatir'},
    {titulo:'Comprensión de audios naturales',proximo:true,ref:'Cambridge B2 First – Listening'}
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
    {titulo:'Prueba de nivel A1–B2',proximo:true,ref:'MCER – Descriptores de nivel A1 a B2'},
    {titulo:'Simulacro estilo A2 Key',proximo:true,ref:'Cambridge A2 Key – Formato (sin copiar exámenes reales)'},
    {titulo:'Simulacro estilo B1 Preliminary',proximo:true,ref:'Cambridge B1 Preliminary – Formato (sin copiar exámenes reales)'},
    {titulo:'Simulacro estilo B2 First',proximo:true,ref:'Cambridge B2 First – Formato (sin copiar exámenes reales)'}
  ]}
];
