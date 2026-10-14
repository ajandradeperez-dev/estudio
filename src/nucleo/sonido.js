/* Sonidos cortos con Web Audio (sin archivos). Se pueden silenciar en Perfil. */
import {ajustes,cambiarAjuste} from './ajustes.js';

export const sonidoActivo=()=>ajustes().sonido;
export const alternarSonido=()=>cambiarAjuste('sonido',!sonidoActivo());
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
  fallo:()=>tono([[247,0,.18]]),
  fin:()=>tono([[523,0,.12],[784,.1,.12],[1047,.2,.3]])
};
