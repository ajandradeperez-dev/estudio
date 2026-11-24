/* Graba las escenas de los videos (PROMPT-VIDEO) con la app REAL: node scripts/video/grabar.mjs [--solo promo|tutorial]
   [--escena N] [--horizontal | --vertical] [--sin-build]
   - Perfil de demostración «Alex» (scripts/video/demo.mjs) en un contexto limpio: nada real, nada se sube a Supabase.
   - La IA se simula (respuestas fijas) y el reconocimiento de voz también: no hace falta red ni cuota.
   - Cada escena se graba por separado en videos/escenas/<serie>/<NN-nombre>/ como cuadros JPEG con su tiempo; montar.mjs
     los convierte en video. Teléfono: capturas seguidas a escala 1,75 (la transmisión de Chrome solo da 412 px de ancho
     y quedaría borroso); laptop: la transmisión (Page.startScreencast), que ya es 1920 × 1080.
   - Teléfono 412 × 915 (dpr 2.625 → 1080 × 2400) y, para el tutorial horizontal, laptop 1920 × 1080.
   - Un círculo suave marca cada toque (solo en el video: se inyecta aquí, la app no cambia), el texto se escribe letra
     por letra y hay pausas para leer. */
import {existsSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';
import {progresoDemo,USUARIO,NOTAS,CLAVE_RELLENO,respuestaIA} from './demo.mjs';
import {ESCENAS} from './guion.mjs';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','..'),PUERTO=4797,BASE=`http://localhost:${PUERTO}/?video=1`;
const arg=(n,def=null)=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:def};
const SOLO=arg('--solo'),ESCENA=arg('--escena'),SOLO_H=process.argv.includes('--horizontal'),SOLO_V=process.argv.includes('--vertical');
const DIR=join(raiz,'videos','escenas');mkdirSync(DIR,{recursive:true});
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
const dormir=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- lo que se inyecta en la página: dedo visible, voz simulada ---------- */
const EN_PAGINA=()=>{
  // Reconocimiento de voz: «oye» lo que haya en window.__oir; la voz del teléfono termina enseguida (el video lleva su propia voz)
  window.__oir=[];
  window.SpeechSynthesisUtterance=class{constructor(t){this.text=t}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){setTimeout(()=>u.onend?.(),900)},cancel(){},getVoices:()=>[],addEventListener(){}}});
  window.SpeechRecognition=window.webkitSpeechRecognition=class{start(){setTimeout(()=>{const t=window.__oir.shift()||'Yes, please';
    const res=Object.assign([{transcript:t,confidence:.9}],{isFinal:true});this.onresult?.({resultIndex:0,results:[res]});setTimeout(()=>this.onend?.(),5)},1200)}stop(){}abort(){}};
  // El dedo: un círculo que se mueve al punto y hace una onda al tocar
  addEventListener('DOMContentLoaded',()=>{
    const st=document.createElement('style');st.textContent=`#v-dedo{position:fixed;z-index:2147483647;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(88,80,236,.9);box-shadow:0 2px 10px rgba(0,0,0,.25);pointer-events:none;opacity:0;transition:left .35s ease,top .35s ease,opacity .2s,transform .12s}
#v-dedo.toca{transform:scale(.8);background:rgba(88,80,236,.35)}.v-onda{position:fixed;z-index:2147483646;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid rgba(88,80,236,.8);pointer-events:none;animation:v-onda .5s ease-out forwards}
@keyframes v-onda{to{transform:scale(3.4);opacity:0}}`;document.head.appendChild(st);
    const d=document.createElement('div');d.id='v-dedo';document.body.appendChild(d);
    window.__dedo=(x,y,{rapido=false}={})=>{d.style.transition=rapido?'none':'';d.style.left=x+'px';d.style.top=y+'px';d.style.opacity='1'};
    window.__soltar=()=>{d.style.opacity='0'};
    addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&!window.__ratonVisible)return;window.__dedo(e.clientX,e.clientY,{rapido:true});d.classList.add('toca');
      const o=document.createElement('div');o.className='v-onda';o.style.left=e.clientX+'px';o.style.top=e.clientY+'px';document.body.appendChild(o);setTimeout(()=>o.remove(),600)},true);
    addEventListener('pointermove',e=>{if(e.buttons&&e.pointerType!=='mouse')window.__dedo(e.clientX,e.clientY,{rapido:true})},true);
    addEventListener('pointerup',()=>d.classList.remove('toca'),true);
  });
};

/* ---------- ayudantes para las escenas (movimientos a ritmo humano) ---------- */
function ayudantes(p,{tactil}){
  const h={
    p,
    esperar:dormir,
    async ir(ruta){await p.evaluate(r=>document.dispatchEvent(new CustomEvent('ir',{detail:r})),ruta);await dormir(700)},
    async apuntar(loc){const l=typeof loc==='string'?p.locator(loc).first():loc;await l.scrollIntoViewIfNeeded().catch(()=>{});const b=await l.boundingBox();if(!b)throw new Error('No se ve: '+loc);
      await p.evaluate(([x,y])=>window.__dedo?.(x,y),[b.x+b.width/2,b.y+b.height/2]);await dormir(420);return l},
    async tocar(loc,{pausa=650}={}){const l=await h.apuntar(loc);if(tactil)await l.tap();else await l.click();await dormir(pausa);return l},
    async tocarTexto(texto,{pausa}={}){return h.tocar(p.getByText(texto,{exact:false}).first(),{pausa})},
    async escribir(loc,texto,{retraso=70}={}){const l=await h.tocar(loc,{pausa:250});await l.pressSequentially(texto,{delay:retraso});await dormir(400);return l},
    async bajar(px=400,pasos=8){for(let i=0;i<pasos;i++){await p.mouse.wheel(0,px/pasos);await dormir(45)}await dormir(350)},
    async subir(){await p.evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await dormir(500)},
    soltar:()=>p.evaluate(()=>window.__soltar?.()),
    // un trazo con el dedo sobre el lienzo del dibujo: lista de puntos [x, y] relativos al lienzo
    async trazo(puntos,{id=1,ms=14}={}){
      await p.evaluate(async([puntos,id,ms])=>{const cv=document.querySelector('.dib-cvivo'),r=cv.getBoundingClientRect(),zz=t=>new Promise(s=>setTimeout(s,t));
        const ev=(t,[x,y])=>cv.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',isPrimary:true,pressure:t==='pointerup'?0:.5,buttons:t==='pointerup'?0:1,button:t==='pointermove'?-1:0,clientX:r.left+x,clientY:r.top+y}));
        ev('pointerdown',puntos[0]);for(const q of puntos.slice(1)){ev('pointermove',q);await zz(ms)}ev('pointerup',puntos.at(-1))},[puntos,id,ms]);
      await dormir(250);
    }
  };
  return h;
}

/* ---------- grabar una escena: cuadros JPEG con su tiempo ---------- */
async function grabar(nav,serie,esc,horizontal){
  const carpeta=join(DIR,serie+(horizontal?'-16x9':'-9x16'),esc.id);rmSync(carpeta,{recursive:true,force:true});mkdirSync(carpeta,{recursive:true});
  const tactil=!horizontal;
  const ctx=await nav.newContext(horizontal?{viewport:{width:1920,height:1080},deviceScaleFactor:1}
    :{viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  const sinClave=esc.sinClave;
  await ctx.addInitScript(([prog,usu,clave])=>{
    if(!sessionStorage.getItem('demo')){sessionStorage.setItem('demo','1');localStorage.clear();
      localStorage.setItem('ciberlab-progreso',JSON.stringify(prog));localStorage.setItem('ciberlab-usuario',JSON.stringify(usu));
      localStorage.setItem('ciberlab-aviso-app','1');localStorage.setItem('ciberlab-dibujo',JSON.stringify({pluma:{tipo:'boli',color:'#2563eb',ancho:5}}));localStorage.setItem('ciberlab-ajustes',JSON.stringify({sonido:false}));
      if(clave)localStorage.setItem('ciberlab-ia',JSON.stringify({proveedor:'gemini',claves:{gemini:clave}}))}
  },[progresoDemo(),USUARIO,sinClave?null:CLAVE_RELLENO]);
  await ctx.addInitScript(EN_PAGINA);
  // sin red hacia afuera: la IA simulada, y Supabase y lo demás bloqueados (nada se sube)
  await ctx.route(/^https?:\/\/(?!localhost)/,async r=>{
    const u=r.request().url();
    if(u.includes('generativelanguage.googleapis.com')){const res=respuestaIA(JSON.parse(r.request().postData()||'{}'));await dormir(900);
      return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:typeof res==='string'?res:JSON.stringify(res)}]},finishReason:'STOP'}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:10}})})}
    if(/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u))return r.continue();
    return r.abort();
  });
  const p=await ctx.newPage(),errores=[];p.on('pageerror',e=>errores.push(e.message));
  await p.goto(BASE+'#notas');await p.waitForSelector('#vista > *');await dormir(800);
  // notas de ejemplo en el cuaderno
  await p.evaluate(async notas=>{const db=await new Promise((res,rej)=>{const r=indexedDB.open('ciberlab-notas');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
    const t=db.transaction('notas','readwrite'),s=t.objectStore('notas'),ahora=Date.now();
    notas.forEach((n,i)=>s.put({id:'demo-'+i,fijada:false,...n,creada:new Date(ahora-(i+2)*864e5).toISOString(),editada:new Date(ahora-(i+1)*36e5).toISOString()}));
    await new Promise(r=>{t.oncomplete=r});db.close()},NOTAS);
  await p.goto(BASE+'#'+(esc.ruta||''));await p.reload();await p.waitForSelector('#vista > *');await dormir(900);
  if(esc.antes)try{await esc.antes(ayudantes(p,{tactil}),{horizontal})}catch(e){errores.push('antes: '+e.message.split(String.fromCharCode(10))[0])}
  // a grabar
  const cdp=await ctx.newCDPSession(p),cuadros=[];let n=0,grabando=true;const t0=Date.now()/1000,ESC=1.75;
  const guardar=(data,t)=>{const f=`c${String(++n).padStart(5,'0')}.jpg`;writeFileSync(join(carpeta,f),Buffer.from(data,'base64'));cuadros.push({f,t})};
  const [mw,mh]=horizontal?[1920,1080]:[Math.round(412*ESC),Math.round(915*ESC)];
  let bucle=null;
  if(horizontal){
    cdp.on('Page.screencastFrame',({data,metadata,sessionId})=>{guardar(data,metadata.timestamp??Date.now()/1000);cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{})});
    await cdp.send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:mw,maxHeight:mh,everyNthFrame:1});
  }else bucle=(async()=>{while(grabando){
    const t=Date.now()/1000;
    try{const m=await cdp.send('Page.getLayoutMetrics'),v=m.cssVisualViewport||m.visualViewport;
      const r=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:86,optimizeForSpeed:true,clip:{x:v.pageX,y:v.pageY,width:412,height:915,scale:ESC}});guardar(r.data,t)}
    catch(e){await dormir(30)}}})();
  // el primer cuadro aunque la pantalla no cambie
  await p.evaluate(()=>{document.body.style.outline='0px solid transparent'});await dormir(300);
  try{await esc.accion(ayudantes(p,{tactil}),{horizontal})}catch(e){errores.push('escena: '+e.message)}
  await h0(p);await dormir(esc.final??900);
  const fin=Date.now()/1000;
  grabando=false;if(bucle)await bucle;else await cdp.send('Page.stopScreencast');await dormir(200);
  writeFileSync(join(carpeta,'cuadros.json'),JSON.stringify({ancho:mw,alto:mh,inicio:cuadros[0]?.t??t0,fin:Math.max(fin,(cuadros.at(-1)?.t??fin)+.1),cuadros}));
  await ctx.close();
  console.log(`${errores.length?'⚠️ ':'✓ '}${serie}${horizontal?' 16:9':' 9:16'} · ${esc.id}: ${cuadros.length} cuadros, ${(Math.max(fin,cuadros.at(-1)?.t||fin)-(cuadros[0]?.t||t0)).toFixed(1)} s${errores.length?' — '+errores.slice(0,2).join(' | '):''}`);
  return errores.length;
}
const h0=p=>p.evaluate(()=>window.__soltar?.()).catch(()=>{});

/* ---------- principal ---------- */
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await dormir(3500);
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const nav=await chromium.launch({executablePath:ruta});
let fallos=0;
try{
  for(const serie of ['promo','tutorial']){
    if(SOLO&&SOLO!==serie)continue;
    for(const [i,esc] of ESCENAS[serie].entries()){
      if(ESCENA&&+ESCENA!==i+1)continue;
      if(!esc.accion)continue;   // tarjetas de título: las hace montar.mjs
      if(!SOLO_H)fallos+=await grabar(nav,serie,esc,false);
      if(serie==='tutorial'&&!SOLO_V)fallos+=await grabar(nav,serie,esc,true);
    }
  }
}finally{await nav.close();apagar()}
console.log(fallos?`\n${fallos} avisos al grabar`:'\nEscenas grabadas en videos/escenas/');
process.exit(0);
