/* Pantalla ☁️ Cuenta y sincronización (ruta 'cuenta', desde Perfil).
   Sin Supabase configurado: «Próximamente» y el respaldo .estudio sigue funcionando. Sin sesión: qué hace la cuenta y el
   enlace al correo (o Google). Con sesión: estado, «Sincronizar ahora», dispositivos, espacio de fotos, cerrar sesión
   (conservar o borrar lo de este dispositivo) y «Borrar mi cuenta y mis datos». */
import {esc} from '../../utilidades.js';
import {aviso,confirmar,elegir} from '../ui.js';
import {configurado,conGoogle,cuenta,estadoSync,textoEstado,sincronizarAhora,enviarEnlace,urlGoogle,dispositivos,usoFotos,cerrarSesion,borrarCuenta} from './navegador.js';
import {LIMITE_FOTOS,AVISO_FOTOS} from './motor.js';

const mb=b=>b<1024*1024?`${Math.round(b/1024)} KB`:`${(b/1024/1024).toFixed(1)} MB`;
let lista=null,uso=null,enviado=null,cargando=false;
async function cargarExtra(){
  if(cargando||!cuenta())return;cargando=true;
  [lista,uso]=await Promise.all([dispositivos().catch(()=>null),usoFotos().catch(()=>null)]);
  cargando=false;document.dispatchEvent(new Event('repintar'));
}
const fechaHora=iso=>iso?new Date(iso).toLocaleString('es',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const lineaRes=x=>x?`${(x.xp||0).toLocaleString('es-MX')} XP · ${x.dominadas||0} dominadas${x.notas!=null?` · ${x.notas} notas`:''}`:'nada todavía';

// Después del primer inicio de sesión en este dispositivo: qué se combinó (nunca se borra nada)
export async function mostrarPrimera(p){
  if(!p)return;
  await elegir({titulo:'🔀 Tus datos quedaron combinados',
    texto:`<p>En la nube: ${lineaRes(p.nube)}<br>En este dispositivo: ${lineaRes(p.antes)}</p><p><b>Ahora: ${lineaRes(p.despues)}</b></p><p class="nota">No se borró nada: la XP de cada dispositivo se suma una sola vez, la racha sale de los días de los dos y en cada nota gana la versión más nueva.</p>`,
    opciones:[{valor:true,texto:'Entendido'}],no:null});
}

export const vistaCuenta={
  titulo:'Cuenta',
  vista(){
    const e=estadoSync(),c=cuenta();
    const intro=`<h1>☁️ Cuenta y sincronización</h1>`;
    if(!e.configurado)return `${intro}<div class="card"><p style="margin-top:0"><b>Próximamente: sincronizar entre dispositivos.</b></p>
<p>Con una cuenta (opcional) tu progreso, tus notas y tus fotos pasarán solos entre el teléfono, el APK y la laptop.</p>
<p class="nota">Mientras tanto, usa <b>💾 Mis datos</b> en Perfil: exporta un respaldo <code>.estudio</code> y combínalo en el otro dispositivo.</p>
<button class="btn ghost ancho" data-go="perfil">💾 Ir a Mis datos</button></div>`;
    if(!c)return `${intro}<div class="card"><p style="margin-top:0">La cuenta es <b>opcional</b>: sin ella todo sigue funcionando y tus datos se quedan en este dispositivo.</p>
<ul class="nota" style="padding-left:20px"><li>Tu progreso, notas, fotos y materias propias pasan solos entre tus dispositivos.</li><li><b>El APK y el navegador comparten el progreso</b> (sin la cuenta, cada uno guarda lo suyo).</li><li>Al entrar por primera vez se <b>combina</b> lo de aquí con lo de la nube: no se pierde nada.</li><li>Tu clave de IA nunca se sube.</li></ul>
${enviado?`<p class="aviso-ok">📬 Te enviamos un enlace a <b>${esc(enviado)}</b>. Ábrelo <b>en este mismo dispositivo</b> para entrar.</p>`:''}
<label class="campo">Tu correo<input type="email" id="cta-email" autocomplete="email" inputmode="email" placeholder="tucorreo@ejemplo.com"></label>
<button class="btn ancho" id="cta-enlace">📧 Enviarme el enlace para entrar</button>
${conGoogle()?`<button class="btn ghost ancho" id="cta-google" style="margin-top:8px">Entrar con Google</button>`:''}
<p class="nota" style="margin-bottom:0">No hay contraseña: cada vez que entres en un dispositivo nuevo te llega un enlace al correo.</p></div>`;
    const f=e.fotos?.uso||uso,avisoFotos=f&&f.total>=LIMITE_FOTOS*AVISO_FOTOS;
    if(!lista&&!cargando)cargarExtra();
    return `${intro}<div class="card"><p style="margin-top:0">Entraste como <b>${esc(c.email||'tu cuenta')}</b></p>
<p id="cta-estado" class="lead">${textoEstado(e)}</p>
<button class="btn ancho" id="cta-sinc"${e.ocupado?' disabled':''}>🔄 Sincronizar ahora</button>
<p class="nota" style="margin-bottom:0">Se sincroniza solo al abrir la app, al terminar de practicar, al guardar una nota y al volver la conexión. El APK y el navegador comparten tu progreso con esta cuenta.</p></div>
<h2>📱 Tus dispositivos</h2><div class="card">${lista?lista.length?`<ul class="lista-simple">${lista.map(d=>`<li><b>${esc(d.nombre||'Dispositivo')}</b>${d.este?' <span class="chip">este</span>':''}<br><span class="nota">Última vez: ${fechaHora(d.ultimo)}</span></li>`).join('')}</ul>`:'<p class="nota">Todavía no hay dispositivos.</p>':'<p class="nota">Cargando…</p>'}</div>
<h2>🖼️ Fotos en la nube</h2><div class="card">${f?`<p style="margin-top:0">Tus fotos ocupan <b>${mb(f.mio||0)}</b>.</p>${avisoFotos?`<p class="aviso-error">⚠️ El espacio gratuito (1 GB para todos los usuarios de esta app) está casi lleno: ${mb(f.total)}. Las fotos nuevas podrían dejar de subirse; tus notas siguen sincronizándose.</p>`:`<p class="nota" style="margin-bottom:0">El plan gratuito tiene 1 GB para todas las fotos de la app. Las fotos se guardan comprimidas (máximo 1600 px).</p>`}`:'<p class="nota">Cargando…</p>'}</div>
<h2>Sesión</h2><div class="pila">
<button class="btn ghost ancho" id="cta-salir">Cerrar sesión en este dispositivo</button>
<button class="btn ghost ancho peligro-texto" id="cta-borrar">🗑️ Borrar mi cuenta y mis datos de la nube</button></div>`;
  },
  alMostrar(){
    const h=()=>{const el=document.getElementById('cta-estado');if(el)el.textContent=textoEstado()};
    if(!this._oyente){this._oyente=ev=>{h();if(ev.detail&&!ev.detail.ocupado&&location.hash.startsWith('#cuenta'))document.dispatchEvent(new Event('repintar'))};addEventListener('sync',this._oyente)}
  },
  alSalir(){if(this._oyente){removeEventListener('sync',this._oyente);this._oyente=null}},
  async alClic(t,ir,repintar){
    if(t.id==='cta-enlace'){const email=document.getElementById('cta-email')?.value.trim()||'';
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){aviso('Escribe un correo válido.');return true}
      t.disabled=true;const r=await enviarEnlace(email);t.disabled=false;
      if(r.ok){enviado=email;repintar()}else aviso(r.error==='red'?'📴 Sin conexión: inténtalo con internet.':r.error==='limite_uso'?'Espera un minuto antes de pedir otro enlace.':'No se pudo enviar el enlace. Inténtalo más tarde.',4000);
      return true}
    if(t.id==='cta-google'){location.href=urlGoogle();return true}
    if(t.id==='cta-sinc'){t.disabled=true;const r=await sincronizarAhora();lista=null;
      aviso(r.ok?'✓ Sincronizado':r.error==='red'?'📴 Sin conexión: se enviará luego':r.error==='ocupado'?'Ya se está sincronizando…':'No se pudo sincronizar: se reintentará',3000);
      if(r.primera)await mostrarPrimera(r.primera);repintar();return true}
    if(t.id==='cta-salir'){
      const v=await elegir({titulo:'¿Cerrar sesión?',texto:'<p>Lo que está en la nube no cambia. ¿Qué hacemos con los datos de este dispositivo?</p>',
        opciones:[{valor:'conservar',texto:'Cerrar sesión y conservar mis datos aquí'},{valor:'borrar',texto:'Cerrar sesión y borrar los datos de este dispositivo',clase:'ghost'}]});
      if(!v)return true;
      if(v==='borrar'&&!(await confirmar({titulo:'¿Borrar los datos de este dispositivo?',texto:'Se borran progreso, notas y fotos de aquí. En la nube siguen y vuelven al entrar otra vez.',si:'Sí, borrar de aquí',peligro:true})))return true;
      await cerrarSesion({borrarLocal:v==='borrar'});lista=uso=null;enviado=null;aviso('Sesión cerrada');
      if(v==='borrar'){location.reload();return true}
      repintar();return true}
    if(t.id==='cta-borrar'){
      if(!(await confirmar({titulo:'¿Borrar tu cuenta?',texto:'Se borran <b>para siempre</b> tu cuenta y todo lo que está en la nube (progreso, notas y fotos). Lo de este dispositivo se queda. No se puede deshacer.',si:'Sí, borrar mi cuenta',peligro:true})))return true;
      t.disabled=true;const r=await borrarCuenta();t.disabled=false;
      aviso(r.ok?'Tu cuenta y tus datos de la nube se borraron.':'No se pudo borrar la cuenta: revisa tu conexión e inténtalo otra vez.',4000);lista=uso=null;repintar();return true}
  }
};
