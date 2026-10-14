/* "✨ Pregunta nueva con IA" (opcional): si hay clave de Anthropic guardada en este dispositivo, pide a Claude un ejercicio
   para la habilidad y el nivel actuales, en el mismo formato que los generadores. Si no hay clave o falla, la sesión sigue
   con el generador local: la app funciona 100 % sin IA. La clave nunca sale de localStorage salvo hacia api.anthropic.com. */
import {leerAjustes,pedirJSON} from '../materias/ingles/hablar/claude.js';
import {crear} from './generadores/index.js';
import {igualNum,equivalente,igualTexto,num} from './generadores/verificar.js';
import {coincide} from './comparar.js';
import {esc} from '../utilidades.js';

export const iaDisponible=()=>!!leerAjustes().clave;

const ESQUEMA={type:'object',additionalProperties:false,required:['enunciado','respuestas','pasos','regla','pista'],properties:{
  enunciado:{type:'string',description:'La pregunta en español. Fórmulas en TeX entre \\( y \\).'},
  respuestas:{type:'array',items:{type:'string'},description:'Respuestas correctas tal como las escribiría el estudiante (texto plano; la primera es la principal).'},
  pasos:{type:'array',items:{type:'object',additionalProperties:false,required:['que','como','porque'],properties:{que:{type:'string'},como:{type:'string'},porque:{type:'string'}}},description:'Solución paso a paso (2–5 pasos): qué hago, la operación con los números del ejercicio (TeX entre \\( y \\)) y por qué.'},
  regla:{type:'string',description:'La regla general en una frase.'},
  pista:{type:'string',description:'Una pista corta que no regale la respuesta.'}
}};

export async function preguntaIA(m,h,nivel){
  try{
    const ejemplo=crear(h.gen,nivel);
    const r=await pedirJSON({
      system:'Eres un profesor que crea ejercicios de práctica en español neutro. Respondes solo con el JSON pedido. Los ejercicios son de producción (el estudiante escribe la respuesta), con una única respuesta correcta verificable. Si es de seguridad informática, siempre defensivo y simulado.',
      messages:[{role:'user',content:`Crea un ejercicio NUEVO de la habilidad «${h.titulo}» (${m.nombre}) con dificultad ${nivel} de 5, distinto a este ejemplo:\n${ejemplo.enunciado}\nRespuesta del ejemplo: ${ejemplo.respuesta}`}],
      schema:ESQUEMA,maxTokens:1500
    });
    if(!r?.enunciado||!r.respuestas?.length)return null;
    const resp=r.respuestas.map(String);
    // Verificación tolerante: número, expresión equivalente o texto
    const verificar=e=>resp.some(x=>{const v=num(x);return Number.isFinite(v)?igualNum(e,v,1e-3):equivalente(e,x)||igualTexto(e,x)||coincide(e,[x])});
    return {tipo:'escribir',enunciado:`${r.enunciado} <span class="chip">✨ IA</span>`,respuesta:esc(resp[0]),verificar,pasos:r.pasos,regla:r.regla,pista:r.pista,
      errores:[],teclado:ejemplo.teclado,ref:`${m.id}/g/${h.id}/${nivel}`,ia:true};
  }catch(e){return null}
}

// "✨ Explícamelo de otra forma": otra explicación (más básica, con una analogía) a partir del ejercicio, la respuesta y los pasos
const plano=x=>String(x??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
export async function explicarIA(m,h,p,entrada){
  const pasos=(p.pasos||[]).map((x,i)=>typeof x==='string'?`${i+1}. ${plano(x)}`:`${i+1}. ${plano(x.que)}: ${plano(x.como)} (${plano(x.porque)})`).join('\n');
  const r=await pedirJSON({
    system:'Eres un profesor paciente que explica en español neutro, con frases cortas. Respondes solo con el JSON pedido. Fórmulas en TeX entre \\( y \\).',
    messages:[{role:'user',content:`Habilidad: ${h.titulo} (${m.nombre}).\nEjercicio: ${plano(p.enunciado)}\nRespuesta correcta: ${plano(p.respuesta)}\nLo que respondí: ${entrada?plano(Array.isArray(entrada)?entrada.join(', '):entrada):'(nada)'}\nPasos de la solución:\n${pasos}\nNo lo entendí. Explícamelo de otra forma, más básica, con una analogía de la vida diaria, y dime qué hice mal si respondí algo. Máximo 120 palabras.`}],
    schema:{type:'object',additionalProperties:false,required:['explicacion'],properties:{explicacion:{type:'string'}}},maxTokens:900
  });
  return r.explicacion;
}
