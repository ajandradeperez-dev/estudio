/* npm run atras: el botón Atrás nivel por nivel, en teléfono (360 px, táctil) y en escritorio.
   - 6 niveles (Aprender → Estudio → Matemáticas → Álgebra lineal → lección → procedimiento abierto) y 7 Atrás: recorre cada nivel
     en orden inverso y termina en Aprender sin salir; un Atrás más en Aprender no sale (teléfono: «Toca otra vez para salir»).
   - Lo mismo entrando por un enlace directo a la lección y después de recargar; el ← de las migas; y las otras ramas
     (Hablar, Acerca de, ✨ IA, Propuestas, Mis materias, Notas, una sección de Ciberseguridad, una pestaña).
   Atrás del sistema = history.back(). Compila, levanta `vite preview` en el puerto 4798 y lo apaga al terminar. */
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
const ruta=candidatos.find(x=>existsSync(x));if(!ruta){console.log('No encontré Chrome ni Edge (pon la ruta en NAVEGADOR).');apagar();process.exit(1)}
const b = await chromium.launch({executablePath: ruta});
const hash = p => decodeURIComponent(new URL(p.url()).hash.slice(1));
const dentro = p => p.url().startsWith(BASE);
const atras = async p => { await p.evaluate(() => history.back()); await p.waitForTimeout(450); };
for (const [nombre, op] of [['teléfono', {viewport: {width: 360, height: 800}, isMobile: true, hasTouch: true}], ['escritorio', {viewport: {width: 1280, height: 800}}]]) {
  console.log(`--- ${nombre}`);
  const ctx = await b.newContext(op);
  await ctx.addInitScript(() => { if (!localStorage.getItem('ciberlab-usuario')) localStorage.setItem('ciberlab-usuario', '{"bienvenida":true,"nombre":"Ana"}'); });
  const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(600);
  // 6 niveles: Aprender → Estudio → Matemáticas → Álgebra lineal → lección → procedimiento abierto
  await p.click('#vista .tarjeta-nav >> text=Estudio'); await p.waitForTimeout(300);
  await p.click('#vista .tarjeta-nav >> text=Matemáticas'); await p.waitForTimeout(300);
  await p.click('#vista .tarjeta-nav >> text=Álgebra lineal'); await p.waitForTimeout(300);
  const tema = hash(p);
  await p.click('#vista [data-go*="/l/"]'); await p.waitForTimeout(300);
  const leccion = hash(p);
  check(/\/l\//.test(leccion), `entra a la lección: ${leccion}`);
  await p.click('#hab-empezar'); await p.waitForTimeout(300);
  // responde lo que toque hasta que una hoja de feedback ofrezca «📖 Ver procedimiento»
  for (let k = 0; k < 16 && !(await p.locator('#hoja-proc').count()); k++) {
    if (await p.locator('#hoja-seguir').count()) { await p.click('#hoja-seguir'); await p.waitForTimeout(250); continue; }
    if (await p.locator('#ses-resp:not([readonly])').count()) await p.fill('#ses-resp', '1');
    if (await p.locator('#vista .opcion:not([disabled])').count()) await p.click('#vista .opcion:not([disabled]) >> nth=0');
    for (const c of await p.$$('#vista .celda:not([readonly])')) await c.fill('1');
    const c = p.locator('#ses-comprobar'); if (await c.count() && await c.isEnabled()) await c.click(); else if (await p.locator('#ses-continuar').count()) await p.click('#ses-continuar');
    await p.waitForTimeout(300);
  }
  if (!(await p.locator('#hoja-proc').count())) console.log('     botones: ' + (await p.$$eval('#vista button, #hoja button', l => l.map(x => x.id || x.textContent.trim().slice(0, 20)))).join(' | '));
  await p.click('#hoja-proc', {timeout: 5000}); await p.waitForTimeout(300);
  check(await p.locator('#procedimiento').count() === 1, 'procedimiento abierto (nivel 6)');
  const pasos = [];
  for (let i = 1; i <= 7; i++) { await atras(p); pasos.push(dentro(p) ? (await p.locator('#procedimiento').count() ? 'proc' : await p.locator('.modal-fondo').count() ? 'modal' : await p.locator('.sesion').count() ? 'sesion' : hash(p) || 'Aprender') : 'FUERA'); }
  console.log('     ' + pasos.join(' → '));
  check(pasos[0] === 'sesion' || pasos[0] === 'modal', '1.º Atrás cierra el procedimiento');
  const sinCapas = pasos.filter(x => !['sesion', 'modal', 'proc'].includes(x));
  check(sinCapas.join() === [leccion, tema, 'estudio/matematicas', 'estudio', 'Aprender'].join(), 'recorre lección → tema → materia → Estudio → Aprender: ' + sinCapas.join(' → '));
  check(pasos[6] === 'Aprender' && !pasos.includes('FUERA'), 'el 7.º Atrás termina en Aprender sin salir');
  // en Aprender: un Atrás más no sale (teléfono: «Toca otra vez para salir»; laptop: nada)
  await p.waitForTimeout(2300); await atras(p);
  check(dentro(p) && hash(p) === '', 'en Aprender, Atrás no sale de la app');
  if (nombre === 'teléfono') check(/Toca otra vez para salir/.test(await p.textContent('#aviso').catch(() => '')), 'teléfono: «Toca otra vez para salir»');
  else check(!(await p.locator('#aviso').count()) || !/salir/.test(await p.textContent('#aviso')), 'escritorio: no hace nada');
  await p.waitForTimeout(2300);
  // enlace directo a la lección y después de recargar
  for (const modo of ['enlace directo', 'recarga']) {
    const q = await ctx.newPage();
    await q.goto(BASE + '#' + leccion); await q.waitForTimeout(600);
    if (modo === 'recarga') { await q.reload(); await q.waitForTimeout(600); }
    const r = [];
    for (let i = 0; i < 5; i++) { await atras(q); r.push(dentro(q) ? hash(q) || 'Aprender' : 'FUERA'); }
    check(r.slice(0, 4).join() === [tema, 'estudio/matematicas', 'estudio', 'Aprender'].join() && r[4] === 'Aprender', `${modo}: ${r.join(' → ')}`);
    await q.close();
  }
  // ← de las migas: también nivel por nivel
  await p.goto(BASE + '#' + tema); await p.waitForTimeout(500);
  await p.click('.migas .atras'); await p.waitForTimeout(300); const m1 = hash(p);
  await p.click('.migas .atras'); await p.waitForTimeout(300); const m2 = hash(p);
  check(m1 === 'estudio/matematicas' && m2 === 'estudio', `← de las migas: ${m1} → ${m2}`);
  // otras ramas: Hablar, Notas, Propuestas, Acerca de, Mis materias, sección de Ciberseguridad
  for (const [desde, esperado] of [['estudio/ingles/hablar/ia', ['estudio/ingles/hablar', 'estudio/ingles', 'estudio', 'Aprender']], ['acerca', ['perfil', 'Aprender']], ['ajustes-ia', ['perfil', 'Aprender']],
    ['propuestas/nueva', ['propuestas', 'Aprender']], ['mias/nueva', ['mias', 'Aprender']], ['notas/foto', ['notas', 'Aprender']], ['cursos/ciberseguridad/fw', ['cursos/ciberseguridad', 'cursos', 'Aprender']], ['logros', ['Aprender']]]) {
    const q = await ctx.newPage(); await q.goto(BASE + '#' + desde); await q.waitForTimeout(600);
    const r = []; for (let i = 0; i < esperado.length; i++) { await atras(q); r.push(dentro(q) ? hash(q) || 'Aprender' : 'FUERA'); }
    check(r.join() === esperado.join(), `#${desde}: ${r.join(' → ')}`); await q.close();
  }
  check(!err.length, 'sin errores de JS ' + err.join(' | '));
  await ctx.close();
}
await b.close(); apagar(); console.log(f ? `${f} FALLOS` : 'Botón Atrás: todo bien en teléfono y escritorio.'); process.exit(f ? 1 : 0);
