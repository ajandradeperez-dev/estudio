/* node scripts/libros.mjs: arma los libros de 📚 Lectura en public/libros/<libro>/ (indice.json + un archivo por capítulo,
   que la app carga bajo demanda; el service worker los guarda al abrirlos). Solo obras de dominio público o con licencia
   abierta que permite redistribuirlas, con su licencia y atribución en el índice:
     aesop     The Aesop for Children (1919, il. Milo Winter) · Project Gutenberg #19994 · dominio público (EE. UU.)
     alice     Alice's Adventures in Wonderland (Lewis Carroll) · Project Gutenberg #11 · dominio público (EE. UU.)
     sherlock  The Adventures of Sherlock Holmes (Arthur Conan Doyle) · Project Gutenberg #1661 · dominio público (EE. UU.)
     python    Plotting and Programming in Python (The Carpentries) · CC BY 4.0 (reemplaza a «Introduction to Python
               Programming» de OpenStax, que es CC BY-NC-SA y prohíbe su uso en IA generativa)
     estadistica  Online Statistics Education (David M. Lane, Rice University) · dominio público (reemplaza a
               «Introductory Statistics» de OpenStax por la misma razón)
     en español (scripts/libros-es.mjs): samaniego, becquer, lazarillo, sorjuana, novelas y quijote, de Project Gutenberg
   Cada libro lleva etiquetas para los filtros: idioma, niveles (A1–C1 · Fácil/Media/Avanzada · Introductorio/Universitario),
   generos y, en los libros de texto, relacionada (la materia).
   De los textos de Gutenberg se quitan el encabezado y el pie de licencia (su marca registrada) y se deja solo la obra.
   Los HTML se convierten a bloques seguros: {t:'h'|'p'|'li'|'code', x: texto o HTML con solo b, i, code, sub, sup, img}.
   --cache <dir> reutiliza descargas. Volver a correrlo regenera todo (no edites los JSON a mano). */
import {mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as ES from './libros-es.mjs';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),SALIDA=join(raiz,'public','libros');
const ic=process.argv.indexOf('--cache'),CACHE=ic>0?process.argv[ic+1]:null;
async function bajar(url,{latin1=false}={}){
  const k=CACHE&&join(CACHE,url.replace(/[^\w.-]+/g,'_'));
  if(k&&existsSync(k))return readFileSync(k,'utf8');
  const r=await fetch(url,{headers:{'user-agent':'EstudioPlus-libros/1.0 (app educativa sin fines de lucro)'}});
  if(!r.ok)throw new Error(`${r.status} ${url}`);
  const t=latin1?new TextDecoder('latin1').decode(await r.arrayBuffer()):await r.text();
  if(k){mkdirSync(CACHE,{recursive:true});writeFileSync(k,t)}
  return t;
}
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const palabrasDe=bloques=>bloques.reduce((s,b)=>s+String(b.x).replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length,0);
// Título en «Title Case» de inglés: mayúscula inicial en cada palabra salvo las cortas (and, the, of…), nunca tras apóstrofo
const MENORES=new Set(['a','an','and','the','of','in','to','with','at','for','on','by','or','his','her','its']);
const titulo=s=>s.toLowerCase().split(/(\s+|-)/).map((w,i)=>/^\s+$|^-$/.test(w)||(i>0&&MENORES.has(w))?w:w.replace(/^([“"(]?)(\p{L})/u,(m,a,b)=>a+b.toUpperCase())).join('');

/* ---------- Project Gutenberg ---------- */
function cuerpoGutenberg(t){
  t=t.replace(/\r/g,'');
  const a=t.indexOf('\n',t.search(/\*\*\* START OF TH(E|IS) PROJECT GUTENBERG EBOOK/))+1,b=t.search(/\*\*\* END OF TH(E|IS) PROJECT GUTENBERG EBOOK/);
  return t.slice(a,b);
}
// Párrafos de un fragmento de texto plano: líneas en blanco separan; _cursiva_ → <i>
const parrafos=txt=>txt.split(/\n\s*\n/).map(p=>p.replace(/\s*\n\s*/g,' ').trim()).filter(p=>p&&!/^\[Illustration/i.test(p)&&!/^\*+(\s+\*+)*$/.test(p))
  .map(p=>({t:'p',x:escH(p).replace(/_([^_]+)_/g,'<i>$1</i>')}));

function alice(t){
  const c=cuerpoGutenberg(t),partes=c.split(/\nCHAPTER [IVXL]+\.\n/).slice(1);
  return partes.map(p=>{const [tit,...resto]=p.trim().split('\n');return {titulo:tit.trim(),bloques:parrafos(resto.join('\n').replace(/^\s*THE END\s*$/m,''))}});
}
function sherlock(t){
  const c=cuerpoGutenberg(t),re=/\n([IVX]+)\. ([A-Z][A-Z’'\- ]+)\n/g,marcas=[...c.matchAll(re)];
  return marcas.map((m,i)=>({titulo:titulo(m[2].trim()),bloques:parrafos(c.slice(m.index+m[0].length,marcas[i+1]?.index??c.length).replace(/\n\s*THE END\s*$/,'')).filter(b=>!/^[IVX]+\.$/.test(b.x))}))
    .filter(x=>x.bloques.length>20);
}
function aesop(t){
  const c=cuerpoGutenberg(t),ini=c.indexOf('THE ÆSOP FOR CHILDREN',c.indexOf('A LIST OF THE FABLES')),cuerpo=c.slice(ini).replace(/^THE ÆSOP FOR CHILDREN\s*/,'');
  // Cada fábula empieza con su título en mayúsculas en una línea sola
  const re=/\n\n([A-Z][A-Z ,’'\-]+)\n\n/g,marcas=[...('\n\n'+cuerpo).matchAll(re)],fabulas=[];
  const texto='\n\n'+cuerpo;
  marcas.forEach((m,i)=>{const b=parrafos(texto.slice(m.index+m[0].length,marcas[i+1]?.index??texto.length));if(b.length)fabulas.push({titulo:titulo(m[1].trim()),bloques:b})});
  const caps=[];for(let i=0;i<fabulas.length;i+=10){const g=fabulas.slice(i,i+10);
    caps.push({titulo:`${g[0].titulo} … ${g.at(-1).titulo}`,fabulas:g.map(f=>f.titulo),bloques:g.flatMap(f=>[{t:'h',x:escH(f.titulo)},...f.bloques])})}
  return caps;
}

/* ---------- HTML → bloques seguros ---------- */
const ENT={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',mdash:'—',ndash:'–',hellip:'…',times:'×',minus:'−',plusmn:'±',le:'≤',ge:'≥',ne:'≠',mu:'μ',sigma:'σ',Sigma:'Σ',alpha:'α',beta:'β',chi:'χ',radic:'√',deg:'°',middot:'·',frac12:'½'};
const deEnt=s=>s.replace(/&(#x?[0-9a-f]+|\w+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1]==='x'||e[1]==='X'?parseInt(e.slice(2),16):+e.slice(1)):ENT[e]??m);
// Deja solo b, i, code, sub, sup e img (de la fuente indicada); todo lo demás se quita y el texto se escapa
function inline(html,base,origenImg){
  const partes=[];let ultimo=0;
  const re=/<\s*(\/?)\s*(b|strong|i|em|code|sub|sup|img)\b([^>]*)>/gi;let m;
  const texto=s=>escH(deEnt(s.replace(/<[^>]*>/g,'')));
  while((m=re.exec(html))){partes.push(texto(html.slice(ultimo,m.index)));ultimo=re.lastIndex;
    const cierre=m[1],tag={strong:'b',em:'i'}[m[2].toLowerCase()]||m[2].toLowerCase();
    if(tag==='img'){if(!origenImg)continue;const src=/src\s*=\s*["']([^"']+)/i.exec(m[3])?.[1],alt=/alt\s*=\s*["']([^"']*)/i.exec(m[3])?.[1]||'';
      if(src){const u=new URL(src,base);if(u.origin===origenImg)partes.push(`<img src="${escH(u.href)}" alt="${escH(deEnt(alt))}" loading="lazy">`)}}
    else partes.push(`<${cierre}${tag}>`)}
  partes.push(texto(html.slice(ultimo)));
  // cierra etiquetas que quedaron abiertas
  let s=partes.join('').replace(/\s+/g,' ').trim();
  for(const t of ['b','i','code','sub','sup']){const a=(s.match(new RegExp(`<${t}>`,'g'))||[]).length,c=(s.match(new RegExp(`</${t}>`,'g'))||[]).length;if(a>c)s+=`</${t}>`.repeat(a-c);if(c>a)s=s.replace(new RegExp(`</${t}>`,'g'),'');}
  return s;
}
function bloquesHtml(html,base,origenImg){
  html=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|button|form|input|select|noscript)\b[\s\S]*?<\/\1>/gi,'').replace(/<(input|button)\b[^>]*>/gi,'');
  const codigos=[];html=html.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi,(m,c)=>{codigos.push(deEnt(c.replace(/<[^>]*>/g,'')).replace(/\s+$/,''));return `\n\u0001code${codigos.length-1}\u0001\n`});
  // los saltos de línea del código fuente no son párrafos: primero todo el espacio se vuelve uno
  html=html.replace(/\s+/g,' ');
  html=html.replace(/<h[1-4]\b[^>]*>/gi,'\n\u0001h\u0001').replace(/<\/h[1-4]>/gi,'\n').replace(/<li\b[^>]*>/gi,'\n\u0001li\u0001')
    .replace(/<(p|div|tr|section|ul|ol|table|blockquote|dd|dt)\b[^>]*>/gi,'\n').replace(/<\/(p|div|tr|section|li|ul|ol|table|blockquote|dd|dt)>/gi,'\n').replace(/<br\s*\/?>/gi,' ').replace(/<td\b[^>]*>/gi,' ');
  const out=[];let tipo='p';
  for(let lin of html.split('\n')){
    const m=/^\s*\u0001(h|li|code\d+)\u0001\s*(.*)$/.exec(lin);
    if(m&&m[1].startsWith('code')){out.push({t:'code',x:codigos[+m[1].slice(4)]});continue}
    if(m){tipo=m[1];lin=m[2]}
    const x=inline(lin,base,origenImg).replace(/<(b|i|code|sub|sup)><\/\1>/g,'').trim();
    // etiquetas de los bloques de código de The Carpentries (PYTHON, OUTPUT, ERROR)
    if(tipo==='h'&&/^(PYTHON|OUTPUT|ERROR|BASH|SH)$/.test(x)){tipo='p';continue}
    if(x&&x.replace(/<[^>]+>/g,'').trim()||/<img/.test(x))out.push({t:tipo,x});
    tipo='p';
  }
  return out;
}

/* ---------- Online Statistics Education (David M. Lane) ---------- */
const LANE='https://onlinestatbook.com/2/';
const LANE_CAPS=[['introduction/introduction.html','estadistica'],['graphing_distributions/graphing_distributions.html','estadistica'],['summarizing_distributions/summarizing_distributions.html','estadistica'],
  ['describing_bivariate_data/bivariate.html','estadistica'],['probability/probability.html','probabilidad'],['normal_distribution/normal_distribution.html','probabilidad'],
  ['sampling_distributions/sampling_distributions.html','inferencia'],['estimation/estimation.html','inferencia'],['logic_of_hypothesis_testing/logic_hypothesis.html','inferencia'],
  ['tests_of_means/testing_means.html','inferencia'],['regression/regression.html','inferencia'],['chi_square/Chi_Square.html','inferencia']];
const editable=(h,n)=>{const m=new RegExp(`#BeginEditable "${n}" -->([\\s\\S]*?)<!-- #EndEditable`).exec(h);return m?m[1]:''};
async function estadistica(){
  const caps=[];
  for(const [ruta,tema] of LANE_CAPS){
    const url=LANE+ruta,h=await bajar(url,{latin1:true}),tit=deEnt(/id\s*=\s*"chapter_name"\s+value="([^"]+)"/i.exec(h)?.[1]||/<title>([\s\S]*?)<\/title>/i.exec(h)[1]).replace(/\s+Contents$/,'').trim()||ruta.split('/')[0].replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase());
    const secciones=[...editable(h,'content').matchAll(/<a\s+href="([^"#]+\.html)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({href:m[1],t:deEnt(m[2].replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim()}))
      .filter(s=>!/simulation|demo|exercise|literacy|applet|calculator|video|contents/i.test(s.t)&&!/http/.test(s.href));
    const bloques=[];
    for(const s of secciones){const u=new URL(s.href,url).href;let hs;try{hs=await bajar(u,{latin1:true})}catch(e){continue}
      const b=bloquesHtml(editable(hs,'content'),u,'https://onlinestatbook.com').filter(x=>!/^Question \d+ out of|Check Answer|Previous Question|Next Question/.test(x.x));
      if(b.length)bloques.push({t:'h',x:escH(s.t)},...b,{t:'fuente',x:u})}
    caps.push({titulo:tit,tema,bloques});
    console.log(`  estadística · ${tit}: ${secciones.length} secciones`);
  }
  return caps;
}

/* ---------- Plotting and Programming in Python (The Carpentries) ---------- */
const CARP='https://swcarpentry.github.io/python-novice-gapminder/';
const CARP_CAPS=[['01-run-quit','primeros-pasos'],['02-variables','variables'],['03-types-conversion','variables'],['04-built-in','operadores'],['06-libraries','archivos'],
  ['11-lists','listas'],['12-for-loops','bucles'],['13-conditionals','condicionales'],['14-looping-data-sets','bucles'],['16-writing-functions','funciones'],['17-scope','funciones'],['18-style','proyectos']];
async function python(){
  const caps=[];
  for(const [ep,tema] of CARP_CAPS){
    const url=`${CARP}${ep}.html`,h=await bajar(url);
    const main=/<main[^>]*>([\s\S]*?)<\/main>/i.exec(h)?.[1]||'';
    const tit=deEnt(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(main)?.[1]||ep).replace(/<[^>]+>/g,'').trim();
    const b=bloquesHtml(main.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i,'').replace(/<p>Last updated on[\s\S]*?<\/p>/i,''),url,null).filter(x=>!/^(Edit this page|Expand All Solutions|Show me the solution|Previous|Next|Keypoints)$/i.test(x.x.replace(/<[^>]+>/g,'').trim()));
    caps.push({titulo:tit,tema,bloques:b});console.log(`  python · ${tit}: ${b.length} bloques`);
  }
  return caps;
}

/* ---------- escribir ---------- */
const LIBROS=[
  {id:'aesop',titulo:'The Aesop for Children',autor:'Esopo (versión de 1919, ilustraciones de Milo Winter)',idioma:'en',nivel:'A1–A2',niveles:['A1','A2'],generos:['Fábula','Clásico'],icono:'🦊',
   licencia:'Dominio público en EE. UU.',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #19994).',fuente:'https://www.gutenberg.org/ebooks/19994',
   descripcion:'Fábulas cortas en inglés sencillo, cada una con su moraleja.',armar:async()=>aesop(await bajar('https://www.gutenberg.org/ebooks/19994.txt.utf-8'))},
  {id:'alice',titulo:'Alice’s Adventures in Wonderland',autor:'Lewis Carroll',idioma:'en',nivel:'B1',niveles:['B1'],generos:['Novela','Aventura','Clásico'],icono:'🐇',
   licencia:'Dominio público en EE. UU.',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #11).',fuente:'https://www.gutenberg.org/ebooks/11',
   descripcion:'Alicia cae por la madriguera del Conejo Blanco: 12 capítulos de inglés intermedio.',armar:async()=>alice(await bajar('https://www.gutenberg.org/ebooks/11.txt.utf-8'))},
  {id:'sherlock',titulo:'The Adventures of Sherlock Holmes',autor:'Arthur Conan Doyle',idioma:'en',nivel:'B2',niveles:['B2'],generos:['Misterio','Cuento','Clásico'],icono:'🔍',
   licencia:'Dominio público en EE. UU.',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #1661).',fuente:'https://www.gutenberg.org/ebooks/1661',
   descripcion:'Doce casos del detective más famoso: inglés de nivel avanzado.',armar:async()=>sherlock(await bajar('https://www.gutenberg.org/ebooks/1661.txt.utf-8'))},
  {id:'python',titulo:'Plotting and Programming in Python',autor:'The Carpentries (Software Carpentry)',idioma:'en',nivel:'Introductorio',niveles:['Introductorio'],generos:['Libro de texto'],relacionada:'Python',icono:'🐍',tecnico:true,materia:'python',area:'cursos',
   licencia:'CC BY 4.0',atribucion:'Basado en «Plotting and Programming in Python» de The Carpentries, publicado bajo licencia Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/). Se convirtió a texto para leerlo en la app (sin cambios de contenido). The Carpentries no avala esta app.',fuente:CARP,
   descripcion:'Lectura de apoyo del curso de Python (en inglés): variables, tipos, listas, bucles, condicionales y funciones.',armar:python},
  {id:'estadistica',titulo:'Online Statistics Education',autor:'David M. Lane (Rice University) y colaboradores',idioma:'en',nivel:'Universitario',niveles:['Universitario'],generos:['Libro de texto'],relacionada:'Estadística',icono:'📊',tecnico:true,materia:'ciencia-datos',area:'estudio',
   licencia:'Dominio público',atribucion:'Online Statistics Education: A Multimedia Course of Study (http://onlinestatbook.com/), proyecto dirigido por David M. Lane, Rice University. Obra de dominio público. Las simulaciones y ejercicios interactivos están en el sitio original.',fuente:'https://onlinestatbook.com/2/index.html',
   descripcion:'Lectura de apoyo de Ciencia de datos (en inglés): estadística descriptiva, probabilidad, normal, muestreo, estimación, pruebas, regresión y chi cuadrada.',armar:estadistica},
  // ---------- En español: autores muertos antes de 1900 (o anónimos antiguos); solo la obra, sin notas ni introducciones modernas ----------
  {id:'samaniego',titulo:'Fábulas',autor:'Félix María Samaniego (1745–1801)',idioma:'es',nivel:'Fácil',niveles:['Fácil'],generos:['Fábula','Poesía','Clásico'],icono:'🦉',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #55206). Se incluyen solo las fábulas de Samaniego, sin la introducción ni las notas del editor de esa edición.',fuente:'https://www.gutenberg.org/ebooks/55206',
   descripcion:'Fábulas en verso, cortas y con moraleja: el mejor inicio.',armar:async()=>ES.samaniego(await bajar('https://www.gutenberg.org/ebooks/55206.txt.utf-8'))},
  {id:'becquer',titulo:'Rimas y leyendas',autor:'Gustavo Adolfo Bécquer (1836–1870)',idioma:'es',nivel:'Media',niveles:['Media'],generos:['Poesía','Leyenda','Clásico'],icono:'🌙',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #53552, «Obras escogidas»). Se incluyen seis leyendas y las Rimas de Bécquer, sin la introducción de esa edición.',fuente:'https://www.gutenberg.org/ebooks/53552',
   descripcion:'Seis leyendas de misterio y las Rimas del poeta romántico.',armar:async()=>ES.becquer(await bajar('https://www.gutenberg.org/ebooks/53552.txt.utf-8'))},
  {id:'lazarillo',titulo:'Lazarillo de Tormes',autor:'Anónimo (1554)',idioma:'es',nivel:'Media',niveles:['Media'],generos:['Novela','Clásico'],icono:'🥖',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #320).',fuente:'https://www.gutenberg.org/ebooks/320',
   descripcion:'La novela picaresca de un niño que sirve a varios amos: corta y con mucho humor.',armar:async()=>ES.lazarillo(await bajar('https://www.gutenberg.org/ebooks/320.txt.utf-8'))},
  {id:'sorjuana',titulo:'Poemas selectos',autor:'Sor Juana Inés de la Cruz (1651–1695)',idioma:'es',nivel:'Avanzada',niveles:['Avanzada'],generos:['Poesía','Clásico'],icono:'🪶',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #74087, edición de Juan León Mera, Quito, 1873). Se incluyen solo los poemas, sin la biografía ni el juicio crítico.',fuente:'https://www.gutenberg.org/ebooks/74087',
   descripcion:'Romances, redondillas («Hombres necios que acusáis…»), sonetos y más de la gran poeta mexicana.',armar:async()=>ES.sorjuana(await bajar('https://www.gutenberg.org/ebooks/74087.txt.utf-8'))},
  {id:'novelas',titulo:'Novelas ejemplares (selección)',autor:'Miguel de Cervantes (1547–1616)',idioma:'es',nivel:'Avanzada',niveles:['Avanzada'],generos:['Cuento','Clásico'],icono:'📜',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #61202). Selección: Rinconete y Cortadillo, El licenciado Vidriera y La fuerza de la sangre.',fuente:'https://www.gutenberg.org/ebooks/61202',
   descripcion:'Tres novelas cortas de Cervantes: pícaros en Sevilla, un loco de vidrio y una historia de amor.',armar:async()=>ES.novelas(await bajar('https://www.gutenberg.org/ebooks/61202.txt.utf-8'))},
  {id:'quijote',titulo:'Don Quijote de la Mancha (primera parte)',autor:'Miguel de Cervantes (1547–1616)',idioma:'es',nivel:'Avanzada',niveles:['Avanzada'],generos:['Novela','Aventura','Clásico'],icono:'🐴',
   licencia:'Dominio público',atribucion:'Texto de dominio público, tomado de Project Gutenberg (libro #2000).',fuente:'https://www.gutenberg.org/ebooks/2000',
   descripcion:'Los 52 capítulos de la primera parte, de los molinos de viento al regreso a casa.',armar:async()=>ES.quijote(await bajar('https://www.gutenberg.org/ebooks/2000.txt.utf-8'))}
];
const solo=process.argv.find(a=>a.startsWith('--solo='))?.split('=')[1];
const catalogo=[];
for(const l of LIBROS){
  if(solo&&l.id!==solo)continue;
  console.log(`📚 ${l.titulo}`);
  const caps=await l.armar(),dir=join(SALIDA,l.id);
  if(existsSync(dir))rmSync(dir,{recursive:true});mkdirSync(dir,{recursive:true});
  // En español, los capítulos sin preguntas escritas a mano (src/materias/lectura/preguntas.js) llevan 3 de «completa la frase»
  const aMano=(await import(new URL('../src/materias/lectura/preguntas.js',import.meta.url).href)).PREGUNTAS[l.id]||[];
  caps.forEach((c,i)=>{const pq=l.idioma==='es'&&!aMano[i]?.length?ES.preguntasCloze(c.bloques):[];
    if(l.idioma==='es'&&!aMano[i]?.length&&pq.length<3)console.log(`   ⚠️ ${c.titulo}: no se pudieron armar 3 preguntas`);
    writeFileSync(join(dir,`${i+1}.json`),JSON.stringify({titulo:c.titulo,bloques:c.bloques,...(pq.length?{preguntas:pq}:{})}))});
  const {armar,...meta}=l;
  writeFileSync(join(dir,'indice.json'),JSON.stringify({...meta,capitulos:caps.map((c,i)=>({n:i+1,titulo:c.titulo,palabras:palabrasDe(c.bloques),...(c.tema?{tema:c.tema}:{}),...(c.fabulas?{fabulas:c.fabulas}:{})}))},null,1));
  console.log(`   ${caps.length} capítulos, ${caps.reduce((s,c)=>s+palabrasDe(c.bloques),0)} palabras`);
  catalogo.push({...meta,capitulos:caps.map((c,i)=>({n:i+1,titulo:c.titulo,palabras:palabrasDe(c.bloques),...(c.tema?{tema:c.tema}:{})}))});
}
// Catálogo liviano para la app (títulos, licencias y capítulos): la biblioteca se ve sin descargar los textos
if(!solo)writeFileSync(join(raiz,'src','materias','lectura','catalogo.js'),`/* Generado por node scripts/libros.mjs: no lo edites a mano. */
export const LIBROS=${JSON.stringify(catalogo,null,1)};
`);
else console.log('(con --solo no se reescribe el catálogo)');
