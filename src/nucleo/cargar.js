// Para usar en materia.js: lecciones: cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
// Se ordenan por nombre de archivo (01-…, 02-…) y el id es el nombre sin el prefijo: 01-presente-simple.js → 'presente-simple'.
// No renombres un archivo ya publicado: el progreso guardado usa ese id.
const idDe=k=>k.split('/').pop().replace(/\.js$/,'').replace(/^\d+-/,'');
export function cargarLecciones(glob){
  return Object.keys(glob).sort().map(k=>({...glob[k].default,id:idDe(k)}));
}

/* Materias con temas: temas: cargarTemas(import.meta.glob('./temas/*\/*.js',{eager:true}), [{id, titulo, icono, descripcion, proximas?}, …])
   Cada tema es una carpeta temas/<id>/ con sus lecciones NN-nombre.js; el orden de los temas es el de la lista.
   proximas: títulos de lecciones que todavía no existen (se ven como "Próximamente", bloqueadas).
   Un tema sin carpeta ni lecciones queda entero como "Próximamente".
   El progreso se guarda por materia e id de lección (no por tema): una lección se puede mover de tema sin perder nada,
   pero su id debe ser único en toda la materia. */
export function cargarTemas(glob,defs){
  const porTema={};
  for(const k of Object.keys(glob).sort()){const t=k.split('/').at(-2);(porTema[t]=porTema[t]||[]).push(k)}
  const temas=defs.map(d=>({proximas:[],...d,lecciones:(porTema[d.id]||[]).map(k=>({...glob[k].default,id:idDe(k),tema:d.id}))}));
  // Carpetas de temas que no están en la lista: se muestran al final para no esconder lecciones (npm run revisar lo marca como error)
  for(const t of Object.keys(porTema))if(!defs.some(d=>d.id===t))temas.push({id:t,titulo:t,icono:'📁',descripcion:'',proximas:[],lecciones:porTema[t].map(k=>({...glob[k].default,id:idDe(k),tema:t}))});
  return temas;
}
