/* Conversación libre con IA (Gemini o Claude, ver nucleo/ia.js). Flujo: hablas → transcripción → la IA (con el historial) → respuesta leída en voz alta.
   Cada respuesta trae correcciones en español y una versión mejorada de lo que dijiste. Al terminar, un reporte final
   cuyas frases y errores entran al repaso espaciado y a "Mis notas". */
import {$,esc} from '../../../utilidades.js';
import {soporte,hablar,htmlMic,htmlOir,htmlFraseEvaluada,escucharConBoton} from '../../../nucleo/voz.js';
import {evaluar} from '../../../nucleo/pronunciacion.js';
import {registrarEjercicio,registrarHabla,registrarSonidos,guardarFrase,programarRepaso,guardarNota,hoy} from '../../../nucleo/progreso.js';
import {SONIDOS} from '../errores-pronunciacion.js';
import {DIALOGOS} from './dialogos.js';
import {leerAjustes,pedirJSON,nombreModelo,nombreProveedor} from '../../../nucleo/ia.js';
import {nivelIngles} from './nivel.js';
import {htmlCierre,xpHoy} from '../../../nucleo/cierre.js';
import {premiarTurno,htmlPremio,terminarConversacion} from './juego.js';

export const MAX_TURNOS=10;
export const ESCENARIOS=[
  ...DIALOGOS.map(d=>({id:d.id,titulo:d.titulo,desc:d.escena})),
  {id:'entrevista-ti',titulo:'Entrevista de trabajo en TI',desc:'Te entrevistan para un puesto de TI o ciberseguridad: experiencia, herramientas y un problema que resolviste.'},
  {id:'libre',titulo:'Tema libre',desc:'Hablen de lo que quieras: tu día, tus planes, tu trabajo o tus pasatiempos.'}
];

const CORRECCION={type:'object',additionalProperties:false,required:['dije','correcto','explicacion','tipo'],properties:{
  dije:{type:'string'},correcto:{type:'string'},explicacion:{type:'string'},tipo:{type:'string',enum:['gramatica','vocabulario','pronunciacion','naturalidad']}}};
const ESQUEMA_TURNO={type:'object',additionalProperties:false,required:['respuesta','correcciones','frase_mejorada','nueva_palabra'],properties:{
  respuesta:{type:'string'},correcciones:{type:'array',items:CORRECCION},frase_mejorada:{type:'string'},
  nueva_palabra:{type:'object',additionalProperties:false,required:['en','es'],properties:{en:{type:'string'},es:{type:'string'}}}}};
const ESQUEMA_REPORTE={type:'object',additionalProperties:false,required:['fortalezas','errores_frecuentes','frases_para_practicar','nivel_estimado'],properties:{
  fortalezas:{type:'array',items:{type:'string'}},
  errores_frecuentes:{type:'array',items:{type:'object',additionalProperties:false,required:['error','correcto','explicacion'],properties:{error:{type:'string'},correcto:{type:'string'},explicacion:{type:'string'}}}},
  frases_para_practicar:{type:'array',items:{type:'object',additionalProperties:false,required:['en','es'],properties:{en:{type:'string'},es:{type:'string'}}}},
  nivel_estimado:{type:'string',enum:['A1','A2','B1','B2','C1','C2']}}};

const sistemaTurno=(nivel,esc_)=>`Eres un tutor de inglés amable y un compañero de conversación. Nivel del alumno (MCER): ${nivel}. Escenario: ${esc_.titulo}. ${esc_.desc}
Usa vocabulario y gramática de ese nivel, frases cortas, y haz UNA pregunta a la vez para que el alumno hable más que tú.
El alumno es hispanohablante y su texto viene de reconocimiento de voz: ignora la falta de puntuación y mayúsculas, pero detecta palabras que probablemente pronunció mal (palabras raras o fuera de contexto) y márcalas como corrección de tipo "pronunciacion".
"respuesta": tu siguiente intervención, en inglés, natural y breve (1-3 frases), siempre terminando con una pregunta mientras la conversación siga.
"correcciones": máximo 2, las más importantes, sobre lo último que dijo el alumno; "explicacion" en español y corta. Si no hay errores, lista vacía.
"frase_mejorada": la versión más natural en inglés de lo último que dijo el alumno (si no dijo nada todavía, una frase útil para responderte).
"nueva_palabra": una palabra o expresión útil del escenario, con su traducción al español.
Si no hay correcciones, empieza "respuesta" con un elogio muy breve.`;
const sistemaReporte=nivel=>`Eres un tutor de inglés. Analiza la conversación anterior con un alumno hispanohablante (nivel declarado ${nivel}) y genera su reporte final.
"fortalezas": 2-3 cosas que hizo bien, en español. "errores_frecuentes": los 3 errores más repetidos o importantes (error tal como lo dijo, forma correcta en inglés, explicación corta en español).
"frases_para_practicar": 5 frases útiles en inglés para su siguiente práctica, ligadas a lo que intentó decir, con traducción al español. "nivel_estimado": tu estimación MCER según lo que produjo.`;

export function vistaIA(){
  let st={fase:'elegir'};
  const ajustes=()=>leerAjustes();

  function htmlElegir(){
    const a=ajustes();
    return `${!a.clave?`<div class="card aviso"><h3>Falta tu API key</h3><p>La conversación libre usa la IA con tu propia clave (Gemini es gratis con tu cuenta de Google). Mientras la consigues, practica con los <button class="enlace" data-go="estudio/ingles/hablar">diálogos guiados</button>, que funcionan sin internet y sin clave.</p><div class="row"><button class="btn" data-go="ajustes-ia">Configurar la IA</button></div></div>`
      :`<p class="nota">Modelo: ${esc(nombreModelo())} · Nivel ${nivelIngles()} · máximo ${MAX_TURNOS} turnos. <button class="enlace" data-go="ajustes-ia">Ajustes</button></p>`}
<div class="grid">${ESCENARIOS.map(e=>`<button class="card click escenario" data-escenario="${e.id}"${a.clave?'':' disabled'}><h3>${e.titulo}</h3><p class="nota">${e.desc}</p></button>`).join('')}</div>`;
  }
  const tarjetaTutor=(m,k)=>`<div class="burbuja pj"><span class="quien">Tutor</span><span lang="en">${esc(m.data.respuesta)}</span>${htmlOir(m.data.respuesta)}
${m.data.nueva_palabra?.en?`<span class="nota">💡 <b lang="en">${esc(m.data.nueva_palabra.en)}</b> = ${esc(m.data.nueva_palabra.es)}</span>`:''}</div>
${(m.data.correcciones?.length||m.data.frase_mejorada)&&k>0?`<details class="mejoras"${k===st.log.length-1?' open':''}><summary>📝 Lo que puedes mejorar</summary>
${m.data.correcciones?.length?`<ul>${m.data.correcciones.map(c=>`<li><s lang="en">${esc(c.dije)}</s> → <b lang="en">${esc(c.correcto)}</b><span class="nota">${esc(c.explicacion)} (${esc(c.tipo)})</span></li>`).join('')}</ul>`:'<p class="allow">¡Sin errores!</p>'}
${m.data.frase_mejorada?`<p>Más natural: <b lang="en">${esc(m.data.frase_mejorada)}</b> ${htmlOir(m.data.frase_mejorada)}${soporte.escuchar?` <button class="btn ghost btn-chico" data-repetir="${k}">🎙️ Repetir y evaluar</button>`:''}</p><div id="ia-eval-${k}"></div>`:''}</details>`:''}`;
  const burbujaYo=m=>`<div class="burbuja yo"><span class="quien">Tú</span><span lang="en">${esc(m.texto)}</span></div>`;

  function htmlChat(){
    const tutor=st.log.filter(m=>m.rol==='tutor').length;
    return `<p class="progress">${st.esc.titulo} · turno ${st.turnos} de ${MAX_TURNOS}</p>
<div class="chat">${st.log.map((m,k)=>m.rol==='tutor'?tarjetaTutor(m,k):burbujaYo(m)).join('')}</div>
${st.error?`<div class="result"><span class="deny">${esc(st.error)}</span>${st.reintentar?' <button class="btn ghost btn-chico" id="ia-reintentar">Reintentar</button>':''}</div>`:''}
${st.premio?htmlPremio(st.premio):''}
<div class="card turno-actual">${st.cargando?'<p class="cargando">El tutor está pensando…</p>':tutor?(!st.escribir?`${htmlMic('ia-mic','Toca y responde')}<div class="row centro"><button class="btn ghost btn-chico" id="ia-escribir" type="button">Prefiero escribir</button></div>`
  :`<form class="row" id="ej-form"><label for="ia-resp">Tu respuesta en inglés<input id="ia-resp" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en"></label><button class="btn" id="ia-enviar">Enviar</button></form>`):''}
<div class="row"><button class="btn ghost" id="ia-terminar"${st.cargando||st.turnos<1?' disabled':''}>Terminar y ver reporte</button></div></div>`;
  }
  function htmlReporte(){
    const r=st.reporte;
    return `<div class="card"><h3>Reporte de la conversación</h3><p class="prog-v">${r.nivel_estimado} <small>nivel estimado · ${st.turnos} turnos</small></p>
<h4>Fortalezas</h4><ul>${r.fortalezas.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
<h4>Errores más importantes</h4><ul>${r.errores_frecuentes.map(e=>`<li><s lang="en">${esc(e.error)}</s> → <b lang="en">${esc(e.correcto)}</b> ${htmlOir(e.correcto)}<span class="nota">${esc(e.explicacion)}</span></li>`).join('')}</ul>
<h4>Frases para practicar</h4><ul class="lista-frases">${r.frases_para_practicar.map(f=>`<li><span lang="en">${esc(f.en)}</span> ${htmlOir(f.en)}<span class="nota">${esc(f.es)}</span></li>`).join('')}</ul>
<p class="nota">Las frases y los errores ya están en <strong>Repasar hoy</strong> (a partir de mañana) y el resumen quedó en <button class="enlace" data-go="notas">Mis notas</button>.</p>
${htmlCierre({xp:xpHoy()-(st.xp0||0),aprendido:r.errores_frecuentes.map(e=>`${esc(e.correcto)}: ${esc(e.explicacion)}`),excluir:'estudio/ingles/hablar/ia'})}
<div class="row" style="margin-top:12px"><button class="btn ghost" id="ia-nueva">Otra conversación</button><button class="btn ghost" data-go="estudio/ingles/hablar">Volver</button></div></div>`;
  }

  async function turnoTutor(repintar){
    st.cargando=true;st.error=null;st.reintentar=false;repintar();
    try{
      const data=await pedirJSON({system:sistemaTurno(st.nivel,st.esc),messages:st.mensajes,schema:ESQUEMA_TURNO,maxTokens:2000});
      st.mensajes.push({role:'assistant',content:JSON.stringify(data)});
      st.log.push({rol:'tutor',data});st.cargando=false;repintar();
      hablar(data.respuesta);
    }catch(e){
      st.cargando=false;st.error=e.message;st.reintentar=e.codigo!=='sin-clave'&&e.codigo!=='401';
      // Si falló la respuesta a algo que dijiste, se quita de la conversación y se reenvía al reintentar
      if(st.log[st.log.length-1]?.rol==='yo'){st.pendiente=st.log.pop().texto;st.mensajes.pop();st.turnos--}
      repintar();
    }
  }
  async function enviar(texto,hablado,seg,repintar){
    texto=texto.trim();if(!texto)return;
    st.turnos++;st.log.push({rol:'yo',texto});st.mensajes.push({role:'user',content:texto});
    if(hablado)registrarHabla({frases:1,turnos:1,seg:seg||0});
    st.premio=premiarTurno(1,hablado);
    registrarEjercicio({materia:'ingles',correcto:true,xp:0,repasar:false});
    await turnoTutor(repintar);
    if(st.turnos>=MAX_TURNOS&&!st.error)await terminar(repintar);
  }
  async function terminar(repintar){
    st.cargando=true;st.error=null;repintar();
    try{
      const r=await pedirJSON({system:sistemaReporte(st.nivel),messages:[...st.mensajes,{role:'user',content:'[FIN] Genera el reporte final de esta conversación.'}],schema:ESQUEMA_REPORTE,maxTokens:3000});
      st.reporte=r;st.fase='reporte';st.cargando=false;
      // Frases y errores al repaso espaciado (desde mañana) y resumen a "Mis notas"
      const sello=Date.now().toString(36),refs=[];
      r.frases_para_practicar.forEach((f,k)=>{const id=`${sello}-f${k}`;guardarFrase(id,{en:f.en,es:f.es,regla:'Frase sugerida por tu tutor IA.'});refs.push(`ingles/x/${id}`)});
      r.errores_frecuentes.forEach((e,k)=>{const id=`${sello}-e${k}`;guardarFrase(id,{en:e.correcto,es:`En vez de «${e.error}»`,regla:e.explicacion});refs.push(`ingles/x/${id}`)});
      programarRepaso(refs);
      guardarNota('ingles',`conversacion-${sello}`,`${st.esc.titulo} (${hoy()}, nivel estimado ${r.nivel_estimado}). Fortalezas: ${r.fortalezas.join('; ')}. A mejorar: ${r.errores_frecuentes.map(e=>`${e.error} → ${e.correcto}`).join('; ')}.`,`Conversación con IA: ${st.esc.titulo}`);
      terminarConversacion({turnos:st.turnos,ia:true});
      repintar();
    }catch(e){st.cargando=false;st.error=`No se pudo generar el reporte: ${e.message}`;repintar()}
  }

  return {
    titulo:'Conversación con IA',
    alEntrar(){st={fase:leerAjustes().clave?'elegir':'elegir'}},
    vista(){
      const cab=`<p class="miga"><button class="enlace" data-go="estudio/ingles/hablar">Hablar</button> › Conversación con IA</p><h1>Conversación libre con IA</h1>`;
      if(st.fase==='elegir')return `${cab}<p class="lead">Habla de lo que quieras con un tutor que se adapta a tu nivel, te corrige en español y te propone una versión más natural de lo que dijiste.</p>${htmlElegir()}`;
      if(st.fase==='reporte')return cab+htmlReporte();
      return cab+htmlChat();
    },
    async alClic(t,ir,repintar){
      if(t.dataset.escenario){
        st={fase:'chat',xp0:xpHoy(),esc:ESCENARIOS.find(e=>e.id===t.dataset.escenario),nivel:nivelIngles(),mensajes:[{role:'user',content:'[INICIO] Saluda brevemente y hazme tu primera pregunta del escenario.'}],log:[],turnos:0,escribir:!soporte.escuchar};
        await turnoTutor(repintar);return true}
      if(t.id==='ia-reintentar'){if(st.pendiente){const p=st.pendiente;st.pendiente=null;await enviar(p,false,0,repintar)}else await turnoTutor(repintar);return true}
      if(t.id==='ia-escribir'){st.escribir=true;repintar();$('#ia-resp')?.focus();return true}
      if(t.id==='ia-enviar'){const v=$('#ia-resp').value;await enviar(v,false,0,repintar);return true}
      if(t.id==='ia-mic'){
        let res;try{res=await escucharConBoton(t)}catch(e){const est=$('#ia-mic-estado');if(est)est.textContent=e.message;return true}
        if(res)await enviar(res.transcripcion,true,res.segundos,repintar);return true}
      if(t.id==='ia-terminar'){await terminar(repintar);return true}
      if(t.id==='ia-nueva'){st={fase:'elegir'};repintar();return true}
      if(t.dataset.repetir!==undefined){
        const k=+t.dataset.repetir,frase=st.log[k]?.data?.frase_mejorada,caja=$(`#ia-eval-${k}`);if(!frase||!caja)return true;
        caja.innerHTML=htmlMic(`ia-rep-${k}`,'Toca y repite');
        let res;try{res=await escucharConBoton($(`#ia-rep-${k}`))}catch(e){caja.innerHTML=`<p class="deny">${esc(e.message)}</p>`;return true}
        if(!res)return true;
        const ev=evaluar(frase,res.alternativas,{sonidos:SONIDOS});
        registrarHabla({frases:1,seg:res.segundos});registrarSonidos('ingles',ev.sonidos);
        caja.innerHTML=`${htmlFraseEvaluada(ev)}<div class="progress">Pronunciación: ${ev.puntaje}/100</div>`;
        return true}
    }
  };
}
