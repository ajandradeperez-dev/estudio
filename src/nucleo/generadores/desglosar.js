/* Pasos desglosados: UNA acción por paso (sin DOM; lo aplica crear() a todos los generadores y lo mide npm run principiante).
   - Una cadena con ⇒ («\(2x = -18 \Rightarrow x = -9\)» o «x² = 1 ⇒ x = 1») se separa en pasos: el primero conserva su
     frase; los siguientes se llaman «Despeja x» (si queda «letra = valor») o «Simplifica».
   - Varias igualdades seguidas (separadas por coma, punto y coma o salto de línea, p. ej. «\(f' = -5,\ g' = 5\)» o
     «x̄ = 6.6, ȳ = 40») se juntan en un solo bloque, una por renglón: es la misma acción (escribir los datos).
   - acciones(paso) → {iguales, ys}: enunciados con «=» separados por ⇒, →, coma, punto y coma, salto de línea o « y »
     (una cadena «a = b = c» es una sola cuenta; un bloque alineado o un sistema \begin{…} cuenta como uno; no cuentan
     >=, <=, ==, != ni el = inicial de una fórmula de Excel) y « y » que unen verbos en la frase. */
const FORM=/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
const formulas=t=>[...String(t).matchAll(FORM)];
// «=» que cuenta como igualdad
const IGUAL=/(?<![<>=!])=(?!=)/;
export const esIgualdad=t=>IGUAL.test(String(t).replace(/(^|[\s(;"“—])=(?=[A-ZÁÉÍÓÚa-z(])/g,'$1'));

// Partes de nivel superior de una fórmula separadas por ⇒ (sin entrar en llaves ni en \begin…\end)
function partirFlechas(f){
  if(/\\begin\{/.test(f))return [f];
  // ⇒ dentro de \cambio{…}: se abre, se parte y se vuelve a resaltar cada trozo
  const env=/^\s*\\cambio\{([\s\S]*)\}\s*$/.exec(f);
  if(env&&/\\Rightarrow|⇒/.test(env[1]))return partirFlechas(env[1]).map(x=>`\\cambio{${x}}`);
  const out=[];let prof=0,ini=0;
  for(let i=0;i<f.length;i++){
    const ch=f[i];
    if(ch==='{'){prof++;continue}
    if(ch==='}'){prof--;continue}
    if(prof!==0)continue;
    const m=/^(?:\\Rightarrow|\\implies|⇒)/.exec(f.slice(i));
    if(m){out.push(f.slice(ini,i));i+=m[0].length-1;ini=i+1}
  }
  out.push(f.slice(ini));
  return out.map(x=>x.replace(/^(?:\\[;,:!]|\\quad|\\ |\s)+|(?:\\[;,:!]|\\quad|\\ |\s)+$/g,'').trim()).filter(Boolean);
}
const nombreDespeje=f=>{const m=/^\s*([a-zA-Z](?:_\{?\w+\}?)?|[a-zA-Z]'+|\\theta|\\lambda)\s*=\s*[^=]+$/.exec(f);return m?`Despeja ${m[1].replace(/[{}\\]/g,'')}`:'Simplifica'};

// Rótulo corto entre fórmulas («(arriba),», «x:», «no alcanza;», «con»): hasta 3 palabras
const rotulo=t=>{const x=String(t).replace(/<br\s*\/?>|&nbsp;|\\ /g,' ').replace(/[(),;:.]/g,' ').replace(/\s+/g,' ').trim();return x.split(' ').filter(Boolean).length<=3?x:null};
const limpioKatex=t=>t.replace(/[{}\\$&#%_^~]/g,'');
const textoKatex=t=>t?`\\quad\\text{${limpioKatex(t)}}`:'';
// Igualdades sueltas en fórmulas: «\(a = 1,\ b = 2\)», «\(a = 1\), \(b = 2\)» o con rótulos cortos → un bloque alineado
function juntarIgualdades(como){
  const t=String(como),fs=formulas(t),inl=fs.filter(m=>m[1]!==undefined);
  if(inl.length===1&&fs.length===1){const f=inl[0][1];
    if(!/\\begin\{/.test(f)&&!/\\Rightarrow|⇒/.test(f)){
      const partes=f.split(/,\s*(?:\\ |\\quad|\\;|\\,)?\s*(?=[^,]*=)/).map(x=>x.trim()).filter(Boolean);
      if(partes.length>1&&partes.every(esIgualdad))return t.replace(inl[0][0],`\\[\\begin{aligned}${partes.map(x=>x.replace(/(?<![<>=!])=(?!=)/,'&=')).join('\\\\ ')}\\end{aligned}\\]`)}}
  if(inl.length>1&&fs.length===inl.length&&inl.filter(m=>esIgualdad(m[1])).length>=2&&inl.every(m=>!/\\Rightarrow|⇒|\\begin\{/.test(m[1]))){
    // textos entre fórmulas: deben ser rótulos cortos (si no, son frases y se deja igual)
    const entre=[];for(let k=0;k<inl.length-1;k++)entre.push(t.slice(inl[k].index+inl[k][0].length,inl[k+1].index));
    if(entre.every(x=>rotulo(x)!==null)){
      const antes=t.slice(0,inl[0].index),despues=t.slice(inl.at(-1).index+inl.at(-1)[0].length);
      const r0=rotulo(antes),rf=rotulo(despues);
      // el rótulo que va DESPUÉS de una fórmula («(arriba)») o ANTES («x:», «abajo:»)
      const despuesDe=x=>/^\s*\(/.test(x),filas=inl.map((m,k)=>{
        const pre=k===0?(r0&&/:\s*$/.test(antes)?r0:''):(!despuesDe(entre[k-1])?rotulo(entre[k-1]):'');
        const post=k<inl.length-1?(despuesDe(entre[k])?rotulo(entre[k].split(/[,;]/)[0]):''):(rf&&despuesDe(despues)?rf:'');
        const f=m[1].includes('=')?m[1].replace(/(?<![<>=!])=(?!=)/,'&='):`&${m[1]}`;
        return `${pre?`\\text{${limpioKatex(pre)}:}\\ `:''}${f}${textoKatex(post)}`});
      const ini=r0&&/:\s*$/.test(antes)?'':antes,fin=rf&&despuesDe(despues)?'':despues;
      return `${ini}\\[\\begin{aligned}${filas.join('\\\\ ')}\\end{aligned}\\]${fin}`}
  }
  return t;
}
// Lista de igualdades en texto plano (sin fórmulas): un bloque de datos, una por renglón
function bloqueDatos(como){
  const t=String(como);
  if(formulas(t).length||/<(?!\/?mark\b)[^>]+>/.test(t)||t.includes('⇒'))return t;
  // por coma o punto y coma; solo si no hay, por « y » entre un valor y la siguiente igualdad («x = 2 y x = 5»)
  let partes=t.split(/\s*[;,]\s+(?=[^,;]*=)/).map(x=>x.trim()).filter(Boolean);
  if(partes.length===1)partes=t.split(/(?<=[\d)\w>]\s*)\s+y\s+(?=[^=]*=)(?=\S+\s*=)/).map(x=>x.trim()).filter(Boolean);
  if(partes.length>1&&partes.every(esIgualdad)&&!/[⇒→]/.test(t))return `<div class="paso-datos">${partes.join('<br>')}</div>`;
  return t;
}

// Un paso → uno o más pasos con una acción cada uno (recursivo: cada trozo se vuelve a revisar)
function procesar(x0,esUltimo,prof=0){
  if(!x0||typeof x0!=='object')return [x0];
  const x={...x0,como:bloqueDatos(juntarIgualdades(x0.como??''))},res=x.res;
  const fs=formulas(x.como);let trozos=null;
  if(!fs.length&&/⇒|→/.test(x.como)&&!/<(?!\/?mark\b)[^>]+>/.test(x.como)&&!/→\s*(True|False)\b/.test(x.como)){
    const partes=String(x.como).split(/\s*[⇒→]\s*/).filter(Boolean);
    if(partes.length>1)trozos=partes.map((f,k)=>({f,como:f}));
  }else{
    const conFlecha=fs.find(m=>partirFlechas(m[1]??m[2]).length>1);
    if(conFlecha){const display=conFlecha[2]!==undefined,partes=partirFlechas(conFlecha[1]??conFlecha[2]);
      const antes=x.como.slice(0,conFlecha.index),despues=x.como.slice(conFlecha.index+conFlecha[0].length),env=f=>display?`\\[${f}\\]`:`\\(${f}\\)`;
      trozos=partes.map((f,k)=>({f,como:`${k===0?antes:''}${env(f)}${k===partes.length-1?despues:''}`.trim()}))}
  }
  if(!trozos||prof>4)return [x];
  return trozos.flatMap(({f,como},k)=>{
    const ult=k===trozos.length-1;
    const b=k===0?{...x,como}:{que:nombreDespeje(String(f).replace(/<[^>]+>/g,'').replace(/\\cambio\{([^}]*)\}/g,'$1')),como,porque:'Una operación a la vez: así se ve de dónde sale cada número.'};
    delete b.res;if(k>0)delete b.ojo;
    if(esUltimo&&ult&&res!==undefined)b.res=res;
    return procesar(b,esUltimo&&ult,prof+1);
  });
}
export function desglosarPasos(pasos){
  if(!Array.isArray(pasos))return {pasos,mapa:null};
  const out=[],mapa=[];
  pasos.forEach((x,i)=>{mapa[i]=out.length;out.push(...procesar(x,i===pasos.length-1))});
  return {pasos:out,mapa};
}

// Operaciones de un paso (para la comprobación de npm run principiante)
const plano=t=>String(t??'').replace(/<[^>]+>/g,' ');
export function acciones(x){
  if(!x||typeof x!=='object')return {iguales:1,ys:0};
  // el código (Python, fórmulas de Excel) no son operaciones del paso: es lo que se lee
  const como=String(x.como??'').replace(/<(code|pre)\b[\s\S]*?<\/\1>/g,' §BLOQUE§ ').replace(/<div class="paso-datos">[\s\S]*?<\/div>/g,' §BLOQUE§ ').replace(/\\\[[\s\S]*?\\\]/g,' §BLOQUE§ ')
    .replace(/\\\(([\s\S]+?)\\\)/g,(m,f)=>/\\begin\{/.test(f)?' §BLOQUE§ ':` ${f} `);
  const texto=plano(como).replace(/\\Rightarrow|\\implies/g,'⇒').replace(/(^|\s)=[A-ZÁÉÍÓÚ][\wÁÉÍÓÚ.]*\([^—]*\)/g,' §BLOQUE§ ');
  const iguales=texto.split(/⇒|→|<br\s*\/?>|;|,(?![^(]*\))|\s(?:y|and)\s/).filter(s=>esIgualdad(s)&&!/^\s*§BLOQUE§\s*$/.test(s)).length;
  const ys=(plano(x.que).match(/\s(?:y|and)\s+(?:luego\s+)?[a-záéíóú]+(?:a|e|as|es|en|an|r)\b/gi)||[]).length;
  return {iguales,ys};
}
// p (opcional): la pregunta; un paso que solo vuelve a leer el enunciado («Lee el caso: …») no hace operaciones
const normal=t=>plano(t).replace(/\s+/g,' ').trim().toLowerCase();
export const variasAcciones=(x,p)=>{
  if(p&&x?.como&&normal(x.como).length>=12&&normal(p.enunciado).includes(normal(x.como).slice(0,60)))return false;
  const a=acciones(x);return a.iguales>1||a.ys>1};
