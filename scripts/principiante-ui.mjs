/* npm run principiante -- --navegador (o node scripts/principiante-ui.mjs): un principiante de verdad en el navegador
   (360 px, táctil), en «Sistemas por eliminación de Gauss» sin haberla practicado:
   - ve la mini-lección (1 la idea, 2 un ejemplo resuelto, 3 un ejemplo a medias) y puede completar el último paso;
   - en la práctica, el primer ejercicio es un ejemplo que se desvanece («Te damos N de M pasos»);
   - «💡 Pista» sube de 1/3 a 3/3: idea, primer paso con los números del ejercicio, solución completa y «Ahora tú»;
   - «🤷 No sé cómo empezar» muestra la solución y lleva a un gemelo (otro enunciado) sin contar como fallo;
   - al fallar, la hoja dice dónde se desvió y ofrece «Ver solución paso a paso» e «Intentar un gemelo».
   Compila (salvo --sin-build), levanta `vite preview` en el puerto 4796 y lo apaga al terminar. --capturas <dir> guarda imágenes. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4796,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null;

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
try{
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,colorScheme:process.argv.includes('--oscuro')?'dark':'light'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  const foto=async n=>{if(capturas)await p.screenshot({path:join(capturas,n+'.png'),fullPage:true})};
  const texto=async sel=>(await p.textContent(sel).catch(()=>''))||'';
  await p.goto(BASE+'#estudio/matematicas/algebra-lineal/l/gauss');await p.waitForTimeout(900);
  // mini-lección
  check(/Mini-lección · 1 de 3/.test(await texto('#vista')),'la primera vez se muestra la mini-lección (1 de 3)');
  check(await p.locator('#mini-saltar').count()===1,'hay «Ya lo sé, ir a practicar»');
  await foto('1-mini');
  await p.click('#mini-siguiente');await p.waitForTimeout(300);
  check(/Un ejemplo resuelto/.test(await texto('#vista'))&&await p.locator('.mini-leccion .paso-proc').count()>=2,'2 de 3: ejemplo resuelto con sus pasos');
  await p.click('#mini-siguiente');await p.waitForTimeout(300);
  check(/completa el último paso/.test(await texto('#vista'))&&await p.locator('#mini-resp').count()===1,'3 de 3: ejemplo a medias para completar');
  await p.fill('#mini-resp','0, 0');await p.click('#mini-comprobar');await p.waitForTimeout(300);
  check(/La respuesta era|Correcto/.test(await texto('.mini-leccion')),'el ejemplo a medias se corrige');
  await foto('2-mini-medias');
  await p.click('#mini-practicar');await p.waitForTimeout(500);
  // ejemplo que se desvanece
  check(/Te damos \d+ de \d+ pasos/.test(await texto('#ses-cuerpo')),`primer ejercicio: ejemplo que se desvanece («${(await texto('#ses-cuerpo .etiqueta-actividad')).trim()}»)`);
  await foto('3-desvanecido');
  // pistas en escalera
  const enun0=await texto('#ses-cuerpo .pregunta');
  for(const n of [1,2,3]){
    check(new RegExp(`${n}/3`).test(await texto('#ses-pista')),`el botón muestra la pista ${n}/3`);
    await p.click('#ses-pista');await p.waitForTimeout(250);
  }
  const cuerpo=await texto('#ses-cuerpo');
  check(/Idea:/.test(cuerpo),'pista 1: la idea');
  const nums=(enun0.match(/\d+/g)||[]);
  const p2=(await p.locator('#ses-cuerpo .pista').nth(1).textContent().catch(()=>''))||'';
  check(/Paso 1/.test(cuerpo)&&nums.some(x=>p2.includes(x)),`pista 2: el primer paso con números del ejercicio («${p2.trim().slice(0,70)}…»)`);
  check(/Solución completa/.test(cuerpo)&&await p.locator('#ses-ahora-tu').count()===1,'pista 3: solución completa y «Ahora tú»');
  check(/Con pista cuenta como práctica/.test(cuerpo),'aviso amable: «Con pista cuenta como práctica…»');
  await foto('4-pistas');
  await p.click('#ses-ahora-tu');await p.waitForTimeout(400);
  const enun1=await texto('#ses-cuerpo .pregunta');
  check(enun1&&enun1!==enun0&&await p.locator('#ses-pista').count()===1,'«Ahora tú» cambia a un gemelo sin pistas abiertas');
  // No sé cómo empezar
  await p.click('#ses-nosecomo');await p.waitForTimeout(300);
  check(/Así se resuelve/.test(await texto('#ses-cuerpo'))&&/cuenta como visto/.test(await texto('#ses-cuerpo')),'«No sé cómo empezar»: solución completa, sin castigo');
  await foto('5-nose');
  await p.click('#ses-ahora-tu');await p.waitForTimeout(400);
  const enun2=await texto('#ses-cuerpo .pregunta');
  check(enun2&&enun2!==enun1,'y luego un gemelo');
  await p.click('#ses-nosecomo');await p.waitForTimeout(300);
  check(await p.locator('#ses-minilec').count()===1,'2 veces seguidas: ofrece la mini-lección');
  await p.click('#ses-ahora-tu');await p.waitForTimeout(400);
  // fallar: retroalimentación útil
  for(const c of await p.$$('#vista .celda'))await c.fill('99');
  if(await p.locator('#ses-resp').count())await p.fill('#ses-resp','99');
  await p.click('#ses-comprobar');await p.waitForTimeout(400);
  const hoja=await texto('#hoja');
  check(/Dónde se desvió/.test(hoja),'al fallar dice dónde se desvió');
  check(await p.locator('#hoja-proc').count()===1&&/solución paso a paso/.test(hoja),'ofrece «Ver solución paso a paso»');
  check(await p.locator('#hoja-gemelo').count()===1,'ofrece «Intentar un gemelo»');
  await foto('6-fallo');
  await p.click('#hoja-gemelo');await p.waitForTimeout(400);
  check(/Ahora tú|parecido/.test(await texto('#ses-cuerpo .etiqueta-actividad')),'«Intentar un gemelo» lleva a uno parecido');
  check(!err.length,`sin errores en la página${err.length?': '+err.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
