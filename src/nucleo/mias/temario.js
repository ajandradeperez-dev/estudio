/* Leer un temario escrito o pegado (sin IA): una línea por unidad, tema o subtema.
   Reconoce: "Unidad 2: Derivadas" / "Tema 3" / "Módulo IV" / "Bloque 1" / "Capítulo 5" (unidades), numeraciones "1." "1.1" "1.1.1",
   romanos "I." "II)", letras "a)" "b.", y viñetas "-", "•", "*", "·", "o", "▪". Sin DOM: también lo usa npm run revisar.
   leerTemario(texto) → [{titulo, temas:[{titulo, subtemas:[…]}]}] */
const ROMANO=/^(?=[IVXLC])(C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
const PALABRA_UNIDAD=/^(unidad|tema|m[oó]dulo|bloque|cap[ií]tulo|parcial|secci[oó]n|eje|parte)\s+([0-9]+|[IVXLC]+)\b[\s.:)\-–—]*/i;
const limpiar=s=>s.replace(/\s+/g,' ').replace(/^[\s.:)\-–—]+|[\s.;,:]+$/g,'').trim();

// Tipo de cada línea: {nivel: 'u' (palabra de unidad) | número de grupos (1 → "1.", 2 → "1.1") | 'v' (viñeta o letra) | 'p' (texto sin marca), titulo}
function clasificar(linea){
  const l=linea.replace(/\t/g,'    ');const sangria=l.match(/^\s*/)[0].length,t=l.trim();
  if(!t)return null;
  let m;
  if((m=t.match(PALABRA_UNIDAD))){const resto=limpiar(t.slice(m[0].length));return {nivel:'u',titulo:resto||limpiar(t),sangria,etiqueta:limpiar(m[0])}}
  if((m=t.match(/^(\d+(?:\.\d+)*)\.?[)\s.:\-–—]+(.+)$/))&&!/^\d+(\.\d+)?\s*(%|x|kg|m|cm|h|min)\b/i.test(t))return {nivel:m[1].split('.').length,titulo:limpiar(m[2]),sangria};
  if((m=t.match(/^([IVXLC]+)[.)\-–:]\s*(.+)$/i))&&ROMANO.test(m[1]))return {nivel:1,titulo:limpiar(m[2]),sangria,romano:true};
  if((m=t.match(/^[a-zñ][.)]\s+(.+)$/i)))return {nivel:'v',titulo:limpiar(m[1]),sangria};
  if((m=t.match(/^[-•*·▪◦●o–—>]\s+(.+)$/)))return {nivel:'v',titulo:limpiar(m[1]),sangria};
  return {nivel:'p',titulo:limpiar(t),sangria};
}

export function leerTemario(texto){
  const ls=String(texto??'').replace(/\r/g,'').split('\n').map(clasificar).filter(x=>x&&x.titulo);
  if(!ls.length)return [];
  const hayUnidad=ls.some(x=>x.nivel==='u');
  const nums=ls.filter(x=>typeof x.nivel==='number').map(x=>x.nivel);
  const minNum=nums.length?Math.min(...nums):null;
  // ¿Qué marca indica unidad y cuál tema?
  // - Con palabras de unidad: unidad = esas líneas; tema = el siguiente nivel; subtema = lo demás
  // - Solo números: si hay dos niveles (1. y 1.1), unidad = el menor; si hay uno solo, todo es una unidad "Temario"
  const dosNiveles=minNum!==null&&nums.some(n=>n>minNum);
  const unidades=[];let u=null,t=null;
  const nuevaUnidad=titulo=>{u={titulo,temas:[]};unidades.push(u);t=null};
  const nuevoTema=titulo=>{if(!u)nuevaUnidad('Temario');t={titulo,subtemas:[]};u.temas.push(t)};
  const subtema=titulo=>{if(!t)nuevoTema(titulo);else t.subtemas.push(titulo)};
  let sangriaTema=null;
  for(const x of ls){
    if(x.nivel==='u'){nuevaUnidad(x.titulo);sangriaTema=null;continue}
    if(typeof x.nivel==='number'){
      if(hayUnidad){x.nivel-(minNum??1)===0?nuevoTema(x.titulo):subtema(x.titulo)}
      else if(dosNiveles){x.nivel===minNum?nuevaUnidad(x.titulo):x.nivel===minNum+1?nuevoTema(x.titulo):subtema(x.titulo)}
      else nuevoTema(x.titulo);
      sangriaTema=null;continue;
    }
    if(x.nivel==='v'){
      // una viñeta debajo de una unidad sin temas numerados es un tema; debajo de un tema, un subtema
      if(!t)nuevoTema(x.titulo),sangriaTema=x.sangria;
      else if(t&&sangriaTema!==null&&x.sangria<=sangriaTema)nuevoTema(x.titulo);
      else subtema(x.titulo);
      continue;
    }
    // texto sin marca: con estructura, más sangría que el tema = subtema; si no, un tema más
    if(t&&x.sangria>(sangriaTema??0)+1)subtema(x.titulo);
    else nuevoTema(x.titulo),sangriaTema=x.sangria;
  }
  return unidades.filter(x=>x.temas.length||x.titulo).map(x=>({...x,temas:x.temas.length?x.temas:[{titulo:x.titulo,subtemas:[]}]}));
}
