/* 📚 Práctica por nivel (rutas bajo #estudio/ingles/hablar/nivel):
   <A1|A2|B1|B2>                       el nivel: lecturas, escuchas, diálogos, vocabulario y escritura con su avance
   <N>/lectura/<id> · <N>/escucha/<id> texto (o audio) y preguntas escritas; con el 80 % queda hecho
   <N>/vocabulario[/<tema>]            palabras con audio y ejemplo; «Practicar 10» (del español al inglés, al repaso si fallas)
   <N>/escritura/<id>                  tarea guiada: se escribe, se revisa con la rúbrica (sin IA) y, si hay IA, con IA
   Lo hecho se guarda en materias.ingles.extra.nivel[<id>] = fecha (lecturas, escuchas y escritura) y
   extra.vocab[<N>/<tema>] = palabras acertadas. */
import {esc} from '../../../utilidades.js';
import {soporte,htmlOir,hablar} from '../../../nucleo/voz.js';
import {deBanco} from '../../../nucleo/ejercicios.js';
import {crearSesion} from '../../../nucleo/sesion.js';
import {registrarEjercicio,cambiarExtra,progreso,datosMateria,hoy} from '../../../nucleo/progreso.js';
import {barra,aviso} from '../../../nucleo/ui.js';
import {htmlCierre} from '../../../nucleo/cierre.js';
import {iaDisponible,pedir} from '../../../nucleo/ia.js';
import {coincide} from '../../../nucleo/comparar.js';
import {NIVELES,palabrasDe,totalPalabras,revisarEscrito,contarPalabras,textoPorId} from './datos.js';
import {DIALOGOS} from '../hablar/dialogos.js';

const RAIZ='estudio/ingles/hablar/nivel';
const extra=(p=progreso())=>datosMateria(p,'ingles').extra;
const hecho=id=>!!extra().nivel?.[id];
const marcar=id=>cambiarExtra('ingles',e=>{e.nivel={...(e.nivel||{}),[id]:e.nivel?.[id]||hoy()}});
const miga=(n,...resto)=>`<p class="miga"><button class="enlace" data-go="estudio/ingles/hablar">Hablar</button> › ${resto.length?`<button class="enlace" data-go="${RAIZ}/${n}">Nivel ${n}</button> › ${resto.join(' › ')}`:`Nivel ${n}`}</p>`;
const mezclar=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const dialogosDe=n=>DIALOGOS.filter(d=>d.nivel===n);

/* ---------- página del nivel ---------- */
function vistaNivel(n){
  const d=NIVELES[n];
  return {titulo:`Inglés ${n}`,vista(){
    const x=extra(),dl=x.dialogos||{},ds=dialogosDe(n),voc=x.vocab||{};
    const lista=(tipo,icono,xs)=>`<div class="lista-nav">${xs.map(t=>`<button class="tarjeta-nav" data-go="${RAIZ}/${n}/${tipo}/${t.id}"><span class="icono" aria-hidden="true">${hecho(t.id)?'✅':icono}</span><span class="texto"><span class="titulo">${esc(t.titulo)}</span><span class="desc">${esc(t.tipoTexto||t.resumen||'')}${t.texto?` · ${contarPalabras(t.texto)} palabras`:''}</span></span></button>`).join('')}</div>`;
    const cuenta=xs=>`${xs.filter(t=>hecho(t.id)).length}/${xs.length}`;
    const aprendidas=d.vocabulario.reduce((s,t,i)=>s+Math.min(palabrasDe(t).length,(voc[`${n}/${i}`]||[]).length),0);
    return `<div class="area-estudio">${miga(n)}<h1>📚 Inglés ${n}: práctica del nivel</h1>
<p class="intro">Lo que acompaña a tus unidades: textos para leer, audios para entender, conversaciones guiadas, vocabulario con audio y escritura con rúbrica.</p>
<div class="prog-grid">${[['📖',cuenta(d.lecturas),'Lecturas'],['🎧',cuenta(d.escuchas),'Escuchas'],['💬',`${ds.filter(x=>dl[x.id]).length}/${ds.length}`,'Diálogos'],['🔤',`${aprendidas}/${totalPalabras(n)}`,'Palabras'],['✍️',cuenta(d.escritura),'Escritura']].map(([i,v,k])=>`<div class="estadistica"><b>${i} ${v}</b><span>${k}</span></div>`).join('')}</div>
<h2>📖 Lecturas graduadas</h2>${lista('lectura','📖',d.lecturas)}
<h2>🎧 Escuchas</h2>${lista('escucha','🎧',d.escuchas)}
<h2>💬 Diálogos guiados</h2><div class="lista-nav">${ds.map(x=>`<button class="tarjeta-nav" data-go="estudio/ingles/hablar/dialogo/${x.id}"><span class="icono" aria-hidden="true">${dl[x.id]?'✅':'💬'}</span><span class="texto"><span class="titulo">${esc(x.titulo)}</span><span class="desc">${esc(x.escena)}</span></span></button>`).join('')}</div>
<h2>🔤 Vocabulario</h2><button class="btn ancho area" data-go="${RAIZ}/${n}/vocabulario">Ver las ${totalPalabras(n)} palabras y expresiones</button>
<h2>✍️ Escritura guiada</h2>${lista('escritura','✍️',d.escritura)}</div>`}};
}

/* ---------- lectura y escucha: texto (o audio) y preguntas ---------- */
function vistaTexto(n,tipo,t){
  let ses=null;const esEscucha=tipo==='escucha',k=t.preguntas.length;
  function empezar(){
    const fallos=[];
    ses=crearSesion({titulo:t.titulo,tono:'estudio',salir:`${RAIZ}/${n}/${tipo}/${t.id}`,sinPistas:true,materia:'ingles',
      total:()=>k,
      siguiente:st=>st.i<k?{...deBanco(t.preguntas[st.i]),materia:'ingles',lang:'en',oir:esEscucha&&soporte.hablar?t.texto:'',
        enunciado:`${esEscucha?'':`<details class="transcripcion"><summary>Ver el texto</summary><p lang="en">${esc(t.texto)}</p></details>`}${t.preguntas[st.i].pregunta}`,k:st.i}:null,
      responder(p,r){if(!r.correcto)fallos.push(p.regla);registrarEjercicio({materia:'ingles',ref:`ingles/n/${t.id}/${p.k}`,correcto:r.correcto});return {xp:r.correcto?10:0,nota:r.correcto?'':'Volverá en Repasar.'}},
      fin(st){const pasa=st.ok/k>=0.8;if(pasa)marcar(t.id);
        return `<span class="fin-icono" aria-hidden="true">${pasa?(esEscucha?'🎧':'📖'):'🔁'}</span><h1>${pasa?'¡Lo entendiste!':'Vuelve a intentarlo'}</h1>
<p class="nota">${st.ok} de ${k} respuestas bien${pasa?'':' · necesitas el 80 %'}</p>
${esEscucha?`<details class="transcripcion" open><summary>Texto del audio</summary><p lang="en">${esc(t.texto)}</p>${htmlOir(t.texto)}</details>`:''}
<button class="btn ancho" data-go="${RAIZ}/${n}">Volver al nivel ${n}</button>
${htmlCierre({xp:st.xp,aprendido:fallos.length?fallos:t.preguntas.slice(0,2).map(x=>x.regla),excluir:location.hash.slice(1)})}`}});
    ses.alEntrar();
  }
  return {titulo:t.titulo,get inmersiva(){return !!ses},
    alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const cuerpo=esEscucha?(soporte.hablar?`<div class="card escucha-audio"><p class="nota">Escúchalo primero sin leer. Usa 🐢 si hace falta; el texto aparece al final.</p><div class="row centro">${htmlOir(t.texto)}</div></div>`
          :`<div class="card"><p class="nota">Tu navegador no puede leer en voz alta: lee el texto.</p><p lang="en">${esc(t.texto)}</p></div>`)
        :`<article class="lector lec-graduada" lang="en">${t.texto.split(/\n\s*\n/).map(p=>`<p>${esc(p.trim()).replace(/\n/g,'<br>')}</p>`).join('')}</article>${soporte.hablar?`<div class="row" style="margin-top:8px">${htmlOir(t.texto)}</div>`:''}`;
      return `<div class="area-estudio">${miga(n,esEscucha?'Escucha':'Lectura')}<h1>${esEscucha?'🎧':'📖'} ${esc(t.titulo)}</h1>${t.tipoTexto?`<p class="nota">${esc(t.tipoTexto)}${hecho(t.id)?' · ✅ hecho':''}</p>`:''}
${cuerpo}<div style="margin-top:20px"><button class="btn ancho area" id="nv-empezar">Responder ${k} preguntas</button></div></div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(b,ir,repintar){if(ses)return ses.alClic(b,ir,repintar);if(b.id==='nv-empezar'){empezar();repintar();window.scrollTo(0,0);return true}}};
}

/* ---------- vocabulario ---------- */
// Pregunta de vocabulario: del español al inglés (producción); el ejemplo con audio se ve al responder
export function preguntaVocab(n,ti,i){
  const t=NIVELES[n]?.vocabulario[ti],w=t&&palabrasDe(t)[i];if(!w)return null;
  const variantes=[w.en,w.en.replace(/^(to|a|an|the) /i,''),...w.en.split('/').map(x=>x.trim())].filter(Boolean);
  return {tipo:'escribir',enunciado:`¿Cómo se dice <b>«${esc(w.es)}»</b> en inglés?<br><span class="nota">${esc(t.tema)}</span>`,respuesta:esc(w.en),aceptadas:variantes,
    verificar:e=>coincide(e,variantes),errores:[],regla:`Ejemplo: <span lang="en">${esc(w.ej)}</span>`,explicacion:`<span lang="en">${esc(w.ej)}</span>`,
    lang:'en',materia:'ingles',tolera:false,vocab:`${n}/${ti}/${i}`,frase:w.en};
}
function vistaVocabulario(n,ti){
  const d=NIVELES[n];let ses=null;
  function practicar(){
    const t=d.vocabulario[ti],vistas=new Set(extra().vocab?.[`${n}/${ti}`]||[]);
    // primero las que todavía no aciertas
    const orden=[...mezclar(palabrasDe(t).map((_,i)=>i).filter(i=>!vistas.has(i))),...mezclar([...vistas])].slice(0,10);
    ses=crearSesion({titulo:`Vocabulario: ${t.tema}`,tono:'estudio',salir:`${RAIZ}/${n}/vocabulario/${ti}`,sinPistas:true,materia:'ingles',
      total:()=>orden.length,siguiente:st=>st.i<orden.length?{...preguntaVocab(n,ti,orden[st.i]),k:orden[st.i]}:null,
      responder(p,r){if(soporte.hablar)hablar(p.frase,{idioma:'en-US'});
        if(r.correcto)cambiarExtra('ingles',e=>{e.vocab={...(e.vocab||{})};const s=new Set(e.vocab[`${n}/${ti}`]||[]);s.add(p.k);e.vocab[`${n}/${ti}`]=[...s]});
        registrarEjercicio({materia:'ingles',ref:`ingles/v/${n}/${ti}/${p.k}`,correcto:r.correcto});return {xp:r.correcto?10:0,nota:r.correcto?'':'Volverá en Repasar.'}},
      fin:st=>`<span class="fin-icono" aria-hidden="true">🔤</span><h1>${st.ok} de ${orden.length}</h1><p class="nota">Las que fallaste vuelven en Repasar.</p>
<button class="btn ancho" id="vc-otra">Otras 10</button><button class="btn ghost ancho" data-go="${RAIZ}/${n}/vocabulario">Otros temas</button>${htmlCierre({xp:st.xp,excluir:location.hash.slice(1)})}`});
    ses.alEntrar();
  }
  return {titulo:'Vocabulario',get inmersiva(){return !!ses},alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const voc=extra().vocab||{};
      if(ti===null)return `<div class="area-estudio">${miga(n,'Vocabulario')}<h1>🔤 Vocabulario ${n}</h1><p class="intro">${totalPalabras(n)} palabras y expresiones por tema, cada una con un ejemplo. Toca 🔊 para oírla; «Practicar» te pide escribirla en inglés.</p>
<div class="lista-nav">${d.vocabulario.map((t,i)=>{const tot=palabrasDe(t).length,ok=Math.min(tot,(voc[`${n}/${i}`]||[]).length);
  return `<button class="tarjeta-nav" data-go="${RAIZ}/${n}/vocabulario/${i}"><span class="icono" aria-hidden="true">${t.icono||'🔤'}</span><span class="texto"><span class="titulo">${esc(t.tema)}</span><span class="desc">${ok}/${tot} acertadas</span>${barra(ok,tot)}</span></button>`}).join('')}</div></div>`;
      const t=d.vocabulario[ti],ws=palabrasDe(t),ya=new Set(voc[`${n}/${ti}`]||[]);
      return `<div class="area-estudio">${miga(n,`<button class="enlace" data-go="${RAIZ}/${n}/vocabulario">Vocabulario</button>`,esc(t.tema))}<h1>${t.icono||'🔤'} ${esc(t.tema)}</h1>
<button class="btn ancho area" id="vc-practicar">🎯 Practicar 10</button>
<ul class="vocab-lista">${ws.map((w,i)=>`<li><div class="vocab-fila"><b lang="en">${esc(w.en)}</b>${ya.has(i)?' <span aria-label="acertada">✅</span>':''}<span class="nota">${esc(w.es)}</span>${soporte.hablar?`<button type="button" class="btn-icono" data-decir="${esc(w.en)}" aria-label="Escuchar ${esc(w.en)}">🔊</button>`:''}</div><p class="nota vocab-ej" lang="en">${esc(w.ej)}${soporte.hablar?` <button type="button" class="enlace" data-decir="${esc(w.ej)}" aria-label="Escuchar el ejemplo">🔊</button>`:''}</p></li>`).join('')}</ul></div>`;
    },
    alMostrar(){ses?.alMostrar()},
    async alClic(b,ir,repintar){
      if(b.id==='vc-practicar'||b.id==='vc-otra'){ses=null;practicar();repintar();window.scrollTo(0,0);return true}
      if(ses)return ses.alClic(b,ir,repintar);
      if(b.dataset.decir!==undefined)return true;   // main.js ya lo lee en voz alta
    }};
}

/* ---------- escritura guiada con rúbrica ---------- */
const ESQUEMA_IA={type:'object',properties:{criterios:{type:'array',items:{type:'object',properties:{criterio:{type:'string'},ok:{type:'boolean'},comentario:{type:'string'}},required:['criterio','ok','comentario']}},
  correcciones:{type:'array',items:{type:'object',properties:{original:{type:'string'},corregido:{type:'string'},por:{type:'string'}},required:['original','corregido','por']}},
  nivel:{type:'string'},comentario:{type:'string'}},required:['criterios','correcciones','comentario']};
function vistaEscritura(n,t){
  let texto='',rev=null,ia=null,pidiendo=false;
  const borrador=()=>{try{return JSON.parse(localStorage.getItem('ciberlab-escritura')||'{}')[t.id]||''}catch(e){return ''}};
  const guardar=v=>{try{const g=JSON.parse(localStorage.getItem('ciberlab-escritura')||'{}');g[t.id]=v;localStorage.setItem('ciberlab-escritura',JSON.stringify(g))}catch(e){}};
  return {titulo:t.titulo,
    alEntrar(){texto=borrador();rev=null;ia=null},
    vista(){
      const n2=contarPalabras(texto);
      return `<div class="area-estudio">${miga(n,'Escritura')}<h1>✍️ ${esc(t.titulo)}</h1>${hecho(t.id)?'<p class="nota">✅ Ya cumpliste la rúbrica de esta tarea.</p>':''}
<div class="card"><p style="margin-top:0">${t.consigna}</p><p class="nota" style="margin:0">Entre ${t.min} y ${t.max} palabras.</p></div>
<details class="como-se-usa"><summary>📋 La rúbrica (qué se revisa)</summary><ul><li>Entre ${t.min} y ${t.max} palabras</li>${t.criterios.map(c=>`<li>${esc(c.texto)}</li>`).join('')}</ul></details>
<label class="campo">Tu texto<textarea id="es-texto" class="escrito" rows="9" lang="en" spellcheck="true" autocapitalize="sentences" placeholder="Escribe aquí en inglés…">${esc(texto)}</textarea></label>
<p class="nota" id="es-cuenta" aria-live="polite">${n2} palabras</p>
<div class="row"><button class="btn area" id="es-revisar">✅ Revisar con la rúbrica</button>${iaDisponible()?`<button class="btn ghost" id="es-ia"${pidiendo?' disabled':''}>${pidiendo?'Revisando…':'✨ Revisar con IA'}</button>`:''}</div>
${rev?`<div class="card" style="margin-top:16px"><p class="etiqueta-actividad">Rúbrica: ${rev.puntos} de ${rev.total}</p><ul class="rubrica">${rev.criterios.map(c=>`<li class="${c.ok?'bien':'mal'}"><span aria-hidden="true">${c.ok?'✅':'⬜'}</span> ${esc(c.texto)}${c.ok?'':`<br><span class="nota">${esc(c.ayuda||'')}</span>`}</li>`).join('')}</ul>
${rev.puntos===rev.total?'<p><b>¡Cumple toda la rúbrica!</b> Compáralo con el modelo para ver otras formas de decirlo.</p>':'<p class="nota">Corrige lo que falta y vuelve a revisar.</p>'}
<details><summary>Ver un texto modelo</summary><p lang="en" style="white-space:pre-line">${esc(t.modelo)}</p></details></div>`:''}
${ia?`<div class="card ia-explica" style="margin-top:16px"><p class="ia-etiqueta">✨ Revisión con IA: tómala como sugerencia.</p>${ia.comentario?`<p>${esc(ia.comentario)}</p>`:''}
${(ia.correcciones||[]).length?`<ul>${ia.correcciones.map(c=>`<li><s lang="en">${esc(c.original)}</s> → <b lang="en">${esc(c.corregido)}</b><br><span class="nota">${esc(c.por)}</span></li>`).join('')}</ul>`:'<p>No encontré errores de gramática.</p>'}
${(ia.criterios||[]).length?`<ul class="rubrica">${ia.criterios.map(c=>`<li class="${c.ok?'bien':'mal'}">${c.ok?'✅':'⬜'} ${esc(c.criterio)}: <span class="nota">${esc(c.comentario)}</span></li>`).join('')}</ul>`:''}</div>`:''}</div>`;
    },
    alMostrar(){const ta=document.getElementById('es-texto');ta?.addEventListener('input',()=>{texto=ta.value;guardar(texto);const c=document.getElementById('es-cuenta');if(c)c.textContent=`${contarPalabras(texto)} palabras`})},
    async alClic(b,ir,repintar){
      if(b.id==='es-revisar'){if(!texto.trim()){aviso('Primero escribe tu texto.');return true}
        rev=revisarEscrito(t,texto);registrarEjercicio({materia:'ingles',correcto:rev.puntos===rev.total,repasar:false,xp:rev.puntos===rev.total&&!hecho(t.id)?20:0});
        if(rev.puntos===rev.total)marcar(t.id);repintar();document.querySelector('.rubrica')?.scrollIntoView({block:'nearest'});return true}
      if(b.id==='es-ia'){if(!texto.trim()){aviso('Primero escribe tu texto.');return true}
        pidiendo=true;repintar();
        try{ia=await pedir({nivel:'texto',maxTokens:1500,esquemaJSON:ESQUEMA_IA,
          sistema:`Eres profesor de inglés para hispanohablantes de Latinoamérica, nivel ${n} del MCER. Revisas un texto escrito por un estudiante con esta rúbrica: ${['Entre '+t.min+' y '+t.max+' palabras',...t.criterios.map(c=>c.texto)].join('; ')}. Además corriges errores de gramática, vocabulario y ortografía (máximo 6, los más importantes). Escribe comentarios y explicaciones en español, cortos y amables; las correcciones en inglés.`,
          mensajes:[{role:'user',content:`Tarea: ${t.consigna.replace(/<[^>]+>/g,'')}\n\nTexto del estudiante:\n${texto}`}]})}
        catch(e){aviso(e.message||'No se pudo revisar con IA.')}
        pidiendo=false;repintar();return true}
    }};
}

// Subrutas de «nivel»
export function rutaNivel(resto){
  const [n,tipo,id]=resto,d=NIVELES[n];
  if(!d)return null;
  if(tipo==='lectura'||tipo==='escucha'){const t=d[tipo==='lectura'?'lecturas':'escuchas'].find(x=>x.id===id);if(t)return {ruta:`${RAIZ}/${n}/${tipo}/${id}`,v:vistaTexto(n,tipo,t)}}
  if(tipo==='vocabulario'){const i=id!==undefined&&d.vocabulario[+id]?+id:null;return {ruta:`${RAIZ}/${n}/vocabulario${i===null?'':`/${i}`}`,v:vistaVocabulario(n,i)}}
  if(tipo==='escritura'){const t=d.escritura.find(x=>x.id===id);if(t)return {ruta:`${RAIZ}/${n}/escritura/${id}`,v:vistaEscritura(n,t)}}
  return {ruta:`${RAIZ}/${n}`,v:vistaNivel(n)};
}
// Repaso: n/<id>/<pregunta> (lecturas y escuchas) y v/<nivel>/<tema>/<palabra>
export function ejercicioNivel(tipo,partes){
  if(tipo==='n'){const t=textoPorId(partes[0]),x=t?.preguntas[+partes[1]];
    return x&&{titulo:`${t.tipo==='escuchas'?'Escucha':'Lectura'}: ${t.titulo}`,ej:{...x,pregunta:`${t.tipo==='escuchas'?'':`<details class="transcripcion"><summary>Ver el texto</summary><p lang="en">${esc(t.texto)}</p></details>`}${x.pregunta}`,oir:t.tipo==='escuchas'?t.texto:undefined}}}
  if(tipo==='v'){const p=preguntaVocab(partes[0],+partes[1],+partes[2]);return p&&{titulo:'Vocabulario',ej:{tipo:'completar',pregunta:p.enunciado,respuestas:p.aceptadas,regla:p.regla}}}
  return null;
}
// Tarjetas del nivel para la portada de Hablar
export const htmlNiveles=()=>`<div class="lista-nav">${Object.entries(NIVELES).map(([n,d])=>`<button class="tarjeta-nav" data-go="${RAIZ}/${n}"><span class="icono" aria-hidden="true">${n}</span><span class="texto"><span class="titulo">Práctica ${n}</span><span class="desc">${d.lecturas.length} lecturas · ${d.escuchas.length} escuchas · ${dialogosDe(n).length} diálogos · ${totalPalabras(n)} palabras · ${d.escritura.length} escritos</span></span></button>`).join('')}</div>`;
