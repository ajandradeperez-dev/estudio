/* npm run ingles-nivel: la práctica por nivel de Inglés en el navegador (360 px, táctil): la página del nivel, una
   lectura con sus preguntas, una escucha, el vocabulario (lista con audio y «Practicar 10»), una tarea de escritura
   revisada con la rúbrica (el texto modelo la cumple; un texto pobre no) y lo fallado en el repaso.
   Compila (salvo --sin-build), levanta `vite preview` en el puerto 4794 y lo apaga al terminar. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4794,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const {NIVELES}=await import(pathToFileURL(join(raiz,'src','materias','ingles','nivel','datos.js')).href);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
try{
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  const ir=async r=>{await p.goto(BASE+'#'+r);await p.waitForSelector('#vista > *');await p.waitForTimeout(400)};
  const texto=async()=>(await p.textContent('#vista'))||'';
  for(const [n,d] of Object.entries(NIVELES)){if(!d.lecturas.length)continue;
    await ir(`estudio/ingles/hablar/nivel/${n}`);
    check(/Lecturas graduadas/.test(await texto())&&await p.locator('[data-go*="/lectura/"]').count()===d.lecturas.length,`${n}: la página del nivel muestra sus ${d.lecturas.length} lecturas`);}
  await ir('estudio/ingles/hablar');
  check(/Práctica por nivel/.test(await texto()),'la portada de Hablar enlaza la práctica por nivel');
  // lectura: responder todas bien (la primera respuesta de cada pregunta)
  const L=NIVELES.A1.lecturas[0];
  await ir(`estudio/ingles/hablar/nivel/A1/lectura/${L.id}`);
  check(/Diego/.test(await texto()),'la lectura muestra el texto');
  await p.click('#nv-empezar');
  for(const x of L.preguntas){await p.fill('#ses-resp',x.respuestas[0]);await p.click('#ses-comprobar');await p.waitForSelector('#hoja-seguir');await p.click('#hoja-seguir');await p.waitForTimeout(150)}
  check(/Lo entendiste/.test(await texto()),'con todo bien, la lectura queda hecha');
  await ir('estudio/ingles/hablar/nivel/A1');
  check(await p.locator(`[data-go$="/lectura/${L.id}"] .icono`).textContent()==='✅','la lectura aparece con ✅ en el nivel');
  // escucha: una mal → al repaso
  const E=NIVELES.A1.escuchas[0];
  await ir(`estudio/ingles/hablar/nivel/A1/escucha/${E.id}`);await p.click('#nv-empezar');
  await p.fill('#ses-resp','zzz');await p.click('#ses-comprobar');await p.waitForSelector('#hoja');
  const rep=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('ciberlab-progreso')).repaso));
  check(rep.includes(`ingles/n/${E.id}/0`),'una pregunta fallada de la escucha entra al repaso');
  // vocabulario
  await ir('estudio/ingles/hablar/nivel/A1/vocabulario/0');
  check(await p.locator('.vocab-lista li').count()===40,'el tema de vocabulario muestra sus 40 palabras con ejemplo');
  await p.click('#vc-practicar');await p.waitForSelector('#ses-resp');
  const enun=await p.textContent('#ses-cuerpo .pregunta');
  const w=NIVELES.A1.vocabulario[0].palabras.split('\n').map(l=>l.split('|').map(x=>x.trim())).find(([,es])=>enun.includes(`«${es}»`));
  await p.fill('#ses-resp',w?.[0]||'x');await p.click('#ses-comprobar');await p.waitForSelector('#hoja');
  check(await p.locator('#hoja.bien').count()===1,`vocabulario: «${w?.[1]}» → «${w?.[0]}» es correcto`);
  // escritura con rúbrica
  const T=NIVELES.A1.escritura[2];
  await ir(`estudio/ingles/hablar/nivel/A1/escritura/${T.id}`);
  await p.fill('#es-texto','my house is big');await p.click('#es-revisar');await p.waitForTimeout(200);
  check(/Rúbrica: \d+ de \d+/.test(await texto())&&!/Cumple toda la rúbrica/.test(await texto()),'un texto pobre no cumple la rúbrica y dice qué falta');
  await p.fill('#es-texto',T.modelo);await p.click('#es-revisar');await p.waitForTimeout(200);
  check(/Cumple toda la rúbrica/.test(await texto()),'el texto modelo cumple toda la rúbrica');
  await ir('estudio/ingles/hablar/nivel/A1/escritura/'+T.id);
  check((await p.inputValue('#es-texto')).length>20,'el borrador del texto se recuerda');
  check(!err.length,`sin errores de JS ${err.slice(0,2).join(' | ')}`);
}finally{await b.close();apagar()}
console.log(f?`\n${f} fallos`:'\nTodo bien');process.exit(f?1:0);
