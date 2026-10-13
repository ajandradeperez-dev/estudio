/* "Repasar hoy": repetición espaciada de los ejercicios fallados en cualquier materia (ver progreso.js) */
import {htmlEjercicio,manejarEjercicio,mostrarResultado} from './ejercicios.js';
import {progreso,pendientes,registrarEjercicio,responderRepaso,quitarRepaso,hoy} from './progreso.js';
import {ejercicioPorRef} from './materias.js';

let cola=[],i=0,aciertos=0;

const fechaLarga=f=>{const [a,m,d]=f.split('-').map(Number);return new Date(a,m-1,d).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})};
const enDias=n=>n===1?'mañana':`en ${n} días`;

export const repaso={
  titulo:'Repasar hoy',
  alEntrar(){
    // Se arma la cola al entrar; los ejercicios que ya no existen (lección borrada) se descartan
    cola=pendientes().map(ref=>({ref,...ejercicioPorRef(ref)})).filter(x=>{if(!x.ej)quitarRepaso(x.ref);return x.ej});
    i=0;aciertos=0;
  },
  vista(){
    const cab=`<h1>Repasar hoy</h1><p class="lead">Aquí vuelven los ejercicios que fallaste. Cada vez que aciertas uno, regresa más tarde (1, 3, 7, 14 y 30 días) hasta que lo dominas; si lo fallas, vuelve mañana.</p>`;
    if(!cola.length){
      const p=progreso(),prox=Object.values(p.repaso).map(r=>r.proxima).filter(f=>f>hoy()).sort()[0];
      const cuantos=prox?Object.values(p.repaso).filter(r=>r.proxima===prox).length:0;
      return `${cab}<div class="card"><h3>No tienes nada para repasar hoy</h3>
<p style="margin:0 0 12px;color:var(--muted)">${prox?`Tu próximo repaso es el ${fechaLarga(prox)} (${cuantos} ${cuantos===1?'ejercicio':'ejercicios'}).`:'Cuando falles un ejercicio en cualquier materia, aparecerá aquí.'}</p>
<button class="btn" data-go="">Ir a mis materias</button></div>`;
    }
    if(i>=cola.length)return `${cab}<div class="card"><h3>Repaso terminado</h3><p class="prog-v">${aciertos} <small>de ${cola.length} aciertos</small></p>
<p style="color:var(--muted)">${aciertos===cola.length?'¡Todo bien! Esos ejercicios volverán dentro de unos días.':'Los que fallaste volverán mañana.'}</p><button class="btn" data-go="">Ir a mis materias</button></div>`;
    const x=cola[i];
    return `${cab}<div class="card"><p class="progress">Ejercicio ${i+1} de ${cola.length} · ${x.materia.nombre} · ${x.titulo}</p>
<div class="barra" aria-hidden="true"><span style="width:${Math.round(i/cola.length*100)}%"></span></div>
<div style="margin-top:14px">${htmlEjercicio(x.ej)}</div></div>`;
  },
  alClic(t,ir,repintar){
    if(t.id==='rep-sig'){i++;repintar();return true}
    const x=cola[i]; if(!x)return;
    const r=manejarEjercicio(t,x.ej); if(!r)return;
    registrarEjercicio({materia:x.materia.id,ref:x.ref,correcto:r.correcto,xp:r.correcto?5:0,repasar:false});
    const res=responderRepaso(x.ref,r.correcto);
    if(r.correcto)aciertos++;
    const nota=res.dominado?'¡Dominado! Ya no aparecerá en tu repaso.':`Volverá ${enDias(res.dias)}.`;
    mostrarResultado(x.ej,r.correcto,`<br><span class="progress">${r.correcto?'+5 XP · ':''}${nota}</span>
<div class="row" style="margin-top:10px"><button class="btn" id="rep-sig">${i+1<cola.length?'Siguiente':'Ver resultado'}</button></div>`);
    return true;
  }
};
