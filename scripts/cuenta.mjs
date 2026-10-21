/* npm run cuenta: ☁️ Cuenta y sincronización en el navegador (360 px) contra un Supabase SIMULADO (sin red real).
   Compila una copia de prueba en dist-cuenta/ con VITE_SUPABASE_URL apuntando a https://simulado.supabase.test y
   Playwright responde esas peticiones con scripts/sync-pruebas.mjs (las mismas reglas: cada quien ve solo lo suyo).
   - Sin sesión: la pantalla explica la cuenta; «Crear cuenta» (mínimo 8 caracteres, mostrar u ocultar) pide confirmar el
     correo, «Entrar» antes de confirmar lo dice y con la contraseña mal también; volver del enlace de confirmación
     (?cuenta=1#access_token=…) abre ☁️ Cuenta, combina y muestra el resumen del primer inicio.
   - Otro teléfono entra con correo y contraseña. «Olvidé mi contraseña» y su enlace piden la nueva; el código de 6 dígitos
     por correo también entra.
   - Dos «teléfonos» con la misma cuenta: la XP se suma exacto, una nota llega al otro, el estado dice «Sincronizado».
   - Sin conexión: «Sin conexión: se enviará luego» y al volver la red se envía.
   - Dispositivos, espacio de fotos, cerrar sesión (conservar) y borrar la cuenta. La clave de IA nunca sale del teléfono.
   También revisa que, sin configurar, Perfil y ☁️ Cuenta digan «Próximamente» (dist-sin/, con VITE_SUPABASE_URL=ninguno). */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4796,BASE=`http://localhost:${PUERTO}/`,SUPA='https://simulado.supabase.test';
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build')){
  execSync('npx vite build --outDir dist-sin --emptyOutDir',{cwd:raiz,stdio:'ignore',env:{...process.env,VITE_SUPABASE_URL:'ninguno'}});
  execSync('npx vite build --outDir dist-cuenta --emptyOutDir',{cwd:raiz,stdio:'ignore',env:{...process.env,VITE_SUPABASE_URL:SUPA,VITE_SUPABASE_CLAVE:'clave-publica-de-prueba'}});
}
const servir=(dir,puerto)=>spawn(`npx vite preview --port ${puerto} --strictPort --outDir ${dir}`,{cwd:raiz,shell:true,stdio:'ignore'});
const s1=servir('dist-cuenta',PUERTO),s2=servir('dist-sin',PUERTO+1);
const apagar=()=>{for(const s of [s1,s2])try{process.platform==='win32'?execSync(`taskkill /PID ${s.pid} /T /F`,{stdio:'ignore'}):s.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,4000));
const ic=process.argv.indexOf('--capturas'),capturas=ic>0?process.argv[ic+1]:null;
const {supabaseSimulado}=await import(pathToFileURL(join(raiz,'scripts','sync-pruebas.mjs')).href);
const sim=supabaseSimulado();let enlaces=[],recuperaciones=[],cambios=[];
// Auth simulado: cuentas con contraseña que hay que confirmar por correo (como el proyecto real: mailer_autoconfirm false)
const usuarios={};const CODIGO='482913';

// HTTP de Supabase → el simulado (PostgREST, Auth y Storage, lo que usa sync/api.js)
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt=(sub,email)=>`${b64({alg:'none'})}.${b64({sub,email,exp:Math.floor(Date.now()/1000)+3600})}.firma`;
const tokDe=req=>{const a=req.headers()['authorization']||'';const p=a.split('.')[1];if(!p)return null;try{return 'tok-'+JSON.parse(Buffer.from(p,'base64url').toString()).sub}catch(e){return null}};
async function responder(route){
  const req=route.request(),u=new URL(req.url()),m=req.method(),tok=tokDe(req),cuerpo=()=>{try{return JSON.parse(req.postData()||'null')}catch(e){return null}};
  const json=(status,datos)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:datos===undefined?'':JSON.stringify(datos)});
  if(m==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
  const de=r=>r.ok?json(200,r.datos??null):json(r.error==='conflicto'?409:r.error==='red'?503:400,{message:r.error});
  if(u.pathname==='/auth/v1/otp'){enlaces.push({email:cuerpo()?.email,volver:u.searchParams.get('redirect_to')});return json(200,{})}
  const sesionDe=email=>{const sub=email.split('@')[0];return {access_token:jwt(sub,email),refresh_token:'r-'+sub,expires_in:3600,token_type:'bearer',user:{id:sub,email}}};
  if(u.pathname==='/auth/v1/signup'){const {email,password}=cuerpo();enlaces.push({email,volver:u.searchParams.get('redirect_to'),tipo:'signup'});
    if(usuarios[email])return json(200,{id:'falso',email,identities:[]});
    usuarios[email]={password,confirmado:false};return json(200,{id:email.split('@')[0],email,identities:[{id:'x'}]})}
  if(u.pathname==='/auth/v1/token'&&u.searchParams.get('grant_type')==='password'){const {email,password}=cuerpo(),x=usuarios[email];
    if(!x||x.password!==password)return json(400,{code:400,error_code:'invalid_credentials',msg:'Invalid login credentials'});
    if(!x.confirmado)return json(400,{code:400,error_code:'email_not_confirmed',msg:'Email not confirmed'});
    return json(200,sesionDe(email))}
  if(u.pathname==='/auth/v1/recover'){recuperaciones.push({email:cuerpo().email,volver:u.searchParams.get('redirect_to')});return json(200,{})}
  if(u.pathname==='/auth/v1/verify'){const {email,token}=cuerpo();
    return token===CODIGO?json(200,sesionDe(email)):json(403,{code:403,error_code:'otp_expired',msg:'Token has expired or is invalid'})}
  if(u.pathname==='/auth/v1/user'&&m==='PUT'){cambios.push({tok,password:cuerpo().password});return json(200,{id:'x'})}
  if(u.pathname==='/auth/v1/logout')return json(204);
  if(u.pathname.startsWith('/rest/v1/rpc/'))return de(await sim.api.rpc(u.pathname.slice(13),cuerpo(),tok));
  if(u.pathname.startsWith('/rest/v1/')){
    const t=u.pathname.slice(9),f=Object.fromEntries(u.searchParams),pref=req.headers()['prefer']||'';
    if(m==='GET')return de(await sim.api.leer(t,f,tok));
    if(m==='POST')return de(await (pref.includes('merge-duplicates')?sim.api.guardar:sim.api.insertar)(t,cuerpo(),tok));
    if(m==='PATCH')return de(await sim.api.actualizar(t,f,cuerpo(),tok));
    if(m==='DELETE')return de(await sim.api.borrar(t,f,tok));
  }
  const S='/storage/v1/object/';
  if(u.pathname.startsWith(S+'list/'))return de(await sim.api.listarFotos(cuerpo().prefix,tok));
  if(u.pathname.startsWith(S+'authenticated/notas-fotos/')){const r=await sim.api.bajarFoto(decodeURIComponent(u.pathname.slice((S+'authenticated/notas-fotos/').length)),tok);
    return r.ok?route.fulfill({status:200,contentType:r.datos.type,body:r.datos.bytes}):json(404,{message:'no'})}
  if(u.pathname===S+'notas-fotos'&&m==='DELETE')return de(await sim.api.borrarFotos(cuerpo().prefixes,tok));
  if(u.pathname.startsWith(S+'notas-fotos/')){const bytes=req.postDataBuffer();
    return de(await sim.api.subirFoto(decodeURIComponent(u.pathname.slice((S+'notas-fotos/').length)),{size:bytes.length,type:req.headers()['content-type'],bytes},tok))}
  return json(404,{message:'ruta simulada desconocida '+u.pathname});
}

let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b=await chromium.launch({executablePath:ruta});
const errores=[];
async function telefono(nombre,xp,{base=BASE}={}){
  const ctx=await b.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  await ctx.route(SUPA+'/**',responder);
  const hoyL=new Date(),d=`${hoyL.getFullYear()}-${String(hoyL.getMonth()+1).padStart(2,'0')}-${String(hoyL.getDate()).padStart(2,'0')}`;
  await ctx.addInitScript(([nombre,xp,d])=>{if(!localStorage.getItem('ciberlab-progreso')){
    localStorage.setItem('ciberlab-usuario',JSON.stringify({bienvenida:true,nombre}));
    localStorage.setItem('ciberlab-ia',JSON.stringify({proveedor:'gemini',claves:{gemini:'AIzaCLAVE-SECRETA-DE-PRUEBA'}}));
    localStorage.setItem('ciberlab-progreso',JSON.stringify({v:11,meta:{tipo:'ejercicios',cantidad:10},dias:{[d]:{ej:3,seg:0,xp,ok:false}},materias:{matematicas:{xp,lecciones:{},extra:{}}}}))}},[nombre,xp,d]);
  const p=await ctx.newPage();p.on('pageerror',e=>errores.push(nombre+': '+e.message));
  const peticiones=[];p.on('request',r=>{if(r.url().startsWith(SUPA))peticiones.push((r.postData()||'')+' '+r.url())});
  return {ctx,p,peticiones};
}
const texto=async(p,sel)=>(await p.textContent(sel).catch(()=>''))||'';
const esperar=async(p,sel,re,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(re.test(await texto(p,sel)))return true;await p.waitForTimeout(250)}return false};
const xpDe=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('ciberlab-progreso')).materias.matematicas.xp);
const foto=async(p,n)=>{if(capturas)await p.screenshot({path:join(capturas,n+'.png'),fullPage:true})};
try{
  // sin configurar (compilación normal): «Próximamente»
  const N=await telefono('Nora',10);
  await N.p.goto(`http://localhost:${PUERTO+1}/#perfil`);await N.p.waitForTimeout(900);
  check(/Próximamente: sincronizar entre dispositivos/.test(await texto(N.p,'#vista')),'sin Supabase, Perfil dice «Próximamente: sincronizar entre dispositivos»');
  await N.p.goto(`http://localhost:${PUERTO+1}/#cuenta`);await N.p.waitForTimeout(600);
  check(/Próximamente/.test(await texto(N.p,'#vista'))&&await N.p.locator('[data-go="perfil"]').count()>0,'☁️ Cuenta sin Supabase lleva a Mis datos (el respaldo sigue funcionando)');
  await foto(N.p,'cuenta-0-proximamente');
  // teléfono A: crea su cuenta con correo y contraseña
  const A=await telefono('Ana',100);
  await A.p.goto(BASE+'#cuenta');await A.p.waitForTimeout(900);
  check(/opcional/.test(await texto(A.p,'#vista'))&&/APK y el navegador comparten/.test(await texto(A.p,'#vista')),'sin sesión explica la cuenta (opcional, el APK y el navegador comparten el progreso)');
  check(await A.p.locator('#cta-entrar').count()===1&&/Olvidé mi contraseña/.test(await texto(A.p,'#vista'))&&/código por correo/.test(await texto(A.p,'#vista')),'«Entrar» con correo y contraseña es lo principal, con «Olvidé mi contraseña» y el código como alternativa');
  await foto(A.p,'cuenta-1-entrar');
  await A.p.click('[data-cta-modo="crear"]');
  await A.p.fill('#cta-email','ana@ejemplo.com');await A.p.fill('#cta-clave','corta');
  check(await A.p.getAttribute('#cta-clave','type')==='password','la contraseña empieza oculta');
  await A.p.click('[data-ver-clave="cta-clave"]');
  check(await A.p.getAttribute('#cta-clave','type')==='text'&&await A.p.inputValue('#cta-clave')==='corta','👁️ muestra la contraseña sin perder lo escrito');
  await A.p.click('[data-ver-clave="cta-clave"]');
  check(await A.p.getAttribute('#cta-clave','type')==='password','🙈 la vuelve a ocultar');
  await A.p.click('#cta-crear');
  check(await esperar(A.p,'#cta-aviso',/al menos 8 caracteres/)&&!enlaces.length,'con menos de 8 caracteres no crea la cuenta y lo dice');
  await A.p.fill('#cta-clave','secreta-de-ana');await A.p.click('#cta-crear');
  check(await esperar(A.p,'#cta-aviso',/para confirmar tu cuenta/)&&enlaces[0]?.tipo==='signup'&&/\?cuenta=1$/.test(enlaces[0].volver),'«Crear cuenta» pide confirmar el correo, con la vuelta a ?cuenta=1');
  await foto(A.p,'cuenta-2-confirmar');
  await A.p.fill('#cta-clave','secreta-de-ana');await A.p.click('#cta-entrar');
  check(await esperar(A.p,'#cta-aviso',/Falta confirmar tu correo/),'«Entrar» antes de confirmar dice que falta confirmar el correo');
  // abre el enlace de confirmación
  usuarios['ana@ejemplo.com'].confirmado=true;
  const vuelta=(p,email,sub,tipo='signup')=>p.goto(BASE+`?cuenta=1#access_token=${jwt(sub,email)}&refresh_token=r-${sub}&expires_in=3600&token_type=bearer&type=${tipo}`);
  await vuelta(A.p,'ana@ejemplo.com','ana');
  check(await esperar(A.p,'#vista',/Entraste como ana@ejemplo.com/),'al volver del enlace de confirmación se abre ☁️ Cuenta con la sesión');
  check(await esperar(A.p,'#cta-estado',/Sincronizado/),'el estado dice «✓ Sincronizado…»');
  check(!/access_token/.test(A.p.url())&&/#cuenta$/.test(A.p.url()),'el token no queda en la dirección');
  await A.p.keyboard.press('Escape').catch(()=>{});
  // teléfono B entra con la misma cuenta y contraseña: combina y ve el resumen
  const B=await telefono('Beto',40);
  await B.p.goto(BASE+'#cuenta');await B.p.waitForTimeout(900);
  await B.p.fill('#cta-email','ana@ejemplo.com');await B.p.fill('#cta-clave','otra-cosa-123');await B.p.click('#cta-entrar');
  check(await esperar(B.p,'#cta-aviso',/no coinciden/),'con la contraseña mal dice que no coinciden (sin decir cuál)');
  await B.p.fill('#cta-clave','secreta-de-ana');await B.p.keyboard.press('Enter');
  check(await esperar(B.p,'.modal',/Tus datos quedaron combinados/)&&/Ahora: 140 XP/.test(await texto(B.p,'.modal')),'Enter en la contraseña entra; el primer inicio en otro teléfono muestra el resumen combinado (100 + 40 = 140 XP)');
  await foto(B.p,'cuenta-3-combinado');
  await B.p.click('.modal [data-r]');
  check(await xpDe(B.p)===140,'la XP del segundo teléfono queda combinada sin duplicar');
  // A sincroniza: también 140; una nota escrita en A llega a B
  await A.p.goto(BASE+'#notas');await A.p.waitForTimeout(800);
  await A.p.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open('ciberlab-notas',2);q.onsuccess=()=>r(q.result)});
    await new Promise(r=>{const t=db.transaction('notas','readwrite');t.objectStore('notas').put({id:'n-a',titulo:'Nota desde A',cuerpo:'hola',etiquetas:[],creada:Date.now(),editada:Date.now()});t.oncomplete=r});
    dispatchEvent(new CustomEvent('datos-cambiaron'))});
  await A.p.goto(BASE+'#cuenta');await A.p.click('#cta-sinc');await A.p.waitForTimeout(1500);
  check(await xpDe(A.p)===140,`el primer teléfono también queda en 140 XP (${await xpDe(A.p)})`);
  await B.p.goto(BASE+'#cuenta');await B.p.click('#cta-sinc');await B.p.waitForTimeout(1500);
  await B.p.goto(BASE+'#notas');
  check(await esperar(B.p,'#vista',/Nota desde A/),'una nota escrita en un teléfono llega al otro');
  // sin conexión
  await B.p.goto(BASE+'#cuenta');await B.p.waitForTimeout(500);
  await B.ctx.setOffline(true);await B.p.click('#cta-sinc');
  check(await esperar(B.p,'#cta-estado',/Sin conexión: se enviará luego/),'sin conexión dice «Sin conexión: se enviará luego»');
  await foto(B.p,'cuenta-4-sin-conexion');
  await B.p.evaluate(()=>{const p=JSON.parse(localStorage.getItem('ciberlab-progreso'));p.materias.matematicas.xp+=5;localStorage.setItem('ciberlab-progreso',JSON.stringify(p))});
  await B.ctx.setOffline(false);
  check(await esperar(B.p,'#cta-estado',/Sincronizado/,20000),'al volver la conexión se sincroniza solo');
  await A.p.goto(BASE+'#cuenta');await A.p.click('#cta-sinc');await A.p.waitForTimeout(1500);
  check(await xpDe(A.p)===145,`lo hecho sin conexión llega al otro teléfono (${await xpDe(A.p)} XP; se esperaba 145)`);
  // dispositivos y espacio
  await A.p.goto(BASE+'#perfil');await A.p.waitForTimeout(500);await A.p.goto(BASE+'#cuenta');
  check(await esperar(A.p,'#vista',/Tus dispositivos[\s\S]*este[\s\S]*Última vez/)&&(await A.p.locator('.lista-simple li').count())===2,'la lista de dispositivos muestra los dos');
  check(await esperar(A.p,'#vista',/Tus fotos ocupan/),'muestra el espacio de fotos');
  await foto(A.p,'cuenta-5-con-sesion');
  // la clave de IA nunca se envió
  check(![...A.peticiones,...B.peticiones].some(x=>/AIzaCLAVE|ciberlab-ia/.test(x)),'la clave de IA nunca se envía a Supabase');
  // cerrar sesión conservando los datos
  await A.p.click('#cta-salir');await A.p.click('.modal button:has-text("conservar")');
  check(await esperar(A.p,'#vista',/Tu correo/)&&await xpDe(A.p)===145,'cerrar sesión (conservar) deja los datos en el teléfono');
  // olvidé mi contraseña: el enlace vuelve con type=recovery y pide la nueva
  await A.p.click('[data-cta-modo="olvide"]');await A.p.fill('#cta-email','ana@ejemplo.com');await A.p.click('#cta-recuperar');
  check(await esperar(A.p,'#cta-aviso',/contraseña nueva/)&&recuperaciones[0]?.email==='ana@ejemplo.com'&&/\?cuenta=1$/.test(recuperaciones[0].volver),'«Olvidé mi contraseña» envía el enlace con la vuelta a ?cuenta=1');
  await vuelta(A.p,'ana@ejemplo.com','ana','recovery');
  check(await esperar(A.p,'#vista',/Elige tu nueva contraseña/),'al volver del enlace pide la contraseña nueva');
  const cerrarResumen=async p=>{if(await esperar(p,'.modal',/combinados/,4000))await p.click('.modal [data-r]')};
  await cerrarResumen(A.p);
  await foto(A.p,'cuenta-6-nueva-clave');
  await A.p.fill('#cta-nueva','1234567');await A.p.click('#cta-guardar-clave');await A.p.waitForTimeout(300);
  check(!cambios.length,'la nueva también necesita 8 caracteres');
  await A.p.fill('#cta-nueva','nueva-de-ana-1');await A.p.click('#cta-guardar-clave');
  check(await esperar(A.p,'body',/Contraseña guardada/)&&cambios[0]?.password==='nueva-de-ana-1'&&cambios[0]?.tok==='tok-ana','«Guardar contraseña» la cambia con la sesión de esa cuenta');
  check(!/Elige tu nueva contraseña/.test(await texto(A.p,'#vista')),'después ya no la vuelve a pedir');
  // alternativa: código de 6 dígitos por correo
  await A.p.waitForTimeout(500);await cerrarResumen(A.p);await A.p.click('#cta-salir');await A.p.click('.modal button:has-text("conservar")');await esperar(A.p,'#vista',/Tu correo/);
  await A.p.click('[data-cta-modo="codigo"]');await A.p.fill('#cta-email','ana@ejemplo.com');await A.p.click('#cta-enviar-codigo');
  check(await esperar(A.p,'#vista',/Código que llegó a ana@ejemplo.com/)&&enlaces.at(-1)?.email==='ana@ejemplo.com','«Entrar con un código» envía el correo y pide el código');
  await foto(A.p,'cuenta-7-codigo');
  await A.p.fill('#cta-codigo','111111');await A.p.click('#cta-verificar');
  check(await esperar(A.p,'#cta-aviso',/no es válido o ya venció/),'un código equivocado lo dice');
  await A.p.fill('#cta-codigo',CODIGO);await A.p.click('#cta-verificar');
  check(await esperar(A.p,'#vista',/Entraste como ana@ejemplo.com/)&&await esperar(A.p,'#cta-estado',/Sincronizado/),'con el código correcto entra y sincroniza');
  // borrar la cuenta
  await B.p.goto(BASE+'#cuenta');await B.p.waitForTimeout(800);await B.p.click('#cta-borrar');await B.p.click('.modal [data-r="1"]');
  check(await esperar(B.p,'#vista',/Tu correo/)&&!sim.tablas.progreso.some(x=>x.user_id==='ana'),'«Borrar mi cuenta» borra los datos de la nube y cierra la sesión');
  check(!errores.length,`sin errores en la página${errores.length?': '+errores.join(' | '):''}`);
}catch(e){console.log('FALLO',e.message);f++}
finally{await b.close();apagar()}
console.log(f?`${f} fallos`:'Todo bien');process.exit(f?1:0);
