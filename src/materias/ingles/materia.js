import {cargarLecciones} from '../../nucleo/cargar.js';

export default {
  nombre:'Inglés',sigla:'EN',orden:2,
  descripcion:'De A1 a A2: la gramática y el vocabulario más frecuentes, explicados en español.',
  intro:'Ordenado por frecuencia de uso, de A1 a A2. Casi toda la práctica es escribir y traducir: así se aprende a producir el idioma, no solo a reconocerlo.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
