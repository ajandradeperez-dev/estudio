/* Monta los videos (PROMPT-VIDEO) con ffmpeg a partir de las escenas grabadas (grabar.mjs) y del guion (guion.mjs):
   node scripts/video/montar.mjs [--solo promo|tutorial] [--sin-voz] [--musica ruta.mp3] [--sin-musica]
   - Voz: la de Windows en español (System.Speech; «Microsoft Sabina», es-MX, si está) → un WAV por escena.
     Sin voz en español (o con --sin-voz): solo subtítulos grandes.
   - Títulos, subtítulos, marco del teléfono, «IA (demo)» y tarjetas: HTML con los colores de la app → PNG (Playwright).
   - Por escena: la pantalla grabada (con un zoom suave), su título, subtítulos por frase y la voz; luego fundidos de 0,3 s
     entre escenas, música (sintetizada aquí o la de --musica) que baja cuando hay voz, y loudnorm.
   - Salidas en videos/: estudio-plus-promo-9x16.mp4, estudio-plus-tutorial-9x16.mp4, estudio-plus-tutorial-16x9.mp4,
     miniatura.png (1280 × 720), portada-9x16.png y subtitulos-*.srt. H.264 + AAC, yuv420p, 30 fps, +faststart. */
import {existsSync,mkdirSync,writeFileSync,readFileSync,rmSync,statSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import {chromium} from 'playwright-core';
import {ESCENAS} from './guion.mjs';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','..'),V=join(raiz,'videos'),TMP=join(V,'tmp');mkdirSync(TMP,{recursive:true});
const arg=(n,def=null)=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:def};
const SOLO=arg('--solo'),MUSICA=arg('--musica'),SIN_VOZ=process.argv.includes('--sin-voz'),SIN_MUSICA=process.argv.includes('--sin-musica');
let FFMPEG=process.env.FFMPEG;
if(!FFMPEG){try{FFMPEG=createRequire(import.meta.url)('ffmpeg-static')}catch(e){FFMPEG='ffmpeg'}}
const ff=(args,{silencio=true}={})=>{const r=spawnSync(FFMPEG,['-y','-hide_banner','-loglevel',silencio?'error':'info',...args],{encoding:'utf8',maxBuffer:1e9});
  if(r.status!==0)throw new Error('ffmpeg: '+(r.stderr||r.error?.message||'').slice(-1500));return r};
const FPS=30,XF=.3;
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);

/* ---------- formatos ---------- */
// pantalla: dónde va lo grabado dentro del cuadro; sub: zona de subtítulos (no tapa la interfaz)
const FORMATOS={
  'promo-9x16':{W:1080,H:1920,serie:'promo',carpeta:'promo-9x16',pantalla:{x:262,y:400,w:556,h:1236},marco:true,tituloY:120,sub:{y:1700,h:190}},
  'tutorial-9x16':{W:1080,H:1920,serie:'tutorial',carpeta:'tutorial-9x16',pantalla:{x:180,y:36,w:720,h:1600},marco:false,sub:{y:1665,h:230}},
  'tutorial-16x9':{W:1920,H:1080,serie:'tutorial',carpeta:'tutorial-16x9',pantalla:{x:192,y:16,w:1536,h:864},marco:false,sub:{y:900,h:170}}
};

/* ---------- voz de Windows ---------- */
const durWav=f=>{const b=readFileSync(f);let i=12,rate=0,datos=0;while(i<b.length-8){const id=b.toString('ascii',i,i+4),n=b.readUInt32LE(i+4);if(id==='fmt ')rate=b.readUInt32LE(i+16);if(id==='data'){datos=n;break}i+=8+n+(n%2)}return rate?datos/rate:0};
let VOZ_USADA=null;
function voces(lista){
  if(SIN_VOZ||process.platform!=='win32')return {};
  const dir=join(TMP,'voz');mkdirSync(dir,{recursive:true});
  const pend=lista.filter(e=>e.voz).map(e=>({id:e.id,texto:e.voz.replace(/Estudio\+/g,'Estudio más'),rate:e.serie==='promo'?2:1,wav:join(dir,`${e.serie}-${e.id}.wav`)}));
  writeFileSync(join(dir,'voz.json'),JSON.stringify(pend),'utf8');
  const ps=`Add-Type -AssemblyName System.Speech
$s=New-Object System.Speech.Synthesis.SpeechSynthesizer
$v=$s.GetInstalledVoices()|Where-Object{$_.Enabled -and $_.VoiceInfo.Culture.Name -like 'es-*'}|Sort-Object{if($_.VoiceInfo.Name -like '*Sabina*'){0}elseif($_.VoiceInfo.Culture.Name -eq 'es-MX'){1}else{2}}|Select-Object -First 1
if(-not $v){Write-Output 'SIN_VOZ';exit 0}
$s.SelectVoice($v.VoiceInfo.Name);$s.Rate=1
$l=Get-Content -Raw -Encoding UTF8 '${join(dir,'voz.json').replace(/'/g,"''")}'|ConvertFrom-Json
foreach($x in $l){$s.Rate=$x.rate;$s.SetOutputToWaveFile($x.wav);$s.Speak($x.texto)}
$s.SetOutputToNull();Write-Output ('VOZ:'+$v.VoiceInfo.Name)`;
  writeFileSync(join(dir,'voz.ps1'),'\ufeff'+ps,'utf8');
  const r=spawnSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File',join(dir,'voz.ps1')],{encoding:'utf8'});
  const out=r.stdout||'';if(/SIN_VOZ/.test(out)||!/VOZ:/.test(out)){console.log('⚠️ No hay una voz de Windows en español: el video sale solo con subtítulos.');return {}}
  VOZ_USADA=out.match(/VOZ:(.*)/)[1].trim();
  return Object.fromEntries(pend.filter(x=>existsSync(x.wav)).map(x=>[x.id,{wav:x.wav,dur:durWav(x.wav)}]));
}

/* ---------- imágenes con HTML (títulos, marco, subtítulos, tarjetas) ---------- */
const CSS=`*{box-sizing:border-box;margin:0}body{font-family:"Nunito",system-ui,"Segoe UI",sans-serif;color:#fff}
.fondo{position:absolute;inset:0;background:radial-gradient(120% 80% at 20% 10%,#6b74ff 0%,#4652d0 45%,#2b2f8f 100%)}
.titulo{position:absolute;left:60px;right:60px;text-align:center;font-weight:900;line-height:1.08;text-shadow:0 4px 18px rgba(0,0,0,.35)}
.marco{position:absolute;border-radius:64px;background:#0d0f1f;box-shadow:0 30px 80px rgba(0,0,0,.45),inset 0 0 0 3px #2c3060}
.sub{position:absolute;left:40px;right:40px;display:flex;align-items:center;justify-content:center;text-align:center}
.sub span{font-weight:900;line-height:1.18;color:#fff;-webkit-text-stroke:8px #14163a;paint-order:stroke fill;text-shadow:0 4px 12px rgba(0,0,0,.4)}
.chip{position:absolute;padding:14px 26px;border-radius:999px;background:#fff;color:#4652d0;font-weight:900;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.logo{width:220px;height:220px;border-radius:52px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.centro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center;padding:80px}
.mas{color:#ffd166}`;
let nav,pag;
async function png(html,W,H,salida,{transparente=false}={}){
  if(!nav){nav=await chromium.launch({executablePath:candidatos.find(x=>existsSync(x))});pag=await nav.newPage()}
  await pag.setViewportSize({width:W,height:H});
  await pag.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap" rel="stylesheet"><style>${CSS}html,body{width:${W}px;height:${H}px;${transparente?'background:transparent':''}}</style></head><body>${html}</body></html>`,{waitUntil:'networkidle'}).catch(()=>{});
  await pag.evaluate(()=>document.fonts?.ready);await pag.screenshot({path:salida,omitBackground:transparente});
  return salida;
}
const logo=()=>`data:image/png;base64,${readFileSync(join(raiz,'public','icons','icon-512.png')).toString('base64')}`;
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const conMas=t=>esc(t).replace(/Estudio\+|Estudia \+/g,m=>m.replace('+','<span class="mas">+</span>'));

// el fondo de cada escena (degradado, título, marco del teléfono)
async function fondoEscena(F,e,salida){
  const p=F.pantalla,tit=e.titulo&&F.marco?`<div class="titulo" style="top:${F.tituloY}px;font-size:76px">${conMas(e.titulo)}</div>`:'';
  const marco=F.marco?`<div class="marco" style="left:${p.x-22}px;top:${p.y-22}px;width:${p.w+44}px;height:${p.h+44}px"></div>`:'';
  return png(`<div class="fondo"></div>${tit}${marco}`,F.W,F.H,salida);
}
// partir la voz en frases cortas para los subtítulos, repartidas según su largo
function frases(texto,max=34){
  const out=[];for(const f of texto.split(/(?<=[.!?¿,:])\s+/)){let act='';for(const w of f.split(' ')){if((act+' '+w).trim().length>max&&act){out.push(act);act=w}else act=(act+' '+w).trim()}if(act)out.push(act)}
  return out;
}
async function subtitulo(F,texto,salida){const t=F.W>F.H?56:66;return png(`<div class="sub" style="top:${F.sub.y}px;height:${F.sub.h}px"><span style="font-size:${t}px">${esc(texto)}</span></div>`,F.W,F.H,salida,{transparente:true})}
async function insignia(F,salida){return png(`<div class="chip" style="${F.marco?'left:50%;transform:translateX(-50%);top:286px':`right:${F.W>F.H?40:60}px;top:${F.W>F.H?36:60}px`};font-size:${F.W>F.H?30:36}px">✨ IA (demo)</div>`,F.W,F.H,salida,{transparente:true})}
async function tarjeta(F,e,salida){
  const grande=F.W>F.H?110:96;
  const cuerpo={
    gancho:`<img class="logo" src="${logo()}"><div style="font-size:${grande}px;font-weight:900;line-height:1.08">${conMas(e.titulo)}</div>`,
    cierre:`<img class="logo" src="${logo()}"><div style="font-size:${grande*.8}px;font-weight:900;line-height:1.15">Estudia más.<br>Estudia mejor.<br>Estudia <span class="mas">+</span></div><div style="font-size:44px;font-weight:700;opacity:.92">Gratis · ajandradeperez-dev.github.io/estudio</div>`,
    titulo:`<img class="logo" src="${logo()}"><div style="font-size:${grande}px;font-weight:900">${conMas(e.titulo)}</div><div style="font-size:48px;font-weight:700;opacity:.9">Guía rápida</div>`,
    'cierre-tutorial':`<img class="logo" src="${logo()}"><div style="font-size:${grande*.8}px;font-weight:900">Invita a tus amigos</div><div style="font-size:52px;font-weight:700">Comparte el QR desde Perfil → Acerca de</div><div class="chip" style="position:static;font-size:46px">Próximamente: Electrónica ⚡</div>`,
    capitulo:`<div style="font-size:${grande*.9}px;font-weight:900">${esc(e.capitulo||'')}</div>`
  }[e.tarjeta]||'';
  return png(`<div class="fondo"></div><div class="centro">${cuerpo}</div>`,F.W,F.H,salida);
}

/* ---------- una escena → clip mp4 (video + audio) ---------- */
async function clip(F,e,voz,dirF){
  const base=join(dirF,e.id),fondo=await (e.tarjeta?tarjeta(F,e,base+'-fondo.png'):fondoEscena(F,e,base+'-fondo.png'));
  const vz=voz[e.id],durVoz=vz?vz.dur:Math.max(1.8,(e.voz||'').split(' ').length*.36);
  let pant=null,durPant=0;
  if(!e.tarjeta){
    const dc=join(V,'escenas',F.carpeta,e.id),j=join(dc,'cuadros.json');
    if(!existsSync(j))throw new Error(`Falta grabar la escena ${F.carpeta}/${e.id} (node scripts/video/grabar.mjs)`);
    const c=JSON.parse(readFileSync(j,'utf8')),cs=c.cuadros;
    const lista=cs.map((x,i)=>`file '${join(dc,x.f).replace(/\\/g,'/')}'\nduration ${Math.max(1/FPS,((cs[i+1]?.t??c.fin)-x.t)).toFixed(4)}`).join('\n')+`\nfile '${join(dc,cs.at(-1).f).replace(/\\/g,'/')}'`;
    writeFileSync(base+'-lista.txt',lista);durPant=c.fin-cs[0].t;pant=base+'-lista.txt';
  }
  // e.dur (promo): la escena dura su objetivo y la grabación se acelera para caber (hasta 2,5×), nunca menos que la voz
  let vel=1;if(e.dur&&durPant>e.dur){const meta=Math.max(e.dur,durVoz+.7);vel=Math.min(2.5,durPant/meta);durPant/=vel}
  const D=+(Math.max(e.tarjeta?2.4:0,durPant,durVoz+.9)+.2).toFixed(2);
  // subtítulos por frase, repartidos en lo que dura la voz (empieza a los 0,3 s)
  const fs=e.voz?frases(e.voz):[],tot=fs.reduce((a,b)=>a+b.length,0)||1;let t=.3;
  // en las tarjetas el texto ya está en grande: el subtítulo solo va al .srt
  const subs=[];for(const [i,f] of fs.entries()){const d=durVoz*f.length/tot;subs.push({texto:f,a:+t.toFixed(2),b:+(t+d).toFixed(2),png:e.tarjeta?null:await subtitulo(F,f,`${base}-sub${i}.png`)});t+=d}
  const entradas=['-loop','1','-framerate',String(FPS),'-t',String(D),'-i',fondo];
  let fc='',ult='[0:v]';
  if(pant){
    entradas.push('-f','concat','-safe','0','-i',pant);
    const p=F.pantalla,z=1.035;
    // zoom suave (Ken Burns ligero) dentro de la pantalla: escala de 1 a 1,035 y se recorta al tamaño
    fc+=`[1:v]setpts=PTS/${vel.toFixed(3)},fps=${FPS},scale=${p.w}:${p.h}:force_original_aspect_ratio=decrease,pad=${p.w}:${p.h}:(ow-iw)/2:(oh-ih)/2:color=0x0d0f1f,tpad=stop_mode=clone:stop_duration=${D},trim=duration=${D},`
      +`scale=w='trunc(${p.w}*(1+${(z-1).toFixed(3)}*t/${D})/2)*2':h='trunc(${p.h}*(1+${(z-1).toFixed(3)}*t/${D})/2)*2':eval=frame,crop=${p.w}:${p.h},setsar=1`
      +'[pant0];';
    // esquinas redondeadas de la pantalla dentro del marco: una máscara (más rápido que calcular cada píxel)
    if(F.marco){const m=join(dirF,'mascara.png');if(!existsSync(m))await png(`<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;inset:0;border-radius:46px;background:#fff"></div>`,p.w,p.h,m);
      entradas.push('-loop','1','-t',String(D),'-i',m);fc+=`[2:v]format=gray,scale=${p.w}:${p.h}[masc];[pant0]format=rgba[pr];[pr][masc]alphamerge[pant];`}
    else fc+='[pant0]null[pant];';
    fc+=`${ult}[pant]overlay=${p.x}:${p.y}[v0];`;ult='[v0]';
  }else{
    // tarjeta: un zoom lento y aparece con un fundido
    fc+=`${ult}scale=w='trunc(${F.W}*(1+.04*t/${D})/2)*2':h='trunc(${F.H}*(1+.04*t/${D})/2)*2':eval=frame,crop=${F.W}:${F.H}[v0];`;ult='[v0]';
  }
  let k=entradas.filter(x=>x==='-i').length;
  if(e.ia){entradas.push('-loop','1','-t',String(D),'-i',await insignia(F,base+'-ia.png'));fc+=`${ult}[${k}:v]overlay=0:0:enable='gte(t,.6)'[via];`;ult='[via]';k++}
  for(const [i,s] of subs.entries()){if(!s.png)continue;entradas.push('-loop','1','-t',String(D),'-i',s.png);fc+=`${ult}[${k}:v]overlay=0:0:enable='between(t,${s.a},${s.b})'[vs${i}];`;ult=`[vs${i}]`;k++}
  fc+=`${ult}format=yuv420p,fps=${FPS}[v]`;
  // audio: la voz desde 0,3 s y silencio hasta el final
  if(vz){entradas.push('-i',vz.wav);fc+=`;[${k}:a]aresample=48000,adelay=300|300,apad,atrim=duration=${D},aformat=sample_rates=48000:channel_layouts=stereo[a]`}
  else{entradas.push('-f','lavfi','-t',String(D),'-i','anullsrc=r=48000:cl=stereo');fc+=`;[${k}:a]anull[a]`}
  const salida=base+'.mp4';
  ff([...entradas,'-filter_complex',fc,'-map','[v]','-map','[a]','-t',String(D),'-c:v','libx264','-preset','veryfast','-crf','18','-c:a','pcm_s16le','-f','matroska',salida.replace('.mp4','.mkv')]);
  return {archivo:salida.replace('.mp4','.mkv'),D,subs,voz:!!vz};
}

/* ---------- música sintetizada: acordes suaves (sin derechos) ---------- */
function musica(D,salida){
  if(MUSICA){ff(['-stream_loop','-1','-i',MUSICA,'-t',String(D),'-ar','48000','-ac','2',salida]);return salida}
  // I–V–vi–IV en do mayor, cada acorde 2 s, con un pulso suave
  const acordes=[[261.63,329.63,392],[196,246.94,392],[220,261.63,329.63],[174.61,220,349.23]];
  const tonos=acordes.map((a,i)=>a.map(f=>`sine=f=${f}:r=48000:d=2`).join(';')).join(';');
  const fc=acordes.map((a,i)=>`${a.map((_,j)=>`[${i*3+j}:a]`).join('')}amix=inputs=3:normalize=0,volume=0.18,afade=type=in:duration=0.25,afade=type=out:start_time=1.7:duration=0.3[c${i}]`).join(';')+`;${acordes.map((_,i)=>`[c${i}]`).join('')}concat=n=4:v=0:a=1,aloop=loop=-1:size=${48000*8},atrim=duration=${D},apulsator=hz=2:amount=.35,lowpass=f=1800,aecho=0.8:0.5:120:0.25,pan=stereo|c0=c0|c1=c0[m]`;
  const ins=acordes.flatMap(a=>a.flatMap(f=>['-f','lavfi','-i',`sine=f=${f}:r=48000:d=2`]));
  ff([...ins,'-filter_complex',fc,'-map','[m]','-t',String(D),salida]);
  return salida;
}
const srtT=s=>{const ms=Math.round(s*1000),h=Math.floor(ms/36e5),m=Math.floor(ms/6e4)%60,se=Math.floor(ms/1e3)%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(se).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`};

/* ---------- un video completo ---------- */
async function video(nombre,voz){
  const F=FORMATOS[nombre],dirF=join(TMP,nombre);rmSync(dirF,{recursive:true,force:true});mkdirSync(dirF,{recursive:true});
  // el tutorial lleva una tarjeta con el título de cada capítulo antes de su escena
  const lista=ESCENAS[F.serie].flatMap(e=>e.capitulo?[{id:e.id+'-cap',tarjeta:'capitulo',capitulo:e.capitulo,voz:null},e]:[e]);
  const clips=[];for(const e of lista){process.stdout.write(`  ${nombre} · ${e.id}…\r`);clips.push(await clip(F,e,voz,dirF))}
  // fundidos de 0,3 s entre escenas
  const ins=clips.flatMap(c=>['-i',c.archivo]);let fv='',fa='',off=0,v='[0:v]',a='[0:a]';const inicio=[0];
  for(let i=1;i<clips.length;i++){off+=clips[i-1].D-XF;inicio.push(off);
    fv+=`${v}[${i}:v]xfade=transition=fade:duration=${XF}:offset=${off.toFixed(3)}[x${i}];`;v=`[x${i}]`;
    fa+=`${a}[${i}:a]acrossfade=d=${XF}:c1=tri:c2=tri[y${i}];`;a=`[y${i}]`}
  const total=off+clips.at(-1).D;
  const mus=SIN_MUSICA?null:musica(total,join(dirF,'musica.wav'));
  let fc=fv+fa+`${a}asplit=2[voz][vozsc];`;
  if(mus){ins.push('-i',mus);fc+=`[${clips.length}:a]volume=0.55[mus0];[mus0][vozsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[mus];[voz][mus]amix=inputs=2:normalize=0[mez];`}
  else fc+=`[vozsc]anullsink;[voz]anull[mez];`;
  fc+=`[mez]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`;
  const salida=join(V,`estudio-plus-${nombre}.mp4`);
  ff([...ins,'-filter_complex',fc,'-map',v==='[0:v]'?'0:v':v,'-map','[a]','-c:v','libx264','-preset','slow','-crf',F.serie==='promo'?'26':'23','-profile:v','high','-pix_fmt','yuv420p','-r',String(FPS),
    '-c:a','aac','-b:a','128k','-movflags','+faststart',salida]);
  // subtítulos .srt con los tiempos del video final
  let n=0;const srt=clips.flatMap((c,i)=>c.subs.map(s=>`${++n}\n${srtT(inicio[i]+s.a)} --> ${srtT(inicio[i]+s.b)}\n${s.texto}\n`)).join('\n');
  writeFileSync(join(V,`subtitulos-${nombre}.srt`),srt,'utf8');
  console.log(`✓ ${salida.replace(raiz+'\\','').replace(raiz+'/','')} · ${total.toFixed(1)} s · ${(statSync(salida).size/1048576).toFixed(1)} MB`);
  return {salida,total};
}

/* ---------- revisión de calidad: un cuadro cada 3 s ---------- */
function cuadros(salida,nombre){
  const d=join(V,'revision',nombre);rmSync(d,{recursive:true,force:true});mkdirSync(d,{recursive:true});
  ff(['-i',salida,'-vf','fps=1/3,scale=-2:640','-q:v','4',join(d,'c%03d.jpg')]);
  // picos de audio (que no sature)
  const r=spawnSync(FFMPEG,['-hide_banner','-i',salida,'-af','volumedetect','-f','null','-'],{encoding:'utf8'});
  const pico=(r.stderr.match(/max_volume: ([-\d.]+) dB/)||[])[1];
  console.log(`  revisión: cuadros en videos/revision/${nombre}/ · pico de audio ${pico} dB`);
}

/* ---------- principal ---------- */
const nombres=Object.keys(FORMATOS).filter(n=>!SOLO||FORMATOS[n].serie===SOLO);
const todas=[...new Set(nombres.map(n=>FORMATOS[n].serie))].flatMap(s=>ESCENAS[s].map(e=>({...e,serie:s})));
const vocesPorSerie={};
for(const s of new Set(todas.map(e=>e.serie))){const v=voces(todas.filter(e=>e.serie===s));vocesPorSerie[s]=v}
console.log(VOZ_USADA?`Voz: ${VOZ_USADA}`:'Sin voz: solo subtítulos');
try{
  for(const n of nombres){const r=await video(n,vocesPorSerie[FORMATOS[n].serie]);cuadros(r.salida,n)}
  // miniatura (1280 × 720) y portada (9:16): un cuadro de la app con el título
  if(nombres.includes('promo-9x16')||nombres.includes('tutorial-16x9')){
    const cuadro=join(TMP,'cuadro-portada.jpg'),dc=join(V,'escenas','promo-9x16','03-pistas');
    const fuente=existsSync(join(dc,'cuadros.json'))?join(dc,JSON.parse(readFileSync(join(dc,'cuadros.json'),'utf8')).cuadros.at(-1).f):null;
    const img=fuente?`data:image/jpeg;base64,${readFileSync(fuente).toString('base64')}`:'';
    await png(`<div class="fondo"></div><div style="position:absolute;left:70px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center;gap:28px"><img class="logo" src="${logo()}" style="width:150px;height:150px;border-radius:36px"><div style="font-size:84px;font-weight:900;line-height:1.02">Estudio<span class="mas">+</span></div><div style="font-size:44px;font-weight:800;line-height:1.15">Estudia más.<br>Estudia mejor.</div><div class="chip" style="position:static;align-self:flex-start;font-size:30px">Gratis</div></div>${img?`<img src="${img}" style="position:absolute;right:90px;top:40px;height:640px;border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,.45)">`:''}`,1280,720,join(V,'miniatura.png'));
    await png(`<div class="fondo"></div><div class="centro" style="justify-content:flex-start;padding-top:140px"><img class="logo" src="${logo()}"><div style="font-size:120px;font-weight:900">Estudio<span class="mas">+</span></div><div style="font-size:60px;font-weight:800;line-height:1.15">Estudia más.<br>Estudia mejor.</div>${img?`<img src="${img}" style="height:960px;border-radius:44px;box-shadow:0 30px 80px rgba(0,0,0,.45)">`:''}</div>`,1080,1920,join(V,'portada-9x16.png'));
    console.log('✓ videos/miniatura.png y videos/portada-9x16.png');
  }
}finally{await nav?.close()}
