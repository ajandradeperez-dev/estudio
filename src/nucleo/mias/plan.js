/* Plan para pasar una materia propia (sin DOM: también lo usa npm run revisar).
   planificar(materia, {hoy, dominio}) se calcula de nuevo cada vez desde hoy, así que se reajusta solo si te atrasas o adelantas:
   - Exámenes futuros en orden; cada tema se estudia antes del PRIMER examen en que entra (nunca después).
   - Para cada examen, los días disponibles (días de la semana elegidos) entre el examen anterior y la víspera.
   - Los últimos días quedan para repaso mezclado y simulacros: la última semana si hay 10 días o más; si no, ~1/4 de los días.
   - Prioriza: los temas difíciles y los menos dominados reciben dos sesiones (si caben), y van antes que los demás de su unidad.
   - Lo que ya sabes o ya dominas no se vuelve a estudiar: entra solo en el repaso.
   dominio(tema) → 0–1 (dominio de su habilidad, banco generado o simulacros). Día: {fecha, tipo, bloques:[{tipo, tema?, unidad?, min}]}. */
const dos=n=>String(n).padStart(2,'0');
export const aFecha=d=>`${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`;
export const deFecha=f=>{const [a,m,d]=f.split('-').map(Number);return new Date(a,m-1,d)};
export const sumar=(f,n)=>{const d=deFecha(f);d.setDate(d.getDate()+n);return aFecha(d)};
export const diasEntre=(a,b)=>Math.round((deFecha(b)-deFecha(a))/864e5);
export const DOMINADO=.8;

export function planificar(m,{hoy,dominio=()=>0}){
  const temas=new Map();
  for(const u of m.unidades)for(const t of u.temas)temas.set(t.id,{t,u});
  const examenes=(m.examenes||[]).filter(x=>x.fecha>=hoy).sort((a,b)=>a.fecha<b.fecha?-1:1);
  const disp=new Set(m.disponibilidad?.dias?.length?m.disponibilidad.dias:[0,1,2,3,4,5,6]),min=m.disponibilidad?.minutos||30;
  const yaPlaneado=new Set(),dias=[],porExamen=[];
  let inicio=hoy;
  for(const ex of examenes){
    // temas que entran: en el orden de sus unidades; los que ya entraron en un examen anterior no se repiten
    const entran=m.unidades.filter(u=>ex.unidades.includes(u.id)).flatMap(u=>u.temas.map(t=>({t,u})));
    const pendientes=entran.filter(({t})=>!yaPlaneado.has(t.id)&&!t.sabe&&dominio(t)<DOMINADO);
    entran.forEach(({t})=>yaPlaneado.add(t.id));
    const fin=sumar(ex.fecha,-1);
    let fechas=[];for(let f=inicio;f<=fin;f=sumar(f,1))if(disp.has(deFecha(f).getDay()))fechas.push(f);
    // sin días elegidos en la ventana (p. ej. el examen es mañana y mañana no estudias): todos los días de la ventana
    if(!fechas.length)for(let f=inicio;f<=fin;f=sumar(f,1))fechas.push(f);
    const n=fechas.length;
    let nRepaso=n>=10?fechas.filter(f=>diasEntre(f,ex.fecha)<=7).length:Math.round(n/4);
    nRepaso=Math.max(n>=2?1:0,Math.min(nRepaso,n-(pendientes.length?1:0)));
    if(!pendientes.length)nRepaso=n;
    const estudio=fechas.slice(0,n-nRepaso),repaso=fechas.slice(n-nRepaso);
    // sesiones: difíciles y poco dominados primero dentro de cada unidad, con una segunda sesión si caben
    const prioridad=({t})=>(t.dificil?2:0)+(dominio(t)<.3?1:0);
    const orden=[];for(const u of m.unidades)orden.push(...pendientes.filter(x=>x.u===u).sort((a,b)=>prioridad(b)-prioridad(a)));
    const sesiones=[...orden];
    for(const x of orden)if(prioridad(x)>0&&sesiones.length<estudio.length)sesiones.push(x);
    const plan={examen:ex,dias:[],temas:orden.map(x=>x.t.id)};
    // cada sesión k cae en el día floor(k·D/S): empieza el primer día y se reparte parejo (con más días que sesiones quedan días de repaso)
    const porDia=estudio.map(()=>[]);sesiones.forEach((x,k)=>porDia[Math.min(estudio.length-1,Math.floor(k*estudio.length/sesiones.length))]?.push(x));
    estudio.forEach((f,i)=>{
      const hoyTemas=porDia[i];
      const minRepaso=min>=15?Math.max(5,Math.round(min*.3)):0,minTemas=min-minRepaso;
      const bloques=hoyTemas.map(x=>({tipo:'tema',tema:x.t.id,unidad:x.u.id,min:Math.max(5,Math.round(minTemas/Math.max(1,hoyTemas.length)))}));
      if(!bloques.length)bloques.push({tipo:'repaso',min});else if(minRepaso)bloques.push({tipo:'repaso',min:minRepaso});
      plan.dias.push({fecha:f,tipo:'estudio',examen:ex.id,bloques});
    });
    // si no alcanzan los días de estudio, el resto de los temas va en el primer día (mejor apretado que fuera de plazo)
    if(!estudio.length&&orden.length&&repaso.length){const d=repaso.shift();plan.dias.push({fecha:d,tipo:'estudio',examen:ex.id,bloques:orden.map(x=>({tipo:'tema',tema:x.t.id,unidad:x.u.id,min:Math.max(5,Math.round(min/orden.length))}))})}
    repaso.forEach((f,i)=>{
      const ultimo=i===repaso.length-1,simulacro=ultimo||i%2===1;
      plan.dias.push({fecha:f,tipo:simulacro?'simulacro':'repaso',examen:ex.id,bloques:simulacro?[{tipo:'simulacro',min:Math.max(10,Math.round(min*.7))},{tipo:'repaso',min:Math.max(5,min-Math.round(min*.7))}]:[{tipo:'repaso',min}]});
    });
    plan.dias.sort((a,b)=>a.fecha<b.fecha?-1:1);
    porExamen.push(plan);dias.push(...plan.dias);
    inicio=ex.fecha>inicio?sumar(ex.fecha,1):inicio;
  }
  const hoyDia=dias.find(d=>d.fecha===hoy)||null;
  const proximo=dias.find(d=>d.fecha>hoy)||null;
  // semanas desde hoy (Semana 1 = hoy y los 6 días siguientes)
  const semanas=[];for(const d of dias){const k=Math.floor(diasEntre(hoy,d.fecha)/7);(semanas[k]||(semanas[k]={n:k+1,dias:[]})).dias.push(d)}
  return {examenes:porExamen,dias,hoy:hoyDia,proximo,semanas:semanas.filter(Boolean),temas};
}

// Comprobación (npm run revisar y la vista): ningún tema se programa el día del examen o después del primer examen en que entra
export function comprobarPlan(m,plan){
  const errores=[],primerExamen=new Map();
  for(const ex of [...(m.examenes||[])].sort((a,b)=>a.fecha<b.fecha?-1:1))for(const u of m.unidades.filter(u=>ex.unidades.includes(u.id)))for(const t of u.temas)if(!primerExamen.has(t.id))primerExamen.set(t.id,ex);
  for(const d of plan.dias)for(const b of d.bloques)if(b.tipo==='tema'){const ex=primerExamen.get(b.tema);
    if(ex&&d.fecha>=ex.fecha)errores.push(`tema ${b.tema} el ${d.fecha}, en o después del examen «${ex.nombre}» (${ex.fecha})`)}
  for(const d of plan.dias)if(!d.bloques.length)errores.push(`día ${d.fecha} vacío`);
  return errores;
}
