/* Ajustes del dispositivo (localStorage 'ciberlab-ajustes'): tema, sonidos, vibración y pantalla (tamaño del texto,
   dos paneles en horizontal y el ancho del panel de ayuda de la práctica).
   No forman parte del progreso: "Reiniciar progreso" no los toca. La clave de IA vive aparte ('ciberlab-ia'). */
import {esNativa,vibrarNativo} from './plataforma.js';
const CLAVE='ciberlab-ajustes';
const TEMAS=['auto','light','dark'],TEXTOS=['normal','grande','muy-grande'];

export function ajustes(){
  let a={};try{a=JSON.parse(localStorage.getItem(CLAVE))||{}}catch(e){}
  return {tema:TEMAS.includes(a.tema)?a.tema:'auto',sonido:a.sonido!==false,vibracion:a.vibracion!==false,
    texto:TEXTOS.includes(a.texto)?a.texto:'normal',paneles:a.paneles!==false,panelAncho:+a.panelAncho>=280?+a.panelAncho:null};
}
export function cambiarAjuste(k,v){
  try{const a=JSON.parse(localStorage.getItem(CLAVE))||{};a[k]=v;localStorage.setItem(CLAVE,JSON.stringify(a))}catch(e){}
  if(['tema','texto','paneles'].includes(k))aplicarTema();
}
// auto = sigue al sistema (prefers-color-scheme); light/dark lo fuerzan. También el tamaño del texto y los dos paneles
// (atributos en <html> que lee estilos/tablet.css)
export function aplicarTema(){
  const a=ajustes(),r=document.documentElement;
  if(a.tema==='auto')delete r.dataset.theme;else r.dataset.theme=a.tema;
  if(a.texto==='normal')delete r.dataset.texto;else r.dataset.texto=a.texto;
  if(a.paneles)delete r.dataset.paneles;else r.dataset.paneles='no';
}
// Vibración leve (si el dispositivo la tiene y el usuario no la apagó)
export function vibrar(patron){if(!ajustes().vibracion)return;if(esNativa()){vibrarNativo(patron);return}try{navigator.vibrate?.(patron)}catch(e){}}
