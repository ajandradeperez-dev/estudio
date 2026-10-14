/* "👉 ¿Qué sigue?": decide la siguiente mejor actividad con reglas simples, en este orden:
   1. Repasos vencidos (si hay 5 o más, eso primero).
   2. Lo urgente de cada materia (p. ej. Inglés: la misión diaria de habla, que pesa más).
   3. El punto más débil: la habilidad sin dominar (o el sonido, en Inglés) con menor acierto reciente.
   4. Casi dominada: tiene el acierto y le falta practicarla otro día (el dominio pide 2 días distintos).
   5. La siguiente habilidad del camino.
   6. Si todo está al día: retos (jefes y cofres del camino, jefe o conversación de Hablar) o lo que quede.
   Alternancia: si las últimas 3 sesiones fueron de la misma materia, se prefiere otra (con repasos si los tiene).
   Cada materia puede aportar candidatos con recomendar(p) → [{regla:2|3|6, valor?, titulo, porque, ruta}]
   (valor 0–1 = puntaje reciente, para comparar debilidades). */
import {materias,rutaLeccion,rutaTema} from './materias.js';
import {habilidadActual,cofresTema,cofreAbierto,jefeAbierto,jefeVencido} from './camino.js';
import {progreso,datosMateria,pendientes,hoy} from './progreso.js';
import {DOMINIO,estadoDominio} from './metodo.js';
import {intereses} from './usuario.js';

const nombre=id=>materias.find(m=>m.id===id)?.nombre||id;
const pct=x=>Math.round(x*100);

// materia: solo candidatos de esa materia (para "Lo siguiente para ti" dentro de una materia)
export function recomendar({excluir,materia}={},p=progreso()){
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
  // 3. Punto más débil: habilidades practicadas sin dominar con menor acierto reciente, y debilidades que aporta cada materia
  const debiles=[...extras.filter(c=>c.regla===3)];
  for(const m of materias)for(const l of m.lecciones||[]){
    const x=datosMateria(p,m.id).lecciones[l.id],e=estadoDominio(x||{});
    if(x&&!x.dominada&&e.n>=3&&e.ok/e.n<DOMINIO)debiles.push({regla:3,valor:e.ok/e.n,materia:m.id,titulo:`Repetir: ${l.titulo}`,porque:`Es tu punto más débil en ${m.nombre}: ${pct(e.ok/e.n)} % en tus últimas respuestas (la meta es ${pct(DOMINIO)} %).`,ruta:rutaLeccion(m,l)});
  }
  debiles.sort((a,b)=>(a.valor??1)-(b.valor??1));
  candidatos.push(...debiles);
  // 4. Casi dominada: ya tiene el acierto, le falta practicarla otro día (el dominio pide 2 días distintos)
  const h0=hoy();
  for(const m of materias)for(const l of m.lecciones||[]){const x=datosMateria(p,m.id).lecciones[l.id],e=estadoDominio(x||{});
    if(x&&!x.dominada&&e.n>=3&&e.ok/e.n>=DOMINIO&&!(x.dias||[]).includes(h0))candidatos.push({regla:4,materia:m.id,titulo:`Seguir: ${l.titulo}`,porque:`Vas muy bien en ${l.titulo}: una sesión hoy (otro día) te acerca a dominarla.`,ruta:rutaLeccion(m,l)})}
  // 5. Siguiente habilidad del camino en cada materia (la primera que te toca en su tema)
  for(const m of materias){const d=datosMateria(p,m.id);
    for(const t of m.temas||[{lecciones:m.lecciones||[]}]){const h=habilidadActual(t,d);
      if(h&&!d.lecciones[h.id]){candidatos.push({regla:5,materia:m.id,titulo:`Siguiente: ${h.titulo}`,porque:`Es lo próximo de tu camino en ${m.nombre}.`,ruta:rutaLeccion(m,h)});break}}}
  // 6. Retos del camino: jefes y cofres disponibles
  for(const m of materias){const d=datosMateria(p,m.id);
    for(const t of m.temas||[]){
      if(jefeAbierto(t,d)&&!jefeVencido(t,d))candidatos.push({regla:6,materia:m.id,titulo:`Jefe: ${t.titulo}`,porque:`Ya practicaste todo ${t.titulo}: vence al jefe (mezcla cronometrada).`,ruta:`${rutaTema(m,t)}/jefe`});
      for(const c of cofresTema(t))if(cofreAbierto(c,d)&&!d.extra.cofres?.[c.id])candidatos.push({regla:6,materia:m.id,titulo:`Cofre de ${t.titulo}`,porque:'Un repaso mezclado de 3 habilidades: fija lo aprendido y da XP de premio.',ruta:`${rutaTema(m,t)}/cofre/${c.k}`});
    }}
  // 6. Todo al día: retos de cada materia
  candidatos.push(...extras.filter(c=>c.regla===6));
  if(rep.length&&rep.length<5)candidatos.push({regla:6,titulo:`Repasar ${rep.length} ejercicios`,porque:'Tienes pocos repasos pendientes: despéjalos en un par de minutos.',ruta:'repaso'});

  let lista=candidatos.filter(c=>c.ruta!==excluir);
  if(materia){
    const nm=nombre(materia);
    lista=lista.filter(c=>c.materia===materia);
    return lista[0]||{regla:0,materia,titulo:`¡Al día en ${nm}!`,porque:'Repite lo que quieras o prueba otra materia.',ruta:''};
  }
  // Lo que eligió estudiar en la bienvenida va primero (sin perder el orden de las reglas)
  const gusta=intereses();
  if(gusta.length)lista=[...lista.filter(c=>!c.materia||gusta.includes(c.materia)),...lista.filter(c=>c.materia&&!gusta.includes(c.materia))];
  // Alternancia: tras 3 sesiones seguidas de la misma materia, sugerir otra (primero sus repasos)
  if(cansada){
    const otraRep=Object.entries(porMateria).find(([mid,n])=>mid!==cansada&&n>0);
    if(otraRep)return {regla:'alternar',titulo:`Repasar ${nombre(otraRep[0])}`,porque:`Llevas 3 sesiones seguidas de ${nombre(cansada)}: cambia de aire con ${otraRep[1]} ${otraRep[1]===1?'repaso':'repasos'} de ${nombre(otraRep[0])}.`,ruta:'repaso'};
    const otra=lista.find(c=>c.materia&&c.materia!==cansada&&c.regla!==1);
    if(otra)return {...otra,porque:`Llevas 3 sesiones seguidas de ${nombre(cansada)}: ${otra.porque.charAt(0).toLowerCase()}${otra.porque.slice(1)}`};
  }
  return lista[0]||{regla:0,titulo:'Explorar las materias',porque:'¡Estás al día en todo! Elige una materia nueva o repite lo que más te guste.',ruta:''};
}
