/* "👉 ¿Qué sigue?": decide la siguiente mejor actividad con reglas simples, en este orden:
   1. Repasos vencidos (si hay 5 o más, eso primero).
   2. Lo urgente de cada materia (p. ej. Inglés: la misión diaria de habla, que pesa más).
   3. El punto más débil: la lección por repetir o el tema (p. ej. sonido) con menor puntaje reciente.
   4. Continuar la lección sin terminar.
   5. La siguiente lección pendiente.
   6. Si todo está al día: el reto de cada materia (jefe, conversación) o lo que quede.
   Alternancia: si las últimas 3 sesiones fueron de la misma materia, se prefiere otra (con repasos si los tiene).
   Cada materia puede aportar candidatos con recomendar(p) → [{regla:2|3|6, valor?, titulo, porque, ruta}]
   (valor 0–1 = puntaje reciente, para comparar debilidades). */
import {materias,rutaLeccion} from './materias.js';
import {progreso,datosMateria,pendientes} from './progreso.js';
import {DOMINIO} from './metodo.js';

const nombre=id=>materias.find(m=>m.id===id)?.nombre||id;
const pct=x=>Math.round(x*100);

export function recomendar({excluir}={},p=progreso()){
  const rep=pendientes(p),porMateria={};
  for(const ref of rep){const mid=ref.split('/')[0];porMateria[mid]=(porMateria[mid]||0)+1}
  const ultimas=p.historial.slice(-3),cansada=ultimas.length===3&&ultimas.every(h=>h.materia===ultimas[0].materia)?ultimas[0].materia:null;
  const extras=materias.flatMap(m=>(m.recomendar?.(p)||[]).map(c=>({...c,materia:m.id})));
  const candidatos=[];

  // 1. Repasos vencidos
  if(rep.length>=5){
    const top=Object.entries(porMateria).sort((a,b)=>b[1]-a[1])[0];
    candidatos.push({regla:1,titulo:`Repasar ${rep.length} ejercicios`,porque:`Tienes ${rep.length} repasos pendientes${top?` (${top[1]} de ${nombre(top[0])})`:''}: es lo que más fija lo aprendido.`,ruta:'repaso'});
  }
  // 2. Lo urgente de cada materia
  candidatos.push(...extras.filter(c=>c.regla===2));
  // 3. Punto más débil: lecciones por repetir y debilidades que aporta cada materia
  const debiles=[...extras.filter(c=>c.regla===3)];
  for(const m of materias)for(const l of m.lecciones||[]){
    const x=datosMateria(p,m.id).lecciones[l.id];
    if(x&&!x.dominada)debiles.push({regla:3,valor:x.mejor||0,materia:m.id,titulo:`Repetir: ${l.titulo}`,porque:`Es tu punto más débil en ${m.nombre}: ${pct(x.mejor||0)} % sin pista (necesitas ${pct(DOMINIO)} %).`,ruta:rutaLeccion(m,l)});
  }
  debiles.sort((a,b)=>(a.valor??1)-(b.valor??1));
  candidatos.push(...debiles);
  // 4. Continuar una lección a medias
  for(const m of materias){const e=datosMateria(p,m.id).enCurso,l=e&&(m.lecciones||[]).find(x=>x.id===e.leccion);
    if(l)candidatos.push({regla:4,materia:m.id,titulo:`Continuar: ${l.titulo}`,porque:`Te quedaste en el ejercicio ${e.i+1} de ${m.nombre}.`,ruta:rutaLeccion(m,l)})}
  // 5. Siguiente lección pendiente de cada materia
  for(const m of materias){const d=datosMateria(p,m.id),l=(m.lecciones||[]).find(x=>!d.lecciones[x.id]?.dominada);
    if(l)candidatos.push({regla:5,materia:m.id,titulo:`Siguiente: ${l.titulo}`,porque:`Es la próxima lección de ${m.nombre}, ordenada por utilidad.`,ruta:rutaLeccion(m,l)})}
  // 6. Todo al día: retos de cada materia
  candidatos.push(...extras.filter(c=>c.regla===6));
  if(rep.length&&rep.length<5)candidatos.push({regla:6,titulo:`Repasar ${rep.length} ejercicios`,porque:'Tienes pocos repasos pendientes: despéjalos en un par de minutos.',ruta:'repaso'});

  let lista=candidatos.filter(c=>c.ruta!==excluir);
  // Alternancia: tras 3 sesiones seguidas de la misma materia, sugerir otra (primero sus repasos)
  if(cansada){
    const otraRep=Object.entries(porMateria).find(([mid,n])=>mid!==cansada&&n>0);
    if(otraRep)return {regla:'alternar',titulo:`Repasar ${nombre(otraRep[0])}`,porque:`Llevas 3 sesiones seguidas de ${nombre(cansada)}: cambia de aire con ${otraRep[1]} ${otraRep[1]===1?'repaso':'repasos'} de ${nombre(otraRep[0])}.`,ruta:'repaso'};
    const otra=lista.find(c=>c.materia&&c.materia!==cansada&&c.regla!==1);
    if(otra)return {...otra,porque:`Llevas 3 sesiones seguidas de ${nombre(cansada)}: ${otra.porque.charAt(0).toLowerCase()}${otra.porque.slice(1)}`};
  }
  return lista[0]||{regla:0,titulo:'Explorar las materias',porque:'¡Estás al día en todo! Elige una materia nueva o repite lo que más te guste.',ruta:''};
}
