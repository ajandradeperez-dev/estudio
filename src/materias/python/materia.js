/* Curso de Python (💼 Cursos): de cero al nivel PCEP y lo básico de PCAP. Habilidades generadas ('pyc/…') con
   «predice la salida», «completa», «encuentra el error», «ordena las líneas» y casos de aplicación, y dos herramientas
   con Python de verdad en el teléfono (Pyodide, que se descarga solo al usarlo y luego funciona sin internet):
   el ▶️ editor y el 🧪 laboratorio («escribe la función», corregido con pruebas). */
import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';
import * as editor from './secciones/editor.js';
import * as laboratorio from './secciones/laboratorio.js';

const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

// Las claves forman la ruta (#cursos/python/editor) y se guardan en el progreso: no las cambies.
const secciones={
  editor:{titulo:'Editor de Python',grupo:'Herramientas',desc:'Escribe y ejecuta programas de Python en el teléfono.',modulo:editor,propia:true,habilidad:'print'},
  laboratorio:{titulo:'Laboratorio: escribe la función',grupo:'Herramientas',desc:'39 ejercicios corregidos con pruebas, como un juez de programación.',modulo:laboratorio,propia:true}
};

export default {
  nombre:'Python',sigla:'PY',icono:'🐍',area:'cursos',tono:'python',orden:3,
  descripcion:'Programar desde cero hasta el nivel PCEP: variables, decisiones, bucles, listas, funciones, archivos y clases.',
  intro:'Aprende Python practicando: predice qué imprime un programa, completa código, encuentra errores y escribe funciones que se prueban con Python de verdad aquí mismo. Cada tema empieza con una mini-lección y siempre tienes «No sé cómo empezar».',
  ejemplosResueltos:1,
  temas,
  lecciones:habilidades(temas),
  secciones
};
