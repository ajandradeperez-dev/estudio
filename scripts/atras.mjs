/* npm run atras: el botón Atrás con el modelo "una entrada por cada navegación del usuario" (ver main.js), en teléfono
   (360 px, táctil) y en escritorio. Atrás = page.goBack() (el Atrás del navegador, como el botón del teléfono).
   - 6 niveles por toques (Aprender → Estudio → Matemáticas → Álgebra lineal → lección → práctica con hoja y procedimiento):
     Atrás cierra procedimiento, hoja, sale de la práctica y baja lección → tema → materia → Estudio → Aprender; en Aprender
     un Atrás más muestra «Toca otra vez para salir» sin salir.
   - Enlace directo a una lección + primer toque: se reconstruye la cadena de padres y Atrás baja nivel por nivel.
   - Recarga a mitad del camino: las entradas siguen y Atrás baja igual.
   - Práctica: varias preguntas seguidas no acumulan entradas; «¿Salir de la lección?» se cierra con Atrás; «Salir» vuelve a
     la lección sin dejar entradas de más.
   - popstate nunca hace push ni replace (lo verifica el diagnóstico) y Acerca de muestra el diagnóstico con 3 toques.
   Compila, levanta `vite preview` en el puerto 4798 y lo apaga al terminar. */
import {existsSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4798,BASE=`http://localhost:${PUERTO}/`;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));

let f = 0; const check = (c, m) => { console.log((c ? 'OK   ' : 'FALLO') + ' ' + m); if (!c) f++; };
const ruta = candidatos.find(x => existsSync(x)); if (!ruta) { console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).'); apagar(); process.exit(1); }
const b = await chromium.launch({executablePath: ruta});
const hash = p => decodeURIComponent(new URL(p.url()).hash.slice(1));
const dentro = p => p.url().startsWith(BASE);
const atras = async p => { await p.goBack({timeout: 2500}).catch(() => {}); await p.waitForTimeout(400); };
const estado = async p => !dentro(p) ? 'FUERA' : await p.locator('#procedimiento').count() ? 'proc' : await p.locator('.modal-fondo').count() ? 'modal'
  : await p.locator('#hoja').count() ? 'hoja' : await p.locator('.sesion').count() ? 'sesion' : hash(p) || 'Aprender';
// Responde lo que toque hasta que la hoja de feedback ofrezca «📖 Ver procedimiento» (o hasta n respuestas)
async function responder(p, {hastaProc = true, veces = 16} = {}) {
  for (let k = 0; k < veces; k++) {
    if (hastaProc && await p.locator('#hoja-proc').count()) return true;
    if (await p.locator('#hoja-seguir').count()) { if (!hastaProc && k > 0) return true; await p.click('#hoja-seguir'); await p.waitForTimeout(250); continue; }
    if (await p.locator('#ses-resp:not([readonly])').count()) await p.fill('#ses-resp', '1');
    if (await p.locator('#vista .opcion:not([disabled])').count()) await p.click('#vista .opcion:not([disabled]) >> nth=0');
    for (const c of await p.$$('#vista .celda:not([readonly])')) await c.fill('1');
    const c = p.locator('#ses-comprobar'); if (await c.count() && await c.isEnabled()) await c.click(); else if (await p.locator('#ses-continuar').count()) await p.click('#ses-continuar');
    await p.waitForTimeout(300);
  }
  return !!(await p.locator('#hoja-proc').count());
}
const toque = (p, sel) => p.click(sel);

for (const [nombre, op] of [['teléfono', {viewport: {width: 360, height: 800}, isMobile: true, hasTouch: true}], ['escritorio', {viewport: {width: 1280, height: 800}}]]) {
  console.log(`--- ${nombre}`);
  const ctx = await b.newContext(op);
  await ctx.addInitScript(() => { if (!localStorage.getItem('ciberlab-usuario')) localStorage.setItem('ciberlab-usuario', '{"bienvenida":true,"nombre":"Ana"}'); });
  const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  const largo0 = await p.evaluate(() => history.length);
  await toque(p, '#vista .tarjeta-nav >> text=Estudio'); await p.waitForTimeout(250);
  await toque(p, '#vista .tarjeta-nav >> text=Matemáticas'); await p.waitForTimeout(250);
  await toque(p, '#vista .tarjeta-nav >> text=Álgebra lineal'); await p.waitForTimeout(250);
  const tema = hash(p);
  await toque(p, '#vista [data-go*="/l/"]'); await p.waitForTimeout(250);
  const leccion = hash(p);
  check(/\/l\//.test(leccion), `entra a la lección: ${leccion}`);
  check(await p.evaluate(() => history.length) - largo0 === 5, `una entrada por cada navegación (portada + 4 pantallas): ${await p.evaluate(() => history.length) - largo0}`);
  await toque(p, '#hab-empezar, #mini-saltar'); await p.waitForTimeout(300);
  check(await responder(p), 'la hoja de feedback ofrece «Ver procedimiento»');
  await toque(p, '#hoja-proc'); await p.waitForTimeout(300);
  check(await estado(p) === 'proc', 'procedimiento abierto (nivel 6)');
  const pasos = [];
  for (let i = 1; i <= 8; i++) { await atras(p); pasos.push(await estado(p)); }
  console.log('     ' + pasos.join(' → '));
  check(pasos.slice(0, 7).join() === ['hoja', 'sesion', leccion, tema, 'estudio/matematicas', 'estudio', 'Aprender'].join(), 'procedimiento → hoja → práctica → lección → tema → materia → Estudio → Aprender');
  check(pasos[7] === 'Aprender' && /Toca otra vez para salir/.test(await p.textContent('#aviso').catch(() => '')), 'en Aprender: «Toca otra vez para salir» sin salir');
  // popstate nunca hizo push ni replace: el diagnóstico marca cada push/replace hecho dentro de popstate (enPop)
  const diag = await p.evaluate(() => JSON.parse(localStorage.getItem('ciberlab-diagnostico') || '[]'));
  const malos = diag.filter(x => ['push', 'replace'].includes(x.tipo) && x.enPop).map(x => x.tipo);
  check(!malos.length && diag.some(x => x.tipo === 'popstate'), `popstate no agrega ni reemplaza entradas (${diag.length} eventos en el diagnóstico)`);

  // práctica: varias preguntas no acumulan entradas; «¿Salir?» se cierra con Atrás; «Salir» vuelve a la lección
  await p.goto(BASE); await p.waitForTimeout(500);
  await toque(p, '#vista .tarjeta-nav >> text=Estudio'); await p.waitForTimeout(200);
  await toque(p, '#vista .tarjeta-nav >> text=Matemáticas'); await p.waitForTimeout(200);
  await toque(p, '#vista .tarjeta-nav >> text=Álgebra lineal'); await p.waitForTimeout(200);
  await toque(p, '#vista [data-go*="/l/"]'); await p.waitForTimeout(250);
  const largoLeccion = await p.evaluate(() => history.length);
  await toque(p, '#hab-empezar, #mini-saltar'); await p.waitForTimeout(300);
  for (let q = 0; q < 3; q++) await responder(p, {hastaProc: false, veces: 6});
  await p.waitForTimeout(300);
  const largoPractica = await p.evaluate(() => history.length);
  check(largoPractica - largoLeccion <= 2, `3 preguntas no acumulan entradas (+${largoPractica - largoLeccion})`);
  if (await p.locator('#hoja-seguir').count()) { await p.click('#hoja-seguir'); await p.waitForTimeout(300); }
  await toque(p, '#vista [data-salir]'); await p.waitForTimeout(300);
  if (await p.locator('.modal-fondo').count()) {
    await atras(p); check(await estado(p) === 'sesion', 'Atrás cierra «¿Salir de la lección?» y sigues en la práctica');
    await toque(p, '#vista [data-salir]'); await p.waitForTimeout(300); await toque(p, '.modal [data-r="1"]'); await p.waitForTimeout(600);
  } else await p.waitForTimeout(400);
  check(await estado(p) === leccion, `«Salir» vuelve a la lección (${await estado(p)})`);
  await atras(p); check(await estado(p) === tema, `luego Atrás va al tema, sin entradas de más (${await estado(p)})`);

  // enlace directo a la lección: el primer toque reconstruye la cadena; y recarga a mitad del camino
  for (const modo of ['enlace directo', 'recarga']) {
    const q = await ctx.newPage();
    await q.goto(BASE + '#' + leccion); await q.waitForTimeout(600);
    if (modo === 'recarga') { await q.reload(); await q.waitForTimeout(600); }
    await q.click('#vista h1'); await q.waitForTimeout(200);   // primer toque (sin navegar)
    const r = []; for (let i = 0; i < 5; i++) { await atras(q); r.push(await estado(q)); }
    check(r.join() === [tema, 'estudio/matematicas', 'estudio', 'Aprender', 'Aprender'].join(), `${modo} + primer toque: ${r.join(' → ')}`);
    await q.close();
  }
  {
    const q = await ctx.newPage(); await q.goto(BASE); await q.waitForTimeout(500);
    await q.click('#vista .tarjeta-nav >> text=Estudio'); await q.waitForTimeout(200); await q.click('#vista .tarjeta-nav >> text=Matemáticas'); await q.waitForTimeout(200);
    await q.reload(); await q.waitForTimeout(700);
    const r = []; for (let i = 0; i < 3; i++) { await atras(q); r.push(await estado(q)); }
    check(r.join() === ['estudio', 'Aprender', 'Aprender'].join(), `recarga a mitad del camino: ${r.join(' → ')}`);
    await q.close();
  }
  // ← de las migas = Atrás; Perfil → Acerca de → Atrás; diagnóstico con 3 toques en la versión
  await p.goto(BASE); await p.waitForTimeout(400);
  await toque(p, '#vista .tarjeta-nav >> text=Estudio'); await p.waitForTimeout(200); await toque(p, '#vista .tarjeta-nav >> text=Matemáticas'); await p.waitForTimeout(200);
  await toque(p, '.migas .atras'); await p.waitForTimeout(400); check(hash(p) === 'estudio', `← de las migas: #${hash(p)}`);
  await toque(p, '.nav-tab[data-go="perfil"]'); await p.waitForTimeout(250); await toque(p, '[data-go="acerca"]'); await p.waitForTimeout(250);
  for (let k = 0; k < 3; k++) await toque(p, '#acerca-version');
  const t = await p.textContent('#diag-texto').catch(() => '');
  check(/Versión de la app/.test(t) && /TWA \(APK\)/.test(t) && /popstate|push/.test(t) && await p.locator('#diag-copiar').count() === 1, 'Acerca de: diagnóstico con 3 toques y botón «Copiar»');
  await atras(p); check(hash(p) === 'perfil', `Acerca de → Atrás → Perfil (#${hash(p)})`);
  await atras(p); check(hash(p) === 'estudio', `Perfil → Atrás → la pantalla anterior (#${hash(p)})`);
  check(!err.length, 'sin errores de JS ' + err.join(' | '));
  await ctx.close();
}
await b.close(); apagar(); console.log(f ? `${f} FALLOS` : 'Botón Atrás: todo bien en teléfono y escritorio.'); process.exit(f ? 1 : 0);
