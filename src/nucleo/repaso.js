/* "Repasar": repetición espaciada (ver progreso.js) con práctica intercalada:
   la cola alterna materias y, dentro de cada materia, lecciones o habilidades, en vez de agrupar todo lo de un mismo tema. */
import {progreso,pendientes,registrarEjercicio,responderRepaso,quitarRepaso,registrarRespuesta,hoy} from './progreso.js';
import {ejercicioPorRef} from './materias.js';
import {deBanco} from './ejercicios.js';
import {crearSesion} from './sesion.js';
import {boton,vacio} from './ui.js';
import {htmlCierre} from './cierre.js';

const fechaLarga=f=>{const [a,m,d]=f.split('-').map(Number);return new Date(a,m-1,d).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})};
const enDias=n=>n===1?'mañana':`en ${n} días`;

// Intercala: turno por materia y, dentro de cada materia, turno por lección (o tipo de ejercicio)
export function mezclar(items){
  const porMateria=new Map();
  for(const x of items){
    const [mat,...resto]=x.ref.split('/'),grupo=['l','g','h'].includes(resto[0])?resto[1]:resto[0];
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
// Cola de hoy: los ejercicios que ya no existen (lección borrada) se descartan
export function colaRepaso(){
  return mezclar(pendientes().map(ref=>({ref,...ejercicioPorRef(ref)})).filter(x=>{if(!x.ej&&!x.pregunta)quitarRepaso(x.ref);return x.ej||x.pregunta}));
}

let fase='inicio',ses=null;
function empezar(){
  const cola=colaRepaso(),reglas=[];
  ses=crearSesion({
    titulo:'Repasar',salir:'repaso',
    total:()=>cola.length,
    siguiente:st=>{const x=cola[st.i];return x?{...(x.pregunta||deBanco(x.ej)),ref:x.ref,materia:x.materia.id,contexto:`${x.materia.nombre} · ${x.titulo}`}:null},
    responder(p,r){
      const bien=r.correcto&&!r.pista; // con pista no se aleja: vuelve mañana
      registrarEjercicio({materia:p.materia,ref:p.ref,correcto:bien,xp:bien?5:0,repasar:false});
      if(p.habilidad)registrarRespuesta(p.materia,p.habilidad,r); // también ajusta su dificultad y sus últimas respuestas
      const res=responderRepaso(p.ref,bien,r);
      if(!bien&&p.regla)reglas.push(p.regla);
      return {xp:bien?5:0,nota:res.dominado?'¡Dominado! Ya no volverá.':`Volverá ${enDias(res.dias)}.`};
    },
    fin(st){
      return `<span class="fin-icono" aria-hidden="true">${st.ok===st.i?'🌟':'🔁'}</span><h1>Repaso terminado</h1>
<p class="nota">${st.ok===st.i?'¡Todo bien! Volverán dentro de unos días.':'Los que fallaste vuelven mañana.'}</p>
<div class="fin-datos"><div class="dato xp"><b>+${st.xp}</b><span>XP</span></div><div class="dato ok"><b>${st.ok}/${st.i}</b><span>Bien</span></div><div class="dato"><b>${st.i}</b><span>Repasos</span></div></div>
${htmlCierre({xp:st.xp,aprendido:reglas,excluir:'repaso'})}`;
    }
  });
  ses.alEntrar();fase='sesion';
}

export const repaso={
  titulo:'Repasar',
  get inmersiva(){return fase==='sesion'},
  alEntrar(){fase='inicio';ses=null},
  alSalir(){ses?.alSalir?.()},
  vista(){
    if(fase==='sesion')return ses.vista();
    const n=pendientes().length;
    if(!n){
      const p=progreso(),prox=Object.values(p.repaso).map(r=>r.proxima).filter(f=>f>hoy()).sort()[0];
      const cuantos=prox?Object.values(p.repaso).filter(r=>r.proxima===prox).length:0;
      return `<h1>Repasar</h1>${vacio({icono:'🌤️',titulo:Object.keys(p.repaso).length?'Nada que repasar hoy':'Aún no tienes repasos',
        texto:prox?`Tu próximo repaso es el ${fechaLarga(prox)} (${cuantos} ${cuantos===1?'ejercicio':'ejercicios'}).`:'¡Haz tu primera lección! Lo que falles volverá aquí en el momento justo para recordarlo.',
        boton:boton({texto:'Ir a aprender',go:''})})}`;
    }
    return `<h1>Repasar</h1>${vacio({icono:'🔁',titulo:`${n} ${n===1?'repaso toca':'repasos tocan'} hoy`,
      texto:'Mezclados entre materias y habilidades. Si lo recuerdas bien vuelve más tarde; si fallas, mañana.',boton:boton({texto:'Empezar repaso',id:'rep-empezar',clase:'ancho'})})}`;
  },
  alMostrar(){if(fase==='sesion')ses.alMostrar()},
  async alClic(t,ir,repintar){
    if(t.id==='rep-empezar'){empezar();repintar();return true}
    if(fase==='sesion')return ses.alClic(t,ir,repintar);
  }
};
