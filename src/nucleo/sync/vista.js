/* Pantalla ☁️ Cuenta y sincronización (ruta 'cuenta', desde Perfil).
   Sin Supabase configurado: «Próximamente» y el respaldo .estudio sigue funcionando. Sin sesión: qué hace la cuenta,
   «Entrar» y «Crear cuenta» con correo y contraseña (mínimo 8, se puede mostrar u ocultar), «Olvidé mi contraseña» y, como
   alternativa, un código de 6 dígitos por correo (o Google). Al volver del enlace de «Olvidé mi contraseña» pide la nueva.
   Con sesión: estado, «Sincronizar ahora», dispositivos, espacio de fotos, cerrar sesión (conservar o borrar lo de este
   dispositivo) y «Borrar mi cuenta y mis datos». */
import {esc} from '../../utilidades.js';
import {aviso,confirmar,elegir} from '../ui.js';
import {configurado,conGoogle,cuenta,estadoSync,textoEstado,sincronizarAhora,enviarCodigo,urlGoogle,entrar,crearCuenta,recuperar,
  verificarCodigo,cambiarContrasena,pideNuevaContrasena,omitirNuevaContrasena,dispositivos,usoFotos,cerrarSesion,borrarCuenta} from './navegador.js';
import {LIMITE_FOTOS,AVISO_FOTOS} from './motor.js';

export const MIN_CLAVE=8;
const mb=b=>b<1024*1024?`${Math.round(b/1024)} KB`:`${(b/1024/1024).toFixed(1)} MB`;
let lista=null,uso=null,cargando=false;
// sin sesión: modo 'entrar' | 'crear' | 'olvide' | 'codigo'; avisoCta = mensaje bajo el formulario; codigoPara = correo del código
let modo='entrar',avisoCta=null,codigoPara=null,correo='';
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

/* ---------- formulario sin sesión ---------- */
const campoCorreo=()=>`<label class="campo">Tu correo<input type="email" id="cta-email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="tucorreo@ejemplo.com" value="${esc(correo)}"></label>`;
const campoClave=(id,auto)=>`<label class="campo" for="${id}">Contraseña${auto==='new-password'?` <span class="nota">(mínimo ${MIN_CLAVE} caracteres)</span>`:''}</label>
<div class="cta-clave"><input type="password" id="${id}" autocomplete="${auto}" minlength="${MIN_CLAVE}" autocapitalize="off" spellcheck="false"><button type="button" class="btn ghost" data-ver-clave="${id}" aria-label="Mostrar contraseña" aria-pressed="false">👁️</button></div>`;
const pestana=(m,txt)=>`<button type="button" role="tab" class="btn${modo===m?'':' ghost'}" data-cta-modo="${m}" aria-selected="${modo===m}">${txt}</button>`;
const avisoHtml=()=>avisoCta?`<p class="${avisoCta.ok?'aviso-ok':'aviso-error'}" id="cta-aviso" role="status">${avisoCta.texto}</p>`:'';
const volverEntrar=txt=>`<button type="button" class="btn ghost ancho" data-cta-modo="entrar" style="margin-top:8px">${txt}</button>`;
function formulario(){
  if(modo==='olvide')return `<h2 style="margin-top:0">Olvidé mi contraseña</h2><p class="nota">Te enviamos un enlace para elegir una contraseña nueva. Ábrelo <b>en este mismo dispositivo</b>.</p>
<form>${campoCorreo()}<button class="btn ancho" id="cta-recuperar">📧 Enviarme el enlace</button></form>${avisoHtml()}${volverEntrar('← Volver a Entrar')}`;
  if(modo==='codigo')return `<h2 style="margin-top:0">Entrar con un código</h2><p class="nota">Sin contraseña: te enviamos un correo con un código de 6 dígitos (el correo también trae un enlace que sirve igual). Si todavía no tienes cuenta, se crea.</p>
${codigoPara?`<form><label class="campo">Código que llegó a ${esc(codigoPara)}<input id="cta-codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></label><button class="btn ancho" id="cta-verificar">Entrar</button></form>
<button type="button" class="btn ghost ancho" id="cta-otro-codigo" style="margin-top:8px">Enviar otro código</button>`
:`<form>${campoCorreo()}<button class="btn ancho" id="cta-enviar-codigo">📧 Enviarme el código</button></form>`}${avisoHtml()}${volverEntrar('← Entrar con contraseña')}`;
  const crear=modo==='crear';
  return `<div class="cta-pestanas" role="tablist">${pestana('entrar','Entrar')}${pestana('crear','Crear cuenta')}</div>
<form>${campoCorreo()}${campoClave('cta-clave',crear?'new-password':'current-password')}
<button class="btn ancho" id="${crear?'cta-crear':'cta-entrar'}">${crear?'Crear cuenta':'Entrar'}</button></form>${avisoHtml()}
<div class="pila" style="margin-top:8px">${crear?'':'<button type="button" class="btn ghost ancho" data-cta-modo="olvide">Olvidé mi contraseña</button>'}
<button type="button" class="btn ghost ancho" data-cta-modo="codigo">✉️ Entrar con un código por correo</button>
${conGoogle()?'<button type="button" class="btn ghost ancho" id="cta-google">Entrar con Google</button>':''}</div>`;
}
const correoValido=e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const leerCorreo=()=>{const v=document.getElementById('cta-email');if(v)correo=v.value.trim();return correo};
export const mensajeError=r=>r.error==='red'?'📴 Sin conexión: inténtalo con internet.'
  :r.error==='limite_uso'||/rate_limit/.test(r.codigo||'')?'Demasiados intentos o correos seguidos: espera unos minutos e inténtalo otra vez.'
  :r.codigo==='invalid_credentials'||r.codigo==='invalid_grant'?'El correo o la contraseña no coinciden. Revisa los dos o toca «Olvidé mi contraseña».'
  :r.codigo==='email_not_confirmed'?'Falta confirmar tu correo: abre el enlace que te enviamos al crear la cuenta (o entra con un código).'
  :r.codigo==='weak_password'?`Esa contraseña es muy débil: usa al menos ${MIN_CLAVE} caracteres, mejor con letras y números.`
  :r.codigo==='same_password'?'Esa ya es tu contraseña: escribe una distinta.'
  :r.codigo==='otp_expired'||r.codigo==='otp_disabled'?'El código no es válido o ya venció: pide otro.'
  :r.codigo==='signup_disabled'||r.codigo==='email_provider_disabled'?'Por ahora no se pueden crear cuentas nuevas.'
  :r.error==='existe'?'Ese correo ya tiene cuenta: toca «Entrar» (o «Olvidé mi contraseña»).'
  :'No se pudo completar. Inténtalo más tarde.';
// Ya con la sesión: combina con la nube y muestra el resumen del primer inicio
async function yaDentro(repintar){
  avisoCta=null;codigoPara=null;modo='entrar';repintar();
  const r=await sincronizarAhora();if(r.primera)await mostrarPrimera(r.primera);repintar();
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
<ul class="nota" style="padding-left:20px;margin-bottom:0"><li>Tu progreso, notas, fotos y materias propias pasan solos entre tus dispositivos.</li><li><b>El APK y el navegador comparten el progreso</b> (sin la cuenta, cada uno guarda lo suyo).</li><li>Al entrar por primera vez se <b>combina</b> lo de aquí con lo de la nube: no se pierde nada.</li><li>Tu clave de IA nunca se sube.</li></ul></div>
<div class="card">${formulario()}</div>`;
    const nueva=pideNuevaContrasena()?`<div class="card"><h2 style="margin-top:0">🔑 Elige tu nueva contraseña</h2>
<form>${campoClave('cta-nueva','new-password')}<button class="btn ancho" id="cta-guardar-clave">Guardar contraseña</button></form>
<button type="button" class="btn ghost ancho" id="cta-omitir-clave" style="margin-top:8px">Ahora no</button></div>`:'';
    const f=e.fotos?.uso||uso,avisoFotos=f&&f.total>=LIMITE_FOTOS*AVISO_FOTOS;
    if(!lista&&!cargando)cargarExtra();
    return `${intro}${nueva}<div class="card"><p style="margin-top:0">Entraste como <b>${esc(c.email||'tu cuenta')}</b></p>
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
    // mostrar u ocultar la contraseña
    if(t.dataset.verClave){const i=document.getElementById(t.dataset.verClave);if(!i)return true;const ver=i.type==='password';
      i.type=ver?'text':'password';t.textContent=ver?'🙈':'👁️';t.setAttribute('aria-pressed',String(ver));t.setAttribute('aria-label',ver?'Ocultar contraseña':'Mostrar contraseña');return true}
    if(t.dataset.ctaModo){leerCorreo();modo=t.dataset.ctaModo;avisoCta=null;codigoPara=null;repintar();return true}
    const mal=texto=>{avisoCta={ok:false,texto};repintar();return true};
    const con=async f=>{t.disabled=true;try{return await f()}finally{t.disabled=false}};
    if(t.id==='cta-entrar'||t.id==='cta-crear'){const email=leerCorreo(),clave=document.getElementById('cta-clave')?.value||'';
      if(!correoValido(email))return mal('Escribe un correo válido.');
      if(clave.length<MIN_CLAVE)return mal(`La contraseña necesita al menos ${MIN_CLAVE} caracteres.`);
      const r=await con(()=>t.id==='cta-entrar'?entrar(email,clave):crearCuenta(email,clave));
      if(!r.ok)return mal(mensajeError(r));
      if(r.confirmar){modo='entrar';avisoCta={ok:true,texto:`📬 Te enviamos un correo a <b>${esc(email)}</b> para confirmar tu cuenta. Ábrelo <b>en este dispositivo</b> y entrarás solo (o vuelve aquí y toca «Entrar»).`};repintar();return true}
      await yaDentro(repintar);return true}
    if(t.id==='cta-recuperar'){const email=leerCorreo();if(!correoValido(email))return mal('Escribe un correo válido.');
      const r=await con(()=>recuperar(email));
      avisoCta=r.ok?{ok:true,texto:`📬 Si <b>${esc(email)}</b> tiene cuenta, te llegará un enlace para elegir una contraseña nueva. Ábrelo en este dispositivo.`}:{ok:false,texto:mensajeError(r)};
      repintar();return true}
    if(t.id==='cta-enviar-codigo'||t.id==='cta-otro-codigo'){const email=leerCorreo();if(!correoValido(email))return mal('Escribe un correo válido.');
      const r=await con(()=>enviarCodigo(email));
      if(r.ok){codigoPara=email;avisoCta={ok:true,texto:'📬 Revisa tu correo (y la carpeta de spam). El código vence en una hora.'}}
      else avisoCta={ok:false,texto:mensajeError(r)};
      repintar();return true}
    if(t.id==='cta-verificar'){const cod=(document.getElementById('cta-codigo')?.value||'').replace(/\D/g,'');
      if(cod.length<6)return mal('Escribe los 6 dígitos del código.');
      const r=await con(()=>verificarCodigo(codigoPara,cod));
      if(!r.ok)return mal(mensajeError(r));
      await yaDentro(repintar);return true}
    if(t.id==='cta-guardar-clave'){const clave=document.getElementById('cta-nueva')?.value||'';
      if(clave.length<MIN_CLAVE){aviso(`La contraseña necesita al menos ${MIN_CLAVE} caracteres.`);return true}
      const r=await con(()=>cambiarContrasena(clave));
      aviso(r.ok?'✓ Contraseña guardada: úsala para entrar en tus otros dispositivos.':mensajeError(r),4000);repintar();return true}
    if(t.id==='cta-omitir-clave'){omitirNuevaContrasena();repintar();return true}
    if(t.id==='cta-google'){location.href=urlGoogle();return true}
    if(t.id==='cta-sinc'){t.disabled=true;const r=await sincronizarAhora();lista=null;
      aviso(r.ok?'✓ Sincronizado':r.error==='red'?'📴 Sin conexión: se enviará luego':r.error==='ocupado'?'Ya se está sincronizando…':'No se pudo sincronizar: se reintentará',3000);
      if(r.primera)await mostrarPrimera(r.primera);repintar();return true}
    if(t.id==='cta-salir'){
      const v=await elegir({titulo:'¿Cerrar sesión?',texto:'<p>Lo que está en la nube no cambia. ¿Qué hacemos con los datos de este dispositivo?</p>',
        opciones:[{valor:'conservar',texto:'Cerrar sesión y conservar mis datos aquí'},{valor:'borrar',texto:'Cerrar sesión y borrar los datos de este dispositivo',clase:'ghost'}]});
      if(!v)return true;
      if(v==='borrar'&&!(await confirmar({titulo:'¿Borrar los datos de este dispositivo?',texto:'Se borran progreso, notas y fotos de aquí. En la nube siguen y vuelven al entrar otra vez.',si:'Sí, borrar de aquí',peligro:true})))return true;
      await cerrarSesion({borrarLocal:v==='borrar'});lista=uso=null;avisoCta=null;modo='entrar';aviso('Sesión cerrada');
      if(v==='borrar'){location.reload();return true}
      repintar();return true}
    if(t.id==='cta-borrar'){
      if(!(await confirmar({titulo:'¿Borrar tu cuenta?',texto:'Se borran <b>para siempre</b> tu cuenta y todo lo que está en la nube (progreso, notas y fotos). Lo de este dispositivo se queda. No se puede deshacer.',si:'Sí, borrar mi cuenta',peligro:true})))return true;
      t.disabled=true;const r=await borrarCuenta();t.disabled=false;
      aviso(r.ok?'Tu cuenta y tus datos de la nube se borraron.':'No se pudo borrar la cuenta: revisa tu conexión e inténtalo otra vez.',4000);lista=uso=null;repintar();return true}
  }
};
