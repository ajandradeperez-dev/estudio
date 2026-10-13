/* Estilo juego de Inglés: XP por hablar (más que por escribir), combo, medallas, sonidos y avisos cortos.
   Se guarda en materias.ingles.extra: combo {actual, max}, medallas {id: fecha}, ia (conversaciones), sinPistas. */
import {sumarXP,registrarHabla,progreso,datosMateria,cambiarExtra,hoy} from '../../../nucleo/progreso.js';
import {UNIDADES} from './unidades.js';

export const XP_FRASE=15;   // por frase dicha con 80+ (escribir da 10)
const AJUSTES='ciberlab-ajustes';

/* ---------- sonidos (Web Audio, sin archivos) ---------- */
export function sonidoActivo(){try{return JSON.parse(localStorage.getItem(AJUSTES))?.sonido!==false}catch(e){return true}}
export function alternarSonido(){try{const a=JSON.parse(localStorage.getItem(AJUSTES))||{};a.sonido=!sonidoActivo();localStorage.setItem(AJUSTES,JSON.stringify(a))}catch(e){}}
let audio;
function tono(notas){
  if(!sonidoActivo())return;
  try{
    audio=audio||new (window.AudioContext||window.webkitAudioContext)();
    const t0=audio.currentTime;
    for(const [f,ini,dur] of notas){
      const o=audio.createOscillator(),g=audio.createGain();
      o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t0+ini);g.gain.exponentialRampToValueAtTime(0.16,t0+ini+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+ini+dur);
      o.connect(g).connect(audio.destination);o.start(t0+ini);o.stop(t0+ini+dur+0.05);
    }
  }catch(e){}
}
export const sonar={
  acierto:()=>tono([[660,0,.12],[880,.1,.18]]),
  combo:()=>tono([[660,0,.1],[880,.08,.1],[1175,.16,.22]]),
  medalla:()=>tono([[523,0,.14],[659,.12,.14],[784,.24,.14],[1047,.36,.32]]),
  fallo:()=>tono([[247,0,.18]])
};

/* ---------- aviso flotante corto ---------- */
export function mostrarAviso(html){
  let el=document.getElementById('aviso-flotante');
  if(!el){el=document.createElement('div');el.id='aviso-flotante';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el)}
  el.innerHTML=html;el.classList.add('visible');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('visible'),3500);
}

/* ---------- medallas ---------- */
const sonDias=p=>Object.values(p.dias).filter(d=>d?.habla?.frases>0).length;
const totalFrases=p=>Object.values(p.dias).reduce((s,d)=>s+(d?.habla?.frases||0),0);
export const MEDALLAS=[
  {id:'primera-conversacion',icono:'🗣️',nombre:'Primera conversación',desc:'Terminaste tu primer diálogo o conversación.',logra:(p,e)=>Object.keys(e.dialogos||{}).length>0||(e.ia||0)>0},
  {id:'charla-ia',icono:'🤖',nombre:'Charla con IA',desc:'Completaste una conversación con el tutor IA.',logra:(p,e)=>(e.ia||0)>0},
  {id:'sin-pistas',icono:'🎯',nombre:'Sin pistas',desc:'Un diálogo completo, bien y sin usar pistas.',logra:(p,e)=>!!e.sinPistas},
  {id:'domaste-th',icono:'👅',nombre:'Domaste la TH',desc:'80 % o más en tus últimos 10+ intentos con la TH.',logra:(p,e)=>{const s=e.sonidos?.th;return !!s&&s.ult.length>=10&&s.ult.reduce((a,b)=>a+b,0)/s.ult.length>=0.8}},
  {id:'combo-10',icono:'🔥',nombre:'Combo x10',desc:'10 frases bien seguidas.',logra:(p,e)=>(e.combo?.max||0)>=10},
  {id:'100-frases',icono:'💬',nombre:'100 frases',desc:'Dijiste 100 frases en voz alta.',logra:p=>totalFrases(p)>=100},
  {id:'10-dias',icono:'📅',nombre:'10 días hablando',desc:'Hablaste en 10 días distintos.',logra:p=>sonDias(p)>=10},
  {id:'primer-jefe',icono:'🏆',nombre:'Primer jefe',desc:'Venciste al jefe de una unidad.',logra:(p,e)=>Object.values(e.unidades||{}).some(u=>u?.jefe)},
  {id:'a1-completo',icono:'⭐',nombre:'A1 completo',desc:'Venciste a todos los jefes de A1.',logra:(p,e)=>UNIDADES.filter(u=>u.nivel==='A1').every(u=>e.unidades?.[u.id]?.jefe)}
];
// Revisa las medallas y entrega las nuevas (con sonido y aviso). Devuelve las nuevas.
export function otorgarMedallas(){
  const p=progreso(),e=datosMateria(p,'ingles').extra,ya=e.medallas||{};
  const nuevas=MEDALLAS.filter(m=>!ya[m.id]&&m.logra(p,e));
  if(!nuevas.length)return [];
  cambiarExtra('ingles',x=>{x.medallas=x.medallas||{};for(const m of nuevas)x.medallas[m.id]=hoy()});
  sonar.medalla();
  mostrarAviso(nuevas.map(m=>`<span class="medalla-nueva">${m.icono} <b>¡Medalla!</b> ${m.nombre}</span>`).join(''));
  return nuevas;
}

/* ---------- XP y combo ---------- */
const multiplicador=c=>c>=10?3:c>=5?2:c>=3?1.5:1;
function sumarCombo(){
  let c=0;
  cambiarExtra('ingles',e=>{const x=e.combo||{actual:0,max:0};x.actual++;x.max=Math.max(x.max,x.actual);e.combo=x;c=x.actual});
  return c;
}
// Una frase dicha con 80+ (sin "lento"): XP × combo
export function premiarFrase(puntaje){
  const combo=sumarCombo(),mult=multiplicador(combo),xp=Math.round((XP_FRASE+(puntaje>=95?5:0))*mult);
  sumarXP('ingles',xp);
  (combo>=3?sonar.combo:sonar.acierto)();
  otorgarMedallas();
  return {xp,combo,mult};
}
// Un turno de diálogo bien: más XP a la primera y si fue hablado; también suma al combo
export function premiarTurno(intento,hablado){
  const combo=sumarCombo(),mult=multiplicador(combo),xp=Math.round(((hablado?XP_FRASE:10)-(intento>1?5:0))*mult);
  sumarXP('ingles',xp);
  (combo>=3?sonar.combo:sonar.acierto)();
  otorgarMedallas();
  return {xp,combo,mult};
}
// Un fallo rompe el combo
export function cerrarCombo(){
  if(!(datosMateria(progreso(),'ingles').extra.combo?.actual))return;
  cambiarExtra('ingles',e=>{if(e.combo)e.combo.actual=0});
  sonar.fallo();
}
export const comboActual=()=>datosMateria(progreso(),'ingles').extra.combo?.actual||0;
export const htmlPremio=p=>`<div class="premio">+${p.xp} XP${p.combo>=3?` · 🔥 combo ${p.combo} (x${p.mult})`:''}</div>`;

// Fin de una conversación (diálogo, jefe o IA)
export function terminarConversacion({turnos=0,sinPistas=false,ia=false}){
  registrarHabla({conv:turnos});
  if(sinPistas||ia)cambiarExtra('ingles',e=>{if(sinPistas)e.sinPistas=true;if(ia)e.ia=(e.ia||0)+1});
  otorgarMedallas();
}
// El jefe de una unidad quedó vencido: desbloquea la siguiente
export function vencerJefe(unidadId){
  cambiarExtra('ingles',e=>{e.unidades=e.unidades||{};e.unidades[unidadId]={...(e.unidades[unidadId]||{}),jefe:hoy()}});
  otorgarMedallas();
}
