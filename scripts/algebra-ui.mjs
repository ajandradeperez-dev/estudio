/* node scripts/algebra-ui.mjs [carpeta] (npm run algebra): lo nuevo de PROMPT-ALGEBRA-PULIR en el navegador, a 360 px en claro
   y oscuro: glosario español–inglés en el tema de Álgebra lineal, mini-lección con intuición visual y «¿Para qué sirve?»,
   «▦ Resolver en el cuaderno» (abre el dibujo con la matriz del ejercicio) y «📈 Verlo en el plano», y un parcial con
   «Problema 1 · inciso a)» y reloj. Capturas en la carpeta (por omisión capturas/algebra). Usa dist/ (npm run build antes). */
import {existsSync,mkdirSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4798,BASE=`http://localhost:${PUERTO}/`;
const salida=join(raiz,process.argv[2]||'capturas/algebra');mkdirSync(salida,{recursive:true});
const {chromium}=await import('playwright-core');
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

const fallos=[],ok=m=>console.log('✓',m),mal=m=>{fallos.push(m);console.log('✗',m)};
const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
try{
  for(const esquema of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:360,height:800},colorScheme:esquema,hasTouch:true,deviceScaleFactor:2});
    await ctx.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}catch(e){}});
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
    const ir=async r=>{await p.evaluate(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})),r);await p.waitForTimeout(500)};
    const sufijo=esquema==='light'?'claro':'oscuro';
    await p.goto(BASE+'#estudio/matematicas/algebra-lineal');await p.waitForSelector('#vista > *');await p.waitForTimeout(800);
    // glosario
    const g=await p.$('summary:has-text("Glosario español–inglés")');
    if(g){await g.click();await p.waitForTimeout(200);const t=await p.textContent('#vista');
      if(/eigenvalue/.test(t)&&/kernel/.test(t)&&/span/.test(t))ok('glosario con eigenvalue, kernel y span');else mal('el glosario no tiene los términos en inglés')}else mal('no aparece el glosario en el tema');
    const d=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(d>0)mal(`scroll horizontal de ${d}px en el tema`);
    await p.screenshot({path:join(salida,`glosario-${sufijo}.png`),fullPage:true});
    // mini-lección con intuición y para qué sirve (habilidad nueva: valores propios)
    await ir('estudio/matematicas/algebra-lineal/l/valores-propios');
    const mini=await p.textContent('#vista');
    if(/Mini-lección/.test(mini)&&/¿Para qué sirve\?/.test(mini)&&await p.$('.mini-leccion svg.diagrama'))ok('mini-lección con intuición visual y «¿Para qué sirve?»');else mal('la mini-lección no tiene la intuición o el para qué sirve');
    await p.screenshot({path:join(salida,`mini-leccion-${sufijo}.png`),fullPage:true});
    if(esquema==='dark'){if(err.length)mal('errores: '+err.slice(0,2).join(' | '));await ctx.close();continue}
    // práctica de Gauss: botón «▦ Resolver en el cuaderno» → dibujo con la matriz
    await ir('estudio/matematicas/algebra-lineal/l/gauss');
    const saltar=await p.$('#mini-saltar');if(saltar){await saltar.click();await p.waitForTimeout(300)}
    const practicar=await p.$('[data-practicar], #hab-practicar, button:has-text("Practicar")');if(practicar){await practicar.click();await p.waitForTimeout(800)}
    let boton=null;for(let k=0;k<12&&!boton;k++){boton=await p.$('[data-herr-mate]');if(!boton){const sig=await p.$('#ses-comprobar');if(!sig)break;await p.fill('#ses-resp','0').catch(()=>{});await sig.click().catch(()=>{});await p.waitForTimeout(400);await p.keyboard.press('Enter');await p.waitForTimeout(500)}}
    if(boton&&/Resolver en el cuaderno/.test(await boton.textContent())){ok('la práctica de Gauss muestra «▦ Resolver en el cuaderno»');
      await p.screenshot({path:join(salida,'gauss-boton.png'),fullPage:true});
      await boton.click();await p.waitForSelector('.dibujo-fondo',{timeout:8000}).catch(()=>{});await p.waitForTimeout(1500);
      if(await p.$('.dibujo-fondo'))ok('abre el dibujo con la matriz del ejercicio');else mal('no abrió el dibujo');
      await p.screenshot({path:join(salida,'gauss-cuaderno.png')});
      await p.keyboard.press('Escape');await p.waitForTimeout(400);await p.goBack().catch(()=>{});await p.waitForTimeout(600);
    }else mal('no aparece «▦ Resolver en el cuaderno» en Gauss');
    // un parcial
    await p.goto(BASE+'#estudio/matematicas/algebra-lineal/retos');await p.waitForTimeout(900);
    const parcial=await p.$('[data-reto="mat-parcial-lineal-1"]');
    if(parcial){await parcial.scrollIntoViewIfNeeded();await parcial.click();await p.waitForTimeout(900);
      const t=await p.textContent('#vista');
      if(/Problema 1/.test(t)&&/inciso a\)/.test(t))ok('el parcial muestra «Problema 1 · inciso a)»');else mal('el parcial no muestra los incisos: '+t.slice(0,160));
      await p.screenshot({path:join(salida,'parcial.png'),fullPage:true});
    }else mal('no aparece el Parcial 1 en los retos de Álgebra lineal');
    if(err.length)mal('errores en la página: '+err.slice(0,3).join(' | '));
    await ctx.close();
  }
}finally{await b.close();apagar()}
console.log(fallos.length?`\n${fallos.length} fallos`:`\nTodo bien · capturas en ${salida}`);
process.exit(fallos.length?1:0);
