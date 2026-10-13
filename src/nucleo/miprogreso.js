/* Página "Mi progreso": racha, meta diaria, actividad, repaso y detalle por materia */
import {materias} from './materias.js';
import {progreso,datosMateria,racha,estadoHoy,pendientes,cambiarMeta,reiniciarProgreso,hoy,sumarDias,METAS,INTERVALOS,minutosHablados} from './progreso.js';
import {htmlNivel} from './portada.js';
import {barra} from './ui.js';

const stat=(k,v,extra='')=>`<div><div class="prog-k">${k}</div><div class="prog-v">${v}</div>${extra}</div>`;

export const miProgreso={
  titulo:'Mi progreso',
  vista(){
    const p=progreso(),h=estadoHoy(p),r=racha(p),rep=Object.keys(p.repaso).length,hoyN=pendientes(p).length;
    const xpTotal=materias.reduce((s,m)=>s+datosMateria(p,m.id).xp,0),mh=minutosHablados(p);
    // Últimas 4 semanas: verde = meta cumplida, tenue = practicó sin cumplirla
    const dias=Array.from({length:28},(_,i)=>sumarDias(hoy(),i-27)).map(f=>{const d=p.dias[f];
      const est=d?.ok?'ok':d&&(d.ej||d.seg>=60)?'algo':'';
      return `<span class="dia ${est}" title="${f}${d?` · ${d.ej} ejercicios · ${Math.floor(d.seg/60)} min · ${d.xp} XP`:''}"></span>`}).join('');
    return `<h1>Mi progreso</h1><p class="lead">Todo se guarda en este navegador. Si borras los datos del sitio o cambias de navegador, empiezas de cero.</p>
<div class="card"><div class="prog-grid" style="margin-top:0">
 ${stat('Racha actual',`${r} <small>${r===1?'día':'días'}</small>`)}
 ${stat('Mejor racha',`${Math.max(r,p.mejorRacha)} <small>días</small>`)}
 ${stat('Meta de hoy',`${h.hecho} <small>de ${h.meta} ${h.tipo==='minutos'?'minutos':'ejercicios'}${h.ok?' · ✓ cumplida':''}</small>`,barra(h.hecho,h.meta))}
 ${stat('XP total',`${xpTotal} <small>XP</small>`)}
 ${stat('Minutos hablados',`${mh.hoy} <small>hoy · ${mh.semana} en 7 días</small>`)}
</div>
<h3 style="margin:18px 0 8px">Últimas 4 semanas</h3><div class="dias" role="img" aria-label="Actividad de los últimos 28 días">${dias}</div>
<p class="progress" style="margin:8px 0 0"><span class="dia ok"></span> meta cumplida · <span class="dia algo"></span> practicaste sin cumplirla</p></div>

<h2>Meta diaria</h2>
<div class="card"><p style="margin:0 0 10px;color:var(--muted)">La racha cuenta los días seguidos en que cumples la meta. Los minutos se cuentan mientras usas la app.</p>
<div class="tabs" id="metas">${METAS.map(([t,c])=>`<button data-meta="${t}:${c}" aria-pressed="${p.meta.tipo===t&&p.meta.cantidad===c}">${c} ${t}</button>`).join('')}</div></div>

<h2>Repaso</h2>
<div class="card"><div class="prog-grid" style="margin-top:0">
 ${stat('Para hoy',`${hoyN} <small>${hoyN===1?'ejercicio':'ejercicios'}</small>`)}
 ${stat('Programados',`${rep} <small>en total</small>`)}
 ${stat('Dominados',`${p.dominados} <small>acertados también a los ${INTERVALOS[INTERVALOS.length-1]} días</small>`)}
</div>${hoyN?`<div class="row" style="margin-top:12px"><button class="btn" data-go="repaso">Repasar hoy</button></div>`:''}</div>

<h2>Por materia</h2>
${materias.map(m=>{const d=datosMateria(p,m.id),ls=m.lecciones||[];
  return `<div class="card" style="margin-bottom:14px"><div class="materia-cab"><span class="sigla">${m.sigla}</span><h3 style="margin:0">${m.nombre}</h3></div>
<div style="margin-top:10px">${htmlNivel(d.xp)}</div>
${ls.length?`<div class="chips" style="margin-top:12px">${ls.map((l,i)=>{const x=d.lecciones[l.id];return `<span class="tag${x?.dominada?' on':''}" title="${l.titulo}">${x?.dominada?`✓ L${i+1} dominada`:x?`L${i+1} · ${Math.round(x.mejor*100)}%`:`L${i+1} · pendiente`}</span>`}).join('')}</div>`:''}
${m.progresoHtml?m.progresoHtml(d):''}</div>`}).join('')}

<div class="row" style="margin-top:20px"><button class="btn ghost" id="preset">Reiniciar todo el progreso</button></div>
<p class="progress" style="margin-top:16px">Versión ${__VERSION__}${navigator.serviceWorker?.controller?' · disponible sin internet':''}</p>`;
  },
  alClic(t,ir,repintar){
    if(t.dataset.meta){const [tipo,c]=t.dataset.meta.split(':');cambiarMeta(tipo,+c);repintar();return true}
    if(t.id==='preset'){if(confirm('¿Borrar todo tu progreso guardado en este navegador? (XP, racha, lecciones, ubicación y repaso; tus notas se conservan)')){reiniciarProgreso();repintar()}return true}
  }
};
