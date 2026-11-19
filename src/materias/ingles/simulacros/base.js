/* Ayudantes para escribir los simulacros (a1.js … b2.js). Todo el contenido es original: el formato se inspira en
   A2 Key, B1 Preliminary y B2 First, pero no copia exámenes reales. */
// Opción múltiple: una sola correcta (índice)
export const op=(pregunta,opciones,correcta,regla)=>({tipo:'opcion',pregunta,opciones,correcta,regla});
// Respuesta escrita: todas las variantes correctas en respuestas (Inglés no tolera errores de dedo)
export const es=(pregunta,respuestas,regla,errores={})=>({tipo:'completar',pregunta,respuestas,regla,errores});
// Criterio de rúbrica de escritura (igual que en la práctica por nivel)
export const crit=(texto,re,ayuda,{no=false}={})=>({texto,re,ayuda,no});
export const SALUDO=crit('Saluda (Hi / Hello / Dear …)','^\\s*(hi|hello|hey|dear|good (morning|afternoon|evening))\\b','Empieza con un saludo y el nombre.');
export const CIERRE=crit('Se despide (Thanks / Best / See you …)','\\b(thanks|thank you|best|regards|see you|bye|cheers|love|take care|sincerely|yours)\\b','Termina con una despedida y tu nombre.');
export const SIN_CONTRACCIONES=crit('Registro formal (sin contracciones)',"\\b(i'm|you're|we're|they're|it's|that's|there's|let's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|haven't|hasn't|wouldn't|shouldn't|couldn't|i've|we've|i'll|we'll|i'd|we'd|gonna|wanna)\\b",'En un texto formal escribe completo: do not, it is.',{no:true});
