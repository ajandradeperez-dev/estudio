/* ✏️ Editor de dibujo del cuaderno, a pantalla completa (capa .dibujo-fondo: Atrás cierra primero sus menús, el texto que
   escribes o la selección, y después sale guardando).
   - Lienzo grande (crece hacia abajo y a los lados, o páginas carta) en coordenadas propias: zoom de 25 % a 800 % centrado
     entre los dedos, sin pixelarse (los trazos son vectores y se vuelven a pintar al terminar el gesto).
   - GESTOS: 1 dedo o S Pen dibuja · 2 dedos pellizcan y mueven · tocar con 2 dedos deshace (y con 3 rehace) · doble toque
     con 2 dedos ajusta a la pantalla o vuelve al 100 %. Ratón: rueda desplaza, Ctrl + rueda acerca, espacio + arrastrar
     mueve y «0» ajusta a la pantalla.
   - 🔒 Bloquear: la vista queda fija y 2 dedos solo deshacen. Se quita tocando 🔒 o manteniendo 2 dedos medio segundo:
     se desbloquea mientras los tienes puestos y se vuelve a bloquear sola al soltar. Con «Escribir y avanzar», la flecha →
     mueve la vista a la derecha o al inicio del siguiente renglón.
   - ✌️ Dos dedos (en 📐 Formas, PROMPT-DOS-DEDOS): la única herramienta en la que dos dedos dibujan, elegida a propósito.
     Modos: 📏 regla (una línea entre los dedos), 🧭 compás (centro y radio; girando, un arco con su ángulo), 📐 medir
     (pendiente, distancia, punto medio y ecuación en el plano; «Dejar en la hoja»), ▭ marco o resaltado y 🌀 barrido
     (una línea entre los dedos cada tantos px, con degradado y espejo; todo es un solo grupo). Con ratón o lápiz solo:
     presionar = punto A, arrastrar = punto B; lápiz + dedo también. El zoom, con + y −.
   - 📈 Plano cartesiano editable (📐 → Plano cartesiano; plano.js): tocarlo lo elige (asas para el tamaño, arrastrar lo
     mueve; ⚙️ Ajustes en vivo, ➕ Agregar punto, función, recta, segmento, vector, circunferencia, tabla, área y desigualdad,
     🔒 Fijar, ⧉ y 🗑️). Lo que se dibuja dentro queda anclado (`ancla`) y se mueve, escala y reacomoda con él. Con ✋ y
     «Mover la vista del plano», un dedo mueve el rango y dos lo acercan. Dos toques en un número del extremo lo editan.
   - ✋ Modo mano: un dedo mueve. Con el S Pen («Solo el lápiz dibuja»), el lápiz dibuja y el dedo mueve.
   - Herramientas: pluma (bolígrafo, fuente, lápiz), resaltador (detrás de la tinta), borrador (de trazo o de precisión),
     lazo (mover, escalar, rotar, color, grosor, copiar, duplicar, borrar, ✨ pasar a texto), formas (inteligentes al
     mantener al final del trazo y de matemáticas), regla y transportador, texto, fórmulas (KaTeX), imágenes, fondos,
     plantillas, capas y modo práctica. Exporta PNG y PDF.
   - Rendimiento: tres canvas (fondo, tinta terminada, lo que se mueve), solo lo visible; durante un gesto con muchos
     trazos se mueve la imagen ya pintada y al soltar se vuelve a pintar nítida.
   abrirEditorDibujo({dibujo, titulo, nuevo, cargarImagen(id) → Blob, nuevaImagen({blob,ancho,alto}) → id, autoguardar(d)})
   → Promise<{dibujo, cambiado, vista, png:{blob,ancho,alto}|null}> */
import {esc} from '../../utilidades.js';
import {aviso,avisoAccion,confirmar,menuAcciones} from '../ui.js';
import {vibrar} from '../ajustes.js';
import {tex} from '../formula.js';
import {iaDisponible,pedir} from '../ia.js';
import {comprimirFoto} from '../cuaderno/medios.js';
import {SIMBOLOS} from '../cuaderno/editor-ui.js';
import {normalizarDibujo,nuevoIdObj,caja,cajaDe,cajaPuntos,tocaObjeto,objetoEn,simplificar,recortarTrazo,borrarCon,enLazo,conGrupos,
  transformar,mMover,mEscalar,mRotar,aplicarM,diferencia,aplicarOp,reconocerForma,formaDirecta,FORMAS,plantilla,PLANTILLAS,FONDOS,
  region,paginasPDF,anchoPagina,paraGuardar,medidasTexto,distSeg,capaDe,PAGINA,CM,ZOOM_MIN,ZOOM_MAX,TINTA,
  MODOS_DOS,conRejilla,ajustarRejilla,medirDos,lineasMedida,objetosMedida,arcoCompas,textoAngulo,marcoDos,objetosBarrido,parabolaConRectas,numero,
  origenCartesiano,unidadCartesiano,pasoCartesiano} from './modelo.js';
import {pintarObjetos,pintarFondo,pintarObjeto,pintarTrazo,colorVisible,rgb} from './pintar.js';
import {imagenFormula,medirFormula,pdfDePaginas} from './raster.js';
import {nuevoPlano,igualar,matrizPlano,planoEn,dentroPlano,aPlanoDe,aLienzo,anclable,objetoPlanoEn,limitesEn,ajustarAPaso,siguienteNombre,nombrePunto,
  ecuacionRecta,ecuacionCirculo,expresionValida,rangoDeObjetos,PRESETS,COLORES_PLANO,kx,ky,numero as numeroP} from './plano.js';
import {num} from '../generadores/verificar.js';

export const PALETA=[['Negro','#1f2430'],['Azul','#2563eb'],['Rojo','#dc2626'],['Verde','#15803d'],['Morado','#7c3aed'],['Naranja','#ea580c'],['Gris','#6b7280'],
  ['Amarillo','#facc15'],['Verde claro','#4ade80'],['Rosa','#f472b6']];
const GROSORES={pluma:[1.2,2,3,5,8],resaltador:[10,16,24,32,44]};
const TIPOS=[['boli','🖊️','Bolígrafo'],['fuente','✒️','Pluma fuente'],['lapiz','✏️','Lápiz']];
const HERR=[['pluma','✏️','Pluma'],['resaltador','🖍️','Resaltador'],['borrador','🧽','Borrador'],['lazo','⬚','Lazo (seleccionar)'],['formas','📐','Formas'],['texto','🔤','Texto y fórmulas']];

/* ---------- preferencias del dibujo en este dispositivo (no son progreso) ---------- */
const CLAVE='ciberlab-dibujo';
const PREF0={pluma:{tipo:'boli',color:'#1f2430',ancho:2},resaltador:{color:'#facc15',ancho:16,recta:false},borrador:{modo:'trazo',tam:24,soloRes:false},
  texto:{tam:20,color:'#1f2430'},dos:{modo:'regla',ajustar:true,marco:'marco',espaciado:14,degradado:false,color2:'#7c3aed',simetria:'no',ancho:1,visto:false},forma:'linea',filas:3,cols:3,favoritas:[],recientes:[],contraida:false,inteligentes:true,minimapa:true,soloLapiz:true,avanzar:false};
export function prefsDibujo(){
  let x={};try{x=JSON.parse(localStorage.getItem(CLAVE))||{}}catch(e){}
  const p={...PREF0,...x};for(const k of ['pluma','resaltador','borrador','texto','dos'])p[k]={...PREF0[k],...(x[k]||{})};
  p.favoritas=Array.isArray(p.favoritas)?p.favoritas.slice(0,4):[];p.recientes=Array.isArray(p.recientes)?p.recientes.slice(0,5):[];return p;
}
const guardarPrefs=p=>{try{localStorage.setItem(CLAVE,JSON.stringify(p))}catch(e){}};
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function esOscuro(){const c=document.createElement('canvas').getContext('2d');c.fillStyle=css('--surface')||'#fff';const [r,g,b]=rgb(c.fillStyle);return (r*.3+g*.59+b*.11)<110}
const blobB64=b=>new Promise(res=>{const f=new FileReader();f.onload=()=>res(String(f.result).split(',')[1]);f.readAsDataURL(b)});
let portapapeles=[];

export function abrirEditorDibujo({dibujo,titulo='Dibujo',nuevo=false,cargarImagen=async()=>null,nuevaImagen=null,autoguardar=null}={}){
  return new Promise(resolver=>{
  const P=prefsDibujo(),d=normalizarDibujo(dibujo),original=JSON.stringify(paraGuardar(d));
  let objs=d.objetos,hist=d.historial.slice(),rehacerPila=[],cambiado=false,cerrado=false;
  let herr='pluma',vista={x:0,y:0,z:1},W=0,H=0,k=1,oscuro=esOscuro(),bloqueado=d.bloqueado,temporal=false,mano=false,practica=!!d.practica,revelados=new Set();
  let sel=null,g=null,ocultos=null,lapizVisto=false,lapizActivo=false,espacio=false,regla=null,transp=null,panel=null,editando=null,ultimoTap=null,tieneVista=false;
  const toques=new Map(),imagenes=new Map(),formulas=new Map();

  /* ---------- DOM ---------- */
  const f=document.createElement('div');f.className='dibujo-fondo dib';f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');f.setAttribute('aria-label',`Dibujo: ${titulo}`);
  const bot=(d,ico,et,extra='')=>`<button type="button" data-d="${d}" aria-label="${esc(et)}" title="${esc(et)}"${extra}>${ico}</button>`;
  f.innerHTML=`<header class="dib-cab"><button type="button" class="btn btn-chico" data-d="listo">✓ Listo</button><span class="dib-titulo">${esc(titulo)}</span>
<span class="dib-estado nota" aria-live="polite"></span><button type="button" class="dib-zoom" data-d="zoom" aria-label="Zoom">100 %</button>${bot('mas','⋯','Más opciones del dibujo',' class="btn-icono"')}<button type="button" data-d="cancelar" hidden aria-label="Salir del dibujo"></button></header>
<div class="dib-area" tabindex="-1"><canvas class="dib-c dib-cfondo" aria-hidden="true"></canvas><canvas class="dib-c dib-ctinta" aria-hidden="true"></canvas>
<canvas class="dib-c dib-cvivo" aria-label="Lienzo: dibuja con un dedo, el ratón o el lápiz; con dos dedos acercas y te mueves"></canvas>
<canvas class="dib-mapa" aria-hidden="true" hidden></canvas><div class="dib-selbar" role="toolbar" aria-label="Lo seleccionado" hidden></div>
<button type="button" class="dib-avanzar" data-d="avanzar" aria-label="Avanzar: mover la vista a la derecha" hidden>→</button>
<div class="dib-zoombtns" role="group" aria-label="Zoom" hidden><button type="button" data-d="zoom-menos" aria-label="Alejar">−</button><button type="button" data-d="zoom-mas" aria-label="Acercar">＋</button></div>
<button type="button" class="btn btn-chico dib-dejar" data-d="dos-dejar" hidden>📌 Dejar en la hoja</button><div class="dib-opc" role="dialog" aria-label="Opciones de la herramienta" hidden></div></div>
<nav class="dib-barra" aria-label="Herramientas de dibujo"><div class="dib-fila dib-herrs" role="toolbar" aria-label="Herramienta">${HERR.map(([h,i,n])=>bot(`h-${h}`,i,n,` data-herr="${h}" aria-pressed="${h==='pluma'}"`)).join('')}${bot('contraer','▾','Contraer la barra',' class="dib-contraer"')}</div>
<div class="dib-fila dib-acc" role="toolbar" aria-label="Acciones">${bot('deshacer','↶','Deshacer (Ctrl+Z)')}${bot('rehacer','↷','Rehacer (Ctrl+Y)')}${bot('bloquear','🔓','Bloquear la vista',' aria-pressed="false" class="dib-candado"')}${bot('mano','✋','Modo mano: un dedo mueve',' aria-pressed="false" class="dib-mano"')}<span class="dib-favs"></span></div></nav>
<input type="file" accept="image/*" capture="environment" class="dib-camara" hidden><input type="file" accept="image/*" class="dib-galeria" hidden>`;
  const $=s=>f.querySelector(s),area=$('.dib-area'),cF=$('.dib-cfondo'),cT=$('.dib-ctinta'),cV=$('.dib-cvivo'),mapa=$('.dib-mapa');
  const xF=cF.getContext('2d'),xT=cT.getContext('2d'),xV=cV.getContext('2d');
  document.body.appendChild(f);document.body.classList.add('con-dibujo');

  /* ---------- marcas: menús, selección y texto tienen su entrada en el historial (Atrás los cierra primero) ---------- */
  let marca=null,marcaCb=null;
  function abrirMarca(cb){marcaCb=cb;if(marca)return;marca=document.createElement('div');marca.className='dibujo-fondo dib-marca';marca.style.display='none';
    marca.innerHTML='<button type="button" data-d="cancelar"></button>';marca.firstChild.addEventListener('click',()=>{const c=marcaCb;marca?.remove();marca=null;marcaCb=null;c?.()});document.body.appendChild(marca)}
  function quitarMarca(){if(!marca)return Promise.resolve();marca.remove();marca=null;marcaCb=null;
    return new Promise(r=>{let ok=false;const fin=()=>{if(ok)return;ok=true;removeEventListener('popstate',fin);setTimeout(r,0)};addEventListener('popstate',fin);setTimeout(fin,400)})}
  const marcaSiHace=()=>{if(sel||panel||editando)abrirMarca(()=>{if(editando)terminarTexto();if(panel)cerrarPanel(false);if(sel)limpiarSel(false)});else quitarMarca()};

  /* ---------- vista ---------- */
  const anchoP=()=>anchoPagina(d),dd=()=>({...d,objetos:objs});
  function limitar(v){
    const z=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,v.z)),r=region(dd()),vw=W/z,vh=H/z;
    const x0=Math.min(r[0],0)-vw*.75,x1=Math.max(r[2],anchoP())-vw*.25,y0=Math.min(r[1],0)-vh*.75,y1=Math.max(r[3],d.modo==='paginas'?PAGINA.h:vh)+vh*.25;
    return {z,x:Math.min(Math.max(v.x,x0),Math.max(x0,x1)),y:Math.min(Math.max(v.y,y0),Math.max(y0,y1))};
  }
  const zAncho=()=>Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,(W-16)/anchoP()));
  function ajustar(modo){
    if(!W)return;
    if(modo==='100'){const c=[vista.x+W/2/vista.z,vista.y+H/2/vista.z];return irA({z:1,x:c[0]-W/2,y:c[1]-H/2})}
    if(modo==='ancho'){const z=zAncho();return irA({z,x:-8/z,y:vista.y})}
    const r=region(dd()),c=cajaDe(objs.filter(o=>o.t!=='papel')),b=c?[Math.min(r[0],c[0]),Math.min(r[1],c[1]),Math.max(r[2],c[2]),Math.max(r[3],c[3])]:r;
    const z=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,Math.min((W-16)/(b[2]-b[0]),(H-16)/(b[3]-b[1]))));
    irA({z,x:(b[0]+b[2])/2-W/2/z,y:(b[1]+b[3])/2-H/2/z});
  }
  function irA(v){vista=limitar(v);tieneVista=true;pintarTodo();mostrarZoom()}
  const aMundo=(sx,sy)=>[vista.x+sx/vista.z,vista.y+sy/vista.z],aPantalla=(x,y)=>[(x-vista.x)*vista.z,(y-vista.y)*vista.z];
  function mostrarZoom(){const b=$('[data-d="zoom"]');b.textContent=`${Math.round(vista.z*100)} %`;b.setAttribute('aria-label',`Zoom: ${Math.round(vista.z*100)} %. Toca para ajustar`)}
  function medir(){
    const r=area.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);if(!w||!h)return;
    const c=W?[vista.x+W/2/vista.z,vista.y+H/2/vista.z]:null;
    W=w;H=h;k=Math.min(3,window.devicePixelRatio||1);
    for(const c2 of [cF,cT,cV]){c2.width=Math.round(W*k);c2.height=Math.round(H*k)}
    if(!tieneVista){if(d.vista)vista=limitar(d.vista);else{const z=zAncho();vista=limitar({z,x:-8/z,y:-8/z})}tieneVista=true}
    else if(c)vista=limitar({z:vista.z,x:c[0]-W/2/vista.z,y:c[1]-H/2/vista.z});   // girar o abrir el teclado: el mismo centro
    pintarTodo();mostrarZoom();
  }
  const ro=new ResizeObserver(medir);ro.observe(area);

  /* ---------- pintar ---------- */
  let cuadro=0,sucioT=false,sucioV=false,lento=false,foto=null;
  const opPintar=()=>({vista,ancho:W,alto:H,k,oscuro,capas:d.capas,practica,revelados,excluir:g?.ocultar||ocultos,imagen:imagenDe,formula:formulaDe});
  function pintarTodo(){sucioT=true;sucioV=true;pedirCuadro()}
  const pintarVivo=()=>{sucioV=true;pedirCuadro()};
  const pedirCuadro=()=>{if(!cuadro)cuadro=requestAnimationFrame(cuadroAhora)};
  function cuadroAhora(){
    cuadro=0;if(!W)return;
    if(sucioT){sucioT=false;
      pintarFondo(xF,d,{vista,ancho:W,alto:H,k,oscuro,papel:css('--surface')||'#fff',mesa:css('--surface-2')||'#e5e7eb'});
      if(foto&&g?.gesto&&lento){   // durante el gesto: se mueve la imagen ya pintada
        xT.setTransform(1,0,0,1,0,0);xT.clearRect(0,0,cT.width,cT.height);const s=vista.z/foto.v.z;
        xT.setTransform(s,0,0,s,(foto.v.x-vista.x)*vista.z*k,(foto.v.y-vista.y)*vista.z*k);xT.drawImage(foto.c,0,0);
      }else{const t0=performance.now();xT.setTransform(1,0,0,1,0,0);xT.clearRect(0,0,cT.width,cT.height);pintarObjetos(xT,objs,opPintar());lento=performance.now()-t0>9}
      if(mapa.hidden===false)pintarMapa();
    }
    if(sucioV){sucioV=false;pintarCapaViva()}
  }
  function fotoGesto(){if(!lento){foto=null;return}const c=document.createElement('canvas');c.width=cT.width;c.height=cT.height;c.getContext('2d').drawImage(cT,0,0);foto={c,v:{...vista}}}
  function imagenDe(id){
    const b=imagenes.get(id);if(b&&b!=='…')return b;
    if(!b){imagenes.set(id,'…');cargarImagen(id).then(bl=>bl?createImageBitmap(bl):null).then(bm=>{imagenes.set(id,bm||null);pintarTodo()}).catch(()=>imagenes.set(id,null))}
    return null;
  }
  function formulaDe(o,osc){
    const col=colorVisible(o.color||TINTA,osc),kk=`${col}|${o.tex}`,v=formulas.get(kk);if(v&&v!=='…')return v;
    if(!v){formulas.set(kk,'…');imagenFormula(o.tex,{tam:22,color:col}).then(r=>{formulas.set(kk,r||{});pintarTodo()})}
    return null;
  }
  // Lo que se mueve: trazo en curso, selección, lazo, guías (regla y transportador), goma y medidas
  function pintarCapaViva(){
    const x=xV;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cV.width,cV.height);
    x.setTransform(k*vista.z,0,0,k*vista.z,-vista.x*vista.z*k,-vista.y*vista.z*k);
    if(g?.trazo)pintarTrazo(x,{...g.trazo,pts:g.pred?[...g.trazo.pts,g.pred]:g.trazo.pts},{oscuro,z:vista.z});
    if(g?.vista)for(const o of g.vista)pintarObjeto(x,o,{vista,oscuro,imagen:imagenDe,formula:formulaDe});
    x.setTransform(k,0,0,k,0,0);
    if(regla)pintarRegla(x);if(transp)pintarTransp(x);
    if(g?.lazo){x.setLineDash([6,5]);x.strokeStyle=css('--primary')||'#2563eb';x.lineWidth=1.6;x.beginPath();g.lazo.forEach((p,i)=>{const [a,b]=aPantalla(p[0],p[1]);i?x.lineTo(a,b):x.moveTo(a,b)});x.stroke();x.setLineDash([])}
    if(g?.rect){const [a,b]=aPantalla(g.rect[0],g.rect[1]),[c,e]=aPantalla(g.rect[2],g.rect[3]);x.setLineDash([5,4]);x.strokeStyle='#64748b';x.lineWidth=1.2;x.strokeRect(Math.min(a,c),Math.min(b,e),Math.abs(c-a),Math.abs(e-b));x.setLineDash([])}
    if(sel&&!g?.sel)pintarSeleccion(x);
    if(g?.sel)pintarSeleccion(x,g.m);
    if(g?.goma){const [a,b]=g.goma;x.strokeStyle=oscuro?'#e5e7eb':'#334155';x.lineWidth=1.2;x.beginPath();x.arc(a,b,g.radioPx,0,Math.PI*2);x.stroke()}
    if(!g?.dos&&medicion&&herr==='dosdedos'){x.setTransform(k*vista.z,0,0,k*vista.z,-vista.x*vista.z*k,-vista.y*vista.z*k);for(const o of medicion.vista)pintarObjeto(x,o,{vista,oscuro});x.setTransform(k,0,0,k,0,0)}
    if(g?.dos&&g.pista&&!g.activo){x.strokeStyle=css('--primary')||'#2563eb';x.lineWidth=2;x.beginPath();x.arc(g.pista[0],g.pista[1],14,0,Math.PI*2);x.stroke()}
    const info=g?.dos?g.info:medicion&&herr==='dosdedos'?lineasMedida(medicion.res):null;
    if(info?.length){x.font='600 13px system-ui,sans-serif';const w=Math.min(W-16,Math.max(...info.map(t=>x.measureText(t).width))+16),h=info.length*19+10;
      x.fillStyle=oscuro?'rgba(20,24,32,.88)':'rgba(255,255,255,.94)';x.fillRect(8,8,w,h);x.strokeStyle=oscuro?'#475569':'#cbd5e1';x.lineWidth=1;x.strokeRect(8.5,8.5,w-1,h-1);
      x.fillStyle=oscuro?'#e5e7eb':'#1f2430';info.forEach((t,i)=>x.fillText(t,16,26+i*19,w-16))}
    if(g?.medida){x.font='600 13px system-ui,sans-serif';const t=g.medida,w=x.measureText(t).width+12,[a,b]=g.medidaEn;x.fillStyle=oscuro?'rgba(20,24,32,.85)':'rgba(255,255,255,.92)';
      x.fillRect(Math.min(W-w-4,a+14),Math.max(4,b-34),w,24);x.fillStyle=oscuro?'#e5e7eb':'#1f2430';x.fillText(t,Math.min(W-w-4,a+14)+6,Math.max(4,b-34)+16)}
  }
  function cajaSel(m){const os=objs.filter(o=>sel.ids.has(o.id));const c=cajaDe(m?os.map(o=>transformar(o,m,{mismoId:true})):os);return c}
  function pintarSeleccion(x,m){
    const pl=!m&&planoSel();if(pl){pintarSelPlano(x,pl);return}
    const c=cajaSel(m);if(!c)return;const [a,b]=aPantalla(c[0],c[1]),[e,h]=aPantalla(c[2],c[3]),col=css('--primary')||'#2563eb';
    x.setLineDash([6,4]);x.strokeStyle=col;x.lineWidth=1.5;x.strokeRect(a-6,b-6,e-a+12,h-b+12);x.setLineDash([]);
    x.fillStyle='#fff';x.strokeStyle=col;x.lineWidth=2;
    x.beginPath();x.arc(e+6,h+6,9,0,Math.PI*2);x.fill();x.stroke();                     // escalar
    x.beginPath();x.moveTo((a+e)/2,b-6);x.lineTo((a+e)/2,b-26);x.stroke();x.beginPath();x.arc((a+e)/2,b-34,9,0,Math.PI*2);x.fill();x.stroke();   // rotar
    x.fillStyle=col;x.font='13px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText('⟳',(a+e)/2,b-33);x.textAlign='start';x.textBaseline='alphabetic';
    sel.manijas={escalar:[e+6,h+6],rotar:[(a+e)/2,b-34],caja:[a-6,b-6,e+6,h+6],centro:[(c[0]+c[2])/2,(c[1]+c[3])/2],esquina:[c[0],c[1]]};
  }
  function pintarSelPlano(x,p){
    const [a,b]=aPantalla(p.x,p.y),[e,h]=aPantalla(p.x+p.w,p.y+p.h),col=css('--primary')||'#2563eb';
    x.setLineDash([6,4]);x.strokeStyle=col;x.lineWidth=1.5;x.strokeRect(a,b,e-a,h-b);x.setLineDash([]);
    const L=[['nw',a,b],['n',(a+e)/2,b],['ne',e,b],['e',e,(b+h)/2],['se',e,h],['s',(a+e)/2,h],['sw',a,h],['w',a,(b+h)/2]];
    if(!p.fijo)for(const [,X,Y] of L){x.fillStyle='#fff';x.strokeStyle=col;x.lineWidth=2;x.fillRect(X-7,Y-7,14,14);x.strokeRect(X-7,Y-7,14,14)}
    sel.manijas={plano:true,lados:p.fijo?[]:L,caja:[a,b,e,h],centro:[p.x+p.w/2,p.y+p.h/2],esquina:[p.x,p.y]};
  }
  // 📏 Regla: borde en (x, y) con ángulo; cuerpo hacia un lado, de 54 px en pantalla; marcas en cm
  function pintarRegla(x){
    const r=regla,[ax,ay]=aPantalla(r.x,r.y),L=r.largo*vista.z,T=54;
    x.save();x.translate(ax,ay);x.rotate(r.ang);x.fillStyle=oscuro?'rgba(80,90,110,.55)':'rgba(203,213,225,.6)';x.fillRect(0,0,L,T);
    x.strokeStyle=oscuro?'#cbd5e1':'#334155';x.lineWidth=1;x.strokeRect(0,0,L,T);
    x.fillStyle=x.strokeStyle;x.font='10px system-ui';x.textAlign='center';
    for(let i=0;i*CM*vista.z<=L+1;i++){const px=i*CM*vista.z;x.beginPath();x.moveTo(px,0);x.lineTo(px,12);x.stroke();if(CM*vista.z>14)x.fillText(String(i),px,24);
      if(CM*vista.z>40)for(let j=1;j<10;j++){const q=px+j*CM*vista.z/10;if(q>L)break;x.beginPath();x.moveTo(q,0);x.lineTo(q,j===5?8:5);x.stroke()}}
    x.beginPath();x.arc(L-14,T/2,9,0,Math.PI*2);x.stroke();x.fillText('⟳',L-14,T/2+3);x.restore();
  }
  function pintarTransp(x){
    const t=transp,[cx,cy]=aPantalla(t.x,t.y),R=t.r*vista.z;
    x.save();x.translate(cx,cy);x.rotate(t.ang);x.fillStyle=oscuro?'rgba(80,90,110,.5)':'rgba(203,213,225,.55)';
    x.beginPath();x.arc(0,0,R,Math.PI,0);x.closePath();x.fill();x.strokeStyle=oscuro?'#cbd5e1':'#334155';x.lineWidth=1;x.stroke();
    x.fillStyle=x.strokeStyle;x.font='10px system-ui';x.textAlign='center';
    for(let a=0;a<=180;a+=5){const r=a*Math.PI/180,l=a%30?a%10?5:9:14;x.beginPath();x.moveTo(-Math.cos(r)*R,-Math.sin(r)*R);x.lineTo(-Math.cos(r)*(R-l),-Math.sin(r)*(R-l));x.stroke();
      if(a%30===0&&R>70)x.fillText(String(a),-Math.cos(r)*(R-24),-Math.sin(r)*(R-24)+4)}
    x.beginPath();x.arc(0,0,3,0,Math.PI*2);x.fill();x.beginPath();x.arc(R-14,-12,9,0,Math.PI*2);x.stroke();x.fillText('⟳',R-14,-9);x.restore();
  }
  // Minimapa: dónde estás en el lienzo (solo mientras haces zoom o te mueves)
  let mapaTimer=0,mapaFoto=null,mapaVersion=-1,version=0;
  function verMapa(){if(!P.minimapa)return;mapa.hidden=false;clearTimeout(mapaTimer);mapaTimer=setTimeout(()=>{mapa.hidden=true},900);pintarMapa()}
  function pintarMapa(){
    const r=region(dd()),bw=r[2]-r[0],bh=Math.max(r[3]-r[1],vista.y+H/vista.z-r[1]),s=Math.min(110/bw,140/bh),mw=Math.max(40,Math.round(bw*s)),mh=Math.max(40,Math.round(bh*s));
    if(mapa.width!==mw*k||mapa.height!==mh*k){mapa.width=mw*k;mapa.height=mh*k;mapa.style.width=mw+'px';mapa.style.height=mh+'px';mapaVersion=-1}
    const x=mapa.getContext('2d');
    if(mapaVersion!==version||!mapaFoto){mapaFoto=document.createElement('canvas');mapaFoto.width=mapa.width;mapaFoto.height=mapa.height;const y=mapaFoto.getContext('2d');
      y.fillStyle=css('--surface')||'#fff';y.fillRect(0,0,mapaFoto.width,mapaFoto.height);
      pintarObjetos(y,objs.length>1500?objs.filter((_,i)=>i%3===0):objs,{vista:{x:r[0],y:r[1],z:s},ancho:mw,alto:mh,k,oscuro,capas:d.capas});mapaVersion=version}
    x.setTransform(1,0,0,1,0,0);x.drawImage(mapaFoto,0,0);x.setTransform(k,0,0,k,0,0);
    x.strokeStyle=css('--primary')||'#2563eb';x.lineWidth=2;x.strokeRect((vista.x-r[0])*s,(vista.y-r[1])*s,W/vista.z*s,H/vista.z*s);
  }

  /* ---------- historial ---------- */
  let autoTimer=0;
  function tocar(){version++;cambiado=true;pintarTodo();botones();clearTimeout(autoTimer);autoTimer=setTimeout(autoguardarYa,1500);estado('Sin guardar…')}
  function aplicar(nuevos){nuevos=anclar(objs,nuevos);const op=diferencia(objs,nuevos);if(!op)return false;objs=nuevos;hist.push(op);rehacerPila.length=0;tocar();return true}
  function deshacer(){const op=hist.pop();if(!op){aviso('No hay nada que deshacer.',1200);return false}objs=aplicarOp(objs,op,true);rehacerPila.push(op);if(sel)limpiarSel();tocar();return true}
  function rehacer(){const op=rehacerPila.pop();if(!op)return false;objs=aplicarOp(objs,op);hist.push(op);if(sel)limpiarSel();tocar();return true}
  const estadoActual=()=>({...d,objetos:objs,historial:hist,vista:{...vista},bloqueado,practica});
  function autoguardarYa(){clearTimeout(autoTimer);if(!autoguardar||cerrado)return;try{autoguardar(paraGuardar(estadoActual()));estado('Guardado ✓')}catch(e){}}
  const estado=t=>{const e=$('.dib-estado');if(e)e.textContent=t};
  const alOcultar=()=>{if(document.visibilityState==='hidden')autoguardarYa()};document.addEventListener('visibilitychange',alOcultar);

  /* ---------- barra ---------- */
  function botones(){
    $('[data-d="deshacer"]').disabled=!hist.length;$('[data-d="rehacer"]').disabled=!rehacerPila.length;
    const c=$('[data-d="bloquear"]');c.textContent=bloqueado?'🔒':'🔓';c.setAttribute('aria-pressed',String(bloqueado));c.setAttribute('aria-label',bloqueado?'Vista bloqueada: toca para desbloquear':'Bloquear la vista');c.title=c.getAttribute('aria-label');
    area.classList.toggle('bloqueada',bloqueado);area.classList.toggle('temporal',temporal);
    $('[data-d="mano"]').setAttribute('aria-pressed',String(mano));
    f.querySelectorAll('[data-herr]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.herr===herr||b.dataset.herr==='formas'&&herr==='dosdedos')));
    const bf=$('[data-herr="formas"]');bf.textContent=herr==='dosdedos'?'✌️':'📐';bf.setAttribute('aria-label',herr==='dosdedos'?'Dos dedos (toca para ver los modos)':'Formas');
    $('.dib-zoombtns').hidden=herr!=='dosdedos';$('.dib-dejar').hidden=!(herr==='dosdedos'&&medicion);
    $('.dib-barra').classList.toggle('contraida',!!P.contraida);const ct=$('[data-d="contraer"]');ct.textContent=P.contraida?'▴':'▾';ct.setAttribute('aria-label',P.contraida?'Mostrar toda la barra':'Contraer la barra');
    $('.dib-avanzar').hidden=!(bloqueado&&P.avanzar);
    $('.dib-favs').innerHTML=P.favoritas.map((x,i)=>`<button type="button" data-d="fav" data-fav="${i}" class="dib-fav" aria-label="Pluma favorita: ${esc(x.nombre)}" title="${esc(x.nombre)}"><span style="--c:${x.color};--g:${Math.min(12,Math.max(2,x.ancho*1.4))}px"></span></button>`).join('');
    area.style.cursor=mano||espacio?'grab':herr==='texto'?'text':'crosshair';
  }
  function bloquear(v){bloqueado=v;temporal=false;vibrar(v?[18]:[10,40,10]);botones();aviso(v?'🔒 Vista bloqueada: escribe sin que se mueva. Mantén 2 dedos para moverte.':'🔓 Vista desbloqueada',1600);autoguardarYa()}
  function elegir(h){
    if(h==='formas'&&herr==='dosdedos'){abrirPanel('dosdedos');return}
    if(h===herr&&h!=='papel'){abrirPanel(h);return}
    medicion=null;modoPlano=null;herr=h;cerrarPanel();if(sel&&!['lazo'].includes(h))limpiarSel();botones();
    if(h==='formas')aviso(`📐 ${FORMAS.find(x=>x[0]===P.forma)?.[2]||'Línea'}: arrastra para dibujarla. Toca 📐 otra vez para elegir otra.`,2200);
    if(h==='dosdedos'){abrirPanel('dosdedos');
      if(!P.dos.visto){P.dos.visto=true;guardarPrefs(P);aviso('✌️ Con esta herramienta los dos dedos dibujan. Para el zoom usa + y −, o elige otra herramienta.',4200)}}
  }

  /* ---------- opciones de cada herramienta (panel sobre la barra) ---------- */
  const colores=(lista,actual,attr='data-color')=>`<div class="dib-colores" role="group" aria-label="Color">${lista.map(([n,c])=>`<button type="button" class="dib-color" ${attr}="${c}" aria-label="${esc(n)}" aria-pressed="${c===actual}" style="--c:${c}"></button>`).join('')}<label class="dib-color dib-color-propio" aria-label="Otro color"><input type="color" value="${/^#[0-9a-f]{6}$/i.test(actual)?actual:'#1f2430'}" data-propio></label></div>`;
  const grosores=(h,actual)=>`<div class="dib-grosores" role="group" aria-label="Grosor">${GROSORES[h].map(v=>`<button type="button" data-grosor="${v}" aria-pressed="${Math.abs(v-actual)<.01}" aria-label="Grosor ${v}"><span style="--g:${Math.min(h==='resaltador'?28:14,Math.max(2,v*(h==='resaltador'?.6:1.6)))}px"></span></button>`).join('')}</div>
<label class="dib-rango">Grosor <input type="range" min="${h==='resaltador'?6:.6}" max="${h==='resaltador'?60:16}" step=".2" value="${actual}" data-rango></label>`;
  function htmlPanel(h){
    if(h==='pluma'){const p=P.pluma;return `<div class="segmentos" role="group" aria-label="Tipo de pluma">${TIPOS.map(([t,i,n])=>`<button type="button" data-tipo="${t}" aria-pressed="${p.tipo===t}">${i} ${n}</button>`).join('')}</div>${grosores('pluma',p.ancho)}
${colores(PALETA.slice(0,7).concat(P.recientes.filter(c=>!PALETA.some(x=>x[1]===c)).map(c=>['Reciente',c])),p.color)}
<button type="button" class="btn ghost btn-chico" data-d="fav-guardar">★ Guardar como favorita</button>${P.favoritas.length?`<button type="button" class="btn ghost btn-chico" data-d="fav-quitar">Quitar favoritas</button>`:''}`}
    if(h==='resaltador'){const p=P.resaltador;return `${grosores('resaltador',p.ancho)}${colores([...PALETA.slice(7),...PALETA.slice(1,4)],p.color)}
<label class="dib-check"><input type="checkbox" data-recta ${p.recta?'checked':''}> Línea recta (o mantén al final del trazo)</label>`}
    if(h==='borrador'){const p=P.borrador;return `<div class="segmentos" role="group" aria-label="Tipo de borrador"><button type="button" data-goma="trazo" aria-pressed="${p.modo==='trazo'}">Trazo completo</button><button type="button" data-goma="precision" aria-pressed="${p.modo==='precision'}">Precisión</button></div>
<label class="dib-rango">Tamaño <input type="range" min="8" max="80" step="2" value="${p.tam}" data-goma-tam></label>
<label class="dib-check"><input type="checkbox" data-solo-res ${p.soloRes?'checked':''}> Borrar solo el resaltador</label>
<button type="button" class="btn ghost btn-chico peligro-texto" data-d="borrar-todo">🗑️ Borrar todo</button>`}
    if(h==='lazo')return `<p class="nota">Rodea lo que quieres mover, escalar, rotar o cambiar. Un toque largo sobre un trazo lo selecciona directo.</p>${portapapeles.length?`<button type="button" class="btn ghost btn-chico" data-d="pegar">📥 Pegar</button>`:''}`;
    if(h==='formas')return `<label class="dib-check"><input type="checkbox" data-inteligentes ${P.inteligentes?'checked':''}> Formas inteligentes: mantén quieto al final del trazo</label>
<div class="dib-formas" role="group" aria-label="Forma">${FORMAS.map(([id,i,n])=>`<button type="button" data-forma="${id}" aria-pressed="${P.forma===id}" aria-label="${n}" title="${n}"><span aria-hidden="true">${i}</span><small>${n}</small></button>`).join('')}</div>
<div class="row dib-tabla"><label>Filas <input type="number" min="1" max="20" value="${P.filas}" data-filas></label><label>Columnas <input type="number" min="1" max="12" value="${P.cols}" data-cols></label></div>
<button type="button" class="btn ghost btn-chico" data-d="dos">✌️ Dos dedos: regla, compás, medir, marco y barrido</button>
<div class="row"><button type="button" class="btn ghost btn-chico" data-d="regla" aria-pressed="${!!regla}">📏 Regla</button><button type="button" class="btn ghost btn-chico" data-d="transp" aria-pressed="${!!transp}">◠ Transportador</button></div>`;
    if(h==='dosdedos')return htmlDos();
    if(h==='plano')return htmlPlanoPanel();
    if(h==='fondoPlano')return htmlFondoPlano();
    if(h==='texto'){const p=P.texto;return `<div class="segmentos" role="group" aria-label="Tamaño de letra">${[14,20,28,40].map(t=>`<button type="button" data-tam="${t}" aria-pressed="${p.tam===t}">${t}</button>`).join('')}</div>${colores(PALETA.slice(0,7),p.color)}
<div class="row"><button type="button" class="btn ghost btn-chico" data-d="formula">Σ Fórmula</button><span class="nota">Toca el lienzo para escribir.</span></div>`}
    return '';
  }
  function abrirPanel(h){const p=$('.dib-opc');if(panel===h){cerrarPanel();return}panel=h;p.innerHTML=`<div class="dib-opc-cab"><b>${h==='dosdedos'?'✌️ Dos dedos':h==='plano'?'⚙️ Plano cartesiano':h==='fondoPlano'?'⊹ Plano de fondo':HERR.find(x=>x[0]===h)?.[2]||''}</b><button type="button" class="btn-icono" data-d="opc-cerrar" aria-label="Cerrar las opciones">✕</button></div>${htmlPanel(h)}`;p.hidden=false;marcaSiHace()}
  function cerrarPanel(marcar=true){if(!panel)return;panel=null;ajustePlano=null;$('.dib-opc').hidden=true;if(marcar)marcaSiHace()}
  const repintarPanel=()=>{if(panel){const h=panel;panel=null;abrirPanel(h)}};
  function usarColor(c){
    if(sel)return cambiarSel(o=>o.t==='trazo'||o.t==='texto'||o.t==='formula'?{...o,color:c}:o);
    const h=panel==='resaltador'||herr==='resaltador'&&panel!=='pluma'?'resaltador':panel==='texto'||herr==='texto'?'texto':'pluma';
    P[h].color=c;if(h==='pluma'&&!PALETA.some(x=>x[1]===c)){P.recientes=[c,...P.recientes.filter(x=>x!==c)].slice(0,5)}
    if(herr!==h&&h!=='texto'&&herr!=='dosdedos')herr=h;guardarPrefs(P);botones();repintarPanel();
  }

  /* ---------- selección ---------- */
  function seleccionar(ids){if(!ids.size){limpiarSel();return}sel={ids};pintarVivo();barraSel();marcaSiHace()}
  function limpiarSel(marcar=true){if(!sel)return;sel=null;$('.dib-selbar').hidden=true;pintarVivo();if(marcar)marcaSiHace()}
  const elegidos=()=>sel?objs.filter(o=>sel.ids.has(o.id)):[];
  function barraSel(){
    const os=elegidos(),b=$('.dib-selbar'),uno=os.length===1?os[0]:null,img=uno?.t==='imagen',pl=planoSel();
    if(pl){b.innerHTML=[['plano-ajustes','⚙️','Ajustes del plano'],['plano-agregar','➕','Agregar al plano'],['plano-fijar',pl.fijo?'🔒':'🔓',pl.fijo?'Soltar el plano (se puede mover)':'Fijar el plano'],['sel-dup','⧉','Duplicar'],['sel-borrar','🗑️','Borrar']]
      .map(([d2,i,n])=>`<button type="button" data-d="${d2}" aria-label="${n}" title="${n}">${i}</button>`).join('');b.hidden=false;return}
    b.innerHTML=[['sel-color','🎨','Color'],['sel-grosor','≡','Grosor'],['sel-dup','⧉','Duplicar'],['sel-copiar','📋','Copiar'],
      ...(uno&&(uno.t==='texto'||uno.t==='formula')?[['sel-editar','✏️','Editar']]:[]),...(img?[['sel-fijar',uno.fija?'📌':'📍',uno.fija?'Soltar la imagen':'Fijar la imagen'],['sel-recortar','✂️','Recortar']]:[]),
      ...(os.some(o=>o.t==='trazo')?[['sel-ia','✨','Pasar a texto o fórmula (IA)']]:[]),...(os.some(o=>o.ancla)&&!os.some(o=>o.t==='plano')?[['sel-soltar','⇱','Soltar del plano']]:[]),['sel-borrar','🗑️','Borrar']]
      .map(([d2,i,n])=>`<button type="button" data-d="${d2}" aria-label="${n}" title="${n}">${i}</button>`).join('');
    b.hidden=false;
  }
  function cambiarSel(fn){
    const ids=new Set();const nuevos=objs.map(o=>{if(!sel.ids.has(o.id))return o;const n=fn(o);if(n===o){ids.add(o.id);return o}const r={...n,id:nuevoIdObj()};ids.add(r.id);return r});
    aplicar(nuevos);sel={ids};pintarVivo();barraSel();
  }
  function transformarSel(m){const ids=new Set();const nuevos=objs.map(o=>{if(!sel.ids.has(o.id))return o;const r=transformar(o,m);ids.add(r.id);return r});aplicar(nuevos);sel={ids};barraSel()}
  function borrarSel(){const n=elegidos().length;aplicar(objs.filter(o=>!sel.ids.has(o.id)));limpiarSel();avisoAccion(`🗑️ ${n===1?'Borrado':`${n} borrados`}`,'Deshacer',()=>deshacer(),6000)}
  function copiarSel(){portapapeles=elegidos().map(o=>JSON.parse(JSON.stringify(o)));aviso('📋 Copiado',1200)}
  function pegar(dx=24,dy=24,lista=portapapeles){
    if(!lista.length)return;const c=cajaDe(lista),gs=new Map(),centro=aMundo(W/2,H/2);
    const m=sel||!c?mMover(dx,dy):mMover(centro[0]-(c[0]+c[2])/2,centro[1]-(c[1]+c[3])/2);
    const nuevos=lista.map(o=>{const r=transformar(o,m);if(o.g){if(!gs.has(o.g))gs.set(o.g,nuevoIdObj());r.g=gs.get(o.g)}if(r.t==='plano')r.pid='p'+nuevoIdObj();return r});
    aplicar([...objs,...nuevos]);seleccionar(new Set(nuevos.map(o=>o.id)));
  }

  /* ---------- punteros ---------- */
  const posDe=e=>{const r=area.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  const presion=e=>e.pointerType==='pen'||e.pressure>0&&e.pressure!==.5?e.pressure||.5:.5;
  const esGomaLapiz=e=>e.pointerType==='pen'&&(e.button===5||(e.buttons&32)||(e.buttons&2));
  const dedoMueve=()=>mano||lapizVisto&&P.soloLapiz;
  const centro=()=>{let x=0,y=0;for(const t of toques.values()){x+=t.x;y+=t.y}return [x/toques.size,y/toques.size]};
  const separacion=()=>{const [a,b]=[...toques.values()];return Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
  const movidos=()=>[...toques.values()].some(t=>Math.hypot(t.x-t.x0,t.y-t.y0)>12);
  function abajo(e){
    if(e.target!==cV)return;
    if(editando){terminarTexto();if(e.pointerType!=='pen')return}
    if(panel)cerrarPanel();
    e.preventDefault();try{cV.setPointerCapture(e.pointerId)}catch(x){}
    const [sx,sy]=posDe(e);
    // ✌️ Dos dedos: cualquier puntero (dedo, lápiz o ratón) marca un punto; nada de zoom ni deshacer con dos dedos
    if(herr==='dosdedos'&&!(e.pointerType==='mouse'&&(e.button!==0||espacio))&&(!g||g.dos)){if(e.pointerType==='pen')lapizVisto=true;dosAbajo(e,sx,sy);return}
    if(moverOrigen&&(e.pointerType!=='touch'||toques.size===0)){g={id:e.pointerId,origen:true};fondoPlano({ox:Math.round(aMundo(sx,sy)[0]),oy:Math.round(aMundo(sx,sy)[1])});return}
    if(e.pointerType==='pen'){lapizVisto=true;lapizActivo=true;if(g&&g.dedos){cancelarGesto()}}
    if(e.pointerType==='touch'){
      if(lapizActivo)return;   // la palma mientras escribes con el lápiz
      toques.set(e.pointerId,{x:sx,y:sy,x0:sx,y0:sy});const n=toques.size;
      if(n===1&&mano){const pl=planoEn(objs,...aMundo(sx,sy));if(pl?.moverVista&&!pl.fijo){g={dedos:true,tipo:'planoVista',id:e.pointerId,pl,ini:[sx,sy]};return}}
      if(n===1){if(dedoMueve()){g={dedos:true,tipo:'mover',id:e.pointerId,ultimo:[sx,sy],gesto:true};fotoGesto();return}herrAbajo(e,sx,sy);if(g)g.dedos=true;return}
      if(n===2){cancelarHerr();iniciarDos();return}
      if(n===3){cancelarGesto();g={dedos:true,tipo:'tres',t0:performance.now()};return}
      return;
    }
    if(e.pointerType==='mouse'&&(e.button===1||espacio)){g={tipo:'mover',id:e.pointerId,ultimo:[sx,sy],gesto:true};fotoGesto();return}
    if(e.pointerType==='mouse'&&e.button!==0)return;
    herrAbajo(e,sx,sy);
  }
  function iniciarDos(){
    const c=centro(),enRegla=regla&&cercaRegla(...aMundo(...c))||transp&&cercaTransp(...aMundo(...c));
    g={dedos:true,tipo:'dos',t0:performance.now(),c0:c,d0:separacion(),a0:anguloDedos(),v0:{...vista},guia:enRegla?(regla&&cercaRegla(...aMundo(...c))?'regla':'transp'):null,gesto:!bloqueado&&!enRegla};
    if(g.guia)g.guia0={...(g.guia==='regla'?regla:transp)};
    if(mano&&!g.guia){const [a,b]=[...toques.values()],pa=planoEn(objs,...aMundo(a.x,a.y)),pb=planoEn(objs,...aMundo(b.x,b.y));
      if(pa&&pa===pb&&pa.moverVista&&!pa.fijo){g.gesto=false;g.planoZoom=pa}}
    if(g.gesto)fotoGesto();
    if(bloqueado&&!g.guia)g.timer=setTimeout(()=>{if(g?.tipo==='dos'&&!movidos()){temporal=true;g.temporal=true;g.gesto=true;g.c0=centro();g.d0=separacion();g.v0={...vista};fotoGesto();vibrar([12]);botones()}},500);
  }
  const anguloDedos=()=>{const [a,b]=[...toques.values()];return Math.atan2(b.y-a.y,b.x-a.x)};
  function mover(e){
    const [sx,sy]=posDe(e);
    if(g?.dos){dosMover(e,sx,sy);return}
    if(e.pointerType==='touch'&&toques.has(e.pointerId)){const t=toques.get(e.pointerId);t.x=sx;t.y=sy;
      if(g?.tipo==='dos'){e.preventDefault();moverDos();return}
      if(g?.tipo==='tres'||g?.tipo==='fin')return;
    }
    if(e.pointerType==='touch'&&lapizActivo)return;
    if(!g||g.id!==e.pointerId)return;
    e.preventDefault();
    if(g.origen){fondoPlano({ox:Math.round(aMundo(sx,sy)[0]),oy:Math.round(aMundo(sx,sy)[1])});return}
    if(g.tipo==='planoVista'){const p=g.pl,du=-(sx-g.ini[0])/vista.z/kx(p),dv=(sy-g.ini[1])/vista.z/ky(p);
      g.n={...p,id:'vista',xMin:p.xMin+du,xMax:p.xMax+du,yMin:p.yMin+dv,yMax:p.yMax+dv};g.vista=conPlano(objs.filter(o=>o===p||o.ancla===p.pid),p,g.n);g.ocultar=new Set(objs.filter(o=>o===p||o.ancla===p.pid).map(o=>o.id));pintarTodo();return}
    if(g.tipo==='mover'){if(bloqueado&&!temporal)return;const dx=sx-g.ultimo[0],dy=sy-g.ultimo[1];g.ultimo=[sx,sy];vista=limitar({...vista,x:vista.x-dx/vista.z,y:vista.y-dy/vista.z});pintarTodo();verMapa();return}
    herrMover(e,sx,sy);
  }
  function moverDos(){
    const c=centro();
    if(!g.movido&&movidos()){g.movido=true;if(!g.temporal)clearTimeout(g.timer)}
    if(g.guia){const gu=g.guia==='regla'?regla:transp,[a,b]=aMundo(...g.c0),[a2,b2]=aMundo(...c),da=anguloDedos()-g.a0;
      Object.assign(gu,{x:g.guia0.x+(a2-a),y:g.guia0.y+(b2-b),ang:g.guia0.ang+da});pintarVivo();return}
    if(g.planoZoom){const p=g.planoZoom,s=Math.max(.05,separacion()/g.d0),[u,v]=aPlanoDe(p,aMundo(...g.c0));
      g.n={...p,id:'vista',xMin:u+(p.xMin-u)/s,xMax:u+(p.xMax-u)/s,yMin:v+(p.yMin-v)/s,yMax:v+(p.yMax-v)/s};
      g.vista=conPlano(objs.filter(o=>o===p||o.ancla===p.pid),p,g.n);g.ocultar=new Set(objs.filter(o=>o===p||o.ancla===p.pid).map(o=>o.id));pintarTodo();return}
    if(!g.gesto)return;
    const z=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,g.v0.z*separacion()/g.d0)),wx=g.v0.x+g.c0[0]/g.v0.z,wy=g.v0.y+g.c0[1]/g.v0.z;
    vista=limitar({z,x:wx-c[0]/z,y:wy-c[1]/z});pintarTodo();mostrarZoom();verMapa();
  }
  function arriba(e){
    if(e.pointerType==='pen')lapizActivo=false;
    if(g?.dos){dosArriba(e);return}
    if(e.pointerType==='touch'&&toques.has(e.pointerId)){
      toques.delete(e.pointerId);
      if(g?.tipo==='dos'){
        if(toques.size)return;   // queda un dedo: espera a que se suelten todos
        clearTimeout(g.timer);const toque=!g.temporal&&!g.movido&&performance.now()-g.t0<320;
        if(g.temporal){temporal=false;vibrar([10]);botones()}
        const eraGesto=g.gesto,pz=g.planoZoom&&g.n?[g.planoZoom,g.n]:null;g=null;if(eraGesto){foto=null;pintarTodo()}
        if(pz){const {xMin,xMax,yMin,yMax}=pz[1];cambiarPlano(pz[0],{xMin,xMax,yMin,yMax,igual:false},{fusionar:false});return}
        if(toque)tocarDos();return;
      }
      if(g?.tipo==='tres'){if(!toques.size){const ok=performance.now()-g.t0<400;g=null;ultimoTap=null;if(ok){rehacer()&&aviso('↷ Rehecho',900)}}return}
      if(g?.tipo==='fin'){if(!toques.size)g=null;return}
    }
    if(!g||g.id!==e.pointerId)return;
    if(g.tipo==='mover'){g=null;foto=null;pintarTodo();return}
    if(g.origen){g=null;moverOrigen=false;autoguardarYa();aviso('📍 Origen en su lugar',1000);return}
    if(g.tipo==='planoVista'){const x=g;g=null;if(x.n){const {xMin,xMax,yMin,yMax}=x.n;cambiarPlano(x.pl,{xMin,xMax,yMin,yMax},{fusionar:false})}else pintarTodo();return}
    herrArriba(e);
  }
  // Toque con 2 dedos: deshacer; doble toque: ajustar a la pantalla o volver al 100 % (y se devuelve lo deshecho)
  function tocarDos(){
    const ahora=performance.now();
    if(ultimoTap&&ahora-ultimoTap.t<420){if(ultimoTap.deshizo)rehacer();ultimoTap=null;if(bloqueado){aviso('🔒 La vista está bloqueada.',1200);return}
      const zf=Math.abs(vista.z-1)<.02;ajustar(zf?'pantalla':'100');aviso(zf?'Toda la hoja en la pantalla':'100 %',900);return}
    ultimoTap={t:ahora,deshizo:deshacer()};if(ultimoTap.deshizo)aviso('↶ Deshecho',900);
  }
  function cancelarGesto(){clearTimeout(g?.timer);g=null;foto=null;pintarTodo()}
  function cancelarHerr(){
    if(!g)return;clearTimeout(g.quieto);clearTimeout(g.largo);
    if(g.antes&&g.antes!==objs)objs=g.antes;   // la goma que empezó el primer dedo
    g=null;pintarTodo();
  }

  /* ---------- herramientas ---------- */
  function herrAbajo(e,sx,sy){
    const [wx,wy]=aMundo(sx,sy),r=10/vista.z;
    // selección: manijas, mover o salir
    if(sel&&sel.manijas?.plano){const mm=sel.manijas,pl=planoSel();
      const lado=mm.lados.find(([,X,Y])=>Math.hypot(sx-X,sy-Y)<24);
      if(pl&&lado){g={id:e.pointerId,sel:'lado',lado:lado[0],p0:pl,ini:[wx,wy],ocultar:sel.ids};pintarTodo();return}
      if(pl&&sx>=mm.caja[0]-6&&sx<=mm.caja[2]+6&&sy>=mm.caja[1]-6&&sy<=mm.caja[3]+6){
        g=pl.fijo?{id:e.pointerId,sel:'toque',plano:pl,iniPx:[sx,sy]}:{id:e.pointerId,sel:'mover',ini:[wx,wy],m:null,ocultar:sel.ids,plano:pl,iniPx:[sx,sy]};pintarTodo();return}
    }
    if(herr==='plano'&&modoPlano){const pl=planoDe(modoPlano.pid);
      if(!pl){modoPlano=null;herr='pluma';botones()}
      else{if(!dentroPlano(pl,wx,wy)){aviso('Toca dentro del plano (o elige ✏️ para escribir).',1400);return}
        const ex=objetoPlanoEn(pl,wx,wy,14/vista.z),q=enPaso(pl,wx,wy);
        if(ex?.k==='punto'){g={id:e.pointerId,planoMover:ex,pl,iniPx:[sx,sy]};return}
        g={id:e.pointerId,planoNuevo:modoPlano.k,pl,a:q,b:q};g.vista=[{...pl,id:'vista',objetos:[...pl.objetos,objetoNuevo(g.planoNuevo,q,q,pl)]}];g.ocultar=new Set([pl.id]);pintarTodo();return}}
    if(sel){const mm=sel.manijas;
      if(mm&&Math.hypot(sx-mm.rotar[0],sy-mm.rotar[1])<24){g={id:e.pointerId,sel:'rotar',ini:[wx,wy],m:null,ocultar:sel.ids};pintarTodo();return}
      if(mm&&Math.hypot(sx-mm.escalar[0],sy-mm.escalar[1])<24){g={id:e.pointerId,sel:'escalar',ini:[wx,wy],m:null,ocultar:sel.ids};pintarTodo();return}
      if(mm&&sx>=mm.caja[0]&&sx<=mm.caja[2]&&sy>=mm.caja[1]&&sy<=mm.caja[3]){g={id:e.pointerId,sel:'mover',ini:[wx,wy],m:null,ocultar:sel.ids};pintarTodo();return}
      limpiarSel();if(herr==='lazo'){g={id:e.pointerId,lazo:[[wx,wy]],ini:[sx,sy]};return}
    }
    // regla y transportador: arrastrar el cuerpo los mueve
    if(regla&&enCuerpoRegla(wx,wy)){g={id:e.pointerId,guia:'regla',ini:[wx,wy],g0:{...regla},rotar:Math.hypot(...[sx,sy].map((v,i)=>v-puntaRegla()[i]))<22,desfase:Math.atan2(wy-regla.y,wx-regla.x)-regla.ang};return}
    if(transp&&enCuerpoTransp(wx,wy)){g={id:e.pointerId,guia:'transp',ini:[wx,wy],g0:{...transp},rotar:Math.hypot(...[sx,sy].map((v,i)=>v-puntaTransp()[i]))<22,desfase:Math.atan2(wy-transp.y,wx-transp.x)-transp.ang};return}
    if(practica){const p=objetoEn(objs,wx,wy,0,o=>o.t==='papel');if(p){revelados.has(p.id)?revelados.delete(p.id):revelados.add(p.id);pintarTodo();return}}
    const h=esGomaLapiz(e)?'borrador':herr;
    if(h==='pluma'||h==='resaltador'){
      const p=P[h],vari=h==='pluma'&&p.tipo==='fuente';
      const t={t:'trazo',id:nuevoIdObj(),herr:h,tipo:h==='pluma'?p.tipo:'boli',color:p.color,ancho:p.ancho,...(vari?{vari:true}:{}),pts:[[wx,wy,e.pointerType==='pen'?presion(e):.6]]};
      g={id:e.pointerId,trazo:t,pen:e.pointerType==='pen',ultimoPx:[sx,sy],inicioPx:[sx,sy],largoPx:0,pv:.6};
      if(regla&&cercaRegla(wx,wy))g.enRegla=true;
      if(transp&&Math.hypot(wx-transp.x,wy-transp.y)<22/vista.z)g.enTransp=true;
      // toque largo sin moverse sobre algo: lo selecciona
      g.largo=setTimeout(()=>{if(!g?.trazo||g.largoPx>6)return;const o=objetoEn(objs,wx,wy,r,o=>o.t!=='papel'&&o.t!=='plano'&&visible(o))||objetoEn(objs,wx,wy,r,o=>o.t==='plano'&&visible(o));
        if(o){const id=g.id;g=null;pintarVivo();vibrar([15]);seleccionar(conGrupos(objs,new Set([o.id])));g={id,tipo:'fin2'}}},520);
      pintarVivo();return;
    }
    if(h==='borrador'){const p=P.borrador,rad=(p.modo==='trazo'?Math.max(10,p.tam*.5):p.tam/2);g={id:e.pointerId,goma:[sx,sy],radioPx:rad,antes:objs,ult:[wx,wy],modo:p.modo};borrarEn(wx,wy);return}
    if(h==='lazo'){g={id:e.pointerId,lazo:[[wx,wy]],ini:[sx,sy]};
      g.largo=setTimeout(()=>{if(!g?.lazo||g.lazo.length>3)return;const o2=objetoEn(objs,wx,wy,r,o=>o.t!=='papel');if(o2){g=null;vibrar([15]);seleccionar(conGrupos(objs,new Set([o2.id])))}},520);return}
    if(h==='formas'||h==='papel'){g={id:e.pointerId,forma:h==='papel'?'papel':P.forma,a:[wx,wy],b:[wx,wy]};return}
    if(h==='texto'){g={id:e.pointerId,texto:[wx,wy],ini:[sx,sy]};return}
  }
  function herrMover(e,sx,sy){
    const [wx,wy]=aMundo(sx,sy);
    if(g.planoMover||g.planoNuevo){const pl=g.pl,q=enPaso(pl,wx,wy);
      if(g.planoMover){g.movido=g.movido||Math.hypot(sx-g.iniPx[0],sy-g.iniPx[1])>4;g.nuevo={...g.planoMover,x:q[0],y:q[1]};g.vista=[{...pl,id:'vista',objetos:pl.objetos.map(o=>o.id===g.nuevo.id?g.nuevo:o)}];g.medida=nombrePunto(g.nuevo);g.medidaEn=[sx,sy]}
      else{g.b=q;g.vista=[{...pl,id:'vista',objetos:[...pl.objetos,objetoNuevo(g.planoNuevo,g.a,g.b,pl)]}];if(g.planoNuevo==='punto'){g.a=q;g.vista=[{...pl,id:'vista',objetos:[...pl.objetos,objetoNuevo('punto',q,q,pl)]}]}}
      g.ocultar=new Set([pl.id]);pintarTodo();return}
    if(g.sel==='lado'){const p=g.p0,dx=wx-g.ini[0],dy=wy-g.ini[1],mn=60/vista.z;let x0=p.x,y0=p.y,x1=p.x+p.w,y1=p.y+p.h;
      if(g.lado.includes('w'))x0=Math.min(x1-mn,x0+dx);if(g.lado.includes('e'))x1=Math.max(x0+mn,x1+dx);if(g.lado.includes('n'))y0=Math.min(y1-mn,y0+dy);if(g.lado.includes('s'))y1=Math.max(y0+mn,y1+dy);
      g.nuevo=igualar({...p,id:'vista',x:x0,y:y0,w:x1-x0,h:y1-y0});g.vista=conPlano(objs.filter(o=>sel.ids.has(o.id)),p,g.nuevo);
      g.medida=`${numeroP(g.nuevo.xMin)} ≤ x ≤ ${numeroP(g.nuevo.xMax)}`;g.medidaEn=[sx,sy];pintarTodo();return}
    if(g.sel){const [x0,y0]=g.ini;
      if(g.sel==='mover')g.m=mMover(wx-x0,wy-y0);
      else{const mm=sel.manijas,c=mm.centro;
        if(g.sel==='rotar')g.m=mRotar(Math.atan2(wy-c[1],wx-c[0])-Math.atan2(y0-c[1],x0-c[0]),c[0],c[1]);
        else{const e0=mm.esquina,s=Math.max(.05,Math.hypot(wx-e0[0],wy-e0[1])/Math.max(1,Math.hypot(x0-e0[0],y0-e0[1])));g.m=mEscalar(s,e0[0],e0[1])}}
      g.vista=objs.filter(o=>sel.ids.has(o.id)).map(o=>transformar(o,g.m,{mismoId:true}));pintarVivo();return}
    if(g.guia){const gu=g.guia==='regla'?regla:transp;
      if(g.rotar)gu.ang=Math.atan2(wy-gu.y,wx-gu.x)-g.desfase;
      else{gu.x=g.g0.x+wx-g.ini[0];gu.y=g.g0.y+wy-g.ini[1]}pintarVivo();return}
    if(g.trazo){
      const evs=e.getCoalescedEvents?.()||[],r=area.getBoundingClientRect(),t=g.trazo;clearTimeout(g.quieto);
      for(const x of evs.length?evs:[e]){
        const px=x.clientX-r.left,py=x.clientY-r.top,dPx=Math.hypot(px-g.ultimoPx[0],py-g.ultimoPx[1]);g.largoPx+=dPx;g.ultimoPx=[px,py];
        let p=.6;if(g.pen)p=presion(x);else if(t.vari){p=Math.max(.15,Math.min(.95,1-dPx/26));p=g.pv=g.pv*.65+p*.35}
        const w=aMundo(px,py);
        if(g.forma)continue;
        if(g.enRegla)t.pts=[proyRegla(...t.pts[0]),[...proyRegla(w[0],w[1]),p]].map(q=>[q[0],q[1],.6]);
        else if(t.herr==='resaltador'&&P.resaltador.recta)t.pts=[t.pts[0],[w[0],w[1],p]];
        else t.pts.push([w[0],w[1],p]);
      }
      if(g.enRegla){t.recto=true;medidaDe(t.pts[0],t.pts[1],sx,sy)}
      else if(g.enTransp){const a=t.pts[0],b=t.pts[t.pts.length-1],ang=((Math.atan2(-(b[1]-a[1]),b[0]-a[0])+transp.ang)*180/Math.PI+360)%360;g.medida=`${Math.round(ang)}°`;g.medidaEn=[sx,sy]}
      const pr=e.getPredictedEvents?.()||[];g.pred=!g.forma&&!g.enRegla&&pr.length&&!(t.herr==='resaltador'&&P.resaltador.recta)?[...aMundo(pr[pr.length-1].clientX-r.left,pr[pr.length-1].clientY-r.top),t.pts[t.pts.length-1][2]]:null;
      // mantener quieto al final: forma inteligente (o recta, con el resaltador)
      if(!g.forma&&!g.enRegla&&g.largoPx>24)g.quieto=setTimeout(()=>{if(!g?.trazo)return;const tr=g.trazo;
        const fm=tr.herr==='resaltador'?{forma:'linea',pts:[tr.pts[0],tr.pts[tr.pts.length-1]]}:P.inteligentes?reconocerForma(tr.pts):null;
        if(fm){tr.pts=fm.pts;tr.recto=true;tr.forma=fm.forma;delete tr.vari;g.forma=true;g.pred=null;vibrar([12]);pintarVivo();aviso(`📐 ${({linea:'Línea',flecha:'Flecha',circulo:'Círculo',elipse:'Elipse',rectangulo:'Rectángulo',triangulo:'Triángulo',poligono:'Polígono'})[fm.forma]}`,900)}},480);
      pintarVivo();return;
    }
    if(g.goma){g.goma=[sx,sy];borrarEn(wx,wy);return}
    if(g.lazo){g.lazo.push([wx,wy]);pintarVivo();return}
    if(g.forma){g.b=[wx,wy];const fx=g.forma==='papel'?[]:formaDirecta(g.forma,g.a,g.b,{color:P.pluma.color,ancho:Math.max(1.5,P.pluma.ancho),filas:P.filas,cols:P.cols});
      g.vista=fx;g.rect=g.forma==='papel'?[...g.a,...g.b]:null;medidaDe(g.a,g.b,sx,sy,['linea','flecha','flecha2','vector','recta'].includes(g.forma)?'linea':'caja');pintarVivo()}
  }
  function medidaDe(a,b,sx,sy,tipo='linea'){
    const dx=b[0]-a[0],dy=b[1]-a[1];
    g.medida=tipo==='linea'?`${(Math.hypot(dx,dy)/CM).toFixed(1)} cm · ${Math.round((Math.atan2(-dy,dx)*180/Math.PI+360)%360)}°`:`${(Math.abs(dx)/CM).toFixed(1)} × ${(Math.abs(dy)/CM).toFixed(1)} cm`;
    g.medidaEn=[sx,sy];
  }
  function herrArriba(){
    const x=g;g=null;ultimoTap=null;clearTimeout(x.quieto);clearTimeout(x.largo);
    if(x.planoMover){if(x.movido&&x.nuevo){const pl=planoDe(x.pl.pid);if(pl)cambiarPlano(pl,{objetos:pl.objetos.map(o=>o.id===x.nuevo.id?x.nuevo:o)},{fusionar:false})}else{pintarTodo();menuObjetoPlano(x.pl,x.planoMover)}return}
    if(x.planoNuevo){const pl=planoDe(x.pl.pid);pintarTodo();if(!pl)return;
      if(x.planoNuevo!=='punto'&&Math.hypot(x.b[0]-x.a[0],x.b[1]-x.a[1])<1e-9){aviso(x.planoNuevo==='circulo'?'Arrastra del centro hacia afuera.':'Arrastra del primer punto al segundo.',1400);return}
      const o={...objetoNuevo(x.planoNuevo,x.a,x.b,pl),id:nuevoIdObj()};cambiarPlano(pl,{objetos:[...pl.objetos,o]},{fusionar:false});return}
    if(x.sel==='lado'){if(x.nuevo){const {x:a,y:b,w,h}=x.nuevo;cambiarPlano(x.p0,{x:a,y:b,w,h},{fusionar:false})}pintarTodo();return}
    if(x.sel==='toque'||x.sel==='mover'&&!x.m&&x.plano){pintarTodo();tocarEnPlano(x.plano,...x.iniPx);return}
    if(x.sel){if(x.m)transformarSel(x.m);pintarTodo();return}
    if(x.guia){pintarVivo();return}
    if(x.trazo){
      const t=x.trazo;
      if(!x.pen&&x.largoPx<6&&!x.forma){const pl=planoEn(objs,t.pts[0][0],t.pts[0][1]);
        if(pl&&visible(pl)){seleccionar(conGrupos(objs,new Set([pl.id])));toquePlano={t:performance.now(),sx:x.inicioPx[0],sy:x.inicioPx[1]};pintarVivo();return}}
      if(!t.recto)t.pts=simplificar(t.pts,Math.min(.5,.35/vista.z));
      if(t.vari&&!x.pen&&t.pts.length<3)t.pts=t.pts.map(p=>[p[0],p[1],.6]);
      aplicar([...objs,t]);pintarVivo();return;
    }
    if(x.goma){const op=diferencia(x.antes,objs);if(op){const fin=objs;objs=x.antes;aplicar(fin)}pintarVivo();return}
    if(x.lazo){
      const c=cajaPuntos(x.lazo);
      if((c[2]-c[0])*vista.z<8&&(c[3]-c[1])*vista.z<8){const o=objetoEn(objs,x.lazo[0][0],x.lazo[0][1],10/vista.z,o=>o.t!=='papel'&&visible(o));if(o)seleccionar(conGrupos(objs,new Set([o.id])));else pintarVivo();return}
      seleccionar(enLazo(objs,x.lazo,o=>visible(o)&&!(o.t==='imagen'&&o.fija)));if(!sel)pintarVivo();return;
    }
    if(x.forma){
      const dd=Math.hypot(x.b[0]-x.a[0],x.b[1]-x.a[1])*vista.z;
      if(x.forma==='papel'){if(dd>16){const c=cajaPuntos([x.a,x.b]);aplicar([...objs,{t:'papel',id:nuevoIdObj(),x:c[0],y:c[1],w:c[2]-c[0],h:c[3]-c[1]}]);aviso('🙈 Parte tapada. Activa «Modo práctica» para repasar.',2200)}herr=herrAntes||'pluma';botones();pintarVivo();return}
      let a=x.a,b=x.b;if(dd<16){const s=['plano','unitario','tabla'].includes(x.forma)?120:60;b=[a[0]+s/vista.z*1.6,a[1]+s/vista.z*(x.forma==='recta'?0:1.2)]}
      const nuevos=formaDirecta(x.forma,a,b,{color:P.pluma.color,ancho:Math.max(1.5,P.pluma.ancho),filas:P.filas,cols:P.cols});
      aplicar([...objs,...nuevos]);pintarVivo();return;
    }
    if(x.texto){const o=objetoEn(objs,x.texto[0],x.texto[1],6/vista.z,o=>o.t==='texto'||o.t==='formula');
      if(o?.t==='formula')editarFormula(o);else editarTexto(o||null,x.texto);return}
  }
  /* ---------- 📈 plano cartesiano editable (plano.js) ---------- */
  let modoPlano=null,ajustePlano=null,toquePlano=null,avisoRango=false,moverOrigen=false,planoPanel=null;
  const planoDe=pid=>objs.find(o=>o.t==='plano'&&o.pid===pid);
  // ¿la selección es un plano (con lo anclado a él)?
  function planoSel(){
    if(!sel)return null;const ps=objs.filter(o=>sel.ids.has(o.id)&&o.t==='plano');if(ps.length!==1)return null;const p=ps[0];
    return objs.every(o=>!sel.ids.has(o.id)||o===p||o.ancla===p.pid)?p:null;
  }
  // La lista con la nueva versión de un plano: lo anclado se mueve, escala o reacomoda con él (conserva sus coordenadas del plano)
  function conPlano(lista,viejo,nuevo){
    const m=matrizPlano(viejo,nuevo),cambia=m.some((v,i)=>Math.abs(v-[1,0,0,1,0,0][i])>1e-9);
    return lista.map(o=>o===viejo?nuevo:cambia&&o.ancla===viejo.pid?transformar(o,m):o);
  }
  function cambiarPlano(p,cambios,{fusionar=!!ajustePlano}={}){
    const n=igualar({...p,...cambios,id:nuevoIdObj()});
    const geo=['x','y','w','h'].some(k=>k in cambios),rango=!geo&&['xMin','xMax','yMin','yMax'].some(k=>Math.abs(n[k]-p[k])>1e-9);
    if(rango&&!avisoRango&&objs.some(o=>o.ancla===p.pid&&o.t==='trazo')){avisoRango=true;aviso('Tus trazos a mano se ajustaron al nuevo rango.',2400)}
    const eraSel=sel?.ids.has(p.id),nuevos=conPlano(objs,p,n);
    if(fusionar&&ajustePlano)fusionarPaso(nuevos);else aplicar(nuevos);
    if(eraSel){sel={ids:conGrupos(objs,new Set([n.id]))};barraSel()}
    pintarVivo();return n;
  }
  // Los cambios de ⚙️ Ajustes cuentan como UN paso del historial (se ven en vivo)
  function fusionarPaso(nuevos){
    nuevos=anclar(objs,nuevos);
    if(ajustePlano.op&&hist.at(-1)===ajustePlano.op)hist.pop();
    const op=diferencia(ajustePlano.base,nuevos);objs=nuevos;ajustePlano.op=op;if(op){hist.push(op);rehacerPila.length=0}tocar();
  }
  // Lo que se dibuja, escribe o se mueve dentro de un plano queda anclado a él (y se suelta si sale)
  function anclar(antes,nuevos){
    const planos=nuevos.filter(o=>o.t==='plano');if(!planos.length&&!nuevos.some(o=>o.ancla))return nuevos;
    const ya=new Set(antes.map(o=>o.id));
    for(const o of nuevos){if(ya.has(o.id)||!anclable(o)||o.suelto)continue;
      const c=caja(o),pl=planoEn(planos,(c[0]+c[2])/2,(c[1]+c[3])/2);if(pl)o.ancla=pl.pid;else delete o.ancla}
    return nuevos;
  }
  const colorSiguiente=p=>COLORES_PLANO[p.objetos.filter(o=>o.k!=='punto').length%COLORES_PLANO.length];
  const conObjeto=(p,o)=>cambiarPlano(p,{objetos:[...p.objetos,o]});
  function describir(o){
    if(o.k==='punto')return `📍 ${nombrePunto(o)}`;if(o.k==='funcion')return `📈 y = ${o.expr.replace(/^\s*y\s*=\s*/,'')}`;
    if(o.k==='recta')return `⟷ ${ecuacionRecta(o.a,o.b)}`;if(o.k==='segmento')return `／ Segmento (${numero(o.a[0])}, ${numero(o.a[1])}) – (${numero(o.b[0])}, ${numero(o.b[1])})`;
    if(o.k==='vector')return `↗ Vector (${numero(o.b[0]-o.a[0])}, ${numero(o.b[1]-o.a[1])})`;if(o.k==='circulo')return `◯ ${ecuacionCirculo(o.c,o.r)}`;
    if(o.k==='tabla')return `🔢 Tabla (${o.pts.length} puntos)`;if(o.k==='region')return `▨ Área bajo ${o.expr} de ${numero(o.a)} a ${numero(o.b)}`;
    if(o.k==='desigualdad')return `≥ y ${o.op.replace('>=','≥').replace('<=','≤')} ${o.expr}`;return `📐 Medida`;
  }
  // Un diálogo pequeño con campos (texto, número, área de texto o casilla) → {id: valor} o null
  function pedirCampos(titulo2,campos,{ayuda='',validar=()=>null}={}){
    return new Promise(res=>{
      const m=document.createElement('div');m.className='modal-fondo';
      m.innerHTML=`<form class="modal" role="dialog" aria-modal="true" aria-labelledby="pc-t"><h2 id="pc-t" style="margin-top:0">${titulo2}</h2>${ayuda?`<p class="nota">${ayuda}</p>`:''}
${campos.map(c=>c.tipo==='check'?`<label class="dib-check"><input type="checkbox" data-c="${c.id}" ${c.valor?'checked':''}> ${esc(c.etiqueta)}</label>`
  :c.tipo==='area'?`<label class="campo">${esc(c.etiqueta)}<textarea data-c="${c.id}" rows="5" spellcheck="false" placeholder="${esc(c.ph||'')}">${esc(c.valor??'')}</textarea></label>`
  :`<label class="campo">${esc(c.etiqueta)}<input data-c="${c.id}" autocomplete="off" spellcheck="false" inputmode="${c.tipo==='num'?'decimal':'text'}" value="${esc(c.valor??'')}" placeholder="${esc(c.ph||'')}"></label>`).join('')}
${campos.some(c=>c.chips)?`<div class="row dib-chips">${campos.find(c=>c.chips).chips.map(t=>`<button type="button" class="chip" data-chip="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}
<p class="nota pc-error" role="alert" style="color:var(--bad)"></p><div class="row"><button type="button" class="btn ghost" data-r="0">Cancelar</button><button type="submit" class="btn">Listo</button></div></form>`;
      const valores=()=>Object.fromEntries(campos.map(c=>{const e=m.querySelector(`[data-c="${c.id}"]`);return [c.id,c.tipo==='check'?e.checked:e.value.trim()]}));
      const cerrar=v=>{m.remove();res(v)};
      m.addEventListener('click',e=>{if(e.target.closest('[data-r="0"]')||e.target===m)cerrar(null);const ch=e.target.closest('[data-chip]');if(ch){const i=m.querySelector('[data-c]');i.value=ch.dataset.chip;i.focus()}});
      m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
      m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=valores(),err=validar(v);if(err){m.querySelector('.pc-error').textContent=err;return}cerrar(v)});
      document.body.appendChild(m);m.querySelector('[data-c]')?.focus();
    });
  }
  const numDe=t=>{const v=num(String(t).replace(/π/g,'pi'));return Number.isFinite(v)?v:NaN};
  async function pedirFuncion(valor=''){
    const v=await pedirCampos('📈 Función',[{id:'expr',etiqueta:'y =',valor,ph:'x^2 - 4',chips:['x^2 - 4','2x + 1','sin(x)','sqrt(x)','1/x','abs(x)','e^x','ln(x)']}],
      {ayuda:'Escribe con ^ las potencias. Funciones: sin, cos, tan, sqrt, abs, ln, log, e^x.',validar:v=>expresionValida(v.expr)?null:'No entiendo esa expresión. Ejemplo: 2x + 1'});
    return v?.expr.replace(/^\s*(y|f\s*\(\s*x\s*\))\s*=\s*/i,'')||null;
  }
  async function agregarAlPlano(p){
    const r=await menuAcciones({titulo:'➕ Agregar al plano',opciones:[['punto','📍 Punto'],['funcion','📈 Función'],['recta','⟷ Recta por dos puntos'],['segmento','／ Segmento'],['vector','↗ Vector'],
      ['circulo','◯ Circunferencia'],['tabla','🔢 Tabla de valores'],['region','▨ Sombrear el área bajo una curva'],['desigualdad','≥ Desigualdad']]});
    if(!r)return;
    if(['punto','recta','segmento','vector','circulo'].includes(r)){modoPlano={k:r,pid:p.pid};herr='plano';limpiarSel();cerrarPanel();botones();
      aviso({punto:'📍 Toca dentro del plano para poner el punto (se ajusta a la cuadrícula).',circulo:'◯ Arrastra del centro hacia afuera.'}[r]||'Arrastra del primer punto al segundo.',2600);return}
    if(r==='funcion'){const e=await pedirFuncion();if(e)conObjeto(planoDe(p.pid),{k:'funcion',id:nuevoIdObj(),expr:e,color:colorSiguiente(p)});return}
    if(r==='tabla'){const v=await pedirCampos('🔢 Tabla de valores',[{id:'t',tipo:'area',etiqueta:'Un renglón por punto: x, y',ph:'-2, 4\n-1, 1\n0, 0\n1, 1\n2, 4'},{id:'unir',tipo:'check',etiqueta:'Unir los puntos',valor:true}],
        {validar:v=>leerTabla(v.t).length?null:'Escribe al menos un renglón «x, y».'});
      if(v)conObjeto(planoDe(p.pid),{k:'tabla',id:nuevoIdObj(),pts:leerTabla(v.t),unir:v.unir,color:colorSiguiente(p)});return}
    if(r==='region'){const f0=p.objetos.find(o=>o.k==='funcion');
      const v=await pedirCampos('▨ Área bajo la curva',[{id:'expr',etiqueta:'y =',valor:f0?.expr||'x^2',ph:'x^2'},{id:'a',etiqueta:'Desde x =',valor:'0',tipo:'num'},{id:'b',etiqueta:'Hasta x =',valor:'2',tipo:'num'}],
        {ayuda:'La integral definida es el área entre la curva y el eje x.',validar:v=>!expresionValida(v.expr)?'No entiendo esa expresión.':!Number.isFinite(numDe(v.a))||!Number.isFinite(numDe(v.b))?'Escribe los dos límites.':null});
      if(v)conObjeto(planoDe(p.pid),{k:'region',id:nuevoIdObj(),expr:v.expr,a:numDe(v.a),b:numDe(v.b),color:colorSiguiente(p)});return}
    if(r==='desigualdad'){const v=await pedirCampos('≥ Desigualdad',[{id:'t',etiqueta:'Desigualdad',valor:'y > 2x + 1',ph:'y > 2x + 1'}],
        {ayuda:'Con > o < la línea es punteada (no entra); con ≥ o ≤, continua.',validar:v=>leerDesigualdad(v.t)?null:'Escribe algo como «y > 2x + 1» o «y ≤ x^2».'});
      const d2=v&&leerDesigualdad(v.t);if(d2)conObjeto(planoDe(p.pid),{k:'desigualdad',id:nuevoIdObj(),...d2,color:colorSiguiente(p)});return}
  }
  const leerTabla=t=>String(t||'').split(/\n/).map(l=>l.replace(/[()]/g,'').split(/[,;\t ]+/).filter(Boolean).map(numDe)).filter(q=>q.length>=2&&q.every(Number.isFinite)).map(q=>[q[0],q[1]]);
  function leerDesigualdad(t){const m=String(t||'').replace(/≥/g,'>=').replace(/≤/g,'<=').match(/^\s*y\s*(>=|<=|>|<)\s*(.+)$/i);return m&&expresionValida(m[2])?{op:m[1],expr:m[2].trim()}:null}
  async function menuObjetoPlano(p,o){
    const r=await menuAcciones({titulo:describir(o),opciones:[...(o.k==='funcion'||o.k==='desigualdad'||o.k==='region'||o.k==='punto'||o.k==='circulo'?[['editar','✏️ Editar']]:[]),['color','🎨 Cambiar el color'],['borrar','🗑️ Borrar','peligro-texto']]});
    if(!r)return;const p2=planoDe(p.pid);if(!p2)return;const cambiar=n=>cambiarPlano(p2,{objetos:p2.objetos.map(x=>x.id===o.id?n:x)});
    if(r==='borrar'){cambiarPlano(p2,{objetos:p2.objetos.filter(x=>x.id!==o.id)});return}
    if(r==='color'){const c=await menuAcciones({titulo:'Color',opciones:PALETA.slice(0,7).map(([n,c])=>[c,`<span class="dib-punto" style="--c:${c}"></span> ${n}`])});if(c)cambiar({...o,color:c});return}
    if(o.k==='funcion'){const e=await pedirFuncion(o.expr);if(e)cambiar({...o,expr:e});return}
    if(o.k==='desigualdad'){const v=await pedirCampos('≥ Desigualdad',[{id:'t',etiqueta:'Desigualdad',valor:`y ${o.op} ${o.expr}`}],{validar:v=>leerDesigualdad(v.t)?null:'Escribe algo como «y > 2x + 1».'});if(v)cambiar({...o,...leerDesigualdad(v.t)});return}
    if(o.k==='region'){const v=await pedirCampos('▨ Área bajo la curva',[{id:'expr',etiqueta:'y =',valor:o.expr},{id:'a',etiqueta:'Desde x =',valor:numero(o.a),tipo:'num'},{id:'b',etiqueta:'Hasta x =',valor:numero(o.b),tipo:'num'}],
      {validar:v=>expresionValida(v.expr)&&Number.isFinite(numDe(v.a))&&Number.isFinite(numDe(v.b))?null:'Revisa la función y los límites.'});if(v)cambiar({...o,expr:v.expr,a:numDe(v.a),b:numDe(v.b)});return}
    if(o.k==='punto'){const v=await pedirCampos(`📍 Punto ${o.nombre}`,[{id:'n',etiqueta:'Nombre',valor:o.nombre},{id:'x',etiqueta:'x =',valor:numero(o.x),tipo:'num'},{id:'y',etiqueta:'y =',valor:numero(o.y),tipo:'num'}],
      {validar:v=>Number.isFinite(numDe(v.x))&&Number.isFinite(numDe(v.y))?null:'Escribe x e y.'});if(v)cambiar({...o,nombre:v.n.slice(0,3)||o.nombre,x:numDe(v.x),y:numDe(v.y)});return}
    if(o.k==='circulo'){const v=await pedirCampos('◯ Circunferencia',[{id:'h',etiqueta:'Centro x =',valor:numero(o.c[0]),tipo:'num'},{id:'k',etiqueta:'Centro y =',valor:numero(o.c[1]),tipo:'num'},{id:'r',etiqueta:'Radio =',valor:numero(o.r),tipo:'num'}],
      {validar:v=>[v.h,v.k,v.r].every(t=>Number.isFinite(numDe(t)))&&numDe(v.r)>0?null:'Revisa el centro y el radio.'});if(v)cambiar({...o,c:[numDe(v.h),numDe(v.k)],r:numDe(v.r)});return}
  }
  async function editarLimite(p,campo){
    const v=await pedirCampos(`Límite: ${campo}`,[{id:'v',etiqueta:`${campo} =`,valor:numero(p[campo]),tipo:'num'}],
      {validar:v=>{const n=numDe(v.v);if(!Number.isFinite(n))return 'Escribe un número.';const q={...p,[campo]:n};return q.xMax>q.xMin&&q.yMax>q.yMin?null:'El mínimo tiene que ser menor que el máximo.'}});
    if(v){const p2=planoDe(p.pid);if(p2)cambiarPlano(p2,{[campo]:numDe(v.v),...(campo[0]==='y'?{igual:false}:{})})}
  }
  // Un toque dentro del plano elegido: un objeto matemático abre su menú; dos toques en un número de los extremos lo editan
  function tocarEnPlano(p,sx,sy){
    const [X,Y]=aMundo(sx,sy),o=objetoPlanoEn(p,X,Y,12/vista.z),ahora=performance.now();
    if(o){toquePlano=null;menuObjetoPlano(p,o);return}
    if(toquePlano&&ahora-toquePlano.t<450&&Math.hypot(sx-toquePlano.sx,sy-toquePlano.sy)<30){
      toquePlano=null;const l=limitesEn(p).map(q=>({...q,d:Math.hypot(q.x-X,q.y-Y)*vista.z})).sort((a,b)=>a.d-b.d)[0];
      if(l&&l.d<34){editarLimite(p,l.campo);return}}
    toquePlano={t:ahora,sx,sy};
  }
  // Vista previa al mover un punto o dibujar un objeto nuevo
  function objetoNuevo(k,a,b,p){
    const c=colorSiguiente(p);
    if(k==='punto')return {k,id:'nuevo',x:a[0],y:a[1],nombre:siguienteNombre(p),color:'#dc2626'};
    if(k==='circulo')return {k,id:'nuevo',c:a,r:Math.hypot(b[0]-a[0],b[1]-a[1]),color:c};
    return {k,id:'nuevo',a,b,color:c};
  }
  const enPaso=(p,X,Y)=>{const u=aPlanoDe(p,[X,Y]);return P.planoAjustar===false?u.map(v=>Math.round(v*100)/100):ajustarAPaso(p,u)};
  function abrirPanelPlano(p){planoPanel=p.pid;if(panel==='plano'){repintarPanel();return}abrirPanel('plano');ajustePlano={base:objs,op:null}}
  function htmlPlanoPanel(){
    const p=planoDe(planoPanel);if(!p)return '<p class="nota">El plano ya no existe.</p>';
    const pasos=[['0.25','0,25'],['0.5','0,5'],['1','1'],['2','2'],['5','5'],['10','10'],[String(Math.PI/4),'π/4'],[String(Math.PI/2),'π/2'],[String(Math.PI),'π']];
    const selPaso=k=>`<select data-pl="${k}" aria-label="Paso en ${k==='pasoX'?'x':'y'}">${pasos.map(([v,n])=>`<option value="${v}" ${Math.abs(+v-p[k])<1e-9?'selected':''}>${n}</option>`).join('')}${pasos.some(([v])=>Math.abs(+v-p[k])<1e-9)?'':`<option selected value="${p[k]}">${numero(p[k])}</option>`}</select>`;
    const campo=(k,n)=>`<label>${n}<input data-pl="${k}" inputmode="decimal" value="${numero(p[k])}" aria-label="${n}"></label>`;
    const seg=(attr,lista,act)=>`<div class="segmentos" role="group">${lista.map(([v,n])=>`<button type="button" ${attr}="${v}" aria-pressed="${act===v}">${n}</button>`).join('')}</div>`;
    return `<div class="dib-presets">${PRESETS.map(([id,n])=>`<button type="button" class="btn ghost btn-chico" data-pl-preset="${id}">${n}</button>`).join('')}<button type="button" class="btn ghost btn-chico" data-d="pl-ajustar">⤢ Ajustar a lo dibujado</button></div>
<div class="dib-rango4">${campo('xMin','x mín')}${campo('xMax','x máx')}${campo('yMin','y mín')}${campo('yMax','y máx')}</div>
<div class="dib-rango4"><label>Paso x ${selPaso('pasoX')}</label><label>Paso y ${selPaso('pasoY')}</label><label>Número cada <select data-pl="numCada">${[1,2,5].map(n=>`<option ${p.numCada===n?'selected':''}>${n}</option>`).join('')}</select></label></div>
${seg('data-pl-rejilla',[['no','Sin cuadrícula'],['principal','Cuadrícula'],['secundaria','+ secundaria']],p.rejilla)}
${seg('data-pl-estilo',[['centrado','Ejes al centro'],['cuadrante','1er cuadrante'],['borde','Ejes al borde']],p.estilo)}
${[['igual','Misma escala en x y y'],['flechas','Flechas en los ejes'],['origen','El «0» del origen'],['ecuaciones','Ecuaciones junto a las gráficas'],['moverVista','Mover la vista del plano (con ✋)']].map(([k,n])=>`<label class="dib-check"><input type="checkbox" data-plb="${k}" ${p[k]?'checked':''}> ${n}</label>`).join('')}
<label class="dib-check"><input type="checkbox" data-pref-plano ${P.planoAjustar!==false?'checked':''}> Ajustar los puntos a la cuadrícula</label>
<div class="dib-rango4"><label>Eje x <input data-pl="ejeX" value="${esc(p.ejeX)}" maxlength="6"></label><label>Eje y <input data-pl="ejeY" value="${esc(p.ejeY)}" maxlength="6"></label></div>
${colores(PALETA.slice(0,7),p.color,'data-pl-color')}<label class="dib-rango">Grosor <input type="range" min="0.8" max="4" step=".2" value="${p.ancho}" data-pl="ancho"></label>
<h3 class="dib-opc-sub">Objetos del plano</h3>${p.objetos.length?`<ul class="dib-objs">${p.objetos.map(o=>`<li><span style="color:${o.color||'inherit'}">${esc(describir(o))}</span><button type="button" class="btn-icono" data-plo="${o.id}" aria-label="Opciones de ${esc(describir(o))}">⋯</button></li>`).join('')}</ul>`:'<p class="nota">Todavía nada: usa ➕ Agregar.</p>'}
<button type="button" class="btn ghost btn-chico" data-d="pl-agregar">➕ Agregar al plano</button>`;
  }
  function entradaPlano(el){
    const p=planoDe(planoPanel);if(!p)return;const k=el.dataset.pl;
    if(k==='ejeX'||k==='ejeY'){cambiarPlano(p,{[k]:el.value.slice(0,6)});return}
    if(k==='ancho'){cambiarPlano(p,{ancho:+el.value});return}
    const v=numDe(el.value);if(!Number.isFinite(v))return;
    if(k==='numCada'){cambiarPlano(p,{numCada:v});return}
    if(k==='pasoX'||k==='pasoY'){if(v>0&&((k==='pasoX'?p.xMax-p.xMin:p.yMax-p.yMin)/v)<=200)cambiarPlano(p,{[k]:v});return}
    const q={...p,[k]:v};if(q.xMax>q.xMin&&q.yMax>q.yMin)cambiarPlano(p,{[k]:v,...(k[0]==='y'?{igual:false}:{})});
  }
  // ⊹ Fondo «plano cartesiano»: origen, unidad y paso (no son objetos: se guardan con el dibujo)
  function htmlFondoPlano(){const c=d.cartesiano||{unidad:CM,paso:1};
    return `<label class="dib-rango">Tamaño de la unidad <input type="range" min="16" max="96" step="2" value="${c.unidad}" data-fp="unidad"></label>
<label>Número cada <select data-fp="paso">${[0.5,1,2,5,10].map(n=>`<option ${c.paso===n?'selected':''} value="${n}">${numero(n)}</option>`).join('')}</select></label>
<div class="row" style="flex-wrap:wrap;gap:8px"><button type="button" class="btn ghost btn-chico" data-d="fp-origen">📍 Mover el origen</button><button type="button" class="btn ghost btn-chico" data-d="fp-objeto">📈 Convertir en plano editable</button><button type="button" class="btn ghost btn-chico" data-d="fp-reset">Restablecer</button></div>`}
  function fondoPlano(cambios){const [ox,oy]=origenCartesiano(d);d.cartesiano={ox,oy,unidad:unidadCartesiano(d),paso:pasoCartesiano(d),...cambios};cambiado=true;version++;pintarTodo();clearTimeout(autoTimer);autoTimer=setTimeout(autoguardarYa,800)}
  function fondoAObjeto(){
    const [ox,oy]=origenCartesiano(d),U=unidadCartesiano(d),m=16/vista.z,x0=vista.x+m,y0=vista.y+m,w=W/vista.z-2*m,h=H/vista.z-2*m-60/vista.z;
    const p=nuevoPlano(x0,y0,w,h,{xMin:(x0-ox)/U,xMax:(x0+w-ox)/U,yMin:(oy-(y0+h))/U,yMax:(oy-y0)/U,pasoX:pasoCartesiano(d),pasoY:pasoCartesiano(d),numCada:1,igual:true,rejilla:'secundaria'});
    d.fondo='liso';aplicar([...objs,p]);cerrarPanel();seleccionar(conGrupos(objs,new Set([p.id])));aviso('📈 Ahora es un plano editable: tócalo para cambiarlo.',2200);
  }

  /* ---------- ✌️ Dos dedos ---------- */
  let medicion=null;   // la última medida de 📐 Medir, para «Dejar en la hoja»
  const r2=v=>Math.round(v*100)/100,gruesoDos=()=>Math.max(1.5,P.pluma.ancho);
  function dosAbajo(e,sx,sy){
    if(sel)limpiarSel();
    if(!g){g={dos:true,ptr:new Map(),orden:[],segs:[],t0:performance.now()};if(medicion){medicion=null;botones()}}
    if(g.fin||g.ptr.size>=2)return;
    try{cV.setPointerCapture(e.pointerId)}catch(x){}
    g.ptr.set(e.pointerId,[sx,sy]);g.orden.push(e.pointerId);
    if(g.ptr.size===1){g.a0=[sx,sy];g.unico=e.pointerType!=='touch';g.pista=[sx,sy];pintarVivo();return}
    g.unico=false;dosInicio();
  }
  function dosPuntos(){
    const [i1,i2]=g.orden,A=g.unico?g.a0:g.ptr.get(i1),B=g.unico?g.ptr.get(i1):g.ptr.get(i2);
    let a=aMundo(...A),b=aMundo(...B);const m=P.dos.modo;
    const pl=(m==='regla'||m==='medir')&&planoEn(objs,a[0],a[1]);
    if(P.dos.ajustar&&pl){a=aLienzo(pl,ajustarAPaso(pl,aPlanoDe(pl,a)));b=aLienzo(pl,ajustarAPaso(pl,aPlanoDe(pl,b)))}
    else if(P.dos.ajustar&&conRejilla(d)&&(m==='regla'||m==='medir')){a=ajustarRejilla(a,d);b=ajustarRejilla(b,d)}
    return [a,b,A,B];
  }
  function dosInicio(){const [a,b]=dosPuntos();g.activo=true;g.pista=null;g.giro=0;g.ang0=g.angPrev=Math.atan2(b[1]-a[1],b[0]-a[0]);dosVivo()}
  function dosVivo(){
    const [a,b,A,B]=dosPuntos(),m=P.dos.modo,col=P.pluma.color,an=gruesoDos();
    g.a=a;g.b=b;g.info=null;g.medida=null;
    if(m==='regla'){g.vista=formaDirecta('linea',a,b,{color:col,ancho:an});medidaDe(a,b,...B)}
    else if(m==='compas'){
      const r=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);let da=ang-g.angPrev;da=Math.atan2(Math.sin(da),Math.cos(da));g.giro+=da;g.angPrev=ang;
      g.arco=Math.abs(g.giro)>=Math.PI/9&&Math.abs(g.giro)<Math.PI*2-.05;g.radio=r;
      const pts=g.arco?arcoCompas(a,r,g.ang0,g.giro):arcoCompas(a,r);
      g.vista=[{t:'trazo',id:'dos1',herr:'pluma',tipo:'boli',color:col,ancho:an,recto:true,pts:pts.map(p=>[p[0],p[1],.5])},{t:'trazo',id:'dos2',herr:'pluma',tipo:'boli',color:'#6b7280',ancho:1,recto:true,pts:[[a[0],a[1],.5],[b[0],b[1],.5]]}];
      g.info=[`r = ${(r/CM).toFixed(1)} cm`,g.arco?`θ = ${textoAngulo(g.giro)}`:'Gira el segundo dedo para hacer un arco'];
    }
    else if(m==='medir'){g.res=medirDos(a,b,dd());g.vista=objetosMedida(a,b,d,{color:col,ancho:an}).filter(o=>o.t==='trazo');g.info=lineasMedida(g.res)}
    else if(m==='marco'){g.vista=marcoDos(a,b,{tipo:P.dos.marco,color:col,ancho:an,colorRes:P.resaltador.color});medidaDe(a,b,...B,'caja')}
    else{   // 🌀 barrido: una línea cada «espaciado» px que se mueva cualquiera de los dos dedos
      if(!g.ultA||Math.max(Math.hypot(A[0]-g.ultA[0],A[1]-g.ultA[1]),Math.hypot(B[0]-g.ultB[0],B[1]-g.ultB[1]))>=P.dos.espaciado){
        if(g.segs.length<1500)g.segs.push([a,b]);g.ultA=[...A];g.ultB=[...B];if(!g.eje)g.eje=[(a[0]+b[0])/2,(a[1]+b[1])/2]}
      g.vista=objetosBarrido([...g.segs,[a,b]],opcBarrido());g.info=[`🌀 ${g.segs.length} líneas`];
    }
    pintarVivo();
  }
  const opcBarrido=()=>({color:P.pluma.color,color2:P.dos.degradado?P.dos.color2:null,ancho:P.dos.ancho,simetria:P.dos.simetria,eje:g?.eje});
  function dosMover(e,sx,sy){
    if(!g.ptr.has(e.pointerId)||g.fin)return;
    e.preventDefault();g.ptr.set(e.pointerId,[sx,sy]);
    if(g.unico&&!g.activo){if(Math.hypot(sx-g.a0[0],sy-g.a0[1])<4)return;dosInicio();return}
    if(g.activo)dosVivo();
  }
  function dosArriba(e){
    if(!g.ptr.has(e.pointerId))return;
    g.ptr.delete(e.pointerId);
    if(!g.fin){g.fin=true;
      if(g.activo)dosTerminar();
      else aviso(g.unico?'✌️ Arrastra del primer punto al segundo.':'✌️ Pon dos dedos: uno en cada punto.',1500)}
    if(!g.ptr.size){g=null;pintarVivo()}
  }
  function dosTerminar(){
    const m=P.dos.modo,a=g.a,b=g.b,col=P.pluma.color,an=gruesoDos(),lejos=Math.hypot(b[0]-a[0],b[1]-a[1])*vista.z>8;
    const listo=g.segs,vistaG=g;vistaG.vista=null;vistaG.info=null;vistaG.medida=null;
    if(!lejos&&m!=='barrido'){pintarVivo();return}
    let nuevos=[];
    if(m==='regla')nuevos=formaDirecta('linea',a,b,{color:col,ancho:an});
    else if(m==='compas'){const pts=vistaG.arco?arcoCompas(a,vistaG.radio,vistaG.ang0,vistaG.giro):arcoCompas(a,vistaG.radio);
      nuevos=[{t:'trazo',id:nuevoIdObj(),herr:'pluma',tipo:'boli',color:col,ancho:an,recto:true,forma:vistaG.arco?'arco':'circulo',g:nuevoIdObj(),pts:pts.map(p=>[r2(p[0]),r2(p[1]),.5])}];
      aviso(vistaG.arco?`🧭 Arco: r = ${(vistaG.radio/CM).toFixed(1)} cm · ${textoAngulo(vistaG.giro)}`:`🧭 Círculo: r = ${(vistaG.radio/CM).toFixed(1)} cm`,1800)}
    else if(m==='medir'){medicion={a,b,res:vistaG.res,vista:objetosMedida(a,b,d,{color:col,ancho:an}).filter(o=>o.t==='trazo')};botones();pintarVivo();return}
    else if(m==='marco')nuevos=marcoDos(a,b,{tipo:P.dos.marco,color:col,ancho:an,colorRes:P.resaltador.color});
    else nuevos=objetosBarrido(listo.length?listo:[[a,b]],opcBarrido());
    if(nuevos.length)aplicar([...objs,...nuevos]);pintarVivo();
  }
  // la animación de «¿Para qué sirve?»: rectas que van formando una parábola
  const SVG_BARRIDO=`<svg class="dib-para-svg" viewBox="0 0 150 150" role="img" aria-label="Rectas entre dos ejes que forman una parábola"><path d="M10 6 V140 H146" fill="none" stroke="currentColor" stroke-width="2"/>${Array.from({length:10},(_,i)=>`<line x1="10" y1="${10+i*13}" x2="${23+i*13}" y2="140" style="animation-delay:${(i*.3).toFixed(1)}s"/>`).join('')}</svg>`;
  function htmlDos(){
    const p=P.dos,m=p.modo,ajustar=`<label class="dib-check"><input type="checkbox" data-dos-ajustar ${p.ajustar?'checked':''}> Ajustar los extremos a la cuadrícula</label>`;
    const op={
      regla:`${ajustar}<p class="nota">Un dedo en cada extremo: ves la línea, su largo y su ángulo; al soltar queda una sola línea recta.</p>`,
      compas:`<p class="nota">El primer dedo es el centro y el segundo marca el radio: al soltar queda el círculo. Si giras el segundo dedo, queda solo el arco, con su ángulo en grados y radianes.</p>`,
      medir:`${ajustar}<p class="nota">Dos puntos del plano: Δx, Δy, la pendiente m = Δy/Δx, la distancia, el punto medio y la ecuación de la recta. Luego, «📌 Dejar en la hoja».</p>${d.fondo!=='cartesiano'?'<button type="button" class="btn ghost btn-chico" data-d="dos-plano">⊹ Poner el plano cartesiano</button>':''}`,
      marco:`<div class="segmentos" role="group" aria-label="Tipo de marco"><button type="button" data-dos-marco="marco" aria-pressed="${p.marco!=='resaltado'}">▭ Marco</button><button type="button" data-dos-marco="resaltado" aria-pressed="${p.marco==='resaltado'}">🖍️ Resaltado</button></div><p class="nota">Los dos dedos son esquinas opuestas: encierra o resalta una parte de tus apuntes o de una foto.</p>`,
      barrido:`<label class="dib-rango">Una línea cada <input type="range" min="4" max="40" step="1" value="${p.espaciado}" data-dos-esp aria-label="Espaciado en píxeles"></label>
<label class="dib-check"><input type="checkbox" data-dos-degradado ${p.degradado?'checked':''}> Degradado de color</label>${p.degradado?`<div class="dib-colores" role="group" aria-label="Color final del degradado">${PALETA.slice(1,8).map(([n,c])=>`<button type="button" class="dib-color" data-dos-color2="${c}" aria-label="Hasta ${esc(n)}" aria-pressed="${c===p.color2}" style="--c:${c}"></button>`).join('')}</div>`:''}
<div class="segmentos" role="group" aria-label="Simetría">${[['no','Sin espejo'],['h','↔ Espejo'],['v','↕ Espejo']].map(([v,n])=>`<button type="button" data-dos-sim="${v}" aria-pressed="${p.simetria===v}">${n}</button>`).join('')}</div>
<button type="button" class="btn ghost btn-chico" data-d="dos-parabola">📈 Ejemplo: parábola con rectas</button>
<details class="dib-para"><summary>¿Para qué sirve?</summary>${SVG_BARRIDO}<ul class="nota">
<li><b>Curvas con rectas</b>: unir los puntos de dos ejes forma una parábola (prueba el ejemplo).</li>
<li><b>Área barrida</b>: barre un segmento bajo una curva y verás la integral como área.</li>
<li><b>Rotación</b>: deja un dedo fijo y gira el otro: ves el ángulo barrido (radianes, círculo unitario).</li>
<li><b>Arte y mapas de ideas</b>: fondos para portadas de apuntes o mapas mentales.</li></ul></details>`};
    return `<div class="dib-formas" role="group" aria-label="Modo">${MODOS_DOS.map(([id,i,n])=>`<button type="button" data-dos-modo="${id}" aria-pressed="${m===id}"><span aria-hidden="true">${i}</span><small>${n}</small></button>`).join('')}</div>${op[m]}
${colores(PALETA.slice(0,7),P.pluma.color)}<p class="nota">Mientras está activa, los dos dedos dibujan. El zoom, con + y −.</p><button type="button" class="btn ghost btn-chico" data-d="dos-salir">📐 Volver a Formas</button>`;
  }
  function parabolaEjemplo(){
    const s=CM*.9,n=10,c=aMundo(W/2,H/2),x=c[0]-n*s/2,y=c[1]-n*s/2-20/vista.z;
    aplicar([...objs,...parabolaConRectas(x,y,{n,s,color:P.pluma.color})]);cerrarPanel();
    aviso('📈 Une 1 con 1, 2 con 2… (en 📏 Regla). Ya está hecha la primera recta.',3200);
  }

  let herrAntes=null;
  const visible=o=>d.capas[capaDe(o)]!==false;
  function borrarEn(wx,wy){
    const p=P.borrador,rad=(g.modo==='trazo'?Math.max(10,p.tam*.5):p.tam/2)/vista.z,filtro=o=>visible(o)&&o.t!=='papel'&&o.t!=='plano'&&(!p.soloRes||o.herr==='resaltador')&&!(o.t==='imagen'&&o.fija);
    let nuevos;
    if(g.modo==='trazo'){const fuera=new Set();for(const o of objs)if(filtro(o)&&(tocaObjeto(o,wx,wy,rad)||g.ult&&o.t==='trazo'&&cruzaSegmento(o,g.ult,[wx,wy],rad)))fuera.add(o.id);
      const todos=conGruposSolo(fuera);nuevos=todos.size?objs.filter(o=>!todos.has(o.id)):objs}
    else nuevos=borrarCon(objs,[g.ult||[wx,wy],[wx,wy]],rad,o=>o.t==='trazo'&&filtro(o));
    g.ult=[wx,wy];
    if(nuevos!==objs){objs=nuevos;version++;pintarTodo()}else pintarVivo();
  }
  const conGruposSolo=ids=>ids.size?conGrupos(objs,ids):ids;
  function cruzaSegmento(o,a,b,r){const c=caja(o);if(Math.max(a[0],b[0])<c[0]-r||Math.min(a[0],b[0])>c[2]+r||Math.max(a[1],b[1])<c[1]-r||Math.min(a[1],b[1])>c[3]+r)return false;
    for(const p of o.pts)if(distSeg(p[0],p[1],a,b)<=r+o.ancho/2)return true;return false}

  /* ---------- regla y transportador ---------- */
  const dirRegla=()=>[Math.cos(regla.ang),Math.sin(regla.ang)];
  function cercaRegla(wx,wy){if(!regla)return false;const [c,s]=dirRegla(),dx=wx-regla.x,dy=wy-regla.y,t=dx*c+dy*s,n=-dx*s+dy*c;return t>=-20/vista.z&&t<=regla.largo+20/vista.z&&n>=-22/vista.z&&n<=60/vista.z}
  function enCuerpoRegla(wx,wy){if(!regla)return false;const [c,s]=dirRegla(),dx=wx-regla.x,dy=wy-regla.y,t=dx*c+dy*s,n=-dx*s+dy*c;return t>=0&&t<=regla.largo&&n>=16/vista.z&&n<=54/vista.z}
  function proyRegla(wx,wy){const [c,s]=dirRegla(),t=Math.max(0,Math.min(regla.largo,(wx-regla.x)*c+(wy-regla.y)*s));return [regla.x+c*t,regla.y+s*t]}
  const puntaRegla=()=>{const [c,s]=dirRegla(),L=regla.largo-14/vista.z,[a,b]=aPantalla(regla.x+c*L-s*27/vista.z,regla.y+s*L+c*27/vista.z);return [a,b]};
  function cercaTransp(wx,wy){return transp&&Math.hypot(wx-transp.x,wy-transp.y)<=transp.r*1.1}
  function enCuerpoTransp(wx,wy){if(!transp)return false;const dx=wx-transp.x,dy=wy-transp.y,c=Math.cos(-transp.ang),s=Math.sin(-transp.ang),ly=dx*s+dy*c;return Math.hypot(dx,dy)<=transp.r&&Math.hypot(dx,dy)>26/vista.z&&ly<0}
  const puntaTransp=()=>{const c=Math.cos(transp.ang),s=Math.sin(transp.ang),lx=transp.r-14/vista.z,ly=-12/vista.z;return aPantalla(transp.x+lx*c-ly*s,transp.y+lx*s+ly*c)};
  function alternarGuia(cual){
    const [cx,cy]=aMundo(W/2,H/2);
    if(cual==='regla')regla=regla?null:{x:cx-7.5*CM,y:cy,ang:0,largo:15*CM};
    else transp=transp?null:{x:cx,y:cy+2.5*CM,r:5*CM,ang:0};
    if(regla||transp)aviso(cual==='regla'?'📏 Arrastra la regla por su cuerpo; gírala con ⟳ o con 2 dedos. Traza junto a su borde para una línea recta.':'◠ Empieza un trazo en el centro del transportador para medir el ángulo.',3200);
    pintarVivo();repintarPanel();
  }

  /* ---------- texto y fórmulas ---------- */
  function editarTexto(o,pos){
    const t=document.createElement('textarea');t.className='dib-txt';const tam=o?.tam||P.texto.tam,col=o?.color||P.texto.color,[sx,sy]=aPantalla(o?o.x:pos[0],o?o.y:pos[1]);
    t.value=o?.texto||'';t.setAttribute('aria-label','Texto del dibujo');t.rows=1;
    Object.assign(t.style,{left:`${Math.max(4,Math.min(W-60,sx))}px`,top:`${Math.max(4,sy)}px`,fontSize:`${tam*vista.z}px`,color:colorVisible(col,oscuro),maxWidth:`${W-Math.max(4,sx)-8}px`});
    area.appendChild(t);editando={el:t,o,pos:o?[o.x,o.y]:pos,tam,col};if(o){ocultos=new Set([o.id]);pintarTodo()}
    const ajustarT=()=>{t.style.height='auto';t.style.height=t.scrollHeight+'px';t.style.width='auto';t.style.width=Math.min(W-16,t.scrollWidth+8)+'px'};
    t.addEventListener('input',ajustarT);t.addEventListener('blur',()=>setTimeout(()=>{if(editando?.el===t)terminarTexto()},0));
    t.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();terminarTexto()}});
    ajustarT();t.focus();marcaSiHace();
  }
  function terminarTexto(){
    const ed=editando;if(!ed)return;editando=null;ocultos=null;const txt=ed.el.value.replace(/\s+$/,'');ed.el.remove();
    const x=document.createElement('canvas').getContext('2d');x.font=`${ed.tam}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;
    const lineas=txt.split('\n'),w=Math.max(8,...lineas.map(l=>x.measureText(l).width))+6,h=lineas.length*ed.tam*1.3;
    const nuevo=txt?{t:'texto',id:nuevoIdObj(),x:ed.pos[0],y:ed.pos[1],w,h,texto:txt,tam:ed.tam,color:ed.col,...(ed.o?.rot?{rot:ed.o.rot}:{}),...(ed.o?.g?{g:ed.o.g}:{}),...(ed.o?.capa?{capa:ed.o.capa}:{})}:null;
    if(ed.o){const i=objs.findIndex(o=>o.id===ed.o.id);const n=objs.slice();if(nuevo)n.splice(i,1,nuevo);else n.splice(i,1);aplicar(n)}
    else if(nuevo)aplicar([...objs,nuevo]);
    pintarTodo();marcaSiHace();
  }
  async function editarFormula(o=null,pos=null){
    const r=await pedirFormula(o?.tex||'');if(r===null)return;
    if(!r.trim()){if(o)aplicar(objs.filter(x=>x.id!==o.id));return}
    const m=medirFormula(r,22)||{w:120,h:40},s=o?o.h/(medirFormula(o.tex,22)?.h||o.h):1;
    const [cx,cy]=pos||(o?[o.x,o.y]:aMundo(W/2-m.w*vista.z/2,H/3));
    const nuevo={t:'formula',id:nuevoIdObj(),x:cx,y:cy,w:m.w*s,h:m.h*s,tex:r,tam:22*s,color:o?.color||P.texto.color,...(o?.rot?{rot:o.rot}:{})};
    if(o){const n=objs.slice();n.splice(objs.indexOf(o),1,nuevo);aplicar(n)}else aplicar([...objs,nuevo]);
  }

  /* ---------- imágenes ---------- */
  async function insertarImagen(file){
    if(!file||!nuevaImagen)return;estado('Guardando la imagen…');
    try{const img=await comprimirFoto(file),id=await nuevaImagen(img),[cx,cy]=aMundo(W/2,H/2),w=Math.min(W*.8/vista.z,anchoP()*.9),h=w*img.alto/img.ancho;
      aplicar([...objs,{t:'imagen',id:nuevoIdObj(),x:cx-w/2,y:cy-h/2,w,h,archivo:id}]);estado('');aviso('🖼️ Imagen insertada: escribe encima. Con ⬚ la mueves; 📍 la fija.',2600)}
    catch(e){aviso(e.message||'No se pudo insertar la imagen.');estado('')}
  }
  async function recortarImagen(o){
    const {editarFoto}=await import('../cuaderno/editor-ui.js');const b=await cargarImagen(o.archivo);if(!b||!nuevaImagen)return;
    const r=await editarFoto(b);if(!r)return;const id=await nuevaImagen(r),h=o.w*r.alto/r.ancho;
    const n=objs.map(x=>x.id===o.id?{...x,id:nuevoIdObj(),archivo:id,h}:x);aplicar(n);seleccionar(new Set([n.find(x=>x.archivo===id&&x.y===o.y).id]));
  }

  /* ---------- ✨ pasar a texto o fórmula (IA) ---------- */
  async function aTexto(){
    const os=(sel?elegidos():objs).filter(o=>o.t==='trazo'&&visible(o)&&capaDe(o)!=='fondo');
    if(!os.length){aviso('No hay nada escrito a mano para leer.');return}
    if(!iaDisponible()){aviso('✨ Para pasar a texto, configura la IA (gratis con Gemini) en Perfil → ✨ Inteligencia artificial.',4200);return}
    const c=cajaDe(os);estado('✨ Leyendo tu letra…');
    try{
      const png=await renderRegion([c[0]-8,c[1]-8,c[2]+8,c[3]+8],{lista:os,max:1280,fondo:false,claro:true,blanco:true});
      const r=await pedir({nivel:'vision',maxTokens:800,imagenes:[{media_type:'image/png',data:await blobB64(png.blob)}],
        esquemaJSON:{type:'object',properties:{tipo:{type:'string',enum:['texto','formula']},texto:{type:'string'},latex:{type:'string'}},required:['tipo','texto','latex']},
        sistema:'Transcribes lo que un estudiante escribió a mano. Si es matemáticas, tipo "formula" y en latex la fórmula en LaTeX (sin $). Si es texto, tipo "texto" y el texto tal cual. Sin explicaciones.',
        mensajes:[{role:'user',content:'Transcribe lo escrito a mano en la imagen.'}]});
      estado('');const res=await confirmarTexto(r);if(!res)return;
      const esF=res.tipo==='formula',x0=c[0],y0=res.donde==='reemplazar'?c[1]:c[3]+12;
      let nuevo;
      if(esF){const m=medirFormula(res.valor,22)||{w:120,h:40},s=Math.max(1,Math.min(4,(c[3]-c[1])/m.h*.9));nuevo={t:'formula',id:nuevoIdObj(),x:x0,y:y0,w:m.w*s,h:m.h*s,tex:res.valor,tam:22*s,color:os[0].color||TINTA}}
      else{const tam=Math.max(14,Math.min(48,Math.round((c[3]-c[1])/Math.max(1,res.valor.split('\n').length)/1.4))),x=document.createElement('canvas').getContext('2d');x.font=`${tam}px system-ui,sans-serif`;
        const ls=res.valor.split('\n');nuevo={t:'texto',id:nuevoIdObj(),x:x0,y:y0,w:Math.max(...ls.map(l=>x.measureText(l).width))+6,h:ls.length*tam*1.3,texto:res.valor,tam,color:os[0].color||TINTA}}
      const ids=new Set(os.map(o=>o.id)),base=res.donde==='reemplazar'?objs.filter(o=>!ids.has(o.id)):objs;
      aplicar([...base,nuevo]);seleccionar(new Set([nuevo.id]));aviso(res.donde==='reemplazar'?'✨ Reemplazado (Deshacer lo devuelve)':'✨ Agregado debajo',2000);
    }catch(e){estado('');aviso(e.message||'No se pudo leer lo escrito.',3500)}
  }
  function confirmarTexto(r){
    return new Promise(res=>{
      const esF=r?.tipo==='formula',val=String((esF?r.latex:r.texto)||r?.texto||'').trim(),m=document.createElement('div');m.className='modal-fondo';
      m.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="dt-t"><h2 id="dt-t" style="margin-top:0">✨ Esto leímos</h2>
<div class="segmentos" role="group" aria-label="Como"><button type="button" data-como="texto" aria-pressed="${!esF}">Texto</button><button type="button" data-como="formula" aria-pressed="${esF}">Fórmula</button></div>
<label class="campo">Revisa y corrige<textarea id="dt-v" rows="3" spellcheck="false">${esc(val)}</textarea></label><div class="dib-previa nota-render" aria-live="polite"></div>
<div class="pila"><button type="button" class="btn ancho" data-r="reemplazar">Reemplazar lo escrito</button><button type="button" class="btn ghost ancho" data-r="debajo">Agregar debajo</button><button type="button" class="btn ghost ancho" data-r="0">Cancelar</button></div></div>`;
      let como=esF?'formula':'texto';const ta=m.querySelector('#dt-v'),pv=m.querySelector('.dib-previa');
      const previa=()=>{pv.innerHTML=como==='formula'?tex(ta.value,true):''};previa();
      const cerrar=v=>{m.remove();res(v)};
      m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
        if(b.dataset.como){como=b.dataset.como;m.querySelectorAll('[data-como]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));previa();return}
        if(b.dataset.r==='0')cerrar(null);else if(b.dataset.r)cerrar(ta.value.trim()?{tipo:como,valor:ta.value.trim(),donde:b.dataset.r==='reemplazar'?'reemplazar':'debajo'}:null)});
      ta.addEventListener('input',previa);m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
      document.body.appendChild(m);ta.focus();
    });
  }

  /* ---------- exportar ---------- */
  async function esperarRecursos(lista){
    await Promise.all(lista.filter(o=>o.t==='imagen').map(async o=>{if(!imagenes.get(o.archivo)||imagenes.get(o.archivo)==='…'){try{const b=await cargarImagen(o.archivo);imagenes.set(o.archivo,b?await createImageBitmap(b):null)}catch(e){}}}));
    await Promise.all(lista.filter(o=>o.t==='formula').map(async o=>{const kk=`${colorVisible(o.color||TINTA,false)}|${o.tex}`;const v=formulas.get(kk);if(!v||v==='…'){formulas.set(kk,await imagenFormula(o.tex,{tam:22,color:o.color||TINTA})||{})}}));
  }
  // Una zona del lienzo como imagen (papel claro, como en la nota)
  async function renderRegion(r,{lista=objs,max=1600,fondo=true,claro=true,blanco=false,tipo='image/png',calidad=.9,pixeles=6e6}={}){
    await esperarRecursos(lista);
    const w=r[2]-r[0],h=r[3]-r[1],s=Math.min(2,max/w,Math.sqrt(pixeles/(w*h))),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));
    const x=c.getContext('2d'),v={x:r[0],y:r[1],z:1},o={vista:v,ancho:w,alto:h,k:s,oscuro:!claro,capas:d.capas,imagen:id=>{const b=imagenes.get(id);return b&&b!=='…'?b:null},formula:(ob)=>{const v2=formulas.get(`${colorVisible(ob.color||TINTA,!claro)}|${ob.tex}`);return v2&&v2!=='…'?v2:null}};
    if(fondo)pintarFondo(x,{...d,modo:d.modo},{...o,papel:'#ffffff',mesa:'#ffffff'});else if(blanco||tipo==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}
    pintarObjetos(x,lista.filter(ob=>ob.t!=='papel'),o);
    const blob=await new Promise(res=>c.toBlob(res,tipo,calidad));if(!blob)throw new Error('No se pudo crear la imagen.');
    return {blob,ancho:c.width,alto:c.height};
  }
  const nombre=ext=>`${titulo.replace(/[^\wáéíóúñÁÉÍÓÚÑ -]/g,'').trim().slice(0,40)||'dibujo'}.${ext}`;
  async function compartirODescargar(blob,archivo,compartir){
    const file=new File([blob],archivo,{type:blob.type});
    if(compartir&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:titulo});return}catch(e){if(e.name==='AbortError')return}}
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=archivo;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
  }
  async function exportar(tipo,compartir=false){
    estado('Preparando…');
    try{
      if(tipo==='pdf'){const pags=[];for(const r of paginasPDF(estadoActual()))pags.push(await renderRegion(r,{tipo:'image/jpeg',calidad:.88,max:1700}));
        const pdf=await pdfDePaginas(pags);window.__ultimoExport={tipo:'pdf',bytes:pdf.size,paginas:pags.length};await compartirODescargar(pdf,nombre('pdf'),compartir)}
      else{const png=await renderRegion(region(estadoActual()),{fondo:tipo==='png',max:2400,pixeles:12e6});window.__ultimoExport={tipo,bytes:png.blob.size,ancho:png.ancho,alto:png.alto};await compartirODescargar(png.blob,nombre('png'),compartir)}
      estado('');aviso(compartir?'📤 Listo para compartir':'⤓ Descargado',1500);
    }catch(e){estado('');aviso(e.message||'No se pudo exportar.')}
  }

  /* ---------- menús ---------- */
  async function menuMas(){
    const r=await menuAcciones({titulo:'Dibujo',opciones:[['imagen','🖼️ Insertar imagen'],['formula','Σ Insertar fórmula'],['fondo','📄 Fondo de la hoja'],...(d.fondo==='cartesiano'?[['fondoplano','⊹ Ajustar el plano de fondo']]:[]),['plantilla','🧩 Plantilla'],['capas','🗂️ Capas'],
      ['tapar','🙈 Tapar una parte'],['practica',practica?'🎓 Salir del modo práctica':'🎓 Modo práctica (tocar para ver)'],['ia','✨ Pasar todo a texto (IA)'],...(portapapeles.length?[['pegar','📥 Pegar']]:[]),
      ['exportar','⤓ Exportar o compartir'],['ajustes','⚙️ Ajustes del dibujo'],['borrar-todo','🗑️ Borrar todo','peligro-texto'],['descartar','✕ Descartar los cambios','peligro-texto']]});
    if(!r)return;
    if(r==='imagen'){const q=await menuAcciones({titulo:'Insertar imagen',opciones:[['camara','📷 Tomar foto'],['galeria','🖼️ De la galería']]});if(q==='camara')$('.dib-camara').click();if(q==='galeria')$('.dib-galeria').click()}
    if(r==='formula')editarFormula();
    if(r==='fondo'){const q=await menuAcciones({titulo:'Fondo de la hoja',opciones:FONDOS.map(([id,i,n])=>[id,`${i} ${n}${d.fondo===id?' ✓':''}`])});if(q){d.fondo=q;cambiado=true;pintarTodo();autoguardarYa()}}
    if(r==='fondoplano')abrirPanel('fondoPlano');
    if(r==='plantilla')elegirPlantilla(false);
    if(r==='capas')dialogoCapas();
    if(r==='tapar'){herrAntes=herr;herr='papel';botones();aviso('🙈 Arrastra sobre lo que quieres tapar.',2200)}
    if(r==='practica'){practica=!practica;revelados.clear();cambiado=true;pintarTodo();aviso(practica?'🎓 Modo práctica: toca un papel para ver lo que tapa.':'Modo práctica desactivado',2200)}
    if(r==='ia')aTexto();if(r==='pegar')pegar();
    if(r==='exportar'){const q=await menuAcciones({titulo:'Exportar',opciones:[['png','🖼️ PNG'],['png-sin','🖼️ PNG sin fondo'],['pdf','📄 PDF (por páginas)'],['compartir','📤 Compartir el PDF']]});
      if(q==='compartir')exportar('pdf',true);else if(q)exportar(q)}if(r==='png-sin')exportar('png-sin');if(r==='pdf')exportar('pdf');if(r==='compartir')exportar('pdf',true);
    if(r==='ajustes')dialogoAjustes();
    if(r==='borrar-todo')borrarTodo();
    if(r==='descartar'&&(!cambiado||await confirmar({titulo:'¿Descartar los cambios?',texto:'El dibujo vuelve a como estaba al abrirlo.',si:'Sí, descartar',peligro:true})))cerrar(false);
  }
  async function borrarTodo(){
    if(!objs.length)return;if(!(await confirmar({titulo:'¿Borrar todo el dibujo?',texto:'Puedes deshacerlo justo después.',si:'Sí, borrar todo',peligro:true})))return;
    aplicar([]);limpiarSel();avisoAccion('🗑️ Dibujo borrado','Deshacer',()=>deshacer(),8000);
  }
  function dialogo(titulo2,cuerpo,alCambiar){
    const m=document.createElement('div');m.className='modal-fondo';
    m.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="dd-t"><h2 id="dd-t" style="margin-top:0">${titulo2}</h2>${cuerpo}<div class="row" style="margin-top:12px"><button type="button" class="btn ancho" data-x>Listo</button></div></div>`;
    m.addEventListener('change',e=>alCambiar(e.target));m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))m.remove()});
    m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();m.remove()}});document.body.appendChild(m);m.querySelector('input,button').focus();
  }
  function dialogoCapas(){
    dialogo('🗂️ Capas',[['tinta','✏️ Tinta (plumas, textos y fórmulas)'],['resaltado','🖍️ Resaltado'],['fondo','🖼️ Fondo, imágenes y plantillas']].map(([c,n])=>`<label class="dib-check"><input type="checkbox" data-capa="${c}" ${d.capas[c]?'checked':''}> ${n}</label>`).join('')+'<p class="nota">Una capa oculta no se ve ni se borra por accidente.</p>',
      el=>{if(el.dataset.capa){d.capas[el.dataset.capa]=el.checked;cambiado=true;limpiarSel();pintarTodo()}});
  }
  function dialogoAjustes(){
    dialogo('⚙️ Ajustes del dibujo',`<div class="segmentos" role="radiogroup" aria-label="Tamaño de la hoja"><label><input type="radio" name="dm" value="crece" ${d.modo==='crece'?'checked':''}> Hoja que crece</label><label><input type="radio" name="dm" value="paginas" ${d.modo==='paginas'?'checked':''}> Páginas carta</label></div>
${[['inteligentes','Formas inteligentes (mantén quieto al final del trazo)'],['minimapa','Minimapa al moverte'],['soloLapiz','Con el lápiz, solo el lápiz dibuja (el dedo mueve)'],['avanzar','Escribir y avanzar: flecha → con la vista bloqueada']].map(([k2,n])=>`<label class="dib-check"><input type="checkbox" data-pref="${k2}" ${P[k2]?'checked':''}> ${n}</label>`).join('')}`,
      el=>{if(el.name==='dm'){d.modo=el.value;cambiado=true;version++;ajustar('ancho');pintarTodo()}if(el.dataset.pref){P[el.dataset.pref]=el.checked;guardarPrefs(P);botones()}});
  }
  function elegirPlantilla(inicio){
    return new Promise(res=>{
      const m=document.createElement('div');m.className='modal-fondo';
      m.innerHTML=`<div class="modal modal-ancho" role="dialog" aria-modal="true" aria-labelledby="dp-t"><h2 id="dp-t" style="margin-top:0">${inicio?'Nuevo dibujo':'🧩 Plantilla'}</h2>
<div class="dib-plantillas">${PLANTILLAS.map(([id,i,n])=>`<button type="button" data-pl="${id}"><span aria-hidden="true">${i}</span>${n}</button>`).join('')}</div>
${inicio?`<label class="dib-check"><input type="checkbox" id="dp-pag"> Páginas tamaño carta (en vez de una hoja que crece)</label>`:'<p class="nota">La plantilla se agrega a lo que ya tienes (Deshacer la quita).</p>'}
<div class="row" style="margin-top:8px"><button type="button" class="btn ghost ancho" data-x>${inicio?'Empezar en blanco':'Cancelar'}</button></div></div>`;
      const cerrar2=v=>{m.remove();res(v)};
      m.addEventListener('click',e=>{const b=e.target.closest('[data-pl]');if(b){const pag=m.querySelector('#dp-pag')?.checked;if(pag)d.modo='paginas';usarPlantilla(b.dataset.pl);cerrar2(true);return}if(e.target===m||e.target.closest('[data-x]')){if(m.querySelector('#dp-pag')?.checked){d.modo='paginas';ajustar('ancho')}cerrar2(false)}});
      m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar2(false)}});document.body.appendChild(m);m.querySelector('[data-pl]').focus();
    });
  }
  function usarPlantilla(id){
    const p=plantilla(id,anchoP()),dy=objs.length?(cajaDe(objs)?.[3]||0)+40:0;
    if(!objs.length||id==='blanco'||id==='cuadricula')d.fondo=p.fondo;
    aplicar([...objs,...p.objetos.map(o=>dy?transformar(o,mMover(0,dy),{mismoId:true}):o)]);ajustar('ancho');if(dy)irA({...vista,y:dy-20});
  }

  /* ---------- clics y teclas ---------- */
  f.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b||!f.contains(b))return;const a=b.dataset.d;
    if(b.dataset.herr){elegir(b.dataset.herr);return}
    if(a==='listo'||a==='cancelar'){cerrar(true);return}
    if(a==='deshacer'){deshacer();return}if(a==='rehacer'){rehacer();return}
    if(a==='bloquear'){bloquear(!bloqueado);return}
    if(a==='mano'){mano=!mano;botones();aviso(mano?'✋ Un dedo mueve el lienzo':'✏️ Un dedo dibuja',1200);return}
    if(a==='contraer'){P.contraida=!P.contraida;guardarPrefs(P);botones();return}
    if(a==='zoom'){const r=await menuAcciones({titulo:`Zoom: ${Math.round(vista.z*100)} %`,opciones:[['100','100 %'],['pantalla','Ajustar a la pantalla'],['ancho','Ajustar al ancho']]});if(r){if(bloqueado)bloquear(false);ajustar(r)}return}
    if(a==='mas'){menuMas();return}
    if(a==='avanzar'){avanzar();return}
    if(a==='opc-cerrar'){cerrarPanel();return}
    if(a==='fav-guardar'){const p=P.pluma,nombre2=`${PALETA.find(x=>x[1]===p.color)?.[0]||'Color'} ${p.ancho<=2?'fino':p.ancho<=3?'medio':'grueso'}`;P.favoritas=[{...p,nombre:nombre2},...P.favoritas.filter(x=>x.color!==p.color||x.ancho!==p.ancho||x.tipo!==p.tipo)].slice(0,4);guardarPrefs(P);botones();aviso(`★ «${nombre2}» guardada`,1400);return}
    if(a==='fav-quitar'){P.favoritas=[];guardarPrefs(P);botones();repintarPanel();return}
    if(a==='fav'){const x=P.favoritas[+b.dataset.fav];if(x){P.pluma={tipo:x.tipo,color:x.color,ancho:x.ancho};guardarPrefs(P);herr='pluma';cerrarPanel();botones();aviso(`✏️ ${x.nombre}`,900)}return}
    if(a==='borrar-todo'){cerrarPanel();borrarTodo();return}
    if(a==='pegar'){cerrarPanel();pegar();return}
    if(a==='regla'||a==='transp'){alternarGuia(a);return}
    if(a==='dos'){elegir('dosdedos');return}
    if(a==='plano-ajustes'){const pl=planoSel();if(pl)abrirPanelPlano(pl);return}
    if(a==='plano-agregar'||a==='pl-agregar'){const pl=planoSel()||planoDe(planoPanel);if(pl)agregarAlPlano(pl);return}
    if(a==='plano-fijar'){const pl=planoSel();if(pl){cambiarPlano(pl,{fijo:!pl.fijo},{fusionar:false});aviso(pl.fijo?'🔓 El plano se puede mover':'🔒 Plano fijo: escribe encima sin moverlo',1500)}return}
    if(a==='sel-soltar'){cambiarSel(o=>{if(!o.ancla)return o;const {ancla,...r}=o;return {...r,suelto:true}});aviso('⇱ Ya no se mueve con el plano',1300);return}
    if(a==='pl-ajustar'){const p=planoDe(planoPanel);if(p){const r=rangoDeObjetos(p,objs.filter(o=>o.ancla===p.pid));if(r){cambiarPlano(p,{...r,igual:false});repintarPanel()}else aviso('Todavía no hay nada dibujado en el plano.',1500)}return}
    if(b.dataset.plPreset){const p=planoDe(planoPanel),pr=PRESETS.find(x=>x[0]===b.dataset.plPreset);if(p&&pr){cambiarPlano(p,{igual:true,...pr[2]});repintarPanel()}return}
    if(b.dataset.plRejilla){const p=planoDe(planoPanel);if(p){cambiarPlano(p,{rejilla:b.dataset.plRejilla});repintarPanel()}return}
    if(b.dataset.plEstilo){const p=planoDe(planoPanel);if(p){const e2=b.dataset.plEstilo;cambiarPlano(p,{estilo:e2,...(e2==='cuadrante'?{xMin:Math.max(0,p.xMin),yMin:Math.max(0,p.yMin)}:{})});repintarPanel()}return}
    if(b.dataset.plColor){const p=planoDe(planoPanel);if(p){cambiarPlano(p,{color:b.dataset.plColor});repintarPanel()}return}
    if(b.dataset.plo){const p=planoDe(planoPanel),o=p?.objetos.find(x=>x.id===b.dataset.plo);if(o){await menuObjetoPlano(p,o);repintarPanel()}return}
    if(a==='fp-origen'){moverOrigen=true;cerrarPanel();aviso('📍 Toca (o arrastra) donde quieres el origen (0, 0).',2200);return}
    if(a==='fp-objeto'){fondoAObjeto();return}
    if(a==='fp-reset'){delete d.cartesiano;cambiado=true;version++;pintarTodo();autoguardarYa();repintarPanel();return}
    if(a==='dos-salir'){cerrarPanel();elegir('formas');return}
    if(a==='zoom-mas'||a==='zoom-menos'){if(bloqueado)bloquear(false);zoomEn(W/2,H/2,vista.z*(a==='zoom-mas'?1.25:.8));return}
    if(a==='dos-dejar'){const pl=medicion&&planoEn(objs,medicion.a[0],medicion.a[1]);
      if(pl){cambiarPlano(pl,{objetos:[...pl.objetos,{k:'medida',id:nuevoIdObj(),a:aPlanoDe(pl,medicion.a),b:aPlanoDe(pl,medicion.b),color:P.pluma.color}]},{fusionar:false});medicion=null;botones();pintarVivo();aviso('📌 Medida en el plano',1200);return}
      if(medicion){aplicar([...objs,...objetosMedida(medicion.a,medicion.b,d,{color:P.pluma.color,ancho:gruesoDos()})]);medicion=null;botones();pintarVivo();aviso('📌 Medida en la hoja',1200)}return}
    if(a==='dos-parabola'){parabolaEjemplo();return}
    if(a==='dos-plano'){d.fondo='cartesiano';cambiado=true;pintarTodo();autoguardarYa();repintarPanel();return}
    if(b.dataset.dosModo){P.dos.modo=b.dataset.dosModo;medicion=null;guardarPrefs(P);botones();repintarPanel();pintarVivo();return}
    if(b.dataset.dosMarco){P.dos.marco=b.dataset.dosMarco;guardarPrefs(P);repintarPanel();return}
    if(b.dataset.dosSim){P.dos.simetria=b.dataset.dosSim;guardarPrefs(P);repintarPanel();return}
    if(b.dataset.dosColor2){P.dos.color2=b.dataset.dosColor2;guardarPrefs(P);repintarPanel();return}
    if(a==='formula'){cerrarPanel();editarFormula();return}
    if(a==='sel-borrar'){borrarSel();return}if(a==='sel-copiar'){copiarSel();return}
    if(a==='sel-dup'){const l=elegidos();pegar(24,24,l);return}
    if(a==='sel-ia'){aTexto();return}
    if(a==='sel-editar'){const o=elegidos()[0];limpiarSel();if(o.t==='formula')editarFormula(o);else editarTexto(o);return}
    if(a==='sel-fijar'){const o=elegidos()[0];cambiarSel(x=>({...x,fija:!o.fija}));if(!o.fija){limpiarSel();aviso('📍 Imagen fija: ya no se mueve al escribir encima. Con un toque largo la vuelves a elegir.',2600)}return}
    if(a==='sel-recortar'){recortarImagen(elegidos()[0]);return}
    if(a==='sel-color'){const r=await menuAcciones({titulo:'Color',opciones:PALETA.map(([n,c])=>[c,`<span class="dib-punto" style="--c:${c}"></span> ${n}`])});if(r)cambiarSel(o=>o.t==='trazo'||o.t==='texto'||o.t==='formula'?{...o,color:r}:o);return}
    if(a==='sel-grosor'){const r=await menuAcciones({titulo:'Grosor',opciones:[['.5','Más fino'],['.75','Un poco más fino'],['1.5','Un poco más grueso'],['2','Más grueso']]});if(r)cambiarSel(o=>o.t==='trazo'?{...o,ancho:Math.max(.5,Math.min(60,o.ancho*+r))}:o);return}
    // opciones de herramientas
    if(b.dataset.tipo){P.pluma.tipo=b.dataset.tipo;herr='pluma';guardarPrefs(P);botones();repintarPanel();return}
    if(b.dataset.grosor){const h=panel;if(sel)cambiarSel(o=>o.t==='trazo'?{...o,ancho:+b.dataset.grosor}:o);else{P[h].ancho=+b.dataset.grosor;guardarPrefs(P);repintarPanel()}return}
    if(b.dataset.color){usarColor(b.dataset.color);return}
    if(b.dataset.goma){P.borrador.modo=b.dataset.goma;herr='borrador';guardarPrefs(P);botones();repintarPanel();return}
    if(b.dataset.forma){P.forma=b.dataset.forma;herr='formas';guardarPrefs(P);botones();cerrarPanel();aviso(`📐 ${FORMAS.find(x=>x[0]===P.forma)[2]}: arrastra en el lienzo.`,1600);return}
    if(b.dataset.tam){P.texto.tam=+b.dataset.tam;guardarPrefs(P);repintarPanel();return}
  });
  f.addEventListener('input',e=>{const t=e.target;
    if(t.dataset.rango!==undefined&&panel){P[panel].ancho=+t.value;guardarPrefs(P)}
    if(t.dataset.gomaTam!==undefined){P.borrador.tam=+t.value;guardarPrefs(P)}
    if(t.dataset.dosEsp!==undefined){P.dos.espaciado=+t.value;guardarPrefs(P)}
    if(t.dataset.pl&&t.tagName!=='SELECT')entradaPlano(t);
    if(t.dataset.fp==='unidad')fondoPlano({unidad:+t.value});
  });
  f.addEventListener('change',e=>{const t=e.target;
    if(t.dataset.propio!==undefined)usarColor(t.value);
    if(t.dataset.recta!==undefined){P.resaltador.recta=t.checked;guardarPrefs(P)}
    if(t.dataset.soloRes!==undefined){P.borrador.soloRes=t.checked;guardarPrefs(P)}
    if(t.dataset.inteligentes!==undefined){P.inteligentes=t.checked;guardarPrefs(P)}
    if(t.dataset.dosAjustar!==undefined){P.dos.ajustar=t.checked;guardarPrefs(P)}
    if(t.dataset.pl&&t.tagName==='SELECT')entradaPlano(t);
    if(t.dataset.plb){const p=planoDe(planoPanel);if(p)cambiarPlano(p,{[t.dataset.plb]:t.checked})}
    if(t.dataset.prefPlano!==undefined){P.planoAjustar=t.checked;guardarPrefs(P)}
    if(t.dataset.fp==='paso')fondoPlano({paso:+t.value});
    if(t.dataset.dosDegradado!==undefined){P.dos.degradado=t.checked;guardarPrefs(P);repintarPanel()}
    if(t.dataset.filas!==undefined){P.filas=Math.max(1,Math.min(20,+t.value||3));guardarPrefs(P)}
    if(t.dataset.cols!==undefined){P.cols=Math.max(1,Math.min(12,+t.value||3));guardarPrefs(P)}
    if(t.classList.contains('dib-camara')||t.classList.contains('dib-galeria')){insertarImagen(t.files?.[0]);t.value=''}
  });
  // → escribir y avanzar: a la derecha; en el borde, al inicio del renglón siguiente
  function avanzar(){
    const paso=W/vista.z*.6,limite=Math.max(anchoP(),region(dd())[2]);
    if(vista.x+W/vista.z+1>=limite)vista=limitar({...vista,x:-8/vista.z,y:vista.y+H/vista.z*.34});
    else vista=limitar({...vista,x:Math.min(vista.x+paso,limite-W/vista.z+8/vista.z)});
    pintarTodo();verMapa();
  }
  function tecla(e){
    if(cerrado||document.querySelector('.modal-fondo'))return;
    if(e.target.closest?.('.dib-txt'))return;
    const ctrl=e.ctrlKey||e.metaKey,kk=e.key.toLowerCase();
    if(ctrl&&kk==='z'){e.preventDefault();e.stopPropagation();e.shiftKey?rehacer():deshacer();return}
    if(ctrl&&kk==='y'){e.preventDefault();e.stopPropagation();rehacer();return}
    if(ctrl&&kk==='c'&&sel){e.preventDefault();copiarSel();return}
    if(ctrl&&kk==='v'){e.preventDefault();pegar();return}
    if(ctrl&&kk==='d'&&sel){e.preventDefault();pegar(24,24,elegidos());return}
    if((e.key==='Delete'||e.key==='Backspace')&&sel){e.preventDefault();borrarSel();return}
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(panel)cerrarPanel();else if(sel)limpiarSel();else cerrar(true);return}
    if(ctrl||e.altKey)return;
    if(e.key===' '&&!espacio){e.preventDefault();espacio=true;botones();return}
    if(e.key==='0'){e.preventDefault();ajustar('pantalla');return}
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomEn(W/2,H/2,vista.z*1.25);return}
    if(e.key==='-'){e.preventDefault();zoomEn(W/2,H/2,vista.z/1.25);return}
    const atajo={p:'pluma',r:'resaltador',e:'borrador',l:'lazo',f:'formas',t:'texto',d:'dosdedos'}[kk];if(atajo){e.preventDefault();elegir(atajo)}
  }
  const teclaArriba=e=>{if(e.key===' '){espacio=false;botones()}};
  function zoomEn(sx,sy,z){if(bloqueado)return;const w=aMundo(sx,sy),zz=Math.min(ZOOM_MAX,Math.max(ZOOM_MIN,z));vista=limitar({z:zz,x:w[0]-sx/zz,y:w[1]-sy/zz});pintarTodo();mostrarZoom();verMapa()}
  area.addEventListener('wheel',e=>{e.preventDefault();if(bloqueado)return;
    if(e.ctrlKey||e.metaKey)zoomEn(...posDe(e),vista.z*Math.exp(-e.deltaY*.0025));
    else{vista=limitar({...vista,x:vista.x+(e.shiftKey?e.deltaY:e.deltaX)/vista.z,y:vista.y+(e.shiftKey?0:e.deltaY)/vista.z});pintarTodo();verMapa()}},{passive:false});
  cV.addEventListener('pointerdown',abajo);cV.addEventListener('pointermove',mover);cV.addEventListener('pointerup',arriba);cV.addEventListener('pointercancel',arriba);
  const sinMenu=e=>e.preventDefault();cV.addEventListener('contextmenu',sinMenu);area.addEventListener('selectstart',sinMenu);
  addEventListener('keydown',tecla,true);addEventListener('keyup',teclaArriba,true);
  const mq=matchMedia('(prefers-color-scheme: dark)'),alTema=()=>{oscuro=esOscuro();formulas.clear();pintarTodo()};mq.addEventListener?.('change',alTema);

  /* ---------- cerrar ---------- */
  async function cerrar(guardar){
    if(cerrado)return;
    if(editando)terminarTexto();
    cerrado=true;clearTimeout(autoTimer);
    if(marca)await quitarMarca();
    ro.disconnect();removeEventListener('keydown',tecla,true);removeEventListener('keyup',teclaArriba,true);document.removeEventListener('visibilitychange',alOcultar);mq.removeEventListener?.('change',alTema);
    let png=null,final=paraGuardar(estadoActual());
    if(!guardar){final=JSON.parse(original);cambiado=false}
    const vistaCambio=guardar&&JSON.stringify({v:final.vista,b:final.bloqueado})!==JSON.stringify({v:JSON.parse(original).vista,b:JSON.parse(original).bloqueado});
    if(guardar&&cambiado&&final.objetos.length){estado('Guardando…');try{png=await renderRegion(region(final),{fondo:true})}catch(e){png=null}}
    f.remove();document.body.classList.remove('con-dibujo');
    resolver({dibujo:final,cambiado:guardar&&cambiado,vistaCambio,png});
  }
  // para las pruebas (npm run dibujo): estado del editor sin tocar nada
  f.__dib={get objs(){return objs},get vista(){return {...vista}},get bloqueado(){return bloqueado},get temporal(){return temporal},get sel(){return sel?[...sel.ids]:[]},
    get hist(){return hist.length},manijas:()=>sel?.manijas||null,get herr(){return herr},dos:()=>({...P.dos,medicion:medicion?.res||null}),plano:()=>planoSel(),cambiarPlano:(pid,c)=>cambiarPlano(planoDe(pid),c,{fusionar:false}),
    modoPlano:(pid,k)=>{modoPlano={k,pid};herr='plano';limpiarSel();botones()},agregarObjetoPlano:(pid,o)=>conObjeto(planoDe(pid),{id:nuevoIdObj(),color:'#2563eb',...o}),get lento(){return lento},regla:()=>regla,transp:()=>transp,cerrar,pintarAhora:()=>{sucioT=true;sucioV=true;cuadroAhora()},estado:()=>estadoActual(),ajustar,irA};

  botones();medir();
  if(nuevo&&!objs.length)elegirPlantilla(true);
  else if(bloqueado)aviso('🔒 La vista está bloqueada. Toca 🔒 o mantén 2 dedos para moverte.',2200);
  });
}

/* Fórmula: LaTeX con los símbolos del teclado y la vista previa */
export function pedirFormula(valor=''){
  return new Promise(res=>{
    const m=document.createElement('div');m.className='modal-fondo';
    m.innerHTML=`<form class="modal" role="dialog" aria-modal="true" aria-labelledby="pf-t"><h2 id="pf-t" style="margin-top:0">Σ Fórmula</h2>
<label class="campo">LaTeX<input id="pf-v" autocomplete="off" spellcheck="false" value="${esc(valor)}" placeholder="x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"></label>
<div class="dib-simbolos" role="group" aria-label="Símbolos">${SIMBOLOS.map(([v],i)=>`<button type="button" data-s="${i}" aria-label="Escribir ${esc(v)}">${esc(v)}</button>`).join('')}</div>
<div class="dib-previa nota-render" aria-live="polite"></div>
<div class="row"><button type="button" class="btn ghost" data-r="0">Cancelar</button><button type="submit" class="btn">Insertar</button></div></form>`;
    const inp=m.querySelector('#pf-v'),pv=m.querySelector('.dib-previa'),previa=()=>{pv.innerHTML=inp.value.trim()?tex(inp.value,true):'<p class="nota">La fórmula se verá aquí.</p>'};
    const cerrar=v=>{m.remove();res(v)};
    m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.dataset.r==='0'){cerrar(null);return}
      if(b.dataset.s!==undefined){const [,t,atras]=SIMBOLOS[+b.dataset.s],a=inp.selectionStart??inp.value.length,z=inp.selectionEnd??a;
        inp.value=inp.value.slice(0,a)+t+inp.value.slice(z);const p=a+t.length-atras;inp.focus();inp.setSelectionRange(p,p);previa()}});
    m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}});
    m.querySelector('form').addEventListener('submit',e=>{e.preventDefault();cerrar(inp.value)});
    inp.addEventListener('input',previa);previa();document.body.appendChild(m);inp.focus();
  });
}
