/* Formato de fórmulas para los generadores (TeX para KaTeX y texto para escribir). Sin DOM. */
import {mcd} from './verificar.js';

// Suma de términos [[coef, 'x'], [coef, '']] con signos correctos: 3x - 5, -x + 2
export function lineal(terminos,{tex=true}={}){
  let s='';
  for(const [c,v] of terminos){
    if(!c)continue;
    const abs=Math.abs(c),txt=v?(abs===1?v:`${abs}${v}`):String(abs);
    s+=s?(c<0?' - ':' + ')+txt:(c<0?'-':'')+txt;
  }
  return s||'0';
}
// Polinomio de coeficientes [a0, a1, a2…] en x, de mayor a menor grado: 3x^{2} - 2x + 1
export function polinomio(coefs,{tex=true,v='x'}={}){
  const t=[];
  for(let k=coefs.length-1;k>=0;k--){const c=coefs[k];if(!c)continue;
    t.push([c,k===0?'':k===1?v:tex?`${v}^{${k}}`:`${v}^${k}`]);}
  return lineal(t);
}
// Fracción en TeX o texto, simplificada
export function frac(n,d=1,{tex=true}={}){
  if(d<0){n=-n;d=-d}const g=mcd(n,d);n/=g;d/=g;
  if(d===1)return String(n);
  return tex?`${n<0?'-':''}\\frac{${Math.abs(n)}}{${d}}`:`${n}/${d}`;
}
export const par=x=>x<0?`(${x})`:String(x);
export const mat=(M)=>`\\begin{pmatrix}${M.map(f=>f.join(' & ')).join(' \\\\ ')}\\end{pmatrix}`;
export const vec=v=>`(${v.join(', ')})`;
