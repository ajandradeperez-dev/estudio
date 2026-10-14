/* Números aleatorios con semilla (mulberry32): el mismo número de semilla produce el mismo ejercicio,
   así se puede reproducir y probar. crearRng(semilla) → {sig, entero, elegir, barajar, signo, prob, semilla} */
export function crearRng(semilla=(Math.random()*2**32)>>>0){
  let a=semilla>>>0;
  const sig=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
  const entero=(min,max)=>min+Math.floor(sig()*(max-min+1));
  return {
    semilla,sig,entero,
    // entero distinto de cero
    noCero:(min,max)=>{let x;do x=entero(min,max);while(x===0);return x},
    elegir:arr=>arr[Math.floor(sig()*arr.length)],
    barajar:arr=>{const b=[...arr];for(let i=b.length-1;i>0;i--){const j=Math.floor(sig()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b},
    signo:()=>sig()<0.5?-1:1,
    prob:p=>sig()<p
  };
}
