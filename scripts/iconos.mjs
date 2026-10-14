/* Genera los íconos de la app (PWA y APK) a partir de public/icons/icono.svg.
   Uso: node scripts/iconos.mjs   (necesita playwright-core y Chrome o Edge instalados; ruta en NAVEGADOR si no la encuentra)
   - icon-<tam>.png        con esquinas redondeadas (purpose any)
   - icon-maskable-<tam>.png  a sangre: Android lo recorta en círculo, gota, etc. (el dibujo cabe en el círculo seguro)
   - icon-monocromo-512.png   solo la silueta en blanco sobre transparente (íconos temáticos de Android 13+)
   - apple-touch-icon.png  180 px a sangre (iOS redondea solo)  ·  ../favicon.svg  copia del SVG */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const {chromium}=await import('playwright-core').catch(()=>{console.error('Falta playwright-core: npm i -D playwright-core');process.exit(1)});
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),dir=join(raiz,'public','icons');
const svg=readFileSync(join(dir,'icono.svg'),'utf8');
const sinComentarios=svg.replace(/<!--[\s\S]*?-->\s*/g,'');
const maskable=sinComentarios.replace(' rx="112"','');
const monocromo=sinComentarios.replace(/<rect id="fondo-rect"[^>]*\/>/,'').replace(/fill="#[0-9a-fA-F]{6}"/g,'fill="#ffffff"').replace(/stroke="#[0-9a-fA-F]{6}"/g,'stroke="none"');
writeFileSync(join(raiz,'public','favicon.svg'),sinComentarios.replace(/\n\s*/g,''));

const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const browser=await chromium.launch({executablePath:candidatos.find(existsSync)});
const salida=[
  ...[48,72,96,128,144,152,192,256,384,512].map(t=>[`icon-${t}.png`,t,sinComentarios]),
  ['icon-maskable-192.png',192,maskable],['icon-maskable-512.png',512,maskable],
  ['icon-monocromo-512.png',512,monocromo],['apple-touch-icon.png',180,maskable]];
for(const [archivo,tam,fuente] of salida){
  const page=await browser.newPage({viewport:{width:tam,height:tam}});
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${tam}px;height:${tam}px}</style>${fuente}`);
  await page.screenshot({path:join(dir,archivo),omitBackground:true});
  await page.close();console.log('generado',archivo);
}
await browser.close();
