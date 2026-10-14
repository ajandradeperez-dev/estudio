/* Bancos de ejercicios fijos (lo que no se puede generar al azar): casos narrativos del laboratorio de incidentes y las
   preguntas del examen rápido de Ciberseguridad. Se mezclan con lo generado en sus habilidades. Las referencias son las
   mismas que ya usaba el repaso ('ciberseguridad/incidentes/<caso>/<a|b>' y 'ciberseguridad/examen/<n>'). */
import {incidents} from '../../materias/ciberseguridad/datos/incidentes.js';
import {quiz} from '../../materias/ciberseguridad/datos/preguntas.js';
import {deBanco} from '../ejercicios.js';

const R_INC='Ante un incidente: identifica el patrón en los registros, contén primero (bloquear, aislar) y luego corrige la causa. Siempre defensivo.';
export const bancos={
  'ciber/incidentes':()=>incidents.flatMap((x,i)=>[
    {tipo:'opcion',enunciado:`<b>${x.t}</b><br>${x.q}`,codigo:x.log,opciones:x.o,correcta:x.a,respuesta:x.o[x.a],explicacion:x.ex,regla:R_INC,ref:`ciberseguridad/incidentes/${i}/a`,intro:false},
    {tipo:'opcion',enunciado:`<b>${x.t}</b><br>Ya sabes qué ocurre: <b>${x.o[x.a]}</b>. ${x.d}`,codigo:x.log,opciones:x.do,correcta:x.da,respuesta:x.do[x.da],explicacion:x.ex,regla:R_INC,ref:`ciberseguridad/incidentes/${i}/b`,intro:false}
  ]),
  'ciber/examen':()=>quiz.map((q,i)=>({...deBanco(q),ref:`ciberseguridad/examen/${i}`,intro:false}))
};
