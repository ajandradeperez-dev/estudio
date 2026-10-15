/* IA opcional de "Mis materias" con la clave propia del usuario (Gemini o Claude, en Perfil; vive solo en este dispositivo).
   - Todo pasa por nucleo/ia.js: nivel 'texto' para generar y 'vision' para leer fotos (letra a mano y fórmulas). Con Gemini es
     gratis (plan gratuito); con Claude, Haiku 5.5 para texto y Sonnet 5.5 para fotos (precios en PRECIOS de ia.js).
   - Todo bajo demanda (por tema), con el costo estimado a la vista y un solo reintento si la respuesta no pasa la validación
     estricta (esquema.js). Lo generado se guarda en IndexedDB: se paga una vez y luego funciona sin conexión.
   - Las fotos solo se envían a la API del proveedor cuando el usuario toca el botón, comprimidas (lado mayor 1280 px). */
import {esc} from '../../utilidades.js';
import {aviso,confirmar,vacio} from '../ui.js';
import {leerAjustes,pedirJSON,ErrorIA,costoUSD,nombreProveedor} from '../ia.js';
import {leerArchivo} from '../cuaderno/db.js';
import {render} from '../cuaderno/formato.js';
import {tex} from '../formula.js';
import {htmlPasos} from '../procedimiento.js';
import {soporte,escuchar} from '../voz.js';
import {crearNota} from '../cuaderno/notas.js';
import {validarBanco,validarEjercicio,FORMATO} from './esquema.js';
import {normal} from './emparejar.js';
import {miMateria,guardarGenerado,buscarTema} from './datos.js';

export const MODELO_TEXTO='texto',MODELO_VISION='vision';   // niveles de nucleo/ia.js (el modelo concreto depende del proveedor)
export const disponible=()=>!!leerAjustes().clave;
export const SIN_CLAVE='Para usar ✨ necesitas tu propia clave de IA: la de Gemini es gratis con tu cuenta de Google (aistudio.google.com → Get API key) y se pega en Perfil → ✨ Inteligencia artificial. Se guarda solo en este teléfono. Sin clave, todo lo demás funciona igual.';

/* ---------- costo estimado ---------- */
// tokens aproximados: una foto comprimida ~1 600 de entrada; lo demás según lo que se pide
const ESTIMADOS={foto:{m:MODELO_VISION,ent:1800,sal:1500},tema:{m:MODELO_TEXTO,ent:1500,sal:14000},simulacro:{m:MODELO_VISION,ent:1800,sal:9000,porFoto:true},
  pregunta:{m:MODELO_TEXTO,ent:2500,sal:1500},'foto-nota':{m:MODELO_VISION,ent:1800,sal:2500},tutor:{m:MODELO_VISION,ent:2500,sal:1200}};
export function dolares(tipo,n=1){
  const e=ESTIMADOS[tipo];
  const ent=tipo==='simulacro'?e.ent*n+1500:e.ent*n,sal=tipo==='simulacro'?e.sal:e.sal*(tipo==='foto'||tipo==='foto-nota'?n:1);
  return costoUSD(e.m,ent,sal);
}
export function costo(tipo,n=1){if(dolares(tipo,n)===0)return 'gratis con Gemini';const c=Math.max(1,Math.ceil(dolares(tipo,n)*100));return `~${c} ${c===1?'centavo':'centavos'} de dólar`}
async function confirmarCosto(tipo,n,que){
  if(dolares(tipo,n)<0.02)return true;
  return confirmar({titulo:`¿${que}?`,texto:`Usa tu clave de ${nombreProveedor()} y cuesta ${costo(tipo,n)} de tu saldo.`,si:'Sí, continuar'});
}

/* ---------- llamada común ---------- */
// JSON inválido o cortado cuenta como una respuesta que no cumple: se reintenta una vez como las demás
const intentar=async(fn,...a)=>{try{return await fn(...a)}catch(e){if(e instanceof ErrorIA&&['json','cortada'].includes(e.codigo))return {__invalido:e.message};throw e}};
async function llamar({modelo=MODELO_TEXTO,system,contenido,schema,maxTokens=4000,effort='low'}){
  if(!disponible())throw new ErrorIA('sin-clave',SIN_CLAVE);
  return pedirJSON({modelo,effort,system,messages:[{role:'user',content:contenido}],schema,maxTokens});
}
// Botón ocupado mientras llega la respuesta; los errores se muestran como aviso
async function conBoton(boton,texto,fn){
  const antes=boton?.innerHTML;if(boton){boton.disabled=true;boton.innerHTML=`⏳ ${texto}`}
  try{return await fn()}catch(e){aviso(e instanceof ErrorIA?e.message:`No se pudo: ${e.message||e}`,5000);return null}
  finally{if(boton&&document.body.contains(boton)){boton.disabled=false;boton.innerHTML=antes}}
}
// Foto guardada → bloque de imagen para la API (comprimida a 1280 px, JPEG)
export async function bloqueImagen(id){
  const a=await leerArchivo(id);if(!a?.blob)throw new Error('No se encontró la foto.');
  const img=await createImageBitmap(a.blob),k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement('canvas');
  c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);img.close?.();
  const data=c.toDataURL('image/jpeg',.8).split(',')[1];
  return {type:'image',source:{type:'base64',media_type:'image/jpeg',data}};
}
const SISTEMA='Eres un profesor universitario que prepara a estudiantes de Latinoamérica para sus exámenes. Escribes en español neutro, claro y breve. Respondes solo con el JSON pedido. Las fórmulas van en TeX entre \\( y \\).';

/* ---------- leer el temario desde fotos ---------- */
const S_TEMARIO={type:'object',additionalProperties:false,required:['materia','unidades','examenes_detectados','notas'],properties:{
  materia:{type:'string',description:'Nombre de la materia si aparece; si no, cadena vacía.'},
  unidades:{type:'array',description:'Unidades en el orden del programa.',items:{type:'object',additionalProperties:false,required:['titulo','temas'],properties:{
    titulo:{type:'string'},temas:{type:'array',items:{type:'object',additionalProperties:false,required:['titulo','subtemas'],properties:{titulo:{type:'string'},subtemas:{type:'array',items:{type:'string'}}}}}}}},
  examenes_detectados:{type:'array',description:'Exámenes con fecha visible en el programa (AAAA-MM-DD). Vacío si no hay.',items:{type:'object',additionalProperties:false,required:['nombre','fecha'],properties:{nombre:{type:'string'},fecha:{type:'string'}}}},
  notas:{type:'string',description:'Partes ilegibles o dudas, en una frase. Vacío si todo se leyó bien.'}}};
export async function leerTemarioFotos(fotos,{boton}={}){
  if(!disponible()){aviso(SIN_CLAVE,6000);return null}
  if(!fotos.length)return null;
  if(!(await confirmarCosto('foto',fotos.length,'Leer el temario con IA')))return null;
  return conBoton(boton,'Leyendo la foto…',async()=>{
    const imgs=[];for(const f of fotos.slice(0,6))imgs.push(await bloqueImagen(f));
    const pedir=extra=>llamar({modelo:MODELO_VISION,schema:S_TEMARIO,maxTokens:4000,system:SISTEMA,
      contenido:[...imgs,{type:'text',text:`Estas fotos son el programa (temario) de una materia. Transcríbelo como unidades → temas → subtemas, sin inventar nada que no esté. Quita la numeración de los títulos. Si una línea no se lee, ponla en "notas".${extra||''}`}]});
    const ok=r=>Array.isArray(r?.unidades)&&r.unidades.some(u=>typeof u?.titulo==='string'&&Array.isArray(u.temas)&&u.temas.some(t=>typeof t?.titulo==='string'&&t.titulo.trim()));
    let r=await intentar(pedir);if(!ok(r))r=await intentar(pedir,' La respuesta anterior no traía temas o no era JSON válido: revisa de nuevo con cuidado.');
    if(!ok(r))throw new ErrorIA('ilegible','No se pudo leer un temario en la foto. Prueba con más luz y la hoja completa, o escríbelo a mano.');
    if(r.notas)aviso(`✨ Nota de la IA: ${r.notas}`,6000);
    return {nombre:String(r.materia||'').trim(),unidades:r.unidades.map(u=>({titulo:String(u.titulo).trim()||'Unidad',temas:(u.temas||[]).filter(t=>String(t?.titulo||'').trim()).map(t=>({titulo:String(t.titulo).trim(),subtemas:(t.subtemas||[]).map(String).filter(Boolean)}))})).filter(u=>u.temas.length),
      examenes:(r.examenes_detectados||[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x?.fecha)&&!isNaN(Date.parse(x.fecha))&&x.nombre).map(x=>({nombre:String(x.nombre),fecha:x.fecha}))};
  });
}

/* ---------- lección y banco de ejercicios de un tema ---------- */
const S_PASO={type:'object',additionalProperties:false,required:['que','como','porque','ojo'],properties:{que:{type:'string',description:'Lo que se hace en este paso.'},
  como:{type:'string',description:'La operación con los números de ESTE ejercicio.'},porque:{type:'string',description:'La razón o regla en lenguaje simple.'},ojo:{type:'string',description:'Error típico en este paso, o cadena vacía.'}}};
const S_EJERCICIO={type:'object',additionalProperties:false,required:['id','nivel','tipo','enunciado','respuesta','tolerancia','alternativas','opciones','correcta','pasos','errores','regla','pista'],properties:{
  id:{type:'string'},nivel:{type:'integer',enum:[1,2,3]},tipo:{type:'string',enum:['numero','expresion','texto','opcion']},
  enunciado:{type:'string'},respuesta:{type:'string',description:'Como la escribiría el estudiante. numero: solo el número (puede ser fracción a/b). expresion: con ^ y *, en x u otras letras. opcion: el texto exacto de la opción correcta.'},
  tolerancia:{anyOf:[{type:'number'},{type:'null'}],description:'Solo para numero: tolerancia absoluta (0 si es exacto).'},
  alternativas:{type:'array',items:{type:'string'},description:'Otras formas correctas de escribir la respuesta (texto o expresión).'},
  opciones:{type:'array',items:{type:'string'},description:'Solo para opcion: 3 o 4 opciones. Vacío en los demás tipos.'},
  correcta:{anyOf:[{type:'integer'},{type:'null'}],description:'Solo para opcion: índice de la correcta.'},
  pasos:{type:'array',items:S_PASO,description:'De 2 a 6 pasos.'},
  errores:{type:'array',items:{type:'object',additionalProperties:false,required:['valor','por'],properties:{valor:{type:'string'},por:{type:'string'}}},description:'1 a 3 respuestas incorrectas típicas con su explicación.'},
  regla:{type:'string'},pista:{type:'string'}}};
const S_BANCO={type:'object',additionalProperties:false,required:['leccion','ejercicios'],properties:{
  leccion:{type:'object',additionalProperties:false,required:['idea','ejemplo','hueco'],properties:{
    idea:{type:'string',description:'La idea clave en 2 a 4 frases.'},
    ejemplo:{type:'object',additionalProperties:false,required:['enunciado','pasos'],properties:{enunciado:{type:'string'},pasos:{type:'array',items:S_PASO}}},
    hueco:{type:'object',additionalProperties:false,required:['enunciado','pasos','pregunta','respuesta','alternativas'],properties:{enunciado:{type:'string'},pasos:{type:'array',items:S_PASO,description:'Todos los pasos menos el último.'},
      pregunta:{type:'string',description:'Lo que falta (el último paso).'},respuesta:{type:'string'},alternativas:{type:'array',items:{type:'string'}}}}}},
  ejercicios:{type:'array',items:S_EJERCICIO,description:'Entre 15 y 25 ejercicios en 3 niveles; casi todos de escribir la respuesta (numero, expresion o texto) y como mucho 3 de opcion.'}}};
// Respuesta cruda → formato del banco (sin nulos ni campos vacíos que no aplican)
function normalizarEjercicio(x,i){
  const y={...x,id:/^[\w-]{1,20}$/.test(String(x?.id||''))?String(x.id):`e${i+1}`,respuesta:String(x?.respuesta??'').trim(),pasos:(x?.pasos||[]).map(p=>({...p,ojo:p?.ojo||undefined}))};
  if(y.tipo!=='numero'||y.tolerancia===null)delete y.tolerancia;
  if(y.tipo!=='opcion'){delete y.opciones;delete y.correcta}
  if(!y.alternativas?.length)delete y.alternativas;
  return y;
}
function normalizarBanco(r){
  const l=r?.leccion||{},paso=p=>({...p,ojo:p?.ojo||undefined});
  return {leccion:{idea:l.idea,ejemplo:{enunciado:l.ejemplo?.enunciado,pasos:(l.ejemplo?.pasos||[]).map(paso)},hueco:{...l.hueco,pasos:(l.hueco?.pasos||[]).map(paso)}},
    ejercicios:(r?.ejercicios||[]).map(normalizarEjercicio)};
}
export async function generarTema(m,t,{boton}={}){
  if(!disponible()){aviso(SIN_CLAVE,6000);return null}
  if(!(await confirmarCosto('tema',1,`Generar «${t.titulo}»`)))return null;
  return conBoton(boton,'Generando lección y ejercicios…',async()=>{
    const u=buscarTema(m,t.id)?.u;
    const pedir=extra=>llamar({modelo:MODELO_TEXTO,effort:'medium',schema:S_BANCO,maxTokens:20000,system:SISTEMA,contenido:[{type:'text',text:
      `Materia: ${m.nombre}${m.escuela?` (${m.escuela})`:''}. Unidad: ${u?.titulo||''}. Tema: ${t.titulo}.${t.subtemas.length?` Subtemas: ${t.subtemas.join('; ')}.`:''}
Crea para este tema:
1) Una mini lección: la idea clave, un ejemplo resuelto paso a paso (que/como/porque/ojo, con los números del ejemplo) y un ejemplo con hueco (el estudiante completa el último paso).
2) Entre 15 y 25 ejercicios en 3 niveles de dificultad (1 fácil, 2 medio, 3 difícil), cada uno con respuesta única verificable, pasos, 1 a 3 errores típicos (que NO sean correctos) y la regla.
Usa el tipo correcto: numero (respuesta numérica), expresion (una expresión algebraica), texto (una palabra o frase corta, con alternativas), opcion (solo para introducir, máximo 3).
Si el tema no es de cálculo, usa sobre todo texto y numero con respuestas cortas y precisas.${extra||''}`}]});
    const revisar=r=>r?.__invalido?{ok:false,errores:['la respuesta no era JSON válido']}:validarBanco(normalizarBanco(r));
    let v=revisar(await intentar(pedir));
    if(!v.ok)v=revisar(await intentar(pedir,`\nIMPORTANTE: la respuesta anterior no pasó la revisión (${v.errores.slice(0,4).join('; ')}). Corrige eso: JSON válido, cada respuesta debe pasar su propia verificación y ningún error típico puede ser correcto.`));
    if(!v.ok)throw new ErrorIA('invalido',`La IA no generó ejercicios válidos (${v.errores[0]||'formato'}). No se gastó más: intenta más tarde.`);
    return guardarGenerado({...v.banco,formato:FORMATO,id:`${m.id}/${t.id}`,materia:m.id,tema:t.id,creado:Date.now(),modelo:MODELO_TEXTO});
  });
}

/* ---------- simulacro con el estilo de exámenes pasados ---------- */
const S_SIMULACRO={type:'object',additionalProperties:false,required:['ejercicios'],properties:{ejercicios:{type:'array',items:{...S_EJERCICIO,required:[...S_EJERCICIO.required,'tema'],
  properties:{...S_EJERCICIO.properties,tema:{type:'string',description:'El título exacto del tema de la lista al que corresponde.'}}},description:'Entre 10 y 15 ejercicios.'}}};
export async function generarSimulacro(m,ex,{boton}={}){
  if(!disponible()){aviso(SIN_CLAVE,6000);return null}
  if(!m.referencias.length)return null;
  if(!(await confirmarCosto('simulacro',m.referencias.length,'Generar un simulacro con el estilo de tu profesor')))return null;
  return conBoton(boton,'Generando simulacro…',async()=>{
    const temas=m.unidades.filter(u=>ex.unidades.includes(u.id)).flatMap(u=>u.temas);
    const imgs=[];for(const f of m.referencias.slice(0,4))imgs.push(await bloqueImagen(f));
    const pedir=extra=>llamar({modelo:MODELO_VISION,schema:S_SIMULACRO,maxTokens:16000,system:SISTEMA,contenido:[...imgs,{type:'text',text:
      `Estas fotos son exámenes pasados o tareas de «${m.nombre}». Úsalas SOLO como referencia de estilo, formato y dificultad: NO copies sus preguntas ni sus números.
Crea un simulacro nuevo para «${ex.nombre}» con 10 a 15 ejercicios de estos temas: ${temas.map(t=>t.titulo).join('; ')}.
Cada ejercicio con respuesta única verificable, pasos, errores típicos (que no sean correctos), regla y el tema exacto de la lista.${extra||''}`}]});
    const validar=r=>{const ok=[];(r?.ejercicios||[]).map(normalizarEjercicio).forEach(x=>{if(!validarEjercicio(x).length){const t=temas.find(y=>normal(y.titulo)===normal(x.tema||''));ok.push({...x,tema:t?.id||null})}});return ok};
    let ej=validar(await intentar(pedir));if(ej.length<6)ej=validar(await intentar(pedir,'\nLa respuesta anterior tenía ejercicios inválidos o no era JSON válido: cada respuesta debe pasar su verificación.'));
    if(ej.length<6)throw new ErrorIA('invalido','La IA no generó suficientes ejercicios válidos. Intenta más tarde.');
    return guardarGenerado({formato:FORMATO,id:`${m.id}/simulacro-${ex.id}`,materia:m.id,tema:`simulacro-${ex.id}`,simulacro:true,creado:Date.now(),modelo:MODELO_VISION,leccion:null,ejercicios:ej});
  });
}

/* ---------- "Pregúntale a tu temario" ---------- */
const S_RESPUESTA={type:'object',additionalProperties:false,required:['respuesta','pasos','titulo_nota'],properties:{
  respuesta:{type:'string',description:'Respuesta en español, clara y breve. Formato: **negrita**, listas con "- ", fórmulas entre $ y $ (no uses \\( \\)).'},
  pasos:{type:'array',items:S_PASO,description:'Si es un procedimiento, los pasos; si no, vacío.'},titulo_nota:{type:'string',description:'Un título corto para guardarlo como nota.'}}};
export function vistaPreguntar(id,tid){
  let chat=[],enviando=false;
  const m0=()=>miMateria(id),t0=()=>tid&&m0()&&buscarTema(m0(),tid)?.t;
  return {
    titulo:'Pregúntale a tu temario',
    alEntrar(){chat=[]},
    vista(){
      const m=m0();if(!m)return vacio({icono:'💬',titulo:'Esa materia no existe',boton:'<button class="btn" data-go="mias">Mis materias</button>'});
      const t=t0();
      return `<div class="mp-pagina" style="--mp:${esc(m.color)}"><div class="nota-cab"><button type="button" class="btn-icono" data-go="${t?`mias/${id}/t/${tid}`:`mias/${id}`}" aria-label="Volver">←</button><span class="nota">${esc(m.nombre)}</span><span></span></div>
<h1>💬 Pregúntale a tu temario</h1><p class="intro">${t?`Sobre «${esc(t.titulo)}»: `:''}pregunta tus dudas y te lo explico paso a paso. ${disponible()?`Cada pregunta cuesta ${costo('pregunta')}.`:''}</p>
${disponible()?'':`<p class="aviso-linea">${SIN_CLAVE}</p>`}
<div class="chat" id="chat">${chat.map((x,i)=>x.de==='yo'?`<div class="burbuja yo">${esc(x.texto)}</div>`:`<div class="burbuja ella"><div class="nota-render">${render(x.respuesta,{tex:s=>tex(s)})}</div>${x.pasos?.length?htmlPasos(x.pasos.map(p=>({que:esc(p.que),como:esc(p.como),porque:esc(p.porque),ojo:p.ojo?esc(p.ojo):undefined})),{acciones:false}):''}
<button type="button" class="btn ghost btn-chico" data-guardar="${i}">📝 Guardar en mis notas</button></div>`).join('')}${enviando?'<p class="cargando">Pensando</p>':''}</div>
${disponible()?`<div class="chat-entrada"><textarea id="pq-texto" rows="2" placeholder="Escribe tu duda…" aria-label="Tu pregunta"></textarea>${soporte.escuchar?'<button type="button" class="btn ghost" id="pq-mic" aria-label="Dictar">🎤</button>':''}<button type="button" class="btn" id="pq-enviar">Preguntar</button></div>`:''}</div>`;
    },
    async alClic(b,ir,repintarV){
      const m=m0();if(!m)return;
      if(b.id==='pq-mic'){try{const r=await escuchar({idioma:'es-MX',alternativas:1,maxSegundos:20});const t=document.getElementById('pq-texto');if(t)t.value=(t.value+' '+r.transcripcion).trim()}catch(e){aviso(e.message)}return true}
      if(b.id==='pq-enviar'){const caja=document.getElementById('pq-texto'),q=caja?.value.trim();if(!q||enviando)return true;
        chat.push({de:'yo',texto:q.slice(0,2000)});enviando=true;repintarV();
        try{const t=t0(),temario=m.unidades.map(u=>`${u.titulo}: ${u.temas.map(x=>x.titulo).join(', ')}`).join('\n');
          const historia=chat.slice(-7,-1).map(x=>x.de==='yo'?`Estudiante: ${x.texto}`:`Profesor: ${x.respuesta}`).join('\n');
          const r=await llamar({modelo:MODELO_TEXTO,effort:'medium',schema:S_RESPUESTA,maxTokens:3000,system:SISTEMA,contenido:[{type:'text',text:
            `Materia: ${m.nombre}. Temario:\n${temario}\n${t?`El estudiante está estudiando el tema «${t.titulo}».`:''}\n${historia?`Conversación hasta ahora:\n${historia}\n`:''}Pregunta del estudiante: ${q}\nResponde paso a paso, con ejemplos si ayudan. Si la duda no es de esta materia, respóndela breve igual.`}]});
          chat.push({de:'ella',respuesta:String(r.respuesta||''),pasos:Array.isArray(r.pasos)?r.pasos.filter(p=>p?.que&&p?.como):[],titulo:String(r.titulo_nota||q).slice(0,80)});
        }catch(e){chat.push({de:'ella',respuesta:`⚠️ ${e.message||'No se pudo responder.'}`,pasos:[],titulo:''})}
        enviando=false;repintarV();setTimeout(()=>document.getElementById('chat')?.lastElementChild?.scrollIntoView({block:'start',behavior:'smooth'}),50);return true}
      if(b.dataset.guardar!==undefined){const x=chat[+b.dataset.guardar];if(!x)return true;
        const cuerpo=`${x.respuesta}${x.pasos?.length?'\n\n'+x.pasos.map((p,i)=>`${i+1}. **${p.que}**: ${p.como}\n   💡 ${p.porque}${p.ojo?`\n   ⚠️ ${p.ojo}`:''}`).join('\n'):''}`;
        const n=await crearNota({materia:id,tema:tid||null,titulo:x.titulo||'Duda resuelta',cuerpo,etiquetas:['ia']});b.textContent='✅ Guardado';b.disabled=true;aviso(`📝 Guardado en «${n.titulo}»`);return true}
    }
  };
}

// Permiso para los avisos del examen (una semana y un día antes)
export const S_EJERCICIO_PUBLICO=S_EJERCICIO;
export async function pedirPermisoAvisos(){try{if('Notification' in window&&Notification.permission==='default')await Notification.requestPermission();
  const reg=await navigator.serviceWorker.ready;if('periodicSync' in reg)await reg.periodicSync.register('recordatorio-racha',{minInterval:60*60*1000})}catch(e){}}
