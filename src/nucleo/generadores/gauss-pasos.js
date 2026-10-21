/* Eliminación de Gauss explicada para principiantes, con los números de cada ejercicio (sin DOM).
   UNA acción por paso: la frase arriba (que) y la fórmula aparte, en bloque (\[ … \] en como: procedimiento.js la pinta
   en su propio renglón, centrada y sin partirse):
     1. Multiplica la fila 1 por −2            → −2x − 6y = −30
     2. Escribe las dos filas una debajo de otra (alineadas por el =)
     3. Resta término a término                → x: −2x − (−2x) = 0 · y: y − (−6y) = 7y · número: 5 − (−30) = 35
     4. Queda la nueva fila 2                  → 7y = 35   (y, si hace falta, otro paso para simplificar)
   y luego, de abajo hacia arriba: sustituir lo que ya se conoce, pasar los números al otro lado y dividir, cada uno en su
   paso. Solo enteros: si el pivote no divide, se multiplican las dos filas. `pista2` = cuántos pasos tiene la primera
   eliminación (lo que muestra la pista de nivel 2, de uno en uno). */
import {lineal} from './formato.js';
import {paso,final,c} from './pasos.js';

const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1};
const VARS=['x','y','z'];
const lado=(f,v)=>lineal(f.slice(0,-1).map((x,j)=>[x,v[j]]))||'0';
export const ecuacion=(f,v)=>`${lado(f,v)} = ${f.at(-1)}`;
const sig=k=>k<0?`(${k})`:String(k);
const menos=k=>String(k).replace('-','−');
const ordinal=i=>`fila ${i+1}`;
// Un término «coef·letra» como se escribe (para las restas término a término)
const termino=(k,l)=>l?(k===0?'0':k===1?l:k===-1?`-${l}`:`${k}${l}`):String(k);
const parT=(k,l)=>k<0?`(${termino(k,l)})`:termino(k,l);
// Un paso: frase + fórmula en bloque
const P=(que,formula,porque,extra={})=>paso(que,`\\[${formula}\\]`,porque,extra);
const alineado=filas=>`\\begin{aligned}${filas.join('\\\\ ')}\\end{aligned}`;

export function pasosGauss(F,X){
  const d=F.length,v=VARS.slice(0,d),R=F.map(f=>[...f]),pasos=[];let pista2=null;
  for(let col=0;col<d-1;col++){
    if(R[col][col]===0){const s=R.findIndex((f,i)=>i>col&&f[col]!==0);
      [R[col],R[s]]=[R[s],R[col]];
      pasos.push(P(`Intercambia la ${ordinal(col)} y la ${ordinal(s)}`,`\\text{fila ${col+1}: } ${ecuacion(R[col],v)}`,`La ${ordinal(col)} no tenía ${v[col]}: para usarla para borrar, necesitamos una fila que sí la tenga.`))}
    for(let i=col+1;i<d;i++){
      const a=R[col][col],b=R[i][col];if(b===0)continue;
      const ini=pasos.length;
      // a la fila i (por m1) se le resta la fila col (por m2)
      let m1=1,m2;if(b%a===0)m2=b/a;else{const g=mcd(a,b);m1=a/g;m2=b/g}
      const N=R[i].map(x=>m1*x),M=R[col].map(x=>m2*x);
      if(m1!==1)pasos.push(P(`Multiplica la ${ordinal(i)} por ${menos(m1)}`,alineado([`${m1}\\cdot(${lado(R[i],v)}) &= ${m1}\\cdot${sig(R[i].at(-1))}`,`${lado(N,v)} &= ${c(N.at(-1))}`]),
        `Así la ${v[col]} de las dos filas tendrá el mismo número y se podrá borrar restando.`));
      if(m2!==1)pasos.push(P(`Multiplica la ${ordinal(col)} por ${menos(m2)}`,alineado([`${sig(m2)}\\cdot(${lado(R[col],v)}) &= ${sig(m2)}\\cdot${sig(R[col].at(-1))}`,`${lado(M,v)} &= ${c(M.at(-1))}`]),
        `Así su ${v[col]} queda igual a la de la ${ordinal(i)}: al restar, se va.`));
      const etq=(n,m)=>m===1?`\\text{(fila ${n})}`:`\\text{(fila ${n}} \\times ${sig(m)}\\text{)}`;
      pasos.push(P('Escribe las dos filas una debajo de la otra',alineado([`${lado(N,v)} &= ${N.at(-1)} \\quad ${etq(i+1,m1)}`,`${lado(M,v)} &= ${M.at(-1)} \\quad ${etq(col+1,m2)}`]),
        'Así cada letra queda en su columna y la resta se hace columna por columna.'));
      const nueva=N.map((x,j)=>x-M[j]);
      const filas=[...v.map((l,j)=>(N[j]||M[j])?`${l}&:\\ ${termino(N[j],l)} - ${parT(M[j],l)} = ${j===col?c(termino(nueva[j],l)):termino(nueva[j],l)}`:null).filter(Boolean),
        `\\text{número}&:\\ ${N.at(-1)} - ${sig(M.at(-1))} = ${nueva.at(-1)}`];
      pasos.push(P(`Resta término a término (de arriba menos de abajo)`,alineado(filas),
        `Así la ${v[col]} desaparece de la ${ordinal(i)} (queda 0) y la ecuación tiene una letra menos.`,{ojo:'Resta también el número de la derecha, y cuida los signos: menos por menos da más.'}));
      pasos.push(P(`Queda la nueva ${ordinal(i)}`,c(ecuacion(nueva,v)),`Ya no tiene ${v[col]}.`));
      const g=nueva.reduce((s,x)=>mcd(s,x),0);let fila=nueva;
      if(g>1){fila=nueva.map(x=>x/g);pasos.push(P(`Divide la ${ordinal(i)} entre ${g}`,ecuacion(fila,v),'Con números más chicos es más fácil seguir (dividir los dos lados no cambia la solución).'))}
      R[i]=fila;
      if(!pista2)pista2=pasos.length-ini;
    }
  }
  // sustitución hacia atrás: sustituir, pasar al otro lado y dividir, cada uno en su paso
  const val={};
  for(let i=d-1;i>=0;i--){
    const f=R[i],l=v[i],conocidos=v.slice(i+1).filter((_,j)=>f[i+1+j]!==0);
    const resto=conocidos.reduce((s,m)=>s+f[v.indexOf(m)]*val[m],0),rhs=f.at(-1)-resto,coef=f[i];
    const conVal=lado(f,v).replace(/[yz]/g,m=>m in val?`(${val[m]})`:m).replace(/(\d)\(/g,'$1\\cdot(');
    const sub=[];
    if(conocidos.length){
      sub.push([`Sustituye ${conocidos.map(m=>`${m} = ${val[m]}`).join(' y ')} en la ${ordinal(i)}`,`${conVal} = ${f.at(-1)}`,`Ya conoces ${conocidos.join(' y ')}: con su valor, la ${ordinal(i)} queda con una sola letra.`]);
      sub.push(['Pasa los números al otro lado',`${termino(coef,l)} = ${f.at(-1)} - ${sig(resto)} = ${rhs}`,'Lo que suma pasa restando (y al revés).']);
    }
    if(coef!==1)sub.push([`Divide entre ${menos(coef)}`,`${l} = \\dfrac{${rhs}}{${coef}} = ${c(X[i])}`,`Para dejar ${l} sola.`]);
    else if(!conocidos.length)sub.push([`La ${ordinal(i)} ya dice cuánto vale ${l}`,`${l} = ${c(X[i])}`,'Ya está despejada.']);
    else sub[sub.length-1][1]+=`\\;\\Rightarrow\\; ${l} = ${c(X[i])}`;
    val[l]=X[i];
    sub.forEach(([q,f2,po],k)=>{
      if(i===0&&k===sub.length-1)pasos.push(final(q,`\\[\\begin{gathered}${f2}\\\\[4pt] \\text{Solución: } ${v.map((m,j)=>`${m} = ${X[j]}`).join(',\\ ')}\\end{gathered}\\]`,po,X.join(', ')));
      else pasos.push(P(q,f2,po));
    });
  }
  const ultima=VARS[d-1];
  const idea=`Queremos que la última ecuación se quede solo con ${ultima}, para despejarla fácil. Para eso usamos la ${ordinal(0)} para borrar la x de las demás${d===3?' y luego la fila 2 para borrar la y de la fila 3':''}; después subimos sustituyendo.`;
  return {pasos,idea,pista2:pista2||1};
}
