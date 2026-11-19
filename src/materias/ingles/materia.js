import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';
import * as hablar from './hablar/index.js';
import * as simulacros from './simulacros/vistas.js';

const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

export default {
  nombre:'Inglés',sigla:'EN',icono:'🇺🇸',area:'estudio',orden:2,
  descripcion:'De A1 a B2: gramática y vocabulario más frecuentes, lecturas, escuchas, escritura y práctica de habla con voz.',
  intro:'Ordenado por frecuencia de uso, de A1 a B2, siguiendo las 4 vertientes de Nation: escuchar, hablar y escribir para comunicar, la forma (gramática y pronunciación) y la fluidez.',
  temas,
  lecciones:habilidades(temas),
  // Tarjetas grandes al principio de la página de la materia
  destacados:[{ruta:'estudio/ingles/hablar',titulo:'🎙️ Hablar',desc:'Pronunciación con tu voz, diálogos guiados y conversación libre con IA.'},
    {ruta:'estudio/ingles/simulacros',titulo:'🏁 Simulacros y prueba de nivel',desc:'Exámenes de práctica A1–B2 con escucha y habla con IA, y una prueba de nivel adaptativa.'}],
  secciones:{
    hablar:{titulo:'🎙️ Hablar',grupo:'Practicar',desc:'Pronunciación, diálogos guiados y conversación con IA.',modulo:hablar},
    simulacros:{titulo:'🏁 Simulacros',grupo:'Practicar',desc:'Simulacros A1–B2 con lectura, escritura, escucha, uso del idioma y habla con IA; prueba de nivel.',modulo:simulacros,propia:true}
  },
  // Ejercicios en "Repasar hoy": m/<simulacro>/<parte>/<tarea>/<pregunta> (simulacros) y, de habla, w/<palabra>, s/<sonido>/<i>, f/<nivel>/<i>, d/<diálogo>/<turno>, x/<id>
  ejercicioRepaso(clave){const [tipo,...partes]=clave.split('/');return tipo==='m'?simulacros.ejercicioSimulacro(partes):hablar.ejercicioHabla(tipo,partes)},
  // Reglas propias para "¿Qué sigue?": misión de habla (2), sonido más débil (3), jefe o conversación (6)
  recomendar:p=>hablar.recomendarIngles(p),
  // Bloque en "Mi progreso": misión, mapa MCER y medallas (corto: nada de estadísticas largas)
  progresoHtml:()=>`<div style="margin-top:12px">${hablar.htmlMision()}</div><div class="prog-k" style="margin-top:12px">Mapa MCER</div>${hablar.htmlMapa()}<div class="prog-k" style="margin-top:12px">Medallas</div>${hablar.htmlMedallas()}`
};
