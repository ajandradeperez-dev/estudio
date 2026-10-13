import {cargarLecciones} from '../../nucleo/cargar.js';

export default {
  nombre:'Álgebra',sigla:'ÁL',orden:3,
  descripcion:'Expresiones, ecuaciones lineales y sistemas de ecuaciones, paso a paso.',
  intro:'Del manejo de expresiones a resolver sistemas de ecuaciones. En las respuestas escritas puedes poner solo el número (6) o la igualdad (x = 6).',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
