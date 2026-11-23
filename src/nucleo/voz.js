/* Motor de voz: síntesis (speechSynthesis) y reconocimiento (SpeechRecognition / webkitSpeechRecognition).
   Si el navegador no los soporta, la app no se rompe: las vistas muestran un aviso y caen a modo escrito.
   Privacidad: el audio nunca sale del navegador hacia la app ni hacia la IA; el reconocimiento (en Chrome, con los
   servidores de Google) devuelve texto, y a la IA solo se le manda ese texto.
   - hablar(texto, {lento, idioma, voz:'a'|'b'}): dos voces distintas para diálogos (las de Google o Samsung primero);
     si el teléfono tiene una sola voz en inglés, la segunda se distingue con otro tono.
   - escuchar({idioma 'en-US'|'en-GB', alParcial, maxSegundos, silencio, continuo}): resultados intermedios en vivo,
     corte por silencio (ms sin nada nuevo después de hablar) y por tiempo máximo; continuo junta varias frases (turno largo).
   - pronunciacionEstimada(): estimación 0–100 con la confianza del reconocedor y, si hay frase esperada, la comparación
     palabra por palabra de pronunciacion.js. Es una aproximación: lo dicen las pantallas.
   App nativa (Capacitor): el WebView de Android no tiene SpeechRecognition y puede no tener voces; ahí se usan los
   plugins @capacitor-community/speech-recognition (resultados parciales, en-US/en-GB, permiso del micrófono) y
   text-to-speech, con la misma interfaz: hablar(), escuchar(), callar(), detenerEscucha(). */
import {esc} from '../utilidades.js';
import {evaluar} from './pronunciacion.js';
import {esNativa} from './plataforma.js';
const nativa=esNativa();
const TTS=()=>import('@capacitor-community/text-to-speech').then(m=>m.TextToSpeech);
const SR=()=>import('@capacitor-community/speech-recognition').then(m=>m.SpeechRecognition);

const Reconocedor=typeof window!=='undefined'?(window.SpeechRecognition||window.webkitSpeechRecognition):undefined;
export const soporte={
  hablar:nativa||typeof window!=='undefined'&&!!window.speechSynthesis&&'SpeechSynthesisUtterance' in window,
  escuchar:nativa||!!Reconocedor
};
export const AVISO_SIN_RECONOCIMIENTO='Tu navegador no reconoce la voz. Usa Chrome en Android (o la app) para hablar de verdad. Mientras tanto, puedes escribir tus respuestas.';
export const AVISO_PRIVACIDAD='🔒 Tu voz no se guarda ni se sube: el reconocimiento la convierte en texto y a la IA solo se manda ese texto.';

/* ---------- hablar ---------- */
let voces=[];
function cargarVoces(){try{voces=speechSynthesis.getVoices()||[]}catch(e){voces=[]}}
if(soporte.hablar){cargarVoces();try{speechSynthesis.addEventListener('voiceschanged',cargarVoces)}catch(e){}}
const puntosVoz=v=>(/google/i.test(v.name)?8:0)+(/samsung/i.test(v.name)?7:0)+(/natural|neural|online|enhanced|premium/i.test(v.name)?4:0)+(v.localService===false?1:0);
const FEMENINA=/female|woman|zira|aria|jenny|samantha|susan|hazel|libby|sonia|emma|ava|allison|google us english|google uk english female/i;
const MASCULINA=/\bmale\b|\bman\b|david|guy|mark|george|ryan|daniel|alex|fred|google uk english male/i;
// La mejor voz en inglés del acento pedido (en-US por defecto)
export function vozIngles(idioma='en-US'){
  if(!voces.length)cargarVoces();
  const re=new RegExp('^'+idioma.replace('-','[-_]'),'i'),en=voces.filter(v=>re.test(v.lang));
  return en.sort((a,b)=>puntosVoz(b)-puntosVoz(a))[0]||voces.filter(v=>/^en/i.test(v.lang)).sort((a,b)=>puntosVoz(b)-puntosVoz(a))[0]||null;
}
// Dos voces distintas para los diálogos de las escuchas: 'a' (preferiblemente mujer) y 'b' (hombre u otro acento)
export function vocesDialogo(){
  if(!voces.length)cargarVoces();
  const en=voces.filter(v=>/^en/i.test(v.lang)).sort((a,b)=>puntosVoz(b)-puntosVoz(a));
  const a=en.find(v=>FEMENINA.test(v.name))||en[0]||null;
  const b=en.find(v=>v!==a&&MASCULINA.test(v.name))||en.find(v=>v!==a&&v.lang!==a?.lang)||en.find(v=>v!==a)||null;
  return {a,b,distintas:!!(a&&b)};
}
// Lee un texto. Devuelve una promesa que se resuelve al terminar (o enseguida si no hay síntesis).
// idioma: 'en-US' (por defecto), 'en-GB' o 'es' · voz: 'a' / 'b' para distinguir a dos personas en un diálogo
export function hablar(texto,{lento=false,idioma='en-US',voz=null}={}){
  if(!soporte.hablar||!texto)return Promise.resolve();
  // app nativa: el motor de voz de Android (la segunda persona de un diálogo, con otro tono)
  if(nativa)return TTS().then(t=>t.speak({text:texto,lang:idioma.startsWith('es')?'es-MX':idioma,rate:lento?0.75:1,pitch:voz==='b'?0.75:voz==='a'?1.1:1,queueStrategy:0})).catch(()=>{});
  return new Promise(res=>{
    try{
      speechSynthesis.cancel();
      const es=idioma.startsWith('es'),u=new SpeechSynthesisUtterance(texto);
      let v=es?speechSynthesis.getVoices().find(x=>x.lang?.toLowerCase().startsWith('es')):vozIngles(idioma);
      if(!es&&voz){const d=vocesDialogo();v=d[voz]||v;
        // una sola voz disponible: la segunda persona se distingue por el tono
        if(!d.distintas&&voz==='b')u.pitch=0.7;else if(!d.distintas)u.pitch=1.15}
      u.lang=es?(v?.lang||'es-MX'):(v?.lang||idioma);if(v)u.voice=v;u.rate=lento?0.75:1;
      let fin=false;const listo=()=>{if(!fin){fin=true;res()}};
      u.onend=listo;u.onerror=listo;
      setTimeout(listo,Math.max(4000,texto.length*(lento?240:180))); // por si el navegador nunca avisa del final
      speechSynthesis.speak(u);
    }catch(e){res()}
  });
}
// Un diálogo: [[hablante, texto]…]; 'A'/'B' con su voz, 'N' (narrador) con la principal. Se puede detener con callar().
let turnoDialogo=0;
export async function hablarDialogo(lineas,{lento=false}={}){
  const mio=++turnoDialogo;
  for(const [quien,texto] of lineas){if(mio!==turnoDialogo)return;await hablar(texto,{lento,voz:quien==='B'?'b':quien==='A'?'a':null})}
}
export function callar(){turnoDialogo++;if(nativa){TTS().then(t=>t.stop()).catch(()=>{});return}try{speechSynthesis.cancel()}catch(e){}}

/* ---------- escuchar ---------- */
const MENSAJES={
  'no-speech':'No se oyó nada. Toca el micrófono y habla cerca del teléfono.',
  'audio-capture':'No se detecta un micrófono. Revisa que el teléfono tenga uno disponible.',
  'not-allowed':'El permiso del micrófono está bloqueado. Actívalo en Chrome: ⋮ → Configuración → Configuración de sitios → Micrófono, y vuelve a intentar.',
  'service-not-allowed':'El navegador no permite el reconocimiento de voz aquí. Usa Chrome en Android o escribe tu respuesta.',
  'network':'El reconocimiento de voz necesita internet (en Chrome lo hacen los servidores de Google). Revisa la conexión o escribe tu respuesta.',
  'language-not-supported':'Tu navegador no reconoce ese inglés. Escribe tu respuesta.',
  'aborted':'Se detuvo la escucha.',
  'sin-soporte':AVISO_SIN_RECONOCIMIENTO
};
if(nativa)Object.assign(MENSAJES,{
  'not-allowed':'La app no tiene permiso para usar el micrófono. Actívalo en Ajustes → Apps → Estudio+ → Permisos → Micrófono, y vuelve a intentar.',
  'sin-soporte':'Este teléfono no tiene reconocimiento de voz (instala o activa la app de Google). Mientras tanto, escribe tus respuestas.',
  'network':'El reconocimiento de voz necesita internet en este teléfono. Revisa la conexión o escribe tu respuesta.'});
export class ErrorVoz extends Error{constructor(codigo){super(MENSAJES[codigo]||'No se pudo escuchar. Intenta de nuevo o escribe tu respuesta.');this.codigo=codigo}}

let activo=null;
/* Escucha. Resuelve {transcripcion, confianza, alternativas:[{transcripcion, confianza}], segundos}.
   Rechaza con ErrorVoz (mensaje en español). alParcial(texto) recibe lo que va entendiendo.
   silencio: ms sin resultados nuevos (después de empezar a hablar) para cortar · continuo: junta varias frases
   (turno largo de un examen) y solo corta por silencio, por tiempo máximo o al tocar otra vez. */
export function escuchar({idioma='en-US',alternativas=3,alParcial,maxSegundos=15,silencio=0,continuo=false,alEstado}={}){
  if(nativa)return escucharNativo({idioma,alternativas,alParcial,maxSegundos,silencio,continuo,alEstado});
  if(!Reconocedor)return Promise.reject(new ErrorVoz('sin-soporte'));
  detenerEscucha();
  return new Promise((res,rej)=>{
    const r=new Reconocedor(),inicio=Date.now();let finales=[],terminado=false,mudo=null;
    activo=r;
    r.lang=idioma;r.maxAlternatives=alternativas;r.interimResults=!!(alParcial||silencio);r.continuous=!!continuo;
    const cerrar=(fn,v)=>{if(terminado)return;terminado=true;clearTimeout(tope);clearTimeout(mudo);if(activo===r)activo=null;fn(v)};
    const parar=()=>{alEstado?.('procesando');try{r.stop()}catch(e){}};
    const tope=setTimeout(parar,maxSegundos*1000);
    const vigilar=()=>{if(!silencio)return;clearTimeout(mudo);mudo=setTimeout(parar,silencio)};
    r.onresult=e=>{
      let parcial='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        const x=e.results[i],alts=Array.from({length:x.length},(_,k)=>({transcripcion:x[k].transcript.trim(),confianza:x[k].confidence||0}));
        if(x.isFinal)finales.push(alts);else parcial+=' '+alts[0].transcripcion;
      }
      alParcial?.([...finales.map(f=>f[0].transcripcion),parcial.trim()].filter(Boolean).join(' '));
      vigilar();
      if(!continuo&&finales.length)parar();
    };
    r.onerror=e=>{if(e.error==='no-speech'&&finales.length)return;cerrar(rej,new ErrorVoz(e.error))};
    r.onend=()=>{
      const segundos=Math.max(1,Math.round((Date.now()-inicio)/1000));
      if(!finales.length||!finales[0][0].transcripcion)return cerrar(rej,new ErrorVoz('no-speech'));
      // varias frases (continuo): se unen; la confianza es el promedio
      const texto=finales.map(f=>f[0].transcripcion).join(' '),conf=finales.reduce((s,f)=>s+(f[0].confianza||0),0)/finales.length;
      const alts=finales.length===1?finales[0]:[{transcripcion:texto,confianza:conf}];
      cerrar(res,{transcripcion:texto,confianza:conf,alternativas:alts,segundos});
    };
    try{r.start();alEstado?.('escuchando')}catch(e){cerrar(rej,new ErrorVoz('aborted'))}
  });
}
export function detenerEscucha(){if(activo){try{activo.stop()}catch(e){}}}
/* App nativa: el reconocedor de Android con resultados parciales. Se corta solo tras una pausa; en un turno largo
   (continuo) se vuelve a abrir y se juntan las frases hasta el silencio pedido, el tiempo máximo o tocar otra vez. */
async function escucharNativo({idioma,alternativas,alParcial,maxSegundos,silencio,continuo,alEstado}){
  const r=await SR();
  try{if(!(await r.available()).available)throw new ErrorVoz('sin-soporte')}catch(e){throw e instanceof ErrorVoz?e:new ErrorVoz('sin-soporte')}
  let p=await r.checkPermissions().catch(()=>({}));
  if(p.speechRecognition!=='granted')p=await r.requestPermissions().catch(()=>({}));
  if(p.speechRecognition!=='granted')throw new ErrorVoz('not-allowed');
  detenerEscucha();
  return new Promise(async(res,rej)=>{
    const inicio=Date.now(),frases=[];let ultimo=[],terminado=false,pedidoParar=false,mudo=null,manejadores=[];
    const parar=()=>{pedidoParar=true;alEstado?.('procesando');r.stop().catch(()=>{})};
    const tope=setTimeout(parar,maxSegundos*1000);
    activo={stop:parar};
    const cerrar=(fn,v)=>{if(terminado)return;terminado=true;clearTimeout(tope);clearTimeout(mudo);manejadores.forEach(h=>h.remove());if(activo?.stop===parar)activo=null;fn(v)};
    const empezar=()=>r.start({language:idioma,maxResults:alternativas,partialResults:true,popup:false}).then(()=>alEstado?.('escuchando')).catch(e=>cerrar(rej,new ErrorVoz(/permission/i.test(e?.message)?'not-allowed':'no-speech')));
    manejadores.push(await r.addListener('partialResults',d=>{ultimo=(d.matches||[]).filter(Boolean);alParcial?.([...frases,ultimo[0]||''].filter(Boolean).join(' '));
      if(silencio){clearTimeout(mudo);mudo=setTimeout(parar,silencio)}}));
    manejadores.push(await r.addListener('listeningState',d=>{
      if(d.status!=='stopped')return;
      if(ultimo[0])frases.push(ultimo[0]);
      if(continuo&&!pedidoParar&&Date.now()-inicio<maxSegundos*1000){ultimo=[];empezar();return}
      if(!frases.length)return cerrar(rej,new ErrorVoz('no-speech'));
      const texto=frases.join(' '),alts=frases.length===1&&ultimo.length?ultimo.slice(0,alternativas).map((t,i)=>({transcripcion:t,confianza:i?0.6:0.85})):[{transcripcion:texto,confianza:0.85}];
      cerrar(res,{transcripcion:texto,confianza:0.85,alternativas:alts,segundos:Math.max(1,Math.round((Date.now()-inicio)/1000))});
    }));
    empezar();
  });
}
export const escuchando=()=>!!activo;

/* Pronunciación estimada (0–100). Con frase esperada, la comparación palabra por palabra (evaluar); sin ella, solo la
   confianza del reconocedor (si la da) y la longitud. Siempre es una aproximación. */
export function pronunciacionEstimada({alternativas=[],esperado=null,sonidos=[]}={}){
  if(esperado)return evaluar(esperado,alternativas,{sonidos}).puntaje;
  const c=alternativas[0]?.confianza;
  if(!(c>0))return null;
  return Math.round(Math.min(100,40+60*c));
}

/* ---------- piezas de interfaz ---------- */
const ICONO_MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11Z" fill="currentColor"/></svg>';
// Botón grande "tocar para hablar". id distinto si hay varios en la pantalla.
export const htmlMic=(id='mic',texto='Toca para hablar')=>`<div class="mic-zona"><button class="mic" id="${id}" type="button" aria-label="${texto}">${ICONO_MIC}<span class="mic-ondas" aria-hidden="true"></span></button>
<div class="mic-estado" id="${id}-estado" role="status">${soporte.escuchar?texto:'Micrófono no disponible: escribe tu respuesta'}</div></div>`;
// Escucha con el botón: «Escuchando…» con onda, la transcripción en vivo y «Procesando…» al final. Tocar otra vez corta.
export async function escucharConBoton(boton,opciones={}){
  const estado=document.getElementById(boton.id+'-estado'),txt=estado?.textContent;
  if(escuchando()){detenerEscucha();return null}
  boton.classList.add('escuchando');if(estado)estado.textContent='Escuchando…';
  const alEstado=e=>{if(e==='procesando'){boton.classList.remove('escuchando');boton.classList.add('procesando');if(estado)estado.textContent='Procesando…'}};
  try{return await escuchar({...opciones,alEstado,alParcial:t=>{if(estado)estado.textContent=`«${t}»`;opciones.alParcial?.(t)}})}
  finally{boton.classList.remove('escuchando','procesando');if(estado)estado.textContent=txt}
}
// Botón para oír un texto (normal y lento). Lo maneja main.js con data-decir.
export const htmlOir=(texto,{lento=true}={})=>soporte.hablar?`<span class="oir"><button class="btn ghost btn-chico" type="button" data-decir="${esc(texto)}" aria-label="Escuchar">🔊 Escuchar</button>${lento?`<button class="btn ghost btn-chico" type="button" data-decir="${esc(texto)}" data-lento="1" aria-label="Escuchar lento">🐢 Lento</button>`:''}</span>`:'';
// Frase coloreada palabra por palabra; tocar una palabra la lee lento
export const htmlFraseEvaluada=r=>`<p class="frase-evaluada">${r.palabras.map(p=>`<button type="button" class="palabra ${p.estado}" data-decir="${esc(p.texto.replace(/[^\p{L}\p{N}' -]/gu,''))}" data-lento="1" title="${p.estado==='ok'?'Bien':p.oido?`Se entendió: ${esc(p.oido)}`:'No se entendió'}">${esc(p.texto)}</button>`).join(' ')}</p>`;
