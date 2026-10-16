/* «Definición de terminado» del contenido (sin DOM: la usa npm run revisar, que escribe src/contenido/estado.json; la app
   solo lee ese archivo). Una habilidad está ✅ completa SOLO si cumple los 10 puntos:
     1 objetivo («Al terminar puedes…») y referencia al temario (obj y ref en temas.js)
     2 explicación de una pantalla: idea clave, intuición o analogía y regla formal (explicacion + alternativa + regla)
     3 dos ejemplos resueltos paso a paso: uno básico (niveles 1–2) y uno tipo examen (niveles 4–5), con ≥ 2 pasos
     4 un ejemplo con huecos (sale de los mismos pasos)
     5 generador de 5 niveles con ≥ 3 plantillas distintas por nivel
     6 ≥ 3 errores típicos con feedback específico
     7 ≥ 2 problemas de aplicación con contexto real (plantillas de aplicación del generador o retos que lo usan)
     8 explicación alternativa para «🤔 No entendí»
     9 tarjetas de repaso de los conceptos clave (tarjetas del generador, ≥ 3) que entran al repaso espaciado
    10 profundidades: básico y procedimiento en el generador, y aplicación/escenario en los retos
   Tema ✅: todas sus habilidades ✅, sin «Próximamente», ≥ 1 escenario integrador, un simulacro de 10–15 preguntas,
   resumen del tema (hoja de reglas, en Notas) y 1–3 referencias («📚 Para profundizar»).
   Materia ✅: todos sus temas ✅ (los de solo herramientas no cuentan), examen final acumulativo y certificado interno. */
import {crear,GENERADORES} from './generadores/index.js';
import {crearRng} from './rng.js';

export const PUNTOS=[
  ['objetivo','objetivo y referencia al temario'],['explicacion','explicación (idea, analogía y regla)'],['ejemplos','2 ejemplos resueltos (básico y tipo examen)'],
  ['hueco','ejemplo con huecos'],['plantillas','≥ 3 plantillas por nivel en los 5 niveles'],['errores','≥ 3 errores típicos'],
  ['aplicaciones','≥ 2 problemas de aplicación'],['alternativa','explicación alternativa'],['tarjetas','≥ 3 tarjetas de repaso'],['profundidad','básico, procedimiento y aplicación']
];
const MUESTRAS=40;

// Muestra del generador: plantillas, pasos, errores y profundidades por nivel (semillas fijas: reproducible)
export function muestraGenerador(id){
  const g=GENERADORES[id];if(!g)return null;
  const niveles=[];
  for(let n=1;n<=5;n++){
    const plantillas=new Set(),prof=new Set(),errores=new Set(),apl=new Set();let conPasos=0;
    for(let i=0;i<MUESTRAS;i++){let p;try{p=crear(id,n,{semilla:i*7919+n*104729})}catch(e){continue}if(!p)continue;
      if(p.plantilla)plantillas.add(p.plantilla);prof.add(p.profundidad);if(['aplicacion','escenario'].includes(p.profundidad))apl.add(p.plantilla||p.enunciado.slice(0,40));
      for(const e of p.errores||[])if(e.por)errores.add(e.por);
      if((p.pasos||[]).length>=2&&p.pasos.every(x=>typeof x==='string'||(x.que&&x.como&&x.porque)))conPasos++}
    niveles.push({plantillas:plantillas.size,prof:[...prof],errores:[...errores],conPasos,apl:[...apl]});
  }
  return {g,niveles};
}
// Retos (aplicación o escenario) que usan cada generador: por las preguntas que generan (gen) o por lo que declaran
export function retosPorGenerador(retos){
  const mapa={};
  for(const r of retos){
    if(!['aplicacion','escenario'].includes(r.profundidad))continue;
    const gens=new Set(r.habilidades||[]);
    if(r.crear)for(let i=0;i<3;i++){try{for(const q of r.crear(crearRng(i*31+7))||[])if(q?.gen){gens.add(q.gen);for(const a of GENERADORES[q.gen]?.aplica||[])gens.add(a)}}catch(e){}}
    for(const g of gens)(mapa[g]=mapa[g]||new Set()).add(r.id);
  }
  return mapa;
}
// Los 10 puntos de una habilidad (h: nodo de temas.js con su lección, si tiene)
export function revisarHabilidad(h,retosGen={}){
  const m=h.gen?muestraGenerador(h.gen):null,g=m?.g,nv=m?.niveles||[];
  const ok={
    objetivo:!!(h.obj&&h.ref),
    explicacion:!!((g?.explicacion||h.explicacion?.length)&&(g?.alternativa||h.alternativa)),
    ejemplos:!!(nv.length&&(nv[0].conPasos||nv[1].conPasos)&&(nv[3].conPasos||nv[4].conPasos)),
    hueco:!!(nv.length&&nv.some(x=>x.conPasos)),
    plantillas:nv.length===5&&nv.every(x=>x.plantillas>=3),
    errores:new Set(nv.flatMap(x=>x.errores)).size>=3,
    // problemas con contexto real: plantillas de aplicación del propio generador + retos que lo usan
    aplicaciones:new Set(nv.flatMap(x=>x.apl)).size+(retosGen[h.gen]?.size||0)>=2,
    alternativa:!!(g?.alternativa||h.alternativa),
    tarjetas:(g?.tarjetas||h.tarjetas||[]).length>=3,
    profundidad:false
  };
  const prof=new Set(nv.flatMap(x=>x.prof));
  ok.profundidad=prof.has('basico')&&prof.has('procedimiento')&&ok.aplicaciones;
  const faltan=PUNTOS.filter(([k])=>!ok[k]).map(([,t])=>t);
  return {completa:!faltan.length,ok,faltan,retos:[...(retosGen[h.gen]||[])]};
}
// Tema: habilidades revisadas + escenario, simulacro, resumen y referencias
export function revisarTema(t,habs,retosTema,simulacroPreguntas){
  const proximas=(t.nodos||[]).filter(n=>n.proximo).length,completas=habs.filter(x=>x.completa).length;
  const soloHerramientas=!habs.length&&!proximas;
  const faltan=[];
  if(proximas)faltan.push(`${proximas} habilidades por crear`);
  if(completas<habs.length)faltan.push(`${habs.length-completas} habilidades sin terminar`);
  if(!retosTema.some(r=>r.profundidad==='escenario'&&!r.simulacro))faltan.push('escenario integrador');
  if(!(simulacroPreguntas>=10&&simulacroPreguntas<=15))faltan.push('simulacro de 10–15 preguntas');
  const refs=(t.referencias||[]).length;if(refs<1||refs>3)faltan.push('1–3 referencias');
  const estado=soloHerramientas?'herramientas':!habs.length?'proximo':faltan.length?'parcial':'completo';
  return {estado,completas,total:habs.length+proximas,faltan};
}
