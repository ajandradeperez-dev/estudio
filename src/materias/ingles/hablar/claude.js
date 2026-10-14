/* Cliente mínimo de la API de Anthropic llamado DESDE EL NAVEGADOR con la clave del propio usuario.
   La clave vive solo en localStorage de este dispositivo ('ciberlab-ia'): nunca en el código, en git ni en logs,
   y solo se envía a api.anthropic.com. No uses console.log con la clave ni con las cabeceras. */

const CLAVE_AJUSTES='ciberlab-ia';
const URL_API='https://api.anthropic.com/v1/messages';
// IDs vigentes (verificados en la documentación de Anthropic): el Haiku más reciente (por costo) y el Sonnet más reciente
export const MODELOS=[
  {id:'claude-haiku-5-5',nombre:'Claude Haiku 5.5',nota:'Rápido y muy económico (recomendado)'},
  {id:'claude-sonnet-5-5',nombre:'Claude Sonnet 5.5',nota:'Más natural, cuesta ~20 veces más'}
];

export function leerAjustes(){
  try{const a=JSON.parse(localStorage.getItem(CLAVE_AJUSTES))||{};return {clave:typeof a.clave==='string'?a.clave:'',modelo:MODELOS.some(m=>m.id===a.modelo)?a.modelo:MODELOS[0].id}}
  catch(e){return {clave:'',modelo:MODELOS[0].id}}
}
export function guardarAjustes(a){try{localStorage.setItem(CLAVE_AJUSTES,JSON.stringify({clave:a.clave.trim(),modelo:a.modelo}))}catch(e){}}
export function borrarClave(){try{const a=leerAjustes();localStorage.setItem(CLAVE_AJUSTES,JSON.stringify({clave:'',modelo:a.modelo}))}catch(e){}}
export const claveOculta=c=>c?`${c.slice(0,7)}…${c.slice(-4)}`:'';

export class ErrorIA extends Error{constructor(codigo,mensaje){super(mensaje);this.codigo=codigo}}

let sinRespaldo=false; // si el servidor rechazó el respaldo ante negativas, no volver a pedirlo en esta sesión

/* Una llamada a Messages con salida JSON garantizada por esquema. Devuelve el objeto ya parseado.
   modelo/effort: opcionales (por defecto el elegido en Ajustes y esfuerzo bajo); alUso(usage) recibe los tokens usados. */
export async function pedirJSON({system,messages,schema,maxTokens=4000,modelo:modeloPedido,effort='low',alUso}){
  const {clave,modelo:elegido}=leerAjustes(),modelo=modeloPedido||elegido;
  if(!clave)throw new ErrorIA('sin-clave','Falta tu API key de Anthropic. Agrégala en Ajustes.');
  if(typeof navigator!=='undefined'&&navigator.onLine===false)throw new ErrorIA('offline','Sin internet: la conversación con IA necesita conexión. Mientras tanto usa los diálogos guiados, que funcionan sin internet.');
  const respaldo=modelo.startsWith('claude-sonnet')&&!sinRespaldo;
  const cuerpo={model:modelo,max_tokens:maxTokens,system,messages,
    // Charla: esfuerzo bajo = respuestas rápidas y baratas. El esquema garantiza JSON válido.
    output_config:{effort,format:{type:'json_schema',schema}},...(respaldo?{fallbacks:'default'}:{})};
  const cabeceras={'content-type':'application/json','x-api-key':clave,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true',
    ...(respaldo?{'anthropic-beta':'server-side-fallback-2026-07-01'}:{})};
  let r;
  try{r=await fetch(URL_API,{method:'POST',headers:cabeceras,body:JSON.stringify(cuerpo)})}
  catch(e){throw new ErrorIA('red',navigator.onLine===false?'Sin internet: usa los diálogos guiados mientras tanto.':'No se pudo conectar con Anthropic. Revisa tu conexión e intenta de nuevo.')}
  let datos=null;try{datos=await r.json()}catch(e){}
  if(!r.ok){
    const msg=String(datos?.error?.message||'');
    if(r.status===400&&respaldo&&/fallback/i.test(msg)){sinRespaldo=true;return pedirJSON({system,messages,schema,maxTokens,modelo:modeloPedido,effort,alUso})}
    if(r.status===401)throw new ErrorIA('401','La clave no es válida o fue revocada. Revisa que la copiaste completa (empieza con sk-ant-) o crea una nueva.');
    if(r.status===403)throw new ErrorIA('403','Tu clave no tiene permiso para usar este modelo. Prueba con otro modelo en Ajustes.');
    if(r.status===404)throw new ErrorIA('404','Ese modelo no está disponible para tu cuenta. Elige otro en Ajustes.');
    if(r.status===429)throw new ErrorIA('429','Llegaste al límite de uso por minuto. Espera un momento y vuelve a intentarlo.');
    if(r.status===529||r.status>=500)throw new ErrorIA('saturado','Claude está saturado en este momento. Intenta de nuevo en un momento.');
    if(r.status===400&&/credit|balance|billing/i.test(msg))throw new ErrorIA('saldo','Tu cuenta de Anthropic no tiene saldo. Agrega créditos en console.anthropic.com → Billing.');
    throw new ErrorIA(String(r.status),`La API respondió con un error (${r.status})${msg?`: ${msg}`:''}.`);
  }
  try{alUso?.(datos?.usage||null)}catch(e){}
  if(datos?.stop_reason==='refusal')throw new ErrorIA('negativa','Claude prefirió no responder a eso. Prueba con otro tema.');
  if(datos?.stop_reason==='max_tokens')throw new ErrorIA('cortada','La respuesta se cortó. Intenta de nuevo.');
  const texto=(datos?.content||[]).find(b=>b.type==='text')?.text;
  try{return JSON.parse(texto)}catch(e){throw new ErrorIA('json','La respuesta llegó incompleta. Intenta de nuevo.')}
}

// Prueba la clave con una petición mínima (sin esquema): solo importa que responda 200
export async function probarClave(){
  const {clave,modelo}=leerAjustes();
  if(!clave)throw new ErrorIA('sin-clave','Primero pega tu clave.');
  let r;
  try{r=await fetch(URL_API,{method:'POST',headers:{'content-type':'application/json','x-api-key':clave,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:modelo,max_tokens:64,output_config:{effort:'low'},messages:[{role:'user',content:'Say hi in one word.'}]})})}
  catch(e){throw new ErrorIA('red','No se pudo conectar con Anthropic. Revisa tu conexión.')}
  if(r.ok)return true;
  if(r.status===401)throw new ErrorIA('401','La clave no es válida o fue revocada.');
  let msg='';try{msg=(await r.json())?.error?.message||''}catch(e){}
  if(/credit|balance|billing/i.test(msg))throw new ErrorIA('saldo','La clave funciona, pero tu cuenta no tiene saldo. Agrega créditos en console.anthropic.com → Billing.');
  throw new ErrorIA(String(r.status),`Error ${r.status}${msg?`: ${msg}`:''}`);
}
