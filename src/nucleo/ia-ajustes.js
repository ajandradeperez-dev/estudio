/* Perfil → ✨ Inteligencia artificial (ruta 'ajustes-ia'): elegir el proveedor principal (Gemini gratis, recomendado; Groq,
   OpenRouter y Mistral gratis con límites; o Claude de pago), pegar la clave propia de cada uno (solo se guarda en este
   teléfono), probarla o borrarla, y el 🔁 respaldo automático (orden y cuáles usar si el principal se satura). */
import {$,esc} from '../utilidades.js';
import {PROVEEDORES,MODELOS_CLAUDE,leerAjustes,guardarAjustes,guardarClave,borrarClave,claveOculta,probarClave,pareceClave,textoPrefijos} from './ia.js';
import {boton} from './ui.js';

let msg='',eleccion=null;
// Al probar, el mensaje dice claramente qué pasó: clave inválida, límite gratis, sin conexión u otro error
export function mensajePrueba(e,nombre){
  const c=String(e?.codigo||'');
  if(c==='401'||c==='403')return `Clave inválida: ${e.message}`;
  if(c==='429')return `Límite agotado: ${e.message}`;
  if(c==='offline'||c==='red')return `Sin conexión: no se pudo llegar a ${nombre}. Revisa tu internet y vuelve a probar.`;
  return e?.message||'No se pudo probar la clave.';
}
const enlace=(u,t)=>`<a href="${u}" target="_blank" rel="noopener"><b>${t}</b></a>`;
const GUIAS={
  gemini:`<ol class="pasos"><li>Entra a ${enlace('https://aistudio.google.com/apikey','aistudio.google.com')} con tu cuenta de Google.</li>
<li>Toca <b>Get API key</b> → <b>Create API key</b> (es gratis, sin tarjeta).</li><li>Copia la clave (empieza con <code>AIza</code> o <code>AQ.</code>) y pégala aquí.</li></ol>
<p class="nota aviso-ia">⚠️ En el plan gratuito de Gemini, Google puede usar lo que envíes para mejorar sus modelos; no envíes datos personales.</p>`,
  groq:`<ol class="pasos"><li>Entra a ${enlace('https://console.groq.com/keys','console.groq.com/keys')} y crea tu cuenta (con Google o tu correo).</li>
<li>Toca <b>Create API Key</b>, ponle un nombre (por ejemplo «Estudio») y cópiala: empieza con <code>gsk_</code>. Solo se ve una vez.</li><li>Pégala aquí. El plan gratuito (<i>Free Plan</i>) tiene límites por minuto y por día.</li></ol>
<p class="nota">Groq es muy rápido, pero sus modelos no leen fotos: con una foto, el respaldo se lo salta.</p>`,
  openrouter:`<ol class="pasos"><li>Entra a ${enlace('https://openrouter.ai','openrouter.ai')} y toca <b>Sign in</b> (con Google o tu correo).</li>
<li>Ve a ${enlace('https://openrouter.ai/settings/keys','Settings → API Keys')} → <b>Create Key</b>; deja el límite de crédito en 0 y cópiala (empieza con <code>sk-or-</code>).</li><li>Pégala aquí. La app <b>solo usa modelos gratuitos</b> (los que terminan en «:free»), que tienen un límite de peticiones por día.</li></ol>
<p class="nota aviso-ia">⚠️ Algunos modelos gratuitos de OpenRouter pueden guardar lo que envías; no envíes datos personales.</p>`,
  mistral:`<ol class="pasos"><li>Entra a ${enlace('https://console.mistral.ai','console.mistral.ai')} y crea tu cuenta.</li>
<li>Elige el plan gratuito (<i>Experiment</i>) si te lo ofrece; puede pedirte verificar un número de teléfono.</li><li>En <b>API Keys</b> → <b>Create new key</b>, cópiala (son unas 32 letras y números) y pégala aquí.</li></ol>
<p class="nota aviso-ia">⚠️ En el plan gratuito, Mistral puede usar lo que envíes para mejorar sus modelos; no envíes datos personales.</p>`,
  claude:`<ol class="pasos"><li>Entra a ${enlace('https://console.anthropic.com','console.anthropic.com')} e inicia sesión.</li>
<li>En <b>Billing</b> agrega créditos y pon un <b>límite de gasto</b> bajo (por ejemplo, 5 USD).</li><li>En <b>API Keys</b> → <b>Create Key</b>, copia la clave (empieza con <code>sk-ant-</code>) y pégala aquí.</li></ol>
<p class="nota">Costo aproximado: con Haiku, una conversación de 10 turnos cuesta menos de 1 centavo de dólar; leer una foto, unos pocos centavos.</p>`
};
const DOMINIO={gemini:'Google (generativelanguage.googleapis.com)',claude:'Anthropic (api.anthropic.com)',groq:'Groq (api.groq.com)',openrouter:'OpenRouter (openrouter.ai)',mistral:'Mistral (api.mistral.ai)'};
function htmlRespaldo(a){
  const r=a.respaldo;
  return `<div class="card" id="ia-respaldo"><h2 style="margin-top:0">🔁 Respaldo automático</h2>
<p class="nota" style="margin-top:0">Si ${PROVEEDORES[a.proveedor].nombre} se satura (límite gratis, error del servidor o sin respuesta), la app usa el siguiente de la lista que tenga clave y te lo dice con un aviso discreto.</p>
<label class="opcion-radio"><span class="ia-check"><input type="checkbox" data-resp-activo${r.activo?' checked':''}><span aria-hidden="true"></span></span> <span>Usar el respaldo automático</span></label>
<ol class="ia-orden">${r.orden.map((k,i)=>{const P=PROVEEDORES[k],princ=k===a.proveedor;
    return `<li class="ia-orden-fila"><label class="opcion-radio"><span class="ia-check"><input type="checkbox" data-resp-usar="${k}"${princ||r.usar[k]?' checked':''}${princ?' disabled':''}><span aria-hidden="true"></span></span> <span><b>${P.nombre}</b> · ${princ?'principal':a.claves[k]?'✓ con clave':'sin clave'}${k==='claude'?' · de pago':''}${P.vision===null?' · sin fotos':''}</span></label>
<span class="row"><button type="button" class="btn-icono" data-resp-mover="${k}" data-dir="-1" aria-label="Subir ${P.nombre}"${i?'':' disabled'}>↑</button><button type="button" class="btn-icono" data-resp-mover="${k}" data-dir="1" aria-label="Bajar ${P.nombre}"${i<r.orden.length-1?'':' disabled'}>↓</button></span></li>`}).join('')}</ol></div>`;
}
export const ajustesIA={
  titulo:'Inteligencia artificial',
  vista(){
    const a=leerAjustes(),p=eleccion||a.proveedor,clave=a.claves[p],P=PROVEEDORES[p],principal=p===a.proveedor;
    return `<div class="nota-cab"><button type="button" class="btn-icono" data-go="perfil" aria-label="Volver a Perfil">←</button><span></span><span></span></div>
<h1>✨ Inteligencia artificial</h1>
<p class="intro">Opcional: sirve para conversar en inglés, explicarte un ejercicio de otra forma, crear preguntas nuevas, leer fotos de tus apuntes y generar práctica de Mis materias. Sin IA, todo lo demás funciona igual.</p>
<div class="row" role="group" aria-label="Proveedor" style="gap:8px;flex-wrap:wrap;margin:0 0 12px">${Object.entries(PROVEEDORES).map(([k,x])=>`<button class="chip-filtro" data-proveedor="${k}" aria-pressed="${p===k}">${k==='gemini'?'⭐ ':''}${x.nombre}${a.claves[k]?' ✓':''}</button>`).join('')}</div>
<div class="card"><h2 style="margin-top:0">${P.nombre} <span class="nota">· ${P.nota}${principal?' · principal':''}</span></h2>${GUIAS[p]}
<form class="ajustes-ia" id="ia-form">
<label for="ia-clave">Clave de ${P.nombre}${clave?` (guardada: ${esc(claveOculta(clave))})`:''}<input id="ia-clave" type="password" autocomplete="off" spellcheck="false" placeholder="${clave?'Deja vacío para conservar la actual':P.ejemplo}"></label>
${p==='claude'?`<fieldset class="modelos"><legend>Modelo para texto</legend>${MODELOS_CLAUDE.map(m=>`<label class="opcion-radio"><input type="radio" name="ia-modelo" value="${m.id}"${m.id===a.modelo?' checked':''}> <span><b>${m.nombre}</b> · ${m.nota}</span></label>`).join('')}</fieldset>`:''}
<div class="row" style="gap:8px;flex-wrap:wrap">${boton({texto:principal?'Guardar':'Guardar y usar como principal',id:'ia-guardar'})}${principal?'':boton({texto:'Guardar como respaldo',id:'ia-respaldo-guardar',clase:'ghost'})}${boton({texto:'Probar clave',id:'ia-probar',clase:'ghost'})}${clave?boton({texto:'Borrar clave',id:'ia-borrar',clase:'ghost'}):''}</div></form>
<p class="nota" id="ia-msg" role="status">${esc(msg)}</p></div>
${htmlRespaldo(a)}
<p class="nota">🔒 Cada clave se guarda <b>solo en este teléfono</b> y solo se envía a su proveedor (la de ${P.nombre}, a ${DOMINIO[p]}). No van en los respaldos ni en ningún repositorio. Quien use este navegador podría usarlas: bórralas si prestas el teléfono.</p>
<p class="nota">En uso: <b>${PROVEEDORES[a.proveedor].nombre}</b>${a.clave?'':' (sin clave todavía)'}.</p>`;
  },
  alEntrar(){msg='';eleccion=null},
  async alClic(t,ir,repintar){
    if(t.dataset.proveedor){eleccion=t.dataset.proveedor;msg='';repintar();return true}
    const a=leerAjustes(),p=eleccion||a.proveedor,P=PROVEEDORES[p];
    if(t.dataset.respMover){const o=[...a.respaldo.orden],i=o.indexOf(t.dataset.respMover),j=i+ +t.dataset.dir;if(j<0||j>=o.length)return true;[o[i],o[j]]=[o[j],o[i]];guardarAjustes({respaldo:{orden:o}});repintar();return true}
    if(t.id==='ia-guardar'||t.id==='ia-probar'||t.id==='ia-respaldo-guardar'){
      const v=$('#ia-clave').value.trim(),modelo=document.querySelector('[name=ia-modelo]:checked')?.value||a.modelo;
      if(v&&!pareceClave(p,v)){msg=`Esa no parece una clave de ${P.nombre} (${P.prefijos.length?`empieza con ${textoPrefijos(p)}`:P.ejemplo}).`;repintar();return true}
      if(!v&&!a.claves[p]){msg='Falta la clave.';repintar();return true}
      // Probar guarda la clave sin cambiar el principal; «Guardar y usar» la vuelve principal
      if(t.id==='ia-guardar'){guardarAjustes({proveedor:p,clave:v||a.claves[p],modelo});eleccion=null;msg=`✓ Guardado. La app usará ${P.nombre}.`;repintar();return true}
      guardarClave(p,v||a.claves[p]);if(p==='claude')guardarAjustes({modelo});
      if(t.id==='ia-respaldo-guardar'){const u={...a.respaldo.usar,[p]:true};guardarAjustes({respaldo:{usar:u}});msg=`✓ ${P.nombre} quedó de respaldo.`;repintar();return true}
      $('#ia-msg').textContent='Probando…';
      try{await probarClave(p);msg=`✓ La clave de ${P.nombre} funciona.`}catch(e){msg=`✗ ${mensajePrueba(e,P.nombre)}`}
      repintar();return true}
    if(t.id==='ia-borrar'){borrarClave(p);msg=`Clave de ${P.nombre} borrada de este teléfono.`;repintar();return true}
  },
  alMostrar(){
    document.getElementById('ia-respaldo')?.addEventListener('change',e=>{const x=e.target,a=leerAjustes();
      if(x.dataset.respActivo!==undefined)guardarAjustes({respaldo:{activo:x.checked}});
      if(x.dataset.respUsar)guardarAjustes({respaldo:{usar:{...a.respaldo.usar,[x.dataset.respUsar]:x.checked}}});
      const m=document.getElementById('ia-msg');if(m)m.textContent='✓ Respaldo guardado.'});
  }
};
