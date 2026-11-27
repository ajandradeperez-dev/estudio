/* 🧭 Mi análisis · recopilar los datos (PROMPT-MI-ANALISIS, parte 2). Todo sale del progreso de este dispositivo y de
   Mis materias; nada se guarda aparte (el análisis es derivado y se recalcula). Funciones puras: reciben el progreso y
   cómo nombrar cada cosa, así también se prueban sin navegador (scripts/analisis.mjs).
   - matrizHabilidades(p): una fila por habilidad practicada (ult ≥ 3 respuestas) con
     [acierto, nivel, sesiones, días, días sin practicar, fallos].
   - serieAvance(p, {filtro}): y(t) = habilidades dominadas acumuladas en el día t (t = días desde el primer día con práctica).
     Exacto donde el día tiene `dom` (v12); antes, aproximado: una habilidad dominada cuenta desde su 2.º día de práctica. */
import {METRICAS} from './ejemplo.js';
export {METRICAS};
export const MIN_RESPUESTAS=3,MIN_HABILIDADES=5;

const DIA=864e5;
export const diasEntre=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/DIA);
const fallosDe=(p,mid,hid)=>Object.entries(p.repaso||{}).reduce((s,[ref,r])=>{
  if(ref===`${mid}/h/${hid}`||ref.startsWith(`${mid}/g/${hid}/`)||ref.startsWith(`${mid}/l/${hid}/`)||ref.startsWith(`${mid}/e/${hid}/`))s+=+r?.fallos||0;return s},0);

// nombre(materia, habilidad) → {nombre, materia (nombre), color} o null para saltarla
export function matrizHabilidades(p,{hoy,nombre=(m,h)=>({nombre:h,materia:m})}={}){
  const filas=[];
  for(const [mid,m] of Object.entries(p.materias||{}))for(const [hid,h] of Object.entries(m?.lecciones||{})){
    const ult=Array.isArray(h?.ult)?h.ult:[];if(ult.length<MIN_RESPUESTAS)continue;
    const dias=[...new Set(Array.isArray(h.dias)?h.dias:[])].sort(),ultimo=dias.at(-1);
    const info=nombre(mid,hid);if(!info)continue;
    filas.push({mid,hid,...info,dominada:!!h.dominada,x:[ult.reduce((a,b)=>a+(+b||0),0)/ult.length,+h.rating||1,+h.sesiones||0,dias.length,ultimo?Math.max(0,diasEntre(ultimo,hoy)):0,fallosDe(p,mid,hid)]});
  }
  return filas;
}

// Fecha aproximada en que se dominó una habilidad: el 2.º día distinto de práctica (el dominio pide 2 días)
const fechaDominio=h=>{const d=[...new Set(h?.dias||[])].sort();return d[1]||d[0]||h?.estudiado||null};
// filtro(mid, hid) → true si cuenta para esta serie (p. ej. solo las habilidades de los temas de una materia con examen)
export function serieAvance(p,{filtro=()=>true}={}){
  const diasPractica=Object.keys(p.dias||{}).filter(f=>(p.dias[f]?.ej||0)>0||(p.dias[f]?.seg||0)>=60).sort();
  if(!diasPractica.length)return {t:[],y:[],fechas:[],inicio:null,exactoDesde:null};
  const inicio=diasPractica[0];
  const dominadas=[];for(const [mid,m] of Object.entries(p.materias||{}))for(const [hid,h] of Object.entries(m?.lecciones||{}))if(h?.dominada&&filtro(mid,hid)){const f=fechaDominio(h);if(f)dominadas.push(f)}
  // `dom` del día solo vale para la serie completa (cuenta todas las materias); con filtro se usa la aproximación
  const exacto=filtro.todas?Object.keys(p.dias).filter(f=>typeof p.dias[f]?.dom==='number').sort():[];
  const exactoDesde=exacto[0]||null;
  const t=[],y=[],fechas=[];
  for(const f of diasPractica){
    const v=exactoDesde&&f>=exactoDesde&&typeof p.dias[f]?.dom==='number'?p.dias[f].dom:dominadas.filter(d=>d<=f).length;
    t.push(diasEntre(inicio,f));y.push(v);fechas.push(f);
  }
  return {t,y,fechas,inicio,exactoDesde};
}
// la serie de todas las materias puede usar `dom` exacto
export const TODAS=Object.assign(()=>true,{todas:true});

/* ---------- pronóstico: ritmo, fecha de la meta y ritmo necesario ---------- */
export function pronostico(mc,{meta,tExamen,yHoy,tHoy}){
  if(mc.singular)return {singular:true};
  const b0=mc.b0num,b1=mc.b1num,enExamen=tExamen!=null?b0+b1*tExamen:null;
  const tMeta=b1>1e-9?(meta-b0)/b1:Infinity;
  const necesario=tExamen!=null&&tExamen>tHoy?(meta-yHoy)/(tExamen-tHoy):null;
  return {singular:false,ritmo:b1,enExamen,llevaria:enExamen==null?null:Math.min(meta,Math.max(0,Math.round(enExamen))),tMeta,necesario,llega:enExamen!=null&&enExamen>=meta-0.5};
}
