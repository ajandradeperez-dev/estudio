/* 🗳️ Propuestas: reglas sin DOM (las usan la app y npm run revisar). Los límites de verdad los valida la base de datos
   (supabase/propuestas.sql); aquí se repiten para avisar antes de enviar y para funcionar sin conexión. */
export const TIPOS={curso:{icono:'💼',nombre:'Curso',filtro:'Cursos'},tema:{icono:'📘',nombre:'Tema',filtro:'Temas'},libro:{icono:'📚',nombre:'Libro',filtro:'Libros'}};
export const ESTADOS={
  pendiente:{icono:'⏳',texto:'Pendiente de revisión'},votacion:{icono:'🗳️',texto:'En votación'},aprobada:{icono:'✅',texto:'Aprobada'},
  preparacion:{icono:'🛠️',texto:'En preparación'},disponible:{icono:'🎉',texto:'Disponible'},descartada:{icono:'🚫',texto:'Descartada'},rechazada:{icono:'⛔',texto:'Rechazada'}
};
export const VOTOS_PARA_APROBAR=5,MAX_VOTOS=3,MAX_PROPUESTAS_SEMANA=2,MAX_TITULO=60,MAX_DESCRIPCION=280;
// Mensajes amables para los errores que devuelve la base (raise exception '…')
export const MENSAJES={
  limite_votos:`Ya usaste tus ${MAX_VOTOS} votos. Quita uno para votar aquí: así cada voto cuenta para lo que de verdad quieres.`,
  cerrada:'Esta propuesta ya no está en votación.',no_existe:'Esa propuesta ya no existe.',
  limite_propuestas:`Puedes enviar ${MAX_PROPUESTAS_SEMANA} propuestas por semana. Inténtalo en unos días.`,
  ofensivo:'Tu propuesta tiene palabras que no se permiten. Escríbela de otra forma.',
  titulo:`El título debe tener entre 3 y ${MAX_TITULO} caracteres.`,descripcion:`La descripción puede tener hasta ${MAX_DESCRIPCION} caracteres.`,tipo:'Elige si es un curso, un tema o un libro.',
  sin_dispositivo:'No se pudo identificar este dispositivo. Recarga la app.',
  red:'Sin conexión: se enviará cuando vuelva el internet.',limite_uso:'Hay muchas solicitudes en este momento. Espera un minuto y vuelve a intentarlo.',
  sin_servidor:'La votación todavía no está activa.'
};
const sinAcentos=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4|@/g,'a').replace(/\$/g,'s');
// Filtro básico (el mismo de la base): el administrador revisa todo antes de publicarlo
const OFENSIVAS=/(^|[^a-zñ])(puta|puto|pendej|chinga|verga|mierda|cabron|culero|marica|maricon|idiota|imbecil|estupid|zorra|joto|naco|perra|gilipoll|malparid|hijueputa|huevon|weon|culiao)/;
export const ofensivo=t=>OFENSIVAS.test(sinAcentos(t));
export function validarPropuesta({tipo,titulo,descripcion}){
  const t=String(titulo||'').trim(),d=String(descripcion||'').trim();
  if(!TIPOS[tipo])return 'tipo';
  if(t.length<3||t.length>MAX_TITULO)return 'titulo';
  if(d.length>MAX_DESCRIPCION)return 'descripcion';
  if(ofensivo(t)||ofensivo(d))return 'ofensivo';
  return null;
}
// Votos activos = votos en propuestas que siguen en votación
export const votosActivos=(lista,mios)=>mios.filter(id=>lista.find(p=>p.id===id)?.estado==='votacion').length;
export function puedeVotar(lista,mios,id){
  const p=lista.find(x=>x.id===id);if(!p)return 'no_existe';
  if(p.estado!=='votacion')return 'cerrada';
  if(mios.includes(id))return null;
  return votosActivos(lista,mios)>=MAX_VOTOS?'limite_votos':null;
}
// Semana deslizante de 7 días: fechas (ms) de las propuestas que envió este dispositivo
export const puedeProponer=(enviadas,ahora=Date.now())=>enviadas.filter(t=>ahora-t<7*864e5).length<MAX_PROPUESTAS_SEMANA;
// Lo que se ve sin servidor configurado o antes de la primera carga (el mismo contenido inicial del .sql)
export const SEMILLA=[
  ['curso','Excel','Fórmulas, funciones, búsqueda, tablas dinámicas y gráficos, con una mini hoja de cálculo.','disponible','cursos/excel','¡Ya está disponible!'],
  ['curso','Python desde cero','Variables, condiciones, ciclos, funciones y pequeños proyectos.'],
  ['curso','Redes Cisco CCNA','Conmutación, enrutamiento, VLAN, OSPF y seguridad, con práctica tipo examen.'],
  ['curso','Linux básico','Terminal, archivos, permisos, procesos y scripts sencillos.'],
  ['curso','Finanzas personales','Presupuesto, ahorro, deudas, interés compuesto e inversión básica.'],
  ['curso','Power BI','Importar datos, modelos, medidas DAX básicas y tableros.'],
  ['tema','Probabilidad avanzada','Variables aleatorias, distribuciones continuas y teorema central del límite.'],
  ['tema','Física I','Cinemática, leyes de Newton, trabajo y energía.'],
  ['tema','Química básica','Materia, átomos, tabla periódica, enlaces y estequiometría.'],
  ['tema','Inglés para entrevistas','Presentarte, hablar de tu experiencia y responder preguntas típicas.']
].map(([tipo,titulo,descripcion,estado='votacion',enlace=null,respuesta=null],i)=>({id:i+1,tipo,titulo,descripcion,estado,enlace,respuesta,motivo:null,votos:0}));
