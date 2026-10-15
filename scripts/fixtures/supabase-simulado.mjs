/* Supabase simulado para las pruebas de 🗳️ Propuestas: responde como PostgREST a /rest/v1/rpc/<función> con las MISMAS
   reglas de supabase/propuestas.sql (1 voto por propuesta, 3 votos activos, 5 votos = aprobada, 2 propuestas por semana,
   filtro de palabras) y puede «perder la red» o devolver 429. Lo usan npm run revisar y las pruebas de navegador. */
import {ofensivo} from '../../src/nucleo/propuestas/logica.js';

export function crearSimulado({ahora=()=>Date.now()}={}){
  const db={propuestas:[],votos:[],llamadas:0};
  let id=0,sinRed=false,limite=false;
  const agregar=(tipo,titulo,estado='votacion',extra={})=>{const p={id:++id,tipo,titulo,descripcion:'',estado,motivo:null,respuesta:null,enlace:null,autor:null,creada:ahora(),...extra};db.propuestas.push(p);return p};
  const votosDe=pid=>db.votos.filter(v=>v.propuesta===pid).length;
  const error=(m,status=400)=>({status,cuerpo:{code:'P0001',message:m}});
  const RPC={
    listar_propuestas:()=>db.propuestas.filter(p=>!['pendiente','rechazada'].includes(p.estado)).map(({autor,creada,...p})=>({...p,votos:votosDe(p.id)})),
    mis_votos:({p_dispositivo})=>db.votos.filter(v=>v.dispositivo===p_dispositivo).map(v=>v.propuesta),
    votar:({p_dispositivo:d,p_propuesta:pid})=>{
      const p=db.propuestas.find(x=>x.id===pid);if(!p)return error('no_existe');if(p.estado!=='votacion')return error('cerrada');
      if(db.votos.some(v=>v.dispositivo===d&&v.propuesta===pid))return {votos:votosDe(pid),estado:p.estado,repetido:true};
      const activos=db.votos.filter(v=>v.dispositivo===d&&db.propuestas.find(x=>x.id===v.propuesta)?.estado==='votacion').length;
      if(activos>=3)return error('limite_votos');
      db.votos.push({dispositivo:d,propuesta:pid});
      if(votosDe(pid)>=5)p.estado='aprobada';
      return {votos:votosDe(pid),estado:p.estado,repetido:false};
    },
    quitar_voto:({p_dispositivo:d,p_propuesta:pid})=>{const p=db.propuestas.find(x=>x.id===pid);if(p&&p.estado!=='votacion')return error('cerrada');
      db.votos=db.votos.filter(v=>!(v.dispositivo===d&&v.propuesta===pid));return {votos:votosDe(pid)}},
    proponer:({p_dispositivo:d,p_tipo,p_titulo,p_descripcion})=>{
      const t=String(p_titulo||'').trim(),de=String(p_descripcion||'').trim();
      if(!['curso','tema','libro'].includes(p_tipo))return error('tipo');if(t.length<3||t.length>60)return error('titulo');if(de.length>280)return error('descripcion');
      if(ofensivo(t)||ofensivo(de))return error('ofensivo');
      if(db.propuestas.filter(p=>p.autor===d&&ahora()-p.creada<7*864e5).length>=2)return error('limite_propuestas');
      const p=agregar(p_tipo,t,'pendiente',{descripcion:de,autor:d});return {id:p.id,estado:'pendiente'}}
  };
  async function fetch(url,op={}){
    db.llamadas++;
    if(sinRed)throw new TypeError('Failed to fetch');
    if(limite)return respuesta(429,{message:'Too Many Requests'});
    const m=/\/rest\/v1\/rpc\/(\w+)/.exec(url);if(!m||!RPC[m[1]])return respuesta(404,{message:'no existe'});
    const r=RPC[m[1]](op.body?JSON.parse(op.body):{});
    return r&&r.status?respuesta(r.status,r.cuerpo):respuesta(200,r);
  }
  const respuesta=(status,cuerpo)=>({status,ok:status>=200&&status<300,text:async()=>JSON.stringify(cuerpo)});
  return {fetch,db,agregar,red:v=>{sinRed=!v},limite:v=>{limite=v}};
}
