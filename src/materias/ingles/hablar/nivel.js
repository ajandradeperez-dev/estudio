/* Nivel MCER estimado del alumno a partir de lo que domina (lecciones; la fase de unidades lo afina).
   Un nivel se considera alcanzado cuando domina todas sus lecciones; el nivel actual es el primero que le falta. */
import {progreso,datosMateria} from '../../../nucleo/progreso.js';
import {cargarLecciones} from '../../../nucleo/cargar.js';

const LECCIONES=cargarLecciones(import.meta.glob('../lecciones/*.js',{eager:true}));
export const NIVELES=['A1','A2','B1','B2'];
const nivelDe=l=>(l.nivel||'A1').split(/[–-]/).pop().trim();

export function nivelIngles(p=progreso()){
  const dom=datosMateria(p,'ingles').lecciones;
  for(const n of NIVELES){
    const ls=LECCIONES.filter(l=>nivelDe(l)===n);
    if(ls.length&&!ls.every(l=>dom[l.id]?.dominada))return n;
  }
  return 'B1';
}
