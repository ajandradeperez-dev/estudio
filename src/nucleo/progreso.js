/* Progreso del usuario guardado en este navegador (localStorage, clave 'ciberlab-progreso').
   Si el almacenamiento no está disponible (modo privado, bloqueado), la app funciona igual sin guardar nada.
   Cada cambio emite el evento 'progreso' en window para que la barra superior se actualice.

   Estructura (v: 2):
   meta      {tipo:'ejercicios'|'minutos', cantidad}
   dias      {'AAAA-MM-DD': {ej, seg, xp, ok}}   ok = se cumplió la meta ese día (cuenta para la racha)
   mejorRacha
   materias  {[id]: {xp, lecciones:{[id]:{aciertos,total}}, enCurso:{leccion,i,aciertos,xp}|null, visitadas:[], extra:{}}}
   repaso    {[ref]: {paso, proxima:'AAAA-MM-DD', fallos}}   ref = '<materia>/<clave del ejercicio>'
   dominados número de ejercicios que salieron del repaso por acertarlos en todos los intervalos
   ultimo    {ruta, materia, titulo} para "Continuar donde te quedaste" */
const CLAVE='ciberlab-progreso';
// Días hasta la siguiente vez que se pregunta un ejercicio acertado en el repaso, según cuántas veces seguidas se acertó
export const INTERVALOS=[1,3,7,14,30];
export const METAS=[['ejercicios',10],['ejercicios',20],['ejercicios',30],['minutos',5],['minutos',10],['minutos',15]];
const XP_LECCION=20;

const vacio=()=>({v:2,meta:{tipo:'ejercicios',cantidad:20},dias:{},mejorRacha:0,materias:{},repaso:{},dominados:0,ultimo:null});

/* ---------- fechas (hora local) ---------- */
const dos=n=>String(n).padStart(2,'0');
const aTexto=d=>`${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`;
export const hoy=()=>aTexto(new Date());
export function sumarDias(fecha,n){const [a,m,d]=fecha.split('-').map(Number);return aTexto(new Date(a,m-1,d+n))}

/* ---------- lectura y escritura ---------- */
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:null;
// v1 guardaba la última sección abierta aparte, en 'ciberlab-s'
function ultimoV1(){
  try{const s=localStorage.getItem('ciberlab-s');if(s&&s!=='inicio')return {ruta:'ciberseguridad/'+s,materia:'ciberseguridad'}}catch(e){}
  return null;
}
function migrar(p){
  // v1 (solo Ciberseguridad): {visitadas, casos, examen}
  const n=vacio();n.ultimo=ultimoV1();
  const c={xp:0,lecciones:{},enCurso:null,visitadas:(Array.isArray(p.visitadas)?p.visitadas:[]).filter(k=>k!=='inicio'),
    extra:{casos:Array.isArray(p.casos)?p.casos:[],examen:obj(p.examen)}};
  n.materias.ciberseguridad=c;
  return n;
}
export function progreso(){
  let p=null;
  try{p=obj(JSON.parse(localStorage.getItem(CLAVE)))}catch(e){}
  if(p&&p.v!==2){p=migrar(p);guardar(p)}
  if(!p){p=vacio();p.ultimo=ultimoV1()}
  const v=vacio();
  for(const k of ['dias','materias','repaso'])p[k]=obj(p[k])||{};
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
    visitadas:Array.isArray(m.visitadas)?m.visitadas:[],extra:obj(m.extra)||{}};
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
// Ejercicios del repaso que tocan hoy (o están atrasados), los más antiguos primero
export function pendientes(p=progreso()){
  const h=hoy();
  return Object.entries(p.repaso).filter(([,r])=>r&&r.proxima<=h).sort((a,b)=>a[1].proxima<b[1].proxima?-1:1).map(([ref])=>ref);
}
// Acierto: el siguiente repaso se aleja (1, 3, 7, 14, 30 días); tras acertar en todos sale del repaso. Fallo: vuelve mañana.
export function responderRepaso(ref,correcto){
  return cambiar(p=>{
    const r=p.repaso[ref]; if(!r)return {dias:0};
    if(!correcto){Object.assign(r,{paso:0,proxima:sumarDias(hoy(),1),fallos:(r.fallos||0)+1});return {dias:1}}
    if(r.paso>=INTERVALOS.length){delete p.repaso[ref];p.dominados++;return {dominado:true}}
    const dias=INTERVALOS[r.paso];r.paso++;r.proxima=sumarDias(hoy(),dias);return {dias};
  });
}
export function quitarRepaso(ref){cambiar(p=>{delete p.repaso[ref]})}

/* ---------- lecciones, secciones y "continuar" ---------- */
export function guardarEnCurso(materia,enCurso){cambiar(p=>{datosMateria(p,materia).enCurso=enCurso})}
// Devuelve la XP extra: solo la primera vez que se termina la lección
export function terminarLeccion(materia,leccion,aciertos,total){
  return cambiar(p=>{
    const m=datosMateria(p,materia),prev=m.lecciones[leccion],extra=prev?0:XP_LECCION;
    if(!prev||aciertos>prev.aciertos)m.lecciones[leccion]={aciertos,total};
    m.enCurso=null;m.xp+=extra;dia(p).xp+=extra;
    return extra;
  });
}
export function visitar(materia,seccion){
  const p=progreso();
  if(!datosMateria(p,materia).visitadas.includes(seccion))cambiar(q=>{datosMateria(q,materia).visitadas.push(seccion)});
}
export function cambiarExtra(materia,fn){return cambiar(p=>fn(datosMateria(p,materia).extra))}
export function guardarUltimo(ultimo){
  const p=progreso();
  if(JSON.stringify(p.ultimo)!==JSON.stringify(ultimo)){p.ultimo=ultimo;guardar(p)}
}
// Borra todo menos la meta diaria elegida
export function reiniciarProgreso(){cambiar(p=>{const meta=p.meta;Object.assign(p,vacio(),{meta})})}
