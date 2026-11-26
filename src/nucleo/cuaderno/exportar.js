/* ⤓ Descargar o compartir notas (PROMPT-EXPORTAR-NOTAS): todo en el teléfono, sin servidores, sin IA y sin librerías.
   - maquetar(): las notas → páginas (Carta o A4, márgenes normales o estrechos) con una lista de dibujo en puntos tipográficos:
     textos (Helvetica, Courier), imágenes (fórmulas KaTeX, fotos, dibujos y palabras con letras que Helvetica no tiene,
     como emojis o letras griegas), rectángulos y líneas. Nada se parte entre páginas: una fórmula, una foto o un dibujo
     que no cabe pasa a la siguiente. Título, cuaderno y fecha arriba; «Estudio+» y «Página n de N» abajo; las tarjetas
     🃏 al final como Pregunta / Respuesta; con varias notas, índice al principio.
   - pdf(): un PDF con TEXTO REAL (Helvetica con WinAnsiEncoding: se selecciona y se busca) y las imágenes en JPEG.
   - png(): cada página como imagen (para WhatsApp o historias), con la misma maquetación.
   - aTexto(), aMarkdown() (las fórmulas quedan como $…$) y zip() (varios archivos, sin comprimir).
   Siempre fondo blanco y letra oscura, aunque la app esté en modo oscuro. */
import {cuadernoDe} from './notas.js';
import {leerArchivo} from './db.js';
import {TARJETA,pieDe} from './formato.js';
import {APP_NOMBRE} from '../../config.js';

/* ---------- opciones (se recuerdan en este dispositivo) ---------- */
export const OPC0={formato:'pdf',tam:'carta',margen:'normal',dibujos:true,fotos:true,tarjetas:true,unir:'uno'};
const CLAVE='ciberlab-exportar';
export function opciones(){try{return {...OPC0,...JSON.parse(localStorage.getItem(CLAVE)||'{}')}}catch(e){return {...OPC0}}}
export function guardarOpciones(o){try{localStorage.setItem(CLAVE,JSON.stringify({...OPC0,...o}))}catch(e){}}
export const FORMATOS={pdf:{ext:'pdf',mime:'application/pdf'},png:{ext:'png',mime:'image/png'},txt:{ext:'txt',mime:'text/plain'},md:{ext:'md',mime:'text/markdown'},zip:{ext:'zip',mime:'application/zip'}};
const PAGINA={carta:[612,792],a4:[595.28,841.89]},MARGEN={normal:64,estrecho:36};

/* ---------- nombre del archivo: el título sin caracteres raros y la fecha ---------- */
const fechaISO=ms=>{const d=new Date(ms||Date.now());return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function nombreArchivo(titulo,ext,ms){
  const base=String(titulo||'Nota').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'Nota';
  return `${base}-${fechaISO(ms)}.${ext}`;
}
const fechaLarga=ms=>new Date(ms||Date.now()).toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'});

/* ---------- texto y Markdown ---------- */
const sinTarjetas=t=>String(t??'').replace(/\r/g,'').split('\n').filter(l=>!l.startsWith(TARJETA)).join('\n');
const tarjetas=t=>String(t??'').replace(/\r/g,'').split('\n').filter(l=>l.startsWith(TARJETA)).map(l=>{const [q,a='']=l.slice(TARJETA.length).split('|').map(x=>x.trim());return [q,a]});
export function aTexto(n,opc=OPC0){
  const cab=`${n.titulo||'Nota'}\n${cuadernoDe(n).nombre} · ${fechaLarga(n.editada)}\n${'='.repeat(Math.min(60,(n.titulo||'Nota').length))}\n\n`;
  const enLin=s=>String(s).replace(/`([^`]+)`/g,'$1').replace(/\$([^$\n]+)\$/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/==([^=]+)==/g,'$1').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1$2').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,t,u)=>/^https?:/.test(u)?`${t} (${u})`:t);
  let enCodigo=false;
  const cuerpo=sinTarjetas(n.cuerpo).split('\n').map(l=>{
    if(/^```/.test(l)){enCodigo=!enCodigo;return ''}if(enCodigo)return '    '+l;
    let m;const t=l.trim();
    if((m=t.match(/^!\[([^\]]*)\]\(img:[\w-]+\)$/)))return `[Imagen${pieDe(m[1])?': '+pieDe(m[1]):''}]`;
    if(t.startsWith('$$')||t.endsWith('$$'))return '    '+t.replace(/^\$\$|\$\$$/g,'').trim();
    if((m=l.match(/^\s*(?:[-*] )?\[( |x|X)\](?: (.*)|$)/)))return `[${m[1]===' '?' ':'x'}] ${enLin(m[2]||'')}`;
    if((m=l.match(/^\s*[-*] (.*)$/)))return `• ${enLin(m[1])}`;
    if((m=l.match(/^(#{1,3}) (.*)$/)))return `\n${enLin(m[2]).toUpperCase()}`;
    if((m=l.match(/^> ?(.*)$/)))return `  «${enLin(m[1])}»`;
    return enLin(l)}).join('\n').replace(/\n{3,}/g,'\n\n');
  const ts=opc.tarjetas?tarjetas(n.cuerpo):[];
  return cab+cuerpo.trim()+(ts.length?`\n\nTarjetas de repaso\n------------------\n${ts.map(([q,a],i)=>`${i+1}. Pregunta: ${q}\n   Respuesta: ${a}`).join('\n')}`:'')+'\n';
}
export function aMarkdown(n,opc=OPC0){
  const cuerpo=sinTarjetas(n.cuerpo).replace(/!\[([^\]]*)\]\(img:[\w-]+\)/g,(_,a)=>`*[Imagen${pieDe(a)?': '+pieDe(a):''}]*`);
  const ts=opc.tarjetas?tarjetas(n.cuerpo):[];
  return `# ${n.titulo||'Nota'}\n\n*${cuadernoDe(n).nombre} · ${fechaLarga(n.editada)}*\n\n${cuerpo.trim()}\n${ts.length?`\n## Tarjetas de repaso\n\n${ts.map(([q,a])=>`- **Pregunta:** ${q}\n  **Respuesta:** ${a}`).join('\n')}\n`:''}`;
}

/* ---------- Helvetica: anchos (AFM, milésimas de em) y WinAnsiEncoding ---------- */
const AFM_R=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const AFM_B=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
// WinAnsi 0x80–0x9F (lo demás de 0xA0–0xFF coincide con Latin-1)
const WIN={'€':0x80,'‚':0x82,'ƒ':0x83,'„':0x84,'…':0x85,'†':0x86,'‡':0x87,'ˆ':0x88,'‰':0x89,'Š':0x8A,'‹':0x8B,'Œ':0x8C,'Ž':0x8E,'‘':0x91,'’':0x92,'“':0x93,'”':0x94,'•':0x95,'–':0x96,'—':0x97,'˜':0x98,'™':0x99,'š':0x9A,'›':0x9B,'œ':0x9C,'ž':0x9E,'Ÿ':0x9F};
const WIN_ANCHO={0x80:556,0x82:222,0x83:556,0x84:333,0x85:1000,0x86:556,0x87:556,0x88:333,0x89:1000,0x8A:667,0x8B:333,0x8C:1000,0x8E:611,0x91:222,0x92:222,0x93:333,0x94:333,0x95:350,0x96:556,0x97:1000,0x98:333,0x99:1000,0x9A:500,0x9B:333,0x9C:944,0x9E:500,0x9F:667};
// anchos de Latin-1 (0xA0–0xFF): la letra base para las acentuadas
const L1=' ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
const L1_R=[278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const L1_B=[278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];
// Antes de medir: guiones y espacios raros a sus equivalentes que sí están en WinAnsi
const normalizar=s=>String(s).replace(/[−‐‑]/g,'-').replace(/[     ]/g,' ').replace(/ /g,' ');
export const codigoWin=ch=>{const c=ch.codePointAt(0);if(c>=32&&c<=126)return c;if(c>=0xA0&&c<=0xFF)return c;return WIN[ch]??null};
export const cabeWin=s=>[...s].every(ch=>codigoWin(ch)!==null);
function anchoCar(ch,negrita){const c=codigoWin(ch);if(c===null)return 556;if(c<=126)return (negrita?AFM_B:AFM_R)[c-32];if(c>=0xA0)return (negrita?L1_B:L1_R)[c-0xA0];return WIN_ANCHO[c]||556}
const anchoTexto=(s,tam,f)=>f==='M'?[...s].length*0.6*tam:[...s].reduce((a,ch)=>a+anchoCar(ch,f==='B'||f==='BI'),0)*tam/1000;

/* ---------- el cuerpo de una nota → bloques con «piezas» en línea ---------- */
// Formato dentro de una línea: `código`, $fórmula$, **negrita**, *cursiva*, ==resaltado==, [enlace](url)
function piezasDeLinea(s,base={}){
  const out=[];let i=0;s=String(s);
  const RE=/`([^`]+)`|\$([^$\n]+)\$|\*\*([^*]+)\*\*|==([^=]+)==|\[([^\]]+)\]\(([^)\s]+)\)|(?<![*\w])\*([^*\s][^*]*?)\*(?!\w)/g;let m;
  while((m=RE.exec(s))){if(m.index>i)out.push({txt:s.slice(i,m.index),...base});
    if(m[1]!==undefined)out.push({txt:m[1],...base,mono:true});else if(m[2]!==undefined)out.push({formula:m[2]});
    else if(m[3]!==undefined)out.push({txt:m[3],...base,b:true});else if(m[4]!==undefined)out.push({txt:m[4],...base,mark:true});
    else if(m[5]!==undefined)out.push({txt:m[5],...base,enlace:true});else out.push({txt:m[7],...base,i:true});
    i=RE.lastIndex}
  if(i<s.length)out.push({txt:s.slice(i),...base});
  return out;
}
function bloquesDe(cuerpo,opc){
  const ls=String(cuerpo??'').replace(/\r/g,'').split('\n'),out=[];let codigo=null,formula=null,num=0;
  for(const l of ls){
    if(codigo){if(/^```/.test(l)){out.push({t:'codigo',lineas:codigo});codigo=null}else codigo.push(l);continue}
    if(formula){const fin=l.trim().endsWith('$$');formula.push(fin?l.trim().slice(0,-2):l);if(fin){out.push({t:'formula',tex:formula.join('\n').trim()});formula=null}continue}
    if(/^```/.test(l)){codigo=[];continue}
    let m;const t=l.trim();
    if((m=t.match(/^\$\$([\s\S]*?)\$\$$/))&&m[1].trim()){out.push({t:'formula',tex:m[1].trim()});num=0;continue}
    if(t.startsWith('$$')){formula=[t.slice(2)];continue}
    if((m=t.match(/^!\[([^\]]*)\]\(img:([\w-]+)\)$/))){out.push({t:'imagen',id:m[2],pie:pieDe(m[1])});num=0;continue}
    if(l.startsWith(TARJETA))continue;   // las tarjetas van al final
    if(!t){out.push({t:'espacio'});num=0;continue}
    if((m=l.match(/^\s*(?:[-*] )?\[( |x|X)\](?: (.*)|$)/))){out.push({t:'casilla',hecha:m[1]!==' ',piezas:piezasDeLinea(m[2]||'')});continue}
    if((m=l.match(/^\s*[-*] (.*)$/))){out.push({t:'lista',piezas:piezasDeLinea(m[1])});continue}
    if((m=l.match(/^\s*(\d+)[.)] (.*)$/))){out.push({t:'numerada',n:m[1],piezas:piezasDeLinea(m[2])});continue}
    if((m=l.match(/^(#{1,3}) (.*)$/))){out.push({t:'titulo',nivel:m[1].length,piezas:piezasDeLinea(m[2],{b:true})});continue}
    if((m=l.match(/^> ?(.*)$/))){out.push({t:'cita',piezas:piezasDeLinea(m[1],{i:true})});continue}
    out.push({t:'parrafo',piezas:piezasDeLinea(l)});
  }
  if(codigo)out.push({t:'codigo',lineas:codigo});
  if(formula)out.push({t:'formula',tex:formula.join('\n').trim()});
  const ts=tarjetas(cuerpo);
  if(opc.tarjetas&&ts.length){out.push({t:'titulo',nivel:2,piezas:[{txt:'Tarjetas de repaso',b:true}],antes:14});
    for(const [q,a] of ts)out.push({t:'tarjeta',q:piezasDeLinea(q),a:piezasDeLinea(a)})}
  return out;
}

/* ---------- imágenes: fórmulas, palabras como imagen, fotos y dibujos ---------- */
const TINTA='#111827',GRIS='#4b5563',SUAVE='#e5e7eb';
async function lienzoAJpeg(dibujar,w,h,escala=3){
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*escala));c.height=Math.max(1,Math.round(h*escala));const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);dibujar(x,escala);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.92));
  return {bytes:new Uint8Array(await blob.arrayBuffer()),pxW:c.width,pxH:c.height,canvas:c};
}
async function imgDeBlob(blob){
  if(typeof createImageBitmap==='function'){try{return await createImageBitmap(blob)}catch(e){}}
  return await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(blob)});
}
// palabra con letras que Helvetica no tiene (emojis, griegas, ≤, √…): se dibuja con la letra del sistema y va como imagen
async function palabraImagen(txt,tam,f){
  const fuente=`${f==='B'||f==='BI'?'bold ':''}${f==='I'||f==='BI'?'italic ':''}${tam}px Helvetica, Arial, "Noto Sans", sans-serif`;
  const c=document.createElement('canvas').getContext('2d');c.font=fuente;const w=Math.ceil(c.measureText(txt).width)+1,h=Math.ceil(tam*1.25);
  const r=await lienzoAJpeg((x,e)=>{x.font=fuente.replace(`${tam}px`,`${tam*e}px`);x.fillStyle=TINTA;x.textBaseline='alphabetic';x.fillText(txt,0,tam*0.95*e)},w,h,4);
  return {...r,w,h,base:tam*0.95};
}
async function formulaImagen(tex,tam,bloque){
  const {imagenFormula}=await import('../dibujo/raster.js');
  const f=await imagenFormula(tex,{tam,color:TINTA,enLinea:!bloque});
  if(!f?.img)return null;
  const r=await lienzoAJpeg((x,e)=>x.drawImage(f.img,0,0,f.w*e,f.h*e),f.w,f.h,4);
  return {...r,w:f.w,h:f.h};
}

/* ---------- maquetación ---------- */
const FUENTE=p=>p.mono?'M':p.b&&p.i?'BI':p.b?'B':p.i?'I':'R';
const T={cuerpo:11,linea:15.5,titulo:22,h:[0,16.5,14,12.5],meta:9.5,pie:8,codigo:9.5};

export async function maquetar(notas,{opc=OPC0,cargarArchivo=leerArchivo}={}){
  const [W,H]=PAGINA[opc.tam]||PAGINA.carta,M=MARGEN[opc.margen]||MARGEN.normal,CW=W-2*M,ABAJO=H-M-6;
  const recursos=new Map();let nRec=0;
  const recurso=r=>{const k='Im'+(++nRec);recursos.set(k,r);return k};
  const paginas=[];let pag=null,y=0;
  const nueva=()=>{pag={items:[]};paginas.push(pag);y=M};
  const cabe=h=>y+h<=ABAJO;
  const asegurar=h=>{if(!cabe(h)&&y>M+1)nueva()};
  const texto=(x,yb,txt,tam,f='R',color=TINTA)=>pag.items.push({t:'texto',x,y:yb,txt:normalizar(txt),tam,f,color});
  const rect=(x,y0,w,h,color)=>pag.items.push({t:'rect',x,y:y0,w,h,color});
  const linea=(x1,y1,x2,y2,color=GRIS,g=0.8)=>pag.items.push({t:'linea',x1,y1,x2,y2,color,g});
  const imagen=(k,x,y0,w,h)=>pag.items.push({t:'img',k,x,y:y0,w,h});
  const cacheFormulas=new Map();
  // piezas → «cajas» (palabras con su ancho, fórmulas e imágenes de palabras) para partir en renglones
  async function cajas(piezas,tam){
    const out=[];
    for(const p of piezas){
      if(p.formula!==undefined){const k=`L${tam}|${p.formula}`;if(!cacheFormulas.has(k)){const im=await formulaImagen(p.formula,tam,false);cacheFormulas.set(k,im?{...im,k:recurso(im)}:null)}
        const im=cacheFormulas.get(k);if(im)out.push({tipo:'img',k:im.k,w:im.w,h:im.h,esp:true});else out.push({tipo:'txt',txt:p.formula,f:'M',tam,w:anchoTexto(p.formula,tam,'M'),esp:true});continue}
      const f=FUENTE(p),partes=normalizar(p.txt).split(/(\s+)/);let esp=false;
      for(const s of partes){if(!s)continue;if(/^\s+$/.test(s)){esp=true;continue}
        if(cabeWin(s))out.push({tipo:'txt',txt:s,f,tam,w:anchoTexto(s,tam,f),esp,mark:p.mark,enlace:p.enlace});
        else{const im=await palabraImagen(s,tam,f);out.push({tipo:'img',k:recurso(im),w:im.w,h:im.h,base:im.base,esp,mark:p.mark})}
        esp=false}
      // un espacio al final de la pieza lo hereda la siguiente
      if(/\s$/.test(p.txt)&&out.length)out.push({tipo:'sep'});
    }
    // «sep» marca espacio antes de la siguiente caja
    for(let i=0;i<out.length;i++)if(out[i].tipo==='sep'){if(out[i+1])out[i+1].esp=true;out.splice(i--,1)}
    return out;
  }
  // parte en renglones y los dibuja desde x0 con ancho w
  async function parrafo(piezas,{tam=T.cuerpo,x0=M,w=CW,alto=T.linea,color=TINTA,centro=false,primero=null}={}){
    const cs=await cajas(piezas,tam),espacio=anchoTexto(' ',tam,'R'),rens=[];let ren=[],ancho=0;
    for(const cj of cs){const extra=(ren.length&&cj.esp?espacio:0)+cj.w;if(ren.length&&ancho+extra>w-1){rens.push(ren);ren=[];ancho=0}
      ren.push(cj);ancho+=(ren.length>1&&cj.esp?espacio:0)+cj.w}
    if(ren.length||!rens.length)rens.push(ren);
    rens.forEach((r,i)=>{
      const hImg=Math.max(0,...r.filter(c=>c.tipo==='img').map(c=>c.h)),h=Math.max(alto,hImg+4);
      asegurar(h);if(i===0&&primero)primero(y,h);
      const base=y+Math.max(tam*0.95,h/2+tam*0.33),largo=r.reduce((a,c,j)=>a+(j&&c.esp?espacio:0)+c.w,0);let x=x0+(centro?(w-largo)/2:0);
      let run=null;const cerrarRun=()=>{if(run){texto(run.x,base,run.txt,run.tam,run.f,run.color);if(run.enlace)linea(run.x,base+1.2,run.x2,base+1.2,'#1d4ed8',0.5);run=null}};
      r.forEach((c,j)=>{const conEsp=j&&c.esp;if(conEsp)x+=espacio;
        if(c.mark)rect(x-1,base-tam*0.85,c.w+2,tam*1.15,'#fde68a');
        if(c.tipo==='txt'){const col=c.enlace?'#1d4ed8':color;
          if(run&&run.f===c.f&&run.tam===c.tam&&run.color===col&&!!run.enlace===!!c.enlace){run.txt+=(conEsp?' ':'')+c.txt;run.x2=x+c.w}
          else{cerrarRun();run={x,x2:x+c.w,txt:c.txt,tam:c.tam,f:c.f,color:col,enlace:c.enlace}}}
        else{cerrarRun();imagen(c.k,x,c.base?base-c.base:base-tam*0.33-c.h/2,c.w,c.h)}
        x+=c.w});
      cerrarRun();
      y+=h});
  }
  const indice=[];
  for(const [ni,n] of notas.entries()){
    nueva();indice.push({titulo:n.titulo||'Nota',pagina:paginas.length});
    // cabecera: título grande, cuaderno y fecha, una raya
    await parrafo([{txt:n.titulo||'Nota',b:true}],{tam:T.titulo,alto:T.titulo*1.25});
    y+=2;texto(M,y+T.meta,`${cuadernoDe(n).nombre} · ${fechaLarga(n.editada)}`,T.meta,'R',GRIS);y+=T.meta+8;
    linea(M,y,M+CW,y,SUAVE,1);y+=12;
    for(const b of bloquesDe(n.cuerpo,opc)){
      if(b.t==='espacio'){y+=5;continue}
      if(b.t==='titulo'){const tam=T.h[b.nivel];y+=b.antes||8;asegurar(tam*1.4+T.linea);await parrafo(b.piezas,{tam,alto:tam*1.35});y+=3;continue}
      if(b.t==='parrafo'){await parrafo(b.piezas);y+=3;continue}
      if(b.t==='lista'||b.t==='numerada'){const marca=b.t==='lista'?'•':`${b.n}.`;await parrafo(b.piezas,{x0:M+16,w:CW-16,primero:(yy,h)=>texto(M+4,yy+Math.max(T.cuerpo*0.95,h/2+T.cuerpo*0.33),marca,T.cuerpo,b.t==='lista'?'B':'R')});y+=2;continue}
      if(b.t==='casilla'){await parrafo(b.piezas,{x0:M+18,w:CW-18,color:b.hecha?GRIS:TINTA,primero:(yy,h)=>{const by=yy+Math.max(T.cuerpo*0.95,h/2+T.cuerpo*0.33)-8.5;
          pag.items.push({t:'caja',x:M+3,y:by,w:9,h:9,color:GRIS});if(b.hecha){linea(M+4.5,by+4.5,M+7,by+7.5,'#15803d',1.4);linea(M+7,by+7.5,M+11.5,by+1,'#15803d',1.4)}}});y+=2;continue}
      if(b.t==='cita'){const y0=y;await parrafo(b.piezas,{x0:M+14,w:CW-14,color:GRIS});pag.items.push({t:'rect',x:M+3,y:Math.max(M,y0),w:2.5,h:Math.max(6,y-Math.max(M,y0)),color:'#9ca3af'});y+=4;continue}
      if(b.t==='codigo'){const tam=T.codigo,porRen=Math.max(10,Math.floor((CW-14)/(0.6*tam))),rens=b.lineas.flatMap(l=>{const s=normalizar(l);if(!s)return [''];const r=[];for(let i=0;i<s.length;i+=porRen)r.push(s.slice(i,i+porRen));return r});
        y+=2;for(const r of rens){asegurar(tam*1.5);rect(M,y,CW,tam*1.5,'#f3f4f6');if(cabeWin(r))texto(M+7,y+tam*1.1,r,tam,'M');else{const im=await palabraImagen(r,tam,'R');imagen(recurso(im),M+7,y+1,im.w,im.h)}y+=tam*1.5}y+=6;continue}
      if(b.t==='formula'){const im=await formulaImagen(b.tex,13,true);
        if(!im){await parrafo([{txt:b.tex,mono:true}]);continue}
        let w=im.w,h=im.h;if(w>CW){h*=CW/w;w=CW}if(h>ABAJO-M){w*=(ABAJO-M)/h;h=ABAJO-M}
        y+=4;asegurar(h);imagen(recurso(im),M+(CW-w)/2,y,w,h);y+=h+8;continue}
      if(b.t==='imagen'){const a=await cargarArchivo(b.id).catch(()=>null);if(!a?.blob)continue;
        const esDibujo=!!a.dibujo||a.tipo==='image/png'&&!a.foto;if(esDibujo?!opc.dibujos:!opc.fotos)continue;
        let bm;try{bm=await imgDeBlob(a.blob)}catch(e){continue}
        const nw=bm.width||a.ancho||400,nh=bm.height||a.alto||300,maxH=(ABAJO-M)*(b.pie?0.8:0.88);
        let w=Math.min(CW,nw*0.6),h=w*nh/nw;if(h>maxH){w*=maxH/h;h=maxH}
        const im=await lienzoAJpeg(x=>x.drawImage(bm,0,0,Math.round(w*2.5),Math.round(h*2.5)),w,h,2.5);
        const hPie=b.pie?T.meta*1.4+4:0;y+=4;asegurar(h+hPie);
        imagen(recurso(im),M+(CW-w)/2,y,w,h);pag.items.push({t:'caja',x:M+(CW-w)/2,y,w,h,color:SUAVE});y+=h+4;
        if(b.pie){const pw=anchoTexto(b.pie,T.meta,'I');if(cabeWin(b.pie))texto(M+Math.max(0,(CW-pw)/2),y+T.meta,b.pie,T.meta,'I',GRIS);y+=hPie-4}
        y+=6;continue}
      if(b.t==='tarjeta'){asegurar(T.linea*2+8);const y0=y;
        await parrafo([{txt:'Pregunta: ',b:true},...b.q],{x0:M+8,w:CW-16});await parrafo([{txt:'Respuesta: ',b:true},...b.a],{x0:M+8,w:CW-16,color:GRIS});
        if(y>y0)pag.items.push({t:'caja',x:M,y:y0-2,w:CW,h:y-y0+4,color:SUAVE});y+=8;continue}
    }
  }
  // índice al principio (varias notas en un solo PDF)
  let paginasIndice=0;
  if(notas.length>1){
    const porPag=Math.floor((ABAJO-M-50)/18),k=Math.ceil(indice.length/porPag),cuerpo=paginas.splice(0);paginasIndice=k;
    for(let p=0;p<k;p++){nueva();if(p===0){texto(M,y+T.titulo,'Índice',T.titulo,'B');y+=T.titulo+18}
      for(const e of indice.slice(p*porPag,(p+1)*porPag)){const num=String(e.pagina+k),wn=anchoTexto(num,T.cuerpo,'R');let tit=normalizar(e.titulo);
        while(anchoTexto(tit,T.cuerpo,'R')>CW-wn-30&&tit.length>4)tit=tit.slice(0,-2);if(tit!==normalizar(e.titulo))tit+='…';
        if(cabeWin(tit))texto(M,y+T.cuerpo,tit,T.cuerpo);const desde=M+anchoTexto(tit,T.cuerpo,'R')+6,puntos='.'.repeat(Math.max(0,Math.floor((M+CW-wn-6-desde)/anchoTexto('.',T.cuerpo,'R'))));
        texto(desde,y+T.cuerpo,puntos,T.cuerpo,'R',GRIS);texto(M+CW-wn,y+T.cuerpo,num,T.cuerpo);y+=18}}
    paginas.push(...cuerpo);
  }
  // pie: el nombre de la app y el número de página
  paginas.forEach((p,i)=>{const t=`Página ${i+1} de ${paginas.length}`;
    p.items.push({t:'texto',x:M,y:H-M/2+3,txt:APP_NOMBRE,tam:T.pie,f:'R',color:'#9ca3af'},{t:'texto',x:W-M-anchoTexto(t,T.pie,'R'),y:H-M/2+3,txt:t,tam:T.pie,f:'R',color:'#6b7280'})});
  return {W,H,paginas,recursos,indice:indice.map(e=>({...e,pagina:e.pagina+paginasIndice}))};
}

/* ---------- PDF con texto real ---------- */
const hex2rgb=h=>{const n=parseInt(h.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(x=>+x.toFixed(3)).join(' ')};
const FUENTES={R:['F1','Helvetica'],B:['F2','Helvetica-Bold'],I:['F3','Helvetica-Oblique'],BI:['F4','Helvetica-BoldOblique'],M:['F5','Courier']};
// texto → bytes WinAnsi dentro de un literal de PDF (escapando \ ( ))
const literal=s=>'('+[...s].map(ch=>{const c=codigoWin(ch)??63;const x=String.fromCharCode(c);return x==='\\'||x==='('||x===')'?'\\'+x:x}).join('')+')';
const bytesLatin=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b};
export async function pdf(mq,{titulo=''}={}){
  const partes=[],offs=[];let largo=0;
  const poner=x=>{const b=typeof x==='string'?bytesLatin(x):x;partes.push(b);largo+=b.length};
  const obj=(n,cuerpo)=>{offs[n]=largo;poner(`${n} 0 obj\n`);for(const c of [].concat(cuerpo))poner(c);poner('\nendobj\n')};
  poner('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const nP=mq.paginas.length,claves=[...mq.recursos.keys()],baseF=3,baseI=baseF+5,baseP=baseI+claves.length,info=baseP+nP*2;
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,`<< /Type /Pages /Kids [${mq.paginas.map((_,i)=>`${baseP+i*2} 0 R`).join(' ')}] /Count ${nP} >>`);
  Object.values(FUENTES).forEach(([,base],i)=>obj(baseF+i,`<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`));
  const numIm=new Map();
  claves.forEach((k,i)=>{const r=mq.recursos.get(k);numIm.set(k,baseI+i);
    obj(baseI+i,[`<< /Type /XObject /Subtype /Image /Width ${r.pxW} /Height ${r.pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${r.bytes.length} >>\nstream\n`,r.bytes,'\nendstream'])});
  const fuentesRes=Object.values(FUENTES).map(([n],i)=>`/${n} ${baseF+i} 0 R`).join(' ');
  mq.paginas.forEach((p,i)=>{
    const H=mq.H,c=[],usadas=new Set();
    for(const it of p.items){
      if(it.t==='rect')c.push(`${hex2rgb(it.color)} rg ${+it.x.toFixed(2)} ${+(H-it.y-it.h).toFixed(2)} ${+it.w.toFixed(2)} ${+it.h.toFixed(2)} re f`);
      else if(it.t==='caja')c.push(`${hex2rgb(it.color)} RG 0.8 w ${+it.x.toFixed(2)} ${+(H-it.y-it.h).toFixed(2)} ${+it.w.toFixed(2)} ${+it.h.toFixed(2)} re S`);
      else if(it.t==='linea')c.push(`${hex2rgb(it.color)} RG ${it.g} w ${+it.x1.toFixed(2)} ${+(H-it.y1).toFixed(2)} m ${+it.x2.toFixed(2)} ${+(H-it.y2).toFixed(2)} l S`);
      else if(it.t==='img'){usadas.add(it.k);c.push(`q ${+it.w.toFixed(2)} 0 0 ${+it.h.toFixed(2)} ${+it.x.toFixed(2)} ${+(H-it.y-it.h).toFixed(2)} cm /${it.k} Do Q`)}
      else if(it.t==='texto')c.push(`BT /${FUENTES[it.f][0]} ${it.tam} Tf ${hex2rgb(it.color)} rg 1 0 0 1 ${+it.x.toFixed(2)} ${+(H-it.y).toFixed(2)} Tm ${literal(it.txt)} Tj ET`);
    }
    const flujo=c.join('\n'),xo=[...usadas].map(k=>`/${k} ${numIm.get(k)} 0 R`).join(' ');
    obj(baseP+i*2,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${+mq.W.toFixed(2)} ${+mq.H.toFixed(2)}] /Resources << /Font << ${fuentesRes} >>${xo?` /XObject << ${xo} >>`:''} >> /Contents ${baseP+i*2+1} 0 R >>`);
    obj(baseP+i*2+1,[`<< /Length ${flujo.length} >>\nstream\n`,flujo,'\nendstream']);
  });
  obj(info,`<< /Title ${literal(titulo||'Notas')} /Producer ${literal(APP_NOMBRE)} /Creator ${literal(APP_NOMBRE)} >>`);
  const total=info+1,xref=largo;
  poner(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)poner(`${String(offs[i]??0).padStart(10,'0')} 00000 n \n`);
  poner(`trailer\n<< /Size ${total} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(partes,{type:'application/pdf'});
}

/* ---------- PNG: cada página como imagen (misma maquetación) ---------- */
const CSS_F={R:'',B:'bold ',I:'italic ',BI:'bold italic ',M:''};
export async function png(mq,{escala=2}={}){
  const out=[];
  for(const p of mq.paginas){
    const c=document.createElement('canvas');c.width=Math.round(mq.W*escala);c.height=Math.round(mq.H*escala);const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.scale(escala,escala);
    for(const it of p.items){
      if(it.t==='rect'){x.fillStyle=it.color;x.fillRect(it.x,it.y,it.w,it.h)}
      else if(it.t==='caja'){x.strokeStyle=it.color;x.lineWidth=0.8;x.strokeRect(it.x,it.y,it.w,it.h)}
      else if(it.t==='linea'){x.strokeStyle=it.color;x.lineWidth=it.g;x.beginPath();x.moveTo(it.x1,it.y1);x.lineTo(it.x2,it.y2);x.stroke()}
      else if(it.t==='img'){const r=mq.recursos.get(it.k);if(r?.canvas)x.drawImage(r.canvas,it.x,it.y,it.w,it.h)}
      else if(it.t==='texto'){x.fillStyle=it.color;x.font=`${CSS_F[it.f]}${it.tam}px ${it.f==='M'?'"Courier New", Courier, monospace':'Helvetica, Arial, sans-serif'}`;x.textBaseline='alphabetic';x.fillText(it.txt,it.x,it.y)}
    }
    out.push(await new Promise(r=>c.toBlob(r,'image/png')));
  }
  return out;
}

/* ---------- ZIP (sin comprimir) ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
export async function zip(archivos){
  const enc=new TextEncoder(),partes=[],central=[];let off=0;
  const u16=n=>[n&255,n>>8&255],u32=n=>[n&255,n>>8&255,n>>16&255,n>>>24&255];
  const nombres=new Set();
  for(const a of archivos){
    let nombre=a.nombre;for(let k=2;nombres.has(nombre);k++)nombre=a.nombre.replace(/(\.\w+)$/,`-${k}$1`);nombres.add(nombre);
    const datos=a.bytes||new Uint8Array(await a.blob.arrayBuffer()),nb=enc.encode(nombre),crc=crc32(datos);
    const cab=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(datos.length),...u32(datos.length),...u16(nb.length),...u16(0)]);
    partes.push(cab,nb,datos);
    central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(datos.length),...u32(datos.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nb);
    off+=cab.length+nb.length+datos.length;
  }
  const tamCentral=central.reduce((a,b)=>a+b.length,0);
  const fin=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(archivos.length),...u16(archivos.length),...u32(tamCentral),...u32(off),...u16(0)]);
  return new Blob([...partes,...central,fin],{type:'application/zip'});
}

/* ---------- todo junto: notas + opciones → archivos listos para guardar o compartir ---------- */
export async function exportarNotas(notas,opc=opciones()){
  const fmt=opc.formato,ms=notas.length===1?notas[0].editada:Date.now();
  const titulo=notas.length===1?(notas[0].titulo||'Nota'):`Notas (${notas.length})`;
  if(fmt==='txt'||fmt==='md'){
    const fx=fmt==='txt'?aTexto:aMarkdown,arch=notas.map(n=>({nombre:nombreArchivo(n.titulo,fmt,n.editada),blob:new Blob([fx(n,opc)],{type:FORMATOS[fmt].mime})}));
    if(arch.length===1)return arch;
    if(opc.unir==='zip')return [{nombre:nombreArchivo(titulo,'zip',ms),blob:await zip(arch)}];
    return [{nombre:nombreArchivo(titulo,fmt,ms),blob:new Blob([notas.map(n=>fx(n,opc)).join(fmt==='md'?'\n\n---\n\n':'\n\n'+'─'.repeat(40)+'\n\n')],{type:FORMATOS[fmt].mime})}];
  }
  if(fmt==='png'){
    const arch=[];for(const n of notas){const mq=await maquetar([n],{opc}),ps=await png(mq);ps.forEach((b,i)=>arch.push({nombre:nombreArchivo(n.titulo+(ps.length>1?`-p${i+1}`:''),'png',n.editada),blob:b}))}
    return arch.length===1?arch:[{nombre:nombreArchivo(titulo,'zip',ms),blob:await zip(arch)}];
  }
  // PDF: uno solo (con índice si son varias) o un PDF por nota en un .zip
  if(notas.length>1&&opc.unir==='zip'){const arch=[];for(const n of notas){const mq=await maquetar([n],{opc});arch.push({nombre:nombreArchivo(n.titulo,'pdf',n.editada),blob:await pdf(mq,{titulo:n.titulo})})}
    return [{nombre:nombreArchivo(titulo,'zip',ms),blob:await zip(arch)}]}
  const mq=await maquetar(notas,{opc});
  return [{nombre:nombreArchivo(titulo,'pdf',ms),blob:await pdf(mq,{titulo}),paginas:mq.paginas.length}];
}
