/* Evaluador de fórmulas de Excel (sin DOM y sin librerías: también lo usa npm run revisar).
   Nombres en español como Excel en español (SUMA, BUSCARV…) y también en inglés (SUM, VLOOKUP…).
   Separador de argumentos ";" o "," (si la fórmula usa ";", la coma es el separador decimal: =REDONDEAR(A1;2) · =A1*0,5).
   Hoja: {celdas:{A1: número | texto | booleano | '=fórmula'}, filas, cols, hoy?}. Las fechas son números de serie
   (días desde el 30/12/1899, como Excel). Errores reales: #¡DIV/0!, #N/A, #¿NOMBRE?, #¡REF!, #¡VALOR!, #¡NUM!.
   evaluar(hoja, formula) → valor · valorCelda(hoja, 'B3') → valor · copiarFormula(f, 'C2', 'C5') → la fórmula copiada
   (las referencias relativas se mueven y las que llevan $ quedan fijas). */

export const ERR={div0:'#¡DIV/0!',na:'#N/A',nombre:'#¿NOMBRE?',ref:'#¡REF!',valor:'#¡VALOR!',num:'#¡NUM!',sintaxis:'#¡ERROR!'};
const err=c=>({err:c});
export const esError=v=>!!v&&typeof v==='object'&&typeof v.err==='string';
const esRango=v=>!!v&&typeof v==='object'&&Array.isArray(v.r);

/* ---------- referencias ---------- */
export const colANum=s=>[...s.toUpperCase()].reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0);
export const numACol=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
export const ref=(c,f)=>numACol(c)+f;
export const partes=r=>{const m=/^\$?([A-Z]{1,2})\$?(\d+)$/i.exec(r);return m?{c:colANum(m[1]),f:+m[2]}:null};

/* ---------- fechas (número de serie de Excel) ---------- */
const BASE=Date.UTC(1899,11,30);
export const serial=(a,m,d)=>Math.round((Date.UTC(a,m-1,d)-BASE)/864e5);
export const deSerial=n=>{const x=new Date(BASE+Math.floor(n)*864e5);return {a:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate()}};
export const textoFecha=n=>{const {a,m,d}=deSerial(n);return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${a}`};
const hoySerial=h=>{if(typeof h==='number')return h;const x=h instanceof Date?h:new Date();return serial(x.getFullYear(),x.getMonth()+1,x.getDate())};
// "2024-03-15" o "15/03/2024" → número de serie (las fechas escritas como texto, como hace Excel)
const leerFecha=s=>{let m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);if(m)return serial(+m[1],+m[2],+m[3]);m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);return m?serial(+m[3],+m[2],+m[1]):null};

/* ---------- conversión de tipos ---------- */
const numTexto=s=>{const t=String(s).trim().replace(/\s/g,'');if(/^[-+]?(\d+([.,]\d+)?|[.,]\d+)(e[-+]?\d+)?%?$/i.test(t)){const p=t.endsWith('%');const v=parseFloat(t.replace(',','.').replace('%',''));return p?v/100:v}return leerFecha(t)};
function aNum(v){
  if(esError(v))return v;
  if(v===null||v===undefined||v==='')return 0;
  if(typeof v==='number')return v;
  if(typeof v==='boolean')return v?1:0;
  const n=numTexto(v);return n===null||Number.isNaN(n)?err(ERR.valor):n;
}
export function aTexto(v){
  if(v===null||v===undefined)return '';
  if(typeof v==='boolean')return v?'VERDADERO':'FALSO';
  if(typeof v==='number')return String(+v.toPrecision(15));
  return String(v);
}
function aBool(v){
  if(esError(v))return v;
  if(v===null||v===undefined)return false;
  if(typeof v==='boolean')return v;
  if(typeof v==='number')return v!==0;
  const s=String(v).toUpperCase();if(s==='VERDADERO'||s==='TRUE')return true;if(s==='FALSO'||s==='FALSE')return false;
  return err(ERR.valor);
}
// Orden de Excel al comparar: números < textos < booleanos; los textos sin distinguir mayúsculas
const rango=v=>typeof v==='number'?0:typeof v==='string'?1:2;
function comparar(a,b){
  if(a===null||a===undefined)a=typeof b==='string'?'':typeof b==='boolean'?false:0;
  if(b===null||b===undefined)b=typeof a==='string'?'':typeof a==='boolean'?false:0;
  if(rango(a)!==rango(b))return rango(a)-rango(b);
  if(typeof a==='string'){const x=a.toLowerCase(),y=b.toLowerCase();return x<y?-1:x>y?1:0}
  return a<b?-1:a>b?1:0;
}

/* ---------- tokens ---------- */
const NOMBRE=/^[A-ZÁÉÍÓÚÑ_][A-Z0-9ÁÉÍÓÚÑ_.]*/i;
function tokens(f){
  // ¿usa ";" como separador? (fuera de los textos) → entonces la coma es decimal
  const sinTextos=f.replace(/"([^"]|"")*"/g,'');
  const puntoComa=sinTextos.includes(';');
  const t=[];let i=0;
  while(i<f.length){
    const ch=f[i];
    if(/\s/.test(ch)){i++;continue}
    if(ch==='"'){let s='',j=i+1;for(;;){if(j>=f.length)throw new Error('texto sin cerrar');if(f[j]==='"'){if(f[j+1]==='"'){s+='"';j+=2;continue}break}s+=f[j++]}t.push({t:'txt',v:s});i=j+1;continue}
    const resto=f.slice(i);
    let m=/^\$?[A-Z]{1,2}\$?\d+(:\$?[A-Z]{1,2}\$?\d+)?(?![A-Z0-9_.(])/i.exec(resto);
    if(m){t.push({t:'ref',v:m[0].toUpperCase()});i+=m[0].length;continue}
    m=(puntoComa?/^(\d+([.,]\d+)?|[.,]\d+)(e[-+]?\d+)?/i:/^(\d+(\.\d+)?|\.\d+)(e[-+]?\d+)?/i).exec(resto);
    if(m){t.push({t:'num',v:parseFloat(m[0].replace(',','.'))});i+=m[0].length;continue}
    m=NOMBRE.exec(resto);
    if(m){const n=m[0].toUpperCase();i+=m[0].length;
      if(f.slice(i).trimStart().startsWith('('))t.push({t:'fn',v:n});
      else if(['VERDADERO','TRUE'].includes(n))t.push({t:'bool',v:true});
      else if(['FALSO','FALSE'].includes(n))t.push({t:'bool',v:false});
      else t.push({t:'nombre',v:n});
      continue}
    const dos=f.slice(i,i+2);
    if(['<>','<=','>='].includes(dos)){t.push({t:'op',v:dos});i+=2;continue}
    if('+-*/^&=<>%():'.includes(ch)){t.push({t:'op',v:ch});i++;continue}
    if(ch===';'||ch===','){t.push({t:'sep'});i++;continue}
    throw new Error(`carácter inesperado «${ch}»`);
  }
  return t;
}

/* ---------- análisis (descenso recursivo) ---------- */
function analizar(f){
  const t=tokens(f);let i=0;
  const ver=()=>t[i],es=(tipo,v)=>t[i]&&t[i].t===tipo&&(v===undefined||t[i].v===v);
  const tomar=(tipo,v)=>{if(!es(tipo,v))throw new Error('fórmula incompleta');return t[i++]};
  const bin=(sig,ops)=>()=>{let a=sig();while(t[i]&&t[i].t==='op'&&ops.includes(t[i].v)){const op=t[i++].v;a={k:'op',op,a,b:sig()}}return a};
  const primario=()=>{
    const x=ver();if(!x)throw new Error('fórmula incompleta');
    if(x.t==='num'){i++;return {k:'val',v:x.v}}
    if(x.t==='txt'){i++;return {k:'val',v:x.v}}
    if(x.t==='bool'){i++;return {k:'val',v:x.v}}
    if(x.t==='ref'){i++;return x.v.includes(':')?{k:'rango',v:x.v}:{k:'ref',v:x.v}}
    if(x.t==='nombre'){i++;return {k:'val',v:err(ERR.nombre)}}
    if(x.t==='fn'){i++;tomar('op','(');const args=[];
      if(!es('op',')')){for(;;){if(es('sep')||es('op',')'))args.push({k:'vacio'});else args.push(expr());if(es('sep')){i++;continue}break}}
      tomar('op',')');return {k:'fn',n:x.v,args}}
    if(x.t==='op'&&x.v==='('){i++;const e=expr();tomar('op',')');return e}
    throw new Error('fórmula incompleta');
  };
  const postfijo=()=>{let a=primario();while(es('op','%')){i++;a={k:'pct',a}}return a};
  const unario=()=>{if(es('op','-')||es('op','+')){const op=t[i++].v;const a=unario();return op==='-'?{k:'neg',a}:a}return postfijo()};
  const potencia=bin(unario,['^']);
  const termino=bin(potencia,['*','/']);
  const suma=bin(termino,['+','-']);
  const concat=bin(suma,['&']);
  const expr=bin(concat,['=','<>','<','>','<=','>=']);
  const arbol=expr();
  if(i<t.length)throw new Error('sobra algo al final');
  return arbol;
}

/* ---------- evaluación ---------- */
const cacheArbol=new Map();
const arbolDe=f=>{if(!cacheArbol.has(f)){if(cacheArbol.size>2000)cacheArbol.clear();let a;try{a=analizar(f)}catch(e){a={k:'error',m:e.message}}cacheArbol.set(f,a)}return cacheArbol.get(f)};
export const errorDeEscritura=f=>{const a=arbolDe(String(f).replace(/^\s*=/,''));return a.k==='error'?a.m:null};

function leerRango(hoja,txt,ctx){
  const [a,b]=txt.split(':').map(partes);
  if(!a||!b)return err(ERR.ref);
  const c1=Math.min(a.c,b.c),c2=Math.max(a.c,b.c),f1=Math.min(a.f,b.f),f2=Math.max(a.f,b.f);
  if(c2>hoja.cols||f2>hoja.filas||c1<1||f1<1)return err(ERR.ref);
  const r=[];for(let f=f1;f<=f2;f++){const fila=[];for(let c=c1;c<=c2;c++)fila.push(valorEn(hoja,ref(c,f),ctx));r.push(fila)}
  return {r,c1,f1};
}
function valorEn(hoja,r,ctx){
  const p=partes(r);if(!p||p.c>hoja.cols||p.f>hoja.filas)return err(ERR.ref);
  const k=ref(p.c,p.f),v=hoja.celdas[k];
  if(typeof v==='string'&&v.startsWith('=')){
    if(ctx.memo.has(k))return ctx.memo.get(k);
    if(ctx.pila.has(k))return err(ERR.ref); // referencia circular
    ctx.pila.add(k);const x=ev(hoja,arbolDe(v.slice(1)),ctx);ctx.pila.delete(k);
    const res=esRango(x)?x.r[0][0]:x;ctx.memo.set(k,res);return res;
  }
  return v===undefined||v===''?null:v;
}
const plano=v=>esRango(v)?v.r.flat():[v];
function ev(hoja,n,ctx){
  switch(n.k){
    case 'val':return n.v;
    case 'vacio':return null;
    case 'error':return err(ERR.sintaxis);
    case 'ref':return valorEn(hoja,n.v,ctx);
    case 'rango':return leerRango(hoja,n.v,ctx);
    case 'neg':{const a=aNum(escalar(ev(hoja,n.a,ctx)));return esError(a)?a:-a}
    case 'pct':{const a=aNum(escalar(ev(hoja,n.a,ctx)));return esError(a)?a:a/100}
    case 'op':{
      const a=escalar(ev(hoja,n.a,ctx)),b=escalar(ev(hoja,n.b,ctx));
      if(esError(a))return a;if(esError(b))return b;
      if(n.op==='&')return aTexto(a)+aTexto(b);
      if(['=','<>','<','>','<=','>='].includes(n.op)){const c=comparar(a,b);return {'=':c===0,'<>':c!==0,'<':c<0,'>':c>0,'<=':c<=0,'>=':c>=0}[n.op]}
      const x=aNum(a),y=aNum(b);if(esError(x))return x;if(esError(y))return y;
      if(n.op==='+')return x+y;if(n.op==='-')return x-y;if(n.op==='*')return x*y;
      if(n.op==='/')return y===0?err(ERR.div0):x/y;
      if(n.op==='^'){const r=x**y;return Number.isFinite(r)?r:err(ERR.num)}
      return err(ERR.valor);
    }
    case 'fn':{
      const f=FUNC[n.n]||FUNC[ALIAS[n.n]];
      if(!f)return err(ERR.nombre);
      const args=n.args.map(a=>()=>ev(hoja,a,ctx));args.vacio=n.args.map(a=>a.k==='vacio');
      try{return f(args,ctx,hoja)}catch(e){return err(ERR.valor)}
    }
  }
  return err(ERR.valor);
}
// Un rango donde se espera un valor: si es de una sola celda, ese valor; si no, #¡VALOR!
const escalar=v=>esRango(v)?(v.r.length===1&&v.r[0].length===1?v.r[0][0]:err(ERR.valor)):v;

/* ---------- funciones ---------- */
// Números de los argumentos: en rangos solo cuentan los números; escritos directo, se convierten
function numeros(args,{errores=true}={}){
  const l=[];
  for(const a of args){const v=a();
    if(esRango(v)){for(const x of v.r.flat()){if(esError(x)){if(errores)throw x;continue}if(typeof x==='number')l.push(x)}}
    else{if(v===null)continue;const x=aNum(v);if(esError(x)){if(errores)throw x;continue}l.push(x)}}
  return l;
}
const conErr=fn=>(args,ctx,h)=>{try{return fn(args,ctx,h)}catch(e){if(esError(e))return e;throw e}};
const redondear=(x,d)=>{const f=10**d,s=Math.sign(x);return s*Math.round(+(Math.abs(x)*f).toPrecision(15))/f};
// Criterio de CONTAR.SI / SUMAR.SI: ">50", "<>Norte", "=0", "Nor*", 25, VERDADERO…
export function criterio(c){
  if(typeof c==='number'||typeof c==='boolean')return v=>comparar(v,c)===0&&typeof v===typeof c;
  const s=aTexto(c),m=/^(<=|>=|<>|<|>|=)?(.*)$/s.exec(s),op=m[1]||'=',resto=m[2];
  const n=resto.trim()!==''?numTexto(resto):null;
  if(n!==null&&!Number.isNaN(n)){
    return v=>{if(typeof v!=='number')return op==='<>';const c2=v<n?-1:v>n?1:0;return {'=':c2===0,'<>':c2!==0,'<':c2<0,'>':c2>0,'<=':c2<=0,'>=':c2>=0}[op]}}
  if(resto===''){return v=>op==='<>'?!(v===null||v===''):op==='='?(v===null||v===''):false}
  if(op==='='||op==='<>'){const re=comodin(resto);return v=>{const ok=v!==null&&typeof v!=='number'&&typeof v!=='boolean'&&re.test(aTexto(v));return op==='='?ok:!ok}}
  return v=>typeof v==='string'&&{'<':comparar(v,resto)<0,'>':comparar(v,resto)>0,'<=':comparar(v,resto)<=0,'>=':comparar(v,resto)>=0}[op];
}
const comodin=s=>new RegExp('^'+s.replace(/~([*?~])|([.+^${}()|[\]\\])|(\*)|(\?)/g,(m,esc,rx,ast,q)=>esc?'\\'+esc:rx?'\\'+rx:ast?'.*':'.')+'$','is');
const celdasDe=v=>esRango(v)?v.r.flat():[v];
const coincide=(v,b)=>typeof b==='string'&&/[*?]/.test(b)?typeof v==='string'&&comodin(b).test(v):comparar(v,b)===0&&rango(v??0)===rango(b??0);
function buscarPos(b,lista,modo){ // modo 0 exacto · 1 mayor ≤ (ascendente) · -1 menor ≥ (descendente)
  if(modo===0){const i=lista.findIndex(v=>coincide(v,b));return i}
  let pos=-1;
  for(let i=0;i<lista.length;i++){const v=lista[i];if(v===null||rango(v)!==rango(b))continue;const c=comparar(v,b);
    if(c===0)return i;if(modo===1){if(c<0)pos=i;else break}else{if(c>0)pos=i;else break}}
  return pos;
}
const columna=(v,k)=>v.r.map(f=>f[k]),fila=(v,k)=>v.r[k];
const vectorDe=v=>esRango(v)?(v.r.length===1?v.r[0]:v.r.map(f=>f[0])):[v];
const texto1=a=>{const v=escalar(a());if(esError(v))throw v;return aTexto(v)};
const num1=(a,def)=>{if(!a)return def;const v=escalar(a());if(v===null&&def!==undefined)return def;const x=aNum(v);if(esError(x))throw x;return x};
const pares=(args,desde)=>{const l=[];for(let i=desde;i+1<args.length;i+=2)l.push([args[i](),args[i+1]()]);return l};
const filtrarPares=(ps,n)=>{const ok=Array(n).fill(true);for(const [r,c] of ps){const cel=celdasDe(r);if(cel.length!==n)throw err(ERR.valor);const cr=criterio(escalar(c));cel.forEach((v,i)=>{if(!cr(v))ok[i]=false})}return ok};

const FUNC={
  SUMA:conErr(a=>numeros(a).reduce((s,x)=>s+x,0)),
  PROMEDIO:conErr(a=>{const l=numeros(a);return l.length?l.reduce((s,x)=>s+x,0)/l.length:err(ERR.div0)}),
  CONTAR:a=>{let n=0;for(const f of a){const v=f();if(esRango(v))n+=v.r.flat().filter(x=>typeof x==='number').length;else if(typeof v==='number'||typeof v==='boolean'||(typeof v==='string'&&numTexto(v)!==null))n++}return n},
  CONTARA:a=>{let n=0;for(const f of a){const v=f();for(const x of celdasDe(v))if(x!==null&&x!=='')n++}return n},
  'CONTAR.BLANCO':a=>celdasDe(a[0]()).filter(x=>x===null||x==='').length,
  MAX:conErr(a=>{const l=numeros(a);return l.length?Math.max(...l):0}),
  MIN:conErr(a=>{const l=numeros(a);return l.length?Math.min(...l):0}),
  REDONDEAR:conErr(a=>redondear(num1(a[0]),Math.trunc(num1(a[1],0)))),
  ABS:conErr(a=>Math.abs(num1(a[0]))),
  ENTERO:conErr(a=>Math.floor(num1(a[0]))),
  SI:(a)=>{const c=aBool(escalar(a[0]()));if(esError(c))return c;return c?(a[1]&&!a.vacio[1]?escalar(a[1]()):a[1]?0:true):(a[2]?(a.vacio[2]?0:escalar(a[2]())):false)},
  Y:conErr(a=>{let hay=false;for(const f of a){const v=f();for(const x of celdasDe(v)){if(esError(x))throw x;if(esRango(v)&&(x===null||typeof x==='string'))continue;const b=aBool(x);if(esError(b))throw b;hay=true;if(!b)return false}}return hay?true:err(ERR.valor)}),
  O:conErr(a=>{let hay=false,r=false;for(const f of a){const v=f();for(const x of celdasDe(v)){if(esError(x))throw x;if(esRango(v)&&(x===null||typeof x==='string'))continue;const b=aBool(x);if(esError(b))throw b;hay=true;if(b)r=true}}return hay?r:err(ERR.valor)}),
  NO:conErr(a=>{const b=aBool(escalar(a[0]()));if(esError(b))throw b;return !b}),
  'SI.ERROR':a=>{const v=escalar(a[0]());return esError(v)?escalar(a[1]()):v},
  'CONTAR.SI':conErr(a=>{const cr=criterio(escalar(a[1]()));return celdasDe(a[0]()).filter(cr).length}),
  'CONTAR.SI.CONJUNTO':conErr(a=>{const ps=pares(a,0),n=celdasDe(ps[0][0]).length;return filtrarPares(ps,n).filter(Boolean).length}),
  'SUMAR.SI':conErr(a=>{const r=celdasDe(a[0]()),cr=criterio(escalar(a[1]())),s=a[2]?celdasDe(a[2]()):r;let t=0;r.forEach((v,i)=>{if(cr(v)&&typeof s[i]==='number')t+=s[i]});return t}),
  'SUMAR.SI.CONJUNTO':conErr(a=>{const s=celdasDe(a[0]()),ok=filtrarPares(pares(a,1),s.length);return s.reduce((t,x,i)=>ok[i]&&typeof x==='number'?t+x:t,0)}),
  'PROMEDIO.SI':conErr(a=>{const r=celdasDe(a[0]()),cr=criterio(escalar(a[1]())),s=a[2]?celdasDe(a[2]()):r;const l=[];r.forEach((v,i)=>{if(cr(v)&&typeof s[i]==='number')l.push(s[i])});return l.length?l.reduce((x,y)=>x+y,0)/l.length:err(ERR.div0)}),
  BUSCARV:conErr(a=>{
    const b=escalar(a[0]());if(esError(b))throw b;const t=a[1]();if(!esRango(t))throw err(ERR.valor);
    const k=num1(a[2]);if(k<1)throw err(ERR.valor);if(k>t.r[0].length)throw err(ERR.ref);
    const aprox=a[3]&&!a.vacio[3]?aBool(escalar(a[3]())):true;if(esError(aprox))throw aprox;
    const i=buscarPos(b,columna(t,0),aprox?1:0);return i<0?err(ERR.na):(t.r[i][Math.trunc(k)-1]??0)}),
  BUSCARX:conErr(a=>{
    const b=escalar(a[0]());if(esError(b))throw b;const en=a[1](),dev=a[2]();if(!esRango(en)||!esRango(dev))throw err(ERR.valor);
    const lista=vectorDe(en),modo=a[4]?num1(a[4],0):0;
    let i;
    if(modo===0||modo===2)i=lista.findIndex(v=>modo===2?coincide(v,b):comparar(v,b)===0&&rango(v??0)===rango(b));
    else{i=lista.findIndex(v=>comparar(v,b)===0&&rango(v??0)===rango(b));
      if(i<0){let mejor=-1;lista.forEach((v,j)=>{if(v===null||rango(v)!==rango(b))return;const c=comparar(v,b);if(modo===-1&&c<0&&(mejor<0||comparar(v,lista[mejor])>0))mejor=j;if(modo===1&&c>0&&(mejor<0||comparar(v,lista[mejor])<0))mejor=j});i=mejor}}
    if(i<0)return a[3]&&!a.vacio[3]?escalar(a[3]()):err(ERR.na);
    const vd=en.r.length===1?dev.r.map(f=>f[i]):dev.r[i];return vd?.[0]??0}),
  INDICE:conErr(a=>{const m=a[0]();if(!esRango(m))throw err(ERR.valor);
    let f=num1(a[1],0),c=a[2]?num1(a[2],0):0;
    if(m.r.length===1&&!a[2]){c=f;f=1}else if(m.r[0].length===1&&!c)c=1;
    if(f<1||c<1)throw err(ERR.valor);if(f>m.r.length||c>m.r[0].length)throw err(ERR.ref);
    return m.r[Math.trunc(f)-1][Math.trunc(c)-1]??0}),
  COINCIDIR:conErr(a=>{const b=escalar(a[0]());if(esError(b))throw b;const l=vectorDe(a[1]()),t=a[2]&&!a.vacio[2]?num1(a[2]):1;
    const i=buscarPos(b,l,t===0?0:t>0?1:-1);return i<0?err(ERR.na):i+1}),
  CONCATENAR:conErr(a=>a.map(texto1).join('')),
  CONCAT:conErr(a=>a.map(f=>{const v=f();return celdasDe(v).map(x=>{if(esError(x))throw x;return aTexto(x)}).join('')}).join('')),
  IZQUIERDA:conErr(a=>{const s=texto1(a[0]),n=num1(a[1],1);if(n<0)throw err(ERR.valor);return s.slice(0,Math.trunc(n))}),
  DERECHA:conErr(a=>{const s=texto1(a[0]),n=num1(a[1],1);if(n<0)throw err(ERR.valor);return n===0?'':s.slice(-Math.trunc(n))}),
  EXTRAE:conErr(a=>{const s=texto1(a[0]),i=num1(a[1]),n=num1(a[2]);if(i<1||n<0)throw err(ERR.valor);return s.substr(Math.trunc(i)-1,Math.trunc(n))}),
  LARGO:conErr(a=>texto1(a[0]).length),
  MAYUSC:conErr(a=>texto1(a[0]).toUpperCase()),
  MINUSC:conErr(a=>texto1(a[0]).toLowerCase()),
  NOMPROPIO:conErr(a=>texto1(a[0]).toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu,(m,x,y)=>x+y.toUpperCase())),
  ESPACIOS:conErr(a=>texto1(a[0]).replace(/ +/g,' ').trim()),
  HOY:(a,ctx,h)=>hoySerial(h.hoy),
  FECHA:conErr(a=>{const x=Math.round((Date.UTC(num1(a[0]),num1(a[1])-1,num1(a[2]))-BASE)/864e5);if(x<0)throw err(ERR.num);return x}),
  DIAS:conErr(a=>{const f=v=>{const x=escalar(v());if(typeof x==='string'){const s=leerFecha(x.trim());if(s===null)throw err(ERR.valor);return s}const n=aNum(x);if(esError(n))throw n;return Math.floor(n)};return f(a[0])-f(a[1])}),
  'AÑO':conErr(a=>deSerial(num1(a[0])).a),
  MES:conErr(a=>deSerial(num1(a[0])).m),
  DIA:conErr(a=>deSerial(num1(a[0])).d)
};
// Nombres en inglés (y escrituras sin acento o con punto)
const ALIAS={SUM:'SUMA',AVERAGE:'PROMEDIO',COUNT:'CONTAR',COUNTA:'CONTARA',COUNTBLANK:'CONTAR.BLANCO',ROUND:'REDONDEAR',INT:'ENTERO',IF:'SI',AND:'Y',OR:'O',NOT:'NO',IFERROR:'SI.ERROR',
  COUNTIF:'CONTAR.SI',COUNTIFS:'CONTAR.SI.CONJUNTO',SUMIF:'SUMAR.SI',SUMIFS:'SUMAR.SI.CONJUNTO',AVERAGEIF:'PROMEDIO.SI',VLOOKUP:'BUSCARV',XLOOKUP:'BUSCARX',INDEX:'INDICE',ÍNDICE:'INDICE',
  MATCH:'COINCIDIR',CONCATENATE:'CONCATENAR',LEFT:'IZQUIERDA',RIGHT:'DERECHA',MID:'EXTRAE',LEN:'LARGO',UPPER:'MAYUSC',LOWER:'MINUSC',PROPER:'NOMPROPIO',TRIM:'ESPACIOS',
  TODAY:'HOY',DATE:'FECHA',DAYS:'DIAS',DÍAS:'DIAS',YEAR:'AÑO',ANO:'AÑO',MONTH:'MES',DAY:'DIA',DÍA:'DIA'};
export const FUNCIONES=Object.keys(FUNC);
export const nombreIngles=n=>Object.keys(ALIAS).find(k=>ALIAS[k]===n&&/^[A-Z]+$/.test(k));

/* ---------- API ---------- */
export const crearHoja=(celdas={},{filas=12,cols=8,hoy}={})=>({celdas,filas,cols,hoy});
const ctxNuevo=()=>({memo:new Map(),pila:new Set()});
export function evaluar(hoja,formula,{en}={}){
  const f=String(formula).trim().replace(/^=/,'');
  if(!f)return null;
  const a=arbolDe(f);if(a.k==='error')return err(ERR.sintaxis);
  const ctx=ctxNuevo();if(en)ctx.pila.add(en);
  const v=ev(hoja,a,ctx);
  return esRango(v)?(v.r.length===1&&v.r[0].length===1?v.r[0][0]:err(ERR.valor)):v;
}
export const valorCelda=(hoja,r)=>valorEn(hoja,r,ctxNuevo());
// Copia una fórmula de una celda a otra: mueve las referencias relativas y deja fijo lo que lleva $
export function copiarFormula(formula,de,a){
  const d=partes(de),b=partes(a),dc=b.c-d.c,df=b.f-d.f;
  return String(formula).replace(/"([^"]|"")*"|(\$?)([A-Z]{1,2})(\$?)(\d+)(?![A-Z0-9_(])/gi,(m,_t,dc1,col,df1,fil)=>{
    if(m.startsWith('"'))return m;
    const c=dc1?colANum(col):colANum(col)+dc,f=df1?+fil:+fil+df;
    return c<1||f<1?'#¡REF!':`${dc1}${numACol(c)}${df1}${f}`});
}
// Lo que se ve en la celda: números con hasta 10 decimales, VERDADERO/FALSO, errores tal cual; con formato fecha, moneda o %
export function mostrar(v,formato){
  if(esError(v))return v.err;
  if(v===null||v===undefined)return '';
  if(typeof v==='boolean')return v?'VERDADERO':'FALSO';
  if(typeof v==='number'){
    if(formato==='fecha')return textoFecha(v);
    if(formato==='moneda')return (v<0?'-$':'$')+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(formato==='%')return +(v*100).toFixed(2)+'%';
    if(formato==='%0')return Math.round(v*100)+'%';
    return String(+v.toFixed(10));
  }
  return String(v);
}
// ¿Dos resultados son iguales? (números con tolerancia, textos exactos, errores por su código)
export function mismoValor(a,b){
  if(esError(a)||esError(b))return esError(a)&&esError(b)&&a.err===b.err;
  if(typeof a==='number'&&typeof b==='number')return Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
  if((a===null||a==='')&&(b===null||b===''))return true;
  return a===b;
}
