// Para usar en materia.js: lecciones: cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
// Se ordenan por nombre de archivo (01-…, 02-…) y el id es el nombre sin el prefijo: 01-presente-simple.js → 'presente-simple'.
// No renombres un archivo ya publicado: el progreso guardado usa ese id.
export function cargarLecciones(glob){
  return Object.keys(glob).sort().map(k=>({...glob[k].default,id:k.split('/').pop().replace(/\.js$/,'').replace(/^\d+-/,'')}));
}
