/* Diagramas SVG simples para los procedimientos (sin DOM: texto SVG). Colores por clase (se adaptan al modo oscuro). */
const r1=x=>Math.round(x*10)/10;

// Vectores en el plano: [{v:[x,y], nombre, clase?}], desde el origen (o desde 'desde')
export function planoVectores(vs){
  const max=Math.max(3,...vs.flatMap(x=>[...(x.desde||[0,0]).map(Math.abs),...x.v.map((c,i)=>Math.abs(c+(x.desde?.[i]||0)))]));
  const S=110/max,O=130,P=([x,y])=>[O+x*S,O-y*S];
  const ejes=`<line class="eje" x1="10" y1="${O}" x2="250" y2="${O}"/><line class="eje" x1="${O}" y1="10" x2="${O}" y2="250"/>`;
  const flechas=vs.map((x,k)=>{const d=x.desde||[0,0],[x1,y1]=P(d),[x2,y2]=P([d[0]+x.v[0],d[1]+x.v[1]]);
    return `<line class="vec ${x.clase||'v'+k}" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" marker-end="url(#punta${k})"/><text x="${r1(x2+6)}" y="${r1(y2-6)}">${x.nombre}</text>
<marker id="punta${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="punta ${x.clase||'v'+k}" d="M0,0 L10,5 L0,10 z"/></marker>`}).join('');
  return `<svg class="diagrama" viewBox="0 0 260 260" role="img" aria-label="Vectores en el plano: ${vs.map(x=>`${x.nombre} = (${x.v.join(', ')})`).join('; ')}">${ejes}${flechas}</svg>`;
}

// Área bajo la curva de f entre a y b (f en texto JS: x => …)
export function areaCurva(f,a,b,etiqueta=''){
  const xs=[],n=60,lo=Math.min(a,0)-0.5,hi=Math.max(b,0)+0.5;
  for(let i=0;i<=n;i++){const x=lo+(hi-lo)*i/n;xs.push([x,f(x)])}
  const ys=xs.map(p=>p[1]),ymax=Math.max(1,...ys),ymin=Math.min(0,...ys);
  const X=x=>20+(x-lo)/(hi-lo)*220,Y=y=>220-(y-ymin)/(ymax-ymin||1)*200;
  const curva=xs.map(([x,y],i)=>`${i?'L':'M'}${r1(X(x))},${r1(Y(y))}`).join(' ');
  const zona=[`M${r1(X(a))},${r1(Y(0))}`,...xs.filter(([x])=>x>=a&&x<=b).map(([x,y])=>`L${r1(X(x))},${r1(Y(y))}`),`L${r1(X(b))},${r1(Y(0))}`,'Z'].join(' ');
  return `<svg class="diagrama" viewBox="0 0 260 240" role="img" aria-label="Área bajo la curva entre ${a} y ${b}${etiqueta?': '+etiqueta:''}">
<path class="zona" d="${zona}"/><line class="eje" x1="10" y1="${r1(Y(0))}" x2="250" y2="${r1(Y(0))}"/><line class="eje" x1="${r1(X(0))}" y1="10" x2="${r1(X(0))}" y2="230"/>
<path class="curva" d="${curva}"/><text x="${r1(X(a))}" y="${r1(Y(0)+14)}" text-anchor="middle">${a}</text><text x="${r1(X(b))}" y="${r1(Y(0)+14)}" text-anchor="middle">${b}</text></svg>`;
}

// Recta numérica con un punto marcado
export function rectaNumerica(valor,{min=-10,max=10}={}){
  const lo=Math.min(min,Math.floor(valor)-1),hi=Math.max(max,Math.ceil(valor)+1),X=x=>15+(x-lo)/(hi-lo)*230;
  const marcas=[];for(let k=Math.ceil(lo);k<=hi;k+=Math.max(1,Math.round((hi-lo)/10)))marcas.push(`<line class="eje" x1="${r1(X(k))}" y1="34" x2="${r1(X(k))}" y2="46"/><text x="${r1(X(k))}" y="62" text-anchor="middle">${k}</text>`);
  return `<svg class="diagrama" viewBox="0 0 260 72" role="img" aria-label="Recta numérica con el punto ${valor}"><line class="eje" x1="10" y1="40" x2="250" y2="40"/>${marcas.join('')}<circle class="punto" cx="${r1(X(valor))}" cy="40" r="6"/><text class="destaca" x="${r1(X(valor))}" y="24" text-anchor="middle">${r1(valor)}</text></svg>`;
}

// IP y máscara en binario, lado a lado, con el AND bit a bit y la parte de red resaltada (HTML)
export function bitsSubred(ip,prefijo){
  const b=s=>s.split('.').map(o=>(+o).toString(2).padStart(8,'0')).join('');
  const m='1'.repeat(prefijo).padEnd(32,'0'),i=b(ip),and=[...i].map((x,k)=>x&m[k]).join('');
  const fila=(nombre,bits)=>`<tr><th>${nombre}</th><td>${[...bits].map((x,k)=>`<span class="${k<prefijo?'red':'host'}">${x}</span>${k%8===7&&k<31?'<span class="punto-ip">.</span>':''}`).join('')}</td></tr>`;
  return `<div class="wrap"><table class="bits" aria-label="IP y máscara en binario"><tbody>${fila('IP',i)}${fila('Máscara',m)}${fila('AND (red)',and)}</tbody></table></div>`;
}
