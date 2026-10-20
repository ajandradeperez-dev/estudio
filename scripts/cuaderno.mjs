/* npm run cuaderno: borrar notas del cuaderno en el navegador (360 px, táctil).
   - Menú «⋯» → Borrar → Atrás: el diálogo se cierra y la nota NO se borra.
   - Borrar una: se borra de IndexedDB con su foto propia; la foto que usa otra nota se conserva; el enlace a ella desde
     otra nota queda como texto; sale «🗑️ Nota borrada · Deshacer».
   - Deshacer: vuelve la nota completa (mismas fechas), su foto y el enlace.
   - Seleccionar: contador «2 seleccionadas» y Borrar las dos.
   - Desde la nota: 🗑️ en la cabecera, confirmar y vuelve a la lista.
   Compila, levanta `vite preview` en el puerto 4797 y lo apaga al terminar. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4797,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null; // carpeta para guardar capturas (opcional)
const foto=async(p,nombre)=>{if(capturas)await p.screenshot({path:join(capturas,nombre+'.png')})};
try{
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,colorScheme:process.argv.includes('--oscuro')?'dark':'light'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  const hash=()=>decodeURIComponent(new URL(p.url()).hash.slice(1));
  // Lee o escribe IndexedDB directamente (lo mismo que usa la app)
  const db=(fn,arg)=>p.evaluate(async([fn,arg])=>{
    const d=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
    const tx=(al,modo,g)=>new Promise((res,rej)=>{const t=d.transaction(al,modo),s=t.objectStore(al);let out;const r=g(s);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)});
    const out=await (new Function('tx','arg',`return (${fn})(tx,arg)`))(tx,arg);d.close();return out;
  },[fn.toString(),arg]);
  const nota=id=>db((tx,id)=>tx('notas','readonly',s=>s.get(id)),id);
  const archivo=id=>db((tx,id)=>tx('archivos','readonly',s=>s.get(id)).then(a=>a?{id:a.id,nota:a.nota,tam:a.blob?.size}:null),id);

  await p.goto(BASE+'#notas');await p.waitForTimeout(800);
  const T=Date.UTC(2026,0,15,12);
  await db(async(tx,T)=>{
    const blob=t=>new Blob([t],{type:'image/jpeg'});
    const notas=[
      {id:'pa',titulo:'Nota A',cuerpo:'Mi foto ![foto](img:fa) y la compartida ![foto](img:fc)',materia:null,tema:null,etiquetas:[],fijada:false,creada:T,editada:T},
      {id:'pb',titulo:'Nota B',cuerpo:'También usa ![foto](img:fc) y lee [la nota A](#notas/n/pa).',materia:null,tema:null,etiquetas:[],fijada:false,creada:T+1,editada:T+1},
      {id:'pc',titulo:'Nota C',cuerpo:'Texto C',materia:null,tema:null,etiquetas:[],fijada:false,creada:T+2,editada:T+2},
      {id:'pd',titulo:'Nota D',cuerpo:'Texto D',materia:null,tema:null,etiquetas:[],fijada:false,creada:T+3,editada:T+3}];
    for(const n of notas)await tx('notas','readwrite',s=>s.put(n));
    await tx('archivos','readwrite',s=>s.put({id:'fa',nota:'pa',blob:blob('foto-a'),tipo:'image/jpeg',creada:T}));
    await tx('archivos','readwrite',s=>s.put({id:'fc',nota:'pa',blob:blob('foto-compartida'),tipo:'image/jpeg',creada:T}));
  },T);
  await p.reload();await p.waitForTimeout(900);
  await foto(p,'lista');
  check(await p.locator('[data-menu="pa"]').count()===1,'cada nota de la lista tiene su botón «⋯»');
  check(await p.locator('#sel-empezar').count()===1,'la lista tiene «☑️ Seleccionar»');

  // 1) Atrás cancela el diálogo de confirmación
  await p.click('[data-menu="pa"]');await p.waitForTimeout(300);
  check(await p.locator('.modal [data-r="borrar"]').count()===1,'el menú «⋯» ofrece «🗑️ Borrar»');
  await foto(p,'menu');
  await p.click('.modal [data-r="borrar"]');await p.waitForTimeout(400);
  await foto(p,'confirmar');
  check(/¿Borrar esta nota\?/.test(await p.textContent('.modal').catch(()=>'')),'pide confirmar con un diálogo propio');
  await p.goBack({timeout:2500}).catch(()=>{});await p.waitForTimeout(500);
  check(await p.locator('.modal-fondo').count()===0&&hash()==='notas','Atrás cierra el diálogo y se queda en Notas');
  check(!!(await nota('pa')),'Atrás no borró la nota');

  // 2) Borrar una
  await p.click('[data-menu="pa"]');await p.waitForTimeout(300);
  await p.click('.modal [data-r="borrar"]');await p.waitForTimeout(400);
  await p.click('.modal [data-r="1"]');await p.waitForTimeout(700);
  check(!(await nota('pa')),'la nota A ya no está en IndexedDB');
  check(!(await archivo('fa')),'su foto propia se borró de IndexedDB');
  check(!!(await archivo('fc')),'la foto que usa otra nota se conserva');
  const b1=await nota('pb');
  check(b1&&b1.cuerpo.includes('lee la nota A.')&&!b1.cuerpo.includes('#notas/n/pa'),'el enlace a la nota borrada queda como texto');
  check(await p.locator('[data-menu="pa"]').count()===0,'la lista ya no la muestra');
  await foto(p,'deshacer');
  const toast=await p.textContent('#aviso').catch(()=>'');
  check(/Nota borrada/.test(toast)&&/Deshacer/.test(toast),`aviso «Nota borrada · Deshacer»: ${toast.trim()}`);

  // 3) Deshacer
  await p.click('#aviso .aviso-btn');await p.waitForTimeout(900);
  const a2=await nota('pa');
  check(a2&&a2.creada===T&&a2.editada===T&&a2.titulo==='Nota A','Deshacer restaura la nota con sus fechas');
  const fa=await archivo('fa');
  check(fa&&fa.tam===6,'Deshacer restaura su foto');
  check((await nota('pb')).cuerpo.includes('[la nota A](#notas/n/pa)'),'Deshacer restaura el enlace desde la otra nota');
  check(await p.locator('[data-menu="pa"]').count()===1,'la lista la vuelve a mostrar');

  // 4) Borrar varias
  await p.click('#sel-empezar');await p.waitForTimeout(300);
  await p.click('[data-sel="pc"]');await p.waitForTimeout(200);await p.click('[data-sel="pd"]');await p.waitForTimeout(200);
  await foto(p,'seleccion');
  check(/2 seleccionadas/.test(await p.textContent('#notas-contador')),'contador «2 seleccionadas»');
  await p.click('#sel-borrar');await p.waitForTimeout(400);
  check(/¿Borrar 2 notas\?/.test(await p.textContent('.modal').catch(()=>'')),'confirma «¿Borrar 2 notas?»');
  await p.click('.modal [data-r="1"]');await p.waitForTimeout(800);
  check(!(await nota('pc'))&&!(await nota('pd')),'las dos se borraron de IndexedDB');
  check(/2 notas borradas/.test(await p.textContent('#aviso').catch(()=>'')),'aviso «2 notas borradas · Deshacer»');
  check(await p.locator('#sel-borrar').count()===0,'sale del modo Seleccionar');

  // 5) Desde la nota: 🗑️ en la cabecera
  await p.click('[data-go="notas/n/pb"]');await p.waitForTimeout(700);
  await foto(p,'nota');
  check(await p.locator('.nota-cab #nota-borrar').count()===1,'la nota tiene 🗑️ en su cabecera');
  await p.click('#nota-borrar');await p.waitForTimeout(400);
  await p.click('.modal [data-r="1"]');await p.waitForTimeout(900);
  check(!(await nota('pb')),'borra la nota');check(hash()==='notas',`vuelve a la lista: ${hash()}`);
  check(!!(await archivo('fc')),'la foto compartida sigue (la usa la nota A)');
  check(await p.evaluate(()=>!JSON.parse(localStorage.getItem('ciberlab-diagnostico')||'[]').some(x=>['push','replace'].includes(x.tipo)&&x.enPop)),'popstate no agregó ni reemplazó entradas');
  check(!err.length,`sin errores en la página${err.length?': '+err.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
