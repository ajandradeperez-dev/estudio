/* Datos de la persona en este teléfono (localStorage 'ciberlab-usuario', aparte del progreso):
   {nombre, materias:[ids que quiere estudiar; vacío = todas], bienvenida:true cuando ya vio el onboarding,
    recordatorio:{activo, hora:'HH:MM'}}
   Se incluye en el respaldo .json. Todo acceso va en try/catch (la app funciona aunque el almacenamiento esté bloqueado). */
const CLAVE='ciberlab-usuario';
const base=()=>({nombre:'',materias:[],bienvenida:false,recordatorio:{activo:false,hora:'20:00'}});
export function usuario(){
  let u=null;try{u=JSON.parse(localStorage.getItem(CLAVE))}catch(e){}
  const b=base();if(!u||typeof u!=='object')return b;
  return {...b,...u,materias:Array.isArray(u.materias)?u.materias.filter(x=>typeof x==='string'):[],recordatorio:{...b.recordatorio,...(u.recordatorio||{})}};
}
export function guardarUsuario(cambios){
  const u={...usuario(),...cambios};
  try{localStorage.setItem(CLAVE,JSON.stringify(u))}catch(e){}
  window.dispatchEvent?.(new Event('usuario'));
  return u;
}
export const CLAVE_USUARIO=CLAVE;
// Materias que le interesan (vacío = todas)
export const intereses=()=>usuario().materias;
