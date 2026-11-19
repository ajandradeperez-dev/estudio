/* 💬 Conversa con la IA (Gemini o Claude, ver nucleo/ia.js). Eliges nivel (A1–B2) y situación. Flujo: hablas →
   transcripción → la IA (solo texto, nunca audio) → respuesta leída en voz alta.
   - La IA ajusta vocabulario y longitud al nivel; en A1/A2 ofrece una pista («Puedes decir: I would like…»).
   - Corrección suave: bajo lo que dijiste, una línea con la versión corregida si hubo error (se puede ocultar).
   - Botones: 🔁 Repite, 🐢 Más lento, 🇪🇸 ¿Qué significa? (traduce la última frase) y 💡 Ayúdame a responder.
   - Máximo 20 turnos. Al terminar: reporte, errores, palabras nuevas (🃏 a Repasar) y tiempo hablado; cuenta para la
     racha y la XP. Las conversaciones quedan en el historial (progreso: extra.conversaciones, se sincroniza como lo demás)
     y se pueden borrar. Errores de IA claros: clave inválida, límite gratis (429) y sin conexión. */
import {$,esc} from '../../../utilidades.js';
import {soporte,hablar,htmlMic,htmlOir,htmlFraseEvaluada,escucharConBoton,AVISO_PRIVACIDAD,AVISO_SIN_RECONOCIMIENTO} from '../../../nucleo/voz.js';
import {evaluar} from '../../../nucleo/pronunciacion.js';
import {registrarEjercicio,registrarHabla,registrarSonidos,guardarFrase,programarRepaso,guardarNota,hoy,cambiarExtra,progreso,datosMateria,agregarTarjeta} from '../../../nucleo/progreso.js';
import {SONIDOS} from '../errores-pronunciacion.js';
import {leerAjustes,pedir,pedirJSON,nombreModelo} from '../../../nucleo/ia.js';
import {nivelIngles} from './nivel.js';
import {htmlCierre,xpHoy} from '../../../nucleo/cierre.js';
import {premiarTurno,htmlPremio,terminarConversacion} from './juego.js';
import {confirmar,aviso} from '../../../nucleo/ui.js';

export const MAX_TURNOS=20;
export const NIVELES_CHARLA=['A1','A2','B1','B2'];
export const ESCENARIOS=[
  {id:'presentarte',titulo:'Presentarte',desc:'Conoces a alguien nuevo: nombre, de dónde eres, a qué te dedicas y qué te gusta.'},
  {id:'pedir-comida',titulo:'Pedir comida',desc:'Estás en un restaurante: pides, preguntas por los platos y pagas la cuenta.'},
  {id:'entrevista',titulo:'Entrevista de trabajo',desc:'Te entrevistan para un puesto: experiencia, fortalezas, un problema que resolviste.'},
  {id:'soporte-ti',titulo:'Soporte técnico de TI',desc:'Llamas a soporte porque tu laptop o tu cuenta no funcionan; explicas el problema y sigues instrucciones.'},
  {id:'incidente',titulo:'Reportar un incidente de seguridad',desc:'Le cuentas a tu jefe un correo de phishing o un acceso sospechoso: qué pasó, qué hiciste y qué falta.'},
  {id:'viaje',titulo:'De viaje',desc:'Aeropuerto, hotel y transporte: pedir información, resolver un problema y hacer planes.'},
  {id:'opinar',titulo:'Opinar sobre un tema',desc:'Das tu opinión sobre un tema actual (trabajo remoto, redes sociales, IA) y la defiendes con razones.'},
  {id:'libre',titulo:'Tema libre',desc:'Hablen de lo que quieras: tu día, tus planes, tu trabajo o tus pasatiempos.'}
];

const CORRECCION={type:'object',additionalProperties:false,required:['dije','correcto','explicacion','tipo'],properties:{
  dije:{type:'string'},correcto:{type:'string'},explicacion:{type:'string'},tipo:{type:'string',enum:['gramatica','vocabulario','pronunciacion','naturalidad']}}};
const ESQUEMA_TURNO={type:'object',additionalProperties:false,required:['respuesta','correcciones','frase_mejorada','nueva_palabra','pista'],properties:{
  respuesta:{type:'string'},correcciones:{type:'array',items:CORRECCION},frase_mejorada:{type:'string'},pista:{type:'string'},
  nueva_palabra:{type:'object',additionalProperties:false,required:['en','es'],properties:{en:{type:'string'},es:{type:'string'}}}}};
const ESQUEMA_REPORTE={type:'object',additionalProperties:false,required:['fortalezas','errores_frecuentes','frases_para_practicar','nivel_estimado'],properties:{
  fortalezas:{type:'array',items:{type:'string'}},
  errores_frecuentes:{type:'array',items:{type:'object',additionalProperties:false,required:['error','correcto','explicacion'],properties:{error:{type:'string'},correcto:{type:'string'},explicacion:{type:'string'}}}},
  frases_para_practicar:{type:'array',items:{type:'object',additionalProperties:false,required:['en','es'],properties:{en:{type:'string'},es:{type:'string'}}}},
  nivel_estimado:{type:'string',enum:['A1','A2','B1','B2','C1','C2']}}};
const ESQUEMA_AYUDA={type:'object',required:['opciones'],properties:{opciones:{type:'array',items:{type:'object',required:['en','es'],properties:{en:{type:'string'},es:{type:'string'}}}}}};

const ESTILO={A1:'Use very short, simple sentences (max 8 words), present tense and the most common words. Speak slowly and clearly.',
  A2:'Use short sentences (max 12 words), everyday vocabulary, present, past and going to.',
  B1:'Use natural sentences of medium length, common phrasal verbs and connectors; ask for opinions and reasons.',
  B2:'Speak naturally, with idioms and collocations, and challenge the learner with follow-up questions and opinions.'};
const sistemaTurno=(nivel,esc_)=>`Eres un tutor de inglés amable y un compañero de conversación. Nivel del alumno (MCER): ${nivel}. ${ESTILO[nivel]||''}
Situación: ${esc_.titulo}. ${esc_.desc}
Haz UNA pregunta a la vez para que el alumno hable más que tú. Su texto viene de reconocimiento de voz: ignora la puntuación y las mayúsculas, pero detecta palabras que probablemente pronunció mal y márcalas como "pronunciacion".
"respuesta": tu siguiente intervención, en inglés, natural y breve (1-3 frases), terminando con una pregunta mientras la conversación siga. No interrumpas para corregir: la corrección va aparte.
"correcciones": máximo 2, sobre lo último que dijo el alumno; "explicacion" en español y corta. Si no hay errores, lista vacía.
"frase_mejorada": la versión correcta y natural en inglés de lo último que dijo (si no dijo nada todavía, una frase útil para responderte).
"pista": ${['A1','A2'].includes(nivel)?'una ayuda en español para responder tu pregunta, con el inicio de una frase en inglés (ej.: «¿Quieres una pista? Puedes decir: I would like…»)':'cadena vacía'}.
"nueva_palabra": una palabra o expresión útil de la situación, con su traducción al español.`;
const sistemaReporte=nivel=>`Eres un tutor de inglés. Analiza la conversación anterior con un alumno hispanohablante (nivel declarado ${nivel}) y genera su reporte final.
"fortalezas": 2-3 cosas que hizo bien, en español. "errores_frecuentes": los 3 errores más repetidos o importantes (error tal como lo dijo, forma correcta en inglés, explicación corta en español).
"frases_para_practicar": 5 frases útiles en inglés para su siguiente práctica, con traducción al español. "nivel_estimado": tu estimación MCER según lo que produjo.`;

const ajustesCharla=()=>{try{return JSON.parse(localStorage.getItem('ciberlab-charla')||'{}')||{}}catch(e){return {}}};
const guardarAjusteCharla=(k,v)=>{try{const a=ajustesCharla();a[k]=v;localStorage.setItem('ciberlab-charla',JSON.stringify(a))}catch(e){}};
const historial=()=>datosMateria(progreso(),'ingles').extra.conversaciones||[];

export function vistaIA(){
  let st={fase:'elegir'};
  const ultimaIA=()=>st.log?.filter(m=>m.rol==='tutor').at(-1)?.data?.respuesta||'';
  function htmlElegir(){
    const a=leerAjustes(),n=ajustesCharla().nivel||nivelIngles(),hs=historial();
    return `${!a.clave?`<div class="card aviso"><h3>Falta tu clave de IA</h3><p>La conversación usa la IA con tu propia clave (Gemini es gratis con tu cuenta de Google). Mientras la consigues, practica con los <button class="enlace" data-go="estudio/ingles/hablar">diálogos guiados</button>, que funcionan sin IA.</p><button class="btn" data-go="ajustes-ia">✨ Configurar la IA</button></div>`
      :`<p class="nota">Modelo: ${esc(nombreModelo())} · máximo ${MAX_TURNOS} turnos. <button class="enlace" data-go="ajustes-ia">Ajustes</button></p>`}
<p class="nota">${AVISO_PRIVACIDAD}</p>
<div class="ajuste" style="border:0"><span>Tu nivel</span><span class="segmentos" role="group" aria-label="Nivel">${NIVELES_CHARLA.map(x=>`<button type="button" data-nivel-charla="${x}" aria-pressed="${n===x}">${x}</button>`).join('')}</span></div>
<h2>Elige una situación</h2>
<div class="grid">${ESCENARIOS.map(e=>`<button class="card click escenario" data-escenario="${e.id}"${a.clave?'':' disabled'}><h3>${e.titulo}</h3><p class="nota">${e.desc}</p></button>`).join('')}</div>
${hs.length?`<h2>Tus conversaciones</h2><ul class="lista-simple">${hs.slice(-8).reverse().map(h=>`<li><b>${esc(h.titulo)}</b> · ${h.fecha} · ${h.nivel} · ${h.turnos} turnos${h.estimado?` · estimado ${h.estimado}`:''}</li>`).join('')}</ul>
<button class="btn ghost btn-chico" id="ia-borrar-historial">🗑️ Borrar historial de conversaciones</button>`:''}`;
  }
  const ocultas=()=>!!ajustesCharla().ocultarCorrecciones;
  const tarjetaTutor=(m,k)=>`<div class="burbuja pj"><span class="quien">Tutor</span><span lang="en">${esc(m.data.respuesta)}</span>
${m.traduccion?`<span class="nota">🇪🇸 ${esc(m.traduccion)}</span>`:''}
${m.data.pista&&k===st.log.length-1?`<span class="nota">💡 ${esc(m.data.pista)}</span>`:''}
${m.data.nueva_palabra?.en?`<span class="nota">🆕 <b lang="en">${esc(m.data.nueva_palabra.en)}</b> = ${esc(m.data.nueva_palabra.es)}</span>`:''}</div>`;
  // Lo que dijiste y, debajo, la versión corregida (corrección suave; se puede ocultar)
  const burbujaYo=(m,k)=>{const sig=st.log[k+1]?.data,corr=sig?.correcciones?.length?sig.frase_mejorada:'';
    return `<div class="burbuja yo"><span class="quien">Tú</span><span lang="en">${esc(m.texto)}</span>${corr&&!ocultas()?`<span class="charla-correccion">✏️ <span lang="en">${esc(corr)}</span> <span class="nota">${esc(sig.correcciones.map(c=>c.explicacion).join(' · '))}</span>${soporte.escuchar?` <button class="enlace" data-repetir="${k+1}">🎙️ Repetir</button>`:''}</span><div id="ia-eval-${k+1}"></div>`:''}</div>`};

  function htmlChat(){
    const tutor=st.log.filter(m=>m.rol==='tutor').length;
    return `<p class="progress">${esc(st.esc.titulo)} · ${st.nivel} · turno ${st.turnos} de ${MAX_TURNOS}</p>
<div class="chat">${st.log.map((m,k)=>m.rol==='tutor'?tarjetaTutor(m,k):burbujaYo(m,k)).join('')}</div>
${st.ayuda?`<div class="card charla-ayuda"><p class="etiqueta-actividad">💡 Podrías responder:</p><ul>${st.ayuda.map(o=>`<li><span lang="en">${esc(o.en)}</span> ${htmlOir(o.en,{lento:false})}<span class="nota">${esc(o.es)}</span></li>`).join('')}</ul></div>`:''}
${st.error?`<div class="result"><span class="deny">${esc(st.error)}</span>${st.reintentar?' <button class="btn ghost btn-chico" id="ia-reintentar">Reintentar</button>':''}</div>`:''}
${st.premio?htmlPremio(st.premio):''}
<div class="card turno-actual">${st.cargando?'<p class="cargando">El tutor está pensando</p>':tutor?`<div class="row charla-botones">${soporte.hablar?'<button class="btn ghost btn-chico" id="ia-repite">🔁 Repite</button><button class="btn ghost btn-chico" id="ia-lento">🐢 Más lento</button>':''}<button class="btn ghost btn-chico" id="ia-traduce">🇪🇸 ¿Qué significa?</button><button class="btn ghost btn-chico" id="ia-ayuda">💡 Ayúdame a responder</button></div>
${!st.escribir?`${htmlMic('ia-mic','Toca para hablar')}<div class="row centro"><button class="btn ghost btn-chico" id="ia-escribir" type="button">Prefiero escribir</button></div>`
  :`<form class="row" id="ej-form"><label for="ia-resp" style="flex:1">Tu respuesta en inglés<input id="ia-resp" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en"></label><button class="btn" id="ia-enviar">Enviar</button></form>${soporte.escuchar?'':`<p class="nota">${AVISO_SIN_RECONOCIMIENTO}</p>`}`}`:''}
<div class="row"><button class="btn ghost" id="ia-terminar"${st.cargando||st.turnos<1?' disabled':''}>Terminar y ver reporte</button><button class="btn ghost btn-chico" id="ia-ocultar">${ocultas()?'👁️ Mostrar correcciones':'🙈 Ocultar correcciones'}</button></div></div>`;
  }
  function htmlReporte(){
    const r=st.reporte,palabras=st.log.filter(m=>m.rol==='tutor'&&m.data.nueva_palabra?.en).map(m=>m.data.nueva_palabra);
    return `<div class="card"><h3>Reporte de la conversación</h3><p class="prog-v">${r.nivel_estimado} <small>nivel estimado · ${st.turnos} turnos · ${Math.max(1,Math.round(st.seg/60))} min hablados</small></p>
<h4>Fortalezas</h4><ul>${r.fortalezas.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
<h4>Errores más importantes</h4><ul>${r.errores_frecuentes.map(e=>`<li><s lang="en">${esc(e.error)}</s> → <b lang="en">${esc(e.correcto)}</b> ${htmlOir(e.correcto)}<span class="nota">${esc(e.explicacion)}</span></li>`).join('')}</ul>
<h4>Frases para practicar</h4><ul class="lista-frases">${r.frases_para_practicar.map(f=>`<li><span lang="en">${esc(f.en)}</span> ${htmlOir(f.en)}<span class="nota">${esc(f.es)}</span></li>`).join('')}</ul>
${palabras.length?`<h4>Palabras nuevas</h4><ul>${palabras.map(w=>`<li><b lang="en">${esc(w.en)}</b> = ${esc(w.es)}</li>`).join('')}</ul><button class="btn ghost btn-chico" id="ia-palabras"${st.palabrasGuardadas?' disabled':''}>${st.palabrasGuardadas?'✅ En Repasar':'🃏 Mandarlas a Repasar'}</button>`:''}
<p class="nota">Las frases y los errores ya están en <strong>Repasar</strong> (a partir de mañana) y el resumen quedó en <button class="enlace" data-go="notas">Mis notas</button>.</p>
${htmlCierre({xp:xpHoy()-(st.xp0||0),aprendido:r.errores_frecuentes.map(e=>`${esc(e.correcto)}: ${esc(e.explicacion)}`),excluir:'estudio/ingles/hablar/ia'})}
<div class="row" style="margin-top:12px"><button class="btn ghost" id="ia-nueva">Otra conversación</button><button class="btn ghost" data-go="estudio/ingles/hablar">Volver</button></div></div>`;
  }

  async function turnoTutor(repintar){
    st.cargando=true;st.error=null;st.reintentar=false;st.ayuda=null;repintar();
    try{
      const data=await pedirJSON({system:sistemaTurno(st.nivel,st.esc),messages:st.mensajes,schema:ESQUEMA_TURNO,maxTokens:2000});
      st.mensajes.push({role:'assistant',content:JSON.stringify(data)});
      st.log.push({rol:'tutor',data});st.cargando=false;repintar();
      hablar(data.respuesta,{lento:st.nivel==='A1'});
    }catch(e){
      st.cargando=false;st.error=e.message;st.reintentar=!['sin-clave','401','403'].includes(e.codigo);
      // Si falló la respuesta a algo que dijiste, se quita de la conversación y se reenvía al reintentar
      if(st.log[st.log.length-1]?.rol==='yo'){st.pendiente=st.log.pop().texto;st.mensajes.pop();st.turnos--}
      repintar();
    }
  }
  async function enviar(texto,hablado,seg,repintar){
    texto=texto.trim();if(!texto)return;
    st.turnos++;st.seg+=seg||0;st.log.push({rol:'yo',texto});st.mensajes.push({role:'user',content:texto});
    if(hablado)registrarHabla({frases:1,turnos:1,seg:seg||0});
    st.premio=premiarTurno(1,hablado);
    registrarEjercicio({materia:'ingles',correcto:true,xp:hablado?5:3,repasar:false});
    await turnoTutor(repintar);
    if(st.turnos>=MAX_TURNOS&&!st.error)await terminar(repintar);
  }
  async function terminar(repintar){
    st.cargando=true;st.error=null;repintar();
    try{
      const r=await pedirJSON({system:sistemaReporte(st.nivel),messages:[...st.mensajes,{role:'user',content:'[FIN] Genera el reporte final de esta conversación.'}],schema:ESQUEMA_REPORTE,maxTokens:3000});
      st.reporte=r;st.fase='reporte';st.cargando=false;
      const sello=Date.now().toString(36),refs=[];
      r.frases_para_practicar.forEach((f,k)=>{const id=`${sello}-f${k}`;guardarFrase(id,{en:f.en,es:f.es,regla:'Frase sugerida por tu tutor IA.'});refs.push(`ingles/x/${id}`)});
      r.errores_frecuentes.forEach((e,k)=>{const id=`${sello}-e${k}`;guardarFrase(id,{en:e.correcto,es:`En vez de «${e.error}»`,regla:e.explicacion});refs.push(`ingles/x/${id}`)});
      programarRepaso(refs);
      guardarNota('ingles',`conversacion-${sello}`,`${st.esc.titulo} (${hoy()}, nivel ${st.nivel}, estimado ${r.nivel_estimado}). Fortalezas: ${r.fortalezas.join('; ')}. A mejorar: ${r.errores_frecuentes.map(e=>`${e.error} → ${e.correcto}`).join('; ')}.`,`Conversación con IA: ${st.esc.titulo}`);
      cambiarExtra('ingles',e=>{e.conversaciones=[...(e.conversaciones||[]),{fecha:hoy(),titulo:st.esc.titulo,nivel:st.nivel,turnos:st.turnos,seg:st.seg,estimado:r.nivel_estimado,
        log:st.log.map(m=>m.rol==='yo'?{yo:m.texto}:{tutor:m.data.respuesta}).slice(-2*MAX_TURNOS)}].slice(-30)});
      terminarConversacion({turnos:st.turnos,ia:true});
      repintar();
    }catch(e){st.cargando=false;st.error=`No se pudo generar el reporte: ${e.message}`;repintar()}
  }

  return {
    titulo:'Conversa con la IA',
    alEntrar(){st={fase:'elegir'}},
    vista(){
      const cab=`<p class="miga"><button class="enlace" data-go="estudio/ingles/hablar">Hablar</button> › Conversa con la IA</p><h1>💬 Conversa con la IA</h1>`;
      if(st.fase==='elegir')return `${cab}<p class="lead">Practica una conversación real: el tutor se adapta a tu nivel, te corrige con suavidad y te ayuda si te atoras.</p>${htmlElegir()}`;
      if(st.fase==='reporte')return cab+htmlReporte();
      return cab+htmlChat();
    },
    async alClic(t,ir,repintar){
      if(t.dataset.nivelCharla){guardarAjusteCharla('nivel',t.dataset.nivelCharla);repintar();return true}
      if(t.id==='ia-borrar-historial'){if(await confirmar({titulo:'¿Borrar el historial de conversaciones?',texto:'Se borra la lista de conversaciones de este dispositivo (y de tu cuenta si sincronizas). Tus notas y frases en Repasar se quedan.',si:'Borrar',no:'Cancelar',peligro:true})){cambiarExtra('ingles',e=>{e.conversaciones=[]});repintar()}return true}
      if(t.dataset.escenario){
        st={fase:'chat',xp0:xpHoy(),esc:ESCENARIOS.find(e=>e.id===t.dataset.escenario),nivel:ajustesCharla().nivel||nivelIngles(),seg:0,
          mensajes:[{role:'user',content:'[INICIO] Saluda brevemente y hazme tu primera pregunta de la situación.'}],log:[],turnos:0,escribir:!soporte.escuchar};
        await turnoTutor(repintar);return true}
      if(t.id==='ia-reintentar'){if(st.pendiente){const p=st.pendiente;st.pendiente=null;await enviar(p,false,0,repintar)}else await turnoTutor(repintar);return true}
      if(t.id==='ia-escribir'){st.escribir=true;repintar();$('#ia-resp')?.focus();return true}
      if(t.id==='ia-enviar'){const v=$('#ia-resp').value;await enviar(v,false,0,repintar);return true}
      if(t.id==='ia-repite'){hablar(ultimaIA());return true}
      if(t.id==='ia-lento'){hablar(ultimaIA(),{lento:true});return true}
      if(t.id==='ia-ocultar'){guardarAjusteCharla('ocultarCorrecciones',!ocultas());repintar();return true}
      if(t.id==='ia-traduce'){const m=st.log.filter(x=>x.rol==='tutor').at(-1);if(!m||m.traduccion)return true;t.disabled=true;
        try{m.traduccion=String(await pedir({maxTokens:200,sistema:'Traduce al español de Latinoamérica, natural y breve. Responde solo con la traducción.',mensajes:[{role:'user',content:m.data.respuesta}]})).trim()}catch(e){aviso(e.message,4000)}
        repintar();return true}
      if(t.id==='ia-ayuda'){t.disabled=true;
        try{const r=await pedir({maxTokens:500,esquemaJSON:ESQUEMA_AYUDA,sistema:`Sugiere 3 respuestas posibles y cortas, en inglés de nivel ${st.nivel}, que el alumno podría decir ahora; cada una con su traducción al español.`,mensajes:[...st.mensajes,{role:'user',content:'[AYUDA] ¿Qué podría responder?'}]});st.ayuda=(r.opciones||[]).slice(0,3)}
        catch(e){aviso(e.message,4000)}
        repintar();return true}
      if(t.id==='ia-mic'){
        let res;try{res=await escucharConBoton(t,{silencio:2500,maxSegundos:30})}catch(e){const est=$('#ia-mic-estado');if(est)est.textContent=e.message;return true}
        if(res)await enviar(res.transcripcion,true,res.segundos,repintar);return true}
      if(t.id==='ia-terminar'){await terminar(repintar);return true}
      if(t.id==='ia-nueva'){st={fase:'elegir'};repintar();return true}
      if(t.id==='ia-palabras'){const ws=st.log.filter(m=>m.rol==='tutor'&&m.data.nueva_palabra?.en).map(m=>m.data.nueva_palabra);
        for(const w of ws)agregarTarjeta({q:`¿Cómo se dice «${w.es}» en inglés?`,a:w.en,materia:'ingles',titulo:`Conversación: ${st.esc.titulo}`,origen:'conversacion'});
        st.palabrasGuardadas=true;aviso(`🃏 ${ws.length} ${ws.length===1?'palabra':'palabras'} en Repasar`);repintar();return true}
      if(t.dataset.repetir!==undefined){
        const k=+t.dataset.repetir,frase=st.log[k]?.data?.frase_mejorada,caja=$(`#ia-eval-${k}`);if(!frase||!caja)return true;
        caja.innerHTML=htmlMic(`ia-rep-${k}`,'Toca y repite');
        let res;try{res=await escucharConBoton($(`#ia-rep-${k}`))}catch(e){caja.innerHTML=`<p class="deny">${esc(e.message)}</p>`;return true}
        if(!res)return true;
        const ev=evaluar(frase,res.alternativas,{sonidos:SONIDOS});
        registrarHabla({frases:1,seg:res.segundos});registrarSonidos('ingles',ev.sonidos);
        caja.innerHTML=`${htmlFraseEvaluada(ev)}<div class="progress">Pronunciación: ${ev.puntaje}/100 (estimada)</div>`;
        return true}
    }
  };
}
