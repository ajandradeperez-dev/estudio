/* node scripts/emparejar-ui.mjs [carpeta]: Mis materias encuentra la práctica que la app ya tiene (PROMPT-EMPAREJAR-TEMAS).
   Importa una materia «Derivadas» (de una versión anterior: sin emparejar con el algoritmo nuevo) con los temas «binomios»,
   «Teorema del binomio» y «Historia de México»; al recargar se vuelve a emparejar y avisa «🎯 Ahora N temas…».
   En el teléfono (360 px, claro y oscuro): «binomios» pregunta «¿Es alguno de estos?», elegir uno lo empareja, «Cambiar o
   agregar práctica» busca «binom» y agrega Binomio de Newton, y «🔀 Practicar mezclado» abre una práctica.
   Guarda capturas en la carpeta (por omisión capturas/emparejar). Usa dist/ (corre npm run build antes). */
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4797,BASE=`http://localhost:${PUERTO}/`;
const salida=join(raiz,process.argv[2]||'capturas/emparejar');mkdirSync(salida,{recursive:true});
const {chromium}=await import('playwright-core');
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

const tema=(id,titulo)=>({id,titulo,subtemas:[],sabe:false,dificil:false,habilidad:null,emparejado:'ninguno'});
const fecha=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
const paquete={tipo:'ciberlab-materia',formato:1,exportada:new Date().toISOString(),generados:[],materia:{formato:1,id:'mp-derivadas1',nombre:'Derivadas',escuela:'Prepa',color:'#4652d0',icono:'📐',
  unidades:[{id:'u-uno',titulo:'Unidad 1: Repaso',temas:[tema('t-binom','binomios'),tema('t-teorema','Teorema del binomio'),tema('t-hist','Historia de México')]}],
  examenes:[{id:'x-par',nombre:'Parcial 1',fecha,unidades:['u-uno']}],disponibilidad:{dias:[1,2,3,4,5],minutos:30},avisos:false,fotos:[],referencias:[],simulacros:[],reportados:{},creada:1,editada:1}};
const archivo=join(salida,'derivadas.json');writeFileSync(archivo,JSON.stringify(paquete));

const fallos=[],ok=m=>console.log('✓',m),mal=m=>{fallos.push(m);console.log('✗',m)};
const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
try{
  for(const esquema of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:360,height:800},colorScheme:esquema,hasTouch:true,deviceScaleFactor:2});
    await ctx.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}catch(e){}});
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
    const ir=async r=>{await p.evaluate(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})),r);await p.waitForTimeout(400)};
    await p.goto(BASE+'#mias');await p.waitForSelector('#mp-importar',{state:'attached'});
    await p.setInputFiles('#mp-importar',archivo);await p.waitForTimeout(800);
    // al recargar, la versión nueva vuelve a emparejar y avisa
    await p.goto(BASE+'#mias');await p.reload();await p.waitForSelector('#vista > *');await p.waitForTimeout(1200);
    await ir('mias');
    const lista=await p.textContent('#vista');
    if(/Ahora 1 tema de tus materias tiene práctica/.test(lista))ok('aviso «🎯 Ahora 1 tema de tus materias tiene práctica»');else mal('no aparece el aviso de temas con práctica nueva');
    if(esquema==='light')await p.screenshot({path:join(salida,'lista.png')});
    // «binomios» en Derivadas: duda entre la regla de la cadena y productos notables
    await ir('mias/mp-derivadas1/t/t-binom');
    const txt=await p.textContent('#vista');
    if(/No encontré práctica automática para «binomios»\. ¿Es alguno de estos\?/.test(txt))ok('«binomios» pregunta «¿Es alguno de estos?»');else mal('«binomios» no pregunta: '+txt.slice(0,200));
    const sug=await p.$$eval('[data-tp-elegir]',bs=>bs.map(b=>b.dataset.tpElegir));
    if(sug.includes('matematicas|regla-cadena')&&sug.includes('matematicas|productos-notables'))ok('sugiere '+sug.join(', '));else mal('sugerencias: '+sug);
    const orden=await p.evaluate(()=>{const a=document.querySelector('[data-tp-elegir]'),b=document.getElementById('tp-cambiar'),c=document.querySelector('.mp-sin-ia');
      return {sugAntesDeIA:!c||(a.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING)>0,boton:!!b}});
    if(orden.sugAntesDeIA&&orden.boton)ok('la práctica de la app va antes que el mensaje de IA y hay «🔗 Elegir práctica de la app»');else mal('orden de la página del tema: '+JSON.stringify(orden));
    const d=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(d>0)mal(`scroll horizontal de ${d}px`);
    await p.screenshot({path:join(salida,`binomios-derivadas-360-${esquema==='light'?'claro':'oscuro'}.png`),fullPage:true});
    if(esquema==='dark'){await ctx.close();continue}
    // elegir una sugerencia → emparejado como manual
    await p.click('[data-tp-elegir="matematicas|regla-cadena"]');await p.waitForTimeout(600);
    if(/La app tiene práctica para esto: Regla de la cadena/.test(await p.textContent('#vista')))ok('al tocar «Regla de la cadena» queda emparejado');else mal('no quedó emparejado');
    // cambiar o agregar: buscar «binom» y agregar Binomio de Newton
    await p.click('#tp-cambiar');await p.waitForSelector('#eh-buscar');await p.fill('#eh-buscar','binom');await p.waitForTimeout(200);
    const res=await p.$$eval('#eh-lista [data-h]',bs=>bs.map(b=>b.dataset.h));
    if(res.includes('matematicas|productos-notables')&&res.includes('matematicas|binomio-newton'))ok('buscar «binom» muestra Productos notables y Binomio de Newton');else mal('buscar binom: '+res);
    await p.screenshot({path:join(salida,'elegir-practica.png')});
    await p.click('#eh-lista [data-h="matematicas|binomio-newton"]');await p.waitForTimeout(150);await p.click('[data-listo]');await p.waitForTimeout(600);
    const t2=await p.textContent('#vista');
    if(/Regla de la cadena/.test(t2)&&/Binomio de Newton/.test(t2)&&await p.$('#tp-mezcla'))ok('dos prácticas y «🔀 Practicar mezclado»');else mal('no quedaron las dos prácticas');
    await p.screenshot({path:join(salida,'dos-practicas.png'),fullPage:true});
    await p.click('#tp-mezcla');await p.waitForTimeout(600);
    if(await p.$('#ses-comprobar, #ses-cuerpo'))ok('la práctica mezclada abre una pregunta');else mal('la práctica mezclada no abrió');
    await p.screenshot({path:join(salida,'mezcla.png')});
    // «Teorema del binomio» quedó emparejado solo; «Historia de México» no
    await p.goto(BASE+'#mias/mp-derivadas1/t/t-teorema');await p.waitForTimeout(800);
    if(/La app tiene práctica para esto: Binomio de Newton/.test(await p.textContent('#vista')))ok('«Teorema del binomio» → Binomio de Newton (solo)');else mal('«Teorema del binomio» no se emparejó');
    await p.goto(BASE+'#mias/mp-derivadas1/t/t-hist');await p.waitForTimeout(800);
    const t3=await p.textContent('#vista');
    if(/Búscala tú/.test(t3)&&!await p.$('[data-tp-elegir]'))ok('«Historia de México» sin sugerencias: «Búscala tú»');else mal('«Historia de México» tiene sugerencias');
    if(err.length)mal('errores en la página: '+err.slice(0,3).join(' | '));
    await ctx.close();
  }
}finally{await b.close();apagar()}
console.log(fallos.length?`\n${fallos.length} fallos`:`\nTodo bien · capturas en ${salida}`);
process.exit(fallos.length?1:0);
