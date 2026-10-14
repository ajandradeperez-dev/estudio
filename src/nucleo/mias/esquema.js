/* Formato de una materia propia y de un banco generado con IA, con su validación estricta (sin DOM: también lo usa npm run revisar).

   Materia propia (IndexedDB 'materias', ver datos.js):
   {formato:1, id:'mp-…', nombre, escuela?, profesor?, color:'#rrggbb', icono,
    unidades:[{id:'u-…', titulo, temas:[{id:'t-…', titulo, subtemas:[…], sabe, dificil, habilidad:{materia,id}|null, emparejado:'auto'|'manual'|'ninguno'}]}],
    examenes:[{id:'x-…', nombre, fecha:'AAAA-MM-DD', unidades:['u-…']}],
    disponibilidad:{dias:[0–6, 0 = domingo], minutos}, avisos:bool (recordatorio 7 días y 1 día antes),
    fotos:[id de archivo], referencias:[id de archivo de exámenes pasados], simulacros:[{fecha, examen, ok, total, porTema:{t:[ok,total]}}],
    reportados:{'<tema>/<ejercicio>':fecha}, creada, editada}

   Banco generado de un tema (IndexedDB 'generados', id '<materia>/<tema>'):
   {formato:1, id, materia, tema, creado, modelo,
    leccion:{idea, ejemplo:{enunciado, pasos:[paso]}, hueco:{enunciado, pasos:[paso], pregunta, respuesta, alternativas:[]}},
    ejercicios:[{id, nivel:1|2|3, tipo:'numero'|'expresion'|'texto'|'opcion', enunciado, respuesta, tolerancia?, alternativas?, opciones?, correcta?,
                 pasos:[{que, como, porque, ojo?}] (≥ 2), errores:[{valor, por}], regla, pista}]}
   Los textos pueden llevar fórmulas KaTeX entre \( \). */
import {igualNum,equivalente,num,compilar} from '../generadores/verificar.js';
import {coincide} from '../comparar.js';

export const FORMATO=1;
export const COLORES=['#4652d0','#0f8a6c','#c2410c','#be185d','#7c3aed','#0369a1','#a16207','#475569'];
export const ICONOS=['📘','📗','📕','📐','🧪','💻','🌎','🧠','⚖️','📊','🎨','🩺'];
const txt=(x,max=400)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
const fecha=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x));
const paso=x=>x&&typeof x==='object'&&txt(x.que,300)&&txt(x.como,1200)&&txt(x.porque,600)&&(x.ojo===undefined||x.ojo===null||typeof x.ojo==='string');
const pasos=(l,min=2)=>Array.isArray(l)&&l.length>=min&&l.length<=12&&l.every(paso);

export function validarMateria(m){
  const e=[];
  if(!m||typeof m!=='object')return ['no es un objeto'];
  if(m.formato!==FORMATO)e.push(`formato ${m.formato} (se esperaba ${FORMATO})`);
  if(typeof m.id!=='string'||!/^mp-[a-z0-9]{4,24}$/.test(m.id))e.push('id inválido');
  if(!txt(m.nombre,80))e.push('falta el nombre');
  if(typeof m.color!=='string'||!/^#[0-9a-f]{6}$/i.test(m.color))e.push('color inválido');
  if(!txt(m.icono,8))e.push('falta el ícono');
  if(!Array.isArray(m.unidades)||!m.unidades.length)e.push('sin unidades');
  const uids=new Set(),tids=new Set();
  for(const u of m.unidades||[]){
    if(!/^u-[a-z0-9]{3,}$/.test(u?.id)||uids.has(u.id))e.push(`unidad con id inválido o repetido: ${u?.id}`);uids.add(u?.id);
    if(!txt(u?.titulo,200))e.push(`unidad ${u?.id} sin título`);
    if(!Array.isArray(u?.temas)||!u.temas.length)e.push(`unidad «${u?.titulo}» sin temas`);
    for(const t of u?.temas||[]){
      if(!/^t-[a-z0-9]{3,}$/.test(t?.id)||tids.has(t.id))e.push(`tema con id inválido o repetido: ${t?.id}`);tids.add(t?.id);
      if(!txt(t?.titulo,200))e.push(`tema ${t?.id} sin título`);
      if(!Array.isArray(t?.subtemas)||!t.subtemas.every(s=>typeof s==='string'))e.push(`tema «${t?.titulo}»: subtemas inválidos`);
      if(typeof t?.sabe!=='boolean'||typeof t?.dificil!=='boolean')e.push(`tema «${t?.titulo}»: sabe/difícil deben ser sí o no`);
      if(t?.habilidad!==null&&!(t?.habilidad&&typeof t.habilidad.materia==='string'&&typeof t.habilidad.id==='string'))e.push(`tema «${t?.titulo}»: habilidad inválida`);
      if(!['auto','manual','ninguno'].includes(t?.emparejado))e.push(`tema «${t?.titulo}»: emparejado inválido`);
    }
  }
  for(const x of m.examenes||[]){
    if(!/^x-[a-z0-9]{3,}$/.test(x?.id))e.push('examen con id inválido');
    if(!txt(x?.nombre,80))e.push('examen sin nombre');
    if(!fecha(x?.fecha))e.push(`examen «${x?.nombre}» sin fecha válida`);
    if(!Array.isArray(x?.unidades)||!x.unidades.length||x.unidades.some(id=>!uids.has(id)))e.push(`examen «${x?.nombre}»: unidades inválidas`);
  }
  if(!Array.isArray(m.examenes))e.push('examenes debe ser una lista');
  const d=m.disponibilidad;
  if(!d||!Array.isArray(d.dias)||d.dias.some(x=>!Number.isInteger(x)||x<0||x>6)||new Set(d.dias).size!==d.dias.length)e.push('días disponibles inválidos');
  if(!d||!Number.isInteger(d.minutos)||d.minutos<5||d.minutos>300)e.push('minutos por día inválidos (5–300)');
  for(const k of ['fotos','referencias','simulacros'])if(!Array.isArray(m[k]))e.push(`${k} debe ser una lista`);
  if(!m.reportados||typeof m.reportados!=='object'||Array.isArray(m.reportados))e.push('reportados debe ser un objeto');
  return e;
}

/* ---------- ejercicios generados ---------- */
// Variables de una expresión (letras sueltas que no son funciones ni constantes)
export const varsDe=s=>[...new Set((String(s).toLowerCase().replace(/sqrt|sin|cos|tan|ln|log|exp|abs|pi|sen/g,' ').match(/[a-z]/g)||[]).filter(c=>c!=='e'))].slice(0,3);
const eqv=(a,b)=>{const v=[...new Set([...varsDe(a),...varsDe(b)])];try{return equivalente(a,b,{vars:v.length?v:['x']})}catch(err){return false}};
export const TIPOS=['numero','expresion','texto','opcion'];
export function validarEjercicio(x){
  const e=[];
  if(!x||typeof x!=='object')return ['no es un objeto'];
  if(!TIPOS.includes(x.tipo))e.push(`tipo «${x.tipo}» desconocido`);
  if(![1,2,3].includes(x.nivel))e.push('nivel debe ser 1, 2 o 3');
  if(!txt(x.enunciado,1500))e.push('sin enunciado');
  if(!txt(String(x.respuesta??''),300))e.push('sin respuesta');
  if(!pasos(x.pasos))e.push('pasos incompletos (≥ 2 con que, como y porque)');
  if(!txt(x.regla,500))e.push('sin regla');
  if(!txt(x.pista,400))e.push('sin pista');
  if(!Array.isArray(x.errores)||x.errores.some(r=>!r||typeof r.valor!=='string'||!txt(r.por,400)))e.push('errores típicos inválidos');
  if(x.tipo==='numero'&&!Number.isFinite(num(x.respuesta)))e.push(`respuesta numérica inválida: ${x.respuesta}`);
  if(x.tipo==='numero'&&x.tolerancia!==undefined&&!(typeof x.tolerancia==='number'&&x.tolerancia>=0&&x.tolerancia<1e6))e.push('tolerancia inválida');
  if(x.tipo==='expresion'){let ok=false;try{compilar(String(x.respuesta));ok=eqv(String(x.respuesta),String(x.respuesta))}catch(err){}if(!ok)e.push(`expresión que no se puede evaluar: ${x.respuesta}`)}
  if(x.tipo==='opcion'){
    if(!Array.isArray(x.opciones)||x.opciones.length<2||x.opciones.length>5||!x.opciones.every(o=>txt(o,300)))e.push('opciones inválidas (2 a 5)');
    else if(!Number.isInteger(x.correcta)||!x.opciones[x.correcta])e.push('índice de la opción correcta inválido');
    else if(x.opciones[x.correcta]!==x.respuesta)e.push('la respuesta no coincide con la opción correcta');
    if(Array.isArray(x.opciones)&&new Set(x.opciones).size!==x.opciones.length)e.push('opciones repetidas');
  }
  if(x.alternativas!==undefined&&(!Array.isArray(x.alternativas)||!x.alternativas.every(a=>typeof a==='string')))e.push('alternativas inválidas');
  // la propia respuesta tiene que pasar su verificación, y ningún error típico puede ser correcto
  if(!e.length){const p=aPregunta(x);
    if(x.tipo!=='opcion'&&!p.verificar(String(x.respuesta)))e.push('la respuesta no pasa su propia verificación');
    for(const r of x.errores)if(x.tipo!=='opcion'&&r.valor&&p.verificar(r.valor))e.push(`el error típico «${r.valor}» sería correcto`);}
  return e;
}
// Ejercicio generado → pregunta del motor de sesiones (sesion.js)
export function aPregunta(x,{ref,materia,habilidad}={}){
  const resp=String(x.respuesta),alt=[resp,...(x.alternativas||[]).map(String)];
  const base={enunciado:x.enunciado,respuesta:resp,pasos:x.pasos,regla:x.regla,pista:x.pista,ref,materia,habilidad,ia:true,generado:x.id,
    errores:(x.errores||[]).map(r=>({valor:r.valor,por:r.por,si:e=>r.valor&&(x.tipo==='numero'?igualNum(e,num(r.valor),1e-6):coincide(e,[r.valor]))}))};
  if(x.tipo==='opcion')return {...base,tipo:'opcion',opciones:x.opciones,correcta:x.correcta,porque:{}};
  const tol=x.tipo==='numero'?(x.tolerancia??0):0,v=num(resp);
  const verificar=x.tipo==='numero'?e=>{const n=num(e);return Number.isFinite(n)&&Math.abs(n-v)<=Math.max(tol,1e-9*Math.max(1,Math.abs(v)))}
    :x.tipo==='expresion'?e=>alt.some(a=>eqv(e,a))||coincide(e,alt)
    :e=>coincide(e,alt);
  return {...base,tipo:'escribir',verificar,teclado:x.tipo==='texto'?undefined:'mat'};
}
const MIN_EJERCICIOS=10;
// Banco: devuelve {banco (solo con los ejercicios válidos), errores}; ok si la lección es válida y quedan al menos 10 ejercicios en ≥ 2 niveles
export function validarBanco(b){
  const errores=[];
  if(!b||typeof b!=='object')return {ok:false,errores:['no es un objeto'],banco:null};
  const l=b.leccion;
  if(!l||!txt(l.idea,1500))errores.push('lección: falta la idea clave');
  if(!l?.ejemplo||!txt(l.ejemplo.enunciado,1500)||!pasos(l.ejemplo.pasos))errores.push('lección: ejemplo resuelto incompleto');
  if(!l?.hueco||!txt(l.hueco.enunciado,1500)||!pasos(l.hueco.pasos,1)||!txt(l.hueco.pregunta,400)||!txt(String(l.hueco.respuesta??''),300))errores.push('lección: ejemplo con hueco incompleto');
  const validos=[],ids=new Set();
  (Array.isArray(b.ejercicios)?b.ejercicios:[]).forEach((x,i)=>{const e=validarEjercicio(x);
    if(e.length)errores.push(`ejercicio ${i+1}: ${e[0]}`);else{const id=typeof x.id==='string'&&/^[\w-]{1,20}$/.test(x.id)&&!ids.has(x.id)?x.id:`e${i+1}`;ids.add(id);validos.push({...x,id})}});
  const niveles=new Set(validos.map(x=>x.nivel));
  const leccionOk=!errores.some(x=>x.startsWith('lección'));
  const ok=leccionOk&&validos.length>=MIN_EJERCICIOS&&niveles.size>=2;
  if(validos.length<MIN_EJERCICIOS)errores.push(`solo ${validos.length} ejercicios válidos (mínimo ${MIN_EJERCICIOS})`);
  return {ok,errores,banco:{...b,formato:FORMATO,ejercicios:validos}};
}
