/* Capa común de IA: TODAS las funciones con IA (conversación de Hablar, explicaciones, pregunta nueva, Foto a nota,
   Resuélvelo conmigo, temario, ejercicios y simulacros de Mis materias) llaman a pedir() y funcionan igual con:
     - Gemini (Google AI Studio, gratis con una cuenta de Google): recomendado y opción por defecto.
     - Claude (Anthropic, de pago).
   Cada persona pega SU clave; vive solo en localStorage de este dispositivo ('ciberlab-ia'): nunca en el código, en git,
   en los respaldos ni en logs, y solo se envía a la API de su proveedor. No uses console.log con la clave ni las cabeceras.
   Modelos verificados en la documentación oficial (octubre de 2026): Gemini 3.8 Flash (el Flash estable más reciente, plan
   gratuito) para texto e imágenes; Claude Haiku 5.5 para texto y Claude Sonnet 5.5 para fotos.

   pedir({sistema, mensajes, imagenes?, esquemaJSON?, maxTokens?, nivel?:'texto'|'vision', esfuerzo?:'low'|'medium', alUso?})
     mensajes: [{role:'user'|'assistant', content: texto | [{type:'text',text} | {type:'image',source:{type:'base64',media_type,data}}]}]
     imagenes: [{media_type, data(base64)}] se agregan al último mensaje del usuario.
     Con esquemaJSON devuelve el objeto ya parseado (JSON garantizado por esquema en los dos); sin él, el texto. */

const CLAVE='ciberlab-ia';
export const PROVEEDORES={
  gemini:{nombre:'Gemini',nota:'Gratis con tu cuenta de Google (recomendado)',prefijo:'AIza',ejemplo:'AIza…',
    texto:'gemini-3.8-flash',vision:'gemini-3.8-flash',url:'https://generativelanguage.googleapis.com/v1beta/models'},
  claude:{nombre:'Claude',nota:'De pago (Anthropic)',prefijo:'sk-ant-',ejemplo:'sk-ant-…',
    texto:'claude-haiku-5-5',vision:'claude-sonnet-5-5',url:'https://api.anthropic.com/v1/messages'}
};
export const MODELOS_CLAUDE=[
  {id:'claude-haiku-5-5',nombre:'Claude Haiku 5.5',nota:'Rápido y muy económico (recomendado)'},
  {id:'claude-sonnet-5-5',nombre:'Claude Sonnet 5.5',nota:'Más natural, cuesta ~20 veces más'}
];
// Precio por millón de tokens (entrada, salida) en USD; Gemini en su plan gratuito no cobra
export const PRECIOS={'gemini-3.8-flash':[0,0],'claude-haiku-5-5':[0.10,0.50],'claude-sonnet-5-5':[2,10]};

export class ErrorIA extends Error{constructor(codigo,mensaje){super(mensaje);this.codigo=codigo}}

/* ---------- ajustes (con compatibilidad: antes solo había {clave, modelo} de Anthropic) ---------- */
const almacen=()=>{try{return globalThis.localStorage}catch(e){return null}};
function leerCrudo(){try{return JSON.parse(almacen()?.getItem(CLAVE))||{}}catch(e){return {}}}
export function leerAjustes(){
  const a=leerCrudo(),claves={gemini:'',claude:'',...(a.claves&&typeof a.claves==='object'?a.claves:{})};
  if(typeof a.clave==='string'&&a.clave&&!claves.claude)claves.claude=a.clave;           // formato viejo: la clave era de Anthropic
  const proveedor=PROVEEDORES[a.proveedor]?a.proveedor:claves.claude&&!claves.gemini?'claude':'gemini';
  const modelo=MODELOS_CLAUDE.some(m=>m.id===a.modelo)?a.modelo:MODELOS_CLAUDE[0].id;
  return {proveedor,claves,modelo,clave:claves[proveedor]||''};
}
export function guardarAjustes({proveedor,clave,modelo}){
  const a=leerAjustes(),p=PROVEEDORES[proveedor]?proveedor:a.proveedor;
  const claves={...a.claves};if(typeof clave==='string')claves[p]=clave.trim();
  try{almacen()?.setItem(CLAVE,JSON.stringify({proveedor:p,claves,modelo:modelo||a.modelo}))}catch(e){}
}
export function borrarClave(proveedor){const a=leerAjustes();guardarAjustes({proveedor:proveedor||a.proveedor,clave:''})}
export const claveOculta=c=>c?`${c.slice(0,6)}…${c.slice(-4)}`:'';
export const iaDisponible=()=>!!leerAjustes().clave;
export const nombreProveedor=()=>PROVEEDORES[leerAjustes().proveedor].nombre;
// Modelo que se usará para un nivel ('texto' o 'vision') con el proveedor elegido
export function modeloPara(nivel='texto',a=leerAjustes()){
  if(a.proveedor==='gemini')return PROVEEDORES.gemini[nivel==='vision'?'vision':'texto'];
  return nivel==='vision'?PROVEEDORES.claude.vision:a.modelo;
}
export function nombreModelo(a=leerAjustes()){return a.proveedor==='gemini'?'Gemini 3.8 Flash':MODELOS_CLAUDE.find(m=>m.id===a.modelo)?.nombre||a.modelo}

/* ---------- mensajes de error amables ---------- */
const ERR={
  sinClave:p=>new ErrorIA('sin-clave',`Falta tu clave de ${PROVEEDORES[p].nombre}. Agrégala en Perfil → ✨ Inteligencia artificial.`),
  offline:()=>new ErrorIA('offline','Sin internet: la IA necesita conexión. Todo lo demás de la app funciona sin internet.'),
  red:p=>new ErrorIA('red',`No se pudo conectar con ${PROVEEDORES[p].nombre}. Revisa tu conexión e intenta de nuevo.`),
  limite:p=>new ErrorIA('429',p==='gemini'?'Llegaste al límite de uso gratuito de Gemini por ahora. Espera un minuto (o hasta mañana si fue el límite del día) y vuelve a intentarlo.':'Llegaste al límite de uso por minuto. Espera un momento y vuelve a intentarlo.'),
  clave:p=>new ErrorIA('401',p==='gemini'?'La clave de Gemini no es válida. Revisa que la copiaste completa (empieza con AIza) o crea otra en aistudio.google.com.':'La clave no es válida o fue revocada. Revisa que la copiaste completa (empieza con sk-ant-) o crea una nueva.'),
  saturado:p=>new ErrorIA('saturado',`${PROVEEDORES[p].nombre} está saturado en este momento. Intenta de nuevo en un momento.`),
  negativa:p=>new ErrorIA('negativa',`${PROVEEDORES[p].nombre} prefirió no responder a eso. Prueba con otro tema.`),
  cortada:()=>new ErrorIA('cortada','La respuesta se cortó. Intenta de nuevo.'),
  json:()=>new ErrorIA('json','La respuesta llegó incompleta. Intenta de nuevo.')
};
const parsear=t=>{const s=String(t??'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');try{return JSON.parse(s)}catch(e){throw ERR.json()}};

/* ---------- Claude (Messages API) ---------- */
let sinRespaldo=false;
async function claude({clave,modelo,sistema,mensajes,esquemaJSON,maxTokens,esfuerzo,alUso}){
  const respaldo=modelo.startsWith('claude-sonnet')&&!sinRespaldo;
  const cuerpo={model:modelo,max_tokens:maxTokens,system:sistema,messages:mensajes,
    output_config:{effort:esfuerzo,...(esquemaJSON?{format:{type:'json_schema',schema:esquemaJSON}}:{})},...(respaldo?{fallbacks:'default'}:{})};
  const cab={'content-type':'application/json','x-api-key':clave,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true',...(respaldo?{'anthropic-beta':'server-side-fallback-2026-07-01'}:{})};
  let r;try{r=await fetch(PROVEEDORES.claude.url,{method:'POST',headers:cab,body:JSON.stringify(cuerpo)})}catch(e){throw ERR.red('claude')}
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok){
    const msg=String(d?.error?.message||'');
    if(r.status===400&&respaldo&&/fallback/i.test(msg)){sinRespaldo=true;return claude({clave,modelo,sistema,mensajes,esquemaJSON,maxTokens,esfuerzo,alUso})}
    if(r.status===401)throw ERR.clave('claude');
    if(r.status===403)throw new ErrorIA('403','Tu clave no tiene permiso para usar este modelo. Prueba con otro modelo.');
    if(r.status===404)throw new ErrorIA('404','Ese modelo no está disponible para tu cuenta. Elige otro.');
    if(r.status===429)throw ERR.limite('claude');
    if(r.status===529||r.status>=500)throw ERR.saturado('claude');
    if(r.status===400&&/credit|balance|billing/i.test(msg))throw new ErrorIA('saldo','Tu cuenta de Anthropic no tiene saldo. Agrega créditos en console.anthropic.com → Billing, o usa Gemini gratis.');
    throw new ErrorIA(String(r.status),`La API respondió con un error (${r.status})${msg?`: ${msg}`:''}.`);
  }
  try{alUso?.(d?.usage?{input_tokens:d.usage.input_tokens,output_tokens:d.usage.output_tokens}:null)}catch(e){}
  if(d?.stop_reason==='refusal')throw ERR.negativa('claude');
  if(d?.stop_reason==='max_tokens')throw ERR.cortada();
  const texto=(d?.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
  return esquemaJSON?parsear(texto):texto;
}

/* ---------- Gemini (generateContent) ---------- */
const aPartes=content=>typeof content==='string'?[{text:content}]:(content||[]).map(b=>b.type==='image'?{inlineData:{mimeType:b.source?.media_type||'image/jpeg',data:b.source?.data||''}}:{text:String(b.text??'')});
export function cuerpoGemini({sistema,mensajes,esquemaJSON,maxTokens,esfuerzo}){
  return {
    ...(sistema?{systemInstruction:{parts:[{text:sistema}]}}:{}),
    contents:mensajes.map(m=>({role:m.role==='assistant'?'model':'user',parts:aPartes(m.content)})),
    generationConfig:{maxOutputTokens:Math.round(maxTokens*1.5),thinkingConfig:{thinkingLevel:esfuerzo==='medium'?'medium':'low'},
      ...(esquemaJSON?{responseMimeType:'application/json',responseJsonSchema:esquemaJSON}:{})}
  };
}
async function gemini({clave,modelo,sistema,mensajes,esquemaJSON,maxTokens,esfuerzo,alUso}){
  let r;try{r=await fetch(`${PROVEEDORES.gemini.url}/${modelo}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':clave},body:JSON.stringify(cuerpoGemini({sistema,mensajes,esquemaJSON,maxTokens,esfuerzo}))})}
  catch(e){throw ERR.red('gemini')}
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok){
    const msg=String(d?.error?.message||''),st=String(d?.error?.status||'');
    if(r.status===429||st==='RESOURCE_EXHAUSTED')throw ERR.limite('gemini');
    if(r.status===401||/API key not valid|API_KEY_INVALID/i.test(msg+JSON.stringify(d?.error?.details||'')))throw ERR.clave('gemini');
    if(r.status===403)throw new ErrorIA('403','Tu clave de Gemini no tiene permiso para este modelo o la API no está activada en tu proyecto de Google.');
    if(r.status===404)throw new ErrorIA('404','Ese modelo de Gemini no está disponible para tu clave.');
    if(r.status>=500)throw ERR.saturado('gemini');
    throw new ErrorIA(String(r.status),`La API respondió con un error (${r.status})${msg?`: ${msg}`:''}.`);
  }
  try{const u=d?.usageMetadata;alUso?.(u?{input_tokens:u.promptTokenCount|0,output_tokens:(u.candidatesTokenCount|0)+(u.thoughtsTokenCount|0)}:null)}catch(e){}
  if(d?.promptFeedback?.blockReason)throw ERR.negativa('gemini');
  const c=d?.candidates?.[0],fin=c?.finishReason;
  if(['SAFETY','PROHIBITED_CONTENT','BLOCKLIST','SPII','RECITATION','IMAGE_SAFETY'].includes(fin))throw ERR.negativa('gemini');
  if(fin==='MAX_TOKENS')throw ERR.cortada();
  const texto=(c?.content?.parts||[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('');
  if(!texto)throw ERR.json();
  return esquemaJSON?parsear(texto):texto;
}

/* ---------- la llamada común ---------- */
export async function pedir({sistema='',mensajes,imagenes=[],esquemaJSON=null,maxTokens=4000,nivel='texto',esfuerzo='low',alUso,modelo:forzado}){
  const a=leerAjustes(),p=a.proveedor;
  if(!a.clave)throw ERR.sinClave(p);
  if(typeof navigator!=='undefined'&&navigator.onLine===false)throw ERR.offline();
  let ms=mensajes.map(m=>({...m}));
  if(imagenes.length){const i=ms.map(m=>m.role).lastIndexOf('user'),m=ms[i],c=typeof m.content==='string'?[{type:'text',text:m.content}]:[...m.content];
    ms[i]={...m,content:[...imagenes.map(x=>({type:'image',source:{type:'base64',media_type:x.media_type||'image/jpeg',data:x.data}})),...c]}}
  const modelo=forzado||modeloPara(nivel,a);
  return (p==='gemini'?gemini:claude)({clave:a.clave,modelo,sistema,mensajes:ms,esquemaJSON,maxTokens,esfuerzo,alUso});
}
// Compatibilidad con las llamadas anteriores (formato de Anthropic): modelo 'vision' o un Sonnet = nivel visión
export const pedirJSON=({system,messages,schema,maxTokens,modelo,effort,alUso})=>
  pedir({sistema:system,mensajes:messages,esquemaJSON:schema,maxTokens,esfuerzo:effort||'low',alUso,nivel:modelo==='vision'||/sonnet/.test(modelo||'')?'vision':'texto'});

// Prueba la clave con una petición mínima
export async function probarClave(){
  const a=leerAjustes();
  if(!a.clave)throw new ErrorIA('sin-clave','Primero pega tu clave.');
  try{await pedir({mensajes:[{role:'user',content:'Responde solo: hola'}],maxTokens:64});return true}
  catch(e){if(e.codigo==='cortada'||e.codigo==='json')return true;throw e}
}
// Costo estimado en USD de una llamada (0 con Gemini gratis)
export function costoUSD(nivel,entrada,salida,a=leerAjustes()){const [pi,po]=PRECIOS[modeloPara(nivel,a)]||[0,0];return (entrada*pi+salida*po)/1e6}
