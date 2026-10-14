/* Sección "🎙️ Hablar" de Inglés. Rutas (bajo #estudio/ingles/hablar):
   (vacía)              portada: pronunciación por sonido, frases útiles, diálogos guiados, conversación con IA
   sonido/<id>          pares mínimos y frases de un sonido difícil
   frases/<A1|A2>       frases útiles del nivel
   dialogo/<id>         diálogo guiado
   ia                   conversación libre con Claude
   u/<id>[/escucha|frases|fluidez]  unidad y sus pasos · jefe/<id>  tarea final */
import {esc} from '../../../utilidades.js';
import {soporte,AVISO_SIN_RECONOCIMIENTO} from '../../../nucleo/voz.js';
import {progreso,datosMateria} from '../../../nucleo/progreso.js';
import {SONIDOS,sonido} from '../errores-pronunciacion.js';
import {DIALOGOS,dialogo} from './dialogos.js';
import {FRASES} from './frases.js';
import {sesionPronunciacion,itemsElegir} from './practica.js';
import {vistaDialogo} from './dialogo.js';
import {vistaIA} from './ia.js';
import {leerAjustes} from './claude.js';
import {nivelIngles} from './nivel.js';
import {misionHabla,MISION} from '../../../nucleo/progreso.js';
import {barra,intro} from '../../../nucleo/ui.js';
import {cargarLecciones} from '../../../nucleo/cargar.js';
import {UNIDADES,NIVELES_MCER,unidad,estadoUnidades,unidadActual} from './unidades.js';
import {MEDALLAS,comboActual,sonidoActivo,alternarSonido,vencerJefe} from './juego.js';
import {CONTENIDO} from './contenido.js';
import {vistaEscucha,vistaFluidez,marcarPaso} from './pasos.js';

const RAIZ='estudio/ingles/hablar';
// Títulos de las lecciones de forma (para los pasos de cada unidad)
const TITULOS=Object.fromEntries(cargarLecciones(import.meta.glob('../temas/*/*.js',{eager:true})).map(l=>[l.id,l.titulo]));
const pct=x=>Math.round(x*100);
// Acierto reciente por sonido (últimos 20 intentos)
export function fuerzaSonidos(p=progreso()){
  const s=datosMateria(p,'ingles').extra.sonidos||{};
  return Object.fromEntries(Object.entries(s).filter(([,v])=>v.ult?.length).map(([id,v])=>[id,{prom:v.ult.reduce((a,b)=>a+b,0)/v.ult.length,n:v.n}]));
}

// Misión diaria de habla: frases en voz alta o una conversación de 5 turnos
export function htmlMision(p=progreso()){
  const m=misionHabla(p);
  return `<div class="card mision${m.cumplida?' cumplida':''}"><div class="mision-cab"><b>🎯 Misión de hoy</b>${m.cumplida?'<span class="tag on">✓ Cumplida</span>':''}</div>
<div class="mision-opciones"><div><span class="nota">Di ${MISION.frases} frases en voz alta</span><b>${Math.min(m.frases,MISION.frases)}/${MISION.frases}</b>${barra(m.frases,MISION.frases)}</div>
<div><span class="nota">o 1 conversación de ${MISION.turnos} turnos</span><b>${Math.min(m.conv,MISION.turnos)}/${MISION.turnos}</b>${barra(m.conv,MISION.turnos)}</div></div>
<p class="nota" style="margin:6px 0 0">Cuenta como meta diaria y suma a tu racha.</p></div>`;
}
// Mapa MCER: una fila por nivel con sus unidades como chips (ícono de estado al lado del texto, nunca encima)
export function htmlMapa(p=progreso()){
  const e=estadoUnidades(p),actual=unidadActual(p);
  return `<div class="mapa">${NIVELES_MCER.map(n=>{const us=UNIDADES.filter(u=>u.nivel===n);
    return `<div class="mapa-nivel"><span class="mapa-etiqueta">${n}</span><div class="mapa-unidades">${us.length?us.map(u=>{const s=e[u.id],k=UNIDADES.indexOf(u)+1;
      return `<button class="mapa-unidad ${s}${u===actual?' aqui':''}" data-go="${RAIZ}/u/${u.id}" aria-label="Unidad ${k}: ${esc(u.titulo)} (${s==='completa'?'dominada':s==='actual'?'actual':'bloqueada'})"><span class="mapa-estado" aria-hidden="true">${s==='completa'?'✓':s==='bloqueada'?'🔒':k}</span><span class="mapa-texto">${esc(u.titulo)}</span></button>`}).join('')
      :'<span class="mapa-proximo">Próximamente</span>'}</div></div>`}).join('')}</div>`;
}
export const htmlMedallas=(p=progreso())=>{const ya=datosMateria(p,'ingles').extra.medallas||{};
  return `<div class="medallas">${MEDALLAS.map(m=>`<span class="medalla${ya[m.id]?' ganada':''}" title="${esc(m.desc)}"><span class="medalla-icono">${ya[m.id]?m.icono:'🔒'}</span>${m.nombre}</span>`).join('')}</div>`};

const portada={
  titulo:'Hablar',
  vista(){
    const p=progreso(),f=fuerzaSonidos(p),dl=datosMateria(p,'ingles').extra.dialogos||{},clave=!!leerAjustes().clave,act=unidadActual(p),combo=comboActual();
    return `
<div class="hablar-cab"><h1>🎙️ Hablar</h1><button class="btn ghost btn-chico" id="hb-sonido" type="button" aria-pressed="${sonidoActivo()}">${sonidoActivo()?'🔊 Sonidos':'🔇 Sin sonidos'}</button></div>
${intro(`Hablar en voz alta es lo que más rápido te hace avanzar. Tu nivel: <b>${nivelIngles(p)}</b>${combo>=3?` · 🔥 combo ${combo}`:''}.`,['Cumple la misión del día: 20 frases o una conversación de 5 turnos.','Sigue tu unidad: escucha, frases, diálogos, fluidez y el jefe.','Toca el micrófono, habla y mira qué palabras salieron bien.','Sin micrófono también puedes responder escribiendo.'])}
${soporte.escuchar?'':`<div class="card aviso"><p style="margin:0">⚠️ ${AVISO_SIN_RECONOCIMIENTO}</p></div>`}
${htmlMision(p)}
<h2>Tu mapa</h2>${htmlMapa(p)}
${act?`<button class="card destacado" data-go="${RAIZ}/u/${act.id}"><span class="destacado-titulo">Unidad ${UNIDADES.indexOf(act)+1}: ${esc(act.titulo)}</span><span class="nota">${esc(act.tarea)}</span></button>`:''}
<h2>Medallas</h2>${htmlMedallas(p)}
<h2>Diálogos guiados</h2><p class="nota">Situaciones reales. Funcionan sin internet${soporte.escuchar?' (el reconocimiento de voz de Chrome sí necesita conexión)':''}.</p>
<div class="grid">${DIALOGOS.map(d=>{const x=dl[d.id];return `<div class="card click" data-go="${RAIZ}/dialogo/${d.id}" tabindex="0"><div class="progress">${d.nivel}${x?` · mejor ${pct(x.mejor)}%`:''}</div><h3 style="margin:4px 0">${d.titulo}</h3><p class="nota" style="margin:0">${d.escena}</p></div>`}).join('')}</div>
<h2>Conversación libre con IA</h2>
<div class="card click" data-go="${RAIZ}/ia" tabindex="0"><h3>🤖 Habla con un tutor IA</h3><p class="nota" style="margin:0">Conversa sobre lo que quieras; te corrige en español y te propone frases más naturales. ${clave?'Clave configurada ✓':'Necesita tu API key de Anthropic.'}</p></div>
<h2>Frases útiles</h2>
<div class="row">${Object.keys(FRASES).map(n=>`<button class="btn ghost" data-go="${RAIZ}/frases/${n}">Frases ${n}</button>`).join('')}</div>
<h2>Pronunciación: sonidos difíciles</h2><p class="nota">Pares mínimos y frases para los errores típicos de hispanohablantes.</p>
<div class="grid sonidos">${SONIDOS.map(s=>{const x=f[s.id];return `<div class="card click" data-go="${RAIZ}/sonido/${s.id}" tabindex="0"><h3 style="margin:0 0 4px">${s.nombre}</h3>
${x?`<span class="tag ${x.prom>=0.8?'on':'warn-tag'}">${pct(x.prom)}% reciente</span>`:'<span class="tag">Sin practicar</span>'}</div>`}).join('')}</div>`;
  },
  alClic(t,ir,repintar){if(t.id==='hb-sonido'){alternarSonido();repintar();return true}}
};

// Página de una unidad: forma, pronunciación, diálogos y el jefe (tarea final)
function vistaUnidad(u){
  return {titulo:u.titulo,vista(){
    const p=progreso(),e=estadoUnidades(p)[u.id],d=datosMateria(p,'ingles'),s=sonido(u.sonido),k=UNIDADES.indexOf(u)+1,dl=d.extra.dialogos||{};
    if(e==='bloqueada')return `<p class="miga"><button class="enlace" data-go="${RAIZ}">Hablar</button> › Unidad ${k}</p><h1>🔒 ${u.titulo}</h1>
<div class="card"><p>Esta unidad se abre al vencer al jefe de la unidad anterior (o si el examen de ubicación demuestra que ya la dominas).</p>
<div class="row"><button class="btn" data-go="${RAIZ}/u/${UNIDADES[k-2].id}">Ir a la unidad ${k-1}</button><button class="btn ghost" data-go="estudio/ingles/ubicacion">Examen de ubicación</button></div></div>`;
    const paso=(n,titulo,cuerpo,hecho)=>`<li class="paso${hecho?' hecho':''}"><span class="paso-num">${hecho?'✓':n}</span><div><b>${titulo}</b>${cuerpo}</div></li>`;
    const c=CONTENIDO[u.id],h=d.extra.unidades?.[u.id]||{},boton=(ruta,texto)=>`<div class="row"><button class="btn ghost btn-chico" data-go="${RAIZ}/u/${u.id}/${ruta}">${texto}</button></div>`;
    return `<p class="miga"><button class="enlace" data-go="${RAIZ}">Hablar</button> › Unidad ${k} · ${u.nivel}</p><h1>${u.titulo}</h1>
<p class="lead"><b>Tarea final:</b> ${u.tarea}</p>
<ol class="pasos-unidad">
${paso(1,'🎧 Escucha',`<p class="nota">${esc(c.escucha.titulo)}: entiende el audio antes de ver el texto.</p>${boton('escucha','Escuchar')}`,h.escucha)}
${paso(2,'💬 Frases de la unidad',`<p class="nota">${c.chunks.length} frases hechas para repetir hasta que salgan solas.</p>${boton('frases','Practicar frases')}`,h.chunks)}
${paso(3,'Forma (gramática)',`<div class="row">${u.lecciones.map(id=>`<button class="btn ghost btn-chico" data-go="estudio/ingles/l/${id}">${d.lecciones[id]?.dominada?'✓ ':''}${esc(TITULOS[id]||id)}</button>`).join('')}</div>`,u.lecciones.every(id=>d.lecciones[id]?.dominada))}
${paso(4,'Pronunciación',`<div class="row"><button class="btn ghost btn-chico" data-go="${RAIZ}/sonido/${s.id}">${s.nombre}</button></div>`,(fuerzaSonidos(p)[s.id]?.prom||0)>=0.8)}
${paso(5,'Hablar: diálogos',`<div class="row">${u.dialogos.map(id=>{const x=dialogo(id);return `<button class="btn ghost btn-chico" data-go="${RAIZ}/dialogo/${id}">${dl[id]?`✓ `:''}${x.titulo}</button>`}).join('')}</div>`,u.dialogos.every(id=>dl[id]))}
${paso(6,'⚡ Fluidez',`<p class="nota">4-3-2: cuenta «${esc(c.fluidez.tema)}» en 60, 45 y 30 segundos.</p>${boton('fluidez','Empezar')}`,h.fluidez)}
${paso(7,'🏆 Jefe: '+dialogo(u.jefe).titulo,`<p class="nota">Sin traducción; necesitas el 80 % de los turnos. Al vencerlo se abre la unidad siguiente.</p><div class="row"><button class="btn" data-go="${RAIZ}/jefe/${u.id}">${e==='completa'?'Repetir el jefe':'Enfrentar al jefe'}</button></div>`,e==='completa')}
</ol>`;
  }};
}
// Frases hechas (chunks) de la unidad: repetir con evaluación; al 80 % el paso queda hecho
function vistaChunks(u){
  const c=CONTENIDO[u.id],cabecera=`<p class="miga"><button class="enlace" data-go="${RAIZ}/u/${u.id}">${esc(u.titulo)}</button> › Frases</p><h1>💬 Frases de la unidad</h1>
<p class="lead">Bloques que los nativos dicen de una pieza. Apréndelos enteros, no palabra por palabra.</p>`;
  return sesionPronunciacion({titulo:`Frases: ${u.titulo}`,cabecera,volver:`${RAIZ}/u/${u.id}`,
    items:()=>c.chunks.map((x,k)=>({tipo:'repetir',en:x.en,es:`${x.es} · ${x.uso}`,ref:`ingles/c/${u.id}/${k}`})),
    alTerminar:rs=>{const rep=rs.filter(r=>r.tipo==='repetir');if(rep.length&&rep.filter(r=>r.ok).length/rep.length>=0.8){marcarPaso(u.id,'chunks');return '<p class="allow">✓ Paso «Frases de la unidad» completado.</p>'}return ''}});
}
function vistaJefe(u){
  if(estadoUnidades()[u.id]==='bloqueada')return vistaUnidad(u);
  return vistaDialogo(dialogo(u.jefe),{jefe:true,volver:`${RAIZ}/u/${u.id}`,alTerminar:f=>{if(f.pasa)vencerJefe(u.id)}});
}

function vistaSonido(s){
  const cabecera=`<p class="miga"><button class="enlace" data-go="${RAIZ}">Hablar</button> › Sonidos</p><h1>${s.nombre}</h1>
<div class="card sonido-info"><p><b>Por qué cuesta:</b> ${s.causa}</p><p><b>Tip:</b> ${s.tip}</p>
<p class="nota">Pares mínimos: ${s.pares.map(([a,b])=>`<span class="par"><span lang="en">${a}</span> / <span lang="en">${b}</span> <button class="btn ghost btn-chico" data-decir="${a}. ${b}." data-lento="1" aria-label="Escuchar ${a} y ${b}">🔊</button></span>`).join(' ')}</p></div>`;
  return sesionPronunciacion({titulo:s.nombre,cabecera,volver:RAIZ,items:()=>[
    ...itemsElegir(s.pares,3,s.id),
    ...s.pares.slice(0,2).flat().map(w=>({tipo:'repetir',en:w,ref:`ingles/w/${w}`})),
    ...s.frases.map((en,k)=>({tipo:'repetir',en,ref:`ingles/s/${s.id}/${k}`}))
  ]});
}
function vistaFrases(nivel){
  const lista=FRASES[nivel],cabecera=`<p class="miga"><button class="enlace" data-go="${RAIZ}">Hablar</button> › Frases útiles</p><h1>Frases útiles ${nivel}</h1>
<p class="lead">Frases hechas que se usan todos los días. Repítelas hasta que salgan solas.</p>`;
  return sesionPronunciacion({titulo:`Frases ${nivel}`,cabecera,volver:RAIZ,items:()=>lista.map((x,k)=>({tipo:'repetir',en:x.en,es:`${x.es} · ${x.uso}`,ref:`ingles/f/${nivel}/${k}`}))
    .sort(()=>Math.random()-0.5).slice(0,8)});
}

// La sección resuelve sus propias subrutas
export function ruta(resto){
  const [a,b]=resto;
  if(a==='sonido'&&sonido(b))return {ruta:`${RAIZ}/sonido/${b}`,v:vistaSonido(sonido(b))};
  if(a==='frases'&&FRASES[b])return {ruta:`${RAIZ}/frases/${b}`,v:vistaFrases(b)};
  if(a==='dialogo'&&dialogo(b))return {ruta:`${RAIZ}/dialogo/${b}`,v:vistaDialogo(dialogo(b))};
  if(a==='ia')return {ruta:`${RAIZ}/ia`,v:vistaIA()};
  if(a==='u'&&unidad(b)){const u=unidad(b),c=resto[2],bloq=estadoUnidades()[b]==='bloqueada';
    const pasos={escucha:vistaEscucha,frases:vistaChunks,fluidez:vistaFluidez};
    if(pasos[c]&&!bloq)return {ruta:`${RAIZ}/u/${b}/${c}`,v:pasos[c](u)};
    return {ruta:`${RAIZ}/u/${b}`,v:vistaUnidad(u)};}
  if(a==='jefe'&&unidad(b))return {ruta:`${RAIZ}/jefe/${b}`,v:vistaJefe(unidad(b))};
  return {ruta:RAIZ,v:portada};
}

// Candidatos de Inglés para "¿Qué sigue?" (ver nucleo/recomendador.js)
export function recomendarIngles(p=progreso()){
  const c=[],m=misionHabla(p),u=unidadActual(p),dl=datosMateria(p,'ingles').extra.dialogos||{};
  const dialogoSugerido=u?(u.dialogos.find(id=>!dl[id])||u.dialogos[0]):DIALOGOS[0].id;
  if(!m.cumplida){
    const faltan=Math.max(0,MISION.frases-m.frases);
    c.push({regla:2,titulo:`Hablar: ${dialogo(dialogoSugerido).titulo}`,porque:`Te faltan ${faltan} frases (o una conversación de ${MISION.turnos} turnos) para tu misión de habla de hoy: en Inglés, hablar pesa más.`,ruta:`${RAIZ}/dialogo/${dialogoSugerido}`});
  }
  for(const [id,x] of Object.entries(fuerzaSonidos(p))){const s=sonido(id);
    if(s&&x.n>=5&&x.prom<0.8)c.push({regla:3,valor:x.prom,titulo:`Practicar ${s.nombre}`,porque:`${s.nombre} te cuesta (${pct(x.prom)} % reciente): 5 minutos de pares mínimos.`,ruta:`${RAIZ}/sonido/${id}`})}
  if(u)c.push({regla:6,titulo:`Jefe: ${u.titulo}`,porque:`Estás al día: vence al jefe de la unidad para abrir la siguiente (${u.tarea.charAt(0).toLowerCase()}${u.tarea.slice(1)})`,ruta:`${RAIZ}/jefe/${u.id}`});
  if(leerAjustes().clave)c.push({regla:6,titulo:'Conversación libre con IA',porque:'Estás al día: practica una conversación libre con tu tutor IA.',ruta:`${RAIZ}/ia`});
  return c;
}

// Ejercicios de habla que vuelven en "Repasar hoy"
export function ejercicioHabla(tipo,partes,p=progreso()){
  const base={tipo:'hablar',sonidos:SONIDOS,materia:'ingles'};
  if(tipo==='w'){const w=partes[0];return w&&{titulo:'Pronunciación',ej:{...base,frase:w,regla:'Pronuncia la palabra completa y clara; toca 🐢 para oírla despacio.'}}}
  if(tipo==='s'){const s=sonido(partes[0]),en=s?.frases[+partes[1]];return en&&{titulo:`Pronunciación: ${s.nombre}`,ej:{...base,frase:en,regla:`${s.causa} Tip: ${s.tip}`}}}
  if(tipo==='f'){const x=FRASES[partes[0]]?.[+partes[1]];return x&&{titulo:`Frases útiles ${partes[0]}`,ej:{...base,frase:x.en,es:x.es,regla:`Frase hecha: ${x.uso}.`}}}
  if(tipo==='d'){const d=dialogo(partes[0]),t=d?.turnos[+partes[1]];
    return t&&{titulo:`Diálogo: ${d.titulo}`,ej:{...base,pregunta:`${esc(d.personaje)}: «<span lang="en">${esc(t.dice)}</span>» — ${t.tarea}`,oir:t.dice,acepta:t.acepta,errores:t.errores||{},modelo:t.modelo,pista:t.pista,regla:t.regla}}}
  if(tipo==='e'){const q=CONTENIDO[partes[0]]?.escucha.preguntas[+partes[1]];return q&&{titulo:`Escucha: ${CONTENIDO[partes[0]].escucha.titulo}`,ej:{...q,oir:CONTENIDO[partes[0]].escucha.texto}}}
  if(tipo==='c'){const x=CONTENIDO[partes[0]]?.chunks[+partes[1]];return x&&{titulo:'Frases de la unidad',ej:{...base,frase:x.en,es:x.es,regla:`Frase hecha: ${x.uso}.`}}}
  if(tipo==='x'){const x=p.frases[partes[0]];return x&&{titulo:'Frase de tu tutor IA',ej:{...base,frase:x.en,es:x.es,regla:x.regla||'Frase para practicar.'}}}
  return null;
}
