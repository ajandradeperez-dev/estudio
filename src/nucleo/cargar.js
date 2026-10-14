/* Carga de lecciones y temas de una materia.
   - Materia sin temas: lecciones: cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
   - Materia con temas: temas.js (datos puros, los lee también npm run revisar) + carpetas temas/<tema>/NN-id.js
       const temas=cargarTemas(import.meta.glob('./temas/*\/*.js',{eager:true}),defs);
       export default {…, temas, lecciones:habilidades(temas)}
   El id de una lección es el nombre del archivo sin el prefijo numérico: 01-presente-simple.js → 'presente-simple'.
   No renombres un archivo ya publicado: el progreso guardado usa ese id. */
import {GENERADORES,BANCOS} from './generadores/index.js';

const idDe=k=>k.split('/').pop().replace(/\.js$/,'').replace(/^\d+-/,'');
export function cargarLecciones(glob){
  return Object.keys(glob).sort().map(k=>({...glob[k].default,id:idDe(k)}));
}

/* Cada tema: {id, titulo, icono, descripcion, nodos:[…]} y los nodos, en orden, son:
     {id, gen?, banco?, titulo?, explicacion?}   habilidad: su lección (temas/<tema>/NN-<id>.js, si existe), su generador y/o su banco
     {ir:'<sección>[/…]', titulo, icono?}        enlace a una herramienta o pantalla de la materia (no cuenta para el dominio)
     {titulo, proximo:true}                       todavía no existe: se ve bloqueado como "Próximamente"
   Una habilidad sin lección, generador ni banco registrado se muestra como "Próximamente" (aparece sola cuando exista).
   Las lecciones de la carpeta que no están en nodos se agregan al final de las habilidades del tema.
   El progreso se guarda por materia + id de habilidad (no por tema): el id debe ser único en toda la materia. */
export function cargarTemas(glob,defs){
  const archivos={};
  for(const k of Object.keys(glob).sort()){const t=k.split('/').at(-2);(archivos[t]=archivos[t]||{})[idDe(k)]=glob[k].default}
  return defs.map(d=>{
    const lec=archivos[d.id]||{},usadas=new Set();
    const nodo=n=>{
      if(n.proximo||n.ir)return {...n};
      const l=lec[n.id];if(l)usadas.add(n.id);
      const h={...(l||{}),...n,id:n.id,tema:d.id,titulo:n.titulo||l?.titulo||n.id,resumen:n.resumen||l?.resumen||''};
      const disponible=!!(l||(n.gen&&GENERADORES[n.gen])||(n.banco&&BANCOS[n.banco]));
      return disponible?{...h,tipoNodo:'habilidad'}:{titulo:h.titulo,proximo:true,id:n.id};
    };
    const nodos=(d.nodos||[]).map(nodo);
    // lecciones de la carpeta que no aparecen en nodos: antes de los "Próximamente"
    const extra=Object.keys(lec).filter(id=>!usadas.has(id)).map(id=>nodo({id}));
    const i=nodos.findIndex(n=>n.proximo);
    if(extra.length)nodos.splice(i<0?nodos.length:i,0,...extra);
    const habilidades=nodos.filter(n=>n.tipoNodo==='habilidad');
    return {...d,nodos,lecciones:habilidades,proximas:nodos.filter(n=>n.proximo).map(n=>n.titulo)};
  });
}
// Todas las habilidades de la materia, en orden de temas (m.lecciones las usa todo el motor)
export const habilidades=temas=>temas.flatMap(t=>t.lecciones);
