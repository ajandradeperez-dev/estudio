/* Pantalla de cierre de cualquier sesión o lección: XP ganada, lo que aprendiste (1–3 puntos)
   y lo siguiente que conviene hacer, con un botón "Seguir". Corta: feedback inmediato, sin estadísticas largas. */
import {esc} from '../utilidades.js';
import {progreso,hoy} from './progreso.js';
import {recomendar} from './recomendador.js';

// XP acumulada hoy: las vistas la guardan al empezar y al cerrar muestran la diferencia
export const xpHoy=(p=progreso())=>p.dias[hoy()]?.xp||0;

// aprendido: textos HTML de confianza (reglas del contenido); se muestran como mucho 3
export function htmlCierre({xp=0,aprendido=[],excluir}={}){
  const r=recomendar({excluir}),puntos=[...new Set(aprendido.filter(Boolean))].slice(0,3);
  return `<div class="cierre">
<div class="cierre-xp">+${Math.max(0,xp)} XP</div>
${puntos.length?`<div class="cierre-aprendido"><b>Lo que aprendiste</b><ul>${puntos.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:''}
<div class="cierre-siguiente"><span class="sup-k">👉 Lo siguiente para ti</span><b>${esc(r.titulo)}</b><span class="nota">${esc(r.porque)}</span>
<button class="btn" data-go="${esc(r.ruta)}">Seguir</button></div></div>`;
}
