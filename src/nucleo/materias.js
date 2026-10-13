/* Registro de materias: cada carpeta src/materias/<id>/ con un materia.js se carga sola.
   El id de la materia es el nombre de su carpeta; el id de una lección es el nombre de su archivo sin el prefijo numérico. */
import {ejerciciosLeccion} from './metodo.js';

const mods=import.meta.glob('../materias/*/materia.js',{eager:true});

export const materias=Object.entries(mods)
  .map(([ruta,m])=>({...m.default,id:ruta.split('/')[2]}))
  .sort((a,b)=>(a.orden??99)-(b.orden??99)||a.nombre.localeCompare(b.nombre));
export const materia=id=>materias.find(m=>m.id===id);

export const leccion=(m,id)=>(m.lecciones||[]).find(l=>l.id===id);

// Busca un ejercicio a partir de su referencia de repaso '<materia>/<clave>'.
// Claves de lección: 'l/<lección>/<índice>'. Otras claves las resuelve la materia con ejercicioRepaso(clave).
export function ejercicioPorRef(ref){
  const [mid,...resto]=ref.split('/'),m=materia(mid); if(!m)return null;
  if(resto[0]==='l'){
    const l=leccion(m,resto[1]),ej=l&&ejerciciosLeccion(l)[+resto[2]];
    return ej?{materia:m,titulo:l.titulo,ej}:null;
  }
  const r=m.ejercicioRepaso?.(resto.join('/'));
  return r?{materia:m,...r}:null;
}
