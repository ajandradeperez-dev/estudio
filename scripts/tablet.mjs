/* npm run tablet: Estudio+ en la Galaxy Tab S10 (FE, S10+ y Ultra), en vertical y horizontal, pantalla dividida, ventana
   flotante y Samsung DeX, en claro y oscuro. Guarda capturas en capturas/tablet/ (no van a git) y FALLA si en algún tamaño:
   - hay scroll horizontal en la página;
   - un párrafo pasa de ~75 caracteres por línea (ancho del texto medido en ch de su propia letra);
   - un control táctil mide menos de 48 × 48 px;
   - una fórmula KaTeX se sale de su caja;
   - hay texto de cuerpo de menos de 16 px;
   - un elemento importante queda tapado por otro (p. ej. la navegación sobre «Comprobar»).
   Además gira la tablet a mitad de un ejercicio y comprueba que no se pierde nada (respuesta escrita y pista abierta), y prueba
   el S Pen en el ✏️ Borrador (dibuja, la palma no, el botón borra, deshacer, girar) y los atajos de teclado (B, H, Esc, ?, Ctrl+K).
   Opciones: --sin-build · --sin-capturas · --solo <caso> (fe-h, dex…) · --claro (solo tema claro) · --play (capturas para
   Google Play en capturas/play-tablet/). Compila, levanta `vite preview` en el puerto 4795 y lo apaga al terminar. */
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4795,BASE=`http://localhost:${PUERTO}/`;
const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null},tiene=n=>process.argv.includes(n);
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);

// [id, nombre, ancho, alto, escala, móvil]
const CASOS=[
  ['fe-v','Tab S10 FE vertical',800,1280,1.8,true],['fe-h','Tab S10 FE horizontal',1280,800,1.8,true],
  ['plus-v','Tab S10+ vertical',876,1400,2,true],['plus-h','Tab S10+ horizontal',1400,876,2,true],
  ['ultra-v','Tab S10 Ultra vertical',924,1480,2,true],['ultra-h','Tab S10 Ultra horizontal',1480,924,2,true],
  ['dividida','Pantalla dividida (mitad)',700,876,2,true],['flotante','Ventana flotante',600,900,2,true],
  ['dex','Samsung DeX / monitor',1920,1080,1,false]
].filter(c=>!arg('--solo')||c[0]===arg('--solo'));

const dia=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
const PROG={v:11,meta:{tipo:'ejercicios',cantidad:20},dias:{[dia(1)]:{ej:25,seg:600,xp:200,ok:true}},mejorRacha:2,repaso:{},dominados:0,frases:{},historial:[],notas:{},tarjetas:{},
  materias:{ingles:{xp:300,lecciones:{'verbo-to-be':{dominada:true,mejor:1,intentos:2,via:'practica',ult:[1,1,1],dias:[dia(2),dia(1)],rating:3,sesiones:2}},extra:{},visitadas:[]}}};
const NOTA=`## Regla de la cadena\n\nSi **y = f(g(x))**, entonces la derivada es $f'(g(x))\\cdot g'(x)$. Se deriva la función de afuera, se deja igual lo de adentro y se multiplica por la derivada de lo de adentro.\n\n- [ ] Repasar ejemplos con raíces\n- [x] Ver el video\n\n🃏 ¿Derivada de sen(3x)? | 3 cos(3x)`;

/* ---------- comprobaciones (corren en la página) ---------- */
function revisar(){
  const vw=document.documentElement.clientWidth,vh=innerHeight,fallos=[];
  const visible=el=>{if(el.closest('.oculto,.oculto-visual,[hidden]')||(el.closest('details:not([open])')&&!el.closest('summary')))return false;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity!==0};
  const nombre=el=>(el.id?'#'+el.id:'')+(el.getAttribute('aria-label')||el.textContent||el.className||el.tagName).toString().trim().replace(/\s+/g,' ').slice(0,28);
  // 1 scroll horizontal
  const sx=document.documentElement.scrollWidth-innerWidth;if(sx>0)fallos.push(`scroll horizontal de ${sx}px`);
  // 2 líneas de más de ~75 caracteres (en ch de la letra del párrafo)
  const ch=el=>{const s=document.createElement('span');s.textContent='0'.repeat(20);s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:inherit;letter-spacing:inherit';el.appendChild(s);const w=s.getBoundingClientRect().width/20;s.remove();return w};
  const largos=[];
  for(const el of document.querySelectorAll('#vista p, #vista li, #vista .lec-bloque, #procedimiento p, #hoja p')){
    if(!visible(el)||el.closest('pre,code,table,.katex,.formula-caja,.xl-marco,.py-editor'))continue;
    if((el.textContent||'').trim().length<160)continue;   // solo párrafos de verdad (que ocupan varias líneas)
    // en dos páginas (columnas) un párrafo partido abarca las dos: se mide su primer pedazo
    const cs=getComputedStyle(el),r=el.getClientRects()[0]||el.getBoundingClientRect(),w=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const n=w/ch(el);if(n>76)largos.push(`${nombre(el)} (${Math.round(n)}ch)`);
  }
  if(largos.length)fallos.push(`líneas de más de 75 caracteres: ${[...new Set(largos)].slice(0,3).join(' · ')}`);
  // 3 controles táctiles de menos de 48 × 48
  const chicos=[];
  for(const el of document.querySelectorAll('#vista button, #vista a.btn, #vista a.tarjeta-nav, #vista input:not([type=file]):not([type=checkbox]):not([type=radio]), #vista select, #nav button, #barra button, #barra a, #hoja button, #procedimiento button, .ses-panel button')){
    if(!visible(el)||el.closest('.katex,.frase-evaluada,.xl-marco'))continue;
    const r=el.getBoundingClientRect();if(r.height<47.5||r.width<47.5)chicos.push(`${nombre(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  if(chicos.length)fallos.push(`controles de menos de 48 px: ${[...new Set(chicos)].slice(0,4).join(', ')}${chicos.length>4?` (+${chicos.length-4})`:''}`);
  // 4 fórmulas que se salen de su caja (si no están dentro de algo que se desplaza)
  const katex=[];
  for(const k of document.querySelectorAll('.katex')){
    if(!visible(k)||k.parentElement.closest('.katex'))continue;
    let caja=k.parentElement;while(caja&&caja!==document.body){const o=getComputedStyle(caja).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')break;caja=caja.parentElement}
    const r=k.getBoundingClientRect();
    if(caja&&caja!==document.body){const o=getComputedStyle(caja).overflowX;if(o==='hidden'&&r.right>caja.getBoundingClientRect().right+1)katex.push('cortada: '+k.textContent.slice(0,30));continue}
    if(r.right>vw+1||r.left<-1)katex.push('fuera: '+k.textContent.slice(0,30));
  }
  if(katex.length)fallos.push(`fórmulas fuera de su caja: ${katex.slice(0,3).join(' · ')}`);
  // 5 texto de cuerpo de menos de 16 px (párrafos y listas con frases, no etiquetas, chips ni notas al pie)
  const chicosT=[];
  for(const el of document.querySelectorAll('#vista p, #vista li, #hoja p, #procedimiento p, .ses-panel p')){
    if(!visible(el)||el.closest('.nota,.chip,.tag,small,table,.migas,.licencia,.etiqueta-actividad,.camino,.mapa,.katex,pre,.cta-ayuda,.dias,.nota-miniaturas,footer'))continue;
    if(el.matches('.nota,.etiqueta-actividad,.sup-k'))continue;
    const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(t.length<40)continue;
    const fs=parseFloat(getComputedStyle(el).fontSize);if(fs<15.5)chicosT.push(`${nombre(el)} (${fs}px)`);
  }
  if(chicosT.length)fallos.push(`texto de cuerpo de menos de 16 px: ${[...new Set(chicosT)].slice(0,3).join(' · ')}`);
  // 6 algo importante tapado: el centro de cada botón principal visible debe ser el propio botón
  const tapados=[];
  for(const el of document.querySelectorAll('#ses-comprobar, #hoja-seguir, #vista .btn:not(.btn-chico), #nav .nav-tab, .ses-panel .btn')){
    if(!visible(el)||el.disabled&&el.id!=='ses-comprobar')continue;
    const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(y<0||y>vh||x<0||x>vw)continue;
    const arriba=document.elementFromPoint(x,y);if(arriba&&!el.contains(arriba)&&!arriba.contains(el)&&!arriba.closest('.modal-fondo,.proc-fondo,#hoja,.aviso,#aviso-flotante'))tapados.push(`${nombre(el)} bajo ${nombre(arriba)}`);
  }
  if(tapados.length)fallos.push(`tapados: ${tapados.slice(0,3).join(' · ')}`);
  return fallos;
}

if(!tiene('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const dirCap=join(raiz,'capturas','tablet'),dirPlay=join(raiz,'capturas','play-tablet');
if(!tiene('--sin-capturas'))mkdirSync(dirCap,{recursive:true});
if(tiene('--play'))mkdirSync(dirPlay,{recursive:true});

const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
const fallos=[],informe=[];let pantallas=0;
const ok=(c,m)=>{if(!c)fallos.push(m)};
try{
  for(const [id,nom,w,h,escala,movil] of CASOS)for(const esquema of tiene('--claro')?['light']:['light','dark']){
    const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:escala,isMobile:movil,hasTouch:movil,colorScheme:esquema});
    await ctx.addInitScript(([d])=>{if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('ciberlab-progreso',JSON.stringify(d));localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')}},[PROG]);
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
    const caso=`${nom} ${w}×${h} ${esquema==='dark'?'oscuro':'claro'}`;
    const medir=async(pant,{foto=true}={})=>{
      await p.waitForTimeout(300);pantallas++;
      const r=await p.evaluate(revisar);
      for(const x of r)fallos.push(`${caso} · ${pant}: ${x}`);
      informe.push({caso:id,esquema,pant,fallos:r});
      if(foto&&!tiene('--sin-capturas'))await p.screenshot({path:join(dirCap,`${id}-${esquema==='dark'?'oscuro':'claro'}-${pant}.png`)});
      if(tiene('--play')&&id==='plus-h'&&esquema==='light'&&['aprender','practica-pista','cuaderno','lector'].includes(pant))await p.screenshot({path:join(dirPlay,`${pant}.png`)});
    };
    const ir=async ruta=>{await p.goto(BASE+'#'+ruta);await p.waitForSelector('#vista > *');await p.waitForTimeout(350)};
    await ir('');await medir('aprender');
    // práctica con pista abierta y luego la solución paso a paso
    await ir('estudio/matematicas/algebra-lineal/l/gauss');
    if(await p.locator('#mini-saltar').count())await p.click('#mini-saltar');
    await p.waitForSelector('#ses-cuerpo');
    for(let k=0;k<4&&await p.locator('#ses-continuar').count();k++){await p.click('#ses-continuar');await p.waitForTimeout(200)}
    for(let k=0;k<2&&await p.locator('#ses-pista').count();k++){await p.click('#ses-pista');await p.waitForTimeout(150)}
    await medir('practica-pista');
    // girar (o cambiar de ventana) a mitad del ejercicio: no se pierde la respuesta escrita ni la pista
    {const celdas=p.locator('#vista .celda'),resp=p.locator('#ses-resp');
     if(await celdas.count())await celdas.first().fill('7');else if(await resp.count())await resp.fill('7');
     const antes=await p.evaluate(()=>({pistas:document.querySelectorAll('#ses-cuerpo .pista').length,val:(document.querySelector('#vista .celda')||document.querySelector('#ses-resp'))?.value}));
     await p.setViewportSize({width:h,height:w});await p.waitForTimeout(400);
     const girada=await p.evaluate(()=>({pistas:document.querySelectorAll('#ses-cuerpo .pista').length,val:(document.querySelector('#vista .celda')||document.querySelector('#ses-resp'))?.value}));
     await p.setViewportSize({width:w,height:h});await p.waitForTimeout(400);
     const vuelta=await p.evaluate(()=>({pistas:document.querySelectorAll('#ses-cuerpo .pista').length,val:(document.querySelector('#vista .celda')||document.querySelector('#ses-resp'))?.value}));
     ok(antes.val==='7'&&girada.val==='7'&&vuelta.val==='7'&&antes.pistas===girada.pistas&&girada.pistas===vuelta.pistas&&antes.pistas>0,`${caso}: al girar a mitad del ejercicio se perdió algo (${JSON.stringify([antes,girada,vuelta])})`);}
    for(const c of await p.$$('#vista .celda'))await c.fill('99');
    if(await p.locator('#ses-resp').count())await p.fill('#ses-resp','99');
    await p.click('#ses-comprobar');await p.waitForSelector('#hoja');await p.waitForTimeout(300);
    if(await p.locator('#hoja-proc').count()){await p.click('#hoja-proc');await p.waitForSelector('#procedimiento');await p.waitForTimeout(300)}
    await medir('solucion');
    await ir('estudio/ingles/hablar');await medir('mapa-mcer');
    await ir('logros');await medir('logros');
    // cuaderno con una nota abierta
    await ir('notas');await p.click('#nota-nueva');await p.waitForSelector('#nota-cuerpo');
    await p.fill('#nota-titulo','Derivadas: regla de la cadena');await p.fill('#nota-cuerpo',NOTA);await p.waitForTimeout(800);
    await p.click('[data-modo="ver"]');await p.waitForTimeout(300);await medir('cuaderno');
    await ir('estudio/lectura');await medir('biblioteca');
    await ir('estudio/lectura/libro/aesop/1');await p.waitForSelector('.lector',{timeout:8000}).catch(()=>{});await medir('lector');
    await ir('cursos/python/editor');await medir('python');
    await ir('cursos/excel/hoja');await medir('excel');
    await ir('perfil');await medir('perfil');
    await ir('cuenta');await medir('cuenta');
    if(err.length)fallos.push(`${caso}: errores JS ${[...new Set(err)].slice(0,2).join(' | ')}`);
    await ctx.close();
  }
  // S Pen en el ✏️ Borrador y teclado físico (Tab S10+ en horizontal)
  if(!arg('--solo')||arg('--solo')==='plus-h'){
    const ctx=await b.newContext({viewport:{width:1400,height:876},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await ctx.addInitScript(([d])=>{if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('ciberlab-progreso',JSON.stringify(d));localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}')}},[PROG]);
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
    await p.goto(BASE+'#estudio/matematicas/algebra-lineal/l/gauss');await p.waitForSelector('#vista > *');await p.waitForTimeout(400);
    if(await p.locator('#mini-saltar').count())await p.click('#mini-saltar');
    for(let k=0;k<4&&await p.locator('#ses-continuar').count();k++){await p.click('#ses-continuar');await p.waitForTimeout(200)}
    await p.keyboard.press('b');await p.waitForTimeout(300);
    ok(await p.locator('.ses-panel .borrador-lienzo').count()===1,'S Pen: la tecla B abre el borrador en el panel derecho');
    // trazos con Pointer Events (lápiz con presión, dedo, botón lateral) y cuántos píxeles tienen tinta
    const trazo=(tipo,x0,y0,{pr=.8,botones=1,boton=0}={})=>p.evaluate(([tipo,x0,y0,pr,botones,boton])=>{const cv=document.querySelector('.borrador-lienzo'),r=cv.getBoundingClientRect();
      const ev=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:tipo==='pen'?2:3,pointerType:tipo,pressure:t==='pointerup'?0:pr,buttons:t==='pointerup'?0:botones,button:t==='pointermove'?-1:boton,clientX:r.left+x,clientY:r.top+y,isPrimary:true}));
      ev('pointerover',x0,y0);ev('pointerdown',x0,y0);for(let i=1;i<=20;i++)ev('pointermove',x0+i*8,y0+i*3);ev('pointerup',x0+160,y0+60)},[tipo,x0,y0,pr,botones,boton]);
    const tinta=()=>p.evaluate(()=>{const cv=document.querySelector('.borrador-lienzo');if(!cv)return -1;const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;
      for(let i=0;i<d.length;i+=16)if(Math.abs(d[i]-d[0])+Math.abs(d[i+1]-d[1])+Math.abs(d[i+2]-d[2])>60)n++;return n});
    await trazo('pen',30,40,{pr:.9});const t1=await tinta();
    ok(t1>0,'S Pen: el lápiz dibuja en el borrador');
    await trazo('touch',30,160);const t2=await tinta();
    ok(t2===t1,`S Pen: con el lápiz activo, el dedo (la palma) no dibuja (${t1} → ${t2})`);
    await trazo('pen',30,40,{botones:32,boton:5});const t3=await tinta();
    ok(t3<t1,`S Pen: el borrador del lápiz (botón 5 / buttons 32) borra (${t1} → ${t3})`);
    await p.click('[data-borr="deshacer"]');await p.waitForTimeout(100);
    ok(await tinta()===t1,'S Pen: deshacer devuelve el trazo borrado');
    // sin desfase: la tinta queda bajo la punta y la raya llega hasta donde se soltó (también con el texto «muy grande», zoom 1,25)
    for(const tam of ['normal','muy-grande']){
      await p.evaluate(t=>{t==='normal'?delete document.documentElement.dataset.texto:document.documentElement.dataset.texto=t},tam);await p.waitForTimeout(300);
      await p.click('[data-borr="limpiar"]');await p.waitForTimeout(100);
      const r=await p.evaluate(()=>{const cv=document.querySelector('.borrador-lienzo'),b=cv.getBoundingClientRect(),k=b.width/cv.offsetWidth,x0=b.left+cv.clientLeft*k,y0=b.top+cv.clientTop*k;
        const X1=x0+40*k,X2=x0+220*k,Y=y0+120*k;
        const ev=(t,x)=>cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:2,pointerType:'pen',pressure:t==='pointerup'?0:.5,buttons:t==='pointerup'?0:1,button:t==='pointermove'?-1:0,clientX:x,clientY:Y,isPrimary:true}));
        ev('pointerdown',X1);for(let i=1;i<=9;i++)ev('pointermove',X1+(X2-X1)*i/9);ev('pointerup',X2);
        const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,f=[d[0],d[1],d[2]];let mx=-1,sy=0,n=0;
        for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-f[0])+Math.abs(d[i+1]-f[1])+Math.abs(d[i+2]-f[2])>150){const px=(i/4)%cv.width,py=Math.floor(i/4/cv.width);mx=Math.max(mx,px);sy+=py;n++}
        const aPant=v=>v/cv.width*cv.clientWidth*k;
        return {fin:x0+aPant(mx)-X2,y:n?y0+(sy/n)/cv.height*cv.clientHeight*k-Y:99}});
      ok(r.fin>-1.5&&r.fin<6&&Math.abs(r.y)<1.5,`S Pen (texto ${tam}): la tinta queda bajo la punta y llega hasta donde se soltó (final ${r.fin.toFixed(1)} px, vertical ${r.y.toFixed(1)} px)`);
    }
    await p.evaluate(()=>delete document.documentElement.dataset.texto);
    await p.setViewportSize({width:876,height:1400});await p.waitForTimeout(500);
    ok(await tinta()>0,'S Pen: al girar la tablet el dibujo sigue ahí');
    await p.setViewportSize({width:1400,height:876});await p.waitForTimeout(400);
    // teclado físico
    await p.keyboard.press('h');await p.waitForTimeout(250);
    ok(await p.locator('#ses-cuerpo .pista').count()===1,'teclado: H abre la primera pista');
    await p.keyboard.press('Escape');await p.waitForTimeout(250);
    ok(await p.locator('.ses-panel').count()===0,'teclado: Esc cierra el panel');
    await p.keyboard.press('?');await p.waitForTimeout(250);
    ok(/Atajos de teclado/.test(await p.textContent('body')),'teclado: ? abre la ayuda de atajos');
    await p.keyboard.press('Escape');await p.waitForTimeout(200);
    ok(await p.locator('.modal-fondo').count()===0,'teclado: Esc cierra la ayuda');
    await p.goto(BASE+'#logros');await p.waitForSelector('#vista > *');await p.waitForTimeout(300);
    await p.keyboard.press('Control+k');await p.waitForSelector('#buscar-global');await p.keyboard.type('regla de la cadena');await p.waitForTimeout(250);
    await p.keyboard.press('Enter');await p.waitForTimeout(500);
    ok(/cadena/.test(await p.evaluate(()=>location.hash)),'teclado: Ctrl+K busca y Enter abre el resultado');
    if(err.length)fallos.push(`S Pen / teclado: errores JS ${[...new Set(err)].slice(0,2).join(' | ')}`);
    await ctx.close();
  }
}finally{await b.close();apagar()}
if(!tiene('--sin-capturas')){
  const md=['# npm run tablet','',`${new Date().toISOString().slice(0,16)} · ${pantallas} pantallas`,''];
  for(const c of CASOS){md.push(`## ${c[1]} (${c[2]}×${c[3]})`);const xs=informe.filter(x=>x.caso===c[0]&&x.fallos.length);
    md.push(...(xs.length?xs.map(x=>`- ${x.esquema==='dark'?'🌙':'☀️'} ${x.pant}: ${x.fallos.join(' · ')}`):['- sin problemas']),'')}
  writeFileSync(join(dirCap,'informe.md'),md.join('\n'));
}
fallos.forEach(x=>console.log('ERROR  '+x));
console.log(fallos.length?`\n${fallos.length} problemas en ${pantallas} pantallas (capturas e informe en capturas/tablet/)`:`\n${pantallas} pantallas de tablet sin problemas (capturas en capturas/tablet/).`);
process.exit(fallos.length?1:0);
