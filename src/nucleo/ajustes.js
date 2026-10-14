/* Ajustes del dispositivo (localStorage 'ciberlab-ajustes'): tema, sonidos y vibración.
   No forman parte del progreso: "Reiniciar progreso" no los toca. La clave de IA vive aparte ('ciberlab-ia'). */
const CLAVE='ciberlab-ajustes';
const TEMAS=['auto','light','dark'];

export function ajustes(){
  let a={};try{a=JSON.parse(localStorage.getItem(CLAVE))||{}}catch(e){}
  return {tema:TEMAS.includes(a.tema)?a.tema:'auto',sonido:a.sonido!==false,vibracion:a.vibracion!==false};
}
export function cambiarAjuste(k,v){
  try{const a=JSON.parse(localStorage.getItem(CLAVE))||{};a[k]=v;localStorage.setItem(CLAVE,JSON.stringify(a))}catch(e){}
  if(k==='tema')aplicarTema();
}
// auto = sigue al sistema (prefers-color-scheme); light/dark lo fuerzan
export function aplicarTema(){
  const t=ajustes().tema,r=document.documentElement;
  if(t==='auto')delete r.dataset.theme;else r.dataset.theme=t;
}
// Vibración leve (si el dispositivo la tiene y el usuario no la apagó)
export function vibrar(patron){if(ajustes().vibracion)try{navigator.vibrate?.(patron)}catch(e){}}
