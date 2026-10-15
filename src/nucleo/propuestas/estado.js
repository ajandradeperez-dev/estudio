/* Estado local de 🗳️ Propuestas: identificador anónimo del dispositivo, último estado guardado (para verlo sin conexión),
   votos y propuestas en cola mientras no hay red, y avisos «¡Ya está lo que pediste!» ya vistos. Sin DOM: se prueba en
   npm run revisar con un Supabase simulado. Nada de esto entra al respaldo (cada teléfono vota por su cuenta). */
import {puedeVotar,puedeProponer,validarPropuesta,SEMILLA} from './logica.js';

const CLAVE='ciberlab-propuestas',DISP='ciberlab-dispositivo';
const uuid=()=>globalThis.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g,()=>(Math.random()*16|0).toString(16));
const memoria=()=>{const m={};return {getItem:k=>m[k]??null,setItem:(k,v)=>{m[k]=String(v)}}};

export function crearPropuestas({api,almacen=globalThis.localStorage||memoria(),ahora=()=>Date.now()}){
  const leerJ=(k,d)=>{try{const x=JSON.parse(almacen.getItem(k));return x??d}catch(e){return d}};
  const escribir=(k,v)=>{try{almacen.setItem(k,typeof v==='string'?v:JSON.stringify(v))}catch(e){}};
  let disp=null;try{disp=almacen.getItem(DISP)}catch(e){}
  if(!disp){disp=uuid();escribir(DISP,disp)}
  const st={lista:null,mios:[],cola:[],enviadas:[],vistos:[],fecha:null,...leerJ(CLAVE,{})};
  const guardar=()=>escribir(CLAVE,{lista:st.lista,mios:st.mios,cola:st.cola,enviadas:st.enviadas,vistos:st.vistos,fecha:st.fecha});
  const lista=()=>st.lista||SEMILLA;
  const ajustar=(id,d)=>{const p=st.lista?.find(x=>x.id===id);if(p)p.votos=Math.max(0,(p.votos||0)+d)};

  async function enviarCola(){
    while(st.cola.length){
      const x=st.cola[0];
      const r=x.accion==='votar'?await api.votar(disp,x.id):x.accion==='quitar'?await api.quitar(disp,x.id):await api.proponer(disp,x.datos);
      if(!r.ok&&(r.error==='red'||r.error==='limite_uso'||r.error==='sin_servidor'))return false;   // se intenta otra vez después
      st.cola.shift();guardar();                                                                   // enviado (o rechazado: se descarta)
    }
    return true;
  }
  return {
    dispositivo:disp,
    get datos(){return {lista:lista(),mios:st.mios,cola:st.cola,fecha:st.fecha,enviadas:st.enviadas}},
    // Envía lo pendiente y trae el estado del servidor. {ok, sinConexion?, error?}
    async cargar(){
      if(!api.listo)return {ok:false,error:'sin_servidor'};
      const enviado=await enviarCola();
      const [a,b]=await Promise.all([api.listar(),api.misVotos(disp)]);
      if(!a.ok)return {ok:false,error:a.error,sinConexion:a.error==='red'};
      st.lista=a.datos.map(p=>({...p,votos:p.votos|0}));
      if(b.ok)st.mios=(b.datos||[]).map(Number);
      // lo que sigue en cola ya se refleja en la vista (votos optimistas)
      for(const x of st.cola){if(x.accion==='votar'&&!st.mios.includes(x.id)){st.mios.push(x.id);ajustar(x.id,1)}if(x.accion==='quitar'&&st.mios.includes(x.id)){st.mios=st.mios.filter(i=>i!==x.id);ajustar(x.id,-1)}}
      st.fecha=ahora();guardar();
      return {ok:true,pendientes:!enviado};
    },
    async votar(id){
      const e=puedeVotar(lista(),st.mios,id);if(e)return {ok:false,error:e};
      if(st.mios.includes(id))return {ok:true,repetido:true};
      st.mios.push(id);ajustar(id,1);guardar();
      const r=await api.votar(disp,id);
      if(r.ok){const p=st.lista?.find(x=>x.id===id);if(p){p.votos=r.datos.votos;p.estado=r.datos.estado}guardar();return {ok:true,aprobada:r.datos.estado==='aprobada'}}
      if(r.error==='red'||r.error==='limite_uso'||r.error==='sin_servidor'){st.cola.push({accion:'votar',id});guardar();return {ok:true,enCola:true}}
      st.mios=st.mios.filter(i=>i!==id);ajustar(id,-1);guardar();return r;
    },
    async quitar(id){
      if(!st.mios.includes(id))return {ok:true};
      const p=lista().find(x=>x.id===id);if(p&&p.estado!=='votacion')return {ok:false,error:'cerrada'};
      // si el voto aún no se enviaba, basta con sacarlo de la cola
      const i=st.cola.findIndex(x=>x.accion==='votar'&&x.id===id);
      st.mios=st.mios.filter(x=>x!==id);ajustar(id,-1);
      if(i>=0){st.cola.splice(i,1);guardar();return {ok:true}}
      guardar();
      const r=await api.quitar(disp,id);
      if(r.ok||r.error==='red'||r.error==='limite_uso'||r.error==='sin_servidor'){if(!r.ok){st.cola.push({accion:'quitar',id});guardar();return {ok:true,enCola:true}}return {ok:true}}
      st.mios.push(id);ajustar(id,1);guardar();return r;
    },
    async proponer(datos){
      const e=validarPropuesta(datos);if(e)return {ok:false,error:e};
      if(!puedeProponer(st.enviadas,ahora()))return {ok:false,error:'limite_propuestas'};
      const limpio={tipo:datos.tipo,titulo:String(datos.titulo).trim(),descripcion:String(datos.descripcion||'').trim()};
      const r=await api.proponer(disp,limpio);
      if(r.ok||r.error==='red'||r.error==='limite_uso'){st.enviadas.push(ahora());if(!r.ok)st.cola.push({accion:'proponer',datos:limpio});guardar();return {ok:true,enCola:!r.ok}}
      return r;
    },
    // «¡Ya está lo que pediste!»: propuestas disponibles que este dispositivo votó y todavía no se avisaron
    nuevasDisponibles:()=>lista().filter(p=>p.estado==='disponible'&&st.mios.includes(p.id)&&!st.vistos.includes(p.id)),
    marcarVisto(id){if(!st.vistos.includes(id)){st.vistos.push(id);guardar()}}
  };
}
