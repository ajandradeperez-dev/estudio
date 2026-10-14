/* Temas de Inglés por nivel MCER, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies (las lecciones viven en temas/<tema>/).
   Hablar (unidades con escucha → chunks → forma → pronunciación → diálogo → fluidez → jefe) es la sección hablar/: el tema
   "Hablar y escuchar" la enlaza. Los nodos {titulo, proximo:true} son lo que el PLAN pide y todavía no existe. */
export default [
  {id:'a1',titulo:'A1 · Primeros pasos',icono:'🌱',descripcion:'Presentarte, to be, present simple, artículos, there is, can y lo básico del día a día.',nodos:[
    {titulo:'Presentarse',proximo:true},
    {titulo:'Números, fechas y hora',proximo:true},
    {id:'verbo-to-be'},
    {id:'presente-simple',gen:'en/presente-simple'},
    {id:'articulos',titulo:'Artículos: a, an, the',gen:'en/articulos'},
    {id:'plurales',titulo:'Plurales',gen:'en/plurales'},
    {id:'there-is-there-are'},
    {id:'preposiciones',titulo:'Preposiciones de tiempo y lugar',gen:'en/preposiciones'},
    {id:'can'},
    {titulo:'Rutinas',proximo:true},
    {titulo:'Comida y compras',proximo:true},
    {id:'chunks',titulo:'Frases hechas (chunks)',gen:'en/chunks'}
  ]},
  {id:'a2',titulo:'A2 · Contar y planear',icono:'🌿',descripcion:'Pasado, futuro, comparativos, viajes, salud y trabajo básico.',nodos:[
    {id:'pasado-simple',gen:'en/pasado-simple'},
    {id:'futuro-going-to-will'},
    {titulo:'Comparativos y superlativos',proximo:true},
    {titulo:'Countable / uncountable',proximo:true},
    {id:'presente-continuo',gen:'en/presente-continuo'},
    {titulo:'Direcciones y viajes',proximo:true},
    {titulo:'Salud',proximo:true},
    {id:'vocabulario-trabajo'},
    {titulo:'Pronunciación: -ed, -s y TH',proximo:true},
    {id:'orden-palabras',titulo:'Orden de las palabras',gen:'en/ordenar'},
    {id:'traducir',titulo:'Traducir frases cortas',gen:'en/traducir'}
  ]},
  {id:'b1',titulo:'B1 · Opinar y resolver',icono:'🌳',descripcion:'Present perfect, condicionales, pasiva, modales, emails y entrevistas.',nodos:[
    {id:'presente-perfecto',titulo:'Present perfect vs past simple',gen:'en/presente-perfecto'},
    {titulo:'Condicionales 0, 1 y 2',proximo:true},
    {titulo:'Voz pasiva básica',proximo:true},
    {titulo:'Modales: should, must, have to',proximo:true},
    {titulo:'Oraciones relativas',proximo:true},
    {titulo:'Phrasal verbs frecuentes',proximo:true},
    {titulo:'Email formal e informal',proximo:true},
    {titulo:'Contar historias',proximo:true},
    {titulo:'Opinar y argumentar',proximo:true},
    {titulo:'Entrevista de trabajo',proximo:true}
  ]},
  {id:'b2',titulo:'B2 · Inglés profesional',icono:'🏔️',descripcion:'Condicionales avanzados, reported speech, inglés técnico de TI y presentaciones.',nodos:[
    {titulo:'Condicional 3 y mixtos',proximo:true},
    {titulo:'Reported speech',proximo:true},
    {titulo:'Pasiva avanzada',proximo:true},
    {titulo:'Conectores',proximo:true},
    {titulo:'Inglés técnico de TI y ciberseguridad',proximo:true},
    {titulo:'Presentaciones',proximo:true},
    {titulo:'Debates',proximo:true},
    {titulo:'Comprensión de audios naturales',proximo:true}
  ]},
  {id:'hablar-escuchar',titulo:'Hablar y escuchar',icono:'🎙️',descripcion:'Unidades con escucha, chunks, diálogos, fluidez y jefe.',nodos:[
    {ir:'hablar',titulo:'Hablar: tu mapa',icono:'🗺️'},
    {ir:'hablar/u/presentarte',titulo:'Unidad 1: Presentarte',icono:'🙋'},
    {ir:'hablar/u/rutina-trabajo',titulo:'Unidad 2: Rutina y trabajo',icono:'💼'},
    {ir:'hablar/u/pedir-comprar',titulo:'Unidad 3: Pedir y comprar',icono:'🛒'},
    {ir:'hablar/u/ciudad-viajes',titulo:'Unidad 4: Ciudad y viajes',icono:'✈️'},
    {ir:'hablar/u/contar-pasado',titulo:'Unidad 5: Contar el pasado',icono:'📖'},
    {ir:'hablar/u/trabajo-ti',titulo:'Unidad 6: Trabajo en TI',icono:'💻'},
    {ir:'hablar/ia',titulo:'Conversación con IA',icono:'✨'}
  ]}
];
