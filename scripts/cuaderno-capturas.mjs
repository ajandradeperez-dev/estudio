/* node scripts/cuaderno-capturas.mjs <carpeta> [--sin-build]: capturas y medidas del 📝 Cuaderno (PROMPT-NOTAS, Parte 0).
   Teléfono 360×800 y 390×844, laptop 1366×768 y 1440×900, en claro y oscuro: lista vacía, lista con 15 notas, nota
   nueva, nota larga (fórmulas, foto, lista), modo lectura, repasar, menú «⋯», seleccionar y, en el teléfono, el
   teclado abierto (ventana más baja). Escribe <carpeta>/informe.txt con lo que mide en cada pantalla: scroll de lado,
   toques < 44 px, letra del texto, caracteres por línea, si la barra de formato queda dentro de la pantalla y si el
   cursor queda tapado. Sirve para el "antes" y el "después" (los selectores de las dos versiones). */
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4798,BASE=`http://localhost:${PUERTO}/`;
const carpeta=join(raiz,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'capturas/cuaderno');mkdirSync(carpeta,{recursive:true});
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const b=await chromium.launch({executablePath:candidatos.find(x=>existsSync(x))});
const informe=[];

// 15 notas de ejemplo y una larga con fórmulas, foto (JPEG hecho en el navegador) y lista
async function sembrar(p){
  await p.evaluate(async()=>{
    const d=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
    const put=(al,x)=>new Promise((res,rej)=>{const t=d.transaction(al,'readwrite');t.objectStore(al).put(x);t.oncomplete=res;t.onerror=()=>rej(t.error)});
    const c=document.createElement('canvas');c.width=800;c.height=500;const x=c.getContext('2d');x.fillStyle='#e8f0fe';x.fillRect(0,0,800,500);
    x.fillStyle='#1f2430';x.font='bold 48px sans-serif';x.fillText('Pizarrón: f(x) = x² − 4',60,250);x.strokeStyle='#2563eb';x.lineWidth=6;x.strokeRect(30,30,740,440);
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.8));
    await put('archivos',{id:'foto-ejemplo',nota:'larga',blob,tipo:'image/jpeg',ancho:800,alto:500,creada:Date.now()});
    const h=Date.now(),temas=[['matematicas','algebra'],['ingles',null],['ciberseguridad',null],[null,null],['matematicas','calculo-diferencial']];
    for(let i=0;i<15;i++){const [m,t]=temas[i%5];
      await put('notas',{id:'n'+i,titulo:['Ecuaciones cuadráticas','Phrasal verbs','Subredes /26','Ideas para el proyecto','Regla de la cadena'][i%5]+(i>4?` (${i})`:''),
        cuerpo:['La fórmula general: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ sirve siempre.\n- discriminante\n🃏 ¿Qué es el discriminante? | b² − 4ac','**look up** buscar · **give up** rendirse\n🃏 give up | rendirse','Una /26 tiene **64** direcciones y 62 hosts.','- [ ] Leer capítulo 3\n- [x] Hacer resumen','$\\frac{d}{dx} f(g(x)) = f\'(g(x)) g\'(x)$'][i%5],
        materia:m,tema:t,etiquetas:i%3?[]:['examen'],fijada:i===2,creada:h-i*3600e3,editada:h-i*3600e3});}
    await put('notas',{id:'larga',titulo:'Repaso de funciones',cuerpo:`# Funciones cuadráticas
Una función cuadrática tiene la forma $f(x) = ax^2 + bx + c$ con **a ≠ 0**.

## Raíces
La fórmula general: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
- Si $b^2 - 4ac > 0$: dos raíces reales.
- Si $b^2 - 4ac = 0$: una raíz doble.
- Si $b^2 - 4ac < 0$: no hay raíces reales.

![foto](img:foto-ejemplo)

## Pendientes
- [ ] Resolver los ejercicios 1 a 10
- [x] Ver el video del vértice
1. Factorizar
2. Completar el cuadrado

> El vértice está en $x = -\\frac{b}{2a}$.

🃏 ¿Cuántas raíces si el discriminante es negativo? | Ninguna real
🃏 Vértice de ax² + bx + c | x = −b/(2a)
Texto final con ==resaltado== y \`código\` para ver cómo se ve un párrafo largo en una pantalla chica y si se lee cómodo o no.`,materia:'matematicas',tema:'algebra',etiquetas:['examen'],fijada:false,creada:h,editada:h+1000});
    d.close();
  });
}
const quieto=p=>p.waitForTimeout(450);
async function medir(p,nombre,telefono){
  const m=await p.evaluate(tel=>{
    const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
    const chicos=[...document.querySelectorAll('#vista button,#vista a,#vista select,#vista input:not([type=file]),.nota-barra button,.modal button,.ed-barra button')].filter(e=>vis(e)&&!e.closest('.oculto-visual')&&!e.closest('.katex'))
      .filter(e=>{const r=e.getBoundingClientRect();return r.height<(tel?44:32)||r.width<(tel?44:32)}).map(e=>(e.getAttribute('aria-label')||e.textContent||e.id).trim().slice(0,18));
    const cuerpo=document.querySelector('#nota-cuerpo,.ed-bloques,.nota-render,.ed-texto');
    const fs=cuerpo?parseFloat(getComputedStyle(cuerpo).fontSize):null,ancho=cuerpo?cuerpo.getBoundingClientRect().width:null;
    const barra=document.querySelector('.nota-barra,.ed-herr');let barraTxt='sin barra';
    if(barra&&vis(barra)){const r=barra.getBoundingClientRect();barraTxt=`barra y=${Math.round(r.top)}–${Math.round(r.bottom)} de ${innerHeight}${r.bottom>innerHeight+1?' (SE SALE)':''}${barra.scrollWidth>barra.clientWidth+2?`, ${barra.querySelectorAll('button').length} botones con scroll de lado`:`, ${barra.querySelectorAll('button').length} botones`}`}
    const foco=document.activeElement;let cursor='';
    if(foco&&/TEXTAREA|INPUT/.test(foco.tagName)&&barra&&vis(barra)){const r=foco.getBoundingClientRect(),br=barra.getBoundingClientRect();
      cursor=r.top>br.top-20?' · el texto que escribes queda DETRÁS de la barra':''}
    return {scroll:document.documentElement.scrollWidth>innerWidth+1,chicos:[...new Set(chicos)].slice(0,8),nChicos:chicos.length,
      letra:fs,cpl:fs&&ancho?Math.round(ancho/(fs*.5)):null,barra:barraTxt+cursor,alto:document.documentElement.scrollHeight};
  },telefono);
  informe.push(`${nombre.padEnd(34)} ${m.scroll?'SCROLL DE LADO · ':''}${m.nChicos?`${m.nChicos} toques chicos (${m.chicos.join(', ')}) · `:''}${m.letra?`letra ${m.letra}px, ~${m.cpl} car/línea · `:''}${m.barra} · alto ${m.alto}px`);
}
async function foto(p,nombre,tel){await quieto(p);await p.screenshot({path:join(carpeta,nombre+'.png'),fullPage:false});await medir(p,nombre,tel)}
const clic=async(p,sels)=>{for(const s of sels)if(await p.locator(s).first().isVisible().catch(()=>false)){await p.locator(s).first().click();return true}return false};

const TAMANOS=[['tel360',360,800,true],['tel390',390,844,true],['lap1366',1366,768,false],['lap1440',1440,900,false]];
try{
  for(const tema of ['light','dark'])for(const [n,w,h,tel] of TAMANOS){
    const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:tel?2:1,isMobile:tel,hasTouch:tel,colorScheme:tema});
    await ctx.addInitScript(()=>{localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
    const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
    const pre=`${n}-${tema==='dark'?'oscuro':'claro'}`;
    await p.goto(BASE+'#notas');await p.waitForSelector('#vista > *');await foto(p,`${pre}-01-lista-vacia`,tel);
    await sembrar(p);await p.reload();await p.waitForSelector('.nota-item');await foto(p,`${pre}-02-lista-15`,tel);
    if(tel){await p.evaluate(()=>scrollTo(0,99999));await foto(p,`${pre}-02b-lista-abajo`,tel);await p.evaluate(()=>scrollTo(0,0))}
    await clic(p,['[data-menu]','.nota-menu']);await quieto(p);await foto(p,`${pre}-07-menu`,tel);await p.keyboard.press('Escape');await clic(p,['.modal [data-x]','.modal button:has-text("Cancelar")']);await quieto(p);
    if(await clic(p,['#sel-empezar'])){await quieto(p);const its=p.locator('[data-sel]');if(await its.count()>1){await its.nth(0).click();await its.nth(1).click()}await foto(p,`${pre}-08-seleccionar`,tel);await clic(p,['#sel-cancelar'])}
    await clic(p,['#nota-nueva','.notas-fab']);await p.waitForTimeout(700);await foto(p,`${pre}-03-nota-nueva`,tel);
    await p.goto(BASE+'#notas/n/larga');await p.waitForTimeout(900);await foto(p,`${pre}-04-nota-larga`,tel);
    if(tel){await p.evaluate(()=>scrollTo(0,99999));await foto(p,`${pre}-04b-nota-larga-abajo`,tel);await p.evaluate(()=>scrollTo(0,0))}
    if(tel){ // teclado abierto: ventana más baja con el cursor en el texto
      await clic(p,['#nota-cuerpo','.ed-bloque[data-tipo="texto"]']);await p.setViewportSize({width:w,height:Math.round(h*.52)});
      await p.evaluate(()=>{const t=document.querySelector('#nota-cuerpo,.ed-texto');if(t){t.focus();t.setSelectionRange?.(t.value.length,t.value.length);t.scrollIntoView({block:'nearest'})}});
      await foto(p,`${pre}-09-teclado`,tel);await p.setViewportSize({width:w,height:h})}
    if(await clic(p,['[data-modo="ver"]','#nota-leer'])){await foto(p,`${pre}-05-ver`,tel)}
    await p.goto(BASE+'#notas/n/larga');await p.waitForTimeout(700);
    if(await clic(p,['[data-modo="repasar"]','#nota-repasar'])){await foto(p,`${pre}-06-repasar`,tel)}
    if(err.length)informe.push(`${pre}: errores JS ${[...new Set(err)].join(' | ')}`);
    await ctx.close();
  }
}finally{await b.close();apagar()}
writeFileSync(join(carpeta,'informe.txt'),informe.join('\n')+'\n');
console.log(informe.join('\n'));console.log(`\nCapturas en ${carpeta}`);
