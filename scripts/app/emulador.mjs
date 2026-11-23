/* Prueba de la app nativa en un emulador Android (PROMPT-APP-NATIVA): node scripts/app/emulador.mjs [--sin-build]
   Necesita un emulador encendido (adb devices) y compila EstudioPlus-debug.apk (npm run apk -- --debug). Instala la app de
   cero, se conecta a su WebView con Chrome DevTools (adb forward) y prueba, con el botón Atrás y los enlaces de verdad de
   Android: la bienvenida para traer el progreso, Atrás, el enlace del correo (deep link), la voz (TTS y reconocimiento),
   compartir/exportar, imprimir, los recordatorios, Python sin internet y «Buscar actualización».
   Capturas en capturas/app/. */
import {execSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {homedir} from 'node:os';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','..'),CAP=join(raiz,'capturas','app');mkdirSync(CAP,{recursive:true});
const ADB=process.env.ADB||join(homedir(),'AppData','Local','Android','Sdk','platform-tools',process.platform==='win32'?'adb.exe':'adb');
const PAQ='io.github.ajandradeperez.estudio';
const adb=(c,o={})=>execSync(`"${ADB}" ${c}`,{encoding:o.binario?'buffer':'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64e6});
const dormir=ms=>new Promise(r=>setTimeout(r,ms));
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const captura=n=>writeFileSync(join(CAP,n+'.png'),adb('exec-out screencap -p',{binario:true}));
if(!adb('devices').split('\n').some(l=>/\tdevice\s*$/.test(l))){console.log('No hay un emulador encendido (adb devices).');process.exit(1)}
if(!process.argv.includes('--sin-build'))execSync('node scripts/app/apk.mjs --debug',{cwd:raiz,stdio:'ignore'});
adb(`uninstall ${PAQ}`);adb(`install -r "${join(raiz,'EstudioPlus-debug.apk')}"`);
adb(`shell pm grant ${PAQ} android.permission.POST_NOTIFICATIONS`);adb(`shell pm grant ${PAQ} android.permission.RECORD_AUDIO`);
const abrir=async(extra='')=>{adb(`shell am start -W -n ${PAQ}/.MainActivity ${extra}`);await dormir(2500)};
// Playwright no se conecta al WebView de Android (no admite contextos): se usa CDP directo con el WebSocket de la página
async function conectar(){
  for(let i=0;i<40;i++){
    const pid=adb(`shell pidof ${PAQ}`).trim();
    if(pid){try{adb('forward --remove-all')}catch(e){}adb(`forward tcp:9333 localabstract:webview_devtools_remote_${pid}`);
      try{const l=await (await fetch('http://127.0.0.1:9333/json/list')).json(),pg=l.find(x=>x.type==='page');
        if(pg){const c=await cdp(pg.webSocketDebuggerUrl);for(let k=0;k<30&&!(await c.ev("!!document.querySelector('#vista > *')"));k++)await dormir(1000);return c}}catch(e){}}
    await dormir(1500);
  }
  throw new Error('No se pudo conectar con el WebView de la app');
}
function cdp(url){
  return new Promise((res,rej)=>{
    const ws=new WebSocket(url);let n=0;const espera=new Map(),errores=[];
    ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&espera.has(d.id)){espera.get(d.id)(d);espera.delete(d.id)}if(d.method==='Runtime.exceptionThrown')errores.push(d.params.exceptionDetails?.exception?.description||d.params.exceptionDetails?.text)};
    const enviar=(method,params={})=>new Promise(r=>{const id=++n;espera.set(id,r);ws.send(JSON.stringify({id,method,params}))});
    ws.onerror=rej;
    ws.onopen=async()=>{await enviar('Runtime.enable');res({errores,cerrar:()=>ws.close(),
      async ev(expr){const r=await enviar('Runtime.evaluate',{expression:`(async()=>(${expr}))()`,awaitPromise:true,returnByValue:true});
        if(r.result?.exceptionDetails)throw new Error(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text);return r.result?.result?.value}})};
  });
}
await abrir();const c=await conectar();
const q=JSON.stringify;
const p={count:sel=>c.ev(`document.querySelectorAll(${q(sel)}).length`),click:sel=>c.ev(`(document.querySelector(${q(sel)}).click(),true)`),
  evaluate:(fn,arg)=>c.ev(`(${fn.toString()})(${q(arg)})`),fill:(sel,v)=>c.ev(`(()=>{const e=document.querySelector(${q(sel)});e.value=${q(v)};e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`),
  textContent:sel=>c.ev(`document.querySelector(${q(sel)})?.textContent??null`)};
const errores=c.errores;
const ruta=()=>c.ev('decodeURIComponent(location.hash.slice(1))');
try{
  // 1 · primera vez: traer el progreso de la app anterior
  await dormir(1500);
  check(await p.count('#ini-cuenta')===1&&await p.count('#ini-importar')===1&&await p.count('#ini-cero')===1,'primera vez: «Entrar con mi cuenta», «Importar respaldo» y «Empezar de cero»');
  check(await p.evaluate(()=>document.documentElement.dataset.nativa==='1'&&!navigator.serviceWorker?.controller),'corre como app nativa, sin service worker');
  captura('1-inicio');
  await p.click('#ini-importar');await dormir(400);check(await p.count('#resp-archivo')===1,'importar: el selector del respaldo .estudio');
  await p.click('#ini-volver');await p.click('#ini-cero');await dormir(800);
  check(await p.count('#bien-nombre')===1,'«Empezar de cero» sigue con la bienvenida de siempre');
  await p.click('#bien-saltar');await dormir(800);
  // 2 · Atrás de Android: pantalla anterior; capas primero
  await p.click('[data-go="estudio"]');await dormir(600);await p.click('[data-go="estudio/matematicas"]');await dormir(800);
  const antes=await ruta(),largo=await c.ev('history.length');adb('shell input keyevent KEYCODE_BACK');await dormir(1200);const despues=await ruta();
  check(antes==='estudio/matematicas'&&despues==='estudio',`Atrás de Android: vuelve a la pantalla anterior (${antes} → ${despues}, historial ${largo})`);
  // 3 · enlace del correo (deep link) → guarda la sesión y abre ☁️ Cuenta
  const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url'),token=`${b64({alg:'HS256',typ:'JWT'})}.${b64({sub:'prueba',exp:Math.floor(Date.now()/1000)+3600,email:'demo@example.com'})}.firma`;
  adb(`shell "am start -W -a android.intent.action.VIEW -d '${PAQ}://auth?cuenta=1#access_token=${token}&refresh_token=r&expires_in=3600&type=signup' ${PAQ}"`);await dormir(2500);
  check(await ruta()==='cuenta'&&await p.evaluate(()=>!!localStorage.getItem('ciberlab-cuenta')),'enlace io.github.ajandradeperez.estudio://auth: guarda la sesión y abre ☁️ Cuenta');
  await p.evaluate(()=>{localStorage.removeItem('ciberlab-cuenta')});
  // 4 · voz: texto a voz (plugin) y reconocimiento disponible
  const tts=await p.evaluate(async()=>{try{await Capacitor.Plugins.TextToSpeech.speak({text:'Hello, how are you?',lang:'en-US',rate:1});return 'ok'}catch(e){return String(e.message||e)}});
  check(tts==='ok','voz del examinador (TTS nativo): habla y avisa al terminar');
  const sr=await p.evaluate(async()=>{try{return (await Capacitor.Plugins.SpeechRecognition.available()).available}catch(e){return String(e.message||e)}});
  check(sr===true,`reconocimiento de voz nativo disponible (${sr})`);
  // 5 · compartir / exportar un respaldo: el menú de Android
  await p.evaluate(()=>document.dispatchEvent(new CustomEvent('ir',{detail:'perfil'})));await dormir(1000);
  await p.evaluate(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['hola'],{type:'text/plain'}));a.download='prueba.txt';a.click()});await dormir(2500);
  const hoja=adb('shell dumpsys window | grep -i mCurrentFocus');
  check(/chooser|ResolverActivity|intentresolver|sharesheet/i.test(hoja),`descargar/exportar abre el menú «Compartir» de Android (${hoja.trim().slice(-60)})`);
  captura('2-compartir');adb('shell input keyevent KEYCODE_BACK');await dormir(1200);
  // 6 · imprimir: el diálogo de impresión de Android
  p.evaluate(()=>Capacitor.Plugins.Imprimir.imprimir({titulo:'Prueba'})).catch(()=>{});await dormir(3500);
  const imp=adb('shell dumpsys window | grep -i mCurrentFocus');
  check(/print/i.test(imp),`imprimir abre el diálogo de impresión (${imp.trim().slice(-60)})`);
  captura('3-imprimir');adb('shell input keyevent KEYCODE_BACK');await dormir(1500);
  // 7 · recordatorio diario programado en Android
  const av=await p.evaluate(async()=>{
    await Capacitor.Plugins.LocalNotifications.schedule({notifications:[{id:1,title:'⏰ Hora de estudiar',body:'Prueba',schedule:{at:new Date(Date.now()+60000),repeats:true,every:'day'},isExactNotification:false}]});
    return (await Capacitor.Plugins.LocalNotifications.getPending()).notifications.length});
  check(av>=1,`recordatorio diario programado en Android (${av} pendiente)`);
  // 8 · Python sin internet (Pyodide dentro del APK)
  adb('shell cmd connectivity airplane-mode enable');await dormir(1500);
  await p.evaluate(()=>document.dispatchEvent(new CustomEvent('ir',{detail:'cursos/python/editor'})));await dormir(1500);
  await p.fill('#py-codigo','print(sum(range(5)))');await p.click('#py-ejecutar');
  for(let k=0;k<120&&!(await p.count('#py-resultado .py-salida, #py-resultado pre, #py-resultado .aviso-error'));k++)await dormir(1000);
  const salida=(await p.textContent('#py-resultado .py-salida'))??(await p.textContent('#py-resultado'));
  check(String(salida).trim().endsWith('10'),`Python sin internet (Pyodide del APK): «${String(salida).trim().slice(0,60)}»`);
  adb('shell cmd connectivity airplane-mode disable');
  captura('4-final');
  check(!errores.length,'sin errores de JavaScript'+(errores.length?': '+errores.slice(0,2).join(' | '):''));
}catch(e){console.log('FALLO inesperado: '+(e.stack||e.message));f++}
finally{try{adb('shell cmd connectivity airplane-mode disable')}catch(e){}c.cerrar()}
console.log(f?`\n${f} fallos`:'\nTodo bien en el emulador (capturas en capturas/app/)');
process.exit(f?1:0);
