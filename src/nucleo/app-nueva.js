/* Pasar a la app nativa (PROMPT-APP-NATIVA, parte 3). La app nueva guarda sus datos en su propio almacenamiento, separado
   del de Chrome (donde viven la web y la TWA vieja), así que el progreso no pasa solo:
   - En la app nativa, la primera vez y sin datos, vistaInicioApp(): ☁️ entrar con la cuenta (lo recomendado: trae todo de
     Supabase), 📥 importar un respaldo .estudio o empezar de cero (sigue la bienvenida de siempre).
   - En la web y la TWA, htmlAvisoAppNueva() en la portada: entra con tu cuenta o exporta un respaldo antes de cambiarte.
     Se oculta con ✕ (ciberlab-aviso-app). */
import {esNativa} from './plataforma.js';
import {htmlRespaldo,activarImportar} from './notas.js';
import {descargarRespaldo} from './cuaderno/respaldo.js';
import {cuenta,configurado} from './sync/navegador.js';
import {aviso} from './ui.js';

const CLAVE_INICIO='ciberlab-app-inicio',CLAVE_AVISO='ciberlab-aviso-app';
const leer=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const poner=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
export const tocaInicioApp=()=>esNativa()&&!leer(CLAVE_INICIO);
export const marcarInicioApp=()=>poner(CLAVE_INICIO,new Date().toISOString().slice(0,10));

export function vistaInicioApp(){
  let importar=false;
  return {
    titulo:'Bienvenida',inmersiva:true,
    vista(){
      if(importar)return `<div class="bienvenida"><h1>📥 Importar tu respaldo</h1><p class="intro">Elige el archivo <code>.estudio</code> que exportaste en la app anterior (o que te mandaste por WhatsApp, Drive o correo).</p>${htmlRespaldo()}
<div class="bien-pie"><button type="button" class="btn ghost" id="ini-volver">Atrás</button><button type="button" class="btn ghost" id="ini-cero">Empezar de cero</button></div></div>`;
      return `<div class="bienvenida"><img class="bien-logo" src="icons/icon-192.png" alt="" width="96" height="96">
<h1>¡Ya tienes la app nueva!</h1><p class="intro">Ahora Estudio+ es una app de verdad: funciona sin internet desde el primer momento y ya no depende de Chrome. ¿Ya usabas la app?</p>
<div class="pila">${configurado()?`<button type="button" class="btn ancho ini-principal" id="ini-cuenta">☁️ Entrar con mi cuenta<small>Recomendado: trae tu progreso, notas y fotos</small></button>`:''}
<button type="button" class="btn ghost ancho" id="ini-importar">📥 Importar un respaldo .estudio</button>
<button type="button" class="btn ghost ancho" id="ini-cero">✨ Empezar de cero</button></div>
<p class="nota">Si tu progreso estaba en la app anterior sin cuenta, ábrela, ve a Perfil → 💾 Mis datos → Exportar, y luego importa ese archivo aquí.</p></div>`;
    },
    alMostrar(){if(importar)activarImportar(()=>{marcarInicioApp();aviso('📥 ¡Listo! Tu progreso ya está aquí.',3500);location.hash='';location.reload()})},
    alClic(t,ir,repintar){
      if(t.id==='ini-cuenta'){marcarInicioApp();ir('cuenta');return true}
      if(t.id==='ini-importar'){importar=true;repintar();return true}
      if(t.id==='ini-volver'){importar=false;repintar();return true}
      if(t.id==='ini-cero'){marcarInicioApp();ir('');return true}
    }
  };
}

// Aviso en la web y la TWA: la app nueva viene, que nadie pierda su progreso
export function htmlAvisoAppNueva(){
  if(esNativa()||leer(CLAVE_AVISO))return '';
  const conCuenta=!!cuenta?.();
  return `<div class="card aviso-app" role="note"><button type="button" class="btn-icono aviso-app-x" id="aviso-app-x" aria-label="Ocultar el aviso">✕</button>
<h3 style="margin-top:0">📱 Pronto llega la app nueva</h3><p class="nota">Funcionará sin internet y sin depender de Chrome. Para no perder tu progreso al cambiarte, ${conCuenta?'ya tienes tu cuenta: solo entra con ella en la app nueva.':'entra con tu cuenta o exporta un respaldo.'}</p>
<div class="row" style="flex-wrap:wrap;gap:8px">${conCuenta?'':configurado()?'<button type="button" class="btn btn-chico" data-go="cuenta">☁️ Entrar con mi cuenta</button>':''}<button type="button" class="btn ghost btn-chico" id="aviso-app-respaldo">💾 Exportar respaldo</button></div></div>`;
}
export async function clicAvisoAppNueva(t){
  if(t.id==='aviso-app-x'){poner(CLAVE_AVISO,'1');t.closest('.aviso-app')?.remove();return true}
  if(t.id==='aviso-app-respaldo'){t.disabled=true;try{const x=await descargarRespaldo();aviso(`💾 Respaldo listo: ${x.notas} notas y ${x.archivos} imágenes. Guárdalo para importarlo en la app nueva.`,4500)}catch(e){aviso('No se pudo exportar.')}t.disabled=false;return true}
  return false;
}
