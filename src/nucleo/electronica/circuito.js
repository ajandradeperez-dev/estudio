/* ⚡ Electrónica · solucionador de circuitos DC por análisis nodal modificado (MNA), sin DOM.
   Es la verificación INDEPENDIENTE de los ejercicios de circuitos (no usa la fórmula del generador) y el motor del
   🔌 simulador. Circuito: {elementos:[{tipo:'R'|'V'|'I', a, b, valor, id?}]}; nodos con nombre o número, '0' es tierra.
   - R: resistencia entre a y b (Ω); V: fuente de voltaje (a es +); I: fuente de corriente que entra a b (sale de a).
   resolver(c) → {v:{nodo: voltaje}, corriente(id|índice) → corriente de a hacia b, potencia(i), ok}. */
export function resolver(c){
  const els=c.elementos.map((e,i)=>({...e,i}));
  const nodos=[...new Set(els.flatMap(e=>[String(e.a),String(e.b)]))].filter(n=>n!=='0');
  const idx=new Map(nodos.map((n,i)=>[n,i]));const fuentesV=els.filter(e=>e.tipo==='V');
  const N=nodos.length,M=fuentesV.length,T=N+M;
  const A=Array.from({length:T},()=>Array(T).fill(0)),z=Array(T).fill(0);
  const k=n=>n==='0'||n===0?-1:idx.get(String(n));
  for(const e of els){const a=k(e.a),b=k(e.b);
    if(e.tipo==='R'){const g=1/e.valor;if(a>=0)A[a][a]+=g;if(b>=0)A[b][b]+=g;if(a>=0&&b>=0){A[a][b]-=g;A[b][a]-=g}}
    else if(e.tipo==='I'){if(a>=0)z[a]-=e.valor;if(b>=0)z[b]+=e.valor}}
  fuentesV.forEach((e,j)=>{const a=k(e.a),b=k(e.b),r=N+j;if(a>=0){A[a][r]+=1;A[r][a]+=1}if(b>=0){A[b][r]-=1;A[r][b]-=1}z[r]=e.valor});
  const x=gauss(A,z);if(!x)return {ok:false};
  const v={'0':0};nodos.forEach((n,i)=>{v[n]=x[i]});
  const iV=new Map(fuentesV.map((e,j)=>[e.i,x[N+j]]));
  const busca=id=>typeof id==='number'?els[id]:els.find(e=>e.id===id);
  const corriente=id=>{const e=busca(id);if(!e)return NaN;if(e.tipo==='R')return (v[String(e.a)]-v[String(e.b)])/e.valor;if(e.tipo==='I')return e.valor;return -iV.get(e.i)};
  return {ok:true,v,corriente,potencia:id=>{const e=busca(id);const i=corriente(id);return Math.abs((v[String(e.a)]-v[String(e.b)])*i)},caida:id=>{const e=busca(id);return v[String(e.a)]-v[String(e.b)]}};
}
function gauss(A0,b0){
  const n=A0.length,A=A0.map((f,i)=>[...f,b0[i]]);
  for(let c=0;c<n;c++){let p=c;for(let i=c+1;i<n;i++)if(Math.abs(A[i][c])>Math.abs(A[p][c]))p=i;if(Math.abs(A[p][c])<1e-12)return null;[A[p],A[c]]=[A[c],A[p]];
    for(let i=0;i<n;i++)if(i!==c){const f=A[i][c]/A[c][c];if(f)for(let j=c;j<=n;j++)A[i][j]-=f*A[c][j]}}
  return A.map((f,i)=>f[n]/f[i]);
}
// Resistencia equivalente entre dos nodos: se pone una fuente de 1 V y se mide la corriente
export function reqEntre(elementos,a,b){
  const r=resolver({elementos:[...elementos,{tipo:'V',a,b,valor:1,id:'__prueba'}]});
  return r.ok?1/Math.abs(r.corriente('__prueba')):NaN;
}
// Equivalente de Thévenin visto desde a–b (con b como referencia): Vth en circuito abierto y Rth con las fuentes apagadas
export function thevenin(elementos,a,b){
  const abierto=resolver({elementos:[...elementos,{tipo:'R',a,b,valor:1e12,id:'__abierto'}]});
  const apagadas=elementos.map(e=>e.tipo==='V'?{...e,tipo:'R',valor:1e-9}:e).filter(e=>e.tipo!=='I');
  return {vth:abierto.v[String(a)]-abierto.v[String(b)],rth:reqEntre(apagadas,a,b)};
}
