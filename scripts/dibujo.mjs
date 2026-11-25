/* npm run dibujo: el ✏️ editor de dibujo del cuaderno (PROMPT-DIBUJO) en el navegador, con punteros simulados (varios dedos,
   S Pen y ratón):
   - teléfono 360 × 800 (dpr 2.625): dibujar con 1 dedo, zoom y mover con 2 (el trazo queda en su lugar del lienzo), tocar con 2
     dedos deshace y con 3 rehace, doble toque con 2 ajusta; 🔒 bloquear (2 dedos no mueven), desbloqueo temporal manteniendo 2
     dedos (se vuelve a bloquear al soltar) y con el botón; lazo (seleccionar, mover, escalar, color); formas inteligentes (una
     línea temblorosa se endereza, un círculo se reconoce); borrador de trazo y de precisión; plano cartesiano; fondos de
     cuadrícula y plano; plantillas; exportar PNG y PDF; guardar en la nota y volver a abrirlo (vista y bloqueo recordados);
     Atrás cierra primero las opciones y luego el dibujo; la barra contraída; S Pen (el dedo mueve); sin scroll de lado y
     toques ≥ 44 px;
   - dibujos viejos: el formato de PROMPT-NOTAS (trazos) se migra y el de antes (solo PNG) queda como imagen para escribir encima;
   - sincronización con el Supabase simulado: el dibujo (vectores) llega igual al otro teléfono;
   - rendimiento: 2000 trazos y el zoom sigue fluido (tiempo por cuadro);
   - ✌️ Dos dedos: apagada no dibuja; regla (1 línea), compás (radio y arco), medir (m = 2 de (1, 2) a (3, 6)), marco,
     barrido (espaciado, un paso para deshacer), ratón y el ejemplo de la parábola; el ✏️ Borrador viejo no une los dedos;
   - 📈 plano editable: insertar, anclar un trazo, rango 0–20, asa de tamaño, mover, ⚙️ Ajustes en un paso, y = x² − 4 (corta
     en ±2), 1/x sin línea vertical, punto A(2, 3) que se arrastra y la migración del plano viejo;
   - tablet (barra a un lado) y laptop (barra arriba, Ctrl + rueda, espacio + arrastrar, «0»).
   Capturas en claro y oscuro en capturas/dibujo/. Compila, levanta `vite preview` en el puerto 4799 y lo apaga al terminar. */
import {existsSync,mkdirSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4799,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const CAP=join(raiz,'capturas','dibujo');mkdirSync(CAP,{recursive:true});
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};

/* ---------- sincronización (sin navegador): el dibujo llega igual al otro teléfono ---------- */
{
  console.log('--- sincronización con el Supabase simulado');
  const imp=p=>import(pathToFileURL(join(raiz,...p.split('/'))).href);
  const {supabaseSimulado}=await imp('scripts/sync-pruebas.mjs'),{crearMotor}=await imp('src/nucleo/sync/motor.js'),{fusionarProgreso}=await imp('src/nucleo/sync/fusionar.js'),P=await imp('src/nucleo/progreso.js');
  const M=await imp('src/nucleo/dibujo/modelo.js'),sim=supabaseSimulado();
  const tel=(equipo,archivos=[],notas=[])=>{
    const L={p:P.normalizar({v:11}),notas:new Map(notas.map(n=>[n.id,n])),archivos:new Map(archivos.map(a=>[a.id,a])),lap:{},est:null};
    const local={progreso:()=>L.p,combinarProgreso:(rem,el,lap)=>{L.p=fusionarProgreso(L.p,P.normalizar(rem),{yo:equipo,el,borradas:lap})},lapidas:()=>({...L.lap}),ponerLapidas:x=>{L.lap={...x}},
      notas:async()=>[...L.notas.values()],guardarNota:async n=>{L.notas.set(n.id,n)},borrarNota:async id=>{L.notas.delete(id)},
      archivos:async()=>[...L.archivos.values()].map(({blob,...m})=>m),leerArchivo:async id=>L.archivos.get(id)?.blob,guardarArchivo:async(m,blob)=>{L.archivos.set(m.id,{...JSON.parse(JSON.stringify(m)),blob})},borrarArchivo:async id=>{L.archivos.delete(id)},
      materias:async()=>[],guardarMateria:async()=>{},borrarMateria:async()=>{},generados:async()=>[],guardarGenerado:async()=>{},borrarGenerado:async()=>{},
      estado:()=>L.est&&JSON.parse(JSON.stringify(L.est)),ponerEstado:s=>{L.est=JSON.parse(JSON.stringify(s))},nombre:()=>'',ponerNombre:()=>{}};
    L.motor=crearMotor({api:sim.api,local,sesion:async()=>({token:'tok-ana',uid:'ana'}),equipo,nombreEquipo:()=>equipo});return L;
  };
  const d=M.nuevoDibujo({ancho:400});d.objetos=[...M.formaDirecta('plano',[20,20],[300,260]),{t:'trazo',id:'t1',herr:'pluma',tipo:'fuente',vari:true,color:'#2563eb',ancho:3,pts:[[1,2,.3],[40,50,.8]]}];
  d.bloqueado=true;d.vista={x:10,y:20,z:2};d.historial=[M.diferencia([],d.objetos)];
  const meta={id:'dib1',nota:'n1',tipo:'image/png',ancho:800,alto:600,creada:1,dibujo:M.paraGuardar(d)};
  const A=tel('A',[{...meta,blob:{size:3000,type:'image/png'}}],[{id:'n1',titulo:'Con dibujo',cuerpo:'![dibujo](img:dib1)',editada:5}]),B=tel('B');
  await A.motor.sincronizar();await B.motor.sincronizar();
  const b=B.archivos.get('dib1');
  check(!!b?.blob&&JSON.stringify(b.dibujo)===JSON.stringify(meta.dibujo),'sincronizar: el dibujo (vectores, vista, bloqueo e historial) llega igual al otro teléfono');
  check(M.migrarDibujo(b).objetos.length===d.objetos.length,'sincronizar: el otro teléfono lo abre con todos sus objetos');
}

/* ---------- navegador ---------- */
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const nav=await chromium.launch({executablePath:ruta});

// Punteros sintéticos sobre el lienzo. pasos: [[tipo evento, id, x, y, {pointerType, espera, pressure, buttons}]] (x, y relativos al lienzo)
const gesto=(p,pasos)=>p.evaluate(async pasos=>{
  const cv=document.querySelector('.dib-cvivo'),r=cv.getBoundingClientRect(),dormir=ms=>new Promise(s=>setTimeout(s,ms));
  for(const [t,id,x,y,o={}] of pasos){
    if(t==='espera'){await dormir(id);continue}
    const tipo=o.pointerType||'touch';
    cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:tipo,isPrimary:id===1,pressure:t==='pointerup'?0:o.pressure??.5,
      buttons:t==='pointerup'?0:o.buttons??1,button:t==='pointermove'?-1:o.button??0,clientX:r.left+x,clientY:r.top+y}));
    if(o.espera)await dormir(o.espera);
  }
},pasos);
const linea=(id,x0,y0,x1,y1,{n=12,tipo='touch',espera=0,final=0,pressure}={})=>[['pointerdown',id,x0,y0,{pointerType:tipo,pressure}],
  ...Array.from({length:n},(_,i)=>['pointermove',id,x0+(x1-x0)*(i+1)/n,y0+(y1-y0)*(i+1)/n,{pointerType:tipo,espera,pressure}]),...(final?[['espera',final]]:[]),['pointerup',id,x1,y1,{pointerType:tipo}]];
// dos dedos: de (a, b) a (a2, b2) en n pasos; manteniendo `antes` ms quietos
const dosDedos=(a,b,a2,b2,{n=10,antes=0,espera=8}={})=>[['pointerdown',1,...a],['pointerdown',2,...b],...(antes?[['espera',antes]]:[]),
  ...Array.from({length:n},(_,i)=>{const t=(i+1)/n;return [['pointermove',1,a[0]+(a2[0]-a[0])*t,a[1]+(a2[1]-a[1])*t,{espera}],['pointermove',2,b[0]+(b2[0]-b[0])*t,b[1]+(b2[1]-b[1])*t]]}).flat(),
  ['pointerup',1,...a2],['pointerup',2,...b2]];
const toqueDedos=(n,x=180,y=300)=>[...Array.from({length:n},(_,i)=>['pointerdown',i+1,x+i*40,y]),['espera',60],...Array.from({length:n},(_,i)=>['pointerup',i+1,x+i*40,y])];
const D=(p,fn='')=>p.evaluate(fn=>{const d=document.querySelector('.dib')?.__dib;if(!d)return null;return fn?(new Function('d',`return ${fn}`))(d):{n:d.objs.length,vista:d.vista,bloqueado:d.bloqueado,temporal:d.temporal,sel:d.sel.length,herr:d.herr}},fn);
const pintar=p=>p.evaluate(()=>document.querySelector('.dib').__dib.pintarAhora());
// píxeles de tinta en una zona del canvas de la tinta (px CSS del lienzo)
const tinta=(p,x0=0,y0=0,x1=9999,y1=9999)=>p.evaluate(([x0,y0,x1,y1])=>{const cv=document.querySelector('.dib-ctinta'),k=cv.width/cv.clientWidth;
  const X0=Math.max(0,Math.round(x0*k)),Y0=Math.max(0,Math.round(y0*k)),X1=Math.min(cv.width,Math.round(x1*k)),Y1=Math.min(cv.height,Math.round(y1*k));if(X1<=X0||Y1<=Y0)return 0;
  const d=cv.getContext('2d').getImageData(X0,Y0,X1-X0,Y1-Y0).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>60)n++;return n},[x0,y0,x1,y1]);
const esperar=ms=>new Promise(r=>setTimeout(r,ms));
async function diseno(p,que){
  const r=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'};
    const panel=document.querySelector('.dib-opc:not([hidden])')?.getBoundingClientRect(),dentro=e=>{if(!panel||!e.closest('.dib-opc'))return true;const r=e.getBoundingClientRect();return r.top>=panel.top-1&&r.bottom<=panel.bottom+1};
    const bs=[...document.querySelectorAll('.dib button,.dib input:not([type=file]):not([type=range]):not([type=checkbox]):not([type=radio]),.dib label.dib-color,.modal button')].filter(e=>vis(e)&&!e.hidden&&!e.closest('[hidden]')&&dentro(e));
    const chicos=bs.filter(e=>{const r=e.getBoundingClientRect();return r.height<43.5||r.width<43.5}).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,22));
    const fuera=bs.filter(e=>{const r=e.getBoundingClientRect();const fila=e.closest('.dib-fila');if(fila){const f=fila.getBoundingClientRect();return false}return r.right>innerWidth+1||r.left<-1}).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,22));
    const textos=[...document.querySelectorAll('.dib-cab *,.dib-barra *,.dib-opc *,.dib-selbar *')].filter(e=>vis(e)&&dentro(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
    const enc=[];for(let i=0;i<textos.length;i++)for(let j=i+1;j<textos.length;j++){const a=textos[i],b=textos[j];if(a.contains(b)||b.contains(a))continue;const r=a.getBoundingClientRect(),s=b.getBoundingClientRect();
      if(Math.min(r.right,s.right)-Math.max(r.left,s.left)>3&&Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top)>3)enc.push(`«${a.textContent.trim().slice(0,12)}»/«${b.textContent.trim().slice(0,12)}»`)}
    return {scroll:document.documentElement.scrollWidth>innerWidth+1,chicos,fuera,enc}});
  check(!r.scroll&&!r.fuera.length,`${que}: sin scroll de lado ni botones fuera de la pantalla${r.fuera.length?' — '+r.fuera.join(', '):''}`);
  check(!r.chicos.length,`${que}: toques de 44 px o más${r.chicos.length?' — '+r.chicos.join(', '):''}`);
  check(!r.enc.length,`${que}: nada encimado${r.enc.length?' — '+r.enc.slice(0,3).join(', '):''}`);
}
async function abrirNuevo(p,{plantilla=null}={}){
  await p.goto(BASE+'#notas');await p.waitForTimeout(700);
  await p.click('#nota-nueva-vacia, #nota-nueva');await p.waitForTimeout(700);
  await p.click('[data-fmt="imagen"]');await p.waitForTimeout(250);await p.click('.modal [data-r="dibujo"]');await p.waitForTimeout(700);
  if(plantilla)await p.click(`.modal [data-pl="${plantilla}"]`);else await p.click('.modal [data-x]');
  await p.waitForTimeout(400);
}
const idNota=p=>decodeURIComponent(new URL(p.url()).hash.slice(1)).split('/')[2];
const leerDb=(p,fn,arg)=>p.evaluate(async([fn,arg])=>{
  const d=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const tx=(al,modo,g)=>new Promise((res,rej)=>{const t=d.transaction(al,modo),s=t.objectStore(al);let out;const r=g(s);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)});
  const out=await (new Function('tx','arg',`return (${fn})(tx,arg)`))(tx,arg);d.close();return out;
},[fn.toString(),arg]);
const nuevoContexto=async(opc,{oscuro=false}={})=>{const ctx=await nav.newContext({...opc,colorScheme:oscuro?'dark':'light',acceptDownloads:true});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});return ctx};

try{
/* ================= teléfono ================= */
{
  console.log('--- teléfono 360 × 800 (dpr 2.625)');
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#notas');await p.waitForTimeout(700);
  await p.click('#nota-nueva-vacia');await p.waitForTimeout(700);
  await p.fill('#nota-titulo','Física: tiro parabólico');await p.waitForTimeout(200);
  await p.click('[data-fmt="imagen"]');await p.waitForTimeout(250);await p.click('.modal [data-r="dibujo"]');await p.waitForTimeout(700);
  check(await p.locator('.dib').count()===1&&await p.locator('.modal .dib-plantillas [data-pl]').count()===8,'abrir: pantalla completa con las 8 plantillas al crear');
  await p.screenshot({path:join(CAP,'plantillas-claro.png')});
  await diseno(p,'plantillas (360)');
  await p.click('.modal [data-x]');await p.waitForTimeout(300);
  await diseno(p,'editor (360)');
  const box=await p.locator('.dib-cvivo').boundingBox();
  check(box.width===360&&box.height>560,`el lienzo usa casi toda la pantalla (${Math.round(box.width)} × ${Math.round(box.height)})`);
  // 1 dedo dibuja
  await gesto(p,linea(1,60,120,260,160,{n:14,espera:6}));await pintar(p);
  let s=await D(p);check(s.n===1&&await tinta(p,50,100,280,180)>200,'1 dedo dibuja');
  const pts0=await D(p,'d.objs[0].pts.slice(0,3)');
  // 2 dedos: pellizcar para acercar (centrado entre los dedos) y arrastrar para mover
  const z0=s.vista.z;
  await gesto(p,dosDedos([140,300],[220,300],[100,300],[260,300],{n:12}));await pintar(p);
  s=await D(p);check(Math.abs(s.vista.z/z0-2)<.05,`2 dedos: zoom ×2 (de ${Math.round(z0*100)} % a ${Math.round(s.vista.z*100)} %)`);
  check(/^\d+ %$/.test(await p.textContent('.dib-zoom'))&&(await p.textContent('.dib-zoom')).startsWith(String(Math.round(s.vista.z*100))),'indicador del zoom');
  const v1=s.vista;await gesto(p,dosDedos([140,300],[220,300],[100,360],[180,360],{n:10}));s=await D(p);
  check(s.vista.x>v1.x+5&&s.vista.y<v1.y-5&&Math.abs(s.vista.z-v1.z)<.01,'2 dedos: arrastrar mueve el lienzo');
  check(JSON.stringify(await D(p,'d.objs[0].pts.slice(0,3)'))===JSON.stringify(pts0)&&s.n===1,'zoom y mover: el trazo queda igual en el lienzo (no se dibuja nada)');
  // el trazo sale donde corresponde con el zoom: su punto medio en la pantalla
  const enPantalla=await D(p,'(()=>{const o=d.objs[0],q=o.pts[Math.floor(o.pts.length/2)],v=d.vista;return [(q[0]-v.x)*v.z,(q[1]-v.y)*v.z]})()');
  await pintar(p);check(await tinta(p,enPantalla[0]-6,enPantalla[1]-6,enPantalla[0]+6,enPantalla[1]+6)>10,'con zoom, la tinta está donde dice el lienzo (nítida, se vuelve a pintar)');
  await p.screenshot({path:join(CAP,'zoom-claro.png')});
  // 2 dedos tocar: deshacer; 3 dedos: rehacer; doble toque con 2: ajustar
  await gesto(p,toqueDedos(2));check((await D(p)).n===0,'tocar con 2 dedos deshace');
  await gesto(p,toqueDedos(3));check((await D(p)).n===1,'tocar con 3 dedos rehace');
  await gesto(p,[...toqueDedos(2),['espera',90],...toqueDedos(2)]);s=await D(p);
  check(s.n===1&&Math.abs(s.vista.z-1)<.02,`doble toque con 2 dedos: 100 % sin perder el trazo (${Math.round(s.vista.z*100)} %, ${s.n} trazos)`);
  await esperar(450);await gesto(p,[...toqueDedos(2),['espera',90],...toqueDedos(2)]);s=await D(p);check(s.n===1&&Math.abs(s.vista.z-1)>.05,'otro doble toque: toda la hoja en la pantalla');
  // 🔒 bloquear
  await esperar(450);
  await p.click('[data-d="bloquear"]');s=await D(p);const vb=s.vista;
  check(s.bloqueado&&await p.getAttribute('[data-d="bloquear"]','aria-pressed')==='true'&&await p.evaluate(()=>document.querySelector('.dib-area').classList.contains('bloqueada')),'🔒 bloquear: el botón y el borde del lienzo lo muestran');
  await gesto(p,dosDedos([140,300],[220,300],[60,240],[300,380],{n:12}));s=await D(p);
  check(JSON.stringify(s.vista)===JSON.stringify(vb),'bloqueado: 2 dedos no mueven ni hacen zoom');
  await gesto(p,linea(1,60,420,240,440,{n:10}));check((await D(p)).n===2&&JSON.stringify((await D(p)).vista)===JSON.stringify(vb),'bloqueado: 1 dedo escribe y la hoja no se mueve');
  await p.screenshot({path:join(CAP,'bloqueado-claro.png')});
  // mantener 2 dedos medio segundo: se desbloquea mientras se mueve y se vuelve a bloquear al soltar
  await p.evaluate(()=>{window.__temporal=false;const d=document.querySelector('.dib').__dib;window.__vigila=setInterval(()=>{if(d.temporal)window.__temporal=true},20)});
  await gesto(p,dosDedos([140,300],[220,300],[100,360],[180,360],{n:10,antes:650,espera:15}));s=await D(p);
  check(await p.evaluate(()=>window.__temporal)&&s.vista.y<vb.y-5,'mantener 2 dedos: se desbloquea mientras los mueves');
  check(s.bloqueado&&!s.temporal,'al soltar se vuelve a bloquear solo, en la nueva posición');
  await gesto(p,toqueDedos(2));check((await D(p)).n===1,'bloqueado: tocar con 2 dedos sigue deshaciendo');
  await gesto(p,toqueDedos(3));
  await p.click('[data-d="bloquear"]');check(!(await D(p)).bloqueado,'🔓 desbloquear con un toque');
  // lazo: rodear, mover, escalar y cambiar el color
  await p.evaluate(()=>document.querySelector('.dib').__dib.ajustar('pantalla'));await p.click('[data-herr="lazo"]');
  const c0=await D(p,'(()=>{const o=d.objs[0];let a=1e9,b=1e9,c=-1e9,e=-1e9;for(const q of o.pts){a=Math.min(a,q[0]);b=Math.min(b,q[1]);c=Math.max(c,q[0]);e=Math.max(e,q[1])}const v=d.vista;return [(a-v.x)*v.z,(b-v.y)*v.z,(c-v.x)*v.z,(e-v.y)*v.z]})()');
  const [lx0,ly0,lx1,ly1]=[c0[0]-20,c0[1]-20,c0[2]+20,c0[3]+20];
  await gesto(p,[['pointerdown',1,lx0,ly0],...[[lx1,ly0],[lx1,ly1],[lx0,ly1],[lx0,ly0+2]].flatMap(q=>Array.from({length:6},(_,i)=>['pointermove',1,q[0],q[1]])),['pointerup',1,lx0,ly0+2]]);
  s=await D(p);check(s.sel===1&&await p.locator('.dib-selbar:not([hidden])').count()===1,'lazo: rodear selecciona el trazo y aparece su barra');
  await p.screenshot({path:join(CAP,'lazo-claro.png')});await diseno(p,'lazo (360)');
  const antes=await D(p,'d.objs.find(o=>o.id===d.sel[0]).pts[0]');const cx=(c0[0]+c0[2])/2,cy=(c0[1]+c0[3])/2;
  await gesto(p,linea(1,cx,cy,cx+30,cy+40,{n:6}));
  const desp=await D(p,'d.objs.find(o=>o.id===d.sel[0]).pts[0]'),z=(await D(p)).vista.z;
  check(Math.abs((desp[0]-antes[0])*z-30)<2&&Math.abs((desp[1]-antes[1])*z-40)<2,'lazo: arrastrar mueve lo seleccionado');
  const anchoAntes=await D(p,'(()=>{const o=d.objs.find(o=>o.id===d.sel[0]);return Math.max(...o.pts.map(q=>q[0]))-Math.min(...o.pts.map(q=>q[0]))})()');
  await pintar(p);const esc=await D(p,'d.manijas().escalar');
  await gesto(p,linea(1,esc[0],esc[1],esc[0]+60,esc[1]+20,{n:6}));
  const anchoDespues=await D(p,'(()=>{const o=d.objs.find(o=>o.id===d.sel[0]);return Math.max(...o.pts.map(q=>q[0]))-Math.min(...o.pts.map(q=>q[0]))})()');
  check(anchoDespues>anchoAntes*1.15,`lazo: la manija escala con proporción (${Math.round(anchoAntes)} → ${Math.round(anchoDespues)})`);
  await p.click('[data-d="sel-color"]');await p.waitForTimeout(250);await p.click('.modal [data-r="#dc2626"]');await p.waitForTimeout(200);
  check(await D(p,'d.objs.find(o=>o.id===d.sel[0])?.color')==='#dc2626','lazo: cambiar el color');
  // Atrás: primero quita la selección, el dibujo sigue abierto
  await p.goBack();await p.waitForTimeout(400);
  check((await D(p)).sel===0&&await p.locator('.dib').count()===1,'Atrás: primero quita la selección (el dibujo sigue abierto)');
  // formas inteligentes: una línea temblorosa (mantener al final) se endereza y un círculo se reconoce
  await p.click('[data-herr="pluma"]');
  const temb=[['pointerdown',1,40,520],...Array.from({length:24},(_,i)=>['pointermove',1,40+i*11,520+Math.sin(i*1.9)*4+i*1.2,{espera:6}]),['espera',650],['pointerup',1,304,548]];
  await gesto(p,temb);let u=await D(p,'d.objs[d.objs.length-1]');
  check(u.forma==='linea'&&u.pts.length===2,`forma inteligente: la línea temblorosa se endereza (${u.forma||'nada'})`);
  const circ=[['pointerdown',1,260,620],...Array.from({length:40},(_,i)=>{const a=(i+1)/40*Math.PI*2;return ['pointermove',1,200+60*Math.cos(a)+Math.sin(i)*2,620+60*Math.sin(a),{espera:5}]}),['espera',650],['pointerup',1,260,621]];
  await gesto(p,circ);u=await D(p,'d.objs[d.objs.length-1]');check(u.forma==='circulo','forma inteligente: el círculo se reconoce');
  // borrador de trazo
  const n0=(await D(p)).n;await p.click('[data-herr="borrador"]');await gesto(p,linea(1,200,560,200,700,{n:16}));
  check((await D(p)).n===n0-1,'borrador de trazo: pasar sobre el círculo lo borra completo');
  // borrador de precisión: parte una línea en dos
  await p.click('[data-herr="borrador"]');await p.waitForTimeout(200);await p.click('[data-goma="precision"]');await p.click('[data-d="opc-cerrar"]');
  await p.click('[data-herr="pluma"]');await gesto(p,linea(1,40,470,320,470,{n:20}));const n1=(await D(p)).n;
  await p.click('[data-herr="borrador"]');await gesto(p,linea(1,180,440,180,500,{n:10}));
  check((await D(p)).n===n1+1,'borrador de precisión: borra solo por donde pasa (la línea queda en dos)');
  // formas de matemáticas: plano cartesiano
  await p.click('[data-herr="formas"]');await p.click('[data-herr="formas"]');await p.waitForTimeout(200);
  await p.screenshot({path:join(CAP,'formas-claro.png')});await diseno(p,'opciones de formas (360)');
  await p.click('[data-forma="plano"]');const nP=(await D(p)).n;await gesto(p,linea(1,60,180,300,400,{n:10}));
  check((await D(p)).n-nP===1&&await D(p,'d.objs.at(-1).t')==='plano','📐 plano cartesiano: un solo objeto editable (ejes, marcas y números juntos)');
  // fondo: cuadrícula y plano cartesiano
  for(const [fondo,et] of [['cuadricula','cuadrícula'],['cartesiano','plano cartesiano']]){
    await p.click('[data-d="mas"]');await p.waitForTimeout(250);await p.click('.modal [data-r="fondo"]');await p.waitForTimeout(250);await p.click(`.modal [data-r="${fondo}"]`);await p.waitForTimeout(300);
    const lineas=await p.evaluate(()=>{const cv=document.querySelector('.dib-cfondo'),x=cv.getContext('2d'),d=x.getImageData(0,0,cv.width,Math.min(cv.height,600)).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]<245)n++;return n});
    check(await D(p,'d.estado().fondo')===fondo&&lineas>2000,`fondo de ${et}`);
  }
  await p.screenshot({path:join(CAP,'fondo-cartesiano-claro.png')});
  // barra contraída a una fila
  await p.click('[data-d="contraer"]');const alto=await p.evaluate(()=>document.querySelector('.dib-barra').getBoundingClientRect().height);
  check(alto<60,`barra contraída a una fila (${Math.round(alto)} px)`);await diseno(p,'barra contraída (360)');await p.screenshot({path:join(CAP,'barra-contraida-claro.png')});
  await p.click('[data-d="contraer"]');
  // exportar PNG y PDF
  for(const [tipo,ext] of [['png','png'],['pdf','pdf']]){
    await p.click('[data-d="mas"]');await p.waitForTimeout(250);await p.click('.modal [data-r="exportar"]');await p.waitForTimeout(250);
    const [dl]=await Promise.all([p.waitForEvent('download',{timeout:15000}),p.click(`.modal [data-r="${tipo}"]`)]);
    const path=await dl.path(),{readFileSync}=await import('node:fs'),buf=readFileSync(path);
    check(dl.suggestedFilename().endsWith('.'+ext)&&(ext==='pdf'?buf.slice(0,5).toString()==='%PDF-':buf.slice(1,4).toString()==='PNG')&&buf.length>2000,`exportar ${ext.toUpperCase()} (${Math.round(buf.length/1024)} KB)`);
  }
  // Atrás con las opciones abiertas: se cierran primero
  await p.click('[data-herr="pluma"]');await p.click('[data-herr="pluma"]');await p.waitForTimeout(200);
  check(await p.locator('.dib-opc:not([hidden])').count()===1,'tocar la herramienta activa abre sus opciones');
  await diseno(p,'opciones de la pluma (360)');await p.screenshot({path:join(CAP,'pluma-opciones-claro.png')});
  await p.goBack();await p.waitForTimeout(400);
  check(await p.locator('.dib-opc:not([hidden])').count()===0&&await p.locator('.dib').count()===1,'Atrás: primero cierra las opciones');
  // bloquear y salir con Atrás: se guarda; al volver a abrir recuerda vista y bloqueo
  await p.click('[data-d="bloquear"]');const vs=(await D(p)).vista,nObj=(await D(p)).n;
  await p.goBack();await p.waitForTimeout(2200);
  check(await p.locator('.dib').count()===0,'Atrás: sale del dibujo y lo guarda');
  const id=idNota(p),nota=await leerDb(p,(tx,id)=>tx('notas','readonly',s=>s.get(id)),id),idDib=nota?.cuerpo.match(/!\[dibujo\]\(img:([\w-]+)\)/)?.[1];
  const arch=idDib&&await leerDb(p,(tx,id)=>tx('archivos','readonly',s=>s.get(id)).then(a=>a&&{tipo:a.tipo,v:a.dibujo?.v,n:a.dibujo?.objetos.length,bloqueado:a.dibujo?.bloqueado,vista:a.dibujo?.vista,hist:a.dibujo?.historial.length,bytes:a.blob.size}),idDib);
  check(arch?.tipo==='image/png'&&arch.v===2&&arch.n===nObj&&arch.hist>5,`la nota guarda el PNG y el dibujo en vectores (${arch?.n} objetos, ${arch?.hist} pasos de historial)`);
  check(await leerDb(p,(tx,id)=>tx('archivos','readonly',s=>s.get('borrador-dibujo-'+id)),id)===undefined,'al guardar se borra el autoguardado');
  await p.screenshot({path:join(CAP,'nota-con-dibujo-claro.png')});
  await p.click('.ed-img[aria-label^="Abrir el dibujo"]');await p.waitForTimeout(900);
  s=await D(p);if(!(s&&s.n===nObj&&s.bloqueado&&Math.abs(s.vista.z-vs.z)<.01))console.log('  reabrir:',JSON.stringify(s),nObj,JSON.stringify(vs));check(s&&s.n===nObj&&s.bloqueado&&Math.abs(s.vista.z-vs.z)<.01,'tocar el dibujo lo abre con sus objetos, su vista y el bloqueo');
  await gesto(p,toqueDedos(2));check((await D(p)).n<nObj||(await D(p,'d.hist'))<arch.hist,'el historial guardado permite deshacer al volver a abrirlo');
  await gesto(p,toqueDedos(3));
  // S Pen: el lápiz dibuja y el dedo mueve
  await p.click('[data-d="bloquear"]');
  const nS=(await D(p)).n,vS=(await D(p)).vista;await gesto(p,linea(9,60,300,200,340,{tipo:'pen',n:10,pressure:.7}));
  await gesto(p,linea(1,180,400,120,300,{n:8}));s=await D(p);
  check(s.n===nS+1&&(s.vista.x!==vS.x||s.vista.y!==vS.y),'S Pen: el lápiz dibuja y, después, un dedo mueve el lienzo');
  await p.click('[data-d="listo"]');await p.waitForTimeout(1500);
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await ctx.close();
}

/* ================= ✌️ Dos dedos (PROMPT-DOS-DEDOS) ================= */
{
  console.log('--- ✌️ Dos dedos: regla, compás, medir, marco, barrido y los lienzos viejos');
  const M=await import(pathToFileURL(join(raiz,'src','nucleo','dibujo','modelo.js')).href);
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await abrirNuevo(p);
  // apagada: dos dedos hacen zoom y no dibujan
  let s=await D(p);const z0=s.vista.z;
  await gesto(p,dosDedos([140,300],[220,300],[100,300],[260,300],{n:12}));s=await D(p);
  check(s.n===0&&s.vista.z>z0*1.5,'herramienta apagada: dos dedos hacen zoom y no dibujan');
  await p.evaluate(()=>document.querySelector('.dib').__dib.irA({z:1,x:0,y:0}));
  // elegirla: 📐 Formas → «✌️ Dos dedos»
  await p.click('[data-herr="formas"]');await p.click('[data-herr="formas"]');await p.waitForTimeout(200);
  await p.click('[data-d="dos"]');await p.waitForTimeout(250);
  s=await D(p);check(s.herr==='dosdedos'&&await p.locator('.dib-opc [data-dos-modo]').count()===5&&await p.locator('.dib-zoombtns:not([hidden])').count()===1,'✌️ en 📐 Formas: 5 modos y los botones + y − del zoom');
  await diseno(p,'✌️ Dos dedos (360)');
  await p.screenshot({path:join(CAP,'dos-dedos-panel.png')});
  const modo=async m=>{if(!await p.locator('.dib-opc:not([hidden])').count()){await p.click('[data-herr="formas"]');await p.waitForTimeout(150)}await p.click(`.dib-opc [data-dos-modo="${m}"]`);await p.click('[data-d="opc-cerrar"]');await p.waitForTimeout(100)};
  const nuevos=async n0=>(await D(p,'d.objs')).slice(n0);
  // 📏 regla: un abanico de movimientos deja UNA línea, entre donde quedaron los dedos
  await modo('regla');let n0=(await D(p)).n;
  await gesto(p,dosDedos([100,200],[260,260],[80,220],[290,320],{n:14}));
  let o=await nuevos(n0);
  check(o.length===1&&o[0].pts.length===2,`📏 regla: queda 1 sola línea recta (${o.length} objetos)`);
  // ajustada a la cuadrícula si el fondo la tiene: aquí liso, así que los extremos son los dedos
  check(o.length===1&&Math.abs(o[0].pts[0][0]-80)<1&&Math.abs(o[0].pts[1][1]-320)<1,'📏 la línea va de dedo a dedo');
  // 🧭 compás: centro y radio
  await modo('compas');n0=(await D(p)).n;
  await gesto(p,[['pointerdown',1,180,450],['pointerdown',2,260,450],['pointermove',2,261,451],['pointermove',2,260,450],['pointerup',2,260,450],['pointerup',1,180,450]]);
  o=await nuevos(n0);const radio=o[0]?Math.hypot(o[0].pts[0][0]-180,o[0].pts[0][1]-450):0;
  check(o.length===1&&o[0].forma==='circulo'&&Math.abs(radio-80)<1.5,`🧭 compás: 1 círculo con el radio de los dedos (r = ${radio.toFixed(1)}, esperado 80)`);
  // girando el segundo dedo un cuarto de vuelta: solo el arco
  n0=(await D(p)).n;
  await gesto(p,[['pointerdown',1,180,450],['pointerdown',2,260,450],...Array.from({length:12},(_,i)=>{const a=-(i+1)/12*Math.PI/2;return ['pointermove',2,180+80*Math.cos(a),450+80*Math.sin(a)]}),['pointerup',2,180,370],['pointerup',1,180,450]]);
  o=await nuevos(n0);check(o.length===1&&o[0].forma==='arco',`🧭 girar el segundo dedo deja solo el arco (${o[0]?.forma})`);
  // 📐 medir sobre el plano cartesiano: de (1, 2) a (3, 6), m = 2
  await modo('medir');await p.click('[data-herr="formas"]');await p.waitForTimeout(150);
  if(await p.locator('.dib-opc [data-d="dos-plano"]').count())await p.click('.dib-opc [data-d="dos-plano"]');
  await p.click('[data-d="opc-cerrar"]');
  const st=await D(p,'d.estado()'),[ox,oy]=M.origenCartesiano(st);
  await p.evaluate(([ox,oy])=>document.querySelector('.dib').__dib.irA({z:1,x:ox-60,y:oy-500}),[ox,oy]);
  const v=await D(p,'d.vista'),pant=q=>{const w=M.dePlano(q,st);return [(w[0]-v.x)*v.z,(w[1]-v.y)*v.z]};
  const A=pant([1,2]),B=pant([3,6]);n0=(await D(p)).n;
  await gesto(p,[['pointerdown',1,A[0]+3,A[1]-2],['pointerdown',2,B[0]-2,B[1]+3],['pointermove',1,A[0]+2,A[1]-1],['pointermove',2,B[0]-1,B[1]+2],['pointerup',1,A[0]+2,A[1]-1],['pointerup',2,B[0]-1,B[1]+2]]);
  const med=await D(p,'d.dos().medicion');
  check(med?.m===2&&med.dist===4.47&&med.medio?.join()==='2,4'&&(await nuevos(n0)).length===0,`📐 medir de (1, 2) a (3, 6): m = ${med?.m}, d = ${med?.dist}, punto medio (${med?.medio}) (se ajusta a la cuadrícula)`);
  await p.screenshot({path:join(CAP,'dos-dedos-medir.png')});
  check(await p.locator('.dib-dejar:not([hidden])').count()===1,'📐 aparece «📌 Dejar en la hoja»');
  await p.click('.dib-dejar');o=await nuevos(n0);
  check(o.length>=8&&new Set(o.map(x=>x.g)).size===1&&o.some(x=>x.t==='texto'&&x.texto==='m = Δy / Δx = 2'),'📌 la medida queda en la hoja con sus etiquetas (un solo grupo)');
  // ▭ marco y resaltado
  await modo('marco');n0=(await D(p)).n;await gesto(p,dosDedos([60,150],[200,230],[60,150],[220,250],{n:4}));
  o=await nuevos(n0);check(o.length===1&&o[0].forma==='rectangulo','▭ marco: un rectángulo entre las esquinas');
  // 🌀 barrido: una línea cada 14 px (el espaciado), todo en un grupo que se deshace de una vez
  await modo('barrido');n0=(await D(p)).n;const h0=(await D(p,'d.hist'));
  await gesto(p,[['pointerdown',1,60,520],['pointerdown',2,60,700],...Array.from({length:70},(_,i)=>[['pointermove',1,62+i*2,520],['pointermove',2,62+i*2,700]]).flat(),['pointerup',1,200,520],['pointerup',2,200,700]]);
  o=await nuevos(n0);const esperado=1+Math.floor(140/14);
  check(Math.abs(o.length-esperado)<=1&&new Set(o.map(x=>x.g)).size===1,`🌀 barrido: respeta el espaciado (${o.length} líneas en 140 px cada 14 px; esperado ~${esperado}) y es un solo grupo`);
  check((await D(p,'d.hist'))===h0+1,'🌀 el barrido es un solo paso del historial');
  await p.screenshot({path:join(CAP,'dos-dedos-barrido.png')});
  await p.click('[data-d="deshacer"]');check((await D(p)).n===n0,'🌀 se deshace en un paso');
  // ratón: presionar = punto A, arrastrar = punto B
  await modo('regla');n0=(await D(p)).n;await gesto(p,linea(7,40,600,300,640,{n:8,tipo:'mouse'}));
  o=await nuevos(n0);check(o.length===1&&o[0].pts.length===2,'ratón: clic y arrastrar hace la regla');
  // 📈 ejemplo: parábola con rectas
  await p.click('[data-herr="formas"]');await modo('barrido');await p.click('[data-herr="formas"]');await p.waitForTimeout(150);
  n0=(await D(p)).n;await p.click('.dib-opc [data-d="dos-parabola"]');o=await nuevos(n0);
  check(o.filter(x=>x.t==='texto').length>=20&&new Set(o.map(x=>x.g)).size===1,'📈 «Ejemplo: parábola con rectas»: dos ejes con puntos numerados');
  // volver a la pluma: dos dedos vuelven a ser zoom
  await p.click('[data-herr="pluma"]');n0=(await D(p)).n;await gesto(p,dosDedos([140,300],[220,300],[120,300],[240,300],{n:8}));
  check((await D(p)).n===n0,'otra herramienta: dos dedos ya no dibujan');
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await p.close();
  // ✏️ Borrador de los ejercicios (lienzo viejo): dos dedos desplazan y NO dibujan líneas entre ellos; tocar con 2 deshace
  const q=await ctx.newPage();
  await q.goto(BASE+'#estudio/matematicas/algebra-lineal/l/gauss');await q.waitForSelector('#vista > *');await q.waitForTimeout(500);
  if(await q.locator('#mini-saltar').count())await q.click('#mini-saltar');
  for(let k=0;k<4&&await q.locator('#ses-continuar').count();k++){await q.click('#ses-continuar');await q.waitForTimeout(200)}
  await q.click('#ses-borrador');await q.waitForTimeout(300);
  const ev=pasos=>q.evaluate(pasos=>{const cv=document.querySelector('.borrador-lienzo'),r=cv.getBoundingClientRect();
    for(const [t,id,x,y] of pasos)cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',isPrimary:id===1,pressure:t==='pointerup'?0:.5,buttons:t==='pointerup'?0:1,button:t==='pointermove'?-1:0,clientX:r.left+x,clientY:r.top+y}))},pasos);
  const tintaB=()=>q.evaluate(()=>{const cv=document.querySelector('.borrador-lienzo'),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<d.length;i+=16)if(Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>60)n++;return n});
  await ev([['pointerdown',1,40,40],['pointerdown',2,200,120],...Array.from({length:12},(_,i)=>[['pointermove',1,40+i*6,40+i*4],['pointermove',2,200-i*5,120+i*3]]).flat(),['pointerup',1,112,88],['pointerup',2,140,156]]);
  await q.waitForTimeout(100);check(await tintaB()===0,'✏️ Borrador de los ejercicios: dos dedos no dibujan líneas entre ellos');
  await ev([['pointerdown',1,40,60],...Array.from({length:10},(_,i)=>['pointermove',1,40+i*12,60+i*3]),['pointerup',1,160,90]]);await q.waitForTimeout(100);
  const t1=await tintaB();await ev([['pointerdown',1,60,80],['pointerdown',2,120,80],['pointerup',1,60,80],['pointerup',2,120,80]]);await q.waitForTimeout(100);
  check(t1>0&&await tintaB()===0,'✏️ Borrador: un dedo dibuja y tocar con dos deshace');
  await ctx.close();
}

/* ================= 📈 plano cartesiano editable (PROMPT-PLANOS-MATRICES, parte 1) ================= */
{
  console.log('--- 📈 plano cartesiano editable');
  const PL=await import(pathToFileURL(join(raiz,'src','nucleo','dibujo','plano.js')).href);
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await abrirNuevo(p);await p.evaluate(()=>document.querySelector('.dib').__dib.irA({z:1,x:0,y:0}));
  // insertar desde 📐 Formas → Plano cartesiano
  await p.click('[data-herr="formas"]');await p.click('[data-herr="formas"]');await p.waitForTimeout(150);
  await p.click('.dib-opc [data-forma="plano"]');await p.waitForTimeout(150);
  await gesto(p,linea(1,30,100,330,400,{n:8}));
  let pl=await D(p,'d.objs.find(o=>o.t==="plano")');
  check(pl&&pl.w>=290&&pl.h>=290&&Math.abs((pl.xMax-pl.xMin)/pl.w-(pl.yMax-pl.yMin)/pl.h)<1e-6,'📐 → Plano cartesiano: un objeto plano con su rango (misma escala en x y y)');
  // un trazo dentro queda anclado
  await p.click('[data-herr="pluma"]');await gesto(p,linea(1,200,180,250,220,{n:8}));
  let tr=await D(p,'d.objs.filter(o=>o.t==="trazo").at(-1)');
  check(tr?.ancla===pl.pid,'lo que se dibuja dentro queda anclado al plano');
  const enPl=(pl,q)=>PL.aPlanoDe(pl,q);const u0=enPl(pl,tr.pts[0]);
  // tocar el plano lo elige (con lo anclado) y muestra su barra
  await gesto(p,[['pointerdown',1,80,350],['pointerup',1,80,350]]);await p.waitForTimeout(150);
  check(!!(await D(p,'d.plano()'))&&await p.locator('.dib-selbar [data-d="plano-ajustes"]').count()===1&&(await D(p,'d.sel.length'))===2,'tocar el plano lo elige junto con lo anclado: ⚙️ ➕ 🔒 ⧉ 🗑️');
  await p.screenshot({path:join(CAP,'plano-elegido.png')});
  // cambiar el rango a 0–20: el trazo conserva sus coordenadas del plano
  await p.evaluate(pid=>document.querySelector('.dib').__dib.cambiarPlano(pid,{xMin:0,xMax:20,yMin:0,yMax:20,estilo:'cuadrante'}),pl.pid);
  pl=await D(p,'d.objs.find(o=>o.t==="plano")');tr=await D(p,'d.objs.filter(o=>o.t==="trazo").at(-1)');
  const u1=enPl(pl,tr.pts[0]);
  check(pl.xMin===0&&pl.xMax===20&&Math.abs(u1[0]-u0[0])<.05&&Math.abs(u1[1]-u0[1])<.05,`rango 0–20: el trazo anclado se queda en sus coordenadas del plano (${u0.map(v=>v.toFixed(2))} → ${u1.map(v=>v.toFixed(2))})`);
  // tamaño con el asa de la esquina: el trazo se escala con el plano
  await pintar(p);await p.waitForTimeout(100);
  const esq=await D(p,'(()=>{const m=d.manijas();return m?.lados?.find(l=>l[0]==="se")})()');
  if(esq)await gesto(p,linea(1,esq[1],esq[2],esq[1]-80,esq[2]-80,{n:8}));
  const pl2=await D(p,'d.objs.find(o=>o.t==="plano")'),tr2=await D(p,'d.objs.filter(o=>o.t==="trazo").at(-1)'),u2=enPl(pl2,tr2.pts[0]);
  check(!!esq&&pl2.w<pl.w-60&&Math.abs(u2[0]-u0[0])<.05&&Math.abs(u2[1]-u0[1])<.05,'asa de la esquina: el plano se hace más chico y el trazo se escala con él');
  // moverlo: arrastrar dentro del plano elegido
  await pintar(p);await p.waitForTimeout(200);await gesto(p,linea(1,120,300,150,340,{n:8}));
  const pl3=await D(p,'d.objs.find(o=>o.t==="plano")'),tr3=await D(p,'d.objs.filter(o=>o.t==="trazo").at(-1)');
  check(Math.abs(pl3.x-pl2.x-30)<1&&Math.abs(pl3.y-pl2.y-40)<1&&Math.abs(tr3.pts[0][0]-tr2.pts[0][0]-30)<1,`arrastrar el plano lo mueve con lo anclado (${JSON.stringify([pl2.x,pl2.y,pl2.w,pl2.h,pl3.x,pl3.y,await D(p,"d.sel.length")])})`);
  // ⚙️ Ajustes: el panel con los rangos rápidos y un paso del historial
  const h0=await D(p,'d.hist');await p.click('.dib-selbar [data-d="plano-ajustes"]');await p.waitForTimeout(200);
  check(await p.locator('.dib-opc [data-pl-preset]').count()===4,'⚙️ Ajustes: rangos rápidos (−10 a 10, −5 a 5, 1er cuadrante, trigonometría)');
  await diseno(p,'⚙️ Ajustes del plano (360)');await p.screenshot({path:join(CAP,'plano-ajustes.png')});
  await p.click('.dib-opc [data-pl-preset="5"]');await p.fill('.dib-opc [data-pl="xMax"]','6');await p.waitForTimeout(100);
  pl=await D(p,'d.objs.find(o=>o.t==="plano")');
  check(pl.xMin===-5&&pl.xMax===6&&(await D(p,'d.hist'))===h0+1,'los cambios se ven en vivo y cuentan como un solo paso para deshacer');
  await p.click('[data-d="opc-cerrar"]');
  // gráfica de x² − 4: corta el eje x en ±2
  await p.evaluate(pid=>document.querySelector('.dib').__dib.cambiarPlano(pid,{xMin:-5,xMax:5,yMin:-5,yMax:5,estilo:'centrado',igual:true}),pl.pid);
  await p.evaluate(pid=>document.querySelector('.dib').__dib.agregarObjetoPlano(pid,{k:'funcion',expr:'x^2 - 4',color:'#2563eb'}),pl.pid);
  pl=await D(p,'d.objs.find(o=>o.t==="plano")');await p.evaluate(()=>document.querySelector('.dib').__dib.irA({z:1,x:0,y:0}));await pintar(p);
  const azul=(q,r=4)=>p.evaluate(([x,y,r])=>{const cv=document.querySelector('.dib-ctinta'),cf=document.querySelector('.dib-cfondo'),k=cv.width/cv.clientWidth;let n=0;
    for(const c of [cv,cf]){const dd=c.getContext('2d').getImageData(Math.round((x-r)*k),Math.round((y-r)*k),Math.round(2*r*k),Math.round(2*r*k)).data;for(let i=0;i<dd.length;i+=4)if(dd[i+3]>100&&dd[i+2]>170&&dd[i]<110&&dd[i+1]<150)n++}return n},[q[0],q[1],r]);
  const pant=q=>{const w=PL.aLienzo(pl,q);return w};   // vista 100 % en (0, 0): lienzo = pantalla
  const c2=await azul(pant([2,0])),cm2=await azul(pant([-2,0])),c0=await azul(pant([0,-4])),fuera=await azul(pant([1,0]));
  check(c2>0&&cm2>0&&c0>0&&fuera===0,`y = x² − 4 corta el eje x en ±2 y pasa por (0, −4) (píxeles: ${c2}, ${cm2}, ${c0}; en (1, 0): ${fuera})`);
  // 1/x: sin la línea vertical en x = 0
  await p.evaluate(pid=>{const d=document.querySelector('.dib').__dib,pl=d.objs.find(o=>o.t==='plano');d.cambiarPlano(pid,{objetos:[{k:'funcion',id:'f1',expr:'1/x',color:'#2563eb'}]})},pl.pid);
  await pintar(p);pl=await D(p,'d.objs.find(o=>o.t==="plano")');
  let vert=0;for(let v=-3;v<=3;v+=.5)vert+=await azul(pant([0,v]),1.2);
  check(vert===0&&await azul(pant([1,1]))>0&&await azul(pant([-1,-1]))>0,`1/x: dos ramas sin la línea vertical en x = 0 (píxeles en x = 0: ${vert})`);
  await p.screenshot({path:join(CAP,'plano-funcion.png')});
  // punto ajustado a la cuadrícula: A(2, 3)
  await p.evaluate(pid=>document.querySelector('.dib').__dib.modoPlano(pid,'punto'),pl.pid);
  const q=pant([2.2,2.8]);await gesto(p,[['pointerdown',1,q[0],q[1]],['pointerup',1,q[0],q[1]]]);
  pl=await D(p,'d.objs.find(o=>o.t==="plano")');const pt=pl.objetos.find(o=>o.k==='punto');
  check(pt&&pt.x===2&&pt.y===3&&pt.nombre==='A'&&PL.nombrePunto(pt)==='A(2, 3)','📍 un punto se ajusta a la cuadrícula: A(2, 3)');
  // arrastrarlo actualiza su etiqueta
  const q2=pant([2,3]),q3=pant([4,-1]);await gesto(p,linea(1,q2[0],q2[1],q3[0],q3[1],{n:8}));
  pl=await D(p,'d.objs.find(o=>o.t==="plano")');check(pl.objetos.find(o=>o.k==='punto')?.x===4&&pl.objetos.find(o=>o.k==='punto')?.y===-1,'arrastrar el punto lo mueve: A(4, −1)');
  await pintar(p);await p.screenshot({path:join(CAP,'plano-punto.png')});
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  // un plano viejo (el grupo de trazos de antes) se convierte al objeto nuevo del mismo tamaño
  const M=await import(pathToFileURL(join(raiz,'src','nucleo','dibujo','modelo.js')).href);
  const viejo=M.formaDirecta('planoViejo',[0,0],[300,240]).map(o=>({...o,forma:'plano'})),mg=M.normalizarDibujo({objetos:viejo});
  check(mg.objetos.length===1&&mg.objetos[0].t==='plano'&&mg.objetos[0].w===300&&mg.objetos[0].h===240,'un plano viejo se migra al objeto nuevo con su tamaño');
  await ctx.close();
}

/* ================= desde un ejercicio y ✨ pasar a texto (IA simulada) ================= */
{
  console.log('--- «✏️ Resolver en el Cuaderno» y ✨ pasar a texto');
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>localStorage.setItem('ciberlab-ia',JSON.stringify({proveedor:'gemini',claves:{gemini:['AI','za'].join('')+'-prueba-simulada'}})));
  let pedidas=0;
  await ctx.route('https://generativelanguage.googleapis.com/**',r=>{pedidas++;const tieneImagen=JSON.stringify(r.request().postDataJSON()).includes('inlineData');
    r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({tipo:'formula',texto:'x^2 + 1',latex:tieneImagen?'x^2 + 1':'?'})}]},finishReason:'STOP'}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:5}})})});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#estudio/matematicas/algebra-lineal/l/gauss');await p.waitForSelector('#vista > *');await p.waitForTimeout(500);
  if(await p.locator('#mini-saltar').count())await p.click('#mini-saltar');
  for(let k=0;k<4&&await p.locator('#ses-continuar').count();k++){await p.click('#ses-continuar');await p.waitForTimeout(200)}
  await p.click('#ses-borrador');await p.waitForTimeout(300);
  await p.click('[data-borr="resolver"]');await p.waitForTimeout(1500);
  let o=await D(p,'d.objs[0]');
  check(o?.t==='imagen'&&o.fija,'«✏️ Resolver en el Cuaderno»: el dibujo empieza con el enunciado arriba como imagen fija');
  await pintar(p);check(await tinta(p,0,0,360,120)>300,'el enunciado (con sus fórmulas) se ve en el lienzo');
  await gesto(p,linea(1,60,300,120,300,{n:6}));await gesto(p,linea(1,90,270,90,330,{n:6}));
  await p.click('[data-d="mas"]');await p.waitForTimeout(250);await p.click('.modal [data-r="ia"]');await p.waitForTimeout(1500);
  check(pedidas===1&&await p.locator('.modal #dt-v').inputValue()==='x^2 + 1','✨ pasar a texto: la IA lee lo escrito (con la imagen) y lo muestra para confirmar');
  await p.click('.modal [data-r="reemplazar"]');await p.waitForTimeout(500);
  const tipos=await D(p,'d.objs.map(o=>o.t).join()');check(tipos==='imagen,formula','«Reemplazar»: lo escrito a mano queda como fórmula');
  await p.click('[data-d="listo"]');await p.waitForTimeout(2000);
  check(await p.locator('.dib').count()===0&&await p.locator('.sesion,#vista .pregunta').count()>0,'al terminar vuelve a la práctica');
  const notas=await leerDb(p,tx=>tx('notas','readonly',s=>s.getAll()));const n=notas.find(x=>/Resuelto a mano/.test(x.cuerpo));
  check(!!n&&/!\[dibujo\]\(img:[\w-]+\)/.test(n.cuerpo),`se guarda en la nota del tema (${n?.titulo})`);
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await ctx.close();
}

/* ================= dibujos viejos y rendimiento ================= */
{
  console.log('--- dibujos viejos (migración) y rendimiento');
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#notas');await p.waitForTimeout(600);
  // un dibujo de PROMPT-NOTAS (trazos) y uno de antes (solo PNG)
  await p.evaluate(async()=>{
    const png=await new Promise(r=>{const c=document.createElement('canvas');c.width=600;c.height=300;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,600,300);x.fillStyle='#1f2430';x.fillRect(100,100,300,20);c.toBlob(r,'image/png')});
    const linea=(y)=>Array.from({length:21},(_,i)=>[20+i*15,y,.5]);
    const d=await new Promise(res=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result)});
    await new Promise(res=>{const t=d.transaction(['notas','archivos'],'readwrite');
      t.objectStore('archivos').put({id:'viejo1',nota:'nv',blob:png,tipo:'image/png',ancho:945,alto:630,creada:1,trazos:[{herr:'lapiz',color:null,ancho:3.5,pen:false,puntos:linea(80)},{herr:'borrar',color:null,ancho:3,pen:false,puntos:[[170,40,.5],[170,120,.5]]}]});
      t.objectStore('archivos').put({id:'viejo2',nota:'nv',blob:png,tipo:'image/png',ancho:600,alto:300,creada:1});
      t.objectStore('notas').put({id:'nv',titulo:'Dibujos de antes',cuerpo:'Uno\n\n![dibujo](img:viejo1)\n\n![dibujo](img:viejo2)',materia:null,tema:null,etiquetas:[],fijada:false,creada:1,editada:1});
      t.oncomplete=res});d.close()});
  await p.goto(BASE+'#notas/n/nv');await p.waitForTimeout(900);
  check(await p.locator('.nota-fig img').count()===2,'los dibujos viejos se ven en la nota como siempre');
  await p.click('[data-ampliar="1"]');await p.waitForTimeout(900);
  let s=await D(p);const trs=await D(p,'d.objs.map(o=>o.t+(o.t==="trazo"?o.pts.length:""))');
  check(s&&trs.length===2&&trs.every(t=>t.startsWith('trazo')),`dibujo de PROMPT-NOTAS: se migra a vectores (la goma vieja parte la línea: ${trs.length} trazos)`);
  await gesto(p,linea(1,40,300,200,320,{n:8}));await p.click('[data-d="listo"]');await p.waitForTimeout(1600);
  const nota=await leerDb(p,(tx)=>tx('notas','readonly',s=>s.get('nv')));const nuevo=nota.cuerpo.match(/!\[dibujo\]\(img:([\w-]+)\)/)?.[1];
  const a=await leerDb(p,(tx,id)=>tx('archivos','readonly',s=>s.get(id)).then(a=>a&&{v:a.dibujo?.v,n:a.dibujo?.objetos.length}),nuevo);
  check(nuevo!=='viejo1'&&a?.v===2&&a.n===3&&!(await leerDb(p,(tx)=>tx('archivos','readonly',s=>s.get('viejo1')))),'al guardarlo queda en el formato nuevo (v2) y se borra el viejo');
  const i2=await p.evaluate(()=>[...document.querySelectorAll('.ed-bloque')].findIndex(b=>b.querySelector('img[data-img="viejo2"]')));
  await p.click(`[data-ampliar="${i2}"]`);await p.waitForTimeout(900);
  s=await D(p);const im=await D(p,'d.objs[0]');
  check(s?.n===1&&im.t==='imagen'&&im.fija,'dibujo de antes (solo PNG): queda como imagen fija para escribir encima');
  await p.waitForTimeout(400);await pintar(p);check(await tinta(p,0,0,360,300)>500,'la imagen de antes se ve en el lienzo');
  // rendimiento: 2000 trazos y el zoom sigue fluido
  await p.evaluate(()=>{const d=document.querySelector('.dib').__dib;void d});
  await p.evaluate(()=>{const dd=document.querySelector('.dib').__dib,o=[];let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<2000;i++){const x=r()*700,y=r()*1600,pts=[];for(let j=0;j<24;j++)pts.push([x+j*4+r()*3,y+Math.sin(j/3)*8+r()*3,.5]);o.push({t:'trazo',id:'p'+i,herr:'pluma',tipo:i%3?'boli':'fuente',vari:i%3===0,color:['#1f2430','#2563eb','#dc2626'][i%3],ancho:2,pts})}
    dd.objs.push(...o)});
  await p.evaluate(()=>document.querySelector('.dib').__dib.ajustar('pantalla'));await p.waitForTimeout(300);
  const t=await p.evaluate(async()=>{
    const dd=document.querySelector('.dib').__dib,cv=document.querySelector('.dib-cvivo'),r=cv.getBoundingClientRect(),ev=(t,id,x,y)=>cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',buttons:t==='pointerup'?0:1,clientX:r.left+x,clientY:r.top+y}));
    const t0=performance.now();dd.pintarAhora();const completo=performance.now()-t0;
    ev('pointerdown',1,150,300);ev('pointerdown',2,210,300);const tiempos=[];
    for(let i=1;i<=40;i++){const a=performance.now();ev('pointermove',1,150-i*2,300);ev('pointermove',2,210+i*2,300);dd.pintarAhora();tiempos.push(performance.now()-a);await new Promise(s=>requestAnimationFrame(s))}
    ev('pointerup',1,70,300);ev('pointerup',2,290,300);
    const a=performance.now();dd.pintarAhora();const final=performance.now()-a;tiempos.sort((x,y)=>x-y);
    return {completo,mediana:tiempos[20],p90:tiempos[36],final,n:dd.objs.length}});
  check(t.n>=2000&&t.p90<16.7,`2000 trazos: el zoom va a ${Math.round(1000/Math.max(t.mediana,1))} fps (cuadro: mediana ${t.mediana.toFixed(1)} ms, p90 ${t.p90.toFixed(1)} ms; pintar todo ${t.completo.toFixed(0)} ms)`);
  await p.click('[data-d="mas"]');await p.waitForTimeout(250);await p.click('.modal [data-r="descartar"]');await p.waitForTimeout(250);if(await p.locator('.modal [data-r="1"]').count())await p.click('.modal [data-r="1"]');await p.waitForTimeout(900);
  check(await p.locator('.dib').count()===0,'«Descartar los cambios» cierra sin guardar');
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await ctx.close();
}

/* ================= plantillas y capturas en oscuro ================= */
for(const oscuro of [false,true]){
  const nom=oscuro?'oscuro':'claro';
  console.log(`--- plantillas y capturas (${nom})`);
  const ctx=await nuevoContexto({viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true},{oscuro});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  for(const pl of oscuro?['red','cornell']:['cornell','problema','mapa','comparar','verdad','red']){
    await abrirNuevo(p,{plantilla:pl});await p.waitForTimeout(500);
    const n=(await D(p)).n;check(n>(pl==='blanco'?-1:3),`plantilla «${pl}» (${n} objetos)`);
    await p.screenshot({path:join(CAP,`plantilla-${pl}-${nom}.png`)});
    await p.click('[data-d="mas"]');await p.waitForTimeout(250);await p.click('.modal [data-r="descartar"]');await p.waitForTimeout(250);if(await p.locator('.modal [data-r="1"]').count())await p.click('.modal [data-r="1"]');await p.waitForTimeout(700);
  }
  if(oscuro){
    await abrirNuevo(p);await gesto(p,linea(1,60,200,280,240,{n:12}));await pintar(p);
    const col=await p.evaluate(()=>{const cv=document.querySelector('.dib-ctinta'),k=cv.width/cv.clientWidth,x=cv.getContext('2d'),d=x.getImageData(Math.round(170*k),Math.round(220*k),1,1).data;return [...d]});
    check(col[0]>150&&col[3]>200,'modo oscuro: la tinta negra se ve clara (el color guardado no cambia)');
    check(await D(p,'d.objs[0].color')==='#1f2430','modo oscuro: se guarda negra');
    await gesto(p,dosDedos([140,300],[220,300],[100,300],[260,300],{n:10}));await p.screenshot({path:join(CAP,'zoom-oscuro.png')});
    await p.click('[data-d="bloquear"]');await p.screenshot({path:join(CAP,'bloqueado-oscuro.png')});
    await p.click('[data-herr="formas"]');await p.click('[data-herr="formas"]');await p.waitForTimeout(200);await p.screenshot({path:join(CAP,'formas-oscuro.png')});await diseno(p,'formas en oscuro (360)');
    await p.click('[data-d="opc-cerrar"]');await p.click('[data-d="contraer"]');await p.screenshot({path:join(CAP,'barra-contraida-oscuro.png')});await p.click('[data-d="contraer"]');
    await p.click('[data-herr="lazo"]');await gesto(p,[['pointerdown',1,30,150],['pointermove',1,320,150],['pointermove',1,320,320],['pointermove',1,30,320],['pointermove',1,30,152],['pointerup',1,30,152]]);
    await p.screenshot({path:join(CAP,'lazo-oscuro.png')});
  }
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await ctx.close();
}

/* ================= tablet y laptop ================= */
for(const [nombre,opc] of [['tablet 1280 × 800 horizontal (táctil)',{viewport:{width:1280,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true}],['laptop 1366 × 768 (ratón y teclado)',{viewport:{width:1366,height:768}}]]){
  console.log('--- '+nombre);
  const ctx=await nuevoContexto(opc),p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await abrirNuevo(p);
  const lado=await p.evaluate(()=>{const b=document.querySelector('.dib-barra').getBoundingClientRect(),a=document.querySelector('.dib-area').getBoundingClientRect();return {izq:b.right<=a.left+1,arriba:b.bottom<=a.top+1}});
  check(opc.hasTouch?lado.izq:lado.arriba,`la barra va ${opc.hasTouch?'a un lado':'arriba'}`);
  await diseno(p,nombre.split(' ')[0]);
  await p.screenshot({path:join(CAP,`${nombre.split(' ')[0]}-claro.png`)});
  if(!opc.hasTouch){
    const box=await p.locator('.dib-cvivo').boundingBox();
    await p.mouse.move(box.x+200,box.y+200);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(box.x+200+i*20,box.y+200+i*5);await p.mouse.up();
    check((await D(p)).n===1,'ratón: arrastrar dibuja');
    const z0=(await D(p)).vista.z;await p.keyboard.down('Control');await p.mouse.wheel(0,-300);await p.keyboard.up('Control');await p.waitForTimeout(150);
    check((await D(p)).vista.z>z0*1.3,'Ctrl + rueda: acerca');
    const y0=(await D(p)).vista.y;await p.mouse.wheel(0,200);await p.waitForTimeout(150);check((await D(p)).vista.y>y0,'la rueda desplaza');
    const v0=(await D(p)).vista;await p.keyboard.down(' ');await p.mouse.move(box.x+500,box.y+300);await p.mouse.down();await p.mouse.move(box.x+400,box.y+250,{steps:5});await p.mouse.up();await p.keyboard.up(' ');
    const v1=(await D(p)).vista;check(v1.x>v0.x&&(await D(p)).n===1,'espacio + arrastrar mueve (no dibuja)');
    await p.keyboard.press('0');await p.waitForTimeout(100);check((await D(p)).vista.z!==v1.z,'«0»: ajustar a la pantalla');
    await p.keyboard.press('Control+z');check((await D(p)).n===0,'Ctrl+Z deshace');await p.keyboard.press('Control+y');check((await D(p)).n===1,'Ctrl+Y rehace');
    await p.keyboard.press('Escape');await p.waitForTimeout(1500);check(await p.locator('.dib').count()===0,'Esc: sale del dibujo guardando');
  }else{
    await gesto(p,linea(1,300,300,600,360,{n:12}));check((await D(p)).n===1,'tablet: 1 dedo dibuja');
    await p.click('[data-d="listo"]');await p.waitForTimeout(1500);
  }
  check(!err.length,'sin errores de JavaScript'+(err.length?': '+err.slice(0,2).join(' | '):''));
  await ctx.close();
}
}catch(e){console.log('FALLO inesperado: '+(e.stack||e.message));f++}
await nav.close();apagar();
console.log(f?`\n${f} fallos`:'\nTodo bien (capturas en capturas/dibujo/)');
process.exit(f?1:0);
