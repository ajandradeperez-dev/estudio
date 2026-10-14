/* "🎓 Mis materias": datos guardados en IndexedDB (almacenes 'materias' y 'generados' de cuaderno/db.js) con una copia en memoria
   para leerlos sin esperar (el repaso, el recomendador y la portada son síncronos). cargarMias() se llama al iniciar la app.
   El progreso de los temas practicados con ejercicios generados se guarda como cualquier habilidad: progreso.materias['mp-…'].lecciones['t-…']
   (repaso: '<mp-…>/e/<tema>/<ejercicio>'); los temas emparejados con la app usan la habilidad de la app (mismo dominio en los dos lados). */
import {todasLasMaterias,guardarMateriaDb,borrarMateriaDb,todosLosGenerados,guardarGeneradoDb,borrarGeneradoDb,borrarArchivo,pedirPersistencia} from '../cuaderno/db.js';
import {FORMATO,COLORES,ICONOS,validarMateria,validarBanco,aPregunta} from './esquema.js';
import {emparejar} from './emparejar.js';
import {planificar} from './plan.js';
import {materias as registro,leccion,tema as temaDe} from '../materias.js';
import {progreso,datosHabilidad,hoy} from '../progreso.js';
import {estadoDominio,ULTIMAS} from '../metodo.js';

const cache={materias:new Map(),generados:new Map(),listo:false};
let carga=null;
export function cargarMias(){
  if(!carga)carga=(async()=>{
    try{const [ms,gs]=await Promise.all([todasLasMaterias(),todosLosGenerados()]);
      cache.materias=new Map(ms.map(m=>[m.id,m]));cache.generados=new Map(gs.map(g=>[g.id,g]))}catch(e){}
    cache.listo=true;
  })();
  return carga;
}
export const miasListas=()=>cache.listo;
// Después de importar un respaldo: volver a leer todo
export function recargarMias(){carga=null;cache.listo=false;return cargarMias().then(avisar)}
export const misMaterias=()=>[...cache.materias.values()].sort((a,b)=>(proximoExamen(a)?.fecha||'9')<(proximoExamen(b)?.fecha||'9')?-1:1);
export const miMateria=id=>cache.materias.get(id)||null;
export const generado=(materia,tema)=>cache.generados.get(`${materia}/${tema}`)||null;
export const generadosDe=materia=>[...cache.generados.values()].filter(g=>g.materia===materia);
const avisar=()=>{try{window.dispatchEvent(new Event('mias'))}catch(e){}};

const azar=(n=6)=>Math.random().toString(36).slice(2,2+n).padEnd(n,'0');
export const nuevoIdMateria=()=>`mp-${azar(8)}`;
export const nuevoIdUnidad=()=>`u-${azar(6)}`;
export const nuevoIdTema=()=>`t-${azar(6)}`;
export const nuevoIdExamen=()=>`x-${azar(6)}`;

export function materiaVacia(){
  const ahora=Date.now();
  return {formato:FORMATO,id:nuevoIdMateria(),nombre:'',escuela:'',profesor:'',color:COLORES[0],icono:ICONOS[0],unidades:[],examenes:[],
    disponibilidad:{dias:[1,2,3,4,5],minutos:30},avisos:true,fotos:[],referencias:[],simulacros:[],reportados:{},creada:ahora,editada:ahora};
}
export const temaNuevo=(titulo,subtemas=[])=>({id:nuevoIdTema(),titulo,subtemas,sabe:false,dificil:false,habilidad:null,emparejado:'ninguno'});

// Catálogo de la app para emparejar: todas las habilidades con su materia y tema
let catalogoCache=null;
export function catalogo(){
  if(!catalogoCache)catalogoCache=registro.flatMap(m=>(m.lecciones||[]).map(l=>({materia:m.id,id:l.id,titulo:l.titulo,tema:temaDe(m,l.tema)?.titulo||'',materiaNombre:m.nombre})));
  return catalogoCache;
}
export const habilidadDe=h=>{if(!h)return null;const m=registro.find(x=>x.id===h.materia),l=m&&leccion(m,h.id);return l?{m,l}:null};
// Empareja los temas sin emparejamiento manual
export function emparejarTodo(m){
  for(const u of m.unidades)for(const t of u.temas){
    if(t.emparejado==='manual')continue;
    const r=emparejar(`${t.titulo} ${t.subtemas.join(' ')}`,catalogo());
    t.habilidad=r?{materia:r.materia,id:r.id}:null;t.emparejado=r?'auto':'ninguno';
  }
  return m;
}

export async function guardarMateria(m){
  const x={...m,editada:Date.now()};
  const e=validarMateria(x);if(e.length)throw new Error('La materia tiene datos inválidos: '+e.slice(0,3).join('; '));
  await guardarMateriaDb(x);cache.materias.set(x.id,x);pedirPersistencia();avisar();return x;
}
export async function borrarMateria(m){
  for(const g of generadosDe(m.id)){await borrarGeneradoDb(g.id);cache.generados.delete(g.id)}
  for(const f of [...(m.fotos||[]),...(m.referencias||[])])await borrarArchivo(f).catch(()=>{});
  await borrarMateriaDb(m.id);cache.materias.delete(m.id);avisar();
}
export async function guardarGenerado(g){await guardarGeneradoDb(g);cache.generados.set(g.id,g);avisar();return g}

/* ---------- avance ---------- */
// Dominio 0–1 de un tema: ya lo sabe → 1; habilidad de la app o práctica con el banco generado → aciertos recientes; "lo estudié" → 0,3
export function dominioTema(m,t,p=progreso()){
  if(t.sabe)return 1;
  const de=(mid,hid)=>{const d=datosHabilidad(p,mid,hid);if(!d)return 0;if(d.dominada)return 1;const e=estadoDominio(d);return e.n?(e.ok/e.n)*Math.min(1,e.n/5):0};
  let v=t.habilidad?de(t.habilidad.materia,t.habilidad.id):0;
  const propio=datosHabilidad(p,m.id,t.id);
  if(propio)v=Math.max(v,de(m.id,t.id),propio.estudiado?.3:0);
  // el último simulacro en que salió el tema
  const s=[...(m.simulacros||[])].reverse().find(x=>x.porTema?.[t.id]?.[1]);
  if(s){const [ok,n]=s.porTema[t.id];v=v?(v*.6+ok/n*.4):ok/n*.8}
  return Math.max(0,Math.min(1,v));
}
export const planDe=(m,p=progreso())=>planificar(m,{hoy:hoy(),dominio:t=>dominioTema(m,t,p)});
export function proximoExamen(m,f=hoy()){return [...(m.examenes||[])].filter(x=>x.fecha>=f).sort((a,b)=>a.fecha<b.fecha?-1:1)[0]||null}
export function preparacion(m,p=progreso()){
  return m.unidades.map(u=>{const vals=u.temas.map(t=>dominioTema(m,t,p));return {u,valor:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0}});
}
export function temasDebiles(m,p=progreso(),n=5){
  const prox=proximoExamen(m),entran=new Set(prox?prox.unidades:m.unidades.map(u=>u.id));
  return m.unidades.filter(u=>entran.has(u.id)).flatMap(u=>u.temas.map(t=>({t,u,v:dominioTema(m,t,p)}))).filter(x=>!x.t.sabe&&x.v<.8)
    .sort((a,b)=>(a.v-(a.t.dificil?.15:0))-(b.v-(b.t.dificil?.15:0))).slice(0,n);
}
export const buscarTema=(m,tid)=>{for(const u of m.unidades)for(const t of u.temas)if(t.id===tid)return {t,u};return null};

/* ---------- ejercicios generados: preguntas y repaso ---------- */
// Pregunta para el motor de sesiones a partir de un ejercicio del banco (sin los reportados)
export function preguntaGenerada(m,t,ej){return aPregunta(ej,{ref:`${m.id}/e/${t.id}/${ej.id}`,materia:m.id,habilidad:t.id})}
export const ejerciciosVivos=(m,tid)=>(generado(m.id,tid)?.ejercicios||[]).filter(e=>!m.reportados?.[`${tid}/${e.id}`]);
// Repaso: '<mp-…>/e/<tema>/<ejercicio>' → {materia, titulo, pregunta}
export function ejercicioPropio(ref){
  const [mid,tipo,tid,eid]=ref.split('/');const m=miMateria(mid);if(!m||tipo!=='e')return null;
  const x=buscarTema(m,tid),ej=ejerciciosVivos(m,tid).find(e=>e.id===eid);if(!x||!ej)return null;
  return {materia:{id:m.id,nombre:m.nombre},titulo:x.t.titulo,pregunta:preguntaGenerada(m,x.t,ej)};
}
// Referencias del repaso de materias propias cuyo dato aún no cargó: no se descartan
export const refPendiente=ref=>/^mp-/.test(ref)&&!cache.listo;

/* ---------- compartir una materia ---------- */
const TIPO='ciberlab-materia';
export function paqueteMateria(m){
  const {fotos,referencias,simulacros,reportados,...limpia}=m;  // sin fotos ni resultados propios: solo el temario, fechas y lo generado
  return {tipo:TIPO,formato:FORMATO,exportada:new Date().toISOString(),materia:{...limpia,fotos:[],referencias:[],simulacros:[],reportados:{}},
    generados:generadosDe(m.id).map(g=>({...g}))};
}
export async function importarMateria(texto,{copia=false}={}){
  let d;try{d=JSON.parse(texto)}catch(e){throw new Error('El archivo no es una materia válida (no es JSON).')}
  if(d?.tipo!==TIPO||!d.materia)throw new Error('Este archivo no es una materia de la app.');
  const m={...d.materia,fotos:[],referencias:[],simulacros:[],reportados:{}};
  const e=validarMateria(m);if(e.length)throw new Error('La materia tiene datos inválidos: '+e.slice(0,2).join('; '));
  const idViejo=m.id;if(copia||miMateria(m.id))m.id=nuevoIdMateria();
  const x=await guardarMateria({...m,creada:Date.now()});
  for(const g of d.generados||[]){const v=validarBanco(g);if(v.ok)await guardarGenerado({...v.banco,materia:x.id,id:`${x.id}/${g.tema}`})}
  return {materia:x,reemplazo:idViejo!==x.id};
}
export {COLORES,ICONOS};
