/* node scripts/exportar-notas.mjs [--sin-build] (lo corre npm run cuaderno): ⤓ Descargar o compartir notas, en el navegador.
   - Una nota con texto, fórmula en línea y en bloque, lista, casillas, cita, código, foto con pie, dibujo, una matriz
     (LaTeX) y tarjetas → PDF: empieza con %PDF, tamaño Carta, el título está como TEXTO real, varias páginas, las
     imágenes van incrustadas, letra oscura sobre blanco también en modo oscuro, tipo application/pdf.
   - Una nota larga: varias páginas, sin partir fórmulas ni dibujos (cada imagen entra completa en su página).
   - Dos notas: un PDF con «Índice» y un .zip con un PDF por nota.
   - PNG (una imagen por página), .txt y .md (las fórmulas como $…$) con su contenido.
   Capturas de las páginas 1 y 2 (misma maquetación que el PDF) y de la hoja, en capturas/exportar/. */
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {spawn,execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {chromium} from 'playwright-core';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),PUERTO=4799,BASE=`http://localhost:${PUERTO}/`,salida=join(raiz,'capturas','exportar');mkdirSync(salida,{recursive:true});
const candidatos=[process.env.NAVEGADOR,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
if(!process.argv.includes('--sin-build'))execSync('npm run build',{cwd:raiz,stdio:'ignore'});
const servidor=spawn(`npx vite preview --port ${PUERTO} --strictPort`,{cwd:raiz,shell:true,stdio:'ignore'});
const apagar=()=>{try{process.platform==='win32'?execSync(`taskkill /PID ${servidor.pid} /T /F`,{stdio:'ignore'}):servidor.kill()}catch(e){}};
await new Promise(r=>setTimeout(r,3500));
let f=0;const check=(c,m)=>{console.log((c?'OK   ':'FALLO')+' '+m);if(!c)f++};

const CUERPO=`Esto es **negrita**, *cursiva* y ==resaltado==. La fórmula $x^2 + y^2 = r^2$ va en línea; la letra λ y un emoji 🧪 también.

## Gauss-Jordan
- Primer punto de la lista
- Segundo punto con $\\frac{a}{b}$
1. Paso uno
2. Paso dos
- [ ] Casilla pendiente
- [x] Casilla hecha
> Una cita para recordar.
\`\`\`
for i in range(3):
    print(i)
\`\`\`
$$\\begin{bmatrix}1 & 3 & 3 \\\\ 2 & 3 & 9 \\\\ 2 & 4 & 2\\end{bmatrix}$$
$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$
![El pizarrón de la clase](img:FOTO1)
![dibujo](img:DIBUJO1)
🃏 ¿Qué es un pivote? | El primer número distinto de cero de un renglón
🃏 Regla de Cramer | x = Dx / D`;
const LARGO=Array.from({length:40},(_,i)=>i%7===3?`$$\\sum_{k=1}^{${i+2}} k = \\frac{${i+2}(${i+3})}{2}$$`:`Párrafo ${i+1}: el método de eliminación de Gauss transforma un sistema en otro equivalente más fácil de resolver, renglón por renglón.`).join('\n')+'\n![dibujo](img:DIBUJO1)';

const b=await chromium.launch({executablePath:candidatos.find(existsSync)});
const latin=buf=>Buffer.from(buf).toString('latin1');
// lee un .zip sin comprimir (el que hace la app)
function unzip(buf){const out=[];let i=0;while(buf.readUInt32LE(i)===0x04034b50){const n=buf.readUInt16LE(i+26),e=buf.readUInt16LE(i+28),t=buf.readUInt32LE(i+18),nombre=buf.slice(i+30,i+30+n).toString('utf8');out.push({nombre,datos:buf.slice(i+30+n+e,i+30+n+e+t)});i+=30+n+e+t}return out}
try{
  for(const esquema of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:360,height:800},hasTouch:true,colorScheme:esquema,acceptDownloads:true,deviceScaleFactor:2});
    await ctx.addInitScript(()=>{try{localStorage.setItem('ciberlab-usuario','{"bienvenida":true}');localStorage.setItem('ciberlab-ajustes',JSON.stringify({tema:'auto'}))}catch(e){}});
    const p=await ctx.newPage(),err=[];p.on('pageerror',e=>err.push(e.message));
    await p.goto(BASE+'#notas');await p.waitForTimeout(1200);
    // notas e imágenes de prueba directo en IndexedDB (una foto JPEG y un dibujo PNG)
    await p.evaluate(async([cuerpo,largo])=>{
      const img=async(tipo,color)=>{const c=document.createElement('canvas');c.width=800;c.height=500;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,800,500);x.fillStyle='#fff';x.font='60px sans-serif';x.fillText(tipo,60,260);return await new Promise(r=>c.toBlob(r,tipo))};
      const d=await new Promise(r=>{const q=indexedDB.open('ciberlab-notas');q.onsuccess=()=>r(q.result)});
      const put=(al,v)=>new Promise((res,rej)=>{const t=d.transaction(al,'readwrite');t.objectStore(al).put(v);t.oncomplete=res;t.onerror=rej});
      await put('archivos',{id:'FOTO1',nota:'exp1',blob:await img('image/jpeg','#0e7490'),tipo:'image/jpeg',ancho:800,alto:500,creada:1});
      await put('archivos',{id:'DIBUJO1',nota:'exp1',blob:await img('image/png','#7c3aed'),tipo:'image/png',ancho:800,alto:500,creada:1,dibujo:{v:2,objetos:[]}});
      const n=(id,titulo,c)=>({id,titulo,cuerpo:c,materia:'matematicas',tema:'algebra-lineal',etiquetas:[],fijada:false,creada:Date.UTC(2026,10,25),editada:Date.UTC(2026,10,25,15)});
      await put('notas',n('exp1','Álgebra lineal: Gauss-Jordan',cuerpo));await put('notas',n('exp2','Apuntes largos de Gauss',largo));d.close();
    },[CUERPO,LARGO]);
    const exportar=async(fmt,{unir,desde='nota'}={})=>{
      await p.waitForSelector('.exp-hoja');await p.check(`[name="exp-fmt"][value="${fmt}"]`);if(unir)await p.check(`[name="exp-unir"][value="${unir}"]`);
      const [d]=await Promise.all([p.waitForEvent('download',{timeout:60000}),p.click('[data-exp="guardar"]')]);
      const ruta=join(salida,`tmp-${d.suggestedFilename()}`);await d.saveAs(ruta);await p.waitForTimeout(300);
      return {nombre:d.suggestedFilename(),buf:readFileSync(ruta),meta:await p.evaluate(()=>globalThis.__ultimaExportacion)}};
    const abrirNota=async id=>{await p.goto(BASE+`#notas/n/${id}`);await p.waitForTimeout(1200);await p.click('#nota-exportar');await p.waitForTimeout(300)};
    // 1) PDF de una nota con todo
    await abrirNota('exp1');
    if(esquema==='light')await p.screenshot({path:join(salida,'hoja-claro.png')});else await p.screenshot({path:join(salida,'hoja-oscuro.png')});
    const pdf=await exportar('pdf'),t=latin(pdf.buf);
    check(t.startsWith('%PDF'),`[${esquema}] PDF: empieza con %PDF (${pdf.nombre})`);
    check(/^Algebra-lineal-Gauss-Jordan-2026-11-25\.pdf$/.test(pdf.nombre),'PDF: nombre limpio con la fecha ('+pdf.nombre+')');
    check(pdf.meta?.[0]?.tipo==='application/pdf','PDF: tipo application/pdf');
    check(/\/MediaBox \[0 0 612 792\]/.test(t),'PDF: tamaño Carta (612 × 792 pt)');
    check(t.includes('(Gauss-Jordan) Tj')&&t.includes('(\xC1lgebra lineal: Gauss-Jordan) Tj'),'PDF: el título está como texto real (se puede seleccionar y buscar)');
    check(t.includes('(Pregunta:) Tj')&&t.includes('es un pivote?) Tj'),'PDF: las tarjetas al final como Pregunta / Respuesta');
    const imgs=(t.match(/\/Subtype \/Image/g)||[]).length;check(imgs>=6,`PDF: fórmulas, foto, dibujo y emoji incrustados (${imgs} imágenes)`);
    check(t.includes('0.067 0.094 0.153 rg')&&!/0 0 612 792 re f/.test(t),`[${esquema}] PDF: letra oscura sobre fondo blanco`);
    const paginas=(t.match(/\/Type \/Page /g)||[]).length;check(paginas>=1,`PDF: ${paginas} página(s) con «Página 1 de ${paginas}»`);
    check(t.includes(`(P\xE1gina 1 de ${paginas}) Tj`)&&t.includes('(Estudio+) Tj'),'PDF: número de página y «Estudio+» en el pie');
    if(esquema==='dark'){if(err.length)check(false,'errores: '+err.slice(0,2).join(' | '));await ctx.close();continue}
    // 2) PNG de la misma nota (capturas de las páginas 1 y 2)
    await p.click('#nota-exportar');const png=await exportar('png');
    let paginasPng=png.nombre.endsWith('.zip')?unzip(png.buf).map(x=>x.datos):[png.buf];
    check(paginasPng.every(x=>x[0]===0x89&&x.slice(1,4).toString()==='PNG'),`PNG: ${paginasPng.length} imagen(es), una por página`);
    paginasPng.slice(0,2).forEach((x,i)=>writeFileSync(join(salida,`nota-pagina-${i+1}.png`),x));
    // 3) TXT y MD
    await p.click('#nota-exportar');const txt=await exportar('txt'),tt=txt.buf.toString('utf8');
    check(txt.nombre.endsWith('.txt')&&txt.meta?.[0]?.tipo.startsWith('text/plain')&&/Álgebra lineal: Gauss-Jordan/.test(tt)&&/Pregunta: ¿Qué es un pivote\?/.test(tt)&&/\[Imagen: El pizarrón de la clase\]/.test(tt),'TXT: título, texto, pie de la foto y tarjetas');
    await p.click('#nota-exportar');const md=await exportar('md'),mm=md.buf.toString('utf8');
    check(md.nombre.endsWith('.md')&&md.meta?.[0]?.tipo.startsWith('text/markdown')&&/^# Álgebra lineal: Gauss-Jordan/.test(mm)&&mm.includes('$x^2 + y^2 = r^2$')&&mm.includes('$$\\int_0^1'),'MD: título y fórmulas como $…$');
    // 4) nota larga: varias páginas, nada partido
    await abrirNota('exp2');const largo=await exportar('pdf'),tl=latin(largo.buf),pl=(tl.match(/\/Type \/Page /g)||[]).length;
    check(pl>=3,`nota larga: ${pl} páginas`);
    // cada imagen dentro de su página: el «cm» de cada imagen queda entre el margen de arriba y el de abajo
    const fuera=[...tl.matchAll(/q ([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm/g)].filter(m=>+m[4]<30||+m[4]+ +m[2]>792-30).length;
    check(fuera===0,'nota larga: ninguna fórmula ni dibujo se sale o se parte entre páginas');
    await p.click('#nota-exportar');const pngL=await exportar('png');const pagsL=pngL.nombre.endsWith('.zip')?unzip(pngL.buf):[];
    if(pagsL.length>=2){writeFileSync(join(salida,'largo-pagina-1.png'),pagsL[0].datos);writeFileSync(join(salida,'largo-pagina-2.png'),pagsL[1].datos)}
    check(pagsL.length===pl,`PNG de la nota larga: una imagen por página (${pagsL.length}) en un .zip`);
    // 5) varias notas desde la lista: un PDF con índice y un .zip con un PDF por nota
    await p.goto(BASE+'#notas');await p.waitForTimeout(900);await p.click('#sel-empezar');await p.waitForTimeout(200);await p.click('#sel-todas');await p.waitForTimeout(200);
    await p.screenshot({path:join(salida,'seleccion.png')});
    await p.click('#sel-exportar');const uno=await exportar('pdf',{unir:'uno'}),tu=latin(uno.buf);
    check(tu.includes('(\xCDndice) Tj')&&tu.includes('(Apuntes largos de Gauss) Tj'),'varias notas: un solo PDF con índice');
    await p.click('#sel-exportar');const z=await exportar('pdf',{unir:'zip'}),arch=unzip(z.buf);
    check(z.nombre.endsWith('.zip')&&arch.length===2&&arch.every(a=>a.nombre.endsWith('.pdf')&&a.datos.slice(0,4).toString()==='%PDF'),`varias notas: .zip con ${arch.length} PDF`);
    // la opción se recuerda
    await p.click('#sel-exportar');await p.waitForSelector('.exp-hoja');check(await p.isChecked('[name="exp-unir"][value="zip"]')&&await p.isChecked('[name="exp-fmt"][value="pdf"]'),'recuerda el formato y las opciones');
    await p.click('[data-exp="cancelar"]');
    // el respaldo ya no se confunde con «descargar mis notas»
    check(/Respaldo completo \(solo se abre en Estudio\+\)/.test(await p.textContent('#vista')),'el respaldo .estudio explica que es solo para Estudio+');
    if(err.length)check(false,'errores en la página: '+err.slice(0,3).join(' | '));
    await ctx.close();
  }
}finally{await b.close();apagar()}
console.log(f?`\n${f} fallos`:`\nExportar notas: todo bien · capturas en ${salida}`);
process.exit(f?1:0);
