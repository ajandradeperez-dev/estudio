/* node scripts/mis-libros.mjs [--sin-build] (lo corre npm run lectura): 🔒 Mis libros en el navegador.
   Con libros inventados (scripts/fixtures/libros-propios.mjs): EPUB (3 capítulos, portada, imagen, versos, sin scripts),
   EPUB con DRM (aviso y no se abre), PDF de 5 páginas (capítulos, sin encabezados ni números de página, palabras con guion
   unidas) y TXT (Capítulo 1/2/3). Portada y etiquetas (🔒 Solo para mí), tiempo de lectura, tocar una palabra, avance
   solo en este dispositivo, borrar con Deshacer, y privacidad: el progreso, las notas y el respaldo por defecto no
   tienen ninguna frase del libro (con «Incluir mis libros», sí). Capturas a 360 px, Tab S10 y laptop, claro y oscuro,
   junto a un libro de la biblioteca, en capturas/mis-libros/. */
import {existsSync,mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {chromium} from 'playwright-core';
import {crearFixtures,FRASE} from './fixtures/libros-propios.mjs';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4796,BASE=`http://localhost:${PUERTO}/`,salida=join(raiz,'capturas','mis-libros');mkdirSync(salida,{recursive:true});
const fx=crearFixtures(join(salida,'fixtures'));
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
// en dist/ no hay nada de los libros importados
const enDist=d=>readdirSync(d,{withFileTypes:true}).some(e=>e.isDirectory()?enDist(join(d,e.name)):/\.(js|html|json|mjs)$/.test(e.name)&&readFileSync(join(d,e.name),'utf8').toLowerCase().includes(FRASE));

try{
  const ctx=await b.newContext({viewport:{width:360,height:800},hasTouch:true,acceptDownloads:true,deviceScaleFactor:2});
  await ctx.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}catch(e){}});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  const ir=async r=>{await p.evaluate(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})),r);await p.waitForTimeout(700)};
  const importar=async ruta=>{await p.goto(BASE+'#estudio/lectura');await p.waitForTimeout(400);await p.goto(BASE+'#estudio/lectura/mis/importar');await p.waitForSelector('#mis-archivo',{state:'attached'});await p.setInputFiles('#mis-archivo',ruta);
    await p.waitForFunction(()=>/Revisa tu libro|protegido|No se pudo|no tiene texto|formato/i.test(document.querySelector('#vista')?.textContent||''),null,{timeout:60000});await p.waitForTimeout(300)};
  await p.goto(BASE+'#estudio/lectura');await p.waitForTimeout(1200);
  check(/🔒 Mis libros/.test(await p.textContent('#vista'))&&await p.$('[data-go="estudio/lectura/mis/importar"]'),'la biblioteca tiene «🔒 Mis libros» con «📥 Importar un libro»');
  // EPUB
  await importar(fx.epub);
  const caps=await p.$$eval('.mis-cap-titulo',xs=>xs.map(x=>x.value));
  check(caps.length===3&&caps[0]==='Capítulo 1: La llegada'&&caps[2]==='Capítulo 3: El secreto',`EPUB: 3 capítulos con sus títulos del índice (${caps.join(' | ')})`);
  check(await p.inputValue('#mis-titulo')==='El Faro de Prueba'&&await p.inputValue('#mis-autor')==='Autora Inventada'&&await p.inputValue('#mis-idioma')==='es','EPUB: título, autor e idioma del content.opf');
  check(!!await p.$('.mis-portada-prev'),'EPUB: trae su portada');
  await p.screenshot({path:join(salida,'revisar-360.png'),fullPage:true});
  await p.click('[data-emoji="🦉"]');await p.click('[data-genero="Novela"]');await p.waitForTimeout(150);
  await p.click('#mis-guardar');await p.waitForURL(/libro\/mio-/,{timeout:20000});await p.waitForTimeout(900);
  const id=decodeURIComponent(new URL(p.url()).hash).split('/')[3];
  const port=await p.textContent('#vista');
  check(/🔒 Solo para mí/.test(port)&&/Novela/.test(port)&&/≈ \d+ min/.test(port)&&/🇲🇽 Español/.test(port),'portada: «🔒 Solo para mí», etiquetas, idioma y tiempo de lectura');
  check(await p.$eval('.libro-portada-img',i=>i.naturalWidth>0).catch(()=>false),'portada: la imagen del EPUB se ve');
  await p.screenshot({path:join(salida,'portada-360-claro.png'),fullPage:true});
  // capítulos
  await ir(`estudio/lectura/libro/${id}/1`);await p.waitForSelector('.lector');await p.waitForTimeout(500);
  const html1=await p.$eval('.lector',a=>a.innerHTML);
  check(html1.includes(FRASE)&&!/<script|onclick|alert\(/i.test(html1),'capítulo 1: el texto, sin scripts ni eventos');
  check(/<b>todos<\/b>/.test(html1)&&/<i>curiosidad<\/i>/.test(html1),'capítulo 1: conserva negritas y cursivas');
  check(await p.$eval('.lector [data-mio-img]',i=>new Promise(r=>{const ok=()=>r(i.naturalWidth>0);i.complete?ok():i.onload=ok})).catch(()=>false),'capítulo 1: la imagen del libro se ve');
  // tocar una palabra
  const caja=await p.$eval('.lector .lec-bloque',e=>{const r=e.getBoundingClientRect();return {x:r.left+20,y:r.top+10}});await p.mouse.click(caja.x,caja.y);await p.waitForTimeout(400);
  check(!!await p.$('.lec-palabra'),'tocar una palabra abre su ficha');await p.click('[data-cerrar-palabra]').catch(()=>{});
  await ir(`estudio/lectura/libro/${id}/2`);await p.waitForSelector('.lector');await p.waitForTimeout(400);
  check(await p.$eval('.lector',a=>!!a.querySelector('.lec-verso')&&(a.querySelector('.lec-verso').innerHTML.match(/<br>/g)||[]).length>=4).catch(()=>false),'capítulo 2: los versos se ven como poesía');
  await p.screenshot({path:join(salida,'versos-360-claro.png'),fullPage:true});
  await p.click('#lec-leido');await p.waitForTimeout(300);
  const ls=await p.evaluate(()=>({avance:localStorage.getItem('ciberlab-mis-libros-avance')||'',progreso:localStorage.getItem('ciberlab-progreso')||''}));
  check(ls.avance.includes(id)&&!ls.progreso.includes(id),'el avance se guarda solo en este dispositivo (no en el progreso que se sincroniza)');
  // privacidad: progreso, notas y respaldo por defecto sin frases del libro
  const notas=await p.evaluate(async()=>{const d=await new Promise(r=>{const q=indexedDB.open('ciberlab-notas');q.onsuccess=()=>r(q.result)});const t=d.transaction('notas').objectStore('notas').getAll();return new Promise(r=>{t.onsuccess=()=>r(JSON.stringify(t.result))})});
  check(!ls.progreso.toLowerCase().includes(FRASE)&&!notas.toLowerCase().includes(FRASE),'privacidad: el progreso y las notas no tienen texto del libro');
  const respaldo=async marcar=>{await p.goto(BASE+'#notas');await p.waitForTimeout(800);await p.evaluate(()=>{const d=document.querySelector('.notas-respaldo');if(d)d.open=true});await p.waitForTimeout(200);if(marcar)await p.click('.resp-casilla');
    const [d]=await Promise.all([p.waitForEvent('download'),p.click('#resp-exportar')]);const ruta=join(salida,`respaldo-${marcar?'con':'sin'}.estudio`);await d.saveAs(ruta);const buf=readFileSync(ruta);return (buf[0]===0x1f?gunzipSync(buf):buf).toString('utf8')};
  check((await respaldo(true)).includes(id),'con «Incluir mis libros» el respaldo sí los lleva');
  check(!enDist(join(raiz,'dist')),'privacidad: dist/ no tiene ninguna frase del libro');
  // DRM
  await importar(fx.drm);
  check(/protegido contra copia \(DRM\)/.test(await p.textContent('#vista'))&&!await p.$('#mis-guardar'),'EPUB con DRM: aviso amable y no se abre');
  await p.screenshot({path:join(salida,'drm-360.png'),fullPage:true});
  // PDF
  await importar(fx.pdf);
  const capsPdf=await p.$$eval('.mis-cap-titulo',xs=>xs.map(x=>x.value));
  check(capsPdf.length===2&&capsPdf[0]==='Capítulo 1'&&capsPdf[1]==='Capítulo 2',`PDF: 2 capítulos por tamaño de letra (${capsPdf.join(' | ')})`);
  await p.click('#mis-guardar');await p.waitForURL(/libro\/mio-/,{timeout:20000});const idPdf=decodeURIComponent(new URL(p.url()).hash).split('/')[3];
  await ir(`estudio/lectura/libro/${idPdf}/1`);await p.waitForSelector('.lector');const tp=await p.textContent('.lector');
  check(!/Manual de Prueba/.test(tp),'PDF: sin el encabezado que se repite en cada página');
  check(/comprender este fenómeno/.test(tp)&&/se llaman mareas vivas/.test(tp)&&!/compren-|lla-/.test(tp),'PDF: palabras partidas con guion unidas');
  check(!/(^|\s)[1-5](\s|$)/.test(tp.replace(/dos veces/,'')),'PDF: sin números de página sueltos');
  // TXT
  await importar(fx.txt);
  check((await p.$$eval('.mis-cap-titulo',xs=>xs.map(x=>x.value))).join('|')==='Capítulo 1|Capítulo 2|Capítulo 3','TXT: «Capítulo 1/2/3»');
  // volver a dividir: unir y partir
  await p.click('[data-unir="0"]');await p.waitForTimeout(150);check((await p.$$('.mis-cap-titulo')).length===2,'volver a dividir: unir con el siguiente');
  await p.click('[data-partir="0"]');await p.waitForTimeout(150);check((await p.$$('.mis-cap-titulo')).length===3,'volver a dividir: partir en dos');
  // borrar con Deshacer
  await p.goto(BASE+`#estudio/lectura/libro/${idPdf}`);await p.waitForTimeout(900);await p.click('#mio-borrar');await p.click('.modal [data-r="1"]');await p.waitForTimeout(700);
  check(!(await p.textContent('#vista')).includes('Manual'),'borrar el libro lo quita de Mis libros');
  await p.click('.aviso button, .aviso-accion button').catch(()=>{});await p.waitForTimeout(900);await p.goto(BASE+'#estudio/lectura');await p.waitForTimeout(1200);
  check((await p.$$('.mis-libros .libro-tarjeta')).length===2,'Deshacer lo devuelve');
  if(err.length)check(false,'errores en la página: '+err.slice(0,3).join(' | '));
  await ctx.close();
  // capturas: el libro propio junto a uno de la biblioteca, en el teléfono, la Tab S10 y la laptop, claro y oscuro
  for(const [nombre,w,h,tel] of [['360',360,800,true],['tab-s10',1280,800,true],['laptop',1440,900,false]])for(const esquema of ['light','dark']){
    const c2=await b.newContext({viewport:{width:w,height:h},hasTouch:tel,colorScheme:esquema,storageState:undefined});
    await c2.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}catch(e){}});
    const q=await c2.newPage();await q.goto(BASE+'#estudio/lectura/mis/importar');await q.waitForSelector('#mis-archivo',{state:'attached'});await q.setInputFiles('#mis-archivo',fx.epub);
    await q.waitForSelector('#mis-guardar',{timeout:60000});await q.click('#mis-guardar');await q.waitForURL(/libro\/mio-/);const i2=decodeURIComponent(new URL(q.url()).hash).split('/')[3];
    const sufijo=`${nombre}-${esquema==='light'?'claro':'oscuro'}`;
    await q.goto(BASE+'#estudio/lectura');await q.waitForTimeout(1200);await q.screenshot({path:join(salida,`biblioteca-${sufijo}.png`)});
    await q.goto(BASE+`#estudio/lectura/libro/${i2}/1`);await q.waitForSelector('.lector');await q.waitForTimeout(700);await q.screenshot({path:join(salida,`mio-capitulo-${sufijo}.png`)});
    await q.goto(BASE+'#estudio/lectura/libro/samaniego/1');await q.waitForSelector('.lector').catch(()=>{});await q.waitForTimeout(700);await q.screenshot({path:join(salida,`biblioteca-capitulo-${sufijo}.png`)});
    const d=await q.evaluate(()=>document.documentElement.scrollWidth-innerWidth);check(d<=0,`${sufijo}: sin scroll de lado`);
    await c2.close();
  }
}finally{await b.close();apagar()}
console.log(f?`\n${f} fallos`:`\nMis libros: todo bien · capturas en ${salida}`);
process.exit(f?1:0);
