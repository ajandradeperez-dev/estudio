/* Problemas de APLICACIÓN de Álgebra lineal (con contexto) y el escenario de la fábrica. Se usan en "🎯 Retos y escenarios".
   3 contextos (plantillas) por nivel y comprobar(). Sin DOM. */
import {num,casi,igualNum,lista} from './verificar.js';
import {frac,par,mat,vec,lineal} from './formato.js';
import {paso,final,c} from './pasos.js';
import {plantillas,malNum,numTxt} from './algebra-temas.js';
import {celdasIguales,vecAl,comoVector,det2,det3} from './algebra-lineal.js';
import {punto,mulMV,mulMM} from './algebra-lineal2.js';

const iguales=(a,b)=>a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<1e-9);
const sinUnidades=e=>String(e).replace(/[$%]|\b(kg|g|unidades|personas|habitantes|piezas|horas?|tazas?|porciones?)\b/gi,'');

/* ---------- Mezclas con 3 ingredientes (sistema 3×3) ---------- */
const CTX_MEZ={
  dieta:{titulo:'Una nutrióloga combina tres alimentos',cosas:['avena','yogur','nueces'],unidad:'porciones',uno:'porción',props:['proteína (g)','grasa (g)','carbohidratos (g)']},
  cafe:{titulo:'Una cafetería mezcla tres granos',cosas:['grano A','grano B','grano C'],unidad:'kg',uno:'kg',props:['costo ($)','acidez (puntos)','cuerpo (puntos)']},
  fabrica:{titulo:'Un taller fabrica tres productos',cosas:['sillas','mesas','repisas'],unidad:'piezas',uno:'pieza',props:['madera (tablas)','horas de corte','horas de pintura']}
};
const mezclas={
  titulo:'Mezclas y recursos (sistemas 3×3)',profundidad:()=> 'aplicacion',
  alternativa:'Cada propiedad (proteína, costo, horas) da una ecuación: cantidad de cada cosa por lo que aporta, sumado, igual al total. Tres propiedades, tres incógnitas: un sistema 3×3.',
  generar(n,rng){
    const ps={};
    for(const [k,t] of Object.entries(CTX_MEZ))ps[k]=()=>{
      let A;const R=n<=2?4:n<=4?6:9;do A=Array.from({length:3},()=>Array.from({length:3},()=>rng.entero(1,R)));while(det3(A)===0);
      const X=Array.from({length:3},()=>rng.entero(1,n<=2?5:12)),b=A.map(f=>punto(f,X)),pide=rng.entero(0,2);
      const tabla=`<div class="wrap"><table><tbody><tr><th></th>${t.cosas.map(x=>`<th>${x}</th>`).join('')}<th>Total</th></tr>${t.props.map((p,i)=>`<tr><td>${p}</td>${A[i].map(x=>`<td>${x}</td>`).join('')}<td><b>${b[i]}</b></td></tr>`).join('')}</tbody></table></div>`;
      const v=X[pide];
      return {enunciado:`${t.titulo}. Por cada ${t.uno}, cada uno aporta lo de la tabla; en total se necesita lo de la última columna.${tabla}¿Cuántas ${t.unidad} de <b>${t.cosas[pide]}</b>?`,v,resp:String(v),
        pasos:[paso('Una ecuación por fila',`\\(\\begin{cases}${A.map((f,i)=>`${lineal(f.map((x,j)=>[x,['x','y','z'][j]]))} = ${b[i]}`).join(' \\\\ ')}\\end{cases}\\)`,`x, y, z = ${t.cosas.join(', ')}.`),paso('Resuelve (Gauss o eliminación)',`\\(x = ${X[0]},\\ y = ${X[1]},\\ z = ${X[2]}\\)`,'Comprueba en las tres ecuaciones.'),final('La que piden',`\\(${c(v)}\\)`,`${t.unidad} de ${t.cosas[pide]}.`,String(v))],
        errores:[malNum(X[(pide+1)%3],'Esa es otra de las incógnitas.'),malNum(Math.round(b[0]/A[0].reduce((s,x)=>s+x,0)),'No se reparte el total en partes iguales: resuelve el sistema.'),malNum(b[pide],'Ese es un total, no la cantidad.')].filter(e=>e.valor!==String(v)),
        comprobar:()=>A.every((f,i)=>punto(f,X)===b[i])};
    };
    const x=plantillas(rng,ps);
    return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(sinUnidades(e),x.v),pasos:x.pasos,errores:x.errores,
      regla:'Cada propiedad da una ecuación: Σ (cantidad × aporte) = total. Con tres propiedades se arma un sistema 3×3.',pista:'Escribe una ecuación por fila de la tabla.',teclado:'mat',comprobar:x.comprobar};
  }
};

/* ---------- Cadenas de Markov (matriz × vector, estado estable) ---------- */
const CTX_MK={
  ciudades:{a:'la ciudad',b:'el campo',deA:'de la ciudad',deB:'del campo',aA:'a la ciudad',aB:'al campo',enA:'en la ciudad',enB:'en el campo',quien:'habitantes',mov:'se muda',per:'año'},
  marcas:{a:'la marca A',b:'la marca B',deA:'de los clientes de la marca A',deB:'de los de la marca B',aA:'a la marca A',aB:'a la marca B',enA:'con la marca A',enB:'con la marca B',quien:'clientes',mov:'se cambia',per:'mes'},
  bicis:{a:'la estación Norte',b:'la estación Sur',deA:'de las bicis de la estación Norte',deB:'de las de la estación Sur',aA:'en la Norte',aB:'en la Sur',enA:'en la Norte',enB:'en la Sur',quien:'bicicletas',mov:'termina',per:'día'}
};
const markov={
  titulo:'Cadenas de Markov',profundidad:()=> 'aplicacion',
  alternativa:'Una matriz de transición dice qué fracción pasa de un estado a otro en cada periodo. Multiplicar la matriz por el vector de hoy da el vector de mañana. El estado estable es el que ya no cambia: Mv = v.',
  generar(n,rng){
    const ps={};
    for(const [k,t] of Object.entries(CTX_MK))ps[k]=()=>{
      const p=rng.elegir([10,20,30]),q=rng.elegir([10,20,40]),M=[[1-p/100,q/100],[p/100,1-q/100]],tot=rng.elegir([1000,2000]),x0=[rng.entero(2,8)*tot/10,0];x0[1]=tot-x0[0];
      const pasos=n<=2?1:n<=4?2:0,ctx=`Cada ${t.per}, el ${p} % ${t.deA} ${t.mov} ${t.aB}, y el ${q} % ${t.deB} ${t.mov} ${t.aA}. Hoy hay ${x0[0]} ${t.quien} ${t.enA} y ${x0[1]} ${t.enB}.`;
      if(pasos){let x=x0;for(let i=0;i<pasos;i++)x=mulMV(M,x);const r=x.map(v=>+v.toFixed(2));
        return {forma:{filas:1,cols:2},celdas:r.map(String),respuesta:vec(r),verificar:e=>Array.isArray(e)&&e.length===2&&e.every((z,i)=>Math.abs(num(z)-r[i])<=0.5),enunciado:`${ctx} ¿Cuántos habrá en cada lugar dentro de ${pasos} ${t.per}${pasos>1?(t.per==='mes'?'es':'s'):''}? (${t.a}, ${t.b})`,
          pasos:[paso('Matriz de transición',`\\(M = ${mat(M.map(f=>f.map(v=>+v.toFixed(2))))}\\)`,'Cada columna suma 1: lo que se queda + lo que se va.'),paso('Multiplica',`\\(M${vec(x0)} = ${vec(mulMV(M,x0).map(v=>+v.toFixed(2)))}\\)`,'Vector de hoy → vector del año siguiente.'),final(pasos>1?'Repite':'Resultado',`\\(${c(vec(r))}\\)`,'El total no cambia.',vec(r))],
          errores:[{si:e=>Array.isArray(e)&&e.length===2&&iguales(e.map(num),mulMV([[M[0][0],M[1][0]],[M[0][1],M[1][1]]],x0)),por:'Usaste la matriz al revés (filas por columnas).'},{si:e=>Array.isArray(e)&&e.length===2&&iguales(e.map(num),x0),por:'Falta aplicar la transición.'}],
          comprobar:()=>casi(r[0]+r[1],tot,1e-3)}}
      const est=[q/(p+q)*tot,p/(p+q)*tot].map(v=>+v.toFixed(2));
      return {forma:{filas:1,cols:2},celdas:est.map(String),respuesta:vec(est),verificar:e=>Array.isArray(e)&&e.length===2&&e.every((z,i)=>Math.abs(num(z)-est[i])<=0.5),enunciado:`${ctx} A la larga, ¿cuántos habrá en cada lugar (estado estable)? (${t.a}, ${t.b})`,
        pasos:[paso('Estado estable: Mv = v',`\\(${p/100}\\,a = ${q/100}\\,b\\)`,'Lo que sale de cada lugar es igual a lo que entra.'),paso('Con a + b = '+tot,`\\(a = \\dfrac{${q}}{${p+q}}\\cdot${tot}\\)`,'Proporción inversa a la tasa de salida.'),final('Resultado',`\\(${c(vec(est))}\\)`,'Ya no cambia de un año al otro.',vec(est))],
        errores:[{si:e=>Array.isArray(e)&&e.length===2&&iguales(e.map(num),[tot/2,tot/2]),por:'No necesariamente queda mitad y mitad.'},{si:e=>Array.isArray(e)&&e.length===2&&Math.abs(num(e[0])-est[1])<=0.5&&Math.abs(num(e[1])-est[0])<=0.5,por:'Al revés: se queda más donde menos gente se va.'}],
        comprobar:()=>{const e=[q/(p+q)*tot,p/(p+q)*tot];return iguales(mulMV(M,e),e)&&casi(e[0]+e[1],tot)}};
    };
    const x=plantillas(rng,ps);
    return {regla:'Vector de mañana = M × vector de hoy (cada columna de M suma 1). Estado estable: Mv = v (lo que sale = lo que entra).',pista:'Arma la matriz con lo que se queda y lo que se va.',teclado:'mat',...x};
  }
};

/* ---------- Gráficos por computadora (transformaciones) ---------- */
const graficos={
  titulo:'Gráficos por computadora',profundidad:()=> 'aplicacion',
  alternativa:'Los juegos y programas de diseño guardan cada figura como puntos y la mueven multiplicando por matrices: escalar, rotar, reflejar. El determinante dice cuánto cambia el área.',
  generar(n,rng){
    const fig=()=>{const a=rng.entero(1,4),b=rng.entero(1,4);return [[0,0],[a,0],[a,b],[0,b]]};
    const ps={
      escalar:()=>{const P=fig(),k=rng.entero(2,4),j=n>=3?rng.entero(1,3):k,M=[[k,0],[0,j]],q=P[2],r=mulMV(M,q);
        if(n<=2)return {...comoVector(r),enunciado:`En un editor de imágenes, un rectángulo tiene una esquina en \\(${vec(q)}\\). Se escala con \\(${mat(M)}\\). ¿A dónde va esa esquina?`,pasos:[paso('Multiplica',`\\((${k}\\cdot${q[0]},\\ ${j}\\cdot${q[1]})\\)`,'Escalar estira cada eje.'),final('Resultado',`\\(${c(vec(r))}\\)`,'Nueva posición.',vec(r))],errores:[{si:e=>celdasIguales(e,q.map(x=>x+k)),por:'Escalar multiplica, no suma.'}],comprobar:()=>iguales(r,[k*q[0],j*q[1]])};
        const A0=q[0]*q[1],A1=A0*Math.abs(det2(M));return {enunciado:`Un rectángulo de ${q[0]} × ${q[1]} se escala con \\(${mat(M)}\\). ¿Qué área tiene después?`,v:A1,resp:String(A1),pasos:[paso('Área original',`\\(${A0}\\)`,'Base × altura.'),paso('Factor = |det|',`\\(|${det2(M)}| = ${Math.abs(det2(M))}\\)`,'El determinante escala áreas.'),final('Multiplica',`\\(${c(A1)}\\)`,'Área nueva.',String(A1))],errores:[malNum(A0*(k+j),'El factor es el determinante (producto), no la suma.'),malNum(A0,'El área sí cambia.'),malNum(Math.abs(det2(M)),'Multiplica por el área original.')].filter(e=>e.valor!==String(A1)),comprobar:()=>A1===k*q[0]*j*q[1]};},
      rotar:()=>{const ang=n<=2?90:rng.elegir([90,180,270]),R={90:[[0,-1],[1,0]],180:[[-1,0],[0,-1]],270:[[0,1],[-1,0]]}[ang],q=vecAl(rng,2,6).map(x=>x||2),r=mulMV(R,q);
        return {...comoVector(r),enunciado:`Un personaje de un videojuego está en \\(${vec(q)}\\) y el mapa gira ${ang}° (antihorario) alrededor del origen. ¿Dónde queda?`,pasos:[paso('Matriz de rotación',`\\(${mat(R)}\\)`,ang===90?'(x, y) → (−y, x).':ang===180?'(x, y) → (−x, −y).':'(x, y) → (y, −x).'),final('Multiplica',`\\(${c(vec(r))}\\)`,'Nueva posición.',vec(r))],errores:[{si:e=>celdasIguales(e,mulMV([[R[0][0],R[1][0]],[R[0][1],R[1][1]]],q))&&ang!==180,por:'Esa es la rotación en sentido horario.'},{si:e=>celdasIguales(e,q),por:'Sí se mueve.'}],comprobar:()=>casi(Math.hypot(...r),Math.hypot(...q))}},
      reflejar:()=>{const [nom,M]=rng.elegir([['al eje y (efecto espejo)',[[-1,0],[0,1]]],['al eje x',[[1,0],[0,-1]]],['a la recta y = x',[[0,1],[1,0]]]]),q=vecAl(rng,2,7).map(x=>x||3);
        if(n>=4){const M2=[[0,-1],[1,0]],T=mulMM(M2,M),r=mulMV(T,q);return {...comoVector(r),enunciado:`Una app de fotos primero refleja respecto ${nom} y después gira 90° (antihorario). ¿A dónde va el punto \\(${vec(q)}\\)?`,pasos:[paso('Primero la reflexión',`\\(${vec(mulMV(M,q))}\\)`,'Aplica en orden.'),final('Después la rotación',`\\(${c(vec(r))}\\)`,'Composición: R·S.',vec(r))],errores:[{si:e=>celdasIguales(e,mulMV(mulMM(M,M2),q))&&!celdasIguales(mulMV(mulMM(M,M2),q),r),por:'El orden importa: primero refleja, luego gira.'}],comprobar:()=>iguales(r,mulMV(M2,mulMV(M,q)))}}
        const r=mulMV(M,q);return {...comoVector(r),enunciado:`Una app de fotos refleja la imagen respecto ${nom}. ¿A dónde va el punto \\(${vec(q)}\\)?`,pasos:[paso('Matriz',`\\(${mat(M)}\\)`,'Reflexión.'),final('Multiplica',`\\(${c(vec(r))}\\)`,'Espejo.',vec(r))],errores:[{si:e=>celdasIguales(e,q.map(x=>-x)),por:'Eso es girar 180°, no reflejar.'},{si:e=>celdasIguales(e,q),por:'Sí cambia.'}],comprobar:()=>iguales(mulMV(M,r),q)}}
    };
    const x=plantillas(rng,ps);
    if(x.v!==undefined)return {plantilla:x.plantilla,enunciado:x.enunciado,respuesta:x.resp,verificar:e=>igualNum(e,x.v),pasos:x.pasos,errores:x.errores,regla:'Escalar, rotar y reflejar son multiplicaciones por matrices; |det| es el factor de área.',pista:'Multiplica la matriz por el punto.',teclado:'mat',comprobar:x.comprobar};
    return {regla:'Escalar, rotar y reflejar son multiplicaciones por matrices; |det| es el factor de área.',pista:'Multiplica la matriz por el punto.',teclado:'mat',...x};
  }
};

/* ---------- Escenario: la fábrica (varias preguntas con el mismo contexto) ---------- */
export function escenarioFabrica(rng){
  let R;do R=[[rng.entero(2,5),rng.entero(3,7)],[rng.entero(1,3),rng.entero(2,4)]];while(det2(R)===0);const precios=[rng.entero(3,9)*10,rng.entero(4,12)*10],costo=[rng.entero(5,15),rng.entero(20,40)];
  const pedido=[rng.entero(5,20),rng.entero(5,20)],rec=mulMV(R,pedido),ingreso=punto(precios,pedido),gasto=punto(costo,rec);
  const ctx=`<p class="contexto">Una fábrica hace <b>mesas</b> y <b>libreros</b>. Una mesa usa ${R[0][0]} tablas y ${R[1][0]} horas de trabajo; un librero usa ${R[0][1]} tablas y ${R[1][1]} horas. Cada tabla cuesta $${costo[0]} y cada hora $${costo[1]}. La mesa se vende en $${precios[0]} y el librero en $${precios[1]}.</p>`;
  const disp=[rng.entero(4,9),rng.entero(3,8)];const disp2=mulMV(R,disp);
  const regla='Recursos = matriz de recursos × vector de producción; costos y ingresos son productos punto.';
  const base=(enun,resp,verificar,pasos,errores,extra={})=>({tipo:'escribir',enunciado:ctx+enun,respuesta:resp,verificar,pasos,errores,regla,pista:'Organiza los datos en una matriz: filas = recursos, columnas = productos.',teclado:'mat',profundidad:'escenario',...extra});
  return [
    base(`1/4 · Llega un pedido de ${pedido[0]} mesas y ${pedido[1]} libreros. ¿Cuántas tablas y cuántas horas se necesitan? (tablas, horas)`,vec(rec),e=>{const l=lista(e);return l.length===2&&iguales(l,rec)},
      [paso('Matriz × pedido',`\\(${mat(R)}${vec(pedido)}\\)`,'Fila = recurso; columna = producto.'),final('Resultado',`\\(${c(vec(rec))}\\)`,'Tablas y horas.',vec(rec))],
      [{valor:vec(mulMV([[R[0][0],R[1][0]],[R[0][1],R[1][1]]],pedido)),si:e=>{const l=lista(e);return l.length===2&&iguales(l,mulMV([[R[0][0],R[1][0]],[R[0][1],R[1][1]]],pedido))},por:'Cruzaste filas y columnas.'}],{comprobar:()=>rec[0]===R[0][0]*pedido[0]+R[0][1]*pedido[1]}),
    base(`2/4 · ¿Cuánto cuestan esos recursos?`,String(gasto),e=>igualNum(String(e).replace('$',''),gasto),
      [paso('Costo = precios de recursos · cantidades',`\\(${costo[0]}\\cdot${rec[0]} + ${costo[1]}\\cdot${rec[1]}\\)`,'Producto punto.'),final('Resultado',`\\(${c(gasto)}\\)`,'Costo del pedido.',String(gasto))],
      [malNum(rec[0]+rec[1],'Multiplica por el costo de cada recurso.'),malNum(costo[0]*rec[1]+costo[1]*rec[0],'Cada costo con su recurso.'),malNum(ingreso,'Ese es el ingreso.')].filter(e=>e.valor!==String(gasto)),{comprobar:()=>gasto===costo[0]*rec[0]+costo[1]*rec[1]}),
    base(`3/4 · ¿Cuánto gana la fábrica con el pedido (ingreso − costo)?`,String(ingreso-gasto),e=>igualNum(String(e).replace('$',''),ingreso-gasto),
      [paso('Ingreso',`\\(${precios[0]}\\cdot${pedido[0]} + ${precios[1]}\\cdot${pedido[1]} = ${ingreso}\\)`,'Precio · cantidad.'),final('Ganancia',`\\(${ingreso} - ${gasto} = ${c(ingreso-gasto)}\\)`,'Puede ser negativa (pérdida).',String(ingreso-gasto))],
      [malNum(ingreso,'Falta restar el costo.'),malNum(gasto-ingreso,'Es ingreso − costo.'),malNum(ingreso+gasto,'Se resta.')].filter(e=>e.valor!==String(ingreso-gasto)),{comprobar:()=>true}),
    base(`4/4 · Esta semana hay ${disp2[0]} tablas y ${disp2[1]} horas, y quieren usarlas todas. ¿Cuántas mesas y libreros pueden hacer? (mesas, libreros)`,vec(disp),e=>{const l=lista(e);return l.length===2&&iguales(l,disp)},
      [paso('Sistema R·x = recursos',`\\(\\begin{cases}${R[0][0]}m + ${R[0][1]}l = ${disp2[0]} \\\\ ${R[1][0]}m + ${R[1][1]}l = ${disp2[1]}\\end{cases}\\)`,'Dos ecuaciones, dos incógnitas.'),final('Resuelve',`\\(${c(vec(disp))}\\)`,det2(R)?'Solución única (det ≠ 0).':'',vec(disp))],
      [{valor:vec([...disp].reverse()),si:e=>{const l=lista(e);return l.length===2&&iguales(l,[...disp].reverse())&&disp[0]!==disp[1]},por:'Primero mesas, luego libreros.'}],{comprobar:()=>det2(R)!==0&&iguales(mulMV(R,disp),disp2)})
  ].map(p=>({...p,comprobar:p.comprobar||(()=>p.verificar(p.respuesta))}));
}

export default {'apl/mezclas':mezclas,'apl/markov':markov,'apl/graficos':graficos};
