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
