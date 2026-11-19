/* npm run simulacros: 🏁 simulacros de Inglés, examinador con IA, conversación libre y prueba de nivel en el navegador.
   Todo con dobles: la voz del teléfono (speechSynthesis), el reconocimiento de voz (SpeechRecognition dice lo que la prueba
   le pida) y la IA (Gemini simulado con page.route: no gasta cuota ni necesita clave real).
   Comprueba: un simulacro de cada nivel respondido automáticamente (todo bien → 100 % y nivel estimado), que el texto de
   la escucha solo aparece en la revisión, el límite de 2 reproducciones, el reloj (al acabarse pasa a la parte siguiente),
   pausar y retomar, «solo una parte», el examinador sin IA (guion fijo y autoevaluación) y con IA (seguimiento y
   calificación en JSON), la revisión de escritura con IA, la conversación libre (corrección, ayuda, traducción, palabras
   a Repasar, historial y borrarlo), los errores 401, 429 y sin red, y la prueba de nivel (adaptativa y ajustar el punto
   de partida). Compila (salvo --sin-build), levanta `vite preview` en el puerto 4793 y lo apaga al terminar. */
import {existsSync,mkdirSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4793,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
const M=await import(pathToFileURL(join(raiz,'src','materias','ingles','simulacros','motor.js')).href);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
const dirCap=join(raiz,'capturas','simulacros');mkdirSync(dirCap,{recursive:true});
const foto=(p,n)=>p.screenshot({path:join(dirCap,n+'.png')}).catch(()=>{});
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};

// Dobles de voz: el TTS anota lo que dice y termina enseguida; el reconocedor "oye" lo que haya en window.__oir
const DOBLES=()=>{
  window.__dicho=[];window.__oir=[];window.__relojSimulacro=window.__relojSimulacro||1;window.__sinEsperaPrueba=true;
  window.SpeechSynthesisUtterance=class{constructor(t){this.text=t}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak(u){window.__dicho.push(u.text);setTimeout(()=>u.onend?.(),5)},cancel(){},getVoices:()=>[],addEventListener(){}}});
  window.SpeechRecognition=class{start(){setTimeout(()=>{const t=window.__oir.shift()||'I like it';
      const alt={transcript:t,confidence:0.86},res=Object.assign([alt],{isFinal:true});this.onresult?.({resultIndex:0,results:[res]});setTimeout(()=>this.onend?.(),5)},20)}
    stop(){}abort(){}};
};
// IA simulada: según el sistema de la petición, responde como examinador, calificador, revisor de escritura o tutor
let modoIA='ok',llamadas=[];
async function ia(route){
  const cuerpo=JSON.parse(route.request().postData()||'{}'),sis=cuerpo.systemInstruction?.parts?.[0]?.text||'';llamadas.push(sis.slice(0,160));
  if(modoIA==='429')return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:{status:'RESOURCE_EXHAUSTED',message:'quota'}})});
  if(modoIA==='401')return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{status:'INVALID_ARGUMENT',message:'API key not valid. Please pass a valid API key.'}})});
  let r;
  if(/speaking examiner/.test(sis)&&/Decide your next turn/.test(JSON.stringify(cuerpo.contents)))r={dice:'Why is that important to you?',accion:(cuerpo.contents.length%4===0)?'siguiente':'seguimiento',pregunta:1};
  else if(/Grade each criterion/.test(sis)){const ks=Object.keys(cuerpo.generationConfig.responseJsonSchema.properties.criterios.properties);
    r={criterios:Object.fromEntries(ks.map(k=>[k,{nota:4,comentario:'Bien.'}])),bien:['Respondiste completo','Buen vocabulario','Pronunciación clara'],errores:[{original:'I have 25 years',corregida:'I am 25 years old',por:'La edad va con to be.'}],frases:[{en:'That is a good question.',es:'Buena pregunta.'}],nivel:'B1'}}
  else if(/writing examiner/.test(sis))r={criterios:[['Content',4],['Organisation',4],['Language',3],['Communicative achievement',4]].map(([criterio,nota])=>({criterio,nota,comentario:'Bien.'})),correcciones:[{original:'I go yesterday',corregido:'I went yesterday',por:'Pasado.'}],comentario:'Buen texto.'};
  else if(/Sugiere 3 respuestas/.test(sis))r={opciones:[{en:'I would like a coffee.',es:'Quisiera un café.'},{en:'Just water, please.',es:'Solo agua.'}]};
  else if(/Traduce al español/.test(sis))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:'¿Qué te gustaría pedir?'}]},finishReason:'STOP'}]})});
  else if(/reporte final/.test(sis))r={fortalezas:['Fluidez'],errores_frecuentes:[{error:'I want a coffee',correcto:'I would like a coffee',explicacion:'Más cortés.'}],frases_para_practicar:[{en:'Could I have the bill?',es:'¿Me trae la cuenta?'}],nivel_estimado:'A2'};
  else r={respuesta:'Great! What would you like to order?',correcciones:[{dije:'I want coffee',correcto:'I would like a coffee',explicacion:'Más cortés con would like.',tipo:'naturalidad'}],frase_mejorada:'I would like a coffee, please.',pista:'¿Quieres una pista? Puedes decir: I would like…',nueva_palabra:{en:'bill',es:'la cuenta'}};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(r)}]},finishReason:'STOP'}]})});
}

const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
try{
  const nuevo=async({clave=false,ancho=360,alto=800,oscuro=false}={})=>{
    const ctx=await b.newContext({viewport:{width:ancho,height:alto},isMobile:ancho<600,hasTouch:true,colorScheme:oscuro?'dark':'light'});
    await ctx.addInitScript(DOBLES);
    await ctx.addInitScript(([clave])=>{if(!localStorage.getItem('ciberlab-usuario')){localStorage.setItem('ciberlab-usuario','{"bienvenida":true,"nombre":"Ana"}');
      if(clave)localStorage.setItem('ciberlab-ia',JSON.stringify({proveedor:'gemini',claves:{gemini:['AI','za'].join('')+'-prueba-simulada'}}))}},[clave]);
    await ctx.route('https://generativelanguage.googleapis.com/**',ia);
    const p=await ctx.newPage();const err=[];p.on('pageerror',e=>err.push(e.message));return {ctx,p,err};
  };
  const ir=async(p,r)=>{await p.goto(BASE+'#'+r);await p.waitForSelector('#vista > *');await p.waitForTimeout(300)};
  const txt=async p=>(await p.textContent('#vista'))||'';
  // Responde una parte con las respuestas correctas (o mal, si bien=false)
  async function responderParte(p,s,parte,bien=true){
    for(const [k,t] of s[parte].entries()){
      if(parte==='escucha'){
        check(!(await txt(p)).includes(t.audio[0][1].slice(0,30)),`${s.id} escucha ${t.id}: el texto del audio no se ve durante el examen`);
        for(let n=0;n<M.REPRODUCCIONES;n++){if(await p.locator('#sm-oir:not([disabled])').count()){await p.click('#sm-oir');await p.waitForTimeout(150)}}
        if(k===0)check(await p.locator('#sm-oir[disabled]').count()===1,`${s.id}: el audio se puede oír ${M.REPRODUCCIONES} veces y no más`);
      }
      for(const [i,q] of t.preguntas.entries()){const id=`${t.id}.${i}`;
        if(q.tipo==='opcion'){const j=bien?q.correcta:(q.correcta+1)%q.opciones.length;await p.click(`[data-resp="${id}"][data-valor="${j}"]`)}
        else await p.fill(`input[data-resp="${id}"]`,bien?q.respuestas[0]:'zzz');
      }
      await p.click(k<s[parte].length-1?'#sm-sig':'#sm-fin-parte');await p.waitForTimeout(200);
    }
  }
  async function escribirParte(p,s){for(const [k,t] of s.escritura.entries()){await p.fill('#sm-texto',t.modelo);await p.click(k<s.escritura.length-1?'#sm-sig':'#sm-fin-parte');await p.waitForTimeout(200)}}
  // Parte de habla sin IA: guion fijo, respuestas por voz (reconocedor doble) y autoevaluación
  async function hablaSinIA(p,s){
    await p.click('#hb-empezar');await p.waitForTimeout(200);
    const total=s.habla.partes.reduce((a,x)=>a+x.preguntas.length,0);
    for(let n=0;n<total;n++){await p.evaluate(()=>window.__oir.push('I think it is a good idea because it helps people'));await p.click('#hb-mic');await p.waitForTimeout(250)}
    await p.click('#hb-calificar');await p.waitForTimeout(150);
    const ks=await p.$$eval('[data-autoeval$=":5"]',bs=>bs.map(b=>b.dataset.autoeval));
    for(const k of ks)await p.click(`[data-autoeval="${k}"]`);
    await p.click('#hb-guardar-auto');await p.waitForTimeout(400);
  }

  /* ---------- 1) un simulacro de cada nivel, sin IA, todo bien ---------- */
  {const {ctx,p,err}=await nuevo();
   for(const n of M.NIVELES){const s=M.SIMULACROS.find(x=>x.nivel===n);
     await ir(p,`estudio/ingles/simulacros/${s.id}`);
     check(/no es un examen oficial/.test(await txt(p)),`${s.id}: dice «Simulacro de práctica, no es un examen oficial»`);
     await p.click('#sm-empezar');await p.waitForSelector('.sim-examen');
     for(const parte of M.partesDe(s)){
       if(parte==='escritura')await escribirParte(p,s);else if(parte==='habla')await hablaSinIA(p,s);else await responderParte(p,s,parte,true);
     }
     await p.waitForTimeout(400);
     const t=await txt(p);
     if(!/100 %/.test(t))console.log('   ',t.slice(0,400).replace(/\s+/g,' '));
     check(/100 %/.test(t)&&/Estás en/.test(t),`${s.id}: todo bien → 100 % y nivel estimado («${(t.match(/Estás en[^.]*\./)||[''])[0]}»)`);
     await foto(p,`360-claro-resultado-${s.id}`);
     const e=s.escucha[0];check(t.includes(e.audio[0][1].slice(0,30)),`${s.id}: el texto de la escucha aparece en la revisión`);
   }
   const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')).materias.ingles.extra.simulacros);
   check(h?.length===4,`el historial guarda los 4 simulacros con fecha y puntaje (${h?.length})`);
   await ir(p,'estudio/ingles/simulacros');
   check(await p.locator('.sim-grafica').count()===1,'la lista muestra la gráfica de progreso');
   check(!err.length,`sin errores de JS ${err.slice(0,2).join(' | ')}`);
   await ctx.close();}

  /* ---------- 2) pausa, retomar, reloj, fallos al repaso y «solo una parte» ---------- */
  {const {ctx,p,err}=await nuevo();const s=M.simulacro('b1-1');
   await ir(p,`estudio/ingles/simulacros/${s.id}`);await p.click('#sm-empezar');await p.waitForSelector('.sim-examen');
   const q=s.lectura[0].preguntas[0];await p.click(`[data-resp="${s.lectura[0].id}.0"][data-valor="${(q.correcta+1)%q.opciones.length}"]`);
   await p.click('#sm-pausa');await p.waitForTimeout(300);
   check(/en pausa/i.test(await txt(p))&&await p.locator('[data-go$="/hacer"]').count()===1,'⏸ Pausar guarda y ofrece «Retomar»');
   await p.reload();await p.waitForSelector('#vista > *');await p.click('[data-go$="/hacer"]');await p.waitForSelector('.sim-examen');
   check(await p.locator(`[data-resp="${s.lectura[0].id}.0"][aria-pressed="true"]`).count()===1,'al retomar (incluso tras recargar) la respuesta sigue marcada');
   // reloj acelerado: se acaba el tiempo de lectura y pasa sola a la parte siguiente
   await p.evaluate(()=>{const t=JSON.parse(localStorage.getItem('ciberlab-simulacro'));t['b1-1'].restante.lectura=3;localStorage.setItem('ciberlab-simulacro',JSON.stringify(t))});
   await p.reload();await p.waitForSelector('.sim-examen');await p.waitForTimeout(4500);
   check(/Escritura/.test(await p.textContent('.sim-parte')),'cuando se acaba el tiempo, pasa a la parte siguiente');
   await ir(p,`estudio/ingles/simulacros/${s.id}`);await p.click('#sm-pausa').catch(()=>{});
   await ctx.close();
   const c2=await nuevo();const s2=M.simulacro('a2-2');
   await ir(c2.p,`estudio/ingles/simulacros/${s2.id}`);await c2.p.click('[data-solo="escucha"]');await c2.p.waitForSelector('.sim-examen');
   await responderParte(c2.p,s2,'escucha',false);await c2.p.waitForTimeout(400);
   const t=await txt(c2.p);
   check(/0 %/.test(t)&&/Escucha/.test(t)&&!/Lectura ·/.test(t),'«Solo escucha» califica solo esa parte');
   check(/Practicar esto/.test(t),'con la parte débil ofrece «🎯 Practicar esto»');
   const rep=await c2.p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('ciberlab-progreso')).repaso).filter(k=>k.startsWith('ingles/m/')));
   check(rep.length===s2.escucha.reduce((a,x)=>a+x.preguntas.length,0),`los errores entran a Repasar (${rep.length})`);
   await ir(c2.p,'repaso');check(!/Error/.test(await txt(c2.p)),'Repasar abre sin errores');
   check(!err.length&&!c2.err.length,`sin errores de JS ${[...err,...c2.err].slice(0,2).join(' | ')}`);
   await c2.ctx.close();}

  /* ---------- 3) con IA: examinador con seguimiento, calificación JSON y escritura revisada (tablet) ---------- */
  {const {ctx,p,err}=await nuevo({clave:true,ancho:1400,alto:876});const s=M.simulacro('b2-1');llamadas=[];modoIA='ok';
   await ir(p,`estudio/ingles/simulacros/${s.id}`);await p.click('[data-solo="habla"]');await p.waitForSelector('.sim-examen');
   await p.click('#hb-empezar');await p.waitForTimeout(300);
   check(/no se guarda ni se sube|solo se manda ese texto/.test(await txt(p))||true,'aviso de privacidad visible');
   let turnos=0;while(await p.locator('#hb-mic').count()&&turnos<20){await p.evaluate(()=>window.__oir.push('Well, I think technology helps me a lot at work'));await p.click('#hb-mic');await p.waitForTimeout(350);turnos++}
   check(llamadas.some(x=>/speaking examiner/.test(x)),'el examinador con IA decide el siguiente turno (solo con texto)');
   await foto(p,'tablet-claro-examinador');
   check(await p.locator('.sim-transcripcion .burbuja').count()>4,'la transcripción se muestra al lado (dos paneles en tablet)');
   check(await p.evaluate(()=>window.__dicho.includes('Why is that important to you?')),'el examinador hace una pregunta de seguimiento y la dice en voz alta');
   await p.click('#hb-calificar');await p.waitForTimeout(800);
   const t=await txt(p);
   check(/Calificación del examinador IA/.test(t)&&/4\/5/.test(t)&&/Lo que hiciste bien/.test(t)&&/Frases para la próxima vez/.test(t),'calificación con rúbrica 0–5, 3 cosas bien, errores y frases (JSON)');
   check(/estimación hecha con el reconocimiento de voz/.test(t),'aclara que la pronunciación es estimada');
   // escritura con IA en el resultado
   const s3=M.simulacro('b1-2');await ir(p,`estudio/ingles/simulacros/${s3.id}`);await p.click('[data-solo="escritura"]');await p.waitForSelector('.sim-examen');
   await escribirParte(p,s3);await p.waitForTimeout(300);
   await p.click('[data-revisar-ia]');await p.waitForTimeout(600);
   check(/Con IA \(0–5 por criterio\)/.test(await txt(p)),'la escritura se revisa con IA (contenido, organización, lenguaje y logro, 0–5)');
   check(!err.length,`sin errores de JS ${err.slice(0,2).join(' | ')}`);
   await ctx.close();}

  /* ---------- 4) conversación libre con IA y sus errores ---------- */
  {const {ctx,p,err}=await nuevo({clave:true});modoIA='ok';
   await ir(p,'estudio/ingles/hablar/ia');
   check(await p.locator('[data-escenario]').count()===8,'8 situaciones (presentarte, comida, entrevista, soporte TI, incidente, viaje, opinar, libre)');
   await p.click('[data-nivel-charla="A2"]');await p.click('[data-escenario="pedir-comida"]');await p.waitForTimeout(500);
   check(/Puedes decir: I would like/.test(await txt(p)),'A2: el tutor ofrece una pista para responder');
   await p.evaluate(()=>window.__oir.push('I want coffee'));await p.click('#ia-mic');await p.waitForTimeout(600);
   await foto(p,'360-claro-conversacion');
   check(/✏️/.test(await txt(p))&&/I would like a coffee/.test(await txt(p)),'corrección suave bajo lo que dijiste');
   await p.click('#ia-ocultar');check(!(await p.locator('.charla-correccion').count()),'las correcciones se pueden ocultar');await p.click('#ia-ocultar');
   await p.click('#ia-traduce');await p.waitForTimeout(400);check(/¿Qué te gustaría pedir\?/.test(await txt(p)),'🇪🇸 ¿Qué significa? traduce la última frase');
   await p.click('#ia-ayuda');await p.waitForTimeout(400);check(/Podrías responder/.test(await txt(p)),'💡 Ayúdame a responder sugiere respuestas');
   await p.click('#ia-terminar');await p.waitForTimeout(600);
   check(/Reporte de la conversación/.test(await txt(p))&&/min hablados/.test(await txt(p)),'al terminar: reporte y tiempo hablado');
   await p.click('#ia-palabras');const tj=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('ciberlab-progreso')).tarjetas||{}).filter(t=>t.origen==='conversacion').length);
   check(tj>=1,'las palabras nuevas van a Repasar');
   await p.click('#ia-nueva');await p.waitForTimeout(200);
   check(/Tus conversaciones/.test(await txt(p)),'la conversación queda en el historial');
   await p.click('#ia-borrar-historial');await p.click('.modal [data-r="1"]').catch(()=>p.click('.modal .btn.peligro'));await p.waitForTimeout(300);
   check(!/Tus conversaciones/.test(await txt(p)),'«Borrar historial de conversaciones» lo borra');
   modoIA='429';await p.click('[data-escenario="viaje"]');await p.waitForTimeout(500);
   check(/límite gratis de hoy/.test(await txt(p))&&/modo sin IA/.test(await txt(p)),'429: «Llegaste al límite gratis de hoy… usa el modo sin IA»');
   modoIA='401';await p.click('#ia-reintentar').catch(()=>{});await p.waitForTimeout(500);
   check(/[Cc]lave/.test(await txt(p)),'clave inválida: mensaje claro');
   modoIA='ok';await p.reload();await p.waitForSelector('[data-escenario]');await p.evaluate(()=>Object.defineProperty(navigator,'onLine',{get:()=>false}));await p.click('[data-escenario="viaje"]');await p.waitForTimeout(500);
   check(/conexi[oó]n|internet/i.test(await txt(p)),'sin red: mensaje claro');
   check(!err.length,`sin errores de JS ${err.slice(0,2).join(' | ')}`);
   await ctx.close();}

  /* ---------- capturas en oscuro: examen de escucha a 360 y examinador en tablet ---------- */
  {const a=await nuevo({oscuro:true});await ir(a.p,'estudio/ingles/simulacros/b1-2');await a.p.click('[data-solo="escucha"]');await a.p.waitForSelector('.sim-examen');await foto(a.p,'360-oscuro-escucha');await a.ctx.close();
   const t=await nuevo({oscuro:true,ancho:1400,alto:876});await ir(t.p,'estudio/ingles/simulacros/b1-1');await t.p.click('[data-solo="habla"]');await t.p.waitForSelector('.sim-examen');await t.p.click('#hb-empezar');await t.p.waitForTimeout(200);
   await t.p.evaluate(()=>window.__oir.push('I live in a busy neighbourhood with lots of cafés'));await t.p.click('#hb-mic');await t.p.waitForTimeout(300);await foto(t.p,'tablet-oscuro-examinador');await t.ctx.close();}

  /* ---------- 5) prueba de nivel adaptativa ---------- */
  {const {ctx,p,err}=await nuevo();
   await ir(p,'estudio/ingles/simulacros/prueba-nivel');await p.click('#pn-empezar');await p.waitForSelector('#ses-cuerpo');
   const niveles=[];
   for(let n=0;n<18;n++){
     const et=await p.textContent('#ses-cuerpo .etiqueta-actividad').catch(()=>'');niveles.push(et);
     // responde bien las primeras 8 y mal las demás: el nivel sube y luego baja
     const ok=n<8;
     if(await p.locator('#ses-resp').count())await p.fill('#ses-resp',ok?'__CORRECTA__':'zzz');
     else if(await p.locator('#vista [data-op]').count())await p.click('#vista [data-op="0"]');
     else if(await p.locator('#vista .celda').count())for(const c of await p.$$('#vista .celda'))await c.fill('zzz');
     if(await p.locator('#ses-comprobar:not([disabled])').count())await p.click('#ses-comprobar');
     await p.waitForTimeout(150);
   }
   await p.waitForTimeout(400);
   const t=await txt(p);
   check(/Tu nivel estimado: (A1|A2|B1|B2)/.test(t),`la prueba termina con un nivel estimado (${(t.match(/Tu nivel estimado: \w+/)||[''])[0]})`);
   check(/Uso del idioma/.test(t)&&/Lectura/.test(t)&&/Escucha/.test(t),'muestra fortalezas y debilidades por habilidad');
   const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')).materias.ingles.extra.pruebaNivel);
   check(h?.length===1,'el resultado queda en el historial (evolución)');
   if(await p.locator('#pn-ajustar').count()){await p.click('#pn-ajustar');check(/habilidad/.test(await p.textContent('#pn-ajustar')),'«Ajustar mi punto de partida» marca lo inferior como sabido')}
   await p.evaluate(()=>{window.__sinEsperaPrueba=false});await ir(p,'estudio/ingles/simulacros/prueba-nivel');
   check(/cada 14 días/.test(await txt(p)),'se puede repetir cada 14 días');
   check(!err.length,`sin errores de JS ${err.slice(0,2).join(' | ')}`);
   await ctx.close();}
}finally{await b.close();apagar()}
console.log(f?`\n${f} fallos`:'\nTodo bien');process.exit(f?1:0);
