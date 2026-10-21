/* node scripts/python-ui.mjs: el curso de Python en el navegador (360 px, táctil), con Pyodide de verdad (la primera vez
   lo descarga de jsDelivr: necesita internet).
   - Editor: ejecuta print; un error sale explicado en español (NameError con su línea); un bucle infinito se corta solo
     por tiempo y «Detener» queda disponible; input() lee el cuadro «Entrada».
   - Laboratorio: el código inicial falla las pruebas; «💡 Pista» sube a 3/3; «No sé cómo empezar» muestra la solución y el
     gemelo; con la solución, «Enviar» pasa todas (visibles y ocultas) y el ejercicio queda resuelto con XP.
   Compila (salvo --sin-build), levanta `vite preview` en el puerto 4795 y lo apaga al terminar. --capturas <dir> [--oscuro]. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4795,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null;
const {tarea}=await import(pathToFileURL(join(raiz,'src','materias','python','laboratorio.js')).href);

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
try{
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,colorScheme:process.argv.includes('--oscuro')?'dark':'light'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  const foto=async n=>{if(capturas)await p.screenshot({path:join(capturas,n+'.png'),fullPage:true})};
  const texto=async sel=>(await p.textContent(sel).catch(()=>''))||'';
  const escribir=async(codigo,sel='#py-codigo')=>{await p.$eval(sel,(el,c)=>{el.value=c;el.dispatchEvent(new Event('input',{bubbles:true}))},codigo)};
  const esperar=async(sel,re,ms=90000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(re.test(await texto(sel)))return true;await p.waitForTimeout(300)}return false};

  // Materia
  await p.goto(BASE+'#cursos/python');await p.waitForTimeout(800);
  check(/Python/.test(await texto('#vista'))&&/Primeros pasos/.test(await texto('#vista')),'la materia Python aparece en Cursos con sus temas');
  await foto('py-1-materia');
  // Editor
  await p.goto(BASE+'#cursos/python/editor');await p.waitForTimeout(800);
  check(await p.locator('.py-teclas .tecla').count()>=12,'el editor tiene la barra de teclas ( : ( ) [ ] { } " \' = # ⇥ )');
  await escribir('x = 2\nprint("hola", x * 21)\n');
  await p.click('#py-ejecutar');
  check(await esperar('#py-resultado',/hola 42/),'▶ Ejecutar corre Python de verdad (la primera vez lo descarga)');
  await escribir('total = 10\nprint(totl)\n');await p.click('#py-ejecutar');
  check(await esperar('#py-resultado',/NameError.*línea 2.*no existe/s,20000),'un NameError sale explicado en español con su línea');
  await foto('py-2-error');
  await escribir('i = 0\nwhile i < 5:\n    print(i)\n');await p.click('#py-ejecutar');
  await p.waitForTimeout(500);
  check(await p.locator('#py-detener:not([disabled])').count()===1,'mientras corre, «⏹ Detener» está disponible');
  check(await esperar('#py-resultado',/bucle infinito/,20000),'un bucle infinito se corta solo y se explica');
  await p.waitForSelector('#py-ejecutar:not([disabled])',{timeout:60000});
  await escribir('n = int(input())\nprint(n * 2)\n');
  await p.click('details.nota-datos summary').catch(()=>{});await p.fill('#py-entrada','21');
  await p.click('#py-ejecutar');
  check(await esperar('#py-resultado',/42/,90000),`input() lee lo escrito en «Entrada»: ${(await texto('#py-resultado')).slice(0,200)}`);
  // Sangría automática al presionar Enter después de «:»
  await p.$eval('#py-codigo',el=>{el.value='for i in range(3):';el.focus();el.setSelectionRange(el.value.length,el.value.length)});
  await p.keyboard.press('Enter');
  check((await p.$eval('#py-codigo',el=>el.value))==='for i in range(3):\n    ','Enter después de «:» agrega 4 espacios de sangría');
  // Laboratorio
  const t=tarea('suma-hasta');
  await p.goto(BASE+'#cursos/python/laboratorio/t/suma-hasta');await p.waitForTimeout(800);
  check(/Suma de 1 a n/.test(await texto('#vista')),'el ejercicio del laboratorio abre');
  await p.click('#lab-probar');
  check(await esperar('#py-resultado',/Pruebas visibles: 0\/2/,90000),`el código inicial no pasa las pruebas visibles (0/2)`);
  for(const n of [1,2,3]){check(new RegExp(`${n}/3`).test(await texto('#lab-pista')),`pista ${n}/3`);await p.click('#lab-pista');await p.waitForTimeout(200)}
  check(/Idea:/.test(await texto('#vista'))&&/Primer paso:.*range\(1, 5\)/s.test(await texto('#vista'))&&/Solución explicada/.test(await texto('#vista')),'las 3 pistas: idea, primer paso con números y solución');
  await foto('py-3-pistas');
  await escribir(t.solucion,'#lab-codigo');await p.click('#lab-enviar');
  check(await esperar('#py-resultado',/Todas las pruebas: 4\/4/,30000),'con la solución, «Enviar» pasa visibles y ocultas (4/4)');
  check(/Resuelto/.test(await texto('#py-resultado')),'queda resuelto (con XP la primera vez)');
  await foto('py-4-resuelto');
  const lab=await p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')||'{}').materias?.python?.extra?.lab||{});
  check(!!lab['suma-hasta'],'se guarda en el progreso (extra.lab)');
  // No sé cómo empezar → gemelo
  await p.goto(BASE+'#cursos/python/laboratorio/t/mayor');await p.waitForTimeout(600);
  await p.click('#lab-nose');await p.waitForTimeout(300);
  check(/Así se resuelve/.test(await texto('#vista'))&&await p.locator('[data-go="cursos/python/laboratorio/t/sin-repetidos"]').count()>=1,'«No sé cómo empezar»: solución paso a paso y «Ahora tú» con el gemelo');
  // Un caso que falla dice cuál
  await escribir('def mayor(v):\n    return v[0]\n','#lab-codigo');await p.click('#lab-enviar');
  check(await esperar('#py-resultado',/esperado.*9.*dio.*3/s,30000),'un caso que falla dice qué se esperaba y qué dio');
  check(!err.length,`sin errores en la página${err.length?': '+err.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
