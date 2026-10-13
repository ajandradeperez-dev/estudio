import {cargarLecciones} from '../../nucleo/cargar.js';

export default {
  nombre:'Ciencia de datos',sigla:'CD',orden:4,
  descripcion:'Estadística descriptiva, tipos de variables y primeros pasos con pandas.',
  intro:'Las bases para analizar datos: cómo resumirlos, qué tipo de variable tienes y cómo empezar a explorarlos con pandas en Python.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
