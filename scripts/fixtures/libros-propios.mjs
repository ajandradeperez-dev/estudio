/* Fixtures de 🔒 Mis libros (PROMPT-MIS-LIBROS): libros inventados para las pruebas (nada con derechos de autor).
   crearFixtures(carpeta) escribe:
   - faro.epub: 3 capítulos (nav.xhtml), portada, una imagen, versos, un <script> y un onclick que se deben quitar;
     unas entradas comprimidas (deflate) y otras sin comprimir.
   - protegido.epub: el mismo con META-INF/encryption.xml que cifra un capítulo (DRM): no se debe abrir.
   - manual.pdf: 5 páginas con encabezado repetido, número de página y palabras partidas con guion; 2 capítulos.
   - cuentos.txt: «Capítulo 1/2/3».
   FRASE es una frase única de los libros: la prueba de privacidad la busca donde NO debe estar. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {deflateRawSync,deflateSync,crc32} from 'node:zlib';

export const FRASE='el faro de prueba solitario';
const CRC=b=>crc32(b)>>>0;

function zip(entradas){   // [{nombre, datos (Buffer|string), comprimir}]
  const partes=[],central=[];let off=0;
  for(const e of entradas){
    const datos=Buffer.isBuffer(e.datos)?e.datos:Buffer.from(e.datos,'utf8'),comp=e.comprimir?deflateRawSync(datos):datos,nb=Buffer.from(e.nombre,'utf8'),metodo=e.comprimir?8:0;
    const cab=Buffer.alloc(30);cab.writeUInt32LE(0x04034b50,0);cab.writeUInt16LE(20,4);cab.writeUInt16LE(0x0800,6);cab.writeUInt16LE(metodo,8);cab.writeUInt32LE(CRC(datos),14);cab.writeUInt32LE(comp.length,18);cab.writeUInt32LE(datos.length,22);cab.writeUInt16LE(nb.length,26);
    partes.push(cab,nb,comp);
    const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x0800,8);c.writeUInt16LE(metodo,10);c.writeUInt32LE(CRC(datos),16);c.writeUInt32LE(comp.length,20);c.writeUInt32LE(datos.length,24);c.writeUInt16LE(nb.length,28);c.writeUInt32LE(off,42);
    central.push(c,nb);off+=30+nb.length+comp.length;
  }
  const tc=central.reduce((a,b)=>a+b.length,0),fin=Buffer.alloc(22);fin.writeUInt32LE(0x06054b50,0);fin.writeUInt16LE(entradas.length,8);fin.writeUInt16LE(entradas.length,10);fin.writeUInt32LE(tc,12);fin.writeUInt32LE(off,16);
  return Buffer.concat([...partes,...central,fin]);
}
// PNG chiquito de un color (para la portada y la imagen)
function png(w,h,[r,g,b]){
  const fila=Buffer.alloc(1+w*3);for(let x=0;x<w;x++){fila[1+x*3]=r;fila[2+x*3]=g;fila[3+x*3]=b}
  const crudo=Buffer.concat(Array.from({length:h},()=>fila)),chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]),c=Buffer.alloc(4);c.writeUInt32BE(CRC(td));return Buffer.concat([l,td,c])};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;
  return Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ih),chunk('IDAT',deflateSync(crudo)),chunk('IEND',Buffer.alloc(0))]);
}
const xhtml=(titulo,cuerpo)=>`<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>${titulo}</title><style>p{color:red}</style><script>alert('x')</script></head><body>${cuerpo}</body></html>`;
function epub({drm=false}={}){
  const p=t=>`<p>${t}</p>`;
  const cap1=xhtml('Capítulo 1',`<h1>Capítulo 1: La llegada</h1>${p(`Marina llegó al pueblo una tarde de octubre y lo primero que vio fue ${FRASE}, blanco contra el cielo gris.`)}${p('El viento traía olor a sal y a pan recién horneado; las gaviotas daban vueltas sobre el muelle.')}<p onclick="robar()">Nadie la esperaba, pero <b>todos</b> la miraban con <i>curiosidad</i> desde las ventanas.</p><figure><img src="../imagenes/mapa.png" alt="Mapa del pueblo"/></figure>${p('Subió la cuesta con su maleta y tocó la puerta de la única pensión, que tenía las ventanas pintadas de azul.')}`);
  const cap2=xhtml('Capítulo 2',`<h1>Capítulo 2: La canción del guardián</h1>${p('Esa noche el guardián del faro cantó una canción antigua:')}${['Duerme el mar sobre la arena','Brilla el faro en la neblina','Vuelve el barco a su ribera','Canta el viento en la colina','Nadie sabe lo que espera'].map(p).join('')}${p('Marina escuchó desde la ventana hasta que la luz giró por última vez y el pueblo entero se quedó dormido.')}`);
  const cap3=xhtml('Capítulo 3',`<h1>Capítulo 3: El secreto</h1>${p('A la mañana siguiente descubrió una carta escondida detrás de un ladrillo suelto de la pensión.')}${p('La carta hablaba de un tesoro que no era de oro, sino de historias que el pueblo había olvidado con los años.')}${p('Decidió quedarse una semana más para escucharlas todas, una por una, y escribirlas en su cuaderno.')}<script>document.cookie</script>`);
  const nav=`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Índice</title></head><body><nav epub:type="toc"><ol><li><a href="texto/cap1.xhtml">Capítulo 1: La llegada</a></li><li><a href="texto/cap2.xhtml">Capítulo 2: La canción del guardián</a></li><li><a href="texto/cap3.xhtml">Capítulo 3: El secreto</a></li></ol></nav></body></html>`;
  const opf=`<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:uuid:prueba</dc:identifier><dc:title>El Faro de Prueba</dc:title><dc:creator>Autora Inventada</dc:creator><dc:language>es</dc:language><dc:description>Una novela corta inventada para las pruebas.</dc:description></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="portada" href="imagenes/portada.png" media-type="image/png" properties="cover-image"/><item id="mapa" href="imagenes/mapa.png" media-type="image/png"/><item id="c1" href="texto/cap1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="texto/cap2.xhtml" media-type="application/xhtml+xml"/><item id="c3" href="texto/cap3.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="c1"/><itemref idref="c2"/><itemref idref="c3"/></spine></package>`;
  const e=[{nombre:'mimetype',datos:'application/epub+zip'},{nombre:'META-INF/container.xml',datos:`<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`},
    {nombre:'OEBPS/content.opf',datos:opf,comprimir:true},{nombre:'OEBPS/nav.xhtml',datos:nav,comprimir:true},{nombre:'OEBPS/texto/cap1.xhtml',datos:cap1,comprimir:true},{nombre:'OEBPS/texto/cap2.xhtml',datos:cap2},{nombre:'OEBPS/texto/cap3.xhtml',datos:cap3,comprimir:true},
    {nombre:'OEBPS/imagenes/portada.png',datos:png(60,90,[30,64,175])},{nombre:'OEBPS/imagenes/mapa.png',datos:png(80,50,[16,185,129])}];
  if(drm)e.splice(2,0,{nombre:'META-INF/encryption.xml',datos:`<?xml version="1.0"?><encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"><enc:EncryptedData><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/><enc:CipherData><enc:CipherReference URI="OEBPS/texto/cap1.xhtml"/></enc:CipherData></enc:EncryptedData></encryption>`});
  return zip(e);
}
// PDF mínimo con texto (Helvetica): 5 páginas, encabezado repetido, número de página y guiones al final del renglón
function pdf(){
  const paginas=[
    [['Capítulo 1',20],['Las mareas suben y bajan dos veces al día porque la Luna',11],['atrae el agua de los océanos. Para compren-',11],['der este fenómeno conviene observar el muelle',11],['durante una semana completa.',11]],
    [['La amplitud de la marea cambia con las fases de la Luna. En luna',11],['llena y luna nueva las mareas son más grandes y se lla-',11],['man mareas vivas.',11]],
    [['Capítulo 2',20],['Los faros guían a los barcos durante la noche. Cada faro tiene un',11],['patrón de destellos propio que permite identi-',11],['ficarlo desde lejos.',11]],
    [['Los marineros llevan una lista con los patrones de cada faro de la',11],['costa y la consultan antes de entrar al puerto.',11]],
    [['Hoy muchos faros funcionan solos, pero algunos todavía tienen',11],['un guardián que los cuida y los mantiene limpios.',11]]];
  const enc=s=>Buffer.from(s,'latin1').toString('latin1').replace(/[\\()]/g,m=>'\\'+m);
  const objs=[];const add=s=>{objs.push(s);return objs.length};
  const cat=add(''),pags=add(''),fuente=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const kids=[];
  paginas.forEach((ls,i)=>{let y=720;const c=[`BT /F1 9 Tf 72 760 Td (${enc('Manual de Prueba - Edición 2026')}) Tj ET`];
    for(const [t,tam] of ls){c.push(`BT /F1 ${tam} Tf 72 ${y} Td (${enc(t)}) Tj ET`);y-=tam*1.6}
    c.push(`BT /F1 9 Tf 300 40 Td (${i+1}) Tj ET`);const flujo=c.join('\n');
    const cont=add(`<< /Length ${Buffer.byteLength(flujo,'latin1')} >>\nstream\n${flujo}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pags} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fuente} 0 R >> >> /Contents ${cont} 0 R >>`))});
  objs[cat-1]=`<< /Type /Catalog /Pages ${pags} 0 R >>`;objs[pags-1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
  let s='%PDF-1.4\n';const offs=[];objs.forEach((o,i)=>{offs.push(Buffer.byteLength(s,'latin1'));s+=`${i+1} 0 obj\n${o}\nendobj\n`});
  const xref=Buffer.byteLength(s,'latin1');s+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n${offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(s,'latin1');
}
const TXT=`Cuentos del muelle

Capítulo 1

La primera historia trata de un pescador que encontró una botella con un mapa dentro. La guardó en su cajón durante años.

Capítulo 2

La segunda historia es la de una niña que aprendió a nadar sola, mirando a los delfines desde las rocas de la bahía.

Capítulo 3

La última historia cuenta cómo el pueblo entero ayudó a reconstruir el muelle después de la tormenta más fuerte del siglo.
`;
export function crearFixtures(carpeta){
  mkdirSync(carpeta,{recursive:true});
  const r={epub:join(carpeta,'faro.epub'),drm:join(carpeta,'protegido.epub'),pdf:join(carpeta,'manual.pdf'),txt:join(carpeta,'cuentos.txt')};
  writeFileSync(r.epub,epub());writeFileSync(r.drm,epub({drm:true}));writeFileSync(r.pdf,pdf());writeFileSync(r.txt,TXT,'utf8');
  return r;
}
