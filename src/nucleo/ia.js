/* Capa común de IA: TODAS las funciones con IA (conversación de Hablar, explicaciones, pregunta nueva, Foto a nota,
   Resuélvelo conmigo, temario, ejercicios y simulacros de Mis materias) llaman a pedir() y funcionan igual con:
     - Gemini (Google AI Studio, gratis con una cuenta de Google): recomendado y opción por defecto.
     - Claude (Anthropic, de pago).
     - Groq, OpenRouter (solo modelos «:free») y Mistral: gratis con límites, con su API compatible con OpenAI (las tres
       permiten CORS desde el navegador: comprobado con un preflight y con respuestas 401 reales en noviembre de 2026).
   🔁 Respaldo automático: si el proveedor principal responde 429, 402, 5xx o no se puede conectar, se usa el siguiente del
   orden que tenga clave (con fotos, solo los que leen imágenes) y la app muestra «Usando Groq (Gemini saturado)».
   Cada persona pega SU clave; vive solo en localStorage de este dispositivo ('ciberlab-ia'): nunca en el código, en git,
   en los respaldos ni en logs, y solo se envía a la API de su proveedor. No uses console.log con la clave ni las cabeceras.
   Modelos verificados en la documentación oficial (octubre de 2026): Gemini 3.8 Flash (el Flash estable más reciente, plan
   gratuito) para texto e imágenes; Claude Haiku 5.5 para texto y Claude Sonnet 5.5 para fotos.

   pedir({sistema, mensajes, imagenes?, esquemaJSON?, maxTokens?, nivel?:'texto'|'vision', esfuerzo?:'low'|'medium', alUso?})
     mensajes: [{role:'user'|'assistant', content: texto | [{type:'text',text} | {type:'image',source:{type:'base64',media_type,data}}]}]
     imagenes: [{media_type, data(base64)}] se agregan al último mensaje del usuario.
     Con esquemaJSON devuelve el objeto ya parseado y validado contra el esquema (validarEsquema); si un modelo no acepta el
     esquema en la API, se le pide el JSON en el prompt y se valida igual. Sin esquema, el texto. */

const CLAVE='ciberlab-ia';
export const PROVEEDORES={
  gemini:{nombre:'Gemini',nota:'Gratis con tu cuenta de Google (recomendado)',prefijos:['AIza','AQ.'],ejemplo:'AIza… o AQ.…',
    texto:'gemini-3.8-flash',vision:'gemini-3.8-flash',url:'https://generativelanguage.googleapis.com/v1beta/models'},
  claude:{nombre:'Claude',nota:'De pago (Anthropic)',prefijos:['sk-ant-'],ejemplo:'sk-ant-…',
    texto:'claude-haiku-5-5',vision:'claude-sonnet-5-5',url:'https://api.anthropic.com/v1/messages'},
  // compatibles con OpenAI (chat/completions); vision:null = no lee fotos (el respaldo se lo salta con imágenes)
  groq:{nombre:'Groq',nota:'Gratis con límites, muy rápido (sin fotos)',prefijos:['gsk_'],ejemplo:'gsk_…',compatible:true,
    texto:'openai/gpt-oss-120b',vision:null,url:'https://api.groq.com/openai/v1/chat/completions'},
  openrouter:{nombre:'OpenRouter',nota:'Gratis con los modelos «:free»',prefijos:['sk-or-'],ejemplo:'sk-or-…',compatible:true,
    texto:'google/gemma-4-31b-it:free',vision:'google/gemma-4-31b-it:free',url:'https://openrouter.ai/api/v1/chat/completions'},
  mistral:{nombre:'Mistral',nota:'Plan gratuito con límites',prefijos:[],patron:/^[A-Za-z0-9]{24,64}$/,ejemplo:'32 letras y números',compatible:true,
    texto:'mistral-small-latest',vision:'ministral-8b-latest',url:'https://api.mistral.ai/v1/chat/completions'}
};
export const ORDEN_RESPALDO=['gemini','groq','openrouter','mistral','claude'];
// Google entrega claves de Gemini con el formato clásico «AIza…» y con el nuevo «AQ.…»; las dos van igual en x-goog-api-key
export const pareceClave=(p,v)=>{const P=PROVEEDORES[p],c=String(v||'');return P.patron?P.patron.test(c):P.prefijos.some(x=>c.startsWith(x))};
export const textoPrefijos=p=>PROVEEDORES[p].prefijos.join(' o ')||PROVEEDORES[p].ejemplo;
export const MODELOS_CLAUDE=[
  {id:'claude-haiku-5-5',nombre:'Claude Haiku 5.5',nota:'Rápido y muy económico (recomendado)'},
  {id:'claude-sonnet-5-5',nombre:'Claude Sonnet 5.5',nota:'Más natural, cuesta ~20 veces más'}
];
// Precio por millón de tokens (entrada, salida) en USD; Gemini en su plan gratuito no cobra
export const PRECIOS={'gemini-3.8-flash':[0,0],'claude-haiku-5-5':[0.10,0.50],'claude-sonnet-5-5':[2,10],'openai/gpt-oss-120b':[0,0],'google/gemma-4-31b-it:free':[0,0],'mistral-small-latest':[0,0],'ministral-8b-latest':[0,0]};

export class ErrorIA extends Error{constructor(codigo,mensaje){super(mensaje);this.codigo=codigo}}

/* ---------- ajustes (con compatibilidad: antes solo había {clave, modelo} de Anthropic) ---------- */
const almacen=()=>{try{return globalThis.localStorage}catch(e){return null}};
function leerCrudo(){try{return JSON.parse(almacen()?.getItem(CLAVE))||{}}catch(e){return {}}}
export function leerAjustes(){
  const a=leerCrudo(),claves=Object.fromEntries(Object.keys(PROVEEDORES).map(k=>[k,'']));
  if(a.claves&&typeof a.claves==='object')for(const k of Object.keys(claves))if(typeof a.claves[k]==='string')claves[k]=a.claves[k];
  if(typeof a.clave==='string'&&a.clave&&!claves.claude)claves.claude=a.clave;           // formato viejo: la clave era de Anthropic
  const proveedor=PROVEEDORES[a.proveedor]?a.proveedor:claves.claude&&!claves.gemini?'claude':'gemini';
  const modelo=MODELOS_CLAUDE.some(m=>m.id===a.modelo)?a.modelo:MODELOS_CLAUDE[0].id;
  // 🔁 respaldo: {activo, orden, usar:{proveedor: sí o no}}; Claude (de pago) solo si la persona lo marca
  const r=a.respaldo&&typeof a.respaldo==='object'?a.respaldo:{},orden=[...(Array.isArray(r.orden)?r.orden.filter(k=>PROVEEDORES[k]):[]),...ORDEN_RESPALDO].filter((k,i,l)=>l.indexOf(k)===i);
  const usar=Object.fromEntries(Object.keys(PROVEEDORES).map(k=>[k,typeof r.usar?.[k]==='boolean'?r.usar[k]:k!=='claude']));
  return {proveedor,claves,modelo,clave:claves[proveedor]||'',respaldo:{activo:r.activo!==false,orden,usar}};
}
export function guardarAjustes({proveedor,clave,modelo,respaldo}={}){
  const a=leerAjustes(),p=PROVEEDORES[proveedor]?proveedor:a.proveedor;
  const claves={...a.claves};if(typeof clave==='string')claves[p]=clave.trim();
  const r={...a.respaldo,...(respaldo||{})};
  try{almacen()?.setItem(CLAVE,JSON.stringify({proveedor:p,claves,modelo:modelo||a.modelo,respaldo:r}))}catch(e){}
}
// Guarda (o borra) la clave de un proveedor sin cambiar el principal: para usarlo de respaldo
export function guardarClave(p,clave){
  const a=leerAjustes();if(!PROVEEDORES[p])return;
  try{almacen()?.setItem(CLAVE,JSON.stringify({proveedor:a.proveedor,claves:{...a.claves,[p]:String(clave||'').trim()},modelo:a.modelo,respaldo:a.respaldo}))}catch(e){}
}
export function borrarClave(proveedor){guardarClave(proveedor||leerAjustes().proveedor,'')}
export const claveOculta=c=>c?`${c.slice(0,6)}…${c.slice(-4)}`:'';
// Los proveedores que se intentarán, en orden: el principal y, con el respaldo activo, los demás marcados que tengan clave
// (con fotos, solo los que leen imágenes)
export function cadenaProveedores(nivel='texto',a=leerAjustes()){
  const lista=[a.proveedor,...(a.respaldo.activo?a.respaldo.orden.filter(k=>k!==a.proveedor&&a.respaldo.usar[k]):[])];
  return lista.filter(k=>a.claves[k]&&(nivel!=='vision'||PROVEEDORES[k].vision!==null));
}
export const iaDisponible=(nivel='texto')=>cadenaProveedores(nivel).length>0;
export const nombreProveedor=()=>PROVEEDORES[leerAjustes().proveedor].nombre;
// Modelo que se usará para un nivel ('texto' o 'vision') con el proveedor elegido
export function modeloPara(nivel='texto',a=leerAjustes()){
  return modeloDe(a.proveedor,nivel,a);
}
function modeloDe(p,nivel,a){
  if(p==='claude')return nivel==='vision'?PROVEEDORES.claude.vision:a.modelo;
  const P=PROVEEDORES[p];return (nivel==='vision'?P.vision:P.texto)||P.texto;
}
export function nombreModelo(a=leerAjustes()){
  if(a.proveedor==='gemini')return 'Gemini 3.8 Flash';
  if(a.proveedor==='claude')return MODELOS_CLAUDE.find(m=>m.id===a.modelo)?.nombre||a.modelo;
  return `${PROVEEDORES[a.proveedor].nombre} (${PROVEEDORES[a.proveedor].texto})`;
}

/* ---------- mensajes de error amables ---------- */
const ERR={
  sinClave:p=>new ErrorIA('sin-clave',`Falta tu clave de ${PROVEEDORES[p].nombre}. Agrégala en Perfil → ✨ Inteligencia artificial.`),
  offline:()=>new ErrorIA('offline','Sin internet: la IA necesita conexión. Todo lo demás de la app funciona sin internet.'),
  red:p=>new ErrorIA('red',`No se pudo conectar con ${PROVEEDORES[p].nombre}. Revisa tu conexión e intenta de nuevo.`),
  limite:p=>new ErrorIA('429',p!=='claude'&&p!=='gemini'?`Llegaste al límite gratis de ${PROVEEDORES[p].nombre}: espera un momento o vuelve más tarde.`:p==='gemini'?'Llegaste al límite gratis de hoy de Gemini (plan gratuito): vuelve mañana o usa el modo sin IA. Si solo fue el límite por minuto, espera un momento y reintenta.':'Llegaste al límite de uso por minuto. Espera un momento y vuelve a intentarlo.'),
  clave:p=>new ErrorIA('401',p!=='claude'&&p!=='gemini'?`La clave de ${PROVEEDORES[p].nombre} no es válida. Revisa que la copiaste completa o crea otra.`:p==='gemini'?'La clave de Gemini no es válida. Revisa que la copiaste completa (empieza con AIza o AQ.) o crea otra en aistudio.google.com.':'La clave no es válida o fue revocada. Revisa que la copiaste completa (empieza con sk-ant-) o crea una nueva.'),
  saturado:p=>new ErrorIA('saturado',`${PROVEEDORES[p].nombre} está saturado en este momento. Intenta de nuevo en un momento.`),
  negativa:p=>new ErrorIA('negativa',`${PROVEEDORES[p].nombre} prefirió no responder a eso. Prueba con otro tema.`),
  cortada:()=>new ErrorIA('cortada','La respuesta se cortó. Intenta de nuevo.'),
  json:()=>new ErrorIA('json','La respuesta llegó incompleta. Intenta de nuevo.')
};
const parsear=t=>{
  const s=String(t??'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(s)}catch(e){const m=s.match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(m)try{return JSON.parse(m[0])}catch(x){}throw ERR.json()}
};
/* Valida un valor contra un esquema JSON (lo que usa la app: type, properties, required, items, enum). Devuelve '' si cumple
   o dónde no cumple. Se aplica a TODOS los proveedores: un JSON que no cumple cuenta como respuesta incompleta. */
export function validarEsquema(v,e,ruta='$'){
  if(!e||typeof e!=='object')return '';
  const tipos=[].concat(e.type||[]),de=x=>Array.isArray(x)?'array':x===null?'null':Number.isInteger(x)?'integer':typeof x;
  if(tipos.length&&!tipos.some(t=>t===de(v)||t==='number'&&typeof v==='number'))return `${ruta}: se esperaba ${tipos.join('|')}`;
  if(e.enum&&!e.enum.includes(v))return `${ruta}: valor fuera de la lista`;
  if(de(v)==='object'){
    for(const k of e.required||[])if(!(k in v))return `${ruta}.${k}: falta`;
    for(const [k,s] of Object.entries(e.properties||{}))if(k in v){const r=validarEsquema(v[k],s,`${ruta}.${k}`);if(r)return r}
  }
  if(de(v)==='array'&&e.items)for(let i=0;i<v.length;i++){const r=validarEsquema(v[i],e.items,`${ruta}[${i}]`);if(r)return r}
  return '';
}
const conEsquema=(t,esquema)=>{const v=parsear(t);if(validarEsquema(v,esquema))throw ERR.json();return v};

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
  return esquemaJSON?conEsquema(texto,esquemaJSON):texto;
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
    // Algunas cuentas reciben claves «AQ.» que Google todavía no acepta en esta API (ACCESS_TOKEN_TYPE_UNSUPPORTED)
    if(/ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(msg+st+JSON.stringify(d?.error?.details||'')))throw new ErrorIA('401','Google no aceptó este tipo de clave en tu cuenta. Crea otra clave en aistudio.google.com y vuelve a intentarlo; si pasa lo mismo, es un problema de tu cuenta de Google, no de la app.');
    if(r.status===401||/API key not valid|API_KEY_INVALID/i.test(msg+JSON.stringify(d?.error?.details||'')))throw ERR.clave('gemini');
    if(r.status===403)throw new ErrorIA('403','Google rechazó la clave (sin permiso). Revisa que esté completa, que no tenga restricciones y que la API de Gemini esté activada en su proyecto; o crea otra en aistudio.google.com.');
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
  return esquemaJSON?conEsquema(texto,esquemaJSON):texto;
}

/* ---------- Groq, OpenRouter y Mistral (API compatible con OpenAI: chat/completions) ---------- */
const instruccionJSON=e=>`Responde SOLO con un objeto JSON válido (sin texto antes ni después, sin bloques de código) que cumpla este esquema JSON:\n${JSON.stringify(e)}`;
export function cuerpoCompatible({modelo,sistema,mensajes,esquemaJSON,maxTokens,enPrompt=false}){
  const sis=[sistema,esquemaJSON&&enPrompt?instruccionJSON(esquemaJSON):''].filter(Boolean).join('\n\n');
  const aContenido=c=>typeof c==='string'?c:(c||[]).map(b=>b.type==='image'?{type:'image_url',image_url:{url:`data:${b.source?.media_type||'image/jpeg'};base64,${b.source?.data||''}`}}:{type:'text',text:String(b.text??'')});
  return {model:modelo,max_tokens:maxTokens,messages:[...(sis?[{role:'system',content:sis}]:[]),...mensajes.map(m=>({role:m.role==='assistant'?'assistant':'user',content:aContenido(m.content)}))],
    ...(esquemaJSON?{response_format:enPrompt?{type:'json_object'}:{type:'json_schema',json_schema:{name:'respuesta',strict:false,schema:esquemaJSON}}}:{})};
}
const enPromptPara=new Set();   // proveedor/modelo que rechazó el esquema en la API: desde entonces se le pide en el prompt
async function compatible(p,{clave,modelo,sistema,mensajes,esquemaJSON,maxTokens,alUso}){
  const P=PROVEEDORES[p];
  if(p==='openrouter'&&!/:free$/.test(modelo))throw new ErrorIA('modelo','OpenRouter: solo se usan modelos gratuitos («:free»).');
  const enPrompt=!!esquemaJSON&&enPromptPara.has(`${p}/${modelo}`);
  const cab={'content-type':'application/json',authorization:`Bearer ${clave}`,...(p==='openrouter'?{'X-Title':'Estudio+'}:{})};
  let r;try{r=await fetch(P.url,{method:'POST',headers:cab,body:JSON.stringify(cuerpoCompatible({modelo,sistema,mensajes,esquemaJSON,maxTokens,enPrompt}))})}catch(e){throw ERR.red(p)}
  let d=null;try{d=await r.json()}catch(e){}
  // OpenRouter a veces responde 200 con {error:{code}}
  const err=d?.error,st=!r.ok?r.status:err?(+err.code||+err.status||500):200;
  if(st!==200){
    const msg=String(err?.message||d?.message||'');
    // el modelo no acepta el esquema en response_format: se le pide el JSON en el prompt y se valida igual
    if(st===400&&esquemaJSON&&!enPrompt&&/response_format|json_schema|structured|schema/i.test(msg)){enPromptPara.add(`${p}/${modelo}`);return compatible(p,{clave,modelo,sistema,mensajes,esquemaJSON,maxTokens,alUso})}
    if(st===401||st===403)throw ERR.clave(p);
    if(st===429||st===402)throw ERR.limite(p);
    if(st===404)throw new ErrorIA('404',`Ese modelo de ${P.nombre} no está disponible ahora.`);
    if(st>=500)throw ERR.saturado(p);
    throw new ErrorIA(String(st),`La API de ${P.nombre} respondió con un error (${st})${msg?`: ${msg.slice(0,160)}`:''}.`);
  }
  try{const u=d?.usage;alUso?.(u?{input_tokens:u.prompt_tokens|0,output_tokens:u.completion_tokens|0}:null)}catch(e){}
  const c=d?.choices?.[0],fin=c?.finish_reason;
  if(fin==='content_filter')throw ERR.negativa(p);
  if(fin==='length')throw ERR.cortada();
  const cont=c?.message?.content,texto=typeof cont==='string'?cont:(cont||[]).map(b=>b.text||'').join('');
  if(!texto)throw ERR.json();
  return esquemaJSON?conEsquema(texto,esquemaJSON):texto;
}

/* ---------- la llamada común, con 🔁 respaldo automático ---------- */
const PASA_AL_SIGUIENTE=new Set(['429','saturado','red']);
const motivo=(p,e)=>`${PROVEEDORES[p].nombre} ${e.codigo==='red'?'no responde':e.codigo==='429'?'sin cupo':'saturado'}`;
export let ultimoRespaldo=null;
// La app lo muestra discretamente (main.js escucha 'ia-respaldo')
function avisarRespaldo(p,principal,e){
  ultimoRespaldo={proveedor:p,texto:`Usando ${PROVEEDORES[p].nombre} (${motivo(principal,e)})`};
  try{globalThis.dispatchEvent?.(new CustomEvent('ia-respaldo',{detail:ultimoRespaldo}))}catch(x){}
}
function llamar(p,{a,...op}){
  const clave=a.claves[p];
  if(p==='gemini')return gemini({clave,...op});
  if(p==='claude')return claude({clave,...op});
  return compatible(p,{clave,...op});
}
export async function pedir({sistema='',mensajes,imagenes=[],esquemaJSON=null,maxTokens=4000,nivel='texto',esfuerzo='low',alUso,modelo:forzado,proveedor:solo}){
  const a=leerAjustes();
  if(!a.claves[solo||a.proveedor]&&(solo||!iaDisponible(nivel)))throw ERR.sinClave(solo||a.proveedor);
  if(typeof navigator!=='undefined'&&navigator.onLine===false)throw ERR.offline();
  let ms=mensajes.map(m=>({...m}));
  if(imagenes.length){const i=ms.map(m=>m.role).lastIndexOf('user'),m=ms[i],c=typeof m.content==='string'?[{type:'text',text:m.content}]:[...m.content];
    ms[i]={...m,content:[...imagenes.map(x=>({type:'image',source:{type:'base64',media_type:x.media_type||'image/jpeg',data:x.data}})),...c]}}
  const vision=nivel==='vision'||ms.some(m=>Array.isArray(m.content)&&m.content.some(b=>b.type==='image'));
  const cadena=solo?[solo]:cadenaProveedores(vision?'vision':'texto',a);
  if(!cadena.length)throw new ErrorIA('vision',`${PROVEEDORES[a.proveedor].nombre} no puede leer fotos. Agrega la clave de un proveedor que sí (Gemini, OpenRouter, Mistral o Claude).`);
  let primero=null;
  for(const p of cadena){
    const modelo=p===a.proveedor&&forzado?forzado:modeloDe(p,vision?'vision':nivel,a);
    try{const r=await llamar(p,{a,modelo,sistema,mensajes:ms,esquemaJSON,maxTokens,esfuerzo,alUso});if(primero)avisarRespaldo(p,primero.p,primero.e);return r}
    catch(e){if(!primero)primero={p,e};if(!(e instanceof ErrorIA)||!PASA_AL_SIGUIENTE.has(e.codigo))throw p===primero.p?e:primero.e}
  }
  throw primero.e;
}
// Compatibilidad con las llamadas anteriores (formato de Anthropic): modelo 'vision' o un Sonnet = nivel visión
export const pedirJSON=({system,messages,schema,maxTokens,modelo,effort,alUso})=>
  pedir({sistema:system,mensajes:messages,esquemaJSON:schema,maxTokens,esfuerzo:effort||'low',alUso,nivel:modelo==='vision'||/sonnet/.test(modelo||'')?'vision':'texto'});

// Prueba la clave con una petición mínima
export async function probarClave(proveedor){
  const a=leerAjustes(),p=proveedor||a.proveedor;
  if(!a.claves[p])throw new ErrorIA('sin-clave','Primero pega tu clave.');
  try{await pedir({mensajes:[{role:'user',content:'Responde solo: hola'}],maxTokens:64,proveedor:p});return true}
  catch(e){if(e.codigo==='cortada'||e.codigo==='json')return true;throw e}
}
// Costo estimado en USD de una llamada (0 con Gemini gratis)
export function costoUSD(nivel,entrada,salida,a=leerAjustes()){const [pi,po]=PRECIOS[modeloPara(nivel,a)]||[0,0];return (entrada*pi+salida*po)/1e6}
