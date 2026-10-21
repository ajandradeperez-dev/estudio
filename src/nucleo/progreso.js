/* Progreso del usuario guardado en este navegador (localStorage, clave 'ciberlab-progreso').
   Si el almacenamiento no está disponible (modo privado, bloqueado), la app funciona igual sin guardar nada.
   Cada cambio emite el evento 'progreso' en window para que la barra superior se actualice.

   Estructura (v: 9):
   meta      {tipo:'ejercicios'|'minutos', cantidad}
   dias      {'AAAA-MM-DD': {ej, seg, xp, ok, habla:{frases, seg, turnos, conv}}}   ok = se cumplió la meta ese día (cuenta para la racha)
             habla: frases dichas en voz alta, segundos con el micrófono, turnos de conversación y la conversación más larga del día
   mejorRacha
   materias  {[id]: {xp,
                     lecciones:{[habilidad]:{dominada, mejor, intentos, via:'practica'|'ubicacion',
                                ult:[1,0…] últimas respuestas (1 = bien sin pista), dias:[fechas distintas de práctica],
                                rating 1–5 (dificultad adaptativa), sesiones, estudiado?:fecha ("Lo estudié" en una materia propia)}},
                     Las materias propias ('mp-…', "🎓 Mis materias") guardan aquí el avance de sus temas ('t-…') con la misma forma.
                     enCurso: sin uso desde v7 (las sesiones son cortas y no se retoman a medias)
                     ubicacion:{fecha, aciertos, total, dominadas:[…]}|null,
                     visitadas:[], extra:{}}}
   repaso    {[ref]: {rep, int, ef, proxima:'AAAA-MM-DD', fallos}}   repetición espaciada SM-2 (ver metodo.js)
             ref = '<mp-…>/e/<tema>/<ejercicio>' ejercicio generado de una materia propia ·
                   '<materia>/l/<lección>/<i>' ejercicio de una lección · '<materia>/g/<habilidad>/<nivel>' ejercicio generado
                   '<materia>/h/<habilidad>' repaso de una habilidad dominada · '<materia>/<clave propia>' (ejercicioRepaso)
   dominados número de ejercicios que salieron del repaso por recordarlos a más de 2 meses
   notas     {'<materia>/<lección>': {texto, fecha}}   resúmenes escritos al dominar cada lección (se copian al cuaderno)
   basicos   {[clave]: {ok:[sesiones], racha, retirado:fecha|null, materia, habilidad}}   ejercicios BÁSICOS (ver metodo.js → PROFUNDIDADES):
             clave 'l:<ref>' (ejercicio de lección), 'b:<ref>' (banco) o 'g:<generador>:<plantilla>' (plantilla de un generador).
             Bien sin pista en 2 sesiones distintas (las plantillas, además, 3 seguidas) → retirado: no vuelve a salir.
   refuerzos {'<materia>/<habilidad>': n}   al fallar un ejercicio de nivel superior, vuelve 1 básico retirado como refuerzo
   estrellas {[reto]: fecha}   retos y escenarios marcados con ⭐: entran al repaso con la ref '<materia>/r/<reto>'
   tarjetas  {[id]: {q, a, nota, titulo, materia, fecha}}  tarjetas "🃏 pregunta | respuesta" de las notas del cuaderno;
             se repasan con la ref '<materia|notas>/t/<id>' (el cuaderno vive en IndexedDB, ver cuaderno/db.js)
   ultimo    {ruta, materia} para "Continuar donde te quedaste"
   frases    {[id]: {en, es, regla, fecha}}   frases para repasar que no salen de una lección (p. ej. sugeridas por la IA)
   historial [{materia, tipo, fecha}]          últimas sesiones (para alternar materias en "¿Qué sigue?")
   En materias.<id>.extra cada materia guarda lo suyo: cofres {id: fecha}, jefes {tema: {mejor, fecha}};
   Inglés: sonidos {id:{ok, n, ult:[1,0…]}}, unidades, dialogos, medallas, combo. */
import {DOMINIO,ULTIMAS,estadoDominio,nuevoRating,calidad,sm2,SALE_DEL_REPASO,TOPE_HABILIDAD,INTERVALOS_V6} from './metodo.js';

const CLAVE='ciberlab-progreso',VERSION=10;
const RAPIDO=12000; // ms: responder bien en menos de esto cuenta como "rápido" (sube más la dificultad y el intervalo)
export const METAS=[['ejercicios',10],['ejercicios',20],['ejercicios',30],['minutos',5],['minutos',10],['minutos',15]];
const XP_LECCION=20;

const vacio=()=>({v:VERSION,meta:{tipo:'ejercicios',cantidad:20},dias:{},mejorRacha:0,materias:{},repaso:{},dominados:0,notas:{},tarjetas:{},basicos:{},refuerzos:{},estrellas:{},ultimo:null,frases:{},historial:[]});

/* ---------- fechas (hora local) ---------- */
const dos=n=>String(n).padStart(2,'0');
const aTexto=d=>`${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`;
export const hoy=()=>aTexto(new Date());
export function sumarDias(fecha,n){const [a,m,d]=fecha.split('-').map(Number);return aTexto(new Date(a,m-1,d+n))}

/* ---------- lectura, migración y escritura ---------- */
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:null;
// v1 guardaba la última sección abierta aparte, en 'ciberlab-s'
function ultimoV1(){
  try{const s=localStorage.getItem('ciberlab-s');if(s&&s!=='inicio')return {ruta:'cursos/ciberseguridad/'+s,materia:'ciberseguridad'}}catch(e){}
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
  if(p.v===3){ // v3 → v4: el examen rápido de Ciberseguridad pasó de opción múltiple a respuesta escrita; el mejor resultado anterior no es comparable
    const c=obj(obj(p.materias)?.ciberseguridad);
    if(obj(c?.extra))delete c.extra.examen;
    p.v=4;
  }
  if(p.v===4){ // v4 → v5: práctica de habla (frases para repasar e historial de sesiones); lo demás no cambia
    p.frases=obj(p.frases)||{};p.historial=Array.isArray(p.historial)?p.historial:[];
    p.v=5;
  }
  if(p.v===5){ // v5 → v6: áreas y temas. La materia 'algebra' pasó a llamarse 'matematicas' (sus lecciones conservan el id).
    // Lo demás se guarda por materia + id de lección, así que no cambia; las rutas viejas guardadas se siguen resolviendo.
    const ren=x=>typeof x==='string'&&/^algebra(\/|$)/.test(x)?x.replace(/^algebra/,'matematicas'):x;
    const ms=obj(p.materias);
    if(ms&&obj(ms.algebra)){if(!obj(ms.matematicas))ms.matematicas=ms.algebra;delete ms.algebra}
    for(const k of ['repaso','notas']){const o=obj(p[k]);if(o)p[k]=Object.fromEntries(Object.entries(o).map(([ref,v])=>[ren(ref),v]))}
    if(obj(p.ultimo))p.ultimo={...p.ultimo,ruta:ren(p.ultimo.ruta),materia:ren(p.ultimo.materia)};
    if(Array.isArray(p.historial))p.historial=p.historial.map(h=>obj(h)?{...h,materia:ren(h.materia),tipo:ren(h.tipo)}:h);
    p.v=6;
  }
  if(p.v===6){ // v6 → v7: repetición espaciada SM-2 y dominio por habilidad (últimas 10 respuestas + 2 días)
    const h=hoy();let k=0;
    // repasos {paso, proxima, fallos} → {rep, int, ef, proxima, fallos}: 'paso' aciertos seguidos = ese intervalo del esquema anterior
    for(const [ref,r] of Object.entries(obj(p.repaso)||{})){
      if(!obj(r)){delete p.repaso[ref];continue}
      if(r.int===undefined){const paso=Math.max(0,Math.min(5,r.paso|0));p.repaso[ref]={rep:paso,int:INTERVALOS_V6[paso],ef:2.5,proxima:typeof r.proxima==='string'?r.proxima:h,fallos:r.fallos|0}}
    }
    for(const [mid,m] of Object.entries(obj(p.materias)||{})){
      if(!obj(m))continue;
      for(const [id,l] of Object.entries(obj(m.lecciones)||{})){
        if(!obj(l))continue;
        l.ult=Array.isArray(l.ult)?l.ult:[];l.dias=Array.isArray(l.dias)?l.dias:[];l.sesiones=l.sesiones|0||l.intentos|0;
        if(typeof l.rating!=='number')l.rating=l.dominada?3:Math.round((1+2*(l.mejor||0))*10)/10;
        // lo ya dominado entra al repaso espaciado de habilidades, repartido en la próxima semana
        const ref=`${mid}/h/${id}`;
        if(l.dominada&&obj(p.repaso)&&!p.repaso[ref])p.repaso[ref]={rep:2,int:7,ef:2.5,proxima:sumarDias(h,2+(k++%7)),fallos:0};
      }
      m.enCurso=null;
    }
    p.v=7;
  }
  if(p.v===7){ // v7 → v8: tarjetas de repaso creadas desde las notas del cuaderno; lo demás no cambia
    p.tarjetas=obj(p.tarjetas)||{};
    p.v=8;
  }
  if(p.v===8){ // v8 → v9: niveles de profundidad (básicos retirados, refuerzos) y retos con ⭐; lo demás no cambia
    p.basicos=obj(p.basicos)||{};p.refuerzos=obj(p.refuerzos)||{};p.estrellas=obj(p.estrellas)||{};
    p.v=9;
  }
  if(p.v===9){ // v9 → v10: Ciberseguridad pasa al área 💼 Cursos (#cursos/ciberseguridad/…). Sus datos se guardan por materia
    // ('ciberseguridad'), así que no cambian; solo se reescriben las rutas guardadas (las viejas también se siguen resolviendo).
    const ren=r=>typeof r==='string'&&/^ciberseguridad(\/|$)/.test(r)?'cursos/'+r:r;
    if(obj(p.ultimo))p.ultimo={...p.ultimo,ruta:ren(p.ultimo.ruta)};
    if(Array.isArray(p.historial))p.historial=p.historial.map(h=>obj(h)?{...h,tipo:ren(h.tipo)}:h);
    p.v=10;
  }
  return p;
}
export function progreso(){
  let p=null;
  try{p=obj(JSON.parse(localStorage.getItem(CLAVE)))}catch(e){}
  const migrado=p&&p.v!==VERSION;
  if(migrado)p=migrar(p);
  if(!p){p=vacio();p.ultimo=ultimoV1()}
  // Completa lo que falte (datos incompletos o de otra versión) antes de usarlos o guardarlos
  const v=vacio();
  for(const k of ['dias','materias','repaso','notas','frases','tarjetas','basicos','refuerzos','estrellas'])p[k]=obj(p[k])||{};
  if(!Array.isArray(p.historial))p.historial=[];
  if(!obj(p.meta)||!METAS.some(([t,c])=>t===p.meta.tipo&&c===p.meta.cantidad))p.meta=v.meta;
  if(typeof p.mejorRacha!=='number')p.mejorRacha=0;
  if(typeof p.dominados!=='number')p.dominados=0;
  if(!obj(p.ultimo))p.ultimo=null;
  if(migrado)guardar(p);
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
const dia=(p,f=hoy())=>{const d=p.dias[f]=Object.assign({ej:0,seg:0,xp:0,ok:false},p.dias[f]);d.habla=Object.assign({frases:0,seg:0,turnos:0,conv:0},obj(d.habla));return d};

/* ---------- meta diaria y racha ---------- */
// Misión diaria de habla: 20 frases en voz alta o una conversación de 5 turnos. Cumplirla también cumple la meta del día.
export const MISION={frases:20,turnos:5};
const misionCumplida=h=>!!h&&(h.frases>=MISION.frases||h.conv>=MISION.turnos);
const cumple=(meta,d)=>misionCumplida(d.habla)||(meta.tipo==='minutos'?d.seg>=meta.cantidad*60:d.ej>=meta.cantidad);
export function misionHabla(p=progreso(),f=hoy()){const h=hablaDelDia(p,f);return {...h,cumplida:misionCumplida(h)}}
function comprobarMeta(p){
  const d=dia(p);
  if(!d.ok&&cumple(p.meta,d)){d.ok=true;p.mejorRacha=Math.max(p.mejorRacha,racha(p))}
}
// Días seguidos cumpliendo la meta. Si hoy todavía no se cumple, la racha sigue viva desde ayer.
// Hoy cuenta si la meta está cumplida aunque falte la marca 'ok' (igual que el ✅ de la barra superior).
export function racha(p=progreso()){
  let f=hoy(),n=0;
  const d=p.dias[f];
  if(d&&!d.ok&&cumple(p.meta,dia({...p,dias:{...p.dias}},f)))n++,f=sumarDias(f,-1);
  else if(!d?.ok)f=sumarDias(f,-1);
  while(p.dias[f]?.ok){n++;f=sumarDias(f,-1)}
  return n;
}
export function estadoHoy(p=progreso()){
  const d=p.dias[hoy()]||{ej:0,seg:0,xp:0,ok:false},m=p.meta;
  const hecho=m.tipo==='minutos'?Math.floor(d.seg/60):d.ej;
  return {hecho,meta:m.cantidad,tipo:m.tipo,ok:d.ok||hecho>=m.cantidad||misionCumplida(d.habla),avance:Math.min(1,hecho/m.cantidad)};
}
// Minutos con el micrófono: hoy y en los últimos 7 días
export function minutosHablados(p=progreso()){
  const h=hoy();let semana=0;
  for(let i=0;i<7;i++)semana+=p.dias[sumarDias(h,-i)]?.habla?.seg||0;
  return {hoy:Math.round((p.dias[h]?.habla?.seg||0)/60),semana:Math.round(semana/60)};
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
    if(!correcto&&repasar&&ref){const r=p.repaso[ref];p.repaso[ref]={...sm2(r,0),proxima:hoy(),fallos:(r?.fallos||0)+1}}
    comprobarMeta(p);
  });
}
// Ejercicios del repaso que tocan hoy (o están atrasados)
export function pendientes(p=progreso()){
  const h=hoy();
  return Object.entries(p.repaso).filter(([,r])=>r&&r.proxima<=h).sort((a,b)=>a[1].proxima<b[1].proxima?-1:1).map(([ref])=>ref);
}
// Respuesta en el repaso: SM-2 según qué tan bien se recordó (fallo → mañana; bien → el intervalo crece).
// Un ejercicio que ya se recuerda a más de SALE_DEL_REPASO días sale; una habilidad ('/h/') se sigue repasando con tope.
export function responderRepaso(ref,correcto,r={}){
  return cambiar(p=>{
    const x=p.repaso[ref]; if(!x)return {dias:0};
    const q=calidad({correcto,pista:r.pista,rapido:r.ms<RAPIDO}),nuevo=sm2(x,q),habilidad=ref.split('/')[1]==='h';
    if(!habilidad&&q>=4&&nuevo.int>SALE_DEL_REPASO){delete p.repaso[ref];p.dominados++;return {dominado:true}}
    const int=habilidad?Math.min(TOPE_HABILIDAD,nuevo.int):nuevo.int;
    Object.assign(x,nuevo,{int,proxima:sumarDias(hoy(),int)});if(q<3)x.fallos=(x.fallos||0)+1;
    return {dias:int};
  });
}
// Programa ejercicios para repasar mañana (al dominar algo), sin tocar los que ya estaban en el repaso
export function programarRepaso(refs){
  cambiar(p=>{for(const ref of refs)if(!p.repaso[ref])p.repaso[ref]={rep:1,int:1,ef:2.5,proxima:sumarDias(hoy(),1),fallos:0}});
}
export function quitarRepaso(ref){cambiar(p=>{delete p.repaso[ref]})}

/* ---------- habilidades: dominio y dificultad ---------- */
const registro=(m,id)=>{const prev=obj(m.lecciones[id])||{};return m.lecciones[id]=Object.assign({dominada:false,mejor:0,intentos:0,via:'practica',ult:[],dias:[],rating:1,sesiones:0},prev)};
export const datosHabilidad=(p,materia,id)=>obj(datosMateria(p,materia).lecciones[id]);
// Una respuesta en la práctica de una habilidad: últimas 10 y dificultad (sube con aciertos rápidos, baja con errores)
export function registrarRespuesta(materia,habilidad,{correcto,pista,ms}){
  return cambiar(p=>{
    const h=registro(datosMateria(p,materia),habilidad);
    h.ult=[...(h.ult||[]),correcto&&!pista?1:0].slice(-ULTIMAS);
    h.rating=nuevoRating(h.rating,{correcto,pista,rapido:ms<RAPIDO});
    return {...h};
  });
}
// Fin de una sesión de práctica: cuenta el día y revisa el dominio (≥80 % de las últimas 10 y 2 días distintos).
// La primera vez que se domina da XP extra y la habilidad entra al repaso espaciado.
export function cerrarSesionHabilidad(materia,habilidad,{ok=0,total=0}={}){
  return cambiar(p=>{
    const m=datosMateria(p,materia),h=registro(m,habilidad);
    if(total){h.dias=[...new Set([...(h.dias||[]),hoy()])].slice(-ULTIMAS);h.sesiones=(h.sesiones||0)+1;h.intentos=(h.intentos||0)+1;h.mejor=Math.max(h.mejor||0,ok/total)}
    const e=estadoDominio(h),primera=e.dominada&&!h.dominada,extra=primera?XP_LECCION:0;
    if(primera){h.dominada=true;h.via='practica';const ref=`${materia}/h/${habilidad}`;if(!p.repaso[ref])p.repaso[ref]={rep:1,int:1,ef:2.5,proxima:sumarDias(hoy(),1),fallos:0}}
    m.xp+=extra;dia(p).xp+=extra;
    return {...e,dominada:h.dominada,primera,extra,rating:h.rating};
  });
}
/* ---------- niveles de profundidad: básicos que se retiran ---------- */
const PLANTILLA_RACHA=3;
export const basicoRetirado=(clave,p=progreso())=>!!p.basicos[clave]?.retirado;
// Una respuesta a un ejercicio básico; devuelve true si con ella queda retirado
export function registrarBasico(clave,{correcto,pista},{sesion,materia,habilidad}){
  if(!clave)return false;
  return cambiar(p=>{
    const b=p.basicos[clave]=Object.assign({ok:[],racha:0,retirado:null,materia,habilidad},p.basicos[clave]);
    if(b.retirado)return false;
    if(!correcto||pista){b.racha=0;b.ok=[];return false}
    b.racha++;if(!b.ok.includes(sesion))b.ok=[...b.ok,sesion].slice(-5);
    // una plantilla de generador (números al azar) pide además 3 seguidas; un ítem fijo, solo las 2 sesiones
    if(b.ok.length>=2&&(!clave.startsWith('g:')||b.racha>=PLANTILLA_RACHA)){b.retirado=hoy();return true}
    return false;
  });
}
// Falló un ejercicio de nivel superior: un básico retirado de esa habilidad vuelve una vez como refuerzo
export function pedirRefuerzo(materia,habilidad){
  const k=`${materia}/${habilidad}`,p=progreso();
  if(!Object.values(p.basicos).some(b=>b.retirado&&b.materia===materia&&b.habilidad===habilidad))return;
  cambiar(q=>{q.refuerzos[k]=1});
}
export function tomarRefuerzo(materia,habilidad){
  const k=`${materia}/${habilidad}`;if(!progreso().refuerzos[k])return false;
  cambiar(q=>{delete q.refuerzos[k]});return true;
}
export const retiradosDe=(materia,habilidad,p=progreso())=>Object.entries(p.basicos).filter(([,b])=>b.retirado&&b.materia===materia&&(!habilidad||b.habilidad===habilidad)).map(([k])=>k);
// "Volver a ver lo retirado": los básicos de esas habilidades vuelven a salir (empiezan de cero)
export function reactivarBasicos(materia,habilidades){
  const hs=new Set(habilidades);
  cambiar(p=>{for(const [k,b] of Object.entries(p.basicos))if(b.materia===materia&&(!habilidades||hs.has(b.habilidad)))delete p.basicos[k]});
}
// ⭐ retos y escenarios: con estrella entran al repaso espaciado
export function alternarEstrella(materia,reto){
  return cambiar(p=>{const ref=`${materia}/r/${reto}`;
    if(p.estrellas[reto]){delete p.estrellas[reto];delete p.repaso[ref];return false}
    p.estrellas[reto]=hoy();if(!p.repaso[ref])p.repaso[ref]={rep:0,int:1,ef:2.5,proxima:sumarDias(hoy(),1),fallos:0};return true});
}
// "✅ Lo estudié" en un tema de una materia propia sin práctica: cuenta el día y deja una marca (dominio estimado 0,3)
export function marcarEstudiado(materia,id){cambiar(p=>{const h=registro(datosMateria(p,materia),id);h.estudiado=hoy();h.dias=[...new Set([...(h.dias||[]),hoy()])].slice(-ULTIMAS)})}
// Cofres (repaso intercalado dentro del camino) y jefes (mezcla cronometrada de un tema)
export function abrirCofre(materia,id){return cambiar(p=>{const e=datosMateria(p,materia).extra;e.cofres=obj(e.cofres)||{};const primera=!e.cofres[id];e.cofres[id]=hoy();return primera})}
export function guardarJefe(materia,tema,porcentaje){
  return cambiar(p=>{const e=datosMateria(p,materia).extra;e.jefes=obj(e.jefes)||{};const prev=e.jefes[tema],vencido=porcentaje>=DOMINIO,primera=vencido&&!(prev?.mejor>=DOMINIO);
    if(vencido||prev)e.jefes[tema]={mejor:Math.max(prev?.mejor||0,porcentaje),fecha:hoy()};return {vencido,primera}});
}
// Examen de ubicación: resultados {lección:[aciertos,total]}; marca como dominadas las que llegan a DOMINIO
export function guardarUbicacion(materia,resultados){
  return cambiar(p=>{
    const m=datosMateria(p,materia),nuevas=[];let a=0,t=0;
    for(const [id,[ok,total]] of Object.entries(resultados)){
      a+=ok;t+=total;
      const prev=obj(m.lecciones[id]);
      if(total&&ok/total>=DOMINIO&&!prev?.dominada){
        m.lecciones[id]={...(prev||{}),dominada:true,mejor:ok/total,intentos:prev?.intentos||0,via:'ubicacion',rating:Math.max(prev?.rating||1,3)};nuevas.push(id);
        const ref=`${materia}/h/${id}`;if(!p.repaso[ref])p.repaso[ref]={rep:1,int:3,ef:2.5,proxima:sumarDias(hoy(),3),fallos:0};
      }
    }
    m.ubicacion={fecha:hoy(),aciertos:a,total:t,dominadas:nuevas};
    return nuevas;
  });
}

/* ---------- habla ---------- */
// Lo hablado hoy: frases dichas en voz alta, segundos con el micrófono y turnos de conversación (conv = turnos de la conversación más larga)
export function registrarHabla({frases=0,seg=0,turnos=0,conv=0}){
  cambiar(p=>{const h=dia(p).habla;h.frases+=frases;h.seg+=seg;h.turnos+=turnos;h.conv=Math.max(h.conv,conv);comprobarMeta(p)});
}
export const hablaDelDia=(p=progreso(),f=hoy())=>Object.assign({frases:0,seg:0,turnos:0,conv:0},obj(p.dias[f]?.habla));
// Estadísticas por sonido: stats {id:[aciertos, intentos]}; se guardan los totales y los últimos 20 intentos
export function registrarSonidos(materia,stats){
  if(!Object.keys(stats||{}).length)return;
  cambiar(p=>{const e=datosMateria(p,materia).extra;e.sonidos=obj(e.sonidos)||{};
    for(const [id,[ok,n]] of Object.entries(stats)){
      const s=e.sonidos[id]=Object.assign({ok:0,n:0,ult:[]},obj(e.sonidos[id]));
      s.ok+=ok;s.n+=n;for(let i=0;i<n;i++)s.ult.push(i<ok?1:0);s.ult=s.ult.slice(-20);
    }});
}
// Frases para repasar que no salen de una lección (p. ej. sugeridas por la IA); se repasan con la ref '<materia>/x/<id>'
export function guardarFrase(id,datos){cambiar(p=>{p.frases[id]={...datos,fecha:hoy()}})}
// Últimas sesiones, para que "¿Qué sigue?" alterne materias
export function registrarSesion(materia,tipo){
  const p=progreso(),u=p.historial[p.historial.length-1];
  if(u&&u.materia===materia&&u.tipo===tipo&&u.fecha===hoy())return;
  cambiar(q=>{q.historial.push({materia,tipo,fecha:hoy()});q.historial=q.historial.slice(-20)});
}

/* ---------- notas ---------- */
// titulo: para notas que no son de una lección (p. ej. el resumen de una conversación con IA)
export function guardarNota(materia,leccion,texto,titulo){cambiar(p=>{p.notas[`${materia}/${leccion}`]={texto,fecha:hoy(),...(titulo?{titulo}:{})}})}
export function borrarNota(clave){cambiar(p=>{delete p.notas[clave]})}
// Tarjetas de una nota del cuaderno: agrega las nuevas al repaso (hoy) y quita las que ya no están en la nota
const hash=s=>{let h=5381;for(const ch of String(s))h=(h*33^ch.codePointAt(0))>>>0;return h.toString(36)};
export const refTarjeta=(materia,id)=>`${materia||'notas'}/t/${id}`;
export function sincronizarTarjetas(nota,{materia,titulo},lista){
  const p=progreso(),ids=new Set(lista.map(x=>`n${hash(nota+'|'+x.q+'|'+x.a)}`));
  const viejas=Object.entries(p.tarjetas).filter(([id,t])=>t.nota===nota);
  const cambia=viejas.some(([id,t])=>!ids.has(id)||t.materia!==(materia||null)||t.titulo!==titulo)||[...ids].some(id=>!p.tarjetas[id]);
  if(!cambia)return 0;
  return cambiar(p=>{
    for(const [id,t] of viejas)if(!ids.has(id)||t.materia!==(materia||null)){delete p.tarjetas[id];delete p.repaso[refTarjeta(t.materia,id)]}
    let nuevas=0;
    lista.forEach(x=>{const id=`n${hash(nota+'|'+x.q+'|'+x.a)}`;
      if(!p.tarjetas[id]){nuevas++;p.repaso[refTarjeta(materia,id)]={rep:0,int:1,ef:2.5,proxima:hoy(),fallos:0}}
      p.tarjetas[id]={q:x.q,a:x.a,nota,titulo,materia:materia||null,fecha:p.tarjetas[id]?.fecha||hoy()};});
    return nuevas;
  });
}
// Tarjeta suelta (no sale de una nota del cuaderno): p. ej. una palabra guardada desde 📚 Lectura. Entra al repaso hoy.
export function agregarTarjeta({q,a,materia=null,titulo,origen}){
  const id=`w${hash(q+'|'+a)}`,ref=refTarjeta(materia,id);
  cambiar(p=>{if(!p.repaso[ref])p.repaso[ref]={rep:0,int:1,ef:2.5,proxima:hoy(),fallos:0};
    p.tarjetas[id]={q,a,nota:null,titulo,materia,origen,fecha:p.tarjetas[id]?.fecha||hoy()}});
  return id;
}
export function borrarTarjetasDe(nota){
  if(!Object.values(progreso().tarjetas).some(t=>t.nota===nota))return;
  cambiar(p=>{for(const [id,t] of Object.entries(p.tarjetas))if(t.nota===nota){delete p.tarjetas[id];delete p.repaso[refTarjeta(t.materia,id)]}});
}

// Copia de lo que una nota tiene en el progreso (tarjetas, sus repasos y el resumen del que salió) para poder deshacer su borrado
export function instantaneaNota(nota,clave=null){
  const p=progreso(),tarjetas={},repaso={};
  for(const [id,t] of Object.entries(p.tarjetas))if(t.nota===nota){tarjetas[id]=t;const r=refTarjeta(t.materia,id);if(p.repaso[r])repaso[r]=p.repaso[r]}
  return JSON.parse(JSON.stringify({tarjetas,repaso,clave,resumen:clave?p.notas[clave]??null:null}));
}
export function restaurarInstantaneaNota(s){
  cambiar(p=>{Object.assign(p.tarjetas,s.tarjetas);Object.assign(p.repaso,s.repaso);if(s.clave&&s.resumen)p.notas[s.clave]=s.resumen});
}

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
// Borra todo menos la meta diaria elegida, las notas y las tarjetas (son texto escrito por el usuario); las tarjetas vuelven al repaso
export function reiniciarProgreso(){cambiar(p=>{const {meta,notas,tarjetas,estrellas}=p;Object.assign(p,vacio(),{meta,notas,tarjetas,estrellas});
  for(const [id,t] of Object.entries(tarjetas))p.repaso[refTarjeta(t.materia,id)]={rep:0,int:1,ef:2.5,proxima:hoy(),fallos:0}})}
// Reemplaza todo el progreso (importar un respaldo): se migra si viene de otra versión
export function reemplazarProgreso(datos){
  const p=obj(datos);if(!p)throw new Error('El archivo no tiene progreso válido.');
  try{localStorage.setItem(CLAVE,JSON.stringify(p))}catch(e){throw new Error('No se pudo guardar el progreso en este navegador.')}
  const q=progreso();guardar(q);window.dispatchEvent(new Event('progreso'));return q;
}
