/* Curso de Excel (💼 Cursos): temas con habilidades generadas (fórmulas que se verifican por resultado en una mini hoja)
   y tres herramientas propias: hoja libre, simulador de tabla dinámica y ordenar/filtrar/formato. */
import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';
import * as hoja from './secciones/hoja.js';
import * as dinamica from './secciones/dinamica.js';
import * as organizar from './secciones/organizar.js';

const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

// Las claves forman la ruta (#cursos/excel/hoja) y se guardan en el progreso: no las cambies.
const secciones={
  hoja:{titulo:'Hoja libre',grupo:'Herramientas',desc:'Una hoja con datos de ejemplo para probar cualquier fórmula.',modulo:hoja,
    intro:'Escribe fórmulas como en Excel (en español o en inglés) y mira el resultado al instante.',
    como:['Elige unos datos de ejemplo.','Toca una celda vacía y escribe la fórmula en la barra (empieza con =).','Con la fórmula abierta, toca celdas para escribir sus referencias; dos toques seguidos hacen un rango.','Toca ✓ o Enter para guardarla.'],habilidad:'operadores'},
  dinamica:{titulo:'Simulador de tabla dinámica',grupo:'Herramientas',desc:'Elige filas, columnas y valores sobre un conjunto de ventas y mira el resumen.',modulo:dinamica,
    intro:'Arma una tabla dinámica como en Excel: elige qué va en Filas, en Columnas y en Valores.',
    como:['Mira los datos de origen.','Elige un campo para Filas y, si quieres, otro para Columnas.','Elige Suma, Cuenta o Promedio de Ventas.','Usa el filtro de Mes para ver solo una parte.'],habilidad:'tabla-dinamica'},
  organizar:{titulo:'Ordenar, filtrar y formato',grupo:'Herramientas',desc:'Ordena, filtra, resalta con formato condicional y prueba una validación de datos.',modulo:organizar,
    intro:'Lo mismo que harías en la pestaña Datos e Inicio de Excel, sobre un inventario de ejemplo.',
    como:['Elige por qué columna ordenar y en qué sentido.','Filtra por categoría.','Activa el formato condicional para ver los productos bajo el mínimo.','Escribe un valor para probar la validación.'],habilidad:'formato-condicional'}
};

export default {
  nombre:'Excel',sigla:'XL',icono:'📊',area:'cursos',tono:'excel',orden:2,
  descripcion:'Fórmulas, funciones, búsqueda, tablas dinámicas y gráficos, practicando en una mini hoja de cálculo.',
  intro:'Aprende Excel escribiendo fórmulas de verdad sobre tablas de ventas, calificaciones, inventario y nómina. Las funciones van en español (como Excel en español) con su nombre en inglés entre paréntesis, y tu fórmula se revisa por su resultado: cualquier fórmula correcta vale.',
  temas,
  lecciones:habilidades(temas),
  secciones
};
