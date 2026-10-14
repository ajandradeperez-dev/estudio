/* 📚 Lectura (⚪ Próximamente): agregar libros, marcar el avance por capítulos, guardar citas y notas y repasar ideas clave.
   Por ahora solo se ve la pantalla de "Próximamente": no tiene lecciones, no cuenta para la meta ni la racha y no aparece en
   "Lo siguiente para ti" (proximo:true). Modelo de datos previsto (irá en el progreso, materias.lectura.extra):
   libros:[{id, titulo, autor, portada?,                      // portada: URL de datos opcional (foto del libro)
            capitulos:[{titulo, leido}],                      // leido: fecha 'AAAA-MM-DD' o null
            notas:[{texto, capitulo?, fecha}],                // notas propias (se escapan con esc() al mostrarlas)
            citas:[{texto, pagina?, fecha}],                  // citas textuales; las ideas clave entran al repaso
            meta_paginas_dia}]                                // meta opcional de páginas por día (no cuenta para la racha)
   Al implementarlo: sube VERSION en nucleo/progreso.js si cambia el formato guardado. */
export default {
  nombre:'Lectura',icono:'📚',area:'estudio',orden:9,proximo:true,
  descripcion:'Tus libros, avance por capítulos, citas y notas. Próximamente.',
  intro:'Agrega tus libros, marca tu avance por capítulos, guarda citas y notas, y repasa ideas clave.',
  lecciones:[]
};
