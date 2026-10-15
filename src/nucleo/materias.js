/* Registro de áreas y materias. Jerarquía: área → materia → tema (opcional) → lección.
   - Cada carpeta src/areas/<id>/ con un area.js es un área; cada src/materias/<id>/ con un materia.js es una materia
     (con area:'<id>'). El id es el nombre de la carpeta y se guarda en el progreso: no lo cambies.
   - El id de una lección es el nombre de su archivo sin el prefijo numérico, único dentro de su materia.
   Rutas canónicas (#hash):
     <área>                                   página del área (tarjetas de materias)
     <área>/<materia>                         página de la materia (temas o lecciones, secciones)
     <área>/<materia>/<tema>                  camino de lecciones del tema
     <área>/<materia>/<tema>/l/<lección>      lección de un tema   ·   <área>/<materia>/l/<lección> si la materia no tiene temas
     <área>/<materia>/ubicacion | /<sección>[/…]
   Un área con una sola materia del mismo id no repite el nivel. Ciberseguridad vive en 💼 Cursos: #cursos/ciberseguridad/fw
   (las rutas viejas #ciberseguridad/… y #fw siguen funcionando y se reescriben a la nueva).
   Rutas viejas que siguen funcionando: #<materia>/… (#ingles/l/can, #algebra/l/expresiones vía alias) y #fw, #vpn… */
import {ejerciciosLeccion,nivelDe} from './metodo.js';
import {progreso,datosHabilidad,basicoRetirado} from './progreso.js';
import {preguntaHabilidad} from './practica.js';
import {coincide} from './comparar.js';
import {reto} from './retos.js';
import {crearRng} from './rng.js';

const ordenar=(a,b)=>(a.orden??99)-(b.orden??99)||a.nombre.localeCompare(b.nombre);
export const areas=Object.entries(import.meta.glob('../areas/*/area.js',{eager:true}))
  .map(([ruta,a])=>({...a.default,id:ruta.split('/')[2]})).sort(ordenar);
export const materias=Object.entries(import.meta.glob('../materias/*/materia.js',{eager:true}))
  .map(([ruta,m])=>({...m.default,id:ruta.split('/')[2]})).sort(ordenar);
for(const a of areas)a.materias=materias.filter(m=>m.area===a.id);

export const area=id=>areas.find(a=>a.id===id);
export const materia=id=>materias.find(m=>m.id===id)||materias.find(m=>m.alias?.includes(id));
export const leccion=(m,id)=>(m.lecciones||[]).find(l=>l.id===id);
export const tema=(m,id)=>(m.temas||[]).find(t=>t.id===id);
export const areaDe=m=>area(m.area)||{id:m.id,nombre:m.nombre,materias:[m]};

/* ---------- rutas ---------- */
// El área se salta cuando solo tiene esa materia con su mismo id
const colapsa=a=>a.materias.length===1&&a.materias[0].id===a.id;
export const rutaMateria=m=>{const a=area(m.area);return !a||colapsa(a)?m.id:`${a.id}/${m.id}`};
export const rutaTema=(m,t)=>`${rutaMateria(m)}/${t.id||t}`;
export const rutaLeccion=(m,l)=>`${l.tema?rutaTema(m,l.tema):rutaMateria(m)}/l/${l.id}`;
export const rutaLeccionId=(m,id)=>{const l=leccion(m,id);return l?rutaLeccion(m,l):rutaMateria(m)};

/* analizar(ruta) → {tipo, ruta canónica, area?, m?, t?, l?, seccion?, resto?}
   tipo: 'portada' | 'especial' (repaso, logros, perfil, notas) | 'notas' (subrutas del cuaderno) | 'area' | 'materia' | 'tema' | 'leccion' (habilidad)
         | 'cofre' (<tema>/cofre/<k>) | 'jefe' (<tema>/jefe) | 'ubicacion' | 'seccion' */
const ESPECIALES=['repaso','logros','perfil','notas','acerca','bienvenida'];
export function analizar(ruta){
  ruta=String(ruta||'').replace(/^#/,'').replace(/\/+$/,'');
  if(!ruta||ruta==='inicio')return {tipo:'portada',ruta:''};
  if(ruta==='progreso')ruta='perfil'; // "Mi progreso" ahora está en la pestaña Perfil
  if(ESPECIALES.includes(ruta))return {tipo:'especial',ruta};
  // Cuaderno: notas/n/<id> (editor) · notas/tema/<materia>/<tema> (resumen del tema)
  if(ruta.startsWith('notas/'))return {tipo:'notas',ruta,resto:ruta.split('/').slice(1)};
  // Mis materias: mias · mias/nueva · mias/<id>[/editar|/t/<tema>|/simulacro|/preguntar[/<tema>]]
  if(ruta==='mias'||ruta.startsWith('mias/'))return {tipo:'mias',ruta,resto:ruta.split('/').slice(1)};
  // 🗳️ Propuestas: propuestas · propuestas/nueva · propuestas/admin
  if(ruta==='propuestas'||ruta.startsWith('propuestas/'))return {tipo:'propuestas',ruta,resto:ruta.split('/').slice(1)};
  let segs=ruta.split('/'),a=area(segs[0]),m=null;
  if(a){
    if(colapsa(a)){m=a.materias[0];segs=segs.slice(1)}
    else{
      m=segs[1]&&a.materias.find(x=>x.id===segs[1]||x.alias?.includes(segs[1]));
      if(!m)return {tipo:'area',ruta:a.id,area:a};
      segs=segs.slice(2);
    }
  }else{
    m=materia(segs[0]);
    // Rutas antiguas de una sola palabra (#fw, #vpn…) de cuando solo existía Ciberseguridad
    if(!m&&segs.length===1){m=materias.find(x=>x.secciones?.[segs[0]]);if(m)segs=[segs[0]];}
    else segs=segs.slice(1);
    if(!m)return {tipo:'portada',ruta:''};
    a=areaDe(m);
  }
  const base={area:a,m};
  const [x,y,z]=segs;
  if(x==='l'&&leccion(m,y)){const l=leccion(m,y);return {...base,tipo:'leccion',ruta:rutaLeccion(m,l),l,t:tema(m,l.tema)}}
  if(x==='retos'&&!m.secciones?.retos)return {...base,tipo:'retos',ruta:`${rutaMateria(m)}/retos`,t:null};
  if(x==='ubicacion'&&m.lecciones?.length)return {...base,tipo:'ubicacion',ruta:`${rutaMateria(m)}/ubicacion`};
  const t=x&&tema(m,x);
  if(t){
    if(y==='cofre'&&+z>0)return {...base,tipo:'cofre',ruta:`${rutaTema(m,t)}/cofre/${+z}`,t,k:+z};
    if(y==='jefe')return {...base,tipo:'jefe',ruta:`${rutaTema(m,t)}/jefe`,t};
    if(y==='retos')return {...base,tipo:'retos',ruta:`${rutaTema(m,t)}/retos`,t};
    if(y==='l'&&leccion(m,z)){const l=leccion(m,z);return {...base,tipo:'leccion',ruta:rutaLeccion(m,l),l,t:tema(m,l.tema)}}
    return {...base,tipo:'tema',ruta:rutaTema(m,t),t};
  }
  // <algo>/l/<habilidad> con un tema renombrado (p. ej. un enlace viejo #ciberseguridad/redes/l/subredes-cidr): la habilidad
  if(x&&y==='l'&&leccion(m,z)){const l=leccion(m,z);return {...base,tipo:'leccion',ruta:rutaLeccion(m,l),l,t:tema(m,l.tema)}}
  if(x&&m.secciones?.[x])return {...base,tipo:'seccion',seccion:x,resto:segs.slice(1),ruta:[rutaMateria(m),...segs].join('/')};
  return {...base,tipo:'materia',ruta:rutaMateria(m)};
}

// Una tarjeta se da por buena si coincide o si contiene todas las palabras importantes de la respuesta (en otro orden)
const palabras=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>2);
export function tarjetaBien(entrada,respuesta){
  if(coincide(entrada,[respuesta]))return true;
  const a=palabras(respuesta),e=new Set(palabras(entrada));
  return a.length>=2&&a.every(w=>e.has(w));
}
// Busca un ejercicio a partir de su referencia de repaso '<materia>/<clave>':
//   'l/<lección>/<índice>' ejercicio de una lección · 'g/<habilidad>/<nivel>' uno nuevo del generador a ese nivel (parecido)
//   'h/<habilidad>' repaso de una habilidad dominada: uno nuevo a su nivel actual · otras claves: ejercicioRepaso(clave) de la materia
export function ejercicioPorRef(ref){
  const [mid,...resto]=ref.split('/'),m=materia(mid);
  // Tarjeta de una nota del cuaderno ('<materia>/t/<id>' o 'notas/t/<id>' si la nota no es de una materia)
  if(resto[0]==='t'){const c=progreso().tarjetas[resto[1]];if(!c)return null;
    return {materia:m||{id:mid,nombre:'Mis notas'},titulo:`🃏 ${c.titulo||'Tarjeta'}`,pregunta:{enunciado:c.q,respuesta:c.a,verificar:e=>tarjetaBien(e,c.a),
      regla:`De tu nota «${c.titulo||'Notas'}». Si tu respuesta era correcta con otras palabras, corrígela en la nota para que coincida.`,ref,tarjeta:true}}}
  if(!m)return null;
  if(resto[0]==='l'){
    const l=leccion(m,resto[1]),ej=l&&ejerciciosLeccion(l)[+resto[2]];
    return ej?{materia:m,titulo:l.titulo,ej,habilidad:l}:null;
  }
  if(resto[0]==='g'||resto[0]==='h'){
    const h=leccion(m,resto[1]);if(!h)return null;
    const nivel=resto[0]==='g'?+resto[2]||1:nivelDe(datosHabilidad(progreso(),m.id,h.id)?.rating||1);
    const p=preguntaHabilidad(m,h,{nivel,retirados:{has:k=>basicoRetirado(k)}});
    return p?{materia:m,titulo:h.titulo,pregunta:{...p,ref,habilidad:h.id}}:null;
  }
  // Reto marcado con ⭐ ('<materia>/r/<reto>'): cada vez sale una pregunta nueva del reto
  if(resto[0]==='r'){
    const x=reto(resto[1]),l=x?.crear?.(crearRng())||[],p=l[0];
    return p?{materia:m,titulo:`⭐ ${x.titulo}`,pregunta:{...p,ref,profundidad:x.profundidad}}:null;
  }
  const r=m.ejercicioRepaso?.(resto.join('/'));
  return r?{materia:m,...r}:null;
}
