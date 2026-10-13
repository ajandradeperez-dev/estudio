/* Vista de una lección en formato común:
   {titulo, resumen, explicacion:[párrafos], ejemplos:[[texto, nota?]…], practica:[ejercicios]} (ver ejercicios.js)
   Fases: 'aprender' (explicación y ejemplos) → 'practica' (un ejercicio a la vez) → 'fin' (resumen). */
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from './ejercicios.js';
import {progreso,datosMateria,registrarEjercicio,guardarEnCurso,terminarLeccion} from './progreso.js';

const estados={}; // estado de cada lección mientras la app está abierta: {fase,i,aciertos,xp,extra}

export function vistaLeccion(m,l){
  const clave=`${m.id}/${l.id}`,n=m.lecciones.indexOf(l),sig=m.lecciones[n+1],total=l.practica.length;
  const st=()=>estados[clave];

  const teoria=()=>`<div class="card"><h3>Explicación</h3>${l.explicacion.map(p=>`<p class="lec-p">${p}</p>`).join('')}</div>
<div class="card" style="margin-top:14px"><h3>Ejemplos</h3><ul class="ejemplos">${l.ejemplos.map(([t,nota])=>`<li><span>${t}</span>${nota?`<span class="nota">${nota}</span>`:''}</li>`).join('')}</ul></div>`;
  const barra=(a,b)=>`<div class="barra" aria-hidden="true"><span style="width:${Math.round(a/b*100)}%"></span></div>`;

  function vista(){
    const s=st();
    const cab=`<p class="miga"><button class="enlace" data-go="${m.id}">${m.nombre}</button> › Lección ${n+1} de ${m.lecciones.length}</p><h1>${l.titulo}</h1><p class="lead">${l.resumen}</p>`;
    if(s.fase==='aprender')return `${cab}${teoria()}
<div class="row" style="margin-top:16px"><button class="btn" id="lec-empezar">Practicar · ${total} ejercicios</button></div>`;
    if(s.fase==='practica')return `${cab}<details class="card lec-teoria"><summary>Repasar la explicación y los ejemplos</summary>${teoria()}</details>
<div class="card" style="margin-top:14px"><p class="progress">Ejercicio ${s.i+1} de ${total} · aciertos ${s.aciertos}</p>${barra(s.i,total)}
<div style="margin-top:14px">${htmlEjercicio(l.practica[s.i])}</div></div>`;
    return `${cab}<div class="card"><h3>Lección terminada</h3>
<p class="prog-v">${s.aciertos} <small>de ${total} aciertos · +${s.xp} XP${s.extra?` (incluye +${s.extra} por terminarla por primera vez)`:''}</small></p>${barra(s.aciertos,total)}
<p style="color:var(--muted)">${s.aciertos===total?'¡Perfecto!':'Los ejercicios que fallaste ya están en <strong>Repasar hoy</strong>.'}</p>
<div class="row">${sig?`<button class="btn" data-go="${m.id}/l/${sig.id}">Siguiente lección: ${sig.titulo}</button>`:''}<button class="btn ghost" id="lec-repetir">Repetir lección</button><button class="btn ghost" data-go="${m.id}">Volver a ${m.nombre}</button></div></div>`;
  }

  return {
    titulo:l.titulo,
    // Al entrar: si había una práctica a medias (en esta sesión o guardada), se retoma
    alEntrar(){
      if(st()&&st().fase!=='fin')return;
      const e=datosMateria(progreso(),m.id).enCurso;
      if(e&&e.leccion===l.id&&e.i>=total){ // respondió todo pero no llegó a ver el resultado
        const extra=terminarLeccion(m.id,l.id,e.aciertos||0,total);
        estados[clave]={fase:'fin',i:total,aciertos:e.aciertos||0,xp:(e.xp||0)+extra,extra};return}
      estados[clave]=e&&e.leccion===l.id&&e.i<total?{fase:'practica',i:e.i,aciertos:e.aciertos||0,xp:e.xp||0}:{fase:'aprender'};
    },
    vista,
    alClic(t,ir,repintar){
      const s=st();
      if(t.id==='lec-empezar'||t.id==='lec-repetir'){
        estados[clave]={fase:'practica',i:0,aciertos:0,xp:0};
        guardarEnCurso(m.id,{leccion:l.id,i:0,aciertos:0,xp:0});repintar();return true}
      if(t.id==='lec-sig'){
        s.i++;
        if(s.i>=total){s.fase='fin';s.extra=terminarLeccion(m.id,l.id,s.aciertos,total);s.xp+=s.extra}
        repintar();return true}
      if(s.fase!=='practica')return;
      const ej=l.practica[s.i],r=manejarEjercicio(t,ej); if(!r)return;
      const xp=r.correcto?10:0;
      registrarEjercicio({materia:m.id,ref:`${m.id}/l/${l.id}/${s.i}`,correcto:r.correcto,xp});
      if(r.correcto)s.aciertos++;
      s.xp+=xp;
      guardarEnCurso(m.id,{leccion:l.id,i:s.i+1,aciertos:s.aciertos,xp:s.xp});
      mostrarResultado(ej,r.correcto,`<br><span class="progress">${r.correcto?'+10 XP':'Lo volverás a ver en Repasar hoy.'}</span>
<div class="row" style="margin-top:10px"><button class="btn" id="lec-sig">${s.i+1<total?'Siguiente':'Ver resultado'}</button></div>`);
      return true;
    }
  };
}
