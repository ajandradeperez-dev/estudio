/* Ayudantes para los generadores de Inglés por plantillas (sin DOM).
   txt(): pregunta de respuesta escrita (acepta varias formas: contracciones, mayúsculas y puntuación no importan).
   bancoEn(def): generador de 6 plantillas (2 básicas, 2 de procedimiento y 2 de aplicación) a partir de bancos de ítems:
     plantillas:{k:{prof, items:[I(q, a, e, f, x)…], enun(it) → HTML, que, como(it), porque, es?}}
     ítem: q = lo que se pregunta, a = respuestas aceptadas (la primera se muestra), e = errores típicos [[valor, por qué]…],
           f = frase completa en inglés (para escucharla y decirla en voz alta), x = la explicación del paso final.
   mejorar(id, viejo, def): conserva un generador ya publicado como plantilla 'orig' (con las mismas claves de retiro de los
   básicos que tenía en profundidad.js) y le suma plantillas nuevas, tarjetas, explicación alternativa y referencia. */
import {igualTexto} from '../verificar.js';
import {paso,final,marca} from '../pasos.js';
import {crearGen} from './base.js';
import {PROFUNDIDAD} from '../profundidad.js';
export {paso,final,marca};

export const en=t=>`<span lang="en">${t}</span>`;
export const NIV_EN={1:['b1','b2','p1'],2:['b1','b2','p1','p2'],3:['p1','p2','a1'],4:['p1','p2','a1','a2'],5:['p2','a1','a2']};
export const I=(q,a,e=[],f,x)=>({q,a:[].concat(a),e,f,x});

export function txt({enunciado,acepta,pasos,errores=[],regla,pista,frase,es=false,clave}){
  acepta=[].concat(acepta);
  const errs=errores.filter(([v])=>!igualTexto(v,acepta)).map(([v,por])=>({valor:v,si:e=>igualTexto(e,[v]),por}));
  return {enunciado,respuesta:acepta[0],verificar:e=>igualTexto(e,acepta),
    pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:acepta[0]}],errores:errs,regla,pista,clave,
    ...(es?{}:{lang:'en',frase:frase||acepta[0]}),
    comprobar:()=>igualTexto(acepta[0],acepta)&&errs.every(x=>!igualTexto(x.valor,acepta))};
}

function armar(def){
  const plantillas={};
  for(const [k,p] of Object.entries(def.plantillas))plantillas[k]={prof:p.prof,f:(n,r)=>{
    const it=r.elegir(p.items);
    return txt({enunciado:p.enun(it),acepta:it.a,errores:it.e,es:p.es,frase:it.f,regla:p.regla||def.regla,pista:p.pista||def.pista,clave:`${k}:${it.q}`,
      pasos:[paso(p.que,p.como(it),p.porque),final('Escribe la respuesta',`${marca(it.a[0])}${it.f&&!p.es?` → ${en(it.f)}`:''}`,it.x||p.porque)]});
  }};
  return plantillas;
}
export function bancoEn(def){
  const {plantillas:_,...resto}=def;
  return crearGen({...resto,plantillas:armar(def),niveles:def.niveles||NIV_EN});
}

export function mejorar(id,viejo,def){
  const t=PROFUNDIDAD[id]||{},pl=armar(def),{plantillas:_,niveles,...resto}=def;
  return {...viejo,...resto,titulo:resto.titulo||viejo.titulo,explicacion:resto.explicacion||viejo.explicacion,alternativa:resto.alternativa||viejo.alternativa,
    item:t.item,profundidad:(n,p)=>p.profundidad,
    generar(n,rng){
      const k=rng.elegir(niveles[n]);
      if(k==='orig'){const q=viejo.generar(n,rng);return {...q,profundidad:t.nivel?t.nivel(n,q):'procedimiento',plantilla:t.item?'orig':(t.plantilla?.(q,n)||`n${n}`)}}
      const q=pl[k].f(n,rng);return {...q,regla:q.regla||def.regla,pista:q.pista||def.pista,plantilla:k,profundidad:pl[k].prof};
    }};
}

/* Tipos de plantilla frecuentes (cada uno recibe sus ítems; o = cambios opcionales) */
const b=t=>`<b>${t}</b>`;
export const K={
  dice:(items,o={})=>({prof:'basico',items,enun:it=>`¿Cómo se dice ${b(`«${it.q}»`)} en inglés?`,que:'Piensa en la frase completa, no palabra por palabra',como:it=>`«${it.q}»`,porque:'Las expresiones se aprenden enteras: traducir palabra por palabra suele dar un calco del español.',...o}),
  significa:(items,o={})=>({prof:'basico',es:true,items,enun:it=>`¿Qué significa ${en(b(it.q))}? Escríbelo en español.`,que:'Lee la frase y piensa en la situación',como:it=>en(it.q),porque:'Importa el sentido, no la traducción literal.',...o}),
  completa:(items,o={})=>({prof:'procedimiento',items,enun:it=>`Completa: ${en(b(it.q))}`,que:'Mira lo que hay antes y después del hueco',como:it=>en(it.q),porque:'Las palabras de alrededor deciden la forma correcta.',...o}),
  traduce:(items,o={})=>({prof:'procedimiento',items,enun:it=>`Escribe en inglés: ${b(`«${it.q}»`)}`,que:'Arma la oración en orden inglés: sujeto + verbo + complemento',como:it=>`«${it.q}»`,porque:'En inglés el sujeto casi nunca se omite y el orden es fijo.',...o}),
  situacion:(items,o={})=>({prof:'aplicacion',items,enun:it=>`<p class="contexto">${it.q}</p>Escríbelo en inglés.`,que:'¿Qué necesitas lograr en esta situación?',como:it=>it.q,porque:'Elige la frase que se usa de verdad en ese momento.',...o}),
  dialogo:(items,o={})=>({prof:'aplicacion',items,enun:it=>`<p class="contexto">${it.q}</p>Escribe lo que dice B en inglés.`,que:'Lee lo que dice A y lo que B quiere decir',como:it=>it.q,porque:'La respuesta tiene que encajar con la pregunta (mismo verbo o auxiliar).',...o})
};

/* Plantillas para cursos en español (Ciberseguridad, Excel, Ciencia de datos): la respuesta es un término, un dato o una acción
   corta en español (se aceptan variantes y el término técnico en inglés). bancoEn/mejorar sirven igual: es:true en todas. */
export const KES={
  termino:(items,o={})=>({prof:'basico',es:true,items,enun:it=>`${it.q}<br><span class="nota">Escribe el término.</span>`,que:'Identifica el concepto que se describe',como:it=>it.q,porque:'Cada concepto tiene un nombre preciso que se usa en el trabajo y en los exámenes.',...o}),
  dato:(items,o={})=>({prof:'basico',es:true,items,enun:it=>it.q,que:'Recuerda el dato',como:it=>it.q,porque:'Este dato se usa todo el tiempo: conviene saberlo de memoria.',...o}),
  completa:(items,o={})=>({prof:'procedimiento',es:true,items,enun:it=>`Completa: <b>${it.q}</b>`,que:'Lee la frase completa y piensa qué falta',como:it=>it.q,porque:'El resto de la frase da la pista de lo que falta.',...o}),
  paso:(items,o={})=>({prof:'procedimiento',es:true,items,enun:it=>it.q,que:'Ubica en qué paso del proceso estás',como:it=>it.q,porque:'Los procesos tienen un orden: saltarse un paso causa errores.',...o}),
  caso:(items,o={})=>({prof:'aplicacion',es:true,items,enun:it=>`<p class="contexto">${it.q}</p>`,que:'Lee el caso y busca la pista clave',como:it=>it.q,porque:'En un caso real, una pista (un puerto, un mensaje, un síntoma) apunta a la causa.',...o}),
  decide:(items,o={})=>({prof:'aplicacion',es:true,items,enun:it=>`<p class="contexto">${it.q}</p>`,que:'Decide la acción defensiva correcta',como:it=>it.q,porque:'Primero contener y proteger; luego investigar y corregir.',...o})
};
