/* Ayudantes para escribir el contenido de cada nivel (a1.js … b2.js); datos.js los vuelve a exportar. */
// Pregunta de comprensión escrita (mismo formato que el resto de la app: deBanco)
export const q=(pregunta,respuestas,regla,errores={})=>({tipo:'completar',pregunta,respuestas,errores,regla});
// Criterio de una rúbrica de escritura: re debe aparecer (o, con no:true, no aparecer)
export const crit=(texto,re,ayuda,{no=false}={})=>({texto,re,ayuda,no});
// Criterios que se repiten
export const SALUDO=crit('Saluda al principio (Hi / Hello / Dear …)','^\\s*(hi|hello|hey|dear|good (morning|afternoon|evening))\\b','Empieza con un saludo y el nombre: Hi Ana, / Dear Mr. Lee,');
export const CIERRE=crit('Cierra con una despedida (Thanks / Best / See you …)','\\b(thanks|thank you|best|regards|see you|bye|cheers|love|take care|sincerely|talk soon|yours)\\b','Termina con Thanks!, Best, See you soon… y tu nombre.');
