/* Extiende un generador ya registrado sin tocar su código (lo aplica index.js al final de GENERADORES):
   - tarjetas: [[pregunta, respuesta]…] de los conceptos clave (entran al repaso espaciado y a la hoja del tema)
   - aplicaciones: {nombre: (n, rng) → pregunta} problemas con contexto real (profundidad 'aplicacion'), desde el nivel `desde`
   - basicos: {nombre: (n, rng) → pregunta} preguntas de regla directa (profundidad 'basico') en los niveles 1–2
   - procedimientos: {nombre: (n, rng) → pregunta} métodos de varios pasos sin contexto (profundidad 'procedimiento'), niveles 2–4
   Cada aplicación o básico es una plantilla más: también suma a «≥ 3 plantillas por nivel». Sin DOM. */
export function extender(g,{tarjetas=[],aplicaciones={},basicos={},procedimientos={},desde=3,peso=1}={}){
  if(!g)return g;
  const apl=Object.entries(aplicaciones),bas=Object.entries(basicos),pro=Object.entries(procedimientos);
  return {...g,tarjetas:[...(g.tarjetas||[]),...tarjetas],
    generar(n,rng){
      if(n>=desde&&apl.length&&rng.sig()<peso*apl.length/(apl.length+3)){const [k,f]=rng.elegir(apl);return {...f(n,rng),plantilla:'apl-'+k,profundidad:'aplicacion'}}
      if(n<=2&&bas.length&&rng.sig()<bas.length/(bas.length+2)){const [k,f]=rng.elegir(bas);return {...f(n,rng),plantilla:'bas-'+k,profundidad:'basico'}}
      if(n>=2&&n<=4&&pro.length&&rng.sig()<pro.length/(pro.length+2)){const [k,f]=rng.elegir(pro);return {...f(n,rng),plantilla:'pro-'+k,profundidad:'procedimiento'}}
      return g.generar(n,rng);
    }};
}
