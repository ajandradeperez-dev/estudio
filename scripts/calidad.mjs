/* npm run calidad: el botón Atrás (varios niveles hacia adelante y history.back() de vuelta sin salir) y, a 360 y 412 px, (claro y oscuro) que ningún texto se encime con otro, que no haya scroll horizontal
   y que los toques midan al menos 44 px, en Aprender, Logros, Perfil, Notas y la página de cada materia y cada tema.
   Compila con `npm run build`, levanta `vite preview` en el puerto 4799 y lo apaga al terminar.
   Necesita playwright-core (devDependency) y Chrome o Edge instalados (o la ruta en NAVEGADOR). */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4799,BASE=`http://localhost:${PUERTO}/`;
const {chromium}=await import('playwright-core');
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

// Rutas: las fijas y la de cada materia y tema (del mismo registro que usa la app, leído del texto de temas.js)
const RUTAS=['','logros','perfil','notas','notas/foto','mias','mias/nueva','acerca','repaso','estudio','cursos','cursos/ciberseguridad','propuestas','estudio/ingles','estudio/matematicas','estudio/ciencia-datos','estudio/ingles/hablar','cursos/ciberseguridad/retos','cursos/ciberseguridad/firewalls/retos','estudio/ingles/hablar-escuchar/retos','estudio/lectura','estudio/matematicas/algebra-basica'];
for(const [area,mat] of [['ciberseguridad',null],['estudio','ingles'],['estudio','matematicas'],['estudio','ciencia-datos']]){
  const temas=(await import(pathToFileURL(join(raiz,'src','materias',mat||area,'temas.js')).href)).default;
  for(const t of temas)RUTAS.push(mat?`${area}/${mat}/${t.id}`:`${area}/${t.id}`);
}
const dia=n=>{const d=new Date();d.setDate(d.getDate()-n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
// progreso con algo hecho para que se vean estados distintos (dominadas, actuales, bloqueadas, medallas)
const prog={v:8,meta:{tipo:'ejercicios',cantidad:20},dias:{[dia(1)]:{ej:25,seg:600,xp:200,ok:true}},mejorRacha:2,repaso:{},dominados:0,frases:{},historial:[],notas:{},tarjetas:{},
  materias:{ingles:{xp:300,lecciones:{'verbo-to-be':{dominada:true,mejor:1,intentos:2,via:'practica',ult:[1,1,1],dias:[dia(2),dia(1)],rating:3,sesiones:2}},extra:{unidades:{presentarte:{escucha:true}},medallas:{}},visitadas:[]},
    matematicas:{xp:120,lecciones:{expresiones:{dominada:false,mejor:.6,intentos:1,via:'practica',ult:[1,0,1],dias:[dia(1)],rating:2,sesiones:1}},extra:{},visitadas:[]}}};

// Textos que se enciman: rectángulos de cada nodo de texto visible (fuera de lo fijo, como la barra inferior, que flota por diseño)
const encimados=()=>{
  const fijo=el=>{for(let e=el;e&&e!==document.body;e=e.parentElement){const p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return true}return false};
  // no visible: clases de ocultar, KaTeX (sus capas se superponen a propósito), contenido de un <details> cerrado
  const oculto=el=>el.closest('.oculto,.oculto-visual,.katex,[hidden]')||(el.closest('details:not([open])')&&!el.closest('summary'))
    ||(el.checkVisibility&&!el.checkVisibility({contentVisibilityAuto:true,visibilityProperty:true,opacityProperty:true}));
  const cajas=[],w=document.createTreeWalker(document.getElementById('vista'),NodeFilter.SHOW_TEXT);
  while(w.nextNode()){
    const n=w.currentNode,el=n.parentElement;if(!n.textContent.trim()||!el||oculto(el)||fijo(el))continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.opacity==='0')continue;
    const r=document.createRange();r.selectNodeContents(n);
    for(const c of r.getClientRects())if(c.width>1&&c.height>1)cajas.push({c,el,t:n.textContent.trim().slice(0,24)});
  }
  const malos=[];
  for(let i=0;i<cajas.length;i++)for(let j=i+1;j<cajas.length;j++){
    const a=cajas[i],b=cajas[j];if(a.el===b.el)continue;
    const x=Math.min(a.c.right,b.c.right)-Math.max(a.c.left,b.c.left),y=Math.min(a.c.bottom,b.c.bottom)-Math.max(a.c.top,b.c.top);
    // se tolera el roce de 2 px (interlineado); encimarse de verdad es compartir más que eso en los dos ejes
    if(x>2&&y>Math.min(a.c.height,b.c.height)*.35)malos.push(`«${a.t}» × «${b.t}»`);
  }
  return [...new Set(malos)];
};
const desborde=()=>document.documentElement.scrollWidth-innerWidth;
const chicos=()=>[...document.querySelectorAll('#vista button, #vista a.btn, #vista a.tarjeta-nav, #vista input:not([type=file]), #vista select')].filter(e=>{
  if(e.closest('.katex,.oculto,.oculto-visual,.frase-evaluada'))return false;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
  return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&(r.height<43.5||r.width<43.5)}).map(e=>(e.id||e.className||e.textContent.trim()).toString().slice(0,24));

const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
const fallos=[];let pantallas=0;
try{
  for(const ancho of [360,412])for(const esquema of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:ancho,height:800},colorScheme:esquema,hasTouch:true});
    await ctx.addInitScript(d=>{if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('ciberlab-progreso',JSON.stringify(d));localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}},prog);
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
    for(const ruta of RUTAS){
      await p.goto(BASE+'#'+ruta);await p.reload();await p.waitForSelector('#vista > *');await p.waitForTimeout(250);pantallas++;
      const [e,d,c]=[await p.evaluate(encimados),await p.evaluate(desborde),await p.evaluate(chicos)];
      if(e.length)fallos.push(`${ancho}px ${esquema} #${ruta}: textos encimados: ${e.slice(0,4).join(' · ')}`);
      if(d>0)fallos.push(`${ancho}px ${esquema} #${ruta}: scroll horizontal de ${d}px`);
      if(c.length)fallos.push(`${ancho}px ${esquema} #${ruta}: toques de menos de 44 px: ${[...new Set(c)].slice(0,4).join(', ')}`);
    }
    if(err.length)fallos.push(`${ancho}px ${esquema}: errores JS ${err.slice(0,2).join(' | ')}`);
    await ctx.close();
  }
  // Botón Atrás: varios niveles hacia adelante y history.back() recorre el camino inverso sin salir de la app
  {
    const ctx=await b.newContext({viewport:{width:360,height:800},hasTouch:true});
    await ctx.addInitScript(d=>{if(!sessionStorage.x){sessionStorage.x=1;localStorage.setItem('ciberlab-progreso',JSON.stringify(d));localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}},prog);
    const p=await ctx.newPage(),ruta=()=>p.evaluate(()=>decodeURIComponent(location.hash.slice(1))),dentro=()=>p.evaluate(()=>location.origin)===Promise.resolve(new URL(BASE).origin);
    const err=[];p.on('pageerror',e=>err.push(e.message));
    const atras=async()=>{await p.evaluate(()=>history.back());await p.waitForTimeout(350)};
    const mal=m=>fallos.push('Atrás: '+m);
    await p.goto(BASE);await p.waitForSelector('#vista > *');
    const camino=[''];
    for(const sel of ['[data-go="estudio"]','[data-go="estudio/ingles"]','[data-go="estudio/ingles/a1"]','[data-go^="estudio/ingles/a1/l/"]']){
      await p.click(`#vista ${sel} >> nth=0`);await p.waitForTimeout(250);camino.push(await ruta());}
    if(new Set(camino).size!==camino.length)mal(`la navegación no avanzó: ${camino.join(' → ')}`);
    for(let i=camino.length-2;i>=0;i--){await atras();const r=await ruta();if(r!==camino[i])mal(`esperaba #${camino[i]} y quedó #${r} (camino ${camino.join(' → ')})`)}
    // en la portada: aviso y la app sigue abierta; después de 2 s vuelve a estar protegida
    await atras();
    if(!/otra vez para salir/.test(await p.textContent('#aviso').catch(()=>'')))mal('en la portada no apareció «Toca otra vez para salir»');
    if(!(await p.locator('#vista > *').count()))mal('la app se cerró con un solo Atrás en la portada');
    await p.waitForTimeout(2300);await atras();if(!(await p.locator('#vista > *').count()))mal('después de 2 s, un Atrás cerró la app');
    // raíz de una pestaña → Aprender
    await p.click('.nav-tab[data-go="perfil"]');await p.waitForTimeout(250);await atras();
    if(await ruta()!=='')mal(`desde Perfil, Atrás debería volver a Aprender (quedó #${await ruta()})`);
    // el ← de las migas hace lo mismo que Atrás
    await p.click('#vista [data-go="estudio"] >> nth=0');await p.waitForTimeout(200);await p.click('#vista [data-go="estudio/matematicas"] >> nth=0');await p.waitForTimeout(200);
    await p.click('.migas .atras');await p.waitForTimeout(250);if(await ruta()!=='estudio')mal(`el ← no volvió a #estudio (quedó #${await ruta()})`);
    // en una lección: la hoja se cierra primero; luego pregunta antes de salir; Atrás sobre el diálogo lo cierra
    await p.goto(BASE+'#estudio/matematicas/algebra-basica/l/ecuaciones-lineales');await p.waitForSelector('#hab-empezar');await p.click('#hab-empezar');await p.waitForSelector('.sesion');
    for(let i=0;i<6&&!(await p.locator('.hoja.abierta').count());i++){
      if(await p.locator('#ses-continuar').count()){await p.click('#ses-continuar');continue}
      if(await p.locator('#ses-resp').count())await p.fill('#ses-resp','999');else if(await p.locator('.opcion[data-op]').count())await p.click('.opcion[data-op="0"]');else if(await p.locator('[data-vf]').count())await p.click('[data-vf="1"]');
      await p.click('#ses-comprobar').catch(()=>{});await p.waitForTimeout(300)}
    if(await p.locator('.hoja.abierta').count()){await atras();if(await p.locator('#hoja').count())mal('Atrás no cerró la hoja de la lección');if(!(await p.locator('.sesion').count()))mal('Atrás con la hoja abierta sacó de la lección')}
    else mal('no se pudo abrir la hoja en la lección');
    await atras();if(!/Salir de la lección/.test(await p.textContent('.modal').catch(()=>'')))mal('en una lección, Atrás no preguntó «¿Salir de la lección?»');
    await atras();if(await p.locator('.modal').count())mal('Atrás no cerró el diálogo');if(!(await p.locator('.sesion').count()))mal('al cerrar el diálogo con Atrás se salió de la lección');
    if(err.length)mal('errores JS '+err.slice(0,2).join(' | '));
    await ctx.close();
  }
}finally{await b.close();apagar()}
fallos.forEach(x=>console.log('ERROR  '+x));
console.log(fallos.length?`\n${fallos.length} problemas en ${pantallas} pantallas`:`\n${pantallas} pantallas sin textos encimados, sin scroll horizontal y con toques ≥ 44 px.`);
process.exit(fallos.length?1:0);
