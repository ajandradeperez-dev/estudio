/* Sección "🎙️ Hablar" de Inglés. Rutas (bajo #ingles/hablar):
   (vacía)              portada: pronunciación por sonido, frases útiles, diálogos guiados, conversación con IA
   sonido/<id>          pares mínimos y frases de un sonido difícil
   frases/<A1|A2>       frases útiles del nivel
   dialogo/<id>         diálogo guiado
   ia                   conversación libre con Claude */
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

const RAIZ='ingles/hablar';
const pct=x=>Math.round(x*100);
// Acierto reciente por sonido (últimos 20 intentos)
export function fuerzaSonidos(p=progreso()){
  const s=datosMateria(p,'ingles').extra.sonidos||{};
  return Object.fromEntries(Object.entries(s).filter(([,v])=>v.ult?.length).map(([id,v])=>[id,{prom:v.ult.reduce((a,b)=>a+b,0)/v.ult.length,n:v.n}]));
}

const portada={
  titulo:'Hablar',
  vista(){
    const p=progreso(),f=fuerzaSonidos(p),dl=datosMateria(p,'ingles').extra.dialogos||{},clave=!!leerAjustes().clave;
    return `<p class="miga"><button class="enlace" data-go="ingles">Inglés</button> › Hablar</p><h1>🎙️ Hablar</h1>
<p class="lead">Hablar en voz alta es lo que más rápido te hace avanzar: aquí repites, conversas y recibes corrección. Tu nivel: <b>${nivelIngles(p)}</b>.</p>
${soporte.escuchar?'':`<div class="card aviso"><p style="margin:0">⚠️ ${AVISO_SIN_RECONOCIMIENTO}</p></div>`}
<h2>Diálogos guiados</h2><p class="nota">Situaciones reales. Funcionan sin internet${soporte.escuchar?' (el reconocimiento de voz de Chrome sí necesita conexión)':''}.</p>
<div class="grid">${DIALOGOS.map(d=>{const x=dl[d.id];return `<div class="card click" data-go="${RAIZ}/dialogo/${d.id}" tabindex="0"><div class="progress">${d.nivel}${x?` · mejor ${pct(x.mejor)}%`:''}</div><h3 style="margin:4px 0">${d.titulo}</h3><p class="nota" style="margin:0">${d.escena}</p></div>`}).join('')}</div>
<h2>Conversación libre con IA</h2>
<div class="card click" data-go="${RAIZ}/ia" tabindex="0"><h3>🤖 Habla con un tutor IA</h3><p class="nota" style="margin:0">Conversa sobre lo que quieras; te corrige en español y te propone frases más naturales. ${clave?'Clave configurada ✓':'Necesita tu API key de Anthropic.'}</p></div>
<h2>Frases útiles</h2>
<div class="row">${Object.keys(FRASES).map(n=>`<button class="btn ghost" data-go="${RAIZ}/frases/${n}">Frases ${n}</button>`).join('')}</div>
<h2>Pronunciación: sonidos difíciles</h2><p class="nota">Pares mínimos y frases para los errores típicos de hispanohablantes.</p>
<div class="grid sonidos">${SONIDOS.map(s=>{const x=f[s.id];return `<div class="card click" data-go="${RAIZ}/sonido/${s.id}" tabindex="0"><h3 style="margin:0 0 4px">${s.nombre}</h3>
${x?`<span class="tag ${x.prom>=0.8?'on':'warn-tag'}">${pct(x.prom)}% reciente</span>`:'<span class="tag">Sin practicar</span>'}</div>`}).join('')}</div>`;
  }
};

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
  return {ruta:RAIZ,v:portada};
}

// Ejercicios de habla que vuelven en "Repasar hoy"
export function ejercicioHabla(tipo,partes,p=progreso()){
  const base={tipo:'hablar',sonidos:SONIDOS,materia:'ingles'};
  if(tipo==='w'){const w=partes[0];return w&&{titulo:'Pronunciación',ej:{...base,frase:w,regla:'Pronuncia la palabra completa y clara; toca 🐢 para oírla despacio.'}}}
  if(tipo==='s'){const s=sonido(partes[0]),en=s?.frases[+partes[1]];return en&&{titulo:`Pronunciación: ${s.nombre}`,ej:{...base,frase:en,regla:`${s.causa} Tip: ${s.tip}`}}}
  if(tipo==='f'){const x=FRASES[partes[0]]?.[+partes[1]];return x&&{titulo:`Frases útiles ${partes[0]}`,ej:{...base,frase:x.en,es:x.es,regla:`Frase hecha: ${x.uso}.`}}}
  if(tipo==='d'){const d=dialogo(partes[0]),t=d?.turnos[+partes[1]];
    return t&&{titulo:`Diálogo: ${d.titulo}`,ej:{...base,pregunta:`${esc(d.personaje)}: «<span lang="en">${esc(t.dice)}</span>» — ${t.tarea}`,oir:t.dice,acepta:t.acepta,errores:t.errores||{},modelo:t.modelo,pista:t.pista,regla:t.regla}}}
  if(tipo==='x'){const x=p.frases[partes[0]];return x&&{titulo:'Frase de tu tutor IA',ej:{...base,frase:x.en,es:x.es,regla:x.regla||'Frase para practicar.'}}}
  return null;
}
