/* npm run lectura: 📚 Lectura en el navegador (360 px, táctil).
   - La biblioteca muestra los 11 libros (5 en inglés, 6 en español), filtros que se combinan y se recuerdan, y búsqueda; la portada de cada uno, su licencia y atribución.
   - Un capítulo se descarga y se lee; A+ agranda la letra, 🌙 cambia a oscuro y se recuerda.
   - Inglés: tocar una palabra abre su ficha (pronunciar, significado); «Guardar en repaso» crea la tarjeta en el progreso.
   - Las preguntas de comprensión (3) marcan el capítulo como leído si aciertas la mayoría.
   - Español: tocar una palabra antigua muestra su definición del glosario; si no está, «Guardar para buscar luego».
   - Libro técnico: «🎯 Practicar este capítulo» lleva al tema del curso.
   - Sin conexión: un capítulo ya abierto se vuelve a abrir (caché 'libros' del service worker).
   Compila (salvo --sin-build), levanta `vite preview` en el puerto 4793 y lo apaga al terminar. --capturas <dir> [--oscuro]. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4793,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null;
const {PREGUNTAS}=await import(pathToFileURL(join(raiz,'src','materias','lectura','preguntas.js')).href);

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
try{
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,colorScheme:process.argv.includes('--oscuro')?'dark':'light'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  const foto=async n=>{if(capturas)await p.screenshot({path:join(capturas,n+'.png'),fullPage:true})};
  const texto=async sel=>(await p.textContent(sel).catch(()=>''))||'';
  const esperar=async(sel,re,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(re.test(await texto(sel)))return true;await p.waitForTimeout(250)}return false};
  const progreso=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')||'{}'));

  await p.goto(BASE+'#estudio/lectura');await p.waitForTimeout(900);
  const v=await texto('#vista');
  check(['Aesop','Alice','Sherlock','Plotting and Programming in Python','Online Statistics Education'].every(t=>v.includes(t)),'la biblioteca muestra los 5 libros en inglés');
  check(!/Próximamente/.test(v),'Lectura ya no dice «Próximamente»');
  await foto('lec-1-biblioteca');
  await p.click('[data-go="estudio/lectura/libro/aesop"]');await p.waitForTimeout(500);
  check(/Licencia y atribución/.test(await texto('#vista'))&&/Project Gutenberg/.test(await texto('#vista'))&&/Dominio público/.test(await texto('#vista')),'la portada muestra licencia y atribución');
  await foto('lec-2-portada');
  await p.click('[data-go="estudio/lectura/libro/aesop/1"]');
  check(await esperar('#vista',/There was once a little Kid/),'el capítulo se descarga y se lee');
  const t0=await p.$eval('.lector',el=>parseFloat(getComputedStyle(el).fontSize));
  await p.click('[data-letra="1"]');await p.waitForTimeout(200);
  const t1=await p.$eval('.lector',el=>parseFloat(getComputedStyle(el).fontSize));
  check(t1>t0,`A+ agranda la letra (${t0} → ${t1} px)`);
  await p.click('#lec-tema');await p.waitForTimeout(200);
  check(await p.locator('.lector.lector-oscuro').count()===1,'🌙 pone el lector en oscuro');
  check(await p.locator('.lec-oir').count()>3,'cada párrafo tiene «🔊 Escuchar»');
  // tocar una palabra
  const caja=await p.$eval('.lector .lec-bloque',el=>{const r=document.createRange(),t=el.firstChild,i=t.textContent.indexOf('Kid');r.setStart(t,i+1);r.setEnd(t,i+2);const b=r.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}});
  await p.mouse.click(caja.x,caja.y);await p.waitForTimeout(400);
  check(/Kid/.test(await texto('.lec-palabra h2')),'tocar una palabra abre su ficha');
  await p.fill('#pal-sig','cabrito');await p.click('#pal-guardar');await p.waitForTimeout(400);
  const pg=await progreso(),tj=Object.entries(pg.tarjetas||{}).find(([,t])=>t.origen==='lectura');
  check(tj&&tj[1].a==='cabrito'&&pg.repaso[`lectura/t/${tj[0]}`],'«Guardar en repaso» crea la tarjeta y la programa en el repaso');
  await foto('lec-3-capitulo');
  // preguntas de comprensión
  await p.click('#lec-preguntas');await p.waitForTimeout(400);
  for(const [,resp] of PREGUNTAS.aesop[0]){await p.fill('#ses-resp',resp[0]);await p.click('#ses-comprobar');await p.waitForTimeout(300);await p.click('#hoja-seguir');await p.waitForTimeout(300)}
  check(/3 de 3/.test(await texto('#vista')),'las 3 preguntas de comprensión se responden');
  const leidos=(await progreso()).materias?.lectura?.extra?.libros?.aesop?.leidos||{};
  check(!!leidos[1],'el capítulo queda marcado como leído');
  // filtros y búsqueda
  await p.goto(BASE+'#estudio/lectura');await p.waitForTimeout(700);
  check(['Lazarillo','Quijote','Bécquer'].every(t=>v.includes(t)),'la biblioteca muestra los libros en español');
  check(/Continuar leyendo/.test(await texto('#vista')),'«Continuar leyendo» aparece con un libro empezado');
  await p.click('summary:has-text("Filtrar")');await p.click('[data-filtro="idioma"][data-valor="es"]');await p.waitForTimeout(400);
  let lv=await texto('#lib-lista');
  check(/Lazarillo/.test(lv)&&!/Aesop/.test(lv),'el filtro Idioma: Español deja solo libros en español');
  const gen=await p.$$eval('[data-filtro="genero"]',bs=>bs.map(b=>b.dataset.valor).filter(Boolean));
  await p.click(`[data-filtro="genero"][data-valor="${gen.find(g=>/poes/i.test(g))||gen[0]}"]`);await p.waitForTimeout(400);
  const lv2=await texto('#lib-lista');check(lv2!==lv&&!/Aesop/.test(lv2),'los filtros se combinan (idioma + género)');
  await p.reload();await p.waitForTimeout(900);
  check((await texto('#lib-lista'))===lv2,'los filtros se recuerdan al volver');
  await p.click('[data-filtro="genero"][data-valor=""]');await p.click('[data-filtro="idioma"][data-valor=""]');await p.waitForTimeout(300);
  await p.fill('#lib-buscar','cervantes');await p.waitForTimeout(300);
  lv=await texto('#lib-lista');check(/Quijote/.test(lv)&&!/Lazarillo/.test(lv),'la búsqueda por autor encuentra a Cervantes');
  await foto('lec-5-filtros');
  // libro en español con glosario
  await p.goto(BASE+'#estudio/lectura/libro/lazarillo');await p.waitForTimeout(500);
  check(/Dominio público/.test(await texto('#vista'))&&(await p.locator('.libro-portada .chip').count())>=3,'la portada en español muestra licencia y etiquetas');
  await p.goto(BASE+'#estudio/lectura/libro/lazarillo/2');
  check(await esperar('#vista',/llaman Lázaro de Tormes/),'el capítulo en español se lee');await p.waitForTimeout(800);
  const tocar=async w=>{const c=await p.$eval('.lector',(el,w)=>{const it=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while(n=it.nextNode()){const i=n.textContent.search(new RegExp(`(^|[^\p{L}])${w}([^\p{L}]|$)`,'u'));if(i>=0){const j=n.textContent.indexOf(w,i),r=document.createRange();r.setStart(n,j+1);r.setEnd(n,j+2);const b=r.getBoundingClientRect();window.scrollBy(0,b.top-350);const b2=r.getBoundingClientRect();const x=b2.left+b2.width/2,y=b2.top+b2.height/2;return {x,y}}}return null},w);
    if(c){await p.waitForTimeout(300);await p.mouse.click(c.x,c.y);await p.waitForTimeout(500)}return !!c};
  check(await tocar('desta')&&/De esta/.test(await texto('.lec-palabra')),'tocar «desta» muestra su definición del glosario');
  await foto('lec-6-glosario');
  await p.click('[data-cerrar-palabra]');await p.waitForTimeout(200);
  check(await tocar('molinero')&&await p.locator('#pal-luego').count()===1,'una palabra fuera del glosario ofrece «Guardar para buscar luego»');
  await p.click('#pal-luego');await p.waitForTimeout(300);
  check(((await progreso()).materias?.lectura?.extra?.libros?.lazarillo?.porBuscar||[]).includes('molinero'),'la palabra queda guardada para buscar luego');
  await p.keyboard.press('Escape').catch(()=>{});
  await p.goto(BASE+'#estudio/lectura/libro/lazarillo/2');await esperar('#vista',/Lázaro/);
  await p.click('#lec-preguntas');await p.waitForTimeout(400);
  check(/1\s*\/\s*3|de 3|Pregunta/.test(await texto('#vista'))||(await p.locator('#ses-resp').count())===1,'el capítulo en español tiene sus 3 preguntas');
  await p.goto(BASE+'#estudio/lectura/libro/sorjuana/8');await p.waitForTimeout(1500);
  check(await p.locator('.lec-verso').count()>0,'los poemas se muestran en verso');
  // libro técnico
  await p.goto(BASE+'#estudio/lectura/libro/python/2');
  check(await esperar('#vista',/Variables are names for values/),'el libro técnico se lee');
  check(await p.locator('[data-go="cursos/python/variables"]').count()===1,'«🎯 Practicar este capítulo» lleva al tema del curso');
  await foto('lec-4-tecnico');
  // sin conexión: con el service worker ya activo, un capítulo abierto se vuelve a abrir
  await p.goto(BASE+'#estudio/lectura/libro/alice/1');await esperar('#vista',/Alice was beginning/);
  await p.reload();await p.waitForTimeout(2500);
  await p.goto(BASE+'#estudio/lectura/libro/alice/1');await esperar('#vista',/Alice was beginning/);await p.waitForTimeout(800);
  await ctx.setOffline(true);
  await p.reload().catch(()=>{});await p.waitForTimeout(1500);
  await p.goto(BASE+'#estudio/lectura/libro/alice/1').catch(()=>{});
  check(await esperar('#vista',/Alice was beginning/,10000),'sin conexión, un capítulo ya abierto se vuelve a leer');
  await ctx.setOffline(false);
  check(!err.length,`sin errores en la página${err.length?': '+err.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
