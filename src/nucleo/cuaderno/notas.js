/* Datos del cuaderno: crear, guardar y borrar notas; cuaderno (área → materia → tema) de cada una; copia de los resúmenes
   viejos de "Mis notas" (progreso.notas, que se conservan tal cual) y "📝 Guardar en mis notas" desde el estudio. */
import {todasLasNotas,leerNota,guardarNota,borrarNotaDb,borrarArchivo,pedirPersistencia,nuevoId} from './db.js';
import {tarjetasDe,imagenesDe,deHtml} from './formato.js';
import {progreso,sincronizarTarjetas,borrarTarjetasDe,borrarNota,hoy} from '../progreso.js';
import {materia as buscarMateria,leccion,tema as buscarTema,areaDe,rutaLeccion,rutaLeccionId} from '../materias.js';
import {miMateria,buscarTema as temaPropio} from '../mias/datos.js';

// Cuaderno de una nota: {area, materia, tema} (objetos del registro o null) y su nombre corto
export function cuadernoDe(n){
  // materia propia ("🎓 Mis materias")
  if(/^mp-/.test(n.materia||'')){const mp=miMateria(n.materia),t=mp&&n.tema&&temaPropio(mp,n.tema)?.t;
    return {area:{nombre:'Mis materias',icono:'🎓'},m:null,t:null,propia:mp,nombre:mp?(t?`${mp.nombre} · ${t.titulo}`:mp.nombre):'Materia borrada'}}
  const m=n.materia&&buscarMateria(n.materia),t=m&&n.tema&&buscarTema(m,n.tema),a=m&&areaDe(m);
  return {area:a||null,m:m||null,t:t||null,nombre:t?`${m.nombre} · ${t.titulo}`:m?m.nombre:'General'};
}
export const fechaCorta=ms=>new Date(ms).toLocaleDateString('es',{day:'numeric',month:'short'});

let persistida=false;
export async function guardar(n,{tocada=true}={}){
  const x={...n,editada:Date.now()};if(tocada&&x.origen)x.tocada=true;
  await guardarNota(x);
  sincronizarTarjetas(x.id,{materia:x.materia,titulo:x.titulo||'Nota'},tarjetasDe(x.cuerpo));
  if(!persistida){persistida=true;pedirPersistencia()}
  return x;
}
export async function crearNota({materia=null,tema=null,titulo='',cuerpo='',etiquetas=[],id}={}){
  const ahora=Date.now();
  return guardar({id:id||nuevoId(),titulo,cuerpo,materia,tema,etiquetas,fijada:false,creada:ahora,editada:ahora},{tocada:false});
}
export async function borrarNotaCompleta(n){
  for(const img of imagenesDe(n.cuerpo))await borrarArchivo(img).catch(()=>{});
  await borrarNotaDb(n.id);borrarTarjetasDe(n.id);
  if(n.origen?.startsWith('resumen:'))borrarNota(n.origen.slice(8)); // si no, volvería a copiarse
}

/* Los resúmenes de "Mis notas" (progreso.notas) aparecen como notas del cuaderno. Se conservan en el progreso
   (la página de cada habilidad los muestra); si el resumen cambia y la nota no se tocó, la nota se actualiza. */
export async function sincronizarResumenes(){
  const p=progreso(),notas=await todasLasNotas(),porOrigen=new Map(notas.filter(n=>n.origen).map(n=>[n.origen,n]));
  for(const [k,x] of Object.entries(p.notas)){
    if(!x||typeof x.texto!=='string')continue;
    const origen=`resumen:${k}`,previa=porOrigen.get(origen),[mid,hid]=k.split('/'),m=buscarMateria(mid),h=m&&leccion(m,hid);
    const titulo=x.titulo||(h?`Resumen: ${h.titulo}`:`Resumen: ${hid||k}`);
    const cuerpo=`${x.texto}${h?`\n\n[Abrir «${h.titulo}»](#${rutaLeccion(m,h)})`:''}`;
    if(!previa){const f=Date.parse(x.fecha)||Date.now();
      await guardarNota({id:`resumen-${k.replace(/[^\w-]/g,'-')}`,titulo,cuerpo,materia:m?m.id:null,tema:h?.tema||null,etiquetas:['resumen'],fijada:false,creada:f,editada:f,origen,origenFecha:x.fecha});}
    else if(previa.origenFecha!==x.fecha&&!previa.tocada)await guardarNota({...previa,cuerpo,titulo,origenFecha:x.fecha,editada:Date.now()});
  }
}

/* ---------- "📝 Guardar en mis notas" desde el estudio ---------- */
// Se agrega a la nota del tema ("Notas de <tema>"); si la habilidad no tiene tema, a la nota de la materia
export async function agregarAlTema({materia,habilidad},bloque){
  const m=buscarMateria(materia),h=m&&habilidad&&leccion(m,habilidad),t=h?.tema&&buscarTema(m,h.tema);
  const id=`tema-${m?.id||'general'}-${t?.id||'general'}`;
  const previa=await leerNota(id);
  const titulo=t?`Notas de ${t.titulo}`:m?`Notas de ${m.nombre}`:'Mis apuntes';
  const n=previa||{id,titulo,cuerpo:'',materia:m?.id||null,tema:t?.id||null,etiquetas:[],fijada:false,creada:Date.now()};
  n.cuerpo=`${n.cuerpo.trim()?n.cuerpo.trimEnd()+'\n\n':''}${bloque.trim()}`;
  return guardar(n,{tocada:false});
}
const cabecera=(p,{materia,habilidad})=>{const m=buscarMateria(materia),h=m&&habilidad&&leccion(m,habilidad);
  return {m,h,titulo:`## ${h?h.titulo:p.contexto||'Ejercicio'} · ${new Date().toLocaleDateString('es',{day:'numeric',month:'short'})}`,
    enlace:h?`[Practicar «${h.titulo}»](#${rutaLeccion(m,h)})`:''}};
const linea=x=>deHtml(x).replace(/\n/g,' ');
// Un paso o todo el procedimiento de un ejercicio
export function bloqueProcedimiento(p,donde,paso=null){
  const c=cabecera(p,donde),pasos=(p.pasos||[]).map(x=>typeof x==='string'?{como:x}:x),lista=paso?[paso]:pasos;
  const txt=lista.map((x,i)=>[`${paso?'-':`${i+1}.`} ${x.que?`**${linea(x.que)}**: `:''}${linea(x.como||'')}`,x.porque?`   💡 ${linea(x.porque)}`:'',x.ojo?`   ⚠️ ${linea(x.ojo)}`:''].filter(Boolean).join('\n')).join('\n');
  return [c.titulo,`> ${linea(p.enunciado||'')}`,txt,c.enlace].filter(Boolean).join('\n');
}
// Un error: lo que respondí, la respuesta, por qué y la regla (+ la frase en inglés)
export function bloqueError(p,donde,r={}){
  const c=cabecera(p,donde),resp=deHtml(String(p.respuesta??'')).replace(/\n/g,' ');
  return [c.titulo,`> ${linea(p.enunciado||'')}`,r.entrada?`- Mi respuesta: ${String(r.entrada).replace(/[*=`$]/g,'')}`:'',`- Correcta: **${resp}**`,
    r.porque?`- Por qué: ${linea(r.porque)}`:'',p.regla?`- Regla: ${linea(p.regla)}`:'',p.frase?`- 🗣️ ${p.frase}`:'',c.enlace].filter(Boolean).join('\n');
}
// La explicación de una habilidad (pantalla antes de practicar)
export function bloqueExplicacion(m,h,html){
  return [`## ${h.titulo} · ${new Date().toLocaleDateString('es',{day:'numeric',month:'short'})}`,deHtml(html),`[Practicar «${h.titulo}»](#${rutaLeccionId(m,h.id)})`].join('\n');
}
export {hoy};
