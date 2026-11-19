/* 🏁 Simulacros de Inglés: datos y reglas (sin DOM; también lo usan npm run revisar y npm run simulacros).
   Un simulacro: {id, nivel, titulo, corto?, minutos:{parte:min}, lectura:[tarea], uso?:[tarea], escritura:[tarea],
   escucha:[tarea], habla:{partes:[…]}}. Tarea con preguntas: {id, consigna, texto | audio:[[hablante, frase]…], preguntas}.
   Pregunta: opcion {pregunta, opciones, correcta, regla} o completar {pregunta, respuestas, regla, errores}.
   El estado de un intento (pausar y retomar) vive en localStorage['ciberlab-simulacro'] (vistas.js); el historial y los
   resultados, en el progreso (materias.ingles.extra.simulacros), que se sincroniza como lo demás. */
import A1 from './a1.js';
import A2 from './a2.js';
import B1 from './b1.js';
import B2 from './b2.js';
import {ESCENAS} from './escenas.js';
import {coincide} from '../../../nucleo/comparar.js';
import {revisarEscrito,contarPalabras} from '../nivel/datos.js';
import TEMAS from '../temas.js';

export const SIMULACROS=[...A1,...A2,...B1,...B2];
export const simulacro=id=>SIMULACROS.find(s=>s.id===id)||null;
export const NIVELES=['A1','A2','B1','B2'];
export const PARTES={lectura:{icono:'📖',titulo:'Lectura'},uso:{icono:'🔤',titulo:'Uso del idioma'},escritura:{icono:'✍️',titulo:'Escritura'},escucha:{icono:'🎧',titulo:'Escucha'},habla:{icono:'🗣️',titulo:'Habla'}};
export const ORDEN=['lectura','uso','escritura','escucha','habla'];
export const partesDe=s=>ORDEN.filter(p=>p==='habla'?s.habla?.partes?.length:s[p]?.length);
export const AVISO_OFICIAL='Simulacro de práctica, no es un examen oficial. El formato se inspira en los exámenes de Cambridge, pero todo el contenido es original.';
export const REPRODUCCIONES=2;     // veces que se puede oír cada audio de la escucha
// Rango de palabras de los textos por nivel (lectura y escucha)
export const RANGO={A1:{lectura:[20,140],escucha:[10,100]},A2:{lectura:[25,200],escucha:[15,140]},B1:{lectura:[40,300],escucha:[30,200]},B2:{lectura:[50,350],escucha:[30,260],uso:[20,200]}};

export const idPregunta=(t,i)=>`${t.id}.${i}`;
export const transcripcion=t=>(t.audio||[]).map(([q,x])=>`${q==='N'?'':q+': '}${x}`).join('\n');
export const textoAudio=t=>(t.audio||[]).map(x=>x[1]).join(' ');
// ¿Es correcta esta respuesta? (Inglés no tolera errores de dedo: solo coincide, sin casiIgual)
export function correcta(p,dada){
  if(dada===undefined||dada===null||dada==='')return false;
  if(p.tipo==='opcion')return +dada===p.correcta;
  return coincide(String(dada),p.respuestas);
}
export const textoCorrecto=p=>p.tipo==='opcion'?p.opciones[p.correcta]:p.respuestas[0];

/* ---------- escritura ---------- */
// La rúbrica de una tarea; si trae escena, el criterio __ESCENA3__ pide nombrar al menos 3 elementos de la escena
export function rubricaEscritura(t,texto){
  const crits=t.criterios.filter(c=>c.re!=='__ESCENA3__'),r=revisarEscrito({...t,criterios:crits},texto);
  if(t.criterios.some(c=>c.re==='__ESCENA3__')){
    const el=(ESCENAS[t.escena]?.elementos||[]),bajo=String(texto||'').toLowerCase(),vistos=el.filter(e=>bajo.includes(e.toLowerCase()));
    r.criterios.push({texto:'Mencionas al menos tres cosas de la escena',ok:vistos.length>=3,ayuda:`Puedes mencionar: ${el.slice(0,8).join(', ')}…`});
    r.total++;if(vistos.length>=3)r.puntos++;
  }
  return r;
}

/* ---------- calificación ---------- */
// Fracción 0–1 de una parte (null si no se hizo). est: el estado del intento (vistas.js)
export function puntajeParte(s,parte,est){
  const e=est.datos?.[parte];if(!e)return null;
  if(['lectura','uso','escucha'].includes(parte)){
    const qs=s[parte].flatMap(t=>t.preguntas.map((p,i)=>[p,e.resp?.[idPregunta(t,i)]]));
    return qs.length?qs.filter(([p,d])=>correcta(p,d)).length/qs.length:null;
  }
  if(parte==='escritura'){
    const xs=s.escritura.map(t=>{const ia=e.ia?.[t.id];if(ia?.criterios)return ia.criterios.reduce((a,c)=>a+c.nota,0)/(ia.criterios.length*5);
      const tx=e.textos?.[t.id];if(!tx?.trim())return 0;const r=rubricaEscritura(t,tx);return r.puntos/r.total});
    return xs.reduce((a,b)=>a+b,0)/xs.length;
  }
  if(parte==='habla'){
    const c=e.calificacion?.criterios||e.autoeval;
    if(!c)return e.terminada?0:null;
    const notas=Object.values(c).map(x=>typeof x==='number'?x:x.nota).filter(x=>typeof x==='number');
    return notas.length?notas.reduce((a,b)=>a+b,0)/(notas.length*5):0;
  }
  return null;
}
export function resultado(s,est){
  const partes={};for(const p of partesDe(s)){const v=puntajeParte(s,p,est);if(v!==null)partes[p]=v}
  const vs=Object.values(partes),total=vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:0;
  const debil=Object.entries(partes).sort((a,b)=>a[1]-b[1])[0]?.[0]||null;
  return {partes,total,debil,nivel:nivelEstimado(s.nivel,total),completo:partesDe(s).every(p=>p in partes)};
}
// Nivel estimado a partir del porcentaje en un simulacro de cierto nivel (umbrales aproximados, como orientación)
export function nivelEstimado(nivel,total){
  const i=NIVELES.indexOf(nivel),abajo=NIVELES[Math.max(0,i-1)],arriba=NIVELES[Math.min(NIVELES.length-1,i+1)];
  if(total>=0.85)return {nivel,texto:`Estás en ${nivel} con buen margen${arriba!==nivel?`: prueba un simulacro ${arriba}`:''}.`,banda:'alto'};
  if(total>=0.7)return {nivel,texto:`Estás en ${nivel}.`,banda:'medio'};
  if(total>=0.55)return {nivel,texto:`Cerca de ${nivel}: un poco más de práctica y lo tienes.`,banda:'cerca'};
  return {nivel:abajo,texto:i>0?`Todavía en ${abajo}: repasa lo de ${nivel} antes de volver a intentarlo.`:'Sigue practicando lo básico de A1.',banda:'bajo'};
}
// A dónde ir a practicar la parte más débil
export function practicarParte(nivel,parte){
  const n=nivel==='A1'?'A1':nivel;
  return {lectura:`estudio/ingles/hablar/nivel/${n}`,escucha:`estudio/ingles/hablar/nivel/${n}`,escritura:`estudio/ingles/hablar/nivel/${n}`,
    uso:`estudio/ingles/${n.toLowerCase()}`,habla:`estudio/ingles/hablar`}[parte]||'estudio/ingles';
}

/* ---------- habla (examinador) ---------- */
export const CRITERIOS_HABLA=nivel=>[['gramatica','Gramática y vocabulario'],...(['B1','B2'].includes(nivel)?[['discurso','Organización del discurso']]:[]),['pronunciacion','Pronunciación (estimada)'],['interaccion','Comunicación interactiva']];
export const CRITERIOS_ESCRITURA=[['contenido','Contenido'],['organizacion','Organización'],['lenguaje','Lenguaje'],['logro','Logro comunicativo']];

/* ---------- prueba de nivel (prueba-nivel.js): escalera y estimación ---------- */
// Siguiente nivel según las dos últimas respuestas (escalera)
export function siguienteNivel(nivel,historial){
  const i=NIVELES.indexOf(nivel),ult=historial.slice(-2);
  if(ult.length===2&&ult.every(x=>x.r.correcto&&x.p.nivelPrueba===nivel))return NIVELES[Math.min(NIVELES.length-1,i+1)];
  if(ult.length===2&&ult.every(x=>!x.r.correcto&&x.p.nivelPrueba===nivel))return NIVELES[Math.max(0,i-1)];
  return nivel;
}
// Nivel estimado y desglose
export function estimar(historial){
  const por={};for(const {p,r} of historial){const x=por[p.nivelPrueba]=por[p.nivelPrueba]||[0,0];x[1]++;if(r.correcto)x[0]++}
  let nivel='A1';for(const n of NIVELES){const [a,t]=por[n]||[0,0];if(t>=3&&a/t>=0.6)nivel=n}
  const hab={};for(const {p,r} of historial){const x=hab[p.hab]=hab[p.hab]||[0,0];x[1]++;if(r.correcto)x[0]++}
  const total=historial.length?historial.filter(x=>x.r.correcto).length/historial.length:0;
  return {nivel,por,hab,total};
}
// Habilidades de los niveles inferiores al estimado (para «ajustar el punto de partida»)
export const habilidadesDebajo=nivel=>TEMAS.filter(t=>NIVELES.includes(t.id.toUpperCase())&&NIVELES.indexOf(t.id.toUpperCase())<NIVELES.indexOf(nivel)).flatMap(t=>(t.nodos||[]).filter(x=>x.id).map(x=>x.id));


/* ---------- validación (npm run revisar) ---------- */
export function validar(){
  const errP=[];probarEscalera(errP);
  const errores=[],mal=(d,m)=>errores.push(`${d}: ${m}`),ids=new Set(),textos=new Map();
  for(const s of SIMULACROS){
    const d=`simulacro ${s.id}`;
    if(ids.has(s.id))mal(d,'id repetido');ids.add(s.id);
    if(!NIVELES.includes(s.nivel))mal(d,`nivel inválido ${s.nivel}`);
    for(const p of partesDe(s))if(!(s.minutos?.[p]>0))mal(d,`falta el tiempo de ${p}`);
    const min={A1:{lectura:3,escucha:3},A2:{lectura:5,escucha:5},B1:{lectura:5,escucha:4},B2:{lectura:4,escucha:4,uso:4}}[s.nivel]||{};
    for(const [p,n] of Object.entries(min))if((s[p]?.length||0)<n)mal(d,`${p}: ${s[p]?.length||0} tareas (mínimo ${n})`);
    if((s.escritura?.length||0)<(s.corto?1:2))mal(d,'faltan tareas de escritura');
    if(!s.habla?.partes?.length)mal(d,'falta la parte de habla');
    for(const p of ['lectura','uso','escucha'])for(const t of s[p]||[]){
      const dt=`${d} ${p} ${t.id}`,cuerpo=p==='escucha'?textoAudio(t):t.texto;
      if(!t.consigna||!cuerpo)mal(dt,'falta consigna o texto/audio');
      if(p==='escucha'&&!(t.audio||[]).every(x=>['A','B','N'].includes(x[0])&&x[1]))mal(dt,'cada línea del audio necesita hablante A, B o N y texto');
      const r=RANGO[s.nivel]?.[p];const w=contarPalabras(cuerpo);
      if(r&&(w<r[0]||w>r[1]))mal(dt,`${w} palabras (rango ${s.nivel}: ${r[0]}–${r[1]})`);
      // contenido original: ningún texto se repite entre simulacros (ni copiado de otro)
      const k=cuerpo.toLowerCase().replace(/\s+/g,' ').slice(0,120);if(textos.has(k))mal(dt,`texto repetido (ya está en ${textos.get(k)})`);textos.set(k,dt);
      if(!t.preguntas?.length)mal(dt,'sin preguntas');
      t.preguntas?.forEach((q,i)=>{const dq=`${dt} pregunta ${i+1}`;
        if(!q.regla)mal(dq,'falta la regla');
        if(q.tipo==='opcion'){
          if(!(q.opciones?.length>=2))mal(dq,'necesita al menos 2 opciones');
          if(new Set(q.opciones.map(x=>String(x).toLowerCase())).size!==q.opciones.length)mal(dq,'opciones repetidas');
          if(!(q.correcta>=0&&q.correcta<q.opciones.length))mal(dq,'la respuesta correcta no está entre las opciones');
          // una sola correcta: ninguna otra opción coincide con la correcta
          if(q.opciones.filter((o,j)=>j!==q.correcta&&coincide(o,[q.opciones[q.correcta]])).length)mal(dq,'más de una opción correcta');
        }else if(q.tipo==='completar'){
          if(!q.respuestas?.length)mal(dq,'sin respuestas');
          else if(!correcta(q,q.respuestas[0]))mal(dq,'la primera respuesta no pasa su propia comprobación');
          for(const v of Object.keys(q.errores||{}))if(coincide(v,q.respuestas))mal(dq,`el error «${v}» es una respuesta correcta`);
        }else mal(dq,`tipo inválido ${q.tipo}`);
      });
    }
    for(const t of s.escritura||[]){const dt=`${d} escritura ${t.id}`;
      if(!t.consigna||!t.modelo||!(t.min>0&&t.max>t.min))mal(dt,'falta consigna, modelo o rango de palabras');
      if(t.escena&&!ESCENAS[t.escena])mal(dt,`la escena ${t.escena} no existe`);
      const r=rubricaEscritura(t,t.modelo);if(r.puntos<r.total)mal(dt,`el modelo no cumple su rúbrica: ${r.criterios.filter(c=>!c.ok).map(c=>c.texto).join('; ')}`)}
    for(const [k,pt] of (s.habla?.partes||[]).entries()){const dt=`${d} habla parte ${k+1}`;
      if(!['entrevista','conversacion','descripcion','turno','discusion'].includes(pt.tipo))mal(dt,`tipo inválido ${pt.tipo}`);
      if(!pt.preguntas?.length||!(pt.segundos>0))mal(dt,'faltan preguntas o segundos');
      if((pt.modelos?.length||0)<pt.preguntas.length)mal(dt,'cada pregunta necesita su respuesta modelo (para comparar sin IA)');
      if(pt.escena&&!ESCENAS[pt.escena])mal(dt,`la escena ${pt.escena} no existe`)}
  }
  for(const [id,e] of Object.entries(ESCENAS)){if(!(e.elementos?.length>=8))mal(`escena ${id}`,'necesita al menos 8 elementos para mencionar');if(!e.descripcion||!e.svg?.startsWith('<svg'))mal(`escena ${id}`,'falta la descripción o el SVG')}
  const porNivel=n=>SIMULACROS.filter(s=>s.nivel===n&&!s.corto).length;
  for(const n of ['A2','B1','B2'])if(porNivel(n)<2)mal(`simulacros ${n}`,`hay ${porNivel(n)} (mínimo 2)`);
  if(!SIMULACROS.some(s=>s.nivel==='A1'))mal('simulacros A1','falta el simulacro corto de A1');
  return [...errP,...errores];
}

// La escalera de la prueba de nivel sube con 2 aciertos, baja con 2 fallos y estima el nivel más alto con ≥ 60 %
function probarEscalera(mal){
  const r=(n,ok)=>({p:{nivelPrueba:n,hab:'uso'},r:{correcto:ok}});
  if(siguienteNivel('A2',[r('A2',true),r('A2',true)])!=='B1')mal.push('prueba de nivel: dos aciertos en A2 no suben a B1');
  if(siguienteNivel('A2',[r('A2',false),r('A2',false)])!=='A1')mal.push('prueba de nivel: dos fallos en A2 no bajan a A1');
  if(siguienteNivel('B2',[r('B2',true),r('B2',true)])!=='B2')mal.push('prueba de nivel: no debe pasar de B2');
  const h=[...Array(4)].map(()=>r('A2',true)).concat([...Array(4)].map(()=>r('B1',true)),[r('B2',false),r('B2',false),r('B2',true)]);
  if(estimar(h).nivel!=='B1')mal.push(`prueba de nivel: con A2 y B1 bien y B2 mal debería estimar B1 (da ${estimar(h).nivel})`);
  if(!habilidadesDebajo('B1').length||habilidadesDebajo('A1').length)mal.push('prueba de nivel: «ajustar el punto de partida» no encuentra las habilidades de A1–A2');
}
