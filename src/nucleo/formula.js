/* Fórmulas legibles con KaTeX (empaquetado con la app: el service worker lo guarda y funciona sin conexión).
   En los textos, las fórmulas van entre \( … \) (en línea) o \[ … \] (en bloque). El resto del HTML no se toca. */
import katex from 'katex';
import 'katex/dist/katex.min.css';

// \cambio{…} resalta lo que cambia en un paso (clase .cambio, color del área); solo se permite \htmlClass
export const OPCIONES={throwOnError:false,strict:false,output:'htmlAndMathml',trust:ctx=>ctx.command==='\\htmlClass',macros:{'\\cambio':'\\htmlClass{cambio}{#1}'}};
const cache=new Map();
export function tex(s,bloque=false){
  const k=(bloque?'B':'L')+s;
  if(!cache.has(k)){
    let html;try{html=katex.renderToString(s,{displayMode:bloque,...OPCIONES})}catch(e){html=s}
    if(cache.size>500)cache.clear();
    cache.set(k,html);
  }
  return cache.get(k);
}
export const conFormulas=html=>String(html??'').replace(/\\\[([\s\S]+?)\\\]/g,(_,s)=>tex(s,true)).replace(/\\\(([\s\S]+?)\\\)/g,(_,s)=>tex(s));
