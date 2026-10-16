/* Comparar respuestas escritas (sin DOM: lo usan los ejercicios y npm run revisar).
   Sin mayúsculas, acentos, espacios sobrantes, ¿? ni punto final; comas opcionales; números por valor (x = 6, 0,5, 1/2). */
const normal=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  .replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"').replace(/[−–]/g,'-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,d=>'^'+[...d].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''))
  .replace(/^[¿¡\s]+/,'').replace(/[.!?\s]+$/,'').replace(/\s+/g,' ').trim();
const sinEspacios=s=>s.replace(/\s/g,'');
const sinPuntuacion=s=>s.replace(/[,;:]/g,'').replace(/\s+/g,' ');
const numero=s=>{
  const t0=normal(s).replace(/^[a-z]\s*=\s*/,'');
  if(/,\s/.test(t0))return null; // "3, 2" es una lista o un par, no el decimal 3,2
  const t=sinEspacios(t0).replace(',','.');
  if(/^[+-]?\d+(\.\d+)?$/.test(t))return parseFloat(t);
  const f=t.match(/^([+-]?\d+)\/(\d+)$/); return f&&+f[2]?f[1]/f[2]:null;
};
export function coincide(valor,respuestas){
  const v=normal(valor),n=numero(valor);
  return respuestas.some(r=>{const a=normal(r),m=numero(r);
    return a===v||sinEspacios(a)===sinEspacios(v)||sinPuntuacion(a)===sinPuntuacion(v)||(n!=null&&m!=null&&Math.abs(n-m)<1e-9)});
}

/* Errores de dedo (nomonal → nominal): una segunda oportunidad para respuestas en español hechas de palabras.
   Por palabra: 1 letra cambiada, de más, de menos o dos letras volteadas (2 si la palabra tiene 10 letras o más), solo en
   palabras de 5 letras o más y con las dos primeras letras iguales (así «asimétrico» nunca pasa por «simétrico»).
   Nunca con números, código o fórmulas. Devuelve la opción correcta que se quiso escribir, o null. */
const palabras=s=>normal(s).replace(/[,;:"'«»]/g,' ').replace(/\s+/g,' ').trim().split(' ');
function distancia(a,b,max){
  if(Math.abs(a.length-b.length)>max)return max+1;
  const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){const c=a[i-1]===b[j-1]?0:1;
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}
  return d[a.length][b.length];
}
const soloPalabras=s=>!/[\d=()[\]{}<>$#@/\*+^_|]/.test(String(s));
export function casiIgual(entrada,opciones,evitar=[]){
  if(!soloPalabras(entrada))return null;
  const e=palabras(entrada);
  const cerca=r=>{if(!soloPalabras(r))return false;const w=palabras(r);if(w.length!==e.length)return false;let typo=false;
    for(let i=0;i<w.length;i++){if(w[i]===e[i])continue;const L=w[i].length;if(L<5||w[i].slice(0,2)!==e[i].slice(0,2))return false;
      if(distancia(w[i],e[i],L>=10?2:1)>(L>=10?2:1))return false;typo=true}
    return typo};
  if(evitar.some(v=>v!=null&&(coincide(entrada,[String(v)])||cerca(String(v)))))return null;
  return opciones.find(r=>r!=null&&cerca(String(r)))??null;
}
