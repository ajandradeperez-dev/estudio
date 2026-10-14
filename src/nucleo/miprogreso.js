/* Pestaña Perfil: resumen de tu progreso (racha, XP, actividad, por materia), meta diaria, ajustes
   (tema, sonidos, vibración), Mis notas, la clave de IA y reiniciar. */
import {materias,rutaMateria} from './materias.js';
import {progreso,datosMateria,racha,estadoHoy,pendientes,cambiarMeta,reiniciarProgreso,hoy,sumarDias,METAS,minutosHablados} from './progreso.js';
import {htmlNivel} from './portada.js';
import {barra,boton,confirmar} from './ui.js';
import {ajustes,cambiarAjuste} from './ajustes.js';
import {htmlRespaldo,clicRespaldo,activarImportar} from './notas.js';
import {usuario} from './usuario.js';
import {instalada,puedeInstalar,instalar,esIOS,invitar,mostrarQR,activarRecordatorio,soporteNotificaciones} from './app.js';
import {APK_URL,APP_NOMBRE} from '../config.js';
import {esc} from '../utilidades.js';
const fila=({go,id,href,icono,titulo,desc})=>`${href?`<a class="tarjeta-nav" href="${href}" rel="noopener"`:`<button class="tarjeta-nav"${go!==undefined?` data-go="${go}"`:''}${id?` id="${id}"`:''}`}><span class="icono" aria-hidden="true">${icono}</span><span class="texto"><span class="titulo">${titulo}</span><span class="desc">${desc}</span></span>${href?'</a>':'</button>'}`;

const est=(v,k)=>`<div class="estadistica"><b>${v}</b><span>${k}</span></div>`;
const segmentos=(id,ops,actual)=>`<span class="segmentos" role="group">${ops.map(([v,t])=>`<button type="button" data-${id}="${v}" aria-pressed="${String(actual)===String(v)}">${t}</button>`).join('')}</span>`;

export const perfil={
  titulo:'Perfil',
  vista(){
    const p=progreso(),h=estadoHoy(p),r=racha(p),a=ajustes(),hoyN=pendientes(p).length;
    const xpTotal=materias.reduce((s,m)=>s+datosMateria(p,m.id).xp,0),mh=minutosHablados(p);
    const dominadas=materias.reduce((s,m)=>s+Object.values(datosMateria(p,m.id).lecciones).filter(x=>x?.dominada).length,0);
    // Últimas 4 semanas: dorado = meta cumplida, borde = practicó sin cumplirla
    const dias=Array.from({length:28},(_,i)=>sumarDias(hoy(),i-27)).map(f=>{const d=p.dias[f];
      const e=d?.ok?'ok':d&&(d.ej||d.seg>=60)?'algo':'';
      return `<span class="dia ${e}" title="${f}${d?` · ${d.ej} ejercicios · ${Math.floor(d.seg/60)} min · ${d.xp} XP`:''}"></span>`}).join('');
    const u=usuario(),rec=u.recordatorio;
    return `<h1>👤 ${u.nombre?esc(u.nombre):'Perfil'}</h1>
<div class="prog-grid">${est(`🔥 ${r}`,`Racha (mejor ${Math.max(r,p.mejorRacha)})`)}${est(`⚡ ${xpTotal}`,'XP total')}${est(`👑 ${dominadas}`,'Dominadas')}${est(`🎙️ ${mh.semana}`,'Min. hablados (7 días)')}</div>

<h2>Meta de hoy</h2>
<div class="card"><p class="nota" style="margin-bottom:8px">${h.hecho} de ${h.meta} ${h.tipo==='minutos'?'minutos':'ejercicios'}${h.ok?' · ✅ cumplida':''}</p>${barra(h.hecho,h.meta)}
<div class="tabs" style="margin-top:14px">${METAS.map(([t,c])=>`<button data-meta="${t}:${c}" aria-pressed="${p.meta.tipo===t&&p.meta.cantidad===c}">${c} ${t==='minutos'?'min':'ejercicios'}</button>`).join('')}</div>
<p class="nota" style="margin:0">La racha cuenta los días seguidos con la meta cumplida. Sesiones cortas de 5–10 minutos rinden más que una larga.</p></div>

<h2>Últimas 4 semanas</h2>
<div class="card"><div class="dias" role="img" aria-label="Actividad de los últimos 28 días">${dias}</div>
<p class="nota" style="margin:8px 0 0"><span class="dia ok"></span> meta cumplida · <span class="dia algo"></span> practicaste</p></div>

<h2>Por materia</h2>
${materias.map(m=>{const d=datosMateria(p,m.id);
  return `<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${m.icono||''} ${m.nombre}</h3>${boton({texto:'Abrir',go:rutaMateria(m),clase:'ghost btn-chico'})}</div>
<div style="margin-top:10px">${htmlNivel(d.xp)}</div></div>`}).join('')}

<h2>Ajustes</h2>
<div class="card">
<div class="ajuste"><span>🌗 Tema</span>${segmentos('tema',[['auto','Auto'],['light','Claro'],['dark','Oscuro']],a.tema)}</div>
<div class="ajuste"><span>🔊 Sonidos</span>${segmentos('sonido',[[true,'Sí'],[false,'No']],a.sonido)}</div>
<div class="ajuste"><span>📳 Vibración</span>${segmentos('vibracion',[[true,'Sí'],[false,'No']],a.vibracion)}</div>
<div class="ajuste"><span>🔔 Recordatorio diario</span>${segmentos('recordatorio',[[true,'Sí'],[false,'No']],rec.activo)}</div>
${rec.activo?`<div class="ajuste"><label for="rec-hora">⏰ A qué hora</label><input type="time" id="rec-hora" class="hora" value="${esc(rec.hora)}"></div>`:''}
<p class="nota" style="margin:8px 0 0">${soporteNotificaciones()?'Si a esa hora no cumpliste tu meta, te avisamos para no perder la racha. Con la app cerrada, el teléfono decide el momento exacto (puede llegar un poco después).':'Este navegador no permite notificaciones.'}</p>
</div>

<h2>✨ Inteligencia artificial (opcional)</h2>
<div class="card"><p style="margin-top:0"><b>Cada persona usa su propia clave de Anthropic.</b> Tu clave se guarda solo en este teléfono: no se sube a ningún lado, no va en los respaldos y nunca se comparte con quien instale la app. Si invitas a amigos, cada quien pone la suya (o usa la app sin IA: todo lo demás funciona igual).</p>
<button class="btn ghost ancho" data-go="estudio/ingles/hablar/ia">✨ Configurar mi clave</button></div>

<h2>📲 La app</h2>
<div class="lista-nav">
${instalada()?'':fila({id:'perfil-instalar',icono:'📲',titulo:'Instalar app',desc:esIOS()?'En iPhone: Compartir → Agregar a inicio':puedeInstalar()?'Ábrela como app, sin barra del navegador':'Cómo agregarla a tu pantalla de inicio'})}
${esIOS()?'':fila({href:APK_URL,icono:'🤖',titulo:'Descargar app para Android',desc:`El APK de ${APP_NOMBRE} (se actualiza sola con cada versión)`})}
${fila({id:'perfil-invitar',icono:'🤝',titulo:'Invitar amigos',desc:'Comparte el enlace por WhatsApp o donde quieras'})}
${fila({id:'perfil-qr',icono:'🔳',titulo:'Código QR',desc:'Para que lo escaneen desde otro teléfono'})}
${fila({go:'bienvenida',icono:'✏️',titulo:'Mi nombre y qué estudio',desc:u.materias.length?`${u.materias.length} ${u.materias.length===1?'materia elegida':'materias elegidas'}`:'Elige qué recomendarte primero'})}
${fila({go:'acerca',icono:'ℹ️',titulo:'Acerca de',desc:'Versión, privacidad e invitar'})}
</div>

<h2>Más</h2>
<div class="lista-nav">
<button class="tarjeta-nav" data-go="notas"><span class="icono" aria-hidden="true">📝</span><span class="texto"><span class="titulo">Mis notas</span><span class="desc">Tu cuaderno: apuntes, fotos, dibujos y tarjetas</span></span></button>
${hoyN?`<button class="tarjeta-nav" data-go="repaso"><span class="icono" aria-hidden="true">🔁</span><span class="texto"><span class="titulo">Repasar</span><span class="desc">${hoyN} para hoy</span></span></button>`:''}
</div>
<h2>💾 Tus datos</h2>${htmlRespaldo()}
<div style="margin-top:24px">${boton({texto:'Reiniciar todo el progreso',id:'preset',clase:'ghost ancho'})}</div>
<p class="nota" style="margin-top:16px;text-align:center">Todo se guarda en este navegador · versión ${__VERSION__}${navigator.serviceWorker?.controller?' · disponible sin internet':''}</p>`;
  },
  alMostrar(){activarImportar(()=>document.dispatchEvent(new Event('repintar')));
    const h=document.getElementById('rec-hora');h?.addEventListener('change',()=>{if(h.value)activarRecordatorio(true,h.value)})},
  async alClic(t,ir,repintar){
    if(await clicRespaldo(t))return true;
    if(t.dataset.recordatorio){await activarRecordatorio(t.dataset.recordatorio==='true');repintar();return true}
    if(t.id==='perfil-instalar'){await instalar();repintar();return true}
    if(t.id==='perfil-invitar'){await invitar();return true}
    if(t.id==='perfil-qr'){mostrarQR();return true}
    if(t.dataset.meta){const [tipo,c]=t.dataset.meta.split(':');cambiarMeta(tipo,+c);repintar();return true}
    if(t.dataset.tema){cambiarAjuste('tema',t.dataset.tema);repintar();return true}
    if(t.dataset.sonido){cambiarAjuste('sonido',t.dataset.sonido==='true');repintar();return true}
    if(t.dataset.vibracion){cambiarAjuste('vibracion',t.dataset.vibracion==='true');repintar();return true}
    if(t.id==='preset'){
      if(await confirmar({titulo:'¿Reiniciar todo?',texto:'Se borran XP, racha, lecciones, ubicación y repasos de este navegador. Tus notas, ajustes y la clave de IA se conservan.',si:'Sí, reiniciar',no:'Cancelar',peligro:true})){reiniciarProgreso();repintar()}
      return true;
    }
  }
};
