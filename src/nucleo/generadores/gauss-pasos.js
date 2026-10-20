/* Eliminación de Gauss explicada para principiantes, con los números de cada ejercicio (sin DOM).
   Cada operación entre filas se escribe en palabras («Multiplica la fila 1 por −4 y réstasela a la fila 2»), con la
   cuenta hecha con los números reales y la fila que resulta; luego se despeja de abajo hacia arriba sustituyendo.
   Solo enteros: si el pivote no divide, se multiplican las dos filas (y se simplifica entre el MCD). */
import {lineal,par} from './formato.js';
import {paso,final,c} from './pasos.js';

const mcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1};
const VARS=['x','y','z'];
const lado=(f,v)=>lineal(f.slice(0,-1).map((x,j)=>[x,v[j]]))||'0';
export const ecuacion=(f,v)=>`${lado(f,v)} = ${f.at(-1)}`;
const sig=k=>k<0?`(${k})`:String(k);
const ordinal=i=>`fila ${i+1}`;

// Pasos de la eliminación y la sustitución hacia atrás. F: filas [coeficientes…, resultado]; X: solución entera
export function pasosGauss(F,X){
  const d=F.length,v=VARS.slice(0,d),R=F.map(f=>[...f]),pasos=[],ops=[];
  for(let col=0;col<d-1;col++){
    if(R[col][col]===0){const s=R.findIndex((f,i)=>i>col&&f[col]!==0);
      [R[col],R[s]]=[R[s],R[col]];
      const t=`Intercambia la ${ordinal(col)} y la ${ordinal(s)}`;ops.push(t);
      pasos.push(paso(t,`Ahora la ${ordinal(col)} es \\(${ecuacion(R[col],v)}\\)`,`La ${ordinal(col)} no tenía ${v[col]}: para usarla como pivote necesitamos una fila que sí la tenga.`))}
    for(let i=col+1;i<d;i++){
      const a=R[col][col],b=R[i][col];if(b===0)continue;
      let nueva,texto,cuenta;
      if(b%a===0){const k=b/a;nueva=R[i].map((x,j)=>x-k*R[col][j]);
        texto=k===1?`Réstale la ${ordinal(col)} a la ${ordinal(i)}`:k===-1?`Súmale la ${ordinal(col)} a la ${ordinal(i)}`:`Multiplica la ${ordinal(col)} por ${String(k).replace('-','−')} y réstasela a la ${ordinal(i)}`;
        cuenta=Math.abs(k)===1?`(${lado(R[i],v)}) ${k===1?'-':'+'} (${lado(R[col],v)}) = ${R[i].at(-1)} ${k===1?'-':'+'} ${sig(R[col].at(-1))}`
          :`(${lado(R[i],v)}) - ${sig(k)}\\cdot(${lado(R[col],v)}) = ${R[i].at(-1)} - ${sig(k)}\\cdot${sig(R[col].at(-1))}`;
      }else{const g=mcd(a,b),m1=a/g,m2=b/g;nueva=R[i].map((x,j)=>m1*x-m2*R[col][j]);
        texto=`Multiplica la ${ordinal(i)} por ${String(m1).replace('-','−')} y ${m2<0?`súmale ${-m2}`:`réstale ${m2}`} ${Math.abs(m2)===1?'vez':'veces'} la ${ordinal(col)}`;
        cuenta=`${sig(m1)}\\cdot(${lado(R[i],v)}) - ${sig(m2)}\\cdot(${lado(R[col],v)}) = ${sig(m1)}\\cdot${sig(R[i].at(-1))} - ${sig(m2)}\\cdot${sig(R[col].at(-1))}`}
      // números más chicos: se divide la fila entre el MCD de sus números
      const g=nueva.reduce((s,x)=>mcd(s,x),0);let simpl='';
      if(g>1){nueva=nueva.map(x=>x/g);simpl=` y, dividiendo todo entre ${g}, \\(${ecuacion(nueva,v)}\\)`}
      ops.push(texto);
      pasos.push(paso(texto,`\\(${cuenta}\\)<br>Queda \\(${c(ecuacion(nueva.map((x,j)=>x),v))}\\)${simpl}`,
        `Así la ${v[col]} desaparece de la ${ordinal(i)} (su coeficiente queda en 0). Sumar o restar ecuaciones no cambia la solución.`,
        {ojo:'Opera los dos lados: también el número de la derecha.'}));
      R[i]=nueva;
    }
  }
  // sustitución hacia atrás
  const val={};
  for(let i=d-1;i>=0;i--){
    const f=R[i],l=v[i],conocidos=v.slice(i+1).filter((_,j)=>f[i+1+j]!==0);
    const sust=conocidos.length?`\\(${lado(f,v).replace(/[yz]/g,m=>m in val?`(${val[m]})`:m).replace(/(\d)\(/g,'$1\\cdot(')} = ${f.at(-1)}\\)`:'';
    const resto=conocidos.reduce((s,m)=>s+f[v.indexOf(m)]*val[m],0),rhs=f.at(-1)-resto;
    val[l]=X[i];
    const despeje=f[i]===1?'':`\\(${f[i]===-1?'-':f[i]}${l} = ${rhs}\\) ⇒ `;
    const como=`${sust?`${sust} ⇒ `:''}${despeje}\\(${l} = ${c(X[i])}\\)`;
    const solo=!conocidos.length;
    const porque=solo||i===d-1?`La ${ordinal(i)} ya tiene una sola letra: se despeja dividiendo.`:`Ya conoces ${conocidos.join(' y ')}: ${conocidos.length>1?'sustitúyelas':'sustitúyela'} en la ${ordinal(i)} y despeja ${l}.`;
    if(i>0)pasos.push(paso(solo?`Despeja ${l} de la ${ordinal(i)}`:`Sustituye en la ${ordinal(i)} y despeja ${l}`,como,porque));
    else pasos.push(final(solo?`Despeja ${l} de la ${ordinal(0)}`:`Sustituye en la ${ordinal(0)} y despeja ${l}`,`${como}<br>Solución: \\(${v.map((m,j)=>`${m} = ${X[j]}`).join(',\\ ')}\\)`,porque,X.join(', ')));
  }
  const ultima=VARS[d-1];
  const idea=`Queremos que la última ecuación se quede solo con ${ultima}, para despejarla fácil. Para eso usamos la ${ordinal(0)} para borrar la x de las demás${d===3?' y luego la fila 2 para borrar la y de la fila 3':''}; después subimos sustituyendo.`;
  const primero=pasos.find(x=>/Multiplica|Réstale|Súmale|Intercambia/.test(x.que));
  return {pasos,idea,primero:primero?`<b>Paso 1 · ${primero.que}:</b> ${primero.como}`:null,ops};
}
