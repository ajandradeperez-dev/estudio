/* Preguntas de una habilidad desde sus fuentes: generador (al nivel pedido), lección escrita (rondas) o banco.
   Las usan la práctica de una habilidad, los cofres, los jefes y el repaso. Sin DOM. */
import {crear,GENERADORES,BANCOS} from './generadores/index.js';
import {deBanco} from './ejercicios.js';
import {esProduccion,indiceGlobal} from './metodo.js';
import {crearRng} from './rng.js';

export const generadorDe=h=>h.gen&&GENERADORES[h.gen];
export const fuentes=h=>[generadorDe(h)?'gen':null,h.rondas?.length?'leccion':null,h.banco&&BANCOS[h.banco]?'banco':null].filter(Boolean);
// Ejercicios de la lección con su referencia de repaso
export const ejerciciosDe=(m,h)=>(h.rondas||[]).flatMap((r,ri)=>r.map((ej,i)=>({ej,ref:`${m.id}/l/${h.id}/${indiceGlobal(h,ri,i)}`})));
const bancoDe=h=>{try{return BANCOS[h.banco]()}catch(e){return []}};

/* Una pregunta independiente. opciones:
   nivel (generador) · fuente ('gen' | 'leccion' | 'banco'; si no, al azar entre las que tenga)
   vistos (claves usadas en la sesión: no se repite) · soloProduccion (sin opción múltiple) · rng */
export function preguntaHabilidad(m,h,{nivel=1,fuente,vistos=new Set(),soloProduccion=true,rng=crearRng()}={}){
  const fs=fuentes(h);if(!fs.length)return null;
  const f=fuente&&fs.includes(fuente)?fuente:rng.elegir(fs);
  const comun={habilidad:h.id,materia:m.id,tituloHabilidad:h.titulo};
  if(f==='gen'){const p=crear(h.gen,nivel,{vistos});return {...p,...comun,ref:`${m.id}/g/${h.id}/${p.nivel}`}}
  if(f==='leccion'){
    const todos=ejerciciosDe(m,h).filter(x=>!soloProduccion||esProduccion(x.ej)),libres=todos.filter(x=>!vistos.has(x.ref));
    const x=rng.elegir(libres.length?libres:todos);vistos.add(x.ref);
    return {...deBanco(x.ej),...comun,ref:x.ref};
  }
  const lista=bancoDe(h),libres=lista.filter(x=>!vistos.has(x.ref));
  const x=rng.elegir(libres.length?libres:lista);vistos.add(x.ref);
  return {...x,...comun};
}
