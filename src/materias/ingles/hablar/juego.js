/* Recompensas por hablar (la fase 3 agrega combo, medallas y sonidos).
   Hablar da más XP que escribir: es lo más importante para aprender el idioma. */
import {sumarXP,registrarHabla} from '../../../nucleo/progreso.js';

export const XP_FRASE=15;

// Una frase dicha con 80+ (sin "lento"): suma XP y devuelve el premio para mostrarlo
export function premiarFrase(puntaje){
  const xp=XP_FRASE+(puntaje>=95?5:0);
  sumarXP('ingles',xp);
  return {xp};
}
// Un turno de diálogo bien respondido: más XP a la primera, y más si fue hablado
export function premiarTurno(intento,hablado){
  const xp=(hablado?XP_FRASE:10)-(intento>1?5:0);
  sumarXP('ingles',xp);
  return {xp};
}
export const htmlPremio=p=>`<div class="premio">+${p.xp} XP</div>`;
export function cerrarCombo(){}
// Fin de una conversación (diálogo, jefe o IA): registra los turnos de la conversación más larga del día
export function terminarConversacion({turnos=0}){registrarHabla({conv:turnos})}
