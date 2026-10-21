/* Libros en español de 📚 Lectura (los usa scripts/libros.mjs). Todos de Project Gutenberg y de autores muertos antes de
   1900 (o anónimos antiguos); de cada edición se deja SOLO la obra: se quitan el encabezado y el pie de Gutenberg, las
   introducciones y las notas de editores modernos (marcas [15] y bloques de notas), los índices y las imágenes.
     lazarillo   Lazarillo de Tormes (anónimo, 1554) · Gutenberg #320
     quijote     Don Quijote de la Mancha, primera parte (Cervantes, †1616) · Gutenberg #2000
     novelas     Novelas ejemplares, selección: Rinconete y Cortadillo, El licenciado Vidriera, La fuerza de la sangre · #61202
     becquer     Rimas y leyendas (Bécquer, †1870) · #53552, sin la introducción de los Álvarez Quintero (†1938/†1944)
     sorjuana    Poemas selectos (Sor Juana Inés de la Cruz, †1695) · #74087 (ed. de Juan León Mera, †1894; sin su biografía)
     samaniego   Fábulas (Samaniego, †1801) · #55206, sin la introducción ni las notas del editor
   La poesía conserva sus versos: cada estrofa es un bloque {t:'v', x} con <br> entre versos. */
const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function cuerpoGutenberg(t){
  t=t.replace(/\r/g,'');
  const a=t.indexOf('\n',t.search(/\*\*\* START OF TH(E|IS) PROJECT GUTENBERG EBOOK/))+1,b=t.search(/\*\*\* END OF TH(E|IS) PROJECT GUTENBERG EBOOK/);
  return t.slice(a,b);
}
// Quita notas de editor: marcas [15] / [Nota …] y renglones de imagen
const limpiar=t=>t.replace(/\[\d+\]/g,'').replace(/^\s*\[(imagen|Ilustración|Illustration)[^\]]*\]\s*$/gim,'');
// Bloques de un fragmento: prosa (renglones unidos) o verso (renglones con sangría: se conservan)
export function bloques(txt,{verso=false}={}){
  return limpiar(txt).split(/\n\s*\n/).map(p=>p.replace(/\s+$/,'')).filter(p=>p.trim()&&!/^\s*\*+(\s+\*+)*\s*$/.test(p)).map(p=>{
    const lineas=p.split('\n').filter(l=>l.trim()),sangria=lineas.filter(l=>/^\s{2,}\S/.test(l)).length;
    const esVerso=verso||lineas.length>1&&sangria>=Math.ceil(lineas.length*0.6);
    const fmt=s=>escH(s).replace(/_([^_]+)_/g,'<i>$1</i>');
    return esVerso?{t:'v',x:lineas.map(l=>fmt(l.trim())).join('<br>')}:{t:'p',x:fmt(lineas.map(l=>l.trim()).join(' ').replace(/--/g,'—'))};
  });
}
const palabras=bs=>bs.reduce((s,b)=>s+String(b.x).replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length,0);
// Parte una obra larga en capítulos de ~maxPalabras (sin cortar párrafos)
function partir(titulo,bs,maxPalabras=2600){
  const total=palabras(bs);if(total<=maxPalabras*1.3)return [{titulo,bloques:bs}];
  const n=Math.ceil(total/maxPalabras),meta=total/n,out=[];let act=[],cuenta=0;
  for(const b of bs){act.push(b);cuenta+=palabras([b]);if(cuenta>=meta&&out.length<n-1){out.push(act);act=[];cuenta=0}}
  if(act.length)out.push(act);
  return out.map((x,i)=>({titulo:`${titulo} (${i+1}/${out.length})`,bloques:x}));
}
const tituloEs=s=>s.toLowerCase().replace(/^\p{L}/u,c=>c.toUpperCase()).replace(/\.$/,'');
// Texto entre dos marcas (líneas exactas); fin: la primera marca de la lista que aparezca después
function entre(c,inicio,fines,desde=0){
  const re=new RegExp(`^${inicio}\\s*$`,'m');re.lastIndex=0;
  const m=re.exec(c.slice(desde));if(!m)throw new Error(`no encontré «${inicio}»`);
  const a=desde+m.index+m[0].length;let b=c.length;
  for(const f of fines){const mf=new RegExp(`^${f}\\s*$`,'m').exec(c.slice(a));if(mf)b=Math.min(b,a+mf.index)}
  return c.slice(a,b);
}

export function lazarillo(t){
  const c=cuerpoGutenberg(t),re=/^(Prólogo|Tratado (?:Primero|Segundo|Tercero|Cuarto|Quinto|Sexto|Séptimo))\s*$/gm,ms=[...c.matchAll(re)];
  return ms.map((m,i)=>{const txt=c.slice(m.index+m[0].length,ms[i+1]?.index??c.length);
    const lin=txt.trim().split('\n'),sub=m[1]==='Prólogo'?'':lin[0].trim();
    return {titulo:sub?`${m[1]}: ${sub.replace(/\.$/,'')}`:m[1],bloques:bloques(sub?lin.slice(1).join('\n'):txt)}});
}
export function quijote(t){
  const c=cuerpoGutenberg(t),ini=c.search(/^Capítulo primero\. Que trata de la condición/m),fin=c.indexOf('\nSegunda parte del ingenioso caballero',ini);
  const parte=c.slice(ini,fin),re=/^Capítulo [^\n]+(?:\n[^\n]+)*?(?=\n\n)/gm,ms=[...parte.matchAll(re)];
  return ms.map((m,i)=>{const enc=m[0].replace(/\s*\n\s*/g,' ').trim(),[num,...resto]=enc.split(/\.\s+/);
    return {titulo:`${num.replace(/^Capítulo /,'Cap. ')}: ${resto.join('. ').replace(/\.$/,'')}`,bloques:bloques(parte.slice(m.index+m[0].length,ms[i+1]?.index??parte.length))}});
}
export function novelas(t){
  const c=cuerpoGutenberg(t),cuerpo=c.slice(c.indexOf('\nLA JITANILLA.\n'));
  const obras=[['RINCONETE Y CORTADILLO\\.','Rinconete y Cortadillo',['LA ESPAÑOLA INGLESA\\.']],['EL LICENCIADO VIDRIERA\\.','El licenciado Vidriera',['LA FUERZA DE LA SANGRE\\.']],['LA FUERZA DE LA SANGRE\\.','La fuerza de la sangre',['EL CELOSO ESTREMEÑO\\.']]];
  return obras.flatMap(([ini,tit,fin])=>partir(tit,bloques(entre(cuerpo,ini,fin)).filter(b=>!/^FIN\.?$/i.test(b.x)),2800));
}
export function becquer(t){
  const c=cuerpoGutenberg(t),ley=c.slice(c.search(/^LEYENDAS\s*$/m)),fin=ley.search(/^DESDE MI CELDA\s*$/m),leyendas=ley.slice(0,fin);
  const TODAS=['MAESE PÉREZ EL ORGANISTA','LOS OJOS VERDES','EL RAYO DE LUNA','TRES FECHAS','LA CORZA BLANCA','LA ROSA DE PASIÓN','LA PROMESA','EL MONTE DE LAS ÁNIMAS','EL GNOMO','EL MISERERE','LAS HOJAS SECAS','LA VENTA DE LOS GATOS'];
  const ELEGIDAS=['MAESE PÉREZ EL ORGANISTA','LOS OJOS VERDES','EL RAYO DE LUNA','EL MONTE DE LAS ÁNIMAS','EL MISERERE','LA CORZA BLANCA'];
  const NOMBRE={'MAESE PÉREZ EL ORGANISTA':'Maese Pérez el organista','LOS OJOS VERDES':'Los ojos verdes','EL RAYO DE LUNA':'El rayo de luna','EL MONTE DE LAS ÁNIMAS':'El monte de las ánimas','EL MISERERE':'El miserere','LA CORZA BLANCA':'La corza blanca'};
  const caps=ELEGIDAS.flatMap(L=>partir(`Leyenda: ${NOMBRE[L]}`,bloques(entre(leyendas,L.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),TODAS.filter(x=>x!==L).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))),3000));
  const rimas=c.slice(c.search(/^RIMAS\s*$/m)).replace(/^RIMAS\s*/,'');
  const finRimas=rimas.search(/^(ÍNDICE|INDICE|FIN)\s*$/m),rb=bloques(finRimas>0?rimas.slice(0,finRimas):rimas,{verso:true}).map(b=>/^[IVXL]+\.?$/.test(b.x)?{t:'h',x:`Rima ${b.x.replace('.','')}`}:b);
  const mitad=Math.ceil(rb.length/2),corte=rb.findIndex((b,i)=>i>=mitad&&b.t==='h');
  return [...caps,{titulo:'Rimas (primera mitad)',bloques:rb.slice(0,corte>0?corte:mitad)},{titulo:'Rimas (segunda mitad)',bloques:rb.slice(corte>0?corte:mitad)}];
}
export function sorjuana(t){
  const c=cuerpoGutenberg(t),obra=c.slice(c.search(/^ROMANCES\.\s*$/m),c.search(/^LOS EMPEÑOS DE UNA CASA\.\s*$/m));
  const SECC=['ROMANCES','DECIMAS','REDONDILLAS','GLOSAS','QUINTILLAS','SONETOS','CANCIONES','ODAS, LIRAS Y LETRILLAS','SILVA','POESIA BURLESCA, IMITADA DE JACINTO POLO','EPIGRAMAS','LOS SILBOS','ORACION'];
  const nombres={DECIMAS:'Décimas',POESIA:'Poesía burlesca',ODAS:'Odas, liras y letrillas',ORACION:'Oración'};
  const re=new RegExp(`^(${SECC.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\.?\\s*$`,'gm'),ms=[...obra.matchAll(re)];
  const caps=[];
  ms.forEach((m,i)=>{const nom=m[1];if(/^(ORACION|LOS SILBOS|SILVA|GLOSAS|QUINTILLAS)/.test(nom))return;
    const txt=obra.slice(m.index+m[0].length,ms[i+1]?.index??obra.length);
    const bs=bloques(txt,{verso:true}).map(b=>/^[IVXL]+\.?$/.test(b.x)?{t:'h',x:b.x.replace('.','')}:b).filter(b=>b.x.replace(/<[^>]+>/g,'').trim());
    caps.push(...partir(nombres[nom.split(/[ ,]/)[0]]||tituloEs(nom),bs,2200))});
  return caps;
}
export function samaniego(t){
  const c=cuerpoGutenberg(t),obra=c.slice(c.search(/^LIBRO PRIMERO\s*$/m),c.search(/^APÉNDICE\s*$/m));
  const re=/^LIBRO (PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO|OCTAVO|NONO|NOVENO)\s*$/gm,ms=[...obra.matchAll(re)];
  return ms.map((m,i)=>{const txt=obra.slice(m.index+m[0].length,ms[i+1]?.index??obra.length);
    // «FÁBULA II» + título en la línea siguiente no vacía → encabezado
    const bs=[],partes=txt.split(/^\s*FÁBULA ([IVXL]+|PRIMERA)\.?\s*$/m);
    for(let k=1;k<partes.length;k+=2){const num=partes[k]==='PRIMERA'?'I':partes[k],cuerpo=limpiar(partes[k+1]).replace(/^\s+/,'');
      const [tit,...resto]=cuerpo.split('\n\n');
      bs.push({t:'h',x:`${num}. ${escH(tit.replace(/\s+/g,' ').trim())}`},...bloques(resto.join('\n\n'),{verso:true}))}
    return {titulo:`Libro ${m[1]==='NONO'?'noveno':m[1].toLowerCase()}`,bloques:bs};
  });
}

/* Preguntas de «completa la frase» de un capítulo en español (para los libros sin preguntas escritas a mano): tres
   oraciones del texto (al inicio, en medio y al final), cada una con una palabra clave en blanco: un nombre propio o un
   sustantivo que se repite en el capítulo. La evidencia es la oración misma (está tal cual en el texto). */
const VACIAS_ES=new Set('mejor peor primero primera segundo menos menor mayor mucho poder decir hacer que de la el en y a los las se del por con no una un su al lo como mas más pero sus le ya o fue este esta sin sobre entre cuando muy porque mi me si ni hasta desde donde quien todo todos todas también tan ha han había era eran ser estar tiene tenía dijo dice cual cuales otro otra otros otras mismo misma aquel aquella aquellos esto eso ese esa nos les vos os tu te yo él ella ellos ellas mucho mucha muchos muchas poco pocos algún alguna alguno algunos cosa cosas tanto tanta tantos señor señora habia estaba estaban aunque pues luego entonces antes después despues ahora así asi cuanto cuanta'.split(' '));
const norm=t=>t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
export function preguntasCloze(bloques,n=3){
  const texto=bloques.filter(b=>b.t==='p'||b.t==='v').map(b=>String(b.x).replace(/<br>/g,' / ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')).join(' ');
  const oraciones=texto.split(/(?<=[.!?;])\s+/).map(s=>s.trim()).filter(s=>{const w=s.split(/\s+/).length;return w>=8&&w<=34&&!/[«»"“”]{2,}|—.*—.*—|_/.test(s)});
  if(oraciones.length<n)return [];
  const freq=new Map();for(const w of texto.match(/\p{L}{5,}/gu)||[]){const k=norm(w);if(!VACIAS_ES.has(k))freq.set(k,(freq.get(k)||0)+1)}
  // palabra clave de una oración: nombre propio (no al inicio) o la palabra más repetida del capítulo que aparezca
  // verbos, adverbios y participios no son buenas claves
  const VERBAL=/(mente|ndo|aba|aban|abas|ia|ian|ias|aron|ieron|ar|er|ir|ado|ada|ados|adas|ido|ida|idos|idas|ase|iese|are|iere|io|ego|uve|ude|ize|ice)$/;
  const clave=s=>{const ws=[...s.matchAll(/\p{L}{4,}/gu)];
    // nombre propio: con mayúscula, sin ser inicio de oración ni de verso (tras « / »)
    const propio=ws.find((m,i)=>i>0&&/^\p{Lu}\p{Ll}/u.test(m[0])&&!/(^|[\/¡¿—«"])\s*$/.test(s.slice(0,m.index))&&!VACIAS_ES.has(norm(m[0])));if(propio)return propio[0];
    let mejor=null,f=1;for(const m of ws){const k=norm(m[0]);if(m[0].length>=5&&!VACIAS_ES.has(k)&&!VERBAL.test(k)&&!/^\p{Lu}/u.test(m[0])&&(freq.get(k)||0)>f){f=freq.get(k);mejor=m[0]}}
    return mejor};
  const out=[],tercio=Math.floor(oraciones.length/n);
  for(let k=0;k<n;k++){
    for(let i=k*tercio;i<Math.min(oraciones.length,(k+1)*tercio+tercio);i++){const s=oraciones[i],w=clave(s);
      if(!w||out.some(q=>q[2]===s))continue;
      const hueco=s.replace(new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`,'u'),'___');
      if(hueco===s)continue;
      out.push([`Completa la frase del capítulo: «${hueco}»`,[w,norm(w)],s]);break}
  }
  return out.length===n?out:[];
}
