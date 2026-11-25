/* ▦ Matrices en el editor de dibujo (PROMPT-PLANOS-MATRICES, parte 2): insertar, escribir los números con un teclado
   propio, operaciones de renglón («🧮 Calcular por mí» o «✍️ Lo hago yo» con ✓ Revisar), herramientas (determinante,
   transpuesta, inversa, rango, suma y producto), copiar como LaTeX y pasar a números lo escrito a mano (IA opcional).
   El editor le pasa un contexto (ctx) con su estado y sus funciones; las cuentas son de nucleo/matrices.js (fracciones
   exactas, las mismas que usa Álgebra lineal) y el objeto, de dibujo/matriz.js.
   ctx: {f, area, objs(), aplicar(nuevos), paso:{iniciar, cambiar(nuevos), terminar}, vista(), W(), H(), irA(v),
         aMundo, aPantalla, pintarVivo, seleccionar(ids), limpiarSel(), selIds(), conGrupos(ids), abrirPanel(h),
         cerrarPanel(), repintarPanel(), panel(), P, guardarPrefs(), anchoP(), renderRegion(caja, op), estado(t)} */
import {esc} from '../../utilidades.js';
import {aviso,avisoAccion,confirmar,menuAcciones} from '../ui.js';
import {iaDisponible,pedir} from '../ia.js';
import {dialogoMatriz} from '../matriz-dialogo.js';
import {nuevaMatriz,medirMatriz,medidas,celdaEn,renglonEn,cajaCelda,redimensionar,revisarCeldas,PARENTESIS,columnasPivote} from './matriz.js';
import {fr,F,texto,deTextos,esNumerica,aTextos,aplicarOps,notacion,pistaCelda,cambios,esEscalonada,esReducida,sugerencia,solucion,
  det,pasosDet,transpuesta,inversa,rango,sumaM,producto,aLatex,R,esCero} from '../matrices.js';
import {nuevoIdObj,medidasTexto,cajaDe} from './modelo.js';

const nid=()=>nuevoIdObj();
const blobB64=b=>new Promise(res=>{const f=new FileReader();f.onload=()=>res(String(f.result).split(',')[1]);f.readAsDataURL(b)});
const TECLAS=[['7'],['8'],['9'],['/','fracción'],['⌫','borrar'],['ant','← Ant.'],
  ['4'],['5'],['6'],['−','menos'],['.','punto'],['sig','Sig. →'],
  ['1'],['2'],['3'],['0'],['x'],['y'],['z'],['a'],['b'],['listo','✓ Listo']];

export function crearMatrices(ctx){
  let ed=null;            // celda activa: {mid, i, j, nuevo}
  let ren=null;           // operación de renglón en preparación: {mid, tipo, i, j, k, ops:[]}
  let flash=null;         // celdas que cambiaron (se resaltan un momento): {mid, celdas, hasta}
  const objs=()=>ctx.objs();
  const matrizDe=mid=>objs().find(o=>o.t==='matriz'&&o.mid===mid);
  const matrizEn=(X,Y)=>{const l=objs();for(let i=l.length-1;i>=0;i--){const o=l[i];if(o.t==='matriz'&&X>=o.x&&X<=o.x+o.w&&Y>=o.y&&Y<=o.y+o.h)return o}return null};
  const elegidas=()=>{const ids=ctx.selIds();return ids?objs().filter(o=>ids.has(o.id)&&o.t==='matriz'):[]};
  // Reemplazar una matriz por su versión nueva (nuevo id, mismo mid): en un paso del historial o dentro del paso abierto
  const reemplazo=(o,cambios)=>{const n=medirMatriz({...o,...cambios,id:nid()});return {n,lista:objs().map(x=>x===o?n:x)}};
  function cambiar(o,cambios,{seleccionar=true}={}){const {n,lista}=reemplazo(o,cambios);ctx.aplicar(lista);if(seleccionar)ctx.seleccionar(ctx.conGrupos(new Set([n.id])));return n}

  /* ---------- insertar ---------- */
  async function insertar(punto){
    terminar();
    const r=await dialogoMatriz({titulo:'▦ Insertar una matriz',conCeldas:false,sistema:true,boton:'Insertar'});if(!r)return;
    const v=ctx.vista(),[cx,cy]=punto||ctx.aMundo(ctx.W()/2,Math.min(ctx.H()*.3,160));
    let o=nuevaMatriz(0,0,r.celdas.length,r.celdas[0].length,{celdas:r.celdas,paren:r.paren,aumentada:r.aumentada,alinear:r.alinear,tam:Math.round(22/Math.max(.6,Math.min(1.6,v.z)))});
    o=medirMatriz({...o,x:Math.round(cx-o.w/2),y:Math.round(cy-o.h/2)});
    ctx.aplicar([...objs(),o]);
    if(r.vars)aviso(`▦ Matriz aumentada de ${r.vars.join(', ')} (${o.filas} × ${o.cols})`,1800);
    const vacia=o.celdas.flat().every(c=>!String(c).trim());
    if(vacia)editar(o.mid,0,0);else ctx.seleccionar(ctx.conGrupos(new Set([o.id])));
    return o;
  }

  /* ---------- escribir los números: teclado propio y teclado físico ---------- */
  let tec=null;
  function teclado(){
    if(tec)return tec;
    tec=document.createElement('div');tec.className='mtz-tec';tec.setAttribute('role','group');tec.setAttribute('aria-label','Teclado de la matriz');
    tec.innerHTML=`<div class="mtz-tec-cab"><span class="mtz-tec-donde" aria-live="polite"></span><button type="button" class="btn ghost btn-chico mtz-tec-rev" data-mt="revisar" hidden>✓ Revisar</button></div>
<div class="mtz-tec-teclas">${TECLAS.map(([k,n])=>`<button type="button" data-mt="${k}" class="${['sig','ant','listo'].includes(k)?'mtz-t-acc':''}${k==='listo'?' mtz-t-listo':''}" aria-label="${k==='ant'?'Celda anterior':k==='sig'?'Celda siguiente':n||k}">${k==='sig'||k==='ant'||k==='listo'?n:k}</button>`).join('')}</div>`;
    tec.addEventListener('pointerdown',e=>e.preventDefault());   // no roba el foco ni deja que el lienzo lo tome
    tec.addEventListener('click',e=>{const b=e.target.closest('[data-mt]');if(!b)return;e.stopPropagation();const k=b.dataset.mt;
      if(k==='sig')mover(1);else if(k==='ant')mover(-1);else if(k==='listo')terminar(true);else if(k==='revisar'){const o=ed&&matrizDe(ed.mid);if(o)revisar(o)}
      else if(k==='⌫')borrarUno();else escribir(k==='−'?'-':k)});
    ctx.area.appendChild(tec);return tec;
  }
  function editar(mid,i,j){
    const o=matrizDe(mid);if(!o)return;
    if(!ed||ed.mid!==mid){if(ed)ctx.paso.terminar();ctx.paso.iniciar()}
    ed={mid,i:Math.max(0,Math.min(o.filas-1,i)),j:Math.max(0,Math.min(o.cols-1,j)),nuevo:true};
    ctx.limpiarSel();const t=teclado();t.hidden=false;ctx.area.classList.add('con-mtz-tec');
    t.querySelector('.mtz-tec-rev').hidden=!o.esperado;
    rotulo();visible();ctx.pintarVivo();
  }
  function rotulo(){const o=ed&&matrizDe(ed.mid);if(!o||!tec)return;const v=String(o.celdas[ed.i][ed.j]||'');
    tec.querySelector('.mtz-tec-donde').textContent=`${R(ed.i)} · columna ${ed.j+1}: ${v?v.replace(/-/g,'−'):'—'}`}
  // La celda activa nunca queda detrás del teclado (ni de la barra de arriba)
  function visible(){
    const o=ed&&matrizDe(ed.mid);if(!o)return;const v=ctx.vista(),c=cajaCelda(o,ed.i,ed.j),[a,b]=ctx.aPantalla(c[0],c[1]),[e,h]=ctx.aPantalla(c[2],c[3]);
    const th=tec?.offsetHeight||0,abajo=ctx.H()-th-12,arriba=12,W=ctx.W();let dx=0,dy=0;
    if(h>abajo)dy=h-abajo;else if(b<arriba)dy=b-arriba;
    if(e>W-12)dx=e-(W-12);else if(a<12)dx=a-12;
    if(dx||dy)ctx.irA({...v,x:v.x+dx/v.z,y:v.y+dy/v.z});
  }
  function ponerCelda(t){
    const o=matrizDe(ed.mid);if(!o)return;
    const celdas=o.celdas.map((f,i)=>f.map((x,j)=>i===ed.i&&j===ed.j?String(t).slice(0,12):x));
    const marcas=o.marcas?o.marcas.map((f,i)=>f.map((x,j)=>i===ed.i&&j===ed.j?null:x)):null;
    const {lista}=reemplazo(o,{celdas,marcas});ctx.paso.cambiar(lista);rotulo();ctx.pintarVivo();
  }
  function escribir(ch){
    const o=matrizDe(ed?.mid);if(!o)return;const v=ed.nuevo?'':String(o.celdas[ed.i][ed.j]||'');ed.nuevo=false;
    if(ch==='-'&&v){ponerCelda(v.startsWith('-')||v.startsWith('−')?v.slice(1):'-'+v);return}   // − cambia el signo
    ponerCelda(v+ch);
  }
  function borrarUno(){const o=matrizDe(ed?.mid);if(!o)return;ed.nuevo=false;ponerCelda(String(o.celdas[ed.i][ed.j]||'').slice(0,-1))}
  // → por renglones (al final del renglón baja al siguiente); ← regresa
  function mover(dir){
    const o=matrizDe(ed?.mid);if(!o)return;let n=ed.i*o.cols+ed.j+dir;
    if(n>=o.filas*o.cols){terminar(true);return}if(n<0)n=0;
    ed={...ed,i:Math.floor(n/o.cols),j:n%o.cols,nuevo:true};rotulo();visible();ctx.pintarVivo();
  }
  function moverA(di,dj){const o=matrizDe(ed?.mid);if(!o)return;ed={...ed,i:Math.max(0,Math.min(o.filas-1,ed.i+di)),j:Math.max(0,Math.min(o.cols-1,ed.j+dj)),nuevo:true};rotulo();visible();ctx.pintarVivo()}
  function terminar(elegir=false){
    if(!ed)return;const o=matrizDe(ed.mid);ed=null;ctx.paso.terminar();
    if(tec){tec.hidden=true;ctx.area.classList.remove('con-mtz-tec')}
    if(elegir&&o){ctx.seleccionar(ctx.conGrupos(new Set([o.id])));if(o.esperado&&o.celdas.every(f=>f.every(x=>String(x).trim())))revisar(o)}
    ctx.pintarVivo();ctx.marca?.();
  }
  function tecla(e){
    if(!ed)return false;const k=e.key;
    if(e.ctrlKey||e.metaKey||e.altKey)return false;
    if(k==='Tab'){e.preventDefault();mover(e.shiftKey?-1:1);return true}
    if(k==='Enter'){e.preventDefault();mover(1);return true}
    if(k==='Escape'){e.preventDefault();terminar(true);return true}
    if(k==='Backspace'){e.preventDefault();borrarUno();return true}
    if(k==='Delete'){e.preventDefault();ed.nuevo=false;ponerCelda('');return true}
    const fl={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[k];if(fl){e.preventDefault();moverA(...fl);return true}
    if(/^[0-9.,/xyzabtw]$/i.test(k)||k==='-'||k==='−'){e.preventDefault();escribir(k===','?'.':k==='−'?'-':k.toLowerCase());return true}
    if(k===' '){e.preventDefault();return true}
    return false;
  }

  /* ---------- toques sobre el lienzo ---------- */
  // Al bajar el dedo (antes que el editor): una celda de la matriz que se edita, o un renglón con el panel de operaciones abierto
  function abajo(X,Y){
    if(ed){const o=matrizDe(ed.mid),c=o&&celdaEn(o,X,Y);if(c){ed={...ed,i:c[0],j:c[1],nuevo:true};rotulo();ctx.pintarVivo();return true}terminar(false);return false}
    if(ren&&ctx.panel()==='mz-renglon'){const o=matrizDe(ren.mid);if(o&&X>=o.x&&X<=o.x+o.w&&Y>=o.y&&Y<=o.y+o.h){const i=renglonEn(o,Y);if(i!=null)elegirRenglon(i);return true}}
    return false;
  }
  // Un toque corto con el dedo: si la matriz ya estaba elegida (o está fija) se escribe en la celda; si no, se elige
  function toque(X,Y){
    const o=matrizEn(X,Y);if(!o)return false;
    const ids=ctx.selIds(),c=celdaEn(o,X,Y);
    if((o.fijo||ids?.has(o.id))&&c){editar(o.mid,c[0],c[1]);return true}
    ctx.seleccionar(ctx.conGrupos(new Set([o.id])));return true;
  }
  // Pintar en la capa viva (coordenadas de pantalla): celda activa, renglones elegidos y celdas que cambiaron
  function pintarVivo(x,col){
    const caja=(o,i,j)=>{const c=cajaCelda(o,i,j),[a,b]=ctx.aPantalla(c[0],c[1]),[e,h]=ctx.aPantalla(c[2],c[3]);return [a,b,e-a,h-b]};
    if(ed){const o=matrizDe(ed.mid);if(o){const [a,b,w,h]=caja(o,ed.i,ed.j);x.fillStyle='rgba(37,99,235,.12)';x.fillRect(a,b,w,h);x.strokeStyle=col;x.lineWidth=2.5;x.strokeRect(a+1,b+1,w-2,h-2)}}
    if(ren&&ctx.panel()==='mz-renglon'){const o=matrizDe(ren.mid);if(o){const m=medidas(o);
      for(const [i,et] of [[ren.i,'cambia'],[ren.tipo!=='multiplicar'?ren.j:null,ren.tipo==='intercambiar'?'cambia':'usa']]){if(i==null||i>=o.filas)continue;
        const [a,b]=ctx.aPantalla(m.cuerpo[0],m.ys[i]),[e,h]=ctx.aPantalla(m.cuerpo[2],m.ys[i+1]);x.fillStyle=et==='cambia'?'rgba(37,99,235,.16)':'rgba(234,88,12,.16)';x.fillRect(a-4,b,e-a+8,h-b);
        x.font='600 12px system-ui,sans-serif';x.fillStyle=et==='cambia'?col:'#c2410c';x.textBaseline='middle';x.textAlign='right';x.fillText(R(i),a-8,(b+h)/2);x.textAlign='start';x.textBaseline='alphabetic'}}}
    if(flash){const t=flash.hasta-performance.now(),o=matrizDe(flash.mid);if(t<=0||!o)flash=null;else{x.fillStyle=`rgba(250,204,21,${Math.min(.45,t/1600*.45)})`;for(const [i,j] of flash.celdas){const [a,b,w,h]=caja(o,i,j);x.fillRect(a,b,w,h)}requestAnimationFrame(()=>ctx.pintarVivo())}}
  }

  /* ---------- barra de lo elegido ---------- */
  function barra(){
    const ms=elegidas(),ids=ctx.selIds();if(!ms.length||!ids)return null;
    const otros=objs().filter(o=>ids.has(o.id)&&o.t!=='matriz'&&!ms.some(m=>m.mid===o.ancla));
    if(ms.length===2&&!otros.length)return [['mz-sumar','＋','Sumar las dos matrices (A + B)'],['mz-mult','×','Multiplicar A · B (la de la izquierda por la de la derecha)'],['sel-dup','⧉','Duplicar'],['sel-borrar','🗑️','Borrar']];
    if(ms.length!==1||otros.length)return null;const o=ms[0];
    return [['mz-celdas','✏️','Escribir los números'],['mz-renglon','⇄','Operación de renglón'],['mz-herr','🧮','Determinante, inversa y más'],['mz-opc','⚙️','Filas, columnas y paréntesis'],
      ...(o.esperado?[['mz-revisar','✓','Revisar'],['mz-respuesta','👁️','Mostrar la respuesta']]:[]),['mz-latex','TeX','Copiar como LaTeX'],
      ['mz-fijar',o.fijo?'🔒':'🔓',o.fijo?'Soltar la matriz (se puede mover)':'Fijar la matriz (tocar una celda la edita)'],['sel-dup','⧉','Duplicar'],['sel-borrar','🗑️','Borrar']];
  }
  async function click(a,b){
    const ms=elegidas(),o=ms[0];
    if(a==='mz-insertar'){ctx.cerrarPanel();await insertar();return true}
    if(a==='mz-celdas'&&o){editar(o.mid,0,0);return true}
    if(a==='mz-renglon'&&o){abrirRenglon(o);return true}
    if(a==='mz-herr'&&o){await herramientas(o);return true}
    if(a==='mz-opc'&&o){ren=null;opcMid=o.mid;ctx.abrirPanel('mz-opc');return true}
    if(a==='mz-revisar'&&o){revisar(o);return true}
    if(a==='mz-respuesta'&&o){await mostrarRespuesta(o);return true}
    if(a==='mz-latex'&&o){await copiarLatex(o);return true}
    if(a==='mz-fijar'&&o){cambiar(o,{fijo:!o.fijo});aviso(o.fijo?'🔓 La matriz se puede mover':'🔒 Matriz fija: tocar una celda la edita',1500);return true}
    if((a==='mz-sumar'||a==='mz-mult')&&ms.length===2){operarDos(ms,a==='mz-sumar');return true}
    if(a==='mz-convertir'){await convertirLlaves();return true}
    // panel de operaciones de renglón
    if(b.dataset.mzModo){ctx.P.mtzModo=b.dataset.mzModo;ctx.guardarPrefs();ctx.repintarPanel();return true}
    if(b.dataset.mzTipo&&ren){ren={...ren,tipo:b.dataset.mzTipo};if(ren.tipo==='multiplicar')ren.j=null;else if(ren.j==null||ren.j===ren.i)ren.j=ren.i===0?1:0;ctx.repintarPanel();ctx.pintarVivo();return true}
    if(b.dataset.mzI!=null&&ren){ren={...ren,i:+b.dataset.mzI};if(ren.j===ren.i)ren.j=null;ctx.repintarPanel();ctx.pintarVivo();return true}
    if(b.dataset.mzJ!=null&&ren){ren={...ren,j:+b.dataset.mzJ};ctx.repintarPanel();ctx.pintarVivo();return true}
    if(b.dataset.mzK!=null&&ren){const t=b.dataset.mzK;ren.k=t==='⌫'?ren.k.slice(0,-1):t==='±'?(ren.k.startsWith('-')?ren.k.slice(1):'-'+ren.k):ren.k+t;actualizarK();return true}
    if(a==='mz-otra'&&ren){const op=opActual();if(!op)return true;ren={...ren,ops:[...ren.ops,op],k:''};ctx.repintarPanel();return true}
    if(b.dataset.mzQuitar!=null&&ren){ren.ops.splice(+b.dataset.mzQuitar,1);ctx.repintarPanel();return true}
    if(a==='mz-sugerir'&&ren){sugerir();return true}
    if(a==='mz-aplicar'&&ren){aplicarRenglon();return true}
    // panel de opciones
    if(b.dataset.mzOpc){opciones(b.dataset.mzOpc,b);return true}
    return false;
  }

  /* ---------- ⚙️ filas, columnas, aumentada, paréntesis ---------- */
  let opcMid=null;
  function htmlOpc(){
    const o=matrizDe(opcMid);if(!o)return '<p class="nota">La matriz ya no existe.</p>';
    const seg=(attr,lista,act)=>`<div class="segmentos" role="group">${lista.map(([v,n])=>`<button type="button" data-mz-opc="${attr}" data-v="${v}" aria-pressed="${act===v}">${n}</button>`).join('')}</div>`;
    return `<p class="nota">${o.filas} × ${o.cols}${o.aumentada!=null?' · aumentada':''}</p>
<div class="dib-presets"><button type="button" class="btn ghost btn-chico" data-mz-opc="mas-fila">➕ Fila</button><button type="button" class="btn ghost btn-chico" data-mz-opc="mas-col">➕ Columna</button>
<button type="button" class="btn ghost btn-chico" data-mz-opc="menos-fila" ${o.filas<2?'disabled':''}>➖ Fila</button><button type="button" class="btn ghost btn-chico" data-mz-opc="menos-col" ${o.cols<2?'disabled':''}>➖ Columna</button></div>
<label class="campo">Línea de la aumentada <select data-mz-aum>${[['','Sin línea'],...Array.from({length:o.cols-1},(_,k)=>[String(k+1),`Antes de la columna ${k+2}`])].map(([v,n])=>`<option value="${v}" ${String(o.aumentada??'')===v?'selected':''}>${n}</option>`).join('')}</select></label>
${seg('paren',PARENTESIS,o.paren)}${seg('alinear',[['derecha','Números a la derecha'],['centro','Centrados']],o.alinear)}
<div class="dib-presets"><button type="button" class="btn ghost btn-chico" data-mz-opc="letra" data-v=".85">A− Letra</button><button type="button" class="btn ghost btn-chico" data-mz-opc="letra" data-v="1.18">A+ Letra</button>
<button type="button" class="btn ghost btn-chico" data-mz-opc="sistema">📋 Pegar un sistema</button><button type="button" class="btn ghost btn-chico" data-mz-opc="vaciar">🧹 Vaciar celdas</button></div>`;
  }
  async function opciones(q,b){
    const o=matrizDe(opcMid);if(!o)return;const v=b.dataset.v;
    if(q==='mas-fila')cambiar(redimensionar(o,o.filas+1,o.cols),{});
    if(q==='mas-col')cambiar(redimensionar(o,o.filas,o.cols+1),{});
    if(q==='menos-fila')cambiar(redimensionar(o,o.filas-1,o.cols),{});
    if(q==='menos-col')cambiar(redimensionar(o,o.filas,o.cols-1),{});
    if(q==='paren')cambiar(o,{paren:v});
    if(q==='alinear')cambiar(o,{alinear:v});
    if(q==='letra')cambiar(o,{tam:Math.max(10,Math.min(60,Math.round(o.tam*+v)))});
    if(q==='vaciar')cambiar(o,{celdas:o.celdas.map(f=>f.map(()=>'')),marcas:null});
    if(q==='sistema'){const r=await dialogoMatriz({titulo:'📋 Pegar un sistema',inicial:{celdas:o.celdas,paren:o.paren,aumentada:o.aumentada,alinear:o.alinear},conCeldas:false,sistema:true,boton:'Usar'});
      if(r){const n=redimensionar(o,r.celdas.length,r.celdas[0].length);cambiar(n,{celdas:r.celdas,aumentada:r.aumentada,paren:r.paren,alinear:r.alinear})}}
    ctx.repintarPanel();
  }
  function cambioSelect(t){if(t.dataset.mzAum===undefined)return false;const o=matrizDe(opcMid);if(o)cambiar(o,{aumentada:t.value===''?null:+t.value});ctx.repintarPanel();return true}

  /* ---------- ⇄ operaciones de renglón ---------- */
  function abrirRenglon(o){
    if(!esNumerica(deTextos(o.celdas))){aviso('Primero llena todas las celdas con números (✏️).',2200);return}
    if(o.filas<2){aviso('Hace falta al menos dos renglones.',1600);return}
    ren={mid:o.mid,tipo:'sumar',i:1,j:0,k:'',ops:[]};
    // la matriz queda arriba, a la vista, con el panel abierto abajo
    const v=ctx.vista(),[,b]=ctx.aPantalla(o.x,o.y),[,h]=ctx.aPantalla(o.x,o.y+o.h);if(h>ctx.H()*.42||b<8)ctx.irA({...v,y:o.y-24/v.z});
    ctx.abrirPanel('mz-renglon');ctx.pintarVivo();
  }
  const kDe=()=>fr(ren.k);
  function opActual(mostrar=true){
    const t=ren.tipo,i=ren.i,j=ren.j,o=matrizDe(ren.mid);if(!o)return null;
    const mal=m=>{if(mostrar)aviso(m,1800);return null};
    if(i==null)return mal('Elige el renglón que cambia.');
    if(t==='intercambiar'){if(j==null||j===i)return mal('Elige otro renglón para intercambiar.');return {tipo:t,i,j}}
    const k=kDe();if(!k)return mal(t==='multiplicar'?'Escribe por qué número multiplicas (por ejemplo 1/2).':'Escribe el múltiplo k (por ejemplo −2).');
    if(t==='multiplicar'){if(esCero(k))return mal('Multiplicar por 0 no se vale: perderías el renglón.');return {tipo:t,i,k}}
    if(j==null||j===i)return mal('Elige el otro renglón (el que se suma).');if(esCero(k))return mal('Sumar 0 veces un renglón no cambia nada.');
    return {tipo:t,i,j,k};
  }
  function actualizarK(){const p=ctx.f.querySelector('.mtz-k');if(p)p.textContent=ren.k?ren.k.replace(/-/g,'−'):'k';const n=ctx.f.querySelector('.mtz-not');if(n){const op=opActual(false);n.textContent=op?notacion(op):'…'}}
  function htmlRenglon(){
    const o=matrizDe(ren?.mid);if(!o)return '<p class="nota">La matriz ya no existe.</p>';
    const modo=ctx.P.mtzModo||'yo',t=ren.tipo,op=opActual(false);
    const chips=(attr,act,excluir)=>`<div class="row dib-chips">${Array.from({length:o.filas},(_,i)=>`<button type="button" class="chip" data-${attr}="${i}" aria-pressed="${act===i}" ${i===excluir?'disabled':''}>${R(i)}</button>`).join('')}</div>`;
    const teclas=['1','2','3','4','5','6','7','8','9','0','/','±','⌫'];
    return `<div class="segmentos" role="group" aria-label="Modo"><button type="button" data-mz-modo="yo" aria-pressed="${modo==='yo'}">✍️ Lo hago yo</button><button type="button" data-mz-modo="calc" aria-pressed="${modo==='calc'}">🧮 Calcular por mí</button></div>
<div class="segmentos" role="group" aria-label="Operación">${[['intercambiar','⇄ Intercambiar'],['multiplicar','× Multiplicar'],['sumar','＋ Sumar un múltiplo']].map(([v,n])=>`<button type="button" data-mz-tipo="${v}" aria-pressed="${t===v}">${n}</button>`).join('')}</div>
<p class="nota">Toca los renglones en la matriz o elígelos aquí.</p>
<div class="mtz-ren-fila"><span>${t==='intercambiar'?'Renglón':'Cambia'}</span>${chips('mz-i',ren.i,null)}</div>
${t!=='multiplicar'?`<div class="mtz-ren-fila"><span>${t==='intercambiar'?'con':'usa'}</span>${chips('mz-j',ren.j,ren.i)}</div>`:''}
${t!=='intercambiar'?`<div class="mtz-ren-fila"><span>${t==='multiplicar'?'por':'k ='}</span><b class="mtz-k" aria-live="polite">${ren.k?esc(ren.k.replace(/-/g,'−')):'k'}</b></div>
<div class="mtz-mini" role="group" aria-label="Escribe el número">${teclas.map(k=>`<button type="button" data-mz-k="${k}" aria-label="${k==='±'?'Cambiar el signo':k==='⌫'?'Borrar':k}">${k}</button>`).join('')}</div>
<p class="nota">${t==='multiplicar'?'Acepta fracciones (1/2) y negativos.':`${R(ren.i??1)} → ${R(ren.i??1)} + k·${R(ren.j??0)}; para restar escribe k negativo (−2).`}</p>`:''}
<p class="mtz-not-caja">Operación: <b class="mtz-not">${op?notacion(op):'…'}</b></p>
${ren.ops.length?`<ul class="dib-objs">${ren.ops.map((x,n)=>`<li><span>${notacion(x)}</span><button type="button" class="btn-icono" data-mz-quitar="${n}" aria-label="Quitar ${notacion(x)}">✕</button></li>`).join('')}</ul>`:''}
<div class="dib-presets"><button type="button" class="btn ghost btn-chico" data-d="mz-otra">＋ Otra en el mismo paso</button><button type="button" class="btn ghost btn-chico" data-d="mz-sugerir">💡 Siguiente paso sugerido</button></div>
<button type="button" class="btn ancho" data-d="mz-aplicar">${modo==='calc'?'🧮 Aplicar':'✍️ Crear la matriz siguiente'}</button>`;
  }
  // Primer toque: el renglón que cambia; segundo: el otro (con el que se intercambia o el que se suma)
  function elegirRenglon(i){
    if(!ren)return;
    if(ren.tipo==='multiplicar')ren.i=i;
    else if(ren.pick==='j'&&i!==ren.i){ren.j=i;ren.pick='i'}
    else{ren.i=i;if(ren.j===i)ren.j=null;ren.pick='j'}
    ctx.repintarPanel();ctx.pintarVivo();
  }
  function sugerir(){
    const o=matrizDe(ren.mid);if(!o)return;const A=aplicarOps(deTextos(o.celdas),ren.ops),op=sugerencia(A,columnasPivote(o));
    if(!op){aviso(`✅ Ya está en forma escalonada reducida.`,2000);return}
    ren={...ren,tipo:op.tipo,i:op.i,j:op.j??null,k:op.k?texto(op.k).replace('−','-'):''};
    ctx.repintarPanel();ctx.pintarVivo();
    aviso(`💡 Sugerencia: ${notacion(op)} (${op.tipo==='intercambiar'?'para tener un pivote distinto de 0':op.tipo==='multiplicar'?'para que el pivote sea 1':'para hacer 0 debajo o arriba del pivote'})`,3600);
  }
  function aplicarRenglon(){
    const o=matrizDe(ren.mid);if(!o)return;let ops=ren.ops.slice();
    const op=opActual(!ops.length);if(op)ops.push(op);else if(!ops.length)return;
    const A=deTextos(o.celdas);let B;try{B=aplicarOps(A,ops)}catch(e){aviso(e.message,2200);return}
    const modo=ctx.P.mtzModo||'yo',T=o.tam||22;
    // la operación se anota a la derecha de su renglón (varias en el mismo renglón, separadas por «;»)
    const notas=Array.from({length:o.filas},()=>[]);for(const x of ops)notas[x.i].push(notacion(x));
    const src=medirMatriz({...o,id:nid(),notas:notas.map(n=>n.join('; '))});
    const tocados=new Set(ops.flatMap(x=>x.tipo==='intercambiar'?[x.i,x.j]:[x.i]));
    const celdas=modo==='calc'?aTextos(B):aTextos(B).map((f,i)=>tocados.has(i)?f.map(()=>''):f);
    let n=nuevaMatriz(0,0,o.filas,o.cols,{celdas,paren:o.paren,aumentada:o.aumentada,alinear:o.alinear,tam:T,color:o.color,prefijo:'~',
      esperado:modo==='calc'?null:aTextos(B),ops,de:o.mid,serie:o.serie||o.mid});
    // a la derecha; si no cabe en la hoja, abajo
    let x=src.x+src.w+T*.4,y=src.y;if(x+n.w>Math.max(ctx.anchoP(),src.x+src.w)+4){x=src.x;y=src.y+src.h+T*.7}
    n=medirMatriz({...n,x:Math.round(x),y:Math.round(y)});
    ctx.aplicar(objs().map(q=>q===o?src:q).concat([n]));
    ren=null;ctx.cerrarPanel();
    if(modo==='calc'){flash={mid:n.mid,celdas:cambios(A,B),hasta:performance.now()+1600};ctx.seleccionar(ctx.conGrupos(new Set([n.id])));mostrar(n);forma(n,B)}
    else{const k=celdas.flat().findIndex(c=>!String(c).trim());aviso('✍️ Llena los renglones que cambian y toca ✓ Revisar.',2400);editar(n.mid,Math.floor(Math.max(0,k)/n.cols),Math.max(0,k)%n.cols)}
  }
  function mostrar(o){const v=ctx.vista(),[a,b]=ctx.aPantalla(o.x,o.y),[e,h]=ctx.aPantalla(o.x+o.w,o.y+o.h);if(e>ctx.W()-8||h>ctx.H()-8||a<0||b<0)ctx.irA({...v,x:o.x+o.w/2-ctx.W()/2/v.z,y:o.y-30/v.z})}
  // ¿Llegó a la escalonada (reducida)? Un aviso pequeño y la solución del sistema
  function forma(o,B){
    const cols=columnasPivote(o);if(!esEscalonada(B,cols))return;
    const red=esReducida(B,cols),t=red?'✅ Forma escalonada reducida':'✅ Forma escalonada';
    if(o.aumentada!=null)avisoAccion(t,'Ver la solución',()=>verSolucion(o,B),7000);else aviso(t,2400);
  }
  async function verSolucion(o,B){
    const s=solucion(B||deTextos(o.celdas));
    const r=await menuAcciones({titulo:s.tipo==='unica'?`Solución: ${s.texto}`:s.tipo==='ninguna'?'Sistema sin solución':'Infinitas soluciones',
      opciones:[...(s.tipo!=='unica'?[['nada',esc(s.texto)]]:[]),['hoja','📌 Escribirla en la hoja'],['ok','Entendido']]});
    if(r==='hoja')ponerTexto(o,s.tipo==='unica'?s.texto:s.texto.replace(/^Sistema sin solución \(incompatible\): /,'Sin solución: '));
  }
  function ponerTexto(o,t,{abajo=true}={}){
    const tam=Math.max(14,Math.round((o.tam||22)*.8)),m=medidasTexto(t,tam),x=o.x,y=abajo?o.y+o.h+8:o.y;
    const n={t:'texto',id:nid(),x,y,w:m.w,h:m.h,texto:t,tam,color:o.color||'#1f2430'};ctx.aplicar([...objs(),n]);return n;
  }

  /* ---------- ✓ Revisar («Lo hago yo») ---------- */
  function revisar(o){
    const r=revisarCeldas(o);if(!r){aviso('Esta matriz no tiene respuesta para revisar.',1600);return}
    // solo se marcan los renglones que cambian (los demás ya venían copiados)
    const toc=new Set((o.ops||[]).flatMap(x=>x.tipo==='intercambiar'?[x.i,x.j]:[x.i]));if(toc.size){r.marcas=r.marcas.map((f,i)=>toc.has(i)?f:f.map(()=>null));r.ok=r.marcas.flat().filter(v=>v==='ok').length}
    const n=cambiar(o,{marcas:r.marcas},{seleccionar:!ed});
    if(ed&&tec)tec.querySelector('.mtz-tec-rev').hidden=false;
    if(r.mal){const [i,c]=r.marcas.flatMap((f,i)=>f.map((v,j)=>v==='mal'?[i,j]:null)).find(Boolean);aviso(`❌ ${r.mal} por corregir (en rojo). Pista: ${pista(o,i,c)}`,5200);return}
    if(r.vacia){aviso(`👍 Vas bien: ${r.ok} correctas, faltan ${r.vacia}.`,2200);return}
    aviso('✅ ¡Todo correcto!',1800);const B=deTextos(n.celdas);if(esNumerica(B))setTimeout(()=>forma(n,B),1900);
  }
  function pista(o,i,c){
    const src=matrizDe(o.de),ops=o.ops||[];if(!src||!ops.length)return `revisa ${R(i)}, columna ${c+1}.`;
    let A=deTextos(src.celdas),k=-1;ops.forEach((op,n)=>{if(op.i===i||op.tipo==='intercambiar'&&op.j===i)k=n});
    if(k<0)return `${R(i)} no cambia: cópialo igual.`;
    A=aplicarOps(A,ops.slice(0,k));const op=ops[k];return pistaCelda(A,{...op,k:op.k&&F(op.k.n,op.k.d)},i,c);
  }
  async function mostrarRespuesta(o){
    if(!o.esperado)return;
    if(!await confirmar({titulo:'¿Mostrar la respuesta?',texto:'Intentarlo tú ayuda a aprender. Si te atoraste, puedes verla y seguir.',si:'Mostrarla',no:'Sigo intentando'}))return;
    const n=cambiar(o,{celdas:o.esperado.map(f=>f.slice()),marcas:null,esperado:null});flash={mid:n.mid,celdas:o.celdas.flatMap((f,i)=>f.map((x,j)=>String(x).trim()?null:[i,j]).filter(Boolean)),hasta:performance.now()+1600};
    const B=deTextos(n.celdas);if(esNumerica(B))forma(n,B);
  }

  /* ---------- 🧮 herramientas ---------- */
  function junto(o,n,{abajo=false}={}){
    const T=o.tam||22;let x=o.x+o.w+T*.8,y=o.y;if(abajo||x+n.w>Math.max(ctx.anchoP(),o.x+o.w)+4){x=o.x;y=o.y+o.h+T*.7}
    return medirMatriz({...n,x:Math.round(x),y:Math.round(y)});
  }
  async function herramientas(o){
    const A=deTextos(o.celdas.map(f=>o.aumentada!=null?f.slice(0,o.aumentada):f));
    const cuadrada=A.length===A[0].length,num=esNumerica(deTextos(o.celdas));
    const tieneMano=objs().some(x=>x.ancla===o.mid&&x.t==='trazo');
    const r=await menuAcciones({titulo:'🧮 Herramientas de la matriz',opciones:[
      ...(o.aumentada!=null&&num?[['sol','✔️ Solución del sistema']]:[]),...(num?[['sug','💡 Siguiente paso sugerido']]:[]),
      ...(cuadrada&&num?[['det','|A| Determinante'],['detp','|A| Determinante paso a paso'],['inv','A⁻¹ Inversa'],['invp','A⁻¹ Inversa paso a paso (Gauss-Jordan)']]:[]),
      ...(num?[['tr','Aᵀ Transpuesta'],['rango','Rango']]:[]),
      ...(tieneMano?[['ia','✨ Pasar a números lo escrito a mano']]:[]),
      ...(!num?[['nada','Llena todas las celdas con números para usar las herramientas.']]:[])]});
    if(!r||r==='nada')return;
    try{
      if(r==='sol'){verSolucion(o);return}
      if(r==='sug'){const op=sugerencia(deTextos(o.celdas),columnasPivote(o));aviso(op?`💡 Siguiente paso: ${notacion(op)}`:'✅ Ya está en forma escalonada reducida.',3200);return}
      if(r==='det'||r==='detp'){const d=det(A),t=r==='det'?`det = ${texto(d)}`:pasosDet(A).join('\n');const n=ponerTexto(o,t);ctx.seleccionar(new Set([n.id]));return}
      if(r==='tr'){const n=junto(o,nuevaMatriz(0,0,A[0].length,A.length,{celdas:aTextos(transpuesta(A)),paren:o.paren,tam:o.tam,color:o.color,prefijo:'Aᵀ ='}));ctx.aplicar([...objs(),n]);ctx.seleccionar(new Set([n.id]));return}
      if(r==='rango'){const n=ponerTexto(o,`rango = ${rango(A)}`);ctx.seleccionar(new Set([n.id]));return}
      if(r==='inv'||r==='invp'){const v=inversa(A);if(!v.existe){aviso(`No tiene inversa: su determinante es ${texto(det(A))}.`,2600);return}
        if(r==='inv'){const n=junto(o,nuevaMatriz(0,0,A.length,A.length,{celdas:aTextos(v.inversa),paren:o.paren,tam:o.tam,color:o.color,prefijo:'A⁻¹ ='}));ctx.aplicar([...objs(),n]);ctx.seleccionar(new Set([n.id]));return}
        // paso a paso: [A | I] y cada operación con su matriz siguiente, hacia abajo
        const lista=[];const T=o.tam||22;let prev=nuevaMatriz(0,0,A.length,2*A.length,{celdas:aTextos(v.aumentada),paren:o.paren,aumentada:A.length,tam:T,color:o.color,prefijo:'[A | I] ='});
        prev=junto(o,prev,{abajo:true});lista.push(prev);let M=v.aumentada;
        for(const {op,M:B} of v.pasos){const nota=Array(A.length).fill('');nota[op.i]=notacion(op);lista[lista.length-1]=medirMatriz({...lista.at(-1),notas:nota});
          const n=medirMatriz({...nuevaMatriz(0,0,A.length,2*A.length,{celdas:aTextos(B),paren:o.paren,aumentada:A.length,tam:T,color:o.color,prefijo:'~'}),x:prev.x,y:Math.round(prev.y+prev.h+T*.5)});
          lista.push(n);prev=n;M=B}
        ctx.aplicar([...objs(),...lista]);const ult=lista.at(-1);mostrar(ult);aviso(`A⁻¹ por Gauss-Jordan en ${v.pasos.length} operaciones: a la derecha de la línea queda la inversa.`,3600);return}
      if(r==='ia'){await aNumeros(o);return}
    }catch(e){aviso(e.message||'No se pudo calcular.',2600)}
  }
  function operarDos(ms,esSuma){
    const [a,b]=ms.slice().sort((p,q)=>p.x-q.x),A=deTextos(a.celdas),B=deTextos(b.celdas);
    if(!esNumerica(A)||!esNumerica(B)){aviso('Llena todas las celdas con números.',1800);return}
    try{const C=esSuma?sumaM(A,B):producto(A,B);
      const n=junto(b,nuevaMatriz(0,0,C.length,C[0].length,{celdas:aTextos(C),paren:a.paren,tam:a.tam,color:a.color,prefijo:esSuma?'A + B =':'A·B ='}));
      ctx.aplicar([...objs(),n]);ctx.seleccionar(new Set([n.id]));
    }catch(e){aviso(e.message,3200)}
  }
  async function copiarLatex(o){
    const t=aLatex(o.celdas,{paren:o.paren,aumentada:o.aumentada});
    try{await navigator.clipboard.writeText(t);aviso('📋 LaTeX copiado',1400)}
    catch(e){await menuAcciones({titulo:'LaTeX de la matriz',opciones:[['ok',`<code style="word-break:break-all">${esc(t)}</code>`]]})}
    return t;
  }

  /* ---------- ✨ lo escrito a mano → números (IA, siempre con confirmación) ---------- */
  async function leerConIA(caja,lista,filas,cols){
    if(!iaDisponible()){aviso('✨ Para leer lo escrito, configura la IA (gratis con Gemini) en Perfil → ✨ Inteligencia artificial.',4200);return null}
    ctx.estado('✨ Leyendo los números…');
    try{const png=await ctx.renderRegion(caja,{lista,max:1280,fondo:false,claro:true,blanco:true});
      const r=await pedir({nivel:'vision',maxTokens:600,imagenes:[{media_type:'image/png',data:await blobB64(png.blob)}],
        esquemaJSON:{type:'object',properties:{celdas:{type:'array',items:{type:'array',items:{type:'string'}}}},required:['celdas']},
        sistema:'Lees una matriz escrita a mano. Devuelve sus celdas por renglón como texto: enteros, decimales o fracciones como 1/2, con signo menos «-». Si una celda no se lee, cadena vacía.',
        mensajes:[{role:'user',content:filas?`Es una matriz de ${filas} × ${cols}. Lee sus números.`:'Lee la matriz de la imagen.'}]});
      ctx.estado('');const c=Array.isArray(r?.celdas)?r.celdas.filter(f=>Array.isArray(f)&&f.length):[];if(!c.length)throw new Error('No se leyó ninguna matriz.');
      const n=Math.max(...c.map(f=>f.length));return c.map(f=>Array.from({length:n},(_,j)=>String(f[j]??'').trim()));
    }catch(e){ctx.estado('');aviso(e.message||'No se pudo leer.',3000);return null}
  }
  async function aNumeros(o){
    const mano=objs().filter(x=>x.ancla===o.mid&&x.t==='trazo');const c=cajaDe([o,...mano]);
    const celdas=await leerConIA([c[0]-6,c[1]-6,c[2]+6,c[3]+6],[o,...mano],o.filas,o.cols);if(!celdas)return;
    const r=await dialogoMatriz({titulo:'✨ Esto leímos: corrige si hace falta',inicial:{celdas,paren:o.paren,aumentada:o.aumentada,alinear:o.alinear},boton:'Usar estos números'});if(!r)return;
    const ids=new Set(mano.map(x=>x.id)),n=medirMatriz({...redimensionar(o,r.celdas.length,r.celdas[0].length),celdas:r.celdas,paren:r.paren,aumentada:r.aumentada,alinear:r.alinear,id:nid()});
    ctx.aplicar(objs().filter(x=>!ids.has(x.id)).map(x=>x===o?n:x));ctx.seleccionar(new Set([n.id]));aviso('✨ Listo (Deshacer devuelve lo escrito a mano)',2000);
  }
  // 2f: las llaves o corchetes de matriz del 📐 viejo (con lo escrito adentro) → matriz editable
  async function convertirLlaves(){
    const ids=ctx.selIds();if(!ids)return;const grupo=objs().filter(o=>ids.has(o.id)&&(o.forma==='corchetes'||o.forma==='llaves'));if(!grupo.length)return;
    const c=cajaDe(grupo),dentro=objs().filter(o=>!grupo.includes(o)&&(o.t==='trazo'||o.t==='texto')&&(()=>{const k=cajaDe([o]);return k[0]>=c[0]-4&&k[2]<=c[2]+4&&k[1]>=c[1]-4&&k[3]<=c[3]+4})());
    let celdas=null;if(dentro.length&&iaDisponible()&&await confirmar({titulo:'✨ ¿Leer los números con IA?',texto:'Te mostramos lo que leímos para que lo corrijas antes de usarlo.',si:'Leer con IA',no:'Escribirlos yo'}))
      celdas=await leerConIA([c[0]-6,c[1]-6,c[2]+6,c[3]+6],[...grupo,...dentro]);
    const r=await dialogoMatriz({titulo:'▦ Convertir en matriz editable',inicial:celdas?{celdas,paren:grupo[0].forma==='llaves'?'{}':'[]',aumentada:null}:{celdas:[['',''],['','']],paren:grupo[0].forma==='llaves'?'{}':'[]',aumentada:null},boton:'Convertir'});if(!r)return;
    const quitar=new Set([...grupo,...dentro].map(o=>o.id)),T=Math.max(14,Math.min(40,Math.round((c[3]-c[1])/r.celdas.length/1.7)));
    const n=medirMatriz({...nuevaMatriz(c[0],c[1],r.celdas.length,r.celdas[0].length,{celdas:r.celdas,paren:r.paren,aumentada:r.aumentada,alinear:r.alinear,tam:T,color:grupo[0].color})});
    ctx.aplicar([...objs().filter(o=>!quitar.has(o.id)),n]);ctx.seleccionar(new Set([n.id]));aviso('▦ Ahora es una matriz editable (Deshacer la regresa)',2200);
  }
  const esLlaveVieja=os=>os.length>=1&&os.every(o=>o.forma==='corchetes'||o.forma==='llaves')&&new Set(os.map(o=>o.g)).size===1;

  return {insertar,editar,terminar,cajaCelda,tecla,abajo,toque,pintarVivo,barra,click,cambioSelect,matrizEn,matrizDe,esLlaveVieja,
    htmlPanel:h=>h==='mz-renglon'?htmlRenglon():h==='mz-opc'?htmlOpc():'',titulo:h=>({'mz-renglon':'⇄ Operación de renglón','mz-opc':'⚙️ Matriz'})[h],
    get editando(){return ed?{...ed}:null},get renglon(){return ren?{...ren}:null},alCerrarPanel:h=>{if(h==='mz-renglon'){ren=null;ctx.pintarVivo()}},
    // para las pruebas
    escribir:t=>{for(const ch of String(t))escribir(ch)},siguiente:()=>mover(1),aplicarOps:(mid,ops,modo)=>{const o=matrizDe(mid);ren={mid,tipo:'sumar',i:null,j:null,k:'',ops:ops.map(x=>({...x,k:x.k!=null?fr(x.k):undefined}))};ctx.P.mtzModo=modo;aplicarRenglon()},
    revisar:mid=>revisar(matrizDe(mid)),copiarLatex:mid=>aLatex(matrizDe(mid).celdas,{paren:matrizDe(mid).paren,aumentada:matrizDe(mid).aumentada})};
}
