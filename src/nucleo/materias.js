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
   Un área con una sola materia del mismo id (Ciberseguridad) no repite el nivel: #ciberseguridad/fw.
   Rutas viejas que siguen funcionando: #<materia>/… (#ingles/l/can, #algebra/l/expresiones vía alias) y #fw, #vpn… */
import {ejerciciosLeccion} from './metodo.js';

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
   tipo: 'portada' | 'especial' (repaso, progreso, notas) | 'area' | 'materia' | 'tema' | 'leccion' | 'ubicacion' | 'seccion' */
const ESPECIALES=['repaso','progreso','notas'];
export function analizar(ruta){
  ruta=String(ruta||'').replace(/^#/,'').replace(/\/+$/,'');
  if(!ruta||ruta==='inicio')return {tipo:'portada',ruta:''};
  if(ESPECIALES.includes(ruta))return {tipo:'especial',ruta};
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
  if(x==='ubicacion'&&m.lecciones?.length)return {...base,tipo:'ubicacion',ruta:`${rutaMateria(m)}/ubicacion`};
  const t=x&&tema(m,x);
  if(t){
    if(y==='l'&&leccion(m,z)){const l=leccion(m,z);return {...base,tipo:'leccion',ruta:rutaLeccion(m,l),l,t:tema(m,l.tema)}}
    return {...base,tipo:'tema',ruta:rutaTema(m,t),t};
  }
  if(x&&m.secciones?.[x])return {...base,tipo:'seccion',seccion:x,resto:segs.slice(1),ruta:[rutaMateria(m),...segs].join('/')};
  return {...base,tipo:'materia',ruta:rutaMateria(m)};
}

// Busca un ejercicio a partir de su referencia de repaso '<materia>/<clave>'.
// Claves de lección: 'l/<lección>/<índice>'. Otras claves las resuelve la materia con ejercicioRepaso(clave).
export function ejercicioPorRef(ref){
  const [mid,...resto]=ref.split('/'),m=materia(mid); if(!m)return null;
  if(resto[0]==='l'){
    const l=leccion(m,resto[1]),ej=l&&ejerciciosLeccion(l)[+resto[2]];
    return ej?{materia:m,titulo:l.titulo,ej}:null;
  }
  const r=m.ejercicioRepaso?.(resto.join('/'));
  return r?{materia:m,...r}:null;
}
