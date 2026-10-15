/* 🗳️ Propuestas: lista con filtros (Cursos · Temas · Libros), votos N/5, proponer algo nuevo y modo administrador
   (enlace mágico; se abre tocando 7 veces la versión en Acerca de). Rutas: propuestas · propuestas/nueva ·
   propuestas/admin · propuestas/abrir/<id> (aviso «¡Ya está lo que pediste!»). */
import {$,esc} from '../../utilidades.js';
import {cabecera,vacio,chip,barra,boton,aviso} from '../ui.js';
import {SUPABASE_URL,SUPABASE_CLAVE_PUBLICA,APP_URL} from '../../config.js';
import {crearApi} from './api.js';
import {crearPropuestas} from './estado.js';
import {TIPOS,ESTADOS,MENSAJES,VOTOS_PARA_APROBAR,MAX_VOTOS,MAX_TITULO,MAX_DESCRIPCION,votosActivos} from './logica.js';

export const api=crearApi({url:SUPABASE_URL,clave:SUPABASE_CLAVE_PUBLICA});
let estado=null;
export const propuestas=()=>estado||(estado=crearPropuestas({api}));
const msg=e=>MENSAJES[e]||'No se pudo completar. Inténtalo otra vez.';

/* ---------- sesión del administrador (solo en este teléfono) ---------- */
const ADMIN='ciberlab-admin';
const sesion=()=>{try{return JSON.parse(localStorage.getItem(ADMIN))}catch(e){return null}};
const guardarSesion=s=>{try{s?localStorage.setItem(ADMIN,JSON.stringify(s)):localStorage.removeItem(ADMIN)}catch(e){}};
// Al volver del enlace mágico: #access_token=…&refresh_token=…&expires_in=… → se guarda y se abre el modo administrador
export function recibirEnlaceMagico(hash){
  if(!/access_token=/.test(hash||''))return false;
  const q=new URLSearchParams(String(hash).replace(/^#/,''));
  guardarSesion({access_token:q.get('access_token'),refresh_token:q.get('refresh_token'),expira:Date.now()+(+q.get('expires_in')||3600)*1000});
  return true;
}
async function token(){
  const s=sesion();if(!s)return null;
  if(Date.now()<s.expira-60000)return s.access_token;
  const r=await api.renovar(s.refresh_token);
  if(!r.ok){guardarSesion(null);return null}
  guardarSesion({access_token:r.datos.access_token,refresh_token:r.datos.refresh_token,expira:Date.now()+(r.datos.expires_in||3600)*1000});
  return r.datos.access_token;
}

/* ---------- lista ---------- */
let filtro='curso',cargando=false,ultimoError=null;
const orden=p=>({votacion:0,aprobada:1,preparacion:2,disponible:3,descartada:4}[p.estado]??5);
function tarjeta(p,mios,activos){
  const e=ESTADOS[p.estado]||ESTADOS.votacion,voto=mios.includes(p.id),abierta=p.estado==='votacion';
  const btn=!abierta?'':!api.listo?'':voto?boton({texto:'✅ Votaste · Quitar voto',clase:'ghost ancho',extra:`data-quitar="${p.id}" aria-pressed="true"`})
    :boton({texto:'🗳️ Votar',clase:`area ancho${activos>=MAX_VOTOS?' ghost':''}`,extra:`data-votar="${p.id}"`});
  return `<div class="card propuesta"><div class="propuesta-cab"><span class="icono" aria-hidden="true">${TIPOS[p.tipo]?.icono||'💡'}</span><h3>${esc(p.titulo)}</h3></div>
<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0 8px">${chip(`${e.icono} ${e.texto}`,p.estado==='disponible'?'ok':'')}${chip(TIPOS[p.tipo]?.nombre||p.tipo)}</div>
${p.descripcion?`<p style="margin:0 0 8px">${esc(p.descripcion)}</p>`:''}
${abierta||p.estado==='aprobada'?`${barra(Math.min(p.votos,VOTOS_PARA_APROBAR),VOTOS_PARA_APROBAR)}<p class="nota" style="margin:4px 0 8px">${Math.min(p.votos,VOTOS_PARA_APROBAR)}/${VOTOS_PARA_APROBAR} votos${p.estado==='aprobada'?' · ¡llegó a la meta!':''}</p>`:''}
${p.respuesta?`<p class="nota">💬 ${esc(p.respuesta)}</p>`:''}${p.estado==='descartada'&&p.motivo?`<p class="nota">Motivo: ${esc(p.motivo)}</p>`:''}
${p.estado==='disponible'&&p.enlace?boton({texto:'Abrir',clase:'area ancho',go:p.enlace}):btn}</div>`;
}
function vistaLista(){
  return {
    titulo:'Propuestas',
    vista(){
      const pr=propuestas(),{lista,mios,cola,fecha}=pr.datos,activos=votosActivos(lista,mios);
      const ls=lista.filter(p=>p.tipo===filtro).sort((a,b)=>orden(a)-orden(b)||b.votos-a.votos||a.id-b.id);
      const nuevas=pr.nuevasDisponibles();
      return `<div class="area-votos">${cabecera({icono:'🗳️',titulo:'Propuestas',desc:'Vota qué curso, tema o libro sigue en la app. Con 5 votos, se aprueba.'})}
${nuevas.map(p=>`<div class="card destacado-ok"><b>🎉 ¡Ya está lo que pediste!</b> ${esc(p.titulo)} ${boton({texto:'Abrir',clase:'area',go:`propuestas/abrir/${p.id}`})}</div>`).join('')}
${!api.listo?`<p class="nota card">🛠️ ${MENSAJES.sin_servidor} Mientras tanto, estas son las propuestas iniciales.</p>`
  :`<p class="nota">Tienes <b>${MAX_VOTOS-activos} de ${MAX_VOTOS}</b> votos disponibles. Puedes quitar un voto y moverlo a otra propuesta.${cola.length?` · ⏳ ${cola.length} pendiente${cola.length===1?'':'s'} de enviar.`:''}${ultimoError?` · ${esc(msg(ultimoError))}`:''}${fecha&&ultimoError==='red'?` (último estado: ${new Date(fecha).toLocaleString('es')})`:''}</p>`}
<div class="row" role="group" aria-label="Filtrar por tipo" style="gap:8px;flex-wrap:wrap;margin:0 0 12px">${Object.entries(TIPOS).map(([k,t])=>`<button class="chip-filtro" data-ptipo="${k}" aria-pressed="${filtro===k}">${t.icono} ${t.filtro}</button>`).join('')}</div>
${ls.length?ls.map(p=>tarjeta(p,mios,activos)).join(''):vacio({icono:TIPOS[filtro].icono,titulo:`Aún no hay ${TIPOS[filtro].filtro.toLowerCase()} en votación`,texto:filtro==='libro'?'Propón el título de un libro que quieras estudiar con la app.':'Propón el primero.'})}
${api.listo?boton({texto:'➕ Proponer algo nuevo',go:'propuestas/nueva',clase:'ghost ancho'}):''}
<p class="nota" style="margin-top:16px">🔒 Para votar se envía un identificador anónimo de este dispositivo y tus votos o propuestas; nada más. Tu progreso y tus notas siguen solo en tu teléfono.</p></div>`;
    },
    async alEntrar(){
      if(!api.listo||cargando)return;cargando=true;
      const r=await propuestas().cargar();cargando=false;ultimoError=r.ok?null:r.error;
      document.dispatchEvent(new Event('repintar'));
    },
    async alClic(t,ir,repintar){
      if(t.dataset.ptipo){filtro=t.dataset.ptipo;repintar();return true}
      if(t.dataset.votar||t.dataset.quitar){
        const id=+(t.dataset.votar||t.dataset.quitar);t.disabled=true;
        const r=t.dataset.votar?await propuestas().votar(id):await propuestas().quitar(id);
        if(!r.ok)aviso(msg(r.error),4000);else if(r.enCola)aviso(MENSAJES.red);else if(r.aprobada)aviso('🎉 ¡Con tu voto llegó a 5! Queda aprobada.');
        repintar();return true}
    }
  };
}

/* ---------- proponer ---------- */
function vistaNueva(){
  return {
    titulo:'Proponer',
    vista:()=>`<div class="area-votos">${cabecera({icono:'💡',titulo:'Proponer algo nuevo',desc:'Un curso, un tema o un libro. Se publica cuando el administrador lo revisa.'})}
<form class="card" id="prop-form">
<label for="prop-tipo">Tipo<select id="prop-tipo">${Object.entries(TIPOS).map(([k,t])=>`<option value="${k}"${k===filtro?' selected':''}>${t.icono} ${t.nombre}</option>`).join('')}</select></label>
<label for="prop-titulo">Título <span class="nota" id="prop-ct">0/${MAX_TITULO}</span><input id="prop-titulo" maxlength="${MAX_TITULO}" autocomplete="off" required></label>
<label for="prop-desc">Descripción corta <span class="nota" id="prop-cd">0/${MAX_DESCRIPCION}</span><textarea id="prop-desc" maxlength="${MAX_DESCRIPCION}" rows="4"></textarea></label>
<p class="nota">Puedes enviar 2 propuestas por semana. Se revisan antes de publicarse para evitar spam o contenido ofensivo.</p>
<p class="nota" id="prop-error" aria-live="polite"></p>
${boton({texto:'Enviar propuesta',id:'prop-enviar',clase:'area ancho'})}</form></div>`,
    alMostrar(){
      const c=(i,o,max)=>$(i).addEventListener('input',()=>{$(o).textContent=`${$(i).value.length}/${max}`});
      c('#prop-titulo','#prop-ct',MAX_TITULO);c('#prop-desc','#prop-cd',MAX_DESCRIPCION);
    },
    async alClic(t,ir){
      if(t.id!=='prop-enviar')return;
      t.disabled=true;
      const r=await propuestas().proponer({tipo:$('#prop-tipo').value,titulo:$('#prop-titulo').value,descripcion:$('#prop-desc').value});
      if(!r.ok){$('#prop-error').textContent=msg(r.error);t.disabled=false;return true}
      aviso(r.enCola?'⏳ Se enviará cuando vuelva el internet.':'✅ ¡Gracias! Tu propuesta se publicará cuando se revise.',4000);ir('propuestas');return true;
    }
  };
}

/* ---------- administrador ---------- */
let adm={lista:null,error:null};
function vistaAdmin(){
  return {
    titulo:'Administrar propuestas',
    vista(){
      const s=sesion();
      if(!api.listo)return `<div class="area-votos">${cabecera({icono:'🔐',titulo:'Administrar',desc:MENSAJES.sin_servidor})}</div>`;
      if(!s)return `<div class="area-votos">${cabecera({icono:'🔐',titulo:'Administrar propuestas',desc:'Inicia sesión con tu correo: te llega un enlace mágico.'})}
<div class="card"><label for="adm-email">Correo<input id="adm-email" type="email" autocomplete="email" inputmode="email"></label>
${boton({texto:'Enviarme el enlace',id:'adm-enlace',clase:'area ancho'})}<p class="nota" id="adm-msg" aria-live="polite"></p></div></div>`;
      const l=adm.lista;
      if(!l)return `<div class="area-votos">${cabecera({icono:'🔐',titulo:'Administrar propuestas'})}<p class="nota">${adm.error?esc(adm.error):'Cargando…'}</p>${boton({texto:'Cerrar sesión',id:'adm-salir',clase:'ghost ancho'})}</div>`;
      const pend=l.filter(p=>p.estado==='pendiente'),aprob=l.filter(p=>p.estado==='aprobada');
      const fila=p=>`<div class="card"><h3 style="margin-top:0">${TIPOS[p.tipo]?.icono||''} ${esc(p.titulo)}</h3><p>${esc(p.descripcion||'')}</p>
<div class="xl-controles"><label for="adm-e-${p.id}">Estado<select id="adm-e-${p.id}">${Object.entries(ESTADOS).map(([k,e])=>`<option value="${k}"${k===p.estado?' selected':''}>${e.icono} ${e.texto}</option>`).join('')}</select></label>
<label for="adm-r-${p.id}">Respuesta<input id="adm-r-${p.id}" maxlength="280" value="${esc(p.respuesta||'')}" placeholder="Lo empiezo esta semana"></label>
<label for="adm-m-${p.id}">Motivo (si se descarta)<input id="adm-m-${p.id}" maxlength="280" value="${esc(p.motivo||'')}"></label>
<label for="adm-l-${p.id}">Enlace en la app<input id="adm-l-${p.id}" maxlength="120" value="${esc(p.enlace||'')}" placeholder="cursos/python"></label></div>
<div class="row" style="gap:8px;flex-wrap:wrap">${p.estado==='pendiente'?boton({texto:'✅ Publicar',clase:'area',extra:`data-adm-estado="votacion" data-id="${p.id}"`})+boton({texto:'⛔ Rechazar',clase:'ghost',extra:`data-adm-estado="rechazada" data-id="${p.id}"`}):''}${boton({texto:'💾 Guardar',clase:'ghost',extra:`data-adm-guardar="${p.id}"`})}</div></div>`;
      return `<div class="area-votos">${cabecera({icono:'🔐',titulo:'Administrar propuestas',desc:`${pend.length} pendiente${pend.length===1?'':'s'} de revisión · ${aprob.length} aprobada${aprob.length===1?'':'s'} por preparar`})}
${[...pend,...aprob,...l.filter(p=>p.estado!=='pendiente'&&p.estado!=='aprobada')].map(fila).join('')}
${boton({texto:'Cerrar sesión',id:'adm-salir',clase:'ghost ancho'})}</div>`;
    },
    async alEntrar(){
      if(!api.listo||!sesion())return;
      const tk=await token();if(!tk){adm={lista:null,error:'La sesión venció: vuelve a pedir el enlace.'};document.dispatchEvent(new Event('repintar'));return}
      const ad=await api.esAdmin(tk);
      if(!ad.ok||ad.datos!==true){adm={lista:null,error:'Tu cuenta no es administradora. Agrégala en la tabla admins (ver CLAUDE.md).'}}
      else{const r=await api.todas(tk);adm=r.ok?{lista:r.datos,error:null}:{lista:null,error:msg(r.error)}}
      document.dispatchEvent(new Event('repintar'));
    },
    async alClic(t,ir,repintar){
      if(t.id==='adm-enlace'){const email=$('#adm-email').value.trim();if(!/^\S+@\S+\.\S+$/.test(email)){$('#adm-msg').textContent='Escribe un correo válido.';return true}
        t.disabled=true;const r=await api.enviarEnlace(email,APP_URL);$('#adm-msg').textContent=r.ok?'📬 Revisa tu correo y abre el enlace en este teléfono.':msg(r.error);t.disabled=false;return true}
      if(t.id==='adm-salir'){guardarSesion(null);adm={lista:null,error:null};repintar();return true}
      const id=t.dataset.id||t.dataset.admGuardar;
      if(id){const tk=await token();if(!tk){aviso('La sesión venció.');return true}
        const campos=t.dataset.admEstado?{estado:t.dataset.admEstado}:{estado:$(`#adm-e-${id}`).value,respuesta:$(`#adm-r-${id}`).value.trim()||null,motivo:$(`#adm-m-${id}`).value.trim()||null,enlace:$(`#adm-l-${id}`).value.trim()||null};
        const r=await api.actualizar(tk,id,campos);aviso(r.ok?'✅ Guardado':msg(r.error));
        if(r.ok){const p=adm.lista.find(x=>x.id===+id);Object.assign(p,campos)}repintar();return true}
    }
  };
}

/* ---------- abrir lo que pediste (marca el aviso como visto) ---------- */
function vistaAbrir(id){
  return {titulo:'Abriendo',vista:()=>'<p class="nota">Abriendo…</p>',
    // la primera vez abre lo que pediste; si se vuelve aquí con Atrás (ya visto), regresa a Aprender en vez de reabrirlo
    alMostrar(){const pr=propuestas(),p=pr.datos.lista.find(x=>x.id===+id),ya=!pr.nuevasDisponibles().some(x=>x.id===+id);pr.marcarVisto(+id);
      setTimeout(()=>location.replace('#'+(ya?'':p?.enlace||'propuestas')),0)}};
}

export function vistaPropuestas(resto=[]){
  if(resto[0]==='nueva')return vistaNueva();
  if(resto[0]==='admin')return vistaAdmin();
  if(resto[0]==='abrir')return vistaAbrir(resto[1]);
  return vistaLista();
}
// Para la portada: tarjeta «¡Ya está lo que pediste!» (con el último estado guardado, sin esperar a la red)
export function htmlAvisoPropuestas(){
  const n=propuestas().nuevasDisponibles();
  return n.map(p=>`<div class="card destacado-ok"><b>🎉 ¡Ya está lo que pediste!</b> ${esc(p.titulo)} ${boton({texto:'Abrir',clase:'area',go:`propuestas/abrir/${p.id}`})}</div>`).join('');
}
// Al abrir la app y al volver la red: envía votos pendientes y trae novedades (sin bloquear nada)
export async function sincronizarPropuestas(){if(api.listo){try{await propuestas().cargar()}catch(e){}}}
