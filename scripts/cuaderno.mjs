/* npm run cuaderno: el 📝 Cuaderno en el navegador (teléfono 360 px táctil y laptop 1366 px con teclado y ratón).
   Editor (PROMPT-NOTAS): notas viejas que se ven y se editan igual, crear y escribir, guardado automático, la lista que
   sigue sola con Enter, fórmula con vista previa en vivo y que se edita al tocarla, la barra (negrita, casilla, Σ con su
   teclado de símbolos), teclado simulado (la barra y el cursor no quedan tapados), foto (a lo ancho, ampliar, pie,
   girar), dibujo (abrir el editor, dibujar, guardar y volver a editarlo; el resto en npm run dibujo), mover y borrar bloques
   con Deshacer, modo lectura, tarjeta desde lo seleccionado, Repasar; en la laptop Ctrl+N, Ctrl+B, Ctrl+Shift+8,
   Ctrl+M, Esc, Ctrl+K, Espacio y 1–3, la barra arriba, dos paneles y ≤ ~75 caracteres por línea. Sin scroll de lado y
   con toques ≥ 44 px en el teléfono.
   Borrar notas:
   - Menú «⋯» → Borrar → Atrás: el diálogo se cierra y la nota NO se borra.
   - Borrar una: se borra de IndexedDB con su foto propia; la foto que usa otra nota se conserva; el enlace a ella desde
     otra nota queda como texto; sale «🗑️ Nota borrada · Deshacer».
   - Deshacer: vuelve la nota completa (mismas fechas), su foto y el enlace.
   - Seleccionar: contador «2 seleccionadas» y Borrar las dos.
   - Desde la nota: 🗑️ en la cabecera, confirmar y vuelve a la lista.
   Compila, levanta `vite preview` en el puerto 4797 y lo apaga al terminar. */
import {existsSync} from 'node:fs';
import {spawn,execSync,spawnSync} from 'node:child_process';
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
/* ---------- editor nuevo (PROMPT-NOTAS): un solo modo por bloques ---------- */
const leerDb=(p,fn,arg)=>p.evaluate(async([fn,arg])=>{
  const d=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const tx=(al,modo,g)=>new Promise((res,rej)=>{const t=d.transaction(al,modo),s=t.objectStore(al);let out;const r=g(s);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)});
  const out=await (new Function('tx','arg',`return (${fn})(tx,arg)`))(tx,arg);d.close();return out;
},[fn.toString(),arg]);
const notaDe=(p,id)=>leerDb(p,(tx,id)=>tx('notas','readonly',s=>s.get(id)),id);
const archivoDe=(p,id)=>leerDb(p,(tx,id)=>tx('archivos','readonly',s=>s.get(id)).then(a=>a?{id:a.id,tipo:a.tipo,trazos:a.dibujo?.objetos.length||0}:null),id);
const idNota=p=>decodeURIComponent(new URL(p.url()).hash.slice(1)).split('/')[2];
// comprobaciones de diseño: sin scroll de lado, toques ≥ 44 px en el teléfono
async function diseno(p,que,tel){
  const r=await p.evaluate(tel=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
    const chicos=[...document.querySelectorAll('#vista button,#vista select,#vista input:not([type=file]),.ed-barra button')].filter(e=>vis(e)&&!e.closest('.oculto-visual,.katex'))
      .filter(e=>{const r=e.getBoundingClientRect();return tel&&(r.height<43.5||r.width<43.5)}).map(e=>(e.getAttribute('aria-label')||e.textContent).trim().slice(0,20));
    // textos encimados: elementos con texto propio cuyos rectángulos se cruzan (sin contar padres e hijos ni fórmulas)
    const herr=document.querySelector('.ed-herr'),tope=herr&&getComputedStyle(herr).position==='fixed'?herr.getBoundingClientRect().top:Infinity;
    // (lo que pasa por detrás de la barra fija al desplazar no cuenta)
    const conTexto=[...document.querySelectorAll('#vista *')].filter(e=>vis(e)&&!e.closest('.katex,.oculto-visual,[hidden]')&&(e.closest('.ed-herr')||e.getBoundingClientRect().bottom<tope-2)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
    const encimados=[];
    for(let i=0;i<conTexto.length;i++)for(let j=i+1;j<conTexto.length;j++){const a=conTexto[i],b=conTexto[j];if(a.contains(b)||b.contains(a))continue;
      for(const r of a.getClientRects())for(const s of b.getClientRects()){const w=Math.min(r.right,s.right)-Math.max(r.left,s.left),h=Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top);
        if(w>3&&h>3)encimados.push(`«${a.textContent.trim().slice(0,15)}» / «${b.textContent.trim().slice(0,15)}»`)}}
    return {scroll:document.documentElement.scrollWidth>innerWidth+1,chicos,encimados:[...new Set(encimados)]}},tel);
  check(!r.encimados.length,`${que}: nada encimado${r.encimados.length?' — '+r.encimados.slice(0,3).join(', '):''}`);
  check(!r.scroll,`${que}: sin scroll de lado`);
  if(tel)check(!r.chicos.length,`${que}: toques de 44 px o más${r.chicos.length?' — chicos: '+r.chicos.join(', '):''}`);
}
// un trazo con Pointer Events sobre el lienzo del bloque de dibujo
const trazo=(p,{tipo='touch',id=7,x0=30,y0=40,pasos=12}={})=>p.evaluate(([tipo,id,x0,y0,pasos])=>{const cv=document.querySelector('.dib-cvivo'),r=cv.getBoundingClientRect();
  const ev=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:tipo,pressure:t==='pointerup'?0:.5,buttons:t==='pointerup'?0:1,button:t==='pointermove'?-1:0,clientX:r.left+x,clientY:r.top+y,isPrimary:true}));
  ev('pointerdown',x0,y0);for(let i=1;i<=pasos;i++)ev('pointermove',x0+i*10,y0+i*4);ev('pointerup',x0+pasos*10,y0+pasos*4)},[tipo,id,x0,y0,pasos]);

async function editorTelefono(b){
  console.log('--- editor en el teléfono (360 px)');
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#notas');await p.waitForTimeout(800);
  check(/Aún no tienes notas/.test(await p.textContent('#vista')),'lista vacía: «Aún no tienes notas»');
  check(await p.locator('#nota-nueva-vacia').count()===1&&await p.locator('#vista [data-go="notas/foto"]').count()>=1,'lista vacía: «Escribir una nota» y «📸 Foto a nota»');
  // notas viejas: el formato de siempre (imagen sola en su línea, casillas, tarjetas, una imagen dentro de un renglón)
  const T=Date.UTC(2026,0,20,12);
  await leerDb(p,async(tx,T)=>{
    const c=document.createElement('canvas');c.width=40;c.height=30;const blob=await new Promise(r=>c.toBlob(r,'image/png'));
    await tx('archivos','readwrite',s=>s.put({id:'vieja-img',nota:'vieja',blob,tipo:'image/png',ancho:40,alto:30,creada:T}));
    await tx('notas','readwrite',s=>s.put({id:'vieja',titulo:'Nota vieja',cuerpo:'## Resumen\nLínea uno con $x^2$\nLínea dos con **negrita**\n![foto](img:vieja-img)\n- [ ] pendiente\n- [x] hecho\n🃏 ¿Capital de Francia? | París\nUna foto en el renglón ![foto](img:vieja-img) sigue igual',materia:'matematicas',tema:null,etiquetas:['viejo'],fijada:false,creada:T,editada:T}));
  },T);
  await p.reload();await p.waitForTimeout(900);
  await p.click('[data-go="notas/n/vieja"]');await p.waitForTimeout(900);
  const vieja=await notaDe(p,'vieja');
  check(vieja.editada===T,'abrir una nota vieja no la cambia');
  check(await p.locator('.ed-bloque').count()===3,`nota vieja: 3 bloques (texto, foto, texto) — ${await p.locator('.ed-bloque').count()}`);
  check(await p.locator('.ed-bloque .katex').count()>=1&&await p.locator('.ed-bloque b').count()>=1,'nota vieja: fórmula y negrita formateadas');
  check(await p.locator('.ed-bloque[data-tipo="imagen"] img[src^="blob:"]').count()===1,'nota vieja: la foto se ve como bloque');
  check(await p.locator('.ed-bloque .nota-check').count()===2&&await p.locator('.ed-bloque .nota-tarjeta').count()===1,'nota vieja: casillas y tarjeta se ven');
  await p.locator('.ed-bloque .nota-check').first().click();await p.waitForTimeout(900);
  const v2=await notaDe(p,'vieja');
  check(v2.cuerpo.includes('- [x] pendiente')&&v2.cuerpo.includes('🃏 ¿Capital de Francia? | París')&&v2.cuerpo.includes('![foto](img:vieja-img)')&&v2.cuerpo.includes('en el renglón ![foto](img:vieja-img) sigue'),'nota vieja: marcar una casilla conserva todo lo demás');
  await diseno(p,'nota vieja (360)',true);
  await foto(p,'editor-vieja');

  // crear y escribir
  await p.goto(BASE+'#notas');await p.waitForTimeout(700);
  check(await p.locator('#nota-nueva-fab').isVisible(),'teléfono: botón flotante «＋»');
  await p.click('#nota-nueva-fab');await p.waitForSelector('#nota-titulo');await p.waitForTimeout(300);
  const id=idNota(p);
  check(await p.evaluate(()=>document.activeElement?.id)==='nota-titulo','nota nueva: el cursor está en el título');
  await p.keyboard.type('Mi nota de prueba');await p.keyboard.press('Enter');await p.waitForTimeout(200);
  check(await p.locator('.ed-texto').count()===1,'Enter en el título pasa al texto');
  await p.keyboard.type('Hola **mundo**');await p.keyboard.press('Enter');await p.keyboard.press('Enter');
  await p.keyboard.type('- uno');await p.keyboard.press('Enter');await p.keyboard.type('dos');await p.keyboard.press('Enter');await p.keyboard.press('Enter');
  await p.keyboard.type('Área $\\frac{1}{2} b h$ listo');await p.waitForTimeout(300);
  check(await p.locator('.ed-previa:not([hidden]) .katex').count()>=1,'fórmula: vista previa KaTeX mientras escribes');
  await p.waitForTimeout(900);
  const n1=await notaDe(p,id);
  check(n1?.titulo==='Mi nota de prueba'&&/Hola \*\*mundo\*\*/.test(n1.cuerpo)&&n1.cuerpo.includes('- uno\n- dos'),'guardado automático (título, negrita y la lista sigue sola con Enter)');
  check(/Guardado ✓/.test(await p.textContent('#nota-estado')),'indicador «Guardado ✓»');
  // teclado abierto (ventana más baja): la barra queda dentro y el cursor no queda detrás
  await p.setViewportSize({width:360,height:420});await p.waitForTimeout(300);
  await p.keyboard.type(' y más');await p.waitForTimeout(300);
  const tap=await p.evaluate(()=>{const b=document.querySelector('.ed-herr').getBoundingClientRect(),t=document.querySelector('.ed-texto').getBoundingClientRect();return {barra:b.bottom<=innerHeight+1&&b.top<innerHeight,cursor:t.bottom<=b.top+2}});
  check(tap.barra,'teclado simulado: la barra de herramientas se ve completa');
  check(tap.cursor,'teclado simulado: lo que escribes no queda detrás de la barra');
  await foto(p,'editor-teclado');
  await p.setViewportSize({width:360,height:800});await p.waitForTimeout(200);
  // soltar el bloque: se formatea; tocar la fórmula la edita
  await p.click('#nota-titulo');await p.waitForTimeout(400);
  check(await p.locator('.ed-texto').count()===0&&await p.locator('.ed-vista b').count()>=1&&await p.locator('.ed-vista .katex').count()>=1,'al salir del bloque se ve formateado (negrita y fórmula)');
  await p.locator('.ed-vista .katex').first().click();await p.waitForTimeout(300);
  const sel=await p.evaluate(()=>{const t=document.querySelector('.ed-texto');return t?t.value.slice(t.selectionStart,t.selectionEnd):null});
  check(sel==='\\frac{1}{2} b h',`tocar la fórmula la edita (seleccionado: ${sel})`);
  // barra: negrita y casilla
  await p.keyboard.press('End');await p.keyboard.press('Enter');await p.keyboard.type('importante');
  for(let k=0;k<10;k++)await p.keyboard.press('Shift+ArrowLeft');
  await p.click('[data-fmt="negrita"]');await p.click('[data-fmt="casilla"]');await p.waitForTimeout(800);
  check((await notaDe(p,id)).cuerpo.includes('- [ ] **importante**'),'barra: Negrita y Casilla');
  // Σ: en el teléfono abre los símbolos (con un teclado físico conectado no se abre solo: aquí se escribió con el de Playwright)
  await p.evaluate(()=>delete document.documentElement.dataset.tecladoFisico);
  await p.click('[data-fmt="formula"]');await p.waitForTimeout(200);
  check(await p.locator('#ed-tfx:not([hidden])').count()===1,'Σ abre el teclado de fórmulas en el teléfono');
  await p.click('[data-tfx="0"]');await p.waitForTimeout(700);
  check((await notaDe(p,id)).cuerpo.includes('\\sqrt{}'),'teclado de fórmulas: √ escribe \\sqrt{}');
  await diseno(p,'editor con símbolos (360)',true);
  // ▦ Matriz: tamaño, paréntesis y celdas en una cuadrícula → LaTeX correcto (nadie escribe & ni \\)
  await p.keyboard.press('End');await p.keyboard.press('Enter');
  await p.click('#ed-tfx [aria-label="Escribir ▦ Matriz"]');await p.waitForTimeout(250);
  await diseno(p,'▦ matriz en el cuaderno (360)',true);
  for(const [c,v] of [['0-0','1'],['0-1','-1/2'],['1-0','0'],['1-1','3']])await p.fill(`.modal [data-cel="${c}"]`,v);
  await p.click('.modal button[type="submit"]');await p.waitForTimeout(800);
  check((await notaDe(p,id)).cuerpo.includes('\\begin{bmatrix} 1 & -\\frac{1}{2} \\\\ 0 & 3 \\end{bmatrix}'),'Σ → ▦ Matriz escribe el LaTeX (bmatrix con la fracción)');
  await p.click('[data-tfx="cerrar"]');
  // foto: bloque a lo ancho, tocar amplía, recortar o girar y pie
  const png=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=300;c.height=200;const x=c.getContext('2d');x.fillStyle='#3b82f6';x.fillRect(0,0,300,200);
    const b=await new Promise(r=>c.toBlob(r,'image/png'));return [...new Uint8Array(await b.arrayBuffer())]});
  await p.setInputFiles('#nota-galeria',{name:'pizarron.png',mimeType:'image/png',buffer:Buffer.from(png)});await p.waitForTimeout(1500);
  const nf=await notaDe(p,id),idFoto=nf.cuerpo.match(/!\[foto\]\(img:([\w-]+)\)/)?.[1];
  check(!!idFoto&&!!(await archivoDe(p,idFoto)),'foto: se guarda y queda en la nota como bloque');
  check(await p.locator('.ed-bloque[data-tipo="imagen"]').count()===1,'foto: se ve como bloque');
  const anchoF=await p.evaluate(()=>{const f=document.querySelector('.ed-bloque[data-tipo="imagen"] img').getBoundingClientRect(),c=document.querySelector('.ed-bloques').getBoundingClientRect();return f.width/c.width});
  check(anchoF>0.95,`foto: a lo ancho (${Math.round(anchoF*100)} %)`);
  await p.click('.ed-bloque[data-tipo="imagen"] .ed-img');await p.waitForTimeout(400);
  check(await p.locator('.nota-visor img').count()===1,'foto: tocar la amplía');
  await p.goBack();await p.waitForTimeout(400);
  check(await p.locator('.nota-visor').count()===0&&idNota(p)===id,'Atrás cierra la foto ampliada y sigue en la nota');
  const iFoto=+(await p.locator('.ed-bloque[data-tipo="imagen"]').getAttribute('data-i'));
  await p.click(`[data-bmenu="${iFoto}"]`);await p.waitForTimeout(250);
  await p.click('.modal [data-r="pie"]');await p.waitForTimeout(200);await p.fill('#pie-txt','El pizarrón del lunes');await p.click('.modal button[type=submit]');await p.waitForTimeout(800);
  check((await notaDe(p,id)).cuerpo.includes(`![El pizarrón del lunes](img:${idFoto})`)&&await p.locator('.ed-bloque figcaption').count()===1,'foto: pie de foto');
  await p.click(`[data-bmenu="${iFoto}"]`);await p.waitForTimeout(250);await p.click('.modal [data-r="recortar"]');await p.waitForTimeout(500);
  await p.click('.modal [data-r="girar"]');await p.click('.modal [data-r="si"]');await p.waitForTimeout(1200);
  const nr=await notaDe(p,id),idGirada=nr.cuerpo.match(/!\[El pizarrón del lunes\]\(img:([\w-]+)\)/)?.[1];
  check(idGirada&&idGirada!==idFoto&&!(await archivoDe(p,idFoto)),'foto: girar guarda una nueva y borra la anterior (conserva el pie)');
  const dimG=await leerDb(p,(tx,id)=>tx('archivos','readonly',s=>s.get(id)).then(a=>[a.ancho,a.alto]),idGirada);
  check(dimG[0]===200&&dimG[1]===300,`foto: girada 90° (${dimG.join('×')})`);
  // dibujo: editor a pantalla completa (lo prueba a fondo npm run dibujo); «Listo» guarda PNG + el dibujo en vectores
  await p.click('[data-fmt="imagen"]');await p.waitForTimeout(250);await p.click('.modal [data-r="dibujo"]');await p.waitForTimeout(700);
  check(await p.locator('.dib').count()===1,'dibujo: abre el editor a pantalla completa');
  await p.click('.modal [data-x]');await p.waitForTimeout(300);
  await trazo(p);check((await p.evaluate(()=>document.querySelector('.dib').__dib.objs.length))===1,'dibujo: un dedo dibuja');
  await p.click('[data-d="listo"]');await p.waitForTimeout(1500);
  const nd=await notaDe(p,id),idDib=nd.cuerpo.match(/!\[dibujo\]\(img:([\w-]+)\)/)?.[1],aDib=idDib&&await archivoDe(p,idDib);
  check(aDib&&aDib.tipo==='image/png'&&aDib.trazos===1,'dibujo: «Listo» lo guarda como PNG con el dibujo en vectores');
  // mover bloques: el dibujo sube; borrar y deshacer
  const orden=c=>c.indexOf(`img:${idDib}`)<c.indexOf(`img:${idGirada}`);
  check(!orden(nd.cuerpo),'el dibujo quedó después de la foto');
  const iDib=+(await p.locator(`.ed-bloque:has(img[data-img="${idDib}"])`).getAttribute('data-i'));
  await p.click(`[data-bmenu="${iDib}"]`);await p.waitForTimeout(250);await p.click('.modal [data-r="subir"]');await p.waitForTimeout(900);
  check(orden((await notaDe(p,id)).cuerpo),'mover: «↑ Subir» pone el dibujo antes de la foto');
  const iDib2=+(await p.locator(`.ed-bloque:has(img[data-img="${idDib}"])`).getAttribute('data-i'));
  await p.click(`[data-bmenu="${iDib2}"]`);await p.waitForTimeout(250);await p.click('.modal [data-r="borrar"]');await p.waitForTimeout(900);
  check(!(await notaDe(p,id)).cuerpo.includes(`img:${idDib}`),'borrar un bloque');
  await p.click('#aviso .aviso-btn');await p.waitForTimeout(900);
  check((await notaDe(p,id)).cuerpo.includes(`img:${idDib}`),'«Deshacer» devuelve el bloque');
  // editar el dibujo guardado
  const iDib3=+(await p.locator(`.ed-bloque:has(img[data-img="${idDib}"])`).getAttribute('data-i'));
  await p.click(`[data-bmenu="${iDib3}"]`);await p.waitForTimeout(250);await p.click('.modal [data-r="dibujo"]');await p.waitForTimeout(800);
  check((await p.evaluate(()=>document.querySelector('.dib')?.__dib.objs.length))===1,'dibujo: «Editar el dibujo» lo abre con sus trazos');
  await trazo(p,{y0:160});await p.click('[data-d="listo"]');await p.waitForTimeout(1500);
  const idDib4=(await notaDe(p,id)).cuerpo.match(/!\[dibujo\]\(img:([\w-]+)\)/)?.[1];
  check(idDib4!==idDib&&(await archivoDe(p,idDib4))?.trazos===2&&!(await archivoDe(p,idDib)),'dibujo editado: se guarda con 2 trazos y se borra el anterior');
  await diseno(p,'editor (360)',true);
  await foto(p,'editor');
  // modo lectura y tarjeta desde lo seleccionado
  await p.click('#nota-leer');await p.waitForTimeout(500);
  check(await p.locator('.nota-leer').count()===1&&await p.locator('.ed-barra').count()===0,'👁️ modo lectura: sin herramientas');
  await p.evaluate(()=>{const el=[...document.querySelectorAll('.nota-leer p')].find(x=>/Hola/.test(x.textContent));const r=document.createRange();r.selectNodeContents(el.querySelector('b'));const s=getSelection();s.removeAllRanges();s.addRange(r)});
  await p.waitForTimeout(300);
  check(await p.locator('#ed-tarjeta-sel:not([hidden])').count()===1,'al seleccionar un texto aparece «🃏 Crear tarjeta»');
  await p.click('#ed-tarjeta-sel');await p.waitForTimeout(250);
  check(await p.inputValue('#tj-a')==='mundo','la respuesta es lo seleccionado');
  await p.fill('#tj-q','¿A quién saludo?');await p.click('.modal button[type=submit]');await p.waitForTimeout(900);
  check((await notaDe(p,id)).cuerpo.includes('🃏 ¿A quién saludo? | mundo'),'la tarjeta queda en la nota');
  await diseno(p,'modo lectura (360)',true);
  // repasar
  await p.click('#nota-repasar');await p.waitForTimeout(400);
  check(await p.locator('.ed-tarjeta').count()===1&&/¿A quién saludo\?/.test(await p.textContent('.ed-tarjeta')),'🧠 Repasar: muestra la pregunta');
  await p.click('#rep-mostrar');await p.waitForTimeout(200);
  check(/mundo/.test(await p.textContent('.ed-tarjeta'))&&await p.locator('[data-calif]').count()===3,'Mostrar respuesta → Otra vez / Bien / Fácil');
  await diseno(p,'repasar (360)',true);
  await p.click('[data-calif="3"]');await p.waitForTimeout(300);
  const rep=await p.evaluate(()=>{const p=JSON.parse(localStorage.getItem('ciberlab-progreso'));return Object.entries(p.repaso).filter(([k])=>k.includes('/t/')).map(([,r])=>r.rep)});
  check(rep.some(r=>r>=1),'calificar actualiza el repaso espaciado de la tarjeta');
  check(!err.length,`editor (teléfono): sin errores en la página${err.length?': '+[...new Set(err)].join(' | '):''}`);
  await ctx.close();
}

async function editorLaptop(b){
  console.log('--- editor en la laptop (1366 × 768, teclado y ratón)');
  const ctx=await b.newContext({viewport:{width:1366,height:768}});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('ciberlab-usuario'))localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')});
  const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#notas');await p.waitForTimeout(800);
  await p.keyboard.press('Control+n');await p.waitForTimeout(800);
  check(/^notas\/n\//.test(decodeURIComponent(new URL(p.url()).hash.slice(1))),'Ctrl+N crea una nota nueva');
  const id=idNota(p);
  await p.keyboard.type('Laptop');await p.click('#ed-final');await p.waitForTimeout(200);
  await p.keyboard.type('palabra');for(let k=0;k<7;k++)await p.keyboard.press('Shift+ArrowLeft');
  await p.keyboard.press('Control+b');await p.keyboard.press('Control+Shift+Digit8');await p.keyboard.press('End');
  await p.keyboard.press('Enter');await p.keyboard.press('Enter');await p.keyboard.press('Control+m');await p.waitForTimeout(900);
  const c=(await notaDe(p,id)).cuerpo;
  check(c.includes('- **palabra**'),`Ctrl+B y Ctrl+Shift+8 (${JSON.stringify(c.slice(0,30))})`);
  check(c.includes('$x^2$'),'Ctrl+M escribe una fórmula');
  check(await p.locator('#ed-tfx:not([hidden])').count()===0,'en la laptop el teclado de fórmulas no se abre solo');
  const barra=await p.evaluate(()=>{scrollTo(0,0);const b=document.querySelector('.ed-herr');return {pos:getComputedStyle(b).position,top:b.getBoundingClientRect().top}});
  check(barra.pos==='sticky'&&barra.top<360,`la barra va arriba y fija al desplazar (${barra.pos}, y=${Math.round(barra.top)})`);
  const lado=await p.evaluate(()=>document.querySelector('.panel-lista')?.getBoundingClientRect().width||0);
  check(lado>=280&&lado<=400,`dos paneles: la lista a la izquierda (${Math.round(lado)} px)`);
  const cpl=await p.evaluate(()=>{const e=document.querySelector('.ed-bloques');const w=e.clientWidth-parseFloat(getComputedStyle(e).paddingRight),f=parseFloat(getComputedStyle(e).fontSize);return Math.round(w/(f*.5))});
  check(cpl<=76,`línea cómoda en la laptop (~${cpl} caracteres)`);
  await diseno(p,'editor (laptop)',false);
  await foto(p,'editor-laptop');
  await p.keyboard.press('Escape');await p.waitForTimeout(200);await p.keyboard.press('Escape');await p.waitForTimeout(700);
  check(decodeURIComponent(new URL(p.url()).hash.slice(1))==='notas','Esc (dos veces) sale a la lista');
  await p.keyboard.press('Control+k');await p.waitForTimeout(200);
  check(await p.evaluate(()=>document.activeElement?.id)==='notas-buscar','Ctrl+K busca en las notas');
  await p.keyboard.type('Laptop');await p.waitForTimeout(300);
  check(await p.locator('#notas-lista .nota-item').count()===1,'el buscador filtra');
  // repasar con el teclado
  await leerDb(p,async(tx,id)=>{const n=await tx('notas','readonly',s=>s.get(id));n.cuerpo+='\n\n🃏 2 + 2 | 4';await tx('notas','readwrite',s=>s.put(n))},id);
  await p.goto(BASE+`#notas/n/${id}`);await p.waitForTimeout(800);await p.click('#nota-repasar');await p.waitForTimeout(300);
  await p.keyboard.press('Space');await p.waitForTimeout(200);
  check(await p.locator('[data-calif]').count()===3,'Repasar: Espacio muestra la respuesta');
  await p.keyboard.press('2');await p.waitForTimeout(300);
  check(/Repasaste 1 tarjeta/.test(await p.textContent('.ed-repaso')),'Repasar: 2 = Bien y pasa a la siguiente');
  await diseno(p,'repasar (laptop)',false);
  check(!err.length,`editor (laptop): sin errores en la página${err.length?': '+[...new Set(err)].join(' | '):''}`);
  await ctx.close();
}

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
  check(await p.locator('.nota-cab #nota-mas').count()===1,'la nota tiene «⋯» en su cabecera');
  await p.click('#nota-mas');await p.waitForTimeout(300);await p.click('.modal [data-r="borrar"]');await p.waitForTimeout(400);
  await p.click('.modal [data-r="1"]');await p.waitForTimeout(900);
  check(!(await nota('pb')),'borra la nota');check(hash()==='notas',`vuelve a la lista: ${hash()}`);
  check(!!(await archivo('fc')),'la foto compartida sigue (la usa la nota A)');
  check(await p.evaluate(()=>!JSON.parse(localStorage.getItem('ciberlab-diagnostico')||'[]').some(x=>['push','replace'].includes(x.tipo)&&x.enPop)),'popstate no agregó ni reemplazó entradas');
  check(!err.length,`sin errores en la página${err.length?': '+err.join(' | '):''}`);
  await ctx.close();
  await editorTelefono(b);
  await editorLaptop(b);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
{const r=spawnSync(process.execPath,[join(raiz,'scripts','exportar-notas.mjs'),'--sin-build'],{stdio:'inherit'});if(r.status)f++}
console.log(f?`${f} fallos`:'Todo bien');
process.exit(f?1:0);
