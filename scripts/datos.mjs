/* npm run datos: «💾 Mis datos» en el navegador (360 px), con dos «teléfonos» (contextos) distintos.
   - A exporta un .estudio (gzip); B lo importa con «Combinar»: la XP y los ejercicios se suman exacto, las notas de los dos
     quedan, una nota borrada en A no vuelve en B, y combinar otra vez no duplica nada.
   - «Reemplazar» deja en B exactamente lo de A. Un respaldo .json viejo (formato 1) también se lee.
   - El resumen del archivo (XP, notas, fotos, último uso) aparece antes de elegir; la clave de IA nunca va en el archivo.
   Compila (salvo --sin-build), levanta `vite preview` en el puerto 4795 y lo apaga al terminar. --capturas <dir>. */
import {existsSync,readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {gunzipSync} from 'node:zlib';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4795,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null;
const tmp=mkdtempSync(join(tmpdir(),'estudio-datos-'));

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
const hoy=new Date(),d=n=>{const x=new Date(hoy);x.setDate(x.getDate()-n);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
// Un «teléfono»: progreso v11 propio, una clave de IA y notas en IndexedDB
async function telefono(nombre,{xp,ej,notas,equipo}){
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,acceptDownloads:true});
  const prog={v:11,meta:{tipo:'ejercicios',cantidad:10},mejorRacha:0,dominados:0,repaso:{},notas:{},tarjetas:{},basicos:{},refuerzos:{},estrellas:{},frases:{},historial:[],ultimo:null,
    dias:{[d(0)]:{ej,seg:0,xp,ok:ej>=10}},materias:{matematicas:{xp,lecciones:{},extra:{},visitadas:[]}}};
  await ctx.addInitScript(([prog,equipo,nombre])=>{if(!localStorage.getItem('ciberlab-progreso')){
    localStorage.setItem('ciberlab-usuario',JSON.stringify({bienvenida:true,nombre}));localStorage.setItem('ciberlab-progreso',JSON.stringify(prog));
    localStorage.setItem('ciberlab-equipo',equipo);localStorage.setItem('ciberlab-ia',JSON.stringify({proveedor:'gemini',claves:{gemini:'AIzaPRUEBA-no-es-real'}}))}},[prog,equipo,nombre]);
  const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
  await p.goto(BASE+'#perfil');await p.waitForTimeout(1200);
  await p.evaluate(async notas=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas',2);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
    await new Promise(res=>{const t=db.transaction('notas','readwrite');for(const n of notas)t.objectStore('notas').put(n);t.oncomplete=res})},notas);
  return {ctx,p,err};
}
const xpDe=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')).materias.matematicas.xp);
const ejHoy=p=>p.evaluate(dd=>JSON.parse(localStorage.getItem('ciberlab-progreso')).dias[dd]?.ej,d(0));
const notasDe=p=>p.evaluate(async()=>{const db=await new Promise(res=>{const r=indexedDB.open('ciberlab-notas',2);r.onsuccess=()=>res(r.result)});
  return new Promise(res=>{const r=db.transaction('notas').objectStore('notas').getAll();r.onsuccess=()=>res(r.result.map(n=>n.titulo).sort())})});
async function exportar(p,archivo){
  await p.goto(BASE+'#perfil');await p.waitForTimeout(800);
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#resp-exportar')]);
  await dl.saveAs(archivo);return dl.suggestedFilename();
}
async function importar(p,archivo,modo){
  await p.goto(BASE+'#perfil');await p.waitForTimeout(800);
  await p.setInputFiles('#resp-archivo',archivo);await p.waitForSelector('.modal',{timeout:8000});
  const txt=await p.textContent('.modal');
  if(capturas)await p.screenshot({path:join(capturas,`datos-${modo}.png`)});
  await p.click(`.modal button:has-text("${modo==='combinar'?'Combinar':'Reemplazar'}")`);
  if(modo==='reemplazar'){await p.waitForTimeout(300);await p.click('.modal button:has-text("Sí, reemplazar")')}
  await p.waitForTimeout(1500);return txt;
}
try{
  const ahora=Date.now();
  const A=await telefono('Ana',{xp:120,ej:8,equipo:'equipo-A',notas:[{id:'na',titulo:'Nota de A',cuerpo:'hola',etiquetas:[],creada:ahora,editada:ahora},{id:'nx',titulo:'Se borra en A',cuerpo:'x',etiquetas:[],creada:ahora,editada:ahora}]});
  const B=await telefono('Beto',{xp:50,ej:4,equipo:'equipo-B',notas:[{id:'nb',titulo:'Nota de B',cuerpo:'adiós',etiquetas:[],creada:ahora,editada:ahora}]});
  // B recibe primero «Se borra en A» (respaldo de A), luego A la borra
  const a1=join(tmp,'a1.estudio');await exportar(A.p,a1);
  // en A se borra la nota con el diálogo propio
  await A.p.goto(BASE+'#notas');await A.p.waitForTimeout(900);
  await A.p.goto(BASE+'#notas/n/nx');await A.p.waitForTimeout(900);
  await A.p.click('[aria-label="Borrar nota"], #nota-borrar').catch(()=>{});await A.p.waitForTimeout(300);
  await A.p.click('.modal [data-r="1"]').catch(()=>{});await A.p.waitForTimeout(800);
  const lap=await A.p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-borradas')||'{}'));
  check(!!lap.nx,'borrar una nota deja su lápida (para que no vuelva al combinar)');
  // el archivo: gzip, con todo y sin la clave de IA
  const nom=await exportar(A.p,join(tmp,'a2.estudio')),crudo=readFileSync(join(tmp,'a2.estudio'));
  check(/\.estudio$/.test(nom)&&crudo[0]===0x1f&&crudo[1]===0x8b,`el respaldo es un .estudio comprimido (${nom}, ${crudo.length} bytes)`);
  const json=gunzipSync(crudo).toString();
  check(!/AIzaPRUEBA|ciberlab-ia/.test(json),'el respaldo no incluye la clave de IA');
  const r=JSON.parse(json);check(r.dispositivo==='equipo-A'&&r.progreso.materias.matematicas.xp===120&&r.borradas.nx,'trae progreso, equipo y lápidas');
  // B combina el primer respaldo (con la nota que luego se borró) y después el segundo
  const txt=await importar(B.p,a1,'combinar');
  check(/120 XP/.test(txt)&&/2 notas/.test(txt)&&/50 XP/.test(txt)&&/último uso/.test(txt),'antes de elegir se ve el resumen del archivo y el de este dispositivo');
  await importar(B.p,join(tmp,'a2.estudio'),'combinar');
  check(await xpDe(B.p)===170&&await ejHoy(B.p)===12,`combinar suma la XP y los ejercicios exacto (${await xpDe(B.p)} XP, ${await ejHoy(B.p)} ej; se esperaba 170 y 12)`);
  check(JSON.stringify(await notasDe(B.p))==='["Nota de A","Nota de B"]','quedan las notas de los dos y la borrada en A no vuelve: '+JSON.stringify(await notasDe(B.p)));
  await importar(B.p,join(tmp,'a2.estudio'),'combinar');
  check(await xpDe(B.p)===170,'combinar otra vez no duplica la XP');
  check(await B.p.evaluate(()=>!!localStorage.getItem('ciberlab-ia')),'la clave de IA de este teléfono se conserva');
  // A combina lo de B: los dos quedan iguales
  await exportar(B.p,join(tmp,'b.estudio'));await importar(A.p,join(tmp,'b.estudio'),'combinar');
  check(await xpDe(A.p)===170&&JSON.stringify(await notasDe(A.p))==='["Nota de A","Nota de B"]','al combinar en el otro sentido los dos teléfonos quedan iguales');
  // Reemplazar
  const C=await telefono('Caro',{xp:999,ej:30,equipo:'equipo-C',notas:[{id:'nc',titulo:'Nota de C',cuerpo:'',etiquetas:[],creada:ahora,editada:ahora}]});
  await importar(C.p,a1,'reemplazar');
  check(await xpDe(C.p)===120&&JSON.stringify(await notasDe(C.p))==='["Nota de A","Se borra en A"]','«Reemplazar» deja solo lo del archivo');
  // un .json viejo (formato 1, progreso v10)
  const viejo={tipo:'ciberlab-respaldo',formato:1,app:'Estudio+',fecha:new Date().toISOString(),progreso:{v:10,meta:{tipo:'ejercicios',cantidad:10},dias:{},materias:{ingles:{xp:40,lecciones:{},extra:{}}}},notas:[{id:'nv',titulo:'Vieja',cuerpo:'',editada:1}],archivos:[]};
  writeFileSync(join(tmp,'viejo.json'),JSON.stringify(viejo));await importar(C.p,join(tmp,'viejo.json'),'combinar');
  check((await C.p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')).materias.ingles?.xp))===40&&(await notasDe(C.p)).includes('Vieja'),'un respaldo .json de antes también se combina');
  if(capturas){await C.p.goto(BASE+'#perfil');await C.p.waitForTimeout(600);await C.p.locator('.respaldo').screenshot({path:join(capturas,'datos-tarjeta.png')})}
  const errores=[...A.err,...B.err,...C.err];check(!errores.length,`sin errores en la página${errores.length?': '+errores.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
