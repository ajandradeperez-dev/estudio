/* npm run auditar-mate (también lo llama npm run revisar): auditoría de EXACTITUD de Álgebra, Funciones (precálculo) y
   Álgebra lineal, más allá de la Definición de terminado (que mira la estructura). Para cada generador, 200 ejercicios por
   nivel con semillas fijas y, con un cálculo distinto al del generador:
   - la respuesta: su `comprobar()` (sustituir, probar puntos…) y, en Álgebra lineal, verificadores propios (A·x = b, A·A⁻¹ = I,
     det por cofactores y por eliminación, A·v = λv, rango, ortogonalidad…) a partir de los datos del ejercicio (`p.datos`);
   - cada paso: las cadenas de igualdades que solo tienen números (\(3·4 + 2 = 14\)) se evalúan, y deben cumplirse;
   - la escritura: nada de -0, 1x, + -3, x^1, 0.30000000000000004, NaN, undefined ni fracciones sin simplificar en la respuesta;
   - ejercicios degenerados: respuestas no finitas o divisiones entre 0;
   - los errores típicos: distintos de la respuesta correcta (antes del filtro de crear());
   - la pista 2: con los números del ejercicio.
   node scripts/auditar-mate.mjs [--detalle] [--solo <gen>] [--n 200]: con --detalle muestra el primer caso de cada problema. */
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','src');
const imp=r=>import(pathToFileURL(join(raiz,r)).href);
const {GENERADORES,crear}=await imp('nucleo/generadores/index.js');
const {compilar}=await imp('nucleo/generadores/verificar.js');
const {crearRng}=await imp('nucleo/rng.js');
const {escalera,pistaConDatos}=await imp('nucleo/pistas.js');
const {verificarLineal}=await imp('nucleo/generadores/auditoria.js');
const temas=(await imp('materias/matematicas/temas.js')).default;

const arg=process.argv.slice(2),detalle=arg.includes('--detalle'),solo=arg.includes('--solo')?arg[arg.indexOf('--solo')+1]:null;
const N=arg.includes('--n')?+arg[arg.indexOf('--n')+1]:200;
export const TEMAS_AUDITADOS=['algebra-basica','precalculo','algebra-lineal'];

/* ---------- utilidades ---------- */
const formulas=t=>[...String(t??'').matchAll(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g)].map(m=>m[1]||m[2]);
const sinHtml=t=>String(t??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&minus;/g,'−');
const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
// \cambio{X} → X (resaltado, no agrupa)
function quitarCambio(s){for(let k=0;k<20;k++){const i=s.indexOf('\\cambio{');if(i<0)break;let p=1,j=i+8;while(j<s.length&&p){if(s[j]==='{')p++;else if(s[j]==='}')p--;j++}s=s.slice(0,i)+s.slice(i+8,j-1)+s.slice(j)}return s}
// TeX → expresión de compilar(); null si tiene algo que no es aritmética pura
function texANum(tex){
  let s=String(tex);
  if(/\\begin|\\(?:text|mathrm|operatorname|quad|qquad|lim|int|sum|vec|mathbf|boxed|overline|underbrace|approx|pm|mp|infty|in|le|ge|lt|gt|neq|ne|to|Rightarrow|implies|det|ln|log|sin|cos|tan|sen|binom|choose|dots|ldots|cdots|angle|circ|deg|%)/.test(s))return null;
  s=quitarCambio(s).replace(/\\left|\\right|\\!|\\,|\\;|\\:|\\ /g,'').replace(/\\cdot|\\times/g,'*').replace(/\\div/g,'/')
    .replace(/\\dfrac|\\tfrac/g,'\\frac').replace(/−/g,'-');
  for(let k=0;k<12&&/\\frac|\\sqrt/.test(s);k++)s=s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]*)\}/g,'sqrt($1)').replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g,'(($2)^(1/($1)))');
  s=s.replace(/\\pi/g,'pi').replace(/\{/g,'(').replace(/\}/g,')').replace(/\[/g,'(').replace(/\]/g,')');
  if(/\\|[a-oq-z]|[A-Z]|[^0-9.+\-*/^() a-z]/.test(s.replace(/sqrt|pi/g,'')))return null;
  if(!/\d/.test(s))return null;
  return s.trim();
}
function decimales(s){const m=String(s).trim().match(/^-?\d+\.(\d+)$/);return m?m[1].length:null}
// Cadenas de igualdades con solo números: cada lado vale lo mismo
function igualdadesNumericas(tex){
  const fallas=[];
  for(const lin of String(tex).split(/\\\\|&/)){
    if(/\\approx|≈/.test(lin))continue;
    const partes=[];let prof=0,ini=0;
    for(let i=0;i<lin.length;i++){const c=lin[i];if('({['.includes(c))prof++;else if(')}]'.includes(c))prof--;else if(c==='='&&prof===0&&lin[i-1]!=='\\'&&lin[i-1]!=='!'&&lin[i-1]!=='<'&&lin[i-1]!=='>'){partes.push(lin.slice(ini,i));ini=i+1}}
    partes.push(lin.slice(ini));
    if(partes.length<2)continue;
    const val=partes.map(p=>{const e=texANum(p);if(e===null)return null;try{const v=compilar(e)({});return Number.isFinite(v)?{v,d:decimales(e)}:null}catch(x){return null}});
    const operacion=partes.map(p=>{const e=texANum(p);return !!e&&/\d\s*[-+*/^]|sqrt|pi|\)/.test(e.replace(/^\s*-/,''))});
    const redondeado=partes.map(p=>/\d\.\d/.test(p));
    for(let i=0;i+1<val.length;i++){const a=val[i],b=val[i+1];if(!a||!b)continue;
      if(!operacion[i]&&!operacion[i+1])continue;   // «0 = −5»: una afirmación (sistema sin solución), no una cuenta
      const d=Math.min(a.d??99,b.d??99),rel=(redondeado[i]||redondeado[i+1])?2e-3:1e-6,tol=(d<99?0.51*10**-d:0)+rel*Math.max(1,Math.abs(a.v));
      if(Math.abs(a.v-b.v)>tol)fallas.push(`${partes[i].trim()} = ${partes[i+1].trim()} (${+a.v.toFixed(6)} ≠ ${+b.v.toFixed(6)})`)}
  }
  return fallas;
}
// Escritura: lo que nunca debe aparecer (en fórmulas y texto)
const FEO=[
  ['NaN/undefined',/\bNaN\b|\bundefined\b|\bnull\b|\[object|Infinity/],
  ['decimal sin redondear',/\d\.\d*?(\d)\1{6,}\d|\d\.\d{10,}/],
  ['-0',/(^|[(,=\[{&:]\s*)[-−]\s?0(?![\d.,])/],
  ['0x',/(^|[^\d.,])0\s?(\\lambda|[xyz])(?![a-z])/],
  ['+ -',/\+\s*[-−]\s*[\d\w(\\]/],
  ['- -',/(^|[^-−])[-−]\s+[-−]\s*\d/],
  ['1x',/(^|[^\d.,\w\\{^_])1\s?([xyzk]|\\lambda)(?![a-z])/],
  ['x^1',/[a-z)]\s*\^\s*\{?1\}?(?![\d.,/])/],
];
function feos(t){const r=[];for(const f of formulas(quitarCambio(String(t??'')))){for(const [n,re] of FEO)if(re.test(f))r.push(n)}
  const txt=sinHtml(String(t??'').replace(/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/g,' '));
  for(const [n,re] of FEO.slice(0,2))if(re.test(txt))r.push(n);
  return r}
// Fracciones sin simplificar en la respuesta (a/b con mcd > 1 o denominador 1)
function fraccionFea(resp){
  const s=String(resp);
  for(const m of s.matchAll(/(?<![\d.^√)])(-?\d+)\s*\/\s*(\d+)(?![\d.])/g)){const a=+m[1],b=+m[2];if(b===1||b!==0&&mcd(a,b)>1)return m[0]}
  for(const m of s.matchAll(/\\frac\{(-?\d+)\}\{(\d+)\}/g)){const a=+m[1],b=+m[2];if(b===1||mcd(a,b)>1)return m[0]}
  return null;
}

// Un comprobar() que no comprueba: «()=>true», o solo igualdades de algo consigo mismo («a+b===a+b»)
export function comprobarVacio(f){
  const s=String(f).replace(/\s/g,'');if(/^\(\)=>(true|!0)$/.test(s))return true;
  const m=s.match(/^\(\)=>(.*)$/);if(!m||/[{};]/.test(m[1]))return false;
  const partes=m[1].split('&&');return partes.every(p=>{const q=p.replace(/^\(|\)$/g,'').split('===');return q.length===2&&q[0]===q[1]});
}

/* ---------- la auditoría ---------- */
export function auditar({n=N,solo:s=null,temasIds=TEMAS_AUDITADOS}={}){
  const gens=[...new Set(temas.filter(t=>temasIds.includes(t.id)).flatMap(t=>t.nodos.filter(x=>x.gen).map(x=>x.gen)))].filter(g=>GENERADORES[g]&&(!s||g===s));
  const informe={};let total=0;
  for(const id of gens){
    const prob={},anota=(tipo,p,extra)=>{(prob[tipo]??={n:0,ej:null}).n++;prob[tipo].ej??=`n${p.nivel} ${p.plantilla||''}: ${sinHtml(p.enunciado).replace(/\s+/g,' ').slice(0,110)} → ${String(p.respuesta).slice(0,60)}${extra?' · '+extra:''}`};
    let sinComprobar=0,conAuditor=0;const porPlantilla={};
    for(let nivel=1;nivel<=5;nivel++)for(let i=0;i<n;i++){
      const semilla=i*7919+nivel*31+7;let p;
      try{p=crear(id,nivel,{semilla})}catch(e){anota('falla al generar',{nivel,enunciado:e.message,respuesta:''});continue}
      total++;
      // respuesta: comprobación independiente
      if(p.comprobar){let ok=false;try{ok=p.comprobar()}catch(e){}if(!ok)anota('respuesta: comprobar() falla',p)}else sinComprobar++;
      // la respuesta del generador tiene que pasar su propio verificar (p. ej. una factorización incompleta no pasa)
      {const t=p.tipo||'escribir';let ok=true;try{ok=t==='opcion'||t==='emparejar'?true:t==='ordenar'?p.verificar(p.respuesta):p.verificar(p.forma?p.celdas:p.respuesta)}catch(e){ok=false}if(!ok)anota('la respuesta no pasa su propio verificar',p)}
      // trivial: un comprobar() que siempre da true no comprueba nada
      if(p.comprobar&&comprobarVacio(p.comprobar))anota('comprobar() trivial o tautológico (no comprueba nada)',p);
      // Álgebra lineal: verificación independiente leyendo el enunciado (auditoria.js)
      if(id.startsWith('al/')){let r=null;try{r=verificarLineal(p)}catch(e){r={ok:false,por:'error del verificador: '+e.message}}
        if(r){conAuditor++;if(!r.ok)anota('respuesta: verificación independiente',p,r.por)}}
      // respuesta finita y sin escritura fea
      const t=p.tipo||'escribir';
      if(t==='escribir'&&!p.forma){const f=fraccionFea(p.respuesta);if(f)anota('fracción sin simplificar en la respuesta',p,f)}
      if(/\bNaN\b|Infinity|undefined/.test(String(p.respuesta)+String(p.celdas??'')))anota('respuesta no finita',p);
      const textos=[p.enunciado,p.respuesta,...(p.pasos||[]).flatMap(x=>[x.que,x.como,x.res])];
      const permitido=new Set(GENERADORES[id].auditoria?.permitir?.[p.plantilla]||GENERADORES[id].auditoria?.permitir?.['*']||[]);
      const fs=new Set(textos.flatMap(feos));for(const f of fs)if(!permitido.has(f))anota(`escritura: ${f}`,p,textos.map(sinHtml).find(x=>feos(x).includes(f))?.slice(0,140));
      // pasos: las igualdades numéricas se cumplen
      for(const x of p.pasos||[])for(const f of formulas(x.como).concat(formulas(x.que))){const m=igualdadesNumericas(f);if(m.length){anota('paso con cuentas que no salen',p,`«${x.que}»: ${m[0]}`);break}}
      // errores típicos (sin el filtro de crear): distintos de la respuesta
      if(t==='escribir'&&!p.forma){let crudo;try{crudo=GENERADORES[id].generar(p.nivel,crearRng(p.semilla))}catch(e){}
        const k=`${p.nivel}/${p.plantilla||''}`;(porPlantilla[k]??={n:0,ig:{},ej:{}}).n++;
        for(const e of crudo?.errores||[])if(e.valor!==undefined){let ig=false;try{ig=p.verificar(e.valor)}catch(x){}if(ig){const q=String(e.por);porPlantilla[k].ig[q]=(porPlantilla[k].ig[q]||0)+1;porPlantilla[k].ej[q]??=p}}}
      // pista 2 con los números del ejercicio
      if(escalera(p)&&!pistaConDatos(p))anota('pista 2 sin los números del ejercicio',p);
    }
    // Un error típico que coincide con la respuesta por casualidad (x = 2: x² = 2x) lo descarta crear(); si pasa en la
    // mitad de los ejercicios de una plantilla, el distractor está mal pensado
    for(const x of Object.values(porPlantilla))for(const [q,c] of Object.entries(x.ig))if(x.n>=10&&c/x.n>=.5){(prob['error típico igual a la respuesta (sistemático)']??={n:0,ej:null}).n+=c;prob['error típico igual a la respuesta (sistemático)'].ej??=`n${x.ej[q].nivel} ${x.ej[q].plantilla}: «${q.slice(0,70)}» en ${c} de ${x.n}: ${sinHtml(x.ej[q].enunciado).slice(0,80)}`}
    const errores=Object.values(prob).reduce((a,x)=>a+x.n,0);
    informe[id]={errores,prob,sinComprobar,conAuditor};
  }
  return {informe,total};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const {informe,total}=auditar({solo});
  let malos=0;
  for(const [id,r] of Object.entries(informe)){
    const cob=(r.sinComprobar?` · ${r.sinComprobar} sin comprobar()`:'')+(r.conAuditor?` · ${r.conAuditor} con verificación independiente`:'');
    if(!r.errores){if(detalle)console.log(`✓ ${id}${cob}`);continue}
    malos++;console.log(`✗ ${id}: ${r.errores} problemas${cob}`);
    for(const [t,x] of Object.entries(r.prob))console.log(`   ${t}: ${x.n}${detalle?`\n      ${x.ej}`:''}`);
  }
  console.log(`\nauditoría de Matemáticas: ${Object.keys(informe).length} generadores, ${total} ejercicios, ${malos} con problemas`);
  process.exit(malos?1:0);
}
