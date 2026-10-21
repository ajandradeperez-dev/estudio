/* Combinar los datos de dos dispositivos sin perder nada y sin contar dos veces (sin DOM: también lo usa npm run revisar).
   Lo usan «📥 Importar → Combinar» (respaldo .estudio) y la sincronización con Supabase (sync/sincronizar.js).

   - XP y contadores (ej, seg, xp y lo hablado de cada día; XP de cada materia): contador por dispositivo («G-Counter»).
     Cada dispositivo guarda en `por` lo que aportó cada OTRO dispositivo; lo suyo es el total menos `base` y los demás.
     Al combinar se toma, por dispositivo, el máximo (lo más nuevo que se sabe de él) y se suman: así lo ganado en dos
     teléfonos se suma exacto y combinar dos veces no duplica nada. `base` es lo acumulado antes de v11 (o de un respaldo
     viejo): no se sabe si los dos ya lo compartían, así que se toma el máximo (puede quedarse corto, nunca inflado).
   - Racha: se recalcula sola de la unión de los días (un día cuenta si se cumplió la meta en cualquiera).
   - Habilidades: dominada si lo está en cualquiera; mejor, intentos y sesiones al máximo; días de práctica unidos;
     las últimas respuestas y la dificultad, del lado que practicó más recientemente.
   - Repaso (SM-2): por ejercicio gana el repaso más reciente (proxima − int = el día en que se respondió).
   - Notas y resúmenes: gana la versión editada más recientemente; un borrado viaja como «lápida» {id, borrada:fecha}
     y gana solo si es más nuevo que la última edición (nunca se borra algo editado después).
   - Lo demás (tarjetas, básicos retirados, estrellas, extra de cada materia…): unión; en números, el máximo. */
import {cumple,racha,sumarDias} from '../progreso.js';

const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:null;
const clonar=x=>x==null?x:JSON.parse(JSON.stringify(x));
const num=x=>typeof x==='number'&&isFinite(x)?x:0;

/* ---------- contadores por dispositivo ---------- */
const CAMPOS_DIA=['ej','seg','xp','h.frases','h.seg','h.turnos'];
const leer=(o,k)=>k.startsWith('h.')?num(o.habla?.[k.slice(2)]):num(o[k]);
const escribir=(o,k,v)=>{if(k.startsWith('h.')){o.habla=Object.assign({frases:0,seg:0,turnos:0,conv:0},obj(o.habla));o.habla[k.slice(2)]=v}else o[k]=v};
// Todos los aportes de un contador, con el de `yo` calculado (total − base − los demás)
function aportes(o,campos,yo){
  const por={};for(const [d,v] of Object.entries(obj(o?.por)||{}))if(obj(v))por[d]={...v};
  if(yo){const mio={};for(const k of campos){let r=leer(o||{},k)-num(o?.base?.[k]);for(const [d,v] of Object.entries(por))if(d!==yo)r-=num(v[k]);if(r>0)mio[k]=r}
    por[yo]=mio}
  return por;
}
// Combina los contadores de a (dispositivo yo) y b (dispositivo el) en `destino`
function combinarContadores(destino,a,b,campos,yo,el){
  const pa=aportes(a,campos,yo),pb=aportes(b,campos,el),base={},por={};
  for(const k of campos){const m=Math.max(num(a?.base?.[k]),num(b?.base?.[k]));if(m)base[k]=m}
  for(const d of new Set([...Object.keys(pa),...Object.keys(pb)])){const v={};
    for(const k of campos){const m=Math.max(num(pa[d]?.[k]),num(pb[d]?.[k]));if(m)v[k]=m}
    por[d]=v}
  for(const k of campos)escribir(destino,k,num(base[k])+Object.values(por).reduce((s,v)=>s+num(v[k]),0));
  if(Object.keys(base).length)destino.base=base;else delete destino.base;
  const otros={};for(const [d,v] of Object.entries(por))if(d!==yo&&Object.keys(v).length)otros[d]=v;
  if(Object.keys(otros).length)destino.por=otros;else delete destino.por;
}
// Deja escrito el aporte de `yo` (para lo que sale del dispositivo: un respaldo o la nube). Así quien lo reciba sabe qué es de quién.
export function marcarAportes(p,yo){
  const q=clonar(p);
  const fijar=(o,campos)=>{const por=aportes(o,campos,yo),v=por[yo];delete por[yo];if(Object.keys(v).length)por[yo]=v;if(Object.keys(por).length)o.por=por;else delete o.por};
  for(const m of Object.values(obj(q.materias)||{}))if(obj(m))fijar(m,['xp']);
  for(const d of Object.values(obj(q.dias)||{}))if(obj(d))fijar(d,CAMPOS_DIA);
  return q;
}

/* ---------- piezas ---------- */
const ultimoDia=h=>[...(h?.dias||[])].sort().pop()||h?.estudiado||'';
function combinarHabilidad(a,b){
  if(!a)return clonar(b);if(!b)return clonar(a);
  const fa=ultimoDia(a),fb=ultimoDia(b),nueva=fb>fa||(fb===fa&&num(b.sesiones)>num(a.sesiones))?b:a;
  const r={...clonar(a),...clonar(b),...clonar(nueva)};
  r.dominada=!!(a.dominada||b.dominada);
  if(r.dominada)r.via=a.dominada&&a.via==='practica'||b.dominada&&b.via==='practica'?'practica':(a.via||b.via||'practica');
  for(const k of ['mejor','intentos','sesiones'])r[k]=Math.max(num(a[k]),num(b[k]));
  r.dias=[...new Set([...(a.dias||[]),...(b.dias||[])])].sort().slice(-10);
  if(a.estudiado||b.estudiado)r.estudiado=(a.estudiado||'')>(b.estudiado||'')?a.estudiado:b.estudiado;
  return r;
}
// Día en que se respondió por última vez un ejercicio del repaso
const respondido=r=>r?.proxima&&r.int>=0?sumarDias(r.proxima,-Math.round(r.int)):'';
function combinarRepaso(a,b){
  if(!a)return clonar(b);if(!b)return clonar(a);
  const fa=respondido(a),fb=respondido(b);
  const r=clonar(fb>fa||(fb===fa&&num(b.rep)>num(a.rep))?b:a);r.fallos=Math.max(num(a.fallos),num(b.fallos));return r;
}
const esFecha=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}/.test(x);
// Unión genérica (extra de cada materia, básicos…): objetos por clave, números al máximo, fechas la más nueva,
// listas de valores simples unidas; lo demás, lo de a (este dispositivo)
export function unir(a,b){
  if(a===undefined||a===null)return clonar(b);if(b===undefined||b===null)return clonar(a);
  if(typeof a==='number'&&typeof b==='number')return Math.max(a,b);
  if(typeof a==='boolean'&&typeof b==='boolean')return a||b;
  if(esFecha(a)&&esFecha(b))return a>b?a:b;
  if(Array.isArray(a)&&Array.isArray(b)){
    if([...a,...b].every(x=>x===null||typeof x!=='object'))return a.length>=b.length&&b.every(x=>a.includes(x))?[...a]:[...new Set([...a,...b])];
    return clonar(b.length>a.length?b:a);
  }
  if(obj(a)&&obj(b)){const r={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))r[k]=unir(a[k],b[k]);return r}
  return clonar(a);
}
const masNueva=(a,b,campo)=>!a?clonar(b):!b?clonar(a):clonar((b[campo]||'')>(a[campo]||'')?b:a);

/* ---------- progreso completo ---------- */
// a = progreso de este dispositivo (yo), b = el de otro (el). Devuelve uno nuevo; no cambia ninguno de los dos.
// borradas: {idNota: fecha ms} lápidas conocidas (las tarjetas de una nota borrada no regresan).
export function fusionarProgreso(a,b,{yo,el,borradas={}}={}){
  a=obj(a)||{};b=obj(b)||{};
  const r=clonar(a);
  r.meta=a.meta||b.meta;
  // materias
  r.materias={};
  for(const id of new Set([...Object.keys(obj(a.materias)||{}),...Object.keys(obj(b.materias)||{})])){
    const ma=obj(a.materias?.[id]),mb=obj(b.materias?.[id]);
    if(!ma||!mb){r.materias[id]=clonar(ma||mb);if(!ma){const m=r.materias[id];combinarContadores(m,null,mb,['xp'],yo,el)}continue}
    const m={...clonar(ma)};
    combinarContadores(m,ma,mb,['xp'],yo,el);
    m.lecciones={};for(const h of new Set([...Object.keys(obj(ma.lecciones)||{}),...Object.keys(obj(mb.lecciones)||{})]))m.lecciones[h]=combinarHabilidad(ma.lecciones?.[h],mb.lecciones?.[h]);
    m.ubicacion=masNueva(ma.ubicacion,mb.ubicacion,'fecha');
    m.visitadas=[...new Set([...(ma.visitadas||[]),...(mb.visitadas||[])])];
    m.extra=unir(ma.extra||{},mb.extra||{});
    r.materias[id]=m;
  }
  // días: contadores por dispositivo; la meta cumplida en cualquiera cuenta (la racha sale de aquí)
  r.dias={};
  for(const f of new Set([...Object.keys(obj(a.dias)||{}),...Object.keys(obj(b.dias)||{})])){
    const da=obj(a.dias?.[f]),db=obj(b.dias?.[f]),d={...clonar(da||db)};
    combinarContadores(d,da,db,CAMPOS_DIA,da?yo:null,db?el:null);
    if(da||db)d.habla=Object.assign({frases:0,seg:0,turnos:0,conv:0},d.habla,{conv:Math.max(num(da?.habla?.conv),num(db?.habla?.conv))});
    d.ok=!!(da?.ok||db?.ok||cumple(r.meta||{tipo:'ejercicios',cantidad:20},d));
    r.dias[f]=d;
  }
  // repaso
  r.repaso={};
  for(const ref of new Set([...Object.keys(obj(a.repaso)||{}),...Object.keys(obj(b.repaso)||{})]))r.repaso[ref]=combinarRepaso(a.repaso?.[ref],b.repaso?.[ref]);
  // resúmenes y tarjetas: la más nueva (las de una nota borrada no regresan)
  r.notas={};for(const k of new Set([...Object.keys(obj(a.notas)||{}),...Object.keys(obj(b.notas)||{})]))r.notas[k]=masNueva(a.notas?.[k],b.notas?.[k],'fecha');
  r.tarjetas={};
  for(const k of new Set([...Object.keys(obj(a.tarjetas)||{}),...Object.keys(obj(b.tarjetas)||{})])){
    const t=masNueva(a.tarjetas?.[k],b.tarjetas?.[k],'fecha');
    if(t?.nota&&borradas[t.nota]&&!a.tarjetas?.[k]){delete r.repaso[`${t.materia||'notas'}/t/${k}`];continue}
    r.tarjetas[k]=t;
  }
  for(const k of ['basicos','refuerzos','estrellas','frases'])r[k]=unir(obj(a[k])||{},obj(b[k])||{});
  r.dominados=Math.max(num(a.dominados),num(b.dominados));
  r.historial=[...(a.historial||[]),...(b.historial||[])].filter((x,i,l)=>obj(x)&&l.findIndex(y=>obj(y)&&y.materia===x.materia&&y.tipo===x.tipo&&y.fecha===x.fecha)===i)
    .sort((x,y)=>(x.fecha||'')<(y.fecha||'')?-1:(x.fecha||'')>(y.fecha||'')?1:0).slice(-20);
  r.ultimo=a.ultimo||b.ultimo||null;
  r.v=Math.max(num(a.v),num(b.v))||a.v;
  r.mejorRacha=Math.max(num(a.mejorRacha),num(b.mejorRacha),racha(r));
  return r;
}

/* ---------- cuaderno y materias propias ---------- */
// Notas: por id gana la edición más nueva; una lápida más nueva que la última edición la borra.
export function fusionarNotas(a=[],b=[],borradas={}){
  const m=new Map();
  for(const n of [...a,...b]){if(!n?.id)continue;const x=m.get(n.id);if(!x||(n.editada||0)>(x.editada||0))m.set(n.id,n)}
  return [...m.values()].filter(n=>!(borradas[n.id]>(n.editada||0)));
}
// Por id, gana el de `campo` más nuevo (materias propias: editada; lo generado con IA: creado)
export function fusionarPorId(a=[],b=[],campo='editada',borradas={}){
  const m=new Map();
  for(const x of [...a,...b]){if(!x?.id)continue;const y=m.get(x.id);if(!y||(x[campo]||0)>(y[campo]||0))m.set(x.id,x)}
  return [...m.values()].filter(x=>!(borradas[x.id]>(x[campo]||0)));
}
export const unirLapidas=(a={},b={})=>{const r={...a};for(const [k,v] of Object.entries(b||{}))r[k]=Math.max(r[k]||0,v||0);return r};

/* ---------- resumen (para «¿Combinar o reemplazar?» y el primer inicio de sesión) ---------- */
export function resumenProgreso(p){
  p=obj(p)||{};
  const xp=Object.values(obj(p.materias)||{}).reduce((s,m)=>s+num(m?.xp),0);
  const dominadas=Object.values(obj(p.materias)||{}).reduce((s,m)=>s+Object.values(obj(m?.lecciones)||{}).filter(h=>h?.dominada).length,0);
  const dias=Object.keys(obj(p.dias)||{}).sort(),activos=dias.filter(f=>p.dias[f]?.ej||p.dias[f]?.seg>=60);
  return {xp,dominadas,repasos:Object.keys(obj(p.repaso)||{}).length,tarjetas:Object.keys(obj(p.tarjetas)||{}).length,
    dias:activos.length,ultimo:activos.pop()||dias.pop()||null};
}
