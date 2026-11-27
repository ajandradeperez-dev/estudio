/* npm run analisis: 🧭 Mi análisis (PROMPT-MI-ANALISIS, parte 6).
   1) Sin navegador: los números de la Parte 5 (tolerancia 0.01; las fracciones, exactas); cada par (λ, v) con ‖Cv − λv‖ < 1e-9,
      vectores ortonormales y Σλ = traza(C) = 6; rango(C − λᵢI) = 5 y su kernel es ±vᵢ; Jacobi en 50 matrices simétricas al
      azar; mínimos cuadrados contra la fórmula cerrada en 100 series; el caso singular (todos los t iguales); columna
      constante; menos de 5 habilidades; v11 → v12 y la fusión de `dom` (el máximo).
   2) En el navegador: la pantalla con datos de ejemplo, «Ver el álgebra» abierto y cerrado, en el teléfono (360 px), la Tab S10
      y la laptop, claro y oscuro (capturas en capturas/analisis/ y docs/analisis/); la privacidad: visitar el análisis no
      cambia nada guardado (el progreso que se sincroniza es el mismo) y no hay peticiones de red.
   node scripts/analisis.mjs [--sin-navegador] [--sin-build] */
import {existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),imp=r=>import(pathToFileURL(join(raiz,'src',r)).href);
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const A=await imp('nucleo/analisis/algebra.js'),E=await imp('nucleo/analisis/ejemplo.js'),D=await imp('nucleo/analisis/datos.js');
const cerca=(a,b,t=0.01)=>Math.abs(a-b)<=t;

/* ---------- 1. números de la Parte 5 ---------- */
const X=E.EJEMPLO_HABILIDADES.map(h=>h.x),p=A.pca(X,E.METRICAS);
const LAM=[4.840,0.968,0.089,0.079,0.020,0.004];
check(p.valores.every((l,i)=>cerca(l,LAM[i],0.001)),`λ = ${p.valores.map(l=>l.toFixed(3)).join(', ')}`);
check(cerca(p.varianza[0]*100,80.7,0.05)&&cerca(p.varianza[1]*100,16.1,0.05),`eje 1 ${(p.varianza[0]*100).toFixed(1)} %, eje 2 ${(p.varianza[1]*100).toFixed(1)} % (juntos ${((p.varianza[0]+p.varianza[1])*100).toFixed(1)} %)`);
const V1=[0.44,0.44,0.44,0.45,-0.20,-0.43],V2=[0.21,0.25,-0.13,-0.12,0.90,-0.21],VMIN=[-0.68,0.73,-0.01,-0.07,-0.06,-0.01];
check(p.vectores[0].every((x,i)=>cerca(x,V1[i])),`v₁ = (${p.vectores[0].map(x=>x.toFixed(2)).join(', ')})`);
check(p.vectores[1].every((x,i)=>cerca(x,V2[i])),`v₂ = (${p.vectores[1].map(x=>x.toFixed(2)).join(', ')})`);
check(p.vectores[5].every((x,i)=>cerca(x,VMIN[i]))||p.vectores[5].every((x,i)=>cerca(-x,VMIN[i])),`v del λ más chico = (${p.vectores[5].map(x=>x.toFixed(2)).join(', ')})`);
const COORD={'Present perfect':[2.90,-0.70],'Productos notables':[1.41,2.50],'Integración por partes':[-3.89,-0.32],'Phrasal verbs':[-1.54,0.92]};
for(const [n,[a,b]] of Object.entries(COORD)){const i=E.EJEMPLO_HABILIDADES.findIndex(h=>h.nombre===n);check(cerca(p.coords[i][0],a)&&cerca(p.coords[i][1],b),`${n}: (${p.coords[i].map(x=>x.toFixed(2)).join(', ')})`)}
// pares propios: Cv = λv, ortonormales, Σλ = traza
const C=p.C,tr=C.reduce((s,f,i)=>s+f[i],0);
check(p.valores.every((l,i)=>{const v=p.vectores[i],Cv=A.porVector(C,v);return Math.hypot(...Cv.map((x,k)=>x-l*v[k]))<1e-9}),'‖C·v − λ·v‖ < 1e-9 para los 6 pares');
check(p.vectores.every((u,i)=>p.vectores.every((v,j)=>Math.abs(A.punto(u,v)-(i===j?1:0))<1e-9)),'los vectores propios son ortonormales');
check(Math.abs(p.valores.reduce((a,b)=>a+b,0)-6)<1e-9&&Math.abs(tr-6)<1e-9,'Σλ = traza(C) = 6');
// rango(C − λI) = 5 y su kernel es ±v
check(p.valores.every((l,i)=>{const K=C.map((f,a)=>f.map((x,b)=>x-(a===b?l:0))),g=A.gaussJordanNum(K),k=A.nucleo(K);return g.rango===5&&k.length===1&&Math.abs(Math.abs(A.punto(k[0],p.vectores[i]))-1)<1e-6}),'rango(C − λᵢI) = 5 y su kernel es ±vᵢ (los 6)');
// mínimos cuadrados del ejemplo, exacto
const S=E.EJEMPLO_SERIE,mc=A.minimosCuadrados(S.t,S.y);
const aum=mc.aumentada.map(fl=>fl.map(x=>x.d===1?x.n:NaN));
check(JSON.stringify(aum)===JSON.stringify([[14,182,61],[182,3406,1120]]),`ecuaciones normales [[14, 182 | 61], [182, 3406 | 1120]]`);
check(mc.b0txt==='151/560'&&mc.b1txt==='327/1040'&&mc.rango===2,`β₀ = ${mc.b0txt}, β₁ = ${mc.b1txt} (exactas), rango 2`);
const pr=D.pronostico(mc,{meta:14,tExamen:40,yHoy:9,tHoy:28});
check(cerca(pr.enExamen,12.85)&&pr.llevaria===13&&cerca(pr.tMeta,43.7,0.05)&&cerca(pr.necesario,0.42,0.005),`día 40 → ${pr.enExamen.toFixed(2)} (13 de 14), meta en el día ${pr.tMeta.toFixed(1)}, ritmo necesario ${pr.necesario.toFixed(2)}`);
// Jacobi en 50 simétricas al azar (semilla fija)
let semilla=12345;const az=()=>{semilla=(semilla*1103515245+12345)%2147483648;return semilla/2147483648*2-1};
let okJ=0;for(let k=0;k<50;k++){const n=2+k%6,M=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=i;j<n;j++){const v=az()*5;M[i][j]=v;M[j][i]=v}
  const r=A.jacobi(M),trM=M.reduce((s,fl,i)=>s+fl[i],0);if(r.valores.every((l,i)=>{const v=r.vectores[i];return Math.hypot(...A.porVector(M,v).map((x,q)=>x-l*v[q]))<1e-8})&&Math.abs(r.valores.reduce((a,b)=>a+b,0)-trM)<1e-9)okJ++}
check(okJ===50,`Jacobi: ${okJ}/50 matrices simétricas al azar con C·v = λv y Σλ = traza`);
// mínimos cuadrados contra la fórmula cerrada
let okL=0;for(let k=0;k<100;k++){const n=3+k%12,t=[],y=[];let d=0;for(let i=0;i<n;i++){d+=1+Math.floor(Math.abs(az())*4);t.push(d);y.push(Math.floor(Math.abs(az())*20))}
  const r=A.minimosCuadrados(t,y),St=t.reduce((a,b)=>a+b,0),Sy=y.reduce((a,b)=>a+b,0),Stt=t.reduce((a,b)=>a+b*b,0),Sty=t.reduce((a,b,i)=>a+b*y[i],0),b1=(n*Sty-St*Sy)/(n*Stt-St*St),b0=(Sy-b1*St)/n;
  if(!r.singular&&Math.abs(r.b1num-b1)<1e-9&&Math.abs(r.b0num-b0)<1e-9)okL++}
check(okL===100,`mínimos cuadrados: ${okL}/100 series coinciden con β₁ = (nΣty − ΣtΣy)/(nΣt² − (Σt)²)`);
// caso singular: un solo día
const sg=A.minimosCuadrados([5,5,5,5],[1,2,2,3]),kEsp=[20,-4].map(x=>x/Math.hypot(20,4));
check(sg.singular&&sg.rango===1&&cerca(sg.nucleo[0],kEsp[0],1e-9)&&cerca(sg.nucleo[1],kEsp[1],1e-9),`todos los t iguales → rango 1 y kernel (Σt, −n) normalizado = (${sg.nucleo.map(x=>x.toFixed(3)).join(', ')})`);
check(D.pronostico(sg,{meta:5,tExamen:10,yHoy:3,tHoy:0}).singular,'con un solo día el pronóstico se declara imposible («Con un solo día no puedo ver tu ritmo»)');
// columna constante → se quita y se avisa
const Xc=X.map(r=>[...r.slice(0,5),0]),pc=A.pca(Xc,E.METRICAS);
check(pc.quitadas.includes('fallos')&&pc.nombres.length===5&&pc.valores.length===5,'una columna constante (0 fallos en todas) se quita y se avisa');
// menos de 5 habilidades → faltan datos (la matriz real de un progreso con 4 habilidades)
const hoy='2026-11-27',hab=(n)=>({dominada:false,ult:[1,1,0,1],dias:['2026-11-20','2026-11-25'],rating:3,sesiones:2});
const pPoco={materias:{matematicas:{lecciones:{a:hab(),b:hab(),c:hab(),d:hab(),e:{ult:[1]}}}},repaso:{'matematicas/g/a/2':{fallos:3}},dias:{}};
const filas=D.matrizHabilidades(pPoco,{hoy});
check(filas.length===4&&filas.length<D.MIN_HABILIDADES&&filas[0].x[5]===3&&filas[0].x[4]===2,'menos de 5 habilidades → «faltan datos» (y la fila lleva fallos del repaso y días sin practicar)');
// v11 → v12 y la fusión de dom (el máximo)
const P=await imp('nucleo/progreso.js'),FU=await imp('nucleo/sync/fusionar.js');
const v11={v:11,meta:{tipo:'ejercicios',cantidad:20},dias:{'2026-11-20':{ej:5,seg:100,xp:50,ok:false}},materias:{},repaso:{},dominados:0,notas:{},tarjetas:{},basicos:{},refuerzos:{},estrellas:{},ultimo:null,frases:{},historial:[]};
const n12=P.normalizar(v11);check(n12.v===12&&n12.dias['2026-11-20'].ej===5,'el progreso v11 se migra a v12 sin perder nada');
const a={...P.normalizar(v11)},b={...P.normalizar(v11)};a.dias['2026-11-20'].dom=3;b.dias['2026-11-20'].dom=5;
const u=FU.fusionarProgreso(a,b,{yo:'a',el:'b',borradas:{}});check(u.dias['2026-11-20'].dom===5,'al combinar dos dispositivos, dom del día es el máximo');
check(Object.keys(u).every(k=>!/analisis|pca|pronost/i.test(k))&&!JSON.stringify(u).match(/analisis|pca|β/i),'privacidad: el progreso que se sincroniza no trae nada del análisis (solo dom por día)');

/* ---------- 2. en el navegador ---------- */
if(!process.argv.includes('--sin-navegador')){
  const {chromium}=await import('playwright-core');
  const salida=join(raiz,'capturas','analisis'),docs=join(raiz,'docs','analisis');mkdirSync(salida,{recursive:true});mkdirSync(docs,{recursive:true});
  if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
  const PUERTO=4793,BASE=`http://localhost:${PUERTO}/`,servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
  const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
  await new Promise(r=>setTimeout(r,3500));
  const nav=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
  const b=await chromium.launch({executablePath:nav});
  try{
    for(const [nombre,w,h,tel] of [['telefono-360',360,800,true],['tab-s10',1280,800,true],['laptop',1440,900,false]])for(const esquema of ['light','dark']){
      const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:tel,isMobile:tel&&w<600,colorScheme:esquema,deviceScaleFactor:2});
      await ctx.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}')}catch(e){}});
      const pg=await ctx.newPage(),err=[],red=[];pg.on('pageerror',e=>err.push(e.message));pg.on('request',r=>{if(!r.url().startsWith(BASE)&&!r.url().startsWith('data:')&&!/fonts.(googleapis|gstatic).com/.test(r.url()))red.push(r.url())});
      const suf=`${nombre}-${esquema==='light'?'claro':'oscuro'}`;
      await pg.goto(BASE+'#perfil');await pg.waitForTimeout(900);
      if(nombre==='telefono-360'&&esquema==='light')check(!!await pg.$('[data-go="perfil/analisis"]'),'Perfil tiene la tarjeta «🧭 Mi análisis»');
      const guardado=()=>pg.evaluate(()=>JSON.stringify(Object.keys(localStorage).filter(k=>k!=='ciberlab-diagnostico').sort().map(k=>[k,localStorage.getItem(k)])));   // el diagnóstico del botón Atrás es local y no se sincroniza
      const antes=await guardado();red.length=0;
      await pg.click('[data-go="perfil/analisis"]');await pg.waitForTimeout(700);
      if(nombre==='telefono-360'&&esquema==='light')check(/pocos datos|Todavía hay pocos datos/.test(await pg.textContent('#vista')),'sin datos: dice que faltan y ofrece el modo ejemplo');
      await pg.click('#an-ejemplo');await pg.waitForTimeout(700);
      const t=await pg.textContent('#vista');
      if(nombre==='telefono-360'&&esquema==='light'){
        check(/Datos de ejemplo: no es tu progreso/.test(t),'modo ejemplo con la franja «Datos de ejemplo: no es tu progreso»');
        check(/Vas a 0\.31 por día/.test(t)&&/llevarías 13 de 14/.test(t)&&/Necesitas 0\.42 por día/.test(t),'«¿Llego al examen?»: 0.31 por día, 13 de 14, necesitas 0.42');
        check(/horizontal: Dominio/.test(t)&&/vertical: Tiempo sin practicar/.test(t)&&/explican el 97 %/.test(t),'mapa: ejes «Dominio» y «Tiempo sin practicar», 97 %');
        check(/Tu acierto y tu nivel dicen casi lo mismo/.test(t),'«Lo que dicen tus datos»: acierto y nivel');
        const pts=await pg.$$('.an-punto');check(pts.length===12,`12 puntos en el mapa (${pts.length})`);
        await pg.click('.an-punto >> nth=7');await pg.waitForTimeout(400);check(/Present perfect/.test(await pg.textContent('.an-detalle'))&&/✅ Firme/.test(await pg.textContent('.an-detalle')),'tocar un punto: Present perfect · ✅ Firme con sus 6 datos');
      }
      await pg.screenshot({path:join(salida,`cerrado-${suf}.png`),fullPage:true});
      await pg.evaluate(()=>document.querySelectorAll('.an-algebra').forEach(d=>d.open=true));await pg.waitForTimeout(400);
      const al=await pg.textContent('#vista');
      if(nombre==='telefono-360'&&esquema==='light'){
        check(/β₀ = 151\/560/.test(al)&&/β₁ = 327\/1040/.test(al)&&/R₂ → R₂ − 13R₁/.test(al),'«Ver el álgebra»: pasos de Gauss-Jordan en fracciones y β₀ = 151/560, β₁ = 327/1040');
        check(/Rango 5/.test(al)&&/= v₁ ✓/.test(al),'«Ver el álgebra»: C − λ₁I con rango 5 y su kernel = v₁');
      }
      const ancho=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);check(ancho<=0,`${suf}: sin scroll de lado con el álgebra abierta`);
      await pg.screenshot({path:join(salida,`abierto-${suf}.png`),fullPage:true});
      for(const x of ['cerrado','abierto'])copyFileSync(join(salida,`${x}-${suf}.png`),join(docs,`${x}-${suf}.png`));
      const despues=await guardado();
      if(nombre==='telefono-360'&&esquema==='light'){check(antes===despues,'privacidad: ver el análisis (también el ejemplo) no guarda nada en el progreso ni en otra parte');check(!red.length,`privacidad: ninguna petición fuera de la app${red.length?' — '+red.slice(0,2).join(' '):''}`)}
      // Atrás del sistema vuelve a Perfil
      if(nombre==='telefono-360'&&esquema==='light'){await pg.goBack();await pg.waitForTimeout(600);check(/#perfil$/.test(pg.url()),'Atrás vuelve a Perfil')}
      if(err.length)check(false,`${suf}: errores en la página: ${err.slice(0,2).join(' | ')}`);
      await ctx.close();
    }
  }finally{await b.close();apagar()}
}
console.log(f?`\n${f} fallos`:'\nMi análisis: todo bien');
process.exit(f?1:0);
