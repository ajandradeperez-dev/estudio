/* ⚡ Electrónica · ayudantes de los generadores (sin DOM).
   probE(): respuesta numérica con unidad, que acepta notación de ingeniería (4.7k, 220u, 1M, «10 mA») con tolerancia
   relativa; los errores típicos se detectan igual. Plantillas por nivel como en Matemáticas (crearGen). */
import {paso,final,marca,crearGen} from './extensiones/base.js';
import {leerIng,igualIng,fmtIng} from '../electronica/unidades.js';
export {paso,final,marca,crearGen,leerIng,igualIng,fmtIng};
export {resolver,reqEntre,thevenin} from '../electronica/circuito.js';

export const NIV={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
const R=(x,c=4)=>+(+x).toPrecision(c);
// respuesta con unidad (fmtIng) o número simple (sin unidad: dec decimales)
export function probE({enunciado,v,unidad='',pasos,errores=[],comprobar,tol=0.02,dec,pista,regla}){
  const txt=unidad?fmtIng(v,unidad):String(dec!==undefined?+(+v).toFixed(dec):R(v));
  const ok=e=>unidad?igualIng(e,v,tol):(()=>{const x=leerIng(e);return Number.isFinite(x)&&Math.abs(x-v)<=Math.max(tol*Math.abs(v),dec!==undefined?0.51*10**-dec:1e-9)})();
  const errs=errores.filter(([x])=>Number.isFinite(x)&&!ok(unidad?fmtIng(x,unidad):String(R(x))))
    .map(([x,por])=>({valor:unidad?fmtIng(x,unidad):String(R(x)),si:e=>unidad?igualIng(e,x,tol):(()=>{const y=leerIng(e);return Number.isFinite(y)&&Math.abs(y-x)<=Math.max(tol*Math.abs(x),1e-9)})(),por}));
  return {enunciado,respuesta:txt,verificar:ok,pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:txt}],errores:errs,comprobar:comprobar||null,teclado:'mat',pista,regla};
}
// Elegir valores comerciales (E12) para que los ejercicios se vean reales
export const E12=[10,12,15,18,22,27,33,39,47,56,68,82];
export const resistencia=(r,{min=1,max=4}={})=>r.elegir(E12)*10**r.entero(min,max)/10;   // 1 Ω … 100 kΩ aprox.
export const ohm=x=>fmtIng(x,'Ω'),volt=x=>fmtIng(x,'V'),amp=x=>fmtIng(x,'A'),watt=x=>fmtIng(x,'W');
export const casi=(a,b,t=1e-6)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b));
// Opción sí/no para conceptos (sin texto ambiguo)
import {limpiar} from './verificar.js';
export const esSi=e=>/^\s*s[ií](?![a-zñ])/i.test(limpiar(e)),esNo=e=>/^\s*no(?![a-zñ])/i.test(limpiar(e));
export function siNoE({enunciado,es,pasos,por,regla,pista,comprobar}){
  const r=es?'Sí':'No';
  return {enunciado:`${enunciado} Responde sí o no.`,respuesta:r,verificar:es?esSi:esNo,pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:r}],errores:[{valor:es?'No':'Sí',si:es?esNo:esSi,por}],regla,pista,comprobar};
}
// Respuesta de texto corta (una palabra de una lista) para conceptos
import {normalTexto} from './verificar.js';
export function textoE({enunciado,respuesta,aceptadas=[respuesta],pasos,errores=[],regla,pista,comprobar}){
  const ok=e=>aceptadas.some(a=>normalTexto(a)===normalTexto(e));
  return {enunciado,respuesta,verificar:ok,aceptadas,pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:respuesta}],errores:errores.map(([v,por])=>({valor:v,si:e=>normalTexto(e)===normalTexto(v),por})),regla,pista,comprobar};
}
