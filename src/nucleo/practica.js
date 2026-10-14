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

// Profundidad de un ejercicio de lección o de banco (ver generadores/profundidad.js): el ejercicio, la lección o el banco la declaran
const PROF_BANCO={'ciber/incidentes':'escenario','ciber/examen':'basico'};
export const profundidadLeccion=(h,ej)=>ej.profundidad||h.profundidad||'basico';
export const profundidadBanco=(h,x)=>x.profundidad||PROF_BANCO[h.banco]||'basico';
export const claveBasicoLeccion=ref=>`l:${ref}`;
export const claveBasicoBanco=ref=>`b:${ref}`;

/* Una pregunta independiente. opciones:
   nivel (generador) · fuente ('gen' | 'leccion' | 'banco'; si no, al azar entre las que tenga)
   vistos (claves usadas en la sesión: no se repite) · soloProduccion (sin opción múltiple) · rng
   retirados ({has(clave)}: básicos retirados que no deben salir; si en un nivel solo quedan retirados, se sube de nivel y,
   si aun así no hay, se prueba otra fuente). Devuelve null si todo lo que tiene la habilidad está retirado. */
export function preguntaHabilidad(m,h,{nivel=1,fuente,vistos=new Set(),soloProduccion=true,rng=crearRng(),retirados=null}={}){
  const fs=fuentes(h);if(!fs.length)return null;
  const primera=fuente&&fs.includes(fuente)?fuente:rng.elegir(fs),orden=[primera,...fs.filter(x=>x!==primera)];
  const comun={habilidad:h.id,materia:m.id,tituloHabilidad:h.titulo};
  const fuera=k=>!!(k&&retirados?.has(k));
  for(const f of orden){
    if(f==='gen'){
      for(let n=Math.round(nivel);n<=5;n++){
        const p=crear(h.gen,n,{vistos,evitar:retirados?q=>fuera(q.basico):undefined});
        if(p&&!fuera(p.basico))return {...p,...comun,ref:`${m.id}/g/${h.id}/${p.nivel}`};
      }
      continue;
    }
    if(f==='leccion'){
      const todos=ejerciciosDe(m,h).filter(x=>(!soloProduccion||esProduccion(x.ej))&&!fuera(profundidadLeccion(h,x.ej)==='basico'?claveBasicoLeccion(x.ref):null));
      if(!todos.length)continue;
      const libres=todos.filter(x=>!vistos.has(x.ref)),x=rng.elegir(libres.length?libres:todos);vistos.add(x.ref);
      const prof=profundidadLeccion(h,x.ej);
      return {...deBanco(x.ej),...comun,ref:x.ref,profundidad:prof,basico:prof==='basico'?claveBasicoLeccion(x.ref):null};
    }
    const lista=bancoDe(h).filter(x=>!fuera(profundidadBanco(h,x)==='basico'?claveBasicoBanco(x.ref):null));
    if(!lista.length)continue;
    const libres=lista.filter(x=>!vistos.has(x.ref)),x=rng.elegir(libres.length?libres:lista);vistos.add(x.ref);
    const prof=profundidadBanco(h,x);
    return {...x,...comun,profundidad:prof,basico:prof==='basico'?claveBasicoBanco(x.ref):null};
  }
  return null;
}
// Un básico retirado concreto, para el refuerzo (vuelve una vez tras fallar algo de nivel superior)
export function preguntaDeBasico(m,h,clave){
  if(clave.startsWith('l:')){const ref=clave.slice(2),x=ejerciciosDe(m,h).find(e=>e.ref===ref);
    return x?{...deBanco(x.ej),habilidad:h.id,materia:m.id,ref,profundidad:'basico',basico:clave,refuerzo:true}:null}
  if(clave.startsWith('b:')){const ref=clave.slice(2),x=bancoDe(h).find(e=>e.ref===ref);return x?{...x,habilidad:h.id,materia:m.id,profundidad:'basico',basico:clave,refuerzo:true}:null}
  if(h.gen)for(let n=1;n<=5;n++){const p=crear(h.gen,n,{evitar:q=>q.basico!==clave});if(p?.basico===clave)return {...p,habilidad:h.id,materia:m.id,ref:`${m.id}/g/${h.id}/${p.nivel}`,refuerzo:true}}
  return null;
}
