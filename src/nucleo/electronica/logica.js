/* ⚡ Electrónica · lógica digital (sin DOM): expresiones booleanas, tablas de verdad, mapas de Karnaugh (mínimo por
   Quine-McCluskey + cobertura exacta, comprobado contra fuerza bruta), flip-flops y contadores simulados en el tiempo. */

/* ---------- expresiones: A·B, AB, A+B, A', ¬A, !A, A⊕B, paréntesis ---------- */
export function compilarBool(texto){
  const s=String(texto).replace(/\s+/g,'').replace(/[·*∧&]/g,'.').replace(/[∨|]/g,'+').replace(/[¬~!]/g,'!').replace(/⊕|\^/g,'^').replace(/’/g,"'");
  let i=0;
  const ver=()=>s[i];
  function expr(){let a=xor();while(ver()==='+'){i++;const b=xor(),x=a;a=v=>x(v)|b(v)}return a}
  function xor(){let a=term();while(ver()==='^'){i++;const b=term(),x=a;a=v=>x(v)^b(v)}return a}
  function term(){let a=factor();for(;;){if(ver()==='.'){i++;const b=factor(),x=a;a=v=>x(v)&b(v)}else if(ver()&&/[A-Za-z(!01]/.test(ver())){const b=factor(),x=a;a=v=>x(v)&b(v)}else return a}}
  function factor(){let a;const c=s[i];
    if(c==='!'){i++;const b=factor();a=v=>1-b(v)}
    else if(c==='('){i++;a=expr();if(s[i]!==')')throw new Error('falta )');i++}
    else if(c==='0'||c==='1'){i++;const k=+c;a=()=>k}
    else if(/[A-Za-z]/.test(c)){i++;const n=c.toUpperCase();a=v=>{if(!(n in v))throw new Error('variable '+n);return v[n]}}
    else throw new Error('inesperado '+c);
    while(s[i]==="'"){i++;const b=a;a=v=>1-b(v)}
    return a}
  const f=expr();if(i<s.length)throw new Error('sobra');return f;
}
export const variablesDe=t=>[...new Set(String(t).toUpperCase().match(/[A-Z]/g)||[])].sort();
// minitérminos (filas con salida 1) de una expresión, con las variables en orden (A es el bit más significativo)
export function minterminos(texto,vars=variablesDe(texto)){
  const f=compilarBool(texto),out=[];
  for(let m=0;m<2**vars.length;m++){const v={};vars.forEach((x,k)=>{v[x]=(m>>(vars.length-1-k))&1});if(f(v))out.push(m)}
  return out;
}
export const equivalentesBool=(a,b,vars)=>{try{vars=vars||[...new Set([...variablesDe(a),...variablesDe(b)])].sort();const x=minterminos(a,vars),y=minterminos(b,vars);return x.length===y.length&&x.every((m,i)=>m===y[i])}catch(e){return false}};

/* ---------- Karnaugh: suma de productos mínima ---------- */
export function minimizar(ms,n,noImporta=[]){
  const todos=[...new Set([...ms,...noImporta])];
  if(!ms.length)return [];
  if(ms.length+noImporta.filter(x=>!ms.includes(x)).length===2**n)return [Array(n).fill('-').join('')];
  // implicantes primos
  let grupo=todos.map(m=>m.toString(2).padStart(n,'0'));const primos=new Set();
  while(grupo.length){const usados=new Set(),sig=new Set();
    for(let i=0;i<grupo.length;i++)for(let j=i+1;j<grupo.length;j++){const a=grupo[i],b=grupo[j];let dif=-1,ok=true;
      for(let k=0;k<n;k++)if(a[k]!==b[k]){if(dif>=0||a[k]==='-'||b[k]==='-'){ok=false;break}dif=k}
      if(ok&&dif>=0){sig.add(a.slice(0,dif)+'-'+a.slice(dif+1));usados.add(a);usados.add(b)}}
    for(const g of grupo)if(!usados.has(g))primos.add(g);grupo=[...sig]}
  const P=[...primos],cubre=(p,m)=>{const b=m.toString(2).padStart(n,'0');return [...p].every((c,k)=>c==='-'||c===b[k])};
  // cobertura mínima exacta (pocos primos en 2–4 variables): menos términos y luego menos literales
  let mejor=null;const lit=s=>s.reduce((a,p)=>a+[...p].filter(c=>c!=='-').length,0);
  const busca=(i,sel)=>{if(mejor&&sel.length>mejor.length)return;
    if(ms.every(m=>sel.some(p=>cubre(p,m)))){if(!mejor||sel.length<mejor.length||sel.length===mejor.length&&lit(sel)<lit(mejor))mejor=[...sel];return}
    if(i>=P.length)return;busca(i+1,[...sel,P[i]]);busca(i+1,sel)};
  busca(0,[]);
  return mejor;
}
export function terminoATexto(t,vars){const s=[...t].map((c,k)=>c==='-'?'':c==='1'?vars[k]:vars[k]+"'").join('');return s||'1'}
export const sopATexto=(ts,vars)=>!ts.length?'0':ts.map(t=>terminoATexto(t,vars)).join(' + ');
export const literales=ts=>ts.reduce((a,t)=>a+[...t].filter(c=>c!=='-').length,0);
// orden de Gray para dibujar el mapa
export const GRAY=[0,1,3,2];

/* ---------- secuencial: flip-flops y contadores ---------- */
// siguiente Q de cada flip-flop con su entrada en el flanco de reloj
export const siguiente={D:(q,{D})=>D,T:(q,{T})=>T?1-q:q,JK:(q,{J,K})=>J&&K?1-q:J?1:K?0:q,SR:(q,{S,R})=>S&&R?null:S?1:R?0:q};
export function simularFF(tipo,entradas,q0=0){const out=[];let q=q0;for(const e of entradas){q=siguiente[tipo](q,e);out.push(q)}return out}
// contador binario de n bits (ascendente o descendente) durante k pulsos, desde inicio
export function contador(n,k,{inicio=0,abajo=false,modulo=2**n}={}){const out=[];let c=inicio;for(let i=0;i<k;i++){c=abajo?(c-1+modulo)%modulo:(c+1)%modulo;out.push(c)}return out}
// contador de n flip-flops T en cascada (asíncrono): cada uno cambia cuando el anterior baja de 1 a 0
export function contadorAsincrono(n,k){const q=Array(n).fill(0),out=[];for(let i=0;i<k;i++){let j=0;for(;;){const antes=q[j];q[j]=1-q[j];if(!(antes===1&&q[j]===0)||j===n-1)break;j++}out.push(q.reduceRight((a,b)=>a*2+b,0))}return out}
// registro de corrimiento (a la derecha) con entrada serie
export function corrimiento(n,bits,inicio=0){let r=inicio;const out=[];for(const b of bits){r=((r>>1)|(b<<(n-1)))&(2**n-1);out.push(r)}return out}
