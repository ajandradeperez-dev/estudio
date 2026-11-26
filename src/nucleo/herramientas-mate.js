/* Conecta los ejercicios de Matemáticas con las herramientas del dibujo (PROMPT-ALGEBRA-PULIR, parte 3):
   - «▦ Resolver en el cuaderno» (Gauss, Gauss-Jordan, inversa, determinantes, Cramer, LU…): la matriz del ejercicio
     (la aumentada si es un sistema) queda en el editor de matrices, lista para ⇄ Operación de renglón en «Lo hago yo»;
   - «📈 Verlo en el plano» (vectores, combinaciones, transformaciones, rectas de un sistema 2×2): los vectores o las
     rectas del ejercicio en un plano cartesiano editable.
   Lee el enunciado tal como lo ve el alumno (como la auditoría). herramientaDe(p) → {tipo, …} | null. Sin DOM. */
import {matricesTex,sistemaTex} from './generadores/auditoria.js';

const MATRIZ=/^al\/(gauss|gauss-jordan|inversa|determinante|cramer|lu|rango|valores-propios|diagonalizacion|matriz-producto|independencia|nucleo-imagen)$|^alg\/sistema-(2x2|3x3)$/;
const PLANO=/^al\/(vector-magnitud|vector-operaciones|producto-punto|angulo|combinacion-lineal|transformaciones|matriz-transformacion|cambio-base|gram-schmidt|minimos-cuadrados)$|^alg\/sistema-2x2$/;
const numTxt=x=>String(Math.round(x*1e6)/1e6).replace('-','−');
const vectores2=t=>[...String(t).matchAll(/(?:^|[^\w])([a-zA-Z](?:_\d)?|[a-z]?)\s*=?\s*\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g)].map(m=>({nombre:(m[1]||'').trim(),v:[+m[2],+m[3]]}));

export function herramientaDe(p){
  if(!p?.gen||!p.enunciado)return null;
  const en=String(p.enunciado),r=[];
  if(MATRIZ.test(p.gen)){
    const sis=sistemaTex(en);
    if(sis&&sis.A.length<=4&&sis.n<=4)r.push({tipo:'matriz',titulo:'▦ Resolver en el cuaderno',celdas:sis.A.map((f,i)=>[...f,sis.b[i]].map(numTxt)),aumentada:sis.n});
    else{const m=matricesTex(en).find(x=>x.M&&x.M.length<=5&&x.M[0].length<=6);
      if(m)r.push({tipo:'matriz',titulo:'▦ Resolver en el cuaderno',celdas:m.M.map(f=>f.map(numTxt)),aumentada:m.aumentada?m.M[0].length-1:null})}
  }
  if(PLANO.test(p.gen)){
    const sis=sistemaTex(en);
    if(sis&&sis.n===2&&sis.A.every(f=>f[1]!==0)){
      const rectas=sis.A.map(([a,b],i)=>`${numTxt(-a/b)}x ${sis.b[i]/b<0?'-':'+'} ${numTxt(Math.abs(sis.b[i]/b))}`.replace(/−/g,'-'));
      r.push({tipo:'plano',titulo:'📈 Verlo en el plano',objetos:rectas.map((expr,i)=>({k:'funcion',expr,color:i?'#dc2626':'#2563eb'})),limite:10});
    }else{
      const vs=vectores2(en).filter(x=>x.v.every(Number.isFinite)).slice(0,4);
      const M=matricesTex(en).find(x=>x.M&&x.M.length===2&&x.M[0].length===2)?.M;
      if(M&&vs.length===1&&!/\\begin\{cases/.test(en)){const v=vs[0].v,w=[M[0][0]*v[0]+M[0][1]*v[1],M[1][0]*v[0]+M[1][1]*v[1]];vs.push({nombre:'Av',v:w})}
      if(vs.length){const lim=Math.max(5,...vs.flatMap(x=>x.v.map(Math.abs)))+1;
        r.push({tipo:'plano',titulo:'📈 Verlo en el plano',objetos:vs.map((x,i)=>({k:'vector',a:[0,0],b:x.v,nombre:x.nombre||'v'+(i+1),color:['#2563eb','#dc2626','#15803d','#7c3aed'][i]})),limite:Math.ceil(lim)})}
    }
  }
  return r.length?r:null;
}

// Objetos del dibujo para la herramienta, debajo del enunciado (y0): una matriz editable o un plano con lo del ejercicio
export async function objetosHerramienta(h,{x=16,y0,ancho}){
  if(h.tipo==='matriz'){const {nuevaMatriz}=await import('./dibujo/matriz.js');
    return [nuevaMatriz(x+8,y0+12,h.celdas.length,h.celdas[0].length,{celdas:h.celdas.map(f=>f.slice()),aumentada:h.aumentada,tam:24})]}
  if(h.tipo==='plano'){const [{nuevoPlano},M]=await Promise.all([import('./dibujo/plano.js'),import('./dibujo/modelo.js')]);
    const s=Math.min(ancho-2*x,520),L=h.limite||10;
    return [nuevoPlano(x,y0+12,s,s,{xMin:-L,xMax:L,yMin:-L,yMax:L,pasoX:1,pasoY:1,numCada:L>10?5:2,objetos:h.objetos.map(o=>({...o,id:M.nuevoIdObj()}))})]}
  return [];
}
