/* Íconos y pantalla de inicio de la app Android nativa (android-app/, Capacitor) a partir de public/icons/icono.svg.
   Uso: node scripts/app/iconos.mjs  (playwright-core + Chrome o Edge, como scripts/iconos.mjs)
   - Ícono adaptable (Android 8+): fondo = el degradado de la app (drawable XML), primer plano = el cuaderno y el «+» dentro
     de la zona segura (66 de 108 dp), monocromo para los íconos temáticos de Android 13+.
   - Íconos clásicos (ic_launcher.png y ic_launcher_round.png) para los launchers que no usan el adaptable.
   - Pantalla de inicio: Android 12+ usa el ícono sobre el color de la app (styles.xml); splash.png para las versiones de antes. */
import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','..'),res=join(raiz,'android-app','app','src','main','res');
const svg=readFileSync(join(raiz,'public','icons','icono.svg'),'utf8').replace(/<!--[\s\S]*?-->\s*/g,'');
const dibujo=svg.match(/<g id="dibujo">[\s\S]*?<\/g>/)[0];
const conFondo=svg,redondo=svg.replace(' rx="112"',' rx="256"');
// primer plano: el dibujo reducido al 64 % y centrado (cabe en el círculo seguro de 66/108)
const frente=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(.64) translate(-256 -256)">${dibujo}</g></svg>`;
const mono=frente.replace(/fill="#[0-9a-fA-F]{6}"/g,'fill="#ffffff"').replace(/stroke="#[0-9a-fA-F]{6}"/g,'stroke="#ffffff"');
const DENS={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
const navegador=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const b=await chromium.launch({executablePath:navegador});
async function png(fuente,w,h,ruta,fondo='transparent'){
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.setContent(`<style>html,body{margin:0;background:${fondo};display:grid;place-items:center;width:${w}px;height:${h}px}svg{display:block;width:${Math.min(w,h)}px;height:${Math.min(w,h)}px}</style>${fuente}`);
  mkdirSync(dirname(ruta),{recursive:true});await p.screenshot({path:ruta,omitBackground:fondo==='transparent'});await p.close();
}
for(const [d,k] of Object.entries(DENS)){
  const dir=join(res,`mipmap-${d}`);
  await png(conFondo,48*k,48*k,join(dir,'ic_launcher.png'));
  await png(redondo,48*k,48*k,join(dir,'ic_launcher_round.png'));
  await png(frente,108*k,108*k,join(dir,'ic_launcher_foreground.png'));
  await png(mono,108*k,108*k,join(dir,'ic_launcher_monochrome.png'));
}
// pantalla de inicio de Android 7–11: el ícono sobre el degradado (las de Android 12+ las pinta el sistema)
const fondoSplash='linear-gradient(135deg,#6470f3,#3540b0)';
for(const d of readdirSync(res).filter(x=>/^drawable-(port|land)-/.test(x)))rmSync(join(res,d),{recursive:true,force:true});
await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:288px;height:288px">${dibujo}</svg>`,1080,1920,join(res,'drawable','splash.png'),fondoSplash);
writeFileSync(join(res,'mipmap-anydpi-v26','ic_launcher.xml'),`<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`);
writeFileSync(join(res,'mipmap-anydpi-v26','ic_launcher_round.xml'),readFileSync(join(res,'mipmap-anydpi-v26','ic_launcher.xml'),'utf8'));
writeFileSync(join(res,'drawable','ic_launcher_background.xml'),`<?xml version="1.0" encoding="utf-8"?>
<!-- El degradado del ícono de Estudio+ (public/icons/icono.svg) -->
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <gradient android:angle="315" android:startColor="#6470f3" android:endColor="#3540b0"/>
</shape>
`);
rmSync(join(res,'drawable-v24'),{recursive:true,force:true});
await b.close();console.log('Íconos y pantalla de inicio de android-app/ listos.');
