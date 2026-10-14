/* Camino de un tema: estado de cada habilidad, cofres de repaso (cada 3 habilidades) y el jefe del final.
   - Habilidad: la primera está abierta; las demás se abren al practicar la anterior. Estados: dominado, actual, pendiente, bloqueado.
   - Cofre: repaso intercalado de las 3 habilidades anteriores; se abre cuando las tres ya se practicaron.
   - Jefe: mezcla cronometrada de todo el tema; se abre cuando todas sus habilidades se practicaron. */
export const CADA=3;
const dominada=(d,h)=>!!d.lecciones[h.id]?.dominada;
export const practicada=(d,h)=>!!d.lecciones[h.id]&&(d.lecciones[h.id].sesiones>0||d.lecciones[h.id].intentos>0||d.lecciones[h.id].ult?.length>0||dominada(d,h));
const abierta=(hs,i,d)=>i===0||practicada(d,hs[i-1])||practicada(d,hs[i]);

export function estadosTema(t,d){
  const hs=t.lecciones,actual=hs.find((h,i)=>!dominada(d,h)&&abierta(hs,i,d));
  return Object.fromEntries(hs.map((h,i)=>[h.id,dominada(d,h)?'dominado':h===actual?'actual':abierta(hs,i,d)?'pendiente':'bloqueado']));
}
// Cofres del tema: {k, id, habilidades}
export function cofresTema(t){
  const hs=t.lecciones,c=[];
  for(let i=CADA;i<=hs.length;i+=CADA)c.push({k:c.length+1,id:`${t.id}-${c.length+1}`,habilidades:hs.slice(i-CADA,i)});
  return c;
}
export const cofreAbierto=(c,d)=>c.habilidades.every(h=>practicada(d,h));
export const jefeAbierto=(t,d)=>t.lecciones.length>=2&&t.lecciones.every(h=>practicada(d,h));
export const jefeVencido=(t,d)=>(d.extra.jefes?.[t.id]?.mejor||0)>=0.8;
// La siguiente habilidad para practicar en el tema (la actual), o null si está todo dominado
export const habilidadActual=(t,d)=>{const e=estadosTema(t,d);return t.lecciones.find(h=>e[h.id]==='actual')||null};
