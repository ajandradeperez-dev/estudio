/* Verificación tolerante para los generadores (sin DOM):
   - números con tolerancia, fracciones y decimales ("x = 3/2", "1,5", "-0.5", "√2", "3π")
   - expresiones algebraicas equivalentes: se evalúan en varios puntos al azar ("2x+2" = "2(x+1)")
   - vectores y matrices celda por celda, conjuntos de soluciones
   - inglés: mayúsculas, puntuación y contracciones ("doesn't" = "does not") */

/* ---------- normalización ---------- */
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';
export const limpiar=s=>String(s??'').trim()
  .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,d=>'^'+[...d].map(c=>SUP.indexOf(c)).join(''))
  .replace(/[−–—]/g,'-').replace(/[×·∙]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/√/g,'sqrt')
  .replace(/\s+/g,' ');

/* ---------- expresiones: parser pequeño con multiplicación implícita ---------- */
const FUNCIONES={sqrt:Math.sqrt,sen:Math.sin,sin:Math.sin,cos:Math.cos,tan:Math.tan,tg:Math.tan,ln:Math.log,log:Math.log10,exp:Math.exp,abs:Math.abs};
function tokens(s){
  const t=[];let i=0;
  while(i<s.length){
    const c=s[i];
    if(c===' '){i++;continue}
    if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;const v=s.slice(i,j);if((v.match(/\./g)||[]).length>1)throw new Error('número');t.push({t:'n',v:parseFloat(v)});i=j;continue}
    if(/[a-z]/i.test(c)){let j=i;while(j<s.length&&/[a-z]/i.test(s[j]))j++;let w=s.slice(i,j).toLowerCase();
      // "sqrtx", "2xy": separa funciones y variables de una letra
      while(w){const f=Object.keys(FUNCIONES).concat(['pi']).find(k=>w.startsWith(k));if(f){t.push({t:f==='pi'?'c':'f',v:f});w=w.slice(f.length)}else{t.push({t:'v',v:w[0]});w=w.slice(1)}}
      i=j;continue}
    if('+-*/^()'.includes(c)){t.push({t:c});i++;continue}
    throw new Error('símbolo '+c);
  }
  return t;
}
// Devuelve una función (vars) → número, o lanza error si la expresión no es válida
export function compilar(texto){
  const tk=tokens(limpiar(texto));let i=0;
  const ver=()=>tk[i],tomar=x=>{if(tk[i]?.t!==x)throw new Error('falta '+x);i++};
  const empiezaAtomo=k=>k&&(k.t==='n'||k.t==='v'||k.t==='c'||k.t==='f'||k.t==='(');
  function expr(){let a=term();while(ver()&&(ver().t==='+'||ver().t==='-')){const o=tk[i++].t,b=term(),x=a;a=o==='+'?v=>x(v)+b(v):v=>x(v)-b(v)}return a}
  function term(){let a=unario();
    for(;;){const k=ver();
      if(k&&(k.t==='*'||k.t==='/')){i++;const b=unario(),x=a;a=k.t==='*'?v=>x(v)*b(v):v=>x(v)/b(v)}
      else if(empiezaAtomo(k)){const b=potencia(),x=a;a=v=>x(v)*b(v)}
      else return a}}
  function unario(){const k=ver();if(k?.t==='-'){i++;const a=unario();return v=>-a(v)}if(k?.t==='+'){i++;return unario()}return potencia()}
  function potencia(){const a=atomo();if(ver()?.t==='^'){i++;const b=unario();return v=>Math.pow(a(v),b(v))}return a}
  function atomo(){
    const k=tk[i++];if(!k)throw new Error('incompleto');
    if(k.t==='n')return ()=>k.v;
    if(k.t==='c')return ()=>Math.PI;
    if(k.t==='v')return k.v==='e'?()=>Math.E:v=>{if(!(k.v in v))throw new Error('variable '+k.v);return v[k.v]};
    if(k.t==='f'){const f=FUNCIONES[k.v];const a=ver()?.t==='('?atomo():potencia();return v=>f(a(v))}
    if(k.t==='('){const a=expr();tomar(')');return a}
    throw new Error('inesperado');
  }
  const f=expr();if(i<tk.length)throw new Error('sobra');
  return f;
}
const seguro=(f,v)=>{try{const r=f(v);return Number.isFinite(r)?r:NaN}catch(e){return NaN}};
export const casi=(a,b,tol=1e-6)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(b));

/* ---------- números ---------- */
// "x = 3/2", "1,5", "-0.5", "√2", "2π", "50%": el valor, o NaN
export function num(entrada){
  let s=limpiar(entrada).toLowerCase().replace(/^[a-z]\s*=\s*/,'').replace(/^=/,'');
  if(/^[+-]?\d+,\d+$/.test(s))s=s.replace(',','.'); // coma decimal
  const pct=/%$/.test(s);if(pct)s=s.slice(0,-1);
  if(!s||/[a-z]/.test(s.replace(/sqrt|pi|e/g,'')))return NaN;
  try{const v=seguro(compilar(s),{});return pct?v/100:v}catch(e){return NaN}
}
export const igualNum=(entrada,valor,tol=1e-6)=>casi(num(entrada),valor,tol);

/* ---------- expresiones equivalentes ---------- */
// Se evalúan en 7 puntos al azar (evitando divisiones por cero). constanteLibre: iguales salvo una constante (antiderivadas)
export function equivalente(entrada,esperada,{vars=['x'],constanteLibre=false,tol=1e-6}={}){
  let f,g;try{f=compilar(entrada);g=compilar(esperada)}catch(e){return false}
  let difs=[],validos=0;
  for(let k=0;k<20&&validos<7;k++){
    const v=Object.fromEntries(vars.map((x,j)=>[x,Math.round(((k*7.31+j*3.17)%5.3-2.4)*1000)/1000+0.137]));
    const a=seguro(f,v),b=seguro(g,v);
    if(!Number.isFinite(b))continue;
    if(!Number.isFinite(a))return false;
    validos++;difs.push(a-b);
  }
  if(validos<4)return false;
  if(constanteLibre)return difs.every(d=>casi(d,difs[0],1e-5));
  return difs.every(d=>Math.abs(d)<=tol*10);
}
// Quita "+ C" (o "+ c", "+ k") de una antiderivada; devuelve [sin la constante, ¿la tenía?]
export function sinConstante(entrada){
  const s=limpiar(entrada);
  const m=s.match(/^(.*?)\s*\+\s*[ck]\s*$/i)||s.match(/^\s*[ck]\s*\+\s*(.*)$/i);
  return m?[m[1],true]:[s,false];
}

/* ---------- vectores, matrices y listas ---------- */
// "(1, -2)", "1,-2", "<1; -2>", "[1 -2]" o un arreglo de casillas → números
export function lista(entrada){
  if(Array.isArray(entrada))return entrada.map(num);
  const s=limpiar(entrada).replace(/^[([<{]\s*|\s*[)\]>}]$/g,'');
  const partes=s.includes(';')?s.split(';'):s.includes(',')?s.split(','):s.split(' ');
  return partes.map(x=>x.trim()).filter(Boolean).map(num);
}
export const igualLista=(entrada,valores,tol=1e-6)=>{const a=lista(entrada);return a.length===valores.length&&a.every((x,i)=>casi(x,valores[i],tol))};
// Conjunto (sin importar el orden): raíces, soluciones
export const igualConjunto=(entrada,valores,tol=1e-6)=>{const a=lista(entrada).sort((x,y)=>x-y),b=[...valores].sort((x,y)=>x-y);return a.length===b.length&&a.every((x,i)=>casi(x,b[i],tol))};

/* ---------- texto e inglés ---------- */
const CONTRACCIONES=[[/\bwon't\b/g,'will not'],[/\bcan't\b/g,'cannot'],[/\bcan not\b/g,'cannot'],[/\bshan't\b/g,'shall not'],[/n't\b/g,' not'],[/'re\b/g,' are'],[/'m\b/g,' am'],[/'ve\b/g,' have'],[/'ll\b/g,' will'],[/'d\b/g,' would'],[/\b(he|she|it|that|there|what|who|where)'s\b/g,'$1 is']];
export function normalTexto(s){
  let t=String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’‘`´]/g,"'");
  for(const [a,b] of CONTRACCIONES)t=t.replace(a,b);
  return t.replace(/[.,!?¿¡;:"]/g,' ').replace(/\s+/g,' ').trim();
}
export const igualTexto=(entrada,opciones)=>{const e=normalTexto(entrada);return [].concat(opciones).some(o=>normalTexto(o)===e)};

/* ---------- formato para mostrar ---------- */
const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
export {mcd};
// Fracción simplificada como texto ("3/2", "-1/4", "5")
export function fraccion(n,d=1){if(d<0){n=-n;d=-d}const g=mcd(n,d);n/=g;d/=g;return d===1?String(n):`${n}/${d}`}
export function fraccionTex(n,d=1){if(d<0){n=-n;d=-d}const g=mcd(n,d);n/=g;d/=g;return d===1?String(n):`${n<0?'-':''}\\frac{${Math.abs(n)}}{${d}}`}
// Número para escribir: entero, o con 2 decimales como máximo
export const redondear=(x,dec=2)=>Math.round(x*10**dec)/10**dec;
