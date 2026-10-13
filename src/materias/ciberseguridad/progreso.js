/* Progreso propio de Ciberseguridad (se guarda en datosMateria(...).extra del núcleo) */
import {registrarEjercicio,sumarXP,cambiarExtra} from '../../nucleo/progreso.js';

const ID='ciberseguridad';

// Una respuesta del examen o del laboratorio: cuenta para la meta, da XP y, si se falla, va al repaso
export function ejercicio(clave,correcto){registrarEjercicio({materia:ID,ref:`${ID}/${clave}`,correcto})}

// Marca algo como resuelto en una lista de extra; la primera vez suma XP. Devuelve si era nuevo.
function resolver(lista,i,xp){
  const nuevo=cambiarExtra(ID,e=>{e[lista]=Array.isArray(e[lista])?e[lista]:[];if(e[lista].includes(i))return false;e[lista].push(i);return true});
  if(nuevo)sumarXP(ID,xp);
  return nuevo;
}
// Los casos y escenarios se guardan por posición: agrega los nuevos al final de sus listas en datos/
export const marcarCaso=i=>resolver('casos',i,20);
export const marcarEscenarioVpn=i=>resolver('vpn',i,15);
// Se queda con el mejor porcentaje, por si cambia el número de preguntas
export function registrarExamen(aciertos,total){
  cambiarExtra(ID,e=>{const x=e.examen;if(!x||!(x.total>0)||aciertos/total>x.aciertos/x.total)e.examen={aciertos,total}});
}
