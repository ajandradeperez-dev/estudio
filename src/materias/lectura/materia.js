/* 📚 Lectura: libros libres (dominio público o licencia abierta) para leer en el teléfono, también sin internet.
   Biblioteca, portada con licencia y atribución, y lector (lector.js). Los textos los arma node scripts/libros.mjs en
   public/libros/<libro>/ y se descargan por capítulo al abrirlos. Avance en el progreso: materias.lectura.extra.libros[id] =
   {leidos:{<capítulo>: 'AAAA-MM-DD'}, ultimo}. Las palabras guardadas son tarjetas del repaso ('lectura/t/<id>').
   No tiene habilidades ni examen de ubicación: su página es la biblioteca (vistaPropia). */
import {vistaBiblioteca,rutaLibro} from './lector.js';

export default {
  nombre:'Lectura',icono:'📚',area:'estudio',orden:9,
  descripcion:'Libros libres en inglés y lecturas de apoyo de los cursos, con preguntas, audio y palabras al repaso.',
  intro:'Lee libros libres en el teléfono: fábulas, Alicia y Sherlock Holmes en inglés, y lecturas de apoyo de Python y estadística.',
  lecciones:[],
  vistaPropia:m=>vistaBiblioteca(m),
  // La clave forma la ruta (#estudio/lectura/libro/<id>/<capítulo>): no la cambies.
  secciones:{
    libro:{titulo:'Libro',grupo:'Libros',desc:'Portada y capítulos de un libro.',modulo:{ruta:rutaLibro},propia:true}
  }
};
