/* Temas de Inglés y sus nodos, en orden de utilidad (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies.
   Hablar (unidades con escucha, diálogos, fluidez y jefe) es la sección hablar/: el tema "Hablar y escuchar" la enlaza. */
export default [
  {id:'gramatica',titulo:'Gramática',icono:'🧩',descripcion:'Lo más frecuente primero, de A1 a A2.',nodos:[
    {id:'verbo-to-be'},
    {id:'presente-simple',gen:'en/presente-simple'},
    {id:'can'},
    {id:'there-is-there-are'},
    {id:'presente-continuo',gen:'en/presente-continuo'},
    {id:'pasado-simple',gen:'en/pasado-simple'},
    {id:'futuro-going-to-will'},
    {id:'presente-perfecto',titulo:'Present perfect',gen:'en/presente-perfecto'},
    {id:'articulos',titulo:'Artículos: a, an, the',gen:'en/articulos'},
    {id:'plurales',titulo:'Plurales irregulares',gen:'en/plurales'},
    {id:'preposiciones',titulo:'Preposiciones de tiempo y lugar',gen:'en/preposiciones'},
    {id:'orden-palabras',titulo:'Orden de las palabras',gen:'en/ordenar'}
  ]},
  {id:'vocabulario',titulo:'Vocabulario y frases',icono:'📚',descripcion:'Palabras de trabajo y frases hechas.',nodos:[
    {id:'vocabulario-trabajo'},
    {id:'traducir',titulo:'Traducir frases cortas',gen:'en/traducir'},
    {id:'chunks',titulo:'Frases hechas (chunks)',gen:'en/chunks'}
  ]},
  {id:'hablar-escuchar',titulo:'Hablar y escuchar',icono:'🎙️',descripcion:'Unidades con escucha, diálogos, fluidez y jefe.',nodos:[
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
