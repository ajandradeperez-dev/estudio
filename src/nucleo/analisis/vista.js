/* 🧭 Mi análisis (PROMPT-MI-ANALISIS, partes 3 y 4). Ruta #perfil/analisis. Tres resultados en lenguaje normal y, debajo
   de cada uno, «🔍 Ver el álgebra» para la exposición en clase:
   1. ¿Llego al examen? — mínimos cuadrados (ecuaciones normales con Gauss-Jordan en fracciones; rango y kernel si no alcanza).
   2. Mapa de tus habilidades — PCA (Jacobi sobre la matriz de correlación) y la conexión: v es el kernel de C − λI.
   3. Lo que dicen tus datos — el vector del valor propio más chico (casi kernel de C).
   Todo se calcula aquí, con el progreso de este dispositivo; no se envía a ningún lado. */
import {esc} from '../../utilidades.js';
import {boton,aviso} from '../ui.js';
import {progreso,hoy} from '../progreso.js';
import {materia as materiaDe,leccion,rutaLeccion,areaDe} from '../materias.js';
import {misMaterias,miMateria,proximoExamen,practicasDe,buscarTema} from '../mias/datos.js';
import {pca,minimosCuadrados,gaussJordanNum,nucleo,fmt2} from './algebra.js';
import {matrizHabilidades,serieAvance,pronostico,TODAS,MIN_HABILIDADES,diasEntre,METRICAS} from './datos.js';
import {EJEMPLO_HABILIDADES,EJEMPLO_SERIE} from './ejemplo.js';
import {texto as textoF} from '../matrices.js';

const PALETA=['#4652d0','#dc2626','#15803d','#ea580c','#7c3aed','#0891b2','#db2777','#65a30d'];
const fechaCorta=f=>f?new Date(f+'T12:00:00').toLocaleDateString('es',{day:'numeric',month:'short'}):'';
const sumarDias=(f,n)=>{const d=new Date(f+'T12:00:00');d.setDate(d.getDate()+Math.round(n));return d.toISOString().slice(0,10)};
const pct=x=>`${Math.round(x*1000)/10} %`;
const n2=x=>fmt2(x);

/* ---------- datos reales o de ejemplo ---------- */
function nombreReal(mid,hid){
  if(/^mp-/.test(mid)){const mm=miMateria(mid),t=mm&&buscarTema(mm,hid)?.t;return t?{nombre:t.titulo,materia:mm.nombre,ruta:`mias/${mid}/t/${hid}`}:null}
  const m=materiaDe(mid),l=m&&leccion(m,hid);if(!l)return null;
  return {nombre:l.titulo||hid,materia:m.nombre,ruta:rutaLeccion(m,l)};
}
export function calcular({ejemplo=false}={}){
  const r={ejemplo,avisos:[]};
  // matriz de habilidades
  r.filas=ejemplo?EJEMPLO_HABILIDADES.map(h=>({...h})):matrizHabilidades(progreso(),{hoy:hoy(),nombre:nombreReal});
  const materias=[...new Set(r.filas.map(f=>f.materia))];r.colorDe=m=>PALETA[materias.indexOf(m)%PALETA.length];r.materias=materias;
  if(r.filas.length>=MIN_HABILIDADES){
    const p=pca(r.filas.map(f=>f.x),METRICAS);
    if(p.quitadas.length)r.avisos.push(...p.quitadas.map(q=>q==='fallos'?'Todas tus habilidades tienen 0 fallos: esa métrica no aporta y se quitó.':`«${q}» vale lo mismo en todas tus habilidades: no aporta y se quitó.`));
    if(p.valores.length>=2)r.pca=p;
  }
  // serie y meta
  if(ejemplo){const s=EJEMPLO_SERIE;r.serie={t:s.t,y:s.y,fechas:null,inicio:null};r.meta=s.meta;r.tExamen=s.examen;r.tHoy=28;r.titulo=`tu examen de ${s.materia}`;r.fechaExamen=null;r.conExamen=true}
  else{
    const p=progreso(),ex=misMaterias().map(m=>({m,x:proximoExamen(m)})).find(x=>x.x);
    if(ex){const vinc=new Set();for(const u of ex.m.unidades)if((ex.x.unidades||[]).includes(u.id))for(const t of u.temas)for(const h of practicasDe(t))vinc.add(`${h.materia}/${h.id}`);
      for(const u of ex.m.unidades)for(const t of u.temas)if(p.materias?.[ex.m.id]?.lecciones?.[t.id])vinc.add(`${ex.m.id}/${t.id}`);
      r.serie=serieAvance(p,{filtro:(mid,hid)=>vinc.has(`${mid}/${hid}`)});r.meta=Math.max(1,vinc.size);r.titulo=`tu examen de ${ex.m.nombre} (${fechaCorta(ex.x.fecha)})`;r.fechaExamen=ex.x.fecha;r.conExamen=true;r.materiaExamen=ex.m;r.vinculadas=[...vinc]}
    else{const porMateria={};for(const f of r.filas)if(!/^mp-/.test(f.mid))porMateria[f.mid]=(porMateria[f.mid]||0)+f.x[2];
      const mid=Object.entries(porMateria).sort((a,b)=>b[1]-a[1])[0]?.[0],m=mid&&materiaDe(mid);
      r.serie=m?serieAvance(p,{filtro:x=>x===mid}):serieAvance(p,{filtro:TODAS});r.meta=m?(m.lecciones||[]).length:Math.max(1,...r.serie.y);r.titulo=m?`todas las habilidades de ${m.nombre}`:'tus habilidades';r.conExamen=false;r.materiaMeta=m}
    r.tHoy=r.serie.inicio?diasEntre(r.serie.inicio,hoy()):0;r.tExamen=r.fechaExamen&&r.serie.inicio?diasEntre(r.serie.inicio,r.fechaExamen):null;
  }
  if(r.serie.t.length){r.mc=minimosCuadrados(r.serie.t,r.serie.y);r.yHoy=r.serie.y.at(-1);r.pron=pronostico(r.mc,{meta:r.meta,tExamen:r.tExamen,yHoy:r.yHoy,tHoy:r.tHoy})}
  return r;
}

/* ---------- nombres de los ejes y zonas ---------- */
const fuertes=v=>METRICAS.map((m,i)=>[m,v[i]]).filter(([,w])=>Math.abs(w)>=0.4);
export function nombreEje(v,nombres=METRICAS){
  const f=nombres.map((m,i)=>[m,v[i]]).filter(([,w])=>Math.abs(w)>=0.4),pos=f.filter(([,w])=>w>0).map(([m])=>m),neg=f.filter(([,w])=>w<0).map(([m])=>m);
  const dominio=['acierto','nivel','sesiones','días'];
  if(pos.filter(m=>dominio.includes(m)).length>=2&&!pos.includes('días sin practicar')&&!pos.includes('fallos'))return 'Dominio';
  if(pos.length===1&&pos[0]==='días sin practicar'&&!neg.length)return 'Tiempo sin practicar';
  if(f.length===1)return f[0][1]>0?`Más ${f[0][0]}`:`Menos ${f[0][0]}`;
  return [pos.length?`más ${pos.join(' y ')}`:'',neg.length?`menos ${neg.join(' y ')}`:''].filter(Boolean).join(', ').replace(/^./,c=>c.toUpperCase())||'Eje';
}
const ZONAS={firme:['✅ Firme','Dominio alto y la practicaste hace poco.',null],enfria:['🧊 Se está enfriando','Dominio alto, pero hace mucho que no la practicas.','Repasar ahora'],
  proceso:['🔧 En proceso','Todavía no la dominas, pero la estás practicando.',null],abandonada:['⚠️ Abandonada','Poco dominio y hace mucho que no la practicas.','Retomar']};
function zonas(p){
  const nm=p.nombres,iA=nm.indexOf('acierto'),iT=nm.indexOf('días sin practicar');
  const s1=iA>=0&&p.vectores[0][iA]<0?-1:1,s2=iT>=0&&p.vectores[1][iT]<0?-1:1;
  return p.coords.map(([a,b])=>{const dom=a*s1>=0,lejos=b*s2>=0;return dom?(lejos?'enfria':'firme'):(lejos?'abandonada':'proceso')});
}

/* ---------- gráficas (SVG propio; con colores fijos al exportar) ---------- */
const COL={tinta:'var(--ink)',suave:'var(--muted)',linea:'var(--line-2)',acento:'var(--primary)',meta:'var(--success)',examen:'var(--error)'};
const COL_HEX={tinta:'#1f2430',suave:'#64748b',linea:'#cbd5e1',acento:'#4652d0',meta:'#15803d',examen:'#dc2626'};
export function svgPronostico(r,C=COL){
  const W=320,H=210,m={l:34,r:12,t:12,b:28},t=r.serie.t,y=r.serie.y;
  const tMax=Math.max(...t,r.tExamen??0,r.pron?.tMeta&&isFinite(r.pron.tMeta)?Math.min(r.pron.tMeta,(r.tExamen??t.at(-1))*1.6+5):0,1)*1.05,yMax=Math.max(r.meta,...y,1)*1.1;
  const X=v=>m.l+v/tMax*(W-m.l-m.r),Y=v=>H-m.b-v/yMax*(H-m.t-m.b);
  const rejas=[0,0.25,0.5,0.75,1].map(k=>`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(k*yMax/1.1)}" y2="${Y(k*yMax/1.1)}" stroke="${C.linea}" stroke-width=".5"/><text x="${m.l-4}" y="${Y(k*yMax/1.1)+3}" text-anchor="end" font-size="9" fill="${C.suave}">${Math.round(k*yMax/1.1)}</text>`).join('');
  const recta=r.mc&&!r.mc.singular?`<line x1="${X(0)}" y1="${Y(r.mc.b0num)}" x2="${X(tMax)}" y2="${Y(r.mc.b0num+r.mc.b1num*tMax)}" stroke="${C.acento}" stroke-width="2"/>`:'';
  const meta=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(r.meta)}" y2="${Y(r.meta)}" stroke="${C.meta}" stroke-dasharray="5 3" stroke-width="1.5"/><text x="${m.l+4}" y="${Y(r.meta)-4}" font-size="10" fill="${C.meta}">meta ${r.meta}</text>`;
  const ex=r.tExamen!=null?`<line x1="${X(r.tExamen)}" x2="${X(r.tExamen)}" y1="${m.t}" y2="${H-m.b}" stroke="${C.examen}" stroke-dasharray="4 3" stroke-width="1.5"/><text x="${X(r.tExamen)-3}" y="${H-m.b-6}" text-anchor="end" font-size="10" fill="${C.examen}">examen</text>`:'';
  const pts=t.map((v,i)=>`<circle cx="${X(v)}" cy="${Y(y[i])}" r="3.5" fill="${C.tinta}"/>`).join('');
  return `<svg class="an-grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Avance por día, recta ajustada, meta y examen">${rejas}<line x1="${m.l}" x2="${W-m.r}" y1="${H-m.b}" y2="${H-m.b}" stroke="${C.suave}"/>${[0,0.25,0.5,0.75,1].map(k=>Math.round(k*tMax/1.05)).filter((v,i,a)=>a.indexOf(v)===i).map(v=>`<text x="${X(v)}" y="${H-m.b+11}" text-anchor="middle" font-size="9" fill="${C.suave}">${v}</text>`).join('')}<text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="10" fill="${C.suave}">días desde que empezaste</text>${meta}${ex}${recta}${pts}</svg>`;
}
function svgMapa(r,sel){
  const p=r.pca,W=320,H=260,m=18,xs=p.coords.map(c=>c[0]),ys=p.coords.map(c=>c[1]),ax=Math.max(1,...xs.map(Math.abs))*1.15,ay=Math.max(1,...ys.map(Math.abs))*1.15;
  const X=v=>W/2+v/ax*(W/2-m),Y=v=>H/2-v/ay*(H/2-m);
  const n1=nombreEje(p.vectores[0],p.nombres),n2=nombreEje(p.vectores[1],p.nombres);
  const pts=p.coords.map(([a,b],i)=>`<circle class="an-punto${sel===i?' sel':''}" data-punto="${i}" cx="${X(a)}" cy="${Y(b)}" r="${sel===i?9:7}" fill="${r.colorDe(r.filas[i].materia)}" stroke="var(--bg)" stroke-width="2"><title>${esc(r.filas[i].nombre)}</title></circle>`).join('');
  return `<svg class="an-mapa" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de habilidades: ${esc(n1)} contra ${esc(n2)}">
<line x1="${m}" x2="${W-m}" y1="${H/2}" y2="${H/2}" stroke="var(--line-2)"/><line x1="${W/2}" x2="${W/2}" y1="${m}" y2="${H-m}" stroke="var(--line-2)"/>
<text x="${W-m}" y="${H/2-6}" text-anchor="end" font-size="10" fill="var(--muted)">${esc(n1)} →</text><text x="${W/2+6}" y="${m+8}" font-size="10" fill="var(--muted)">↑ ${esc(n2)}</text>${pts}</svg>`;
}
// matriz con corchetes (mismo estilo que el cuaderno), con nombres de filas y columnas opcionales; se desplaza en su caja
function htmlMatriz(M,{filas,cols,dec=2,frac=false,calor=false,aumentada=null}={}){
  const celda=x=>frac?textoF(x):n2(+(+x).toFixed(dec));
  const fondo=x=>calor?` style="background:color-mix(in srgb,${x>=0?'var(--primary)':'var(--error)'} ${Math.round(Math.min(1,Math.abs(x))*55)}%,transparent)"`:'';
  return `<div class="an-mat-caja"><table class="an-mat${aumentada!=null?' an-aum':''}">${cols?`<thead><tr>${filas?'<th></th>':''}${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`:''}
<tbody>${M.map((f,i)=>`<tr>${filas?`<th>${esc(filas[i])}</th>`:''}${f.map((x,j)=>`<td${fondo(frac?0:x)}${aumentada!=null&&j===aumentada?' class="an-sep"':''}>${celda(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const barras=(vals,etq,{max=1,pct:p=false}={})=>`<div class="an-barras">${vals.map((v,i)=>`<div class="an-barra"><span class="an-barra-et">${esc(etq[i])}</span><span class="an-barra-pista"><span class="an-barra-v${v<0?' neg':''}" style="${v<0?`right:50%;width:${Math.abs(v)/max*50}%`:p?`left:0;width:${v/max*100}%`:`left:50%;width:${v/max*50}%`}"></span></span><span class="an-barra-n">${p?pct(v):n2(v)}</span></div>`).join('')}</div>`;

/* ---------- la pantalla ---------- */
export function vistaAnalisis(){
  let ejemplo=false,r=null,sel=null;
  const calc=()=>{r=calcular({ejemplo})};
  function tarjetaPronostico(){
    if(!r.serie.t.length)return `<div class="card"><h2>📈 ¿Llego al examen?</h2><p>Todavía no hay días de práctica para ver tu ritmo.</p></div>`;
    const pr=r.pron,porDia=pr&&!pr.singular?n2(pr.ritmo):'';
    let frase;
    if(pr.singular)frase='Con un solo día no puedo ver tu ritmo. Practica otro día y te digo.';
    else if(r.conExamen){const nec=pr.necesario;frase=`Vas a <b>${porDia}</b> por día. Para ${esc(r.titulo)} llevarías <b>${pr.llevaria} de ${r.meta}</b>. `+(pr.llega?'¡Vas a tiempo! 🎉':nec!=null&&nec>0?(()=>{const k=Math.max(1,Math.ceil((nec-pr.ritmo)*10));return `Necesitas <b>${n2(nec)} por día</b>: ${k===1?'un ejercicio':`unos ${k} ejercicios`} más por sesión.`})():'Ya pasó la fecha.')}
    else{const tm=pr.tMeta;frase=`Vas a <b>${porDia}</b> habilidades dominadas por día. A ese ritmo terminarías ${esc(r.titulo)} ${isFinite(tm)&&r.serie.inicio?`hacia el <b>${fechaCorta(sumarDias(r.serie.inicio,tm))}</b>`:isFinite(tm)?`en el día ${n2(tm)}`:'cuando tu ritmo suba'}.`}
    const aprox=r.serie.fechas&&(!r.serie.exactoDesde||r.serie.exactoDesde>r.serie.fechas[0])?`<p class="nota">Los días anteriores a ${r.serie.exactoDesde?fechaCorta(r.serie.exactoDesde):'hoy'} son aproximados (la app empezó a anotar tu avance exacto el 27 nov).</p>`:'';
    return `<div class="card an-tarjeta"><h2>📈 ¿Llego al examen?</h2><p>${frase}</p>${!pr.singular?`<div class="an-graf-caja">${svgPronostico(r)}</div>`:''}${aprox}
${boton({texto:'Practicar lo que falta',id:'an-practicar',clase:'area ancho'})}
<details class="an-algebra"><summary>🔍 Ver el álgebra</summary>${algebraPronostico()}</details></div>`;
  }
  function algebraPronostico(){
    const mc=r.mc,{t,y}=r.serie,s=mc.sumas;
    return `<p>Datos (t = días desde el primer día, y = habilidades dominadas):</p>${htmlMatriz([t,y],{filas:['t','y']})}
<p>Modelo: <b>y = β₀ + β₁t</b>. Son ${t.length} ecuaciones y solo 2 incógnitas: no hay una recta que pase por todos los puntos. Se busca la que hace mínima la suma de los errores al cuadrado, y eso lleva a las <b>ecuaciones normales</b> <b>XᵀX·β = Xᵀy</b>:</p>
<p class="an-formula">[ n  Σt | Σy ] = [ ${mc.n}  ${s.St} | ${s.Sy} ]<br>[ Σt Σt² | Σty ] = [ ${s.St}  ${s.Stt} | ${s.Sty} ]</p>
${htmlMatriz(mc.aumentada,{frac:true,aumentada:2})}
<p>Gauss-Jordan, en fracciones exactas:</p><ol class="an-pasos">${mc.pasos.map(p=>`<li><b>${esc(p.op)}</b>${htmlMatriz(p.M,{frac:true,aumentada:2})}</li>`).join('')}</ol>
<p>Rango de XᵀX: <b>${mc.rango}</b> ${mc.rango===2?'(solución única).':'(menor que 2: hay infinitas rectas).'}</p>
${mc.singular?`<p>${esc(mc.motivo)} Su <b>kernel</b> lo genera (Σt, −n) normalizado = (${mc.nucleo.map(n2).join(', ')}): sumarle ese vector a una solución da otra solución.</p>`
  :`<p>Resultado: <b>β₀ = ${mc.b0txt}</b> ≈ ${mc.b0num.toFixed(4)}, <b>β₁ = ${mc.b1txt}</b> ≈ ${mc.b1num.toFixed(4)}.</p><p>Comprobación: ${mc.n}·β₀ + ${s.St}·β₁ = ${n2(mc.n*mc.b0num+s.St*mc.b1num)} = Σy ✓ · ${s.St}·β₀ + ${s.Stt}·β₁ = ${n2(s.St*mc.b0num+s.Stt*mc.b1num)} = Σty ✓</p>
${r.tExamen!=null?`<p>En el día ${r.tExamen}: y = ${mc.b0txt} + ${mc.b1txt}·${r.tExamen} ≈ <b>${n2(r.pron.enExamen)}</b>. La meta (${r.meta}) se alcanza en t = (${r.meta} − β₀)/β₁ ≈ <b>${n2(r.pron.tMeta)}</b>.</p>`:''}`}
${boton({texto:'▦ Resolverlo yo en el cuaderno',id:'an-cuaderno',clase:'ghost btn-chico'})}`;
  }
  function tarjetaMapa(){
    if(!r.pca)return `<div class="card an-tarjeta"><h2>🗺️ Mapa de tus habilidades</h2><p>Necesito al menos ${MIN_HABILIDADES} habilidades con 3 o más respuestas para dibujar el mapa (tienes ${r.filas.length}).</p>${ejemplo?'':boton({texto:'🧪 Ver con datos de ejemplo',id:'an-ejemplo',clase:'ghost btn-chico'})}</div>`;
    const p=r.pca,z=zonas(p),n1=nombreEje(p.vectores[0],p.nombres),n2_=nombreEje(p.vectores[1],p.nombres),dos=p.varianza[0]+p.varianza[1];
    const det=sel!=null?r.filas[sel]:null,[zt,zd,za]=det?ZONAS[z[sel]]:[];
    const cuenta=k=>z.filter(x=>x===k).length;
    return `<div class="card an-tarjeta"><h2>🗺️ Mapa de tus habilidades</h2><p class="nota">Cada punto es una habilidad; tócalo para ver sus datos.</p>
<div class="an-graf-caja">${svgMapa(r,sel)}</div>
<p class="an-leyenda">${r.materias.map(m=>`<span><i style="background:${r.colorDe(m)}"></i>${esc(m)}</span>`).join('')}</p>
<p>Eje horizontal: <b>${esc(n1)}</b>. Eje vertical: <b>${esc(n2_)}</b>. Estos 2 ejes explican el <b>${Math.round(dos*100)} %</b> de las diferencias entre tus habilidades.</p>
${det?`<div class="an-detalle" aria-live="polite"><p><b>${esc(det.nombre)}</b> · ${esc(det.materia)} · ${zt}</p><p class="nota">${zd}</p>
<p class="nota">${METRICAS.map((m,i)=>`${m}: <b>${i===0?Math.round(det.x[i]*100)+' %':n2(det.x[i])}</b>`).join(' · ')}</p>${det.ruta||!ejemplo?boton({texto:za||'Practicar',id:'an-ir',clase:'area btn-chico'}):''}</div>`:''}
<ul class="an-zonas">${Object.entries(ZONAS).map(([k,[t,d]])=>`<li><b>${t}</b> (${cuenta(k)}) <span class="nota">${d}</span></li>`).join('')}</ul>
<details class="an-algebra"><summary>🔍 Ver el álgebra</summary>${algebraMapa()}</details></div>`;
  }
  function algebraMapa(){
    const p=r.pca,nm=p.nombres,l1=p.valores[0],K=p.C.map((f,i)=>f.map((x,j)=>x-(i===j?l1:0))),g=gaussJordanNum(K),ker=nucleo(K)[0]||[],v1=p.vectores[0];
    const signo=ker.length&&ker.reduce((a,x,i)=>a+x*v1[i],0)<0?-1:1;
    return `<p>1. La matriz X (una fila por habilidad):</p>${htmlMatriz(r.filas.map(f=>p.quedan.map(j=>f.x[j])),{filas:r.filas.map(f=>f.nombre),cols:nm})}
<p>2. Se estandariza cada columna (restar su media y dividir entre su desviación estándar, con n − 1): Z.</p>${htmlMatriz(p.Z,{filas:r.filas.map(f=>f.nombre),cols:nm})}
<p>3. La matriz de correlación <b>C = ZᵀZ / (n − 1)</b> (${nm.length}×${nm.length}; más color = más relación):</p>${htmlMatriz(p.C,{filas:nm,cols:nm,calor:true})}
<p>4. Valores propios de C (rotaciones de Jacobi), con el % de varianza que explica cada eje:</p>${barras(p.varianza,p.valores.map((l,i)=>`λ${'₀₁₂₃₄₅₆₇₈₉'[i+1]} = ${l.toFixed(3)}`),{pct:true,max:1})}
<p>5. Los vectores propios v₁ y v₂: el peso de cada métrica en cada eje.</p><p><b>v₁ · ${esc(nombreEje(v1,nm))}</b></p>${barras(v1,nm)}<p><b>v₂ · ${esc(nombreEje(p.vectores[1],nm))}</b></p>${barras(p.vectores[1],nm)}
<p>6. <b>La conexión con el kernel:</b> un vector propio es lo que <b>C − λI</b> manda a cero: su kernel. Para λ₁ = ${l1.toFixed(3)}:</p>${htmlMatriz(K,{filas:nm,cols:nm})}
<p>Gauss-Jordan numérico (pivoteo parcial):</p><ol class="an-pasos">${g.pasos.map(s=>`<li><b>${esc(s.op)}</b></li>`).join('')}</ol>${htmlMatriz(g.M,{cols:nm})}
<p>Rango <b>${g.rango}</b> (de ${nm.length}): queda ${nm.length-g.rango} variable libre. Su kernel, normalizado: (${ker.map(x=>n2(signo*x)).join(', ')}) = <b>v₁</b> ✓</p>
<p>7. La proyección: <b>coordenada = Z·v</b>. Por ejemplo, ${esc(r.filas[0].nombre)}: Z·v₁ = ${n2(p.coords[0][0])}, Z·v₂ = ${n2(p.coords[0][1])}.</p>`;
  }
  function tarjetaDatos(){
    if(!r.pca)return '';
    const p=r.pca,k=p.valores.length-1,lmin=p.valores[k],v=p.vectores[k],f=p.nombres.map((m,i)=>[m,v[i]]).filter(([,w])=>Math.abs(w)>=0.4).map(([m])=>m);
    const casi=lmin<0.05*p.valores[0];
    const frase=!casi?'Tus métricas no se repiten: cada una dice algo distinto de tus habilidades.':f.includes('acierto')&&f.includes('nivel')&&f.length===2?'Tu acierto y tu nivel dicen casi lo mismo: la app sube tu nivel cuando aciertas, así que funciona como debe.':`Tus métricas ${f.join(' y ')} dicen casi lo mismo: se mueven juntas.`;
    return `<div class="card an-tarjeta"><h2>🔎 Lo que dicen tus datos</h2><p>${frase}</p>
<details class="an-algebra"><summary>🔍 Ver el álgebra</summary><p>El valor propio más chico es λ${'₀₁₂₃₄₅₆₇₈₉'[k+1]} = ${lmin.toFixed(3)} (${(lmin/p.valores[0]*100).toFixed(1)} % del mayor). Su vector propio:</p>${barras(v,p.nombres)}
<p>Si λ fuera 0 exacto, este vector estaría en el kernel de C: una métrica sería combinación de otras.</p></details></div>`;
  }
  return {titulo:'Mi análisis',
    alEntrar(){calc()},
    vista(){
      if(!r)calc();
      const pocas=!r.pca&&!ejemplo;
      return `<div class="analisis"><p class="miga"><button class="enlace" data-go="perfil">👤 Perfil</button> › 🧭 Mi análisis</p><h1>🧭 Mi análisis</h1>
${ejemplo?'<p class="an-franja" role="status">🧪 Datos de ejemplo: no es tu progreso</p>':'<p class="nota">Se calcula aquí, con tu progreso de este dispositivo. No se envía a ningún lado.</p>'}
${r.avisos.map(a=>`<p class="aviso-linea">${esc(a)}</p>`).join('')}
${pocas?`<div class="card"><p>Todavía hay pocos datos: ${r.filas.length} habilidades con 3 o más respuestas (hacen falta ${MIN_HABILIDADES}). Sigue practicando o mira cómo se ve con datos de ejemplo.</p></div>`:''}
${tarjetaPronostico()}${tarjetaMapa()}${tarjetaDatos()}
<div class="pila">${boton({texto:ejemplo?'↩ Volver a mis datos':'🧪 Ver con datos de ejemplo',id:'an-ejemplo',clase:'ghost ancho'})}${boton({texto:'📝 Guardar como nota',id:'an-nota',clase:'ghost ancho'})}</div></div>`;
    },
    alMostrar(){document.querySelectorAll('.an-punto').forEach(c=>c.addEventListener('click',()=>{sel=+c.dataset.punto;document.dispatchEvent(new Event('repintar'))}))},
    async alClic(t,ir,repintar){
      if(t.id==='an-ejemplo'){ejemplo=!ejemplo;sel=null;calc();repintar();scrollTo(0,0);return true}
      if(t.dataset.punto!==undefined){sel=+t.dataset.punto;repintar();return true}
      if(t.id==='an-ir'&&sel!=null){const f=r.filas[sel];if(f.ruta)ir(f.ruta);else aviso('Es un dato de ejemplo.');return true}
      if(t.id==='an-practicar'){
        if(ejemplo){ir('estudio/matematicas/algebra-lineal');return true}
        const p=progreso(),falta=(r.vinculadas||[]).map(k=>k.split('/')).find(([m,h])=>!p.materias?.[m]?.lecciones?.[h]?.dominada);
        if(falta){const [mid,hid]=falta;if(/^mp-/.test(mid))ir(`mias/${mid}/t/${hid}`);else{const m=materiaDe(mid),l=m&&leccion(m,hid);if(l)ir(rutaLeccion(m,l))}}
        else if(r.materiaExamen)ir(`mias/${r.materiaExamen.id}`);else if(r.materiaMeta)ir(areaDe(r.materiaMeta)?.id?`${areaDe(r.materiaMeta).id}/${r.materiaMeta.id}`:r.materiaMeta.id);
        return true}
      if(t.id==='an-cuaderno'&&r.mc){
        const {resolverEnCuaderno}=await import('../cuaderno/notas.js');
        const celdas=r.mc.aumentada.map(f=>f.map(textoF));
        try{const n=await resolverEnCuaderno({materia:'matematicas',habilidad:'minimos-cuadrados'},`<p><b>Ecuaciones normales de Mi análisis</b></p><p>Resuelve con Gauss-Jordan para encontrar β₀ y β₁.</p>`,'Ecuaciones normales de Mi análisis',{herramienta:{tipo:'matriz',celdas,aumentada:2}});if(n)aviso(`📝 Guardado en «${n.titulo}»`)}catch(e){aviso('No se pudo abrir el cuaderno.')}
        return true}
      if(t.id==='an-nota'){await guardarComoNota(r);return true}
    }};
}

/* ---------- 📝 Guardar como nota (con la gráfica, para exportarla en PDF) ---------- */
async function guardarComoNota(r){
  const [{crearNota},{guardarArchivo,nuevoId}]=await Promise.all([import('../cuaderno/notas.js'),import('../cuaderno/db.js')]);
  const lineas=[`*${r.ejemplo?'Datos de ejemplo (no es mi progreso)':'Calculado con mi progreso'} · ${new Date().toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'})}*`,''];
  let img='';
  if(r.mc&&!r.mc.singular){
    try{const svg=svgPronostico(r,COL_HEX).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" ');const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await im.decode();
      const c=document.createElement('canvas');c.width=640;c.height=420;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,640,420);x.drawImage(im,0,0,640,420);
      const blob=await new Promise(res=>c.toBlob(res,'image/png'));const id=nuevoId();await guardarArchivo({id,nota:'analisis',blob,tipo:'image/png',ancho:640,alto:420,creada:Date.now()});img=`![Avance y pronóstico](img:${id})`}catch(e){}
    lineas.push('## 📈 ¿Llego al examen?',`- Ritmo: **${fmt2(r.pron.ritmo)} por día** (recta de mínimos cuadrados $y = ${r.mc.b0txt} + ${r.mc.b1txt}\\,t$).`);
    if(r.pron.enExamen!=null)lineas.push(`- Para ${r.titulo}: llevaría **${r.pron.llevaria} de ${r.meta}**.${r.pron.necesario>0&&!r.pron.llega?` Necesito ${fmt2(r.pron.necesario)} por día.`:''}`);
    if(img)lineas.push('',img);
  }
  if(r.pca){const p=r.pca;lineas.push('','## 🗺️ Mapa de mis habilidades',`- Eje 1: **${nombreEje(p.vectores[0],p.nombres)}** (${pct(p.varianza[0])}) · Eje 2: **${nombreEje(p.vectores[1],p.nombres)}** (${pct(p.varianza[1])}).`);
    const z=zonas(p);for(const [k,[t]] of Object.entries(ZONAS)){const ls=r.filas.filter((_,i)=>z[i]===k).map(f=>f.nombre);if(ls.length)lineas.push(`- ${t}: ${ls.join(', ')}`)}}
  const n=await crearNota({materia:'matematicas',tema:'algebra-lineal',titulo:`🧭 Mi análisis · ${new Date().toLocaleDateString('es',{day:'numeric',month:'short'})}`,cuerpo:lineas.join('\n')});
  aviso('📝 Guardado en el Cuaderno: desde ahí lo descargas en PDF');return n;
}
