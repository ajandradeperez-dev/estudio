/* "📸 Foto a nota" y "🧠 Resuélvelo conmigo" (rutas 'notas/foto' y 'notas/foto/<materia>/<tema>' para archivarla en ese tema).
   - Con API key: Claude (visión) convierte la foto del cuaderno en una nota limpia (texto con formato, fórmulas $…$, pasos),
     marca con ⚠️ los posibles errores de cálculo (sin cambiar lo que dice la foto) y sugiere tarjetas; o guía paso a paso un
     ejercicio sin resolver: pregunta, da pistas graduales y muestra el paso solo si te atoras dos veces.
   - Sin API key: la foto se guarda en la nota y se ofrece OCR local (Tesseract.js, se baja la primera vez y queda en caché).
   Las fotos solo se envían a api.anthropic.com al tocar el botón, comprimidas. */
import {esc} from '../../utilidades.js';
import {aviso,vacio,confirmar} from '../ui.js';
import {tex} from '../formula.js';
import {htmlPasos} from '../procedimiento.js';
import {crearSesion} from '../sesion.js';
import {soporte,escuchar} from '../voz.js';
import {crear} from '../generadores/index.js';
import {generadorDe} from '../practica.js';
import {materias as registro,rutaLeccion} from '../materias.js';
import {registrarEjercicio,registrarRespuesta} from '../progreso.js';
import {pedirJSON,ErrorIA} from '../../materias/ingles/hablar/claude.js';
import {guardarArchivo,leerArchivo,nuevoId} from './db.js';
import {comprimirFoto} from './medios.js';
import {render} from './formato.js';
import {crearNota,guardar} from './notas.js';
import {emparejar,normal} from '../mias/emparejar.js';
import {catalogo,misMaterias,habilidadDe,miMateria,buscarTema} from '../mias/datos.js';
import {validarEjercicio,aPregunta} from '../mias/esquema.js';
import {disponible,costo,bloqueImagen,SIN_CLAVE,MODELO_TEXTO,MODELO_VISION} from '../mias/ia.js';

const repintar=()=>document.dispatchEvent(new Event('repintar'));
const SISTEMA='Eres un profesor paciente que ayuda a estudiantes de Latinoamérica con sus apuntes. Escribes en español neutro. Respondes solo con el JSON pedido.';
const S_PASO={type:'object',additionalProperties:false,required:['que','como','porque','ojo'],properties:{que:{type:'string'},como:{type:'string',description:'Con los números de este ejercicio; fórmulas entre $ y $.'},porque:{type:'string'},ojo:{type:'string',description:'Error típico, o vacío.'}}};
const S_NOTA={type:'object',additionalProperties:false,required:['titulo','tema_sugerido','tipo','contenido_markdown','pasos','conceptos_clave','tarjetas','dudas_o_partes_ilegibles','posibles_errores_en_la_foto'],properties:{
  titulo:{type:'string'},tema_sugerido:{type:'string',description:'El tema escolar de la foto (p. ej. "Regla de la cadena").'},tipo:{type:'string',enum:['apunte','ejemplo_resuelto','ejercicio']},
  contenido_markdown:{type:'string',description:'La transcripción ordenada y limpia, fiel a la foto. Formato: # títulos, **negrita** para lo importante, listas con "- ", pasos numerados "1.", fórmulas entre $ y $ (nunca \\( \\)). No corrijas lo que dice la foto: los errores van en posibles_errores_en_la_foto.'},
  pasos:{type:'array',items:S_PASO,description:'Si es un ejemplo resuelto, sus pasos; si no, vacío.'},conceptos_clave:{type:'array',items:{type:'string'}},
  tarjetas:{type:'array',items:{type:'object',additionalProperties:false,required:['pregunta','respuesta'],properties:{pregunta:{type:'string'},respuesta:{type:'string',description:'Corta (una palabra, número o frase).'}}},description:'3 a 6 tarjetas de repaso.'},
  dudas_o_partes_ilegibles:{type:'array',items:{type:'string'}},
  posibles_errores_en_la_foto:{type:'array',items:{type:'object',additionalProperties:false,required:['donde','error','correccion'],properties:{donde:{type:'string'},error:{type:'string'},correccion:{type:'string',description:'Explica la corrección.'}}}}}};
const S_TUTOR={type:'object',additionalProperties:false,required:['ilegible','tema','habilidad_sugerida','enunciado','mensaje','tipo','correcto','paso_mostrado','solucion'],properties:{
  ilegible:{type:'boolean',description:'true si no se puede leer el ejercicio.'},tema:{type:'string'},habilidad_sugerida:{type:'string',description:'Nombre corto de la habilidad (p. ej. "Regla de la cadena").'},
  enunciado:{type:'string',description:'El ejercicio transcrito (fórmulas entre $ y $).'},mensaje:{type:'string',description:'Lo que le dices ahora al estudiante: una pregunta o una pista corta. Nunca la respuesta final antes de tiempo.'},
  tipo:{type:'string',enum:['pregunta','pista','paso','final']},correcto:{anyOf:[{type:'boolean'},{type:'null'}],description:'Si su última respuesta fue correcta; null en el primer turno.'},
  paso_mostrado:{anyOf:[S_PASO,{type:'null'}],description:'El paso completo, solo si se atoró dos veces.'},
  solucion:{anyOf:[{type:'object',additionalProperties:false,required:['pasos','respuesta'],properties:{pasos:{type:'array',items:S_PASO},respuesta:{type:'string'}}},{type:'null'}],description:'Solo cuando tipo = final.'}}};

async function guardarFotos(files,notaId){
  const ids=[];
  for(const f of files){try{const img=await comprimirFoto(f),id=nuevoId();await guardarArchivo({id,nota:notaId,blob:img.blob,tipo:img.blob.type,ancho:img.ancho,alto:img.alto,creada:Date.now()});ids.push(id)}catch(e){aviso(e.message||'No se pudo guardar la foto.')}}
  return ids;
}
// Tema sugerido → cuaderno: primero las materias propias, luego el catálogo
function cuadernoSugerido(texto){
  const n=normal(texto);if(!n)return null;
  for(const m of misMaterias())for(const u of m.unidades)for(const t of u.temas){const nt=normal(t.titulo);if(nt&&(n.includes(nt)||nt.includes(n)))return {materia:m.id,tema:t.id}}
  const h=emparejar(texto,catalogo()),x=h&&habilidadDe(h);
  return x?{materia:x.m.id,tema:x.l.tema||null,habilidad:h}:null;
}
const md=s=>render(String(s??''),{tex:x=>tex(x)});
const pasosHtml=l=>htmlPasos((l||[]).map(p=>({que:md(p.que).replace(/^<p>|<\/p>$/g,''),como:md(p.como).replace(/^<p>|<\/p>$/g,''),porque:esc(p.porque),ojo:p.ojo?esc(p.ojo):undefined})),{acciones:false});
const textoPasos=l=>(l||[]).map((p,i)=>`${i+1}. **${p.que}**: ${p.como}\n   💡 ${p.porque}${p.ojo?`\n   ⚠️ ${p.ojo}`:''}`).join('\n');

export function vistaFoto(materiaCtx,temaCtx){
  let fotos=[],urls=[],modo='elegir',notaId=null,res=null,titulo='',cuerpo='',cuaderno=null,tarjetas=[],ocupado='',chat=[],tutor=null,fallos=0,parecidos=null,sesion=null;
  const ctx=materiaCtx?{materia:materiaCtx,tema:temaCtx||null}:null;
  const volver=ctx&&/^mp-/.test(ctx.materia)?(ctx.tema?`mias/${ctx.materia}/t/${ctx.tema}`:`mias/${ctx.materia}`):'notas';
  async function pintarFotos(){
    urls.forEach(u=>URL.revokeObjectURL(u));urls=[];
    for(const img of document.querySelectorAll('img[data-foto]')){const a=await leerArchivo(img.dataset.foto).catch(()=>null);if(a?.blob){const u=URL.createObjectURL(a.blob);urls.push(u);img.src=u}}
  }
  const tiraFotos=()=>`<div class="mp-fotos">${fotos.map(f=>`<button type="button" class="mp-foto" data-ver="${esc(f)}"><img data-foto="${esc(f)}" alt="Foto"></button>`).join('')}</div>`;
  async function verFoto(id){const a=await leerArchivo(id).catch(()=>null);if(!a?.blob)return;const u=URL.createObjectURL(a.blob),f=document.createElement('div');f.className='modal-fondo mp-visor';
    f.innerHTML=`<div class="mp-visor-caja"><img src="${u}" alt="Foto"><button type="button" class="btn" data-x>Cerrar</button></div>`;
    f.addEventListener('click',e=>{if(e.target.closest('[data-x]')||e.target===f){f.remove();URL.revokeObjectURL(u)}});document.body.appendChild(f)}
  const opcionesCuaderno=()=>{const ops=[['','General']];
    for(const m of misMaterias()){ops.push([m.id,`🎓 ${m.nombre}`]);for(const u of m.unidades)for(const t of u.temas)ops.push([`${m.id}|${t.id}`,`🎓 ${m.nombre} · ${t.titulo}`])}
    for(const m of registro){ops.push([m.id,m.nombre]);for(const t of m.temas||[])ops.push([`${m.id}|${t.id}`,`${m.nombre} · ${t.titulo}`])}
    const actual=cuaderno?.materia?(cuaderno.tema?`${cuaderno.materia}|${cuaderno.tema}`:cuaderno.materia):'';
    return ops.map(([v,t])=>`<option value="${esc(v)}"${v===actual?' selected':''}>${esc(t)}</option>`).join('')};
  const leerCampos=()=>{const t=document.getElementById('fn-titulo'),c=document.getElementById('fn-cuerpo');if(t)titulo=t.value;if(c)cuerpo=c.value};

  /* ---- IA: foto → nota ---- */
  async function convertir(boton){
    if(!disponible()){aviso(SIN_CLAVE,6000);return}
    ocupado='Leyendo la foto…';repintar();
    try{
      const imgs=[];for(const f of fotos.slice(0,4))imgs.push(await bloqueImagen(f));
      const pedir=extra=>pedirJSON({modelo:MODELO_VISION,schema:S_NOTA,maxTokens:6000,system:SISTEMA,messages:[{role:'user',content:[...imgs,{type:'text',text:`Convierte la foto de mis apuntes en una nota limpia y bien hecha.${extra||''}`}]}]});
      let r;try{r=await pedir()}catch(e){if(e instanceof ErrorIA&&['json','cortada'].includes(e.codigo))r=null;else throw e}
      if(!r||typeof r.contenido_markdown!=='string')r=await pedir(' Responde con JSON válido.');
      if(!String(r.contenido_markdown||'').trim()&&r.dudas_o_partes_ilegibles?.length)throw new ErrorIA('ilegible',`No se pudo leer la foto: ${r.dudas_o_partes_ilegibles[0]}. Prueba con más luz o sin sombra.`);
      res=r;titulo=String(r.titulo||'Apuntes').slice(0,120);
      cuerpo=`${r.contenido_markdown.trim()}${r.pasos?.length&&!/^\s*1\./m.test(r.contenido_markdown)?`\n\n## Pasos\n${textoPasos(r.pasos)}`:''}`;
      tarjetas=(r.tarjetas||[]).filter(t=>t?.pregunta&&t?.respuesta).map(t=>({...t,usar:true}));
      cuaderno=ctx||cuadernoSugerido(`${r.tema_sugerido} ${r.titulo}`)||null;
      modo='revisar';
    }catch(e){aviso(e.message||'No se pudo convertir la foto.',5000)}
    ocupado='';repintar();
  }
  /* ---- sin IA: OCR local ---- */
  async function ocr(){
    ocupado='Preparando el reconocimiento de texto (la primera vez se descarga, ~10 MB)…';repintar();
    try{
      const {createWorker}=await import('tesseract.js');
      const w=await createWorker('spa',1,{logger:m=>{if(m.status==='recognizing text'){const el=document.getElementById('fn-ocupado');if(el)el.textContent=`Leyendo la foto… ${Math.round(m.progress*100)} %`}}});
      const textos=[];for(const f of fotos){const a=await leerArchivo(f);const r=await w.recognize(a.blob);textos.push(r.data.text.trim())}
      await w.terminate();
      titulo=titulo||'Apuntes (transcripción)';cuerpo=textos.filter(Boolean).join('\n\n');res=null;tarjetas=[];cuaderno=ctx;modo='revisar';
      if(!cuerpo)aviso('No se reconoció texto: escríbelo a mano con la foto a la vista.',4000);
    }catch(e){aviso(navigator.onLine?'No se pudo transcribir. Escríbelo a mano con la foto a la vista.':'La primera vez el reconocimiento necesita internet para descargarse.',5000);titulo=titulo||'Apuntes';cuaderno=ctx;modo='revisar'}
    ocupado='';repintar();
  }
  async function guardarNotaFinal(ir){
    leerCampos();
    const extras=[];
    if(res?.posibles_errores_en_la_foto?.length)extras.push(res.posibles_errores_en_la_foto.map(x=>`> ⚠️ **Posible error** (${x.donde}): ${x.error} — ${x.correccion}`).join('\n'));
    if(res?.dudas_o_partes_ilegibles?.length)extras.push(res.dudas_o_partes_ilegibles.map(x=>`> ❓ ${x}`).join('\n'));
    const tars=tarjetas.filter(t=>t.usar&&!cuerpo.includes(`🃏 ${t.pregunta}`)).map(t=>`🃏 ${t.pregunta.replace(/\|/g,'/')} | ${t.respuesta.replace(/\|/g,'/')}`);
    const cuerpoFinal=[cuerpo.trim(),...extras,tars.length?tars.join('\n'):'',fotos.map((f,i)=>`![foto original${fotos.length>1?' '+(i+1):''}](img:${f})`).join('\n')].filter(Boolean).join('\n\n');
    const n=await crearNota({id:notaId,materia:cuaderno?.materia||null,tema:cuaderno?.tema||null,titulo:titulo||'Foto de mis apuntes',cuerpo:cuerpoFinal,etiquetas:res?['foto','ia']:['foto']});
    aviso(tars.length?`📝 Nota guardada con ${tars.length} tarjetas para Repasar`:'📝 Nota guardada');ir(`notas/n/${n.id}`);
  }

  /* ---- tutor: resuélvelo conmigo ---- */
  async function turnoTutor(respuesta){
    ocupado='Pensando…';repintar();
    try{
      const primero=!tutor,contenido=[];
      if(primero)for(const f of fotos.slice(0,2))contenido.push(await bloqueImagen(f));
      const historia=chat.map(x=>x.de==='yo'?`Estudiante: ${x.texto}`:`Tutor: ${x.texto}${x.paso?` [paso mostrado: ${x.paso.que}]`:''}`).join('\n');
      contenido.push({type:'text',text:primero
        ?'Esta foto es un ejercicio sin resolver o a medias. Identifica el tema y guíame paso a paso SIN darme la respuesta: hazme una pregunta sobre qué haría primero. Si no se lee, marca ilegible.'
        :`Ejercicio: ${tutor.enunciado}\nConversación:\n${historia}\nEstudiante: ${respuesta}\nErrores previos del estudiante en este paso: ${fallos}. Califica su respuesta (correcto). Si es incorrecta y con ella llega a 2 errores en el mismo paso, muéstrale el paso completo en paso_mostrado y sigue con el siguiente; si es incorrecta y es su primer error, dale solo una pista corta (no el paso). Si acertó, pasa al siguiente paso con otra pregunta. Cuando ya tenga la respuesta final correcta, usa tipo final con la solución completa.`});
      const r=await pedirJSON({modelo:primero?MODELO_VISION:MODELO_TEXTO,effort:'medium',schema:S_TUTOR,maxTokens:3000,system:SISTEMA,messages:[{role:'user',content:contenido}]});
      if(r.ilegible){aviso('No se pudo leer el ejercicio en la foto. Prueba otra foto con más luz.',5000);if(primero){modo='elegir';ocupado='';repintar();return}}
      if(primero)tutor={tema:r.tema,habilidad:r.habilidad_sugerida,enunciado:r.enunciado};
      if(respuesta!==undefined)chat.push({de:'yo',texto:respuesta});
      if(r.correcto===false)fallos++;else if(r.correcto===true||r.paso_mostrado)fallos=0;
      chat.push({de:'tutor',texto:r.mensaje,tipo:r.tipo,paso:r.paso_mostrado||null});
      if(r.tipo==='final'&&r.solucion?.pasos?.length){tutor.solucion=r.solucion;modo='tutor-final'}
    }catch(e){aviso(e.message||'No se pudo continuar.',5000)}
    ocupado='';repintar();
  }
  async function prepararParecidos(){
    const h=emparejar(`${tutor.habilidad} ${tutor.tema}`,catalogo()),x=h&&habilidadDe(h),g=x&&generadorDe(x.l);
    if(g){parecidos={local:x,preguntas:[1,2,3].map(()=>({...crear(x.l.gen,2),materia:x.m.id,habilidad:x.l.id,ref:`${x.m.id}/g/${x.l.id}/2`}))};repintar();return}
    if(!disponible())return;
    ocupado='Creando ejercicios parecidos…';repintar();
    try{const S={type:'object',additionalProperties:false,required:['ejercicios'],properties:{ejercicios:{type:'array',items:(await import('../mias/ia.js')).S_EJERCICIO_PUBLICO}}};
      const r=await pedirJSON({modelo:MODELO_TEXTO,effort:'medium',schema:S,maxTokens:6000,system:SISTEMA,messages:[{role:'user',content:[{type:'text',text:`Crea 3 ejercicios parecidos a este (mismo tema y dificultad, números distintos), con respuesta verificable, pasos, errores típicos que no sean correctos, regla y pista: ${tutor.enunciado}`}]}]});
      const ok=(r.ejercicios||[]).map((e,i)=>({...e,id:`p${i+1}`,tolerancia:e.tolerancia??undefined,opciones:e.tipo==='opcion'?e.opciones:undefined,correcta:e.tipo==='opcion'?e.correcta:undefined,alternativas:e.alternativas?.length?e.alternativas:undefined,pasos:(e.pasos||[]).map(p=>({...p,ojo:p.ojo||undefined}))})).filter(e=>!validarEjercicio(e).length);
      parecidos={ia:true,preguntas:ok.map(e=>aPregunta(e))};
    }catch(e){aviso(e.message||'No se pudieron crear ejercicios parecidos.')}
    ocupado='';repintar();
  }

  return {
    titulo:'Foto a nota',
    get inmersiva(){return !!sesion},
    alEntrar(){fotos=[];modo='elegir';notaId=nuevoId();res=null;titulo='';cuerpo='';cuaderno=ctx;tarjetas=[];chat=[];tutor=null;fallos=0;parecidos=null;sesion=null},
    alSalir(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[];sesion?.alSalir?.()},
    vista(){
      if(sesion)return sesion.vista();
      const cab=`<div class="nota-cab"><button type="button" class="btn-icono" data-go="${volver}" aria-label="Volver">←</button><span class="nota">${ctx&&miMateria(ctx.materia)?esc(miMateria(ctx.materia).nombre):''}</span><span></span></div>`;
      const espera=ocupado?`<p class="cargando" id="fn-ocupado" aria-live="polite">${esc(ocupado)}</p>`:'';
      if(modo==='elegir')return `${cab}<h1>📸 Foto a nota</h1><p class="intro">Tómale foto a tu cuaderno, al pizarrón o a un ejercicio. Puedes usar varias fotos.</p>
<div class="row"><label class="btn" for="fn-camara">📷 Cámara</label><label class="btn ghost" for="fn-galeria">🖼️ Galería</label>
<input type="file" id="fn-camara" accept="image/*" capture="environment" class="oculto-visual"><input type="file" id="fn-galeria" accept="image/*" multiple class="oculto-visual"></div>
${tiraFotos()}${espera}
${fotos.length&&!ocupado?`<div class="pila" style="margin-top:12px">
<button class="btn ancho" id="fn-ia">✨ Convertir en nota con IA <span class="nota">(${costo('foto-nota',fotos.length)})</span></button>
<button class="btn ghost ancho" id="fn-tutor">🧠 Resuélvelo conmigo <span class="nota">(${costo('tutor')} + unos centavos por turno)</span></button>
${disponible()?'':`<p class="nota">${SIN_CLAVE}</p>`}
<button class="btn ghost ancho" id="fn-ocr">🔤 Transcribir sin IA <span class="nota">(con fórmulas funciona mal)</span></button>
<button class="btn ghost ancho" id="fn-solo">💾 Guardar solo la foto</button></div>`:''}
<p class="nota" style="margin-top:12px">🔒 Las fotos solo se envían a Anthropic si tocas un botón ✨ o 🧠, y solo con tu propia clave.</p>`;
      if(modo==='revisar')return `${cab}<h1>Revisa tu nota</h1>${res?'<p class="ia-etiqueta">✨ Hecha con IA a partir de tu foto: compárala con el original.</p>':''}
<div class="fn-lado">${tiraFotos()}<div class="fn-edicion">
<label class="campo">Título<input id="fn-titulo" class="mp-input" value="${esc(titulo)}" maxlength="120"></label>
<label class="campo">Cuaderno<select id="fn-cuaderno" class="mp-input">${opcionesCuaderno()}</select></label>
${res?.posibles_errores_en_la_foto?.length?`<div class="card fn-errores"><b>⚠️ Posibles errores en la foto</b><ul>${res.posibles_errores_en_la_foto.map(x=>`<li><b>${esc(x.donde)}</b>: ${md(x.error).replace(/<\/?p>/g,'')} → ${md(x.correccion).replace(/<\/?p>/g,'')}</li>`).join('')}</ul><p class="nota" style="margin:0">Tu texto original no se cambió: el aviso queda anotado en la nota.</p></div>`:''}
${res?.dudas_o_partes_ilegibles?.length?`<p class="aviso-linea">❓ No se leyó bien: ${esc(res.dudas_o_partes_ilegibles.join('; '))}</p>`:''}
<label class="campo">Texto <span class="nota">(**negrita**, $fórmulas$, - listas)</span><textarea id="fn-cuerpo" class="nota-cuerpo" rows="10">${esc(cuerpo)}</textarea></label>
${res?.pasos?.length?`<h3>Pasos</h3>${pasosHtml(res.pasos)}`:''}
${res?.conceptos_clave?.length?`<div class="mp-chips">${res.conceptos_clave.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div>`:''}
${tarjetas.length?`<h3>🃏 Tarjetas sugeridas</h3><div class="pila">${tarjetas.map((t,i)=>`<button type="button" class="chip-filtro fn-tarjeta" data-tarjeta="${i}" aria-pressed="${t.usar}">${esc(t.pregunta)} → <b>${esc(t.respuesta)}</b></button>`).join('')}</div>
<p class="nota">Las marcadas se agregan a la nota y entran a Repasar al guardar.</p>`:''}
</div></div>
<div class="pila" style="margin-top:12px"><button class="btn ancho" id="fn-guardar">💾 Guardar nota</button>${tarjetas.length?'<button class="btn ghost ancho" id="fn-tarjetas">🃏 Crear tarjetas</button>':''}</div>`;
      // tutor
      const burbujas=chat.map(x=>x.de==='yo'?`<div class="burbuja yo">${esc(x.texto)}</div>`:`<div class="burbuja ella"><div class="nota-render">${md(x.texto)}</div>${x.paso?pasosHtml([x.paso]):''}</div>`).join('');
      if(modo==='tutor-final'){const g=parecidos;
        return `${cab}<h1>🧠 ¡Lo resolviste!</h1>${tutor?.tema?`<p class="nota">Tema: ${esc(tutor.tema)}</p>`:''}<div class="pregunta">${md(tutor.enunciado)}</div>
<h2>Solución completa</h2>${pasosHtml(tutor.solucion.pasos)}<p><b>Respuesta:</b> ${md(tutor.solucion.respuesta).replace(/<\/?p>/g,'')}</p>
<div class="pila"><button class="btn ancho" id="tu-nota">📝 Guardar como nota</button>
${g?.local?`<p class="nota">La app tiene práctica para esto: <b>${esc(g.local.l.titulo)}</b>.</p><button class="btn ghost ancho" id="tu-practicar">✏️ Practicar 3 parecidos</button><button class="btn ghost ancho" data-go="${rutaLeccion(g.local.m,g.local.l)}">🎯 Ir a ${esc(g.local.l.titulo)}</button>`
  :g?.preguntas?.length?`<button class="btn ghost ancho" id="tu-practicar">✏️ Practicar ${g.preguntas.length} parecidos <span class="nota">✨ IA</span></button>`
  :`<button class="btn ghost ancho" id="tu-parecidos">✏️ Ejercicios parecidos</button>`}</div>${espera}
<details style="margin-top:12px"><summary>Ver la conversación</summary><div class="chat">${burbujas}</div></details>`}
      return `${cab}<h1>🧠 Resuélvelo conmigo</h1>${tutor?.enunciado?`<div class="pregunta">${md(tutor.enunciado)}</div>`:''}${tiraFotos()}
<div class="chat" id="tu-chat">${burbujas}</div>${espera}
${tutor&&!ocupado?`<div class="chat-entrada"><textarea id="tu-texto" rows="2" placeholder="¿Qué harías? Escribe tu paso…" aria-label="Tu respuesta"></textarea>${soporte.escuchar?'<button type="button" class="btn ghost" id="tu-mic" aria-label="Dictar">🎤</button>':''}<button type="button" class="btn" id="tu-enviar">Responder</button></div>
<p class="nota">Si te equivocas dos veces en el mismo paso, te lo muestro completo.</p>`:''}`;
    },
    alMostrar(){
      if(sesion){sesion.alMostrar?.();return}
      for(const id of ['fn-camara','fn-galeria'])document.getElementById(id)?.addEventListener('change',async e=>{const fs=[...e.target.files];e.target.value='';fotos.push(...await guardarFotos(fs,notaId));repintar()});
      document.getElementById('fn-cuaderno')?.addEventListener('change',e=>{const [m,t]=e.target.value.split('|');cuaderno=m?{materia:m,tema:t||null}:null});
      pintarFotos();
      document.getElementById('tu-chat')?.lastElementChild?.scrollIntoView({block:'nearest'});
    },
    async alClic(b,ir,repintarV){
      if(sesion)return sesion.alClic(b,ir,repintarV);
      if(b.dataset.ver){verFoto(b.dataset.ver);return true}
      if(b.id==='fn-ia'){await convertir(b);return true}
      if(b.id==='fn-ocr'){await ocr();return true}
      if(b.id==='fn-solo'){titulo='Foto de mis apuntes';cuerpo='';await guardarNotaFinal(ir);return true}
      if(b.dataset.tarjeta!==undefined){const t=tarjetas[+b.dataset.tarjeta];t.usar=!t.usar;b.setAttribute('aria-pressed',String(t.usar));return true}
      if(b.id==='fn-tarjetas'){leerCampos();const nuevas=tarjetas.filter(t=>t.usar&&!cuerpo.includes(`🃏 ${t.pregunta}`)).map(t=>`🃏 ${t.pregunta.replace(/\|/g,'/')} | ${t.respuesta.replace(/\|/g,'/')}`);
        if(nuevas.length){cuerpo=`${cuerpo.trim()}\n\n${nuevas.join('\n')}`;aviso(`🃏 ${nuevas.length} tarjetas agregadas: entran a Repasar al guardar`)}repintarV();return true}
      if(b.id==='fn-guardar'){await guardarNotaFinal(ir);return true}
      if(b.id==='fn-tutor'){if(!disponible()){aviso(SIN_CLAVE,6000);return true}modo='tutor';await turnoTutor();return true}
      if(b.id==='tu-mic'){try{const r=await escuchar({idioma:'es-MX',alternativas:1,maxSegundos:20});const t=document.getElementById('tu-texto');if(t)t.value=(t.value+' '+r.transcripcion).trim()}catch(e){aviso(e.message)}return true}
      if(b.id==='tu-enviar'){const t=document.getElementById('tu-texto'),v=t?.value.trim();if(v)await turnoTutor(v.slice(0,1000));return true}
      if(b.id==='tu-parecidos'){await prepararParecidos();return true}
      if(b.id==='tu-nota'){const c=`**Ejercicio:** ${tutor.enunciado}\n\n## Solución\n${textoPasos(tutor.solucion.pasos)}\n\n**Respuesta:** ${tutor.solucion.respuesta}\n\n${fotos.map(f=>`![ejercicio](img:${f})`).join('\n')}`;
        const sug=ctx||cuadernoSugerido(`${tutor.habilidad} ${tutor.tema}`);
        const n=await crearNota({id:notaId,materia:sug?.materia||null,tema:sug?.tema||null,titulo:`Resuelto: ${String(tutor.tema||'ejercicio').slice(0,80)}`,cuerpo:c,etiquetas:['resuelto']});
        b.textContent='✅ Guardada';b.disabled=true;aviso(`📝 Nota guardada: «${n.titulo}»`);if(!parecidos)prepararParecidos();return true}
      if(b.id==='tu-practicar'&&parecidos?.preguntas?.length){const l=[...parecidos.preguntas];let i=0;
        sesion=crearSesion({titulo:'Ejercicios parecidos',salir:'notas/foto',total:()=>l.length,materia:parecidos.local?.m.id,habilidad:parecidos.local?.l.id,
          siguiente:()=>l[i++]||null,
          responder(p,r){if(parecidos.local){registrarRespuesta(p.materia,p.habilidad,r);registrarEjercicio({materia:p.materia,ref:p.ref,correcto:r.correcto&&!r.pista,xp:r.correcto?10:0})}return {xp:r.correcto?10:0}},
          fin(st){return `<span class="fin-icono" aria-hidden="true">💪</span><h1>${st.ok} de ${st.i}</h1><button class="btn ancho" id="tu-fin">Listo</button>`}});
        const orig=sesion.alClic.bind(sesion);sesion.alClic=async(t,ir2,rep)=>{if(t.id==='tu-fin'||t.dataset.salir!==undefined&&sesion.estado().fase==='fin'){sesion=null;rep();return true}return orig(t,ir2,rep)};
        sesion.alEntrar();repintarV();return true}
    }
  };
}
