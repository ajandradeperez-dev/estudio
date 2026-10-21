/* node scripts/capturas-pistas.mjs <carpeta>: capturas a 360 px, en claro y oscuro, de la pista de nivel 2 (paso a paso)
   y de la solución completa de Gauss y de una derivada (regla del producto). Sirven para revisar a ojo que cada paso
   tenga una sola acción, la frase arriba y la fórmula aparte (sin partirse). Compila salvo --sin-build. */
import {existsSync,mkdirSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4792,BASE=`http://localhost:${PUERTO}/`;
const dir=process.argv.find((a,i)=>i>1&&!a.startsWith('--'))||join(raiz,'capturas');mkdirSync(dir,{recursive:true});
const nav=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const b=await chromium.launch({executablePath:nav});
try{
  for(const esquema of ['light','dark'])for(const [nombre,ruta] of [['gauss','estudio/matematicas/algebra-lineal/l/gauss'],['derivada','estudio/matematicas/calculo-diferencial/l/regla-producto']]){
    const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,colorScheme:esquema});
    await ctx.addInitScript(()=>{localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
    const p=await ctx.newPage();
    await p.goto(BASE+'#'+ruta);await p.waitForTimeout(800);
    await p.click('#mini-saltar, #hab-empezar');await p.waitForTimeout(500);
    // saltar ejemplos de lectura hasta una pregunta con pista
    for(let i=0;i<6&&!(await p.locator('#ses-pista').count());i++){if(await p.locator('#ses-continuar').count())await p.click('#ses-continuar');else break;await p.waitForTimeout(300)}
    await p.click('#ses-pista');await p.waitForTimeout(200);await p.click('#ses-pista');await p.waitForTimeout(300);
    await p.screenshot({path:join(dir,`${nombre}-pista2-paso1-${esquema}.png`),fullPage:true});
    if(await p.locator('[data-ver-todos="v2"]').count()){await p.click('[data-ver-todos="v2"]');await p.waitForTimeout(300)}
    await p.screenshot({path:join(dir,`${nombre}-pista2-todos-${esquema}.png`),fullPage:true});
    await p.click('#ses-pista');await p.waitForTimeout(300);
    if(await p.locator('[data-ver-todos="v3"]').count()){await p.click('[data-ver-todos="v3"]');await p.waitForTimeout(300)}
    await p.screenshot({path:join(dir,`${nombre}-solucion-${esquema}.png`),fullPage:true});
    await ctx.close();console.log(`✓ ${nombre} ${esquema}`);
  }
}finally{await b.close();apagar()}
console.log(`Capturas en ${dir}`);
