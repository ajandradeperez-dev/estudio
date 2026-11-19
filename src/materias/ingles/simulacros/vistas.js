/* 🏁 Simulacros de Inglés (sección «simulacros» de la materia; rutas bajo #estudio/ingles/simulacros):
   (vacía)            lista por nivel, historial con gráfica y la prueba de nivel
   <id>               portada: partes y tiempos, «Empezar», «Solo una parte» y «Retomar»
   <id>/hacer         el examen: una tarea por pantalla, con tiempo, sin pistas; «⏸ Pausar» guarda y sale
   <id>/resultado     calificación por parte y total, nivel estimado, «Practicar esto» y revisión de cada respuesta
   prueba-nivel       prueba de nivel adaptativa (prueba-nivel.js)
   El intento en curso se guarda en localStorage['ciberlab-simulacro'] (pausar y retomar en este dispositivo); el resultado
   final va al progreso (extra.simulacros) y los errores al repaso ('m/<simulacro>/<parte>/<tarea>/<pregunta>'). */
import {esc} from '../../../utilidades.js';
import {soporte,hablarDialogo,callar} from '../../../nucleo/voz.js';
import {registrarEjercicio,cambiarExtra,progreso,datosMateria,hoy} from '../../../nucleo/progreso.js';
import {barra,confirmar,aviso} from '../../../nucleo/ui.js';
import {iaDisponible,pedir} from '../../../nucleo/ia.js';
import {contarPalabras} from '../nivel/datos.js';
import {SIMULACROS,simulacro,PARTES,partesDe,AVISO_OFICIAL,REPRODUCCIONES,idPregunta,transcripcion,correcta,textoCorrecto,rubricaEscritura,resultado,practicarParte,NIVELES,CRITERIOS_ESCRITURA,CRITERIOS_HABLA} from './motor.js';
import {ESCENAS} from './escenas.js';
import {crearHabla} from './examinador.js';
import {vistaPruebaNivel,htmlPruebaNivel} from './prueba-nivel.js';

const RAIZ='estudio/ingles/simulacros';
const CLAVE='ciberlab-simulacro';
const leerTodos=()=>{try{return JSON.parse(localStorage.getItem(CLAVE)||'{}')||{}}catch(e){return {}}};
const leer=id=>leerTodos()[id]||null;
const escribir=(id,est)=>{try{const t=leerTodos();if(est)t[id]=est;else delete t[id];localStorage.setItem(CLAVE,JSON.stringify(t))}catch(e){}};
const historial=()=>datosMateria(progreso(),'ingles').extra.simulacros||[];
const pct=x=>Math.round((x||0)*100);
// Las pruebas aceleran el reloj (segundos reales por segundo simulado)
const factor=()=>window.__relojSimulacro||1;
const miga=(...xs)=>`<p class="miga"><button class="enlace" data-go="estudio/ingles">Inglés</button> › ${xs.length?`<button class="enlace" data-go="${RAIZ}">Simulacros</button> › ${xs.join(' › ')}`:'Simulacros'}</p>`;
const tiempo=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;

/* ---------- lista ---------- */
function grafica(xs){
  if(xs.length<2)return '';
  const w=300,h=90,n=xs.length,pts=xs.map((x,i)=>[16+i*(w-32)/(n-1),h-12-(h-24)*x.total]);
  return `<svg class="sim-grafica" viewBox="0 0 ${w} ${h}" role="img" aria-label="Progreso de tus simulacros: ${xs.map(x=>pct(x.total)+' %').join(', ')}">
<line x1="12" y1="${h-12-(h-24)*0.7}" x2="${w-8}" y2="${h-12-(h-24)*0.7}" class="sim-linea-meta"/><polyline points="${pts.map(p=>p.join(',')).join(' ')}" class="sim-linea"/>
${pts.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="4" class="sim-punto"><title>${xs[i].fecha}: ${pct(xs[i].total)} %</title></circle>`).join('')}</svg><p class="nota">La línea punteada marca el 70 %.</p>`;
}
const portada={titulo:'Simulacros',vista(){
  const hs=historial(),curso=leerTodos();
  return `<div class="area-estudio">${miga()}<h1>🏁 Simulacros de Inglés</h1>
<p class="aviso-linea">⚠️ ${AVISO_OFICIAL}</p>
<p class="intro">Lectura, escritura, escucha, uso del idioma y habla con IA, con tiempo y sin pistas. Puedes pausar y retomar, o hacer solo una parte.</p>
${htmlPruebaNivel()}
${NIVELES.map(n=>{const xs=SIMULACROS.filter(s=>s.nivel===n);return xs.length?`<h2>${n}</h2><div class="lista-nav">${xs.map(s=>{const ult=hs.filter(h=>h.id===s.id).at(-1);
  return `<button class="tarjeta-nav" data-go="${RAIZ}/${s.id}"><span class="icono" aria-hidden="true">${curso[s.id]?'⏸':ult?'✅':'🏁'}</span><span class="texto"><span class="titulo">${esc(s.titulo)}</span><span class="desc">${partesDe(s).map(p=>PARTES[p].icono).join(' ')} · ${Object.values(s.minutos).reduce((a,b)=>a+b,0)} min${curso[s.id]?' · en pausa':''}${ult?` · último: ${pct(ult.total)} %`:''}</span></span></button>`}).join('')}</div>`:''}).join('')}
<h2>📈 Tu historial</h2>${hs.length?`${grafica(hs.slice(-12))}<ul class="lista-simple">${hs.slice(-10).reverse().map(h=>`<li><b>${esc(simulacro(h.id)?.titulo||h.id)}</b> · ${h.fecha} · ${pct(h.total)} % · ${esc(h.nivel)}${h.solo?` · solo ${PARTES[h.solo]?.titulo.toLowerCase()}`:''}</li>`).join('')}</ul>`:'<p class="nota">Todavía no terminas ningún simulacro.</p>'}</div>`}};

/* ---------- portada de un simulacro ---------- */
function vistaSimulacro(s){
  return {titulo:s.titulo,vista(){
    const est=leer(s.id),ps=partesDe(s);
    return `<div class="area-estudio">${miga(esc(s.titulo))}<h1>🏁 ${esc(s.titulo)}</h1><p class="aviso-linea">⚠️ ${AVISO_OFICIAL}</p>
<div class="card"><ul class="lista-simple">${ps.map(p=>`<li>${PARTES[p].icono} <b>${PARTES[p].titulo}</b> · ${s.minutos[p]} min · ${p==='habla'?`${s.habla.partes.length} ${s.habla.partes.length===1?'parte':'partes'}`:`${s[p].length} tareas`}</li>`).join('')}</ul>
<p class="nota" style="margin:8px 0 0">Sin pistas ni correcciones hasta el final. En la escucha, cada audio se puede oír ${REPRODUCCIONES} veces; el texto aparece en la revisión.${ps.includes('habla')?' La parte de habla usa el micrófono (o escribes si tu navegador no reconoce voz).':''}</p></div>
${est?`<div class="card sim-pausada"><p style="margin-top:0"><b>Tienes este simulacro en pausa</b>${est.solo?` (solo ${PARTES[est.solo].titulo.toLowerCase()})`:''}.</p><div class="row"><button class="btn area" data-go="${RAIZ}/${s.id}/hacer">▶ Retomar</button><button class="btn ghost" id="sm-descartar">Descartar</button></div></div>`
  :`<button class="btn ancho area" id="sm-empezar">Empezar el simulacro completo</button>
<h2>Solo una parte</h2><div class="row">${ps.map(p=>`<button class="btn ghost" data-solo="${p}">${PARTES[p].icono} Solo ${PARTES[p].titulo.toLowerCase()}</button>`).join('')}</div>`}</div>`},
    async alClic(t,ir){
      if(t.id==='sm-empezar'||t.dataset.solo){const ps=t.dataset.solo?[t.dataset.solo]:partesDe(s);
        escribir(s.id,{id:s.id,inicio:Date.now(),solo:t.dataset.solo||null,partes:ps,i:0,tarea:0,restante:Object.fromEntries(ps.map(p=>[p,s.minutos[p]*60])),datos:{}});
        ir(`${RAIZ}/${s.id}/hacer`);return true}
      if(t.id==='sm-descartar'){if(await confirmar({titulo:'¿Descartar el intento?',texto:'Se borran las respuestas de este intento en pausa.',si:'Descartar',no:'Cancelar',peligro:true})){escribir(s.id,null);document.dispatchEvent(new Event('repintar'))}return true}
    }};
}

/* ---------- el examen ---------- */
function vistaHacer(s){
  let est=null,reloj=null,habla=null,ultimoGuardado=0;
  const parte=()=>est.partes[est.i],datos=p=>est.datos[p]=est.datos[p]||{};
  const guardar=()=>escribir(s.id,est);
  const tareas=p=>p==='habla'?[]:s[p];
  function terminarParte(){
    callar();habla?.salir?.();habla=null;
    datos(parte()).terminada=true;
    if(est.i<est.partes.length-1){est.i++;est.tarea=0;guardar();document.dispatchEvent(new Event('repintar'));window.scrollTo(0,0);return}
    est.fin=Date.now();guardar();
    document.dispatchEvent(new CustomEvent('ir',{detail:{ruta:`${RAIZ}/${s.id}/resultado`,reemplazar:true}}));
  }
  function tic(){
    if(!est||document.visibilityState!=='visible')return;
    const p=parte();est.restante[p]-=1;
    const el=document.getElementById('sm-reloj');if(el){el.textContent=tiempo(est.restante[p]);el.classList.toggle('poco',est.restante[p]<=60)}
    if(Date.now()-ultimoGuardado>5000){ultimoGuardado=Date.now();guardar()}
    if(est.restante[p]<=0){aviso(`⏰ Se acabó el tiempo de ${PARTES[p].titulo.toLowerCase()}`);terminarParte()}
  }
  const pregHtml=(t,q,i)=>{const k=idPregunta(t,i),v=datos(parte()).resp?.[k];
    return `<li class="sim-pregunta"><p class="sim-enunciado">${esc(q.pregunta)}</p>${q.tipo==='opcion'?`<div class="opciones sim-opciones" role="radiogroup" aria-label="${esc(q.pregunta)}">${q.opciones.map((o,j)=>`<button type="button" class="opcion" role="radio" data-resp="${k}" data-valor="${j}" aria-checked="${+v===j}" aria-pressed="${v!==undefined&&+v===j}"><span class="letra" aria-hidden="true">${String.fromCharCode(65+j)}</span><span lang="en">${esc(o)}</span></button>`).join('')}</div>`
      :`<input class="respuesta-libre sim-input" data-resp="${k}" value="${esc(v||'')}" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(q.pregunta)}">`}</li>`};
  function tareaHtml(){
    const p=parte(),t=tareas(p)[est.tarea],d=datos(p);
    if(p==='escritura'){const tx=d.textos?.[t.id]||'',e=t.escena&&ESCENAS[t.escena];
      return `<p class="nota">${esc(t.consigna)}</p>${e?`<figure class="sim-escena">${e.svg}<figcaption><details><summary>Descripción de la imagen</summary>${esc(e.descripcion)}</details></figcaption></figure>`:''}
<label class="campo">Tu texto (${t.min}–${t.max} palabras)<textarea id="sm-texto" class="escrito" rows="10" lang="en" spellcheck="false" autocapitalize="sentences" data-tarea="${t.id}">${esc(tx)}</textarea></label><p class="nota" id="sm-cuenta" aria-live="polite">${contarPalabras(tx)} palabras</p>`}
    const audio=p==='escucha'?(()=>{const n=d.repros?.[t.id]||0;return `<div class="card escucha-audio"><p class="nota" style="margin-top:0">${soporte.hablar?`Puedes oírlo ${REPRODUCCIONES} veces. ${n?`Lo oíste ${n} ${n===1?'vez':'veces'}.`:''}`:'Tu navegador no puede leer en voz alta: aquí, como excepción, se muestra el texto.'}</p>
${soporte.hablar?`<button class="btn area" id="sm-oir"${n>=REPRODUCCIONES?' disabled':''}>🔊 ${n?'Oír otra vez':'Oír el audio'}</button>`:`<pre class="sim-texto" lang="en">${esc(transcripcion(t))}</pre>`}</div>`})():'';
    return `<p class="nota">${esc(t.consigna)}</p>${t.texto?`<pre class="sim-texto" lang="en">${esc(t.texto)}</pre>`:''}${audio}<ol class="sim-preguntas">${t.preguntas.map((q,i)=>pregHtml(t,q,i)).join('')}</ol>`;
  }
  return {titulo:s.titulo,inmersiva:true,
    alEntrar(){est=leer(s.id);if(!est)return;clearInterval(reloj);reloj=setInterval(tic,1000/factor())},
    alSalir(){clearInterval(reloj);callar();habla?.salir?.();if(est)guardar()},
    vista(){
      if(!est)return `<div class="area-estudio" style="padding:16px">${miga(esc(s.titulo))}<p>No hay un intento en curso.</p><button class="btn" data-go="${RAIZ}/${s.id}">Volver</button></div>`;
      const p=parte(),ts=tareas(p),ultima=p==='habla'||est.tarea>=ts.length-1;
      if(p==='habla'&&!habla)habla=crearHabla(s,datos('habla'),{guardar,alTerminar:()=>{terminarParte()}});
      return `<div class="sesion area-estudio sim-examen"><header class="sesion-cab sim-cab"><button type="button" class="btn ghost btn-chico" id="sm-pausa" aria-label="Pausar y salir">⏸ Pausar</button>
<span class="sim-parte">${PARTES[p].icono} ${PARTES[p].titulo}${p==='habla'?'':` · ${est.tarea+1}/${ts.length}`}</span><span class="cronometro sim-reloj" id="sm-reloj" aria-label="Tiempo restante">${tiempo(est.restante[p])}</span></header>
<div class="sesion-cuerpo">${barra(est.i+(p==='habla'?0:(est.tarea+1)/ts.length),est.partes.length)}<p class="nota sim-oficial">${AVISO_OFICIAL}</p>${p==='habla'?habla.vista():tareaHtml()}</div>
${p==='habla'?`<footer class="sesion-pie"><button class="btn ghost" id="sm-saltar-habla">Terminar habla</button></footer>`:`<footer class="sesion-pie">${est.tarea>0?'<button class="btn ghost" id="sm-ant">← Anterior</button>':''}<button class="btn" id="${ultima?'sm-fin-parte':'sm-sig'}">${ultima?(est.i<est.partes.length-1?'Terminar esta parte →':'Terminar el simulacro'):'Siguiente →'}</button></footer>`}</div>`;
    },
    alMostrar(){
      if(!est)return;
      habla?.alMostrar?.();
      document.querySelectorAll('#vista [data-resp]').forEach(inp=>{if(inp.tagName==='INPUT')inp.addEventListener('input',()=>{const d=datos(parte());d.resp={...(d.resp||{}),[inp.dataset.resp]:inp.value};guardar()})});
      const ta=document.getElementById('sm-texto');ta?.addEventListener('input',()=>{const d=datos('escritura');d.textos={...(d.textos||{}),[ta.dataset.tarea]:ta.value};const c=document.getElementById('sm-cuenta');if(c)c.textContent=`${contarPalabras(ta.value)} palabras`;guardar()});
    },
    async alClic(t,ir,repintar){
      if(!est)return;
      if(t.id==='sm-pausa'){callar();guardar();aviso('⏸ Simulacro en pausa: lo retomas cuando quieras.');ir(`${RAIZ}/${s.id}`);return true}
      if(t.dataset.resp!==undefined&&t.dataset.valor!==undefined){const d=datos(parte());d.resp={...(d.resp||{}),[t.dataset.resp]:+t.dataset.valor};guardar();
        document.querySelectorAll(`#vista [data-resp="${t.dataset.resp}"]`).forEach(b=>{const on=b===t;b.setAttribute('aria-pressed',on);b.setAttribute('aria-checked',on)});return true}
      if(t.id==='sm-oir'){const p=parte(),tt=tareas(p)[est.tarea],d=datos(p);d.repros={...(d.repros||{}),[tt.id]:(d.repros?.[tt.id]||0)+1};guardar();repintar();t.disabled=true;await hablarDialogo(tt.audio);return true}
      if(t.id==='sm-sig'){est.tarea++;guardar();repintar();window.scrollTo(0,0);return true}
      if(t.id==='sm-ant'){est.tarea--;guardar();repintar();window.scrollTo(0,0);return true}
      if(t.id==='sm-fin-parte'){terminarParte();return true}
      if(t.id==='sm-saltar-habla'){if(await confirmar({titulo:'¿Terminar la parte de habla?',texto:'Lo que no respondiste cuenta como 0.',si:'Terminar',no:'Seguir'})){datos('habla').terminada=true;terminarParte()}return true}
      if(habla){const r=await habla.alClic(t,repintar);if(r)return true}
    }};
}

/* ---------- resultado y revisión ---------- */
const ESQ_ESCRITURA={type:'object',properties:{criterios:{type:'array',items:{type:'object',properties:{criterio:{type:'string'},nota:{type:'integer',minimum:0,maximum:5},comentario:{type:'string'}},required:['criterio','nota','comentario']}},
  correcciones:{type:'array',items:{type:'object',properties:{original:{type:'string'},corregido:{type:'string'},por:{type:'string'}},required:['original','corregido','por']}},comentario:{type:'string'}},required:['criterios','correcciones','comentario']};
function vistaResultado(s){
  let est=null,revisando=null;
  function registrar(){
    if(est.registrado)return;
    const r=resultado(s,est);
    for(const p of ['lectura','uso','escucha'])if(est.partes.includes(p))for(const t of s[p])t.preguntas.forEach((q,i)=>{const ok=correcta(q,est.datos[p]?.resp?.[idPregunta(t,i)]);
      registrarEjercicio({materia:'ingles',ref:`ingles/m/${s.id}/${p}/${t.id}/${i}`,correcto:ok,xp:ok?5:0})});
    cambiarExtra('ingles',e=>{e.simulacros=[...(e.simulacros||[]),{id:s.id,fecha:hoy(),total:r.total,partes:r.partes,nivel:r.nivel.nivel,solo:est.solo||null}].slice(-60)});
    est.registrado=true;escribir(s.id,null);
  }
  const revPreguntas=p=>s[p].map(t=>`<div class="card sim-rev"><p class="etiqueta-actividad">${esc(t.consigna)}</p>${t.texto?`<pre class="sim-texto" lang="en">${esc(t.texto)}</pre>`:''}${t.audio?`<details open><summary>🎧 Texto del audio</summary><pre class="sim-texto" lang="en">${esc(transcripcion(t))}</pre></details>`:''}
<ol>${t.preguntas.map((q,i)=>{const d=est.datos[p]?.resp?.[idPregunta(t,i)],ok=correcta(q,d),dada=q.tipo==='opcion'?(d!==undefined?q.opciones[d]:''):d;
  return `<li class="${ok?'bien':'mal'}">${ok?'✅':'❌'} <span lang="en">${esc(q.pregunta)}</span><br>${ok?'':`<span class="nota">Tu respuesta: «${esc(dada||'—')}» · Correcta: <b lang="en">${esc(textoCorrecto(q))}</b></span><br>`}<span class="nota">${esc(q.regla)}</span></li>`}).join('')}</ol></div>`).join('');
  const revEscritura=()=>s.escritura.map(t=>{const tx=est.datos.escritura?.textos?.[t.id]||'',r=rubricaEscritura(t,tx),ia=est.datos.escritura?.ia?.[t.id];
    return `<div class="card sim-rev"><p class="etiqueta-actividad">${esc(t.consigna)}</p><p lang="en" style="white-space:pre-line">${esc(tx)||'<i>Sin texto</i>'}</p>
<p class="etiqueta-actividad">Rúbrica (sin IA): ${r.puntos} de ${r.total}</p><ul class="rubrica">${r.criterios.map(c=>`<li class="${c.ok?'bien':'mal'}">${c.ok?'✅':'⬜'} ${esc(c.texto)}${c.ok?'':`<br><span class="nota">${esc(c.ayuda||'')}</span>`}</li>`).join('')}</ul>
${ia?`<p class="etiqueta-actividad">✨ Con IA (0–5 por criterio)</p><ul class="rubrica">${ia.criterios.map(c=>`<li>${esc(c.criterio)}: <b>${c.nota}/5</b> <span class="nota">${esc(c.comentario)}</span></li>`).join('')}</ul>${ia.comentario?`<p>${esc(ia.comentario)}</p>`:''}${ia.correcciones?.length?`<ul>${ia.correcciones.map(c=>`<li><s lang="en">${esc(c.original)}</s> → <b lang="en">${esc(c.corregido)}</b> <span class="nota">${esc(c.por)}</span></li>`).join('')}</ul>`:''}`
  :tx.trim()&&iaDisponible()?`<button class="btn ghost" data-revisar-ia="${t.id}"${revisando===t.id?' disabled':''}>${revisando===t.id?'Revisando…':'✨ Revisar con IA (contenido, organización, lenguaje y logro)'}</button>`:''}
<details><summary>Ver un texto modelo</summary><p lang="en" style="white-space:pre-line">${esc(t.modelo)}</p></details></div>`}).join('');
  function revHabla(){const h=est.datos.habla||{},c=h.calificacion,crits=CRITERIOS_HABLA(s.nivel);
    if(c)return `<div class="sim-dos"><div class="card"><p class="etiqueta-actividad">✨ Calificación del examinador IA (0–5)</p><ul class="rubrica">${crits.map(([k,t])=>`<li>${esc(t)}: <b>${c.criterios[k]?.nota??'—'}/5</b><br><span class="nota">${esc(c.criterios[k]?.comentario||'')}</span></li>`).join('')}</ul><p class="nota">La pronunciación es una estimación hecha con el reconocimiento de voz.</p></div>
<div class="card"><p class="etiqueta-actividad">👍 Lo que hiciste bien</p><ul>${(c.bien||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
${c.errores?.length?`<p class="etiqueta-actividad">🛠️ A corregir</p><ul>${c.errores.slice(0,5).map(e=>`<li><s lang="en">${esc(e.original)}</s> → <b lang="en">${esc(e.corregida)}</b><br><span class="nota">${esc(e.por)}</span></li>`).join('')}</ul>`:''}
<p class="etiqueta-actividad">💬 Frases para la próxima vez</p><ul>${(c.frases||[]).map(f=>`<li><span lang="en">${esc(f.en)}</span> <span class="nota">${esc(f.es)}</span></li>`).join('')}</ul></div></div>`;
    if(h.autoeval)return `<div class="card"><p class="etiqueta-actividad">Tu autoevaluación (0–5)</p><ul class="rubrica">${crits.map(([k,t])=>`<li>${esc(t)}: <b>${h.autoeval[k]}/5</b></li>`).join('')}</ul></div>`;
    return '<p class="nota">No completaste la parte de habla.</p>'}
  return {titulo:`Resultado: ${s.titulo}`,
    alEntrar(){est=leer(s.id);if(est&&!est.registrado)registrar();if(!est){const h=historial().filter(x=>x.id===s.id).at(-1);this._h=h}},
    vista(){
      if(!est){const h=this._h;return `<div class="area-estudio">${miga(esc(s.titulo),'Resultado')}${h?`<h1>${pct(h.total)} %</h1><p>Nivel estimado: <b>${esc(h.nivel)}</b> (${h.fecha}).</p>`:'<p>No hay resultado.</p>'}<button class="btn" data-go="${RAIZ}/${s.id}">Volver al simulacro</button></div>`}
      const r=resultado(s,est);
      return `<div class="area-estudio">${miga(esc(s.titulo),'Resultado')}<h1>🏁 ${pct(r.total)} %</h1><p class="aviso-linea">⚠️ ${AVISO_OFICIAL}</p>
<div class="card"><p class="sim-nivel">${esc(r.nivel.texto)}</p>${Object.entries(r.partes).map(([p,v])=>`<div class="mp-prep"><span>${PARTES[p].icono} ${PARTES[p].titulo}</span>${barra(pct(v),100)}<span class="nota">${pct(v)} %</span></div>`).join('')}
${r.debil&&r.partes[r.debil]<0.85?`<p style="margin-bottom:0">Lo que más te cuesta: <b>${PARTES[r.debil].titulo.toLowerCase()}</b>.</p><button class="btn area" data-go="${practicarParte(s.nivel,r.debil)}">🎯 Practicar esto</button>`:''}
<p class="nota">Las preguntas que fallaste ya están en Repasar.</p></div>
<h2>Revisión</h2>${est.partes.map(p=>`<h3>${PARTES[p].icono} ${PARTES[p].titulo}</h3>${p==='escritura'?revEscritura():p==='habla'?revHabla():revPreguntas(p)}`).join('')}
<div class="row" style="margin-top:16px"><button class="btn ghost" data-go="${RAIZ}">Otros simulacros</button><button class="btn ghost" data-go="${RAIZ}/${s.id}">Repetir</button></div></div>`},
    async alClic(t,ir,repintar){
      if(t.dataset.revisarIa&&est){const tid=t.dataset.revisarIa,tarea=s.escritura.find(x=>x.id===tid),tx=est.datos.escritura?.textos?.[tid]||'';revisando=tid;repintar();
        try{const r=await pedir({nivel:'texto',maxTokens:1500,esquemaJSON:ESQ_ESCRITURA,
          sistema:`You are an English writing examiner for a practice test inspired by Cambridge, level ${s.nivel} (NOT an official exam). Grade the text from 0 to 5 on exactly these criteria: ${CRITERIOS_ESCRITURA.map(([,t])=>t).join(', ')} (Content, Organisation, Language, Communicative achievement), using level ${s.nivel} expectations. Comments in Spanish, short and concrete. Up to 6 corrections (original → corrected English) with a short Spanish reason.`,
          mensajes:[{role:'user',content:`Task: ${tarea.consigna}\nWord range: ${tarea.min}-${tarea.max}\n\nText:\n${tx}`}]});
          est.datos.escritura.ia={...(est.datos.escritura.ia||{}),[tid]:r};
          // la calificación con IA reemplaza a la de la rúbrica en el puntaje de escritura del historial
          cambiarExtra('ingles',e=>{const h=(e.simulacros||[]).filter(x=>x.id===s.id).at(-1);if(h){const rr=resultado(s,est);h.total=rr.total;h.partes=rr.partes;h.nivel=rr.nivel.nivel}});
        }catch(e){aviso(e.message||'No se pudo revisar con IA.',4000)}
        revisando=null;repintar();return true}
    }};
}

// Subrutas de la sección
export function ruta(resto){
  const [a,b]=resto;
  if(a==='prueba-nivel')return {ruta:`${RAIZ}/prueba-nivel`,v:vistaPruebaNivel()};
  const s=simulacro(a);
  if(!s)return {ruta:RAIZ,v:portada};
  if(b==='hacer')return {ruta:`${RAIZ}/${s.id}/hacer`,v:vistaHacer(s)};
  if(b==='resultado')return {ruta:`${RAIZ}/${s.id}/resultado`,v:vistaResultado(s)};
  return {ruta:`${RAIZ}/${s.id}`,v:vistaSimulacro(s)};
}
export const vista=()=>portada.vista();
// Repaso: m/<simulacro>/<parte>/<tarea>/<pregunta>
export function ejercicioSimulacro(partes){
  const [id,p,tid,i]=partes,s=simulacro(id),t=s?.[p]?.find(x=>x.id===tid),q=t?.preguntas[+i];if(!q)return null;
  const contexto=t.texto?`<pre class="sim-texto" lang="en">${esc(t.texto)}</pre>`:'';
  return {titulo:`🏁 ${s.titulo}`,ej:{...q,pregunta:`${contexto}${esc(q.pregunta)}`,oir:t.audio?t.audio.map(x=>x[1]).join(' '):undefined}};
}
