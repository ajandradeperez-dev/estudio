/* Ayudantes para las extensiones (tarjetas y problemas de aplicación con contexto real). Sin DOM.
   prob({enunciado, v, dec, unidad, pasos, errores:[[valor, por]], regla, pista, comprobar}) → pregunta numérica:
   acepta el número con o sin unidad, con coma o punto decimal, o como fracción a/b; tolerancia según los decimales pedidos.
   comprobar(): segundo cálculo independiente (revisar falla si da false). */
import {paso,final,marca} from '../pasos.js';
export {paso,final,marca};

export function numDe(e){
  const m=/(-?\d+(?:[.,]\d+)?)(?:\s*\/\s*(-?\d+(?:[.,]\d+)?))?/.exec(String(e??''));
  if(!m)return NaN;const a=parseFloat(m[1].replace(',','.')),b=m[2]?parseFloat(m[2].replace(',','.')):1;return b?a/b:NaN;
}
export const fmt=(v,dec=2)=>String(+(+v).toFixed(dec));
export function prob({enunciado,v,dec=2,unidad='',pasos,errores=[],regla,pista,comprobar,tol}){
  const vt=fmt(v,dec),t=tol??(0.5*10**-dec+1e-9*Math.max(1,Math.abs(v)));
  const igual=(e,x)=>{const y=numDe(e);return Number.isFinite(y)&&Math.abs(y-x)<=t};
  return {enunciado,respuesta:vt+(unidad?` ${unidad}`:''),verificar:e=>igual(e,v),
    pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:vt}],
    errores:errores.filter(([x])=>Number.isFinite(x)&&Math.abs(x-v)>t).map(([x,por])=>({valor:fmt(x,dec),si:e=>igual(e,x),por})),
    regla,pista,comprobar:comprobar||(()=>true)};
}
// Integración numérica (Simpson) para comprobar integrales con un segundo cálculo
export function simpson(f,a,b,n=2000){const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=f(a+i*h)*(i%2?4:2);return s*h/3}
// Derivada numérica centrada para comprobar derivadas
export const derivNum=(f,x,h=1e-5)=>(f(x+h)-f(x-h))/(2*h);
export const cerca=(a,b,t=1e-6)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(b));

/* Generador por plantillas: def = {titulo, explicacion, alternativa, referencia, tarjetas, regla, pista,
   plantillas:{nombre:{prof:'basico'|'procedimiento'|'aplicacion', f:(n, rng) → pregunta}}, niveles:{1:['a','b','c'], …, 5:[…]}}
   Cada nivel elige al azar entre sus plantillas (≥ 3 por nivel); la pregunta lleva su plantilla y su profundidad. */
export function crearGen(def){
  const {plantillas,niveles,...resto}=def;
  return {...resto,
    profundidad:(n,p)=>p.profundidad,   // la trae cada pregunta (de su plantilla); los básicos se retiran por plantilla
    generar(n,rng){
      const k=rng.elegir(niveles[n]),pl=plantillas[k],q=pl.f(n,rng);
      return {...q,regla:q.regla||def.regla,pista:q.pista||def.pista,plantilla:k,profundidad:q.profundidad||pl.prof};
    }};
}
