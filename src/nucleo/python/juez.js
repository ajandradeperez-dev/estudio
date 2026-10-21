/* Juez de «escribe la función» (sin DOM; lo usan el laboratorio en el navegador y npm run python en Node).
   Una tarea: {id, unidad, titulo, enunciado, inicio, solucion, preparar?, pruebas:[{llamada, esperado}], ocultas:[…], pistas, pasos}
     llamada  expresión de Python que usa lo que escribió la persona: 'suma(2, 3)', 'Cuenta(100).retirar(30)'
     esperado valor de Python escrito como literal: '5', "'hola'", '[1, 2]', 'True' (los float se comparan con tolerancia)
     preparar código que se corre antes (p. ej. crear archivos en el sistema de archivos simulado de Pyodide)
   programaPruebas() arma UN programa: el código de la persona + las pruebas; cada resultado sale en una línea «@@{json}». */
const lit=s=>JSON.stringify(String(s));
export function programaPruebas(codigo,tarea,{todas=false}={}){
  const casos=[...tarea.pruebas.map(c=>({...c,visible:true})),...(todas?tarea.ocultas||[]:[]).map(c=>({...c,visible:false}))];
  return `${tarea.preparar||''}
${codigo}

import json as __j, math as __m
def __igual(a, b):
    if isinstance(a, float) or isinstance(b, float):
        try:
            return __m.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9)
        except TypeError:
            return False
    return a == b and type(a) == type(b) or (isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool) and a == b)
for __ll, __es, __vi in [${casos.map(c=>`(${lit(c.llamada)}, ${lit(c.esperado)}, ${c.visible?'True':'False'})`).join(', ')}]:
    try:
        __r = eval(__ll)
        __e = eval(__es)
        print("@@" + __j.dumps({"ok": bool(__igual(__r, __e)), "llamada": __ll, "esperado": repr(__e), "obtuvo": repr(__r), "visible": __vi}))
    except Exception as __x:
        print("@@" + __j.dumps({"ok": False, "llamada": __ll, "esperado": __es, "error": type(__x).__name__, "mensaje": str(__x), "visible": __vi}))
`;
}
// Resultados de la salida del programa (las líneas «@@…»); lo demás que imprima la persona se ignora
export function leerResultados(salida){
  return String(salida||'').split('\n').filter(l=>l.startsWith('@@')).map(l=>{try{return JSON.parse(l.slice(2))}catch(e){return null}}).filter(Boolean);
}
// Salida que imprimió la persona (sin las líneas del juez)
export const salidaPropia=salida=>String(salida||'').split('\n').filter(l=>!l.startsWith('@@')).join('\n').trim();
