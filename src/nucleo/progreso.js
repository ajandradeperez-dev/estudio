/* Progreso del usuario guardado en este navegador (localStorage, clave 'ciberlab-progreso').
   Si el almacenamiento no está disponible (modo privado, bloqueado), la app funciona igual sin guardar nada.
   Cada cambio emite el evento 'progreso' en window para que la barra superior se actualice.

   Estructura (v: 3):
   meta      {tipo:'ejercicios'|'minutos', cantidad}
   dias      {'AAAA-MM-DD': {ej, seg, xp, ok}}   ok = se cumplió la meta ese día (cuenta para la racha)
   mejorRacha
   materias  {[id]: {xp,
                     lecciones:{[id]:{dominada, mejor, intentos, via:'practica'|'ubicacion'}},
                     enCurso:{leccion, ronda, i, ok, xp}|null,   ok = aciertos sin pista
                     ubicacion:{fecha, aciertos, total, dominadas:[…]}|null,
                     visitadas:[], extra:{}}}
   repaso    {[ref]: {paso, proxima:'AAAA-MM-DD', fallos}}   ref = '<materia>/<clave del ejercicio>'
   dominados número de ejercicios que salieron del repaso por acertarlos en todos los intervalos
   notas     {'<materia>/<lección>': {texto, fecha}}   resúmenes escritos al dominar cada lección ("Mis notas")
   ultimo    {ruta, materia} para "Continuar donde te quedaste" */
import {DOMINIO} from './metodo.js';

const CLAVE='ciberlab-progreso',VERSION=3;
// Días hasta la siguiente vez que se pregunta un ejercicio acertado en el repaso, según cuántas veces seguidas se acertó
export const INTERVALOS=[1,3,7,14,30];
export const METAS=[['ejercicios',10],['ejercicios',20],['ejercicios',30],['minutos',5],['minutos',10],['minutos',15]];
const XP_LECCION=20;

const vacio=()=>({v:VERSION,meta:{tipo:'ejercicios',cantidad:20},dias:{},mejorRacha:0,materias:{},repaso:{},dominados:0,notas:{},ultimo:null});

/* ---------- fechas (hora local) ---------- */
const dos=n=>String(n).padStart(2,'0');
const aTexto=d=>`${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`;
export const hoy=()=>aTexto(new Date());
export function sumarDias(fecha,n){const [a,m,d]=fecha.split('-').map(Number);return aTexto(new Date(a,m-1,d+n))}

/* ---------- lectura, migración y escritura ---------- */
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:null;
// v1 guardaba la última sección abierta aparte, en 'ciberlab-s'
function ultimoV1(){
  try{const s=localStorage.getItem('ciberlab-s');if(s&&s!=='inicio')return {ruta:'ciberseguridad/'+s,materia:'ciberseguridad'}}catch(e){}
  return null;
}
function migrar(p){
  if(!p.v){ // v1 (solo Ciberseguridad): {visitadas, casos, examen}
    const n=vacio();n.v=2;n.ultimo=ultimoV1();
    n.materias.ciberseguridad={xp:0,lecciones:{},enCurso:null,visitadas:(Array.isArray(p.visitadas)?p.visitadas:[]).filter(k=>k!=='inicio'),
      extra:{casos:Array.isArray(p.casos)?p.casos:[],examen:obj(p.examen)}};
    p=n;
  }
  if(p.v===2){ // v2 → v3: las lecciones se reescribieron con rondas; se conserva si cada una quedó dominada
    for(const m of Object.values(obj(p.materias)||{})){
      if(!obj(m))continue;
      for(const [id,l] of Object.entries(obj(m.lecciones)||{})){
        const r=l&&l.total>0?l.aciertos/l.total:0;
        m.lecciones[id]={dominada:r>=DOMINIO,mejor:r,intentos:1,via:'practica'};
      }
      m.enCurso=null;
    }
    // Las referencias de repaso a ejercicios de lecciones ya no apuntan al mismo ejercicio
    for(const ref of Object.keys(obj(p.repaso)||{}))if(ref.split('/')[1]==='l')delete p.repaso[ref];
    p.v=3;
  }
  return p;
}
export function progreso(){
  let p=null;
  try{p=obj(JSON.parse(localStorage.getItem(CLAVE)))}catch(e){}
  if(p&&p.v!==VERSION){p=migrar(p);guardar(p)}
  if(!p){p=vacio();p.ultimo=ultimoV1()}
  const v=vacio();
  for(const k of ['dias','materias','repaso','notas'])p[k]=obj(p[k])||{};
  if(!obj(p.meta)||!METAS.some(([t,c])=>t===p.meta.tipo&&c===p.meta.cantidad))p.meta=v.meta;
  if(typeof p.mejorRacha!=='number')p.mejorRacha=0;
  if(typeof p.dominados!=='number')p.dominados=0;
  if(!obj(p.ultimo))p.ultimo=null;
  return p;
}
function guardar(p){
  // Solo se conservan los últimos 400 días
  const corte=sumarDias(hoy(),-400);
  for(const f of Object.keys(p.dias))if(f<corte)delete p.dias[f];
  try{localStorage.setItem(CLAVE,JSON.stringify(p))}catch(e){}
}
function cambiar(fn){const p=progreso(),r=fn(p);guardar(p);window.dispatchEvent(new Event('progreso'));return r}

export function datosMateria(p,id){
  const m=obj(p.materias[id])||{};
  return p.materias[id]={xp:typeof m.xp==='number'?m.xp:0,lecciones:obj(m.lecciones)||{},enCurso:obj(m.enCurso),
    ubicacion:obj(m.ubicacion),visitadas:Array.isArray(m.visitadas)?m.visitadas:[],extra:obj(m.extra)||{}};
}
const dia=(p,f=hoy())=>p.dias[f]=Object.assign({ej:0,seg:0,xp:0,ok:false},p.dias[f]);

/* ---------- meta diaria y racha ---------- */
const cumple=(meta,d)=>meta.tipo==='minutos'?d.seg>=meta.cantidad*60:d.ej>=meta.cantidad;
function comprobarMeta(p){
  const d=dia(p);
  if(!d.ok&&cumple(p.meta,d)){d.ok=true;p.mejorRacha=Math.max(p.mejorRacha,racha(p))}
}
// Días seguidos cumpliendo la meta. Si hoy todavía no se cumple, la racha sigue viva desde ayer.
export function racha(p=progreso()){
  let f=hoy(),n=0;
  if(!p.dias[f]?.ok)f=sumarDias(f,-1);
  while(p.dias[f]?.ok){n++;f=sumarDias(f,-1)}
  return n;
}
export function estadoHoy(p=progreso()){
  const d=p.dias[hoy()]||{ej:0,seg:0,xp:0,ok:false},m=p.meta;
  const hecho=m.tipo==='minutos'?Math.floor(d.seg/60):d.ej;
  return {hecho,meta:m.cantidad,tipo:m.tipo,ok:d.ok||hecho>=m.cantidad,avance:Math.min(1,hecho/m.cantidad)};
}
export function cambiarMeta(tipo,cantidad){cambiar(p=>{p.meta={tipo,cantidad};comprobarMeta(p)})}
export function sumarSegundos(s){cambiar(p=>{dia(p).seg+=s;comprobarMeta(p)})}

/* ---------- XP y nivel ---------- */
// XP necesaria para llegar a cada nivel: 0, 100, 300, 600, 1000, 1500…
const umbral=n=>50*n*(n-1);
export function nivel(xp){let n=1;while(xp>=umbral(n+1))n++;return {nivel:n,xp,desde:umbral(n),hasta:umbral(n+1)}}
export function sumarXP(materia,xp){cambiar(p=>{datosMateria(p,materia).xp+=xp;dia(p).xp+=xp})}

/* ---------- ejercicios y repetición espaciada ---------- */
// Registra una respuesta: cuenta para la meta diaria, suma XP y, si se falló, programa el ejercicio en el repaso de hoy.
export function registrarEjercicio({materia,ref,correcto,xp=correcto?10:0,repasar=true}){
  cambiar(p=>{
    const d=dia(p);d.ej++;d.xp+=xp;datosMateria(p,materia).xp+=xp;
    if(!correcto&&repasar&&ref)p.repaso[ref]={paso:0,proxima:hoy(),fallos:(p.repaso[ref]?.fallos||0)+1};
    comprobarMeta(p);
  });
}
// Ejercicios del repaso que tocan hoy (o están atrasados)
export function pendientes(p=progreso()){
  const h=hoy();
  return Object.entries(p.repaso).filter(([,r])=>r&&r.proxima<=h).sort((a,b)=>a[1].proxima<b[1].proxima?-1:1).map(([ref])=>ref);
}
// Acierto (sin pista): el siguiente repaso se aleja (1, 3, 7, 14, 30 días); tras acertar en todos sale del repaso.
// Fallo o acierto con pista: vuelve mañana y empieza de nuevo.
export function responderRepaso(ref,correcto){
  return cambiar(p=>{
    const r=p.repaso[ref]; if(!r)return {dias:0};
    if(!correcto){Object.assign(r,{paso:0,proxima:sumarDias(hoy(),1),fallos:(r.fallos||0)+1});return {dias:1}}
    if(r.paso>=INTERVALOS.length){delete p.repaso[ref];p.dominados++;return {dominado:true}}
    const dias=INTERVALOS[r.paso];r.paso++;r.proxima=sumarDias(hoy(),dias);return {dias};
  });
}
// Programa ejercicios para repasar mañana (al dominar una lección), sin tocar los que ya estaban en el repaso
export function programarRepaso(refs){
  cambiar(p=>{for(const ref of refs)if(!p.repaso[ref])p.repaso[ref]={paso:1,proxima:sumarDias(hoy(),1),fallos:0}});
}
export function quitarRepaso(ref){cambiar(p=>{delete p.repaso[ref]})}

/* ---------- lecciones ---------- */
export function guardarEnCurso(materia,enCurso){cambiar(p=>{datosMateria(p,materia).enCurso=enCurso})}
// Cierra un intento de lección. Dominada con DOMINIO de aciertos sin pista; la primera vez da XP extra.
export function terminarIntento(materia,leccion,ok,total){
  return cambiar(p=>{
    const m=datosMateria(p,materia),prev=obj(m.lecciones[leccion])||{dominada:false,mejor:0,intentos:0};
    const r=total?ok/total:0,dominada=r>=DOMINIO,primera=dominada&&!prev.dominada,extra=primera?XP_LECCION:0;
    m.lecciones[leccion]={dominada:prev.dominada||dominada,mejor:Math.max(prev.mejor||0,r),intentos:(prev.intentos||0)+1,
      via:dominada&&!prev.dominada?'practica':(prev.via||'practica')};
    m.enCurso=null;m.xp+=extra;dia(p).xp+=extra;
    return {dominada,primera,extra,porcentaje:r};
  });
}
// Examen de ubicación: resultados {lección:[aciertos,total]}; marca como dominadas las que llegan a DOMINIO
export function guardarUbicacion(materia,resultados){
  return cambiar(p=>{
    const m=datosMateria(p,materia),nuevas=[];let a=0,t=0;
    for(const [id,[ok,total]] of Object.entries(resultados)){
      a+=ok;t+=total;
      const prev=obj(m.lecciones[id]);
      if(total&&ok/total>=DOMINIO&&!prev?.dominada){m.lecciones[id]={dominada:true,mejor:ok/total,intentos:prev?.intentos||0,via:'ubicacion'};nuevas.push(id)}
    }
    m.ubicacion={fecha:hoy(),aciertos:a,total:t,dominadas:nuevas};
    return nuevas;
  });
}

/* ---------- notas ---------- */
export function guardarNota(materia,leccion,texto){cambiar(p=>{p.notas[`${materia}/${leccion}`]={texto,fecha:hoy()}})}
export function borrarNota(clave){cambiar(p=>{delete p.notas[clave]})}

/* ---------- secciones y "continuar" ---------- */
export function visitar(materia,seccion){
  const p=progreso();
  if(!datosMateria(p,materia).visitadas.includes(seccion))cambiar(q=>{datosMateria(q,materia).visitadas.push(seccion)});
}
export function cambiarExtra(materia,fn){return cambiar(p=>fn(datosMateria(p,materia).extra))}
export function guardarUltimo(ultimo){
  const p=progreso();
  if(JSON.stringify(p.ultimo)!==JSON.stringify(ultimo)){p.ultimo=ultimo;guardar(p)}
}
// Borra todo menos la meta diaria elegida y las notas (son texto escrito por el usuario)
export function reiniciarProgreso(){cambiar(p=>{const {meta,notas}=p;Object.assign(p,vacio(),{meta,notas})})}
