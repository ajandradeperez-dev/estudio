/* npm run calidad: a 360 y 412 px, (claro y oscuro) que ningún texto se encime con otro, que no haya scroll horizontal
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
// Pistas en escalera: la del nivel 2 de cada generador debe usar los números (o datos) de su ejercicio (npm run principiante)
if(!process.argv.includes('--solo-formulas'))try{execSync('node scripts/principiante.mjs',{cwd:raiz,stdio:'pipe'})}catch(e){console.log(String(e.stdout||'')+'\nFALLO: hay habilidades sin pistas con datos, mini-lección o gemelo (npm run principiante --detalle).');process.exit(1)}
// Curso de Python: cada ejercicio y cada solución del laboratorio se ejecutan en Python de verdad (Pyodide)
if(!process.argv.includes('--solo-formulas'))try{execSync('node scripts/python.mjs',{cwd:raiz,stdio:'pipe'})}catch(e){console.log(String(e.stdout||'')+'\nFALLO: npm run python (lo que imprime Python no coincide con alguna respuesta).');process.exit(1)}
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

// Rutas: las fijas y la de cada materia y tema (del mismo registro que usa la app, leído del texto de temas.js)
const RUTAS=['','logros','perfil','notas','notas/foto','mias','mias/nueva','acerca','ajustes-ia','repaso','estudio','cursos','cursos/ciberseguridad','cursos/excel','cursos/excel/hoja','cursos/excel/dinamica','cursos/excel/organizar','cursos/excel/escenarios/retos','estudio/matematicas/examen-final','estudio/matematicas/certificado','propuestas','propuestas/nueva','propuestas/admin','estudio/ingles','estudio/matematicas','estudio/ciencia-datos','estudio/ingles/hablar','cursos/ciberseguridad/retos','cursos/ciberseguridad/firewalls/retos','estudio/ingles/hablar-escuchar/retos','estudio/lectura','estudio/matematicas/algebra-basica','cursos/python','cursos/python/editor','cursos/python/laboratorio','cursos/python/laboratorio/bucles','cursos/python/laboratorio/t/suma-hasta','cursos/python/variables/l/variables','estudio/lectura/libro/aesop','estudio/lectura/libro/aesop/1','estudio/lectura/libro/estadistica/3','estudio/lectura/libro/python/2'];
for(const [area,mat] of [['cursos','ciberseguridad'],['cursos','excel'],['cursos','python'],['estudio','ingles'],['estudio','matematicas'],['estudio','ciencia-datos']]){
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
  // --solo-formulas: solo la revisión de fórmulas de los pasos (más rápida)
  if(!process.argv.includes('--solo-formulas'))for(const ancho of [360,412])for(const esquema of ['light','dark']){
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
  // Fórmulas de los pasos (todas las materias) a 360 px: ninguna se parte en dos renglones ni se sale de la pantalla
  // (las largas van en .formula-caja, que se desplaza de lado). Usa la ruta oculta #diag-pasos/<generador>.
  {globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
   const {GENERADORES}=await import(pathToFileURL(join(raiz,'src','nucleo','generadores','index.js')).href);
   const ctx=await b.newContext({viewport:{width:360,height:800},hasTouch:true});
   await ctx.addInitScript(()=>{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')});
   const p=await ctx.newPage();await p.goto(BASE+'#diag-pasos/al/gauss');await p.waitForSelector('#diag-listo');
   let revisados=0,formulas=0;
   for(const id of Object.keys(GENERADORES)){
     await p.evaluate(r=>{location.hash=r},'diag-pasos/'+id);
     await p.waitForFunction(id=>document.getElementById('diag-listo')?.textContent===id,id,{timeout:15000}).catch(()=>{});
     const r=await p.evaluate(()=>{const vw=document.documentElement.clientWidth,mal=[];let n=0;
       const rotas=new Set();
       for(const k of document.querySelectorAll('#vista .paso-como .katex, #vista .pista .katex')){n++;
         const enBloque=k.closest('.formula-caja');
         if(!enBloque&&!k.closest('.katex-display')){const tops=new Set([...k.getClientRects()].map(x=>Math.round(x.top)));if(tops.size>1)rotas.add('partida: '+k.textContent.slice(0,40))}
         const rb=k.getBoundingClientRect();
         if(!enBloque&&rb.right>vw+1)rotas.add('se sale: '+k.textContent.slice(0,40));}
       for(const c of document.querySelectorAll('#vista .formula-caja')){const rc=c.getBoundingClientRect();if(rc.right>vw+1||rc.left<-1)rotas.add('caja fuera: '+c.textContent.slice(0,40))}
       return {n,mal:[...rotas]}});
     revisados++;formulas+=r.n;
     if(r.mal.length)fallos.push(`fórmulas #diag-pasos/${id}: ${r.mal.slice(0,3).join(' · ')}`);
   }
   pantallas+=revisados;console.log(`fórmulas de los pasos: ${revisados} generadores, ${formulas} fórmulas a 360 px`);
   await ctx.close();}
  // Textos que dicen que algo «no está» cuando el contenido existe (Logros, Mapa MCER, Cursos, Lectura). La tarjeta de
  // «Próximamente…» de Cursos que lleva a 🗳️ Propuestas sí es cierta (son cursos que todavía no existen).
  {const ctx=await b.newContext({viewport:{width:360,height:800},hasTouch:true});
   await ctx.addInitScript(()=>{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')});
   const p=await ctx.newPage();
   for(const ruta of ['logros','estudio/ingles/hablar','estudio/ingles','cursos','estudio','estudio/lectura']){
     await p.goto(BASE+'#'+ruta);await p.reload();await p.waitForSelector('#vista > *');await p.waitForTimeout(300);
     const t=await p.evaluate(()=>{const v=document.getElementById('vista').cloneNode(true);v.querySelectorAll('[data-go="propuestas"]').forEach(x=>x.remove());return v.textContent});
     const m=t.match(/Próximamente|todav[ií]a no (est[aá]|existe|hay)|a[uú]n no (est[aá]|existe|disponible)|no disponible/i);
     if(m)fallos.push(`#${ruta}: dice «${m[0]}» y el contenido ya existe`);
     pantallas++;
   }
   await p.goto(BASE+'#logros');await p.reload();await p.waitForSelector('#vista > *');
   const lg=await p.textContent('#vista');
   for(const x of ['Inglés B1','Inglés B2','Curso de Python','Primer libro'])if(!lg.includes(x))fallos.push(`#logros: falta el logro «${x}» (los logros salen del contenido)`);
   await ctx.close();}
  // El botón Atrás tiene su propia prueba: npm run atras (scripts/atras.mjs)
}finally{await b.close();apagar()}
fallos.forEach(x=>console.log('ERROR  '+x));
console.log(fallos.length?`\n${fallos.length} problemas en ${pantallas} pantallas`:`\n${pantallas} pantallas sin textos encimados, sin scroll horizontal y con toques ≥ 44 px.`);
process.exit(fallos.length?1:0);
