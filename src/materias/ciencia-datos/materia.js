import {cargarTemas} from '../../nucleo/cargar.js';
import defs from './temas.js';

const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

export default {
  nombre:'Ciencia de datos',sigla:'CD',icono:'📊',area:'estudio',orden:4,
  descripcion:'Estadística, probabilidad, pandas, visualización y machine learning básico.',
  intro:'Las bases para analizar datos: cómo resumirlos, qué tipo de variable tienes y cómo explorarlos con pandas en Python.',
  temas,
  lecciones:temas.flatMap(t=>t.lecciones)
};
