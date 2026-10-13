/* Vista de una lección (ver "Método de aprendizaje" en CLAUDE.md):
   {titulo, resumen, explicacion:[párrafos], ejemplos:[[texto, nota?]…], rondas:[[ejercicios…],[ejercicios…]]}
   Fases: 'aprender' → 'practica' (una ronda, un ejercicio a la vez) → 'fin'.
   Se domina con DOMINIO de aciertos sin pista; si no, se repite con la otra ronda (ejercicios distintos).
   Al dominarla se pide un resumen de 1–2 frases que se guarda en "Mis notas". */
import {$,esc} from '../utilidades.js';
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from './ejercicios.js';
import {progreso,datosMateria,registrarEjercicio,guardarEnCurso,terminarIntento,programarRepaso,guardarNota} from './progreso.js';
import {DOMINIO,indiceGlobal,esProduccion,frases} from './metodo.js';
import {barra} from './ui.js';
import {htmlCierre} from './cierre.js';
import {tema,rutaMateria,rutaTema,rutaLeccion} from './materias.js';

const estados={}; // estado de cada lección mientras la app está abierta

export function vistaLeccion(m,l){
  // Número de la lección dentro de su tema (o de la materia) y a dónde vuelve
  const t=l.tema&&tema(m,l.tema),lista=t?t.lecciones:m.lecciones,clave=`${m.id}/${l.id}`,n=lista.indexOf(l);
  const volver=t?rutaTema(m,t):rutaMateria(m),volverTxt=t?t.titulo:m.nombre;
  const st=()=>estados[clave];
  const datos=()=>datosMateria(progreso(),m.id).lecciones[l.id];
  const nota=()=>progreso().notas[clave];
  const rondaSiguiente=()=>(datos()?.intentos||0)%l.rondas.length;

  const teoria=()=>`${l.explicacion.map(p=>`<p class="lec-p">${p}</p>`).join('')}
<ul class="ejemplos">${l.ejemplos.map(([t,nt])=>`<li><span>${t}</span>${nt?`<span class="nota">${nt}</span>`:''}</li>`).join('')}</ul>`;
  const formNota=()=>`<div class="nota-form"><label for="lec-nota">Resume en 1 o 2 frases lo que aprendiste. Se guarda en Mis notas.
<textarea id="lec-nota" rows="3" maxlength="300">${esc(nota()?.texto||'')}</textarea></label>
<div class="row"><button class="btn" id="lec-guardar-nota">Guardar en Mis notas</button><span id="lec-nota-msg" class="progress" role="status"></span></div></div>`;

  // "Lo que aprendiste": las reglas distintas de la ronda (las 3 primeras)
  const reglasRonda=r=>[...new Set(l.rondas[r].map(e=>e.regla).filter(Boolean))].slice(0,3);
  function empezar(ronda){
    estados[clave]={fase:'practica',ronda,i:0,ok:0,xp:0};
    guardarEnCurso(m.id,{leccion:l.id,ronda,i:0,ok:0,xp:0});
  }
  function terminar(){
    const s=st(),total=l.rondas[s.ronda].length,r=terminarIntento(m.id,l.id,s.ok,total);
    if(r.dominada){ // para recordarla: dos ejercicios de producción de otra ronda (que no estén ya en el repaso) vuelven mañana
      const otra=(s.ronda+1)%l.rondas.length,ya=progreso().repaso;
      programarRepaso(l.rondas[otra].map((ej,i)=>({ej,ref:`${m.id}/l/${l.id}/${indiceGlobal(l,otra,i)}`}))
        .filter(x=>esProduccion(x.ej)&&!ya[x.ref]).slice(0,2).map(x=>x.ref));
    }
    estados[clave]={fase:'fin',ronda:s.ronda,ok:s.ok,total,xp:s.xp+r.extra,...r};
  }

  function vista(){
    const s=st(),d=datos();
    const cab=`<p class="miga">Lección ${n+1} de ${lista.length}${l.nivel?` · ${l.nivel}`:''}</p>
<h1>${l.titulo}${d?.dominada?' <span class="tag on">✓ Dominada</span>':''}</h1><p class="lead">${l.resumen}</p>`;
    if(s.fase==='aprender')return `${cab}<div class="card">${teoria()}</div>
${nota()?`<div class="card nota-propia" style="margin-top:14px"><div class="ej-k">Tu resumen</div>${esc(nota().texto)}</div>`:''}
<div class="row" style="margin-top:16px"><button class="btn" id="lec-empezar">${d?.dominada?'Practicar otra vez':'Practicar'} · ${l.rondas[rondaSiguiente()].length} ejercicios</button></div>`;
    if(s.fase==='practica'){const ejs=l.rondas[s.ronda];
      return `${cab}<details class="card lec-teoria"><summary>Ver la explicación</summary><div style="margin-top:12px">${teoria()}</div></details>
<div class="card" style="margin-top:14px"><p class="progress">Ronda ${s.ronda+1} · ejercicio ${s.i+1} de ${ejs.length} · aciertos sin pista ${s.ok}</p>${barra(s.i,ejs.length)}
<div style="margin-top:14px">${htmlEjercicio(ejs[s.i])}</div></div>`}
    const pct=Math.round(s.porcentaje*100),meta=Math.round(DOMINIO*100);
    if(s.dominada)return `${cab}<div class="card"><h3>✓ Lección dominada</h3>
<p class="prog-v">${s.ok} <small>de ${s.total} sin pista (${pct}%) · +${s.xp} XP${s.extra?` (incluye +${s.extra} por dominarla)`:''}</small></p>${barra(s.ok,s.total)}
${formNota()}
${htmlCierre({xp:s.xp,aprendido:reglasRonda(s.ronda),excluir:rutaLeccion(m,l)})}
<div class="row" style="margin-top:12px"><button class="btn ghost" data-go="${volver}">Volver a ${volverTxt}</button></div></div>`;
    return `${cab}<div class="card"><h3>Aún no la dominas</h3>
<p class="prog-v">${pct}% <small>sin pista · necesitas ${meta}% (${s.ok} de ${s.total})</small></p>${barra(s.ok,s.total)}
<p style="color:var(--muted)">Repite con ejercicios distintos. Los que fallaste ya están en <strong>Repasar hoy</strong>.</p>
<div class="row"><button class="btn" id="lec-repetir">Repetir con otros ejercicios</button><button class="btn ghost" data-go="${volver}">Volver a ${volverTxt}</button></div>
${htmlCierre({xp:s.xp,aprendido:reglasRonda(s.ronda),excluir:rutaLeccion(m,l)})}</div>`;
  }

  return {
    titulo:l.titulo,
    // Al entrar: si había una práctica a medias (en esta sesión o guardada), se retoma
    alEntrar(){
      if(st()&&st().fase!=='fin')return;
      const e=datosMateria(progreso(),m.id).enCurso,ejs=e&&e.leccion===l.id&&l.rondas[e.ronda];
      if(!ejs){estados[clave]={fase:'aprender'};return}
      estados[clave]={fase:'practica',ronda:e.ronda,i:e.i,ok:e.ok||0,xp:e.xp||0};
      if(e.i>=ejs.length)terminar(); // respondió todo pero no llegó a ver el resultado
    },
    vista,
    async alClic(t,ir,repintar){
      const s=st();
      if(t.id==='lec-empezar'||t.id==='lec-repetir'){empezar(rondaSiguiente());repintar();window.scrollTo(0,0);return true}
      if(t.id==='lec-sig'){s.i++;if(s.i>=l.rondas[s.ronda].length)terminar();repintar();return true}
      if(t.id==='lec-guardar-nota'){
        const txt=$('#lec-nota').value.trim().replace(/\s+/g,' '),f=frases(txt),msg=$('#lec-nota-msg');
        if(!txt||f<1)msg.textContent='Escribe al menos una frase.';
        else if(f>2)msg.textContent=`Son ${f} frases: resúmelo en 1 o 2.`;
        else{guardarNota(m.id,l.id,txt);msg.textContent='✓ Guardado en Mis notas'}
        return true}
      if(s.fase!=='practica')return;
      const ej=l.rondas[s.ronda][s.i],r=await manejarEjercicio(t,ej); if(!r)return;
      const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      // Con pista no cuenta para el dominio y vuelve en el repaso, igual que un fallo
      registrarEjercicio({materia:m.id,ref:`${m.id}/l/${l.id}/${indiceGlobal(l,s.ronda,s.i)}`,correcto:bien,xp});
      if(bien)s.ok++;
      s.xp+=xp;
      guardarEnCurso(m.id,{leccion:l.id,ronda:s.ronda,i:s.i+1,ok:s.ok,xp:s.xp});
      const ult=s.i+1>=l.rondas[s.ronda].length;
      mostrarResultado(ej,r,`<div class="fb-pie"><span class="progress">${xp?`+${xp} XP`:''}${bien?'':`${xp?' · ':''}Vuelve en Repasar hoy.`}</span>
<button class="btn" id="lec-sig">${ult?'Ver resultado':'Siguiente'}</button></div>`);
      return true;
    }
  };
}
