/* Unidades de Inglés (TBLT): cada una termina en una tarea real, el jefe. Vencer al jefe desbloquea la siguiente.
   lecciones: forma (ids de lecciones/)   dialogos: práctica de habla   sonido: pronunciación foco   jefe: id del diálogo-reto
   La fase de contenido añade escucha, chunks y fluidez a cada unidad.
   El orden importa y los ids se guardan en el progreso: agrega unidades nuevas al final y no cambies los ids. */
import {progreso,datosMateria} from '../../../nucleo/progreso.js';

export const UNIDADES=[
  {id:'presentarte',nivel:'A1',titulo:'Presentarte',tarea:'Preséntate a alguien nuevo: nombre, origen, trabajo y por qué estudias inglés.',
   lecciones:['verbo-to-be'],dialogos:['presentarte'],sonido:'th',jefe:'presentarte'},
  {id:'rutina-trabajo',nivel:'A1',titulo:'Tu rutina y el trabajo',tarea:'Conversa con un compañero de oficina sobre tu fin de semana y tu día.',
   lecciones:['presente-simple'],dialogos:['small-talk'],sonido:'s_final',jefe:'small-talk'},
  {id:'pedir-comprar',nivel:'A1',titulo:'Pedir y comprar',tarea:'Pide una comida completa en un restaurante, de la orden a la cuenta.',
   lecciones:['can'],dialogos:['de-compras','pedir-comida'],sonido:'v_b',jefe:'pedir-comida'},
  {id:'ciudad-viajes',nivel:'A1',titulo:'En la ciudad y de viaje',tarea:'Documenta tu vuelo en el aeropuerto.',
   lecciones:['there-is-there-are','presente-continuo'],dialogos:['direcciones','aeropuerto'],sonido:'i_ee',jefe:'aeropuerto'},
  {id:'contar-pasado',nivel:'A2',titulo:'Contar lo que pasó',tarea:'Explícale al doctor qué te pasa y desde cuándo.',
   lecciones:['pasado-simple'],dialogos:['llamada','doctor'],sonido:'ed',jefe:'doctor'},
  {id:'trabajo-ti',nivel:'A2',titulo:'Trabajo en TI',tarea:'Pasa una entrevista para un puesto de soporte técnico.',
   lecciones:['futuro-going-to-will','vocabulario-trabajo'],dialogos:['problema-tecnico','entrevista'],sonido:'sh_ch',jefe:'entrevista'}
];
export const NIVELES_MCER=['A1','A2','B1','B2'];
export const unidad=id=>UNIDADES.find(u=>u.id===id);

// Estado de cada unidad: 'completa' (jefe vencido), 'actual' (desbloqueada) o 'bloqueada'.
// Desbloqueo: la primera siempre; las demás al vencer al jefe anterior o si la ubicación demostró que dominas la unidad anterior.
export function estadoUnidades(p=progreso()){
  const d=datosMateria(p,'ingles'),hechas=d.extra.unidades||{},lec=d.lecciones;
  const porUbicacion=u=>u.lecciones.every(l=>lec[l]?.dominada&&lec[l].via==='ubicacion');
  const res={};
  UNIDADES.forEach((u,k)=>{
    const ant=UNIDADES[k-1],abierta=k===0||!!hechas[ant.id]?.jefe||porUbicacion(ant);
    res[u.id]=hechas[u.id]?.jefe?'completa':abierta?'actual':'bloqueada';
  });
  return res;
}
// Unidad donde estás: la más avanzada que tienes abierta y sin terminar (null si las terminaste todas)
export function unidadActual(p=progreso()){
  const e=estadoUnidades(p);
  return [...UNIDADES].reverse().find(u=>e[u.id]==='actual')||null;
}
// Nivel MCER: el de tu unidad actual; si terminaste todas, el nivel siguiente
export function nivelMCER(p=progreso()){
  const u=unidadActual(p);
  if(u)return u.nivel;
  return NIVELES_MCER[NIVELES_MCER.indexOf(UNIDADES[UNIDADES.length-1].nivel)+1]||'B2';
}
