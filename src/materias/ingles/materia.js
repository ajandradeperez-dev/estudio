import {cargarLecciones} from '../../nucleo/cargar.js';

export default {
  nombre:'Inglés',sigla:'EN',orden:2,
  descripcion:'Gramática y vocabulario para el día a día y el trabajo, explicados en español.',
  intro:'Gramática esencial y vocabulario útil, con ejemplos traducidos y práctica corta. Las tarjetas son para decir la respuesta en voz alta antes de voltearlas.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
