/* Emparejar los temas de una materia propia con las habilidades de la app (sin IA). Sin DOM: lo usa también npm run revisar.
   catalogo: [{materia, id, titulo, tema?, temaId?, materiaNombre?}]
   opciones(texto, catalogo, {contexto}) → las 3 mejores [{materia, id, titulo, tema, materiaNombre, puntaje}]
   emparejar(texto, catalogo, {contexto}) → {materia, id, titulo, puntaje, seguro, opciones} | null
     seguro: una opción clara (≥ 0.8 y bien separada de la segunda) que se empareja sola; si no, hay que preguntar.
   Cómo puntúa:
   1. Una frase (título o sinónimo) cuyas palabras están todas en el tema: 0.65 + 0.25·(palabras de la frase / del tema)
      + 0.1·(parte del tema que conoce la lección).
   2. Si no hay frase: palabras sueltas del tema que aparecen en el vocabulario de la lección, pesadas por lo raras que son
      (una palabra que sale en pocas lecciones pesa más): hasta 0.62. Así un tema de una sola palabra ("binomios") empareja.
   3. Contexto (nombre de la materia y de la unidad): +0.2 a las lecciones del área («Derivadas» → cálculo) y −0.1 a las demás.
   Tolera singular y plural (matriz ↔ matrices, límite ↔ límites), errores de dedo (1 letra en palabras de 6 o más, como en
   las respuestas) y la numeración de los temarios ("1.3 Binomios.", "Tema 4: binomios", "U2 – Binomios (parte 1)"). */
import {SINONIMOS} from './sinonimos.js';
export {SINONIMOS};

export const normal=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ+#/ ]+/g,' ').replace(/\s+/g,' ').trim();
const VACIAS=new Set(('de la el los las lo y e en a al del con por para un una unos unas o u su sus se que es son como sobre entre tema temas unidad unidades '+
  'introduccion conceptos concepto basicos basicas basico nociones uso usos estudio parte capitulo modulo bloque leccion sesion semana '+
  'practica ejercicios problemas repaso i ii iii iv vi vii viii ix x the of and to in on an vs y/o').split(' '));
// Singular sin acentos: matrices → matriz, límites → limit, ecuaciones → ecuacion, vectores → vector
export function singular(w){
  if(w.length<=3||/\d/.test(w))return w;
  if(/ces$/.test(w))w=w.slice(0,-3)+'z';
  else if(/[^aeiou]es$/.test(w)&&w.length>4)w=w.slice(0,-2);
  else if(/[aeiou]s$/.test(w))w=w.slice(0,-1);
  if(w.length>=4&&/e$/.test(w))w=w.slice(0,-1);
  return w;
}
// Palabras con significado: sin numeración ("1.3", "u2", "t4"), sin palabras vacías, en singular
export const palabras=s=>normal(s).split(' ').filter(w=>w&&!VACIAS.has(w)&&!/^[utms]?\d+(\/\d+)?[a-z]?$/.test(w)).map(singular);
// Errores de dedo: distancia de Levenshtein ≤ 1
function cerca1(a,b){
  if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;
  let i=0,j=0,d=0;
  while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++d>1)return false;
    if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++}}
  return d+(a.length-i)+(b.length-j)<=1;
}

/* ---------- índice del catálogo (se arma una vez por catálogo) ---------- */
const INDICES=new WeakMap();
function indice(catalogo){
  let ix=INDICES.get(catalogo);if(ix)return ix;
  const df=new Map(),items=catalogo.map(h=>{
    const clave=`${h.materia}/${h.id}`,frases=[h.titulo,...(SINONIMOS[clave]||[])].map(palabras).filter(f=>f.length);
    const vocab=new Set(frases.flat());for(const w of vocab)df.set(w,(df.get(w)||0)+1);
    return {h,clave,frases,vocab,area:areaDe(h)};
  });
  ix={items,df,vocab:new Set(df.keys())};INDICES.set(catalogo,ix);return ix;
}
// Corrige errores de dedo: una palabra de 6+ letras que no está en el vocabulario y está a 1 letra de una que sí
function corregir(ws,vocab){
  return ws.map(w=>{if(w.length<6||vocab.has(w))return w;for(const v of vocab)if(v.length>=5&&v[0]===w[0]&&cerca1(w,v))return v;return w});
}

/* ---------- contexto: palabras de la materia/unidad → áreas del catálogo ---------- */
const CONTEXTO=[
  {si:['hoja calculo','excel','ofimatica','office','informatica'],areas:['excel']},
  {si:['calculo integral','integral','integracion'],areas:['matematicas:calculo-integral']},
  {si:['calculo diferencial','derivada','diferencial','limite'],areas:['matematicas:calculo-diferencial']},
  {si:['calculo','calculus'],no:['hoja'],areas:['matematicas:calculo-diferencial','matematicas:calculo-integral']},
  {si:['algebra lineal','matriz','vectorial','vector'],areas:['matematicas:algebra-lineal']},
  {si:['algebra','ecuacion','polinomio'],no:['lineal','booleana'],areas:['matematicas:algebra-basica','matematicas:prealgebra','matematicas:precalculo']},
  {si:['precalculo','funcion','geometria analitica'],no:['python','programacion'],areas:['matematicas:precalculo','matematicas:algebra-basica']},
  {si:['trigonometria','geometria'],areas:['matematicas:trigonometria']},
  {si:['aritmetica','prealgebra','matematicas basicas','pensamiento matematico'],areas:['matematicas:prealgebra']},
  {si:['estadistica','probabilidad','inferencia','ciencia dato','analisis dato','bioestadistica','machine learning','aprendizaje automatico'],areas:['ciencia-datos']},
  {si:['programacion','python','algoritmo','computacion','software'],areas:['python']},
  {si:['redes','seguridad','ciberseguridad','telecomunicacion','ccna','security+'],areas:['ciberseguridad']},
  {si:['ingles','english','idioma','lengua extranjera','toefl'],areas:['ingles']}
];
const REGLAS=CONTEXTO.map(r=>({si:r.si.map(palabras),no:(r.no||[]).map(singular),areas:r.areas}));
function areaDe(h){return [h.materia,`${h.materia}:${h.temaId||''}`]}
export function areasContexto(contexto){
  const ws=new Set(palabras(contexto||''));if(!ws.size)return null;
  const out=new Set();
  for(const r of REGLAS)if(r.si.some(f=>f.every(w=>ws.has(w)))&&!r.no.some(w=>ws.has(w)))for(const a of r.areas)out.add(a);
  return out.size?out:null;
}

/* ---------- puntaje ---------- */
const peso=(df,w)=>1/(1+Math.log(1+(df.get(w)||0)));
function puntuar(ws,it,ix,areas){
  const tema=new Set(ws);let s=0;
  const conocidas=ws.filter(w=>it.vocab.has(w));
  const cobertura=conocidas.length/ws.length;
  for(const f of it.frases)if(f.every(w=>tema.has(w)))s=Math.max(s,.65+.25*Math.min(1,f.length/ws.length)+.1*cobertura);
  if(!s&&conocidas.length){
    // palabras sueltas: pesan más las raras; las que la app no conoce cuentan en contra
    let a=0,b=0;for(const w of ws){const p=ix.df.has(w)?peso(ix.df,w):1;b+=p;if(it.vocab.has(w))a+=p}
    if(conocidas.some(w=>(ix.df.get(w)||0)<=8))s=.62*a/b;
  }
  if(s&&areas)s+=it.area.some(a=>areas.has(a))?.2:-.1;
  return s;
}
export function opciones(texto,catalogo,{contexto='',n=3,minimo=.6}={}){
  const ix=indice(catalogo),ws=[...new Set(corregir(palabras(texto),ix.vocab))];if(!ws.length)return [];
  const areas=areasContexto(contexto);
  return ix.items.map(it=>({it,s:puntuar(ws,it,ix,areas)})).filter(x=>x.s>=minimo).sort((a,b)=>b.s-a.s).slice(0,n)
    .map(({it,s})=>({materia:it.h.materia,id:it.h.id,titulo:it.h.titulo,tema:it.h.tema||'',materiaNombre:it.h.materiaNombre||'',puntaje:Math.round(s*100)/100}));
}
export const CLARO=.8,SEPARACION=.12;
export function emparejar(texto,catalogo,o={}){
  const ops=opciones(texto,catalogo,o);if(!ops.length)return null;
  const [a,b]=ops,seguro=a.puntaje>=CLARO&&(!b||a.puntaje-b.puntaje>=SEPARACION);
  return {materia:a.materia,id:a.id,titulo:a.titulo,puntaje:a.puntaje,seguro,opciones:ops};
}
// Buscador «🔗 Elegir práctica de la app»: cada palabra escrita debe aparecer (también a medias: "binom") en el título,
// los sinónimos, el tema o la materia
export function buscar(q,catalogo){
  const qs=normal(q).split(' ').filter(Boolean);
  return catalogo.filter(h=>{if(!qs.length)return true;
    const t=' '+normal(`${h.titulo} ${h.tema||''} ${h.materiaNombre||''} ${(SINONIMOS[`${h.materia}/${h.id}`]||[]).join(' ')}`);
    return qs.every(w=>t.includes(' '+w)||(w.length>=4&&t.includes(w)));
  });
}
