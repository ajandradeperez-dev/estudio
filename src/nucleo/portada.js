/* Pestaña Aprender: portada (áreas), página de área (materias), página de materia (temas o lecciones),
   camino de un tema (nodos en zigzag), migas de pan con botón atrás y barra superior (racha y meta del día) */
import {htmlAvisoPropuestas} from './propuestas/vistas.js';
import {APP_NOMBRE,APP_MARCA} from '../config.js';
import {usuario} from './usuario.js';
import {htmlMiasPortada} from './mias/vistas.js';
import {esc} from '../utilidades.js';
import {areas,analizar,areaDe,rutaMateria,rutaTema,rutaLeccion} from './materias.js';
import {progreso,datosMateria,nivel,racha,estadoHoy} from './progreso.js';
import {barra,chip,tarjetaNav,cabecera,boton,confirmar,puntos} from './ui.js';
import {estadosTema,cofresTema,cofreAbierto,jefeAbierto,jefeVencido} from './camino.js';
import {nivelDe,estadoDominio,ULTIMAS} from './metodo.js';
import {recomendar} from './recomendador.js';
import {repartoUbicacion} from './metodo.js';
import {estadoTema,ESTADO,cobertura,textoCobertura,estadoMateria} from './contenido.js';
import {resultadoFinal,APROBAR} from './examen.js';
import {retosDe} from './retos.js';

const secciones=m=>Object.entries(m.secciones||{});
const dominada=(d,l)=>!!d.lecciones[l.id]?.dominada;
const conteo=(d,ls)=>({hechas:ls.filter(l=>dominada(d,l)).length,total:ls.length});
const tonoDe=a=>a.tono||a.id;
// Tiempo estimado para dominar lo que falta: ~20 min por habilidad nueva (2–3 sesiones de 8) y ~10 si ya se empezó
const minutosHab=(d,l)=>{const h=d.lecciones[l.id];return h?.dominada?0:h?.intentos?10:20};
const minutosTema=(d,t)=>t.lecciones.reduce((s,l)=>s+minutosHab(d,l),0);
const textoMin=m=>m<60?`${m} min`:`${Math.floor(m/60)} h${m%60?` ${m%60} min`:''}`;
// Tema en curso: el primero con habilidades sin dominar; el que sigue después de uno dado
const temaEnCurso=(m,d)=>(m.temas||[]).find(t=>t.lecciones.length&&t.lecciones.some(l=>!dominada(d,l)));
const temaSiguiente=(m,d,t)=>{const ts=(m.temas||[]).filter(x=>x.lecciones.length),i=ts.indexOf(t);return ts.slice(i+1).find(x=>x.lecciones.some(l=>!dominada(d,l)))||ts.find(x=>x!==t&&x.lecciones.some(l=>!dominada(d,l)))};

export function htmlNivel(xp){
  const n=nivel(xp);
  return `<div class="row" style="gap:8px;margin-bottom:8px">${chip(`Nivel ${n.nivel}`,'area')}<span class="nota">${xp} XP · faltan ${n.hasta-xp} para el ${n.nivel+1}</span></div>${barra(xp-n.desde,n.hasta-n.desde)}`;
}

/* ---------- barra superior ---------- */
export function htmlBarraSup(){
  const p=progreso(),h=estadoHoy(p),r=racha(p);
  return `<button class="marca enlace" data-go="" aria-label="${APP_NOMBRE}, ir a Aprender">${APP_MARCA[0]}<span>${APP_MARCA[1]||''}</span></button>
<span class="sup-chip fuego" title="Racha: días seguidos cumpliendo la meta">🔥 ${r}<span class="oculto"> ${r===1?'día':'días'} de racha</span></span>
<span class="sup-chip meta" title="Meta de hoy: ${h.hecho} de ${h.meta} ${h.tipo==='minutos'?'minutos':'ejercicios'}">${h.ok?'✅':'🎯'} ${barra(h.hecho,h.meta)}<span class="oculto">Meta de hoy ${h.hecho} de ${h.meta}</span></span>`;
}

/* ---------- migas de pan y botón atrás ---------- */
function niveles(c){
  const n=[{ruta:'',txt:'Aprender'}];
  if(c.tipo==='portada')return {n:[],actual:''};
  if(c.tipo==='propuestas')return {n,actual:c.resto?.length?'':'🗳️ Propuestas'};
  if(c.tipo==='especial'||c.tipo==='notas'||c.tipo==='mias')return {n:[],actual:''}; // el cuaderno pone su propio botón ←
  const a=c.area;
  if(c.tipo==='area')return {n,actual:`${a.icono||''} ${a.nombre}`};
  const m=c.m,colapsa=rutaMateria(m)===m.id&&a.id===m.id;
  if(!colapsa)n.push({ruta:a.id,txt:`${a.icono||''} ${a.nombre}`});
  if(c.tipo==='materia')return {n,actual:m.nombre};
  n.push({ruta:rutaMateria(m),txt:m.nombre});
  if(c.tipo==='tema')return {n,actual:`${c.t.icono} ${c.t.titulo}`};
  if(c.tipo==='leccion'){if(c.t)n.push({ruta:rutaTema(m,c.t),txt:`${c.t.icono} ${c.t.titulo}`});return {n,actual:c.l.titulo}}
  if(c.tipo==='cofre'||c.tipo==='jefe'){n.push({ruta:rutaTema(m,c.t),txt:`${c.t.icono} ${c.t.titulo}`});return {n,actual:c.tipo==='cofre'?'🎁 Cofre':'🏆 Jefe'}}
  if(c.tipo==='ubicacion')return {n,actual:'Examen de ubicación'};
  if(c.tipo==='examen-final')return {n,actual:'🎓 Examen final'};
  if(c.tipo==='certificado'){n.push({ruta:`${rutaMateria(m)}/examen-final`,txt:'🎓 Examen final'});return {n,actual:'🏅 Certificado'}}
  if(c.tipo==='retos'){if(c.t)n.push({ruta:rutaTema(m,c.t),txt:`${c.t.icono} ${c.t.titulo}`});return {n,actual:'🎯 Retos'}}
  // Sección: el título solo si es su portada; dentro, la sección pone sus propias migas
  const s=m.secciones[c.seccion];
  return {n,actual:c.resto?.length?'':s.titulo};
}
// Pantalla "de arriba" (la del botón ←): la usa Atrás cuando no hay pantalla anterior (p. ej. al abrir un enlace directo)
export function rutaPadre(c){const {n}=niveles(c);return n.length?n[n.length-1].ruta:''}
export function htmlMigas(c){
  const {n,actual}=niveles(c);
  if(!n.length)return '';
  const atras=n[n.length-1];
  return `<nav class="migas" aria-label="Ruta"><button class="btn-icono atras" data-go="${esc(atras.ruta)}" aria-label="Volver a ${esc(atras.txt.trim())}">←</button>
<ol>${n.map(x=>`<li><button class="enlace" data-go="${esc(x.ruta)}">${x.txt}</button></li>`).join('')}${actual?`<li aria-current="page">${actual}</li>`:''}</ol></nav>`;
}

/* ---------- "continuar donde te quedaste" ---------- */
function continuar(p){
  const u=p.ultimo; if(!u)return null;
  const x=analizar(u.ruta),m=x.m; if(!m)return null;
  if(x.tipo==='leccion'){
    const l=x.l,h=datosMateria(p,m.id).lecciones[l.id],e=estadoDominio(h||{});
    const det=h?.dominada?'Dominada':h?`Dominio ${e.ok}/${ULTIMAS}`:'Sin empezar';
    return {ruta:x.ruta,titulo:l.titulo,detalle:`${m.nombre} · ${det}`};
  }
  if(x.tipo!=='seccion')return null;
  const s=m.secciones[x.seccion];
  return {ruta:x.ruta,titulo:s.titulo,detalle:m.nombre};
}
const htmlSiguiente=r=>`<button class="siguiente-para-ti" data-go="${esc(r.ruta)}"><span class="sup-k">👉 Lo siguiente para ti</span><span class="siguiente-titulo">${esc(r.titulo)}</span><span class="nota">${esc(r.porque)}</span><span class="btn">Empezar</span></button>`;

function resumenArea(a,p){
  let hechas=0,total=0;
  for(const m of a.materias){const c=conteo(datosMateria(p,m.id),m.lecciones||[]);hechas+=c.hechas;total+=c.total}
  return {hechas,total};
}

/* ---------- Aprender: lo siguiente, continuar y las áreas ---------- */
export const portada={
  titulo:'Aprender',
  vista(){
    const p=progreso(),r=recomendar({},p),c0=continuar(p),c=c0&&c0.ruta!==r.ruta?c0:null;
    const nombre=usuario().nombre;
    return `${nombre?`<p class="saludo">Hola, ${esc(nombre)} 👋</p>`:''}${htmlAvisoPropuestas()}${htmlMiasPortada()}${htmlSiguiente(r)}
${c?`<div class="card continuar"><div><div class="sup-k">Continuar</div><h3>${esc(c.titulo)}</h3><span class="nota">${esc(c.detalle)}</span></div>${boton({texto:'Seguir',go:c.ruta,clase:'ghost'})}</div>`:''}
<h2>¿Qué quieres aprender?</h2>
<div class="lista-nav">${areas.map(a=>{const x=resumenArea(a,p);
  return tarjetaNav({go:a.id,icono:a.icono,titulo:a.nombre,clase:`area area-${tonoDe(a)}`,
    desc:a.materias.length>1?a.materias.map(m=>m.nombre).join(' · '):a.descripcion,
    pie:x.total?`${barra(x.hechas,x.total)}<span class="nota">${x.hechas}/${x.total} dominadas</span>`:''})}).join('')}
${tarjetaNav({go:'propuestas',icono:'🗳️',titulo:'Propuestas',clase:'area area-votos',desc:'Vota qué curso, tema o libro sigue en la app.'})}</div>`;
  }
};

/* ---------- página de un área: sus materias ---------- */
export function vistaArea(a){
  return {
    titulo:a.nombre,
    vista(){
      const p=progreso();
      return `<div class="area-${tonoDe(a)}">${cabecera({icono:a.icono,titulo:a.nombre,desc:a.descripcion})}
<div class="lista-nav">${a.materias.map(m=>{const d=datosMateria(p,m.id),{hechas,total}=conteo(d,m.lecciones||[]);
  return tarjetaNav({go:rutaMateria(m),icono:m.icono||m.sigla,titulo:m.nombre,desc:m.descripcion,clase:`${m.proximo?'proximo':''} ${m.tono?`area-${m.tono}`:''}`,pie:m.proximo?chip('⚪ Próximamente'):total?`${barra(hechas,total)}<span class="nota">${hechas}/${total} dominadas · ${d.xp} XP</span>`:''})}).join('')}
${a.id==='cursos'?tarjetaNav({go:'propuestas',icono:'⚪',titulo:'Próximamente…',clase:'proximo',desc:'Los cursos que ganen en 🗳️ Propuestas. Vota el que quieres.'}):''}</div></div>`;
    }
  };
}

/* ---------- página de una materia: lo siguiente, temas (o lecciones) y herramientas ---------- */
export function vistaMateria(m){
  // Materia con su propia página (p. ej. 📚 Lectura: la biblioteca)
  if(m.vistaPropia)return m.vistaPropia(m);
  const tono=m.tono||tonoDe(areaDe(m));
  return {
    titulo:m.nombre,
    vista(){
      // Materia anunciada (p. ej. 📚 Lectura): solo la pantalla corta con lo que hará
      if(m.proximo)return `<div class="area-${tono}">${cabecera({icono:m.icono||m.sigla,titulo:m.nombre,desc:'⚪ Próximamente'})}
<div class="card"><p>${m.intro||m.descripcion}</p>${boton({texto:'➕ Agregar libro',clase:'ancho',extra:'disabled aria-disabled="true"'})}
<p class="nota" style="text-align:center;margin-top:8px">Próximamente</p></div></div>`;
      const p=progreso(),d=datosMateria(p,m.id),ls=m.lecciones||[],r=recomendar({materia:m.id},p),u=d.ubicacion,k=repartoUbicacion(ls.filter(l=>l.rondas?.length).length).reduce((a,b)=>a+b,0);
      const ss=secciones(m).filter(([k])=>`${rutaMateria(m)}/${k}`!==m.destacado?.ruta),grupos=[...new Set(ss.map(([,s])=>s.grupo))];
      const temas=m.temas?`<h2>Temas</h2><div class="lista-nav">${m.temas.map(t=>{const c=conteo(d,t.lecciones),prox=!t.lecciones.length;
        const clase=prox&&!t.nodos.some(n=>n.ir)?'proximo':'',e=ESTADO[estadoTema(m,t).estado];
        return tarjetaNav({go:rutaTema(m,t),icono:t.icono,titulo:t.titulo,desc:t.descripcion,clase,
          pie:prox?(t.nodos.some(n=>n.ir)?`<span class="nota">${t.nodos.filter(n=>n.ir).length} herramientas</span>`:chip(`${e.icono} ${e.texto}`)):`${barra(c.hechas,c.total)}<span class="nota">${e.icono} ${e.texto} · ${c.hechas}/${c.total} habilidades${t.proximas.length?` · ${t.proximas.length} pronto`:''}${c.hechas<c.total?` · ≈ ${textoMin(minutosTema(d,t))}`:' · ✔ terminado'}</span>`})}).join('')}</div>
${retosDe(m.id).length?boton({texto:`🎯 Retos y escenarios (${retosDe(m.id).length})`,go:`${rutaMateria(m)}/retos`,clase:'ghost ancho'}):''}`
        :ls.length?`<h2>Lecciones</h2><div class="lista-nav">${ls.map((l,i)=>tarjetaNav({go:rutaLeccion(m,l),icono:dominada(d,l)?'✅':i+1,titulo:l.titulo,desc:l.resumen})).join('')}</div>`:'';
      return `<div class="area-${tono}">${cabecera({icono:m.icono||m.sigla,titulo:m.nombre,desc:m.descripcion})}
${r.ruta?htmlSiguiente(r):''}
${m.destacado?`<button class="destacado" data-go="${m.destacado.ruta}"><span class="destacado-titulo">${m.destacado.titulo}</span><span class="nota">${m.destacado.desc}</span></button>`:''}
<div class="card">${htmlNivel(d.xp)}${m.temas?htmlCobertura(m)+htmlPlan(m,d):''}</div>
${temas}
${m.temas?htmlExamenFinal(m):''}
${ls.length?`<details class="como-se-usa" style="margin-top:16px"><summary>🧭 ¿Ya sabes algo? Examen de ubicación</summary><p class="nota">${u?`Último: ${u.aciertos} de ${u.total} aciertos · ${u.dominadas.length} lecciones marcadas como dominadas.`:`${k} preguntas para saltar lo que ya sabes.`}</p>${boton({texto:u?'Repetir examen':'Hacer el examen',go:`${rutaMateria(m)}/ubicacion`,clase:'ghost'})}</details>`:''}
${m.temas?'':grupos.map(g=>`<h2>${g||'Herramientas'}</h2><div class="lista-nav">${ss.filter(([,s])=>s.grupo===g).map(([k,s])=>tarjetaNav({go:`${rutaMateria(m)}/${k}`,icono:d.visitadas.includes(k)?'✅':'🔧',titulo:s.titulo,desc:s.desc})).join('')}</div>`).join('')}</div>`;
    }
  };
}

/* ---------- cobertura, estado del tema, para profundizar y examen final ---------- */
// 🧭 Tu plan: cuánto falta (habilidades y tiempo estimado) y el tema en curso; el siguiente paso concreto es «Lo siguiente para ti»
function htmlPlan(m,d){
  const hs=(m.temas||[]).flatMap(t=>t.lecciones),faltan=hs.filter(l=>!dominada(d,l)),t=temaEnCurso(m,d);
  if(!hs.length)return '';
  if(!faltan.length)return `<p class="plan-linea">🧭 <b>Tu plan:</b> dominaste las ${hs.length} habilidades. Te queda el examen final.</p>`;
  const min=faltan.reduce((s,l)=>s+minutosHab(d,l),0);
  return `<p class="plan-linea">🧭 <b>Tu plan:</b> te faltan ${faltan.length} de ${hs.length} habilidades · ≈ ${textoMin(min)} (unas ${Math.max(1,Math.round(min/8))} sesiones de 8 min).</p>
${t?`<p class="plan-linea">Tema en curso: ${boton({texto:`${t.icono||'📘'} ${t.titulo} · ≈ ${textoMin(minutosTema(d,t))}`,go:rutaTema(m,t),clase:'ghost'})}</p>`:''}`;
}
// Al terminar un tema: resumen, simulacro y qué sigue
function htmlTemaTerminado(m,t,d){
  const sig=temaSiguiente(m,d,t),sim=retosDe(m.id,t.id).some(r=>r.simulacro);
  return `<div class="card tema-terminado"><p style="margin:0"><b>🎉 ¡Terminaste «${esc(t.titulo)}»!</b></p>
<p class="nota">Repasa el resumen, ponte a prueba con el simulacro y sigue con lo próximo. Lo que dominaste seguirá en Repasar para no olvidarlo.</p>
<div class="row" style="gap:8px;flex-wrap:wrap">${boton({texto:'📄 Resumen del tema',go:`notas/tema/${m.id}/${t.id}`,clase:'ghost'})}${sim?boton({texto:'📝 Simulacro',go:`${rutaTema(m,t)}/retos`,clase:'ghost'}):''}
${sig?boton({texto:`➡️ Sigue: ${sig.titulo}`,go:rutaTema(m,sig),clase:'area'}):boton({texto:'🎓 Examen final',go:`${rutaMateria(m)}/examen-final`,clase:'area'})}</div></div>`;
}
function htmlCobertura(m){
  const c=cobertura(m.id),e=ESTADO[estadoMateria(m.id).estado]||ESTADO.parcial;
  return `<div class="cobertura">${barra(c.completas,c.total)}<p class="nota" style="margin:6px 0 0">${e.icono} ${textoCobertura(c)}</p></div>`;
}
function htmlEstadoTema(m,t){
  const e=estadoTema(m,t),est=ESTADO[e.estado]||ESTADO.parcial;
  if(e.estado==='herramientas')return '';
  return `<div class="card tema-estado"><p style="margin:0"><b>${est.icono} ${est.texto}</b> · Cobertura del tema: ${e.total?Math.round(e.completas/e.total*100):0} % (${e.completas} de ${e.total} habilidades ✅)</p>
${e.faltan?.length?`<details class="como-se-usa"><summary>¿Qué falta para ✅?</summary><ul class="nota">${e.faltan.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}
<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">${boton({texto:'📄 Hoja del tema',go:`notas/tema/${m.id}/${t.id}`,clase:'ghost'})}</div>
${t.referencias?.length?`<details class="como-se-usa"><summary>📚 Para profundizar</summary><ul class="nota">${t.referencias.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></details>`:''}</div>`;
}
function htmlExamenFinal(m){
  const r=resultadoFinal(m.id);
  return `<h2>🎓 Examen final y certificado</h2><div class="card"><p class="nota" style="margin-top:0">Examen acumulativo de toda la materia, con tiempo y sin pistas. Con ${Math.round(APROBAR*100)} % o más obtienes un certificado interno (sin valor oficial).</p>
${r?`<p style="margin:0 0 8px">Tu mejor resultado: <b>${Math.round(r.pct*100)} %</b> · ${r.fecha}</p>`:''}
<div class="row" style="gap:8px;flex-wrap:wrap">${boton({texto:r?'🎓 Presentar otra vez':'🎓 Examen final',go:`${rutaMateria(m)}/examen-final`,clase:'area'})}${r&&r.pct>=APROBAR?boton({texto:'🏅 Certificado',go:`${rutaMateria(m)}/certificado`,clase:'ghost'}):''}</div></div>`;
}

/* ---------- camino de un tema: nodos circulares en zigzag ---------- */
// Habilidad: dominada (dorada con corona) · actual (anillo pulsante) · abierta · bloqueada (gris: practica antes la anterior)
// Cofre 🎁 cada 3 habilidades · Jefe 🏆 al final · Herramienta (enlace) · Próximamente (gris con candado)
const ZIGZAG=[0,52,76,52,0,-52,-76,-52];
export function vistaTema(m,t){
  const tono=m.tono||tonoDe(areaDe(m));
  return {
    titulo:t.titulo,
    vista(){
      const p=progreso(),d=datosMateria(p,m.id),c=conteo(d,t.lecciones),est=estadosTema(t,d),cofres=cofresTema(t);
      let k=0;const x=()=>`--x:${ZIGZAG[k++%ZIGZAG.length]}px`;
      const especial=(clase,icono,titulo,sub,ruta,abierto)=>`<li style="${x()}"><button class="nodo ${clase}${abierto?'':' bloqueado'}" ${abierto?`data-go="${ruta}"`:`data-cerrado="${esc(sub)}"`} aria-label="${esc(titulo)}">${abierto?icono:'🔒'}</button><span class="camino-titulo">${titulo}</span><span class="camino-sub">${sub}</span></li>`;
      const cofreTras=h=>{const cf=cofres.find(z=>z.habilidades.at(-1)===h);if(!cf)return '';const ab=cofreAbierto(cf,d),hecho=d.extra.cofres?.[cf.id];
        return especial('cofre',hecho?'📦':'🎁','Cofre',ab?(hecho?'Repasa otra vez':'¡Ábrelo!'):'Practica las 3 anteriores',`${rutaTema(m,t)}/cofre/${cf.k}`,ab)};
      const ultimaHab=t.lecciones.at(-1);
      const jefe=()=>t.lecciones.length>=2?especial('jefe',jefeVencido(t,d)?'🏆':'⚔️',`Jefe: ${t.titulo}`,jefeVencido(t,d)?'Vencido':jefeAbierto(t,d)?'Mezcla cronometrada':'Practica todo el tema',`${rutaTema(m,t)}/jefe`,jefeAbierto(t,d)):'';
      const nodo=n=>{
        if(n.proximo)return `<li style="${x()}"><span class="nodo proximo" aria-hidden="true">🔒</span><span class="camino-titulo">${n.titulo}</span><span class="camino-sub">Próximamente</span></li>`;
        if(n.ir)return `<li style="${x()}"><button class="nodo herramienta" data-go="${rutaMateria(m)}/${n.ir}" aria-label="${esc(n.titulo)}">${n.icono||'🔧'}</button><span class="camino-titulo">${n.titulo}</span></li>`;
        const e=est[n.id],h=d.lecciones[n.id];
        const html=e==='bloqueado'?`<li style="${x()}"><button class="nodo bloqueado" data-bloqueado="${esc(n.id)}" aria-label="${esc(n.titulo)}: bloqueada">🔒</button><span class="camino-titulo">${n.titulo}</span></li>`
          :`<li style="${x()}">${e==='actual'?`<span class="globo">${h?'Seguir':'Empezar'}</span>`:''}<button class="nodo ${e}" data-go="${rutaLeccion(m,n)}" aria-label="${esc(n.titulo)}: ${e==='dominado'?'dominada':e==='actual'?'te toca':'abierta'}">${e==='dominado'?'👑':e==='actual'?'★':'●'}</button><span class="camino-titulo">${n.titulo}</span>${h&&e!=='dominado'?`<span class="camino-sub">${puntos(nivelDe(h.rating))}</span>`:''}</li>`;
        return html+cofreTras(n)+(n===ultimaHab?jefe():'');
      };
      const n=t.lecciones.length;
      return `<div class="area-${tono}">${cabecera({icono:t.icono,titulo:t.titulo,desc:t.descripcion})}
${n?`${barra(c.hechas,c.total)}<p class="nota" style="margin-top:6px">${c.hechas}/${c.total} dominadas</p>`:''}
${n&&c.hechas===c.total?htmlTemaTerminado(m,t,d):''}
${htmlEstadoTema(m,t)}
${retosDe(m.id,t.id).length?boton({texto:`🎯 Retos y escenarios (${retosDe(m.id,t.id).length})`,go:`${rutaTema(m,t)}/retos`,clase:'ghost ancho'}):''}
<ol class="camino">${t.nodos.map(nodo).join('')}</ol></div>`;
    },
    async alClic(t2){
      if(t2.dataset.cerrado!==undefined){await confirmar({titulo:'🔒 Todavía no',texto:`${t2.dataset.cerrado}.`,si:'Entendido',no:'Cerrar'});return true}
      if(t2.dataset.bloqueado===undefined)return;
      const hs=t.lecciones,i=hs.findIndex(h=>h.id===t2.dataset.bloqueado),antes=hs[i-1];
      if(await confirmar({titulo:'🔒 Todavía no',texto:`Practica antes «${antes.titulo}»: cada habilidad se apoya en la anterior.`,si:`Ir a ${antes.titulo}`,no:'Cerrar'}))document.dispatchEvent(new CustomEvent('ir',{detail:rutaLeccion(m,antes)}));
      return true;
    }
  };
}
