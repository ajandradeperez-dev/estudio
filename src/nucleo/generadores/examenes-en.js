/* Inglés · Prueba de nivel y simulacros «estilo» A2 Key, B1 Preliminary y B2 First (no son exámenes oficiales ni copian
   exámenes reales): cada pregunta sale de un generador del nivel, así que trae su regla, sus pasos y sus errores típicos.
   armarExamenes(G) recibe GENERADORES (lo llama index.js al final) para no crear una importación circular. Sin DOM. */
const A1=['en/to-be','en/presente-simple','en/there-is','en/can','en/posesivos','en/comida','en/ciudad','en/lecturas-a1','en/escritura-a1'];
const A2=['en/pasado-simple','en/futuro','en/comparativos','en/contables','en/should','en/viajes','en/experiencias','en/lecturas-a2','en/escritura-a2'];
const B1=['en/presente-perfecto','en/condicionales','en/pasiva','en/modales','en/relativas','en/gerundio-infinitivo','en/correos','en/opinar','en/lecturas-b1'];
const B2=['en/condicional-3','en/reported-speech','en/pasiva-avanzada','en/deduccion','en/wish','en/conectores','en/collocations','en/ti','en/audios'];

// def.niveles: {n: [[lista de generadores, nivel de esos generadores]…]}
function mezcla(G,def){
  return {...def,profundidad:(n,p)=>p.profundidad,
    generar(n,rng){
      const [lista,nv]=rng.elegir(def.niveles[n]),id=rng.elegir(lista.filter(x=>G[x])),q=G[id].generar(nv,rng);
      return {...q,plantilla:id,profundidad:q.profundidad||'procedimiento',etiqueta:def.etiqueta};
    }};
}
const T_EXAMEN=[['Antes de responder en un examen de inglés','Lee la pregunta completa y busca la palabra clave (who, when, not, only).'],['Si no sabes una palabra','Adivina por el contexto: las de alrededor suelen explicarla.'],['Al escribir','Una frase por cada punto que te piden, y revisa sujeto + verbo.']];

export function armarExamenes(G){
  return {
    'en/prueba-nivel':mezcla(G,{titulo:'Prueba de nivel A1–B2',etiqueta:'🧭 Prueba de nivel',
      explicacion:'Preguntas que suben de A1 (nivel 1) a B2 (nivel 5): gramática, vocabulario, lectura y escritura. Si aciertas casi todo en un nivel, ese nivel ya lo dominas. No es un examen oficial: es una guía para saber dónde estudiar.',
      alternativa:'Piensa en una escalera: cada nivel de dificultad es un nivel MCER. Donde empiezas a fallar seguido, ahí está tu siguiente tema.',
      referencia:'MCER – Descriptores de nivel A1 a B2',regla:'Cada pregunta trae la regla de su tema.',pista:'Lee la pregunta completa.',tarjetas:T_EXAMEN,
      niveles:{1:[[A1,2],[A1,3]],2:[[A1,4],[A2,2]],3:[[A2,3],[A2,4]],4:[[B1,3],[B1,4]],5:[[B2,3],[B2,4]]}}),
    'en/simulacro-a2':mezcla(G,{titulo:'Simulacro estilo A2 Key',etiqueta:'📝 Estilo A2 Key',
      explicacion:'Practica el tipo de tareas de un examen A2: completar frases, entender avisos y correos cortos, y escribir mensajes de 25–40 palabras. Inspirado en el formato público de A2 Key; no es un examen oficial ni copia preguntas reales.',
      alternativa:'En A2 casi todo es vida diaria: comprar, viajar, trabajo y planes. Si dominas esos temas, el examen se siente familiar.',
      referencia:'Cambridge A2 Key – Formato (sin copiar exámenes reales)',regla:'Cada pregunta trae la regla de su tema.',pista:'Busca la palabra clave.',tarjetas:T_EXAMEN,
      niveles:{1:[[A2,1],[A2,2]],2:[[A2,2],[A2,3]],3:[[A2,3]],4:[[A2,4]],5:[[A2,5]]}}),
    'en/simulacro-b1':mezcla(G,{titulo:'Simulacro estilo B1 Preliminary',etiqueta:'📝 Estilo B1 Preliminary',
      explicacion:'Tareas de nivel B1: gramática en contexto (perfecto, condicionales, pasiva, modales), artículos y reseñas con opinión, y correos formales e informales. Inspirado en el formato público de B1 Preliminary; no es un examen oficial.',
      alternativa:'En B1 importa el matiz: quién opina qué, si algo es obligatorio u opcional, si es posible o imaginario.',
      referencia:'Cambridge B1 Preliminary – Formato (sin copiar exámenes reales)',regla:'Cada pregunta trae la regla de su tema.',pista:'Fíjate en los matices (must, might, however).',tarjetas:T_EXAMEN,
      niveles:{1:[[B1,1],[B1,2]],2:[[B1,2],[B1,3]],3:[[B1,3]],4:[[B1,4]],5:[[B1,5]]}}),
    'en/simulacro-b2':mezcla(G,{titulo:'Simulacro estilo B2 First',etiqueta:'📝 Estilo B2 First',
      explicacion:'Tareas de nivel B2: transformaciones (condicional 3, reported speech, pasiva avanzada, deducción, wish), conectores y collocations, inglés profesional y habla natural. Inspirado en el formato público de B2 First; no es un examen oficial.',
      alternativa:'En B2 se evalúa precisión: la misma idea dicha de otra forma (transformar) sin cambiar el sentido.',
      referencia:'Cambridge B2 First – Formato (sin copiar exámenes reales)',regla:'Cada pregunta trae la regla de su tema.',pista:'Mantén el sentido y cambia la forma.',tarjetas:T_EXAMEN,
      niveles:{1:[[B2,1],[B2,2]],2:[[B2,2],[B2,3]],3:[[B2,3]],4:[[B2,4]],5:[[B2,5]]}})
  };
}
