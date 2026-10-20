/* Perfil → ✨ Inteligencia artificial (ruta 'ajustes-ia'): elegir proveedor (Gemini gratis, recomendado; o Claude de pago),
   pegar la clave propia (solo se guarda en este teléfono), probarla o borrarla. */
import {$,esc} from '../utilidades.js';
import {PROVEEDORES,MODELOS_CLAUDE,leerAjustes,guardarAjustes,borrarClave,claveOculta,probarClave,pareceClave,textoPrefijos} from './ia.js';
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
const GUIAS={
  gemini:`<ol class="pasos"><li>Entra a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"><b>aistudio.google.com</b></a> con tu cuenta de Google.</li>
<li>Toca <b>Get API key</b> → <b>Create API key</b> (es gratis, sin tarjeta).</li><li>Copia la clave (empieza con <code>AIza</code> o <code>AQ.</code>) y pégala aquí.</li></ol>
<p class="nota aviso-ia">⚠️ En el plan gratuito de Gemini, Google puede usar lo que envíes para mejorar sus modelos; no envíes datos personales.</p>`,
  claude:`<ol class="pasos"><li>Entra a <a href="https://console.anthropic.com" target="_blank" rel="noopener"><b>console.anthropic.com</b></a> e inicia sesión.</li>
<li>En <b>Billing</b> agrega créditos y pon un <b>límite de gasto</b> bajo (por ejemplo, 5 USD).</li><li>En <b>API Keys</b> → <b>Create Key</b>, copia la clave (empieza con <code>sk-ant-</code>) y pégala aquí.</li></ol>
<p class="nota">Costo aproximado: con Haiku, una conversación de 10 turnos cuesta menos de 1 centavo de dólar; leer una foto, unos pocos centavos.</p>`
};
export const ajustesIA={
  titulo:'Inteligencia artificial',
  vista(){
    const a=leerAjustes(),p=eleccion||a.proveedor,clave=a.claves[p],P=PROVEEDORES[p];
    return `<div class="nota-cab"><button type="button" class="btn-icono" data-go="perfil" aria-label="Volver a Perfil">←</button><span></span><span></span></div>
<h1>✨ Inteligencia artificial</h1>
<p class="intro">Opcional: sirve para conversar en inglés, explicarte un ejercicio de otra forma, crear preguntas nuevas, leer fotos de tus apuntes y generar práctica de Mis materias. Sin IA, todo lo demás funciona igual.</p>
<div class="row" role="group" aria-label="Proveedor" style="gap:8px;flex-wrap:wrap;margin:0 0 12px">${Object.entries(PROVEEDORES).map(([k,x])=>`<button class="chip-filtro" data-proveedor="${k}" aria-pressed="${p===k}">${k==='gemini'?'⭐ ':''}${x.nombre}</button>`).join('')}</div>
<div class="card"><h2 style="margin-top:0">${P.nombre} <span class="nota">· ${P.nota}</span></h2>${GUIAS[p]}
<form class="ajustes-ia" id="ia-form">
<label for="ia-clave">Clave de ${P.nombre}${clave?` (guardada: ${esc(claveOculta(clave))})`:''}<input id="ia-clave" type="password" autocomplete="off" spellcheck="false" placeholder="${clave?'Deja vacío para conservar la actual':P.ejemplo}"></label>
${p==='claude'?`<fieldset class="modelos"><legend>Modelo para texto</legend>${MODELOS_CLAUDE.map(m=>`<label class="opcion-radio"><input type="radio" name="ia-modelo" value="${m.id}"${m.id===a.modelo?' checked':''}> <span><b>${m.nombre}</b> · ${m.nota}</span></label>`).join('')}</fieldset>`:''}
<div class="row" style="gap:8px;flex-wrap:wrap">${boton({texto:'Guardar y usar',id:'ia-guardar'})}${boton({texto:'Probar clave',id:'ia-probar',clase:'ghost'})}${clave?boton({texto:'Borrar clave',id:'ia-borrar',clase:'ghost'}):''}</div></form>
<p class="nota" id="ia-msg" role="status">${esc(msg)}</p></div>
<p class="nota">🔒 Tu clave se guarda <b>solo en este teléfono</b> y solo se envía a ${p==='gemini'?'Google (generativelanguage.googleapis.com)':'Anthropic (api.anthropic.com)'}. No va en los respaldos ni en ningún repositorio. Quien use este navegador podría usarla: bórrala si prestas el teléfono.</p>
<p class="nota">En uso: <b>${PROVEEDORES[a.proveedor].nombre}</b>${a.clave?'':' (sin clave todavía)'}.</p>`;
  },
  alEntrar(){msg='';eleccion=null},
  async alClic(t,ir,repintar){
    if(t.dataset.proveedor){eleccion=t.dataset.proveedor;msg='';repintar();return true}
    const a=leerAjustes(),p=eleccion||a.proveedor,P=PROVEEDORES[p];
    const leer=()=>{const v=$('#ia-clave').value.trim(),modelo=document.querySelector('[name=ia-modelo]:checked')?.value||a.modelo;return {v,modelo}};
    if(t.id==='ia-guardar'||t.id==='ia-probar'){
      const {v,modelo}=leer();
      if(v&&!pareceClave(p,v)){msg=`Esa no parece una clave de ${P.nombre} (empieza con ${textoPrefijos(p)}).`;repintar();return true}
      if(!v&&!a.claves[p]){msg='Falta la clave.';repintar();return true}
      guardarAjustes({proveedor:p,clave:v||a.claves[p],modelo});eleccion=null;
      if(t.id==='ia-guardar'){msg=`✓ Guardado. La app usará ${P.nombre}.`;repintar();return true}
      $('#ia-msg').textContent='Probando…';
      try{await probarClave();msg=`✓ La clave de ${P.nombre} funciona.`}catch(e){msg=`✗ ${mensajePrueba(e,P.nombre)}`}
      repintar();return true}
    if(t.id==='ia-borrar'){borrarClave(p);msg=`Clave de ${P.nombre} borrada de este teléfono.`;repintar();return true}
  }
};
