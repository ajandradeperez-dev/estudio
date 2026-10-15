/* Nivel de PROFUNDIDAD de cada generador (independiente de la dificultad 1–5): 'basico' (recordar un dato o aplicar una regla
   directa), 'procedimiento' (método de varios pasos), 'aplicacion' (problema con contexto) o 'escenario' (caso real integrador).
   nivel(n, p) → profundidad de la pregunta p generada al nivel n. Un generador nuevo puede declarar su propio `profundidad`
   (cadena o función) y `plantilla(p, n)`; si no, se usa esta tabla. npm run revisar exige profundidad en los 5 niveles.
   Los básicos se retiran (ver progreso.js → registrarBasico) por PLANTILLA en generadores aleatorios ("puerto ↔ servicio")
   o por ÍTEM en los que salen de una lista fija (item: true; p. ej. cada artículo o cada plural). */
const B='basico',P='procedimiento',A='aplicacion';
const hasta=(k,a=B,b=P)=>n=>n<=k?a:b;
const pregunta=p=>/Escribe la pregunta/.test(p.enunciado);
export const PROFUNDIDAD={
  'alg/ecuacion-lineal':{nivel:hasta(2)},'alg/sistema-2x2':{nivel:hasta(1)},'alg/factorizacion':{nivel:hasta(1)},'alg/exponentes':{nivel:hasta(2)},
  'al/vector-magnitud':{nivel:hasta(1)},'al/vector-operaciones':{nivel:hasta(2)},'al/producto-punto':{nivel:hasta(1)},'al/angulo':{nivel:hasta(1)},
  'al/matriz-producto':{nivel:hasta(1)},'al/determinante':{nivel:hasta(1)},'al/inversa':{nivel:hasta(1)},'al/gauss':{nivel:hasta(1)},
  'cd/limites':{nivel:hasta(2)},'cd/derivada-polinomio':{nivel:hasta(1)},'cd/producto':{nivel:hasta(1)},'cd/cociente':{nivel:hasta(1)},'cd/cadena':{nivel:hasta(1)},
  'ci/antiderivada':{nivel:hasta(1)},'ci/definida':{nivel:hasta(1)},'ci/sustitucion':{nivel:hasta(1)},'ci/area':{nivel:hasta(1)},
  'red/bases':{nivel:hasta(2),plantilla:p=>(p.enunciado.match(/a (binario|decimal|hexadecimal)/)||[])[1]||'base'},
  'red/puertos':{nivel:()=>B,plantilla:p=>p.tipo==='emparejar'?'emparejar':p.tipo==='opcion'?'protocolo':/En qué puerto/.test(p.enunciado)?'servicio-a-puerto':'puerto-a-servicio'},
  'red/subred':{nivel:()=>P},'red/mascara':{nivel:hasta(2),plantilla:p=>/wildcard/.test(p.enunciado)?'wildcard':/prefijo/.test(p.enunciado)?'mascara-a-prefijo':'prefijo-a-mascara'},
  'red/prefijo-hosts':{nivel:()=>P},
  'fw/reglas':{nivel:()=>P},'fw/nat':{nivel:(n,p)=>p.tipo==='opcion'?B:P,plantilla:p=>p.tipo==='opcion'?'tipo-de-nat':'ip'},
  'fw/marcas':{nivel:()=>B,item:true},'vpn/fases':{nivel:()=>P},'vpn/cripto':{nivel:()=>B,item:true},'def/logs':{nivel:()=>A},
  'est/tendencia':{nivel:hasta(1)},'est/dispersion':{nivel:()=>P},'est/percentil':{nivel:()=>P},'prob/basica':{nivel:hasta(2)},'prob/compuesta':{nivel:()=>P},
  'py/pandas':{nivel:()=>P},'viz/barras':{nivel:()=>B},'ml/metricas':{nivel:()=>P},
  'en/presente-simple':{nivel:(n,p)=>pregunta(p)?P:B,plantilla:p=>pregunta(p)?'pregunta':/not \//.test(p.enunciado)?'negativa':'afirmativa'},
  'en/presente-continuo':{nivel:(n,p)=>pregunta(p)?P:B,plantilla:p=>pregunta(p)?'pregunta':/not \//.test(p.enunciado)?'negativa':'afirmativa'},
  'en/pasado-simple':{nivel:(n,p)=>pregunta(p)?P:B,plantilla:(p,n)=>pregunta(p)?'pregunta':/not \//.test(p.enunciado)?'negativa':`afirmativa-${n<=2?'regular':'irregular'}`},
  'en/presente-perfecto':{nivel:(n,p)=>/Escribe la pregunta/.test(p.enunciado)?P:B,plantilla:p=>/pregunta/.test(p.enunciado)?'pregunta':/not \//.test(p.enunciado)?'negativa':'afirmativa'},
  'en/articulos':{nivel:()=>B,item:true},'en/plurales':{nivel:()=>B,item:true},'en/preposiciones':{nivel:()=>B,item:true},
  'en/ordenar':{nivel:()=>P},'en/traducir':{nivel:()=>P},'en/chunks':{nivel:()=>B,item:true}
};
export const PROFUNDIDADES=['basico','procedimiento','aplicacion','escenario'];
export const NOMBRE_PROFUNDIDAD={basico:'Básico',procedimiento:'Procedimiento',aplicacion:'Aplicación',escenario:'Escenario'};
// Profundidad y clave de retiro de una pregunta generada
export function clasificar(id,g,n,p){
  const t=g.profundidad?{nivel:typeof g.profundidad==='function'?g.profundidad:()=>g.profundidad,plantilla:g.plantilla,item:g.item}:PROFUNDIDAD[id]||{nivel:()=>P};
  const profundidad=p.profundidad||t.nivel(n,p)||P;
  const basico=profundidad===B?(t.item?`gi:${id}:${p.clave}`:`g:${id}:${(t.plantilla?.(p,n))||p.plantilla||`n${n}`}`):null;
  return {profundidad,basico};
}
