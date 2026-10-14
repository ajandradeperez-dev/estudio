/* Motor de voz: síntesis (speechSynthesis) y reconocimiento (SpeechRecognition / webkitSpeechRecognition).
   Si el navegador no los soporta, la app no se rompe: las vistas muestran un aviso y caen a modo escrito. */
import {esc} from '../utilidades.js';

const Reconocedor=typeof window!=='undefined'?(window.SpeechRecognition||window.webkitSpeechRecognition):undefined;
export const soporte={
  hablar:typeof window!=='undefined'&&!!window.speechSynthesis&&'SpeechSynthesisUtterance' in window,
  escuchar:!!Reconocedor
};
export const AVISO_SIN_RECONOCIMIENTO='Tu navegador no reconoce la voz. Usa Chrome en Android (o en el ordenador). Mientras tanto, puedes escribir tus respuestas.';

/* ---------- hablar ---------- */
let voces=[];
function cargarVoces(){try{voces=speechSynthesis.getVoices()||[]}catch(e){voces=[]}}
if(soporte.hablar){cargarVoces();try{speechSynthesis.addEventListener('voiceschanged',cargarVoces)}catch(e){}}
// La mejor voz en inglés de EE. UU.: primero las de Google y las "naturales" u online, después cualquier en-US
export function vozIngles(){
  if(!voces.length)cargarVoces();
  const en=voces.filter(v=>/^en[-_]US/i.test(v.lang)),puntos=v=>(/Google US English/i.test(v.name)?8:0)+(/natural|neural|online|enhanced|premium/i.test(v.name)?4:0)+(v.localService===false?1:0);
  return en.sort((a,b)=>puntos(b)-puntos(a))[0]||voces.find(v=>/^en/i.test(v.lang))||null;
}
// Lee un texto en inglés. Devuelve una promesa que se resuelve al terminar (o enseguida si no hay síntesis).
// idioma: 'en-US' (por defecto, práctica de inglés) o 'es' (leer en voz alta un paso de un procedimiento)
export function hablar(texto,{lento=false,idioma='en-US'}={}){
  if(!soporte.hablar||!texto)return Promise.resolve();
  return new Promise(res=>{
    try{
      speechSynthesis.cancel();
      const es=idioma.startsWith('es'),u=new SpeechSynthesisUtterance(texto);
      const v=es?speechSynthesis.getVoices().find(x=>x.lang?.toLowerCase().startsWith('es')):vozIngles();
      u.lang=es?(v?.lang||'es-MX'):'en-US';if(v)u.voice=v;u.rate=lento?0.75:1;
      let fin=false;const listo=()=>{if(!fin){fin=true;res()}};
      u.onend=listo;u.onerror=listo;
      setTimeout(listo,Math.max(4000,texto.length*180)); // por si el navegador nunca avisa del final
      speechSynthesis.speak(u);
    }catch(e){res()}
  });
}
export function callar(){try{speechSynthesis.cancel()}catch(e){}}

/* ---------- escuchar ---------- */
const MENSAJES={
  'no-speech':'No te escuché. Toca el micrófono y habla cerca del teléfono.',
  'audio-capture':'No se detecta un micrófono. Revisa que el teléfono tenga uno disponible.',
  'not-allowed':'El permiso del micrófono está bloqueado. Actívalo en Chrome: ⋮ → Configuración → Configuración de sitios → Micrófono, y vuelve a intentar.',
  'service-not-allowed':'El navegador no permite el reconocimiento de voz aquí. Usa Chrome en Android o escribe tu respuesta.',
  'network':'El reconocimiento de voz necesita internet. Revisa la conexión o escribe tu respuesta.',
  'language-not-supported':'Tu navegador no reconoce inglés de EE. UU. Escribe tu respuesta.',
  'aborted':'Se detuvo la escucha.',
  'sin-soporte':AVISO_SIN_RECONOCIMIENTO
};
export class ErrorVoz extends Error{constructor(codigo){super(MENSAJES[codigo]||'No se pudo escuchar. Intenta de nuevo o escribe tu respuesta.');this.codigo=codigo}}

let activo=null;
/* Escucha una frase. Resuelve {transcripcion, confianza, alternativas:[{transcripcion, confianza}], segundos}.
   Rechaza con ErrorVoz (mensaje en español). alParcial(texto) recibe resultados intermedios. */
export function escuchar({idioma='en-US',alternativas=3,alParcial,maxSegundos=15}={}){
  if(!Reconocedor)return Promise.reject(new ErrorVoz('sin-soporte'));
  detenerEscucha();
  return new Promise((res,rej)=>{
    const r=new Reconocedor(),inicio=Date.now();let final=null,terminado=false;
    activo=r;
    r.lang=idioma;r.maxAlternatives=alternativas;r.interimResults=!!alParcial;r.continuous=false;
    const cerrar=(fn,v)=>{if(terminado)return;terminado=true;clearTimeout(tope);if(activo===r)activo=null;fn(v)};
    const tope=setTimeout(()=>{try{r.stop()}catch(e){}},maxSegundos*1000);
    r.onresult=e=>{
      for(let i=e.resultIndex;i<e.results.length;i++){
        const res_=e.results[i],alts=Array.from({length:res_.length},(_,k)=>({transcripcion:res_[k].transcript.trim(),confianza:res_[k].confidence||0}));
        if(res_.isFinal)final=alts;else alParcial?.(alts[0].transcripcion);
      }
    };
    r.onerror=e=>cerrar(rej,new ErrorVoz(e.error));
    r.onend=()=>{
      const segundos=Math.round((Date.now()-inicio)/1000);
      if(final&&final[0].transcripcion)cerrar(res,{transcripcion:final[0].transcripcion,confianza:final[0].confianza,alternativas:final,segundos});
      else cerrar(rej,new ErrorVoz('no-speech'));
    };
    try{r.start()}catch(e){cerrar(rej,new ErrorVoz('aborted'))}
  });
}
export function detenerEscucha(){if(activo){try{activo.stop()}catch(e){}}}
export const escuchando=()=>!!activo;

/* ---------- piezas de interfaz ---------- */
const ICONO_MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11Z" fill="currentColor"/></svg>';
// Botón grande "tocar para hablar". id distinto si hay varios en la pantalla.
export const htmlMic=(id='mic',texto='Toca y habla')=>`<div class="mic-zona"><button class="mic" id="${id}" type="button" aria-label="${texto}">${ICONO_MIC}<span class="mic-ondas" aria-hidden="true"></span></button>
<div class="mic-estado" id="${id}-estado" role="status">${soporte.escuchar?texto:'Micrófono no disponible: escribe tu respuesta'}</div></div>`;
// Escucha con el botón: animación de onda, texto de estado y transcripción parcial
export async function escucharConBoton(boton,opciones={}){
  const estado=document.getElementById(boton.id+'-estado'),txt=estado?.textContent;
  if(escuchando()){detenerEscucha();return null}
  boton.classList.add('escuchando');if(estado)estado.textContent='Te escucho…';
  try{return await escuchar({...opciones,alParcial:t=>{if(estado)estado.textContent=`«${t}»`}})}
  finally{boton.classList.remove('escuchando');if(estado)estado.textContent=txt}
}
// Botón para oír un texto (normal y lento). Lo maneja main.js con data-decir.
export const htmlOir=(texto,{lento=true}={})=>soporte.hablar?`<span class="oir"><button class="btn ghost btn-chico" type="button" data-decir="${esc(texto)}" aria-label="Escuchar">🔊 Escuchar</button>${lento?`<button class="btn ghost btn-chico" type="button" data-decir="${esc(texto)}" data-lento="1" aria-label="Escuchar lento">🐢 Lento</button>`:''}</span>`:'';
// Frase coloreada palabra por palabra; tocar una palabra la lee lento
export const htmlFraseEvaluada=r=>`<p class="frase-evaluada">${r.palabras.map(p=>`<button type="button" class="palabra ${p.estado}" data-decir="${esc(p.texto.replace(/[^\p{L}\p{N}' -]/gu,''))}" data-lento="1" title="${p.estado==='ok'?'Bien':p.oido?`Se entendió: ${esc(p.oido)}`:'No se entendió'}">${esc(p.texto)}</button>`).join(' ')}</p>`;
