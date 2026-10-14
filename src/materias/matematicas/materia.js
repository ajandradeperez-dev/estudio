import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';

// Antes se llamaba "Álgebra" (id 'algebra'): progreso v6 migra lo guardado y las rutas #algebra/… siguen funcionando (alias).
const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

export default {
  nombre:'Matemáticas',sigla:'MA',icono:'➗',area:'estudio',orden:3,alias:['algebra'],
  descripcion:'Álgebra básica y lineal, cálculo diferencial e integral, paso a paso.',
  intro:'De las expresiones algebraicas al cálculo. En las respuestas escritas puedes poner solo el número (6) o la igualdad (x = 6).',
  temas,
  lecciones:habilidades(temas)
};
