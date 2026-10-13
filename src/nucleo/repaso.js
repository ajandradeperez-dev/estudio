/* "Repasar hoy": repetición espaciada (ver progreso.js) con práctica mezclada:
   la cola alterna materias y, dentro de cada materia, lecciones, en vez de agrupar todo lo de un mismo tema. */
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from './ejercicios.js';
import {progreso,pendientes,registrarEjercicio,responderRepaso,quitarRepaso,hoy} from './progreso.js';
import {ejercicioPorRef} from './materias.js';
import {barra} from './ui.js';

let cola=[],i=0,aciertos=0;

const fechaLarga=f=>{const [a,m,d]=f.split('-').map(Number);return new Date(a,m-1,d).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})};
const enDias=n=>n===1?'mañana':`en ${n} días`;

// Intercala: turno por materia y, dentro de cada materia, turno por lección (o tipo de ejercicio)
export function mezclar(items){
  const porMateria=new Map();
  for(const x of items){
    const [mat,...resto]=x.ref.split('/'),grupo=resto[0]==='l'?resto[1]:resto[0];
    if(!porMateria.has(mat))porMateria.set(mat,new Map());
    const g=porMateria.get(mat); if(!g.has(grupo))g.set(grupo,[]); g.get(grupo).push(x);
  }
  const salida=[],mats=[...porMateria.values()].map(g=>({grupos:[...g.values()],turno:0}));
  while(mats.some(m=>m.grupos.some(g=>g.length)))for(const m of mats){
    const vivos=m.grupos.filter(g=>g.length); if(!vivos.length)continue;
    salida.push(vivos[m.turno++%vivos.length].shift());
  }
  return salida;
}

export const repaso={
  titulo:'Repasar hoy',
  alEntrar(){
    // Se arma la cola al entrar; los ejercicios que ya no existen (lección borrada) se descartan
    cola=mezclar(pendientes().map(ref=>({ref,...ejercicioPorRef(ref)})).filter(x=>{if(!x.ej)quitarRepaso(x.ref);return x.ej}));
    i=0;aciertos=0;
  },
  vista(){
    const cab=`<h1>Repasar hoy</h1><p class="lead">Vuelven los ejercicios que fallaste y los de lecciones que dominaste, mezclados entre materias. Si aciertas sin pista, regresan más tarde (1, 3, 7, 14 y 30 días); si fallas, mañana.</p>`;
    if(!cola.length){
      const p=progreso(),prox=Object.values(p.repaso).map(r=>r.proxima).filter(f=>f>hoy()).sort()[0];
      const cuantos=prox?Object.values(p.repaso).filter(r=>r.proxima===prox).length:0;
      return `${cab}<div class="card"><h3>No tienes nada para repasar hoy</h3>
<p style="margin:0 0 12px;color:var(--muted)">${prox?`Tu próximo repaso es el ${fechaLarga(prox)} (${cuantos} ${cuantos===1?'ejercicio':'ejercicios'}).`:'Cuando falles un ejercicio o domines una lección, aparecerá aquí.'}</p>
<button class="btn" data-go="">Ir a mis materias</button></div>`;
    }
    if(i>=cola.length)return `${cab}<div class="card"><h3>Repaso terminado</h3><p class="prog-v">${aciertos} <small>de ${cola.length} sin pista</small></p>
<p style="color:var(--muted)">${aciertos===cola.length?'¡Todo bien! Esos ejercicios volverán dentro de unos días.':'Los que fallaste volverán mañana.'}</p><button class="btn" data-go="">Ir a mis materias</button></div>`;
    const x=cola[i];
    return `${cab}<div class="card"><p class="progress">Ejercicio ${i+1} de ${cola.length} · ${x.materia.nombre} · ${x.titulo}</p>${barra(i,cola.length)}
<div style="margin-top:14px">${htmlEjercicio(x.ej)}</div></div>`;
  },
  alClic(t,ir,repintar){
    if(t.id==='rep-sig'){i++;repintar();return true}
    const x=cola[i]; if(!x)return;
    const r=manejarEjercicio(t,x.ej); if(!r)return;
    const bien=r.correcto&&!r.pista; // con pista no se aleja: vuelve mañana
    registrarEjercicio({materia:x.materia.id,ref:x.ref,correcto:bien,xp:bien?5:0,repasar:false});
    const res=responderRepaso(x.ref,bien);
    if(bien)aciertos++;
    const nota=res.dominado?'¡Dominado! Ya no aparecerá en tu repaso.':`Volverá ${enDias(res.dias)}.`;
    mostrarResultado(x.ej,r,`<div class="fb-pie"><span class="progress">${bien?'+5 XP · ':''}${nota}</span>
<button class="btn" id="rep-sig">${i+1<cola.length?'Siguiente':'Ver resultado'}</button></div>`);
    return true;
  }
};
