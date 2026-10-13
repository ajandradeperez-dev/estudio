import {cargarLecciones} from '../../nucleo/cargar.js';
import * as hablar from './hablar/index.js';

export default {
  nombre:'Inglés',sigla:'EN',orden:2,
  descripcion:'De A1 a A2: la gramática y el vocabulario más frecuentes, y práctica de habla con voz.',
  intro:'Ordenado por frecuencia de uso, de A1 a A2, siguiendo las 4 vertientes de Nation: escuchar, hablar y escribir para comunicar, la forma (gramática y pronunciación) y la fluidez.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true})),
  // Tarjeta grande al principio de la página de la materia
  destacado:{ruta:'ingles/hablar',titulo:'🎙️ Hablar',desc:'Pronunciación con tu voz, diálogos guiados y conversación libre con IA.'},
  secciones:{
    hablar:{titulo:'🎙️ Hablar',grupo:'Practicar',desc:'Pronunciación, diálogos guiados y conversación con IA.',modulo:hablar}
  },
  // Ejercicios de habla en "Repasar hoy": w/<palabra>, s/<sonido>/<i>, f/<nivel>/<i>, d/<diálogo>/<turno>, x/<id>
  ejercicioRepaso(clave){const [tipo,...partes]=clave.split('/');return hablar.ejercicioHabla(tipo,partes)},
  // Bloque en "Mi progreso": misión, mapa MCER y medallas (corto: nada de estadísticas largas)
  progresoHtml:()=>`<div style="margin-top:12px">${hablar.htmlMision()}</div><div class="prog-k" style="margin-top:12px">Mapa MCER</div>${hablar.htmlMapa()}<div class="prog-k" style="margin-top:12px">Medallas</div>${hablar.htmlMedallas()}`
};
